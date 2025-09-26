import React, { useState, useEffect } from 'react';
import {
  Bot, Store, BarChart3, MessageSquare, Settings, Package,
  TrendingUp, Users, ShoppingCart, Globe, LogOut, Eye,
  RefreshCw, Download, Upload, Zap, Brain, Star
} from 'lucide-react';
import { Logo } from './Logo';
import { useNotifications } from './NotificationSystem';

interface SellerDashboardProps {
  seller: {
    id: string;
    email: string;
    company_name: string;
    subdomain: string;
    plan: string;
    status: string;
    contact_name: string;
  };
  onLogout: () => void;
  onUpdate?: () => void;
}

export const SellerDashboard: React.FC<SellerDashboardProps> = ({ seller, onLogout, onUpdate }) => {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [stats, setStats] = useState({
    conversations: 0,
    products: 0,
    conversions: 0,
    revenue: 0
  });
  const { showSuccess, showError, showInfo } = useNotifications();

  useEffect(() => {
    loadSellerStats();
  }, [seller.id]);

  const loadSellerStats = () => {
    // Load seller-specific stats from localStorage or API
    try {
      const sellerProducts = localStorage.getItem(`seller_${seller.id}_products`);
      const productCount = sellerProducts ? JSON.parse(sellerProducts).length : 0;
      
      setStats({
        conversations: Math.floor(Math.random() * 1000) + 100,
        products: productCount,
        conversions: Math.floor(Math.random() * 50) + 10,
        revenue: Math.floor(Math.random() * 5000) + 1000
      });
    } catch (error) {
      console.error('Error loading seller stats:', error);
    }
  };

  const tabs = [
    { id: 'dashboard', label: 'Tableau de bord', icon: BarChart3 },
    { id: 'products', label: 'Produits', icon: Package },
    { id: 'conversations', label: 'Conversations', icon: MessageSquare },
    { id: 'analytics', label: 'Analytics', icon: TrendingUp },
    { id: 'settings', label: 'Paramètres', icon: Settings }
  ];

  const renderDashboard = () => (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">Tableau de bord</h1>
          <p className="text-gray-300">Bienvenue, {seller.contact_name}</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="text-right">
            <div className="text-white font-bold">{seller.company_name}</div>
            <div className="text-gray-400 text-sm">Plan {seller.plan}</div>
          </div>
          <div className="w-12 h-12 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-xl flex items-center justify-center">
            <Store className="w-6 h-6 text-white" />
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-blue-600/20 backdrop-blur-xl rounded-2xl p-6 border border-blue-500/30">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-blue-200 text-sm mb-1">Conversations</p>
              <p className="text-3xl font-bold text-white">{stats.conversations}</p>
            </div>
            <MessageSquare className="w-10 h-10 text-blue-400" />
          </div>
        </div>
        
        <div className="bg-green-600/20 backdrop-blur-xl rounded-2xl p-6 border border-green-500/30">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-green-200 text-sm mb-1">Produits</p>
              <p className="text-3xl font-bold text-white">{stats.products}</p>
            </div>
            <Package className="w-10 h-10 text-green-400" />
          </div>
        </div>
        
        <div className="bg-purple-600/20 backdrop-blur-xl rounded-2xl p-6 border border-purple-500/30">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-purple-200 text-sm mb-1">Conversions</p>
              <p className="text-3xl font-bold text-white">{stats.conversions}%</p>
            </div>
            <TrendingUp className="w-10 h-10 text-purple-400" />
          </div>
        </div>
        
        <div className="bg-orange-600/20 backdrop-blur-xl rounded-2xl p-6 border border-orange-500/30">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-orange-200 text-sm mb-1">Revenus</p>
              <p className="text-3xl font-bold text-white">€{stats.revenue}</p>
            </div>
            <ShoppingCart className="w-10 h-10 text-orange-400" />
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-white/10 backdrop-blur-xl rounded-2xl p-8 border border-white/20">
        <h2 className="text-2xl font-bold text-white mb-6">Actions Rapides</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <button className="bg-cyan-500/20 hover:bg-cyan-500/30 border border-cyan-400/50 rounded-xl p-6 text-left transition-all">
            <Upload className="w-8 h-8 text-cyan-400 mb-3" />
            <h3 className="text-lg font-semibold text-white mb-2">Importer Produits</h3>
            <p className="text-gray-300 text-sm">CSV, XML ou API</p>
          </button>
          
          <button className="bg-purple-500/20 hover:bg-purple-500/30 border border-purple-400/50 rounded-xl p-6 text-left transition-all">
            <Bot className="w-8 h-8 text-purple-400 mb-3" />
            <h3 className="text-lg font-semibold text-white mb-2">Configurer Robot</h3>
            <p className="text-gray-300 text-sm">Personnaliser OmnIA</p>
          </button>
          
          <button
            onClick={() => window.open(`/robot/${seller.subdomain}`, '_blank')}
            className="bg-green-500/20 hover:bg-green-500/30 border border-green-400/50 rounded-xl p-6 text-left transition-all"
          >
            <Eye className="w-8 h-8 text-green-400 mb-3" />
            <h3 className="text-lg font-semibold text-white mb-2">Tester Robot</h3>
            <p className="text-gray-300 text-sm">{seller.subdomain}.omnia.sale</p>
          </button>
        </div>
      </div>
    </div>
  );

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard': return renderDashboard();
      case 'products': return <div className="text-white">Gestion des produits - En développement</div>;
      case 'conversations': return <div className="text-white">Historique des conversations - En développement</div>;
      case 'analytics': return <div className="text-white">Analytics détaillées - En développement</div>;
      case 'settings': return <div className="text-white">Paramètres du compte - En développement</div>;
      default: return renderDashboard();
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-purple-900">
      {/* Background Effects */}
      <div className="absolute inset-0 opacity-20">
        <div className="absolute top-20 left-20 w-72 h-72 bg-cyan-500/30 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-20 right-20 w-96 h-96 bg-purple-500/20 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '2s' }}></div>
      </div>

      <div className="relative z-10 flex h-screen">
        {/* Sidebar */}
        <div className="w-80 bg-slate-800/90 backdrop-blur-2xl border-r border-slate-700/50 p-6">
          <div className="flex items-center gap-3 mb-8">
            <Logo size="sm" />
          </div>

          {/* Seller Info */}
          <div className="bg-slate-700/50 rounded-xl p-4 mb-6">
            <div className="text-white font-bold">{seller.company_name}</div>
            <div className="text-gray-400 text-sm">{seller.subdomain}.omnia.sale</div>
            <div className="text-cyan-400 text-sm">Plan {seller.plan}</div>
          </div>

          {/* Navigation */}
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

          {/* Status */}
          <div className="bg-green-500/20 border border-green-400/50 rounded-xl p-4 mb-6">
            <div className="flex items-center gap-2 mb-2">
              <Bot className="w-5 h-5 text-green-400" />
              <span className="text-green-300 font-semibold">Robot OmnIA</span>
            </div>
            <p className="text-green-200 text-sm">Actif et opérationnel</p>
          </div>
          
          <button
            onClick={onLogout}
            className="w-full bg-red-600/20 hover:bg-red-600/30 text-red-300 px-4 py-3 rounded-xl font-medium border border-red-500/30 transition-all"
          >
            <LogOut className="w-4 h-4 inline mr-2" />
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