const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
};

import { createClient } from 'npm:@supabase/supabase-js@2';

interface MerchantFeedRequest {
  format?: 'xml' | 'csv';
  retailer_id?: string;
  sync?: boolean;
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
    const retailerId = url.searchParams.get('retailer_id') || 'demo-retailer-id';
    const sync = url.searchParams.get('sync') === 'true';

    console.log('📊 Génération flux Google Merchant:', { format, retailerId, sync });

    // Initialize Supabase
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Si sync demandé, forcer la synchronisation
    if (sync) {
      await forceSyncToMerchantFeed(supabase);
    }

    // Récupérer les produits du flux Google Merchant
    const { data: merchantProducts, error } = await supabase
      .from('flux_google_merchant')
      .select('*')
      .eq('availability', 'in stock')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('❌ Erreur récupération flux:', error);
      throw error;
    }

    console.log('📦 Produits dans le flux:', merchantProducts?.length || 0);

    if (format === 'xml') {
      const xmlContent = generateGoogleMerchantXML(merchantProducts || []);
      return new Response(xmlContent, {
        headers: {
          'Content-Type': 'application/xml',
          'Content-Disposition': `attachment; filename="google-merchant-feed-${new Date().toISOString().split('T')[0]}.xml"`,
          ...corsHeaders,
        },
      });
    } else {
      const csvContent = generateGoogleMerchantCSV(merchantProducts || []);
      return new Response(csvContent, {
        headers: {
          'Content-Type': 'text/csv',
          'Content-Disposition': `attachment; filename="google-merchant-feed-${new Date().toISOString().split('T')[0]}.csv"`,
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

async function forceSyncToMerchantFeed(supabase: any) {
  try {
    console.log('🔄 Synchronisation forcée vers flux Google Merchant...');

    // Récupérer tous les produits enrichis
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
      link: product.product_url,
      image_link: product.image_url,
      additional_image_link: product.gallery_urls ? product.gallery_urls.join(',') : '',
      availability: product.availability === 'Disponible' ? 'in stock' : 'out of stock',
      price: `${product.price} EUR`,
      sale_price: product.compare_at_price ? `${product.compare_at_price} EUR` : null,
      brand: product.brand || product.vendor,
      gtin: product.gtin || '',
      mpn: product.sku || '',
      condition: 'new',
      google_product_category: product.google_category || getGoogleCategoryFromType(product.category),
      product_type: product.category + (product.subcategory ? ' > ' + product.subcategory : ''),
      color: product.color,
      material: product.material,
      pattern: product.tags ? product.tags.join(',') : '',
      size: product.dimensions,
      custom_label_0: 'promo2025',
      custom_label_1: product.style || '',
      custom_label_2: product.room || '',
      custom_label_3: product.fabric || '',
      custom_label_4: '',
      shipping_weight: product.weight || '',
      age_group: 'adult',
      gender: 'unisex',
      multipack: 1,
      is_bundle: false,
      adult: false,
      tax_country: 'FR'
    }));

    // Insérer dans flux_google_merchant
    const { error: insertError } = await supabase
      .from('flux_google_merchant')
      .upsert(merchantData, { onConflict: 'id' });

    if (insertError) {
      console.error('❌ Erreur insertion flux:', insertError);
      throw insertError;
    }

    console.log('✅ Flux Google Merchant synchronisé:', merchantData.length, 'produits');

  } catch (error) {
    console.error('❌ Erreur synchronisation flux:', error);
    throw error;
  }
}

function getGoogleCategoryFromType(category: string): string {
  const categoryMap: { [key: string]: string } = {
    'Canapé': '635',
    'Fauteuil': '635',
    'Table': '443',
    'Chaise': '436',
    'Lit': '569',
    'Rangement': '6552',
    'Meuble TV': '6552',
    'Décoration': '696',
    'Éclairage': '594'
  };
  
  return categoryMap[category] || '632'; // Furniture par défaut
}

function generateGoogleMerchantXML(products: any[]): string {
  const xmlHeader = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:g="http://base.google.com/ns/1.0">
  <channel>
    <title>OmnIA.sale - Catalogue Mobilier</title>
    <link>https://omnia.sale</link>
    <description>Catalogue produits mobilier OmnIA.sale</description>
    <language>fr</language>
    <lastBuildDate>${new Date().toUTCString()}</lastBuildDate>`;

  const xmlItems = products.map(product => `
    <item>
      <g:id>${escapeXml(product.id)}</g:id>
      <title>${escapeXml(product.title)}</title>
      <description>${escapeXml(product.description)}</description>
      <g:link>${escapeXml(product.link)}</g:link>
      <g:image_link>${escapeXml(product.image_link)}</g:image_link>
      ${product.additional_image_link ? `<g:additional_image_link>${escapeXml(product.additional_image_link)}</g:additional_image_link>` : ''}
      <g:availability>${product.availability}</g:availability>
      <g:price>${product.price}</g:price>
      ${product.sale_price ? `<g:sale_price>${product.sale_price}</g:sale_price>` : ''}
      <g:brand>${escapeXml(product.brand)}</g:brand>
      ${product.gtin ? `<g:gtin>${product.gtin}</g:gtin>` : ''}
      ${product.mpn ? `<g:mpn>${product.mpn}</g:mpn>` : ''}
      <g:condition>${product.condition}</g:condition>
      <g:google_product_category>${product.google_product_category}</g:google_product_category>
      <g:product_type>${escapeXml(product.product_type)}</g:product_type>
      ${product.color ? `<g:color>${escapeXml(product.color)}</g:color>` : ''}
      ${product.material ? `<g:material>${escapeXml(product.material)}</g:material>` : ''}
      ${product.pattern ? `<g:pattern>${escapeXml(product.pattern)}</g:pattern>` : ''}
      ${product.size ? `<g:size>${escapeXml(product.size)}</g:size>` : ''}
      <g:custom_label_0>${product.custom_label_0}</g:custom_label_0>
      ${product.custom_label_1 ? `<g:custom_label_1>${escapeXml(product.custom_label_1)}</g:custom_label_1>` : ''}
      ${product.custom_label_2 ? `<g:custom_label_2>${escapeXml(product.custom_label_2)}</g:custom_label_2>` : ''}
      ${product.custom_label_3 ? `<g:custom_label_3>${escapeXml(product.custom_label_3)}</g:custom_label_3>` : ''}
      <g:age_group>${product.age_group}</g:age_group>
      <g:gender>${product.gender}</g:gender>
      <g:multipack>${product.multipack}</g:multipack>
      <g:is_bundle>${product.is_bundle}</g:is_bundle>
      <g:adult>${product.adult}</g:adult>
      ${product.shipping_weight ? `<g:shipping_weight>${product.shipping_weight}</g:shipping_weight>` : ''}
    </item>`).join('');

  const xmlFooter = `
  </channel>
</rss>`;

  return xmlHeader + xmlItems + xmlFooter;
}

function generateGoogleMerchantCSV(products: any[]): string {
  const headers = [
    'id', 'title', 'description', 'link', 'image_link', 'additional_image_link',
    'availability', 'price', 'sale_price', 'brand', 'gtin', 'mpn', 'condition',
    'google_product_category', 'product_type', 'color', 'material', 'pattern',
    'size', 'custom_label_0', 'custom_label_1', 'custom_label_2', 'custom_label_3',
    'custom_label_4', 'age_group', 'gender', 'multipack', 'is_bundle', 'adult',
    'shipping_weight'
  ];

  const csvRows = products.map(product => 
    headers.map(header => {
      const value = product[header] || '';
      // Échapper les guillemets et virgules pour CSV
      return `"${value.toString().replace(/"/g, '""')}"`;
    }).join(',')
  );

  return [headers.join(','), ...csvRows].join('\n');
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