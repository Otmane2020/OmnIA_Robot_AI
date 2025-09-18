const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
};

import { createClient } from 'npm:@supabase/supabase-js@2';

interface GetStatsRequest {
  retailer_id: string;
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, {
      status: 200,
      headers: corsHeaders,
    });
  }

  try {
    const { retailer_id }: GetStatsRequest = await req.json();
    
    console.log('📊 Récupération stats ML pour:', retailer_id);

    // Initialize Supabase
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Récupérer les métadonnées d'entraînement
    const { data: metadata } = await supabase
      .from('ai_training_metadata')
      .select('*')
      .single();

    // Compter les produits avec attributs
    const { count: productsWithAttributes } = await supabase
      .from('product_attributes')
      .select('product_id', { count: 'exact', head: true })
      .not('product_id', 'is', null);

    // Compter les conversations récentes
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    
    const { count: recentConversations } = await supabase
      .from('conversations')
      .select('id', { count: 'exact', head: true })
      .gte('created_at', yesterday.toISOString());

    // Calculer le taux de succès depuis les logs
    const { data: recentLogs } = await supabase
      .from('training_logs')
      .select('status')
      .order('created_at', { ascending: false })
      .limit(10);

    const successRate = recentLogs && recentLogs.length > 0 
      ? (recentLogs.filter(log => log.status === 'success').length / recentLogs.length) * 100
      : 0;

    // Compter les attributs extraits
    const { count: totalAttributes } = await supabase
      .from('product_attributes')
      .select('id', { count: 'exact', head: true });

    const stats = {
      last_training: metadata?.last_training || new Date().toISOString(),
      products_processed: metadata?.products_count || 0,
      attributes_extracted: totalAttributes || 0,
      conversations_analyzed: recentConversations || 0,
      success_rate: Math.round(successRate),
      model_version: metadata?.model_version || '1.0',
      training_type: metadata?.training_type || 'auto',
      updated_at: metadata?.updated_at || new Date().toISOString()
    };

    console.log('✅ Stats ML récupérées:', stats);

    return new Response(
      JSON.stringify({
        success: true,
        stats,
        retailer_id,
        retrieved_at: new Date().toISOString()
      }),
      {
        headers: {
          'Content-Type': 'application/json',
          ...corsHeaders,
        },
      }
    );

  } catch (error) {
    console.error('❌ Erreur récupération stats ML:', error);
    
    return new Response(
      JSON.stringify({
        success: false,
        error: 'Erreur lors de la récupération des statistiques ML',
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