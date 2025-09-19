import React, { useState, useEffect } from 'react';
import {
  Users, Database, CheckCircle, AlertCircle, CreditCard, Receipt,
  TrendingUp, MessageSquare, ShoppingCart, Upload, Download,
  Bot, Globe, FileText, Eye, Settings, Store, LogOut, BarChart3, Brain,
  Clock, Star, X, ShoppingBag, Target, Search, ArrowLeft, Package,
  Zap, Image, Video, Play, Monitor, Smartphone, Headphones, Camera,
  PieChart, DollarSign, MousePointer, Users as UsersIcon, Mail,
  Truck, Calendar, Tag, Link, ExternalLink, Plus, Edit, Trash2,
  Home, Palette, Megaphone, UserCheck, Cog, Bell, Activity,
  TrendingDown, AlertTriangle, Wifi, Battery, Signal
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

interface AdminDashboardProps {
  onLogout: () => void;
}

interface DashboardStats {
  conversations: number;
  conversions: number;
  products: number;
  revenue: number;
  todayRevenue: number;
  weekRevenue: number;
  monthRevenue: number;
  lowStockProducts: number;
  activeChats: number;
  googleAdsSpend: number;
  googleAdsConversions: number;
  googleAdsROAS: number;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({ onLogout }) => {
  const { notifications, showSuccess, showError, showInfo, removeNotification } = useNotifications();
  
  const [selectedModule, setSelectedModule] = useState('dashboard');
  const [stats, setStats] = useState<DashboardStats>({
    conversations: 1234,
    conversions: 42,
    products: getActiveProductsCount(),
    revenue: 2450,
    todayRevenue: 340,
    weekRevenue: 1890,
    monthRevenue: 8450,
    lowStockProducts: 12,
    activeChats: 3,
    googleAdsSpend: 1240,
    googleAdsConversions: 89,
    googleAdsROAS: 4.2
  });
  const [connectedPlatforms, setConnectedPlatforms] = useState<any[]>([]);

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

  // 7 modules principaux de l'admin
  const modules = [
    {
      id: 'dashboard',
      name: 'Dashboard',
      icon: Home,
      description: 'Vue d\'ensemble',
      component: () => renderMainDashboard()
    },
    {
      id: 'products',
      name: 'Produits',
      icon: Package,
      description: 'Catalogue enrichi',
      component: ProductsEnrichedTable,
      badge: stats.products.toString()
    },
    {
      id: 'chats',
      name: 'Chats Clients',
      icon: MessageSquare,
      description: 'OmnIA conversations',
      component: ConversationHistory,
      badge: stats.activeChats > 0 ? stats.activeChats.toString() : undefined
    },
    {
      id: 'sales',
      name: 'Ventes',
      icon: ShoppingCart,
      description: 'Commandes & CA',
      component: () => <SalesOrdersModule />,
      badge: stats.todayRevenue > 0 ? `€${stats.todayRevenue}` : undefined
    },
    {
      id: 'marketing',
      name: 'Marketing',
      icon: Target,
      description: 'Ads, SEO, PMax',
      component: () => <MarketingModule />
    },
    {
      id: 'customers',
      name: 'Clients',
      icon: UsersIcon,
      description: 'CRM & Relance',
      component: () => <CustomersModule />
    },
    {
      id: 'settings',
      name: 'Paramètres',
      icon: Settings,
      description: 'Config & Admin',
      component: () => <SettingsModule />
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
      `${platformData.name || 'Plateforme'} connectée avec ${platformData.products_count || 0} produits !`
    );
  };

  // Rendu du dashboard principal
  const renderMainDashboard = () => (
    <div className="space-y-8">
      {/* Header avec info magasin */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">Dashboard Decora Home</h1>
          <p className="text-gray-300">Vue d'ensemble de votre activité OmnIA</p>
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

      {/* KPI Cards avec graphiques */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-green-600/20 backdrop-blur-xl rounded-2xl p-6 border border-green-500/30">
          <div className="flex items-center justify-between mb-4">
            <div>
              <p className="text-green-200 text-sm mb-1">Ventes Aujourd'hui</p>
              <p className="text-3xl font-bold text-white">€{stats.todayRevenue}</p>
              <p className="text-green-400 text-sm">+12% vs hier</p>
            </div>
            <DollarSign className="w-10 h-10 text-green-400" />
          </div>
          {/* Mini graph */}
          <div className="flex items-end gap-1 h-8">
            {[40, 60, 35, 80, 55, 70, 45, 90].map((height, i) => (
              <div key={i} className="flex-1 bg-green-500/50 rounded-t" style={{ height: `${height}%` }}></div>
            ))}
          </div>
        </div>
        
        <div className="bg-blue-600/20 backdrop-blur-xl rounded-2xl p-6 border border-blue-500/30">
          <div className="flex items-center justify-between mb-4">
            <div>
              <p className="text-blue-200 text-sm mb-1">Conversations OmnIA</p>
              <p className="text-3xl font-bold text-white">{stats.conversations}</p>
              <p className="text-green-400 text-sm">+23% ce mois</p>
            </div>
            <MessageSquare className="w-10 h-10 text-blue-400" />
          </div>
          <div className="flex items-end gap-1 h-8">
            {[30, 45, 60, 40, 75, 55, 80, 65].map((height, i) => (
              <div key={i} className="flex-1 bg-blue-500/50 rounded-t" style={{ height: `${height}%` }}></div>
            ))}
          </div>
        </div>
        
        <div className="bg-purple-600/20 backdrop-blur-xl rounded-2xl p-6 border border-purple-500/30">
          <div className="flex items-center justify-between mb-4">
            <div>
              <p className="text-purple-200 text-sm mb-1">Taux Conversion</p>
              <p className="text-3xl font-bold text-white">{stats.conversions}%</p>
              <p className="text-green-400 text-sm">+8% ce mois</p>
            </div>
            <TrendingUp className="w-10 h-10 text-purple-400" />
          </div>
          <div className="flex items-end gap-1 h-8">
            {[50, 55, 48, 62, 58, 65, 60, 70].map((height, i) => (
              <div key={i} className="flex-1 bg-purple-500/50 rounded-t" style={{ height: `${height}%` }}></div>
            ))}
          </div>
        </div>
        
        <div className="bg-orange-600/20 backdrop-blur-xl rounded-2xl p-6 border border-orange-500/30">
          <div className="flex items-center justify-between mb-4">
            <div>
              <p className="text-orange-200 text-sm mb-1">Google Ads ROAS</p>
              <p className="text-3xl font-bold text-white">{stats.googleAdsROAS}x</p>
              <p className="text-green-400 text-sm">+15% ce mois</p>
            </div>
            <Target className="w-10 h-10 text-orange-400" />
          </div>
          <div className="flex items-end gap-1 h-8">
            {[35, 42, 38, 55, 48, 60, 52, 65].map((height, i) => (
              <div key={i} className="flex-1 bg-orange-500/50 rounded-t" style={{ height: `${height}%` }}></div>
            ))}
          </div>
        </div>
      </div>

      {/* Alertes Stock Faible */}
      <div className="bg-red-500/20 border border-red-400/50 rounded-2xl p-6">
        <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
          <AlertTriangle className="w-6 h-6 text-red-400" />
          🔥 Alertes Stock Faible ({stats.lowStockProducts})
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-black/20 rounded-xl p-4">
            <h4 className="font-semibold text-white mb-2">Canapé ALYANA Taupe</h4>
            <div className="flex justify-between items-center">
              <span className="text-red-400 font-bold">Stock: 3</span>
              <button className="bg-red-600 hover:bg-red-700 text-white px-3 py-1 rounded-lg text-sm">
                Réapprovisionner
              </button>
            </div>
          </div>
          <div className="bg-black/20 rounded-xl p-4">
            <h4 className="font-semibold text-white mb-2">Table AUREA Ø120cm</h4>
            <div className="flex justify-between items-center">
              <span className="text-yellow-400 font-bold">Stock: 8</span>
              <button className="bg-yellow-600 hover:bg-yellow-700 text-white px-3 py-1 rounded-lg text-sm">
                Surveiller
              </button>
            </div>
          </div>
          <div className="bg-black/20 rounded-xl p-4">
            <h4 className="font-semibold text-white mb-2">Chaise INAYA Moka</h4>
            <div className="flex justify-between items-center">
              <span className="text-red-400 font-bold">Stock: 2</span>
              <button className="bg-red-600 hover:bg-red-700 text-white px-3 py-1 rounded-lg text-sm">
                Réapprovisionner
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Conversations en cours avec OmnIA */}
      <div className="bg-white/10 backdrop-blur-xl rounded-2xl p-6 border border-white/20">
        <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
          <Bot className="w-6 h-6 text-cyan-400" />
          💬 Conversations OmnIA en cours ({stats.activeChats})
        </h3>
        <div className="space-y-4">
          <div className="bg-black/20 rounded-xl p-4 border border-cyan-500/30">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-full flex items-center justify-center">
                  <Bot className="w-4 h-4 text-white" />
                </div>
                <div>
                  <div className="text-white font-semibold">Client #1247</div>
                  <div className="text-cyan-300 text-sm">Recherche canapé d'angle</div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                <span className="text-green-300 text-sm">En ligne</span>
              </div>
            </div>
            <div className="bg-cyan-500/20 rounded-lg p-3 border border-cyan-400/30">
              <p className="text-cyan-200 text-sm">
                <strong>OmnIA :</strong> "Notre ALYANA convertible en velours côtelé serait parfait ! 799€ avec coffre de rangement. Quelle couleur préférez-vous ?"
              </p>
            </div>
            <div className="flex gap-2 mt-3">
              <button className="bg-green-600 hover:bg-green-700 text-white px-3 py-1 rounded-lg text-sm">
                Intervenir
              </button>
              <button className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded-lg text-sm">
                Voir historique
              </button>
            </div>
          </div>
          
          <div className="bg-black/20 rounded-xl p-4 border border-purple-500/30">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-pink-600 rounded-full flex items-center justify-center">
                  <Bot className="w-4 h-4 text-white" />
                </div>
                <div>
                  <div className="text-white font-semibold">Client #1248</div>
                  <div className="text-purple-300 text-sm">Conseil aménagement salon</div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-yellow-400 rounded-full animate-pulse"></div>
                <span className="text-yellow-300 text-sm">Réfléchit</span>
              </div>
            </div>
            <div className="bg-purple-500/20 rounded-lg p-3 border border-purple-400/30">
              <p className="text-purple-200 text-sm">
                <strong>Client :</strong> "J'ai un salon de 25m², style moderne, budget 2000€"
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Performance Google Ads */}
      <div className="bg-white/10 backdrop-blur-xl rounded-2xl p-6 border border-white/20">
        <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
          <Target className="w-6 h-6 text-green-400" />
          🎯 Performance Google Ads
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-blue-500/20 rounded-xl p-4 text-center">
            <div className="text-2xl font-bold text-blue-400">€{stats.googleAdsSpend}</div>
            <div className="text-blue-300 text-sm">Dépensé ce mois</div>
          </div>
          <div className="bg-green-500/20 rounded-xl p-4 text-center">
            <div className="text-2xl font-bold text-green-400">{stats.googleAdsConversions}</div>
            <div className="text-green-300 text-sm">Conversions</div>
          </div>
          <div className="bg-purple-500/20 rounded-xl p-4 text-center">
            <div className="text-2xl font-bold text-purple-400">{stats.googleAdsROAS}x</div>
            <div className="text-purple-300 text-sm">ROAS</div>
          </div>
        </div>
      </div>

      {/* Insights OmnIA */}
      <div className="bg-gradient-to-r from-cyan-500/20 to-purple-600/20 backdrop-blur-xl rounded-2xl p-6 border border-cyan-400/30">
        <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
          <Brain className="w-6 h-6 text-cyan-400" />
          🧠 Insights OmnIA IA
        </h3>
        <div className="space-y-4">
          <div className="bg-blue-500/20 border border-blue-400/50 rounded-xl p-4">
            <h4 className="font-semibold text-blue-200 mb-2">📈 Tendance détectée :</h4>
            <p className="text-blue-300 text-sm">
              Les clients demandent 3x plus de canapés beige cette semaine. 
              <strong> Recommandation :</strong> augmenter le stock ALYANA beige de 20 unités.
            </p>
          </div>
          
          <div className="bg-green-500/20 border border-green-400/50 rounded-xl p-4">
            <h4 className="font-semibold text-green-200 mb-2">💡 Opportunité SEO :</h4>
            <p className="text-green-300 text-sm">
              "Table travertin" : 2400 recherches/mois, concurrence faible. 
              <strong> Action :</strong> créer un article de blog pourrait générer +150 visites/mois.
            </p>
          </div>
          
          <div className="bg-purple-500/20 border border-purple-400/50 rounded-xl p-4">
            <h4 className="font-semibold text-purple-200 mb-2">🎯 Optimisation Ads :</h4>
            <p className="text-purple-300 text-sm">
              Campagne "Chaises design" : CPC trop élevé (€3.20). 
              <strong> Suggestion :</strong> cibler "chaise chenille" au lieu de "chaise design".
            </p>
          </div>
        </div>
      </div>

      {/* Actions rapides */}
      <div className="bg-white/10 backdrop-blur-xl rounded-2xl p-6 border border-white/20">
        <h3 className="text-xl font-bold text-white mb-4">Actions Rapides</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <button
            onClick={() => setSelectedModule('products')}
            className="bg-cyan-500/20 hover:bg-cyan-500/30 border border-cyan-400/50 rounded-xl p-4 text-left transition-all hover:scale-105"
          >
            <Package className="w-8 h-8 text-cyan-400 mb-3" />
            <h4 className="text-lg font-semibold text-white mb-2">Enrichir Catalogue</h4>
            <p className="text-gray-300 text-sm">IA Vision + attributs automatiques</p>
          </button>
          
          <button
            onClick={() => setSelectedModule('chats')}
            className="bg-purple-500/20 hover:bg-purple-500/30 border border-purple-400/50 rounded-xl p-4 text-left transition-all hover:scale-105"
          >
            <MessageSquare className="w-8 h-8 text-purple-400 mb-3" />
            <h4 className="text-lg font-semibold text-white mb-2">Voir Conversations</h4>
            <p className="text-gray-300 text-sm">{stats.activeChats} chats en cours</p>
          </button>
          
          <button
            onClick={() => window.open('/robot', '_blank')}
            className="bg-green-500/20 hover:bg-green-500/30 border border-green-400/50 rounded-xl p-4 text-left transition-all hover:scale-105"
          >
            <Bot className="w-8 h-8 text-green-400 mb-3" />
            <h4 className="text-lg font-semibold text-white mb-2">Tester OmnIA</h4>
            <p className="text-gray-300 text-sm">Interface client</p>
          </button>
        </div>
      </div>
    </div>
  );

  const renderModuleContent = () => {
    const module = modules.find(m => m.id === selectedModule);
    if (!module) return null;

    const ModuleComponent = module.component;
    return <ModuleComponent />;
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
        {/* Sidebar Principale - Toujours visible */}
        <div className="w-80 bg-slate-800/90 backdrop-blur-2xl border-r border-slate-700/50 flex flex-col">
          {/* Header avec logo OmnIA */}
          <div className="p-6 border-b border-slate-700/50">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-12 h-12 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-xl flex items-center justify-center">
                <Bot className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-white">OmnIA Admin</h1>
                <p className="text-sm text-cyan-300">Interface Revendeur</p>
              </div>
            </div>

            {/* Info boutique */}
            <div className="bg-white/10 backdrop-blur-xl rounded-xl p-4 border border-white/20">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-emerald-600 rounded-lg flex items-center justify-center">
                  <Store className="w-5 h-5 text-white" />
                </div>
                <div>
                  <div className="text-white font-bold">Decora Home</div>
                  <div className="text-gray-400 text-sm">Plan Professional</div>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3 text-xs">
                <div className="text-center">
                  <div className="text-cyan-400 font-bold">{stats.products}</div>
                  <div className="text-gray-400">Produits</div>
                </div>
                <div className="text-center">
                  <div className="text-green-400 font-bold">{stats.activeChats}</div>
                  <div className="text-gray-400">Chats actifs</div>
                </div>
              </div>
            </div>
          </div>

          {/* Navigation principale - 7 modules */}
          <nav className="flex-1 p-6 space-y-2">
            {modules.map((module) => {
              const Icon = module.icon;
              const isActive = selectedModule === module.id;
              return (
                <button
                  key={module.id}
                  onClick={() => setSelectedModule(module.id)}
                  className={`w-full flex items-center gap-4 px-4 py-4 rounded-xl transition-all text-left group ${
                    isActive
                      ? 'bg-cyan-500/30 text-white border border-cyan-500/50 shadow-lg shadow-cyan-500/20'
                      : 'text-gray-300 hover:bg-slate-700/50 hover:text-white hover:border-cyan-500/30 border border-transparent'
                  }`}
                >
                  <div className={`w-10 h-10 rounded-lg flex items-center justify-center transition-all ${
                    isActive 
                      ? 'bg-cyan-500 shadow-lg shadow-cyan-500/40' 
                      : 'bg-slate-700 group-hover:bg-cyan-500/50'
                  }`}>
                    <Icon className="w-5 h-5 text-white" />
                  </div>
                  <div className="flex-1">
                    <div className="font-semibold">{module.name}</div>
                    <div className="text-xs text-gray-400">{module.description}</div>
                  </div>
                  {module.badge && (
                    <span className="bg-cyan-500/20 text-cyan-300 px-2 py-1 rounded-full text-xs font-bold">
                      {module.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>

          {/* Paramètres en bas - Section fixe */}
          <div className="p-6 border-t border-slate-700/50 space-y-3">
            {/* Status OmnIA */}
            <div className="bg-green-500/20 border border-green-400/50 rounded-xl p-3">
              <div className="flex items-center gap-2 mb-2">
                <div className="w-3 h-3 bg-green-400 rounded-full animate-pulse"></div>
                <span className="text-green-300 font-semibold text-sm">OmnIA Robot Actif</span>
              </div>
              <div className="flex items-center justify-between text-xs">
                <span className="text-green-200">Batterie: 95%</span>
                <span className="text-green-200">Signal: Excellent</span>
              </div>
            </div>

            {/* Boutons paramètres */}
            <div className="space-y-2">
              <button className="w-full flex items-center gap-3 px-3 py-2 text-gray-300 hover:text-white hover:bg-slate-700/50 rounded-lg transition-all text-sm">
                <User className="w-4 h-4" />
                <span>Profil & Compte</span>
              </button>
              
              <button className="w-full flex items-center gap-3 px-3 py-2 text-gray-300 hover:text-white hover:bg-slate-700/50 rounded-lg transition-all text-sm">
                <CreditCard className="w-4 h-4" />
                <span>Abonnement Professional</span>
                <span className="ml-auto bg-green-500/20 text-green-300 px-2 py-1 rounded-full text-xs">79€/mois</span>
              </button>
              
              <button className="w-full flex items-center gap-3 px-3 py-2 text-gray-300 hover:text-white hover:bg-slate-700/50 rounded-lg transition-all text-sm">
                <Link className="w-4 h-4" />
                <span>Connexions API</span>
                <span className="ml-auto bg-cyan-500/20 text-cyan-300 px-2 py-1 rounded-full text-xs">3</span>
              </button>
              
              <button className="w-full flex items-center gap-3 px-3 py-2 text-gray-300 hover:text-white hover:bg-slate-700/50 rounded-lg transition-all text-sm">
                <Shield className="w-4 h-4" />
                <span>Sécurité & Logs</span>
              </button>
              
              <button className="w-full flex items-center gap-3 px-3 py-2 text-gray-300 hover:text-white hover:bg-slate-700/50 rounded-lg transition-all text-sm">
                <Bell className="w-4 h-4" />
                <span>Notifications</span>
                {notifications.length > 0 && (
                  <span className="ml-auto bg-red-500 text-white px-2 py-1 rounded-full text-xs">
                    {notifications.length}
                  </span>
                )}
              </button>
            </div>
            
            <button
              onClick={onLogout}
              className="w-full bg-red-600/20 hover:bg-red-600/30 text-red-300 px-4 py-3 rounded-xl font-medium border border-red-500/30 transition-all flex items-center gap-2"
            >
              <LogOut className="w-4 h-4" />
              Déconnexion
            </button>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 overflow-y-auto p-8">
          {renderModuleContent()}
        </div>
      </div>
    </div>
  );
};

// Modules spécialisés pour chaque section
const SalesOrdersModule: React.FC = () => (
  <div className="space-y-8">
    <div className="flex items-center justify-between">
      <div>
        <h2 className="text-3xl font-bold text-white mb-2">Ventes & Commandes</h2>
        <p className="text-gray-300">Gestion des commandes et analyse des ventes</p>
      </div>
      <div className="flex gap-3">
        <button className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-xl flex items-center gap-2">
          <Plus className="w-4 h-4" />
          Nouvelle commande
        </button>
        <button className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-xl flex items-center gap-2">
          <Download className="w-4 h-4" />
          Export
        </button>
      </div>
    </div>

    {/* Stats ventes */}
    <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
      <div className="bg-green-600/20 backdrop-blur-xl rounded-2xl p-6 border border-green-500/30">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-green-200 text-sm mb-1">CA Aujourd'hui</p>
            <p className="text-2xl font-bold text-white">€340</p>
            <p className="text-green-400 text-sm">+12% vs hier</p>
          </div>
          <DollarSign className="w-8 h-8 text-green-400" />
        </div>
      </div>
      
      <div className="bg-blue-600/20 backdrop-blur-xl rounded-2xl p-6 border border-blue-500/30">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-blue-200 text-sm mb-1">Commandes</p>
            <p className="text-2xl font-bold text-white">12</p>
            <p className="text-green-400 text-sm">+3 aujourd'hui</p>
          </div>
          <ShoppingCart className="w-8 h-8 text-blue-400" />
        </div>
      </div>
      
      <div className="bg-purple-600/20 backdrop-blur-xl rounded-2xl p-6 border border-purple-500/30">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-purple-200 text-sm mb-1">Panier Moyen</p>
            <p className="text-2xl font-bold text-white">€425</p>
            <p className="text-green-400 text-sm">+8% ce mois</p>
          </div>
          <BarChart3 className="w-8 h-8 text-purple-400" />
        </div>
      </div>
      
      <div className="bg-orange-600/20 backdrop-blur-xl rounded-2xl p-6 border border-orange-500/30">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-orange-200 text-sm mb-1">Livraisons</p>
            <p className="text-2xl font-bold text-white">8</p>
            <p className="text-green-400 text-sm">En cours</p>
          </div>
          <Truck className="w-8 h-8 text-orange-400" />
        </div>
      </div>
    </div>

    {/* Liste des commandes récentes */}
    <div className="bg-white/10 backdrop-blur-xl rounded-2xl p-6 border border-white/20">
      <h3 className="text-xl font-bold text-white mb-4">Commandes Récentes</h3>
      <div className="space-y-4">
        {[
          { id: '#CMD-001', client: 'Marie Dubois', produits: 'Canapé ALYANA Beige', montant: 799, statut: 'Payé', date: 'Aujourd\'hui 14:30' },
          { id: '#CMD-002', client: 'Jean Martin', produits: 'Table AUREA + 4 Chaises INAYA', montant: 895, statut: 'En préparation', date: 'Aujourd\'hui 11:15' },
          { id: '#CMD-003', client: 'Sophie Laurent', produits: 'Chaise INAYA Gris x2', montant: 198, statut: 'Expédié', date: 'Hier 16:45' }
        ].map((commande, index) => (
          <div key={index} className="bg-black/20 rounded-xl p-4 border border-white/10">
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-4 mb-2">
                  <span className="font-bold text-white">{commande.id}</span>
                  <span className="text-cyan-400">{commande.client}</span>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                    commande.statut === 'Payé' ? 'bg-green-500/20 text-green-300' :
                    commande.statut === 'En préparation' ? 'bg-yellow-500/20 text-yellow-300' :
                    'bg-blue-500/20 text-blue-300'
                  }`}>
                    {commande.statut}
                  </span>
                </div>
                <div className="text-gray-300 text-sm">{commande.produits}</div>
                <div className="text-gray-400 text-xs">{commande.date}</div>
              </div>
              <div className="text-right">
                <div className="text-green-400 font-bold text-lg">€{commande.montant}</div>
                <div className="flex gap-2 mt-2">
                  <button className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded-lg text-xs">
                    Voir
                  </button>
                  <button className="bg-purple-600 hover:bg-purple-700 text-white px-3 py-1 rounded-lg text-xs">
                    Modifier
                  </button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  </div>
);

const MarketingModule: React.FC = () => (
  <div className="space-y-8">
    <div className="flex items-center justify-between">
      <div>
        <h2 className="text-3xl font-bold text-white mb-2">Marketing & Publicité</h2>
        <p className="text-gray-300">Google Ads, SEO automatique et Performance Max</p>
      </div>
      <div className="flex gap-3">
        <button className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-xl flex items-center gap-2">
          <Target className="w-4 h-4" />
          Nouvelle campagne
        </button>
        <button className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-xl flex items-center gap-2">
          <Brain className="w-4 h-4" />
          Optimiser avec IA
        </button>
      </div>
    </div>

    {/* Widgets Marketing */}
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
      {/* Google Merchant */}
      <div className="bg-white/10 backdrop-blur-xl rounded-2xl p-6 border border-white/20">
        <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
          <ShoppingBag className="w-5 h-5 text-green-400" />
          Google Merchant Center
        </h3>
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <span className="text-gray-300">Flux synchronisé :</span>
            <span className="text-green-400 font-bold">✅ Actif</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-gray-300">Produits validés :</span>
            <span className="text-cyan-400 font-bold">235/247</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-gray-300">Dernière sync :</span>
            <span className="text-white">Il y a 2h</span>
          </div>
          <button className="w-full bg-green-600 hover:bg-green-700 text-white py-2 rounded-lg">
            Voir Google Merchant
          </button>
        </div>
      </div>

      {/* Google Ads */}
      <div className="bg-white/10 backdrop-blur-xl rounded-2xl p-6 border border-white/20">
        <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
          <Target className="w-5 h-5 text-blue-400" />
          Google Ads Performance
        </h3>
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <span className="text-gray-300">Budget dépensé :</span>
            <span className="text-red-400 font-bold">€1,240</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-gray-300">Conversions :</span>
            <span className="text-green-400 font-bold">89</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-gray-300">ROAS :</span>
            <span className="text-purple-400 font-bold">4.2x</span>
          </div>
          <button className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 rounded-lg">
            Optimiser campagnes
          </button>
        </div>
      </div>
    </div>

    {/* SEO Auto-Blog */}
    <div className="bg-white/10 backdrop-blur-xl rounded-2xl p-6 border border-white/20">
      <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
        <FileText className="w-5 h-5 text-purple-400" />
        SEO Auto-Blog
      </h3>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-green-500/20 rounded-xl p-4 text-center">
          <div className="text-2xl font-bold text-green-400">12</div>
          <div className="text-green-300 text-sm">Articles publiés</div>
        </div>
        <div className="bg-blue-500/20 rounded-xl p-4 text-center">
          <div className="text-2xl font-bold text-blue-400">2,340</div>
          <div className="text-blue-300 text-sm">Visites SEO</div>
        </div>
        <div className="bg-purple-500/20 rounded-xl p-4 text-center">
          <div className="text-2xl font-bold text-purple-400">85</div>
          <div className="text-purple-300 text-sm">Score SEO moyen</div>
        </div>
      </div>
      
      <div className="mt-4">
        <button className="bg-gradient-to-r from-purple-500 to-pink-600 hover:from-purple-400 hover:to-pink-500 text-white px-6 py-3 rounded-xl font-semibold transition-all">
          Générer article IA
        </button>
      </div>
    </div>

    {/* Suggestion IA */}
    <div className="bg-gradient-to-r from-cyan-500/20 to-blue-600/20 backdrop-blur-xl rounded-2xl p-6 border border-cyan-400/30">
      <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
        <Brain className="w-5 h-5 text-cyan-400" />
        💡 Suggestion IA Marketing
      </h3>
      <div className="bg-blue-500/20 border border-blue-400/50 rounded-xl p-4">
        <p className="text-blue-300 text-sm mb-3">
          <strong>Recommandation :</strong> Augmente ton budget Google Ads sur les canapés de +50€/jour. 
          L'IA détecte +35% de conversions sur cette catégorie ce mois.
        </p>
        <div className="flex gap-3">
          <button className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg text-sm">
            Appliquer (+50€/jour)
          </button>
          <button className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-lg text-sm">
            Ignorer
          </button>
        </div>
      </div>
    </div>
  </div>
);

const CustomersModule: React.FC = () => (
  <div className="space-y-8">
    <div className="flex items-center justify-between">
      <div>
        <h2 className="text-3xl font-bold text-white mb-2">Clients & CRM</h2>
        <p className="text-gray-300">Gestion de la relation client et relances automatiques</p>
      </div>
      <div className="flex gap-3">
        <button className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-xl flex items-center gap-2">
          <Plus className="w-4 h-4" />
          Nouveau client
        </button>
        <button className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-xl flex items-center gap-2">
          <Mail className="w-4 h-4" />
          Campagne email
        </button>
      </div>
    </div>

    {/* Stats clients */}
    <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
      <div className="bg-blue-600/20 backdrop-blur-xl rounded-2xl p-6 border border-blue-500/30">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-blue-200 text-sm mb-1">Clients Total</p>
            <p className="text-2xl font-bold text-white">1,247</p>
            <p className="text-green-400 text-sm">+45 ce mois</p>
          </div>
          <UsersIcon className="w-8 h-8 text-blue-400" />
        </div>
      </div>
      
      <div className="bg-green-600/20 backdrop-blur-xl rounded-2xl p-6 border border-green-500/30">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-green-200 text-sm mb-1">Clients VIP</p>
            <p className="text-2xl font-bold text-white">89</p>
            <p className="text-green-400 text-sm">+5 ce mois</p>
          </div>
          <Star className="w-8 h-8 text-green-400" />
        </div>
      </div>
      
      <div className="bg-purple-600/20 backdrop-blur-xl rounded-2xl p-6 border border-purple-500/30">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-purple-200 text-sm mb-1">Showroom</p>
            <p className="text-2xl font-bold text-white">156</p>
            <p className="text-green-400 text-sm">Visites ce mois</p>
          </div>
          <Store className="w-8 h-8 text-purple-400" />
        </div>
      </div>
      
      <div className="bg-orange-600/20 backdrop-blur-xl rounded-2xl p-6 border border-orange-500/30">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-orange-200 text-sm mb-1">Satisfaction</p>
            <p className="text-2xl font-bold text-white">4.8/5</p>
            <p className="text-green-400 text-sm">+0.2 ce mois</p>
          </div>
          <Heart className="w-8 h-8 text-orange-400" />
        </div>
      </div>
    </div>

    {/* Liste clients avec tags */}
    <div className="bg-white/10 backdrop-blur-xl rounded-2xl p-6 border border-white/20">
      <h3 className="text-xl font-bold text-white mb-4">Clients Récents</h3>
      <div className="space-y-4">
        {[
          { 
            nom: 'Marie Dubois', 
            email: 'marie@email.com', 
            achats: '€1,240', 
            derniere: 'Chat OmnIA - Il y a 2h',
            tags: ['VIP', 'Intéressé canapé', 'Showroom'],
            statut: 'En ligne'
          },
          { 
            nom: 'Jean Martin', 
            email: 'jean@email.com', 
            achats: '€890', 
            derniere: 'Commande - Hier',
            tags: ['Fidèle', 'Tables'],
            statut: 'Hors ligne'
          },
          { 
            nom: 'Sophie Laurent', 
            email: 'sophie@email.com', 
            achats: '€450', 
            derniere: 'Chat OmnIA - Il y a 1j',
            tags: ['Nouveau', 'Chaises'],
            statut: 'Hors ligne'
          }
        ].map((client, index) => (
          <div key={index} className="bg-black/20 rounded-xl p-4 border border-white/10">
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-4 mb-2">
                  <span className="font-bold text-white">{client.nom}</span>
                  <span className="text-gray-400 text-sm">{client.email}</span>
                  <span className={`w-2 h-2 rounded-full ${
                    client.statut === 'En ligne' ? 'bg-green-400 animate-pulse' : 'bg-gray-400'
                  }`}></span>
                </div>
                <div className="text-gray-300 text-sm mb-2">{client.derniere}</div>
                <div className="flex flex-wrap gap-2">
                  {client.tags.map((tag, tagIndex) => (
                    <span key={tagIndex} className={`px-2 py-1 rounded-full text-xs font-medium ${
                      tag === 'VIP' ? 'bg-yellow-500/20 text-yellow-300' :
                      tag === 'Fidèle' ? 'bg-green-500/20 text-green-300' :
                      tag === 'Nouveau' ? 'bg-blue-500/20 text-blue-300' :
                      'bg-purple-500/20 text-purple-300'
                    }`}>
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
              <div className="text-right">
                <div className="text-green-400 font-bold">{client.achats}</div>
                <div className="flex gap-2 mt-2">
                  <button className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded-lg text-xs">
                    Profil
                  </button>
                  <button className="bg-purple-600 hover:bg-purple-700 text-white px-3 py-1 rounded-lg text-xs">
                    Relancer
                  </button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  </div>
);

const SettingsModule: React.FC = () => (
  <div className="space-y-8">
    <div>
      <h2 className="text-3xl font-bold text-white mb-2">Paramètres & Administration</h2>
      <p className="text-gray-300">Configuration générale et gestion du compte</p>
    </div>

    {/* Profil & Compte */}
    <div className="bg-white/10 backdrop-blur-xl rounded-2xl p-6 border border-white/20">
      <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
        <User className="w-5 h-5 text-cyan-400" />
        Profil & Compte
      </h3>
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
          <label className="block text-sm text-gray-300 mb-2">Email de contact</label>
          <input
            type="email"
            defaultValue="demo@decorahome.fr"
            className="w-full bg-black/40 border border-gray-600 rounded-xl px-4 py-3 text-white"
          />
        </div>
        <div>
          <label className="block text-sm text-gray-300 mb-2">Téléphone</label>
          <input
            type="tel"
            defaultValue="+33 1 84 88 32 45"
            className="w-full bg-black/40 border border-gray-600 rounded-xl px-4 py-3 text-white"
          />
        </div>
        <div>
          <label className="block text-sm text-gray-300 mb-2">Adresse</label>
          <input
            type="text"
            defaultValue="123 Avenue des Champs-Élysées, 75008 Paris"
            className="w-full bg-black/40 border border-gray-600 rounded-xl px-4 py-3 text-white"
          />
        </div>
      </div>
    </div>

    {/* Abonnement */}
    <div className="bg-white/10 backdrop-blur-xl rounded-2xl p-6 border border-white/20">
      <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
        <CreditCard className="w-5 h-5 text-green-400" />
        Abonnement Professional
      </h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <div className="bg-green-500/20 border border-green-400/50 rounded-xl p-4">
            <h4 className="font-semibold text-green-200 mb-2">Plan Actuel</h4>
            <div className="text-green-300 text-sm space-y-1">
              <div>💳 Professional - 79€/mois</div>
              <div>📅 Renouvelé le 15/01/2025</div>
              <div>🔄 Prochaine facture : 15/02/2025</div>
              <div>✅ 5000 conversations/mois</div>
              <div>✅ Produits illimités</div>
              <div>✅ Vision AR/VR incluse</div>
            </div>
          </div>
        </div>
        <div>
          <div className="bg-blue-500/20 border border-blue-400/50 rounded-xl p-4">
            <h4 className="font-semibold text-blue-200 mb-2">Utilisation ce mois</h4>
            <div className="text-blue-300 text-sm space-y-2">
              <div className="flex justify-between">
                <span>Conversations :</span>
                <span className="font-bold">1,234 / 5,000</span>
              </div>
              <div className="w-full bg-gray-700 rounded-full h-2">
                <div className="bg-blue-500 h-2 rounded-full" style={{ width: '25%' }}></div>
              </div>
              <div className="flex justify-between">
                <span>Produits :</span>
                <span className="font-bold">{stats.products} / ∞</span>
              </div>
              <div className="flex justify-between">
                <span>API calls :</span>
                <span className="font-bold">12,450 / 50,000</span>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <div className="flex gap-4 mt-6">
        <button className="bg-purple-600 hover:bg-purple-700 text-white px-6 py-3 rounded-xl font-semibold">
          Upgrade vers Enterprise
        </button>
        <button className="bg-gray-600 hover:bg-gray-700 text-white px-6 py-3 rounded-xl">
          Gérer facturation
        </button>
      </div>
    </div>

    {/* Connexions API */}
    <div className="bg-white/10 backdrop-blur-xl rounded-2xl p-6 border border-white/20">
      <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
        <Link className="w-5 h-5 text-purple-400" />
        Connexions API
      </h3>
      <div className="space-y-4">
        <div className="flex items-center justify-between p-4 bg-green-500/20 rounded-xl border border-green-400/30">
          <div className="flex items-center gap-3">
            <CheckCircle className="w-6 h-6 text-green-400" />
            <div>
              <div className="font-semibold text-white">Shopify</div>
              <div className="text-sm text-green-300">decorahome.myshopify.com</div>
            </div>
          </div>
          <div className="text-sm text-green-400">Connecté</div>
        </div>
        
        <div className="flex items-center justify-between p-4 bg-green-500/20 rounded-xl border border-green-400/30">
          <div className="flex items-center gap-3">
            <CheckCircle className="w-6 h-6 text-green-400" />
            <div>
              <div className="font-semibold text-white">Google Merchant</div>
              <div className="text-sm text-green-300">Flux automatique actif</div>
            </div>
          </div>
          <div className="text-sm text-green-400">Synchronisé</div>
        </div>
        
        <div className="flex items-center justify-between p-4 bg-yellow-500/20 rounded-xl border border-yellow-400/30">
          <div className="flex items-center gap-3">
            <AlertCircle className="w-6 h-6 text-yellow-400" />
            <div>
              <div className="font-semibold text-white">Google Ads</div>
              <div className="text-sm text-yellow-300">Configuration requise</div>
            </div>
          </div>
          <button className="bg-yellow-600 hover:bg-yellow-700 text-white px-3 py-1 rounded-lg text-sm">
            Configurer
          </button>
        </div>
      </div>
    </div>

    {/* Sécurité & Logs */}
    <div className="bg-white/10 backdrop-blur-xl rounded-2xl p-6 border border-white/20">
      <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
        <Shield className="w-5 h-5 text-orange-400" />
        Sécurité & Logs
      </h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <h4 className="font-semibold text-white mb-3">Activité récente</h4>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-300">Dernière connexion :</span>
              <span className="text-white">Aujourd'hui 14:30</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-300">IP de connexion :</span>
              <span className="text-cyan-400">192.168.1.100</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-300">Navigateur :</span>
              <span className="text-white">Chrome 120</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-300">Localisation :</span>
              <span className="text-white">Paris, France</span>
            </div>
          </div>
        </div>
        <div>
          <h4 className="font-semibold text-white mb-3">Sauvegardes</h4>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-300">Dernière sauvegarde :</span>
              <span className="text-green-400">Il y a 1h</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-300">Catalogue :</span>
              <span className="text-white">247 produits</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-300">Conversations :</span>
              <span className="text-white">1,234 messages</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-300">Taille totale :</span>
              <span className="text-cyan-400">45.2 MB</span>
            </div>
          </div>
        </div>
      </div>
      
      <div className="flex gap-4 mt-6">
        <button className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-xl text-sm">
          Télécharger sauvegarde
        </button>
        <button className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-xl text-sm">
          Voir logs complets
        </button>
      </div>
    </div>
  </div>
);