import React, { useState, useEffect } from 'react';
import { 
  ShoppingCart, Target, Bot, BarChart3, Brain, Building, Settings,
  LogOut, Package, MessageSquare, Globe, Zap, TrendingUp, Users,
  Store, FileText, Database, Eye, Plus, Calendar, Clock, DollarSign,
  Activity, Wifi, Battery, ChevronRight, Home, ArrowLeft, Cog, X,
  User, Mail, Phone, MapPin, Smartphone, Monitor, Headphones,
  Link, Search, Filter, Edit, Trash2, ExternalLink, CheckCircle,
  AlertCircle, Upload, Download, RefreshCw, Play, Pause, Camera,
  Palette, Ruler, Tag, Image, Star, Heart, Sparkles, Layers,
  Cpu, Server, Shield, Lock, Archive, Briefcase, CreditCard,
  PieChart, LineChart, BarChart, Gauge, Megaphone, Rss, Share2,
  BookOpen, PenTool, Lightbulb, Wand2, Glasses, Gamepad2,
  Loader2, Save, Info, Maximize2, Minimize2, RotateCw, Copy
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

interface RetailerInfo {
  companyName: string;
  email: string;
  firstName: string;
  lastName: string;
  phone: string;
  address: string;
  city: string;
  postalCode: string;
  country: string;
  siret: string;
  position: string;
  plan: string;
  subdomain: string;
  phoneCountryCode: string;
}

interface DashboardStats {
  totalProducts: number;
  totalConversations: number;
  totalRevenue: number;
  conversionRate: number;
  activeVisitors: number;
  avgSessionDuration: string;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({ onLogout }) => {
  const [activeMenu, setActiveMenu] = useState<string>('dashboard');
  const [activeSubMenu, setActiveSubMenu] = useState<string>('overview');
  const [showSettings, setShowSettings] = useState(false);
  const [retailerInfo, setRetailerInfo] = useState<RetailerInfo>({
    companyName: 'Decora Home',
    email: 'demo@decorahome.fr',
    firstName: 'Alexandre',
    lastName: 'Martin',
    phone: '1 23 45 67 89',
    phoneCountryCode: '+33',
    address: '123 Avenue des Champs-Élysées',
    city: 'Paris',
    postalCode: '75008',
    country: 'France',
    siret: '89780177500015',
    position: 'Directeur',
    plan: 'Professional',
    subdomain: 'decorahome'
  });
  
  const [dashboardStats, setDashboardStats] = useState<DashboardStats>({
    totalProducts: 247,
    totalConversations: 1234,
    totalRevenue: 45600,
    conversionRate: 42,
    activeVisitors: 89,
    avgSessionDuration: '4m 12s'
  });

  const { notifications, removeNotification, showSuccess, showInfo } = useNotifications();

  const menuItems = [
    {
      id: 'dashboard',
      title: 'Dashboard',
      icon: BarChart3,
      color: 'from-cyan-500 to-blue-600',
      subMenus: []
    },
    {
      id: 'ecommerce',
      title: 'E-Commerce',
      icon: ShoppingCart,
      color: 'from-green-500 to-emerald-600',
      subMenus: [
        { id: 'catalog', title: 'Catalogue', icon: Package },
        { id: 'catalog-enriched', title: 'Catalogue Enrichi', icon: Sparkles },
        { id: 'data-cron', title: 'Cron de Données', icon: Clock },
        { id: 'ai-training', title: 'Entraînement IA', icon: Brain },
        { id: 'integrations', title: 'Intégrations', icon: Link },
        { id: 'stock', title: 'Stock', icon: Database },
        { id: 'orders', title: 'Commandes', icon: ShoppingCart }
      ]
    },
    {
      id: 'marketing',
      title: 'Ads & Marketing',
      icon: Target,
      color: 'from-blue-500 to-cyan-600',
      subMenus: [
        { id: 'google-ads', title: 'Google Ads', icon: Target },
        { id: 'ads-integration', title: 'Intégration Ads', icon: Link },
        { id: 'google-merchant', title: 'Google Merchant', icon: Globe }
      ]
    },
    {
      id: 'vision-ar',
      title: 'Vision & Studio',
      icon: Glasses,
      color: 'from-pink-500 to-purple-600',
      subMenus: [
        { id: 'ar-mobile', title: 'AR Mobile', icon: Smartphone },
        { id: 'vr-showroom', title: 'VR Showroom', icon: Glasses },
        { id: 'photo-analysis', title: 'Analyse Photo IA', icon: Camera },
        { id: 'ambiance-generator', title: 'Générateur d\'Ambiances', icon: Palette }
      ]
    },
    {
      id: 'seo',
      title: 'SEO',
      icon: Search,
      color: 'from-purple-500 to-pink-600',
      subMenus: [
        { id: 'blog-articles', title: 'Blog & Articles', icon: BookOpen },
        { id: 'auto-blogging', title: 'Auto Blogging', icon: PenTool },
        { id: 'backlinks', title: 'Backlinks', icon: Link },
        { id: 'seo-integration', title: 'Intégration', icon: Share2 },
        { id: 'seo-optimization', title: 'Optimisation SEO', icon: Lightbulb }
      ]
    },
    {
      id: 'omnia-bot',
      title: 'OmnIA Bot',
      icon: Bot,
      color: 'from-purple-500 to-pink-600',
      subMenus: [
        { id: 'robot-config', title: 'Configuration', icon: Bot },
        { id: 'conversations', title: 'Conversations', icon: MessageSquare },
        { id: 'live-chat', title: 'Chat Live', icon: Activity },
        { id: 'satisfaction', title: 'Satisfaction', icon: TrendingUp }
      ]
    },
    {
      id: 'analytics',
      title: 'Analytics',
      icon: BarChart3,
      color: 'from-orange-500 to-red-600',
      subMenus: [
        { id: 'sales-analytics', title: 'Ventes', icon: TrendingUp },
        { id: 'ads-performance', title: 'Performance Ads', icon: Target },
        { id: 'visitor-tracking', title: 'Visiteurs', icon: Eye },
        { id: 'detailed-reports', title: 'Rapports', icon: FileText }
      ]
    },
    {
      id: 'admin',
      title: 'Admin',
      icon: Settings,
      color: 'from-gray-500 to-slate-600',
      subMenus: [
        { id: 'user-management', title: 'Utilisateurs', icon: Users },
        { id: 'api-connections', title: 'API', icon: Wifi },
        { id: 'security', title: 'Sécurité', icon: Shield },
        { id: 'backups', title: 'Sauvegardes', icon: Archive }
      ]
    }
  ];

  useEffect(() => {
    showInfo('Interface chargée', 'Bienvenue dans votre interface admin OmnIA !');
  }, []);

  const handleUpdateRetailerInfo = (field: string, value: string) => {
    setRetailerInfo(prev => ({ ...prev, [field]: value }));
  };

  const handleSaveSettings = () => {
    showSuccess('Paramètres sauvegardés', 'Informations mises à jour avec succès !');
    setShowSettings(false);
  };

  // Dashboard principal avec solutions
  const renderDashboard = () => (
    <div className="space-y-8">
      {/* Solutions Grid - Titre + Icône + Sous-titre */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-7 gap-6">
        {[
          { title: 'E-Commerce', icon: ShoppingCart, color: 'from-green-500 to-emerald-600', subtitle: '247 Produits', menu: 'ecommerce' },
          { title: 'Ads & Marketing', icon: Target, color: 'from-blue-500 to-cyan-600', subtitle: '4.2x ROAS', menu: 'marketing' },
          { title: 'Vision & Studio', icon: Glasses, color: 'from-pink-500 to-purple-600', subtitle: 'AR/VR', menu: 'vision-ar' },
          { title: 'SEO', icon: Search, color: 'from-purple-500 to-pink-600', subtitle: '15 Articles', menu: 'seo' },
          { title: 'OmnIA Bot', icon: Bot, color: 'from-purple-500 to-pink-600', subtitle: '1,234 Chats', menu: 'omnia-bot' },
          { title: 'Analytics', icon: BarChart3, color: 'from-orange-500 to-red-600', subtitle: '42% Conv.', menu: 'analytics' },
          { title: 'Admin', icon: Settings, color: 'from-gray-500 to-slate-600', subtitle: '100% Uptime', menu: 'admin' }
        ].map((solution, index) => {
          const Icon = solution.icon;
          return (
            <div
              key={index}
              onClick={() => setActiveMenu(solution.menu)}
              className="bg-white/10 backdrop-blur-xl rounded-2xl p-6 border border-white/20 hover:border-cyan-500/50 transition-all hover:scale-105 cursor-pointer group"
            >
              <div className={`w-16 h-16 bg-gradient-to-r ${solution.color} rounded-2xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                <Icon className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-lg font-bold text-white mb-2">{solution.title}</h3>
              <p className="text-cyan-300 text-sm">{solution.subtitle}</p>
            </div>
          );
        })}
      </div>

      {/* Synthèse d'activité */}
      <div className="bg-white/10 backdrop-blur-xl rounded-2xl p-8 border border-white/20">
        <h3 className="text-2xl font-bold text-white mb-6">Synthèse d'activité</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-6">
          <div className="text-center">
            <div className="text-3xl font-bold text-green-400">{dashboardStats.totalProducts}</div>
            <div className="text-gray-300 text-sm">Produits</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-blue-400">{dashboardStats.totalConversations.toLocaleString()}</div>
            <div className="text-gray-300 text-sm">Conversations</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-purple-400">€{dashboardStats.totalRevenue.toLocaleString()}</div>
            <div className="text-gray-300 text-sm">Revenus</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-orange-400">{dashboardStats.conversionRate}%</div>
            <div className="text-gray-300 text-sm">Conversion</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-cyan-400">{dashboardStats.activeVisitors}</div>
            <div className="text-gray-300 text-sm">Visiteurs</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-pink-400">{dashboardStats.avgSessionDuration}</div>
            <div className="text-gray-300 text-sm">Session moy.</div>
          </div>
        </div>
      </div>
    </div>
  );

  // Dashboard E-Commerce avec stats
  const renderEcommerceDashboard = () => (
    <div className="space-y-8">
      {/* Stats E-Commerce */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-green-600/20 backdrop-blur-xl rounded-2xl p-6 border border-green-500/30">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-green-200 text-sm mb-1">Produits actifs</p>
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
              <p className="text-purple-200 text-sm mb-1">CA E-Commerce</p>
              <p className="text-3xl font-bold text-white">€34.5k</p>
              <p className="text-purple-300 text-sm">Ce mois</p>
            </div>
            <DollarSign className="w-10 h-10 text-purple-400" />
          </div>
        </div>
        
        <div className="bg-orange-600/20 backdrop-blur-xl rounded-2xl p-6 border border-orange-500/30">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-orange-200 text-sm mb-1">Panier moyen</p>
              <p className="text-3xl font-bold text-white">€221</p>
              <p className="text-orange-300 text-sm">Moyenne</p>
            </div>
            <TrendingUp className="w-10 h-10 text-orange-400" />
          </div>
        </div>
      </div>

      {/* Actions rapides E-Commerce */}
      <div className="bg-white/10 backdrop-blur-xl rounded-2xl p-8 border border-white/20">
        <h3 className="text-xl font-bold text-white mb-6">Actions rapides E-Commerce</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <button
            onClick={() => setActiveSubMenu('catalog')}
            className="bg-green-500/20 hover:bg-green-500/30 border border-green-400/50 text-green-300 p-6 rounded-xl transition-all text-center"
          >
            <Package className="w-8 h-8 mx-auto mb-3" />
            <div className="font-semibold">Gérer Catalogue</div>
            <div className="text-xs text-green-400">247 produits</div>
          </button>
          
          <button
            onClick={() => setActiveSubMenu('catalog-enriched')}
            className="bg-purple-500/20 hover:bg-purple-500/30 border border-purple-400/50 text-purple-300 p-6 rounded-xl transition-all text-center"
          >
            <Sparkles className="w-8 h-8 mx-auto mb-3" />
            <div className="font-semibold">Enrichir avec IA</div>
            <div className="text-xs text-purple-400">DeepSeek</div>
          </button>
          
          <button
            onClick={() => setActiveSubMenu('integrations')}
            className="bg-blue-500/20 hover:bg-blue-500/30 border border-blue-400/50 text-blue-300 p-6 rounded-xl transition-all text-center"
          >
            <Link className="w-8 h-8 mx-auto mb-3" />
            <div className="font-semibold">Intégrations</div>
            <div className="text-xs text-blue-400">Shopify, CSV</div>
          </button>
          
          <button
            onClick={() => setActiveSubMenu('orders')}
            className="bg-orange-500/20 hover:bg-orange-500/30 border border-orange-400/50 text-orange-300 p-6 rounded-xl transition-all text-center"
          >
            <ShoppingCart className="w-8 h-8 mx-auto mb-3" />
            <div className="font-semibold">Commandes</div>
            <div className="text-xs text-orange-400">156 ce mois</div>
          </button>
        </div>
      </div>
    </div>
  );

  // Catalogue Enrichi avec DeepSeek
  const renderEnrichedCatalog = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-white">Catalogue Enrichi avec IA</h2>
        <div className="flex gap-3">
          <button className="bg-gradient-to-r from-purple-500 to-pink-600 hover:from-purple-400 hover:to-pink-500 text-white px-6 py-3 rounded-xl font-semibold transition-all flex items-center gap-2">
            <Brain className="w-5 h-5" />
            Enrichir avec DeepSeek
          </button>
          <button className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-xl font-semibold transition-all flex items-center gap-2">
            <RefreshCw className="w-5 h-5" />
            Cron Auto
          </button>
        </div>
      </div>
      
      <div className="bg-white/10 backdrop-blur-xl rounded-2xl border border-white/20 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-black/20">
              <tr>
                <th className="text-left p-3 text-cyan-300 font-semibold">Photo</th>
                <th className="text-left p-3 text-cyan-300 font-semibold">ID Produit</th>
                <th className="text-left p-3 text-cyan-300 font-semibold">Nom du produit</th>
                <th className="text-left p-3 text-cyan-300 font-semibold">Description</th>
                <th className="text-left p-3 text-cyan-300 font-semibold">Catégorie</th>
                <th className="text-left p-3 text-cyan-300 font-semibold">Sous-catégorie</th>
                <th className="text-left p-3 text-cyan-300 font-semibold">Tags</th>
                <th className="text-left p-3 text-cyan-300 font-semibold">Prix</th>
                <th className="text-left p-3 text-cyan-300 font-semibold">Stock</th>
                <th className="text-left p-3 text-cyan-300 font-semibold">Marque</th>
                <th className="text-left p-3 text-cyan-300 font-semibold">Matière</th>
                <th className="text-left p-3 text-cyan-300 font-semibold">Couleur</th>
                <th className="text-left p-3 text-cyan-300 font-semibold">Dimensions</th>
                <th className="text-left p-3 text-cyan-300 font-semibold">Style</th>
                <th className="text-left p-3 text-cyan-300 font-semibold">Pièce</th>
                <th className="text-left p-3 text-cyan-300 font-semibold">SEO</th>
                <th className="text-left p-3 text-cyan-300 font-semibold">GTIN</th>
                <th className="text-left p-3 text-cyan-300 font-semibold">Actions</th>
              </tr>
            </thead>
            <tbody>
              <tr className="border-b border-white/10">
                <td className="p-3">
                  <img src="https://cdn.shopify.com/s/files/1/0903/7578/2665/files/7_23a97631-68d2-4f3e-8f78-b26c7cd4c2ae.png" className="w-16 h-16 rounded-lg object-cover" />
                </td>
                <td className="p-3 text-white font-mono text-xs">decora-alyana-beige</td>
                <td className="p-3 text-white font-semibold">Canapé ALYANA convertible - Beige</td>
                <td className="p-3 text-gray-300 text-xs">Canapé d'angle convertible 4 places en velours côtelé beige avec coffre de rangement</td>
                <td className="p-3 text-white">Canapé</td>
                <td className="p-3 text-white">Canapé d'angle</td>
                <td className="p-3">
                  <div className="flex gap-1">
                    <span className="bg-blue-500/20 text-blue-300 px-2 py-1 rounded text-xs">convertible</span>
                    <span className="bg-green-500/20 text-green-300 px-2 py-1 rounded text-xs">velours</span>
                  </div>
                </td>
                <td className="p-3">
                  <div className="text-green-400 font-bold">799€</div>
                  <div className="text-gray-400 line-through text-xs">1399€</div>
                </td>
                <td className="p-3 text-green-400 font-bold">100</td>
                <td className="p-3 text-white">Decora Home</td>
                <td className="p-3 text-white">Velours côtelé</td>
                <td className="p-3 text-white">Beige</td>
                <td className="p-3 text-white">280×180×75cm</td>
                <td className="p-3 text-white">Moderne</td>
                <td className="p-3 text-white">Salon</td>
                <td className="p-3 text-cyan-400">Optimisé</td>
                <td className="p-3 text-white font-mono text-xs">3701234567890</td>
                <td className="p-3">
                  <div className="flex gap-1">
                    <button className="p-1 bg-blue-600 hover:bg-blue-700 text-white rounded" title="Voir sur Shopify">
                      <ExternalLink className="w-3 h-3" />
                    </button>
                    <button className="p-1 bg-purple-600 hover:bg-purple-700 text-white rounded" title="Enrichir DeepSeek">
                      <Brain className="w-3 h-3" />
                    </button>
                    <button className="p-1 bg-yellow-600 hover:bg-yellow-700 text-white rounded" title="Modifier">
                      <Edit className="w-3 h-3" />
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

  // Stock Management
  const renderStock = () => (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-white">Gestion des Stocks</h2>
      
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
              {[
                { image: 'https://cdn.shopify.com/s/files/1/0903/7578/2665/files/7_23a97631-68d2-4f3e-8f78-b26c7cd4c2ae.png', title: 'Canapé ALYANA - Beige', available: true, quantity: 100 },
                { image: 'https://cdn.shopify.com/s/files/1/0903/7578/2665/files/3_e80b9a50-b032-4267-8f5b-f9130153e3be.png', title: 'Table AUREA Ø100cm', available: true, quantity: 50 },
                { image: 'https://cdn.shopify.com/s/files/1/0903/7578/2665/files/3_3f11d1af-8ce5-4d2d-a435-cd0a78eb92ee.png', title: 'Chaise INAYA - Gris', available: true, quantity: 96 }
              ].map((item, index) => (
                <tr key={index} className="border-b border-white/10 hover:bg-white/5">
                  <td className="p-4">
                    <img src={item.image} alt={item.title} className="w-16 h-16 rounded-lg object-cover" />
                  </td>
                  <td className="p-4 text-white font-semibold">{item.title}</td>
                  <td className="p-4">
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                      item.available ? 'bg-green-500/20 text-green-300' : 'bg-red-500/20 text-red-300'
                    }`}>
                      {item.available ? 'Oui' : 'Non'}
                    </span>
                  </td>
                  <td className="p-4">
                    <input
                      type="number"
                      value={item.quantity}
                      className="w-20 bg-black/40 border border-gray-600 rounded-lg px-3 py-2 text-white text-sm"
                    />
                  </td>
                  <td className="p-4">
                    <div className="flex gap-2">
                      <button className="p-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg">
                        <Edit className="w-4 h-4" />
                      </button>
                      <button className="p-2 bg-green-600 hover:bg-green-700 text-white rounded-lg">
                        <Save className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );

  // Orders Management
  const renderOrders = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-white">Gestion des Commandes</h2>
        <button className="bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-400 hover:to-emerald-500 text-white px-6 py-3 rounded-xl font-semibold transition-all flex items-center gap-2">
          <Plus className="w-5 h-5" />
          Créer commande manuelle
        </button>
      </div>
      
      {/* Formulaire création commande */}
      <div className="bg-white/10 backdrop-blur-xl rounded-2xl p-8 border border-white/20">
        <h3 className="text-xl font-bold text-white mb-6">Nouvelle commande manuelle</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm text-gray-300 mb-2">Nom du client</label>
            <input type="text" className="w-full bg-black/40 border border-gray-600 rounded-xl px-4 py-3 text-white" placeholder="Jean Dupont" />
          </div>
          <div>
            <label className="block text-sm text-gray-300 mb-2">Email</label>
            <input type="email" className="w-full bg-black/40 border border-gray-600 rounded-xl px-4 py-3 text-white" placeholder="jean@email.com" />
          </div>
          <div className="md:col-span-2">
            <label className="block text-sm text-gray-300 mb-2">Adresse</label>
            <input type="text" className="w-full bg-black/40 border border-gray-600 rounded-xl px-4 py-3 text-white" placeholder="123 Rue de la Paix, 75001 Paris" />
          </div>
          <div>
            <label className="block text-sm text-gray-300 mb-2">Mode de paiement</label>
            <select className="w-full bg-black/40 border border-gray-600 rounded-xl px-4 py-3 text-white">
              <option value="card">Carte bancaire</option>
              <option value="transfer">Virement</option>
              <option value="check">Chèque</option>
              <option value="cash">Espèces</option>
            </select>
          </div>
          <div>
            <label className="block text-sm text-gray-300 mb-2">Produit</label>
            <select className="w-full bg-black/40 border border-gray-600 rounded-xl px-4 py-3 text-white">
              <option value="">Sélectionner un produit</option>
              <option value="alyana">Canapé ALYANA - 799€</option>
              <option value="aurea">Table AUREA - 499€</option>
              <option value="inaya">Chaise INAYA - 99€</option>
            </select>
          </div>
        </div>
        <button className="mt-6 bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-xl font-semibold transition-all">
          Créer la commande
        </button>
      </div>

      {/* Tableau des commandes */}
      <div className="bg-white/10 backdrop-blur-xl rounded-2xl border border-white/20 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-black/20">
              <tr>
                <th className="text-left p-4 text-cyan-300 font-semibold">N° Commande</th>
                <th className="text-left p-4 text-cyan-300 font-semibold">Client</th>
                <th className="text-left p-4 text-cyan-300 font-semibold">Produits</th>
                <th className="text-left p-4 text-cyan-300 font-semibold">Total</th>
                <th className="text-left p-4 text-cyan-300 font-semibold">Statut</th>
                <th className="text-left p-4 text-cyan-300 font-semibold">Date</th>
                <th className="text-left p-4 text-cyan-300 font-semibold">Source</th>
              </tr>
            </thead>
            <tbody>
              {[
                { id: 'CMD-001', client: 'Marie Dubois', products: 'Canapé ALYANA', total: 799, status: 'Livré', date: '15/01/2025', source: 'OmnIA Robot' },
                { id: 'CMD-002', client: 'Jean Martin', products: 'Table AUREA + 4 Chaises', total: 895, status: 'En cours', date: '14/01/2025', source: 'Site Web' },
                { id: 'CMD-003', client: 'Sophie Laurent', products: 'Chaise INAYA x2', total: 198, status: 'Expédiée', date: '13/01/2025', source: 'OmnIA Robot' }
              ].map((order, index) => (
                <tr key={index} className="border-b border-white/10 hover:bg-white/5">
                  <td className="p-4 text-cyan-400 font-mono">{order.id}</td>
                  <td className="p-4 text-white">{order.client}</td>
                  <td className="p-4 text-gray-300">{order.products}</td>
                  <td className="p-4 text-green-400 font-bold">{order.total}€</td>
                  <td className="p-4">
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                      order.status === 'Livré' ? 'bg-green-500/20 text-green-300' :
                      order.status === 'En cours' ? 'bg-yellow-500/20 text-yellow-300' :
                      'bg-blue-500/20 text-blue-300'
                    }`}>
                      {order.status}
                    </span>
                  </td>
                  <td className="p-4 text-gray-300">{order.date}</td>
                  <td className="p-4">
                    <span className={`px-2 py-1 rounded-full text-xs ${
                      order.source === 'OmnIA Robot' ? 'bg-purple-500/20 text-purple-300' : 'bg-blue-500/20 text-blue-300'
                    }`}>
                      {order.source}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );

  // Intégrations avec statut
  const renderIntegrations = () => (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-white">Intégrations E-Commerce</h2>
      
      {/* Intégrations en cours */}
      <div className="bg-white/10 backdrop-blur-xl rounded-2xl p-8 border border-white/20">
        <h3 className="text-xl font-bold text-white mb-6">Intégrations actives</h3>
        <div className="space-y-4">
          <div className="flex items-center justify-between p-4 bg-green-500/20 rounded-xl border border-green-400/30">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-green-600 rounded-xl flex items-center justify-center">
                <FileText className="w-6 h-6 text-white" />
              </div>
              <div>
                <h4 className="font-semibold text-white">CSV Catalogue</h4>
                <p className="text-green-300 text-sm">247 produits • Dernière sync: 14/01/2025</p>
              </div>
            </div>
            <div className="flex gap-2">
              <button className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-xl flex items-center gap-2">
                <Download className="w-4 h-4" />
                Télécharger
              </button>
              <button className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-xl flex items-center gap-2">
                <RefreshCw className="w-4 h-4" />
                Sync
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Nouvelles intégrations */}
      <EcommerceIntegration onConnected={() => {}} />
    </div>
  );

  // Google Ads avec autorisation
  const renderGoogleAds = () => (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-white">Google Ads</h2>
      
      <div className="bg-yellow-500/20 border border-yellow-400/50 rounded-xl p-6">
        <h3 className="font-semibold text-yellow-200 mb-4">🔐 Connexion Google Ads requise</h3>
        <p className="text-yellow-300 mb-4">Veuillez d'abord connecter votre compte Google Ads pour accéder aux fonctionnalités.</p>
        <button className="bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-400 hover:to-blue-500 text-white px-6 py-3 rounded-xl font-semibold transition-all">
          Connecter Google Ads
        </button>
      </div>

      {/* Stats par période */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-blue-600/20 backdrop-blur-xl rounded-2xl p-6 border border-blue-500/30">
          <h4 className="text-blue-200 font-semibold mb-4">📅 Aujourd'hui</h4>
          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="text-gray-300">Dépenses:</span>
              <span className="text-blue-400 font-bold">€45</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-300">Clics:</span>
              <span className="text-blue-400 font-bold">23</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-300">Conversions:</span>
              <span className="text-blue-400 font-bold">2</span>
            </div>
          </div>
        </div>
        
        <div className="bg-green-600/20 backdrop-blur-xl rounded-2xl p-6 border border-green-500/30">
          <h4 className="text-green-200 font-semibold mb-4">📅 Ce mois</h4>
          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="text-gray-300">Dépenses:</span>
              <span className="text-green-400 font-bold">€2,450</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-300">Clics:</span>
              <span className="text-green-400 font-bold">1,240</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-300">Conversions:</span>
              <span className="text-green-400 font-bold">89</span>
            </div>
          </div>
        </div>
        
        <div className="bg-purple-600/20 backdrop-blur-xl rounded-2xl p-6 border border-purple-500/30">
          <h4 className="text-purple-200 font-semibold mb-4">📅 Cette année</h4>
          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="text-gray-300">Dépenses:</span>
              <span className="text-purple-400 font-bold">€15,600</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-300">Clics:</span>
              <span className="text-purple-400 font-bold">8,450</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-300">Conversions:</span>
              <span className="text-purple-400 font-bold">456</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  // Vision Augmentée & Studio
  const renderVisionAR = () => (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-bold text-white mb-2">Vision Augmentée & Studio</h2>
        <p className="text-gray-300">Expériences immersives et réalité augmentée</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* AR Mobile */}
        <div className="bg-white/10 backdrop-blur-xl rounded-2xl p-8 border border-white/20">
          <div className="flex items-center gap-4 mb-6">
            <div className="w-16 h-16 bg-gradient-to-br from-pink-500 to-purple-600 rounded-2xl flex items-center justify-center">
              <Smartphone className="w-8 h-8 text-white" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-white">📱 AR Mobile</h3>
              <p className="text-gray-300">Scanner pièce → placer meubles en AR</p>
            </div>
          </div>
          
          <div className="space-y-4">
            <div className="bg-pink-500/20 border border-pink-400/50 rounded-xl p-4">
              <h4 className="font-semibold text-pink-200 mb-2">🎯 Fonctionnalités :</h4>
              <ul className="text-pink-300 text-sm space-y-1">
                <li>• Scanner une pièce avec la caméra</li>
                <li>• Placer meubles Decora Home en AR</li>
                <li>• Visualisation 3D temps réel</li>
                <li>• Partage captures AR</li>
                <li>• Mesures automatiques</li>
                <li>• Catalogue intégré</li>
              </ul>
            </div>
            
            <div className="flex gap-3">
              <button className="flex-1 bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-400 hover:to-purple-500 text-white py-3 rounded-xl font-semibold transition-all">
                Configurer AR
              </button>
              <button className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-3 rounded-xl">
                <Play className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>

        {/* VR Showroom */}
        <div className="bg-white/10 backdrop-blur-xl rounded-2xl p-8 border border-white/20">
          <div className="flex items-center gap-4 mb-6">
            <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-blue-600 rounded-2xl flex items-center justify-center">
              <Glasses className="w-8 h-8 text-white" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-white">🕶️ VR Showroom</h3>
              <p className="text-gray-300">Visite immersive de votre magasin</p>
            </div>
          </div>
          
          <div className="space-y-4">
            <div className="bg-purple-500/20 border border-purple-400/50 rounded-xl p-4">
              <h4 className="font-semibold text-purple-200 mb-2">🏪 Expérience :</h4>
              <ul className="text-purple-300 text-sm space-y-1">
                <li>• Visite 360° de votre magasin</li>
                <li>• Interaction avec les produits</li>
                <li>• Guide OmnIA intégré</li>
                <li>• Compatible VR/Desktop</li>
                <li>• Hotspots informatifs</li>
                <li>• Panier virtuel</li>
              </ul>
            </div>
            
            <div className="flex gap-3">
              <button className="flex-1 bg-gradient-to-r from-purple-500 to-blue-600 hover:from-purple-400 hover:to-blue-500 text-white py-3 rounded-xl font-semibold transition-all">
                Créer VR Showroom
              </button>
              <button className="bg-green-600 hover:bg-green-700 text-white px-4 py-3 rounded-xl">
                <Eye className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>

        {/* Analyse Photo IA */}
        <div className="bg-white/10 backdrop-blur-xl rounded-2xl p-8 border border-white/20">
          <div className="flex items-center gap-4 mb-6">
            <div className="w-16 h-16 bg-gradient-to-br from-cyan-500 to-green-600 rounded-2xl flex items-center justify-center">
              <Camera className="w-8 h-8 text-white" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-white">📸 Analyse Photo IA</h3>
              <p className="text-gray-300">Upload photo → recommandations</p>
            </div>
          </div>
          
          <div className="space-y-4">
            <div className="bg-cyan-500/20 border border-cyan-400/50 rounded-xl p-4">
              <h4 className="font-semibold text-cyan-200 mb-2">🤖 IA Vision :</h4>
              <ul className="text-cyan-300 text-sm space-y-1">
                <li>• Analyse style existant</li>
                <li>• Détection couleurs/matériaux</li>
                <li>• Recommandations personnalisées</li>
                <li>• Intégration catalogue</li>
                <li>• Mesures automatiques</li>
                <li>• Conseils déco experts</li>
              </ul>
            </div>
            
            <div className="flex gap-3">
              <button className="flex-1 bg-gradient-to-r from-cyan-500 to-green-600 hover:from-cyan-400 hover:to-green-500 text-white py-3 rounded-xl font-semibold transition-all">
                Activer Analyse
              </button>
              <button className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-3 rounded-xl">
                <Upload className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>

        {/* Générateur d'Ambiances */}
        <div className="bg-white/10 backdrop-blur-xl rounded-2xl p-8 border border-white/20">
          <div className="flex items-center gap-4 mb-6">
            <div className="w-16 h-16 bg-gradient-to-br from-orange-500 to-pink-600 rounded-2xl flex items-center justify-center">
              <Palette className="w-8 h-8 text-white" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-white">🎨 Générateur d'Ambiances</h3>
              <p className="text-gray-300">Styles complets automatiques</p>
            </div>
          </div>
          
          <div className="space-y-4">
            <div className="bg-orange-500/20 border border-orange-400/50 rounded-xl p-4">
              <h4 className="font-semibold text-orange-200 mb-2">✨ Ambiances disponibles :</h4>
              <div className="grid grid-cols-2 gap-2 text-sm">
                <div className="text-orange-300">• Salon minimaliste</div>
                <div className="text-orange-300">• Chambre cosy</div>
                <div className="text-orange-300">• Bureau design</div>
                <div className="text-orange-300">• Cuisine moderne</div>
                <div className="text-orange-300">• Style scandinave</div>
                <div className="text-orange-300">• Industriel chic</div>
              </div>
            </div>
            
            <div className="flex gap-3">
              <button className="flex-1 bg-gradient-to-r from-orange-500 to-pink-600 hover:from-orange-400 hover:to-pink-500 text-white py-3 rounded-xl font-semibold transition-all">
                Générer Ambiances
              </button>
              <button className="bg-cyan-600 hover:bg-cyan-700 text-white px-4 py-3 rounded-xl">
                <Wand2 className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  // SEO Blog avec génération
  const renderSEOBlog = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-white">Blog & Articles SEO</h2>
        <button className="bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white px-6 py-3 rounded-xl font-semibold transition-all flex items-center gap-2">
          <Brain className="w-5 h-5" />
          Générer article IA
        </button>
      </div>
      
      {/* Génération à partir d'un produit */}
      <div className="bg-white/10 backdrop-blur-xl rounded-2xl p-8 border border-white/20">
        <h3 className="text-xl font-bold text-white mb-6">Générer article à partir d'un produit</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm text-gray-300 mb-2">Produit source</label>
            <select className="w-full bg-black/40 border border-gray-600 rounded-xl px-4 py-3 text-white">
              <option value="">Sélectionner un produit</option>
              <option value="alyana">Canapé ALYANA - Beige</option>
              <option value="aurea">Table AUREA - Travertin</option>
              <option value="inaya">Chaise INAYA - Gris</option>
            </select>
          </div>
          <div>
            <label className="block text-sm text-gray-300 mb-2">Keywords cibles</label>
            <input type="text" className="w-full bg-black/40 border border-gray-600 rounded-xl px-4 py-3 text-white" placeholder="canapé convertible, salon moderne" />
          </div>
          <div>
            <label className="block text-sm text-gray-300 mb-2">Sujet de l'article</label>
            <input type="text" className="w-full bg-black/40 border border-gray-600 rounded-xl px-4 py-3 text-white" placeholder="Guide d'achat canapé convertible 2025" />
          </div>
          <div>
            <label className="block text-sm text-gray-300 mb-2">Type d'article</label>
            <select className="w-full bg-black/40 border border-gray-600 rounded-xl px-4 py-3 text-white">
              <option value="guide">Guide d'achat</option>
              <option value="tendances">Tendances déco</option>
              <option value="conseils">Conseils aménagement</option>
              <option value="comparatif">Comparatif produits</option>
            </select>
          </div>
        </div>
        <button className="mt-6 bg-gradient-to-r from-purple-500 to-pink-600 hover:from-purple-400 hover:to-pink-500 text-white px-6 py-3 rounded-xl font-semibold transition-all">
          Générer avec DeepSeek
        </button>
      </div>

      <SEOBlogTab />
    </div>
  );

  // Auto Blogging avec planification
  const renderAutoBlogging = () => (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-white">Auto Blogging</h2>
      
      <div className="bg-white/10 backdrop-blur-xl rounded-2xl p-8 border border-white/20">
        <h3 className="text-xl font-bold text-white mb-6">Planification automatique</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm text-gray-300 mb-2">Fréquence</label>
            <select className="w-full bg-black/40 border border-gray-600 rounded-xl px-4 py-3 text-white">
              <option value="daily">Quotidien</option>
              <option value="weekly">Hebdomadaire</option>
              <option value="monthly">Mensuel</option>
            </select>
          </div>
          <div>
            <label className="block text-sm text-gray-300 mb-2">Jour de publication</label>
            <select className="w-full bg-black/40 border border-gray-600 rounded-xl px-4 py-3 text-white">
              <option value="monday">Lundi</option>
              <option value="tuesday">Mardi</option>
              <option value="wednesday">Mercredi</option>
              <option value="thursday">Jeudi</option>
              <option value="friday">Vendredi</option>
            </select>
          </div>
          <div>
            <label className="block text-sm text-gray-300 mb-2">Thèmes prioritaires</label>
            <input type="text" className="w-full bg-black/40 border border-gray-600 rounded-xl px-4 py-3 text-white" placeholder="tendances, guides d'achat, conseils déco" />
          </div>
          <div>
            <label className="block text-sm text-gray-300 mb-2">Keywords focus</label>
            <input type="text" className="w-full bg-black/40 border border-gray-600 rounded-xl px-4 py-3 text-white" placeholder="canapé moderne, table design, mobilier salon" />
          </div>
        </div>
        <div className="flex gap-4 mt-6">
          <button className="bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-xl font-semibold transition-all">
            Activer Auto Blogging
          </button>
          <button className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-xl font-semibold transition-all">
            Planifier maintenant
          </button>
        </div>
      </div>
    </div>
  );

  // Backlinks avec démo
  const renderBacklinks = () => (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-white">Backlinks</h2>
      
      <div className="bg-white/10 backdrop-blur-xl rounded-2xl border border-white/20 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-black/20">
              <tr>
                <th className="text-left p-4 text-cyan-300 font-semibold">Article</th>
                <th className="text-left p-4 text-cyan-300 font-semibold">Produit lié</th>
                <th className="text-left p-4 text-cyan-300 font-semibold">Plateforme</th>
                <th className="text-left p-4 text-cyan-300 font-semibold">URL</th>
                <th className="text-left p-4 text-cyan-300 font-semibold">Date</th>
                <th className="text-left p-4 text-cyan-300 font-semibold">Statut</th>
              </tr>
            </thead>
            <tbody>
              {[
                { article: 'Guide Canapé Convertible 2025', product: 'Canapé ALYANA', platform: 'WordPress', url: 'blog.decorahome.fr/guide-canape-convertible', date: '14/01/2025', status: 'Publié' },
                { article: 'Tendances Tables Travertin', product: 'Table AUREA', platform: 'Shopify Blog', url: 'decorahome.fr/blogs/tendances-tables', date: '13/01/2025', status: 'Publié' },
                { article: 'Chaises Design Contemporain', product: 'Chaise INAYA', platform: 'PrestaShop', url: 'shop.decorahome.fr/blog/chaises-design', date: '12/01/2025', status: 'En attente' }
              ].map((link, index) => (
                <tr key={index} className="border-b border-white/10 hover:bg-white/5">
                  <td className="p-4 text-white font-semibold">{link.article}</td>
                  <td className="p-4 text-cyan-400">{link.product}</td>
                  <td className="p-4">
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                      link.platform === 'WordPress' ? 'bg-blue-500/20 text-blue-300' :
                      link.platform === 'Shopify Blog' ? 'bg-green-500/20 text-green-300' :
                      'bg-purple-500/20 text-purple-300'
                    }`}>
                      {link.platform}
                    </span>
                  </td>
                  <td className="p-4">
                    <a href={`https://${link.url}`} target="_blank" className="text-cyan-400 hover:text-cyan-300 flex items-center gap-1">
                      <ExternalLink className="w-3 h-3" />
                      {link.url}
                    </a>
                  </td>
                  <td className="p-4 text-gray-300">{link.date}</td>
                  <td className="p-4">
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                      link.status === 'Publié' ? 'bg-green-500/20 text-green-300' :
                      link.status === 'En attente' ? 'bg-yellow-500/20 text-yellow-300' :
                      'bg-red-500/20 text-red-300'
                    }`}>
                      {link.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );

  // SEO Integration
  const renderSEOIntegration = () => (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-white">Intégration SEO</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[
          { name: 'WordPress', icon: BookOpen, color: 'from-blue-500 to-blue-600', status: 'Connecté' },
          { name: 'Shopify Blog', icon: Store, color: 'from-green-500 to-green-600', status: 'Connecté' },
          { name: 'PrestaShop', icon: ShoppingCart, color: 'from-purple-500 to-purple-600', status: 'Non connecté' },
          { name: 'Magento', icon: Package, color: 'from-orange-500 to-orange-600', status: 'Non connecté' },
          { name: 'Google My Business', icon: Globe, color: 'from-red-500 to-red-600', status: 'En attente' }
        ].map((platform, index) => (
          <div key={index} className="bg-white/10 backdrop-blur-xl rounded-2xl p-6 border border-white/20">
            <div className="flex items-center gap-4 mb-4">
              <div className={`w-12 h-12 bg-gradient-to-r ${platform.color} rounded-xl flex items-center justify-center`}>
                <platform.icon className="w-6 h-6 text-white" />
              </div>
              <div>
                <h3 className="font-bold text-white">{platform.name}</h3>
                <span className={`px-2 py-1 rounded-full text-xs ${
                  platform.status === 'Connecté' ? 'bg-green-500/20 text-green-300' :
                  platform.status === 'En attente' ? 'bg-yellow-500/20 text-yellow-300' :
                  'bg-red-500/20 text-red-300'
                }`}>
                  {platform.status}
                </span>
              </div>
            </div>
            <button className={`w-full py-2 rounded-xl font-semibold transition-all ${
              platform.status === 'Connecté' 
                ? 'bg-green-600 hover:bg-green-700 text-white' 
                : 'bg-blue-600 hover:bg-blue-700 text-white'
            }`}>
              {platform.status === 'Connecté' ? 'Gérer' : 'Connecter'}
            </button>
          </div>
        ))}
      </div>
    </div>
  );

  // SEO Optimization avec DeepSeek
  const renderSEOOptimization = () => (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-white">Optimisation SEO avec DeepSeek</h2>
      
      <div className="bg-white/10 backdrop-blur-xl rounded-2xl p-8 border border-white/20">
        <h3 className="text-xl font-bold text-white mb-6">Optimisation automatique</h3>
        
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <label className="block text-sm text-gray-300 mb-2">Image Alt</label>
              <textarea className="w-full bg-black/40 border border-gray-600 rounded-xl px-4 py-3 text-white h-24 resize-none" placeholder="Description optimisée pour SEO..."></textarea>
            </div>
            <div>
              <label className="block text-sm text-gray-300 mb-2">SEO Title</label>
              <textarea className="w-full bg-black/40 border border-gray-600 rounded-xl px-4 py-3 text-white h-24 resize-none" placeholder="Titre optimisé (max 60 caractères)..."></textarea>
            </div>
            <div>
              <label className="block text-sm text-gray-300 mb-2">SEO Description</label>
              <textarea className="w-full bg-black/40 border border-gray-600 rounded-xl px-4 py-3 text-white h-24 resize-none" placeholder="Meta description (max 155 caractères)..."></textarea>
            </div>
          </div>
          
          <div className="bg-green-500/20 border border-green-400/50 rounded-xl p-4">
            <h4 className="font-semibold text-green-200 mb-2">📈 Gains SEO estimés :</h4>
            <div className="grid grid-cols-3 gap-4 text-sm">
              <div className="text-center">
                <div className="text-green-400 font-bold text-lg">+45%</div>
                <div className="text-green-300">Trafic organique</div>
              </div>
              <div className="text-center">
                <div className="text-green-400 font-bold text-lg">+30%</div>
                <div className="text-green-300">Conversions</div>
              </div>
              <div className="text-center">
                <div className="text-green-400 font-bold text-lg">Top 3</div>
                <div className="text-green-300">Position Google</div>
              </div>
            </div>
          </div>
          
          <div className="flex gap-4">
            <button className="bg-gradient-to-r from-purple-500 to-pink-600 hover:from-purple-400 hover:to-pink-500 text-white px-6 py-3 rounded-xl font-semibold transition-all flex items-center gap-2">
              <Brain className="w-5 h-5" />
              Optimiser avec DeepSeek
            </button>
            <button className="bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-xl font-semibold transition-all flex items-center gap-2">
              <Upload className="w-5 h-5" />
              Envoyer à Shopify
            </button>
            <button className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-xl font-semibold transition-all flex items-center gap-2">
              <Download className="w-5 h-5" />
              Auto Export
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  // Analytics avec données
  const renderAnalytics = () => (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-white">Analytics Détaillées</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-blue-600/20 backdrop-blur-xl rounded-2xl p-6 border border-blue-500/30">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-blue-200 text-sm mb-1">Pages vues</p>
              <p className="text-3xl font-bold text-white">45,680</p>
              <p className="text-blue-300 text-sm">+12% vs mois dernier</p>
            </div>
            <Eye className="w-10 h-10 text-blue-400" />
          </div>
        </div>
        
        <div className="bg-green-600/20 backdrop-blur-xl rounded-2xl p-6 border border-green-500/30">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-green-200 text-sm mb-1">Taux de rebond</p>
              <p className="text-3xl font-bold text-white">32%</p>
              <p className="text-green-300 text-sm">-8% amélioration</p>
            </div>
            <TrendingUp className="w-10 h-10 text-green-400" />
          </div>
        </div>
        
        <div className="bg-purple-600/20 backdrop-blur-xl rounded-2xl p-6 border border-purple-500/30">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-purple-200 text-sm mb-1">Durée session</p>
              <p className="text-3xl font-bold text-white">4m 12s</p>
              <p className="text-purple-300 text-sm">+25% engagement</p>
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

      {/* Graphiques */}
      <div className="bg-white/10 backdrop-blur-xl rounded-2xl p-8 border border-white/20">
        <h3 className="text-xl font-bold text-white mb-6">Évolution du trafic</h3>
        <div className="h-64 bg-black/20 rounded-xl flex items-center justify-center">
          <div className="text-center">
            <BarChart3 className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-400">Graphiques analytics en développement</p>
          </div>
        </div>
      </div>
    </div>
  );

  // Rapports détaillés
  const renderReports = () => (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-white">Rapports Détaillés</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[
          { title: 'Rapport Mensuel', description: 'Synthèse complète du mois', icon: Calendar, color: 'from-blue-500 to-blue-600' },
          { title: 'Performance Produits', description: 'Top ventes et tendances', icon: TrendingUp, color: 'from-green-500 to-green-600' },
          { title: 'Analyse Concurrence', description: 'Positionnement marché', icon: Target, color: 'from-purple-500 to-purple-600' },
          { title: 'ROI Marketing', description: 'Retour sur investissement', icon: DollarSign, color: 'from-orange-500 to-orange-600' },
          { title: 'Satisfaction Client', description: 'NPS et avis clients', icon: Star, color: 'from-pink-500 to-pink-600' },
          { title: 'Prévisions IA', description: 'Tendances futures', icon: Brain, color: 'from-cyan-500 to-cyan-600' }
        ].map((report, index) => {
          const Icon = report.icon;
          return (
            <div key={index} className="bg-white/10 backdrop-blur-xl rounded-2xl p-6 border border-white/20 hover:border-cyan-500/50 transition-all">
              <div className="flex items-center gap-4 mb-4">
                <div className={`w-12 h-12 bg-gradient-to-r ${report.color} rounded-xl flex items-center justify-center`}>
                  <Icon className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h3 className="font-bold text-white">{report.title}</h3>
                  <p className="text-gray-300 text-sm">{report.description}</p>
                </div>
              </div>
              <div className="flex gap-2">
                <button className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-2 rounded-xl text-sm">
                  Générer
                </button>
                <button className="bg-green-600 hover:bg-green-700 text-white px-3 py-2 rounded-xl">
                  <Download className="w-4 h-4" />
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );

  const renderMainContent = () => {
    if (activeMenu === 'dashboard') {
      return renderDashboard();
    }

    // Dashboards spécifiques par univers
    if (activeMenu === 'ecommerce' && activeSubMenu === 'overview') {
      return renderEcommerceDashboard();
    }

    switch (activeSubMenu) {
      // E-Commerce
      case 'catalog':
        return <CatalogManagement />;
      case 'catalog-enriched':
        return renderEnrichedCatalog();
      case 'data-cron':
        return <MLTrainingDashboard />;
      case 'ai-training':
        return <AITrainingInterface />;
      case 'integrations':
        return renderIntegrations();
      case 'stock':
        return renderStock();
      case 'orders':
        return renderOrders();
      
      // Marketing
      case 'google-ads':
        return renderGoogleAds();
      case 'ads-integration':
        return <div className="space-y-6"><h2 className="text-2xl font-bold text-white">Intégration Google Ads</h2><div className="bg-white/10 backdrop-blur-xl rounded-2xl p-8 border border-white/20"><h3 className=\"text-xl font-bold text-white mb-4">Autorisation Google Ads API</h3><div className=\"space-y-4"><div><label className=\"block text-sm text-gray-300 mb-2">Client ID</label><input type=\"text" className="w-full bg-black/40 border border-gray-600 rounded-xl px-4 py-3 text-white\" placeholder="Votre Client ID Google" /></div><div><label className="block text-sm text-gray-300 mb-2">Client Secret</label><input type="password" className="w-full bg-black/40 border border-gray-600 rounded-xl px-4 py-3 text-white" placeholder="Votre Client Secret" /></div><div><label className="block text-sm text-gray-300 mb-2">Developer Token</label><input type="password" className="w-full bg-black/40 border border-gray-600 rounded-xl px-4 py-3 text-white" placeholder="Token développeur Google Ads" /></div><button className="bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-400 hover:to-blue-500 text-white px-6 py-3 rounded-xl font-semibold transition-all">Autoriser connexion</button></div></div></div>;
      case 'google-merchant':
        return <GoogleMerchantTab />;
      
      // Vision AR
      case 'ar-mobile':
      case 'vr-showroom':
      case 'photo-analysis':
      case 'ambiance-generator':
        return renderVisionAR();
      
      // SEO
      case 'blog-articles':
        return renderSEOBlog();
      case 'auto-blogging':
        return renderAutoBlogging();
      case 'backlinks':
        return renderBacklinks();
      case 'seo-integration':
        return renderSEOIntegration();
      case 'seo-optimization':
        return renderSEOOptimization();
      
      // OmnIA Bot
      case 'robot-config':
        return <OmniaRobotTab />;
      case 'conversations':
        return <ConversationHistory />;
      case 'live-chat':
        return <div className="text-center py-20"><MessageSquare className="w-16 h-16 text-gray-400 mx-auto mb-4" /><h3 className="text-xl font-bold text-white">Chat Live</h3><p className="text-gray-400">Interface temps réel</p></div>;
      case 'satisfaction':
        return <div className="text-center py-20"><TrendingUp className="w-16 h-16 text-gray-400 mx-auto mb-4" /><h3 className="text-xl font-bold text-white">Satisfaction</h3><p className="text-gray-400">Suivi satisfaction client</p></div>;
      
      // Analytics
      case 'sales-analytics':
        return renderAnalytics();
      case 'ads-performance':
        return renderGoogleAds();
      case 'visitor-tracking':
        return renderAnalytics();
      case 'detailed-reports':
        return renderReports();
      
      // Admin
      case 'user-management':
        return <div className="text-center py-20"><Users className="w-16 h-16 text-gray-400 mx-auto mb-4" /><h3 className="text-xl font-bold text-white">Gestion Utilisateurs</h3><p className="text-gray-400">Vendeurs et permissions</p></div>;
      case 'api-connections':
        return renderIntegrations();
      case 'security':
        return <div className="text-center py-20"><Shield className="w-16 h-16 text-gray-400 mx-auto mb-4" /><h3 className="text-xl font-bold text-white">Sécurité</h3><p className="text-gray-400">Permissions et accès</p></div>;
      case 'backups':
        return <div className="text-center py-20"><Archive className="w-16 h-16 text-gray-400 mx-auto mb-4" /><h3 className="text-xl font-bold text-white">Sauvegardes</h3><p className="text-gray-400">Backup automatique</p></div>;
      
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

      {/* Header fixe */}
      <header className="relative z-10 bg-black/20 backdrop-blur-xl border-b border-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center gap-4">
              <button
                onClick={() => setActiveMenu('dashboard')}
                className="flex items-center gap-2 text-cyan-400 hover:text-cyan-300 transition-colors"
              >
                <Home className="w-5 h-5" />
              </button>
              <Logo size="sm" />
              <div>
                <h1 className="text-xl font-bold text-white">OmnIA Admin</h1>
                <p className="text-cyan-300 text-sm">{retailerInfo.companyName}</p>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <button
                onClick={() => window.open('/chat', '_blank')}
                className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-xl transition-all flex items-center gap-2"
              >
                <Bot className="w-4 h-4" />
                Tester OmnIA
              </button>
              
              <button
                onClick={() => setShowSettings(!showSettings)}
                className="bg-gray-600 hover:bg-gray-700 text-white p-2 rounded-xl transition-all"
                title="Paramètres revendeur"
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

      {/* Onglets horizontaux */}
      {activeMenu !== 'dashboard' && (
        <div className="relative z-10 bg-black/10 backdrop-blur-xl border-b border-white/10">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex gap-2 py-4 overflow-x-auto">
              {menuItems.find(m => m.id === activeMenu)?.subMenus.map((subMenu) => {
                const SubIcon = subMenu.icon;
                return (
                  <button
                    key={subMenu.id}
                    onClick={() => setActiveSubMenu(subMenu.id)}
                    className={`flex items-center gap-2 px-4 py-2 rounded-xl transition-all whitespace-nowrap ${
                      activeSubMenu === subMenu.id
                        ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30'
                        : 'text-gray-300 hover:bg-white/10 hover:text-white'
                    }`}
                  >
                    <SubIcon className="w-4 h-4" />
                    <span className="text-sm font-medium">{subMenu.title}</span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}

      <div className="relative z-10 flex h-screen pt-16">
        {/* Sidebar gauche */}
        <div className="w-80 bg-black/20 backdrop-blur-2xl border-r border-white/10 flex flex-col overflow-y-auto">
          <div className="p-4 space-y-2">
            {menuItems.map((menu) => {
              const Icon = menu.icon;
              const isActive = activeMenu === menu.id;
              
              return (
                <div key={menu.id} className="space-y-1">
                  <button
                    onClick={() => {
                      setActiveMenu(menu.id);
                      if (menu.subMenus.length > 0) {
                        setActiveSubMenu(menu.subMenus[0].id);
                      }
                    }}
                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all text-left ${
                      isActive
                        ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30'
                        : 'text-gray-300 hover:bg-white/10 hover:text-white'
                    }`}
                  >
                    <div className={`w-10 h-10 bg-gradient-to-br ${menu.color} rounded-xl flex items-center justify-center`}>
                      <Icon className="w-5 h-5 text-white" />
                    </div>
                    <span className="font-semibold">{menu.title}</span>
                  </button>
                  
                  {isActive && menu.subMenus.length > 0 && (
                    <div className="ml-6 space-y-1">
                      {menu.subMenus.map((subMenu) => {
                        const SubIcon = subMenu.icon;
                        const isSubActive = activeSubMenu === subMenu.id;
                        
                        return (
                          <button
                            key={subMenu.id}
                            onClick={() => setActiveSubMenu(subMenu.id)}
                            className={`w-full flex items-center gap-3 px-4 py-2 rounded-lg transition-all text-left text-sm ${
                              isSubActive
                                ? 'bg-white/20 text-white border border-white/30'
                                : 'text-gray-400 hover:bg-white/10 hover:text-gray-300'
                            }`}
                          >
                            <SubIcon className="w-4 h-4" />
                            <span>{subMenu.title}</span>
                          </button>
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Contenu principal */}
        <div className="flex-1 overflow-y-auto">
          <div className="p-8">
            {renderMainContent()}
          </div>
        </div>
      </div>

      {/* Modal paramètres avec TOUTES les données d'inscription */}
      {showSettings && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-800/95 backdrop-blur-xl rounded-2xl p-8 max-w-4xl w-full max-h-[90vh] overflow-y-auto border border-slate-600/50">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-2xl font-bold text-white">Paramètres Revendeur - Données d'Inscription</h3>
              <button
                onClick={() => setShowSettings(false)}
                className="text-gray-400 hover:text-white transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
            
            <div className="space-y-8">
              {/* Informations entreprise */}
              <div className="bg-black/20 rounded-xl p-6">
                <h4 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                  <Building className="w-5 h-5 text-blue-400" />
                  Informations Entreprise
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm text-gray-300 mb-2">Nom de l'entreprise *</label>
                    <input
                      type="text"
                      value={retailerInfo.companyName}
                      onChange={(e) => handleUpdateRetailerInfo('companyName', e.target.value)}
                      className="w-full bg-black/40 border border-gray-600 rounded-xl px-4 py-3 text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-gray-300 mb-2">SIRET *</label>
                    <input
                      type="text"
                      value={retailerInfo.siret}
                      onChange={(e) => handleUpdateRetailerInfo('siret', e.target.value)}
                      className="w-full bg-black/40 border border-gray-600 rounded-xl px-4 py-3 text-white"
                      placeholder="Numéro SIRET de votre entreprise"
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-gray-300 mb-2">Plan OmnIA</label>
                    <select
                      value={retailerInfo.plan}
                      onChange={(e) => handleUpdateRetailerInfo('plan', e.target.value)}
                      className="w-full bg-black/40 border border-gray-600 rounded-xl px-4 py-3 text-white"
                    >
                      <option value="starter">Starter - 29€/mois</option>
                      <option value="professional">Professional - 79€/mois</option>
                      <option value="enterprise">Enterprise - 199€/mois</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm text-gray-300 mb-2">Sous-domaine</label>
                    <div className="flex items-center gap-2">
                      <input
                        type="text"
                        value={retailerInfo.subdomain}
                        onChange={(e) => handleUpdateRetailerInfo('subdomain', e.target.value)}
                        className="flex-1 bg-black/40 border border-gray-600 rounded-xl px-4 py-3 text-white"
                      />
                      <span className="text-gray-400">.omnia.sale</span>
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm text-gray-300 mb-2">Pays *</label>
                    <select
                      value={retailerInfo.country}
                      onChange={(e) => handleUpdateRetailerInfo('country', e.target.value)}
                      className="w-full bg-black/40 border border-gray-600 rounded-xl px-4 py-3 text-white"
                    >
                      <option value="France">🇫🇷 France</option>
                      <option value="Belgique">🇧🇪 Belgique</option>
                      <option value="Suisse">🇨🇭 Suisse</option>
                      <option value="Luxembourg">🇱🇺 Luxembourg</option>
                      <option value="Canada">🇨🇦 Canada</option>
                      <option value="Maroc">🇲🇦 Maroc</option>
                      <option value="Tunisie">🇹🇳 Tunisie</option>
                      <option value="Sénégal">🇸🇳 Sénégal</option>
                      <option value="Côte d'Ivoire">🇨🇮 Côte d'Ivoire</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Contact responsable */}
              <div className="bg-black/20 rounded-xl p-6">
                <h4 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                  <User className="w-5 h-5 text-green-400" />
                  Contact Responsable
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm text-gray-300 mb-2">Prénom *</label>
                    <input
                      type="text"
                      value={retailerInfo.firstName}
                      onChange={(e) => handleUpdateRetailerInfo('firstName', e.target.value)}
                      className="w-full bg-black/40 border border-gray-600 rounded-xl px-4 py-3 text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-gray-300 mb-2">Nom *</label>
                    <input
                      type="text"
                      value={retailerInfo.lastName}
                      onChange={(e) => handleUpdateRetailerInfo('lastName', e.target.value)}
                      className="w-full bg-black/40 border border-gray-600 rounded-xl px-4 py-3 text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-gray-300 mb-2">Email *</label>
                    <input
                      type="email"
                      value={retailerInfo.email}
                      onChange={(e) => handleUpdateRetailerInfo('email', e.target.value)}
                      className="w-full bg-black/40 border border-gray-600 rounded-xl px-4 py-3 text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-gray-300 mb-2">Téléphone *</label>
                    <div className="flex gap-2">
                      <select
                        value={retailerInfo.phoneCountryCode}
                        onChange={(e) => handleUpdateRetailerInfo('phoneCountryCode', e.target.value)}
                        className="w-24 bg-black/40 border border-gray-600 rounded-xl px-2 py-3 text-white text-sm"
                      >
                        <option value="+33">🇫🇷 +33</option>
                        <option value="+32">🇧🇪 +32</option>
                        <option value="+41">🇨🇭 +41</option>
                        <option value="+352">🇱🇺 +352</option>
                        <option value="+1">🇨🇦 +1</option>
                        <option value="+212">🇲🇦 +212</option>
                        <option value="+216">🇹🇳 +216</option>
                        <option value="+221">🇸🇳 +221</option>
                        <option value="+225">🇨🇮 +225</option>
                      </select>
                      <input
                        type="tel"
                        value={retailerInfo.phone}
                        onChange={(e) => handleUpdateRetailerInfo('phone', e.target.value)}
                        className="flex-1 bg-black/40 border border-gray-600 rounded-xl px-4 py-3 text-white"
                        placeholder="1 23 45 67 89"
                      />
                    </div>
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-sm text-gray-300 mb-2">Fonction *</label>
                    <input
                      type="text"
                      value={retailerInfo.position}
                      onChange={(e) => handleUpdateRetailerInfo('position', e.target.value)}
                      className="w-full bg-black/40 border border-gray-600 rounded-xl px-4 py-3 text-white"
                      placeholder="Directeur, Gérant, Responsable..."
                    />
                  </div>
                </div>
              </div>

              {/* Adresse complète */}
              <div className="bg-black/20 rounded-xl p-6">
                <h4 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                  <MapPin className="w-5 h-5 text-purple-400" />
                  Adresse Complète
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="md:col-span-2">
                    <label className="block text-sm text-gray-300 mb-2">Adresse *</label>
                    <input
                      type="text"
                      value={retailerInfo.address}
                      onChange={(e) => handleUpdateRetailerInfo('address', e.target.value)}
                      className="w-full bg-black/40 border border-gray-600 rounded-xl px-4 py-3 text-white"
                      placeholder="123 Avenue des Champs-Élysées"
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-gray-300 mb-2">Code postal *</label>
                    <input
                      type="text"
                      value={retailerInfo.postalCode}
                      onChange={(e) => handleUpdateRetailerInfo('postalCode', e.target.value)}
                      className="w-full bg-black/40 border border-gray-600 rounded-xl px-4 py-3 text-white"
                      placeholder="75008"
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-gray-300 mb-2">Ville *</label>
                    <input
                      type="text"
                      value={retailerInfo.city}
                      onChange={(e) => handleUpdateRetailerInfo('city', e.target.value)}
                      className="w-full bg-black/40 border border-gray-600 rounded-xl px-4 py-3 text-white"
                      placeholder="Paris"
                    />
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="flex justify-between">
                <button
                  onClick={() => setShowSettings(false)}
                  className="bg-gray-600 hover:bg-gray-700 text-white px-6 py-3 rounded-xl transition-all"
                >
                  Annuler
                </button>
                <button
                  onClick={handleSaveSettings}
                  className="bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white px-6 py-3 rounded-xl font-semibold transition-all"
                >
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