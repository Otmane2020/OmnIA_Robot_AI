const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
};

import { createClient } from 'npm:@supabase/supabase-js@2';

interface GetLogsRequest {
  limit?: number;
  status_filter?: string;
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, {
      status: 200,
      headers: corsHeaders,
    });
  }

  try {
    const { limit = 20, status_filter }: GetLogsRequest = await req.json();
    
    console.log('📋 Récupération logs d\'entraînement:', { limit, status_filter });

    // Initialize Supabase
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Construire la requête
    let query = supabase
      .from('training_logs')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(limit);

    if (status_filter && status_filter !== 'all') {
      query = query.eq('status', status_filter);
    }

    const { data: logs, error } = await query;

    if (error) {
      console.error('❌ Erreur récupération logs:', error);
      throw error;
    }

    console.log('✅ Logs récupérés:', logs?.length || 0);

    // Enrichir les logs avec des informations parsées
    const enrichedLogs = (logs || []).map(log => {
      let parsedLog;
      try {
        parsedLog = typeof log.log === 'string' ? JSON.parse(log.log) : log.log;
      } catch {
        parsedLog = { message: log.log };
      }

      return {
        ...log,
        parsed_log: parsedLog,
        type: parsedLog.type || 'unknown',
        stats: parsedLog.stats || null,
        error_details: parsedLog.error || null
      };
    });

    return new Response(
      JSON.stringify({
        success: true,
        logs: enrichedLogs,
        total_count: logs?.length || 0,
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
    console.error('❌ Erreur récupération logs:', error);
    
    return new Response(
      JSON.stringify({
        success: false,
        error: 'Erreur lors de la récupération des logs',
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