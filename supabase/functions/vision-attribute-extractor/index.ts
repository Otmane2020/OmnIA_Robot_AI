const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
};

import { createClient } from 'npm:@supabase/supabase-js@2';

interface VisionExtractionRequest {
  product_id: string;
  image_url: string;
  product_title?: string;
  product_description?: string;
}

interface ExtractedAttributes {
  colors: string[];
  materials: string[];
  fabrics: string[];
  styles: string[];
  categories: string[];
  subcategories: string[];
  dimensions: string;
  room: string[];
  features: string[];
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
    const { product_id, image_url, product_title, product_description }: VisionExtractionRequest = await req.json();
    
    console.log('👁️ Vision IA extraction pour:', product_title?.substring(0, 50));

    // Initialize Supabase
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Extract attributes using Vision AI
    const attributes = await extractAttributesWithVision(
      image_url, 
      product_title, 
      product_description
    );

    // Update products_enriched with extracted attributes
    const { error: updateError } = await supabase
      .from('products_enriched')
      .update({
        color: attributes.colors.join(', '),
        material: attributes.materials.join(', '),
        fabric: attributes.fabrics.join(', '),
        style: attributes.styles.join(', '),
        subcategory: attributes.subcategories.join(', '),
        room: attributes.room.join(', '),
        dimensions: attributes.dimensions,
        confidence_score: attributes.confidence_score,
        enrichment_source: 'vision_ai',
        enriched_at: new Date().toISOString()
      })
      .eq('id', product_id);

    if (updateError) {
      console.error('❌ Erreur mise à jour produit enrichi:', updateError);
      throw updateError;
    }

    console.log('✅ Attributs Vision IA extraits et sauvegardés');

    return new Response(
      JSON.stringify({
        success: true,
        message: 'Attributs extraits avec Vision IA',
        attributes,
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
    console.error('❌ Erreur Vision IA extraction:', error);
    
    return new Response(
      JSON.stringify({
        success: false,
        error: 'Erreur lors de l\'extraction Vision IA',
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

async function extractAttributesWithVision(
  imageUrl: string, 
  title?: string, 
  description?: string
): Promise<ExtractedAttributes> {
  const openaiApiKey = Deno.env.get('OPENAI_API_KEY');
  
  if (!openaiApiKey) {
    console.log('⚠️ OpenAI non configuré, extraction textuelle');
    return extractAttributesFromText(title, description);
  }

  try {
    console.log('👁️ Analyse Vision IA de l\'image...');

    const prompt = `Analyse cette image de mobilier et extrait TOUS les attributs visibles au format JSON strict.

CONTEXTE PRODUIT:
Titre: ${title || 'Non spécifié'}
Description: ${description || 'Non spécifiée'}

EXTRAIT ces attributs au format JSON exact :
{
  "colors": ["couleur1", "couleur2", "couleur3"],
  "materials": ["matériau1", "matériau2"],
  "fabrics": ["tissu1", "tissu2"],
  "styles": ["style1", "style2"],
  "categories": ["catégorie1"],
  "subcategories": ["sous-catégorie1"],
  "dimensions": "LxlxH en cm ou description",
  "room": ["salon", "chambre"],
  "features": ["fonctionnalité1", "fonctionnalité2"],
  "confidence_score": 85
}

RÈGLES STRICTES:
- Couleurs: blanc, noir, gris, beige, marron, bleu, vert, rouge, jaune, orange, rose, violet, crème, naturel, anthracite, taupe, ivoire, chêne, noyer, teck, turquoise, cyan, marine, bordeaux, moka
- Matériaux: bois, chêne, hêtre, pin, teck, noyer, métal, acier, aluminium, fer, verre, pierre, marbre, travertin, granit, plastique, résine, rotin, osier, bambou
- Tissus: coton, lin, velours, cuir, simili cuir, chenille, bouclé, jacquard, microfibre, polyester, viscose
- Styles: moderne, contemporain, scandinave, industriel, vintage, rustique, classique, minimaliste, bohème, baroque, art déco
- Catégories: Canapé, Table, Chaise, Fauteuil, Lit, Armoire, Commode, Bibliothèque, Meuble TV, Console, Tabouret, Banc
- Pièces: salon, chambre, cuisine, bureau, salle à manger, entrée, terrasse, jardin
- Fonctionnalités: convertible, réversible, pliable, extensible, rangement, tiroir, roulettes, réglable, déhoussable

ANALYSE VISUELLE:
- Identifie TOUTES les couleurs visibles (primaires et secondaires)
- Détecte TOUS les matériaux (structure, revêtement, finitions)
- Analyse le style et l'époque du design
- Détermine la catégorie exacte et sous-catégorie
- Estime les dimensions si possible
- confidence_score: 0-100 basé sur la clarté de l'image

RÉPONSE JSON UNIQUEMENT:`;

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
            content: 'Tu es un expert en mobilier et design d\'intérieur avec capacité d\'analyse visuelle. Tu extrais UNIQUEMENT des attributs structurés au format JSON. Aucun texte supplémentaire.'
          },
          {
            role: 'user',
            content: [
              {
                type: "text",
                text: prompt
              },
              {
                type: "image_url",
                image_url: {
                  url: imageUrl,
                  detail: "high"
                }
              }
            ]
          }
        ],
        max_tokens: 800,
        temperature: 0.1,
      }),
    });

    if (response.ok) {
      const data = await response.json();
      const content = data.choices[0]?.message?.content?.trim();
      
      if (content) {
        try {
          const extracted = JSON.parse(content);
          console.log('✅ Vision IA extraction réussie:', {
            colors: extracted.colors?.length || 0,
            materials: extracted.materials?.length || 0,
            confidence: extracted.confidence_score
          });
          
          return {
            colors: extracted.colors || [],
            materials: extracted.materials || [],
            fabrics: extracted.fabrics || [],
            styles: extracted.styles || [],
            categories: extracted.categories || [],
            subcategories: extracted.subcategories || [],
            dimensions: extracted.dimensions || '',
            room: extracted.room || [],
            features: extracted.features || [],
            confidence_score: extracted.confidence_score || 50
          };
        } catch (parseError) {
          console.log('⚠️ JSON invalide, fallback textuel');
        }
      }
    } else {
      console.log('⚠️ Vision IA erreur, fallback textuel');
    }
  } catch (error) {
    console.log('⚠️ Erreur Vision IA, fallback textuel:', error);
  }

  // Fallback to text-based extraction
  return extractAttributesFromText(title, description);
}

function extractAttributesFromText(title?: string, description?: string): ExtractedAttributes {
  const text = `${title || ''} ${description || ''}`.toLowerCase();
  
  // Extract colors with comprehensive patterns
  const colorPatterns = [
    { name: 'blanc', patterns: ['blanc', 'white', 'ivoire', 'crème', 'cream', 'écru'] },
    { name: 'noir', patterns: ['noir', 'black', 'anthracite', 'charbon', 'ébène'] },
    { name: 'gris', patterns: ['gris', 'grey', 'gray', 'argent', 'silver', 'platine'] },
    { name: 'beige', patterns: ['beige', 'sable', 'sand', 'lin', 'naturel', 'nude'] },
    { name: 'marron', patterns: ['marron', 'brown', 'chocolat', 'café', 'moka', 'cognac', 'caramel'] },
    { name: 'bleu', patterns: ['bleu', 'blue', 'marine', 'navy', 'cobalt', 'turquoise', 'cyan', 'azur'] },
    { name: 'vert', patterns: ['vert', 'green', 'olive', 'sauge', 'menthe', 'émeraude', 'jade'] },
    { name: 'rouge', patterns: ['rouge', 'red', 'bordeaux', 'cerise', 'carmin', 'vermillon'] },
    { name: 'jaune', patterns: ['jaune', 'yellow', 'moutarde', 'citron', 'or', 'gold'] },
    { name: 'orange', patterns: ['orange', 'corail', 'abricot', 'mandarine', 'cuivre'] },
    { name: 'rose', patterns: ['rose', 'pink', 'fuchsia', 'magenta', 'saumon'] },
    { name: 'violet', patterns: ['violet', 'purple', 'mauve', 'lilas', 'prune'] },
    { name: 'chêne', patterns: ['chêne', 'oak'] },
    { name: 'noyer', patterns: ['noyer', 'walnut'] },
    { name: 'teck', patterns: ['teck', 'teak'] },
    { name: 'taupe', patterns: ['taupe', 'greige'] },
    { name: 'turquoise', patterns: ['turquoise', 'cyan', 'bleu-vert'] }
  ];
  
  const colors = colorPatterns
    .filter(({ patterns }) => patterns.some(pattern => text.includes(pattern)))
    .map(({ name }) => name);

  // Extract materials
  const materialPatterns = [
    { name: 'bois', patterns: ['bois', 'wood'] },
    { name: 'chêne', patterns: ['chêne', 'oak'] },
    { name: 'hêtre', patterns: ['hêtre', 'beech'] },
    { name: 'pin', patterns: ['pin', 'pine'] },
    { name: 'teck', patterns: ['teck', 'teak'] },
    { name: 'noyer', patterns: ['noyer', 'walnut'] },
    { name: 'métal', patterns: ['métal', 'metal', 'acier', 'steel', 'fer', 'iron'] },
    { name: 'aluminium', patterns: ['aluminium', 'aluminum'] },
    { name: 'verre', patterns: ['verre', 'glass', 'cristal'] },
    { name: 'marbre', patterns: ['marbre', 'marble'] },
    { name: 'travertin', patterns: ['travertin', 'travertine'] },
    { name: 'granit', patterns: ['granit', 'granite'] },
    { name: 'pierre', patterns: ['pierre', 'stone'] },
    { name: 'plastique', patterns: ['plastique', 'plastic'] },
    { name: 'résine', patterns: ['résine', 'resin'] },
    { name: 'rotin', patterns: ['rotin', 'rattan'] },
    { name: 'osier', patterns: ['osier', 'wicker'] },
    { name: 'bambou', patterns: ['bambou', 'bamboo'] }
  ];
  
  const materials = materialPatterns
    .filter(({ patterns }) => patterns.some(pattern => text.includes(pattern)))
    .map(({ name }) => name);

  // Extract fabrics
  const fabricPatterns = [
    { name: 'coton', patterns: ['coton', 'cotton'] },
    { name: 'lin', patterns: ['lin', 'linen'] },
    { name: 'velours', patterns: ['velours', 'velvet'] },
    { name: 'cuir', patterns: ['cuir', 'leather'] },
    { name: 'simili cuir', patterns: ['simili cuir', 'faux leather'] },
    { name: 'chenille', patterns: ['chenille'] },
    { name: 'bouclé', patterns: ['bouclé', 'boucle'] },
    { name: 'jacquard', patterns: ['jacquard'] },
    { name: 'microfibre', patterns: ['microfibre', 'microfiber'] },
    { name: 'polyester', patterns: ['polyester'] },
    { name: 'viscose', patterns: ['viscose'] }
  ];
  
  const fabrics = fabricPatterns
    .filter(({ patterns }) => patterns.some(pattern => text.includes(pattern)))
    .map(({ name }) => name);

  // Extract styles
  const stylePatterns = [
    { name: 'moderne', patterns: ['moderne', 'modern', 'contemporain', 'contemporary'] },
    { name: 'scandinave', patterns: ['scandinave', 'scandinavian', 'nordique', 'nordic'] },
    { name: 'industriel', patterns: ['industriel', 'industrial', 'loft'] },
    { name: 'vintage', patterns: ['vintage', 'rétro', 'retro'] },
    { name: 'rustique', patterns: ['rustique', 'rustic', 'campagne', 'country'] },
    { name: 'classique', patterns: ['classique', 'classic', 'traditionnel'] },
    { name: 'minimaliste', patterns: ['minimaliste', 'minimalist', 'épuré'] },
    { name: 'bohème', patterns: ['bohème', 'boho', 'ethnique'] },
    { name: 'baroque', patterns: ['baroque'] },
    { name: 'art déco', patterns: ['art déco', 'art deco'] }
  ];
  
  const styles = stylePatterns
    .filter(({ patterns }) => patterns.some(pattern => text.includes(pattern)))
    .map(({ name }) => name);

  // Extract categories
  const categoryPatterns = [
    { name: 'Canapé', patterns: ['canapé', 'sofa'] },
    { name: 'Table', patterns: ['table'] },
    { name: 'Chaise', patterns: ['chaise', 'chair'] },
    { name: 'Fauteuil', patterns: ['fauteuil', 'armchair'] },
    { name: 'Lit', patterns: ['lit', 'bed'] },
    { name: 'Armoire', patterns: ['armoire', 'wardrobe'] },
    { name: 'Commode', patterns: ['commode', 'chest'] },
    { name: 'Bibliothèque', patterns: ['bibliothèque', 'bookcase'] },
    { name: 'Meuble TV', patterns: ['meuble tv', 'tv stand'] },
    { name: 'Console', patterns: ['console'] },
    { name: 'Tabouret', patterns: ['tabouret', 'stool'] },
    { name: 'Banc', patterns: ['banc', 'bench'] }
  ];
  
  const categories = categoryPatterns
    .filter(({ patterns }) => patterns.some(pattern => text.includes(pattern)))
    .map(({ name }) => name);

  // Extract room types
  const roomPatterns = [
    { name: 'salon', patterns: ['salon', 'living', 'séjour'] },
    { name: 'chambre', patterns: ['chambre', 'bedroom'] },
    { name: 'cuisine', patterns: ['cuisine', 'kitchen'] },
    { name: 'bureau', patterns: ['bureau', 'office'] },
    { name: 'salle à manger', patterns: ['salle à manger', 'dining'] },
    { name: 'entrée', patterns: ['entrée', 'entrance', 'hall'] },
    { name: 'terrasse', patterns: ['terrasse', 'terrace'] },
    { name: 'jardin', patterns: ['jardin', 'garden'] }
  ];
  
  const room = roomPatterns
    .filter(({ patterns }) => patterns.some(pattern => text.includes(pattern)))
    .map(({ name }) => name);

  // Extract features
  const featurePatterns = [
    'convertible', 'réversible', 'pliable', 'extensible', 'modulaire',
    'rangement', 'coffre', 'tiroir', 'étagère', 'niche',
    'roulettes', 'pivotant', 'réglable', 'inclinable',
    'déhoussable', 'lavable', 'imperméable', 'résistant',
    'empilable', 'gigogne', 'escamotable'
  ];
  
  const features = featurePatterns.filter(feature => text.includes(feature));

  // Extract dimensions
  const dimensionMatch = text.match(/(\d+(?:[.,]\d+)?)\s*[x×]\s*(\d+(?:[.,]\d+)?)\s*(?:[x×]\s*(\d+(?:[.,]\d+)?))?\s*cm/);
  const dimensions = dimensionMatch ? dimensionMatch[0] : '';

  // Calculate confidence score
  let confidence = 30; // Base score
  if (colors.length > 0) confidence += 20;
  if (materials.length > 0) confidence += 20;
  if (fabrics.length > 0) confidence += 10;
  if (styles.length > 0) confidence += 10;
  if (categories.length > 0) confidence += 10;

  return {
    colors: [...new Set(colors)],
    materials: [...new Set(materials)],
    fabrics: [...new Set(fabrics)],
    styles: [...new Set(styles)],
    categories: [...new Set(categories)],
    subcategories: [],
    dimensions,
    room: [...new Set(room)],
    features: [...new Set(features)],
    confidence_score: Math.min(confidence, 100)
  };
}