import React, { useState, useEffect } from 'react';
import { 
  Brain, Sparkles, Zap, RefreshCw, Download, Upload, 
  BarChart3, CheckCircle, AlertCircle, Loader2, Eye,
  Package, Tag, DollarSign, Image, Settings, Search,
  Filter, ChevronDown, ChevronUp, ExternalLink
} from 'lucide-react';
import { useNotifications } from './NotificationSystem';

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
  const [isAnalyzingVision, setIsAnalyzingVision] = useState(false);
  const [visionAnalysisResults, setVisionAnalysisResults] = useState<{[key: string]: string}>({});
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
    
    // Enrichir chaque groupe de produits
    for (const [handle, productGroup] of groupedByHandle.entries()) {
      try {
        const mainProduct = productGroup[0];
        const aiAttributes = await extractAIAttributes(mainProduct);
        
        // Créer les variations
        const variations = productGroup.map(product => ({
          id: product.id || `var-${Date.now()}-${Math.random()}`,
          title: product.option1_value || 'Default',
          price: parseFloat(product.price) || parseFloat(product.variant_price) || 0,
          stock: parseInt(product.stock) || parseInt(product.variant_inventory_qty) || 0,
          options: product.option1_name ? [{
            name: product.option1_name,
            value: product.option1_value
          }] : []
        }));
        
        const smartProduct: SmartProduct = {
          id: mainProduct.id || `smart-${Date.now()}-${Math.random()}`,
          name: mainProduct.name || mainProduct.title || 'Produit sans nom',
          description: cleanDescription(mainProduct.description || mainProduct.body_html || ''),
          price: Math.min(...variations.map(v => v.price)),
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

  const extractAIAttributes = async (product: any) => {
    const text = `${product.name || product.title || ''} ${product.description || product.body_html || ''}`;
    
    // Extraction avancée des dimensions depuis la description
    const dimensions = extractDetailedDimensions(text);
    
    return {
      colors: extractColors(text, product),
      materials: extractMaterials(text),
      dimensions: dimensions,
      styles: extractStyles(text),
      features: extractFeatures(text),
      room: extractRooms(text),
      confidence_score: calculateConfidence(text, dimensions)
    };
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

  //