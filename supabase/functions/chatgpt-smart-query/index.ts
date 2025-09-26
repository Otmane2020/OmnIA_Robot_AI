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

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { status: 200, headers: corsHeaders });
  }

  try {
    const { message, user_id, session_id, retailer_id = 'demo-retailer' }: SmartQueryRequest = await req.json();
    console.log('🤖 SmartQuery reçu:', message);

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    );

    // 1️⃣ Contexte conversation
    const conversationContext = await getConversationContext(supabase, user_id, session_id);

    // 2️⃣ Produits pertinents
    const productContext = await getRelevantProducts(supabase, message, retailer_id, conversationContext);

    // 3️⃣ Réponse AI contextualisée
    const aiResponse = await generateContextualResponse(message, productContext, conversationContext);

    // 4️⃣ Sauvegarde conversation
    await saveConversation(supabase, {
      user_id,
      session_id: session_id || crypto.randomUUID(),
      message,
      response: aiResponse.message,
      products: aiResponse.products_mentioned,
      intent: aiResponse.detected_intent,
      retailer_id
    });

    return new Response(JSON.stringify({
      message: aiResponse.message,
      products: productContext.filtered_products,
      should_show_products: aiResponse.should_show_products,
      conversation_id: aiResponse.conversation_id,
      thinking_time: aiResponse.thinking_time
    }), { headers: { 'Content-Type': 'application/json', ...corsHeaders } });

  } catch (error) {
    console.error('❌ Erreur SmartQuery:', error);
    return new Response(JSON.stringify({
      message: "Je rencontre un souci technique. Pouvez-vous reformuler ?",
      products: [],
      error: true
    }), { status: 500, headers: { 'Content-Type': 'application/json', ...corsHeaders } });
  }
});

/* ---------- CONTEXTE ---------- */
async function getConversationContext(supabase: any, userId?: string, sessionId?: string) {
  let query = supabase.from('retailer_conversations')
    .select('role, message, response, products, created_at')
    .order('created_at', { ascending: false })
    .limit(5);

  if (sessionId) query = query.eq('session_id', sessionId);
  else if (userId) query = query.eq('user_id', userId);

  const { data } = await query;

  return {
    recent_messages: (data || []).map((c: any) => ({
      role: c.role === 'client' ? 'user' : 'assistant',
      content: c.message || c.response || '',
      timestamp: c.created_at
    })).reverse(),
    user_preferences: analyzeUserPreferences(data || []),
    session_products: extractSessionProducts(data || [])
  };
}

/* ---------- PRODUITS ---------- */
async function getRelevantProducts(supabase: any, query: string, retailerId: string, context: any) {
  const searchIntent = analyzeSearchIntent(query, context);

  let productQuery = supabase
    .from('imported_products')
    .select('external_id,name,description,price,compare_at_price,category,vendor,image_url,product_url,stock,extracted_attributes')
    .eq('retailer_id', retailerId)
    .eq('status', 'active')
    .gt('stock', 0);

  if (searchIntent.category) {
    productQuery = productQuery.ilike('category', `%${searchIntent.category}%`);
  }
  if (searchIntent.max_price) {
    productQuery = productQuery.lte('price', searchIntent.max_price);
  }
  if (searchIntent.keywords.length > 0) {
    const cond = searchIntent.keywords.map(k => `name.ilike.%${k}%,description.ilike.%${k}%`).join(',');
    productQuery = productQuery.or(cond);
  }

  productQuery = productQuery.limit(5);
  const { data: products } = await productQuery;

  return { filtered_products: products || [], search_intent: searchIntent };
}

/* ---------- CHATGPT ---------- */
async function generateContextualResponse(message: string, productContext: any, conversationContext: any) {
  const start = Date.now();
  const apiKey = Deno.env.get('OPENAI_API_KEY');
  if (!apiKey) throw new Error("OpenAI API Key manquante");

  const productsForGPT = productContext.filtered_products.map((p: any) => ({
    nom: p.name,
    prix: `${p.price}€`,
    cat: p.category,
    stock: p.stock,
    attr: p.extracted_attributes || {}
  }));

  const sysPrompt = `Tu es OmnIA, conseiller showroom Decora Home. 
- Réponses courtes (max 20 mots).
- Utilise UNIQUEMENT les produits fournis.
- Ton vendeur chaleureux, incite à poser une question.`;

  const messages = [
    { role: "system", content: sysPrompt },
    ...conversationContext.recent_messages.slice(-3),
    { role: "user", content: message }
  ];

  const res = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
    body: JSON.stringify({ model: "gpt-4o-mini", messages, max_tokens: 50, temperature: 0.8 })
  });

  const data = await res.json();
  const aiMsg = data.choices?.[0]?.message?.content || "Comment puis-je vous aider ?";

  return {
    message: aiMsg,
    products_mentioned: detectMentionedProducts(aiMsg, productsForGPT),
    detected_intent: detectIntent(message),
    should_show_products: productsForGPT.length > 0,
    conversation_id: crypto.randomUUID(),
    thinking_time: `${Date.now() - start}ms`
  };
}

/* ---------- UTILS ---------- */
function analyzeSearchIntent(query: string) {
  const q = query.toLowerCase();
  const mappings: any = {
    canapé: ['canapé', 'sofa'],
    table: ['table', 'manger'],
    chaise: ['chaise', 'fauteuil'],
    lit: ['lit', 'matelas'],
    rangement: ['armoire', 'commode']
  };
  let category = null;
  for (const [cat, keys] of Object.entries(mappings)) {
    if (keys.some(k => q.includes(k))) category = cat;
  }
  const price = q.match(/(max|min|moins de|sous)\s*(\d+)/);
  return { category, max_price: price ? parseInt(price[2]) : null, keywords: extractKeywords(q) };
}

function extractKeywords(q: string) {
  const kw: string[] = [];
  ['bois','métal','verre','tissu','velours','moderne','scandinave'].forEach(k => {
    if (q.includes(k)) kw.push(k);
  });
  return kw;
}

function detectIntent(msg: string) {
  const m = msg.toLowerCase();
  if (m.includes('prix')) return 'price_inquiry';
  if (m.includes('stock') || m.includes('disponible')) return 'availability_check';
  if (m.includes('livraison')) return 'delivery_inquiry';
  if (m.includes('acheter')) return 'purchase_intent';
  return 'product_search';
}

function detectMentionedProducts(resp: string, prods: any[]) {
  return prods.filter(p => resp.toLowerCase().includes(p.nom.toLowerCase())).map(p => p.nom);
}

function analyzeUserPreferences(convs: any[]) {
  const prefs: any = {};
  convs.forEach(c => {
    const t = (c.message || c.response || '').toLowerCase();
    if (t.includes('moderne')) prefs.preferred_style = 'moderne';
    if (t.includes('budget')) {
      const b = t.match(/(\d+)/);
      if (b) prefs.budget_range = `jusqu'à ${b[1]}€`;
    }
  });
  return prefs;
}

function extractSessionProducts(convs: any[]) {
  const set = new Set<string>();
  convs.forEach(c => c.products?.forEach((p: string) => set.add(p)));
  return Array.from(set);
}

async function saveConversation(supabase: any, conv: any) {
  await supabase.from('retailer_conversations').insert({
    user_id: conv.user_id,
    session_id: conv.session_id,
    role: 'client',
    message: conv.message,
    intent: conv.intent,
    created_at: new Date().toISOString()
  });
  await supabase.from('retailer_conversations').insert({
    user_id: conv.user_id,
    session_id: conv.session_id,
    role: 'robot',
    response: conv.response,
    products: conv.products || [],
    created_at: new Date().toISOString()
  });
}
