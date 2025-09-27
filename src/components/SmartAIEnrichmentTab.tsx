import React, { useState, useEffect } from 'react';
import { 
  Brain, Database, Upload, Download, Search, Eye, Sparkles, 
  Loader2, CheckCircle, AlertCircle, BarChart3, Package, 
  Tag, DollarSign, Image, Zap, RefreshCw, Play, FileText,
  TrendingUp, Star, Award, Target, Palette, Wrench
} from 'lucide-react';
import { useNotifications } from './NotificationSystem';

interface EnrichedProduct {
  id: string;
  name: string;
  description: string;
  price: number;
  compare_at_price?: number;
  category: string;
  subcategory?: string;
  vendor: string;
  image_url: string;
  product_url: string;
  stock: number;
  source_platform: string;
  extracted_attributes: any;
  confidence_score: number;
  ai_vision_summary?: string;
  tags?: string[];
  created_at: string;
  updated_at: string;
}

interface ProductPreview {
  id: string;
  name: string;
  description: string;
  price: number;
  compare_at_price?: number;
  category: string;
  subcategory?: string;
  vendor: string;
  image_url: string;
  product_url: string;
  stock: number;
  ai_vision_summary?: string;
  tags?: string[];
  confidence_score?: number;
  relevance_score?: number;
  matched_attributes?: string[];
  ai_reasoning?: string;
}

export const SmartAIEnrichmentTab: React.FC = () => {
  const [enrichedProducts, setEnrichedProducts] = useState<EnrichedProduct[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<ProductPreview[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [isEnrichingAI, setIsEnrichingAI] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedProduct, setSelectedProduct] = useState<EnrichedProduct | null>(null);
  const [showProductModal, setShowProductModal] = useState(false);
  const [isAnalyzingVision, setIsAnalyzingVision] = useState(false);
  const [aiVisionAnalysis, setAiVisionAnalysis] = useState<string>('');
  const { showSuccess, showError, showInfo } = useNotifications();

  useEffect(() => {
    loadEnrichedProducts();
  }, []);

  const loadEnrichedProducts = async () => {
    try {
      setIsLoading(true);
      
      // Charger depuis localStorage ou API
      const savedProducts = localStorage.getItem('enriched_products');
      if (savedProducts) {
        const products = JSON.parse(savedProducts);
        setEnrichedProducts(products);
        console.log('📦 Produits enrichis chargés:', products.length);
      } else {
        console.log('📦 Aucun produit enrichi trouvé');
        setEnrichedProducts([]);
      }
      
    } catch (error) {
      console.error('❌ Erreur chargement produits enrichis:', error);
      showError('Erreur de chargement', 'Impossible de charger les produits enrichis.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleReEnrichAllProducts = async () => {
    if (enrichedProducts.length === 0) {
      showError('Aucun produit', 'Aucun produit à enrichir. Importez d\'abord votre catalogue.');
      return;
    }

    setIsEnrichingAI(true);
    showInfo('Enrichissement IA démarré', `Ré-analyse de ${enrichedProducts.length} produits avec Vision IA automatique...`);

    try {
      const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
      const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

      if (!supabaseUrl || !supabaseKey) {
        throw new Error('Supabase non configuré');
      }

      // Appeler l'enrichissement avancé avec Vision IA
      const response = await fetch(`${supabaseUrl}/functions/v1/advanced-product-enricher`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${supabaseKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          products: enrichedProducts,
          retailer_id: '00000000-0000-0000-0000-000000000000',
          source: 'smart_ai_re_enrichment',
          enable_image_analysis: true,
          batch_size: 5
        }),
      });

      if (response.ok) {
        const result = await response.json();
        console.log('✅ Ré-enrichissement réussi:', result.stats);
        
        // Rafraîchir les données
        await loadEnrichedProducts();
        
        showSuccess(
          'Enrichissement terminé !',
          `${result.stats?.enriched_products || enrichedProducts.length} produits ré-enrichis avec Vision IA !`,
          [
            {
              label: 'Voir les résultats',
              action: () => setSearchQuery('canapé ventu'),
              variant: 'primary'
            }
          ]
        );
      } else {
        const error = await response.json();
        throw new Error(error.details || 'Erreur enrichissement');
      }

    } catch (error) {
      console.error('❌ Erreur ré-enrichissement:', error);
      showError('Erreur d\'enrichissement', error.message || 'Impossible de ré-enrichir les produits.');
    } finally {
      setIsEnrichingAI(false);
    }
  };

  const handleSmartSearch = async () => {
    if (!searchQuery.trim()) return;

    setIsSearching(true);
    setSearchResults([]);

    try {
      const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
      const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

      const response = await fetch(`${supabaseUrl}/functions/v1/ai-smart-search`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${supabaseKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          query: searchQuery,
          limit: 10
        }),
      });

      if (response.ok) {
        const result = await response.json();
        console.log('🔍 Résultats recherche:', result);
        
        const transformedResults = (result.results || []).map((product: any) => ({
          id: product.id,
          name: product.name || product.title,
          description: product.description || '',
          price: product.price || 0,
          compare_at_price: product.compare_at_price,
          category: product.category || 'Mobilier',
          subcategory: product.subcategory || '',
          vendor: product.vendor || 'Boutique',
          image_url: product.image_url || 'https://images.pexels.com/photos/1350789/pexels-photo-1350789.jpeg',
          product_url: product.product_url || '#',
          stock: product.stock || 0,
          ai_vision_summary: product.extracted_attributes?.ai_vision_summary || '',
          tags: product.extracted_attributes?.tags || [],
          confidence_score: product.confidence_score || 0,
          relevance_score: product.relevance_score || 0,
          matched_attributes: product.matched_attributes || [],
          ai_reasoning: product.ai_reasoning || ''
        }));
        
        setSearchResults(transformedResults);
        showSuccess('Recherche terminée', `${transformedResults.length} produits trouvés avec l'IA !`);
      } else {
        const error = await response.json();
        showError('Recherche échouée', 'Erreur lors de la recherche intelligente.');
        console.error('❌ Erreur recherche:', error);
      }

    } catch (error) {
      showError('Erreur de recherche', 'Impossible d\'effectuer la recherche intelligente.');
      console.error('❌ Erreur recherche intelligente:', error);
    } finally {
      setIsSearching(false);
    }
  };

  const handleAnalyzeImage = async (product: EnrichedProduct) => {
    if (!product.image_url || product.image_url === 'https://images.pexels.com/photos/1350789/pexels-photo-1350789.jpeg') {
      showError('Image manquante', 'Aucune image disponible pour l\'analyse Vision IA.');
      return;
    }

    setSelectedProduct(product);
    setShowProductModal(true);
    setIsAnalyzingVision(true);
    setAiVisionAnalysis('');

    try {
      const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
      const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

      if (!supabaseUrl || !supabaseKey) {
        throw new Error('Supabase non configuré');
      }

      const response = await fetch(`${supabaseUrl}/functions/v1/gpt-vision-analyzer`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${supabaseKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          image_url: product.image_url,
          analysis_type: 'product_focused'
        }),
      });

      if (response.ok) {
        const result = await response.json();
        setAiVisionAnalysis(result.analysis || 'Analyse terminée avec succès.');
        showSuccess('Vision IA terminée', 'Analyse de l\'image terminée avec succès !');
      } else {
        const error = await response.json();
        setAiVisionAnalysis(error.fallback_analysis || 'Erreur lors de l\'analyse Vision IA.');
        showError('Erreur Vision IA', 'Impossible d\'analyser l\'image.');
      }

    } catch (error) {
      console.error('❌ Erreur Vision IA:', error);
      setAiVisionAnalysis('Erreur lors de l\'analyse Vision IA.');
      showError('Erreur Vision IA', 'Impossible d\'analyser l\'image.');
    } finally {
      setIsAnalyzingVision(false);
    }
  };

  const calculateDiscount = (price: number, compareAtPrice?: number): number => {
    if (!compareAtPrice || compareAtPrice <= price) return 0;
    return Math.round(((compareAtPrice - price) / compareAtPrice) * 100);
  };

  const sampleQueries = [
    "canapé ventu convertible",
    "table travertin naturel",
    "chaise design contemporain",
    "mobilier scandinave",
    "meubles salon moderne"
  ];

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-cyan-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-white text-lg">Chargement SMART AI...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="text-center">
        <h2 className="text-3xl font-bold text-white mb-4 flex items-center justify-center gap-3">
          <Brain className="w-8 h-8 text-cyan-400" />
          SMART AI - Enrichissement Intelligent
        </h2>
        <p className="text-gray-300 text-lg">
          Catalogue enrichi automatiquement avec Vision IA et extraction d'attributs
        </p>
      </div>

      {/* Stats et Actions */}
      <div className="bg-white/10 backdrop-blur-xl rounded-2xl p-8 border border-white/20">
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
          <div>
            <h3 className="text-xl font-bold text-white mb-2">Catalogue Intelligent</h3>
            <div className="flex items-center gap-6 text-sm">
              <div className="flex items-center gap-2">
                <Package className="w-4 h-4 text-cyan-400" />
                <span className="text-cyan-300">{enrichedProducts.length} produits enrichis</span>
              </div>
              <div className="flex items-center gap-2">
                <Brain className="w-4 h-4 text-purple-400" />
                <span className="text-purple-300">IA + Vision automatique</span>
              </div>
              <div className="flex items-center gap-2">
                <Star className="w-4 h-4 text-yellow-400" />
                <span className="text-yellow-300">
                  {enrichedProducts.length > 0 ? 
                    Math.round(enrichedProducts.reduce((sum, p) => sum + (p.confidence_score || 0), 0) / enrichedProducts.length) : 0
                  }% confiance moyenne
                </span>
              </div>
            </div>
          </div>
          
          <button
            onClick={handleReEnrichAllProducts}
            disabled={isEnrichingAI || enrichedProducts.length === 0}
            className="bg-gradient-to-r from-purple-500 to-pink-600 hover:from-purple-400 hover:to-pink-500 disabled:from-gray-600 disabled:to-gray-700 text-white px-6 py-3 rounded-xl font-semibold transition-all disabled:cursor-not-allowed flex items-center gap-2"
          >
            {isEnrichingAI ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                Enrichissement IA...
              </>
            ) : (
              <>
                <Sparkles className="w-5 h-5" />
                Enrichir avec IA
              </>
            )}
          </button>
        </div>
      </div>

      {/* Recherche Intelligente */}
      <div className="bg-white/10 backdrop-blur-xl rounded-2xl p-8 border border-white/20">
        <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
          <Search className="w-6 h-6 text-cyan-400" />
          Recherche Intelligente
        </h3>

        <div className="space-y-6">
          <div className="flex gap-3">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSmartSearch()}
              placeholder="Ex: canapé ventu convertible, table travertin naturel..."
              className="flex-1 bg-black/40 border border-cyan-500/50 rounded-xl px-4 py-3 text-white placeholder-cyan-400 focus:outline-none focus:border-cyan-400 focus:ring-2 focus:ring-cyan-400/30"
            />
            <button
              onClick={handleSmartSearch}
              disabled={isSearching || !searchQuery.trim()}
              className="bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 disabled:from-gray-600 disabled:to-gray-700 text-white px-6 py-3 rounded-xl font-semibold transition-all disabled:cursor-not-allowed flex items-center gap-2"
            >
              {isSearching ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <Search className="w-5 h-5" />
              )}
              Rechercher
            </button>
          </div>

          {/* Exemples de recherches */}
          <div>
            <p className="text-sm text-gray-400 mb-3">Exemples de recherches intelligentes :</p>
            <div className="flex flex-wrap gap-2">
              {sampleQueries.map((query, index) => (
                <button
                  key={index}
                  onClick={() => setSearchQuery(query)}
                  className="text-xs bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-300 px-3 py-2 rounded-lg border border-cyan-500/30 transition-all"
                >
                  {query}
                </button>
              ))}
            </div>
          </div>

          {/* Résultats de recherche */}
          {searchResults.length > 0 && (
            <div className="space-y-4">
              <h4 className="font-semibold text-white flex items-center gap-2">
                <Target className="w-5 h-5 text-green-400" />
                Résultats trouvés ({searchResults.length})
              </h4>
              <div className="grid gap-6">
                {searchResults.map((result, index) => (
                  <div key={index} className="bg-black/20 rounded-xl p-6 border border-white/10 hover:border-cyan-500/50 transition-all">
                    <div className="flex gap-6">
                      {/* Image du produit */}
                      <div className="w-32 h-32 rounded-xl overflow-hidden bg-gray-600 flex-shrink-0 relative">
                        <img 
                          src={result.image_url} 
                          alt={result.name}
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            const target = e.target as HTMLImageElement;
                            target.src = 'https://images.pexels.com/photos/1350789/pexels-photo-1350789.jpeg';
                          }}
                        />
                        <button
                          onClick={() => {
                            const enrichedProduct: EnrichedProduct = {
                              ...result,
                              extracted_attributes: { ai_vision_summary: result.ai_vision_summary },
                              created_at: new Date().toISOString(),
                              updated_at: new Date().toISOString()
                            };
                            handleAnalyzeImage(enrichedProduct);
                          }}
                          className="absolute top-2 right-2 w-8 h-8 bg-purple-500/80 hover:bg-purple-600 text-white rounded-lg flex items-center justify-center transition-all"
                          title="Analyser avec Vision IA"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                      </div>
                      
                      <div className="flex-1">
                        {/* Titre et catégories */}
                        <div className="flex items-start justify-between mb-3">
                          <div>
                            <h5 className="font-semibold text-white text-lg mb-2">{result.name}</h5>
                            <div className="flex items-center gap-2 mb-2">
                              <span className="bg-blue-500/20 text-blue-300 px-3 py-1 rounded-full text-sm font-medium">
                                {result.category}
                              </span>
                              {result.subcategory && (
                                <span className="bg-purple-500/20 text-purple-300 px-3 py-1 rounded-full text-sm font-medium">
                                  {result.subcategory}
                                </span>
                              )}
                            </div>
                          </div>
                          
                          {/* Prix et promotions */}
                          <div className="text-right">
                            <div className="flex items-center gap-2 mb-1">
                              <span className="text-2xl font-bold text-green-400">{result.price}€</span>
                              {result.compare_at_price && result.compare_at_price > result.price && (
                                <>
                                  <span className="text-gray-400 line-through text-lg">{result.compare_at_price}€</span>
                                  <span className="bg-red-500/20 text-red-300 px-2 py-1 rounded-full text-sm font-bold">
                                    -{calculateDiscount(result.price, result.compare_at_price)}%
                                  </span>
                                </>
                              )}
                            </div>
                            <div className="text-xs text-green-400">
                              Score: {Math.round(result.relevance_score || 0)}%
                            </div>
                          </div>
                        </div>

                        {/* Description */}
                        <p className="text-gray-300 text-sm mb-4 line-clamp-2">{result.description}</p>
                        
                        {/* Tags avec mots-clés */}
                        {result.tags && result.tags.length > 0 && (
                          <div className="mb-4">
                            <h6 className="text-sm font-semibold text-cyan-300 mb-2 flex items-center gap-1">
                              <Tag className="w-4 h-4" />
                              Tags IA ({result.tags.length})
                            </h6>
                            <div className="flex flex-wrap gap-1">
                              {result.tags.map((tag, tagIndex) => (
                                <span key={tagIndex} className="bg-cyan-500/20 text-cyan-300 px-2 py-1 rounded text-xs font-medium">
                                  #{tag}
                                </span>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* Vision IA */}
                        {result.ai_vision_summary && (
                          <div className="bg-purple-500/20 border border-purple-400/30 rounded-xl p-4 mb-4">
                            <h6 className="font-semibold text-purple-200 mb-2 flex items-center gap-2">
                              <Eye className="w-4 h-4" />
                              Synthèse Vision IA
                            </h6>
                            <p className="text-purple-100 text-sm leading-relaxed">
                              {result.ai_vision_summary}
                            </p>
                          </div>
                        )}

                        {/* Attributs correspondants */}
                        {result.matched_attributes && result.matched_attributes.length > 0 && (
                          <div className="flex flex-wrap gap-1 mb-3">
                            {result.matched_attributes.map((attr, attrIndex) => (
                              <span key={attrIndex} className="bg-green-500/20 text-green-300 px-2 py-1 rounded text-xs">
                                ✓ {attr}
                              </span>
                            ))}
                          </div>
                        )}
                        
                        {/* Raisonnement IA */}
                        {result.ai_reasoning && (
                          <p className="text-xs text-blue-300 italic">
                            🤖 {result.ai_reasoning}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Catalogue Enrichi */}
      <div className="bg-white/10 backdrop-blur-xl rounded-2xl p-8 border border-white/20">
        <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
          <Database className="w-6 h-6 text-green-400" />
          Catalogue Enrichi ({enrichedProducts.length} produits)
        </h3>
        
        {enrichedProducts.length === 0 ? (
          <div className="text-center py-12">
            <Package className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h4 className="text-xl font-bold text-white mb-2">Aucun produit enrichi</h4>
            <p className="text-gray-400 mb-6">
              Importez d'abord votre catalogue pour commencer l'enrichissement IA
            </p>
            <button
              onClick={() => window.location.href = '/admin#integration'}
              className="bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-400 hover:to-emerald-500 text-white px-6 py-3 rounded-xl font-semibold transition-all"
            >
              Importer le catalogue
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {enrichedProducts.slice(0, 12).map((product) => (
              <div key={product.id} className="bg-black/20 rounded-xl p-4 border border-white/10 hover:border-cyan-500/50 transition-all hover:scale-105">
                <div className="relative mb-4">
                  <div className="w-full h-48 rounded-xl overflow-hidden bg-gray-600">
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
                  <button
                    onClick={() => handleAnalyzeImage(product)}
                    className="absolute top-2 right-2 w-10 h-10 bg-purple-500/80 hover:bg-purple-600 text-white rounded-xl flex items-center justify-center transition-all hover:scale-110"
                    title="Analyser avec Vision IA"
                  >
                    <Eye className="w-5 h-5" />
                  </button>
                </div>
                
                <h4 className="font-semibold text-white mb-2 line-clamp-2">{product.name}</h4>
                
                {/* Catégories */}
                <div className="flex items-center gap-2 mb-3">
                  <span className="bg-blue-500/20 text-blue-300 px-2 py-1 rounded-full text-xs">
                    {product.category}
                  </span>
                  {product.subcategory && (
                    <span className="bg-purple-500/20 text-purple-300 px-2 py-1 rounded-full text-xs">
                      {product.subcategory}
                    </span>
                  )}
                </div>
                
                {/* Prix et promotions */}
                <div className="flex items-center gap-2 mb-3">
                  <span className="text-xl font-bold text-green-400">{product.price}€</span>
                  {product.compare_at_price && product.compare_at_price > product.price && (
                    <>
                      <span className="text-gray-400 line-through text-sm">{product.compare_at_price}€</span>
                      <span className="bg-red-500/20 text-red-300 px-2 py-1 rounded-full text-xs font-bold">
                        -{calculateDiscount(product.price, product.compare_at_price)}%
                      </span>
                    </>
                  )}
                </div>
                
                {/* Tags avec mots-clés */}
                {product.tags && product.tags.length > 0 && (
                  <div className="mb-3">
                    <div className="flex flex-wrap gap-1">
                      {product.tags.slice(0, 4).map((tag, tagIndex) => (
                        <span key={tagIndex} className="bg-cyan-500/20 text-cyan-300 px-2 py-1 rounded text-xs">
                          #{tag}
                        </span>
                      ))}
                      {product.tags.length > 4 && (
                        <span className="text-xs text-gray-400">+{product.tags.length - 4}</span>
                      )}
                    </div>
                  </div>
                )}
                
                {/* Confiance IA */}
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-400">Confiance IA:</span>
                  <span className={`font-bold ${
                    (product.confidence_score || 0) > 80 ? 'text-green-400' : 
                    (product.confidence_score || 0) > 60 ? 'text-yellow-400' : 'text-red-400'
                  }`}>
                    {product.confidence_score || 0}%
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Modal Vision IA */}
      {showProductModal && selectedProduct && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-800/95 backdrop-blur-xl rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto border border-slate-600/50">
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-slate-600/50">
              <h3 className="text-2xl font-bold text-white flex items-center gap-2">
                <Eye className="w-6 h-6 text-purple-400" />
                Vision IA - {selectedProduct.name}
              </h3>
              <button
                onClick={() => {
                  setShowProductModal(false);
                  setSelectedProduct(null);
                  setAiVisionAnalysis('');
                }}
                className="text-gray-400 hover:text-white transition-colors"
              >
                ×
              </button>
            </div>

            <div className="p-6 space-y-6">
              {/* Image et informations de base */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div>
                  <div className="w-full h-80 rounded-2xl overflow-hidden bg-gray-600 mb-4">
                    <img 
                      src={selectedProduct.image_url} 
                      alt={selectedProduct.name}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        target.src = 'https://images.pexels.com/photos/1350789/pexels-photo-1350789.jpeg';
                      }}
                    />
                  </div>
                  
                  {/* Informations produit */}
                  <div className="bg-black/20 rounded-xl p-4">
                    <h4 className="font-semibold text-white mb-3">📋 Informations produit</h4>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-300">Catégorie :</span>
                        <span className="text-white font-medium">{selectedProduct.category}</span>
                      </div>
                      {selectedProduct.subcategory && (
                        <div className="flex justify-between">
                          <span className="text-gray-300">Sous-catégorie :</span>
                          <span className="text-white font-medium">{selectedProduct.subcategory}</span>
                        </div>
                      )}
                      <div className="flex justify-between">
                        <span className="text-gray-300">Prix :</span>
                        <div className="flex items-center gap-2">
                          <span className="text-green-400 font-bold">{selectedProduct.price}€</span>
                          {selectedProduct.compare_at_price && selectedProduct.compare_at_price > selectedProduct.price && (
                            <>
                              <span className="text-gray-400 line-through text-sm">{selectedProduct.compare_at_price}€</span>
                              <span className="bg-red-500/20 text-red-300 px-2 py-1 rounded-full text-xs">
                                -{calculateDiscount(selectedProduct.price, selectedProduct.compare_at_price)}%
                              </span>
                            </>
                          )}
                        </div>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-300">Stock :</span>
                        <span className="text-white font-medium">{selectedProduct.stock}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-300">Confiance IA :</span>
                        <span className={`font-bold ${
                          selectedProduct.confidence_score > 80 ? 'text-green-400' : 
                          selectedProduct.confidence_score > 60 ? 'text-yellow-400' : 'text-red-400'
                        }`}>
                          {selectedProduct.confidence_score}%
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="space-y-6">
                  {/* Vision IA */}
                  <div className="bg-purple-500/20 border border-purple-400/50 rounded-xl p-6">
                    <div className="flex items-center justify-between mb-4">
                      <h4 className="font-semibold text-purple-200 flex items-center gap-2">
                        <Eye className="w-5 h-5" />
                        Synthèse Vision IA
                      </h4>
                      <button
                        onClick={() => handleAnalyzeImage(selectedProduct)}
                        disabled={isAnalyzingVision}
                        className="bg-purple-600 hover:bg-purple-700 disabled:bg-purple-800 text-white px-3 py-2 rounded-lg text-sm font-medium transition-all disabled:cursor-not-allowed flex items-center gap-2"
                      >
                        {isAnalyzingVision ? (
                          <>
                            <Loader2 className="w-4 h-4 animate-spin" />
                            Analyse...
                          </>
                        ) : (
                          <>
                            <RefreshCw className="w-4 h-4" />
                            Analyser
                          </>
                        )}
                      </button>
                    </div>
                    
                    {isAnalyzingVision ? (
                      <div className="text-center py-8">
                        <Loader2 className="w-8 h-8 text-purple-400 animate-spin mx-auto mb-3" />
                        <p className="text-purple-300">Analyse de l'image en cours...</p>
                        <p className="text-purple-400 text-sm">OpenAI Vision analyse le produit</p>
                      </div>
                    ) : aiVisionAnalysis ? (
                      <div className="bg-black/20 rounded-lg p-4">
                        <p className="text-purple-100 text-sm leading-relaxed whitespace-pre-wrap">
                          {aiVisionAnalysis}
                        </p>
                      </div>
                    ) : selectedProduct.ai_vision_summary ? (
                      <div className="bg-black/20 rounded-lg p-4">
                        <p className="text-purple-100 text-sm leading-relaxed">
                          {selectedProduct.ai_vision_summary}
                        </p>
                      </div>
                    ) : (
                      <div className="text-center py-6">
                        <Image className="w-12 h-12 text-purple-400 mx-auto mb-3" />
                        <p className="text-purple-300">Aucune analyse Vision IA disponible</p>
                        <p className="text-purple-400 text-sm">Cliquez sur "Analyser" pour démarrer</p>
                      </div>
                    )}
                  </div>

                  {/* Tags avec mots-clés */}
                  {selectedProduct.tags && selectedProduct.tags.length > 0 && (
                    <div className="bg-cyan-500/20 border border-cyan-400/50 rounded-xl p-4">
                      <h4 className="font-semibold text-cyan-200 mb-3 flex items-center gap-2">
                        <Tag className="w-5 h-5" />
                        Tags IA ({selectedProduct.tags.length})
                      </h4>
                      <div className="flex flex-wrap gap-2">
                        {selectedProduct.tags.map((tag, index) => (
                          <span key={index} className="bg-cyan-600/30 text-cyan-200 px-3 py-1 rounded-full text-sm font-medium">
                            #{tag}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Attributs IA */}
                  {selectedProduct.extracted_attributes && (
                    <div className="bg-blue-500/20 border border-blue-400/50 rounded-xl p-4">
                      <h4 className="font-semibold text-blue-200 mb-3 flex items-center gap-2">
                        <Brain className="w-5 h-5" />
                        Attributs IA Extraits
                      </h4>
                      <div className="space-y-3 text-sm">
                        {selectedProduct.extracted_attributes.colors && selectedProduct.extracted_attributes.colors.length > 0 && (
                          <div>
                            <span className="text-blue-300 font-medium">🎨 Couleurs :</span>
                            <div className="flex flex-wrap gap-1 mt-1">
                              {selectedProduct.extracted_attributes.colors.map((color: string, index: number) => (
                                <span key={index} className="bg-pink-500/20 text-pink-300 px-2 py-1 rounded text-xs">
                                  {color}
                                </span>
                              ))}
                            </div>
                          </div>
                        )}
                        
                        {selectedProduct.extracted_attributes.materials && selectedProduct.extracted_attributes.materials.length > 0 && (
                          <div>
                            <span className="text-blue-300 font-medium">🏗️ Matériaux :</span>
                            <div className="flex flex-wrap gap-1 mt-1">
                              {selectedProduct.extracted_attributes.materials.map((material: string, index: number) => (
                                <span key={index} className="bg-green-500/20 text-green-300 px-2 py-1 rounded text-xs">
                                  {material}
                                </span>
                              ))}
                            </div>
                          </div>
                        )}
                        
                        {selectedProduct.extracted_attributes.styles && selectedProduct.extracted_attributes.styles.length > 0 && (
                          <div>
                            <span className="text-blue-300 font-medium">✨ Styles :</span>
                            <div className="flex flex-wrap gap-1 mt-1">
                              {selectedProduct.extracted_attributes.styles.map((style: string, index: number) => (
                                <span key={index} className="bg-purple-500/20 text-purple-300 px-2 py-1 rounded text-xs">
                                  {style}
                                </span>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Informations sur l'enrichissement */}
      <div className="bg-gradient-to-r from-cyan-500/20 to-blue-600/20 backdrop-blur-xl rounded-2xl p-6 border border-cyan-400/30">
        <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
          <Zap className="w-5 h-5 text-cyan-400" />
          Capacités SMART AI
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h4 className="font-semibold text-cyan-300 mb-2">🎯 Extraction automatique :</h4>
            <ul className="text-sm text-gray-300 space-y-1">
              <li>• Catégories et sous-catégories précises</li>
              <li>• Couleurs, matériaux, styles détectés</li>
              <li>• Tags extraits du titre et description</li>
              <li>• Prix et promotions calculés</li>
              <li>• Vision IA pour analyse visuelle</li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold text-cyan-300 mb-2">🔍 Vision IA focus produit :</h4>
            <ul className="text-sm text-gray-300 space-y-1">
              <li>• Analyse visuelle du produit uniquement</li>
              <li>• Détection couleurs et matériaux réels</li>
              <li>• Évaluation qualité et finitions</li>
              <li>• Identification fonctionnalités visibles</li>
              <li>• Synthèse descriptive professionnelle</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};