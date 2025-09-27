const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
};

import { createClient } from 'npm:@supabase/supabase-js@2';

interface TrainingRequest {
  csvData: string;
  isIncremental?: boolean;
}

interface ExtractedAttributes {
  colors: string[];
  materials: string[];
  dimensions: {
    length?: number;
    width?: number;
    height?: number;
    depth?: number;
    seatHeight?: number;
    diameter?: number;
    unit: string;
  };
  styles: string[];
  categories: string[];
  priceRange: {
    min?: number;
    max?: number;
    currency: string;
  };
  features: string[];
  room: string[];
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, {
      status: 200,
      headers: corsHeaders,
    });
  }

  try {
    const { csvData, isIncremental = false }: TrainingRequest = await req.json();
    
    console.log('🤖 Démarrage entraînement IA catalogue...');
    console.log('📊 Mode incrémental:', isIncremental);
    
    // Initialize Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Parse CSV data
    const products = parseCSVData(csvData);
    console.log('📦 Produits parsés:', products.length);

    // Extract attributes using AI for each product
    const processedProducts = [];
    
    for (const product of products) {
      console.log(`🔍 Traitement: ${product.name?.substring(0, 30)}...`);
      
      const attributes = await extractAttributesWithAI(product);
      const processedProduct = {
        ...product,
        extracted_attributes: attributes,
        processed_at: new Date().toISOString(),
        confidence_score: calculateConfidenceScore(attributes)
      };
      
      processedProducts.push(processedProduct);
    }

    // Store in database
    if (!isIncremental) {
      // Clear existing products for full retrain
      await supabase.from('ai_products').delete().neq('id', '');
    }

    // Insert processed products
    const { error: insertError } = await supabase
      .from('ai_products')
      .upsert(processedProducts, { onConflict: 'name,vendor' });

    if (insertError) {
      console.error('❌ Erreur insertion:', insertError);
      throw insertError;
    }

    // Update training metadata
    await updateTrainingMetadata(supabase, processedProducts.length, isIncremental);

    console.log('✅ Entraînement terminé:', processedProducts.length, 'produits');

    return new Response(
      JSON.stringify({
        success: true,
        message: `Entraînement IA terminé ! ${processedProducts.length} produits traités.`,
        stats: {
          products_processed: processedProducts.length,
          attributes_extracted: processedProducts.reduce((sum, p) => 
            sum + Object.keys(p.extracted_attributes).length, 0),
          training_mode: isIncremental ? 'incremental' : 'full',
          processed_at: new Date().toISOString()
        }
      }),
      {
        headers: {
          'Content-Type': 'application/json',
          ...corsHeaders,
        },
      }
    );

  } catch (error) {
    console.error('❌ Erreur entraînement IA:', error);
    
    return new Response(
      JSON.stringify({
        success: false,
        error: 'Erreur lors de l\'entraînement IA du catalogue',
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

function parseCSVData(csvContent: string): any[] {
  const lines = csvContent.trim().split('\n');
  if (lines.length < 2) {
    throw new Error('CSV invalide - minimum 2 lignes requises');
  }

  const headers = lines[0].split(',').map(h => h.trim().replace(/"/g, ''));
  const products = [];

  for (let i = 1; i < lines.length; i++) {
    if (!lines[i].trim()) continue;
    
    const values = parseCSVLine(lines[i]);
    const product: any = {};
    
    headers.forEach((header, index) => {
      const value = values[index]?.trim().replace(/"/g, '') || '';
      
      // Map common CSV headers to standard fields
      switch (header.toLowerCase()) {
        case 'nom':
        case 'name':
        case 'title':
          product.name = value;
          break;
        case 'prix':
        case 'price':
          product.price = parseFloat(value.replace(/[^\d.,]/g, '').replace(',', '.')) || 0;
          break;
        case 'description':
          product.description = value;
          break;
        case 'categorie':
        case 'category':
        case 'type':
          product.category = value;
          break;
        case 'image_url':
        case 'image':
          product.image_url = value;
          break;
        case 'url_produit':
        case 'product_url':
        case 'url':
          product.product_url = value;
          break;
        case 'stock':
        case 'quantity':
          product.stock = parseInt(value) || 0;
          break;
        case 'marque':
        case 'vendor':
        case 'brand':
          product.vendor = value;
          break;
        default:
          product[header] = value;
      }
    });

    if (product.name) {
      products.push(product);
    }
  }

  return products;
}

function parseCSVLine(line: string): string[] {
  const result = [];
  let current = '';
  let inQuotes = false;
  
  for (let i = 0; i < line.length; i++) {
    const char = line[i];
    
    if (char === '"') {
      inQuotes = !inQuotes;
    } else if (char === ',' && !inQuotes) {
      result.push(current);
      current = '';
    } else {
      current += char;
    }
  }
  
  result.push(current);
  return result;
}

async function extractAttributesWithAI(product: any): Promise<ExtractedAttributes> {
  const openaiApiKey = Deno.env.get('OPENAI_API_KEY');
  
  if (!openaiApiKey) {
    console.log('⚠️ OpenAI non configuré, extraction basique');
    return extractAttributesBasic(product);
  }

  try {
    const prompt = `Analyse ce produit mobilier et extrait les attributs structurés au format JSON strict :

PRODUIT:
Nom: ${product.name}
Description: ${product.description || ''}
Catégorie: ${product.category || ''}
Prix: ${product.price || 0}€

EXTRAIT UNIQUEMENT ces attributs au format JSON :
{
  "colors": ["couleur1", "couleur2"],
  "materials": ["matériau1", "matériau2"], 
  "subcategory": "Description précise du type (ex: Canapé d'angle convertible, Table basse ronde)",
  "dimensions": {
    "length": 200,
    "width": 100,
    "height": 75,
    "unit": "cm"
  },
  "styles": ["style1", "style2"],
  "categories": ["catégorie1"],
  "features": ["fonctionnalité1", "fonctionnalité2"],
  "room": ["salon", "chambre"],
  "tags": ["mot-clé1", "mot-clé2", "mot-clé3"]
}

RÈGLES:
- Subcategory: Description précise et spécifique du produit (ex: "Canapé d'angle convertible", "Table basse ronde", "Chaise de bureau ergonomique")
- Couleurs: blanc, noir, gris, beige, marron, bleu, vert, rouge, etc.
- Matériaux: bois, métal, verre, tissu, cuir, velours, travertin, etc.
- Styles: moderne, scandinave, industriel, vintage, minimaliste, etc.
- Tags: 3-5 mots-clés pertinents extraits du TITRE et de la DESCRIPTION (ex: pour "Canapé VENTU convertible" → ["canapé", "ventu", "convertible", "design", "contemporain"])
- Dimensions en cm uniquement
- Pièces: salon, chambre, cuisine, bureau, salle à manger
- Réponse JSON uniquement, pas de texte`;

    // Appel à DeepSeek pour extraction textuelle
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openaiApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-3.5-turbo',
        messages: [
          {
            role: 'system',
            content: 'Tu es un expert en mobilier et design d\'intérieur. Tu extrais UNIQUEMENT des attributs structurés au format JSON avec sous-catégories précises et tags basés sur le titre et description. Aucun texte supplémentaire.'
          },
          {
            role: 'user',
            content: prompt
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
          
          // Ajouter l'analyse Vision IA si image disponible
          if (product.image_url && product.image_url !== 'https://images.pexels.com/photos/1350789/pexels-photo-1350789.jpeg') {
            try {
              console.log('👁️ [auto-ai-trainer] Analyse Vision IA pour:', product.title?.substring(0, 30));
              const visionAnalysis = await analyzeProductImageWithAI(product.image_url, extracted);
              if (visionAnalysis) {
                extracted.ai_vision_summary = visionAnalysis;
              }
            } catch (visionError) {
              console.warn('⚠️ [auto-ai-trainer] Vision IA échouée:', visionError);
            }
          }
          
          console.log('✅ Attributs IA extraits:', {
            colors: extracted.colors?.length || 0,
            materials: extracted.materials?.length || 0,
            tags: extracted.tags?.length || 0
          });
          
          console.log('✅ Attributs IA extraits:', Object.keys(extracted));
          return {
            ...extracted,
            priceRange: {
              min: product.price,
              max: product.price,
              currency: 'EUR'
            }
          };
        } catch (parseError) {
          console.log('⚠️ JSON invalide, fallback extraction basique');
        }
      }
    }
  } catch (error) {
    console.log('⚠️ Erreur OpenAI, fallback extraction basique');
  }

  return extractAttributesBasic(product);
}

async function analyzeProductImageWithAI(imageUrl: string, textAttributes: any): Promise<string | null> {
  const openaiApiKey = Deno.env.get('OPENAI_API_KEY');
  
  if (!openaiApiKey) {
    console.log('⚠️ [auto-ai-trainer] OpenAI non configuré pour Vision IA');
    return null;
  }

  try {
    const prompt = `Analyse cette image de produit mobilier et génère une synthèse focalisée sur le PRODUIT uniquement.

Contexte du produit (depuis le texte) :
- Type: ${textAttributes.categories?.[0] || 'Mobilier'}
- Couleurs détectées: ${textAttributes.colors?.join(', ') || 'Non spécifiées'}
- Matériaux détectés: ${textAttributes.materials?.join(', ') || 'Non spécifiés'}
- Style détecté: ${textAttributes.styles?.[0] || 'Non spécifié'}

Génère une synthèse courte (50 mots max) qui décrit UNIQUEMENT le produit visible :
- Couleurs réelles observées
- Matériaux et finitions visibles
- Style et design apparent
- Qualité et finition perçue
- Fonctionnalités visibles

Focus sur le PRODUIT, pas l'environnement. Ton professionnel et descriptif.`;

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
            content: 'Tu es un expert en analyse visuelle de mobilier. Tu décris uniquement le produit visible dans l\'image, pas l\'environnement.'
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
                image_url: { url: imageUrl }
              }
            ]
          }
        ],
        max_tokens: 150,
        temperature: 0.3,
      }),
    });

    if (response.ok) {
      const data = await response.json();
      const analysis = data.choices[0]?.message?.content?.trim();
      
      if (analysis) {
        console.log('✅ [auto-ai-trainer] Vision IA réussie');
        return analysis;
      }
    }
  } catch (error) {
    console.log('⚠️ [auto-ai-trainer] Erreur Vision IA:', error);
  }

  return null;
}

function extractAttributesBasic(product: any): ExtractedAttributes {
  const text = `${product.name || ''} ${product.description || ''} ${product.category || ''}`.toLowerCase();
  
  // Générer tags basiques à partir du titre et description
  const generateBasicTags = (title: string, description: string): string[] => {
    const text = `${title} ${description}`.toLowerCase();
    const words = text.split(/\s+/).filter(word => word.length > 2);
    
    // Mots vides à exclure
    const stopWords = ['le', 'la', 'les', 'un', 'une', 'des', 'du', 'de', 'et', 'ou', 'avec', 'sans', 'pour', 'par', 'sur', 'dans'];
    
    // Mots-clés mobilier prioritaires
    const furnitureKeywords = ['canapé', 'ventu', 'alyana', 'aurea', 'inaya', 'convertible', 'angle', 'places', 'velours', 'tissu', 'cuir'];
    
    const validWords = words.filter(word => 
      !stopWords.includes(word) && 
      !/^\d+$/.test(word) &&
      word.length > 2
    );
    
    // Prioriser les mots-clés mobilier
    const priorityTags = validWords.filter(word => furnitureKeywords.includes(word));
    const regularTags = validWords.filter(word => !furnitureKeywords.includes(word));
    
    return [...priorityTags.slice(0, 3), ...regularTags.slice(0, 2)].slice(0, 5);
  };

  // Extract colors
  const colorPatterns = [
    'blanc', 'white', 'noir', 'black', 'gris', 'grey', 'gray', 'beige',
    'marron', 'brown', 'rouge', 'red', 'bleu', 'blue', 'vert', 'green',
    'jaune', 'yellow', 'orange', 'rose', 'pink', 'violet', 'purple',
    'crème', 'cream', 'naturel', 'natural', 'anthracite', 'taupe', 'ivoire'
  ];
  
  const colors = colorPatterns.filter(color => text.includes(color));

  // Extract materials
  const materialPatterns = [
    'chêne', 'oak', 'hêtre', 'beech', 'pin', 'pine', 'teck', 'teak',
    'noyer', 'walnut', 'bois', 'wood', 'métal', 'metal', 'acier', 'steel',
    'verre', 'glass', 'tissu', 'fabric', 'cuir', 'leather', 'velours', 'velvet',
    'travertin', 'travertine', 'marbre', 'marble', 'plastique', 'plastic',
    'rotin', 'rattan', 'osier', 'wicker', 'céramique', 'ceramic'
  ];
  
  const materials = materialPatterns.filter(material => text.includes(material));

  // Extract dimensions
  const dimensions: any = { unit: 'cm' };
  const dimPatterns = [
    { key: 'length', regex: /(?:longueur|length|l)\s*:?\s*(\d+(?:[.,]\d+)?)\s*cm/gi },
    { key: 'width', regex: /(?:largeur|width|w)\s*:?\s*(\d+(?:[.,]\d+)?)\s*cm/gi },
    { key: 'height', regex: /(?:hauteur|height|h)\s*:?\s*(\d+(?:[.,]\d+)?)\s*cm/gi },
    { key: 'diameter', regex: /(?:diamètre|diameter|ø)\s*:?\s*(\d+(?:[.,]\d+)?)\s*cm/gi }
  ];
  
  dimPatterns.forEach(({ key, regex }) => {
    const match = regex.exec(text);
    if (match) {
      dimensions[key] = parseFloat(match[1].replace(',', '.'));
    }
  });

  // Extract styles
  const stylePatterns = [
    'moderne', 'modern', 'contemporain', 'contemporary', 'scandinave', 'scandinavian',
    'industriel', 'industrial', 'vintage', 'rustique', 'rustic', 'classique', 'classic',
    'minimaliste', 'minimalist', 'bohème', 'boho', 'baroque'
  ];
  
  const styles = stylePatterns.filter(style => text.includes(style));

  // Extract room types
  const roomPatterns = [
    'salon', 'living', 'chambre', 'bedroom', 'cuisine', 'kitchen',
    'bureau', 'office', 'salle à manger', 'dining', 'entrée', 'entrance'
  ];
  
  const room = roomPatterns.filter(r => text.includes(r));

  // Extract features
  const featurePatterns = [
    'convertible', 'réversible', 'reversible', 'pliable', 'foldable',
    'extensible', 'extendable', 'rangement', 'storage', 'tiroir', 'drawer',
    'roulettes', 'wheels', 'réglable', 'adjustable'
  ];
  
  const features = featurePatterns.filter(feature => text.includes(feature));

  return {
    colors: [...new Set(colors)],
    materials: [...new Set(materials)],
    subcategory: detectSubcategory(text),
    dimensions,
    styles: [...new Set(styles)],
    categories: [product.category || 'mobilier'].filter(Boolean),
    priceRange: {
      min: product.price,
      max: product.price,
      currency: 'EUR'
    },
    features: [...new Set(features)],
    room: [...new Set(room)],
    tags: generateBasicTags(product.title || product.name || '', product.description || ''),
    confidence_score: 60
  };
}

function detectSubcategory(text: string): string {
  if (text.includes('angle') && text.includes('convertible')) return 'Canapé d\'angle convertible';
  if (text.includes('angle')) return 'Canapé d\'angle';
  if (text.includes('convertible')) return 'Canapé convertible';
  if (text.includes('basse')) return 'Table basse';
  if (text.includes('manger')) return 'Table à manger';
  if (text.includes('bureau')) return 'Chaise de bureau';
  return '';
}

function calculateConfidenceScore(attributes: ExtractedAttributes): number {
  let score = 0;
  
  // Points for each attribute type found
  if (attributes.colors.length > 0) score += 20;
  if (attributes.materials.length > 0) score += 25;
  if (Object.keys(attributes.dimensions).length > 1) score += 20;
  if (attributes.styles.length > 0) score += 15;
  if (attributes.features.length > 0) score += 10;
  if (attributes.room.length > 0) score += 10;
  
  return Math.min(score, 100);
}

async function updateTrainingMetadata(supabase: any, productCount: number, isIncremental: boolean) {
  const metadata = {
    last_training: new Date().toISOString(),
    products_count: productCount,
    training_type: isIncremental ? 'incremental' : 'full',
    model_version: '1.0'
  };

  await supabase
    .from('ai_training_metadata')
    .upsert(metadata, { onConflict: 'id' });
}