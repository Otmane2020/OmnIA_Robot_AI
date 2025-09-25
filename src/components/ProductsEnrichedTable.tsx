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
  dimensions: string;
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
}

interface ProductsEnrichedTableProps {
  vendorId?: string;
}

export const ProductsEnrichedTable: React.FC<ProductsEnrichedTableProps> = ({ vendorId }) => {
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
  const { showSuccess, showError, showInfo } = useNotifications();

  useEffect(() => {
    loadEnrichedProducts();
  }, [vendorId]);

  useEffect(() => {
    // Filtrer les produits
    let filtered = products;

    if (searchTerm) {
      filtered = filtered.filter(product =>
        product.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.brand.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.seo_title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()))
      );
    }

    if (selectedCategory !== 'all') {
      filtered = filtered.filter(product => product.category === selectedCategory);
    }

    if (selectedColor !== 'all') {
      filtered = filtered.filter(product => product.color === selectedColor);
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
      
      // Simuler le chargement depuis la base de données
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Générer des produits enrichis de démonstration basés sur le catalogue
      const mockEnrichedProducts = generateMockEnrichedProducts();
      
      console.log('📦 Produits enrichis chargés:', mockEnrichedProducts.length);
      setProducts(mockEnrichedProducts);
      setFilteredProducts(mockEnrichedProducts);
      
    } catch (error) {
      console.error('❌ Erreur chargement produits enrichis:', error);
      showError('Erreur de chargement', 'Impossible de charger les produits enrichis.');
    } finally {
      setIsLoading(false);
    }
  };

  const generateMockEnrichedProducts = (): EnrichedProduct[] => {
    // Charger les produits du catalogue normal
    const savedProducts = localStorage.getItem('catalog_products');
    let baseProducts = [];
    
    if (savedProducts) {
      try {
        baseProducts = JSON.parse(savedProducts);
      } catch (error) {
        console.error('Erreur parsing produits sauvegardés:', error);
      }
    }
    
    // Produits de base Decora Home
    const decoraProducts = [
      {
        id: 'decora-canape-alyana-beige',
        name: 'Canapé ALYANA convertible - Beige',
        description: 'Canapé d\'angle convertible 4 places en velours côtelé beige avec coffre de rangement',
        price: 799,
        category: 'Canapé',
        vendor: 'Decora Home',
        image_url: 'https://cdn.shopify.com/s/files/1/0903/7578/2665/files/7_23a97631-68d2-4f3e-8f78-b26c7cd4c2ae.png?v=1754406480',
        product_url: 'https://decorahome.fr/products/canape-dangle-convertible-et-reversible-4-places-en-velours-cotele',
        stock: 100
      },
      {
        id: 'decora-table-aurea-100',
        name: 'Table AUREA Ø100cm - Travertin',
        description: 'Table ronde en travertin naturel avec pieds métal noir',
        price: 499,
        category: 'Table',
        vendor: 'Decora Home',
        image_url: 'https://cdn.shopify.com/s/files/1/0903/7578/2665/files/3_e80b9a50-b032-4267-8f5b-f9130153e3be.png?v=1754406484',
        product_url: 'https://decorahome.fr/products/table-a-manger-ronde-plateau-en-travertin-naturel-100-120-cm',
        stock: 50
      },
      {
        id: 'decora-chaise-inaya-gris',
        name: 'Chaise INAYA - Gris chenille',
        description: 'Chaise en tissu chenille avec pieds métal noir',
        price: 99,
        category: 'Chaise',
        vendor: 'Decora Home',
        image_url: 'https://cdn.shopify.com/s/files/1/0903/7578/2665/files/3_3f11d1af-8ce5-4d2d-a435-cd0a78eb92ee.png?v=1755791319',
        product_url: 'https://decorahome.fr/products/chaise-en-tissu-serge-chenille-pieds-metal-noir-gris-clair-moka-et-beige',
        stock: 96
      }
    ];
    
    // Combiner produits de base + produits importés
    const allProducts = [...decoraProducts, ...baseProducts];
    
    // Enrichir automatiquement chaque produit
    return allProducts.map(product => enrichProduct(product));
  };

  const enrichProduct = (product: any): EnrichedProduct => {
    const text = `${product.name || product.title || ''} ${product.description || ''} ${product.category || ''}`.toLowerCase();
    
    // Enrichissement automatique basé sur le texte
    const enriched = {
      id: product.id || `enriched-${Date.now()}-${Math.random()}`,
      handle: product.handle || product.id || `handle-${Date.now()}`,
      title: product.name || product.title || 'Produit sans nom',
      description: product.description || '',
      category: detectCategory(text),
      subcategory: detectSubcategory(text),
      color: detectColor(text),
      material: detectMaterial(text),
      fabric: detectFabric(text),
      style: detectStyle(text),
      dimensions: detectDimensions(text),
      room: detectRoom(text),
      price: product.price || 0,
      stock_qty: product.stock || product.quantityAvailable || 0,
      image_url: product.image_url || 'https://images.pexels.com/photos/1350789/pexels-photo-1350789.jpeg',
      product_url: product.product_url || '#',
      tags: generateTags(text),
      seo_title: generateSEOTitle(product.name || product.title, detectColor(text), detectMaterial(text)),
      seo_description: generateSEODescription(product.name || product.title, detectStyle(text), detectMaterial(text)),
      ad_headline: generateAdHeadline(product.name || product.title),
      ad_description: generateAdDescription(product.name || product.title, detectMaterial(text)),
      google_product_category: getGoogleCategory(detectCategory(text)),
      gtin: '',
      brand: product.vendor || 'Decora Home',
      confidence_score: calculateConfidence(text),
      enriched_at: new Date().toISOString(),
      enrichment_source: 'auto',
      created_at: product.created_at || new Date().toISOString()
    };
    
    return enriched;
  };

  // Fonctions de détection
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

  const detectColor = (text: string): string => {
    const colors = ['blanc', 'noir', 'gris', 'beige', 'marron', 'bleu', 'vert', 'rouge', 'jaune', 'orange', 'rose', 'violet', 'naturel', 'chêne', 'noyer', 'taupe'];
    for (const color of colors) {
      if (text.includes(color)) return color;
    }
    return '';
  };

  const detectMaterial = (text: string): string => {
    const materials = ['bois', 'métal', 'verre', 'tissu', 'cuir', 'velours', 'travertin', 'marbre', 'plastique', 'rotin', 'chenille'];
    for (const material of materials) {
      if (text.includes(material)) return material;
    }
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
    const styles = ['moderne', 'contemporain', 'scandinave', 'industriel', 'vintage', 'rustique', 'classique', 'minimaliste', 'bohème'];
    for (const style of styles) {
      if (text.includes(style)) return style;
    }
    return '';
  };

  const detectDimensions = (text: string): string => {
    const match = text.match(/(\d+)\s*[x×]\s*(\d+)(?:\s*[x×]\s*(\d+))?\s*cm/);
    return match ? match[0] : '';
  };

  const detectRoom = (text: string): string => {
    const rooms = ['salon', 'chambre', 'cuisine', 'bureau', 'salle à manger', 'entrée', 'terrasse'];
    for (const room of rooms) {
      if (text.includes(room)) return room;
    }
    return '';
  };

  const generateTags = (text: string): string[] => {
    const tags = [];
    if (text.includes('convertible')) tags.push('convertible');
    if (text.includes('rangement')) tags.push('rangement');
    if (text.includes('angle')) tags.push('angle');
    if (text.includes('moderne')) tags.push('moderne');
    if (text.includes('design')) tags.push('design');
    return tags;
  };

  const generateSEOTitle = (name: string, color: string, material: string): string => {
    let title = name;
    if (color) title += ` ${color}`;
    if (material) title += ` ${material}`;
    title += ' - Decora Home';
    return title.substring(0, 70);
  };

  const generateSEODescription = (name: string, style: string, material: string): string => {
    let desc = `${name}`;
    if (material) desc += ` en ${material}`;
    if (style) desc += ` de style ${style}`;
    desc += '. Livraison gratuite. Garantie qualité Decora Home.';
    return desc.substring(0, 155);
  };

  const generateAdHeadline = (name: string): string => {
    return name.substring(0, 30);
  };

  const generateAdDescription = (name: string, material: string): string => {
    let desc = name;
    if (material) desc += ` ${material}`;
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

  const calculateConfidence = (text: string): number => {
    let confidence = 30; // Base
    if (detectColor(text)) confidence += 20;
    if (detectMaterial(text)) confidence += 20;
    if (detectStyle(text)) confidence += 15;
    if (detectRoom(text)) confidence += 10;
    if (detectDimensions(text)) confidence += 5;
    return Math.min(confidence, 100);
  };

  const handleEnrichAll = async () => {
    setIsEnriching(true);
    showInfo('Enrichissement en cours', 'Analyse IA de tous les produits du catalogue...');
    
    try {
      // Simuler l'enrichissement IA
      await new Promise(resolve => setTimeout(resolve, 3000));
      
      // Recharger les produits enrichis
      await loadEnrichedProducts();
      
      showSuccess(
        'Enrichissement terminé',
        `${products.length} produits enrichis avec succès !`,
        [
          {
            label: 'Voir les résultats',
            action: () => setViewMode('grid'),
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

  const handleSyncFromCatalog = async () => {
    showInfo('Synchronisation', 'Synchronisation du catalogue vers les produits enrichis...');
    
    try {
      // Charger les produits du catalogue normal ET imported_products
      const savedProducts = localStorage.getItem('catalog_products');
      let allProducts = [];
      
      if (savedProducts) {
        try {
          const catalogProducts = JSON.parse(savedProducts);
          allProducts = [...allProducts, ...catalogProducts];
          console.log('📦 Produits du catalogue chargés:', catalogProducts.length);
        } catch (error) {
          console.error('Erreur parsing catalogue:', error);
        }
      }
      
      // NOUVEAU: Forcer la synchronisation via Supabase
      try {
        const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
        const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
        
        if (supabaseUrl && supabaseKey) {
          console.log('🔄 Déclenchement synchronisation forcée...');
          
          const syncResponse = await fetch(`${supabaseUrl}/functions/v1/enrich-products-cron`, {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${supabaseKey}`,
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              retailer_id: 'demo-retailer-id',
              force_full_enrichment: true,
              source_filter: null // Tous les produits
            }),
          });
          
          if (syncResponse.ok) {
            const syncResult = await syncResponse.json();
            console.log('✅ Synchronisation forcée réussie:', syncResult);
            
            showSuccess(
              'Synchronisation réussie', 
              `${syncResult.enriched_products || 0} produits synchronisés vers le catalogue enrichi !`,
              [
                {
                  label: 'Actualiser',
                  action: () => window.location.reload(),
                  variant: 'primary'
                }
              ]
            );
            
            // Recharger les données
            await loadEnrichedProducts();
            return;
          } else {
            console.log('⚠️ Synchronisation Supabase échouée, fallback local');
          }
        }
      } catch (error) {
        console.log('⚠️ Erreur synchronisation Supabase:', error);
      }
      
      // Fallback: enrichissement local
      if (allProducts.length > 0) {
        const newEnrichedProducts = allProducts.map((product: any) => enrichProduct(product));
        
        setProducts(newEnrichedProducts);
        showSuccess('Synchronisation locale', `${newEnrichedProducts.length} produits enrichis localement !`);
      } else {
        showError('Catalogue vide', 'Aucun produit trouvé dans le catalogue principal.');
      }
    } catch (error) {
      console.error('❌ Erreur synchronisation:', error);
      showError('Erreur de synchronisation', 'Impossible de synchroniser le catalogue.');
    }
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

  const getEnrichmentSourceColor = (source: string) => {
    switch (source) {
      case 'ai': return 'bg-purple-500/20 text-purple-300';
      case 'auto': return 'bg-blue-500/20 text-blue-300';
      case 'manual': return 'bg-orange-500/20 text-orange-300';
      default: return 'bg-gray-500/20 text-gray-300';
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="text-center">
          <Brain className="w-16 h-16 text-purple-400 animate-pulse mx-auto mb-4" />
          <p className="text-white text-lg">Chargement du catalogue enrichi...</p>
          <p className="text-gray-400 text-sm">Analyse IA des attributs produits</p>
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
          <p className="text-gray-300">{filteredProducts.length} produit(s) enrichi(s) sur {products.length}</p>
        </div>
        
        <div className="flex flex-wrap gap-3">
          <button
            onClick={handleSyncFromCatalog}
            className="bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white px-4 py-2 rounded-xl flex items-center gap-2 font-semibold transition-all"
          >
            <RefreshCw className="w-4 h-4" />
            Sync depuis catalogue
          </button>
          
          <button
            onClick={handleEnrichAll}
            disabled={isEnriching}
            className="bg-gradient-to-r from-purple-500 to-pink-600 hover:from-purple-400 hover:to-pink-500 disabled:from-gray-600 disabled:to-gray-700 text-white px-4 py-2 rounded-xl flex items-center gap-2 font-semibold transition-all disabled:cursor-not-allowed"
          >
            {isEnriching ? (
              <>
                <Zap className="w-4 h-4 animate-spin" />
                Enrichissement...
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4" />
                Enrichir tout
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
          {/* Recherche */}
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Rechercher par nom, catégorie, tags, SEO..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-3 bg-black/40 border border-gray-600 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:border-purple-400 focus:ring-2 focus:ring-purple-400/30"
            />
          </div>
          
          {/* Bouton filtres */}
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-3 rounded-xl flex items-center gap-2 transition-all"
          >
            <Filter className="w-4 h-4" />
            Filtres IA
            {showFilters ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </button>
        </div>

        {/* Filtres étendus */}
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

      {/* Tableau des produits enrichis */}
      {viewMode === 'table' ? (
        <div className="bg-white/10 backdrop-blur-xl rounded-2xl border border-white/20 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-black/20">
                <tr>
                  <th className="text-left p-4 text-purple-300 font-semibold">Produit</th>
                  <th className="text-left p-4 text-purple-300 font-semibold">Attributs IA</th>
                  <th className="text-left p-4 text-purple-300 font-semibold">SEO</th>
                  <th className="text-left p-4 text-purple-300 font-semibold">Confiance</th>
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
                          <div className="text-green-400 font-bold">{product.price}€</div>
                        </div>
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
                          {product.style && (
                            <span className="bg-purple-500/20 text-purple-300 px-2 py-1 rounded text-xs">
                              {product.style}
                            </span>
                          )}
                        </div>
                        {product.room && (
                          <div className="text-gray-400 text-xs">📍 {product.room}</div>
                        )}
                        {product.dimensions && (
                          <div className="text-gray-400 text-xs">📏 {product.dimensions}</div>
                        )}
                      </div>
                    </td>
                    <td className="p-4">
                      <div className="space-y-1">
                        <div className="text-white text-xs font-medium">{product.seo_title}</div>
                        <div className="text-gray-400 text-xs line-clamp-2">{product.seo_description}</div>
                        {product.google_product_category && (
                          <div className="text-cyan-400 text-xs">Google: {product.google_product_category}</div>
                        )}
                      </div>
                    </td>
                    <td className="p-4">
                      <div className="text-center">
                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${getConfidenceColor(product.confidence_score)}`}>
                          {product.confidence_score}%
                        </span>
                        <div className={`text-xs mt-1 px-2 py-1 rounded ${getEnrichmentSourceColor(product.enrichment_source)}`}>
                          {product.enrichment_source}
                        </div>
                      </div>
                    </td>
                    <td className="p-4">
                      <div className="flex gap-2">
                        <a
                          href={product.product_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-400 hover:text-blue-300 p-1"
                          title="Ouvrir lien externe"
                        >
                          <ExternalLink className="w-4 h-4" />
                        </a>
                        <button
                          className="text-purple-400 hover:text-purple-300 p-1"
                          title="Modifier enrichissement"
                        >
                          <Edit className="w-4 h-4" />
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
                <span className="text-xl font-bold text-green-400">{product.price}€</span>
                <span className={`px-2 py-1 rounded-full text-xs ${getConfidenceColor(product.confidence_score)}`}>
                  {product.confidence_score}%
                </span>
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
                
                {product.room && (
                  <div className="text-gray-400 text-xs">📍 {product.room}</div>
                )}
                
                {product.dimensions && (
                  <div className="text-gray-400 text-xs">📏 {product.dimensions}</div>
                )}
              </div>
              
              {/* SEO Preview */}
              <div className="bg-black/20 rounded-lg p-3 mb-4">
                <div className="text-cyan-400 text-xs font-medium mb-1">SEO Optimisé :</div>
                <div className="text-white text-xs font-medium line-clamp-1">{product.seo_title}</div>
                <div className="text-gray-400 text-xs line-clamp-2">{product.seo_description}</div>
              </div>
              
              <div className="flex gap-2">
                <a
                  href={product.product_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-2 rounded-lg flex items-center justify-center gap-1 text-sm"
                >
                  <ExternalLink className="w-3 h-3" />
                  Voir
                </a>
                <button className="flex-1 bg-purple-600 hover:bg-purple-700 text-white py-2 rounded-lg flex items-center justify-center gap-1 text-sm">
                  <Edit className="w-3 h-3" />
                  Modifier
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
          <h3 className="text-xl font-bold text-white mb-2">Aucun produit enrichi trouvé</h3>
          <p className="text-gray-400 mb-6">
            {searchTerm || selectedCategory !== 'all' || selectedColor !== 'all' || selectedMaterial !== 'all' || selectedStyle !== 'all'
              ? 'Aucun produit ne correspond à vos critères de recherche.'
              : 'Votre catalogue enrichi est vide. Synchronisez depuis votre catalogue principal.'}
          </p>
          <div className="flex gap-4 justify-center">
            <button
              onClick={handleSyncFromCatalog}
              className="bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white px-6 py-3 rounded-xl font-semibold transition-all"
            >
              Synchroniser le catalogue
            </button>
            <button
              onClick={handleEnrichAll}
              className="bg-gradient-to-r from-purple-500 to-pink-600 hover:from-purple-400 hover:to-pink-500 text-white px-6 py-3 rounded-xl font-semibold transition-all"
            >
              Enrichir avec IA
            </button>
          </div>
        </div>
      )}

      {/* Statistiques d'enrichissement */}
      <div className="bg-gradient-to-r from-purple-500/20 to-pink-600/20 backdrop-blur-xl rounded-2xl p-6 border border-purple-400/30">
        <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
          <BarChart3 className="w-5 h-5 text-purple-400" />
          Statistiques d'enrichissement IA
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="text-center">
            <div className="text-2xl font-bold text-purple-400">{products.length}</div>
            <div className="text-purple-300 text-sm">Produits enrichis</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-green-400">
              {Math.round(products.reduce((sum, p) => sum + p.confidence_score, 0) / products.length) || 0}%
            </div>
            <div className="text-green-300 text-sm">Confiance moyenne</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-cyan-400">{categories.length}</div>
            <div className="text-cyan-300 text-sm">Catégories détectées</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-orange-400">{colors.length + materials.length}</div>
            <div className="text-orange-300 text-sm">Attributs extraits</div>
          </div>
        </div>
      </div>
    </div>
  );
};