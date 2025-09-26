async function fetchShopifyProducts(): Promise<Product[]> {
  const shopifyDomain = Deno.env.get('SHOPIFY_DOMAIN');
  const storefrontToken = Deno.env.get('SHOPIFY_STOREFRONT_ACCESS_TOKEN');

  if (!shopifyDomain || !storefrontToken) {
    console.log('❌ Identifiants Shopify manquants → fallback catalogue local');
    throw new Error('Shopify non configuré');
  }

  console.log('🛍️ Récupération produits Shopify depuis:', shopifyDomain);

  const query = `
    query getProducts($first: Int!) {
      products(first: $first) {
        edges {
          node {
            id
            handle
            title
            productType
            vendor
            tags
            description
            availableForSale
            variants(first: 10) {
              edges {
                node {
                  id
                  title
                  availableForSale
                  quantityAvailable
                  price {
                    amount
                  }
                  compareAtPrice {
                    amount
                  }
                  selectedOptions {
                    name
                    value
                  }
                }
              }
            }
            featuredImage {
              url
            }
          }
        }
      }
    }
  `;

  const response = await fetch(`https://${shopifyDomain}/api/2023-10/graphql.json`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-Shopify-Storefront-Access-Token': storefrontToken,
    },
    body: JSON.stringify({ query, variables: { first: 100 } }),
  });

  if (!response.ok) {
    throw new Error(`Shopify API error: ${response.statusText}`);
  }

  const data = await response.json();
  
  const products: Product[] = data.data.products.edges.map((edge: any) => {
    const product = edge.node;
    const variants = product.variants.edges.map((variantEdge: any) => variantEdge.node);

    // 🟢 Cas 1 : Produit avec une seule variante → on garde tel quel
    if (variants.length === 1) {
      const v = variants[0];
      return {
        id: product.id,
        handle: product.handle,
        title: product.title,
        productType: product.productType || 'Mobilier',
        vendor: product.vendor || 'Boutique',
        tags: product.tags || [],
        price: Math.round(parseFloat(v.price.amount)),
        compareAtPrice: v.compareAtPrice ? Math.round(parseFloat(v.compareAtPrice.amount)) : undefined,
        availableForSale: v.availableForSale,
        quantityAvailable: v.quantityAvailable || 0,
        image_url: product.featuredImage?.url || 'https://images.pexels.com/photos/1350789/pexels-photo-1350789.jpeg',
        product_url: `https://${shopifyDomain}/products/${product.handle}`,
        description: product.description || '',
        variants: [
          {
            id: v.id,
            title: v.title,
            price: Math.round(parseFloat(v.price.amount)),
            compareAtPrice: v.compareAtPrice ? Math.round(parseFloat(v.compareAtPrice.amount)) : undefined,
            availableForSale: v.availableForSale,
            quantityAvailable: v.quantityAvailable || 0,
            selectedOptions: v.selectedOptions,
          }
        ],
        specifications: extractSpecifications(product.description || '', product.title, product.productType || ''),
      };
    }

    // 🟡 Cas 2 : Produit multi-variantes → on le simplifie (prix min/max)
    const priceMin = Math.min(...variants.map((v: any) => parseFloat(v.price.amount)));
    const priceMax = Math.max(...variants.map((v: any) => parseFloat(v.price.amount)));

    return {
      id: product.id,
      handle: product.handle,
      title: product.title,
      productType: product.productType || 'Mobilier',
      vendor: product.vendor || 'Boutique',
      tags: product.tags || [],
      price: Math.round(priceMin),
      compareAtPrice: undefined,
      availableForSale: product.availableForSale,
      quantityAvailable: variants.reduce((sum: number, v: any) => sum + (v.quantityAvailable || 0), 0),
      image_url: product.featuredImage?.url || 'https://images.pexels.com/photos/1350789/pexels-photo-1350789.jpeg',
      product_url: `https://${shopifyDomain}/products/${product.handle}`,
      description: product.description || '',
      variants: [], // ❌ volontairement vide pour single variation
      specifications: extractSpecifications(product.description || '', product.title, product.productType || ''),
    };
  });

  console.log('✅ Produits Shopify (simplifiés single variation):', products.length);
  return products;
}
