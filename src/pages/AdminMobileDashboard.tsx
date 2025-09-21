import React, { useState, useEffect } from 'react';
import { 
  Store, Users, MessageSquare, BarChart3, Settings, LogOut,
  Upload, Download, RefreshCw, Eye, Plus, Search, Filter,
  TrendingUp, ShoppingCart, Globe, Zap, Bot, Menu, X,
  Package, DollarSign, Target, Clock, Star, Smartphone
} from 'lucide-react';
import { Logo } from '../components/Logo';

interface AdminMobileDashboardProps {
  onLogout: () => void;
}

export const AdminMobileDashboard: React.FC<AdminMobileDashboardProps> = ({ onLogout }) => {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const [stats, setStats] = useState({
    conversations: 1234,
    products: 247,
    revenue: 15420,
    conversion_rate: 42
  });

  const currentRetailer = localStorage.getItem('current_retailer_email') || 'demo@decorahome.fr';
  
  const tabs = [
    { id: 'dashboard', label: 'Tableau de bord', icon: BarChart3 },
    { id: 'products', label: 'Produits', icon: Package },
    { id: 'conversations', label: 'Conversations', icon: MessageSquare },
    { id: 'analytics', label: 'Analytics', icon: TrendingUp },
    { id: 'robot', label: 'Robot IA', icon: Bot },
    { id: 'settings', label: 'Paramètres', icon: Settings }
  ];

  const renderMobileHeader = () => (
    <div className="bg-slate-800/95 backdrop-blur-xl border-b border-slate-700/50 p-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Logo size="sm" showText={false} />
          <div>
            <h1 className="text-white font-bold text-sm">OmnIA Admin</h1>
            <p className="text-cyan-300 text-xs">Mobile Dashboard</p>
          </div>
        </div>
        
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1">
            <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
            <span className="text-green-300 text-xs">Active</span>
          </div>
          
          <button
            onClick={() => setShowMobileMenu(!showMobileMenu)}
            className="bg-slate-700/50 hover:bg-slate-600/50 p-2 rounded-lg transition-colors"
          >
            {showMobileMenu ? (
              <X className="w-5 h-5 text-white" />
            ) : (
              <Menu className="w-5 h-5 text-white" />
            )}
          </button>
        </div>
      </div>

      {/* Mobile Menu Overlay */}
      {showMobileMenu && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50">
          <div className="bg-slate-800/95 backdrop-blur-xl w-80 h-full border-r border-slate-700/50 p-6">
            <div className="flex items-center justify-between mb-8">
              <Logo size="md" />
              <button
                onClick={() => setShowMobileMenu(false)}
                className="text-gray-400 hover:text-white"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="space-y-2">
              {tabs.map((tab) => {
                const Icon = tab.icon;
                return (
                  <button
                    key={tab.id}
                    onClick={() => {
                      setActiveTab(tab.id);
                      setShowMobileMenu(false);
                    }}
                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all text-left ${
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
            </div>

            <div className="absolute bottom-6 left-6 right-6">
              <div className="bg-slate-700/50 rounded-xl p-4 mb-4">
                <h4 className="text-white font-semibold mb-2">{currentRetailer.split('@')[0]}</h4>
                <p className="text-gray-300 text-sm">{currentRetailer}</p>
              </div>
              
              <button
                onClick={onLogout}
                className="w-full bg-red-600 hover:bg-red-700 text-white py-3 rounded-xl font-semibold transition-all flex items-center justify-center gap-2"
              >
                <LogOut className="w-4 h-4" />
                Déconnexion
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );

  const renderMobileTabs = () => (
    <div className="bg-slate-800/90 border-b border-slate-700/50 overflow-x-auto">
      <div className="flex space-x-1 p-2 min-w-max">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all whitespace-nowrap ${
                activeTab === tab.id
                  ? 'bg-cyan-500 text-white'
                  : 'text-gray-400 hover:text-white hover:bg-white/10'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span className="text-sm font-medium">{tab.label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );

  const renderMobileDashboard = () => (
    <div className="p-4 space-y-6">
      {/* Quick Stats Grid */}
      <div className="grid grid-cols-2 gap-4">
        <div className="bg-blue-600/20 backdrop-blur-xl rounded-xl p-4 border border-blue-500/30">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-blue-200 text-xs mb-1">Conversations</p>
              <p className="text-2xl font-bold text-white">{stats.conversations.toLocaleString()}</p>
            </div>
            <MessageSquare className="w-8 h-8 text-blue-400" />
          </div>
        </div>
        
        <div className="bg-green-600/20 backdrop-blur-xl rounded-xl p-4 border border-green-500/30">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-green-200 text-xs mb-1">Revenus</p>
              <p className="text-2xl font-bold text-white">€{stats.revenue.toLocaleString()}</p>
            </div>
            <DollarSign className="w-8 h-8 text-green-400" />
          </div>
        </div>
        
        <div className="bg-purple-600/20 backdrop-blur-xl rounded-xl p-4 border border-purple-500/30">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-purple-200 text-xs mb-1">Produits</p>
              <p className="text-2xl font-bold text-white">{stats.products}</p>
            </div>
            <Package className="w-8 h-8 text-purple-400" />
          </div>
        </div>
        
        <div className="bg-orange-600/20 backdrop-blur-xl rounded-xl p-4 border border-orange-500/30">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-orange-200 text-xs mb-1">Conversion</p>
              <p className="text-2xl font-bold text-white">{stats.conversion_rate}%</p>
            </div>
            <Target className="w-8 h-8 text-orange-400" />
          </div>
        </div>
      </div>

      {/* Conversations récentes */}
      <div className="bg-white/10 backdrop-blur-xl rounded-xl p-4 border border-white/20">
        <h3 className="text-lg font-bold text-white mb-4">Conversations récentes</h3>
        <div className="space-y-3">
          {[
            { time: 'Il y a 5 min', message: 'Recherche canapé bleu', status: 'active' },
            { time: 'Il y a 12 min', message: 'Table ronde travertin', status: 'completed' },
            { time: 'Il y a 28 min', message: 'Conseil déco salon', status: 'completed' }
          ].map((conv, index) => (
            <div key={index} className="flex items-center justify-between p-3 bg-black/20 rounded-lg">
              <div>
                <p className="text-white text-sm font-medium">{conv.message}</p>
                <p className="text-gray-400 text-xs">{conv.time}</p>
              </div>
              <div className={`w-2 h-2 rounded-full ${
                conv.status === 'active' ? 'bg-green-400 animate-pulse' : 'bg-gray-400'
              }`}></div>
            </div>
          ))}
        </div>
      </div>

      {/* Actions rapides */}
      <div className="grid grid-cols-2 gap-4">
        <button
          onClick={() => window.open('/robot', '_blank')}
          className="bg-gradient-to-r from-cyan-500 to-blue-600 text-white p-4 rounded-xl font-semibold text-sm"
        >
          🤖 Tester OmnIA
        </button>
        <button className="bg-gradient-to-r from-purple-500 to-pink-600 text-white p-4 rounded-xl font-semibold text-sm">
          📊 Voir Analytics
        </button>
        <button className="bg-gradient-to-r from-green-500 to-emerald-600 text-white p-4 rounded-xl font-semibold text-sm">
          📦 Ajouter Produits
        </button>
        <button className="bg-gradient-to-r from-orange-500 to-red-600 text-white p-4 rounded-xl font-semibold text-sm">
          ⚙️ Configuration
        </button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-purple-900">
      {/* Background Effects */}
      <div className="absolute inset-0 opacity-20">
        <div className="absolute top-20 left-20 w-72 h-72 bg-cyan-500/30 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-20 right-20 w-96 h-96 bg-purple-500/20 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '2s' }}></div>
      </div>

      {/* Version Mobile/Tablette */}
      <div className="md:hidden relative z-10">
        {renderMobileHeader()}
        {renderMobileTabs()}
        <div className="min-h-[calc(100vh-140px)]">
          {activeTab === 'dashboard' && renderMobileDashboard()}
          {activeTab === 'products' && (
            <div className="p-4">
              <div className="bg-white/10 backdrop-blur-xl rounded-xl p-6 border border-white/20 text-center">
                <Package className="w-12 h-12 text-cyan-400 mx-auto mb-4" />
                <h3 className="text-lg font-bold text-white mb-2">Gestion Catalogue</h3>
                <p className="text-gray-300 mb-6">Version mobile simplifiée</p>
                <button className="bg-cyan-600 hover:bg-cyan-700 text-white px-6 py-3 rounded-xl font-semibold">
                  Voir produits
                </button>
              </div>
            </div>
          )}
          {activeTab === 'conversations' && (
            <div className="p-4">
              <div className="bg-white/10 backdrop-blur-xl rounded-xl p-6 border border-white/20 text-center">
                <MessageSquare className="w-12 h-12 text-green-400 mx-auto mb-4" />
                <h3 className="text-lg font-bold text-white mb-2">Conversations</h3>
                <p className="text-gray-300 mb-6">Historique des échanges clients</p>
                <button className="bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-xl font-semibold">
                  Voir historique
                </button>
              </div>
            </div>
          )}
          {activeTab === 'analytics' && (
            <div className="p-4">
              <div className="bg-white/10 backdrop-blur-xl rounded-xl p-6 border border-white/20 text-center">
                <BarChart3 className="w-12 h-12 text-purple-400 mx-auto mb-4" />
                <h3 className="text-lg font-bold text-white mb-2">Analytics</h3>
                <p className="text-gray-300 mb-6">Statistiques détaillées</p>
                <button className="bg-purple-600 hover:bg-purple-700 text-white px-6 py-3 rounded-xl font-semibold">
                  Voir stats
                </button>
              </div>
            </div>
          )}
          {activeTab === 'robot' && (
            <div className="p-4">
              <div className="bg-white/10 backdrop-blur-xl rounded-xl p-6 border border-white/20 text-center">
                <Bot className="w-12 h-12 text-cyan-400 mx-auto mb-4" />
                <h3 className="text-lg font-bold text-white mb-2">Robot OmnIA</h3>
                <p className="text-gray-300 mb-6">Configuration et test</p>
                <div className="space-y-3">
                  <button
                    onClick={() => window.open('/robot', '_blank')}
                    className="w-full bg-gradient-to-r from-cyan-500 to-blue-600 text-white py-3 rounded-xl font-semibold"
                  >
                    🤖 Tester le robot
                  </button>
                  <button className="w-full bg-purple-600 hover:bg-purple-700 text-white py-3 rounded-xl font-semibold">
                    ⚙️ Configuration
                  </button>
                </div>
              </div>
            </div>
          )}
          {activeTab === 'settings' && (
            <div className="p-4">
              <div className="bg-white/10 backdrop-blur-xl rounded-xl p-6 border border-white/20">
                <h3 className="text-lg font-bold text-white mb-6">Paramètres</h3>
                
                <div className="space-y-4">
                  <div className="bg-black/20 rounded-lg p-4">
                    <h4 className="text-white font-semibold mb-2">Compte</h4>
                    <p className="text-gray-300 text-sm">{currentRetailer}</p>
                    <p className="text-cyan-400 text-sm">Plan Professional</p>
                  </div>
                  
                  <div className="bg-black/20 rounded-lg p-4">
                    <h4 className="text-white font-semibold mb-2">Robot IA</h4>
                    <div className="flex items-center justify-between">
                      <span className="text-gray-300 text-sm">OmnIA Actif</span>
                      <div className="w-3 h-3 bg-green-400 rounded-full animate-pulse"></div>
                    </div>
                  </div>
                  
                  <button
                    onClick={onLogout}
                    className="w-full bg-red-600 hover:bg-red-700 text-white py-3 rounded-xl font-semibold flex items-center justify-center gap-2"
                  >
                    <LogOut className="w-4 h-4" />
                    Déconnexion
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Version Desktop - Rediriger vers AdminDashboard principal */}
      <div className="hidden md:flex items-center justify-center h-screen relative z-10">
        <div className="bg-white/10 backdrop-blur-xl rounded-2xl p-8 border border-white/20 text-center max-w-md">
          <Smartphone className="w-16 h-16 text-cyan-400 mx-auto mb-6" />
          <h2 className="text-2xl font-bold text-white mb-4">Version Desktop Disponible</h2>
          <p className="text-gray-300 mb-6">
            Cette interface est optimisée pour mobile. La version desktop complète est disponible.
          </p>
          <button
            onClick={() => window.location.reload()}
            className="bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white px-6 py-3 rounded-xl font-semibold transition-all"
          >
            Accéder version desktop
          </button>
        </div>
      </div>
    </div>
  );
};