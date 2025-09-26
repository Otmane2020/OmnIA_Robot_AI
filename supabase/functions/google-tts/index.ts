const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
};

interface GoogleTTSRequest {
  text: string;
  voice?: {
    languageCode?: string;
    name?: string;
  };
  audioConfig?: {
    audioEncoding?: string;
    speakingRate?: number;
    pitch?: number;
  };
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, {
      status: 200,
      headers: corsHeaders,
    });
  }

  try {
    const { text, voice, audioConfig }: GoogleTTSRequest = await req.json();

    console.log('🎤 Google TTS demandé:', text.substring(0, 50) + '...');

    // Google TTS is complex to set up, use fallback to browser TTS
    console.log('⚠️ Google TTS désactivé temporairement, utilisation du fallback navigateur');
    
    return new Response(
      JSON.stringify({ 
        success: false,
        message: "Google TTS non disponible, utilisation de la synthèse navigateur",
        fallback: true 
      }),
      {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );

  } catch (error) {
    console.error('❌ Erreur serveur Google TTS:', error);
    
    return new Response(
      JSON.stringify({ 
        error: "Erreur serveur Google TTS",
        details: error.message,
        fallback: true 
      }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
});