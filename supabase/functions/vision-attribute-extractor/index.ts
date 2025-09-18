const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
};

interface VisionExtractionRequest {
  image_url?: string;
  image_base64?: string;
  product_title?: string;
  product_description?: string;
}

interface ExtractedAttributes {
  colors: string[];
  materials: string[];
  style: string;
  category: string;
  subcategory: string;
  room: string;
  features: string[];
  dimensions: string;
  confidence_score: number;
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, {
      status: 200,
      headers: corsHeaders,
    });
  }

  try {
    const { image_url, image_base64, product_title, product_description }: VisionExtractionRequest = await req.json();

    console.log('👁️ Vision AI extraction demandée');

    const openaiApiKey = Deno.env.get('OPENAI_API_KEY');
    
    if (!openaiApiKey) {
      console.log('❌ Clé API OpenAI manquante');
      return new Response(
        JSON.stringify({ 
          error: "Clé API OpenAI non configurée pour Vision",
          fallback_attributes: generateFallbackAttributes(product_title, product_description)
        }),
        {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );
    }

    // Préparer l'image pour GPT Vision
    const imageContent = image_base64 ? 
      { type: "image_url", image_url: { url: `data:image/jpeg;base64,${image_base64}` } } :
      { type: "image_url", image_url: { url: image_url } };

    const prompt = `Analyse cette image de produit mobilier et extrait les attributs précis au format JSON strict.

PRODUIT: ${product_title || 'Non spécifié'}
DESCRIPTION: ${product_description || 'Non spécifiée'}

Analyse l'image et extrait EXACTEMENT ces attributs au format JSON :
{
  "colors": ["couleur1", "couleur2", "couleur3"],
  "materials": ["matériau1", "matériau2"],
  "style": "moderne|contemporain|scandinave|industriel|vintage|rustique|classique|minimaliste|bohème",
  "category": "Fauteuil|Canapé|Table|Chaise|Lit|Rangement|Meuble TV|Décoration",
  "subcategory": "Description précise du type",
  "room": "salon|chambre|cuisine|bureau|salle à manger|entrée|terrasse",
  "features": ["convertible", "rangement", "réglable", "pivotant"],
  "dimensions": "LxlxH en cm ou description",
  "confidence_score": 85
}

RÈGLES STRICTES pour l'analyse visuelle :
- colors: TOUTES les couleurs visibles (ex: ["turquoise", "blanc", "noir"] pour un fauteuil turquoise avec pieds noirs)
- materials: TOUS les matériaux visibles (ex: ["résine", "acier"] pour assise résine + pieds acier)
- style: Style design dominant visible
- category: Type de meuble principal
- subcategory: Description précise (ex: "Fauteuil design moderne", "Chaise de bureau ergonomique")
- room: Pièce d'usage principal
- features: Fonctionnalités visibles ou déductibles
- dimensions: Si visible ou estimable
- confidence_score: 0-100 basé sur la clarté de l'image

EXEMPLE pour "Fauteuil turquoise avec pieds acier" :
{
  "colors": ["turquoise", "noir"],
  "materials": ["résine", "acier"],
  "style": "moderne",
  "category": "Fauteuil",
  "subcategory": "Fauteuil design moderne",
  "room": "salon",
  "features": ["design", "confort"],
  "dimensions": "estimé 60x60x80cm",
  "confidence_score": 90
}

RÉPONSE JSON UNIQUEMENT:`;

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
            content: 'Tu es un expert en mobilier et design d\'intérieur. Tu analyses les images de meubles et extrais TOUS les attributs visibles au format JSON strict. Sois très précis sur les couleurs et matériaux.'
          },
          {
            role: 'user',
            content: [
              {
                type: "text",
                text: prompt
              },
              imageContent
            ]
          }
        ],
        max_tokens: 500,
        temperature: 0.1, // Très bas pour cohérence
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('❌ Erreur GPT Vision:', response.status, errorText);
      
      return new Response(
        JSON.stringify({ 
          error: "Erreur GPT Vision API",
          details: errorText,
          fallback_attributes: generateFallbackAttributes(product_title, product_description)
        }),
        {
          status: response.status,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );
    }

    const data = await response.json();
    const content = data.choices[0]?.message?.content?.trim();

    if (content) {
      try {
        const extractedAttributes = JSON.parse(content);
        console.log('✅ Attributs extraits par Vision AI:', extractedAttributes);

        return new Response(
          JSON.stringify({ 
            success: true,
            attributes: extractedAttributes,
            extraction_method: 'vision_ai',
            processed_at: new Date().toISOString()
          }),
          {
            headers: {
              'Content-Type': 'application/json',
              ...corsHeaders,
            },
          }
        );
      } catch (parseError) {
        console.error('❌ JSON invalide:', parseError);
      }
    }

    // Fallback si parsing échoue
    const fallbackAttributes = generateFallbackAttributes(product_title, product_description);
    
    return new Response(
      JSON.stringify({ 
        success: true,
        attributes: fallbackAttributes,
        extraction_method: 'fallback',
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
    console.error('❌ Erreur serveur Vision:', error);
    
    return new Response(
      JSON.stringify({ 
        error: "Erreur serveur lors de l'extraction visuelle",
        details: error.message,
        fallback_attributes: generateFallbackAttributes(product_title || '', product_description || '')
      }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
});

function generateFallbackAttributes(title: string = '', description: string = ''): ExtractedAttributes {
  const text = `${title} ${description}`.toLowerCase();
  
  // Extraction basique depuis le texte
  const colors = [];
  const materials = [];
  let style = '';
  let category = 'Mobilier';
  let subcategory = '';
  let room = '';
  const features = [];
  
  // Couleurs
  if (text.includes('turquoise')) colors.push('turquoise');
  if (text.includes('blanc') || text.includes('white')) colors.push('blanc');
  if (text.includes('noir') || text.includes('black')) colors.push('noir');
  if (text.includes('gris') || text.includes('grey')) colors.push('gris');
  if (text.includes('beige')) colors.push('beige');
  if (text.includes('bleu') || text.includes('blue')) colors.push('bleu');
  
  // Matériaux
  if (text.includes('résine') || text.includes('resin')) materials.push('résine');
  if (text.includes('acier') || text.includes('steel')) materials.push('acier');
  if (text.includes('métal') || text.includes('metal')) materials.push('métal');
  if (text.includes('bois') || text.includes('wood')) materials.push('bois');
  if (text.includes('velours')) materials.push('velours');
  if (text.includes('tissu')) materials.push('tissu');
  if (text.includes('cuir')) materials.push('cuir');
  if (text.includes('travertin')) materials.push('travertin');
  if (text.includes('marbre')) materials.push('marbre');
  
  // Style
  if (text.includes('moderne') || text.includes('modern')) style = 'moderne';
  else if (text.includes('contemporain')) style = 'contemporain';
  else if (text.includes('scandinave')) style = 'scandinave';
  else if (text.includes('industriel')) style = 'industriel';
  else if (text.includes('vintage')) style = 'vintage';
  
  // Catégorie
  if (text.includes('fauteuil') || text.includes('armchair')) {
    category = 'Fauteuil';
    subcategory = 'Fauteuil design moderne';
    room = 'salon';
  } else if (text.includes('canapé') || text.includes('sofa')) {
    category = 'Canapé';
    if (text.includes('angle')) subcategory = 'Canapé d\'angle';
    else if (text.includes('convertible')) subcategory = 'Canapé convertible';
    else subcategory = 'Canapé fixe';
    room = 'salon';
  } else if (text.includes('table')) {
    category = 'Table';
    if (text.includes('basse')) subcategory = 'Table basse';
    else if (text.includes('manger')) subcategory = 'Table à manger';
    else subcategory = 'Table';
    room = 'salon';
  } else if (text.includes('chaise') || text.includes('chair')) {
    category = 'Chaise';
    if (text.includes('bureau')) subcategory = 'Chaise de bureau';
    else subcategory = 'Chaise de salle à manger';
    room = 'salle à manger';
  }
  
  // Fonctionnalités
  if (text.includes('convertible')) features.push('convertible');
  if (text.includes('rangement')) features.push('rangement');
  if (text.includes('réglable')) features.push('réglable');
  if (text.includes('pivotant')) features.push('pivotant');
  if (text.includes('roulettes')) features.push('roulettes');
  if (text.includes('confort')) features.push('confort');
  if (text.includes('design')) features.push('design');
  
  // Dimensions basiques
  const dimensionMatch = text.match(/(\d+)\s*[x×]\s*(\d+)(?:\s*[x×]\s*(\d+))?\s*cm/);
  const dimensions = dimensionMatch ? dimensionMatch[0] : '';
  
  // Score de confiance
  let confidence = 30;
  if (colors.length > 0) confidence += 25;
  if (materials.length > 0) confidence += 25;
  if (style) confidence += 15;
  if (category !== 'Mobilier') confidence += 15;
  if (room) confidence += 10;
  
  return {
    colors,
    materials,
    style,
    category,
    subcategory,
    room,
    features,
    dimensions,
    confidence_score: Math.min(confidence, 100)
  };
}