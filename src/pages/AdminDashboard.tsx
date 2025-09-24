import React, { useState, useEffect } from 'react';
import {
  Users, Database, CheckCircle, AlertCircle, CreditCard, Receipt,
  TrendingUp, MessageSquare, ShoppingCart, Upload, Download,
  Bot, Globe, FileText, Eye, Settings, Store, LogOut, BarChart3, Brain,
  Clock, Star, X, ShoppingBag
} from 'lucide-react';
import { Logo } from '../components/Logo';
import { VendorDashboard } from '../components/VendorDashboard';
import { EcommerceIntegration } from '../components/EcommerceIntegration';
import { AITrainingInterface } from '../components/AITrainingInterface';
import { OmniaRobotTab } from '../components/OmniaRobotTab';
import { CatalogManagement } from '../components/CatalogManagement';
import { MLTrainingDashboard } from '../components/MLTrainingDashboard';
import { ConversationHistory } from '../components/ConversationHistory';
import { ProductsEnrichedTable } from '../components/ProductsEnrichedTable';
import { NotificationSystem, useNotifications } from '../components/NotificationSystem';
import { QrCode } from 'lucide-react';

interface AdminDashboardProps {
  onLogout: () => void;
  currentVendor?: {
    id: string;
    email: string;
    company_name: string;
    subdomain: string;
    plan: string;
    status: string;
    contact_name: string;
  };
}

interface DashboardStats {
  conversations: number;
  conversions: number;
  products: number;
  revenue: number;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({ onLogout, currentVendor }) => {
  const { notifications, showSuccess, showError, showInfo, removeNotification } = useNotifications();
  
  // Si un vendeur est connecté, afficher son dashboard personnalisé
  if (currentVendor) {
    return <VendorDashboard vendor={currentVendor} onLogout={onLogout} />;
  }

  const [activeTab, setActiveTab] = useState('dashboard');
  const [stats, setStats] = useState<DashboardStats>({
    conversations: 1234,
    conversions: 42,
    products: getActiveProductsCount(),
    revenue: 2450
  });
  const [connectedPlatforms, setConnectedPlatforms] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [showQR, setShowQR] = useState(false);

  // Fonction pour compter les produits actifs
  function getActiveProductsCount(vendorId?: string): number {
    try {
      const storageKey = vendorId ? `vendor_${vendorId}_products` : 'catalog_products';
      const savedProducts = localStorage.getItem(storageKey);
      if (savedProducts) {
        const products = JSON.parse(savedProducts);
        const activeProducts = products.filter((p: any) => p.status === 'active');
        return activeProducts.length;
      }
    } catch (error) {
      console.error('Erreur comptage produits:', error);
    }
    return 3; // Valeur par défaut Decora Home (3 produits de base)
  }

  const tabs = [
    { id: 'dashboard', label: 'Tableau de bord', icon: BarChart3 },
    { id: 'catalogue', label: 'Catalogue', icon: Database },
    { id: 'enriched', label: 'Catalogue Enrichi', icon: Brain },
    { id: 'integration', label: 'Intégration', icon: Globe },
    { id: 'ml-training', label: 'Entraînement IA', icon: Brain },
    { id: 'robot', label: 'Robot OmnIA', icon: Bot },
    { id: 'historique', label: 'Historique', icon: MessageSquare },
    { id: 'abonnement', label: 'Abonnement', icon: CreditCard },
    { id: 'settings', label: 'Paramètres', icon: Settings }
  ];

  const handlePlatformConnected = (platformData: any) => {
    console.log('Plateforme connectée:', platformData);
    
    setConnectedPlatforms(prev => [...prev, platformData]);
    
    // Sauvegarder les produits dans localStorage avec vendor_id si fournis
    if (platformData.products && Array.isArray(platformData.products)) {
      const storageKey = currentVendor ? `vendor_${currentVendor.id}_products` : 'catalog_products';
      const existingProducts = localStorage.getItem(storageKey);
      let allProducts = platformData.products;
      
      if (existingProducts) {
        try {
          const existing = JSON.parse(existingProducts);
          allProducts = [...existing, ...platformData.products];
        } catch (error) {
          console.error('Erreur parsing produits existants:', error);
        }
      }
      
      localStorage.setItem(storageKey, JSON.stringify(allProducts));
      console.log('✅ Produits sauvegardés dans localStorage:', allProducts.length);
    }
    
    // Update products count
    if (platformData.products_count) {
      setStats(prev => ({
        ...prev,
        products: getActiveProductsCount(currentVendor?.id)
      }));
    }
    
    showSuccess(
      'Plateforme connectée',
      `${platformData.name || 'Plateforme'} connectée avec ${platformData.products_count || 0} produits !`,
      [
        {
          label: 'Voir le catalogue',
          action: () => setActiveTab('catalogue'),
          variant: 'primary'
        }
      ]
    );
  };

  const handleTrainingComplete = (trainingStats: any) => {
    console.log('Entraînement IA terminé:', trainingStats);
  };

  const renderDashboard = () => (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">Interface Revendeur</h1>
          <p className="text-gray-300">Gestion de votre assistant IA OmnIA</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-xl flex items-center justify-center">
            <Store className="w-6 h-6 text-white" />
          </div>
          <div>
            <div className="text-white font-bold">Decora Home</div>
            <div className="text-gray-400 text-sm">Plan Professional</div>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-cyan-300 text-sm">{stats.products} produits actifs</span>
            <button
              onClick={() => setShowQR(!showQR)}
              className="p-2 bg-purple-500/20 hover:bg-purple-500/30 border border-purple-400/50 rounded-xl text-purple-300 hover:text-white transition-all"
              title="QR Code boutique"
            >
              <QrCode className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-blue-600/20 backdrop-blur-xl rounded-2xl p-6 border border-blue-500/30">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-blue-200 text-sm mb-1">Conversations</p>
              <p className="text-3xl font-bold text-white mb-1">{stats.conversations.toLocaleString()}</p>
              <p className="text-green-400 text-sm">+23% ce mois</p>
            </div>
            <MessageSquare className="w-10 h-10 text-blue-400" />
          </div>
        </div>
        
        <div className="bg-green-600/20 backdrop-blur-xl rounded-2xl p-6 border border-green-500/30">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-green-200 text-sm mb-1">Conversions</p>
              <p className="text-3xl font-bold text-white mb-1">{stats.conversions}%</p>
              <p className="text-green-400 text-sm">+8% ce mois</p>
            </div>
            <TrendingUp className="w-10 h-10 text-green-400" />
          </div>
        </div>
        
        <div className="bg-purple-600/20 backdrop-blur-xl rounded-2xl p-6 border border-purple-500/30">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-purple-200 text-sm mb-1">Produits</p>
              <p className="text-3xl font-bold text-white mb-1">{stats.products}</p>
              <p className="text-green-400 text-sm">+15% ce mois</p>
            </div>
            <Database className="w-10 h-10 text-purple-400" />
          </div>
        </div>
        
        <div className="bg-orange-600/20 backdrop-blur-xl rounded-2xl p-6 border border-orange-500/30">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-orange-200 text-sm mb-1">Revenus</p>
              <p className="text-3xl font-bold text-white mb-1">€{stats.revenue.toLocaleString()}</p>
              <p className="text-green-400 text-sm">+12% ce mois</p>
            </div>
            <Receipt className="w-10 h-10 text-orange-400" />
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-white/10 backdrop-blur-xl rounded-2xl p-8 border border-white/20">
        <h2 className="text-2xl font-bold text-white mb-6">Actions Rapides</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <button
            onClick={() => setActiveTab('integration')}
            className="bg-cyan-500/20 hover:bg-cyan-500/30 border border-cyan-400/50 rounded-xl p-6 text-left transition-all"
          >
            <Upload className="w-8 h-8 text-cyan-400 mb-3" />
            <h3 className="text-lg font-semibold text-white mb-2">Importer Catalogue</h3>
            <p className="text-gray-300 text-sm">CSV, Shopify ou XML</p>
          </button>
          
          <button
            onClick={() => setActiveTab('robot')}
            className="bg-purple-500/20 hover:bg-purple-500/30 border border-purple-400/50 rounded-xl p-6 text-left transition-all"
          >
            <Bot className="w-8 h-8 text-purple-400 mb-3" />
            <h3 className="text-lg font-semibold text-white mb-2">Configurer OmnIA</h3>
            <p className="text-gray-300 text-sm">Personnaliser votre robot</p>
          </button>
          
          <button
            onClick={() => window.open('/robot', '_blank')}
            className="bg-green-500/20 hover:bg-green-500/30 border border-green-400/50 rounded-xl p-6 text-left transition-all"
          >
            <Eye className="w-8 h-8 text-green-400 mb-3" />
            <h3 className="text-lg font-semibold text-white mb-2">Tester OmnIA</h3>
            <p className="text-gray-300 text-sm">Voir en action</p>
          </button>
        </div>
      </div>

      {/* Connected Platforms */}
      {connectedPlatforms.length > 0 && (
        <div className="bg-white/10 backdrop-blur-xl rounded-2xl p-8 border border-white/20">
          <h2 className="text-2xl font-bold text-white mb-6">Plateformes Connectées</h2>
          <div className="space-y-4">
            {connectedPlatforms.map((platform, index) => (
              <div key={index} className="flex items-center justify-between p-4 bg-green-500/20 rounded-xl border border-green-400/30">
                <div className="flex items-center gap-3">
                  <CheckCircle className="w-6 h-6 text-green-400" />
                  <div>
                    <div className="font-semibold text-white">{platform.name}</div>
                    <div className="text-sm text-green-300">
                      {platform.products_count} produits • {platform.platform}
                    </div>
                  </div>
                </div>
                <div className="text-sm text-green-400">
                  Connecté
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );

  // Modal QR Code
  const renderQRModal = () => (
    showQR && (
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
        <div className="bg-slate-800/95 backdrop-blur-xl rounded-2xl p-6 max-w-md w-full border border-slate-600/50">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-bold text-white">QR Code Boutique</h3>
            <button
              onClick={() => setShowQR(false)}
              className="text-gray-400 hover:text-white"
            >
              ×
            </button>
          </div>
          <div className="text-center">
            <div className="w-48 h-48 bg-white rounded-2xl flex items-center justify-center mx-auto mb-4">
              <img 
                src={`https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent('https://omnia.sale/chat')}`}
                alt="QR Code"
                className="w-44 h-44 rounded-xl"
              />
            </div>
            <p className="text-gray-300">Scannez pour accéder au chat OmnIA</p>
          </div>
        </div>
      </div>
    )
  );

  const renderCatalogue = () => (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-white">Gestion du Catalogue</h2>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 bg-green-400 rounded-full animate-pulse"></div>
          <span className="text-green-300 text-sm">{stats.products} produits actifs</span>
        </div>
      </div>

      <CatalogManagement />
    </div>
  );

  const renderEnriched = () => (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-white">Catalogue Enrichi IA</h2>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 bg-purple-400 rounded-full animate-pulse"></div>
          <span className="text-purple-300 text-sm">Enrichissement automatique actif</span>
        </div>
      </div>

      <ProductsEnrichedTable />
    </div>
  );
  
  const renderIntegration = () => (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-white">Intégration E-commerce</h2>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 bg-blue-400 rounded-full animate-pulse"></div>
          <span className="text-blue-300 text-sm">{connectedPlatforms.length} plateforme(s) connectée(s)</span>
        </div>
      </div>

      <EcommerceIntegration onConnected={handlePlatformConnected} />
    </div>
  );

  const renderMLTraining = () => (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-white">Entraînement IA</h2>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 bg-purple-400 rounded-full animate-pulse"></div>
          <span className="text-purple-300 text-sm">Modèle IA actif</span>
        </div>
      </div>

      <MLTrainingDashboard />
    </div>
  );

  const renderRobot = () => (
    <div className="space-y-8">
      <OmniaRobotTab />
    </div>
  );

  const renderHistorique = () => (
    <ConversationHistory />
  );

  const renderAbonnement = () => (
    <div className="space-y-8">
      <h2 className="text-2xl font-bold text-white">Abonnement Professional</h2>
      
      <div className="bg-white/10 backdrop-blur-xl rounded-2xl p-8 border border-white/20">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-xl font-bold text-white">Plan Professional</h3>
            <p className="text-gray-300">5000 conversations/mois • Produits illimités</p>
          </div>
          <div className="text-right">
            <div className="text-2xl font-bold text-cyan-400">€79/mois</div>
            <div className="text-sm text-green-400">Actif</div>
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h4 className="font-semibold text-white mb-3">Fonctionnalités incluses :</h4>
            <ul className="space-y-2 text-gray-300">
              <li className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-green-400" />
                5000 conversations/mois
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-green-400" />
                Produits illimités
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-green-400" />
                Support prioritaire
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-green-400" />
                Domaine personnalisé
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-green-400" />
                Analytics avancées
              </li>
            </ul>
          </div>
          
          <div>
            <h4 className="font-semibold text-white mb-3">Utilisation ce mois :</h4>
            <div className="space-y-3">
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-gray-300">Conversations</span>
                  <span className="text-white">{stats.conversations}/5000</span>
                </div>
                <div className="w-full bg-gray-700 rounded-full h-2">
                  <div 
                    className="bg-cyan-500 h-2 rounded-full" 
                    style={{ width: `${(stats.conversations / 5000) * 100}%` }}
                  ></div>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        <div className="flex gap-4 mt-6">
          <button 
            onClick={() => showInfo(
              'Upgrade Enterprise', 
              'Contactez notre équipe commerciale pour upgrader vers Enterprise : commercial@omnia.sale ou +33 1 84 88 32 45',
              [
                {
                  label: 'Contacter commercial',
                  action: () => window.open('mailto:commercial@omnia.sale?subject=Upgrade Enterprise', '_blank'),
                  variant: 'primary'
                }
              ]
            )}
            className="bg-cyan-600 hover:bg-cyan-700 text-white px-6 py-3 rounded-xl font-semibold transition-all"
          >
            Upgrade vers Enterprise
          </button>
          <button 
            onClick={() => showInfo(
              'Gestion abonnement', 
              'Accédez au portail client pour gérer votre abonnement, facturation et moyens de paiement.',
              [
                {
                  label: 'Portail client',
                  action: () => window.open('https://billing.omnia.sale/portal', '_blank'),
                  variant: 'primary'
                },
                {
                  label: 'Support facturation',
                  action: () => window.open('mailto:billing@omnia.sale', '_blank'),
                  variant: 'secondary'
                }
              ]
            )}
            className="bg-gray-600 hover:bg-gray-700 text-white px-6 py-3 rounded-xl font-semibold transition-all"
          >
            Gérer l'abonnement
          </button>
        </div>
      </div>
    </div>
  );

  const renderSettings = () => (
    <div className="space-y-8">
      <h2 className="text-2xl font-bold text-white">Paramètres</h2>
      
      <div className="bg-white/10 backdrop-blur-xl rounded-2xl p-8 border border-white/20">
        <h3 className="text-xl font-bold text-white mb-6">Configuration OmnIA</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm text-cyan-300 mb-2">Nom du robot</label>
            <input
              type="text"
              defaultValue="OmnIA"
              className="w-full bg-black/40 border border-cyan-500/50 rounded-xl px-4 py-3 text-white"
            />
          </div>
          <div>
            <label className="block text-sm text-cyan-300 mb-2">Personnalité</label>
            <select className="w-full bg-black/40 border border-cyan-500/50 rounded-xl px-4 py-3 text-white">
              <option value="commercial">Commercial & Amical</option>
              <option value="expert">Expert Technique</option>
              <option value="conseil">Conseiller Déco</option>
            </select>
          </div>
        </div>
        
        <div className="mt-6">
          <button className="bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white px-6 py-3 rounded-xl font-semibold transition-all">
            Sauvegarder les paramètres
          </button>
        </div>
      </div>
    </div>
  );

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard': return renderDashboard();
      case 'catalogue': return renderCatalogue();
      case 'enriched': return renderEnriched();
      case 'integration': return renderIntegration();
      case 'ml-training': return renderMLTraining();
      case 'robot': return renderRobot();
      case 'historique': return renderHistorique();
      case 'abonnement': return renderAbonnement();
      case 'settings': return renderSettings();
      default: return renderDashboard();
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-purple-900">
      <NotificationSystem notifications={notifications} onRemove={removeNotification} />
      {renderQRModal()}
      
      {/* Background Effects */}
      <div className="absolute inset-0 opacity-20">
        <div className="absolute top-20 left-20 w-72 h-72 bg-cyan-500/30 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-20 right-20 w-96 h-96 bg-purple-500/20 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '2s' }}></div>
      </div>

      <div className="relative z-10 flex h-screen">
        {/* Sidebar */}
        <div className="w-80 bg-slate-800/90 backdrop-blur-2xl border-r border-slate-700/50 p-6">
          {/* Header avec logo OmnIA */}
          <div className="flex items-center gap-3 mb-8">
            <div className="w-12 h-12 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-xl flex items-center justify-center">
              <Bot className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-white">OmnIA</h1>
              <p className="text-sm text-cyan-300">Commercial Mobilier IA</p>
            </div>
          </div>

          {/* Info magasin */}
          <div className="bg-slate-700/50 rounded-xl p-4 mb-6">
            <div className="text-white font-bold">Mon Magasin</div>
            <div className="text-gray-400 text-sm">Plan Professional</div>
          </div>

          {/* Navigation Menu */}
          <nav className="space-y-2 mb-8">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all text-left ${
                    activeTab === tab.id
                      ? 'bg-cyan-500/30 text-white border border-cyan-500/50'
                      : 'text-gray-300 hover:bg-slate-700/50 hover:text-white'
                  }`}
                >
                  <Icon className="w-5 h-5" />
                  <span className="font-medium">{tab.label}</span>
                </button>
              );
            })}
          </nav>

          {/* Status OmnIA */}
          <div className="bg-green-500/20 border border-green-400/50 rounded-xl p-4 mb-6">
            <div className="flex items-center gap-2 mb-2">
              <Bot className="w-5 h-5 text-green-400" />
              <span className="text-green-300 font-semibold">OmnIA Robot</span>
            </div>
            <p className="text-green-200 text-sm">Assistant IA actif et opérationnel</p>
          </div>
          
          <button
            onClick={onLogout}
            className="w-full bg-red-600/20 hover:bg-red-600/30 text-red-300 px-4 py-3 rounded-xl font-medium border border-red-500/30 transition-all"
          >
            Déconnexion
          </button>
        </div>

        {/* Main Content */}
        <div className="flex-1 overflow-y-auto p-8">
          {renderContent()}
        </div>
      </div>
    </div>
  );
};