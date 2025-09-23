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
    const { products, retailer_id, source = 'csv' }: SaveImportedProductsRequest = await req.json();
    
    console.log('💾 Sauvegarde produits importés:', {
      products_count: products.length,
      retailer_id,
      source
      source
    });

    // Initialize Supabase
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Validate and clean products
    const validProducts = products.filter(product => 
      product.name && product.name.trim().length > 0 && product.price > 0
    ).map(product => ({
      ...product,
      retailer_id: retailer_id, // Assurer que retailer_id est défini
      source_platform: source,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }));

    console.log(`✅ ${validProducts.length}/${products.length} produits valides`);

    if (validProducts.length === 0) {
      return new Response(
        JSON.stringify({
          success: false,
          error: 'Aucun produit valide trouvé',
          details: 'Vérifiez que vos produits ont un nom et un prix'
        }),
        {
          headers: {
            'Content-Type': 'application/json', 
            ...corsHeaders,
          },
          status: 400,
        }
      );
    }

    console.log('🔄 Insertion de', validProducts.length, 'produits dans imported_products...');
    console.log('📋 Premier produit exemple:', {
      external_id: validProducts[0].external_id,
      retailer_id: validProducts[0].retailer_id,
      name: validProducts[0].name?.substring(0, 30),
      source_platform: validProducts[0].source_platform
    });

    // Insert products into database
    const { data, error } = await supabase 
      .from('imported_products')
      .upsert(validProducts, {
        onConflict: 'retailer_id,external_id,source_platform',
        ignoreDuplicates: false 
      })
      .select();

    if (error) {
      console.error('❌ Erreur insertion DB détaillée:', insertError);
      console.error('❌ Code erreur:', insertError.code);
      console.error('❌ Message:', insertError.message);
      console.error('❌ Détails:', insertError.details);
      
      return new Response(
        JSON.stringify({
          success: false,
          error: 'Erreur lors de la sauvegarde des produits',
          details: `${insertError.message} (Code: ${insertError.code})`,
          supabase_error: insertError
        }),
        {
          status: 500,
          headers: {
            'Content-Type': 'application/json',
            ...corsHeaders,
          },
        }
      );
      throw error;
    }

    console.log('✅ Produits sauvegardés:', data?.length || 0);

    return new Response(
      JSON.stringify({
        success: true,
        message: `${validProducts.length} produits sauvegardés avec succès`,
        saved_count: validProducts.length,
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
    console.error('❌ Erreur sauvegarde produits:', error);
    
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