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

      {/* E-commerce Performance */}
      <div className="bg-white/10 backdrop-blur-xl rounded-2xl p-6 md:p-8 border border-white/20">
        <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
          <Store className="w-6 h-6 text-green-400" />
          Performance E-commerce
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
          <div className="bg-green-600/20 rounded-xl p-4 text-center">
            <div className="text-2xl font-bold text-green-400">€2,847</div>
            <div className="text-green-300 text-sm">Ventes ce mois</div>
            <div className="text-xs text-green-200 mt-1">+23% vs mois dernier</div>
          </div>
          <div className="bg-blue-600/20 rounded-xl p-4 text-center">
            <div className="text-2xl font-bold text-blue-400">156</div>
            <div className="text-blue-300 text-sm">Commandes</div>
            <div className="text-xs text-blue-200 mt-1">+15% vs mois dernier</div>
          </div>
          <div className="bg-purple-600/20 rounded-xl p-4 text-center">
            <div className="text-2xl font-bold text-purple-400">€18.25</div>
            <div className="text-purple-300 text-sm">Panier moyen</div>
            <div className="text-xs text-purple-200 mt-1">+8% vs mois dernier</div>
          </div>
          <div className="bg-orange-600/20 rounded-xl p-4 text-center">
            <div className="text-2xl font-bold text-orange-400">3.2%</div>
            <div className="text-orange-300 text-sm">Taux abandon</div>
            <div className="text-xs text-orange-200 mt-1">-12% vs mois dernier</div>
          </div>
        </div>
        
        <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-black/20 rounded-xl p-4">
            <h4 className="font-semibold text-white mb-3">🛒 Top produits vendus</h4>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-gray-300">Canapé ALYANA Beige</span>
                <span className="text-green-400 font-bold">12 ventes</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-300">Table AUREA Ø100cm</span>
                <span className="text-green-400 font-bold">8 ventes</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-300">Chaise INAYA Gris</span>
                <span className="text-green-400 font-bold">15 ventes</span>
              </div>
            </div>
          </div>
          
          <div className="bg-black/20 rounded-xl p-4">
            <h4 className="font-semibold text-white mb-3">📊 Conversion par source</h4>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-gray-300">Chat OmnIA</span>
                <span className="text-cyan-400 font-bold">42%</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-300">Navigation directe</span>
                <span className="text-blue-400 font-bold">18%</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-300">Google Ads</span>
                <span className="text-purple-400 font-bold">28%</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Marketing & Publicité */}
      <div className="bg-white/10 backdrop-blur-xl rounded-2xl p-6 md:p-8 border border-white/20">
        <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
          <TrendingUp className="w-6 h-6 text-purple-400" />
          Marketing & Publicité
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Google Ads */}
          <div className="bg-gradient-to-br from-blue-600/20 to-blue-700/20 rounded-xl p-6 border border-blue-500/30">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-8 h-8 bg-blue-500 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">G</span>
              </div>
              <h4 className="font-bold text-white">Google Ads</h4>
            </div>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-blue-200 text-sm">Impressions</span>
                <span className="text-white font-bold">12,450</span>
              </div>
              <div className="flex justify-between">
                <span className="text-blue-200 text-sm">Clics</span>
                <span className="text-white font-bold">891</span>
              </div>
              <div className="flex justify-between">
                <span className="text-blue-200 text-sm">CTR</span>
                <span className="text-green-400 font-bold">7.16%</span>
              </div>
              <div className="flex justify-between">
                <span className="text-blue-200 text-sm">CPC moyen</span>
                <span className="text-white font-bold">€0.85</span>
              </div>
            </div>
          </div>
          
          {/* Facebook Ads */}
          <div className="bg-gradient-to-br from-purple-600/20 to-purple-700/20 rounded-xl p-6 border border-purple-500/30">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-8 h-8 bg-purple-500 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">f</span>
              </div>
              <h4 className="font-bold text-white">Facebook Ads</h4>
            </div>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-purple-200 text-sm">Portée</span>
                <span className="text-white font-bold">8,235</span>
              </div>
              <div className="flex justify-between">
                <span className="text-purple-200 text-sm">Engagement</span>
                <span className="text-white font-bold">524</span>
              </div>
              <div className="flex justify-between">
                <span className="text-purple-200 text-sm">Taux eng.</span>
                <span className="text-green-400 font-bold">6.36%</span>
              </div>
              <div className="flex justify-between">
                <span className="text-purple-200 text-sm">CPM</span>
                <span className="text-white font-bold">€2.15</span>
              </div>
            </div>
          </div>
          
          {/* Email Marketing */}
          <div className="bg-gradient-to-br from-green-600/20 to-green-700/20 rounded-xl p-6 border border-green-500/30">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-8 h-8 bg-green-500 rounded-lg flex items-center justify-center">
                <Mail className="w-4 h-4 text-white" />
              </div>
              <h4 className="font-bold text-white">Email Marketing</h4>
            </div>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-green-200 text-sm">Abonnés</span>
                <span className="text-white font-bold">1,847</span>
              </div>
              <div className="flex justify-between">
                <span className="text-green-200 text-sm">Ouverture</span>
                <span className="text-green-400 font-bold">24.5%</span>
              </div>
              <div className="flex justify-between">
                <span className="text-green-200 text-sm">Clics</span>
                <span className="text-green-400 font-bold">3.8%</span>
              </div>
              <div className="flex justify-between">
                <span className="text-green-200 text-sm">Conversions</span>
                <span className="text-white font-bold">28</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* SEO Performance */}
      <div className="bg-white/10 backdrop-blur-xl rounded-2xl p-6 md:p-8 border border-white/20">
        <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
          <Search className="w-6 h-6 text-cyan-400" />
          Performance SEO
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Métriques SEO */}
          <div className="space-y-4">
            <div className="bg-black/20 rounded-xl p-4">
              <h4 className="font-semibold text-white mb-3">🔍 Métriques Google</h4>
              <div className="grid grid-cols-2 gap-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-cyan-400">1,245</div>
                  <div className="text-cyan-300 text-sm">Impressions</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-400">89</div>
                  <div className="text-green-300 text-sm">Clics SEO</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-yellow-400">7.1%</div>
                  <div className="text-yellow-300 text-sm">CTR</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-purple-400">12.4</div>
                  <div className="text-purple-300 text-sm">Position moy.</div>
                </div>
              </div>
            </div>
            
            <div className="bg-black/20 rounded-xl p-4">
              <h4 className="font-semibold text-white mb-3">📊 Santé technique</h4>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-gray-300 text-sm">Score PageSpeed</span>
                  <span className="text-green-400 font-bold">92/100</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-300 text-sm">Temps de chargement</span>
                  <span className="text-cyan-400 font-bold">1.2s</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-300 text-sm">Pages indexées</span>
                  <span className="text-white font-bold">247/247</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-300 text-sm">Erreurs 404</span>
                  <span className="text-red-400 font-bold">0</span>
                </div>
              </div>
            </div>
          </div>
          
          {/* Top mots-clés */}
          <div className="bg-black/20 rounded-xl p-4">
            <h4 className="font-semibold text-white mb-3">🎯 Top mots-clés</h4>
            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 bg-white/5 rounded-lg">
                <div>
                  <div className="text-white font-medium">canapé moderne</div>
                  <div className="text-gray-400 text-xs">Position: 3.2</div>
                </div>
                <div className="text-right">
                  <div className="text-cyan-400 font-bold">245</div>
                  <div className="text-gray-400 text-xs">clics</div>
                </div>
              </div>
              
              <div className="flex items-center justify-between p-3 bg-white/5 rounded-lg">
                <div>
                  <div className="text-white font-medium">table travertin</div>
                  <div className="text-gray-400 text-xs">Position: 5.1</div>
                </div>
                <div className="text-right">
                  <div className="text-cyan-400 font-bold">178</div>
                  <div className="text-gray-400 text-xs">clics</div>
                </div>
              </div>
              
              <div className="flex items-center justify-between p-3 bg-white/5 rounded-lg">
                <div>
                  <div className="text-white font-medium">chaise bureau design</div>
                  <div className="text-gray-400 text-xs">Position: 7.8</div>
                </div>
                <div className="text-right">
                  <div className="text-cyan-400 font-bold">92</div>
                  <div className="text-gray-400 text-xs">clics</div>
                </div>
              </div>
              
              <div className="flex items-center justify-between p-3 bg-white/5 rounded-lg">
                <div>
                  <div className="text-white font-medium">mobilier salon</div>
                  <div className="text-gray-400 text-xs">Position: 12.3</div>
                </div>
                <div className="text-right">
                  <div className="text-cyan-400 font-bold">67</div>
                  <div className="text-gray-400 text-xs">clics</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Marketing Campaigns */}
      <div className="bg-white/10 backdrop-blur-xl rounded-2xl p-6 md:p-8 border border-white/20">
        <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
          <Zap className="w-6 h-6 text-yellow-400" />
          Campagnes Marketing Actives
        </h3>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Campagne Google Ads */}
          <div className="bg-blue-500/20 border border-blue-400/30 rounded-xl p-6">
            <div className="flex items-center justify-between mb-4">
              <h4 className="font-bold text-blue-200">🎯 Google Ads - Canapés Hiver</h4>
              <span className="bg-green-500/20 text-green-300 px-2 py-1 rounded-full text-xs">Active</span>
            </div>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-blue-300 text-sm">Budget quotidien</span>
                <span className="text-white font-bold">€45</span>
              </div>
              <div className="flex justify-between">
                <span className="text-blue-300 text-sm">Dépensé aujourd'hui</span>
                <span className="text-cyan-400 font-bold">€38.50</span>
              </div>
              <div className="flex justify-between">
                <span className="text-blue-300 text-sm">ROAS</span>
                <span className="text-green-400 font-bold">3.8x</span>
              </div>
              <div className="flex justify-between">
                <span className="text-blue-300 text-sm">Conversions</span>
                <span className="text-white font-bold">12</span>
              </div>
            </div>
            <div className="mt-4 pt-4 border-t border-blue-400/20">
              <div className="text-sm text-blue-200">Mots-clés principaux :</div>
              <div className="flex flex-wrap gap-1 mt-2">
                <span className="bg-blue-600/30 text-blue-200 px-2 py-1 rounded text-xs">canapé convertible</span>
                <span className="bg-blue-600/30 text-blue-200 px-2 py-1 rounded text-xs">salon moderne</span>
                <span className="bg-blue-600/30 text-blue-200 px-2 py-1 rounded text-xs">velours côtelé</span>
              </div>
            </div>
          </div>
          
          {/* Campagne Facebook */}
          <div className="bg-purple-500/20 border border-purple-400/30 rounded-xl p-6">
            <div className="flex items-center justify-between mb-4">
              <h4 className="font-bold text-purple-200">📱 Facebook - Tables Design</h4>
              <span className="bg-green-500/20 text-green-300 px-2 py-1 rounded-full text-xs">Active</span>
            </div>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-purple-300 text-sm">Budget quotidien</span>
                <span className="text-white font-bold">€35</span>
              </div>
              <div className="flex justify-between">
                <span className="text-purple-300 text-sm">Dépensé aujourd'hui</span>
                <span className="text-cyan-400 font-bold">€29.80</span>
              </div>
              <div className="flex justify-between">
                <span className="text-purple-300 text-sm">ROAS</span>
                <span className="text-green-400 font-bold">4.2x</span>
              </div>
              <div className="flex justify-between">
                <span className="text-purple-300 text-sm">Conversions</span>
                <span className="text-white font-bold">8</span>
              </div>
            </div>
            <div className="mt-4 pt-4 border-t border-purple-400/20">
              <div className="text-sm text-purple-200">Audiences ciblées :</div>
              <div className="flex flex-wrap gap-1 mt-2">
                <span className="bg-purple-600/30 text-purple-200 px-2 py-1 rounded text-xs">Déco passionnés</span>
                <span className="bg-purple-600/30 text-purple-200 px-2 py-1 rounded text-xs">25-45 ans</span>
                <span className="bg-purple-600/30 text-purple-200 px-2 py-1 rounded text-xs">Île-de-France</span>
              </div>
            </div>
          </div>
        </div>
        
        {/* Actions rapides */}
        <div className="mt-6 flex flex-wrap gap-3">
          <button className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-xl text-sm transition-all">
            📊 Créer campagne Google
          </button>
          <button className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-xl text-sm transition-all">
            📱 Créer campagne Facebook
          </button>
          <button className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-xl text-sm transition-all">
            ✉️ Créer newsletter
          </button>
          <button className="bg-orange-600 hover:bg-orange-700 text-white px-4 py-2 rounded-xl text-sm transition-all">
            📈 Voir rapports détaillés
          </button>
        </div>
      </div>

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