const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
};

import { createClient } from 'npm:@supabase/supabase-js@2';

interface SyncToEnrichedRequest {
  retailer_id?: string;
  force_sync?: boolean;
  source_filter?: string;
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, {
      status: 200,
      headers: corsHeaders,
    });
  }

  try {
    const { retailer_id, force_sync = false, source_filter }: SyncToEnrichedRequest = await req.json();
    
    console.log('🔄 [sync-to-enriched] Synchronisation vers table enrichie:', {
      retailer_id,
      force_sync,
      source_filter
    });

    // Initialize Supabase
    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
    
    if (!supabaseUrl || !supabaseKey) {
      throw new Error('Configuration Supabase manquante');
    }
    
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Récupérer les produits à synchroniser depuis imported_products
    let query = supabase
      .from('imported_products')
      .select('*')
      .eq('status', 'active')
      .gt('stock', 0);

    if (retailer_id) {
      const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(retailer_id);
      if (isUuid) {
        query = query.eq('retailer_id', retailer_id);
      }
    }

    if (source_filter) {
      query = query.eq('source_platform', source_filter);
    }

    const { data: importedProducts, error } = await query;

    if (error) {
      console.error('❌ [sync-to-enriched] Erreur récupération:', error);
      throw error;
    }

    if (!importedProducts || importedProducts.length === 0) {
      return new Response(
        JSON.stringify({
          success: true,
          message: 'Aucun produit à synchroniser',
          stats: { synced_count: 0, total_found: 0 }
        }),
        {
          headers: { 'Content-Type': 'application/json', ...corsHeaders }
        }
      );
    }

    console.log('📦 [sync-to-enriched] Produits à synchroniser:', importedProducts.length);

    // Enrichir et synchroniser chaque produit
    const enrichedProducts = [];
    
    for (const product of importedProducts) {
      try {
        const enrichedProduct = await enrichAndFormatProduct(product);
        enrichedProducts.push(enrichedProduct);
      } catch (error) {
        console.error(`❌ [sync-to-enriched] Erreur produit ${product.name}:`, error);
      }
    }

    // Insérer dans products_enriched
    if (enrichedProducts.length > 0) {
      const { data, error: insertError } = await supabase
        .from('products_enriched')
        .upsert(enrichedProducts, { 
          onConflict: 'handle',
          ignoreDuplicates: false 
        })
        .select();

      if (insertError) {
        console.error('❌ [sync-to-enriched] Erreur insertion:', insertError);
        throw insertError;
      }

      console.log('✅ [sync-to-enriched] Produits synchronisés:', data?.length || 0);
    }

    const stats = {
      total_found: importedProducts.length,
      synced_count: enrichedProducts.length,
      success_rate: (enrichedProducts.length / importedProducts.length) * 100,
      avg_confidence: enrichedProducts.length > 0 ? 
        Math.round(enrichedProducts.reduce((sum, p) => sum + (p.confidence_score || 0), 0) / enrichedProducts.length) : 0,
      synced_at: new Date().toISOString()
    };

    return new Response(
      JSON.stringify({
        success: true,
        message: `${enrichedProducts.length} produits synchronisés vers table enrichie`,
        stats
      }),
      {
        headers: {
          'Content-Type': 'application/json',
          ...corsHeaders,
        },
      }
    );

  } catch (error) {
    console.error('❌ [sync-to-enriched] Erreur:', error);
    
    return new Response(
      JSON.stringify({
        success: false,
        error: 'Erreur lors de la synchronisation',
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

async function enrichAndFormatProduct(product: any) {
  // Enrichir le produit avec Smart AI si pas déjà fait
  const text = `${product.name} ${product.description || ''}`.toLowerCase();
  
  const enrichedProduct = {
    id: product.id || crypto.randomUUID(),
    handle: product.external_id || generateHandle(product.name),
    title: product.name,
    description: product.description || '',
    
    // Attributs Smart AI
    category: detectCategory(text),
    subcategory: detectSubcategory(text),
    color: detectColor(text),
    material: detectMaterial(text),
    fabric: detectFabric(text),
    style: detectStyle(text),
    dimensions: extractDimensions(text),
    room: detectRoom(text),
    
    // Prix et stock
    price: parseFloat(product.price) || 0,
    stock_qty: parseInt(product.stock) || 0,
    
    // Médias
    image_url: product.image_url || '',
    product_url: product.product_url || '',
    
    // SEO automatique
    tags: generateTags(text),
    seo_title: generateSEOTitle(product.name, detectColor(text), detectMaterial(text)),
    seo_description: generateSEODescription(product.name, detectCategory(text), detectStyle(text)),
    ad_headline: product.name.substring(0, 30),
    ad_description: `${product.name} ${detectColor(text)} ${detectMaterial(text)}. Promo !`.substring(0, 90),
    google_product_category: getGoogleCategory(detectCategory(text)),
    gtin: product.gtin || generateGTIN(product.id),
    brand: product.vendor || 'Decora Home',
    
    // Métadonnées IA
    confidence_score: calculateConfidence(text),
    enriched_at: new Date().toISOString(),
    enrichment_source: 'sync_auto',
    retailer_id: product.retailer_id
  };

  return enrichedProduct;
}

function detectCategory(text: string): string {
  if (text.includes('canapé') || text.includes('sofa')) return 'Canapé';
  if (text.includes('table')) return 'Table';
  if (text.includes('chaise') || text.includes('fauteuil')) return 'Chaise';
  if (text.includes('lit')) return 'Lit';
  if (text.includes('armoire') || text.includes('commode')) return 'Rangement';
  if (text.includes('meuble tv')) return 'Meuble TV';
  return 'Mobilier';
}

function detectSubcategory(text: string): string {
  if (text.includes('angle')) return 'Canapé d\'angle';
  if (text.includes('convertible')) return 'Canapé convertible';
  if (text.includes('basse')) return 'Table basse';
  if (text.includes('manger')) return 'Table à manger';
  if (text.includes('bureau')) return 'Chaise de bureau';
  return '';
}

function detectColor(text: string): string {
  const colors = ['blanc', 'noir', 'gris', 'beige', 'marron', 'bleu', 'vert', 'rouge', 'naturel', 'chêne', 'taupe'];
  return colors.find(color => text.includes(color)) || '';
}

function detectMaterial(text: string): string {
  const materials = ['bois', 'métal', 'verre', 'tissu', 'cuir', 'velours', 'travertin', 'marbre', 'chenille'];
  return materials.find(material => text.includes(material)) || '';
}

function detectFabric(text: string): string {
  const fabrics = ['velours', 'tissu', 'cuir', 'chenille', 'lin', 'coton'];
  return fabrics.find(fabric => text.includes(fabric)) || '';
}

function detectStyle(text: string): string {
  const styles = ['moderne', 'contemporain', 'scandinave', 'industriel', 'vintage', 'classique'];
  return styles.find(style => text.includes(style)) || '';
}

function detectRoom(text: string): string {
  const rooms = ['salon', 'chambre', 'cuisine', 'bureau', 'salle à manger', 'entrée'];
  return rooms.find(room => text.includes(room)) || '';
}

function extractDimensions(text: string): string {
  const match = text.match(/(\d+)\s*[x×]\s*(\d+)(?:\s*[x×]\s*(\d+))?\s*cm/);
  return match ? match[0] : '';
}

function generateTags(text: string): string[] {
  const tags = [];
  const category = detectCategory(text);
  const color = detectColor(text);
  const material = detectMaterial(text);
  const style = detectStyle(text);
  
  if (category !== 'Mobilier') tags.push(category.toLowerCase());
  if (color) tags.push(color);
  if (material) tags.push(material);
  if (style) tags.push(style);
  
  return tags.slice(0, 5);
}

function generateSEOTitle(name: string, color: string, material: string): string {
  return `${name} ${color} ${material} - Decora Home`.trim().substring(0, 70);
}

function generateSEODescription(name: string, category: string, style: string): string {
  return `${name} ${style ? style : ''} ${category}. Livraison gratuite. Garantie 2 ans.`.trim().substring(0, 155);
}

function getGoogleCategory(category: string): string {
  const mappings = {
    'Canapé': '635',
    'Table': '443',
    'Chaise': '436',
    'Lit': '569',
    'Rangement': '6552'
  };
  return mappings[category as keyof typeof mappings] || '696';
}

function generateGTIN(productId: string): string {
  const base = productId.replace(/[^0-9]/g, '').substring(0, 12).padStart(12, '0');
  return '3' + base; // Préfixe France
}

function calculateConfidence(text: string): number {
  let confidence = 30;
  if (detectColor(text)) confidence += 20;
  if (detectMaterial(text)) confidence += 20;
  if (detectStyle(text)) confidence += 15;
  if (extractDimensions(text)) confidence += 15;
  return Math.min(confidence, 100);
}

function generateHandle(title: string): string {
  return title
    .toLowerCase()
    .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9\s-]/g, '')
    .trim()
    .replace(/\s+/g, '-')
    .substring(0, 100);
}