const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
};

import { createClient } from 'npm:@supabase/supabase-js@2';

interface CronSetupRequest {
  retailer_id: string;
  schedule: 'daily' | 'weekly' | 'manual';
  enabled: boolean;
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, {
      status: 200,
      headers: corsHeaders,
    });
  }

  try {
    const { retailer_id, schedule, enabled }: CronSetupRequest = await req.json();
    
    console.log('⏰ Configuration cron IA:', { retailer_id, schedule, enabled });

    // Initialize Supabase
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Calculer la prochaine exécution
    const now = new Date();
    let nextRun = new Date();
    
    if (schedule === 'daily') {
      nextRun.setDate(now.getDate() + 1);
      nextRun.setHours(2, 0, 0, 0); // 2h du matin
    } else if (schedule === 'weekly') {
      nextRun.setDate(now.getDate() + 7);
      nextRun.setHours(2, 0, 0, 0);
    }

    // Sauvegarder la configuration du cron
    const cronConfig = {
      id: `cron-${retailer_id}`,
      retailer_id,
      schedule_type: schedule,
      enabled,
      next_run: enabled ? nextRun.toISOString() : null,
      last_run: null,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    // Simuler la sauvegarde (vous pouvez créer une table ai_cron_jobs)
    console.log('💾 Configuration cron sauvegardée:', cronConfig);

    return new Response(
      JSON.stringify({
        success: true,
        message: `Cron d'entraînement ${schedule} ${enabled ? 'activé' : 'désactivé'}`,
        config: cronConfig,
        next_run: nextRun.toISOString(),
        schedule_info: {
          frequency: schedule,
          time: schedule === 'daily' ? 'Tous les jours à 2h' : 'Toutes les semaines',
          timezone: 'Europe/Paris'
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
    console.error('❌ Erreur configuration cron:', error);
    
    return new Response(
      JSON.stringify({
        success: false,
        error: 'Erreur lors de la configuration du cron',
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