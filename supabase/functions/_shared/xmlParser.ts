/**
 * Parser pour le feed XML Shopify
 */

export interface ShopifyProduct {
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

export interface ProductVariant {
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

export async function parseShopifyXMLFeed(): Promise<ShopifyProduct[]> {
  const feedUrl = 'https://feeds.litcommerce.com/87bfc1792445d9eac1f612f3837fdbae636da9e11df97ab859bb9ee7e114fa5c.xml';
  
  try {
    console.log('🔄 Récupération du feed XML Shopify...');
    
    const response = await fetch(feedUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; OmnIA-Bot/1.0)',
        'Accept': 'application/xml, text/xml, */*'
      }
    });

    if (!response.ok) {
      throw new Error(`Erreur HTTP: ${response.status}`);
    }

    const xmlText = await response.text();
    console.log('✅ Feed XML récupéré, taille:', xmlText.length);

    // Parser le XML (utilisation d'une approche simple avec regex pour Deno)
    const products = parseXMLProducts(xmlText);
    console.log('📦 Produits parsés:', products.length);

    return products;
  } catch (error) {
    console.error('❌ Erreur parsing XML feed:', error);
    return getFallbackProducts();
  }
}

function parseXMLProducts(xmlText: string): ShopifyProduct[] {
  const products: ShopifyProduct[] = [];
  
  // Regex pour extraire les items du feed
  const itemRegex = /<item>([\s\S]*?)<\/item>/g;
  let itemMatch;
  
  while ((itemMatch = itemRegex.exec(xmlText)) !== null) {
    const itemXML = itemMatch[1];
    
    try {
      const product = parseProductFromXML(itemXML);
      if (product) {
        products.push(product);
      }
    } catch (error) {
      console.warn('⚠️ Erreur parsing produit:', error);
    }
  }
  
  return products;
}

function parseProductFromXML(itemXML: string): ShopifyProduct | null {
  try {
    // Fonctions helper pour extraire les données
    const extractValue = (tag: string): string => {
      const regex = new RegExp(`<${tag}[^>]*>([\\s\\S]*?)<\\/${tag}>`, 'i');
      const match = itemXML.match(regex);
      return match ? match[1].trim().replace(/<!\[CDATA\[(.*?)\]\]>/g, '$1') : '';
    };

    const extractAttribute = (tag: string, attr: string): string => {
      const regex = new RegExp(`<${tag}[^>]*${attr}="([^"]*)"`, 'i');
      const match = itemXML.match(regex);
      return match ? match[1] : '';
    };

    // Extraction des données principales
    const title = extractValue('title');
    const description = extractValue('description');
    const link = extractValue('link');
    const imageUrl = extractValue('g:image_link') || extractValue('image_link');
    const price = parseFloat(extractValue('g:price')?.replace(/[^\d.,]/g, '').replace(',', '.') || '0');
    const compareAtPrice = parseFloat(extractValue('g:sale_price')?.replace(/[^\d.,]/g, '').replace(',', '.') || '0');
    const availability = extractValue('g:availability') || extractValue('availability');
    const productType = extractValue('g:product_type') || extractValue('product_type');
    const brand = extractValue('g:brand') || extractValue('brand');
    const gtin = extractValue('g:gtin') || extractValue('gtin');
    const condition = extractValue('g:condition') || extractValue('condition');

    if (!title || !link) {
      return null;
    }

    // Générer un ID unique
    const id = `shopify-${gtin || title.toLowerCase().replace(/[^a-z0-9]/g, '-')}`;
    const handle = link.split('/').pop() || title.toLowerCase().replace(/[^a-z0-9]/g, '-');

    // Extraire les tags depuis le titre et la description
    const tags = extractTags(title, description, productType);

    // Créer le produit
    const product: ShopifyProduct = {
      id,
      handle,
      title,
      productType: productType || 'Mobilier',
      vendor: brand || 'Decora Home',
      tags,
      price: compareAtPrice > 0 ? compareAtPrice : price,
      compareAtPrice: compareAtPrice > 0 && compareAtPrice < price ? price : undefined,
      availableForSale: availability.toLowerCase().includes('in stock') || availability.toLowerCase().includes('disponible'),
      quantityAvailable: availability.toLowerCase().includes('in stock') ? 100 : 0,
      image_url: imageUrl || 'https://images.pexels.com/photos/1350789/pexels-photo-1350789.jpeg',
      product_url: link,
      description: description || title,
      variants: [{
        id: `${id}-default`,
        title: 'Default',
        price: compareAtPrice > 0 ? compareAtPrice : price,
        compareAtPrice: compareAtPrice > 0 && compareAtPrice < price ? price : undefined,
        availableForSale: availability.toLowerCase().includes('in stock') || availability.toLowerCase().includes('disponible'),
        quantityAvailable: availability.toLowerCase().includes('in stock') ? 100 : 0,
        selectedOptions: [
          { name: 'Condition', value: condition || 'Neuf' }
        ]
      }]
    };

    return product;
  } catch (error) {
    console.error('❌ Erreur parsing produit XML:', error);
    return null;
  }
}

function extractTags(title: string, description: string, productType: string): string[] {
  const text = `${title} ${description} ${productType}`.toLowerCase();
  const tags = new Set<string>();

  // Matériaux
  const materials = [
    'chêne', 'hêtre', 'pin', 'teck', 'noyer', 'érable', 'acajou', 'bambou',
    'bois massif', 'contreplaqué', 'mdf', 'acier', 'inox', 'aluminium',
    'fer', 'laiton', 'cuivre', 'chrome', 'marbre', 'travertin', 'granit',
    'coton', 'lin', 'velours', 'cuir', 'tissu', 'polyester', 'verre',
    'céramique', 'plastique', 'résine', 'rotin', 'osier'
  ];

  // Couleurs
  const colors = [
    'blanc', 'noir', 'gris', 'beige', 'marron', 'rouge', 'bleu', 'vert',
    'jaune', 'orange', 'rose', 'violet', 'crème', 'naturel', 'anthracite',
    'taupe', 'ivoire'
  ];

  // Styles
  const styles = [
    'moderne', 'contemporain', 'vintage', 'industriel', 'scandinave',
    'rustique', 'classique', 'minimaliste', 'baroque'
  ];

  // Fonctionnalités
  const features = [
    'convertible', 'réversible', 'angle', 'coffre', 'rangement',
    'tiroir', 'étagère', 'roulettes', 'pliable', 'extensible'
  ];

  // Ajouter les tags trouvés
  [...materials, ...colors, ...styles, ...features].forEach(keyword => {
    if (text.includes(keyword)) {
      tags.add(keyword);
    }
  });

  return Array.from(tags);
}

function getFallbackProducts(): ShopifyProduct[] {
  return [
    {
      id: 'fallback-meuble-tv-chene',
      handle: 'meuble-tv-chene-120cm',
      title: 'Meuble TV en chêne massif 120cm',
      productType: 'Meuble TV',
      vendor: 'Decora Home',
      tags: ['chêne', 'massif', 'naturel', '120cm'],
      price: 299,
      compareAtPrice: 399,
      availableForSale: true,
      quantityAvailable: 50,
      image_url: 'https://images.pexels.com/photos/6969831/pexels-photo-6969831.jpeg',
      product_url: '#',
      description: 'Meuble TV en chêne massif avec 2 tiroirs et 1 niche ouverte',
      variants: [{
        id: 'variant-chene-120',
        title: 'Chêne 120cm',
        price: 299,
        compareAtPrice: 399,
        availableForSale: true,
        quantityAvailable: 50,
        selectedOptions: [
          { name: 'Matériau', value: 'Chêne massif' },
          { name: 'Taille', value: '120cm' }
        ]
      }]
    },
    {
      id: 'fallback-meuble-tv-blanc',
      handle: 'meuble-tv-blanc-150cm',
      title: 'Meuble TV blanc laqué 150cm',
      productType: 'Meuble TV',
      vendor: 'Decora Home',
      tags: ['blanc', 'laqué', 'moderne', '150cm'],
      price: 249,
      compareAtPrice: 349,
      availableForSale: true,
      quantityAvailable: 30,
      image_url: 'https://images.pexels.com/photos/6969831/pexels-photo-6969831.jpeg',
      product_url: '#',
      description: 'Meuble TV blanc laqué brillant avec rangements fermés',
      variants: [{
        id: 'variant-blanc-150',
        title: 'Blanc 150cm',
        price: 249,
        compareAtPrice: 349,
        availableForSale: true,
        quantityAvailable: 30,
        selectedOptions: [
          { name: 'Couleur', value: 'Blanc' },
          { name: 'Taille', value: '150cm' }
        ]
      }]
    }
  ];
}