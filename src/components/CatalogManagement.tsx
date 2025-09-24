import React, { useState, useEffect } from 'react';
import { 
  Search, Filter, Plus, Eye, Edit, Trash2, ExternalLink, 
  Package, Tag, DollarSign, Image, BarChart3, Settings,
  ChevronDown, ChevronUp, X, Save, AlertCircle, CheckCircle
} from 'lucide-react';
import { ProductDetailModal } from './ProductDetailModal';
import { AddProductModal } from './AddProductModal';
import { useNotifications } from './NotificationSystem';

interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  compare_at_price?: number;
  category: string;
  vendor: string;
  image_url: string;
  product_url: string;
  stock: number;
  status: 'active' | 'inactive' | 'draft';
  source_platform: string;
  sku?: string;
  variants?: ProductVariant[];
  created_at: string;
  updated_at: string;
}

interface ProductVariant {
  id: string;
  title: string;
  price: number;
  compare_at_price?: number;
  stock: number;
  sku: string;
  options: { name: string; value: string }[];
}

export const CatalogManagement: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [selectedSource, setSelectedSource] = useState('all');
  const [showFilters, setShowFilters] = useState(false);
  const [selectedProducts, setSelectedProducts] = useState<string[]>([]);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [viewMode, setViewMode] = useState<'table' | 'grid'>('table');
  const { showSuccess, showError, showInfo } = useNotifications();

  const translateCategory = (category: string): string => {
    const translations: { [key: string]: string } = {
      'furniture': 'Mobilier',
      'sofa': 'Canapé',
      'chair': 'Chaise',
      'table': 'Table',
      'bed': 'Lit',
      'storage': 'Rangement',
      'lighting': 'Éclairage',
      'decoration': 'Décoration',
      'outdoor': 'Extérieur',
      'office': 'Bureau',
      'living room': 'Salon',
      'bedroom': 'Chambre',
      'dining room': 'Salle à manger',
      'kitchen': 'Cuisine'
    };
    
    const lowerCategory = category.toLowerCase();
    return translations[lowerCategory] || category;
  };

  // Mock data - remplacez par vos vraies données
  const mockProducts: Product[] = [
    {
      id: 'decora-canape-alyana-beige',
      name: 'Canapé ALYANA convertible - Beige',
      description: 'Canapé d\'angle convertible 4 places en velours côtelé beige avec coffre de rangement',
      price: 799,
      compare_at_price: 1399,
      category: translateCategory('Canapé'),
      vendor: 'Decora Home',
      image_url: 'https://cdn.shopify.com/s/files/1/0903/7578/2665/files/7_23a97631-68d2-4f3e-8f78-b26c7cd4c2ae.png?v=1754406480',
      product_url: 'https://decorahome.fr/products/canape-dangle-convertible-et-reversible-4-places-en-velours-cotele',
      stock: 100,
      status: 'active',
      source_platform: 'shopify',
      sku: 'ALYAAVCOTBEI-DH',
      variants: [
        {
          id: 'var-beige',
          title: 'Beige',
          price: 799,
          compare_at_price: 1399,
          stock: 100,
          sku: 'ALYAAVCOTBEI-DH',
          options: [{ name: 'Couleur', value: 'Beige' }]
        },
        {
          id: 'var-taupe',
          title: 'Taupe',
          price: 799,
          compare_at_price: 1399,
          stock: 95,
          sku: 'ALYAAVCOTTAU-DH',
          options: [{ name: 'Couleur', value: 'Taupe' }]
        }
      ],
      created_at: '2024-12-15T10:30:00Z',
      updated_at: '2025-01-15T14:20:00Z'
    },
    {
      id: 'decora-table-aurea-100',
      name: 'Table AUREA Ø100cm - Travertin',
      description: 'Table ronde en travertin naturel avec pieds en métal noir',
      price: 499,
      compare_at_price: 859,
      category: 'Table',
      vendor: 'Decora Home',
      image_url: 'https://cdn.shopify.com/s/files/1/0903/7578/2665/files/3_e80b9a50-b032-4267-8f5b-f9130153e3be.png?v=1754406484',
      product_url: 'https://decorahome.fr/products/table-a-manger-ronde-plateau-en-travertin-naturel-100-120-cm',
      stock: 50,
      status: 'active',
      source_platform: 'shopify',
      sku: 'TB18T100-DH',
      variants: [
        {
          id: 'var-100cm',
          title: 'Ø100cm',
          price: 499,
          compare_at_price: 859,
          stock: 50,
          sku: 'TB18T100-DH',
          options: [{ name: 'Taille', value: '100cm' }]
        },
        {
          id: 'var-120cm',
          title: 'Ø120cm',
          price: 549,
          compare_at_price: 909,
          stock: 30,
          sku: 'TB18T120-DH',
          options: [{ name: 'Taille', value: '120cm' }]
        }
      ],
      created_at: '2024-11-20T09:15:00Z',
      updated_at: '2025-01-10T16:45:00Z'
    },
    {
      id: 'decora-chaise-inaya-gris',
      name: 'Chaise INAYA - Gris chenille',
      description: 'Chaise en tissu chenille avec pieds métal noir',
      price: 99,
      compare_at_price: 149,
      category: 'Chaise',
      vendor: 'Decora Home',
      image_url: 'https://cdn.shopify.com/s/files/1/0903/7578/2665/files/3_3f11d1af-8ce5-4d2d-a435-cd0a78eb92ee.png?v=1755791319',
      product_url: 'https://decorahome.fr/products/chaise-en-tissu-serge-chenille-pieds-metal-noir-gris-clair-moka-et-beige',
      stock: 96,
      status: 'active',
      source_platform: 'csv',
      sku: 'DC11PNNCHLG-DH',
      created_at: '2024-10-05T14:22:00Z',
      updated_at: '2025-01-08T11:30:00Z'
    }
  ];

  useEffect(() => {
    loadCatalogProducts();
  }, []);

  const loadCatalogProducts = async () => {
    try {
      setIsLoading(true);
      console.log('📦 Chargement catalogue admin...');
      
      // Charger uniquement les produits du catalogue global (admin)
      const savedProducts = localStorage.getItem('catalog_products');
      let allProducts: Product[] = [];
      
      if (savedProducts) {
        try {
          const parsedSaved = JSON.parse(savedProducts);
          console.log('📦 Produits catalogue chargés:', parsedSaved.length);
          
          // Valider et nettoyer les produits
          allProducts = parsedSaved.filter((p: any) => {
            const isValid = p && p.name && p.price > 0;
            if (!isValid) {
              console.warn('⚠️ Produit invalide ignoré:', p);
            }
            return isValid;
          }).map((p: any) => ({
            id: p.id || `catalog-${Date.now()}-${Math.random()}`,
            name: p.name || p.title || 'Produit sans nom',
            description: p.description || p.body_html || '',
            price: parseFloat(p.price) || parseFloat(p.variant_price) || 0,
            compare_at_price: p.compare_at_price || p.variant_compare_at_price,
            category: p.category || p.productType || p.product_type || 'Mobilier',
            vendor: p.vendor || 'Boutique',
            image_url: p.image_url || p.image_src || 'https://images.pexels.com/photos/1350789/pexels-photo-1350789.jpeg',
            product_url: p.product_url || '#',
            stock: parseInt(p.stock) || parseInt(p.variant_inventory_qty) || 0,
            status: p.status || 'active',
            source_platform: p.source_platform || 'csv',
            sku: p.sku || p.variant_sku || '',
            variants: p.variants || [{
              id: `${p.id}-default`,
              title: 'Default',
              price: parseFloat(p.price) || 0,
              compareAtPrice: p.compare_at_price,
              availableForSale: true,
              quantityAvailable: parseInt(p.stock) || 0,
              selectedOptions: []
            }],
            created_at: p.created_at || new Date().toISOString(),
            updated_at: p.updated_at || new Date().toISOString()
          }));
          
          console.log('✅ Produits catalogue validés:', allProducts.length);
        } catch (error) {
          console.error('Erreur parsing produits catalogue:', error);
          allProducts = [];
        }
      } else {
        console.log('📦 Catalogue admin vide');
        allProducts = [];
      }
      
      setProducts(allProducts);
      setFilteredProducts(allProducts);
      
    } catch (error) {
      console.error('❌ Erreur chargement catalogue:', error);
      showError('Erreur de chargement', 'Impossible de charger le catalogue.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    // Filtrer les produits
    let filtered = products;

    if (searchTerm) {
      filtered = filtered.filter(product =>
        product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.vendor.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.sku?.toLowerCase().includes(searchTerm.toLowerCase())
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

  const categories = [...new Set(products.map(p => p.category))];
  const sources = [...new Set(products.map(p => p.source_platform))];

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
    
    if (confirm(`Supprimer ${selectedProducts.length} produit(s) sélectionné(s) ?`)) {
      const updatedProducts = products.filter(p => !selectedProducts.includes(p.id));
      setProducts(updatedProducts);
      
      // Sauvegarder dans localStorage
      localStorage.setItem('catalog_products', JSON.stringify(updatedProducts));
      
      setSelectedProducts([]);
      showSuccess('Produits supprimés', `${selectedProducts.length} produit(s) supprimé(s) avec succès.`);
    }
  };

  const handleDeleteAll = () => {
    if (confirm('Supprimer TOUS les produits du catalogue ? Cette action est irréversible.')) {
      setProducts([]);
      
      // Vider localStorage
      localStorage.removeItem('catalog_products');
      
      setSelectedProducts([]);
      showSuccess('Catalogue vidé', 'Tous les produits ont été supprimés.');
    }
  };

  const handleViewProduct = (product: Product) => {
    setSelectedProduct(product);
    setShowDetailModal(true);
  };

  const handleEditProduct = (product: Product) => {
    setSelectedProduct(product);
    setShowAddModal(true);
  };

  const handleDeleteProduct = (productId: string) => {
    if (confirm('Supprimer ce produit ?')) {
      setProducts(prev => prev.filter(p => p.id !== productId));
      showSuccess('Produit supprimé', 'Le produit a été supprimé avec succès.');
    }
  };

  const handleAddProduct = (productData: any) => {
    const newProduct: Product = {
      id: `manual-${Date.now()}`,
      ...productData,
      source_platform: 'manual',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
    
    setProducts(prev => [newProduct, ...prev]);
    
    // Sauvegarder dans localStorage
    const allProducts = [newProduct, ...products];
    localStorage.setItem('catalog_products', JSON.stringify(allProducts));
    
    setShowAddModal(false);
    showSuccess('Produit ajouté', 'Le produit a été ajouté au catalogue avec succès.');
  };

  const handleUpdateProduct = (productData: any) => {
    const updatedProducts = products.map(p => 
      p.id === selectedProduct?.id 
        ? { ...p, ...productData, updated_at: new Date().toISOString() }
        : p
    );
    setProducts(updatedProducts);
    
    // Sauvegarder dans localStorage
    const localProducts = updatedProducts.filter(p => p.source_platform === 'manual' || p.source_platform === 'csv');
    localStorage.setItem('catalog_products', JSON.stringify(localProducts));
    
    setShowAddModal(false);
    setSelectedProduct(null);
    showSuccess('Produit modifié', 'Le produit a été modifié avec succès.');
  };

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

  const calculateDiscount = (price: number, compareAtPrice?: number): number => {
    if (!compareAtPrice || compareAtPrice <= price) return 0;
    return Math.round(((compareAtPrice - price) / compareAtPrice) * 100);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-cyan-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-white text-lg">Chargement du catalogue...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header avec actions */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-white">Catalogue Produits</h2>
          <p className="text-gray-300">{filteredProducts.length} produit(s) affiché(s) sur {products.length}</p>
        </div>
        
        <div className="flex flex-wrap gap-3">
          <button
            onClick={() => setShowAddModal(true)}
            className="bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-400 hover:to-emerald-500 text-white px-4 py-2 rounded-xl flex items-center gap-2 font-semibold transition-all"
          >
            <Plus className="w-4 h-4" />
            Ajouter produit
          </button>
          
          <button
            onClick={() => setViewMode(viewMode === 'table' ? 'grid' : 'table')}
            className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-xl flex items-center gap-2 transition-all"
          >
            <BarChart3 className="w-4 h-4" />
            {viewMode === 'table' ? 'Vue grille' : 'Vue tableau'}
          </button>
          
          {selectedProducts.length > 0 && (
            <>
              <button
                onClick={handleDeleteSelected}
                className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-xl flex items-center gap-2 transition-all"
              >
                <Trash2 className="w-4 h-4" />
                Supprimer ({selectedProducts.length})
              </button>
              
              <button
                onClick={handleDeleteAll}
                className="bg-red-800 hover:bg-red-900 text-white px-4 py-2 rounded-xl flex items-center gap-2 transition-all"
              >
                <Trash2 className="w-4 h-4" />
                Supprimer tout
              </button>
            </>
          )}
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
              placeholder="Rechercher par nom, catégorie, vendeur, SKU..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-3 bg-black/40 border border-gray-600 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:border-cyan-400 focus:ring-2 focus:ring-cyan-400/30"
            />
          </div>
          
          {/* Bouton filtres */}
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-3 rounded-xl flex items-center gap-2 transition-all"
          >
            <Filter className="w-4 h-4" />
            Filtres
            {showFilters ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </button>
        </div>

        {/* Filtres étendus */}
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

      {/* Actions en lot */}
      {selectedProducts.length > 0 && (
        <div className="bg-blue-500/20 border border-blue-400/50 rounded-xl p-4">
          <div className="flex items-center justify-between">
            <span className="text-blue-300 font-semibold">
              {selectedProducts.length} produit(s) sélectionné(s)
            </span>
            <div className="flex gap-2">
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

      {/* Tableau des produits */}
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
                          {/* Clean description display */}
                          <div className="text-gray-500 text-xs mt-1 line-clamp-2">
                            {product.description ? 
                              product.description.replace(/<[^>]*>/g, '').substring(0, 100) + '...' : 
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
                              -{calculateDiscount(product.price, product.compare_at_price)}%
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
                          onClick={() => handleViewProduct(product)}
                          className="text-blue-400 hover:text-blue-300 p-1"
                          title="Voir détails"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleEditProduct(product)}
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
                      -{calculateDiscount(product.price, product.compare_at_price)}%
                    </span>
                  </>
                )}
              </div>
              
              <div className="flex items-center justify-between mb-4">
                <span className={`px-2 py-1 rounded-full text-xs ${getStatusColor(product.status)}`}>
                  {product.status}
                </span>
                <span className={`font-semibold ${product.stock > 0 ? 'text-green-400' : 'text-red-400'}`}>
                  En stock
                </span>
              </div>
              
              <div className="flex gap-2">
                <button
                  onClick={() => handleViewProduct(product)}
                  className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-2 rounded-lg flex items-center justify-center gap-1 text-sm"
                >
                  <Eye className="w-3 h-3" />
                  Voir
                </button>
                <button
                  onClick={() => handleEditProduct(product)}
                  className="flex-1 bg-yellow-600 hover:bg-yellow-700 text-white py-2 rounded-lg flex items-center justify-center gap-1 text-sm"
                >
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
          <Package className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-xl font-bold text-white mb-2">Aucun produit trouvé</h3>
          <p className="text-gray-400 mb-6">
            {searchTerm || selectedCategory !== 'all' || selectedStatus !== 'all' || selectedSource !== 'all'
              ? 'Aucun produit ne correspond à vos critères de recherche.'
              : 'Votre catalogue est vide. Commencez par ajouter des produits.'}
          </p>
          <button
            onClick={() => setShowAddModal(true)}
            className="bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-400 hover:to-emerald-500 text-white px-6 py-3 rounded-xl font-semibold transition-all"
          >
            Ajouter votre premier produit
          </button>
        </div>
      )}

      {/* Modals */}
      {showDetailModal && selectedProduct && (
        <ProductDetailModal
          product={selectedProduct}
          onClose={() => {
            setShowDetailModal(false);
            setSelectedProduct(null);
          }}
        />
      )}

      {showAddModal && (
        <AddProductModal
          product={selectedProduct}
          onSave={selectedProduct ? handleUpdateProduct : handleAddProduct}
          onClose={() => {
            setShowAddModal(false);
            setSelectedProduct(null);
          }}
        />
      )}
    </div>
  );
};