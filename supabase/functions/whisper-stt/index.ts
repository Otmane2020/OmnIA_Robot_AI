const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
};

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, {
      status: 200,
      headers: corsHeaders,
    });
  }

  try {
    console.log('🎤 Demande de transcription Whisper reçue');

    const deepseekApiKey = Deno.env.get('DEEPSEEK_API_KEY');
    
    if (!deepseekApiKey) {
      console.log('❌ Clé API DeepSeek manquante');
      return new Response(
        JSON.stringify({ 
          error: "Clé API DeepSeek non configurée pour Whisper",
          fallback: true 
        }),
        {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );
    }

    // Récupérer les données du formulaire
    const formData = await req.formData();
    const audioFile = formData.get('audio') as File;
    const model = formData.get('model') as string || 'whisper-1';
    const language = formData.get('language') as string || 'fr';

    if (!audioFile) {
      return new Response(
        JSON.stringify({ error: "Fichier audio manquant" }),
        {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );
    }

    console.log('📁 Fichier audio reçu:', {
      name: audioFile.name,
      size: audioFile.size,
      type: audioFile.type
    });

    // Préparer la requête pour Whisper
    const whisperFormData = new FormData();
    whisperFormData.append('file', audioFile);
    whisperFormData.append('model', model);
    whisperFormData.append('language', language);
    whisperFormData.append('response_format', 'json');

    console.log('🔄 Envoi à Whisper API...');

    const response = await fetch('https://api.deepseek.com/audio/transcriptions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${deepseekApiKey}`,
      },
      body: whisperFormData
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('❌ Erreur DeepSeek Whisper API:', response.status, errorText);
      
      let errorMessage = "Erreur DeepSeek Whisper API";
      if (response.status === 401) {
        errorMessage = "Clé API DeepSeek invalide";
      } else if (response.status === 429) {
        errorMessage = "Limite de requêtes DeepSeek atteinte";
      } else if (response.status === 413) {
        errorMessage = "Fichier audio trop volumineux (max 25MB)";
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

    const result = await response.json();
    const transcribedText = result.text || '';
    
    console.log('✅ Transcription Whisper réussie:', transcribedText.substring(0, 50) + '...');

    return new Response(
      JSON.stringify({ 
        text: transcribedText,
        language: result.language || language,
        duration: result.duration,
        model: model
      }),
      {
        headers: {
          'Content-Type': 'application/json',
          ...corsHeaders,
        },
      }
    );

  } catch (error) {
    console.error('❌ Erreur serveur Whisper:', error);
    
    return new Response(
      JSON.stringify({ 
        error: "Erreur serveur lors de la transcription",
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