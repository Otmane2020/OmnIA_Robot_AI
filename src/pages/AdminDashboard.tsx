import React, { useState, useEffect } from 'react';
import { 
  Store, Users, Package, TrendingUp, DollarSign, MessageSquare, Settings, BarChart3, 
  Brain, Mail, Mic, FileText, AlertCircle, CheckCircle, ExternalLink, Filter, Plus, Eye,
  Tag, BookOpen, Zap, Loader2, Target, Search, Image, Sparkles, Upload, QrCode, Bot, Play, 
  Pause, RotateCcw, Move, Music, Wifi, Award, Globe, Lightbulb, Heart, ArrowLeft, Send, Briefcase,
  ChevronDown, ChevronUp, X, Save, Megaphone, Palette, Monitor, Smartphone, Tablet, Edit, Trash2, Clock,
  Battery, Signal, RefreshCw
} from 'lucide-react';
import { Logo } from '../components/Logo';
import { Navigation } from '../components/Navigation';
import { CatalogManagement } from '../components/CatalogManagement';
import { ProductsEnrichedTable } from '../components/ProductsEnrichedTable';
import { ShopifyCSVImporter } from '../components/ShopifyCSVImporter';
import { AITrainingInterface } from '../components/AITrainingInterface';
import { ConversationHistory } from '../components/ConversationHistory';
import { MLTrainingDashboard } from '../components/MLTrainingDashboard';
import { MessagingSystem } from '../components/MessagingSystem';
import { SpeechToTextInterface } from '../components/SpeechToTextInterface';
import { NotificationSystem, useNotifications } from '../components/NotificationSystem';

export const AdminDashboard: React.FC = () => {
  const [activeTab, setActiveTab] = useState('overview');
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

  const tabs = [
    { id: 'overview', label: 'Vue d\'ensemble', icon: BarChart3 },
    { id: 'catalog', label: 'Catalogue', icon: Package },
    { id: 'enriched', label: 'Catalogue Enrichi', icon: Brain },
    { id: 'import', label: 'Import CSV', icon: Upload },
    { id: 'training', label: 'Entraînement IA', icon: Bot },
    { id: 'conversations', label: 'Conversations', icon: MessageSquare },
    { id: 'ml', label: 'Machine Learning', icon: TrendingUp },
    { id: 'messaging', label: 'Messagerie', icon: Mail },
    { id: 'stt', label: 'Speech-to-Text', icon: Mic },
    { id: 'settings', label: 'Paramètres', icon: Settings }
  ];

  const stats = [
    { label: 'Produits actifs', value: '247', icon: Package, color: 'bg-blue-500' },
    { label: 'Conversations', value: '1.2k', icon: MessageSquare, color: 'bg-green-500' },
    { label: 'Taux conversion', value: '42%', icon: TrendingUp, color: 'bg-purple-500' },
    { label: 'Revenus mois', value: '€8.9k', icon: DollarSign, color: 'bg-orange-500' }
  ];

  const recentActivities = [
    { 
      id: 1, 
      type: 'import', 
      message: 'Import CSV terminé - 156 produits', 
      time: '2h', 
      icon: Upload, 
      color: 'text-green-400' 
    },
    { 
      id: 2, 
      type: 'training', 
      message: 'Entraînement IA réussi - 94% précision', 
      time: '4h', 
      icon: Brain, 
      color: 'text-purple-400' 
    },
    { 
      id: 3, 
      type: 'conversation', 
      message: '23 nouvelles conversations', 
      time: '6h', 
      icon: MessageSquare, 
      color: 'text-blue-400' 
    },
    { 
      id: 4, 
      type: 'email', 
      message: 'Email support envoyé', 
      time: '8h', 
      icon: Mail, 
      color: 'text-cyan-400' 
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-purple-900">
      {/* Header */}
      <header className="bg-black/20 backdrop-blur-xl border-b border-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center gap-4">
              <Logo size="md" />
              <div>
                <h1 className="text-2xl font-bold text-white">Admin Dashboard</h1>
                <p className="text-cyan-300">
                  {currentUser?.company_name || 'Decora Home'} • {currentUser?.plan || 'Professional'}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div className="text-right">
                <p className="text-white font-semibold">{currentUser?.contact_name || 'Admin'}</p>
                <p className="text-cyan-300 text-sm">{currentUser?.email || 'admin@decorahome.fr'}</p>
              </div>
              <a href="/" className="flex items-center gap-2 text-cyan-400 hover:text-cyan-300 transition-colors">
                <ArrowLeft className="w-4 h-4" />
                Retour accueil
              </a>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Navigation modules */}
        <div className="mb-8">
          <Navigation currentPath="/admin" />
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {stats.map((stat, index) => {
            const Icon = stat.icon;
            return (
              <div key={index} className="bg-white/10 backdrop-blur-xl rounded-2xl p-6 border border-white/20">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-300 text-sm">{stat.label}</p>
                    <p className="text-3xl font-bold text-white">{stat.value}</p>
                  </div>
                  <div className={`w-12 h-12 ${stat.color} rounded-xl flex items-center justify-center`}>
                    <Icon className="w-6 h-6 text-white" />
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Navigation Tabs */}
        <div className="bg-white/10 backdrop-blur-xl rounded-2xl p-2 border border-white/20 mb-8">
          <div className="flex flex-wrap gap-2">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-2 px-4 py-3 rounded-xl transition-all ${
                    activeTab === tab.id
                      ? 'bg-cyan-500 text-white'
                      : 'text-gray-400 hover:text-white hover:bg-white/10'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span className="font-medium text-sm">{tab.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Tab Content */}
        <div className="bg-white/10 backdrop-blur-xl rounded-2xl border border-white/20 min-h-[600px]">
          {activeTab === 'overview' && (
            <div className="p-8">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Activité récente */}
                <div className="bg-black/20 rounded-xl p-6">
                  <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
                    <Clock className="w-5 h-5 text-cyan-400" />
                    Activité récente
                  </h3>
                  <div className="space-y-4">
                    {recentActivities.map((activity) => {
                      const Icon = activity.icon;
                      return (
                        <div key={activity.id} className="flex items-center gap-3 p-3 bg-white/5 rounded-lg">
                          <Icon className={`w-5 h-5 ${activity.color}`} />
                          <div className="flex-1">
                            <p className="text-white text-sm">{activity.message}</p>
                            <p className="text-gray-400 text-xs">Il y a {activity.time}</p>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Statut système */}
                <div className="bg-black/20 rounded-xl p-6">
                  <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
                    <Settings className="w-5 h-5 text-green-400" />
                    Statut système
                  </h3>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between p-3 bg-green-500/20 rounded-lg">
                      <div className="flex items-center gap-2">
                        <CheckCircle className="w-4 h-4 text-green-400" />
                        <span className="text-green-300">OmnIA Robot</span>
                      </div>
                      <span className="text-green-400 font-semibold">Actif</span>
                    </div>
                    
                    <div className="flex items-center justify-between p-3 bg-green-500/20 rounded-lg">
                      <div className="flex items-center gap-2">
                        <CheckCircle className="w-4 h-4 text-green-400" />
                        <span className="text-green-300">Base de données</span>
                      </div>
                      <span className="text-green-400 font-semibold">Connectée</span>
                    </div>
                    
                    <div className="flex items-center justify-between p-3 bg-green-500/20 rounded-lg">
                      <div className="flex items-center gap-2">
                        <CheckCircle className="w-4 h-4 text-green-400" />
                        <span className="text-green-300">IA DeepSeek</span>
                      </div>
                      <span className="text-green-400 font-semibold">Opérationnelle</span>
                    </div>
                    
                    <div className="flex items-center justify-between p-3 bg-yellow-500/20 rounded-lg">
                      <div className="flex items-center gap-2">
                        <AlertCircle className="w-4 h-4 text-yellow-400" />
                        <span className="text-yellow-300">Cron quotidien</span>
                      </div>
                      <span className="text-yellow-400 font-semibold">Programmé</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Métriques détaillées */}
              <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-blue-500/20 rounded-xl p-6 border border-blue-400/30">
                  <h4 className="font-semibold text-blue-200 mb-4 flex items-center gap-2">
                    <Brain className="w-5 h-5" />
                    Performance IA
                  </h4>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-blue-300">Précision:</span>
                      <span className="text-white font-bold">94%</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-blue-300">Temps réponse:</span>
                      <span className="text-white font-bold">0.8s</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-blue-300">Satisfaction:</span>
                      <span className="text-white font-bold">4.7/5</span>
                    </div>
                  </div>
                </div>

                <div className="bg-green-500/20 rounded-xl p-6 border border-green-400/30">
                  <h4 className="font-semibold text-green-200 mb-4 flex items-center gap-2">
                    <Package className="w-5 h-5" />
                    Catalogue
                  </h4>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-green-300">Produits actifs:</span>
                      <span className="text-white font-bold">247</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-green-300">Catégories:</span>
                      <span className="text-white font-bold">12</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-green-300">En stock:</span>
                      <span className="text-white font-bold">234</span>
                    </div>
                  </div>
                </div>

                <div className="bg-purple-500/20 rounded-xl p-6 border border-purple-400/30">
                  <h4 className="font-semibold text-purple-200 mb-4 flex items-center gap-2">
                    <MessageSquare className="w-5 h-5" />
                    Conversations
                  </h4>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-purple-300">Aujourd'hui:</span>
                      <span className="text-white font-bold">89</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-purple-300">Ce mois:</span>
                      <span className="text-white font-bold">1.2k</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-purple-300">Conversion:</span>
                      <span className="text-white font-bold">42%</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
          
          {activeTab === 'catalog' && (
            <div className="p-8">
              <CatalogManagement />
            </div>
          )}
          
          {activeTab === 'enriched' && (
            <div className="p-8">
              <ProductsEnrichedTable />
            </div>
          )}
          
          {activeTab === 'import' && (
            <div className="p-8">
              <ShopifyCSVImporter onImportComplete={(data) => console.log('Import terminé:', data)} />
            </div>
          )}
          
          {activeTab === 'training' && (
            <div className="p-8">
              <AITrainingInterface onTrainingComplete={(stats) => console.log('Training terminé:', stats)} />
            </div>
          )}
          
          {activeTab === 'conversations' && (
            <div className="p-8">
              <ConversationHistory />
            </div>
          )}
          
          {activeTab === 'ml' && (
            <div className="p-8">
              <MLTrainingDashboard />
            </div>
          )}
          
          {activeTab === 'messaging' && (
            <div className="p-8">
              <MessagingSystem />
            </div>
          )}
          
          {activeTab === 'stt' && (
            <div className="p-8">
              <SpeechToTextInterface />
            </div>
          )}
          
          {activeTab === 'settings' && (
            <div className="p-8">
              <div className="space-y-8">
                <h2 className="text-2xl font-bold text-white">Paramètres Avancés</h2>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  {/* Configuration API */}
                  <div className="bg-black/20 rounded-xl p-6">
                    <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                      <Settings className="w-5 h-5 text-cyan-400" />
                      Configuration API
                    </h3>
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm text-cyan-300 mb-2">Clé API DeepSeek</label>
                        <input
                          type="password"
                          placeholder="sk-..."
                          className="w-full bg-black/40 border border-cyan-500/50 rounded-xl px-4 py-3 text-white"
                        />
                      </div>
                      <div>
                        <label className="block text-sm text-cyan-300 mb-2">Clé API ElevenLabs</label>
                        <input
                          type="password"
                          placeholder="..."
                          className="w-full bg-black/40 border border-cyan-500/50 rounded-xl px-4 py-3 text-white"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Configuration Shopify */}
                  <div className="bg-black/20 rounded-xl p-6">
                    <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                      <Store className="w-5 h-5 text-green-400" />
                      Configuration Shopify
                    </h3>
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm text-cyan-300 mb-2">Domaine Shopify</label>
                        <input
                          type="text"
                          placeholder="boutique.myshopify.com"
                          className="w-full bg-black/40 border border-cyan-500/50 rounded-xl px-4 py-3 text-white"
                        />
                      </div>
                      <div>
                        <label className="block text-sm text-cyan-300 mb-2">Token Storefront</label>
                        <input
                          type="password"
                          placeholder="..."
                          className="w-full bg-black/40 border border-cyan-500/50 rounded-xl px-4 py-3 text-white"
                        />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex gap-4">
                  <button className="bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-400 hover:to-emerald-500 text-white px-6 py-3 rounded-xl font-semibold transition-all">
                    Sauvegarder
                  </button>
                  <button className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-xl transition-all">
                    Tester connexions
                  </button>
                </div>
              </div>
            </div>
          )}
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