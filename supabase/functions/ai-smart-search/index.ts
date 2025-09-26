const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
};

import { createClient } from 'npm:@supabase/supabase-js@2';

interface SmartSearchRequest {
  query: string;
  filters?: {
    priceMax?: number;
    priceMin?: number;
    colors?: string[];
    materials?: string[];
    styles?: string[];
    room?: string;
    category?: string;
  };
  limit?: number;
}

interface SearchResult {
  product: any;
  relevanceScore: number;
  matchedAttributes: string[];
  reasoning: string;
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { status: 200, headers: corsHeaders });
  }

  try {
    const { query, filters = {}, limit = 10 }: SmartSearchRequest = await req.json();

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    );

    // 🔍 Intent via DeepSeek
    const searchIntent = await parseSearchIntentWithAI(query);

    // 📦 Charger les vrais produits
    const { data: products, error } = await supabase.from('ai_products').select('*');
    if (error) throw error;

    const searchResults: SearchResult[] = [];

    for (const product of products || []) {
      const score = calculateRelevanceScore(product, searchIntent, filters);
      if (score.total > 0) {
        searchResults.push({
          product,
          relevanceScore: score.total,
          matchedAttributes: score.matches,
          reasoning: score.reasoning,
        });
      }
    }

    searchResults.sort((a, b) => b.relevanceScore - a.relevanceScore);
    const limitedResults = searchResults.slice(0, limit);

    return new Response(
      JSON.stringify({
        success: true,
        query,
        intent: searchIntent,
        results: limitedResults.map(r => {
          const attrs = r.product.extracted_attributes || {};
          return {
            id: r.product.id,
            name: r.product.name,
            description: r.product.description,
            price: r.product.price,
            category: r.product.category,
            vendor: r.product.vendor,
            image_url: r.product.image_url,
            stock: r.product.stock,
            ai_attributes: {
              colors: attrs.colors || [],
              materials: attrs.materials || [],
              dimensions: attrs.dimensions || {},
              styles: attrs.styles || [],
              features: attrs.features || [],
              room: attrs.room || [],
              confidence_score: attrs.confidence_score || 0,
            },
            seo_optimized: {
              title: attrs.seo_title || "",
              description: attrs.seo_description || "",
              tags: attrs.seo_tags || [],
            },
            relevance_score: r.relevanceScore,
            matched_attributes: r.matchedAttributes,
            ai_reasoning: r.reasoning,
          };
        }),
        total_found: searchResults.length,
        search_time: new Date().toISOString(),
      }),
      { headers: { "Content-Type": "application/json", ...corsHeaders } }
    );
  } catch (error) {
    return new Response(
      JSON.stringify({ success: false, error: error.message }),
      { status: 500, headers: { "Content-Type": "application/json", ...corsHeaders } }
    );
  }
});

// ---- Fonctions utilitaires (parseSearchIntentWithAI, parseSearchIntentBasic, calculateRelevanceScore) 
// -> identiques à la version précédente que je t’ai donnée
