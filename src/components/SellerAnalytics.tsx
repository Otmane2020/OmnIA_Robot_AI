import React, { useState, useEffect } from 'react';
import { BarChart3, TrendingUp, Users, MessageSquare, ShoppingCart, DollarSign, Calendar, RefreshCw } from 'lucide-react';

interface SellerAnalyticsData {
  conversations_count: number;
  unique_visitors: number;
  products_viewed: number;
  cart_additions: number;
  conversions: number;
  revenue: number;
  avg_session_duration: string;
  top_products: Array<{ name: string; views: number }>;
  top_searches: Array<{ query: string; count: number }>;
}

interface SellerAnalyticsProps {
  sellerId: string;
}

export const SellerAnalytics: React.FC<SellerAnalyticsProps> = ({ sellerId }) => {
  const [analytics, setAnalytics] = useState<SellerAnalyticsData | null>(null);
  const [selectedPeriod, setSelectedPeriod] = useState('7d');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadAnalytics();
  }, [sellerId, selectedPeriod]);

  const loadAnalytics = async () => {
    try {
      setIsLoading(true);
      
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const savedAnalytics = localStorage.getItem(`seller_${sellerId}_analytics_${selectedPeriod}`);
      let analyticsData: SellerAnalyticsData | null = null;
      
      if (savedAnalytics) {
        try {
          analyticsData = JSON.parse(savedAnalytics);
          console.log('📊 Analytics vendeur chargées:', analyticsData);
        } catch (error) {
          console.error('Erreur parsing analytics:', error);
          analyticsData = null;
        }
      } else {
        console.log('📊 Nouveau vendeur - aucune donnée analytics');
        analyticsData = null;
      }
      
      setAnalytics(analyticsData);
      
    } catch (error) {
      console.error('❌ Erreur chargement analytics:', error);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-cyan-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-white text-lg">Chargement de vos analytics...</p>
        </div>
      </div>
    );
  }

  if (!analytics) {
    return (
      <div className="text-center py-20">
        <BarChart3 className="w-16 h-16 text-gray-400 mx-auto mb-4" />
        <h3 className="text-xl font-bold text-white mb-2">Aucune donnée disponible</h3>
        <p className="text-gray-400">Les analytics apparaîtront après les premières interactions</p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-white">Mes Analytics</h2>
          <p className="text-gray-300">Performances de votre robot IA</p>
        </div>
        
        <div className="flex items-center gap-4">
          <select
            value={selectedPeriod}
            onChange={(e) => setSelectedPeriod(e.target.value)}
            className="bg-black/40 border border-gray-600 rounded-xl px-4 py-2 text-white"
          >
            <option value="1d">Aujourd'hui</option>
            <option value="7d">7 derniers jours</option>
            <option value="30d">30 derniers jours</option>
          </select>
          
          <button
            onClick={loadAnalytics}
            className="bg-cyan-600 hover:bg-cyan-700 text-white px-4 py-2 rounded-xl flex items-center gap-2 transition-all"
          >
            <RefreshCw className="w-4 h-4" />
            Actualiser
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div className="bg-blue-600/20 backdrop-blur-xl rounded-2xl p-6 border border-blue-500/30">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-blue-200 text-sm mb-1">Conversations</p>
              <p className="text-3xl font-bold text-white mb-1">{analytics.conversations_count}</p>
              <p className="text-green-400 text-sm">+15% vs période précédente</p>
            </div>
            <MessageSquare className="w-10 h-10 text-blue-400" />
          </div>
        </div>
        
        <div className="bg-green-600/20 backdrop-blur-xl rounded-2xl p-6 border border-green-500/30">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-green-200 text-sm mb-1">Visiteurs Uniques</p>
              <p className="text-3xl font-bold text-white mb-1">{analytics.unique_visitors}</p>
              <p className="text-green-400 text-sm">+8% vs période précédente</p>
            </div>
            <Users className="w-10 h-10 text-green-400" />
          </div>
        </div>
        
        <div className="bg-purple-600/20 backdrop-blur-xl rounded-2xl p-6 border border-purple-500/30">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-purple-200 text-sm mb-1">Taux de Conversion</p>
              <p className="text-3xl font-bold text-white mb-1">{analytics.conversions}%</p>
              <p className="text-green-400 text-sm">+3% vs période précédente</p>
            </div>
            <TrendingUp className="w-10 h-10 text-purple-400" />
          </div>
        </div>
        
        <div className="bg-orange-600/20 backdrop-blur-xl rounded-2xl p-6 border border-orange-500/30">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-orange-200 text-sm mb-1">Produits Vus</p>
              <p className="text-3xl font-bold text-white mb-1">{analytics.products_viewed}</p>
              <p className="text-green-400 text-sm">+12% vs période précédente</p>
            </div>
            <BarChart3 className="w-10 h-10 text-orange-400" />
          </div>
        </div>
        
        <div className="bg-cyan-600/20 backdrop-blur-xl rounded-2xl p-6 border border-cyan-500/30">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-cyan-200 text-sm mb-1">Ajouts Panier</p>
              <p className="text-3xl font-bold text-white mb-1">{analytics.cart_additions}</p>
              <p className="text-green-400 text-sm">+20% vs période précédente</p>
            </div>
            <ShoppingCart className="w-10 h-10 text-cyan-400" />
          </div>
        </div>
        
        <div className="bg-emerald-600/20 backdrop-blur-xl rounded-2xl p-6 border border-emerald-500/30">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-emerald-200 text-sm mb-1">Revenus</p>
              <p className="text-3xl font-bold text-white mb-1">€{analytics.revenue}</p>
              <p className="text-green-400 text-sm">+18% vs période précédente</p>
            </div>
            <DollarSign className="w-10 h-10 text-emerald-400" />
          </div>
        </div>
      </div>

      {/* Top Products and Searches */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Top Products */}
        <div className="bg-white/10 backdrop-blur-xl rounded-2xl p-8 border border-white/20">
          <h3 className="text-xl font-bold text-white mb-6">Produits les Plus Vus</h3>
          <div className="space-y-4">
            {analytics.top_products.map((product, index) => (
              <div key={index} className="flex items-center justify-between p-4 bg-black/20 rounded-xl">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-full flex items-center justify-center text-white font-bold text-sm">
                    {index + 1}
                  </div>
                  <span className="text-white font-medium">{product.name}</span>
                </div>
                <span className="text-cyan-400 font-bold">{product.views} vues</span>
              </div>
            ))}
          </div>
        </div>

        {/* Top Searches */}
        <div className="bg-white/10 backdrop-blur-xl rounded-2xl p-8 border border-white/20">
          <h3 className="text-xl font-bold text-white mb-6">Recherches Populaires</h3>
          <div className="space-y-4">
            {analytics.top_searches.map((search, index) => (
              <div key={index} className="flex items-center justify-between p-4 bg-black/20 rounded-xl">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-pink-600 rounded-full flex items-center justify-center text-white font-bold text-sm">
                    {index + 1}
                  </div>
                  <span className="text-white font-medium">"{search.query}"</span>
                </div>
                <span className="text-purple-400 font-bold">{search.count}x</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Performance Summary */}
      <div className="bg-gradient-to-r from-cyan-500/20 to-blue-600/20 backdrop-blur-xl rounded-2xl p-6 border border-cyan-400/30">
        <h3 className="text-lg font-bold text-white mb-4">📊 Résumé des Performances</h3>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="text-center">
            <div className="text-2xl font-bold text-cyan-400">{analytics.avg_session_duration}</div>
            <div className="text-cyan-300 text-sm">Durée moyenne session</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-green-400">
              {Math.round((analytics.cart_additions / analytics.conversations_count) * 100)}%
            </div>
            <div className="text-green-300 text-sm">Taux d'engagement</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-purple-400">
              {Math.round((analytics.products_viewed / analytics.conversations_count) * 10) / 10}
            </div>
            <div className="text-purple-300 text-sm">Produits/conversation</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-orange-400">
              €{Math.round(analytics.revenue / analytics.conversations_count)}
            </div>
            <div className="text-orange-300 text-sm">Revenus/conversation</div>
          </div>
        </div>
      </div>
    </div>
  );
};