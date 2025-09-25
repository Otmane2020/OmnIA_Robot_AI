import React, { useState, useEffect } from 'react';
import { Search, Filter, Plus, Eye, CreditCard as Edit, Trash2, ExternalLink, Package, Tag, DollarSign, Image, BarChart3, Settings, ChevronDown, ChevronUp, X, Save, AlertCircle, CheckCircle, Upload, Download } from 'lucide-react';
import { useNotifications } from './NotificationSystem';

interface SellerProduct {
  id: string;
  seller_id: string;
  external_id: string;
  name: string;
  description: string;
  price: number;
  compare_at_price?: number;
  category: string;
  vendor: string;
  image_url: string;
  product_url: string;
  stock: number;
  source_platform: string;
  status: 'active' | 'inactive' | 'draft';
  sku: string;
  tags: string[];
  extracted_attributes: any;
  confidence_score: number;
  created_at: string;
  updated_at: string;
}

interface SellerCatalogManagementProps {
  sellerId: string; // This should be the UUID
  sellerSubdomain?: string; // Add subdomain for context
}

export const SellerCatalogManagement: React.FC<SellerCatalogManagementProps> = ({ sellerId }) => {
  const [products, setProducts] = useState<SellerProduct[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<SellerProduct[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [selectedSource, setSelectedSource] = useState('all');
  const [showFilters, setShowFilters] = useState(false);
  const [selectedProducts, setSelectedProducts] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [viewMode, setViewMode] = useState<'table' | 'grid'>('table');
  const { showSuccess, showError, showInfo } = useNotifications();

  useEffect(() => {
    loadSellerProducts();
  }, [sellerId]);

  useEffect(() => {
    let filtered = products;

    if (searchTerm) {
      filtered = filtered.filter(product =>
        (product.name ?? '').toLowerCase().includes(searchTerm.toLowerCase()) ||
        (product.category ?? '').toLowerCase().includes(searchTerm.toLowerCase()) ||
        (product.vendor ?? '').toLowerCase().includes(searchTerm.toLowerCase()) ||
        (product.sku ?? '').toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (selectedCategory !== 'all') {
      filtered = filtered.filter(product => product.category === selectedCategory);
    }

    if (selectedStatus !== 'all') {
      filtered = filtered.filter(product => product.status === selectedStatus);
    }

    if (selectedSource !== 'all') {
      filtered = filtered.filter(product => product.source_platform === selectedSource);
    }

    setFilteredProducts(filtered);
  }, [products, searchTerm, selectedCategory, selectedStatus, selectedSource]);

  const loadSellerProducts = async () => {
    try {
      setIsLoading(true);
      
      // Charger UNIQUEMENT les produits de ce vendeur spécifique
      const sellerProductsKey = `seller_${sellerId}_products`; // Use sellerId (UUID)
      const savedProducts = localStorage.getItem(sellerProductsKey);
      let sellerProducts: SellerProduct[] = [];
      
      if (savedProducts) {
        try {
          const parsed = JSON.parse(savedProducts);
          sellerProducts = parsed.map((p: any) => ({
            ...p,
            seller_id: sellerId,
            id: p.id || `${sellerId}-${Date.now()}-${Math.random()}`,
            external_id: p.external_id || p.id || `ext-${Date.now()}`,
            tags: Array.isArray(p.tags) ? p.tags : [],
            extracted_attributes: p.extracted_attributes || {},
            confidence_score: p.confidence_score || 0
          }));
          console.log(`📦 Produits vendeur ${sellerId} chargés:`, sellerProducts.length);
        } catch (error) {
          console.error('Erreur parsing produits vendeur:', error);
          sellerProducts = [];
        }
      } else {
        console.log(`📦 Vendeur ${sellerId} - aucun produit (isolation complète)`);
        sellerProducts = [];
      }
      
      setProducts(sellerProducts);
      setFilteredProducts(sellerProducts);
      
    } catch (error) {
      console.error('❌ Erreur chargement produits vendeur:', error);
      showError('Erreur de chargement', 'Impossible de charger vos produits.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleImportProducts = () => {
    showInfo(
      'Import de produits',
      'Utilisez l\'onglet "Intégration" dans le menu principal pour importer votre catalogue via CSV, Shopify ou XML. Les produits seront automatiquement liés à votre compte.',
      [
        {
          label: 'Aller à l\'intégration',
          action: () => window.location.href = '/admin#integration',
          variant: 'primary'
        }
      ]
    );
  };

  const handleDeleteProduct = (productId: string) => {
    if (confirm('Supprimer ce produit ?')) {
      const updatedProducts = products.filter(p => p.id !== productId);
      setProducts(updatedProducts);
      localStorage.setItem(`seller_${sellerId}_products`, JSON.stringify(updatedProducts)); // Use sellerId (UUID)
      showSuccess('Produit supprimé', 'Le produit a été supprimé avec succès.');
    }
  };

  const handleDeleteSelected = () => {
    if (selectedProducts.length === 0) return;
    
    if (confirm(`Supprimer ${selectedProducts.length} produit(s) sélectionné(s) ?`)) {
      const updatedProducts = products.filter(p => !selectedProducts.includes(p.id));
      setProducts(updatedProducts);
      localStorage.setItem(`seller_${sellerId}_products`, JSON.stringify(updatedProducts)); // Use sellerId (UUID)
      setSelectedProducts([]);
      showSuccess('Produits supprimés', `${selectedProducts.length} produit(s) supprimé(s) avec succès.`);
    }
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

  const categories = [...new Set(products.map(p => p.category))];
  const sources = [...new Set(products.map(p => p.source_platform))];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-500/20 text-green-300';
      case 'inactive': return 'bg-yellow-500/20 text-yellow-300';
      case 'draft': return 'bg-gray-500/20 text-gray-300';
      default: return 'bg-gray-500/20 text-gray-300';
    }
  };

  const getSourceColor = (source: string) => {
    switch (source) {
      case 'shopify': return 'bg-green-500/20 text-green-300';
      case 'csv': return 'bg-blue-500/20 text-blue-300';
      case 'xml': return 'bg-purple-500/20 text-purple-300';
      case 'manual': return 'bg-orange-500/20 text-orange-300';
      default: return 'bg-gray-500/20 text-gray-300';
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-cyan-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-white text-lg">Chargement de votre catalogue...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-white">Mon Catalogue Produits</h2>
          <p className="text-gray-300">{filteredProducts.length} produit(s) affiché(s) sur {products.length}</p>
        </div>
        
        <div className="flex flex-wrap gap-3">
          <button
            onClick={handleImportProducts}
            className="bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-400 hover:to-emerald-500 text-white px-4 py-2 rounded-xl flex items-center gap-2 font-semibold transition-all"
          >
            <Upload className="w-4 h-4" />
            Importer produits
          </button>
          
          <button
            onClick={() => setViewMode(viewMode === 'table' ? 'grid' : 'table')}
            className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-xl flex items-center gap-2 transition-all"
          >
            <BarChart3 className="w-4 h-4" />
            {viewMode === 'table' ? 'Vue grille' : 'Vue tableau'}
          </button>
          
          {selectedProducts.length > 0 && (
            <button
              onClick={handleDeleteSelected}
              className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-xl flex items-center gap-2 transition-all"
            >
              <Trash2 className="w-4 h-4" />
              Supprimer ({selectedProducts.length})
            </button>
          )}
        </div>
      </div>

      {/* Search and Filters */}
      <div className="bg-white/10 backdrop-blur-xl rounded-2xl p-6 border border-white/20">
        <div className="flex flex-col lg:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Rechercher dans vos produits..."
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
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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
                <label className="block text-sm text-gray-300 mb-2">Statut</label>
                <select
                  value={selectedStatus}
                  onChange={(e) => setSelectedStatus(e.target.value)}
                  className="w-full bg-black/40 border border-gray-600 rounded-xl px-3 py-2 text-white"
                >
                  <option value="all">Tous les statuts</option>
                  <option value="active">Actif</option>
                  <option value="inactive">Inactif</option>
                  <option value="draft">Brouillon</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm text-gray-300 mb-2">Source</label>
                <select
                  value={selectedSource}
                  onChange={(e) => setSelectedSource(e.target.value)}
                  className="w-full bg-black/40 border border-gray-600 rounded-xl px-3 py-2 text-white"
                >
                  <option value="all">Toutes les sources</option>
                  {sources.map(source => (
                    <option key={source} value={source}>
                      {source === 'shopify' ? 'Shopify' : 
                       source === 'csv' ? 'CSV' : 
                       source === 'xml' ? 'XML' : 
                       source === 'manual' ? 'Manuel' : source}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Products Table */}
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
                  <th className="text-left p-4 text-cyan-300 font-semibold">Prix</th>
                  <th className="text-left p-4 text-cyan-300 font-semibold">Catégorie</th>
                  <th className="text-left p-4 text-cyan-300 font-semibold">Stock</th>
                  <th className="text-left p-4 text-cyan-300 font-semibold">Statut</th>
                  <th className="text-left p-4 text-cyan-300 font-semibold">Source</th>
                  <th className="text-left p-4 text-cyan-300 font-semibold">Actions</th>
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
                        className="w-4 h-4 text-cyan-600 bg-gray-800 border-gray-600 rounded focus:ring-cyan-500"
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
                          <div className="text-gray-400 text-xs">{product.vendor}</div>
                          <div className="text-gray-500 text-xs mt-1 line-clamp-2">
                            {product.description ? 
                              product.description.substring(0, 100) + '...' : 
                              'Aucune description'
                            }
                          </div>
                          {product.sku && (
                            <div className="text-gray-500 text-xs">SKU: {product.sku}</div>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="p-4">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-green-400">{product.price}€</span>
                        {product.compare_at_price && product.compare_at_price > product.price && (
                          <>
                            <span className="text-gray-400 line-through text-sm">{product.compare_at_price}€</span>
                            <span className="bg-red-500/20 text-red-300 px-2 py-1 rounded-full text-xs">
                              -{Math.round(((product.compare_at_price - product.price) / product.compare_at_price) * 100)}%
                            </span>
                          </>
                        )}
                      </div>
                    </td>
                    <td className="p-4">
                      <span className="text-white">{product.category}</span>
                    </td>
                    <td className="p-4">
                      <span className={`font-semibold ${product.stock > 0 ? 'text-green-400' : 'text-red-400'}`}>
                        {product.stock}
                      </span>
                    </td>
                    <td className="p-4">
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(product.status)}`}>
                        {product.status}
                      </span>
                    </td>
                    <td className="p-4">
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${getSourceColor(product.source_platform)}`}>
                        {product.source_platform}
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
                        <button
                          className="text-yellow-400 hover:text-yellow-300 p-1"
                          title="Modifier"
                        >
                          <Edit className="w-4 h-4" />
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
              <div className="relative">
                <input
                  type="checkbox"
                  checked={selectedProducts.includes(product.id)}
                  onChange={() => handleSelectProduct(product.id)}
                  className="absolute top-2 left-2 w-4 h-4 text-cyan-600 bg-gray-800 border-gray-600 rounded focus:ring-cyan-500 z-10"
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
              
              <h3 className="font-semibold text-white mb-2 line-clamp-2">{product.name}</h3>
              <p className="text-gray-300 text-sm mb-3">{product.category} • {product.vendor}</p>
              
              <div className="flex items-center gap-2 mb-3">
                <span className="text-xl font-bold text-green-400">{product.price}€</span>
                {product.compare_at_price && product.compare_at_price > product.price && (
                  <>
                    <span className="text-gray-400 line-through text-sm">{product.compare_at_price}€</span>
                    <span className="bg-red-500/20 text-red-300 px-2 py-1 rounded-full text-xs">
                      -{Math.round(((product.compare_at_price - product.price) / product.compare_at_price) * 100)}%
                    </span>
                  </>
                )}
              </div>
              
              <div className="flex items-center justify-between mb-4">
                <span className={`px-2 py-1 rounded-full text-xs ${getStatusColor(product.status)}`}>
                  {product.status}
                </span>
                <span className={`font-semibold ${product.stock > 0 ? 'text-green-400' : 'text-red-400'}`}>
                  Stock: {product.stock}
                </span>
              </div>
              
              <div className="flex gap-2">
                <button className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-2 rounded-lg flex items-center justify-center gap-1 text-sm">
                  <Eye className="w-3 h-3" />
                  Voir
                </button>
                <button className="flex-1 bg-yellow-600 hover:bg-yellow-700 text-white py-2 rounded-lg flex items-center justify-center gap-1 text-sm">
                  <Edit className="w-3 h-3" />
                  Modifier
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Empty State */}
      {filteredProducts.length === 0 && (
        <div className="text-center py-20">
          <Package className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-xl font-bold text-white mb-2">Aucun produit trouvé</h3>
          <p className="text-gray-400 mb-6">
            {searchTerm || selectedCategory !== 'all' || selectedStatus !== 'all' || selectedSource !== 'all'
              ? 'Aucun produit ne correspond à vos critères de recherche.'
              : 'Votre catalogue est vide. Commencez par importer vos produits.'}
          </p>
          <button
            onClick={handleImportProducts}
            className="bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-400 hover:to-emerald-500 text-white px-6 py-3 rounded-xl font-semibold transition-all"
          >
            Importer vos produits
          </button>
        </div>
      )}
    </div>
  );
};