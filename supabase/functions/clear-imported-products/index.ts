const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
};

import { createClient } from 'npm:@supabase/supabase-js@2';

interface ClearProductsRequest {
  retailer_id: string;
  source_platform?: string;
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, {
      status: 200,
      headers: corsHeaders,
    });
  }

  try {
    const { retailer_id, source_platform }: ClearProductsRequest = await req.json();
    
    console.log('🗑️ Suppression produits importés:', {
      retailer_id,
      source_platform
    });

    // Initialize Supabase
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Build delete query
    let deleteQuery = supabase
      .from('imported_products')
      .delete()
      .eq('retailer_id', retailer_id);

    if (source_platform) {
      deleteQuery = deleteQuery.eq('source_platform', source_platform);
    } else {
      // Delete all products for this retailer
      deleteQuery = deleteQuery.neq('external_id', ''); // Delete all non-empty external_id
    }

    const { data, error, count } = await deleteQuery;

    if (error) {
      console.error('❌ Erreur suppression produits:', error);
      throw error;
    }

    console.log('✅ Produits supprimés:', count || 0);

    // Also clear from ai_products table
    const { error: aiError } = await supabase
      .from('ai_products')
      .delete()
      .eq('store_id', retailer_id);

    if (aiError) {
      console.warn('⚠️ Erreur suppression ai_products:', aiError);
    } else {
      console.log('✅ Produits IA supprimés');
    }

    return new Response(
      JSON.stringify({
        success: true,
        message: `Tous les produits ont été supprimés avec succès`,
        deleted_count: count || 0,
        retailer_id,
        deleted_at: new Date().toISOString()
      }),
      {
        headers: {
          'Content-Type': 'application/json',
          ...corsHeaders,
        },
      }
    );

  } catch (error) {
    console.error('❌ Erreur suppression produits:', error);
    
    return new Response(
      JSON.stringify({
        success: false,
        error: 'Erreur lors de la suppression des produits',
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