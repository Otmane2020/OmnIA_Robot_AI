import React, { useState, useEffect } from 'react';
import { Target, TrendingUp, DollarSign, Eye, CreditCard as Edit, Download, RefreshCw, BarChart3, Zap, CheckCircle, AlertCircle } from 'lucide-react';
import { useNotifications } from './NotificationSystem';

interface GoogleAdsTabProps {
  retailerId?: string;
}

interface GoogleAdsProduct {
  id: string;
  title: string;
  ad_headline: string;
  ad_description: string;
  price: number;
  category: string;
  image_url: string;
  headline_length: number;
  description_length: number;
  ads_score: number;
  estimated_cpc: number;
  estimated_impressions: number;
  quality_score: number;
  optimization_suggestions: string[];
}

export const GoogleAdsTab: React.FC<GoogleAdsTabProps> = ({ retailerId }) => {
  const [products, setProducts] = useState<GoogleAdsProduct[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isOptimizing, setIsOptimizing] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<GoogleAdsProduct | null>(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [adsStats, setAdsStats] = useState<any>(null);
  const { showSuccess, showError, showInfo } = useNotifications();

  useEffect(() => {
    loadGoogleAdsData();
  }, [retailerId]);

  const loadGoogleAdsData = async () => {
    try {
      setIsLoading(true);
      
      // Charger les produits enrichis pour analyse Google Ads
      const enrichedProducts = localStorage.getItem('products_enriched');
      if (enrichedProducts) {
        const products = JSON.parse(enrichedProducts);
        const adsAnalyzedProducts = products.map(analyzeGoogleAdsProduct);
        setProducts(adsAnalyzedProducts);
        
        // Calculer les statistiques Google Ads
        const stats = calculateGoogleAdsStats(adsAnalyzedProducts);
        setAdsStats(stats);
      }
      
    } catch (error) {
      console.error('❌ Erreur chargement Google Ads:', error);
      showError('Erreur Google Ads', 'Impossible de charger les données Google Ads.');
    } finally {
      setIsLoading(false);
    }
  };

  const analyzeGoogleAdsProduct = (product: any): GoogleAdsProduct => {
    const headline = product.ad_headline || product.title?.substring(0, 30) || '';
    const description = product.ad_description || generateAdDescription(product);
    
    // Analyser la qualité Google Ads
    const adsScore = calculateGoogleAdsScore(headline, description, product);
    const suggestions = generateAdsSuggestions(product, adsScore);

    return {
      id: product.id,
      title: product.title,
      ad_headline: headline,
      ad_description: description,
      price: product.price || 0,
      category: product.category || 'Mobilier',
      image_url: product.image_url || '',
      headline_length: headline.length,
      description_length: description.length,
      ads_score: adsScore,
      estimated_cpc: calculateEstimatedCPC(product),
      estimated_impressions: calculateEstimatedImpressions(product),
      quality_score: Math.floor(Math.random() * 4) + 7, // 7-10
      optimization_suggestions: suggestions
    };
  };

  const calculateGoogleAdsScore = (headline: string, description: string, product: any): number => {
    let score = 0;
    
    // Titre publicitaire (40 points max)
    if (headline.length >= 15 && headline.length <= 30) score += 20;
    if (headline.includes(product.category?.toLowerCase() || '')) score += 10;
    if (headline.includes('€') || headline.includes('prix')) score += 5;
    if (headline.includes(product.color?.toLowerCase() || '')) score += 5;
    
    // Description publicitaire (35 points max)
    if (description.length >= 60 && description.length <= 90) score += 15;
    if (description.includes('livraison')) score += 5;
    if (description.includes('promo') || description.includes('offre')) score += 5;
    if (description.includes(product.material?.toLowerCase() || '')) score += 5;
    if (description.includes('garantie')) score += 5;
    
    // Données produit (25 points max)
    if (product.price > 0) score += 10;
    if (product.image_url) score += 5;
    if (product.color) score += 5;
    if (product.material) score += 5;
    
    return Math.min(score, 100);
  };

  const generateAdDescription = (product: any): string => {
    const elements = [
      product.title || product.name,
      product.color ? product.color : '',
      product.material ? product.material : '',
      'Livraison gratuite',
      'Promo limitée !'
    ].filter(Boolean);
    
    return elements.join('. ').substring(0, 90);
  };

  const calculateEstimatedCPC = (product: any): number => {
    // Simulation CPC basée sur catégorie et prix
    const baseCPC = {
      'Canapé': 1.20,
      'Table': 0.85,
      'Chaise': 0.65,
      'Lit': 1.10,
      'Rangement': 0.75
    };
    
    const categoryMultiplier = baseCPC[product.category as keyof typeof baseCPC] || 0.80;
    const priceMultiplier = product.price > 500 ? 1.3 : 1.0;
    
    return Math.round((categoryMultiplier * priceMultiplier) * 100) / 100;
  };

  const calculateEstimatedImpressions = (product: any): number => {
    // Simulation impressions basée sur catégorie et score
    const baseImpressions = {
      'Canapé': 2500,
      'Table': 1800,
      'Chaise': 1200,
      'Lit': 2000,
      'Rangement': 1000
    };
    
    const categoryBase = baseImpressions[product.category as keyof typeof baseImpressions] || 1000;
    const qualityMultiplier = product.ads_score / 100;
    
    return Math.round(categoryBase * qualityMultiplier);
  };

  const generateAdsSuggestions = (product: any, score: number): string[] => {
    const suggestions = [];
    
    if (score < 50) {
      suggestions.push('Titre trop court ou trop long pour Google Ads');
    }
    if (!product.ad_description || product.ad_description.length < 60) {
      suggestions.push('Ajouter une description publicitaire complète');
    }
    if (!product.price || product.price === 0) {
      suggestions.push('Spécifier le prix pour améliorer les performances');
    }
    if (!product.color) {
      suggestions.push('Ajouter la couleur pour cibler les recherches spécifiques');
    }
    if (!product.material) {
      suggestions.push('Préciser le matériau pour différencier la concurrence');
    }
    
    return suggestions;
  };

  const calculateGoogleAdsStats = (products: GoogleAdsProduct[]) => {
    const totalProducts = products.length;
    const avgScore = Math.round(products.reduce((sum, p) => sum + p.ads_score, 0) / totalProducts);
    const goodAds = products.filter(p => p.ads_score >= 70).length;
    const needsWork = products.filter(p => p.ads_score < 50).length;
    const totalCPC = products.reduce((sum, p) => sum + p.estimated_cpc, 0);
    const totalImpressions = products.reduce((sum, p) => sum + p.estimated_impressions, 0);
    
    return {
      totalProducts,
      avgScore,
      goodAds,
      needsWork,
      avgCPC: Math.round((totalCPC / totalProducts) * 100) / 100,
      totalImpressions,
      estimatedBudget: Math.round(totalCPC * 100) // Budget mensuel estimé
    };
  };

  const handleOptimizeAllAds = async () => {
    setIsOptimizing(true);
    
    try {
      showInfo('Optimisation Google Ads', 'Optimisation automatique des annonces...');
      
      const optimizedProducts = await Promise.all(
        products.map(async (product) => {
          if (product.ads_score < 70) {
            return await optimizeProductAds(product);
          }
          return product;
        })
      );
      
      setProducts(optimizedProducts);
      
      // Recalculer les stats
      const newStats = calculateGoogleAdsStats(optimizedProducts);
      setAdsStats(newStats);
      
      showSuccess(
        'Google Ads optimisé',
        `${optimizedProducts.filter(p => p.ads_score >= 70).length} annonces optimisées`
      );
      
    } catch (error) {
      console.error('❌ Erreur optimisation Google Ads:', error);
      showError('Erreur optimisation', 'Impossible d\'optimiser les annonces automatiquement.');
    } finally {
      setIsOptimizing(false);
    }
  };

  const optimizeProductAds = async (product: GoogleAdsProduct): Promise<GoogleAdsProduct> => {
    // Optimisation automatique des annonces
    const enrichedProduct = JSON.parse(localStorage.getItem('products_enriched') || '[]')
      .find((p: any) => p.id === product.id);
    
    if (!enrichedProduct) return product;
    
    const optimizedHeadline = generateOptimizedHeadline(enrichedProduct);
    const optimizedDescription = generateOptimizedAdDescription(enrichedProduct);
    
    return {
      ...product,
      ad_headline: optimizedHeadline,
      ad_description: optimizedDescription,
      headline_length: optimizedHeadline.length,
      description_length: optimizedDescription.length,
      ads_score: calculateGoogleAdsScore(optimizedHeadline, optimizedDescription, enrichedProduct)
    };
  };

  const generateOptimizedHeadline = (product: any): string => {
    const elements = [
      product.title || product.name,
      product.color,
      product.price ? `${product.price}€` : ''
    ].filter(Boolean);
    
    return elements.join(' ').substring(0, 30);
  };

  const generateOptimizedAdDescription = (product: any): string => {
    const elements = [
      product.title || product.name,
      product.color ? `${product.color}` : '',
      product.material ? `en ${product.material}` : '',
      'Livraison gratuite',
      'Promo limitée !'
    ].filter(Boolean);
    
    return elements.join('. ').substring(0, 90);
  };

  const getAdsScoreColor = (score: number) => {
    if (score >= 70) return 'bg-green-500/20 text-green-300 border-green-400/50';
    if (score >= 50) return 'bg-yellow-500/20 text-yellow-300 border-yellow-400/50';
    return 'bg-red-500/20 text-red-300 border-red-400/50';
  };

  const getQualityScoreColor = (score: number) => {
    if (score >= 8) return 'text-green-400';
    if (score >= 6) return 'text-yellow-400';
    return 'text-red-400';
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-cyan-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-white text-lg">Analyse Google Ads en cours...</p>
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
            <Target className="w-8 h-8 text-red-400" />
            Google Ads
          </h2>
          <p className="text-gray-300 mt-2">
            Optimisez vos annonces pour Google Shopping et Search
          </p>
        </div>
        
        <div className="flex items-center gap-3">
          <button
            onClick={loadGoogleAdsData}
            className="bg-blue-600/20 hover:bg-blue-600/30 border border-blue-400/50 text-blue-300 px-4 py-2 rounded-xl transition-all flex items-center gap-2"
          >
            <RefreshCw className="w-4 h-4" />
            Actualiser
          </button>
          
          <button
            onClick={handleOptimizeAllAds}
            disabled={isOptimizing}
            className="bg-gradient-to-r from-red-500 to-pink-600 hover:from-red-400 hover:to-pink-500 disabled:from-gray-600 disabled:to-gray-700 text-white px-6 py-3 rounded-xl font-semibold transition-all disabled:cursor-not-allowed flex items-center gap-2"
          >
            {isOptimizing ? (
              <>
                <RefreshCw className="w-5 h-5 animate-spin" />
                Optimisation...
              </>
            ) : (
              <>
                <Zap className="w-5 h-5" />
                Optimiser annonces
              </>
            )}
          </button>
        </div>
      </div>

      {/* Statistiques Google Ads */}
      {adsStats && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-red-600/20 backdrop-blur-xl rounded-2xl p-6 border border-red-500/30">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-red-200 text-sm mb-1">Annonces créées</p>
                <p className="text-3xl font-bold text-white">{adsStats.totalProducts}</p>
              </div>
              <Target className="w-10 h-10 text-red-400" />
            </div>
          </div>
          
          <div className="bg-green-600/20 backdrop-blur-xl rounded-2xl p-6 border border-green-500/30">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-green-200 text-sm mb-1">Score moyen</p>
                <p className="text-3xl font-bold text-white">{adsStats.avgScore}%</p>
              </div>
              <TrendingUp className="w-10 h-10 text-green-400" />
            </div>
          </div>
          
          <div className="bg-blue-600/20 backdrop-blur-xl rounded-2xl p-6 border border-blue-500/30">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-blue-200 text-sm mb-1">CPC moyen</p>
                <p className="text-3xl font-bold text-white">{adsStats.avgCPC}€</p>
              </div>
              <DollarSign className="w-10 h-10 text-blue-400" />
            </div>
          </div>
          
          <div className="bg-purple-600/20 backdrop-blur-xl rounded-2xl p-6 border border-purple-500/30">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-purple-200 text-sm mb-1">Budget estimé</p>
                <p className="text-3xl font-bold text-white">{adsStats.estimatedBudget}€</p>
              </div>
              <BarChart3 className="w-10 h-10 text-purple-400" />
            </div>
          </div>
        </div>
      )}

      {/* Tableau Google Ads */}
      <div className="bg-white/10 backdrop-blur-xl rounded-2xl border border-white/20 overflow-hidden">
        <div className="p-6 border-b border-white/10">
          <h3 className="text-2xl font-bold text-white">Annonces Google Ads</h3>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-black/20">
              <tr>
                <th className="text-left p-4 text-cyan-300 font-semibold">Produit</th>
                <th className="text-left p-4 text-cyan-300 font-semibold">Annonce</th>
                <th className="text-left p-4 text-cyan-300 font-semibold">Performance</th>
                <th className="text-left p-4 text-cyan-300 font-semibold">Score</th>
                <th className="text-left p-4 text-cyan-300 font-semibold">Actions</th>
              </tr>
            </thead>
            <tbody>
              {products.map((product) => (
                <tr key={product.id} className="border-b border-white/10 hover:bg-white/5">
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
                      <div>
                        <div className="font-semibold text-white text-sm">{product.title}</div>
                        <div className="text-gray-400 text-xs">{product.category}</div>
                        <div className="text-green-400 font-bold text-sm">{product.price}€</div>
                      </div>
                    </div>
                  </td>
                  
                  <td className="p-4">
                    <div className="space-y-2">
                      <div>
                        <div className="text-white font-medium text-sm">{product.ad_headline}</div>
                        <div className={`text-xs ${
                          product.headline_length <= 30 ? 'text-green-400' : 'text-red-400'
                        }`}>
                          {product.headline_length}/30 caractères
                        </div>
                      </div>
                      
                      <div>
                        <div className="text-gray-300 text-sm">{product.ad_description}</div>
                        <div className={`text-xs ${
                          product.description_length <= 90 ? 'text-green-400' : 'text-red-400'
                        }`}>
                          {product.description_length}/90 caractères
                        </div>
                      </div>
                    </div>
                  </td>
                  
                  <td className="p-4">
                    <div className="space-y-1 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-400">CPC:</span>
                        <span className="text-white font-bold">{product.estimated_cpc}€</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-400">Impressions:</span>
                        <span className="text-white">{product.estimated_impressions.toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-400">Qualité:</span>
                        <span className={`font-bold ${getQualityScoreColor(product.quality_score)}`}>
                          {product.quality_score}/10
                        </span>
                      </div>
                    </div>
                  </td>
                  
                  <td className="p-4">
                    <span className={`px-3 py-1 rounded-full text-sm font-bold border ${getAdsScoreColor(product.ads_score)}`}>
                      {product.ads_score}%
                    </span>
                  </td>
                  
                  <td className="p-4">
                    <div className="flex gap-2">
                      <button
                        onClick={() => {
                          setSelectedProduct(product);
                          setShowEditModal(true);
                        }}
                        className="text-blue-400 hover:text-blue-300 p-1"
                        title="Optimiser annonce"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button
                        className="text-green-400 hover:text-green-300 p-1"
                        title="Prévisualiser"
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

      {/* Modal d'édition annonce */}
      {showEditModal && selectedProduct && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-800/95 backdrop-blur-xl rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto border border-slate-600/50">
            <div className="flex items-center justify-between p-6 border-b border-slate-600/50">
              <h2 className="text-2xl font-bold text-white">Optimisation Google Ads</h2>
              <button
                onClick={() => setShowEditModal(false)}
                className="text-gray-400 hover:text-white transition-colors text-2xl"
              >
                ×
              </button>
            </div>

            <div className="p-6 space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Édition annonce */}
                <div>
                  <h3 className="text-lg font-bold text-white mb-4">Édition de l'annonce</h3>
                  
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm text-cyan-300 mb-2">
                        Titre publicitaire (max 30 caractères)
                      </label>
                      <input
                        type="text"
                        value={selectedProduct.ad_headline}
                        onChange={(e) => setSelectedProduct({
                          ...selectedProduct,
                          ad_headline: e.target.value,
                          headline_length: e.target.value.length
                        })}
                        className="w-full bg-black/40 border border-cyan-500/50 rounded-xl px-4 py-3 text-white"
                        maxLength={30}
                      />
                      <div className={`text-xs mt-1 ${
                        selectedProduct.headline_length <= 30 ? 'text-green-400' : 'text-red-400'
                      }`}>
                        {selectedProduct.headline_length}/30 caractères
                      </div>
                    </div>
                    
                    <div>
                      <label className="block text-sm text-cyan-300 mb-2">
                        Description publicitaire (max 90 caractères)
                      </label>
                      <textarea
                        value={selectedProduct.ad_description}
                        onChange={(e) => setSelectedProduct({
                          ...selectedProduct,
                          ad_description: e.target.value,
                          description_length: e.target.value.length
                        })}
                        className="w-full bg-black/40 border border-cyan-500/50 rounded-xl px-4 py-3 text-white resize-none"
                        rows={3}
                        maxLength={90}
                      />
                      <div className={`text-xs mt-1 ${
                        selectedProduct.description_length <= 90 ? 'text-green-400' : 'text-red-400'
                      }`}>
                        {selectedProduct.description_length}/90 caractères
                      </div>
                    </div>
                  </div>
                </div>

                {/* Prévisualisation */}
                <div>
                  <h3 className="text-lg font-bold text-white mb-4">Prévisualisation Google Ads</h3>
                  
                  <div className="bg-white rounded-xl p-4 border border-gray-200">
                    <div className="flex items-start gap-3">
                      <img 
                        src={selectedProduct.image_url} 
                        alt={selectedProduct.title}
                        className="w-16 h-16 object-cover rounded-lg"
                      />
                      <div className="flex-1">
                        <div className="text-blue-600 text-sm font-medium mb-1">
                          {selectedProduct.ad_headline}
                        </div>
                        <div className="text-gray-800 text-sm mb-2">
                          {selectedProduct.ad_description}
                        </div>
                        <div className="text-green-600 text-sm font-bold">
                          {selectedProduct.price}€
                        </div>
                        <div className="text-gray-500 text-xs">
                          Annonce • Decora Home
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  {/* Métriques estimées */}
                  <div className="mt-4 bg-black/20 rounded-xl p-4">
                    <h4 className="font-semibold text-white mb-3">Métriques estimées</h4>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="text-gray-400">CPC estimé:</span>
                        <div className="text-white font-bold">{selectedProduct.estimated_cpc}€</div>
                      </div>
                      <div>
                        <span className="text-gray-400">Impressions/mois:</span>
                        <div className="text-white font-bold">{selectedProduct.estimated_impressions.toLocaleString()}</div>
                      </div>
                      <div>
                        <span className="text-gray-400">Quality Score:</span>
                        <div className={`font-bold ${getQualityScoreColor(selectedProduct.quality_score)}`}>
                          {selectedProduct.quality_score}/10
                        </div>
                      </div>
                      <div>
                        <span className="text-gray-400">Budget/mois:</span>
                        <div className="text-white font-bold">{Math.round(selectedProduct.estimated_cpc * selectedProduct.estimated_impressions * 0.02)}€</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Suggestions d'optimisation */}
              {selectedProduct.optimization_suggestions.length > 0 && (
                <div className="bg-yellow-500/20 border border-yellow-400/50 rounded-xl p-4">
                  <h4 className="font-semibold text-yellow-200 mb-2">💡 Suggestions d'optimisation :</h4>
                  <ul className="text-yellow-300 text-sm space-y-1">
                    {selectedProduct.optimization_suggestions.map((suggestion, index) => (
                      <li key={index}>• {suggestion}</li>
                    ))}
                  </ul>
                </div>
              )}

              <div className="flex justify-end gap-4">
                <button
                  onClick={() => setShowEditModal(false)}
                  className="bg-gray-600 hover:bg-gray-700 text-white px-6 py-3 rounded-xl transition-all"
                >
                  Annuler
                </button>
                <button
                  className="bg-gradient-to-r from-red-500 to-pink-600 hover:from-red-400 hover:to-pink-500 text-white px-6 py-3 rounded-xl font-semibold transition-all"
                >
                  Sauvegarder annonce
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};