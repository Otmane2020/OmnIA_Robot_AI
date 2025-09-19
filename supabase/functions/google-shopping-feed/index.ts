const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
};

import { createClient } from 'npm:@supabase/supabase-js@2';

interface GoogleShoppingFeedRequest {
  retailer_id?: string;
  format?: 'xml' | 'csv';
  subdomain?: string;
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
    const subdomain = url.searchParams.get('subdomain') || 'decorahome';
    const retailer_id = url.searchParams.get('retailer_id');

    console.log('🛒 Génération flux Google Shopping:', { format, subdomain });

    // Initialize Supabase
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Récupérer les produits enrichis
    const { data: products, error } = await supabase
      .from('products_enriched')
      .select('*')
      .gt('stock_qty', 0)
      .order('created_at', { ascending: false })
      .limit(1000);

    if (error) {
      console.error('❌ Erreur récupération produits:', error);
      throw error;
    }

    // Utiliser des produits de démo si pas de données
    const feedProducts = products && products.length > 0 ? products : getDemoProducts(subdomain);

    console.log('✅ Produits pour flux:', feedProducts.length);

    if (format === 'xml') {
      const xmlFeed = generateXMLFeed(feedProducts, subdomain);
      return new Response(xmlFeed, {
        headers: {
          'Content-Type': 'application/xml; charset=utf-8',
          'Content-Disposition': `attachment; filename="${subdomain}-google-shopping.xml"`,
          ...corsHeaders,
        },
      });
    } else {
      const csvFeed = generateCSVFeed(feedProducts, subdomain);
      return new Response(csvFeed, {
        headers: {
          'Content-Type': 'text/csv; charset=utf-8',
          'Content-Disposition': `attachment; filename="${subdomain}-google-shopping.csv"`,
          ...corsHeaders,
        },
      });
    }

  } catch (error) {
    console.error('❌ Erreur génération flux:', error);
    
    return new Response(
      JSON.stringify({
        success: false,
        error: 'Erreur lors de la génération du flux Google Shopping',
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

function getDemoProducts(subdomain: string) {
  return [
    {
      id: 'decora-alyana-beige',
      handle: 'canape-alyana-velours-beige',
      title: 'Canapé d\'angle convertible ALYANA 4 places en velours côtelé beige',
      description: 'Canapé d\'angle moderne en velours côtelé beige avec coffre de rangement intégré et fonction convertible, parfait pour un salon design et pratique.',
      category: 'Canapé',
      subcategory: 'Canapé d\'angle',
      color: 'Beige',
      material: 'Velours côtelé, bois, métal',
      style: 'Moderne',
      room: 'Salon',
      price: 799,
      stock_qty: 45,
      image_url: 'https://cdn.shopify.com/s/files/1/0903/7578/2665/files/7_23a97631-68d2-4f3e-8f78-b26c7cd4c2ae.png',
      product_length: 240,
      product_width: 160,
      product_height: 75,
      seo_title: 'Canapé Convertible ALYANA Beige - Design Moderne | Decora Home',
      seo_description: 'Découvrez le canapé convertible ALYANA en velours côtelé beige. Design moderne, 4 places, coffre de rangement. Livraison gratuite.',
      google_product_category: 'Furniture > Living Room Furniture > Sofas',
      gtin: '3701234567890',
      brand: 'Decora Home'
    },
    {
      id: 'decora-aurea-travertin-100',
      handle: 'table-aurea-travertin-100cm',
      title: 'Table à manger ronde AUREA plateau travertin naturel Ø100cm',
      description: 'Table ronde élégante en travertin naturel avec pieds métal noir, parfaite pour 4 personnes. Design contemporain et matériaux nobles.',
      category: 'Table',
      subcategory: 'Table à manger',
      color: 'Naturel, Travertin',
      material: 'Travertin naturel, métal noir',
      style: 'Contemporain',
      room: 'Salle à manger',
      price: 499,
      stock_qty: 30,
      image_url: 'https://cdn.shopify.com/s/files/1/0903/7578/2665/files/3_e80b9a50-b032-4267-8f5b-f9130153e3be.png',
      product_length: 100,
      product_width: 100,
      product_height: 75,
      product_diameter: 100,
      seo_title: 'Table Ronde AUREA Travertin Ø100cm - Élégance Naturelle',
      seo_description: 'Table à manger ronde AUREA en travertin naturel. Design élégant, pieds métal noir. Parfaite pour 4 personnes.',
      google_product_category: 'Furniture > Tables > Dining Tables',
      gtin: '3701234567891',
      brand: 'Decora Home'
    }
  ];
}

function generateXMLFeed(products: any[], subdomain: string): string {
  const baseUrl = `https://${subdomain}.omnia.sale`;
  
  const items = products.map(product => {
    const productUrl = `${baseUrl}/products/${product.handle}`;
    const imageUrl = product.image_url || `${baseUrl}/images/placeholder.jpg`;
    const price = `${product.price || 0}.00 EUR`;
    const salePrice = product.compare_at_price ? `${product.compare_at_price}.00 EUR` : '';
    const availability = (product.stock_qty || 0) > 0 ? 'in stock' : 'out of stock';
    
    return `    <item>
      <g:id>${escapeXml(product.id)}</g:id>
      <title>${escapeXml(product.title)}</title>
      <description>${escapeXml(product.description || '')}</description>
      <g:item_group_id>${escapeXml(product.handle.split('-')[0])}</g:item_group_id>
      <link>${escapeXml(productUrl)}</link>
      <g:product_type>${escapeXml(`${product.category} > ${product.subcategory || product.category}`)}</g:product_type>
      <g:google_product_category>${escapeXml(product.google_product_category || 'Furniture')}</g:google_product_category>
      <g:image_link>${escapeXml(imageUrl)}</g:image_link>
      <g:condition>new</g:condition>
      <g:availability>${availability}</g:availability>
      <g:price>${price}</g:price>
      ${salePrice ? `<g:sale_price>${salePrice}</g:sale_price>` : ''}
      <g:mpn>${escapeXml(product.handle.toUpperCase())}</g:mpn>
      <g:brand>${escapeXml(product.brand || 'Decora Home')}</g:brand>
      <g:canonical_link>${escapeXml(productUrl)}</g:canonical_link>
      ${product.product_length ? `<g:product_length>${product.product_length} cm</g:product_length>` : ''}
      ${product.product_width ? `<g:product_width>${product.product_width} cm</g:product_width>` : ''}
      ${product.product_height ? `<g:product_height>${product.product_height} cm</g:product_height>` : ''}
      ${product.color ? `<g:color>${escapeXml(product.color)}</g:color>` : ''}
      ${product.material ? `<g:material>${escapeXml(product.material)}</g:material>` : ''}
      <g:quantity>${product.stock_qty || 0}</g:quantity>
      ${product.gtin ? `<g:gtin>${escapeXml(product.gtin)}</g:gtin>` : ''}
      <g:identifier_exists>${product.gtin ? 'yes' : 'no'}</g:identifier_exists>
    </item>`;
  }).join('\n');

  return `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:g="http://base.google.com/ns/1.0">
  <channel>
    <title>${subdomain.charAt(0).toUpperCase() + subdomain.slice(1)} - Flux Google Shopping</title>
    <link>${baseUrl}</link>
    <description>Flux produits enrichis avec IA OmnIA pour Google Shopping</description>
    <lastBuildDate>${new Date().toUTCString()}</lastBuildDate>
    <generator>OmnIA.sale DeepSeek AI</generator>
${items}
  </channel>
</rss>`;
}

function generateCSVFeed(products: any[], subdomain: string): string {
  const baseUrl = `https://${subdomain}.omnia.sale`;
  
  const headers = [
    'id', 'title', 'description', 'item group id', 'link', 'product type', 
    'google product category', 'image link', 'condition', 'availability', 
    'price', 'sale price', 'mpn', 'brand', 'canonical link',
    'additional image link', 'additional image link', 'additional image link', 'additional image link',
    'product length', 'product width', 'percent_off', 'material', 'gtin', 
    'color', 'quantity', 'size', 'identifier exists'
  ];

  const rows = products.map(product => {
    const productUrl = `${baseUrl}/products/${product.handle}`;
    const imageUrl = product.image_url || `${baseUrl}/images/placeholder.jpg`;
    const price = `${product.price || 0}.00 EUR`;
    const salePrice = product.compare_at_price ? `${product.compare_at_price}.00 EUR` : '';
    const availability = (product.stock_qty || 0) > 0 ? 'in stock' : 'out of stock';
    const percentOff = product.compare_at_price && product.price ? 
      Math.round(((product.compare_at_price - product.price) / product.compare_at_price) * 100) : '';

    return [
      product.id,
      product.title,
      product.description || '',
      product.handle.split('-')[0],
      productUrl,
      `${product.category} > ${product.subcategory || product.category}`,
      product.google_product_category || 'Furniture',
      imageUrl,
      'new',
      availability,
      price,
      salePrice,
      product.handle.toUpperCase(),
      product.brand || 'Decora Home',
      productUrl,
      '', '', '', '', // Additional image links
      product.product_length ? `${product.product_length} cm` : '',
      product.product_width ? `${product.product_width} cm` : '',
      percentOff,
      product.material || '',
      product.gtin || '',
      product.color || '',
      product.stock_qty || 0,
      product.size || '',
      product.gtin ? 'yes' : 'no'
    ].map(field => `"${(field || '').toString().replace(/"/g, '""')}"`).join(',');
  });

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