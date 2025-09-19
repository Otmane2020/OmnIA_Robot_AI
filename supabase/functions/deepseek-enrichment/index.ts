const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
};

import { createClient } from 'npm:@supabase/supabase-js@2';

interface DeepSeekEnrichmentRequest {
  products: Array<{
    id: string;
    title: string;
    description: string;
    category?: string;
    price?: number;
    image_url?: string;
  }>;
  enrichment_type: 'full' | 'seo_only' | 'attributes_only';
}

interface EnrichedProduct {
  id: string;
  handle: string;
  title: string;
  description: string;
  category: string;
  subcategory: string;
  color: string;
  material: string;
  fabric: string;
  style: string;
  dimensions: string;
  room: string;
  price: number;
  stock_quantity: number;
  image_url: string;
  product_url: string;
  tags: string[];
  seo_title: string;
  seo_description: string;
  ad_headline: string;
  ad_description: string;
  google_product_category: string;
  gtin: string;
  brand: string;
  confidence_score: number;
  enriched_at: string;
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
    const { products, enrichment_type = 'full' }: DeepSeekEnrichmentRequest = await req.json();
    
    console.log('🧠 Enrichissement DeepSeek:', {
      products_count: products.length,
      enrichment_type
    });

    const deepseekApiKey = Deno.env.get('DEEPSEEK_API_KEY');
    
    if (!deepseekApiKey) {
      console.log('❌ Clé API DeepSeek manquante');
      return new Response(
        JSON.stringify({ 
          error: "Clé API DeepSeek non configurée",
          fallback: true 
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

    const enrichedProducts: EnrichedProduct[] = [];
    let successCount = 0;
    let errorCount = 0;

    // Traiter les produits par batch pour éviter les timeouts
    const batchSize = 5;
    
    for (let i = 0; i < products.length; i += batchSize) {
      const batch = products.slice(i, i + batchSize);
      console.log(`🔄 Batch ${Math.floor(i/batchSize) + 1}/${Math.ceil(products.length/batchSize)}`);
      
      const batchPromises = batch.map(async (product) => {
        try {
          const enriched = await enrichProductWithDeepSeek(product, deepseekApiKey, enrichment_type);
          enrichedProducts.push(enriched);
          successCount++;
          return enriched;
        } catch (error) {
          console.error(`❌ Erreur enrichissement produit ${product.id}:`, error);
          errorCount++;
          return null;
        }
      });
      
      await Promise.all(batchPromises);
      
      // Pause entre les batches
      if (i + batchSize < products.length) {
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
    }

    // Sauvegarder les produits enrichis
    if (enrichedProducts.length > 0) {
      const { error: insertError } = await supabase
        .from('products_enriched')
        .upsert(enrichedProducts, { 
          onConflict: 'handle',
          ignoreDuplicates: false 
        });

      if (insertError) {
        console.error('❌ Erreur sauvegarde produits enrichis:', insertError);
        throw insertError;
      }

      console.log('✅ Produits enrichis sauvegardés:', enrichedProducts.length);
    }

    return new Response(
      JSON.stringify({
        success: true,
        message: `Enrichissement DeepSeek terminé ! ${successCount} produits traités.`,
        stats: {
          total_products: products.length,
          enriched_products: successCount,
          failed_products: errorCount,
          success_rate: Math.round((successCount / products.length) * 100),
          enrichment_type,
          processed_at: new Date().toISOString()
        },
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

async function enrichProductWithDeepSeek(
  product: any, 
  deepseekApiKey: string, 
  enrichmentType: string
): Promise<EnrichedProduct> {
  
  const prompt = `Tu es un expert en e-commerce et SEO spécialisé dans le mobilier. 
Enrichis ce produit avec TOUS les attributs nécessaires pour Google Shopping et le SEO.

PRODUIT À ENRICHIR:
Titre: ${product.title}
Description: ${product.description || ''}
Catégorie: ${product.category || ''}
Prix: ${product.price || 0}€

GÉNÈRE un JSON complet avec TOUS ces champs obligatoires:
{
  "handle": "url-friendly-slug",
  "title": "Titre optimisé SEO (max 70 caractères)",
  "description": "Description enrichie et détaillée",
  "category": "Catégorie principale",
  "subcategory": "Sous-catégorie spécifique",
  "color": "Couleurs détectées (séparées par virgules)",
  "material": "Matériaux identifiés",
  "fabric": "Type de tissu si applicable",
  "style": "Style décoratif",
  "dimensions": "Dimensions estimées",
  "room": "Pièce de destination",
  "tags": ["tag1", "tag2", "tag3"],
  "seo_title": "Titre SEO optimisé (max 60 caractères)",
  "seo_description": "Meta description SEO (max 155 caractères)",
  "ad_headline": "Titre publicitaire (max 30 caractères)",
  "ad_description": "Description pub (max 90 caractères)",
  "google_product_category": "Catégorie Google Shopping",
  "gtin": "Code produit généré",
  "brand": "Marque du produit",
  "confidence_score": 85
}

RÈGLES STRICTES:
- Utilise UNIQUEMENT des valeurs réalistes et cohérentes
- Respecte les limites de caractères pour le SEO
- Génère un GTIN réaliste (13 chiffres)
- Catégorie Google Shopping valide
- confidence_score: 0-100 basé sur la qualité des données

RÉPONSE JSON UNIQUEMENT:`;

  try {
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
            content: 'Tu es un expert en e-commerce et SEO. Tu enrichis les produits avec des attributs complets pour Google Shopping. Réponds UNIQUEMENT en JSON valide.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        max_tokens: 1000,
        temperature: 0.2,
        stream: false
      }),
    });

    if (!response.ok) {
      throw new Error(`DeepSeek API error: ${response.status}`);
    }

    const data = await response.json();
    const content = data.choices[0]?.message?.content?.trim();
    
    if (content) {
      try {
        const enrichedData = JSON.parse(content);
        
        return {
          id: product.id,
          handle: enrichedData.handle || generateHandle(product.title),
          title: enrichedData.title || product.title,
          description: enrichedData.description || product.description || '',
          category: enrichedData.category || product.category || 'Mobilier',
          subcategory: enrichedData.subcategory || '',
          color: enrichedData.color || '',
          material: enrichedData.material || '',
          fabric: enrichedData.fabric || '',
          style: enrichedData.style || '',
          dimensions: enrichedData.dimensions || '',
          room: enrichedData.room || '',
          price: product.price || 0,
          stock_quantity: product.stock || 100,
          image_url: product.image_url || '',
          product_url: product.product_url || `#${enrichedData.handle}`,
          tags: enrichedData.tags || [],
          seo_title: enrichedData.seo_title || enrichedData.title || product.title,
          seo_description: enrichedData.seo_description || '',
          ad_headline: enrichedData.ad_headline || '',
          ad_description: enrichedData.ad_description || '',
          google_product_category: enrichedData.google_product_category || '',
          gtin: enrichedData.gtin || generateGTIN(),
          brand: enrichedData.brand || 'Decora Home',
          confidence_score: enrichedData.confidence_score || 75,
          enriched_at: new Date().toISOString(),
          enrichment_source: 'deepseek_ai'
        };
        
      } catch (parseError) {
        console.log('⚠️ JSON invalide, enrichissement basique');
        throw parseError;
      }
    }
    
    throw new Error('Pas de contenu DeepSeek');
    
  } catch (error) {
    console.error('❌ Erreur DeepSeek:', error);
    
    // Fallback enrichissement basique
    return {
      id: product.id,
      handle: generateHandle(product.title),
      title: product.title,
      description: product.description || '',
      category: product.category || 'Mobilier',
      subcategory: '',
      color: extractBasicColor(product.title + ' ' + product.description),
      material: extractBasicMaterial(product.title + ' ' + product.description),
      fabric: '',
      style: extractBasicStyle(product.title + ' ' + product.description),
      dimensions: '',
      room: extractBasicRoom(product.title + ' ' + product.description),
      price: product.price || 0,
      stock_quantity: product.stock || 100,
      image_url: product.image_url || '',
      product_url: product.product_url || `#${generateHandle(product.title)}`,
      tags: [],
      seo_title: product.title.substring(0, 60),
      seo_description: (product.description || product.title).substring(0, 155),
      ad_headline: product.title.substring(0, 30),
      ad_description: (product.description || product.title).substring(0, 90),
      google_product_category: 'Furniture',
      gtin: generateGTIN(),
      brand: 'Decora Home',
      confidence_score: 50,
      enriched_at: new Date().toISOString(),
      enrichment_source: 'basic_fallback'
    };
  }
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

function generateGTIN(): string {
  // Générer un GTIN-13 réaliste (commence par 370 pour la France)
  const prefix = '370';
  const random = Math.floor(Math.random() * 1000000000).toString().padStart(9, '0');
  const base = prefix + random;
  
  // Calculer la clé de contrôle
  let sum = 0;
  for (let i = 0; i < 12; i++) {
    const digit = parseInt(base[i]);
    sum += (i % 2 === 0) ? digit : digit * 3;
  }
  const checkDigit = (10 - (sum % 10)) % 10;
  
  return base + checkDigit;
}

function extractBasicColor(text: string): string {
  const colors = ['blanc', 'noir', 'gris', 'beige', 'marron', 'bleu', 'vert', 'rouge', 'jaune', 'orange', 'rose', 'violet'];
  const found = colors.find(color => text.toLowerCase().includes(color));
  return found || '';
}

function extractBasicMaterial(text: string): string {
  const materials = ['bois', 'métal', 'verre', 'tissu', 'cuir', 'velours', 'travertin', 'marbre'];
  const found = materials.find(material => text.toLowerCase().includes(material));
  return found || '';
}

function extractBasicStyle(text: string): string {
  const styles = ['moderne', 'contemporain', 'scandinave', 'industriel', 'vintage', 'classique'];
  const found = styles.find(style => text.toLowerCase().includes(style));
  return found || '';
}

function extractBasicRoom(text: string): string {
  const rooms = ['salon', 'chambre', 'cuisine', 'bureau', 'salle à manger'];
  const found = rooms.find(room => text.toLowerCase().includes(room));
  return found || '';
}