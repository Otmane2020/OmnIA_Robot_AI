import React, { useState, useEffect } from 'react';
import { 
  Search, Filter, Plus, Eye, Edit, Trash2, ExternalLink, 
  Package, Tag, DollarSign, Image, BarChart3, Settings,
  ChevronDown, ChevronUp, X, Save, AlertCircle, CheckCircle,
  Upload, Download, RefreshCw, Brain, Loader2, Zap
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
  retailerId?: string;
  vendorId?: string;
  refreshTrigger?: number;
}

export const ProductsEnrichedTable: React.FC<ProductsEnrichedTableProps> = ({ 
  retailerId, 
  vendorId,
  refreshTrigger 
}) => {
  const [enrichedProducts, setEnrichedProducts] = useState<EnrichedProduct[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<EnrichedProduct[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedSource, setSelectedSource] = useState('all');
  const [showFilters, setShowFilters] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncProgress, setSyncProgress] = useState(0);
  const [lastSyncTime, setLastSyncTime] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<'table' | 'grid'>('table');
  const { showSuccess, showError, showInfo } = useNotifications();

  const effectiveId = retailerId || vendorId || 'demo-retailer-id';

  useEffect(() => {
    loadEnrichedProducts();
  }, [effectiveId]);

  // Auto-sync when refreshTrigger changes
  useEffect(() => {
    if (refreshTrigger && refreshTrigger > 0) {
      console.log('🔄 Auto-sync déclenché par refreshTrigger:', refreshTrigger);
      syncEnrichedProducts();
    }
  }, [refreshTrigger]);

  useEffect(() => {
    // Filter products
    let filtered = enrichedProducts;

    if (searchTerm) {
      filtered = filtered.filter(product =>
        product.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.subcategory.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.brand.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.color.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.material.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.style.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (selectedCategory !== 'all') {
      filtered = filtered.filter(product => product.category === selectedCategory);
    }

    if (selectedSource !== 'all') {
      filtered = filtered.filter(product => product.enrichment_source === selectedSource);
    }

    setFilteredProducts(filtered);
  }, [enrichedProducts, searchTerm, selectedCategory, selectedSource]);

  const loadEnrichedProducts = async () => {
    try {
      setIsLoading(true);
      console.log('📦 Chargement produits enrichis pour:', effectiveId);

      const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
      const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

      if (!supabaseUrl || !supabaseKey) {
        console.log('⚠️ Supabase non configuré, chargement depuis localStorage');
        loadFromLocalStorage();
        return;
      }

      // Try to load from Supabase first - without retailer_id filter since column doesn't exist
      const response = await fetch(`${supabaseUrl}/rest/v1/products_enriched?select=*&order=enriched_at.desc&limit=100`, {
        headers: {
          'apikey': supabaseKey,
          'Authorization': `Bearer ${supabaseKey}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        console.log('✅ Produits enrichis chargés depuis Supabase:', data.length);
        setEnrichedProducts(data);
        setLastSyncTime(data[0]?.enriched_at || null);
      } else {
        console.log('⚠️ Erreur Supabase, fallback localStorage');
        loadFromLocalStorage();
      }

    } catch (error) {
      console.error('❌ Erreur chargement produits enrichis:', error);
      loadFromLocalStorage();
    } finally {
      setIsLoading(false);
    }
  };

  const loadFromLocalStorage = () => {
    try {
      // Load from localStorage as fallback
      const storageKey = `enriched_products_${effectiveId}`;
      const savedProducts = localStorage.getItem(storageKey);
      
      if (savedProducts) {
        const products = JSON.parse(savedProducts);
        console.log('📦 Produits enrichis chargés depuis localStorage:', products.length);
        setEnrichedProducts(products);
        setLastSyncTime(products[0]?.enriched_at || null);
      } else {
        console.log('📦 Aucun produit enrichi trouvé');
        setEnrichedProducts([]);
      }
    } catch (error) {
      console.error('❌ Erreur chargement localStorage:', error);
      setEnrichedProducts([]);
    }
  };

  const syncEnrichedProducts = async () => {
    try {
      setIsSyncing(true);
      setSyncProgress(0);
      
      console.log('🔄 [sync-debug] Début synchronisation pour retailer:', effectiveId);
      
      showInfo('Synchronisation démarrée', 'Enrichissement des produits avec IA...');

      // Get products from catalog to enrich
      const catalogProducts = getCatalogProducts();
      console.log('📦 [sync-debug] Produits catalogue trouvés:', catalogProducts.length);

      if (catalogProducts.length === 0) {
        showError('Aucun produit', 'Aucun produit trouvé dans le catalogue à enrichir.');
        return;
      }

      setSyncProgress(20);

      const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
      const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
      
      if (!supabaseUrl || !supabaseKey) {
        throw new Error('Supabase non configuré');
      }

      // Use direct fetch to Edge Function
      const response = await fetch(`${supabaseUrl}/functions/v1/enrich-products-cron`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${supabaseKey}`,
        },
        body: JSON.stringify({
          products: catalogProducts,
          retailer_id: effectiveId,
          force_full_enrichment: true,
          enable_image_analysis: false
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('❌ [sync-debug] Erreur Edge Function:', response.status, errorText);
        throw new Error(`HTTP ${response.status}: ${errorText}`);
      }

      const data = await response.json();
      console.log('✅ [sync-debug] Enrichissement réussi:', data);
      setSyncProgress(100);

      // Reload enriched products
      await loadEnrichedProducts();

      showSuccess(
        'Synchronisation terminée',
        `${data?.stats?.enriched_products || 0} produits enrichis avec IA !`,
        [
          {
            label: 'Voir les résultats',
            action: () => setViewMode('table'),
            variant: 'primary'
          }
        ]
      );

    } catch (error: any) {
      console.error('❌ [sync-debug] Erreur détaillée:', error);
      
      if (error.name === 'AbortError') {
        showError('Synchronisation annulée', 'La synchronisation a pris trop de temps et a été annulée.');
      } else {
        showError(
          'Erreur de synchronisation', 
          `${error.message || 'Erreur lors de la synchronisation des produits enrichis.'}\n\nVérifiez:\n• Configuration Supabase\n• Déploiement Edge Function\n• Variables d'environnement`
        );
      }
    } finally {
      setIsSyncing(false);
      setSyncProgress(0);
    }
  };

  const getCatalogProducts = () => {
    try {
      // Load products from localStorage
      const storageKey = retailerId ? `seller_${retailerId}_products` : 
                        vendorId ? `vendor_${vendorId}_products` : 
                        'catalog_products';
      
      const savedProducts = localStorage.getItem(storageKey);
      if (savedProducts) {
        const products = JSON.parse(savedProducts);
        return products.filter((p: any) => p.status === 'active' && (p.stock > 0 || p.quantityAvailable > 0));
      }
    } catch (error) {
      console.error('❌ Erreur chargement catalogue:', error);
    }
    return [];
  };

  const handleDeleteProduct = (productId: string) => {
    if (confirm('Supprimer ce produit enrichi ?')) {
      const updatedProducts = enrichedProducts.filter(p => p.id !== productId);
      setEnrichedProducts(updatedProducts);
      
      // Save to localStorage
      const storageKey = `enriched_products_${effectiveId}`;
      localStorage.setItem(storageKey, JSON.stringify(updatedProducts));
      
      showSuccess('Produit supprimé', 'Le produit enrichi a été supprimé avec succès.');
    }
  };

  const getConfidenceColor = (score: number) => {
    if (score >= 80) return 'bg-green-500/20 text-green-300';
    if (score >= 60) return 'bg-yellow-500/20 text-yellow-300';
    return 'bg-red-500/20 text-red-300';
  };

  const getSourceColor = (source: string) => {
    switch (source) {
      case 'text_and_image': return 'bg-purple-500/20 text-purple-300';
      case 'text_only': return 'bg-blue-500/20 text-blue-300';
      case 'manual': return 'bg-orange-500/20 text-orange-300';
      default: return 'bg-gray-500/20 text-gray-300';
    }
  };

  const categories = [...new Set(enrichedProducts.map(p => p.category))];
  const sources = [...new Set(enrichedProducts.map(p => p.enrichment_source))];

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-cyan-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-white text-lg">Chargement du catalogue enrichi...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header avec actions */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-white">Catalogue Enrichi IA</h2>
          <p className="text-gray-300">
            {filteredProducts.length} produit(s) enrichi(s) sur {enrichedProducts.length}
            {lastSyncTime && (
              <span className="ml-2 text-cyan-400">
                • Dernière sync: {new Date(lastSyncTime).toLocaleDateString('fr-FR')}
              </span>
            )}
          </p>
        </div>
        
        <div className="flex flex-wrap gap-3">
          <button
            onClick={syncEnrichedProducts}
            disabled={isSyncing}
            className="bg-gradient-to-r from-purple-500 to-pink-600 hover:from-purple-400 hover:to-pink-500 disabled:from-gray-600 disabled:to-gray-700 text-white px-4 py-2 rounded-xl flex items-center gap-2 font-semibold transition-all disabled:cursor-not-allowed"
          >
            {isSyncing ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Synchronisation...
              </>
            ) : (
              <>
                <Brain className="w-4 h-4" />
                Synchroniser avec IA
              </>
            )}
          </button>
          
          <button
            onClick={loadEnrichedProducts}
            className="bg-cyan-600 hover:bg-cyan-700 text-white px-4 py-2 rounded-xl flex items-center gap-2 transition-all"
          >
            <RefreshCw className="w-4 h-4" />
            Actualiser
          </button>
          
          <button
            onClick={() => setViewMode(viewMode === 'table' ? 'grid' : 'table')}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-xl flex items-center gap-2 transition-all"
          >
            <BarChart3 className="w-4 h-4" />
            {viewMode === 'table' ? 'Vue grille' : 'Vue tableau'}
          </button>
        </div>
      </div>

      {/* Progress bar during sync */}
      {isSyncing && (
        <div className="bg-purple-500/20 border border-purple-400/50 rounded-xl p-4">
          <div className="flex items-center gap-3 mb-3">
            <Brain className="w-5 h-5 text-purple-400 animate-pulse" />
            <span className="text-purple-200 font-semibold">Enrichissement IA en cours...</span>
          </div>
          <div className="w-full bg-gray-700 rounded-full h-3">
            <div 
              className="bg-gradient-to-r from-purple-500 to-pink-500 h-3 rounded-full transition-all duration-500" 
              style={{ width: `${syncProgress}%` }}
            ></div>
          </div>
          <p className="text-purple-300 text-sm mt-2">{syncProgress}% terminé</p>
        </div>
      )}

      {/* Search and filters */}
      <div className="bg-white/10 backdrop-blur-xl rounded-2xl p-6 border border-white/20">
        <div className="flex flex-col lg:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Rechercher par titre, catégorie, couleur, matériau..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-3 bg-black/40 border border-gray-600 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:border-cyan-400 focus:ring-2 focus:ring-cyan-400/30"
            />
          </div>
          
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-3 rounded-xl flex items-center gap-2 transition-all"
          >
            <Filter className="w-4 h-4" />
            Filtres
            {showFilters ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </button>
        </div>

        {showFilters && (
          <div className="mt-6 pt-6 border-t border-gray-600/50">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                <label className="block text-sm text-gray-300 mb-2">Source d'enrichissement</label>
                <select
                  value={selectedSource}
                  onChange={(e) => setSelectedSource(e.target.value)}
                  className="w-full bg-black/40 border border-gray-600 rounded-xl px-3 py-2 text-white"
                >
                  <option value="all">Toutes les sources</option>
                  {sources.map(source => (
                    <option key={source} value={source}>
                      {source === 'text_and_image' ? 'Texte + Image' : 
                       source === 'text_only' ? 'Texte uniquement' : 
                       source === 'manual' ? 'Manuel' : source}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Products table/grid */}
      {viewMode === 'table' ? (
        <div className="bg-white/10 backdrop-blur-xl rounded-2xl border border-white/20 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-black/20">
                <tr>
                  <th className="text-left p-4 text-cyan-300 font-semibold">Produit</th>
                  <th className="text-left p-4 text-cyan-300 font-semibold">Catégorie</th>
                  <th className="text-left p-4 text-cyan-300 font-semibold">Attributs IA</th>
                  <th className="text-left p-4 text-cyan-300 font-semibold">Prix</th>
                  <th className="text-left p-4 text-cyan-300 font-semibold">Confiance</th>
                  <th className="text-left p-4 text-cyan-300 font-semibold">Source</th>
                  <th className="text-left p-4 text-cyan-300 font-semibold">Actions</th>
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
                          <div className="font-semibold text-white text-sm line-clamp-2">{product.title}</div>
                          <div className="text-gray-400 text-xs">{product.brand}</div>
                          <div className="text-gray-500 text-xs mt-1">
                            {product.subcategory || 'Sous-catégorie non définie'}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="p-4">
                      <div className="text-white font-medium">{product.category}</div>
                      <div className="text-gray-400 text-xs">{product.subcategory}</div>
                    </td>
                    <td className="p-4">
                      <div className="space-y-1">
                        {product.color && (
                          <span className="inline-block bg-pink-500/20 text-pink-300 px-2 py-1 rounded-full text-xs mr-1">
                            {product.color}
                          </span>
                        )}
                        {product.material && (
                          <span className="inline-block bg-green-500/20 text-green-300 px-2 py-1 rounded-full text-xs mr-1">
                            {product.material}
                          </span>
                        )}
                        {product.style && (
                          <span className="inline-block bg-blue-500/20 text-blue-300 px-2 py-1 rounded-full text-xs mr-1">
                            {product.style}
                          </span>
                        )}
                        {product.room && (
                          <span className="inline-block bg-orange-500/20 text-orange-300 px-2 py-1 rounded-full text-xs mr-1">
                            {product.room}
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="p-4">
                      <span className="font-bold text-green-400">{product.price}€</span>
                    </td>
                    <td className="p-4">
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${getConfidenceColor(product.confidence_score)}`}>
                        {product.confidence_score}%
                      </span>
                    </td>
                    <td className="p-4">
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${getSourceColor(product.enrichment_source)}`}>
                        {product.enrichment_source === 'text_and_image' ? 'Texte + Image' : 
                         product.enrichment_source === 'text_only' ? 'Texte' : 
                         product.enrichment_source}
                      </span>
                    </td>
                    <td className="p-4">
                      <div className="flex gap-2">
                        <button
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
                        <button
                          onClick={() => handleDeleteProduct(product.id)}
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
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredProducts.map((product) => (
            <div key={product.id} className="bg-white/10 backdrop-blur-xl rounded-2xl p-4 border border-white/20 hover:border-cyan-500/50 transition-all hover:scale-105">
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
              
              <div className="space-y-2 mb-4">
                {product.color && (
                  <div className="flex items-center gap-2">
                    <span className="text-gray-400 text-xs">Couleur:</span>
                    <span className="text-pink-300 text-xs font-medium">{product.color}</span>
                  </div>
                )}
                {product.material && (
                  <div className="flex items-center gap-2">
                    <span className="text-gray-400 text-xs">Matériau:</span>
                    <span className="text-green-300 text-xs font-medium">{product.material}</span>
                  </div>
                )}
                {product.style && (
                  <div className="flex items-center gap-2">
                    <span className="text-gray-400 text-xs">Style:</span>
                    <span className="text-blue-300 text-xs font-medium">{product.style}</span>
                  </div>
                )}
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

      {/* Empty state */}
      {filteredProducts.length === 0 && !isLoading && (
        <div className="text-center py-20">
          <Brain className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-xl font-bold text-white mb-2">Aucun produit enrichi</h3>
          <p className="text-gray-400 mb-6">
            {enrichedProducts.length === 0 
              ? 'Votre catalogue enrichi est vide. Lancez une synchronisation pour enrichir vos produits avec l\'IA.'
              : 'Aucun produit ne correspond à vos critères de recherche.'}
          </p>
          {enrichedProducts.length === 0 && (
            <button
              onClick={syncEnrichedProducts}
              disabled={isSyncing}
              className="bg-gradient-to-r from-purple-500 to-pink-600 hover:from-purple-400 hover:to-pink-500 disabled:from-gray-600 disabled:to-gray-700 text-white px-6 py-3 rounded-xl font-semibold transition-all disabled:cursor-not-allowed"
            >
              {isSyncing ? 'Synchronisation...' : 'Enrichir le catalogue'}
            </button>
          )}
        </div>
      )}

      {/* Stats summary */}
      {enrichedProducts.length > 0 && (
        <div className="bg-gradient-to-r from-purple-500/20 to-pink-600/20 backdrop-blur-xl rounded-2xl p-6 border border-purple-400/30">
          <h3 className="text-lg font-bold text-white mb-4">📊 Statistiques d'enrichissement</h3>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-400">{enrichedProducts.length}</div>
              <div className="text-purple-300 text-sm">Produits enrichis</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-400">
                {Math.round(enrichedProducts.reduce((sum, p) => sum + p.confidence_score, 0) / enrichedProducts.length)}%
              </div>
              <div className="text-green-300 text-sm">Confiance moyenne</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-400">{categories.length}</div>
              <div className="text-blue-300 text-sm">Catégories</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-orange-400">
                {enrichedProducts.filter(p => p.enrichment_source === 'text_and_image').length}
              </div>
              <div className="text-orange-300 text-sm">Avec analyse image</div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};