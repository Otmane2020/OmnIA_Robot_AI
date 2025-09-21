import React, { useState, useEffect } from 'react';
import { 
  Search, Filter, Plus, Eye, Edit, Trash2, ExternalLink, 
  Package, Tag, DollarSign, Image, BarChart3, Settings,
  ChevronDown, ChevronUp, X, Save, AlertCircle, CheckCircle,
  Brain, Zap, RefreshCw, Loader2
} from 'lucide-react';
import { useNotifications } from './NotificationSystem';
import { supabase } from '../lib/supabase';

interface EnrichedProduct {
  id: string;
  title: string;
  description: string;
  vendor: string;
  brand: string;
  category: string;
  subcategory: string;
  tags: string[];
  material: string;
  color: string;
  style: string;
  room: string;
  dimensions: string;
  price: number;
  compare_at_price?: number;
  stock_qty: number;
  image_url: string;
  product_url: string;
  confidence_score: number;
  enrichment_source: string;
  created_at: string;
  updated_at: string;
}

export const ProductsEnrichedTable: React.FC = () => {
  const [products, setProducts] = useState<EnrichedProduct[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<EnrichedProduct[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [loading, setLoading] = useState(true);
  const [isEnriching, setIsEnriching] = useState(false);
  const [enrichmentProgress, setEnrichmentProgress] = useState(0);
  const { showSuccess, showError, showInfo } = useNotifications();

  useEffect(() => {
    loadEnrichedProducts();
  }, []);

  useEffect(() => {
    filterProducts();
  }, [products, searchTerm, selectedCategory]);

  const loadEnrichedProducts = async () => {
    try {
      setLoading(true);
      
      const { data, error } = await supabase
        .from('products_enriched')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('❌ Erreur chargement produits enrichis:', error);
        showError('Erreur de chargement', 'Impossible de charger les produits enrichis.');
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
    let filtered = products;

    if (searchTerm) {
      filtered = filtered.filter(product =>
        product.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.vendor.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.material?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.color?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (selectedCategory !== 'all') {
      filtered = filtered.filter(product => product.category === selectedCategory);
    }

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

      // Progression réelle basée sur le traitement
      let processedCount = 0;
      const totalProducts = products.length;

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

  const handleImportCatalog = () => {
    const catalogProducts = localStorage.getItem('catalog_products');
    if (!catalogProducts) {
      showError('Catalogue vide', 'Aucun produit trouvé. Importez d\'abord votre catalogue depuis l\'onglet Catalogue.');
      return;
    }

    try {
      const products = JSON.parse(catalogProducts);
      const enrichedProducts = products.map((product: any) => ({
        id: `imported-${product.id || Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        handle: product.handle || product.id || 'product',
        title: product.name || product.title || 'Produit sans nom',
        description: product.description || '',
        vendor: product.vendor || 'Decora Home',
        brand: product.vendor || 'Decora Home',
        category: product.category || product.productType || 'Mobilier',
        subcategory: '',
        tags: Array.isArray(product.tags) ? product.tags : [],
        material: '',
        color: '',
        style: '',
        room: '',
        dimensions: '',
        price: parseFloat(product.price) || 0,
        compare_at_price: product.compare_at_price ? parseFloat(product.compare_at_price) : undefined,
        stock_qty: parseInt(product.stock) || parseInt(product.quantityAvailable) || 0,
        image_url: product.image_url || 'https://images.pexels.com/photos/1350789/pexels-photo-1350789.jpeg',
        product_url: product.product_url || '#',
        confidence_score: 0,
        enrichment_source: 'import',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }));

      setProducts(enrichedProducts);
      showSuccess('Import réussi', `${enrichedProducts.length} produits importés dans les produits enrichis.`);
    } catch (error) {
      console.error('❌ Erreur import:', error);
      showError('Erreur d\'import', 'Impossible d\'importer le catalogue.');
    }
  };
  const handleAutoTraining = async () => {
    try {
      showInfo('Entraînement auto', 'Démarrage de l\'entraînement automatique...');

      const response = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/auto-ai-trainer`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          products: products,
          source: 'enriched',
          store_id: 'demo-retailer-id',
          trigger_type: 'manual'
        }),
      });

      if (response.ok) {
        const result = await response.json();
        showSuccess(
          'Entraînement terminé !', 
          `OmnIA a été entraîné avec ${result.stats?.products_processed || products.length} produits !`
        );
      } else {
        const error = await response.json();
        showError('Entraînement échoué', error.error || 'Erreur lors de l\'entraînement.');
      }

    } catch (error) {
      console.error('❌ Erreur entraînement auto:', error);
      showError('Erreur d\'entraînement', 'Impossible de lancer l\'entraînement automatique.');
    }
  };

  const categories = [...new Set(products.map(p => p.category))].filter(Boolean);

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
          <h2 className="text-2xl font-bold text-white">Produits Enrichis DeepSeek</h2>
          <p className="text-gray-300">{filteredProducts.length} produit(s) enrichi(s) sur {products.length}</p>
        </div>
        
        <div className="flex flex-wrap gap-3">
          <button
            onClick={handleImportCatalog}
            className="bg-gradient-to-r from-blue-500 to-cyan-600 hover:from-blue-400 hover:to-cyan-500 text-white px-6 py-3 rounded-xl flex items-center gap-2 font-semibold transition-all"
          >
            <Package className="w-5 h-5" />
            Importer Catalogue
          </button>
          
          <button
            onClick={handleEnrichWithDeepSeek}
            disabled={isEnriching}
            className="bg-gradient-to-r from-purple-500 to-pink-600 hover:from-purple-400 hover:to-pink-500 disabled:from-gray-600 disabled:to-gray-700 text-white px-6 py-3 rounded-xl flex items-center gap-2 font-semibold transition-all disabled:cursor-not-allowed"
          >
            {isEnriching ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                Enrichissement... {enrichmentProgress}%
              </>
            ) : (
              <>
                <Brain className="w-5 h-5" />
                Enrichir avec DeepSeek
              </>
            )}
          </button>
          
          <button
            onClick={handleAutoTraining}
            className="bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white px-6 py-3 rounded-xl flex items-center gap-2 font-semibold transition-all"
          >
            <Zap className="w-5 h-5" />
            Entraînement Auto
          </button>
          
          <button
            onClick={loadEnrichedProducts}
            className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-3 rounded-xl flex items-center gap-2 transition-all"
          >
            <RefreshCw className="w-4 h-4" />
            Actualiser
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
              placeholder="Rechercher par titre, catégorie, matériau, couleur..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-3 bg-black/40 border border-gray-600 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:border-cyan-400 focus:ring-2 focus:ring-cyan-400/30"
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
          <div className="flex items-center justify-between">
            <p className="text-purple-300 text-sm">{enrichmentProgress}% - Analyse IA des attributs produits</p>
            {enrichmentProgress === 100 && (
              <div className="flex items-center gap-2 text-green-400">
                <CheckCircle className="w-4 h-4" />
                <span className="text-sm font-semibold">Terminé !</span>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Tableau des produits enrichis */}
      {products.length === 0 ? (
        <div className="text-center py-20">
          <Package className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-xl font-bold text-white mb-2">Aucun produit enrichi</h3>
          <p className="text-gray-400 mb-6">
            Importez votre catalogue ou enrichissez les produits existants avec DeepSeek IA.
          </p>
          <div className="flex gap-4 justify-center">
            <button
              onClick={handleImportCatalog}
              className="bg-gradient-to-r from-blue-500 to-cyan-600 hover:from-blue-400 hover:to-cyan-500 text-white px-6 py-3 rounded-xl font-semibold transition-all"
            >
              Importer Catalogue
            </button>
            <button
              onClick={handleEnrichWithDeepSeek}
              className="bg-gradient-to-r from-purple-500 to-pink-600 hover:from-purple-400 hover:to-pink-500 text-white px-6 py-3 rounded-xl font-semibold transition-all"
            >
              Enrichir avec IA
            </button>
          </div>
        </div>
      ) : (
        <div className="bg-white/10 backdrop-blur-xl rounded-2xl border border-white/20 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-black/20">
                <tr>
                  <th className="text-left p-4 text-cyan-300 font-semibold">Produit</th>
                  <th className="text-left p-4 text-cyan-300 font-semibold">Catégorie</th>
                  <th className="text-left p-4 text-cyan-300 font-semibold">Couleur</th>
                  <th className="text-left p-4 text-cyan-300 font-semibold">Matériau</th>
                  <th className="text-left p-4 text-cyan-300 font-semibold">Style</th>
                  <th className="text-left p-4 text-cyan-300 font-semibold">Pièce</th>
                  <th className="text-left p-4 text-cyan-300 font-semibold">Tags</th>
                  <th className="text-left p-4 text-cyan-300 font-semibold">Prix</th>
                  <th className="text-left p-4 text-cyan-300 font-semibold">Stock</th>
                  <th className="text-left p-4 text-cyan-300 font-semibold">Confiance</th>
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
                          <div className="font-semibold text-white text-sm">{product.title}</div>
                          <div className="text-gray-400 text-xs">{product.vendor}</div>
                          <div className="text-gray-500 text-xs">{product.category}</div>
                        </div>
                      </div>
                    </td>
                    <td className="p-4">
                      <span className="text-white text-sm">{product.category || 'Non défini'}</span>
                    </td>
                    <td className="p-4">
                      <span className={`px-2 py-1 rounded text-xs ${
                        product.color 
                          ? 'bg-blue-500/20 text-blue-300' 
                          : 'bg-gray-500/20 text-gray-400'
                      }`}>
                        {product.color || 'Non défini'}
                      </span>
                    </td>
                    <td className="p-4">
                      <span className={`px-2 py-1 rounded text-xs ${
                        product.material 
                          ? 'bg-green-500/20 text-green-300' 
                          : 'bg-gray-500/20 text-gray-400'
                      }`}>
                        {product.material || 'Non défini'}
                      </span>
                    </td>
                    <td className="p-4">
                      <span className={`px-2 py-1 rounded text-xs ${
                        product.style 
                          ? 'bg-purple-500/20 text-purple-300' 
                          : 'bg-gray-500/20 text-gray-400'
                      }`}>
                        {product.style || 'Non défini'}
                      </span>
                    </td>
                    <td className="p-4">
                      <span className={`px-2 py-1 rounded text-xs ${
                        product.room 
                          ? 'bg-orange-500/20 text-orange-300' 
                          : 'bg-gray-500/20 text-gray-400'
                      }`}>
                        {product.room || 'Non défini'}
                      </span>
                    </td>
                    <td className="p-4">
                      <div className="flex flex-wrap gap-1">
                        {Array.isArray(product.tags) && product.tags.length > 0 ? (
                          product.tags.slice(0, 3).map((tag, index) => (
                            <span key={index} className="bg-cyan-500/20 text-cyan-300 px-2 py-1 rounded text-xs">
                              {tag}
                            </span>
                          ))
                        ) : (
                          <span className="text-gray-400 text-xs">Aucun tag</span>
                        )}
                        {Array.isArray(product.tags) && product.tags.length > 3 && (
                          <span className="text-gray-400 text-xs">+{product.tags.length - 3}</span>
                        )}
                      </div>
                    </td>
                    <td className="p-4">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-green-400">{product.price}€</span>
                        {product.compare_at_price && product.compare_at_price > product.price && (
                          <span className="text-gray-400 line-through text-sm">{product.compare_at_price}€</span>
                        )}
                      </div>
                    </td>
                    <td className="p-4">
                      <div className="flex items-center gap-2">
                        <div className={`w-3 h-3 rounded-full ${product.stock_qty > 0 ? 'bg-green-400' : 'bg-red-400'}`}></div>
                        <span className={`font-semibold ${product.stock_qty > 0 ? 'text-green-400' : 'text-red-400'}`}>
                          {product.stock_qty > 0 ? `${product.stock_qty} en stock` : 'Rupture'}
                        </span>
                      </div>
                    </td>
                    <td className="p-4">
                      <div className="flex items-center gap-2">
                        <div className={`w-3 h-3 rounded-full ${
                          product.confidence_score >= 80 ? 'bg-green-400' :
                          product.confidence_score >= 60 ? 'bg-yellow-400' :
                          'bg-red-400'
                        }`}></div>
                        <span className="text-white text-sm">{product.confidence_score}%</span>
                      </div>
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
                          title="Ouvrir lien"
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
      )}

      {/* Stats enrichissement */}
      {products.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="bg-blue-600/20 backdrop-blur-xl rounded-2xl p-6 border border-blue-500/30">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-blue-200 text-sm mb-1">Total Enrichis</p>
                <p className="text-3xl font-bold text-white">{products.length}</p>
              </div>
              <Brain className="w-10 h-10 text-blue-400" />
            </div>
          </div>
          
          <div className="bg-green-600/20 backdrop-blur-xl rounded-2xl p-6 border border-green-500/30">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-green-200 text-sm mb-1">Confiance Moyenne</p>
                <p className="text-3xl font-bold text-white">
                  {products.length > 0 ? Math.round(products.reduce((sum, p) => sum + p.confidence_score, 0) / products.length) : 0}%
                </p>
              </div>
              <CheckCircle className="w-10 h-10 text-green-400" />
            </div>
          </div>
          
          <div className="bg-purple-600/20 backdrop-blur-xl rounded-2xl p-6 border border-purple-500/30">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-purple-200 text-sm mb-1">Catégories</p>
                <p className="text-3xl font-bold text-white">{categories.length}</p>
              </div>
              <Tag className="w-10 h-10 text-purple-400" />
            </div>
          </div>
          
          <div className="bg-orange-600/20 backdrop-blur-xl rounded-2xl p-6 border border-orange-500/30">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-orange-200 text-sm mb-1">En Stock</p>
                <p className="text-3xl font-bold text-white">
                  {products.filter(p => p.stock_qty > 0).length}
                </p>
              </div>
              <Package className="w-10 h-10 text-orange-400" />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};