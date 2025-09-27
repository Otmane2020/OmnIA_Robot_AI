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

    const prompt = `Analyse ce produit mobilier et enrichis-le COMPLÈTEMENT au format JSON strict :

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
            content: 'Tu es un expert en mobilier qui enrichit les descriptions produits avec précision. Réponds uniquement en JSON valide.'
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
      product_type: detectCategoryImproved(text),
      subcategory: detectSubcategoryImproved(text)
    },
    technical_specs: {
      material: detectMaterialImproved(text) || 'Non spécifié',
      color: detectColorImproved(text) || 'Non spécifié',
      style: detectStyle(text) || 'Contemporain',
      room: detectRoomImproved(text) || 'Salon',
      dimensions: extractDimensionsImproved(text)
    },
    features: {
      convertible: text.includes('convertible'),
      storage: text.includes('rangement') || text.includes('storage'),
      adjustable: text.includes('réglable') || text.includes('ajustable')
    },
    seo_marketing: {
      seo_title: generateSEOTitle(product),
      seo_description: generateSEODescription(product),
      ad_headline: generateAdHeadline(product),
      ad_description: generateAdDescription(product),
      tags: generateImprovedTags(text, product.name || ''),
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
function detectCategoryImproved(text: string): string {
  const categories = {
    // Rangement spécialisé
    'meuble à chaussures': 'Rangement',
    'range-chaussures': 'Rangement',
    'chaussures': 'Rangement',
    'bibliothèque': 'Rangement',
    'étagère': 'Rangement',
    'commode': 'Rangement',
    'armoire': 'Rangement',
    'dressing': 'Rangement',
    'console': 'Console',
    // Mobilier principal
    'canapé': 'Canapé',
    'sofa': 'Canapé',
    'table': 'Table', 
    'chaise': 'Chaise',
    'fauteuil': 'Chaise',
    'lit': 'Lit',
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

function detectSubcategoryImproved(text: string): string {
  // Rangement spécialisé
  if (text.includes('meuble à chaussures') || text.includes('range-chaussures')) return 'Meuble à chaussures compact';
  if (text.includes('bibliothèque') || text.includes('étagère livre')) return 'Bibliothèque';
  if (text.includes('commode')) return 'Commode';
  if (text.includes('armoire') && text.includes('penderie')) return 'Armoire penderie';
  if (text.includes('armoire')) return 'Armoire';
  if (text.includes('console') && text.includes('entrée')) return 'Console d\'entrée';
  if (text.includes('console')) return 'Console';
  
  // Canapés
  if (text.includes('angle')) return 'Canapé d\'angle';
  if (text.includes('convertible')) return 'Canapé convertible';
  
  // Tables
  if (text.includes('basse')) return 'Table basse';
  if (text.includes('manger')) return 'Table à manger';
  if (text.includes('console')) return 'Console';
  
  // Chaises
  if (text.includes('bureau')) return 'Chaise de bureau';
  if (text.includes('bar')) return 'Tabouret de bar';
  
  return '';
}

function detectColorImproved(text: string): string {
  const colors = [
    'blanc', 'noir', 'gris', 'beige', 'marron', 'bleu', 'vert', 'rouge', 
    'jaune', 'orange', 'rose', 'violet', 'naturel', 'chêne', 'noyer', 
    'taupe', 'ivoire', 'anthracite', 'crème'
  ];
  return colors.find(color => text.includes(color)) || '';
}

function detectMaterialImproved(text: string): string {
  const materials = [
    // Panneaux et dérivés du bois
    'mdf', 'contreplaqué', 'aggloméré', 'mélaminé', 'stratifié',
    // Bois massifs
    'bois massif', 'chêne', 'hêtre', 'pin', 'teck', 'noyer', 'bois',
    // Métaux
    'métal', 'acier', 'aluminium', 'fer', 'laiton', 'chrome',
    // Autres
    'verre', 'tissu', 'cuir', 'velours', 'travertin', 'marbre', 'plastique', 'rotin'
  ];
  return materials.find(material => text.includes(material)) || '';
}

function detectStyle(text: string): string {
  const styles = ['moderne', 'scandinave', 'industriel', 'vintage', 'classique'];
  return styles.find(style => text.includes(style)) || '';
}

function detectRoomImproved(text: string): string {
  const rooms = [
    'salon', 'chambre', 'cuisine', 'bureau', 'salle à manger', 
    'entrée', 'couloir', 'dressing', 'terrasse', 'balcon'
  ];
  return rooms.find(room => text.includes(room)) || '';
}

function extractDimensionsImproved(text: string): string {
  // Patterns pour différents formats de dimensions
  const patterns = [
    // Format standard: LxlxH
    /(\d+)\s*[x×]\s*(\d+)\s*[x×]\s*(\d+)\s*cm/i,
    // Format avec unités séparées
    /l\.?\s*(\d+)\s*[x×]?\s*l\.?\s*(\d+)\s*[x×]?\s*h\.?\s*(\d+)\s*cm/i,
    // Format diamètre
    /ø\s*(\d+)\s*cm/i,
    // Format simple LxH
    /(\d+)\s*[x×]\s*(\d+)\s*cm/i
  ];
  
  for (const pattern of patterns) {
    const match = text.match(pattern);
    if (match) {
      if (match.length === 4) { // LxlxH
        return `L:${match[1]}cm x l:${match[2]}cm x H:${match[3]}cm`;
      } else if (match.length === 2) { // Diamètre
        return `Ø:${match[1]}cm`;
      } else if (match.length === 3) { // LxH
        return `L:${match[1]}cm x H:${match[2]}cm`;
      }
    }
  }
  
  return '';
}

function extractStorageCapacity(text: string): string {
  // Pour meubles à chaussures
  const shoesMatch = text.match(/(\d+)\s*paires?\s*(?:de\s*)?chaussures?/i);
  if (shoesMatch) return `${shoesMatch[1]} paires de chaussures`;
  
  // Pour bibliothèques
  const booksMatch = text.match(/(\d+)\s*livres?/i);
  if (booksMatch) return `${booksMatch[1]} livres`;
  
  // Pour tiroirs/étagères
  const drawersMatch = text.match(/(\d+)\s*tiroirs?/i);
  if (drawersMatch) return `${drawersMatch[1]} tiroirs`;
  
  const shelvesMatch = text.match(/(\d+)\s*étagères?/i);
  if (shelvesMatch) return `${shelvesMatch[1]} étagères`;
  
  return '';
}

function extractDensity(text: string): string {
  const densityMatch = text.match(/(\d+)\s*kg\/m[³3]/i);
  if (densityMatch) return `${densityMatch[1]}kg/m³`;
  return '';
}

function extractFirmness(text: string): string {
  const firmness = ['très ferme', 'ferme', 'medium', 'souple'];
  return firmness.find(f => text.includes(f)) || '';
}

function generateSEOTitle(product: any): string {
  const name = product.name || product.title || 'Produit';
  const brand = product.vendor || product.brand || '';
  const color = detectColorImproved(`${name} ${product.description || ''}`);
  
  let seoTitle = name;
  if (brand && !name.includes(brand)) {
    seoTitle += ` ${brand}`;
  }
  if (color && !name.toLowerCase().includes(color)) {
    seoTitle += ` ${color.charAt(0).toUpperCase() + color.slice(1)}`;
  }
  
  return seoTitle.substring(0, 70);
}

function generateSEODescription(product: any): string {
  const name = product.name || product.title || 'Produit';
  const material = detectMaterialImproved(`${name} ${product.description || ''}`);
  const color = detectColorImproved(`${name} ${product.description || ''}`);
  const style = detectStyle(`${name} ${product.description || ''}`);
  
  let description = name;
  if (material) description += ` en ${material}`;
  if (color) description += ` ${color}`;
  if (style) description += `. Style ${style}`;
  description += '. Livraison gratuite.';
  
  return description.substring(0, 155);
}

function generateAdHeadline(product: any): string {
  const name = product.name || product.title || 'Produit';
  // Extraire le nom principal sans dimensions
  const cleanName = name.replace(/\s*\([^)]*\)/g, '').trim();
  return cleanName.substring(0, 30);
}

function generateAdDescription(product: any): string {
  const name = product.name || product.title || 'Produit';
  const material = detectMaterialImproved(`${name} ${product.description || ''}`);
  const style = detectStyle(`${name} ${product.description || ''}`);
  
  let adDesc = name.split(' ').slice(0, 3).join(' '); // Premiers mots
  if (material) adDesc += ` ${material}`;
  if (style) adDesc += ` ${style}`;
  adDesc += '. Promo !';
  
  return adDesc.substring(0, 90);
}

function extractFabricFromMaterial(material: string): string {
  const fabrics = ['velours', 'tissu', 'cuir'];
  return fabrics.find(fabric => material.includes(fabric)) || '';
}

function generateImprovedTags(text: string, productName: string): string[] {
  const tags = new Set<string>();
  
  // Nettoyer le texte et extraire les mots
  const cleanText = text
    .toLowerCase()
    .replace(/[^\w\s]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
  
  const cleanProductName = productName.toLowerCase();
  
  // Mots vides à exclure
  const stopWords = [
    'le', 'la', 'les', 'un', 'une', 'des', 'du', 'de', 'et', 'ou', 'avec', 'sans', 'pour', 'par', 'sur', 'dans', 'à', 'au', 'aux',
    'ce', 'cette', 'ces', 'son', 'sa', 'ses', 'notre', 'nos', 'votre', 'vos', 'leur', 'leurs',
    'qui', 'que', 'dont', 'où', 'quand', 'comment', 'pourquoi',
    'très', 'plus', 'moins', 'bien', 'mal', 'tout', 'tous', 'toute', 'toutes',
    'est', 'sont', 'était', 'étaient', 'sera', 'seront', 'avoir', 'être',
    'cm', 'mm', 'm', 'kg', 'g', 'eur', 'euro', 'euros', 'dimensions', 'taille', 'couleur'
  ];
  
  // Extraire les mots significatifs
  const words = cleanText.split(' ')
    .filter(word => word.length > 2)
    .filter(word => !stopWords.includes(word))
    .filter(word => !/^\d+$/.test(word));
  
  // Mots-clés prioritaires mobilier
  const furnitureKeywords = [
    // Rangement
    'meuble', 'chaussures', 'rangement', 'monaco', 'compact', 'entrée', 'organisation',
    'bibliothèque', 'étagère', 'commode', 'armoire', 'dressing', 'console',
    // Canapés et sièges
    'canapé', 'ventu', 'alyana', 'aurea', 'inaya', 'convertible', 'angle', 'places', 'velours', 'tissu', 'cuir',
    // Tables
    'table', 'ronde', 'rectangulaire', 'basse', 'manger', 'travertin', 'marbre', 'bois', 'métal',
    // Chaises
    'chaise', 'fauteuil', 'bureau', 'ergonomique', 'pivotant',
    // Lits
    'lit', 'matelas', 'sommier', 'tête', 'rangement',
    // Styles
    'moderne', 'contemporain', 'scandinave', 'industriel', 'vintage', 'classique',
    // Pièces
    'salon', 'chambre', 'cuisine', 'bureau', 'salle',
    // Couleurs
    'blanc', 'noir', 'gris', 'beige', 'marron', 'bleu', 'vert', 'rouge',
    // Matériaux
    'mdf', 'contreplaqué', 'aggloméré', 'mélaminé',
    // Qualités
    'design', 'élégant', 'confort', 'qualité', 'premium', 'luxe'
  ];
  
  // Extraire les mots du nom du produit en priorité
  const productWords = cleanProductName.split(' ')
    .filter(word => word.length > 2)
    .filter(word => !stopWords.includes(word))
    .filter(word => !/^\d+$/.test(word));
  
  // Compter la fréquence et prioriser
  const wordCount = new Map<string, number>();
  words.forEach(word => {
    wordCount.set(word, (wordCount.get(word) || 0) + 1);
  });
  
  // Séparer mots prioritaires et réguliers
  const priorityTags: string[] = [];
  const regularTags: string[] = [];
  const productNameTags: string[] = [];
  
  // Ajouter les mots du nom du produit en priorité absolue
  productWords.forEach(word => {
    if (furnitureKeywords.includes(word)) {
      productNameTags.push(word);
    }
  });
  
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
  const finalTags = [
    ...productNameTags.slice(0, 2), 
    ...priorityTags.slice(0, 2), 
    ...regularTags.slice(0, 1)
  ]
    .slice(0, 5)
    .filter((tag, index, array) => array.indexOf(tag) === index);
  
  return finalTags.length > 0 ? finalTags : ['mobilier', 'design'];
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