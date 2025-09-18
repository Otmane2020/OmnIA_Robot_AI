const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
};

import { createClient } from 'npm:@supabase/supabase-js@2';

interface VisionExtractionRequest {
  product_id: string;
  image_url?: string;
  image_base64?: string;
  product_title?: string;
  product_description?: string;
}

interface ExtractedAttributes {
  colors: string[];
  materials: string[];
  fabrics: string[];
  styles: string[];
  categories: string[];
  dimensions: string;
  room: string;
  features: string[];
  confidence_score: number;
  extraction_method: 'vision_ai' | 'text_analysis' | 'hybrid';
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, {
      status: 200,
      headers: corsHeaders,
    });
  }

  try {
    const { product_id, image_url, image_base64, product_title, product_description }: VisionExtractionRequest = await req.json();
    
    console.log('👁️ Vision AI extraction pour:', product_title?.substring(0, 30));

    // Initialize Supabase
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    let extractedAttributes: ExtractedAttributes;

    // Essayer d'abord Vision AI si image disponible
    if ((image_url || image_base64) && Deno.env.get('OPENAI_API_KEY')) {
      try {
        console.log('🔍 Analyse avec OpenAI Vision...');
        extractedAttributes = await extractWithVisionAI(image_url, image_base64, product_title, product_description);
      } catch (visionError) {
        console.log('⚠️ Vision AI échoué, fallback analyse textuelle');
        extractedAttributes = await extractWithTextAnalysis(product_title, product_description);
      }
    } else {
      console.log('📝 Analyse textuelle uniquement');
      extractedAttributes = await extractWithTextAnalysis(product_title, product_description);
    }

    // Sauvegarder les attributs extraits
    await saveExtractedAttributes(supabase, product_id, extractedAttributes);

    console.log('✅ Attributs extraits:', {
      colors: extractedAttributes.colors.length,
      materials: extractedAttributes.materials.length,
      confidence: extractedAttributes.confidence_score,
      method: extractedAttributes.extraction_method
    });

    return new Response(
      JSON.stringify({
        success: true,
        attributes: extractedAttributes,
        product_id,
        extracted_at: new Date().toISOString()
      }),
      {
        headers: {
          'Content-Type': 'application/json',
          ...corsHeaders,
        },
      }
    );

  } catch (error) {
    console.error('❌ Erreur extraction Vision AI:', error);
    
    return new Response(
      JSON.stringify({
        success: false,
        error: 'Erreur lors de l\'extraction des attributs',
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

async function extractWithVisionAI(imageUrl?: string, imageBase64?: string, title?: string, description?: string): Promise<ExtractedAttributes> {
  const openaiApiKey = Deno.env.get('OPENAI_API_KEY')!;

  const prompt = `Analyse cette image de mobilier et extrait PRÉCISÉMENT tous les attributs visibles au format JSON strict.

PRODUIT: ${title || ''}
DESCRIPTION: ${description || ''}

Extrait TOUS les attributs visibles au format JSON :
{
  "colors": ["couleur1", "couleur2", "couleur3"],
  "materials": ["matériau1", "matériau2"],
  "fabrics": ["tissu1", "tissu2"],
  "styles": ["style1"],
  "categories": ["catégorie1"],
  "dimensions": "LxlxH en cm si visible",
  "room": "salon|chambre|cuisine|bureau|salle à manger",
  "features": ["convertible", "rangement", "pliable"],
  "confidence_score": 85
}

RÈGLES VISION AI:
- colors: TOUTES les couleurs visibles (turquoise, blanc, noir, gris, beige, etc.)
- materials: TOUS les matériaux visibles (résine, acier, bois, métal, verre, etc.)
- fabrics: Tissus spécifiques (velours, chenille, lin, cuir, etc.)
- styles: Style décoratif (moderne, scandinave, industriel, vintage, etc.)
- categories: Type précis (Fauteuil, Canapé, Table, Chaise, etc.)
- dimensions: Si mesures visibles ou estimables
- room: Pièce d'usage recommandée
- features: Fonctionnalités visibles (convertible, rangement, etc.)
- confidence_score: 0-100 basé sur la clarté de l'image

EXEMPLE pour "Fauteuil turquoise résine acier":
{
  "colors": ["turquoise", "blanc", "noir"],
  "materials": ["résine", "acier"],
  "fabrics": [],
  "styles": ["moderne"],
  "categories": ["Fauteuil"],
  "dimensions": "",
  "room": "salon",
  "features": ["design", "empilable"],
  "confidence_score": 90
}

RÉPONSE JSON UNIQUEMENT:`;

  // Préparer l'image pour Vision AI
  const imageContent = imageBase64 ? 
    { type: "image_url", image_url: { url: `data:image/jpeg;base64,${imageBase64}` } } :
    { type: "image_url", image_url: { url: imageUrl } };

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
          content: 'Tu es un expert en mobilier et design d\'intérieur. Tu analyses les images avec précision et extrais TOUS les attributs visibles au format JSON strict.'
        },
        {
          role: 'user',
          content: [
            { type: "text", text: prompt },
            imageContent
          ]
        }
      ],
      max_tokens: 500,
      temperature: 0.1,
    }),
  });

  if (response.ok) {
    const data = await response.json();
    const content = data.choices[0]?.message?.content?.trim();
    
    if (content) {
      try {
        const extracted = JSON.parse(content);
        console.log('✅ Vision AI extraction réussie:', extracted);
        
        return {
          ...extracted,
          extraction_method: 'vision_ai',
          confidence_score: extracted.confidence_score || 80
        };
      } catch (parseError) {
        console.log('⚠️ JSON Vision AI invalide, fallback textuel');
      }
    }
  }

  // Fallback vers analyse textuelle
  return await extractWithTextAnalysis(title, description);
}

async function extractWithTextAnalysis(title?: string, description?: string): Promise<ExtractedAttributes> {
  const text = `${title || ''} ${description || ''}`.toLowerCase();
  
  // Extraction améliorée avec patterns multiples
  const colorPatterns = [
    { name: 'turquoise', patterns: ['turquoise', 'bleu turquoise', 'cyan'] },
    { name: 'blanc', patterns: ['blanc', 'white', 'ivoire', 'crème'] },
    { name: 'noir', patterns: ['noir', 'black', 'anthracite'] },
    { name: 'gris', patterns: ['gris', 'grey', 'gray', 'argent'] },
    { name: 'beige', patterns: ['beige', 'sable', 'naturel'] },
    { name: 'marron', patterns: ['marron', 'brown', 'chocolat', 'moka'] },
    { name: 'bleu', patterns: ['bleu', 'blue', 'marine', 'navy'] },
    { name: 'vert', patterns: ['vert', 'green', 'olive', 'sauge'] },
    { name: 'rouge', patterns: ['rouge', 'red', 'bordeaux'] },
    { name: 'jaune', patterns: ['jaune', 'yellow', 'moutarde'] },
    { name: 'orange', patterns: ['orange', 'corail', 'abricot'] },
    { name: 'rose', patterns: ['rose', 'pink', 'fuchsia'] },
    { name: 'violet', patterns: ['violet', 'purple', 'mauve'] },
    { name: 'chêne', patterns: ['chêne', 'oak'] },
    { name: 'noyer', patterns: ['noyer', 'walnut'] },
    { name: 'taupe', patterns: ['taupe', 'greige'] }
  ];

  const materialPatterns = [
    { name: 'résine', patterns: ['résine', 'resin', 'plastique'] },
    { name: 'acier', patterns: ['acier', 'steel', 'inox'] },
    { name: 'métal', patterns: ['métal', 'metal', 'fer'] },
    { name: 'bois', patterns: ['bois', 'wood'] },
    { name: 'verre', patterns: ['verre', 'glass', 'cristal'] },
    { name: 'travertin', patterns: ['travertin', 'travertine'] },
    { name: 'marbre', patterns: ['marbre', 'marble'] },
    { name: 'aluminium', patterns: ['aluminium', 'aluminum'] },
    { name: 'laiton', patterns: ['laiton', 'brass'] },
    { name: 'cuivre', patterns: ['cuivre', 'copper'] },
    { name: 'chrome', patterns: ['chrome', 'chromé'] }
  ];

  const fabricPatterns = [
    { name: 'velours côtelé', patterns: ['velours côtelé', 'corduroy'] },
    { name: 'velours', patterns: ['velours', 'velvet'] },
    { name: 'chenille', patterns: ['chenille'] },
    { name: 'lin', patterns: ['lin', 'linen'] },
    { name: 'coton', patterns: ['coton', 'cotton'] },
    { name: 'cuir', patterns: ['cuir', 'leather'] },
    { name: 'tissu', patterns: ['tissu', 'fabric'] },
    { name: 'polyester', patterns: ['polyester'] }
  ];

  const stylePatterns = [
    { name: 'moderne', patterns: ['moderne', 'modern', 'contemporain'] },
    { name: 'scandinave', patterns: ['scandinave', 'scandinavian', 'nordique'] },
    { name: 'industriel', patterns: ['industriel', 'industrial', 'loft'] },
    { name: 'vintage', patterns: ['vintage', 'rétro', 'retro'] },
    { name: 'minimaliste', patterns: ['minimaliste', 'minimalist', 'épuré'] },
    { name: 'classique', patterns: ['classique', 'classic', 'traditionnel'] },
    { name: 'rustique', patterns: ['rustique', 'rustic', 'campagne'] },
    { name: 'bohème', patterns: ['bohème', 'boho', 'ethnique'] }
  ];

  // Extraire tous les attributs correspondants
  const colors = colorPatterns
    .filter(({ patterns }) => patterns.some(pattern => text.includes(pattern)))
    .map(({ name }) => name);

  const materials = materialPatterns
    .filter(({ patterns }) => patterns.some(pattern => text.includes(pattern)))
    .map(({ name }) => name);

  const fabrics = fabricPatterns
    .filter(({ patterns }) => patterns.some(pattern => text.includes(pattern)))
    .map(({ name }) => name);

  const styles = stylePatterns
    .filter(({ patterns }) => patterns.some(pattern => text.includes(pattern)))
    .map(({ name }) => name);

  // Détecter catégorie
  let categories = [];
  if (text.includes('fauteuil') || text.includes('armchair')) categories.push('Fauteuil');
  else if (text.includes('canapé') || text.includes('sofa')) categories.push('Canapé');
  else if (text.includes('table')) categories.push('Table');
  else if (text.includes('chaise')) categories.push('Chaise');
  else if (text.includes('lit')) categories.push('Lit');
  else categories.push('Mobilier');

  // Détecter pièce
  let room = '';
  if (text.includes('salon') || text.includes('living')) room = 'salon';
  else if (text.includes('chambre') || text.includes('bedroom')) room = 'chambre';
  else if (text.includes('cuisine') || text.includes('kitchen')) room = 'cuisine';
  else if (text.includes('bureau') || text.includes('office')) room = 'bureau';
  else if (text.includes('salle à manger') || text.includes('dining')) room = 'salle à manger';

  // Détecter dimensions
  const dimensionMatch = text.match(/(\d+)\s*[x×]\s*(\d+)(?:\s*[x×]\s*(\d+))?\s*cm/);
  const dimensions = dimensionMatch ? dimensionMatch[0] : '';

  // Détecter fonctionnalités
  const features = [];
  if (text.includes('convertible')) features.push('convertible');
  if (text.includes('rangement')) features.push('rangement');
  if (text.includes('pliable')) features.push('pliable');
  if (text.includes('réglable')) features.push('réglable');
  if (text.includes('empilable')) features.push('empilable');
  if (text.includes('pivotant')) features.push('pivotant');

  // Calculer score de confiance
  let confidence = 30; // Base
  if (colors.length > 0) confidence += 20;
  if (materials.length > 0) confidence += 25;
  if (fabrics.length > 0) confidence += 15;
  if (styles.length > 0) confidence += 15;
  if (categories.length > 0) confidence += 10;
  if (room) confidence += 10;
  if (dimensions) confidence += 5;

  return {
    colors: [...new Set(colors)],
    materials: [...new Set(materials)],
    fabrics: [...new Set(fabrics)],
    styles: [...new Set(styles)],
    categories: [...new Set(categories)],
    dimensions,
    room,
    features: [...new Set(features)],
    confidence_score: Math.min(confidence, 100),
    extraction_method: 'text_analysis'
  };
}

async function saveExtractedAttributes(supabase: any, productId: string, attributes: ExtractedAttributes) {
  try {
    // Supprimer les anciens attributs
    await supabase
      .from('product_attributes')
      .delete()
      .eq('product_id', productId);

    // Insérer les nouveaux attributs
    const attributeRows = [];

    // Couleurs
    attributes.colors.forEach(color => {
      attributeRows.push({
        product_id: productId,
        attribute_name: 'color',
        attribute_value: color,
        confidence_score: attributes.confidence_score,
        extraction_method: attributes.extraction_method
      });
    });

    // Matériaux
    attributes.materials.forEach(material => {
      attributeRows.push({
        product_id: productId,
        attribute_name: 'material',
        attribute_value: material,
        confidence_score: attributes.confidence_score,
        extraction_method: attributes.extraction_method
      });
    });

    // Tissus
    attributes.fabrics.forEach(fabric => {
      attributeRows.push({
        product_id: productId,
        attribute_name: 'fabric',
        attribute_value: fabric,
        confidence_score: attributes.confidence_score,
        extraction_method: attributes.extraction_method
      });
    });

    // Styles
    attributes.styles.forEach(style => {
      attributeRows.push({
        product_id: productId,
        attribute_name: 'style',
        attribute_value: style,
        confidence_score: attributes.confidence_score,
        extraction_method: attributes.extraction_method
      });
    });

    // Catégories
    attributes.categories.forEach(category => {
      attributeRows.push({
        product_id: productId,
        attribute_name: 'category',
        attribute_value: category,
        confidence_score: attributes.confidence_score,
        extraction_method: attributes.extraction_method
      });
    });

    // Fonctionnalités
    attributes.features.forEach(feature => {
      attributeRows.push({
        product_id: productId,
        attribute_name: 'feature',
        attribute_value: feature,
        confidence_score: attributes.confidence_score,
        extraction_method: attributes.extraction_method
      });
    });

    // Pièce
    if (attributes.room) {
      attributeRows.push({
        product_id: productId,
        attribute_name: 'room',
        attribute_value: attributes.room,
        confidence_score: attributes.confidence_score,
        extraction_method: attributes.extraction_method
      });
    }

    // Dimensions
    if (attributes.dimensions) {
      attributeRows.push({
        product_id: productId,
        attribute_name: 'dimensions',
        attribute_value: attributes.dimensions,
        confidence_score: attributes.confidence_score,
        extraction_method: attributes.extraction_method
      });
    }

    if (attributeRows.length > 0) {
      const { error } = await supabase
        .from('product_attributes')
        .insert(attributeRows);

      if (error) {
        console.error('❌ Erreur sauvegarde attributs:', error);
        throw error;
      }

      console.log('✅ Attributs sauvegardés:', attributeRows.length);
    }

  } catch (error) {
    console.error('❌ Erreur sauvegarde attributs:', error);
    throw error;
  }
}