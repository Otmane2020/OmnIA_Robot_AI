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

interface MessageAnalysis {
  intent: 'product_search' | 'chat' | 'faq';
  attributes: {
    category?: string;
    color?: string;
    material?: string;
    style?: string;
    room?: string;
    price_max?: number;
    dimensions?: string;
  };
  response: string;
  confidence: number;
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

  console.log('🚀 [intelligent-quickchat] Function called');

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
    const messageAnalysis = await analyzeMessage(message, conversation_history);
    console.log('🎯 [quickchat] Intention:', messageAnalysis.intent, messageAnalysis.attributes);

    // 📸 ÉTAPE 2: Analyser la photo si fournie avec OpenAI Vision
    let photoAnalysis = null;
    if (photo_context) {
      photoAnalysis = await analyzePhotoWithVision(photo_context);
      console.log('👁️ [quickchat] Analyse photo:', photoAnalysis?.style_detected || 'Aucune');
    }

    // 🔍 ÉTAPE 3: Traitement selon l'intention
    let finalResponse;
    
    if (messageAnalysis.intent === 'product_search') {
      // Rechercher dans le catalogue enrichi Smart AI
      const enrichedProducts = await searchProductsEnriched(supabase, messageAnalysis.attributes, photoAnalysis);
      console.log('📦 [quickchat] Produits enrichis trouvés:', enrichedProducts.length);

      // Créer des variantes pour les produits variables
      const productsWithVariants = await createProductVariants(enrichedProducts);
      console.log('🎨 [quickchat] Produits avec variantes:', productsWithVariants.length);

      finalResponse = {
        message: messageAnalysis.response,
        products: productsWithVariants.slice(0, 6),
        intent: messageAnalysis.intent,
        photo_analysis: photoAnalysis
      };
    } else if (messageAnalysis.intent === 'faq') {
      // Rechercher dans la FAQ
      const faqResponse = await searchFAQ(message);
      finalResponse = {
        message: faqResponse || messageAnalysis.response,
        products: [],
        intent: messageAnalysis.intent
      };
    } else {
      // Chat général - pas de produits
      finalResponse = {
        message: messageAnalysis.response,
        products: [],
        intent: messageAnalysis.intent
      };
    }

    return new Response(JSON.stringify(finalResponse), { 
      headers: { 'Content-Type': 'application/json', ...corsHeaders } 
    });

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

async function analyzeMessage(message: string, history: any[]): Promise<MessageAnalysis> {
  const deepseekApiKey = Deno.env.get('DEEPSEEK_API_KEY');
  
  if (!deepseekApiKey) {
    return analyzeMessageBasic(message);
  }

  try {
    const historyContext = history.length > 0 ? 
      `CONTEXTE CONVERSATION:\n${history.slice(-2).map(h => `${h.role}: ${h.content}`).join('\n')}\n\n` : '';

    const prompt = `${historyContext}Analyse ce message et détermine l'intention au format JSON strict :

MESSAGE: "${message}"

Extrait au format JSON strict :
{
  "intent": "product_search|chat|faq",
  "attributes": {
    "category": "canapé|table|chaise|lit|rangement|decoration",
    "color": "beige|gris|blanc|noir|bleu|vert|rouge|taupe|naturel",
    "material": "tissu|bois|métal|travertin|velours|cuir|verre",
    "style": "moderne|scandinave|contemporain|industriel|vintage",
    "room": "salon|chambre|cuisine|bureau",
    "price_max": 500,
    "dimensions": "dimensions mentionnées"
  },
  "response": "Réponse appropriée selon l'intention",
  "confidence": 85
}

RÈGLES D'INTENTION:
- **product_search**: Mention de meubles (canapé, table, chaise), couleurs, matériaux, styles, "je cherche", "je veux"
- **faq**: Questions sur livraison, garantie, retour, paiement, magasin, horaires, "comment", "où", "quand"
- **chat**: Salutations, questions générales, compliments, "bonjour", "merci", "qui êtes-vous"

RÉPONSES SELON INTENTION:
- product_search: "Parfait ! Voici nos [catégorie] [attributs] 👇" (court, max 15 mots)
- chat: Réponse conversationnelle chaleureuse (50-80 mots max)
- faq: Réponse informative pratique (40-60 mots)

EXEMPLES:
- "Je cherche un canapé beige" → intent: product_search, response: "Parfait ! Voici nos canapés beiges 👇"
- "Bonjour, comment allez-vous ?" → intent: chat, response: "Bonjour ! Je suis OmnIA 🤖 votre conseiller mobilier chez Decora Home. Ravi de vous rencontrer ! Comment puis-je vous aider pour votre projet déco ?"
- "La livraison est gratuite ?" → intent: faq, response: "Oui ! Livraison gratuite en France métropolitaine sous 7-10 jours 🚚"

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
            content: 'Tu es un expert en analyse d\'intention pour assistant mobilier. Réponds uniquement en JSON valide.'
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
          console.log('✅ [quickchat] Intention DeepSeek extraite:', parsed.intent);
          return {
            intent: parsed.intent,
            attributes: parsed.attributes || {},
            response: parsed.response || '',
            confidence: parsed.confidence || 50
          };
        } catch (parseError) {
          console.log('⚠️ [quickchat] JSON invalide, fallback basique');
        }
      }
    }
  } catch (error) {
    console.log('⚠️ [quickchat] Erreur DeepSeek, fallback basique');
  }

  return analyzeMessageBasic(message);
}

function analyzeMessageBasic(message: string): MessageAnalysis {
  const lowerMessage = message.toLowerCase();
  
  // Détection FAQ
  const faqKeywords = [
    'livraison', 'delivery', 'gratuite', 'délai', 'transport',
    'garantie', 'warranty', 'retour', 'échange', 'remboursement',
    'paiement', 'payment', 'carte', 'paypal', 'virement',
    'magasin', 'showroom', 'adresse', 'horaires', 'ouvert',
    'comment', 'où', 'quand', 'combien de temps'
  ];
  
  if (faqKeywords.some(keyword => lowerMessage.includes(keyword))) {
    return {
      intent: 'faq',
      attributes: {},
      response: generateFAQResponse(lowerMessage),
      confidence: 80
    };
  }
  
  // Détection salutations et chat général
  const chatKeywords = [
    'bonjour', 'salut', 'hello', 'bonsoir', 'coucou', 'hey',
    'merci', 'thank', 'au revoir', 'bye',
    'qui êtes-vous', 'qui es-tu', 'comment allez-vous',
    'ça va', 'comment ça va', 'quoi de neuf'
  ];
  
  if (chatKeywords.some(keyword => lowerMessage.includes(keyword))) {
    return {
      intent: 'chat',
      attributes: {},
      response: generateChatResponse(lowerMessage),
      confidence: 90
    };
  }
  
  // Détection recherche produit
  const productKeywords = [
    'canapé', 'sofa', 'table', 'chaise', 'fauteuil', 'lit', 'matelas',
    'armoire', 'commode', 'meuble', 'mobilier',
    'je cherche', 'je veux', 'j\'aimerais', 'montrez-moi',
    'avez-vous', 'proposez-vous', 'vendez-vous'
  ];
  
  if (productKeywords.some(keyword => lowerMessage.includes(keyword))) {
    const attributes = extractAttributesBasic(lowerMessage);
    return {
      intent: 'product_search',
      attributes,
      response: generateProductSearchResponse(attributes),
      confidence: 75
    };
  }
  
  // Par défaut = chat
  return {
    intent: 'chat',
    attributes: {},
    response: "Avec plaisir ! Comment puis-je vous aider pour votre projet déco ? 😊",
    confidence: 50
  };
}

function extractAttributesBasic(message: string) {
  const attributes: any = {};
  
  // Catégories
  if (message.includes('canapé') || message.includes('sofa')) attributes.category = 'canapé';
  else if (message.includes('table')) attributes.category = 'table';
  else if (message.includes('chaise') || message.includes('fauteuil')) attributes.category = 'chaise';
  else if (message.includes('lit')) attributes.category = 'lit';
  
  // Couleurs
  const colors = ['beige', 'gris', 'blanc', 'noir', 'bleu', 'vert', 'rouge', 'taupe', 'naturel'];
  const foundColor = colors.find(color => message.includes(color));
  if (foundColor) attributes.color = foundColor;
  
  // Matériaux
  const materials = ['tissu', 'bois', 'métal', 'travertin', 'velours', 'cuir', 'verre'];
  const foundMaterial = materials.find(material => message.includes(material));
  if (foundMaterial) attributes.material = foundMaterial;
  
  // Styles
  const styles = ['moderne', 'scandinave', 'contemporain', 'industriel', 'vintage'];
  const foundStyle = styles.find(style => message.includes(style));
  if (foundStyle) attributes.style = foundStyle;
  
  // Pièces
  if (message.includes('salon')) attributes.room = 'salon';
  else if (message.includes('chambre')) attributes.room = 'chambre';
  else if (message.includes('cuisine')) attributes.room = 'cuisine';
  else if (message.includes('bureau')) attributes.room = 'bureau';
  
  // Prix
  const priceMatch = message.match(/sous (\d+)/);
  if (priceMatch) attributes.price_max = parseInt(priceMatch[1]);
  
  return attributes;
}

function generateChatResponse(message: string): string {
  const lowerMessage = message.toLowerCase();
  
  if (lowerMessage.includes('bonjour') || lowerMessage.includes('salut') || lowerMessage.includes('hello')) {
    return "Bonjour ! Je suis OmnIA 🤖 votre conseiller mobilier chez Decora Home. Ravi de vous rencontrer ! Comment puis-je vous aider pour votre projet déco ?";
  }
  
  if (lowerMessage.includes('merci')) {
    return "Avec grand plaisir ! 😊 C'est un bonheur de vous accompagner dans votre projet déco. Autre chose pour embellir votre intérieur ?";
  }
  
  if (lowerMessage.includes('qui êtes-vous') || lowerMessage.includes('qui es-tu')) {
    return "Je suis OmnIA 🤖 votre assistant robot spécialisé en mobilier et décoration chez Decora Home ! Je connais parfaitement notre catalogue et je suis là pour vous conseiller. Quel est votre projet ?";
  }
  
  if (lowerMessage.includes('comment allez-vous') || lowerMessage.includes('ça va')) {
    return "Ça va très bien, merci ! 😊 Je suis en pleine forme pour vous aider à créer l'intérieur de vos rêves. Parlez-moi de votre projet déco !";
  }
  
  return "Avec plaisir ! Je suis là pour vous accompagner dans tous vos projets mobilier et déco. Que puis-je faire pour vous aujourd'hui ? 😊";
}

function generateFAQResponse(message: string): string {
  if (message.includes('livraison')) {
    return "Livraison gratuite en France métropolitaine sous 7-10 jours ouvrés 🚚 Express 48h disponible. Montage inclus sur demande !";
  }
  
  if (message.includes('garantie')) {
    return "Tous nos meubles sont garantis 2 ans pièces et main d'œuvre 🛡️ Extension possible jusqu'à 5 ans. SAV réactif !";
  }
  
  if (message.includes('retour') || message.includes('échange')) {
    return "Retour gratuit sous 30 jours si non satisfait 📦 Échange possible selon stock. Remboursement intégral garanti !";
  }
  
  if (message.includes('paiement')) {
    return "Paiement sécurisé : CB, PayPal, virement 💳 Facilités 3x sans frais dès 300€. Paiement à la livraison possible !";
  }
  
  if (message.includes('magasin') || message.includes('showroom')) {
    return "Showroom Paris 15ème, ouvert Mar-Sam 10h-19h 🏪 Rendez-vous conseiller gratuit. Adresse : 123 rue de Vaugirard !";
  }
  
  return "Je peux vous renseigner sur la livraison, garantie, retours, paiement ou nos showrooms 👍 Que souhaitez-vous savoir ?";
}

function generateProductSearchResponse(attributes: any): string {
  const { category, color, material, style } = attributes;
  
  if (category && color) {
    return `Parfait ! Voici nos ${category}s ${color}s ${material ? `en ${material}` : ''} 👇`;
  }
  
  if (category) {
    return `Excellent choix ! Voici notre sélection ${category}s ${style ? style : ''} 👇`;
  }
  
  if (color || material) {
    return `Super ! Voici nos meubles ${color || ''} ${material ? `en ${material}` : ''} 👇`;
  }
  
  return "Voici ce que j'ai trouvé pour vous 👇";
}

async function searchProductsEnriched(supabase: any, attributes: any, photoAnalysis: any) {
  try {
    console.log('🔍 [quickchat] Recherche dans catalogue enrichi...');

    // Construire la requête Smart AI
    let query = supabase
      .from('products_enriched')
      .select('*')
      .gt('stock_qty', 0)
      .order('confidence_score', { ascending: false });

    // Filtrage par catégorie
    if (attributes.category) {
      query = query.or(`category.ilike.%${attributes.category}%,subcategory.ilike.%${attributes.category}%`);
    }

    // Filtrage enrichi par analyse photo
    if (photoAnalysis) {
      if (photoAnalysis.style_detected) {
        query = query.ilike('style', `%${photoAnalysis.style_detected}%`);
      }
      
      if (photoAnalysis.dominant_colors?.length > 0) {
        const colorConditions = photoAnalysis.dominant_colors.map(color => `color.ilike.%${color}%`).join(',');
        query = query.or(colorConditions);
      }
      
      if (photoAnalysis.materials_visible?.length > 0) {
        const materialConditions = photoAnalysis.materials_visible.map(material => 
          `material.ilike.%${material}%,fabric.ilike.%${material}%`
        ).join(',');
        query = query.or(materialConditions);
      }
      
      if (photoAnalysis.room_type) {
        query = query.ilike('room', `%${photoAnalysis.room_type}%`);
      }
    }

    // Filtrage par couleurs
    if (attributes.color) {
      query = query.ilike('color', `%${attributes.color}%`);
    }

    // Filtrage par matériaux
    if (attributes.material) {
      query = query.or(`material.ilike.%${attributes.material}%,fabric.ilike.%${attributes.material}%`);
    }

    // Filtrage par styles
    if (attributes.style) {
      query = query.ilike('style', `%${attributes.style}%`);
    }

    // Filtrage par pièce
    if (attributes.room) {
      query = query.ilike('room', `%${attributes.room}%`);
    }

    // Filtrage par prix
    if (attributes.price_max) {
      query = query.lte('price', attributes.price_max);
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
      return createDemoEnrichedProducts(attributes, photoAnalysis);
    }
    
    return enrichedProducts || [];

  } catch (error) {
    console.error('❌ [quickchat] Erreur recherche enrichie:', error);
    return createDemoEnrichedProducts(attributes, photoAnalysis);
  }
}

async function searchFAQ(message: string): Promise<string> {
  const lowerMessage = message.toLowerCase();
  
  if (lowerMessage.includes('livraison')) {
    return "Livraison gratuite en France métropolitaine sous 7-10 jours ouvrés 🚚 Express 48h disponible (+19€). Montage inclus sur demande !";
  }
  
  if (lowerMessage.includes('garantie')) {
    return "Tous nos meubles sont garantis 2 ans pièces et main d'œuvre 🛡️ Extension possible jusqu'à 5 ans. SAV réactif et efficace !";
  }
  
  if (lowerMessage.includes('retour') || lowerMessage.includes('échange')) {
    return "Retour gratuit sous 30 jours si non satisfait 📦 Échange possible selon stock disponible. Remboursement intégral garanti !";
  }
  
  if (lowerMessage.includes('paiement')) {
    return "Paiement 100% sécurisé : CB, PayPal, virement 💳 Facilités 3x sans frais dès 300€. Paiement à la livraison possible !";
  }
  
  if (lowerMessage.includes('magasin') || lowerMessage.includes('showroom')) {
    return "Showroom Paris 15ème, ouvert Mar-Sam 10h-19h 🏪 Rendez-vous conseiller gratuit. Adresse : 123 rue de Vaugirard, métro Vaugirard !";
  }
  
  return "Je peux vous renseigner sur la livraison, garantie, retours, paiement ou nos showrooms 👍 Que souhaitez-vous savoir précisément ?";
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

function createDemoEnrichedProducts(attributes: any, photoAnalysis: any): EnrichedProduct[] {
  // Créer des produits démo enrichis basés sur l'intention et l'analyse photo
  const demoProducts: EnrichedProduct[] = [];
  
  // Chaise AVINA enrichie
  if (!attributes.category || attributes.category === 'chaise' || 
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
  if (!attributes.category || attributes.category === 'table' || 
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
  if (!attributes.category || attributes.category === 'table' || 
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