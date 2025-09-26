import React, { useState, useEffect } from 'react';
import { Search, Filter, Eye, Edit, Trash2, Download, RefreshCw, Brain, Zap, CheckCircle, AlertCircle, Star, Package, TrendingUp } from 'lucide-react';
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
  retailer_id: string;
}

interface ProductsEnrichedTableProps {
  vendorId?: string;
  retailerId?: string;
  refreshTrigger?: number;
}

export const ProductsEnrichedTable: React.FC<ProductsEnrichedTableProps> = ({ 
  vendorId, 
  retailerId, 
  refreshTrigger 
}) => {
  const [products, setProducts] = useState<EnrichedProduct[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<EnrichedProduct[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedConfidence, setSelectedConfidence] = useState('all');
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<EnrichedProduct | null>(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [syncStats, setSyncStats] = useState<any>(null);
  const { showSuccess, showError, showInfo } = useNotifications();

  useEffect(() => {
    loadEnrichedProducts();
  }, [vendorId, retailerId, refreshTrigger]);

  useEffect(() => {
    filterProducts();
  }, [products, searchTerm, selectedCategory, selectedConfidence]);

  const loadEnrichedProducts = async () => {
    try {
      setIsLoading(true);
      console.log('📦 Chargement produits enrichis...');

      // Essayer de charger depuis Supabase d'abord
      if (import.meta.env.VITE_SUPABASE_URL && (retailerId || vendorId)) {
        try {
          const response = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/get-enriched-products`, {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              retailer_id: retailerId || vendorId,
              limit: 100
            }),
          });

          if (response.ok) {
            const data = await response.json();
            if (data.success && data.products.length > 0) {
              setProducts(data.products);
              console.log('✅ Produits enrichis chargés depuis Supabase:', data.products.length);
              return;
            }
          }
        } catch (supabaseError) {
          console.log('⚠️ Supabase non disponible, fallback localStorage');
        }
      }

      // Fallback: charger depuis localStorage
      const storageKeys = [
        'products_enriched',
        `enriched_products_${retailerId || vendorId}`,
        'catalog_products'
      ];

      let allProducts: EnrichedProduct[] = [];

      for (const key of storageKeys) {
        const savedProducts = localStorage.getItem(key);
        if (savedProducts) {
          try {
            const parsed = JSON.parse(savedProducts);
            const enrichedProducts = parsed.map((p: any) => ({
              id: p.id || `enriched-${Date.now()}-${Math.random()}`,
              handle: p.handle || generateHandle(p.title || p.name),
              title: p.title || p.name || 'Produit sans nom',
              description: p.description || '',
              category: p.category || 'Mobilier',
              subcategory: p.subcategory || '',
              color: p.color || '',
              material: p.material || '',
              fabric: p.fabric || '',
              style: p.style || '',
              dimensions: p.dimensions || '',
              room: p.room || '',
              price: parseFloat(p.price) || 0,
              stock_qty: parseInt(p.stock_qty) || parseInt(p.stock) || parseInt(p.quantityAvailable) || 0,
              image_url: p.image_url || 'https://images.pexels.com/photos/1350789/pexels-photo-1350789.jpeg',
              product_url: p.product_url || '#',
              tags: Array.isArray(p.tags) ? p.tags : [],
              seo_title: p.seo_title || p.title || p.name || '',
              seo_description: p.seo_description || '',
              ad_headline: p.ad_headline || '',
              ad_description: p.ad_description || '',
              google_product_category: p.google_product_category || '',
              gtin: p.gtin || '',
              brand: p.brand || p.vendor || 'Decora Home',
              confidence_score: p.confidence_score || 50,
              enriched_at: p.enriched_at || new Date().toISOString(),
              enrichment_source: p.enrichment_source || 'manual',
              retailer_id: p.retailer_id || retailerId || vendorId || 'demo'
            }));

            allProducts.push(...enrichedProducts);
            console.log(`✅ Produits chargés depuis ${key}:`, enrichedProducts.length);
          } catch (error) {
            console.error(`❌ Erreur parsing ${key}:`, error);
          }
        }
      }

      // Supprimer les doublons
      const uniqueProducts = allProducts.filter((product, index, self) => 
        index === self.findIndex(p => p.id === product.id)
      );

      setProducts(uniqueProducts);
      console.log('✅ Total produits enrichis uniques:', uniqueProducts.length);

    } catch (error) {
      console.error('❌ Erreur chargement produits enrichis:', error);
      showError('Erreur de chargement', 'Impossible de charger les produits enrichis.');
    } finally {
      setIsLoading(false);
    }
  };

  const filterProducts = () => {
    let filtered = products;

    if (searchTerm) {
      filtered = filtered.filter(product =>
        product.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.subcategory.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.color.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.material.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.style.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.brand.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (selectedCategory !== 'all') {
      filtered = filtered.filter(product => product.category === selectedCategory);
    }

    if (selectedConfidence !== 'all') {
      const confidenceRanges = {
        'high': [80, 100],
        'medium': [60, 79],
        'low': [0, 59]
      };
      const [min, max] = confidenceRanges[selectedConfidence as keyof typeof confidenceRanges] || [0, 100];
      filtered = filtered.filter(product => 
        product.confidence_score >= min && product.confidence_score <= max
      );
    }

    setFilteredProducts(filtered);
  };

  const handleSyncToEnriched = async () => {
    setIsRefreshing(true);
    
    try {
      showInfo('Synchronisation', 'Synchronisation des produits vers la table enrichie...');

      // Appeler l'API de synchronisation
      const response = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/sync-to-enriched`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          retailer_id: retailerId || vendorId,
          force_sync: true
        }),
      });

      if (response.ok) {
        const data = await response.json();
        setSyncStats(data.stats);
        
        showSuccess(
          'Synchronisation terminée',
          `${data.stats?.synced_count || 0} produits synchronisés vers la table enrichie`,
          [
            {
              label: 'Recharger',
              action: () => loadEnrichedProducts(),
              variant: 'primary'
            }
          ]
        );

        // Recharger les produits
        await loadEnrichedProducts();
      } else {
        throw new Error('Erreur API synchronisation');
      }

    } catch (error) {
      console.error('❌ Erreur synchronisation:', error);
      showError('Erreur synchronisation', 'Impossible de synchroniser les produits.');
    } finally {
      setIsRefreshing(false);
    }
  };

  const handleViewProduct = (product: EnrichedProduct) => {
    setSelectedProduct(product);
    setShowDetailModal(true);
  };

  const handleExportEnriched = () => {
    try {
      const csvContent = generateEnrichedCSV(filteredProducts);
      const blob = new Blob([csvContent], { type: 'text/csv' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `produits-enrichis-${new Date().toISOString().split('T')[0]}.csv`;
      a.click();
      URL.revokeObjectURL(url);
      
      showSuccess('Export réussi', `${filteredProducts.length} produits exportés en CSV.`);
    } catch (error) {
      console.error('❌ Erreur export:', error);
      showError('Erreur export', 'Impossible d\'exporter les produits.');
    }
  };

  const generateEnrichedCSV = (products: EnrichedProduct[]) => {
    const headers = [
      'ID', 'Titre', 'Catégorie', 'Sous-catégorie', 'Couleur', 'Matériau', 
      'Style', 'Dimensions', 'Pièce', 'Prix', 'Stock', 'Confiance IA',
      'SEO Titre', 'SEO Description', 'Google Catégorie', 'GTIN', 'Marque'
    ];

    const rows = products.map(product => [
      product.id,
      product.title,
      product.category,
      product.subcategory,
      product.color,
      product.material,
      product.style,
      product.dimensions,
      product.room,
      product.price,
      product.stock_qty,
      product.confidence_score,
      product.seo_title,
      product.seo_description,
      product.google_product_category,
      product.gtin,
      product.brand
    ]);

    return [headers, ...rows].map(row => 
      row.map(cell => `"${cell}"`).join(',')
    ).join('\n');
  };

  const generateHandle = (title: string) => {
    return title
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .substring(0, 100);
  };

  const getConfidenceColor = (score: number) => {
    if (score >= 80) return 'bg-green-500/20 text-green-300 border-green-400/50';
    if (score >= 60) return 'bg-yellow-500/20 text-yellow-300 border-yellow-400/50';
    return 'bg-red-500/20 text-red-300 border-red-400/50';
  };

  const categories = [...new Set(products.map(p => p.category))];

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-purple-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-white text-lg">Chargement produits enrichis...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header avec actions */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-white">Catalogue Enrichi Smart AI</h2>
          <p className="text-gray-300">
            {filteredProducts.length} produit(s) enrichi(s) sur {products.length}
          </p>
        </div>
        
        <div className="flex flex-wrap gap-3">
          <button
            onClick={handleSyncToEnriched}
            disabled={isRefreshing}
            className="bg-gradient-to-r from-blue-500 to-cyan-600 hover:from-blue-400 hover:to-cyan-500 disabled:from-gray-600 disabled:to-gray-700 text-white px-4 py-2 rounded-xl flex items-center gap-2 font-semibold transition-all disabled:cursor-not-allowed"
          >
            {isRefreshing ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin" />
                Sync...
              </>
            ) : (
              <>
                <RefreshCw className="w-4 h-4" />
                Synchroniser
              </>
            )}
          </button>
          
          <button
            onClick={handleExportEnriched}
            disabled={filteredProducts.length === 0}
            className="bg-green-600 hover:bg-green-700 disabled:bg-gray-600 text-white px-4 py-2 rounded-xl flex items-center gap-2 transition-all disabled:cursor-not-allowed"
          >
            <Download className="w-4 h-4" />
            Export CSV
          </button>
        </div>
      </div>

      {/* Statistiques rapides */}
      {products.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="bg-blue-600/20 backdrop-blur-xl rounded-2xl p-4 border border-blue-500/30">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-blue-200 text-sm">Total enrichis</p>
                <p className="text-2xl font-bold text-white">{products.length}</p>
              </div>
              <Package className="w-8 h-8 text-blue-400" />
            </div>
          </div>
          
          <div className="bg-green-600/20 backdrop-blur-xl rounded-2xl p-4 border border-green-500/30">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-green-200 text-sm">Confiance moy.</p>
                <p className="text-2xl font-bold text-white">
                  {Math.round(products.reduce((sum, p) => sum + p.confidence_score, 0) / products.length)}%
                </p>
              </div>
              <Brain className="w-8 h-8 text-green-400" />
            </div>
          </div>
          
          <div className="bg-purple-600/20 backdrop-blur-xl rounded-2xl p-4 border border-purple-500/30">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-purple-200 text-sm">Catégories</p>
                <p className="text-2xl font-bold text-white">{categories.length}</p>
              </div>
              <TrendingUp className="w-8 h-8 text-purple-400" />
            </div>
          </div>
          
          <div className="bg-orange-600/20 backdrop-blur-xl rounded-2xl p-4 border border-orange-500/30">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-orange-200 text-sm">Avec images</p>
                <p className="text-2xl font-bold text-white">
                  {products.filter(p => p.enrichment_source === 'text_and_vision').length}
                </p>
              </div>
              <Eye className="w-8 h-8 text-orange-400" />
            </div>
          </div>
        </div>
      )}

      {/* Filtres */}
      <div className="bg-white/10 backdrop-blur-xl rounded-2xl p-6 border border-white/20">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Rechercher..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-3 bg-black/40 border border-gray-600 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:border-cyan-400"
            />
          </div>
          
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="w-full bg-black/40 border border-gray-600 rounded-xl px-3 py-3 text-white"
          >
            <option value="all">Toutes catégories</option>
            {categories.map(category => (
              <option key={category} value={category}>{category}</option>
            ))}
          </select>
          
          <select
            value={selectedConfidence}
            onChange={(e) => setSelectedConfidence(e.target.value)}
            className="w-full bg-black/40 border border-gray-600 rounded-xl px-3 py-3 text-white"
          >
            <option value="all">Toute confiance</option>
            <option value="high">Élevée (80-100%)</option>
            <option value="medium">Moyenne (60-79%)</option>
            <option value="low">Faible (0-59%)</option>
          </select>
          
          <button
            onClick={() => {
              setSearchTerm('');
              setSelectedCategory('all');
              setSelectedConfidence('all');
            }}
            className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-3 rounded-xl transition-all"
          >
            Réinitialiser
          </button>
        </div>
      </div>

      {/* Tableau des produits enrichis */}
      <div className="bg-white/10 backdrop-blur-xl rounded-2xl border border-white/20 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-black/20">
              <tr>
                <th className="text-left p-4 text-cyan-300 font-semibold">Produit</th>
                <th className="text-left p-4 text-cyan-300 font-semibold">Attributs Smart AI</th>
                <th className="text-left p-4 text-cyan-300 font-semibold">SEO</th>
                <th className="text-left p-4 text-cyan-300 font-semibold">Confiance</th>
                <th className="text-left p-4 text-cyan-300 font-semibold">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredProducts.map((product) => (
                <tr key={product.id} className="border-b border-white/10 hover:bg-white/5">
                  <td className="p-4">
                    <div className="flex items-center gap-3">
                      <div className="w-16 h-16 rounded-lg overflow-hidden bg-gray-600 flex-shrink-0">
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
                        <div className="font-semibold text-white text-sm mb-1">{product.title}</div>
                        <div className="text-gray-400 text-xs">{product.brand}</div>
                        <div className="text-green-400 font-bold text-sm">{product.price}€</div>
                        <div className="text-gray-500 text-xs">Stock: {product.stock_qty}</div>
                      </div>
                    </div>
                  </td>
                  
                  <td className="p-4">
                    <div className="space-y-2">
                      <div className="flex flex-wrap gap-1">
                        <span className="bg-blue-500/20 text-blue-300 px-2 py-1 rounded-full text-xs">
                          {product.category}
                        </span>
                        {product.subcategory && (
                          <span className="bg-purple-500/20 text-purple-300 px-2 py-1 rounded-full text-xs">
                            {product.subcategory}
                          </span>
                        )}
                      </div>
                      
                      <div className="grid grid-cols-2 gap-2 text-xs">
                        {product.color && (
                          <div className="text-gray-300">
                            <span className="text-gray-400">Couleur:</span> {product.color}
                          </div>
                        )}
                        {product.material && (
                          <div className="text-gray-300">
                            <span className="text-gray-400">Matériau:</span> {product.material}
                          </div>
                        )}
                        {product.style && (
                          <div className="text-gray-300">
                            <span className="text-gray-400">Style:</span> {product.style}
                          </div>
                        )}
                        {product.room && (
                          <div className="text-gray-300">
                            <span className="text-gray-400">Pièce:</span> {product.room}
                          </div>
                        )}
                      </div>
                      
                      {product.dimensions && (
                        <div className="text-gray-400 text-xs">
                          📏 {product.dimensions}
                        </div>
                      )}
                    </div>
                  </td>
                  
                  <td className="p-4">
                    <div className="space-y-1 text-xs">
                      <div className="text-white font-medium">
                        {product.seo_title.substring(0, 30)}...
                      </div>
                      <div className="text-gray-400">
                        {product.seo_description.substring(0, 40)}...
                      </div>
                      {product.google_product_category && (
                        <div className="text-cyan-400">
                          Google: {product.google_product_category}
                        </div>
                      )}
                    </div>
                  </td>
                  
                  <td className="p-4">
                    <div className="flex items-center gap-2">
                      <span className={`px-3 py-1 rounded-full text-xs font-bold border ${getConfidenceColor(product.confidence_score)}`}>
                        {product.confidence_score}%
                      </span>
                      {product.enrichment_source === 'text_and_vision' && (
                        <Eye className="w-4 h-4 text-purple-400" title="Enrichi avec Vision AI" />
                      )}
                    </div>
                  </td>
                  
                  <td className="p-4">
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleViewProduct(product)}
                        className="text-blue-400 hover:text-blue-300 p-1"
                        title="Voir détails"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                      <button
                        className="text-yellow-400 hover:text-yellow-300 p-1"
                        title="Modifier"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button
                        className="text-red-400 hover:text-red-300 p-1"
                        title="Supprimer"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Message si aucun produit */}
      {filteredProducts.length === 0 && (
        <div className="text-center py-20">
          <Brain className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-xl font-bold text-white mb-2">Aucun produit enrichi trouvé</h3>
          <p className="text-gray-400 mb-6">
            {products.length === 0 
              ? 'Aucun produit enrichi disponible. Lancez l\'enrichissement Smart AI.'
              : 'Aucun produit ne correspond à vos critères de recherche.'}
          </p>
          {products.length === 0 && (
            <button
              onClick={() => window.location.href = '#ml-training'}
              className="bg-gradient-to-r from-purple-500 to-pink-600 hover:from-purple-400 hover:to-pink-500 text-white px-6 py-3 rounded-xl font-semibold transition-all"
            >
              Lancer Smart AI
            </button>
          )}
        </div>
      )}

      {/* Modal détails produit */}
      {showDetailModal && selectedProduct && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-800/95 backdrop-blur-xl rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto border border-slate-600/50">
            <div className="flex items-center justify-between p-6 border-b border-slate-600/50">
              <h2 className="text-2xl font-bold text-white">Détails Smart AI</h2>
              <button
                onClick={() => setShowDetailModal(false)}
                className="text-gray-400 hover:text-white transition-colors text-2xl"
              >
                ×
              </button>
            </div>

            <div className="p-6 space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Image et infos de base */}
                <div>
                  <div className="w-full h-64 rounded-2xl overflow-hidden bg-gray-600 mb-4">
                    <img 
                      src={selectedProduct.image_url} 
                      alt={selectedProduct.title}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  
                  <h3 className="text-xl font-bold text-white mb-2">{selectedProduct.title}</h3>
                  <p className="text-gray-300 mb-4">{selectedProduct.description}</p>
                  
                  <div className="flex items-center gap-4 mb-4">
                    <span className="text-2xl font-bold text-green-400">{selectedProduct.price}€</span>
                    <span className={`px-3 py-1 rounded-full text-sm font-bold border ${getConfidenceColor(selectedProduct.confidence_score)}`}>
                      {selectedProduct.confidence_score}% confiance
                    </span>
                  </div>
                </div>

                {/* Attributs Smart AI */}
                <div className="space-y-6">
                  <div className="bg-black/20 rounded-xl p-4">
                    <h4 className="font-semibold text-white mb-3 flex items-center gap-2">
                      <Brain className="w-5 h-5 text-purple-400" />
                      Attributs Smart AI
                    </h4>
                    <div className="grid grid-cols-2 gap-3 text-sm">
                      <div>
                        <span className="text-gray-400">Catégorie:</span>
                        <div className="text-white font-medium">{selectedProduct.category}</div>
                      </div>
                      <div>
                        <span className="text-gray-400">Sous-catégorie:</span>
                        <div className="text-white font-medium">{selectedProduct.subcategory || 'Non définie'}</div>
                      </div>
                      <div>
                        <span className="text-gray-400">Couleur:</span>
                        <div className="text-white font-medium">{selectedProduct.color || 'Non détectée'}</div>
                      </div>
                      <div>
                        <span className="text-gray-400">Matériau:</span>
                        <div className="text-white font-medium">{selectedProduct.material || 'Non détecté'}</div>
                      </div>
                      <div>
                        <span className="text-gray-400">Style:</span>
                        <div className="text-white font-medium">{selectedProduct.style || 'Non détecté'}</div>
                      </div>
                      <div>
                        <span className="text-gray-400">Pièce:</span>
                        <div className="text-white font-medium">{selectedProduct.room || 'Non définie'}</div>
                      </div>
                    </div>
                    
                    {selectedProduct.dimensions && (
                      <div className="mt-3 pt-3 border-t border-gray-600">
                        <span className="text-gray-400">Dimensions:</span>
                        <div className="text-white font-medium">{selectedProduct.dimensions}</div>
                      </div>
                    )}
                  </div>

                  {/* SEO et Marketing */}
                  <div className="bg-black/20 rounded-xl p-4">
                    <h4 className="font-semibold text-white mb-3 flex items-center gap-2">
                      <Zap className="w-5 h-5 text-green-400" />
                      SEO & Marketing
                    </h4>
                    <div className="space-y-3 text-sm">
                      <div>
                        <span className="text-gray-400">SEO Titre:</span>
                        <div className="text-white">{selectedProduct.seo_title}</div>
                      </div>
                      <div>
                        <span className="text-gray-400">SEO Description:</span>
                        <div className="text-white">{selectedProduct.seo_description}</div>
                      </div>
                      <div>
                        <span className="text-gray-400">Google Ads Titre:</span>
                        <div className="text-white">{selectedProduct.ad_headline}</div>
                      </div>
                      <div>
                        <span className="text-gray-400">Google Ads Description:</span>
                        <div className="text-white">{selectedProduct.ad_description}</div>
                      </div>
                      {selectedProduct.google_product_category && (
                        <div>
                          <span className="text-gray-400">Google Merchant:</span>
                          <div className="text-cyan-400">{selectedProduct.google_product_category}</div>
                        </div>
                      )}
                      {selectedProduct.gtin && (
                        <div>
                          <span className="text-gray-400">GTIN:</span>
                          <div className="text-cyan-400">{selectedProduct.gtin}</div>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Tags */}
                  {selectedProduct.tags.length > 0 && (
                    <div className="bg-black/20 rounded-xl p-4">
                      <h4 className="font-semibold text-white mb-3">Tags</h4>
                      <div className="flex flex-wrap gap-2">
                        {selectedProduct.tags.map((tag, index) => (
                          <span key={index} className="bg-cyan-500/20 text-cyan-300 px-2 py-1 rounded-full text-xs">
                            {tag}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>

              <div className="flex justify-end gap-4 pt-6 border-t border-slate-600/50">
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