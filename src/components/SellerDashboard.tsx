import React, { useState, useEffect } from 'react';
import { 
  Store, Users, TrendingUp, MessageSquare, Database, Bot, Settings, LogOut,
  BarChart3, Package, DollarSign, Eye, Plus, Upload, Download, RefreshCw
} from 'lucide-react';
import { SellerCatalogManagement } from './SellerCatalogManagement';
import { SellerConversationHistory } from './SellerConversationHistory';
import { SellerAnalytics } from './SellerAnalytics';
import { SellerSettings } from './SellerSettings';
import { NotificationSystem, useNotifications } from './NotificationSystem';

interface Seller {
  id: string;
  email: string;
  company_name: string;
  subdomain: string;
  plan: string;
  status: string;
  contact_name: string;
  phone?: string;
  address?: string;
  city?: string;
  postal_code?: string;
  siret?: string;
  position?: string;
  avatar_url?: string;
  created_at: string;
  validated_at?: string;
  last_login?: string;
}

interface SellerDashboardProps {
  seller: Seller;
  onLogout: () => void;
  onUpdate: () => void;
}

interface SellerStats {
  conversations: number;
  conversions: number;
  products: number;
  revenue: number;
  visitors: number;
  cart_additions: number;
}

export const SellerDashboard: React.FC<SellerDashboardProps> = ({ seller, onLogout, onUpdate }) => {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [stats, setStats] = useState<SellerStats>({
    conversations: 0,
    conversions: 0,
    products: 0,
    revenue: 0,
    visitors: 0,
    cart_additions: 0
  });
  const [isLoading, setIsLoading] = useState(true);
  const { notifications, showSuccess, showError, showInfo, removeNotification } = useNotifications();

  const tabs = [
    { id: 'dashboard', label: 'Tableau de bord', icon: BarChart3 },
    { id: 'products', label: 'Mes Produits', icon: Package },
    { id: 'conversations', label: 'Conversations', icon: MessageSquare },
    { id: 'analytics', label: 'Analytics', icon: TrendingUp },
    { id: 'robot', label: 'Mon Robot IA', icon: Bot },
    { id: 'subscription', label: 'Abonnement', icon: CreditCard },
    { id: 'settings', label: 'Paramètres', icon: Settings }
  ];

  useEffect(() => {
    loadSellerStats();
  }, [seller.id]);

  const loadSellerStats = async () => {
    try {
      setIsLoading(true);
      
      // Toujours partir de zéro pour un nouveau vendeur
      const realStats = {
        conversations: getSellerConversationsCount(seller.id),
        conversions: 0,
        products: getSellerProductsCount(seller.id),
        revenue: 0,
        visitors: 0,
        cart_additions: 0
      };
      
      setStats(realStats);
      console.log('📊 Stats vendeur réelles:', realStats);
      
    } catch (error) {
      console.error('❌ Erreur chargement stats vendeur:', error);
      showError('Erreur de chargement', 'Impossible de charger les statistiques.');
    } finally {
      setIsLoading(false);
    }
  };

  const getSellerProductsCount = (sellerId: string): number => {
    try {
      const savedProducts = localStorage.getItem(`seller_${sellerId}_products`);
      if (savedProducts) {
        const products = JSON.parse(savedProducts);
        return products.filter((p: any) => p.status === 'active').length;
      }
    } catch (error) {
      console.error('Erreur comptage produits:', error);
    }
    return 0;
  };

  const getSellerConversationsCount = (sellerId: string): number => {
    try {
      const savedConversations = localStorage.getItem(`seller_${sellerId}_conversations`);
      if (savedConversations) {
        const conversations = JSON.parse(savedConversations);
        return conversations.length;
      }
    } catch (error) {
      console.error('Erreur comptage conversations:', error);
    }
    return 0;
  };

  const renderDashboard = () => (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">Dashboard {seller.company_name}</h1>
          <p className="text-gray-300">Interface personnalisée pour {seller.contact_name}</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-xl flex items-center justify-center">
            <Store className="w-6 h-6 text-white" />
          </div>
          <div>
            <div className="text-white font-bold">{seller.company_name}</div>
            <div className="text-gray-400 text-sm">Plan {seller.plan}</div>
            <div className="text-cyan-400 text-xs">{seller.subdomain}.omnia.sale</div>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-blue-600/20 backdrop-blur-xl rounded-2xl p-6 border border-blue-500/30">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-blue-200 text-sm mb-1">Conversations</p>
              <p className="text-3xl font-bold text-white mb-1">{stats.conversations.toLocaleString()}</p>
              <p className="text-gray-400 text-sm">{stats.conversations === 0 ? 'Aucune conversation' : '+15% ce mois'}</p>
            </div>
            <MessageSquare className="w-10 h-10 text-blue-400" />
          </div>
        </div>
        
        <div className="bg-green-600/20 backdrop-blur-xl rounded-2xl p-6 border border-green-500/30">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-green-200 text-sm mb-1">Conversions</p>
              <p className="text-3xl font-bold text-white mb-1">{stats.conversions}%</p>
              <p className="text-gray-400 text-sm">{stats.conversions === 0 ? 'Aucune conversion' : '+8% ce mois'}</p>
            </div>
            <TrendingUp className="w-10 h-10 text-green-400" />
          </div>
        </div>
        
        <div className="bg-purple-600/20 backdrop-blur-xl rounded-2xl p-6 border border-purple-500/30">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-purple-200 text-sm mb-1">Produits</p>
              <p className="text-3xl font-bold text-white mb-1">{stats.products}</p>
              <p className="text-gray-400 text-sm">{stats.products === 0 ? 'Catalogue vide' : 'Catalogue actif'}</p>
            </div>
            <Package className="w-10 h-10 text-purple-400" />
          </div>
        </div>
        
        <div className="bg-orange-600/20 backdrop-blur-xl rounded-2xl p-6 border border-orange-500/30">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-orange-200 text-sm mb-1">Revenus</p>
              <p className="text-3xl font-bold text-white mb-1">€{stats.revenue.toLocaleString()}</p>
              <p className="text-gray-400 text-sm">{stats.revenue === 0 ? 'Aucun revenu' : '+12% ce mois'}</p>
            </div>
            <DollarSign className="w-10 h-10 text-orange-400" />
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-white/10 backdrop-blur-xl rounded-2xl p-8 border border-white/20">
        <h2 className="text-2xl font-bold text-white mb-6">Actions Rapides</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <button
            onClick={() => setActiveTab('products')}
            className="bg-cyan-500/20 hover:bg-cyan-500/30 border border-cyan-400/50 rounded-xl p-6 text-left transition-all"
          >
            <Upload className="w-8 h-8 text-cyan-400 mb-3" />
            <h3 className="text-lg font-semibold text-white mb-2">Gérer le Catalogue</h3>
            <p className="text-gray-300 text-sm">{stats.products} produits actifs</p>
          </button>
          
          <button
            onClick={() => setActiveTab('robot')}
            className="bg-purple-500/20 hover:bg-purple-500/30 border border-purple-400/50 rounded-xl p-6 text-left transition-all"
          >
            <Bot className="w-8 h-8 text-purple-400 mb-3" />
            <h3 className="text-lg font-semibold text-white mb-2">Configurer OmnIA</h3>
            <p className="text-gray-300 text-sm">Personnaliser votre robot</p>
          </button>
          
          <button
            onClick={() => window.open(`/robot/${seller.subdomain || seller.id}`, '_blank')}
            className="bg-green-500/20 hover:bg-green-500/30 border border-green-400/50 rounded-xl p-6 text-left transition-all"
          >
            <Eye className="w-8 h-8 text-green-400 mb-3" />
            <h3 className="text-lg font-semibold text-white mb-2">Tester OmnIA Robot</h3>
            <p className="text-gray-300 text-sm">/robot/{seller.subdomain || seller.id}</p>
          </button>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="bg-white/10 backdrop-blur-xl rounded-2xl p-8 border border-white/20">
        <h2 className="text-2xl font-bold text-white mb-6">Activité Récente</h2>
        {stats.conversations === 0 && stats.products === 0 ? (
          <div className="text-center py-12">
            <Package className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-bold text-white mb-2">Aucune activité récente</h3>
            <p className="text-gray-400 mb-6">
              Votre activité apparaîtra ici une fois que vous aurez importé des produits et reçu des conversations.
            </p>
            <button
              onClick={() => setActiveTab('products')}
              className="bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white px-6 py-3 rounded-xl font-semibold transition-all"
            >
              Importer vos produits
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {stats.conversations > 0 && (
              <div className="flex items-center gap-4 p-4 bg-green-500/20 rounded-xl border border-green-400/30">
                <MessageSquare className="w-6 h-6 text-green-400" />
                <div>
                  <p className="text-white font-semibold">Conversations actives</p>
                  <p className="text-green-300 text-sm">{stats.conversations} conversations ce mois</p>
                </div>
              </div>
            )}
            {stats.products > 0 && (
              <div className="flex items-center gap-4 p-4 bg-blue-500/20 rounded-xl border border-blue-400/30">
                <Package className="w-6 h-6 text-blue-400" />
                <div>
                  <p className="text-white font-semibold">Catalogue configuré</p>
                  <p className="text-blue-300 text-sm">{stats.products} produits dans votre catalogue</p>
                </div>
              </div>
            )}
            {stats.revenue > 0 && (
              <div className="flex items-center gap-4 p-4 bg-purple-500/20 rounded-xl border border-purple-400/30">
                <Bot className="w-6 h-6 text-purple-400" />
                <div>
                  <p className="text-white font-semibold">Revenus générés</p>
                  <p className="text-purple-300 text-sm">€{stats.revenue} via OmnIA ce mois</p>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard': return renderDashboard();
      case 'products': return <SellerCatalogManagement sellerId={seller.id} />;
      case 'conversations': return <SellerConversationHistory sellerId={seller.id} />;
      case 'analytics': return <SellerAnalytics sellerId={seller.id} />;
      case 'robot': return renderRobotConfig();
      case 'subscription': return <SellerSubscriptionManager seller={seller} onUpdate={onUpdate} />;
      case 'settings': return <SellerSettings seller={seller} onUpdate={onUpdate} />;
      default: return renderDashboard();
    }
  };

  const renderRobotConfig = () => (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-white">Configuration Robot OmnIA</h2>
          <p className="text-gray-300">Personnalisez votre assistant IA</p>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 bg-green-400 rounded-full animate-pulse"></div>
          <span className="text-green-300 text-sm">Robot actif</span>
        </div>
      </div>

      {/* Robot Status */}
      <div className="bg-white/10 backdrop-blur-xl rounded-2xl p-8 border border-white/20">
        <div className="flex items-center gap-6 mb-6">
          <div className="w-20 h-20 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-2xl flex items-center justify-center">
            <Bot className="w-10 h-10 text-white" />
          </div>
          <div>
            <h3 className="text-2xl font-bold text-white mb-2">OmnIA - {seller.company_name}</h3>
            <p className="text-gray-300">Assistant IA spécialisé pour votre catalogue</p>
            <div className="flex items-center gap-2 mt-2">
              <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
              <span className="text-green-300 text-sm">Entraîné sur {stats.products} produits</span>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <button
            onClick={() => window.open(`/robot/${seller.subdomain || seller.id}`, '_blank')}
            className="bg-green-500/20 hover:bg-green-500/30 border border-green-400/50 text-green-300 p-4 rounded-xl font-semibold transition-all"
          >
            <Eye className="w-6 h-6 mx-auto mb-2" />
            Tester Mon Robot
          </button>
          
          <button
            onClick={() => setActiveTab('settings')}
            className="bg-purple-500/20 hover:bg-purple-500/30 border border-purple-400/50 text-purple-300 p-4 rounded-xl font-semibold transition-all"
          >
            <Settings className="w-6 h-6 mx-auto mb-2" />
            Configurer
          </button>
          
          <button
            onClick={() => showInfo('Widget Code', `Copiez ce code sur votre site :\n\n<script src="https://widget.omnia.sale/embed.js"></script>\n<div id="omnia-chat" data-seller="${seller.subdomain}"></div>`)}
            className="bg-orange-500/20 hover:bg-orange-500/30 border border-orange-400/50 text-orange-300 p-4 rounded-xl font-semibold transition-all"
          >
            <Download className="w-6 h-6 mx-auto mb-2" />
            Code Widget
          </button>
        </div>
      </div>

      {/* Robot URL */}
      <div className="bg-gradient-to-r from-cyan-500/20 to-blue-600/20 backdrop-blur-xl rounded-2xl p-6 border border-cyan-400/30">
        <h3 className="text-lg font-bold text-white mb-4">🔗 URL de votre Robot IA</h3>
        <div className="bg-black/40 rounded-lg p-4 font-mono text-cyan-300 break-all">
          https://omnia.sale/robot/{seller.subdomain || seller.id}
        </div>
        <p className="text-cyan-200 text-sm mt-3">
          Partagez cette URL avec vos clients ou intégrez le widget sur votre site
        </p>
      </div>
    </div>
  );

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-purple-900 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-cyan-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-white text-lg">Chargement de votre dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-purple-900">
      <NotificationSystem notifications={notifications} onRemove={removeNotification} />
      
      {/* Background Effects */}
      <div className="absolute inset-0 opacity-20">
        <div className="absolute top-20 left-20 w-72 h-72 bg-cyan-500/30 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-20 right-20 w-96 h-96 bg-purple-500/20 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '2s' }}></div>
      </div>

      <div className="relative z-10 flex h-screen">
        {/* Sidebar */}
        <div className="w-80 bg-slate-800/90 backdrop-blur-2xl border-r border-slate-700/50 p-6">
          {/* Header */}
          <div className="flex items-center gap-3 mb-8">
            <div className="w-12 h-12 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-xl flex items-center justify-center">
              <Store className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-white">{seller.company_name}</h1>
              <p className="text-sm text-cyan-300">{seller.subdomain}.omnia.sale</p>
            </div>
          </div>

          {/* Seller Info */}
          <div className="bg-slate-700/50 rounded-xl p-4 mb-6">
            <div className="text-white font-bold text-sm">{seller.contact_name}</div>
            <div className="text-gray-400 text-xs">{seller.email}</div>
            <div className="text-cyan-400 text-xs">Plan {seller.plan}</div>
          </div>

          {/* Navigation */}
          <nav className="space-y-2 mb-8">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all text-left ${
                    activeTab === tab.id
                      ? 'bg-cyan-500/30 text-white border border-cyan-500/50'
                      : 'text-gray-300 hover:bg-slate-700/50 hover:text-white'
                  }`}
                >
                  <Icon className="w-5 h-5" />
                  <span className="font-medium">{tab.label}</span>
                </button>
              );
            })}
          </nav>

          {/* Status */}
          <div className="bg-green-500/20 border border-green-400/50 rounded-xl p-4 mb-6">
            <div className="flex items-center gap-2 mb-2">
              <Bot className="w-5 h-5 text-green-400" />
              <span className="text-green-300 font-semibold">OmnIA Robot</span>
            </div>
            <p className="text-green-200 text-sm">Assistant IA actif et opérationnel</p>
          </div>
          
          <button
            onClick={onLogout}
            className="w-full bg-red-600/20 hover:bg-red-600/30 text-red-300 px-4 py-3 rounded-xl font-medium border border-red-500/30 transition-all flex items-center gap-2"
          >
            <LogOut className="w-4 h-4" />
            Déconnexion
          </button>
        </div>

        {/* Main Content */}
        <div className="flex-1 overflow-y-auto p-8">
          {renderContent()}
        </div>
      </div>
    </div>
  );
};