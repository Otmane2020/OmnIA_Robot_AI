const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
};

import { createClient } from 'npm:@supabase/supabase-js@2';

interface ProductSyncRequest {
  retailer_id?: string;
  force_full_sync?: boolean;
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, {
      status: 200,
      headers: corsHeaders,
    });
  }

  try {
    const { retailer_id, force_full_sync = false }: ProductSyncRequest = await req.json();
    
    console.log('🔄 Démarrage synchronisation produits Shopify...');

    // Initialize Supabase
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Log start of sync
    const { data: logEntry } = await supabase
      .from('training_logs')
      .insert({
        status: 'running',
        trigger_type: 'shopify_sync',
        products_processed: 0,
        attributes_extracted: 0,
        conversations_analyzed: 0
      })
      .select()
      .single();

    const startTime = Date.now();

    // Get active Shopify connections
    let connectionsQuery = supabase
      .from('shopify_connections')
      .select('*')
      .eq('status', 'active');

    if (retailer_id) {
      connectionsQuery = connectionsQuery.eq('retailer_id', retailer_id);
    }

    const { data: connections, error: connectionsError } = await connectionsQuery;

    if (connectionsError) {
      throw connectionsError;
    }

    if (!connections || connections.length === 0) {
      console.log('⚠️ Aucune connexion Shopify active trouvée');
      
      await supabase
        .from('training_logs')
        .update({
          status: 'failed',
          errors: 'Aucune connexion Shopify active',
          execution_time_ms: Date.now() - startTime
        })
        .eq('id', logEntry?.id);

      return new Response(
        JSON.stringify({
          success: false,
          message: 'Aucune connexion Shopify active',
          synced_products: 0
        }),
        {
          headers: { 'Content-Type': 'application/json', ...corsHeaders }
        }
      );
    }

    console.log('🏪 Connexions Shopify trouvées:', connections.length);

    let totalSynced = 0;
    const syncResults = [];

    // Sync each Shopify store
    for (const connection of connections) {
      try {
        console.log(`🔄 Sync boutique: ${connection.shop_name}`);

        // Fetch products from Shopify
        const shopifyProducts = await fetchShopifyProducts(connection);
        console.log(`📦 Produits récupérés: ${shopifyProducts.length}`);

        // Sync to database
        const syncedCount = await syncProductsToDatabase(supabase, shopifyProducts, connection);
        
        totalSynced += syncedCount;
        
        syncResults.push({
          shop_name: connection.shop_name,
          shop_domain: connection.shop_domain,
          products_synced: syncedCount,
          success: true
        });

        console.log(`✅ ${connection.shop_name}: ${syncedCount} produits synchronisés`);

        // Update connection stats
        await supabase
          .from('shopify_connections')
          .update({
            last_sync_at: new Date().toISOString(),
            products_count: syncedCount
          })
          .eq('id', connection.id);

        // Trigger ML attribute extraction for new products
        if (syncedCount > 0) {
          await triggerMLAttributeExtraction(supabase, shopifyProducts);
        }

      } catch (error) {
        console.error(`❌ Erreur sync ${connection.shop_name}:`, error);
        
        syncResults.push({
          shop_name: connection.shop_name,
          shop_domain: connection.shop_domain,
          products_synced: 0,
          success: false,
          error: error.message
        });
      }

      // Pause between stores to avoid rate limits
      await new Promise(resolve => setTimeout(resolve, 1000));
    }

    // Update training log
    const executionTime = Date.now() - startTime;
    await supabase
      .from('training_logs')
      .update({
        status: totalSynced > 0 ? 'success' : 'failed',
        products_processed: totalSynced,
        execution_time_ms: executionTime,
        errors: syncResults.filter(r => !r.success).map(r => r.error).join('; ') || null
      })
      .eq('id', logEntry?.id);

    console.log('✅ Synchronisation terminée:', totalSynced, 'produits');

    return new Response(
      JSON.stringify({
        success: true,
        message: `Synchronisation terminée: ${totalSynced} produits mis à jour`,
        total_synced: totalSynced,
        connections_processed: connections.length,
        results: syncResults,
        execution_time_ms: executionTime
      }),
      {
        headers: {
          'Content-Type': 'application/json',
          ...corsHeaders,
        },
      }
    );

  } catch (error) {
    console.error('❌ Erreur synchronisation produits:', error);
    
    return new Response(
      JSON.stringify({
        success: false,
        error: 'Erreur lors de la synchronisation des produits',
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

async function fetchShopifyProducts(connection: any) {
  try {
    console.log('📡 Récupération produits Shopify...');

    // Use Admin API with access token
    const response = await fetch(`https://${connection.shop_domain}/admin/api/2024-01/products.json?limit=250`, {
      method: 'GET',
      headers: {
        'X-Shopify-Access-Token': connection.access_token,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('❌ Erreur Shopify API:', response.status, errorText);
      throw new Error(`Shopify API error: ${response.status} - ${errorText}`);
    }

    const data = await response.json();
    const products = data.products || [];
    
    console.log('✅ Produits Shopify récupérés:', products.length);
    return products;

  } catch (error) {
    console.error('❌ Erreur fetch Shopify:', error);
    throw error;
  }
}

async function syncProductsToDatabase(supabase: any, shopifyProducts: any[], connection: any) {
  let syncedCount = 0;

  try {
    console.log('💾 Synchronisation en base de données...');

    for (const product of shopifyProducts) {
      try {
        const firstVariant = product.variants?.[0] || {};
        const firstImage = product.images?.[0] || {};

        // Check if product was modified
        const { data: existingProduct } = await supabase
          .from('products')
          .select('updated_at')
          .eq('shopify_id', product.id.toString())
          .single();

        const productUpdatedAt = new Date(product.updated_at);
        const isNewOrUpdated = !existingProduct || 
          productUpdatedAt > new Date(existingProduct.updated_at);

        if (isNewOrUpdated || force_full_sync) {
          // Clean HTML description
          const cleanDescription = product.body_html 
            ? product.body_html.replace(/<[^>]*>/g, '').replace(/&[^;]+;/g, ' ').trim()
            : '';

          const productData = {
            shopify_id: product.id.toString(),
            handle: product.handle,
            title: product.title || 'Produit sans nom',
            body_html: cleanDescription.substring(0, 2000),
            vendor: product.vendor || connection.shop_name,
            product_category: product.product_type || 'Mobilier',
            type: product.product_type || 'Mobilier',
            tags: product.tags || [],
            price: firstVariant.price ? parseFloat(firstVariant.price) : 0,
            image_url: firstImage.src || '',
            stock_qty: firstVariant.inventory_quantity || 0,
            status: product.status === 'active' ? 'active' : 'draft',
            last_synced_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          };

          const { error: upsertError } = await supabase
            .from('products')
            .upsert(productData, { 
              onConflict: 'shopify_id',
              ignoreDuplicates: false 
            });

          if (upsertError) {
            console.error('❌ Erreur upsert produit:', upsertError);
          } else {
            syncedCount++;
          }
        }

      } catch (productError) {
        console.error('❌ Erreur sync produit individuel:', productError);
      }
    }

    console.log(`✅ Synchronisation terminée: ${syncedCount}/${shopifyProducts.length} produits`);
    return syncedCount;

  } catch (error) {
    console.error('❌ Erreur sync base de données:', error);
    return syncedCount;
  }
}

async function triggerMLAttributeExtraction(supabase: any, products: any[]) {
  try {
    console.log('🧠 Déclenchement extraction attributs ML...');

    // Call ML attribute extractor
    const extractionResponse = await fetch(`${Deno.env.get('SUPABASE_URL')}/functions/v1/ml-attribute-extractor`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        products: products.slice(0, 50), // Limit to avoid timeout
        trigger_type: 'sync_update'
      }),
    });

    if (extractionResponse.ok) {
      const result = await extractionResponse.json();
      console.log('✅ Extraction ML déclenchée:', result.stats);
    } else {
      console.log('⚠️ Extraction ML échouée, produits synchronisés sans attributs');
    }

  } catch (error) {
    console.error('❌ Erreur déclenchement ML:', error);
  }
}