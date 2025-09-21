import React, { useState, useEffect } from 'react';
import {
  Users, Database, CheckCircle, AlertCircle, CreditCard, Receipt,
  TrendingUp, MessageSquare, ShoppingCart, Upload, Download,
  Bot, Globe, FileText, Eye, Settings, Store, LogOut, BarChart3, Brain,
  Clock, Star, X, ShoppingBag, Search, Zap, Target, PenTool, Image, Plus,
  Megaphone, DollarSign, Palette, Monitor, Smartphone, Tablet, Edit, Trash2,
  ExternalLink, Mail, Phone, MapPin, Calendar, Filter, RefreshCw, Save, Package, Sparkles,
  Menu
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
  const [activeSubTab, setActiveSubTab] = useState('');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
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
  const [blogPosts, setBlogPosts] = useState([
    { id: 1, title: 'Tendances mobilier 2025', status: 'published', views: 1234, date: '2025-01-10' },
    { id: 2, title: 'Guide aménagement salon', status: 'draft', views: 0, date: '2025-01-08' },
    { id: 3, title: 'Couleurs tendance décoration', status: 'published', views: 892, date: '2025-01-05' }
  ]);
  const [adCampaigns, setAdCampaigns] = useState([
    { id: 1, name: 'Canapés Hiver 2025', status: 'active', budget: 500, spent: 347, roas: 4.2 },
    { id: 2, name: 'Tables Design', status: 'paused', budget: 300, spent: 156, roas: 3.8 },
    { id: 3, name: 'Mobilier Bureau', status: 'active', budget: 200, spent: 89, roas: 5.1 }
  ]);

  const sidebarItems = [
    { id: 'dashboard', label: 'Dashboard', icon: BarChart3, color: 'bg-cyan-500' },
    { 
      id: 'ecommerce', 
      label: 'E-Commerce', 
      icon: ShoppingCart, 
      color: 'bg-green-500',
      subItems: [
        { id: 'catalog', label: 'Catalogue', icon: Package },
        { id: 'products', label: 'Produits', icon: ShoppingBag },
        { id: 'inventory', label: 'Inventaire', icon: Database },
        { id: 'orders', label: 'Commandes', icon: Receipt }
      ]
    },
    { 
      id: 'ads', 
      label: 'Ads & Marketing', 
      icon: Target, 
      color: 'bg-blue-500',
      subItems: [
        { id: 'google-ads', label: 'Google Ads', icon: Target },
        { id: 'social-media', label: 'Réseaux Sociaux', icon: Megaphone },
        { id: 'email-marketing', label: 'Email Marketing', icon: Mail },
        { id: 'budget', label: 'Budget', icon: DollarSign }
      ]
    },
    { 
      id: 'vision', 
      label: 'Vision & Studio', 
      icon: Eye, 
      color: 'bg-pink-500',
      subItems: [
        { id: 'ar-studio', label: 'AR Studio', icon: Eye },
        { id: 'photo-studio', label: 'Studio Photo', icon: Image },
        { id: 'video-studio', label: 'Studio Vidéo', icon: Monitor },
        { id: 'ai-generator', label: 'Générateur IA', icon: Sparkles }
      ]
    },
    { 
      id: 'seo', 
      label: 'SEO', 
      icon: Search, 
      color: 'bg-purple-500',
      subItems: [
        { id: 'keywords', label: 'Mots-clés', icon: Search },
        { id: 'blog', label: 'Blog', icon: FileText },
        { id: 'content', label: 'Contenu', icon: Edit },
        { id: 'performance', label: 'Performance', icon: TrendingUp }
      ]
    },
    { id: 'omnia', label: 'OmnIA Bot', icon: Bot, color: 'bg-purple-600' },
    { 
      id: 'analytics', 
      label: 'Analytics', 
      icon: BarChart3, 
      color: 'bg-orange-500',
      subItems: [
        { id: 'overview', label: 'Vue d\'ensemble', icon: BarChart3 },
        { id: 'conversations', label: 'Conversations', icon: MessageSquare },
        { id: 'sales', label: 'Ventes', icon: TrendingUp },
        { id: 'reports', label: 'Rapports', icon: FileText }
      ]
    },
    { 
      id: 'admin', 
      label: 'Admin', 
      icon: Settings, 
      color: 'bg-gray-500',
      subItems: [
        { id: 'settings', label: 'Paramètres', icon: Settings },
        { id: 'users', label: 'Utilisateurs', icon: Users },
        { id: 'domain', label: 'Domaine', icon: Globe },
        { id: 'billing', label: 'Facturation', icon: CreditCard }
      ]
    }
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

  const handleTabClick = (tabId: string) => {
    setActiveTab(tabId);
    setActiveSubTab('');
  };

  const handleSubTabClick = (subTabId: string) => {
    setActiveSubTab(subTabId);
  };

  const renderGoogleAds = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-xl font-bold text-white">Campagnes Google Ads</h3>
        <button className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-xl flex items-center gap-2">
          <Plus className="w-4 h-4" />
          Nouvelle campagne
        </button>
      </div>
      
      <div className="bg-slate-700/50 backdrop-blur-xl rounded-2xl border border-slate-600/50 overflow-hidden">
        <table className="w-full">
          <thead className="bg-slate-800/50">
            <tr>
              <th className="text-left p-4 text-cyan-300">Campagne</th>
              <th className="text-left p-4 text-cyan-300">Statut</th>
              <th className="text-left p-4 text-cyan-300">Budget</th>
              <th className="text-left p-4 text-cyan-300">Dépensé</th>
              <th className="text-left p-4 text-cyan-300">ROAS</th>
              <th className="text-left p-4 text-cyan-300">Actions</th>
            </tr>
          </thead>
          <tbody>
            {adCampaigns.map((campaign) => (
              <tr key={campaign.id} className="border-b border-slate-600/30">
                <td className="p-4 text-white font-medium">{campaign.name}</td>
                <td className="p-4">
                  <span className={`px-3 py-1 rounded-full text-xs ${
                    campaign.status === 'active' ? 'bg-green-500/20 text-green-300' : 'bg-yellow-500/20 text-yellow-300'
                  }`}>
                    {campaign.status}
                  </span>
                </td>
                <td className="p-4 text-white">€{campaign.budget}</td>
                <td className="p-4 text-orange-400">€{campaign.spent}</td>
                <td className="p-4 text-green-400 font-bold">{campaign.roas}x</td>
                <td className="p-4">
                  <div className="flex gap-2">
                    <button className="text-blue-400 hover:text-blue-300"><Edit className="w-4 h-4" /></button>
                    <button className="text-red-400 hover:text-red-300"><Trash2 className="w-4 h-4" /></button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );

  const renderBlogManagement = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-xl font-bold text-white">Gestion du Blog</h3>
        <button className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-xl flex items-center gap-2">
          <Plus className="w-4 h-4" />
          Nouvel article
        </button>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        <div className="bg-blue-600/20 rounded-xl p-4 border border-blue-500/30">
          <div className="text-2xl font-bold text-white">{blogPosts.length}</div>
          <div className="text-blue-300">Articles totaux</div>
        </div>
        <div className="bg-green-600/20 rounded-xl p-4 border border-green-500/30">
          <div className="text-2xl font-bold text-white">{blogPosts.filter(p => p.status === 'published').length}</div>
          <div className="text-green-300">Publiés</div>
        </div>
        <div className="bg-orange-600/20 rounded-xl p-4 border border-orange-500/30">
          <div className="text-2xl font-bold text-white">{blogPosts.reduce((sum, p) => sum + p.views, 0)}</div>
          <div className="text-orange-300">Vues totales</div>
        </div>
      </div>
      
      <div className="bg-slate-700/50 backdrop-blur-xl rounded-2xl border border-slate-600/50 overflow-hidden">
        <table className="w-full">
          <thead className="bg-slate-800/50">
            <tr>
              <th className="text-left p-4 text-cyan-300">Article</th>
              <th className="text-left p-4 text-cyan-300">Statut</th>
              <th className="text-left p-4 text-cyan-300">Vues</th>
              <th className="text-left p-4 text-cyan-300">Date</th>
              <th className="text-left p-4 text-cyan-300">Actions</th>
            </tr>
          </thead>
          <tbody>
            {blogPosts.map((post) => (
              <tr key={post.id} className="border-b border-slate-600/30">
                <td className="p-4 text-white font-medium">{post.title}</td>
                <td className="p-4">
                  <span className={`px-3 py-1 rounded-full text-xs ${
                    post.status === 'published' ? 'bg-green-500/20 text-green-300' : 'bg-yellow-500/20 text-yellow-300'
                  }`}>
                    {post.status}
                  </span>
                </td>
                <td className="p-4 text-white">{post.views}</td>
                <td className="p-4 text-gray-300">{new Date(post.date).toLocaleDateString('fr-FR')}</td>
                <td className="p-4">
                  <div className="flex gap-2">
                    <button className="text-blue-400 hover:text-blue-300"><Edit className="w-4 h-4" /></button>
                    <button className="text-green-400 hover:text-green-300"><Eye className="w-4 h-4" /></button>
                    <button className="text-red-400 hover:text-red-300"><Trash2 className="w-4 h-4" /></button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );

  const renderSocialMedia = () => (
    <div className="space-y-6">
      <h3 className="text-xl font-bold text-white">Réseaux Sociaux</h3>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-blue-600/20 rounded-xl p-4 border border-blue-500/30">
          <div className="text-2xl font-bold text-white">12.5k</div>
          <div className="text-blue-300">Followers Facebook</div>
        </div>
        <div className="bg-pink-600/20 rounded-xl p-4 border border-pink-500/30">
          <div className="text-2xl font-bold text-white">8.2k</div>
          <div className="text-pink-300">Followers Instagram</div>
        </div>
        <div className="bg-cyan-600/20 rounded-xl p-4 border border-cyan-500/30">
          <div className="text-2xl font-bold text-white">3.1k</div>
          <div className="text-cyan-300">Followers LinkedIn</div>
        </div>
        <div className="bg-green-600/20 rounded-xl p-4 border border-green-500/30">
          <div className="text-2xl font-bold text-white">8.5%</div>
          <div className="text-green-300">Engagement moyen</div>
        </div>
      </div>
      
      <div className="bg-slate-700/50 backdrop-blur-xl rounded-2xl p-6 border border-slate-600/50">
        <h4 className="text-lg font-bold text-white mb-4">Posts programmés</h4>
        <div className="space-y-3">
          <div className="flex items-center justify-between p-3 bg-slate-600/50 rounded-xl">
            <div>
              <div className="text-white font-medium">Nouvelle collection printemps</div>
              <div className="text-gray-300 text-sm">Facebook, Instagram • Demain 14h00</div>
            </div>
            <button className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded-lg text-sm">Modifier</button>
          </div>
          <div className="flex items-center justify-between p-3 bg-slate-600/50 rounded-xl">
            <div>
              <div className="text-white font-medium">Conseils aménagement salon</div>
              <div className="text-gray-300 text-sm">LinkedIn • Vendredi 10h00</div>
            </div>
            <button className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded-lg text-sm">Modifier</button>
          </div>
        </div>
      </div>
    </div>
  );

  const renderARStudio = () => (
    <div className="space-y-6">
      <h3 className="text-xl font-bold text-white">AR/VR Studio</h3>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-slate-700/50 backdrop-blur-xl rounded-2xl p-6 border border-slate-600/50">
          <h4 className="text-lg font-bold text-white mb-4">Modèles 3D</h4>
          <div className="space-y-3">
            <div className="flex items-center justify-between p-3 bg-slate-600/50 rounded-xl">
              <div>
                <div className="text-white font-medium">Canapé ALYANA</div>
                <div className="text-gray-300 text-sm">Modèle 3D prêt</div>
              </div>
              <span className="bg-green-500/20 text-green-300 px-2 py-1 rounded text-xs">Actif</span>
            </div>
            <div className="flex items-center justify-between p-3 bg-slate-600/50 rounded-xl">
              <div>
                <div className="text-white font-medium">Table AUREA</div>
                <div className="text-gray-300 text-sm">En cours de création</div>
              </div>
              <span className="bg-yellow-500/20 text-yellow-300 px-2 py-1 rounded text-xs">En cours</span>
            </div>
          </div>
          <button className="w-full mt-4 bg-pink-600 hover:bg-pink-700 text-white py-2 rounded-xl">
            Créer nouveau modèle 3D
          </button>
        </div>
        
        <div className="bg-slate-700/50 backdrop-blur-xl rounded-2xl p-6 border border-slate-600/50">
          <h4 className="text-lg font-bold text-white mb-4">Expériences AR</h4>
          <div className="space-y-3">
            <div className="bg-pink-500/20 border border-pink-400/50 rounded-xl p-4">
              <h5 className="font-semibold text-pink-200 mb-2">🥽 Fonctionnalités :</h5>
              <ul className="text-pink-300 text-sm space-y-1">
                <li>• Placement virtuel dans l'espace</li>
                <li>• Essai couleurs et matériaux</li>
                <li>• Mesures automatiques</li>
                <li>• Partage expérience client</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const renderKeywords = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-xl font-bold text-white">Mots-clés SEO</h3>
        <button className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-xl flex items-center gap-2">
          <Plus className="w-4 h-4" />
          Ajouter mot-clé
        </button>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
        <div className="bg-green-600/20 rounded-xl p-4 border border-green-500/30">
          <div className="text-2xl font-bold text-white">47</div>
          <div className="text-green-300">Top 10</div>
        </div>
        <div className="bg-blue-600/20 rounded-xl p-4 border border-blue-500/30">
          <div className="text-2xl font-bold text-white">3.2</div>
          <div className="text-blue-300">Position moy.</div>
        </div>
        <div className="bg-purple-600/20 rounded-xl p-4 border border-purple-500/30">
          <div className="text-2xl font-bold text-white">+23%</div>
          <div className="text-purple-300">Trafic organique</div>
        </div>
        <div className="bg-orange-600/20 rounded-xl p-4 border border-orange-500/30">
          <div className="text-2xl font-bold text-white">156</div>
          <div className="text-orange-300">Mots-clés suivis</div>
        </div>
      </div>
      
      <div className="bg-slate-700/50 backdrop-blur-xl rounded-2xl p-6 border border-slate-600/50">
        <h4 className="text-lg font-bold text-white mb-4">Top mots-clés</h4>
        <div className="space-y-3">
          {[
            { keyword: 'canapé moderne', position: 2, volume: 1200, difficulty: 'Moyen' },
            { keyword: 'table travertin', position: 1, volume: 800, difficulty: 'Facile' },
            { keyword: 'mobilier design', position: 4, volume: 2100, difficulty: 'Difficile' },
            { keyword: 'chaise bureau', position: 3, volume: 950, difficulty: 'Moyen' }
          ].map((kw, index) => (
            <div key={index} className="flex items-center justify-between p-3 bg-slate-600/50 rounded-xl">
              <div>
                <div className="text-white font-medium">{kw.keyword}</div>
                <div className="text-gray-300 text-sm">Volume: {kw.volume} • Difficulté: {kw.difficulty}</div>
              </div>
              <div className="text-right">
                <div className="text-cyan-400 font-bold">#{kw.position}</div>
                <div className="text-gray-300 text-sm">Position</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  const renderConversationsAnalytics = () => (
    <div className="space-y-6">
      <h3 className="text-xl font-bold text-white">Analytics Conversations</h3>
      
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
        <div className="bg-blue-600/20 rounded-xl p-4 border border-blue-500/30">
          <div className="text-2xl font-bold text-white">1,234</div>
          <div className="text-blue-300">Conversations totales</div>
        </div>
        <div className="bg-green-600/20 rounded-xl p-4 border border-green-500/30">
          <div className="text-2xl font-bold text-white">42%</div>
          <div className="text-green-300">Taux conversion</div>
        </div>
        <div className="bg-purple-600/20 rounded-xl p-4 border border-purple-500/30">
          <div className="text-2xl font-bold text-white">4m 12s</div>
          <div className="text-purple-300">Durée moyenne</div>
        </div>
        <div className="bg-orange-600/20 rounded-xl p-4 border border-orange-500/30">
          <div className="text-2xl font-bold text-white">98%</div>
          <div className="text-orange-300">Satisfaction</div>
        </div>
      </div>
      
      <ConversationHistory />
    </div>
  );

  const renderUserManagement = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-xl font-bold text-white">Gestion Utilisateurs</h3>
        <button className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-xl flex items-center gap-2">
          <Plus className="w-4 h-4" />
          Inviter utilisateur
        </button>
      </div>
      
      <div className="bg-slate-700/50 backdrop-blur-xl rounded-2xl border border-slate-600/50 overflow-hidden">
        <table className="w-full">
          <thead className="bg-slate-800/50">
            <tr>
              <th className="text-left p-4 text-cyan-300">Utilisateur</th>
              <th className="text-left p-4 text-cyan-300">Rôle</th>
              <th className="text-left p-4 text-cyan-300">Dernière connexion</th>
              <th className="text-left p-4 text-cyan-300">Statut</th>
              <th className="text-left p-4 text-cyan-300">Actions</th>
            </tr>
          </thead>
          <tbody>
            <tr className="border-b border-slate-600/30">
              <td className="p-4">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-cyan-500 rounded-full flex items-center justify-center">
                    <span className="text-white font-bold text-sm">AD</span>
                  </div>
                  <div>
                    <div className="text-white font-medium">Admin Principal</div>
                    <div className="text-gray-300 text-sm">admin@decorahome.fr</div>
                  </div>
                </div>
              </td>
              <td className="p-4">
                <span className="bg-red-500/20 text-red-300 px-2 py-1 rounded text-xs">Propriétaire</span>
              </td>
              <td className="p-4 text-white">Maintenant</td>
              <td className="p-4">
                <span className="bg-green-500/20 text-green-300 px-2 py-1 rounded text-xs">Actif</span>
              </td>
              <td className="p-4">
                <div className="flex gap-2">
                  <button className="text-blue-400 hover:text-blue-300"><Edit className="w-4 h-4" /></button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );

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
        <div className="flex gap-2">
          <button
            onClick={() => setActiveSubTab('catalog')}
            className={`px-4 py-2 rounded-xl transition-all ${
              activeSubTab === 'catalog' ? 'bg-cyan-500 text-white' : 'bg-slate-600 text-gray-300 hover:bg-slate-500'
            }`}
          >
            Catalogue
          </button>
          <button
            onClick={() => setActiveSubTab('products')}
            className={`px-4 py-2 rounded-xl transition-all ${
              activeSubTab === 'products' ? 'bg-cyan-500 text-white' : 'bg-slate-600 text-gray-300 hover:bg-slate-500'
            }`}
          >
            Produits
          </button>
          <button
            onClick={() => setActiveSubTab('inventory')}
            className={`px-4 py-2 rounded-xl transition-all ${
              activeSubTab === 'inventory' ? 'bg-cyan-500 text-white' : 'bg-slate-600 text-gray-300 hover:bg-slate-500'
            }`}
          >
            Inventaire
          </button>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 bg-green-400 rounded-full animate-pulse"></div>
          <span className="text-green-300 text-sm">{stats.products} produits actifs</span>
        </div>
      </div>

      {activeSubTab === 'catalog' || !activeSubTab ? <CatalogManagement /> : null}
      {activeSubTab === 'products' ? <ProductsEnrichedTable /> : null}
      {activeSubTab === 'inventory' ? (
        <div className="bg-slate-700/50 backdrop-blur-xl rounded-2xl p-6 border border-slate-600/50">
          <h3 className="text-lg font-bold text-white mb-4">Gestion Inventaire</h3>
          <p className="text-gray-300">Module inventaire en développement...</p>
        </div>
      ) : null}
    </div>
  );

  const renderAdsMarketing = () => (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-white">Ads & Marketing</h2>
        <div className="flex gap-2">
          <button
            onClick={() => setActiveSubTab('google-ads')}
            className={`px-4 py-2 rounded-xl transition-all ${
              activeSubTab === 'google-ads' ? 'bg-cyan-500 text-white' : 'bg-slate-600 text-gray-300 hover:bg-slate-500'
            }`}
          >
            Google Ads
          </button>
          <button
            onClick={() => setActiveSubTab('social-media')}
            className={`px-4 py-2 rounded-xl transition-all ${
              activeSubTab === 'social-media' ? 'bg-cyan-500 text-white' : 'bg-slate-600 text-gray-300 hover:bg-slate-500'
            }`}
          >
            Réseaux Sociaux
          </button>
          <button
            onClick={() => setActiveSubTab('email-marketing')}
            className={`px-4 py-2 rounded-xl transition-all ${
              activeSubTab === 'email-marketing' ? 'bg-cyan-500 text-white' : 'bg-slate-600 text-gray-300 hover:bg-slate-500'
            }`}
          >
            Email
          </button>
        </div>
      </div>
      
      {activeSubTab === 'google-ads' || !activeSubTab ? renderGoogleAds() : null}
      {activeSubTab === 'social-media' ? renderSocialMedia() : null}
      {activeSubTab === 'email-marketing' ? (
        <div className="bg-slate-700/50 backdrop-blur-xl rounded-2xl p-6 border border-slate-600/50">
          <h3 className="text-lg font-bold text-white mb-4">Email Marketing</h3>
          <p className="text-gray-300">Module email marketing en développement...</p>
        </div>
      ) : null}
    </div>
  );

  const renderVisionStudio = () => (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-white">Vision & Studio</h2>
        <div className="flex gap-2">
          <button
            onClick={() => setActiveSubTab('ar-studio')}
            className={`px-4 py-2 rounded-xl transition-all ${
              activeSubTab === 'ar-studio' ? 'bg-cyan-500 text-white' : 'bg-slate-600 text-gray-300 hover:bg-slate-500'
            }`}
          >
            AR Studio
          </button>
          <button
            onClick={() => setActiveSubTab('photo-studio')}
            className={`px-4 py-2 rounded-xl transition-all ${
              activeSubTab === 'photo-studio' ? 'bg-cyan-500 text-white' : 'bg-slate-600 text-gray-300 hover:bg-slate-500'
            }`}
          >
            Studio Photo
          </button>
        </div>
      </div>
      
      {activeSubTab === 'ar-studio' || !activeSubTab ? renderARStudio() : null}
      {activeSubTab === 'photo-studio' ? (
        <div className="bg-slate-700/50 backdrop-blur-xl rounded-2xl p-6 border border-slate-600/50">
          <h3 className="text-lg font-bold text-white mb-4">Studio Photo IA</h3>
          <p className="text-gray-300">Génération d'images produits avec IA en développement...</p>
        </div>
      ) : null}
    </div>
  );

  const renderSEO = () => (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-white">SEO & Content</h2>
        <div className="flex gap-2">
          <button
            onClick={() => setActiveSubTab('keywords')}
            className={`px-4 py-2 rounded-xl transition-all ${
              activeSubTab === 'keywords' ? 'bg-cyan-500 text-white' : 'bg-slate-600 text-gray-300 hover:bg-slate-500'
            }`}
          >
            Mots-clés
          </button>
          <button
            onClick={() => setActiveSubTab('blog')}
            className={`px-4 py-2 rounded-xl transition-all ${
              activeSubTab === 'blog' ? 'bg-cyan-500 text-white' : 'bg-slate-600 text-gray-300 hover:bg-slate-500'
            }`}
          >
            Blog
          </button>
          <button
            onClick={() => setActiveSubTab('performance')}
            className={`px-4 py-2 rounded-xl transition-all ${
              activeSubTab === 'performance' ? 'bg-cyan-500 text-white' : 'bg-slate-600 text-gray-300 hover:bg-slate-500'
            }`}
          >
            Performance
          </button>
        </div>
      </div>
      
      {activeSubTab === 'keywords' || !activeSubTab ? renderKeywords() : null}
      {activeSubTab === 'blog' ? renderBlogManagement() : null}
      {activeSubTab === 'performance' ? (
        <div className="bg-slate-700/50 backdrop-blur-xl rounded-2xl p-6 border border-slate-600/50">
          <h3 className="text-lg font-bold text-white mb-4">Performance SEO</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="text-3xl font-bold text-green-400">87/100</div>
              <div className="text-gray-300">Score SEO</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-blue-400">92/100</div>
              <div className="text-gray-300">Vitesse site</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-green-400">✓</div>
              <div className="text-gray-300">Mobile-friendly</div>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );

  const renderAnalytics = () => (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-white">Analytics</h2>
        <div className="flex gap-2">
          <button
            onClick={() => setActiveSubTab('overview')}
            className={`px-4 py-2 rounded-xl transition-all ${
              activeSubTab === 'overview' ? 'bg-cyan-500 text-white' : 'bg-slate-600 text-gray-300 hover:bg-slate-500'
            }`}
          >
            Vue d'ensemble
          </button>
          <button
            onClick={() => setActiveSubTab('conversations')}
            className={`px-4 py-2 rounded-xl transition-all ${
              activeSubTab === 'conversations' ? 'bg-cyan-500 text-white' : 'bg-slate-600 text-gray-300 hover:bg-slate-500'
            }`}
          >
            Conversations
          </button>
          <button
            onClick={() => setActiveSubTab('sales')}
            className={`px-4 py-2 rounded-xl transition-all ${
              activeSubTab === 'sales' ? 'bg-cyan-500 text-white' : 'bg-slate-600 text-gray-300 hover:bg-slate-500'
            }`}
          >
            Ventes
          </button>
        </div>
      </div>
      
      {activeSubTab === 'overview' || !activeSubTab ? (
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
      ) : null}
      {activeSubTab === 'conversations' ? renderConversationsAnalytics() : null}
      {activeSubTab === 'sales' ? (
        <div className="bg-slate-700/50 backdrop-blur-xl rounded-2xl p-6 border border-slate-600/50">
          <h3 className="text-lg font-bold text-white mb-4">Analytics Ventes</h3>
          <p className="text-gray-300">Module analytics ventes en développement...</p>
        </div>
      ) : null}
    </div>
  );

  const renderAdmin = () => (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-white">Administration</h2>
        <div className="flex gap-2">
          <button
            onClick={() => setActiveSubTab('settings')}
            className={`px-4 py-2 rounded-xl transition-all ${
              activeSubTab === 'settings' ? 'bg-cyan-500 text-white' : 'bg-slate-600 text-gray-300 hover:bg-slate-500'
            }`}
          >
            Paramètres
          </button>
          <button
            onClick={() => setActiveSubTab('users')}
            className={`px-4 py-2 rounded-xl transition-all ${
              activeSubTab === 'users' ? 'bg-cyan-500 text-white' : 'bg-slate-600 text-gray-300 hover:bg-slate-500'
            }`}
          >
            Utilisateurs
          </button>
          <button
            onClick={() => setActiveSubTab('domain')}
            className={`px-4 py-2 rounded-xl transition-all ${
              activeSubTab === 'domain' ? 'bg-cyan-500 text-white' : 'bg-slate-600 text-gray-300 hover:bg-slate-500'
            }`}
          >
            Domaine
          </button>
        </div>
      </div>
      
      {activeSubTab === 'settings' || !activeSubTab ? (
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
      ) : null}
      {activeSubTab === 'users' ? renderUserManagement() : null}
      {activeSubTab === 'domain' ? (
        <div className="bg-slate-700/50 backdrop-blur-xl rounded-2xl p-6 border border-slate-600/50">
          <h3 className="text-lg font-bold text-white mb-4">Gestion Domaine</h3>
          <div className="space-y-4">
            <div className="bg-green-500/20 border border-green-400/50 rounded-xl p-4">
              <h4 className="font-semibold text-green-200 mb-2">🌐 Domaine principal :</h4>
              <p className="text-green-300">decorahome.omnia.sale</p>
              <p className="text-green-400 text-sm">✓ Actif depuis le 15/12/2024</p>
            </div>
            <div className="bg-blue-500/20 border border-blue-400/50 rounded-xl p-4">
              <h4 className="font-semibold text-blue-200 mb-2">🔒 Certificat SSL :</h4>
              <p className="text-blue-300">Let's Encrypt • Expire le 15/03/2025</p>
              <p className="text-blue-400 text-sm">✓ Renouvellement automatique</p>
            </div>
            <div className="bg-purple-500/20 border border-purple-400/50 rounded-xl p-4">
              <h4 className="font-semibold text-purple-200 mb-2">📊 Statistiques DNS :</h4>
              <p className="text-purple-300">Temps de réponse : 45ms</p>
              <p className="text-purple-400 text-sm">✓ Propagation mondiale complète</p>
            </div>
          </div>
        </div>
      ) : null}

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
                <div key={item.id}>
                  <button
                    onClick={() => handleTabClick(item.id)}
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
                  
                  {/* Sous-menus */}
                  {item.subItems && activeTab === item.id && (
                    <div className="ml-12 mt-2 space-y-1">
                      {item.subItems.map((subItem) => {
                        const SubIcon = subItem.icon;
                        return (
                          <button
                            key={subItem.id}
                            onClick={() => handleSubTabClick(subItem.id)}
                            className={`w-full flex items-center gap-2 px-3 py-2 rounded-lg transition-all text-left text-sm ${
                              activeSubTab === subItem.id
                                ? 'bg-cyan-400/20 text-cyan-300'
                                : 'text-gray-400 hover:bg-slate-700/30 hover:text-gray-300'
                            }`}
                          >
                            <SubIcon className="w-3 h-3" />
                            <span>{subItem.label}</span>
                          </button>
                        );
                      })}
                    </div>
                  )}
                </div>
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