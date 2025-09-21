import React, { useState, useEffect } from 'react';
import { 
  BarChart3, Users, Package, MessageSquare, Settings, LogOut, 
  Store, Upload, FileText, Globe, CreditCard, Menu, X,
  Bell, Search, Filter, Download, Eye, Edit, Trash2, Plus,
  Calendar, TrendingUp, Zap, Bot, Wifi, Battery, Crown
} from 'lucide-react';
import { Logo } from '../components/Logo';
import { CatalogManagement } from '../components/CatalogManagement';
import { EcommerceIntegration } from '../components/EcommerceIntegration';
import { ConversationHistory } from '../components/ConversationHistory';
import { AITrainingInterface } from '../components/AITrainingInterface';
import { MLTrainingDashboard } from '../components/MLTrainingDashboard';
import { OmniaRobotTab } from '../components/OmniaRobotTab';
import { NotificationSystem, useNotifications } from '../components/NotificationSystem';

interface AdminDashboardProps {
  onLogout: () => void;
}

interface DashboardStats {
  conversations: number;
  products: number;
  revenue: number;
  conversion: number;
  todayVisitors: number;
  avgSessionTime: string;
  popularProducts: string[];
  recentActivity: Array<{
    type: string;
    message: string;
    timestamp: string;
  }>;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({ onLogout }) => {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const [connectedPlatforms, setConnectedPlatforms] = useState<any[]>([]);
  const { notifications, removeNotification, showSuccess, showInfo } = useNotifications();

  // Données de démonstration
  const demoStats: DashboardStats = {
    conversations: 1247,
    products: 156,
    revenue: 15420,
    conversion: 42,
    todayVisitors: 89,
    avgSessionTime: '3m 24s',
    popularProducts: ['Canapé ALYANA', 'Table AUREA', 'Chaise INAYA'],
    recentActivity: [
      { type: 'conversation', message: 'Nouvelle conversation client', timestamp: '10:30' },
      { type: 'sale', message: 'Vente canapé ALYANA (799€)', timestamp: '09:45' },
      { type: 'product', message: 'Nouveau produit ajouté', timestamp: '08:20' }
    ]
  };

  const tabs = [
    { id: 'dashboard', label: 'Dashboard', icon: BarChart3, shortLabel: 'Stats' },
    { id: 'catalog', label: 'Catalogue', icon: Package, shortLabel: 'Catalog' },
    { id: 'conversations', label: 'Conversations', icon: MessageSquare, shortLabel: 'Chat' },
    { id: 'robot', label: 'Robot IA', icon: Bot, shortLabel: 'Robot' },
    { id: 'ecommerce', label: 'E-commerce', icon: Store, shortLabel: 'Shop' },
    { id: 'training', label: 'Entraînement IA', icon: Zap, shortLabel: 'IA' },
    { id: 'ml-dashboard', label: 'ML Dashboard', icon: TrendingUp, shortLabel: 'ML' },
    { id: 'settings', label: 'Paramètres', icon: Settings, shortLabel: 'Config' }
  ];

  useEffect(() => {
    // Simuler le chargement des données
    setTimeout(() => {
      setStats(demoStats);
      setIsLoading(false);
    }, 1000);

    // Charger les plateformes connectées
    const savedPlatforms = localStorage.getItem('connected_platforms');
    if (savedPlatforms) {
      try {
        setConnectedPlatforms(JSON.parse(savedPlatforms));
      } catch (error) {
        console.error('Erreur chargement plateformes:', error);
      }
    }
  }, []);

  const handlePlatformConnected = (platformData: any) => {
    const updatedPlatforms = [...connectedPlatforms, platformData];
    setConnectedPlatforms(updatedPlatforms);
    localStorage.setItem('connected_platforms', JSON.stringify(updatedPlatforms));
    showSuccess('Plateforme connectée', `${platformData.name} connectée avec succès !`);
  };

  const renderStats = () => (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-6 mb-6 md:mb-8">
      <div className="bg-blue-600/20 backdrop-blur-xl rounded-xl md:rounded-2xl p-4 md:p-6 border border-blue-500/30">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-blue-200 text-xs md:text-sm mb-1">Conversations</p>
            <p className="text-2xl md:text-3xl font-bold text-white">{stats?.conversations.toLocaleString()}</p>
            <p className="text-blue-300 text-xs md:text-sm">+12% ce mois</p>
          </div>
          <MessageSquare className="w-6 h-6 md:w-8 md:h-8 text-blue-400" />
        </div>
      </div>
      
      <div className="bg-green-600/20 backdrop-blur-xl rounded-xl md:rounded-2xl p-4 md:p-6 border border-green-500/30">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-green-200 text-xs md:text-sm mb-1">Produits</p>
            <p className="text-2xl md:text-3xl font-bold text-white">{stats?.products}</p>
            <p className="text-green-300 text-xs md:text-sm">+5 cette semaine</p>
          </div>
          <Package className="w-6 h-6 md:w-8 md:h-8 text-green-400" />
        </div>
      </div>
      
      <div className="bg-purple-600/20 backdrop-blur-xl rounded-xl md:rounded-2xl p-4 md:p-6 border border-purple-500/30">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-purple-200 text-xs md:text-sm mb-1">Revenus</p>
            <p className="text-2xl md:text-3xl font-bold text-white">{stats?.revenue.toLocaleString()}€</p>
            <p className="text-purple-300 text-xs md:text-sm">+28% ce mois</p>
          </div>
          <TrendingUp className="w-6 h-6 md:w-8 md:h-8 text-purple-400" />
        </div>
      </div>
      
      <div className="bg-orange-600/20 backdrop-blur-xl rounded-xl md:rounded-2xl p-4 md:p-6 border border-orange-500/30">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-orange-200 text-xs md:text-sm mb-1">Conversions</p>
            <p className="text-2xl md:text-3xl font-bold text-white">{stats?.conversion}%</p>
            <p className="text-orange-300 text-xs md:text-sm">+15% ce mois</p>
          </div>
          <BarChart3 className="w-6 h-6 md:w-8 md:h-8 text-orange-400" />
        </div>
      </div>
    </div>
  );

  const renderDashboard = () => (
    <div className="space-y-4 md:space-y-8">
      {/* Stats principales */}
      {renderStats()}

      {/* Activité récente */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-8">
        <div className="bg-white/10 backdrop-blur-xl rounded-2xl p-6 md:p-8 border border-white/20">
          <h3 className="text-lg md:text-xl font-bold text-white mb-4 md:mb-6">Activité récente</h3>
          <div className="space-y-3 md:space-y-4">
            {stats?.recentActivity.map((activity, index) => (
              <div key={index} className="flex items-center gap-3 md:gap-4 p-3 md:p-4 bg-black/20 rounded-lg md:rounded-xl">
                <div className={`w-2 h-2 lg:w-3 lg:h-3 rounded-full ${
                  activity.type === 'sale' ? 'bg-green-400' :
                  activity.type === 'conversation' ? 'bg-blue-400' :
                  'bg-purple-400'
                } animate-pulse`}></div>
                <div className="flex-1 min-w-0">
                  <p className="text-white text-sm md:text-base">{activity.message}</p>
                  <p className="text-gray-400 text-xs md:text-sm">{activity.timestamp}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white/10 backdrop-blur-xl rounded-2xl p-6 md:p-8 border border-white/20">
          <h3 className="text-lg md:text-xl font-bold text-white mb-4 md:mb-6">Produits populaires</h3>
          <div className="space-y-3 md:space-y-4">
            {stats?.popularProducts.map((product, index) => (
              <div key={index} className="flex items-center gap-3 md:gap-4 p-3 md:p-4 bg-black/20 rounded-lg md:rounded-xl">
                <div className="w-8 h-8 md:w-10 md:h-10 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-lg md:rounded-xl flex items-center justify-center">
                  <span className="text-white font-bold text-sm md:text-base">{index + 1}</span>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-white font-semibold text-sm md:text-base">{product}</p>
                  <p className="text-gray-400 text-xs md:text-sm">Top ventes</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-purple-900 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-cyan-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-white text-lg">Chargement de l'interface admin...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-purple-900 flex flex-col md:flex-row">
      {/* Background Effects */}
      <div className="absolute inset-0 opacity-20">
        <div className="absolute top-20 left-20 w-72 h-72 bg-cyan-500/30 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-20 right-20 w-96 h-96 bg-purple-500/20 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '2s' }}></div>
      </div>

      {/* Mobile Header */}
      <div className="md:hidden bg-slate-800/95 backdrop-blur-xl border-b border-slate-700/50 p-4 relative z-50">
        <div className="flex items-center justify-between">
          <Logo size="sm" />
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-green-500/20 rounded-full flex items-center justify-center">
              <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
            </div>
            <button
              onClick={() => setShowMobileMenu(!showMobileMenu)}
              className="text-white p-2"
            >
              {showMobileMenu ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu Overlay */}
      {showMobileMenu && (
        <div className="md:hidden fixed inset-0 bg-black/50 backdrop-blur-sm z-40">
          <div className="bg-slate-800/95 backdrop-blur-xl w-full h-full p-6 pt-20">
            <div className="space-y-3">
              {tabs.map((tab) => {
                const Icon = tab.icon;
                return (
                  <button
                    key={tab.id}
                    onClick={() => {
                      setActiveTab(tab.id);
                      setShowMobileMenu(false);
                    }}
                    className={`w-full flex items-center gap-4 px-4 py-3 rounded-xl transition-all ${
                      activeTab === tab.id
                        ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30'
                        : 'text-gray-300 hover:bg-white/10 hover:text-white'
                    }`}
                  >
                    <Icon className="w-5 h-5" />
                    <span className="font-medium">{tab.label}</span>
                  </button>
                );
              })}
              <button
                onClick={onLogout}
                className="w-full flex items-center gap-4 px-4 py-3 rounded-xl text-red-300 hover:bg-red-500/20 hover:text-red-200 transition-all mt-6"
              >
                <LogOut className="w-5 h-5" />
                <span className="font-medium">Déconnexion</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Desktop Sidebar */}
      <div className="hidden md:flex w-80 bg-slate-800/95 backdrop-blur-xl border-r border-slate-700/50 flex-col relative z-10">
        {/* Header */}
        <div className="p-6 border-b border-slate-700/50">
          <Logo size="md" />
          <div className="mt-6 p-4 bg-cyan-500/20 rounded-xl border border-cyan-400/30">
            <div className="flex items-center gap-3 mb-2">
              <Store className="w-5 h-5 text-cyan-400" />
              <span className="text-cyan-300 font-semibold">Decora Home</span>
            </div>
            <p className="text-cyan-200 text-sm">Plan Professional</p>
            <div className="flex items-center gap-2 mt-2">
              <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
              <span className="text-green-300 text-sm">Actif</span>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-6 space-y-2">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
                  activeTab === tab.id
                    ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30'
                    : 'text-gray-300 hover:bg-white/10 hover:text-white'
                }`}
              >
                <Icon className="w-5 h-5" />
                <span className="font-medium">{tab.label}</span>
              </button>
            );
          })}
        </nav>

        {/* Footer */}
        <div className="p-6 border-t border-slate-700/50">
          <button
            onClick={onLogout}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-red-300 hover:bg-red-500/20 hover:text-red-200 transition-all"
          >
            <LogOut className="w-5 h-5" />
            <span className="font-medium">Déconnexion</span>
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col relative z-10 min-h-0">
        {/* Desktop Header */}
        <div className="hidden md:flex bg-slate-800/80 backdrop-blur-xl border-b border-slate-700/50 p-6">
          <div className="flex items-center justify-between w-full">
            <div>
              <h1 className="text-2xl font-bold text-white mb-1">
                {tabs.find(tab => tab.id === activeTab)?.label}
              </h1>
              <p className="text-gray-300">
                {activeTab === 'dashboard' && 'Vue d\'ensemble de votre activité'}
                {activeTab === 'catalog' && 'Gestion de votre catalogue produits'}
                {activeTab === 'conversations' && 'Historique des interactions OmnIA'}
                {activeTab === 'robot' && 'Configuration de votre robot IA'}
                {activeTab === 'ecommerce' && 'Connexions aux plateformes e-commerce'}
                {activeTab === 'training' && 'Entraînement de l\'intelligence artificielle'}
                {activeTab === 'ml-dashboard' && 'Tableau de bord Machine Learning'}
                {activeTab === 'settings' && 'Paramètres de votre compte'}
              </p>
            </div>
            <div className="flex items-center gap-4">
              <button className="relative p-2 text-gray-400 hover:text-white transition-colors">
                <Bell className="w-6 h-6" />
                <div className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full"></div>
              </button>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-green-400 rounded-full animate-pulse"></div>
                <span className="text-green-300 text-sm">En ligne</span>
              </div>
            </div>
          </div>
        </div>

        {/* Mobile Tabs */}
        <div className="md:hidden bg-slate-800/80 backdrop-blur-xl border-b border-slate-700/50 px-4 py-3">
          <div className="flex gap-2 overflow-x-auto scrollbar-hide">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex-shrink-0 flex items-center gap-2 px-3 py-2 rounded-xl transition-all ${
                    activeTab === tab.id
                      ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30'
                      : 'text-gray-400 hover:text-white hover:bg-white/10'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span className="text-xs font-medium whitespace-nowrap">{tab.shortLabel}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Content Area */}
        <div className="flex-1 overflow-y-auto p-4 md:p-8">
          <div className="max-w-7xl mx-auto">
            {activeTab === 'dashboard' && renderDashboard()}
            {activeTab === 'catalog' && <CatalogManagement />}
            {activeTab === 'conversations' && <ConversationHistory />}
            {activeTab === 'robot' && <OmniaRobotTab />}
            {activeTab === 'ecommerce' && (
              <EcommerceIntegration onConnected={handlePlatformConnected} />
            )}
            {activeTab === 'training' && <AITrainingInterface />}
            {activeTab === 'ml-dashboard' && <MLTrainingDashboard />}
            {activeTab === 'settings' && (
              <div className="bg-white/10 backdrop-blur-xl rounded-xl md:rounded-2xl p-6 md:p-8 border border-white/20">
                <h2 className="text-xl md:text-2xl font-bold text-white mb-6">Paramètres du compte</h2>
                <p className="text-gray-300">Configuration de votre compte et préférences...</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Notification System */}
      <NotificationSystem 
        notifications={notifications}
        onRemove={removeNotification}
      />
    </div>
  );
};