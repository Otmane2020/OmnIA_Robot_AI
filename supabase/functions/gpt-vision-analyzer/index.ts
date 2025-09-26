const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
};

interface VisionAnalysisRequest {
  image_url: string;
  image_base64?: string;
  analysis_type?: 'interior_design' | 'product_identification' | 'style_analysis' | 'complete_product_analysis';
  context?: {
    room_type?: string;
    budget?: string;
    style_preference?: string;
  };
  product_context?: {
    title?: string;
    description?: string;
    price?: number;
    category?: string;
    current_attributes?: {
      color?: string;
      material?: string;
      style?: string;
      dimensions?: string;
    };
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
    const { image_url, image_base64, analysis_type = 'interior_design', context, product_context }: VisionAnalysisRequest = await req.json();

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
    const analysisPrompt = buildAnalysisPrompt(analysis_type, context, product_context);

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

    // Si c'est une analyse complète de produit, extraire aussi les attributs structurés
    let extractedAttributes = null;
    if (analysis_type === 'complete_product_analysis' && product_context) {
      extractedAttributes = await extractCompleteProductAttributes(
        product_context.title || '',
        product_context.description || '',
        analysis,
        product_context.price || 0
      );
    }

    console.log('✅ Analyse GPT Vision réussie:', analysis.substring(0, 100) + '...');

    return new Response(
      JSON.stringify({ 
        visual_analysis: analysis,
        extracted_attributes: extractedAttributes,
        recommendations: extractedAttributes ? generateImprovementRecommendations(extractedAttributes, product_context) : null,
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

function buildAnalysisPrompt(analysisType: string, context?: any, productContext?: any) {
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
      
    case 'complete_product_analysis':
      return {
        system: `Tu es un expert en analyse de produits mobilier. Tu combines analyse visuelle et extraction textuelle pour optimiser les fiches produits.

PRODUIT À ANALYSER:
Titre: ${productContext?.title || 'Non spécifié'}
Description: ${productContext?.description || 'Non spécifié'}
Prix: ${productContext?.price || 0}€
Catégorie: ${productContext?.category || 'Non spécifié'}

ATTRIBUTS ACTUELS:
Couleur: ${productContext?.current_attributes?.color || 'Non défini'}
Matériau: ${productContext?.current_attributes?.material || 'Non défini'}
Style: ${productContext?.current_attributes?.style || 'Non défini'}
Dimensions: ${productContext?.current_attributes?.dimensions || 'Non défini'}

MISSION: Analyse COMPLÈTE image + texte pour optimiser la fiche produit.`,
        user: `Analyse cette image de produit mobilier ET exploite COMPLÈTEMENT le titre + description.

ANALYSE REQUISE:
1. **Analyse visuelle de l'image** :
   - Couleurs dominantes réelles
   - Matériaux visibles (bois, métal, tissu, etc.)
   - Style design apparent
   - Forme et proportions
   - Qualité de finition visible
   - Détails techniques visibles

2. **Extraction maximale du titre + description** :
   - Dimensions exactes mentionnées
   - Matériaux spécifiés
   - Couleurs nommées
   - Fonctionnalités (convertible, rangement, etc.)
   - Marque et collection
   - Garantie et entretien

3. **Recommandations d'optimisation** :
   - Attributs manquants à ajouter
   - Corrections si image ≠ texte
   - Améliorations SEO possibles
   - Tags supplémentaires pertinents

Format de réponse structuré et détaillé pour optimiser la fiche produit.`
      };
      
    default:
      return {
        system: baseSystem,
        user: `Analyse cette photo d'intérieur et donne tes conseils de décorateur expert.`
      };
  }
}

async function extractCompleteProductAttributes(title: string, description: string, visualAnalysis: string, price: number) {
  const deepseekApiKey = Deno.env.get('DEEPSEEK_API_KEY');
  
  if (!deepseekApiKey) {
    return extractBasicAttributesFromText(title, description, price);
  }

  try {
    const prompt = `Exploite COMPLÈTEMENT ces données pour extraire tous les attributs possibles :

TITRE: ${title}
DESCRIPTION: ${description}
PRIX: ${price}€
ANALYSE VISUELLE: ${visualAnalysis}

Extrait TOUS les attributs au format JSON strict :
{
  "title_optimized": "Titre optimisé avec tous les détails",
  "subcategory_precise": "Sous-catégorie très précise (ex: Chaise de salle à manger moderne en tissu effet lin beige avec pieds métal noir mat)",
  "color_primary": "couleur principale",
  "color_secondary": "couleur secondaire",
  "material_primary": "matériau principal",
  "material_secondary": "matériau secondaire",
  "fabric_type": "type de tissu spécifique",
  "wood_type": "type de bois spécifique",
  "metal_type": "type de métal spécifique",
  "style_primary": "style principal",
  "style_secondary": "style secondaire",
  "dimensions_extracted": "dimensions exactes extraites",
  "weight": "poids si mentionné",
  "capacity": "capacité (places, tiroirs, etc.)",
  "features": ["fonctionnalité1", "fonctionnalité2"],
  "room_primary": "pièce principale",
  "room_secondary": "pièce secondaire",
  "brand": "marque/fabricant",
  "collection": "collection/gamme",
  "warranty": "garantie si mentionnée",
  "care_instructions": ["instruction1", "instruction2"],
  "assembly_required": true/false,
  "origin_country": "pays d'origine",
  "certifications": ["certification1", "certification2"],
  "price_range": "entrée de gamme|standard|premium",
  "target_audience": "particuliers|professionnels|mixte",
  "usage_context": "quotidien|occasionnel|intensif",
  "tags_seo": ["tag1", "tag2", "tag3", "tag4", "tag5"],
  "seo_title_optimized": "Titre SEO optimisé ≤70 caractères",
  "seo_description_optimized": "Meta description ≤155 caractères",
  "confidence_extraction": 95
}

RÈGLES:
- Exploite CHAQUE mot du titre et description
- Combine avec l'analyse visuelle
- Sois très précis sur les sous-catégories
- Extrait TOUS les détails techniques
- Optimise pour le SEO

RÉPONSE JSON UNIQUEMENT:`;

    const response = await fetch('https://api.deepseek.com/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${deepseekApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'deepseek-chat',
        messages: [
          {
            role: 'system',
            content: 'Tu es un expert en extraction d\'attributs mobilier. Tu exploites COMPLÈTEMENT titre + description + analyse visuelle. Réponds uniquement en JSON valide.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        max_tokens: 1000,
        temperature: 0.1,
      }),
    });

    if (response.ok) {
      const data = await response.json();
      const content = data.choices[0]?.message?.content?.trim();
      
      if (content) {
        try {
          const extracted = JSON.parse(content);
          console.log('✅ Extraction complète réussie:', Object.keys(extracted).length, 'attributs');
          return extracted;
        } catch (parseError) {
          console.log('⚠️ JSON invalide, fallback extraction basique');
        }
      }
    }
  } catch (error) {
    console.log('⚠️ Erreur DeepSeek, fallback extraction basique');
  }

  return extractBasicAttributesFromText(title, description, price);
}

function extractBasicAttributesFromText(title: string, description: string, price: number) {
  const text = `${title} ${description}`.toLowerCase();
  
  // Extraction basique mais complète
  const colors = ['blanc', 'noir', 'gris', 'beige', 'marron', 'bleu', 'vert', 'rouge', 'jaune', 'orange', 'rose', 'violet', 'naturel', 'chêne', 'noyer', 'taupe'];
  const materials = ['bois', 'métal', 'verre', 'tissu', 'cuir', 'velours', 'travertin', 'marbre', 'plastique', 'rotin', 'chenille'];
  const styles = ['moderne', 'contemporain', 'scandinave', 'industriel', 'vintage', 'rustique', 'classique', 'minimaliste', 'bohème'];
  const rooms = ['salon', 'chambre', 'cuisine', 'bureau', 'salle à manger', 'entrée', 'terrasse'];
  
  const detectedColors = colors.filter(color => text.includes(color));
  const detectedMaterials = materials.filter(material => text.includes(material));
  const detectedStyles = styles.filter(style => text.includes(style));
  const detectedRooms = rooms.filter(room => text.includes(room));
  
  // Extraction dimensions
  const dimensionMatch = text.match(/(\d+)\s*[x×]\s*(\d+)(?:\s*[x×]\s*(\d+))?\s*cm/);
  const dimensions = dimensionMatch ? dimensionMatch[0] : '';
  
  // Extraction fonctionnalités
  const features = [];
  if (text.includes('convertible')) features.push('convertible');
  if (text.includes('rangement') || text.includes('coffre')) features.push('rangement');
  if (text.includes('réversible')) features.push('réversible');
  if (text.includes('pliable')) features.push('pliable');
  if (text.includes('extensible')) features.push('extensible');
  
  return {
    title_optimized: title,
    subcategory_precise: `${detectedMaterials[0] || 'Mobilier'} ${detectedColors[0] || ''} ${detectedStyles[0] || ''}`.trim(),
    color_primary: detectedColors[0] || '',
    color_secondary: detectedColors[1] || '',
    material_primary: detectedMaterials[0] || '',
    material_secondary: detectedMaterials[1] || '',
    style_primary: detectedStyles[0] || '',
    dimensions_extracted: dimensions,
    features: features,
    room_primary: detectedRooms[0] || '',
    price_range: price < 200 ? 'entrée de gamme' : price < 800 ? 'standard' : 'premium',
    tags_seo: [...detectedColors, ...detectedMaterials, ...detectedStyles].filter(Boolean).slice(0, 5),
    confidence_extraction: 75
  };
}

function generateImprovementRecommendations(extractedAttributes: any, productContext: any) {
  const recommendations = [];
  
  // Vérifier les attributs manquants
  if (!extractedAttributes.dimensions_extracted && !productContext?.current_attributes?.dimensions) {
    recommendations.push('Ajouter les dimensions exactes pour améliorer le référencement');
  }
  
  if (!extractedAttributes.color_primary && !productContext?.current_attributes?.color) {
    recommendations.push('Spécifier la couleur principale pour faciliter la recherche');
  }
  
  if (!extractedAttributes.material_primary && !productContext?.current_attributes?.material) {
    recommendations.push('Préciser le matériau principal pour les filtres de recherche');
  }
  
  if (!extractedAttributes.style_primary && !productContext?.current_attributes?.style) {
    recommendations.push('Définir le style décoratif pour cibler les clients');
  }
  
  if (extractedAttributes.features?.length === 0) {
    recommendations.push('Identifier les fonctionnalités spéciales (convertible, rangement, etc.)');
  }
  
  if (!extractedAttributes.seo_title_optimized) {
    recommendations.push('Optimiser le titre SEO avec mots-clés pertinents');
  }
  
  if (!extractedAttributes.seo_description_optimized) {
    recommendations.push('Créer une meta description attractive pour Google');
  }
  
  if (extractedAttributes.tags_seo?.length < 3) {
    recommendations.push('Ajouter plus de tags SEO pour améliorer la visibilité');
  }
  
  return recommendations.length > 0 ? recommendations : ['Fiche produit complète et optimisée !'];
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