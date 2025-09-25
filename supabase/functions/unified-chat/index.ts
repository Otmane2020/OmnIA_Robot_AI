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
    
    // NOUVEAU: Utiliser Smart AI Table pour réponses intelligentes
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    );

    const productIntent = analyzeProductIntent(query);
    const extractedAttributes = extractAttributesFromQuery(query);

    // Recherche dans products_enriched avec Smart AI
    let qb = supabase
      .from('products_enriched')
      .select('id, handle, title, description, category, subcategory, color, material, fabric, style, dimensions, room, price, stock_qty, image_url, product_url, tags, confidence_score, enriched_at')
      .gt('stock_qty', 0);

    // Only apply retailer_id filter if it's a valid UUID, otherwise skip for demo/global products
    const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(retailerId);
    if (retailerId && isUuid) {
      qb = qb.eq('retailer_id', retailerId);
    } else if (productIntent.category) {
      qb = qb.or(`category.ilike.%${productIntent.category}%,subcategory.ilike.%${productIntent.category}%`);
    }
    if (extractedAttributes.colors.length > 0) {
      qb = qb.or(extractedAttributes.colors.map(color => `color.ilike.%${color}%`).join(','));
    }
    if (extractedAttributes.materials.length > 0) {
      qb = qb.or(extractedAttributes.materials.map(material => `material.ilike.%${material}%,fabric.ilike.%${material}%`).join(','));
    }
    if (extractedAttributes.dimensions.length > 0) {
      qb = qb.or(extractedAttributes.dimensions.map(dim => `dimensions.ilike.%${dim}%`).join(','));
    }

    // Ordonner par confiance IA et date d'enrichissement
    qb = qb.order('confidence_score', { ascending: false }).order('enriched_at', { ascending: false }).limit(5);
    
    const { data: enrichedData, error: enrichedError } = await qb;

    if (enrichedError) {
      console.error('❌ Erreur DB products_enriched:', enrichedError);
    }

    let products = enrichedData || [];
    console.log('✅ Produits Smart AI trouvés:', products.length);

    // FALLBACK: Si pas assez de produits Smart AI, chercher dans ai_products
    if (products.length < 3) {
      console.log('🔄 Fallback vers ai_products...');
      
      let aiQuery = supabase
        .from('ai_products')
        .select('id, name as title, description, category, price, stock, image_url, product_url')
        .gt('stock', 0);

      if (productIntent.category) {
        // Apply store_id filter for ai_products if retailerId is a valid UUID
        if (retailerId && isUuid) {
          aiQuery = aiQuery.eq('store_id', retailerId);
        }
        aiQuery = aiQuery.ilike('category', `%${productIntent.category}%`);
      }

      aiQuery = aiQuery.limit(5 - products.length);
      const { data: aiData } = await aiQuery;
      
      if (aiData && aiData.length > 0) {
        // Convertir format ai_products vers format Smart AI
        const convertedProducts = aiData.map(product => ({
          id: product.id,
          handle: product.id,
          title: product.title,
          description: product.description,
          category: product.category,
          subcategory: '',
          color: '',
          material: '',
          fabric: '',
          style: '',
          dimensions: '',
          room: '',
          price: product.price,
          stock_qty: product.stock,
          image_url: product.image_url,
          product_url: product.product_url,
          confidence_score: 50,
          enriched_at: new Date().toISOString()
        }));
        
        products = [...products, ...convertedProducts];
        console.log('✅ Produits AI ajoutés:', convertedProducts.length);
      }
    }

    console.log('✅ Total produits Smart AI trouvés:', products.length);
    return products;
  } catch (error) {
    console.error('❌ Erreur recherche produits:', error);
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
