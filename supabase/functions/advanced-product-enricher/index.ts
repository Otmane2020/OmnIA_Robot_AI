const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
};

import { createClient } from 'npm:@supabase/supabase-js@2';

interface ProductEnrichmentRequest {
  products: any[];
  retailer_id: string;
  source: 'csv' | 'shopify' | 'xml' | 'manual';
  enable_image_analysis?: boolean;
  batch_size?: number;
}

interface EnrichedAttributes {
  general_info: {
    title: string;
    brand: string;
    product_type: string;
    subcategory: string;
  };
  technical_specs: {
    dimensions?: string;
    seat_height?: string;
    bed_surface?: string;
    structure?: string;
    material: string;
    color: string;
    style: string;
    room: string;
    capacity?: string;
  };
  features: {
    convertible?: boolean;
    storage?: boolean;
    angle_reversible?: boolean;
    adjustable?: boolean;
    foldable?: boolean;
    extendable?: boolean;
  };
  seo_marketing: {
    seo_title: string;
    seo_description: string;
    ad_headline: string;
    ad_description: string;
    tags: string[];
    google_product_category: string;
  };
  ai_confidence: {
    overall: number;
    color: number;
    style: number;
    dimensions: number;
    material: number;
    category: number;
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
    const { 
      products, 
      retailer_id, 
      source, 
      enable_image_analysis = true,
      batch_size = 10 
    }: ProductEnrichmentRequest = await req.json();
    
    console.log('🤖 [advanced-enricher] Démarrage enrichissement avancé:', {
      products_count: products.length,
      retailer_id,
      source,
      image_analysis: enable_image_analysis
    });

    // Initialize Supabase
    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
    
    if (!supabaseUrl || !supabaseKey) {
      throw new Error('Configuration Supabase manquante');
    }
    
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Validate retailer exists
    const { data: retailer } = await supabase
      .from('retailers')
      .select('id, company_name')
      .eq('id', retailer_id)
      .single();

    if (!retailer) {
      throw new Error(`Retailer ${retailer_id} non trouvé`);
    }

    console.log(`🏪 [advanced-enricher] Enrichissement pour: ${retailer.company_name}`);

    // Process products in batches
    const enrichedProducts = [];
    const batchCount = Math.ceil(products.length / batch_size);
    
    for (let i = 0; i < products.length; i += batch_size) {
      const batch = products.slice(i, i + batch_size);
      const batchNumber = Math.floor(i / batch_size) + 1;
      
      console.log(`📦 [advanced-enricher] Batch ${batchNumber}/${batchCount} (${batch.length} produits)`);
      
      const batchPromises = batch.map(async (product) => {
        try {
          return await enrichSingleProduct(product, retailer_id, enable_image_analysis);
        } catch (error) {
          console.error(`❌ [advanced-enricher] Erreur produit ${product.name}:`, error);
          return null;
        }
      });
      
      const batchResults = await Promise.all(batchPromises);
      const validResults = batchResults.filter(result => result !== null);
      enrichedProducts.push(...validResults);
      
      // Pause between batches
      if (i + batch_size < products.length) {
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
    }

    console.log(`✅ [advanced-enricher] ${enrichedProducts.length}/${products.length} produits enrichis`);

    // Save to database with retailer isolation
    if (enrichedProducts.length > 0) {
      const { error: insertError } = await supabase
        .from('products_enriched')
        .upsert(enrichedProducts, { 
          onConflict: 'handle',
          ignoreDuplicates: false 
        });

      if (insertError) {
        console.error('❌ [advanced-enricher] Erreur sauvegarde DB:', insertError);
        throw insertError;
      }

      console.log('✅ [advanced-enricher] Produits sauvegardés en DB');
    }

    // Update enrichment metadata
    await updateEnrichmentMetadata(supabase, {
      retailer_id,
      products_processed: enrichedProducts.length,
      source,
      execution_time: new Date().toISOString()
    });

    return new Response(
      JSON.stringify({
        success: true,
        message: `${enrichedProducts.length} produits enrichis avec succès`,
        stats: {
          total_products: products.length,
          enriched_products: enrichedProducts.length,
          success_rate: (enrichedProducts.length / products.length) * 100,
          retailer_id,
          source,
          processed_at: new Date().toISOString()
        },
        enriched_data: enrichedProducts
      }),
      {
        headers: {
          'Content-Type': 'application/json',
          ...corsHeaders,
        },
      }
    );

  } catch (error) {
    console.error('❌ [advanced-enricher] Erreur enrichissement:', error);
    
    return new Response(
      JSON.stringify({
        success: false,
        error: 'Erreur lors de l\'enrichissement avancé',
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

async function enrichSingleProduct(product: any, retailerId: string, enableImageAnalysis: boolean) {
  console.log(`🔍 [advanced-enricher] Enrichissement: ${product.name?.substring(0, 30)}...`);
  
  // Step 1: Text analysis with DeepSeek
  const textAttributes = await extractTextAttributes(product);
  
  // Step 2: Image analysis with OpenAI Vision (if enabled and image available)
  let imageAttributes = null;
  if (enableImageAnalysis && product.image_url) {
    try {
      imageAttributes = await extractImageAttributes(product.image_url, textAttributes);
    } catch (error) {
      console.warn(`⚠️ [advanced-enricher] Image analysis failed for ${product.name}:`, error);
    }
  }
  
  // Step 3: Merge and validate attributes
  const mergedAttributes = mergeAttributes(textAttributes, imageAttributes);
  
  // Step 4: Generate enriched product
  const enrichedProduct = {
    id: product.id || `enriched-${retailerId}-${Date.now()}-${Math.random()}`,
    handle: product.handle || generateHandle(product.name || product.title),
    title: product.name || product.title || 'Produit sans nom',
    description: product.description || '',
    
    // General info
    category: mergedAttributes.general_info.product_type,
    subcategory: mergedAttributes.general_info.subcategory,
    
    // Technical specs
    color: mergedAttributes.technical_specs.color,
    material: mergedAttributes.technical_specs.material,
    fabric: extractFabricFromMaterial(mergedAttributes.technical_specs.material),
    style: mergedAttributes.technical_specs.style,
    dimensions: mergedAttributes.technical_specs.dimensions || '',
    room: mergedAttributes.technical_specs.room,
    
    // Pricing and inventory
    price: parseFloat(product.price) || 0,
    stock_qty: parseInt(product.stock) || parseInt(product.quantityAvailable) || 0,
    
    // Media
    image_url: product.image_url || 'https://images.pexels.com/photos/1350789/pexels-photo-1350789.jpeg',
    product_url: product.product_url || '#',
    
    // SEO and marketing
    tags: mergedAttributes.seo_marketing.tags,
    seo_title: mergedAttributes.seo_marketing.seo_title,
    seo_description: mergedAttributes.seo_marketing.seo_description,
    ad_headline: mergedAttributes.seo_marketing.ad_headline,
    ad_description: mergedAttributes.seo_marketing.ad_description,
    google_product_category: mergedAttributes.seo_marketing.google_product_category,
    gtin: product.gtin || '',
    brand: mergedAttributes.general_info.brand,
    
    // AI metadata
    confidence_score: mergedAttributes.ai_confidence.overall,
    enriched_at: new Date().toISOString(),
    enrichment_source: imageAttributes ? 'text_and_image' : 'text_only',
    
    // Retailer isolation
    retailer_id: retailerId,
    
    // Timestamps
    created_at: new Date().toISOString()
  };
  
  console.log(`✅ [advanced-enricher] Produit enrichi: ${enrichedProduct.title.substring(0, 30)} (${enrichedProduct.confidence_score}%)`);
  
  return enrichedProduct;
}

async function extractTextAttributes(product: any): Promise<EnrichedAttributes> {
  const deepseekApiKey = Deno.env.get('DEEPSEEK_API_KEY');
  
  if (!deepseekApiKey) {
    console.log('⚠️ [advanced-enricher] DeepSeek non configuré, extraction basique');
    return extractBasicAttributes(product);
  }

  try {
    // Exploiter COMPLÈTEMENT titre, description et image pour enrichissement optimal
    const productTitle = product.name || product.title || '';
    const productDescription = product.description || product.body_html || '';
    const productImage = product.image_url || product.featuredImage?.url || '';
    const productPrice = product.price || product.variant_price || 0;
    const productComparePrice = product.compare_at_price || product.variant_compare_at_price || '';
    const productBrand = product.vendor || product.brand || '';
    const productTags = Array.isArray(product.tags) ? product.tags.join(', ') : (product.tags || '');
    const productStock = product.stock || product.quantityAvailable || product.variant_inventory_qty || 0;
    
    const productText = `
TITRE PRODUIT: ${productTitle}
DESCRIPTION COMPLÈTE: ${productDescription.replace(/<[^>]*>/g, '').trim()}
CATÉGORIE: ${product.category || product.productType || product.product_type || ''}
PRIX ACTUEL: ${productPrice}€
PRIX BARRÉ: ${productComparePrice}€
MARQUE/VENDEUR: ${productBrand}
    // Exploiter COMPLÈTEMENT titre, description et image pour enrichissement optimal
    const productTitle = product.name || product.title || '';
    const productDescription = product.description || product.body_html || '';
    const productImage = product.image_url || product.featuredImage?.url || '';
    const productPrice = product.price || product.variant_price || 0;
    const productComparePrice = product.compare_at_price || product.variant_compare_at_price || '';
    const productBrand = product.vendor || product.brand || '';
    const productTags = Array.isArray(product.tags) ? product.tags.join(', ') : (product.tags || '');
    const productStock = product.stock || product.quantityAvailable || product.variant_inventory_qty || 0;
    
    const productText = `
  }
}
TITRE PRODUIT: ${productTitle}
DESCRIPTION COMPLÈTE: ${productDescription.replace(/<[^>]*>/g, '').trim()}
CATÉGORIE: ${product.category || product.productType || product.product_type || ''}
PRIX ACTUEL: ${productPrice}€
PRIX BARRÉ: ${productComparePrice}€
MARQUE/VENDEUR: ${productBrand}
TAGS PRODUIT: ${productTags}
URL IMAGE: ${productImage}
STOCK DISPONIBLE: ${productStock}
SOUS-CATÉGORIE DÉTECTÉE: ${product.subcategory || ''}
MATÉRIAU DÉTECTÉ: ${product.material || ''}
COULEUR DÉTECTÉE: ${product.color || ''}
STYLE DÉTECTÉ: ${product.style || ''}
    `.trim();

    const prompt = \`Analyse ce produit mobilier et enrichis-le COMPLÈTEMENT au format JSON strict :

${productText}

Extrait TOUS ces attributs au format JSON exact :
{
  "general_info": {
    "title": "Titre optimisé du produit",
    "brand": "Marque/Fabricant",
    "product_type": "Canapé|Table|Chaise|Lit|Rangement|Meuble TV|Décoration|Éclairage",
    "subcategory": "Description précise (ex: Canapé d'angle convertible, Table basse ronde)"
  },
  "technical_specs": {
    "dimensions": "L:XXXcm x l:XXXcm x H:XXXcm ou Ø:XXXcm",
    "seat_height": "XXcm (si applicable)",
    "bed_surface": "XXX x XXX cm (si convertible)",
    "structure": "Description structure/rembourrage",
    "material": "bois|métal|verre|tissu|cuir|velours|travertin|marbre|plastique|rotin",
    "color": "blanc|noir|gris|beige|marron|bleu|vert|rouge|jaune|orange|rose|violet|naturel|chêne|noyer|taupe",
    "style": "moderne|contemporain|scandinave|industriel|vintage|rustique|classique|minimaliste|bohème",
    "room": "salon|chambre|cuisine|bureau|salle à manger|entrée|terrasse",
    "capacity": "X personnes/places (si applicable)"
  },
  "features": {
    "convertible": true/false,
    "storage": true/false,
    "angle_reversible": true/false,
    "adjustable": true/false,
    "foldable": true/false,
    "extendable": true/false
  },
  "seo_marketing": {
    "seo_title": "Titre SEO optimisé ≤70 caractères",
    "seo_description": "Meta description ≤155 caractères",
    "ad_headline": "Titre publicitaire ≤30 caractères",
    "ad_description": "Description pub ≤90 caractères",
    "tags": ["tag1", "tag2", "tag3"],
    "google_product_category": "ID Google Shopping (635=Canapés, 443=Tables, 436=Chaises)"
  },
  "ai_confidence": {
    "overall": 85,
    "color": 90,
    "style": 80,
    "dimensions": 95,
    "material": 85,
    "category": 95
  }
}

RÈGLES STRICTES:
- Utilise UNIQUEMENT les valeurs listées pour material, color, style, room, product_type
- dimensions: Format précis avec unités (L:200cm x l:100cm x H:75cm)
- subcategory: Description spécifique et détaillée
- seo_title: Inclure marque et bénéfices clés
- seo_description: Inclure USP, livraison, promo si applicable
- tags: 3-5 mots-clés pertinents pour le référencement
- ai_confidence: Scores 0-100 pour chaque attribut

RÉPONSE JSON UNIQUEMENT:`;

    const response = await fetch('https://api.deepseek.com/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': \`Bearer ${deepseekApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'deepseek-chat',
        messages: [
          {
            role: 'system',
            content: 'Tu es un expert en mobilier et design d\'intérieur. Tu enrichis COMPLÈTEMENT les produits au format JSON strict avec tous les attributs demandés. Aucun texte supplémentaire.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        max_tokens: 800,
        temperature: 0.1,
        stream: false
      }),
    });

    if (response.ok) {
      const data = await response.json();
      const content = data.choices[0]?.message?.content?.trim();
      
      if (content) {
        try {
          const enriched = JSON.parse(content);
          console.log('✅ [advanced-enricher] Extraction DeepSeek réussie:', {
            product: (product.name || product.title)?.substring(0, 30),
            category: enriched.general_info?.product_type,
            subcategory: enriched.general_info?.subcategory,
            confidence: enriched.ai_confidence?.overall
          });
          
          return enriched;
        } catch (parseError) {
          console.log('⚠️ [advanced-enricher] JSON invalide, fallback basique');
        }
      }
    }
  } catch (error) {
    console.log('⚠️ [advanced-enricher] Erreur DeepSeek, fallback basique:', error);
  }

  return extractBasicAttributes(product);
}

async function extractImageAttributes(imageUrl: string, textAttributes: EnrichedAttributes) {
  const openaiApiKey = Deno.env.get('OPENAI_API_KEY');
  
  if (!openaiApiKey) {
    console.log('⚠️ [advanced-enricher] OpenAI non configuré pour analyse image');
    return null;
  }

  try {
    console.log('👁️ [advanced-enricher] Analyse image avec OpenAI Vision...');

    const prompt = \`Analyse cette image de produit mobilier et extrait les attributs visuels au format JSON :

Contexte du produit (depuis le texte) :
- Type: ${textAttributes.general_info.product_type}
- Couleur détectée: ${textAttributes.technical_specs.color}
- Matériau détecté: ${textAttributes.technical_specs.material}
- Style détecté: ${textAttributes.technical_specs.style}

Analyse l'image et extrait/corrige ces attributs visuels :
{
  "visual_attributes": {
    "dominant_colors": ["couleur1", "couleur2"],
    "materials_visible": ["matériau1", "matériau2"],
    "style_visual": "moderne|contemporain|scandinave|industriel|vintage|rustique|classique",
    "shape": "rond|carré|rectangulaire|ovale|angle",
    "texture": "lisse|rugueux|brillant|mat|texturé",
    "finish": "naturel|laqué|brossé|patiné|vieilli"
  },
  "dimensions_estimate": {
    "relative_size": "petit|moyen|grand",
    "proportions": "compact|standard|généreux"
  },
  "quality_indicators": {
    "build_quality": "entrée de gamme|standard|premium",
    "design_complexity": "simple|élaboré|sophistiqué"
  },
  "confidence_scores": {
    "color_accuracy": 95,
    "material_accuracy": 80,
    "style_accuracy": 85
  }
}

Corrige les attributs texte si l'image montre quelque chose de différent.
RÉPONSE JSON UNIQUEMENT:`;

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': \`Bearer ${openaiApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o',
        messages: [
          {
            role: 'system',
            content: 'Tu es un expert en analyse visuelle de mobilier. Tu extrais des attributs visuels précis au format JSON. Aucun texte supplémentaire.'
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
        max_tokens: 500,
        temperature: 0.1,
      }),
    });

    if (response.ok) {
      const data = await response.json();
      const content = data.choices[0]?.message?.content?.trim();
      
      if (content) {
        try {
          const imageAnalysis = JSON.parse(content);
          console.log('✅ [advanced-enricher] Analyse image réussie');
          return imageAnalysis;
        } catch (parseError) {
          console.log('⚠️ [advanced-enricher] JSON image invalide');
        }
      }
    }
  } catch (error) {
    console.log('⚠️ [advanced-enricher] Erreur analyse image:', error);
  }

  return null;
}

function mergeAttributes(textAttributes: EnrichedAttributes, imageAttributes: any): EnrichedAttributes {
  if (!imageAttributes) {
    return textAttributes;
  }

  // Merge visual attributes with text attributes
  const merged = { ...textAttributes };
  
  // Update color if image provides better accuracy
  if (imageAttributes.visual_attributes?.dominant_colors?.length > 0 && 
      imageAttributes.confidence_scores?.color_accuracy > 80) {
    merged.technical_specs.color = imageAttributes.visual_attributes.dominant_colors[0];
    merged.ai_confidence.color = imageAttributes.confidence_scores.color_accuracy;
  }
  
  // Update material if image provides better accuracy
  if (imageAttributes.visual_attributes?.materials_visible?.length > 0 && 
      imageAttributes.confidence_scores?.material_accuracy > 80) {
    merged.technical_specs.material = imageAttributes.visual_attributes.materials_visible[0];
    merged.ai_confidence.material = imageAttributes.confidence_scores.material_accuracy;
  }
  
  // Update style if image provides better accuracy
  if (imageAttributes.visual_attributes?.style_visual && 
      imageAttributes.confidence_scores?.style_accuracy > 80) {
    merged.technical_specs.style = imageAttributes.visual_attributes.style_visual;
    merged.ai_confidence.style = imageAttributes.confidence_scores.style_accuracy;
  }
  
  // Recalculate overall confidence
  const confidenceValues = Object.values(merged.ai_confidence).filter(v => typeof v === 'number');
  merged.ai_confidence.overall = Math.round(
    confidenceValues.reduce((sum, val) => sum + val, 0) / confidenceValues.length
  );
  
  return merged;
}

function extractBasicAttributes(product: any): EnrichedAttributes {
  const text = \`${product.name || product.title || ''} ${product.description || ''} ${product.category || product.productType || ''}`.toLowerCase();
  
  // Detect category and subcategory
  let productType = 'Mobilier';
  let subcategory = '';
  
  if (text.includes('canapé') || text.includes('sofa')) {
    productType = 'Canapé';
    if (text.includes('angle')) subcategory = 'Canapé d\'angle';
    else if (text.includes('convertible')) subcategory = 'Canapé convertible';
    else if (text.includes('lit')) subcategory = 'Canapé-lit';
    else subcategory = 'Canapé fixe';
  } else if (text.includes('table')) {
    productType = 'Table';
    if (text.includes('basse')) subcategory = 'Table basse';
    else if (text.includes('manger') || text.includes('repas')) subcategory = 'Table à manger';
    else if (text.includes('bureau')) subcategory = 'Bureau';
    else if (text.includes('ronde')) subcategory = 'Table ronde';
    else subcategory = 'Table';
  } else if (text.includes('chaise') || text.includes('fauteuil')) {
    productType = 'Chaise';
    if (text.includes('bureau')) subcategory = 'Chaise de bureau';
    else if (text.includes('fauteuil')) subcategory = 'Fauteuil';
    else subcategory = 'Chaise de salle à manger';
  }

  // Basic attribute detection
  const colors = ['blanc', 'noir', 'gris', 'beige', 'marron', 'bleu', 'vert', 'rouge', 'naturel', 'chêne', 'taupe'];
  const materials = ['bois', 'métal', 'verre', 'tissu', 'cuir', 'velours', 'travertin', 'marbre'];
  const styles = ['moderne', 'contemporain', 'scandinave', 'industriel', 'vintage', 'classique'];
  const rooms = ['salon', 'chambre', 'cuisine', 'bureau', 'salle à manger', 'entrée'];

  const detectedColor = colors.find(color => text.includes(color)) || '';
  const detectedMaterial = materials.find(material => text.includes(material)) || '';
  const detectedStyle = styles.find(style => text.includes(style)) || '';
  const detectedRoom = rooms.find(room => text.includes(room)) || '';

  // Extract dimensions
  const dimensionMatch = text.match(/(\d+)\s*[x×]\s*(\d+)(?:\s*[x×]\s*(\d+))?\s*cm/);
  const dimensions = dimensionMatch ? 
    (dimensionMatch[3] ? \`L:${dimensionMatch[1]}cm x l:${dimensionMatch[2]}cm x H:${dimensionMatch[3]}cm` : 
     \`L:${dimensionMatch[1]}cm x l:${dimensionMatch[2]}cm`) : '';

  // Generate SEO content
  const productName = product.name || product.title || 'Produit';
  const brand = product.vendor || product.brand || 'Decora Home';
  
  return {
    general_info: {
      title: productName,
      brand: brand,
      product_type: productType,
      subcategory: subcategory
    },
    technical_specs: {
      dimensions: dimensions,
      material: detectedMaterial,
      color: detectedColor,
      style: detectedStyle,
      room: detectedRoom
    },
    features: {
      convertible: text.includes('convertible'),
      storage: text.includes('rangement') || text.includes('coffre'),
      angle_reversible: text.includes('réversible'),
      adjustable: text.includes('réglable'),
      foldable: text.includes('pliable'),
      extendable: text.includes('extensible')
    },
    seo_marketing: {
      seo_title: \`${productName} ${detectedColor ? detectedColor : ''} - ${brand}`.substring(0, 70),
      seo_description: \`${productName} ${detectedMaterial ? 'en ' + detectedMaterial : ''} ${detectedColor ? detectedColor : ''}. ${detectedStyle ? 'Style ' + detectedStyle : ''}. Livraison gratuite.`.substring(0, 155),
      ad_headline: productName.substring(0, 30),
      ad_description: \`${productName} ${detectedMaterial ? detectedMaterial : ''}. ${detectedStyle ? detectedStyle : ''}. Promo !`.substring(0, 90),
      tags: [productType.toLowerCase(), detectedColor, detectedMaterial, detectedStyle].filter(Boolean),
      google_product_category: getGoogleCategory(productType)
    },
    ai_confidence: {
      overall: 60,
      color: detectedColor ? 80 : 30,
      style: detectedStyle ? 75 : 30,
      dimensions: dimensions ? 90 : 20,
      material: detectedMaterial ? 80 : 30,
      category: 85
    }
  };
}

function extractFabricFromMaterial(material: string): string {
  const fabricMappings: { [key: string]: string } = {
    'tissu': 'tissu',
    'velours': 'velours',
    'cuir': 'cuir',
    'lin': 'lin',
    'coton': 'coton',
    'chenille': 'chenille',
    'polyester': 'polyester'
  };
  
  return fabricMappings[material.toLowerCase()] || '';
}

function generateHandle(title: string): string {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .trim()
    .substring(0, 100);
}

function getGoogleCategory(productType: string): string {
  const categoryMappings: { [key: string]: string } = {
    'Canapé': '635',
    'Table': '443', 
    'Chaise': '436',
    'Lit': '569',
    'Rangement': '6552',
    'Meuble TV': '6552',
    'Décoration': '696',
    'Éclairage': '594'
  };
  
  return categoryMappings[productType] || '';
}

async function updateEnrichmentMetadata(supabase: any, metadata: any) {
  try {
    await supabase
      .from('ai_training_metadata')
      .upsert({
        id: 'singleton',
        last_training: metadata.execution_time,
        products_count: metadata.products_processed,
        training_type: \`enrichment_${metadata.source}`,
        model_version: '2.1-advanced',
        updated_at: metadata.execution_time
      }, { onConflict: 'id' });

    console.log('✅ [advanced-enricher] Métadonnées mises à jour');
  } catch (error) {
    console.error('❌ [advanced-enricher] Erreur métadonnées:', error);
  }
}