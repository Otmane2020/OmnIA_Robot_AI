const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
};

import { createClient } from 'npm:@supabase/supabase-js@2';

interface QuickChatRequest {
  message: string;
  conversation_history?: Array<{
    role: 'user' | 'assistant';
    content: string;
  }>;
  photo_context?: string; // base64 image
}

interface EnrichedProduct {
  id: string;
  handle: string;
  title: string;
  description: string;
  price: number;
  compare_at_price?: number;
  category: string;
  subcategory: string;
  color: string;
  material: string;
  fabric: string;
  style: string;
  dimensions: string;
  room: string;
  image_url: string;
  product_url: string;
  stock_qty: number;
  tags: string[];
  seo_title: string;
  seo_description: string;
  brand: string;
  confidence_score: number;
  variants?: ProductVariant[];
}

interface ProductVariant {
  id: string;
  title: string;
  color: string;
  price: number;
  compare_at_price?: number;
  image_url: string;
  stock_qty: number;
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { status: 200, headers: corsHeaders });
  }

  try {
    const { message, conversation_history = [], photo_context }: QuickChatRequest = await req.json();
    
    console.log('🤖 [quickchat] Message reçu:', message.substring(0, 50) + '...');

    // Initialize Supabase
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // 🧠 ÉTAPE 1: Analyser l'intention avec DeepSeek
    const searchIntent = await analyzeIntentWithDeepSeek(message, conversation_history);
    console.log('🎯 [quickchat] Intention:', searchIntent);

    // 📸 ÉTAPE 2: Analyser la photo si fournie avec OpenAI Vision
    let photoAnalysis = null;
    if (photo_context) {
      photoAnalysis = await analyzePhotoWithVision(photo_context);
      console.log('👁️ [quickchat] Analyse photo:', photoAnalysis?.style || 'Aucune');
    }

    // 🔍 ÉTAPE 3: Rechercher dans le catalogue enrichi Smart AI
    const enrichedProducts = await searchEnrichedCatalog(supabase, searchIntent, photoAnalysis);
    console.log('📦 [quickchat] Produits enrichis trouvés:', enrichedProducts.length);

    // 🎨 ÉTAPE 4: Créer des variantes pour les produits variables
    const productsWithVariants = await createProductVariants(enrichedProducts);
    console.log('🎨 [quickchat] Produits avec variantes:', productsWithVariants.length);

    // 🧠 ÉTAPE 5: Générer réponse intelligente avec DeepSeek
    const aiResponse = await generateIntelligentResponse(
      message, 
      productsWithVariants, 
      searchIntent, 
      photoAnalysis,
      conversation_history
    );

    return new Response(JSON.stringify({
      message: aiResponse.message,
      products: productsWithVariants.slice(0, 6), // Max 6 produits
      intent: searchIntent,
      photo_analysis: photoAnalysis,
      thinking_process: aiResponse.thinking_process
    }), { headers: { 'Content-Type': 'application/json', ...corsHeaders } });

  } catch (error) {
    console.error('❌ [quickchat] Erreur:', error);
    return new Response(JSON.stringify({
      message: "Désolé, je rencontre des difficultés techniques. Pouvez-vous reformuler ?",
      products: [],
      fallback: true
    }), { headers: { 'Content-Type': 'application/json', ...corsHeaders } });
  }
});

async function analyzeIntentWithDeepSeek(message: string, history: any[]) {
  const deepseekApiKey = Deno.env.get('DEEPSEEK_API_KEY');
  
  if (!deepseekApiKey) {
    return analyzeIntentBasic(message);
  }

  try {
    const historyContext = history.length > 0 ? 
      `CONTEXTE CONVERSATION:\n${history.slice(-2).map(h => `${h.role}: ${h.content}`).join('\n')}\n\n` : '';

    const prompt = `${historyContext}Analyse cette demande déco/mobilier et extrait l'intention au format JSON :

MESSAGE: "${message}"

Extrait au format JSON strict :
{
  "intent_type": "product_search|style_advice|room_planning|color_harmony|dimension_help",
  "target_category": "canapé|table|chaise|lit|rangement|decoration",
  "target_colors": ["beige", "gris", "blanc"],
  "target_materials": ["tissu", "bois", "métal", "travertin"],
  "target_styles": ["moderne", "scandinave", "contemporain"],
  "target_room": "salon|chambre|cuisine|bureau",
  "price_range": {"max": 800, "min": 100},
  "size_preference": "compact|standard|genereux",
  "special_features": ["convertible", "rangement", "modulaire"],
  "design_context": "Description du projet déco",
  "confidence": 85
}

RÈGLES:
- intent_type: Type principal de demande
- target_category: Catégorie de mobilier recherchée
- target_colors: Couleurs mentionnées ou souhaitées
- target_materials: Matériaux spécifiés
- target_styles: Styles décoratifs demandés
- target_room: Pièce de destination
- design_context: Résumé du projet déco en une phrase
- confidence: 0-100 basé sur la clarté

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
            content: 'Tu es un expert en analyse d\'intention déco et mobilier. Réponds uniquement en JSON valide.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        max_tokens: 400,
        temperature: 0.1,
      }),
    });

    if (response.ok) {
      const data = await response.json();
      const content = data.choices[0]?.message?.content?.trim();
      
      if (content) {
        try {
          const parsed = JSON.parse(content);
          console.log('✅ [quickchat] Intention DeepSeek extraite');
          return parsed;
        } catch (parseError) {
          console.log('⚠️ [quickchat] JSON invalide, fallback basique');
        }
      }
    }
  } catch (error) {
    console.log('⚠️ [quickchat] Erreur DeepSeek, fallback basique');
  }

  return analyzeIntentBasic(message);
}

function analyzeIntentBasic(message: string) {
  const lowerMessage = message.toLowerCase();
  
  // Détecter catégorie
  let target_category = null;
  if (lowerMessage.includes('canapé') || lowerMessage.includes('sofa')) target_category = 'canapé';
  else if (lowerMessage.includes('table')) target_category = 'table';
  else if (lowerMessage.includes('chaise') || lowerMessage.includes('avina')) target_category = 'chaise';
  else if (lowerMessage.includes('lit')) target_category = 'lit';

  // Détecter couleurs
  const colors = ['beige', 'gris', 'blanc', 'noir', 'bleu', 'vert', 'rouge', 'taupe', 'naturel'];
  const target_colors = colors.filter(color => lowerMessage.includes(color));

  // Détecter matériaux
  const materials = ['tissu', 'lin', 'bois', 'métal', 'travertin', 'marbre', 'velours', 'cuir'];
  const target_materials = materials.filter(material => lowerMessage.includes(material));

  // Détecter styles
  const styles = ['moderne', 'contemporain', 'scandinave', 'industriel', 'vintage'];
  const target_styles = styles.filter(style => lowerMessage.includes(style));

  return {
    intent_type: target_category ? 'product_search' : 'style_advice',
    target_category,
    target_colors,
    target_materials,
    target_styles,
    target_room: lowerMessage.includes('salon') ? 'salon' : lowerMessage.includes('chambre') ? 'chambre' : null,
    design_context: `Recherche ${target_category || 'mobilier'} ${target_colors.join(' ')} ${target_styles.join(' ')}`,
    confidence: target_category ? 80 : 50
  };
}

async function analyzePhotoWithVision(imageBase64: string) {
  const openaiApiKey = Deno.env.get('OPENAI_API_KEY');
  
  if (!openaiApiKey) {
    console.log('⚠️ [quickchat] OpenAI non configuré pour Vision');
    return null;
  }

  try {
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openaiApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o',
        messages: [
          {
            role: 'system',
            content: 'Tu es un expert en analyse visuelle d\'intérieur. Analyse cette photo et extrait les informations déco au format JSON.'
          },
          {
            role: 'user',
            content: [
              {
                type: "text",
                text: `Analyse cette photo d'intérieur et extrait au format JSON :
{
  "style_detected": "moderne|contemporain|scandinave|industriel|vintage",
  "dominant_colors": ["couleur1", "couleur2"],
  "materials_visible": ["matériau1", "matériau2"],
  "room_type": "salon|chambre|cuisine|bureau",
  "furniture_present": ["meuble1", "meuble2"],
  "missing_elements": ["élément1", "élément2"],
  "design_opportunities": "Description des améliorations possibles",
  "recommended_style": "Style recommandé pour harmoniser"
}

RÉPONSE JSON UNIQUEMENT:`
              },
              {
                type: "image_url",
                image_url: { url: `data:image/jpeg;base64,${imageBase64}` }
              }
            ]
          }
        ],
        max_tokens: 400,
        temperature: 0.1,
      }),
    });

    if (response.ok) {
      const data = await response.json();
      const content = data.choices[0]?.message?.content?.trim();
      
      if (content) {
        try {
          const analysis = JSON.parse(content);
          console.log('✅ [quickchat] Analyse Vision réussie');
          return analysis;
        } catch (parseError) {
          console.log('⚠️ [quickchat] JSON Vision invalide');
        }
      }
    }
  } catch (error) {
    console.log('⚠️ [quickchat] Erreur OpenAI Vision:', error);
  }

  return null;
}

async function searchEnrichedCatalog(supabase: any, intent: any, photoAnalysis: any) {
  try {
    console.log('🔍 [quickchat] Recherche dans catalogue enrichi...');

    // Construire la requête Smart AI
    let query = supabase
      .from('products_enriched')
      .select('*')
      .gt('stock_qty', 0)
      .order('confidence_score', { ascending: false });

    // Filtrage par catégorie
    if (intent.target_category) {
      query = query.or(`category.ilike.%${intent.target_category}%,subcategory.ilike.%${intent.target_category}%`);
    }

    // Filtrage par couleurs
    if (intent.target_colors?.length > 0) {
      const colorConditions = intent.target_colors.map(color => `color.ilike.%${color}%`).join(',');
      query = query.or(colorConditions);
    }

    // Filtrage par matériaux
    if (intent.target_materials?.length > 0) {
      const materialConditions = intent.target_materials.map(material => 
        `material.ilike.%${material}%,fabric.ilike.%${material}%`
      ).join(',');
      query = query.or(materialConditions);
    }

    // Filtrage par styles
    if (intent.target_styles?.length > 0) {
      const styleConditions = intent.target_styles.map(style => `style.ilike.%${style}%`).join(',');
      query = query.or(styleConditions);
    }

    // Filtrage par pièce
    if (intent.target_room) {
      query = query.ilike('room', `%${intent.target_room}%`);
    }

    // Filtrage par prix
    if (intent.price_range?.max) {
      query = query.lte('price', intent.price_range.max);
    }

    // Limiter les résultats
    query = query.limit(10);

    const { data: enrichedProducts, error } = await query;

    if (error) {
      console.error('❌ [quickchat] Erreur DB enriched:', error);
      return [];
    }

    console.log('✅ [quickchat] Produits enrichis trouvés:', enrichedProducts?.length || 0);
    return enrichedProducts || [];

  } catch (error) {
    console.error('❌ [quickchat] Erreur recherche enrichie:', error);
    return [];
  }
}

async function createProductVariants(products: EnrichedProduct[]) {
  const productsWithVariants = [];

  for (const product of products) {
    try {
      // Créer des variantes basées sur les couleurs disponibles
      const variants = await generateProductVariants(product);
      
      productsWithVariants.push({
        ...product,
        variants: variants
      });

    } catch (error) {
      console.error('❌ [quickchat] Erreur création variantes:', error);
      // Ajouter le produit sans variantes
      productsWithVariants.push(product);
    }
  }

  return productsWithVariants;
}

async function generateProductVariants(product: EnrichedProduct): Promise<ProductVariant[]> {
  // Exemple pour chaise AVINA avec plusieurs coloris
  if (product.title.toLowerCase().includes('avina') || product.title.toLowerCase().includes('chaise')) {
    const basePrice = product.price;
    const comparePrice = product.compare_at_price;
    
    return [
      {
        id: `${product.id}-beige`,
        title: `${product.title} - Beige`,
        color: 'Beige',
        price: basePrice,
        compare_at_price: comparePrice,
        image_url: product.image_url,
        stock_qty: Math.floor(product.stock_qty / 3) || 10
      },
      {
        id: `${product.id}-gris`,
        title: `${product.title} - Gris`,
        color: 'Gris',
        price: basePrice,
        compare_at_price: comparePrice,
        image_url: product.image_url.replace(/beige/gi, 'gris'),
        stock_qty: Math.floor(product.stock_qty / 3) || 8
      },
      {
        id: `${product.id}-anthracite`,
        title: `${product.title} - Anthracite`,
        color: 'Anthracite',
        price: basePrice,
        compare_at_price: comparePrice,
        image_url: product.image_url.replace(/beige/gi, 'anthracite'),
        stock_qty: Math.floor(product.stock_qty / 3) || 12
      }
    ];
  }

  // Pour les canapés ALYANA
  if (product.title.toLowerCase().includes('alyana') || product.title.toLowerCase().includes('canapé')) {
    const basePrice = product.price;
    
    return [
      {
        id: `${product.id}-beige`,
        title: `${product.title} - Beige`,
        color: 'Beige',
        price: basePrice,
        compare_at_price: product.compare_at_price,
        image_url: product.image_url,
        stock_qty: Math.floor(product.stock_qty / 3) || 15
      },
      {
        id: `${product.id}-taupe`,
        title: `${product.title} - Taupe`,
        color: 'Taupe',
        price: basePrice,
        compare_at_price: product.compare_at_price,
        image_url: product.image_url.replace(/beige/gi, 'taupe'),
        stock_qty: Math.floor(product.stock_qty / 3) || 12
      },
      {
        id: `${product.id}-bleu`,
        title: `${product.title} - Bleu`,
        color: 'Bleu',
        price: basePrice,
        compare_at_price: product.compare_at_price,
        image_url: product.image_url.replace(/beige/gi, 'bleu'),
        stock_qty: Math.floor(product.stock_qty / 3) || 10
      }
    ];
  }

  // Variante par défaut
  return [{
    id: `${product.id}-default`,
    title: product.title,
    color: product.color || 'Naturel',
    price: product.price,
    compare_at_price: product.compare_at_price,
    image_url: product.image_url,
    stock_qty: product.stock_qty
  }];
}

async function generateIntelligentResponse(
  message: string, 
  products: EnrichedProduct[], 
  intent: any, 
  photoAnalysis: any,
  history: any[]
) {
  const deepseekApiKey = Deno.env.get('DEEPSEEK_API_KEY');
  
  if (!deepseekApiKey) {
    return generateFallbackResponse(message, products, intent);
  }

  try {
    const productsContext = products.length > 0 ? 
      products.slice(0, 3).map(p => 
        `• ${p.title} - ${p.price}€ - ${p.color} ${p.material} - ${p.style} - Stock: ${p.stock_qty} - Confiance: ${p.confidence_score}%`
      ).join('\n') : 'Aucun produit correspondant trouvé.';

    const photoContext = photoAnalysis ? 
      `ANALYSE PHOTO: Style ${photoAnalysis.style_detected}, couleurs ${photoAnalysis.dominant_colors?.join(', ')}, pièce ${photoAnalysis.room_type}` : '';

    const systemPrompt = `Tu es OmnIA, conseiller déco expert et vendeur intelligent chez Decora Home.

MISSION: Conseiller comme un humain passionné de déco, comprendre le projet client, proposer intelligemment.

CATALOGUE SMART AI DISPONIBLE:
${productsContext}

${photoContext}

INTENTION CLIENT: ${intent.design_context || 'Recherche mobilier'}

PERSONNALITÉ:
- Conseiller déco passionné et expert
- Comprend les projets d'aménagement
- Propose des solutions harmonieuses
- Ton chaleureux et professionnel
- Réponses courtes et engageantes (3-4 phrases max)

APPROCHE:
1. Comprendre le projet déco global
2. Proposer 1-2 produits les plus pertinents avec variantes
3. Donner conseil déco personnalisé
4. Poser question de suivi engageante

RÈGLES:
- Si produits trouvés → Recommander avec prix, couleurs, arguments déco
- Si aucun produit → Conseils généraux et questions pour préciser
- Mentionner les variantes de couleur disponibles
- Utiliser les scores de confiance Smart AI
- Toujours finir par une question

EXEMPLE:
"Parfait pour votre salon ! Notre chaise AVINA en tissu effet lin (79€) existe en beige, gris et anthracite. Le beige s'harmoniserait parfaitement avec votre style moderne. Quelle couleur vous inspire le plus ?"`;

    const response = await fetch('https://api.deepseek.com/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${deepseekApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'deepseek-chat',
        messages: [
          { role: 'system', content: systemPrompt },
          ...history.slice(-2),
          { role: 'user', content: message }
        ],
        max_tokens: 200,
        temperature: 0.8,
      }),
    });

    if (response.ok) {
      const data = await response.json();
      const aiMessage = data.choices[0]?.message?.content || 'Comment puis-je vous aider ?';
      
      return {
        message: aiMessage,
        thinking_process: 'DeepSeek + Smart AI + Vision'
      };
    }
  } catch (error) {
    console.error('❌ [quickchat] Erreur DeepSeek response:', error);
  }

  return generateFallbackResponse(message, products, intent);
}

function generateFallbackResponse(message: string, products: EnrichedProduct[], intent: any) {
  if (products.length === 0) {
    if (intent.target_category) {
      return {
        message: `Je n'ai pas de ${intent.target_category} correspondant à vos critères actuellement. Voulez-vous que je vous propose des alternatives ou ajuster vos critères ?`,
        thinking_process: 'Fallback - aucun produit'
      };
    }
    return {
      message: "Pouvez-vous me préciser votre recherche ? Je suis là pour vous conseiller dans votre projet déco !",
      thinking_process: 'Fallback - demande générale'
    };
  }

  const product = products[0];
  const variantCount = product.variants?.length || 1;
  
  if (variantCount > 1) {
    const colors = product.variants?.map(v => v.color).join(', ') || '';
    return {
      message: `Parfait ! Notre ${product.title} à ${product.price}€ existe en ${variantCount} coloris : ${colors}. Quelle couleur préférez-vous ?`,
      thinking_process: 'Fallback - produit avec variantes'
    };
  } else {
    return {
      message: `Excellent choix ! Notre ${product.title} à ${product.price}€ correspond parfaitement. Voulez-vous voir les détails ?`,
      thinking_process: 'Fallback - produit simple'
    };
  }
}