import React, { useState, useEffect } from 'react';
import { 
  BarChart3, Package, ShoppingCart, Users, Settings, LogOut, 
  Store, TrendingUp, DollarSign, Eye, Plus, Search, Filter,
  Bot, Zap, Globe, Target, Brain, Calendar, Clock, Wifi,
  Database, Upload, Download, ExternalLink, CheckCircle,
  AlertCircle, Loader2, Edit, Trash2, Save, X, Image,
  Tag, Palette, Ruler, Weight, Info, Star, Heart, Music,
  Camera, QrCode, Smartphone, Monitor, Tablet, ArrowRight,
  FileText, Link, Mail, Phone, MapPin, Building, User,
  CreditCard, Truck, Home, Flag, Crown, Shield, Award
} from 'lucide-react';
import { Logo } from '../components/Logo';
import { CatalogManagement } from '../components/CatalogManagement';
import { NotificationSystem, useNotifications } from '../components/NotificationSystem';

interface AdminDashboardProps {
  onLogout: () => void;
}

interface RetailerData {
  id: string;
  companyName: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  postalCode: string;
  country: string;
  siret: string;
  position: string;
  selectedPlan: string;
  subdomain: string;
  status: string;
  joinDate: string;
}

interface DashboardStats {
  totalProducts: number;
  totalOrders: number;
  totalRevenue: number;
  totalConversations: number;
  conversionRate: number;
  avgOrderValue: number;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({ onLogout }) => {
  const [activeUniverse, setActiveUniverse] = useState('dashboard');
  const [activeTab, setActiveTab] = useState('overview');
  const [showSettings, setShowSettings] = useState(false);
  const [retailerData, setRetailerData] = useState<RetailerData>({
    id: 'demo-retailer-001',
    companyName: 'Decora Home',
    firstName: 'Alexandre',
    lastName: 'Martin',
    email: 'demo@decorahome.fr',
    phone: '+33 1 84 88 32 45',
    address: '123 Avenue des Champs-Élysées',
    city: 'Paris',
    postalCode: '75008',
    country: 'France',
    siret: '897 801 775 00015',
    position: 'Directeur Commercial',
    selectedPlan: 'professional',
    subdomain: 'decorahome',
    status: 'active',
    joinDate: '2024-01-15'
  });
  
  const [dashboardStats, setDashboardStats] = useState<DashboardStats>({
    totalProducts: 247,
    totalOrders: 156,
    totalRevenue: 34500,
    totalConversations: 1234,
    conversionRate: 42,
    avgOrderValue: 221
  });

  const { notifications, removeNotification, showSuccess, showError, showInfo } = useNotifications();

  const universes = [
    {
      id: 'dashboard',
      title: 'Dashboard',
      icon: BarChart3,
      subtitle: 'Vue d\'ensemble',
      color: 'from-cyan-500 to-blue-600'
    },
    {
      id: 'ecommerce',
      title: 'E-Commerce',
      icon: Store,
      subtitle: 'Catalogue & Ventes',
      color: 'from-green-500 to-emerald-600'
    },
    {
      id: 'ads-marketing',
      title: 'Ads & Marketing',
      icon: Target,
      subtitle: 'Publicité & SEO',
      color: 'from-purple-500 to-pink-600'
    },
    {
      id: 'vision-studio',
      title: 'Vision & Studio',
      icon: Eye,
      subtitle: 'AR/VR & IA',
      color: 'from-orange-500 to-red-600'
    },
    {
      id: 'analytics',
      title: 'Analytics',
      icon: TrendingUp,
      subtitle: 'Rapports détaillés',
      color: 'from-indigo-500 to-purple-600'
    },
    {
      id: 'robot',
      title: 'Robot OmnIA',
      icon: Bot,
      subtitle: 'Configuration IA',
      color: 'from-teal-500 to-cyan-600'
    }
  ];

  const getTabsForUniverse = (universe: string) => {
    switch (universe) {
      case 'dashboard':
        return [
          { id: 'overview', label: 'Vue d\'ensemble', icon: BarChart3 }
        ];
      case 'ecommerce':
        return [
          { id: 'catalog', label: 'Catalogue', icon: Package },
          { id: 'enriched-catalog', label: 'Catalogue Enrichi', icon: Brain },
          { id: 'data-cron', label: 'Cron de Données', icon: Clock },
          { id: 'ai-training', label: 'Entraînement IA', icon: Zap },
          { id: 'integrations', label: 'Intégrations', icon: Link },
          { id: 'stock', label: 'Stock', icon: Package },
          { id: 'orders', label: 'Commandes', icon: ShoppingCart }
        ];
      case 'ads-marketing':
        return [
          { id: 'google-ads', label: 'Google Ads', icon: Target },
          { id: 'ads-integration', label: 'Intégration Ads', icon: Settings },
          { id: 'google-merchant', label: 'Google Merchant', icon: Store },
          { id: 'seo-blog', label: 'Blog & Articles', icon: FileText },
          { id: 'auto-blogging', label: 'Auto Blogging', icon: Calendar },
          { id: 'backlinks', label: 'Backlinks', icon: Link },
          { id: 'seo-integration', label: 'Intégration SEO', icon: Globe },
          { id: 'seo-optimization', label: 'Optimisation SEO', icon: Search }
        ];
      case 'vision-studio':
        return [
          { id: 'ar-mobile', label: 'AR Mobile', icon: Smartphone },
          { id: 'vr-showroom', label: 'VR Showroom', icon: Eye },
          { id: 'photo-analysis', label: 'Analyse Photo IA', icon: Camera },
          { id: 'ambiance-generator', label: 'Générateur d\'Ambiances', icon: Palette }
        ];
      case 'analytics':
        return [
          { id: 'analytics-overview', label: 'Analytics', icon: BarChart3 },
          { id: 'reports', label: 'Rapports', icon: FileText }
        ];
      case 'robot':
        return [
          { id: 'robot-config', label: 'Configuration', icon: Settings },
          { id: 'robot-training', label: 'Entraînement', icon: Brain },
          { id: 'robot-conversations', label: 'Conversations', icon: Users }
        ];
      default:
        return [];
    }
  };

  const renderDashboard = () => (
    <div className="space-y-8">
      {/* Solutions Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {universes.filter(u => u.id !== 'dashboard').map((universe) => {
          const Icon = universe.icon;
          return (
            <button
              key={universe.id}
              onClick={() => setActiveUniverse(universe.id)}
              className="bg-white/10 backdrop-blur-xl rounded-2xl p-6 border border-white/20 hover:border-cyan-500/50 transition-all hover:scale-105 text-left group"
            >
              <div className={`w-16 h-16 bg-gradient-to-r ${universe.color} rounded-2xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                <Icon className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-bold text-white mb-2">{universe.title}</h3>
              <p className="text-gray-300">{universe.subtitle}</p>
            </button>
          );
        })}
      </div>

      {/* Synthèse d'activité */}
      <div className="bg-white/10 backdrop-blur-xl rounded-2xl p-8 border border-white/20">
        <h2 className="text-2xl font-bold text-white mb-6">Synthèse d'activité</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-6">
          <div className="bg-blue-600/20 backdrop-blur-xl rounded-2xl p-6 border border-blue-500/30">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-blue-200 text-sm mb-1">Produits</p>
                <p className="text-3xl font-bold text-white">{dashboardStats.totalProducts}</p>
                <p className="text-blue-300 text-sm">Catalogue</p>
              </div>
              <Package className="w-10 h-10 text-blue-400" />
            </div>
          </div>
          
          <div className="bg-green-600/20 backdrop-blur-xl rounded-2xl p-6 border border-green-500/30">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-green-200 text-sm mb-1">Commandes</p>
                <p className="text-3xl font-bold text-white">{dashboardStats.totalOrders}</p>
                <p className="text-green-300 text-sm">Ce mois</p>
              </div>
              <ShoppingCart className="w-10 h-10 text-green-400" />
            </div>
          </div>
          
          <div className="bg-purple-600/20 backdrop-blur-xl rounded-2xl p-6 border border-purple-500/30">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-purple-200 text-sm mb-1">Chiffre d'affaires</p>
                <p className="text-3xl font-bold text-white">€{dashboardStats.totalRevenue.toLocaleString()}</p>
                <p className="text-purple-300 text-sm">Ce mois</p>
              </div>
              <DollarSign className="w-10 h-10 text-purple-400" />
            </div>
          </div>
          
          <div className="bg-orange-600/20 backdrop-blur-xl rounded-2xl p-6 border border-orange-500/30">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-orange-200 text-sm mb-1">Conversations</p>
                <p className="text-3xl font-bold text-white">{dashboardStats.totalConversations}</p>
                <p className="text-orange-300 text-sm">OmnIA</p>
              </div>
              <Bot className="w-10 h-10 text-orange-400" />
            </div>
          </div>
          
          <div className="bg-cyan-600/20 backdrop-blur-xl rounded-2xl p-6 border border-cyan-500/30">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-cyan-200 text-sm mb-1">Conversion</p>
                <p className="text-3xl font-bold text-white">{dashboardStats.conversionRate}%</p>
                <p className="text-cyan-300 text-sm">Taux</p>
              </div>
              <TrendingUp className="w-10 h-10 text-cyan-400" />
            </div>
          </div>
          
          <div className="bg-pink-600/20 backdrop-blur-xl rounded-2xl p-6 border border-pink-500/30">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-pink-200 text-sm mb-1">Panier moyen</p>
                <p className="text-3xl font-bold text-white">€{dashboardStats.avgOrderValue}</p>
                <p className="text-pink-300 text-sm">Commande</p>
              </div>
              <CreditCard className="w-10 h-10 text-pink-400" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const renderECommerceDashboard = () => (
    <div className="space-y-8">
      <div>
        <h2 className="text-3xl font-bold text-white mb-2">Dashboard E-Commerce</h2>
        <p className="text-gray-300">Gestion complète de votre boutique en ligne</p>
      </div>

      {/* Stats E-Commerce */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-blue-600/20 backdrop-blur-xl rounded-2xl p-6 border border-blue-500/30">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-blue-200 text-sm mb-1">Produits actifs</p>
              <p className="text-3xl font-bold text-white">247</p>
              <p className="text-blue-300 text-sm">En ligne</p>
            </div>
            <Package className="w-10 h-10 text-blue-400" />
          </div>
        </div>
        
        <div className="bg-green-600/20 backdrop-blur-xl rounded-2xl p-6 border border-green-500/30">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-green-200 text-sm mb-1">Commandes</p>
              <p className="text-3xl font-bold text-white">156</p>
              <p className="text-green-300 text-sm">Ce mois</p>
            </div>
            <ShoppingCart className="w-10 h-10 text-green-400" />
          </div>
        </div>
        
        <div className="bg-purple-600/20 backdrop-blur-xl rounded-2xl p-6 border border-purple-500/30">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-purple-200 text-sm mb-1">CA mensuel</p>
              <p className="text-3xl font-bold text-white">€34.5k</p>
              <p className="text-purple-300 text-sm">+12% vs mois dernier</p>
            </div>
            <DollarSign className="w-10 h-10 text-purple-400" />
          </div>
        </div>
        
        <div className="bg-orange-600/20 backdrop-blur-xl rounded-2xl p-6 border border-orange-500/30">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-orange-200 text-sm mb-1">Taux conversion</p>
              <p className="text-3xl font-bold text-white">42%</p>
              <p className="text-orange-300 text-sm">Via OmnIA</p>
            </div>
            <Bot className="w-10 h-10 text-orange-400" />
          </div>
        </div>
      </div>
    </div>
  );

  const renderEnrichedCatalog = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-white">Catalogue Enrichi IA</h2>
          <p className="text-gray-300">Produits optimisés avec DeepSeek pour Google Shopping</p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={() => showInfo('Cron manuel', 'Enrichissement manuel démarré...')}
            className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-xl flex items-center gap-2"
          >
            <Brain className="w-4 h-4" />
            Enrichir maintenant
          </button>
          <button
            onClick={() => showSuccess('Cron automatique', 'Cron quotidien activé à 3h du matin !')}
            className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-xl flex items-center gap-2"
          >
            <Clock className="w-4 h-4" />
            Auto Cron
          </button>
        </div>
      </div>

      {/* Table enrichie */}
      <div className="bg-white/10 backdrop-blur-xl rounded-2xl border border-white/20 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-black/20">
              <tr>
                <th className="text-left p-4 text-cyan-300 font-semibold">Produit</th>
                <th className="text-left p-4 text-cyan-300 font-semibold">Catégorie</th>
                <th className="text-left p-4 text-cyan-300 font-semibold">Attributs IA</th>
                <th className="text-left p-4 text-cyan-300 font-semibold">Dimensions</th>
                <th className="text-left p-4 text-cyan-300 font-semibold">SEO</th>
                <th className="text-left p-4 text-cyan-300 font-semibold">Actions</th>
              </tr>
            </thead>
            <tbody>
              <tr className="border-b border-white/10 hover:bg-white/5">
                <td className="p-4">
                  <div className="flex items-center gap-3">
                    <div className="w-16 h-16 rounded-lg overflow-hidden bg-gray-600">
                      <img 
                        src="https://cdn.shopify.com/s/files/1/0903/7578/2665/files/7_23a97631-68d2-4f3e-8f78-b26c7cd4c2ae.png"
                        alt="Canapé ALYANA"
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div>
                      <div className="font-semibold text-white">Canapé ALYANA convertible - Beige</div>
                      <div className="text-gray-400 text-sm">Decora Home • 799€</div>
                      <div className="text-green-400 text-sm">Stock: 100</div>
                    </div>
                  </div>
                </td>
                <td className="p-4">
                  <div className="space-y-1">
                    <span className="bg-blue-500/20 text-blue-300 px-2 py-1 rounded text-xs">Canapé</span>
                    <div className="text-gray-400 text-xs">Canapé d'angle</div>
                  </div>
                </td>
                <td className="p-4">
                  <div className="space-y-1">
                    <div className="flex gap-1">
                      <span className="bg-yellow-500/20 text-yellow-300 px-2 py-1 rounded text-xs">Beige</span>
                      <span className="bg-green-500/20 text-green-300 px-2 py-1 rounded text-xs">Velours</span>
                    </div>
                    <div className="text-gray-400 text-xs">Moderne, Salon</div>
                  </div>
                </td>
                <td className="p-4">
                  <div className="text-sm text-white">
                    <div>L: 240cm</div>
                    <div>l: 160cm</div>
                    <div>H: 75cm</div>
                  </div>
                </td>
                <td className="p-4">
                  <div className="text-xs">
                    <div className="text-white font-medium">Canapé Convertible ALYANA...</div>
                    <div className="text-gray-400">Score: 95%</div>
                  </div>
                </td>
                <td className="p-4">
                  <div className="flex gap-2">
                    <button className="text-blue-400 hover:text-blue-300 p-1" title="Voir">
                      <Eye className="w-4 h-4" />
                    </button>
                    <button className="text-yellow-400 hover:text-yellow-300 p-1" title="Modifier">
                      <Edit className="w-4 h-4" />
                    </button>
                    <button className="text-purple-400 hover:text-purple-300 p-1" title="Shopify">
                      <ExternalLink className="w-4 h-4" />
                    </button>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );

  const renderStock = () => (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-white">Gestion du Stock</h2>
        <p className="text-gray-300">Suivi des disponibilités en temps réel</p>
      </div>

      <div className="bg-white/10 backdrop-blur-xl rounded-2xl border border-white/20 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-black/20">
              <tr>
                <th className="text-left p-4 text-cyan-300 font-semibold">Image</th>
                <th className="text-left p-4 text-cyan-300 font-semibold">Titre</th>
                <th className="text-left p-4 text-cyan-300 font-semibold">Disponible</th>
                <th className="text-left p-4 text-cyan-300 font-semibold">Quantité</th>
                <th className="text-left p-4 text-cyan-300 font-semibold">Actions</th>
              </tr>
            </thead>
            <tbody>
              <tr className="border-b border-white/10 hover:bg-white/5">
                <td className="p-4">
                  <div className="w-16 h-16 rounded-lg overflow-hidden bg-gray-600">
                    <img 
                      src="https://cdn.shopify.com/s/files/1/0903/7578/2665/files/7_23a97631-68d2-4f3e-8f78-b26c7cd4c2ae.png"
                      alt="Canapé ALYANA"
                      className="w-full h-full object-cover"
                    />
                  </div>
                </td>
                <td className="p-4">
                  <div className="font-semibold text-white">Canapé ALYANA convertible - Beige</div>
                  <div className="text-gray-400 text-sm">SKU: ALYANA-BEIGE-001</div>
                </td>
                <td className="p-4">
                  <span className="bg-green-500/20 text-green-300 px-3 py-1 rounded-full text-sm font-medium">
                    Oui
                  </span>
                </td>
                <td className="p-4">
                  <div className="flex items-center gap-2">
                    <input 
                      type="number" 
                      defaultValue="100" 
                      className="w-20 bg-black/40 border border-gray-600 rounded-lg px-2 py-1 text-white text-sm"
                    />
                    <button className="text-cyan-400 hover:text-cyan-300">
                      <Save className="w-4 h-4" />
                    </button>
                  </div>
                </td>
                <td className="p-4">
                  <div className="flex gap-2">
                    <button className="text-blue-400 hover:text-blue-300 p-1">
                      <Eye className="w-4 h-4" />
                    </button>
                    <button className="text-yellow-400 hover:text-yellow-300 p-1">
                      <Edit className="w-4 h-4" />
                    </button>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );

  const renderOrders = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-white">Gestion des Commandes</h2>
          <p className="text-gray-300">Commandes générées via OmnIA Robot</p>
        </div>
        <button
          onClick={() => showSuccess('Commande créée', 'Nouvelle commande manuelle ajoutée !')}
          className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-xl flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          Créer commande manuelle
        </button>
      </div>

      <div className="bg-white/10 backdrop-blur-xl rounded-2xl border border-white/20 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-black/20">
              <tr>
                <th className="text-left p-4 text-cyan-300 font-semibold">Commande</th>
                <th className="text-left p-4 text-cyan-300 font-semibold">Client</th>
                <th className="text-left p-4 text-cyan-300 font-semibold">Produits</th>
                <th className="text-left p-4 text-cyan-300 font-semibold">Total</th>
                <th className="text-left p-4 text-cyan-300 font-semibold">Statut</th>
                <th className="text-left p-4 text-cyan-300 font-semibold">Source</th>
              </tr>
            </thead>
            <tbody>
              <tr className="border-b border-white/10 hover:bg-white/5">
                <td className="p-4">
                  <div>
                    <div className="font-semibold text-white">#ORD-2025-001</div>
                    <div className="text-gray-400 text-sm">15/01/2025 14:30</div>
                  </div>
                </td>
                <td className="p-4">
                  <div>
                    <div className="text-white">Marie Dubois</div>
                    <div className="text-gray-400 text-sm">marie@email.com</div>
                  </div>
                </td>
                <td className="p-4">
                  <div className="text-white">Canapé ALYANA + Table AUREA</div>
                  <div className="text-gray-400 text-sm">2 articles</div>
                </td>
                <td className="p-4">
                  <div className="text-green-400 font-bold">€1,298</div>
                </td>
                <td className="p-4">
                  <span className="bg-green-500/20 text-green-300 px-3 py-1 rounded-full text-sm">
                    Payée
                  </span>
                </td>
                <td className="p-4">
                  <div className="flex items-center gap-2">
                    <Bot className="w-4 h-4 text-cyan-400" />
                    <span className="text-cyan-300 text-sm">OmnIA Robot</span>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );

  const renderGoogleAds = () => (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-white">Google Ads</h2>
        <p className="text-gray-300">Gestion de vos campagnes publicitaires</p>
      </div>

      <div className="bg-yellow-500/20 border border-yellow-400/50 rounded-xl p-6">
        <h3 className="text-xl font-bold text-yellow-200 mb-4">🔗 Connexion requise</h3>
        <p className="text-yellow-300 mb-4">
          Veuillez d'abord connecter votre compte Google Ads pour accéder aux fonctionnalités.
        </p>
        <button
          onClick={() => setActiveTab('ads-integration')}
          className="bg-yellow-600 hover:bg-yellow-700 text-white px-6 py-3 rounded-xl font-semibold"
        >
          Connecter Google Ads
        </button>
      </div>

      {/* Stats par période */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-blue-600/20 backdrop-blur-xl rounded-2xl p-6 border border-blue-500/30">
          <h4 className="text-blue-200 font-semibold mb-4">Aujourd'hui</h4>
          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="text-gray-300">Clics:</span>
              <span className="text-white font-bold">45</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-300">Dépenses:</span>
              <span className="text-white font-bold">€89</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-300">Conversions:</span>
              <span className="text-white font-bold">3</span>
            </div>
          </div>
        </div>
        
        <div className="bg-green-600/20 backdrop-blur-xl rounded-2xl p-6 border border-green-500/30">
          <h4 className="text-green-200 font-semibold mb-4">Ce mois</h4>
          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="text-gray-300">Clics:</span>
              <span className="text-white font-bold">1,240</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-300">Dépenses:</span>
              <span className="text-white font-bold">€2,450</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-300">Conversions:</span>
              <span className="text-white font-bold">89</span>
            </div>
          </div>
        </div>
        
        <div className="bg-purple-600/20 backdrop-blur-xl rounded-2xl p-6 border border-purple-500/30">
          <h4 className="text-purple-200 font-semibold mb-4">Cette année</h4>
          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="text-gray-300">Clics:</span>
              <span className="text-white font-bold">15,680</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-300">Dépenses:</span>
              <span className="text-white font-bold">€28,900</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-300">Conversions:</span>
              <span className="text-white font-bold">1,156</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const renderAdsIntegration = () => (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-white">Intégration Google Ads</h2>
      
      <div className="bg-white/10 backdrop-blur-xl rounded-2xl p-8 border border-white/20">
        <h3 className="text-xl font-bold text-white mb-4">Autorisation Google Ads API</h3>
        <div className="space-y-4">
          <div>
            <label className="block text-sm text-gray-300 mb-2">Client ID</label>
            <input 
              type="text" 
              className="w-full bg-black/40 border border-gray-600 rounded-xl px-4 py-3 text-white" 
              placeholder="Votre Client ID Google" 
            />
          </div>
          <div>
            <label className="block text-sm text-gray-300 mb-2">Client Secret</label>
            <input 
              type="password" 
              className="w-full bg-black/40 border border-gray-600 rounded-xl px-4 py-3 text-white" 
              placeholder="Votre Client Secret" 
            />
          </div>
          <div>
            <label className="block text-sm text-gray-300 mb-2">Developer Token</label>
            <input 
              type="password" 
              className="w-full bg-black/40 border border-gray-600 rounded-xl px-4 py-3 text-white" 
              placeholder="Token développeur Google Ads" 
            />
          </div>
          <button
            onClick={() => showSuccess('Connexion réussie', 'Google Ads connecté avec succès !')}
            className="bg-gradient-to-r from-green-500 to-emerald-600 text-white px-6 py-3 rounded-xl font-semibold"
          >
            Connecter Google Ads
          </button>
        </div>
      </div>
    </div>
  );

  const renderGoogleMerchant = () => (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-white">Google Merchant Center</h2>
        <p className="text-gray-300">Flux produits pour Google Shopping</p>
      </div>

      <div className="bg-white/10 backdrop-blur-xl rounded-2xl p-8 border border-white/20">
        <h3 className="text-xl font-bold text-white mb-4">Flux XML Google Shopping</h3>
        
        <div className="bg-green-500/20 border border-green-400/50 rounded-xl p-4 mb-6">
          <h4 className="font-semibold text-green-200 mb-2">✅ Flux généré automatiquement</h4>
          <div className="space-y-2">
            <div>
              <label className="block text-sm text-green-300 mb-1">URL du flux :</label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={`https://${retailerData.subdomain}.omnia.sale/feed/xml/google-shopping.xml`}
                  readOnly
                  className="flex-1 bg-black/40 border border-green-500/50 rounded-xl px-4 py-2 text-white font-mono text-sm"
                />
                <button
                  onClick={() => {
                    navigator.clipboard.writeText(`https://${retailerData.subdomain}.omnia.sale/feed/xml/google-shopping.xml`);
                    showSuccess('URL copiée', 'URL du flux copiée dans le presse-papiers !');
                  }}
                  className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-xl"
                >
                  Copier
                </button>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-blue-500/20 border border-blue-400/50 rounded-xl p-6">
          <h4 className="font-semibold text-blue-200 mb-3">📋 Guide d'importation dans Google Merchant</h4>
          <ol className="text-blue-300 space-y-2 text-sm">
            <li>1. Connectez-vous à <a href="https://merchants.google.com" target="_blank" className="text-blue-400 underline">Google Merchant Center</a></li>
            <li>2. Allez dans "Produits" → "Flux"</li>
            <li>3. Cliquez "Ajouter un flux"</li>
            <li>4. Sélectionnez "Flux planifié"</li>
            <li>5. Collez l'URL ci-dessus</li>
            <li>6. Configurez la fréquence : "Quotidienne"</li>
          </ol>
        </div>
      </div>
    </div>
  );

  const renderVisionStudio = () => (
    <div className="space-y-8">
      <div>
        <h2 className="text-3xl font-bold text-white mb-2">Vision Augmentée & Studio</h2>
        <p className="text-gray-300">Technologies immersives pour l'expérience client</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* AR Mobile */}
        <div className="bg-white/10 backdrop-blur-xl rounded-2xl p-8 border border-white/20">
          <div className="flex items-center gap-4 mb-6">
            <div className="w-16 h-16 bg-gradient-to-br from-pink-500 to-red-600 rounded-2xl flex items-center justify-center">
              <Smartphone className="w-8 h-8 text-white" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-white">AR Mobile</h3>
              <p className="text-gray-300">Réalité augmentée sur mobile</p>
            </div>
          </div>
          
          <div className="space-y-4">
            <div className="bg-pink-500/20 border border-pink-400/50 rounded-xl p-4">
              <h4 className="font-semibold text-pink-200 mb-2">📱 Fonctionnalités :</h4>
              <ul className="text-pink-300 text-sm space-y-1">
                <li>• Scanner une pièce avec la caméra</li>
                <li>• Placer meubles Decora Home en 3D</li>
                <li>• Voir le rendu en temps réel</li>
                <li>• Partager avec OmnIA pour conseils</li>
              </ul>
            </div>
            
            <button
              onClick={() => showInfo('AR Mobile', 'Module AR en développement...')}
              className="w-full bg-gradient-to-r from-pink-500 to-red-600 text-white py-3 rounded-xl font-semibold"
            >
              Configurer AR Mobile
            </button>
          </div>
        </div>

        {/* VR Showroom */}
        <div className="bg-white/10 backdrop-blur-xl rounded-2xl p-8 border border-white/20">
          <div className="flex items-center gap-4 mb-6">
            <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-2xl flex items-center justify-center">
              <Eye className="w-8 h-8 text-white" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-white">VR Showroom</h3>
              <p className="text-gray-300">Visite virtuelle immersive</p>
            </div>
          </div>
          
          <div className="space-y-4">
            <div className="bg-purple-500/20 border border-purple-400/50 rounded-xl p-4">
              <h4 className="font-semibold text-purple-200 mb-2">🕶️ Expérience :</h4>
              <ul className="text-purple-300 text-sm space-y-1">
                <li>• Visite 360° de votre magasin</li>
                <li>• Interaction avec les produits</li>
                <li>• OmnIA guide virtuel</li>
                <li>• Compatible VR/Desktop/Mobile</li>
              </ul>
            </div>
            
            <button
              onClick={() => showInfo('VR Showroom', 'Showroom virtuel en préparation...')}
              className="w-full bg-gradient-to-r from-purple-500 to-indigo-600 text-white py-3 rounded-xl font-semibold"
            >
              Créer VR Showroom
            </button>
          </div>
        </div>

        {/* Analyse Photo IA */}
        <div className="bg-white/10 backdrop-blur-xl rounded-2xl p-8 border border-white/20">
          <div className="flex items-center gap-4 mb-6">
            <div className="w-16 h-16 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-2xl flex items-center justify-center">
              <Camera className="w-8 h-8 text-white" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-white">Analyse Photo IA</h3>
              <p className="text-gray-300">Vision artificielle avancée</p>
            </div>
          </div>
          
          <div className="space-y-4">
            <div className="bg-cyan-500/20 border border-cyan-400/50 rounded-xl p-4">
              <h4 className="font-semibold text-cyan-200 mb-2">📸 Capacités :</h4>
              <ul className="text-cyan-300 text-sm space-y-1">
                <li>• Analyse style et couleurs</li>
                <li>• Détection mobilier existant</li>
                <li>• Recommandations personnalisées</li>
                <li>• Intégration chat OmnIA</li>
              </ul>
            </div>
            
            <button
              onClick={() => window.open('/chat', '_blank')}
              className="w-full bg-gradient-to-r from-cyan-500 to-blue-600 text-white py-3 rounded-xl font-semibold"
            >
              Tester Analyse Photo
            </button>
          </div>
        </div>

        {/* Générateur d'Ambiances */}
        <div className="bg-white/10 backdrop-blur-xl rounded-2xl p-8 border border-white/20">
          <div className="flex items-center gap-4 mb-6">
            <div className="w-16 h-16 bg-gradient-to-br from-yellow-500 to-orange-600 rounded-2xl flex items-center justify-center">
              <Palette className="w-8 h-8 text-white" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-white">Générateur d'Ambiances</h3>
              <p className="text-gray-300">Styles complets automatiques</p>
            </div>
          </div>
          
          <div className="space-y-4">
            <div className="bg-yellow-500/20 border border-yellow-400/50 rounded-xl p-4">
              <h4 className="font-semibold text-yellow-200 mb-2">🎨 Styles disponibles :</h4>
              <ul className="text-yellow-300 text-sm space-y-1">
                <li>• Minimaliste scandinave</li>
                <li>• Cosy chaleureux</li>
                <li>• Design haut de gamme</li>
                <li>• Industriel moderne</li>
              </ul>
            </div>
            
            <button
              onClick={() => showInfo('Générateur', 'Génération d\'ambiances en cours...')}
              className="w-full bg-gradient-to-r from-yellow-500 to-orange-600 text-white py-3 rounded-xl font-semibold"
            >
              Générer Ambiances
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  const renderSEOBlog = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-white">Blog & Articles</h2>
          <p className="text-gray-300">Articles créés automatiquement</p>
        </div>
        <button
          onClick={() => showSuccess('Article créé', 'Nouvel article généré à partir de vos produits !')}
          className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-xl flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          Créer article
        </button>
      </div>

      <div className="bg-white/10 backdrop-blur-xl rounded-2xl border border-white/20 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-black/20">
              <tr>
                <th className="text-left p-4 text-cyan-300 font-semibold">Article</th>
                <th className="text-left p-4 text-cyan-300 font-semibold">Mots-clés</th>
                <th className="text-left p-4 text-cyan-300 font-semibold">Statut</th>
                <th className="text-left p-4 text-cyan-300 font-semibold">Performance</th>
                <th className="text-left p-4 text-cyan-300 font-semibold">Actions</th>
              </tr>
            </thead>
            <tbody>
              <tr className="border-b border-white/10 hover:bg-white/5">
                <td className="p-4">
                  <div>
                    <div className="font-semibold text-white">Tendances Canapés 2025</div>
                    <div className="text-gray-400 text-sm">Publié le 15/01/2025</div>
                  </div>
                </td>
                <td className="p-4">
                  <div className="flex flex-wrap gap-1">
                    <span className="bg-blue-500/20 text-blue-300 px-2 py-1 rounded text-xs">canapé 2025</span>
                    <span className="bg-purple-500/20 text-purple-300 px-2 py-1 rounded text-xs">tendances</span>
                  </div>
                </td>
                <td className="p-4">
                  <span className="bg-green-500/20 text-green-300 px-3 py-1 rounded-full text-sm">
                    Publié
                  </span>
                </td>
                <td className="p-4">
                  <div className="text-sm">
                    <div className="text-white">1,240 vues</div>
                    <div className="text-gray-400">Position #3</div>
                  </div>
                </td>
                <td className="p-4">
                  <div className="flex gap-2">
                    <button className="text-blue-400 hover:text-blue-300 p-1">
                      <Eye className="w-4 h-4" />
                    </button>
                    <button className="text-yellow-400 hover:text-yellow-300 p-1">
                      <Edit className="w-4 h-4" />
                    </button>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );

  const renderAnalytics = () => (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-white">Analytics</h2>
        <p className="text-gray-300">Analyse détaillée de vos performances</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-blue-600/20 backdrop-blur-xl rounded-2xl p-6 border border-blue-500/30">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-blue-200 text-sm mb-1">Pages vues</p>
              <p className="text-3xl font-bold text-white">12,450</p>
              <p className="text-blue-300 text-sm">Ce mois</p>
            </div>
            <Eye className="w-10 h-10 text-blue-400" />
          </div>
        </div>
        
        <div className="bg-green-600/20 backdrop-blur-xl rounded-2xl p-6 border border-green-500/30">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-green-200 text-sm mb-1">Taux rebond</p>
              <p className="text-3xl font-bold text-white">32%</p>
              <p className="text-green-300 text-sm">-8% vs mois dernier</p>
            </div>
            <TrendingUp className="w-10 h-10 text-green-400" />
          </div>
        </div>
        
        <div className="bg-purple-600/20 backdrop-blur-xl rounded-2xl p-6 border border-purple-500/30">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-purple-200 text-sm mb-1">Durée session</p>
              <p className="text-3xl font-bold text-white">4m 12s</p>
              <p className="text-purple-300 text-sm">Moyenne</p>
            </div>
            <Clock className="w-10 h-10 text-purple-400" />
          </div>
        </div>
        
        <div className="bg-orange-600/20 backdrop-blur-xl rounded-2xl p-6 border border-orange-500/30">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-orange-200 text-sm mb-1">Nouveaux visiteurs</p>
              <p className="text-3xl font-bold text-white">68%</p>
              <p className="text-orange-300 text-sm">Acquisition</p>
            </div>
            <Users className="w-10 h-10 text-orange-400" />
          </div>
        </div>
      </div>
    </div>
  );

  const renderReports = () => (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-white">Rapports</h2>
        <p className="text-gray-300">Rapports détaillés et exports</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[
          { title: 'Rapport Ventes', description: 'Analyse des ventes par période', icon: DollarSign, color: 'green' },
          { title: 'Rapport Produits', description: 'Performance des produits', icon: Package, color: 'blue' },
          { title: 'Rapport Conversations', description: 'Analyse des interactions OmnIA', icon: Bot, color: 'purple' },
          { title: 'Rapport SEO', description: 'Performance référencement', icon: Search, color: 'orange' },
          { title: 'Rapport Marketing', description: 'ROI des campagnes', icon: Target, color: 'pink' },
          { title: 'Rapport Technique', description: 'Performance système', icon: Settings, color: 'gray' }
        ].map((report, index) => {
          const Icon = report.icon;
          return (
            <div key={index} className="bg-white/10 backdrop-blur-xl rounded-2xl p-6 border border-white/20">
              <div className="flex items-center gap-4 mb-4">
                <div className={`w-12 h-12 bg-${report.color}-600/30 rounded-xl flex items-center justify-center`}>
                  <Icon className={`w-6 h-6 text-${report.color}-400`} />
                </div>
                <div>
                  <h3 className="font-bold text-white">{report.title}</h3>
                  <p className="text-gray-400 text-sm">{report.description}</p>
                </div>
              </div>
              <button
                onClick={() => showSuccess('Rapport généré', `${report.title} téléchargé !`)}
                className="w-full bg-cyan-600 hover:bg-cyan-700 text-white py-2 rounded-xl flex items-center justify-center gap-2"
              >
                <Download className="w-4 h-4" />
                Générer
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );

  const renderTabContent = () => {
    switch (activeUniverse) {
      case 'dashboard':
        return renderDashboard();
      case 'ecommerce':
        switch (activeTab) {
          case 'catalog':
            return <CatalogManagement />;
          case 'enriched-catalog':
            return renderEnrichedCatalog();
          case 'stock':
            return renderStock();
          case 'orders':
            return renderOrders();
          default:
            return renderECommerceDashboard();
        }
      case 'ads-marketing':
        switch (activeTab) {
          case 'google-ads':
            return renderGoogleAds();
          case 'ads-integration':
            return renderAdsIntegration();
          case 'google-merchant':
            return renderGoogleMerchant();
          case 'seo-blog':
            return renderSEOBlog();
          default:
            return renderGoogleAds();
        }
      case 'vision-studio':
        return renderVisionStudio();
      case 'analytics':
        switch (activeTab) {
          case 'analytics-overview':
            return renderAnalytics();
          case 'reports':
            return renderReports();
          default:
            return renderAnalytics();
        }
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

      {/* Notifications */}
      <NotificationSystem 
        notifications={notifications} 
        onRemove={removeNotification} 
      />

      <div className="relative z-10 flex h-screen">
        {/* Sidebar */}
        <div className="w-80 bg-black/20 backdrop-blur-2xl border-r border-white/10 flex flex-col">
          {/* Header avec paramètres revendeur */}
          <div className="p-6 border-b border-white/10">
            <div className="flex items-center justify-between mb-4">
              <Logo size="md" />
              <button
                onClick={() => setShowSettings(!showSettings)}
                className="p-2 bg-white/10 hover:bg-white/20 rounded-xl transition-colors"
                title="Paramètres revendeur"
              >
                <Settings className="w-5 h-5 text-white" />
              </button>
            </div>
            
            <div className="bg-gradient-to-r from-cyan-500/20 to-blue-600/20 rounded-xl p-4 border border-cyan-400/30">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-xl flex items-center justify-center">
                  <Store className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h3 className="text-white font-bold">{retailerData.companyName}</h3>
                  <div className="flex items-center gap-2">
                    <Flag className="w-3 h-3 text-gray-400" />
                    <span className="text-cyan-300 text-sm">{retailerData.country}</span>
                    <Crown className="w-3 h-3 text-yellow-400" />
                    <span className="text-yellow-300 text-sm">{retailerData.selectedPlan}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Navigation Univers */}
          <nav className="flex-1 p-6 space-y-2 overflow-y-auto">
            {universes.map((universe) => {
              const Icon = universe.icon;
              return (
                <button
                  key={universe.id}
                  onClick={() => {
                    setActiveUniverse(universe.id);
                    setActiveTab('overview');
                  }}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all text-left ${
                    activeUniverse === universe.id
                      ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 shadow-lg'
                      : 'text-gray-300 hover:bg-white/10 hover:text-white'
                  }`}
                >
                  <Icon className="w-5 h-5" />
                  <div>
                    <div className="font-medium">{universe.title}</div>
                    <div className="text-xs opacity-75">{universe.subtitle}</div>
                  </div>
                </button>
              );
            })}
          </nav>

          {/* Footer */}
          <div className="p-6 border-t border-white/10">
            <button
              onClick={() => window.open('/chat', '_blank')}
              className="w-full bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white py-3 rounded-xl font-semibold mb-3 flex items-center justify-center gap-2"
            >
              <Bot className="w-4 h-4" />
              Tester OmnIA
            </button>
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
        <div className="flex-1 flex flex-col overflow-hidden">
          {/* Onglets horizontaux */}
          {activeUniverse !== 'dashboard' && (
            <div className="bg-black/10 backdrop-blur-xl border-b border-white/10 p-4">
              <div className="flex space-x-1 overflow-x-auto">
                {getTabsForUniverse(activeUniverse).map((tab) => {
                  const Icon = tab.icon;
                  return (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      className={`flex items-center gap-2 px-4 py-2 rounded-xl transition-all whitespace-nowrap ${
                        activeTab === tab.id
                          ? 'bg-cyan-500 text-white'
                          : 'text-gray-400 hover:text-white hover:bg-white/10'
                      }`}
                    >
                      <Icon className="w-4 h-4" />
                      <span className="font-medium">{tab.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Content Area */}
          <div className="flex-1 overflow-y-auto p-8">
            {renderTabContent()}
          </div>
        </div>
      </div>

      {/* Modal Paramètres Revendeur */}
      {showSettings && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-800/95 backdrop-blur-xl rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto border border-slate-600/50">
            <div className="p-8">
              <div className="flex items-center justify-between mb-8">
                <h2 className="text-2xl font-bold text-white">Paramètres Revendeur</h2>
                <button
                  onClick={() => setShowSettings(false)}
                  className="text-gray-400 hover:text-white transition-colors"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Informations entreprise */}
                <div className="bg-black/20 rounded-xl p-6">
                  <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                    <Building className="w-5 h-5 text-blue-400" />
                    Entreprise
                  </h3>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm text-gray-400 mb-1">Nom de l'entreprise</label>
                      <input
                        type="text"
                        value={retailerData.companyName}
                        onChange={(e) => setRetailerData(prev => ({ ...prev, companyName: e.target.value }))}
                        className="w-full bg-black/40 border border-gray-600 rounded-xl px-4 py-2 text-white"
                      />
                    </div>
                    <div>
                      <label className="block text-sm text-gray-400 mb-1">SIRET</label>
                      <input
                        type="text"
                        value={retailerData.siret}
                        onChange={(e) => setRetailerData(prev => ({ ...prev, siret: e.target.value }))}
                        className="w-full bg-black/40 border border-gray-600 rounded-xl px-4 py-2 text-white font-mono"
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm text-gray-400 mb-1">Plan</label>
                        <select
                          value={retailerData.selectedPlan}
                          onChange={(e) => setRetailerData(prev => ({ ...prev, selectedPlan: e.target.value }))}
                          className="w-full bg-black/40 border border-gray-600 rounded-xl px-4 py-2 text-white"
                        >
                          <option value="starter">Starter</option>
                          <option value="professional">Professional</option>
                          <option value="enterprise">Enterprise</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm text-gray-400 mb-1">Pays</label>
                        <div className="flex items-center gap-2 w-full bg-black/40 border border-gray-600 rounded-xl px-4 py-2">
                          <span className="text-lg">🇫🇷</span>
                          <span className="text-white">{retailerData.country}</span>
                        </div>
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm text-gray-400 mb-1">Sous-domaine</label>
                      <div className="flex items-center gap-2">
                        <input
                          type="text"
                          value={retailerData.subdomain}
                          onChange={(e) => setRetailerData(prev => ({ ...prev, subdomain: e.target.value }))}
                          className="flex-1 bg-black/40 border border-gray-600 rounded-xl px-4 py-2 text-white"
                        />
                        <span className="text-gray-400">.omnia.sale</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Contact responsable */}
                <div className="bg-black/20 rounded-xl p-6">
                  <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                    <User className="w-5 h-5 text-green-400" />
                    Contact
                  </h3>
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm text-gray-400 mb-1">Prénom</label>
                        <input
                          type="text"
                          value={retailerData.firstName}
                          onChange={(e) => setRetailerData(prev => ({ ...prev, firstName: e.target.value }))}
                          className="w-full bg-black/40 border border-gray-600 rounded-xl px-4 py-2 text-white"
                        />
                      </div>
                      <div>
                        <label className="block text-sm text-gray-400 mb-1">Nom</label>
                        <input
                          type="text"
                          value={retailerData.lastName}
                          onChange={(e) => setRetailerData(prev => ({ ...prev, lastName: e.target.value }))}
                          className="w-full bg-black/40 border border-gray-600 rounded-xl px-4 py-2 text-white"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm text-gray-400 mb-1">Email</label>
                      <input
                        type="email"
                        value={retailerData.email}
                        onChange={(e) => setRetailerData(prev => ({ ...prev, email: e.target.value }))}
                        className="w-full bg-black/40 border border-gray-600 rounded-xl px-4 py-2 text-white"
                      />
                    </div>
                    <div>
                      <label className="block text-sm text-gray-400 mb-1">Téléphone</label>
                      <div className="flex items-center gap-2">
                        <span className="text-lg">🇫🇷</span>
                        <input
                          type="tel"
                          value={retailerData.phone}
                          onChange={(e) => setRetailerData(prev => ({ ...prev, phone: e.target.value }))}
                          className="flex-1 bg-black/40 border border-gray-600 rounded-xl px-4 py-2 text-white"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm text-gray-400 mb-1">Fonction</label>
                      <input
                        type="text"
                        value={retailerData.position}
                        onChange={(e) => setRetailerData(prev => ({ ...prev, position: e.target.value }))}
                        className="w-full bg-black/40 border border-gray-600 rounded-xl px-4 py-2 text-white"
                      />
                    </div>
                  </div>
                </div>

                {/* Adresse */}
                <div className="bg-black/20 rounded-xl p-6 lg:col-span-2">
                  <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                    <MapPin className="w-5 h-5 text-purple-400" />
                    Adresse
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="md:col-span-2">
                      <label className="block text-sm text-gray-400 mb-1">Adresse complète</label>
                      <input
                        type="text"
                        value={retailerData.address}
                        onChange={(e) => setRetailerData(prev => ({ ...prev, address: e.target.value }))}
                        className="w-full bg-black/40 border border-gray-600 rounded-xl px-4 py-2 text-white"
                      />
                    </div>
                    <div>
                      <label className="block text-sm text-gray-400 mb-1">Code postal</label>
                      <input
                        type="text"
                        value={retailerData.postalCode}
                        onChange={(e) => setRetailerData(prev => ({ ...prev, postalCode: e.target.value }))}
                        className="w-full bg-black/40 border border-gray-600 rounded-xl px-4 py-2 text-white"
                      />
                    </div>
                    <div>
                      <label className="block text-sm text-gray-400 mb-1">Ville</label>
                      <input
                        type="text"
                        value={retailerData.city}
                        onChange={(e) => setRetailerData(prev => ({ ...prev, city: e.target.value }))}
                        className="w-full bg-black/40 border border-gray-600 rounded-xl px-4 py-2 text-white"
                      />
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex justify-between mt-8 pt-6 border-t border-slate-600/50">
                <button
                  onClick={() => setShowSettings(false)}
                  className="bg-gray-600 hover:bg-gray-700 text-white px-6 py-3 rounded-xl transition-all"
                >
                  Fermer
                </button>
                <button
                  onClick={() => {
                    showSuccess('Paramètres sauvegardés', 'Informations revendeur mises à jour !');
                    setShowSettings(false);
                  }}
                  className="bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-400 hover:to-emerald-500 text-white px-6 py-3 rounded-xl font-semibold transition-all flex items-center gap-2"
                >
                  <Save className="w-4 h-4" />
                  Sauvegarder
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};