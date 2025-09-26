const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
};

import { createClient } from 'npm:@supabase/supabase-js@2';

interface GetEnrichedRequest {
  retailer_id?: string;
  limit?: number;
  category?: string;
  confidence_min?: number;
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, {
      status: 200,
      headers: corsHeaders,
    });
  }

  try {
    const { retailer_id, limit = 100, category, confidence_min }: GetEnrichedRequest = await req.json();
    
    console.log('📦 [get-enriched] Récupération produits enrichis:', {
      retailer_id,
      limit,
      category,
      confidence_min
    });

    // Initialize Supabase
    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
    
    if (!supabaseUrl || !supabaseKey) {
      throw new Error('Configuration Supabase manquante');
    }
    
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Construire la requête
    let query = supabase
      .from('products_enriched')
      .select('*')
      .gt('stock_qty', 0)
      .order('confidence_score', { ascending: false })
      .order('enriched_at', { ascending: false })
      .limit(limit);

    // Filtrage par retailer si spécifié
    if (retailer_id) {
      const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(retailer_id);
      if (isUuid) {
        query = query.eq('retailer_id', retailer_id);
      }
    }

    // Filtrage par catégorie
    if (category) {
      query = query.ilike('category', `%${category}%`);
    }

    // Filtrage par confiance minimale
    if (confidence_min) {
      query = query.gte('confidence_score', confidence_min);
    }

    const { data: products, error } = await query;

    if (error) {
      console.error('❌ [get-enriched] Erreur DB:', error);
      throw error;
    }

    console.log('✅ [get-enriched] Produits récupérés:', products?.length || 0);

    // Calculer les statistiques
    const stats = products ? {
      total_products: products.length,
      avg_confidence: Math.round(products.reduce((sum, p) => sum + (p.confidence_score || 0), 0) / products.length),
      categories: [...new Set(products.map(p => p.category))].length,
      with_images: products.filter(p => p.enrichment_source === 'text_and_vision').length,
      last_enriched: products[0]?.enriched_at
    } : null;

    return new Response(
      JSON.stringify({
        success: true,
        products: products || [],
        stats,
        retailer_id,
        retrieved_at: new Date().toISOString()
      }),
      {
        headers: {
          'Content-Type': 'application/json',
          ...corsHeaders,
        },
      }
    );

  } catch (error) {
    console.error('❌ [get-enriched] Erreur:', error);
    
    return new Response(
      JSON.stringify({
        success: false,
        error: 'Erreur lors de la récupération des produits enrichis',
        details: error.message,
        products: []
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