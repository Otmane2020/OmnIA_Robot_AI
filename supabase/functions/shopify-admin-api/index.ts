const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
};

interface ShopifyAdminRequest {
  action: 'test_connection' | 'get_products' | 'get_shop_info';
  shop_domain: string;
  access_token: string;
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
    const { action, shop_domain, access_token, limit = 50 }: ShopifyAdminRequest = await req.json();
    
    console.log('🛍️ Shopify Admin API:', { action, shop_domain });

    // Valider les paramètres
    if (!shop_domain || !access_token) {
      return new Response(
        JSON.stringify({
          success: false,
          error: 'Domaine Shopify et token d\'accès requis'
        }),
        {
          status: 400,
          headers: { 'Content-Type': 'application/json', ...corsHeaders }
        }
      );
    }

    // Normaliser le domaine
    let cleanDomain = shop_domain
      .replace(/^https?:\/\//, '')
      .replace(/^www\./, '')
      .replace(/\/$/, '');
    
    if (!cleanDomain.includes('.myshopify.com')) {
      cleanDomain = `${cleanDomain}.myshopify.com`;
    }

    switch (action) {
      case 'test_connection':
        return await testShopifyConnection(cleanDomain, access_token);
      
      case 'get_shop_info':
        return await getShopInfo(cleanDomain, access_token);
      
      case 'get_products':
        return await getShopifyProducts(cleanDomain, access_token, limit);
      
      default:
        return new Response(
          JSON.stringify({
            success: false,
            error: 'Action non supportée'
          }),
          {
            status: 400,
            headers: { 'Content-Type': 'application/json', ...corsHeaders }
          }
        );
    }

  } catch (error) {
    console.error('❌ Erreur Shopify Admin API:', error);
    
    return new Response(
      JSON.stringify({
        success: false,
        error: 'Erreur lors de la connexion Shopify',
        details: error.message
      }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json', ...corsHeaders }
      }
    );
  }
});

async function testShopifyConnection(shopDomain: string, accessToken: string) {
  try {
    console.log('🔍 Test connexion Shopify:', shopDomain);

    const apiUrl = `https://${shopDomain}/admin/api/2024-01/shop.json`;
    
    console.log('📡 URL API construite:', apiUrl);
    
    const response = await fetch(apiUrl, {
      method: 'GET',
      headers: {
        'X-Shopify-Access-Token': accessToken,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('❌ Erreur test connexion:', response.status, errorText);
      
      let errorMessage = 'Erreur de connexion Shopify';
      if (response.status === 401) {
        errorMessage = 'Token d\'accès invalide ou expiré';
      } else if (response.status === 404) {
        errorMessage = 'Boutique Shopify introuvable';
      } else if (response.status === 403) {
        errorMessage = 'Permissions insuffisantes';
      }
      
      return new Response(
        JSON.stringify({
          success: false,
          error: errorMessage,
          status_code: response.status
        }),
        {
          status: response.status,
          headers: { 'Content-Type': 'application/json', ...corsHeaders }
        }
      );
    }

    const shopData = await response.json();
    console.log('✅ Connexion Shopify réussie:', shopData.shop.name);

    return new Response(
      JSON.stringify({
        success: true,
        message: 'Connexion Shopify réussie !',
        shop_info: {
          name: shopData.shop.name,
          domain: shopData.shop.domain,
          email: shopData.shop.email,
          currency: shopData.shop.currency,
          timezone: shopData.shop.timezone,
          plan_name: shopData.shop.plan_name
        }
      }),
      {
        headers: { 'Content-Type': 'application/json', ...corsHeaders }
      }
    );

  } catch (error) {
    console.error('❌ Erreur test connexion:', error);
    
    return new Response(
      JSON.stringify({
        success: false,
        error: 'Erreur réseau lors du test de connexion',
        details: error.message
      }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json', ...corsHeaders }
      }
    );
  }
}

async function getShopInfo(shopDomain: string, accessToken: string) {
  try {
    const response = await fetch(`https://${shopDomain}/admin/api/2024-01/shop.json`, {
      headers: {
        'X-Shopify-Access-Token': accessToken,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`Erreur API Shopify: ${response.status}`);
    }

    const data = await response.json();
    
    return new Response(
      JSON.stringify({
        success: true,
        shop: data.shop
      }),
      {
        headers: { 'Content-Type': 'application/json', ...corsHeaders }
      }
    );

  } catch (error) {
    return new Response(
      JSON.stringify({
        success: false,
        error: error.message
      }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json', ...corsHeaders }
      }
    );
  }
}

async function getShopifyProducts(shopDomain: string, accessToken: string, limit: number) {
  try {
    console.log('📦 Récupération produits Shopify REST API:', { shopDomain, limit });

    // Utiliser l'API REST pour plus de simplicité
    const response = await fetch(`https://${shopDomain}/admin/api/2024-01/products.json?limit=${limit}`, {
      method: 'GET',
      headers: {
        'X-Shopify-Access-Token': accessToken,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('❌ Erreur REST API:', response.status, errorText);
      throw new Error(`Erreur API Shopify: ${response.status} - ${errorText}`);
    }

    const data = await response.json();
    const rawProducts = data.products || [];
    
    console.log('📦 Produits bruts récupérés:', rawProducts.length);
    
    // Transformer les produits au format standardisé
    const products = rawProducts.map((product: any) => {
      const firstVariant = product.variants?.[0] || {};
      const firstImage = product.images?.[0] || {};
      
      return {
        id: product.id?.toString() || `shopify-${Date.now()}`,
        handle: product.handle || '',
        title: product.title || 'Produit sans nom',
        productType: product.product_type || 'Mobilier',
        vendor: product.vendor || shopDomain.replace('.myshopify.com', ''),
        tags: Array.isArray(product.tags) ? product.tags : (product.tags ? product.tags.split(',') : []),
        price: firstVariant.price ? parseFloat(firstVariant.price) : 0,
        compareAtPrice: firstVariant.compare_at_price ? parseFloat(firstVariant.compare_at_price) : undefined,
        availableForSale: product.status === 'active',
        quantityAvailable: firstVariant.inventory_quantity !== undefined ? firstVariant.inventory_quantity : 0,
        image_url: firstImage.src || product.image?.src || 'https://images.pexels.com/photos/1350789/pexels-photo-1350789.jpeg',
        product_url: `https://${shopDomain}/products/${product.handle}`,
        product_url: `https://${shopDomain}/products/${product.handle}`,
        description: product.body_html ? product.body_html.replace(/<[^>]*>/g, '').substring(0, 500) : product.title,
        status: product.status || 'active',
        createdAt: product.created_at,
        updatedAt: product.updated_at,
        sku: firstVariant.sku || '',
        inventory_management: firstVariant.inventory_management || 'shopify',
        stock: firstVariant.inventory_quantity || 0,
        variants: product.variants?.map((variant: any) => ({
          id: variant.id?.toString(),
          title: variant.title,
          price: parseFloat(variant.price) || 0,
          compareAtPrice: variant.compare_at_price ? parseFloat(variant.compare_at_price) : undefined,
          availableForSale: variant.available,
          quantityAvailable: variant.inventory_quantity || 0,
          sku: variant.sku || '',
          selectedOptions: [
            ...(variant.option1 ? [{ name: 'Option 1', value: variant.option1 }] : []),
            ...(variant.option2 ? [{ name: 'Option 2', value: variant.option2 }] : []),
            ...(variant.option3 ? [{ name: 'Option 3', value: variant.option3 }] : [])
          ]
        })) || []
      };
    });

    console.log('✅ Produits transformés:', products.length);

    return new Response(
      JSON.stringify({
        success: true,
        products: products,
        count: products.length,
        shop_domain: shopDomain,
        message: `${products.length} produits récupérés avec succès`
      }),
      {
        headers: { 'Content-Type': 'application/json', ...corsHeaders }
      }
    );

  } catch (error) {
    console.error('❌ Erreur récupération produits:', error);
    
    return new Response(
      JSON.stringify({
        success: false,
        error: 'Erreur lors de la récupération des produits',
        details: error.message
      }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json', ...corsHeaders }
      }
    );
  }
}