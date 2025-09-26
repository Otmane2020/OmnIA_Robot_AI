const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
};

interface VisionAnalysisRequest {
  image_url: string;
  image_base64?: string;
  analysis_type?: 'interior_design' | 'product_identification' | 'style_analysis';
  context?: {
    room_type?: string;
    budget?: string;
    style_preference?: string;
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
    const { image_url, image_base64, analysis_type = 'interior_design', context }: VisionAnalysisRequest = await req.json();

    console.log('👁️ Analyse GPT Vision demandée:', analysis_type);

    const openaiApiKey = Deno.env.get('OPENAI_API_KEY');
    
    if (!openaiApiKey) {
      console.log('❌ Clé API OpenAI manquante');
      return new Response(
        JSON.stringify({ 
          error: "Clé API OpenAI non configurée pour Vision",
          fallback_analysis: generateFallbackAnalysis(analysis_type)
        }),
        {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );
    }

    // Construire le prompt selon le type d'analyse
    const analysisPrompt = buildAnalysisPrompt(analysis_type, context);

    // Préparer l'image pour GPT Vision
    const imageContent = image_base64 ? 
      { type: "image_url", image_url: { url: `data:image/jpeg;base64,${image_base64}` } } :
      { type: "image_url", image_url: { url: image_url } };

    console.log('🔄 Envoi à GPT Vision...');

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openaiApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o', // GPT-4 avec Vision
        messages: [
          {
            role: 'system',
            content: analysisPrompt.system
          },
          {
            role: 'user',
            content: [
              {
                type: "text",
                text: analysisPrompt.user
              },
              imageContent
            ]
          }
        ],
        max_tokens: 500,
        temperature: 0.7,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('❌ Erreur GPT Vision:', response.status, errorText);
      
      return new Response(
        JSON.stringify({ 
          error: "Erreur GPT Vision API",
          details: errorText,
          fallback_analysis: generateFallbackAnalysis(analysis_type)
        }),
        {
          status: response.status,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );
    }

    const data = await response.json();
    const analysis = data.choices[0]?.message?.content || generateFallbackAnalysis(analysis_type);

    console.log('✅ Analyse GPT Vision réussie:', analysis.substring(0, 100) + '...');

    return new Response(
      JSON.stringify({ 
        analysis: analysis,
        analysis_type: analysis_type,
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
    console.error('❌ Erreur serveur GPT Vision:', error);
    
    return new Response(
      JSON.stringify({ 
        error: "Erreur serveur lors de l'analyse visuelle",
        details: error.message,
        fallback_analysis: generateFallbackAnalysis('interior_design')
      }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
});

function buildAnalysisPrompt(analysisType: string, context?: any) {
  const baseSystem = `Tu es OmnIA, décorateur d'intérieur expert et vendeur chez Decora Home. 

CATALOGUE DECORA HOME :
- Canapés ALYANA convertibles velours côtelé (799€) - Beige, Taupe, Bleu
- Tables AUREA travertin naturel (499-549€) - Ø100cm, Ø120cm  
- Chaises INAYA chenille + métal noir (99€) - Gris clair, Moka

TON STYLE DE RÉPONSE :
- Commence TOUJOURS par "J'aime bien cette photo !" ou variante
- Analyse le style existant avec expertise
- Propose 1-2 produits Decora Home pertinents avec prix
- Donne un conseil déco bonus
- Termine par une question engageante
- Ton chaleureux de décorateur passionné
- Maximum 100 mots

EXEMPLE DE RÉPONSE :
"J'aime bien cette photo ! Votre salon est moderne avec de belles proportions. 

💡 Mes suggestions Decora Home :
• Table AUREA Ø100cm (499€) - Le travertin apporterait élégance
• Chaises INAYA (99€) - Design parfait avec votre style

🎨 Conseil déco : Ajoutez des coussins colorés pour réchauffer !

Que souhaitez-vous modifier dans cet espace ?"`;

  switch (analysisType) {
    case 'interior_design':
      return {
        system: baseSystem,
        user: `Analyse cette photo d'intérieur comme un décorateur expert. 
        
Identifie :
- Le style déco actuel
- Les couleurs dominantes  
- L'aménagement et circulation
- Les opportunités d'amélioration
- Les meubles manquants ou à remplacer

Propose des produits Decora Home adaptés avec arguments déco précis.`
      };
      
    case 'product_identification':
      return {
        system: baseSystem,
        user: `Identifie les meubles visibles dans cette photo.
        
Analyse :
- Types de meubles présents
- Styles et matériaux
- État et qualité apparente
- Harmonie générale
- Suggestions de remplacement ou complément

Recommande des alternatives Decora Home si pertinent.`
      };
      
    case 'style_analysis':
      return {
        system: baseSystem,
        user: `Analyse le style décoratif de cet espace.
        
Détermine :
- Style principal (moderne, scandinave, industriel...)
- Palette de couleurs
- Matériaux dominants
- Ambiance générale
- Cohérence stylistique

Conseille des ajouts Decora Home pour renforcer le style.`
      };
      
    default:
      return {
        system: baseSystem,
        user: `Analyse cette photo d'intérieur et donne tes conseils de décorateur expert.`
      };
  }
}

function generateFallbackAnalysis(analysisType: string): string {
  switch (analysisType) {
    case 'interior_design':
      return `J'aime bien cette photo ! Votre espace a un style moderne très réussi.

🎨 L'aménagement est bien pensé et les proportions harmonieuses.

💡 Mes suggestions Decora Home :
• **Table AUREA Ø100cm** (499€) - Le travertin naturel apporterait une touche minérale élégante
• **Chaises INAYA** (99€) - Design contemporain parfait avec votre style

Que souhaitez-vous modifier dans cet espace ?`;
      
    case 'product_identification':
      return `J'aime bien cette photo ! Je vois un espace bien aménagé avec du potentiel.

🛋️ Mobilier moderne avec lignes épurées, palette neutre bien maîtrisée.

💡 Suggestions d'amélioration :
• **Canapé ALYANA** (799€) - Convertible velours côtelé pour optimiser l'espace

Quels meubles souhaitez-vous remplacer ?`;
      
    default:
      return `J'aime bien cette photo ! Votre intérieur a beaucoup de charme.

🎨 Style moderne et épuré avec une base neutre bien équilibrée.

💡 Mes recommandations :
• **Collection AUREA** - Travertin naturel pour apporter caractère

Quelle ambiance souhaitez-vous créer ?`;
  }
}