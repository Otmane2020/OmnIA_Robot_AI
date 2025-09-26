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
  session_id?: string;
  user_id?: string;
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { status: 200, headers: corsHeaders });
  }

  try {
    const { message, conversation_context = [], retailer_id, session_id, user_id }: UnifiedChatRequest = await req.json();
    console.log('🤖 OmnIA reçoit:', message.substring(0, 60));

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    );

    // Étape 1 : récupérer produits pertinents
    const products = await getRelevantProductsForQuery(message, retailer_id);

    // Étape 2 : générer réponse IA
    const aiResponse = await generateExpertResponse(message, products, conversation_context);

    // Étape 3 : sauvegarder conversation
    await saveConversation(supabase, {
      user_id,
      session_id: session_id || crypto.randomUUID(),
      retailer_id,
      message,
      response: aiResponse.message,
      products: aiResponse.selectedProducts.map(p => p.id),
      intent: "product_search",
    });

    return new Response(JSON.stringify({
      message: aiResponse.message,
      products: aiResponse.selectedProducts,
      should_show_products: aiResponse.should_show_products,
      total_found: products.length
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

async function getRelevantProductsForQuery(query: string, retailerId?: string) {
  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    );

    const attributes = extractAttributesFromQuery(query);

    let qb = supabase
      .from('products_enriched')
      .select('*')
      .gt('stock_qty', 0);

    if (retailerId) {
      qb = qb.eq('retailer_id', retailerId);
    }

    if (attributes.categories.length > 0) {
      qb = qb.or(attributes.categories.map(c => `category.ilike.%${c}%,subcategory.ilike.%${c}%`).join(','));
    }
    if (attributes.colors.length > 0) {
      qb = qb.or(attributes.colors.map(c => `color.ilike.%${c}%`).join(','));
    }
    if (attributes.materials.length > 0) {
      qb = qb.or(attributes.materials.map(m => `material.ilike.%${m}%`).join(','));
    }

    qb = qb.order('confidence_score', { ascending: false }).limit(5);

    const { data, error } = await qb;
    if (error) {
      console.error('❌ Erreur recherche produits:', error);
      return [];
    }

    return data || [];
  } catch (error) {
    console.error('❌ Erreur getRelevantProductsForQuery:', error);
    return [];
  }
}

function extractAttributesFromQuery(query: string) {
  const lower = query.toLowerCase();
  const colors = ['blanc','noir','gris','beige','bleu','vert','rouge','taupe'].filter(c => lower.includes(c));
  const materials = ['bois','marbre','travertin','métal','acier','verre','tissu','cuir','velours'].filter(m => lower.includes(m));
  const categories = ['canapé','table','chaise','lit','rangement','meuble tv'].filter(c => lower.includes(c));
  return { colors, materials, dimensions: [], styles: [], categories, subcategory: '', priceRange: {currency:'EUR'}, features: [], room: [], confidence_score: 60 };
}

async function generateExpertResponse(query: string, products: any[], context: any[]) {
  const deepseekApiKey = Deno.env.get('DEEPSEEK_API_KEY');
  const systemPrompt = `Tu es OmnIA, conseiller déco Decora Home.
Réponds court (2 phrases max), engageant et humain.
Toujours proposer 1–2 produits si disponibles.`;

  const productsContext = products.map(p => `• ${p.title} - ${p.price}€`).join('\n');

  const messages = [
    { role: 'system', content: `${systemPrompt}\nProduits dispo:\n${productsContext}` },
    ...context.slice(-2),
    { role: 'user', content: query }
  ];

  if (!deepseekApiKey) {
    return { message: "Je peux vous aider à choisir un meuble 👌 Que cherchez-vous ?", selectedProducts: products.slice(0,2), should_show_products: true };
  }

  const resp = await fetch('https://api.deepseek.com/chat/completions', {
    method: 'POST',
    headers: { 'Authorization': `Bearer ${deepseekApiKey}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ model: 'deepseek-chat', messages, max_tokens: 100, temperature: 0.8 })
  });

  const data = await resp.json();
  const msg = data.choices?.[0]?.message?.content || "Pouvez-vous préciser ?";
  return { message: msg, selectedProducts: products.slice(0,2), should_show_products: products.length > 0 };
}

async function saveConversation(supabase: any, data: any) {
  try {
    await supabase.from('retailer_conversations').insert([
      { role: 'client', message: data.message, user_id: data.user_id, session_id: data.session_id, retailer_id: data.retailer_id, intent: data.intent, created_at: new Date().toISOString() },
      { role: 'robot', response: data.response, products: data.products, user_id: data.user_id, session_id: data.session_id, retailer_id: data.retailer_id, created_at: new Date().toISOString() }
    ]);
  } catch (err) {
    console.error('❌ Erreur saveConversation:', err);
  }
}
