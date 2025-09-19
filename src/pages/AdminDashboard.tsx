import React, { useState, useEffect } from 'react';
import { 
  ShoppingCart, Target, Bot, BarChart3, Brain, Building, Settings,
  LogOut, Package, MessageSquare, Globe, Zap, TrendingUp, Users,
  Store, FileText, Database, Eye, Plus, Calendar, Clock, DollarSign,
  Activity, Wifi, Battery, ChevronRight, ChevronDown, Home
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

interface Universe {
  id: string;
  title: string;
  icon: any;
  color: string;
  description: string;
  subMenus: Array<{
    id: string;
    title: string;
    icon: any;
    description: string;
  }>;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({ onLogout }) => {
  const [activeUniverse, setActiveUniverse] = useState<string | null>(null);
  const [activeSubMenu, setActiveSubMenu] = useState<string | null>(null);
  const [stats, setStats] = useState<DashboardStats>({
    totalConversations: 1234,
    totalProducts: 247,
    conversionRate: 42,
    revenue: 15680,
    activeUsers: 89,
    avgSessionDuration: '3m 45s'
  });
  const { notifications, removeNotification, showSuccess, showInfo } = useNotifications();

  const universes: Universe[] = [
    {
      id: 'ecommerce',
      title: 'E-Commerce',
      icon: ShoppingCart,
      color: 'from-green-500 to-emerald-600',
      description: 'Gestion catalogue et ventes',
      subMenus: [
        { id: 'products-catalog', title: 'Produits & catalogue enrichi', icon: Package, description: 'Gestion complète du catalogue' },
        { id: 'stocks-variants', title: 'Stocks & variantes', icon: Database, description: 'Gestion des stocks et variantes' },
        { id: 'orders-payments', title: 'Commandes & paiements', icon: DollarSign, description: 'Suivi des commandes' },
        { id: 'merchant-feeds', title: 'Flux Google Merchant / marketplaces', icon: Globe, description: 'Flux produits automatiques' }
      ]
    },
    {
      id: 'marketing',
      title: 'Ads & Marketing',
      icon: Target,
      color: 'from-blue-500 to-cyan-600',
      description: 'Publicité et marketing digital',
      subMenus: [
        { id: 'google-ads', title: 'Google Ads (PMax, Shopping)', icon: Target, description: 'Campagnes Google automatiques' },
        { id: 'seo-blog', title: 'SEO & Blog automatique', icon: FileText, description: 'Contenu SEO généré par IA' },
        { id: 'social-ads', title: 'Réseaux sociaux (Meta, TikTok, Insta)', icon: Users, description: 'Publicité sociale' },
        { id: 'roas-analysis', title: 'Analyse ROAS, budgets et campagnes', icon: BarChart3, description: 'Performance publicitaire' }
      ]
    },
    {
      id: 'sales-assistant',
      title: 'Sales Assistant (OmnIA Bot)',
      icon: Bot,
      color: 'from-purple-500 to-pink-600',
      description: 'Assistant IA conversationnel',
      subMenus: [
        { id: 'live-chat', title: 'Chat en temps réel avec clients', icon: MessageSquare, description: 'Interface de chat live' },
        { id: 'product-suggestions', title: 'Suggestions produits automatiques', icon: Zap, description: 'IA de recommandation' },
        { id: 'cart-checkout', title: 'Ajout panier & checkout', icon: ShoppingCart, description: 'Intégration e-commerce' },
        { id: 'conversation-tracking', title: 'Suivi conversations & satisfaction', icon: Activity, description: 'Analytics conversationnelles' }
      ]
    },
    {
      id: 'analytics',
      title: 'Analytics & Insights',
      icon: BarChart3,
      color: 'from-orange-500 to-red-600',
      description: 'Données et performances',
      subMenus: [
        { id: 'sales-analytics', title: 'Ventes (CA, marge, panier moyen)', icon: TrendingUp, description: 'Analytics de vente' },
        { id: 'ads-performance', title: 'Ads performance (Google, Meta, TikTok)', icon: Target, description: 'ROI publicitaire' },
        { id: 'product-feeds', title: 'Flux produits (erreurs, anomalies SEO)', icon: Globe, description: 'Qualité des flux' },
        { id: 'visitor-tracking', title: 'Heatmaps et suivi visiteurs', icon: Eye, description: 'Comportement utilisateur' }
      ]
    },
    {
      id: 'ai-automation',
      title: 'AI & Automatisation',
      icon: Brain,
      color: 'from-cyan-500 to-blue-600',
      description: 'Intelligence artificielle',
      subMenus: [
        { id: 'seo-generation', title: 'Génération SEO auto', icon: FileText, description: 'Titres, descriptions, balises' },
        { id: 'product-recommendations', title: 'Recommandations produits', icon: Zap, description: 'Cross-sell, upsell' },
        { id: 'catalog-enrichment', title: 'Enrichissement catalogue DeepSeek', icon: Database, description: 'IA d\'enrichissement' },
        { id: 'task-automation', title: 'Automatisation des tâches', icon: Settings, description: 'Cron, rappels, alertes' }
      ]
    },
    {
      id: 'showroom',
      title: 'Showroom & Robot Physique',
      icon: Building,
      color: 'from-pink-500 to-purple-600',
      description: 'Robot physique et showroom',
      subMenus: [
        { id: 'robot-management', title: 'Gestion robot d\'accueil', icon: Bot, description: 'Déplacements, dialogues' },
        { id: 'visitor-detection', title: 'Détection visiteurs (caméra + IA)', icon: Eye, description: 'Vision artificielle' },
        { id: 'product-presentation', title: 'Présentation produits en showroom', icon: Package, description: 'Démonstration interactive' },
        { id: 'stock-integration', title: 'Intégration avec stocks réels', icon: Database, description: 'Synchronisation temps réel' }
      ]
    },
    {
      id: 'admin-settings',
      title: 'Admin & Paramètres',
      icon: Settings,
      color: 'from-gray-500 to-slate-600',
      description: 'Administration système',
      subMenus: [
        { id: 'user-management', title: 'Gestion utilisateurs', icon: Users, description: 'Vendeurs, admin' },
        { id: 'api-connections', title: 'Connexions API', icon: Wifi, description: 'Shopify, Google, DeepSeek' },
        { id: 'security-roles', title: 'Sécurité & rôles', icon: Settings, description: 'Permissions et accès' },
        { id: 'backups-logs', title: 'Sauvegardes & logs', icon: Database, description: 'Maintenance système' }
      ]
    }
  ];

  useEffect(() => {
    loadDashboardData();
    showInfo('Interface chargée', 'Bienvenue dans votre interface admin OmnIA !');
  }, []);

  const loadDashboardData = async () => {
    try {
      // Charger les données depuis localStorage si disponibles
      const savedProducts = localStorage.getItem('catalog_products');
      if (savedProducts) {
        const products = JSON.parse(savedProducts);
        setStats(prev => ({ ...prev, totalProducts: products.length }));
      }
      
      console.log('✅ Données dashboard chargées');
    } catch (error) {
      console.error('❌ Erreur chargement dashboard:', error);
    }
  };

  const handleUniverseClick = (universeId: string) => {
    if (activeUniverse === universeId) {
      setActiveUniverse(null);
      setActiveSubMenu(null);
    } else {
      setActiveUniverse(universeId);
      setActiveSubMenu(null);
    }
  };

  const handleSubMenuClick = (subMenuId: string) => {
    setActiveSubMenu(subMenuId);
  };

  const renderLandingPage = () => (
    <div className="space-y-8">
      {/* Header */}
      <div className="text-center mb-12">
        <h1 className="text-4xl md:text-6xl font-bold text-white mb-6">
          Interface Admin
          <span className="block bg-gradient-to-r from-cyan-400 via-blue-400 to-purple-400 bg-clip-text text-transparent">
            OmnIA.sale
          </span>
        </h1>
        <p className="text-xl text-gray-300 max-w-3xl mx-auto">
          Gérez votre assistant IA, catalogue et campagnes marketing depuis une interface unifiée
        </p>
      </div>

      {/* Stats globales */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-6 mb-12">
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

      {/* Univers Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {universes.map((universe) => {
          const Icon = universe.icon;
          return (
            <div
              key={universe.id}
              onClick={() => handleUniverseClick(universe.id)}
              className="group cursor-pointer bg-white/10 backdrop-blur-xl rounded-3xl p-8 border border-white/20 hover:border-cyan-500/50 transition-all hover:scale-105 hover:shadow-2xl"
            >
              <div className={`w-20 h-20 bg-gradient-to-br ${universe.color} rounded-3xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform shadow-2xl`}>
                <Icon className="w-10 h-10 text-white" />
              </div>
              
              <h3 className="text-2xl font-bold text-white mb-3 group-hover:text-cyan-300 transition-colors">
                {universe.title}
              </h3>
              
              <p className="text-gray-300 mb-6 group-hover:text-gray-200 transition-colors">
                {universe.description}
              </p>
              
              <div className="space-y-2">
                {universe.subMenus.slice(0, 3).map((subMenu) => (
                  <div key={subMenu.id} className="flex items-center gap-2 text-sm text-gray-400 group-hover:text-gray-300 transition-colors">
                    <div className="w-2 h-2 bg-cyan-400 rounded-full"></div>
                    <span>{subMenu.title}</span>
                  </div>
                ))}
                {universe.subMenus.length > 3 && (
                  <div className="text-sm text-cyan-400">+{universe.subMenus.length - 3} autres...</div>
                )}
              </div>
              
              <div className="mt-6 flex items-center justify-between">
                <span className="text-cyan-400 font-semibold">Accéder →</span>
                <ChevronRight className="w-5 h-5 text-cyan-400 group-hover:translate-x-1 transition-transform" />
              </div>
            </div>
          );
        })}
      </div>

      {/* Actions rapides */}
      <div className="bg-gradient-to-r from-cyan-500/20 to-blue-600/20 backdrop-blur-xl rounded-2xl p-8 border border-cyan-400/30">
        <h3 className="text-xl font-bold text-white mb-6">Actions rapides</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <button
            onClick={() => {
              setActiveUniverse('ecommerce');
              setActiveSubMenu('products-catalog');
            }}
            className="bg-green-600/20 hover:bg-green-600/30 border border-green-500/50 text-green-300 p-4 rounded-xl transition-all hover:scale-105 flex items-center gap-3"
          >
            <Package className="w-6 h-6" />
            <div className="text-left">
              <div className="font-semibold">Gérer le catalogue</div>
              <div className="text-sm opacity-80">Ajouter/modifier produits</div>
            </div>
          </button>
          
          <button
            onClick={() => {
              setActiveUniverse('sales-assistant');
              setActiveSubMenu('live-chat');
            }}
            className="bg-purple-600/20 hover:bg-purple-600/30 border border-purple-500/50 text-purple-300 p-4 rounded-xl transition-all hover:scale-105 flex items-center gap-3"
          >
            <Bot className="w-6 h-6" />
            <div className="text-left">
              <div className="font-semibold">Configurer OmnIA</div>
              <div className="text-sm opacity-80">Personnalité et voix</div>
            </div>
          </button>
          
          <button
            onClick={() => {
              setActiveUniverse('ai-automation');
              setActiveSubMenu('catalog-enrichment');
            }}
            className="bg-blue-600/20 hover:bg-blue-600/30 border border-blue-500/50 text-blue-300 p-4 rounded-xl transition-all hover:scale-105 flex items-center gap-3"
          >
            <Brain className="w-6 h-6" />
            <div className="text-left">
              <div className="font-semibold">Entraîner l'IA</div>
              <div className="text-sm opacity-80">DeepSeek enrichissement</div>
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

  const renderUniverseContent = () => {
    if (!activeUniverse || !activeSubMenu) return null;

    switch (activeSubMenu) {
      // E-Commerce
      case 'products-catalog':
        return <CatalogManagement />;
      case 'stocks-variants':
        return <ProductsEnrichedTable />;
      case 'orders-payments':
        return <div className="text-center py-20"><ShoppingCart className="w-16 h-16 text-gray-400 mx-auto mb-4" /><h3 className="text-xl font-bold text-white">Commandes & Paiements</h3><p className="text-gray-400">Interface en développement</p></div>;
      case 'merchant-feeds':
        return <GoogleMerchantTab />;
      
      // Marketing
      case 'google-ads':
        return <GoogleAdsTab />;
      case 'seo-blog':
        return <SEOBlogTab />;
      case 'social-ads':
        return <div className="text-center py-20"><Users className="w-16 h-16 text-gray-400 mx-auto mb-4" /><h3 className="text-xl font-bold text-white">Réseaux Sociaux</h3><p className="text-gray-400">Meta Ads, TikTok, Instagram en développement</p></div>;
      case 'roas-analysis':
        return <div className="text-center py-20"><BarChart3 className="w-16 h-16 text-gray-400 mx-auto mb-4" /><h3 className="text-xl font-bold text-white">Analyse ROAS</h3><p className="text-gray-400">Analytics publicitaires en développement</p></div>;
      
      // Sales Assistant
      case 'live-chat':
        return <ConversationHistory />;
      case 'product-suggestions':
        return <OmniaRobotTab />;
      case 'cart-checkout':
        return <EcommerceIntegration onConnected={() => {}} />;
      case 'conversation-tracking':
        return <ConversationHistory />;
      
      // Analytics
      case 'sales-analytics':
        return <div className="text-center py-20"><TrendingUp className="w-16 h-16 text-gray-400 mx-auto mb-4" /><h3 className="text-xl font-bold text-white">Analytics Ventes</h3><p className="text-gray-400">CA, marge, panier moyen en développement</p></div>;
      case 'ads-performance':
        return <GoogleAdsTab />;
      case 'product-feeds':
        return <GoogleMerchantTab />;
      case 'visitor-tracking':
        return <div className="text-center py-20"><Eye className="w-16 h-16 text-gray-400 mx-auto mb-4" /><h3 className="text-xl font-bold text-white">Suivi Visiteurs</h3><p className="text-gray-400">Heatmaps et analytics en développement</p></div>;
      
      // AI & Automation
      case 'seo-generation':
        return <SEOBlogTab />;
      case 'product-recommendations':
        return <AITrainingInterface />;
      case 'catalog-enrichment':
        return <MLTrainingDashboard />;
      case 'task-automation':
        return <div className="text-center py-20"><Settings className="w-16 h-16 text-gray-400 mx-auto mb-4" /><h3 className="text-xl font-bold text-white">Automatisation</h3><p className="text-gray-400">Cron, rappels, alertes en développement</p></div>;
      
      // Showroom
      case 'robot-management':
        return <OmniaRobotTab />;
      case 'visitor-detection':
        return <div className="text-center py-20"><Eye className="w-16 h-16 text-gray-400 mx-auto mb-4" /><h3 className="text-xl font-bold text-white">Détection Visiteurs</h3><p className="text-gray-400">Caméra + IA en développement</p></div>;
      case 'product-presentation':
        return <div className="text-center py-20"><Package className="w-16 h-16 text-gray-400 mx-auto mb-4" /><h3 className="text-xl font-bold text-white">Présentation Produits</h3><p className="text-gray-400">Showroom interactif en développement</p></div>;
      case 'stock-integration':
        return <EcommerceIntegration onConnected={() => {}} />;
      
      // Admin
      case 'user-management':
        return <div className="text-center py-20"><Users className="w-16 h-16 text-gray-400 mx-auto mb-4" /><h3 className="text-xl font-bold text-white">Gestion Utilisateurs</h3><p className="text-gray-400">Vendeurs, admin en développement</p></div>;
      case 'api-connections':
        return <EcommerceIntegration onConnected={() => {}} />;
      case 'security-roles':
        return <div className="text-center py-20"><Settings className="w-16 h-16 text-gray-400 mx-auto mb-4" /><h3 className="text-xl font-bold text-white">Sécurité & Rôles</h3><p className="text-gray-400">Permissions en développement</p></div>;
      case 'backups-logs':
        return <div className="text-center py-20"><Database className="w-16 h-16 text-gray-400 mx-auto mb-4" /><h3 className="text-xl font-bold text-white">Sauvegardes & Logs</h3><p className="text-gray-400">Maintenance en développement</p></div>;
      
      default:
        return null;
    }
  };

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
        {/* Sidebar - Affiché seulement si un univers est sélectionné */}
        {activeUniverse && (
          <div className="w-80 bg-black/20 backdrop-blur-2xl border-r border-white/10 flex flex-col">
            {/* Header */}
            <div className="p-6 border-b border-white/10">
              <button
                onClick={() => {
                  setActiveUniverse(null);
                  setActiveSubMenu(null);
                }}
                className="flex items-center gap-2 text-cyan-400 hover:text-cyan-300 transition-colors mb-4"
              >
                <Home className="w-4 h-4" />
                Retour aux univers
              </button>
              
              <Logo size="md" />
              
              {/* Univers actuel */}
              <div className="mt-4 p-4 bg-blue-500/20 rounded-xl border border-blue-400/30">
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 bg-gradient-to-br ${universes.find(u => u.id === activeUniverse)?.color} rounded-xl flex items-center justify-center`}>
                    {React.createElement(universes.find(u => u.id === activeUniverse)?.icon || Settings, { className: "w-5 h-5 text-white" })}
                  </div>
                  <div>
                    <h3 className="text-white font-bold">{universes.find(u => u.id === activeUniverse)?.title}</h3>
                    <p className="text-blue-300 text-sm">Decora Home</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Navigation sous-menus */}
            <nav className="flex-1 p-6 space-y-2 overflow-y-auto">
              {universes.find(u => u.id === activeUniverse)?.subMenus.map((subMenu) => {
                const SubIcon = subMenu.icon;
                return (
                  <button
                    key={subMenu.id}
                    onClick={() => handleSubMenuClick(subMenu.id)}
                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all text-left ${
                      activeSubMenu === subMenu.id
                        ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 shadow-lg'
                        : 'text-gray-300 hover:bg-white/10 hover:text-white'
                    }`}
                  >
                    <SubIcon className="w-5 h-5" />
                    <div>
                      <div className="font-medium">{subMenu.title}</div>
                      <div className="text-xs opacity-70">{subMenu.description}</div>
                    </div>
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
        )}

        {/* Main Content */}
        <div className="flex-1 overflow-y-auto">
          <div className="p-8">
            {activeUniverse && activeSubMenu ? renderUniverseContent() : renderLandingPage()}
          </div>
        </div>
      </div>
    </div>
  );
};