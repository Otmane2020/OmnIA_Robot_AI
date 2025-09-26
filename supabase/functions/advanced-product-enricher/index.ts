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
    // Enhanced product text analysis with ALL available data
    const productText = `
PRODUIT: ${product.name || product.title || ''}
DESCRIPTION: ${product.description || ''}
DESCRIPTION HTML: ${product.body_html || ''}
CATÉGORIE: ${product.category || product.productType || ''}
PRIX: ${product.price || 0}€
PRIX PROMOTIONNEL: ${product.compare_at_price || product.compareAtPrice || 'Aucun'}€
MARQUE: ${product.vendor || product.brand || ''}
TAGS: ${Array.isArray(product.tags) ? product.tags.join(', ') : product.tags || ''}
SKU: ${product.sku || product.variant_sku || ''}
STOCK: ${product.stock || product.quantityAvailable || product.stock_qty || 0}
URL: ${product.product_url || ''}
HANDLE: ${product.handle || ''}
VARIANTES: ${product.variants ? JSON.stringify(product.variants.slice(0, 3)) : 'Aucune'}
    `.trim();

    const prompt = `Tu es un expert en mobilier et design d'intérieur avec 20 ans d'expérience. Analyse ce produit mobilier COMPLÈTEMENT et enrichis-le avec MAXIMUM de détails au format JSON strict :

${productText}

ANALYSE APPROFONDIE REQUISE:
1. Examine CHAQUE mot du titre et description
2. Détecte TOUTES les nuances de couleurs, matériaux, styles
3. Extrait dimensions précises et spécifications techniques
4. Identifie TOUTES les fonctionnalités et caractéristiques
5. Analyse le prix et détecte les promotions
6. Génère SEO et marketing optimisés

Extrait TOUS ces attributs au format JSON exact avec MAXIMUM de précision :
{
  "general_info": {
    "title": "Titre optimisé et enrichi du produit avec détails clés",
    "brand": "Marque/Fabricant exact",
    "product_type": "Canapé|Table|Chaise|Lit|Rangement|Meuble TV|Décoration|Éclairage",
    "subcategory": "Description TRÈS précise avec TOUS les détails (ex: Canapé d'angle convertible 4 places velours côtelé avec coffre)",
    "product_line": "Nom de la gamme/collection si détectable",
    "model_name": "Nom du modèle spécifique si mentionné"
  },
  "technical_specs": {
    "dimensions": "Format EXACT: L:XXXcm x l:XXXcm x H:XXXcm ou Ø:XXXcm (extraire TOUTES les dimensions mentionnées)",
    "seat_height": "XXcm (hauteur d'assise si canapé/chaise)",
    "bed_surface": "XXX x XXX cm (surface couchage si convertible)",
    "structure": "Description COMPLÈTE structure/rembourrage/mécanisme",
    "weight": "Poids en kg si mentionné",
    "assembly_time": "Temps de montage si mentionné",
    "warranty": "Durée garantie si mentionnée",
    "material": "bois|métal|verre|tissu|cuir|velours|travertin|marbre|plastique|rotin",
    "material_details": "Détails précis du matériau (ex: chêne massif, acier inoxydable, velours côtelé)",
    "color": "blanc|noir|gris|beige|marron|bleu|vert|rouge|jaune|orange|rose|violet|naturel|chêne|noyer|taupe",
    "color_details": "Nuances précises de couleur (ex: gris anthracite, beige sable, bleu marine)",
    "finish": "Finition surface (mat|brillant|satiné|brossé|laqué|naturel)",
    "style": "moderne|contemporain|scandinave|industriel|vintage|rustique|classique|minimaliste|bohème",
    "design_details": "Détails design spécifiques (lignes, formes, inspirations)",
    "room": "salon|chambre|cuisine|bureau|salle à manger|entrée|terrasse",
    "capacity": "X personnes/places/tiroirs/étagères (TOUT ce qui est quantifiable)",
    "comfort_level": "Niveau de confort si évaluable (ferme|moyen|moelleux)",
    "maintenance": "Instructions d'entretien si mentionnées"
  },
  "pricing_analysis": {
    "current_price": ${product.price || 0},
    "original_price": ${product.compare_at_price || product.compareAtPrice || 'null'},
    "has_promotion": ${!!(product.compare_at_price || product.compareAtPrice)},
    "discount_percentage": "Calcul du pourcentage de remise si promotion",
    "price_positioning": "entrée de gamme|milieu de gamme|haut de gamme",
    "value_proposition": "Argument de valeur principal pour le client"
  },
  "features": {
    "convertible": true/false,
    "storage": true/false,
    "angle_reversible": true/false,
    "adjustable": true/false,
    "foldable": true/false,
    "extendable": true/false,
    "removable_covers": true/false,
    "wheels": true/false,
    "stackable": true/false,
    "modular": true/false,
    "eco_friendly": true/false
  },
  "seo_marketing": {
    "seo_title": "Titre SEO OPTIMISÉ avec mots-clés principaux ≤70 caractères",
    "seo_description": "Meta description VENDEUSE avec bénéfices client ≤155 caractères",
    "ad_headline": "Titre publicitaire ACCROCHEUR ≤30 caractères",
    "ad_description": "Description pub PERSUASIVE avec promotion si applicable ≤90 caractères",
    "tags": ["5-8 tags SEO optimisés"],
    "google_product_category": "ID Google Shopping précis (635=Canapés, 443=Tables, 436=Chaises, 569=Lits)",
    "selling_points": ["3-5 arguments de vente principaux"],
    "target_keywords": ["Mots-clés de recherche principaux"]
  },
  "ai_confidence": {
    "overall": "Score global 0-100",
    "color": "Confiance couleur 0-100",
    "style": "Confiance style 0-100", 
    "dimensions": "Confiance dimensions 0-100",
    "material": "Confiance matériau 0-100",
    "category": "Confiance catégorie 0-100",
    "pricing": "Confiance analyse prix 0-100",
    "features": "Confiance fonctionnalités 0-100"
  }
}

RÈGLES STRICTES POUR MAXIMUM D'EXACTITUDE:
- Utilise UNIQUEMENT les valeurs listées pour material, color, style, room, product_type
- dimensions: Format EXACT avec unités (L:200cm x l:100cm x H:75cm) - extraire TOUTES les dimensions
- subcategory: Description COMPLÈTE avec TOUS les détails techniques
- material_details: Spécifier le type exact (ex: "chêne massif européen", "velours côtelé italien")
- color_details: Nuances précises (ex: "gris anthracite mat", "beige sable naturel")
- seo_title: Inclure marque + modèle + matériau + couleur + bénéfice
- seo_description: USP + matériaux + dimensions + livraison + promo si applicable
- selling_points: Arguments de vente CONCRETS et PERSUASIFS
- tags: 5-8 mots-clés SEO OPTIMISÉS pour recherche client
- ai_confidence: Scores RÉALISTES 0-100 pour chaque attribut
- pricing_analysis: ANALYSER si promotion et calculer % remise
- value_proposition: Argument principal pour convaincre le client

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
            content: 'Tu es un expert en mobilier et design d\'intérieur avec 20 ans d\'expérience. Tu analyses CHAQUE détail des produits avec une précision maximale. Tu enrichis COMPLÈTEMENT les produits au format JSON strict avec TOUS les attributs demandés. Sois TRÈS précis et détaillé. Aucun texte supplémentaire.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        max_tokens: 1200,
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
            has_promotion: enriched.pricing_analysis?.has_promotion,
            discount: enriched.pricing_analysis?.discount_percentage,
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

    const prompt = `Tu es un expert en mobilier avec 20 ans d'expérience. Analyse cette image de produit mobilier avec une PRÉCISION MAXIMALE et extrait TOUS les attributs visuels détectables au format JSON :

Contexte du produit (depuis le texte) :
- Type: ${textAttributes.general_info.product_type}
- Couleur détectée: ${textAttributes.technical_specs.color}
- Matériau détecté: ${textAttributes.technical_specs.material}
- Style détecté: ${textAttributes.technical_specs.style}
- Prix: ${textAttributes.pricing_analysis?.current_price || 0}€
- Promotion: ${textAttributes.pricing_analysis?.has_promotion ? 'Oui' : 'Non'}

ANALYSE VISUELLE APPROFONDIE - Extrait/corrige ces attributs visuels avec MAXIMUM de détails :
{
  "visual_attributes": {
    "dominant_colors": ["couleur principale", "couleur secondaire", "couleur accent"],
    "color_nuances": ["Nuances précises: gris anthracite, beige sable, etc."],
    "materials_visible": ["TOUS les matériaux visibles dans l'image"],
    "material_details": ["Détails matériaux: grain du bois, texture tissu, finition métal"],
    "style_visual": "Style EXACT visible: moderne|contemporain|scandinave|industriel|vintage|rustique|classique",
    "design_elements": ["Éléments design spécifiques: pieds, accoudoirs, dossier, etc."],
    "shape": "Forme précise: rond|carré|rectangulaire|ovale|angle|asymétrique",
    "texture": "Texture visible: lisse|rugueux|brillant|mat|texturé|grainé|satiné",
    "finish": "Finition surface: naturel|laqué|brossé|patiné|vieilli|huilé|ciré",
    "hardware_visible": ["Quincaillerie visible: poignées, charnières, pieds, etc."],
    "proportions": "Proportions visuelles: élancé|trapu|équilibré|massif",
    "lighting_context": "Éclairage de la photo: naturel|artificiel|studio",
    "background_context": "Contexte arrière-plan pour comprendre l'usage"
  },
  "dimensions_estimate": {
    "relative_size": "Taille relative: petit|moyen|grand|très grand",
    "proportions": "Proportions: compact|standard|généreux|sur-mesure",
    "scale_indicators": ["Éléments donnant l'échelle dans l'image"],
    "estimated_dimensions": "Estimation dimensions si pas dans texte"
  },
  "quality_indicators": {
    "build_quality": "Qualité construction: entrée de gamme|standard|premium|luxe",
    "design_complexity": "Complexité design: simple|élaboré|sophistiqué|avant-gardiste",
    "craftsmanship": "Qualité artisanale visible: industriel|artisanal|haute couture",
    "innovation_level": "Niveau innovation: classique|moderne|innovant|révolutionnaire"
  },
  "usage_context": {
    "target_audience": "Cible: jeunes|familles|seniors|professionnels",
    "lifestyle_fit": "Style de vie: urbain|familial|minimaliste|luxueux",
    "room_integration": "Intégration pièce: central|d'appoint|multifonction"
  },
  "confidence_scores": {
    "color_accuracy": "0-100 confiance couleur",
    "material_accuracy": "0-100 confiance matériau", 
    "style_accuracy": "0-100 confiance style",
    "dimensions_accuracy": "0-100 confiance dimensions",
    "quality_accuracy": "0-100 confiance qualité",
    "overall_visual_confidence": "0-100 confiance globale analyse visuelle"
  }
}

INSTRUCTIONS CRITIQUES:
- Examine CHAQUE pixel de l'image avec attention d'expert
- Corrige les attributs texte si l'image montre quelque chose de différent
- Sois TRÈS précis sur les couleurs (nuances exactes)
- Identifie TOUS les matériaux visibles
- Analyse la qualité de construction visible
- Estime les dimensions si possible
- Détecte TOUTES les fonctionnalités visibles

RÉPONSE JSON UNIQUEMENT:`;

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
            content: 'Tu es un expert en analyse visuelle de mobilier avec 20 ans d\'expérience. Tu examines chaque détail avec une précision d\'expert. Tu extrais TOUS les attributs visuels détectables au format JSON avec maximum de précision. Aucun texte supplémentaire.'
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
                image_url: { url: imageUrl, detail: 'high' }
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
          const imageAnalysis = JSON.parse(content);
          console.log('✅ [advanced-enricher] Analyse image réussie:', {
            colors: imageAnalysis.visual_attributes?.dominant_colors?.length || 0,
            materials: imageAnalysis.visual_attributes?.materials_visible?.length || 0,
            confidence: imageAnalysis.confidence_scores?.overall_visual_confidence || 0
          });
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

  // Enhanced merging with priority to visual accuracy
  const merged = { ...textAttributes };
  
  // Update color with visual analysis (prioritize if high confidence)
  if (imageAttributes.visual_attributes?.dominant_colors?.length > 0) {
    const visualConfidence = imageAttributes.confidence_scores?.color_accuracy || 0;
    const textConfidence = merged.ai_confidence?.color || 0;
    
    if (visualConfidence > textConfidence || visualConfidence > 85) {
      merged.technical_specs.color = imageAttributes.visual_attributes.dominant_colors[0];
      merged.technical_specs.color_details = imageAttributes.visual_attributes.color_nuances?.[0] || merged.technical_specs.color_details;
      merged.ai_confidence.color = Math.max(visualConfidence, textConfidence);
    }
  }
  
  // Update material with visual analysis
  if (imageAttributes.visual_attributes?.materials_visible?.length > 0) {
    const visualConfidence = imageAttributes.confidence_scores?.material_accuracy || 0;
    const textConfidence = merged.ai_confidence?.material || 0;
    
    if (visualConfidence > textConfidence || visualConfidence > 85) {
      merged.technical_specs.material = imageAttributes.visual_attributes.materials_visible[0];
      merged.technical_specs.material_details = imageAttributes.visual_attributes.material_details?.[0] || merged.technical_specs.material_details;
      merged.ai_confidence.material = Math.max(visualConfidence, textConfidence);
    }
  }
  
  // Update style with visual analysis
  if (imageAttributes.visual_attributes?.style_visual) {
    const visualConfidence = imageAttributes.confidence_scores?.style_accuracy || 0;
    const textConfidence = merged.ai_confidence?.style || 0;
    
    if (visualConfidence > textConfidence || visualConfidence > 85) {
      merged.technical_specs.style = imageAttributes.visual_attributes.style_visual;
      merged.technical_specs.design_details = imageAttributes.visual_attributes.design_elements?.join(', ') || merged.technical_specs.design_details;
      merged.ai_confidence.style = Math.max(visualConfidence, textConfidence);
    }
  }
  
  // Add visual-only attributes
  if (imageAttributes.visual_attributes?.finish) {
    merged.technical_specs.color = imageAttributes.visual_attributes.dominant_colors[0];
    merged.ai_confidence.color = imageAttributes.confidence_scores.color_accuracy;
    merged.technical_specs.finish = imageAttributes.visual_attributes.finish;
  }
  
  // Add quality indicators from visual analysis
  if (imageAttributes.quality_indicators?.build_quality) {
    merged.pricing_analysis = merged.pricing_analysis || {};
    merged.pricing_analysis.price_positioning = imageAttributes.quality_indicators.build_quality;
  }
  
  // Add usage context
  if (imageAttributes.usage_context) {
    merged.seo_marketing.target_keywords = [
      ...(merged.seo_marketing.target_keywords || []),
      ...(imageAttributes.usage_context.target_audience ? [imageAttributes.usage_context.target_audience] : []),
      ...(imageAttributes.usage_context.lifestyle_fit ? [imageAttributes.usage_context.lifestyle_fit] : [])
    ];
  }
  
  // Enhanced overall confidence calculation
  const confidenceValues = Object.values(merged.ai_confidence).filter(v => typeof v === 'number' && v > 0);
  merged.ai_confidence.overall = Math.round(
    confidenceValues.length > 0 ? confidenceValues.reduce((sum, val) => sum + val, 0) / confidenceValues.length : 50
  );
  
  // Add visual confidence bonus
  if (imageAttributes.confidence_scores?.overall_visual_confidence > 80) {
    merged.ai_confidence.overall = Math.min(merged.ai_confidence.overall + 10, 100);
  }
  
  return merged;
}

function extractBasicAttributes(product: any): EnrichedAttributes {
  const text = `${product.name || product.title || ''} ${product.description || ''} ${product.category || product.productType || ''}`.toLowerCase();
  
  // Enhanced promotion detection
  const currentPrice = parseFloat(product.price) || 0;
  const originalPrice = parseFloat(product.compare_at_price || product.compareAtPrice) || 0;
  const hasPromotion = originalPrice > currentPrice && originalPrice > 0;
  const discountPercentage = hasPromotion ? Math.round(((originalPrice - currentPrice) / originalPrice) * 100) : 0;
  
  // Detect category and subcategory
  let productType = 'Mobilier';
  let subcategory = '';
  
  // Enhanced category detection with priority for specific types
  if (text.includes('lit') || text.includes('bed') || text.includes('sommier')) {
    productType = 'Lit';
    const features = [];
    if (text.includes('métal') || text.includes('acier')) features.push('en métal');
    if (text.includes('sommier')) features.push('avec sommier');
    if (text.includes('90x190') || text.includes('140x190') || text.includes('160x200')) features.push('multi-tailles');
    if (text.includes('noir') && text.includes('blanc')) features.push('noir/blanc');
    if (text.includes('minimaliste')) features.push('design minimaliste');
    
    subcategory = features.length > 0 ? `Lit ${features.join(' ')}` : 'Lit en métal';
  } else if (text.includes('canapé') || text.includes('sofa')) {
    productType = 'Canapé';
    // Enhanced subcategory detection
    const features = [];
    if (text.includes('angle')) features.push('d\'angle');
    if (text.includes('convertible')) features.push('convertible');
    if (text.includes('réversible')) features.push('réversible');
    if (text.includes('places')) {
      const placesMatch = text.match(/(\d+)\s*places?/);
      if (placesMatch) features.push(`${placesMatch[1]} places`);
    }
    if (text.includes('velours')) features.push('velours');
    if (text.includes('côtelé')) features.push('côtelé');
    if (text.includes('coffre')) features.push('avec coffre');
    
    subcategory = features.length > 0 ? `Canapé ${features.join(' ')}` : 'Canapé fixe';
  } else if (text.includes('table')) {
    productType = 'Table';
    const tableFeatures = [];
    if (text.includes('basse')) tableFeatures.push('basse');
    if (text.includes('manger') || text.includes('repas')) tableFeatures.push('à manger');
    if (text.includes('bureau')) tableFeatures.push('de bureau');
    if (text.includes('ronde')) tableFeatures.push('ronde');
    if (text.includes('rectangulaire')) tableFeatures.push('rectangulaire');
    if (text.includes('extensible')) tableFeatures.push('extensible');
    if (text.includes('travertin')) tableFeatures.push('travertin');
    if (text.includes('marbre')) tableFeatures.push('marbre');
    
    subcategory = tableFeatures.length > 0 ? `Table ${tableFeatures.join(' ')}` : 'Table';
  } else if (text.includes('chaise') || text.includes('fauteuil')) {
    productType = 'Chaise';
    const chairFeatures = [];
    if (text.includes('bureau')) chairFeatures.push('de bureau');
    if (text.includes('fauteuil')) chairFeatures.push('fauteuil');
    if (text.includes('bar')) chairFeatures.push('de bar');
    if (text.includes('chenille')) chairFeatures.push('chenille');
    if (text.includes('métal')) chairFeatures.push('métal');
    if (text.includes('pivotant')) chairFeatures.push('pivotant');
    if (text.includes('réglable')) chairFeatures.push('réglable');
    
    subcategory = chairFeatures.length > 0 ? `Chaise ${chairFeatures.join(' ')}` : 'Chaise';
  }

  // Enhanced attribute detection with more precision
  const colorPatterns = [
    { name: 'blanc', patterns: ['blanc', 'white', 'ivoire', 'crème', 'écru'] },
    { name: 'noir', patterns: ['noir', 'black', 'anthracite', 'charbon'] },
    { name: 'gris', patterns: ['gris', 'grey', 'gray', 'argent', 'platine'] },
    { name: 'beige', patterns: ['beige', 'sable', 'lin', 'naturel', 'nude'] },
    { name: 'marron', patterns: ['marron', 'brown', 'chocolat', 'moka', 'cognac', 'caramel'] },
    { name: 'bleu', patterns: ['bleu', 'blue', 'marine', 'navy', 'cobalt', 'turquoise'] },
    { name: 'vert', patterns: ['vert', 'green', 'olive', 'sauge', 'émeraude'] },
    { name: 'rouge', patterns: ['rouge', 'red', 'bordeaux', 'cerise', 'carmin'] },
    { name: 'chêne', patterns: ['chêne', 'oak', 'chêne clair', 'chêne foncé'] },
    { name: 'noyer', patterns: ['noyer', 'walnut'] },
    { name: 'taupe', patterns: ['taupe', 'greige'] }
  ];

  const materialPatterns = [
    { name: 'acier', patterns: ['acier', 'steel', 'métal', 'metal'] },
    { name: 'bois', patterns: ['bois', 'wood', 'massif'] },
    { name: 'chêne', patterns: ['chêne', 'oak'] },
    { name: 'métal', patterns: ['métal', 'metal', 'fer'] },
    { name: 'verre', patterns: ['verre', 'glass', 'cristal'] },
    { name: 'tissu', patterns: ['tissu', 'fabric', 'textile'] },
    { name: 'cuir', patterns: ['cuir', 'leather'] },
    { name: 'velours', patterns: ['velours', 'velvet', 'côtelé'] },
    { name: 'travertin', patterns: ['travertin', 'travertine'] },
    { name: 'marbre', patterns: ['marbre', 'marble'] },
    { name: 'chenille', patterns: ['chenille'] }
  ];

  const stylePatterns = [
    { name: 'moderne', patterns: ['moderne', 'modern', 'contemporain'] },
    { name: 'minimaliste', patterns: ['minimaliste', 'minimal', 'épuré', 'simple'] },
    { name: 'scandinave', patterns: ['scandinave', 'scandinavian', 'nordique'] },
    { name: 'industriel', patterns: ['industriel', 'industrial', 'loft'] },
    { name: 'vintage', patterns: ['vintage', 'rétro', 'ancien'] },
    { name: 'classique', patterns: ['classique', 'classic', 'traditionnel'] },
    { name: 'contemporain', patterns: ['contemporain', 'contemporary'] }
  ];

  const detectedColor = colorPatterns.find(cp => cp.patterns.some(p => text.includes(p)))?.name || '';
  const detectedMaterial = materialPatterns.find(mp => mp.patterns.some(p => text.includes(p)))?.name || '';
  const detectedStyle = stylePatterns.find(sp => sp.patterns.some(p => text.includes(p)))?.name || '';
  
  // Enhanced room detection with priority for beds
  const rooms = productType === 'Lit' ? ['chambre'] : ['salon', 'chambre', 'cuisine', 'bureau', 'salle à manger', 'entrée'];
  const detectedRoom = rooms.find(room => text.includes(room)) || '';

  // Extract dimensions
  let dimensions = '';
  
  // Bed dimension patterns (90x190, 140x190, 160x200)
  const bedDimensionMatch = text.match(/(\d+)x(\d+)\s*cm/g);
  if (bedDimensionMatch && productType === 'Lit') {
    dimensions = bedDimensionMatch.join(', ');
  } else {
    // Standard dimension patterns
    const dimensionMatch = text.match(/(\d+)\s*[x×]\s*(\d+)(?:\s*[x×]\s*(\d+))?\s*cm/);
    dimensions = dimensionMatch ? 
      (dimensionMatch[3] ? `L:${dimensionMatch[1]}cm x l:${dimensionMatch[2]}cm x H:${dimensionMatch[3]}cm` : 
       `L:${dimensionMatch[1]}cm x l:${dimensionMatch[2]}cm`) : '';
  }

  // Enhanced feature detection
  const features = {
    convertible: text.includes('convertible'),
    storage: text.includes('rangement') || text.includes('coffre') || text.includes('tiroir'),
    angle_reversible: text.includes('réversible') || text.includes('angle'),
    adjustable: text.includes('réglable') || text.includes('ajustable'),
    foldable: text.includes('pliable') || text.includes('pliant'),
    extendable: text.includes('extensible') || text.includes('rallonge'),
    removable_covers: text.includes('déhoussable') || text.includes('housse'),
    wheels: text.includes('roulettes') || text.includes('roulant'),
    stackable: text.includes('empilable'),
    modular: text.includes('modulaire') || text.includes('modulable'),
    eco_friendly: text.includes('écologique') || text.includes('durable') || text.includes('fsc'),
    assembly_required: text.includes('monter') || text.includes('assemblage') || text.includes('montage'),
    integrated_base: text.includes('sommier') || text.includes('base intégrée'),
    metal_frame: text.includes('structure') && (text.includes('métal') || text.includes('acier'))
  };

  // Generate SEO content
  const productName = product.name || product.title || 'Produit';
  const brand = product.vendor || product.brand || 'Decora Home';
  
  // Enhanced SEO generation
  const colorDetail = detectedColor ? ` ${detectedColor}` : '';
  const materialDetail = detectedMaterial ? ` en ${detectedMaterial}` : '';
  const promotionText = hasPromotion ? ` -${discountPercentage}%` : '';
  
  const sellingPoints = [
    hasPromotion ? `Promotion -${discountPercentage}%` : null,
    detectedMaterial ? `Matériau ${detectedMaterial}` : null,
    detectedColor ? `Couleur ${detectedColor}` : null,
    features.convertible ? 'Convertible' : null,
    features.storage ? 'Avec rangement' : null,
    features.assembly_required ? 'Montage facile' : null,
    features.integrated_base ? 'Sommier intégré' : null,
    features.metal_frame ? 'Structure robuste' : null,
    'Livraison gratuite',
    'Garantie qualité'
  ].filter(Boolean);
  
  return {
    general_info: {
      title: `${productName}${colorDetail}${materialDetail}`,
      brand: brand,
      product_type: productType,
      subcategory: subcategory,
      product_line: extractProductLine(productName),
      model_name: extractModelName(productName)
    },
    technical_specs: {
      dimensions: dimensions,
      material_details: `${detectedMaterial}${materialDetail}`,
      color_details: `${detectedColor}${colorDetail}`,
      design_details: `Style ${detectedStyle || 'contemporain'}`,
      material: detectedMaterial,
      color: detectedColor,
      style: detectedStyle,
      room: detectedRoom,
      weight: extractWeight(text),
      assembly_time: extractAssemblyTime(text),
      warranty: extractWarranty(text),
      comfort_level: extractComfortLevel(text),
      maintenance: extractMaintenance(text)
    },
    pricing_analysis: {
      current_price: currentPrice,
      original_price: originalPrice > 0 ? originalPrice : null,
      has_promotion: hasPromotion,
      discount_percentage: hasPromotion ? `${discountPercentage}%` : null,
      price_positioning: currentPrice < 200 ? 'entrée de gamme' : currentPrice > 800 ? 'haut de gamme' : 'milieu de gamme',
      value_proposition: hasPromotion ? `Économisez ${discountPercentage}% !` : 'Excellent rapport qualité-prix'
    },
    features: features,
    seo_marketing: {
      seo_title: `${productName}${colorDetail}${materialDetail}${promotionText} - ${brand}`.substring(0, 70),
      seo_description: `${productName}${materialDetail}${colorDetail}. ${detectedStyle ? 'Style ' + detectedStyle + '. ' : ''}${hasPromotion ? `PROMO -${discountPercentage}% ! ` : ''}Livraison gratuite. ${brand}.`.substring(0, 155),
      ad_headline: `${productName}${promotionText}`.substring(0, 30),
      ad_description: `${productName}${materialDetail}${colorDetail}. ${hasPromotion ? `PROMO -${discountPercentage}% !` : 'Qualité premium !'}`.substring(0, 90),
      tags: [
        productType.toLowerCase(),
        detectedColor,
        detectedMaterial,
        detectedStyle,
        detectedRoom,
        hasPromotion ? 'promotion' : null,
        hasPromotion ? 'promo' : null,
        productType === 'Lit' ? 'chambre' : null,
        features.assembly_required ? 'montage' : null,
        'livraison gratuite'
      ].filter(Boolean),
      google_product_category: getGoogleCategory(productType),
      selling_points: sellingPoints,
      target_keywords: [
        productType.toLowerCase(),
        detectedColor,
        detectedMaterial,
        detectedStyle,
        detectedRoom,
        brand.toLowerCase()
      ].filter(Boolean)
    },
    ai_confidence: {
      overall: Math.min(85, 50 + (detectedColor ? 10 : 0) + (detectedMaterial ? 15 : 0) + (dimensions ? 15 : 0) + (detectedStyle ? 5 : 0)),
      color: detectedColor ? 90 : 30,
      style: detectedStyle ? 85 : 30,
      dimensions: dimensions ? 95 : 20,
      material: detectedMaterial ? 90 : 30,
      category: productType !== 'Mobilier' ? 95 : 60,
      pricing: hasPromotion ? 95 : 80,
      features: Object.values(features).some(Boolean) ? 85 : 40
    }
  };
}

// Helper functions for enhanced extraction
function extractProductLine(productName: string): string {
  const linePatterns = ['ALYANA', 'AUREA', 'INAYA', 'VENTU'];
  return linePatterns.find(line => productName.toUpperCase().includes(line)) || '';
}

function extractModelName(productName: string): string {
  const modelMatch = productName.match(/([A-Z]{3,})/);
  return modelMatch ? modelMatch[1] : '';
}

function extractWeight(text: string): string {
  const weightMatch = text.match(/(\d+(?:[.,]\d+)?)\s*kg/);
  return weightMatch ? `${weightMatch[1]} kg` : '';
}

function extractAssemblyTime(text: string): string {
  const timeMatch = text.match(/(?:montage|assemblage)\s*:?\s*(\d+)\s*(?:min|h)/);
  return timeMatch ? `${timeMatch[1]} ${timeMatch[0].includes('h') ? 'h' : 'min'}` : '';
}

function extractWarranty(text: string): string {
  const warrantyMatch = text.match(/(?:garantie|warranty)\s*:?\s*(\d+)\s*(ans?|mois)/);
  return warrantyMatch ? `${warrantyMatch[1]} ${warrantyMatch[2]}` : '';
}

function extractComfortLevel(text: string): string {
  if (text.includes('très confortable') || text.includes('moelleux')) return 'moelleux';
  if (text.includes('ferme')) return 'ferme';
  if (text.includes('confortable')) return 'moyen';
  return '';
}

function extractMaintenance(text: string): string {
  const maintenanceTerms = [];
  if (text.includes('déhoussable')) maintenanceTerms.push('déhoussable');
  if (text.includes('lavable')) maintenanceTerms.push('lavable');
  if (text.includes('nettoyage à sec')) maintenanceTerms.push('nettoyage à sec');
  return maintenanceTerms.join(', ');
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
        training_type: `enrichment_${metadata.source}`,
        model_version: '2.1-advanced',
        updated_at: metadata.execution_time
      }, { onConflict: 'id' });

    console.log('✅ [advanced-enricher] Métadonnées mises à jour');
  } catch (error) {
    console.error('❌ [advanced-enricher] Erreur métadonnées:', error);
  }
}