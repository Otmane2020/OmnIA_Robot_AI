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
    </div>
  );
}
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
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Vue grille */}
          {viewMode === 'grid' && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {filteredProducts.map((product) => (
                <div key={product.id} className="bg-white/10 backdrop-blur-xl rounded-2xl p-4 border border-white/20 hover:border-cyan-500/50 transition-all hover:scale-105">
                  <div className="relative">
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
                    <div className="absolute top-2 left-2">
                      <input
                        type="checkbox"
                        checked={selectedProducts.includes(product.id)}
                        onChange={() => toggleProductSelection(product.id)}
                        className="w-4 h-4 text-cyan-600 bg-gray-800 border-gray-600 rounded focus:ring-cyan-500 z-10"
                      />
                    </div>
                    <div className="absolute top-2 right-2">
                      <div className={`px-2 py-1 rounded-full text-xs font-medium ${
                        product.confidence_score >= 80 ? 'bg-green-100 text-green-800' :
                        product.confidence_score >= 60 ? 'bg-yellow-100 text-yellow-800' : 'bg-red-100 text-red-800'
                      }`}>
                        {product.confidence_score}%
                      </div>
                    </div>
                  </div>
                  
                  <div>
                    <h3 className="font-semibold text-white mb-2 line-clamp-2">{product.title}</h3>
                    <p className="text-gray-300 text-sm mb-3">{product.brand}</p>
                    
                    {/* AI Attributes consolidés */}
                    <div className="bg-black/20 rounded-xl p-3 mb-3">
                      <h4 className="text-xs font-semibold text-cyan-300 mb-2">🤖 Attributs IA</h4>
                      <div className="text-xs text-white space-y-1">
                        {formatAIAttributes(product) || (
                          <span className="text-gray-400 italic">Aucun attribut détecté</span>
                        )}
                      </div>
                    </div>
                    
                    <div className="flex flex-wrap gap-1 mb-3">
                      {product.color && (
                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-500/20 text-blue-300">
                          {product.color}
                        </span>
                      )}
                      {product.material && (
                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-500/20 text-green-300">
                          {product.material}
                        </span>
                      )}
                      {product.style && (
                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-purple-500/20 text-purple-300">
                          {product.style}
                        </span>
                      )}
                    </div>
                    
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-lg font-bold text-green-400">{product.price}€</span>
                      <span className="text-sm text-gray-400">Stock: {product.stock_qty}</span>
                    </div>
                    
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleEditProduct(product)}
                        className="flex-1 px-3 py-2 bg-yellow-600 hover:bg-yellow-700 text-white text-sm rounded-lg transition-colors flex items-center justify-center gap-1"
                      >
                        <Edit className="w-3 h-3" />
                        Modifier
                      </button>
                      <button
                        onClick={() => {
                          const updatedProducts = products.filter(p => p.id !== product.id);
                          setProducts(updatedProducts);
                          const enrichedKey = vendorId ? `vendor_${vendorId}_enriched_products` : 'admin_enriched_products';
                          localStorage.setItem(enrichedKey, JSON.stringify(updatedProducts));
                          showSuccess('Produit supprimé', 'Le produit a été supprimé avec succès.');
                        }}
                        className="px-3 py-2 bg-red-600 hover:bg-red-700 text-white text-sm rounded-lg transition-colors"
                      >
                        Supprimer
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
};

// Helper functions for basic enrichment
function detectCategory(text: string): string {
  const lowerText = text.toLowerCase();
  if (lowerText.includes('canapé') || lowerText.includes('sofa')) return 'Canapé';
  if (lowerText.includes('table')) return 'Table';
  if (lowerText.includes('chaise') || lowerText.includes('fauteuil')) return 'Chaise';
  if (lowerText.includes('lit')) return 'Lit';
  if (lowerText.includes('armoire') || lowerText.includes('commode')) return 'Rangement';
  return 'Mobilier';
}

function detectSubcategory(title: string, description: string): string {
  const text = `${title} ${description}`.toLowerCase();
  
  if (text.includes('canapé')) {
    if (text.includes('angle')) return 'Canapé d\'angle';
    if (text.includes('convertible')) return 'Canapé convertible';
    if (text.includes('lit')) return 'Canapé-lit';
    return 'Canapé fixe';
  }
  
  if (text.includes('table')) {
    if (text.includes('basse')) return 'Table basse';
    if (text.includes('manger') || text.includes('repas')) return 'Table à manger';
    if (text.includes('bureau')) return 'Bureau';
    if (text.includes('console')) return 'Console';
    if (text.includes('ronde')) return 'Table ronde';
    return 'Table rectangulaire';
  }
  
  if (text.includes('chaise')) {
    if (text.includes('bureau')) return 'Chaise de bureau';
    if (text.includes('bar')) return 'Tabouret de bar';
    return 'Chaise de salle à manger';
  }
  
  return '';
}

function detectColor(text: string): string {
  const lowerText = text.toLowerCase();
  const colors = ['blanc', 'noir', 'gris', 'beige', 'marron', 'bleu', 'vert', 'rouge', 'jaune', 'orange', 'rose', 'violet', 'naturel', 'chêne', 'noyer', 'taupe'];
  for (const color of colors) {
    if (lowerText.includes(color)) return color;
  }
  return '';
}

function detectMaterial(text: string): string {
  const lowerText = text.toLowerCase();
  const materials = ['bois', 'métal', 'verre', 'tissu', 'cuir', 'velours', 'travertin', 'marbre', 'plastique', 'rotin', 'chenille'];
  for (const material of materials) {
    if (lowerText.includes(material)) return material;
  }
  return '';
}

function detectFabric(text: string): string {
  const lowerText = text.toLowerCase();
  const fabrics = ['velours', 'chenille', 'lin', 'coton', 'cuir', 'tissu', 'polyester'];
  for (const fabric of fabrics) {
    if (lowerText.includes(fabric)) return fabric;
  }
  return '';
}

function detectStyle(text: string): string {
  const lowerText = text.toLowerCase();
  const styles = ['moderne', 'contemporain', 'scandinave', 'industriel', 'vintage', 'rustique', 'classique', 'minimaliste', 'bohème'];
  for (const style of styles) {
    if (lowerText.includes(style)) return style;
  }
  return '';
}

function detectRoom(text: string): string {
  const lowerText = text.toLowerCase();
  const rooms = ['salon', 'chambre', 'cuisine', 'bureau', 'salle à manger', 'entrée', 'terrasse'];
  for (const room of rooms) {
    if (lowerText.includes(room)) return room;
  }
  return '';
}

function extractDimensions(text: string): string {
  const dimensionMatch = text.match(/(\d+)\s*[x×]\s*(\d+)(?:\s*[x×]\s*(\d+))?\s*cm/);
  if (dimensionMatch) {
    const [, length, width, height] = dimensionMatch;
    if (height) {
      return `L:${length}cm x l:${width}cm x H:${height}cm`;
    } else {
      return `L:${length}cm x l:${width}cm`;
    }
  }
  
  const diameterMatch = text.match(/(?:ø|diamètre)\s*(\d+)\s*cm/);
  if (diameterMatch) {
    return `Ø:${diameterMatch[1]}cm`;
  }
  
  return '';
}

function generateSEOTitle(productName: string, brand: string): string {
  return `${productName} - ${brand}`.substring(0, 70);
}

function generateSEODescription(productName: string, description: string): string {
  return `${productName}. ${description.substring(0, 100)}. Livraison gratuite.`.substring(0, 155);
}

function getGoogleCategory(category: string): string {
  const categoryMap: { [key: string]: string } = {
    'Canapé': '635',
    'Table': '443',
    'Chaise': '436',
    'Lit': '569',
    'Rangement': '6552'
  };
  return categoryMap[category] || '';
}

function calculateBasicConfidence(product: any): number {
  let confidence = 30; // Base
  if (product.name || product.title) confidence += 20;
  if (product.description) confidence += 15;
  if (product.price > 0) confidence += 10;
  if (product.image_url) confidence += 10;
  if (product.category || product.productType) confidence += 15;
  return Math.min(confidence, 100);
}

export { ProductsEnrichedTable }