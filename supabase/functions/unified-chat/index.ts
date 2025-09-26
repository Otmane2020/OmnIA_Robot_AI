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

// Cache for faster responses
const responseCache = new Map<string, { response: string; timestamp: number; products: any[] }>();
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes
const anticipationCache = new Map<string, string>();

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { status: 200, headers: corsHeaders });
  }

  try {
    const { message, conversation_context = [], retailer_id = 'demo-retailer-id' }: UnifiedChatRequest = await req.json();
    console.log('🤖 OmnIA reçoit:', message.substring(0, 50) + '...');

    // ANTICIPATION: Check if we can predict the response while user is typing
    const anticipatedResponse = checkAnticipation(message);
    if (anticipatedResponse) {
      console.log('⚡ Réponse anticipée utilisée');
      return new Response(JSON.stringify(anticipatedResponse), { 
        headers: { 'Content-Type': 'application/json', ...corsHeaders } 
      });
    }

    // CACHE: Check if we have a recent similar response
    const cacheKey = generateCacheKey(message, retailer_id);
    const cachedResponse = responseCache.get(cacheKey);
    if (cachedResponse && (Date.now() - cachedResponse.timestamp) < CACHE_DURATION) {
      console.log('💾 Réponse en cache utilisée');
      return new Response(JSON.stringify({
        message: cachedResponse.response,
        products: cachedResponse.products,
        should_show_products: cachedResponse.products.length > 0,
        cached: true
      }), { headers: { 'Content-Type': 'application/json', ...corsHeaders } });
    }

    const openaiApiKey = Deno.env.get('OPENAI_API_KEY');
    if (!openaiApiKey) {
      return new Response(JSON.stringify({
        message: "Bonjour ! Je suis OmnIA, votre conseiller mobilier. Que cherchez-vous pour votre intérieur ?",
        products: []
      }), { headers: { 'Content-Type': 'application/json', ...corsHeaders } });
    }

    // Étape 1 : filtrage DB optimisé (products_enriched avec analyse promotion)
    const relevantProducts = await getRelevantProductsForQuery(message, retailer_id);

    // Étape 2 : réponse IA optimisée avec analyse promotion
    const aiResponse = await generateExpertResponseOptimized(message, relevantProducts, conversation_context, openaiApiKey);

    // Étape 3 : cache et conversion
    responseCache.set(cacheKey, {
      response: aiResponse.message,
      products: aiResponse.selectedProducts,
      timestamp: Date.now()
    });

    if (aiResponse.selectedProducts.length === 0 && relevantProducts.length > 0) {
      aiResponse.selectedProducts = relevantProducts.slice(0, 2);
      aiResponse.should_show_products = true;
    }

    return new Response(JSON.stringify({
      message: aiResponse.message,
      products: aiResponse.selectedProducts,
      should_show_products: aiResponse.should_show_products,
      filtered_count: relevantProducts.length,
      response_time: Date.now()
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

// ANTICIPATION: Predict responses for common patterns
function checkAnticipation(message: string): any | null {
  const lowerMessage = message.toLowerCase().trim();
  
  // Salutations rapides
  if (lowerMessage === 'bonjour' || lowerMessage === 'salut' || lowerMessage === 'hello') {
    return {
      message: "Bonjour ! 👋 Je suis OmnIA, votre conseiller mobilier IA. Que cherchez-vous pour votre intérieur ?",
      products: [],
      should_show_products: false,
      anticipated: true
    };
  }
  
  // Recherches simples communes
  if (lowerMessage === 'canapé' || lowerMessage === 'canapés') {
    return {
      message: "Parfait ! Quel style de canapé ? Moderne, d'angle, convertible ? Et quelle couleur vous plaît ?",
      products: [],
      should_show_products: false,
      anticipated: true
    };
  }
  
  if (lowerMessage === 'table' || lowerMessage === 'tables') {
    return {
      message: "Excellente idée ! Table à manger ou basse ? Quelle taille et quel matériau préférez-vous ?",
      products: [],
      should_show_products: false,
      anticipated: true
    };
  }
  
  if (lowerMessage === 'chaise' || lowerMessage === 'chaises') {
    return {
      message: "Super ! Chaise de salle à manger ou bureau ? Quel style et couleur vous intéressent ?",
      products: [],
      should_show_products: false,
      anticipated: true
    };
  }
  
  // Merci rapide
  if (lowerMessage === 'merci' || lowerMessage === 'merci beaucoup') {
    return {
      message: "Avec plaisir ! 😊 Autre chose pour votre intérieur ?",
      products: [],
      should_show_products: false,
      anticipated: true
    };
  }
  
  return null;
}

// Generate cache key for similar queries
function generateCacheKey(message: string, retailerId: string): string {
  const normalizedMessage = message.toLowerCase()
    .replace(/[^a-z0-9\s]/g, '')
    .split(' ')
    .filter(word => word.length > 2)
    .sort()
    .join('-');
  return `${retailerId}-${normalizedMessage}`;
}

async function getRelevantProductsForQuery(query: string, retailerId: string) {
  try {
    console.log('🔍 Recherche produits pour:', query);
    
    // Enhanced search in products_enriched with promotion analysis
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    );

    const productIntent = analyzeProductIntent(query);
    const extractedAttributes = extractAttributesFromQuery(query);

    // Enhanced search in products_enriched with ALL attributes
    let qb = supabase
      .from('products_enriched')
      .select(`
        id, handle, title, description, category, subcategory, 
        color, material, fabric, style, dimensions, room, 
        price, stock_qty, image_url, product_url, brand,
        seo_title, seo_description, tags, confidence_score,
        ad_headline, ad_description, google_product_category,
        enriched_at, enrichment_source
      `)
      .gt('stock_qty', 0);

    if (productIntent.category) {
      qb = qb.or(`category.ilike.%${productIntent.category}%,subcategory.ilike.%${productIntent.category}%`);
    }
    if (extractedAttributes.colors.length > 0) {
      qb = qb.or(extractedAttributes.colors.map(color => `color.ilike.%${color}%`).join(','));
    }
    if (extractedAttributes.materials.length > 0) {
      qb = qb.or(extractedAttributes.materials.map(material => `material.ilike.%${material}%,fabric.ilike.%${material}%`).join(','));
    }
    if (extractedAttributes.dimensions.length > 0) {
      qb = qb.or(extractedAttributes.dimensions.map(dim => `dimensions.ilike.%${dim}%`).join(','));
    }

    // Order by confidence and enrichment quality
    qb = qb.order('confidence_score', { ascending: false }).limit(5);
    const { data: enrichedData, error: enrichedError } = await qb;

    if (enrichedError) {
      console.error('❌ Erreur DB products_enriched:', enrichedError);
    }

    let products = enrichedData || [];
    console.log('✅ Produits enrichis trouvés:', products.length);

    // Enhanced product transformation with promotion info
    products = products.map(product => ({
      ...product,
      // Add promotion analysis
      hasPromotion: !!(product.compare_at_price && product.compare_at_price > product.price),
      discountPercentage: product.compare_at_price && product.compare_at_price > product.price ? 
        Math.round(((product.compare_at_price - product.price) / product.compare_at_price) * 100) : 0,
      // Transform for frontend compatibility
      productType: product.category,
      vendor: product.brand,
      availableForSale: product.stock_qty > 0,
      quantityAvailable: product.stock_qty,
      compareAtPrice: product.compare_at_price,
      variants: [{
        id: `${product.id}-default`,
        title: 'Default',
        price: product.price,
        compareAtPrice: product.compare_at_price,
        availableForSale: product.stock_qty > 0,
        quantityAvailable: product.stock_qty,
        selectedOptions: []
      }]
    }));

    // FALLBACK optimisé: Si pas assez de produits enrichis
    if (products.length < 3) {
      console.log('🔄 Fallback vers ai_products...');
      
      let aiQuery = supabase
        .from('ai_products')
        .select('id, name as title, description, category, price, stock, image_url, product_url')
        .gt('stock', 0);

      if (productIntent.category) {
        aiQuery = aiQuery.ilike('category', `%${productIntent.category}%`);
      }

      aiQuery = aiQuery.limit(5 - products.length);
      const { data: aiData } = await aiQuery;
      
      if (aiData && aiData.length > 0) {
        // Enhanced conversion with promotion detection
        const convertedProducts = aiData.map(product => ({
          id: product.id,
          handle: product.id,
          title: product.title,
          description: product.description,
          category: product.category,
          subcategory: '',
          color: '',
          material: '',
          fabric: '',
          style: '',
          dimensions: '',
          room: '',
          price: product.price,
          stock_qty: product.stock,
          image_url: product.image_url,
          product_url: product.product_url,
          hasPromotion: false,
          discountPercentage: 0,
          productType: product.category,
          vendor: 'Decora Home',
          availableForSale: product.stock > 0,
          quantityAvailable: product.stock,
          variants: [{
            id: `${product.id}-default`,
            title: 'Default',
            price: product.price,
            availableForSale: product.stock > 0,
            quantityAvailable: product.stock,
            selectedOptions: []
          }]
        }));
        
        products = [...products, ...convertedProducts];
        console.log('✅ Produits AI ajoutés:', convertedProducts.length);
      }
    }

    console.log('✅ Total produits trouvés:', products.length);
    return products;
  } catch (error) {
    console.error('❌ Erreur recherche produits:', error);
    return [];
  }
}

function analyzeProductIntent(query: string) {
  const lower = query.toLowerCase();
  const map: Record<string, { keywords: string[], category: string }> = {
    'canapé': { keywords: ['canapé', 'sofa'], category: 'canapé' },
    'table': { keywords: ['table', 'manger', 'basse'], category: 'table' },
    'chaise': { keywords: ['chaise', 'fauteuil'], category: 'chaise' },
    'lit': { keywords: ['lit', 'matelas'], category: 'lit' },
    'rangement': { keywords: ['armoire', 'commode'], category: 'rangement' },
    'meuble tv': { keywords: ['meuble tv', 'télé'], category: 'meuble tv' },
  };

  for (const [k, v] of Object.entries(map)) {
    if (v.keywords.some(word => lower.includes(word))) {
      return { category: v.category, keywords: v.keywords };
    }
  }
  return { category: null, keywords: [] };
}

function extractAttributesFromQuery(query: string) {
  const lower = query.toLowerCase();
  const colors = ['blanc','noir','gris','beige','bleu','vert','rouge','taupe']
    .filter(c => lower.includes(c));
  const materials = ['bois','marbre','travertin','métal','acier','verre','tissu','cuir','velours']
    .filter(m => lower.includes(m));
  const dims: string[] = [];
  const matches = lower.match(/\d+\s*cm|\d+\s*x\s*\d+/g);
  if (matches) dims.push(...matches);
  return { colors, materials, dimensions: dims };
}

async function generateExpertResponseOptimized(query: string, products: any[], context: any[], apiKey: string) {
  // Enhanced products context with promotion info
  const productsContext = products.length > 0
    ? products.map(p => {
        const promoText = p.hasPromotion ? ` (PROMO -${p.discountPercentage}% !)` : '';
        const originalPrice = p.compare_at_price ? ` (était ${p.compare_at_price}€)` : '';
        return `• ${p.title} - ${p.price}€${originalPrice}${promoText} - ${p.category || ''} ${p.color || ''} ${p.material || ''}`;
      }).join('\n')
    : 'Aucun produit trouvé.';

  const systemPrompt = `Tu es OmnIA, expert conseiller déco et vendeur chez Decora Home.

MISSION: Réponses ULTRA-RAPIDES, précises et vendeuses.

RÈGLES STRICTES:
- Réponse 1-2 phrases MAX (20 mots maximum)
- Toujours mentionner PRIX + PROMOTION si applicable
- Proposer 1-2 produits MAX si disponibles
- Ton vendeur expert et chaleureux
- Finir par question courte

EXEMPLES PARFAITS:
- "Notre ALYANA 799€ (était 1399€) -43% ! Quelle couleur ?"
- "Table AUREA travertin 499€ ! Ø100 ou 120cm ?"
- "Chaise INAYA 99€ (promo -33%) ! Combien ?"

Produits dispo :
${productsContext}`;

  const messages = [
    { role: 'system', content: systemPrompt },
    ...context.slice(-2),
    { role: 'user', content: query }
  ];

  // Use DeepSeek for faster responses
  const resp = await fetch('https://api.deepseek.com/chat/completions', {
    method: 'POST',
    headers: { 
      'Authorization': `Bearer ${Deno.env.get('DEEPSEEK_API_KEY') || apiKey}`, 
      'Content-Type': 'application/json' 
    },
    body: JSON.stringify({ 
      model: 'deepseek-chat', 
      messages, 
      max_tokens: 50, // Ultra-court pour rapidité
      temperature: 0.9, // Plus créatif
      stream: false // Pas de streaming pour rapidité
    })
  });

  const data = await resp.json();
  const msg = data.choices?.[0]?.message?.content || "Pouvez-vous préciser ?";
  
  return {
    message: msg,
    selectedProducts: products.slice(0, 2),
    should_show_products: products.length > 0
  };
}