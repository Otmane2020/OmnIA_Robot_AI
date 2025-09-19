import React, { useState, useEffect } from 'react';
import {
  Users, Database, CheckCircle, AlertCircle, CreditCard, Receipt,
  TrendingUp, MessageSquare, ShoppingCart, Upload, Download,
  Bot, Globe, FileText, Eye, Settings, Store, LogOut, BarChart3, Brain,
  Clock, Star, X, ShoppingBag, Target, Search, ArrowLeft, Package,
  Zap, Image, Video, Play, Monitor, Smartphone, Headphones, Camera,
  PieChart, DollarSign, MousePointer, Users as UsersIcon, Mail,
  Truck, Calendar, Tag, Link, ExternalLink, Plus, Edit, Trash2,
  User, Shield, Bell, HelpCircle, Wifi, Battery, Signal
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
  level?: number; // 0 = parent, 1 = child, 2 = grandchild
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
  const [showSidebar, setShowSidebar] = useState(false);
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
      name: 'E-Commerce',
      icon: Store,
      description: 'Gestion complète boutique en ligne',
      color: 'from-blue-500 to-cyan-600',
      modules: [
        // Shopify - Niveau 0 (parent)
        { id: 'shopify', name: 'Shopify', icon: Store, description: 'Plateforme e-commerce', component: EcommerceIntegration, level: 0 },
        { id: 'shopify-catalog', name: '├─ Catalogue', icon: Database, description: 'Produits Shopify', component: CatalogManagement, level: 1 },
        { id: 'shopify-integration', name: '├─ Intégration', icon: Link, description: 'Connexion API', component: EcommerceIntegration, level: 1 },
        { id: 'shopify-enriched', name: '├─ Catalogue Enrichi', icon: Brain, description: 'Attributs IA extraits', component: ProductsEnrichedTable, level: 1 },
        { id: 'shopify-orders', name: '├─ Commandes', icon: ShoppingCart, description: 'Gestion ventes', component: () => <OrdersModule />, level: 1 },
        { id: 'shopify-customers', name: '└─ Clients', icon: UsersIcon, description: 'Base clients', component: () => <CustomersModule />, level: 1 },
        
        // CSV/XML - Niveau 0 (parent)
        { id: 'csv-import', name: 'Import CSV/XML', icon: Upload, description: 'Import manuel', component: EcommerceIntegration, level: 0 },
        { id: 'csv-mapping', name: '├─ Mappage Champs', icon: Settings, description: 'Configuration import', component: () => <CSVMappingModule />, level: 1 },
        { id: 'csv-validation', name: '└─ Validation', icon: CheckCircle, description: 'Contrôle qualité', component: () => <ValidationModule />, level: 1 },
        
        // Général - Niveau 0 (parent)
        { id: 'inventory', name: 'Inventaire Global', icon: Package, description: 'Gestion stock', component: () => <InventoryModule />, level: 0 },
        { id: 'analytics-sales', name: 'Analytics Ventes', icon: BarChart3, description: 'Performance e-commerce', component: () => <SalesAnalyticsModule />, level: 0 }
      ]
    },
    {
      id: 'marketing',
      name: 'Ads & Marketing',
      icon: Target,
      description: 'Automatisation marketing avec IA',
      color: 'from-green-500 to-emerald-600',
      modules: [
        // Google Merchant - Niveau 0 (parent)
        { id: 'google-merchant', name: 'Google Merchant', icon: ShoppingBag, description: 'Flux produits automatique', component: GoogleMerchantTab, level: 0 },
        { id: 'merchant-feed', name: '├─ Flux XML/CSV', icon: FileText, description: 'Génération automatique', component: GoogleMerchantTab, level: 1 },
        { id: 'merchant-optimization', name: '├─ Optimisation', icon: Zap, description: 'Amélioration IA', component: GoogleMerchantTab, level: 1 },
        { id: 'merchant-performance', name: '└─ Performance', icon: TrendingUp, description: 'Suivi Google Shopping', component: GoogleMerchantTab, level: 1 },
        
        // Google Ads - Niveau 0 (parent)
        { id: 'google-ads', name: 'Google Ads', icon: Target, description: 'Campagnes automatiques', component: GoogleAdsTab, level: 0 },
        { id: 'ads-connection', name: '├─ Connexion API', icon: Link, description: 'Configuration Google Ads', component: GoogleAdsConnector, level: 1 },
        { id: 'ads-campaigns', name: '├─ Campagnes', icon: Play, description: 'Performance Max auto', component: GoogleAdsTab, level: 1 },
        { id: 'ads-optimization', name: '├─ Optimisation IA', icon: Brain, description: 'Enchères intelligentes', component: GoogleAdsTab, level: 1 },
        { id: 'ads-reporting', name: '└─ Rapports', icon: BarChart3, description: 'ROI et performance', component: GoogleAdsTab, level: 1 },
        
        // SEO & Content - Niveau 0 (parent)
        { id: 'seo-blog', name: 'SEO & Blog', icon: Search, description: 'Contenu automatique', component: SEOBlogTab, level: 0 },
        { id: 'seo-articles', name: '├─ Articles IA', icon: FileText, description: 'Génération automatique', component: SEOBlogTab, level: 1 },
        { id: 'seo-keywords', name: '├─ Mots-clés', icon: Tag, description: 'Opportunités SEO', component: SEOBlogTab, level: 1 },
        { id: 'seo-performance', name: '└─ Performance', icon: TrendingUp, description: 'Trafic organique', component: SEOBlogTab, level: 1 },
        
        // Réseaux Sociaux - Niveau 0 (parent)
        { id: 'social-media', name: 'Réseaux Sociaux', icon: Users, description: 'Meta, TikTok, Instagram', component: () => <SocialMediaModule />, level: 0 },
        { id: 'social-meta', name: '├─ Meta Ads', icon: Target, description: 'Facebook & Instagram', component: () => <MetaAdsModule />, level: 1 },
        { id: 'social-tiktok', name: '├─ TikTok Ads', icon: Video, description: 'Publicités TikTok', component: () => <TikTokAdsModule />, level: 1 },
        { id: 'social-content', name: '└─ Contenu Auto', icon: Image, description: 'Posts générés IA', component: () => <SocialContentModule />, level: 1 }
      ]
    },
    {
      id: 'ai-robot',
      name: 'Sales Assistant',
      icon: Bot,
      description: 'OmnIA Bot & technologies immersives',
      color: 'from-purple-500 to-pink-600',
      modules: [
        // Configuration Robot - Niveau 0 (parent)
        { id: 'robot-config', name: 'Configuration OmnIA', icon: Settings, description: 'Paramètres robot', component: OmniaRobotTab, level: 0 },
        { id: 'robot-personality', name: '├─ Personnalité', icon: Bot, description: 'Ton et comportement', component: OmniaRobotTab, level: 1 },
        { id: 'robot-voice', name: '├─ Voix & Audio', icon: Headphones, description: 'Synthèse vocale', component: OmniaRobotTab, level: 1 },
        { id: 'robot-training', name: '└─ Entraînement', icon: Brain, description: 'Apprentissage continu', component: MLTrainingDashboard, level: 1 },
        
        // Vision AR/VR - Niveau 0 (parent)
        { id: 'vision-ar', name: 'Vision AR/VR', icon: Eye, description: 'Réalité augmentée', component: () => <VisionARModule />, isNew: true, level: 0 },
        { id: 'ar-mobile', name: '├─ AR Mobile', icon: Smartphone, description: 'Placement produits 3D', component: () => <ARMobileModule />, isNew: true, level: 1 },
        { id: 'vr-showroom', name: '├─ VR Showroom', icon: Monitor, description: 'Visite immersive', component: () => <VRShowroomModule />, isNew: true, level: 1 },
        { id: 'photo-integration', name: '└─ IA Photo', icon: Camera, description: 'Placement automatique', component: () => <PhotoIntegrationModule />, isNew: true, level: 1 },
        
        // Conversations - Niveau 0 (parent)
        { id: 'conversations', name: 'Conversations', icon: MessageSquare, description: 'Chat temps réel', component: ConversationHistory, level: 0 },
        { id: 'chat-analytics', name: '├─ Analytics Chat', icon: BarChart3, description: 'Performance OmnIA', component: ConversationHistory, level: 1 },
        { id: 'chat-satisfaction', name: '├─ Satisfaction', icon: Star, description: 'Avis clients', component: () => <ChatSatisfactionModule />, level: 1 },
        { id: 'chat-optimization', name: '└─ Optimisation', icon: Zap, description: 'Amélioration IA', component: ConversationHistory, level: 1 },
        
        // Showroom Physique - Niveau 0 (parent)
        { id: 'physical-showroom', name: 'Showroom Physique', icon: Store, description: 'Robot d\'accueil', component: () => <PhysicalShowroomModule />, level: 0 },
        { id: 'robot-detection', name: '├─ Détection Visiteurs', icon: Camera, description: 'Caméra + IA', component: () => <VisitorDetectionModule />, level: 1 },
        { id: 'robot-movement', name: '├─ Déplacements', icon: MousePointer, description: 'Navigation robot', component: () => <RobotMovementModule />, level: 1 },
        { id: 'robot-presentation', name: '└─ Présentation Produits', icon: Package, description: 'Démonstration live', component: () => <ProductPresentationModule />, level: 1 }
      ]
    },
    {
      id: 'analytics',
      name: 'Analytics & Insights',
      icon: BarChart3,
      description: 'Tableaux de bord et analyses prédictives',
      color: 'from-orange-500 to-red-600',
      modules: [
        // Dashboard principal - Niveau 0 (parent)
        { id: 'dashboard-overview', name: 'Vue d\'ensemble', icon: BarChart3, description: 'KPIs globaux', component: () => renderMainDashboard(), level: 0 },
        { id: 'dashboard-realtime', name: '├─ Temps réel', icon: Clock, description: 'Métriques live', component: () => <RealtimeDashboard />, level: 1 },
        { id: 'dashboard-trends', name: '└─ Tendances', icon: TrendingUp, description: 'Évolution historique', component: () => <TrendsDashboard />, level: 1 },
        
        // Performance Ventes - Niveau 0 (parent)
        { id: 'performance-sales', name: 'Performance Ventes', icon: DollarSign, description: 'CA et conversions', component: () => <SalesPerformanceModule />, level: 0 },
        { id: 'sales-revenue', name: '├─ Chiffre d\'Affaires', icon: Receipt, description: 'CA détaillé', component: () => <RevenueModule />, level: 1 },
        { id: 'sales-conversion', name: '├─ Conversions', icon: TrendingUp, description: 'Taux de conversion', component: () => <ConversionModule />, level: 1 },
        { id: 'sales-products', name: '└─ Bestsellers', icon: Star, description: 'Produits populaires', component: () => <BestsellersModule />, level: 1 },
        
        // Performance Marketing - Niveau 0 (parent)
        { id: 'performance-marketing', name: 'Performance Marketing', icon: Target, description: 'ROI campagnes', component: () => <MarketingPerformanceModule />, level: 0 },
        { id: 'marketing-google', name: '├─ Google Ads', icon: Target, description: 'Performance Google', component: () => <GooglePerformanceModule />, level: 1 },
        { id: 'marketing-meta', name: '├─ Meta Ads', icon: Users, description: 'Performance Meta', component: () => <MetaPerformanceModule />, level: 1 },
        { id: 'marketing-seo', name: '└─ SEO Organique', icon: Search, description: 'Trafic naturel', component: () => <SEOPerformanceModule />, level: 1 },
        
        // Insights IA - Niveau 0 (parent)
        { id: 'ai-insights', name: 'Insights IA', icon: Brain, description: 'Analyses prédictives', component: () => <AIInsightsDashboard />, level: 0 },
        { id: 'ai-recommendations', name: '├─ Recommandations', icon: Zap, description: 'Suggestions OmnIA', component: () => <AIRecommendationsModule />, level: 1 },
        { id: 'ai-predictions', name: '├─ Prédictions', icon: TrendingUp, description: 'Tendances futures', component: () => <AIPredictionsModule />, level: 1 },
        { id: 'ai-automation', name: '└─ Automatisation', icon: Settings, description: 'Tâches automatiques', component: () => <AIAutomationModule />, level: 1 }
      ]
    },
    {
      id: 'automation',
      name: 'IA & Automatisation',
      icon: Brain,
      description: 'Intelligence artificielle et automatisation',
      color: 'from-purple-500 to-indigo-600',
      modules: [
        // Génération SEO - Niveau 0 (parent)
        { id: 'seo-generation', name: 'Génération SEO Auto', icon: Search, description: 'Titres, descriptions, balises', component: () => <SEOGenerationModule />, level: 0 },
        { id: 'seo-shopify-sync', name: '├─ Sync Shopify', icon: Store, description: 'Publication automatique', component: () => <ShopifySyncModule />, level: 1 },
        { id: 'seo-platforms', name: '└─ Multi-Plateformes', icon: Globe, description: 'Autres e-commerce', component: () => <MultiPlatformModule />, level: 1 },
        
        // Recommandations - Niveau 0 (parent)
        { id: 'product-recommendations', name: 'Recommandations Produits', icon: Target, description: 'Cross-sell, upsell', component: () => <ProductRecommendationsModule />, level: 0 },
        { id: 'cross-sell', name: '├─ Cross-sell', icon: ShoppingCart, description: 'Produits complémentaires', component: () => <CrossSellModule />, level: 1 },
        { id: 'upsell', name: '└─ Upsell', icon: TrendingUp, description: 'Montée en gamme', component: () => <UpsellModule />, level: 1 },
        
        // Enrichissement IA - Niveau 0 (parent)
        { id: 'ai-enrichment', name: 'Enrichissement IA', icon: Brain, description: 'Catalogue automatique', component: () => <AIEnrichmentModule />, level: 0 },
        { id: 'deepseek-processing', name: '├─ DeepSeek', icon: Zap, description: 'Traitement IA', component: () => <DeepSeekModule />, level: 1 },
        { id: 'openai-processing', name: '├─ OpenAI', icon: Brain, description: 'Vision et texte', component: () => <OpenAIModule />, level: 1 },
        { id: 'auto-cron', name: '└─ Cron Automatique', icon: Clock, description: 'Mise à jour quotidienne', component: () => <AutoCronModule />, level: 1 },
        
        // Automatisation - Niveau 0 (parent)
        { id: 'task-automation', name: 'Automatisation Tâches', icon: Settings, description: 'Cron, rappels, alertes', component: () => <TaskAutomationModule />, level: 0 },
        { id: 'stock-alerts', name: '├─ Alertes Stock', icon: AlertCircle, description: 'Notifications rupture', component: () => <StockAlertsModule />, level: 1 },
        { id: 'price-monitoring', name: '├─ Suivi Prix', icon: DollarSign, description: 'Veille concurrentielle', component: () => <PriceMonitoringModule />, level: 1 },
        { id: 'auto-reports', name: '└─ Rapports Auto', icon: FileText, description: 'Envoi automatique', component: () => <AutoReportsModule />, level: 1 }
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
              setShowSidebar(true);
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
              setShowSidebar(true);
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

  // Landing page avec univers
  const renderUniverseLanding = () => (
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
              onClick={() => {
                setSelectedUniverse(universe.id);
                setShowSidebar(true);
              }}
              className="bg-white/10 backdrop-blur-xl rounded-3xl p-8 border border-white/20 hover:border-cyan-500/50 transition-all hover:scale-105 cursor-pointer group"
            >
              <div className={`w-20 h-20 bg-gradient-to-r ${universe.color} rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform shadow-2xl`}>
                <Icon className="w-10 h-10 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-white mb-3">{universe.name}</h3>
              <p className="text-gray-300 mb-6">{universe.description}</p>
              <div className="text-sm text-cyan-400">
                {universe.modules.filter(m => m.level === 0).length} module{universe.modules.filter(m => m.level === 0).length > 1 ? 's' : ''} principal{universe.modules.filter(m => m.level === 0).length > 1 ? 'aux' : ''}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );

  // Rendu de la vue module
  const renderModuleView = () => {
    if (!selectedUniverse || !selectedModule) return null;

    const universe = universes.find(u => u.id === selectedUniverse);
    const module = universe?.modules.find(m => m.id === selectedModule);
    
    if (!universe || !module) return null;

    const ModuleComponent = module.component;
    
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
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
        {/* Sidebar - Affichée seulement quand un univers est sélectionné */}
        {showSidebar && selectedUniverse && (
          <div className="w-80 bg-slate-800/90 backdrop-blur-2xl border-r border-slate-700/50 p-6 overflow-y-auto">
            {/* Header avec logo OmnIA */}
            <div className="flex items-center gap-3 mb-8">
              <div className="w-12 h-12 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-xl flex items-center justify-center">
                <Bot className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-white">OmnIA Admin</h1>
                <p className="text-sm text-cyan-300">Decora Home</p>
              </div>
            </div>

            {/* Retour aux univers */}
            <button
              onClick={() => {
                setSelectedUniverse(null);
                setSelectedModule(null);
                setShowSidebar(false);
              }}
              className="w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all text-left mb-6 text-cyan-400 hover:text-cyan-300 hover:bg-slate-700/50"
            >
              <ArrowLeft className="w-5 h-5" />
              <span className="font-medium">← Retour aux univers</span>
            </button>

            {/* Navigation par modules avec hiérarchie */}
            <nav className="space-y-1 mb-8">
              {universes.find(u => u.id === selectedUniverse)?.modules.map((module) => {
                const Icon = module.icon;
                const isActive = selectedModule === module.id;
                const isParent = module.level === 0;
                const isChild = module.level === 1;
                
                return (
                  <button
                    key={module.id}
                    onClick={() => setSelectedModule(module.id)}
                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all text-left text-sm ${
                      isActive
                        ? 'bg-cyan-500/30 text-white border border-cyan-500/50'
                        : 'text-gray-300 hover:bg-slate-700/50 hover:text-white'
                    } ${isChild ? 'ml-4' : ''}`}
                  >
                    <Icon className="w-4 h-4" />
                    <span className={`font-medium ${isParent ? 'font-semibold' : ''}`}>
                      {module.name}
                    </span>
                    {module.isNew && (
                      <span className="ml-auto bg-pink-500 text-white px-2 py-0.5 rounded-full text-xs font-bold">
                        NEW
                      </span>
                    )}
                  </button>
                );
              })}
            </nav>

            {/* Info boutique */}
            <div className="bg-white/10 backdrop-blur-xl rounded-xl p-4 mb-6 border border-white/20">
              <div className="flex items-center gap-3 mb-3">
                <Store className="w-5 h-5 text-cyan-400" />
                <span className="text-white font-bold">Decora Home</span>
              </div>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-400">Plan :</span>
                  <span className="text-cyan-300 font-semibold">Professional</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Produits :</span>
                  <span className="text-white font-semibold">{stats.products}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Status :</span>
                  <div className="flex items-center gap-1">
                    <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                    <span className="text-green-300 font-semibold">Actif</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Paramètres en bas */}
            <div className="space-y-2">
              <button className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-gray-300 hover:bg-slate-700/50 hover:text-white transition-all text-left">
                <User className="w-4 h-4" />
                <span className="text-sm">Profil</span>
              </button>
              <button className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-gray-300 hover:bg-slate-700/50 hover:text-white transition-all text-left">
                <CreditCard className="w-4 h-4" />
                <span className="text-sm">Abonnement</span>
              </button>
              <button className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-gray-300 hover:bg-slate-700/50 hover:text-white transition-all text-left">
                <Settings className="w-4 h-4" />
                <span className="text-sm">Paramètres</span>
              </button>
              <button className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-gray-300 hover:bg-slate-700/50 hover:text-white transition-all text-left">
                <HelpCircle className="w-4 h-4" />
                <span className="text-sm">Support</span>
              </button>
              
              <div className="border-t border-slate-700/50 pt-4 mt-4">
                <button
                  onClick={onLogout}
                  className="w-full bg-red-600/20 hover:bg-red-600/30 text-red-300 px-4 py-3 rounded-xl font-medium border border-red-500/30 transition-all flex items-center gap-2"
                >
                  <LogOut className="w-4 h-4" />
                  Déconnexion
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Main Content */}
        <div className="flex-1 overflow-y-auto p-8">
          {!selectedUniverse ? renderUniverseLanding() : renderModuleView()}
        </div>
      </div>
    </div>
  );
};

// Nouveaux composants pour les modules AR/VR avec vidéos
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

    {/* VR Showroom avec vidéos */}
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

const SocialMediaModule: React.FC = () => (
  <div className="space-y-6">
    <h2 className="text-2xl font-bold text-white">Réseaux Sociaux</h2>
    <div className="bg-white/10 backdrop-blur-xl rounded-2xl p-6 border border-white/20">
      <p className="text-gray-300">Gestion Meta, TikTok, Instagram...</p>
    </div>
  </div>
);

const MetaAdsModule: React.FC = () => (
  <div className="space-y-6">
    <h2 className="text-2xl font-bold text-white">Meta Ads</h2>
    <div className="bg-white/10 backdrop-blur-xl rounded-2xl p-6 border border-white/20">
      <p className="text-gray-300">Facebook & Instagram Ads...</p>
    </div>
  </div>
);

const TikTokAdsModule: React.FC = () => (
  <div className="space-y-6">
    <h2 className="text-2xl font-bold text-white">TikTok Ads</h2>
    <div className="bg-white/10 backdrop-blur-xl rounded-2xl p-6 border border-white/20">
      <p className="text-gray-300">Publicités TikTok...</p>
    </div>
  </div>
);

const SocialContentModule: React.FC = () => (
  <div className="space-y-6">
    <h2 className="text-2xl font-bold text-white">Contenu Automatique</h2>
    <div className="bg-white/10 backdrop-blur-xl rounded-2xl p-6 border border-white/20">
      <p className="text-gray-300">Posts générés par IA...</p>
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

// Nouveaux modules pour l'automatisation
const SEOGenerationModule: React.FC = () => (
  <div className="space-y-6">
    <h2 className="text-2xl font-bold text-white">Génération SEO Automatique</h2>
    <div className="bg-white/10 backdrop-blur-xl rounded-2xl p-6 border border-white/20">
      <p className="text-gray-300">Titres, descriptions, balises automatiques...</p>
    </div>
  </div>
);

const ShopifySyncModule: React.FC = () => (
  <div className="space-y-6">
    <h2 className="text-2xl font-bold text-white">Synchronisation Shopify</h2>
    <div className="bg-white/10 backdrop-blur-xl rounded-2xl p-6 border border-white/20">
      <p className="text-gray-300">Publication automatique sur Shopify...</p>
    </div>
  </div>
);

const MultiPlatformModule: React.FC = () => (
  <div className="space-y-6">
    <h2 className="text-2xl font-bold text-white">Multi-Plateformes</h2>
    <div className="bg-white/10 backdrop-blur-xl rounded-2xl p-6 border border-white/20">
      <p className="text-gray-300">Autres plateformes e-commerce...</p>
    </div>
  </div>
);

const ProductRecommendationsModule: React.FC = () => (
  <div className="space-y-6">
    <h2 className="text-2xl font-bold text-white">Recommandations Produits</h2>
    <div className="bg-white/10 backdrop-blur-xl rounded-2xl p-6 border border-white/20">
      <p className="text-gray-300">Cross-sell et upsell automatiques...</p>
    </div>
  </div>
);

const CrossSellModule: React.FC = () => (
  <div className="space-y-6">
    <h2 className="text-2xl font-bold text-white">Cross-sell</h2>
    <div className="bg-white/10 backdrop-blur-xl rounded-2xl p-6 border border-white/20">
      <p className="text-gray-300">Produits complémentaires...</p>
    </div>
  </div>
);

const UpsellModule: React.FC = () => (
  <div className="space-y-6">
    <h2 className="text-2xl font-bold text-white">Upsell</h2>
    <div className="bg-white/10 backdrop-blur-xl rounded-2xl p-6 border border-white/20">
      <p className="text-gray-300">Montée en gamme...</p>
    </div>
  </div>
);

const AIEnrichmentModule: React.FC = () => (
  <div className="space-y-6">
    <h2 className="text-2xl font-bold text-white">Enrichissement IA</h2>
    <div className="bg-white/10 backdrop-blur-xl rounded-2xl p-6 border border-white/20">
      <p className="text-gray-300">Catalogue automatique...</p>
    </div>
  </div>
);

const DeepSeekModule: React.FC = () => (
  <div className="space-y-6">
    <h2 className="text-2xl font-bold text-white">DeepSeek Processing</h2>
    <div className="bg-white/10 backdrop-blur-xl rounded-2xl p-6 border border-white/20">
      <p className="text-gray-300">Traitement IA DeepSeek...</p>
    </div>
  </div>
);

const OpenAIModule: React.FC = () => (
  <div className="space-y-6">
    <h2 className="text-2xl font-bold text-white">OpenAI Processing</h2>
    <div className="bg-white/10 backdrop-blur-xl rounded-2xl p-6 border border-white/20">
      <p className="text-gray-300">Vision et texte OpenAI...</p>
    </div>
  </div>
);

const AutoCronModule: React.FC = () => (
  <div className="space-y-6">
    <h2 className="text-2xl font-bold text-white">Cron Automatique</h2>
    <div className="bg-white/10 backdrop-blur-xl rounded-2xl p-6 border border-white/20">
      <p className="text-gray-300">Mise à jour quotidienne...</p>
    </div>
  </div>
);

const TaskAutomationModule: React.FC = () => (
  <div className="space-y-6">
    <h2 className="text-2xl font-bold text-white">Automatisation des Tâches</h2>
    <div className="bg-white/10 backdrop-blur-xl rounded-2xl p-6 border border-white/20">
      <p className="text-gray-300">Cron, rappels, alertes...</p>
    </div>
  </div>
);

const StockAlertsModule: React.FC = () => (
  <div className="space-y-6">
    <h2 className="text-2xl font-bold text-white">Alertes Stock</h2>
    <div className="bg-white/10 backdrop-blur-xl rounded-2xl p-6 border border-white/20">
      <p className="text-gray-300">Notifications rupture...</p>
    </div>
  </div>
);

const PriceMonitoringModule: React.FC = () => (
  <div className="space-y-6">
    <h2 className="text-2xl font-bold text-white">Suivi des Prix</h2>
    <div className="bg-white/10 backdrop-blur-xl rounded-2xl p-6 border border-white/20">
      <p className="text-gray-300">Veille concurrentielle...</p>
    </div>
  </div>
);

const AutoReportsModule: React.FC = () => (
  <div className="space-y-6">
    <h2 className="text-2xl font-bold text-white">Rapports Automatiques</h2>
    <div className="bg-white/10 backdrop-blur-xl rounded-2xl p-6 border border-white/20">
      <p className="text-gray-300">Envoi automatique...</p>
    </div>
  </div>
);

const RevenueModule: React.FC = () => (
  <div className="space-y-6">
    <h2 className="text-2xl font-bold text-white">Chiffre d'Affaires</h2>
    <div className="bg-white/10 backdrop-blur-xl rounded-2xl p-6 border border-white/20">
      <p className="text-gray-300">CA détaillé...</p>
    </div>
  </div>
);

const ConversionModule: React.FC = () => (
  <div className="space-y-6">
    <h2 className="text-2xl font-bold text-white">Taux de Conversion</h2>
    <div className="bg-white/10 backdrop-blur-xl rounded-2xl p-6 border border-white/20">
      <p className="text-gray-300">Analyse conversions...</p>
    </div>
  </div>
);

const BestsellersModule: React.FC = () => (
  <div className="space-y-6">
    <h2 className="text-2xl font-bold text-white">Bestsellers</h2>
    <div className="bg-white/10 backdrop-blur-xl rounded-2xl p-6 border border-white/20">
      <p className="text-gray-300">Produits populaires...</p>
    </div>
  </div>
);

const GooglePerformanceModule: React.FC = () => (
  <div className="space-y-6">
    <h2 className="text-2xl font-bold text-white">Performance Google</h2>
    <div className="bg-white/10 backdrop-blur-xl rounded-2xl p-6 border border-white/20">
      <p className="text-gray-300">Performance Google Ads...</p>
    </div>
  </div>
);

const MetaPerformanceModule: React.FC = () => (
  <div className="space-y-6">
    <h2 className="text-2xl font-bold text-white">Performance Meta</h2>
    <div className="bg-white/10 backdrop-blur-xl rounded-2xl p-6 border border-white/20">
      <p className="text-gray-300">Performance Meta Ads...</p>
    </div>
  </div>
);

const SEOPerformanceModule: React.FC = () => (
  <div className="space-y-6">
    <h2 className="text-2xl font-bold text-white">Performance SEO</h2>
    <div className="bg-white/10 backdrop-blur-xl rounded-2xl p-6 border border-white/20">
      <p className="text-gray-300">Trafic organique...</p>
    </div>
  </div>
);

const AIAutomationModule: React.FC = () => (
  <div className="space-y-6">
    <h2 className="text-2xl font-bold text-white">Automatisation IA</h2>
    <div className="bg-white/10 backdrop-blur-xl rounded-2xl p-6 border border-white/20">
      <p className="text-gray-300">Tâches automatiques...</p>
    </div>
  </div>
);

const ChatSatisfactionModule: React.FC = () => (
  <div className="space-y-6">
    <h2 className="text-2xl font-bold text-white">Satisfaction Chat</h2>
    <div className="bg-white/10 backdrop-blur-xl rounded-2xl p-6 border border-white/20">
      <p className="text-gray-300">Avis clients...</p>
    </div>
  </div>
);

const PhysicalShowroomModule: React.FC = () => (
  <div className="space-y-6">
    <h2 className="text-2xl font-bold text-white">Showroom Physique</h2>
    <div className="bg-white/10 backdrop-blur-xl rounded-2xl p-6 border border-white/20">
      <p className="text-gray-300">Robot d'accueil...</p>
    </div>
  </div>
);

const VisitorDetectionModule: React.FC = () => (
  <div className="space-y-6">
    <h2 className="text-2xl font-bold text-white">Détection Visiteurs</h2>
    <div className="bg-white/10 backdrop-blur-xl rounded-2xl p-6 border border-white/20">
      <p className="text-gray-300">Caméra + IA...</p>
    </div>
  </div>
);

const RobotMovementModule: React.FC = () => (
  <div className="space-y-6">
    <h2 className="text-2xl font-bold text-white">Déplacements Robot</h2>
    <div className="bg-white/10 backdrop-blur-xl rounded-2xl p-6 border border-white/20">
      <p className="text-gray-300">Navigation robot...</p>
    </div>
  </div>
);

const ProductPresentationModule: React.FC = () => (
  <div className="space-y-6">
    <h2 className="text-2xl font-bold text-white">Présentation Produits</h2>
    <div className="bg-white/10 backdrop-blur-xl rounded-2xl p-6 border border-white/20">
      <p className="text-gray-300">Démonstration live...</p>
    </div>
  </div>
);