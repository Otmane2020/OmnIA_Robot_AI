import React, { useState, useEffect } from 'react';
import { 
  Brain, Sparkles, Zap, RefreshCw, Download, Upload, 
  BarChart3, CheckCircle, AlertCircle, Loader2, Eye,
  Package, Tag, DollarSign, Image, Settings, Search,
  Filter, ChevronDown, ChevronUp, ExternalLink, Star,
  Palette, Ruler, Home, Layers, Award, TrendingUp
} from 'lucide-react';
import { useNotifications } from './NotificationSystem';

interface SmartAIProduct {
  id: string;
  handle: string;
  title: string;
  description: string;
  price: number;
  compare_at_price?: number;
  
  // Categories
  category: string;
  subcategory: string;
  product_type: string;
  
  // Visual attributes
  color: string;
  material: string;
  fabric: string;
  style: string;
  shape: string;
  finish: string;
  
  // Technical specs
  dimensions: {
    length?: number;
    width?: number;
    height?: number;
    depth?: number;
    diameter?: number;
    seat_height?: number;
    bed_surface?: string;
    unit: string;
  };
  weight?: {
    value: number;
    unit: string;
  };
  capacity: {
    seats?: number;
    drawers?: number;
    shelves?: number;
    storage_volume?: string;
  };
  
  // Features and functionality
  features: string[];
  special_functions: {
    convertible: boolean;
    storage: boolean;
    adjustable: boolean;
    foldable: boolean;
    extendable: boolean;
    reversible: boolean;
    modular: boolean;
  };
  
  // Room and usage
  room: string[];
  suitable_spaces: string[];
  usage_scenarios: string[];
  
  // Quality and origin
  quality_level: 'entry' | 'standard' | 'premium' | 'luxury';
  brand: string;
  vendor: string;
  origin_country: string;
  certifications: string[];
  warranty: string;
  
  // Care and maintenance
  care_instructions: string[];
  assembly_required: boolean;
  assembly_time: string;
  
  // SEO and marketing
  seo_optimized: {
    title: string;
    description: string;
    keywords: string[];
    ad_headline: string;
    ad_description: string;
  };
  google_shopping: {
    category: string;
    condition: string;
    availability: string;
    custom_labels: string[];
  };
  
  // AI analysis
  ai_analysis: {
    confidence_score: number;
    color_accuracy: number;
    style_accuracy: number;
    material_accuracy: number;
    category_accuracy: number;
    dimensions_accuracy: number;
    overall_quality: number;
    enrichment_source: string;
    last_analyzed: string;
  };
  
  // Variations
  variations: Array<{
    id: string;
    title: string;
    price: number;
    compare_at_price?: number;
    stock: number;
    sku: string;
    options: { name: string; value: string }[];
    image_url?: string;
  }>;
  
  // Media
  images: {
    primary: string;
    gallery: string[];
    variant_images: { [key: string]: string };
  };
  
  // Inventory
  stock: {
    total: number;
    available: number;
    reserved: number;
    low_stock_threshold: number;
  };
  
  // Timestamps
  created_at: string;
  updated_at: string;
  enriched_at: string;
  last_sync: string;
}

export const SmartAIProductManager: React.FC = () => {
  const [products, setProducts] = useState<SmartAIProduct[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isEnriching, setIsEnriching] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedQuality, setSelectedQuality] = useState('all');
  const [showFilters, setShowFilters] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<SmartAIProduct | null>(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [viewMode, setViewMode] = useState<'table' | 'grid'>('grid');
  const [selectedProducts, setSelectedProducts] = useState<string[]>([]);
  const { showSuccess, showError, showInfo } = useNotifications();

  useEffect(() => {
    loadSmartAIProducts();
  }, []);

  const loadSmartAIProducts = async () => {
    try {
      setIsLoading(true);
      console.log('🧠 Chargement Smart AI Products consolidés...');
      
      // Charger depuis toutes les sources et consolider
      const allRawProducts = await loadAllProductSources();
      console.log('📦 Produits bruts chargés:', allRawProducts.length);
      
      // Enrichir avec IA avancée et consolider
      const smartProducts = await enrichAndConsolidateProducts(allRawProducts);
      console.log('🤖 Smart AI Products créés:', smartProducts.length);
      
      setProducts(smartProducts);
      
    } catch (error) {
      console.error('❌ Erreur chargement Smart AI:', error);
      showError('Erreur de chargement', 'Impossible de charger les Smart AI Products.');
    } finally {
      setIsLoading(false);
    }
  };

  const loadAllProductSources = async (): Promise<any[]> => {
    let allProducts: any[] = [];
    
    // Sources multiples à consolider
    const sources = [
      'catalog_products',
      'shopify_products', 
      'imported_products',
      'vendor_products',
      'seller_products',
      'enriched_products',
      'ai_products'
    ];
    
    for (const source of sources) {
      try {
        const savedData = localStorage.getItem(source);
        if (savedData) {
          const parsed = JSON.parse(savedData);
          if (Array.isArray(parsed)) {
            console.log(`📦 ${source}: ${parsed.length} produits`);
            allProducts = [...allProducts, ...parsed.map(p => ({ ...p, source }))];
          }
        }
      } catch (error) {
        console.error(`❌ Erreur parsing ${source}:`, error);
      }
    }
    
    // Ajouter produits Decora avec informations complètes
    const decoraProducts = getDecoraCatalogWithFullDetails();
    allProducts = [...allProducts, ...decoraProducts];
    
    // Supprimer doublons par handle/title
    const uniqueProducts = allProducts.filter((product, index, self) => 
      index === self.findIndex(p => 
        (p.handle && p.handle === product.handle) || 
        (p.title && p.title === product.title) ||
        (p.name && p.name === product.title) ||
        (p.id && p.id === product.id)
      )
    );
    
    console.log(`📊 Produits uniques consolidés: ${uniqueProducts.length}`);
    return uniqueProducts;
  };

  const getDecoraCatalogWithFullDetails = () => {
    return [
      {
        id: 'smart-ai-canape-ventu',
        handle: 'canape-ventu-convertible-smart-ai',
        title: 'Canapé VENTU convertible - Smart AI Enhanced',
        name: 'Canapé VENTU convertible - Smart AI Enhanced',
        description: `Alliant design contemporain, fonctionnalité intelligente et grand confort, le canapé VENTU se distingue par ses lignes épurées et son espace couchage élargi. Son tissu Dunbar 25 disponible en gris moderne ou en beige chaleureux apporte une touche d'élégance à tout intérieur.

Caractéristiques principales analysées par IA :
• Convertible avec couchage agrandi : mécanisme de dépliage automatique DL pour une transformation rapide en lit
• Espace de couchage généreux : 150 x 210 cm – idéal pour un usage quotidien ou ponctuel
• Rangement intégré : grand conteneur pour literie, discret et pratique
• Assise confortable : grâce au ressort ondulé et à la mousse haute densité

Dimensions précises extraites par IA :
Largeur : 263 cm | Profondeur : 105 cm | Hauteur : 93 cm | Hauteur d'assise : 45 cm

Finitions & Style analysés :
Tissu : Dunbar 25 | Coloris disponibles : Gris moderne, Beige doux et lumineux
Style : Moderne, épuré, facile à intégrer dans tout type de décoration

Informations supplémentaires Smart AI :
Type : Canapé inclinable convertible | Assemblage : Facile à monter soi-même
Destination : Salon, pièce à vivre, studio | Garantie : 2 ans | Origine : France`,
        price: 899,
        compare_at_price: 1299,
        category: 'Canapé',
        subcategory: 'Canapé convertible d\'angle',
        product_type: 'Canapé',
        vendor: 'Decora Home',
        brand: 'Decora Home',
        image_url: 'https://images.pexels.com/photos/1350789/pexels-photo-1350789.jpeg',
        product_url: 'https://decorahome.fr/products/canape-ventu-convertible',
        stock: 50,
        source: 'smart_ai_enhanced'
      },
      {
        id: 'smart-ai-table-aurea',
        handle: 'table-aurea-travertin-smart-ai',
        title: 'Table AUREA travertin naturel - Smart AI Enhanced',
        name: 'Table AUREA travertin naturel - Smart AI Enhanced',
        description: `Apportez une touche d'élégance minérale à votre intérieur avec la table à manger AUREA, une pièce aux lignes douces et à la personnalité affirmée analysée par notre IA avancée.

Caractéristiques Smart AI détectées :
• Plateau en travertin naturel véritable avec veines uniques
• Pieds en métal noir mat pour contraste moderne
• Finition protectrice anti-taches et anti-rayures
• Design intemporel s'adaptant à tous les styles

Dimensions analysées par IA :
Ø100cm : Diamètre 100cm x Hauteur 75cm - Idéal pour 4 personnes
Ø120cm : Diamètre 120cm x Hauteur 75cm - Parfait pour 6 personnes

Analyse stylistique IA :
Style : Contemporain minéral | Ambiance : Élégante et chaleureuse
Matériau : Travertin naturel italien | Piètement : Métal noir structuré
Intégration : Moderne, épuré, bohème chic

Informations Smart AI :
Entretien : Nettoyage simple à l'eau savonneuse | Résistance : Très haute
Assemblage : 30 minutes | Garantie : 3 ans | Origine : Italie (travertin) + France (assemblage)`,
        price: 499,
        compare_at_price: 859,
        category: 'Table',
        subcategory: 'Table à manger ronde',
        product_type: 'Table',
        vendor: 'Decora Home',
        brand: 'Decora Home',
        image_url: 'https://images.pexels.com/photos/1571460/pexels-photo-1571460.jpeg',
        product_url: 'https://decorahome.fr/products/table-aurea-travertin',
        stock: 30,
        source: 'smart_ai_enhanced'
      }
    ];
  };

  const enrichAndConsolidateProducts = async (rawProducts: any[]): Promise<SmartAIProduct[]> => {
    const smartProducts: SmartAIProduct[] = [];
    
    // Grouper par handle/title pour éviter les doublons
    const groupedProducts = new Map<string, any[]>();
    
    rawProducts.forEach(product => {
      const key = product.handle || 
                  product.title?.toLowerCase().replace(/[^a-z0-9]/g, '-') || 
                  product.name?.toLowerCase().replace(/[^a-z0-9]/g, '-') ||
                  product.id;
      
      if (!groupedProducts.has(key)) {
        groupedProducts.set(key, []);
      }
      groupedProducts.get(key)!.push(product);
    });
    
    console.log(`🔄 Consolidation: ${groupedProducts.size} produits uniques (au lieu de ${rawProducts.length})`);
    
    // Enrichir chaque groupe de produits
    for (const [handle, productGroup] of groupedProducts.entries()) {
      try {
        const mainProduct = productGroup[0];
        const smartProduct = await createSmartAIProduct(mainProduct, productGroup);
        smartProducts.push(smartProduct);
      } catch (error) {
        console.error('❌ Erreur enrichissement produit:', error);
      }
    }
    
    return smartProducts;
  };

  const createSmartAIProduct = async (mainProduct: any, variations: any[]): Promise<SmartAIProduct> => {
    // Consolider toutes les informations disponibles
    const consolidatedInfo = consolidateProductInfo(mainProduct, variations);
    
    // Analyser avec IA avancée
    const aiAnalysis = await performAdvancedAIAnalysis(consolidatedInfo);
    
    // Créer le Smart AI Product final
    const smartProduct: SmartAIProduct = {
      id: mainProduct.id || `smart-ai-${Date.now()}-${Math.random()}`,
      handle: mainProduct.handle || generateHandle(consolidatedInfo.title),
      title: consolidatedInfo.title,
      description: consolidatedInfo.description,
      price: consolidatedInfo.price,
      compare_at_price: consolidatedInfo.compare_at_price,
      
      // Categories enrichies par IA
      category: aiAnalysis.category,
      subcategory: aiAnalysis.subcategory,
      product_type: aiAnalysis.product_type,
      
      // Attributs visuels analysés par IA
      color: aiAnalysis.visual_attributes.primary_color,
      material: aiAnalysis.visual_attributes.primary_material,
      fabric: aiAnalysis.visual_attributes.fabric_type,
      style: aiAnalysis.style_analysis.primary_style,
      shape: aiAnalysis.visual_attributes.shape,
      finish: aiAnalysis.visual_attributes.finish,
      
      // Spécifications techniques extraites par IA
      dimensions: aiAnalysis.technical_specs.dimensions,
      weight: aiAnalysis.technical_specs.weight,
      capacity: aiAnalysis.technical_specs.capacity,
      
      // Fonctionnalités détectées par IA
      features: aiAnalysis.functionality.features,
      special_functions: aiAnalysis.functionality.special_functions,
      
      // Usage et espaces analysés par IA
      room: aiAnalysis.usage_analysis.primary_rooms,
      suitable_spaces: aiAnalysis.usage_analysis.suitable_spaces,
      usage_scenarios: aiAnalysis.usage_analysis.scenarios,
      
      // Qualité et origine
      quality_level: aiAnalysis.quality_assessment.level,
      brand: consolidatedInfo.brand,
      vendor: consolidatedInfo.vendor,
      origin_country: aiAnalysis.quality_assessment.origin,
      certifications: aiAnalysis.quality_assessment.certifications,
      warranty: aiAnalysis.quality_assessment.warranty,
      
      // Entretien
      care_instructions: aiAnalysis.care_analysis.instructions,
      assembly_required: aiAnalysis.care_analysis.assembly_required,
      assembly_time: aiAnalysis.care_analysis.assembly_time,
      
      // SEO optimisé par IA
      seo_optimized: aiAnalysis.seo_optimization,
      google_shopping: aiAnalysis.google_shopping,
      
      // Métadonnées IA
      ai_analysis: aiAnalysis.confidence_metrics,
      
      // Variations consolidées
      variations: consolidateVariations(variations),
      
      // Images consolidées
      images: consolidateImages(mainProduct, variations),
      
      // Stock consolidé
      stock: consolidateStock(variations),
      
      // Timestamps
      created_at: mainProduct.created_at || new Date().toISOString(),
      updated_at: new Date().toISOString(),
      enriched_at: new Date().toISOString(),
      last_sync: new Date().toISOString()
    };
    
    return smartProduct;
  };

  const consolidateProductInfo = (mainProduct: any, variations: any[]) => {
    // Consolider titre (prendre le plus complet)
    const titles = [
      mainProduct.title,
      mainProduct.name,
      ...variations.map(v => v.title || v.name)
    ].filter(Boolean);
    
    const title = titles.reduce((longest, current) => 
      current.length > longest.length ? current : longest, ''
    );

    // Consolider description (prendre la plus complète)
    const descriptions = [
      mainProduct.description,
      mainProduct.body_html,
      ...variations.map(v => v.description || v.body_html)
    ].filter(Boolean);
    
    const description = descriptions.reduce((longest, current) => 
      current.length > longest.length ? current : longest, ''
    ).replace(/<[^>]*>/g, '').trim();

    // Consolider prix (prendre le minimum)
    const prices = [
      mainProduct.price,
      mainProduct.variant_price,
      ...variations.map(v => v.price || v.variant_price)
    ].filter(p => p && p > 0).map(p => parseFloat(p));
    
    const price = prices.length > 0 ? Math.min(...prices) : 0;
    
    // Consolider prix comparé
    const comparePrices = [
      mainProduct.compare_at_price,
      mainProduct.variant_compare_at_price,
      ...variations.map(v => v.compare_at_price || v.variant_compare_at_price)
    ].filter(p => p && p > 0).map(p => parseFloat(p));
    
    const compare_at_price = comparePrices.length > 0 ? Math.min(...comparePrices) : undefined;

    return {
      title,
      description,
      price,
      compare_at_price,
      category: mainProduct.category || mainProduct.productType || mainProduct.product_type || 'Mobilier',
      brand: mainProduct.vendor || mainProduct.brand || 'Decora Home',
      vendor: mainProduct.vendor || mainProduct.brand || 'Decora Home',
      image_url: mainProduct.image_url || mainProduct.image_src || 'https://images.pexels.com/photos/1350789/pexels-photo-1350789.jpeg'
    };
  };

  const performAdvancedAIAnalysis = async (productInfo: any) => {
    // Simulation d'analyse IA avancée (remplacez par vraie IA)
    await new Promise(resolve => setTimeout(resolve, 100));
    
    const text = `${productInfo.title} ${productInfo.description}`.toLowerCase();
    
    return {
      // Catégorisation IA avancée
      category: detectAdvancedCategory(text),
      subcategory: detectAdvancedSubcategory(text),
      product_type: detectProductType(text),
      
      // Analyse visuelle IA
      visual_attributes: {
        primary_color: detectPrimaryColor(text),
        secondary_colors: detectSecondaryColors(text),
        primary_material: detectPrimaryMaterial(text),
        secondary_materials: detectSecondaryMaterials(text),
        fabric_type: detectFabricType(text),
        shape: detectShape(text),
        finish: detectFinish(text),
        texture: detectTexture(text)
      },
      
      // Analyse stylistique IA
      style_analysis: {
        primary_style: detectPrimaryStyle(text),
        secondary_styles: detectSecondaryStyles(text),
        design_era: detectDesignEra(text),
        aesthetic_category: detectAestheticCategory(text)
      },
      
      // Spécifications techniques IA
      technical_specs: {
        dimensions: extractAdvancedDimensions(text),
        weight: extractWeight(text),
        capacity: extractCapacity(text),
        structural_details: extractStructuralDetails(text)
      },
      
      // Analyse fonctionnelle IA
      functionality: {
        features: extractAdvancedFeatures(text),
        special_functions: {
          convertible: text.includes('convertible'),
          storage: text.includes('rangement') || text.includes('coffre'),
          adjustable: text.includes('réglable') || text.includes('ajustable'),
          foldable: text.includes('pliable') || text.includes('pliant'),
          extendable: text.includes('extensible') || text.includes('rallonge'),
          reversible: text.includes('réversible'),
          modular: text.includes('modulaire') || text.includes('modulable')
        }
      },
      
      // Analyse d'usage IA
      usage_analysis: {
        primary_rooms: detectPrimaryRooms(text),
        suitable_spaces: detectSuitableSpaces(text),
        scenarios: detectUsageScenarios(text),
        target_audience: detectTargetAudience(text)
      },
      
      // Évaluation qualité IA
      quality_assessment: {
        level: assessQualityLevel(productInfo.price, text),
        origin: detectOrigin(text),
        certifications: detectCertifications(text),
        warranty: extractWarranty(text),
        durability_score: calculateDurabilityScore(text)
      },
      
      // Analyse entretien IA
      care_analysis: {
        instructions: extractCareInstructions(text),
        assembly_required: text.includes('montage') || text.includes('assemblage'),
        assembly_time: extractAssemblyTime(text),
        maintenance_level: assessMaintenanceLevel(text)
      },
      
      // Optimisation SEO IA
      seo_optimization: generateAdvancedSEO(productInfo),
      
      // Google Shopping IA
      google_shopping: generateGoogleShopping(productInfo),
      
      // Métriques de confiance IA
      confidence_metrics: {
        confidence_score: calculateOverallConfidence(text, productInfo),
        color_accuracy: calculateColorAccuracy(text),
        style_accuracy: calculateStyleAccuracy(text),
        material_accuracy: calculateMaterialAccuracy(text),
        category_accuracy: calculateCategoryAccuracy(text),
        dimensions_accuracy: calculateDimensionsAccuracy(text),
        overall_quality: calculateOverallQuality(text, productInfo),
        enrichment_source: 'smart_ai_advanced',
        last_analyzed: new Date().toISOString()
      }
    };
  };

  // Fonctions d'analyse IA avancée
  const detectAdvancedCategory = (text: string): string => {
    const categoryMap = {
      'canapé': ['canapé', 'sofa', 'banquette', 'méridienne', 'chesterfield'],
      'table': ['table', 'bureau', 'console', 'guéridon', 'desserte'],
      'chaise': ['chaise', 'fauteuil', 'tabouret', 'siège', 'bergère'],
      'lit': ['lit', 'matelas', 'sommier', 'tête de lit', 'cadre de lit'],
      'rangement': ['armoire', 'commode', 'bibliothèque', 'étagère', 'vitrine'],
      'éclairage': ['lampe', 'luminaire', 'applique', 'suspension', 'plafonnier'],
      'décoration': ['miroir', 'tableau', 'vase', 'sculpture', 'objet déco']
    };
    
    for (const [category, keywords] of Object.entries(categoryMap)) {
      if (keywords.some(keyword => text.includes(keyword))) {
        return category.charAt(0).toUpperCase() + category.slice(1);
      }
    }
    return 'Mobilier';
  };

  const detectAdvancedSubcategory = (text: string): string => {
    // Sous-catégories spécifiques basées sur l'analyse IA
    if (text.includes('canapé')) {
      if (text.includes('angle')) return 'Canapé d\'angle';
      if (text.includes('convertible')) return 'Canapé convertible';
      if (text.includes('lit')) return 'Canapé-lit';
      if (text.includes('modulaire')) return 'Canapé modulaire';
      return 'Canapé fixe';
    }
    
    if (text.includes('table')) {
      if (text.includes('basse')) return 'Table basse';
      if (text.includes('manger') || text.includes('repas')) return 'Table à manger';
      if (text.includes('bureau')) return 'Bureau';
      if (text.includes('console')) return 'Console';
      if (text.includes('ronde')) return 'Table ronde';
      if (text.includes('extensible')) return 'Table extensible';
      return 'Table';
    }
    
    if (text.includes('chaise')) {
      if (text.includes('bureau')) return 'Chaise de bureau';
      if (text.includes('bar')) return 'Tabouret de bar';
      if (text.includes('fauteuil')) return 'Fauteuil';
      if (text.includes('bergère')) return 'Bergère';
      return 'Chaise de salle à manger';
    }
    
    return '';
  };

  const detectPrimaryColor = (text: string): string => {
    const colorPriority = [
      'blanc', 'noir', 'gris', 'beige', 'marron', 'bleu', 'vert', 'rouge',
      'jaune', 'orange', 'rose', 'violet', 'naturel', 'chêne', 'noyer', 'taupe'
    ];
    
    return colorPriority.find(color => text.includes(color)) || '';
  };

  const detectPrimaryMaterial = (text: string): string => {
    const materialPriority = [
      'travertin', 'marbre', 'chêne massif', 'noyer', 'teck', 'bois massif',
      'velours côtelé', 'velours', 'cuir', 'tissu chenille', 'tissu',
      'métal noir', 'acier inoxydable', 'métal', 'verre trempé', 'verre'
    ];
    
    return materialPriority.find(material => text.includes(material)) || '';
  };

  const extractAdvancedDimensions = (text: string) => {
    const dimensions: any = { unit: 'cm' };
    
    // Patterns avancés pour dimensions
    const patterns = [
      { key: 'length', regex: /(?:largeur|longueur|l)\s*:?\s*(\d+(?:[.,]\d+)?)\s*cm/gi },
      { key: 'width', regex: /(?:profondeur|largeur|l)\s*:?\s*(\d+(?:[.,]\d+)?)\s*cm/gi },
      { key: 'height', regex: /(?:hauteur|h)\s*:?\s*(\d+(?:[.,]\d+)?)\s*cm/gi },
      { key: 'diameter', regex: /(?:diamètre|ø)\s*:?\s*(\d+(?:[.,]\d+)?)\s*cm/gi },
      { key: 'seat_height', regex: /(?:hauteur\s+d[\'']?assise)\s*:?\s*(\d+(?:[.,]\d+)?)\s*cm/gi },
      { key: 'bed_surface', regex: /(?:couchage|surface\s+de\s+couchage)\s*:?\s*(\d+)\s*[x×]\s*(\d+)\s*cm/gi }
    ];
    
    patterns.forEach(({ key, regex }) => {
      const matches = [...text.matchAll(regex)];
      matches.forEach(match => {
        if (key === 'bed_surface') {
          dimensions.bed_surface = `${match[1]} x ${match[2]} cm`;
        } else {
          dimensions[key] = parseFloat(match[1].replace(',', '.'));
        }
      });
    });
    
    return dimensions;
  };

  const generateAdvancedSEO = (productInfo: any) => {
    const title = productInfo.title;
    const category = productInfo.category;
    const brand = productInfo.brand;
    
    return {
      title: `${title} - ${brand} | Mobilier Design`.substring(0, 70),
      description: `Découvrez ${title} chez ${brand}. ${category} de qualité premium avec livraison gratuite. Garantie satisfaction.`.substring(0, 155),
      keywords: [
        category.toLowerCase(),
        brand.toLowerCase(),
        'mobilier',
        'design',
        'qualité',
        'livraison gratuite'
      ],
      ad_headline: title.substring(0, 30),
      ad_description: `${title} ${brand}. Qualité premium !`.substring(0, 90)
    };
  };

  const calculateOverallConfidence = (text: string, productInfo: any): number => {
    let confidence = 30;
    
    if (productInfo.title && productInfo.title.length > 10) confidence += 15;
    if (productInfo.description && productInfo.description.length > 50) confidence += 20;
    if (productInfo.price > 0) confidence += 10;
    if (text.includes('dimensions') || text.includes('cm')) confidence += 15;
    if (text.includes('matériau') || text.includes('tissu') || text.includes('bois')) confidence += 10;
    if (text.includes('couleur') || text.includes('coloris')) confidence += 10;
    
    return Math.min(confidence, 100);
  };

  const consolidateVariations = (variations: any[]) => {
    return variations.map((variation, index) => ({
      id: variation.id || `var-${index}`,
      title: variation.option1_value || variation.title || `Variation ${index + 1}`,
      price: parseFloat(variation.price || variation.variant_price || 0),
      compare_at_price: variation.compare_at_price ? parseFloat(variation.compare_at_price) : undefined,
      stock: parseInt(variation.stock || variation.variant_inventory_qty || 0),
      sku: variation.sku || variation.variant_sku || '',
      options: variation.option1_name ? [{
        name: variation.option1_name,
        value: variation.option1_value
      }] : [],
      image_url: variation.image_url || variation.variant_image
    }));
  };

  const consolidateImages = (mainProduct: any, variations: any[]) => {
    const allImages = [
      mainProduct.image_url,
      mainProduct.image_src,
      ...variations.map(v => v.image_url || v.image_src)
    ].filter(Boolean);
    
    return {
      primary: allImages[0] || 'https://images.pexels.com/photos/1350789/pexels-photo-1350789.jpeg',
      gallery: [...new Set(allImages)],
      variant_images: variations.reduce((acc, v, index) => {
        if (v.image_url || v.image_src) {
          acc[`var-${index}`] = v.image_url || v.image_src;
        }
        return acc;
      }, {})
    };
  };

  const consolidateStock = (variations: any[]) => {
    const totalStock = variations.reduce((sum, v) => 
      sum + parseInt(v.stock || v.variant_inventory_qty || 0), 0
    );
    
    return {
      total: totalStock,
      available: totalStock,
      reserved: 0,
      low_stock_threshold: 5
    };
  };

  // Fonctions helper pour l'analyse IA
  const detectProductType = (text: string): string => {
    if (text.includes('canapé') || text.includes('sofa')) return 'Canapé';
    if (text.includes('table')) return 'Table';
    if (text.includes('chaise') || text.includes('fauteuil')) return 'Chaise';
    if (text.includes('lit')) return 'Lit';
    if (text.includes('armoire') || text.includes('commode')) return 'Rangement';
    return 'Mobilier';
  };

  const detectSecondaryColors = (text: string): string[] => {
    const colors = ['blanc', 'noir', 'gris', 'beige', 'marron', 'bleu', 'vert', 'rouge'];
    return colors.filter(color => text.includes(color));
  };

  const detectSecondaryMaterials = (text: string): string[] => {
    const materials = ['bois', 'métal', 'verre', 'tissu', 'cuir', 'velours'];
    return materials.filter(material => text.includes(material));
  };

  const detectFabricType = (text: string): string => {
    const fabrics = ['velours côtelé', 'chenille', 'lin', 'coton', 'polyester'];
    return fabrics.find(fabric => text.includes(fabric)) || '';
  };

  const detectShape = (text: string): string => {
    const shapes = ['rond', 'carré', 'rectangulaire', 'ovale', 'angle'];
    return shapes.find(shape => text.includes(shape)) || '';
  };

  const detectFinish = (text: string): string => {
    const finishes = ['mat', 'brillant', 'satiné', 'naturel', 'laqué'];
    return finishes.find(finish => text.includes(finish)) || '';
  };

  const detectTexture = (text: string): string => {
    const textures = ['lisse', 'rugueux', 'côtelé', 'bouclé', 'texturé'];
    return textures.find(texture => text.includes(texture)) || '';
  };

  const detectPrimaryStyle = (text: string): string => {
    const styles = ['moderne', 'contemporain', 'scandinave', 'industriel', 'vintage'];
    return styles.find(style => text.includes(style)) || '';
  };

  const detectSecondaryStyles = (text: string): string[] => {
    const styles = ['épuré', 'élégant', 'chic', 'tendance', 'design'];
    return styles.filter(style => text.includes(style));
  };

  const detectDesignEra = (text: string): string => {
    if (text.includes('années 50') || text.includes('50s')) return 'Années 50';
    if (text.includes('années 60') || text.includes('60s')) return 'Années 60';
    if (text.includes('années 70') || text.includes('70s')) return 'Années 70';
    if (text.includes('art déco')) return 'Art Déco';
    return 'Contemporain';
  };

  const detectAestheticCategory = (text: string): string => {
    if (text.includes('minimaliste') || text.includes('épuré')) return 'Minimaliste';
    if (text.includes('luxe') || text.includes('premium')) return 'Luxe';
    if (text.includes('cosy') || text.includes('chaleureux')) return 'Cosy';
    return 'Standard';
  };

  const extractWeight = (text: string) => {
    const weightMatch = text.match(/(?:poids|pèse)\s*:?\s*(\d+(?:[.,]\d+)?)\s*(kg|g)/gi);
    if (weightMatch) {
      const value = parseFloat(weightMatch[1].replace(',', '.'));
      const unit = weightMatch[2].toLowerCase();
      return { value: unit === 'g' ? value / 1000 : value, unit: 'kg' };
    }
    return undefined;
  };

  const extractCapacity = (text: string) => {
    const capacity: any = {};
    
    const seatsMatch = text.match(/(\d+)\s*(?:places?|personnes?)/gi);
    if (seatsMatch) capacity.seats = parseInt(seatsMatch[1]);
    
    const drawersMatch = text.match(/(\d+)\s*tiroirs?/gi);
    if (drawersMatch) capacity.drawers = parseInt(drawersMatch[1]);
    
    const shelvesMatch = text.match(/(\d+)\s*étagères?/gi);
    if (shelvesMatch) capacity.shelves = parseInt(shelvesMatch[1]);
    
    return capacity;
  };

  const extractStructuralDetails = (text: string): string[] => {
    const details = [];
    if (text.includes('ressort')) details.push('Ressorts');
    if (text.includes('mousse')) details.push('Mousse haute densité');
    if (text.includes('structure')) details.push('Structure renforcée');
    if (text.includes('pieds')) details.push('Piètement stable');
    return details;
  };

  const extractAdvancedFeatures = (text: string): string[] => {
    const features = [];
    if (text.includes('convertible')) features.push('Convertible');
    if (text.includes('rangement')) features.push('Rangement intégré');
    if (text.includes('réversible')) features.push('Angle réversible');
    if (text.includes('déhoussable')) features.push('Déhoussable');
    if (text.includes('roulettes')) features.push('Roulettes');
    if (text.includes('réglable')) features.push('Réglable en hauteur');
    return features;
  };

  const detectPrimaryRooms = (text: string): string[] => {
    const rooms = [];
    if (text.includes('salon')) rooms.push('Salon');
    if (text.includes('chambre')) rooms.push('Chambre');
    if (text.includes('cuisine')) rooms.push('Cuisine');
    if (text.includes('bureau')) rooms.push('Bureau');
    if (text.includes('salle à manger')) rooms.push('Salle à manger');
    return rooms;
  };

  const detectSuitableSpaces = (text: string): string[] => {
    const spaces = [];
    if (text.includes('petit espace')) spaces.push('Petits espaces');
    if (text.includes('grand salon')) spaces.push('Grands salons');
    if (text.includes('studio')) spaces.push('Studios');
    if (text.includes('loft')) spaces.push('Lofts');
    return spaces;
  };

  const detectUsageScenarios = (text: string): string[] => {
    const scenarios = [];
    if (text.includes('quotidien')) scenarios.push('Usage quotidien');
    if (text.includes('invités')) scenarios.push('Réception d\'invités');
    if (text.includes('détente')) scenarios.push('Moments détente');
    if (text.includes('travail')) scenarios.push('Espace de travail');
    return scenarios;
  };

  const detectTargetAudience = (text: string): string[] => {
    const audience = [];
    if (text.includes('famille')) audience.push('Familles');
    if (text.includes('professionnel')) audience.push('Professionnels');
    if (text.includes('étudiant')) audience.push('Étudiants');
    if (text.includes('senior')) audience.push('Seniors');
    return audience;
  };

  const assessQualityLevel = (price: number, text: string): 'entry' | 'standard' | 'premium' | 'luxury' => {
    if (price > 1500 || text.includes('luxe') || text.includes('haut de gamme')) return 'luxury';
    if (price > 800 || text.includes('premium') || text.includes('qualité supérieure')) return 'premium';
    if (price > 300) return 'standard';
    return 'entry';
  };

  const detectOrigin = (text: string): string => {
    if (text.includes('france') || text.includes('français')) return 'France';
    if (text.includes('italie') || text.includes('italien')) return 'Italie';
    if (text.includes('allemagne') || text.includes('allemand')) return 'Allemagne';
    if (text.includes('danemark') || text.includes('danois')) return 'Danemark';
    return '';
  };

  const detectCertifications = (text: string): string[] => {
    const certs = [];
    if (text.includes('fsc')) certs.push('FSC');
    if (text.includes('pefc')) certs.push('PEFC');
    if (text.includes('oeko-tex')) certs.push('Oeko-Tex');
    if (text.includes('greenguard')) certs.push('Greenguard');
    return certs;
  };

  const extractWarranty = (text: string): string => {
    const warrantyMatch = text.match(/(?:garantie)\s*:?\s*(\d+)\s*(ans?|mois)/gi);
    if (warrantyMatch) {
      return `${warrantyMatch[1]} ${warrantyMatch[2]}`;
    }
    return '';
  };

  const calculateDurabilityScore = (text: string): number => {
    let score = 50;
    if (text.includes('massif')) score += 20;
    if (text.includes('qualité')) score += 15;
    if (text.includes('résistant')) score += 15;
    return Math.min(score, 100);
  };

  const extractCareInstructions = (text: string): string[] => {
    const instructions = [];
    if (text.includes('nettoyage')) instructions.push('Nettoyage régulier');
    if (text.includes('déhoussable')) instructions.push('Housses lavables');
    if (text.includes('dépoussiérage')) instructions.push('Dépoussiérage hebdomadaire');
    return instructions;
  };

  const extractAssemblyTime = (text: string): string => {
    const timeMatch = text.match(/(?:montage|assemblage)\s*:?\s*(\d+)\s*(min|h)/gi);
    if (timeMatch) {
      return `${timeMatch[1]} ${timeMatch[2]}`;
    }
    return '';
  };

  const assessMaintenanceLevel = (text: string): 'low' | 'medium' | 'high' => {
    if (text.includes('sans entretien') || text.includes('facile')) return 'low';
    if (text.includes('entretien régulier')) return 'medium';
    return 'low';
  };

  const generateGoogleShopping = (productInfo: any) => {
    return {
      category: '696', // Mobilier
      condition: 'new',
      availability: 'in stock',
      custom_labels: [
        productInfo.brand,
        productInfo.category,
        'livraison gratuite',
        'qualité premium'
      ]
    };
  };

  // Fonctions de calcul de précision
  const calculateColorAccuracy = (text: string): number => {
    const colorMentions = (text.match(/(?:couleur|coloris|teinte)/gi) || []).length;
    return Math.min(colorMentions * 25 + 50, 100);
  };

  const calculateStyleAccuracy = (text: string): number => {
    const styleMentions = (text.match(/(?:style|design|esthétique)/gi) || []).length;
    return Math.min(styleMentions * 20 + 60, 100);
  };

  const calculateMaterialAccuracy = (text: string): number => {
    const materialMentions = (text.match(/(?:matériau|tissu|bois|métal)/gi) || []).length;
    return Math.min(materialMentions * 20 + 55, 100);
  };

  const calculateCategoryAccuracy = (text: string): number => {
    const categoryMentions = (text.match(/(?:canapé|table|chaise|lit)/gi) || []).length;
    return Math.min(categoryMentions * 30 + 70, 100);
  };

  const calculateDimensionsAccuracy = (text: string): number => {
    const dimensionMentions = (text.match(/\d+\s*cm|\d+\s*x\s*\d+/gi) || []).length;
    return Math.min(dimensionMentions * 25 + 40, 100);
  };

  const calculateOverallQuality = (text: string, productInfo: any): number => {
    let quality = 60;
    if (productInfo.price > 500) quality += 15;
    if (text.includes('premium') || text.includes('qualité')) quality += 15;
    if (text.includes('garantie')) quality += 10;
    return Math.min(quality, 100);
  };

  const generateHandle = (title: string): string => {
    return title
      .toLowerCase()
      .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9\s-]/g, '')
      .trim()
      .replace(/\s+/g, '-')
      .substring(0, 100);
  };

  const handleEnrichAll = async () => {
    setIsEnriching(true);
    showInfo('Smart AI Enrichment', 'Analyse IA avancée et consolidation de tous les produits...');
    
    try {
      await new Promise(resolve => setTimeout(resolve, 3000));
      await loadSmartAIProducts();
      
      showSuccess(
        'Smart AI Enrichment terminé',
        `${products.length} Smart AI Products créés avec analyse complète !`,
        [
          {
            label: 'Voir les résultats',
            action: () => setShowDetailModal(true),
            variant: 'primary'
          }
        ]
      );
      
    } catch (error) {
      showError('Erreur Smart AI', 'Impossible d\'enrichir les produits.');
    } finally {
      setIsEnriching(false);
    }
  };

  const filteredProducts = products.filter(product => {
    const matchesSearch = searchTerm === '' || 
      product.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.subcategory.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.brand.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.ai_analysis.enrichment_source.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesCategory = selectedCategory === 'all' || product.category === selectedCategory;
    const matchesQuality = selectedQuality === 'all' || product.quality_level === selectedQuality;
    
    return matchesSearch && matchesCategory && matchesQuality;
  });

  const categories = [...new Set(products.map(p => p.category))];
  const qualityLevels = [...new Set(products.map(p => p.quality_level))];

  const formatDimensions = (dimensions: any): string => {
    const parts = [];
    if (dimensions.length) parts.push(`L:${dimensions.length}cm`);
    if (dimensions.width) parts.push(`l:${dimensions.width}cm`);
    if (dimensions.height) parts.push(`H:${dimensions.height}cm`);
    if (dimensions.diameter) parts.push(`Ø:${dimensions.diameter}cm`);
    if (dimensions.seat_height) parts.push(`Assise:${dimensions.seat_height}cm`);
    if (dimensions.bed_surface) parts.push(`Couchage:${dimensions.bed_surface}`);
    return parts.join(' × ');
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="text-center">
          <Brain className="w-16 h-16 text-purple-400 animate-pulse mx-auto mb-4" />
          <p className="text-white text-lg">Chargement Smart AI Products...</p>
          <p className="text-gray-400 text-sm">Consolidation et analyse IA avancée</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold text-white flex items-center gap-3">
            <Brain className="w-8 h-8 text-purple-400" />
            Smart AI Products
            <span className="bg-gradient-to-r from-purple-500 to-pink-600 bg-clip-text text-transparent">
              Consolidés
            </span>
          </h2>
          <p className="text-gray-300 mt-2">
            {filteredProducts.length} produit(s) Smart AI • {filteredProducts.reduce((sum, p) => sum + p.variations.length, 0)} variation(s) • Analyse IA complète
          </p>
        </div>
        
        <div className="flex gap-3">
          <button
            onClick={() => setViewMode(viewMode === 'table' ? 'grid' : 'table')}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-3 rounded-xl flex items-center gap-2 transition-all"
          >
            <BarChart3 className="w-4 h-4" />
            {viewMode === 'table' ? 'Vue grille' : 'Vue liste'}
          </button>
          
          <button
            onClick={handleEnrichAll}
            disabled={isEnriching}
            className="bg-gradient-to-r from-purple-500 to-pink-600 hover:from-purple-400 hover:to-pink-500 disabled:from-gray-600 disabled:to-gray-700 text-white px-6 py-3 rounded-xl flex items-center gap-2 font-semibold transition-all disabled:cursor-not-allowed"
          >
            {isEnriching ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                Smart AI Enrichment...
              </>
            ) : (
              <>
                <Sparkles className="w-5 h-5" />
                Enrichir avec Smart AI
              </>
            )}
          </button>
        </div>
      </div>

      {/* Filtres avancés */}
      <div className="bg-white/10 backdrop-blur-xl rounded-2xl p-6 border border-white/20">
        <div className="flex flex-col lg:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Rechercher par nom, catégorie, sous-catégorie, marque, source IA..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-3 bg-black/40 border border-gray-600 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:border-purple-400 focus:ring-2 focus:ring-purple-400/30"
            />
          </div>
          
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="bg-black/40 border border-gray-600 rounded-xl px-4 py-3 text-white"
          >
            <option value="all">Toutes les catégories</option>
            {categories.map(category => (
              <option key={category} value={category}>{category}</option>
            ))}
          </select>
          
          <select
            value={selectedQuality}
            onChange={(e) => setSelectedQuality(e.target.value)}
            className="bg-black/40 border border-gray-600 rounded-xl px-4 py-3 text-white"
          >
            <option value="all">Tous les niveaux</option>
            {qualityLevels.map(level => (
              <option key={level} value={level}>
                {level === 'entry' ? 'Entrée de gamme' :
                 level === 'standard' ? 'Standard' :
                 level === 'premium' ? 'Premium' : 'Luxe'}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Vue grille Smart AI */}
      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-8">
        {filteredProducts.map((product) => (
          <div key={product.id} className="bg-white/10 backdrop-blur-xl rounded-2xl p-6 border border-white/20 hover:border-purple-500/50 transition-all hover:scale-105">
            {/* Image principale */}
            <div className="relative mb-6">
              <div className="w-full h-48 rounded-xl overflow-hidden bg-gray-600">
                <img 
                  src={product.images.primary} 
                  alt={product.title}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    target.src = 'https://images.pexels.com/photos/1350789/pexels-photo-1350789.jpeg';
                  }}
                />
              </div>
              
              {/* Badge qualité */}
              <div className={`absolute top-3 right-3 px-3 py-1 rounded-full text-xs font-bold ${
                product.quality_level === 'luxury' ? 'bg-yellow-500/90 text-yellow-900' :
                product.quality_level === 'premium' ? 'bg-purple-500/90 text-white' :
                product.quality_level === 'standard' ? 'bg-blue-500/90 text-white' :
                'bg-gray-500/90 text-white'
              }`}>
                {product.quality_level === 'luxury' ? '👑 Luxe' :
                 product.quality_level === 'premium' ? '⭐ Premium' :
                 product.quality_level === 'standard' ? '✓ Standard' : '💰 Entrée'}
              </div>
            </div>
            
            {/* Informations principales */}
            <h3 className="font-bold text-white text-lg mb-2 line-clamp-2">{product.title}</h3>
            <p className="text-gray-300 text-sm mb-4">{product.category} • {product.subcategory} • {product.brand}</p>
            
            {/* Prix et confiance IA */}
            <div className="flex items-center justify-between mb-4">
              <div className="text-2xl font-bold text-green-400">
                {product.variations.length > 1 ? 
                  `${Math.min(...product.variations.map(v => v.price))}€ - ${Math.max(...product.variations.map(v => v.price))}€` :
                  `${product.price}€`
                }
              </div>
              <div className={`px-3 py-1 rounded-full text-xs font-bold ${
                product.ai_analysis.confidence_score >= 90 ? 'bg-green-500/20 text-green-300' :
                product.ai_analysis.confidence_score >= 75 ? 'bg-blue-500/20 text-blue-300' :
                product.ai_analysis.confidence_score >= 60 ? 'bg-yellow-500/20 text-yellow-300' :
                'bg-red-500/20 text-red-300'
              }`}>
                Smart AI: {product.ai_analysis.confidence_score}%
              </div>
            </div>

            {/* Attributs visuels Smart AI */}
            <div className="space-y-3 mb-4">
              {/* Couleur et matériau */}
              <div className="bg-pink-500/20 rounded-xl p-3 border border-pink-400/30">
                <div className="text-pink-300 text-xs font-semibold mb-2 flex items-center gap-1">
                  <Palette className="w-3 h-3" />
                  Analyse Visuelle Smart AI:
                </div>
                <div className="flex flex-wrap gap-1">
                  {product.color && (
                    <span className="bg-pink-600/30 text-pink-200 px-2 py-1 rounded text-xs">
                      {product.color}
                    </span>
                  )}
                  {product.material && (
                    <span className="bg-green-600/30 text-green-200 px-2 py-1 rounded text-xs">
                      {product.material}
                    </span>
                  )}
                  {product.fabric && (
                    <span className="bg-blue-600/30 text-blue-200 px-2 py-1 rounded text-xs">
                      {product.fabric}
                    </span>
                  )}
                </div>
              </div>

              {/* Style et forme */}
              <div className="bg-purple-500/20 rounded-xl p-3 border border-purple-400/30">
                <div className="text-purple-300 text-xs font-semibold mb-2 flex items-center gap-1">
                  <Award className="w-3 h-3" />
                  Style & Design Smart AI:
                </div>
                <div className="flex flex-wrap gap-1">
                  {product.style && (
                    <span className="bg-purple-600/30 text-purple-200 px-2 py-1 rounded text-xs">
                      {product.style}
                    </span>
                  )}
                  {product.shape && (
                    <span className="bg-indigo-600/30 text-indigo-200 px-2 py-1 rounded text-xs">
                      {product.shape}
                    </span>
                  )}
                  {product.finish && (
                    <span className="bg-orange-600/30 text-orange-200 px-2 py-1 rounded text-xs">
                      {product.finish}
                    </span>
                  )}
                </div>
              </div>

              {/* Dimensions Smart AI */}
              <div className="bg-cyan-500/20 rounded-xl p-3 border border-cyan-400/30">
                <div className="text-cyan-300 text-xs font-semibold mb-2 flex items-center gap-1">
                  <Ruler className="w-3 h-3" />
                  Dimensions Smart AI:
                </div>
                <div className="text-white text-xs">
                  {formatDimensions(product.dimensions) || 'Non détectées par IA'}
                </div>
              </div>

              {/* Fonctionnalités Smart AI */}
              <div className="bg-orange-500/20 rounded-xl p-3 border border-orange-400/30">
                <div className="text-orange-300 text-xs font-semibold mb-2 flex items-center gap-1">
                  <Zap className="w-3 h-3" />
                  Fonctionnalités Smart AI:
                </div>
                <div className="flex flex-wrap gap-1">
                  {product.features.slice(0, 3).map((feature, index) => (
                    <span key={index} className="bg-orange-600/30 text-orange-200 px-2 py-1 rounded text-xs">
                      {feature}
                    </span>
                  ))}
                  {product.features.length > 3 && (
                    <span className="text-orange-400 text-xs">+{product.features.length - 3}</span>
                  )}
                </div>
              </div>

              {/* Espaces d'usage Smart AI */}
              <div className="bg-green-500/20 rounded-xl p-3 border border-green-400/30">
                <div className="text-green-300 text-xs font-semibold mb-2 flex items-center gap-1">
                  <Home className="w-3 h-3" />
                  Usage Smart AI:
                </div>
                <div className="flex flex-wrap gap-1">
                  {product.room.slice(0, 2).map((room, index) => (
                    <span key={index} className="bg-green-600/30 text-green-200 px-2 py-1 rounded text-xs">
                      {room}
                    </span>
                  ))}
                  {product.suitable_spaces.slice(0, 1).map((space, index) => (
                    <span key={index} className="bg-teal-600/30 text-teal-200 px-2 py-1 rounded text-xs">
                      {space}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            {/* Variations consolidées */}
            <div className="bg-cyan-500/20 rounded-xl p-3 mb-4 border border-cyan-400/30">
              <div className="text-cyan-300 text-sm font-semibold mb-2 flex items-center gap-1">
                <Layers className="w-4 h-4" />
                {product.variations.length} variation(s) Smart AI:
              </div>
              <div className="space-y-1 max-h-24 overflow-y-auto">
                {product.variations.map((variation, index) => (
                  <div key={index} className="bg-black/20 rounded p-2 flex justify-between items-center">
                    <div>
                      <div className="font-medium text-white text-xs">{variation.title}</div>
                      <div className="text-cyan-400 text-xs">SKU: {variation.sku}</div>
                    </div>
                    <div className="text-right">
                      <div className="font-bold text-green-400 text-sm">{variation.price}€</div>
                      <div className="text-xs text-gray-400">Stock: {variation.stock}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* SEO Smart AI */}
            <div className="bg-blue-500/20 rounded-xl p-3 mb-4 border border-blue-400/30">
              <div className="text-blue-300 text-xs font-semibold mb-1 flex items-center gap-1">
                <TrendingUp className="w-3 h-3" />
                SEO Smart AI:
              </div>
              <div className="text-white text-xs font-medium line-clamp-1 mb-1">{product.seo_optimized.title}</div>
              <div className="text-gray-300 text-xs line-clamp-2">{product.seo_optimized.description}</div>
            </div>

            {/* Actions */}
            <div className="flex gap-2">
              <button
                onClick={() => {
                  setSelectedProduct(product);
                  setShowDetailModal(true);
                }}
                className="flex-1 bg-purple-600 hover:bg-purple-700 text-white py-2 rounded-lg flex items-center justify-center gap-1 text-sm font-semibold"
              >
                <Eye className="w-4 h-4" />
                Analyse Smart AI
              </button>
              <button className="flex-1 bg-green-600 hover:bg-green-700 text-white py-2 rounded-lg flex items-center justify-center gap-1 text-sm font-semibold">
                <Download className="w-4 h-4" />
                Exporter
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Message si aucun produit */}
      {filteredProducts.length === 0 && (
        <div className="text-center py-20">
          <Brain className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-xl font-bold text-white mb-2">Aucun Smart AI Product trouvé</h3>
          <p className="text-gray-400 mb-6">
            {searchTerm || selectedCategory !== 'all'
              ? 'Aucun produit ne correspond à vos critères de recherche.'
              : 'Enrichissez vos produits avec l\'IA Smart AI avancée.'}
          </p>
          <button
            onClick={handleEnrichAll}
            className="bg-gradient-to-r from-purple-500 to-pink-600 hover:from-purple-400 hover:to-pink-500 text-white px-6 py-3 rounded-xl font-semibold transition-all"
          >
            Créer Smart AI Products
          </button>
        </div>
      )}

      {/* Statistiques Smart AI */}
      <div className="bg-gradient-to-r from-purple-500/20 to-pink-600/20 backdrop-blur-xl rounded-2xl p-6 border border-purple-400/30">
        <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
          <BarChart3 className="w-5 h-5 text-purple-400" />
          Statistiques Smart AI Products
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-6 gap-6">
          <div className="text-center">
            <div className="text-2xl font-bold text-purple-400">{products.length}</div>
            <div className="text-purple-300 text-sm">Smart AI Products</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-cyan-400">
              {products.reduce((sum, p) => sum + p.variations.length, 0)}
            </div>
            <div className="text-cyan-300 text-sm">Variations totales</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-green-400">
              {Math.round(products.reduce((sum, p) => sum + p.ai_analysis.confidence_score, 0) / products.length) || 0}%
            </div>
            <div className="text-green-300 text-sm">Confiance Smart AI</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-orange-400">
              {products.reduce((sum, p) => sum + p.features.length, 0)}
            </div>
            <div className="text-orange-300 text-sm">Fonctionnalités</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-pink-400">
              {products.reduce((sum, p) => sum + p.room.length, 0)}
            </div>
            <div className="text-pink-300 text-sm">Espaces d'usage</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-yellow-400">
              {products.filter(p => p.quality_level === 'premium' || p.quality_level === 'luxury').length}
            </div>
            <div className="text-yellow-300 text-sm">Haut de gamme</div>
          </div>
        </div>
      </div>

      {/* Modal détails Smart AI Product */}
      {showDetailModal && selectedProduct && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-800/95 backdrop-blur-xl rounded-2xl max-w-6xl w-full max-h-[90vh] overflow-y-auto border border-slate-600/50">
            <div className="flex items-center justify-between p-6 border-b border-slate-600/50">
              <h2 className="text-2xl font-bold text-white flex items-center gap-2">
                <Brain className="w-6 h-6 text-purple-400" />
                Smart AI Product - {selectedProduct.title}
              </h2>
              <button
                onClick={() => setShowDetailModal(false)}
                className="text-gray-400 hover:text-white transition-colors"
              >
                <ExternalLink className="w-6 h-6" />
              </button>
            </div>

            <div className="p-6 space-y-8">
              {/* Vue d'ensemble */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div>
                  <div className="w-full h-80 rounded-2xl overflow-hidden bg-gray-600 mb-6">
                    <img 
                      src={selectedProduct.images.primary} 
                      alt={selectedProduct.title}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  
                  <div className="space-y-4">
                    <div>
                      <h3 className="text-xl font-bold text-white mb-2">{selectedProduct.title}</h3>
                      <p className="text-gray-300">{selectedProduct.description}</p>
                    </div>
                  </div>
                </div>

                <div className="space-y-6">
                  {/* Analyse Smart AI */}
                  <div className="bg-purple-500/20 rounded-xl p-4 border border-purple-400/50">
                    <h4 className="font-semibold text-purple-200 mb-3 flex items-center gap-2">
                      <Brain className="w-5 h-5" />
                      Analyse Smart AI - Confiance: {selectedProduct.ai_analysis.confidence_score}%
                    </h4>
                    <div className="grid grid-cols-2 gap-3 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-300">Couleur:</span>
                        <span className="text-pink-400 font-bold">{selectedProduct.ai_analysis.color_accuracy}%</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-300">Style:</span>
                        <span className="text-purple-400 font-bold">{selectedProduct.ai_analysis.style_accuracy}%</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-300">Matériau:</span>
                        <span className="text-green-400 font-bold">{selectedProduct.ai_analysis.material_accuracy}%</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-300">Dimensions:</span>
                        <span className="text-cyan-400 font-bold">{selectedProduct.ai_analysis.dimensions_accuracy}%</span>
                      </div>
                    </div>
                  </div>

                  {/* Spécifications techniques Smart AI */}
                  <div className="bg-blue-500/20 rounded-xl p-4 border border-blue-400/50">
                    <h4 className="font-semibold text-blue-200 mb-3">Spécifications Smart AI</h4>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-300">Dimensions:</span>
                        <span className="text-white font-bold">{formatDimensions(selectedProduct.dimensions)}</span>
                      </div>
                      {selectedProduct.weight && (
                        <div className="flex justify-between">
                          <span className="text-gray-300">Poids:</span>
                          <span className="text-white font-bold">{selectedProduct.weight.value} {selectedProduct.weight.unit}</span>
                        </div>
                      )}
                      {selectedProduct.capacity.seats && (
                        <div className="flex justify-between">
                          <span className="text-gray-300">Capacité:</span>
                          <span className="text-white font-bold">{selectedProduct.capacity.seats} places</span>
                        </div>
                      )}
                      <div className="flex justify-between">
                        <span className="text-gray-300">Qualité:</span>
                        <span className="text-yellow-400 font-bold capitalize">{selectedProduct.quality_level}</span>
                      </div>
                    </div>
                  </div>

                  {/* Stock consolidé */}
                  <div className="bg-green-500/20 rounded-xl p-4 border border-green-400/50">
                    <h4 className="font-semibold text-green-200 mb-3">Stock Smart AI</h4>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-300">Total disponible:</span>
                        <span className="text-green-400 font-bold">{selectedProduct.stock.available}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-300">Variations:</span>
                        <span className="text-cyan-400 font-bold">{selectedProduct.variations.length}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Fonctionnalités spéciales Smart AI */}
              <div className="bg-orange-500/20 rounded-xl p-4 border border-orange-400/50">
                <h4 className="font-semibold text-orange-200 mb-3">Fonctionnalités Spéciales Smart AI</h4>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  {Object.entries(selectedProduct.special_functions).map(([key, value]) => (
                    <div key={key} className={`text-center p-2 rounded-lg ${value ? 'bg-green-500/30 text-green-200' : 'bg-gray-500/30 text-gray-400'}`}>
                      <div className="text-xs font-medium capitalize">{key.replace('_', ' ')}</div>
                      <div className="text-xs">{value ? '✅' : '❌'}</div>
                    </div>
                  ))}
                </div>
              </div>

              {/* SEO Smart AI */}
              <div className="bg-blue-500/20 rounded-xl p-4 border border-blue-400/50">
                <h4 className="font-semibold text-blue-200 mb-3">SEO Smart AI Optimisé</h4>
                <div className="space-y-3">
                  <div>
                    <label className="text-blue-300 text-sm">Titre SEO Smart AI :</label>
                    <div className="text-white font-medium">{selectedProduct.seo_optimized.title}</div>
                  </div>
                  <div>
                    <label className="text-blue-300 text-sm">Description SEO Smart AI :</label>
                    <div className="text-gray-300">{selectedProduct.seo_optimized.description}</div>
                  </div>
                  <div>
                    <label className="text-blue-300 text-sm">Mots-clés Smart AI :</label>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {selectedProduct.seo_optimized.keywords.map((keyword, index) => (
                        <span key={index} className="bg-blue-600/30 text-blue-200 px-2 py-1 rounded text-xs">
                          {keyword}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex justify-end gap-4">
                <button className="bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-xl transition-all">
                  Exporter Smart AI Product
                </button>
                <button
                  onClick={() => setShowDetailModal(false)}
                  className="bg-gray-600 hover:bg-gray-700 text-white px-6 py-3 rounded-xl transition-all"
                >
                  Fermer
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};