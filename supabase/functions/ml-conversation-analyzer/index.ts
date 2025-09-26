const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
};

import { createClient } from 'npm:@supabase/supabase-js@2';

interface ConversationAnalysisRequest {
  days_back?: number;
  retailer_id?: string;
}

interface ConversationInsight {
  popular_keywords: Array<{ keyword: string; count: number }>;
  common_intents: Array<{ intent: string; count: number }>;
  product_mentions: Array<{ product: string; count: number }>;
  conversion_patterns: {
    successful_conversations: number;
    total_conversations: number;
    conversion_rate: number;
  };
  user_behavior: {
    avg_session_duration: string;
    avg_messages_per_session: number;
    peak_hours: Array<{ hour: number; count: number }>;
  };
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, {
      status: 200,
      headers: corsHeaders,
    });
  }

  try {
    const { days_back = 7, retailer_id = 'demo-retailer-id' }: ConversationAnalysisRequest = await req.json();
    
    console.log('📊 Analyse conversations ML:', { days_back, retailer_id });
    
    // Validate retailer_id as UUID
    const isRetailerIdUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(retailer_id);
    if (retailer_id && !isRetailerIdUuid) {
      return new Response(
        JSON.stringify({
          success: false,
          error: 'Invalid retailer_id format. Must be a valid UUID.',
          details: `Received retailer_id: ${retailer_id}`
        }),
        {
          status: 400,
          headers: { 'Content-Type': 'application/json', ...corsHeaders }
        }
      );
    }

    // Initialize Supabase
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Date de début d'analyse
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days_back);

    // Récupérer les conversations récentes
    const { data: conversations, error } = await supabase
      .from('retailer_conversations')
      .select('*')
      .gte('created_at', startDate.toISOString())
      .order('created_at', { ascending: false });

    if (error) {
      throw error;
    }

    console.log('📝 Conversations analysées:', conversations?.length || 0);

    // Analyser les données
    const insights = await analyzeConversations(conversations || []);
    
    // Sauvegarder les insights pour l'entraînement ML
    await saveAnalysisResults(supabase, insights, retailer_id);

    return new Response(
      JSON.stringify({
        success: true,
        insights,
        analysis_period: `${days_back} jours`,
        conversations_analyzed: conversations?.length || 0,
        analyzed_at: new Date().toISOString()
      }),
      {
        headers: {
          'Content-Type': 'application/json',
          ...corsHeaders,
        },
      }
    );

  } catch (error) {
    console.error('❌ Erreur analyse conversations:', error);
    
    return new Response(
      JSON.stringify({
        success: false,
        error: 'Erreur lors de l\'analyse des conversations',
        details: error.message
      }),
      {
        status: 500,
        headers: {
          'Content-Type': 'application/json',
          ...corsHeaders,
        },
      }
    );
  }
});

async function analyzeConversations(conversations: any[]): Promise<ConversationInsight> {
  // 1. Analyser les mots-clés populaires
  const keywordCount = new Map<string, number>();
  const intentCount = new Map<string, number>();
  const productMentions = new Map<string, number>();
  
  conversations.forEach(conv => {
    // Extraire mots-clés du message
    const text = (conv.message || conv.response || '').toLowerCase();
    const words = text.split(/\s+/).filter(word => word.length > 3);
    
    words.forEach(word => {
      keywordCount.set(word, (keywordCount.get(word) || 0) + 1);
    });
    
    // Compter les intentions
    if (conv.intent) {
      intentCount.set(conv.intent, (intentCount.get(conv.intent) || 0) + 1);
    }
    
    // Compter les mentions de produits
    if (conv.products && Array.isArray(conv.products)) {
      conv.products.forEach((product: string) => {
        productMentions.set(product, (productMentions.get(product) || 0) + 1);
      });
    }
  });

  // 2. Analyser les patterns de conversion
  const sessionsMap = new Map<string, any[]>();
  conversations.forEach(conv => {
    const sessionId = conv.session_id || 'no-session';
    if (!sessionsMap.has(sessionId)) {
      sessionsMap.set(sessionId, []);
    }
    sessionsMap.get(sessionId)!.push(conv);
  });

  const sessions = Array.from(sessionsMap.values());
  const successfulSessions = sessions.filter(session => 
    session.some(conv => 
      conv.final_action === 'cart_add' || 
      conv.final_action === 'purchase' || 
      conv.final_action === 'quote_request'
    )
  );

  // 3. Analyser le comportement utilisateur
  const sessionDurations = sessions.map(session => {
    const start = new Date(session[0].created_at);
    const end = new Date(session[session.length - 1].created_at);
    return (end.getTime() - start.getTime()) / 1000; // en secondes
  });

  const avgDuration = sessionDurations.reduce((sum, dur) => sum + dur, 0) / sessionDurations.length;
  const avgMessagesPerSession = sessions.reduce((sum, session) => sum + session.length, 0) / sessions.length;

  // 4. Analyser les heures de pic
  const hourCounts = new Map<number, number>();
  conversations.forEach(conv => {
    const hour = new Date(conv.created_at).getHours();
    hourCounts.set(hour, (hourCounts.get(hour) || 0) + 1);
  });

  return {
    popular_keywords: Array.from(keywordCount.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 20)
      .map(([keyword, count]) => ({ keyword, count })),
    
    common_intents: Array.from(intentCount.entries())
      .sort((a, b) => b[1] - a[1])
      .map(([intent, count]) => ({ intent, count })),
    
    product_mentions: Array.from(productMentions.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10)
      .map(([product, count]) => ({ product, count })),
    
    conversion_patterns: {
      successful_conversations: successfulSessions.length,
      total_conversations: sessions.length,
      conversion_rate: sessions.length > 0 ? (successfulSessions.length / sessions.length) * 100 : 0
    },
    
    user_behavior: {
      avg_session_duration: formatDuration(avgDuration),
      avg_messages_per_session: Math.round(avgMessagesPerSession),
      peak_hours: Array.from(hourCounts.entries())
        .sort((a, b) => b[1] - a[1])
        .slice(0, 5)
        .map(([hour, count]) => ({ hour, count }))
    }
  };
}

async function saveAnalysisResults(supabase: any, insights: ConversationInsight, retailerId: string) {
  try {
    // Sauvegarder dans training_logs pour le ML
    await supabase.from('training_logs').insert({
      status: 'success',
      log: JSON.stringify({
        type: 'conversation_analysis',
        retailer_id: retailerId,
        insights: insights,
        analyzed_at: new Date().toISOString()
      }),
      created_at: new Date().toISOString()
    });

    console.log('💾 Insights sauvegardés pour ML');

  } catch (error) {
    console.error('❌ Erreur sauvegarde insights:', error);
  }
}

function formatDuration(seconds: number): string {
  if (seconds < 60) return `${Math.round(seconds)}s`;
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = Math.round(seconds % 60);
  return `${minutes}m ${remainingSeconds}s`;
}