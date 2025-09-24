const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
};

import { createClient } from 'npm:@supabase/supabase-js@2';

interface EnrichmentProcessorRequest {
  batch_size?: number;
  retailer_id?: string;
  force_reprocess?: boolean;
}

interface EnrichmentResult {
  success: boolean;
  processed_count: number;
  error_count: number;
  processing_time_ms: number;
  details: Array<{
    product_id: string;
    product_name: string;
    status: 'success' | 'failed';
    confidence_score?: number;
    error?: string;
  }>;
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
      batch_size = 10, 
      retailer_id, 
      force_reprocess = false 
    }: EnrichmentProcessorRequest = await req.json();
    
    console.log('🔄 Démarrage processeur d\'enrichissement:', {
      batch_size,
      retailer_id,
      force_reprocess
    });

    const startTime = Date.now();

    // Initialize Supabase
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Get DeepSeek API key
    const deepseekApiKey = Deno.env.get('DEEPSEEK_API_KEY');
    
    if (!deepseekApiKey) {
      console.error('❌ Clé API DeepSeek manquante');
      return new Response(
        JSON.stringify({
          success: false,
          error: 'DeepSeek API key not configured',
          details: 'Add DEEPSEEK_API_KEY to environment variables'
        }),
        {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );
    }

    // Process enrichment queue
    const result = await processEnrichmentQueue(
      supabase, 
      deepseekApiKey, 
      batch_size, 
      retailer_id, 
      force_reprocess
    );

    const processingTime = Date.now() - startTime;

    console.log('✅ Enrichissement terminé:', {
      processed: result.processed_count,
      errors: result.error_count,
      time: processingTime + 'ms'
    });

    return new Response(
      JSON.stringify({
        success: true,
        message: `Enrichissement terminé: ${result.processed_count} produits traités`,
        stats: {
          processed_count: result.processed_count,
          error_count: result.error_count,
          processing_time_ms: processingTime,
          batch_size,
          retailer_id: retailer_id || 'all'
        },
        details: result.details
      }),
      {
        headers: {
          'Content-Type': 'application/json',
          ...corsHeaders,
        },
      }
    );

  } catch (error) {
    console.error('❌ Erreur processeur enrichissement:', error);
    
    return new Response(
      JSON.stringify({
        success: false,
        error: 'Erreur lors du traitement de l\'enrichissement',
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

async function processEnrichmentQueue(
  supabase: any,
  deepseekApiKey: string,
  batchSize: number,
  retailerId?: string,
  forceReprocess: boolean = false
): Promise<EnrichmentResult> {
  const result: EnrichmentResult = {
    success: true,
    processed_count: 0,
    error_count: 0,
    processing_time_ms: 0,
    details: []
  };

  try {
    // Get pending queue items
    let queueQuery = supabase
      .from('enrichment_queue')
      .select(`
        id,
        catalog_product_id,
        retailer_id,
        operation_type,
        retry_count,
        product_catalog!inner(
          id,
          name,
          description,
          category,
          price,
          compare_at_price,
          vendor,
          image_url,
          product_url,
          stock_quantity
        )
      `)
      .eq('status', 'pending')
      .lt('retry_count', 3)
      .order('priority', { ascending: false })
      .order('created_at', { ascending: true })
      .limit(batchSize);

    if (retailerId) {
      queueQuery = queueQuery.eq('retailer_id', retailerId);
    }

    const { data: queueItems, error: queueError } = await queueQuery;

    if (queueError) {
      throw queueError;
    }

    if (!queueItems || queueItems.length === 0) {
      console.log('📭 Aucun élément en attente dans la queue d\'enrichissement');
      return result;
    }

    console.log(`📦 Traitement de ${queueItems.length} éléments de la queue...`);

    // Process each queue item
    for (const queueItem of queueItems) {
      const itemStartTime = Date.now();
      
      try {
        // Mark as processing
        await supabase
          .from('enrichment_queue')
          .update({ status: 'processing' })
          .eq('id', queueItem.id);

        const product = queueItem.product_catalog;
        
        console.log(`🔍 Enrichissement: ${product.name.substring(0, 30)}...`);

        // Call DeepSeek API for enrichment
        const enrichedData = await callDeepSeekEnrichment(product, deepseekApiKey);

        // Calculate additional fields
        const percentOff = product.compare_at_price && product.compare_at_price > product.price
          ? Math.round(((product.compare_at_price - product.price) / product.compare_at_price) * 100)
          : 0;

        // Upsert enriched product data
        const { error: upsertError } = await supabase
          .from('enriched_products')
          .upsert({
            catalog_product_id: product.id,
            retailer_id: queueItem.retailer_id,
            title: product.name,
            description: product.description || '',
            short_description: (product.description || product.name).substring(0, 160),
            price: product.price,
            compare_at_price: product.compare_at_price,
            currency: 'EUR',
            stock_quantity: product.stock_quantity,
            availability_status: product.stock_quantity > 0 ? 'in_stock' : 'out_of_stock',
            product_type: enrichedData.product_type || product.category || 'Mobilier',
            subcategory: enrichedData.subcategory || '',
            brand: product.vendor || enrichedData.brand || '',
            vendor: product.vendor || '',
            material: enrichedData.material || '',
            color: enrichedData.color || '',
            style: enrichedData.style || '',
            room: enrichedData.room || '',
            dimensions: enrichedData.dimensions || '',
            weight: enrichedData.weight || '',
            capacity: enrichedData.capacity || '',
            gtin: enrichedData.gtin || '',
            mpn: enrichedData.mpn || '',
            identifier_exists: !!(enrichedData.gtin || enrichedData.mpn),
            image_url: product.image_url || '',
            product_url: product.product_url || '',
            canonical_link: product.product_url || '',
            seo_title: enrichedData.seo_title || product.name,
            seo_description: enrichedData.seo_description || '',
            tags: enrichedData.tags || [product.category || 'mobilier'],
            percent_off: percentOff,
            ai_confidence: (enrichedData.confidence_score || 50) / 100,
            enrichment_source: 'deepseek',
            enrichment_version: '1.0',
            last_enriched_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          }, {
            onConflict: 'catalog_product_id'
          });

        if (upsertError) {
          throw upsertError;
        }

        // Mark queue item as completed
        await supabase
          .from('enrichment_queue')
          .update({ 
            status: 'completed', 
            processed_at: new Date().toISOString() 
          })
          .eq('id', queueItem.id);

        // Log successful enrichment
        await supabase
          .from('enrichment_logs')
          .insert({
            catalog_product_id: product.id,
            retailer_id: queueItem.retailer_id,
            operation_type: queueItem.operation_type,
            enrichment_status: 'success',
            api_response_data: enrichedData,
            processing_time_ms: Date.now() - itemStartTime,
            confidence_score: (enrichedData.confidence_score || 50) / 100,
            attributes_extracted: Object.keys(enrichedData).length
          });

        result.processed_count++;
        result.details.push({
          product_id: product.id,
          product_name: product.name,
          status: 'success',
          confidence_score: enrichedData.confidence_score || 50
        });

        console.log(`✅ Enrichi: ${product.name.substring(0, 30)} (${enrichedData.confidence_score || 50}% confiance)`);

        // Small delay to avoid rate limiting
        await new Promise(resolve => setTimeout(resolve, 200));

      } catch (error) {
        console.error(`❌ Erreur enrichissement produit ${queueItem.id}:`, error);

        // Increment retry count
        const newRetryCount = queueItem.retry_count + 1;
        const newStatus = newRetryCount >= 3 ? 'failed' : 'pending';

        await supabase
          .from('enrichment_queue')
          .update({ 
            status: newStatus,
            retry_count: newRetryCount,
            error_message: error.message,
            processed_at: newStatus === 'failed' ? new Date().toISOString() : null
          })
          .eq('id', queueItem.id);

        // Log the error
        await supabase
          .from('enrichment_logs')
          .insert({
            catalog_product_id: queueItem.catalog_product_id,
            retailer_id: queueItem.retailer_id,
            operation_type: queueItem.operation_type,
            enrichment_status: 'failed',
            error_message: error.message,
            error_details: {
              error_code: error.code || 'UNKNOWN',
              retry_count: newRetryCount,
              queue_id: queueItem.id
            },
            processing_time_ms: Date.now() - itemStartTime
          });

        result.error_count++;
        result.details.push({
          product_id: queueItem.catalog_product_id,
          product_name: queueItem.product_catalog?.name || 'Unknown',
          status: 'failed',
          error: error.message
        });
      }
    }

    return result;

  } catch (error) {
    console.error('❌ Erreur traitement queue:', error);
    result.success = false;
    throw error;
  }
}

async function callDeepSeekEnrichment(product: any, apiKey: string) {
  const productText = `
PRODUIT: ${product.name || ''}
DESCRIPTION: ${product.description || ''}
CATÉGORIE: ${product.category || ''}
PRIX: ${product.price || 0}€
VENDEUR: ${product.vendor || ''}
  `.trim();

  const prompt = `Tu es un expert en mobilier et e-commerce. Analyse ce produit et enrichis-le au format JSON strict.

${productText}

ENRICHIS au format JSON exact :
{
  "product_type": "Canapé|Table|Chaise|Lit|Rangement|Meuble TV|Décoration",
  "subcategory": "sous-catégorie spécifique",
  "material": "matériau principal",
  "color": "couleur principale",
  "style": "Moderne|Contemporain|Scandinave|Industriel|Vintage|Classique|Minimaliste",
  "room": "Salon|Chambre|Cuisine|Bureau|Salle à manger|Entrée",
  "dimensions": "LxlxH en cm si trouvé",
  "weight": "poids approximatif",
  "capacity": "capacité (ex: 4 places)",
  "gtin": "code-barres si disponible",
  "mpn": "référence fabricant",
  "seo_title": "TITRE SEO optimisé 60 caractères max",
  "seo_description": "META DESCRIPTION SEO 155 caractères max",
  "tags": ["tag1", "tag2", "tag3"],
  "confidence_score": 85
}

RÈGLES STRICTES:
- Réponse JSON uniquement, aucun texte supplémentaire
- confidence_score: 0-100 basé sur qualité des informations
- Si information manquante, valeur par défaut logique

RÉPONSE JSON:`;

  try {
    const response = await fetch('https://api.deepseek.com/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'deepseek-chat',
        messages: [
          {
            role: 'system',
            content: 'Tu es un expert en mobilier et e-commerce. Tu enrichis les données produit au format JSON strict. Aucun texte supplémentaire.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        max_tokens: 500,
        temperature: 0.1,
        stream: false
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`DeepSeek API error: ${response.status} - ${errorText}`);
    }

    const data = await response.json();
    const content = data.choices[0]?.message?.content?.trim();
    
    if (content) {
      try {
        const parsed = JSON.parse(content);
        console.log('✅ DeepSeek enrichissement réussi:', {
          product_type: parsed.product_type,
          material: parsed.material,
          color: parsed.color,
          confidence: parsed.confidence_score
        });
        
        return parsed;
      } catch (parseError) {
        console.error('❌ JSON invalide de DeepSeek:', content);
        throw new Error('Invalid JSON response from DeepSeek');
      }
    } else {
      throw new Error('Empty response from DeepSeek');
    }

  } catch (error) {
    console.error('❌ Erreur DeepSeek API:', error);
    
    // Return basic enrichment as fallback
    return {
      product_type: product.category || 'Mobilier',
      subcategory: '',
      material: '',
      color: '',
      style: 'Moderne',
      room: 'Salon',
      dimensions: '',
      weight: '',
      capacity: '',
      gtin: '',
      mpn: '',
      seo_title: product.name || '',
      seo_description: `Découvrez ${product.name || 'ce produit'} dans notre collection.`,
      tags: [product.category || 'mobilier'],
      confidence_score: 25,
      error: true,
      error_message: error.message
    };
  }
}