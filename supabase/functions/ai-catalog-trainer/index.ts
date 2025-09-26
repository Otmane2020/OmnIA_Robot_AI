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
  "dimensions": {
    "length": 200,
    "width": 100,
    "height": 75,
    "unit": "cm"
  },
  "styles": ["style1", "style2"],
  "categories": ["catégorie1"],
  "features": ["fonctionnalité1", "fonctionnalité2"],
  "room": ["salon", "chambre"]
}

RÈGLES:
- Couleurs: blanc, noir, gris, beige, marron, bleu, vert, rouge, etc.
- Matériaux: bois, métal, verre, tissu, cuir, velours, travertin, etc.
- Styles: moderne, scandinave, industriel, vintage, minimaliste, etc.
- Dimensions en cm uniquement
- Pièces: salon, chambre, cuisine, bureau, salle à manger
- Réponse JSON uniquement, pas de texte`;

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
            content: 'Tu es un expert en mobilier. Réponds uniquement en JSON valide, sans texte supplémentaire.'
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

function extractAttributesBasic(product: any): ExtractedAttributes {
  const text = `${product.name || ''} ${product.description || ''} ${product.category || ''}`.toLowerCase();
  
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
    dimensions,
    styles: [...new Set(styles)],
    categories: [product.category || 'mobilier'].filter(Boolean),
    priceRange: {
      min: product.price,
      max: product.price,
      currency: 'EUR'
    },
    features: [...new Set(features)],
    room: [...new Set(room)]
  };
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