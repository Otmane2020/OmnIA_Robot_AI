const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
};

interface OpenAITTSRequest {
  text: string;
  voice?: 'alloy' | 'echo' | 'fable' | 'onyx' | 'nova' | 'shimmer';
  model?: string;
  speed?: number;
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, {
      status: 200,
      headers: corsHeaders,
    });
  }

  try {
    const { text, voice = 'alloy', model = 'tts-1', speed = 1.0 }: OpenAITTSRequest = await req.json();

    console.log('🎤 DeepSeek TTS demandé:', text.substring(0, 50) + '...');

    const deepseekApiKey = Deno.env.get('DEEPSEEK_API_KEY');
    
    if (!deepseekApiKey) {
      console.log('❌ Clé API DeepSeek manquante');
      return new Response(
        JSON.stringify({ 
          error: "Clé API DeepSeek non configurée pour TTS",
          fallback: true 
        }),
        {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );
    }

    // Nettoyer le texte pour TTS
    const cleanText = text
      .replace(/\*\*/g, '') // Supprimer markdown gras
      .replace(/\*/g, '') // Supprimer markdown italique
      .replace(/#{1,6}\s/g, '') // Supprimer titres markdown
      .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1') // Convertir liens
      .replace(/`([^`]+)`/g, '$1') // Supprimer backticks
      .replace(/\n+/g, '. ') // Remplacer retours à la ligne
      .replace(/\s+/g, ' ') // Normaliser espaces
      .replace(/🤖|🛋️|🎨|💡|📏|✨|🏠|🎯|📍|👋|🔍|🎵|▶️|✅|⚠️|❌|📦|🔑|🧠|📡/g, '') // Supprimer emojis
      .trim();

    if (!cleanText || cleanText.length === 0) {
      return new Response(
        JSON.stringify({ 
          error: "Texte vide après nettoyage",
          fallback: true 
        }),
        {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );
    }

    console.log('🔊 Génération audio DeepSeek TTS...');

    const response = await fetch('https://api.deepseek.com/audio/speech', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${deepseekApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: model, // tts-1 ou tts-1-hd
        input: cleanText,
        voice: 'onyx', // Voix masculine grave et claire
        speed: 0.9, // Légèrement plus lent pour clarté
        response_format: 'mp3'
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('❌ Erreur DeepSeek TTS:', response.status, errorText);
      
      let errorMessage = "Erreur DeepSeek TTS";
      if (response.status === 401) {
        errorMessage = "Clé API DeepSeek invalide";
      } else if (response.status === 429) {
        errorMessage = "Limite de requêtes DeepSeek atteinte";
      } else if (response.status === 400) {
        errorMessage = "Texte invalide pour TTS";
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
    console.log('✅ Audio DeepSeek généré:', audioBuffer.byteLength, 'bytes');

    return new Response(audioBuffer, {
      headers: {
        ...corsHeaders,
        'Content-Type': 'audio/mpeg',
        'Content-Length': audioBuffer.byteLength.toString(),
        'Cache-Control': 'public, max-age=3600', // Cache 1 heure
      },
    });

  } catch (error) {
    console.error('❌ Erreur serveur DeepSeek TTS:', error);
    
    return new Response(
      JSON.stringify({ 
        error: "Erreur serveur DeepSeek TTS",
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