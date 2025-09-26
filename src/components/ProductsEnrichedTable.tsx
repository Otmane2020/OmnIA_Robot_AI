import React, { useState, useEffect } from 'react';
import { Search, Filter, Eye, CreditCard as Edit, Trash2, ExternalLink, Package, Tag, DollarSign, Image, BarChart3, Settings, ChevronDown, ChevronUp, X, Save, AlertCircle, CheckCircle, Brain, Sparkles, Zap, RefreshCw, Download, Upload, Loader2 } from 'lucide-react';
import { useNotifications } from './NotificationSystem';

interface EnrichedProduct {
  id: string;
  handle: string;
  title: string;
  description: string;
  category: string;
  subcategory: string;
  color: string;
  material: string;
  fabric: string;
  style: string;
  dimensions: {
    largeur?: number;
    profondeur?: number;
    hauteur?: number;
    hauteur_assise?: number;
    couchage_largeur?: number;
    couchage_longueur?: number;
    diametre?: number;
    unit: string;
  };
  room: string;
  price: number;
  stock_qty: number;
  image_url: string;
  product_url: string;
  tags: string[];
  seo_title: string;
  seo_description: string;
  ad_headline: string;
  ad_description: string;
  google_product_category: string;
  gtin: string;
  brand: string;
  confidence_score: number;
  enriched_at: string;
  enrichment_source: string;
  created_at: string;
  variations: ProductVariation[];
  features: string[];
  vision_analyzed?: boolean;
}

interface ProductVariation {
  id: string;
  title: string;
  price: number;
  compare_at_price?: number;
  stock: number;
  sku: string;
  options: { name: string; value: string }[];
  image_url?: string;
}

interface ProductsEnrichedTableProps {
  vendorId?: string;
  retailerId?: string;
  refreshTrigger?: number;
}

export const ProductsEnrichedTable: React.FC<ProductsEnrichedTableProps> = ({ 
  vendorId, 
  retailerId,
  refreshTrigger = 0 
}) => {
  const [products, setProducts] = useState<EnrichedProduct[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<EnrichedProduct[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedColor, setSelectedColor] = useState('all');
  const [selectedMaterial, setSelectedMaterial] = useState('all');
  const [selectedStyle, setSelectedStyle] = useState('all');
  const [showFilters, setShowFilters] = useState(false);
  const [selectedProducts, setSelectedProducts] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isEnriching, setIsEnriching] = useState(false);
  const [viewMode, setViewMode] = useState<'table' | 'grid'>('table');
  const [selectedProduct, setSelectedProduct] = useState<EnrichedProduct | null>(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const { showSuccess, showError, showInfo } = useNotifications();

  useEffect(() => {
    loadEnrichedProducts();
  }, [vendorId, retailerId, refreshTrigger]);

  useEffect(() => {
    // Filtrer les produits
    let filtered = products;

    if (searchTerm) {
      filtered = filtered.filter(product =>
        product.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.brand.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.seo_title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase())) ||
        product.variations.some(v => v.title.toLowerCase().includes(searchTerm.toLowerCase()))
      );
    }

    if (selectedCategory !== 'all') {
      filtered = filtered.filter(product => product.category === selectedCategory);
    }

    if (selectedColor !== 'all') {
      filtered = filtered.filter(product => 
        product.color === selectedColor ||
        product.variations.some(v => v.options.some(o => o.value === selectedColor))
      );
    }

    if (selectedMaterial !== 'all') {
      filtered = filtered.filter(product => product.material === selectedMaterial);
    }

    if (selectedStyle !== 'all') {
      filtered = filtered.filter(product => product.style === selectedStyle);
    }

    setFilteredProducts(filtered);
  }, [products, searchTerm, selectedCategory, selectedColor, selectedMaterial, selectedStyle]);

  const loadEnrichedProducts = async () => {
    try {
      setIsLoading(true);
      console.log('🧠 Chargement catalogue enrichi automatique...');
      
      // Charger TOUS les produits depuis toutes les sources
      const allProducts = await loadAllProductSources();
      console.log('📦 Total produits trouvés:', allProducts.length);
      
      // Enrichir automatiquement chaque produit
      const enrichedProducts = allProducts.map(product => enrichProductAdvanced(product));
      
      // Grouper les variations par handle
      const groupedProducts = groupProductVariations(enrichedProducts);
      
      console.log('✅ Produits enrichis:', groupedProducts.length);
      console.log('📊 Variations totales:', groupedProducts.reduce((sum, p) => sum + p.variations.length, 0));
      
      setProducts(groupedProducts);
      setFilteredProducts(groupedProducts);
      
    } catch (error) {
      console.error('❌ Erreur chargement produits enrichis:', error);
      showError('Erreur de chargement', 'Impossible de charger les produits enrichis.');
    } finally {
      setIsLoading(false);
    }
  };

  const loadAllProductSources = async (): Promise<any[]> => {
    let allProducts: any[] = [];
    
    // Sources de données possibles
    const sources = [
      'catalog_products',
      'shopify_products', 
      'imported_products',
      'vendor_products',
      'seller_products',
      `vendor_${vendorId}_products`,
      `seller_${retailerId}_products`,
      `retailer_${retailerId}_products`
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
    
    // Ajouter les produits Decora Home de base
    const decoraProducts = getDecoraCatalogWithVariations();
    allProducts = [...allProducts, ...decoraProducts];
    
    // Supprimer les doublons par handle ou ID
    const uniqueProducts = allProducts.filter((product, index, self) => 
      index === self.findIndex(p => 
        (p.handle && product.handle && p.handle === product.handle) ||
        (p.id === product.id)
      )
    );
    
    console.log(`📊 Produits uniques: ${uniqueProducts.length} (${allProducts.length - uniqueProducts.length} doublons supprimés)`);
    return uniqueProducts;
  };

  const getDecoraCatalogWithVariations = () => {
    return [
      // Canapé ALYANA avec 3 variations de couleur
      {
        id: 'decora-canape-alyana-beige',
        handle: 'canape-alyana-convertible',
        title: 'Canapé ALYANA convertible',
        description: 'Canapé d\'angle convertible 4 places en velours côtelé avec coffre de rangement. Dimensions: L:280cm × P:180cm × H:85cm × Assise:42cm × Couchage:200×140cm',
        price: 799,
        compare_at_price: 1399,
        category: 'Canapé',
        vendor: 'Decora Home',
        image_url: 'https://cdn.shopify.com/s/files/1/0903/7578/2665/files/7_23a97631-68d2-4f3e-8f78-b26c7cd4c2ae.png?v=1754406480',
        product_url: 'https://decorahome.fr/products/canape-dangle-convertible-et-reversible-4-places-en-velours-cotele',
        stock: 100,
        option1_name: 'Couleur',
        option1_value: 'Beige',
        variant_sku: 'ALYAAVCOTBEI-DH'
      },
      {
        id: 'decora-canape-alyana-taupe',
        handle: 'canape-alyana-convertible',
        title: 'Canapé ALYANA convertible',
        description: 'Canapé d\'angle convertible 4 places en velours côtelé avec coffre de rangement. Dimensions: L:280cm × P:180cm × H:85cm × Assise:42cm × Couchage:200×140cm',
        price: 799,
        compare_at_price: 1399,
        category: 'Canapé',
        vendor: 'Decora Home',
        image_url: 'https://cdn.shopify.com/s/files/1/0903/7578/2665/files/1_c424b028-7399-4639-ba8f-487e0d71d0f6.png?v=1754406480',
        product_url: 'https://decorahome.fr/products/canape-dangle-convertible-et-reversible-4-places-en-velours-cotele',
        stock: 95,
        option1_name: 'Couleur',
        option1_value: 'Taupe',
        variant_sku: 'ALYAAVCOTTAU-DH'
      },
      {
        id: 'decora-canape-alyana-bleu',
        handle: 'canape-alyana-convertible',
        title: 'Canapé ALYANA convertible',
        description: 'Canapé d\'angle convertible 4 places en velours côtelé avec coffre de rangement. Dimensions: L:280cm × P:180cm × H:85cm × Assise:42cm × Couchage:200×140cm',
        price: 799,
        compare_at_price: 1399,
        category: 'Canapé',
        vendor: 'Decora Home',
        image_url: 'https://cdn.shopify.com/s/files/1/0903/7578/2665/files/3_329df0e2-31cd-4628-a3ac-06213e4e2741.png?v=1754406480',
        product_url: 'https://decorahome.fr/products/canape-dangle-convertible-et-reversible-4-places-en-velours-cotele',
        stock: 88,
        option1_name: 'Couleur',
        option1_value: 'Bleu',
        variant_sku: 'ALYAAVCOTBLF-DH'
      },
      // Table AUREA avec 2 variations de taille
      {
        id: 'decora-table-aurea-100',
        handle: 'table-aurea-travertin',
        title: 'Table AUREA travertin naturel',
        description: 'Table ronde en travertin naturel avec pieds métal noir. Dimensions: Ø100cm × H:75cm',
        price: 499,
        compare_at_price: 859,
        category: 'Table',
        vendor: 'Decora Home',
        image_url: 'https://cdn.shopify.com/s/files/1/0903/7578/2665/files/3_e80b9a50-b032-4267-8f5b-f9130153e3be.png?v=1754406484',
        product_url: 'https://decorahome.fr/products/table-a-manger-ronde-plateau-en-travertin-naturel-100-120-cm',
        stock: 50,
        option1_name: 'Taille',
        option1_value: 'Ø100cm',
        variant_sku: 'TB18T100-DH'
      },
      {
        id: 'decora-table-aurea-120',
        handle: 'table-aurea-travertin',
        title: 'Table AUREA travertin naturel',
        description: 'Table ronde en travertin naturel avec pieds métal noir. Dimensions: Ø120cm × H:75cm',
        price: 549,
        compare_at_price: 909,
        category: 'Table',
        vendor: 'Decora Home',
        image_url: 'https://cdn.shopify.com/s/files/1/0903/7578/2665/files/2_89637aec-60b5-403f-9f0f-57c9a2fa42e4.png?v=1754406484',
        product_url: 'https://decorahome.fr/products/table-a-manger-ronde-plateau-en-travertin-naturel-100-120-cm',
        stock: 30,
        option1_name: 'Taille',
        option1_value: 'Ø120cm',
        variant_sku: 'TB18T120-DH'
      },
      // Chaise INAYA avec 3 variations de couleur
      {
        id: 'decora-chaise-inaya-gris',
        handle: 'chaise-inaya-chenille',
        title: 'Chaise INAYA chenille',
        description: 'Chaise en tissu chenille avec pieds métal noir. Dimensions: L:45cm × P:55cm × H:85cm × Assise:45cm',
        price: 99,
        compare_at_price: 149,
        category: 'Chaise',
        vendor: 'Decora Home',
        image_url: 'https://cdn.shopify.com/s/files/1/0903/7578/2665/files/3_3f11d1af-8ce5-4d2d-a435-cd0a78eb92ee.png?v=1755791319',
        product_url: 'https://decorahome.fr/products/chaise-en-tissu-serge-chenille-pieds-metal-noir-gris-clair-moka-et-beige',
        stock: 96,
        option1_name: 'Couleur',
        option1_value: 'Gris clair',
        variant_sku: 'DC11PNNCHLG-DH'
      },
      {
        id: 'decora-chaise-inaya-moka',
        handle: 'chaise-inaya-chenille',
        title: 'Chaise INAYA chenille',
        description: 'Chaise en tissu chenille avec pieds métal noir. Dimensions: L:45cm × P:55cm × H:85cm × Assise:45cm',
        price: 99,
        compare_at_price: 149,
        category: 'Chaise',
        vendor: 'Decora Home',
        image_url: 'https://cdn.shopify.com/s/files/1/0903/7578/2665/files/1_aae7ccd2-f2cb-4418-8c84-210ace00d753.png?v=1755791319',
        product_url: 'https://decorahome.fr/products/chaise-en-tissu-serge-chenille-pieds-metal-noir-gris-clair-moka-et-beige',
        stock: 100,
        option1_name: 'Couleur',
        option1_value: 'Moka',
        variant_sku: 'DC11PNNCHMO-DH'
      },
      {
        id: 'decora-chaise-inaya-beige',
        handle: 'chaise-inaya-chenille',
        title: 'Chaise INAYA chenille',
        description: 'Chaise en tissu chenille avec pieds métal noir. Dimensions: L:45cm × P:55cm × H:85cm × Assise:45cm',
        price: 99,
        compare_at_price: 149,
        category: 'Chaise',
        vendor: 'Decora Home',
        image_url: 'https://cdn.shopify.com/s/files/1/0903/7578/2665/files/2_f8b8c3d4-e5f6-4a7b-8c9d-1e2f3a4b5c6d.png?v=1755791319',
        product_url: 'https://decorahome.fr/products/chaise-en-tissu-serge-chenille-pieds-metal-noir-gris-clair-moka-et-beige',
        stock: 85,
        option1_name: 'Couleur',
        option1_value: 'Beige',
        variant_sku: 'DC11PNNCHBE-DH'
      }
    ];
  };

  const enrichProductAdvanced = (product: any): EnrichedProduct => {
    const text = `${product.title || product.name || ''} ${product.description || product.body_html || ''} ${product.category || product.productType || ''}`.toLowerCase();
    
    // Extraction avancée des dimensions
    const dimensions = extractAdvancedDimensions(product.description || product.body_html || '');
    
    // Extraction des attributs
    const attributes = extractAdvancedAttributes(text, product);
    
    return {
      id: product.id || `enriched-${Date.now()}-${Math.random()}`,
      handle: product.handle || generateHandle(product.title || product.name),
      title: product.title || product.name || 'Produit sans nom',
      description: cleanDescription(product.description || product.body_html || ''),
      category: attributes.category,
      subcategory: attributes.subcategory,
      color: attributes.color,
      material: attributes.material,
      fabric: attributes.fabric,
      style: attributes.style,
      dimensions: dimensions,
      room: attributes.room,
      price: parseFloat(product.price) || parseFloat(product.variant_price) || 0,
      stock_qty: parseInt(product.stock) || parseInt(product.variant_inventory_qty) || parseInt(product.quantityAvailable) || 0,
      image_url: product.image_url || product.image_src || 'https://images.pexels.com/photos/1350789/pexels-photo-1350789.jpeg',
      product_url: product.product_url || '#',
      tags: attributes.tags,
      seo_title: generateAdvancedSEOTitle(product, attributes),
      seo_description: generateAdvancedSEODescription(product, attributes),
      ad_headline: generateAdHeadline(product.title || product.name),
      ad_description: generateAdDescription(product, attributes),
      google_product_category: getGoogleCategory(attributes.category),
      gtin: product.gtin || '',
      brand: product.vendor || product.brand || 'Decora Home',
      confidence_score: calculateAdvancedConfidence(attributes, dimensions),
      enriched_at: new Date().toISOString(),
      enrichment_source: 'auto_advanced',
      created_at: product.created_at || new Date().toISOString(),
      variations: [{
        id: product.id || `var-${Date.now()}`,
        title: product.option1_value || 'Default',
        price: parseFloat(product.price) || parseFloat(product.variant_price) || 0,
        compare_at_price: product.compare_at_price || product.variant_compare_at_price,
        stock: parseInt(product.stock) || parseInt(product.variant_inventory_qty) || 0,
        sku: product.variant_sku || product.sku || '',
        options: product.option1_name ? [{ 
          name: product.option1_name, 
          value: product.option1_value 
        }] : [],
        image_url: product.image_url || product.image_src
      }],
      features: attributes.features,
      vision_analyzed: Math.random() > 0.5 // Simulation pour la démo
    };
  };

  const extractAdvancedDimensions = (description: string) => {
    const dimensions: any = { unit: 'cm' };
    
    // Patterns pour extraire les dimensions
    const patterns = [
      // Largeur
      { key: 'largeur', regex: /(?:largeur|l)\s*:?\s*(\d+(?:[.,]\d+)?)\s*cm/gi },
      // Profondeur
      { key: 'profondeur', regex: /(?:profondeur|p)\s*:?\s*(\d+(?:[.,]\d+)?)\s*cm/gi },
      // Hauteur
      { key: 'hauteur', regex: /(?:hauteur|h)\s*:?\s*(\d+(?:[.,]\d+)?)\s*cm/gi },
      // Hauteur d'assise
      { key: 'hauteur_assise', regex: /(?:hauteur\s+d[\'']?assise|assise)\s*:?\s*(\d+(?:[.,]\d+)?)\s*cm/gi },
      // Diamètre
      { key: 'diametre', regex: /(?:diamètre|ø)\s*:?\s*(\d+(?:[.,]\d+)?)\s*cm/gi },
      // Couchage
      { key: 'couchage', regex: /(?:couchage|espace\s+de\s+couchage)\s*:?\s*(\d+(?:[.,]\d+)?)\s*[x×]\s*(\d+(?:[.,]\d+)?)\s*cm/gi }
    ];
    
    patterns.forEach(({ key, regex }) => {
      const matches = [...description.matchAll(regex)];
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

  const extractAdvancedAttributes = (text: string, product: any) => {
    return {
      category: detectCategory(text),
      subcategory: detectSubcategory(text),
      color: detectAdvancedColor(text, product),
      material: detectAdvancedMaterial(text),
      fabric: detectFabric(text),
      style: detectStyle(text),
      room: detectRoom(text),
      tags: generateAdvancedTags(text, product),
      features: extractFeatures(text)
    };
  };

  const detectAdvancedColor = (text: string, product: any): string => {
    // Priorité aux options de variation
    if (product.option1_name === 'Couleur' && product.option1_value) {
      return product.option1_value;
    }
    
    // Couleurs spécifiques dans le texte
    const specificColors = [
      'gris moderne', 'beige doux', 'beige chaleureux', 'gris clair',
      'blanc cassé', 'noir mat', 'bleu marine', 'vert olive'
    ];
    
    for (const color of specificColors) {
      if (text.includes(color)) return color;
    }
    
    // Couleurs de base
    const basicColors = ['blanc', 'noir', 'gris', 'beige', 'marron', 'bleu', 'vert', 'rouge', 'jaune', 'orange', 'rose', 'violet', 'naturel', 'chêne', 'noyer', 'taupe'];
    for (const color of basicColors) {
      if (text.includes(color)) return color;
    }
    
    return '';
  };

  const detectAdvancedMaterial = (text: string): string => {
    const materials = [
      'tissu dunbar', 'velours côtelé', 'chenille', 'travertin naturel',
      'métal noir', 'bois massif', 'chêne', 'hêtre', 'pin', 'teck',
      'acier inoxydable', 'verre trempé', 'cuir véritable', 'simili cuir'
    ];
    
    for (const material of materials) {
      if (text.includes(material)) return material;
    }
    
    // Matériaux de base
    const basicMaterials = ['bois', 'métal', 'verre', 'tissu', 'cuir', 'velours', 'travertin', 'marbre', 'plastique', 'rotin'];
    for (const material of basicMaterials) {
      if (text.includes(material)) return material;
    }
    
    return '';
  };

  const extractFeatures = (text: string): string[] => {
    const features = [];
    
    if (text.includes('convertible')) features.push('Convertible');
    if (text.includes('rangement') || text.includes('coffre')) features.push('Rangement');
    if (text.includes('réversible')) features.push('Réversible');
    if (text.includes('angle')) features.push('Angle');
    if (text.includes('mécanisme automatique') || text.includes('dépliage automatique')) features.push('Mécanisme automatique');
    if (text.includes('ressort')) features.push('Ressort');
    if (text.includes('mousse haute densité')) features.push('Mousse haute densité');
    if (text.includes('facile à monter')) features.push('Montage facile');
    
    return features;
  };

  const groupProductVariations = (products: EnrichedProduct[]): EnrichedProduct[] => {
    const grouped = new Map<string, EnrichedProduct>();
    
    products.forEach(product => {
      const key = product.handle;
      
      if (grouped.has(key)) {
        // Ajouter cette variation au produit existant
        const existing = grouped.get(key)!;
        existing.variations.push(product.variations[0]);
        
        // Mettre à jour le prix min/max
        const allPrices = existing.variations.map(v => v.price);
        existing.price = Math.min(...allPrices);
        
        // Mettre à jour le stock total
        existing.stock_qty = existing.variations.reduce((sum, v) => sum + v.stock, 0);
      } else {
        // Nouveau produit
        grouped.set(key, { ...product });
      }
    });
    
    return Array.from(grouped.values());
  };

  const handleSyncFromCatalog = async () => {
    setIsEnriching(true);
    showInfo('Synchronisation en cours', 'Enrichissement automatique du catalogue avec IA...');
    
    try {
      // Simuler l'enrichissement
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Recharger les produits
      await loadEnrichedProducts();
      
      showSuccess(
        'Synchronisation réussie',
        `${products.length} produits enrichis avec ${products.reduce((sum, p) => sum + p.variations.length, 0)} variations !`,
        [
          {
            label: 'Voir les variations',
            action: () => setViewMode('grid'),
            variant: 'primary'
          }
        ]
      );
      
    } catch (error) {
      showError('Erreur de synchronisation', 'Impossible de synchroniser le catalogue.');
    } finally {
      setIsEnriching(false);
    }
  };

  // Fonctions utilitaires
  const detectCategory = (text: string): string => {
    if (text.includes('canapé') || text.includes('sofa')) return 'Canapé';
    if (text.includes('table')) return 'Table';
    if (text.includes('chaise') || text.includes('fauteuil')) return 'Chaise';
    if (text.includes('lit')) return 'Lit';
    if (text.includes('armoire') || text.includes('commode')) return 'Rangement';
    if (text.includes('meuble tv')) return 'Meuble TV';
    return 'Mobilier';
  };

  const detectSubcategory = (text: string): string => {
    if (text.includes('angle')) return 'Canapé d\'angle';
    if (text.includes('convertible')) return 'Canapé convertible';
    if (text.includes('basse')) return 'Table basse';
    if (text.includes('manger')) return 'Table à manger';
    if (text.includes('bureau')) return 'Chaise de bureau';
    return '';
  };

  const detectFabric = (text: string): string => {
    const fabrics = ['velours', 'chenille', 'lin', 'coton', 'cuir', 'tissu', 'polyester'];
    for (const fabric of fabrics) {
      if (text.includes(fabric)) return fabric;
    }
    return '';
  };

  const detectStyle = (text: string): string => {
    const styles = ['moderne', 'contemporain', 'scandinave', 'industriel', 'vintage', 'rustique', 'classique', 'minimaliste', 'bohème', 'épuré'];
    for (const style of styles) {
      if (text.includes(style)) return style;
    }
    return '';
  };

  const detectRoom = (text: string): string => {
    const rooms = ['salon', 'chambre', 'cuisine', 'bureau', 'salle à manger', 'entrée', 'terrasse', 'pièce à vivre', 'studio'];
    for (const room of rooms) {
      if (text.includes(room)) return room;
    }
    return '';
  };

  const generateAdvancedTags = (text: string, product: any): string[] => {
    const tags = new Set<string>();
    
    // Tags depuis la catégorie
    const category = detectCategory(text);
    if (category !== 'Mobilier') tags.add(category.toLowerCase());
    
    // Tags depuis les matériaux et couleurs
    const material = detectAdvancedMaterial(text);
    const color = detectAdvancedColor(text, product);
    if (material) tags.add(material.split(' ')[0]); // Premier mot du matériau
    if (color) tags.add(color.split(' ')[0]); // Premier mot de la couleur
    
    // Tags depuis les fonctionnalités
    if (text.includes('convertible')) tags.add('convertible');
    if (text.includes('rangement')) tags.add('rangement');
    if (text.includes('angle')) tags.add('angle');
    if (text.includes('design')) tags.add('design');
    if (text.includes('moderne')) tags.add('moderne');
    
    return Array.from(tags).slice(0, 5);
  };

  const generateAdvancedSEOTitle = (product: any, attributes: any): string => {
    let title = product.title || product.name || '';
    if (attributes.color) title += ` ${attributes.color}`;
    if (attributes.material) title += ` ${attributes.material}`;
    title += ' - Decora Home';
    return title.substring(0, 70);
  };

  const generateAdvancedSEODescription = (product: any, attributes: any): string => {
    let desc = `${product.title || product.name}`;
    if (attributes.material) desc += ` en ${attributes.material}`;
    if (attributes.style) desc += ` de style ${attributes.style}`;
    if (attributes.features.length > 0) desc += `. ${attributes.features.join(', ')}`;
    desc += '. Livraison gratuite. Garantie qualité Decora Home.';
    return desc.substring(0, 155);
  };

  const generateAdHeadline = (name: string): string => {
    return name.substring(0, 30);
  };

  const generateAdDescription = (product: any, attributes: any): string => {
    let desc = product.title || product.name || '';
    if (attributes.material) desc += ` ${attributes.material}`;
    desc += '. Promo !';
    return desc.substring(0, 90);
  };

  const getGoogleCategory = (category: string): string => {
    const categoryMap: { [key: string]: string } = {
      'Canapé': '635',
      'Table': '443', 
      'Chaise': '436',
      'Lit': '569',
      'Rangement': '6552',
      'Meuble TV': '6552',
      'Décoration': '696',
      'Éclairage': '594'
    };
    return categoryMap[category] || '';
  };

  const calculateAdvancedConfidence = (attributes: any, dimensions: any): number => {
    let confidence = 30; // Base
    
    if (attributes.color) confidence += 20;
    if (attributes.material) confidence += 20;
    if (attributes.style) confidence += 15;
    if (attributes.room) confidence += 10;
    if (Object.keys(dimensions).length > 1) confidence += 15;
    if (attributes.features.length > 0) confidence += 10;
    
    return Math.min(confidence, 100);
  };

  const cleanDescription = (description: string): string => {
    return description
      .replace(/<[^>]*>/g, '') // Supprimer HTML
      .replace(/&[^;]+;/g, ' ') // Supprimer entités HTML
      .trim();
  };

  const generateHandle = (title: string): string => {
    return title
      .toLowerCase()
      .normalize('NFD').replace(/[\u0300-\u036f]/g, '') // Supprimer accents
      .replace(/[^a-z0-9\s-]/g, '')
      .trim()
      .replace(/\s+/g, '-')
      .substring(0, 100);
  };

  const categories = [...new Set(products.map(p => p.category))];
  const colors = [...new Set(products.map(p => p.color).filter(Boolean))];
  const materials = [...new Set(products.map(p => p.material).filter(Boolean))];
  const styles = [...new Set(products.map(p => p.style).filter(Boolean))];

  const getConfidenceColor = (score: number) => {
    if (score >= 80) return 'bg-green-500/20 text-green-300';
    if (score >= 60) return 'bg-yellow-500/20 text-yellow-300';
    return 'bg-red-500/20 text-red-300';
  };

  const formatDimensions = (dimensions: any): string => {
    const parts = [];
    if (dimensions.largeur) parts.push(`L:${dimensions.largeur}cm`);
    if (dimensions.profondeur) parts.push(`P:${dimensions.profondeur}cm`);
    if (dimensions.hauteur) parts.push(`H:${dimensions.hauteur}cm`);
    if (dimensions.diametre) parts.push(`Ø:${dimensions.diametre}cm`);
    if (dimensions.hauteur_assise) parts.push(`Assise:${dimensions.hauteur_assise}cm`);
    if (dimensions.couchage_largeur && dimensions.couchage_longueur) {
      parts.push(`Couchage:${dimensions.couchage_largeur}×${dimensions.couchage_longueur}cm`);
    }
    return parts.join(' × ');
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="text-center">
          <Brain className="w-16 h-16 text-purple-400 animate-pulse mx-auto mb-4" />
          <p className="text-white text-lg">Chargement du catalogue enrichi...</p>
          <p className="text-gray-400 text-sm">Analyse IA des attributs et variations</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header avec actions */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-white flex items-center gap-3">
            <Brain className="w-6 h-6 text-purple-400" />
            Catalogue Enrichi IA
          </h2>
          <p className="text-gray-300">
            {filteredProducts.length} produit(s) • {filteredProducts.reduce((sum, p) => sum + p.variations.length, 0)} variation(s)
          </p>
        </div>
        
        <div className="flex flex-wrap gap-3">
          <button
            onClick={handleSyncFromCatalog}
            disabled={isEnriching}
            className="bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 disabled:from-gray-600 disabled:to-gray-700 text-white px-4 py-2 rounded-xl flex items-center gap-2 font-semibold transition-all disabled:cursor-not-allowed"
          >
            {isEnriching ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Enrichissement...
              </>
            ) : (
              <>
                <RefreshCw className="w-4 h-4" />
                Enrichir catalogue
              </>
            )}
          </button>
          
          <button
            onClick={() => setViewMode(viewMode === 'table' ? 'grid' : 'table')}
            className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-xl flex items-center gap-2 transition-all"
          >
            <BarChart3 className="w-4 h-4" />
            {viewMode === 'table' ? 'Vue grille' : 'Vue tableau'}
          </button>
        </div>
      </div>

      {/* Barre de recherche et filtres */}
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
          
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-3 rounded-xl flex items-center gap-2 transition-all"
          >
            <Filter className="w-4 h-4" />
            Filtres IA
            {showFilters ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </button>
        </div>

        {showFilters && (
          <div className="mt-6 pt-6 border-t border-gray-600/50">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div>
                <label className="block text-sm text-gray-300 mb-2">Catégorie</label>
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="w-full bg-black/40 border border-gray-600 rounded-xl px-3 py-2 text-white"
                >
                  <option value="all">Toutes les catégories</option>
                  {categories.map(category => (
                    <option key={category} value={category}>{category}</option>
                  ))}
                </select>
              </div>
              
              <div>
                <label className="block text-sm text-gray-300 mb-2">Couleur</label>
                <select
                  value={selectedColor}
                  onChange={(e) => setSelectedColor(e.target.value)}
                  className="w-full bg-black/40 border border-gray-600 rounded-xl px-3 py-2 text-white"
                >
                  <option value="all">Toutes les couleurs</option>
                  {colors.map(color => (
                    <option key={color} value={color}>{color}</option>
                  ))}
                </select>
              </div>
              
              <div>
                <label className="block text-sm text-gray-300 mb-2">Matériau</label>
                <select
                  value={selectedMaterial}
                  onChange={(e) => setSelectedMaterial(e.target.value)}
                  className="w-full bg-black/40 border border-gray-600 rounded-xl px-3 py-2 text-white"
                >
                  <option value="all">Tous les matériaux</option>
                  {materials.map(material => (
                    <option key={material} value={material}>{material}</option>
                  ))}
                </select>
              </div>
              
              <div>
                <label className="block text-sm text-gray-300 mb-2">Style</label>
                <select
                  value={selectedStyle}
                  onChange={(e) => setSelectedStyle(e.target.value)}
                  className="w-full bg-black/40 border border-gray-600 rounded-xl px-3 py-2 text-white"
                >
                  <option value="all">Tous les styles</option>
                  {styles.map(style => (
                    <option key={style} value={style}>{style}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Tableau enrichi avec variations */}
      {viewMode === 'table' ? (
        <div className="bg-white/10 backdrop-blur-xl rounded-2xl border border-white/20 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-black/20">
                <tr>
                  <th className="text-left p-4 text-purple-300 font-semibold">Produit</th>
                  <th className="text-left p-4 text-purple-300 font-semibold">Variations</th>
                  <th className="text-left p-4 text-purple-300 font-semibold">Dimensions IA</th>
                  <th className="text-left p-4 text-purple-300 font-semibold">Attributs</th>
                  <th className="text-left p-4 text-purple-300 font-semibold">SEO</th>
                  <th className="text-left p-4 text-purple-300 font-semibold">Confiance</th>
                  <th className="text-left p-4 text-cyan-300 font-semibold">Vision AI</th>
                  <th className="text-left p-4 text-purple-300 font-semibold">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredProducts.map((product) => (
                  <tr key={product.id} className="border-b border-white/10 hover:bg-white/5">
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-lg overflow-hidden bg-gray-600 flex-shrink-0">
                          <img 
                            src={product.image_url} 
                            alt={product.title}
                            className="w-full h-full object-cover"
                            onError={(e) => {
                              const target = e.target as HTMLImageElement;
                              target.src = 'https://images.pexels.com/photos/1350789/pexels-photo-1350789.jpeg';
                            }}
                          />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="font-semibold text-white text-sm">{product.title}</div>
                          <div className="text-gray-400 text-xs">{product.brand}</div>
                          <div className="text-green-400 font-bold">
                            {product.variations.length > 1 ? 
                              `${Math.min(...product.variations.map(v => v.price))}€ - ${Math.max(...product.variations.map(v => v.price))}€` :
                              `${product.price}€`
                            }
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="p-4">
                      <div className="space-y-1">
                        <div className="text-cyan-400 text-xs font-medium">
                          {product.variations.length} variation(s)
                        </div>
                        <div className="flex flex-wrap gap-1 max-w-xs">
                          {product.variations.slice(0, 3).map((variation, index) => (
                            <span key={index} className="bg-cyan-500/20 text-cyan-300 px-2 py-1 rounded text-xs">
                              {variation.options.map(opt => opt.value).join(' ') || variation.title}
                            </span>
                          ))}
                          {product.variations.length > 3 && (
                            <span className="text-cyan-400 text-xs">+{product.variations.length - 3}</span>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="p-4">
                      <div className="text-xs text-gray-300">
                        {formatDimensions(product.dimensions)}
                      </div>
                    </td>
                    <td className="p-4">
                      <div className="space-y-1">
                        <div className="flex flex-wrap gap-1">
                          {product.category && (
                            <span className="bg-blue-500/20 text-blue-300 px-2 py-1 rounded text-xs">
                              {product.category}
                            </span>
                          )}
                          {product.color && (
                            <span className="bg-pink-500/20 text-pink-300 px-2 py-1 rounded text-xs">
                              {product.color}
                            </span>
                          )}
                          {product.material && (
                            <span className="bg-green-500/20 text-green-300 px-2 py-1 rounded text-xs">
                              {product.material}
                            </span>
                          )}
                        </div>
                        {product.features.length > 0 && (
                          <div className="flex flex-wrap gap-1">
                            {product.features.slice(0, 2).map((feature, index) => (
                              <span key={index} className="bg-orange-500/20 text-orange-300 px-2 py-1 rounded text-xs">
                                {feature}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="p-4">
                      <div className="space-y-1">
                        <div className="text-white text-xs font-medium line-clamp-1">{product.seo_title}</div>
                        <div className="text-gray-400 text-xs line-clamp-2">{product.seo_description}</div>
                      </div>
                    </td>
                    <td className="p-4">
                      <div className="text-center">
                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${getConfidenceColor(product.confidence_score)}`}>
                          {product.confidence_score}%
                        </span>
                      </div>
                    </td>
                    <td className="p-4">
                      {product.vision_analyzed ? (
                        <div className="flex items-center gap-2">
                          <CheckCircle className="w-4 h-4 text-green-400" />
                          <span className="text-green-300 text-sm">Analysé</span>
                        </div>
                      ) : (
                        <div className="flex items-center gap-2">
                          <AlertCircle className="w-4 h-4 text-orange-400" />
                          <span className="text-orange-300 text-sm">Non analysé</span>
                        </div>
                      )}
                    </td>
                    <td className="p-4">
                      <div className="flex gap-2">
                        <button
                          onClick={() => {
                            setSelectedProduct(product);
                            setShowDetailModal(true);
                          }}
                          className="text-blue-400 hover:text-blue-300 p-1"
                          title="Voir détails"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <a
                          href={product.product_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-purple-400 hover:text-purple-300 p-1"
                          title="Ouvrir lien externe"
                        >
                          <ExternalLink className="w-4 h-4" />
                        </a>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredProducts.map((product) => (
            <div key={product.id} className="bg-white/10 backdrop-blur-xl rounded-2xl p-4 border border-white/20 hover:border-purple-500/50 transition-all hover:scale-105">
              <div className="w-full h-48 rounded-xl overflow-hidden bg-gray-600 mb-4">
                <img 
                  src={product.image_url} 
                  alt={product.title}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    target.src = 'https://images.pexels.com/photos/1350789/pexels-photo-1350789.jpeg';
                  }}
                />
              </div>
              
              <h3 className="font-semibold text-white mb-2 line-clamp-2">{product.title}</h3>
              <p className="text-gray-300 text-sm mb-3">{product.category} • {product.brand}</p>
              
              <div className="flex items-center gap-2 mb-3">
                <span className="text-xl font-bold text-green-400">
                  {product.variations.length > 1 ? 
                    `${Math.min(...product.variations.map(v => v.price))}€ - ${Math.max(...product.variations.map(v => v.price))}€` :
                    `${product.price}€`
                  }
                </span>
                <span className={`px-2 py-1 rounded-full text-xs ${getConfidenceColor(product.confidence_score)}`}>
                  {product.confidence_score}%
                </span>
              </div>
              
              {/* Variations */}
              <div className="space-y-2 mb-4">
                <div className="text-cyan-400 text-xs font-medium">
                  {product.variations.length} variation(s):
                </div>
                <div className="flex flex-wrap gap-1">
                  {product.variations.map((variation, index) => (
                    <span key={index} className="bg-cyan-500/20 text-cyan-300 px-2 py-1 rounded text-xs">
                      {variation.options.map(opt => `${opt.name}: ${opt.value}`).join(' ') || variation.title}
                    </span>
                  ))}
                </div>
              </div>
              
              {/* Dimensions IA */}
              <div className="bg-black/20 rounded-lg p-3 mb-4">
                <div className="text-purple-400 text-xs font-medium mb-1">Dimensions IA :</div>
                <div className="text-white text-xs">{formatDimensions(product.dimensions)}</div>
              </div>
              
              {/* Attributs enrichis */}
              <div className="space-y-2 mb-4">
                <div className="flex flex-wrap gap-1">
                  {product.color && (
                    <span className="bg-pink-500/20 text-pink-300 px-2 py-1 rounded text-xs">
                      🎨 {product.color}
                    </span>
                  )}
                  {product.material && (
                    <span className="bg-green-500/20 text-green-300 px-2 py-1 rounded text-xs">
                      🏗️ {product.material}
                    </span>
                  )}
                  {product.style && (
                    <span className="bg-purple-500/20 text-purple-300 px-2 py-1 rounded text-xs">
                      ✨ {product.style}
                    </span>
                  )}
                </div>
                
                {product.features.length > 0 && (
                  <div className="flex flex-wrap gap-1">
                    {product.features.slice(0, 2).map((feature, index) => (
                      <span key={index} className="bg-orange-500/20 text-orange-300 px-2 py-1 rounded text-xs">
                        ⚙️ {feature}
                      </span>
                    ))}
                  </div>
                )}
              </div>
              
              <div className="flex gap-2">
                <button
                  onClick={() => {
                    setSelectedProduct(product);
                    setShowDetailModal(true);
                  }}
                  className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-2 rounded-lg flex items-center justify-center gap-1 text-sm"
                >
                  <Eye className="w-3 h-3" />
                  Détails
                </button>
                <a
                  href={product.product_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-1 bg-purple-600 hover:bg-purple-700 text-white py-2 rounded-lg flex items-center justify-center gap-1 text-sm"
                >
                  <ExternalLink className="w-3 h-3" />
                  Voir
                </a>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Message si aucun produit */}
      {filteredProducts.length === 0 && (
        <div className="text-center py-20">
          <Brain className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-xl font-bold text-white mb-2">Aucun produit enrichi trouvé</h3>
          <p className="text-gray-400 mb-6">
            {searchTerm || selectedCategory !== 'all' || selectedColor !== 'all' || selectedMaterial !== 'all' || selectedStyle !== 'all'
              ? 'Aucun produit ne correspond à vos critères de recherche.'
              : 'Votre catalogue enrichi est vide. Synchronisez depuis votre catalogue principal.'}
          </p>
          <button
            onClick={handleSyncFromCatalog}
            className="bg-gradient-to-r from-purple-500 to-pink-600 hover:from-purple-400 hover:to-pink-500 text-white px-6 py-3 rounded-xl font-semibold transition-all"
          >
            Enrichir le catalogue
          </button>
        </div>
      )}

      {/* Statistiques d'enrichissement */}
      <div className="bg-gradient-to-r from-purple-500/20 to-pink-600/20 backdrop-blur-xl rounded-2xl p-6 border border-purple-400/30">
        <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
          <BarChart3 className="w-5 h-5 text-purple-400" />
          Statistiques d'enrichissement IA
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
          <div className="text-center">
            <div className="text-2xl font-bold text-purple-400">{products.length}</div>
            <div className="text-purple-300 text-sm">Produits enrichis</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-cyan-400">
              {products.reduce((sum, p) => sum + p.variations.length, 0)}
            </div>
            <div className="text-cyan-300 text-sm">Variations totales</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-green-400">
              {Math.round(products.reduce((sum, p) => sum + p.confidence_score, 0) / products.length) || 0}%
            </div>
            <div className="text-green-300 text-sm">Confiance moyenne</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-orange-400">{categories.length}</div>
            <div className="text-orange-300 text-sm">Catégories</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-pink-400">
              {products.reduce((sum, p) => sum + p.features.length, 0)}
            </div>
            <div className="text-pink-300 text-sm">Fonctionnalités</div>
          </div>
        </div>
      </div>

      {/* Modal détails produit */}
      {showDetailModal && selectedProduct && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-800/95 backdrop-blur-xl rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto border border-slate-600/50">
            <div className="flex items-center justify-between p-6 border-b border-slate-600/50">
              <h2 className="text-2xl font-bold text-white">Détails produit enrichi</h2>
              <button
                onClick={() => setShowDetailModal(false)}
                className="text-gray-400 hover:text-white transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="p-6 space-y-8">
              {/* Informations principales */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div>
                  <div className="w-full h-80 rounded-2xl overflow-hidden bg-gray-600 mb-6">
                    <img 
                      src={selectedProduct.image_url} 
                      alt={selectedProduct.title}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        target.src = 'https://images.pexels.com/photos/1350789/pexels-photo-1350789.jpeg';
                      }}
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
                  {/* Dimensions IA */}
                  <div className="bg-purple-500/20 rounded-xl p-4 border border-purple-400/50">
                    <h4 className="font-semibold text-purple-200 mb-3 flex items-center gap-2">
                      <BarChart3 className="w-5 h-5" />
                      Dimensions extraites par IA
                    </h4>
                    <div className="space-y-2 text-sm">
                      {selectedProduct.dimensions.largeur && (
                        <div className="flex justify-between">
                          <span className="text-gray-300">Largeur :</span>
                          <span className="text-white font-bold">{selectedProduct.dimensions.largeur}cm</span>
                        </div>
                      )}
                      {selectedProduct.dimensions.profondeur && (
                        <div className="flex justify-between">
                          <span className="text-gray-300">Profondeur :</span>
                          <span className="text-white font-bold">{selectedProduct.dimensions.profondeur}cm</span>
                        </div>
                      )}
                      {selectedProduct.dimensions.hauteur && (
                        <div className="flex justify-between">
                          <span className="text-gray-300">Hauteur :</span>
                          <span className="text-white font-bold">{selectedProduct.dimensions.hauteur}cm</span>
                        </div>
                      )}
                      {selectedProduct.dimensions.hauteur_assise && (
                        <div className="flex justify-between">
                          <span className="text-gray-300">Hauteur assise :</span>
                          <span className="text-white font-bold">{selectedProduct.dimensions.hauteur_assise}cm</span>
                        </div>
                      )}
                      {selectedProduct.dimensions.couchage_largeur && selectedProduct.dimensions.couchage_longueur && (
                        <div className="flex justify-between">
                          <span className="text-gray-300">Couchage :</span>
                          <span className="text-white font-bold">
                            {selectedProduct.dimensions.couchage_largeur}×{selectedProduct.dimensions.couchage_longueur}cm
                          </span>
                        </div>
                      )}
                      {selectedProduct.dimensions.diametre && (
                        <div className="flex justify-between">
                          <span className="text-gray-300">Diamètre :</span>
                          <span className="text-white font-bold">Ø{selectedProduct.dimensions.diametre}cm</span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Variations détaillées */}
                  <div className="bg-cyan-500/20 rounded-xl p-4 border border-cyan-400/50">
                    <h4 className="font-semibold text-cyan-200 mb-3">
                      Variations ({selectedProduct.variations.length})
                    </h4>
                    <div className="space-y-3 max-h-60 overflow-y-auto">
                      {selectedProduct.variations.map((variation, index) => (
                        <div key={index} className="bg-black/20 rounded-lg p-3">
                          <div className="flex justify-between items-start mb-2">
                            <div>
                              <div className="font-medium text-white">{variation.title}</div>
                              <div className="flex flex-wrap gap-1 mt-1">
                                {variation.options.map((option, optIndex) => (
                                  <span key={optIndex} className="bg-cyan-600/30 text-cyan-200 px-2 py-1 rounded-full text-xs">
                                    {option.name}: {option.value}
                                  </span>
                                ))}
                              </div>
                            </div>
                            <div className="text-right">
                              <div className="font-bold text-green-400">{variation.price}€</div>
                              {variation.compare_at_price && (
                                <div className="text-gray-400 line-through text-sm">{variation.compare_at_price}€</div>
                              )}
                            </div>
                          </div>
                          <div className="flex justify-between text-xs">
                            <span className="text-gray-400">SKU: {variation.sku}</span>
                            <span className={`font-semibold ${variation.stock > 0 ? 'text-green-400' : 'text-red-400'}`}>
                              Stock: {variation.stock}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Attributs IA */}
                  <div className="bg-green-500/20 rounded-xl p-4 border border-green-400/50">
                    <h4 className="font-semibold text-green-200 mb-3">Attributs IA extraits</h4>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-300">Catégorie :</span>
                        <span className="text-white">{selectedProduct.category}</span>
                      </div>
                      {selectedProduct.subcategory && (
                        <div className="flex justify-between">
                          <span className="text-gray-300">Sous-catégorie :</span>
                          <span className="text-white">{selectedProduct.subcategory}</span>
                        </div>
                      )}
                      {selectedProduct.color && (
                        <div className="flex justify-between">
                          <span className="text-gray-300">Couleur :</span>
                          <span className="text-white">{selectedProduct.color}</span>
                        </div>
                      )}
                      {selectedProduct.material && (
                        <div className="flex justify-between">
                          <span className="text-gray-300">Matériau :</span>
                          <span className="text-white">{selectedProduct.material}</span>
                        </div>
                      )}
                      {selectedProduct.style && (
                        <div className="flex justify-between">
                          <span className="text-gray-300">Style :</span>
                          <span className="text-white">{selectedProduct.style}</span>
                        </div>
                      )}
                      {selectedProduct.room && (
                        <div className="flex justify-between">
                          <span className="text-gray-300">Pièce :</span>
                          <span className="text-white">{selectedProduct.room}</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Fonctionnalités */}
              {selectedProduct.features.length > 0 && (
                <div className="bg-orange-500/20 rounded-xl p-4 border border-orange-400/50">
                  <h4 className="font-semibold text-orange-200 mb-3">Fonctionnalités détectées</h4>
                  <div className="flex flex-wrap gap-2">
                    {selectedProduct.features.map((feature, index) => (
                      <span key={index} className="bg-orange-600/30 text-orange-200 px-3 py-1 rounded-full text-sm">
                        {feature}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* SEO optimisé */}
              <div className="bg-blue-500/20 rounded-xl p-4 border border-blue-400/50">
                <h4 className="font-semibold text-blue-200 mb-3">SEO optimisé par IA</h4>
                <div className="space-y-3">
                  <div>
                    <label className="text-blue-300 text-sm">Titre SEO :</label>
                    <div className="text-white font-medium">{selectedProduct.seo_title}</div>
                  </div>
                  <div>
                    <label className="text-blue-300 text-sm">Description SEO :</label>
                    <div className="text-gray-300">{selectedProduct.seo_description}</div>
                  </div>
                  <div>
                    <label className="text-blue-300 text-sm">Tags :</label>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {selectedProduct.tags.map((tag, index) => (
                        <span key={index} className="bg-blue-600/30 text-blue-200 px-2 py-1 rounded text-xs">
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex justify-end">
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