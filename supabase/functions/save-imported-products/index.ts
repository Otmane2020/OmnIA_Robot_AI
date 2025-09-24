const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
};

import { createClient } from 'npm:@supabase/supabase-js@2';

interface SaveImportedProductsRequest {
  products: any[];
  retailer_id: string;
  source: string;
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, {
      status: 200,
      headers: corsHeaders,
    });
  }

  try {
    const { products, retailer_id, source }: SaveImportedProductsRequest = await req.json();
    
    console.log('💾 [save-imported-products] Sauvegarde produits importés:', {
      products_count: products.length,
      retailer_id,
      source
    });

    // Initialize Supabase
    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
    
    if (!supabaseUrl || !supabaseKey) {
      console.error('❌ Variables d\'environnement Supabase manquantes');
      return new Response(
        JSON.stringify({
          success: false,
          error: 'Configuration Supabase manquante',
          details: 'SUPABASE_URL et SUPABASE_SERVICE_ROLE_KEY requis'
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
    
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Validate and clean products
    const validProducts = products.filter(product => 
      product.name && product.name.trim().length > 0 && product.price > 0
    );

    console.log(`✅ [save-imported-products] ${validProducts.length}/${products.length} produits valides`);

    if (validProducts.length === 0) {
      return new Response(
        JSON.stringify({
          success: false,
          error: 'Aucun produit valide trouvé',
          details: 'Vérifiez que vos produits ont un nom et un prix'
        }),
        {
          status: 400,
          headers: {
            'Content-Type': 'application/json',
            ...corsHeaders,
          },
        }
      );
    }

    // Ensure extracted_attributes is always a valid JSON object
    const cleanedProducts = validProducts.map(product => ({
      ...product,
      extracted_attributes: product.extracted_attributes || {},
      created_at: product.created_at || new Date().toISOString(),
      updated_at: product.updated_at || new Date().toISOString()
    }));

    // Insert products into database
    const { data, error } = await supabase
      .from('imported_products')
      .upsert(cleanedProducts, { 
        onConflict: 'retailer_id,external_id,source_platform',
        ignoreDuplicates: false 
      })
      .select();

    if (error) {
      console.error('❌ [save-imported-products] Erreur insertion DB:', error);
      throw error;
    }

    console.log('✅ [save-imported-products] Produits sauvegardés:', data?.length || 0);

    return new Response(
      JSON.stringify({
        success: true,
        message: `${cleanedProducts.length} produits sauvegardés avec succès`,
        saved_count: cleanedProducts.length,
        products: data || []
      }),
      {
        headers: {
          'Content-Type': 'application/json',
          ...corsHeaders,
        },
      }
    );

  } catch (error) {
    console.error('❌ [save-imported-products] Erreur sauvegarde produits:', error);
    
    return new Response(
      JSON.stringify({
        success: false,
        error: 'Erreur lors de la sauvegarde des produits',
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