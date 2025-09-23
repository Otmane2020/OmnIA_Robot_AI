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
    
    console.log('💾 Sauvegarde produits importés:', {
      products_count: products.length,
      retailer_id,
      source
    });

    // Initialize Supabase
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Transform products to match database schema
    const transformedProducts = products.map((product: any) => ({
      id: crypto.randomUUID(),
      external_id: product.external_id || `csv-${Date.now()}-${Math.random()}`,
      retailer_id: retailer_id,
      name: product.name,
      description: product.description || null,
      price: parseFloat(product.price) || 0,
      original_price: product.original_price ? parseFloat(product.original_price) : null,
      category: product.category || null,
      brand: product.brand || null,
      sku: product.sku || null,
      barcode: product.barcode || null,
      stock_quantity: product.stock_quantity ? parseInt(product.stock_quantity) : null,
      image_url: product.image_url || null,
      product_url: product.product_url || null,
      source_platform: source,
      is_active: true,
      metadata: product.metadata || {},
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }));

    // Validate and clean products
    const validProducts = transformedProducts.filter(product => 
      product.name && product.name.trim().length > 0 && product.price > 0
    );

    console.log(`✅ ${validProducts.length}/${products.length} produits valides`);

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

    // Insert products into database
    const { data, error } = await supabase
      .from('imported_products')
      .upsert(validProducts, { 
        onConflict: 'retailer_id,external_id,source_platform',
        ignoreDuplicates: false 
      })
      .select();

    if (error) {
      console.error('❌ Erreur insertion DB:', error);
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