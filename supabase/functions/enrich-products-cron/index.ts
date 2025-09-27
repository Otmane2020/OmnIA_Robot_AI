const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
};

import { createClient } from 'npm:@supabase/supabase-js@2';

interface ProductEnrichmentRequest {
  products: any[];
  retailer_id: string;
  force_full_enrichment?: boolean;
  source_filter?: string;
  vendor_id?: string;
  enable_image_analysis?: boolean;
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
  // Handle GET requests for health check
  if (req.method === "GET") {
    return new Response(
      JSON.stringify({ 
        status: "OK", 
        message: "Edge Function enrich-products-cron is running",
        timestamp: new Date().toISOString()
      }),
      {
        status: 200,
        headers: { 'Content-Type': 'application/json', ...corsHeaders }
      }
    );
  }

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
      force_full_enrichment = false, 
      source_filter, 
      vendor_id,
      enable_image_analysis = true
    }: ProductEnrichmentRequest = await req.json();
    
    console.log('🤖 [enrich-products-cron] Enrichissement démarré:', {
      products_count: products?.length || 0,
      retailer_id,
      vendor_id,
      force_full_enrichment,
      enable_image_analysis
    });

    // Validation des produits
    if (!products || products.length === 0) {
      return new Response(
        JSON.stringify({
          success: false,
          message: 'Aucun produit fourni pour enrichissement',
          stats: { products_processed: 0, enriched_products: 0 }
        }),
        {
          status: 400,
          headers: { 'Content-Type': 'application/json', ...corsHeaders }
        }
      );
    }

    // Initialisation Supabase
    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
    
    if (!supabaseUrl || !supabaseKey) {
      return new Response(
        JSON.stringify({
          success: false,
          error: 'Configuration Supabase manquante'
        }),
        {
          status: 500,
          headers: { 'Content-Type': 'application/json', ...corsHeaders }
        }
      );
    }
    
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Filtrage des produits actifs
    const activeProducts = products.filter(product => 
      product.status === 'active' && 
      (product.stock > 0 || product.quantityAvailable > 0 || product.stock_qty > 0)
    );

    console.log(`📦 Produits actifs à enrichir: ${activeProducts.length}/${products.length}`);

    // Enrichissement des produits
    const enrichedProducts = [];
    let successCount = 0;
    let errorCount = 0;

    for (const [index, product] of activeProducts.entries()) {
      try {
        console.log(`🔄 [${index + 1}/${activeProducts.length}] Enrichissement: ${product.name?.substring(0, 50)}...`);
        
        const enrichedAttributes = await enrichProductWithAI(product, enable_image_analysis);
        
        const enrichedProduct = createEnrichedProduct(product, enrichedAttributes, retailer_id || vendor_id);
        enrichedProducts.push(enrichedProduct);
        successCount++;

      } catch (error) {
        console.error(`❌ Erreur enrichissement ${product.name}:`, error);
        errorCount++;
      }
    }

    console.log(`✅ ${successCount}/${activeProducts.length} produits enrichis avec succès`);

    // Sauvegarde dans Supabase
    if (enrichedProducts.length > 0) {
      try {
        const { error: insertError } = await supabase
          .from('products_enriched')
          .upsert(enrichedProducts, { 
            onConflict: 'handle',
            ignoreDuplicates: false 
          });

        if (insertError) {
          console.warn('⚠️ Erreur Supabase (non bloquant):', insertError);
        } else {
          console.log('💾 Produits enrichis sauvegardés dans Supabase');
        }
      } catch (supabaseError) {
        console.warn('⚠️ Supabase non disponible:', supabaseError);
      }
    }

    // Statistiques finales
    const stats = {
      products_processed: successCount,
      products_failed: errorCount,
      success_rate: Math.round((successCount / activeProducts.length) * 100),
      execution_time: new Date().toISOString(),
      retailer_id: retailer_id || vendor_id
    };

    return new Response(
      JSON.stringify({
        success: true,
        message: `Enrichissement terminé: ${successCount} produits enrichis`,
        stats,
        enriched_products: enrichedProducts.length
      }),
      {
        headers: { 'Content-Type': 'application/json', ...corsHeaders }
      }
    );

  } catch (error) {
    console.error('❌ Erreur globale:', error);
    
    return new Response(
      JSON.stringify({
        success: false,
        error: 'Erreur lors de l\'enrichissement',
        details: error.message
      }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json', ...corsHeaders }
      }
    );
  }
});

function createEnrichedProduct(product: any, attributes: EnrichedAttributes, retailerId: string) {
  return {
    id: product.id || `enriched-${retailerId}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    handle: product.handle || product.id || generateHandle(product.name || product.title),
    title: attributes.general_info.title,
    description: product.description || '',
    
    category: attributes.general_info.product_type,
    subcategory: attributes.general_info.subcategory,
    
    color: attributes.technical_specs.color,
    material: attributes.technical_specs.material,
    fabric: extractFabricFromMaterial(attributes.technical_specs.material),
    style: attributes.technical_specs.style,
    dimensions: attributes.technical_specs.dimensions || '',
    room: attributes.technical_specs.room,
    
    price: parseFloat(product.price) || 0,
    compare_at_price: parseFloat(product.compare_at_price) || null,
    stock_qty: getStockQuantity(product),
    
    image_url: product.image_url || product.image || 'https://images.pexels.com/photos/1350789/pexels-photo-1350789.jpeg',
    product_url: product.product_url || product.url || '#',
    
    tags: attributes.seo_marketing.tags,
    seo_title: attributes.seo_marketing.seo_title,
    seo_description: attributes.seo_marketing.seo_description,
    ad_headline: attributes.seo_marketing.ad_headline,
    ad_description: attributes.seo_marketing.ad_description,
    google_product_category: attributes.seo_marketing.google_product_category,
    gtin: product.gtin || '',
    brand: attributes.general_info.brand,
    
    confidence_score: attributes.ai_confidence.overall,
    enriched_at: new Date().toISOString(),
    enrichment_source: attributes.enrichment_source || 'text_only',
    
    // CRITICAL: Add retailer_id for proper isolation
    retailer_id: retailerId,
    created_at: product.created_at || new Date().toISOString()
  };
}

function getStockQuantity(product: any): number {
  return parseInt(product.stock) || 
         parseInt(product.quantityAvailable) || 
         parseInt(product.stock_qty) || 
         (product.inventory_quantity || 0);
}

async function enrichProductWithAI(product: any, enableImageAnalysis: boolean): Promise<EnrichedAttributes> {
  const deepseekApiKey = Deno.env.get('DEEPSEEK_API_KEY');
  
  if (!deepseekApiKey) {
    throw new Error('DEEPSEEK_API_KEY manquant');
  }

  try {
    const productText = `${product.name || ''} ${product.description || ''}`.trim();

    const prompt = \`Analyse ce produit mobilier et enrichis-le COMPLÈTEMENT au format JSON strict :

${productText}

Format de réponse REQUIS :
{
  "general_info": {
    "title": "string",
    "brand": "string", 
    "product_type": "string",
    "subcategory": "string"
  },
  "technical_specs": {
    "dimensions": "string",
    "material": "string",
    "color": "string",
    "style": "string",
    "room": "string"
  },
  "features": {
    "convertible": "boolean",
    "storage": "boolean",
    "adjustable": "boolean"
  },
  "seo_marketing": {
    "seo_title": "string",
    "seo_description": "string",
    "tags": "string[]"
  },
  "ai_confidence": {
    "overall": "number",
    "color": "number",
    "style": "number",
    "material": "number",
    "category": "number"
  }
}

RÈGLES STRICTES pour les tags:
- Extraire 3-5 mots-clés pertinents du TITRE et de la DESCRIPTION
- Inclure: catégorie, couleur, matériau, style, fonctionnalités
- Exemple pour "Canapé VENTU convertible": ["canapé", "ventu", "convertible", "design", "contemporain"]
- Utiliser les mots exacts du titre quand pertinents
- Éviter les mots vides (le, la, de, avec, etc.)`;

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
            content: 'Tu es un expert en analyse de produits mobilier. Tu réponds uniquement en JSON valide sans texte supplémentaire.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        max_tokens: 1000,
        temperature: 0.1,
        stream: false
      }),
    });

    if (!response.ok) {
      throw new Error(`API DeepSeek: ${response.status}`);
    }

    const data = await response.json();
    const content = data.choices[0]?.message?.content;
    
    if (!content) {
      throw new Error('Réponse DeepSeek vide');
    }

    // Nettoyage du contenu pour extraire le JSON
    const jsonMatch = content.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error('JSON non trouvé dans la réponse');
    }

    const enriched = JSON.parse(jsonMatch[0]);
    
    // Validation des champs requis
    if (!enriched.general_info || !enriched.technical_specs) {
      throw new Error('Structure JSON invalide');
    }

    // Analyse d'image optionnelle
    if (enableImageAnalysis && product.image_url) {
      try {
        const imageAnalysis = await analyzeProductImageImproved(product.image_url, enriched);
        if (imageAnalysis) {
          // Fusionner les résultats d'analyse d'image
          enriched.technical_specs.color = imageAnalysis.color || enriched.technical_specs.color;
          enriched.technical_specs.material = imageAnalysis.material || enriched.technical_specs.material;
          enriched.technical_specs.style = imageAnalysis.style || enriched.technical_specs.style;
          enriched.enrichment_source = 'text_and_image';
        }
      } catch (imageError) {
        console.warn('⚠️ Analyse image échouée:', imageError);
      }
    }

    return enriched;

  } catch (error) {
    console.log('⚠️ Erreur DeepSeek, fallback basique:', error);
    return enrichProductBasic(product);
  }
}

async function analyzeProductImageImproved(imageUrl: string, textAttributes: any) {
  const openaiApiKey = Deno.env.get('OPENAI_API_KEY');
  if (!openaiApiKey) return null;

  try {
    // Construire un prompt plus précis basé sur les attributs texte
    const expectedCategory = textAttributes.general_info?.product_type || 'Mobilier';
    const expectedSubcategory = textAttributes.general_info?.subcategory || '';
    
    const prompt = `Analyse cette image de produit mobilier et corrige/confirme les attributs détectés par l'analyse textuelle.

Attributs texte détectés:
- Catégorie: ${expectedCategory}
- Sous-catégorie: ${expectedSubcategory}
- Couleur: ${textAttributes.technical_specs?.color || 'Non détectée'}
- Matériau: ${textAttributes.technical_specs?.material || 'Non détecté'}
- Style: ${textAttributes.technical_specs?.style || 'Non détecté'}

Réponds en JSON avec:
{
  "image_matches_description": boolean,
  "visual_product_type": "string",
  "visual_attributes": {
    "dominant_colors": ["string"],
    "materials_visible": ["string"],
    "style_visual": "string",
    "storage_type": "string"
  },
  "inconsistencies": ["string"]
}`;

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openaiApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4-vision-preview',
        messages: [
          {
            role: 'system',
            content: 'Tu es un expert en analyse visuelle de mobilier avec une spécialisation en meubles de rangement. Tu identifies précisément le type de produit et corriges les incohérences entre texte et image. Réponds uniquement en JSON valide.'
          },
          {
            role: 'user',
            content: [
              {
                type: 'text',
                text: prompt
              },
              {
                type: 'image_url',
                image_url: { url: imageUrl, detail: 'high' }
              }
            ]
          }
        ],
        max_tokens: 500,
        temperature: 0.1
      }),
    });

    if (!response.ok) return null;
    
    const data = await response.json();
    const content = data.choices[0]?.message?.content;
    
    if (content) {
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        const imageAnalysis = JSON.parse(jsonMatch[0]);
        
        // Log des incohérences détectées
        if (imageAnalysis.inconsistencies && imageAnalysis.inconsistencies.length > 0) {
          console.warn('⚠️ Incohérences image/texte détectées:', imageAnalysis.inconsistencies);
        }
        
        // Si l'image ne correspond pas à la description, utiliser les attributs visuels
        if (!imageAnalysis.image_matches_description) {
          console.warn('⚠️ Image ne correspond pas à la description textuelle');
          return {
            color: imageAnalysis.visual_attributes?.dominant_colors?.[0] || textAttributes.technical_specs?.color,
            material: imageAnalysis.visual_attributes?.materials_visible?.[0] || textAttributes.technical_specs?.material,
            style: imageAnalysis.visual_attributes?.style_visual || textAttributes.technical_specs?.style,
            product_type_correction: imageAnalysis.visual_product_type,
            storage_type: imageAnalysis.visual_attributes?.storage_type
          };
        }
        
        return {
          color: imageAnalysis.visual_attributes?.dominant_colors?.[0] || textAttributes.technical_specs?.color,
          material: imageAnalysis.visual_attributes?.materials_visible?.[0] || textAttributes.technical_specs?.material,
          style: imageAnalysis.visual_attributes?.style_visual || textAttributes.technical_specs?.style
        };
      }
    }

  } catch (error) {
    console.warn('⚠️ Erreur analyse image:', error);
  }
  
  return null;
}

function enrichProductBasic(product: any): EnrichedAttributes {
  const text = `${product.name || ''} ${product.description || ''}`.toLowerCase();
  
  return {
    general_info: {
      title: product.name || product.title || 'Produit sans nom',
      brand: product.vendor || product.brand || 'Marque inconnue',
      product_type: detectCategory(text),
      subcategory: detectSubcategory(text)
    },
    technical_specs: {
      material: detectMaterial(text) || 'Non spécifié',
      color: detectColor(text) || 'Non spécifié',
      style: detectStyle(text) || 'Contemporain',
      room: detectRoom(text) || 'Salon',
      dimensions: extractDimensions(text)
    },
    features: {
      convertible: text.includes('convertible'),
      storage: text.includes('rangement') || text.includes('storage'),
      adjustable: text.includes('réglable') || text.includes('ajustable')
    },
    seo_marketing: {
      seo_title: (product.name || 'Produit').substring(0, 60),
      seo_description: (product.description || 'Description produit').substring(0, 150),
      ad_headline: (product.name || 'Produit').substring(0, 25),
      ad_description: (product.description || '').substring(0, 80),
      tags: generateBasicTags(text),
      google_product_category: '696'
    },
    ai_confidence: {
      overall: 60,
      color: 50,
      style: 55,
      dimensions: 40,
      material: 50,
      category: 70
    }
  };
}

// Fonctions helper améliorées
function detectCategory(text: string): string {
  const categories = {
    'canapé': 'Canapé',
    'sofa': 'Canapé',
    'table': 'Table', 
    'chaise': 'Chaise',
    'fauteuil': 'Chaise',
    'lit': 'Lit',
    'armoire': 'Rangement',
    'commode': 'Rangement',
    'meuble tv': 'Meuble TV',
    'luminaire': 'Éclairage',
    'lampe': 'Éclairage',
    'tapis': 'Décoration'
  };
  
  for (const [keyword, category] of Object.entries(categories)) {
    if (text.includes(keyword)) return category;
  }
  return 'Mobilier';
}

function detectSubcategory(text: string): string {
  if (text.includes('angle')) return 'Canapé d\'angle';
  if (text.includes('convertible')) return 'Canapé convertible';
  if (text.includes('basse')) return 'Table basse';
  if (text.includes('manger')) return 'Table à manger';
  return '';
}

function detectColor(text: string): string {
  const colors = ['blanc', 'noir', 'gris', 'beige', 'marron', 'bleu', 'vert', 'rouge'];
  return colors.find(color => text.includes(color)) || '';
}

function detectMaterial(text: string): string {
  const materials = ['bois', 'métal', 'verre', 'tissu', 'cuir', 'velours', 'plastic'];
  return materials.find(material => text.includes(material)) || '';
}

function detectStyle(text: string): string {
  const styles = ['moderne', 'scandinave', 'industriel', 'vintage', 'classique'];
  return styles.find(style => text.includes(style)) || '';
}

function detectRoom(text: string): string {
  const rooms = ['salon', 'chambre', 'cuisine', 'bureau', 'salle à manger'];
  return rooms.find(room => text.includes(room)) || '';
}

function extractDimensions(text: string): string {
  const match = text.match(/(\d+)\s*[x×]\s*(\d+)(?:\s*[x×]\s*(\d+))?\s*cm/);
  return match ? `L:${match[1]}cm × l:${match[2]}cm` + (match[3] ? ` × H:${match[3]}cm` : '') : '';
}

function extractFabricFromMaterial(material: string): string {
  const fabrics = ['velours', 'tissu', 'cuir'];
  return fabrics.find(fabric => material.includes(fabric)) || '';
}

function generateBasicTags(text: string): string[] {
  const tags = new Set<string>();
  
  // Nettoyer le texte et extraire les mots
  const cleanText = text
    .toLowerCase()
    .replace(/[^\w\s]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
  
  // Mots vides à exclure
  const stopWords = [
    'le', 'la', 'les', 'un', 'une', 'des', 'du', 'de', 'et', 'ou', 'avec', 'sans', 'pour', 'par', 'sur', 'dans', 'à', 'au', 'aux',
    'ce', 'cette', 'ces', 'son', 'sa', 'ses', 'notre', 'nos', 'votre', 'vos', 'leur', 'leurs',
    'qui', 'que', 'dont', 'où', 'quand', 'comment', 'pourquoi',
    'très', 'plus', 'moins', 'bien', 'mal', 'tout', 'tous', 'toute', 'toutes',
    'est', 'sont', 'était', 'étaient', 'sera', 'seront', 'avoir', 'être',
    'cm', 'mm', 'm', 'kg', 'g', 'eur', 'euro', 'euros'
  ];
  
  // Extraire les mots significatifs
  const words = cleanText.split(' ')
    .filter(word => word.length > 2)
    .filter(word => !stopWords.includes(word))
    .filter(word => !/^\d+$/.test(word));
  
  // Mots-clés prioritaires mobilier
  const furnitureKeywords = [
    'canapé', 'ventu', 'alyana', 'aurea', 'inaya', 'convertible', 'angle', 'places', 'velours', 'tissu', 'cuir',
    'table', 'ronde', 'rectangulaire', 'basse', 'manger', 'travertin', 'marbre', 'bois', 'métal',
    'chaise', 'fauteuil', 'bureau', 'ergonomique', 'pivotant',
    'lit', 'matelas', 'sommier', 'tête', 'rangement',
    'moderne', 'contemporain', 'scandinave', 'industriel', 'vintage', 'classique',
    'salon', 'chambre', 'cuisine', 'bureau', 'salle',
    'blanc', 'noir', 'gris', 'beige', 'marron', 'bleu', 'vert', 'rouge',
    'design', 'élégant', 'confort', 'qualité', 'premium', 'luxe'
  ];
  
  // Compter la fréquence et prioriser
  const wordCount = new Map<string, number>();
  words.forEach(word => {
    wordCount.set(word, (wordCount.get(word) || 0) + 1);
  });
  
  // Séparer mots prioritaires et réguliers
  const priorityTags: string[] = [];
  const regularTags: string[] = [];
  
  Array.from(wordCount.entries())
    .sort((a, b) => b[1] - a[1])
    .forEach(([word, count]) => {
      if (furnitureKeywords.includes(word)) {
        priorityTags.push(word);
      } else if (count > 1 || word.length > 4) {
        regularTags.push(word);
      }
    });
  
  // Combiner et limiter
  const finalTags = [...priorityTags.slice(0, 3), ...regularTags.slice(0, 2)]
    .slice(0, 5)
    .filter((tag, index, array) => array.indexOf(tag) === index);
  
  return finalTags.length > 0 ? finalTags : ['mobilier', 'design', 'intérieur'];
}

function generateHandle(name: string): string {
  return name
    .toLowerCase()
    .normalize('NFD').replace(/[\u0300-\u036f]/g, '') // Supprimer accents
    .replace(/[^a-z0-9\s-]/g, '')
    .trim()
    .replace(/\s+/g, '-')
    .substring(0, 100);
}