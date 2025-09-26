/**
 * Cache quotidien pour le feed XML Shopify
 */

export interface CachedFeed {
  products: any[];
  lastUpdated: string;
  feedUrl: string;
}

const CACHE_KEY = 'shopify_xml_feed_cache';
const CACHE_DURATION = 24 * 60 * 60 * 1000; // 24 heures en millisecondes
const FEED_URL = 'https://feeds.litcommerce.com/87bfc1792445d9eac1f612f3837fdbae636da9e11df97ab859bb9ee7e114fa5c.xml';

// Simuler un cache simple avec une variable globale
let globalCache: CachedFeed | null = null;

export async function getCachedFeed(): Promise<any[]> {
  console.log('🔍 Vérification du cache feed XML...');
  
  // Vérifier si le cache existe et est valide
  if (globalCache && isCacheValid(globalCache)) {
    console.log('✅ Cache valide trouvé, utilisation des données en cache');
    return globalCache.products;
  }
  
  console.log('🔄 Cache expiré ou inexistant, récupération du feed...');
  
  try {
    const products = await fetchAndParseXMLFeed();
    
    // Mettre à jour le cache
    globalCache = {
      products,
      lastUpdated: new Date().toISOString(),
      feedUrl: FEED_URL
    };
    
    console.log(`✅ Feed mis en cache avec ${products.length} produits`);
    return products;
    
  } catch (error) {
    console.error('❌ Erreur récupération feed:', error);
    
    // Retourner le cache même expiré si disponible
    if (globalCache) {
      console.log('⚠️ Utilisation du cache expiré en fallback');
      return globalCache.products;
    }
    
    // Dernier recours : produits de fallback
    console.log('🔄 Utilisation des produits de fallback');
    return getFallbackProducts();
  }
}

function isCacheValid(cache: CachedFeed): boolean {
  const now = new Date().getTime();
  const cacheTime = new Date(cache.lastUpdated).getTime();
  const isValid = (now - cacheTime) < CACHE_DURATION;
  
  console.log(`📅 Cache créé: ${cache.lastUpdated}, Valide: ${isValid}`);
  return isValid;
}

async function fetchAndParseXMLFeed(): Promise<any[]> {
  console.log('📡 Récupération du feed XML depuis:', FEED_URL);
  
  const response = await fetch(FEED_URL, {
    headers: {
      'User-Agent': 'Mozilla/5.0 (compatible; OmnIA-Bot/1.0)',
      'Accept': 'application/xml, text/xml, */*',
      'Cache-Control': 'no-cache'
    }
  });

  if (!response.ok) {
    throw new Error(`Erreur HTTP: ${response.status} ${response.statusText}`);
  }

  const xmlText = await response.text();
  console.log(`📄 XML récupéré, taille: ${xmlText.length} caractères`);

  if (xmlText.length < 100) {
    throw new Error('Feed XML trop petit, probablement invalide');
  }

  const products = parseXMLProducts(xmlText);
  console.log(`📦 ${products.length} produits parsés depuis le feed`);
  
  return products;
}

function parseXMLProducts(xmlText: string): any[] {
  const products: any[] = [];
  
  try {
    // Regex pour extraire les items du feed
    const itemRegex = /<item>([\s\S]*?)<\/item>/g;
    let itemMatch;
    let itemCount = 0;
    
    while ((itemMatch = itemRegex.exec(xmlText)) !== null && itemCount < 100) {
      const itemXML = itemMatch[1];
      
      try {
        const product = parseProductFromXML(itemXML);
        if (product) {
          products.push(product);
          itemCount++;
        }
      } catch (error) {
        console.warn('⚠️ Erreur parsing produit:', error);
      }
    }
    
    console.log(`✅ ${products.length} produits parsés avec succès`);
    return products;
    
  } catch (error) {
    console.error('❌ Erreur parsing XML:', error);
    throw error;
  }
}

function parseProductFromXML(itemXML: string): any | null {
  try {
    // Fonctions helper pour extraire les données
    const extractValue = (tag: string): string => {
      const regex = new RegExp(`<${tag}[^>]*>([\\s\\S]*?)<\\/${tag}>`, 'i');
      const match = itemXML.match(regex);
      return match ? match[1].trim().replace(/<!\[CDATA\[(.*?)\]\]>/g, '$1') : '';
    };

    // Extraction des données principales
    const title = extractValue('title');
    const description = extractValue('description');
    const link = extractValue('link');
    const imageUrl = extractValue('g:image_link') || extractValue('image_link');
    const priceText = extractValue('g:price') || extractValue('price');
    const salePriceText = extractValue('g:sale_price') || extractValue('sale_price');
    const availability = extractValue('g:availability') || extractValue('availability');
    const productType = extractValue('g:product_type') || extractValue('product_type');
    const brand = extractValue('g:brand') || extractValue('brand');
    const gtin = extractValue('g:gtin') || extractValue('gtin');

    if (!title || !link) {
      console.log('⚠️ Produit ignoré - titre ou lien manquant');
      return null;
    }

    // Parser les prix
    const price = parseFloat(priceText.replace(/[^\d.,]/g, '').replace(',', '.')) || 0;
    const salePrice = parseFloat(salePriceText.replace(/[^\d.,]/g, '').replace(',', '.')) || 0;

    // Générer un ID unique
    const id = `feed-${gtin || title.toLowerCase().replace(/[^a-z0-9]/g, '-').substring(0, 50)}`;
    const handle = link.split('/').pop() || title.toLowerCase().replace(/[^a-z0-9]/g, '-');

    // Extraire les tags depuis le titre et la description
    const tags = extractTags(title, description, productType);

    // Déterminer le type de produit
    const finalProductType = determineProductType(title, description, productType);

    console.log('📦 Produit parsé:', {
      title: title.substring(0, 50),
      productType: finalProductType,
      price: salePrice > 0 ? salePrice : price,
      tags: tags.slice(0, 3)
    });
    // Créer le produit
    const product = {
      id,
      handle,
      title: title.substring(0, 100), // Limiter la longueur
      productType: finalProductType,
      vendor: brand || 'Decora Home',
      tags,
      price: salePrice > 0 ? salePrice : price,
      compareAtPrice: salePrice > 0 && salePrice < price ? price : undefined,
      availableForSale: availability.toLowerCase().includes('in stock') || 
                       availability.toLowerCase().includes('disponible') ||
                       availability.toLowerCase().includes('available'),
      quantityAvailable: availability.toLowerCase().includes('in stock') ? 100 : 0,
      image_url: imageUrl || 'https://images.pexels.com/photos/1350789/pexels-photo-1350789.jpeg',
      product_url: link,
      description: description.substring(0, 500) || title, // Limiter la longueur
      variants: [{
        id: `${id}-default`,
        title: 'Default',
        price: salePrice > 0 ? salePrice : price,
        compareAtPrice: salePrice > 0 && salePrice < price ? price : undefined,
        availableForSale: availability.toLowerCase().includes('in stock') || 
                         availability.toLowerCase().includes('disponible'),
        quantityAvailable: availability.toLowerCase().includes('in stock') ? 100 : 0,
        selectedOptions: [
          { name: 'Condition', value: 'Neuf' }
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
    'céramique', 'plastique', 'résine', 'rotin', 'osier', 'métal'
  ];

  // Couleurs
  const colors = [
    'blanc', 'noir', 'gris', 'beige', 'marron', 'rouge', 'bleu', 'vert',
    'jaune', 'orange', 'rose', 'violet', 'crème', 'naturel', 'anthracite',
    'taupe', 'ivoire', 'moka'
  ];

  // Styles et fonctionnalités
  const features = [
    'moderne', 'contemporain', 'vintage', 'industriel', 'scandinave',
    'convertible', 'réversible', 'angle', 'coffre', 'rangement',
    'tiroir', 'étagère', 'roulettes', 'pliable', 'extensible'
  ];

  // Ajouter les tags trouvés
  [...materials, ...colors, ...features].forEach(keyword => {
    if (text.includes(keyword)) {
      tags.add(keyword);
    }
  });

  return Array.from(tags);
}

function determineProductType(title: string, description: string, productType: string): string {
  const text = `${title} ${description} ${productType}`.toLowerCase();
  
  // Détection par mots-clés
  if (text.includes('meuble tv') || text.includes('meuble télé') || 
      text.includes('tv') || text.includes('télé') || text.includes('console tv')) {
    return 'Meuble TV';
  }
  
  if (text.includes('canapé') || text.includes('sofa')) {
    return 'Canapé';
  }
  
  if (text.includes('table') && (text.includes('manger') || text.includes('repas'))) {
    return 'Table';
  }
  
  if (text.includes('chaise') || text.includes('siège')) {
    return 'Chaise';
  }
  
  if (text.includes('lit') || text.includes('matelas')) {
    return 'Lit';
  }
  
  if (text.includes('armoire') || text.includes('dressing')) {
    return 'Rangement';
  }
  
  return productType || 'Mobilier';
}

function getFallbackProducts(): any[] {
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

// Fonction pour forcer la mise à jour du cache
export async function refreshFeedCache(): Promise<any[]> {
  console.log('🔄 Mise à jour forcée du cache feed...');
  globalCache = null; // Invalider le cache
  return await getCachedFeed();
}

// Fonction pour obtenir les stats du cache
export function getCacheStats(): { hasCache: boolean; lastUpdated?: string; productCount?: number } {
  if (!globalCache) {
    return { hasCache: false };
  }
  
  return {
    hasCache: true,
    lastUpdated: globalCache.lastUpdated,
    productCount: globalCache.products.length
  };
}