import React, { useState, useEffect } from 'react';
import { 
  BarChart3, Users, Package, DollarSign, Calendar, Clock, 
  TrendingUp, MessageSquare, ShoppingCart, Upload, Download,
  Bot, Globe, FileText, Eye, Settings, LogOut, Brain,
  TrendingUp, DollarSign, ShoppingCart, Eye, Plus, X,
  Megaphone, Palette, Monitor, Smartphone, Tablet, Edit, Trash2,
  Battery, Signal, Smartphone, Monitor, Tablet, Megaphone,
  Upload, Download, Loader2
} from 'lucide-react';
import { Logo } from '../components/Logo';
import { CatalogManagement } from '../components/CatalogManagement';
import { EcommerceIntegration } from '../components/EcommerceIntegration';
import { ConversationHistory } from '../components/ConversationHistory';
import { AITrainingInterface } from '../components/AITrainingInterface';
import { MLTrainingDashboard } from '../components/MLTrainingDashboard';
import { OmniaRobotTab } from '../components/OmniaRobotTab';
import { SEOBlogTab } from '../components/SEOBlogTab';
import { ProductsEnrichedTable } from '../components/ProductsEnrichedTable';
import { NotificationSystem, useNotifications } from '../components/NotificationSystem';

interface AdminDashboardProps {
  onLogout: () => void;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({ onLogout }) => {
  const [activeTab, setActiveTab] = useState('dashboard');
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

  const [stats, setStats] = useState({
    totalProducts: 0,
    totalConversations: 0,
    monthlyRevenue: 0,
    conversionRate: 0,
    activeUsers: 0,
    avgSessionDuration: '0m',
    topProducts: [],
    recentActivity: []
  });

  const [isLoading, setIsLoading] = useState(true);
  const [connectedPlatforms, setConnectedPlatforms] = useState<any[]>([]);
  const { notifications, removeNotification, showSuccess, showError, showInfo } = useNotifications();

  // Générer clé de stockage spécifique au revendeur
  const getRetailerStorageKey = (key: string) => {
    if (!currentUser?.email) return key;
    const emailHash = btoa(currentUser.email).replace(/[^a-zA-Z0-9]/g, '').substring(0, 8);
    return `${key}_${emailHash}`;
  };

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setIsLoading(true);
      
      // Charger les données spécifiques au revendeur depuis localStorage
      const catalogProducts = localStorage.getItem(getRetailerStorageKey('catalog_products'));
      const enrichedProducts = localStorage.getItem(getRetailerStorageKey('enriched_products'));
      const csvFileData = localStorage.getItem(getRetailerStorageKey('csv_file_data'));
      const chatHistory = localStorage.getItem('chat_history');
      
      let totalProducts = 0;
      let totalConversations = 0;
      
      // Compter les produits
      if (catalogProducts) {
        try {
          const products = JSON.parse(catalogProducts);
          totalProducts = products.filter((p: any) => p.status === 'active').length;
        } catch (error) {
          console.error('Erreur parsing produits:', error);
        }
      }
      
      // Compter les conversations
      if (chatHistory) {
        try {
          const conversations = JSON.parse(chatHistory);
          totalConversations = conversations.length;
        } catch (error) {
          console.error('Erreur parsing conversations:', error);
        }
      }
      
      // Calculer les statistiques
      const conversionRate = totalConversations > 0 ? Math.round((totalProducts / totalConversations) * 100) : 0;
      const monthlyRevenue = totalProducts * 45; // Estimation basée sur le nombre de produits
      const activeUsers = Math.floor(totalConversations * 0.7); // Estimation
      
      // Charger les plateformes connectées
      const platforms = [];
      if (csvFileData) {
        try {
          const csvData = JSON.parse(csvFileData);
          platforms.push({
            name: `CSV Import (${csvData.filename})`,
            platform: 'csv',
            products_count: csvData.active_products || csvData.total_products || 0,
            status: 'connected',
            connected_at: csvData.imported_at
          });
        } catch (error) {
          console.error('Erreur parsing CSV data:', error);
        }
      }
      
      setStats({
        totalProducts,
        totalConversations,
        monthlyRevenue,
        conversionRate,
        activeUsers,
        avgSessionDuration: '3m 45s',
        topProducts: [
          { name: 'Canapé ALYANA', views: 156, conversions: 12 },
          { name: 'Table AUREA', views: 134, conversions: 8 },
          { name: 'Chaise INAYA', views: 98, conversions: 15 }
        ],
        recentActivity: [
          { type: 'conversation', message: 'Nouvelle conversation client', time: '2 min' },
          { type: 'product', message: 'Produit ajouté au panier', time: '5 min' },
          { type: 'training', message: 'IA entraînée automatiquement', time: '1h' }
        ]
      });
      
      setConnectedPlatforms(platforms);
      
      console.log(`📊 Dashboard chargé pour ${currentUser?.email}:`, {
        produits: totalProducts,
        conversations: totalConversations,
        plateformes: platforms.length
      });
      
    } catch (error) {
      console.error('❌ Erreur chargement dashboard:', error);
      showError('Erreur de chargement', 'Impossible de charger les données du dashboard.');
    } finally {
      setIsLoading(false);
    }
  };

  const handlePlatformConnected = (platformData: any) => {
    setConnectedPlatforms(prev => [...prev, platformData]);
    showSuccess('Plateforme connectée', `${platformData.name} connecté avec succès !`);
    
    // Recharger les données du dashboard
    setTimeout(() => {
      loadDashboardData();
    }, 1000);
  };

  const handleTrainingComplete = (trainingStats: any) => {
    showSuccess('Entraînement terminé', `${trainingStats.products_processed} produits analysés !`);
    
    // Recharger les données
    setTimeout(() => {
      loadDashboardData();
    }, 1000);
  };

  const tabs = [
    { id: 'dashboard', label: 'Dashboard', icon: BarChart3 },
    { id: 'catalog', label: 'Catalogue', icon: Package },
    { id: 'enriched', label: 'Catalogue Enrichi', icon: Brain },
    { id: 'ecommerce', label: 'E-commerce', icon: ShoppingCart },
    { id: 'conversations', label: 'Conversations', icon: MessageSquare },
    { id: 'training', label: 'Entraînement IA', icon: Brain },
    { id: 'ml-dashboard', label: 'ML Dashboard', icon: TrendingUp },
    { id: 'robot', label: 'Robot OmnIA', icon: Bot },
    { id: 'seo-blog', label: 'SEO & Blog', icon: FileText }
  ];

  const renderDashboard = () => (
    <div className="space-y-8">
      {/* Header avec informations utilisateur */}
      <div className="bg-white/10 backdrop-blur-xl rounded-2xl p-8 border border-white/20">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-3xl font-bold text-white mb-2">
              Bienvenue, {currentUser?.company_name || 'Revendeur'} !
            </h2>
            <p className="text-cyan-300 text-lg">
              Interface Admin OmnIA • Plan {currentUser?.plan || 'Professional'}
            </p>
            <div className="flex items-center gap-4 mt-4">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-green-400 rounded-full animate-pulse"></div>
                <span className="text-green-300 font-semibold">OmnIA Actif</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-cyan-400 rounded-full"></div>
                <span className="text-cyan-300">Catalogue Synchronisé</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-purple-400 rounded-full"></div>
                <span className="text-purple-300">IA Entraînée</span>
              </div>
            </div>
          </div>
          <div className="text-right">
            <div className="text-white font-bold text-2xl">{stats.totalProducts}</div>
            <div className="text-gray-300">Produits actifs</div>
            <button
              onClick={() => window.open('/chat', '_blank')}
              className="mt-4 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white px-6 py-3 rounded-xl font-semibold transition-all shadow-lg hover:shadow-cyan-500/30"
            >
              🤖 Tester OmnIA
            </button>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-blue-600/20 backdrop-blur-xl rounded-2xl p-6 border border-blue-500/30">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-blue-200 text-sm mb-1">Conversations</p>
              <p className="text-3xl font-bold text-white mb-1">{stats.totalConversations.toLocaleString()}</p>
              <p className="text-blue-300 text-sm">Ce mois</p>
            </div>
            <MessageSquare className="w-10 h-10 text-blue-400" />
          </div>
        </div>
        
        <div className="bg-green-600/20 backdrop-blur-xl rounded-2xl p-6 border border-green-500/30">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-green-200 text-sm mb-1">Revenus</p>
              <p className="text-3xl font-bold text-white mb-1">€{stats.monthlyRevenue.toLocaleString()}</p>
              <p className="text-green-300 text-sm">Estimés</p>
            </div>
            <DollarSign className="w-10 h-10 text-green-400" />
          </div>
        </div>
        
        <div className="bg-purple-600/20 backdrop-blur-xl rounded-2xl p-6 border border-purple-500/30">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-purple-200 text-sm mb-1">Taux Conversion</p>
              <p className="text-3xl font-bold text-white mb-1">{stats.conversionRate}%</p>
              <p className="text-purple-300 text-sm">Moyen</p>
            </div>
            <TrendingUp className="w-10 h-10 text-purple-400" />
          </div>
        </div>
        
        <div className="bg-orange-600/20 backdrop-blur-xl rounded-2xl p-6 border border-orange-500/30">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-orange-200 text-sm mb-1">Utilisateurs Actifs</p>
              <p className="text-3xl font-bold text-white mb-1">{stats.activeUsers}</p>
              <p className="text-orange-300 text-sm">Derniers 30j</p>
            </div>
            <Users className="w-10 h-10 text-orange-400" />
          </div>
        </div>
      </div>

      {/* Plateformes connectées */}
      <div className="bg-white/10 backdrop-blur-xl rounded-2xl p-8 border border-white/20">
        <h3 className="text-xl font-bold text-white mb-6">Plateformes E-commerce Connectées</h3>
        
        {connectedPlatforms.length === 0 ? (
          <div className="text-center py-8">
            <ShoppingCart className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h4 className="text-lg font-semibold text-white mb-2">Aucune plateforme connectée</h4>
            <p className="text-gray-400 mb-6">
              Connectez votre boutique Shopify ou importez votre catalogue CSV
            </p>
            <button
              onClick={() => setActiveTab('ecommerce')}
              className="bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-400 hover:to-emerald-500 text-white px-6 py-3 rounded-xl font-semibold transition-all"
            >
              Connecter une plateforme
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {connectedPlatforms.map((platform, index) => (
              <div key={index} className="bg-black/20 rounded-xl p-6 border border-white/10">
                <div className="flex items-center gap-3 mb-4">
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                    platform.platform === 'shopify' ? 'bg-green-500/20' :
                    platform.platform === 'csv' ? 'bg-blue-500/20' :
                    'bg-purple-500/20'
                  }`}>
                    {platform.platform === 'shopify' ? (
                      <ShoppingCart className="w-6 h-6 text-green-400" />
                    ) : platform.platform === 'csv' ? (
                      <FileText className="w-6 h-6 text-blue-400" />
                    ) : (
                      <Globe className="w-6 h-6 text-purple-400" />
                    )}
                  </div>
                  <div>
                    <h4 className="font-semibold text-white">{platform.name}</h4>
                    <p className="text-gray-400 text-sm">{platform.products_count} produits</p>
                  </div>
                </div>
                
                <div className="flex items-center justify-between">
                  <span className="bg-green-500/20 text-green-300 px-3 py-1 rounded-full text-xs font-medium">
                    {platform.status}
                  </span>
                  <span className="text-gray-400 text-xs">
                    {new Date(platform.connected_at).toLocaleDateString('fr-FR')}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Produits populaires et activité récente */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Produits populaires */}
        <div className="bg-white/10 backdrop-blur-xl rounded-2xl p-8 border border-white/20">
          <h3 className="text-xl font-bold text-white mb-6">Produits Populaires</h3>
          <div className="space-y-4">
            {stats.topProducts.map((product, index) => (
              <div key={index} className="flex items-center justify-between p-4 bg-black/20 rounded-xl">
                <div>
                  <h4 className="font-semibold text-white">{product.name}</h4>
                  <p className="text-gray-400 text-sm">{product.views} vues • {product.conversions} conversions</p>
                </div>
                <div className="text-right">
                  <div className="text-cyan-400 font-bold">{Math.round((product.conversions / product.views) * 100)}%</div>
                  <div className="text-gray-400 text-xs">Taux conversion</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Activité récente */}
        <div className="bg-white/10 backdrop-blur-xl rounded-2xl p-8 border border-white/20">
          <h3 className="text-xl font-bold text-white mb-6">Activité Récente</h3>
          <div className="space-y-4">
            {stats.recentActivity.map((activity, index) => (
              <div key={index} className="flex items-center gap-4 p-4 bg-black/20 rounded-xl">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                  activity.type === 'conversation' ? 'bg-blue-500/20' :
                  activity.type === 'product' ? 'bg-green-500/20' :
                  'bg-purple-500/20'
                }`}>
                  {activity.type === 'conversation' ? (
                    <MessageSquare className="w-5 h-5 text-blue-400" />
                  ) : activity.type === 'product' ? (
                    <ShoppingCart className="w-5 h-5 text-green-400" />
                  ) : (
                    <Brain className="w-5 h-5 text-purple-400" />
                  )}
                </div>
                <div className="flex-1">
                  <p className="text-white font-medium">{activity.message}</p>
                  <p className="text-gray-400 text-sm">Il y a {activity.time}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Actions rapides */}
      <div className="bg-gradient-to-r from-cyan-500/20 to-blue-600/20 backdrop-blur-xl rounded-2xl p-8 border border-cyan-400/30">
        <h3 className="text-xl font-bold text-white mb-6">Actions Rapides</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <button
            onClick={() => setActiveTab('catalog')}
            className="bg-white/10 hover:bg-white/20 border border-white/20 rounded-xl p-4 transition-all text-left"
          >
            <Package className="w-8 h-8 text-cyan-400 mb-3" />
            <h4 className="font-semibold text-white mb-1">Gérer Catalogue</h4>
            <p className="text-gray-300 text-sm">Ajouter, modifier, supprimer produits</p>
          </button>
          
          <button
            onClick={() => setActiveTab('training')}
            className="bg-white/10 hover:bg-white/20 border border-white/20 rounded-xl p-4 transition-all text-left"
          >
            <Brain className="w-8 h-8 text-purple-400 mb-3" />
            <h4 className="font-semibold text-white mb-1">Entraîner IA</h4>
            <p className="text-gray-300 text-sm">Améliorer les réponses OmnIA</p>
          </button>
          
          <button
            onClick={() => window.open('/chat', '_blank')}
            className="bg-white/10 hover:bg-white/20 border border-white/20 rounded-xl p-4 transition-all text-left"
          >
            <Bot className="w-8 h-8 text-green-400 mb-3" />
            <h4 className="font-semibold text-white mb-1">Tester OmnIA</h4>
            <p className="text-gray-300 text-sm">Interface de conversation</p>
          </button>
          
          <button
            onClick={() => setActiveTab('conversations')}
            className="bg-white/10 hover:bg-white/20 border border-white/20 rounded-xl p-4 transition-all text-left"
          >
            <MessageSquare className="w-8 h-8 text-orange-400 mb-3" />
            <h4 className="font-semibold text-white mb-1">Voir Conversations</h4>
            <p className="text-gray-300 text-sm">Historique et analytics</p>
          </button>
        </div>
      </div>
    </div>
  );

  const renderContent = () => {
    if (isLoading) {
      return (
        <div className="flex items-center justify-center py-20">
          <div className="text-center">
            <Loader2 className="w-16 h-16 text-cyan-400 animate-spin mx-auto mb-4" />
            <p className="text-white text-lg">Chargement du dashboard...</p>
          </div>
        </div>
      );
    }

    switch (activeTab) {
      case 'dashboard':
        return renderDashboard();
      case 'catalog':
        return <CatalogManagement />;
      case 'enriched':
        return <ProductsEnrichedTable />;
      case 'ecommerce':
        return <EcommerceIntegration onConnected={handlePlatformConnected} />;
      case 'conversations':
        return <ConversationHistory />;
      case 'training':
        return <AITrainingInterface onTrainingComplete={handleTrainingComplete} />;
      case 'ml-dashboard':
        return <MLTrainingDashboard />;
      case 'robot':
        return <OmniaRobotTab />;
      case 'seo-blog':
        return <SEOBlogTab />;
      default:
        return renderDashboard();
    }
  };

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
            <Logo size="md" />
            <div className="mt-4 p-4 bg-cyan-500/20 rounded-xl border border-cyan-400/30">
              <div className="text-white font-bold">{currentUser?.company_name || 'Revendeur'}</div>
              <div className="text-cyan-300 text-sm">{currentUser?.email}</div>
              <div className="text-cyan-400 text-xs">Plan {currentUser?.plan || 'Professional'}</div>
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
              className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-gray-300 hover:bg-red-500/20 hover:text-red-300 transition-all"
            >
              <LogOut className="w-5 h-5" />
              <span className="font-medium">Déconnexion</span>
            </button>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 overflow-y-auto">
          <div className="p-8">
            {renderContent()}
          </div>
        </div>
      </div>

      {/* Notification System */}
      <NotificationSystem 
        notifications={notifications}
        onRemove={removeNotification}
      />
    </div>
  );
};