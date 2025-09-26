const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
};

import { createClient } from 'npm:@supabase/supabase-js@2';

interface GetProductsRequest {
  retailer_id: string;
  source_platform?: string;
  limit?: number;
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, {
      status: 200,
      headers: corsHeaders,
    });
  }

  try {
    const { retailer_id, source_platform, limit = 100 }: GetProductsRequest = await req.json();
    
    console.log('📦 Récupération produits importés:', {
      // Validate retailer_id as UUID
      const isRetailerIdUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(retailer_id);
      if (retailer_id && !isRetailerIdUuid) {
        return new Response(
          JSON.stringify({
            success: false,
            error: 'Invalid retailer_id format. Must be a valid UUID.',
            details: `Received retailer_id: ${retailer_id}`
          }),
          {
            status: 400,
            headers: { 'Content-Type': 'application/json', ...corsHeaders }
          }
        );
      }
      retailer_id,
      source_platform,
      limit
    });

    // Initialize Supabase
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Build query
    let query = supabase
      .from('imported_products')
      .select(`
        external_id,
        retailer_id,
        name,
        description,
        price,
        compare_at_price,
        category,
        vendor,
        image_url,
        product_url,
        stock,
        source_platform,
        status,
        shopify_data,
        created_at,
        updated_at,
        inventory_management,
        extracted_attributes
      `)
      .eq('retailer_id', retailer_id)
      .order('created_at', { ascending: false })
      .limit(limit);

    if (source_platform) {
      query = query.eq('source_platform', source_platform);
    }

    const { data: products, error } = await query;

    if (error) {
      console.error('❌ Erreur récupération produits:', error);
      throw error;
    }

    console.log('✅ Produits récupérés:', products?.length || 0);

    // Get statistics
    const { data: stats } = await supabase
      .from('imported_products')
      .select('source_platform, status')
      .eq('retailer_id', retailer_id);

    const statistics = {
      total: products?.length || 0,
      by_source: {},
      by_status: {},
      last_import: products?.[0]?.created_at || null
    };

    if (stats) {
      stats.forEach(item => {
        statistics.by_source[item.source_platform] = (statistics.by_source[item.source_platform] || 0) + 1;
        statistics.by_status[item.status] = (statistics.by_status[item.status] || 0) + 1;
      });
    }

    return new Response(
      JSON.stringify({
        success: true,
        products: products || [],
        statistics,
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
    console.error('❌ Erreur récupération produits:', error);
    
    return new Response(
      JSON.stringify({
        success: false,
        error: 'Erreur lors de la récupération des produits',
        details: error.message
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