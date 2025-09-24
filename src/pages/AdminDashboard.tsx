import React, { useState, useEffect } from 'react';
import {
  Users, Database, CheckCircle, AlertCircle, CreditCard, Receipt,
  TrendingUp, MessageSquare, ShoppingCart, Upload, Download,
  Brain, LogOut, Loader2, Settings,
  DollarSign, Plus, X, Package, Target, Search, Mail, Mic, Image, Sparkles,
  Megaphone, Palette, Monitor, Smartphone, Tablet, Edit, Trash2, Clock,
  Bot
} from 'lucide-react';
import { Logo } from '../components/Logo';
import { EcommerceIntegration } from '../components/EcommerceIntegration';
import { ShopifyAdminConnector } from '../components/ShopifyAdminConnector';
import { AITrainingInterface } from '../components/AITrainingInterface';
import { OmniaRobotTab } from '../components/OmniaRobotTab';
import { CatalogManagement } from '../components/CatalogManagement';
import { MLTrainingDashboard } from '../components/MLTrainingDashboard';
import { ProductsEnrichedTable } from '../components/ProductsEnrichedTable';
import { ProductDetailModal } from '../components/ProductDetailModal';
import { AddProductModal } from '../components/AddProductModal';
import { ConversationHistory } from '../components/ConversationHistory';
import { MessagingSystem } from '../components/MessagingSystem';
import { SpeechToTextInterface } from '../components/SpeechToTextInterface';
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

interface ConnectedPlatform {
  id: string;
  name: string;
  platform: string;
  products_count: number;
  status: string;
  connected_at: string;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({ onLogout }) => {
  const { notifications, showSuccess, showError, showInfo, removeNotification } = useNotifications();
  
  const [currentUser, setCurrentUser] = useState(() => {
    // Récupérer l'utilisateur connecté depuis localStorage
    const loggedUser = localStorage.getItem('current_logged_user');
    if (loggedUser) {
      try {
        const user = JSON.parse(loggedUser);
        console.log('👤 Utilisateur connecté:', user.company_name || user.email);
        return user;
      } catch {
        return null;
      }
    }
    return null;
  });

  // Générer un ID unique pour chaque revendeur basé sur son email
  const getRetailerStorageKey = (key: string) => {
    if (!currentUser?.email) return key;
    const emailHash = btoa(currentUser.email).replace(/[^a-zA-Z0-9]/g, '').substring(0, 8);
    return `${key}_${emailHash}`;
  };
  
  const [activeTab, setActiveTab] = useState('dashboard');
  const [showCreateOrder, setShowCreateOrder] = useState(false);
  const [orders, setOrders] = useState(() => {
    const savedOrders = localStorage.getItem(getRetailerStorageKey('orders'));
    return savedOrders ? JSON.parse(savedOrders) : [];
  });
  const [newOrder, setNewOrder] = useState({
    customer_name: '',
    customer_email: '',
    customer_address: '',
    customer_phone: '',
    payment_method: 'card',
    products: [],
    total: 0,
    status: 'pending'
  });
  const [activeSubTab, setActiveSubTab] = useState('');
  const [stats, setStats] = useState<DashboardStats>({
    conversations: 1234,
    conversions: 42,
    products: 247,
    revenue: 45600,
    visitors: 89,
    sessionDuration: '4m 12s'
  });
  const [connectedPlatforms, setConnectedPlatforms] = useState<ConnectedPlatform[]>([]);
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
        { id: 'enriched', label: 'Produits Enrichis', icon: Brain },
        { id: 'inventory', label: 'Inventaire', icon: Eye },
        { id: 'robot', label: 'Robot OmnIA', icon: Bot },
        { id: 'orders', label: 'Commandes', icon: ShoppingCart },
        { id: 'conversations', label: 'Conversations', icon: MessageSquare },
        { id: 'analytics', label: 'Analytics', icon: BarChart3 },
        { id: 'marketing', label: 'Marketing', icon: TrendingUp },
        { id: 'google-merchant', label: 'Google Merchant', icon: Globe },
        { id: 'training', label: 'Entraînement IA', icon: Zap },
        { id: 'messages', label: 'Messagerie', icon: Mail },
        { id: 'stt', label: 'Speech-to-Text', icon: Mic },
        { id: 'integrations', label: 'Intégrations', icon: Database }
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

  useEffect(() => {
    if (!currentUser) return;
    
    // Charger les données spécifiques au revendeur connecté
    const savedPlatforms = localStorage.getItem(getRetailerStorageKey('connected_platforms'));
    if (savedPlatforms) {
      try {
        setConnectedPlatforms(JSON.parse(savedPlatforms));
      } catch (error) {
        console.error('Erreur chargement plateformes:', error);
      }
    }
    
    // Charger les stats spécifiques au revendeur
    const savedStats = localStorage.getItem(getRetailerStorageKey('retailer_stats'));
    if (savedStats) {
      try {
        setStats(JSON.parse(savedStats));
      } catch (error) {
        console.error('Erreur chargement stats:', error);
      }
    }
  }, [currentUser]);

  const handlePlatformConnected = (platformData: any) => {
    const newPlatform: ConnectedPlatform = {
      id: Date.now().toString(),
      ...platformData,
      connected_at: new Date().toISOString()
    };
    
    const updatedPlatforms = [...connectedPlatforms, newPlatform];
    setConnectedPlatforms(updatedPlatforms);
    
    // Sauvegarder pour ce revendeur spécifique
    localStorage.setItem(getRetailerStorageKey('connected_platforms'), JSON.stringify(updatedPlatforms));
    
    showSuccess('Plateforme connectée', `${platformData.name} connecté avec succès !`);
    
    // Mettre à jour les stats
    const newStats = {
      ...stats,
      products: platformData.products_count || 0
    };
    setStats(newStats);
    localStorage.setItem(getRetailerStorageKey('retailer_stats'), JSON.stringify(newStats));
  };

  const handleDisconnectPlatform = (platformId: string) => {
    const updatedPlatforms = connectedPlatforms.filter(p => p.id !== platformId);
    setConnectedPlatforms(updatedPlatforms);
    localStorage.setItem(getRetailerStorageKey('connected_platforms'), JSON.stringify(updatedPlatforms));
    showSuccess('Plateforme déconnectée', 'Plateforme supprimée avec succès.');
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

  const renderInventory = () => {
    const products = JSON.parse(localStorage.getItem(getRetailerStorageKey('catalog_products')) || '[]');
    
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-white">Inventaire Produits</h2>
            <p className="text-gray-300">{products.length} produit(s) en stock</p>
          </div>
        </div>

        <div className="bg-white/10 backdrop-blur-xl rounded-2xl border border-white/20 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-black/20">
                <tr>
                  <th className="text-left p-4 text-cyan-300 font-semibold">Photo</th>
                  <th className="text-left p-4 text-cyan-300 font-semibold">Titre</th>
                  <th className="text-left p-4 text-cyan-300 font-semibold">SKU</th>
                  <th className="text-left p-4 text-cyan-300 font-semibold">Prix</th>
                  <th className="text-left p-4 text-cyan-300 font-semibold">Disponibilité</th>
                  <th className="text-left p-4 text-cyan-300 font-semibold">Quantité</th>
                  <th className="text-left p-4 text-cyan-300 font-semibold">Statut</th>
                </tr>
              </thead>
              <tbody>
                {products.map((product: any) => (
                  <tr key={product.id} className="border-b border-white/10 hover:bg-white/5">
                    <td className="p-4">
                      <div className="w-16 h-16 rounded-lg overflow-hidden bg-gray-600">
                        <img 
                          src={product.image_url || 'https://images.pexels.com/photos/1350789/pexels-photo-1350789.jpeg'} 
                          alt={product.name}
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            const target = e.target as HTMLImageElement;
                            target.src = 'https://images.pexels.com/photos/1350789/pexels-photo-1350789.jpeg';
                          }}
                        />
                      </div>
                    </td>
                    <td className="p-4">
                      <div className="font-semibold text-white">{product.name || product.title}</div>
                      <div className="text-gray-400 text-sm">{product.category}</div>
                    </td>
                    <td className="p-4">
                      <span className="text-cyan-400 font-mono text-sm">{product.sku || 'N/A'}</span>
                    </td>
                    <td className="p-4">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-green-400">{product.price}€</span>
                        {product.compare_at_price && product.compare_at_price > product.price && (
                          <span className="text-gray-400 line-through text-sm">{product.compare_at_price}€</span>
                        )}
                      </div>
                    </td>
                    <td className="p-4">
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                        product.stock > 0 ? 'bg-green-500/20 text-green-300' : 'bg-red-500/20 text-red-300'
                      }`}>
                        {product.stock > 0 ? 'En stock' : 'Rupture'}
                      </span>
                    </td>
                    <td className="p-4">
                      <span className={`font-semibold ${product.stock > 0 ? 'text-green-400' : 'text-red-400'}`}>
                        {product.stock || 0}
                      </span>
                    </td>
                    <td className="p-4">
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                        product.status === 'active' ? 'bg-green-500/20 text-green-300' : 'bg-yellow-500/20 text-yellow-300'
                      }`}>
                        {product.status || 'active'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {products.length === 0 && (
          <div className="text-center py-20">
            <Package className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-bold text-white mb-2">Inventaire vide</h3>
            <p className="text-gray-400">Importez votre catalogue pour voir l'inventaire</p>
          </div>
        )}
      </div>
    );
  };

  const renderOrders = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-white">Gestion des Commandes</h2>
          <p className="text-gray-300">{orders.length} commande(s) • OmnIA Robot + Manuelles</p>
        </div>
        <button
          onClick={() => setShowCreateOrder(true)}
          className="bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-400 hover:to-emerald-500 text-white px-6 py-3 rounded-xl font-semibold transition-all flex items-center gap-2"
        >
          <Plus className="w-5 h-5" />
          Commande manuelle
        </button>
      </div>

      <div className="bg-white/10 backdrop-blur-xl rounded-2xl border border-white/20 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-black/20">
              <tr>
                <th className="text-left p-4 text-cyan-300 font-semibold">ID</th>
                <th className="text-left p-4 text-cyan-300 font-semibold">Client</th>
                <th className="text-left p-4 text-cyan-300 font-semibold">Produits</th>
                <th className="text-left p-4 text-cyan-300 font-semibold">Total</th>
                <th className="text-left p-4 text-cyan-300 font-semibold">Paiement</th>
                <th className="text-left p-4 text-cyan-300 font-semibold">Statut</th>
                <th className="text-left p-4 text-cyan-300 font-semibold">Source</th>
                <th className="text-left p-4 text-cyan-300 font-semibold">Date</th>
              </tr>
            </thead>
            <tbody>
              {orders.map((order: any) => (
                <tr key={order.id} className="border-b border-white/10 hover:bg-white/5">
                  <td className="p-4">
                    <span className="text-cyan-400 font-mono text-sm">#{order.id.substring(0, 8)}</span>
                  </td>
                  <td className="p-4">
                    <div>
                      <div className="font-semibold text-white">{order.customer_name}</div>
                      <div className="text-gray-400 text-sm">{order.customer_email}</div>
                    </div>
                  </td>
                  <td className="p-4">
                    <span className="text-white">{order.products?.length || 0} article(s)</span>
                  </td>
                  <td className="p-4">
                    <span className="font-bold text-green-400">{order.total}€</span>
                  </td>
                  <td className="p-4">
                    <span className="text-gray-300">{order.payment_method}</span>
                  </td>
                  <td className="p-4">
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                      order.status === 'completed' ? 'bg-green-500/20 text-green-300' :
                      order.status === 'pending' ? 'bg-yellow-500/20 text-yellow-300' :
                      'bg-red-500/20 text-red-300'
                    }`}>
                      {order.status}
                    </span>
                  </td>
                  <td className="p-4">
                    <span className={`px-2 py-1 rounded text-xs ${
                      order.source === 'omnia_robot' ? 'bg-blue-500/20 text-blue-300' : 'bg-purple-500/20 text-purple-300'
                    }`}>
                      {order.source === 'omnia_robot' ? 'OmnIA Robot' : 'Manuel'}
                    </span>
                  </td>
                  <td className="p-4">
                    <span className="text-gray-300 text-sm">
                      {new Date(order.created_at).toLocaleDateString('fr-FR')}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {orders.length === 0 && (
        <div className="text-center py-20">
          <ShoppingCart className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-xl font-bold text-white mb-2">Aucune commande</h3>
          <p className="text-gray-400">Les commandes OmnIA Robot et manuelles apparaîtront ici</p>
        </div>
      )}

      {/* Modal création commande manuelle */}
      {showCreateOrder && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-800/95 backdrop-blur-xl rounded-2xl p-6 max-w-md w-full border border-slate-600/50">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-white">Nouvelle commande manuelle</h3>
              <button
                onClick={() => setShowCreateOrder(false)}
                className="text-gray-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm text-gray-300 mb-2">Nom client</label>
                <input
                  type="text"
                  value={newOrder.customer_name}
                  onChange={(e) => setNewOrder(prev => ({ ...prev, customer_name: e.target.value }))}
                  className="w-full bg-black/40 border border-gray-600 rounded-xl px-4 py-3 text-white"
                  placeholder="Jean Dupont"
                />
              </div>
              
              <div>
                <label className="block text-sm text-gray-300 mb-2">Email</label>
                <input
                  type="email"
                  value={newOrder.customer_email}
                  onChange={(e) => setNewOrder(prev => ({ ...prev, customer_email: e.target.value }))}
                  className="w-full bg-black/40 border border-gray-600 rounded-xl px-4 py-3 text-white"
                  placeholder="jean@email.com"
                />
              </div>
              
              <div>
                <label className="block text-sm text-gray-300 mb-2">Adresse</label>
                <input
                  type="text"
                  value={newOrder.customer_address}
                  onChange={(e) => setNewOrder(prev => ({ ...prev, customer_address: e.target.value }))}
                  className="w-full bg-black/40 border border-gray-600 rounded-xl px-4 py-3 text-white"
                  placeholder="123 Rue de la Paix, 75001 Paris"
                />
              </div>
              
              <div>
                <label className="block text-sm text-gray-300 mb-2">Mode de paiement</label>
                <select
                  value={newOrder.payment_method}
                  onChange={(e) => setNewOrder(prev => ({ ...prev, payment_method: e.target.value }))}
                  className="w-full bg-black/40 border border-gray-600 rounded-xl px-4 py-3 text-white"
                >
                  <option value="card">Carte bancaire</option>
                  <option value="cash">Espèces</option>
                  <option value="check">Chèque</option>
                  <option value="transfer">Virement</option>
                </select>
              </div>
              
              <div className="flex gap-3">
                <button
                  onClick={() => setShowCreateOrder(false)}
                  className="flex-1 bg-gray-600 hover:bg-gray-700 text-white py-3 rounded-xl transition-all"
                >
                  Annuler
                </button>
                <button
                  onClick={() => {
                    const order = {
                      ...newOrder,
                      id: Date.now().toString(),
                      source: 'manual',
                      created_at: new Date().toISOString()
                    };
                    const updatedOrders = [order, ...orders];
                    setOrders(updatedOrders);
                    localStorage.setItem(getRetailerStorageKey('orders'), JSON.stringify(updatedOrders));
                    setShowCreateOrder(false);
                    setNewOrder({
                      customer_name: '',
                      customer_email: '',
                      customer_address: '',
                      customer_phone: '',
                      payment_method: 'card',
                      products: [],
                      total: 0,
                      status: 'pending'
                    });
                  }}
                  className="flex-1 bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-400 hover:to-emerald-500 text-white py-3 rounded-xl font-semibold transition-all"
                >
                  Créer
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );

  const renderGoogleMerchant = () => {
    const [googleProducts, setGoogleProducts] = useState(() => {
      const saved = localStorage.getItem(getRetailerStorageKey('google_merchant_products'));
      return saved ? JSON.parse(saved) : [];
    });
    const [categoryMapping, setCategoryMapping] = useState(() => {
      const saved = localStorage.getItem(getRetailerStorageKey('google_category_mapping'));
      return saved ? JSON.parse(saved) : [];
    });
    const [showMappingImport, setShowMappingImport] = useState(false);
    const [isGeneratingXML, setIsGeneratingXML] = useState(false);
    
    const generateGoogleMerchantFeed = () => {
      setIsGeneratingXML(true);
      
      // Récupérer les produits enrichis
      const enrichedProducts = JSON.parse(localStorage.getItem(getRetailerStorageKey('enriched_products')) || '[]');
      
      const googleFeedProducts = enrichedProducts.map((product: any) => ({
        id: `${currentUser?.company_name?.toLowerCase().replace(/[^a-z0-9]/g, '')}-${product.id}`,
        title: product.title,
        description: product.seo_description || product.description || product.title,
        item_group_id: product.handle || product.id,
        link: product.product_url || `https://${currentUser?.company_name?.toLowerCase()}.omnia.sale/products/${product.handle}`,
        product_type: `Mobilier &gt; ${product.product_type} &gt; ${product.subcategory || product.product_type}`,
        google_product_category: mapToGoogleCategory(product.product_type, categoryMapping),
        image_link: product.image_url,
        condition: 'new',
        availability: product.stock_quantity > 0 ? 'in stock' : 'out of stock',
        price: `${product.price}.00 EUR`,
        sale_price: product.compare_at_price ? `${product.compare_at_price}.00 EUR` : null,
        mpn: product.mpn || `${product.handle}-${new Date().getFullYear()}`,
        brand: product.brand || currentUser?.company_name || 'Boutique',
        canonical_link: product.product_url,
        additional_image_link_1: product.additional_image_links?.[0] || '',
        additional_image_link_2: product.additional_image_links?.[1] || '',
        additional_image_link_3: product.additional_image_links?.[2] || '',
        additional_image_link_4: product.additional_image_links?.[3] || '',
        product_length: product.dimensions?.includes('L') ? product.dimensions.split('x')[0] + ' cm' : '',
        product_width: product.dimensions?.includes('x') ? product.dimensions.split('x')[1] + ' cm' : '',
        percent_off: product.percent_off || 0,
        material: product.material || '',
        gtin: product.gtin || '',
        color: product.color || '',
        quantity: product.stock_quantity || 0,
        size: product.capacity || '',
        identifier_exists: product.gtin ? 'yes' : 'no'
      }));
      
      setGoogleProducts(googleFeedProducts);
      localStorage.setItem(getRetailerStorageKey('google_merchant_products'), JSON.stringify(googleFeedProducts));
      
      setTimeout(() => {
        setIsGeneratingXML(false);
        showSuccess('Flux généré', `${googleFeedProducts.length} produits ajoutés au flux Google Merchant !`);
      }, 2000);
    };
    
    const mapToGoogleCategory = (productType: string, mapping: any[]) => {
      const match = mapping.find(m => m.category === productType);
      return match?.google_product_category || 'Furniture';
    };
    
    const generateXMLFile = () => {
      const xmlContent = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:g="http://base.google.com/ns/1.0">
  <channel>
    <title>${currentUser?.company_name || 'Boutique'} - Flux Google Shopping</title>
    <link>https://${currentUser?.company_name?.toLowerCase().replace(/[^a-z0-9]/g, '') || 'boutique'}.omnia.sale</link>
    <description>Flux produits Google Shopping pour ${currentUser?.company_name || 'Boutique'}</description>
    ${googleProducts.map((product: any) => `
    <item>
      <g:id>${product.id}</g:id>
      <g:title><![CDATA[${product.title}]]></g:title>
      <g:description><![CDATA[${product.description}]]></g:description>
      <g:link>${product.link}</g:link>
      <g:image_link>${product.image_link}</g:image_link>
      <g:condition>${product.condition}</g:condition>
      <g:availability>${product.availability}</g:availability>
      <g:price>${product.price}</g:price>
      ${product.sale_price ? `<g:sale_price>${product.sale_price}</g:sale_price>` : ''}
      <g:brand>${product.brand}</g:brand>
      <g:product_type>${product.product_type}</g:product_type>
      <g:google_product_category>${product.google_product_category}</g:google_product_category>
      <g:mpn>${product.mpn}</g:mpn>
      <g:gtin>${product.gtin}</g:gtin>
      <g:color>${product.color}</g:color>
      <g:material>${product.material}</g:material>
      <g:identifier_exists>${product.identifier_exists}</g:identifier_exists>
    </item>`).join('')}
  </channel>
</rss>`;
      
      const blob = new Blob([xmlContent], { type: 'application/xml' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `flux-google-${currentUser?.company_name?.toLowerCase().replace(/[^a-z0-9]/g, '') || 'boutique'}.xml`;
      a.click();
      URL.revokeObjectURL(url);
    };

    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-white">Google Merchant Center</h2>
            <p className="text-gray-300">Flux XML Google Shopping pour {currentUser?.company_name || 'votre boutique'}</p>
          </div>
          <div className="flex gap-3">
            <button
              onClick={generateGoogleMerchantFeed}
              disabled={isGeneratingXML}
              className="bg-gradient-to-r from-blue-500 to-cyan-600 hover:from-blue-400 hover:to-cyan-500 disabled:from-gray-600 disabled:to-gray-700 text-white px-6 py-3 rounded-xl font-semibold transition-all flex items-center gap-2"
            >
              {isGeneratingXML ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Génération...
                </>
              ) : (
                <>
                  <RefreshCw className="w-5 h-5" />
                  Générer flux
                </>
              )}
            </button>
            {googleProducts.length > 0 && (
              <button
                onClick={generateXMLFile}
                className="bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-400 hover:to-emerald-500 text-white px-6 py-3 rounded-xl font-semibold transition-all flex items-center gap-2"
              >
                <Download className="w-5 h-5" />
                Télécharger XML
              </button>
            )}
          </div>
        </div>

        {/* URL du flux */}
        <div className="bg-blue-500/20 border border-blue-400/50 rounded-xl p-6">
          <h3 className="font-semibold text-blue-200 mb-4 flex items-center gap-2">
            <Globe className="w-5 h-5" />
            URL de votre flux Google Shopping
          </h3>
          <div className="bg-black/40 rounded-xl p-4 border border-blue-500/30">
            <code className="text-blue-400 text-sm">
              https://omnia.sale/fluxgoogle/{currentUser?.company_name?.toLowerCase().replace(/[^a-z0-9]/g, '') || 'boutique'}.xml
            </code>
          </div>
          <p className="text-blue-300 text-sm mt-3">
            Utilisez cette URL dans Google Merchant Center pour importer automatiquement vos produits
          </p>
        </div>

        {/* Mapping des catégories */}
        <div className="bg-white/10 backdrop-blur-xl rounded-2xl p-6 border border-white/20">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-bold text-white">Mapping Catégories Google</h3>
            <button
              onClick={() => setShowMappingImport(true)}
              className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-3 rounded-xl flex items-center gap-2"
            >
              <Upload className="w-4 h-4" />
              Importer CSV
            </button>
          </div>
          
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-black/20">
                <tr>
                  <th className="text-left p-3 text-cyan-300 font-semibold">Code catégorie</th>
                  <th className="text-left p-3 text-cyan-300 font-semibold">Catégorie principale</th>
                  <th className="text-left p-3 text-cyan-300 font-semibold">Sous-catégorie</th>
                  <th className="text-left p-3 text-cyan-300 font-semibold">Google Product Category</th>
                </tr>
              </thead>
              <tbody>
                {categoryMapping.map((mapping: any, index: number) => (
                  <tr key={index} className="border-b border-white/10">
                    <td className="p-3 text-white">{mapping.code}</td>
                    <td className="p-3 text-white">{mapping.category}</td>
                    <td className="p-3 text-gray-300">{mapping.subcategory}</td>
                    <td className="p-3 text-cyan-400">{mapping.google_product_category}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          
          {categoryMapping.length === 0 && (
            <div className="text-center py-8">
              <Tag className="w-12 h-12 text-gray-400 mx-auto mb-3" />
              <p className="text-gray-400">Aucun mapping de catégorie configuré</p>
              <p className="text-gray-500 text-sm">Importez un fichier CSV pour configurer le mapping</p>
            </div>
          )}
        </div>

        {/* Tableau Google Merchant */}
        <div className="bg-white/10 backdrop-blur-xl rounded-2xl border border-white/20 overflow-hidden">
          <div className="p-6 border-b border-white/10">
            <h3 className="text-xl font-bold text-white">Produits Google Merchant ({googleProducts.length})</h3>
          </div>
          
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-black/20">
                <tr>
                  <th className="text-left p-3 text-cyan-300 font-semibold">ID</th>
                  <th className="text-left p-3 text-cyan-300 font-semibold">Titre</th>
                  <th className="text-left p-3 text-cyan-300 font-semibold">Catégorie Google</th>
                  <th className="text-left p-3 text-cyan-300 font-semibold">Prix</th>
                  <th className="text-left p-3 text-cyan-300 font-semibold">Disponibilité</th>
                  <th className="text-left p-3 text-cyan-300 font-semibold">GTIN</th>
                  <th className="text-left p-3 text-cyan-300 font-semibold">Couleur</th>
                  <th className="text-left p-3 text-cyan-300 font-semibold">Matériau</th>
                </tr>
              </thead>
              <tbody>
                {googleProducts.map((product: any) => (
                  <tr key={product.id} className="border-b border-white/10 hover:bg-white/5">
                    <td className="p-3 text-cyan-400 font-mono">{product.id.substring(0, 20)}...</td>
                    <td className="p-3 text-white">{product.title.substring(0, 40)}...</td>
                    <td className="p-3 text-purple-300">{product.google_product_category}</td>
                    <td className="p-3 text-green-400 font-bold">{product.price}</td>
                    <td className="p-3">
                      <span className={`px-2 py-1 rounded text-xs ${
                        product.availability === 'in stock' ? 'bg-green-500/20 text-green-300' : 'bg-red-500/20 text-red-300'
                      }`}>
                        {product.availability}
                      </span>
                    </td>
                    <td className="p-3 text-gray-300">{product.gtin || 'N/A'}</td>
                    <td className="p-3 text-blue-300">{product.color || 'N/A'}</td>
                    <td className="p-3 text-orange-300">{product.material || 'N/A'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Guide d'importation */}
        <div className="bg-gradient-to-r from-green-500/20 to-blue-600/20 backdrop-blur-xl rounded-2xl p-6 border border-green-400/30">
          <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-green-400" />
            Guide d'importation Google Merchant
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h4 className="font-semibold text-green-300 mb-2">📋 Étapes d'importation :</h4>
              <ol className="text-green-200 text-sm space-y-1">
                <li>1. Connectez-vous à Google Merchant Center</li>
                <li>2. Allez dans "Produits" → "Flux"</li>
                <li>3. Cliquez "Ajouter un flux"</li>
                <li>4. Sélectionnez "Flux programmé"</li>
                <li>5. Collez l'URL de votre flux XML</li>
                <li>6. Configurez la fréquence (quotidienne recommandée)</li>
              </ol>
            </div>
            <div>
              <h4 className="font-semibold text-green-300 mb-2">✅ Avantages du flux automatique :</h4>
              <ul className="text-green-200 text-sm space-y-1">
                <li>• Synchronisation automatique des prix</li>
                <li>• Mise à jour des stocks en temps réel</li>
                <li>• Nouveaux produits ajoutés automatiquement</li>
                <li>• Optimisation SEO avec DeepSeek</li>
                <li>• Catégories Google mappées correctement</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Modal import mapping */}
        {showMappingImport && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-slate-800/95 backdrop-blur-xl rounded-2xl p-6 max-w-md w-full border border-slate-600/50">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-bold text-white">Import Mapping Catégories</h3>
                <button
                  onClick={() => setShowMappingImport(false)}
                  className="text-gray-400 hover:text-white"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              
              <div className="space-y-4">
                <div className="bg-blue-500/20 border border-blue-400/50 rounded-xl p-4">
                  <h4 className="font-semibold text-blue-200 mb-2">📄 Format CSV attendu :</h4>
                  <code className="text-blue-400 text-sm block">
                    code,category,subcategory,google_product_category
                  </code>
                  <div className="mt-2 text-xs text-blue-300">
                    <p>Exemple :</p>
                    <p>CAN001,Canapé,Canapé d'angle,Furniture &gt; Living Room Furniture &gt; Sofas</p>
                  </div>
                </div>
                
                <input
                  type="file"
                  accept=".csv"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) {
                      const reader = new FileReader();
                      reader.onload = (event) => {
                        const csv = event.target?.result as string;
                        const lines = csv.split('\n');
                        const headers = lines[0].split(',');
                        const mappings = lines.slice(1).map(line => {
                          const values = line.split(',');
                          return {
                            code: values[0],
                            category: values[1],
                            subcategory: values[2],
                            google_product_category: values[3]
                          };
                        }).filter(m => m.code);
                        
                        setCategoryMapping(mappings);
                        localStorage.setItem(getRetailerStorageKey('google_category_mapping'), JSON.stringify(mappings));
                        setShowMappingImport(false);
                        showSuccess('Mapping importé', `${mappings.length} catégories mappées !`);
                      };
                      reader.readAsText(file);
                    }
                  }}
                  className="w-full bg-black/40 border border-gray-600 rounded-xl px-4 py-3 text-white file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-cyan-50 file:text-cyan-700 hover:file:bg-cyan-100"
                />
                
                <button
                  onClick={() => setShowMappingImport(false)}
                  className="w-full bg-gray-600 hover:bg-gray-700 text-white py-3 rounded-xl transition-all"
                >
                  Fermer
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    );
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
            onClick={() => setActiveSubTab('enriched')}
            className={`px-4 py-2 rounded-xl transition-all ${
              activeSubTab === 'enriched' ? 'bg-cyan-500 text-white' : 'bg-slate-600 text-gray-300 hover:bg-slate-500'
            }`}
          >
            Produits Enrichis
          </button>
          <button
            onClick={() => setActiveSubTab('inventory')}
            className={`px-4 py-2 rounded-xl transition-all ${
              activeSubTab === 'inventory' ? 'bg-cyan-500 text-white' : 'bg-slate-600 text-gray-300 hover:bg-slate-500'
            }`}
          >
            Inventaire
          </button>
          <button
            onClick={() => setActiveSubTab('robot')}
            className={`px-4 py-2 rounded-xl transition-all ${
              activeSubTab === 'robot' ? 'bg-cyan-500 text-white' : 'bg-slate-600 text-gray-300 hover:bg-slate-500'
            }`}
          >
            Robot OmnIA
          </button>
          <button
            onClick={() => setActiveSubTab('orders')}
            className={`px-4 py-2 rounded-xl transition-all ${
              activeSubTab === 'orders' ? 'bg-cyan-500 text-white' : 'bg-slate-600 text-gray-300 hover:bg-slate-500'
            }`}
          >
            Commandes
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
            onClick={() => setActiveSubTab('training')}
            className={`px-4 py-2 rounded-xl transition-all ${
              activeSubTab === 'training' ? 'bg-cyan-500 text-white' : 'bg-slate-600 text-gray-300 hover:bg-slate-500'
            }`}
          >
            Entraînement IA
          </button>
          <button
            onClick={() => setActiveSubTab('messages')}
            className={`px-4 py-2 rounded-xl transition-all ${
              activeSubTab === 'messages' ? 'bg-cyan-500 text-white' : 'bg-slate-600 text-gray-300 hover:bg-slate-500'
            }`}
          >
            Messagerie
          </button>
          <button
            onClick={() => setActiveSubTab('stt')}
            className={`px-4 py-2 rounded-xl transition-all ${
              activeSubTab === 'stt' ? 'bg-cyan-500 text-white' : 'bg-slate-600 text-gray-300 hover:bg-slate-500'
            }`}
          >
            Speech-to-Text
          </button>
          <button
            onClick={() => setActiveSubTab('integrations')}
            className={`px-4 py-2 rounded-xl transition-all ${
              activeSubTab === 'integrations' ? 'bg-cyan-500 text-white' : 'bg-slate-600 text-gray-300 hover:bg-slate-500'
            }`}
          >
            Intégrations
          </button>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 bg-green-400 rounded-full animate-pulse"></div>
          <span className="text-green-300 text-sm">{stats.products} produits actifs</span>
        </div>
      </div>

      {activeSubTab === 'catalog' || !activeSubTab ? <CatalogManagement /> : null}
      {activeSubTab === 'enriched' ? <ProductsEnrichedTable /> : null}
      {activeSubTab === 'inventory' ? renderInventory() : null}
      {activeSubTab === 'robot' ? <OmniaRobotTab /> : null}
      {activeSubTab === 'orders' ? renderOrders() : null}
      {activeSubTab === 'conversations' ? <ConversationHistory /> : null}
      {activeSubTab === 'training' ? <MLTrainingDashboard /> : null}
      {activeSubTab === 'messages' ? <MessagingSystem /> : null}
      {activeSubTab === 'stt' ? <SpeechToTextInterface /> : null}
      {activeSubTab === 'integrations' ? <EcommerceIntegration onConnected={handlePlatformConnected} /> : null}
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
                  defaultValue={currentUser?.company_name || "Decora Home"}
                  className="w-full bg-slate-600/50 border border-slate-500 rounded-xl px-4 py-2 text-white"
                />
              </div>
              <div>
                <label className="block text-sm text-gray-300 mb-2">Email de contact</label>
                <input
                  type="email"
                  defaultValue={currentUser?.email || "contact@decorahome.fr"}
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
                <p className="text-green-300 text-sm">{currentUser?.company_name?.toLowerCase().replace(/[^a-z0-9]/g, '') || 'boutique'}.omnia.sale</p>
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
              <p className="text-green-300">{currentUser?.company_name?.toLowerCase().replace(/[^a-z0-9]/g, '') || 'boutique'}.omnia.sale</p>
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
              <p className="text-xs text-cyan-300">{currentUser?.company_name || 'Revendeur'}</p>
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
                  <h1 className="text-xl font-bold text-white">
                    Admin {currentUser?.company_name || 'Revendeur'}
                  </h1>
                  <p className="text-cyan-300">
                    Interface de gestion OmnIA • {currentUser?.plan || 'Plan'} • {currentUser?.email}
                  </p>
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

export default AdminDashboard;