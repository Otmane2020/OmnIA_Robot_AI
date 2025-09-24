const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
};

import { createClient } from 'npm:@supabase/supabase-js@2';

interface EnrichmentStatsRequest {
  retailer_id?: string;
  days_back?: number;
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, {
      status: 200,
      headers: corsHeaders,
    });
  }

  try {
    const { retailer_id, days_back = 7 }: EnrichmentStatsRequest = await req.json();
    
    console.log('📊 Récupération stats enrichissement:', { retailer_id, days_back });

    // Initialize Supabase
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Get overall enrichment statistics
    const { data: overallStats, error: statsError } = await supabase.rpc('get_enrichment_stats', {
      retailer_id_param: retailer_id
    });

    if (statsError) {
      throw statsError;
    }

    // Get recent enrichment activity
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days_back);

    const { data: recentLogs, error: logsError } = await supabase
      .from('enrichment_logs')
      .select('*')
      .gte('created_at', startDate.toISOString())
      .eq('retailer_id', retailer_id || 'demo-retailer-id')
      .order('created_at', { ascending: false })
      .limit(100);

    if (logsError) {
      throw logsError;
    }

    // Get queue status
    const { data: queueStats, error: queueError } = await supabase
      .from('enrichment_queue')
      .select('status, count(*)')
      .eq('retailer_id', retailer_id || 'demo-retailer-id')
      .group('status');

    if (queueError) {
      throw queueError;
    }

    // Calculate performance metrics
    const successfulLogs = recentLogs?.filter(log => log.enrichment_status === 'success') || [];
    const failedLogs = recentLogs?.filter(log => log.enrichment_status === 'failed') || [];
    
    const avgProcessingTime = successfulLogs.length > 0
      ? successfulLogs.reduce((sum, log) => sum + (log.processing_time_ms || 0), 0) / successfulLogs.length
      : 0;

    const avgConfidence = successfulLogs.length > 0
      ? successfulLogs.reduce((sum, log) => sum + (log.confidence_score || 0), 0) / successfulLogs.length
      : 0;

    // Group logs by day for trend analysis
    const dailyStats = {};
    recentLogs?.forEach(log => {
      const day = log.created_at.split('T')[0];
      if (!dailyStats[day]) {
        dailyStats[day] = { success: 0, failed: 0, total: 0 };
      }
      dailyStats[day][log.enrichment_status === 'success' ? 'success' : 'failed']++;
      dailyStats[day].total++;
    });

    const stats = {
      overview: overallStats,
      performance: {
        total_operations: recentLogs?.length || 0,
        successful_operations: successfulLogs.length,
        failed_operations: failedLogs.length,
        success_rate: recentLogs?.length > 0 
          ? Math.round((successfulLogs.length / recentLogs.length) * 100) 
          : 0,
        avg_processing_time_ms: Math.round(avgProcessingTime),
        avg_confidence_score: Math.round(avgConfidence * 100),
        period_days: days_back
      },
      queue_status: queueStats?.reduce((acc, item) => {
        acc[item.status] = item.count;
        return acc;
      }, {}) || {},
      daily_trends: Object.entries(dailyStats).map(([date, stats]) => ({
        date,
        ...stats
      })).sort((a, b) => a.date.localeCompare(b.date)),
      recent_errors: failedLogs.slice(0, 10).map(log => ({
        product_id: log.catalog_product_id,
        error_message: log.error_message,
        created_at: log.created_at,
        retry_count: log.error_details?.retry_count || 0
      })),
      top_categories: await getTopCategories(supabase, retailer_id),
      enrichment_coverage: await getEnrichmentCoverage(supabase, retailer_id)
    };

    return new Response(
      JSON.stringify({
        success: true,
        stats,
        generated_at: new Date().toISOString()
      }),
      {
        headers: {
          'Content-Type': 'application/json',
          ...corsHeaders,
        },
      }
    );

  } catch (error) {
    console.error('❌ Erreur stats enrichissement:', error);
    
    return new Response(
      JSON.stringify({
        success: false,
        error: 'Erreur lors de la récupération des statistiques',
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

async function getTopCategories(supabase: any, retailerId?: string) {
  try {
    let query = supabase
      .from('enriched_products')
      .select('product_type, count(*)')
      .group('product_type')
      .order('count', { ascending: false })
      .limit(10);

    if (retailerId) {
      query = query.eq('retailer_id', retailerId);
    }

    const { data, error } = await query;
    
    if (error) throw error;
    
    return data || [];
  } catch (error) {
    console.error('❌ Erreur top catégories:', error);
    return [];
  }
}

async function getEnrichmentCoverage(supabase: any, retailerId?: string) {
  try {
    let query = supabase
      .from('enriched_products')
      .select(`
        material,
        color,
        style,
        room,
        seo_title,
        seo_description,
        ai_confidence
      `);

    if (retailerId) {
      query = query.eq('retailer_id', retailerId);
    }

    const { data: products, error } = await query;
    
    if (error) throw error;
    
    if (!products || products.length === 0) {
      return {
        material_coverage: 0,
        color_coverage: 0,
        style_coverage: 0,
        room_coverage: 0,
        seo_coverage: 0,
        avg_confidence: 0
      };
    }

    const total = products.length;
    
    return {
      material_coverage: Math.round((products.filter(p => p.material && p.material.trim()).length / total) * 100),
      color_coverage: Math.round((products.filter(p => p.color && p.color.trim()).length / total) * 100),
      style_coverage: Math.round((products.filter(p => p.style && p.style.trim()).length / total) * 100),
      room_coverage: Math.round((products.filter(p => p.room && p.room.trim()).length / total) * 100),
      seo_coverage: Math.round((products.filter(p => p.seo_title && p.seo_description).length / total) * 100),
      avg_confidence: Math.round(products.reduce((sum, p) => sum + (p.ai_confidence || 0), 0) / total * 100)
    };
  } catch (error) {
    console.error('❌ Erreur couverture enrichissement:', error);
    return {
      material_coverage: 0,
      color_coverage: 0,
      style_coverage: 0,
      room_coverage: 0,
      seo_coverage: 0,
      avg_confidence: 0
    };
  }
}