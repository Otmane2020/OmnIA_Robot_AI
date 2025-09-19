import React, { useState, useEffect } from 'react';
import { 
  BarChart3, Package, ShoppingCart, DollarSign, Users, TrendingUp,
  Settings, LogOut, Bell, Search, Filter, Plus, Eye, Edit, Trash2,
  Upload, Download, RefreshCw, ExternalLink, CheckCircle, AlertCircle,
  Calendar, Clock, Globe, Target, Zap, Brain, Camera, Palette,
  FileText, Link, Image, Tag, Ruler, Weight, Star, Heart,
  Smartphone, Monitor, Headphones, Mic, Volume2, Play, Pause,
  ArrowRight, ChevronDown, ChevronUp, X, Save, Copy, Send,
  Database, Cloud, Wifi, Battery, Signal, Power, Home, Store,
  Mail, Phone, MapPin, Building, User, CreditCard, Shield, Minus
} from 'lucide-react';
import { Logo } from '../components/Logo';
import { CatalogManagement } from '../components/CatalogManagement';
import { ProductsEnrichedTable } from '../components/ProductsEnrichedTable';
import { AITrainingInterface } from '../components/AITrainingInterface';
import { ConversationHistory } from '../components/ConversationHistory';
import { MLTrainingDashboard } from '../components/MLTrainingDashboard';
import { EcommerceIntegration } from '../components/EcommerceIntegration';
import { GoogleAdsTab } from '../components/GoogleAdsTab';
import { GoogleMerchantTab } from '../components/GoogleMerchantTab';
import { SEOBlogTab } from '../components/SEOBlogTab';
import { OmniaRobotTab } from '../components/OmniaRobotTab';
import { VoiceChatInterface } from '../components/VoiceChatInterface';
import { NotificationSystem, useNotifications } from '../components/NotificationSystem';

interface AdminDashboardProps {
  onLogout: () => void;
}

interface RetailerData {
  id: string;
  email: string;
  company_name: string;
  contact_name: string;
  phone: string;
  address: string;
  city: string;
  postal_code: string;
  siret: string;
  position: string;
  plan: string;
  subdomain: string;
  status: string;
  created_at: string;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({ onLogout }) => {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [activeSubTab, setActiveSubTab] = useState('');
  const [showSettings, setShowSettings] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showCreateOrderModal, setShowCreateOrderModal] = useState(false);
  const [retailerData, setRetailerData] = useState<RetailerData>({
    id: 'demo-retailer-id',
    email: 'demo@decorahome.fr',
    company_name: 'Decora Home',
    contact_name: 'Alexandre Martin',
    phone: '+33 1 84 88 32 45',
    address: '123 Avenue des Champs-Élysées',
    city: 'Paris',
    postal_code: '75008',
    siret: '89780177500015',
    position: 'Directeur Commercial',
    plan: 'Professional',
    subdomain: 'decorahome',
    status: 'active',
    created_at: '2024-01-15T10:30:00Z'
  });

  const { notifications, removeNotification, showSuccess, showError, showInfo } = useNotifications();

  const mainTabs = [
    { id: 'dashboard', label: 'Dashboard', icon: BarChart3 },
    { id: 'ecommerce', label: 'E-Commerce', icon: ShoppingCart },
    { id: 'marketing', label: 'Ads & Marketing', icon: Target },
    { id: 'seo', label: 'SEO & Contenu', icon: FileText },
    { id: 'robot', label: 'Robot OmnIA', icon: Brain },
    { id: 'vision', label: 'Vision & Studio', icon: Camera },
    { id: 'analytics', label: 'Analytics', icon: BarChart3 },
    { id: 'reports', label: 'Rapports', icon: FileText }
  ];

  const ecommerceSubTabs = [
    { id: 'ecommerce-catalog', label: 'Catalogue', icon: Package },
    { id: 'ecommerce-shop', label: 'Shop', icon: ShoppingCart },
    { id: 'ecommerce-enriched', label: 'Catalogue Enrichi', icon: Brain },
    { id: 'ecommerce-cron', label: 'Cron de Données', icon: Clock },
    { id: 'ecommerce-training', label: 'Entraînement IA', icon: Brain },
    { id: 'ecommerce-integrations', label: 'Intégrations', icon: Link },
    { id: 'ecommerce-stock', label: 'Stock', icon: Database },
    { id: 'ecommerce-orders', label: 'Commandes', icon: ShoppingCart }
  ];

  const marketingSubTabs = [
    { id: 'ads-google', label: 'Google Ads', icon: Target },
    { id: 'ads-integration', label: 'Intégration Ads', icon: Settings },
    { id: 'ads-merchant', label: 'Google Merchant', icon: Store },
    { id: 'ads-campaigns', label: 'Campagnes', icon: Zap }
  ];

  const seoSubTabs = [
    { id: 'seo-blog', label: 'Blog & Articles', icon: FileText },
    { id: 'seo-auto-blogging', label: 'Auto Blogging', icon: Brain },
    { id: 'seo-backlinks', label: 'Backlinks', icon: Link },
    { id: 'seo-integration', label: 'Intégration', icon: Globe },
    { id: 'seo-optimization', label: 'Optimisation SEO', icon: Target }
  ];

  const visionSubTabs = [
    { id: 'vision-ar-mobile', label: 'AR Mobile', icon: Smartphone },
    { id: 'vision-vr-showroom', label: 'VR Showroom', icon: Monitor },
    { id: 'vision-photo-analysis', label: 'Analyse Photo IA', icon: Camera },
    { id: 'vision-ambiance-generator', label: 'Générateur d\'Ambiances', icon: Palette }
  ];

  useEffect(() => {
    // Set default sub-tabs
    if (activeTab === 'ecommerce' && !activeSubTab) {
      setActiveSubTab('ecommerce-catalog');
    } else if (activeTab === 'marketing' && !activeSubTab) {
      setActiveSubTab('ads-google');
    } else if (activeTab === 'seo' && !activeSubTab) {
      setActiveSubTab('seo-blog');
    } else if (activeTab === 'vision' && !activeSubTab) {
      setActiveSubTab('vision-ar-mobile');
    }
  }, [activeTab]);

  const renderDashboard = () => (
    <div className="space-y-8">
      <div>
        <h2 className="text-3xl font-bold text-white mb-2">Dashboard E-Commerce</h2>
        <p className="text-gray-300">Vue d'ensemble de votre activité OmnIA</p>
      </div>

      {/* Stats principales */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-blue-600/20 backdrop-blur-xl rounded-2xl p-6 border border-blue-500/30">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-blue-200 text-sm mb-1">Produits</p>
              <p className="text-3xl font-bold text-white">247</p>
              <p className="text-blue-300 text-sm">Catalogue</p>
            </div>
            <Package className="w-10 h-10 text-blue-400" />
          </div>
        </div>
        
        <div className="bg-green-600/20 backdrop-blur-xl rounded-2xl p-6 border border-green-500/30">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-green-200 text-sm mb-1">Commandes</p>
              <p className="text-3xl font-bold text-white">156</p>
              <p className="text-green-300 text-sm">Ce mois</p>
            </div>
            <ShoppingCart className="w-10 h-10 text-green-400" />
          </div>
        </div>
        
        <div className="bg-purple-600/20 backdrop-blur-xl rounded-2xl p-6 border border-purple-500/30">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-purple-200 text-sm mb-1">Chiffre d'affaires</p>
              <p className="text-3xl font-bold text-white">€34.5k</p>
              <p className="text-purple-300 text-sm">Ce mois</p>
            </div>
            <DollarSign className="w-10 h-10 text-purple-400" />
          </div>
        </div>
        
        <div className="bg-orange-600/20 backdrop-blur-xl rounded-2xl p-6 border border-orange-500/30">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-orange-200 text-sm mb-1">Conversations</p>
              <p className="text-3xl font-bold text-white">1,234</p>
              <p className="text-orange-300 text-sm">OmnIA Robot</p>
            </div>
            <Brain className="w-10 h-10 text-orange-400" />
          </div>
        </div>
      </div>

      {/* Synthèse activité */}
      <div className="bg-white/10 backdrop-blur-xl rounded-2xl p-8 border border-white/20">
        <h3 className="text-xl font-bold text-white mb-6">Synthèse de l'activité</h3>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div>
            <h4 className="font-semibold text-cyan-300 mb-4">📊 Performance OmnIA Robot :</h4>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-gray-300">Taux de conversion :</span>
                <span className="text-green-400 font-bold">42%</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-300">Satisfaction client :</span>
                <span className="text-green-400 font-bold">4.8/5</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-300">Temps de réponse :</span>
                <span className="text-cyan-400 font-bold">1.2s</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-300">Disponibilité :</span>
                <span className="text-green-400 font-bold">99.9%</span>
              </div>
            </div>
          </div>
          
          <div>
            <h4 className="font-semibold text-green-300 mb-4">💰 Revenus générés :</h4>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-gray-300">Aujourd'hui :</span>
                <span className="text-green-400 font-bold">€1,245</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-300">Cette semaine :</span>
                <span className="text-green-400 font-bold">€8,760</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-300">Ce mois :</span>
                <span className="text-green-400 font-bold">€34,500</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-300">Panier moyen :</span>
                <span className="text-cyan-400 font-bold">€221</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const renderECommerceCatalog = () => (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-white">Catalogue Produits</h2>
          <p className="text-gray-300">Gestion de votre catalogue produits</p>
        </div>
      </div>

      <CatalogManagement />
    </div>
  );

  const renderECommerceShop = () => (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-white">Boutique E-Commerce</h2>
          <p className="text-gray-300">Interface client avec panier et checkout Stripe</p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={() => window.open('/shop', '_blank')}
            className="bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-400 hover:to-emerald-500 text-white px-4 py-2 rounded-xl flex items-center gap-2 font-semibold transition-all"
          >
            <ExternalLink className="w-4 h-4" />
            Voir la boutique
          </button>
        </div>
      </div>

      {/* Aperçu boutique */}
      <div className="bg-white/10 backdrop-blur-xl rounded-2xl p-8 border border-white/20">
        <h3 className="text-xl font-bold text-white mb-6">Aperçu de votre boutique</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[
            {
              title: 'Canapé ALYANA - Beige',
              price: 799,
              compareAtPrice: 1399,
              image: 'https://cdn.shopify.com/s/files/1/0903/7578/2665/files/7_23a97631-68d2-4f3e-8f78-b26c7cd4c2ae.png',
              stock: 45
            },
            {
              title: 'Table AUREA Ø100cm - Travertin',
              price: 499,
              compareAtPrice: 859,
              image: 'https://cdn.shopify.com/s/files/1/0903/7578/2665/files/3_e80b9a50-b032-4267-8f5b-f9130153e3be.png',
              stock: 30
            },
            {
              title: 'Chaise INAYA - Gris chenille',
              price: 99,
              compareAtPrice: 149,
              image: 'https://cdn.shopify.com/s/files/1/0903/7578/2665/files/3_3f11d1af-8ce5-4d2d-a435-cd0a78eb92ee.png',
              stock: 96
            }
          ].map((product, index) => (
            <div key={index} className="bg-black/20 rounded-xl p-4 border border-white/10">
              <div className="w-full h-48 rounded-xl overflow-hidden bg-gray-600 mb-4">
                <img 
                  src={product.image} 
                  alt={product.title}
                  className="w-full h-full object-cover"
                />
              </div>
              <h4 className="font-semibold text-white mb-2">{product.title}</h4>
              <div className="flex items-center gap-2 mb-2">
                <span className="text-xl font-bold text-green-400">{product.price}€</span>
                {product.compareAtPrice && (
                  <>
                    <span className="text-gray-400 line-through text-sm">{product.compareAtPrice}€</span>
                    <span className="bg-red-500/20 text-red-300 px-2 py-1 rounded-full text-xs">
                      -{Math.round(((product.compareAtPrice - product.price) / product.compareAtPrice) * 100)}%
                    </span>
                  </>
                )}
              </div>
              <div className="text-gray-300 text-sm">Stock: {product.stock}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Configuration Stripe */}
      <div className="bg-white/10 backdrop-blur-xl rounded-2xl p-8 border border-white/20">
        <h3 className="text-xl font-bold text-white mb-6">Configuration Stripe</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm text-cyan-300 mb-2">Clé publique Stripe</label>
            <input
              type="text"
              placeholder="pk_test_..."
              className="w-full bg-black/40 border border-cyan-500/50 rounded-xl px-4 py-3 text-white placeholder-cyan-400"
            />
          </div>
          <div>
            <label className="block text-sm text-cyan-300 mb-2">Clé secrète Stripe</label>
            <input
              type="password"
              placeholder="sk_test_..."
              className="w-full bg-black/40 border border-cyan-500/50 rounded-xl px-4 py-3 text-white placeholder-cyan-400"
            />
          </div>
        </div>
        
        <div className="mt-6">
          <button
            onClick={() => showSuccess('Stripe configuré', 'Paiements activés pour votre boutique !')}
            className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-400 hover:to-purple-500 text-white px-6 py-3 rounded-xl font-semibold transition-all"
          >
            Configurer Stripe
          </button>
        </div>
      </div>
    </div>
  );

  const renderECommerceEnriched = () => (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-white">Catalogue Enrichi IA</h2>
          <p className="text-gray-300">5 produits enrichis • Score moyen: 91%</p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={() => {
              showSuccess('Enrichissement IA', 'Analyse DeepSeek démarrée pour tous les produits !');
              // Simuler enrichissement
              setTimeout(() => {
                showSuccess('Enrichissement terminé', '5 produits enrichis avec attributs complets !');
              }, 3000);
            }}
            className="bg-gradient-to-r from-purple-500 to-pink-600 hover:from-purple-400 hover:to-pink-500 text-white px-4 py-2 rounded-xl flex items-center gap-2 font-semibold transition-all"
          >
            <Brain className="w-4 h-4" />
            Enrichir avec DeepSeek
          </button>
        </div>
      </div>

      {/* Table enrichie avec vraies données */}
      <div className="bg-white/10 backdrop-blur-xl rounded-2xl border border-white/20 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-black/20">
              <tr>
                <th className="text-left p-4 text-cyan-300 font-semibold">Produit</th>
                <th className="text-left p-4 text-cyan-300 font-semibold">Attributs IA</th>
                <th className="text-left p-4 text-cyan-300 font-semibold">Dimensions</th>
                <th className="text-left p-4 text-cyan-300 font-semibold">SEO</th>
                <th className="text-left p-4 text-cyan-300 font-semibold">Google Shopping</th>
                <th className="text-left p-4 text-cyan-300 font-semibold">Score IA</th>
                <th className="text-left p-4 text-cyan-300 font-semibold">Actions</th>
              </tr>
            </thead>
            <tbody>
              {[
                {
                  id: 'alyana-beige',
                  title: 'Canapé ALYANA convertible - Beige',
                  category: 'Canapé',
                  subcategory: 'Canapé d\'angle',
                  color: 'Beige',
                  material: 'Velours côtelé, bois, métal',
                  style: 'Moderne',
                  dimensions: '240x160x75cm',
                  price: 799,
                  stock: 45,
                  image: 'https://cdn.shopify.com/s/files/1/0903/7578/2665/files/7_23a97631-68d2-4f3e-8f78-b26c7cd4c2ae.png',
                  seo_title: 'Canapé Convertible ALYANA Beige - Design Moderne',
                  seo_description: 'Découvrez le canapé convertible ALYANA en velours côtelé beige...',
                  gtin: '3701234567890',
                  google_category: 'Furniture > Living Room Furniture > Sofas',
                  confidence: 95
                },
                {
                  id: 'aurea-travertin-100',
                  title: 'Table AUREA Ø100cm - Travertin',
                  category: 'Table',
                  subcategory: 'Table à manger',
                  color: 'Naturel, Travertin',
                  material: 'Travertin naturel, métal noir',
                  style: 'Contemporain',
                  dimensions: 'Ø100x75cm',
                  price: 499,
                  stock: 30,
                  image: 'https://cdn.shopify.com/s/files/1/0903/7578/2665/files/3_e80b9a50-b032-4267-8f5b-f9130153e3be.png',
                  seo_title: 'Table Ronde AUREA Travertin Ø100cm - Élégance Naturelle',
                  seo_description: 'Table à manger ronde AUREA en travertin naturel...',
                  gtin: '3701234567891',
                  google_category: 'Furniture > Tables > Dining Tables',
                  confidence: 92
                },
                {
                  id: 'inaya-gris-chenille',
                  title: 'Chaise INAYA - Gris chenille',
                  category: 'Chaise',
                  subcategory: 'Chaise de salle à manger',
                  color: 'Gris clair',
                  material: 'Chenille, métal noir',
                  style: 'Contemporain',
                  dimensions: '45x55x85cm',
                  price: 99,
                  stock: 96,
                  image: 'https://cdn.shopify.com/s/files/1/0903/7578/2665/files/3_3f11d1af-8ce5-4d2d-a435-cd0a78eb92ee.png',
                  seo_title: 'Chaise INAYA Gris Chenille - Design Contemporain',
                  seo_description: 'Chaise INAYA en tissu chenille gris avec pieds métal noir...',
                  gtin: '3701234567892',
                  google_category: 'Furniture > Chairs > Dining Chairs',
                  confidence: 88
                }
              ].map((product) => (
                <tr key={product.id} className="border-b border-white/10 hover:bg-white/5">
                  <td className="p-4">
                    <div className="flex items-center gap-3">
                      <div className="w-16 h-16 rounded-lg overflow-hidden bg-gray-600 flex-shrink-0">
                        <img 
                          src={product.image} 
                          alt={product.title}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="font-semibold text-white text-sm">{product.title}</div>
                        <div className="text-gray-400 text-xs">{product.category} • {product.subcategory}</div>
                        <div className="text-green-400 font-bold">{product.price}€</div>
                        <div className="text-gray-500 text-xs">Stock: {product.stock}</div>
                      </div>
                    </div>
                  </td>
                  
                  <td className="p-4">
                    <div className="space-y-1">
                      <div className="flex flex-wrap gap-1">
                        {product.color.split(',').slice(0, 2).map((color, index) => (
                          <span key={index} className="bg-blue-500/20 text-blue-300 px-2 py-1 rounded text-xs">
                            {color.trim()}
                          </span>
                        ))}
                      </div>
                      <div className="flex flex-wrap gap-1">
                        {product.material.split(',').slice(0, 2).map((material, index) => (
                          <span key={index} className="bg-green-500/20 text-green-300 px-2 py-1 rounded text-xs">
                            {material.trim()}
                          </span>
                        ))}
                      </div>
                      <div className="flex flex-wrap gap-1">
                        <span className="bg-purple-500/20 text-purple-300 px-2 py-1 rounded text-xs">
                          {product.style}
                        </span>
                      </div>
                    </div>
                  </td>
                  
                  <td className="p-4">
                    <div className="text-white text-sm">{product.dimensions}</div>
                  </td>
                  
                  <td className="p-4">
                    <div className="space-y-1 text-xs">
                      <div className="text-white font-medium">{product.seo_title.substring(0, 30)}...</div>
                      <div className="text-gray-400">{product.seo_description.substring(0, 40)}...</div>
                    </div>
                  </td>
                  
                  <td className="p-4">
                    <div className="space-y-1 text-xs">
                      <div className="text-cyan-400">GTIN: {product.gtin}</div>
                      <div className="text-orange-400">{product.google_category.split(' > ').pop()}</div>
                    </div>
                  </td>
                  
                  <td className="p-4">
                    <div className="text-center">
                      <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                        product.confidence >= 90 ? 'bg-green-500/20 text-green-300' :
                        product.confidence >= 70 ? 'bg-yellow-500/20 text-yellow-300' :
                        'bg-red-500/20 text-red-300'
                      }`}>
                        {product.confidence}%
                      </span>
                    </div>
                  </td>
                  
                  <td className="p-4">
                    <div className="flex gap-2">
                      <button
                        onClick={() => showInfo('Enrichissement', `Enrichissement DeepSeek pour ${product.title}`)}
                        className="text-purple-400 hover:text-purple-300 p-1"
                        title="Enrichir avec IA"
                      >
                        <Brain className="w-4 h-4" />
                      </button>
                      <button
                        className="text-blue-400 hover:text-blue-300 p-1"
                        title="Voir détails"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => {
                          if (confirm(`Supprimer ${product.title} ?`)) {
                            showSuccess('Produit supprimé', `${product.title} supprimé du catalogue enrichi.`);
                          }
                        }}
                        className="text-red-400 hover:text-red-300 p-1"
                        title="Supprimer"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );

  const renderECommerceCron = () => (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-white">Cron de Données</h2>
          <p className="text-gray-300">Synchronisation automatique des données</p>
        </div>
      </div>

      <MLTrainingDashboard />
    </div>
  );

  const renderECommerceTraining = () => (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-white">Entraînement IA</h2>
          <p className="text-gray-300">Formation de l'intelligence artificielle</p>
        </div>
      </div>

      <AITrainingInterface />
    </div>
  );

  const renderECommerceIntegrations = () => (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-white">Intégrations E-Commerce</h2>
          <p className="text-gray-300">Connectez vos plateformes</p>
        </div>
      </div>

      <EcommerceIntegration onConnected={() => {}} />
    </div>
  );

  const renderECommerceStock = () => (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-white">Gestion des Stocks</h2>
          <p className="text-gray-300">5 produits • 171 unités total</p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={() => showInfo('Synchronisation', 'Mise à jour des stocks depuis Shopify...')}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-xl flex items-center gap-2 transition-all"
          >
            <RefreshCw className="w-4 h-4" />
            Synchroniser
          </button>
        </div>
      </div>

      {/* Table des stocks */}
      <div className="bg-white/10 backdrop-blur-xl rounded-2xl border border-white/20 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-black/20">
              <tr>
                <th className="text-left p-4 text-cyan-300 font-semibold">Image</th>
                <th className="text-left p-4 text-cyan-300 font-semibold">Titre</th>
                <th className="text-left p-4 text-cyan-300 font-semibold">Statut</th>
                <th className="text-left p-4 text-cyan-300 font-semibold">Quantité Stock</th>
                <th className="text-left p-4 text-cyan-300 font-semibold">Actions</th>
              </tr>
            </thead>
            <tbody>
              {[
                { id: 1, title: 'Canapé ALYANA - Beige', image: 'https://cdn.shopify.com/s/files/1/0903/7578/2665/files/7_23a97631-68d2-4f3e-8f78-b26c7cd4c2ae.png', available: true, stock: 45 },
                { id: 2, title: 'Table AUREA Ø100cm', image: 'https://cdn.shopify.com/s/files/1/0903/7578/2665/files/3_e80b9a50-b032-4267-8f5b-f9130153e3be.png', available: true, stock: 30 },
                { id: 3, title: 'Chaise INAYA - Gris', image: 'https://cdn.shopify.com/s/files/1/0903/7578/2665/files/3_3f11d1af-8ce5-4d2d-a435-cd0a78eb92ee.png', available: true, stock: 96 },
                { id: 4, title: 'Table AUREA Ø120cm', image: 'https://cdn.shopify.com/s/files/1/0903/7578/2665/files/2_89637aec-60b5-403f-9f0f-57c9a2fa42e4.png', available: false, stock: 0 },
                { id: 5, title: 'Chaise INAYA - Moka', image: 'https://cdn.shopify.com/s/files/1/0903/7578/2665/files/1_aae7ccd2-f2cb-4418-8c84-210ace00d753.png', available: true, stock: 100 }
              ].map((item) => (
                <tr key={item.id} className="border-b border-white/10 hover:bg-white/5">
                  <td className="p-4">
                    <div className="w-16 h-16 rounded-lg overflow-hidden bg-gray-600">
                      <img 
                        src={item.image} 
                        alt={item.title}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  </td>
                  <td className="p-4">
                    <div className="font-semibold text-white">{item.title}</div>
                  </td>
                  <td className="p-4">
                    <button
                      onClick={() => {
                        const newStatus = !item.available;
                        showSuccess('Statut modifié', `Produit ${newStatus ? 'activé' : 'désactivé'}`);
                      }}
                      className={`px-3 py-1 rounded-full text-sm font-medium ${
                        item.available 
                          ? 'bg-green-500/20 text-green-300 hover:bg-green-500/30' 
                          : 'bg-red-500/20 text-red-300 hover:bg-red-500/30'
                      } transition-all cursor-pointer`}
                    >
                      {item.available ? 'Oui' : 'Non'}
                    </button>
                  </td>
                  <td className="p-4">
                    <input
                      type="number"
                      defaultValue={item.stock}
                      onChange={(e) => {
                        const newStock = parseInt(e.target.value) || 0;
                        showInfo('Stock modifié', `Stock mis à jour: ${newStock} unités`);
                      }}
                      className="w-20 bg-black/40 border border-cyan-500/50 rounded-lg px-3 py-2 text-white text-center"
                    />
                  </td>
                  <td className="p-4">
                    <div className="flex gap-2">
                      <button
                        onClick={() => showInfo('Stock ajusté', `+10 unités ajoutées au stock`)}
                        className="text-green-400 hover:text-green-300 p-1"
                        title="Ajouter stock"
                      >
                        <Plus className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => showInfo('Stock réduit', `-5 unités retirées du stock`)}
                        className="text-yellow-400 hover:text-yellow-300 p-1"
                        title="Réduire stock"
                      >
                        <Minus className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );

  const renderECommerceOrders = () => (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-white">Gestion des Commandes</h2>
          <p className="text-gray-300">12 commandes • €3,247 CA total</p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={() => setShowCreateOrderModal(true)}
            className="bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-400 hover:to-emerald-500 text-white px-4 py-2 rounded-xl flex items-center gap-2 font-semibold transition-all"
          >
            <Plus className="w-4 h-4" />
            Créer commande manuelle
          </button>
        </div>
      </div>

      {/* Table des commandes */}
      <div className="bg-white/10 backdrop-blur-xl rounded-2xl border border-white/20 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-black/20">
              <tr>
                <th className="text-left p-4 text-cyan-300 font-semibold">Commande</th>
                <th className="text-left p-4 text-cyan-300 font-semibold">Client</th>
                <th className="text-left p-4 text-cyan-300 font-semibold">Produits</th>
                <th className="text-left p-4 text-cyan-300 font-semibold">Total</th>
                <th className="text-left p-4 text-cyan-300 font-semibold">Statut</th>
                <th className="text-left p-4 text-cyan-300 font-semibold">Source</th>
                <th className="text-left p-4 text-cyan-300 font-semibold">Actions</th>
              </tr>
            </thead>
            <tbody>
              {[
                {
                  id: 'CMD-001',
                  client: 'Marie Dubois',
                  email: 'marie@email.com',
                  products: 'Canapé ALYANA + Table AUREA',
                  total: 1298,
                  status: 'payée',
                  source: 'OmnIA Robot',
                  date: '15/01/2025'
                },
                {
                  id: 'CMD-002',
                  client: 'Jean Martin',
                  email: 'jean@email.com',
                  products: '2x Chaise INAYA',
                  total: 198,
                  status: 'en_cours',
                  source: 'Boutique',
                  date: '14/01/2025'
                },
                {
                  id: 'CMD-003',
                  client: 'Sophie Laurent',
                  email: 'sophie@email.com',
                  products: 'Table AUREA Ø120cm',
                  total: 549,
                  status: 'expédiée',
                  source: 'OmnIA Robot',
                  date: '13/01/2025'
                }
              ].map((order) => (
                <tr key={order.id} className="border-b border-white/10 hover:bg-white/5">
                  <td className="p-4">
                    <div className="font-semibold text-white">{order.id}</div>
                    <div className="text-gray-400 text-xs">{order.date}</div>
                  </td>
                  <td className="p-4">
                    <div className="text-white">{order.client}</div>
                    <div className="text-gray-400 text-xs">{order.email}</div>
                  </td>
                  <td className="p-4">
                    <div className="text-white text-sm">{order.products}</div>
                  </td>
                  <td className="p-4">
                    <div className="text-green-400 font-bold">{order.total}€</div>
                  </td>
                  <td className="p-4">
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                      order.status === 'payée' ? 'bg-green-500/20 text-green-300' :
                      order.status === 'en_cours' ? 'bg-yellow-500/20 text-yellow-300' :
                      order.status === 'expédiée' ? 'bg-blue-500/20 text-blue-300' :
                      'bg-gray-500/20 text-gray-300'
                    }`}>
                      {order.status}
                    </span>
                  </td>
                  <td className="p-4">
                    <span className={`px-2 py-1 rounded-full text-xs ${
                      order.source === 'OmnIA Robot' ? 'bg-purple-500/20 text-purple-300' : 'bg-blue-500/20 text-blue-300'
                    }`}>
                      {order.source}
                    </span>
                  </td>
                  <td className="p-4">
                    <div className="flex gap-2">
                      <button
                        onClick={() => showInfo('Commande', `Détails de la commande ${order.id}`)}
                        className="text-blue-400 hover:text-blue-300 p-1"
                        title="Voir détails"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => showInfo('Email', `Email de suivi envoyé à ${order.client}`)}
                        className="text-green-400 hover:text-green-300 p-1"
                        title="Envoyer email"
                      >
                        <Mail className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );

  const renderECommerceContent = () => {
    switch (activeSubTab) {
      case 'ecommerce-catalog': return renderECommerceCatalog();
      case 'ecommerce-shop': return renderECommerceShop();
      case 'ecommerce-enriched': return renderECommerceEnriched();
      case 'ecommerce-cron': return renderECommerceCron();
      case 'ecommerce-training': return renderECommerceTraining();
      case 'ecommerce-integrations': return renderECommerceIntegrations();
      case 'ecommerce-stock': return renderECommerceStock();
      case 'ecommerce-orders': return renderECommerceOrders();
      default: return renderECommerceCatalog();
    }
  };

  const renderAdsGoogleAds = () => (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-white">Google Ads</h2>
          <p className="text-gray-300">Veuillez d'abord vous connecter à votre compte Google Ads</p>
        </div>
      </div>

      {/* Connexion Google Ads requise */}
      <div className="bg-yellow-500/20 border border-yellow-400/50 rounded-2xl p-8 text-center">
        <Target className="w-16 h-16 text-yellow-400 mx-auto mb-4" />
        <h3 className="text-xl font-bold text-white mb-4">Connexion Google Ads requise</h3>
        <p className="text-yellow-300 mb-6">
          Connectez votre compte Google Ads pour créer et gérer vos campagnes automatiquement
        </p>
        <button
          onClick={() => {
            setActiveSubTab('ads-integration');
            showInfo('Redirection', 'Accédez à l\'onglet Intégration pour connecter Google Ads');
          }}
          className="bg-gradient-to-r from-yellow-500 to-orange-600 hover:from-yellow-400 hover:to-orange-500 text-white px-8 py-4 rounded-xl font-bold transition-all"
        >
          Connecter Google Ads
        </button>
      </div>
    </div>
  );

  const renderAdsIntegration = () => (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-bold text-white">Intégration Google Ads</h2>
        <p className="text-gray-300">Configuration API Google Ads</p>
      </div>

      {/* Formulaire de connexion Google Ads */}
      <div className="bg-white/10 backdrop-blur-xl rounded-2xl p-8 border border-white/20">
        <h3 className="text-xl font-bold text-white mb-6">Configuration Google Ads API</h3>
        
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm text-cyan-300 mb-2">Client ID Google</label>
              <input
                type="text"
                placeholder="123456789-abc.apps.googleusercontent.com"
                className="w-full bg-black/40 border border-cyan-500/50 rounded-xl px-4 py-3 text-white placeholder-cyan-400"
              />
            </div>
            <div>
              <label className="block text-sm text-cyan-300 mb-2">Client Secret</label>
              <input
                type="password"
                placeholder="Votre client secret"
                className="w-full bg-black/40 border border-cyan-500/50 rounded-xl px-4 py-3 text-white placeholder-cyan-400"
              />
            </div>
            <div>
              <label className="block text-sm text-cyan-300 mb-2">Developer Token</label>
              <input
                type="password"
                placeholder="Votre developer token"
                className="w-full bg-black/40 border border-cyan-500/50 rounded-xl px-4 py-3 text-white placeholder-cyan-400"
              />
            </div>
            <div>
              <label className="block text-sm text-cyan-300 mb-2">Customer ID</label>
              <input
                type="text"
                placeholder="123-456-7890"
                className="w-full bg-black/40 border border-cyan-500/50 rounded-xl px-4 py-3 text-white placeholder-cyan-400"
              />
            </div>
          </div>
          
          <button
            onClick={() => {
              showSuccess('Google Ads connecté !', 'API configurée avec succès. Campagnes automatiques disponibles !');
              setTimeout(() => setActiveSubTab('ads-google'), 1000);
            }}
            className="bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-400 hover:to-emerald-500 text-white px-6 py-3 rounded-xl font-semibold transition-all"
          >
            Connecter Google Ads
          </button>
        </div>
      </div>
    </div>
  );

  const renderAdsMerchant = () => (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-bold text-white">Google Merchant Center</h2>
        <p className="text-gray-300">Flux automatique: https://decorahome.omnia.sale/feed/xml/google-shopping.xml</p>
      </div>

      {/* Configuration flux Google Merchant */}
      <div className="bg-white/10 backdrop-blur-xl rounded-2xl p-8 border border-white/20">
        <h3 className="text-xl font-bold text-white mb-6">Flux Google Shopping</h3>
        
        <div className="space-y-6">
          <div className="bg-green-500/20 border border-green-400/50 rounded-xl p-6">
            <h4 className="font-semibold text-green-200 mb-3">✅ Flux automatique configuré</h4>
            <div>
              <label className="block text-sm text-green-300 mb-2">URL du flux XML :</label>
              <div className="flex gap-3">
                <input
                  type="text"
                  value="https://decorahome.omnia.sale/feed/xml/google-shopping.xml"
                  readOnly
                  className="flex-1 bg-black/40 border border-green-500/50 rounded-xl px-4 py-3 text-white font-mono text-sm"
                />
                <button
                  onClick={() => {
                    navigator.clipboard.writeText('https://decorahome.omnia.sale/feed/xml/google-shopping.xml');
                    showSuccess('URL copiée', 'URL du flux copiée dans le presse-papiers !');
                  }}
                  className="bg-green-600 hover:bg-green-700 text-white px-4 py-3 rounded-xl flex items-center gap-2 transition-all"
                >
                  <Copy className="w-4 h-4" />
                  Copier
                </button>
              </div>
            </div>
          </div>
          
          {/* Guide d'importation */}
          <div className="bg-blue-500/20 border border-blue-400/50 rounded-xl p-6">
            <h4 className="font-semibold text-blue-200 mb-4">📋 Guide d'importation dans Google Merchant Center</h4>
            <ol className="text-blue-300 space-y-2 text-sm">
              <li>1. <strong>Connectez-vous</strong> à merchants.google.com</li>
              <li>2. <strong>Produits</strong> → Flux → Ajouter un flux</li>
              <li>3. <strong>Collez l'URL</strong> : https://decorahome.omnia.sale/feed/xml/google-shopping.xml</li>
              <li>4. <strong>Fréquence</strong> : Quotidienne (mise à jour automatique)</li>
              <li>5. <strong>Validation</strong> : Google vérifie le flux (24-48h)</li>
            </ol>
          </div>
          
          <div className="flex gap-4">
            <button
              onClick={() => window.open('https://merchants.google.com', '_blank')}
              className="bg-orange-600 hover:bg-orange-700 text-white px-6 py-3 rounded-xl font-semibold transition-all flex items-center gap-2"
            >
              <ExternalLink className="w-4 h-4" />
              Google Merchant Center
            </button>
            <button
              onClick={() => showInfo('Flux généré', 'Flux XML généré avec 5 produits enrichis !')}
              className="bg-purple-600 hover:bg-purple-700 text-white px-6 py-3 rounded-xl font-semibold transition-all flex items-center gap-2"
            >
              <RefreshCw className="w-4 h-4" />
              Régénérer flux
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  const renderAdsCampaigns = () => (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-white">Gestion des Campagnes</h2>
      
      <div className="bg-white/10 backdrop-blur-xl rounded-2xl p-8 border border-white/20">
        <div className="text-center py-12">
          <Target className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-xl font-bold text-white mb-2">Campagnes publicitaires</h3>
          <p className="text-gray-400">Gestion des campagnes Google Ads et Facebook</p>
        </div>
      </div>
    </div>
  );

  const renderMarketingContent = () => {
    switch (activeSubTab) {
      case 'ads-google':
        return renderAdsGoogleAds();
      case 'ads-integration':
        return renderAdsIntegration();
      case 'ads-merchant':
        return renderAdsMerchant();
      case 'ads-campaigns':
        return renderAdsCampaigns();
      default:
        return renderAdsGoogleAds();
    }
  };

  const renderSEOBlog = () => (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-bold text-white">Blog & Articles SEO</h2>
        <p className="text-gray-300">Création et gestion de contenu SEO</p>
      </div>

      <SEOBlogTab />
    </div>
  );

  const renderSEOAutoBlogging = () => (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-white">Auto Blogging</h2>
      
      <div className="bg-white/10 backdrop-blur-xl rounded-2xl p-8 border border-white/20">
        <h3 className="text-xl font-bold text-white mb-6">Planification automatique d'articles</h3>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div>
            <h4 className="font-semibold text-cyan-300 mb-4">📅 Planification :</h4>
            <div className="space-y-4">
              <div>
                <label className="block text-sm text-gray-300 mb-2">Fréquence</label>
                <select className="w-full bg-black/40 border border-gray-600 rounded-xl px-4 py-3 text-white">
                  <option value="daily">Quotidien</option>
                  <option value="weekly">Hebdomadaire</option>
                  <option value="monthly">Mensuel</option>
                </select>
              </div>
              <div>
                <label className="block text-sm text-gray-300 mb-2">Mots-clés cibles</label>
                <textarea
                  placeholder="tendances mobilier 2025, canapé convertible, table travertin..."
                  className="w-full bg-black/40 border border-gray-600 rounded-xl px-4 py-3 text-white h-24"
                />
              </div>
            </div>
          </div>
          
          <div>
            <h4 className="font-semibold text-green-300 mb-4">🎯 Thèmes suggérés :</h4>
            <div className="space-y-2">
              {[
                'Tendances mobilier 2025',
                'Guide achat canapé convertible',
                'Aménagement salon 20m²',
                'Matériaux naturels déco',
                'Couleurs tendance intérieur'
              ].map((theme, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-black/20 rounded-lg">
                  <span className="text-white">{theme}</span>
                  <button className="bg-cyan-600 hover:bg-cyan-700 text-white px-3 py-1 rounded-lg text-sm">
                    Planifier
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const renderSEOBacklinks = () => (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-white">Gestion des Backlinks</h2>
      
      <div className="bg-white/10 backdrop-blur-xl rounded-2xl p-8 border border-white/20">
        <h3 className="text-xl font-bold text-white mb-6">Liens créés automatiquement</h3>
        
        <div className="space-y-4">
          {[
            { url: 'https://blog-deco.fr/tendances-2025', article: 'Tendances Mobilier 2025', date: '15/01/2025', status: 'Actif' },
            { url: 'https://maison-moderne.com/canapé-guide', article: 'Guide Canapé Convertible', date: '12/01/2025', status: 'Actif' },
            { url: 'https://deco-inspiration.fr/salon', article: 'Aménagement Salon', date: '10/01/2025', status: 'En attente' }
          ].map((link, index) => (
            <div key={index} className="bg-black/20 rounded-xl p-4 border border-white/10">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-semibold text-white">{link.article}</h4>
                  <a href={link.url} className="text-cyan-400 hover:text-cyan-300 text-sm">{link.url}</a>
                  <p className="text-gray-400 text-sm">{link.date}</p>
                </div>
                <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                  link.status === 'Actif' ? 'bg-green-500/20 text-green-300' : 'bg-yellow-500/20 text-yellow-300'
                }`}>
                  {link.status}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  const renderSEOIntegration = () => (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-white">Intégration SEO</h2>
      
      <div className="bg-white/10 backdrop-blur-xl rounded-2xl p-8 border border-white/20">
        <h3 className="text-xl font-bold text-white mb-6">Partage automatique des articles</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {[
            { platform: 'WordPress', status: 'Connecté', articles: 12 },
            { platform: 'Shopify', status: 'Connecté', articles: 8 },
            { platform: 'PrestaShop', status: 'Non connecté', articles: 0 },
            { platform: 'Magento', status: 'Non connecté', articles: 0 }
          ].map((platform, index) => (
            <div key={index} className="bg-black/20 rounded-xl p-6 border border-white/10">
              <div className="flex items-center justify-between mb-4">
                <h4 className="font-semibold text-white">{platform.platform}</h4>
                <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                  platform.status === 'Connecté' ? 'bg-green-500/20 text-green-300' : 'bg-red-500/20 text-red-300'
                }`}>
                  {platform.status}
                </span>
              </div>
              <p className="text-gray-300 text-sm mb-4">{platform.articles} articles partagés</p>
              <button className={`w-full py-2 rounded-xl font-semibold transition-all ${
                platform.status === 'Connecté' 
                  ? 'bg-blue-600 hover:bg-blue-700 text-white' 
                  : 'bg-green-600 hover:bg-green-700 text-white'
              }`}>
                {platform.status === 'Connecté' ? 'Configurer' : 'Connecter'}
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  const renderSEOOptimization = () => (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-white">Optimisation SEO</h2>
      
      <div className="bg-white/10 backdrop-blur-xl rounded-2xl p-8 border border-white/20">
        <h3 className="text-xl font-bold text-white mb-6">Optimisation avec DeepSeek IA</h3>
        
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <label className="block text-sm text-gray-300 mb-2">Image Alt</label>
              <textarea
                placeholder="Description alternative de l'image..."
                className="w-full bg-black/40 border border-gray-600 rounded-xl px-4 py-3 text-white h-24"
              />
            </div>
            <div>
              <label className="block text-sm text-gray-300 mb-2">SEO Title</label>
              <textarea
                placeholder="Titre SEO optimisé..."
                className="w-full bg-black/40 border border-gray-600 rounded-xl px-4 py-3 text-white h-24"
              />
            </div>
            <div>
              <label className="block text-sm text-gray-300 mb-2">SEO Description</label>
              <textarea
                placeholder="Meta description SEO..."
                className="w-full bg-black/40 border border-gray-600 rounded-xl px-4 py-3 text-white h-24"
              />
            </div>
          </div>
          
          <div className="bg-green-500/20 border border-green-400/50 rounded-xl p-4">
            <h4 className="font-semibold text-green-200 mb-2">📈 Gain SEO estimé :</h4>
            <div className="grid grid-cols-3 gap-4 text-center">
              <div>
                <div className="text-2xl font-bold text-green-400">+45%</div>
                <div className="text-green-300 text-sm">Trafic organique</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-blue-400">+28%</div>
                <div className="text-blue-300 text-sm">Clics Google</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-purple-400">+15%</div>
                <div className="text-purple-300 text-sm">Conversions</div>
              </div>
            </div>
          </div>
          
          <div className="flex gap-4">
            <button className="bg-gradient-to-r from-purple-500 to-pink-600 hover:from-purple-400 hover:to-pink-500 text-white px-6 py-3 rounded-xl font-semibold">
              Optimiser avec DeepSeek
            </button>
            <button className="bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-xl font-semibold">
              Envoyer à Shopify
            </button>
            <button className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-xl font-semibold">
              Auto Export
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  const renderSEOContent = () => {
    switch (activeSubTab) {
      case 'seo-blog':
        return renderSEOBlog();
      case 'seo-auto-blogging':
        return renderSEOAutoBlogging();
      case 'seo-backlinks':
        return renderSEOBacklinks();
      case 'seo-integration':
        return renderSEOIntegration();
      case 'seo-optimization':
        return renderSEOOptimization();
      default:
        return renderSEOBlog();
    }
  };

  const renderVisionARMobile = () => (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-white">AR Mobile - Réalité Augmentée</h2>
      
      <div className="bg-white/10 backdrop-blur-xl rounded-2xl p-8 border border-white/20">
        <h3 className="text-xl font-bold text-white mb-6">📱 Scanner une pièce → Placer meubles Decora Home</h3>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div>
            <h4 className="font-semibold text-cyan-300 mb-4">🎯 Fonctionnalités AR :</h4>
            <ul className="text-cyan-200 space-y-2 text-sm">
              <li>• <strong>Scan 3D de la pièce :</strong> Détection automatique des murs, sol, plafond</li>
              <li>• <strong>Placement virtuel :</strong> Canapé ALYANA, Table AUREA, Chaises INAYA</li>
              <li>• <strong>Échelle réelle :</strong> Dimensions exactes des meubles</li>
              <li>• <strong>Éclairage adaptatif :</strong> Rendu selon lumière ambiante</li>
              <li>• <strong>Capture photo/vidéo :</strong> Partage sur réseaux sociaux</li>
              <li>• <strong>Achat direct :</strong> Panier depuis l'AR</li>
            </ul>
          </div>
          
          <div>
            <h4 className="font-semibold text-green-300 mb-4">📊 Statistiques AR :</h4>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-gray-300">Sessions AR :</span>
                <span className="text-green-400 font-bold">1,456</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-300">Conversions AR :</span>
                <span className="text-green-400 font-bold">68%</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-300">Temps moyen :</span>
                <span className="text-cyan-400 font-bold">4m 32s</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-300">Partages sociaux :</span>
                <span className="text-purple-400 font-bold">234</span>
              </div>
            </div>
          </div>
        </div>
        
        <div className="mt-8 bg-gradient-to-r from-cyan-500/20 to-blue-600/20 rounded-xl p-6 border border-cyan-400/30">
          <h4 className="font-semibold text-white mb-4">🚀 Lancer l'expérience AR</h4>
          <div className="flex gap-4">
            <button className="bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white px-6 py-3 rounded-xl font-semibold">
              Démo AR Mobile
            </button>
            <button className="bg-purple-600 hover:bg-purple-700 text-white px-6 py-3 rounded-xl font-semibold">
              Configurer AR
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  const renderVisionVRShowroom = () => (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-white">VR Showroom - Visite Immersive</h2>
      
      <div className="bg-white/10 backdrop-blur-xl rounded-2xl p-8 border border-white/20">
        <h3 className="text-xl font-bold text-white mb-6">🕶️ Showroom virtuel Decora Home</h3>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div>
            <h4 className="font-semibold text-purple-300 mb-4">🏠 Espaces virtuels :</h4>
            <div className="space-y-3">
              {[
                { name: 'Salon Moderne', products: 'Canapé ALYANA + Table AUREA', visitors: 456 },
                { name: 'Salle à Manger', products: 'Table AUREA + Chaises INAYA', visitors: 234 },
                { name: 'Bureau Design', products: 'Chaise INAYA + Console', visitors: 189 },
                { name: 'Chambre Cosy', products: 'Lit + Commode + Miroir', visitors: 123 }
              ].map((space, index) => (
                <div key={index} className="bg-black/20 rounded-xl p-4 border border-white/10">
                  <div className="flex items-center justify-between">
                    <div>
                      <h5 className="font-semibold text-white">{space.name}</h5>
                      <p className="text-gray-300 text-sm">{space.products}</p>
                    </div>
                    <div className="text-right">
                      <div className="text-purple-400 font-bold">{space.visitors}</div>
                      <div className="text-gray-400 text-xs">visiteurs</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
          
          <div>
            <h4 className="font-semibold text-orange-300 mb-4">🎮 Contrôles VR :</h4>
            <ul className="text-orange-200 space-y-2 text-sm">
              <li>• <strong>Navigation libre :</strong> Déplacement dans le showroom</li>
              <li>• <strong>Interaction produits :</strong> Clic pour détails et prix</li>
              <li>• <strong>Changement couleurs :</strong> Variantes en temps réel</li>
              <li>• <strong>Mesures AR :</strong> Dimensions dans l'espace</li>
              <li>• <strong>Panier VR :</strong> Ajout direct depuis la visite</li>
              <li>• <strong>Guide vocal :</strong> OmnIA Robot en VR</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );

  const renderVisionPhotoAnalysis = () => (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-white">Analyse Photo IA</h2>
      
      <div className="bg-white/10 backdrop-blur-xl rounded-2xl p-8 border border-white/20">
        <h3 className="text-xl font-bold text-white mb-6">📸 Upload photo → Recommandations OmnIA</h3>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div>
            <div className="border-2 border-dashed border-cyan-500/50 rounded-xl p-8 text-center">
              <Camera className="w-16 h-16 text-cyan-400 mx-auto mb-4" />
              <h4 className="text-lg font-bold text-white mb-2">Analyser une pièce</h4>
              <p className="text-gray-300 mb-4">Upload photo → IA détecte style, couleurs, besoins</p>
              <button className="bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white px-6 py-3 rounded-xl font-semibold">
                Choisir photo
              </button>
            </div>
          </div>
          
          <div>
            <h4 className="font-semibold text-green-300 mb-4">🤖 Capacités IA :</h4>
            <ul className="text-green-200 space-y-2 text-sm">
              <li>• <strong>Détection style :</strong> Moderne, scandinave, industriel...</li>
              <li>• <strong>Analyse couleurs :</strong> Palette dominante et accents</li>
              <li>• <strong>Mobilier existant :</strong> Identification et état</li>
              <li>• <strong>Espace disponible :</strong> Mesures et circulation</li>
              <li>• <strong>Recommandations :</strong> Produits Decora Home adaptés</li>
              <li>• <strong>Ambiance cible :</strong> Suggestions d'amélioration</li>
            </ul>
            
            <div className="mt-6 bg-blue-500/20 border border-blue-400/50 rounded-xl p-4">
              <h5 className="font-semibold text-blue-200 mb-2">📊 Dernières analyses :</h5>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-blue-300">Salon moderne</span>
                  <span className="text-blue-400">→ Table AUREA</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-blue-300">Chambre cosy</span>
                  <span className="text-blue-400">→ Lit + Commode</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-blue-300">Bureau design</span>
                  <span className="text-blue-400">→ Chaise INAYA</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const renderVisionAmbianceGenerator = () => (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-white">Générateur d'Ambiances</h2>
      
      <div className="bg-white/10 backdrop-blur-xl rounded-2xl p-8 border border-white/20">
        <h3 className="text-xl font-bold text-white mb-6">🎨 Génération d'ambiances complètes</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[
            { 
              style: 'Minimaliste', 
              description: 'Épuré, fonctionnel, tons neutres',
              products: ['Table AUREA', 'Chaises INAYA'],
              color: 'from-gray-500 to-slate-600'
            },
            { 
              style: 'Cosy', 
              description: 'Chaleureux, textures douces, couleurs chaudes',
              products: ['Canapé ALYANA', 'Coussins', 'Plaids'],
              color: 'from-orange-500 to-red-600'
            },
            { 
              style: 'Design Haut de Gamme', 
              description: 'Luxueux, matériaux nobles, finitions premium',
              products: ['Collection complète', 'Éclairage design'],
              color: 'from-purple-500 to-pink-600'
            }
          ].map((ambiance, index) => (
            <div key={index} className="bg-black/20 rounded-xl p-6 border border-white/10">
              <div className={`w-full h-32 bg-gradient-to-br ${ambiance.color} rounded-xl mb-4 flex items-center justify-center`}>
                <Palette className="w-12 h-12 text-white" />
              </div>
              <h4 className="font-semibold text-white mb-2">{ambiance.style}</h4>
              <p className="text-gray-300 text-sm mb-3">{ambiance.description}</p>
              <div className="text-xs text-gray-400 mb-4">
                Produits : {ambiance.products.join(', ')}
              </div>
              <button className="w-full bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white py-2 rounded-xl font-semibold">
                Générer ambiance
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  const renderVisionContent = () => {
    switch (activeSubTab) {
      case 'vision-ar-mobile':
        return renderVisionARMobile();
      case 'vision-vr-showroom':
        return renderVisionVRShowroom();
      case 'vision-photo-analysis':
        return renderVisionPhotoAnalysis();
      case 'vision-ambiance-generator':
        return renderVisionAmbianceGenerator();
      default:
        return renderVisionARMobile();
    }
  };

  const renderAnalytics = () => (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-white">Analytics Détaillées</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-blue-600/20 backdrop-blur-xl rounded-2xl p-6 border border-blue-500/30">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-blue-200 text-sm mb-1">Pages vues</p>
              <p className="text-3xl font-bold text-white">45,678</p>
              <p className="text-blue-300 text-sm">Ce mois</p>
            </div>
            <Eye className="w-10 h-10 text-blue-400" />
          </div>
        </div>
        
        <div className="bg-green-600/20 backdrop-blur-xl rounded-2xl p-6 border border-green-500/30">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-green-200 text-sm mb-1">Taux de rebond</p>
              <p className="text-3xl font-bold text-white">23%</p>
              <p className="text-green-300 text-sm">Excellent</p>
            </div>
            <TrendingUp className="w-10 h-10 text-green-400" />
          </div>
        </div>
        
        <div className="bg-purple-600/20 backdrop-blur-xl rounded-2xl p-6 border border-purple-500/30">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-purple-200 text-sm mb-1">Durée session</p>
              <p className="text-3xl font-bold text-white">4m 12s</p>
              <p className="text-purple-300 text-sm">Moyenne</p>
            </div>
            <Clock className="w-10 h-10 text-purple-400" />
          </div>
        </div>
        
        <div className="bg-orange-600/20 backdrop-blur-xl rounded-2xl p-6 border border-orange-500/30">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-orange-200 text-sm mb-1">Nouveaux visiteurs</p>
              <p className="text-3xl font-bold text-white">67%</p>
              <p className="text-orange-300 text-sm">Acquisition</p>
            </div>
            <Users className="w-10 h-10 text-orange-400" />
          </div>
        </div>
      </div>
    </div>
  );

  const renderReports = () => (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-white">Rapports</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[
          { name: 'Rapport Ventes', description: 'Analyse des ventes par période', icon: DollarSign, color: 'from-green-500 to-emerald-600' },
          { name: 'Rapport Produits', description: 'Performance des produits', icon: Package, color: 'from-blue-500 to-cyan-600' },
          { name: 'Rapport Clients', description: 'Comportement et satisfaction', icon: Users, color: 'from-purple-500 to-pink-600' },
          { name: 'Rapport SEO', description: 'Performance référencement', icon: Globe, color: 'from-orange-500 to-red-600' },
          { name: 'Rapport Robot', description: 'Conversations et IA', icon: Brain, color: 'from-cyan-500 to-blue-600' },
          { name: 'Rapport Marketing', description: 'Campagnes et ROI', icon: Target, color: 'from-pink-500 to-purple-600' }
        ].map((report, index) => {
          const Icon = report.icon;
          return (
            <div key={index} className="bg-white/10 backdrop-blur-xl rounded-2xl p-6 border border-white/20 hover:border-cyan-500/50 transition-all">
              <div className={`w-16 h-16 bg-gradient-to-r ${report.color} rounded-2xl flex items-center justify-center mb-4`}>
                <Icon className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-lg font-bold text-white mb-2">{report.name}</h3>
              <p className="text-gray-300 text-sm mb-4">{report.description}</p>
              <button className="w-full bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white py-2 rounded-xl font-semibold">
                Générer rapport
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );

  const getSubTabs = () => {
    switch (activeTab) {
      case 'ecommerce':
        return ecommerceSubTabs;
      case 'marketing':
        return marketingSubTabs;
      case 'seo':
        return seoSubTabs;
      case 'vision':
        return visionSubTabs;
      default:
        return [];
    }
  };

  const renderTabContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return renderDashboard();
      case 'ecommerce':
        return renderECommerceContent();
      case 'marketing':
        return renderMarketingContent();
      case 'seo':
        return renderSEOContent();
      case 'robot':
        return <OmniaRobotTab />;
      case 'vision':
        return renderVisionContent();
      case 'analytics':
        return renderAnalytics();
      case 'reports':
        return renderReports();
      default:
        return renderDashboard();
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-purple-900">
      {/* Background Effects */}
      <div className="absolute inset-0 opacity-20">
        <div className="absolute top-20 left-20 w-72 h-72 bg-cyan-500/30 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-20 right-20 w-96 h-96 bg-purple-500/20 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '2s' }}></div>
      </div>

      {/* Notifications */}
      <NotificationSystem 
        notifications={notifications} 
        onRemove={removeNotification} 
      />

      {/* Header */}
      <header className="relative z-10 bg-black/20 backdrop-blur-xl border-b border-white/10 sticky top-0">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <Logo size="md" />
            
            <div className="flex items-center space-x-4">
              <button
                onClick={() => setShowNotifications(!showNotifications)}
                className="relative p-2 bg-white/10 hover:bg-white/20 rounded-xl transition-all"
              >
                <Bell className="w-5 h-5 text-white" />
                <span className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full"></span>
              </button>
              
              <button
                onClick={() => setShowSettings(!showSettings)}
                className="relative p-2 bg-white/10 hover:bg-white/20 rounded-xl transition-all"
                title="Paramètres du compte"
              >
                <Settings className="w-5 h-5 text-white" />
              </button>
              
              <button
                onClick={onLogout}
                className="flex items-center gap-2 text-red-300 hover:text-red-200 transition-colors"
              >
                <LogOut className="w-4 h-4" />
                <span className="hidden sm:inline">Déconnexion</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Onglets horizontaux principaux */}
      <div className="relative z-10 bg-black/10 backdrop-blur-xl border-b border-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex space-x-1 overflow-x-auto py-2">
            {mainTabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => {
                    setActiveTab(tab.id);
                    setActiveSubTab('');
                  }}
                  className={`flex items-center gap-2 px-4 py-3 rounded-xl transition-all whitespace-nowrap ${
                    activeTab === tab.id
                      ? 'bg-cyan-500 text-white shadow-lg'
                      : 'text-gray-300 hover:bg-white/10 hover:text-white'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span className="font-medium">{tab.label}</span>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Sous-onglets */}
      {getSubTabs().length > 0 && (
        <div className="relative z-10 bg-black/5 backdrop-blur-xl border-b border-white/5">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex space-x-1 overflow-x-auto py-2">
              {getSubTabs().map((subTab) => {
                const Icon = subTab.icon;
                return (
                  <button
                    key={subTab.id}
                    onClick={() => setActiveSubTab(subTab.id)}
                    className={`flex items-center gap-2 px-3 py-2 rounded-lg transition-all whitespace-nowrap text-sm ${
                      activeSubTab === subTab.id
                        ? 'bg-white/20 text-cyan-300 border border-cyan-500/30'
                        : 'text-gray-400 hover:bg-white/10 hover:text-white'
                    }`}
                  >
                    <Icon className="w-3 h-3" />
                    <span>{subTab.label}</span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* Main Content */}
      <main className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {renderTabContent()}
      </main>

      {/* Modal Paramètres */}
      {showSettings && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-800/95 backdrop-blur-xl rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto border border-slate-600/50">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-white">Paramètres du Compte</h2>
                <button
                  onClick={() => setShowSettings(false)}
                  className="text-gray-400 hover:text-white transition-colors"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              <div className="space-y-8">
                {/* Informations Entreprise */}
                <div className="bg-black/20 rounded-xl p-6">
                  <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                    <Building className="w-5 h-5 text-blue-400" />
                    Entreprise
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm text-gray-300 mb-2">Nom de l'entreprise</label>
                      <input
                        type="text"
                        value={retailerData.company_name}
                        onChange={(e) => setRetailerData(prev => ({ ...prev, company_name: e.target.value }))}
                        className="w-full bg-black/40 border border-gray-600 rounded-xl px-4 py-3 text-white"
                      />
                    </div>
                    <div>
                      <label className="block text-sm text-gray-300 mb-2">SIRET</label>
                      <input
                        type="text"
                        value={retailerData.siret}
                        onChange={(e) => setRetailerData(prev => ({ ...prev, siret: e.target.value }))}
                        className="w-full bg-black/40 border border-gray-600 rounded-xl px-4 py-3 text-white font-mono"
                      />
                    </div>
                    <div>
                      <label className="block text-sm text-gray-300 mb-2">Plan</label>
                      <select
                        value={retailerData.plan}
                        onChange={(e) => setRetailerData(prev => ({ ...prev, plan: e.target.value }))}
                        className="w-full bg-black/40 border border-gray-600 rounded-xl px-4 py-3 text-white"
                      >
                        <option value="Basic">Basic</option>
                        <option value="Professional">Professional</option>
                        <option value="Enterprise">Enterprise</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm text-gray-300 mb-2">Sous-domaine</label>
                      <input
                        type="text"
                        value={retailerData.subdomain}
                        onChange={(e) => setRetailerData(prev => ({ ...prev, subdomain: e.target.value }))}
                        className="w-full bg-black/40 border border-gray-600 rounded-xl px-4 py-3 text-white"
                      />
                    </div>
                  </div>
                </div>

                {/* Contact */}
                <div className="bg-black/20 rounded-xl p-6">
                  <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                    <User className="w-5 h-5 text-green-400" />
                    Contact
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm text-gray-300 mb-2">Nom du contact</label>
                      <input
                        type="text"
                        value={retailerData.contact_name}
                        onChange={(e) => setRetailerData(prev => ({ ...prev, contact_name: e.target.value }))}
                        className="w-full bg-black/40 border border-gray-600 rounded-xl px-4 py-3 text-white"
                      />
                    </div>
                    <div>
                      <label className="block text-sm text-gray-300 mb-2">Email</label>
                      <input
                        type="email"
                        value={retailerData.email}
                        onChange={(e) => setRetailerData(prev => ({ ...prev, email: e.target.value }))}
                        className="w-full bg-black/40 border border-gray-600 rounded-xl px-4 py-3 text-white"
                      />
                    </div>
                    <div>
                      <label className="block text-sm text-gray-300 mb-2">Téléphone</label>
                      <input
                        type="tel"
                        value={retailerData.phone}
                        onChange={(e) => setRetailerData(prev => ({ ...prev, phone: e.target.value }))}
                        className="w-full bg-black/40 border border-gray-600 rounded-xl px-4 py-3 text-white"
                      />
                    </div>
                    <div>
                      <label className="block text-sm text-gray-300 mb-2">Position</label>
                      <input
                        type="text"
                        value={retailerData.position}
                        onChange={(e) => setRetailerData(prev => ({ ...prev, position: e.target.value }))}
                        className="w-full bg-black/40 border border-gray-600 rounded-xl px-4 py-3 text-white"
                      />
                    </div>
                  </div>
                </div>

                {/* Adresse */}
                <div className="bg-black/20 rounded-xl p-6">
                  <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                    <MapPin className="w-5 h-5 text-purple-400" />
                    Adresse
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="md:col-span-2">
                      <label className="block text-sm text-gray-300 mb-2">Adresse</label>
                      <input
                        type="text"
                        value={retailerData.address}
                        onChange={(e) => setRetailerData(prev => ({ ...prev, address: e.target.value }))}
                        className="w-full bg-black/40 border border-gray-600 rounded-xl px-4 py-3 text-white"
                      />
                    </div>
                    <div>
                      <label className="block text-sm text-gray-300 mb-2">Ville</label>
                      <input
                        type="text"
                        value={retailerData.city}
                        onChange={(e) => setRetailerData(prev => ({ ...prev, city: e.target.value }))}
                        className="w-full bg-black/40 border border-gray-600 rounded-xl px-4 py-3 text-white"
                      />
                    </div>
                    <div>
                      <label className="block text-sm text-gray-300 mb-2">Code postal</label>
                      <input
                        type="text"
                        value={retailerData.postal_code}
                        onChange={(e) => setRetailerData(prev => ({ ...prev, postal_code: e.target.value }))}
                        className="w-full bg-black/40 border border-gray-600 rounded-xl px-4 py-3 text-white"
                      />
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex gap-4">
                  <button
                    onClick={() => {
                      showSuccess('Paramètres sauvegardés', 'Vos informations ont été mises à jour avec succès !');
                      setShowSettings(false);
                    }}
                    className="bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-400 hover:to-emerald-500 text-white px-6 py-3 rounded-xl font-semibold transition-all flex items-center gap-2"
                  >
                    <Save className="w-4 h-4" />
                    Sauvegarder
                  </button>
                  <button
                    onClick={() => setShowSettings(false)}
                    className="bg-gray-600 hover:bg-gray-700 text-white px-6 py-3 rounded-xl font-semibold transition-all"
                  >
                    Annuler
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};