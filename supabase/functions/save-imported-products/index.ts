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

    // Validate and clean products
    const validProducts = products.filter(product => 
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
    // Map products to match imported_products table schema
    const mappedProducts = validProducts.map(product => ({
      external_id: product.external_id || product.id || `product-${Date.now()}-${Math.random()}`,
      retailer_id: retailer_id,
      name: product.name || product.title,
      description: product.description || product.body_html || '',
      price: parseFloat(product.price) || 0,
      compare_at_price: product.compare_at_price ? parseFloat(product.compare_at_price) : null,
      category: product.category || product.product_type || '',
      vendor: product.vendor || '',
      image_url: product.image_url || product.image_src || '',
      product_url: product.product_url || product.handle ? `https://example.com/products/${product.handle}` : '',
      stock: parseInt(product.stock) || parseInt(product.variant_inventory_qty) || 0,
      source_platform: source,
      status: product.status || 'active',
      inventory_management: product.inventory_management || 'shopify',
      extracted_attributes: product.extracted_attributes || {},
      shopify_data: {
        ...product,
        variants: product.variants || []
      }
    }));

    const { data, error } = await supabase
      .from('imported_products')
      .upsert(mappedProducts, { 
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
        message: `${mappedProducts.length} produits sauvegardés avec succès`,
        saved_count: mappedProducts.length,
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