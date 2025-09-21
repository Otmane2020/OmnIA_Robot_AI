import React, { useState, useEffect } from 'react';
import { 
  BarChart3, Users, ShoppingCart, TrendingUp, Package, 
  Settings, Bot, Upload, Database, MessageSquare, 
  Calendar, DollarSign, Eye, RefreshCw, Zap, Brain,
  Store, Globe, Wifi, Server, CheckCircle, AlertCircle
} from 'lucide-react';
import { Logo } from '../components/Logo';
import { CatalogManagement } from '../components/CatalogManagement';
import { EcommerceIntegration } from '../components/EcommerceIntegration';
import { ConversationHistory } from '../components/ConversationHistory';
import { OmniaRobotTab } from '../components/OmniaRobotTab';
import { ProductsEnrichedTable } from '../components/ProductsEnrichedTable';
import { MLTrainingDashboard } from '../components/MLTrainingDashboard';
import { NotificationSystem, useNotifications } from '../components/NotificationSystem';

interface AdminDashboardProps {
  onLogout: () => void;
}

interface DashboardStats {
  conversations: number;
  conversions: number;
  revenue: number;
  products: number;
  visitors: number;
  avgSessionTime: string;
}

interface ConnectedPlatform {
  name: string;
  platform: string;
  products_count: number;
  status: 'connected' | 'error' | 'syncing';
  connected_at: string;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({ onLogout }) => {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [stats, setStats] = useState<DashboardStats>({
    conversations: 1234,
    conversions: 42,
    revenue: 2450,
    products: 247,
    visitors: 856,
    avgSessionTime: '3m 45s'
  });
  const [connectedPlatforms, setConnectedPlatforms] = useState<ConnectedPlatform[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const { notifications, removeNotification, showSuccess, showError, showInfo } = useNotifications();

  useEffect(() => {
    loadDashboardData();
    loadConnectedPlatforms();
  }, []);

  const loadDashboardData = async () => {
    setIsLoading(true);
    try {
      // Simuler le chargement des données
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Calculer les vraies stats depuis localStorage
      const catalogProducts = localStorage.getItem('catalog_products');
      const chatHistory = localStorage.getItem('chat_history');
      
      let realProductsCount = 247; // Decora Home base
      let realConversations = 1234;
      
      if (catalogProducts) {
        try {
          const products = JSON.parse(catalogProducts);
          realProductsCount += products.filter((p: any) => p.status === 'active').length;
        } catch (error) {
          console.error('Erreur parsing produits:', error);
        }
      }
      
      if (chatHistory) {
        try {
          const conversations = JSON.parse(chatHistory);
          realConversations += conversations.length;
        } catch (error) {
          console.error('Erreur parsing conversations:', error);
        }
      }
      
      setStats(prev => ({
        ...prev,
        products: realProductsCount,
        conversations: realConversations,
        conversions: Math.round(realConversations * 0.34), // 34% taux de conversion
        revenue: Math.round(realConversations * 1.98) // 1.98€ par conversation
      }));
      
    } catch (error) {
      console.error('Erreur chargement dashboard:', error);
      showError('Erreur de chargement', 'Impossible de charger les données du dashboard.');
    } finally {
      setIsLoading(false);
    }
  };

  const loadConnectedPlatforms = () => {
    try {
      const saved = localStorage.getItem('connected_platforms');
      if (saved) {
        setConnectedPlatforms(JSON.parse(saved));
      } else {
        // Plateformes par défaut
        const defaultPlatforms: ConnectedPlatform[] = [
          {
            name: 'Catalogue Decora Home',
            platform: 'base',
            products_count: 247,
            status: 'connected',
            connected_at: new Date().toISOString()
          }
        ];
        setConnectedPlatforms(defaultPlatforms);
        localStorage.setItem('connected_platforms', JSON.stringify(defaultPlatforms));
      }
    } catch (error) {
      console.error('Erreur chargement plateformes:', error);
    }
  };

  const handlePlatformConnected = (platformData: ConnectedPlatform) => {
    setConnectedPlatforms(prev => {
      const updated = [platformData, ...prev];
      localStorage.setItem('connected_platforms', JSON.stringify(updated));
      return updated;
    });
    
    showSuccess(
      'Plateforme connectée',
      `${platformData.name} connectée avec ${platformData.products_count} produits !`
    );
    
    // Mettre à jour les stats
    setStats(prev => ({
      ...prev,
      products: prev.products + platformData.products_count
    }));
  };

  const renderDashboard = () => (
    <div className="space-y-8">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-6">
        <div className="bg-blue-600/20 backdrop-blur-xl rounded-2xl p-6 border border-blue-500/30">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-blue-200 text-sm mb-1">Conversations</p>
              <p className="text-2xl font-bold text-white">{stats.conversations.toLocaleString()}</p>
              <p className="text-blue-300 text-xs">+12% ce mois</p>
            </div>
            <MessageSquare className="w-8 h-8 text-blue-400" />
          </div>
        </div>
        
        <div className="bg-green-600/20 backdrop-blur-xl rounded-2xl p-6 border border-green-500/30">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-green-200 text-sm mb-1">Conversions</p>
              <p className="text-2xl font-bold text-white">{stats.conversions}%</p>
              <p className="text-green-300 text-xs">+8% ce mois</p>
            </div>
            <TrendingUp className="w-8 h-8 text-green-400" />
          </div>
        </div>
        
        <div className="bg-purple-600/20 backdrop-blur-xl rounded-2xl p-6 border border-purple-500/30">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-purple-200 text-sm mb-1">Revenus</p>
              <p className="text-2xl font-bold text-white">€{stats.revenue.toLocaleString()}</p>
              <p className="text-purple-300 text-xs">+15% ce mois</p>
            </div>
            <DollarSign className="w-8 h-8 text-purple-400" />
          </div>
        </div>
        
        <div className="bg-orange-600/20 backdrop-blur-xl rounded-2xl p-6 border border-orange-500/30">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-orange-200 text-sm mb-1">Produits</p>
              <p className="text-2xl font-bold text-white">{stats.products.toLocaleString()}</p>
              <p className="text-orange-300 text-xs">Catalogue actif</p>
            </div>
            <Package className="w-8 h-8 text-orange-400" />
          </div>
        </div>
        
        <div className="bg-cyan-600/20 backdrop-blur-xl rounded-2xl p-6 border border-cyan-500/30">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-cyan-200 text-sm mb-1">Visiteurs</p>
              <p className="text-2xl font-bold text-white">{stats.visitors.toLocaleString()}</p>
              <p className="text-cyan-300 text-xs">Aujourd'hui</p>
            </div>
            <Users className="w-8 h-8 text-cyan-400" />
          </div>
        </div>
        
        <div className="bg-indigo-600/20 backdrop-blur-xl rounded-2xl p-6 border border-indigo-500/30">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-indigo-200 text-sm mb-1">Session moy.</p>
              <p className="text-2xl font-bold text-white">{stats.avgSessionTime}</p>
              <p className="text-indigo-300 text-xs">Engagement</p>
            </div>
            <BarChart3 className="w-8 h-8 text-indigo-400" />
          </div>
        </div>
      </div>

      {/* Plateformes connectées */}
      <div className="bg-white/10 backdrop-blur-xl rounded-2xl p-8 border border-white/20">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-xl font-bold text-white">🔗 Plateformes connectées</h3>
          <button
            onClick={loadConnectedPlatforms}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-xl flex items-center gap-2"
          >
            <RefreshCw className="w-4 h-4" />
            Actualiser
          </button>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {connectedPlatforms.map((platform, index) => (
            <div key={index} className="bg-black/20 rounded-xl p-4 border border-white/10">
              <div className="flex items-center justify-between mb-3">
                <h4 className="font-semibold text-white">{platform.name}</h4>
                <div className={`w-3 h-3 rounded-full ${
                  platform.status === 'connected' ? 'bg-green-400' :
                  platform.status === 'syncing' ? 'bg-yellow-400 animate-pulse' :
                  'bg-red-400'
                }`}></div>
              </div>
              <div className="space-y-1 text-sm">
                <p className="text-gray-300">
                  <strong>Produits:</strong> {platform.products_count.toLocaleString()}
                </p>
                <p className="text-gray-300">
                  <strong>Plateforme:</strong> {platform.platform}
                </p>
                <p className="text-gray-300">
                  <strong>Connecté:</strong> {new Date(platform.connected_at).toLocaleDateString('fr-FR')}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Actions rapides */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <button
          onClick={() => setActiveTab('catalog')}
          className="bg-gradient-to-br from-blue-500 to-cyan-600 hover:from-blue-400 hover:to-cyan-500 text-white p-6 rounded-2xl transition-all hover:scale-105 shadow-lg"
        >
          <Package className="w-8 h-8 mb-3" />
          <h4 className="font-bold mb-2">Gérer le catalogue</h4>
          <p className="text-sm opacity-90">{stats.products} produits</p>
        </button>
        
        <button
          onClick={() => setActiveTab('robot')}
          className="bg-gradient-to-br from-purple-500 to-pink-600 hover:from-purple-400 hover:to-pink-500 text-white p-6 rounded-2xl transition-all hover:scale-105 shadow-lg"
        >
          <Bot className="w-8 h-8 mb-3" />
          <h4 className="font-bold mb-2">Configuration Robot</h4>
          <p className="text-sm opacity-90">OmnIA IA</p>
        </button>
        
        <button
          onClick={() => setActiveTab('conversations')}
          className="bg-gradient-to-br from-green-500 to-emerald-600 hover:from-green-400 hover:to-emerald-500 text-white p-6 rounded-2xl transition-all hover:scale-105 shadow-lg"
        >
          <MessageSquare className="w-8 h-8 mb-3" />
          <h4 className="font-bold mb-2">Conversations</h4>
          <p className="text-sm opacity-90">{stats.conversations} échanges</p>
        </button>
        
        <button
          onClick={() => window.open('/robot', '_blank')}
          className="bg-gradient-to-br from-orange-500 to-red-600 hover:from-orange-400 hover:to-red-500 text-white p-6 rounded-2xl transition-all hover:scale-105 shadow-lg"
        >
          <Eye className="w-8 h-8 mb-3" />
          <h4 className="font-bold mb-2">Tester OmnIA</h4>
          <p className="text-sm opacity-90">Interface robot</p>
        </button>
      </div>
    </div>
  );

  const renderCatalog = () => (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-white">📦 Gestion du Catalogue</h2>
        <div className="flex gap-3">
          <button
            onClick={() => setActiveTab('integration')}
            className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-xl flex items-center gap-2"
          >
            <Upload className="w-4 h-4" />
            Importer
          </button>
          <button
            onClick={() => setActiveTab('enriched')}
            className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-xl flex items-center gap-2"
          >
            <Brain className="w-4 h-4" />
            Produits enrichis
          </button>
        </div>
      </div>
      <CatalogManagement />
    </div>
  );

  const renderIntegration = () => (
    <div className="space-y-8">
      <h2 className="text-2xl font-bold text-white">🔗 Intégration E-commerce</h2>
      <EcommerceIntegration onConnected={handlePlatformConnected} />
    </div>
  );

  const renderEnriched = () => (
    <div className="space-y-8">
      <h2 className="text-2xl font-bold text-white">🧠 Produits Enrichis IA</h2>
      <ProductsEnrichedTable />
    </div>
  );

  const renderConversations = () => (
    <div className="space-y-8">
      <h2 className="text-2xl font-bold text-white">💬 Historique des Conversations</h2>
      <ConversationHistory />
    </div>
  );

  const renderRobot = () => (
    <div className="space-y-8">
      <h2 className="text-2xl font-bold text-white">🤖 Configuration Robot OmnIA</h2>
      <OmniaRobotTab />
    </div>
  );

  const renderMLTraining = () => (
    <div className="space-y-8">
      <h2 className="text-2xl font-bold text-white">🧠 Entraînement IA</h2>
      <MLTrainingDashboard />
    </div>
  );

  const renderAnalytics = () => (
    <div className="space-y-8">
      <h2 className="text-2xl font-bold text-white">📊 Analytics Avancées</h2>
      
      {/* Graphiques de performance */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white/10 backdrop-blur-xl rounded-2xl p-6 border border-white/20">
          <h3 className="text-lg font-bold text-white mb-4">📈 Conversations par jour</h3>
          <div className="h-64 flex items-end gap-2">
            {[45, 67, 52, 78, 89, 65, 94].map((height, index) => (
              <div key={index} className="flex-1 bg-gradient-to-t from-cyan-500 to-blue-600 rounded-t-lg" style={{ height: `${height}%` }}>
                <div className="text-white text-xs text-center mt-2">{height}</div>
              </div>
            ))}
          </div>
          <div className="flex justify-between text-gray-400 text-sm mt-2">
            <span>Lun</span><span>Mar</span><span>Mer</span><span>Jeu</span><span>Ven</span><span>Sam</span><span>Dim</span>
          </div>
        </div>
        
        <div className="bg-white/10 backdrop-blur-xl rounded-2xl p-6 border border-white/20">
          <h3 className="text-lg font-bold text-white mb-4">🎯 Taux de conversion</h3>
          <div className="text-center">
            <div className="text-4xl font-bold text-green-400 mb-2">{stats.conversions}%</div>
            <div className="text-gray-300">Visiteurs → Acheteurs</div>
            <div className="mt-4 w-full bg-gray-700 rounded-full h-3">
              <div 
                className="bg-gradient-to-r from-green-500 to-emerald-600 h-3 rounded-full" 
                style={{ width: `${stats.conversions}%` }}
              ></div>
            </div>
          </div>
        </div>
      </div>

      {/* Produits populaires */}
      <div className="bg-white/10 backdrop-blur-xl rounded-2xl p-6 border border-white/20">
        <h3 className="text-lg font-bold text-white mb-4">🔥 Produits les plus demandés</h3>
        <div className="space-y-3">
          {[
            { name: 'Canapé ALYANA Beige', requests: 89, conversions: 34 },
            { name: 'Table AUREA Ø100cm', requests: 67, conversions: 28 },
            { name: 'Chaise INAYA Gris', requests: 45, conversions: 19 }
          ].map((product, index) => (
            <div key={index} className="flex items-center justify-between p-3 bg-black/20 rounded-lg">
              <div>
                <div className="font-semibold text-white">{product.name}</div>
                <div className="text-gray-400 text-sm">{product.requests} demandes</div>
              </div>
              <div className="text-right">
                <div className="text-green-400 font-bold">{product.conversions} ventes</div>
                <div className="text-gray-400 text-sm">
                  {Math.round((product.conversions / product.requests) * 100)}% conversion
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  const renderSystemStatus = () => (
    <div className="space-y-8">
      <h2 className="text-2xl font-bold text-white">⚙️ État du Système</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* API Status */}
        <div className="bg-white/10 backdrop-blur-xl rounded-2xl p-6 border border-white/20">
          <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
            <Server className="w-5 h-5 text-green-400" />
            APIs
          </h3>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-gray-300">DeepSeek IA</span>
              <CheckCircle className="w-5 h-5 text-green-400" />
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-300">Whisper STT</span>
              <CheckCircle className="w-5 h-5 text-green-400" />
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-300">ElevenLabs TTS</span>
              <CheckCircle className="w-5 h-5 text-green-400" />
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-300">Supabase DB</span>
              <CheckCircle className="w-5 h-5 text-green-400" />
            </div>
          </div>
        </div>

        {/* Performance */}
        <div className="bg-white/10 backdrop-blur-xl rounded-2xl p-6 border border-white/20">
          <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
            <Zap className="w-5 h-5 text-yellow-400" />
            Performance
          </h3>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-gray-300">Temps de réponse</span>
              <span className="text-green-400 font-bold">< 200ms</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-300">Uptime</span>
              <span className="text-green-400 font-bold">99.9%</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-300">Erreurs</span>
              <span className="text-green-400 font-bold">0.1%</span>
            </div>
          </div>
        </div>

        {/* Stockage */}
        <div className="bg-white/10 backdrop-blur-xl rounded-2xl p-6 border border-white/20">
          <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
            <Database className="w-5 h-5 text-blue-400" />
            Stockage
          </h3>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-gray-300">Base de données</span>
              <span className="text-blue-400 font-bold">2.4 GB</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-300">Images</span>
              <span className="text-blue-400 font-bold">890 MB</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-300">Logs</span>
              <span className="text-blue-400 font-bold">156 MB</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-purple-900">
      {/* Background Effects */}
      <div className="absolute inset-0 opacity-20">
        <div className="absolute top-20 left-20 w-72 h-72 bg-cyan-500/30 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-20 right-20 w-96 h-96 bg-purple-500/20 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '2s' }}></div>
      </div>

      {/* Header fixe */}
      <header className="relative z-10 bg-black/20 backdrop-blur-xl border-b border-white/10 sticky top-0">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <Logo size="md" />
            
            <div className="flex items-center gap-4">
              <div className="text-white text-right">
                <div className="font-semibold">Decora Home</div>
                <div className="text-cyan-300 text-sm">demo@decorahome.fr</div>
              </div>
              
              <button
                onClick={onLogout}
                className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-xl transition-all"
              >
                Déconnexion
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Navigation Tabs - Design fixe */}
        <div className="bg-black/20 backdrop-blur-xl rounded-2xl p-2 border border-white/20 mb-8 sticky top-20 z-20">
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setActiveTab('dashboard')}
              className={`px-4 py-3 rounded-xl font-semibold transition-all flex items-center gap-2 ${
                activeTab === 'dashboard'
                  ? 'bg-gradient-to-r from-cyan-500 to-blue-600 text-white shadow-lg'
                  : 'bg-white/10 text-gray-300 hover:bg-white/20 hover:text-white'
              }`}
            >
              <BarChart3 className="w-4 h-4" />
              Dashboard
            </button>
            
            <button
              onClick={() => setActiveTab('catalog')}
              className={`px-4 py-3 rounded-xl font-semibold transition-all flex items-center gap-2 ${
                activeTab === 'catalog'
                  ? 'bg-gradient-to-r from-cyan-500 to-blue-600 text-white shadow-lg'
                  : 'bg-white/10 text-gray-300 hover:bg-white/20 hover:text-white'
              }`}
            >
              <Package className="w-4 h-4" />
              Catalogue
            </button>
            
            <button
              onClick={() => setActiveTab('integration')}
              className={`px-4 py-3 rounded-xl font-semibold transition-all flex items-center gap-2 ${
                activeTab === 'integration'
                  ? 'bg-gradient-to-r from-cyan-500 to-blue-600 text-white shadow-lg'
                  : 'bg-white/10 text-gray-300 hover:bg-white/20 hover:text-white'
              }`}
            >
              <Upload className="w-4 h-4" />
              Import
            </button>
            
            <button
              onClick={() => setActiveTab('enriched')}
              className={`px-4 py-3 rounded-xl font-semibold transition-all flex items-center gap-2 ${
                activeTab === 'enriched'
                  ? 'bg-gradient-to-r from-cyan-500 to-blue-600 text-white shadow-lg'
                  : 'bg-white/10 text-gray-300 hover:bg-white/20 hover:text-white'
              }`}
            >
              <Brain className="w-4 h-4" />
              IA Enrichi
            </button>
            
            <button
              onClick={() => setActiveTab('robot')}
              className={`px-4 py-3 rounded-xl font-semibold transition-all flex items-center gap-2 ${
                activeTab === 'robot'
                  ? 'bg-gradient-to-r from-cyan-500 to-blue-600 text-white shadow-lg'
                  : 'bg-white/10 text-gray-300 hover:bg-white/20 hover:text-white'
              }`}
            >
              <Bot className="w-4 h-4" />
              Robot
            </button>
            
            <button
              onClick={() => setActiveTab('conversations')}
              className={`px-4 py-3 rounded-xl font-semibold transition-all flex items-center gap-2 ${
                activeTab === 'conversations'
                  ? 'bg-gradient-to-r from-cyan-500 to-blue-600 text-white shadow-lg'
                  : 'bg-white/10 text-gray-300 hover:bg-white/20 hover:text-white'
              }`}
            >
              <MessageSquare className="w-4 h-4" />
              Conversations
            </button>
            
            <button
              onClick={() => setActiveTab('ml')}
              className={`px-4 py-3 rounded-xl font-semibold transition-all flex items-center gap-2 ${
                activeTab === 'ml'
                  ? 'bg-gradient-to-r from-cyan-500 to-blue-600 text-white shadow-lg'
                  : 'bg-white/10 text-gray-300 hover:bg-white/20 hover:text-white'
              }`}
            >
              <Zap className="w-4 h-4" />
              ML Training
            </button>
            
            <button
              onClick={() => setActiveTab('analytics')}
              className={`px-4 py-3 rounded-xl font-semibold transition-all flex items-center gap-2 ${
                activeTab === 'analytics'
                  ? 'bg-gradient-to-r from-cyan-500 to-blue-600 text-white shadow-lg'
                  : 'bg-white/10 text-gray-300 hover:bg-white/20 hover:text-white'
              }`}
            >
              <TrendingUp className="w-4 h-4" />
              Analytics
            </button>
            
            <button
              onClick={() => setActiveTab('system')}
              className={`px-4 py-3 rounded-xl font-semibold transition-all flex items-center gap-2 ${
                activeTab === 'system'
                  ? 'bg-gradient-to-r from-cyan-500 to-blue-600 text-white shadow-lg'
                  : 'bg-white/10 text-gray-300 hover:bg-white/20 hover:text-white'
              }`}
            >
              <Settings className="w-4 h-4" />
              Système
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="min-h-[600px]">
          {activeTab === 'dashboard' && renderDashboard()}
          {activeTab === 'catalog' && renderCatalog()}
          {activeTab === 'integration' && renderIntegration()}
          {activeTab === 'enriched' && renderEnriched()}
          {activeTab === 'conversations' && renderConversations()}
          {activeTab === 'robot' && renderRobot()}
          {activeTab === 'ml' && renderMLTraining()}
          {activeTab === 'analytics' && renderAnalytics()}
          {activeTab === 'system' && renderSystemStatus()}
        </div>
      </div>

      {/* Système de notifications */}
      <NotificationSystem 
        notifications={notifications}
        onRemove={removeNotification}
      />
    </div>
  );
};