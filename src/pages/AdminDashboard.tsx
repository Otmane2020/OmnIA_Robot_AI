import React, { useState, useEffect } from 'react';
import { 
  ShoppingCart, Target, Bot, BarChart3, Brain, Building, Settings,
  LogOut, Package, MessageSquare, Globe, Zap, TrendingUp, Users,
  Store, FileText, Database, Eye, Plus, Calendar, Clock, DollarSign,
  Activity, Wifi, Battery, ChevronRight, Home, ArrowLeft, Cog, X,
  User, Mail, Phone, MapPin
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

interface MenuItem {
  id: string;
  title: string;
  icon: any;
  color: string;
  subMenus: Array<{
    id: string;
    title: string;
    icon: any;
  }>;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({ onLogout }) => {
  const [activeMenu, setActiveMenu] = useState<string>('ecommerce');
  const [activeSubMenu, setActiveSubMenu] = useState<string>('products-catalog');
  const [showSettings, setShowSettings] = useState(false);
  const [retailerInfo, setRetailerInfo] = useState({
    companyName: 'Decora Home',
    email: 'demo@decorahome.fr',
    firstName: 'Alexandre',
    lastName: 'Martin',
    phone: '+33 1 23 45 67 89',
    address: '123 Avenue des Champs-Élysées',
    city: 'Paris',
    postalCode: '75008',
    country: 'France',
    siret: '12345678901234',
    position: 'Directeur',
    plan: 'Professional'
  });
  const { notifications, removeNotification, showSuccess, showInfo } = useNotifications();

  const menuItems: MenuItem[] = [
    {
      id: 'ecommerce',
      title: 'E-Commerce',
      icon: ShoppingCart,
      color: 'from-green-500 to-emerald-600',
      subMenus: [
        { id: 'products-catalog', title: 'Catalogue', icon: Package },
        { id: 'shopify-sync', title: 'Shopify', icon: Store },
        { id: 'stocks-variants', title: 'Stocks', icon: Database },
        { id: 'orders', title: 'Commandes', icon: ShoppingCart }
      ]
    },
    {
      id: 'marketing',
      title: 'Marketing',
      icon: Target,
      color: 'from-blue-500 to-cyan-600',
      subMenus: [
        { id: 'google-ads', title: 'Google Ads', icon: Target },
        { id: 'seo-blog', title: 'SEO Blog', icon: FileText },
        { id: 'merchant-feeds', title: 'Google Merchant', icon: Globe },
        { id: 'social-ads', title: 'Réseaux sociaux', icon: Users }
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
        { id: 'reports', title: 'Rapports', icon: FileText }
      ]
    },
    {
      id: 'ai-automation',
      title: 'IA & Auto',
      icon: Brain,
      color: 'from-cyan-500 to-blue-600',
      subMenus: [
        { id: 'ai-training', title: 'Entraînement IA', icon: Brain },
        { id: 'catalog-enrichment', title: 'Enrichissement', icon: Zap },
        { id: 'seo-generation', title: 'SEO Auto', icon: FileText },
        { id: 'automation', title: 'Automatisation', icon: Settings }
      ]
    },
    {
      id: 'showroom',
      title: 'Showroom',
      icon: Building,
      color: 'from-pink-500 to-purple-600',
      subMenus: [
        { id: 'robot-physical', title: 'Robot Physique', icon: Bot },
        { id: 'visitor-detection', title: 'Détection', icon: Eye },
        { id: 'product-demo', title: 'Démo Produits', icon: Package },
        { id: 'stock-sync', title: 'Sync Stocks', icon: Database }
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
        { id: 'security', title: 'Sécurité', icon: Settings },
        { id: 'backups', title: 'Sauvegardes', icon: Database }
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

  const renderMainContent = () => {
    switch (activeSubMenu) {
      // E-Commerce
      case 'products-catalog':
        return <CatalogManagement />;
      case 'shopify-sync':
        return <EcommerceIntegration onConnected={() => {}} />;
      case 'stocks-variants':
        return <ProductsEnrichedTable />;
      case 'orders':
        return <div className="text-center py-20"><ShoppingCart className="w-16 h-16 text-gray-400 mx-auto mb-4" /><h3 className="text-xl font-bold text-white">Commandes</h3><p className="text-gray-400">Gestion des commandes en développement</p></div>;
      
      // Marketing
      case 'google-ads':
        return <GoogleAdsTab />;
      case 'seo-blog':
        return <SEOBlogTab />;
      case 'merchant-feeds':
        return <GoogleMerchantTab />;
      case 'social-ads':
        return <div className="text-center py-20"><Users className="w-16 h-16 text-gray-400 mx-auto mb-4" /><h3 className="text-xl font-bold text-white">Réseaux Sociaux</h3><p className="text-gray-400">Meta Ads, TikTok en développement</p></div>;
      
      // OmnIA Bot
      case 'robot-config':
        return <OmniaRobotTab />;
      case 'conversations':
        return <ConversationHistory />;
      case 'live-chat':
        return <div className="text-center py-20"><MessageSquare className="w-16 h-16 text-gray-400 mx-auto mb-4" /><h3 className="text-xl font-bold text-white">Chat Live</h3><p className="text-gray-400">Interface chat temps réel en développement</p></div>;
      case 'satisfaction':
        return <div className="text-center py-20"><TrendingUp className="w-16 h-16 text-gray-400 mx-auto mb-4" /><h3 className="text-xl font-bold text-white">Satisfaction Client</h3><p className="text-gray-400">Suivi satisfaction en développement</p></div>;
      
      // Analytics
      case 'sales-analytics':
        return <div className="text-center py-20"><TrendingUp className="w-16 h-16 text-gray-400 mx-auto mb-4" /><h3 className="text-xl font-bold text-white">Analytics Ventes</h3><p className="text-gray-400">CA, marge, panier moyen en développement</p></div>;
      case 'ads-performance':
        return <GoogleAdsTab />;
      case 'visitor-tracking':
        return <div className="text-center py-20"><Eye className="w-16 h-16 text-gray-400 mx-auto mb-4" /><h3 className="text-xl font-bold text-white">Suivi Visiteurs</h3><p className="text-gray-400">Heatmaps en développement</p></div>;
      case 'reports':
        return <div className="text-center py-20"><FileText className="w-16 h-16 text-gray-400 mx-auto mb-4" /><h3 className="text-xl font-bold text-white">Rapports</h3><p className="text-gray-400">Rapports détaillés en développement</p></div>;
      
      // IA & Automation
      case 'ai-training':
        return <AITrainingInterface />;
      case 'catalog-enrichment':
        return <MLTrainingDashboard />;
      case 'seo-generation':
        return <SEOBlogTab />;
      case 'automation':
        return <div className="text-center py-20"><Settings className="w-16 h-16 text-gray-400 mx-auto mb-4" /><h3 className="text-xl font-bold text-white">Automatisation</h3><p className="text-gray-400">Tâches automatiques en développement</p></div>;
      
      // Showroom
      case 'robot-physical':
        return <OmniaRobotTab />;
      case 'visitor-detection':
        return <div className="text-center py-20"><Eye className="w-16 h-16 text-gray-400 mx-auto mb-4" /><h3 className="text-xl font-bold text-white">Détection Visiteurs</h3><p className="text-gray-400">Caméra + IA en développement</p></div>;
      case 'product-demo':
        return <div className="text-center py-20"><Package className="w-16 h-16 text-gray-400 mx-auto mb-4" /><h3 className="text-xl font-bold text-white">Démo Produits</h3><p className="text-gray-400">Présentation interactive en développement</p></div>;
      case 'stock-sync':
        return <EcommerceIntegration onConnected={() => {}} />;
      
      // Admin
      case 'user-management':
        return <div className="text-center py-20"><Users className="w-16 h-16 text-gray-400 mx-auto mb-4" /><h3 className="text-xl font-bold text-white">Gestion Utilisateurs</h3><p className="text-gray-400">Vendeurs, admin en développement</p></div>;
      case 'api-connections':
        return <EcommerceIntegration onConnected={() => {}} />;
      case 'security':
        return <div className="text-center py-20"><Settings className="w-16 h-16 text-gray-400 mx-auto mb-4" /><h3 className="text-xl font-bold text-white">Sécurité</h3><p className="text-gray-400">Permissions en développement</p></div>;
      case 'backups':
        return <div className="text-center py-20"><Database className="w-16 h-16 text-gray-400 mx-auto mb-4" /><h3 className="text-xl font-bold text-white">Sauvegardes</h3><p className="text-gray-400">Maintenance en développement</p></div>;
      
      default:
        return <CatalogManagement />;
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
              <Logo size="sm" />
              <div>
                <h1 className="text-xl font-bold text-white">OmnIA Admin</h1>
                <p className="text-cyan-300 text-sm">{retailerInfo.companyName}</p>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <button
                onClick={() => window.open('/robot', '_blank')}
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

      <div className="relative z-10 flex h-screen pt-16">
        {/* Sidebar gauche avec tous les menus */}
        <div className="w-80 bg-black/20 backdrop-blur-2xl border-r border-white/10 flex flex-col overflow-y-auto">
          <div className="p-4 space-y-2">
            {menuItems.map((menu) => {
              const Icon = menu.icon;
              const isActive = activeMenu === menu.id;
              
              return (
                <div key={menu.id} className="space-y-1">
                  {/* Menu principal */}
                  <button
                    onClick={() => {
                      setActiveMenu(menu.id);
                      setActiveSubMenu(menu.subMenus[0].id);
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
                  
                  {/* Sous-menus visibles si actif */}
                  {isActive && (
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

      {/* Modal paramètres avec toutes les infos d'inscription */}
      {showSettings && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-800/95 backdrop-blur-xl rounded-2xl p-8 max-w-2xl w-full max-h-[90vh] overflow-y-auto border border-slate-600/50">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-2xl font-bold text-white">Paramètres du Revendeur</h3>
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
                    <label className="block text-sm text-gray-300 mb-2">Nom de l'entreprise</label>
                    <input
                      type="text"
                      value={retailerInfo.companyName}
                      onChange={(e) => handleUpdateRetailerInfo('companyName', e.target.value)}
                      className="w-full bg-black/40 border border-gray-600 rounded-xl px-4 py-3 text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-gray-300 mb-2">SIRET</label>
                    <input
                      type="text"
                      value={retailerInfo.siret}
                      onChange={(e) => handleUpdateRetailerInfo('siret', e.target.value)}
                      className="w-full bg-black/40 border border-gray-600 rounded-xl px-4 py-3 text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-gray-300 mb-2">Plan</label>
                    <select
                      value={retailerInfo.plan}
                      onChange={(e) => handleUpdateRetailerInfo('plan', e.target.value)}
                      className="w-full bg-black/40 border border-gray-600 rounded-xl px-4 py-3 text-white"
                    >
                      <option value="starter">Starter</option>
                      <option value="professional">Professional</option>
                      <option value="enterprise">Enterprise</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm text-gray-300 mb-2">Pays</label>
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
                    <label className="block text-sm text-gray-300 mb-2">Prénom</label>
                    <input
                      type="text"
                      value={retailerInfo.firstName}
                      onChange={(e) => handleUpdateRetailerInfo('firstName', e.target.value)}
                      className="w-full bg-black/40 border border-gray-600 rounded-xl px-4 py-3 text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-gray-300 mb-2">Nom</label>
                    <input
                      type="text"
                      value={retailerInfo.lastName}
                      onChange={(e) => handleUpdateRetailerInfo('lastName', e.target.value)}
                      className="w-full bg-black/40 border border-gray-600 rounded-xl px-4 py-3 text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-gray-300 mb-2">Email</label>
                    <input
                      type="email"
                      value={retailerInfo.email}
                      onChange={(e) => handleUpdateRetailerInfo('email', e.target.value)}
                      className="w-full bg-black/40 border border-gray-600 rounded-xl px-4 py-3 text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-gray-300 mb-2">Téléphone</label>
                    <input
                      type="tel"
                      value={retailerInfo.phone}
                      onChange={(e) => handleUpdateRetailerInfo('phone', e.target.value)}
                      className="w-full bg-black/40 border border-gray-600 rounded-xl px-4 py-3 text-white"
                    />
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-sm text-gray-300 mb-2">Fonction</label>
                    <input
                      type="text"
                      value={retailerInfo.position}
                      onChange={(e) => handleUpdateRetailerInfo('position', e.target.value)}
                      className="w-full bg-black/40 border border-gray-600 rounded-xl px-4 py-3 text-white"
                    />
                  </div>
                </div>
              </div>

              {/* Adresse */}
              <div className="bg-black/20 rounded-xl p-6">
                <h4 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                  <MapPin className="w-5 h-5 text-purple-400" />
                  Adresse
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="md:col-span-2">
                    <label className="block text-sm text-gray-300 mb-2">Adresse complète</label>
                    <input
                      type="text"
                      value={retailerInfo.address}
                      onChange={(e) => handleUpdateRetailerInfo('address', e.target.value)}
                      className="w-full bg-black/40 border border-gray-600 rounded-xl px-4 py-3 text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-gray-300 mb-2">Code postal</label>
                    <input
                      type="text"
                      value={retailerInfo.postalCode}
                      onChange={(e) => handleUpdateRetailerInfo('postalCode', e.target.value)}
                      className="w-full bg-black/40 border border-gray-600 rounded-xl px-4 py-3 text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-gray-300 mb-2">Ville</label>
                    <input
                      type="text"
                      value={retailerInfo.city}
                      onChange={(e) => handleUpdateRetailerInfo('city', e.target.value)}
                      className="w-full bg-black/40 border border-gray-600 rounded-xl px-4 py-3 text-white"
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