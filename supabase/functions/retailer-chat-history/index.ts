const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
};

import { createClient } from 'npm:@supabase/supabase-js@2';

interface ChatHistoryRequest {
  retailer_id: string;
  limit?: number;
  include_demo_sessions?: boolean;
}

interface ConversationSession {
  session_id: string;
  messages: any[];
  start_time: string;
  end_time: string;
  total_duration: string;
  products_shown: string[];
  final_action?: string;
  client_info: {
    location?: string;
    device?: string;
    ip?: string;
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
    const { retailer_id, limit = 100, include_demo_sessions = true }: ChatHistoryRequest = await req.json();
    
    console.log('💬 [chat-history] Récupération historique pour retailer:', retailer_id);
    
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
    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
    
    if (!supabaseUrl || !supabaseKey) {
      throw new Error('Configuration Supabase manquante');
    }
    
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Get retailer-specific conversations
    const { data: retailerConversations, error } = await supabase
      .from('retailer_conversations')
      .select('*')
      .eq('retailer_id', retailer_id)
      .order('created_at', { ascending: false })
      .limit(limit);

    if (error) {
      console.error('❌ [chat-history] Erreur DB:', error);
    }

    let allConversations = retailerConversations || [];

    // Add demo sessions if requested
    if (include_demo_sessions) {
      const demoSessions = generateDemoSessions(retailer_id);
      allConversations = [...allConversations, ...demoSessions];
    }

    // Group conversations by session
    const sessions = groupConversationsBySession(allConversations);

    console.log('✅ [chat-history] Sessions trouvées:', sessions.length);

    return new Response(
      JSON.stringify({
        success: true,
        sessions,
        total_conversations: allConversations.length,
        retailer_id,
        retrieved_at: new Date().toISOString()
      }),
      {
        headers: {
          'Content-Type': 'application/json',
          ...corsHeaders,
        },
      }
    );

  } catch (error) {
    console.error('❌ [chat-history] Erreur:', error);
    
    return new Response(
      JSON.stringify({
        success: false,
        error: 'Erreur lors de la récupération de l\'historique',
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

function generateDemoSessions(retailerId: string) {
  const now = Date.now();
  
  return [
    // Session démo 1 - Recherche canapé
    {
      id: `demo-${retailerId}-1-1`,
      retailer_id: retailerId,
      session_id: `demo-session-${retailerId}-1`,
      user_message: 'Bonjour, je cherche un canapé pour mon salon',
      ai_response: 'Bonjour ! Parfait, quel style vous plaît ? Nos canapés convertibles sont très appréciés !',
      products_shown: ['Canapé convertible'],
      conversation_type: 'product_search',
      created_at: new Date(now - 2 * 60 * 60 * 1000).toISOString(),
      user_ip: '192.168.1.100',
      user_agent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
    },
    {
      id: `demo-${retailerId}-1-2`,
      retailer_id: retailerId,
      session_id: `demo-session-${retailerId}-1`,
      user_message: 'Il fait quelle taille ?',
      ai_response: 'Notre canapé fait 280x180cm une fois déplié en lit. Parfait pour un salon moderne !',
      products_shown: [],
      conversation_type: 'product_search',
      created_at: new Date(now - 2 * 60 * 60 * 1000 + 60000).toISOString(),
      user_ip: '192.168.1.100',
      user_agent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
    },
    
    // Session démo 2 - Achat table
    {
      id: `demo-${retailerId}-2-1`,
      retailer_id: retailerId,
      session_id: `demo-session-${retailerId}-2`,
      user_message: 'Je veux une table ronde en travertin',
      ai_response: 'Excellente idée ! Notre table en travertin naturel est disponible en Ø100cm (499€) et Ø120cm (549€)',
      products_shown: ['Table travertin'],
      conversation_type: 'product_search',
      created_at: new Date(now - 4 * 60 * 60 * 1000).toISOString(),
      user_ip: '192.168.1.101',
      user_agent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 15_0 like Mac OS X)'
    },
    {
      id: `demo-${retailerId}-2-2`,
      retailer_id: retailerId,
      session_id: `demo-session-${retailerId}-2`,
      user_message: 'Je prends la 120cm',
      ai_response: 'Parfait ! Table Ø120cm ajoutée. Souhaitez-vous des chaises assorties ?',
      products_shown: [],
      conversation_type: 'purchase_intent',
      created_at: new Date(now - 4 * 60 * 60 * 1000 + 60000).toISOString(),
      user_ip: '192.168.1.101',
      user_agent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 15_0 like Mac OS X)'
    }
  ];
}

function groupConversationsBySession(conversations: any[]): ConversationSession[] {
  const sessionMap = new Map<string, any[]>();
  
  conversations.forEach(conv => {
    const sessionId = conv.session_id || 'no-session';
    if (!sessionMap.has(sessionId)) {
      sessionMap.set(sessionId, []);
    }
    sessionMap.get(sessionId)!.push(conv);
  });

  return Array.from(sessionMap.entries()).map(([sessionId, messages]) => {
    const sortedMessages = messages.sort((a, b) => 
      new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
    );
    
    const startTime = sortedMessages[0]?.created_at;
    const endTime = sortedMessages[sortedMessages.length - 1]?.created_at;
    
    // Calculate duration
    const duration = startTime && endTime ? 
      Math.round((new Date(endTime).getTime() - new Date(startTime).getTime()) / 1000) : 0;
    
    // Extract products shown
    const productsShown = new Set<string>();
    messages.forEach(msg => {
      if (msg.products_shown && Array.isArray(msg.products_shown)) {
        msg.products_shown.forEach(product => productsShown.add(product));
      }
    });

    // Detect final action
    const lastMessage = sortedMessages[sortedMessages.length - 1];
    const finalAction = lastMessage?.conversation_type || 'conversation_ended';

    // Client info
    const clientMessage = messages.find(m => m.user_ip);
    const clientInfo = {
      location: 'France',
      device: getDeviceType(clientMessage?.user_agent || ''),
      ip: clientMessage?.user_ip || 'Non renseignée'
    };

    return {
      session_id: sessionId,
      messages: sortedMessages,
      start_time: startTime,
      end_time: endTime,
      total_duration: formatDuration(duration),
      products_shown: Array.from(productsShown),
      final_action: finalAction,
      client_info: clientInfo
    };
  }).sort((a, b) => new Date(b.start_time).getTime() - new Date(a.start_time).getTime());
}

function getDeviceType(userAgent: string): string {
  if (userAgent.includes('Mobile') || userAgent.includes('iPhone')) return 'Mobile';
  if (userAgent.includes('Tablet') || userAgent.includes('iPad')) return 'Tablette';
  return 'Desktop';
}

function formatDuration(seconds: number): string {
  if (seconds < 60) return `${seconds}s`;
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;
  return `${minutes}m ${remainingSeconds}s`;
}