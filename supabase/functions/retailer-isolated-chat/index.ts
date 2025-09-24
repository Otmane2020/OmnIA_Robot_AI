const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
};

import { createClient } from 'npm:@supabase/supabase-js@2';

interface RetailerChatRequest {
  message: string;
  retailer_id: string;
  session_id?: string;
  conversation_context?: Array<{
    role: 'user' | 'assistant';
    content: string;
  }>;
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { status: 200, headers: corsHeaders });
  }

  try {
    const { message, retailer_id, session_id, conversation_context = [] }: RetailerChatRequest = await req.json();
    
    console.log('🤖 [retailer-chat] Chat isolé pour retailer:', retailer_id, '-', message.substring(0, 50) + '...');

    // Initialize Supabase
    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
    
    if (!supabaseUrl || !supabaseKey) {
      throw new Error('Configuration Supabase manquante');
    }
    
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Validate retailer exists
    const { data: retailer } = await supabase
      .from('retailers')
      .select('id, company_name, plan')
      .eq('id', retailer_id)
      .single();

    if (!retailer) {
      throw new Error(`Retailer ${retailer_id} non trouvé`);
    }

    console.log(`🏪 [retailer-chat] Chat pour: ${retailer.company_name} (${retailer.plan})`);

    // Use intelligent product search for better results
    const searchResponse = await fetch(`${supabaseUrl}/functions/v1/intelligent-product-search`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${supabaseKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        message,
        retailer_id,
        conversation_context
      }),
    });

    let aiResponse = {
      message: "Comment puis-je vous aider ?",
      products: []
    };

    if (searchResponse.ok) {
      const searchData = await searchResponse.json();
      aiResponse = {
        message: searchData.message,
        products: searchData.products || []
      };
    } else {
      // Fallback response
      aiResponse = generateSimpleFallback(message, retailer);
    }

    // Save conversation with retailer isolation
    await saveRetailerConversation(supabase, {
      retailer_id,
      session_id: session_id || crypto.randomUUID(),
      user_message: message,
      ai_response: aiResponse.message,
      products_shown: aiResponse.products.map(p => p.title),
      conversation_type: 'product_search'
    });

    return new Response(JSON.stringify({
      message: aiResponse.message,
      products: aiResponse.products,
      should_show_products: aiResponse.products.length > 0,
      retailer_info: {
        company_name: retailer.company_name,
        plan: retailer.plan
      }
    }), { headers: { 'Content-Type': 'application/json', ...corsHeaders } });

  } catch (error) {
    console.error('❌ [retailer-chat] Erreur:', error);
    return new Response(JSON.stringify({
      message: "Désolé, je rencontre des difficultés techniques. Pouvez-vous reformuler ?",
      products: [],
      fallback: true
    }), { headers: { 'Content-Type': 'application/json', ...corsHeaders } });
  }
});

function generateSimpleFallback(message: string, retailer: any) {
  const lowerMessage = message.toLowerCase();
  
  if (lowerMessage.includes('bonjour') || lowerMessage.includes('salut')) {
    return {
      message: `Bonjour ! Bienvenue chez ${retailer.company_name}. Je suis votre assistant IA personnalisé. Que cherchez-vous pour votre intérieur ?`,
      products: []
    };
  }
  
  if (lowerMessage.includes('canapé')) {
    return {
      message: `Chez ${retailer.company_name}, nous avons plusieurs canapés disponibles. Quelle couleur et quel style préférez-vous ?`,
      products: []
    };
  }
  
  if (lowerMessage.includes('table')) {
    return {
      message: `Nous proposons différents types de tables. Pour quelle pièce et combien de personnes ?`,
      products: []
    };
  }
  
  return {
    message: `Je suis là pour vous aider à trouver le mobilier parfait chez ${retailer.company_name}. Pouvez-vous me dire ce que vous recherchez ?`,
    products: []
  };
}

async function saveRetailerConversation(supabase: any, data: any) {
  try {
    await supabase
      .from('retailer_conversations')
      .insert({
        retailer_id: data.retailer_id,
        session_id: data.session_id,
        user_message: data.user_message,
        ai_response: data.ai_response,
        products_shown: data.products_shown,
        conversation_type: data.conversation_type,
        created_at: new Date().toISOString()
      });

    console.log('✅ [retailer-chat] Conversation sauvegardée');
  } catch (error) {
    console.error('❌ [retailer-chat] Erreur sauvegarde conversation:', error);
  }
}