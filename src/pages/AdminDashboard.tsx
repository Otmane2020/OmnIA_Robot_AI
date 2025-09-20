import React, { useState, useEffect } from 'react';
import {
  Users, Database, CheckCircle, AlertCircle, CreditCard, Receipt,
  TrendingUp, MessageSquare, ShoppingCart, Upload, Download,
  Bot, Globe, FileText, Eye, Settings, Store, LogOut, BarChart3, Brain,
  Clock, Star, X, ShoppingBag, Search, Zap, Target, PenTool, Image,
  Megaphone, DollarSign, Palette, Monitor, Smartphone, Tablet
} from 'lucide-react';
import { Logo } from '../components/Logo';
import { EcommerceIntegration } from '../components/EcommerceIntegration';
import { ShopifyAdminConnector } from '../components/ShopifyAdminConnector';
import { AITrainingInterface } from '../components/AITrainingInterface';
import { OmniaRobotTab } from '../components/OmniaRobotTab';
import { CatalogManagement } from '../components/CatalogManagement';
import { MLTrainingDashboard } from '../components/MLTrainingDashboard';
import { ProductDetailModal } from '../components/ProductDetailModal';
import { AddProductModal } from '../components/AddProductModal';
import { ConversationHistory } from '../components/ConversationHistory';
import { ProductsEnrichedTable } from '../components/ProductsEnrichedTable';
import { NotificationSystem, useNotifications } from '../components/NotificationSystem';

interface AdminDashboardProps {
  onLogout: () => void;
}

interface DashboardStats {
  conversations: number;
  conversions: number;
  products: number;
  revenue: number;
  visitors: number;
  sessionDuration: string;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({ onLogout }) => {
  const { notifications, showSuccess, showError, showInfo, removeNotification } = useNotifications();
  
  const [activeTab, setActiveTab] = useState('dashboard');
  const [stats, setStats] = useState<DashboardStats>({
    conversations: 1234,
    conversions: 42,
    products: 247,
    revenue: 45600,
    visitors: 89,
    sessionDuration: '4m 12s'
  });
  const [connectedPlatforms, setConnectedPlatforms] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [showQR, setShowQR] = useState(false);

  const sidebarItems = [
    { id: 'dashboard', label: 'Dashboard', icon: BarChart3, color: 'bg-cyan-500' },
    { id: 'ecommerce', label: 'E-Commerce', icon: ShoppingCart, color: 'bg-green-500' },
    { id: 'ads', label: 'Ads & Marketing', icon: Target, color: 'bg-blue-500' },
    { id: 'vision', label: 'Vision & Studio', icon: Eye, color: 'bg-pink-500' },
    { id: 'seo', label: 'SEO', icon: Search, color: 'bg-purple-500' },
    { id: 'omnia', label: 'OmnIA Bot', icon: Bot, color: 'bg-purple-600' },
    { id: 'analytics', label: 'Analytics', icon: BarChart3, color: 'bg-orange-500' },
    { id: 'admin', label: 'Admin', icon: Settings, color: 'bg-gray-500' }
  ];

  const dashboardCards = [
    { title: 'E-Commerce', subtitle: '247 Produits', icon: ShoppingCart, color: 'bg-green-500', stats: '247 Produits' },
    { title: 'Ads & Marketing', subtitle: '4.2x ROAS', icon: Target, color: 'bg-blue-500', stats: '4.2x ROAS' },
    { title: 'Vision & Studio', subtitle: 'AR/VR', icon: Eye, color: 'bg-pink-500', stats: 'AR/VR' },
    { title: 'SEO', subtitle: '15 Articles', icon: Search, color: 'bg-purple-500', stats: '15 Articles' },
    { title: 'OmnIA Bot', subtitle: '1,234 Chats', icon: Bot, color: 'bg-purple-600', stats: '1,234 Chats' },
    { title: 'Analytics', subtitle: '42% Conv.', icon: BarChart3, color: 'bg-orange-500', stats: '42% Conv.' },
    { title: 'Admin', subtitle: '100% Uptime', icon: Settings, color: 'bg-gray-500', stats: '100% Uptime' }
  ];

  const handlePlatformConnected = (platformData: any) => {
    setConnectedPlatforms(prev => [...prev, platformData]);
    showSuccess('Plateforme connectée', `${platformData.name} connectée avec succès !`);
  };

  const renderDashboard = () => (
    <div className="space-y-8">
      {/* Dashboard Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {dashboardCards.map((card, index) => {
          const Icon = card.icon;
          return (
            <div
              key={index}
              onClick={() => setActiveTab(card.title.toLowerCase().replace(/[^a-z]/g, ''))}
              className="bg-slate-700/50 hover:bg-slate-600/50 backdrop-blur-xl rounded-2xl p-6 border border-slate-600/50 cursor-pointer transition-all hover:scale-105 hover:border-cyan-500/50"
            >
              <div className="flex items-center justify-between mb-4">
                <div className={`w-12 h-12 ${card.color} rounded-2xl flex items-center justify-center`}>
                  <Icon className="w-6 h-6 text-white" />
                </div>
              </div>
              <h3 className="text-lg font-bold text-white mb-2">{card.title}</h3>
              <p className="text-gray-300 text-sm">{card.subtitle}</p>
            </div>
          );
        })}
      </div>

      {/* Synthèse d'activité */}
      <div className="bg-slate-700/50 backdrop-blur-xl rounded-2xl p-8 border border-slate-600/50">
        <h2 className="text-2xl font-bold text-white mb-8">Synthèse d'activité</h2>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6">
          <div className="text-center">
            <div className="text-3xl font-bold text-green-400 mb-2">{stats.products}</div>
            <div className="text-gray-300 text-sm">Produits</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-blue-400 mb-2">{stats.conversations.toLocaleString()}</div>
            <div className="text-gray-300 text-sm">Conversations</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-purple-400 mb-2">€{stats.revenue.toLocaleString()}</div>
            <div className="text-gray-300 text-sm">Revenus</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-orange-400 mb-2">{stats.conversions}%</div>
            <div className="text-gray-300 text-sm">Conversion</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-cyan-400 mb-2">{stats.visitors}</div>
            <div className="text-gray-300 text-sm">Visiteurs</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-pink-400 mb-2">{stats.sessionDuration}</div>
            <div className="text-gray-300 text-sm">Session moy.</div>
          </div>
        </div>
      </div>
    </div>
  );

  const renderECommerce = () => (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-white">E-Commerce</h2>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 bg-green-400 rounded-full animate-pulse"></div>
          <span className="text-green-300 text-sm">{stats.products} produits actifs</span>
        </div>
      </div>

      <CatalogManagement />
    </div>
  );

  const renderAdsMarketing = () => (
    <div className="space-y-8">
      <h2 className="text-2xl font-bold text-white">Ads & Marketing</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div className="bg-slate-700/50 backdrop-blur-xl rounded-2xl p-6 border border-slate-600/50">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 bg-blue-500 rounded-2xl flex items-center justify-center">
              <Target className="w-6 h-6 text-white" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-white">Google Ads</h3>
              <p className="text-gray-300 text-sm">Campagnes publicitaires</p>
            </div>
          </div>
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-gray-300">ROAS :</span>
              <span className="text-green-400 font-bold">4.2x</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-300">Impressions :</span>
              <span className="text-white">125,430</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-300">Clics :</span>
              <span className="text-white">3,247</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-300">Conversions :</span>
              <span className="text-green-400">156</span>
            </div>
          </div>
          <button className="w-full mt-4 bg-blue-600 hover:bg-blue-700 text-white py-2 rounded-xl transition-all">
            Gérer les campagnes
          </button>
        </div>

        <div className="bg-slate-700/50 backdrop-blur-xl rounded-2xl p-6 border border-slate-600/50">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 bg-pink-500 rounded-2xl flex items-center justify-center">
              <Megaphone className="w-6 h-6 text-white" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-white">Social Media</h3>
              <p className="text-gray-300 text-sm">Réseaux sociaux</p>
            </div>
          </div>
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-gray-300">Followers :</span>
              <span className="text-white">12,450</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-300">Engagement :</span>
              <span className="text-green-400">8.5%</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-300">Posts ce mois :</span>
              <span className="text-white">24</span>
            </div>
          </div>
          <button className="w-full mt-4 bg-pink-600 hover:bg-pink-700 text-white py-2 rounded-xl transition-all">
            Programmer posts
          </button>
        </div>

        <div className="bg-slate-700/50 backdrop-blur-xl rounded-2xl p-6 border border-slate-600/50">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 bg-green-500 rounded-2xl flex items-center justify-center">
              <DollarSign className="w-6 h-6 text-white" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-white">Budget Marketing</h3>
              <p className="text-gray-300 text-sm">Dépenses publicitaires</p>
            </div>
          </div>
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-gray-300">Budget mensuel :</span>
              <span className="text-white">€2,500</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-300">Dépensé :</span>
              <span className="text-orange-400">€1,847</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-300">Restant :</span>
              <span className="text-green-400">€653</span>
            </div>
          </div>
          <button className="w-full mt-4 bg-green-600 hover:bg-green-700 text-white py-2 rounded-xl transition-all">
            Ajuster budget
          </button>
        </div>
      </div>
    </div>
  );

  const renderVisionStudio = () => (
    <div className="space-y-8">
      <h2 className="text-2xl font-bold text-white">Vision & Studio</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-slate-700/50 backdrop-blur-xl rounded-2xl p-6 border border-slate-600/50">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 bg-pink-500 rounded-2xl flex items-center justify-center">
              <Eye className="w-6 h-6 text-white" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-white">AR/VR Studio</h3>
              <p className="text-gray-300 text-sm">Réalité augmentée</p>
            </div>
          </div>
          <div className="space-y-4">
            <div className="bg-pink-500/20 border border-pink-400/50 rounded-xl p-4">
              <h4 className="font-semibold text-pink-200 mb-2">🥽 Fonctionnalités AR/VR :</h4>
              <ul className="text-pink-300 text-sm space-y-1">
                <li>• Visualisation 3D des meubles</li>
                <li>• Placement virtuel dans l'espace</li>
                <li>• Essai couleurs et matériaux</li>
                <li>• Visite virtuelle showroom</li>
              </ul>
            </div>
            <button className="w-full bg-pink-600 hover:bg-pink-700 text-white py-3 rounded-xl transition-all">
              Lancer AR Studio
            </button>
          </div>
        </div>

        <div className="bg-slate-700/50 backdrop-blur-xl rounded-2xl p-6 border border-slate-600/50">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 bg-purple-500 rounded-2xl flex items-center justify-center">
              <Image className="w-6 h-6 text-white" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-white">Studio Photo</h3>
              <p className="text-gray-300 text-sm">Génération d'images IA</p>
            </div>
          </div>
          <div className="space-y-4">
            <div className="bg-purple-500/20 border border-purple-400/50 rounded-xl p-4">
              <h4 className="font-semibold text-purple-200 mb-2">📸 Studio IA :</h4>
              <ul className="text-purple-300 text-sm space-y-1">
                <li>• Génération images produits</li>
                <li>• Mise en scène automatique</li>
                <li>• Variantes couleurs/angles</li>
                <li>• Optimisation pour e-commerce</li>
              </ul>
            </div>
            <button className="w-full bg-purple-600 hover:bg-purple-700 text-white py-3 rounded-xl transition-all">
              Générer images IA
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  const renderSEO = () => (
    <div className="space-y-8">
      <h2 className="text-2xl font-bold text-white">SEO & Content</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-slate-700/50 backdrop-blur-xl rounded-2xl p-6 border border-slate-600/50">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 bg-purple-500 rounded-2xl flex items-center justify-center">
              <Search className="w-6 h-6 text-white" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-white">Mots-clés</h3>
              <p className="text-gray-300 text-sm">Positionnement Google</p>
            </div>
          </div>
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-gray-300">Position moyenne :</span>
              <span className="text-green-400 font-bold">3.2</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-300">Mots-clés top 10 :</span>
              <span className="text-white">47</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-300">Trafic organique :</span>
              <span className="text-green-400">+23%</span>
            </div>
          </div>
        </div>

        <div className="bg-slate-700/50 backdrop-blur-xl rounded-2xl p-6 border border-slate-600/50">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 bg-blue-500 rounded-2xl flex items-center justify-center">
              <FileText className="w-6 h-6 text-white" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-white">Blog</h3>
              <p className="text-gray-300 text-sm">Articles de blog</p>
            </div>
          </div>
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-gray-300">Articles publiés :</span>
              <span className="text-white">15</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-300">Vues totales :</span>
              <span className="text-white">8,450</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-300">Temps de lecture :</span>
              <span className="text-white">3m 24s</span>
            </div>
          </div>
          <button className="w-full mt-4 bg-blue-600 hover:bg-blue-700 text-white py-2 rounded-xl transition-all">
            Créer un article
          </button>
        </div>

        <div className="bg-slate-700/50 backdrop-blur-xl rounded-2xl p-6 border border-slate-600/50">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 bg-green-500 rounded-2xl flex items-center justify-center">
              <TrendingUp className="w-6 h-6 text-white" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-white">Performance</h3>
              <p className="text-gray-300 text-sm">Métriques SEO</p>
            </div>
          </div>
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-gray-300">Score SEO :</span>
              <span className="text-green-400 font-bold">87/100</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-300">Vitesse site :</span>
              <span className="text-green-400">92/100</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-300">Mobile-friendly :</span>
              <span className="text-green-400">✓</span>
            </div>
          </div>
        </div>
      </div>

      {/* Blog Management */}
      <div className="bg-slate-700/50 backdrop-blur-xl rounded-2xl p-8 border border-slate-600/50">
        <h3 className="text-xl font-bold text-white mb-6">Gestion du Blog</h3>
        <div className="space-y-4">
          <div className="flex items-center justify-between p-4 bg-slate-600/50 rounded-xl">
            <div>
              <h4 className="font-semibold text-white">Tendances mobilier 2025</h4>
              <p className="text-gray-300 text-sm">Publié le 10 janvier • 1,234 vues</p>
            </div>
            <div className="flex gap-2">
              <button className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-2 rounded-lg text-sm">
                Modifier
              </button>
              <button className="bg-green-600 hover:bg-green-700 text-white px-3 py-2 rounded-lg text-sm">
                Voir
              </button>
            </div>
          </div>
          <div className="flex items-center justify-between p-4 bg-slate-600/50 rounded-xl">
            <div>
              <h4 className="font-semibold text-white">Guide d'aménagement salon</h4>
              <p className="text-gray-300 text-sm">Publié le 5 janvier • 892 vues</p>
            </div>
            <div className="flex gap-2">
              <button className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-2 rounded-lg text-sm">
                Modifier
              </button>
              <button className="bg-green-600 hover:bg-green-700 text-white px-3 py-2 rounded-lg text-sm">
                Voir
              </button>
            </div>
          </div>
        </div>
        <button className="w-full mt-6 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-400 hover:to-purple-500 text-white py-3 rounded-xl font-semibold transition-all">
          + Créer un nouvel article
        </button>
      </div>
    </div>
  );

  const renderOmnIABot = () => (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-white">OmnIA Bot</h2>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 bg-green-400 rounded-full animate-pulse"></div>
          <span className="text-green-300 text-sm">Robot actif</span>
        </div>
      </div>

      <OmniaRobotTab />
    </div>
  );

  const renderAnalytics = () => (
    <div className="space-y-8">
      <h2 className="text-2xl font-bold text-white">Analytics</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-orange-600/20 backdrop-blur-xl rounded-2xl p-6 border border-orange-500/30">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-orange-200 text-sm mb-1">Conversions</p>
              <p className="text-3xl font-bold text-white mb-1">{stats.conversions}%</p>
              <p className="text-green-400 text-sm">+8% ce mois</p>
            </div>
            <TrendingUp className="w-10 h-10 text-orange-400" />
          </div>
        </div>
        
        <div className="bg-blue-600/20 backdrop-blur-xl rounded-2xl p-6 border border-blue-500/30">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-blue-200 text-sm mb-1">Visiteurs</p>
              <p className="text-3xl font-bold text-white mb-1">{stats.visitors}</p>
              <p className="text-green-400 text-sm">+15% ce mois</p>
            </div>
            <Users className="w-10 h-10 text-blue-400" />
          </div>
        </div>
        
        <div className="bg-purple-600/20 backdrop-blur-xl rounded-2xl p-6 border border-purple-500/30">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-purple-200 text-sm mb-1">Session moy.</p>
              <p className="text-3xl font-bold text-white mb-1">{stats.sessionDuration}</p>
              <p className="text-green-400 text-sm">+5% ce mois</p>
            </div>
            <Clock className="w-10 h-10 text-purple-400" />
          </div>
        </div>
        
        <div className="bg-green-600/20 backdrop-blur-xl rounded-2xl p-6 border border-green-500/30">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-green-200 text-sm mb-1">Revenus</p>
              <p className="text-3xl font-bold text-white mb-1">€{stats.revenue.toLocaleString()}</p>
              <p className="text-green-400 text-sm">+12% ce mois</p>
            </div>
            <DollarSign className="w-10 h-10 text-green-400" />
          </div>
        </div>
      </div>

      {/* Graphiques */}
      <div className="bg-slate-700/50 backdrop-blur-xl rounded-2xl p-8 border border-slate-600/50">
        <h3 className="text-xl font-bold text-white mb-6">Évolution des métriques</h3>
        <div className="h-64 bg-slate-600/30 rounded-xl flex items-center justify-center">
          <div className="text-center">
            <BarChart3 className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-400">Graphiques analytics en développement</p>
            <p className="text-gray-500 text-sm">Intégration Google Analytics en cours</p>
          </div>
        </div>
      </div>
    </div>
  );

  const renderAdmin = () => (
    <div className="space-y-8">
      <h2 className="text-2xl font-bold text-white">Administration</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-slate-700/50 backdrop-blur-xl rounded-2xl p-6 border border-slate-600/50">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 bg-gray-500 rounded-2xl flex items-center justify-center">
              <Settings className="w-6 h-6 text-white" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-white">Paramètres Généraux</h3>
              <p className="text-gray-300 text-sm">Configuration système</p>
            </div>
          </div>
          <div className="space-y-4">
            <div>
              <label className="block text-sm text-gray-300 mb-2">Nom de la boutique</label>
              <input
                type="text"
                defaultValue="Decora Home"
                className="w-full bg-slate-600/50 border border-slate-500 rounded-xl px-4 py-2 text-white"
              />
            </div>
            <div>
              <label className="block text-sm text-gray-300 mb-2">Email de contact</label>
              <input
                type="email"
                defaultValue="contact@decorahome.fr"
                className="w-full bg-slate-600/50 border border-slate-500 rounded-xl px-4 py-2 text-white"
              />
            </div>
            <button className="w-full bg-gray-600 hover:bg-gray-700 text-white py-2 rounded-xl transition-all">
              Sauvegarder
            </button>
          </div>
        </div>

        <div className="bg-slate-700/50 backdrop-blur-xl rounded-2xl p-6 border border-slate-600/50">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 bg-blue-500 rounded-2xl flex items-center justify-center">
              <Globe className="w-6 h-6 text-white" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-white">Domaine</h3>
              <p className="text-gray-300 text-sm">Configuration DNS</p>
            </div>
          </div>
          <div className="space-y-4">
            <div className="bg-green-500/20 border border-green-400/50 rounded-xl p-4">
              <h4 className="font-semibold text-green-200 mb-2">🌐 Domaine actuel :</h4>
              <p className="text-green-300 text-sm">decorahome.omnia.sale</p>
              <p className="text-green-400 text-xs">✓ SSL actif • ✓ DNS configuré</p>
            </div>
            <button className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 rounded-xl transition-all">
              Gérer le domaine
            </button>
          </div>
        </div>
      </div>

      {/* Système Status */}
      <div className="bg-slate-700/50 backdrop-blur-xl rounded-2xl p-8 border border-slate-600/50">
        <h3 className="text-xl font-bold text-white mb-6">État du Système</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="flex items-center gap-3 p-4 bg-green-500/20 rounded-xl border border-green-400/30">
            <CheckCircle className="w-6 h-6 text-green-400" />
            <div>
              <div className="font-semibold text-white">API OmnIA</div>
              <div className="text-sm text-green-300">Opérationnel</div>
            </div>
          </div>
          
          <div className="flex items-center gap-3 p-4 bg-green-500/20 rounded-xl border border-green-400/30">
            <CheckCircle className="w-6 h-6 text-green-400" />
            <div>
              <div className="font-semibold text-white">Base de données</div>
              <div className="text-sm text-green-300">Connectée</div>
            </div>
          </div>
          
          <div className="flex items-center gap-3 p-4 bg-green-500/20 rounded-xl border border-green-400/30">
            <CheckCircle className="w-6 h-6 text-green-400" />
            <div>
              <div className="font-semibold text-white">Uptime</div>
              <div className="text-sm text-green-300">100%</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard': return renderDashboard();
      case 'ecommerce': return renderECommerce();
      case 'ads': return renderAdsMarketing();
      case 'vision': return renderVisionStudio();
      case 'seo': return renderSEO();
      case 'omnia': return renderOmnIABot();
      case 'analytics': return renderAnalytics();
      case 'admin': return renderAdmin();
      default: return renderDashboard();
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-purple-900">
      <NotificationSystem notifications={notifications} onRemove={removeNotification} />
      
      {/* Background Effects */}
      <div className="absolute inset-0 opacity-20">
        <div className="absolute top-20 left-20 w-72 h-72 bg-cyan-500/30 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-20 right-20 w-96 h-96 bg-purple-500/20 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '2s' }}></div>
      </div>

      <div className="relative z-10 flex h-screen">
        {/* Sidebar - Design exact de l'image */}
        <div className="w-64 bg-slate-800/90 backdrop-blur-2xl border-r border-slate-700/50 p-6">
          {/* Header avec logo */}
          <div className="flex items-center gap-3 mb-8">
            <div className="w-8 h-8 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-xl flex items-center justify-center">
              <Bot className="w-4 h-4 text-white" />
            </div>
            <div>
              <h1 className="text-lg font-bold text-white">OmnIA Admin</h1>
              <p className="text-xs text-cyan-300">Decora Home</p>
            </div>
          </div>

          {/* Navigation Menu - Style exact de l'image */}
          <nav className="space-y-2">
            {sidebarItems.map((item) => {
              const Icon = item.icon;
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all text-left ${
                    activeTab === item.id
                      ? 'bg-cyan-500/30 text-white border border-cyan-500/50'
                      : 'text-gray-300 hover:bg-slate-700/50 hover:text-white'
                  }`}
                >
                  <div className={`w-8 h-8 ${item.color} rounded-xl flex items-center justify-center`}>
                    <Icon className="w-4 h-4 text-white" />
                  </div>
                  <span className="font-medium text-sm">{item.label}</span>
                </button>
              );
            })}
          </nav>
        </div>

        {/* Main Content */}
        <div className="flex-1 flex flex-col">
          {/* Header - Style exact de l'image */}
          <div className="bg-slate-800/90 backdrop-blur-xl border-b border-slate-700/50 p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-xl flex items-center justify-center">
                  <Bot className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h1 className="text-xl font-bold text-white">OmnIA Admin</h1>
                  <p className="text-cyan-300 text-sm">Decora Home</p>
                </div>
              </div>
              
              <div className="flex items-center gap-4">
                <button
                  onClick={() => window.open('/robot', '_blank')}
                  className="bg-gradient-to-r from-purple-500 to-pink-600 hover:from-purple-400 hover:to-pink-500 text-white px-6 py-2 rounded-xl font-semibold transition-all flex items-center gap-2"
                >
                  <Bot className="w-4 h-4" />
                  Tester OmnIA
                </button>
                
                <button className="bg-slate-600 hover:bg-slate-700 text-white p-2 rounded-xl transition-all">
                  <Settings className="w-5 h-5" />
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

          {/* Content Area */}
          <div className="flex-1 overflow-y-auto p-8">
            {renderContent()}
          </div>
        </div>
      </div>
    </div>
  );
};