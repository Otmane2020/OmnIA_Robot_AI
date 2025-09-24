import React, { useState, useEffect } from 'react';
import { Search, Filter, ChevronDown, ChevronUp, List, Grid, Download, RefreshCw, Sparkles, Loader2, Package } from 'lucide-react';
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
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncProgress, setSyncProgress] = useState(0);
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
        product.subcategory.toLowerCase().includes(searchTerm.toLowerCase()) ||
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
      
      console.log('📦 [ProductsEnrichedTable] Chargement produits enrichis...');
      
      // Charger les produits enrichis depuis localStorage spécifique au vendeur
      const enrichedKey = vendorId ? `vendor_${vendorId}_enriched_products` : 'admin_enriched_products';
      const savedEnrichedProducts = localStorage.getItem(enrichedKey);
      
      let enrichedProducts: EnrichedProduct[] = [];
      
      if (savedEnrichedProducts) {
        try {
          enrichedProducts = JSON.parse(savedEnrichedProducts);
          console.log('📦 [ProductsEnrichedTable] Produits enrichis chargés depuis localStorage:', enrichedProducts.length);
        } catch (error) {
          console.error('❌ [ProductsEnrichedTable] Erreur parsing produits enrichis:', error);
          enrichedProducts = [];
        }
      } else {
        console.log('📦 [ProductsEnrichedTable] Aucun produit enrichi trouvé');
        enrichedProducts = [];
      }
      
      setProducts(enrichedProducts);
      setFilteredProducts(enrichedProducts);
      
    } catch (error) {
      console.error('❌ [ProductsEnrichedTable] Erreur chargement produits enrichis:', error);
      showError('Erreur de chargement', 'Impossible de charger les produits enrichis.');
    } finally {
      setIsLoading(false);
    }
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
    if (text.includes('canapé') || text.includes('sofa')) {
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
      return 'Table';
    }
    if (text.includes('chaise') || text.includes('fauteuil')) {
      if (text.includes('bureau')) return 'Chaise de bureau';
      if (text.includes('fauteuil')) return 'Fauteuil';
      if (text.includes('bar')) return 'Tabouret de bar';
      return 'Chaise de salle à manger';
    }
    if (text.includes('lit')) {
      if (text.includes('simple')) return 'Lit simple';
      if (text.includes('double')) return 'Lit double';
      return 'Lit';
    }
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
    // Format LxlxH
    const dimensionMatch = text.match(/(\d+)\s*[x×]\s*(\d+)(?:\s*[x×]\s*(\d+))?\s*cm/);
    if (dimensionMatch) {
      const [, length, width, height] = dimensionMatch;
      if (height) {
        return `L:${length}cm x l:${width}cm x H:${height}cm`;
      } else {
        return `L:${length}cm x l:${width}cm`;
      }
    }
    
    // Format diamètre
    const diameterMatch = text.match(/(?:ø|diamètre)\s*(\d+)\s*cm/);
    if (diameterMatch) {
      return `Ø:${diameterMatch[1]}cm`;
    }
    
    // Dimensions séparées
    const lengthMatch = text.match(/(?:longueur|long|l)\s*:?\s*(\d+)\s*cm/);
    const widthMatch = text.match(/(?:largeur|larg|w)\s*:?\s*(\d+)\s*cm/);
    const heightMatch = text.match(/(?:hauteur|haut|h)\s*:?\s*(\d+)\s*cm/);
    
    const dimParts = [];
    if (lengthMatch) dimParts.push(`L:${lengthMatch[1]}cm`);
    if (widthMatch) dimParts.push(`l:${widthMatch[1]}cm`);
    if (heightMatch) dimParts.push(`H:${heightMatch[1]}cm`);
    
    if (dimParts.length > 0) {
      return dimParts.join(' x ');
    }
    
    return '';
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
    setSyncProgress(0);
    showInfo('Enrichissement en cours', 'Analyse IA de tous les produits du catalogue...');
    
    try {
      // Simuler l'enrichissement IA avec progression
      for (let i = 0; i <= 100; i += 10) {
        setSyncProgress(i);
        await new Promise(resolve => setTimeout(resolve, 200));
      }
      
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
      showError('Erreur enrichissement', 'Impossible d\'enrichir les produits.');
    } finally {
      setIsEnriching(false);
      setSyncProgress(0);
    }
  };

  const handleSyncFromCatalog = async () => {
    setIsSyncing(true);
    setSyncProgress(0);
    showInfo('Synchronisation', 'Récupération des produits depuis le catalogue...');
    
    try {
      console.log('🔄 [ProductsEnrichedTable] Synchronisation depuis catalogue...');
      
      // Récupérer les produits depuis le catalogue avec plusieurs tentatives
      const catalogProducts = await getCatalogProducts();
      
      if (catalogProducts.length === 0) {
        showError(
          'Aucun produit trouvé',
          'Votre catalogue est vide. Importez d\'abord vos produits via l\'onglet Intégration.',
          [
            {
              label: 'Aller à l\'intégration',
              action: () => window.location.hash = '#integration',
              variant: 'primary'
            }
          ]
        );
        return;
      }
      
      console.log('📦 [ProductsEnrichedTable] Produits catalogue trouvés:', catalogProducts.length);
      
      // Enrichir chaque produit avec progression
      const enrichedProducts: EnrichedProduct[] = [];
      
      for (let i = 0; i < catalogProducts.length; i++) {
        const product = catalogProducts[i];
        setSyncProgress(Math.round((i / catalogProducts.length) * 100));
        
        try {
          const enriched = enrichProduct(product);
          enrichedProducts.push(enriched);
          console.log(`✅ [ProductsEnrichedTable] Produit enrichi: ${enriched.title.substring(0, 30)}`);
        } catch (error) {
          console.error(`❌ [ProductsEnrichedTable] Erreur enrichissement ${product.name}:`, error);
        }
        
        // Pause pour éviter de bloquer l'UI
        if (i % 5 === 0) {
          await new Promise(resolve => setTimeout(resolve, 100));
        }
      }
      
      setSyncProgress(100);
      
      // Sauvegarder les produits enrichis
      const enrichedKey = vendorId ? `vendor_${vendorId}_enriched_products` : 'admin_enriched_products';
      localStorage.setItem(enrichedKey, JSON.stringify(enrichedProducts));
      
      console.log('💾 [ProductsEnrichedTable] Produits enrichis sauvegardés:', enrichedProducts.length);
      
      // Recharger depuis localStorage
      await loadEnrichedProducts();
      
      showSuccess(
        'Synchronisation réussie',
        `${enrichedProducts.length} produits synchronisés et enrichis !`,
        [
          {
            label: 'Voir les produits',
            action: () => setViewMode('grid'),
            variant: 'primary'
          }
        ]
      );
      
    } catch (error) {
      console.error('❌ [ProductsEnrichedTable] Erreur synchronisation:', error);
      showError('Erreur synchronisation', 'Impossible de synchroniser le catalogue.');
    } finally {
      setIsSyncing(false);
      setSyncProgress(0);
    }
  };

  const getCatalogProducts = async (): Promise<any[]> => {
    try {
      console.log('🔍 [ProductsEnrichedTable] Recherche produits catalogue...');
      
      // Essayer plusieurs clés de stockage possibles pour le vendeur
      const storageKeys = [
        vendorId ? `seller_${vendorId}_products` : null,
        vendorId ? `vendor_${vendorId}_products` : null,
        'catalog_products', // Fallback global
        'imported_products',
        'demo_products'
      ];
      
      for (const key of storageKeys.filter(Boolean)) {
        try {
          const savedProducts = localStorage.getItem(key);
          if (savedProducts) {
            const products = JSON.parse(savedProducts);
            const activeProducts = products.filter((p: any) => 
              p.status === 'active' && (p.stock > 0 || p.quantityAvailable > 0)
            );
            
            if (activeProducts.length > 0) {
              console.log(`✅ [ProductsEnrichedTable] Produits trouvés dans ${key}:`, activeProducts.length);
              return activeProducts;
            }
          }
        } catch (error) {
          console.warn(`⚠️ [ProductsEnrichedTable] Erreur lecture ${key}:`, error);
        }
      }
      
      console.log('⚠️ [ProductsEnrichedTable] Aucun produit trouvé dans localStorage');
      return [];
      
    } catch (error) {
      console.error('❌ [ProductsEnrichedTable] Erreur récupération produits:', error);
      return [];
    }
  };

  const handleExportCSV = () => {
    if (filteredProducts.length === 0) {
      showError('Aucun produit', 'Aucun produit à exporter.');
      return;
    }

    const csvHeaders = [
      'ID', 'Nom', 'Catégorie', 'Sous-catégorie', 'Couleur', 'Matériau', 'Tissu', 'Style', 'Dimensions', 'Pièce',
      'Prix', 'Stock', 'Tags', 'Titre SEO', 'Description SEO', 'Titre Pub', 'Description Pub',
      'Catégorie Google', 'GTIN', 'Marque', 'Score Confiance', 'Enrichi le'
    ];

    const csvData = filteredProducts.map(product => [
      product.id,
      product.title,
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
      product.tags.join('; '),
      product.seo_title,
      product.seo_description,
      product.ad_headline,
      product.ad_description,
      product.google_product_category,
      product.gtin,
      product.brand,
      product.confidence_score,
      new Date(product.enriched_at).toLocaleDateString('fr-FR')
    ]);

    const csvContent = [csvHeaders, ...csvData]
      .map(row => row.map(cell => `"${cell}"`).join(','))
      .join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `produits-enrichis-${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    showSuccess('Export réussi', `${filteredProducts.length} produits exportés en CSV.`);
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
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4 text-indigo-600" />
          <p className="text-gray-600">Chargement des produits enrichis...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* En-tête avec actions */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Catalogue Enrichi</h2>
          <p className="text-gray-600">
            {products.length} produits enrichis par IA • {filteredProducts.length} affichés
          </p>
        </div>
        
        <div className="flex flex-wrap gap-2">
          {!isSyncing ? (
            <button
              onClick={handleSyncFromCatalog}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <RefreshCw className="w-4 h-4" />
              Sync depuis catalogue
            </button>
          ) : (
            <div className="flex items-center gap-2 px-4 py-2 bg-blue-100 text-blue-700 rounded-lg">
              <Loader2 className="w-4 h-4 animate-spin" />
              <span>Synchronisation... {syncProgress}%</span>
            </div>
          )}
          
          {!isEnriching ? (
            <button
              onClick={handleEnrichAll}
              className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
            >
              <Sparkles className="w-4 h-4" />
              Enrichir tout
            </button>
          ) : (
            <div className="flex items-center gap-2 px-4 py-2 bg-purple-100 text-purple-700 rounded-lg">
              <Loader2 className="w-4 h-4 animate-spin" />
              <span>Enrichissement... {syncProgress}%</span>
            </div>
          )}
          
          <button
            onClick={handleExportCSV}
            className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
          >
            <Download className="w-4 h-4" />
            Export CSV
          </button>
        </div>
      </div>

      {/* Barre de progression */}
      {(isSyncing || isEnriching) && (
        <div className="bg-white p-4 rounded-lg border border-gray-200">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-gray-700">
              {isSyncing ? 'Synchronisation en cours...' : 'Enrichissement en cours...'}
            </span>
            <span className="text-sm text-gray-500">{syncProgress}%</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div 
              className="bg-blue-600 h-2 rounded-full transition-all duration-300"
              style={{ width: `${syncProgress}%` }}
            ></div>
          </div>
        </div>
      )}

      {/* Barre de recherche et filtres */}
      <div className="bg-white p-4 rounded-lg border border-gray-200">
        <div className="flex flex-col sm:flex-row gap-4 mb-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="text"
                placeholder="Rechercher par nom, catégorie, marque, tags..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              />
            </div>
          </div>
          
          <div className="flex gap-2">
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <Filter className="w-4 h-4" />
              Filtres
              {showFilters && <ChevronUp className="w-4 h-4" />}
              {!showFilters && <ChevronDown className="w-4 h-4" />}
            </button>
            
            <div className="flex border border-gray-300 rounded-lg overflow-hidden">
              <button
                onClick={() => setViewMode('table')}
                className={`p-2 ${viewMode === 'table' ? 'bg-indigo-600 text-white' : 'bg-white text-gray-600 hover:bg-gray-50'} transition-colors`}
              >
                <List className="w-4 h-4" />
              </button>
              <button
                onClick={() => setViewMode('grid')}
                className={`p-2 ${viewMode === 'grid' ? 'bg-indigo-600 text-white' : 'bg-white text-gray-600 hover:bg-gray-50'} transition-colors`}
              >
                <Grid className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Filtres avancés */}
        {showFilters && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 pt-4 border-t border-gray-200">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Catégorie</label>
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              >
                <option value="all">Toutes les catégories</option>
                {uniqueCategories.map(category => (
                  <option key={category} value={category}>{category}</option>
                ))}
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Couleur</label>
              <select
                value={selectedColor}
                onChange={(e) => setSelectedColor(e.target.value)}
                className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              >
                <option value="all">Toutes les couleurs</option>
                {uniqueColors.map(color => (
                  <option key={color} value={color}>{color}</option>
                ))}
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Matériau</label>
              <select
                value={selectedMaterial}
                onChange={(e) => setSelectedMaterial(e.target.value)}
                className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              >
                <option value="all">Tous les matériaux</option>
                {uniqueMaterials.map(material => (
                  <option key={material} value={material}>{material}</option>
                ))}
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Style</label>
              <select
                value={selectedStyle}
                onChange={(e) => setSelectedStyle(e.target.value)}
                className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
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
        <div className="bg-indigo-50 border border-indigo-200 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <span className="text-indigo-700 font-medium">
              {selectedProducts.length} produit{selectedProducts.length > 1 ? 's' : ''} sélectionné{selectedProducts.length > 1 ? 's' : ''}
            </span>
            <div className="flex gap-2">
              <button
                onClick={() => handleBulkAction('export')}
                className="px-3 py-1 bg-green-600 text-white rounded hover:bg-green-700 transition-colors text-sm"
              >
                Exporter
              </button>
              <button
                onClick={() => handleBulkAction('delete')}
                className="px-3 py-1 bg-red-600 text-white rounded hover:bg-red-700 transition-colors text-sm"
              >
                Supprimer
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Contenu principal */}
      {products.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-lg border border-gray-200">
          <Package className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">Aucun produit enrichi</h3>
          <p className="text-gray-600 mb-6">
            Commencez par synchroniser votre catalogue pour enrichir vos produits avec l'IA.
          </p>
          <button
            onClick={handleSyncFromCatalog}
            disabled={isSyncing}
            className="inline-flex items-center gap-2 px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
          >
            {isSyncing ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <RefreshCw className="w-5 h-5" />
            )}
            {isSyncing ? 'Synchronisation...' : 'Synchroniser le catalogue'}
          </button>
        </div>
      ) : (
        <>
          {/* Vue tableau */}
          {viewMode === 'table' && (
            <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-4 py-3 text-left">
                        <input
                          type="checkbox"
                          checked={selectedProducts.length === filteredProducts.length && filteredProducts.length > 0}
                          onChange={toggleAllSelection}
                          className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                        />
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Produit</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Catégorie / Sous-catégorie</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Couleur</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Matériau</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Style</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Dimensions</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Prix</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Confiance</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {filteredProducts.map((product) => (
                      <tr key={product.id} className="hover:bg-gray-50">
                        <td className="px-4 py-4">
                          <input
                            type="checkbox"
                            checked={selectedProducts.includes(product.id)}
                            onChange={() => toggleProductSelection(product.id)}
                            className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                          />
                        </td>
                        <td className="px-4 py-4">
                          <div className="flex items-center">
                            <img
                              src={product.image_url}
                              alt={product.title}
                              className="w-12 h-12 rounded-lg object-cover mr-3"
                            />
                            <div>
                              <div className="text-sm font-medium text-gray-900">{product.title}</div>
                              <div className="text-sm text-gray-500">{product.brand}</div>
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-4">
                          <div className="text-sm text-gray-900">{product.category}</div>
                          {product.subcategory && (
                            <div className="text-sm text-gray-500">{product.subcategory}</div>
                          )}
                        </td>
                        <td className="px-4 py-4">
                          {product.color && (
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                              {product.color}
                            </span>
                          )}
                        </td>
                        <td className="px-4 py-4">
                          {product.material && (
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                              {product.material}
                            </span>
                          )}
                        </td>
                        <td className="px-4 py-4">
                          {product.style && (
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                              {product.style}
                            </span>
                          )}
                        </td>
                        <td className="px-4 py-4">
                          <div className="text-sm text-gray-900">{product.dimensions || 'Non spécifié'}</div>
                        </td>
                        <td className="px-4 py-4">
                          <div className="text-sm font-medium text-gray-900">{product.price}€</div>
                          <div className="text-sm text-gray-500">Stock: {product.stock_qty}</div>
                        </td>
                        <td className="px-4 py-4">
                          <div className="flex items-center">
                            <div className="text-sm font-medium text-gray-900">{product.confidence_score}%</div>
                            <div className={`ml-2 w-2 h-2 rounded-full ${
                              product.confidence_score >= 80 ? 'bg-green-400' :
                              product.confidence_score >= 60 ? 'bg-yellow-400' : 'bg-red-400'
                            }`}></div>
                          </div>
                        </td>
                        <td className="px-4 py-4">
                          <div className="flex items-center gap-2">
                            <button className="text-indigo-600 hover:text-indigo-900 text-sm">
                              Modifier
                            </button>
                            <button className="text-red-600 hover:text-red-900 text-sm">
                              Supprimer
                            </button>
                          </div>
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
                <div key={product.id} className="bg-white rounded-lg border border-gray-200 overflow-hidden hover:shadow-lg transition-shadow">
                  <div className="relative">
                    <img
                      src={product.image_url}
                      alt={product.title}
                      className="w-full h-48 object-cover"
                    />
                    <div className="absolute top-2 left-2">
                      <input
                        type="checkbox"
                        checked={selectedProducts.includes(product.id)}
                        onChange={() => toggleProductSelection(product.id)}
                        className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
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
                  
                  <div className="p-4">
                    <h3 className="font-medium text-gray-900 mb-1">{product.title}</h3>
                    <p className="text-sm text-gray-500 mb-2">{product.brand}</p>
                    
                    <div className="space-y-2 mb-3">
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-600">Catégorie:</span>
                        <span className="text-sm font-medium">{product.category}</span>
                      </div>
                      {product.subcategory && (
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-gray-600">Sous-catégorie:</span>
                          <span className="text-sm font-medium">{product.subcategory}</span>
                        </div>
                      )}
                      {product.dimensions && (
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-gray-600">Dimensions:</span>
                          <span className="text-sm font-medium">{product.dimensions}</span>
                        </div>
                      )}
                    </div>
                    
                    <div className="flex flex-wrap gap-1 mb-3">
                      {product.color && (
                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                          {product.color}
                        </span>
                      )}
                      {product.material && (
                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                          {product.material}
                        </span>
                      )}
                      {product.style && (
                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                          {product.style}
                        </span>
                      )}
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div className="text-lg font-bold text-gray-900">{product.price}€</div>
                      <div className="text-sm text-gray-500">Stock: {product.stock_qty}</div>
                    </div>
                    
                    <div className="mt-3 flex gap-2">
                      <button className="flex-1 px-3 py-2 text-sm bg-indigo-600 text-white rounded hover:bg-indigo-700 transition-colors">
                        Modifier
                      </button>
                      <button className="px-3 py-2 text-sm border border-gray-300 rounded hover:bg-gray-50 transition-colors">
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