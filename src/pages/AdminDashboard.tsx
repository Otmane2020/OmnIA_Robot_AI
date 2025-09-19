import React, { useState, useEffect } from 'react';
import {
  Users, Database, CheckCircle, AlertCircle, CreditCard, Receipt,
  TrendingUp, MessageSquare, ShoppingCart, Upload, Download,
  Bot, Globe, FileText, Eye, Settings, Store, LogOut, BarChart3, Brain,
  Clock, Star, X, ShoppingBag, Target, Search, ArrowLeft, Package,
  Zap, Image, Video, Play, Monitor, Smartphone, Headphones, Camera,
  PieChart, DollarSign, MousePointer, Users as UsersIcon, Mail,
  Truck, Calendar, Tag, Link, ExternalLink, Plus, Edit, Trash2
} from 'lucide-react';
import { Logo } from '../components/Logo';
import { EcommerceIntegration } from '../components/EcommerceIntegration';
import { ShopifyAdminConnector } from '../components/ShopifyAdminConnector';
import { AITrainingInterface } from '../components/AITrainingInterface';
import { OmniaRobotTab } from '../components/OmniaRobotTab';
import { CatalogManagement } from '../components/CatalogManagement';
import { MLTrainingDashboard } from '../components/MLTrainingDashboard';
import { ProductDetailModal } from '../components/ProductDetailModal';
import { AddProductModal } from '../components/AddProductModal';
import { ConversationHistory } from '../components/ConversationHistory';
import { ProductsEnrichedTable } from '../components/ProductsEnrichedTable';
import { GoogleMerchantTab } from '../components/GoogleMerchantTab';
import { GoogleAdsTab } from '../components/GoogleAdsTab';
import { SEOBlogTab } from '../components/SEOBlogTab';
import { GoogleAdsConnector } from '../components/GoogleAdsConnector';
import { NotificationSystem, useNotifications } from '../components/NotificationSystem';
import { supabase } from '../lib/supabase';

interface Universe {
  id: string;
  name: string;
  icon: any;
  description: string;
  color: string;
  modules: UniverseModule[];
}

interface UniverseModule {
  id: string;
  name: string;
  icon: any;
  description: string;
  component: React.ComponentType;
  badge?: string;
  isNew?: boolean;
}

interface AdminDashboardProps {
  onLogout: () => void;
}

interface DashboardStats {
  conversations: number;
  conversions: number;
  products: number;
  revenue: number;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({ onLogout }) => {
  const { notifications, showSuccess, showError, showInfo, removeNotification } = useNotifications();
  
  const [selectedUniverse, setSelectedUniverse] = useState<string | null>(null);
  const [selectedModule, setSelectedModule] = useState<string | null>(null);
  const [stats, setStats] = useState<DashboardStats>({
    conversations: 1234,
    conversions: 42,
    products: getActiveProductsCount(),
    revenue: 2450
  });
  const [connectedPlatforms, setConnectedPlatforms] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  // Fonction pour compter les produits actifs
  function getActiveProductsCount(): number {
    try {
      const savedProducts = localStorage.getItem('catalog_products');
      if (savedProducts) {
        const products = JSON.parse(savedProducts);
        const activeProducts = products.filter((p: any) => p.status === 'active');
        return activeProducts.length;
      }
    } catch (error) {
      console.error('Erreur comptage produits:', error);
    }
    return 247; // Valeur par défaut Decora Home
  }

  // Définition des univers avec hiérarchie complète
  const universes: Universe[] = [
    {
      id: 'ecommerce',
      name: 'E-commerce',
      icon: Store,
      description: 'Gestion complète de votre boutique en ligne',
      color: 'from-blue-500 to-cyan-600',
      modules: [
        // Shopify
        { id: 'shopify-integration', name: 'Shopify', icon: Store, description: 'Connexion et synchronisation', component: EcommerceIntegration },
        { id: 'shopify-catalog', name: '├─ Catalogue', icon: Database, description: 'Produits Shopify', component: CatalogManagement },
        { id: 'shopify-enriched', name: '├─ Catalogue Enrichi', icon: Brain, description: 'Attributs IA extraits', component: ProductsEnrichedTable },
        { id: 'shopify-orders', name: '├─ Commandes', icon: ShoppingCart, description: 'Gestion des ventes', component: () => <OrdersModule /> },
        { id: 'shopify-customers', name: '└─ Clients', icon: UsersIcon, description: 'Base clients', component: () => <CustomersModule /> },
        
        // CSV/XML
        { id: 'csv-import', name: 'Import CSV/XML', icon: Upload, description: 'Import manuel', component: EcommerceIntegration },
        { id: 'csv-mapping', name: '├─ Mappage Champs', icon: Link, description: 'Configuration import', component: () => <CSVMappingModule /> },
        { id: 'csv-validation', name: '└─ Validation', icon: CheckCircle, description: 'Contrôle qualité', component: () => <ValidationModule /> },
        
        // Général
        { id: 'inventory', name: 'Inventaire', icon: Package, description: 'Gestion stock global', component: () => <InventoryModule /> },
        { id: 'analytics-sales', name: 'Analytics Ventes', icon: BarChart3, description: 'Performance e-commerce', component: () => <SalesAnalyticsModule /> }
      ]
    },
    {
      id: 'marketing',
      name: 'Marketing IA',
      icon: Target,
      description: 'Automatisation marketing avec intelligence artificielle',
      color: 'from-green-500 to-emerald-600',
      modules: [
        // Google Merchant
        { id: 'google-merchant', name: 'Google Merchant', icon: ShoppingBag, description: 'Flux produits automatique', component: GoogleMerchantTab },
        { id: 'merchant-feed', name: '├─ Flux XML/CSV', icon: FileText, description: 'Génération automatique', component: GoogleMerchantTab },
        { id: 'merchant-optimization', name: '├─ Optimisation', icon: Zap, description: 'Amélioration IA', component: GoogleMerchantTab },
        { id: 'merchant-performance', name: '└─ Performance', icon: TrendingUp, description: 'Suivi Google Shopping', component: GoogleMerchantTab },
        
        // Google Ads
        { id: 'google-ads', name: 'Google Ads', icon: Target, description: 'Campagnes automatiques', component: GoogleAdsTab },
        { id: 'ads-connection', name: '├─ Connexion API', icon: Link, description: 'Configuration Google Ads', component: GoogleAdsConnector },
        { id: 'ads-campaigns', name: '├─ Campagnes', icon: Play, description: 'Performance Max auto', component: GoogleAdsTab },
        { id: 'ads-optimization', name: '├─ Optimisation IA', icon: Brain, description: 'Enchères intelligentes', component: GoogleAdsTab },
        { id: 'ads-reporting', name: '└─ Rapports', icon: BarChart3, description: 'ROI et performance', component: GoogleAdsTab },
        
        // SEO & Content
        { id: 'seo-blog', name: 'SEO & Blog', icon: Search, description: 'Contenu automatique', component: SEOBlogTab },
        { id: 'seo-articles', name: '├─ Articles IA', icon: FileText, description: 'Génération automatique', component: SEOBlogTab },
        { id: 'seo-keywords', name: '├─ Mots-clés', icon: Tag, description: 'Opportunités SEO', component: SEOBlogTab },
        { id: 'seo-performance', name: '└─ Performance', icon: TrendingUp, description: 'Trafic organique', component: SEOBlogTab }
      ]
    },
    {
      id: 'ai-robot',
      name: 'Robot IA',
      icon: Bot,
      description: 'Assistant conversationnel et technologies immersives',
      color: 'from-purple-500 to-pink-600',
      modules: [
        // Configuration Robot
        { id: 'robot-config', name: 'Configuration OmnIA', icon: Settings, description: 'Paramètres robot', component: OmniaRobotTab },
        { id: 'robot-personality', name: '├─ Personnalité', icon: Bot, description: 'Ton et comportement', component: OmniaRobotTab },
        { id: 'robot-voice', name: '├─ Voix & Audio', icon: Headphones, description: 'Synthèse vocale', component: OmniaRobotTab },
        { id: 'robot-training', name: '└─ Entraînement', icon: Brain, description: 'Apprentissage continu', component: MLTrainingDashboard },
        
        // Vision AR/VR (NOUVEAU)
        { id: 'vision-ar', name: 'Vision AR/VR', icon: Eye, description: 'Réalité augmentée', component: () => <VisionARModule />, isNew: true },
        { id: 'ar-mobile', name: '├─ AR Mobile', icon: Smartphone, description: 'Placement produits 3D', component: () => <ARMobileModule />, isNew: true },
        { id: 'vr-showroom', name: '├─ VR Showroom', icon: Monitor, description: 'Visite immersive', component: () => <VRShowroomModule />, isNew: true },
        { id: 'photo-integration', name: '└─ IA Photo', icon: Camera, description: 'Placement automatique', component: () => <PhotoIntegrationModule />, isNew: true },
        
        // Conversations
        { id: 'conversations', name: 'Conversations', icon: MessageSquare, description: 'Historique et analytics', component: ConversationHistory },
        { id: 'chat-analytics', name: '├─ Analytics Chat', icon: BarChart3, description: 'Performance OmnIA', component: ConversationHistory },
        { id: 'chat-optimization', name: '└─ Optimisation', icon: Zap, description: 'Amélioration IA', component: ConversationHistory }
      ]
    },
    {
      id: 'analytics',
      name: 'Analytics & KPIs',
      icon: BarChart3,
      description: 'Tableaux de bord et analyses prédictives',
      color: 'from-orange-500 to-red-600',
      modules: [
        // Dashboard principal
        { id: 'dashboard-overview', name: 'Vue d\'ensemble', icon: BarChart3, description: 'KPIs globaux', component: () => renderMainDashboard() },
        { id: 'dashboard-realtime', name: '├─ Temps réel', icon: Clock, description: 'Métriques live', component: () => <RealtimeDashboard /> },
        { id: 'dashboard-trends', name: '└─ Tendances', icon: TrendingUp, description: 'Évolution historique', component: () => <TrendsDashboard /> },
        
        // Performance
        { id: 'performance-sales', name: 'Performance Ventes', icon: DollarSign, description: 'CA et conversions', component: () => <SalesPerformanceModule /> },
        { id: 'performance-marketing', name: 'Performance Marketing', icon: Target, description: 'ROI campagnes', component: () => <MarketingPerformanceModule /> },
        { id: 'performance-products', name: 'Performance Produits', icon: Package, description: 'Bestsellers et stocks', component: () => <ProductPerformanceModule /> },
        
        // Insights IA
        { id: 'ai-insights', name: 'Insights IA', icon: Brain, description: 'Analyses prédictives', component: () => <AIInsightsDashboard /> },
        { id: 'ai-recommendations', name: '├─ Recommandations', icon: Zap, description: 'Suggestions OmnIA', component: () => <AIRecommendationsModule /> },
        { id: 'ai-predictions', name: '└─ Prédictions', icon: TrendingUp, description: 'Tendances futures', component: () => <AIPredictionsModule /> }
      ]
    }
  ];

  const handlePlatformConnected = (platformData: any) => {
    console.log('Plateforme connectée:', platformData);
    
    setConnectedPlatforms(prev => [...prev, platformData]);
    
    // Sauvegarder les produits dans localStorage si fournis
    if (platformData.products && Array.isArray(platformData.products)) {
      const existingProducts = localStorage.getItem('catalog_products');
      let allProducts = platformData.products;
      
      if (existingProducts) {
        try {
          const existing = JSON.parse(existingProducts);
          allProducts = [...existing, ...platformData.products];
        } catch (error) {
          console.error('Erreur parsing produits existants:', error);
        }
      }
      
      localStorage.setItem('catalog_products', JSON.stringify(allProducts));
      console.log('✅ Produits sauvegardés dans localStorage:', allProducts.length);
    }
    
    // Update products count
    if (platformData.products_count) {
      setStats(prev => ({
        ...prev,
        products: getActiveProductsCount()
      }));
    }
    
    showSuccess(
      'Plateforme connectée',
      `${platformData.name || 'Plateforme'} connectée avec ${platformData.products_count || 0} produits !`,
      [
        {
          label: 'Voir le catalogue',
          action: () => {
            setSelectedUniverse('ecommerce');
            setSelectedModule('shopify-catalog');
          },
          variant: 'primary'
        }
      ]
    );
  };

  const handleTrainingComplete = (trainingStats: any) => {
    console.log('Entraînement IA terminé:', trainingStats);
  };

  // Rendu du dashboard principal
  const renderMainDashboard = () => (
    <div className="space-y-8">
      {/* Header avec info magasin */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">Dashboard Decora Home</h1>
          <p className="text-gray-300">Gestion complète de votre assistant IA OmnIA</p>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-xl flex items-center justify-center">
              <Store className="w-6 h-6 text-white" />
            </div>
            <div>
              <div className="text-white font-bold">Decora Home</div>
              <div className="text-gray-400 text-sm">Plan Professional • {stats.products} produits</div>
            </div>
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
              <p className="text-green-400 text-sm">+23% ce mois</p>
            </div>
            <MessageSquare className="w-10 h-10 text-blue-400" />
          </div>
        </div>
        
        <div className="bg-green-600/20 backdrop-blur-xl rounded-2xl p-6 border border-green-500/30">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-green-200 text-sm mb-1">Conversions</p>
              <p className="text-3xl font-bold text-white mb-1">{stats.conversions}%</p>
              <p className="text-green-400 text-sm">+8% ce mois</p>
            </div>
            <TrendingUp className="w-10 h-10 text-green-400" />
          </div>
        </div>
        
        <div className="bg-purple-600/20 backdrop-blur-xl rounded-2xl p-6 border border-purple-500/30">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-purple-200 text-sm mb-1">Produits</p>
              <p className="text-3xl font-bold text-white mb-1">{stats.products}</p>
              <p className="text-green-400 text-sm">+15% ce mois</p>
            </div>
            <Database className="w-10 h-10 text-purple-400" />
          </div>
        </div>
        
        <div className="bg-orange-600/20 backdrop-blur-xl rounded-2xl p-6 border border-orange-500/30">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-orange-200 text-sm mb-1">Revenus</p>
              <p className="text-3xl font-bold text-white mb-1">€{stats.revenue.toLocaleString()}</p>
              <p className="text-green-400 text-sm">+12% ce mois</p>
            </div>
            <Receipt className="w-10 h-10 text-orange-400" />
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-white/10 backdrop-blur-xl rounded-2xl p-8 border border-white/20">
        <h2 className="text-2xl font-bold text-white mb-6">Actions Rapides</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <button
            onClick={() => {
              setSelectedUniverse('ecommerce');
              setSelectedModule('shopify-integration');
            }}
            className="bg-cyan-500/20 hover:bg-cyan-500/30 border border-cyan-400/50 rounded-xl p-6 text-left transition-all"
          >
            <Upload className="w-8 h-8 text-cyan-400 mb-3" />
            <h3 className="text-lg font-semibold text-white mb-2">Importer Catalogue</h3>
            <p className="text-gray-300 text-sm">CSV, Shopify ou XML</p>
          </button>
          
          <button
            onClick={() => {
              setSelectedUniverse('ai-robot');
              setSelectedModule('robot-config');
            }}
            className="bg-purple-500/20 hover:bg-purple-500/30 border border-purple-400/50 rounded-xl p-6 text-left transition-all"
          >
            <Bot className="w-8 h-8 text-purple-400 mb-3" />
            <h3 className="text-lg font-semibold text-white mb-2">Configurer OmnIA</h3>
            <p className="text-gray-300 text-sm">Personnaliser votre robot</p>
          </button>
          
          <button
            onClick={() => window.open('/robot', '_blank')}
            className="bg-green-500/20 hover:bg-green-500/30 border border-green-400/50 rounded-xl p-6 text-left transition-all"
          >
            <Eye className="w-8 h-8 text-green-400 mb-3" />
            <h3 className="text-lg font-semibold text-white mb-2">Tester OmnIA</h3>
            <p className="text-gray-300 text-sm">Voir en action</p>
          </button>
        </div>
      </div>

      {/* Connected Platforms */}
      {connectedPlatforms.length > 0 && (
        <div className="bg-white/10 backdrop-blur-xl rounded-2xl p-8 border border-white/20">
          <h2 className="text-2xl font-bold text-white mb-6">Plateformes Connectées</h2>
          <div className="space-y-4">
            {connectedPlatforms.map((platform, index) => (
              <div key={index} className="flex items-center justify-between p-4 bg-green-500/20 rounded-xl border border-green-400/30">
                <div className="flex items-center gap-3">
                  <CheckCircle className="w-6 h-6 text-green-400" />
                  <div>
                    <div className="font-semibold text-white">{platform.name}</div>
                    <div className="text-sm text-green-300">
                      {platform.products_count} produits • {platform.platform}
                    </div>
                  </div>
                </div>
                <div className="text-sm text-green-400">
                  Connecté
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );

  // Rendu de la vue univers
  const renderUniverseView = () => {
    if (!selectedUniverse) {
      return (
        <div className="space-y-8">
          <div className="text-center">
            <h1 className="text-4xl font-bold text-white mb-4">Univers OmnIA</h1>
            <p className="text-xl text-gray-300 max-w-3xl mx-auto">
              Choisissez votre domaine d'expertise pour accéder aux outils spécialisés
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {universes.map((universe) => {
              const Icon = universe.icon;
              return (
                <div
                  key={universe.id}
                  onClick={() => setSelectedUniverse(universe.id)}
                  className="bg-white/10 backdrop-blur-xl rounded-3xl p-8 border border-white/20 hover:border-cyan-500/50 transition-all hover:scale-105 cursor-pointer group"
                >
                  <div className={`w-20 h-20 bg-gradient-to-r ${universe.color} rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform shadow-2xl`}>
                    <Icon className="w-10 h-10 text-white" />
                  </div>
                  <h3 className="text-2xl font-bold text-white mb-3">{universe.name}</h3>
                  <p className="text-gray-300 mb-6">{universe.description}</p>
                  <div className="text-sm text-cyan-400">
                    {universe.modules.length} module{universe.modules.length > 1 ? 's' : ''} disponible{universe.modules.length > 1 ? 's' : ''}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      );
    }

    const universe = universes.find(u => u.id === selectedUniverse);
    if (!universe) return null;

    if (!selectedModule) {
      return (
        <div className="space-y-8">
          <div className="flex items-center gap-4">
            <button
              onClick={() => setSelectedUniverse(null)}
              className="text-cyan-400 hover:text-cyan-300 flex items-center gap-2"
            >
              <ArrowLeft className="w-4 h-4" />
              Retour aux univers
            </button>
            <div className={`w-12 h-12 bg-gradient-to-r ${universe.color} rounded-xl flex items-center justify-center shadow-lg`}>
              <universe.icon className="w-6 h-6 text-white" />
            </div>
            <div>
              <h2 className="text-3xl font-bold text-white">{universe.name}</h2>
              <p className="text-gray-300">{universe.description}</p>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {universe.modules.map((module) => {
              const ModuleIcon = module.icon;
              return (
                <div
                  key={module.id}
                  onClick={() => setSelectedModule(module.id)}
                  className="bg-white/10 backdrop-blur-xl rounded-2xl p-6 border border-white/20 hover:border-cyan-500/50 transition-all hover:scale-105 cursor-pointer relative"
                >
                  {module.isNew && (
                    <div className="absolute -top-2 -right-2 bg-gradient-to-r from-pink-500 to-purple-600 text-white px-2 py-1 rounded-full text-xs font-bold animate-pulse">
                      NOUVEAU
                    </div>
                  )}
                  <div className="w-12 h-12 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-xl flex items-center justify-center mb-4">
                    <ModuleIcon className="w-6 h-6 text-white" />
                  </div>
                  <h3 className="text-lg font-bold text-white mb-2">{module.name}</h3>
                  <p className="text-gray-300 text-sm">{module.description}</p>
                  {module.badge && (
                    <span className="inline-block mt-2 bg-cyan-500/20 text-cyan-300 px-2 py-1 rounded-full text-xs">
                      {module.badge}
                    </span>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      );
    }

    const module = universe.modules.find(m => m.id === selectedModule);
    if (!module) return null;

    const ModuleComponent = module.component;
    
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <button
            onClick={() => setSelectedModule(null)}
            className="text-cyan-400 hover:text-cyan-300 flex items-center gap-2"
          >
            <ArrowLeft className="w-4 h-4" />
            Retour à {universe.name}
          </button>
          <div className="w-10 h-10 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-xl flex items-center justify-center">
            <module.icon className="w-5 h-5 text-white" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-white">{module.name}</h2>
            <p className="text-gray-300">{module.description}</p>
          </div>
          {module.isNew && (
            <span className="bg-gradient-to-r from-pink-500 to-purple-600 text-white px-3 py-1 rounded-full text-sm font-bold animate-pulse">
              NOUVEAU
            </span>
          )}
        </div>
        
        <ModuleComponent />
      </div>
    );
  };

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
          {/* Header avec logo OmnIA */}
          <div className="flex items-center gap-3 mb-8">
            <div className="w-12 h-12 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-xl flex items-center justify-center">
              <Bot className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-white">OmnIA Admin</h1>
              <p className="text-sm text-cyan-300">Interface Revendeur</p>
            </div>
          </div>

          {/* Navigation par Univers */}
          <nav className="space-y-3 mb-8">
            <button
              onClick={() => {
                setSelectedUniverse(null);
                setSelectedModule(null);
              }}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all text-left ${
                !selectedUniverse
                  ? 'bg-cyan-500/30 text-white border border-cyan-500/50'
                  : 'text-gray-300 hover:bg-slate-700/50 hover:text-white'
              }`}
            >
              <BarChart3 className="w-5 h-5" />
              <span className="font-medium">Dashboard Principal</span>
            </button>

            {universes.map((universe) => {
              const Icon = universe.icon;
              const isActive = selectedUniverse === universe.id;
              return (
                <button
                  key={universe.id}
                  onClick={() => {
                    setSelectedUniverse(universe.id);
                    setSelectedModule(null);
                  }}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all text-left ${
                    isActive
                      ? 'bg-cyan-500/30 text-white border border-cyan-500/50'
                      : 'text-gray-300 hover:bg-slate-700/50 hover:text-white'
                  }`}
                >
                  <Icon className="w-5 h-5" />
                  <span className="font-medium">{universe.name}</span>
                  <span className="ml-auto text-xs bg-cyan-500/20 text-cyan-300 px-2 py-1 rounded-full">
                    {universe.modules.length}
                  </span>
                </button>
              );
            })}
          </nav>

          {/* Status OmnIA */}
          <div className="bg-green-500/20 border border-green-400/50 rounded-xl p-4 mb-6">
            <div className="flex items-center gap-2 mb-2">
              <Bot className="w-5 h-5 text-green-400" />
              <span className="text-green-300 font-semibold">OmnIA Robot</span>
            </div>
            <p className="text-green-200 text-sm">Assistant IA actif et opérationnel</p>
            <div className="flex items-center gap-2 mt-2">
              <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
              <span className="text-green-300 text-xs">Connecté • {stats.products} produits</span>
            </div>
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
          {renderUniverseView()}
        </div>
      </div>
    </div>
  );
};

// Nouveaux composants pour les modules AR/VR
const VisionARModule: React.FC = () => (
  <div className="space-y-8">
    <div className="text-center">
      <h2 className="text-3xl font-bold text-white mb-4">Vision AR/VR</h2>
      <p className="text-gray-300 text-lg">Réalité augmentée et virtuelle pour l'expérience client</p>
    </div>

    {/* AR Mobile */}
    <div className="bg-white/10 backdrop-blur-xl rounded-2xl p-8 border border-white/20">
      <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
        <Smartphone className="w-6 h-6 text-green-400" />
        📱 AR Mobile - Placement Produits
      </h3>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div>
          <h4 className="font-semibold text-cyan-300 mb-4">🎯 Fonctionnalités :</h4>
          <ul className="text-cyan-200 text-sm space-y-2">
            <li>• <strong>Scanner pièce :</strong> Détection automatique des surfaces</li>
            <li>• <strong>Placement 3D :</strong> Canapé ALYANA en réalité augmentée</li>
            <li>• <strong>Échelle réelle :</strong> Dimensions exactes dans l'espace</li>
            <li>• <strong>Variantes couleurs :</strong> Beige, Taupe, Bleu en temps réel</li>
            <li>• <strong>Partage photo :</strong> Capture AR → envoi à OmnIA</li>
            <li>• <strong>Achat direct :</strong> "Ajouter au panier" depuis l'AR</li>
          </ul>
        </div>
        
        <div>
          <h4 className="font-semibold text-green-300 mb-4">📈 Impact business :</h4>
          <ul className="text-green-200 text-sm space-y-2">
            <li>• <strong>+85% confiance achat :</strong> Voir avant d'acheter</li>
            <li>• <strong>-60% retours :</strong> Taille et style validés</li>
            <li>• <strong>+40% panier moyen :</strong> Produits complémentaires</li>
            <li>• <strong>Viral marketing :</strong> Partage sur réseaux sociaux</li>
            <li>• <strong>Différenciation :</strong> Avantage concurrentiel majeur</li>
          </ul>
        </div>
      </div>
      
      <div className="mt-6 p-4 bg-blue-500/20 border border-blue-400/50 rounded-xl">
        <h4 className="font-semibold text-blue-200 mb-2">🔧 Technologies requises :</h4>
        <div className="text-blue-300 text-sm">
          <strong>WebXR API</strong> + <strong>Three.js</strong> + <strong>8th Wall</strong> ou <strong>AR.js</strong> pour placement 3D temps réel
        </div>
      </div>
    </div>

    {/* VR Showroom */}
    <div className="bg-white/10 backdrop-blur-xl rounded-2xl p-8 border border-white/20">
      <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
        <Monitor className="w-6 h-6 text-purple-400" />
        🕶️ VR Showroom - Visite Immersive
      </h3>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div>
          <h4 className="font-semibold text-purple-300 mb-4">🏪 Expérience VR :</h4>
          <ul className="text-purple-200 text-sm space-y-2">
            <li>• <strong>Showroom 3D :</strong> Réplique exacte de votre magasin</li>
            <li>• <strong>Navigation libre :</strong> Déplacement naturel en VR</li>
            <li>• <strong>OmnIA guide :</strong> Robot virtuel qui accompagne</li>
            <li>• <strong>Interactions produits :</strong> Clic → détails, prix, variantes</li>
            <li>• <strong>Ambiances multiples :</strong> Salon, chambre, bureau</li>
            <li>• <strong>Panier VR :</strong> Sélection et achat immersif</li>
          </ul>
        </div>
        
        <div>
          <h4 className="font-semibold text-orange-300 mb-4">🎮 Compatibilité :</h4>
          <ul className="text-orange-200 text-sm space-y-2">
            <li>• <strong>Meta Quest 2/3 :</strong> VR autonome</li>
            <li>• <strong>WebXR :</strong> Navigateur VR (Chrome, Firefox)</li>
            <li>• <strong>Mobile VR :</strong> Cardboard, Gear VR</li>
            <li>• <strong>Desktop 360° :</strong> Navigation souris</li>
          </ul>
        </div>
      </div>
      
      <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-purple-500/20 border border-purple-400/50 rounded-xl p-4">
          <h4 className="font-semibold text-purple-200 mb-2">🎬 Vidéos démo VR :</h4>
          <div className="space-y-2">
            <button className="w-full bg-purple-600 hover:bg-purple-700 text-white py-2 rounded-lg flex items-center justify-center gap-2">
              <Play className="w-4 h-4" />
              Visite showroom VR (2min)
            </button>
            <button className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 rounded-lg flex items-center justify-center gap-2">
              <Video className="w-4 h-4" />
              OmnIA guide virtuel (1min)
            </button>
          </div>
        </div>
        
        <div className="bg-green-500/20 border border-green-400/50 rounded-xl p-4">
          <h4 className="font-semibold text-green-200 mb-2">🚀 Déploiement :</h4>
          <div className="space-y-2">
            <button className="w-full bg-green-600 hover:bg-green-700 text-white py-2 rounded-lg">
              Configurer VR Showroom
            </button>
            <button className="w-full bg-cyan-600 hover:bg-cyan-700 text-white py-2 rounded-lg">
              Tester en WebXR
            </button>
          </div>
        </div>
      </div>
    </div>

    {/* IA Photo Integration */}
    <div className="bg-white/10 backdrop-blur-xl rounded-2xl p-8 border border-white/20">
      <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
        <Camera className="w-6 h-6 text-pink-400" />
        📸 IA Photo Integration - Placement Automatique
      </h3>
      
      <div className="bg-gradient-to-r from-cyan-500/20 to-purple-600/20 rounded-xl p-6 border border-cyan-400/30">
        <h4 className="font-semibold text-white mb-4">🤖 Processus automatique :</h4>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-sm">
          <div className="text-center">
            <div className="w-12 h-12 bg-blue-500 rounded-xl flex items-center justify-center mx-auto mb-2">
              <span className="text-white font-bold">1</span>
            </div>
            <div className="text-blue-300 font-semibold">Upload Photo</div>
            <div className="text-blue-200 text-xs">Client envoie sa pièce</div>
          </div>
          <div className="text-center">
            <div className="w-12 h-12 bg-purple-500 rounded-xl flex items-center justify-center mx-auto mb-2">
              <span className="text-white font-bold">2</span>
            </div>
            <div className="text-purple-300 font-semibold">Analyse IA</div>
            <div className="text-purple-200 text-xs">Détection espace, style</div>
          </div>
          <div className="text-center">
            <div className="w-12 h-12 bg-green-500 rounded-xl flex items-center justify-center mx-auto mb-2">
              <span className="text-white font-bold">3</span>
            </div>
            <div className="text-green-300 font-semibold">Placement 3D</div>
            <div className="text-green-200 text-xs">Canapé intégré photo</div>
          </div>
          <div className="text-center">
            <div className="w-12 h-12 bg-orange-500 rounded-xl flex items-center justify-center mx-auto mb-2">
              <span className="text-white font-bold">4</span>
            </div>
            <div className="text-orange-300 font-semibold">Rendu Final</div>
            <div className="text-orange-200 text-xs">Photo + produit réaliste</div>
          </div>
        </div>
      </div>
    </div>
  </div>
);

const ARMobileModule: React.FC = () => (
  <div className="space-y-8">
    <h2 className="text-2xl font-bold text-white">AR Mobile - Placement 3D</h2>
    
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
      <div className="bg-white/10 backdrop-blur-xl rounded-2xl p-6 border border-white/20">
        <h3 className="text-lg font-bold text-white mb-4">📱 Configuration AR</h3>
        <div className="space-y-4">
          <div>
            <label className="block text-sm text-cyan-300 mb-2">Produits AR activés</label>
            <div className="space-y-2">
              <label className="flex items-center gap-2">
                <input type="checkbox" defaultChecked className="w-4 h-4 text-cyan-600" />
                <span className="text-white">Canapé ALYANA (toutes couleurs)</span>
              </label>
              <label className="flex items-center gap-2">
                <input type="checkbox" defaultChecked className="w-4 h-4 text-cyan-600" />
                <span className="text-white">Table AUREA (Ø100cm, Ø120cm)</span>
              </label>
              <label className="flex items-center gap-2">
                <input type="checkbox" className="w-4 h-4 text-cyan-600" />
                <span className="text-white">Chaise INAYA (toutes couleurs)</span>
              </label>
            </div>
          </div>
        </div>
      </div>
      
      <div className="bg-white/10 backdrop-blur-xl rounded-2xl p-6 border border-white/20">
        <h3 className="text-lg font-bold text-white mb-4">📊 Analytics AR</h3>
        <div className="space-y-4">
          <div className="flex justify-between">
            <span className="text-gray-300">Sessions AR ce mois :</span>
            <span className="text-cyan-400 font-bold">1,247</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-300">Conversions AR :</span>
            <span className="text-green-400 font-bold">68%</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-300">Partages sociaux :</span>
            <span className="text-purple-400 font-bold">342</span>
          </div>
        </div>
      </div>
    </div>
  </div>
);

const VRShowroomModule: React.FC = () => (
  <div className="space-y-8">
    <h2 className="text-2xl font-bold text-white">VR Showroom - Visite Immersive</h2>
    
    <div className="bg-white/10 backdrop-blur-xl rounded-2xl p-8 border border-white/20">
      <h3 className="text-lg font-bold text-white mb-6">🎬 Vidéos de démonstration</h3>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-black/20 rounded-xl p-4">
          <div className="aspect-video bg-gradient-to-br from-purple-600 to-pink-600 rounded-xl flex items-center justify-center mb-4">
            <Play className="w-16 h-16 text-white" />
          </div>
          <h4 className="font-semibold text-white mb-2">Visite VR Showroom</h4>
          <p className="text-gray-300 text-sm mb-3">Découvrez l'expérience immersive complète</p>
          <button className="w-full bg-purple-600 hover:bg-purple-700 text-white py-2 rounded-lg">
            ▶️ Regarder (3min)
          </button>
        </div>
        
        <div className="bg-black/20 rounded-xl p-4">
          <div className="aspect-video bg-gradient-to-br from-blue-600 to-cyan-600 rounded-xl flex items-center justify-center mb-4">
            <Bot className="w-16 h-16 text-white" />
          </div>
          <h4 className="font-semibold text-white mb-2">OmnIA Guide Virtuel</h4>
          <p className="text-gray-300 text-sm mb-3">Robot IA qui accompagne en VR</p>
          <button className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 rounded-lg">
            ▶️ Regarder (2min)
          </button>
        </div>
      </div>
    </div>
  </div>
);

const PhotoIntegrationModule: React.FC = () => (
  <div className="space-y-8">
    <h2 className="text-2xl font-bold text-white">IA Photo Integration</h2>
    
    <div className="bg-gradient-to-r from-cyan-500/20 to-purple-600/20 backdrop-blur-xl rounded-2xl p-8 border border-cyan-400/30">
      <h3 className="text-xl font-bold text-white mb-6">🤖 Placement Automatique avec IA</h3>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div>
          <h4 className="font-semibold text-cyan-300 mb-4">📸 Processus :</h4>
          <ol className="text-cyan-200 text-sm space-y-2">
            <li>1. <strong>Client upload photo</strong> de sa pièce</li>
            <li>2. <strong>IA analyse l'espace</strong> (dimensions, style, éclairage)</li>
            <li>3. <strong>Placement intelligent</strong> du canapé ALYANA</li>
            <li>4. <strong>Rendu photoréaliste</strong> avec ombres et reflets</li>
            <li>5. <strong>Variantes couleurs</strong> en un clic</li>
            <li>6. <strong>Partage et achat</strong> direct depuis l'image</li>
          </ol>
        </div>
        
        <div>
          <h4 className="font-semibold text-green-300 mb-4">🎯 Avantages :</h4>
          <ul className="text-green-200 text-sm space-y-2">
            <li>• <strong>Zéro installation :</strong> Fonctionne sur tous mobiles</li>
            <li>• <strong>Rendu instantané :</strong> 3-5 secondes de traitement</li>
            <li>• <strong>Qualité photo :</strong> Intégration invisible</li>
            <li>• <strong>Viral naturel :</strong> Clients partagent leurs créations</li>
            <li>• <strong>Conversion élevée :</strong> Voir = acheter</li>
          </ul>
        </div>
      </div>
    </div>
  </div>
);

// Modules pour les autres univers
const OrdersModule: React.FC = () => (
  <div className="space-y-6">
    <h2 className="text-2xl font-bold text-white">Gestion des Commandes</h2>
    <div className="bg-white/10 backdrop-blur-xl rounded-2xl p-6 border border-white/20">
      <p className="text-gray-300">Module commandes en développement...</p>
    </div>
  </div>
);

const CustomersModule: React.FC = () => (
  <div className="space-y-6">
    <h2 className="text-2xl font-bold text-white">Base Clients</h2>
    <div className="bg-white/10 backdrop-blur-xl rounded-2xl p-6 border border-white/20">
      <p className="text-gray-300">Module clients en développement...</p>
    </div>
  </div>
);

const CSVMappingModule: React.FC = () => (
  <div className="space-y-6">
    <h2 className="text-2xl font-bold text-white">Mappage des Champs CSV</h2>
    <div className="bg-white/10 backdrop-blur-xl rounded-2xl p-6 border border-white/20">
      <p className="text-gray-300">Configuration du mappage CSV...</p>
    </div>
  </div>
);

const ValidationModule: React.FC = () => (
  <div className="space-y-6">
    <h2 className="text-2xl font-bold text-white">Validation des Données</h2>
    <div className="bg-white/10 backdrop-blur-xl rounded-2xl p-6 border border-white/20">
      <p className="text-gray-300">Contrôle qualité des imports...</p>
    </div>
  </div>
);

const InventoryModule: React.FC = () => (
  <div className="space-y-6">
    <h2 className="text-2xl font-bold text-white">Gestion d'Inventaire</h2>
    <div className="bg-white/10 backdrop-blur-xl rounded-2xl p-6 border border-white/20">
      <p className="text-gray-300">Suivi des stocks global...</p>
    </div>
  </div>
);

const SalesAnalyticsModule: React.FC = () => (
  <div className="space-y-6">
    <h2 className="text-2xl font-bold text-white">Analytics Ventes</h2>
    <div className="bg-white/10 backdrop-blur-xl rounded-2xl p-6 border border-white/20">
      <p className="text-gray-300">Performance e-commerce...</p>
    </div>
  </div>
);

const RealtimeDashboard: React.FC = () => (
  <div className="space-y-6">
    <h2 className="text-2xl font-bold text-white">Dashboard Temps Réel</h2>
    <div className="bg-white/10 backdrop-blur-xl rounded-2xl p-6 border border-white/20">
      <p className="text-gray-300">Métriques en temps réel...</p>
    </div>
  </div>
);

const TrendsDashboard: React.FC = () => (
  <div className="space-y-6">
    <h2 className="text-2xl font-bold text-white">Analyse des Tendances</h2>
    <div className="bg-white/10 backdrop-blur-xl rounded-2xl p-6 border border-white/20">
      <p className="text-gray-300">Évolution historique...</p>
    </div>
  </div>
);

const SalesPerformanceModule: React.FC = () => (
  <div className="space-y-6">
    <h2 className="text-2xl font-bold text-white">Performance Ventes</h2>
    <div className="bg-white/10 backdrop-blur-xl rounded-2xl p-6 border border-white/20">
      <p className="text-gray-300">CA et conversions...</p>
    </div>
  </div>
);

const MarketingPerformanceModule: React.FC = () => (
  <div className="space-y-6">
    <h2 className="text-2xl font-bold text-white">Performance Marketing</h2>
    <div className="bg-white/10 backdrop-blur-xl rounded-2xl p-6 border border-white/20">
      <p className="text-gray-300">ROI des campagnes...</p>
    </div>
  </div>
);

const ProductPerformanceModule: React.FC = () => (
  <div className="space-y-6">
    <h2 className="text-2xl font-bold text-white">Performance Produits</h2>
    <div className="bg-white/10 backdrop-blur-xl rounded-2xl p-6 border border-white/20">
      <p className="text-gray-300">Bestsellers et analyse...</p>
    </div>
  </div>
);

const AIInsightsDashboard: React.FC = () => (
  <div className="space-y-8">
    <h2 className="text-3xl font-bold text-white">Insights IA Prédictifs</h2>
    
    <div className="bg-white/10 backdrop-blur-xl rounded-2xl p-8 border border-white/20">
      <h3 className="text-lg font-bold text-white mb-4">🧠 Analyses OmnIA Brain</h3>
      <div className="space-y-4">
        <div className="bg-blue-500/20 border border-blue-400/50 rounded-xl p-4">
          <h4 className="font-semibold text-blue-200 mb-2">📈 Tendance détectée :</h4>
          <p className="text-blue-300 text-sm">
            Les clients demandent 3x plus de canapés beige cette semaine. 
            Recommandation : augmenter le stock ALYANA beige de 20 unités.
          </p>
        </div>
        
        <div className="bg-green-500/20 border border-green-400/50 rounded-xl p-4">
          <h4 className="font-semibold text-green-200 mb-2">💡 Opportunité SEO :</h4>
          <p className="text-green-300 text-sm">
            "Table travertin" : 2400 recherches/mois, concurrence faible. 
            Créer un article de blog pourrait générer +150 visites/mois.
          </p>
        </div>
        
        <div className="bg-purple-500/20 border border-purple-400/50 rounded-xl p-4">
          <h4 className="font-semibold text-purple-200 mb-2">🎯 Optimisation Ads :</h4>
          <p className="text-purple-300 text-sm">
            Campagne "Chaises design" : CPC trop élevé (€3.20). 
            Suggestion : cibler "chaise chenille" au lieu de "chaise design".
          </p>
        </div>
      </div>
    </div>
  </div>
);

const AIRecommendationsModule: React.FC = () => (
  <div className="space-y-6">
    <h2 className="text-2xl font-bold text-white">Recommandations IA</h2>
    <div className="bg-white/10 backdrop-blur-xl rounded-2xl p-6 border border-white/20">
      <p className="text-gray-300">Suggestions OmnIA...</p>
    </div>
  </div>
);

const AIPredictionsModule: React.FC = () => (
  <div className="space-y-6">
    <h2 className="text-2xl font-bold text-white">Prédictions IA</h2>
    <div className="bg-white/10 backdrop-blur-xl rounded-2xl p-6 border border-white/20">
      <p className="text-gray-300">Tendances futures...</p>
    </div>
  </div>
);