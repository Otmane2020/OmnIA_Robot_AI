import React, { useState, useEffect } from 'react';
import { Store, Users, TrendingUp, MessageSquare, Database, Bot, Settings, LogOut } from 'lucide-react';
import { CreditCard } from 'lucide-react';
import { CatalogManagement } from './CatalogManagement';
import { ProductsEnrichedTable } from './ProductsEnrichedTable';
import { ConversationHistory } from './ConversationHistory';
import { VendorSubdomainManager } from './VendorSubdomainManager';
import { OmniaRobotTab } from './OmniaRobotTab';
import { SellerSubscriptionManager } from './SellerSubscriptionManager';
import { useNotifications } from './NotificationSystem';

interface VendorDashboardProps {
  vendor: {
    id: string;
    email: string;
    company_name: string;
    subdomain: string;
    plan: string;
    status: string;
    contact_name: string;
  };
  onLogout: () => void;
}

interface VendorStats {
  conversations: number;
  conversions: number;
  products: number;
  revenue: number;
}

export const VendorDashboard: React.FC<VendorDashboardProps> = ({ vendor, onLogout }) => {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [stats, setStats] = useState<VendorStats>({
    conversations: 0,
    conversions: 0,
    products: 0,
    revenue: 0
  });
  const { showSuccess, showInfo } = useNotifications();

  const tabs = [
    { id: 'dashboard', label: 'Tableau de bord', icon: TrendingUp },
    { id: 'catalogue', label: 'Catalogue', icon: Database },
    { id: 'enriched', label: 'Catalogue Enrichi', icon: Bot },
    { id: 'conversations', label: 'Conversations', icon: MessageSquare },
    { id: 'subdomains', label: 'Sous-domaines', icon: Store },
    { id: 'robot', label: 'Robot OmnIA', icon: Bot },
    { id: 'subscription', label: 'Abonnement', icon: CreditCard },
    { id: 'settings', label: 'Paramètres', icon: Settings }
  ];

  useEffect(() => {
    loadVendorStats();
  }, [vendor.id]);

  const loadVendorStats = async () => {
    try {
      // Charger les stats spécifiques au vendeur
      const vendorProducts = getVendorProducts(vendor.id);
      
      setStats({
        conversations: Math.floor(Math.random() * 500) + 100,
        conversions: Math.floor(Math.random() * 30) + 20,
        products: vendorProducts.length,
        revenue: Math.floor(Math.random() * 2000) + 500
      });
      
    } catch (error) {
      console.error('❌ Erreur chargement stats vendeur:', error);
    }
  };

  const getVendorProducts = (vendorId: string) => {
    try {
      const savedProducts = localStorage.getItem(`vendor_${vendorId}_products`);
      return savedProducts ? JSON.parse(savedProducts) : [];
    } catch {
      return [];
    }
  };

  const renderDashboard = () => (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">Dashboard {vendor.company_name}</h1>
          <p className="text-gray-300">Interface admin personnalisée</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-xl flex items-center justify-center">
            <Store className="w-6 h-6 text-white" />
          </div>
          <div>
            <div className="text-white font-bold">{vendor.company_name}</div>
            <div className="text-gray-400 text-sm">Plan {vendor.plan}</div>
            <div className="text-cyan-400 text-xs">{vendor.subdomain}.omnia.sale</div>
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
              <p className="text-green-400 text-sm">+15% ce mois</p>
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
              <p className="text-green-400 text-sm">Catalogue actif</p>
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
            <Users className="w-10 h-10 text-orange-400" />
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-white/10 backdrop-blur-xl rounded-2xl p-8 border border-white/20">
        <h2 className="text-2xl font-bold text-white mb-6">Actions Rapides</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <button
            onClick={() => setActiveTab('catalogue')}
            className="bg-cyan-500/20 hover:bg-cyan-500/30 border border-cyan-400/50 rounded-xl p-6 text-left transition-all"
          >
            <Database className="w-8 h-8 text-cyan-400 mb-3" />
            <h3 className="text-lg font-semibold text-white mb-2">Gérer le Catalogue</h3>
            <p className="text-gray-300 text-sm">{stats.products} produits actifs</p>
          </button>
          
          <button
            onClick={() => setActiveTab('robot')}
            className="bg-purple-500/20 hover:bg-purple-500/30 border border-purple-400/50 rounded-xl p-6 text-left transition-all"
          >
            <Bot className="w-8 h-8 text-purple-400 mb-3" />
            <h3 className="text-lg font-semibold text-white mb-2">Configurer OmnIA</h3>
            <p className="text-gray-300 text-sm">Personnaliser votre robot</p>
          </button>
          
          <button
            onClick={() => window.open(`https://${vendor.subdomain}.omnia.sale/chat`, '_blank')}
            className="bg-green-500/20 hover:bg-green-500/30 border border-green-400/50 rounded-xl p-6 text-left transition-all"
          >
            <MessageSquare className="w-8 h-8 text-green-400 mb-3" />
            <h3 className="text-lg font-semibold text-white mb-2">Tester OmnIA</h3>
            <p className="text-gray-300 text-sm">Voir en action</p>
          </button>
        </div>
      </div>
    </div>
  );

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard': return renderDashboard();
      case 'catalogue': return <CatalogManagement vendorId={vendor.id} />;
      case 'enriched': return <ProductsEnrichedTable vendorId={vendor.id} />;
      case 'conversations': return <ConversationHistory vendorId={vendor.id} />;
      case 'subdomains': return <VendorSubdomainManager vendorId={vendor.id} companyName={vendor.company_name} />;
      case 'robot': return <OmniaRobotTab vendorId={vendor.id} />;
      case 'subscription': return <SellerSubscriptionManager seller={vendor} onUpdate={loadVendorStats} />;
      case 'settings': return renderSettings();
      default: return renderDashboard();
    }
  };

  const renderSettings = () => (
    <div className="space-y-8">
      <h2 className="text-2xl font-bold text-white">Paramètres Vendeur</h2>
      
      <div className="bg-white/10 backdrop-blur-xl rounded-2xl p-8 border border-white/20">
        <h3 className="text-xl font-bold text-white mb-6">Informations du compte</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm text-cyan-300 mb-2">Nom de l'entreprise</label>
            <input
              type="text"
              defaultValue={vendor.company_name}
              className="w-full bg-black/40 border border-cyan-500/50 rounded-xl px-4 py-3 text-white"
              readOnly
            />
          </div>
          <div>
            <label className="block text-sm text-cyan-300 mb-2">Email</label>
            <input
              type="email"
              defaultValue={vendor.email}
              className="w-full bg-black/40 border border-cyan-500/50 rounded-xl px-4 py-3 text-white"
              readOnly
            />
          </div>
          <div>
            <label className="block text-sm text-cyan-300 mb-2">Sous-domaine principal</label>
            <input
              type="text"
              defaultValue={`${vendor.subdomain}.omnia.sale`}
              className="w-full bg-black/40 border border-cyan-500/50 rounded-xl px-4 py-3 text-white"
              readOnly
            />
          </div>
          <div>
            <label className="block text-sm text-cyan-300 mb-2">Plan</label>
            <input
              type="text"
              defaultValue={vendor.plan.charAt(0).toUpperCase() + vendor.plan.slice(1)}
              className="w-full bg-black/40 border border-cyan-500/50 rounded-xl px-4 py-3 text-white"
              readOnly
            />
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-purple-900">
      <div className="relative z-10 flex h-screen">
        {/* Sidebar */}
        <div className="w-80 bg-slate-800/90 backdrop-blur-2xl border-r border-slate-700/50 p-6">
          <div className="flex items-center gap-3 mb-8">
            <div className="w-12 h-12 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-xl flex items-center justify-center">
              <Store className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-white">{vendor.company_name}</h1>
              <p className="text-sm text-cyan-300">{vendor.subdomain}.omnia.sale</p>
            </div>
          </div>

          <nav className="space-y-2 mb-8">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all text-left ${
                    activeTab === tab.id
                      ? 'bg-cyan-500/30 text-white border border-cyan-500/50'
                      : 'text-gray-300 hover:bg-slate-700/50 hover:text-white'
                  }`}
                >
                  <Icon className="w-5 h-5" />
                  <span className="font-medium">{tab.label}</span>
                </button>
              );
            })}
          </nav>

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
          {renderContent()}
        </div>
      </div>
    </div>
  );
};