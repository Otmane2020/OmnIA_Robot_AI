const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
};

import { createClient } from 'npm:@supabase/supabase-js@2';

interface ProductEnrichmentRequest {
  retailer_id?: string;
  force_full_enrichment?: boolean;
  source_filter?: string;
  vendor_id?: string;
}

interface EnrichedAttributes {
  category: string;
  subcategory: string;
  color: string;
  material: string;
  fabric: string;
  style: string;
  dimensions: string;
  room: string;
  tags: string[];
  seo_title: string;
  seo_description: string;
  ad_headline: string;
  ad_description: string;
  google_product_category: string;
  gtin: string;
  brand: string;
  confidence_score: number;
}

// Cron quotidien pour enrichir automatiquement les nouveaux produits
Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, {
      status: 200,
      headers: corsHeaders,
    });
  }

  try {
    const { retailer_id, force_full_enrichment = false, source_filter, vendor_id }: ProductEnrichmentRequest = await req.json();
    
    console.log('🤖 CRON ENRICHISSEMENT: Démarrage...');
    console.log('⏰ Heure d\'exécution:', new Date().toLocaleString('fr-FR'));
    console.log('🏪 Vendeur ID:', vendor_id || retailer_id);

    // Initialize Supabase
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // 🔍 ÉTAPE 1: Récupérer les produits depuis localStorage (isolation vendeur)
    const products = await getVendorProductsFromStorage(vendor_id || retailer_id || 'demo-retailer-id');
    
    console.log('📦 Produits vendeur trouvés:', products.length);
    
    if (products.length === 0) {
      return new Response(
        JSON.stringify({
          success: false,
          message: 'Aucun produit trouvé dans votre catalogue. Importez d\'abord vos produits via l\'onglet Intégration.',
          stats: { products_processed: 0 }
        }),
        {
          headers: { 'Content-Type': 'application/json', ...corsHeaders }
        }
      );
    }

    // 🧠 ÉTAPE 2: Enrichir chaque produit avec IA locale
    const enrichedProducts = [];
    let successCount = 0;
    let errorCount = 0;

    for (const product of products) {
      try {
        console.log(`🔄 Enrichissement: ${product.name?.substring(0, 30)}...`);
        
        const enrichedAttributes = await enrichProductWithAI(product);
        
        // Créer l'entrée enrichie
        const enrichedProduct = {
          id: product.id || `enriched-${Date.now()}-${Math.random()}`,
          handle: product.id || product.external_id || `handle-${Date.now()}`,
          title: product.name,
          description: product.description || '',
          category: enrichedAttributes.category,
          subcategory: enrichedAttributes.subcategory,
          color: enrichedAttributes.color,
          material: enrichedAttributes.material,
          fabric: enrichedAttributes.fabric,
          style: enrichedAttributes.style,
          dimensions: enrichedAttributes.dimensions,
          room: enrichedAttributes.room,
          tags: enrichedAttributes.tags,
          seo_title: enrichedAttributes.seo_title,
          seo_description: enrichedAttributes.seo_description,
          ad_headline: enrichedAttributes.ad_headline,
          ad_description: enrichedAttributes.ad_description,
          google_product_category: enrichedAttributes.google_product_category,
          gtin: enrichedAttributes.gtin,
          brand: enrichedAttributes.brand,
          price: product.price,
          stock_qty: product.stock,
          image_url: product.image_url,
          product_url: product.product_url,
          confidence_score: enrichedAttributes.confidence_score,
          enriched_at: new Date().toISOString(),
          enrichment_source: 'cron_auto',
          created_at: new Date().toISOString()
        };

        enrichedProducts.push(enrichedProduct);
        successCount++;

      } catch (error) {
        console.error(`❌ Erreur enrichissement ${product.name}:`, error);
        errorCount++;
      }

      // Pause entre produits pour éviter rate limiting
      await new Promise(resolve => setTimeout(resolve, 200));
    }

    // 💾 ÉTAPE 3: Sauvegarder dans localStorage vendeur
    if (enrichedProducts.length > 0) {
      // Sauvegarder dans localStorage spécifique au vendeur
      const enrichedKey = `vendor_${vendor_id || retailer_id}_enriched_products`;
      
      try {
        localStorage.setItem(enrichedKey, JSON.stringify(enrichedProducts));
        console.log('✅ Produits enrichis sauvegardés dans localStorage:', enrichedProducts.length);
      } catch (storageError) {
        console.error('❌ Erreur sauvegarde localStorage:', storageError);
        // Continue sans faire échouer le processus
      }

      // OPTIONNEL: Essayer aussi Supabase si configuré
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
          console.log('✅ Produits enrichis sauvegardés aussi dans Supabase');
        }
      } catch (supabaseError) {
        console.warn('⚠️ Supabase non disponible (non bloquant):', supabaseError);
      }
    }

    // 📊 ÉTAPE 4: Mettre à jour les statistiques
    const stats = {
      products_processed: successCount,
      products_failed: errorCount,
      success_rate: successCount / (successCount + errorCount) * 100,
      execution_time: new Date().toISOString(),
      trigger_type: 'enrichment_cron',
      vendor_id: vendor_id || retailer_id,
      next_run: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString()
    };

    console.log('✅ CRON ENRICHISSEMENT TERMINÉ:', stats);

    return new Response(
      JSON.stringify({
        success: true,
        message: `🤖 Enrichissement automatique terminé: ${successCount} produits enrichis`,
        stats,
        enriched_products: enrichedProducts.length
      }),
      {
        headers: {
          'Content-Type': 'application/json',
          ...corsHeaders,
        },
      }
    );

  } catch (error) {
    console.error('❌ Erreur cron enrichissement:', error);
    
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

// Fonction pour récupérer les produits depuis localStorage
async function getVendorProductsFromStorage(vendorId: string) {
  try {
    // Essayer plusieurs clés de stockage possibles
    const storageKeys = [
      `seller_${vendorId}_products`,
      `vendor_${vendorId}_products`,
      'catalog_products' // Fallback global
    ];
    
    for (const key of storageKeys) {
      try {
        const savedProducts = localStorage?.getItem(key);
        if (savedProducts) {
          const products = JSON.parse(savedProducts);
          const activeProducts = products.filter((p: any) => 
            p.status === 'active' && (p.stock > 0 || p.quantityAvailable > 0)
          );
          
          if (activeProducts.length > 0) {
            console.log(`✅ Produits trouvés dans ${key}:`, activeProducts.length);
            return activeProducts;
          }
        }
      } catch (error) {
        console.warn(`⚠️ Erreur lecture ${key}:`, error);
      }
    }
    
    console.log('⚠️ Aucun produit trouvé dans localStorage');
    return [];
    
  } catch (error) {
    console.error('❌ Erreur récupération produits localStorage:', error);
    return [];
  }
}

async function enrichProductWithAI(product: any): Promise<EnrichedAttributes> {
  const deepseekApiKey = Deno.env.get('DEEPSEEK_API_KEY');
  
  if (!deepseekApiKey) {
    console.log('⚠️ DeepSeek non configuré, enrichissement basique');
    return enrichProductBasic(product);
  }

  try {
    const productText = `
PRODUIT: ${product.name || product.title || ''}
DESCRIPTION: ${product.description || ''}
CATÉGORIE: ${product.category || ''}
PRIX: ${product.price || 0}€
    `.trim();

    const prompt = `Analyse ce produit mobilier et enrichis-le au format JSON strict :

${productText}

Enrichis COMPLÈTEMENT ce produit au format JSON :
{
  "category": "Canapé|Table|Chaise|Lit|Rangement|Meuble TV|Décoration|Éclairage",
  "subcategory": "Description précise (ex: Canapé d'angle convertible, Table basse en verre)",
  "color": "blanc|noir|gris|beige|marron|bleu|vert|rouge|jaune|orange|rose|violet|naturel|chêne|noyer|taupe",
  "material": "bois|métal|verre|tissu|cuir|velours|travertin|marbre|plastique|rotin|chenille",
  "fabric": "velours|chenille|lin|coton|cuir|tissu|polyester",
  "style": "moderne|contemporain|scandinave|industriel|vintage|rustique|classique|minimaliste|bohème",
  "dimensions": "LxlxH en cm",
  "room": "salon|chambre|cuisine|bureau|salle à manger|entrée|terrasse",
  "tags": ["mot-clé1", "mot-clé2", "fonctionnalité"],
  "seo_title": "Titre SEO optimisé ≤70 caractères",
  "seo_description": "Meta description SEO ≤155 caractères",
  "ad_headline": "Titre publicitaire ≤30 caractères",
  "ad_description": "Description pub ≤90 caractères",
  "google_product_category": "ID Google Shopping (635=Canapés, 443=Tables, 436=Chaises)",
  "gtin": "Code-barres si disponible",
  "brand": "Marque/Fabricant",
  "confidence_score": 85
}

RÈGLES STRICTES:
- category: Catégorie principale uniquement
- subcategory: Description précise du type de produit
- tags: 3-5 mots-clés pertinents
- seo_title: Optimisé pour le référencement, inclure marque
- seo_description: Inclure bénéfices, livraison, promo si applicable
- ad_headline: Accrocheur pour Google Ads
- ad_description: Inclure USP et promo
- google_product_category: Utiliser les codes Google Shopping officiels
- confidence_score: 0-100 basé sur la qualité des informations

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
            content: 'Tu es un expert en mobilier et design d\'intérieur. Tu enrichis les produits au format JSON strict. Aucun texte supplémentaire.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        max_tokens: 400,
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
          console.log('✅ Enrichissement IA réussi:', {
            product: (product.name || product.title)?.substring(0, 30),
            category: enriched.category,
            color: enriched.color,
            material: enriched.material,
            confidence: enriched.confidence_score
          });
          
          return {
            ...enriched,
            confidence_score: enriched.confidence_score || 50
          };
        } catch (parseError) {
          console.log('⚠️ JSON invalide, enrichissement basique');
        }
      }
    }
  } catch (error) {
    console.log('⚠️ Erreur DeepSeek, enrichissement basique');
  }

  return enrichProductBasic(product);
}

function enrichProductBasic(product: any): EnrichedAttributes {
  const text = `${product.name || product.title || ''} ${product.description || ''} ${product.category || product.productType || ''}`.toLowerCase();
  
  // Détecter catégorie
  let category = 'Mobilier';
  let subcategory = '';
  
  if (text.includes('canapé') || text.includes('sofa')) {
    category = 'Canapé';
    if (text.includes('angle')) subcategory = 'Canapé d\'angle';
    else if (text.includes('convertible')) subcategory = 'Canapé convertible';
    else subcategory = 'Canapé fixe';
  } else if (text.includes('table')) {
    category = 'Table';
    if (text.includes('basse')) subcategory = 'Table basse';
    else if (text.includes('manger')) subcategory = 'Table à manger';
    else subcategory = 'Table';
  } else if (text.includes('chaise') || text.includes('fauteuil')) {
    category = 'Chaise';
    if (text.includes('bureau')) subcategory = 'Chaise de bureau';
    else if (text.includes('fauteuil')) subcategory = 'Fauteuil';
    else subcategory = 'Chaise de salle à manger';
  }

  // Détecter couleur
  let color = '';
  const colors = ['blanc', 'noir', 'gris', 'beige', 'marron', 'bleu', 'vert', 'rouge', 'jaune', 'orange', 'rose', 'violet', 'naturel', 'chêne', 'noyer', 'taupe'];
  for (const c of colors) {
    if (text.includes(c)) {
      color = c;
      break;
    }
  }

  // Détecter matériau
  let material = '';
  const materials = ['bois', 'métal', 'verre', 'tissu', 'cuir', 'velours', 'travertin', 'marbre', 'plastique', 'rotin', 'chenille'];
  for (const m of materials) {
    if (text.includes(m)) {
      material = m;
      break;
    }
  }

  // Détecter tissu
  let fabric = '';
  const fabrics = ['velours', 'chenille', 'lin', 'coton', 'cuir', 'tissu', 'polyester'];
  for (const f of fabrics) {
    if (text.includes(f)) {
      fabric = f;
      break;
    }
  }

  // Détecter style
  let style = '';
  const styles = ['moderne', 'contemporain', 'scandinave', 'industriel', 'vintage', 'rustique', 'classique', 'minimaliste', 'bohème'];
  for (const s of styles) {
    if (text.includes(s)) {
      style = s;
      break;
    }
  }

  // Détecter pièce
  let room = '';
  const rooms = ['salon', 'chambre', 'cuisine', 'bureau', 'salle à manger', 'entrée', 'terrasse'];
  for (const r of rooms) {
    if (text.includes(r)) {
      room = r;
      break;
    }
  }

  // Générer tags
  const tags = [];
  if (color) tags.push(color);
  if (material) tags.push(material);
  if (fabric) tags.push(fabric);
  if (style) tags.push(style);
  if (text.includes('convertible')) tags.push('convertible');
  if (text.includes('rangement')) tags.push('rangement');
  if (text.includes('angle')) tags.push('angle');

  // Générer contenu SEO
  const productName = product.name || product.title || 'Produit';
  const brand = product.vendor || 'Decora Home';
  
  const seo_title = `${productName} ${color ? color : ''} - ${brand}`.substring(0, 70);
  const seo_description = `${productName} ${material ? 'en ' + material : ''} ${color ? color : ''}. ${style ? 'Style ' + style : ''}. Livraison gratuite.`.substring(0, 155);
  const ad_headline = productName.substring(0, 30);
  const ad_description = `${productName} ${material ? material : ''}. ${style ? style : ''}. Promo !`.substring(0, 90);

  // Code Google Shopping basique
  let google_product_category = '';
  if (category === 'Canapé') google_product_category = '635';
  else if (category === 'Table') google_product_category = '443';
  else if (category === 'Chaise') google_product_category = '436';

  // Extraire dimensions
  const dimensionMatch = text.match(/(\d+)\s*[x×]\s*(\d+)(?:\s*[x×]\s*(\d+))?\s*cm/);
  const dimensions = dimensionMatch ? dimensionMatch[0] : '';

  // Calculer score de confiance
  let confidence = 30; // Base
  if (category !== 'Mobilier') confidence += 25;
  if (color) confidence += 20;
  if (material) confidence += 20;
  if (style) confidence += 15;
  if (room) confidence += 10;
  if (dimensions) confidence += 10;

  return {
    category,
    subcategory,
    color,
    material,
    fabric,
    style,
    dimensions,
    room,
    tags,
    seo_title,
    seo_description,
    ad_headline,
    ad_description,
    google_product_category,
    gtin: '',
    brand: brand,
    confidence_score: Math.min(confidence, 100)
  };
}