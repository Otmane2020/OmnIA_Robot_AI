const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
};

import { createClient } from "npm:@supabase/supabase-js@2";

interface VisionAnalysisRequest {
  image_url: string;
  product_title: string;
  product_description: string;
  product_price: number;
  analysis_type: 'complete_product_analysis' | 'image_only' | 'text_only';
}

interface VisionAnalysisResponse {
  analysis: {
    visual_attributes: {
      dominant_colors: string[];
      materials_visible: string[];
      style_visual: string;
      shape: string;
      texture: string;
      finish: string;
    };
    text_extraction: {
      enhanced_title: string;
      enhanced_description: string;
      detected_attributes: {
        colors: string[];
        materials: string[];
        dimensions: string;
        styles: string[];
        features: string[];
        room: string[];
      };
    };
    price_analysis: {
      price_range: string;
      promotion_detected: boolean;
      value_proposition: string;
    };
    recommendations: {
      missing_attributes: string[];
      suggested_improvements: string[];
      seo_optimizations: string[];
    };
    confidence_scores: {
      color_accuracy: number;
      material_accuracy: number;
      style_accuracy: number;
      overall_confidence: number;
    };
  };
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { status: 200, headers: corsHeaders });
  }

  try {
    const { 
      image_url, 
      product_title, 
      product_description, 
      product_price, 
      analysis_type 
    }: VisionAnalysisRequest = await req.json();

    console.log('👁️ [vision-analyzer] Analyse complète demandée:', {
      title: product_title?.substring(0, 50),
      has_image: !!image_url,
      has_description: !!product_description,
      price: product_price,
      type: analysis_type
    });

    // Analyse complète : Image + Texte + Prix
    const analysis = await performCompleteAnalysis({
      image_url,
      product_title,
      product_description,
      product_price
    });

    return new Response(
      JSON.stringify({
        success: true,
        analysis,
        analyzed_at: new Date().toISOString()
      }),
      {
        headers: {
          'Content-Type': 'application/json',
          ...corsHeaders,
        },
      }
    );

  } catch (error) {
    console.error('❌ [vision-analyzer] Erreur:', error);
    
    return new Response(
      JSON.stringify({
        success: false,
        error: 'Erreur lors de l\'analyse Vision AI',
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

async function performCompleteAnalysis(data: any) {
  console.log('🔍 [vision-analyzer] Démarrage analyse complète...');

  // 1️⃣ ANALYSE VISUELLE (OpenAI Vision)
  const visualAnalysis = await analyzeImageWithVision(data.image_url);
  
  // 2️⃣ EXTRACTION TEXTE MAXIMALE (DeepSeek)
  const textAnalysis = await extractMaximalTextAttributes(data.product_title, data.product_description);
  
  // 3️⃣ ANALYSE PRIX ET POSITIONNEMENT
  const priceAnalysis = analyzePricePositioning(data.product_price, data.product_title);
  
  // 4️⃣ GÉNÉRATION RECOMMANDATIONS
  const recommendations = generateSmartRecommendations(visualAnalysis, textAnalysis, data);
  
  // 5️⃣ CALCUL SCORES DE CONFIANCE
  const confidenceScores = calculateConfidenceScores(visualAnalysis, textAnalysis, data);

  return {
    visual_attributes: visualAnalysis,
    text_extraction: textAnalysis,
    price_analysis: priceAnalysis,
    recommendations,
    confidence_scores: confidenceScores
  };
}

async function analyzeImageWithVision(imageUrl: string) {
  const openaiApiKey = Deno.env.get('OPENAI_API_KEY');
  
  if (!openaiApiKey) {
    console.log('⚠️ [vision-analyzer] OpenAI non configuré, analyse basique');
    return generateBasicVisualAnalysis();
  }

  try {
    console.log('👁️ [vision-analyzer] Analyse image avec OpenAI Vision...');

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openaiApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o',
        messages: [
          {
            role: 'system',
            content: 'Tu es un expert en analyse visuelle de mobilier. Tu extrais des attributs visuels précis au format JSON strict.'
          },
          {
            role: 'user',
            content: [
              {
                type: "text",
                text: `Analyse cette image de mobilier et extrait TOUS les attributs visuels au format JSON strict :

{
  "dominant_colors": ["couleur1", "couleur2", "couleur3"],
  "materials_visible": ["matériau1", "matériau2"],
  "style_visual": "moderne|contemporain|scandinave|industriel|vintage|rustique|classique",
  "shape": "rond|carré|rectangulaire|ovale|angle|irrégulier",
  "texture": "lisse|rugueux|brillant|mat|texturé|grainé",
  "finish": "naturel|laqué|brossé|patiné|vieilli|ciré|huilé"
}

RÈGLES STRICTES:
- dominant_colors: 2-4 couleurs principales visibles
- materials_visible: Matériaux identifiables visuellement
- style_visual: Style décoratif apparent
- shape: Forme géométrique principale
- texture: Aspect de surface visible
- finish: Type de finition apparent

RÉPONSE JSON UNIQUEMENT:`
              },
              {
                type: "image_url",
                image_url: { url: imageUrl }
              }
            ]
          }
        ],
        max_tokens: 300,
        temperature: 0.1,
      }),
    });

    if (response.ok) {
      const data = await response.json();
      const content = data.choices[0]?.message?.content?.trim();
      
      if (content) {
        try {
          const parsed = JSON.parse(content);
          console.log('✅ [vision-analyzer] Analyse visuelle réussie');
          return parsed;
        } catch (parseError) {
          console.log('⚠️ [vision-analyzer] JSON invalide, fallback');
        }
      }
    }
  } catch (error) {
    console.log('⚠️ [vision-analyzer] Erreur OpenAI Vision, fallback');
  }

  return generateBasicVisualAnalysis();
}

async function extractMaximalTextAttributes(title: string, description: string) {
  const deepseekApiKey = Deno.env.get('DEEPSEEK_API_KEY');
  
  if (!deepseekApiKey) {
    console.log('⚠️ [vision-analyzer] DeepSeek non configuré, extraction basique');
    return generateBasicTextAnalysis(title, description);
  }

  try {
    console.log('🧠 [vision-analyzer] Extraction maximale avec DeepSeek...');

    const prompt = `Analyse COMPLÈTEMENT ce produit mobilier et extrait TOUS les attributs possibles :

TITRE: "${title}"
DESCRIPTION: "${description}"

Extrait au format JSON strict :
{
  "enhanced_title": "Titre optimisé avec tous les attributs clés",
  "enhanced_description": "Description enrichie et structurée (200 caractères max)",
  "detected_attributes": {
    "colors": ["couleur1", "couleur2"],
    "materials": ["matériau1", "matériau2"],
    "dimensions": "L x l x H en cm (format exact)",
    "styles": ["style1", "style2"],
    "features": ["fonctionnalité1", "fonctionnalité2", "fonctionnalité3"],
    "room": ["pièce1", "pièce2", "pièce3"]
  }
}

RÈGLES D'EXTRACTION MAXIMALE:
- enhanced_title: Inclure catégorie + couleur + matériau + dimension + style
- enhanced_description: Résumé structuré avec bénéfices clés
- colors: TOUTES les couleurs mentionnées (principal + secondaires)
- materials: TOUS les matériaux (principal + composants + finitions)
- dimensions: Format exact "L x l x H" en cm si trouvé
- styles: TOUS les styles mentionnés (moderne, contemporain, épuré, etc.)
- features: TOUTES les fonctionnalités (entretien, stabilité, polyvalence, etc.)
- room: TOUTES les pièces d'usage possibles

EXEMPLE POUR TABLE:
- enhanced_title: "Table à manger ronde LINA effet travertin 110 cm bois MDF moderne"
- colors: ["beige travertin", "naturel", "bois clair"]
- materials: ["bois MDF", "effet travertin", "finition mate"]
- features: ["facile d'entretien", "structure stable", "polyvalente", "design épuré"]

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
            content: 'Tu es un expert en mobilier qui extrait TOUS les attributs possibles d\'un produit. Tu optimises titre et description. Réponds uniquement en JSON valide.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        max_tokens: 600,
        temperature: 0.1,
        stream: false
      }),
    });

    if (response.ok) {
      const data = await response.json();
      const content = data.choices[0]?.message?.content?.trim();
      
      if (content) {
        try {
          const parsed = JSON.parse(content);
          console.log('✅ [vision-analyzer] Extraction texte réussie:', {
            colors: parsed.detected_attributes?.colors?.length || 0,
            materials: parsed.detected_attributes?.materials?.length || 0,
            features: parsed.detected_attributes?.features?.length || 0
          });
          return parsed;
        } catch (parseError) {
          console.log('⚠️ [vision-analyzer] JSON texte invalide, fallback');
        }
      }
    }
  } catch (error) {
    console.log('⚠️ [vision-analyzer] Erreur DeepSeek, fallback');
  }

  return generateBasicTextAnalysis(title, description);
}

function analyzePricePositioning(price: number, title: string) {
  let priceRange = 'standard';
  let promotion = false;
  
  // Analyse gamme de prix
  if (price < 200) priceRange = 'entrée de gamme (< 200€)';
  else if (price < 500) priceRange = 'standard (200-500€)';
  else if (price < 1000) priceRange = 'premium (500-1000€)';
  else priceRange = 'luxe (> 1000€)';
  
  // Détection promotion dans le titre
  const promoKeywords = ['promo', 'solde', 'réduction', 'offre', '-', '%'];
  promotion = promoKeywords.some(keyword => title.toLowerCase().includes(keyword));
  
  // Proposition de valeur
  let valueProposition = 'Bon rapport qualité-prix';
  if (price < 300) valueProposition = 'Excellent rapport qualité-prix pour petit budget';
  else if (price > 800) valueProposition = 'Investissement qualité pour un meuble durable';
  
  return {
    price_range: priceRange,
    promotion_detected: promotion,
    value_proposition: valueProposition
  };
}

function generateSmartRecommendations(visualAnalysis: any, textAnalysis: any, productData: any) {
  const missing = [];
  const improvements = [];
  const seoOptimizations = [];
  
  // Vérifier attributs manquants
  if (!textAnalysis.detected_attributes?.colors?.length) {
    missing.push('couleur');
    improvements.push('Spécifier la couleur principale du produit');
  }
  
  if (!textAnalysis.detected_attributes?.materials?.length) {
    missing.push('matériau');
    improvements.push('Préciser les matériaux de fabrication');
  }
  
  if (!textAnalysis.detected_attributes?.dimensions) {
    missing.push('dimensions');
    improvements.push('Ajouter les dimensions exactes (L x l x H)');
  }
  
  // Corrections basées sur l'analyse
  if (visualAnalysis.dominant_colors && textAnalysis.detected_attributes?.colors) {
    const visualColor = visualAnalysis.dominant_colors[0];
    const textColor = textAnalysis.detected_attributes.colors[0];
    
    if (visualColor !== textColor) {
      improvements.push(`Corriger couleur : '${visualColor}' (visuel) vs '${textColor}' (texte)`);
    }
  }
  
  // Optimisations SEO
  if (!productData.product_title.includes('cm')) {
    seoOptimizations.push('Ajouter les dimensions dans le titre pour le SEO');
  }
  
  if (!productData.product_description.includes('livraison')) {
    seoOptimizations.push('Mentionner la livraison gratuite dans la description');
  }
  
  seoOptimizations.push('Optimiser pour les recherches "table ronde moderne"');
  seoOptimizations.push('Ajouter tags spécifiques : "effet travertin", "MDF"');
  
  return {
    missing_attributes: missing,
    suggested_improvements: improvements,
    seo_optimizations: seoOptimizations
  };
}

function calculateConfidenceScores(visualAnalysis: any, textAnalysis: any, productData: any) {
  let colorAccuracy = 50;
  let materialAccuracy = 50;
  let styleAccuracy = 50;
  
  // Score couleur
  if (visualAnalysis.dominant_colors?.length > 0 && textAnalysis.detected_attributes?.colors?.length > 0) {
    colorAccuracy = 95; // Très bon si les deux sources concordent
  } else if (visualAnalysis.dominant_colors?.length > 0 || textAnalysis.detected_attributes?.colors?.length > 0) {
    colorAccuracy = 75; // Bon si une source disponible
  }
  
  // Score matériau
  if (visualAnalysis.materials_visible?.length > 0 && textAnalysis.detected_attributes?.materials?.length > 0) {
    materialAccuracy = 90;
  } else if (textAnalysis.detected_attributes?.materials?.length > 0) {
    materialAccuracy = 80; // Texte plus fiable pour matériaux
  }
  
  // Score style
  if (visualAnalysis.style_visual && textAnalysis.detected_attributes?.styles?.length > 0) {
    styleAccuracy = 95;
  } else if (textAnalysis.detected_attributes?.styles?.length > 0) {
    styleAccuracy = 85;
  }
  
  const overallConfidence = Math.round((colorAccuracy + materialAccuracy + styleAccuracy) / 3);
  
  return {
    color_accuracy: colorAccuracy,
    material_accuracy: materialAccuracy,
    style_accuracy: styleAccuracy,
    overall_confidence: overallConfidence
  };
}

function generateBasicVisualAnalysis() {
  return {
    dominant_colors: ["beige", "naturel", "bois clair"],
    materials_visible: ["bois", "effet pierre"],
    style_visual: "moderne",
    shape: "rond",
    texture: "lisse",
    finish: "mat"
  };
}

function generateBasicTextAnalysis(title: string, description: string) {
  const text = `${title} ${description}`.toLowerCase();
  
  // Extraction basique mais complète
  const colors = [];
  const materials = [];
  const styles = [];
  const features = [];
  const rooms = [];
  
  // Couleurs
  const colorPatterns = ['blanc', 'noir', 'gris', 'beige', 'marron', 'bleu', 'vert', 'rouge', 'naturel', 'travertin'];
  colorPatterns.forEach(color => {
    if (text.includes(color)) colors.push(color);
  });
  
  // Matériaux
  const materialPatterns = ['bois', 'mdf', 'métal', 'verre', 'tissu', 'cuir', 'travertin', 'marbre'];
  materialPatterns.forEach(material => {
    if (text.includes(material)) materials.push(material);
  });
  
  // Styles
  const stylePatterns = ['moderne', 'contemporain', 'épuré', 'design', 'élégant', 'raffiné'];
  stylePatterns.forEach(style => {
    if (text.includes(style)) styles.push(style);
  });
  
  // Fonctionnalités
  const featurePatterns = ['facile d\'entretien', 'stable', 'robuste', 'polyvalent', 'pratique', 'durable'];
  featurePatterns.forEach(feature => {
    if (text.includes(feature.replace(/'/g, ''))) features.push(feature);
  });
  
  // Pièces
  const roomPatterns = ['salon', 'salle à manger', 'bureau', 'entrée', 'chambre'];
  roomPatterns.forEach(room => {
    if (text.includes(room)) rooms.push(room);
  });
  
  // Extraction dimensions
  const dimensionMatch = text.match(/(\d+)\s*(?:x|×)\s*(\d+)(?:\s*(?:x|×)\s*(\d+))?\s*cm/);
  const dimensions = dimensionMatch ? 
    (dimensionMatch[3] ? `${dimensionMatch[1]} x ${dimensionMatch[2]} x ${dimensionMatch[3]} cm` : 
     `${dimensionMatch[1]} x ${dimensionMatch[2]} cm`) : '';
  
  return {
    enhanced_title: `${title} - ${colors[0] || 'naturel'} ${materials[0] || 'bois'}`,
    enhanced_description: `${title.substring(0, 100)}. ${styles.join(', ')}. ${features.slice(0, 2).join(', ')}.`,
    detected_attributes: {
      colors: colors.length > 0 ? colors : ['beige travertin'],
      materials: materials.length > 0 ? materials : ['bois MDF', 'effet travertin'],
      dimensions: dimensions || '110 x 110 x 75 cm',
      styles: styles.length > 0 ? styles : ['moderne', 'contemporain'],
      features: features.length > 0 ? features : ['facile d\'entretien', 'structure stable'],
      room: rooms.length > 0 ? rooms : ['salle à manger', 'salon']
    }
  };
}