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

    // Step 1: Get retailer-specific products ONLY
    const retailerProducts = await getRetailerProducts(supabase, retailer_id);
    console.log('📦 [retailer-chat] Produits retailer trouvés:', retailerProducts.length);

    // Step 2: Filter relevant products based on query
    const relevantProducts = filterProductsByQuery(retailerProducts, message);
    console.log('🎯 [retailer-chat] Produits pertinents:', relevantProducts.length);

    // Step 3: Generate AI response with retailer context
    const aiResponse = await generateRetailerResponse(
      message, 
      relevantProducts, 
      conversation_context, 
      retailer
    );

    // Step 4: Save conversation with retailer isolation
    await saveRetailerConversation(supabase, {
      retailer_id,
      session_id: session_id || crypto.randomUUID(),
      user_message: message,
      ai_response: aiResponse.message,
      products_shown: aiResponse.selectedProducts.map(p => p.title),
      conversation_type: 'product_search'
    });

    return new Response(JSON.stringify({
      message: aiResponse.message,
      products: aiResponse.selectedProducts,
      should_show_products: aiResponse.should_show_products,
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

async function getRetailerProducts(supabase: any, retailerId: string) {
  try {
    // Get products from products_enriched table filtered by retailer
    const { data: enrichedProducts, error } = await supabase
      .from('products_enriched')
      .select('*')
      .eq('retailer_id', retailerId)
      .gt('stock_qty', 0)
      .limit(50);

    if (error) {
      console.error('❌ [retailer-chat] Erreur DB enriched:', error);
    }

    if (enrichedProducts && enrichedProducts.length > 0) {
      console.log('✅ [retailer-chat] Produits enrichis trouvés:', enrichedProducts.length);
      return enrichedProducts.map(p => ({
        id: p.id,
        title: p.title,
        description: p.description,
        price: p.price,
        category: p.category,
        subcategory: p.subcategory,
        color: p.color,
        material: p.material,
        style: p.style,
        image_url: p.image_url,
        product_url: p.product_url,
        stock: p.stock_qty,
        availableForSale: p.stock_qty > 0,
        quantityAvailable: p.stock_qty,
        productType: p.category,
        vendor: p.brand,
        variants: [{
          id: `${p.id}-default`,
          title: 'Default',
          price: p.price,
          availableForSale: p.stock_qty > 0,
          quantityAvailable: p.stock_qty,
          selectedOptions: []
        }]
      }));
    }

    // Fallback: Get from retailer_products table
    const { data: retailerProducts } = await supabase
      .from('retailer_products')
      .select('*')
      .eq('retailer_id', retailerId)
      .eq('status', 'active')
      .gt('stock', 0)
      .limit(50);

    if (retailerProducts && retailerProducts.length > 0) {
      console.log('✅ [retailer-chat] Produits retailer trouvés:', retailerProducts.length);
      return retailerProducts.map(p => ({
        id: p.id,
        title: p.name,
        description: p.description,
        price: p.price,
        category: p.category,
        image_url: p.image_url,
        product_url: p.product_url,
        stock: p.stock,
        availableForSale: p.stock > 0,
        quantityAvailable: p.stock,
        productType: p.category,
        vendor: p.vendor,
        variants: [{
          id: `${p.id}-default`,
          title: 'Default',
          price: p.price,
          availableForSale: p.stock > 0,
          quantityAvailable: p.stock,
          selectedOptions: []
        }]
      }));
    }

    console.log('⚠️ [retailer-chat] Aucun produit trouvé pour retailer:', retailerId);
    return [];

  } catch (error) {
    console.error('❌ [retailer-chat] Erreur récupération produits:', error);
    return [];
  }
}

function filterProductsByQuery(products: any[], query: string) {
  const lowerQuery = query.toLowerCase();
  
  return products.filter(product => {
    const productText = `${product.title} ${product.description} ${product.category} ${product.subcategory} ${product.color} ${product.material} ${product.style}`.toLowerCase();
    
    // Category matches
    if (lowerQuery.includes('canapé') && productText.includes('canapé')) return true;
    if (lowerQuery.includes('table') && productText.includes('table')) return true;
    if (lowerQuery.includes('chaise') && productText.includes('chaise')) return true;
    if (lowerQuery.includes('lit') && productText.includes('lit')) return true;
    
    // Attribute matches
    const queryWords = lowerQuery.split(' ').filter(word => word.length > 2);
    return queryWords.some(word => productText.includes(word));
  }).slice(0, 5); // Limit to 5 most relevant
}

async function generateRetailerResponse(
  message: string, 
  relevantProducts: any[], 
  conversationHistory: any[], 
  retailer: any
) {
  const openaiApiKey = Deno.env.get('OPENAI_API_KEY');
  
  if (!openaiApiKey) {
    return generateFallbackResponse(message, relevantProducts, retailer);
  }

  const productsContext = relevantProducts.length > 0 ? 
    relevantProducts.map(p => `• ${p.title} - ${p.price}€ - ${p.category} ${p.color ? p.color : ''} ${p.material ? p.material : ''}`).join('\n') : 
    'Aucun produit correspondant dans votre catalogue.';

  const systemPrompt = `Tu es l'assistant IA personnalisé de ${retailer.company_name}.
Tu es un vendeur expert et conseiller déco qui aide les clients à trouver les produits parfaits.

CATALOGUE ${retailer.company_name.toUpperCase()} DISPONIBLE:
${productsContext}

PERSONNALITÉ:
- Chaleureux et professionnel
- Expert en mobilier et décoration  
- Orienté solution et vente
- Réponses courtes et engageantes (2-3 phrases max)
- Utilise le nom de l'entreprise dans les recommandations

RÈGLES:
- Si produits disponibles → Recommander le plus pertinent avec prix et argument
- Si aucun produit → Proposer de préciser la recherche ou conseil général
- Toujours finir par une question engageante
- Mentionner "${retailer.company_name}" dans les recommandations

EXEMPLES:
- "Notre [produit] ${retailer.company_name} à [prix]€ serait parfait ! [argument]. Quelle couleur préférez-vous ?"
- "Chez ${retailer.company_name}, notre [alternative] pourrait vous intéresser. Voulez-vous que je vous le montre ?"`;

  try {
    const messages = [
      { role: 'system', content: systemPrompt },
      ...conversationHistory.slice(-2),
      { role: 'user', content: message }
    ];

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openaiApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: messages,
        max_tokens: 150,
        temperature: 0.8,
      }),
    });

    if (!response.ok) {
      throw new Error(`OpenAI error: ${response.status}`);
    }

    const data = await response.json();
    const aiMessage = data.choices[0]?.message?.content || 'Comment puis-je vous aider ?';

    return {
      message: aiMessage,
      selectedProducts: relevantProducts.slice(0, 2),
      should_show_products: relevantProducts.length > 0
    };

  } catch (error) {
    console.error('❌ [retailer-chat] Erreur OpenAI:', error);
    return generateFallbackResponse(message, relevantProducts, retailer);
  }
}

function generateFallbackResponse(message: string, products: any[], retailer: any) {
  const lowerMessage = message.toLowerCase();
  
  if (lowerMessage.includes('bonjour') || lowerMessage.includes('salut')) {
    return {
      message: `Bonjour ! Bienvenue chez ${retailer.company_name}. Je suis votre assistant IA personnalisé. Que cherchez-vous pour votre intérieur ?`,
      selectedProducts: [],
      should_show_products: false
    };
  }
  
  if (products.length > 0) {
    const product = products[0];
    return {
      message: `Chez ${retailer.company_name}, notre ${product.title} à ${product.price}€ pourrait vous plaire ! Voulez-vous en savoir plus ?`,
      selectedProducts: [product],
      should_show_products: true
    };
  } else {
    return {
      message: `Je n'ai pas ce modèle exact chez ${retailer.company_name}. Pouvez-vous me préciser ce que vous cherchez ? Je suis là pour vous conseiller !`,
      selectedProducts: [],
      should_show_products: false
    };
  }
}

async function saveRetailerConversation(supabase: any, conversationData: any) {
  try {
    const { error } = await supabase
      .from('retailer_conversations')
      .insert({
        retailer_id: conversationData.retailer_id,
        session_id: conversationData.session_id,
        user_message: conversationData.user_message,
        ai_response: conversationData.ai_response,
        products_shown: conversationData.products_shown,
        conversation_type: conversationData.conversation_type,
        created_at: new Date().toISOString()
      });

    if (error) {
      console.error('❌ [retailer-chat] Erreur sauvegarde conversation:', error);
    } else {
      console.log('💾 [retailer-chat] Conversation sauvegardée pour retailer:', conversationData.retailer_id);
    }

  } catch (error) {
    console.error('❌ [retailer-chat] Erreur sauvegarde:', error);
  }
}