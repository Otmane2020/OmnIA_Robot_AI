const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
};

import { createClient } from 'npm:@supabase/supabase-js@2';

interface SmartQueryRequest {
  message: string;
  user_id?: string;
  session_id?: string;
  retailer_id?: string;
}

interface ProductContext {
  id: string;
  title: string;
  price: number;
  category: string;
  attributes: any;
  stock: number;
  image_url: string;
}

interface ConversationContext {
  recent_messages: Array<{
    role: string;
    content: string;
    timestamp: string;
  }>;
  user_preferences: {
    preferred_style?: string;
    budget_range?: string;
    room_type?: string;
  };
  session_products: string[];
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, {
      status: 200,
      headers: corsHeaders,
    });
  }

  try {
    const { message, user_id, session_id, retailer_id = 'demo-retailer-id' }: SmartQueryRequest = await req.json();
    
    console.log('🤖 ChatGPT Smart Query:', message.substring(0, 50) + '...');

    // Initialize Supabase
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // 🔍 ÉTAPE 1: Récupérer le contexte conversation
    const conversationContext = await getConversationContext(supabase, user_id, session_id);
    
    // 🎯 ÉTAPE 2: Analyser l'intention et filtrer les produits
    const productContext = await getRelevantProducts(supabase, message, retailer_id, conversationContext);
    
    // 🧠 ÉTAPE 3: Générer réponse ChatGPT avec contexte enrichi
    const aiResponse = await generateContextualResponse(message, productContext, conversationContext);
    
    // 💾 ÉTAPE 4: Sauvegarder la conversation
    await saveConversation(supabase, {
      user_id,
      session_id: session_id || crypto.randomUUID(),
      message,
      response: aiResponse.message,
      products: aiResponse.products_mentioned,
      intent: aiResponse.detected_intent,
      retailer_id
    });

    return new Response(
      JSON.stringify({
        message: aiResponse.message,
        products: productContext.filtered_products,
        should_show_products: aiResponse.should_show_products,
        conversation_id: aiResponse.conversation_id,
        thinking_time: aiResponse.thinking_time
      }),
      {
        headers: {
          'Content-Type': 'application/json',
          ...corsHeaders,
        },
      }
    );

  } catch (error) {
    console.error('❌ Erreur ChatGPT Smart Query:', error);
    
    return new Response(
      JSON.stringify({
        message: "Désolé, je rencontre des difficultés techniques. Pouvez-vous reformuler ?",
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

async function getConversationContext(supabase: any, userId?: string, sessionId?: string): Promise<ConversationContext> {
  try {
    // Récupérer les 5 derniers messages de la session
    let query = supabase
      .from('retailer_conversations')
      .select('role, message, response, products, created_at')
      .order('created_at', { ascending: false })
      .limit(5);

    if (sessionId) {
      query = query.eq('session_id', sessionId);
    } else if (userId) {
      query = query.eq('user_id', userId);
    }

    const { data: recentConversations } = await query;

    // Analyser les préférences utilisateur depuis l'historique
    const userPreferences = analyzeUserPreferences(recentConversations || []);
    
    // Extraire les produits déjà mentionnés dans la session
    const sessionProducts = extractSessionProducts(recentConversations || []);

    return {
      recent_messages: (recentConversations || []).map(conv => ({
        role: conv.role === 'client' ? 'user' : 'assistant',
        content: conv.message || conv.response || '',
        timestamp: conv.created_at
      })).reverse(), // Ordre chronologique pour ChatGPT
      user_preferences: userPreferences,
      session_products: sessionProducts
    };

  } catch (error) {
    console.error('❌ Erreur contexte conversation:', error);
    return {
      recent_messages: [],
      user_preferences: {},
      session_products: []
    };
  }
}

async function getRelevantProducts(supabase: any, query: string, retailerId: string, context: ConversationContext): Promise<any> {
  try {
    console.log('🔍 Filtrage intelligent produits...');

    // Analyser l'intention de recherche
    const searchIntent = analyzeSearchIntent(query, context);
    console.log('🎯 Intention détectée:', searchIntent);

    // Construire la requête SQL intelligente
    let productQuery = supabase
      .from('imported_products')
      .select(`
        external_id,
        name,
        description,
        price,
        compare_at_price,
        category,
        vendor,
        image_url,
        product_url,
        stock,
        extracted_attributes
      `)
      .eq('retailer_id', retailerId)
      .eq('status', 'active')
      .gt('stock', 0);

    // Filtrage par catégorie si détectée
    if (searchIntent.category) {
      productQuery = productQuery.ilike('category', `%${searchIntent.category}%`);
    }

    // Filtrage par prix si spécifié
    if (searchIntent.max_price) {
      productQuery = productQuery.lte('price', searchIntent.max_price);
    }

    // Recherche textuelle dans nom et description
    if (searchIntent.keywords.length > 0) {
      const searchConditions = searchIntent.keywords.map(keyword => 
        `name.ilike.%${keyword}%,description.ilike.%${keyword}%`
      ).join(',');
      productQuery = productQuery.or(searchConditions);
    }

    // Limiter les résultats
    productQuery = productQuery.limit(5);

    const { data: products, error } = await productQuery;

    if (error) {
      console.error('❌ Erreur requête produits:', error);
      return { filtered_products: [], search_intent: searchIntent };
    }

    // Enrichir avec les attributs ML
    const enrichedProducts = await enrichProductsWithML(supabase, products || []);

    console.log('✅ Produits filtrés:', enrichedProducts.length);

    return {
      filtered_products: enrichedProducts,
      search_intent: searchIntent,
      context_used: context.recent_messages.length > 0
    };

  } catch (error) {
    console.error('❌ Erreur filtrage produits:', error);
    return { filtered_products: [], search_intent: {} };
  }
}

async function enrichProductsWithML(supabase: any, products: any[]): Promise<any[]> {
  try {
    // Récupérer les attributs ML pour chaque produit
    const productIds = products.map(p => p.external_id);
    
    const { data: attributes } = await supabase
      .from('product_attributes')
      .select('product_id, attribute_name, attribute_value')
      .in('product_id', productIds);

    // Grouper les attributs par produit
    const attributesByProduct = (attributes || []).reduce((acc: any, attr: any) => {
      if (!acc[attr.product_id]) acc[attr.product_id] = {};
      if (!acc[attr.product_id][attr.attribute_name]) acc[attr.product_id][attr.attribute_name] = [];
      acc[attr.product_id][attr.attribute_name].push(attr.attribute_value);
      return acc;
    }, {});

    // Enrichir les produits
    return products.map(product => ({
      ...product,
      ml_attributes: attributesByProduct[product.external_id] || {},
      variants: [{
        id: `${product.external_id}-default`,
        title: 'Default',
        price: product.price,
        compareAtPrice: product.compare_at_price,
        availableForSale: product.stock > 0,
        quantityAvailable: product.stock,
        selectedOptions: []
      }]
    }));

  } catch (error) {
    console.error('❌ Erreur enrichissement ML:', error);
    return products;
  }
}

async function generateContextualResponse(message: string, productContext: any, conversationContext: ConversationContext) {
  const startTime = Date.now();
  
  try {
    const openaiApiKey = Deno.env.get('OPENAI_API_KEY');
    
    if (!openaiApiKey) {
      throw new Error('OpenAI API key manquante');
    }

    // Construire le contexte produits pour ChatGPT
    const productsForGPT = productContext.filtered_products.map((p: any) => ({
      nom: p.name,
      prix: `${p.price}€`,
      prix_barre: p.compare_at_price ? `${p.compare_at_price}€` : null,
      categorie: p.category,
      stock: p.stock,
      attributs_ml: p.ml_attributes,
      description_courte: p.description?.substring(0, 100) || ''
    }));

    // Construire le contexte conversation pour ChatGPT
    const conversationHistory = conversationContext.recent_messages.slice(-3); // 3 derniers messages

    const systemPrompt = `Tu es OmnIA, robot vendeur expert chez Decora Home. Tu es dans le showroom physique avec le client.

🎯 MISSION: Vendre intelligemment en utilisant UNIQUEMENT les produits fournis.

📦 PRODUITS DISPONIBLES (${productsForGPT.length}):
${JSON.stringify(productsForGPT, null, 2)}

🧠 CONTEXTE CLIENT:
- Préférences détectées: ${JSON.stringify(conversationContext.user_preferences)}
- Produits déjà vus: ${conversationContext.session_products.join(', ') || 'Aucun'}

🎯 RÈGLES:
1. Si AUCUN produit fourni → "Je n'ai pas ce modèle en stock actuellement"
2. Si produits fournis → Proposer le PLUS pertinent avec prix et argument
3. Réponse ultra-courte (20 mots max)
4. Ton vendeur humain chaleureux
5. Toujours finir par une question engageante

EXEMPLES:
- "Notre ALYANA beige 799€ est parfait ! Convertible ou fixe ?"
- "Table AUREA travertin 499€ ! Ø100 ou 120cm ?"`;

    const messages = [
      { role: 'system', content: systemPrompt },
      ...conversationHistory,
      { role: 'user', content: message }
    ];

    console.log('🧠 Envoi à ChatGPT avec', productsForGPT.length, 'produits et', conversationHistory.length, 'messages contexte');

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openaiApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: messages,
        max_tokens: 50, // Ultra-court pour rapidité
        temperature: 0.8,
        presence_penalty: 0.2,
        frequency_penalty: 0.1,
      }),
    });

    if (!response.ok) {
      throw new Error(`OpenAI error: ${response.status}`);
    }

    const data = await response.json();
    const aiMessage = data.choices[0]?.message?.content || 'Comment puis-je vous aider ?';

    // Analyser la réponse pour détecter les produits mentionnés
    const productsMentioned = detectMentionedProducts(aiMessage, productsForGPT);
    const detectedIntent = detectIntent(message);
    const shouldShowProducts = productsMentioned.length > 0 || productContext.filtered_products.length > 0;

    return {
      message: aiMessage,
      products_mentioned: productsMentioned,
      detected_intent: detectedIntent,
      should_show_products: shouldShowProducts,
      conversation_id: crypto.randomUUID(),
      thinking_time: `${Date.now() - startTime}ms`
    };

  } catch (error) {
    console.error('❌ Erreur ChatGPT:', error);
    
    return {
      message: generateFallbackResponse(message, productContext.filtered_products),
      products_mentioned: [],
      detected_intent: 'general',
      should_show_products: productContext.filtered_products.length > 0,
      conversation_id: crypto.randomUUID(),
      thinking_time: `${Date.now() - startTime}ms`
    };
  }
}

async function saveConversation(supabase: any, conversationData: any) {
  try {
    // Sauvegarder le message client
    await supabase.from('retailer_conversations').insert({
      user_id: conversationData.user_id,
      session_id: conversationData.session_id,
      role: 'client',
      message: conversationData.message,
      intent: conversationData.intent,
      ip_address: getClientIP(),
      user_agent: getUserAgent(),
      created_at: new Date().toISOString()
    });

    // Sauvegarder la réponse robot
    await supabase.from('retailer_conversations').insert({
      user_id: conversationData.user_id,
      session_id: conversationData.session_id,
      role: 'robot',
      response: conversationData.response,
      products: conversationData.products || [],
      final_action: detectFinalAction(conversationData.response),
      created_at: new Date().toISOString()
    });

    console.log('💾 Conversation sauvegardée:', conversationData.session_id);

  } catch (error) {
    console.error('❌ Erreur sauvegarde conversation:', error);
  }
}

function analyzeSearchIntent(query: string, context: ConversationContext) {
  const lowerQuery = query.toLowerCase();
  
  // Détecter la catégorie
  let category = null;
  const categoryMappings = {
    'canapé': ['canapé', 'canapés', 'sofa', 'salon'],
    'table': ['table', 'tables', 'manger', 'repas'],
    'chaise': ['chaise', 'chaises', 'siège', 'fauteuil'],
    'lit': ['lit', 'lits', 'matelas', 'chambre'],
    'rangement': ['armoire', 'commode', 'rangement']
  };

  for (const [cat, keywords] of Object.entries(categoryMappings)) {
    if (keywords.some(keyword => lowerQuery.includes(keyword))) {
      category = cat;
      break;
    }
  }

  // Détecter le prix maximum
  const priceMatch = lowerQuery.match(/(?:sous|under|moins de|max)\s*(\d+)/);
  const maxPrice = priceMatch ? parseInt(priceMatch[1]) : null;

  // Extraire mots-clés
  const keywords = extractKeywords(lowerQuery);

  return {
    category,
    max_price: maxPrice,
    keywords,
    is_specific: category !== null || maxPrice !== null || keywords.length > 0
  };
}

function analyzeUserPreferences(conversations: any[]) {
  const preferences: any = {};
  
  // Analyser les conversations pour détecter les préférences
  conversations.forEach(conv => {
    const text = (conv.message || conv.response || '').toLowerCase();
    
    // Détecter style préféré
    const styles = ['moderne', 'scandinave', 'industriel', 'vintage', 'classique'];
    styles.forEach(style => {
      if (text.includes(style)) {
        preferences.preferred_style = style;
      }
    });
    
    // Détecter budget
    const budgetMatch = text.match(/budget.*?(\d+)/);
    if (budgetMatch) {
      preferences.budget_range = `jusqu'à ${budgetMatch[1]}€`;
    }
    
    // Détecter pièce
    const rooms = ['salon', 'chambre', 'cuisine', 'bureau'];
    rooms.forEach(room => {
      if (text.includes(room)) {
        preferences.room_type = room;
      }
    });
  });

  return preferences;
}

function extractSessionProducts(conversations: any[]): string[] {
  const products = new Set<string>();
  
  conversations.forEach(conv => {
    if (conv.products && Array.isArray(conv.products)) {
      conv.products.forEach((product: string) => products.add(product));
    }
  });

  return Array.from(products);
}

function extractKeywords(query: string): string[] {
  const keywords = [];
  
  // Couleurs
  const colors = ['blanc', 'noir', 'gris', 'beige', 'marron', 'bleu', 'vert', 'rouge'];
  colors.forEach(color => {
    if (query.includes(color)) keywords.push(color);
  });
  
  // Matériaux
  const materials = ['bois', 'métal', 'verre', 'tissu', 'cuir', 'velours', 'travertin'];
  materials.forEach(material => {
    if (query.includes(material)) keywords.push(material);
  });
  
  // Styles
  const styles = ['moderne', 'scandinave', 'industriel', 'vintage'];
  styles.forEach(style => {
    if (query.includes(style)) keywords.push(style);
  });

  return keywords;
}

function detectMentionedProducts(response: string, availableProducts: any[]): string[] {
  const mentioned = [];
  
  availableProducts.forEach(product => {
    // Chercher le nom du produit dans la réponse
    const productName = product.nom.toLowerCase();
    if (response.toLowerCase().includes(productName)) {
      mentioned.push(product.nom);
    }
    
    // Chercher des mots-clés du produit
    if (product.attributs_ml) {
      Object.values(product.attributs_ml).flat().forEach((attr: any) => {
        if (response.toLowerCase().includes(attr.toLowerCase())) {
          mentioned.push(product.nom);
        }
      });
    }
  });

  return [...new Set(mentioned)];
}

function detectIntent(message: string): string {
  const lowerMessage = message.toLowerCase();
  
  if (lowerMessage.includes('prix') || lowerMessage.includes('coût')) return 'price_inquiry';
  if (lowerMessage.includes('stock') || lowerMessage.includes('disponible')) return 'availability_check';
  if (lowerMessage.includes('livraison')) return 'delivery_inquiry';
  if (lowerMessage.includes('conseil') || lowerMessage.includes('aide')) return 'advice_request';
  if (lowerMessage.includes('acheter') || lowerMessage.includes('commander')) return 'purchase_intent';
  
  return 'product_search';
}

function detectFinalAction(response: string): string {
  const lowerResponse = response.toLowerCase();
  
  if (lowerResponse.includes('ajouté au panier')) return 'cart_add';
  if (lowerResponse.includes('commande') || lowerResponse.includes('acheter')) return 'purchase';
  if (lowerResponse.includes('devis') || lowerResponse.includes('estimation')) return 'quote_request';
  if (lowerResponse.includes('rappel') || lowerResponse.includes('contact')) return 'callback_request';
  
  return 'information_provided';
}

function generateFallbackResponse(message: string, products: any[]): string {
  if (products.length === 0) {
    return "Je n'ai pas ce modèle en stock actuellement. Que diriez-vous d'autre ?";
  }
  
  const product = products[0];
  return `Notre ${product.name} à ${product.price}€ pourrait vous intéresser !`;
}

function getClientIP(): string {
  // Dans un vrai environnement, extraire l'IP de la requête
  return '192.168.1.1';
}

function getUserAgent(): string {
  // Dans un vrai environnement, extraire le user agent
  return 'Mozilla/5.0 (compatible; OmnIA-Bot/1.0)';
}