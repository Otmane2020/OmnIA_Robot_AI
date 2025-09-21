import React, { useState, useEffect } from 'react';
import { 
  Search, Filter, Plus, Eye, Edit, Trash2, ExternalLink, MessageSquare,
  Package, Tag, DollarSign, Image, BarChart3, Settings,
  ChevronDown, ChevronUp, X, Save, AlertCircle, CheckCircle,
  Brain, Zap, RefreshCw, Loader2, Download, FileText,
  Globe, Star, Award, TrendingUp, Palette, Ruler
} from 'lucide-react';
import { useNotifications } from './NotificationSystem';
import { supabase } from '../lib/supabase';

interface EnrichedProduct {
  id: string;
  handle: string;
  title: string;
  description: string;
  category: string;
  subcategory: string;
  type: string;
  color: string;
  material: string;
  fabric: string;
  style: string;
  dimensions: string;
  room: string;
  price: number;
  compare_at_price?: number;
  stock_qty: number;
  image_url: string;
  product_url: string;
  created_at: string;
  updated_at: string;
  
  // Champs enrichis complets
  vendor: string;
  brand: string;
  tags: string[];
  seo_title: string;
  seo_description: string;
  ad_headline: string;
  ad_description: string;
  google_product_category: string;
  gtin: string;
  confidence_score: number;
  enriched_at: string;
  enrichment_source: string;
  stock_quantity: number;
}

export const ProductsEnrichedTable: React.FC = () => {
  const [products, setProducts] = useState<EnrichedProduct[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<EnrichedProduct[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedMaterial, setSelectedMaterial] = useState('all');
  const [selectedColor, setSelectedColor] = useState('all');
  const [selectedStyle, setSelectedStyle] = useState('all');
  const [selectedRoom, setSelectedRoom] = useState('all');
  const [priceRange, setPriceRange] = useState({ min: 0, max: 10000 });
  const [viewMode, setViewMode] = useState<'table' | 'grid'>('table');
  const [loading, setLoading] = useState(true);
  const [isEnriching, setIsEnriching] = useState(false);
  const [enrichmentProgress, setEnrichmentProgress] = useState(0);
  const [selectedProducts, setSelectedProducts] = useState<string[]>([]);
  const [showFilters, setShowFilters] = useState(false);
  const [sortBy, setSortBy] = useState<'name' | 'price' | 'confidence' | 'created_at'>('created_at');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  
  const { showSuccess, showError, showInfo } = useNotifications();

  useEffect(() => {
    loadEnrichedProducts();
  }, []);

  useEffect(() => {
    filterProducts();
  }, [products, searchTerm, selectedCategory, selectedMaterial, selectedColor, selectedStyle, selectedRoom, priceRange, sortBy, sortOrder]);

  const loadEnrichedProducts = async () => {
    try {
      setLoading(true);
      
      const { data, error } = await supabase
        .from('products_enriched')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('❌ Erreur chargement produits enrichis:', error);
        
        // Fallback : créer données démo réalistes
        const demoEnrichedProducts: EnrichedProduct[] = [
          {
            id: 'enriched-1',
            handle: 'canape-alyana-beige',
            title: 'Canapé ALYANA convertible - Beige',
            description: 'Canapé d\'angle convertible 4 places en velours côtelé beige avec coffre de rangement',
            category: 'Canapé',
            subcategory: 'Canapé d\'angle',
            type: 'Convertible',
            color: 'Beige',
            material: 'Velours côtelé',
            fabric: 'Velours côtelé premium',
            style: 'Moderne',
            dimensions: '280x180x85 cm',
            room: 'Salon',
            price: 799,
            compare_at_price: 1399,
            stock_qty: 100,
            image_url: 'https://cdn.shopify.com/s/files/1/0903/7578/2665/files/7_23a97631-68d2-4f3e-8f78-b26c7cd4c2ae.png?v=1754406480',
            product_url: 'https://decorahome.fr/products/canape-dangle-convertible-et-reversible-4-places-en-velours-cotele',
            created_at: '2024-12-15T10:30:00Z',
            updated_at: '2025-01-15T14:20:00Z',
            vendor: 'Decora Home',
            brand: 'Decora Home',
            tags: ['convertible', 'réversible', 'velours', 'côtelé', 'angle', 'beige', 'coffre', 'rangement'],
            seo_title: 'Canapé d\'angle ALYANA Beige - Convertible Velours',
            seo_description: 'Canapé d\'angle convertible 4 places en velours côtelé beige. Design moderne avec coffre de rangement. Livraison gratuite.',
            ad_headline: 'Canapé ALYANA Beige 799€',
            ad_description: 'Convertible 4 places velours côtelé premium avec coffre rangement intégré',
            google_product_category: 'Mobilier > Salon > Canapés',
            gtin: '3701234567890',
            confidence_score: 95,
            enriched_at: new Date().toISOString(),
            enrichment_source: 'deepseek',
            stock_quantity: 100
          },
          {
            id: 'enriched-2',
            handle: 'table-aurea-travertin',
            title: 'Table AUREA Ø100cm - Travertin naturel',
            description: 'Table ronde en travertin naturel avec pieds métal noir, design contemporain',
            category: 'Table',
            subcategory: 'Table à manger',
            type: 'Ronde',
            color: 'Naturel',
            material: 'Travertin naturel',
            fabric: '',
            style: 'Contemporain',
            dimensions: 'Ø100x75 cm',
            room: 'Salle à manger',
            price: 499,
            compare_at_price: 859,
            stock_qty: 50,
            image_url: 'https://cdn.shopify.com/s/files/1/0903/7578/2665/files/3_e80b9a50-b032-4267-8f5b-f9130153e3be.png?v=1754406484',
            product_url: 'https://decorahome.fr/products/table-a-manger-ronde-plateau-en-travertin-naturel-100-120-cm',
            created_at: '2024-11-20T09:15:00Z',
            updated_at: '2025-01-10T16:45:00Z',
            vendor: 'Decora Home',
            brand: 'Decora Home',
            tags: ['travertin', 'naturel', 'ronde', 'élégant', 'minérale', 'contemporain'],
            seo_title: 'Table AUREA Travertin Naturel Ø100cm - Design',
            seo_description: 'Table ronde AUREA en travertin naturel. Design contemporain avec pieds métal noir. Disponible Ø100 et 120cm.',
            ad_headline: 'Table AUREA Travertin 499€',
            ad_description: 'Élégance minérale travertin naturel, pieds métal noir design contemporain',
            google_product_category: 'Mobilier > Salle à manger > Tables',
            gtin: '3701234567891',
            confidence_score: 88,
            enriched_at: new Date().toISOString(),
            enrichment_source: 'deepseek',
            stock_quantity: 50
          },
          {
            id: 'enriched-3',
            handle: 'chaise-inaya-chenille',
            title: 'Chaise INAYA - Gris chenille',
            description: 'Chaise en tissu chenille avec pieds métal noir, design baguette épuré',
            category: 'Chaise',
            subcategory: 'Chaise de salle à manger',
            type: 'Chaise fixe',
            color: 'Gris',
            material: 'Tissu chenille',
            fabric: 'Chenille texturée',
            style: 'Contemporain',
            dimensions: '45x55x85 cm',
            room: 'Salle à manger',
            price: 99,
            compare_at_price: 149,
            stock_qty: 96,
            image_url: 'https://cdn.shopify.com/s/files/1/0903/7578/2665/files/3_3f11d1af-8ce5-4d2d-a435-cd0a78eb92ee.png?v=1755791319',
            product_url: 'https://decorahome.fr/products/chaise-en-tissu-serge-chenille-pieds-metal-noir-gris-clair-moka-et-beige',
            created_at: '2024-10-05T14:22:00Z',
            updated_at: '2025-01-08T11:30:00Z',
            vendor: 'Decora Home',
            brand: 'Decora Home',
            tags: ['chenille', 'métal', 'contemporain', 'élégant', 'gris', 'design'],
            seo_title: 'Chaise INAYA Gris Chenille - Design Contemporain',
            seo_description: 'Chaise INAYA en tissu chenille gris avec pieds métal noir. Design baguette épuré et moderne.',
            ad_headline: 'Chaise INAYA Chenille 99€',
            ad_description: 'Design baguette épuré, tissu chenille premium, pieds métal noir',
            google_product_category: 'Mobilier > Salle à manger > Chaises',
            gtin: '3701234567892',
            confidence_score: 92,
            enriched_at: new Date().toISOString(),
            enrichment_source: 'deepseek',
            stock_quantity: 96
          }
        ];
        
        setProducts(demoEnrichedProducts);
        showInfo('Données démo', 'Utilisation des produits enrichis de démonstration');
        return;
      }

      console.log('✅ Produits enrichis chargés:', data?.length || 0);
      setProducts(data || []);
      
    } catch (error) {
      console.error('❌ Erreur:', error);
      showError('Erreur', 'Erreur lors du chargement des produits.');
    } finally {
      setLoading(false);
    }
  };

  const filterProducts = () => {
    let filtered = [...products];

    // Recherche textuelle
    if (searchTerm) {
      filtered = filtered.filter(product =>
        product.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.subcategory.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.vendor.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.material?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.color?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.style?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()))
      );
    }

    // Filtres spécifiques
    if (selectedCategory !== 'all') {
      filtered = filtered.filter(product => product.category === selectedCategory);
    }
    if (selectedMaterial !== 'all') {
      filtered = filtered.filter(product => product.material === selectedMaterial);
    }
    if (selectedColor !== 'all') {
      filtered = filtered.filter(product => product.color === selectedColor);
    }
    if (selectedStyle !== 'all') {
      filtered = filtered.filter(product => product.style === selectedStyle);
    }
    if (selectedRoom !== 'all') {
      filtered = filtered.filter(product => product.room === selectedRoom);
    }

    // Filtre prix
    filtered = filtered.filter(product => 
      product.price >= priceRange.min && product.price <= priceRange.max
    );

    // Tri
    filtered.sort((a, b) => {
      let aValue: any = a[sortBy];
      let bValue: any = b[sortBy];
      
      if (sortBy === 'created_at' || sortBy === 'enriched_at') {
        aValue = new Date(aValue).getTime();
        bValue = new Date(bValue).getTime();
      }
      
      if (sortOrder === 'asc') {
        return aValue > bValue ? 1 : -1;
      } else {
        return aValue < bValue ? 1 : -1;
      }
    });

    setFilteredProducts(filtered);
  };

  const handleEnrichWithDeepSeek = async () => {
    try {
      setIsEnriching(true);
      setEnrichmentProgress(0);
      
      showInfo('Enrichissement démarré', 'Analyse des produits avec DeepSeek IA...');

      // Récupérer les produits du catalogue local
      const catalogProducts = localStorage.getItem('catalog_products');
      if (!catalogProducts) {
        showError('Catalogue vide', 'Aucun produit trouvé. Importez d\'abord votre catalogue.');
        return;
      }

      const products = JSON.parse(catalogProducts);
      console.log('📦 Produits à enrichir:', products.length);

      // Simuler progression
      const progressInterval = setInterval(() => {
        setEnrichmentProgress(prev => Math.min(prev + 8, 90));
      }, 400);

      // Appeler l'enrichissement DeepSeek
      const response = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/enrich-products`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          products: products,
          source: 'catalog',
          retailer_id: 'demo-retailer-id'
        }),
      });

      clearInterval(progressInterval);
      setEnrichmentProgress(100);

      if (response.ok) {
        const result = await response.json();
        console.log('✅ Enrichissement réussi:', result);
        
        showSuccess(
          'Enrichissement terminé !', 
          `${result.enriched_count || products.length} produits enrichis avec DeepSeek IA !`,
          [
            {
              label: 'Voir les résultats',
              action: () => loadEnrichedProducts(),
              variant: 'primary'
            },
            {
              label: 'Tester dans le chat',
              action: () => window.open('/robot', '_blank'),
              variant: 'secondary'
            }
          ]
        );

        // Recharger les produits enrichis
        await loadEnrichedProducts();
        
      } else {
        const error = await response.json();
        showError('Enrichissement échoué', error.error || 'Erreur lors de l\'enrichissement.');
      }

    } catch (error) {
      console.error('❌ Erreur enrichissement:', error);
      showError('Erreur d\'enrichissement', 'Impossible d\'enrichir les produits avec DeepSeek.');
    } finally {
      setIsEnriching(false);
      setEnrichmentProgress(0);
    }
  };

  const handleExportCSV = () => {
    const csvHeaders = [
      'ID', 'Titre', 'Catégorie', 'Sous-catégorie', 'Couleur', 'Matériau', 
      'Style', 'Pièce', 'Dimensions', 'Prix', 'Prix barré', 'Stock',
      'Vendeur', 'Marque', 'SEO Titre', 'SEO Description', 
      'Google Catégorie', 'GTIN', 'Score confiance', 'Source enrichissement',
      'Créé le', 'Enrichi le'
    ];

    const csvData = [
      csvHeaders.join(','),
      ...filteredProducts.map(product => [
        product.id,
        `"${product.title}"`,
        product.category,
        product.subcategory,
        product.color,
        product.material,
        product.style,
        product.room,
        product.dimensions,
        product.price,
        product.compare_at_price || '',
        product.stock_qty,
        product.vendor,
        product.brand,
        `"${product.seo_title}"`,
        `"${product.seo_description}"`,
        product.google_product_category,
        product.gtin,
        product.confidence_score,
        product.enrichment_source,
        product.created_at,
        product.enriched_at
      ].join(','))
    ].join('\n');

    const blob = new Blob([csvData], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `produits-enrichis-${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
    
    showSuccess('Export terminé', `${filteredProducts.length} produits exportés en CSV`);
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

  const handleDeleteSelected = () => {
    if (selectedProducts.length === 0) return;
    
    if (confirm(`Supprimer ${selectedProducts.length} produit(s) enrichi(s) sélectionné(s) ?`)) {
      const updatedProducts = products.filter(p => !selectedProducts.includes(p.id));
      setProducts(updatedProducts);
      setSelectedProducts([]);
      showSuccess('Produits supprimés', `${selectedProducts.length} produit(s) supprimé(s) avec succès.`);
    }
  };

  // Extraire valeurs uniques pour filtres
  const categories = [...new Set(products.map(p => p.category))].filter(Boolean);
  const materials = [...new Set(products.map(p => p.material))].filter(Boolean);
  const colors = [...new Set(products.map(p => p.color))].filter(Boolean);
  const styles = [...new Set(products.map(p => p.style))].filter(Boolean);
  const rooms = [...new Set(products.map(p => p.room))].filter(Boolean);

  const calculateDiscount = (price: number, compareAtPrice?: number): number => {
    if (!compareAtPrice || compareAtPrice <= price) return 0;
    return Math.round(((compareAtPrice - price) / compareAtPrice) * 100);
  };

  const getConfidenceColor = (score: number) => {
    if (score >= 90) return 'text-green-400';
    if (score >= 70) return 'text-yellow-400';
    if (score >= 50) return 'text-orange-400';
    return 'text-red-400';
  };

  const getConfidenceBadge = (score: number) => {
    if (score >= 90) return 'bg-green-500/20 text-green-300 border-green-400/50';
    if (score >= 70) return 'bg-yellow-500/20 text-yellow-300 border-yellow-400/50';
    if (score >= 50) return 'bg-orange-500/20 text-orange-300 border-orange-400/50';
    return 'bg-red-500/20 text-red-300 border-red-400/50';
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="text-center">
          <Loader2 className="w-16 h-16 text-cyan-400 animate-spin mx-auto mb-4" />
          <p className="text-white text-lg">Chargement des produits enrichis...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header avec actions */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-white">Produits Enrichis DeepSeek IA</h2>
          <p className="text-gray-300">
            {filteredProducts.length} produit(s) affiché(s) sur {products.length} • 
            Moyenne confiance: {products.length > 0 ? Math.round(products.reduce((sum, p) => sum + p.confidence_score, 0) / products.length) : 0}%
          </p>
        </div>
        
        <div className="flex flex-wrap gap-3">
          <button
            onClick={handleEnrichWithDeepSeek}
            disabled={isEnriching}
            className="bg-gradient-to-r from-purple-500 to-pink-600 hover:from-purple-400 hover:to-pink-500 disabled:from-gray-600 disabled:to-gray-700 text-white px-6 py-3 rounded-xl flex items-center gap-2 font-semibold transition-all disabled:cursor-not-allowed"
          >
            {isEnriching ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                {enrichmentProgress}%
              </>
            ) : (
              <>
                <Brain className="w-5 h-5" />
                Enrichir DeepSeek
              </>
            )}
          </button>
          
          <button
            onClick={handleExportCSV}
            className="bg-green-600 hover:bg-green-700 text-white px-4 py-3 rounded-xl flex items-center gap-2 transition-all"
          >
            <Download className="w-4 h-4" />
            Export CSV
          </button>
          
          <button
            onClick={() => setViewMode(viewMode === 'table' ? 'grid' : 'table')}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-3 rounded-xl flex items-center gap-2 transition-all"
          >
            <BarChart3 className="w-4 h-4" />
            {viewMode === 'table' ? 'Vue grille' : 'Vue tableau'}
          </button>
          
          <button
            onClick={loadEnrichedProducts}
            className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-3 rounded-xl flex items-center gap-2 transition-all"
          >
            <RefreshCw className="w-4 h-4" />
            Actualiser
          </button>

          {selectedProducts.length > 0 && (
            <button
              onClick={handleDeleteSelected}
              className="bg-red-600 hover:bg-red-700 text-white px-4 py-3 rounded-xl flex items-center gap-2 transition-all"
            >
              <Trash2 className="w-4 h-4" />
              Supprimer ({selectedProducts.length})
            </button>
          )}
        </div>
      </div>

      {/* Barre de recherche et filtres avancés */}
      <div className="bg-white/10 backdrop-blur-xl rounded-2xl p-6 border border-white/20">
        <div className="flex flex-col lg:flex-row gap-4">
          {/* Recherche globale */}
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Rechercher par titre, catégorie, matériau, couleur, style, tags..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-3 bg-black/40 border border-gray-600 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:border-cyan-400 focus:ring-2 focus:ring-cyan-400/30"
            />
          </div>
          
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-3 rounded-xl flex items-center gap-2 transition-all"
          >
            <Filter className="w-4 h-4" />
            Filtres avancés
            {showFilters ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </button>
        </div>

        {/* Filtres avancés */}
        {showFilters && (
          <div className="mt-6 pt-6 border-t border-gray-600/50">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4 mb-6">
              <div>
                <label className="block text-sm text-gray-300 mb-2">Catégorie</label>
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="w-full bg-black/40 border border-gray-600 rounded-xl px-3 py-2 text-white text-sm"
                >
                  <option value="all">Toutes ({products.length})</option>
                  {categories.map(category => (
                    <option key={category} value={category}>
                      {category} ({products.filter(p => p.category === category).length})
                    </option>
                  ))}
                </select>
              </div>
              
              <div>
                <label className="block text-sm text-gray-300 mb-2">Matériau</label>
                <select
                  value={selectedMaterial}
                  onChange={(e) => setSelectedMaterial(e.target.value)}
                  className="w-full bg-black/40 border border-gray-600 rounded-xl px-3 py-2 text-white text-sm"
                >
                  <option value="all">Tous</option>
                  {materials.map(material => (
                    <option key={material} value={material}>{material}</option>
                  ))}
                </select>
              </div>
              
              <div>
                <label className="block text-sm text-gray-300 mb-2">Couleur</label>
                <select
                  value={selectedColor}
                  onChange={(e) => setSelectedColor(e.target.value)}
                  className="w-full bg-black/40 border border-gray-600 rounded-xl px-3 py-2 text-white text-sm"
                >
                  <option value="all">Toutes</option>
                  {colors.map(color => (
                    <option key={color} value={color}>{color}</option>
                  ))}
                </select>
              </div>
              
              <div>
                <label className="block text-sm text-gray-300 mb-2">Style</label>
                <select
                  value={selectedStyle}
                  onChange={(e) => setSelectedStyle(e.target.value)}
                  className="w-full bg-black/40 border border-gray-600 rounded-xl px-3 py-2 text-white text-sm"
                >
                  <option value="all">Tous</option>
                  {styles.map(style => (
                    <option key={style} value={style}>{style}</option>
                  ))}
                </select>
              </div>
              
              <div>
                <label className="block text-sm text-gray-300 mb-2">Pièce</label>
                <select
                  value={selectedRoom}
                  onChange={(e) => setSelectedRoom(e.target.value)}
                  className="w-full bg-black/40 border border-gray-600 rounded-xl px-3 py-2 text-white text-sm"
                >
                  <option value="all">Toutes</option>
                  {rooms.map(room => (
                    <option key={room} value={room}>{room}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Filtre prix */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div>
                <label className="block text-sm text-gray-300 mb-2">Prix minimum (€)</label>
                <input
                  type="number"
                  min="0"
                  value={priceRange.min}
                  onChange={(e) => setPriceRange(prev => ({ ...prev, min: parseInt(e.target.value) || 0 }))}
                  className="w-full bg-black/40 border border-gray-600 rounded-xl px-3 py-2 text-white"
                />
              </div>
              <div>
                <label className="block text-sm text-gray-300 mb-2">Prix maximum (€)</label>
                <input
                  type="number"
                  min="0"
                  value={priceRange.max}
                  onChange={(e) => setPriceRange(prev => ({ ...prev, max: parseInt(e.target.value) || 10000 }))}
                  className="w-full bg-black/40 border border-gray-600 rounded-xl px-3 py-2 text-white"
                />
              </div>
            </div>

            {/* Tri */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm text-gray-300 mb-2">Trier par</label>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as any)}
                  className="w-full bg-black/40 border border-gray-600 rounded-xl px-3 py-2 text-white text-sm"
                >
                  <option value="created_at">Date de création</option>
                  <option value="name">Nom</option>
                  <option value="price">Prix</option>
                  <option value="confidence">Score confiance</option>
                </select>
              </div>
              <div>
                <label className="block text-sm text-gray-300 mb-2">Ordre</label>
                <select
                  value={sortOrder}
                  onChange={(e) => setSortOrder(e.target.value as 'asc' | 'desc')}
                  className="w-full bg-black/40 border border-gray-600 rounded-xl px-3 py-2 text-white text-sm"
                >
                  <option value="desc">Décroissant</option>
                  <option value="asc">Croissant</option>
                </select>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Progression enrichissement */}
      {isEnriching && (
        <div className="bg-purple-500/20 border border-purple-400/50 rounded-xl p-6">
          <div className="flex items-center gap-3 mb-4">
            <Brain className="w-6 h-6 text-purple-400" />
            <h3 className="text-lg font-bold text-white">Enrichissement DeepSeek en cours...</h3>
          </div>
          <div className="w-full bg-gray-700 rounded-full h-3 mb-2">
            <div 
              className="bg-gradient-to-r from-purple-500 to-pink-500 h-3 rounded-full transition-all duration-500" 
              style={{ width: `${enrichmentProgress}%` }}
            ></div>
          </div>
          <p className="text-purple-300 text-sm">{enrichmentProgress}% - Analyse IA des attributs produits (catégorie, couleur, matériau, style, pièce, dimensions, SEO)</p>
        </div>
      )}

      {/* Actions en lot */}
      {selectedProducts.length > 0 && (
        <div className="bg-blue-500/20 border border-blue-400/50 rounded-xl p-4">
          <div className="flex items-center justify-between">
            <span className="text-blue-300 font-semibold">
              {selectedProducts.length} produit(s) sélectionné(s)
            </span>
            <div className="flex gap-2">
              <button
                onClick={handleDeleteSelected}
                className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-xl text-sm"
              >
                Supprimer sélection
              </button>
              <button
                onClick={() => setSelectedProducts([])}
                className="text-gray-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Vue tableau complète */}
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
                      className="w-4 h-4 text-cyan-600 bg-gray-800 border-gray-600 rounded focus:ring-cyan-500"
                    />
                  </th>
                  <th className="text-left p-4 text-cyan-300 font-semibold">Produit</th>
                  <th className="text-left p-4 text-cyan-300 font-semibold">Attributs IA</th>
                  <th className="text-left p-4 text-cyan-300 font-semibold">SEO & Marketing</th>
                  <th className="text-left p-4 text-cyan-300 font-semibold">Prix</th>
                  <th className="text-left p-4 text-cyan-300 font-semibold">Stock</th>
                  <th className="text-left p-4 text-cyan-300 font-semibold">IA Score</th>
                  <th className="text-left p-4 text-cyan-300 font-semibold">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredProducts.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="p-8 text-center">
                      <Package className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                      <p className="text-gray-400">Aucun produit ne correspond aux filtres</p>
                    </td>
                  </tr>
                ) : (
                  filteredProducts.map((product) => (
                    <tr key={product.id} className="border-b border-white/10 hover:bg-white/5">
                      <td className="p-4">
                        <input
                          type="checkbox"
                          checked={selectedProducts.includes(product.id)}
                          onChange={() => handleSelectProduct(product.id)}
                          className="w-4 h-4 text-cyan-600 bg-gray-800 border-gray-600 rounded focus:ring-cyan-500"
                        />
                      </td>
                      <td className="p-4">
                        <div className="flex items-center gap-3">
                          <div className="w-12 h-12 rounded-lg overflow-hidden bg-gray-600 flex-shrink-0">
                            <img 
                              src={product.image_url || 'https://images.pexels.com/photos/1350789/pexels-photo-1350789.jpeg'} 
                              alt={product.title}
                              className="w-full h-full object-cover"
                              onError={(e) => {
                                const target = e.target as HTMLImageElement;
                                target.src = 'https://images.pexels.com/photos/1350789/pexels-photo-1350789.jpeg';
                              }}
                            />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="font-semibold text-white text-sm line-clamp-2">{product.title}</div>
                            <div className="text-gray-400 text-xs">{product.vendor} • {product.brand}</div>
                            <div className="text-gray-500 text-xs">{product.category} {product.subcategory && `› ${product.subcategory}`}</div>
                            {product.handle && (
                              <div className="text-cyan-400 text-xs font-mono">{product.handle}</div>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="p-4">
                        <div className="space-y-2">
                          <div className="flex flex-wrap gap-1">
                            {product.color && (
                              <span className="inline-block bg-pink-500/20 text-pink-300 px-2 py-1 rounded text-xs">
                                🎨 {product.color}
                              </span>
                            )}
                            {product.material && (
                              <span className="inline-block bg-green-500/20 text-green-300 px-2 py-1 rounded text-xs">
                                🏗️ {product.material}
                              </span>
                            )}
                            {product.style && (
                              <span className="inline-block bg-purple-500/20 text-purple-300 px-2 py-1 rounded text-xs">
                                ✨ {product.style}
                              </span>
                            )}
                          </div>
                          <div className="flex flex-wrap gap-1">
                            {product.room && (
                              <span className="inline-block bg-orange-500/20 text-orange-300 px-2 py-1 rounded text-xs">
                                🏠 {product.room}
                              </span>
                            )}
                            {product.dimensions && (
                              <span className="inline-block bg-blue-500/20 text-blue-300 px-2 py-1 rounded text-xs">
                                📏 {product.dimensions}
                              </span>
                            )}
                          </div>
                          <div className="flex flex-wrap gap-1">
                            {product.tags.slice(0, 3).map((tag, index) => (
                              <span key={index} className="inline-block bg-gray-500/20 text-gray-300 px-2 py-1 rounded text-xs">
                                #{tag}
                              </span>
                            ))}
                            {product.tags.length > 3 && (
                              <span className="text-gray-400 text-xs">+{product.tags.length - 3}</span>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="p-4">
                        <div className="space-y-1 text-xs">
                          {product.seo_title && (
                            <div className="text-blue-300">
                              <strong>SEO:</strong> {product.seo_title.substring(0, 30)}...
                            </div>
                          )}
                          {product.ad_headline && (
                            <div className="text-green-300">
                              <strong>Pub:</strong> {product.ad_headline}
                            </div>
                          )}
                          {product.google_product_category && (
                            <div className="text-purple-300">
                              <strong>Google:</strong> {product.google_product_category.split(' > ').pop()}
                            </div>
                          )}
                          {product.gtin && (
                            <div className="text-cyan-300">
                              <strong>GTIN:</strong> {product.gtin}
                            </div>
                          )}
                        </div>
                      </td>
                      <td className="p-4">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-green-400">{product.price}€</span>
                          {product.compare_at_price && product.compare_at_price > product.price && (
                            <>
                              <span className="text-gray-400 line-through text-sm">{product.compare_at_price}€</span>
                              <span className="bg-red-500/20 text-red-300 px-2 py-1 rounded-full text-xs">
                                -{calculateDiscount(product.price, product.compare_at_price)}%
                              </span>
                            </>
                          )}
                        </div>
                      </td>
                      <td className="p-4">
                        <span className={`font-semibold ${product.stock_qty > 0 ? 'text-green-400' : 'text-red-400'}`}>
                          {product.stock_qty}
                        </span>
                      </td>
                      <td className="p-4">
                        <div className="flex items-center gap-2">
                          <div className={`w-3 h-3 rounded-full ${
                            product.confidence_score >= 90 ? 'bg-green-400' :
                            product.confidence_score >= 70 ? 'bg-yellow-400' :
                            product.confidence_score >= 50 ? 'bg-orange-400' :
                            'bg-red-400'
                          }`}></div>
                          <span className={`text-sm font-bold ${getConfidenceColor(product.confidence_score)}`}>
                            {product.confidence_score}%
                          </span>
                        </div>
                        <div className={`text-xs px-2 py-1 rounded-full border ${getConfidenceBadge(product.confidence_score)} mt-1`}>
                          {product.enrichment_source}
                        </div>
                      </td>
                      <td className="p-4">
                        <div className="flex gap-2">
                          <button
                            className="text-blue-400 hover:text-blue-300 p-1"
                            title="Voir détails complets"
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
                          <button
                            className="text-green-400 hover:text-green-300 p-1"
                            title="Tester dans le chat"
                            onClick={() => {
                              const testUrl = `/robot?test_product=${encodeURIComponent(product.title)}`;
                              window.open(testUrl, '_blank');
                            }}
                          >
                            <MessageSquare className="w-4 h-4" />
                          </button>
                          <button
                            className="text-red-400 hover:text-red-300 p-1"
                            title="Supprimer"
                            onClick={() => {
                              if (confirm(`Supprimer ${product.title} ?`)) {
                                const updatedProducts = products.filter(p => p.id !== product.id);
                                setProducts(updatedProducts);
                                showSuccess('Produit supprimé', 'Produit enrichi supprimé');
                              }
                            }}
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        /* Vue grille */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredProducts.map((product) => (
            <div key={product.id} className="bg-white/10 backdrop-blur-xl rounded-2xl p-4 border border-white/20 hover:border-cyan-500/50 transition-all hover:scale-105">
              <div className="relative">
                <input
                  type="checkbox"
                  checked={selectedProducts.includes(product.id)}
                  onChange={() => handleSelectProduct(product.id)}
                  className="absolute top-2 left-2 w-4 h-4 text-cyan-600 bg-gray-800 border-gray-600 rounded focus:ring-cyan-500 z-10"
                />
                <div className="w-full h-48 rounded-xl overflow-hidden bg-gray-600 mb-4">
                  <img 
                    src={product.image_url || 'https://images.pexels.com/photos/1350789/pexels-photo-1350789.jpeg'} 
                    alt={product.title}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      target.src = 'https://images.pexels.com/photos/1350789/pexels-photo-1350789.jpeg';
                    }}
                  />
                </div>
                
                {/* Badge confiance */}
                <div className={`absolute top-2 right-2 px-2 py-1 rounded-full text-xs font-bold border ${getConfidenceBadge(product.confidence_score)}`}>
                  {product.confidence_score}%
                </div>
              </div>
              
              <h3 className="font-semibold text-white mb-2 line-clamp-2">{product.title}</h3>
              <p className="text-gray-300 text-sm mb-3">{product.category} • {product.vendor}</p>
              
              {/* Attributs enrichis */}
              <div className="flex flex-wrap gap-1 mb-3">
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
              
              <div className="flex items-center gap-2 mb-3">
                <span className="text-xl font-bold text-green-400">{product.price}€</span>
                {product.compare_at_price && product.compare_at_price > product.price && (
                  <>
                    <span className="text-gray-400 line-through text-sm">{product.compare_at_price}€</span>
                    <span className="bg-red-500/20 text-red-300 px-2 py-1 rounded-full text-xs">
                      -{calculateDiscount(product.price, product.compare_at_price)}%
                    </span>
                  </>
                )}
              </div>
              
              <div className="flex items-center justify-between mb-4">
                <span className={`font-semibold ${product.stock_qty > 0 ? 'text-green-400' : 'text-red-400'}`}>
                  Stock: {product.stock_qty}
                </span>
                <span className="text-gray-400 text-xs">
                  {product.enrichment_source}
                </span>
              </div>
              
              <div className="flex gap-2">
                <button className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-2 rounded-lg flex items-center justify-center gap-1 text-sm">
                  <Eye className="w-3 h-3" />
                  Voir
                </button>
                <a
                  href={product.product_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-1 bg-purple-600 hover:bg-purple-700 text-white py-2 rounded-lg flex items-center justify-center gap-1 text-sm"
                >
                  <ExternalLink className="w-3 h-3" />
                  Lien
                </a>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Message si aucun produit */}
      {products.length === 0 && (
        <div className="text-center py-20">
          <Package className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-xl font-bold text-white mb-2">Aucun produit enrichi</h3>
          <p className="text-gray-400 mb-6">
            Importez d'abord votre catalogue, puis lancez l'enrichissement DeepSeek.
          </p>
          <div className="space-y-4">
            <button
              onClick={handleEnrichWithDeepSeek}
              className="bg-gradient-to-r from-purple-500 to-pink-600 hover:from-purple-400 hover:to-pink-500 text-white px-6 py-3 rounded-xl font-semibold transition-all"
            >
              Enrichir le catalogue avec DeepSeek
            </button>
            <div className="text-sm text-gray-500">
              L'enrichissement extrait automatiquement : catégorie, sous-catégorie, couleur, matériau, style, pièce, dimensions, tags, SEO, marketing
            </div>
          </div>
        </div>
      )}

      {/* Stats détaillées */}
      {products.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 xl:grid-cols-6 gap-4">
          <div className="bg-blue-600/20 backdrop-blur-xl rounded-2xl p-4 border border-blue-500/30">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-blue-200 text-sm mb-1">Total Enrichis</p>
                <p className="text-2xl font-bold text-white">{products.length}</p>
              </div>
              <Brain className="w-8 h-8 text-blue-400" />
            </div>
          </div>
          
          <div className="bg-green-600/20 backdrop-blur-xl rounded-2xl p-4 border border-green-500/30">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-green-200 text-sm mb-1">Confiance Moy.</p>
                <p className="text-2xl font-bold text-white">
                  {products.length > 0 ? Math.round(products.reduce((sum, p) => sum + p.confidence_score, 0) / products.length) : 0}%
                </p>
              </div>
              <CheckCircle className="w-8 h-8 text-green-400" />
            </div>
          </div>
          
          <div className="bg-purple-600/20 backdrop-blur-xl rounded-2xl p-4 border border-purple-500/30">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-purple-200 text-sm mb-1">Catégories</p>
                <p className="text-2xl font-bold text-white">{categories.length}</p>
              </div>
              <Tag className="w-8 h-8 text-purple-400" />
            </div>
          </div>
          
          <div className="bg-orange-600/20 backdrop-blur-xl rounded-2xl p-4 border border-orange-500/30">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-orange-200 text-sm mb-1">En Stock</p>
                <p className="text-2xl font-bold text-white">
                  {products.filter(p => p.stock_qty > 0).length}
                </p>
              </div>
              <Package className="w-8 h-8 text-orange-400" />
            </div>
          </div>
          
          <div className="bg-cyan-600/20 backdrop-blur-xl rounded-2xl p-4 border border-cyan-500/30">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-cyan-200 text-sm mb-1">Prix Moyen</p>
                <p className="text-2xl font-bold text-white">
                  {products.length > 0 ? Math.round(products.reduce((sum, p) => sum + p.price, 0) / products.length) : 0}€
                </p>
              </div>
              <DollarSign className="w-8 h-8 text-cyan-400" />
            </div>
          </div>
          
          <div className="bg-pink-600/20 backdrop-blur-xl rounded-2xl p-4 border border-pink-500/30">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-pink-200 text-sm mb-1">Avec SEO</p>
                <p className="text-2xl font-bold text-white">
                  {products.filter(p => p.seo_title && p.seo_description).length}
                </p>
              </div>
              <Globe className="w-8 h-8 text-pink-400" />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};