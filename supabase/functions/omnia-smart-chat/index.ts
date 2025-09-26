const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
};

import { createClient } from 'npm:@supabase/supabase-js@2';

interface OmniaSmartChatRequest {
  message: string;
  retailer_id?: string;
  session_id?: string;
  conversation_context?: Array<{
    role: 'user' | 'assistant';
    content: string;
  }>;
}

interface SmartChatResponse {
  message: string;
  products: any[];
  should_show_products: boolean;
  intent_detected: string;
  response_time_ms: number;
  retailer_info?: {
    company_name: string;
    robot_name: string;
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
    const { message, retailer_id, session_id, conversation_context = [] }: OmniaSmartChatRequest = await req.json();
    
    console.log('🤖 [omnia-smart-chat] Message reçu:', message.substring(0, 50) + '...');
    const startTime = Date.now();

    // ÉTAPE 1: Analyse d'intention ultra-rapide (< 500ms)
    const intentResponse = await fetch(`${Deno.env.get('SUPABASE_URL')}/functions/v1/smart-intent-analyzer`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        message,
        retailer_id,
        conversation_context
      }),
    });

    let intent = {
      intent_type: 'chat',
      should_search_products: false,
      attributes: {},
      response_template: 'Comment puis-je vous aider ?'
    };

    if (intentResponse.ok) {
      const intentData = await intentResponse.json();
      intent = intentData.intent;
      console.log('🎯 [omnia-smart-chat] Intention:', intent.intent_type);
    }

    let products = [];
    let finalResponse = intent.response_template;

    // ÉTAPE 2: Recherche produits SI nécessaire (< 300ms)
    if (intent.should_search_products && intent.intent_type === 'product_search') {
      console.log('🔍 [omnia-smart-chat] Recherche produits...');
      
      const searchResponse = await fetch(`${Deno.env.get('SUPABASE_URL')}/functions/v1/fast-product-search`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          attributes: intent.attributes,
          retailer_id,
          limit: 3
        }),
      });

      if (searchResponse.ok) {
        const searchData = await searchResponse.json();
        products = searchData.products || [];
        console.log('📦 [omnia-smart-chat] Produits trouvés:', products.length);

        // ÉTAPE 3: Générer réponse adaptée (< 800ms)
        if (products.length > 0) {
          finalResponse = await generateProductResponse(message, products, intent);
        } else {
          finalResponse = generateNoProductResponse(intent.attributes);
        }
      }
    } else if (intent.intent_type === 'faq') {
      finalResponse = generateFAQResponse(message);
    } else if (intent.intent_type === 'style_advice') {
      finalResponse = generateStyleAdviceResponse(message);
    } else {
      finalResponse = generateChatResponse(message);
    }

    // ÉTAPE 4: Sauvegarder conversation (async, non bloquant)
    saveConversationAsync(retailer_id, session_id, message, finalResponse, products);

    const responseTime = Date.now() - startTime;
    console.log(`⚡ [omnia-smart-chat] Réponse générée en ${responseTime}ms`);

    // Convertir les produits au format attendu par le frontend
    const formattedProducts = products.map(product => ({
      id: product.id,
      handle: product.handle || product.id,
      title: product.title,
      productType: product.category,
      vendor: product.brand || 'Decora Home',
      tags: [],
      price: product.price,
      availableForSale: product.stock_qty > 0,
      quantityAvailable: product.stock_qty,
      image_url: product.image_url,
      product_url: product.product_url,
      description: `${product.category} ${product.color} ${product.material}`.trim(),
      variants: [{
        id: `${product.id}-default`,
        title: 'Default',
        price: product.price,
        availableForSale: product.stock_qty > 0,
        quantityAvailable: product.stock_qty,
        selectedOptions: []
      }]
    }));

    const response: SmartChatResponse = {
      message: finalResponse,
      products: formattedProducts,
      should_show_products: products.length > 0,
      intent_detected: intent.intent_type,
      response_time_ms: responseTime
    };

    return new Response(
      JSON.stringify(response),
      {
        headers: {
          'Content-Type': 'application/json',
          ...corsHeaders,
        },
      }
    );

  } catch (error) {
    console.error('❌ [omnia-smart-chat] Erreur:', error);
    
    return new Response(
      JSON.stringify({
        message: "Désolé, je rencontre un petit souci technique. Pouvez-vous reformuler ?",
        products: [],
        should_show_products: false,
        intent_detected: 'error',
        response_time_ms: Date.now() - Date.now()
      }),
      {
        headers: {
          'Content-Type': 'application/json',
          ...corsHeaders,
        },
      }
    );
  }
});

async function generateProductResponse(message: string, products: any[], intent: any): Promise<string> {
  const openaiApiKey = Deno.env.get('OPENAI_API_KEY');
  
  if (!openaiApiKey) {
    return generateTemplateProductResponse(products, intent.attributes);
  }

  try {
    const productsContext = products.slice(0, 2).map(p => 
      `• ${p.title} - ${p.price}€ - ${p.color} ${p.material}`
    ).join('\n');

    const prompt = `Client: "${message}"

PRODUITS TROUVÉS:
${productsContext}

Génère une réponse de vendeur expert (20 mots max) :
- Ton chaleureux et commercial
- Mentionne 1-2 produits avec prix
- Termine par question engageante
- Pas de markdown

Exemple: "Parfait ! Notre table AUREA 499€ en travertin serait idéale. Quelle taille préférez-vous ?"`;

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openaiApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          {
            role: 'system',
            content: 'Tu es OmnIA, vendeur expert mobilier. Réponses ultra-courtes, chaleureuses, commerciales.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        max_tokens: 60,
        temperature: 0.7,
      }),
    });

    if (response.ok) {
      const data = await response.json();
      return data.choices[0]?.message?.content || generateTemplateProductResponse(products, intent.attributes);
    }
  } catch (error) {
    console.log('⚠️ [omnia-smart-chat] Erreur OpenAI, template');
  }

  return generateTemplateProductResponse(products, intent.attributes);
}

function generateTemplateProductResponse(products: any[], attributes: any): string {
  if (products.length === 0) {
    return generateNoProductResponse(attributes);
  }

  const product = products[0];
  const productCount = products.length;

  if (productCount === 1) {
    return `Parfait ! Notre ${product.title} à ${product.price}€ correspond exactement. Voulez-vous voir les détails ?`;
  } else {
    return `Excellent ! J'ai ${productCount} options. Notre ${product.title} à ${product.price}€ semble idéal. Quelle couleur préférez-vous ?`;
  }
}

function generateNoProductResponse(attributes: any): string {
  if (attributes.category) {
    return `Je n'ai pas de ${attributes.category} ${attributes.color || ''} en stock actuellement. Voulez-vous voir des alternatives ?`;
  }
  return "Je n'ai pas trouvé de produits correspondants. Pouvez-vous préciser votre recherche ?";
}

function generateFAQResponse(message: string): string {
  const lowerMessage = message.toLowerCase();
  
  if (lowerMessage.includes('livraison')) {
    return "Livraison gratuite en Île-de-France sous 48h ! Autres régions : 49€. Besoin d'infos sur les délais ?";
  }
  if (lowerMessage.includes('garantie')) {
    return "Tous nos meubles ont 2 ans de garantie constructeur. Échange possible sous 30 jours. Autres questions ?";
  }
  if (lowerMessage.includes('retour')) {
    return "Retours acceptés sous 30 jours en parfait état. Frais de retour offerts si défaut. Besoin d'aide ?";
  }
  if (lowerMessage.includes('paiement')) {
    return "Paiement CB, PayPal, virement. Paiement en 3x sans frais dès 300€. Autres questions ?";
  }
  if (lowerMessage.includes('showroom') || lowerMessage.includes('magasin')) {
    return "Showroom ouvert du lundi au samedi 10h-19h. 123 Avenue des Champs-Élysées, Paris. Rendez-vous ?";
  }
  
  return "Je peux vous renseigner sur la livraison, garantie, retours ou paiement. Que souhaitez-vous savoir ?";
}

function generateStyleAdviceResponse(message: string): string {
  const lowerMessage = message.toLowerCase();
  
  if (lowerMessage.includes('salon')) {
    return "Pour le salon, commencez par définir la zone d'assise face au point focal. Quelle est la taille de votre pièce ?";
  }
  if (lowerMessage.includes('chambre')) {
    return "En chambre, privilégiez des couleurs apaisantes et un éclairage doux. Quel style vous inspire ?";
  }
  if (lowerMessage.includes('couleur')) {
    return "Pour les couleurs, partez d'une base neutre et ajoutez 2-3 accents. Quelle ambiance souhaitez-vous ?";
  }
  
  return "Avec plaisir pour les conseils déco ! Quelle pièce souhaitez-vous aménager ?";
}

function generateChatResponse(message: string): string {
  const lowerMessage = message.toLowerCase();
  
  if (lowerMessage.includes('bonjour') || lowerMessage.includes('salut')) {
    return "Bonjour ! Je suis OmnIA, votre conseiller mobilier. Que cherchez-vous pour votre intérieur ?";
  }
  if (lowerMessage.includes('merci')) {
    return "Avec plaisir ! Autre chose pour votre projet déco ?";
  }
  if (lowerMessage.includes('qui') || lowerMessage.includes('omnia')) {
    return "Je suis OmnIA, assistant IA spécialisé mobilier. Je vous aide à trouver les meubles parfaits !";
  }
  
  return "Comment puis-je vous aider avec votre projet mobilier aujourd'hui ?";
}

async function saveConversationAsync(retailerId: string, sessionId: string, userMessage: string, aiResponse: string, products: any[]) {
  try {
    // Sauvegarder de manière asynchrone pour ne pas ralentir la réponse
    setTimeout(async () => {
      try {
        const supabase = createClient(
          Deno.env.get('SUPABASE_URL')!,
          Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
        );

        const isRetailerIdUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(retailerId);
        
        await supabase
          .from('retailer_conversations')
          .insert({
            retailer_id: isRetailerIdUuid ? retailerId : null,
            session_id: sessionId || crypto.randomUUID(),
            user_message: userMessage,
            ai_response: aiResponse,
            products_shown: products.map(p => p.title),
            conversation_type: 'product_search',
            created_at: new Date().toISOString()
          });

        console.log('💾 [omnia-smart-chat] Conversation sauvegardée');
      } catch (error) {
        console.error('❌ [omnia-smart-chat] Erreur sauvegarde conversation:', error);
      }
    }, 0);
  } catch (error) {
    console.error('❌ [omnia-smart-chat] Erreur setup sauvegarde:', error);
  }
}