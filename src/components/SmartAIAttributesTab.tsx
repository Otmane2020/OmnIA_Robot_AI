import React, { useState, useEffect } from 'react';
import { 
  Brain, Zap, RefreshCw, Loader2, CheckCircle, AlertCircle, 
  Search, Filter, Eye, Edit, Trash2, ExternalLink, 
  Package, Tag, DollarSign, Image, BarChart3, Settings,
  ChevronDown, ChevronUp, X, Save, Upload, Download,
  Sparkles, Database, Globe, Star, TrendingUp
} from 'lucide-react';
import { useNotifications } from './NotificationSystem';
import { supabase } from '../lib/supabase';

interface SmartAIProduct {
  id: string;
  handle: string;
  retailer_id: string;
  title: string;
  description: string;
  short_description: string;
  product_type: string;
  subcategory: string;
  tags: string[];
  brand: string;
  vendor: string;
  material: string;
  color: string;
  style: string;
  room: string;
  dimensions: string;
  weight: string;
  capacity: string;
  price: number;
  compare_at_price?: number;
  currency: string;
  stock_quantity: number;
  availability_status: string;
  gtin: string;
  mpn: string;
  identifier_exists: boolean;
  stock_qty: number;
  image_url: string;
  additional_image_links: string[];
  product_url: string;
  canonical_link: string;
  percent_off: number;
  ai_confidence: number;
  created_at: string;
  updated_at: string;
}

export const SmartAIAttributesTab: React.FC = () => {
  const [products, setProducts] = useState<SmartAIProduct[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<SmartAIProduct[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [loading, setLoading] = useState(true);
  const [isEnriching, setIsEnriching] = useState(false);
  const [enrichmentProgress, setEnrichmentProgress] = useState(0);
  const [showSyncModal, setShowSyncModal] = useState(false);
  const [syncStats, setSyncStats] = useState<any>(null);
  const [currentUser, setCurrentUser] = useState(() => {
    const loggedUser = localStorage.getItem('current_logged_user');
    if (loggedUser) {
      try {
        return JSON.parse(loggedUser);
      } catch {
        return null;
      }
    }
    return null;
  });

  const { showSuccess, showError, showInfo } = useNotifications();

  useEffect(() => {
    loadSmartAIProducts();
  }, []);

  useEffect(() => {
    filterProducts();
  }, [products, searchTerm, selectedCategory]);

  const filterProducts = () => {
    let filtered = products;

    if (searchTerm) {
      filtered = filtered.filter(product =>
        product.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.product_type.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.material?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.color?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.style?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.room?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (selectedCategory !== 'all') {
      filtered = filtered.filter(product => product.product_type === selectedCategory);
    }

    setFilteredProducts(filtered);
  };

  const loadSmartAIProducts = async () => {
    try {
      setLoading(true);
      
      // Charger depuis Supabase products_enriched
      const { data: enrichedProducts, error } = await supabase
        .from('products_enriched')
        .select('*')
        .gt('stock_qty', 0)
        .order('updated_at', { ascending: false });

      if (error) {
        console.error('❌ Erreur chargement Supabase:', error);
        setProducts([]);
        return;
      }

      if (enrichedProducts && enrichedProducts.length > 0) {
        console.log(`✅ Produits SMART AI chargés:`, enrichedProducts.length);
        setProducts(enrichedProducts);
      } else {
        console.log(`📦 Aucun produit SMART AI trouvé`);
        setProducts([]);
      }
      
    } catch (error) {
      console.error('❌ Erreur:', error);
      showError('Erreur', 'Erreur lors du chargement des produits SMART AI.');
      setProducts([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSyncWithCatalog = async () => {
    try {
      const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
      const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
      
      if (!supabaseUrl || !supabaseKey) {
        showError('Configuration manquante', 'Supabase non configuré. Cliquez sur "Connect to Supabase" en haut à droite.');
        return;
      }

      // Récupérer les produits du catalogue local
      const catalogProducts = localStorage.getItem('catalog_products');
      if (!catalogProducts) {
        showError('Catalogue vide', 'Aucun produit trouvé dans le catalogue. Importez d\'abord votre catalogue.');
        return;
      }

      const products = JSON.parse(catalogProducts);
      console.log(`📦 Synchronisation SMART AI pour ${products.length} produits...`);

      setShowSyncModal(true);
      showInfo('Synchronisation démarrée', 'Enrichissement des produits avec DeepSeek IA...');
      
      // Appeler la fonction d'enrichissement Supabase
      const response = await fetch(`${supabaseUrl}/functions/v1/enrich-products`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${supabaseKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          products: products,
          source: 'smart_ai_sync',
          retailer_id: currentUser?.email || 'demo-retailer-id'
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('❌ Erreur enrichissement:', errorText);
        throw new Error('Erreur lors de l\'enrichissement avec DeepSeek');
      }

      const result = await response.json();
      console.log('✅ Enrichissement SMART AI réussi:', result.stats);
      
      // Recharger les produits depuis Supabase
      await loadSmartAIProducts();
      
      setSyncStats(result.stats);
      
      showSuccess(
        'Synchronisation SMART AI terminée !', 
        `${result.stats?.enriched_count || products.length} produits enrichis avec tous les attributs IA !`,
        [
          {
            label: 'Voir les résultats',
            action: () => loadSmartAIProducts(),
            variant: 'primary'
          }
        ]
      );

    } catch (error) {
      console.error('❌ Erreur synchronisation SMART AI:', error);
      showError('Erreur de synchronisation', 'Impossible de synchroniser avec le catalogue.');
    } finally {
      setShowSyncModal(false);
    }
  };

  const handleEnrichWithDeepSeek = async () => {
    try {
      const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
      const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
      
      if (!supabaseUrl || !supabaseKey) {
        showError('Configuration manquante', 'Supabase non configuré.');
        return;
      }

      setIsEnriching(true);
      setEnrichmentProgress(0);
      
      showInfo('Enrichissement démarré', 'Analyse avancée des produits avec DeepSeek IA...');

      // Simuler progression
      const progressInterval = setInterval(() => {
        setEnrichmentProgress(prev => Math.min(prev + 10, 90));
      }, 500);

      // Récupérer les produits existants pour ré-enrichissement
      const { data: existingProducts } = await supabase
        .from('products_enriched')
        .select('*')
        .limit(100);

      if (!existingProducts || existingProducts.length === 0) {
        clearInterval(progressInterval);
        showError('Aucun produit', 'Aucun produit à enrichir. Synchronisez d\'abord avec le catalogue.');
        setIsEnriching(false);
        return;
      }

      // Appeler la fonction d'enrichissement avancé
      const response = await fetch(`${supabaseUrl}/functions/v1/enrich-products`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${supabaseKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          products: existingProducts,
          source: 'smart_ai_advanced',
          retailer_id: currentUser?.email || 'demo-retailer-id',
          advanced_enrichment: true
        }),
      });

      clearInterval(progressInterval);
      setEnrichmentProgress(100);

      if (!response.ok) {
        const errorText = await response.text();
        console.error('❌ Erreur enrichissement avancé:', errorText);
        throw new Error('Erreur lors de l\'enrichissement avancé');
      }

      const result = await response.json();
      console.log('✅ Enrichissement avancé réussi:', result.stats);
      
      // Recharger les produits
      await loadSmartAIProducts();
      
      showSuccess(
        'Enrichissement avancé terminé !', 
        `${result.stats?.enriched_count || existingProducts.length} produits enrichis avec tous les attributs SMART AI !`
      );

    } catch (error) {
      console.error('❌ Erreur enrichissement avancé:', error);
      showError('Erreur d\'enrichissement', 'Impossible d\'enrichir les produits avec DeepSeek.');
    } finally {
      setIsEnriching(false);
      setEnrichmentProgress(0);
    }
  };

  const handleExportSmartAI = () => {
    if (products.length === 0) {
      showError('Aucun produit', 'Aucun produit à exporter.');
      return;
    }

    // Créer le CSV avec tous les champs SMART AI
    const headers = [
      'id', 'handle', 'title', 'description', 'short_description', 'product_type', 'subcategory',
      'tags', 'brand', 'vendor', 'material', 'color', 'style', 'room', 'dimensions', 'weight',
      'capacity', 'price', 'compare_at_price', 'currency', 'stock_quantity', 'availability_status',
      'gtin', 'mpn', 'identifier_exists', 'image_url', 'additional_image_links', 'product_url',
      'canonical_link', 'percent_off', 'ai_confidence', 'created_at', 'updated_at'
    ];

    const csvContent = [
      headers.join(','),
      ...products.map(product => 
        headers.map(header => {
          const value = product[header as keyof SmartAIProduct];
          if (Array.isArray(value)) {
            return `"${value.join(';')}"`;
          }
          if (typeof value === 'string' && value.includes(',')) {
            return `"${value}"`;
          }
          return value || '';
        }).join(',')
      )
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `smart-ai-attributes-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);

    showSuccess('Export réussi', `${products.length} produits SMART AI exportés en CSV.`);
  };

  const categories = [...new Set(products.map(p => p.product_type))].filter(Boolean);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="text-center">
          <Loader2 className="w-16 h-16 text-cyan-400 animate-spin mx-auto mb-4" />
          <p className="text-white text-lg">Chargement des attributs SMART AI...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header avec actions */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-white flex items-center gap-3">
            <Brain className="w-8 h-8 text-purple-400" />
            SMART AI Attributes
          </h2>
          <p className="text-gray-300">Catalogue enrichi avec 30 attributs IA optimisés pour Google Merchant & SEO</p>
          <p className="text-cyan-300 text-sm">{filteredProducts.length} produit(s) enrichi(s) sur {products.length}</p>
        </div>
        
        <div className="flex flex-wrap gap-3">
          <button
            onClick={handleSyncWithCatalog}
            className="bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-400 hover:to-emerald-500 text-white px-6 py-3 rounded-xl flex items-center gap-2 font-semibold transition-all"
          >
            <Database className="w-5 h-5" />
            Synchroniser Catalogue
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
            onClick={handleExportSmartAI}
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-xl flex items-center gap-2 transition-all"
          >
            <Download className="w-5 h-5" />
            Export CSV
          </button>
          
          <button
            onClick={loadSmartAIProducts}
            className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-3 rounded-xl flex items-center gap-2 transition-all"
          >
            <RefreshCw className="w-4 h-4" />
            Actualiser
          </button>
        </div>
      </div>

      {/* Informations SMART AI */}
      <div className="bg-gradient-to-r from-purple-500/20 to-pink-600/20 backdrop-blur-xl rounded-2xl p-6 border border-purple-400/30">
        <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-purple-400" />
          30 Attributs SMART AI Optimisés
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div>
            <h4 className="font-semibold text-purple-300 mb-2">🎯 SEO & Marketing :</h4>
            <ul className="text-purple-200 text-sm space-y-1">
              <li>• Titre SEO optimisé (60 caractères)</li>
              <li>• Meta description vendeuse (155 caractères)</li>
              <li>• Description courte Google Ads</li>
              <li>• Tags enrichis pour référencement</li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold text-purple-300 mb-2">🛍️ Google Merchant :</h4>
            <ul className="text-purple-200 text-sm space-y-1">
              <li>• GTIN / Code-barres automatique</li>
              <li>• MPN référence fabricant</li>
              <li>• Catégorie Google Shopping</li>
              <li>• Images multiples (jusqu'à 10)</li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold text-purple-300 mb-2">🤖 Attributs IA :</h4>
            <ul className="text-purple-200 text-sm space-y-1">
              <li>• Couleur, matériau, style détectés</li>
              <li>• Dimensions, poids, capacité</li>
              <li>• Pièce de destination optimale</li>
              <li>• Score de confiance IA (0-100%)</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Progression enrichissement */}
      {isEnriching && (
        <div className="bg-purple-500/20 border border-purple-400/50 rounded-xl p-6">
          <div className="flex items-center gap-3 mb-4">
            <Brain className="w-6 h-6 text-purple-400" />
            <h3 className="text-lg font-bold text-white">Enrichissement SMART AI en cours...</h3>
          </div>
          <div className="w-full bg-gray-700 rounded-full h-3 mb-2">
            <div 
              className="bg-gradient-to-r from-purple-500 to-pink-500 h-3 rounded-full transition-all duration-500" 
              style={{ width: `${enrichmentProgress}%` }}
            ></div>
          </div>
          <p className="text-purple-300 text-sm">{enrichmentProgress}% - Extraction de 30 attributs par produit avec DeepSeek</p>
        </div>
      )}

      {/* Barre de recherche et filtres */}
      <div className="bg-white/10 backdrop-blur-xl rounded-2xl p-6 border border-white/20">
        <div className="flex flex-col lg:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Rechercher par titre, catégorie, matériau, couleur, style..."
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

      {/* Tableau SMART AI */}
      {products.length === 0 ? (
        <div className="text-center py-20">
          <Brain className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-xl font-bold text-white mb-2">Aucun produit SMART AI</h3>
          <p className="text-gray-400 mb-6">
            Synchronisez votre catalogue pour créer les attributs SMART AI.
          </p>
          <button
            onClick={handleSyncWithCatalog}
            className="bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-400 hover:to-emerald-500 text-white px-6 py-3 rounded-xl font-semibold transition-all"
          >
            Synchroniser le catalogue
          </button>
        </div>
      ) : (
        <div className="bg-white/10 backdrop-blur-xl rounded-2xl border border-white/20 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-black/20">
                <tr>
                  <th className="text-left p-4 text-purple-300 font-semibold">Produit</th>
                  <th className="text-left p-4 text-purple-300 font-semibold">SEO Optimisé</th>
                  <th className="text-left p-4 text-purple-300 font-semibold">Attributs IA</th>
                  <th className="text-left p-4 text-purple-300 font-semibold">Google Merchant</th>
                  <th className="text-left p-4 text-purple-300 font-semibold">Prix & Stock</th>
                  <th className="text-left p-4 text-purple-300 font-semibold">Confiance IA</th>
                  <th className="text-left p-4 text-purple-300 font-semibold">Actions</th>
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
                          <div className="font-semibold text-white text-sm line-clamp-2">{product.title}</div>
                          <div className="text-gray-400 text-xs">{product.vendor}</div>
                          <div className="text-purple-400 text-xs">Handle: {product.handle}</div>
                          <div className="text-cyan-400 text-xs">ID: {product.id.substring(0, 8)}...</div>
                        </div>
                      </div>
                    </td>
                    <td className="p-4">
                      <div className="space-y-2">
                        <div>
                          <div className="text-white font-semibold text-xs mb-1">SEO Title:</div>
                          <div className="text-gray-300 text-xs line-clamp-2 bg-black/20 rounded p-2">
                            {product.seo_title || product.title || 'Non défini'}
                          </div>
                        </div>
                        <div>
                          <div className="text-white font-semibold text-xs mb-1">Meta Description:</div>
                          <div className="text-gray-300 text-xs line-clamp-3 bg-black/20 rounded p-2">
                            {product.seo_description || 'Non définie'}
                          </div>
                        </div>
                        <div>
                          <div className="text-white font-semibold text-xs mb-1">Description Courte:</div>
                          <div className="text-gray-300 text-xs line-clamp-2 bg-black/20 rounded p-2">
                            {product.short_description || 'Non définie'}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="p-4">
                      <div className="space-y-1">
                        <div className="text-white text-xs font-semibold mb-2">Catégorie:</div>
                        <div className="bg-blue-500/20 text-blue-300 px-2 py-1 rounded text-xs mb-1">
                          {product.product_type}
                        </div>
                        {product.subcategory && (
                          <div className="bg-cyan-500/20 text-cyan-300 px-2 py-1 rounded text-xs mb-1">
                            {product.subcategory}
                          </div>
                        )}
                        
                        <div className="space-y-1 mt-2">
                          {product.material && (
                            <span className="inline-block bg-green-500/20 text-green-300 px-2 py-1 rounded text-xs mr-1">
                              🏗️ {product.material}
                            </span>
                          )}
                          {product.color && (
                            <span className="inline-block bg-blue-500/20 text-blue-300 px-2 py-1 rounded text-xs mr-1">
                              🎨 {product.color}
                            </span>
                          )}
                          {product.style && (
                            <span className="inline-block bg-purple-500/20 text-purple-300 px-2 py-1 rounded text-xs mr-1">
                              ✨ {product.style}
                            </span>
                          )}
                          {product.room && (
                            <span className="inline-block bg-orange-500/20 text-orange-300 px-2 py-1 rounded text-xs mr-1">
                              🏠 {product.room}
                            </span>
                          )}
                        </div>
                        
                        {product.dimensions && (
                          <div className="text-gray-300 text-xs mt-1">📏 {product.dimensions}</div>
                        )}
                        {product.weight && (
                          <div className="text-gray-300 text-xs">⚖️ {product.weight}</div>
                        )}
                        {product.capacity && (
                          <div className="text-gray-300 text-xs">👥 {product.capacity}</div>
                        )}
                      </div>
                    </td>
                    <td className="p-4">
                      <div className="space-y-2">
                        <div>
                          <div className="text-white text-xs font-semibold">GTIN:</div>
                          <div className="text-cyan-400 text-xs font-mono">
                            {product.gtin || 'Auto-généré'}
                          </div>
                        </div>
                        <div>
                          <div className="text-white text-xs font-semibold">MPN:</div>
                          <div className="text-purple-400 text-xs">
                            {product.mpn || 'N/A'}
                          </div>
                        </div>
                        <div>
                          <div className="text-white text-xs font-semibold">Identifiant:</div>
                          <div className={`text-xs ${product.identifier_exists ? 'text-green-400' : 'text-red-400'}`}>
                            {product.identifier_exists ? '✅ Oui' : '❌ Non'}
                          </div>
                        </div>
                        <div>
                          <div className="text-white text-xs font-semibold">Images:</div>
                          <div className="text-gray-300 text-xs">
                            {1 + (product.additional_image_links?.length || 0)} image(s)
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="p-4">
                      <div className="space-y-2">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-green-400">{product.price}€</span>
                          {product.compare_at_price && product.compare_at_price > product.price && (
                            <>
                              <span className="text-gray-400 line-through text-sm">{product.compare_at_price}€</span>
                              {product.percent_off > 0 && (
                                <span className="bg-red-500/20 text-red-300 px-2 py-1 rounded text-xs">
                                  -{product.percent_off}%
                                </span>
                              )}
                            </>
                          )}
                        </div>
                        <div className="text-gray-400 text-xs">{product.currency}</div>
                        <div className="flex items-center gap-2">
                          <div className={`w-2 h-2 rounded-full ${product.stock_quantity > 0 ? 'bg-green-400' : 'bg-red-400'}`}></div>
                          <span className={`font-semibold text-xs ${product.stock_quantity > 0 ? 'text-green-400' : 'text-red-400'}`}>
                            {product.stock_quantity} en stock
                          </span>
                        </div>
                        <div className="text-gray-300 text-xs">{product.availability_status}</div>
                      </div>
                    </td>
                    <td className="p-4">
                      <div className="flex items-center gap-2">
                        <div className={`w-3 h-3 rounded-full ${
                          (product.ai_confidence * 100) >= 80 ? 'bg-green-400' :
                          (product.ai_confidence * 100) >= 60 ? 'bg-yellow-400' :
                          'bg-red-400'
                        }`}></div>
                        <span className="text-white text-sm font-bold">
                          {Math.round((product.ai_confidence || 0) * 100)}%
                        </span>
                      </div>
                      <div className="text-xs text-gray-400 mt-1">
                        {(product.ai_confidence * 100) >= 80 ? 'Excellent' :
                         (product.ai_confidence * 100) >= 60 ? 'Bon' :
                         'À améliorer'}
                      </div>
                      <div className="text-xs text-purple-400 mt-1">
                        DeepSeek IA
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

      {/* Stats SMART AI */}
      {products.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="bg-purple-600/20 backdrop-blur-xl rounded-2xl p-6 border border-purple-500/30">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-purple-200 text-sm mb-1">Produits SMART AI</p>
                <p className="text-3xl font-bold text-white">{products.length}</p>
              </div>
              <Brain className="w-10 h-10 text-purple-400" />
            </div>
          </div>
          
          <div className="bg-green-600/20 backdrop-blur-xl rounded-2xl p-6 border border-green-500/30">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-green-200 text-sm mb-1">Confiance Moyenne</p>
                <p className="text-3xl font-bold text-white">
                  {products.length > 0 ? Math.round(products.reduce((sum, p) => sum + (p.ai_confidence * 100), 0) / products.length) : 0}%
                </p>
              </div>
              <CheckCircle className="w-10 h-10 text-green-400" />
            </div>
          </div>
          
          <div className="bg-blue-600/20 backdrop-blur-xl rounded-2xl p-6 border border-blue-500/30">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-blue-200 text-sm mb-1">Catégories</p>
                <p className="text-3xl font-bold text-white">{categories.length}</p>
              </div>
              <Tag className="w-10 h-10 text-blue-400" />
            </div>
          </div>
          
          <div className="bg-orange-600/20 backdrop-blur-xl rounded-2xl p-6 border border-orange-500/30">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-orange-200 text-sm mb-1">En Stock</p>
                <p className="text-3xl font-bold text-white">
                  {products.filter(p => p.stock_quantity > 0).length}
                </p>
              </div>
              <Package className="w-10 h-10 text-orange-400" />
            </div>
          </div>
        </div>
      )}

      {/* Modal de synchronisation */}
      {showSyncModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-800/95 backdrop-blur-xl rounded-2xl p-6 max-w-md w-full border border-slate-600/50">
            <div className="text-center">
              <Brain className="w-16 h-16 text-purple-400 mx-auto mb-4 animate-pulse" />
              <h3 className="text-xl font-bold text-white mb-2">Synchronisation SMART AI</h3>
              <p className="text-purple-300 mb-4">
                Enrichissement des produits avec 30 attributs IA...
              </p>
              <div className="space-y-2">
                <div className="flex items-center justify-center gap-2 text-cyan-300">
                  <div className="w-2 h-2 bg-cyan-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                  <div className="w-2 h-2 bg-cyan-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                  <div className="w-2 h-2 bg-cyan-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                </div>
                <p className="text-sm text-gray-400">Analyse DeepSeek en cours...</p>
                <p className="text-sm text-gray-400">Extraction SEO, Google Merchant, attributs IA...</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};