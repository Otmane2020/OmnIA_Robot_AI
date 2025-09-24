const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
};

import { createClient } from 'npm:@supabase/supabase-js@2';

interface GoogleMerchantRequest {
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
    const retailer_id = url.searchParams.get('retailer_id');
    const limit = parseInt(url.searchParams.get('limit') || '1000');

    console.log('📊 Génération flux Google Merchant:', { format, retailer_id, limit });

    // Initialize Supabase
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Get products from flux_google_merchant
    let query = supabase
      .from('flux_google_merchant')
      .select('*')
      .eq('availability', 'in stock')
      .order('created_at', { ascending: false })
      .limit(limit);

    if (retailer_id) {
      // Join with products_enriched to filter by retailer
      query = supabase
        .from('flux_google_merchant')
        .select(`
          *,
          products_enriched!inner(retailer_id)
        `)
        .eq('products_enriched.retailer_id', retailer_id)
        .eq('availability', 'in stock')
        .limit(limit);
    }

    const { data: products, error } = await query;

    if (error) {
      console.error('❌ Erreur récupération flux:', error);
      throw error;
    }

    console.log('✅ Produits flux récupérés:', products?.length || 0);

    if (format === 'xml') {
      const xmlFeed = generateXMLFeed(products || []);
      return new Response(xmlFeed, {
        headers: {
          'Content-Type': 'application/xml',
          'Content-Disposition': 'attachment; filename="google-merchant-feed.xml"',
          ...corsHeaders,
        },
      });
    } else {
      const csvFeed = generateCSVFeed(products || []);
      return new Response(csvFeed, {
        headers: {
          'Content-Type': 'text/csv',
          'Content-Disposition': 'attachment; filename="google-merchant-feed.csv"',
          ...corsHeaders,
        },
      });
    }

  } catch (error) {
    console.error('❌ Erreur génération flux Google Merchant:', error);
    
    return new Response(
      JSON.stringify({
        success: false,
        error: 'Erreur lors de la génération du flux Google Merchant',
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

function generateXMLFeed(products: any[]): string {
  const items = products.map(product => `
    <item>
      <g:id>${escapeXml(product.google_id)}</g:id>
      <title>${escapeXml(product.title)}</title>
      <description>${escapeXml(product.description || '')}</description>
      <link>${escapeXml(product.link)}</link>
      <g:image_link>${escapeXml(product.image_link || '')}</g:image_link>
      <g:availability>${escapeXml(product.availability)}</g:availability>
      <g:price>${escapeXml(product.price)}</g:price>
      ${product.sale_price ? `<g:sale_price>${escapeXml(product.sale_price)}</g:sale_price>` : ''}
      <g:brand>${escapeXml(product.brand || '')}</g:brand>
      <g:condition>${escapeXml(product.condition)}</g:condition>
      ${product.color ? `<g:color>${escapeXml(product.color)}</g:color>` : ''}
      ${product.material ? `<g:material>${escapeXml(product.material)}</g:material>` : ''}
      ${product.google_product_category ? `<g:google_product_category>${escapeXml(product.google_product_category)}</g:google_product_category>` : ''}
      ${product.product_type ? `<g:product_type>${escapeXml(product.product_type)}</g:product_type>` : ''}
      ${product.custom_label_0 ? `<g:custom_label_0>${escapeXml(product.custom_label_0)}</g:custom_label_0>` : ''}
      ${product.custom_label_1 ? `<g:custom_label_1>${escapeXml(product.custom_label_1)}</g:custom_label_1>` : ''}
      ${product.custom_label_2 ? `<g:custom_label_2>${escapeXml(product.custom_label_2)}</g:custom_label_2>` : ''}
      ${product.custom_label_3 ? `<g:custom_label_3>${escapeXml(product.custom_label_3)}</g:custom_label_3>` : ''}
    </item>`).join('');

  return `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:g="http://base.google.com/ns/1.0">
  <channel>
    <title>OmnIA.sale - Flux Google Merchant</title>
    <link>https://omnia.sale</link>
    <description>Flux produits enrichis avec IA pour Google Shopping</description>
    <lastBuildDate>${new Date().toUTCString()}</lastBuildDate>
    <generator>OmnIA.sale Vision AI</generator>
    ${items}
  </channel>
</rss>`;
}

function generateCSVFeed(products: any[]): string {
  const headers = [
    'id', 'title', 'description', 'link', 'image_link', 'availability', 'price', 'sale_price',
    'brand', 'condition', 'color', 'material', 'google_product_category', 'product_type',
    'custom_label_0', 'custom_label_1', 'custom_label_2', 'custom_label_3'
  ];

  const rows = products.map(product => [
    product.google_id,
    product.title,
    product.description || '',
    product.link,
    product.image_link || '',
    product.availability,
    product.price,
    product.sale_price || '',
    product.brand || '',
    product.condition,
    product.color || '',
    product.material || '',
    product.google_product_category || '',
    product.product_type || '',
    product.custom_label_0 || '',
    product.custom_label_1 || '',
    product.custom_label_2 || '',
    product.custom_label_3 || ''
  ].map(field => `"${(field || '').toString().replace(/"/g, '""')}"`).join(','));

  return [headers.join(','), ...rows].join('\n');
}

function escapeXml(text: string): string {
  if (!text) return '';
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}