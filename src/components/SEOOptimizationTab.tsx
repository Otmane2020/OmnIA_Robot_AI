import React, { useState, useEffect } from 'react';
import { Search, TrendingUp, Eye, Edit, Save, RefreshCw, BarChart3, Globe, Target, Zap, CheckCircle, AlertCircle } from 'lucide-react';
import { useNotifications } from './NotificationSystem';

interface SEOOptimizationTabProps {
  retailerId?: string;
}

interface SEOProduct {
  id: string;
  title: string;
  seo_title: string;
  seo_description: string;
  current_title_length: number;
  current_description_length: number;
  seo_score: number;
  missing_keywords: string[];
  optimization_suggestions: string[];
  google_category: string;
  search_volume: number;
  competition: 'low' | 'medium' | 'high';
}

export const SEOOptimizationTab: React.FC<SEOOptimizationTabProps> = ({ retailerId }) => {
  const [products, setProducts] = useState<SEOProduct[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isOptimizing, setIsOptimizing] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<SEOProduct | null>(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [seoStats, setSeoStats] = useState<any>(null);
  const { showSuccess, showError, showInfo } = useNotifications();

  useEffect(() => {
    loadSEOData();
  }, [retailerId]);

  const loadSEOData = async () => {
    try {
      setIsLoading(true);
      
      // Charger les produits enrichis pour analyse SEO
      const enrichedProducts = localStorage.getItem('products_enriched');
      if (enrichedProducts) {
        const products = JSON.parse(enrichedProducts);
        const seoAnalyzedProducts = products.map(analyzeSEOProduct);
        setProducts(seoAnalyzedProducts);
        
        // Calculer les statistiques SEO
        const stats = calculateSEOStats(seoAnalyzedProducts);
        setSeoStats(stats);
      }
      
    } catch (error) {
      console.error('❌ Erreur chargement SEO:', error);
      showError('Erreur SEO', 'Impossible de charger les données SEO.');
    } finally {
      setIsLoading(false);
    }
  };

  const analyzeSEOProduct = (product: any): SEOProduct => {
    const title = product.seo_title || product.title || '';
    const description = product.seo_description || '';
    
    // Analyser la qualité SEO
    const seoScore = calculateSEOScore(title, description, product);
    const missingKeywords = findMissingKeywords(product);
    const suggestions = generateSEOSuggestions(product, seoScore);

    return {
      id: product.id,
      title: product.title,
      seo_title: title,
      seo_description: description,
      current_title_length: title.length,
      current_description_length: description.length,
      seo_score,
      missing_keywords: missingKeywords,
      optimization_suggestions: suggestions,
      google_category: product.google_product_category || '',
      search_volume: Math.floor(Math.random() * 1000) + 100, // Simulé
      competition: ['low', 'medium', 'high'][Math.floor(Math.random() * 3)] as 'low' | 'medium' | 'high'
    };
  };

  const calculateSEOScore = (title: string, description: string, product: any): number => {
    let score = 0;
    
    // Titre SEO (40 points max)
    if (title.length >= 30 && title.length <= 70) score += 20;
    if (title.includes(product.category?.toLowerCase() || '')) score += 10;
    if (title.includes(product.color?.toLowerCase() || '')) score += 5;
    if (title.includes(product.brand?.toLowerCase() || '')) score += 5;
    
    // Description SEO (30 points max)
    if (description.length >= 120 && description.length <= 155) score += 15;
    if (description.includes('livraison')) score += 5;
    if (description.includes('garantie')) score += 5;
    if (description.includes(product.material?.toLowerCase() || '')) score += 5;
    
    // Attributs produit (30 points max)
    if (product.color) score += 5;
    if (product.material) score += 5;
    if (product.style) score += 5;
    if (product.dimensions) score += 5;
    if (product.google_product_category) score += 10;
    
    return Math.min(score, 100);
  };

  const findMissingKeywords = (product: any): string[] => {
    const missing = [];
    
    if (!product.color) missing.push('couleur');
    if (!product.material) missing.push('matériau');
    if (!product.style) missing.push('style');
    if (!product.dimensions) missing.push('dimensions');
    if (!product.room) missing.push('pièce destination');
    
    return missing;
  };

  const generateSEOSuggestions = (product: any, score: number): string[] => {
    const suggestions = [];
    
    if (score < 50) {
      suggestions.push('Titre SEO trop court ou trop long');
    }
    if (!product.seo_description || product.seo_description.length < 120) {
      suggestions.push('Ajouter une meta description complète');
    }
    if (!product.google_product_category) {
      suggestions.push('Définir la catégorie Google Shopping');
    }
    if (!product.color) {
      suggestions.push('Spécifier la couleur pour améliorer la recherche');
    }
    if (!product.material) {
      suggestions.push('Préciser le matériau principal');
    }
    
    return suggestions;
  };

  const calculateSEOStats = (products: SEOProduct[]) => {
    const totalProducts = products.length;
    const avgScore = Math.round(products.reduce((sum, p) => sum + p.seo_score, 0) / totalProducts);
    const goodSEO = products.filter(p => p.seo_score >= 70).length;
    const needsWork = products.filter(p => p.seo_score < 50).length;
    
    return {
      totalProducts,
      avgScore,
      goodSEO,
      needsWork,
      optimizationRate: Math.round((goodSEO / totalProducts) * 100)
    };
  };

  const handleOptimizeAllSEO = async () => {
    setIsOptimizing(true);
    
    try {
      showInfo('Optimisation SEO', 'Optimisation automatique des titres et descriptions...');
      
      const optimizedProducts = await Promise.all(
        products.map(async (product) => {
          if (product.seo_score < 70) {
            return await optimizeProductSEO(product);
          }
          return product;
        })
      );
      
      setProducts(optimizedProducts);
      
      // Sauvegarder les optimisations
      const enrichedProducts = localStorage.getItem('products_enriched');
      if (enrichedProducts) {
        const allProducts = JSON.parse(enrichedProducts);
        const updatedProducts = allProducts.map((p: any) => {
          const optimized = optimizedProducts.find(op => op.id === p.id);
          if (optimized) {
            return {
              ...p,
              seo_title: optimized.seo_title,
              seo_description: optimized.seo_description
            };
          }
          return p;
        });
        
        localStorage.setItem('products_enriched', JSON.stringify(updatedProducts));
      }
      
      // Recalculer les stats
      const newStats = calculateSEOStats(optimizedProducts);
      setSeoStats(newStats);
      
      showSuccess(
        'SEO optimisé',
        `${optimizedProducts.filter(p => p.seo_score >= 70).length} produits optimisés avec succès`
      );
      
    } catch (error) {
      console.error('❌ Erreur optimisation SEO:', error);
      showError('Erreur optimisation', 'Impossible d\'optimiser le SEO automatiquement.');
    } finally {
      setIsOptimizing(false);
    }
  };

  const optimizeProductSEO = async (product: SEOProduct): Promise<SEOProduct> => {
    // Optimisation automatique du SEO
    const enrichedProduct = JSON.parse(localStorage.getItem('products_enriched') || '[]')
      .find((p: any) => p.id === product.id);
    
    if (!enrichedProduct) return product;
    
    // Générer titre SEO optimisé
    const optimizedTitle = generateOptimizedTitle(enrichedProduct);
    const optimizedDescription = generateOptimizedDescription(enrichedProduct);
    
    return {
      ...product,
      seo_title: optimizedTitle,
      seo_description: optimizedDescription,
      current_title_length: optimizedTitle.length,
      current_description_length: optimizedDescription.length,
      seo_score: calculateSEOScore(optimizedTitle, optimizedDescription, enrichedProduct)
    };
  };

  const generateOptimizedTitle = (product: any): string => {
    const elements = [
      product.title || product.name,
      product.color,
      product.material,
      product.brand || 'Decora Home'
    ].filter(Boolean);
    
    return elements.join(' ').substring(0, 70);
  };

  const generateOptimizedDescription = (product: any): string => {
    const elements = [
      product.title || product.name,
      product.color ? `en ${product.color}` : '',
      product.material ? `${product.material}` : '',
      product.style ? `Style ${product.style}` : '',
      'Livraison gratuite',
      'Garantie 2 ans'
    ].filter(Boolean);
    
    return elements.join('. ').substring(0, 155);
  };

  const getSEOScoreColor = (score: number) => {
    if (score >= 70) return 'bg-green-500/20 text-green-300 border-green-400/50';
    if (score >= 50) return 'bg-yellow-500/20 text-yellow-300 border-yellow-400/50';
    return 'bg-red-500/20 text-red-300 border-red-400/50';
  };

  const getCompetitionColor = (competition: string) => {
    switch (competition) {
      case 'low': return 'text-green-400';
      case 'medium': return 'text-yellow-400';
      case 'high': return 'text-red-400';
      default: return 'text-gray-400';
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-cyan-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-white text-lg">Analyse SEO en cours...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold text-white flex items-center gap-3">
            <Search className="w-8 h-8 text-green-400" />
            Optimisation SEO
          </h2>
          <p className="text-gray-300 mt-2">
            Optimisez vos produits pour les moteurs de recherche
          </p>
        </div>
        
        <div className="flex items-center gap-3">
          <button
            onClick={loadSEOData}
            className="bg-blue-600/20 hover:bg-blue-600/30 border border-blue-400/50 text-blue-300 px-4 py-2 rounded-xl transition-all flex items-center gap-2"
          >
            <RefreshCw className="w-4 h-4" />
            Actualiser
          </button>
          
          <button
            onClick={handleOptimizeAllSEO}
            disabled={isOptimizing}
            className="bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-400 hover:to-emerald-500 disabled:from-gray-600 disabled:to-gray-700 text-white px-6 py-3 rounded-xl font-semibold transition-all disabled:cursor-not-allowed flex items-center gap-2"
          >
            {isOptimizing ? (
              <>
                <RefreshCw className="w-5 h-5 animate-spin" />
                Optimisation...
              </>
            ) : (
              <>
                <Zap className="w-5 h-5" />
                Optimiser tout
              </>
            )}
          </button>
        </div>
      </div>

      {/* Statistiques SEO */}
      {seoStats && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="bg-blue-600/20 backdrop-blur-xl rounded-2xl p-6 border border-blue-500/30">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-blue-200 text-sm mb-1">Produits analysés</p>
                <p className="text-3xl font-bold text-white">{seoStats.totalProducts}</p>
              </div>
              <Search className="w-10 h-10 text-blue-400" />
            </div>
          </div>
          
          <div className="bg-green-600/20 backdrop-blur-xl rounded-2xl p-6 border border-green-500/30">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-green-200 text-sm mb-1">Score SEO moyen</p>
                <p className="text-3xl font-bold text-white">{seoStats.avgScore}%</p>
              </div>
              <TrendingUp className="w-10 h-10 text-green-400" />
            </div>
          </div>
          
          <div className="bg-purple-600/20 backdrop-blur-xl rounded-2xl p-6 border border-purple-500/30">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-purple-200 text-sm mb-1">Bien optimisés</p>
                <p className="text-3xl font-bold text-white">{seoStats.goodSEO}</p>
              </div>
              <CheckCircle className="w-10 h-10 text-purple-400" />
            </div>
          </div>
          
          <div className="bg-orange-600/20 backdrop-blur-xl rounded-2xl p-6 border border-orange-500/30">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-orange-200 text-sm mb-1">À améliorer</p>
                <p className="text-3xl font-bold text-white">{seoStats.needsWork}</p>
              </div>
              <AlertCircle className="w-10 h-10 text-orange-400" />
            </div>
          </div>
        </div>
      )}

      {/* Tableau SEO */}
      <div className="bg-white/10 backdrop-blur-xl rounded-2xl border border-white/20 overflow-hidden">
        <div className="p-6 border-b border-white/10">
          <h3 className="text-2xl font-bold text-white">Analyse SEO des Produits</h3>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-black/20">
              <tr>
                <th className="text-left p-4 text-cyan-300 font-semibold">Produit</th>
                <th className="text-left p-4 text-cyan-300 font-semibold">SEO Titre</th>
                <th className="text-left p-4 text-cyan-300 font-semibold">SEO Description</th>
                <th className="text-left p-4 text-cyan-300 font-semibold">Score</th>
                <th className="text-left p-4 text-cyan-300 font-semibold">Recherche</th>
                <th className="text-left p-4 text-cyan-300 font-semibold">Actions</th>
              </tr>
            </thead>
            <tbody>
              {products.map((product) => (
                <tr key={product.id} className="border-b border-white/10 hover:bg-white/5">
                  <td className="p-4">
                    <div className="font-semibold text-white">{product.title}</div>
                    <div className="text-gray-400 text-sm">{product.google_category}</div>
                  </td>
                  
                  <td className="p-4">
                    <div className="space-y-1">
                      <div className="text-white text-sm">{product.seo_title.substring(0, 40)}...</div>
                      <div className={`text-xs ${
                        product.current_title_length >= 30 && product.current_title_length <= 70 
                          ? 'text-green-400' : 'text-red-400'
                      }`}>
                        {product.current_title_length}/70 caractères
                      </div>
                    </div>
                  </td>
                  
                  <td className="p-4">
                    <div className="space-y-1">
                      <div className="text-white text-sm">{product.seo_description.substring(0, 50)}...</div>
                      <div className={`text-xs ${
                        product.current_description_length >= 120 && product.current_description_length <= 155 
                          ? 'text-green-400' : 'text-red-400'
                      }`}>
                        {product.current_description_length}/155 caractères
                      </div>
                    </div>
                  </td>
                  
                  <td className="p-4">
                    <span className={`px-3 py-1 rounded-full text-sm font-bold border ${getSEOScoreColor(product.seo_score)}`}>
                      {product.seo_score}%
                    </span>
                  </td>
                  
                  <td className="p-4">
                    <div className="space-y-1">
                      <div className="text-white text-sm">{product.search_volume}/mois</div>
                      <div className={`text-xs font-medium ${getCompetitionColor(product.competition)}`}>
                        Concurrence {product.competition}
                      </div>
                    </div>
                  </td>
                  
                  <td className="p-4">
                    <div className="flex gap-2">
                      <button
                        onClick={() => {
                          setSelectedProduct(product);
                          setShowEditModal(true);
                        }}
                        className="text-blue-400 hover:text-blue-300 p-1"
                        title="Optimiser SEO"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button
                        className="text-green-400 hover:text-green-300 p-1"
                        title="Voir suggestions"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal d'édition SEO */}
      {showEditModal && selectedProduct && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-800/95 backdrop-blur-xl rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto border border-slate-600/50">
            <div className="flex items-center justify-between p-6 border-b border-slate-600/50">
              <h2 className="text-2xl font-bold text-white">Optimisation SEO</h2>
              <button
                onClick={() => setShowEditModal(false)}
                className="text-gray-400 hover:text-white transition-colors text-2xl"
              >
                ×
              </button>
            </div>

            <div className="p-6 space-y-6">
              <div>
                <h3 className="text-lg font-bold text-white mb-4">{selectedProduct.title}</h3>
                
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm text-cyan-300 mb-2">
                      Titre SEO (30-70 caractères recommandés)
                    </label>
                    <input
                      type="text"
                      value={selectedProduct.seo_title}
                      onChange={(e) => setSelectedProduct({
                        ...selectedProduct,
                        seo_title: e.target.value,
                        current_title_length: e.target.value.length
                      })}
                      className="w-full bg-black/40 border border-cyan-500/50 rounded-xl px-4 py-3 text-white"
                      maxLength={70}
                    />
                    <div className={`text-xs mt-1 ${
                      selectedProduct.current_title_length >= 30 && selectedProduct.current_title_length <= 70 
                        ? 'text-green-400' : 'text-red-400'
                    }`}>
                      {selectedProduct.current_title_length}/70 caractères
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-sm text-cyan-300 mb-2">
                      Meta Description (120-155 caractères recommandés)
                    </label>
                    <textarea
                      value={selectedProduct.seo_description}
                      onChange={(e) => setSelectedProduct({
                        ...selectedProduct,
                        seo_description: e.target.value,
                        current_description_length: e.target.value.length
                      })}
                      className="w-full bg-black/40 border border-cyan-500/50 rounded-xl px-4 py-3 text-white resize-none"
                      rows={3}
                      maxLength={155}
                    />
                    <div className={`text-xs mt-1 ${
                      selectedProduct.current_description_length >= 120 && selectedProduct.current_description_length <= 155 
                        ? 'text-green-400' : 'text-red-400'
                    }`}>
                      {selectedProduct.current_description_length}/155 caractères
                    </div>
                  </div>
                </div>
                
                {/* Suggestions d'optimisation */}
                {selectedProduct.optimization_suggestions.length > 0 && (
                  <div className="bg-yellow-500/20 border border-yellow-400/50 rounded-xl p-4 mt-4">
                    <h4 className="font-semibold text-yellow-200 mb-2">💡 Suggestions d'optimisation :</h4>
                    <ul className="text-yellow-300 text-sm space-y-1">
                      {selectedProduct.optimization_suggestions.map((suggestion, index) => (
                        <li key={index}>• {suggestion}</li>
                      ))}
                    </ul>
                  </div>
                )}
                
                {/* Mots-clés manquants */}
                {selectedProduct.missing_keywords.length > 0 && (
                  <div className="bg-red-500/20 border border-red-400/50 rounded-xl p-4 mt-4">
                    <h4 className="font-semibold text-red-200 mb-2">⚠️ Mots-clés manquants :</h4>
                    <div className="flex flex-wrap gap-2">
                      {selectedProduct.missing_keywords.map((keyword, index) => (
                        <span key={index} className="bg-red-600/30 text-red-300 px-2 py-1 rounded-full text-xs">
                          {keyword}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              <div className="flex justify-end gap-4">
                <button
                  onClick={() => setShowEditModal(false)}
                  className="bg-gray-600 hover:bg-gray-700 text-white px-6 py-3 rounded-xl transition-all"
                >
                  Annuler
                </button>
                <button
                  className="bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-400 hover:to-emerald-500 text-white px-6 py-3 rounded-xl font-semibold transition-all"
                >
                  Sauvegarder
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};