const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
};

import { createClient } from 'npm:@supabase/supabase-js@2';

// NOUVEAU: Cron job quotidien automatique pour l'entraînement IA
Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, {
      status: 200,
      headers: corsHeaders,
    });
  }

  try {
    console.log('🤖 CRON QUOTIDIEN: Démarrage entraînement IA automatique...');
    console.log('⏰ Heure d\'exécution:', new Date().toLocaleString('fr-FR'));

    // Initialize Supabase
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // NOUVEAU: Récupérer tous les revendeurs actifs avec leurs produits
    const { data: retailers, error: retailersError } = await supabase
      .from('retailers')
      .select('id, company_name, email, plan')
      .eq('status', 'active');

    if (retailersError) {
      throw retailersError;
    }

    console.log('🏪 Revendeurs actifs à entraîner:', retailers?.length || 0);

    const results = [];
    let totalProductsProcessed = 0;
    let totalConversationsAnalyzed = 0;

    // Entraîner l'IA pour chaque revendeur
    for (const retailer of retailers || []) {
      try {
        console.log(`🔄 CRON: Entraînement ${retailer.company_name} (${retailer.plan})...`);

        // 1. Récupérer les produits du revendeur (nouveaux et modifiés)
        const { data: products, error: productsError } = await supabase
          .from('retailer_products')
          .select('*')
          .eq('retailer_id', retailer.id)
          .eq('status', 'active')
          .gte('updated_at', new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString()); // Dernières 24h

        if (productsError || !products || products.length === 0) {
          console.log(`⚠️ Aucun produit récent pour ${retailer.company_name}`);
          continue;
        }

        // 2. Analyser les conversations récentes (dernières 24h)
        const { data: conversations } = await supabase
          .from('retailer_conversations')
          .select('*')
          .eq('retailer_id', retailer.id)
          .gte('created_at', new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString());

        // 3. Déclencher l'entraînement automatique avec produits + conversations
        const trainingResponse = await fetch(`${supabaseUrl}/functions/v1/auto-ai-trainer`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${supabaseKey}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            products: products,
            conversations: conversations || [],
            source: 'cron',
            store_id: retailer.id,
            trigger_type: 'daily_cron',
            cron_time: new Date().toISOString()
          }),
        });

        if (trainingResponse.ok) {
          const trainingResult = await trainingResponse.json();
          totalProductsProcessed += trainingResult.stats?.products_processed || 0;
          totalConversationsAnalyzed += conversations?.length || 0;
          
          results.push({
            retailer_id: retailer.id,
            company_name: retailer.company_name,
            plan: retailer.plan,
            success: true,
            products_processed: trainingResult.stats?.products_processed || 0,
            conversations_analyzed: conversations?.length || 0,
            confidence_avg: trainingResult.stats?.confidence_avg || 0,
            execution_time: trainingResult.stats?.execution_time || '0ms'
          });
          console.log(`✅ CRON: ${retailer.company_name} - ${trainingResult.stats?.products_processed || 0} produits, ${conversations?.length || 0} conversations`);
        } else {
          results.push({
            retailer_id: retailer.id,
            company_name: retailer.company_name,
            plan: retailer.plan,
            success: false,
            error: 'Erreur entraînement IA'
          });
          console.log(`❌ CRON: Erreur entraînement ${retailer.company_name}`);
        }

        // Pause entre les revendeurs pour éviter la surcharge
        await new Promise(resolve => setTimeout(resolve, 1000));

      } catch (error) {
        console.error(`❌ CRON: Erreur ${retailer.company_name}:`, error);
        results.push({
          retailer_id: retailer.id,
          company_name: retailer.company_name,
          plan: retailer.plan,
          success: false,
          error: error.message
        });
      }
    }

    // NOUVEAU: Mettre à jour les métadonnées globales d'entraînement
    const successfulTrainings = results.filter(r => r.success);

    await supabase
      .from('ai_training_metadata')
      .upsert({
        id: 'singleton',
        last_training: new Date().toISOString(),
        products_count: totalProductsProcessed,
        conversations_analyzed: totalConversationsAnalyzed,
        training_type: 'daily_cron_auto',
        model_version: '2.0-cron',
        success_rate: successfulTrainings.length / results.length * 100,
        retailers_processed: results.length,
        cron_execution_time: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }, { onConflict: 'id' });

    // NOUVEAU: Sauvegarder les logs détaillés du cron
    await supabase.from('training_logs').insert({
      status: successfulTrainings.length > 0 ? 'success' : 'failed',
      log: JSON.stringify({
        type: 'daily_cron_execution',
        execution_time: new Date().toISOString(),
        retailers_processed: results.length,
        successful_trainings: successfulTrainings.length,
        total_products_processed: totalProductsProcessed,
        total_conversations_analyzed: totalConversationsAnalyzed,
        results: results
      }),
      products_processed: totalProductsProcessed,
      conversations_analyzed: totalConversationsAnalyzed,
      trigger_type: 'daily_cron',
      created_at: new Date().toISOString()
    });

    console.log('✅ CRON QUOTIDIEN TERMINÉ:', {
      retailers: results.length,
      successful: successfulTrainings.length,
      products: totalProductsProcessed,
      conversations: totalConversationsAnalyzed,
      retailers_processed: results.length,
      successful: successfulTrainings.length,
      total_products: totalProductsProcessed
    });

    return new Response(
      JSON.stringify({
        success: true,
        message: `🤖 CRON QUOTIDIEN TERMINÉ: ${successfulTrainings.length}/${results.length} revendeurs traités avec succès`,
        stats: {
          retailers_processed: results.length,
          successful_trainings: successfulTrainings.length,
          total_products_processed: totalProductsProcessed,
          total_conversations_analyzed: totalConversationsAnalyzed,
          execution_time: new Date().toISOString(),
          next_execution: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(), // Demain même heure
          cron_type: 'daily_auto',
          execution_time: new Date().toISOString(),
          results: results
        }
      }),
      {
        headers: {
          'Content-Type': 'application/json',
          ...corsHeaders,
        },
      }
    );

  } catch (error) {
    console.error('❌ Erreur cron quotidien:', error);
    
    return new Response(
      JSON.stringify({
        success: false,
        error: 'Erreur lors du cron quotidien d\'entraînement IA',
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