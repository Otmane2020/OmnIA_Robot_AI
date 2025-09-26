const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
};

import { extractSpecifications } from '../_shared/specExtractor.ts';
import { parseDecoraCatalog } from '../_shared/csvParser.ts';

interface SearchRequest {
  query: string;
}

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
    const { query }: SearchRequest = await req.json();
    console.log('Recherche produits pour:', query);

    // Rechercher dans Shopify d'abord
    let products: Product[] = [];
    
    try {
      products = await searchShopifyProducts(query);
      console.log('Produits Shopify trouvés:', products.length);
    } catch (error) {
      console.log('Erreur Shopify, fallback local:', error);
      products = filterDecoraProducts(query);
    }
    
    console.log('Produits trouvés:', products.length);
    
    // Générer la réponse IA
    const aiMessage = await generateSearchResponse(query, products);

    return new Response(
      JSON.stringify({ 
        message: aiMessage,
        products: products.slice(0, 6) // Limiter à 6 produits
      }),
      {
        headers: {
          'Content-Type': 'application/json',
          ...corsHeaders,
        },
      }
    );
  } catch (error) {
    console.error('Erreur dans shopify-search:', error);
    
    // Fallback avec catalogue Decora Home
    const fallbackProducts = getDecoraProducts();
    const fallbackMessage = generateFallbackResponse('canapés', fallbackProducts);
    
    return new Response(
      JSON.stringify({ 
        message: fallbackMessage,
        products: fallbackProducts.slice(0, 6)
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

async function searchShopifyProducts(searchQuery: string): Promise<Product[]> {
  const shopifyDomain = Deno.env.get('SHOPIFY_DOMAIN');
  const storefrontToken = Deno.env.get('SHOPIFY_STOREFRONT_ACCESS_TOKEN');

  if (!shopifyDomain || !storefrontToken) {
    throw new Error('Shopify non configuré');
  }

  const query = `
    query searchProducts($query: String!, $first: Int!) {
      products(first: $first, query: $query) {
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
            variants(first: 5) {
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
    body: JSON.stringify({
      query,
      variables: { 
        query: searchQuery,
        first: 20 
      }
    }),
  });

  if (!response.ok) {
    throw new Error(`Shopify API error: ${response.statusText}`);
  }

  const data = await response.json();
  
  if (data.errors) {
    throw new Error(`Shopify GraphQL error: ${data.errors[0].message}`);
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
    
    return {
      id: product.id,
      handle: product.handle,
      title: product.title,
      productType: product.productType || 'Produit',
      vendor: product.vendor || 'Boutique',
      tags: product.tags || [],
      price: firstVariant?.price || 0,
      compareAtPrice: firstVariant?.compareAtPrice,
      availableForSale: product.availableForSale,
      quantityAvailable: variants.reduce((sum, v) => sum + (v.quantityAvailable || 0), 0),
      image_url: product.featuredImage?.url || 'https://images.pexels.com/photos/1350789/pexels-photo-1350789.jpeg',
      product_url: `https://${shopifyDomain}/products/${product.handle}`,
      description: product.description || '',
      variants,
    };
  });
}
function filterDecoraProducts(searchQuery: string): Product[] {
  const decoraProducts = getDecoraProducts();
  const queryLower = searchQuery.toLowerCase();
  
  // Mots-clés pour canapés
  const canapeKeywords = ['canapé', 'canapés', 'sofa', 'sofas', 'salon', 'assise'];
  const isCanapeSearch = canapeKeywords.some(keyword => queryLower.includes(keyword));
  
  if (isCanapeSearch) {
    return decoraProducts.filter(product => 
      product.productType.toLowerCase().includes('canapé') ||
      product.title.toLowerCase().includes('canapé') ||
      product.tags.some(tag => tag.toLowerCase().includes('canapé'))
    );
  }
  
  // Recherche générale
  return decoraProducts.filter(product => {
    return (
      product.title.toLowerCase().includes(queryLower) ||
      product.productType.toLowerCase().includes(queryLower) ||
      product.tags.some(tag => tag.toLowerCase().includes(queryLower)) ||
      product.description.toLowerCase().includes(queryLower)
    );
  });
}

async function generateSearchResponse(query: string, products: Product[]): Promise<string> {
  const openaiApiKey = Deno.env.get('OPENAI_API_KEY');
  
  if (!openaiApiKey) {
    console.log('OpenAI API key non trouvée, utilisation du fallback');
    return generateFallbackResponse(query, products);
  }

  if (products.length === 0) {
    return "Désolé, je n'ai trouvé aucun produit Decora Home correspondant à votre recherche. Voulez-vous essayer avec d'autres critères ?";
  }

  try {
    const openaiResponse = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openaiApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-3.5-turbo',
        messages: [
          {
            role: 'system',
            content: 'Tu es OmnIA, assistant robot designer pour Decora Home. Réponds court et direct, maximum 2 phrases. Présente les produits sans blabla.'
          },
          {
            role: 'user',
            content: `L'utilisateur cherche: "${query}". J'ai trouvé ${products.length} produits Decora Home. Génère une réponse d'introduction chaleureuse et professionnelle de maximum 100 mots.`
          }
        ],
        max_tokens: 150,
        temperature: 0.7,
      }),
    });

    if (openaiResponse.ok) {
      const data = await openaiResponse.json();
      return data.choices[0]?.message?.content || generateFallbackResponse(query, products);
    } else {
      console.error('Erreur OpenAI:', openaiResponse.status);
      return generateFallbackResponse(query, products);
    }
  } catch (error) {
    console.error('Erreur génération réponse IA:', error);
    return generateFallbackResponse(query, products);
  }
}

function generateFallbackResponse(query: string, products: Product[]): string {
  const queryLower = query.toLowerCase();
  const productCount = products.length;
  
  if (productCount === 0) {
    return "Désolé, je n'ai trouvé aucun produit correspondant à votre recherche dans notre collection Decora Home. Voulez-vous essayer avec d'autres critères ?";
  }

  if (queryLower.includes('canapé') || queryLower.includes('sofa')) {
    return `🛋️ **Excellente demande !** J'ai trouvé ${productCount} canapé${productCount > 1 ? 's' : ''} dans notre collection Decora Home exclusive !\n\nNotre **ALYANA** convertible en velours côtelé est parfait pour les intérieurs contemporains et les petits espaces. Design arrondi tendance, couchage intégré, angle réversible et coffre de rangement !\n\nVoici ma sélection pour votre salon :`;
  }
  
  if (queryLower.includes('table')) {
    return `🪑 **Parfait !** Notre collection Decora Home propose ${productCount} table${productCount > 1 ? 's' : ''} d'exception !\n\nLa **AUREA** en travertin naturel apporte une élégance minérale unique à votre intérieur. Disponible en Ø100cm et Ø120cm, elle s'intègre harmonieusement dans tous les styles !\n\nDécouvrez nos tables :`;
  }
  
  if (queryLower.includes('chaise')) {
    return `🪑 **Excellent choix !** Nos chaises Decora Home allient confort et style contemporain !\n\nLa **INAYA** en tissu chenille avec pieds métal noir offre un design baguette épuré et moderne. Structure solide et note industrielle chic garanties !\n\nVoici notre sélection :`;
  }

  const categories = [...new Set(products.map(p => p.productType))];
  const priceRange = {
    min: Math.min(...products.map(p => p.price)),
    max: Math.max(...products.map(p => p.price))
  };
  
  return `✨ **Parfait !** J'ai trouvé ${productCount} produit${productCount > 1 ? 's' : ''} Decora Home qui pourrai${productCount > 1 ? 'ent' : 't'} vous intéresser !\n\n**Catégories :** ${categories.join(', ')}\n**Prix :** de ${priceRange.min}€ à ${priceRange.max}€\n\nVoici ma sélection exclusive :`;
}

function getDecoraProducts(): Product[] {
  return [
    {
      id: 'decora-canape-alyana-beige',
      handle: 'canape-dangle-convertible-et-reversible-4-places-en-velours-cotele-beige',
      title: 'Canapé d\'angle ALYANA convertible et réversible 4 places - Beige',
      productType: 'Canapé',
      vendor: 'Decora Home',
      tags: ['convertible', 'réversible', 'velours', 'côtelé', 'angle', 'beige'],
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
          title: 'Beige - Velours côtelé',
          price: 799,
          compareAtPrice: 1399,
          availableForSale: true,
          quantityAvailable: 100,
          selectedOptions: [
            { name: 'Couleur', value: 'Beige' },
            { name: 'Matériau', value: 'Velours côtelé' }
          ]
        }
      ]
    },
    {
      id: 'decora-canape-alyana-taupe',
      handle: 'canape-dangle-convertible-et-reversible-4-places-en-velours-cotele-taupe',
      title: 'Canapé d\'angle ALYANA convertible et réversible 4 places - Taupe',
      productType: 'Canapé',
      vendor: 'Decora Home',
      tags: ['convertible', 'réversible', 'velours', 'côtelé', 'angle', 'taupe'],
      price: 799,
      compareAtPrice: 1399,
      availableForSale: true,
      quantityAvailable: 100,
      image_url: 'https://cdn.shopify.com/s/files/1/0903/7578/2665/files/1_c424b028-7399-4639-ba8f-487e0d71d0f6.png?v=1754406480',
      product_url: 'https://decorahome.fr/products/canape-dangle-convertible-et-reversible-4-places-en-velours-cotele',
      description: 'Le canapé d\'angle ALYANA a été spécialement conçu pour les professionnels à la recherche de mobilier à forte valeur décorative, sans compromis sur la praticité. Pensé pour les intérieurs contemporains et les petits espaces, ce canapé 4 places séduit par son design arrondi tendance, son revêtement en velours côtelé texturé, et ses fonctionnalités intelligentes : couchage intégré, angle réversible, coffre de rangement.',
      variants: [
        {
          id: 'decora-variant-ALYAAVCOTTAU-DH',
          title: 'Taupe - Velours côtelé',
          price: 799,
          compareAtPrice: 1399,
          availableForSale: true,
          quantityAvailable: 100,
          selectedOptions: [
            { name: 'Couleur', value: 'Taupe' },
            { name: 'Matériau', value: 'Velours côtelé' }
          ]
        }
      ]
    },
    {
      id: 'decora-canape-alyana-bleu',
      handle: 'canape-dangle-convertible-et-reversible-4-places-en-velours-cotele-bleu',
      title: 'Canapé d\'angle ALYANA convertible et réversible 4 places - Bleu',
      productType: 'Canapé',
      vendor: 'Decora Home',
      tags: ['convertible', 'réversible', 'velours', 'côtelé', 'angle', 'bleu'],
      price: 799,
      compareAtPrice: 1399,
      availableForSale: true,
      quantityAvailable: 100,
      image_url: 'https://cdn.shopify.com/s/files/1/0903/7578/2665/files/3_329df0e2-31cd-4628-a3ac-06213e4e2741.png?v=1754406480',
      product_url: 'https://decorahome.fr/products/canape-dangle-convertible-et-reversible-4-places-en-velours-cotele',
      description: 'Le canapé d\'angle ALYANA a été spécialement conçu pour les professionnels à la recherche de mobilier à forte valeur décorative, sans compromis sur la praticité. Pensé pour les intérieurs contemporains et les petits espaces, ce canapé 4 places séduit par son design arrondi tendance, son revêtement en velours côtelé texturé, et ses fonctionnalités intelligentes : couchage intégré, angle réversible, coffre de rangement.',
      variants: [
        {
          id: 'decora-variant-ALYAAVCOTBLF-DH',
          title: 'Bleu - Velours côtelé',
          price: 799,
          compareAtPrice: 1399,
          availableForSale: true,
          quantityAvailable: 100,
          selectedOptions: [
            { name: 'Couleur', value: 'Bleu' },
            { name: 'Matériau', value: 'Velours côtelé' }
          ]
        }
      ]
    },
    {
      id: 'decora-table-aurea-100',
      handle: 'table-a-manger-ronde-plateau-en-travertin-naturel-100-cm',
      title: 'Table à manger ronde AUREA – Plateau en travertin naturel – 100 cm',
      productType: 'Table',
      vendor: 'Decora Home',
      tags: ['travertin', 'naturel', 'ronde', 'élégant', 'minérale'],
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
          title: 'Ø100cm - Travertin naturel',
          price: 499,
          compareAtPrice: 859,
          availableForSale: true,
          quantityAvailable: 100,
          selectedOptions: [
            { name: 'Taille', value: '100*100*75cm' },
            { name: 'Matériau', value: 'Travertin naturel' }
          ]
        }
      ]
    },
    {
      id: 'decora-table-aurea-120',
      handle: 'table-a-manger-ronde-plateau-en-travertin-naturel-120-cm',
      title: 'Table à manger ronde AUREA – Plateau en travertin naturel – 120 cm',
      productType: 'Table',
      vendor: 'Decora Home',
      tags: ['travertin', 'naturel', 'ronde', 'élégant', 'minérale'],
      price: 549,
      compareAtPrice: 909,
      availableForSale: true,
      quantityAvailable: 100,
      image_url: 'https://cdn.shopify.com/s/files/1/0903/7578/2665/files/2_89637aec-60b5-403f-9f0f-57c9a2fa42e4.png?v=1754406484',
      product_url: 'https://decorahome.fr/products/table-a-manger-ronde-plateau-en-travertin-naturel-100-120-cm',
      description: 'Apportez une touche d\'élégance minérale à votre intérieur avec la table à manger AUREA, une pièce aux lignes douces et à la personnalité affirmée. Disponible en deux dimensions (Ø100 cm et Ø120 cm), elle s\'intègre harmonieusement dans les espaces de vie modernes, épurés ou bohèmes.',
      variants: [
        {
          id: 'decora-variant-TB18T120-DH',
          title: 'Ø120cm - Travertin naturel',
          price: 549,
          compareAtPrice: 909,
          availableForSale: true,
          quantityAvailable: 100,
          selectedOptions: [
            { name: 'Taille', value: '120*120*75cm' },
            { name: 'Matériau', value: 'Travertin naturel' }
          ]
        }
      ]
    },
    {
      id: 'decora-chaise-inaya-gris',
      handle: 'chaise-en-tissu-serge-chenille-pieds-metal-noir-gris-clair',
      title: 'Chaise INAYA en tissu chenille et pieds métal noir - Gris clair',
      productType: 'Chaise',
      vendor: 'Decora Home',
      tags: ['chenille', 'métal', 'contemporain', 'élégant', 'gris'],
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
          title: 'Gris clair - Tissu chenille',
          price: 99,
          compareAtPrice: 149,
          availableForSale: true,
          quantityAvailable: 96,
          selectedOptions: [
            { name: 'Couleur', value: 'Gris clair' },
            { name: 'Matériau', value: 'Tissu chenille' }
          ]
        }
      ]
    },
    {
      id: 'decora-chaise-inaya-moka',
      handle: 'chaise-en-tissu-serge-chenille-pieds-metal-noir-moka',
      title: 'Chaise INAYA en tissu chenille et pieds métal noir - Moka',
      productType: 'Chaise',
      vendor: 'Decora Home',
      tags: ['chenille', 'métal', 'contemporain', 'élégant', 'moka'],
      price: 99,
      compareAtPrice: 149,
      availableForSale: true,
      quantityAvailable: 100,
      image_url: 'https://cdn.shopify.com/s/files/1/0903/7578/2665/files/1_aae7ccd2-f2cb-4418-8c84-210ace00d753.png?v=1755791319',
      product_url: 'https://decorahome.fr/products/chaise-en-tissu-serge-chenille-pieds-metal-noir-gris-clair-moka-et-beige',
      description: 'Apportez une touche contemporaine et élégante à votre intérieur avec la chaise INAYA, au design baguette épuré et moderne. Sa structure solide en métal noir mat assure une excellente stabilité tout en apportant une note industrielle chic à votre pièce.',
      variants: [
        {
          id: 'decora-variant-DC11PNNCHMO-DH',
          title: 'Moka - Tissu chenille',
          price: 99,
          compareAtPrice: 149,
          availableForSale: true,
          quantityAvailable: 100,
          selectedOptions: [
            { name: 'Couleur', value: 'Moka' },
            { name: 'Matériau', value: 'Tissu chenille' }
          ]
        }
      ]
    }
  ];
}