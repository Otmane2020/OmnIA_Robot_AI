import React, { useState, useEffect } from 'react';
import { 
  Search, Filter, Plus, Eye, Edit, Trash2, Save, X,
  Brain, Palette, Hammer, Home, Ruler, Tag, DollarSign,
  ChevronDown, ChevronUp, CheckCircle, AlertCircle
} from 'lucide-react';
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
  compare_at_price?: number;
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

export const ProductsEnrichedTable: React.FC = () => {
  const [products, setProducts] = useState<EnrichedProduct[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<EnrichedProduct[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedMaterial, setSelectedMaterial] = useState('all');
  const [selectedColor, setSelectedColor] = useState('all');
  const [selectedRoom, setSelectedRoom] = useState('all');
  const [showFilters, setShowFilters] = useState(false);
  const [selectedProducts, setSelectedProducts] = useState<string[]>([]);
  const [editingProduct, setEditingProduct] = useState<string | null>(null);
  const [editValues, setEditValues] = useState<Partial<EnrichedProduct>>({});
  const [isLoading, setIsLoading] = useState(true);
  const [cronStatus, setCronStatus] = useState<any>(null);
  const { showSuccess, showError, showInfo } = useNotifications();

  // Mock enriched products data
  const mockEnrichedProducts: EnrichedProduct[] = [
    {
      id: 'enriched-1',
      handle: 'canape-alyana-beige',
      title: 'Canapé ALYANA convertible - Beige',
      description: 'Canapé d\'angle convertible 4 places en velours côtelé beige avec coffre de rangement',
      category: 'Canapé',
      subcategory: 'Canapé d\'angle convertible',
      color: 'Beige',
      material: 'Velours',
      fabric: 'Velours côtelé',
      style: 'Moderne',
      dimensions: '280x180x75cm',
      room: 'Salon',
      price: 799,
      stock_qty: 100,
      image_url: 'https://cdn.shopify.com/s/files/1/0903/7578/2665/files/7_23a97631-68d2-4f3e-8f78-b26c7cd4c2ae.png?v=1754406480',
      product_url: 'https://decorahome.fr/products/canape-dangle-convertible-et-reversible-4-places-en-velours-cotele',
      tags: ['convertible', 'angle', 'velours', 'rangement', '4-places'],
      seo_title: 'Canapé d\'angle convertible ALYANA beige - Velours côtelé',
      seo_description: 'Canapé d\'angle convertible 4 places en velours côtelé beige. Couchage intégré, coffre rangement. Livraison gratuite.',
      ad_headline: 'Canapé ALYANA Convertible',
      ad_description: 'Canapé d\'angle 4 places velours côtelé. Convertible + rangement. Promo -43%',
      google_product_category: '635',
      gtin: '',
      brand: 'Decora Home',
      confidence_score: 95,
      enriched_at: '2025-01-15T10:30:00Z',
      enrichment_source: 'ai',
      created_at: '2024-12-15T10:30:00Z'
    },
    {
      id: 'enriched-2',
      handle: 'table-aurea-100',
      title: 'Table AUREA Ø100cm - Travertin',
      description: 'Table ronde en travertin naturel avec pieds métal noir',
      category: 'Table',
      subcategory: 'Table à manger ronde',
      color: 'Naturel',
      material: 'Travertin',
      fabric: '',
      style: 'Contemporain',
      dimensions: '100x100x75cm',
      room: 'Salle à manger',
      price: 499,
      stock_qty: 50,
      image_url: 'https://cdn.shopify.com/s/files/1/0903/7578/2665/files/3_e80b9a50-b032-4267-8f5b-f9130153e3be.png?v=1754406484',
      product_url: 'https://decorahome.fr/products/table-a-manger-ronde-plateau-en-travertin-naturel-100-120-cm',
      tags: ['travertin', 'ronde', 'naturel', 'élégant', 'minérale'],
      seo_title: 'Table ronde AUREA travertin naturel Ø100cm - Decora Home',
      seo_description: 'Table à manger ronde AUREA en travertin naturel Ø100cm. Pieds métal noir. Design contemporain élégant. Livraison offerte.',
      ad_headline: 'Table AUREA Travertin Ø100cm',
      ad_description: 'Table ronde travertin naturel. Design contemporain. Pieds métal noir. -42%',
      google_product_category: '443',
      gtin: '',
      brand: 'Decora Home',
      confidence_score: 92,
      enriched_at: '2025-01-15T09:15:00Z',
      enrichment_source: 'ai',
      created_at: '2024-11-20T09:15:00Z'
    },
    {
      id: 'enriched-3',
      handle: 'chaise-inaya-gris',
      title: 'Chaise INAYA - Gris chenille',
      description: 'Chaise en tissu chenille avec pieds métal noir',
      category: 'Chaise',
      subcategory: 'Chaise de salle à manger',
      color: 'Gris',
      material: 'Métal',
      fabric: 'Chenille',
      style: 'Industriel',
      dimensions: '45x50x85cm',
      room: 'Salle à manger',
      price: 99,
      stock_qty: 96,
      image_url: 'https://cdn.shopify.com/s/files/1/0903/7578/2665/files/3_3f11d1af-8ce5-4d2d-a435-cd0a78eb92ee.png?v=1755791319',
      product_url: 'https://decorahome.fr/products/chaise-en-tissu-serge-chenille-pieds-metal-noir-gris-clair-moka-et-beige',
      tags: ['chenille', 'métal', 'contemporain', 'élégant', 'gris'],
      seo_title: 'Chaise INAYA chenille gris - Pieds métal noir - Decora Home',
      seo_description: 'Chaise INAYA en tissu chenille gris avec pieds métal noir. Design contemporain élégant. Confort optimal. Livraison rapide.',
      ad_headline: 'Chaise INAYA Chenille Gris',
      ad_description: 'Chaise chenille + métal noir. Design contemporain. Confort optimal. -34%',
      google_product_category: '436',
      gtin: '',
      brand: 'Decora Home',
      confidence_score: 88,
      enriched_at: '2025-01-15T08:22:00Z',
      enrichment_source: 'ai',
      created_at: '2024-10-05T14:22:00Z'
    }
  ];

  useEffect(() => {
    loadEnrichedProducts();
    loadCronStatus();
  }, []);

  useEffect(() => {
    filterProducts();
  }, [products, searchTerm, selectedCategory, selectedMaterial, selectedColor, selectedRoom]);

  const loadEnrichedProducts = async () => {
    try {
      setIsLoading(true);
      
      // Simuler le chargement depuis la DB
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // Charger depuis localStorage si disponible
      const savedProducts = localStorage.getItem('enriched_products');
      let allProducts = [...mockEnrichedProducts];
      
      if (savedProducts) {
        try {
          const parsed = JSON.parse(savedProducts);
          allProducts = [...parsed, ...mockEnrichedProducts];
        } catch (error) {
          console.error('Erreur parsing produits enrichis:', error);
        }
      }
      
      setProducts(allProducts);
      console.log('✅ Produits enrichis chargés:', allProducts.length);
      
    } catch (error) {
      console.error('❌ Erreur chargement produits enrichis:', error);
      showError('Erreur de chargement', 'Impossible de charger les produits enrichis.');
    } finally {
      setIsLoading(false);
    }
  };

  const loadCronStatus = async () => {
    try {
      // Simuler le statut du cron d'enrichissement
      const mockCronStatus = {
        enabled: true,
        last_run: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
        next_run: new Date(Date.now() + 22 * 60 * 60 * 1000).toISOString(),
        products_enriched: 247,
        success_rate: 94
      };
      
      setCronStatus(mockCronStatus);
    } catch (error) {
      console.error('❌ Erreur chargement statut cron:', error);
    }
  };

  const filterProducts = () => {
    let filtered = products;

    if (searchTerm) {
      filtered = filtered.filter(product =>
        product.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.type.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.material.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.color.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (selectedCategory !== 'all') {
      filtered = filtered.filter(product => product.category === selectedCategory);
    }

    if (selectedMaterial !== 'all') {
      filtered = filtered.filter(product => product.material === selectedMaterial);
    }

    if (selectedColor !== 'all') {
      filtered = filtered.filter(product => product.color === selectedColor);
    }

    if (selectedRoom !== 'all') {
      filtered = filtered.filter(product => product.room === selectedRoom);
    }

    setFilteredProducts(filtered);
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
      localStorage.setItem('enriched_products', JSON.stringify(updatedProducts));
      setSelectedProducts([]);
      showSuccess('Produits supprimés', `${selectedProducts.length} produit(s) enrichi(s) supprimé(s).`);
    }
  };

  const handleEditProduct = (productId: string) => {
    const product = products.find(p => p.id === productId);
    if (product) {
      setEditingProduct(productId);
      setEditValues(product);
    }
  };

  const handleSaveEdit = () => {
    if (!editingProduct) return;

    const updatedProducts = products.map(p => 
      p.id === editingProduct ? { ...p, ...editValues } : p
    );
    
    setProducts(updatedProducts);
    localStorage.setItem('enriched_products', JSON.stringify(updatedProducts));
    setEditingProduct(null);
    setEditValues({});
    showSuccess('Produit modifié', 'Les attributs enrichis ont été mis à jour.');
  };

  const handleCancelEdit = () => {
    setEditingProduct(null);
    setEditValues({});
  };

  const handleRunEnrichmentCron = async () => {
    try {
      showInfo('Enrichissement démarré', 'Analyse IA des produits en cours...');
      
      // Récupérer les produits du catalogue principal
      const catalogProducts = localStorage.getItem('catalog_products');
      if (!catalogProducts) {
        showError('Aucun produit', 'Aucun produit trouvé dans le catalogue principal à enrichir.');
        return;
      }
      
      const products = JSON.parse(catalogProducts);
      console.log('📦 Produits à enrichir:', products.length);
      
      // Simuler l'enrichissement IA
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Enrichir automatiquement tous les produits du catalogue
      const newEnrichedProducts = products.map((product: any) => ({
        id: `enriched-${product.id || Date.now()}`,
        handle: product.handle || product.id || 'produit-enrichi',
        title: product.title || product.name || 'Produit sans nom',
        description: product.description || '',
        category: detectCategory(product.title || product.name || ''),
        subcategory: detectSubcategory(product.title || product.name || ''),
        color: detectColor(product.title + ' ' + product.description),
        material: detectMaterial(product.title + ' ' + product.description),
        fabric: detectFabric(product.title + ' ' + product.description),
        style: detectStyle(product.title + ' ' + product.description),
        dimensions: extractDimensions(product.description || ''),
        room: detectRoom(product.title + ' ' + product.description),
        price: product.price || 0,
        compare_at_price: product.compare_at_price || product.compareAtPrice,
        stock_qty: product.stock || product.quantityAvailable || 0,
        image_url: product.image_url || 'https://images.pexels.com/photos/1350789/pexels-photo-1350789.jpeg',
        product_url: product.product_url || '#',
        tags: generateTags(product),
        seo_title: generateSEOTitle(product),
        seo_description: generateSEODescription(product),
        ad_headline: generateAdHeadline(product),
        ad_description: generateAdDescription(product),
        google_product_category: getGoogleCategory(product),
        gtin: '',
        brand: product.vendor || 'Decora Home',
        confidence_score: calculateConfidenceScore(product),
        enriched_at: new Date().toISOString(),
        enrichment_source: 'cron_auto',
        created_at: product.created_at || new Date().toISOString()
      }));
      
      // Fusionner avec les produits enrichis existants (éviter doublons)
      const existingEnriched = products.filter((p: any) => !newEnrichedProducts.find(np => np.handle === p.handle));
      const allEnrichedProducts = [...existingEnriched, ...newEnrichedProducts];
      
      setProducts(allEnrichedProducts);
      localStorage.setItem('enriched_products', JSON.stringify(allEnrichedProducts));
      
      showSuccess(
        'Enrichissement terminé', 
        `${newEnrichedProducts.length} nouveau(x) produit(s) enrichi(s) ajouté(s) !`,
        [
          {
            label: 'Voir le catalogue enrichi',
            action: () => setSearchTerm(''),
            variant: 'primary'
          }
        ]
      );
      
    } catch (error) {
      console.error('❌ Erreur enrichissement:', error);
      showError('Erreur enrichissement', 'Erreur lors de l\'enrichissement automatique.');
    }

  const categories = [...new Set(products.map(p => p.category))];
  const materials = [...new Set(products.map(p => p.material).filter(Boolean))];
  const colors = [...new Set(products.map(p => p.color).filter(Boolean))];
  const rooms = [...new Set(products.map(p => p.room).filter(Boolean))];

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-cyan-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-white text-lg">Chargement catalogue enrichi...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header avec statut cron */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-white flex items-center gap-3">
            <Brain className="w-8 h-8 text-purple-400" />
            Catalogue Enrichi IA
          </h2>
          <p className="text-gray-300">{filteredProducts.length} produit(s) enrichi(s) sur {products.length}</p>
        </div>
        
        <div className="flex flex-wrap gap-3">
          <button
            onClick={handleRunEnrichmentCron}
            className="bg-gradient-to-r from-purple-500 to-pink-600 hover:from-purple-400 hover:to-pink-500 text-white px-4 py-2 rounded-xl flex items-center gap-2 font-semibold transition-all"
          >
            <Brain className="w-4 h-4" />
            Enrichir avec IA
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

      {/* Statut du cron d'enrichissement */}
      {cronStatus && (
        <div className="bg-purple-500/20 border border-purple-400/50 rounded-xl p-4">
          <h3 className="font-semibold text-purple-200 mb-3 flex items-center gap-2">
            <Brain className="w-5 h-5" />
            Cron d'enrichissement automatique
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-sm">
            <div className="text-center">
              <div className="text-2xl font-bold text-green-400">
                {cronStatus.enabled ? 'ACTIF' : 'INACTIF'}
              </div>
              <div className="text-green-300">Statut</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-400">{cronStatus.products_enriched}</div>
              <div className="text-purple-300">Produits enrichis</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-400">{cronStatus.success_rate}%</div>
              <div className="text-blue-300">Taux de succès</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-orange-400">
                {new Date(cronStatus.next_run).toLocaleDateString('fr-FR')}
              </div>
              <div className="text-orange-300">Prochaine exécution</div>
            </div>
          </div>
        </div>
      )}

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
          
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-3 rounded-xl flex items-center gap-2 transition-all"
          >
            <Filter className="w-4 h-4" />
            Filtres enrichis
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
                <label className="block text-sm text-gray-300 mb-2">Pièce</label>
                <select
                  value={selectedRoom}
                  onChange={(e) => setSelectedRoom(e.target.value)}
                  className="w-full bg-black/40 border border-gray-600 rounded-xl px-3 py-2 text-white"
                >
                  <option value="all">Toutes les pièces</option>
                  {rooms.map(room => (
                    <option key={room} value={room}>{room}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Actions en lot */}
      {selectedProducts.length > 0 && (
        <div className="bg-purple-500/20 border border-purple-400/50 rounded-xl p-4">
          <div className="flex items-center justify-between">
            <span className="text-purple-300 font-semibold">
              {selectedProducts.length} produit(s) enrichi(s) sélectionné(s)
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

      {/* Tableau des produits enrichis */}
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
                <th className="text-left p-4 text-cyan-300 font-semibold">Catégorie</th>
                <th className="text-left p-4 text-cyan-300 font-semibold">Sous-catégorie</th>
                <th className="text-left p-4 text-cyan-300 font-semibold">Couleur</th>
                <th className="text-left p-4 text-cyan-300 font-semibold">Matériau</th>
                <th className="text-left p-4 text-cyan-300 font-semibold">Tissu</th>
                <th className="text-left p-4 text-cyan-300 font-semibold">Style</th>
                <th className="text-left p-4 text-cyan-300 font-semibold">Dimensions</th>
                <th className="text-left p-4 text-cyan-300 font-semibold">Pièce</th>
                <th className="text-left p-4 text-cyan-300 font-semibold">Tags</th>
                <th className="text-left p-4 text-cyan-300 font-semibold">SEO</th>
                <th className="text-left p-4 text-cyan-300 font-semibold">Score IA</th>
                <th className="text-left p-4 text-cyan-300 font-semibold">Prix</th>
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
                        <div className="text-gray-400 text-xs">{product.handle}</div>
                      </div>
                    </div>
                  </td>
                  <td className="p-4">
                    {editingProduct === product.id ? (
                      <input
                        type="text"
                        value={editValues.category || ''}
                        onChange={(e) => setEditValues(prev => ({ ...prev, category: e.target.value }))}
                        className="w-full bg-black/40 border border-gray-600 rounded px-2 py-1 text-white text-sm"
                      />
                    ) : (
                      <span className="text-white">{product.category}</span>
                    )}
                  </td>
                  <td className="p-4">
                    {editingProduct === product.id ? (
                      <input
                        type="text"
                        value={editValues.subcategory || ''}
                        onChange={(e) => setEditValues(prev => ({ ...prev, subcategory: e.target.value }))}
                        className="w-full bg-black/40 border border-gray-600 rounded px-2 py-1 text-white text-sm"
                      />
                    ) : (
                      <span className="text-white">{product.subcategory}</span>
                    )}
                  </td>
                  <td className="p-4">
                    {editingProduct === product.id ? (
                      <input
                        type="text"
                        value={editValues.color || ''}
                        onChange={(e) => setEditValues(prev => ({ ...prev, color: e.target.value }))}
                        className="w-full bg-black/40 border border-gray-600 rounded px-2 py-1 text-white text-sm"
                      />
                    ) : (
                      <span className="text-white">{product.color}</span>
                    )}
                  </td>
                  <td className="p-4">
                    {editingProduct === product.id ? (
                      <input
                        type="text"
                        value={editValues.material || ''}
                        onChange={(e) => setEditValues(prev => ({ ...prev, material: e.target.value }))}
                        className="w-full bg-black/40 border border-gray-600 rounded px-2 py-1 text-white text-sm"
                      />
                    ) : (
                      <span className="text-white">{product.material}</span>
                    )}
                  </td>
                  <td className="p-4">
                    {editingProduct === product.id ? (
                      <input
                        type="text"
                        value={editValues.fabric || ''}
                        onChange={(e) => setEditValues(prev => ({ ...prev, fabric: e.target.value }))}
                        className="w-full bg-black/40 border border-gray-600 rounded px-2 py-1 text-white text-sm"
                      />
                    ) : (
                      <span className="text-white">{product.fabric}</span>
                    )}
                  </td>
                  <td className="p-4">
                    {editingProduct === product.id ? (
                      <input
                        type="text"
                        value={editValues.style || ''}
                        onChange={(e) => setEditValues(prev => ({ ...prev, style: e.target.value }))}
                        className="w-full bg-black/40 border border-gray-600 rounded px-2 py-1 text-white text-sm"
                      />
                    ) : (
                      <span className="text-white">{product.style}</span>
                    )}
                  </td>
                  <td className="p-4">
                    {editingProduct === product.id ? (
                      <input
                        type="text"
                        value={editValues.dimensions || ''}
                        onChange={(e) => setEditValues(prev => ({ ...prev, dimensions: e.target.value }))}
                        className="w-full bg-black/40 border border-gray-600 rounded px-2 py-1 text-white text-sm"
                      />
                    ) : (
                      <span className="text-white">{product.dimensions}</span>
                    )}
                  </td>
                  <td className="p-4">
                    {editingProduct === product.id ? (
                      <input
                        type="text"
                        value={editValues.room || ''}
                        onChange={(e) => setEditValues(prev => ({ ...prev, room: e.target.value }))}
                        className="w-full bg-black/40 border border-gray-600 rounded px-2 py-1 text-white text-sm"
                      />
                    ) : (
                      <span className="text-white">{product.room}</span>
                    )}
                  </td>
                  <td className="p-4">
                    <div className="flex flex-wrap gap-1 max-w-32">
                      {(product.tags || []).slice(0, 3).map((tag, index) => (
                        <span key={index} className="bg-blue-500/20 text-blue-300 px-2 py-1 rounded text-xs">
                          {tag}
                        </span>
                      ))}
                      {(product.tags || []).length > 3 && (
                        <span className="text-gray-400 text-xs">+{(product.tags || []).length - 3}</span>
                      )}
                    </div>
                  </td>
                  <td className="p-4">
                    <div className="text-center">
                      <div className="text-sm text-white font-semibold">{product.seo_title?.substring(0, 20) || 'Non défini'}...</div>
                      <div className="text-xs text-gray-400">{product.seo_description?.substring(0, 30) || 'Aucune description'}...</div>
                    </div>
                  </td>
                  <td className="p-4">
                    <div className="text-center">
                      <div className={`text-lg font-bold ${
                        (product.confidence_score || 0) >= 80 ? 'text-green-400' :
                        (product.confidence_score || 0) >= 60 ? 'text-yellow-400' :
                        'text-red-400'
                      }`}>
                        {product.confidence_score || 0}%
                      </div>
                      <div className="text-xs text-gray-400">Confiance IA</div>
                    </div>
                  </td>
                  <td className="p-4">
                    <span className="font-bold text-green-400">{product.price}€</span>
                  </td>
                  <td className="p-4">
                    <div className="flex gap-2">
                      {editingProduct === product.id ? (
                        <>
                          <button
                            onClick={handleSaveEdit}
                            className="text-green-400 hover:text-green-300 p-1"
                            title="Sauvegarder"
                          >
                            <Save className="w-4 h-4" />
                          </button>
                          <button
                            onClick={handleCancelEdit}
                            className="text-red-400 hover:text-red-300 p-1"
                            title="Annuler"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </>
                      ) : (
                        <button
                          onClick={() => handleEditProduct(product.id)}
                          className="text-yellow-400 hover:text-yellow-300 p-1"
                          title="Modifier"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                      )}
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
            {searchTerm || selectedCategory !== 'all' || selectedMaterial !== 'all' || selectedColor !== 'all'
              ? 'Aucun produit ne correspond à vos critères de recherche.'
              : 'Votre catalogue enrichi est vide. Lancez l\'enrichissement IA.'}
          </p>
          <button
            onClick={handleRunEnrichmentCron}
            className="bg-gradient-to-r from-purple-500 to-pink-600 hover:from-purple-400 hover:to-pink-500 text-white px-6 py-3 rounded-xl font-semibold transition-all"
          >
            Enrichir le catalogue avec IA
          </button>
        </div>
      )}
    </div>
  );
};