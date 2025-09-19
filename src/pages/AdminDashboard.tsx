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
  BookOpen, PenTool, Lightbulb, Wand2, Glasses, Gamepad2
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
      subMenus: [
        { id: 'overview', title: 'Vue d\'ensemble', icon: BarChart3 },
        { id: 'analytics', title: 'Analytics', icon: TrendingUp },
        { id: 'reports', title: 'Rapports', icon: FileText }
      ]
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
        { id: 'google-merchant', title: 'Google Merchant', icon: Globe },
        { id: 'ar-vr-studio', title: 'Vision Augmentée', icon: Glasses }
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

  const renderDashboard = () => (
    <div className="space-y-8">
      {/* Solutions Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-7 gap-6">
        {[
          { title: 'E-Commerce', icon: ShoppingCart, color: 'from-green-500 to-emerald-600', subtitle: '247 Produits' },
          { title: 'Marketing', icon: Target, color: 'from-blue-500 to-cyan-600', subtitle: '4.2x ROAS' },
          { title: 'OmnIA Bot', icon: Bot, color: 'from-purple-500 to-pink-600', subtitle: '1,234 Chats' },
          { title: 'Analytics', icon: BarChart3, color: 'from-orange-500 to-red-600', subtitle: '42% Conv.' },
          { title: 'IA Auto', icon: Brain, color: 'from-cyan-500 to-blue-600', subtitle: '95% Score' },
          { title: 'Showroom', icon: Building, color: 'from-pink-500 to-purple-600', subtitle: '89 Visiteurs' },
          { title: 'Admin', icon: Settings, color: 'from-gray-500 to-slate-600', subtitle: '100% Uptime' }
        ].map((solution, index) => {
          const Icon = solution.icon;
          return (
            <div
              key={index}
              onClick={() => {
                const menuMap: { [key: string]: string } = {
                  'E-Commerce': 'ecommerce',
                  'Marketing': 'marketing',
                  'OmnIA Bot': 'omnia-bot',
                  'Analytics': 'analytics',
                  'IA Auto': 'ai-automation',
                  'Showroom': 'showroom',
                  'Admin': 'admin'
                };
                setActiveMenu(menuMap[solution.title] || 'dashboard');
              }}
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

      {/* Stats synthèse */}
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

  const renderEnrichedCatalog = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-white">Catalogue Enrichi avec IA</h2>
        <button className="bg-gradient-to-r from-purple-500 to-pink-600 hover:from-purple-400 hover:to-pink-500 text-white px-6 py-3 rounded-xl font-semibold transition-all flex items-center gap-2">
          <Brain className="w-5 h-5" />
          Enrichir avec DeepSeek
        </button>
      </div>
      
      <div className="bg-white/10 backdrop-blur-xl rounded-2xl border border-white/20 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-black/20">
              <tr>
                <th className="text-left p-3 text-cyan-300 font-semibold">ID</th>
                <th className="text-left p-3 text-cyan-300 font-semibold">Nom du produit</th>
                <th className="text-left p-3 text-cyan-300 font-semibold">Description</th>
                <th className="text-left p-3 text-cyan-300 font-semibold">Catégorie</th>
                <th className="text-left p-3 text-cyan-300 font-semibold">Sous-catégorie</th>
                <th className="text-left p-3 text-cyan-300 font-semibold">Tags</th>
                <th className="text-left p-3 text-cyan-300 font-semibold">Image</th>
                <th className="text-left p-3 text-cyan-300 font-semibold">Prix</th>
                <th className="text-left p-3 text-cyan-300 font-semibold">Stock</th>
                <th className="text-left p-3 text-cyan-300 font-semibold">Marque</th>
                <th className="text-left p-3 text-cyan-300 font-semibold">Matière</th>
                <th className="text-left p-3 text-cyan-300 font-semibold">Couleur</th>
                <th className="text-left p-3 text-cyan-300 font-semibold">Style</th>
                <th className="text-left p-3 text-cyan-300 font-semibold">SEO</th>
                <th className="text-left p-3 text-cyan-300 font-semibold">GTIN</th>
              </tr>
            </thead>
            <tbody>
              <tr className="border-b border-white/10">
                <td className="p-3 text-white font-mono">decora-alyana-beige</td>
                <td className="p-3 text-white">Canapé d'angle convertible ALYANA</td>
                <td className="p-3 text-gray-300">Canapé moderne en velours côtelé...</td>
                <td className="p-3 text-white">Mobilier</td>
                <td className="p-3 text-white">Canapés d'angle</td>
                <td className="p-3">
                  <div className="flex gap-1">
                    <span className="bg-blue-500/20 text-blue-300 px-2 py-1 rounded text-xs">convertible</span>
                    <span className="bg-green-500/20 text-green-300 px-2 py-1 rounded text-xs">velours</span>
                  </div>
                </td>
                <td className="p-3">
                  <img src="https://cdn.shopify.com/s/files/1/0903/7578/2665/files/7_23a97631-68d2-4f3e-8f78-b26c7cd4c2ae.png" className="w-12 h-12 rounded object-cover" />
                </td>
                <td className="p-3">
                  <div className="text-green-400 font-bold">799€</div>
                  <div className="text-gray-400 line-through text-xs">1399€</div>
                </td>
                <td className="p-3 text-green-400 font-bold">100</td>
                <td className="p-3 text-white">Decora Home</td>
                <td className="p-3 text-white">Velours côtelé</td>
                <td className="p-3 text-white">Beige</td>
                <td className="p-3 text-white">Moderne</td>
                <td className="p-3 text-cyan-400">Optimisé</td>
                <td className="p-3 text-white font-mono">3701234567890</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );

  const renderARVRStudio = () => (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-bold text-white mb-2">Vision Augmentée & Studio</h2>
        <p className="text-gray-300">Réalité augmentée et expériences immersives</p>
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
              <p className="text-gray-300">Réalité augmentée sur mobile</p>
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
              </ul>
            </div>
            
            <button className="w-full bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-400 hover:to-purple-500 text-white py-3 rounded-xl font-semibold transition-all">
              Configurer AR Mobile
            </button>
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
              <p className="text-gray-300">Visite immersive virtuelle</p>
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
              </ul>
            </div>
            
            <button className="w-full bg-gradient-to-r from-purple-500 to-blue-600 hover:from-purple-400 hover:to-blue-500 text-white py-3 rounded-xl font-semibold transition-all">
              Créer VR Showroom
            </button>
          </div>
        </div>

        {/* Photo Analysis */}
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
              </ul>
            </div>
            
            <button className="w-full bg-gradient-to-r from-cyan-500 to-green-600 hover:from-cyan-400 hover:to-green-500 text-white py-3 rounded-xl font-semibold transition-all">
              Activer Analyse Photo
            </button>
          </div>
        </div>

        {/* Ambiance Generator */}
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
              <h4 className="font-semibold text-orange-200 mb-2">✨ Ambiances :</h4>
              <ul className="text-orange-300 text-sm space-y-1">
                <li>• Salon minimaliste</li>
                <li>• Chambre cosy</li>
                <li>• Bureau design haut de gamme</li>
                <li>• Cuisine contemporaine</li>
              </ul>
            </div>
            
            <button className="w-full bg-gradient-to-r from-orange-500 to-pink-600 hover:from-orange-400 hover:to-pink-500 text-white py-3 rounded-xl font-semibold transition-all">
              Générer Ambiances
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  const renderMainContent = () => {
    if (activeMenu === 'dashboard') {
      return renderDashboard();
    }

    switch (activeSubMenu) {
      // Dashboard
      case 'overview':
        return renderDashboard();
      
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
        return <EcommerceIntegration onConnected={() => {}} />;
      case 'stock':
        return <div className="text-center py-20"><Database className="w-16 h-16 text-gray-400 mx-auto mb-4" /><h3 className="text-xl font-bold text-white">Gestion Stock</h3><p className="text-gray-400">Table spéciale stock en développement</p></div>;
      case 'orders':
        return <div className="text-center py-20"><ShoppingCart className="w-16 h-16 text-gray-400 mx-auto mb-4" /><h3 className="text-xl font-bold text-white">Commandes</h3><p className="text-gray-400">Création manuelle et gestion commandes</p></div>;
      
      // Marketing
      case 'google-ads':
        return <GoogleAdsTab />;
      case 'ads-integration':
        return <div className="text-center py-20"><Link className="w-16 h-16 text-gray-400 mx-auto mb-4" /><h3 className="text-xl font-bold text-white">Intégration Google Ads</h3><p className="text-gray-400">Connexion compte Google Ads</p></div>;
      case 'google-merchant':
        return <GoogleMerchantTab />;
      case 'ar-vr-studio':
        return renderARVRStudio();
      
      // SEO
      case 'blog-articles':
        return <SEOBlogTab />;
      case 'auto-blogging':
        return <div className="text-center py-20"><PenTool className="w-16 h-16 text-gray-400 mx-auto mb-4" /><h3 className="text-xl font-bold text-white">Auto Blogging</h3><p className="text-gray-400">Planification création articles</p></div>;
      case 'backlinks':
        return <div className="text-center py-20"><Link className="w-16 h-16 text-gray-400 mx-auto mb-4" /><h3 className="text-xl font-bold text-white">Backlinks</h3><p className="text-gray-400">Suivi liens créés</p></div>;
      case 'seo-integration':
        return <div className="text-center py-20"><Share2 className="w-16 h-16 text-gray-400 mx-auto mb-4" /><h3 className="text-xl font-bold text-white">Intégration SEO</h3><p className="text-gray-400">WordPress, Shopify, PrestaShop</p></div>;
      case 'seo-optimization':
        return <div className="text-center py-20"><Lightbulb className="w-16 h-16 text-gray-400 mx-auto mb-4" /><h3 className="text-xl font-bold text-white">Optimisation SEO</h3><p className="text-gray-400">Alt, Title, Description avec DeepSeek</p></div>;
      
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
        return <div className="text-center py-20"><TrendingUp className="w-16 h-16 text-gray-400 mx-auto mb-4" /><h3 className="text-xl font-bold text-white">Analytics Ventes</h3><p className="text-gray-400">CA, marge, panier moyen</p></div>;
      case 'ads-performance':
        return <GoogleAdsTab />;
      case 'visitor-tracking':
        return <div className="text-center py-20"><Eye className="w-16 h-16 text-gray-400 mx-auto mb-4" /><h3 className="text-xl font-bold text-white">Suivi Visiteurs</h3><p className="text-gray-400">Heatmaps et comportement</p></div>;
      case 'detailed-reports':
        return <div className="text-center py-20"><FileText className="w-16 h-16 text-gray-400 mx-auto mb-4" /><h3 className="text-xl font-bold text-white">Rapports Détaillés</h3><p className="text-gray-400">Exports et analyses</p></div>;
      
      // Admin
      case 'user-management':
        return <div className="text-center py-20"><Users className="w-16 h-16 text-gray-400 mx-auto mb-4" /><h3 className="text-xl font-bold text-white">Gestion Utilisateurs</h3><p className="text-gray-400">Vendeurs et permissions</p></div>;
      case 'api-connections':
        return <EcommerceIntegration onConnected={() => {}} />;
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