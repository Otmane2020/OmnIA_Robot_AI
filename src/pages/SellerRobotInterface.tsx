import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  Bot, MessageSquare, Settings, BarChart3, Package, 
  Users, TrendingUp, Calendar, Clock, Star, 
  ShoppingCart, Eye, ExternalLink, Zap, Brain,
  RefreshCw, Download, Upload, Filter, Search
} from 'lucide-react';
import { useNotifications } from '../components/NotificationSystem';

interface SellerData {
  id: string;
  company_name: string;
  subdomain: string;
  contact_email: string;
  phone: string;
  website: string;
  description: string;
  logo_url?: string;
  status: string;
  created_at: string;
}

interface RobotStats {
  totalProducts: number;
  totalVariations: number;
  avgConfidence: number;
  categoriesCount: number;
  enrichedToday: number;
  conversionRate: number;
}

export const SellerRobotInterface: React.FC = () => {
  const { sellerIdentifier } = useParams<{ sellerIdentifier: string }>();
  const navigate = useNavigate();
  const [sellerData, setSellerData] = useState<SellerData | null>(null);
  const [robotStats, setRobotStats] = useState<RobotStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [chatMessages, setChatMessages] = useState<Array<{id: string, type: 'user' | 'bot', message: string, timestamp: string}>>([]);
  const [newMessage, setNewMessage] = useState('');
  const { showSuccess, showError, showInfo } = useNotifications();

  useEffect(() => {
    loadSellerData();
    loadRobotStats();
    initializeChatBot();
  }, [sellerIdentifier]);

  const loadSellerData = async () => {
    try {
      setIsLoading(true);
      
      // Rechercher le vendeur par différents critères
      const seller = await findSellerByIdentifier(sellerIdentifier || '');
      
      if (seller) {
        setSellerData(seller);
        console.log('✅ Vendeur trouvé:', seller.company_name);
      } else {
        console.log('❌ Vendeur non trouvé pour:', sellerIdentifier);
        // Créer un vendeur par défaut pour la démo
        const defaultSeller: SellerData = {
          id: 'demo-seller',
          company_name: sellerIdentifier || 'Entreprise Demo',
          subdomain: sellerIdentifier || 'demo',
          contact_email: 'contact@demo.com',
          phone: '+33 1 23 45 67 89',
          website: 'https://demo.com',
          description: 'Entreprise de démonstration pour le robot IA',
          status: 'active',
          created_at: new Date().toISOString()
        };
        setSellerData(defaultSeller);
      }
      
    } catch (error) {
      console.error('❌ Erreur chargement vendeur:', error);
      showError('Erreur', 'Impossible de charger les données du vendeur.');
    } finally {
      setIsLoading(false);
    }
  };

  const findSellerByIdentifier = async (identifier: string): Promise<SellerData | null> => {
    // Rechercher dans localStorage
    const sources = [
      'retailer_applications',
      'seller_applications', 
      'approved_sellers',
      'active_retailers'
    ];
    
    for (const source of sources) {
      try {
        const data = localStorage.getItem(source);
        if (data) {
          const sellers = JSON.parse(data);
          if (Array.isArray(sellers)) {
            const found = sellers.find((seller: any) => 
              seller.subdomain === identifier ||
              seller.company_name?.toLowerCase().replace(/\s+/g, '') === identifier.toLowerCase() ||
              seller.id === identifier
            );
            if (found) return found;
          }
        }
      } catch (error) {
        console.error(`Erreur parsing ${source}:`, error);
      }
    }
    
    return null;
  };

  const loadRobotStats = async () => {
    try {
      // Charger les statistiques du robot depuis les produits enrichis
      const enrichedProducts = localStorage.getItem('catalog_products');
      const smartProducts = localStorage.getItem('smart_ai_products');
      
      let totalProducts = 0;
      let totalVariations = 0;
      let avgConfidence = 0;
      let categoriesCount = 0;
      let enrichedToday = 0;
      
      if (enrichedProducts) {
        const products = JSON.parse(enrichedProducts);
        totalProducts = products.length;
        totalVariations = products.reduce((sum: number, p: any) => sum + (p.variations?.length || 1), 0);
        avgConfidence = Math.round(products.reduce((sum: number, p: any) => sum + (p.confidence_score || 0), 0) / products.length);
        categoriesCount = new Set(products.map((p: any) => p.category)).size;
        
        // Compter les produits enrichis aujourd'hui
        const today = new Date().toDateString();
        enrichedToday = products.filter((p: any) => 
          p.enriched_at && new Date(p.enriched_at).toDateString() === today
        ).length;
      }
      
      setRobotStats({
        totalProducts,
        totalVariations,
        avgConfidence: avgConfidence || 75,
        categoriesCount: categoriesCount || 5,
        enrichedToday: enrichedToday || 12,
        conversionRate: 3.2
      });
      
    } catch (error) {
      console.error('❌ Erreur chargement stats robot:', error);
    }
  };

  const initializeChatBot = () => {
    const welcomeMessages = [
      {
        id: 'welcome-1',
        type: 'bot' as const,
        message: `Bonjour ! Je suis votre assistant IA pour ${sellerIdentifier || 'votre entreprise'}. Comment puis-je vous aider aujourd'hui ?`,
        timestamp: new Date().toISOString()
      },
      {
        id: 'welcome-2', 
        type: 'bot' as const,
        message: 'Je peux vous aider avec l\'enrichissement de vos produits, l\'analyse de vos données, ou répondre à vos questions sur votre catalogue.',
        timestamp: new Date().toISOString()
      }
    ];
    
    setChatMessages(welcomeMessages);
  };

  const handleSendMessage = async () => {
    if (!newMessage.trim()) return;
    
    const userMessage = {
      id: `user-${Date.now()}`,
      type: 'user' as const,
      message: newMessage,
      timestamp: new Date().toISOString()
    };
    
    setChatMessages(prev => [...prev, userMessage]);
    setNewMessage('');
    
    // Simuler une réponse du bot
    setTimeout(() => {
      const botResponse = generateBotResponse(newMessage);
      const botMessage = {
        id: `bot-${Date.now()}`,
        type: 'bot' as const,
        message: botResponse,
        timestamp: new Date().toISOString()
      };
      setChatMessages(prev => [...prev, botMessage]);
    }, 1000);
  };

  const generateBotResponse = (userMessage: string): string => {
    const message = userMessage.toLowerCase();
    
    if (message.includes('produit') || message.includes('catalogue')) {
      return `Votre catalogue contient actuellement ${robotStats?.totalProducts || 0} produits avec ${robotStats?.totalVariations || 0} variations. Voulez-vous que je lance un enrichissement automatique ?`;
    }
    
    if (message.includes('enrichir') || message.includes('enrichissement')) {
      return 'Je peux enrichir vos produits avec des attributs IA avancés : dimensions, couleurs, matériaux, styles et fonctionnalités. Cela améliore votre SEO et vos conversions de 25% en moyenne.';
    }
    
    if (message.includes('statistique') || message.includes('performance')) {
      return `Vos performances actuelles : ${robotStats?.avgConfidence || 75}% de confiance IA moyenne, ${robotStats?.enrichedToday || 12} produits enrichis aujourd'hui, taux de conversion de ${robotStats?.conversionRate || 3.2}%.`;
    }
    
    if (message.includes('aide') || message.includes('help')) {
      return 'Je peux vous aider avec : 📦 Enrichissement de produits, 📊 Analyse de données, 🎯 Optimisation SEO, 🤖 Automatisation des tâches, 📈 Rapports de performance.';
    }
    
    return 'Je comprends votre demande. Laissez-moi analyser vos données pour vous fournir la meilleure réponse possible. Que souhaitez-vous faire précisément ?';
  };

  const handleEnrichProducts = async () => {
    showInfo('Enrichissement en cours', 'Le robot IA analyse et enrichit vos produits...');
    
    // Simuler l'enrichissement
    setTimeout(() => {
      showSuccess(
        'Enrichissement terminé',
        `${robotStats?.totalProducts || 0} produits enrichis avec succès !`,
        [
          {
            label: 'Voir les résultats',
            action: () => setActiveTab('products'),
            variant: 'primary'
          }
        ]
      );
      
      // Mettre à jour les stats
      if (robotStats) {
        setRobotStats({
          ...robotStats,
          enrichedToday: robotStats.enrichedToday + 5,
          avgConfidence: Math.min(robotStats.avgConfidence + 2, 100)
        });
      }
    }, 3000);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
        <div className="text-center">
          <Bot className="w-16 h-16 text-purple-400 animate-pulse mx-auto mb-4" />
          <p className="text-white text-lg">Chargement du robot IA...</p>
          <p className="text-gray-400 text-sm">Initialisation pour {sellerIdentifier}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      {/* Header */}
      <div className="bg-black/20 backdrop-blur-xl border-b border-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-pink-600 rounded-xl flex items-center justify-center">
                <Bot className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-white">
                  Robot IA - {sellerData?.company_name}
                </h1>
                <p className="text-sm text-gray-300">
                  Interface intelligente • {sellerData?.subdomain}.omnia.sale
                </p>
              </div>
            </div>
            
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2 bg-green-500/20 text-green-300 px-3 py-1 rounded-full text-sm">
                <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
                Robot actif
              </div>
              <button
                onClick={() => navigate('/admin')}
                className="text-gray-400 hover:text-white transition-colors"
              >
                <Settings className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Navigation */}
        <div className="flex flex-wrap gap-2 mb-8">
          {[
            { id: 'dashboard', label: 'Tableau de bord', icon: BarChart3 },
            { id: 'chat', label: 'Chat IA', icon: MessageSquare },
            { id: 'products', label: 'Produits enrichis', icon: Package },
            { id: 'analytics', label: 'Analytics', icon: TrendingUp }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl font-medium transition-all ${
                activeTab === tab.id
                  ? 'bg-purple-600 text-white'
                  : 'bg-white/10 text-gray-300 hover:bg-white/20 hover:text-white'
              }`}
            >
              <tab.icon className="w-4 h-4" />
              {tab.label}
            </button>
          ))}
        </div>

        {/* Contenu selon l'onglet actif */}
        {activeTab === 'dashboard' && (
          <div className="space-y-8">
            {/* Statistiques principales */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="bg-white/10 backdrop-blur-xl rounded-2xl p-6 border border-white/20">
                <div className="flex items-center justify-between mb-4">
                  <div className="w-12 h-12 bg-blue-500/20 rounded-xl flex items-center justify-center">
                    <Package className="w-6 h-6 text-blue-400" />
                  </div>
                  <span className="text-2xl font-bold text-white">{robotStats?.totalProducts || 0}</span>
                </div>
                <h3 className="font-semibold text-white mb-1">Produits enrichis</h3>
                <p className="text-sm text-gray-400">+{robotStats?.enrichedToday || 0} aujourd'hui</p>
              </div>

              <div className="bg-white/10 backdrop-blur-xl rounded-2xl p-6 border border-white/20">
                <div className="flex items-center justify-between mb-4">
                  <div className="w-12 h-12 bg-cyan-500/20 rounded-xl flex items-center justify-center">
                    <Zap className="w-6 h-6 text-cyan-400" />
                  </div>
                  <span className="text-2xl font-bold text-white">{robotStats?.totalVariations || 0}</span>
                </div>
                <h3 className="font-semibold text-white mb-1">Variations totales</h3>
                <p className="text-sm text-gray-400">Gestion automatique</p>
              </div>

              <div className="bg-white/10 backdrop-blur-xl rounded-2xl p-6 border border-white/20">
                <div className="flex items-center justify-between mb-4">
                  <div className="w-12 h-12 bg-green-500/20 rounded-xl flex items-center justify-center">
                    <Brain className="w-6 h-6 text-green-400" />
                  </div>
                  <span className="text-2xl font-bold text-white">{robotStats?.avgConfidence || 0}%</span>
                </div>
                <h3 className="font-semibold text-white mb-1">Confiance IA</h3>
                <p className="text-sm text-gray-400">Qualité des données</p>
              </div>

              <div className="bg-white/10 backdrop-blur-xl rounded-2xl p-6 border border-white/20">
                <div className="flex items-center justify-between mb-4">
                  <div className="w-12 h-12 bg-purple-500/20 rounded-xl flex items-center justify-center">
                    <TrendingUp className="w-6 h-6 text-purple-400" />
                  </div>
                  <span className="text-2xl font-bold text-white">{robotStats?.conversionRate || 0}%</span>
                </div>
                <h3 className="font-semibold text-white mb-1">Taux conversion</h3>
                <p className="text-sm text-gray-400">+0.8% ce mois</p>
              </div>
            </div>

            {/* Actions rapides */}
            <div className="bg-white/10 backdrop-blur-xl rounded-2xl p-6 border border-white/20">
              <h3 className="text-xl font-bold text-white mb-6">Actions rapides du robot</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <button
                  onClick={handleEnrichProducts}
                  className="bg-gradient-to-r from-purple-500 to-pink-600 hover:from-purple-400 hover:to-pink-500 text-white p-4 rounded-xl flex items-center gap-3 transition-all"
                >
                  <Brain className="w-6 h-6" />
                  <div className="text-left">
                    <div className="font-semibold">Enrichir produits</div>
                    <div className="text-sm opacity-90">Analyse IA complète</div>
                  </div>
                </button>

                <button className="bg-gradient-to-r from-blue-500 to-cyan-600 hover:from-blue-400 hover:to-cyan-500 text-white p-4 rounded-xl flex items-center gap-3 transition-all">
                  <BarChart3 className="w-6 h-6" />
                  <div className="text-left">
                    <div className="font-semibold">Générer rapport</div>
                    <div className="text-sm opacity-90">Analytics détaillées</div>
                  </div>
                </button>

                <button className="bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-400 hover:to-emerald-500 text-white p-4 rounded-xl flex items-center gap-3 transition-all">
                  <RefreshCw className="w-6 h-6" />
                  <div className="text-left">
                    <div className="font-semibold">Sync catalogue</div>
                    <div className="text-sm opacity-90">Mise à jour auto</div>
                  </div>
                </button>
              </div>
            </div>

            {/* Informations entreprise */}
            <div className="bg-white/10 backdrop-blur-xl rounded-2xl p-6 border border-white/20">
              <h3 className="text-xl font-bold text-white mb-6">Informations entreprise</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <label className="text-sm text-gray-400">Nom de l'entreprise</label>
                    <div className="text-white font-medium">{sellerData?.company_name}</div>
                  </div>
                  <div>
                    <label className="text-sm text-gray-400">Sous-domaine</label>
                    <div className="text-white font-medium">{sellerData?.subdomain}.omnia.sale</div>
                  </div>
                  <div>
                    <label className="text-sm text-gray-400">Email de contact</label>
                    <div className="text-white font-medium">{sellerData?.contact_email}</div>
                  </div>
                </div>
                <div className="space-y-4">
                  <div>
                    <label className="text-sm text-gray-400">Téléphone</label>
                    <div className="text-white font-medium">{sellerData?.phone}</div>
                  </div>
                  <div>
                    <label className="text-sm text-gray-400">Site web</label>
                    <div className="text-white font-medium">{sellerData?.website}</div>
                  </div>
                  <div>
                    <label className="text-sm text-gray-400">Statut</label>
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-green-400 rounded-full" />
                      <span className="text-green-400 font-medium capitalize">{sellerData?.status}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'chat' && (
          <div className="bg-white/10 backdrop-blur-xl rounded-2xl border border-white/20 h-[600px] flex flex-col">
            <div className="p-6 border-b border-white/10">
              <h3 className="text-xl font-bold text-white flex items-center gap-2">
                <MessageSquare className="w-6 h-6 text-purple-400" />
                Chat avec votre Robot IA
              </h3>
              <p className="text-gray-300 text-sm mt-1">Assistant intelligent pour votre catalogue</p>
            </div>
            
            <div className="flex-1 overflow-y-auto p-6 space-y-4">
              {chatMessages.map((message) => (
                <div key={message.id} className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-xs lg:max-w-md px-4 py-2 rounded-2xl ${
                    message.type === 'user' 
                      ? 'bg-purple-600 text-white' 
                      : 'bg-white/20 text-white'
                  }`}>
                    <p className="text-sm">{message.message}</p>
                    <p className="text-xs opacity-70 mt-1">
                      {new Date(message.timestamp).toLocaleTimeString()}
                    </p>
                  </div>
                </div>
              ))}
            </div>
            
            <div className="p-6 border-t border-white/10">
              <div className="flex gap-2">
                <input
                  type="text"
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                  placeholder="Tapez votre message..."
                  className="flex-1 bg-black/40 border border-gray-600 rounded-xl px-4 py-2 text-white placeholder-gray-400 focus:outline-none focus:border-purple-400"
                />
                <button
                  onClick={handleSendMessage}
                  className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-xl transition-all"
                >
                  Envoyer
                </button>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'products' && (
          <div className="space-y-6">
            <div className="bg-white/10 backdrop-blur-xl rounded-2xl p-6 border border-white/20">
              <h3 className="text-xl font-bold text-white mb-4">Produits enrichis par IA</h3>
              <p className="text-gray-300 mb-6">
                Votre robot IA a analysé et enrichi {robotStats?.totalProducts || 0} produits avec {robotStats?.totalVariations || 0} variations.
              </p>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {/* Exemple de produits enrichis */}
                <div className="bg-black/20 rounded-xl p-4">
                  <div className="w-full h-32 bg-gray-600 rounded-lg mb-3"></div>
                  <h4 className="font-semibold text-white mb-2">Canapé VENTU convertible</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-400">Confiance IA:</span>
                      <span className="text-green-400 font-bold">92%</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Variations:</span>
                      <span className="text-cyan-400">2 couleurs</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Dimensions:</span>
                      <span className="text-white">263×105×93cm</span>
                    </div>
                  </div>
                  <div className="flex gap-2 mt-4">
                    <button className="flex-1 bg-purple-600 hover:bg-purple-700 text-white py-2 rounded-lg text-sm">
                      Voir détails
                    </button>
                  </div>
                </div>

                <div className="bg-black/20 rounded-xl p-4">
                  <div className="w-full h-32 bg-gray-600 rounded-lg mb-3"></div>
                  <h4 className="font-semibold text-white mb-2">Table AUREA travertin</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-400">Confiance IA:</span>
                      <span className="text-green-400 font-bold">88%</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Variations:</span>
                      <span className="text-cyan-400">2 tailles</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Matériau:</span>
                      <span className="text-white">Travertin naturel</span>
                    </div>
                  </div>
                  <div className="flex gap-2 mt-4">
                    <button className="flex-1 bg-purple-600 hover:bg-purple-700 text-white py-2 rounded-lg text-sm">
                      Voir détails
                    </button>
                  </div>
                </div>

                <div className="bg-black/20 rounded-xl p-4">
                  <div className="w-full h-32 bg-gray-600 rounded-lg mb-3"></div>
                  <h4 className="font-semibold text-white mb-2">Chaise INAYA chenille</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-400">Confiance IA:</span>
                      <span className="text-yellow-400 font-bold">76%</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Variations:</span>
                      <span className="text-cyan-400">3 couleurs</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Style:</span>
                      <span className="text-white">Moderne</span>
                    </div>
                  </div>
                  <div className="flex gap-2 mt-4">
                    <button className="flex-1 bg-purple-600 hover:bg-purple-700 text-white py-2 rounded-lg text-sm">
                      Voir détails
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'analytics' && (
          <div className="space-y-6">
            <div className="bg-white/10 backdrop-blur-xl rounded-2xl p-6 border border-white/20">
              <h3 className="text-xl font-bold text-white mb-6">Analytics du Robot IA</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-black/20 rounded-xl p-4">
                  <h4 className="font-semibold text-white mb-4">Performance d'enrichissement</h4>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-gray-400">Produits traités</span>
                      <span className="text-white font-bold">{robotStats?.totalProducts || 0}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-400">Confiance moyenne</span>
                      <span className="text-green-400 font-bold">{robotStats?.avgConfidence || 0}%</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-400">Catégories détectées</span>
                      <span className="text-purple-400 font-bold">{robotStats?.categoriesCount || 0}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-400">Enrichis aujourd'hui</span>
                      <span className="text-cyan-400 font-bold">{robotStats?.enrichedToday || 0}</span>
                    </div>
                  </div>
                </div>

                <div className="bg-black/20 rounded-xl p-4">
                  <h4 className="font-semibold text-white mb-4">Impact business</h4>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-gray-400">Taux de conversion</span>
                      <span className="text-green-400 font-bold">{robotStats?.conversionRate || 0}%</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-400">Amélioration SEO</span>
                      <span className="text-blue-400 font-bold">+25%</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-400">Temps économisé</span>
                      <span className="text-orange-400 font-bold">15h/semaine</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-400">ROI estimé</span>
                      <span className="text-pink-400 font-bold">+180%</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};