const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
};

import { createClient } from 'npm:@supabase/supabase-js@2';

interface SaveEnrichedRequest {
  products: any[];
  retailer_id?: string;
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, {
      status: 200,
      headers: corsHeaders,
    });
  }

  try {
    const { products, retailer_id }: SaveEnrichedRequest = await req.json();
    
    console.log('💾 [save-enriched] Sauvegarde produits enrichis:', {
      products_count: products.length,
      retailer_id
    });

    // Initialize Supabase
    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
    
    if (!supabaseUrl || !supabaseKey) {
      throw new Error('Configuration Supabase manquante');
    }
    
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Valider et nettoyer les produits
    const validProducts = products.filter(product => 
      product.title && product.title.trim().length > 0 && product.price > 0
    );

    console.log(`✅ [save-enriched] ${validProducts.length}/${products.length} produits valides`);

    if (validProducts.length === 0) {
      return new Response(
        JSON.stringify({
          success: false,
          error: 'Aucun produit valide à sauvegarder'
        }),
        {
          status: 400,
          headers: { 'Content-Type': 'application/json', ...corsHeaders }
        }
      );
    }

    // Préparer les données pour insertion
    const enrichedData = validProducts.map(product => ({
      id: product.id || crypto.randomUUID(),
      handle: product.handle || generateHandle(product.title),
      title: product.title,
      description: product.description || '',
      category: product.category || 'Mobilier',
      subcategory: product.subcategory || '',
      color: product.color || '',
      material: product.material || '',
      fabric: product.fabric || '',
      style: product.style || '',
      dimensions: product.dimensions || '',
      room: product.room || '',
      price: parseFloat(product.price) || 0,
      stock_qty: parseInt(product.stock_qty) || 0,
      image_url: product.image_url || '',
      product_url: product.product_url || '',
      tags: Array.isArray(product.tags) ? product.tags : [],
      seo_title: product.seo_title || product.title,
      seo_description: product.seo_description || '',
      ad_headline: product.ad_headline || '',
      ad_description: product.ad_description || '',
      google_product_category: product.google_product_category || '',
      gtin: product.gtin || '',
      brand: product.brand || 'Decora Home',
      confidence_score: product.confidence_score || 50,
      enriched_at: product.enriched_at || new Date().toISOString(),
      enrichment_source: product.enrichment_source || 'manual',
      retailer_id: retailer_id
    }));

    // Insérer dans products_enriched
    const { data, error } = await supabase
      .from('products_enriched')
      .upsert(enrichedData, { 
        onConflict: 'handle',
        ignoreDuplicates: false 
      })
      .select();

    if (error) {
      console.error('❌ [save-enriched] Erreur insertion:', error);
      throw error;
    }

    console.log('✅ [save-enriched] Produits sauvegardés:', data?.length || 0);

    return new Response(
      JSON.stringify({
        success: true,
        message: `${validProducts.length} produits enrichis sauvegardés`,
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
    console.error('❌ [save-enriched] Erreur:', error);
    
    return new Response(
      JSON.stringify({
        success: false,
        error: 'Erreur lors de la sauvegarde des produits enrichis',
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

function generateHandle(title: string): string {
  return title
    .toLowerCase()
    .normalize('NFD').replace(/[\u0300-\u036f]/g, '') // Supprimer accents
    .replace(/[^a-z0-9\s-]/g, '')
    .trim()
    .replace(/\s+/g, '-')
    .substring(0, 100);
}