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

    const openaiApiKey = Deno.env.get('OPENAI_API_KEY');
    if (!openaiApiKey) {
      return new Response(JSON.stringify({
        message: "Bonjour ! Je suis OmnIA, votre conseiller mobilier. Que cherchez-vous pour votre intérieur ?",
        products: []
      }), { headers: { 'Content-Type': 'application/json', ...corsHeaders } });
    }

    // Étape 1 : filtrage DB (products_enriched)
    const relevantProducts = await getRelevantProductsForQuery(message, retailer_id);

    // Étape 2 : réponse IA
    const aiResponse = await generateExpertResponse(message, relevantProducts, conversation_context, openaiApiKey);

    // Étape 3 : conversion (forcer l’affichage si on a trouvé des produits)
    if (aiResponse.selectedProducts.length === 0 && relevantProducts.length > 0) {
      aiResponse.selectedProducts = relevantProducts.slice(0, 2);
      aiResponse.should_show_products = true;
    }

    return new Response(JSON.stringify({
      message: aiResponse.message,
      products: aiResponse.selectedProducts,
      should_show_products: aiResponse.should_show_products,
      filtered_count: relevantProducts.length
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

async function getRelevantProductsForQuery(query: string, retailerId: string) {
  try {
    console.log('🔍 Recherche produits pour:', query);
    
    // Enhanced: Multi-source intelligent search with better scoring
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    );

    const productIntent = analyzeProductIntentEnhanced(query);
    const extractedAttributes = extractAttributesFromQueryEnhanced(query);
    
    console.log('🎯 Intention enrichie:', productIntent);
    console.log('🔍 Attributs extraits:', extractedAttributes);

    // Enhanced search in products_enriched with better filtering
    let qb = supabase
      .from('products_enriched')
      .select('id, handle, title, description, category, subcategory, color, material, fabric, style, dimensions, room, price, stock_qty, image_url, product_url, confidence_score, tags, brand')
      .gt('stock_qty', 0);

    // Enhanced category filtering with subcategory support
    if (productIntent.category) {
      qb = qb.or(`category.ilike.%${productIntent.category}%,subcategory.ilike.%${productIntent.category}%,title.ilike.%${productIntent.category}%`);
    }
    
    // Enhanced color filtering
    if (extractedAttributes.colors.length > 0) {
      const colorConditions = extractedAttributes.colors.map(color => 
        `color.ilike.%${color}%,title.ilike.%${color}%,description.ilike.%${color}%`
      ).join(',');
      qb = qb.or(colorConditions);
    }
    
    // Enhanced material filtering
    if (extractedAttributes.materials.length > 0) {
      const materialConditions = extractedAttributes.materials.map(material => 
        `material.ilike.%${material}%,fabric.ilike.%${material}%,title.ilike.%${material}%,description.ilike.%${material}%`
      ).join(',');
      qb = qb.or(materialConditions);
    }
    
    // Enhanced style filtering
    if (extractedAttributes.styles.length > 0) {
      const styleConditions = extractedAttributes.styles.map(style => 
        `style.ilike.%${style}%,title.ilike.%${style}%,description.ilike.%${style}%`
      ).join(',');
      qb = qb.or(styleConditions);
    }
    
    // Enhanced room filtering
    if (extractedAttributes.room.length > 0) {
      const roomConditions = extractedAttributes.room.map(room => 
        `room.ilike.%${room}%,title.ilike.%${room}%,description.ilike.%${room}%`
      ).join(',');
      qb = qb.or(roomConditions);
    }
    
    // Price filtering
    if (extractedAttributes.price_max) {
      qb = qb.lte('price', extractedAttributes.price_max);
    }
    
    // Enhanced keyword search
    if (extractedAttributes.dimensions.length > 0) {
      qb = qb.or(extractedAttributes.dimensions.map(dim => `dimensions.ilike.%${dim}%`).join(','));
    }

    // Order by confidence score and limit
    qb = qb.order('confidence_score', { ascending: false }).limit(8);
    const { data: enrichedData, error: enrichedError } = await qb;

    if (enrichedError) {
      console.error('❌ Erreur DB products_enriched:', enrichedError);
    }

    let products = enrichedData || [];
    console.log('✅ Produits enrichis trouvés:', products.length);

    // Enhanced fallback with better scoring
    if (products.length < 3) {
      console.log('🔄 Fallback vers ai_products...');
      
      let aiQuery = supabase
        .from('ai_products')
        .select('id, name as title, description, category, price, stock, image_url, product_url, extracted_attributes, confidence_score')
        .gt('stock', 0);

      if (productIntent.category) {
        aiQuery = aiQuery.or(`category.ilike.%${productIntent.category}%,name.ilike.%${productIntent.category}%`);
      }

      // Enhanced keyword search in ai_products
      if (extractedAttributes.keywords.length > 0) {
        const keywordConditions = extractedAttributes.keywords.map(keyword => 
          `name.ilike.%${keyword}%,description.ilike.%${keyword}%`
        ).join(',');
        aiQuery = aiQuery.or(keywordConditions);
      }

      aiQuery = aiQuery.order('confidence_score', { ascending: false }).limit(8 - products.length);
      const { data: aiData } = await aiQuery;
      
      if (aiData && aiData.length > 0) {
        // Enhanced conversion with attribute mapping
        const convertedProducts = aiData.map(product => ({
          id: product.id,
          handle: product.id,
          title: product.title,
          description: product.description,
          category: product.category,
          subcategory: extractSubcategoryFromAttributes(product.extracted_attributes),
          color: extractAttributeValue(product.extracted_attributes, 'colors'),
          material: extractAttributeValue(product.extracted_attributes, 'materials'),
          fabric: extractAttributeValue(product.extracted_attributes, 'fabric'),
          style: extractAttributeValue(product.extracted_attributes, 'styles'),
          dimensions: extractAttributeValue(product.extracted_attributes, 'dimensions'),
          room: extractAttributeValue(product.extracted_attributes, 'room'),
          price: product.price,
          stock_qty: product.stock,
          image_url: product.image_url,
          product_url: product.product_url,
          confidence_score: product.confidence_score || 50,
          brand: 'Decora Home'
        }));
        
        products = [...products, ...convertedProducts];
        console.log('✅ Produits AI ajoutés:', convertedProducts.length);
      }
    }

    // Enhanced product scoring and ranking
    const scoredProducts = products.map(product => ({
      ...product,
      relevance_score: calculateProductRelevanceScore(product, productIntent, extractedAttributes, query)
    })).sort((a, b) => b.relevance_score - a.relevance_score);
    console.log('✅ Total produits trouvés:', products.length);
    return scoredProducts;
  } catch (error) {
    console.error('❌ Erreur recherche produits:', error);
    return [];
  }
}

function analyzeProductIntentEnhanced(query: string) {
  const lower = query.toLowerCase();
  
  // Enhanced category mapping with more keywords and context
  const categoryMap: Record<string, { keywords: string[], category: string, subcategories: string[] }> = {
    'canapé': { 
      keywords: ['canapé', 'canapés', 'sofa', 'sofas', 'assise', 'salon', 'couchage'], 
      category: 'canapé',
      subcategories: ['angle', 'convertible', 'fixe', 'lit', 'places']
    },
    'table': { 
      keywords: ['table', 'tables', 'manger', 'basse', 'repas', 'console', 'bureau'], 
      category: 'table',
      subcategories: ['basse', 'manger', 'ronde', 'rectangulaire', 'console']
    },
    'chaise': { 
      keywords: ['chaise', 'chaises', 'fauteuil', 'fauteuils', 'siège', 'sièges', 'tabouret'], 
      category: 'chaise',
      subcategories: ['bureau', 'salle à manger', 'bar', 'ergonomique']
    },
    'lit': { 
      keywords: ['lit', 'lits', 'matelas', 'couchage', 'chambre', 'sommier'], 
      category: 'lit',
      subcategories: ['simple', 'double', 'queen', 'king']
    },
    'rangement': { 
      keywords: ['armoire', 'armoires', 'commode', 'commodes', 'rangement', 'bibliothèque'], 
      category: 'rangement',
      subcategories: ['armoire', 'commode', 'bibliothèque', 'étagère']
    },
    'meuble tv': { 
      keywords: ['meuble tv', 'meuble télé', 'tv', 'télé', 'entertainment'], 
      category: 'meuble tv',
      subcategories: ['bas', 'mural', 'angle']
    }
  };

  // Find matching category with enhanced scoring
  let bestMatch = { category: null, keywords: [], confidence: 0, subcategory: null };
  
  for (const [k, v] of Object.entries(categoryMap)) {
    const keywordMatches = v.keywords.filter(word => lower.includes(word));
    const subcategoryMatches = v.subcategories.filter(sub => lower.includes(sub));
    
    if (keywordMatches.length > 0) {
      const confidence = (keywordMatches.length / v.keywords.length) * 100;
      if (confidence > bestMatch.confidence) {
        bestMatch = { 
          category: v.category, 
          keywords: keywordMatches, 
          confidence,
          subcategory: subcategoryMatches[0] || null
        };
      }
    }
  }
  
  return bestMatch;
}

function extractAttributesFromQueryEnhanced(query: string) {
  const lower = query.toLowerCase();
  
  // Enhanced color extraction with more variations
  const colorPatterns = [
    { name: 'blanc', patterns: ['blanc', 'white', 'ivoire', 'crème', 'écru'] },
    { name: 'noir', patterns: ['noir', 'black', 'anthracite', 'charbon'] },
    { name: 'gris', patterns: ['gris', 'grey', 'gray', 'argent', 'platine'] },
    { name: 'beige', patterns: ['beige', 'sable', 'lin', 'nude', 'champagne'] },
    { name: 'marron', patterns: ['marron', 'brown', 'chocolat', 'moka', 'cognac'] },
    { name: 'bleu', patterns: ['bleu', 'blue', 'marine', 'navy', 'cobalt'] },
    { name: 'vert', patterns: ['vert', 'green', 'olive', 'sauge', 'émeraude'] },
    { name: 'rouge', patterns: ['rouge', 'red', 'bordeaux', 'cerise'] },
    { name: 'jaune', patterns: ['jaune', 'yellow', 'moutarde', 'or'] },
    { name: 'orange', patterns: ['orange', 'corail', 'abricot'] },
    { name: 'rose', patterns: ['rose', 'pink', 'fuchsia'] },
    { name: 'violet', patterns: ['violet', 'purple', 'mauve'] },
    { name: 'taupe', patterns: ['taupe', 'greige'] },
    { name: 'chêne', patterns: ['chêne', 'oak'] },
    { name: 'noyer', patterns: ['noyer', 'walnut'] }
  ];
  
  const colors = colorPatterns
    .filter(({ patterns }) => patterns.some(pattern => lower.includes(pattern)))
    .map(({ name }) => name);
    
  // Enhanced material extraction
  const materialPatterns = [
    { name: 'bois massif', patterns: ['bois massif', 'massif', 'solid wood'] },
    { name: 'chêne', patterns: ['chêne', 'oak'] },
    { name: 'métal', patterns: ['métal', 'metal', 'acier', 'steel'] },
    { name: 'verre', patterns: ['verre', 'glass', 'cristal'] },
    { name: 'tissu', patterns: ['tissu', 'fabric', 'textile'] },
    { name: 'cuir', patterns: ['cuir', 'leather'] },
    { name: 'velours', patterns: ['velours', 'velvet', 'côtelé'] },
    { name: 'travertin', patterns: ['travertin', 'travertine'] },
    { name: 'marbre', patterns: ['marbre', 'marble'] },
    { name: 'chenille', patterns: ['chenille'] },
    { name: 'rotin', patterns: ['rotin', 'rattan', 'osier'] }
  ];
  
  const materials = materialPatterns
    .filter(({ patterns }) => patterns.some(pattern => lower.includes(pattern)))
    .map(({ name }) => name);
    
  // Enhanced style extraction
  const stylePatterns = [
    { name: 'moderne', patterns: ['moderne', 'modern', 'design moderne'] },
    { name: 'contemporain', patterns: ['contemporain', 'contemporary'] },
    { name: 'scandinave', patterns: ['scandinave', 'scandinavian', 'nordique'] },
    { name: 'industriel', patterns: ['industriel', 'industrial', 'loft'] },
    { name: 'vintage', patterns: ['vintage', 'rétro', 'retro'] },
    { name: 'classique', patterns: ['classique', 'classic', 'traditionnel'] },
    { name: 'minimaliste', patterns: ['minimaliste', 'minimalist', 'épuré'] }
  ];
  
  const styles = stylePatterns
    .filter(({ patterns }) => patterns.some(pattern => lower.includes(pattern)))
    .map(({ name }) => name);
    
  // Enhanced room extraction
  const roomPatterns = [
    { name: 'salon', patterns: ['salon', 'living', 'séjour'] },
    { name: 'chambre', patterns: ['chambre', 'bedroom'] },
    { name: 'cuisine', patterns: ['cuisine', 'kitchen'] },
    { name: 'bureau', patterns: ['bureau', 'office'] },
    { name: 'salle à manger', patterns: ['salle à manger', 'dining'] }
  ];
  
  const room = roomPatterns
    .filter(({ patterns }) => patterns.some(pattern => lower.includes(pattern)))
    .map(({ name }) => name);
    
  // Enhanced price extraction
  const priceMatches = lower.match(/(?:sous|under|moins de|max|maximum|budget)\s*(\d+)/g);
  const price_max = priceMatches ? Math.max(...priceMatches.map(match => {
    const num = match.match(/(\d+)/);
    return num ? parseInt(num[1]) : 0;
  })) : undefined;
  
  // Enhanced dimension extraction
  const dimensionMatches = lower.match(/(\d+)\s*[x×]\s*(\d+)(?:\s*[x×]\s*(\d+))?\s*cm|\d+\s*cm|ø\s*\d+/g);
  const dimensions = dimensionMatches || [];
  
  // Extract keywords for text search
  const keywords = query
    .split(/\s+/)
    .filter(word => word.length > 2)
    .filter(word => !['le', 'la', 'les', 'un', 'une', 'des', 'du', 'de', 'pour', 'avec', 'sans'].includes(word));
    
  return { 
    colors, 
    materials, 
    styles,
    room,
    dimensions, 
    price_max,
    keywords
  };
}

function extractSubcategoryFromAttributes(attributes: any): string {
  if (!attributes) return '';
  
  try {
    const attrs = typeof attributes === 'string' ? JSON.parse(attributes) : attributes;
    return attrs.subcategory || '';
  } catch {
    return '';
  }
}

function extractAttributeValue(attributes: any, key: string): string {
  if (!attributes) return '';
  
  try {
    const attrs = typeof attributes === 'string' ? JSON.parse(attributes) : attributes;
    const value = attrs[key];
    
    if (Array.isArray(value)) {
      return value[0] || '';
    }
    
    if (typeof value === 'object' && value !== null) {
      return Object.values(value).join(' ') || '';
    }
    
    return value || '';
  } catch {
    return '';
  }
}

function calculateProductRelevanceScore(product: any, intent: any, attributes: any, originalQuery: string): number {
  let score = 0;
  
  // Base confidence score
  score += (product.confidence_score || 50) * 0.3;
  
  // Category match (highest priority)
  if (intent.category && (
    product.category?.toLowerCase().includes(intent.category) ||
    product.subcategory?.toLowerCase().includes(intent.category) ||
    product.title?.toLowerCase().includes(intent.category)
  )) {
    score += 40;
  }
  
  // Color match
  if (attributes.colors.length > 0) {
    const colorMatches = attributes.colors.filter(color =>
      product.color?.toLowerCase().includes(color) ||
      product.title?.toLowerCase().includes(color) ||
      product.description?.toLowerCase().includes(color)
    );
    score += colorMatches.length * 15;
  }
  
  // Material match
  if (attributes.materials.length > 0) {
    const materialMatches = attributes.materials.filter(material =>
      product.material?.toLowerCase().includes(material) ||
      product.fabric?.toLowerCase().includes(material) ||
      product.title?.toLowerCase().includes(material) ||
      product.description?.toLowerCase().includes(material)
    );
    score += materialMatches.length * 15;
  }
  
  // Style match
  if (attributes.styles.length > 0) {
    const styleMatches = attributes.styles.filter(style =>
      product.style?.toLowerCase().includes(style) ||
      product.title?.toLowerCase().includes(style) ||
      product.description?.toLowerCase().includes(style)
    );
    score += styleMatches.length * 10;
  }
  
  // Room match
  if (attributes.room.length > 0) {
    const roomMatches = attributes.room.filter(room =>
      product.room?.toLowerCase().includes(room) ||
      product.title?.toLowerCase().includes(room) ||
      product.description?.toLowerCase().includes(room)
    );
    score += roomMatches.length * 8;
  }
  
  // Price match
  if (attributes.price_max && product.price <= attributes.price_max) {
    score += 10;
  }
  
  // Keyword relevance in title and description
  const productText = `${product.title} ${product.description}`.toLowerCase();
  const keywordMatches = attributes.keywords.filter(keyword => 
    productText.includes(keyword)
  );
  score += keywordMatches.length * 3;
  
  // Subcategory bonus for detailed matches
  if (intent.subcategory && product.subcategory?.toLowerCase().includes(intent.subcategory)) {
    score += 20;
  }
  
  return Math.min(score, 100);
}

async function generateExpertResponse(query: string, products: any[], context: any[], apiKey: string) {
  const productsContext = products.length > 0
    ? products.map(p => `• ${p.title} - ${p.price}€`).join('\n')
    : 'Aucun produit trouvé.';

  const systemPrompt = `Tu es OmnIA, conseiller déco Decora Home.
Réponds court (2 phrases max), engageant et humain.
Toujours proposer 1–2 produits si disponibles.
Produits dispo :
${productsContext}`;

  const messages = [
    { role: 'system', content: systemPrompt },
    ...context.slice(-2),
    { role: 'user', content: query }
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
    selectedProducts: products.slice(0, 2),
    should_show_products: products.length > 0
  };
}
