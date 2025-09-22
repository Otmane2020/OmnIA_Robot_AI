import React, { useState, useEffect } from 'react';
import { 
  BarChart3, Package, Bot, MessageSquare, Settings, LogOut, 
  Store, Upload, Brain, Zap, Users, CreditCard, Globe,
  TrendingUp, Search, Mic, Volume2, Mail, ShoppingCart,
  Target, Link, FileText, Share2, DollarSign, PieChart,
  Camera, Eye, Palette, Tag, ExternalLink, RefreshCw,
  Calendar, Clock, Megaphone, Facebook, Instagram, 
  Twitter, Youtube, Smartphone, Monitor, Tablet
} from 'lucide-react';
import { CatalogManagement } from '../components/CatalogManagement';
import { EcommerceIntegration } from '../components/EcommerceIntegration';
import { AITrainingInterface } from '../components/AITrainingInterface';
import { ConversationHistory } from '../components/ConversationHistory';
import { OmniaRobotTab } from '../components/OmniaRobotTab';
import { SpeechToTextInterface } from '../components/SpeechToTextInterface';
import { MessagingSystem } from '../components/MessagingSystem';
import { MLTrainingDashboard } from '../components/MLTrainingDashboard';
import { ProductsEnrichedTable } from '../components/ProductsEnrichedTable';
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

  const { notifications, removeNotification, showSuccess, showError, showInfo } = useNotifications();

  // Menu structure according to specifications
  const menuItems = [
    {
      id: 'dashboard',
      label: 'Dashboard',
      icon: BarChart3,
      subItems: []
    },
    {
      id: 'omnia-bot',
      label: 'OmnIA Bot',
      icon: Bot,
      subItems: [
        { id: 'robot-omnia', label: 'Robot OmnIA', icon: Bot },
        { id: 'conversations', label: 'Conversations', icon: MessageSquare },
        { id: 'speech-to-text', label: 'Speech-to-Text', icon: Mic }
      ]
    },
    {
      id: 'ads-marketing',
      label: 'Ads & Marketing',
      icon: Target,
      subItems: [
        { id: 'analytics', label: 'Analytics', icon: BarChart3 },
        { id: 'marketing', label: 'Marketing', icon: Megaphone },
        { id: 'google-merchant', label: 'Google Merchant', icon: Store },
        {
          id: 'google-ads',
          label: 'Google Ads',
          icon: Search,
          subItems: [
            { id: 'google-ads-analytics', label: 'Analytics', icon: BarChart3 },
            { id: 'google-ads-integration', label: 'Intégration', icon: Link },
            { id: 'google-ads-campaigns', label: 'Campagnes publicitaires', icon: Target },
            { id: 'google-ads-optimization', label: 'Optimisation', icon: TrendingUp }
          ]
        }
      ]
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
      id: 'ecommerce',
      label: 'E-commerce',
      icon: ShoppingCart,
      subItems: [
        { id: 'catalog', label: 'Catalogue', icon: Package },
        { id: 'products-enriched', label: 'Produits Enrichis', icon: Brain },
        { id: 'integration', label: 'Intégration', icon: Upload },
        { id: 'ai-training', label: 'Entraînement IA', icon: Zap }
      ]
    },
    {
      id: 'google-merchant-center',
      label: 'Google Merchant',
      icon: Store,
      subItems: [
        { id: 'merchant-feed', label: 'Flux XML', icon: FileText },
        { id: 'merchant-guide', label: 'Guide d\'importation', icon: ExternalLink }
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
        { id: 'seo-optimization', label: 'Optimisation SEO', icon: TrendingUp }
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
        { id: 'budget-ads', label: 'Répartition Ads', icon: Target },
        { id: 'budget-roi', label: 'ROI', icon: TrendingUp }
      ]
    },
    {
      id: 'subscription',
      label: 'Abonnement',
      icon: CreditCard,
      subItems: []
    }
  ];

  const [expandedMenus, setExpandedMenus] = useState<string[]>(['omnia-bot', 'ecommerce']);

  const toggleMenu = (menuId: string) => {
    setExpandedMenus(prev => 
      prev.includes(menuId) 
        ? prev.filter(id => id !== menuId)
        : [...prev, menuId]
    );
  };

  const renderMenuItem = (item: any, level = 0) => {
    const Icon = item.icon;
    const hasSubItems = item.subItems && item.subItems.length > 0;
    const isExpanded = expandedMenus.includes(item.id);
    const isActive = activeTab === item.id;
    const paddingLeft = level === 0 ? 'pl-4' : level === 1 ? 'pl-8' : 'pl-12';

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
          className={`w-full flex items-center justify-between ${paddingLeft} pr-4 py-3 text-left transition-all hover:bg-white/10 rounded-xl ${
            isActive ? 'bg-cyan-500/20 text-cyan-300 border-r-2 border-cyan-400' : 'text-gray-300 hover:text-white'
          }`}
        >
          <div className="flex items-center gap-3">
            <Icon className="w-5 h-5" />
            <span className="font-medium">{item.label}</span>
          </div>
          {hasSubItems && (
            <div className={`transform transition-transform ${isExpanded ? 'rotate-90' : ''}`}>
              ▶
            </div>
          )}
        </button>
        
        {hasSubItems && isExpanded && (
          <div className="mt-1 space-y-1">
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
          <h2 className="text-3xl font-bold text-white">Dashboard {currentUser?.company_name || 'Revendeur'}</h2>
          <p className="text-gray-300">Vue d'ensemble de votre activité OmnIA</p>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 bg-green-400 rounded-full animate-pulse"></div>
          <span className="text-green-300">OmnIA actif</span>
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
              <p className="text-purple-300 text-sm">Catalogue enrichi</p>
            </div>
            <Package className="w-10 h-10 text-purple-400" />
          </div>
        </div>
        
        <div className="bg-orange-600/20 backdrop-blur-xl rounded-2xl p-6 border border-orange-500/30">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-orange-200 text-sm mb-1">Revenus</p>
              <p className="text-3xl font-bold text-white">€2,450</p>
              <p className="text-orange-300 text-sm">Ce mois</p>
            </div>
            <DollarSign className="w-10 h-10 text-orange-400" />
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-white/10 backdrop-blur-xl rounded-2xl p-8 border border-white/20">
        <h3 className="text-xl font-bold text-white mb-6">Actions Rapides</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <button
            onClick={() => setActiveTab('robot-omnia')}
            className="bg-cyan-600/20 hover:bg-cyan-600/30 border border-cyan-500/50 text-cyan-300 p-4 rounded-xl transition-all hover:scale-105 flex items-center gap-3"
          >
            <Bot className="w-6 h-6" />
            <span className="font-semibold">Configurer Robot</span>
          </button>
          
          <button
            onClick={() => setActiveTab('products-enriched')}
            className="bg-purple-600/20 hover:bg-purple-600/30 border border-purple-500/50 text-purple-300 p-4 rounded-xl transition-all hover:scale-105 flex items-center gap-3"
          >
            <Brain className="w-6 h-6" />
            <span className="font-semibold">Enrichir Catalogue</span>
          </button>
          
          <button
            onClick={() => setActiveTab('merchant-feed')}
            className="bg-green-600/20 hover:bg-green-600/30 border border-green-500/50 text-green-300 p-4 rounded-xl transition-all hover:scale-105 flex items-center gap-3"
          >
            <Store className="w-6 h-6" />
            <span className="font-semibold">Flux Google</span>
          </button>
          
          <button
            onClick={() => setActiveTab('seo-optimization')}
            className="bg-orange-600/20 hover:bg-orange-600/30 border border-orange-500/50 text-orange-300 p-4 rounded-xl transition-all hover:scale-105 flex items-center gap-3"
          >
            <Search className="w-6 h-6" />
            <span className="font-semibold">Optimiser SEO</span>
          </button>
        </div>
      </div>
    </div>
  );

  // New content renderers for new menu items
  const renderGoogleAdsAnalytics = () => (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-white">Google Ads Analytics</h2>
      <div className="bg-white/10 backdrop-blur-xl rounded-2xl p-8 border border-white/20">
        <p className="text-gray-300">Statistiques détaillées de vos campagnes Google Ads</p>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-6">
          <div className="bg-blue-500/20 rounded-xl p-4">
            <h3 className="text-blue-200 font-semibold mb-2">Impressions</h3>
            <p className="text-2xl font-bold text-white">125,430</p>
          </div>
          <div className="bg-green-500/20 rounded-xl p-4">
            <h3 className="text-green-200 font-semibold mb-2">Clics</h3>
            <p className="text-2xl font-bold text-white">3,247</p>
          </div>
          <div className="bg-purple-500/20 rounded-xl p-4">
            <h3 className="text-purple-200 font-semibold mb-2">ROAS</h3>
            <p className="text-2xl font-bold text-white">4.2x</p>
          </div>
        </div>
      </div>
    </div>
  );

  const renderGoogleAdsIntegration = () => (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-white">Intégration Google Ads</h2>
      <div className="bg-white/10 backdrop-blur-xl rounded-2xl p-8 border border-white/20">
        <h3 className="text-xl font-bold text-white mb-4">Connexion Google Ads</h3>
        <div className="space-y-4">
          <button className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-xl">
            Connecter Google Ads
          </button>
          <div className="bg-blue-500/20 border border-blue-400/50 rounded-xl p-4">
            <h4 className="font-semibold text-blue-200 mb-2">Configuration requise :</h4>
            <ul className="text-blue-300 text-sm space-y-1">
              <li>• Compte Google Ads actif</li>
              <li>• Permissions API Google Ads</li>
              <li>• Conversion tracking configuré</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );

  const renderGoogleAdsCampaigns = () => (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-white">Campagnes Publicitaires</h2>
      <div className="bg-white/10 backdrop-blur-xl rounded-2xl p-8 border border-white/20">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-xl font-bold text-white">Mes Campagnes</h3>
          <button className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-xl">
            Nouvelle campagne
          </button>
        </div>
        <div className="space-y-4">
          <div className="bg-black/20 rounded-xl p-4">
            <h4 className="font-semibold text-white mb-2">Campagne Shopping - Mobilier</h4>
            <div className="grid grid-cols-3 gap-4 text-sm">
              <div>
                <span className="text-gray-400">Budget :</span>
                <span className="text-white ml-2">€50/jour</span>
              </div>
              <div>
                <span className="text-gray-400">ROAS :</span>
                <span className="text-green-400 ml-2">4.2x</span>
              </div>
              <div>
                <span className="text-gray-400">Statut :</span>
                <span className="text-green-400 ml-2">Active</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const renderGoogleAdsOptimization = () => (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-white">Optimisation Google Ads</h2>
      <div className="bg-white/10 backdrop-blur-xl rounded-2xl p-8 border border-white/20">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-black/20 rounded-xl p-4">
            <h3 className="font-semibold text-white mb-4">ROAS Cible</h3>
            <input
              type="number"
              placeholder="4.0"
              className="w-full bg-black/40 border border-gray-600 rounded-xl px-4 py-3 text-white"
            />
          </div>
          <div className="bg-black/20 rounded-xl p-4">
            <h3 className="font-semibold text-white mb-4">Tracking UTM</h3>
            <div className="space-y-2">
              <input
                type="text"
                placeholder="utm_source"
                className="w-full bg-black/40 border border-gray-600 rounded-xl px-4 py-2 text-white text-sm"
              />
              <input
                type="text"
                placeholder="utm_campaign"
                className="w-full bg-black/40 border border-gray-600 rounded-xl px-4 py-2 text-white text-sm"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const renderMerchantFeed = () => (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-white">Flux XML Google Merchant</h2>
      <div className="bg-white/10 backdrop-blur-xl rounded-2xl p-8 border border-white/20">
        <div className="space-y-6">
          <div className="bg-green-500/20 border border-green-400/50 rounded-xl p-4">
            <h3 className="font-semibold text-green-200 mb-2">✅ Flux XML généré automatiquement</h3>
            <p className="text-green-300 text-sm mb-3">
              Basé sur votre catalogue enrichi avec tous les champs requis par Google Merchant
            </p>
            <div className="bg-black/40 rounded-lg p-3">
              <code className="text-green-400 text-sm">
                https://{currentUser?.company_name?.toLowerCase().replace(/[^a-z0-9]/g, '') || 'boutique'}.omnia.sale/feed/xml/google-shopping.xml
              </code>
            </div>
          </div>
          
          <div className="bg-blue-500/20 border border-blue-400/50 rounded-xl p-4">
            <h3 className="font-semibold text-blue-200 mb-2">📋 Champs inclus dans le flux :</h3>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-2 text-blue-300 text-sm">
              <div>• id</div>
              <div>• title</div>
              <div>• description</div>
              <div>• link</div>
              <div>• image_link</div>
              <div>• price</div>
              <div>• sale_price</div>
              <div>• brand</div>
              <div>• mpn</div>
              <div>• gtin</div>
              <div>• condition</div>
              <div>• availability</div>
              <div>• product_type</div>
              <div>• google_product_category</div>
              <div>• material</div>
              <div>• color</div>
              <div>• size</div>
              <div>• additional_image_link</div>
            </div>
          </div>
          
          <div className="flex gap-4">
            <button className="bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-xl flex items-center gap-2">
              <RefreshCw className="w-4 h-4" />
              Régénérer le flux
            </button>
            <button className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-xl flex items-center gap-2">
              <ExternalLink className="w-4 h-4" />
              Voir le flux XML
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  const renderMerchantGuide = () => (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-white">Guide d'importation Google Merchant</h2>
      <div className="bg-white/10 backdrop-blur-xl rounded-2xl p-8 border border-white/20">
        <div className="space-y-6">
          <div className="bg-blue-500/20 border border-blue-400/50 rounded-xl p-6">
            <h3 className="font-semibold text-blue-200 mb-4">📋 Étapes d'importation :</h3>
            <ol className="text-blue-300 space-y-2">
              <li>1. <strong>Connectez-vous à Google Merchant Center</strong></li>
              <li>2. <strong>Produits → Flux</strong> → Ajouter un flux</li>
              <li>3. <strong>URL du flux :</strong> Copiez l'URL générée ci-dessus</li>
              <li>4. <strong>Planification :</strong> Quotidienne (recommandé)</li>
              <li>5. <strong>Validation :</strong> Vérifiez les erreurs éventuelles</li>
            </ol>
          </div>
          
          <div className="bg-green-500/20 border border-green-400/50 rounded-xl p-6">
            <h3 className="font-semibold text-green-200 mb-4">✅ Avantages du flux automatique :</h3>
            <ul className="text-green-300 space-y-1">
              <li>• Synchronisation automatique des prix</li>
              <li>• Mise à jour des stocks en temps réel</li>
              <li>• SEO optimisé par IA</li>
              <li>• Images haute qualité</li>
              <li>• Attributs produits enrichis</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );

  const renderSEOBlog = () => (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-white">Blog & Articles</h2>
      <div className="bg-white/10 backdrop-blur-xl rounded-2xl p-8 border border-white/20">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-xl font-bold text-white">Articles publiés</h3>
          <button className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-xl">
            Nouvel article
          </button>
        </div>
        <div className="text-center py-8">
          <FileText className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-400">Aucun article publié pour le moment</p>
        </div>
      </div>
    </div>
  );

  const renderSEOAutoBlogging = () => (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-white">Auto Blogging</h2>
      <div className="bg-white/10 backdrop-blur-xl rounded-2xl p-8 border border-white/20">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-black/20 rounded-xl p-6">
            <h3 className="font-semibold text-white mb-4">Planification</h3>
            <div className="space-y-4">
              <select className="w-full bg-black/40 border border-gray-600 rounded-xl px-4 py-3 text-white">
                <option>Quotidien</option>
                <option>Hebdomadaire</option>
                <option>Mensuel</option>
              </select>
              <input
                type="text"
                placeholder="Mots-clés (mobilier, décoration...)"
                className="w-full bg-black/40 border border-gray-600 rounded-xl px-4 py-3 text-white"
              />
            </div>
          </div>
          <div className="bg-black/20 rounded-xl p-6">
            <h3 className="font-semibold text-white mb-4">Thèmes</h3>
            <div className="space-y-2">
              <label className="flex items-center gap-2">
                <input type="checkbox" className="w-4 h-4" />
                <span className="text-gray-300">Tendances mobilier</span>
              </label>
              <label className="flex items-center gap-2">
                <input type="checkbox" className="w-4 h-4" />
                <span className="text-gray-300">Conseils déco</span>
              </label>
              <label className="flex items-center gap-2">
                <input type="checkbox" className="w-4 h-4" />
                <span className="text-gray-300">Guides d'achat</span>
              </label>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const renderSEOBacklinks = () => (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-white">Backlinks</h2>
      <div className="bg-white/10 backdrop-blur-xl rounded-2xl p-8 border border-white/20">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-white/20">
                <th className="text-left p-3 text-cyan-300">URL</th>
                <th className="text-left p-3 text-cyan-300">Article associé</th>
                <th className="text-left p-3 text-cyan-300">Date</th>
                <th className="text-left p-3 text-cyan-300">Statut</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td colSpan={4} className="text-center py-8 text-gray-400">
                  Aucun backlink créé pour le moment
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );

  const renderSEOIntegration = () => (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-white">Intégration SEO</h2>
      <div className="bg-white/10 backdrop-blur-xl rounded-2xl p-8 border border-white/20">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-black/20 rounded-xl p-6">
            <h3 className="font-semibold text-white mb-4">Plateformes supportées</h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-gray-300">WordPress</span>
                <button className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded text-sm">
                  Connecter
                </button>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-300">Shopify</span>
                <button className="bg-green-600 hover:bg-green-700 text-white px-3 py-1 rounded text-sm">
                  Connecter
                </button>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-300">PrestaShop</span>
                <button className="bg-purple-600 hover:bg-purple-700 text-white px-3 py-1 rounded text-sm">
                  Connecter
                </button>
              </div>
            </div>
          </div>
          <div className="bg-black/20 rounded-xl p-6">
            <h3 className="font-semibold text-white mb-4">Options de partage</h3>
            <div className="space-y-3">
              <label className="flex items-center gap-2">
                <input type="radio" name="sharing" className="w-4 h-4" />
                <span className="text-gray-300">Automatique</span>
              </label>
              <label className="flex items-center gap-2">
                <input type="radio" name="sharing" className="w-4 h-4" />
                <span className="text-gray-300">Manuel</span>
              </label>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const renderSEOOptimization = () => (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-white">Optimisation SEO</h2>
      <div className="bg-white/10 backdrop-blur-xl rounded-2xl p-8 border border-white/20">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-xl font-bold text-white">Produits à optimiser</h3>
          <button className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-xl">
            Optimiser tout avec IA
          </button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-white/20">
                <th className="text-left p-3 text-cyan-300">Image</th>
                <th className="text-left p-3 text-cyan-300">Titre</th>
                <th className="text-left p-3 text-cyan-300">SEO Title</th>
                <th className="text-left p-3 text-cyan-300">SEO Description</th>
                <th className="text-left p-3 text-cyan-300">Image Alt</th>
                <th className="text-left p-3 text-cyan-300">Actions</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td colSpan={6} className="text-center py-8 text-gray-400">
                  Chargement des produits...
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );

  const renderSocialAnalytics = () => (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-white">Analytics Réseaux Sociaux</h2>
      <div className="bg-white/10 backdrop-blur-xl rounded-2xl p-8 border border-white/20">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-blue-500/20 rounded-xl p-4 text-center">
            <Facebook className="w-8 h-8 text-blue-400 mx-auto mb-2" />
            <h3 className="font-semibold text-white">Facebook</h3>
            <p className="text-2xl font-bold text-blue-400">1,234</p>
            <p className="text-blue-300 text-sm">Followers</p>
          </div>
          <div className="bg-pink-500/20 rounded-xl p-4 text-center">
            <Instagram className="w-8 h-8 text-pink-400 mx-auto mb-2" />
            <h3 className="font-semibold text-white">Instagram</h3>
            <p className="text-2xl font-bold text-pink-400">856</p>
            <p className="text-pink-300 text-sm">Followers</p>
          </div>
          <div className="bg-purple-500/20 rounded-xl p-4 text-center">
            <Target className="w-8 h-8 text-purple-400 mx-auto mb-2" />
            <h3 className="font-semibold text-white">Engagement</h3>
            <p className="text-2xl font-bold text-purple-400">4.2%</p>
            <p className="text-purple-300 text-sm">Taux moyen</p>
          </div>
        </div>
      </div>
    </div>
  );

  const renderBudgetOverview = () => (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-white">Budget Overview</h2>
      <div className="bg-white/10 backdrop-blur-xl rounded-2xl p-8 border border-white/20">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-black/20 rounded-xl p-6">
            <h3 className="font-semibold text-white mb-4">Budget mensuel</h3>
            <p className="text-3xl font-bold text-green-400">€1,500</p>
            <p className="text-gray-300 text-sm">Alloué ce mois</p>
          </div>
          <div className="bg-black/20 rounded-xl p-6">
            <h3 className="font-semibold text-white mb-4">Dépensé</h3>
            <p className="text-3xl font-bold text-orange-400">€1,247</p>
            <p className="text-gray-300 text-sm">83% du budget</p>
          </div>
        </div>
      </div>
    </div>
  );

  const renderBudgetAds = () => (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-white">Répartition Ads</h2>
      <div className="bg-white/10 backdrop-blur-xl rounded-2xl p-8 border border-white/20">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-blue-500/20 rounded-xl p-4 text-center">
            <h3 className="font-semibold text-blue-200 mb-2">Google Ads</h3>
            <p className="text-2xl font-bold text-white">€800</p>
            <p className="text-blue-300 text-sm">53% du budget</p>
          </div>
          <div className="bg-purple-500/20 rounded-xl p-4 text-center">
            <h3 className="font-semibold text-purple-200 mb-2">Meta Ads</h3>
            <p className="text-2xl font-bold text-white">€400</p>
            <p className="text-purple-300 text-sm">27% du budget</p>
          </div>
          <div className="bg-pink-500/20 rounded-xl p-4 text-center">
            <h3 className="font-semibold text-pink-200 mb-2">TikTok Ads</h3>
            <p className="text-2xl font-bold text-white">€200</p>
            <p className="text-pink-300 text-sm">13% du budget</p>
          </div>
          <div className="bg-gray-500/20 rounded-xl p-4 text-center">
            <h3 className="font-semibold text-gray-200 mb-2">Autres</h3>
            <p className="text-2xl font-bold text-white">€100</p>
            <p className="text-gray-300 text-sm">7% du budget</p>
          </div>
        </div>
      </div>
    </div>
  );

  const renderBudgetROI = () => (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-white">ROI Analysis</h2>
      <div className="bg-white/10 backdrop-blur-xl rounded-2xl p-8 border border-white/20">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-green-500/20 rounded-xl p-6">
            <h3 className="font-semibold text-green-200 mb-4">ROI Estimé</h3>
            <p className="text-3xl font-bold text-green-400">4.2x</p>
            <p className="text-green-300 text-sm">Prévision basée sur historique</p>
          </div>
          <div className="bg-blue-500/20 rounded-xl p-6">
            <h3 className="font-semibold text-blue-200 mb-4">ROI Réel</h3>
            <p className="text-3xl font-bold text-blue-400">3.8x</p>
            <p className="text-blue-300 text-sm">Performance actuelle</p>
          </div>
        </div>
      </div>
    </div>
  );

  const renderSubscription = () => (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold text-white">Abonnement {currentUser?.plan || 'Professional'}</h2>
          <p className="text-gray-300">Gérez votre abonnement OmnIA</p>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 bg-green-400 rounded-full animate-pulse"></div>
          <span className="text-green-300">Actif</span>
        </div>
      </div>

      {/* Plan actuel */}
      <div className="bg-white/10 backdrop-blur-xl rounded-2xl p-8 border border-white/20">
        <h3 className="text-xl font-bold text-white mb-6">Plan Actuel</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-cyan-500/20 rounded-xl p-6 text-center">
            <h4 className="font-bold text-cyan-200 text-lg mb-2">{currentUser?.plan || 'Professional'}</h4>
            <p className="text-3xl font-bold text-white mb-2">79€</p>
            <p className="text-cyan-300 text-sm">par mois</p>
          </div>
          <div className="bg-green-500/20 rounded-xl p-6">
            <h4 className="font-semibold text-green-200 mb-3">Inclus dans votre plan :</h4>
            <ul className="text-green-300 text-sm space-y-1">
              <li>• 5000 conversations/mois</li>
              <li>• Produits illimités</li>
              <li>• Support prioritaire</li>
              <li>• Analytics avancées</li>
            </ul>
          </div>
          <div className="bg-blue-500/20 rounded-xl p-6">
            <h4 className="font-semibold text-blue-200 mb-3">Utilisation ce mois :</h4>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-blue-300">Conversations :</span>
                <span className="text-white">1,234 / 5,000</span>
              </div>
              <div className="flex justify-between">
                <span className="text-blue-300">Produits :</span>
                <span className="text-white">247 / ∞</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Facturation */}
      <div className="bg-white/10 backdrop-blur-xl rounded-2xl p-8 border border-white/20">
        <h3 className="text-xl font-bold text-white mb-6">Facturation</h3>
        <div className="space-y-4">
          <div className="flex items-center justify-between p-4 bg-black/20 rounded-xl">
            <div>
              <p className="text-white font-semibold">Prochaine facturation</p>
              <p className="text-gray-300 text-sm">15 février 2025</p>
            </div>
            <div className="text-right">
              <p className="text-2xl font-bold text-green-400">79€</p>
              <p className="text-gray-300 text-sm">Plan Professional</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard': return renderDashboard();
      case 'robot-omnia': return <OmniaRobotTab />;
      case 'conversations': return <ConversationHistory />;
      case 'speech-to-text': return <SpeechToTextInterface />;
      case 'analytics': return renderGoogleAdsAnalytics();
      case 'marketing': return renderGoogleAdsAnalytics();
      case 'google-merchant': return renderMerchantFeed();
      case 'google-ads-analytics': return renderGoogleAdsAnalytics();
      case 'google-ads-integration': return renderGoogleAdsIntegration();
      case 'google-ads-campaigns': return renderGoogleAdsCampaigns();
      case 'google-ads-optimization': return renderGoogleAdsOptimization();
      case 'messaging': return <MessagingSystem />;
      case 'catalog': return <CatalogManagement />;
      case 'products-enriched': return <ProductsEnrichedTable />;
      case 'integration': return <EcommerceIntegration onConnected={(data) => showSuccess('Plateforme connectée', `${data.name} connectée avec succès !`)} />;
      case 'ai-training': return <AITrainingInterface />;
      case 'merchant-feed': return renderMerchantFeed();
      case 'merchant-guide': return renderMerchantGuide();
      case 'seo-blog': return renderSEOBlog();
      case 'seo-auto-blogging': return renderSEOAutoBlogging();
      case 'seo-backlinks': return renderSEOBacklinks();
      case 'seo-integration': return renderSEOIntegration();
      case 'seo-optimization': return renderSEOOptimization();
      case 'social-analytics': return renderSocialAnalytics();
      case 'social-facebook': return renderSocialAnalytics();
      case 'social-instagram': return renderSocialAnalytics();
      case 'social-ads': return renderSocialAnalytics();
      case 'social-auto-posting': return renderSocialAnalytics();
      case 'social-catalog': return renderSocialAnalytics();
      case 'budget-overview': return renderBudgetOverview();
      case 'budget-ads': return renderBudgetAds();
      case 'budget-roi': return renderBudgetROI();
      case 'subscription': return renderSubscription();
      default: return renderDashboard();
    }
  };

  return (
    <div className="flex h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-purple-900">
      {/* Sidebar */}
      <div className="w-80 bg-black/20 backdrop-blur-xl border-r border-white/10 flex flex-col">
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
          
          <div className="bg-cyan-500/20 border border-cyan-400/50 rounded-xl p-3">
            <div className="flex items-center justify-between">
              <span className="text-cyan-300 text-sm">Plan {currentUser?.plan || 'Professional'}</span>
              <span className="bg-green-500/30 text-green-300 px-2 py-1 rounded-full text-xs">Actif</span>
            </div>
          </div>
        </div>

        {/* Navigation Menu */}
        <nav className="flex-1 overflow-y-auto p-4 space-y-2">
          {menuItems.map(item => renderMenuItem(item))}
        </nav>

        {/* Footer */}
        <div className="p-4 border-t border-white/10">
          <button
            onClick={onLogout}
            className="w-full flex items-center gap-3 px-4 py-3 text-gray-300 hover:text-white hover:bg-white/10 rounded-xl transition-all"
          >
            <LogOut className="w-5 h-5" />
            <span>Déconnexion</span>
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