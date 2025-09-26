import React, { useState, useEffect } from 'react';
import { 
  Brain, Sparkles, Zap, RefreshCw, Download, Upload, 
  extractEnhancedRooms, extractDimensions, detectPromotions, generateSEOContent,
  detectEnhancedCategory
  Package, Tag, DollarSign, Image, Settings, Search,
  Filter, ChevronDown, ChevronUp, ExternalLink
} from 'lucide-react';
import { useNotifications } from './NotificationSystem';
import { extractEnhancedStyles, extractEnhancedColors, extractEnhancedMaterials, extractEnhancedRooms, extractDimensions, detectPromotions, generateSEOContent } from '../utils/productEnrichmentUtils';

interface SmartProduct {
  id: string;
  name: string;
  description: string;
  price: number;
  category: string;
  vendor: string;
  image_url: string;
  stock: number;
  ai_attributes: {
    colors: string[];
    materials: string[];
    dimensions: {
      largeur?: number;
      profondeur?: number;
      hauteur?: number;
      hauteur_assise?: number;
      couchage_largeur?: number;
      couchage_longueur?: number;
      diametre?: number;
    };
    styles: string[];
    features: string[];
    room: string[];
    confidence_score: number;
  };
  variations: Array<{
    id: string;
    title: string;
    price: number;
    stock: number;
    options: { name: string; value: string }[];
  }>;
  seo_optimized: {
    title: string;
    description: string;
    tags: string[];
  };
  enriched_at: string;
}

export const SmartAIEnrichmentTab: React.FC = () => {
  const [products, setProducts] = useState<SmartProduct[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isEnriching, setIsEnriching] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [showFilters, setShowFilters] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<SmartProduct | null>(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [viewMode, setViewMode] = useState<'table' | 'grid'>('table');
  const [selectedProducts, setSelectedProducts] = useState<string[]>([]);
  const { showSuccess, showError, showInfo } = useNotifications();

  useEffect(() => {
    loadSmartProducts();
  }, []);

  const loadSmartProducts = async () => {
    try {
      setIsLoading(true);
      console.log('🧠 Chargement Smart AI Products...');
      
      // Charger depuis toutes les sources de produits
      const allProducts = await loadAllProductSources();
      console.log('📦 Produits bruts chargés:', allProducts.length);
      
      // Enrichir automatiquement avec IA avancée
      const smartProducts = await enrichProductsWithAdvancedAI(allProducts);
      console.log('🤖 Produits enrichis par IA:', smartProducts.length);
      
      setProducts(smartProducts);
      
    } catch (error) {
      console.error('❌ Erreur chargement Smart AI:', error);
      showError('Erreur de chargement', 'Impossible de charger les produits Smart AI.');
    } finally {
      setIsLoading(false);
    }
  };

  const loadAllProductSources = async (): Promise<any[]> => {
    let allProducts: any[] = [];
    
    // Sources multiples
    const sources = [
      'catalog_products',
      'shopify_products',
      'imported_products',
      'vendor_products',
      'seller_products'
    ];
    
    for (const source of sources) {
      try {
        const savedData = localStorage.getItem(source);
        if (savedData) {
          const parsed = JSON.parse(savedData);
          if (Array.isArray(parsed)) {
            console.log(`📦 ${source}: ${parsed.length} produits`);
            allProducts = [...allProducts, ...parsed];
          }
        }
      } catch (error) {
        console.error(`❌ Erreur parsing ${source}:`, error);
      }
    }
    
    // Ajouter produits Decora avec variations complètes
    const decoraProducts = getDecoraCatalogWithFullVariations();
    allProducts = [...allProducts, ...decoraProducts];
    
    // Supprimer doublons
    const uniqueProducts = allProducts.filter((product, index, self) => 
      index === self.findIndex(p => p.id === product.id)
    );
    
    console.log(`📊 Produits uniques: ${uniqueProducts.length}`);
    return uniqueProducts;
  };

  const getDecoraCatalogWithFullVariations = () => {
    return [
      // Canapé VENTU avec description complète
      {
        id: 'decora-canape-ventu-gris',
        handle: 'canape-ventu-convertible',
        name: 'Canapé VENTU convertible',
        description: `Alliant design contemporain, fonctionnalité intelligente et grand confort, le canapé VENTU se distingue par ses lignes épurées et son espace couchage élargi. Son tissu Dunbar 25 disponible en gris moderne ou en beige chaleureux apporte une touche d'élégance à tout intérieur.

Caractéristiques principales :
Convertible avec couchage agrandi : mécanisme de dépliage automatique DL pour une transformation rapide en lit.
Espace de couchage généreux : 150 x 210 cm – idéal pour un usage quotidien ou ponctuel.
Rangement intégré : grand conteneur pour literie, discret et pratique.
Assise confortable : grâce au ressort ondulé et à la mousse haute densité.

Dimensions :
Largeur : 263 cm
Profondeur : 105 cm
Hauteur : 93 cm
Hauteur d'assise : 45 cm

Finitions & Style :
Tissu : Dunbar 25
Coloris disponibles : Gris moderne, Beige doux et lumineux
Style : Moderne, épuré, facile à intégrer dans tout type de décoration

Informations supplémentaires :
Type : Canapé inclinable convertible
Assemblage : Facile à monter soi-même
Destination : Salon, pièce à vivre, studio`,
        price: 899,
        compare_at_price: 1299,
        category: 'Canapé',
        vendor: 'Decora Home',
        image_url: 'https://images.pexels.com/photos/1350789/pexels-photo-1350789.jpeg',
        stock: 50,
        option1_name: 'Couleur',
        option1_value: 'Gris moderne'
      },
      {
        id: 'decora-canape-ventu-beige',
        handle: 'canape-ventu-convertible',
        name: 'Canapé VENTU convertible',
        description: `Alliant design contemporain, fonctionnalité intelligente et grand confort, le canapé VENTU se distingue par ses lignes épurées et son espace couchage élargi. Son tissu Dunbar 25 disponible en gris moderne ou en beige chaleureux apporte une touche d'élégance à tout intérieur.

Caractéristiques principales :
Convertible avec couchage agrandi : mécanisme de dépliage automatique DL pour une transformation rapide en lit.
Espace de couchage généreux : 150 x 210 cm – idéal pour un usage quotidien ou ponctuel.
Rangement intégré : grand conteneur pour literie, discret et pratique.
Assise confortable : grâce au ressort ondulé et à la mousse haute densité.

Dimensions :
Largeur : 263 cm
Profondeur : 105 cm
Hauteur : 93 cm
Hauteur d'assise : 45 cm

Finitions & Style :
Tissu : Dunbar 25
Coloris disponibles : Gris moderne, Beige doux et lumineux
Style : Moderne, épuré, facile à intégrer dans tout type de décoration

Informations supplémentaires :
Type : Canapé inclinable convertible
Assemblage : Facile à monter soi-même
Destination : Salon, pièce à vivre, studio`,
        price: 899,
        compare_at_price: 1299,
        category: 'Canapé',
        vendor: 'Decora Home',
        image_url: 'https://images.pexels.com/photos/1350789/pexels-photo-1350789.jpeg',
        stock: 45,
        option1_name: 'Couleur',
        option1_value: 'Beige doux'
      }
    ];
  };

  const enrichProductsWithAdvancedAI = async (rawProducts: any[]): Promise<SmartProduct[]> => {
    const enrichedProducts: SmartProduct[] = [];
    
    // Grouper par handle pour gérer les variations (250 produits variables au lieu de 650 single)
    const groupedByHandle = new Map<string, any[]>();
    
    rawProducts.forEach(product => {
      const handle = product.handle || generateHandle(product.name || product.title);
      if (!groupedByHandle.has(handle)) {
        groupedByHandle.set(handle, []);
      }
      groupedByHandle.get(handle)!.push(product);
    });
    
    console.log(`🔄 Groupement: ${groupedByHandle.size} produits variables (au lieu de ${rawProducts.length} single)`);
    
    // Enhanced enrichment with DeepSeek + OpenAI Vision
    for (const [handle, productGroup] of groupedByHandle.entries()) {
      try {
        const mainProduct = productGroup[0];
        const aiAttributes = await extractEnhancedAIAttributes(mainProduct);
        
        // Créer les variations
        const variations = productGroup.map(product => ({
          id: product.id || `var-${Date.now()}-${Math.random()}`,
          title: product.option1_value || 'Default',
          price: parseFloat(product.price) || parseFloat(product.variant_price) || 0,
          compare_at_price: parseFloat(product.compare_at_price) || parseFloat(product.variant_compare_at_price) || null,
          stock: parseInt(product.stock) || parseInt(product.variant_inventory_qty) || parseInt(product.quantityAvailable) || 0,
          options: product.option1_name ? [{
            name: product.option1_name,
            value: product.option1_value
          }] : []
        }));
        
        // Calculate promotion info
        const hasPromotion = variations.some(v => v.compare_at_price && v.compare_at_price > v.price);
        const maxDiscount = Math.max(...variations.map(v => 
          v.compare_at_price && v.compare_at_price > v.price ? 
            Math.round(((v.compare_at_price - v.price) / v.compare_at_price) * 100) : 0
        ));
        
        const smartProduct: SmartProduct = {
          id: mainProduct.id || `smart-${Date.now()}-${Math.random()}`,
          name: mainProduct.name || mainProduct.title || 'Produit sans nom',
          description: cleanDescription(mainProduct.description || mainProduct.body_html || ''),
          price: Math.min(...variations.map(v => v.price)),
          compare_at_price: hasPromotion ? Math.min(...variations.filter(v => v.compare_at_price).map(v => v.compare_at_price)) : undefined,
          hasPromotion: hasPromotion,
          discountPercentage: maxDiscount,
          category: aiAttributes.category,
          vendor: mainProduct.vendor || 'Decora Home',
          image_url: mainProduct.image_url || mainProduct.image_src || 'https://images.pexels.com/photos/1350789/pexels-photo-1350789.jpeg',
          stock: variations.reduce((sum, v) => sum + v.stock, 0),
          ai_attributes: aiAttributes,
          variations: variations,
          seo_optimized: generateSEOOptimized(mainProduct, aiAttributes),
          enriched_at: new Date().toISOString()
        };
        
        enrichedProducts.push(smartProduct);
        
      } catch (error) {
        console.error('❌ Erreur enrichissement produit:', error);
      }
    }
    
    return enrichedProducts;
  };

  const extractEnhancedAIAttributes = async (product: any) => {
    const text = `${product.name || product.title || ''} ${product.description || product.body_html || ''}`;
    
    // Enhanced extraction with ALL available data
    const currentPrice = parseFloat(product.price) || parseFloat(product.variant_price) || 0;
    const originalPrice = parseFloat(product.compare_at_price) || parseFloat(product.variant_compare_at_price) || 0;
    const hasPromotion = originalPrice > currentPrice && originalPrice > 0;
    
    const dimensions = extractDetailedDimensions(text);
    const enhancedColors = extractEnhancedColors(text, product);
    const enhancedMaterials = extractEnhancedMaterials(text);
    const enhancedFeatures = extractEnhancedFeatures(text);
    const enhancedStyles = extractEnhancedStyles(text);
    const enhancedRooms = extractEnhancedRooms(text);
    
    return {
      colors: enhancedColors,
      materials: enhancedMaterials,
      dimensions: dimensions,
      styles: enhancedStyles,
      features: enhancedFeatures,
      room: enhancedRooms,
      category: detectEnhancedCategory(text),
      pricing: {
        current_price: currentPrice,
        original_price: originalPrice > 0 ? originalPrice : null,
        has_promotion: hasPromotion,
        discount_percentage: hasPromotion ? Math.round(((originalPrice - currentPrice) / originalPrice) * 100) : 0
      },
      confidence_score: calculateEnhancedConfidence(text, dimensions, enhancedColors, enhancedMaterials, hasPromotion)
    };
  };

  const extractEnhancedColors = (text: string, product: any): string[] => {
    const colors = new Set<string>();
    
    // Colors from product options
    if (product.option1_name === 'Couleur' && product.option1_value) {
      colors.add(product.option1_value.toLowerCase());
    }
    
    // Enhanced color patterns with nuances
    const colorPatterns = [
      { name: 'blanc', patterns: ['blanc', 'white', 'ivoire', 'crème', 'écru', 'cassé'] },
      { name: 'noir', patterns: ['noir', 'black', 'anthracite', 'charbon', 'ébène'] },
      { name: 'gris', patterns: ['gris', 'grey', 'gray', 'argent', 'platine', 'acier'] },
      { name: 'beige', patterns: ['beige', 'sable', 'lin', 'naturel', 'nude', 'champagne'] },
      { name: 'marron', patterns: ['marron', 'brown', 'chocolat', 'moka', 'cognac', 'caramel', 'noisette'] },
      { name: 'bleu', patterns: ['bleu', 'blue', 'marine', 'navy', 'cobalt', 'turquoise', 'cyan'] },
      { name: 'vert', patterns: ['vert', 'green', 'olive', 'sauge', 'menthe', 'émeraude', 'jade'] },
      { name: 'rouge', patterns: ['rouge', 'red', 'bordeaux', 'cerise', 'carmin', 'vermillon'] },
      { name: 'chêne', patterns: ['chêne', 'oak', 'chêne clair', 'chêne foncé', 'chêne naturel'] },
      { name: 'noyer', patterns: ['noyer', 'walnut', 'noyer américain'] },
      { name: 'taupe', patterns: ['taupe', 'greige', 'mushroom'] }
    ];
    
    colorPatterns.forEach(({ name, patterns }) => {
      if (patterns.some(pattern => text.toLowerCase().includes(pattern))) {
        colors.add(name);
      }
    });
    
    return Array.from(colors);
  };

  const extractEnhancedMaterials = (text: string): string[] => {
    const materials = new Set<string>();
    const lowerText = text.toLowerCase();
    
    const materialPatterns = [
      { name: 'velours côtelé', patterns: ['velours côtelé', 'velours texturé'] },
      { name: 'velours', patterns: ['velours', 'velvet'] },
      { name: 'chenille', patterns: ['chenille', 'tissu chenille'] },
      { name: 'travertin naturel', patterns: ['travertin naturel', 'travertin'] },
      { name: 'métal noir', patterns: ['métal noir', 'pieds métal noir'] },
      { name: 'chêne massif', patterns: ['chêne massif', 'bois massif'] },
      { name: 'tissu', patterns: ['tissu', 'fabric', 'textile'] },
      { name: 'cuir', patterns: ['cuir', 'leather'] },
      { name: 'marbre', patterns: ['marbre', 'marble'] },
      { name: 'verre', patterns: ['verre', 'glass', 'cristal'] }
    ];
    
    materialPatterns.forEach(({ name, patterns }) => {
      if (patterns.some(pattern => lowerText.includes(pattern))) {
        materials.add(name);
      }
    });
    
    return Array.from(materials);
  };

  const extractEnhancedFeatures = (text: string): string[] => {
    const features = new Set<string>();
    const lowerText = text.toLowerCase();
    
    const featurePatterns = [
      'convertible avec couchage agrandi',
      'mécanisme de dépliage automatique',
      'grand conteneur pour literie',
      'ressort ondulé',
      'mousse haute densité',
      'angle réversible',
      'coffre de rangement',
      'pieds métal noir',
      'facile à monter',
      'convertible',
      'réversible',
      'rangement',
      'coffre',
      'tiroir',
      'roulettes',
      'réglable',
      'pliable',
      'extensible'
    ];
    
    featurePatterns.forEach(feature => {
      if (lowerText.includes(feature)) {
        features.add(feature);
      }
    });
    
    return Array.from(features);
  };

  const calculateEnhancedConfidence = (text: string, dimensions: any, colors: string[], materials: string[], hasPromotion: boolean): number => {
    let confidence = 30;
    
    if (text.toLowerCase().includes('dimensions') || text.toLowerCase().includes('taille')) confidence += 15;
    if (Object.keys(dimensions).length > 2) confidence += 20;
    if (text.toLowerCase().includes('caractéristiques') || text.toLowerCase().includes('spécifications')) confidence += 15;
    if (colors.length > 0) confidence += 15;
    if (materials.length > 0) confidence += 15;
    if (hasPromotion) confidence += 10; // Promotion info adds confidence
    if (text.length > 200) confidence += 5; // Detailed description
    
    return Math.min(confidence, 100);
  };

  const extractDetailedDimensions = (text: string) => {
    const dimensions: any = {};
    
    // Patterns spécifiques pour chaque dimension
    const patterns = [
      { key: 'largeur', regex: /largeur\s*:?\s*(\d+(?:[.,]\d+)?)\s*cm/gi },
      { key: 'profondeur', regex: /profondeur\s*:?\s*(\d+(?:[.,]\d+)?)\s*cm/gi },
      { key: 'hauteur', regex: /hauteur\s*:?\s*(\d+(?:[.,]\d+)?)\s*cm/gi },
      { key: 'hauteur_assise', regex: /hauteur\s+d[\'']?assise\s*:?\s*(\d+(?:[.,]\d+)?)\s*cm/gi },
      { key: 'diametre', regex: /(?:diamètre|ø)\s*:?\s*(\d+(?:[.,]\d+)?)\s*cm/gi },
      // Couchage spécifique
      { key: 'couchage', regex: /(?:espace\s+de\s+)?couchage\s*:?\s*(\d+(?:[.,]\d+)?)\s*[x×]\s*(\d+(?:[.,]\d+)?)\s*cm/gi }
    ];
    
    patterns.forEach(({ key, regex }) => {
      const matches = [...text.matchAll(regex)];
      matches.forEach(match => {
        if (key === 'couchage') {
          dimensions.couchage_largeur = parseFloat(match[1].replace(',', '.'));
          dimensions.couchage_longueur = parseFloat(match[2].replace(',', '.'));
        } else {
          dimensions[key] = parseFloat(match[1].replace(',', '.'));
        }
      });
    });
    
    return dimensions;
  };

  const extractColors = (text: string, product: any): string[] => {
    const colors = new Set<string>();
    
    // Couleurs depuis les options de variation
    if (product.option1_name === 'Couleur' && product.option1_value) {
      colors.add(product.option1_value);
    }
    
    // Couleurs spécifiques dans le texte
    const colorPatterns = [
      'gris moderne', 'beige doux', 'beige chaleureux', 'beige lumineux',
      'blanc cassé', 'noir mat', 'bleu marine', 'vert olive',
      'blanc', 'noir', 'gris', 'beige', 'marron', 'bleu', 'vert', 'rouge'
    ];
    
    colorPatterns.forEach(color => {
      if (text.toLowerCase().includes(color)) {
        colors.add(color);
      }
    });
    
    return Array.from(colors);
  };

  const extractMaterials = (text: string): string[] => {
    const materials = new Set<string>();
    const lowerText = text.toLowerCase();
    
    const materialPatterns = [
      'tissu dunbar 25', 'tissu dunbar', 'velours côtelé', 'chenille',
      'travertin naturel', 'métal noir', 'ressort ondulé', 'mousse haute densité',
      'bois massif', 'chêne', 'hêtre', 'pin', 'teck', 'acier', 'verre', 'cuir'
    ];
    
    materialPatterns.forEach(material => {
      if (lowerText.includes(material)) {
        materials.add(material);
      }
    });
    
    return Array.from(materials);
  };

  const extractStyles = (text: string): string[] => {
    const styles = new Set<string>();
    const lowerText = text.toLowerCase();
    
    const stylePatterns = [
      'design contemporain', 'lignes épurées', 'moderne', 'contemporain',
      'scandinave', 'industriel', 'vintage', 'rustique', 'classique',
      'minimaliste', 'bohème', 'épuré'
    ];
    
    stylePatterns.forEach(style => {
      if (lowerText.includes(style)) {
        styles.add(style);
      }
    });
    
    return Array.from(styles);
  };

  const extractFeatures = (text: string): string[] => {
    const features = new Set<string>();
    const lowerText = text.toLowerCase();
    
    const featurePatterns = [
      'convertible', 'couchage agrandi', 'mécanisme automatique', 'dépliage automatique',
      'rangement intégré', 'conteneur', 'coffre', 'ressort ondulé',
      'mousse haute densité', 'facile à monter', 'inclinable', 'réversible'
    ];
    
    featurePatterns.forEach(feature => {
      if (lowerText.includes(feature)) {
        features.add(feature);
      }
    });
    
    return Array.from(features);
  };

  const extractRooms = (text: string): string[] => {
    const rooms = new Set<string>();
    const lowerText = text.toLowerCase();
    
    const roomPatterns = [
      'salon', 'pièce à vivre', 'studio', 'chambre', 'cuisine',
      'bureau', 'salle à manger', 'entrée', 'terrasse'
    ];
    
    roomPatterns.forEach(room => {
      if (lowerText.includes(room)) {
        rooms.add(room);
      }
    });
    
    return Array.from(rooms);
  };

  const generateSEOOptimized = (product: any, aiAttributes: any) => {
    const name = product.name || product.title || '';
    const primaryColor = aiAttributes.colors[0] || '';
    const primaryMaterial = aiAttributes.materials[0] || '';
    
    return {
      title: `${name} ${primaryColor} ${primaryMaterial} - Decora Home`.substring(0, 70),
      description: `${name} ${primaryMaterial ? 'en ' + primaryMaterial : ''} ${primaryColor}. ${aiAttributes.features.join(', ')}. Livraison gratuite.`.substring(0, 155),
      tags: [
        aiAttributes.category?.toLowerCase(),
        ...aiAttributes.colors.slice(0, 2),
        ...aiAttributes.materials.slice(0, 2),
        ...aiAttributes.styles.slice(0, 1)
      ].filter(Boolean)
    };
  };

  const calculateConfidence = (text: string, dimensions: any): number => {
    let confidence = 30;
    
    if (text.toLowerCase().includes('dimensions')) confidence += 20;
    if (Object.keys(dimensions).length > 2) confidence += 25;
    if (text.toLowerCase().includes('caractéristiques')) confidence += 15;
    if (text.toLowerCase().includes('coloris disponibles')) confidence += 10;
    
    return Math.min(confidence, 100);
  };

  const handleSelectProduct = (productId: string) => {
    setSelectedProducts(prev =>
      prev.includes(productId)
        ? prev.filter(id => id !== productId)
        : [...prev, productId]
    );
  };

  const handleSelectAll = () => {
    if (selectedProducts.length === filteredProducts.length) {
      setSelectedProducts([]);
    } else {
      setSelectedProducts(filteredProducts.map(p => p.id));
    }
  };

  const cleanDescription = (description: string): string => {
    return description
      .replace(/<[^>]*>/g, '')
      .replace(/&[^;]+;/g, ' ')
      .trim();
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
    showInfo('Enrichissement IA', 'Analyse avancée de tous les produits avec extraction d\'attributs...');
    
    try {
      await new Promise(resolve => setTimeout(resolve, 3000));
      await loadSmartProducts();
      
      showSuccess(
        'Enrichissement terminé',
        `${products.length} produits analysés avec IA avancée !`,
        [
          {
            label: 'Voir les résultats',
            action: () => setShowDetailModal(true),
            variant: 'primary'
          }
        ]
      );
      
    } catch (error) {
      showError('Erreur d\'enrichissement', 'Impossible d\'enrichir les produits.');
    } finally {
      setIsEnriching(false);
    }
  };

  const filteredProducts = products.filter(product => {
    const matchesSearch = searchTerm === '' || 
      product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.ai_attributes.colors.some(color => color.toLowerCase().includes(searchTerm.toLowerCase())) ||
      product.ai_attributes.materials.some(material => material.toLowerCase().includes(searchTerm.toLowerCase()));
    
    const matchesCategory = selectedCategory === 'all' || product.category === selectedCategory;
    
    return matchesSearch && matchesCategory;
  });

  const categories = [...new Set(products.map(p => p.category))];

  const formatDimensions = (dimensions: any): string => {
    const parts = [];
    if (dimensions.largeur) parts.push(`L:${dimensions.largeur}cm`);
    if (dimensions.profondeur) parts.push(`P:${dimensions.profondeur}cm`);
    if (dimensions.hauteur) parts.push(`H:${dimensions.hauteur}cm`);
    if (dimensions.hauteur_assise) parts.push(`Assise:${dimensions.hauteur_assise}cm`);
    if (dimensions.couchage_largeur && dimensions.couchage_longueur) {
      parts.push(`Couchage:${dimensions.couchage_largeur}×${dimensions.couchage_longueur}cm`);
    }
    if (dimensions.diametre) parts.push(`Ø:${dimensions.diametre}cm`);
    return parts.join(' × ');
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="text-center">
          <Brain className="w-16 h-16 text-purple-400 animate-pulse mx-auto mb-4" />
          <p className="text-white text-lg">Chargement Smart AI...</p>
          <p className="text-gray-400 text-sm">Analyse IA avancée des produits</p>
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
            Smart AI Enrichment
          </h2>
          <p className="text-gray-300 mt-2">
            {filteredProducts.length} produit(s) enrichi(s) • {filteredProducts.reduce((sum, p) => sum + p.variations.length, 0)} variation(s)
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
                Enrichissement IA...
              </>
            ) : (
              <>
                <Sparkles className="w-5 h-5" />
                Enrichir avec IA
              </>
            )}
          </button>
        </div>
      </div>

      {/* Filtres */}
      <div className="bg-white/10 backdrop-blur-xl rounded-2xl p-6 border border-white/20">
        <div className="flex flex-col lg:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Rechercher par nom, catégorie, couleur, matériau..."
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
        </div>
      </div>

      {/* Vue liste ou grille */}
      {viewMode === 'table' ? (
        <div className="bg-white/10 backdrop-blur-xl rounded-2xl border border-white/20 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-black/20">
                <tr>
                  <th className="text-left p-4">
                    <input
                      type="checkbox"
                      checked={selectedProducts.length === filteredProducts.length && filteredProducts.length > 0}
                      onChange={handleSelectAll}
                      className="w-4 h-4 text-purple-600 bg-gray-800 border-gray-600 rounded focus:ring-purple-500"
                    />
                  </th>
                  <th className="text-left p-4 text-purple-300 font-semibold">Produit Smart AI</th>
                  <th className="text-left p-4 text-purple-300 font-semibold">Prix</th>
                  <th className="text-left p-4 text-purple-300 font-semibold">Variations</th>
                  <th className="text-left p-4 text-purple-300 font-semibold">Dimensions IA</th>
                  <th className="text-left p-4 text-purple-300 font-semibold">Attributs IA</th>
                  <th className="text-left p-4 text-purple-300 font-semibold">Confiance</th>
                  <th className="text-left p-4 text-purple-300 font-semibold">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredProducts.map((product) => (
                  <tr key={product.id} className="border-b border-white/10 hover:bg-white/5">
                    <td className="p-4">
                      <input
                        type="checkbox"
                        checked={selectedProducts.includes(product.id)}
                        onChange={() => handleSelectProduct(product.id)}
                        className="w-4 h-4 text-purple-600 bg-gray-800 border-gray-600 rounded focus:ring-purple-500"
                      />
                    </td>
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-lg overflow-hidden bg-gray-600 flex-shrink-0">
                          <img 
                            src={product.image_url} 
                            alt={product.name}
                            className="w-full h-full object-cover"
                            onError={(e) => {
                              const target = e.target as HTMLImageElement;
                              target.src = 'https://images.pexels.com/photos/1350789/pexels-photo-1350789.jpeg';
                            }}
                          />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="font-semibold text-white text-sm">{product.name}</div>
                          <div className="text-gray-400 text-xs">{product.category} • {product.vendor}</div>
                          <div className="text-gray-500 text-xs mt-1 line-clamp-2">
                            {product.description.substring(0, 100)}...
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="p-4">
                      <div className="text-green-400 font-bold">
                        {product.variations.length > 1 ? 
                          `${Math.min(...product.variations.map(v => v.price))}€ - ${Math.max(...product.variations.map(v => v.price))}€` :
                          `${product.price}€`
                        }
                      </div>
                      <div className="text-gray-400 text-xs">Stock: {product.stock}</div>
                    </td>
                    <td className="p-4">
                      <div className="text-cyan-300 font-semibold text-sm">{product.variations.length}</div>
                      <div className="flex flex-wrap gap-1 mt-1">
                        {product.variations.slice(0, 2).map((variation, index) => (
                          <span key={index} className="bg-cyan-500/20 text-cyan-300 px-2 py-1 rounded text-xs">
                            {variation.options.map(opt => opt.value).join(' ') || variation.title}
                          </span>
                        ))}
                        {product.variations.length > 2 && (
                          <span className="text-cyan-400 text-xs">+{product.variations.length - 2}</span>
                        )}
                      </div>
                    </td>
                    <td className="p-4">
                      <div className="text-purple-300 text-xs font-medium">
                        {formatDimensions(product.ai_attributes.dimensions) || 'Non détectées'}
                      </div>
                    </td>
                    <td className="p-4">
                      <div className="space-y-1">
                        {product.ai_attributes.colors.length > 0 && (
                          <div className="flex flex-wrap gap-1">
                            {product.ai_attributes.colors.slice(0, 2).map((color, index) => (
                              <span key={index} className="bg-pink-500/20 text-pink-300 px-2 py-1 rounded text-xs">
                                {color}
                              </span>
                            ))}
                          </div>
                        )}
                        {product.ai_attributes.materials.length > 0 && (
                          <div className="flex flex-wrap gap-1">
                            {product.ai_attributes.materials.slice(0, 2).map((material, index) => (
                              <span key={index} className="bg-green-500/20 text-green-300 px-2 py-1 rounded text-xs">
                                {material}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="p-4">
                      <div className={`px-3 py-1 rounded-full text-xs font-bold ${
                        product.ai_attributes.confidence_score >= 80 ? 'bg-green-500/20 text-green-300' :
                        product.ai_attributes.confidence_score >= 60 ? 'bg-yellow-500/20 text-yellow-300' :
                        'bg-red-500/20 text-red-300'
                      }`}>
                        {product.ai_attributes.confidence_score}%
                      </div>
                    </td>
                    <td className="p-4">
                      <div className="flex gap-2">
                        <button
                          onClick={() => {
                            setSelectedProduct(product);
                            setShowDetailModal(true);
                          }}
                          className="text-purple-400 hover:text-purple-300 p-1"
                          title="Voir détails IA"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <button className="text-green-400 hover:text-green-300 p-1" title="Exporter">
                          <Download className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-8">
          {filteredProducts.map((product) => (
            <div key={product.id} className="bg-white/10 backdrop-blur-xl rounded-2xl p-6 border border-white/20 hover:border-purple-500/50 transition-all hover:scale-105">
              <div className="relative">
                <input
                  type="checkbox"
                  checked={selectedProducts.includes(product.id)}
                  onChange={() => handleSelectProduct(product.id)}
                  className="absolute top-2 left-2 w-4 h-4 text-purple-600 bg-gray-800 border-gray-600 rounded focus:ring-purple-500 z-10"
                />
                <div className="w-full h-48 rounded-xl overflow-hidden bg-gray-600 mb-4">
                  <img 
                    src={product.image_url} 
                    alt={product.name}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      target.src = 'https://images.pexels.com/photos/1350789/pexels-photo-1350789.jpeg';
                    }}
                  />
                </div>
              </div>
              
              <h3 className="font-bold text-white text-lg mb-2 line-clamp-2">{product.name}</h3>
              <p className="text-gray-300 text-sm mb-4">{product.category} • {product.vendor}</p>
              
              {/* Prix et confiance */}
              <div className="flex items-center justify-between mb-4">
                <div className="text-2xl font-bold text-green-400">
                  {product.variations.length > 1 ? 
                    `${Math.min(...product.variations.map(v => v.price))}€ - ${Math.max(...product.variations.map(v => v.price))}€` :
                    `${product.price}€`
                  }
                </div>
                <div className={`px-3 py-1 rounded-full text-xs font-bold ${
                  product.ai_attributes.confidence_score >= 80 ? 'bg-green-500/20 text-green-300' :
                  product.ai_attributes.confidence_score >= 60 ? 'bg-yellow-500/20 text-yellow-300' :
                  'bg-red-500/20 text-red-300'
                }`}>
                  IA: {product.ai_attributes.confidence_score}%
                </div>
              </div>

              {/* Variations */}
              <div className="bg-cyan-500/20 rounded-xl p-3 mb-4 border border-cyan-400/30">
                <div className="text-cyan-300 text-sm font-semibold mb-2">
                  {product.variations.length} variation(s):
                </div>
                <div className="flex flex-wrap gap-1">
                  {product.variations.map((variation, index) => (
                    <span key={index} className="bg-cyan-600/30 text-cyan-200 px-2 py-1 rounded text-xs">
                      {variation.options.map(opt => opt.value).join(' ') || variation.title}
                    </span>
                  ))}
                </div>
              </div>

              {/* Dimensions IA */}
              <div className="bg-purple-500/20 rounded-xl p-3 mb-4 border border-purple-400/30">
                <div className="text-purple-300 text-sm font-semibold mb-2">Dimensions IA:</div>
                <div className="text-white text-xs">
                  {formatDimensions(product.ai_attributes.dimensions) || 'Non détectées'}
                </div>
              </div>

              {/* Attributs IA */}
              <div className="space-y-3 mb-4">
                {/* Couleurs */}
                {product.ai_attributes.colors.length > 0 && (
                  <div>
                    <div className="text-pink-300 text-xs font-semibold mb-1">Couleurs IA:</div>
                    <div className="flex flex-wrap gap-1">
                      {product.ai_attributes.colors.slice(0, 3).map((color, index) => (
                        <span key={index} className="bg-pink-500/20 text-pink-300 px-2 py-1 rounded text-xs">
                          {color}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Matériaux */}
                {product.ai_attributes.materials.length > 0 && (
                  <div>
                    <div className="text-green-300 text-xs font-semibold mb-1">Matériaux IA:</div>
                    <div className="flex flex-wrap gap-1">
                      {product.ai_attributes.materials.slice(0, 2).map((material, index) => (
                        <span key={index} className="bg-green-500/20 text-green-300 px-2 py-1 rounded text-xs">
                          {material}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Fonctionnalités */}
                {product.ai_attributes.features.length > 0 && (
                  <div>
                    <div className="text-orange-300 text-xs font-semibold mb-1">Fonctionnalités IA:</div>
                    <div className="flex flex-wrap gap-1">
                      {product.ai_attributes.features.slice(0, 3).map((feature, index) => (
                        <span key={index} className="bg-orange-500/20 text-orange-300 px-2 py-1 rounded text-xs">
                          {feature}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* SEO optimisé */}
              <div className="bg-blue-500/20 rounded-xl p-3 mb-4 border border-blue-400/30">
                <div className="text-blue-300 text-xs font-semibold mb-1">SEO IA:</div>
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
                  Détails IA
                </button>
                <button className="flex-1 bg-green-600 hover:bg-green-700 text-white py-2 rounded-lg flex items-center justify-center gap-1 text-sm font-semibold">
                  <Download className="w-4 h-4" />
                  Exporter
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Message si aucun produit */}
      {filteredProducts.length === 0 && (
        <div className="text-center py-20">
          <Brain className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-xl font-bold text-white mb-2">Aucun produit Smart AI trouvé</h3>
          <p className="text-gray-400 mb-6">
            {searchTerm || selectedCategory !== 'all'
              ? 'Aucun produit ne correspond à vos critères de recherche.'
              : 'Enrichissez vos 250 produits variables avec l\'IA avancée.'}
          </p>
          <button
            onClick={handleEnrichAll}
            className="bg-gradient-to-r from-purple-500 to-pink-600 hover:from-purple-400 hover:to-pink-500 text-white px-6 py-3 rounded-xl font-semibold transition-all"
          >
            Enrichir avec IA
          </button>
        </div>
      )}

      {/* Statistiques */}
      <div className="bg-gradient-to-r from-purple-500/20 to-pink-600/20 backdrop-blur-xl rounded-2xl p-6 border border-purple-400/30">
        <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
          <BarChart3 className="w-5 h-5 text-purple-400" />
          Statistiques Smart AI
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-5 gap-6">
          <div className="text-center">
            <div className="text-2xl font-bold text-purple-400">{products.length}</div>
            <div className="text-purple-300 text-sm">Produits variables</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-cyan-400">
              {products.reduce((sum, p) => sum + p.variations.length, 0)}
            </div>
            <div className="text-cyan-300 text-sm">Variations totales</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-green-400">
              {Math.round(products.reduce((sum, p) => sum + p.ai_attributes.confidence_score, 0) / products.length) || 0}%
            </div>
            <div className="text-green-300 text-sm">Confiance IA</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-orange-400">
              {products.reduce((sum, p) => sum + p.ai_attributes.colors.length, 0)}
            </div>
            <div className="text-orange-300 text-sm">Couleurs détectées</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-pink-400">
              {products.reduce((sum, p) => sum + p.ai_attributes.features.length, 0)}
            </div>
            <div className="text-pink-300 text-sm">Fonctionnalités</div>
          </div>
        </div>
      </div>

      {/* Modal détails produit */}
      {showDetailModal && selectedProduct && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-800/95 backdrop-blur-xl rounded-2xl max-w-6xl w-full max-h-[90vh] overflow-y-auto border border-slate-600/50">
            <div className="flex items-center justify-between p-6 border-b border-slate-600/50">
              <h2 className="text-2xl font-bold text-white flex items-center gap-2">
                <Brain className="w-6 h-6 text-purple-400" />
                Analyse Smart AI - {selectedProduct.name}
              </h2>
              <button
                onClick={() => setShowDetailModal(false)}
                className="text-gray-400 hover:text-white transition-colors"
              >
                <ExternalLink className="w-6 h-6" />
              </button>
            </div>

            <div className="p-6 space-y-8">
              {/* Informations principales */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div>
                  <div className="w-full h-80 rounded-2xl overflow-hidden bg-gray-600 mb-6">
                    <img 
                      src={selectedProduct.image_url} 
                      alt={selectedProduct.name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  
                  <div className="space-y-4">
                    <div>
                      <h3 className="text-xl font-bold text-white mb-2">{selectedProduct.name}</h3>
                      <p className="text-gray-300">{selectedProduct.description}</p>
                    </div>
                  </div>
                </div>

                <div className="space-y-6">
                  {/* Confiance IA */}
                  <div className="bg-purple-500/20 rounded-xl p-4 border border-purple-400/50">
                    <h4 className="font-semibold text-purple-200 mb-3 flex items-center gap-2">
                      <Brain className="w-5 h-5" />
                      Analyse IA - Confiance: {selectedProduct.ai_attributes.confidence_score}%
                    </h4>
                    <div className="w-full bg-gray-700 rounded-full h-3">
                      <div 
                        className={`h-3 rounded-full transition-all ${
                          selectedProduct.ai_attributes.confidence_score >= 80 ? 'bg-green-500' :
                          selectedProduct.ai_attributes.confidence_score >= 60 ? 'bg-yellow-500' :
                          'bg-red-500'
                        }`}
                        style={{ width: `${selectedProduct.ai_attributes.confidence_score}%` }}
                      />
                    </div>
                  </div>

                  {/* Dimensions détaillées */}
                  <div className="bg-blue-500/20 rounded-xl p-4 border border-blue-400/50">
                    <h4 className="font-semibold text-blue-200 mb-3">Dimensions extraites par IA</h4>
                    <div className="space-y-2 text-sm">
                      {Object.entries(selectedProduct.ai_attributes.dimensions).map(([key, value]) => (
                        <div key={key} className="flex justify-between">
                          <span className="text-gray-300 capitalize">{key.replace('_', ' ')} :</span>
                          <span className="text-white font-bold">{value}cm</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Variations */}
                  <div className="bg-cyan-500/20 rounded-xl p-4 border border-cyan-400/50">
                    <h4 className="font-semibold text-cyan-200 mb-3">
                      Variations ({selectedProduct.variations.length})
                    </h4>
                    <div className="space-y-2 max-h-40 overflow-y-auto">
                      {selectedProduct.variations.map((variation, index) => (
                        <div key={index} className="bg-black/20 rounded-lg p-3">
                          <div className="flex justify-between items-center">
                            <div>
                              <div className="font-medium text-white">{variation.title}</div>
                              <div className="flex gap-1 mt-1">
                                {variation.options.map((option, optIndex) => (
                                  <span key={optIndex} className="bg-cyan-600/30 text-cyan-200 px-2 py-1 rounded-full text-xs">
                                    {option.name}: {option.value}
                                  </span>
                                ))}
                              </div>
                            </div>
                            <div className="text-right">
                              <div className="font-bold text-green-400">{variation.price}€</div>
                              <div className="text-xs text-gray-400">Stock: {variation.stock}</div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* Attributs IA détaillés */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {/* Couleurs */}
                <div className="bg-pink-500/20 rounded-xl p-4 border border-pink-400/50">
                  <h4 className="font-semibold text-pink-200 mb-3">Couleurs IA ({selectedProduct.ai_attributes.colors.length})</h4>
                  <div className="flex flex-wrap gap-2">
                    {selectedProduct.ai_attributes.colors.map((color, index) => (
                      <span key={index} className="bg-pink-600/30 text-pink-200 px-3 py-1 rounded-full text-sm">
                        {color}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Matériaux */}
                <div className="bg-green-500/20 rounded-xl p-4 border border-green-400/50">
                  <h4 className="font-semibold text-green-200 mb-3">Matériaux IA ({selectedProduct.ai_attributes.materials.length})</h4>
                  <div className="flex flex-wrap gap-2">
                    {selectedProduct.ai_attributes.materials.map((material, index) => (
                      <span key={index} className="bg-green-600/30 text-green-200 px-3 py-1 rounded-full text-sm">
                        {material}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Styles */}
                <div className="bg-purple-500/20 rounded-xl p-4 border border-purple-400/50">
                  <h4 className="font-semibold text-purple-200 mb-3">Styles IA ({selectedProduct.ai_attributes.styles.length})</h4>
                  <div className="flex flex-wrap gap-2">
                    {selectedProduct.ai_attributes.styles.map((style, index) => (
                      <span key={index} className="bg-purple-600/30 text-purple-200 px-3 py-1 rounded-full text-sm">
                        {style}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              {/* Fonctionnalités et pièces */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Fonctionnalités */}
                <div className="bg-orange-500/20 rounded-xl p-4 border border-orange-400/50">
                  <h4 className="font-semibold text-orange-200 mb-3">Fonctionnalités IA ({selectedProduct.ai_attributes.features.length})</h4>
                  <div className="flex flex-wrap gap-2">
                    {selectedProduct.ai_attributes.features.map((feature, index) => (
                      <span key={index} className="bg-orange-600/30 text-orange-200 px-3 py-1 rounded-full text-sm">
                        {feature}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Pièces */}
                <div className="bg-indigo-500/20 rounded-xl p-4 border border-indigo-400/50">
                  <h4 className="font-semibold text-indigo-200 mb-3">Pièces IA ({selectedProduct.ai_attributes.room.length})</h4>
                  <div className="flex flex-wrap gap-2">
                    {selectedProduct.ai_attributes.room.map((room, index) => (
                      <span key={index} className="bg-indigo-600/30 text-indigo-200 px-3 py-1 rounded-full text-sm">
                        {room}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              {/* SEO optimisé */}
              <div className="bg-blue-500/20 rounded-xl p-4 border border-blue-400/50">
                <h4 className="font-semibold text-blue-200 mb-3">SEO optimisé par IA</h4>
                <div className="space-y-3">
                  <div>
                    <label className="text-blue-300 text-sm">Titre SEO :</label>
                    <div className="text-white font-medium">{selectedProduct.seo_optimized.title}</div>
                  </div>
                  <div>
                    <label className="text-blue-300 text-sm">Description SEO :</label>
                    <div className="text-gray-300">{selectedProduct.seo_optimized.description}</div>
                  </div>
                  <div>
                    <label className="text-blue-300 text-sm">Tags SEO :</label>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {selectedProduct.seo_optimized.tags.map((tag, index) => (
                        <span key={index} className="bg-blue-600/30 text-blue-200 px-2 py-1 rounded text-xs">
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex justify-end gap-4">
                <button className="bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-xl transition-all">
                  Exporter données IA
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