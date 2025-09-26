import { extractAttributesWithAI } from './auto-ai-trainer.ts';

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
};

interface EnrichProductsRequest {
  products?: any[];
  retailer_id?: string;
  image_base64?: string;
  image_url?: string;
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { status: 200, headers: corsHeaders });
  }

  try {
    const { products, retailer_id, image_base64, image_url }: EnrichProductsRequest = await req.json();

    if (image_base64 || image_url) {
      return new Response(JSON.stringify({ analysis: "📸 Analyse image IA en cours...", success: true }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }

    if (products && products.length > 0) {
      const enrichedResults = [];
      for (const p of products) {
        const attributes = await extractAttributesWithAI(p, 'manual_enrich');
        enrichedResults.push({ ...p, extracted_attributes: attributes, enriched_at: new Date().toISOString() });
      }
      return new Response(JSON.stringify({ success: true, enriched_products: enrichedResults, count: enrichedResults.length }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }

    return new Response(JSON.stringify({ success: false, error: 'Aucun produit à enrichir' }), { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });

  } catch (error) {
    console.error('❌ Erreur enrich-products:', error);
    return new Response(JSON.stringify({ success: false, error: error.message }), { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
  }
});
