const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
};

import { createClient } from 'npm:@supabase/supabase-js@2';

interface SellerChatRequest {
  message: string;
  seller_id: string;
  seller_subdomain: string;
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
    const { message, seller_id, seller_subdomain, conversation_context = [] }: SellerChatRequest = await req.json();
    console.log('🤖 Chat vendeur:', seller_subdomain, '-', message.substring(0, 50) + '...');

    const openaiApiKey = Deno.env.get('OPENAI_API_KEY');
    if (!openaiApiKey) {
      return new Response(JSON.stringify({
        message: "Bonjour ! Je suis votre assistant IA personnalisé. Que cherchez-vous pour votre intérieur ?",
        products: []
      }), { headers: { 'Content-Type': 'application/json', ...corsHeaders } });
    }

    // Initialize Supabase
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // 🔍 ÉTAPE 1: Récupérer les produits du vendeur
    const isSellerIdUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(seller_id);
    let sellerProducts = [];
    if (seller_id && isSellerIdUuid) {
      sellerProducts = await getSellerProducts(supabase, seller_id);
    } else {
      console.log('⚠️ Non-UUID seller_id, fallback vers localStorage ou produits par défaut:', seller_id);
      sellerProducts = getSellerProductsFromStorage(seller_id);
    }
    console.log('📦 Produits vendeur trouvés:', sellerProducts.length);

    // 🎯 ÉTAPE 2: Filtrer les produits pertinents selon le message
    const relevantProducts = filterRelevantProducts(sellerProducts, message);
    console.log('🎯 Produits pertinents:', relevantProducts.length);

    // 🧠 ÉTAPE 3: Générer réponse IA avec contexte vendeur
    const aiResponse = await generateSellerResponse(
      message, 
      relevantProducts, 
      conversation_context, 
      seller_subdomain,
      openaiApiKey
    );

    // 💾 ÉTAPE 4: Sauvegarder la conversation
    await saveSellerConversation(supabase, {
      seller_id,
      session_id: crypto.randomUUID(),
      user_message: message,
      ai_response: aiResponse.message,
      products_shown: aiResponse.selectedProducts.map(p => p.name),
      conversation_type: 'product_search'
    });

    return new Response(JSON.stringify({
      message: aiResponse.message,
      products: aiResponse.selectedProducts,
      should_show_products: aiResponse.should_show_products,
      seller_info: {
        company_name: seller_subdomain,
        robot_name: 'OmnIA'
      }
    }), { headers: { 'Content-Type': 'application/json', ...corsHeaders } });

  } catch (error) {
    console.error('❌ Erreur seller-chat:', error);
    return new Response(JSON.stringify({
      message: "Petit souci technique 😅 pouvez-vous reformuler ?",
      products: [],
      fallback: true
    }), { headers: { 'Content-Type': 'application/json', ...corsHeaders } });
  }
});

async function getSellerProducts(supabase: any, sellerId: string) {
  try {
    const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(sellerId);
    
    if (!isUuid) {
      // If sellerId is not a UUID, it's likely a demo ID or invalid.
      // Fallback to local storage or default products without DB query.
      console.log('⚠️ Non-UUID sellerId, skipping DB query for seller_products:', sellerId);
      return getSellerProductsFromStorage(sellerId);
    }


    // Try to get from seller_products table first
    const { data: sellerProducts, error } = await supabase
      .from('seller_products')
      .select('*')
      .eq('seller_id', sellerId)
      .eq('status', 'active')
      .gt('stock', 0)
      .limit(20);

    if (error) {
      console.error('❌ Erreur DB seller_products:', error);
      return [];
    }

    if (sellerProducts && sellerProducts.length > 0) {
      console.log('✅ Produits depuis seller_products:', sellerProducts.length);
      return sellerProducts.map(p => ({
        id: p.id,
        name: p.name,
        title: p.name,
        description: p.description,
        price: p.price,
        compareAtPrice: p.compare_at_price,
        category: p.category,
        vendor: p.vendor,
        image_url: p.image_url,
        product_url: p.product_url,
        stock: p.stock,
        availableForSale: p.stock > 0,
        quantityAvailable: p.stock,
        productType: p.category,
        tags: p.tags || [],
        variants: [{
          id: `${p.id}-default`,
          title: 'Default',
          price: p.price,
          compareAtPrice: p.compare_at_price,
          availableForSale: p.stock > 0,
          quantityAvailable: p.stock,
          selectedOptions: []
        }]
      }));
    }

    // Fallback: Load from localStorage
    console.log('🔄 Fallback vers localStorage pour vendeur:', sellerId);
    return getSellerProductsFromStorage(sellerId);

  } catch (error) {
    console.error('❌ Erreur récupération produits vendeur:', error);
    return getSellerProductsFromStorage(sellerId);
  }
}

function getSellerProductsFromStorage(sellerId: string) {
  try {
    // Try to load from seller-specific localStorage
    const savedProducts = localStorage?.getItem(`seller_${sellerId}_products`);
    if (savedProducts) {
      const products = JSON.parse(savedProducts);
      return products.filter((p: any) => p.status === 'active' && p.stock > 0);
    }
  } catch (error) {
    console.error('❌ Erreur localStorage vendeur:', error);
  }
  
  // Return default products if nothing found
  return getDefaultSellerProducts(sellerId);
}

function getDefaultSellerProducts(sellerId: string) {
  return [
    {
      id: `${sellerId}-default-1`,
      name: 'Produit Exemple 1',
      title: 'Produit Exemple 1',
      description: 'Description du produit exemple pour votre boutique',
      price: 299,
      compareAtPrice: 399,
      category: 'Mobilier',
      vendor: 'Votre Marque',
      image_url: 'https://images.pexels.com/photos/1350789/pexels-photo-1350789.jpeg',
      product_url: '#',
      stock: 10,
      availableForSale: true,
      quantityAvailable: 10,
      productType: 'Mobilier',
      tags: ['exemple'],
      variants: [{
        id: `${sellerId}-default-1-var`,
        title: 'Default',
        price: 299,
        compareAtPrice: 399,
        availableForSale: true,
        quantityAvailable: 10,
        selectedOptions: []
      }]
    }
  ];
}

function filterRelevantProducts(products: any[], message: string) {
  const lowerMessage = message.toLowerCase();
  
  // Simple keyword filtering
  return products.filter(product => {
    const productText = `${product.name} ${product.description} ${product.category}`.toLowerCase();
    
    // Check for category matches
    if (lowerMessage.includes('canapé') && productText.includes('canapé')) return true;
    if (lowerMessage.includes('table') && productText.includes('table')) return true;
    if (lowerMessage.includes('chaise') && productText.includes('chaise')) return true;
    if (lowerMessage.includes('lit') && productText.includes('lit')) return true;
    
    // Check for general matches
    const messageWords = lowerMessage.split(' ').filter(word => word.length > 2);
    return messageWords.some(word => productText.includes(word));
  }).slice(0, 3); // Limit to 3 products
}

async function generateSellerResponse(
  message: string, 
  relevantProducts: any[], 
  conversationHistory: any[], 
  sellerSubdomain: string,
  openaiApiKey: string
) {
  const productsContext = relevantProducts.length > 0 ? 
    relevantProducts.map(p => `• ${p.name} - ${p.price}€ - ${p.description?.substring(0, 100) || 'Pas de description'}`).join('\n') : 
    'Aucun produit correspondant trouvé dans le catalogue.';

  const systemPrompt = `Tu es l'assistant IA personnalisé de la boutique "${sellerSubdomain}".
Tu es un vendeur expert et conseiller déco qui aide les clients à trouver les produits parfaits.

CATALOGUE DISPONIBLE:
${productsContext}

PERSONNALITÉ:
- Chaleureux et professionnel
- Expert en mobilier et décoration
- Orienté solution et vente
- Réponses courtes et engageantes (2-3 phrases max)

RÈGLES:
- Si produits disponibles → Recommander le plus pertinent avec prix et argument
- Si aucun produit → Proposer de préciser la recherche ou donner conseil général
- Toujours finir par une question engageante
- Utiliser le nom de la boutique dans les recommandations

EXEMPLES:
- "Notre [produit] à [prix]€ serait parfait pour vous ! [argument]. Quelle couleur préférez-vous ?"
- "Je n'ai pas ce modèle exact, mais notre [alternative] pourrait vous intéresser. Voulez-vous que je vous le montre ?"`;

  try {
    const messages = [
      { role: 'system', content: systemPrompt },
      ...conversationHistory.slice(-2), // Keep last 2 messages for context
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
    console.error('❌ Erreur OpenAI:', error);
    
    // Fallback response
    if (relevantProducts.length > 0) {
      const product = relevantProducts[0];
      return {
        message: `Notre ${product.name} à ${product.price}€ pourrait vous intéresser ! Voulez-vous en savoir plus ?`,
        selectedProducts: [product],
        should_show_products: true
      };
    } else {
      return {
        message: "Pouvez-vous me préciser ce que vous cherchez ? Je suis là pour vous conseiller !",
        selectedProducts: [],
        should_show_products: false
      };
    }
  }
}

async function saveSellerConversation(supabase: any, conversationData: any) {
  try {
    const { error } = await supabase
      .from('seller_conversations')
      .insert({
        seller_id: conversationData.seller_id,
        session_id: conversationData.session_id,
        user_message: conversationData.user_message,
        ai_response: conversationData.ai_response,
        products_shown: conversationData.products_shown,
        conversation_type: conversationData.conversation_type,
        created_at: new Date().toISOString()
      });

    if (error) {
      console.error('❌ Erreur sauvegarde conversation:', error);
    } else {
      console.log('💾 Conversation sauvegardée pour vendeur:', conversationData.seller_id);
    }

  } catch (error) {
    console.error('❌ Erreur sauvegarde conversation:', error);
  }
}