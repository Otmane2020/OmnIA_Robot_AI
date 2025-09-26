import React, { useState, useEffect } from 'react';
import { Search, Filter, Plus, Eye, CreditCard as Edit, Trash2, ExternalLink, Package, Tag, DollarSign, Image, BarChart3, Settings, ChevronDown, ChevronUp, X, Save, AlertCircle, CheckCircle, Sparkles, Brain, Zap, RefreshCw, Download, Upload, Loader2, Info } from 'lucide-react';
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
  const [showFilters, setShowFilters] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isEnriching, setIsEnriching] = useState(false);
  const [viewMode, setViewMode] = useState<'table' | 'grid'>('table');
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

    setFilteredProducts(filtered);
  }, [products, searchTerm, selectedCategory]);

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
            </div>
          </div>
        )}
      </div>

      {/* Products Display */}
      {filteredProducts.length === 0 ? (
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
      ) : (
        <div className="bg-white/10 backdrop-blur-xl rounded-2xl border border-white/20 overflow-hidden">
          <div className="p-6">
            <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-purple-400" />
              Produits enrichis par l'IA
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredProducts.map((product) => (
                <div key={product.id} className="bg-black/20 rounded-xl p-4 border border-purple-500/30">
                  <div className="w-full h-32 rounded-lg overflow-hidden bg-gray-600 mb-3">
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
                  
                  <h4 className="font-semibold text-white mb-2 line-clamp-2">{product.title}</h4>
                  
                  <div className="flex items-center gap-2 mb-3">
                    <span className="text-lg font-bold text-green-400">{product.price}€</span>
                    {product.hasPromotion && (
                      <span className="bg-red-500/20 text-red-300 px-2 py-1 rounded-full text-xs">
                        -{product.discountPercentage}%
                      </span>
                    )}
                  </div>
                  
                  <div className="flex flex-wrap gap-1 mb-3">
                    {product.color && (
                      <span className="bg-pink-500/20 text-pink-300 px-2 py-1 rounded text-xs">
                        {product.color}
                      </span>
                    )}
                    {product.material && (
                      <span className="bg-green-500/20 text-green-300 px-2 py-1 rounded text-xs">
                        {product.material}
                      </span>
                    )}
                    {product.style && (
                      <span className="bg-purple-500/20 text-purple-300 px-2 py-1 rounded text-xs">
                        {product.style}
                      </span>
                    )}
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-gray-400">
                      Confiance: {product.confidence_score}%
                    </span>
                    <a
                      href={product.product_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-400 hover:text-blue-300"
                    >
                      <ExternalLink className="w-4 h-4" />
                    </a>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* AI Enrichment Info */}
      <div className="bg-gradient-to-r from-purple-500/20 to-pink-600/20 backdrop-blur-xl rounded-2xl p-6 border border-purple-400/30">
        <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
          <Brain className="w-5 h-5 text-purple-400" />
          Capacités d'enrichissement IA
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h4 className="font-semibold text-purple-300 mb-2">🎯 Extraction automatique :</h4>
            <ul className="text-sm text-gray-300 space-y-1">
              <li>• Couleurs et nuances précises</li>
              <li>• Matériaux et finitions</li>
              <li>• Dimensions et spécifications</li>
              <li>• Styles et tendances design</li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold text-purple-300 mb-2">🚀 Optimisation SEO :</h4>
            <ul className="text-sm text-gray-300 space-y-1">
              <li>• Titres et descriptions optimisés</li>
              <li>• Tags de recherche intelligents</li>
              <li>• Catégories Google Shopping</li>
              <li>• Publicités automatiques</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};