const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
};

import { createClient } from 'npm:@supabase/supabase-js@2';

interface ProductEnrichmentRequest {
  products: any[]; // Products passed from client
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

    // Validate that products are provided
    if (!products || products.length === 0) {
      console.log('⚠️ [enrich-products-cron] Aucun produit fourni');
      return new Response(
        JSON.stringify({
          success: false,
          message: 'Aucun produit fourni pour enrichissement. Veuillez d\'abord importer votre catalogue.',
          stats: { products_processed: 0, enriched_products: 0 }
        }),
        {
          headers: { 'Content-Type': 'application/json', ...corsHeaders }
        }
      );
    }

    // Initialize Supabase
    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
    
    if (!supabaseUrl || !supabaseKey) {
      console.error('❌ [enrich-products-cron] Variables d\'environnement Supabase manquantes');
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
    
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Filter active products only
    const activeProducts = products.filter(product => 
      product.status === 'active' && 
      (product.stock > 0 || product.quantityAvailable > 0 || product.stock_qty > 0)
    );

    console.log(`📦 [enrich-products-cron] Produits actifs à enrichir: ${activeProducts.length}/${products.length}`);

    // 🧠 ÉTAPE 2: Enrichir chaque produit avec IA
    const enrichedProducts = [];
    let successCount = 0;
    let errorCount = 0;

    for (const product of activeProducts) {
      try {
        console.log(`🔄 [enrich-products-cron] Enrichissement: ${product.name?.substring(0, 30)}...`);
        
        // Extract attributes with AI
        const enrichedAttributes = await enrichProductWithAI(product, enable_image_analysis);
        
        // Create enriched product entry
        const enrichedProduct = {
          id: product.id || `enriched-${retailer_id}-${Date.now()}-${Math.random()}`,
          handle: product.handle || product.id || generateHandle(product.name || product.title),
          title: enrichedAttributes.general_info.title,
          description: product.description || '',
          
          // General info
          category: enrichedAttributes.general_info.product_type,
          subcategory: enrichedAttributes.general_info.subcategory,
          
          // Technical specs
          color: enrichedAttributes.technical_specs.color,
          material: enrichedAttributes.technical_specs.material,
          fabric: extractFabricFromMaterial(enrichedAttributes.technical_specs.material),
          style: enrichedAttributes.technical_specs.style,
          dimensions: enrichedAttributes.technical_specs.dimensions || '',
          room: enrichedAttributes.technical_specs.room,
          
          // Pricing and inventory
          price: parseFloat(product.price) || 0,
          stock_qty: parseInt(product.stock) || parseInt(product.quantityAvailable) || parseInt(product.stock_qty) || 0,
          
          // Media
          image_url: product.image_url || 'https://images.pexels.com/photos/1350789/pexels-photo-1350789.jpeg',
          product_url: product.product_url || '#',
          
          // SEO and marketing
          tags: enrichedAttributes.seo_marketing.tags,
          seo_title: enrichedAttributes.seo_marketing.seo_title,
          seo_description: enrichedAttributes.seo_marketing.seo_description,
          ad_headline: enrichedAttributes.seo_marketing.ad_headline,
          ad_description: enrichedAttributes.seo_marketing.ad_description,
          google_product_category: enrichedAttributes.seo_marketing.google_product_category,
          gtin: '',
          brand: enrichedAttributes.general_info.brand,
          
          // AI metadata
          confidence_score: enrichedAttributes.ai_confidence.overall,
          enriched_at: new Date().toISOString(),
          enrichment_source: enable_image_analysis ? 'text_and_image' : 'text_only',
          
          // Retailer isolation
          retailer_id: retailer_id || vendor_id,
          
          // Timestamps
          created_at: product.created_at || new Date().toISOString()
        };

        enrichedProducts.push(enrichedProduct);
        successCount++;

      } catch (error) {
        console.error(`❌ [enrich-products-cron] Erreur enrichissement ${product.name}:`, error);
        errorCount++;
      }

      // Pause between products to avoid rate limiting
      await new Promise(resolve => setTimeout(resolve, 200));
    }

    console.log(`✅ [enrich-products-cron] ${successCount}/${activeProducts.length} produits enrichis avec succès`);

    // 💾 ÉTAPE 3: Sauvegarder dans Supabase avec isolation retailer
    if (enrichedProducts.length > 0) {
      try {
        const { error: insertError } = await supabase
          .from('products_enriched')
          .upsert(enrichedProducts, { 
            onConflict: 'handle',
            ignoreDuplicates: false 
          });

        if (insertError) {
          console.warn('⚠️ [enrich-products-cron] Erreur Supabase (non bloquant):', insertError);
        } else {
          console.log('✅ [enrich-products-cron] Produits enrichis sauvegardés dans Supabase');
        }
      } catch (supabaseError) {
        console.warn('⚠️ [enrich-products-cron] Supabase non disponible (non bloquant):', supabaseError);
      }
    }

    // 📊 ÉTAPE 4: Mettre à jour les statistiques
    const stats = {
      products_processed: successCount,
      products_failed: errorCount,
      success_rate: successCount / (successCount + errorCount) * 100,
      execution_time: new Date().toISOString(),
      trigger_type: 'enrichment_cron',
      retailer_id: retailer_id || vendor_id,
      next_run: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString()
    };

    console.log('✅ [enrich-products-cron] ENRICHISSEMENT TERMINÉ:', stats);

    return new Response(
      JSON.stringify({
        success: true,
        message: `🤖 Enrichissement automatique terminé: ${successCount} produits enrichis`,
        stats,
        enriched_products: enrichedProducts.length,
        enriched_data: enrichedProducts // Return enriched data for client-side storage
      }),
      {
        headers: {
          'Content-Type': 'application/json',
          ...corsHeaders,
        },
      }
    );

  } catch (error) {
    console.error('❌ [enrich-products-cron] Erreur cron enrichissement:', error);
    
    return new Response(
      JSON.stringify({
        success: false,
        error: 'Erreur lors de l\'enrichissement automatique',
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

async function enrichProductWithAI(product: any, enableImageAnalysis: boolean): Promise<EnrichedAttributes> {
  const deepseekApiKey = Deno.env.get('DEEPSEEK_API_KEY');
  
  if (!deepseekApiKey) {
    console.log('⚠️ [enrich-products-cron] DeepSeek non configuré, enrichissement basique');
    return enrichProductBasic(product);
  }

  try {
    const productText = `
PRODUIT: ${product.name || product.title || ''}
DESCRIPTION: ${product.description || ''}
CATÉGORIE: ${product.category || product.productType || ''}
PRIX: ${product.price || 0}€
MARQUE: ${product.vendor || product.brand || ''}
TAGS: ${Array.isArray(product.tags) ? product.tags.join(', ') : product.tags || ''}
    `.trim();

    const prompt = `Analyse ce produit mobilier et enrichis-le COMPLÈTEMENT au format JSON strict :

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
        'Authorization': `Bearer ${deepseekApiKey}`,
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
          console.log('✅ [enrich-products-cron] Extraction DeepSeek réussie:', {
            product: (product.name || product.title)?.substring(0, 30),
            category: enriched.general_info?.product_type,
            subcategory: enriched.general_info?.subcategory,
            confidence: enriched.ai_confidence?.overall
          });
          
          // Apply image analysis if enabled and image available
          if (enableImageAnalysis && product.image_url) {
            try {
              const imageAttributes = await analyzeProductImage(product.image_url, enriched);
              if (imageAttributes) {
                // Merge image analysis results
                enriched.ai_confidence.color = Math.max(enriched.ai_confidence.color, imageAttributes.color_confidence || 0);
                enriched.ai_confidence.style = Math.max(enriched.ai_confidence.style, imageAttributes.style_confidence || 0);
                enriched.ai_confidence.material = Math.max(enriched.ai_confidence.material, imageAttributes.material_confidence || 0);
                
                // Update attributes if image analysis has higher confidence
                if (imageAttributes.color_confidence > enriched.ai_confidence.color) {
                  enriched.technical_specs.color = imageAttributes.detected_color || enriched.technical_specs.color;
                }
                if (imageAttributes.style_confidence > enriched.ai_confidence.style) {
                  enriched.technical_specs.style = imageAttributes.detected_style || enriched.technical_specs.style;
                }
                
                console.log('✅ [enrich-products-cron] Analyse image intégrée');
              }
            } catch (imageError) {
              console.warn('⚠️ [enrich-products-cron] Erreur analyse image (non bloquant):', imageError);
            }
          }
          
          return enriched;
        } catch (parseError) {
          console.log('⚠️ [enrich-products-cron] JSON invalide, enrichissement basique');
        }
      }
    }
  } catch (error) {
    console.log('⚠️ [enrich-products-cron] Erreur DeepSeek, enrichissement basique:', error);
  }

  return enrichProductBasic(product);
}

async function analyzeProductImage(imageUrl: string, textAttributes: EnrichedAttributes) {
  const openaiApiKey = Deno.env.get('OPENAI_API_KEY');
  
  if (!openaiApiKey) {
    console.log('⚠️ [enrich-products-cron] OpenAI non configuré pour analyse image');
    return null;
  }

  try {
    console.log('👁️ [enrich-products-cron] Analyse image avec OpenAI Vision...');

    const prompt = `Analyse cette image de produit mobilier et extrait les attributs visuels au format JSON :

Contexte du produit (depuis le texte) :
- Type: ${textAttributes.general_info.product_type}
- Couleur détectée: ${textAttributes.technical_specs.color}
- Matériau détecté: ${textAttributes.technical_specs.material}
- Style détecté: ${textAttributes.technical_specs.style}

Analyse l'image et extrait/corrige ces attributs vi suels :
{
  "detected_color": "couleur principale visible",
  "detected_material": "matériau principal visible",
  "detected_style": "style architectural/design visible",
  "visual_dimensions": "proportions approximatives",
  "color_confidence": 85,
  "material_confidence": 80,
  "style_confidence": 75,
  "additional_features": ["feature1", "feature2"]
}

Concentre-toi sur ce qui est VISUELLEMENT évident. Utilise les mêmes valeurs que le texte si cohérent.`;

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
            role: 'user',
            content: [
              {
                type: 'text',
                text: prompt
              },
              {
                type: 'image_url',
                image_url: {
                  url: imageUrl,
                  detail: 'low'
                }
              }
            ]
          }
        ],
        max_tokens: 300,
        temperature: 0.1
      }),
    });

    if (response.ok) {
      const data = await response.json();
      const content = data.choices[0]?.message?.content?.trim();
      
      if (content) {
        try {
          const imageAnalysis = JSON.parse(content);
          console.log('✅ [enrich-products-cron] Analyse image réussie');
          return imageAnalysis;
        } catch (parseError) {
          console.warn('⚠️ [enrich-products-cron] JSON image invalide');
        }
      }
    }
  } catch (error) {
    console.warn('⚠️ [enrich-products-cron] Erreur analyse image:', error);
  }

  return null;
}

function enrichProductBasic(product: any): EnrichedAttributes {
  const text = `${product.name || product.title || ''} ${product.description || ''}`.toLowerCase();
  
  // Basic attribute detection
  const category = detectCategory(text);
  const subcategory = detectSubcategory(product.name || product.title || '', product.description || '');
  const color = detectColor(text);
  const material = detectMaterial(text);
  const style = detectStyle(text);
  const room = detectRoom(text);
  const dimensions = extractDimensions(text);
  
  const brand = product.vendor || product.brand || 'Non spécifié';
  const title = generateSEOTitle(product.name || product.title || 'Produit', brand);
  
  return {
    general_info: {
      title,
      brand,
      product_type: category,
      subcategory: subcategory || category
    },
    technical_specs: {
      dimensions,
      material: material || 'Non spécifié',
      color: color || 'Non spécifié',
      style: style || 'Contemporain',
      room: room || 'Salon'
    },
    features: {
      convertible: text.includes('convertible'),
      storage: text.includes('rangement') || text.includes('coffre'),
      angle_reversible: text.includes('angle') && text.includes('réversible'),
      adjustable: text.includes('réglable') || text.includes('ajustable'),
      foldable: text.includes('pliable') || text.includes('pliant'),
      extendable: text.includes('extensible') || text.includes('rallonge')
    },
    seo_marketing: {
      seo_title: title.substring(0, 70),
      seo_description: `${title}. ${product.description || 'Produit de qualité pour votre intérieur.'}`.substring(0, 155),
      ad_headline: title.substring(0, 30),
      ad_description: `${category} ${color} ${style}`.substring(0, 90),
      tags: [category.toLowerCase(), color, style, material].filter(Boolean),
      google_product_category: getGoogleCategory(category)
    },
    ai_confidence: {
      overall: calculateBasicConfidence(product),
      color: color ? 70 : 30,
      style: style ? 60 : 40,
      dimensions: dimensions ? 80 : 20,
      material: material ? 65 : 35,
      category: 85
    }
  };
}

// Helper functions
function detectCategory(text: string): string {
  if (text.includes('canapé') || text.includes('sofa')) return 'Canapé';
  if (text.includes('table')) return 'Table';
  if (text.includes('chaise') || text.includes('fauteuil')) return 'Chaise';
  if (text.includes('lit')) return 'Lit';
  if (text.includes('armoire') || text.includes('commode')) return 'Rangement';
  if (text.includes('meuble tv')) return 'Meuble TV';
  if (text.includes('luminaire') || text.includes('lampe')) return 'Éclairage';
  if (text.includes('tapis') || text.includes('coussin')) return 'Décoration';
  return 'Mobilier';
}

function detectSubcategory(title: string, description: string): string {
  const text = `${title} ${description}`.toLowerCase();
  if (text.includes('angle')) return 'Canapé d\'angle';
  if (text.includes('convertible')) return 'Canapé convertible';
  if (text.includes('basse')) return 'Table basse';
  if (text.includes('manger') || text.includes('repas')) return 'Table à manger';
  if (text.includes('bureau')) return 'Chaise de bureau';
  if (text.includes('fauteuil')) return 'Fauteuil';
  if (text.includes('console')) return 'Console';
  if (text.includes('bibliothèque')) return 'Bibliothèque';
  return '';
}

function detectColor(text: string): string {
  const colors = ['blanc', 'noir', 'gris', 'beige', 'marron', 'bleu', 'vert', 'rouge', 'jaune', 'orange', 'rose', 'violet', 'naturel', 'chêne', 'noyer', 'taupe'];
  return colors.find(color => text.includes(color)) || '';
}

function detectMaterial(text: string): string {
  const materials = ['bois', 'métal', 'verre', 'tissu', 'cuir', 'velours', 'travertin', 'marbre', 'plastique', 'rotin', 'chenille'];
  return materials.find(material => text.includes(material)) || '';
}

function detectStyle(text: string): string {
  const styles = ['moderne', 'contemporain', 'scandinave', 'industriel', 'vintage', 'rustique', 'classique', 'minimaliste', 'bohème'];
  return styles.find(style => text.includes(style)) || '';
}

function detectRoom(text: string): string {
  const rooms = ['salon', 'chambre', 'cuisine', 'bureau', 'salle à manger', 'entrée', 'terrasse'];
  return rooms.find(room => text.includes(room)) || '';
}

function extractDimensions(text: string): string {
  const dimensionMatch = text.match(/(\d+)\s*[x×]\s*(\d+)(?:\s*[x×]\s*(\d+))?\s*cm/);
  if (dimensionMatch) {
    const [, length, width, height] = dimensionMatch;
    return height ? `L:${length}cm x l:${width}cm x H:${height}cm` : `L:${length}cm x l:${width}cm`;
  }
  return '';
}

function extractFabricFromMaterial(material: string): string {
  const fabrics = ['velours', 'chenille', 'lin', 'coton', 'cuir', 'tissu', 'polyester'];
  return fabrics.find(fabric => material.toLowerCase().includes(fabric)) || '';
}

function generateSEOTitle(name: string, brand: string): string {
  return `${name} - ${brand}`.substring(0, 70);
}

function getGoogleCategory(category: string): string {
  const categoryMap: { [key: string]: string } = {
    'Canapé': '635',
    'Table': '443', 
    'Chaise': '436',
    'Lit': '569',
    'Rangement': '6552',
    'Meuble TV': '6552',
    'Éclairage': '594',
    'Décoration': '696'
  };
  return categoryMap[category] || '696';
}

function calculateBasicConfidence(product: any): number {
  let score = 50;
  if (product.name && product.name.length > 10) score += 10;
  if (product.description && product.description.length > 50) score += 15;
  if (product.image_url) score += 10;
  if (product.price && product.price > 0) score += 10;
  if (product.vendor) score += 5;
  return Math.min(score, 95);
}

function generateHandle(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .substring(0, 50);
}