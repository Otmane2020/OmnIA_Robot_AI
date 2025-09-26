const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
};

interface CartRequest {
  productId: string;
  variantId: string;
  quantity: number;
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, {
      status: 200,
      headers: corsHeaders,
    });
  }

  try {
    const { productId, variantId, quantity }: CartRequest = await req.json();

    // Create or update cart using Shopify Storefront API
    const result = await addToShopifyCart(variantId, quantity);

    return new Response(
      JSON.stringify({ 
        success: true,
        message: 'Produit ajouté au panier avec succès !',
        cart: result
      }),
      {
        headers: {
          'Content-Type': 'application/json',
          ...corsHeaders,
        },
      }
    );
  } catch (error) {
    console.error('Error adding to cart:', error);
    
    return new Response(
      JSON.stringify({ 
        success: false,
        message: 'Erreur lors de l\'ajout au panier.'
      }),
      {
        status: 200,
        headers: {
          'Content-Type': 'application/json',
          ...corsHeaders,
        },
      }
    );
  }
});

async function addToShopifyCart(variantId: string, quantity: number) {
  const shopifyDomain = Deno.env.get('SHOPIFY_DOMAIN');
  const storefrontToken = Deno.env.get('SHOPIFY_STOREFRONT_ACCESS_TOKEN');

  if (!shopifyDomain || !storefrontToken) {
    console.log('Shopify credentials not found, simulating cart addition');
    return { 
      id: 'mock-cart-id',
      totalQuantity: quantity,
      message: 'Produit ajouté au panier (mode démo)'
    };
  }

  // First, create a cart
  const createCartMutation = `
    mutation cartCreate($input: CartInput!) {
      cartCreate(input: $input) {
        cart {
          id
          totalQuantity
          lines(first: 100) {
            edges {
              node {
                id
                quantity
                merchandise {
                  ... on ProductVariant {
                    id
                    title
                    product {
                      title
                    }
                  }
                }
              }
            }
          }
        }
        userErrors {
          field
          message
        }
      }
    }
  `;

  try {
    const response = await fetch(`https://${shopifyDomain}/api/2023-10/graphql.json`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Shopify-Storefront-Access-Token': storefrontToken,
      },
      body: JSON.stringify({
        query: createCartMutation,
        variables: {
          input: {
            lines: [
              {
                merchandiseId: variantId,
                quantity: quantity
              }
            ]
          }
        }
      }),
    });

    if (!response.ok) {
      throw new Error(`Shopify API error: ${response.statusText}`);
    }

    const data = await response.json();
    
    if (data.data.cartCreate.userErrors.length > 0) {
      throw new Error(data.data.cartCreate.userErrors[0].message);
    }

    return {
      id: data.data.cartCreate.cart.id,
      totalQuantity: data.data.cartCreate.cart.totalQuantity,
      lines: data.data.cartCreate.cart.lines.edges.map((edge: any) => edge.node)
    };
  } catch (error) {
    console.error('Error creating Shopify cart:', error);
    throw error;
  }
}