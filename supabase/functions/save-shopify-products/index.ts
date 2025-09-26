const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
};

import { createClient } from 'npm:@supabase/supabase-js@2';

interface SaveProductsRequest {
  products: any[];
  shop_domain: string;
  shop_info: any;
  retailer_id: string;
}

// Fonction pour extraire l'URL d'image principale
function extractImageUrl(product: any): string {
  console.log('🖼️ Extraction image pour:', product.title?.substring(0, 30));
  console.log('🖼️ Sources disponibles:', {
    images_array: product.images?.length || 0,
    featured_image: !!product.featuredImage?.url,
    image_src: !!product.image?.src,
    direct_image_url: !!product.image_url
  });
  
  // Priorité des sources d'images
  const imageSources = [
    product.images?.[0]?.src,
    product.featuredImage?.url,
    product.image?.src,
    product.featured_image,
    product.image_url
  ];
  
  for (const imageUrl of imageSources) {
    if (imageUrl && typeof imageUrl === 'string' && imageUrl.startsWith('http')) {
      console.log('✅ Image trouvée:', imageUrl.substring(0, 50) + '...');
      return imageUrl;
    }
  }
  
  console.log('⚠️ Aucune image valide trouvée, utilisation image par défaut');
  // Image par défaut si aucune trouvée
  return 'https://images.pexels.com/photos/1350789/pexels-photo-1350789.jpeg?auto=compress&cs=tinysrgb&w=400&h=400&fit=crop';
}

// Fonction pour extraire toutes les images
function extractAllImages(product: any): string[] {
  const allImages = [];
  
  // Images depuis le tableau images
  if (product.images && Array.isArray(product.images)) {
    product.images.forEach((img: any) => {
      if (img.src && typeof img.src === 'string' && img.src.startsWith('http')) {
        allImages.push(img.src);
      }
    });
  }
  
  // Image featured
  if (product.featuredImage?.url) {
    allImages.push(product.featuredImage.url);
  }
  
  return [...new Set(allImages)]; // Supprimer les doublons
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, {
      status: 200,
      headers: corsHeaders,
    });
  }

  try {
    const { products, shop_domain, shop_info, retailer_id }: SaveProductsRequest = await req.json();
    
    console.log('💾 Sauvegarde produits Shopify:', {
      // Validate retailer_id as UUID
      const isRetailerIdUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(retailer_id);
      if (retailer_id && !isRetailerIdUuid) {
        return new Response(
          JSON.stringify({
            success: false,
            error: 'Invalid retailer_id format. Must be a valid UUID.',
            details: `Received retailer_id: ${retailer_id}`
          }),
          {
            status: 400,
            headers: { 'Content-Type': 'application/json', ...corsHeaders }
          }
        );
      }
      products_count: products.length,
      shop_domain,
      retailer_id
    });

    // Initialize Supabase
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Transform products for database
    const transformedProducts = products.map((product: any) => {
      const firstVariant = product.variants?.[0] || {};
      
      // Nettoyer et extraire la description
      const cleanDescription = product.body_html 
        ? product.body_html.replace(/<[^>]*>/g, '').replace(/&[^;]+;/g, ' ').trim()
        : (product.description || '');
      
      // Extraire les attributs enrichis depuis la description
      const extractedAttributes = extractEnhancedAttributes(product.title, cleanDescription, product.product_type);
      
      return {
        external_id: product.id?.toString() || `shopify-${Date.now()}-${Math.random()}`,
        retailer_id: retailer_id,
        name: product.title || 'Produit sans nom',
        description: cleanDescription.substring(0, 2000), // Plus de description
        price: firstVariant.price ? parseFloat(firstVariant.price) : 0,
        compare_at_price: firstVariant.compare_at_price ? parseFloat(firstVariant.compare_at_price) : undefined,
        category: product.productType || product.product_type || 'Mobilier',
        vendor: product.vendor || shop_info?.name || shop_domain.replace('.myshopify.com', ''),
        image_url: extractImageUrl(product),
        product_url: `https://${shop_domain}/products/${product.handle}`,
        stock: firstVariant.inventory_quantity || 0,
        source_platform: 'shopify',
        status: product.status === 'active' ? 'active' : 'inactive',
        extracted_attributes: extractedAttributes || {},
        shopify_data: {
          handle: product.handle,
          shopify_id: product.id,
          variants: product.variants || [],
          tags: product.tags || [],
          images: product.images || [],
          created_at: product.created_at,
          updated_at: product.updated_at,
          sku: firstVariant.sku || '',
          inventory_management: firstVariant.inventory_management || 'shopify',
          all_images: extractAllImages(product)
        }
      };
    });

    console.log('🔄 Insertion en base de données...');

    // Insert products into database
    const { data: insertedProducts, error: insertError } = await supabase
      .from('imported_products')
      .upsert(transformedProducts, { 
        onConflict: 'retailer_id,external_id,source_platform',
        ignoreDuplicates: false 
      })
      .select();

    if (insertError) {
      console.error('❌ Erreur insertion DB:', insertError);
      throw new Error(`Erreur base de données: ${insertError.message}`);
    }

    console.log('✅ Produits sauvegardés en DB:', insertedProducts?.length || 0);

    return new Response(
      JSON.stringify({
        success: true,
        message: `${insertedProducts?.length || 0} produits Shopify sauvegardés avec succès`,
        saved_count: insertedProducts?.length || 0,
        products: insertedProducts || []
      }),
      {
        headers: {
          'Content-Type': 'application/json',
          ...corsHeaders,
        },
      }
    );

  } catch (error) {
    console.error('❌ Erreur sauvegarde produits:', error);
    
    return new Response(
      JSON.stringify({
        success: false,
        error: 'Erreur lors de la sauvegarde des produits',
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

// Fonction d'extraction d'attributs enrichie
function extractEnhancedAttributes(title: string, description: string, productType: string) {
  const text = `${title} ${description}`.toLowerCase();
  const attributes: any = {
    colors: [],
    materials: [],
    dimensions: {},
    styles: [],
    features: [],
    room: [],
    categories: [],
    fabric_type: [],
    wood_type: [],
    metal_type: [],
    stone_type: [],
    finish_type: [],
    hardware_type: [],
    seating_capacity: 0,
    weight_capacity: '',
    assembly_time: '',
    comfort_level: [],
    assembly_required: false,
    warranty: '',
    care_instructions: [],
    certifications: [],
    origin_country: '',
    brand_collection: ''
  };

  // 🎨 COULEURS ENRICHIES
  const colorPatterns = [
    { name: 'blanc', patterns: ['blanc', 'white', 'ivoire', 'crème', 'cream', 'écru', 'cassé'] },
    { name: 'noir', patterns: ['noir', 'black', 'anthracite', 'charbon', 'ébène', 'jais'] },
    { name: 'gris', patterns: ['gris', 'grey', 'gray', 'argent', 'silver', 'platine', 'acier'] },
    { name: 'beige', patterns: ['beige', 'sable', 'sand', 'lin', 'écru', 'naturel', 'nude'] },
    { name: 'marron', patterns: ['marron', 'brown', 'chocolat', 'café', 'moka', 'cognac', 'caramel', 'noisette'] },
    { name: 'bleu', patterns: ['bleu', 'blue', 'marine', 'navy', 'cobalt', 'turquoise', 'cyan', 'azur', 'indigo'] },
    { name: 'vert', patterns: ['vert', 'green', 'olive', 'sauge', 'menthe', 'émeraude', 'jade', 'kaki'] },
    { name: 'rouge', patterns: ['rouge', 'red', 'bordeaux', 'cerise', 'carmin', 'vermillon', 'grenat'] },
    { name: 'jaune', patterns: ['jaune', 'yellow', 'moutarde', 'citron', 'or', 'gold', 'ocre'] },
    { name: 'orange', patterns: ['orange', 'corail', 'abricot', 'mandarine', 'cuivre', 'rouille'] },
    { name: 'rose', patterns: ['rose', 'pink', 'fuchsia', 'magenta', 'saumon', 'poudré'] },
    { name: 'violet', patterns: ['violet', 'purple', 'mauve', 'lilas', 'prune', 'aubergine'] },
    { name: 'chêne', patterns: ['chêne', 'oak', 'chêne clair', 'chêne foncé', 'chêne naturel'] },
    { name: 'noyer', patterns: ['noyer', 'walnut', 'noyer américain', 'noyer européen'] },
    { name: 'teck', patterns: ['teck', 'teak'] },
    { name: 'taupe', patterns: ['taupe', 'greige', 'mushroom'] },
    { name: 'doré', patterns: ['doré', 'gold', 'laiton', 'brass'] },
    { name: 'argenté', patterns: ['argenté', 'silver', 'chrome'] },
    { name: 'cuivré', patterns: ['cuivré', 'copper', 'bronze'] }
  ];
  
  colorPatterns.forEach(({ name, patterns }) => {
    if (patterns.some(pattern => text.includes(pattern))) {
      attributes.colors.push(name);
    }
  });

  // 🏗️ MATÉRIAUX ENRICHIS
  const materialPatterns = [
    // Bois
    { name: 'chêne massif', patterns: ['chêne massif', 'solid oak', 'chêne'] },
    { name: 'hêtre', patterns: ['hêtre', 'beech'] },
    { name: 'pin', patterns: ['pin', 'pine', 'pin massif'] },
    { name: 'teck', patterns: ['teck', 'teak'] },
    { name: 'noyer', patterns: ['noyer', 'walnut'] },
    { name: 'érable', patterns: ['érable', 'maple'] },
    { name: 'acajou', patterns: ['acajou', 'mahogany'] },
    { name: 'bambou', patterns: ['bambou', 'bamboo'] },
    { name: 'bois massif', patterns: ['bois massif', 'solid wood', 'massif'] },
    { name: 'contreplaqué', patterns: ['contreplaqué', 'plywood'] },
    { name: 'MDF', patterns: ['mdf', 'medium density'] },
    { name: 'aggloméré', patterns: ['aggloméré', 'chipboard'] },
    
    // Métaux
    { name: 'acier inoxydable', patterns: ['acier inoxydable', 'inox', 'stainless steel'] },
    { name: 'acier', patterns: ['acier', 'steel'] },
    { name: 'aluminium', patterns: ['aluminium', 'aluminum'] },
    { name: 'fer forgé', patterns: ['fer forgé', 'wrought iron'] },
    { name: 'laiton', patterns: ['laiton', 'brass'] },
    { name: 'cuivre', patterns: ['cuivre', 'copper'] },
    { name: 'chrome', patterns: ['chrome', 'chromé'] },
    { name: 'métal noir', patterns: ['métal noir', 'black metal'] },
    
    // Pierres et minéraux
    { name: 'marbre', patterns: ['marbre', 'marble'] },
    { name: 'travertin', patterns: ['travertin', 'travertine'] },
    { name: 'granit', patterns: ['granit', 'granite'] },
    { name: 'ardoise', patterns: ['ardoise', 'slate'] },
    { name: 'grès cérame', patterns: ['grès cérame', 'ceramic'] },
    { name: 'pierre naturelle', patterns: ['pierre naturelle', 'natural stone'] },
    
    // Textiles
    { name: 'velours côtelé', patterns: ['velours côtelé', 'corduroy velvet'] },
    { name: 'velours', patterns: ['velours', 'velvet'] },
    { name: 'chenille', patterns: ['chenille'] },
    { name: 'lin', patterns: ['lin', 'linen'] },
    { name: 'coton', patterns: ['coton', 'cotton'] },
    { name: 'cuir véritable', patterns: ['cuir véritable', 'genuine leather'] },
    { name: 'cuir', patterns: ['cuir', 'leather'] },
    { name: 'simili cuir', patterns: ['simili cuir', 'faux leather'] },
    { name: 'tissu bouclé', patterns: ['tissu bouclé', 'boucle fabric'] },
    { name: 'polyester', patterns: ['polyester'] },
    
    // Autres
    { name: 'verre trempé', patterns: ['verre trempé', 'tempered glass'] },
    { name: 'verre', patterns: ['verre', 'glass'] },
    { name: 'céramique', patterns: ['céramique', 'ceramic'] },
    { name: 'résine', patterns: ['résine', 'resin'] },
    { name: 'rotin', patterns: ['rotin', 'rattan'] },
    { name: 'osier', patterns: ['osier', 'wicker'] },
    { name: 'plastique', patterns: ['plastique', 'plastic'] }
    { name: 'liège', patterns: ['liège', 'cork'] },
    { name: 'jonc de mer', patterns: ['jonc de mer', 'seagrass'] },
    { name: 'raphia', patterns: ['raphia', 'raffia'] }
  ];
  
  materialPatterns.forEach(({ name, patterns }) => {
    if (patterns.some(pattern => text.includes(pattern))) {
      attributes.materials.push(name);
    }
  });

  // 📏 DIMENSIONS ENRICHIES
  const dimensionPatterns = [
    // Format standard: LxlxH
    { regex: /(\d+(?:[.,]\d+)?)\s*[x×]\s*(\d+(?:[.,]\d+)?)\s*[x×]\s*(\d+(?:[.,]\d+)?)\s*cm/gi, type: 'LxlxH' },
    // Format diamètre
    { regex: /(?:diamètre|ø|diam)\s*:?\s*(\d+(?:[.,]\d+)?)\s*cm/gi, type: 'diameter' },
    // Dimensions séparées
    { regex: /(?:longueur|long|l)\s*:?\s*(\d+(?:[.,]\d+)?)\s*cm/gi, type: 'length' },
    { regex: /(?:largeur|larg|w)\s*:?\s*(\d+(?:[.,]\d+)?)\s*cm/gi, type: 'width' },
    { regex: /(?:hauteur|haut|h)\s*:?\s*(\d+(?:[.,]\d+)?)\s*cm/gi, type: 'height' },
    { regex: /(?:profondeur|prof|p)\s*:?\s*(\d+(?:[.,]\d+)?)\s*cm/gi, type: 'depth' },
    { regex: /(?:épaisseur|épais)\s*:?\s*(\d+(?:[.,]\d+)?)\s*cm/gi, type: 'thickness' }
  ];
  
  dimensionPatterns.forEach(({ regex, type }) => {
    const matches = [...text.matchAll(regex)];
    matches.forEach(match => {
      if (type === 'LxlxH') {
        attributes.dimensions.length = parseFloat(match[1].replace(',', '.'));
        attributes.dimensions.width = parseFloat(match[2].replace(',', '.'));
        attributes.dimensions.height = parseFloat(match[3].replace(',', '.'));
      } else if (type === 'diameter') {
        attributes.dimensions.diameter = parseFloat(match[1].replace(',', '.'));
      } else {
        attributes.dimensions[type] = parseFloat(match[1].replace(',', '.'));
      }
      attributes.dimensions.unit = 'cm';
    });
  });

  // 🎨 STYLES ET DESIGN
  const stylePatterns = [
    'moderne', 'contemporain', 'scandinave', 'industriel', 'vintage', 'rustique',
    'classique', 'minimaliste', 'bohème', 'baroque', 'art déco', 'colonial',
    'provençal', 'shabby chic', 'design', 'épuré', 'tendance', 'chic'
  ];
  
  stylePatterns.forEach(style => {
    if (text.includes(style)) {
      attributes.styles.push(style);
    }
  });

  // 🏠 PIÈCES ET USAGE
  const roomPatterns = [
    'salon', 'living', 'séjour', 'chambre', 'bedroom', 'cuisine', 'kitchen',
    'bureau', 'office', 'salle à manger', 'dining', 'entrée', 'entrance',
    'terrasse', 'jardin', 'extérieur', 'balcon', 'véranda'
  ];
  
  roomPatterns.forEach(room => {
    if (text.includes(room)) {
      attributes.room.push(room);
    }
  });

  // ⚙️ FONCTIONNALITÉS
  const featurePatterns = [
    'convertible', 'réversible', 'pliable', 'extensible', 'modulaire',
    'rangement', 'coffre', 'tiroir', 'étagère', 'niche',
    'roulettes', 'pivotant', 'réglable', 'inclinable',
    'déhoussable', 'lavable', 'imperméable', 'résistant',
    'empilable', 'gigogne', 'escamotable'
  ];
  
  featurePatterns.forEach(feature => {
    if (text.includes(feature)) {
      attributes.features.push(feature);
    }
  });

  // 🛋️ CATÉGORIES SPÉCIFIQUES
  const categoryPatterns = [
    { name: 'Canapé d\'angle', patterns: ['canapé d\'angle', 'angle', 'corner sofa'] },
    { name: 'Canapé convertible', patterns: ['canapé convertible', 'convertible', 'canapé lit'] },
    { name: 'Canapé fixe', patterns: ['canapé fixe', 'canapé droit'] },
    { name: 'Fauteuil', patterns: ['fauteuil', 'armchair'] },
    { name: 'Chaise de bureau', patterns: ['chaise de bureau', 'office chair', 'bureau'] },
    { name: 'Tabouret de bar', patterns: ['tabouret de bar', 'bar stool'] },
    { name: 'Table basse', patterns: ['table basse', 'coffee table'] },
    { name: 'Table à manger', patterns: ['table à manger', 'dining table', 'table repas'] },
    { name: 'Console', patterns: ['console', 'console table'] },
    { name: 'Meuble TV', patterns: ['meuble tv', 'tv stand', 'meuble télé'] },
    { name: 'Bibliothèque', patterns: ['bibliothèque', 'bookcase', 'étagère'] },
    { name: 'Commode', patterns: ['commode', 'chest of drawers'] },
    { name: 'Armoire', patterns: ['armoire', 'wardrobe', 'penderie'] },
    { name: 'Lit double', patterns: ['lit double', 'double bed', '140x190', '160x200'] },
    { name: 'Lit simple', patterns: ['lit simple', 'single bed', '90x190'] }
  ];
  
  categoryPatterns.forEach(({ name, patterns }) => {
    if (patterns.some(pattern => text.includes(pattern))) {
      attributes.categories.push(name);
    }
  });

  // 🧵 TYPES DE TISSUS
  const fabricPatterns = [
    'velours côtelé', 'velours lisse', 'chenille', 'bouclé', 'jacquard',
    'lin lavé', 'coton bio', 'microfibre', 'polyester', 'viscose',
    'cuir pleine fleur', 'cuir nappa', 'cuir vieilli'
  ];
  
  fabricPatterns.forEach(fabric => {
    if (text.includes(fabric)) {
      attributes.fabric_type.push(fabric);
    }
  });

  // 🌳 TYPES DE BOIS
  const woodPatterns = [
    'chêne massif', 'chêne clair', 'chêne foncé', 'hêtre massif',
    'pin massif', 'teck massif', 'noyer massif', 'frêne',
    'bouleau', 'merisier', 'orme', 'châtaignier'
  ];
  
  woodPatterns.forEach(wood => {
    if (text.includes(wood)) {
      attributes.wood_type.push(wood);
    }
  });

  // 🔩 TYPES DE MÉTAL
  const metalPatterns = [
    'acier inoxydable', 'acier laqué', 'aluminium brossé',
    'fer forgé', 'laiton brossé', 'cuivre patiné',
    'métal noir mat', 'métal doré', 'chrome brillant'
  ];
  
  metalPatterns.forEach(metal => {
    if (text.includes(metal)) {
      attributes.metal_type.push(metal);
    }
  });

  // 🪨 TYPES DE PIERRE
  const stonePatterns = [
    'travertin naturel', 'marbre blanc', 'marbre noir',
    'granit poli', 'ardoise naturelle', 'grès cérame'
  ];
  
  stonePatterns.forEach(stone => {
    if (text.includes(stone)) {
      attributes.stone_type.push(stone);
    }
  });

  // 😌 NIVEAU DE CONFORT
  const comfortPatterns = [
    'très confortable', 'confortable', 'ergonomique', 'moelleux',
    'ferme', 'souple', 'rembourré', 'capitonné'
  ];
  
  comfortPatterns.forEach(comfort => {
    if (text.includes(comfort)) {
      attributes.comfort_level.push(comfort);
    }
  });

  // 🔧 MONTAGE
  if (text.includes('montage') || text.includes('assemblage') || text.includes('assembly')) {
    attributes.assembly_required = true;
  }

  // 🛡️ GARANTIE
  const warrantyMatch = text.match(/(?:garantie|warranty)\s*:?\s*(\d+)\s*(ans?|years?|mois|months?)/i);
  if (warrantyMatch) {
    const duration = warrantyMatch[1];
    const unit = warrantyMatch[2].toLowerCase();
    const unitFr = unit.includes('an') || unit.includes('year') ? 'ans' : 'mois';
    attributes.warranty = `${duration} ${unitFr}`;
  }

  // 🧽 ENTRETIEN
  const carePatterns = [
    'nettoyage à sec', 'lavable en machine', 'dépoussiérage',
    'éviter l\'humidité', 'protection solaire', 'déhoussable'
  ];
  
  carePatterns.forEach(care => {
    if (text.includes(care)) {
      attributes.care_instructions.push(care);
    }
  });

  // 🎨 FINITIONS
  const finishPatterns = [
    'laqué', 'mat', 'brillant', 'satiné', 'brossé', 'patiné',
    'vieilli', 'cérusé', 'huilé', 'ciré', 'vernis', 'brut'
  ];
  
  finishPatterns.forEach(finish => {
    if (text.includes(finish)) {
      attributes.finish_type.push(finish);
    }
  });

  // 🔩 QUINCAILLERIE
  const hardwarePatterns = [
    'poignées acier', 'boutons laiton', 'charnières invisibles',
    'rails coulissants', 'fermeture douce', 'push-pull'
  ];
  
  hardwarePatterns.forEach(hardware => {
    if (text.includes(hardware)) {
      attributes.hardware_type.push(hardware);
    }
  });

  // 👥 CAPACITÉ D'ASSISE
  const seatingMatch = text.match(/(\d+)\s*(?:places?|seats?|personnes?)/i);
  if (seatingMatch) {
    attributes.seating_capacity = parseInt(seatingMatch[1]);
  }

  // ⚖️ CAPACITÉ DE POIDS
  const weightCapacityMatch = text.match(/(?:supporte|capacity|charge)\s*:?\s*(\d+)\s*kg/i);
  if (weightCapacityMatch) {
    attributes.weight_capacity = `${weightCapacityMatch[1]} kg`;
  }

  // 🔧 TEMPS DE MONTAGE
  const assemblyTimeMatch = text.match(/(?:montage|assembly)\s*:?\s*(\d+)\s*(?:min|minutes?|h|heures?)/i);
  if (assemblyTimeMatch) {
    const duration = assemblyTimeMatch[1];
    const unit = assemblyTimeMatch[0].includes('h') ? 'h' : 'min';
    attributes.assembly_time = `${duration} ${unit}`;
  }

  // 🏆 CERTIFICATIONS
  const certificationPatterns = [
    'fsc', 'pefc', 'greenguard', 'oeko-tex', 'cradle to cradle',
    'ecolabel', 'nf environnement', 'ce', 'iso 14001'
  ];
  
  certificationPatterns.forEach(cert => {
    if (text.includes(cert)) {
      attributes.certifications.push(cert.toUpperCase());
    }
  });

  // 🌍 PAYS D'ORIGINE
  const originPatterns = [
    { name: 'France', patterns: ['france', 'français', 'made in france'] },
    { name: 'Italie', patterns: ['italie', 'italien', 'made in italy'] },
    { name: 'Allemagne', patterns: ['allemagne', 'allemand', 'made in germany'] },
    { name: 'Danemark', patterns: ['danemark', 'danois', 'made in denmark'] },
    { name: 'Suède', patterns: ['suède', 'suédois', 'made in sweden'] },
    { name: 'Chine', patterns: ['chine', 'chinois', 'made in china'] }
  ];
  
  originPatterns.forEach(({ name, patterns }) => {
    if (patterns.some(pattern => text.includes(pattern))) {
      attributes.origin_country = name;
    }
  });

  // 🏷️ COLLECTION/GAMME
  const collectionMatch = text.match(/(?:collection|gamme|série)\s*:?\s*([a-zA-ZÀ-ÿ\s]+)/i);
  if (collectionMatch) {
    attributes.brand_collection = collectionMatch[1].trim();
  }

  // Nettoyer les tableaux vides
  Object.keys(attributes).forEach(key => {
    if (Array.isArray(attributes[key]) && attributes[key].length === 0) {
      delete attributes[key];
    }
  });

  return attributes;
}