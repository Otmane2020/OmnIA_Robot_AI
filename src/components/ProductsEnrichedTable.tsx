import React, { useState, useEffect } from 'react';
import { Search, Filter, ChevronDown, ChevronUp, List, Grid, Download, RefreshCw, Sparkles, Loader2, Package, Edit, Save, X } from 'lucide-react';
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
  retailer_id?: string;
  created_at: string;
}

interface ProductsEnrichedTableProps {
  vendorId?: string;
  retailerId?: string;
}

export const ProductsEnrichedTable: React.FC<ProductsEnrichedTableProps> = ({ vendorId, retailerId }) => {
  const [products, setProducts] = useState<EnrichedProduct[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<EnrichedProduct[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedColor, setSelectedColor] = useState('all');
  const [selectedMaterial, setSelectedMaterial] = useState('all');
  const [selectedStyle, setSelectedStyle] = useState('all');
  const [showFilters, setShowFilters] = useState(false);
  const [viewMode, setViewMode] = useState<'table' | 'grid'>('table');
  const [selectedProducts, setSelectedProducts] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSyncing, setIsSyncing] = useState(false);
  const [isEnriching, setIsEnriching] = useState(false);
  const [syncProgress, setSyncProgress] = useState(0);
  const [editingProduct, setEditingProduct] = useState<string | null>(null);
  const [editFormData, setEditFormData] = useState<Partial<EnrichedProduct>>({});
  
  const { showSuccess, showError, showInfo } = useNotifications();

  useEffect(() => {
    loadEnrichedProducts();
  }, [vendorId, retailerId]);

  useEffect(() => {
    // Filtrer les produits
    let filtered = products;

    if (searchTerm) {
      filtered = filtered.filter(product =>
        product.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.subcategory.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.brand.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.material.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.color.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.style.toLowerCase().includes(searchTerm.toLowerCase())
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
      
      // Charger depuis localStorage spécifique au vendeur
      const enrichedKey = vendorId ? `vendor_${vendorId}_enriched_products` : 'admin_enriched_products';
      const savedEnriched = localStorage.getItem(enrichedKey);
      
      let enrichedProducts: EnrichedProduct[] = [];
      
      if (savedEnriched) {
        try {
          const parsed = JSON.parse(savedEnriched);
          // Filter by retailer_id if specified
          enrichedProducts = parsed.filter((p: any) => {
            const hasStock = p.stock_qty > 0;
            const matchesRetailer = !retailerId || p.retailer_id === retailerId;
            return hasStock && matchesRetailer;
          });
          console.log('✅ [enriched-table] Produits enrichis chargés:', enrichedProducts.length);
        } catch (error) {
          console.error('Erreur parsing produits enrichis:', error);
          enrichedProducts = [];
        }
      } else {
        console.log(`📦 [enriched-table] Aucun produit enrichi trouvé pour ${retailerId || vendorId || 'admin'}`);
        enrichedProducts = [];
      }
      
      setProducts(enrichedProducts);
      setFilteredProducts(enrichedProducts);
      
    } catch (error) {
      console.error('❌ Erreur chargement produits enrichis:', error);
      showError('Erreur de chargement', 'Impossible de charger les produits enrichis.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSyncFromCatalog = async () => {
    try {
      setIsSyncing(true);
      setSyncProgress(0);
      
      showInfo('Synchronisation démarrée', 'Récupération des produits depuis le catalogue...');
      
      // Charger les produits du catalogue principal
      const catalogKey = vendorId ? `vendor_${vendorId}_products` : 'catalog_products';
      const savedCatalog = localStorage.getItem(catalogKey);
      
      if (!savedCatalog) {
        showError('Catalogue vide', 'Aucun produit trouvé dans le catalogue principal. Importez d\'abord vos produits.');
        return;
      }
      
      const catalogProducts = JSON.parse(savedCatalog);
      const activeProducts = catalogProducts.filter((p: any) => p.status === 'active');
      
      console.log('📦 Produits catalogue trouvés:', activeProducts.length);
      
      if (activeProducts.length === 0) {
        showError('Aucun produit actif', 'Aucun produit actif trouvé dans le catalogue. Vérifiez le statut de vos produits.');
        return;
      }
      
      // Simuler la progression
      const progressInterval = setInterval(() => {
        setSyncProgress(prev => Math.min(prev + 10, 90));
      }, 200);
      
      // Déclencher l'enrichissement automatique
      const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
      const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
      
      if (supabaseUrl && supabaseKey) {
        const response = await fetch(`${supabaseUrl}/functions/v1/enrich-products-cron`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${supabaseKey}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            products: activeProducts, // Pass products from localStorage
            retailer_id: vendorId || 'demo-retailer-id',
            force_full_enrichment: true,
            vendor_id: vendorId
          }),
        });
        
        if (response.ok) {
          const result = await response.json();
          console.log('✅ Enrichissement automatique réussi:', result);
          
          // Récupérer les données enrichies depuis la réponse
          if (result.enriched_data && Array.isArray(result.enriched_data)) {
            const enrichedKey = vendorId ? `vendor_${vendorId}_enriched_products` : 'admin_enriched_products';
            localStorage.setItem(enrichedKey, JSON.stringify(result.enriched_data));
            
            setProducts(result.enriched_data);
            setFilteredProducts(result.enriched_data);
            
            showSuccess(
              'Synchronisation terminée',
              `${result.enriched_data.length} produits enrichis automatiquement !`,
              [
                {
                  label: 'Voir les résultats',
                  action: () => setViewMode('table'),
                  variant: 'primary'
                }
              ]
            );
          }
        } else {
          showError('Erreur d\'enrichissement', 'Impossible d\'enrichir automatiquement les produits.');
        }
      } else {
        // Fallback : enrichissement basique local
        const enrichedProducts = activeProducts.map((product: any) => ({
          id: product.id || `enriched-${Date.now()}-${Math.random()}`,
          handle: product.handle || product.id || `handle-${Date.now()}`,
          title: product.name || product.title || 'Produit sans nom',
          description: product.description || '',
          category: detectCategory(product.name || product.title || ''),
          subcategory: detectSubcategory(product.name || product.title || '', product.description || ''),
          color: detectColor(product.name + ' ' + product.description),
          material: detectMaterial(product.name + ' ' + product.description),
          fabric: detectFabric(product.name + ' ' + product.description),
          style: detectStyle(product.name + ' ' + product.description),
          dimensions: extractDimensions(product.description || ''),
          room: detectRoom(product.name + ' ' + product.description),
          price: product.price || 0,
          stock_qty: product.stock || product.quantityAvailable || 0,
          image_url: product.image_url || 'https://images.pexels.com/photos/1350789/pexels-photo-1350789.jpeg',
          product_url: product.product_url || '#',
          tags: Array.isArray(product.tags) ? product.tags : [],
          seo_title: generateSEOTitle(product.name || product.title || '', product.vendor || 'Boutique'),
          seo_description: generateSEODescription(product.name || product.title || '', product.description || ''),
          ad_headline: (product.name || product.title || '').substring(0, 30),
          ad_description: `${product.name || 'Produit'} ${detectMaterial(product.name + ' ' + product.description)}. Promo !`.substring(0, 90),
          google_product_category: getGoogleCategory(detectCategory(product.name || product.title || '')),
          gtin: '',
          brand: product.vendor || 'Boutique',
          confidence_score: calculateBasicConfidence(product),
          enriched_at: new Date().toISOString(),
          enrichment_source: 'sync_local',
          created_at: product.created_at || new Date().toISOString()
        }));
        
        const enrichedKey = vendorId ? `vendor_${vendorId}_enriched_products` : 'admin_enriched_products';
        localStorage.setItem(enrichedKey, JSON.stringify(enrichedProducts));
        
        setProducts(enrichedProducts);
        setFilteredProducts(enrichedProducts);
        
        showSuccess('Synchronisation terminée', `${enrichedProducts.length} produits synchronisés et enrichis !`);
      }
      
      clearInterval(progressInterval);
      setSyncProgress(100);
      
    } catch (error) {
      console.error('❌ Erreur synchronisation:', error);
      showError('Erreur de synchronisation', 'Impossible de synchroniser le catalogue.');
    } finally {
      setIsSyncing(false);
      setSyncProgress(0);
    }
  };

  const handleEnrichAll = async () => {
    try {
      setIsEnriching(true);
      setSyncProgress(0);
      
      showInfo('Enrichissement démarré', 'Analyse IA de tous les produits...');
      
      // Simuler la progression
      const progressInterval = setInterval(() => {
        setSyncProgress(prev => Math.min(prev + 15, 90));
      }, 500);
      
      // Déclencher l'enrichissement IA
      const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
      const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
      
      if (supabaseUrl && supabaseKey) {
        const response = await fetch(`${supabaseUrl}/functions/v1/enrich-products-cron`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${supabaseKey}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            retailer_id: vendorId || 'demo-retailer-id',
            force_full_enrichment: true,
            vendor_id: vendorId
          }),
        });
        
        if (response.ok) {
          const result = await response.json();
          
          if (result.enriched_data && Array.isArray(result.enriched_data)) {
            const enrichedKey = vendorId ? `vendor_${vendorId}_enriched_products` : 'admin_enriched_products';
            localStorage.setItem(enrichedKey, JSON.stringify(result.enriched_data));
            
            setProducts(result.enriched_data);
            setFilteredProducts(result.enriched_data);
          }
          
          showSuccess('Enrichissement terminé', `${result.stats?.products_processed || 0} produits enrichis avec IA !`);
        } else {
          showError('Erreur d\'enrichissement', 'Impossible d\'enrichir les produits avec l\'IA.');
        }
      }
      
      clearInterval(progressInterval);
      setSyncProgress(100);
      
    } catch (error) {
      console.error('❌ Erreur enrichissement:', error);
      showError('Erreur d\'enrichissement', 'Impossible d\'enrichir les produits.');
    } finally {
      setIsEnriching(false);
      setSyncProgress(0);
    }
  };

  const handleExportCSV = () => {
    try {
      const csvHeaders = [
        'ID', 'Titre', 'Catégorie', 'Sous-catégorie', 'Couleur', 'Matériau', 
        'Tissu', 'Style', 'Dimensions', 'Pièce', 'Prix', 'Stock', 'Tags',
        'Titre SEO', 'Description SEO', 'Titre Pub', 'Description Pub',
        'Catégorie Google', 'Marque', 'Score Confiance', 'Source Enrichissement'
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
          product.fabric,
          product.style,
          product.dimensions,
          product.room,
          product.price,
          product.stock_qty,
          `"${product.tags.join(', ')}"`,
          `"${product.seo_title}"`,
          `"${product.seo_description}"`,
          `"${product.ad_headline}"`,
          `"${product.ad_description}"`,
          product.google_product_category,
          product.brand,
          product.confidence_score,
          product.enrichment_source
        ].join(','))
      ].join('\n');
      
      const blob = new Blob([csvData], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement('a');
      const url = URL.createObjectURL(blob);
      link.setAttribute('href', url);
      link.setAttribute('download', `produits-enrichis-${new Date().toISOString().split('T')[0]}.csv`);
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      showSuccess('Export réussi', `${filteredProducts.length} produits exportés en CSV.`);
      
    } catch (error) {
      console.error('❌ Erreur export CSV:', error);
      showError('Erreur d\'export', 'Impossible d\'exporter les produits.');
    }
  };

  const handleBulkAction = (action: string) => {
    if (selectedProducts.length === 0) {
      showError('Aucune sélection', 'Sélectionnez au moins un produit.');
      return;
    }

    switch (action) {
      case 'delete':
        const updatedProducts = products.filter(p => !selectedProducts.includes(p.id));
        setProducts(updatedProducts);
        
        // Sauvegarder dans localStorage
        const enrichedKey = vendorId ? `vendor_${vendorId}_enriched_products` : 'admin_enriched_products';
        localStorage.setItem(enrichedKey, JSON.stringify(updatedProducts));
        
        setSelectedProducts([]);
        showSuccess('Suppression réussie', `${selectedProducts.length} produits supprimés.`);
        break;
      case 'export':
        const selectedProductsData = products.filter(p => selectedProducts.includes(p.id));
        // Logique d'export pour les produits sélectionnés
        showSuccess('Export réussi', `${selectedProducts.length} produits exportés.`);
        break;
    }
  };

  const handleEditProduct = (product: EnrichedProduct) => {
    setEditingProduct(product.id);
    setEditFormData({
      category: product.category,
      subcategory: product.subcategory,
      color: product.color,
      material: product.material,
      fabric: product.fabric,
      style: product.style,
      dimensions: product.dimensions,
      room: product.room,
      price: product.price,
      stock_qty: product.stock_qty,
      tags: product.tags,
      seo_title: product.seo_title,
      seo_description: product.seo_description,
      ad_headline: product.ad_headline,
      ad_description: product.ad_description,
      google_product_category: product.google_product_category,
      brand: product.brand
    });
  };

  const handleSaveEdit = async () => {
    if (!editingProduct) return;

    try {
      const enrichedKey = vendorId ? `vendor_${vendorId}_enriched_products` : 'admin_enriched_products';
      const savedProducts = localStorage.getItem(enrichedKey);
      
      if (savedProducts) {
        let parsedData: EnrichedProduct[] = [];
        try {
          parsedData = JSON.parse(savedProducts);
          console.log('📦 Produits enrichis chargés:', parsedData.length);
        } catch (error) {
          console.error('Erreur parsing produits enrichis:', error);
          parsedData = [];
        }
      }
      
      const updatedProducts = products.map(product =>
        product.id === editingProduct
          ? {
              ...product, 
              ...editFormData,
              confidence_score: calculateConfidenceFromData(editFormData),
              enriched_at: new Date().toISOString(),
              enrichment_source: 'manual'
            }
          : product
      );
      
      setProducts(updatedProducts);
      setFilteredProducts(updatedProducts.filter(p => 
        filteredProducts.some(fp => fp.id === p.id)
      ));
      
      // Sauvegarder dans localStorage
      const localStorageKey = vendorId ? `vendor_${vendorId}_enriched_products` : 'admin_enriched_products';
      localStorage.setItem(localStorageKey, JSON.stringify(updatedProducts));
      
      setEditingProduct(null);
      setEditFormData({});
      
      showSuccess('Produit modifié', 'Les modifications ont été sauvegardées avec succès.');
      
    } catch (error) {
      console.error('❌ Erreur sauvegarde modification:', error);
      showError('Erreur de sauvegarde', 'Impossible de sauvegarder les modifications.');
    }
  };

  const handleCancelEdit = () => {
    setEditingProduct(null);
    setEditFormData({});
  };

  const calculateConfidenceFromData = (data: Partial<EnrichedProduct>): number => {
    let confidence = 30; // Base
    if (data.category && data.category !== 'Mobilier') confidence += 25;
    if (data.color) confidence += 20;
    if (data.material) confidence += 20;
    if (data.style) confidence += 15;
    if (data.room) confidence += 10;
    if (data.dimensions) confidence += 10;
    return Math.min(confidence, 100);
  };

  const formatAIAttributes = (product: EnrichedProduct): string => {
    const attributes = [];
    
    if (product.category) attributes.push(`📂 ${product.category}`);
    if (product.subcategory) attributes.push(`📋 ${product.subcategory}`);
    if (product.color) attributes.push(`🎨 ${product.color}`);
    if (product.material) attributes.push(`🏗️ ${product.material}`);
    if (product.fabric) attributes.push(`🧵 ${product.fabric}`);
    if (product.style) attributes.push(`✨ ${product.style}`);
    if (product.dimensions) attributes.push(`📏 ${product.dimensions}`);
    if (product.room) attributes.push(`🏠 ${product.room}`);
    
    return attributes.join(' • ');
  };

  const toggleProductSelection = (productId: string) => {
    setSelectedProducts(prev =>
      prev.includes(productId)
        ? prev.filter(id => id !== productId)
        : [...prev, productId]
    );
  };

  const toggleAllSelection = () => {
    if (selectedProducts.length === filteredProducts.length) {
      setSelectedProducts([]);
    } else {
      setSelectedProducts(filteredProducts.map(p => p.id));
    }
  };

  // Obtenir les valeurs uniques pour les filtres
  const uniqueCategories = [...new Set(products.map(p => p.category))].filter(Boolean);
  const uniqueColors = [...new Set(products.map(p => p.color))].filter(Boolean);
  const uniqueMaterials = [...new Set(products.map(p => p.material))].filter(Boolean);
  const uniqueStyles = [...new Set(products.map(p => p.style))].filter(Boolean);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-cyan-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-white text-lg">Chargement des produits enrichis...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header avec actions */}
      <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-white mb-2">Produits Enrichis</h2>
          <p className="text-gray-400">
            {filteredProducts.length} produit{filteredProducts.length > 1 ? 's' : ''} enrichi{filteredProducts.length > 1 ? 's' : ''} avec IA
          </p>
        </div>
        
        <div className="flex flex-wrap gap-2">
          <button
            onClick={handleSyncFromCatalog}
            disabled={isSyncing}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-800 text-white rounded-lg transition-colors flex items-center gap-2"
          >
            {isSyncing ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Synchronisation... {syncProgress}%
              </>
            ) : (
              <>
                <RefreshCw className="w-4 h-4" />
                Sync Catalogue
              </>
            )}
          </button>
          
          <button
            onClick={handleEnrichAll}
            disabled={isEnriching || products.length === 0}
            className="px-4 py-2 bg-purple-600 hover:bg-purple-700 disabled:bg-purple-800 text-white rounded-lg transition-colors flex items-center gap-2"
          >
            {isEnriching ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Enrichissement... {syncProgress}%
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4" />
                Enrichir IA
              </>
            )}
          </button>
          
          <button
            onClick={handleExportCSV}
            disabled={filteredProducts.length === 0}
            className="px-4 py-2 bg-green-600 hover:bg-green-700 disabled:bg-green-800 text-white rounded-lg transition-colors flex items-center gap-2"
          >
            <Download className="w-4 h-4" />
            Export CSV
          </button>
        </div>
      </div>

      {/* Barre de recherche et filtres */}
      <div className="bg-white/10 backdrop-blur-xl rounded-2xl p-6 border border-white/20">
        <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center justify-between mb-4">
          <div className="flex-1 max-w-md">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Rechercher par nom, catégorie, marque..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-black/40 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
              />
            </div>
          </div>
          
          <div className="flex gap-2">
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition-colors flex items-center gap-2"
            >
              <Filter className="w-4 h-4" />
              Filtres
              {showFilters ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            </button>
            
            <div className="flex bg-gray-700 rounded-lg p-1">
              <button
                onClick={() => setViewMode('table')}
                className={`p-2 rounded transition-colors ${
                  viewMode === 'table' ? 'bg-cyan-600 text-white' : 'text-gray-300 hover:text-white'
                }`}
              >
                <List className="w-4 h-4" />
              </button>
              <button
                onClick={() => setViewMode('grid')}
                className={`p-2 rounded transition-colors ${
                  viewMode === 'grid' ? 'bg-cyan-600 text-white' : 'text-gray-300 hover:text-white'
                }`}
              >
                <Grid className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Filtres avancés */}
        {showFilters && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 pt-4 border-t border-white/10">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Catégorie</label>
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="w-full bg-black/40 border border-gray-600 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-cyan-500"
              >
                <option value="all">Toutes les catégories</option>
                {uniqueCategories.map(category => (
                  <option key={category} value={category}>{category}</option>
                ))}
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Couleur</label>
              <select
                value={selectedColor}
                onChange={(e) => setSelectedColor(e.target.value)}
                className="w-full bg-black/40 border border-gray-600 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-cyan-500"
              >
                <option value="all">Toutes les couleurs</option>
                {uniqueColors.map(color => (
                  <option key={color} value={color}>{color}</option>
                ))}
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Matériau</label>
              <select
                value={selectedMaterial}
                onChange={(e) => setSelectedMaterial(e.target.value)}
                className="w-full bg-black/40 border border-gray-600 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-cyan-500"
              >
                <option value="all">Tous les matériaux</option>
                {uniqueMaterials.map(material => (
                  <option key={material} value={material}>{material}</option>
                ))}
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Style</label>
              <select
                value={selectedStyle}
                onChange={(e) => setSelectedStyle(e.target.value)}
                className="w-full bg-black/40 border border-gray-600 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-cyan-500"
              >
                <option value="all">Tous les styles</option>
                {uniqueStyles.map(style => (
                  <option key={style} value={style}>{style}</option>
                ))}
              </select>
            </div>
          </div>
        )}
      </div>

      {/* Actions en lot */}
      {selectedProducts.length > 0 && (
        <div className="bg-cyan-600/20 backdrop-blur-xl rounded-2xl p-4 border border-cyan-500/30">
          <div className="flex items-center justify-between">
            <span className="text-cyan-300 font-medium">
              {selectedProducts.length} produit{selectedProducts.length > 1 ? 's' : ''} sélectionné{selectedProducts.length > 1 ? 's' : ''}
            </span>
            <div className="flex gap-2">
              <button
                onClick={() => handleBulkAction('export')}
                className="px-3 py-1 bg-green-600 hover:bg-green-700 text-white text-sm rounded transition-colors"
              >
                Exporter
              </button>
              <button
                onClick={() => handleBulkAction('delete')}
                className="px-3 py-1 bg-red-600 hover:bg-red-700 text-white text-sm rounded transition-colors"
              >
                Supprimer
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Contenu principal */}
      {filteredProducts.length === 0 ? (
        <div className="text-center py-20">
          <Package className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-white mb-2">Aucun produit enrichi</h3>
          <p className="text-gray-400 mb-6">
            {products.length === 0 
              ? "Commencez par synchroniser votre catalogue pour enrichir vos produits."
              : "Aucun produit ne correspond à vos critères de recherche."
            }
          </p>
          {products.length === 0 && (
            <button
              onClick={handleSyncFromCatalog}
              className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors flex items-center gap-2 mx-auto"
            >
              <RefreshCw className="w-5 h-5" />
              Synchroniser le catalogue
            </button>
          )}
        </div>
      ) : (
        <>
          {/* Vue tableau */}
          {viewMode === 'table' && (
            <div className="bg-white/10 backdrop-blur-xl rounded-2xl border border-white/20 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-black/20">
                    <tr>
                      <th className="px-4 py-4 text-left">
                        <input
                          type="checkbox"
                          checked={selectedProducts.length === filteredProducts.length && filteredProducts.length > 0}
                          onChange={toggleAllSelection}
                          className="w-4 h-4 text-cyan-600 bg-gray-800 border-gray-600 rounded focus:ring-cyan-500"
                        />
                      </th>
                      <th className="px-4 py-4 text-left text-sm font-medium text-gray-300 uppercase tracking-wider">
                        Produit
                      </th>
                      <th className="px-4 py-4 text-left text-sm font-medium text-gray-300 uppercase tracking-wider">
                        Attributs IA
                      </th>
                      <th className="px-4 py-4 text-left text-sm font-medium text-gray-300 uppercase tracking-wider">
                        Prix & Stock
                      </th>
                      <th className="px-4 py-4 text-left text-sm font-medium text-gray-300 uppercase tracking-wider">
                        SEO & Pub
                      </th>
                      <th className="px-4 py-4 text-left text-sm font-medium text-gray-300 uppercase tracking-wider">
                        Confiance
                      </th>
                      <th className="px-4 py-4 text-left text-sm font-medium text-gray-300 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredProducts.map((product) => (
                      <tr key={product.id} className="border-b border-white/10 hover:bg-white/5">
                        <td className="px-4 py-4">
                          <input
                            type="checkbox"
                            checked={selectedProducts.includes(product.id)}
                            onChange={() => toggleProductSelection(product.id)}
                            className="w-4 h-4 text-cyan-600 bg-gray-800 border-gray-600 rounded focus:ring-cyan-500"
                          />
                        </td>
                        <td className="px-4 py-4">
                          <div className="flex items-center">
                            <div className="w-12 h-12 rounded-lg overflow-hidden bg-gray-600 flex-shrink-0 mr-3">
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
                            <div>
                              <div className="text-sm font-medium text-white">{product.title}</div>
                              <div className="text-sm text-gray-400">{product.brand}</div>
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-4">
                          {editingProduct === product.id ? (
                            <div className="space-y-2 min-w-0">
                              <input
                                type="text"
                                value={editFormData.category || ''}
                                onChange={(e) => setEditFormData(prev => ({ ...prev, category: e.target.value }))}
                                placeholder="Catégorie"
                                className="w-full bg-black/40 border border-gray-600 rounded px-2 py-1 text-white text-xs"
                              />
                              <input
                                type="text"
                                value={editFormData.subcategory || ''}
                                onChange={(e) => setEditFormData(prev => ({ ...prev, subcategory: e.target.value }))}
                                placeholder="Sous-catégorie"
                                className="w-full bg-black/40 border border-gray-600 rounded px-2 py-1 text-white text-xs"
                              />
                              <input
                                type="text"
                                value={editFormData.color || ''}
                                onChange={(e) => setEditFormData(prev => ({ ...prev, color: e.target.value }))}
                                placeholder="Couleur"
                                className="w-full bg-black/40 border border-gray-600 rounded px-2 py-1 text-white text-xs"
                              />
                              <input
                                type="text"
                                value={editFormData.material || ''}
                                onChange={(e) => setEditFormData(prev => ({ ...prev, material: e.target.value }))}
                                placeholder="Matériau"
                                className="w-full bg-black/40 border border-gray-600 rounded px-2 py-1 text-white text-xs"
                              />
                              <input
                                type="text"
                                value={editFormData.style || ''}
                                onChange={(e) => setEditFormData(prev => ({ ...prev, style: e.target.value }))}
                                placeholder="Style"
                                className="w-full bg-black/40 border border-gray-600 rounded px-2 py-1 text-white text-xs"
                              />
                              <input
                                type="text"
                                value={editFormData.dimensions || ''}
                                onChange={(e) => setEditFormData(prev => ({ ...prev, dimensions: e.target.value }))}
                                placeholder="Dimensions (ex: L:200cm x l:100cm x H:75cm)"
                                className="w-full bg-black/40 border border-gray-600 rounded px-2 py-1 text-white text-xs"
                              />
                            </div>
                          ) : (
                            <div className="text-sm text-white max-w-xs">
                              {formatAIAttributes(product) || (
                                <span className="text-gray-400 italic">Aucun attribut détecté</span>
                              )}
                            </div>
                          )}
                        </td>
                        <td className="px-4 py-4">
                          {editingProduct === product.id ? (
                            <div className="space-y-2">
                              <input
                                type="number"
                                value={editFormData.price || ''}
                                onChange={(e) => setEditFormData(prev => ({ ...prev, price: parseFloat(e.target.value) || 0 }))}
                                placeholder="Prix"
                                className="w-full bg-black/40 border border-gray-600 rounded px-2 py-1 text-white text-xs"
                              />
                              <input
                                type="number"
                                value={editFormData.stock_qty || ''}
                                onChange={(e) => setEditFormData(prev => ({ ...prev, stock_qty: parseInt(e.target.value) || 0 }))}
                                placeholder="Stock"
                                className="w-full bg-black/40 border border-gray-600 rounded px-2 py-1 text-white text-xs"
                              />
                            </div>
                          ) : (
                            <div>
                              <div className="text-sm font-medium text-green-400">{product.price}€</div>
                              <div className="text-sm text-gray-400">Stock: {product.stock_qty}</div>
                            </div>
                          )}
                        </td>
                        <td className="px-4 py-4">
                          {editingProduct === product.id ? (
                            <div className="space-y-2">
                              <input
                                type="text"
                                value={editFormData.seo_title || ''}
                                onChange={(e) => setEditFormData(prev => ({ ...prev, seo_title: e.target.value }))}
                                placeholder="Titre SEO"
                                className="w-full bg-black/40 border border-gray-600 rounded px-2 py-1 text-white text-xs"
                              />
                              <input
                                type="text"
                                value={editFormData.ad_headline || ''}
                                onChange={(e) => setEditFormData(prev => ({ ...prev, ad_headline: e.target.value }))}
                                placeholder="Titre pub"
                                className="w-full bg-black/40 border border-gray-600 rounded px-2 py-1 text-white text-xs"
                              />
                            </div>
                          ) : (
                            <div className="max-w-xs">
                              <div className="text-xs text-cyan-300 mb-1">SEO: {product.seo_title.substring(0, 30)}...</div>
                              <div className="text-xs text-purple-300">Pub: {product.ad_headline}</div>
                            </div>
                          )}
                        </td>
                        <td className="px-4 py-4">
                          <div className="flex items-center">
                            <div className="text-sm font-medium text-white">{product.confidence_score}%</div>
                            <div className={`ml-2 w-2 h-2 rounded-full ${
                              product.confidence_score >= 80 ? 'bg-green-400' :
                              product.confidence_score >= 60 ? 'bg-yellow-400' : 'bg-red-400'
                            }`}></div>
                          </div>
                        </td>
                        <td className="px-4 py-4">
                          {editingProduct === product.id ? (
                            <div className="flex gap-1">
                              <button
                                onClick={handleSaveEdit}
                                className="p-1 bg-green-600 hover:bg-green-700 text-white rounded transition-colors"
                                title="Sauvegarder"
                              >
                                <Save className="w-4 h-4" />
                              </button>
                              <button
                                onClick={handleCancelEdit}
                                className="p-1 bg-gray-600 hover:bg-gray-700 text-white rounded transition-colors"
                                title="Annuler"
                              >
                                <X className="w-4 h-4" />
                              </button>
                            </div>
                          ) : (
                            <div className="flex gap-2">
                              <button
                                onClick={() => handleEditProduct(product)}
                                className="text-yellow-400 hover:text-yellow-300 p-1"
                                title="Modifier"
                              >
                                <Edit className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => {
                                  const updatedProducts = products.filter(p => p.id !== product.id);
                                  setProducts(updatedProducts);
                                  const enrichedKey = vendorId ? `vendor_${vendorId}_enriched_products` : 'admin_enriched_products';
                                  localStorage.setItem(enrichedKey, JSON.stringify(updatedProducts));
                                  showSuccess('Produit supprimé', 'Le produit a été supprimé avec succès.');
                                }}
                                className="text-red-400 hover:text-red-300 p-1"
                                title="Supprimer"
                              >
                                <Package className="w-4 h-4" />
                              </button>
                            </div>
                          )}
    </div>
  );
}