const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
};
import { extractSpecifications } from '../_shared/specExtractor.ts';
import { parseDecoraCatalog } from '../_shared/csvParser.ts';

interface Product {
  id: string;
  handle: string;
  title: string;
  productType: string;
  vendor: string;
  tags: string[];
  price: number;
  compareAtPrice?: number;
  availableForSale: boolean;
  quantityAvailable: number;
  image_url: string;
  product_url: string;
  description: string;
  variants: ProductVariant[];
}

interface ProductVariant {
  id: string;
  title: string;
  price: number;
  compareAtPrice?: number;
  availableForSale: boolean;
  quantityAvailable: number;
  selectedOptions: {
    name: string;
    value: string;
  }[];
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, {
      status: 200,
      headers: corsHeaders,
    });
  }

  try {
    const products = await fetchShopifyProducts();

    return new Response(
      JSON.stringify({ products }),
      {
        headers: {
          'Content-Type': 'application/json',
          ...corsHeaders,
        },
      }
    );
  } catch (error) {
    console.error('Error loading Shopify products:', error);
    
    return new Response(
      JSON.stringify({ 
        products: parseDecoraCatalog()
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

async function fetchShopifyProducts(): Promise<Product[]> {
  const shopifyDomain = Deno.env.get('SHOPIFY_DOMAIN');
  const storefrontToken = Deno.env.get('SHOPIFY_STOREFRONT_ACCESS_TOKEN');

  if (!shopifyDomain || !storefrontToken) {
    console.log('❌ Identifiants Shopify manquants:');
    console.log('SHOPIFY_DOMAIN:', shopifyDomain ? 'Défini' : 'Manquant');
    console.log('SHOPIFY_STOREFRONT_ACCESS_TOKEN:', storefrontToken ? 'Défini' : 'Manquant');
    console.log('🔄 Utilisation du catalogue local Decora Home');
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
                    currencyCode
                  }
                  compareAtPrice {
                    amount
                    currencyCode
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
              altText
            }
            images(first: 5) {
              edges {
                node {
                  url
                  altText
                }
              }
            }
          }
        }
      }
    }
  `;

  console.log('📡 Envoi requête GraphQL...');

  const response = await fetch(`https://${shopifyDomain}/api/2023-10/graphql.json`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-Shopify-Storefront-Access-Token': storefrontToken,
    },
    body: JSON.stringify({
      query,
      variables: { first: 100 }
    }),
  });

  if (!response.ok) {
    console.error('❌ Erreur HTTP Shopify:', response.status, response.statusText);
    const errorText = await response.text();
    console.error('❌ Détails erreur:', errorText);
    throw new Error(`Shopify API error: ${response.statusText}`);
  }

  const data = await response.json();
  
  if (data.errors) {
    console.error('Shopify GraphQL errors:', data.errors);
    throw new Error(`Shopify GraphQL error: ${data.errors[0].message}`);
  }
  
  const products = data.data.products.edges.map((edge: any) => {
    const product = edge.node;
    const variants = product.variants.edges.map((variantEdge: any) => {
      const variant = variantEdge.node;
      return {
        id: variant.id,
        title: variant.title,
        price: Math.round(parseFloat(variant.price.amount)),
        compareAtPrice: variant.compareAtPrice ? Math.round(parseFloat(variant.compareAtPrice.amount)) : undefined,
        availableForSale: variant.availableForSale,
        quantityAvailable: variant.quantityAvailable || 0,
        selectedOptions: variant.selectedOptions,
      };
    });

    const firstVariant = variants[0];
    const imageUrl = product.featuredImage?.url || 
                    product.images?.edges[0]?.node?.url || 
                    'https://images.pexels.com/photos/1350789/pexels-photo-1350789.jpeg';
    
    return {
      id: product.id,
      handle: product.handle,
      title: product.title,
      productType: product.productType || 'Mobilier',
      vendor: product.vendor || 'Boutique',
      tags: product.tags || [],
      price: firstVariant?.price || 0,
      compareAtPrice: firstVariant?.compareAtPrice,
      availableForSale: product.availableForSale,
      quantityAvailable: variants.reduce((sum, v) => sum + (v.quantityAvailable || 0), 0),
      image_url: imageUrl,
      product_url: `https://${shopifyDomain}/products/${product.handle}`,
      description: product.description || '',
      variants,
      specifications: extractSpecifications(product.description || '', product.title, product.productType || ''),
    };
  });

  console.log('✅ Produits Shopify parsés:', products.length);
  return products;

  // Auto-trigger AI training after successful import
  if (products.length > 0) {
    try {
      console.log('🤖 Déclenchement auto-training IA...');
      
      const autoTrainResponse = await fetch(`${Deno.env.get('SUPABASE_URL')}/functions/v1/auto-ai-trainer`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          products: products,
          source: 'shopify',
          store_id: shopifyDomain?.replace('.myshopify.com', ''),
          trigger_type: 'import'
        }),
      });

      if (autoTrainResponse.ok) {
        const trainResult = await autoTrainResponse.json();
        console.log('✅ Auto-training réussi:', trainResult.stats);
      } else {
        console.log('⚠️ Auto-training échoué, produits importés sans IA');
      }
    } catch (error) {
      console.log('⚠️ Erreur auto-training:', error);
    }
  }

  return data.data.products.edges.map((edge: any) => {
    const product = edge.node;
    const variants = product.variants.edges.map((variantEdge: any) => {
      const variant = variantEdge.node;
      return {
        id: variant.id,
        title: variant.title,
        price: Math.round(parseFloat(variant.price.amount)),
        compareAtPrice: variant.compareAtPrice ? Math.round(parseFloat(variant.compareAtPrice.amount)) : undefined,
        availableForSale: variant.availableForSale,
        quantityAvailable: variant.quantityAvailable || 0,
        selectedOptions: variant.selectedOptions,
      };
    });

    const firstVariant = variants[0];
    const imageUrl = product.featuredImage?.url || 
                    product.images?.edges[0]?.node?.url || 
                    'https://images.pexels.com/photos/1350789/pexels-photo-1350789.jpeg';
    
    return {
      id: product.id,
      handle: product.handle,
      title: product.title,
      productType: product.productType || 'Mobilier',
      vendor: product.vendor || 'Boutique',
      tags: product.tags || [],
      price: firstVariant?.price || 0,
      compareAtPrice: firstVariant?.compareAtPrice,
      availableForSale: product.availableForSale,
      quantityAvailable: variants.reduce((sum, v) => sum + (v.quantityAvailable || 0), 0),
      image_url: imageUrl,
      product_url: `https://${shopifyDomain}/products/${product.handle}`,
      description: product.description || '',
      variants,
      specifications: extractSpecifications(product.description || '', product.title, product.productType || ''),
    };
  });
}

function filterDecoraProducts(searchQuery: string): Product[] {
  const decoraProducts = parseDecoraCatalog();
  const queryLower = searchQuery.toLowerCase();
  
  return decoraProducts.filter(product => {
    return (
      product.title.toLowerCase().includes(queryLower) ||
      product.productType.toLowerCase().includes(queryLower) ||
      product.tags.some(tag => tag.toLowerCase().includes(queryLower)) ||
      product.description.toLowerCase().includes(queryLower)
    );
  });
}

function generateProductSearchResponse(products: Product[]): string {
  if (products.length === 0) {
    return "Désolé, je n'ai trouvé aucun produit correspondant à votre recherche dans le catalogue Decora Home. Voulez-vous essayer avec d'autres critères ?";
  }

  const productCount = products.length;
  const categories = [...new Set(products.map(p => p.productType))];
  const priceRange = {
    min: Math.min(...products.map(p => p.price)),
    max: Math.max(...products.map(p => p.price))
  };
  
  return `Parfait ! J'ai trouvé ${productCount} produit${productCount > 1 ? 's' : ''} Decora Home qui pourrai${productCount > 1 ? 'ent' : 't'} vous intéresser dans les catégories : ${categories.join(', ')}. Les prix vont de ${priceRange.min}€ à ${priceRange.max}€. Voici ma sélection exclusive :`;
}

function parseDecoraCatalog(): Product[] {
  // Sample of Decora Home products from the catalog
  return [
    {
      id: 'decora-table-aurea-100',
      handle: 'table-a-manger-ronde-plateau-en-travertin-naturel-100-120-cm',
      title: 'Table à manger ronde AUREA – Plateau en travertin naturel – 100 cm',
      productType: 'Table',
      vendor: 'Decora Home',
      tags: ['travertin', 'naturel', 'ronde', 'élégant'],
      price: 499,
      compareAtPrice: 859,
      availableForSale: true,
      quantityAvailable: 100,
      image_url: 'https://cdn.shopify.com/s/files/1/0903/7578/2665/files/3_e80b9a50-b032-4267-8f5b-f9130153e3be.png?v=1754406484',
      product_url: 'https://decorahome.fr/products/table-a-manger-ronde-plateau-en-travertin-naturel-100-120-cm',
      description: 'Apportez une touche d\'élégance minérale à votre intérieur avec la table à manger AUREA, une pièce aux lignes douces et à la personnalité affirmée. Disponible en deux dimensions (Ø100 cm et Ø120 cm), elle s\'intègre harmonieusement dans les espaces de vie modernes, épurés ou bohèmes.',
      variants: [
        {
          id: 'decora-variant-TB18T100-DH',
          title: '100*100*75cm',
          price: 499,
          compareAtPrice: 859,
          availableForSale: true,
          quantityAvailable: 100,
          selectedOptions: [
            { name: 'Taille', value: '100*100*75cm' }
          ]
        },
        {
          id: 'decora-variant-TB18T120-DH',
          title: '120*120*75cm',
          price: 549,
          compareAtPrice: 909,
          availableForSale: true,
          quantityAvailable: 100,
          selectedOptions: [
            { name: 'Taille', value: '120*120*75cm' }
          ]
        }
      ]
    },
    {
      id: 'decora-canape-alyana',
      handle: 'canape-dangle-convertible-et-reversible-4-places-en-velours-cotele',
      title: 'Canapé d\'angle ALYANA convertible et réversible 4 places en velours côtelé',
      productType: 'Canapé',
      vendor: 'Decora Home',
      tags: ['convertible', 'réversible', 'velours', 'côtelé', 'angle'],
      price: 799,
      compareAtPrice: 1399,
      availableForSale: true,
      quantityAvailable: 100,
      image_url: 'https://cdn.shopify.com/s/files/1/0903/7578/2665/files/7_23a97631-68d2-4f3e-8f78-b26c7cd4c2ae.png?v=1754406480',
      product_url: 'https://decorahome.fr/products/canape-dangle-convertible-et-reversible-4-places-en-velours-cotele',
      description: 'Le canapé d\'angle ALYANA a été spécialement conçu pour les professionnels à la recherche de mobilier à forte valeur décorative, sans compromis sur la praticité. Pensé pour les intérieurs contemporains et les petits espaces, ce canapé 4 places séduit par son design arrondi tendance, son revêtement en velours côtelé texturé, et ses fonctionnalités intelligentes : couchage intégré, angle réversible, coffre de rangement.',
      variants: [
        {
          id: 'decora-variant-ALYAAVCOTBEI-DH',
          title: 'Beige',
          price: 799,
          compareAtPrice: 1399,
          availableForSale: true,
          quantityAvailable: 100,
          selectedOptions: [
            { name: 'Couleur', value: 'beige-2' }
          ]
        },
        {
          id: 'decora-variant-ALYAAVCOTTAU-DH',
          title: 'Taupe',
          price: 799,
          compareAtPrice: 1399,
          availableForSale: true,
          quantityAvailable: 100,
          selectedOptions: [
            { name: 'Couleur', value: 'taupe-1' }
          ]
        },
        {
          id: 'decora-variant-ALYAAVCOTBLF-DH',
          title: 'Bleu',
          price: 799,
          compareAtPrice: 1399,
          availableForSale: true,
          quantityAvailable: 100,
          selectedOptions: [
            { name: 'Couleur', value: 'bleu' }
          ]
        }
      ]
    },
    {
      id: 'decora-chaise-inaya',
      handle: 'chaise-en-tissu-serge-chenille-pieds-metal-noir-gris-clair-moka-et-beige',
      title: 'Chaise INAYA en tissu chenille et pieds métal noir',
      productType: 'Chaise',
      vendor: 'Decora Home',
      tags: ['chenille', 'métal', 'contemporain', 'élégant'],
      price: 99,
      compareAtPrice: 149,
      availableForSale: true,
      quantityAvailable: 96,
      image_url: 'https://cdn.shopify.com/s/files/1/0903/7578/2665/files/3_3f11d1af-8ce5-4d2d-a435-cd0a78eb92ee.png?v=1755791319',
      product_url: 'https://decorahome.fr/products/chaise-en-tissu-serge-chenille-pieds-metal-noir-gris-clair-moka-et-beige',
      description: 'Apportez une touche contemporaine et élégante à votre intérieur avec la chaise INAYA, au design baguette épuré et moderne. Sa structure solide en métal noir mat assure une excellente stabilité tout en apportant une note industrielle chic à votre pièce.',
      variants: [
        {
          id: 'decora-variant-DC11PNNCHLG-DH',
          title: 'Gris clair',
          price: 99,
          compareAtPrice: 149,
          availableForSale: true,
          quantityAvailable: 96,
          selectedOptions: [
            { name: 'Couleur', value: 'gris-clair' }
          ]
        },
        {
          id: 'decora-variant-DC11PNNCHMO-DH',
          title: 'Moka',
          price: 99,
          compareAtPrice: 149,
          availableForSale: true,
          quantityAvailable: 100,
          selectedOptions: [
            { name: 'Couleur', value: 'moka' }
          ]
        }
      ]
    }
  ];
}