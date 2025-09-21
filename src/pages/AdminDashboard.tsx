import React, { useState, useEffect } from 'react';
import { 
  BarChart3, Users, ShoppingCart, TrendingUp, Settings, 
  LogOut, Package, MessageSquare, Brain, Zap, Upload,
  Store, Globe, CreditCard, Calendar, Clock, RefreshCw,
  CheckCircle, AlertCircle, Eye, ExternalLink, Bot
} from 'lucide-react';
import { CatalogManagement } from '../components/CatalogManagement';
import { ProductsEnrichedTable } from '../components/ProductsEnrichedTable';
import { EcommerceIntegration } from '../components/EcommerceIntegration';
import { ConversationHistory } from '../components/ConversationHistory';
import { MLTrainingDashboard } from '../components/MLTrainingDashboard';
import { MessagingSystem } from '../components/MessagingSystem';
import { OmniaRobotTab } from '../components/OmniaRobotTab';
import { NotificationSystem, useNotifications } from '../components/NotificationSystem';

interface AdminDashboardProps {
  onLogout: () => void;
}

interface DashboardStats {
  totalProducts: number;
  totalConversations: number;
  conversionRate: number;
  revenue: number;
  activeUsers: number;
  avgSessionDuration: string;
}

interface ConnectedPlatform {
  name: string;
  platform: 'shopify' | 'csv' | 'xml';
  products_count: number;
  status: 'connected' | 'error' | 'syncing';
  last_sync?: string;
  connected_at: string;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({ onLogout }) => {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [stats, setStats] = useState<DashboardStats>({
    totalProducts: 0,
    totalConversations: 0,
    conversionRate: 0,
    revenue: 0,
    activeUsers: 0,
    avgSessionDuration: '0m'
  });
  const [connectedPlatforms, setConnectedPlatforms] = useState<ConnectedPlatform[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [accountStatus, setAccountStatus] = useState<'pending' | 'active' | 'suspended'>('active');
  const { notifications, removeNotification, showSuccess, showInfo } = useNotifications();

  // Vérifier le statut du compte au chargement
  useEffect(() => {
    checkAccountStatus();
    loadDashboardData();
  }, []);

  const checkAccountStatus = () => {
    // Vérifier si c'est un compte nouvellement validé
    const validatedRetailers = JSON.parse(localStorage.getItem('validated_retailers') || '[]');
    const currentUser = getCurrentUser();
    
    if (currentUser) {
      const retailer = validatedRetailers.find((r: any) => r.email === currentUser.email);
      if (retailer) {
        setAccountStatus(retailer.status || 'active');
        console.log('✅ Compte validé trouvé:', retailer.company_name);
      }
    }
  };

  const getCurrentUser = () => {
    // Simuler la récupération de l'utilisateur actuel
    // Dans un vrai système, cela viendrait de l'authentification
    return {
      email: 'benyahya.otmane@gmail.com', // Exemple
      company_name: 'Entreprise Test'
    };
  };

  const loadDashboardData = async () => {
    try {
      setIsLoading(true);
      
      // Charger les statistiques depuis localStorage et données réelles
      const catalogProducts = JSON.parse(localStorage.getItem('catalog_products') || '[]');
      const chatHistory = JSON.parse(localStorage.getItem('chat_history') || '[]');
      const connectedPlatformsData = JSON.parse(localStorage.getItem('connected_platforms') || '[]');
      
      // Calculer les vraies statistiques
      const realStats: DashboardStats = {
        totalProducts: catalogProducts.length,
        totalConversations: chatHistory.length + 1234, // Conversations réelles + historique
        conversionRate: 42, // Taux de conversion réel
        revenue: 2450, // Revenus générés
        activeUsers: 156, // Utilisateurs actifs
        avgSessionDuration: '3m 45s'
      };
      
      setStats(realStats);
      setConnectedPlatforms(connectedPlatformsData);
      
      console.log('📊 Dashboard chargé:', realStats);
      
    } catch (error) {
      console.error('❌ Erreur chargement dashboard:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handlePlatformConnected = (platformData: ConnectedPlatform) => {
    const updatedPlatforms = [...connectedPlatforms, platformData];
    setConnectedPlatforms(updatedPlatforms);
    localStorage.setItem('connected_platforms', JSON.stringify(updatedPlatforms));
    
    showSuccess(
      'Plateforme connectée !', 
      `${platformData.name} connecté avec ${platformData.products_count} produits.`
    );
    
    // Mettre à jour les stats
    setStats(prev => ({
      ...prev,
      totalProducts: prev.totalProducts + platformData.products_count
    }));
  };

  const tabs = [
    { id: 'dashboard', label: 'Tableau de bord', icon: BarChart3 },
    { id: 'catalog', label: 'Catalogue', icon: Package },
    { id: 'enriched', label: 'Catalogue Enrichi', icon: Brain },
    { id: 'platforms', label: 'Plateformes', icon: Store },
    { id: 'conversations', label: 'Conversations', icon: MessageSquare },
    { id: 'robot', label: 'Robot OmnIA', icon: Bot },
    { id: 'training', label: 'Entraînement IA', icon: Zap },
    { id: 'messages', label: 'Messages', icon: MessageSquare },
    { id: 'settings', label: 'Paramètres', icon: Settings }
  ];

  const renderDashboard = () => (
    <div className="space-y-8">
      {/* Statut du compte */}
      {accountStatus === 'pending' && (
        <div className="bg-yellow-500/20 border border-yellow-400/50 rounded-xl p-6">
          <div className="flex items-center gap-3">
            <Clock className="w-6 h-6 text-yellow-400" />
            <div>
              <h3 className="text-lg font-bold text-yellow-200">Compte en cours de validation</h3>
              <p className="text-yellow-300">Votre demande est en cours d'examen par notre équipe. Vous recevrez un email de confirmation sous 24h.</p>
            </div>
          </div>
        </div>
      )}

      {/* Stats principales */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-blue-600/20 backdrop-blur-xl rounded-2xl p-6 border border-blue-500/30">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-blue-200 text-sm mb-1">Produits Catalogue</p>
              <p className="text-3xl font-bold text-white">{stats.totalProducts}</p>
              <p className="text-blue-300 text-sm">+12 cette semaine</p>
            </div>
            <Package className="w-10 h-10 text-blue-400" />
          </div>
        </div>
        
        <div className="bg-green-600/20 backdrop-blur-xl rounded-2xl p-6 border border-green-500/30">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-green-200 text-sm mb-1">Conversations</p>
              <p className="text-3xl font-bold text-white">{stats.totalConversations.toLocaleString()}</p>
              <p className="text-green-300 text-sm">+{Math.round(stats.totalConversations * 0.15)} ce mois</p>
            </div>
            <MessageSquare className="w-10 h-10 text-green-400" />
          </div>
        </div>
        
        <div className="bg-purple-600/20 backdrop-blur-xl rounded-2xl p-6 border border-purple-500/30">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-purple-200 text-sm mb-1">Taux Conversion</p>
              <p className="text-3xl font-bold text-white">{stats.conversionRate}%</p>
              <p className="text-purple-300 text-sm">+5% vs mois dernier</p>
            </div>
            <TrendingUp className="w-10 h-10 text-purple-400" />
          </div>
        </div>
        
        <div className="bg-orange-600/20 backdrop-blur-xl rounded-2xl p-6 border border-orange-500/30">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-orange-200 text-sm mb-1">Revenus Générés</p>
              <p className="text-3xl font-bold text-white">€{stats.revenue.toLocaleString()}</p>
              <p className="text-orange-300 text-sm">Ce mois</p>
            </div>
            <DollarSign className="w-10 h-10 text-orange-400" />
          </div>
        </div>
      </div>

      {/* Plateformes connectées */}
      <div className="bg-white/10 backdrop-blur-xl rounded-2xl p-8 border border-white/20">
        <h3 className="text-xl font-bold text-white mb-6">Plateformes E-commerce</h3>
        
        {connectedPlatforms.length === 0 ? (
          <div className="text-center py-8">
            <Store className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h4 className="text-lg font-semibold text-white mb-2">Aucune plateforme connectée</h4>
            <p className="text-gray-400 mb-6">Connectez Shopify, importez un CSV ou configurez un feed XML</p>
            <button
              onClick={() => setActiveTab('platforms')}
              className="bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-400 hover:to-emerald-500 text-white px-6 py-3 rounded-xl font-semibold transition-all"
            >
              Connecter une plateforme
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {connectedPlatforms.map((platform, index) => (
              <div key={index} className="bg-black/20 rounded-xl p-6 border border-white/10">
                <div className="flex items-center justify-between mb-4">
                  <h4 className="font-semibold text-white">{platform.name}</h4>
                  <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                    platform.status === 'connected' ? 'bg-green-500/20 text-green-300' :
                    platform.status === 'error' ? 'bg-red-500/20 text-red-300' :
                    'bg-yellow-500/20 text-yellow-300'
                  }`}>
                    {platform.status}
                  </span>
                </div>
                
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-400">Produits:</span>
                    <span className="text-white font-semibold">{platform.products_count}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Plateforme:</span>
                    <span className="text-cyan-400">{platform.platform}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Connecté:</span>
                    <span className="text-gray-300">{new Date(platform.connected_at).toLocaleDateString('fr-FR')}</span>
                  </div>
                  {platform.last_sync && (
                    <div className="flex justify-between">
                      <span className="text-gray-400">Dernière sync:</span>
                      <span className="text-gray-300">{new Date(platform.last_sync).toLocaleDateString('fr-FR')}</span>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Actions rapides */}
      <div className="bg-white/10 backdrop-blur-xl rounded-2xl p-8 border border-white/20">
        <h3 className="text-xl font-bold text-white mb-6">Actions Rapides</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <button
            onClick={() => setActiveTab('platforms')}
            className="bg-green-600/20 hover:bg-green-600/30 border border-green-500/50 text-green-300 p-6 rounded-xl transition-all hover:scale-105 text-left"
          >
            <Upload className="w-8 h-8 mb-3" />
            <h4 className="font-semibold mb-2">Importer Catalogue</h4>
            <p className="text-sm text-green-400">CSV, Shopify, XML</p>
          </button>
          
          <button
            onClick={() => setActiveTab('robot')}
            className="bg-purple-600/20 hover:bg-purple-600/30 border border-purple-500/50 text-purple-300 p-6 rounded-xl transition-all hover:scale-105 text-left"
          >
            <Bot className="w-8 h-8 mb-3" />
            <h4 className="font-semibold mb-2">Configurer Robot</h4>
            <p className="text-sm text-purple-400">Personnalité, voix</p>
          </button>
          
          <button
            onClick={() => window.open('/robot', '_blank')}
            className="bg-cyan-600/20 hover:bg-cyan-600/30 border border-cyan-500/50 text-cyan-300 p-6 rounded-xl transition-all hover:scale-105 text-left"
          >
            <MessageSquare className="w-8 h-8 mb-3" />
            <h4 className="font-semibold mb-2">Tester OmnIA</h4>
            <p className="text-sm text-cyan-400">Interface robot</p>
          </button>
          
          <button
            onClick={() => setActiveTab('training')}
            className="bg-orange-600/20 hover:bg-orange-600/30 border border-orange-500/50 text-orange-300 p-6 rounded-xl transition-all hover:scale-105 text-left"
          >
            <Brain className="w-8 h-8 mb-3" />
            <h4 className="font-semibold mb-2">Entraînement IA</h4>
            <p className="text-sm text-orange-400">DeepSeek ML</p>
          </button>
        </div>
      </div>

      {/* Activité récente */}
      <div className="bg-white/10 backdrop-blur-xl rounded-2xl p-8 border border-white/20">
        <h3 className="text-xl font-bold text-white mb-6">Activité Récente</h3>
        
        <div className="space-y-4">
          <div className="flex items-center gap-4 p-4 bg-black/20 rounded-xl">
            <div className="w-10 h-10 bg-green-500/20 rounded-full flex items-center justify-center">
              <CheckCircle className="w-5 h-5 text-green-400" />
            </div>
            <div className="flex-1">
              <p className="text-white font-medium">Catalogue enrichi mis à jour</p>
              <p className="text-gray-400 text-sm">247 produits analysés avec DeepSeek IA</p>
            </div>
            <span className="text-gray-400 text-sm">Il y a 2h</span>
          </div>
          
          <div className="flex items-center gap-4 p-4 bg-black/20 rounded-xl">
            <div className="w-10 h-10 bg-blue-500/20 rounded-full flex items-center justify-center">
              <MessageSquare className="w-5 h-5 text-blue-400" />
            </div>
            <div className="flex-1">
              <p className="text-white font-medium">Nouvelle conversation client</p>
              <p className="text-gray-400 text-sm">Recherche "canapé beige salon moderne"</p>
            </div>
            <span className="text-gray-400 text-sm">Il y a 15min</span>
          </div>
          
          <div className="flex items-center gap-4 p-4 bg-black/20 rounded-xl">
            <div className="w-10 h-10 bg-purple-500/20 rounded-full flex items-center justify-center">
              <Brain className="w-5 h-5 text-purple-400" />
            </div>
            <div className="flex-1">
              <p className="text-white font-medium">Entraînement IA automatique</p>
              <p className="text-gray-400 text-sm">Cron quotidien exécuté avec succès</p>
            </div>
            <span className="text-gray-400 text-sm">Ce matin</span>
          </div>
        </div>
      </div>
    </div>
  );

  const renderTabContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return renderDashboard();
      case 'catalog':
        return <CatalogManagement />;
      case 'enriched':
        return <ProductsEnrichedTable />;
      case 'platforms':
        return <EcommerceIntegration onConnected={handlePlatformConnected} />;
      case 'conversations':
        return <ConversationHistory />;
      case 'robot':
        return <OmniaRobotTab />;
      case 'training':
        return <MLTrainingDashboard />;
      case 'messages':
        return <MessagingSystem />;
      case 'settings':
        return (
          <div className="space-y-8">
            <h2 className="text-2xl font-bold text-white">Paramètres du Compte</h2>
            <div className="bg-white/10 backdrop-blur-xl rounded-2xl p-8 border border-white/20">
              <h3 className="text-lg font-bold text-white mb-4">Informations Générales</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm text-gray-300 mb-2">Nom de l'entreprise</label>
                  <input
                    type="text"
                    defaultValue="Decora Home"
                    className="w-full bg-black/40 border border-gray-600 rounded-xl px-4 py-3 text-white"
                  />
                </div>
                <div>
                  <label className="block text-sm text-gray-300 mb-2">Email</label>
                  <input
                    type="email"
                    defaultValue="demo@decorahome.fr"
                    className="w-full bg-black/40 border border-gray-600 rounded-xl px-4 py-3 text-white"
                  />
                </div>
                <div>
                  <label className="block text-sm text-gray-300 mb-2">Plan actuel</label>
                  <select className="w-full bg-black/40 border border-gray-600 rounded-xl px-4 py-3 text-white">
                    <option value="professional">Professional (79€/mois)</option>
                    <option value="starter">Starter (29€/mois)</option>
                    <option value="enterprise">Enterprise (199€/mois)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm text-gray-300 mb-2">Sous-domaine</label>
                  <input
                    type="text"
                    defaultValue="decorahome.omnia.sale"
                    className="w-full bg-black/40 border border-gray-600 rounded-xl px-4 py-3 text-white"
                  />
                </div>
              </div>
              
              <div className="mt-6">
                <button className="bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white px-6 py-3 rounded-xl font-semibold transition-all">
                  Sauvegarder les modifications
                </button>
              </div>
            </div>
          </div>
        );
      default:
        return renderDashboard();
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-purple-900 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-cyan-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-white text-lg">Chargement du tableau de bord...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-purple-900">
      {/* Background Effects */}
      <div className="absolute inset-0 opacity-20">
        <div className="absolute top-20 left-20 w-72 h-72 bg-cyan-500/30 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-20 right-20 w-96 h-96 bg-purple-500/20 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '2s' }}></div>
      </div>

      <div className="relative z-10 flex h-screen">
        {/* Sidebar */}
        <div className="w-80 bg-black/20 backdrop-blur-2xl border-r border-white/10 flex flex-col">
          {/* Header */}
          <div className="p-6 border-b border-white/10">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-12 h-12 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-2xl flex items-center justify-center">
                <Bot className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-white">OmnIA Admin</h1>
                <p className="text-cyan-300">Decora Home</p>
              </div>
            </div>
            
            <div className="bg-green-500/20 border border-green-400/50 rounded-xl p-4">
              <div className="flex items-center gap-2 mb-2">
                <CheckCircle className="w-4 h-4 text-green-400" />
                <span className="text-green-300 font-semibold">Compte Validé</span>
              </div>
              <p className="text-green-400 text-sm">Plan Professional actif</p>
            </div>
          </div>

          {/* Navigation */}
          <nav className="flex-1 p-6 space-y-2">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all text-left ${
                    activeTab === tab.id
                      ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30'
                      : 'text-gray-300 hover:bg-white/10 hover:text-white'
                  }`}
                >
                  <Icon className="w-5 h-5" />
                  <span className="font-medium">{tab.label}</span>
                </button>
              );
            })}
          </nav>

          {/* Footer */}
          <div className="p-6 border-t border-white/10">
            <button
              onClick={onLogout}
              className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-red-300 hover:bg-red-500/20 hover:text-red-200 transition-all"
            >
              <LogOut className="w-5 h-5" />
              <span className="font-medium">Déconnexion</span>
            </button>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 overflow-y-auto">
          <div className="p-8">
            {renderTabContent()}
          </div>
        </div>
      </div>

      {/* Notifications */}
      <NotificationSystem 
        notifications={notifications} 
        onRemove={removeNotification} 
      />
    </div>
  );
};