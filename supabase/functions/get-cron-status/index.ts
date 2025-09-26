const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
};

interface CronStatusRequest {
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
    const { retailer_id }: CronStatusRequest = await req.json();
    
    console.log('📊 Vérification statut cron pour:', retailer_id);

    // Simuler le statut du cron (vous pouvez récupérer depuis une table)
    const mockCronStatus = {
      status: 'scheduled',
      last_run: '2025-01-14T02:00:00Z',
      next_run: '2025-01-15T02:00:00Z',
      schedule_type: 'daily',
      enabled: true,
      total_runs: 5,
      success_rate: 100,
      last_products_processed: 156
    };

    return new Response(
      JSON.stringify({
        success: true,
        ...mockCronStatus,
        retailer_id,
        checked_at: new Date().toISOString()
      }),
      {
        headers: {
          'Content-Type': 'application/json',
          ...corsHeaders,
        },
      }
    );

  } catch (error) {
    console.error('❌ Erreur vérification cron:', error);
    
    return new Response(
      JSON.stringify({
        success: false,
        error: 'Erreur lors de la vérification du statut cron',
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