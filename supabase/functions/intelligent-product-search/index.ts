const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
};

import { createClient } from 'npm:@supabase/supabase-js@2';

interface IntelligentSearchRequest {
  message: string;
  retailer_id: string;
  conversation_context?: Array<{
    role: 'user' | 'assistant';
    content: string;
  }>;
  filters?: {
    price_max?: number;
    price_min?: number;
    category?: string;
    color?: string;
    material?: string;
    style?: string;
    room?: string;
  };
}

interface SearchIntent {
  intent_type: 'product_search' | 'style_advice' | 'room_planning' | 'general_question';
  target_category?: string;
  target_colors: string[];
  target_materials: string[];
  target_styles: string[];
  target_room?: string;
  price_constraint?: {
    max?: number;
    min?: number;
  };
  size_constraint?: 'small' | 'medium' | 'large';
  special_features: string[];
  urgency: 'low' | 'medium' | 'high';
  confidence: number;
}

interface ProductMatch {
  product: any;
  relevance_score: number;
  matched_attributes: string[];
  ai_reasoning: string;
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, {
      status: 200,
      headers: corsHeaders,
    });
  }

  try {
    const { message, retailer_id, conversation_context = [], filters = {} }: IntelligentSearchRequest = await req.json();
    
    console.log('🔍 [intelligent-search] Recherche pour retailer:', retailer_id, '-', message.substring(0, 50) + '...');
    
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

    // Step 1: Analyze search intent with AI
    const searchIntent = await analyzeSearchIntentWithAI(message, conversation_context);
    console.log('🧠 [intelligent-search] Intention détectée:', searchIntent);

    // Step 2: Get retailer-specific enriched products
    const retailerProducts = await getRetailerEnrichedProducts(supabase, retailer_id);
    console.log('📦 [intelligent-search] Produits retailer:', retailerProducts.length);

    // Step 3: Apply intelligent filtering based on intent
    const filteredProducts = applyIntelligentFiltering(retailerProducts, searchIntent, filters);
    console.log('🎯 [intelligent-search] Produits filtrés:', filteredProducts.length);

    // Step 4: Score and rank products by relevance
    const scoredProducts = scoreProductRelevance(filteredProducts, searchIntent, message);
    console.log('📊 [intelligent-search] Produits scorés:', scoredProducts.length);

    // Step 5: Generate contextual AI response
    const aiResponse = await generateContextualResponse(message, scoredProducts, searchIntent, retailer_id);

    return new Response(
      JSON.stringify({
        message: aiResponse.message,
        products: scoredProducts.slice(0, 5).map(sp => sp.product),
        search_intent: searchIntent,
        total_found: scoredProducts.length,
        retailer_id,
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
    console.error('❌ [intelligent-search] Erreur:', error);
    
    return new Response(
      JSON.stringify({
        message: "Désolé, je rencontre des difficultés techniques. Pouvez-vous reformuler votre recherche ?",
        products: [],
        error: true
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

async function analyzeSearchIntentWithAI(message: string, context: any[]): Promise<SearchIntent> {
  const deepseekApiKey = Deno.env.get('DEEPSEEK_API_KEY');
  
  if (!deepseekApiKey) {
    console.log('⚠️ [intelligent-search] DeepSeek non configuré, analyse basique');
    return analyzeSearchIntentBasic(message);
  }

  try {
    const contextText = context.length > 0 ? 
      `CONTEXTE CONVERSATION:\n${context.slice(-3).map(c => `${c.role}: ${c.content}`).join('\n')}\n\n` : '';

    const prompt = `${contextText}Analyse cette recherche mobilier et extrait l'intention au format JSON strict :

RECHERCHE: "${message}"

Extrait au format JSON strict :
{
  "intent_type": "product_search|style_advice|room_planning|general_question",
  "target_category": "canapé|table|chaise|lit|rangement|meuble tv|decoration",
  "target_colors": ["blanc", "noir", "gris", "beige", "marron", "bleu", "vert", "rouge"],
  "target_materials": ["bois", "métal", "verre", "tissu", "cuir", "velours", "travertin", "marbre"],
  "target_styles": ["moderne", "contemporain", "scandinave", "industriel", "vintage", "rustique"],
  "target_room": "salon|chambre|cuisine|bureau|salle à manger|entrée",
  "price_constraint": {
    "max": 500,
    "min": 100
  },
  "size_constraint": "small|medium|large",
  "special_features": ["convertible", "rangement", "angle", "pliable"],
  "urgency": "low|medium|high",
  "confidence": 85
}

RÈGLES:
- intent_type: Détermine le type principal de demande
- target_category: Catégorie de produit recherchée (si applicable)
- target_colors: Couleurs mentionnées ou souhaitées
- target_materials: Matériaux spécifiés
- target_styles: Styles décoratifs demandés
- target_room: Pièce de destination
- price_constraint: Budget mentionné (sous X€, entre X et Y€)
- special_features: Fonctionnalités spéciales demandées
- confidence: 0-100 basé sur la clarté de l'intention

RÉPONSE JSON UNIQUEMENT:`;

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
            content: 'Tu es un expert en analyse d\'intention de recherche mobilier. Réponds uniquement en JSON valide sans texte supplémentaire.'
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
          console.log('✅ [intelligent-search] Intention IA extraite:', parsed);
          return {
            ...parsed,
            target_colors: parsed.target_colors || [],
            target_materials: parsed.target_materials || [],
            target_styles: parsed.target_styles || [],
            special_features: parsed.special_features || []
          };
        } catch (parseError) {
          console.log('⚠️ [intelligent-search] JSON invalide, fallback basique');
        }
      }
    }
  } catch (error) {
    console.log('⚠️ [intelligent-search] Erreur DeepSeek, fallback basique');
  }

  return analyzeSearchIntentBasic(message);
}

function analyzeSearchIntentBasic(message: string): SearchIntent {
  const lowerMessage = message.toLowerCase();
  
  // Detect intent type
  let intent_type: SearchIntent['intent_type'] = 'general_question';
  if (lowerMessage.includes('cherche') || lowerMessage.includes('veux') || lowerMessage.includes('besoin')) {
    intent_type = 'product_search';
  } else if (lowerMessage.includes('conseil') || lowerMessage.includes('aide') || lowerMessage.includes('comment')) {
    intent_type = 'style_advice';
  } else if (lowerMessage.includes('aménager') || lowerMessage.includes('décorer')) {
    intent_type = 'room_planning';
  }

  // Extract category
  let target_category;
  if (lowerMessage.includes('canapé') || lowerMessage.includes('sofa')) target_category = 'canapé';
  else if (lowerMessage.includes('table')) target_category = 'table';
  else if (lowerMessage.includes('chaise') || lowerMessage.includes('fauteuil')) target_category = 'chaise';
  else if (lowerMessage.includes('lit') || lowerMessage.includes('matelas')) target_category = 'lit';
  else if (lowerMessage.includes('armoire') || lowerMessage.includes('commode')) target_category = 'rangement';

  // Extract colors
  const colors = ['blanc', 'noir', 'gris', 'beige', 'marron', 'bleu', 'vert', 'rouge', 'jaune', 'orange', 'rose', 'violet', 'naturel', 'chêne', 'noyer', 'taupe'];
  const target_colors = colors.filter(color => lowerMessage.includes(color));

  // Extract materials
  const materials = ['bois', 'métal', 'verre', 'tissu', 'cuir', 'velours', 'travertin', 'marbre', 'plastique', 'rotin'];
  const target_materials = materials.filter(material => lowerMessage.includes(material));

  // Extract styles
  const styles = ['moderne', 'contemporain', 'scandinave', 'industriel', 'vintage', 'rustique', 'classique', 'minimaliste', 'bohème'];
  const target_styles = styles.filter(style => lowerMessage.includes(style));

  // Extract room
  let target_room;
  if (lowerMessage.includes('salon')) target_room = 'salon';
  else if (lowerMessage.includes('chambre')) target_room = 'chambre';
  else if (lowerMessage.includes('cuisine')) target_room = 'cuisine';
  else if (lowerMessage.includes('bureau')) target_room = 'bureau';
  else if (lowerMessage.includes('salle à manger')) target_room = 'salle à manger';

  // Extract price constraints
  const priceMatch = lowerMessage.match(/(?:sous|under|moins de|max|maximum)\s*(\d+)/);
  const price_constraint = priceMatch ? { max: parseInt(priceMatch[1]) } : undefined;

  // Extract features
  const features = ['convertible', 'rangement', 'angle', 'pliable', 'extensible', 'réglable'];
  const special_features = features.filter(feature => lowerMessage.includes(feature));

  // Calculate confidence
  let confidence = 30;
  if (target_category) confidence += 25;
  if (target_colors.length > 0) confidence += 20;
  if (target_materials.length > 0) confidence += 15;
  if (target_styles.length > 0) confidence += 10;
  if (price_constraint) confidence += 10;

  return {
    intent_type,
    target_category,
    target_colors,
    target_materials,
    target_styles,
    target_room,
    price_constraint,
    size_constraint: lowerMessage.includes('petit') ? 'small' : lowerMessage.includes('grand') ? 'large' : 'medium',
    special_features,
    urgency: lowerMessage.includes('urgent') || lowerMessage.includes('rapidement') ? 'high' : 'medium',
    confidence: Math.min(confidence, 100)
  };
}

async function getRetailerEnrichedProducts(supabase: any, retailerId: string) {
  try {
    // Get enriched products filtered by retailer_id
    const { data: enrichedProducts, error } = await supabase
      .from('products_enriched')
      .select('*')
      .eq('retailer_id', retailerId)
      .gt('stock_qty', 0)
      .order('confidence_score', { ascending: false });

    if (error) {
      console.error('❌ [intelligent-search] Erreur DB enriched:', error);
      return [];
    }

    if (enrichedProducts && enrichedProducts.length > 0) {
      console.log('✅ [intelligent-search] Produits enrichis trouvés:', enrichedProducts.length);
      return enrichedProducts;
    }

    // Fallback: Get from retailer_products
    const { data: retailerProducts } = await supabase
      .from('retailer_products')
      .select('*')
      .eq('retailer_id', retailerId)
      .eq('status', 'active')
      .gt('stock', 0);

    if (retailerProducts && retailerProducts.length > 0) {
      console.log('✅ [intelligent-search] Fallback vers retailer_products:', retailerProducts.length);
      return retailerProducts.map(p => ({
        ...p,
        title: p.name,
        stock_qty: p.stock,
        category: p.category || 'Mobilier',
        subcategory: '',
        color: '',
        material: '',
        style: '',
        confidence_score: 50
      }));
    }

    console.log('⚠️ [intelligent-search] Aucun produit trouvé pour retailer:', retailerId);
    return [];

  } catch (error) {
    console.error('❌ [intelligent-search] Erreur récupération produits:', error);
    return [];
  }
}

function applyIntelligentFiltering(products: any[], intent: SearchIntent, additionalFilters: any) {
  let filtered = [...products];

  // Filter by category
  if (intent.target_category) {
    filtered = filtered.filter(product => 
      product.category?.toLowerCase().includes(intent.target_category) ||
      product.subcategory?.toLowerCase().includes(intent.target_category)
    );
  }

  // Filter by colors
  if (intent.target_colors.length > 0) {
    filtered = filtered.filter(product =>
      intent.target_colors.some(color =>
        product.color?.toLowerCase().includes(color.toLowerCase())
      )
    );
  }

  // Filter by materials
  if (intent.target_materials.length > 0) {
    filtered = filtered.filter(product =>
      intent.target_materials.some(material =>
        product.material?.toLowerCase().includes(material.toLowerCase()) ||
        product.fabric?.toLowerCase().includes(material.toLowerCase())
      )
    );
  }

  // Filter by styles
  if (intent.target_styles.length > 0) {
    filtered = filtered.filter(product =>
      intent.target_styles.some(style =>
        product.style?.toLowerCase().includes(style.toLowerCase())
      )
    );
  }

  // Filter by room
  if (intent.target_room) {
    filtered = filtered.filter(product =>
      product.room?.toLowerCase().includes(intent.target_room)
    );
  }

  // Filter by price
  if (intent.price_constraint?.max) {
    filtered = filtered.filter(product => product.price <= intent.price_constraint.max);
  }
  if (intent.price_constraint?.min) {
    filtered = filtered.filter(product => product.price >= intent.price_constraint.min);
  }

  // Apply additional filters
  if (additionalFilters.category) {
    filtered = filtered.filter(product => 
      product.category?.toLowerCase().includes(additionalFilters.category.toLowerCase())
    );
  }
  if (additionalFilters.color) {
    filtered = filtered.filter(product => 
      product.color?.toLowerCase().includes(additionalFilters.color.toLowerCase())
    );
  }
  if (additionalFilters.material) {
    filtered = filtered.filter(product => 
      product.material?.toLowerCase().includes(additionalFilters.material.toLowerCase())
    );
  }
  if (additionalFilters.price_max) {
    filtered = filtered.filter(product => product.price <= additionalFilters.price_max);
  }
  if (additionalFilters.price_min) {
    filtered = filtered.filter(product => product.price >= additionalFilters.price_min);
  }

  return filtered;
}

function scoreProductRelevance(products: any[], intent: SearchIntent, originalMessage: string): ProductMatch[] {
  return products.map(product => {
    let score = 0;
    const matches: string[] = [];
    const reasoning: string[] = [];

    // Category match (highest priority)
    if (intent.target_category && (
      product.category?.toLowerCase().includes(intent.target_category) ||
      product.subcategory?.toLowerCase().includes(intent.target_category)
    )) {
      score += 40;
      matches.push('catégorie');
      reasoning.push(`Catégorie "${intent.target_category}" correspond`);
    }

    // Color match
    if (intent.target_colors.length > 0) {
      const colorMatches = intent.target_colors.filter(color =>
        product.color?.toLowerCase().includes(color.toLowerCase())
      );
      if (colorMatches.length > 0) {
        score += 25 * colorMatches.length;
        matches.push('couleur');
        reasoning.push(`Couleurs: ${colorMatches.join(', ')}`);
      }
    }

    // Material match
    if (intent.target_materials.length > 0) {
      const materialMatches = intent.target_materials.filter(material =>
        product.material?.toLowerCase().includes(material.toLowerCase()) ||
        product.fabric?.toLowerCase().includes(material.toLowerCase())
      );
      if (materialMatches.length > 0) {
        score += 20 * materialMatches.length;
        matches.push('matériau');
        reasoning.push(`Matériaux: ${materialMatches.join(', ')}`);
      }
    }

    // Style match
    if (intent.target_styles.length > 0) {
      const styleMatches = intent.target_styles.filter(style =>
        product.style?.toLowerCase().includes(style.toLowerCase())
      );
      if (styleMatches.length > 0) {
        score += 15 * styleMatches.length;
        matches.push('style');
        reasoning.push(`Styles: ${styleMatches.join(', ')}`);
      }
    }

    // Room match
    if (intent.target_room && product.room?.toLowerCase().includes(intent.target_room)) {
      score += 10;
      matches.push('pièce');
      reasoning.push(`Adapté pour ${intent.target_room}`);
    }

    // Price match
    if (intent.price_constraint?.max && product.price <= intent.price_constraint.max) {
      score += 15;
      matches.push('prix');
      reasoning.push(`Prix ${product.price}€ dans budget ${intent.price_constraint.max}€`);
    }

    // Features match
    if (intent.special_features.length > 0) {
      const featureMatches = intent.special_features.filter(feature => {
        const productText = `${product.title} ${product.description} ${product.subcategory}`.toLowerCase();
        return productText.includes(feature);
      });
      if (featureMatches.length > 0) {
        score += 10 * featureMatches.length;
        matches.push('fonctionnalités');
        reasoning.push(`Fonctionnalités: ${featureMatches.join(', ')}`);
      }
    }

    // Text similarity bonus
    const messageWords = originalMessage.toLowerCase().split(' ').filter(word => word.length > 2);
    const productText = `${product.title} ${product.description}`.toLowerCase();
    const textMatches = messageWords.filter(word => productText.includes(word));
    if (textMatches.length > 0) {
      score += textMatches.length * 2;
      matches.push('texte');
    }

    // Confidence bonus
    score += (product.confidence_score || 0) * 0.1;

    return {
      product: {
        id: product.id,
        title: product.title,
        description: product.description,
        price: product.price,
        category: product.category,
        subcategory: product.subcategory,
        color: product.color,
        material: product.material,
        style: product.style,
        dimensions: product.dimensions,
        image_url: product.image_url,
        product_url: product.product_url,
        stock_qty: product.stock_qty,
        confidence_score: product.confidence_score,
        brand: product.brand,
        availableForSale: product.stock_qty > 0,
        quantityAvailable: product.stock_qty,
        productType: product.category,
        vendor: product.brand,
        variants: [{
          id: `${product.id}-default`,
          title: 'Default',
          price: product.price,
          availableForSale: product.stock_qty > 0,
          quantityAvailable: product.stock_qty,
          selectedOptions: []
        }]
      },
      relevance_score: Math.min(score, 100),
      matched_attributes: matches,
      ai_reasoning: reasoning.join(' • ') || 'Correspondance générale'
    };
  }).sort((a, b) => b.relevance_score - a.relevance_score);
}

async function generateContextualResponse(
  message: string, 
  scoredProducts: ProductMatch[], 
  intent: SearchIntent, 
  retailerId: string
) {
  const openaiApiKey = Deno.env.get('OPENAI_API_KEY');
  
  if (!openaiApiKey) {
    return generateFallbackResponse(message, scoredProducts, intent);
  }

  try {
    const productsContext = scoredProducts.slice(0, 3).map(sp => 
      `• ${sp.product.title} - ${sp.product.price}€ - ${sp.product.category} ${sp.product.color || ''} ${sp.product.material || ''} (Score: ${sp.relevance_score}%)`
    ).join('\n');

    const systemPrompt = `Tu es OmnIA, assistant IA expert en mobilier pour ce revendeur.

INTENTION DÉTECTÉE: ${intent.intent_type}
PRODUITS PERTINENTS TROUVÉS (${scoredProducts.length}):
${productsContext || 'Aucun produit correspondant trouvé.'}

PERSONNALITÉ:
- Expert en mobilier et décoration
- Chaleureux et professionnel
- Réponses courtes et engageantes (2-3 phrases max)
- Orienté solution et vente

RÈGLES:
- Si produits trouvés → Recommander les plus pertinents avec prix et arguments
- Si aucun produit → Proposer alternatives ou conseils généraux
- Toujours finir par une question engageante
- Utiliser les scores de pertinence pour prioriser

EXEMPLES:
- "Parfait ! Notre [produit] à [prix]€ correspond exactement ! [argument]. Quelle couleur préférez-vous ?"
- "J'ai trouvé [X] options intéressantes. Le [produit] à [prix]€ semble idéal. Voulez-vous voir les détails ?"`;

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openaiApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: message }
        ],
        max_tokens: 150,
        temperature: 0.8,
      }),
    });

    if (response.ok) {
      const data = await response.json();
      const aiMessage = data.choices[0]?.message?.content || 'Comment puis-je vous aider ?';
      
      return { message: aiMessage };
    }
  } catch (error) {
    console.error('❌ [intelligent-search] Erreur OpenAI:', error);
  }

  return generateFallbackResponse(message, scoredProducts, intent);
}

function generateFallbackResponse(message: string, scoredProducts: ProductMatch[], intent: SearchIntent) {
  if (scoredProducts.length === 0) {
    if (intent.target_category) {
      return {
        message: `Je n'ai pas de ${intent.target_category} correspondant à vos critères actuellement. Voulez-vous que je vous propose des alternatives ou ajuster vos critères ?`
      };
    }
    return {
      message: "Je n'ai pas trouvé de produits correspondants. Pouvez-vous préciser votre recherche ? Je suis là pour vous conseiller !"
    };
  }

  const topProduct = scoredProducts[0].product;
  const productCount = scoredProducts.length;

  if (productCount === 1) {
    return {
      message: `Parfait ! Notre ${topProduct.title} à ${topProduct.price}€ correspond exactement à votre recherche. Voulez-vous voir les détails ?`
    };
  } else {
    return {
      message: `Excellent ! J'ai trouvé ${productCount} options intéressantes. Notre ${topProduct.title} à ${topProduct.price}€ semble particulièrement adapté. Voulez-vous que je vous montre la sélection ?`
    };
  }
}