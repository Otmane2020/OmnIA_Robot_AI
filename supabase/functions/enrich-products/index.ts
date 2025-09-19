const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
};

interface EnrichRequest {
  image_base64?: string;
  image_url?: string;
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, {
      status: 200,
      headers: corsHeaders,
    });
  }

  try {
    const { image_base64, image_url }: EnrichRequest = await req.json();
    
    console.log('📸 Analyse photo reçue');

    // Simuler l'analyse IA de l'image
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    // Analyse basée sur l'image (simulation)
    const analysis = `📸 **Analyse de votre espace :**

**Style détecté :** Moderne et épuré
**Ambiance :** Chaleureuse avec potentiel d'amélioration
**Surface estimée :** ~25-30m²

**💡 Mes recommandations OmnIA :**
• **Canapé ALYANA** (799€) - Convertible velours côtelé parfait
• **Table AUREA** (499€) - Travertin naturel élégant

**🎨 Conseil d'expert :** L'harmonie des matériaux créera une ambiance cohérente !`;

    return new Response(
      JSON.stringify({ 
        analysis: analysis,
        confidence: 'high',
        processed_at: new Date().toISOString()
      }),
      {
        headers: {
          'Content-Type': 'application/json',
          ...corsHeaders,
        },
      }
    );

  } catch (error) {
    console.error('❌ Erreur analyse photo:', error);
    
    return new Response(
      JSON.stringify({ 
        analysis: "📸 Photo analysée ! Votre espace a du potentiel. Que souhaitez-vous améliorer ?",
        confidence: 'medium'
      }),
      {
        status: 200,
        headers: {
          'Content-Type': 'application/json',
          ...corsHeaders,
        },
      }
    );
  }
});