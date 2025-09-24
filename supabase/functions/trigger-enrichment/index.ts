const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
};

import { createClient } from 'npm:@supabase/supabase-js@2';

interface TriggerEnrichmentRequest {
  retailer_id?: string;
  product_ids?: string[];
  batch_size?: number;
  priority?: number;
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, {
      status: 200,
      headers: corsHeaders,
    });
  }

  try {
    const { 
      retailer_id, 
      product_ids, 
      batch_size = 50, 
      priority = 5 
    }: TriggerEnrichmentRequest = await req.json();
    
    console.log('🚀 Déclenchement enrichissement manuel:', {
      retailer_id,
      product_ids_count: product_ids?.length,
      batch_size,
      priority
    });

    // Initialize Supabase
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Call the database function to trigger manual enrichment
    const { data: result, error } = await supabase.rpc('trigger_manual_enrichment', {
      retailer_id_param: retailer_id,
      batch_size: batch_size
    });

    if (error) {
      throw error;
    }

    console.log('✅ Enrichissement déclenché:', result);

    // If specific product IDs provided, add them to queue with high priority
    if (product_ids && product_ids.length > 0) {
      const queueItems = product_ids.map(productId => ({
        catalog_product_id: productId,
        retailer_id: retailer_id || 'demo-retailer-id',
        operation_type: 'UPDATE',
        priority: Math.max(priority, 8), // High priority for manual requests
        status: 'pending'
      }));

      const { error: queueError } = await supabase
        .from('enrichment_queue')
        .insert(queueItems);

      if (queueError) {
        console.error('❌ Erreur ajout queue spécifique:', queueError);
      } else {
        console.log(`✅ ${product_ids.length} produits spécifiques ajoutés à la queue`);
      }
    }

    // Trigger immediate processing
    const processingResponse = await fetch(`${supabaseUrl}/functions/v1/enrichment-processor`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${supabaseKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        batch_size: Math.min(batch_size, 20), // Limit for immediate processing
        retailer_id: retailer_id
      }),
    });

    let processingResult = null;
    if (processingResponse.ok) {
      processingResult = await processingResponse.json();
      console.log('✅ Traitement immédiat déclenché:', processingResult.stats);
    }

    return new Response(
      JSON.stringify({
        success: true,
        message: `Enrichissement déclenché pour ${result.queued_products} produits`,
        queue_stats: result,
        immediate_processing: processingResult?.stats || null,
        next_steps: [
          'Les produits sont en cours d\'enrichissement avec DeepSeek',
          'Consultez l\'onglet "Catalogue Enrichi" pour voir les résultats',
          'Les données enrichies apparaîtront automatiquement dans l\'interface'
        ]
      }),
      {
        headers: {
          'Content-Type': 'application/json',
          ...corsHeaders,
        },
      }
    );

  } catch (error) {
    console.error('❌ Erreur déclenchement enrichissement:', error);
    
    return new Response(
      JSON.stringify({
        success: false,
        error: 'Erreur lors du déclenchement de l\'enrichissement',
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