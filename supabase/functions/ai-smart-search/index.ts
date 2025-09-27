const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
};

import { createClient } from 'npm:@supabase/supabase-js@2';

interface SmartSearchRequest {
  query: string;
  retailer_id?: string;
  filters?: {
    priceMax?: number;
    priceMin?: number;
    colors?: string[];
    materials?: string[];
    styles?: string[];
    room?: string;
    category?: string;
  };
  limit?: number;
}

interface SearchResult {
  product: any;
  relevanceScore: number;
  matchedAttributes: string[];
  reasoning: string;
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, {
      status: 200,
      headers: corsHeaders,
    });
  }

  try {
    const { query, retailer_id, filters = {}, limit = 10 }: SmartSearchRequest = await req.json();
    
    console.log('🔍 Recherche intelligente pour retailer:', retailer_id, '-', query);
    console.log('🎯 Filtres:', filters);

    // Initialize Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Parse search intent with AI
    const searchIntent = await parseSearchIntentWithAI(query);
    console.log('🧠 Intention détectée:', searchIntent);

    // Get all products from database
    let productQuery = supabase
      .from('ai_products')
      .select(`
        id,
        name,
        description,
        price,
        category,
        vendor,
        image_url,
        product_url,
        stock,
        source_platform,
        store_id,
        extracted_attributes,
        confidence_score,
        processed_at,
        created_at,
        updated_at
      `);

    // Filter by retailer if provided
    if (retailer_id) {
      productQuery = productQuery.eq('store_id', retailer_id);
    }

    const { data: products, error } = await productQuery;

    if (error) {
      console.error('❌ Erreur récupération produits:', error);
      throw error;
    }

    if (!products || products.length === 0) {
      return new Response(
        JSON.stringify({
          success: false,
          message: 'Aucun produit trouvé. Veuillez d\'abord entraîner le modèle avec votre catalogue.',
          products: [],
          suggestions: ['Uploadez votre catalogue CSV', 'Entraînez le modèle IA']
        }),
        {
          headers: {
            'Content-Type': 'application/json',
            ...corsHeaders,
          },
        }
      );
    }

    // Score and rank products
    const searchResults: SearchResult[] = [];
    
    for (const product of products) {
      const score = calculateRelevanceScore(product, searchIntent, filters);
      
      if (score.total > 0) {
        searchResults.push({
          product,
          relevanceScore: score.total,
          matchedAttributes: score.matches,
          reasoning: score.reasoning
        });
      }
    }

    // Sort by relevance
    searchResults.sort((a, b) => b.relevanceScore - a.relevanceScore);
    
    // Limit results
    const limitedResults = searchResults.slice(0, limit);

    console.log('✅ Résultats trouvés:', limitedResults.length);

    return new Response(
      JSON.stringify({
        success: true,
        query: query,
        intent: searchIntent,
        results: limitedResults.map(r => ({
          ...r.product,
          relevance_score: r.relevanceScore,
          matched_attributes: r.matchedAttributes,
          ai_reasoning: r.reasoning
        })),
        total_found: searchResults.length,
        search_time: new Date().toISOString()
      }),
      {
        headers: {
          'Content-Type': 'application/json',
          ...corsHeaders,
        },
      }
    );

  } catch (error) {
    console.error('❌ Erreur recherche intelligente:', error);
    
    return new Response(
      JSON.stringify({
        success: false,
        error: 'Erreur lors de la recherche intelligente',
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

async function parseSearchIntentWithAI(query: string): Promise<any> {
  const deepseekApiKey = Deno.env.get('DEEPSEEK_API_KEY');
  
  if (!deepseekApiKey) {
    return parseSearchIntentBasic(query);
  }

  try {
    const prompt = `Analyse cette recherche mobilier et extrait l'intention au format JSON :

RECHERCHE: "${query}"

Extrait au format JSON strict :
{
  "intent_type": "product_search|style_advice|room_planning",
  "target_colors": ["couleur1", "couleur2"],
  "target_materials": ["matériau1"],
  "target_styles": ["style1"],
  "target_room": "salon|chambre|cuisine|bureau",
  "target_category": "canapé|table|chaise|lit|rangement",
  "price_constraint": {
    "max": 500,
    "min": 100
  },
  "size_constraint": "small|medium|large",
  "special_features": ["convertible", "rangement"],
  "urgency": "low|medium|high"
}

Réponse JSON uniquement :`;

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
            content: 'Tu es un expert en analyse d\'intention de recherche mobilier. Réponds uniquement en JSON valide.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        max_tokens: 300,
        temperature: 0.1,
        stream: false
      }),
    });

    if (response.ok) {
      const data = await response.json();
      const content = data.choices[0]?.message?.content?.trim();
      
      if (content) {
        try {
          return JSON.parse(content);
        } catch (parseError) {
          console.log('⚠️ JSON invalide, fallback basique');
        }
      }
    }
  } catch (error) {
    console.log('⚠️ Erreur DeepSeek, fallback basique');
  }

  return parseSearchIntentBasic(query);
}

function parseSearchIntentBasic(query: string): any {
  const lowerQuery = query.toLowerCase();
  
  // Extract colors
  const colors = ['blanc', 'noir', 'gris', 'beige', 'marron', 'bleu', 'vert', 'rouge', 'jaune', 'orange', 'rose', 'violet']
    .filter(color => lowerQuery.includes(color));

  // Extract materials  
  const materials = ['bois', 'métal', 'verre', 'tissu', 'cuir', 'velours', 'travertin', 'marbre']
    .filter(material => lowerQuery.includes(material));

  // Extract styles
  const styles = ['moderne', 'scandinave', 'industriel', 'vintage', 'minimaliste', 'contemporain']
    .filter(style => lowerQuery.includes(style));

  // Extract room
  let target_room = '';
  if (lowerQuery.includes('salon')) target_room = 'salon';
  else if (lowerQuery.includes('chambre')) target_room = 'chambre';
  else if (lowerQuery.includes('cuisine')) target_room = 'cuisine';
  else if (lowerQuery.includes('bureau')) target_room = 'bureau';

  // Extract category
  let target_category = '';
  if (lowerQuery.includes('canapé') || lowerQuery.includes('sofa')) target_category = 'canapé';
  else if (lowerQuery.includes('table')) target_category = 'table';
  else if (lowerQuery.includes('chaise')) target_category = 'chaise';
  else if (lowerQuery.includes('lit')) target_category = 'lit';

  // Extract price
  const priceMatch = lowerQuery.match(/(?:sous|under|moins de|max)\s*(\d+)/);
  const price_constraint = priceMatch ? { max: parseInt(priceMatch[1]) } : {};

  return {
    intent_type: 'product_search',
    target_colors: colors,
    target_materials: materials,
    target_styles: styles,
    target_room,
    target_category,
    price_constraint,
    size_constraint: lowerQuery.includes('petit') ? 'small' : lowerQuery.includes('grand') ? 'large' : 'medium',
    special_features: ['convertible', 'rangement', 'pliable'].filter(f => lowerQuery.includes(f)),
    urgency: 'medium'
  };
}

function calculateRelevanceScore(product: any, intent: any, filters: any): any {
  let totalScore = 0;
  const matches: string[] = [];
  const reasoning: string[] = [];

  const attributes = product.extracted_attributes || {};

  // Category match (highest priority)
  if (intent.target_category && 
      (product.category?.toLowerCase().includes(intent.target_category) ||
       product.name?.toLowerCase().includes(intent.target_category))) {
    totalScore += 40;
    matches.push('category');
    reasoning.push(`Catégorie "${intent.target_category}" correspond`);
  }

  // Color match
  if (intent.target_colors?.length > 0 && attributes.colors) {
    const colorMatches = intent.target_colors.filter((color: string) => 
      attributes.colors.some((productColor: string) => 
        productColor.toLowerCase().includes(color) || color.includes(productColor.toLowerCase())
      )
    );
    if (colorMatches.length > 0) {
      totalScore += 25 * colorMatches.length;
      matches.push('colors');
      reasoning.push(`Couleurs correspondantes: ${colorMatches.join(', ')}`);
    }
  }

  // Material match
  if (intent.target_materials?.length > 0 && attributes.materials) {
    const materialMatches = intent.target_materials.filter((material: string) =>
      attributes.materials.some((productMaterial: string) =>
        productMaterial.toLowerCase().includes(material) || material.includes(productMaterial.toLowerCase())
      )
    );
    if (materialMatches.length > 0) {
      totalScore += 20 * materialMatches.length;
      matches.push('materials');
      reasoning.push(`Matériaux correspondants: ${materialMatches.join(', ')}`);
    }
  }

  // Style match
  if (intent.target_styles?.length > 0 && attributes.styles) {
    const styleMatches = intent.target_styles.filter((style: string) =>
      attributes.styles.some((productStyle: string) =>
        productStyle.toLowerCase().includes(style) || style.includes(productStyle.toLowerCase())
      )
    );
    if (styleMatches.length > 0) {
      totalScore += 15 * styleMatches.length;
      matches.push('styles');
      reasoning.push(`Styles correspondants: ${styleMatches.join(', ')}`);
    }
  }

  // Price match
  if (intent.price_constraint?.max && product.price <= intent.price_constraint.max) {
    totalScore += 15;
    matches.push('price');
    reasoning.push(`Prix ${product.price}€ sous budget ${intent.price_constraint.max}€`);
  }

  // Room match
  if (intent.target_room && attributes.room?.includes(intent.target_room)) {
    totalScore += 10;
    matches.push('room');
    reasoning.push(`Adapté pour ${intent.target_room}`);
  }

  // Features match
  if (intent.special_features?.length > 0 && attributes.features) {
    const featureMatches = intent.special_features.filter((feature: string) =>
      attributes.features.includes(feature)
    );
    if (featureMatches.length > 0) {
      totalScore += 10 * featureMatches.length;
      matches.push('features');
      reasoning.push(`Fonctionnalités: ${featureMatches.join(', ')}`);
    }
  }

  // Apply filters
  if (filters.priceMax && product.price > filters.priceMax) totalScore = 0;
  if (filters.priceMin && product.price < filters.priceMin) totalScore = 0;

  return {
    total: totalScore,
    matches,
    reasoning: reasoning.join(' • ')
  };
}

async function generateExpertResponse(message: string, relevantProducts: any[], context: any[], apiKey: string) {
  const productsContext = relevantProducts.length > 0 
    ? relevantProducts.map(p => {
        let productInfo = `• ${p.name} - ${p.price}€`;
        if (p.category) productInfo += ` - ${p.category}`;
        if (p.extracted_attributes?.subcategory) productInfo += ` - ${p.extracted_attributes.subcategory}`;
        if (p.extracted_attributes?.ai_vision_summary) productInfo += ` - Vision: ${p.extracted_attributes.ai_vision_summary}`;
        if (p.extracted_attributes?.tags && Array.isArray(p.extracted_attributes.tags)) {
          productInfo += ` - Tags: ${p.extracted_attributes.tags.join(', ')}`;
        }
        return productInfo;
      }).join('\n') : 'Aucun produit trouvé.';

  const systemPrompt = `Tu es OmnIA, conseiller déco Decora Home.
Réponds court (2 phrases max), engageant et humain.
Toujours proposer 1–2 produits si disponibles.
Utilise les informations de prix, catégories et Vision IA disponibles.
Produits dispo :
${productsContext}`;

  const messages = [
    { role: 'system', content: systemPrompt },
    ...context.slice(-2),
    { role: 'user', content: message }
  ];

  const resp = await fetch('https://api.deepseek.com/chat/completions', {
    method: 'POST',
    headers: { 'Authorization': `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ model: 'deepseek-chat', messages, max_tokens: 100, temperature: 0.8 })
  });

  const data = await resp.json();
  const msg = data.choices?.[0]?.message?.content || "Pouvez-vous préciser ?";
  return {
    message: msg,
    selectedProducts: relevantProducts.slice(0, 2),
    should_show_products: relevantProducts.length > 0
  };
}