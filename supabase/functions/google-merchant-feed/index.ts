const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
};

import { createClient } from 'npm:@supabase/supabase-js@2';

interface MerchantFeedRequest {
  format?: 'xml' | 'csv';
  retailer_id?: string;
  limit?: number;
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, {
      status: 200,
      headers: corsHeaders,
    });
  }

  try {
    const url = new URL(req.url);
    const format = url.searchParams.get('format') || 'xml';
    const retailer_id = url.searchParams.get('retailer_id') || 'demo-retailer-id';
    const limit = parseInt(url.searchParams.get('limit') || '1000');

    console.log('🛍️ Génération flux Google Merchant:', { format, retailer_id, limit });

    // Initialize Supabase
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Synchroniser d'abord products_enriched vers flux_google_merchant
    await syncToMerchantFeed(supabase, retailer_id);

    // Récupérer les données du flux
    const { data: merchantProducts, error } = await supabase
      .from('flux_google_merchant')
      .select('*')
      .limit(limit);

    if (error) {
      console.error('❌ Erreur récupération flux:', error);
      throw error;
    }

    console.log('✅ Produits flux récupérés:', merchantProducts?.length || 0);

    if (format === 'xml') {
      const xmlFeed = generateXMLFeed(merchantProducts || []);
      
      return new Response(xmlFeed, {
        headers: {
          'Content-Type': 'application/xml',
          'Content-Disposition': 'attachment; filename="google-merchant-feed.xml"',
          ...corsHeaders,
        },
      });
    } else {
      const csvFeed = generateCSVFeed(merchantProducts || []);
      
      return new Response(csvFeed, {
        headers: {
          'Content-Type': 'text/csv',
          'Content-Disposition': 'attachment; filename="google-merchant-feed.csv"',
          ...corsHeaders,
        },
      });
    }

  } catch (error) {
    console.error('❌ Erreur génération flux Merchant:', error);
    
    return new Response(
      JSON.stringify({
        error: 'Erreur lors de la génération du flux Google Merchant',
        details: error.message
      }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json', ...corsHeaders }
      }
    );
  }
});

async function syncToMerchantFeed(supabase: any, retailerId: string) {
  try {
    console.log('🔄 Synchronisation vers flux Google Merchant...');

    // Récupérer les produits enrichis
    const { data: enrichedProducts, error } = await supabase
      .from('products_enriched')
      .select('*')
      .gt('stock_quantity', 0);

    if (error) {
      throw error;
    }

    if (!enrichedProducts || enrichedProducts.length === 0) {
      console.log('⚠️ Aucun produit enrichi trouvé');
      return;
    }

    // Mapper vers format Google Merchant
    const merchantData = enrichedProducts.map(product => ({
      id: product.id,
      title: product.title,
      description: product.short_description || product.description,
      link: product.image_url, // Temporaire, sera remplacé par product_url
      image_link: product.image_url,
      additional_image_link: product.gallery_urls && product.gallery_urls.length > 0 ? 
        product.gallery_urls.join(',') : null,
      availability: product.availability === 'Disponible' ? 'in stock' : 'out of stock',
      price: `${product.price} EUR`,
      sale_price: product.compare_at_price ? `${product.compare_at_price} EUR` : null,
      brand: product.brand || product.vendor,
      gtin: '', // Vide par défaut
      mpn: product.handle,
      condition: 'new',
      google_product_category: product.google_category,
      product_type: product.category + (product.subcategory ? ' > ' + product.subcategory : ''),
      color: product.color,
      material: product.material,
      pattern: product.tags && product.tags.length > 0 ? product.tags.join(',') : '',
      size: product.dimensions,
      custom_label_0: 'promo2025'
    }));

    // Insérer dans flux_google_merchant
    const { error: insertError } = await supabase
      .from('flux_google_merchant')
      .upsert(merchantData, { onConflict: 'id' });

    if (insertError) {
      console.error('❌ Erreur sync flux merchant:', insertError);
      throw insertError;
    }

    console.log('✅ Flux Google Merchant synchronisé:', merchantData.length, 'produits');

  } catch (error) {
    console.error('❌ Erreur synchronisation flux:', error);
  }
}

function generateXMLFeed(products: any[]): string {
  const items = products.map(product => `
    <item>
      <g:id>${escapeXml(product.id)}</g:id>
      <g:title>${escapeXml(product.title)}</g:title>
      <g:description>${escapeXml(product.description || '')}</g:description>
      <g:link>${escapeXml(product.link || '')}</g:link>
      <g:image_link>${escapeXml(product.image_link || '')}</g:image_link>
      ${product.additional_image_link ? `<g:additional_image_link>${escapeXml(product.additional_image_link)}</g:additional_image_link>` : ''}
      <g:availability>${product.availability}</g:availability>
      <g:price>${product.price}</g:price>
      ${product.sale_price ? `<g:sale_price>${product.sale_price}</g:sale_price>` : ''}
      <g:brand>${escapeXml(product.brand || '')}</g:brand>
      ${product.gtin ? `<g:gtin>${product.gtin}</g:gtin>` : ''}
      <g:mpn>${escapeXml(product.mpn || '')}</g:mpn>
      <g:condition>${product.condition}</g:condition>
      <g:google_product_category>${escapeXml(product.google_product_category || '')}</g:google_product_category>
      <g:product_type>${escapeXml(product.product_type || '')}</g:product_type>
      ${product.color ? `<g:color>${escapeXml(product.color)}</g:color>` : ''}
      ${product.material ? `<g:material>${escapeXml(product.material)}</g:material>` : ''}
      ${product.pattern ? `<g:pattern>${escapeXml(product.pattern)}</g:pattern>` : ''}
      ${product.size ? `<g:size>${escapeXml(product.size)}</g:size>` : ''}
      <g:custom_label_0>${product.custom_label_0}</g:custom_label_0>
    </item>`).join('');

  return `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:g="http://base.google.com/ns/1.0">
  <channel>
    <title>Flux Google Shopping - Decora Home</title>
    <link>https://decorahome.fr</link>
    <description>Catalogue produits Decora Home pour Google Shopping</description>
    <language>fr</language>
    <lastBuildDate>${new Date().toUTCString()}</lastBuildDate>
    ${items}
  </channel>
</rss>`;
}

function generateCSVFeed(products: any[]): string {
  const headers = [
    'id', 'title', 'description', 'link', 'image_link', 'additional_image_link',
    'availability', 'price', 'sale_price', 'brand', 'gtin', 'mpn', 'condition',
    'google_product_category', 'product_type', 'color', 'material', 'pattern',
    'size', 'custom_label_0'
  ];

  const rows = products.map(product => [
    product.id,
    product.title,
    product.description || '',
    product.link || '',
    product.image_link || '',
    product.additional_image_link || '',
    product.availability,
    product.price,
    product.sale_price || '',
    product.brand || '',
    product.gtin || '',
    product.mpn || '',
    product.condition,
    product.google_product_category || '',
    product.product_type || '',
    product.color || '',
    product.material || '',
    product.pattern || '',
    product.size || '',
    product.custom_label_0 || 'promo2025'
  ].map(field => `"${String(field).replace(/"/g, '""')}"`));

  return [
    headers.join(','),
    ...rows.map(row => row.join(','))
  ].join('\n');
}

function escapeXml(text: string): string {
  return String(text)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}