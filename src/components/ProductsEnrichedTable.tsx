import React, { useState, useEffect } from 'react';
import { Search, Filter, Eye, CreditCard as Edit, Trash2, ExternalLink, Package, Tag, DollarSign, Image, BarChart3, Settings, ChevronDown, ChevronUp, X, Save, AlertCircle, CheckCircle, Brain, Sparkles, Zap, RefreshCw, Download, Upload, Loader2, Camera, Wand2 } from 'lucide-react';
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
  const [showVisionModal, setShowVisionModal] = useState(false);
  const [visionAnalysisProduct, setVisionAnalysisProduct] = useState<any>(null);
  const [isAnalyzingVision, setIsAnalyzingVision] = useState(false);
  const [visionResults, setVisionResults] = useState<any>(null);
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
        image_url: 'https://cdn.shopify.com/s/files/1/0903/7578/2665/files/2_f8b8c3d4-e5f6-4a