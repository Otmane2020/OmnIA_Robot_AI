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

    // Étape 1 : récupérer produits depuis products_enriched
    const relevantProducts = await getProductsFromDatabase(message);

    // Étape 2 : générer réponse DeepSeek
    const aiResponse = await generateDeepSeekResponse(message, relevantProducts, deepseekApiKey);

    return new Response(JSON.stringify({
      message: aiResponse,
      products: relevantProducts.slice(0, 3)
    }), { headers: { 'Content-Type': 'application/json', ...corsHeaders } });

  } catch (error) {
    console.error('❌ Erreur unified-chat:', error);
    return new Response(JSON.stringify({
      message: "Petit souci technique 😅 pouvez-vous reformuler ?",
      products: []
    }), { headers: { 'Content-Type': 'application/json', ...corsHeaders } });
  }
});

async function getProductsFromDatabase(query: string) {
  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    );

    console.log('🔍 Recherche produits pour:', query);

    // Recherche simple dans products_enriched
    const { data: products, error } = await supabase
      .from('products_enriched')
      .select('id, handle, title, description, category, type, color, material, style, price, stock_quantity, image_url, product_url')
      .gt('stock_quantity', 0)
      .or(`title.ilike.%${query}%,description.ilike.%${query}%,category.ilike.%${query}%,type.ilike.%${query}%`)
      .limit(5);

    if (error) {
      console.error('❌ Erreur DB:', error);
      return getDecoraProducts();
    }

    console.log('✅ Produits trouvés:', products?.length || 0);
    return products?.map(p => ({
      id: p.id,
      handle: p.handle,
      title: p.title,
      productType: p.type || p.category,
      vendor: 'Decora Home',
      tags: [],
      price: p.price || 0,
      availableForSale: true,
      quantityAvailable: p.stock_quantity || 0,
      image_url: p.image_url,
      product_url: p.product_url,
      description: p.description,
      variants: [{
        id: `${p.id}-default`,
        title: 'Default',
        price: p.price || 0,
        availableForSale: true,
        quantityAvailable: p.stock_quantity || 0,
        selectedOptions: []
      }]
    })) || getDecoraProducts();
  } catch (error) {
    console.error('❌ Erreur DB:', error);
    return getDecoraProducts();
  }
}

async function generateDeepSeekResponse(query: string, products: any[], deepseekApiKey: string) {
  const productsContext = products.length > 0
    ? products.map(p => `• ${p.title} - ${p.price}€`).join('\n')
    : 'Aucun produit en stock.';

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

  const response = await fetch('https://api.deepseek.com/chat/completions', {
    method: 'POST',
    headers: { 'Authorization': `Bearer ${deepseekApiKey}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ 
      model: 'deepseek-chat', 
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: query }
      ],
      max_tokens: 60, 
      temperature: 0.9,
      presence_penalty: 0.2
    })
  });

  if (!response.ok) {
    throw new Error('Erreur DeepSeek API');
  }

  const data = await response.json();
  return data.choices?.[0]?.message?.content || "Pouvez-vous préciser votre demande ?";
}

function getDecoraProducts() {
  return [
    {
      id: 'decora-canape-alyana',
      handle: 'canape-alyana',
      title: 'Canapé ALYANA convertible - Beige',
      productType: 'Canapé',
      vendor: 'Decora Home',
      tags: ['convertible', 'velours', 'beige'],
      price: 799,
      availableForSale: true,
      quantityAvailable: 100,
      image_url: 'https://cdn.shopify.com/s/files/1/0903/7578/2665/files/7_23a97631-68d2-4f3e-8f78-b26c7cd4c2ae.png',
      product_url: 'https://decorahome.fr/products/canape-dangle-convertible-et-reversible-4-places-en-velours-cotele',
      description: 'Canapé d\'angle convertible 4 places en velours côtelé',
      variants: [{
        id: 'variant-beige',
        title: 'Beige',
        price: 799,
        availableForSale: true,
        quantityAvailable: 100,
        selectedOptions: []
      }]
    },
    {
      id: 'decora-table-aurea',
      handle: 'table-aurea',
      title: 'Table AUREA Ø100cm - Travertin',
      productType: 'Table',
      vendor: 'Decora Home',
      tags: ['travertin', 'ronde'],
      price: 499,
      availableForSale: true,
      quantityAvailable: 50,
      image_url: 'https://cdn.shopify.com/s/files/1/0903/7578/2665/files/3_e80b9a50-b032-4267-8f5b-f9130153e3be.png',
      product_url: 'https://decorahome.fr/products/table-a-manger-ronde-plateau-en-travertin-naturel-100-120-cm',
      description: 'Table ronde en travertin naturel',
      variants: [{
        id: 'variant-100cm',
        title: 'Ø100cm',
        price: 499,
        availableForSale: true,
        quantityAvailable: 50,
        selectedOptions: []
      }]
    },
    {
      id: 'decora-chaise-inaya',
      handle: 'chaise-inaya',
      title: 'Chaise INAYA - Gris chenille',
      productType: 'Chaise',
      vendor: 'Decora Home',
      tags: ['chenille', 'gris'],
      price: 99,
      availableForSale: true,
      quantityAvailable: 96,
      image_url: 'https://cdn.shopify.com/s/files/1/0903/7578/2665/files/3_3f11d1af-8ce5-4d2d-a435-cd0a78eb92ee.png',
      product_url: 'https://decorahome.fr/products/chaise-en-tissu-serge-chenille-pieds-metal-noir-gris-clair-moka-et-beige',
      description: 'Chaise en tissu chenille avec pieds métal noir',
      variants: [{
        id: 'variant-gris',
        title: 'Gris clair',
        price: 99,
        availableForSale: true,
        quantityAvailable: 96,
        selectedOptions: []
      }]
    }
  ];
}
