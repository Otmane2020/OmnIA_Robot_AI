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

    const deepseekApiKey = Deno.env.get('DEEPSEEK_API_KEY');
    if (!deepseekApiKey) {
      return new Response(JSON.stringify({
        message: "Bonjour ! Je suis OmnIA, votre conseiller mobilier. Que cherchez-vous pour votre intérieur ?",
        products: []
      }), { headers: { 'Content-Type': 'application/json', ...corsHeaders } });
    }

    // Étape 1 : filtrage DB (products_enriched)
    const relevantProducts = await getRelevantProductsForQuery(message, retailer_id);

    // Étape 2 : réponse IA
    const aiResponse = await generateExpertResponse(message, relevantProducts, conversation_context, deepseekApiKey);

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
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    );

    console.log('🔍 Recherche dans products_enriched pour:', query);

    const productIntent = analyzeProductIntent(query);
    const extractedAttributes = extractAttributesFromQuery(query);

    let qb = supabase
      .from('products_enriched')
      .select('id, title, description, category, type, color, material, fabric, style, dimensions, room, price, stock_qty, image_url, product_url')
      .eq('retailer_id', retailerId)
      .gt('stock_qty', 0);

    if (productIntent.category) {
      qb = qb.ilike('type', `%${productIntent.category}%`);
    }
    if (extractedAttributes.colors.length > 0) {
      qb = qb.in('color', extractedAttributes.colors);
    }
    if (extractedAttributes.materials.length > 0) {
      qb = qb.in('material', extractedAttributes.materials);
    }
    if (extractedAttributes.dimensions.length > 0) {
      qb = qb.or(extractedAttributes.dimensions.map(dim => `dimensions.ilike.%${dim}%`).join(','));
    }

    qb = qb.limit(5);
    const { data, error } = await qb;

    if (error) {
      console.error('❌ Erreur DB products_enriched:', error);
      return [];
    }

    console.log('✅ Produits trouvés:', data?.length || 0);
    return data || [];
  } catch (error) {
    console.error('❌ Erreur filtrage products_enriched:', error);
    return [];
  }
}

function analyzeProductIntent(query: string) {
  const lower = query.toLowerCase();
  const map: Record<string, { keywords: string[], category: string }> = {
    'canapé': { keywords: ['canapé', 'sofa'], category: 'canapé' },
    'table': { keywords: ['table', 'manger', 'basse'], category: 'table' },
    'chaise': { keywords: ['chaise', 'fauteuil'], category: 'chaise' },
    'lit': { keywords: ['lit', 'matelas'], category: 'lit' },
    'rangement': { keywords: ['armoire', 'commode'], category: 'rangement' },
    'meuble tv': { keywords: ['meuble tv', 'télé'], category: 'meuble tv' },
  };

  for (const [k, v] of Object.entries(map)) {
    if (v.keywords.some(word => lower.includes(word))) {
      return { category: v.category, keywords: v.keywords };
    }
  }
  return { category: null, keywords: [] };
}

function extractAttributesFromQuery(query: string) {
  const lower = query.toLowerCase();
  const colors = ['blanc','noir','gris','beige','bleu','vert','rouge','taupe']
    .filter(c => lower.includes(c));
  const materials = ['bois','marbre','travertin','métal','acier','verre','tissu','cuir','velours']
    .filter(m => lower.includes(m));
  const dims: string[] = [];
  const matches = lower.match(/\d+\s*cm|\d+\s*x\s*\d+/g);
  if (matches) dims.push(...matches);
  return { colors, materials, dimensions: dims };
}

async function generateExpertResponse(query: string, products: any[], context: any[], deepseekApiKey: string) {
  const productsContext = products.length > 0
    ? products.map(p => `• ${p.title} - ${p.price}€`).join('\n')
    : 'Aucun produit trouvé.';

  const systemPrompt = `Tu es OmnIA, robot commercial expert mobilier chez Decora Home.

🎯 MISSION: Vendre intelligemment avec personnalité chaleureuse.

STYLE DE RÉPONSE:
- Salutation amicale ("Bonjour ! 👋", "Parfait !", "Excellente idée !")
- 2-3 phrases courtes et engageantes
- TOUJOURS proposer 1-2 produits concrets avec prix
- Conseil déco bonus
- Question de relance pour continuer la vente

Produits dispo :
${productsContext}`;

  const messages = [
    { role: 'system', content: systemPrompt },
    ...context.slice(-2),
    { role: 'user', content: query }
  ];

  const resp = await fetch('https://api.deepseek.com/chat/completions', {
    method: 'POST',
    headers: { 'Authorization': `Bearer ${deepseekApiKey}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ 
      model: 'deepseek-chat', 
      messages, 
      max_tokens: 150, 
      temperature: 0.9,
      presence_penalty: 0.2
    })
  });

  const data = await resp.json();
  const msg = data.choices?.[0]?.message?.content || "Pouvez-vous préciser ?";
  return {
    message: msg,
    selectedProducts: products.slice(0, 2),
    should_show_products: products.length > 0
  };
}
