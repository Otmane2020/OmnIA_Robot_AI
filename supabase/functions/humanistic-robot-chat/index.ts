const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
};

import { createClient } from 'npm:@supabase/supabase-js@2';

interface HumanisticChatRequest {
  message: string;
  session_id?: string;
  conversation_history?: Array<{
    role: 'user' | 'assistant';
    content: string;
  }>;
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, {
      status: 200,
      headers: corsHeaders,
    });
  }

  try {
    const { message, session_id, conversation_history = [] }: HumanisticChatRequest = await req.json();
    
    console.log('🤖 OmnIA Robot reçoit:', message.substring(0, 50) + '...');

    const openaiApiKey = Deno.env.get('OPENAI_API_KEY');
    
    if (!openaiApiKey) {
      console.log('⚠️ OpenAI API key manquante');
      return new Response(
        JSON.stringify({ 
          message: "Bonjour ! Je suis OmnIA, votre robot designer mobilier. Que cherchez-vous pour votre intérieur ?",
          products: []
        }),
        {
          headers: { 'Content-Type': 'application/json', ...corsHeaders },
        }
      );
    }

    // Initialize Supabase
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // 🔍 ÉTAPE 1: Analyser l'intention et filtrer les produits pertinents
    const productIntent = analyzeProductIntent(message);
    console.log('🎯 Intention détectée:', productIntent);

    let relevantProducts = [];
    
    // Rechercher des produits seulement si l'intention est spécifique
    if (productIntent.shouldSearchProducts) {
      relevantProducts = await getRelevantProducts(supabase, productIntent);
      console.log('📦 Produits pertinents trouvés:', relevantProducts.length);
    }

    // 🧠 ÉTAPE 2: Générer réponse humaniste avec ChatGPT
    const aiResponse = await generateHumanisticResponse(
      message, 
      relevantProducts, 
      conversation_history, 
      openaiApiKey
    );

    return new Response(
      JSON.stringify({ 
        message: aiResponse.message,
        products: aiResponse.selectedProducts || [],
        should_show_products: aiResponse.should_show_products,
        robot_mood: aiResponse.robot_mood || 'happy'
      }),
      {
        headers: { 'Content-Type': 'application/json', ...corsHeaders },
      }
    );

  } catch (error) {
    console.error('❌ Erreur humanistic robot chat:', error);
    
    return new Response(
      JSON.stringify({ 
        message: "Désolé, je rencontre un petit souci technique. Pouvez-vous répéter ?",
        products: [],
        robot_mood: 'neutral'
      }),
      {
        headers: { 'Content-Type': 'application/json', ...corsHeaders },
      }
    );
  }
});

function analyzeProductIntent(message: string) {
  const lowerMessage = message.toLowerCase();
  
  // Salutations - pas de recherche produit
  if (lowerMessage.includes('bonjour') || lowerMessage.includes('salut') || 
      lowerMessage.includes('hello') || lowerMessage.includes('bonsoir')) {
    return {
      shouldSearchProducts: false,
      category: null,
      keywords: [],
      isGreeting: true
    };
  }

  // Questions générales - pas de recherche produit
  if (lowerMessage.includes('comment') || lowerMessage.includes('pourquoi') || 
      lowerMessage.includes('conseil') || lowerMessage.includes('aide')) {
    return {
      shouldSearchProducts: false,
      category: null,
      keywords: [],
      isAdviceRequest: true
    };
  }

  // Détection des catégories de produits
  const categoryMappings = {
    'canapé': {
      keywords: ['canapé', 'canapés', 'sofa', 'sofas', 'salon', 'assise'],
      category: 'canapé'
    },
    'table': {
      keywords: ['table', 'tables', 'manger', 'repas', 'basse', 'console'],
      category: 'table'
    },
    'chaise': {
      keywords: ['chaise', 'chaises', 'siège', 'fauteuil', 'bureau'],
      category: 'chaise'
    },
    'lit': {
      keywords: ['lit', 'lits', 'matelas', 'chambre', 'couchage'],
      category: 'lit'
    },
    'rangement': {
      keywords: ['armoire', 'commode', 'vitrine', 'rangement', 'bibliothèque'],
      category: 'rangement'
    }
  };

  // Trouver la catégorie correspondante
  for (const [category, config] of Object.entries(categoryMappings)) {
    if (config.keywords.some(keyword => lowerMessage.includes(keyword))) {
      // Extraire le prix maximum si mentionné
      const priceMatch = lowerMessage.match(/(?:sous|under|moins de|max|maximum)\s*(\d+)/);
      const maxPrice = priceMatch ? parseInt(priceMatch[1]) : null;
      
      // Extraire couleurs
      const colors = extractColors(lowerMessage);
      
      // Extraire matériaux
      const materials = extractMaterials(lowerMessage);
      
      return {
        shouldSearchProducts: true,
        category,
        keywords: [...config.keywords, ...colors, ...materials],
        maxPrice,
        colors,
        materials,
        isSpecific: true
      };
    }
  }

  // Pas de catégorie spécifique mais mots-clés mobilier
  const furnitureKeywords = ['meuble', 'mobilier', 'décoration', 'aménagement'];
  if (furnitureKeywords.some(keyword => lowerMessage.includes(keyword))) {
    return {
      shouldSearchProducts: false,
      category: null,
      keywords: [],
      isGeneralFurniture: true
    };
  }

  // Demande très générale
  return {
    shouldSearchProducts: false,
    category: null,
    keywords: [],
    isGeneral: true
  };
}

function extractColors(text: string): string[] {
  const colors = [];
  const colorPatterns = [
    'blanc', 'noir', 'gris', 'beige', 'marron', 'bleu', 'vert', 'rouge', 
    'jaune', 'orange', 'rose', 'violet', 'crème', 'naturel', 'anthracite', 
    'taupe', 'ivoire', 'chêne', 'noyer', 'teck'
  ];
  
  colorPatterns.forEach(color => {
    if (text.includes(color)) {
      colors.push(color);
    }
  });
  
  return colors;
}

function extractMaterials(text: string): string[] {
  const materials = [];
  const materialPatterns = [
    'bois', 'métal', 'verre', 'tissu', 'cuir', 'velours', 'travertin', 
    'marbre', 'rotin', 'osier', 'plastique', 'céramique'
  ];
  
  materialPatterns.forEach(material => {
    if (text.includes(material)) {
      materials.push(material);
    }
  });
  
  return materials;
}

async function getRelevantProducts(supabase: any, intent: any) {
  try {
    console.log('🔍 Recherche produits pour:', intent);
    
    // Construire la requête de base
    let query = supabase
      .from('products')
      .select('id, title, description, price, compare_at_price, image_url, product_url, stock_qty, status, is_published, product_type, vendor')
      .eq('is_published', true)
      .eq('status', 'active')
      .gt('stock_qty', 0);

    // Filtrage par catégorie
    if (intent.category) {
      query = query.or(`product_type.ilike.%${intent.category}%,title.ilike.%${intent.category}%`);
    }

    // Filtrage par mots-clés
    if (intent.keywords.length > 0) {
      const searchConditions = [];
      intent.keywords.forEach(keyword => {
        searchConditions.push(`title.ilike.%${keyword}%`);
        searchConditions.push(`description.ilike.%${keyword}%`);
      });
      query = query.or(searchConditions.join(','));
    }

    // Filtrage par prix
    if (intent.maxPrice) {
      query = query.lte('price', intent.maxPrice);
    }

    // Limiter à 3 produits maximum
    query = query.limit(3);

    const { data: products, error } = await query;

    if (error) {
      console.error('❌ Erreur requête produits:', error);
      return [];
    }

    return (products || []).map(product => ({
      id: product.id,
      title: product.title,
      price: product.price,
      compareAtPrice: product.compare_at_price,
      image_url: product.image_url,
      product_url: product.product_url,
      description: product.description,
      productType: product.product_type,
      vendor: product.vendor,
      availableForSale: true,
      quantityAvailable: product.stock_qty,
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
    console.error('❌ Erreur recherche produits:', error);
    return [];
  }
}

async function generateHumanisticResponse(
  message: string, 
  relevantProducts: any[], 
  conversationHistory: any[], 
  openaiApiKey: string
) {
  const startTime = Date.now();

  try {
    // Construire le contexte produits SEULEMENT si pertinents
    const productsContext = relevantProducts.length > 0 ? 
      `PRODUITS DISPONIBLES EN STOCK (${relevantProducts.length}) :
${relevantProducts.map(p => 
  `• ${p.title} - ${p.price}€${p.compareAtPrice ? ` (était ${p.compareAtPrice}€)` : ''} - Stock: ${p.quantityAvailable}
  Description: ${p.description?.substring(0, 100) || 'Pas de description'}`
).join('\n')}` : 'AUCUN PRODUIT CORRESPONDANT EN STOCK.';

    const systemPrompt = `Tu es **OmnIA**, un assistant robot IA spécialisé dans le mobilier et la décoration.  
Ton rôle : agir comme un **vendeur expert + conseiller déco** qui parle de manière naturelle et humaine.  

Règles de comportement :
1. **Discussion naturelle et fluide** : parle comme un vrai vendeur en magasin (salutation, questions, reformulation).
2. **Réflexion d'abord, catalogue ensuite** :
   - Réfléchis à la demande du client (style, budget, espace, usage).
   - Ne propose pas systématiquement des produits.
   - Si tu juges que c'est pertinent → utilise UNIQUEMENT les produits fournis ci-dessous.
3. **Filtrage strict du catalogue** :
   - Ne proposer que les produits avec stock > 0 et status = active.
   - Si aucun produit disponible → indiquer la rupture et proposer une alternative ou conseil.
4. **Format des propositions** :
   - Toujours donner **1 ou 2 recommandations max** à la fois (pas une liste entière).
   - Inclure : titre + prix + conseil déco.
   - Proposer un conseil déco ou une question complémentaire après chaque recommandation.
5. **Personnalité** :
   - Style amical, chaleureux, expert.
   - Phrases courtes et naturelles (2 phrases max par défaut).
   - Pose des questions de suivi : « Quelle couleur vous plaît ? », « Quelle taille conviendrait le mieux à votre salon ? ».

${productsContext}

Exemples de réponses :
- Client : "Je cherche un canapé beige pour mon salon"  
  → Toi : "Très bon choix, le beige apporte de la lumière ! Notre canapé d'angle en tissu beige à 1299€ pourrait convenir. Voulez-vous que je vous montre aussi une version convertible ?"

- Client : "Vous avez une table en travertin ?"  
  → Toi : "Oui, nous avons une table en travertin à 699€. Elle s'associe très bien avec des chaises en bois clair. Voulez-vous que je vous propose un ensemble complet ?"

- Client : "Bonjour"
  → Toi : "Bonjour ! Bienvenue chez OmnIA. Je suis ravi de vous rencontrer. Que cherchez-vous pour votre intérieur aujourd'hui ?"

STYLE DE RÉPONSE :
- Maximum 2 phrases courtes
- Ton chaleureux et expert
- Toujours finir par une question engageante
- Éviter les listes longues`;

    const messages = [
      { role: 'system', content: systemPrompt },
      ...conversationHistory.slice(-3), // Garder seulement 3 derniers messages pour contexte
      { role: 'user', content: message }
    ];

    console.log('🧠 Envoi à ChatGPT avec', relevantProducts.length, 'produits pertinents...');

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openaiApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: messages,
        max_tokens: 100, // Court pour réponses naturelles
        temperature: 0.8, // Créatif mais cohérent
        presence_penalty: 0.2,
        frequency_penalty: 0.1,
      }),
    });

    if (!response.ok) {
      throw new Error(`OpenAI error: ${response.status}`);
    }

    const data = await response.json();
    const aiMessage = data.choices[0]?.message?.content || 'Comment puis-je vous aider ?';

    // 🎯 Sélection finale des produits basée sur la réponse IA
    const selectedProducts = selectProductsFromResponse(aiMessage, relevantProducts);

    const thinkingTime = Date.now() - startTime;
    console.log('✅ Réponse générée en', thinkingTime, 'ms avec', selectedProducts.length, 'produits');

    // Déterminer l'humeur du robot
    const robotMood = determineRobotMood(aiMessage, selectedProducts.length);

    return {
      message: aiMessage,
      selectedProducts: selectedProducts,
      should_show_products: selectedProducts.length > 0,
      robot_mood: robotMood,
      thinking_time: `${thinkingTime}ms`
    };

  } catch (error) {
    console.error('❌ Erreur ChatGPT:', error);
    
    // Fallback humaniste
    const fallbackResponse = generateHumanisticFallback(message, relevantProducts);
    
    return {
      message: fallbackResponse.message,
      selectedProducts: fallbackResponse.products,
      should_show_products: fallbackResponse.products.length > 0,
      robot_mood: 'neutral',
      thinking_time: `${Date.now() - startTime}ms`
    };
  }
}

function selectProductsFromResponse(aiResponse: string, availableProducts: any[]) {
  const lowerResponse = aiResponse.toLowerCase();
  
  // Si l'IA pose une question sans mentionner de produits, ne pas en montrer
  if (lowerResponse.includes('?') && !lowerResponse.includes('voici') && !lowerResponse.includes('notre')) {
    return [];
  }
  
  // Chercher les produits mentionnés dans la réponse
  const mentionedProducts = availableProducts.filter(product => {
    const productName = product.title.toLowerCase();
    const productWords = productName.split(' ');
    
    // Vérifier si des mots du produit sont dans la réponse
    return productWords.some(word => 
      word.length > 3 && lowerResponse.includes(word)
    );
  });

  // Si des produits sont mentionnés, les retourner
  if (mentionedProducts.length > 0) {
    return mentionedProducts.slice(0, 2); // Maximum 2
  }

  // Si l'IA semble recommander quelque chose, montrer les produits les plus pertinents
  if (lowerResponse.includes('recommande') || lowerResponse.includes('propose') || 
      lowerResponse.includes('parfait') || lowerResponse.includes('idéal')) {
    return availableProducts.slice(0, 2);
  }

  return [];
}

function determineRobotMood(response: string, productsCount: number): string {
  const lowerResponse = response.toLowerCase();
  
  if (lowerResponse.includes('désolé') || lowerResponse.includes('problème')) {
    return 'neutral';
  }
  
  if (lowerResponse.includes('parfait') || lowerResponse.includes('excellent') || 
      lowerResponse.includes('idéal') || productsCount > 0) {
    return 'happy';
  }
  
  if (lowerResponse.includes('?')) {
    return 'thinking';
  }
  
  return 'happy';
}

function generateHumanisticFallback(message: string, products: any[]) {
  const lowerMessage = message.toLowerCase();
  
  if (lowerMessage.includes('bonjour') || lowerMessage.includes('salut')) {
    return {
      message: "Bonjour ! Bienvenue chez OmnIA. Je suis ravi de vous rencontrer. Que cherchez-vous pour votre intérieur aujourd'hui ?",
      products: []
    };
  }
  
  if (products.length === 0) {
    if (lowerMessage.includes('canapé')) {
      return {
        message: "Je n'ai pas ce modèle en stock actuellement. Quel style de canapé vous intéresse ? Moderne, d'angle, convertible ?",
        products: []
      };
    }
    if (lowerMessage.includes('table')) {
      return {
        message: "Nous n'avons pas ce modèle disponible. Quelle table cherchez-vous ? À manger, basse, bureau ?",
        products: []
      };
    }
    return {
      message: "Pouvez-vous me préciser votre recherche ? Je suis là pour vous conseiller !",
      products: []
    };
  }
  
  const product = products[0];
  return {
    message: `Notre ${product.title} à ${product.price}€ pourrait vous plaire ! Voulez-vous que je vous donne plus de détails ?`,
    products: [product]
  };
}