import React, { useState, useEffect } from 'react';
import { 
  BarChart3, Users, Package, DollarSign, TrendingUp, 
  MessageSquare, ShoppingCart, Clock, Star, Eye,
  Calendar, Globe, Zap, Brain, Settings, LogOut,
  Upload, FileText, Store, Bot, Mail, Database,
  Sparkles, RefreshCw, Download, Filter, Search
} from 'lucide-react';
import { CatalogManagement } from '../components/CatalogManagement';
import { EcommerceIntegration } from '../components/EcommerceIntegration';
import { AITrainingInterface } from '../components/AITrainingInterface';
import { ConversationHistory } from '../components/ConversationHistory';
import { ProductsEnrichedTable } from '../components/ProductsEnrichedTable';
import { OmniaRobotTab } from '../components/OmniaRobotTab';
import { MLTrainingDashboard } from '../components/MLTrainingDashboard';
import { SmartAIAttributesTab } from '../components/SmartAIAttributesTab';
import { MessagingSystem } from '../components/MessagingSystem';
import { SpeechToTextInterface } from '../components/SpeechToTextInterface';
import { NotificationSystem, useNotifications } from '../components/NotificationSystem';

interface AdminDashboardProps {
  onLogout: () => void;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({ onLogout }) => {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [currentUser, setCurrentUser] = useState(() => {
    const loggedUser = localStorage.getItem('current_logged_user');
    if (loggedUser) {
      try {
        return JSON.parse(loggedUser);
      } catch {
        return null;
      }
    }
    return null;
  });

  const { notifications, removeNotification } = useNotifications();

  // Statistiques simulées basées sur les vraies données
  const [stats, setStats] = useState({
    totalConversations: 1234,
    totalProducts: 247,
    monthlyRevenue: 2450,
    conversionRate: 42,
    activeUsers: 89,
    avgSessionDuration: '4m 32s',
    topProducts: ['Canapé ALYANA', 'Table AUREA', 'Chaise INAYA'],
    recentActivity: [
      { type: 'conversation', message: 'Nouvelle conversation client', time: '2 min' },
      { type: 'sale', message: 'Vente Canapé ALYANA - 799€', time: '15 min' },
      { type: 'product', message: 'Produit ajouté au catalogue', time: '1h' }
    ]
  });

  useEffect(() => {
    // Charger les vraies statistiques depuis localStorage
    const loadRealStats = () => {
      try {
        // Compter les produits réels
        const catalogProducts = localStorage.getItem('catalog_products');
        const productsCount = catalogProducts ? JSON.parse(catalogProducts).length : 247;
        
        // Compter les conversations réelles
        const conversations = localStorage.getItem('chat_history');
        const conversationsCount = conversations ? JSON.parse(conversations).length : 1234;
        
        setStats(prev => ({
          ...prev,
          totalProducts: productsCount,
          totalConversations: conversationsCount
        }));
      } catch (error) {
        console.error('Erreur chargement stats:', error);
      }
    };

    loadRealStats();
  }, []);

  const tabs = [
    { id: 'dashboard', label: 'Dashboard', icon: BarChart3 },
    { id: 'catalog', label: 'Catalogue', icon: Package },
    { id: 'ecommerce', label: 'E-commerce', icon: Store },
    { id: 'smart-ai', label: 'SMART AI Attributes', icon: Brain },
    { id: 'enriched', label: 'Catalogue Enrichi', icon: Sparkles },
    { id: 'ai-training', label: 'Entraînement IA', icon: Brain },
    { id: 'ml-training', label: 'ML Dashboard', icon: Database },
    { id: 'conversations', label: 'Conversations', icon: MessageSquare },
    { id: 'robot', label: 'Robot OmnIA', icon: Bot },
    { id: 'messaging', label: 'Messagerie', icon: Mail },
    { id: 'stt', label: 'Speech-to-Text', icon: Settings }
  ];

  const renderDashboard = () => (
    <div className="space-y-8">
      {/* Header Dashboard */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold text-white">
            Tableau de bord • {currentUser?.company_name || 'Revendeur'}
          </h2>
          <p className="text-gray-300">Vue d'ensemble de votre activité OmnIA</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-green-400 rounded-full animate-pulse"></div>
            <span className="text-green-300 text-sm">OmnIA actif</span>
          </div>
          <span className="text-gray-400 text-sm">Plan {currentUser?.plan || 'Professional'}</span>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-blue-600/20 backdrop-blur-xl rounded-2xl p-6 border border-blue-500/30">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-blue-200 text-sm mb-1">Conversations</p>
              <p className="text-3xl font-bold text-white">{stats.totalConversations.toLocaleString()}</p>
              <p className="text-blue-300 text-sm">+12% ce mois</p>
            </div>
            <MessageSquare className="w-10 h-10 text-blue-400" />
          </div>
        </div>
        
        <div className="bg-green-600/20 backdrop-blur-xl rounded-2xl p-6 border border-green-500/30">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-green-200 text-sm mb-1">Produits</p>
              <p className="text-3xl font-bold text-white">{stats.totalProducts}</p>
              <p className="text-green-300 text-sm">Catalogue actif</p>
            </div>
            <Package className="w-10 h-10 text-green-400" />
          </div>
        </div>
        
        <div className="bg-purple-600/20 backdrop-blur-xl rounded-2xl p-6 border border-purple-500/30">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-purple-200 text-sm mb-1">Revenus</p>
              <p className="text-3xl font-bold text-white">€{stats.monthlyRevenue.toLocaleString()}</p>
              <p className="text-purple-300 text-sm">Ce mois</p>
            </div>
            <DollarSign className="w-10 h-10 text-purple-400" />
          </div>
        </div>
        
        <div className="bg-orange-600/20 backdrop-blur-xl rounded-2xl p-6 border border-orange-500/30">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-orange-200 text-sm mb-1">Conversions</p>
              <p className="text-3xl font-bold text-white">{stats.conversionRate}%</p>
              <p className="text-orange-300 text-sm">+8% vs mois dernier</p>
            </div>
            <TrendingUp className="w-10 h-10 text-orange-400" />
          </div>
        </div>
      </div>

      {/* Graphiques et activité récente */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Graphique des conversations */}
        <div className="bg-white/10 backdrop-blur-xl rounded-2xl p-6 border border-white/20">
          <h3 className="text-xl font-bold text-white mb-4">Conversations par jour</h3>
          <div className="h-64 flex items-end justify-between gap-2">
            {[45, 62, 38, 71, 55, 83, 67].map((height, index) => (
              <div key={index} className="flex-1 bg-gradient-to-t from-cyan-500 to-blue-600 rounded-t-lg opacity-80 hover:opacity-100 transition-opacity" style={{ height: `${height}%` }}>
                <div className="w-full h-full rounded-t-lg"></div>
              </div>
            ))}
          </div>
          <div className="flex justify-between text-gray-400 text-sm mt-2">
            <span>Lun</span>
            <span>Mar</span>
            <span>Mer</span>
            <span>Jeu</span>
            <span>Ven</span>
            <span>Sam</span>
            <span>Dim</span>
          </div>
        </div>

        {/* Activité récente */}
        <div className="bg-white/10 backdrop-blur-xl rounded-2xl p-6 border border-white/20">
          <h3 className="text-xl font-bold text-white mb-4">Activité récente</h3>
          <div className="space-y-4">
            {stats.recentActivity.map((activity, index) => (
              <div key={index} className="flex items-center gap-3 p-3 bg-black/20 rounded-xl">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                  activity.type === 'conversation' ? 'bg-blue-500/30' :
                  activity.type === 'sale' ? 'bg-green-500/30' :
                  'bg-purple-500/30'
                }`}>
                  {activity.type === 'conversation' ? <MessageSquare className="w-4 h-4 text-blue-400" /> :
                   activity.type === 'sale' ? <ShoppingCart className="w-4 h-4 text-green-400" /> :
                   <Package className="w-4 h-4 text-purple-400" />}
                </div>
                <div className="flex-1">
                  <p className="text-white text-sm">{activity.message}</p>
                  <p className="text-gray-400 text-xs">Il y a {activity.time}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Produits populaires */}
      <div className="bg-white/10 backdrop-blur-xl rounded-2xl p-6 border border-white/20">
        <h3 className="text-xl font-bold text-white mb-4">Produits les plus demandés</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {stats.topProducts.map((product, index) => (
            <div key={index} className="bg-black/20 rounded-xl p-4 border border-white/10">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-full flex items-center justify-center">
                  <span className="text-white font-bold text-sm">#{index + 1}</span>
                </div>
                <div>
                  <p className="text-white font-semibold">{product}</p>
                  <p className="text-gray-400 text-sm">{Math.floor(Math.random() * 50) + 20} demandes</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Actions rapides */}
      <div className="bg-gradient-to-r from-cyan-500/20 to-blue-600/20 backdrop-blur-xl rounded-2xl p-6 border border-cyan-400/30">
        <h3 className="text-lg font-bold text-white mb-4">Actions rapides</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <button
            onClick={() => setActiveTab('catalog')}
            className="bg-green-600/20 hover:bg-green-600/30 border border-green-500/50 text-green-300 p-4 rounded-xl transition-all text-left"
          >
            <Package className="w-6 h-6 mb-2" />
            <div className="font-semibold">Gérer le catalogue</div>
            <div className="text-sm opacity-80">Ajouter/modifier produits</div>
          </button>
          
          <button
            onClick={() => setActiveTab('ai-training')}
            className="bg-purple-600/20 hover:bg-purple-600/30 border border-purple-500/50 text-purple-300 p-4 rounded-xl transition-all text-left"
          >
            <Brain className="w-6 h-6 mb-2" />
            <div className="font-semibold">Entraîner l'IA</div>
            <div className="text-sm opacity-80">Améliorer les réponses</div>
          </button>
          
          <button
            onClick={() => window.open('/robot', '_blank')}
            className="bg-cyan-600/20 hover:bg-cyan-600/30 border border-cyan-500/50 text-cyan-300 p-4 rounded-xl transition-all text-left"
          >
            <Bot className="w-6 h-6 mb-2" />
            <div className="font-semibold">Tester OmnIA</div>
            <div className="text-sm opacity-80">Interface robot</div>
          </button>
        </div>
      </div>
    </div>
  );

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return renderDashboard();
      case 'catalog':
        return <CatalogManagement />;
      case 'ecommerce':
        return <EcommerceIntegration onConnected={(data) => console.log('E-commerce connecté:', data)} />;
      case 'smart-ai':
        return <SmartAIAttributesTab />;
      case 'enriched':
        return <ProductsEnrichedTable />;
      case 'ai-training':
        return <AITrainingInterface onTrainingComplete={(stats) => console.log('Entraînement terminé:', stats)} />;
      case 'ml-training':
        return <MLTrainingDashboard />;
      case 'conversations':
        return <ConversationHistory />;
      case 'robot':
        return <OmniaRobotTab />;
      case 'messaging':
        return <MessagingSystem />;
      case 'stt':
        return <SpeechToTextInterface />;
      default:
        return renderDashboard();
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-purple-900 flex">
      {/* Sidebar */}
      <div className="w-80 bg-slate-800/95 backdrop-blur-xl border-r border-slate-700/50 flex flex-col">
        {/* Header */}
        <div className="p-6 border-b border-slate-700/50">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-2xl flex items-center justify-center">
              <Bot className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-white">OmnIA Admin</h1>
              <p className="text-cyan-300 text-sm">omnia.sale</p>
            </div>
          </div>
          
          <div className="bg-white/10 backdrop-blur-xl rounded-xl p-3 border border-white/20">
            <div className="text-white font-bold text-sm">{currentUser?.company_name || 'Revendeur'}</div>
            <div className="text-cyan-300 text-xs">{currentUser?.email || 'admin@boutique.fr'}</div>
            <div className="text-cyan-400 text-xs">Plan {currentUser?.plan || 'Professional'}</div>
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
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all text-left ${
                  activeTab === tab.id
                    ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30'
                    : 'text-gray-300 hover:bg-white/10 hover:text-white'
                }`}
              >
                <Icon className="w-5 h-5" />
                <span className="font-medium">{tab.label}</span>
                {tab.id === 'smart-ai' && (
                  <span className="ml-auto bg-purple-500/30 text-purple-300 px-2 py-1 rounded-full text-xs">
                    NEW
                  </span>
                )}
              </button>
            );
          })}
        </nav>

        {/* Footer */}
        <div className="p-6 border-t border-slate-700/50">
          <div className="space-y-3">
            <button
              onClick={() => window.open('/robot', '_blank')}
              className="w-full bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-400 hover:to-emerald-500 text-white py-3 rounded-xl font-semibold transition-all flex items-center justify-center gap-2"
            >
              <Bot className="w-4 h-4" />
              Tester OmnIA
            </button>
            
            <button
              onClick={onLogout}
              className="w-full bg-gray-600 hover:bg-gray-700 text-white py-2 rounded-xl transition-all flex items-center justify-center gap-2"
            >
              <LogOut className="w-4 h-4" />
              Déconnexion
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-y-auto">
        <div className="p-8">
          {renderContent()}
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