const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
};

import { createClient } from 'npm:@supabase/supabase-js@2';

interface UnifiedChatRequest {
  message: string;
  retailer_id?: string;
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
    const { message, conversation_context = [], retailer_id = 'demo-retailer-id' }: UnifiedChatRequest = await req.json();
    console.log('🤖 OmnIA reçoit:', message.substring(0, 50) + '...');

    // RÈGLE IMPORTANTE: Ne pas proposer de produits pour les salutations simples
    const lowerMessage = message.toLowerCase().trim();
    const isSimpleGreeting = ['bonjour', 'salut', 'hello', 'bonsoir', 'coucou', 'hey'].some(greeting => 
      lowerMessage === greeting || lowerMessage === greeting + ' !'
    );

    if (isSimpleGreeting) {
      const greetingResponses = [
        "Bonjour ! Ravi de vous voir ! 😊 Que cherchez-vous pour votre intérieur ?",
        "Salut ! Bienvenue chez nous ! 👋 Comment puis-je vous aider ?", 
        "Hello ! Que puis-je faire pour vous ? 🤖",
        "Bonjour ! Prêt à décorer ? 🏠 Dites-moi vos envies !",
        "Coucou ! Comment allez-vous ? ✨ Quel projet mobilier ?"
      ];
      
      return new Response(JSON.stringify({
        message: greetingResponses[Math.floor(Math.random() * greetingResponses.length)],
        products: [],
        should_show_products: false,
        intent: 'greeting',
        enriched_search: false
      }), { headers: { 'Content-Type': 'application/json', ...corsHeaders } });
    }

    // ÉTAPE 1: Analyser l'intention avec DeepSeek
    const analysisResult = await analyzeUserIntentWithDeepSeek(message);
    console.log('🧠 Analyse DeepSeek:', analysisResult);

    // ÉTAPE 2: Rechercher dans products_enriched avec les attributs détectés
    const relevantProducts = await searchEnrichedProducts(analysisResult.attributes);
    console.log('📦 Produits enrichis trouvés:', relevantProducts.length);

    // ÉTAPE 3: Générer réponse conversationnelle adaptée
    const aiResponse = await generateConversationalResponse(message, analysisResult, relevantProducts);

    return new Response(JSON.stringify({
      message: aiResponse.message,
      products: relevantProducts,
      should_show_products: relevantProducts.length > 0,
      intent: analysisResult.intent,
      filters_used: analysisResult.attributes,
      enriched_search: true
    }), { headers: { 'Content-Type': 'application/json', ...corsHeaders } });

  } catch (error) {
    console.error('❌ Erreur unified-chat:', error);
    return new Response(JSON.stringify({
      message: "Petit souci technique 😅 pouvez-vous reformuler ?",
      products: [],
      fallback: true
    }), { headers: { 'Content-Type': 'application/json', ...corsHeaders } });
  }
});

async function analyzeUserIntentWithDeepSeek(message: string) {
  const deepseekApiKey = Deno.env.get('DEEPSEEK_API_KEY');
  
  if (!deepseekApiKey) {
    console.log('⚠️ DeepSeek non configuré, analyse basique');
    return analyzeIntentBasic(message);
  }

  try {
    const prompt = `Analyse cette demande client mobilier et extrait l'intention + attributs au format JSON strict :

MESSAGE CLIENT: "${message}"

EXTRAIT au format JSON exact :
{
  "intent": "search_product|price_inquiry|stock_check|advice_request|comparison",
  "attributes": {
    "category": "canapé|table|chaise|lit|rangement|meuble tv|décoration",
    "subcategory": "canapé d'angle|table basse|chaise bureau|lit double",
    "color": "beige|blanc|noir|gris|bleu|vert|rouge|marron|naturel",
    "material": "velours|cuir|bois|métal|verre|tissu|travertin|marbre",
    "style": "moderne|contemporain|scandinave|industriel|vintage|classique",
    "room": "salon|chambre|cuisine|bureau|salle à manger|entrée",
    "price_range": "0-500|500-1000|1000-2000|2000+",
    "size": "petit|moyen|grand",
    "features": ["convertible", "rangement", "réglable"]
  },
  "confidence": 85
}

RÈGLES:
- intent: type de demande client
- attributes: SEULEMENT les attributs mentionnés explicitement
- Si attribut non mentionné → ne pas l'inclure
- confidence: 0-100 basé sur clarté du message
- Réponse JSON uniquement

RÉPONSE JSON:`;

    const response = await fetch('https://api.deepseek.com/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${deepseekApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'deepseek-chat',
        messages: [
          {
            role: 'system',
            content: 'Tu es un expert en analyse d\'intention client mobilier. Réponds UNIQUEMENT en JSON valide.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        max_tokens: 400,
        temperature: 0.1,
        stream: false
      }),
    });

    if (response.ok) {
      const data = await response.json();
      const content = data.choices[0]?.message?.content?.trim();
      
      if (content) {
        try {
          const parsed = JSON.parse(content);
          console.log('✅ DeepSeek analyse réussie:', parsed);
          return parsed;
        } catch (parseError) {
          console.log('⚠️ JSON invalide, fallback basique');
        }
      }
    }
  } catch (error) {
    console.log('⚠️ Erreur DeepSeek, fallback basique');
  }

  return analyzeIntentBasic(message);
}

function analyzeIntentBasic(message: string) {
  const lowerMessage = message.toLowerCase();
  
  // Détecter l'intention
  let intent = 'search_product';
  if (lowerMessage.includes('prix') || lowerMessage.includes('coût')) intent = 'price_inquiry';
  if (lowerMessage.includes('stock') || lowerMessage.includes('disponible')) intent = 'stock_check';
  if (lowerMessage.includes('conseil') || lowerMessage.includes('aide')) intent = 'advice_request';

  // Extraire attributs basiques
  const attributes: any = {};
  
  // Catégories
  if (lowerMessage.includes('canapé') || lowerMessage.includes('sofa')) attributes.category = 'canapé';
  if (lowerMessage.includes('table')) attributes.category = 'table';
  if (lowerMessage.includes('chaise')) attributes.category = 'chaise';
  if (lowerMessage.includes('lit')) attributes.category = 'lit';

  // Couleurs
  const colors = ['beige', 'blanc', 'noir', 'gris', 'bleu', 'vert', 'rouge', 'marron'];
  colors.forEach(color => {
    if (lowerMessage.includes(color)) attributes.color = color;
  });

  // Matériaux
  const materials = ['velours', 'cuir', 'bois', 'métal', 'verre', 'tissu', 'travertin'];
  materials.forEach(material => {
    if (lowerMessage.includes(material)) attributes.material = material;
  });

  // Prix
  const priceMatch = lowerMessage.match(/(?:sous|moins de|max|maximum)\s*(\d+)/);
  if (priceMatch) {
    const maxPrice = parseInt(priceMatch[1]);
    if (maxPrice <= 500) attributes.price_range = '0-500';
    else if (maxPrice <= 1000) attributes.price_range = '500-1000';
    else if (maxPrice <= 2000) attributes.price_range = '1000-2000';
    else attributes.price_range = '2000+';
  }

  return { intent, attributes, confidence: 60 };
}

async function searchEnrichedProducts(attributes: any) {
  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');

    if (!supabaseUrl || !supabaseKey) {
      console.log('⚠️ Supabase non configuré, produits fallback');
      return getDecoraFallbackProducts(attributes);
    }

    const supabase = createClient(supabaseUrl, supabaseKey);

    // Construire la requête avec les attributs
    let query = supabase
      .from('products_enriched')
      .select('*')
      .gt('stock_qty', 0);

    // Filtres basés sur les attributs DeepSeek
    if (attributes.category) {
      query = query.ilike('category', `%${attributes.category}%`);
    }
    if (attributes.color) {
      query = query.ilike('color', `%${attributes.color}%`);
    }
    if (attributes.material) {
      query = query.ilike('material', `%${attributes.material}%`);
    }
    if (attributes.style) {
      query = query.ilike('style', `%${attributes.style}%`);
    }
    if (attributes.room) {
      query = query.ilike('room', `%${attributes.room}%`);
    }

    // Filtrage par prix
    if (attributes.price_range) {
      const [min, max] = attributes.price_range.split('-').map(p => parseInt(p.replace('+', '')));
      if (max) {
        query = query.gte('price', min).lte('price', max);
      } else {
        query = query.gte('price', min);
      }
    }

    query = query.limit(3);

    const { data: products, error } = await query;

    if (error) {
      console.error('❌ Erreur requête products_enriched:', error);
      return getDecoraFallbackProducts(attributes);
    }

    console.log('✅ Produits enrichis trouvés:', products?.length || 0);

    // Transformer au format attendu
    return (products || []).map(product => ({
      id: product.id,
      handle: product.handle || `product-${product.id}`,
      title: product.title,
      productType: product.category,
      vendor: product.vendor || 'Decora Home',
      tags: Array.isArray(product.tags) ? product.tags : [],
      price: product.price,
      compareAtPrice: product.compare_at_price,
      availableForSale: product.stock_qty > 0,
      quantityAvailable: product.stock_qty,
      image_url: product.image_url || 'https://images.pexels.com/photos/1350789/pexels-photo-1350789.jpeg',
      product_url: product.product_url || '#',
      description: product.description || product.title,
      variants: [{
        id: `${product.id}-default`,
        title: 'Default',
        price: product.price,
        compareAtPrice: product.compare_at_price,
        availableForSale: true,
        quantityAvailable: product.stock_qty,
        selectedOptions: []
      }]
    }));

  } catch (error) {
    console.error('❌ Erreur recherche enrichie:', error);
    return getDecoraFallbackProducts(attributes);
  }
}

async function generateConversationalResponse(message: string, analysis: any, products: any[]) {
  const deepseekApiKey = Deno.env.get('DEEPSEEK_API_KEY');
  
  if (!deepseekApiKey) {
    return generateFallbackResponse(message, analysis, products);
  }

  try {
    const productsContext = products.length > 0 ? 
      products.map(p => `• ${p.title} - ${p.price}€${p.compareAtPrice ? ` (était ${p.compareAtPrice}€)` : ''}`).join('\n') :
      'Aucun produit en stock correspondant exactement.';

    const prompt = `Tu es OmnIA, robot vendeur expert chez Decora Home. Réponds de manière naturelle et commerciale.

MESSAGE CLIENT: "${message}"
INTENTION DÉTECTÉE: ${analysis.intent}
ATTRIBUTS: ${JSON.stringify(analysis.attributes)}

PRODUITS DISPONIBLES:
${productsContext}

RÈGLES:
- Réponse courte (2-3 phrases max)
- Ton commercial chaleureux
- Si produits trouvés → les présenter avec enthousiasme
- Si aucun produit → proposer alternatives ou conseil
- Toujours finir par une question engageante
- Utiliser emojis avec modération

RÉPONSE:`;

    const response = await fetch('https://api.deepseek.com/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${deepseekApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'deepseek-chat',
        messages: [
          {
            role: 'system',
            content: 'Tu es OmnIA, robot vendeur expert en mobilier. Réponds de manière naturelle et commerciale.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        max_tokens: 150,
        temperature: 0.8,
        stream: false
      }),
    });

    if (response.ok) {
      const data = await response.json();
      const aiMessage = data.choices[0]?.message?.content || generateFallbackResponse(message, analysis, products).message;
      
      return { message: aiMessage };
    }
  } catch (error) {
    console.log('⚠️ Erreur DeepSeek réponse, fallback');
  }

  return generateFallbackResponse(message, analysis, products);
}

function generateFallbackResponse(message: string, analysis: any, products: any[]) {
  const lowerMessage = message.toLowerCase();
  
  if (products.length === 0) {
    if (analysis.attributes.category) {
      return {
        message: `Malheureusement, nous n'avons actuellement aucun ${analysis.attributes.category} en stock correspondant exactement à vos critères. Mais restons en contact ! Dès que de nouveaux modèles arrivent, je vous préviens. Que diriez-vous d'explorer nos autres catégories ?`
      };
    }
    return {
      message: "Je n'ai pas trouvé de produit exact, mais je peux vous conseiller ! Que cherchez-vous précisément ?"
    };
  }

  const product = products[0];
  const hasDiscount = product.compareAtPrice && product.compareAtPrice > product.price;
  
  return {
    message: `Excellente demande ! J'ai ${products.length} produit${products.length > 1 ? 's' : ''} qui pourrai${products.length > 1 ? 'ent' : 't'} vous intéresser. ${hasDiscount ? 'Avec des remises attractives !' : ''} Lequel vous plaît le plus ?`
  };
}

function getDecoraFallbackProducts(attributes: any) {
  const allProducts = [
    {
      id: 'decora-canape-alyana-beige',
      handle: 'canape-alyana-beige',
      title: 'Canapé ALYANA convertible - Beige',
      productType: 'Canapé',
      vendor: 'Decora Home',
      tags: ['convertible', 'velours', 'beige'],
      price: 799,
      compareAtPrice: 1399,
      availableForSale: true,
      quantityAvailable: 100,
      image_url: 'https://cdn.shopify.com/s/files/1/0903/7578/2665/files/7_23a97631-68d2-4f3e-8f78-b26c7cd4c2ae.png?v=1754406480',
      product_url: 'https://decorahome.fr/products/canape-dangle-convertible-et-reversible-4-places-en-velours-cotele',
      description: 'Canapé d\'angle convertible 4 places en velours côtelé beige',
      variants: [{
        id: 'variant-beige',
        title: 'Beige',
        price: 799,
        availableForSale: true,
        quantityAvailable: 100,
        selectedOptions: []
      }]
    },
    {
      id: 'decora-table-aurea-100',
      handle: 'table-aurea-100',
      title: 'Table AUREA Ø100cm - Travertin',
      productType: 'Table',
      vendor: 'Decora Home',
      tags: ['travertin', 'ronde'],
      price: 499,
      compareAtPrice: 859,
      availableForSale: true,
      quantityAvailable: 50,
      image_url: 'https://cdn.shopify.com/s/files/1/0903/7578/2665/files/3_e80b9a50-b032-4267-8f5b-f9130153e3be.png?v=1754406484',
      product_url: 'https://decorahome.fr/products/table-a-manger-ronde-plateau-en-travertin-naturel-100-120-cm',
      description: 'Table ronde en travertin naturel',
      variants: [{
        id: 'variant-100cm',
        title: 'Ø100cm',
        price: 499,
        availableForSale: true,
        quantityAvailable: 50,
        selectedOptions: []
      }]
    },
    {
      id: 'decora-chaise-inaya-gris',
      handle: 'chaise-inaya-gris',
      title: 'Chaise INAYA - Gris chenille',
      productType: 'Chaise',
      vendor: 'Decora Home',
      tags: ['chenille', 'gris'],
      price: 99,
      compareAtPrice: 149,
      availableForSale: true,
      quantityAvailable: 96,
      image_url: 'https://cdn.shopify.com/s/files/1/0903/7578/2665/files/3_3f11d1af-8ce5-4d2d-a435-cd0a78eb92ee.png?v=1755791319',
      product_url: 'https://decorahome.fr/products/chaise-en-tissu-serge-chenille-pieds-metal-noir-gris-clair-moka-et-beige',
      description: 'Chaise en tissu chenille avec pieds métal noir',
      variants: [{
        id: 'variant-gris',
        title: 'Gris clair',
        price: 99,
        availableForSale: true,
        quantityAvailable: 96,
        selectedOptions: []
      }]
    }
  ];

  // Filtrer selon les attributs
  return allProducts.filter(product => {
    if (attributes.category && !product.productType.toLowerCase().includes(attributes.category)) return false;
    if (attributes.color && !product.tags.some(tag => tag.toLowerCase().includes(attributes.color))) return false;
    if (attributes.material && !product.tags.some(tag => tag.toLowerCase().includes(attributes.material))) return false;
    return true;
  });
}