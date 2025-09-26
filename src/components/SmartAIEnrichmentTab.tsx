import React, { useState, useEffect } from 'react';
import { 
  Search, Filter, Plus, Eye, Edit, Trash2, ExternalLink, Package, Tag, DollarSign, 
  Image, BarChart3, Settings, ChevronDown, ChevronUp, X, Save, Info, Sparkles, 
  Brain, Zap, RefreshCw, Download, Upload, CheckCircle, AlertCircle, Loader2,
  Palette, Ruler, Weight, Wrench, Star, TrendingUp, Target, Wand2
} from 'lucide-react';
import { useNotifications } from './NotificationSystem';
import { supabase } from '../lib/supabase';
import {
  extractEnhancedStyles,
  extractEnhancedColors,
  extractEnhancedMaterials,
  extractEnhancedRooms,
  detectEnhancedCategory,
  extractDimensions,
  detectPromotions,
  generateSEOContent
} from '../utils/productEnrichmentUtils';

interface SmartProduct {
  id: string;
  name: string;
  title: string;
  description: string;
  price: number;
  compare_at_price?: number;
  category: string;
  subcategory: string;
  vendor: string;
  brand: string;
  image_url: string;
  product_url: string;
  stock: number;
  
  // AI-enriched attributes
  color: string;
  material: string;
  fabric: string;
  style: string;
  dimensions: string;
  room: string;
  
  // SEO attributes
  seo_title: string;
  seo_description: string;
  ad_headline: string;
  ad_description: string;
  tags: string[];
  google_product_category: string;
  
  // AI metadata
  confidence_score: number;
  enriched_at: string;
  enrichment_source: string;
  
  // Promotion info
  hasPromotion: boolean;
  discountPercentage: number;
  savingsAmount: number;
  promotionText: string;
}

export const SmartAIEnrichmentTab: React.FC = () => {
  const [products, setProducts] = useState<SmartProduct[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<SmartProduct[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedColor, setSelectedColor] = useState('all');
  const [selectedMaterial, setSelectedMaterial] = useState('all');
  const [selectedStyle, setSelectedStyle] = useState('all');
  const [selectedRoom, setSelectedRoom] = useState('all');
  const [showFilters, setShowFilters] = useState(false);
  const [selectedProducts, setSelectedProducts] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isEnriching, setIsEnriching] = useState(false);
  const [viewMode, setViewMode] = useState<'table' | 'grid'>('table');
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState<SmartProduct | null>(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<SmartProduct | null>(null);
  const { showSuccess, showError, showInfo } = useNotifications();

  useEffect(() => {
    loadSmartProducts();
  }, []);

  useEffect(() => {
    // Filter products
    let filtered = products;

    if (searchTerm) {
      filtered = filtered.filter(product =>
        product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
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

    if (selectedRoom !== 'all') {
      filtered = filtered.filter(product => product.room === selectedRoom);
    }

    setFilteredProducts(filtered);
  }, [products, searchTerm, selectedCategory, selectedColor, selectedMaterial, selectedStyle, selectedRoom]);

  const loadSmartProducts = async () => {
    try {
      setIsLoading(true);
      console.log('🧠 Chargement produits enrichis IA...');
      
      // Try to load from Supabase first
      const { data: enrichedProducts, error } = await supabase
        .from('products_enriched')
        .select('*')
        .gt('stock_qty', 0)
        .order('confidence_score', { ascending: false });

      if (error) {
        console.error('❌ Erreur Supabase:', error);
        // Fallback to localStorage
        loadFromLocalStorage();
        return;
      }

      if (enrichedProducts && enrichedProducts.length > 0) {
        const transformedProducts = enrichedProducts.map(transformEnrichedProduct);
        setProducts(transformedProducts);
        setFilteredProducts(transformedProducts);
        console.log('✅ Produits enrichis chargés:', transformedProducts.length);
      } else {
        console.log('⚠️ Aucun produit enrichi, chargement depuis localStorage...');
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
      const savedProducts = localStorage.getItem('catalog_products');
      if (savedProducts) {
        const catalogProducts = JSON.parse(savedProducts);
        const enrichedProducts = catalogProducts.map(enrichProductLocally);
        setProducts(enrichedProducts);
        setFilteredProducts(enrichedProducts);
        console.log('✅ Produits enrichis localement:', enrichedProducts.length);
      } else {
        setProducts([]);
        setFilteredProducts([]);
        showInfo('Catalogue vide', 'Aucun produit trouvé. Importez d\'abord votre catalogue.');
      }
    } catch (error) {
      console.error('❌ Erreur localStorage:', error);
      setProducts([]);
      setFilteredProducts([]);
    }
  };

  const transformEnrichedProduct = (product: any): SmartProduct => {
    const promotionInfo = detectPromotions(product.price, product.compare_at_price);
    
    return {
      id: product.id,
      name: product.title,
      title: product.title,
      description: product.description || '',
      price: product.price,
      compare_at_price: product.compare_at_price,
      category: product.category,
      subcategory: product.subcategory || '',
      vendor: product.brand || 'Decora Home',
      brand: product.brand || 'Decora Home',
      image_url: product.image_url,
      product_url: product.product_url,
      stock: product.stock_qty,
      
      // AI attributes
      color: product.color || '',
      material: product.material || '',
      fabric: product.fabric || '',
      style: product.style || '',
      dimensions: product.dimensions || '',
      room: product.room || '',
      
      // SEO
      seo_title: product.seo_title || '',
      seo_description: product.seo_description || '',
      ad_headline: product.ad_headline || '',
      ad_description: product.ad_description || '',
      tags: Array.isArray(product.tags) ? product.tags : [],
      google_product_category: product.google_product_category || '',
      
      // AI metadata
      confidence_score: product.confidence_score || 0,
      enriched_at: product.enriched_at || new Date().toISOString(),
      enrichment_source: product.enrichment_source || 'local',
      
      // Promotion
      ...promotionInfo
    };
  };

  const enrichProductLocally = (product: any): SmartProduct => {
    const text = `${product.name || product.title || ''} ${product.description || ''}`;
    
    // Extract attributes using utility functions
    const colors = extractEnhancedColors(text);
    const materials = extractEnhancedMaterials(text);
    const styles = extractEnhancedStyles(text);
    const rooms = extractEnhancedRooms(text);
    const category = detectEnhancedCategory(text);
    const dimensions = extractDimensions(text);
    const promotionInfo = detectPromotions(product.price, product.compare_at_price);
    
    // Generate SEO content
    const seoContent = generateSEOContent(product, {
      technical_specs: {
        color: colors[0] || '',
        material: materials[0] || '',
        style: styles[0] || ''
      }
    });
    
    return {
      id: product.id || `enriched-${Date.now()}`,
      name: product.name || product.title || '',
      title: product.name || product.title || '',
      description: product.description || '',
      price: product.price || 0,
      compare_at_price: product.compare_at_price,
      category: category,
      subcategory: generateSubcategory(text, category),
      vendor: product.vendor || 'Decora Home',
      brand: product.vendor || 'Decora Home',
      image_url: product.image_url || '',
      product_url: product.product_url || '',
      stock: product.stock || 0,
      
      // AI attributes
      color: colors[0] || '',
      material: materials[0] || '',
      fabric: extractFabric(materials[0] || ''),
      style: styles[0] || '',
      dimensions: dimensions,
      room: rooms[0] || '',
      
      // SEO
      seo_title: seoContent.seoTitle,
      seo_description: seoContent.seoDescription,
      ad_headline: seoContent.adHeadline,
      ad_description: seoContent.adDescription,
      tags: seoContent.tags,
      google_product_category: '696', // Default furniture category
      
      // AI metadata
      confidence_score: calculateConfidence(colors, materials, styles, dimensions),
      enriched_at: new Date().toISOString(),
      enrichment_source: 'local_ai',
      
      // Promotion
      ...promotionInfo
    };
  };

  const generateSubcategory = (text: string, category: string): string => {
    const lowerText = text.toLowerCase();
    
    if (category === 'Canapé') {
      const features = [];
      if (lowerText.includes('angle')) features.push('d\'angle');
      if (lowerText.includes('convertible')) features.push('convertible');
      if (lowerText.includes('places')) {
        const match = lowerText.match(/(\d+)\s*places?/);
        if (match) features.push(`${match[1]} places`);
      }
      return features.length > 0 ? `Canapé ${features.join(' ')}` : 'Canapé';
    }
    
    if (category === 'Table') {
      if (lowerText.includes('basse')) return 'Table basse';
      if (lowerText.includes('manger')) return 'Table à manger';
      if (lowerText.includes('ronde')) return 'Table ronde';
      return 'Table';
    }
    
    return category;
  };

  const extractFabric = (material: string): string => {
    const fabricMappings: { [key: string]: string } = {
      'tissu': 'tissu',
      'velours': 'velours',
      'cuir': 'cuir',
      'chenille': 'chenille'
    };
    return fabricMappings[material.toLowerCase()] || '';
  };

  const calculateConfidence = (colors: string[], materials: string[], styles: string[], dimensions: string): number => {
    let confidence = 30; // Base confidence
    if (colors.length > 0) confidence += 20;
    if (materials.length > 0) confidence += 25;
    if (styles.length > 0) confidence += 15;
    if (dimensions) confidence += 10;
    return Math.min(confidence, 100);
  };

  const handleEnrichWithAI = async () => {
    setIsEnriching(true);
    showInfo('Enrichissement IA', 'Analyse intelligente de votre catalogue en cours...');
    
    try {
      // Simulate AI enrichment
      await new Promise(resolve => setTimeout(resolve, 3000));
      
      // Reload products
      await loadSmartProducts();
      
      showSuccess(
        'Enrichissement terminé',
        `${products.length} produits enrichis avec l'IA !`,
        [
          {
            label: 'Voir les résultats',
            action: () => setViewMode('grid'),
            variant: 'primary'
          }
        ]
      );
      
    } catch (error) {
      showError('Erreur enrichissement', 'Impossible d\'enrichir les produits avec l\'IA.');
    } finally {
      setIsEnriching(false);
    }
  };

  const categories = [...new Set(products.map(p => p.category))];
  const colors = [...new Set(products.map(p => p.color).filter(Boolean))];
  const materials = [...new Set(products.map(p => p.material).filter(Boolean))];
  const styles = [...new Set(products.map(p => p.style).filter(Boolean))];
  const rooms = [...new Set(products.map(p => p.room).filter(Boolean))];

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

  const handleEditProduct = (product: SmartProduct) => {
    setEditingProduct(product);
    setShowEditModal(true);
  };

  const handleViewProduct = (product: SmartProduct) => {
    setSelectedProduct(product);
    setShowDetailModal(true);
  };

  const handleSaveProduct = (updatedProduct: SmartProduct) => {
    setProducts(prev => prev.map(p => 
      p.id === updatedProduct.id ? updatedProduct : p
    ));
    setShowEditModal(false);
    setEditingProduct(null);
    showSuccess('Produit modifié', 'Les modifications ont été sauvegardées.');
  };

  const handleDeleteProduct = (productId: string) => {
    if (confirm('Supprimer ce produit enrichi ?')) {
      setProducts(prev => prev.filter(p => p.id !== productId));
      showSuccess('Produit supprimé', 'Le produit a été supprimé du catalogue enrichi.');
    }
  };

  const getConfidenceColor = (score: number) => {
    if (score >= 80) return 'bg-green-500/20 text-green-300 border-green-500/30';
    if (score >= 60) return 'bg-yellow-500/20 text-yellow-300 border-yellow-500/30';
    return 'bg-red-500/20 text-red-300 border-red-500/30';
  };

  const getEnrichmentSourceColor = (source: string) => {
    switch (source) {
      case 'ai': return 'bg-purple-500/20 text-purple-300';
      case 'auto': return 'bg-blue-500/20 text-blue-300';
      case 'manual': return 'bg-orange-500/20 text-orange-300';
      case 'local_ai': return 'bg-cyan-500/20 text-cyan-300';
      default: return 'bg-gray-500/20 text-gray-300';
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="text-center">
          <Brain className="w-16 h-16 text-purple-400 animate-pulse mx-auto mb-4" />
          <p className="text-white text-lg">Chargement du catalogue enrichi IA...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-white flex items-center gap-3">
            <Brain className="w-6 h-6 text-purple-400" />
            Enrichissement IA Intelligent
          </h2>
          <p className="text-gray-300">{filteredProducts.length} produit(s) enrichi(s) sur {products.length}</p>
        </div>
        
        <div className="flex flex-wrap gap-3">
          <button
            onClick={handleEnrichWithAI}
            disabled={isEnriching}
            className="bg-gradient-to-r from-purple-500 to-pink-600 hover:from-purple-400 hover:to-pink-500 disabled:from-gray-600 disabled:to-gray-700 text-white px-4 py-2 rounded-xl flex items-center gap-2 font-semibold transition-all disabled:cursor-not-allowed"
          >
            {isEnriching ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Enrichissement...
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4" />
                Enrichir avec IA
              </>
            )}
          </button>
          
          <button
            onClick={() => setViewMode(viewMode === 'table' ? 'grid' : 'table')}
            className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-xl flex items-center gap-2 transition-all"
          >
            <BarChart3 className="w-4 h-4" />
            {viewMode === 'table' ? 'Vue grille' : 'Vue tableau'}
          </button>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="bg-white/10 backdrop-blur-xl rounded-2xl p-6 border border-white/20">
        <div className="flex flex-col lg:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Rechercher dans les produits enrichis..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-3 bg-black/40 border border-gray-600 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:border-purple-400 focus:ring-2 focus:ring-purple-400/30"
            />
          </div>
          
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-3 rounded-xl flex items-center gap-2 transition-all"
          >
            <Filter className="w-4 h-4" />
            Filtres IA
            {showFilters ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </button>
        </div>

        {showFilters && (
          <div className="mt-6 pt-6 border-t border-gray-600/50">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
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
                <label className="block text-sm text-gray-300 mb-2">Couleur IA</label>
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
                <label className="block text-sm text-gray-300 mb-2">Matériau IA</label>
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
                <label className="block text-sm text-gray-300 mb-2">Style IA</label>
                <select
                  value={selectedStyle}
                  onChange={(e) => setSelectedStyle(e.target.value)}
                  className="w-full bg-black/40 border border-gray-600 rounded-xl px-3 py-2 text-white"
                >
                  <option value="all">Tous les styles</option>
                  {styles.map(style => (
                    <option key={style} value={style}>{style}</option>
                  ))}
                </select>
              </div>
              
              <div>
                <label className="block text-sm text-gray-300 mb-2">Pièce IA</label>
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

      {/* Products Display */}
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
                      className="w-4 h-4 text-purple-600 bg-gray-800 border-gray-600 rounded focus:ring-purple-500"
                    />
                  </th>
                  <th className="text-left p-4 text-purple-300 font-semibold">Produit</th>
                  <th className="text-left p-4 text-purple-300 font-semibold">Attributs IA</th>
                  <th className="text-left p-4 text-purple-300 font-semibold">Dimensions</th>
                  <th className="text-left p-4 text-purple-300 font-semibold">SEO IA</th>
                  <th className="text-left p-4 text-purple-300 font-semibold">Confiance</th>
                  <th className="text-left p-4 text-purple-300 font-semibold">Actions</th>
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
                        className="w-4 h-4 text-purple-600 bg-gray-800 border-gray-600 rounded focus:ring-purple-500"
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
                          <div className="text-gray-400 text-xs">{product.brand}</div>
                          <div className="flex items-center gap-2">
                            <span className="text-green-400 font-bold">{product.price}€</span>
                            {product.hasPromotion && (
                              <span className="bg-red-500/20 text-red-300 px-2 py-1 rounded-full text-xs">
                                -{product.discountPercentage}%
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="p-4">
                      <div className="space-y-2">
                        <div className="flex flex-wrap gap-1">
                          {product.category && (
                            <span className="bg-blue-500/20 text-blue-300 px-2 py-1 rounded text-xs border border-blue-500/30">
                              📦 {product.category}
                            </span>
                          )}
                          {product.color && (
                            <span className="bg-pink-500/20 text-pink-300 px-2 py-1 rounded text-xs border border-pink-500/30">
                              🎨 {product.color}
                            </span>
                          )}
                          {product.material && (
                            <span className="bg-green-500/20 text-green-300 px-2 py-1 rounded text-xs border border-green-500/30">
                              🏗️ {product.material}
                            </span>
                          )}
                          {product.style && (
                            <span className="bg-purple-500/20 text-purple-300 px-2 py-1 rounded text-xs border border-purple-500/30">
                              ✨ {product.style}
                            </span>
                          )}
                        </div>
                        {product.room && (
                          <div className="text-gray-400 text-xs flex items-center gap-1">
                            <Target className="w-3 h-3" />
                            {product.room}
                          </div>
                        )}
                        {product.tags.length > 0 && (
                          <div className="flex flex-wrap gap-1">
                            {product.tags.slice(0, 3).map((tag, index) => (
                              <span key={index} className="bg-cyan-500/20 text-cyan-300 px-1 py-0.5 rounded text-xs">
                                #{tag}
                              </span>
                            ))}
                            {product.tags.length > 3 && (
                              <span className="text-gray-400 text-xs">+{product.tags.length - 3}</span>
                            )}
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="p-4">
                      <div className="space-y-1">
                        {product.dimensions && (
                          <div className="flex items-center gap-1 text-cyan-400 text-xs">
                            <Ruler className="w-3 h-3" />
                            {product.dimensions}
                          </div>
                        )}
                        {product.fabric && (
                          <div className="text-gray-400 text-xs">
                            Tissu: {product.fabric}
                          </div>
                        )}
                        <div className="text-gray-400 text-xs">
                          Stock: {product.stock}
                        </div>
                      </div>
                    </td>
                    <td className="p-4">
                      <div className="space-y-1">
                        <div className="text-white text-xs font-medium line-clamp-1">{product.seo_title}</div>
                        <div className="text-gray-400 text-xs line-clamp-2">{product.seo_description}</div>
                        {product.google_product_category && (
                          <div className="text-cyan-400 text-xs">Google: {product.google_product_category}</div>
                        )}
                        {product.ad_headline && (
                          <div className="text-orange-400 text-xs">Pub: {product.ad_headline}</div>
                        )}
                      </div>
                    </td>
                    <td className="p-4">
                      <div className="text-center">
                        <span className={`px-3 py-1 rounded-full text-xs font-medium border ${getConfidenceColor(product.confidence_score)}`}>
                          {product.confidence_score}%
                        </span>
                        <div className={`text-xs mt-1 px-2 py-1 rounded ${getEnrichmentSourceColor(product.enrichment_source)}`}>
                          {product.enrichment_source}
                        </div>
                        <div className="text-xs text-gray-400 mt-1">
                          {new Date(product.enriched_at).toLocaleDateString('fr-FR')}
                        </div>
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
                          onClick={() => handleEditProduct(product)}
                          className="text-yellow-400 hover:text-yellow-300 p-1"
                          title="Modifier attributs IA"
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
            <div key={product.id} className="bg-white/10 backdrop-blur-xl rounded-2xl p-4 border border-white/20 hover:border-purple-500/50 transition-all hover:scale-105 relative">
              <input
                type="checkbox"
                checked={selectedProducts.includes(product.id)}
                onChange={() => handleSelectProduct(product.id)}
                className="absolute top-2 left-2 w-4 h-4 text-purple-600 bg-gray-800 border-gray-600 rounded focus:ring-purple-500 z-10"
              />
              
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
                {product.hasPromotion && (
                  <>
                    <span className="text-gray-400 line-through text-sm">{product.compare_at_price}€</span>
                    <span className="bg-red-500/20 text-red-300 px-2 py-1 rounded-full text-xs animate-pulse">
                      -{product.discountPercentage}%
                    </span>
                  </>
                )}
              </div>
              
              {/* Attributs IA enrichis */}
              <div className="space-y-2 mb-4">
                <div className="flex flex-wrap gap-1">
                  {product.color && (
                    <span className="bg-pink-500/20 text-pink-300 px-2 py-1 rounded text-xs flex items-center gap-1">
                      <Palette className="w-3 h-3" />
                      {product.color}
                    </span>
                  )}
                  {product.material && (
                    <span className="bg-green-500/20 text-green-300 px-2 py-1 rounded text-xs flex items-center gap-1">
                      <Package className="w-3 h-3" />
                      {product.material}
                    </span>
                  )}
                  {product.style && (
                    <span className="bg-purple-500/20 text-purple-300 px-2 py-1 rounded text-xs flex items-center gap-1">
                      <Sparkles className="w-3 h-3" />
                      {product.style}
                    </span>
                  )}
                </div>
                
                {product.room && (
                  <div className="text-gray-400 text-xs flex items-center gap-1">
                    <Target className="w-3 h-3" />
                    Pièce: {product.room}
                  </div>
                )}
                
                {product.dimensions && (
                  <div className="text-gray-400 text-xs flex items-center gap-1">
                    <Ruler className="w-3 h-3" />
                    {product.dimensions}
                  </div>
                )}
                
                {product.tags.length > 0 && (
                  <div className="flex flex-wrap gap-1">
                    {product.tags.slice(0, 4).map((tag, index) => (
                      <span key={index} className="bg-cyan-500/20 text-cyan-300 px-1 py-0.5 rounded text-xs">
                        #{tag}
                      </span>
                    ))}
                  </div>
                )}
              </div>
              
              {/* Confiance IA */}
              <div className="flex items-center justify-between mb-4">
                <span className={`px-2 py-1 rounded-full text-xs border ${getConfidenceColor(product.confidence_score)}`}>
                  IA: {product.confidence_score}%
                </span>
                <span className="text-gray-400 text-xs">
                  Stock: {product.stock}
                </span>
              </div>
              
              {/* SEO Preview */}
              <div className="bg-black/20 rounded-lg p-3 mb-4">
                <div className="text-cyan-400 text-xs font-medium mb-1 flex items-center gap-1">
                  <TrendingUp className="w-3 h-3" />
                  SEO Optimisé IA :
                </div>
                <div className="text-white text-xs font-medium line-clamp-1">{product.seo_title}</div>
                <div className="text-gray-400 text-xs line-clamp-2">{product.seo_description}</div>
                {product.ad_headline && (
                  <div className="text-orange-400 text-xs mt-1">Pub: {product.ad_headline}</div>
                )}
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
                  className="flex-1 bg-purple-600 hover:bg-purple-700 text-white py-2 rounded-lg flex items-center justify-center gap-1 text-sm"
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
          <Brain className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-xl font-bold text-white mb-2">Aucun produit enrichi</h3>
          <p className="text-gray-400 mb-6">
            Commencez par enrichir votre catalogue avec l'IA
          </p>
          <button
            onClick={handleEnrichWithAI}
            className="bg-gradient-to-r from-purple-500 to-pink-600 hover:from-purple-400 hover:to-pink-500 text-white px-6 py-3 rounded-xl font-semibold transition-all"
          >
            Enrichir avec IA
          </button>
        </div>
      )}

      {/* AI Enrichment Info */}
      <div className="bg-gradient-to-r from-purple-500/20 to-pink-600/20 backdrop-blur-xl rounded-2xl p-6 border border-purple-400/30">
        <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
          <Brain className="w-5 h-5 text-purple-400" />
          Statistiques d'enrichissement IA
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
          <div className="text-center">
            <div className="text-2xl font-bold text-purple-400">{products.length}</div>
            <div className="text-purple-300 text-sm">Produits enrichis</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-green-400">
              {Math.round(products.reduce((sum, p) => sum + p.confidence_score, 0) / products.length) || 0}%
            </div>
            <div className="text-green-300 text-sm">Confiance moyenne</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-cyan-400">{categories.length}</div>
            <div className="text-cyan-300 text-sm">Catégories détectées</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-orange-400">{colors.length + materials.length}</div>
            <div className="text-orange-300 text-sm">Attributs extraits</div>
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h4 className="font-semibold text-purple-300 mb-2 flex items-center gap-2">
              <Wand2 className="w-4 h-4" />
              Extraction automatique IA :
            </h4>
            <ul className="text-sm text-gray-300 space-y-1">
              <li>• <strong>Couleurs :</strong> {colors.length} détectées ({colors.slice(0, 3).join(', ')}...)</li>
              <li>• <strong>Matériaux :</strong> {materials.length} identifiés ({materials.slice(0, 3).join(', ')}...)</li>
              <li>• <strong>Styles :</strong> {styles.length} analysés ({styles.slice(0, 3).join(', ')}...)</li>
              <li>• <strong>Pièces :</strong> {rooms.length} ciblées ({rooms.slice(0, 3).join(', ')}...)</li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold text-purple-300 mb-2 flex items-center gap-2">
              <TrendingUp className="w-4 h-4" />
              Optimisation SEO IA :
            </h4>
            <ul className="text-sm text-gray-300 space-y-1">
              <li>• Titres et descriptions optimisés</li>
              <li>• {products.reduce((sum, p) => sum + p.tags.length, 0)} tags intelligents générés</li>
              <li>• Catégories Google Shopping</li>
              <li>• Headlines publicitaires automatiques</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Modal d'édition */}
      {showEditModal && editingProduct && (
        <ProductEditModal
          product={editingProduct}
          onSave={handleSaveProduct}
          onClose={() => {
            setShowEditModal(false);
            setEditingProduct(null);
          }}
        />
      )}

      {/* Modal de détails */}
      {showDetailModal && selectedProduct && (
        <ProductDetailModal
          product={selectedProduct}
          onClose={() => {
            setShowDetailModal(false);
            setSelectedProduct(null);
          }}
        />
      )}
    </div>
  );
};

// Modal d'édition des attributs IA
const ProductEditModal: React.FC<{
  product: SmartProduct;
  onSave: (product: SmartProduct) => void;
  onClose: () => void;
}> = ({ product, onSave, onClose }) => {
  const [editedProduct, setEditedProduct] = useState<SmartProduct>({ ...product });

  const handleSave = () => {
    // Recalculer la confiance après modification manuelle
    const newConfidence = calculateManualConfidence(editedProduct);
    const updatedProduct = {
      ...editedProduct,
      confidence_score: newConfidence,
      enriched_at: new Date().toISOString(),
      enrichment_source: 'manual'
    };
    onSave(updatedProduct);
  };

  const calculateManualConfidence = (product: SmartProduct): number => {
    let confidence = 50; // Base pour modification manuelle
    if (product.color) confidence += 15;
    if (product.material) confidence += 20;
    if (product.style) confidence += 10;
    if (product.dimensions) confidence += 10;
    if (product.room) confidence += 5;
    return Math.min(confidence, 100);
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-slate-800/95 backdrop-blur-xl rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto border border-slate-600/50">
        <div className="flex items-center justify-between p-6 border-b border-slate-600/50">
          <h2 className="text-2xl font-bold text-white flex items-center gap-2">
            <Wrench className="w-6 h-6 text-purple-400" />
            Modifier les attributs IA
          </h2>
          <button onClick={onClose} className="text-gray-400 hover:text-white transition-colors">
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          {/* Informations de base */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm text-gray-300 mb-2">Titre du produit</label>
              <input
                type="text"
                value={editedProduct.title}
                onChange={(e) => setEditedProduct(prev => ({ ...prev, title: e.target.value }))}
                className="w-full bg-black/40 border border-gray-600 rounded-xl px-4 py-3 text-white"
              />
            </div>
            <div>
              <label className="block text-sm text-gray-300 mb-2">Marque</label>
              <input
                type="text"
                value={editedProduct.brand}
                onChange={(e) => setEditedProduct(prev => ({ ...prev, brand: e.target.value }))}
                className="w-full bg-black/40 border border-gray-600 rounded-xl px-4 py-3 text-white"
              />
            </div>
          </div>

          {/* Attributs IA */}
          <div className="bg-purple-500/20 border border-purple-400/50 rounded-xl p-6">
            <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
              <Brain className="w-5 h-5 text-purple-400" />
              Attributs détectés par l'IA
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm text-gray-300 mb-2">Catégorie</label>
                <select
                  value={editedProduct.category}
                  onChange={(e) => setEditedProduct(prev => ({ ...prev, category: e.target.value }))}
                  className="w-full bg-black/40 border border-gray-600 rounded-xl px-3 py-2 text-white"
                >
                  <option value="">Sélectionner...</option>
                  <option value="Canapé">Canapé</option>
                  <option value="Table">Table</option>
                  <option value="Chaise">Chaise</option>
                  <option value="Lit">Lit</option>
                  <option value="Rangement">Rangement</option>
                  <option value="Meuble TV">Meuble TV</option>
                  <option value="Décoration">Décoration</option>
                  <option value="Éclairage">Éclairage</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm text-gray-300 mb-2">Couleur</label>
                <select
                  value={editedProduct.color}
                  onChange={(e) => setEditedProduct(prev => ({ ...prev, color: e.target.value }))}
                  className="w-full bg-black/40 border border-gray-600 rounded-xl px-3 py-2 text-white"
                >
                  <option value="">Sélectionner...</option>
                  <option value="blanc">Blanc</option>
                  <option value="noir">Noir</option>
                  <option value="gris">Gris</option>
                  <option value="beige">Beige</option>
                  <option value="marron">Marron</option>
                  <option value="bleu">Bleu</option>
                  <option value="vert">Vert</option>
                  <option value="rouge">Rouge</option>
                  <option value="chêne">Chêne</option>
                  <option value="noyer">Noyer</option>
                  <option value="taupe">Taupe</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm text-gray-300 mb-2">Matériau</label>
                <select
                  value={editedProduct.material}
                  onChange={(e) => setEditedProduct(prev => ({ ...prev, material: e.target.value }))}
                  className="w-full bg-black/40 border border-gray-600 rounded-xl px-3 py-2 text-white"
                >
                  <option value="">Sélectionner...</option>
                  <option value="bois">Bois</option>
                  <option value="métal">Métal</option>
                  <option value="verre">Verre</option>
                  <option value="tissu">Tissu</option>
                  <option value="cuir">Cuir</option>
                  <option value="velours">Velours</option>
                  <option value="travertin">Travertin</option>
                  <option value="marbre">Marbre</option>
                  <option value="chenille">Chenille</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm text-gray-300 mb-2">Style</label>
                <select
                  value={editedProduct.style}
                  onChange={(e) => setEditedProduct(prev => ({ ...prev, style: e.target.value }))}
                  className="w-full bg-black/40 border border-gray-600 rounded-xl px-3 py-2 text-white"
                >
                  <option value="">Sélectionner...</option>
                  <option value="moderne">Moderne</option>
                  <option value="contemporain">Contemporain</option>
                  <option value="scandinave">Scandinave</option>
                  <option value="industriel">Industriel</option>
                  <option value="vintage">Vintage</option>
                  <option value="classique">Classique</option>
                  <option value="minimaliste">Minimaliste</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm text-gray-300 mb-2">Pièce</label>
                <select
                  value={editedProduct.room}
                  onChange={(e) => setEditedProduct(prev => ({ ...prev, room: e.target.value }))}
                  className="w-full bg-black/40 border border-gray-600 rounded-xl px-3 py-2 text-white"
                >
                  <option value="">Sélectionner...</option>
                  <option value="salon">Salon</option>
                  <option value="chambre">Chambre</option>
                  <option value="cuisine">Cuisine</option>
                  <option value="bureau">Bureau</option>
                  <option value="salle à manger">Salle à manger</option>
                  <option value="entrée">Entrée</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm text-gray-300 mb-2">Dimensions</label>
                <input
                  type="text"
                  value={editedProduct.dimensions}
                  onChange={(e) => setEditedProduct(prev => ({ ...prev, dimensions: e.target.value }))}
                  placeholder="L:200cm x l:100cm x H:75cm"
                  className="w-full bg-black/40 border border-gray-600 rounded-xl px-4 py-3 text-white"
                />
              </div>
            </div>
          </div>

          {/* SEO et Marketing */}
          <div className="bg-cyan-500/20 border border-cyan-400/50 rounded-xl p-6">
            <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-cyan-400" />
              SEO et Marketing IA
            </h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm text-gray-300 mb-2">Titre SEO (≤70 caractères)</label>
                <input
                  type="text"
                  value={editedProduct.seo_title}
                  onChange={(e) => setEditedProduct(prev => ({ ...prev, seo_title: e.target.value }))}
                  maxLength={70}
                  className="w-full bg-black/40 border border-gray-600 rounded-xl px-4 py-3 text-white"
                />
                <div className="text-xs text-gray-400 mt-1">{editedProduct.seo_title.length}/70 caractères</div>
              </div>
              
              <div>
                <label className="block text-sm text-gray-300 mb-2">Description SEO (≤155 caractères)</label>
                <textarea
                  value={editedProduct.seo_description}
                  onChange={(e) => setEditedProduct(prev => ({ ...prev, seo_description: e.target.value }))}
                  maxLength={155}
                  rows={3}
                  className="w-full bg-black/40 border border-gray-600 rounded-xl px-4 py-3 text-white"
                />
                <div className="text-xs text-gray-400 mt-1">{editedProduct.seo_description.length}/155 caractères</div>
              </div>
              
              <div>
                <label className="block text-sm text-gray-300 mb-2">Tags (séparés par des virgules)</label>
                <input
                  type="text"
                  value={editedProduct.tags.join(', ')}
                  onChange={(e) => setEditedProduct(prev => ({ 
                    ...prev, 
                    tags: e.target.value.split(',').map(tag => tag.trim()).filter(Boolean)
                  }))}
                  className="w-full bg-black/40 border border-gray-600 rounded-xl px-4 py-3 text-white"
                />
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex justify-between items-center pt-6 border-t border-slate-600/50">
            <div className="text-sm text-gray-400">
              Confiance actuelle: <span className={`font-bold ${editedProduct.confidence_score >= 80 ? 'text-green-400' : editedProduct.confidence_score >= 60 ? 'text-yellow-400' : 'text-red-400'}`}>
                {editedProduct.confidence_score}%
              </span>
            </div>
            
            <div className="flex gap-3">
              <button
                onClick={onClose}
                className="bg-gray-600 hover:bg-gray-700 text-white px-6 py-3 rounded-xl transition-all"
              >
                Annuler
              </button>
              <button
                onClick={handleSave}
                className="bg-gradient-to-r from-purple-500 to-pink-600 hover:from-purple-400 hover:to-pink-500 text-white px-6 py-3 rounded-xl font-semibold transition-all flex items-center gap-2"
              >
                <Save className="w-4 h-4" />
                Sauvegarder
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// Modal de détails du produit
const ProductDetailModal: React.FC<{
  product: SmartProduct;
  onClose: () => void;
}> = ({ product, onClose }) => {
  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-slate-800/95 backdrop-blur-xl rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto border border-slate-600/50">
        <div className="flex items-center justify-between p-6 border-b border-slate-600/50">
          <h2 className="text-2xl font-bold text-white">Détails du produit enrichi</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-white transition-colors">
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="p-6 space-y-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Image et infos de base */}
            <div>
              <div className="w-full h-80 rounded-2xl overflow-hidden bg-gray-600 mb-6">
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
              
              <div className="space-y-4">
                <div>
                  <h3 className="text-xl font-bold text-white mb-2">{product.title}</h3>
                  <p className="text-gray-300">{product.description}</p>
                </div>
                
                <div className="flex items-center gap-4">
                  <span className="text-2xl font-bold text-green-400">{product.price}€</span>
                  {product.hasPromotion && (
                    <>
                      <span className="text-gray-400 line-through text-lg">{product.compare_at_price}€</span>
                      <span className="bg-red-500/20 text-red-300 px-3 py-1 rounded-full text-sm font-bold">
                        -{product.discountPercentage}%
                      </span>
                    </>
                  )}
                </div>
              </div>
            </div>

            {/* Attributs IA détaillés */}
            <div className="space-y-6">
              <div className="bg-black/20 rounded-xl p-4">
                <h4 className="font-semibold text-white mb-3 flex items-center gap-2">
                  <Brain className="w-5 h-5 text-purple-400" />
                  Attributs IA extraits
                </h4>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-gray-300">Catégorie :</span>
                    <span className="text-white font-semibold">{product.category}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-300">Sous-catégorie :</span>
                    <span className="text-white">{product.subcategory || 'Non définie'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-300">Couleur :</span>
                    <span className="text-pink-400 font-semibold">{product.color || 'Non détectée'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-300">Matériau :</span>
                    <span className="text-green-400 font-semibold">{product.material || 'Non détecté'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-300">Style :</span>
                    <span className="text-purple-400 font-semibold">{product.style || 'Non détecté'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-300">Pièce :</span>
                    <span className="text-cyan-400 font-semibold">{product.room || 'Non définie'}</span>
                  </div>
                  {product.dimensions && (
                    <div className="flex justify-between">
                      <span className="text-gray-300">Dimensions :</span>
                      <span className="text-orange-400 font-semibold">{product.dimensions}</span>
                    </div>
                  )}
                </div>
              </div>

              <div className="bg-black/20 rounded-xl p-4">
                <h4 className="font-semibold text-white mb-3 flex items-center gap-2">
                  <TrendingUp className="w-5 h-5 text-cyan-400" />
                  SEO optimisé IA
                </h4>
                <div className="space-y-3">
                  <div>
                    <span className="text-gray-300 text-sm">Titre SEO :</span>
                    <div className="text-white text-sm mt-1">{product.seo_title}</div>
                  </div>
                  <div>
                    <span className="text-gray-300 text-sm">Description SEO :</span>
                    <div className="text-white text-sm mt-1">{product.seo_description}</div>
                  </div>
                  {product.tags.length > 0 && (
                    <div>
                      <span className="text-gray-300 text-sm">Tags :</span>
                      <div className="flex flex-wrap gap-1 mt-1">
                        {product.tags.map((tag, index) => (
                          <span key={index} className="bg-cyan-500/20 text-cyan-300 px-2 py-1 rounded text-xs">
                            #{tag}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>

              <div className="bg-black/20 rounded-xl p-4">
                <h4 className="font-semibold text-white mb-3 flex items-center gap-2">
                  <Star className="w-5 h-5 text-yellow-400" />
                  Confiance IA
                </h4>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-gray-300">Score global :</span>
                    <span className={`font-bold ${product.confidence_score >= 80 ? 'text-green-400' : product.confidence_score >= 60 ? 'text-yellow-400' : 'text-red-400'}`}>
                      {product.confidence_score}%
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-300">Source :</span>
                    <span className={`px-2 py-1 rounded text-xs ${getEnrichmentSourceColor(product.enrichment_source)}`}>
                      {product.enrichment_source}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-300">Enrichi le :</span>
                    <span className="text-white">{new Date(product.enriched_at).toLocaleDateString('fr-FR')}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="flex justify-end">
            <button
              onClick={onClose}
              className="bg-gray-600 hover:bg-gray-700 text-white px-6 py-3 rounded-xl transition-all"
            >
              Fermer
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};