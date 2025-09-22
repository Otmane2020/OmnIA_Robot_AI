```typescript
import React, { useState, useEffect } from 'react';
import {
  BarChart3, Package, Store, Bot, MessageSquare,
  Settings, LogOut, Users, ShoppingCart, TrendingUp,
  Mail, Mic, Brain, Search, Globe, FileText, Share2,
  DollarSign, Target, Instagram, Facebook, Youtube,
  PieChart, Calculator, Zap, ExternalLink, Upload,
  Eye, Edit, Trash2, Plus, RefreshCw, Download,
  CheckCircle, AlertCircle, Clock, Star, Palette,
  Image, Link, Megaphone, Camera, Video, Calendar
} from 'lucide-react';
import { CatalogManagement } from '../components/CatalogManagement';
import { ProductsEnrichedTable } from '../components/ProductsEnrichedTable';
import { ConversationHistory } from '../components/ConversationHistory';
import { EcommerceIntegration } from '../components/EcommerceIntegration';
import { AITrainingInterface } from '../components/AITrainingInterface';
import { MLTrainingDashboard } from '../components/MLTrainingDashboard';
import { MessagingSystem } from '../components/MessagingSystem';
import { SpeechToTextInterface } from '../components/SpeechToTextInterface';
import { OmniaRobotTab } from '../components/OmniaRobotTab';
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

  // Menu structure according to specifications
  const menuItems = [
    {
      id: 'dashboard',
      label: 'Dashboard',
      icon: BarChart3,
      subItems: []
    },
    {
      id: 'ecommerce',
      label: 'E-Commerce',
      icon: Store,
      subItems: [
        { id: 'catalog', label: 'Catalogue', icon: Package },
        { id: 'products-enriched', label: 'Produits Enrichis', icon: Brain },
        { id: 'inventory', label: 'Inventaire', icon: Package }
      ]
    },
    {
      id: 'omnia-bot',
      label: 'OmnIA Bot',
      icon: Bot,
      subItems: [
        { id: 'robot', label: 'Robot OmnIA', icon: Bot },
        { id: 'conversations', label: 'Conversations', icon: MessageSquare },
        { id: 'speech-to-text', label: 'Speech-to-Text', icon: Mic }
      ]
    },
    {
      id: 'ads-marketing',
      label: 'Ads & Marketing',
      icon: Megaphone,
      subItems: [
        { id: 'analytics', label: 'Analytics', icon: BarChart3 },
        { id: 'marketing', label: 'Marketing', icon: TrendingUp },
        {
          id: 'google-ads',
          label: 'Google Ads',
          icon: Search,
          subItems: [
            { id: 'google-ads-analytics', label: 'Analytics', icon: BarChart3 },
            { id: 'google-ads-integration', label: 'Intégration', icon: Link },
            { id: 'google-ads-campaigns', label: 'Campagnes publicitaires', icon: Target },
            { id: 'google-ads-optimization', label: 'Optimisation', icon: Zap }
          ]
        }
      ]
    },
    {
      id: 'google-merchant',
      label: 'Google Merchant',
      icon: Globe,
      subItems: [
        { id: 'google-merchant-feed', label: 'Flux XML', icon: FileText },
        { id: 'google-merchant-guide', label: 'Guide d\'importation', icon: Upload }
      ]
    },
    {
      id: 'seo',
      label: 'SEO',
      icon: Search,
      subItems: [
        { id: 'seo-blog', label: 'Blog & Articles', icon: FileText },
        { id: 'seo-auto-blogging', label: 'Auto Blogging', icon: Calendar },
        { id: 'seo-backlinks', label: 'Backlinks', icon: Link },
        { id: 'seo-integration', label: 'Intégration', icon: Share2 },
        { id: 'seo-optimization', label: 'Optimisation SEO', icon: Zap }
      ]
    },
    {
      id: 'social-media',
      label: 'Réseaux Sociaux',
      icon: Share2,
      subItems: [
        { id: 'social-analytics', label: 'Analytics', icon: BarChart3 },
        { id: 'social-facebook', label: 'Intégration Facebook', icon: Facebook },
        { id: 'social-instagram', label: 'Intégration Instagram', icon: Instagram },
        { id: 'social-ads', label: 'Ads Management', icon: Target },
        { id: 'social-auto-posting', label: 'Auto-posting', icon: Calendar },
        { id: 'social-catalog', label: 'Catalogue Facebook', icon: Package }
      ]
    },
    {
      id: 'budgets',
      label: 'Budgets',
      icon: DollarSign,
      subItems: [
        { id: 'budget-overview', label: 'Budget', icon: PieChart },
        { id: 'budget-ads', label: 'Répartition Ads', icon: Calculator },
        { id: 'budget-roi', label: 'ROI estimé vs réel', icon: TrendingUp }
      ]
    },
    {
      id: 'orders',
      label: 'Commandes',
      icon: ShoppingCart,
      subItems: []
    },
    {
      id: 'ai-training',
      label: 'Entraînement IA',
      icon: Brain,
      subItems: []
    },
    {
      id: 'admin',
      label: 'Admin',
      icon: Settings,
      subItems: [
        { id: 'messaging', label: 'Messagerie', icon: Mail }
      ]
    },
    {
      id: 'integrations',
      label: 'Intégrations',
      icon: Zap,
      subItems: []
    }
  ];

  const [expandedMenus, setExpandedMenus] = useState<string[]>(['ecommerce', 'omnia-bot']);

  const toggleMenu = (menuId: string) => {
    setExpandedMenus(prev =>
      prev.includes(menuId)
        ? prev.filter(id => id !== menuId)
        : [...prev, menuId]
    );
  };

  const renderMenuItem = (item: any, level = 0) => {
    const hasSubItems = item.subItems && item.subItems.length > 0;
    const isExpanded = expandedMenus.includes(item.id);
    const isActive = activeTab === item.id;
    const Icon = item.icon;

    return (
      <div key={item.id}>
        <button
          onClick={() => {
            if (hasSubItems) {
              toggleMenu(item.id);
            } else {
              setActiveTab(item.id);
            }
          }}
          className={`w-full flex items-center justify-between px-4 py-3 rounded-xl transition-all ${
            level === 0
              ? isActive
                ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30'
                : 'text-gray-300 hover:bg-white/10 hover:text-white'
              : level === 1
                ? isActive
                  ? 'bg-cyan-500/30 text-cyan-200 border border-cyan-400/40'
                  : 'text-gray-400 hover:bg-white/5 hover:text-gray-200'
                : isActive
                  ? 'bg-cyan-500/40 text-cyan-100 border border-cyan-300/50'
                  : 'text-gray-500 hover:bg-white/5 hover:text-gray-300'
          } ${level > 0 ? `ml-${level * 4}` : ''}`}
        >
          <div className="flex items-center gap-3">
            <Icon className={`w-5 h-5 ${level === 0 ? '' : 'w-4 h-4'}`} />
            <span className={`font-medium ${level === 0 ? 'text-sm' : 'text-xs'}`}>{item.label}</span>
          </div>
          {hasSubItems && (
            <div className={`transform transition-transform ${isExpanded ? 'rotate-180' : ''}`}>
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </div>
          )}
        </button>

        {hasSubItems && isExpanded && (
          <div className="mt-2 space-y-1">
            {item.subItems.map((subItem: any) => renderMenuItem(subItem, level + 1))}
          </div>
        )}
      </div>
    );
  };

  const renderDashboard = () => (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold text-white">Tableau de bord</h2>
          <p className="text-gray-300">Bienvenue {currentUser?.company_name || 'Revendeur'}</p>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 bg-green-400 rounded-full animate-pulse"></div>
          <span className="text-green-300 text-sm">OmnIA actif</span>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-blue-600/20 backdrop-blur-xl rounded-2xl p-6 border border-blue-500/30">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-blue-200 text-sm mb-1">Conversations</p>
              <p className="text-3xl font-bold text-white">1,234</p>
              <p className="text-blue-300 text-sm">+12% ce mois</p>
            </div>
            <MessageSquare className="w-10 h-10 text-blue-400" />
          </div>
        </div>

        <div className="bg-green-600/20 backdrop-blur-xl rounded-2xl p-6 border border-green-500/30">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-green-200 text-sm mb-1">Conversions</p>
              <p className="text-3xl font-bold text-white">42%</p>
              <p className="text-green-300 text-sm">+8% ce mois</p>
            </div>
            <TrendingUp className="w-10 h-10 text-green-400" />
          </div>
        </div>

        <div className="bg-purple-600/20 backdrop-blur-xl rounded-2xl p-6 border border-purple-500/30">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-purple-200 text-sm mb-1">Produits</p>
              <p className="text-3xl font-bold text-white">247</p>
              <p className="text-purple-300 text-sm">Catalogue actif</p>
            </div>
            <Package className="w-10 h-10 text-purple-400" />
          </div>
        </div>

        <div className="bg-orange-600/20 backdrop-blur-xl rounded-2xl p-6 border border-orange-500/30">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-orange-200 text-sm mb-1">Revenus</p>
              <p className="text-3xl font-bold text-white">€2.4k</p>
              <p className="text-orange-300 text-sm">Ce mois</p>
            </div>
            <DollarSign className="w-10 h-10 text-orange-400" />
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-white/10 backdrop-blur-xl rounded-2xl p-8 border border-white/20">
        <h3 className="text-xl font-bold text-white mb-6">Actions rapides</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <button
            onClick={() => setActiveTab('products-enriched')}
            className="bg-purple-600/20 hover:bg-purple-600/30 border border-purple-500/50 text-purple-300 p-4 rounded-xl transition-all hover:scale-105"
          >
            <Brain className="w-6 h-6 mx-auto mb-2" />
            <span className="text-sm font-medium">Enrichir Catalogue</span>
          </button>
          <button
            onClick={() => setActiveTab('robot')}
            className="bg-cyan-600/20 hover:bg-cyan-600/30 border border-cyan-500/50 text-cyan-300 p-4 rounded-xl transition-all hover:scale-105"
          >
            <Bot className="w-6 h-6 mx-auto mb-2" />
            <span className="text-sm font-medium">Configurer Robot</span>
          </button>
          <button
            onClick={() => setActiveTab('google-merchant-feed')}
            className="bg-green-600/20 hover:bg-green-600/30 border border-green-500/50 text-green-300 p-4 rounded-xl transition-all hover:scale-105"
          >
            <Globe className="w-6 h-6 mx-auto mb-2" />
            <span className="text-sm font-medium">Flux Google</span>
          </button>
          <button
            onClick={() => setActiveTab('seo-optimization')}
            className="bg-orange-600/20 hover:bg-orange-600/30 border border-orange-500/50 text-orange-300 p-4 rounded-xl transition-all hover:scale-105"
          >
            <Search className="w-6 h-6 mx-auto mb-2" />
            <span className="text-sm font-medium">Optimiser SEO</span>
          </button>
        </div>
      </div>
    </div>
  );

  const renderGoogleMerchantFeed = () => (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold text-white">Flux Google Merchant</h2>
          <p className="text-gray-300">Génération automatique du flux XML depuis les produits enrichis</p>
        </div>
        <div className="flex items-center gap-3">
          <button className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-xl flex items-center gap-2">
            <RefreshCw className="w-4 h-4" />
            Régénérer flux
          </button>
          <button className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-xl flex items-center gap-2">
            <Download className="w-4 h-4" />
            Télécharger XML
          </button>
        </div>
      </div>

      {/* Flux XML Info */}
      <div className="bg-white/10 backdrop-blur-xl rounded-2xl p-8 border border-white/20">
        <h3 className="text-xl font-bold text-white mb-6">URL du flux XML</h3>
        <div className="bg-black/40 rounded-xl p-4 border border-green-500/30 mb-4">
          <code className="text-green-400 text-sm block break-all">
            https://{currentUser?.company_name?.toLowerCase().replace(/[^a-z0-9]/g, '') || 'sweetdeco'}.omnia.sale/feed/xml/google-shopping.xml
          </code>
        </div>
        <p className="text-gray-300 text-sm">
          Ce flux est généré automatiquement depuis vos produits enrichis et mis à jour quotidiennement.
        </p>
      </div>

      {/* Champs inclus */}
      <div className="bg-white/10 backdrop-blur-xl rounded-2xl p-8 border border-white/20">
        <h3 className="text-xl font-bold text-white mb-6">Champs Google Shopping inclus</h3>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {[
            'id', 'title', 'description', 'item_group_id', 'link', 'product_type',
            'google_product_category', 'image_link', 'condition', 'availability',
            'price', 'sale_price', 'mpn', 'brand', 'canonical_link',
            'additional_image_link_1', 'additional_image_link_2', 'additional_image_link_3', 'additional_image_link_4',
            'product_length', 'product_width', 'percent_off', 'material',
            'gtin', 'color', 'quantity', 'size', 'identifier_exists'
          ].map((field) => (
            <div key={field} className="bg-black/20 rounded-lg p-3 border border-white/10">
              <span className="text-cyan-400 text-sm font-mono">{field}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-green-600/20 rounded-2xl p-6 border border-green-500/30">
          <div className="text-center">
            <div className="text-3xl font-bold text-white">247</div>
            <div className="text-green-300 text-sm">Produits dans le flux</div>
          </div>
        </div>
        <div className="bg-blue-600/20 rounded-2xl p-6 border border-blue-500/30">
          <div className="text-center">
            <div className="text-3xl font-bold text-white">98%</div>
            <div className="text-blue-300 text-sm">Champs complétés</div>
          </div>
        </div>
        <div className="bg-purple-600/20 rounded-2xl p-6 border border-purple-500/30">
          <div className="text-center">
            <div className="text-3xl font-bold text-white">Quotidien</div>
            <div className="text-purple-300 text-sm">Mise à jour auto</div>
          </div>
        </div>
      </div>
    </div>
  );

  const renderGoogleMerchantGuide = () => (
    <div className="space-y-8">
      <div>
        <h2 className="text-3xl font-bold text-white">Guide d'importation Google Merchant</h2>
        <p className="text-gray-300">Instructions pour importer votre flux dans Google Merchant Center</p>
      </div>

      <div className="bg-white/10 backdrop-blur-xl rounded-2xl p-8 border border-white/20">
        <h3 className="text-xl font-bold text-white mb-6">Étapes d'importation</h3>
        <div className="space-y-6">
          <div className="flex items-start gap-4">
            <div className="w-8 h-8 bg-cyan-500 rounded-full flex items-center justify-center text-white font-bold">1</div>
            <div>
              <h4 className="font-semibold text-white mb-2">Accéder à Google Merchant Center</h4>
              <p className="text-gray-300 text-sm">Connectez-vous à merchant.google.com avec votre compte Google</p>
            </div>
          </div>
          <div className="flex items-start gap-4">
            <div className="w-8 h-8 bg-cyan-500 rounded-full flex items-center justify-center text-white font-bold">2</div>
            <div>
              <h4 className="font-semibold text-white mb-2">Ajouter un flux de données</h4>
              <p className="text-gray-300 text-sm">Produits → Flux → Ajouter un flux → Flux planifié</p>
            </div>
          </div>
          <div className="flex items-start gap-4">
            <div className="w-8 h-8 bg-cyan-500 rounded-full flex items-center justify-center text-white font-bold">3</div>
            <div>
              <h4 className="font-semibold text-white mb-2">Configurer l'URL du flux</h4>
              <div className="bg-black/40 rounded-lg p-3 border border-cyan-500/30 mt-2">
                <code className="text-cyan-400 text-sm">
                  https://{currentUser?.company_name?.toLowerCase().replace(/[^a-z0-9]/g, '') || 'sweetdeco'}.omnia.sale/feed/xml/google-shopping.xml
                </code>
              </div>
            </div>
          </div>
          <div className="flex items-start gap-4">
            <div className="w-8 h-8 bg-cyan-500 rounded-full flex items-center justify-center text-white font-bold">4</div>
            <div>
              <h4 className="font-semibold text-white mb-2">Planifier la synchronisation</h4>
              <p className="text-gray-300 text-sm">Fréquence recommandée : Quotidienne à 3h00</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const renderSEOBlog = () => (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold text-white">Blog & Articles</h2>
          <p className="text-gray-300">Gestion des articles de blog pour le SEO</p>
        </div>
        <button className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-xl flex items-center gap-2">
          <Plus className="w-4 h-4" />
          Nouvel article
        </button>
      </div>

      <div className="bg-white/10 backdrop-blur-xl rounded-2xl border border-white/20 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-black/20">
              <tr>
                <th className="text-left p-4 text-cyan-300 font-semibold">Article</th>
                <th className="text-left p-4 text-cyan-300 font-semibold">Statut</th>
                <th className="text-left p-4 text-cyan-300 font-semibold">Mots-clés</th>
                <th className="text-left p-4 text-cyan-300 font-semibold">Date</th>
                <th className="text-left p-4 text-cyan-300 font-semibold">Actions</th>
              </tr>
            </thead>
            <tbody>
              <tr className="border-b border-white/10">
                <td className="p-4">
                  <div>
                    <div className="font-semibold text-white">Tendances mobilier 2025</div>
                    <div className="text-gray-400 text-sm">Guide complet des nouvelles tendances</div>
                  </div>
                </td>
                <td className="p-4">
                  <span className="bg-green-500/20 text-green-300 px-3 py-1 rounded-full text-xs">Publié</span>
                </td>
                <td className="p-4">
                  <div className="flex flex-wrap gap-1">
                    <span className="bg-blue-500/20 text-blue-300 px-2 py-1 rounded text-xs">mobilier 2025</span>
                    <span className="bg-purple-500/20 text-purple-300 px-2 py-1 rounded text-xs">tendances</span>
                  </div>
                </td>
                <td className="p-4">
                  <span className="text-gray-300 text-sm">15/01/2025</span>
                </td>
                <td className="p-4">
                  <div className="flex gap-2">
                    <button className="text-blue-400 hover:text-blue-300 p-1">
                      <Eye className="w-4 h-4" />
                    </button>
                    <button className="text-yellow-400 hover:text-yellow-300 p-1">
                      <Edit className="w-4 h-4" />
                    </button>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );

  const renderSEOOptimization = () => (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold text-white">Optimisation SEO</h2>
          <p className="text-gray-300">Gestion des métadonnées SEO des produits</p>
        </div>
        <div className="flex gap-3">
          <button className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-xl flex items-center gap-2">
            <Upload className="w-4 h-4" />
            Envoyer à Shopify
          </button>
          <button className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-xl flex items-center gap-2">
            <Calendar className="w-4 h-4" />
            Auto-export planifié
          </button>
        </div>
      </div>

      <div className="bg-white/10 backdrop-blur-xl rounded-2xl border border-white/20 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-black/20">
              <tr>
                <th className="text-left p-4 text-cyan-300 font-semibold">Image</th>
                <th className="text-left p-4 text-cyan-300 font-semibold">Title</th>
                <th className="text-left p-4 text-cyan-300 font-semibold">SEO Title</th>
                <th className="text-left p-4 text-cyan-300 font-semibold">SEO Description</th>
                <th className="text-left p-4 text-cyan-300 font-semibold">Image Alt</th>
                <th className="text-left p-4 text-cyan-300 font-semibold">Actions</th>
              </tr>
            </thead>
            <tbody>
              <tr className="border-b border-white/10">
                <td className="p-4">
                  <div className="w-12 h-12 rounded-lg overflow-hidden bg-gray-600">
                    <img
                      src="https://images.pexels.com/photos/1350789/pexels-photo-1350789.jpeg?auto=compress&cs=tinysrgb&w=100&h=100&fit=crop"
                      alt="Produit"
                      className="w-full h-full object-cover"
                    />
                  </div>
                </td>
                <td className="p-4">
                  <div className="font-semibold text-white text-sm">Canapé ALYANA</div>
                </td>
                <td className="p-4">
                  <div className="text-white text-sm">Canapé ALYANA Convertible - Velours Beige - Decora Home</div>
                </td>
                <td className="p-4">
                  <div className="text-gray-300 text-sm line-clamp-2">
                    Découvrez notre canapé ALYANA convertible en velours beige. Design moderne, confort optimal. Livraison gratuite. ⭐
                  </div>
                </td>
                <td className="p-4">
                  <div className="text-gray-300 text-sm">Canapé moderne beige convertible</div>
                </td>
                <td className="p-4">
                  <button className="bg-green-600 hover:bg-green-700 text-white px-3 py-2 rounded-lg text-sm flex items-center gap-2">
                    <Upload className="w-3 h-3" />
                    Envoyer à Shopify
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );

  const renderSocialMedia = () => (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold text-white">Réseaux Sociaux</h2>
          <p className="text-gray-300">Gestion des campagnes et intégrations sociales</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div className="bg-blue-600/20 backdrop-blur-xl rounded-2xl p-6 border border-blue-500/30">
          <div className="flex items-center gap-3 mb-4">
            <Facebook className="w-8 h-8 text-blue-400" />
            <h3 className="text-lg font-bold text-white">Facebook</h3>
          </div>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-300">Statut:</span>
              <span className="text-green-400">Connecté</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-300">Posts ce mois:</span>
              <span className="text-white">24</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-300">Engagement:</span>
              <span className="text-white">4.2%</span>
            </div>
          </div>
        </div>

        <div className="bg-pink-600/20 backdrop-blur-xl rounded-2xl p-6 border border-pink-500/30">
          <div className="flex items-center gap-3 mb-4">
            <Instagram className="w-8 h-8 text-pink-400" />
            <h3 className="text-lg font-bold text-white">Instagram</h3>
          </div>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-300">Statut:</span>
              <span className="text-yellow-400">En attente</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-300">Followers:</span>
              <span className="text-white">1.2k</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-300">Stories:</span>
              <span className="text-white">12</span>
            </div>
          </div>
        </div>

        <div className="bg-purple-600/20 backdrop-blur-xl rounded-2xl p-6 border border-purple-500/30">
          <div className="flex items-center gap-3 mb-4">
            <Target className="w-8 h-8 text-purple-400" />
            <h3 className="text-lg font-bold text-white">Campagnes</h3>
          </div>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-300">Actives:</span>
              <span className="text-white">3</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-300">Budget:</span>
              <span className="text-white">€450/mois</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-300">ROAS:</span>
              <span className="text-green-400">3.2x</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const renderBudgets = () => (
    <div className="space-y-8">
      <div>
        <h2 className="text-3xl font-bold text-white">Gestion des Budgets</h2>
        <p className="text-gray-300">Suivi des budgets publicitaires et ROI</p>
      </div>

      {/* Budget Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-blue-600/20 backdrop-blur-xl rounded-2xl p-6 border border-blue-500/30">
          <div className="text-center">
            <div className="text-3xl font-bold text-white">€1,200</div>
            <div className="text-blue-300 text-sm">Budget total/mois</div>
          </div>
        </div>
        <div className="bg-green-600/20 backdrop-blur-xl rounded-2xl p-6 border border-green-500/30">
          <div className="text-center">
            <div className="text-3xl font-bold text-white">€980</div>
            <div className="text-green-300 text-sm">Dépensé ce mois</div>
          </div>
        </div>
        <div className="bg-purple-600/20 backdrop-blur-xl rounded-2xl p-6 border border-purple-500/30">
          <div className="text-center">
            <div className="text-3xl font-bold text-white">3.4x</div>
            <div className="text-purple-300 text-sm">ROI moyen</div>
          </div>
        </div>
        <div className="bg-orange-600/20 backdrop-blur-xl rounded-2xl p-6 border border-orange-500/30">
          <div className="text-center">
            <div className="text-3xl font-bold text-white">€220</div>
            <div className="text-orange-300 text-sm">Restant</div>
          </div>
        </div>
      </div>

      {/* Répartition par plateforme */}
      <div className="bg-white/10 backdrop-blur-xl rounded-2xl p-8 border border-white/20">
        <h3 className="text-xl font-bold text-white mb-6">Répartition par plateforme</h3>
        <div className="space-y-4">
          <div className="flex items-center justify-between p-4 bg-black/20 rounded-xl">
            <div className="flex items-center gap-3">
              <Search className="w-6 h-6 text-blue-400" />
              <div>
                <div className="font-semibold text-white">Google Ads</div>
                <div className="text-gray-400 text-sm">Shopping + Performance Max</div>
              </div>
            </div>
            <div className="text-right">
              <div className="text-white font-bold">€600</div>
              <div className="text-blue-400 text-sm">50% du budget</div>
            </div>
          </div>
          <div className="flex items-center justify-between p-4 bg-black/20 rounded-xl">
            <div className="flex items-center gap-3">
              <Facebook className="w-6 h-6 text-blue-500" />
              <div>
                <div className="font-semibold text-white">Meta Ads</div>
                <div className="text-gray-400 text-sm">Facebook + Instagram</div>
              </div>
            </div>
            <div className="text-right">
              <div className="text-white font-bold">€400</div>
              <div className="text-blue-400 text-sm">33% du budget</div>
            </div>
          </div>
          <div className="flex items-center justify-between p-4 bg-black/20 rounded-xl">
            <div className="flex items-center gap-3">
              <Video className="w-6 h-6 text-red-400" />
              <div>
                <div className="font-semibold text-white">TikTok Ads</div>
                <div className="text-gray-400 text-sm">Vidéos produits</div>
              </div>
            </div>
            <div className="text-right">
              <div className="text-white font-bold">€200</div>
              <div className="text-blue-400 text-sm">17% du budget</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const renderGoogleAdsAnalytics = () => (
    <div className="space-y-8">
      <div>
        <h2 className="text-3xl font-bold text-white">Google Ads Analytics</h2>
        <p className="text-gray-300">Performance des campagnes Google Ads</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-blue-600/20 backdrop-blur-xl rounded-2xl p-6 border border-blue-500/30">
          <div className="text-center">
            <div className="text-3xl font-bold text-white">€2,400</div>
            <div className="text-blue-300 text-sm">Dépenses ce mois</div>
          </div>
        </div>
        <div className="bg-green-600/20 backdrop-blur-xl rounded-2xl p-6 border border-green-500/30">
          <div className="text-center">
            <div className="text-3xl font-bold text-white">4.2x</div>
            <div className="text-green-300 text-sm">ROAS</div>
          </div>
        </div>
        <div className="bg-purple-600/20 backdrop-blur-xl rounded-2xl p-6 border border-purple-500/30">
          <div className="text-center">
            <div className="text-3xl font-bold text-white">156</div>
            <div className="text-purple-300 text-sm">Conversions</div>
          </div>
        </div>
        <div className="bg-orange-600/20 backdrop-blur-xl rounded-2xl p-6 border border-orange-500/30">
          <div className="text-center">
            <div className="text-3xl font-bold text-white">2.1%</div>
            <div className="text-orange-300 text-sm">CTR</div>
          </div>
        </div>
      </div>
    </div>
  );

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard': return renderDashboard();
      case 'catalog': return <CatalogManagement />;
      case 'products-enriched': return <ProductsEnrichedTable />;
      case 'inventory': return <div className="text-white">Inventaire - En développement</div>;
      case 'robot': return <OmniaRobotTab />;
      case 'conversations': return <ConversationHistory />;
      case 'speech-to-text': return <SpeechToTextInterface />;
      case 'analytics': return <div className="text-white">Analytics - En développement</div>;
      case 'marketing': return <div className="text-white">Marketing - En développement</div>;
      case 'google-ads-analytics': return renderGoogleAdsAnalytics();
      case 'google-ads-integration': return <div className="text-white">Google Ads Intégration - En développement</div>;
      case 'google-ads-campaigns': return <div className="text-white">Campagnes Google Ads - En développement</div>;
      case 'google-ads-optimization': return <div className="text-white">Optimisation Google Ads - En développement</div>;
      case 'google-merchant-feed': return renderGoogleMerchantFeed();
      case 'google-merchant-guide': return renderGoogleMerchantGuide();
      case 'seo-blog': return renderSEOBlog();
      case 'seo-auto-blogging': return <div className="text-white">Auto Blogging - En développement</div>;
      case 'seo-backlinks': return <div className="text-white">Backlinks - En développement</div>;
      case 'seo-integration': return <div className="text-white">Intégration SEO - En développement</div>;
      case 'seo-optimization': return renderSEOOptimization();
      case 'social-analytics': return <div className="text-white">Analytics Réseaux Sociaux - En développement</div>;
      case 'social-facebook': return <div className="text-white">Intégration Facebook - En développement</div>;
      case 'social-instagram': return <div className="text-white">Intégration Instagram - En développement</div>;
      case 'social-ads': return <div className="text-white">Ads Management - En développement</div>;
      case 'social-auto-posting': return <div className="text-white">Auto-posting - En développement</div>;
      case 'social-catalog': return renderSocialMedia();
      case 'budget-overview': return renderBudgets();
      case 'budget-ads': return <div className="text-white">Répartition Ads - En développement</div>;
      case 'budget-roi': return <div className="text-white">ROI estimé vs réel - En développement</div>;
      case 'orders': return <div className="text-white">Commandes - En développement</div>;
      case 'ai-training': return <AITrainingInterface />;
      case 'messaging': return <MessagingSystem />;
      case 'integrations': return <EcommerceIntegration onConnected={(data) => console.log('Connected:', data)} />;
      default: return renderDashboard();
    }
  };

  return (
    <div className="flex h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-purple-900">
      {/* Sidebar */}
      <div className="w-80 bg-black/20 backdrop-blur-2xl border-r border-white/10 flex flex-col">
        {/* Header */}
        <div className="p-6 border-b border-white/10">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-2xl flex items-center justify-center">
              <Bot className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-white">OmnIA Admin</h1>
              <p className="text-cyan-300 text-sm">{currentUser?.company_name || 'Revendeur'}</p>
            </div>
          </div>
          <div className="bg-green-500/20 border border-green-400/30 rounded-xl p-3">
            <div className="flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-green-400" />
              <span className="text-green-300 text-sm font-medium">Plan {currentUser?.plan || 'Professional'}</span>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto p-4 space-y-2">
          {menuItems.map((item) => renderMenuItem(item))}
        </nav>

        {/* Footer */}
        <div className="p-4 border-t border-white/10">
          <button
            onClick={onLogout}
            className="w-full flex items-center gap-3 px-4 py-3 text-gray-300 hover:bg-red-500/20 hover:text-red-300 rounded-xl transition-all"
          >
            <LogOut className="w-5 h-5" />
            <span className="font-medium">Déconnexion</span>
          </button>
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
```