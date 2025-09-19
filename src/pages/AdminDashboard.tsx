import React, { useState, useEffect } from 'react';
import { 
  ShoppingCart, Target, Bot, BarChart3, Brain, Building, Settings,
  LogOut, Package, MessageSquare, Globe, Zap, TrendingUp, Users,
  Store, FileText, Database, Eye, Plus, Calendar, Clock, DollarSign,
  Activity, Wifi, Battery, ChevronRight, Home, ArrowLeft, Cog, X
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

interface Solution {
  id: string;
  title: string;
  description: string;
  icon: any;
  color: string;
  stats: {
    value: string;
    label: string;
  };
  features: string[];
  subMenus: Array<{
    id: string;
    title: string;
    icon: any;
    description: string;
  }>;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({ onLogout }) => {
  const [currentView, setCurrentView] = useState<'home' | 'solution' | 'submenu'>('home');
  const [activeSolution, setActiveSolution] = useState<string | null>(null);
  const [activeSubMenu, setActiveSubMenu] = useState<string | null>(null);
  const [showSettings, setShowSettings] = useState(false);
  const { notifications, removeNotification, showSuccess, showInfo } = useNotifications();

  const solutions: Solution[] = [
    {
      id: 'ecommerce',
      title: 'E-Commerce',
      icon: ShoppingCart,
      color: 'from-green-500 to-emerald-600',
      stats: { value: '247', label: 'Produits' },
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
      stats: { value: '4.2x', label: 'ROAS' },
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
      stats: { value: '1,234', label: 'Conversations' },
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
      stats: { value: '42%', label: 'Conversion' },
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
      stats: { value: '95%', label: 'Score IA' },
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
      stats: { value: '89', label: 'Visiteurs' },
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
      stats: { value: '100%', label: 'Uptime' },
      subMenus: [
        { id: 'user-management', title: 'Gestion utilisateurs', icon: Users, description: 'Vendeurs, admin' },
        { id: 'api-connections', title: 'Connexions API', icon: Wifi, description: 'Shopify, Google, DeepSeek' },
        { id: 'security-roles', title: 'Sécurité & rôles', icon: Settings, description: 'Permissions et accès' },
        { id: 'backups-logs', title: 'Sauvegardes & logs', icon: Database, description: 'Maintenance système' }
      ]
    }
  ];

  useEffect(() => {
    showInfo('Interface chargée', 'Bienvenue dans votre interface admin OmnIA !');
  }, []);

  const handleSolutionClick = (solutionId: string) => {
    setActiveSolution(solutionId);
    setActiveSubMenu('dashboard');
    setCurrentView('solution');
  };

  const handleSubMenuClick = (subMenuId: string) => {
    setActiveSubMenu(subMenuId);
    setCurrentView('submenu');
  };

  const handleBackToHome = () => {
    setCurrentView('home');
    setActiveSolution(null);
    setActiveSubMenu(null);
  };

  const renderHomePage = () => (
    <div className="space-y-8">
      {/* Header simple */}
      <div className="text-center">
        <h1 className="text-4xl font-bold text-white mb-4">Solutions OmnIA</h1>
        <p className="text-xl text-gray-300">Choisissez une solution pour commencer</p>
      </div>

      {/* Stats rapides */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-blue-600/20 backdrop-blur-xl rounded-xl p-4 border border-blue-500/30 text-center">
          <div className="text-2xl font-bold text-white">247</div>
          <div className="text-blue-300 text-sm">Produits</div>
        </div>
        <div className="bg-green-600/20 backdrop-blur-xl rounded-xl p-4 border border-green-500/30 text-center">
          <div className="text-2xl font-bold text-white">1,234</div>
          <div className="text-green-300 text-sm">Conversations</div>
        </div>
        <div className="bg-purple-600/20 backdrop-blur-xl rounded-xl p-4 border border-purple-500/30 text-center">
          <div className="text-2xl font-bold text-white">42%</div>
          <div className="text-purple-300 text-sm">Conversion</div>
        </div>
        <div className="bg-orange-600/20 backdrop-blur-xl rounded-xl p-4 border border-orange-500/30 text-center">
          <div className="text-2xl font-bold text-white">€15.6k</div>
          <div className="text-orange-300 text-sm">Revenus</div>
        </div>
      </div>

      {/* Solutions Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {solutions.map((solution) => {
          const Icon = solution.icon;
          return (
            <div
              key={solution.id}
              onClick={() => handleSolutionClick(solution.id)}
              className="group cursor-pointer bg-white/10 backdrop-blur-xl rounded-2xl p-6 border border-white/20 hover:border-cyan-500/50 transition-all hover:scale-105"
            >
              <div className={`w-16 h-16 bg-gradient-to-br ${solution.color} rounded-2xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform shadow-xl`}>
                <Icon className="w-8 h-8 text-white" />
              </div>
              
              <h3 className="text-xl font-bold text-white mb-2 group-hover:text-cyan-300 transition-colors">
                {solution.title}
              </h3>
              
              <p className="text-gray-300 mb-4 group-hover:text-gray-200 transition-colors text-sm">
                {solution.description}
              </p>

              {/* Stat principale */}
              <div className="bg-black/20 rounded-xl p-3 mb-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-cyan-400">{solution.stats.value}</div>
                  <div className="text-gray-300 text-sm">{solution.stats.label}</div>
                </div>
              </div>

              {/* Features preview */}
              <div className="space-y-1 mb-4">
                {solution.features.slice(0, 3).map((feature, index) => (
                  <div key={index} className="text-xs text-gray-400 flex items-center gap-2">
                    <div className="w-1 h-1 bg-cyan-400 rounded-full"></div>
                    {feature}
                  </div>
                ))}
                {solution.features.length > 3 && (
                  <div className="text-xs text-gray-500">+{solution.features.length - 3} autres</div>
                )}
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-cyan-400 font-semibold text-sm">Accéder</span>
                <ChevronRight className="w-5 h-5 text-cyan-400 group-hover:translate-x-1 transition-transform" />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );

  const renderSolutionDashboard = () => {
    const solution = solutions.find(s => s.id === activeSolution);
    if (!solution) return null;

    const Icon = solution.icon;
    
    return (
      <div className="space-y-8">
        {/* Header solution */}
        <div className="text-center">
          <div className={`w-20 h-20 bg-gradient-to-br ${solution.color} rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-2xl`}>
            <Icon className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-4xl font-bold text-white mb-4">{solution.title}</h1>
          <p className="text-xl text-gray-300">{solution.description}</p>
        </div>

        {/* Stats spécifiques */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {solution.id === 'ecommerce' && (
            <>
              <div className="bg-green-600/20 backdrop-blur-xl rounded-2xl p-6 border border-green-500/30">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-green-200 text-sm mb-1">Produits</p>
                    <p className="text-3xl font-bold text-white">247</p>
                    <p className="text-green-300 text-sm">Catalogue</p>
                  </div>
                  <Package className="w-10 h-10 text-green-400" />
                </div>
              </div>
              <div className="bg-blue-600/20 backdrop-blur-xl rounded-2xl p-6 border border-blue-500/30">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-blue-200 text-sm mb-1">Commandes</p>
                    <p className="text-3xl font-bold text-white">156</p>
                    <p className="text-blue-300 text-sm">Ce mois</p>
                  </div>
                  <ShoppingCart className="w-10 h-10 text-blue-400" />
                </div>
              </div>
              <div className="bg-purple-600/20 backdrop-blur-xl rounded-2xl p-6 border border-purple-500/30">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-purple-200 text-sm mb-1">CA</p>
                    <p className="text-3xl font-bold text-white">€15.6k</p>
                    <p className="text-purple-300 text-sm">Revenus</p>
                  </div>
                  <DollarSign className="w-10 h-10 text-purple-400" />
                </div>
              </div>
              <div className="bg-orange-600/20 backdrop-blur-xl rounded-2xl p-6 border border-orange-500/30">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-orange-200 text-sm mb-1">Conversion</p>
                    <p className="text-3xl font-bold text-white">42%</p>
                    <p className="text-orange-300 text-sm">Taux</p>
                  </div>
                  <TrendingUp className="w-10 h-10 text-orange-400" />
                </div>
              </div>
            </>
          )}

          {solution.id === 'marketing' && (
            <>
              <div className="bg-blue-600/20 backdrop-blur-xl rounded-2xl p-6 border border-blue-500/30">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-blue-200 text-sm mb-1">Dépenses Ads</p>
                    <p className="text-3xl font-bold text-white">€2,450</p>
                    <p className="text-blue-300 text-sm">Ce mois</p>
                  </div>
                  <Target className="w-10 h-10 text-blue-400" />
                </div>
              </div>
              <div className="bg-green-600/20 backdrop-blur-xl rounded-2xl p-6 border border-green-500/30">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-green-200 text-sm mb-1">ROAS</p>
                    <p className="text-3xl font-bold text-white">4.2x</p>
                    <p className="text-green-300 text-sm">Retour</p>
                  </div>
                  <TrendingUp className="w-10 h-10 text-green-400" />
                </div>
              </div>
              <div className="bg-purple-600/20 backdrop-blur-xl rounded-2xl p-6 border border-purple-500/30">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-purple-200 text-sm mb-1">Clics</p>
                    <p className="text-3xl font-bold text-white">1,240</p>
                    <p className="text-purple-300 text-sm">Total</p>
                  </div>
                  <Eye className="w-10 h-10 text-purple-400" />
                </div>
              </div>
              <div className="bg-orange-600/20 backdrop-blur-xl rounded-2xl p-6 border border-orange-500/30">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-orange-200 text-sm mb-1">CTR</p>
                    <p className="text-3xl font-bold text-white">2.7%</p>
                    <p className="text-orange-300 text-sm">Moyen</p>
                  </div>
                  <Activity className="w-10 h-10 text-orange-400" />
                </div>
              </div>
            </>
          )}

          {solution.id === 'sales-assistant' && (
            <>
              <div className="bg-purple-600/20 backdrop-blur-xl rounded-2xl p-6 border border-purple-500/30">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-purple-200 text-sm mb-1">Conversations</p>
                    <p className="text-3xl font-bold text-white">1,234</p>
                    <p className="text-purple-300 text-sm">Total</p>
                  </div>
                  <MessageSquare className="w-10 h-10 text-purple-400" />
                </div>
              </div>
              <div className="bg-green-600/20 backdrop-blur-xl rounded-2xl p-6 border border-green-500/30">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-green-200 text-sm mb-1">Satisfaction</p>
                    <p className="text-3xl font-bold text-white">98%</p>
                    <p className="text-green-300 text-sm">Client</p>
                  </div>
                  <Users className="w-10 h-10 text-green-400" />
                </div>
              </div>
              <div className="bg-blue-600/20 backdrop-blur-xl rounded-2xl p-6 border border-blue-500/30">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-blue-200 text-sm mb-1">Durée moy.</p>
                    <p className="text-3xl font-bold text-white">3m 45s</p>
                    <p className="text-blue-300 text-sm">Session</p>
                  </div>
                  <Clock className="w-10 h-10 text-blue-400" />
                </div>
              </div>
              <div className="bg-cyan-600/20 backdrop-blur-xl rounded-2xl p-6 border border-cyan-500/30">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-cyan-200 text-sm mb-1">Conversion</p>
                    <p className="text-3xl font-bold text-white">42%</p>
                    <p className="text-cyan-300 text-sm">Taux</p>
                  </div>
                  <TrendingUp className="w-10 h-10 text-cyan-400" />
                </div>
              </div>
            </>
          )}
        </div>

        {/* Actions rapides */}
        <div className="bg-gradient-to-r from-cyan-500/20 to-blue-600/20 backdrop-blur-xl rounded-2xl p-6 border border-cyan-400/30">
          <h3 className="text-lg font-bold text-white mb-4">Actions rapides</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {solution.subMenus.map((subMenu) => {
              const SubIcon = subMenu.icon;
              return (
                <button
                  key={subMenu.id}
                  onClick={() => handleSubMenuClick(subMenu.id)}
                  className="bg-white/10 hover:bg-white/20 border border-white/20 hover:border-cyan-400/50 text-white p-4 rounded-xl transition-all hover:scale-105 text-left"
                >
                  <SubIcon className="w-6 h-6 text-cyan-400 mb-2" />
                  <div className="font-semibold text-sm">{subMenu.title}</div>
                  <div className="text-xs text-gray-300 mt-1">{subMenu.description}</div>
                </button>
              );
            })}
          </div>
        </div>
      </div>
    );
  };

  const renderSubMenuContent = () => {
    if (!activeSubMenu || activeSubMenu === 'dashboard') return null;

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

      {/* Header fixe */}
      <header className="relative z-10 bg-black/20 backdrop-blur-xl border-b border-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            {/* Titre à gauche */}
            <div className="flex items-center gap-4">
              {currentView !== 'home' && (
                <button
                  onClick={handleBackToHome}
                  className="text-cyan-400 hover:text-cyan-300 transition-colors"
                >
                  <Home className="w-5 h-5" />
                </button>
              )}
              <div>
                <h1 className="text-xl font-bold text-white">
                  {currentView === 'home' ? 'OmnIA Admin' : 
                   activeSolution ? solutions.find(s => s.id === activeSolution)?.title : 'Admin'}
                </h1>
                <p className="text-cyan-300 text-sm">Decora Home</p>
              </div>
            </div>

            {/* Actions à droite */}
            <div className="flex items-center gap-4">
              <button
                onClick={() => window.open('/robot', '_blank')}
                className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-xl transition-all flex items-center gap-2"
              >
                <Bot className="w-4 h-4" />
                Tester OmnIA
              </button>
              
              {/* Engrenage paramètres */}
              <button
                onClick={() => setShowSettings(!showSettings)}
                className="bg-gray-600 hover:bg-gray-700 text-white p-2 rounded-xl transition-all"
              >
                <Cog className="w-5 h-5" />
              </button>
              
              <button
                onClick={onLogout}
                className="bg-red-600 hover:bg-red-700 text-white p-2 rounded-xl transition-all"
              >
                <LogOut className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="relative z-10 flex h-screen pt-16">
        {/* Sidebar - Affiché seulement si solution sélectionnée */}
        {currentView !== 'home' && activeSolution && (
          <div className="w-80 bg-black/20 backdrop-blur-2xl border-r border-white/10 flex flex-col">
            {/* Header solution */}
            <div className="p-6 border-b border-white/10">
              <div className="flex items-center gap-3 mb-4">
                <div className={`w-12 h-12 bg-gradient-to-br ${solutions.find(s => s.id === activeSolution)?.color} rounded-xl flex items-center justify-center`}>
                  {React.createElement(solutions.find(s => s.id === activeSolution)?.icon || Settings, { className: "w-6 h-6 text-white" })}
                </div>
                <div>
                  <h3 className="text-white font-bold">{solutions.find(s => s.id === activeSolution)?.title}</h3>
                  <p className="text-cyan-300 text-sm">Decora Home</p>
                </div>
              </div>
            </div>

            {/* Navigation sous-menus */}
            <nav className="flex-1 p-6 space-y-2 overflow-y-auto">
              {/* Dashboard toujours en premier */}
              <button
                onClick={() => {
                  setActiveSubMenu('dashboard');
                  setCurrentView('solution');
                }}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all text-left ${
                  activeSubMenu === 'dashboard' || currentView === 'solution'
                    ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 shadow-lg'
                    : 'text-gray-300 hover:bg-white/10 hover:text-white'
                }`}
              >
                <BarChart3 className="w-5 h-5" />
                <div>
                  <div className="font-medium">Dashboard</div>
                  <div className="text-xs opacity-70">Vue d'ensemble</div>
                </div>
              </button>

              {/* Sous-menus de la solution */}
              {solutions.find(s => s.id === activeSolution)?.subMenus.map((subMenu) => {
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
          </div>
        )}

        {/* Main Content */}
        <div className="flex-1 overflow-y-auto">
          <div className="p-8">
            {currentView === 'home' ? (
              renderHomePage()
            ) : currentView === 'solution' ? (
              renderSolutionDashboard()
            ) : (
              renderSubMenuContent()
            )}
          </div>
        </div>
      </div>

      {/* Modal paramètres */}
      {showSettings && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-800/95 backdrop-blur-xl rounded-2xl p-8 max-w-md w-full border border-slate-600/50">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-white">Paramètres</h3>
              <button
                onClick={() => setShowSettings(false)}
                className="text-gray-400 hover:text-white transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm text-gray-300 mb-2">Nom du magasin</label>
                <input
                  type="text"
                  defaultValue="Decora Home"
                  className="w-full bg-black/40 border border-gray-600 rounded-xl px-4 py-3 text-white"
                />
              </div>
              
              <div>
                <label className="block text-sm text-gray-300 mb-2">Plan actuel</label>
                <select className="w-full bg-black/40 border border-gray-600 rounded-xl px-4 py-3 text-white">
                  <option value="professional">Professional</option>
                  <option value="enterprise">Enterprise</option>
                </select>
              </div>
              
              <button
                onClick={() => setShowSettings(false)}
                className="w-full bg-cyan-600 hover:bg-cyan-700 text-white py-3 rounded-xl font-semibold transition-all"
              >
                Sauvegarder
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};