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

  console.log('🚀 [quickchat] Function called');

  try {
    const { message, conversation_history = [], photo_context }: QuickChatRequest = await req.json();
    
    console.log('🤖 [quickchat] Message reçu:', message?.substring(0, 50) + '...');

    if (!message || typeof message !== 'string') {
      throw new Error('Message invalide');
    }

    // Initialize Supabase
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    
    if (!supabaseUrl || !supabaseKey) {
      console.error('❌ [quickchat] Configuration Supabase manquante');
      throw new Error('Configuration serveur manquante');
    }
    
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
    console.error('❌ [quickchat] Erreur complète:', error);
    
    return new Response(JSON.stringify({
      message: `Désolé, erreur technique: ${error instanceof Error ? error.message : 'Erreur inconnue'}. Pouvez-vous reformuler ?`,
      products: [],
      fallback: true,
      error: error instanceof Error ? error.message : 'Erreur inconnue'
    }), { 
      status: 500,
      headers: { 'Content-Type': 'application/json', ...corsHeaders } 
    });
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
    console.log('👁️ [quickchat] Analyse photo avec OpenAI Vision...');
    
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
            content: 'Tu es un expert en analyse visuelle d\'intérieur et conseiller déco. Analyse cette photo d\'espace et extrait TOUTES les informations visuelles pertinentes pour recommander des produits mobilier adaptés.'
          },
          {
            role: 'user',
            content: [
              {
                type: "text",
                text: `Analyse COMPLÈTEMENT cette photo d'intérieur et extrait au format JSON :
{
  "style_detected": "moderne|contemporain|scandinave|industriel|vintage|rustique|classique|minimaliste|bohème",
  "dominant_colors": ["couleur1", "couleur2", "couleur3"],
  "materials_visible": ["matériau1", "matériau2", "matériau3"],
  "room_type": "salon|chambre|cuisine|bureau",
  "furniture_present": ["meuble1", "meuble2", "meuble3"],
  "missing_elements": ["élément1", "élément2", "élément3"],
  "lighting_analysis": "Description de l'éclairage actuel",
  "space_size": "petit|moyen|grand",
  "layout_quality": "optimal|correct|à améliorer",
  "color_harmony": "harmonieuse|correcte|à revoir",
  "design_opportunities": "Description détaillée des améliorations possibles",
  "recommended_products": ["type de produit 1", "type de produit 2"],
  "budget_estimate": "budget|standard|premium",
  "style_consistency": "cohérent|partiellement cohérent|incohérent",
  "recommended_style": "Style recommandé pour harmoniser l'ensemble"
}

ANALYSE APPROFONDIE:
- Identifie TOUS les meubles visibles et leur état
- Évalue la cohérence stylistique globale
- Détecte les opportunités d'amélioration spécifiques
- Recommande des types de produits précis
- Estime le budget nécessaire pour les améliorations

RÉPONSE JSON UNIQUEMENT:`
              },
              {
                type: "image_url",
                image_url: { url: `data:image/jpeg;base64,${imageBase64}` }
              }
            ]
          }
        ],
        max_tokens: 600,
        temperature: 0.1,
      }),
    });

    if (response.ok) {
      const data = await response.json();
      const content = data.choices[0]?.message?.content?.trim();
      
      if (content) {
        try {
          const analysis = JSON.parse(content);
          console.log('✅ [quickchat] Analyse Vision réussie:', {
            style: analysis.style_detected,
            room: analysis.room_type,
            colors: analysis.dominant_colors?.length || 0,
            opportunities: analysis.design_opportunities?.substring(0, 50) + '...'
          });
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

    // Filtrage enrichi par analyse photo
    if (photoAnalysis) {
      // Filtrer par style détecté dans la photo
      if (photoAnalysis.style_detected) {
        query = query.ilike('style', `%${photoAnalysis.style_detected}%`);
      }
      
      // Filtrer par couleurs dominantes de la photo
      if (photoAnalysis.dominant_colors?.length > 0) {
        const colorConditions = photoAnalysis.dominant_colors.map(color => `color.ilike.%${color}%`).join(',');
        query = query.or(colorConditions);
      }
      
      // Filtrer par matériaux visibles dans la photo
      if (photoAnalysis.materials_visible?.length > 0) {
        const materialConditions = photoAnalysis.materials_visible.map(material => 
          `material.ilike.%${material}%,fabric.ilike.%${material}%`
        ).join(',');
        query = query.or(materialConditions);
      }
      
      // Filtrer par type de pièce
      if (photoAnalysis.room_type) {
        query = query.ilike('room', `%${photoAnalysis.room_type}%`);
      }
      
      // Filtrer par budget estimé
      if (photoAnalysis.budget_estimate) {
        if (photoAnalysis.budget_estimate === 'budget') {
          query = query.lte('price', 150);
        } else if (photoAnalysis.budget_estimate === 'premium') {
          query = query.gte('price', 500);
        }
      }
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
    query = query.limit(8);

    const { data: enrichedProducts, error } = await query;

    if (error) {
      console.error('❌ [quickchat] Erreur DB enriched:', error);
      return [];
    }

    console.log('✅ [quickchat] Produits Smart AI trouvés:', enrichedProducts?.length || 0);
    
    // Si aucun produit enrichi trouvé, créer des produits de démonstration enrichis
    if (!enrichedProducts || enrichedProducts.length === 0) {
      console.log('🔄 [quickchat] Création produits démo enrichis...');
      return createDemoEnrichedProducts(intent, photoAnalysis);
    }
    
    return enrichedProducts || [];

  } catch (error) {
    console.error('❌ [quickchat] Erreur recherche enrichie:', error);
    return createDemoEnrichedProducts(intent, photoAnalysis);
  }
}

async function createProductVariants(products: EnrichedProduct[]) {
  const productsWithVariants = [];

  for (const product of products) {
    try {
      // Créer des variantes basées sur les attributs enrichis
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
  // Générer des variantes basées sur TOUS les attributs enrichis disponibles
  const baseTitle = product.title;
  const basePrice = product.price;
  const comparePrice = product.compare_at_price;
  
  // Exploiter les attributs Smart AI pour créer des variantes intelligentes
  const productColors = product.color ? [product.color] : [];
  const productMaterials = product.material ? [product.material] : [];
  const productDimensions = product.dimensions ? [product.dimensions] : [];
  
  // Chaises AVINA avec variantes de couleur
  if (baseTitle.toLowerCase().includes('avina') || baseTitle.toLowerCase().includes('chaise')) {
    // Utiliser les couleurs détectées par Smart AI ou fallback
    const availableColors = productColors.length > 0 ? 
      [...productColors, 'Beige', 'Gris', 'Anthracite'].slice(0, 3) : 
      ['Beige', 'Gris', 'Anthracite'];
    const stockPerVariant = Math.floor(product.stock_qty / availableColors.length) || 10;
    
    return availableColors.map((color, index) => ({
      id: `${product.id}-${color.toLowerCase()}`,
      title: `Chaise AVINA - ${color} ${product.material ? `en ${product.material}` : ''}`,
      color: color,
      price: basePrice,
      compare_at_price: comparePrice,
      image_url: getVariantImageUrl(product.image_url, color),
      stock_qty: stockPerVariant,
      material: product.material || 'Tissu effet lin',
      style: product.style || 'Moderne',
      dimensions: product.dimensions || '45x52x82cm'
    }));
  }

  // Canapés ALYANA avec variantes de couleur
  if (baseTitle.toLowerCase().includes('alyana') || baseTitle.toLowerCase().includes('canapé')) {
    const availableColors = productColors.length > 0 ? 
      [...productColors, 'Beige', 'Taupe', 'Bleu'].slice(0, 3) : 
      ['Beige', 'Taupe', 'Bleu'];
    const stockPerVariant = Math.floor(product.stock_qty / availableColors.length) || 15;
    
    return availableColors.map((color, index) => ({
      id: `${product.id}-${color.toLowerCase()}`,
      title: `Canapé ALYANA - ${color} ${product.material ? `en ${product.material}` : 'velours côtelé'}`,
      color: color,
      price: basePrice,
      compare_at_price: comparePrice,
      image_url: getVariantImageUrl(product.image_url, color),
      stock_qty: stockPerVariant,
      material: product.material || 'Velours côtelé',
      style: product.style || 'Convertible',
      dimensions: product.dimensions || '263x105x93cm'
    }));
  }

  // Tables AUREA avec variantes de taille
  if (baseTitle.toLowerCase().includes('aurea') || baseTitle.toLowerCase().includes('table')) {
    // Utiliser les dimensions détectées par Smart AI
    const detectedSizes = product.dimensions ? 
      [{ size: product.dimensions, price: basePrice, title: product.dimensions }] :
      [
        { size: 'Ø100cm', price: basePrice, title: 'Ø100cm' },
        { size: 'Ø120cm', price: basePrice + 50, title: 'Ø120cm' }
      ];
      
    const availableSizes = [
      { size: 'Ø100cm', price: basePrice, title: 'Ø100cm' },
      { size: 'Ø120cm', price: basePrice + 50, title: 'Ø120cm' }
    ];
    const stockPerVariant = Math.floor(product.stock_qty / detectedSizes.length) || 20;
    
    return detectedSizes.map((variant, index) => ({
      id: `${product.id}-${variant.size.replace(/[^a-z0-9]/gi, '')}`,
      title: `Table AUREA ${variant.title} - ${product.material || 'Travertin naturel'}`,
      color: product.color || 'Naturel',
      price: variant.price,
      compare_at_price: comparePrice ? comparePrice + (variant.price - basePrice) : undefined,
      image_url: product.image_url,
      stock_qty: stockPerVariant,
      material: product.material || 'Travertin naturel',
      style: product.style || 'Contemporain',
      dimensions: variant.size
    }));
  }

  // Tables basses avec variantes enrichies Smart AI
  if (baseTitle.toLowerCase().includes('lina') || baseTitle.toLowerCase().includes('noa') || 
      (baseTitle.toLowerCase().includes('table') && baseTitle.toLowerCase().includes('basse'))) {
    const availableFinishes = product.material ? 
      [product.material, 'Chêne clair', 'Verre trempé'].slice(0, 2) :
      ['Chêne clair', 'Verre trempé'];
    const stockPerVariant = Math.floor(product.stock_qty / availableFinishes.length) || 15;
    
    return availableFinishes.map((finish, index) => ({
      id: `${product.id}-${finish.toLowerCase().replace(/\s+/g, '')}`,
      title: `${baseTitle} - ${finish}`,
      color: product.color || 'Naturel',
      price: basePrice,
      compare_at_price: comparePrice,
      image_url: getVariantImageUrl(product.image_url, finish),
      stock_qty: stockPerVariant,
      material: finish,
      style: product.style || 'Moderne',
      dimensions: product.dimensions || '90x45x40cm'
    }));
  }

  // Variante par défaut si aucune logique spécifique
  return [{
    id: `${product.id}-default`,
    title: baseTitle,
    color: product.color || 'Naturel',
    price: basePrice,
    compare_at_price: comparePrice,
    image_url: product.image_url,
    stock_qty: product.stock_qty,
    material: product.material || '',
    style: product.style || '',
    dimensions: product.dimensions || ''
  }];
}

function getVariantImageUrl(baseImageUrl: string, color: string): string {
  // Simuler des URLs d'images différentes pour chaque couleur
  // En production, vous auriez des vraies images pour chaque variante
  const colorMappings: { [key: string]: string } = {
    'Beige': baseImageUrl,
    'Gris': baseImageUrl.replace(/beige/gi, 'gris'),
    'Anthracite': baseImageUrl.replace(/beige/gi, 'anthracite'),
    'Taupe': baseImageUrl.replace(/beige/gi, 'taupe'),
    'Bleu': baseImageUrl.replace(/beige/gi, 'bleu')
  };
  
  return colorMappings[color] || baseImageUrl;
}

async function generateIntelligentResponse(
  message: string, 
  productsWithVariants: EnrichedProduct[], 
  intent: any, 
  photoAnalysis: any,
  history: any[]
) {
  const deepseekApiKey = Deno.env.get('DEEPSEEK_API_KEY');
  
  if (!deepseekApiKey) {
    return generateFallbackResponse(message, productsWithVariants, intent);
  }

  try {
    const productsContext = productsWithVariants.length > 0 ? 
      productsWithVariants.slice(0, 3).map(p => {
        const variantInfo = p.variants && p.variants.length > 1 ? 
          ` (${p.variants.length} variantes: ${p.variants.map(v => v.color).join(', ')})` : '';
        const priceInfo = p.compare_at_price ? 
          ` (était ${p.compare_at_price}€, -${Math.round(((p.compare_at_price - p.price) / p.compare_at_price) * 100)}%)` : '';
        return `• ${p.title} - ${p.price}€${priceInfo} - ${p.subcategory || p.category} - Couleur: ${p.color} - Matériau: ${p.material} - Style: ${p.style} - Dimensions: ${p.dimensions} - Pièce: ${p.room} - Stock: ${p.stock_qty}${variantInfo} - Smart AI: ${p.confidence_score}%`;
      }).join('\n') : 'Aucun produit correspondant trouvé dans le catalogue Smart AI.';

    const photoContext = photoAnalysis ? 
      `ANALYSE PHOTO OPENAI VISION:
Style détecté: ${photoAnalysis.style_detected}
Couleurs dominantes: ${photoAnalysis.dominant_colors?.join(', ')}
Matériaux visibles: ${photoAnalysis.materials_visible?.join(', ')}
Type de pièce: ${photoAnalysis.room_type}
Meubles présents: ${photoAnalysis.furniture_present?.join(', ')}
Éléments manquants: ${photoAnalysis.missing_elements?.join(', ')}
Opportunités déco: ${photoAnalysis.design_opportunities}
Taille espace: ${photoAnalysis.space_size}
Qualité aménagement: ${photoAnalysis.layout_quality}
Harmonie couleurs: ${photoAnalysis.color_harmony}
Budget estimé: ${photoAnalysis.budget_estimate}
Cohérence style: ${photoAnalysis.style_consistency}
Style recommandé: ${photoAnalysis.recommended_style}` : '';

    const systemPrompt = `Tu es OmnIA, conseiller déco expert et vendeur intelligent chez Decora Home avec Smart AI.

MISSION: Conseiller comme un humain passionné de déco, exploiter l'analyse photo OpenAI Vision et les attributs Smart AI pour proposer intelligemment.

CATALOGUE SMART AI ENRICHI DISPONIBLE:
${productsContext}

${photoContext}

INTENTION CLIENT ANALYSÉE: ${intent.design_context || 'Recherche mobilier'}
CONTEXTE CONVERSATION: ${history.length > 0 ? 'Suite de conversation' : 'Première interaction'}

PERSONNALITÉ:
- Conseiller déco passionné et expert
- Exploite l'analyse photo pour comprendre l'espace
- Utilise les attributs Smart AI (couleur, matériau, style, dimensions, sous-catégorie)
- Propose des solutions harmonieuses et personnalisées
- Ton chaleureux et professionnel
- Réponses courtes et engageantes (2-3 phrases max)

APPROCHE:
1. Comprendre le projet déco global (photo + intention)
2. Proposer 1-2 produits Smart AI les plus pertinents avec variantes et attributs
3. Donner conseil déco personnalisé basé sur l'analyse
4. Poser question de suivi engageante

RÈGLES:
- Si produits Smart AI trouvés → Recommander avec prix, variantes, attributs enrichis (couleur, matériau, style, dimensions)
- Si analyse photo → Intégrer les insights visuels dans les recommandations
- Si aucun produit → Conseils généraux basés sur l'analyse photo
- Mentionner les variantes disponibles avec leurs spécificités
- Utiliser les scores de confiance Smart AI et sous-catégories
- Toujours finir par une question
- Exploiter les promotions et prix barrés

EXEMPLE:
"Super ! Pour accompagner votre style, voici mes coups de cœur **Smart AI** :

**TOP 2 SMART AI** :
• **Table basse LINA** (89€) - Plateau bois chêne clair, design épuré
• **Table basse NOA** (79€) - Verre trempé et métal, effet aérien

Les deux existent en plusieurs finitions pour s'accorder avec votre style. La LINA apporterait une touche naturelle très tendance !

**Petite question** : Préférez-vous une table ronde ou rectangulaire pour votre espace ?"`;

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
        max_tokens: 250,
        temperature: 0.8,
      }),
    });

    if (response.ok) {
      const data = await response.json();
      const aiMessage = data.choices[0]?.message?.content || 'Comment puis-je vous aider ?';
      
      return {
        message: aiMessage,
        thinking_process: 'DeepSeek + Smart AI + OpenAI Vision + Attributs enrichis'
      };
    }
  } catch (error) {
    console.error('❌ [quickchat] Erreur DeepSeek response:', error);
  }

  return generateFallbackResponse(message, productsWithVariants, intent);
}

function createDemoEnrichedProducts(intent: any, photoAnalysis: any): EnrichedProduct[] {
  // Créer des produits démo enrichis basés sur l'intention et l'analyse photo
  const demoProducts: EnrichedProduct[] = [];
  
  // Chaise AVINA enrichie
  if (!intent.target_category || intent.target_category === 'chaise' || 
      (photoAnalysis?.missing_elements?.includes('chaise') || photoAnalysis?.recommended_products?.includes('chaise'))) {
    demoProducts.push({
      id: 'demo-avina-enriched',
      handle: 'chaise-avina-tissu-effet-lin',
      title: 'Chaise AVINA - Tissu effet lin avec pieds métal noir',
      description: 'Chaise moderne en tissu effet lin beige avec pieds en métal noir mat. Design épuré et contemporain, parfaite pour salon ou salle à manger. Structure solide et confortable.',
      price: 79,
      compare_at_price: 99,
      category: 'Chaise',
      subcategory: 'Chaise de salle à manger en tissu effet lin avec pieds métal noir',
      color: 'beige',
      material: 'tissu effet lin',
      fabric: 'tissu effet lin',
      style: 'moderne',
      dimensions: '45x52x82cm',
      room: 'salon',
      image_url: 'https://images.pexels.com/photos/1350789/pexels-photo-1350789.jpeg',
      product_url: '#chaise-avina',
      stock_qty: 96,
      tags: ['chaise', 'tissu effet lin', 'métal noir', 'moderne', 'beige', 'salon', 'salle à manger'],
      seo_title: 'Chaise AVINA - Tissu effet lin beige avec pieds métal noir',
      seo_description: 'Chaise moderne AVINA en tissu effet lin beige avec pieds métal noir. Design épuré pour salon et salle à manger.',
      brand: 'Decora Home',
      confidence_score: 92,
      variants: [
        {
          id: 'avina-beige',
          title: 'Beige',
          color: 'beige',
          price: 79,
          compare_at_price: 99,
          image_url: 'https://images.pexels.com/photos/1350789/pexels-photo-1350789.jpeg',
          stock_qty: 32
        },
        {
          id: 'avina-gris',
          title: 'Gris',
          color: 'gris',
          price: 79,
          compare_at_price: 99,
          image_url: 'https://images.pexels.com/photos/586763/pexels-photo-586763.jpeg',
          stock_qty: 28
        },
        {
          id: 'avina-anthracite',
          title: 'Anthracite',
          color: 'anthracite',
          price: 79,
          compare_at_price: 99,
          image_url: 'https://images.pexels.com/photos/1866149/pexels-photo-1866149.jpeg',
          stock_qty: 36
        }
      ]
    });
  }
  
  // Table basse LINA enrichie
  if (!intent.target_category || intent.target_category === 'table' || 
      (photoAnalysis?.missing_elements?.includes('table') || photoAnalysis?.recommended_products?.includes('table basse'))) {
    demoProducts.push({
      id: 'demo-lina-enriched',
      handle: 'table-basse-lina-chene-clair',
      title: 'Table basse LINA - Chêne clair design scandinave',
      description: 'Table basse ronde LINA en chêne clair massif avec plateau épuré et pieds fuselés. Design scandinave authentique, finition naturelle huilée. Parfaite pour salon moderne.',
      price: 89,
      compare_at_price: 119,
      category: 'Table',
      subcategory: 'Table basse ronde en chêne clair massif avec pieds fuselés',
      color: 'chêne clair',
      material: 'chêne massif',
      fabric: '',
      style: 'scandinave',
      dimensions: '90x90x40cm',
      room: 'salon',
      image_url: 'https://images.pexels.com/photos/1571460/pexels-photo-1571460.jpeg',
      product_url: '#table-lina',
      stock_qty: 45,
      tags: ['table basse', 'chêne clair', 'scandinave', 'ronde', 'salon', 'naturel', 'épuré'],
      seo_title: 'Table basse LINA ronde - Chêne clair massif design scandinave',
      seo_description: 'Table basse LINA ronde en chêne clair massif. Design scandinave avec pieds fuselés. Finition naturelle.',
      brand: 'Decora Home',
      confidence_score: 88,
      variants: [
        {
          id: 'lina-chene-clair',
          title: 'Chêne clair',
          color: 'chêne clair',
          price: 89,
          compare_at_price: 119,
          image_url: 'https://images.pexels.com/photos/1571460/pexels-photo-1571460.jpeg',
          stock_qty: 25
        },
        {
          id: 'lina-chene-fonce',
          title: 'Chêne foncé',
          color: 'chêne foncé',
          price: 89,
          compare_at_price: 119,
          image_url: 'https://images.pexels.com/photos/1866149/pexels-photo-1866149.jpeg',
          stock_qty: 20
        }
      ]
    });
  }
  
  // Table basse NOA enrichie
  if (!intent.target_category || intent.target_category === 'table' || 
      (photoAnalysis?.style_detected === 'moderne' || photoAnalysis?.materials_visible?.includes('verre'))) {
    demoProducts.push({
      id: 'demo-noa-enriched',
      handle: 'table-basse-noa-verre-metal',
      title: 'Table basse NOA - Verre trempé et métal noir effet aérien',
      description: 'Table basse rectangulaire NOA en verre trempé transparent avec structure métal noir mat. Design moderne et aérien, parfaite pour salon contemporain. Verre sécurisé 8mm.',
      price: 79,
      compare_at_price: 109,
      category: 'Table',
      subcategory: 'Table basse rectangulaire en verre trempé avec structure métal noir',
      color: 'transparent',
      material: 'verre trempé',
      fabric: '',
      style: 'moderne',
      dimensions: '100x50x35cm',
      room: 'salon',
      image_url: 'https://images.pexels.com/photos/1866149/pexels-photo-1866149.jpeg',
      product_url: '#table-noa',
      stock_qty: 32,
      tags: ['table basse', 'verre trempé', 'métal noir', 'moderne', 'rectangulaire', 'salon', 'aérien'],
      seo_title: 'Table basse NOA rectangulaire - Verre trempé et métal noir moderne',
      seo_description: 'Table basse NOA en verre trempé transparent avec métal noir. Design moderne aérien pour salon.',
      brand: 'Decora Home',
      confidence_score: 85,
      variants: [
        {
          id: 'noa-verre-noir',
          title: 'Verre + Métal noir',
          color: 'transparent',
          price: 79,
          compare_at_price: 109,
          image_url: 'https://images.pexels.com/photos/1866149/pexels-photo-1866149.jpeg',
          stock_qty: 18
        },
        {
          id: 'noa-verre-chrome',
          title: 'Verre + Chrome',
          color: 'transparent',
          price: 89,
          compare_at_price: 119,
          image_url: 'https://images.pexels.com/photos/1571460/pexels-photo-1571460.jpeg',
          stock_qty: 14
        }
      ]
    });
  }
  
  console.log('✅ [quickchat] Produits démo enrichis créés:', demoProducts.length);
  return demoProducts;
}

function generateFallbackResponse(message: string, products: EnrichedProduct[], intent: any) {
  if (products.length === 0) {
    if (intent.target_category) {
      return {
        message: `Je n'ai pas de ${intent.target_category} correspondant à vos critères dans notre catalogue Smart AI actuellement. Voulez-vous que je vous propose des alternatives ou ajuster vos critères ?`,
        thinking_process: 'Fallback - aucun produit'
      };
    }
    return {
      message: "Pouvez-vous me préciser votre recherche ? Je suis là pour vous conseiller dans votre projet déco avec Smart AI !",
      thinking_process: 'Fallback - demande générale'
    };
  }

  const product = products[0];
  const variantCount = product.variants?.length || 1;
  const hasPromotion = product.compare_at_price && product.compare_at_price > product.price;
  const discountPercent = hasPromotion ? Math.round(((product.compare_at_price! - product.price) / product.compare_at_price!) * 100) : 0;
  
  if (variantCount > 1) {
    const colors = product.variants?.map(v => `${v.color} (${v.price}€)`).join(', ') || '';
    return {
      message: `Parfait ! Notre **${product.title}** ${hasPromotion ? `(${product.price}€, était ${product.compare_at_price}€, -${discountPercent}%)` : `à ${product.price}€`} existe en ${variantCount} variantes : ${colors}. 
      
**Smart AI** : ${product.subcategory} - ${product.material} ${product.color} - Style ${product.style}

Quelle variante vous inspire le plus ?`,
      thinking_process: 'Fallback - produit avec variantes'
    };
  } else {
    return {
      message: `Excellent choix ! Notre **${product.title}** ${hasPromotion ? `(${product.price}€, était ${product.compare_at_price}€, -${discountPercent}%)` : `à ${product.price}€`} correspond parfaitement.
      
**Smart AI** : ${product.subcategory} - ${product.material} ${product.color} - Dimensions: ${product.dimensions}

Voulez-vous voir les détails ou ajouter au panier ?`,
      thinking_process: 'Fallback - produit simple'
    };
  }
}