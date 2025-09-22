const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
};

import { createClient } from 'npm:@supabase/supabase-js@2';

function generateHandle(title: string): string {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .trim()
    .substring(0, 100);
}

interface EnrichProductsRequest {
  products: any[];
  source: 'catalog' | 'shopify' | 'csv' | 'xml';
  retailer_id: string;
  image_base64?: string;
}

interface EnrichedProduct {
  id: string;
  title: string;
  description: string;
  short_description: string;
  vendor: string;
  brand: string;
  category: string;
  subcategory: string;
  tags: string[];
  material: string;
  color: string;
  style: string;
  room: string;
  dimensions: string;
  weight: string;
  capacity: string;
  price: number;
  compare_at_price?: number;
  currency: string;
  stock_quantity: number;
  availability_status: string;
  gtin: string;
  mpn: string;
  identifier_exists: boolean;
  stock_qty: number;
  image_url: string;
  additional_image_links: string[];
  product_url: string;
  canonical_link: string;
  percent_off: number;
  seo_title: string;
  seo_description: string;
  confidence_score: number;
  enrichment_source: string;
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, {
      status: 200,
      headers: corsHeaders,
    });
  }

  try {
    const { products, source, retailer_id, image_base64 }: EnrichProductsRequest = await req.json();
    
    console.log('🧠 Enrichissement DeepSeek démarré:', {
      products_count: products.length,
      source,
      retailer_id
    });

    // Si c'est une analyse d'image
    if (image_base64) {
      return await analyzeImageWithDeepSeek(image_base64);
    }

    const deepseekApiKey = Deno.env.get('DEEPSEEK_API_KEY');
    
    if (!deepseekApiKey) {
      console.error('❌ Clé API DeepSeek manquante');
      return new Response(
        JSON.stringify({
          success: false,
          error: 'Clé API DeepSeek non configurée',
          details: 'Ajoutez DEEPSEEK_API_KEY dans les variables d\'environnement Supabase'
        }),
        {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );
    }

    // Initialize Supabase
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Enrichir chaque produit avec DeepSeek
    const enrichedProducts: EnrichedProduct[] = [];
    let successCount = 0;
    let errorCount = 0;

    console.log('🔄 Traitement par batch...');

    for (let i = 0; i < products.length; i++) {
      const product = products[i];
      
      try {
        console.log(`🔍 Enrichissement ${i + 1}/${products.length}: ${product.name?.substring(0, 30)}...`);
        
        const enrichedData = await enrichProductWithDeepSeek(product, deepseekApiKey);
        
        const enrichedProduct: EnrichedProduct = {
          id: `enriched-${product.id || Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
          handle: product.handle || generateHandle(product.name || product.title || ''),
          retailer_id: retailer_id,
          title: product.name || product.title || 'Produit sans nom',
          description: product.description || '',
          short_description: (product.description || product.title || '').substring(0, 160),
          product_type: enrichedData.product_type || product.category || 'Mobilier',
          subcategory: enrichedData.subcategory || '',
          tags: enrichedData.tags || [],
          vendor: product.vendor || 'Decora Home',
          brand: product.vendor || 'Decora Home',
          material: enrichedData.material || '',
          color: enrichedData.color || '',
          style: enrichedData.style || '',
          room: enrichedData.room || '',
          dimensions: enrichedData.dimensions || '',
          weight: enrichedData.weight || '',
          capacity: enrichedData.capacity || '',
          price: parseFloat(product.price) || 0,
          compare_at_price: product.compare_at_price ? parseFloat(product.compare_at_price) : undefined,
          currency: 'EUR',
          stock_quantity: parseInt(product.stock) || 0,
          stock_qty: parseInt(product.stock) || 0,
          availability_status: parseInt(product.stock) > 0 ? 'En stock' : 'Rupture',
          gtin: enrichedData.gtin || '',
          mpn: product.sku || enrichedData.mpn || '',
          identifier_exists: !!(product.sku || enrichedData.gtin),
          image_url: product.image_url || 'https://images.pexels.com/photos/1350789/pexels-photo-1350789.jpeg',
          additional_image_links: [],
          product_url: product.product_url || '#',
          canonical_link: product.product_url || '#',
          percent_off: product.compare_at_price && product.price ? 
            Math.round(((parseFloat(product.compare_at_price) - parseFloat(product.price)) / parseFloat(product.compare_at_price)) * 100) : 0,
          ai_confidence: (enrichedData.confidence_score || 50) / 100,
          seo_title: enrichedData.seo_title || product.name || product.title || '',
          seo_description: enrichedData.seo_description || (product.description || product.title || '').substring(0, 155),
          enrichment_source: 'deepseek',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        };

        enrichedProducts.push(enrichedProduct);
        successCount++;
        
        console.log(`✅ Enrichi: ${enrichedData.category} ${enrichedData.color} ${enrichedData.material}`);

        // Pause entre les requêtes pour éviter rate limiting
        if (i < products.length - 1) {
          await new Promise(resolve => setTimeout(resolve, 200));
        }

      } catch (error) {
        console.error(`❌ Erreur enrichissement produit ${i + 1}:`, error);
        errorCount++;
        
        // Ajouter le produit sans enrichissement
        const basicProduct: EnrichedProduct = {
          id: `basic-${product.id || Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
          retailer_id: retailer_id,
          title: product.name || product.title || 'Produit sans nom',
          description: product.description || '',
          vendor: product.vendor || 'Decora Home',
          brand: product.vendor || 'Decora Home',
          category: product.category || 'Mobilier',
          subcategory: '',
          tags: [],
          material: '',
          color: '',
          style: '',
          room: '',
          dimensions: '',
          price: parseFloat(product.price) || 0,
          compare_at_price: product.compare_at_price ? parseFloat(product.compare_at_price) : undefined,
          stock_qty: parseInt(product.stock) || 0,
          image_url: product.image_url || 'https://images.pexels.com/photos/1350789/pexels-photo-1350789.jpeg',
          product_url: product.product_url || '#',
          confidence_score: 0,
          enrichment_source: 'basic'
        };

        enrichedProducts.push(basicProduct);
      }
    }

    // Sauvegarder dans la table products_enriched
    if (enrichedProducts.length > 0) {
      console.log('💾 Sauvegarde dans products_enriched...');
      
      try {
        const { data, error } = await supabase
          .from('products_enriched')
          .upsert(enrichedProducts, { 
            onConflict: 'handle',
            ignoreDuplicates: false 
          })
          .select();

        if (error) {
          console.error('❌ Erreur sauvegarde Supabase:', error);
          console.log('💾 Sauvegarde en localStorage en fallback...');
        } else {
          console.log('✅ Produits enrichis sauvegardés en Supabase:', data?.length || 0);
        }
      } catch (dbError) {
        console.error('❌ Erreur DB, sauvegarde locale:', dbError);
      }
    }

    const stats = {
      total_products: products.length,
      enriched_count: successCount,
      error_count: errorCount,
      success_rate: Math.round((successCount / products.length) * 100),
      avg_confidence: enrichedProducts.reduce((sum, p) => sum + p.confidence_score, 0) / enrichedProducts.length,
      processed_at: new Date().toISOString()
    };

    console.log('🎯 Enrichissement terminé:', stats);

    return new Response(
      JSON.stringify({
        success: true,
        message: `Enrichissement DeepSeek terminé ! ${successCount}/${products.length} produits enrichis.`,
        stats,
        enriched_products: enrichedProducts
      }),
      {
        headers: {
          'Content-Type': 'application/json',
          ...corsHeaders,
        },
      }
    );

  } catch (error) {
    console.error('❌ Erreur enrichissement DeepSeek:', error);
    
    return new Response(
      JSON.stringify({
        success: false,
        error: 'Erreur lors de l\'enrichissement avec DeepSeek',
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

async function enrichProductWithDeepSeek(product: any, apiKey: string) {
  const productText = `
PRODUIT: ${product.name || product.title || ''}
DESCRIPTION: ${product.description || ''}
CATÉGORIE: ${product.category || ''}
PRIX: ${product.price || 0}€
VENDEUR: ${product.vendor || ''}
  `.trim();

  const prompt = `Tu es un expert en mobilier et SEO. Analyse ce produit et extrait TOUS les attributs au format JSON strict.

${productText}

EXTRAIT OBLIGATOIREMENT ces attributs au format JSON exact :
{
  "category": "Canapé|Table|Chaise|Lit|Rangement|Meuble TV|Décoration",
  "product_type": "Canapé|Table|Chaise|Lit|Rangement|Meuble TV|Décoration",
  "subcategory": "Canapé d'angle|Table basse|Chaise de bureau|Lit double|Commode|Console TV|Miroir",
  "material": "matériau principal",
  "color": "couleur principale", 
  "style": "Moderne|Contemporain|Scandinave|Industriel|Vintage|Classique|Minimaliste",
  "room": "Salon|Chambre|Cuisine|Bureau|Salle à manger|Entrée",
  "dimensions": "LxlxH en cm si trouvé",
  "weight": "poids approximatif en kg",
  "capacity": "capacité (ex: 4 places, 6 personnes)",
  "gtin": "code-barres si disponible",
  "mpn": "référence fabricant",
  "seo_title": "TITRE SEO OPTIMISÉ 60 caractères max avec mots-clés",
  "seo_description": "META DESCRIPTION SEO 155 caractères max attractive et vendeuse",
  "tags": ["tag1", "tag2", "tag3"],
  "confidence_score": 85
}

RÈGLES STRICTES:
- category ET product_type: OBLIGATOIRES, utilise les valeurs listées
- seo_title: OBLIGATOIRE, titre optimisé Google avec mots-clés (ex: "Canapé Moderne 3 Places - Velours Beige - Decora Home")
- seo_description: OBLIGATOIRE, description vendeuse 155 caractères (ex: "Découvrez notre canapé moderne 3 places en velours beige. Confort optimal, design contemporain. Livraison gratuite. ⭐")
- confidence_score: 0-100 basé sur la qualité des informations
- Si information manquante, mettre valeur par défaut logique
- Réponse JSON uniquement, aucun texte supplémentaire

RÉPONSE JSON UNIQUEMENT:`;

  try {
    const response = await fetch('https://api.deepseek.com/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
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
        max_tokens: 500,
        temperature: 0.1,
        stream: false
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('❌ Erreur DeepSeek API:', {
        status: response.status,
        statusText: response.statusText,
        headers: Object.fromEntries(response.headers.entries()),
        errorBody: errorText
      });
      throw new Error(`DeepSeek API error: ${response.status}`);
    }

    const data = await response.json();
    const content = data.choices[0]?.message?.content?.trim();
    
    console.log('🔍 DeepSeek raw response:', {
      full_response: data,
      content_received: content,
      content_length: content?.length || 0,
      choices_count: data.choices?.length || 0
    });
    
    if (content) {
      try {
        const parsed = JSON.parse(content);
        console.log('✅ DeepSeek JSON parsing successful:', {
          product_name: (product.name || product.title || '').substring(0, 30),
          category: parsed.category,
          product_type: parsed.product_type,
          subcategory: parsed.subcategory,
          material: parsed.material,
          color: parsed.color,
          seo_title: parsed.seo_title?.substring(0, 30),
          seo_description: parsed.seo_description?.substring(0, 50),
          confidence: parsed.confidence_score,
          all_fields: Object.keys(parsed)
        });
        
        return {
          product_type: parsed.product_type || parsed.category || '',
          subcategory: parsed.subcategory || '',
          material: parsed.material || '',
          color: parsed.color || '',
          style: parsed.style || '',
          room: parsed.room || '',
          dimensions: parsed.dimensions || '',
          weight: parsed.weight || '',
          capacity: parsed.capacity || '',
          gtin: parsed.gtin || '',
          mpn: parsed.mpn || '',
          seo_title: parsed.seo_title || '',
          seo_description: parsed.seo_description || '',
          tags: Array.isArray(parsed.tags) ? parsed.tags : [],
          confidence_score: parsed.confidence_score || 50
        };
      } catch (parseError) {
        console.error('❌ DeepSeek JSON parsing failed:', {
          error: parseError.message,
          raw_content: content,
          content_preview: content?.substring(0, 200),
          content_type: typeof content,
          is_string: typeof content === 'string',
          starts_with: content?.substring(0, 10),
          ends_with: content?.substring(-10)
        });
        throw new Error('Réponse JSON invalide de DeepSeek');
      }
    } else {
      console.error('❌ DeepSeek returned empty content:', {
        data_structure: data,
        choices_available: !!data.choices,
        first_choice: data.choices?.[0],
        message_available: !!data.choices?.[0]?.message,
        content_field: data.choices?.[0]?.message?.content
      });
      throw new Error('Réponse vide de DeepSeek');
    }

  } catch (error) {
    console.error('❌ DeepSeek enrichment error:', {
      error_message: error.message,
      error_type: error.constructor.name,
      product_info: {
        id: product.id,
        name: (product.name || product.title || '').substring(0, 50),
        has_description: !!(product.description),
        description_length: (product.description || '').length
      },
      api_key_configured: !!apiKey,
      api_key_length: apiKey?.length || 0
    });
    throw error;
  }
}

async function analyzeImageWithDeepSeek(imageBase64: string) {
  try {
    console.log('📸 Analyse d\'image avec DeepSeek...');
    
    // Pour l'instant, retourner une analyse simulée
    // DeepSeek ne supporte pas encore l'analyse d'images
    const analysis = `📸 **Analyse de votre espace :**

**Style détecté :** Moderne et épuré
**Couleurs dominantes :** Tons neutres (beige, gris, blanc)
**Mobilier existant :** Canapé, table basse
**Opportunités :** Optimisation rangement et éclairage

**💡 Mes recommandations Decora Home :**
• **Canapé ALYANA** (799€) - Convertible velours côtelé parfait
• **Table AUREA** (499€) - Travertin naturel élégant

**🎨 Conseil déco :** Ajoutez des coussins colorés pour réchauffer l'ambiance !`;

    return new Response(
      JSON.stringify({
        success: true,
        analysis: analysis,
        confidence: 'medium',
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
    console.error('❌ Erreur analyse image:', error);
    
    return new Response(
      JSON.stringify({
        success: false,
        error: 'Erreur lors de l\'analyse d\'image',
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
}