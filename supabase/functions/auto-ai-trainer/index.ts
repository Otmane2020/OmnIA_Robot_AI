const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
};

import { createClient } from 'npm:@supabase/supabase-js@2';

interface AutoTrainingRequest {
  products: any[];
  source: 'shopify' | 'csv' | 'xml' | 'api';
  store_id?: string;
  trigger_type: 'import' | 'update' | 'sync';
}

interface ExtractedAttributes {
  colors: string[];
  materials: string[];
  dimensions: {
    length?: number;
    width?: number;
    height?: number;
    depth?: number;
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
    // Initialize Supabase client with error handling
    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
    
    if (!supabaseUrl || !supabaseKey) {
      console.error('❌ Variables d\'environnement Supabase manquantes');
      return new Response(
        JSON.stringify({
          success: false,
          error: 'Configuration Supabase manquante',
          details: 'SUPABASE_URL et SUPABASE_SERVICE_ROLE_KEY requis'
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

    const { products, source, store_id, trigger_type }: AutoTrainingRequest = await req.json();
    
    console.log('🤖 Auto-training déclenché:', {
      source,
      products_count: products.length,
      trigger_type,
      store_id
    });

    const supabase = createClient(supabaseUrl, supabaseKey);

    // Process products with AI extraction
    const processedProducts = [];
    const batchSize = 10; // Process in batches to avoid timeouts
    
    console.log('🧠 Démarrage extraction IA par batch...');
    
    for (let i = 0; i < products.length; i += batchSize) {
      const batch = products.slice(i, i + batchSize);
      console.log(`📦 Traitement batch ${Math.floor(i/batchSize) + 1}/${Math.ceil(products.length/batchSize)}`);
      
      const batchPromises = batch.map(async (product) => {
        try {
          console.log(`🔍 Processing product for AI training:`, {
            product_id: product.id,
            product_name: (product.title || product.name || '').substring(0, 30),
            has_description: !!(product.description || product.body_html),
            description_length: (product.description || product.body_html || '').length,
            product_type: product.productType || product.product_type || product.category
          });
          
          const attributes = await extractAttributesWithAI(product, source);
          return {
            // Standardize product format
            id: product.id || `${source}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
            name: product.title || product.name || 'Produit sans nom',
            description: product.description || '',
            price: parseFloat(product.price) || 0,
            category: product.productType || product.category || 'Mobilier',
            vendor: product.vendor || 'Boutique',
            image_url: product.image_url || product.featuredImage?.url || '',
            product_url: product.product_url || `#${product.handle || product.id}`,
            stock: product.quantityAvailable || product.stock || 0,
            source_platform: source,
            store_id: store_id || 'default',
            extracted_attributes: attributes,
            confidence_score: attributes.confidence_score,
            last_trained: new Date().toISOString(),
          };
        } catch (error) {
          console.error('❌ Erreur traitement produit:', error);
          return null;
        }
      });
      
      const batchResults = await Promise.all(batchPromises);
      const validResults = batchResults.filter(result => result !== null);
      processedProducts.push(...validResults);
      
      // Small delay between batches
      if (i + batchSize < products.length) {
        await new Promise(resolve => setTimeout(resolve, 500));
      }
    }

    console.log(`✅ ${processedProducts.length}/${products.length} produits traités avec succès`);

    // Store in database with upsert (update or insert)
    if (processedProducts.length > 0) {
      const { error: upsertError } = await supabase
        .from('ai_products')
        .upsert(processedProducts, { 
          onConflict: 'id',
          ignoreDuplicates: false 
        });

      if (upsertError) {
        console.error('❌ Erreur upsert:', upsertError);
        throw upsertError;
      }
    }

    console.log(`💾 Saving attributes for product ${productId}:`, {
      attributes_to_save: attributes,
      product_id: productId
    });
    
    // Update training metadata
    await updateTrainingMetadata(supabase, {
      products_count: processedProducts.length,
      source_platform: source,
      trigger_type,
      store_id: store_id || 'default'
    });

      console.warn('⚠️ Product not found in database:', {
        searched_product_id: productId,
        search_field: 'shopify_id',
        table: 'products'
      });
    await updateRobotKnowledge(supabase, processedProducts, source);

    console.log('🤖 OmnIA Robot mis à jour avec nouveau catalogue');
    console.log(`✅ Product found in database:`, {
      database_product_id: product.id,
      original_product_id: productId
    });

    return new Response(
      JSON.stringify({
        success: true,
        message: `🤖 OmnIA Robot entraîné automatiquement ! ${processedProducts.length} produits analysés depuis ${source}.`,
        stats: {
          products_processed: processedProducts.length,
          source_platform: source,
          trigger_type,
          attributes_extracted: processedProducts.reduce((sum, p) => 
            sum + Object.keys(p.extracted_attributes).length, 0),
          confidence_avg: processedProducts.reduce((sum, p) => 
            sum + p.confidence_score, 0) / processedProducts.length,
          processed_at: new Date().toISOString()
        }
      }),
      {
        headers: {
      console.error('❌ Database save error for product attributes:', {
        product_id: productId,
        database_product_id: product.id,
        error_message: error.message,
        error_code: error.code,
        error_details: error.details,
        attributes_attempted: attributes
      });
          ...corsHeaders,
        },
      }
    console.log(`✅ Attributes saved successfully:`, {
      product_id: productId,
      database_product_id: product.id,
      saved_attributes: Object.keys(attributes),
      confidence_score: attributes.confidence_score
    });

  } catch (error) {
    console.error('❌ Erreur auto-training:', error);
    
    return new Response(
      JSON.stringify({
        success: false,
        error: 'Erreur lors de l\'entraînement automatique IA',
        details: error?.message || 'Erreur inconnue'
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

async function extractAttributesWithAI(product: any, source: string): Promise<ExtractedAttributes> {
  const deepseekApiKey = Deno.env.get('DEEPSEEK_API_KEY');
  
  if (!deepseekApiKey) {
    console.log('⚠️ DeepSeek non configuré, extraction basique pour:', product.title?.substring(0, 30));
    return extractAttributesBasic(product);
  }

  try {
    const productText = `
PRODUIT: ${product.title || product.name || ''}
DESCRIPTION: ${product.description || ''}
CATÉGORIE: ${product.productType || product.category || ''}
PRIX: ${product.price || 0}€
TAGS: ${Array.isArray(product.tags) ? product.tags.join(', ') : ''}
SOURCE: ${source}
    `.trim();

    const prompt = `Analyse ce produit mobilier et extrait UNIQUEMENT les attributs au format JSON strict.

${productText}

EXTRAIT ces attributs au format JSON exact :
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
  "room": ["salon", "chambre"],
  "confidence_score": 85
}

RÈGLES STRICTES:
- Couleurs: blanc, noir, gris, beige, marron, bleu, vert, rouge, jaune, orange, rose, violet, crème, naturel, anthracite, taupe, ivoire, chêne, noyer, teck
- Matériaux: chêne, hêtre, pin, teck, noyer, bois massif, métal, acier, verre, tissu, cuir, velours, travertin, marbre, plastique, rotin
- Styles: moderne, contemporain, scandinave, industriel, vintage, rustique, classique, minimaliste, bohème, baroque
- Dimensions en cm uniquement si mentionnées
- Pièces: salon, chambre, cuisine, bureau, salle à manger, entrée
- Fonctionnalités: convertible, réversible, pliable, extensible, rangement, tiroir, roulettes, réglable
- confidence_score: 0-100 basé sur la qualité des informations

RÉPONSE JSON UNIQUEMENT, AUCUN TEXTE:`;

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
            content: 'Tu es un expert en mobilier et design d\'intérieur. Tu extrais UNIQUEMENT des attributs structurés au format JSON. Aucun texte supplémentaire.'
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
      
      console.log('🔍 DeepSeek auto-trainer raw response:', {
        product_name: (product.name || product.title || '').substring(0, 30),
        response_status: response.status,
        data_structure: data,
        content_received: content,
        content_length: content?.length || 0,
        choices_available: !!data.choices,
        first_choice_available: !!data.choices?.[0]
      });
      
      if (content) {
        try {
          const extracted = JSON.parse(content);
          console.log('✅ Auto-trainer extraction successful:', {
            product: product.title?.substring(0, 30),
            colors: extracted.colors?.length || 0,
            materials: extracted.materials?.length || 0,
            confidence: extracted.confidence_score || 0,
            all_extracted_fields: Object.keys(extracted),
            has_required_fields: !!(extracted.colors && extracted.materials)
          
          console.log(`✅ Attributes extracted for ${(product.title || '').substring(0, 30)}:`, {
            confidence: attributes.confidence_score,
            colors_count: attributes.colors?.length || 0,
            materials_count: attributes.materials?.length || 0,
            has_style: !!attributes.style,
            has_room: !!attributes.room
          });
          
          });
          console.error(`❌ Product extraction failed:`, {
            product_id: product.id,
            product_name: (product.title || product.name || '').substring(0, 30),
            error_message: error.message,
            error_type: error.constructor.name,
            stack_trace: error.stack?.split('\n').slice(0, 3)
          });
          return {
            ...extracted,
            confidence_score: extracted.confidence_score || 50
          };
        } catch (parseError) {
          console.error('❌ Auto-trainer JSON parsing failed:', {
            product_name: (product.title || '').substring(0, 30),
            parse_error: parseError.message,
            raw_content: content,
            content_preview: content?.substring(0, 200),
            content_type: typeof content,
            is_valid_json_start: content?.trim().startsWith('{'),
            is_valid_json_end: content?.trim().endsWith('}'),
            content_cleaned: content?.replace(/\n/g, ' ').replace(/\s+/g, ' ')
          });
        }
      }
    } else {
      const errorText = await response.text();
      console.error('❌ DeepSeek auto-trainer API error:', {
        status: response.status,
        statusText: response.statusText,
        error_body: errorText,
        headers: Object.fromEntries(response.headers.entries()),
        api_key_configured: !!deepseekApiKey,
        api_key_length: deepseekApiKey?.length || 0
      });
    } else {
      console.log('⚠️ DeepSeek erreur, fallback basique');
    }
  } catch (error) {
    console.error('❌ DeepSeek auto-trainer error:', {
      error_message: error.message,
      error_type: error.constructor.name,
      product_info: {
        id: product.id,
        title: (product.title || '').substring(0, 50),
        has_description: !!(product.description),
        description_length: (product.description || '').length
      },
      api_key_configured: !!deepseekApiKey
    });
  }

  return extractAttributesBasic(product);
}

function extractAttributesBasic(product: any): ExtractedAttributes {
  const text = `${product.title || product.name || ''} ${product.description || ''} ${product.productType || product.category || ''}`.toLowerCase();
  
  // Extract colors with comprehensive patterns
  const colorPatterns = [
    { name: 'blanc', patterns: ['blanc', 'white', 'ivoire', 'crème', 'cream'] },
    { name: 'noir', patterns: ['noir', 'black', 'anthracite', 'charbon'] },
    { name: 'gris', patterns: ['gris', 'grey', 'gray', 'argent', 'silver'] },
    { name: 'beige', patterns: ['beige', 'sable', 'sand', 'lin', 'écru'] },
    { name: 'marron', patterns: ['marron', 'brown', 'chocolat', 'café', 'moka', 'cognac'] },
    { name: 'bleu', patterns: ['bleu', 'blue', 'marine', 'navy', 'cobalt', 'turquoise'] },
    { name: 'vert', patterns: ['vert', 'green', 'olive', 'sauge', 'menthe'] },
    { name: 'rouge', patterns: ['rouge', 'red', 'bordeaux', 'cerise', 'carmin'] },
    { name: 'jaune', patterns: ['jaune', 'yellow', 'moutarde', 'citron'] },
    { name: 'orange', patterns: ['orange', 'corail', 'abricot', 'mandarine'] },
    { name: 'rose', patterns: ['rose', 'pink', 'fuchsia', 'magenta'] },
    { name: 'violet', patterns: ['violet', 'purple', 'mauve', 'lilas', 'prune'] },
    { name: 'chêne', patterns: ['chêne', 'oak', 'chêne clair', 'chêne foncé'] },
    { name: 'noyer', patterns: ['noyer', 'walnut', 'noyer américain'] },
    { name: 'teck', patterns: ['teck', 'teak'] },
    { name: 'naturel', patterns: ['naturel', 'natural', 'brut', 'raw'] },
    { name: 'taupe', patterns: ['taupe', 'greige'] }
  ];
  
  const colors = colorPatterns
    .filter(({ patterns }) => patterns.some(pattern => text.includes(pattern)))
    .map(({ name }) => name);

  // Extract materials with comprehensive patterns
  const materialPatterns = [
    { name: 'chêne', patterns: ['chêne', 'oak'] },
    { name: 'hêtre', patterns: ['hêtre', 'beech'] },
    { name: 'pin', patterns: ['pin', 'pine'] },
    { name: 'teck', patterns: ['teck', 'teak'] },
    { name: 'noyer', patterns: ['noyer', 'walnut'] },
    { name: 'bois massif', patterns: ['bois massif', 'solid wood', 'massif'] },
    { name: 'métal', patterns: ['métal', 'metal', 'acier', 'steel', 'fer', 'iron'] },
    { name: 'verre', patterns: ['verre', 'glass', 'cristal'] },
    { name: 'tissu', patterns: ['tissu', 'fabric', 'textile'] },
    { name: 'cuir', patterns: ['cuir', 'leather'] },
    { name: 'velours', patterns: ['velours', 'velvet', 'côtelé'] },
    { name: 'travertin', patterns: ['travertin', 'travertine'] },
    { name: 'marbre', patterns: ['marbre', 'marble'] },
    { name: 'chenille', patterns: ['chenille'] },
    { name: 'rotin', patterns: ['rotin', 'rattan', 'osier', 'wicker'] }
  ];
  
  const materials = materialPatterns
    .filter(({ patterns }) => patterns.some(pattern => text.includes(pattern)))
    .map(({ name }) => name);

  // Extract styles
  const stylePatterns = [
    { name: 'moderne', patterns: ['moderne', 'modern', 'contemporain', 'contemporary'] },
    { name: 'scandinave', patterns: ['scandinave', 'scandinavian', 'nordique', 'nordic'] },
    { name: 'industriel', patterns: ['industriel', 'industrial', 'loft'] },
    { name: 'vintage', patterns: ['vintage', 'rétro', 'retro'] },
    { name: 'minimaliste', patterns: ['minimaliste', 'minimalist', 'épuré', 'simple'] },
    { name: 'rustique', patterns: ['rustique', 'rustic', 'campagne', 'country'] },
    { name: 'classique', patterns: ['classique', 'classic', 'traditionnel'] },
    { name: 'bohème', patterns: ['bohème', 'boho', 'ethnique'] }
  ];
  
  const styles = stylePatterns
    .filter(({ patterns }) => patterns.some(pattern => text.includes(pattern)))
    .map(({ name }) => name);

  // Extract dimensions
  const dimensions: any = { unit: 'cm' };
  const dimPatterns = [
    { key: 'length', regex: /(?:longueur|length|l)\s*:?\s*(\d+(?:[.,]\d+)?)\s*cm/gi },
    { key: 'width', regex: /(?:largeur|width|w)\s*:?\s*(\d+(?:[.,]\d+)?)\s*cm/gi },
    { key: 'height', regex: /(?:hauteur|height|h)\s*:?\s*(\d+(?:[.,]\d+)?)\s*cm/gi },
    { key: 'diameter', regex: /(?:diamètre|diameter|ø)\s*:?\s*(\d+(?:[.,]\d+)?)\s*cm/gi },
    { key: 'depth', regex: /(?:profondeur|depth|p)\s*:?\s*(\d+(?:[.,]\d+)?)\s*cm/gi }
  ];
  
  dimPatterns.forEach(({ key, regex }) => {
    const match = regex.exec(text);
    if (match) {
      dimensions[key] = parseFloat(match[1].replace(',', '.'));
    }
  });

  // Extract features
  const featurePatterns = [
    'convertible', 'réversible', 'pliable', 'extensible', 'rangement', 
    'tiroir', 'roulettes', 'réglable', 'coffre', 'angle'
  ];
  
  const features = featurePatterns.filter(feature => text.includes(feature));

  // Extract room types
  const roomPatterns = [
    'salon', 'chambre', 'cuisine', 'bureau', 'salle à manger', 'entrée'
  ];
  
  const room = roomPatterns.filter(r => text.includes(r));

  // Calculate confidence score
  let confidence = 0;
  if (colors.length > 0) confidence += 20;
  if (materials.length > 0) confidence += 25;
  if (Object.keys(dimensions).length > 1) confidence += 20;
  if (styles.length > 0) confidence += 15;
  if (features.length > 0) confidence += 10;
  if (room.length > 0) confidence += 10;

  return {
    colors: [...new Set(colors)],
    materials: [...new Set(materials)],
    dimensions,
    styles: [...new Set(styles)],
    categories: [product.productType || product.category || 'mobilier'].filter(Boolean),
    priceRange: {
      min: parseFloat(product.price) || 0,
      max: parseFloat(product.price) || 0,
      currency: 'EUR'
    },
    features: [...new Set(features)],
    room: [...new Set(room)],
    confidence_score: Math.min(confidence, 100)
  };
}

async function updateTrainingMetadata(supabase: any, trainingData: any) {
  const metadata = {
    id: 'singleton',
    last_training: new Date().toISOString(),
    products_count: trainingData.products_count,
    training_type: 'auto',
    source_platform: trainingData.source_platform,
    trigger_type: trainingData.trigger_type,
    store_id: trainingData.store_id,
    model_version: '2.0-auto',
    updated_at: new Date().toISOString()
  };

  await supabase
    .from('ai_training_metadata')
    .upsert(metadata, { onConflict: 'id' });
}

async function updateRobotKnowledge(supabase: any, products: any[], source: string) {
  try {
    // Create knowledge summary for OmnIA Robot
    const knowledgeUpdate = {
      id: `knowledge-${source}-${Date.now()}`,
      source_platform: source,
      products_count: products.length,
      categories: [...new Set(products.map(p => p.category))],
      price_range: {
        min: Math.min(...products.map(p => p.price || 0)),
        max: Math.max(...products.map(p => p.price || 0))
      },
      top_materials: getTopAttributes(products, 'materials'),
      top_colors: getTopAttributes(products, 'colors'),
      top_styles: getTopAttributes(products, 'styles'),
      avg_confidence: products.reduce((sum, p) => sum + p.confidence_score, 0) / products.length,
      updated_at: new Date().toISOString()
    };

    console.log('🤖 Base de connaissances robot mise à jour:', {
      source,
      categories: knowledgeUpdate.categories.length,
      confidence: Math.round(knowledgeUpdate.avg_confidence)
    });
  } catch (error) {
    console.error('❌ Save attributes function error:', {
      product_id: productId,
      error_message: error.message,
      error_type: error.constructor.name,
      supabase_configured: !!supabase
    });
    // Continue without failing the entire process
  }
}

function getTopAttributes(products: any[], attributeType: string): string[] {
  const attributeCount = new Map<string, number>();
  
  products.forEach(product => {
    const attributes = product.extracted_attributes?.[attributeType] || [];
    attributes.forEach((attr: string) => {
      attributeCount.set(attr, (attributeCount.get(attr) || 0) + 1);
    });
  });
  
  return Array.from(attributeCount.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, 10)
    .map(([attr]) => attr);
}