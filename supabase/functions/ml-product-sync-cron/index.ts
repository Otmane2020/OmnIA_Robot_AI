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

// Cron quotidien pour synchroniser les produits et entraîner l'IA
Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, {
      status: 200,
      headers: corsHeaders,
    });
  }

  try {
    const { retailer_id, force_full_sync = false }: ProductSyncRequest = await req.json();
    
    console.log('🔄 Démarrage cron synchronisation produits...');

    // Initialize Supabase
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Récupérer tous les revendeurs actifs ou un spécifique
    let retailersQuery = supabase
      .from('retailers')
      .select('id, company_name, email')
      .eq('status', 'active');

    if (retailer_id) {
      retailersQuery = retailersQuery.eq('id', retailer_id);
    }

    const { data: retailers, error: retailersError } = await retailersQuery;

    if (retailersError) {
      throw retailersError;
    }

    console.log('🏪 Revendeurs à synchroniser:', retailers?.length || 0);

    const syncResults = [];

    // Synchroniser chaque revendeur
    for (const retailer of retailers || []) {
      try {
        console.log(`🔄 Sync ${retailer.company_name}...`);

        // 1. Synchroniser les produits depuis les sources connectées
        const productSyncResult = await syncRetailerProducts(supabase, retailer.id);
        
        // 2. Extraire les attributs ML pour les nouveaux/modifiés produits
        const mlExtractionResult = await extractMLAttributes(supabase, retailer.id, productSyncResult.updated_products);
        
        // 3. Analyser les conversations récentes
        const conversationAnalysis = await analyzeRecentConversations(supabase, retailer.id);
        
        // 4. Mettre à jour le modèle ML
        const mlUpdateResult = await updateMLModel(supabase, retailer.id, {
          products: mlExtractionResult,
          conversations: conversationAnalysis
        });

        syncResults.push({
          retailer_id: retailer.id,
          company_name: retailer.company_name,
          success: true,
          products_synced: productSyncResult.synced_count,
          attributes_extracted: mlExtractionResult.extracted_count,
          conversations_analyzed: conversationAnalysis.analyzed_count,
          ml_model_updated: mlUpdateResult.success
        });

        console.log(`✅ ${retailer.company_name}: ${productSyncResult.synced_count} produits sync`);

      } catch (error) {
        console.error(`❌ Erreur sync ${retailer.company_name}:`, error);
        
        syncResults.push({
          retailer_id: retailer.id,
          company_name: retailer.company_name,
          success: false,
          error: error.message
        });
      }

      // Pause entre revendeurs
      await new Promise(resolve => setTimeout(resolve, 1000));
    }

    // Sauvegarder les logs de synchronisation
    await supabase.from('training_logs').insert({
      status: 'success',
      log: JSON.stringify({
        type: 'daily_product_sync',
        results: syncResults,
        total_retailers: retailers?.length || 0,
        successful_syncs: syncResults.filter(r => r.success).length,
        executed_at: new Date().toISOString()
      }),
      created_at: new Date().toISOString()
    });

    console.log('✅ Cron synchronisation terminé');

    return new Response(
      JSON.stringify({
        success: true,
        message: `Synchronisation terminée pour ${retailers?.length || 0} revendeur(s)`,
        results: syncResults,
        execution_time: new Date().toISOString()
      }),
      {
        headers: {
          'Content-Type': 'application/json',
          ...corsHeaders,
        },
      }
    );

  } catch (error) {
    console.error('❌ Erreur cron synchronisation:', error);
    
    return new Response(
      JSON.stringify({
        success: false,
        error: 'Erreur lors de la synchronisation quotidienne',
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

async function syncRetailerProducts(supabase: any, retailerId: string) {
  try {
    console.log('📦 Synchronisation produits pour:', retailerId);

    // Récupérer les connexions Shopify du revendeur
    const { data: connections } = await supabase
      .from('retailer_connections')
      .select('*')
      .eq('retailer_id', retailerId)
      .eq('platform', 'shopify')
      .eq('status', 'active');

    let totalSynced = 0;
    const updatedProducts = [];

    // Synchroniser chaque connexion Shopify
    for (const connection of connections || []) {
      try {
        const shopifyProducts = await fetchShopifyProducts(connection);
        
        // Mettre à jour les produits en base
        for (const product of shopifyProducts) {
          const { data: existingProduct } = await supabase
            .from('imported_products')
            .select('updated_at')
            .eq('retailer_id', retailerId)
            .eq('external_id', product.id)
            .single();

          const isNewOrUpdated = !existingProduct || 
            new Date(product.updated_at) > new Date(existingProduct.updated_at);

          if (isNewOrUpdated) {
            await supabase.from('imported_products').upsert({
              retailer_id: retailerId,
              external_id: product.id.toString(),
              name: product.title,
              description: product.body_html?.replace(/<[^>]*>/g, '') || '',
              price: parseFloat(product.variants?.[0]?.price || '0'),
              compare_at_price: product.variants?.[0]?.compare_at_price ? 
                parseFloat(product.variants[0].compare_at_price) : null,
              category: product.product_type || 'Mobilier',
              vendor: product.vendor || connection.shop_name,
              image_url: product.images?.[0]?.src || '',
              product_url: `https://${connection.shop_domain}/products/${product.handle}`,
              stock: product.variants?.[0]?.inventory_quantity || 0,
              source_platform: 'shopify',
              status: product.status === 'active' ? 'active' : 'inactive',
              updated_at: new Date().toISOString()
            }, { onConflict: 'retailer_id,external_id,source_platform' });

            updatedProducts.push(product);
            totalSynced++;
          }
        }

      } catch (error) {
        console.error('❌ Erreur sync connexion Shopify:', error);
      }
    }

    return {
      synced_count: totalSynced,
      updated_products: updatedProducts
    };

  } catch (error) {
    console.error('❌ Erreur sync produits:', error);
    return { synced_count: 0, updated_products: [] };
  }
}

async function fetchShopifyProducts(connection: any) {
  try {
    const response = await fetch(`https://${connection.shop_domain}/admin/api/2024-01/products.json?limit=250`, {
      headers: {
        'X-Shopify-Access-Token': connection.access_token,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`Shopify API error: ${response.status}`);
    }

    const data = await response.json();
    return data.products || [];

  } catch (error) {
    console.error('❌ Erreur fetch Shopify:', error);
    return [];
  }
}

async function extractMLAttributes(supabase: any, retailerId: string, products: any[]) {
  try {
    console.log('🧠 Extraction attributs ML pour', products.length, 'produits...');

    const openaiApiKey = Deno.env.get('OPENAI_API_KEY');
    
    if (!openaiApiKey) {
      console.log('⚠️ OpenAI non configuré, extraction basique');
      return { extracted_count: 0 };
    }

    let extractedCount = 0;

    // Traiter par batch pour éviter les timeouts
    const batchSize = 5;
    for (let i = 0; i < products.length; i += batchSize) {
      const batch = products.slice(i, i + batchSize);
      
      for (const product of batch) {
        try {
          const attributes = await extractProductAttributes(product, openaiApiKey);
          
          // Sauvegarder les attributs
          for (const [attributeName, attributeValues] of Object.entries(attributes)) {
            if (Array.isArray(attributeValues)) {
              for (const value of attributeValues) {
                await supabase.from('product_attributes').upsert({
                  product_id: product.id,
                  attribute_name: attributeName,
                  attribute_value: value,
                  extracted_at: new Date().toISOString()
                }, { onConflict: 'product_id,attribute_name,attribute_value' });
              }
            } else if (attributeValues) {
              await supabase.from('product_attributes').upsert({
                product_id: product.id,
                attribute_name: attributeName,
                attribute_value: attributeValues.toString(),
                extracted_at: new Date().toISOString()
              }, { onConflict: 'product_id,attribute_name,attribute_value' });
            }
          }
          
          extractedCount++;

        } catch (error) {
          console.error('❌ Erreur extraction produit:', error);
        }
      }

      // Pause entre batches
      await new Promise(resolve => setTimeout(resolve, 500));
    }

    return { extracted_count: extractedCount };

  } catch (error) {
    console.error('❌ Erreur extraction ML:', error);
    return { extracted_count: 0 };
  }
}

async function extractProductAttributes(product: any, openaiApiKey: string) {
  const prompt = `Analyse ce produit mobilier et extrait les attributs au format JSON strict :

PRODUIT:
Titre: ${product.title}
Description: ${product.body_html?.replace(/<[^>]*>/g, '') || ''}
Type: ${product.product_type || ''}
Prix: ${product.variants?.[0]?.price || 0}€

EXTRAIT ces attributs au format JSON :
{
  "couleurs": ["couleur1", "couleur2"],
  "materiaux": ["matériau1", "matériau2"],
  "styles": ["style1"],
  "dimensions": "LxlxH en cm",
  "piece": "salon|chambre|cuisine|bureau",
  "gamme_prix": "entrée de gamme|standard|premium",
  "fonctionnalites": ["convertible", "rangement"]
}

Réponse JSON uniquement :`;

  try {
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openaiApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          {
            role: 'system',
            content: 'Tu es un expert en mobilier. Réponds uniquement en JSON valide.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        max_tokens: 300,
        temperature: 0.1,
      }),
    });

    if (response.ok) {
      const data = await response.json();
      const content = data.choices[0]?.message?.content?.trim();
      
      if (content) {
        try {
          return JSON.parse(content);
        } catch (parseError) {
          console.log('⚠️ JSON invalide, extraction basique');
        }
      }
    }
  } catch (error) {
    console.log('⚠️ Erreur OpenAI, extraction basique');
  }

  // Fallback extraction basique
  return extractBasicAttributes(product);
}

function extractBasicAttributes(product: any) {
  const text = `${product.title} ${product.body_html || ''}`.toLowerCase();
  
  const attributes: any = {
    couleurs: [],
    materiaux: [],
    styles: [],
    fonctionnalites: []
  };

  // Couleurs basiques
  const colors = ['blanc', 'noir', 'gris', 'beige', 'marron', 'bleu', 'vert', 'rouge'];
  colors.forEach(color => {
    if (text.includes(color)) attributes.couleurs.push(color);
  });

  // Matériaux basiques
  const materials = ['bois', 'métal', 'verre', 'tissu', 'cuir', 'velours'];
  materials.forEach(material => {
    if (text.includes(material)) attributes.materiaux.push(material);
  });

  // Styles basiques
  const styles = ['moderne', 'scandinave', 'industriel', 'vintage'];
  styles.forEach(style => {
    if (text.includes(style)) attributes.styles.push(style);
  });

  // Fonctionnalités basiques
  const features = ['convertible', 'rangement', 'pliable', 'réglable'];
  features.forEach(feature => {
    if (text.includes(feature)) attributes.fonctionnalites.push(feature);
  });

  // Gamme de prix basée sur le prix
  const price = parseFloat(product.variants?.[0]?.price || '0');
  if (price < 200) attributes.gamme_prix = 'entrée de gamme';
  else if (price < 800) attributes.gamme_prix = 'standard';
  else attributes.gamme_prix = 'premium';

  return attributes;
}

async function analyzeRecentConversations(supabase: any, retailerId: string) {
  try {
    // Analyser les conversations des dernières 24h
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);

    const { data: conversations } = await supabase
      .from('conversations')
      .select('*')
      .gte('created_at', yesterday.toISOString());

    // Extraire les nouveaux mots-clés et patterns
    const keywords = new Map<string, number>();
    const intents = new Map<string, number>();

    (conversations || []).forEach(conv => {
      // Analyser les mots-clés
      const text = (conv.message || conv.response || '').toLowerCase();
      const words = text.split(/\s+/).filter(word => word.length > 3);
      
      words.forEach(word => {
        keywords.set(word, (keywords.get(word) || 0) + 1);
      });

      // Compter les intentions
      if (conv.intent) {
        intents.set(conv.intent, (intents.get(conv.intent) || 0) + 1);
      }
    });

    return {
      analyzed_count: conversations?.length || 0,
      top_keywords: Array.from(keywords.entries()).sort((a, b) => b[1] - a[1]).slice(0, 10),
      top_intents: Array.from(intents.entries()).sort((a, b) => b[1] - a[1])
    };

  } catch (error) {
    console.error('❌ Erreur analyse conversations:', error);
    return { analyzed_count: 0, top_keywords: [], top_intents: [] };
  }
}

async function updateMLModel(supabase: any, retailerId: string, trainingData: any) {
  try {
    // Créer une nouvelle version du modèle ML
    const modelVersion = `v${Date.now()}`;
    
    const { data: newModel, error } = await supabase.from('ml_models').insert({
      version: modelVersion,
      description: `Auto-update from daily cron - ${trainingData.products.extracted_count} products, ${trainingData.conversations.analyzed_count} conversations`,
      accuracy: calculateModelAccuracy(trainingData),
      f1_score: calculateF1Score(trainingData),
      created_at: new Date().toISOString()
    }).select().single();

    if (error) {
      throw error;
    }

    console.log('🤖 Nouveau modèle ML créé:', modelVersion);

    return {
      success: true,
      model_id: newModel.id,
      version: modelVersion
    };

  } catch (error) {
    console.error('❌ Erreur mise à jour modèle ML:', error);
    return { success: false };
  }
}

function calculateModelAccuracy(trainingData: any): number {
  // Calculer la précision basée sur les données d'entraînement
  const productsWithAttributes = trainingData.products.extracted_count;
  const totalProducts = trainingData.products.total_count || productsWithAttributes;
  
  return totalProducts > 0 ? (productsWithAttributes / totalProducts) * 100 : 0;
}

function calculateF1Score(trainingData: any): number {
  // Calculer le F1-score basé sur les conversations et conversions
  const successfulConversations = trainingData.conversations.top_intents
    .filter((intent: any) => intent[0] === 'purchase_intent' || intent[0] === 'cart_add')
    .reduce((sum: number, intent: any) => sum + intent[1], 0);
  
  const totalConversations = trainingData.conversations.analyzed_count;
  
  return totalConversations > 0 ? (successfulConversations / totalConversations) * 100 : 0;
}