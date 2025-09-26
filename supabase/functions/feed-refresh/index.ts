const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
};

import { refreshFeedCache, getCacheStats } from '../_shared/feedCache.ts';

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, {
      status: 200,
      headers: corsHeaders,
    });
  }

  try {
    console.log('🔄 Demande de rafraîchissement du feed XML...');
    
    // Obtenir les stats avant rafraîchissement
    const statsBefore = getCacheStats();
    console.log('📊 Stats avant:', statsBefore);
    
    // Rafraîchir le cache
    const products = await refreshFeedCache();
    
    // Obtenir les stats après rafraîchissement
    const statsAfter = getCacheStats();
    console.log('📊 Stats après:', statsAfter);

    return new Response(
      JSON.stringify({ 
        success: true,
        message: `Feed rafraîchi avec succès ! ${products.length} produits en cache.`,
        stats: {
          before: statsBefore,
          after: statsAfter,
          productsCount: products.length,
          refreshedAt: new Date().toISOString()
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
    console.error('❌ Erreur rafraîchissement feed:', error);
    
    return new Response(
      JSON.stringify({ 
        success: false,
        message: 'Erreur lors du rafraîchissement du feed.',
        error: error.message
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