const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
};

interface TTSRequest {
  text: string;
  voice_id?: string;
  model_id?: string;
  voice_settings?: {
    stability?: number;
    similarity_boost?: number;
    style?: number;
    use_speaker_boost?: boolean;
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
    const { text, voice_id, model_id, voice_settings }: TTSRequest = await req.json();

    console.log('🎤 Demande TTS reçue:', text.substring(0, 50) + '...');

    const elevenLabsApiKey = Deno.env.get('ELEVENLABS_API_KEY');
    
    if (!elevenLabsApiKey) {
      console.log('❌ Clé API ElevenLabs manquante');
      return new Response(
        JSON.stringify({ 
          error: "Clé API ElevenLabs non configurée",
          fallback: true 
        }),
        {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );
    }

    // Nettoyer le texte
    const cleanText = text
      .replace(/\*\*/g, '') // Supprimer markdown gras
      .replace(/\*/g, '') // Supprimer markdown italique
      .replace(/#{1,6}\s/g, '') // Supprimer titres markdown
      .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1') // Convertir liens
      .replace(/`([^`]+)`/g, '$1') // Supprimer backticks
      .replace(/\n+/g, '. ') // Remplacer retours à la ligne
      .replace(/\s+/g, ' ') // Normaliser espaces
      .trim();

    if (!cleanText || cleanText.length === 0) {
      console.log('❌ Texte vide après nettoyage');
      return new Response(
        JSON.stringify({ 
          error: "Texte vide",
          fallback: true 
        }),
        {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );
    }

    // Configuration voix robot masculine française optimisée
    const robotVoiceId = voice_id || Deno.env.get('ELEVENLABS_VOICE_ID') || 'pNInz6obpgDQGcFmaJgB'; // Voix française naturelle Adam
    const robotModelId = model_id || 'eleven_multilingual_v2';
    const robotSettings = {
      stability: 0.8, // Stabilité très élevée
      similarity_boost: 0.95, // Similarité maximale
      style: 0.3, // Style plus expressif et conversationnel
      use_speaker_boost: true,
      ...voice_settings
    };

    console.log('🤖 Configuration voix robot:', {
      voice_id: robotVoiceId,
      model_id: robotModelId,
      settings: robotSettings
    });

    const response = await fetch(
      `https://api.elevenlabs.io/v1/text-to-speech/${robotVoiceId}`,
      {
        method: 'POST',
        headers: {
          'Accept': 'audio/mpeg',
          'Content-Type': 'application/json',
          'xi-api-key': elevenLabsApiKey,
        },
        body: JSON.stringify({
          text: cleanText,
          model_id: robotModelId,
          voice_settings: robotSettings,
        }),
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      console.error('❌ Erreur API ElevenLabs:', response.status, errorText);
      
      // Erreurs spécifiques
      let errorMessage = "Erreur ElevenLabs API";
      if (response.status === 401) {
        // Vérifier si c'est un problème de quota
        if (errorText.includes('quota_exceeded')) {
          errorMessage = "Quota ElevenLabs dépassé - crédits insuffisants";
        } else {
          errorMessage = "Clé API ElevenLabs invalide";
        }
      } else if (response.status === 429) {
        errorMessage = "Limite de requêtes ElevenLabs atteinte";
      } else if (response.status === 422) {
        errorMessage = "Paramètres de voix invalides";
      }
      
      return new Response(
        JSON.stringify({ 
          error: errorMessage,
          details: errorText,
          fallback: true 
        }),
        {
          status: response.status,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );
    }

    const audioBuffer = await response.arrayBuffer();
    console.log('✅ Audio généré:', audioBuffer.byteLength, 'bytes');

    return new Response(audioBuffer, {
      headers: {
        ...corsHeaders,
        'Content-Type': 'audio/mpeg',
        'Content-Length': audioBuffer.byteLength.toString(),
        'Cache-Control': 'public, max-age=3600', // Cache 1 heure
      },
    });

  } catch (error) {
    console.error('❌ Erreur serveur TTS:', error);
    
    return new Response(
      JSON.stringify({ 
        error: "Erreur serveur TTS",
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