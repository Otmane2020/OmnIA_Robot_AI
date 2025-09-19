import React, { useState, useEffect } from 'react';
import { 
  BarChart3, Users, ShoppingCart, TrendingUp, Settings, 
  LogOut, Package, MessageSquare, Globe, Zap, Bot, Store,
  Upload, FileText, Database, Brain, Target, Eye, Plus,
  Calendar, Clock, DollarSign, Activity, Wifi, Battery
} from 'lucide-react';
import { Logo } from '../components/Logo';
import { CatalogManagement } from '../components/CatalogManagement';
import { ConversationHistory } from '../components/ConversationHistory';
import { AITrainingInterface } from '../components/AITrainingInterface';
import { EcommerceIntegration } from '../components/EcommerceIntegration';
import { OmniaRobotTab } from '../components/OmniaRobotTab';
import { MLTrainingDashboard } from '../components/MLTrainingDashboard';
import { GoogleAdsTab } from '../components/GoogleAdsTab';
import { GoogleMerchantTab } from '../components/GoogleMerchantTab';
import { SEOBlogTab } from '../components/SEOBlogTab';
import { ProductsEnrichedTable } from '../components/ProductsEnrichedTable';
import { NotificationSystem, useNotifications } from '../components/NotificationSystem';

interface AdminDashboardProps {
  onLogout: () => void;
}

interface DashboardStats {
  totalConversations: number;
  totalProducts: number;
  conversionRate: number;
  revenue: number;
  activeUsers: number;
  avgSessionDuration: string;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({ onLogout }) => {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [stats, setStats] = useState<DashboardStats>({
    totalConversations: 1234,
    totalProducts: 247,
    conversionRate: 42,
    revenue: 15680,
    activeUsers: 89,
    avgSessionDuration: '3m 45s'
  });
  const [isLoading, setIsLoading] = useState(false);
  const { notifications, removeNotification, showSuccess, showInfo } = useNotifications();

  useEffect(() => {
    loadDashboardData();
    showInfo('Interface chargée', 'Bienvenue dans votre interface admin OmnIA !');
  }, []);

  const loadDashboardData = async () => {
    setIsLoading(true);
    try {
      // Simuler le chargement des données
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Charger les données depuis localStorage si disponibles
      const savedProducts = localStorage.getItem('catalog_products');
      if (savedProducts) {
        const products = JSON.parse(savedProducts);
        setStats(prev => ({ ...prev, totalProducts: products.length }));
      }
      
      console.log('✅ Données dashboard chargées');
    } catch (error) {
      console.error('❌ Erreur chargement dashboard:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handlePlatformConnected = (platformData: any) => {
    console.log('🔗 Plateforme connectée:', platformData);
    showSuccess('Plateforme connectée', `${platformData.name} connecté avec succès !`);
    
    // Mettre à jour les stats si des produits ont été importés
    if (platformData.products_count) {
      setStats(prev => ({ 
        ...prev, 
        totalProducts: prev.totalProducts + platformData.products_count 
      }));
    }
  };

  const tabs = [
    { id: 'dashboard', label: 'Dashboard', icon: BarChart3 },
    { id: 'catalog', label: 'Catalogue', icon: Package },
    { id: 'robot', label: 'Robot OmnIA', icon: Bot },
    { id: 'conversations', label: 'Conversations', icon: MessageSquare },
    { id: 'ai-training', label: 'Entraînement IA', icon: Brain },
    { id: 'ml-dashboard', label: 'ML Dashboard', icon: Database },
    { id: 'ecommerce', label: 'E-commerce', icon: Store },
    { id: 'products-enriched', label: 'Catalogue Enrichi', icon: Zap },
    { id: 'google-ads', label: 'Google Ads', icon: Target },
    { id: 'google-merchant', label: 'Google Merchant', icon: Globe },
    { id: 'seo-blog', label: 'SEO Blog', icon: FileText }
  ];

  const renderDashboard = () => (
    <div className="space-y-8">
      {/* Header Dashboard */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold text-white mb-2">Dashboard OmnIA</h2>
          <p className="text-gray-300">Vue d'ensemble de votre assistant IA</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-green-400 rounded-full animate-pulse"></div>
            <span className="text-green-300 font-semibold">OmnIA actif</span>
          </div>
          <button
            onClick={() => window.open('/robot', '_blank')}
            className="bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white px-6 py-3 rounded-xl font-semibold transition-all shadow-lg hover:shadow-cyan-500/40"
          >
            🤖 Tester OmnIA
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-6">
        <div className="bg-blue-600/20 backdrop-blur-xl rounded-2xl p-6 border border-blue-500/30">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-blue-200 text-sm mb-1">Conversations</p>
              <p className="text-3xl font-bold text-white">{stats.totalConversations.toLocaleString()}</p>
              <p className="text-blue-300 text-sm">Ce mois</p>
            </div>
            <MessageSquare className="w-10 h-10 text-blue-400" />
          </div>
        </div>
        
        <div className="bg-green-600/20 backdrop-blur-xl rounded-2xl p-6 border border-green-500/30">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-green-200 text-sm mb-1">Produits</p>
              <p className="text-3xl font-bold text-white">{stats.totalProducts}</p>
              <p className="text-green-300 text-sm">Catalogue</p>
            </div>
            <Package className="w-10 h-10 text-green-400" />
          </div>
        </div>
        
        <div className="bg-purple-600/20 backdrop-blur-xl rounded-2xl p-6 border border-purple-500/30">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-purple-200 text-sm mb-1">Conversions</p>
              <p className="text-3xl font-bold text-white">{stats.conversionRate}%</p>
              <p className="text-purple-300 text-sm">Taux</p>
            </div>
            <TrendingUp className="w-10 h-10 text-purple-400" />
          </div>
        </div>
        
        <div className="bg-orange-600/20 backdrop-blur-xl rounded-2xl p-6 border border-orange-500/30">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-orange-200 text-sm mb-1">Revenus</p>
              <p className="text-3xl font-bold text-white">€{stats.revenue.toLocaleString()}</p>
              <p className="text-orange-300 text-sm">Ce mois</p>
            </div>
            <DollarSign className="w-10 h-10 text-orange-400" />
          </div>
        </div>
        
        <div className="bg-cyan-600/20 backdrop-blur-xl rounded-2xl p-6 border border-cyan-500/30">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-cyan-200 text-sm mb-1">Utilisateurs</p>
              <p className="text-3xl font-bold text-white">{stats.activeUsers}</p>
              <p className="text-cyan-300 text-sm">Actifs</p>
            </div>
            <Users className="w-10 h-10 text-cyan-400" />
          </div>
        </div>
        
        <div className="bg-pink-600/20 backdrop-blur-xl rounded-2xl p-6 border border-pink-500/30">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-pink-200 text-sm mb-1">Session</p>
              <p className="text-3xl font-bold text-white">{stats.avgSessionDuration}</p>
              <p className="text-pink-300 text-sm">Durée moy.</p>
            </div>
            <Clock className="w-10 h-10 text-pink-400" />
          </div>
        </div>
      </div>

      {/* Graphiques et activité récente */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Graphique des conversations */}
        <div className="bg-white/10 backdrop-blur-xl rounded-2xl p-8 border border-white/20">
          <h3 className="text-xl font-bold text-white mb-6">Conversations par jour</h3>
          <div className="h-64 flex items-end justify-between gap-2">
            {[45, 67, 89, 123, 98, 156, 134].map((value, index) => (
              <div key={index} className="flex-1 flex flex-col items-center">
                <div 
                  className="w-full bg-gradient-to-t from-cyan-500 to-blue-600 rounded-t-lg transition-all duration-1000 hover:from-cyan-400 hover:to-blue-500"
                  style={{ height: `${(value / 156) * 100}%` }}
                ></div>
                <span className="text-gray-400 text-xs mt-2">
                  {new Date(Date.now() - (6 - index) * 24 * 60 * 60 * 1000).toLocaleDateString('fr-FR', { weekday: 'short' })}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Activité récente */}
        <div className="bg-white/10 backdrop-blur-xl rounded-2xl p-8 border border-white/20">
          <h3 className="text-xl font-bold text-white mb-6">Activité récente</h3>
          <div className="space-y-4">
            <div className="flex items-center gap-4 p-4 bg-black/20 rounded-xl">
              <div className="w-10 h-10 bg-green-500/30 rounded-full flex items-center justify-center">
                <Bot className="w-5 h-5 text-green-400" />
              </div>
              <div className="flex-1">
                <p className="text-white font-semibold">Nouvelle conversation</p>
                <p className="text-gray-400 text-sm">Client recherche canapé moderne</p>
              </div>
              <span className="text-gray-500 text-xs">Il y a 2 min</span>
            </div>
            
            <div className="flex items-center gap-4 p-4 bg-black/20 rounded-xl">
              <div className="w-10 h-10 bg-blue-500/30 rounded-full flex items-center justify-center">
                <ShoppingCart className="w-5 h-5 text-blue-400" />
              </div>
              <div className="flex-1">
                <p className="text-white font-semibold">Produit ajouté au panier</p>
                <p className="text-gray-400 text-sm">Table AUREA Ø100cm - 499€</p>
              </div>
              <span className="text-gray-500 text-xs">Il y a 5 min</span>
            </div>
            
            <div className="flex items-center gap-4 p-4 bg-black/20 rounded-xl">
              <div className="w-10 h-10 bg-purple-500/30 rounded-full flex items-center justify-center">
                <Brain className="w-5 h-5 text-purple-400" />
              </div>
              <div className="flex-1">
                <p className="text-white font-semibold">IA entraînée</p>
                <p className="text-gray-400 text-sm">247 produits analysés</p>
              </div>
              <span className="text-gray-500 text-xs">Il y a 1h</span>
            </div>
          </div>
        </div>
      </div>

      {/* Actions rapides */}
      <div className="bg-gradient-to-r from-cyan-500/20 to-blue-600/20 backdrop-blur-xl rounded-2xl p-8 border border-cyan-400/30">
        <h3 className="text-xl font-bold text-white mb-6">Actions rapides</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <button
            onClick={() => setActiveTab('catalog')}
            className="bg-green-600/20 hover:bg-green-600/30 border border-green-500/50 text-green-300 p-4 rounded-xl transition-all hover:scale-105 flex items-center gap-3"
          >
            <Package className="w-6 h-6" />
            <div className="text-left">
              <div className="font-semibold">Gérer le catalogue</div>
              <div className="text-sm opacity-80">Ajouter/modifier produits</div>
            </div>
          </button>
          
          <button
            onClick={() => setActiveTab('robot')}
            className="bg-purple-600/20 hover:bg-purple-600/30 border border-purple-500/50 text-purple-300 p-4 rounded-xl transition-all hover:scale-105 flex items-center gap-3"
          >
            <Bot className="w-6 h-6" />
            <div className="text-left">
              <div className="font-semibold">Configurer OmnIA</div>
              <div className="text-sm opacity-80">Personnalité et voix</div>
            </div>
          </button>
          
          <button
            onClick={() => setActiveTab('ai-training')}
            className="bg-blue-600/20 hover:bg-blue-600/30 border border-blue-500/50 text-blue-300 p-4 rounded-xl transition-all hover:scale-105 flex items-center gap-3"
          >
            <Brain className="w-6 h-6" />
            <div className="text-left">
              <div className="font-semibold">Entraîner l'IA</div>
              <div className="text-sm opacity-80">Améliorer les réponses</div>
            </div>
          </button>
          
          <button
            onClick={() => window.open('/robot', '_blank')}
            className="bg-cyan-600/20 hover:bg-cyan-600/30 border border-cyan-500/50 text-cyan-300 p-4 rounded-xl transition-all hover:scale-105 flex items-center gap-3"
          >
            <Eye className="w-6 h-6" />
            <div className="text-left">
              <div className="font-semibold">Tester OmnIA</div>
              <div className="text-sm opacity-80">Interface client</div>
            </div>
          </button>
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
      case 'robot':
        return <OmniaRobotTab />;
      case 'conversations':
        return <ConversationHistory />;
      case 'ai-training':
        return <AITrainingInterface onTrainingComplete={(stats) => console.log('Training completed:', stats)} />;
      case 'ml-dashboard':
        return <MLTrainingDashboard />;
      case 'ecommerce':
        return <EcommerceIntegration onConnected={handlePlatformConnected} />;
      case 'products-enriched':
        return <ProductsEnrichedTable />;
      case 'google-ads':
        return <GoogleAdsTab />;
      case 'google-merchant':
        return <GoogleMerchantTab />;
      case 'seo-blog':
        return <SEOBlogTab />;
      default:
        return renderDashboard();
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-purple-900 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-cyan-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-white text-xl">Chargement de l'interface admin...</p>
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

      {/* Notifications */}
      <NotificationSystem 
        notifications={notifications} 
        onRemove={removeNotification} 
      />

      <div className="relative z-10 flex h-screen">
        {/* Sidebar */}
        <div className="w-80 bg-black/20 backdrop-blur-2xl border-r border-white/10 flex flex-col">
          {/* Header */}
          <div className="p-6 border-b border-white/10">
            <Logo size="md" />
            <div className="mt-4 p-4 bg-blue-500/20 rounded-xl border border-blue-400/30">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-xl flex items-center justify-center">
                  <Store className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h3 className="text-white font-bold">Decora Home</h3>
                  <p className="text-blue-300 text-sm">Plan Professional</p>
                </div>
              </div>
            </div>
          </div>

          {/* Navigation */}
          <nav className="flex-1 p-6 space-y-2 overflow-y-auto">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all text-left ${
                    activeTab === tab.id
                      ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 shadow-lg'
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
              className="w-full flex items-center gap-3 px-4 py-3 text-red-300 hover:text-red-200 hover:bg-red-500/20 rounded-xl transition-all"
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
    </div>
  );
};