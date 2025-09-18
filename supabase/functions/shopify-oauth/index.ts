const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
};

interface OAuthInitRequest {
  shopDomain: string;
}

interface OAuthCallbackData {
  code: string;
  shop: string;
  state: string;
}

// Configuration OAuth Shopify
const SHOPIFY_CLIENT_ID = Deno.env.get('SHOPIFY_CLIENT_ID') || 'demo_client_id';
const SHOPIFY_CLIENT_SECRET = Deno.env.get('SHOPIFY_CLIENT_SECRET') || 'demo_client_secret';
const OAUTH_SCOPES = 'read_products,read_product_listings,read_inventory';

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, {
      status: 200,
      headers: corsHeaders,
    });
  }

  const url = new URL(req.url);
  const pathname = url.pathname;

  try {
    // 1. Initialisation OAuth - Générer l'URL d'autorisation
    if (req.method === "POST" && pathname.includes('/init')) {
      const { shopDomain }: OAuthInitRequest = await req.json();
      
      console.log('🔐 Initialisation OAuth pour:', shopDomain);
      
      // Valider le domaine Shopify
      if (!shopDomain || !shopDomain.includes('.myshopify.com')) {
        return new Response(
          JSON.stringify({ 
            success: false,
            error: 'Domaine Shopify invalide. Format attendu: boutique.myshopify.com'
          }),
          {
            status: 400,
            headers: { 'Content-Type': 'application/json', ...corsHeaders }
          }
        );
      }

      // Générer un state sécurisé
      const state = btoa(JSON.stringify({ 
        platform: 'shopify', 
        timestamp: Date.now(),
        shopDomain: shopDomain,
        nonce: crypto.randomUUID()
      }));

      // URL de redirection (votre domaine)
      const redirectUri = `${req.headers.get('origin') || 'https://omnia.sale'}/admin/shopify/callback`;
      
      // URL OAuth Shopify
      const oauthUrl = `https://${shopDomain}/admin/oauth/authorize?` +
        `client_id=${SHOPIFY_CLIENT_ID}&` +
        `scope=${OAUTH_SCOPES}&` +
        `redirect_uri=${encodeURIComponent(redirectUri)}&` +
        `state=${state}`;
      
      console.log('✅ URL OAuth générée pour:', shopDomain);
      
      return new Response(
        JSON.stringify({ 
          success: true,
          oauth_url: oauthUrl,
          redirect_uri: redirectUri,
          state: state
        }),
        {
          headers: { 'Content-Type': 'application/json', ...corsHeaders }
        }
      );
    }

    // 2. Callback OAuth - Traitement du retour Shopify
    if (req.method === "GET" && pathname.includes('/callback')) {
      const code = url.searchParams.get('code');
      const shop = url.searchParams.get('shop');
      const state = url.searchParams.get('state');
      
      console.log('🔐 Callback OAuth reçu:', { shop, hasCode: !!code, hasState: !!state });
      
      if (!code || !shop || !state) {
        console.error('❌ Paramètres OAuth manquants');
        return new Response(
          `<html><body><script>
            window.opener.postMessage({
              type: 'shopify_oauth_error',
              error: 'Paramètres OAuth manquants'
            }, '*');
            window.close();
          </script></body></html>`,
          {
            headers: { 'Content-Type': 'text/html', ...corsHeaders }
          }
        );
      }

      // Vérifier le state pour la sécurité
      let stateData;
      try {
        stateData = JSON.parse(atob(state));
        if (stateData.platform !== 'shopify') {
          throw new Error('State invalide');
        }
      } catch (error) {
        console.error('❌ State invalide:', error);
        return new Response(
          `<html><body><script>
            window.opener.postMessage({
              type: 'shopify_oauth_error',
              error: 'Token de sécurité invalide'
            }, '*');
            window.close();
          </script></body></html>`,
          {
            headers: { 'Content-Type': 'text/html', ...corsHeaders }
          }
        );
      }

      try {
        // Échanger le code contre un token d'accès
        console.log('🔄 Échange du code OAuth contre un token...');
        
        const tokenResponse = await fetch(`https://${shop}/admin/oauth/access_token`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            client_id: SHOPIFY_CLIENT_ID,
            client_secret: SHOPIFY_CLIENT_SECRET,
            code: code,
          }),
        });

        if (!tokenResponse.ok) {
          const errorText = await tokenResponse.text();
          console.error('❌ Erreur token Shopify:', errorText);
          throw new Error(`Erreur Shopify OAuth: ${tokenResponse.status}`);
        }

        const tokenData = await tokenResponse.json();
        console.log('✅ Token OAuth obtenu');

        // Tester l'accès avec le token
        const shopInfoResponse = await fetch(`https://${shop}/admin/api/2023-10/shop.json`, {
          headers: {
            'X-Shopify-Access-Token': tokenData.access_token,
          },
        });

        if (!shopInfoResponse.ok) {
          throw new Error('Token invalide ou permissions insuffisantes');
        }

        const shopData = await shopInfoResponse.json();
        console.log('✅ Accès boutique validé:', shopData.shop.name);

        // Récupérer quelques produits pour tester
        const productsResponse = await fetch(`https://${shop}/admin/api/2023-10/products.json?limit=10`, {
          headers: {
            'X-Shopify-Access-Token': tokenData.access_token,
          },
        });

        let productsCount = 0;
        let sampleProducts = [];
        
        if (productsResponse.ok) {
          const productsData = await productsResponse.json();
          sampleProducts = productsData.products || [];
          productsCount = sampleProducts.length;
          console.log('✅ Produits récupérés:', productsCount);
        }

        // Retourner les données via postMessage pour fermer la popup
        return new Response(
          `<html>
            <head><title>Connexion Shopify réussie</title></head>
            <body>
              <div style="font-family: Arial; text-align: center; padding: 50px; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; min-height: 100vh;">
                <h1>✅ Connexion réussie !</h1>
                <p>Votre boutique <strong>${shopData.shop.name}</strong> est connectée</p>
                <p>${productsCount} produits trouvés</p>
                <p>Fermeture automatique...</p>
              </div>
              <script>
                // Envoyer les données à la fenêtre parent
                window.opener.postMessage({
                  type: 'shopify_oauth_success',
                  data: {
                    shop: '${shop}',
                    shop_name: '${shopData.shop.name}',
                    access_token: '${tokenData.access_token}',
                    scope: '${tokenData.scope}',
                    products_count: ${productsCount},
                    sample_products: ${JSON.stringify(sampleProducts.slice(0, 3))},
                    connected_at: '${new Date().toISOString()}',
                    connection_type: 'oauth_real'
                  }
                }, '*');
                
                // Fermer la popup après 2 secondes
                setTimeout(() => {
                  window.close();
                }, 2000);
              </script>
            </body>
          </html>`,
          {
            headers: { 'Content-Type': 'text/html', ...corsHeaders }
          }
        );

      } catch (error) {
        console.error('❌ Erreur OAuth:', error);
        
        return new Response(
          `<html>
            <head><title>Erreur de connexion</title></head>
            <body>
              <div style="font-family: Arial; text-align: center; padding: 50px; background: linear-gradient(135deg, #ff6b6b 0%, #ee5a24 100%); color: white; min-height: 100vh;">
                <h1>❌ Erreur de connexion</h1>
                <p>${error.message}</p>
                <p>Fermeture automatique...</p>
              </div>
              <script>
                window.opener.postMessage({
                  type: 'shopify_oauth_error',
                  error: '${error.message}'
                }, '*');
                setTimeout(() => window.close(), 3000);
              </script>
            </body>
          </html>`,
          {
            headers: { 'Content-Type': 'text/html', ...corsHeaders }
          }
        );
      }
    }

    // 3. Récupération des produits après OAuth
    if (req.method === "POST" && pathname.includes('/products')) {
      const { access_token, shop } = await req.json();
      
      console.log('📦 Récupération produits OAuth pour:', shop);
      
      try {
        // Récupérer tous les produits (pagination si nécessaire)
        const productsResponse = await fetch(`https://${shop}/admin/api/2023-10/products.json?limit=250`, {
          headers: {
            'X-Shopify-Access-Token': access_token,
            'Content-Type': 'application/json',
          },
        });

        if (!productsResponse.ok) {
          throw new Error(`Erreur API Shopify: ${productsResponse.status}`);
        }

        const productsData = await productsResponse.json();
        const products = productsData.products || [];
        
        console.log('✅ Produits OAuth récupérés:', products.length);

        // Transformer les produits au format OmnIA
        const transformedProducts = products.map((product: any) => {
          const firstVariant = product.variants?.[0];
          const imageUrl = product.images?.[0]?.src || product.image?.src || 'https://images.pexels.com/photos/1350789/pexels-photo-1350789.jpeg';
          
          return {
            id: product.id.toString(),
            handle: product.handle,
            title: product.title,
            productType: product.product_type || 'Mobilier',
            vendor: product.vendor || shop.replace('.myshopify.com', ''),
            tags: product.tags ? product.tags.split(',').map((tag: string) => tag.trim()) : [],
            price: firstVariant ? Math.round(parseFloat(firstVariant.price)) : 0,
            compareAtPrice: firstVariant?.compare_at_price ? Math.round(parseFloat(firstVariant.compare_at_price)) : undefined,
            availableForSale: product.status === 'active',
            quantityAvailable: firstVariant?.inventory_quantity || 0,
            image_url: imageUrl,
            product_url: `https://${shop}/products/${product.handle}`,
            description: product.body_html ? product.body_html.replace(/<[^>]*>/g, '').substring(0, 300) : product.title,
            variants: product.variants?.map((variant: any) => ({
              id: variant.id.toString(),
              title: variant.title,
              price: Math.round(parseFloat(variant.price)),
              compareAtPrice: variant.compare_at_price ? Math.round(parseFloat(variant.compare_at_price)) : undefined,
              availableForSale: variant.available,
              quantityAvailable: variant.inventory_quantity || 0,
              selectedOptions: [
                ...(variant.option1 ? [{ name: 'Option 1', value: variant.option1 }] : []),
                ...(variant.option2 ? [{ name: 'Option 2', value: variant.option2 }] : []),
                ...(variant.option3 ? [{ name: 'Option 3', value: variant.option3 }] : [])
              ]
            })) || []
          };
        });

        return new Response(
          JSON.stringify({ 
            success: true,
            products: transformedProducts,
            count: transformedProducts.length,
            shop_name: shop.replace('.myshopify.com', ''),
            message: `${transformedProducts.length} produits importés avec succès depuis ${shop}`
          }),
          {
            headers: { 'Content-Type': 'application/json', ...corsHeaders }
          }
        );

      } catch (error) {
        console.error('❌ Erreur récupération produits OAuth:', error);
        
        return new Response(
          JSON.stringify({ 
            success: false,
            error: error.message,
            products: []
          }),
          {
            status: 500,
            headers: { 'Content-Type': 'application/json', ...corsHeaders }
          }
        );
      }
    }

    // Route par défaut
    return new Response(
      JSON.stringify({ 
        message: 'Shopify OAuth API',
        endpoints: {
          'POST /init': 'Initialiser OAuth',
          'GET /callback': 'Callback OAuth',
          'POST /products': 'Récupérer produits'
        }
      }),
      {
        headers: { 'Content-Type': 'application/json', ...corsHeaders }
      }
    );

  } catch (error) {
    console.error('❌ Erreur OAuth Shopify:', error);
    
    return new Response(
      JSON.stringify({ 
        success: false,
        error: 'Erreur lors de la connexion OAuth Shopify',
        details: error.message
      }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json', ...corsHeaders }
      }
    );
  }
});