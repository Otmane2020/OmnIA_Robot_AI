import React, { useState, useEffect } from 'react';
import { Routes, Route, useNavigate, useLocation } from 'react-router-dom';
import { 
  Bot, Store, Users, BarChart3, Settings, LogOut, 
  Package, MessageSquare, Mail, Brain, Database,
  Menu, X, Bell, Search, Plus, Filter, Eye,
  Calendar, Clock, TrendingUp, DollarSign,
  ShoppingCart, Star, Award, Zap, Globe,
  User, Building, Phone, MapPin, FileText,
  Upload, Download, RefreshCw, CheckCircle,
  AlertCircle, Loader2, ExternalLink, Edit,
  Trash2, Save, ArrowLeft, Home, Mic, Volume2
} from 'lucide-react';

// Import components
import { LandingPage } from './pages/LandingPage';
import { AdminLogin } from './pages/AdminLogin';
import { ChatInterface } from './pages/ChatInterface';
import { RobotInterface } from './pages/RobotInterface';
import { Contact } from './pages/Contact';
import { About } from './pages/About';
import { Documentation } from './pages/Documentation';
import { Guides } from './pages/Guides';
import { Partnerships } from './pages/Partnerships';
import { Press } from './pages/Press';
import { UploadPage } from './pages/upload';
import { SellerRegistration } from './pages/SellerRegistration';
import { Support } from './pages/Support';

// Import admin components
import { CatalogManagement } from './components/CatalogManagement';
import { EcommerceIntegration } from './components/EcommerceIntegration';
import { ConversationHistory } from './components/ConversationHistory';
import { AITrainingInterface } from './components/AITrainingInterface';
import { MLTrainingDashboard } from './components/MLTrainingDashboard';
import { ProductsEnrichedTable } from './components/ProductsEnrichedTable';
import { OmniaRobotTab } from './components/OmniaRobotTab';
import { MessagingSystem } from './components/MessagingSystem';
import { SpeechToTextInterface } from './components/SpeechToTextInterface';
import { VoiceChatInterface } from './components/VoiceChatInterface';
import { NotificationSystem, useNotifications } from './components/NotificationSystem';
import { Logo } from './components/Logo';

interface User {
  id: string;
  email: string;
  company_name: string;
  plan: string;
  status: string;
  role?: string;
}

interface PendingApplication {
  id: string;
  companyName: string;
  email: string;
  firstName: string;
  lastName: string;
  phone: string;
  address: string;
  city: string;
  postalCode: string;
  siret: string;
  position: string;
  selectedPlan: string;
  proposedSubdomain: string;
  kbisFile?: File;
  password?: string;
  submittedAt: string;
  status: 'pending' | 'approved' | 'rejected';
}

const App: React.FC = () => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [pendingApplications, setPendingApplications] = useState<PendingApplication[]>([]);
  const [connectedPlatforms, setConnectedPlatforms] = useState<any[]>([]);
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  
  const navigate = useNavigate();
  const location = useLocation();
  const { notifications, removeNotification, showSuccess, showError, showInfo } = useNotifications();

  // Charger les demandes en attente au démarrage
  useEffect(() => {
    loadPendingApplications();
  }, []);

  const loadPendingApplications = () => {
    const saved = localStorage.getItem('pending_applications');
    if (saved) {
      try {
        const applications = JSON.parse(saved);
        setPendingApplications(applications.filter((app: any) => app.status === 'pending'));
      } catch (error) {
        console.error('Erreur chargement demandes:', error);
      }
    }
  };

  // Vérifier l'authentification au démarrage
  useEffect(() => {
    const savedUser = localStorage.getItem('current_logged_user');
    if (savedUser) {
      try {
        const user = JSON.parse(savedUser);
        setCurrentUser(user);
        setIsLoggedIn(true);
        
        // Rediriger vers admin si on est sur la page de login
        if (location.pathname === '/admin' && !location.pathname.includes('/login')) {
          navigate('/admin');
        }
      } catch (error) {
        console.error('Erreur parsing utilisateur:', error);
        localStorage.removeItem('current_logged_user');
      }
    }
  }, [navigate, location.pathname]);

  const handleLogin = (credentials: { email: string; password: string }) => {
    console.log('🔐 Tentative de connexion:', credentials.email);
    
    // Vérifier dans les revendeurs validés
    const validatedRetailers = JSON.parse(localStorage.getItem('validated_retailers') || '[]');
    const retailer = validatedRetailers.find((r: any) => 
      r.email?.toLowerCase() === credentials.email.toLowerCase() && 
      r.password === credentials.password
    );
    
    if (retailer) {
      const user: User = {
        id: retailer.id,
        email: retailer.email,
        company_name: retailer.company_name,
        plan: retailer.plan,
        status: retailer.status,
        role: 'retailer'
      };
      
      // Mettre à jour la dernière connexion
      const updatedRetailers = validatedRetailers.map((r: any) => 
        r.id === retailer.id ? { ...r, last_login: new Date().toISOString() } : r
      );
      localStorage.setItem('validated_retailers', JSON.stringify(updatedRetailers));
      
      setCurrentUser(user);
      setIsLoggedIn(true);
      localStorage.setItem('current_logged_user', JSON.stringify(user));
      
      showSuccess('Connexion réussie', `Bienvenue ${retailer.company_name} !`);
      navigate('/admin');
      return;
    }
    
    // Vérifier super admin
    if (credentials.email === 'superadmin@omnia.sale' && credentials.password === 'superadmin2025') {
      const superAdmin: User = {
        id: 'super-admin',
        email: 'superadmin@omnia.sale',
        company_name: 'OmnIA Administration',
        plan: 'super_admin',
        status: 'active',
        role: 'super_admin'
      };
      
      setCurrentUser(superAdmin);
      setIsLoggedIn(true);
      localStorage.setItem('current_logged_user', JSON.stringify(superAdmin));
      
      showSuccess('Connexion Super Admin', 'Accès administrateur accordé');
      navigate('/admin');
      return;
    }
    
    // Comptes de démonstration
    const demoAccounts = [
      { email: 'demo@decorahome.fr', password: 'demo123', company: 'Decora Home', plan: 'professional' },
      { email: 'contact@mobilierdesign.fr', password: 'design123', company: 'Mobilier Design Paris', plan: 'enterprise' },
      { email: 'info@decocontemporain.com', password: 'deco123', company: 'Déco Contemporain', plan: 'professional' },
      { email: 'contact@meubleslyon.fr', password: 'lyon123', company: 'Meubles Lyon', plan: 'starter' }
    ];
    
    const demoAccount = demoAccounts.find(account => 
      account.email === credentials.email && account.password === credentials.password
    );
    
    if (demoAccount) {
      const user: User = {
        id: `demo-${Date.now()}`,
        email: demoAccount.email,
        company_name: demoAccount.company,
        plan: demoAccount.plan,
        status: 'active',
        role: 'retailer'
      };
      
      setCurrentUser(user);
      setIsLoggedIn(true);
      localStorage.setItem('current_logged_user', JSON.stringify(user));
      
      showSuccess('Connexion démo', `Bienvenue ${demoAccount.company} !`);
      navigate('/admin');
      return;
    }
    
    showError('Connexion échouée', 'Email ou mot de passe incorrect.');
  };

  const handleLogout = () => {
    setCurrentUser(null);
    setIsLoggedIn(false);
    localStorage.removeItem('current_logged_user');
    showInfo('Déconnexion', 'À bientôt !');
    navigate('/');
  };

  const handleValidateApplication = (applicationId: string, approved: boolean) => {
    console.log('🔄 Validation application:', applicationId, approved ? 'APPROUVÉE' : 'REJETÉE');
    
    // Récupérer la demande
    const application = pendingApplications.find(app => app.id === applicationId);
    if (!application) {
      alert('❌ Erreur : Demande introuvable');
      return;
    }

    // Vérifier les doublons avant validation
    const existingRetailers = JSON.parse(localStorage.getItem('validated_retailers') || '[]');
    
    // Contrôle email unique
    const emailExists = existingRetailers.some((retailer: any) => 
      retailer.email?.toLowerCase() === application.email?.toLowerCase()
    );
    
    // Contrôle nom entreprise unique
    const companyExists = existingRetailers.some((retailer: any) => 
      retailer.company_name?.toLowerCase() === application.companyName?.toLowerCase()
    );
    
    if (emailExists) {
      alert('❌ Erreur : Cet email est déjà utilisé par un autre revendeur validé');
      return;
    }
    
    if (companyExists) {
      alert('❌ Erreur : Cette entreprise est déjà enregistrée');
      return;
    }

    if (approved) {
      // Créer le compte revendeur validé avec mot de passe sécurisé
      const securePassword = application.password || `omnia${Date.now().toString().slice(-4)}`;
      
      const validatedRetailer = {
        id: application.id,
        email: application.email,
        password: securePassword,
        company_name: application.companyName,
        subdomain: application.proposedSubdomain || application.companyName.toLowerCase().replace(/[^a-z0-9]/g, '').substring(0, 20),
        plan: application.selectedPlan,
        status: 'active',
        validated_at: new Date().toISOString(),
        first_name: application.firstName,
        last_name: application.lastName,
        phone: application.phone,
        address: application.address,
        city: application.city,
        postal_code: application.postalCode,
        siret: application.siret,
        position: application.position,
        created_at: new Date().toISOString(),
        last_login: null
      };
      
      // Sauvegarder dans localStorage
      existingRetailers.push(validatedRetailer);
      localStorage.setItem('validated_retailers', JSON.stringify(existingRetailers));
      
      console.log('✅ Revendeur validé et sauvegardé:', validatedRetailer.company_name);
      console.log('🔑 Identifiants de connexion:', {
        email: validatedRetailer.email,
        password: securePassword,
        subdomain: validatedRetailer.subdomain
      });
      
      alert(`✅ Revendeur approuvé !\n\nIdentifiants de connexion :\n• Email: ${validatedRetailer.email}\n• Mot de passe: ${securePassword}\n• Sous-domaine: ${validatedRetailer.subdomain}.omnia.sale`);
    } else {
      const rejectionReason = prompt('Raison du rejet (optionnel):') || 'Informations insuffisantes';
      console.log('❌ Demande rejetée:', rejectionReason);
      alert(`❌ Demande rejetée pour ${application.companyName}\nRaison: ${rejectionReason}`);
    }
    
    // Supprimer de la liste des demandes en attente
    const updatedApplications = pendingApplications.filter(app => app.id !== applicationId);
    setPendingApplications(updatedApplications);
    
    // Mettre à jour localStorage
    const allApplications = JSON.parse(localStorage.getItem('pending_applications') || '[]');
    const updatedAllApplications = allApplications.map((app: any) => 
      app.id === applicationId 
        ? { ...app, status: approved ? 'approved' : 'rejected', processed_at: new Date().toISOString() }
        : app
    );
    localStorage.setItem('pending_applications', JSON.stringify(updatedAllApplications));
  };

  const handlePlatformConnected = (platformData: any) => {
    setConnectedPlatforms(prev => [...prev, platformData]);
    showSuccess('Plateforme connectée', `${platformData.name} connecté avec succès !`);
  };

  // Routes publiques
  if (!isLoggedIn) {
    return (
      <div>
        <NotificationSystem notifications={notifications} onRemove={removeNotification} />
        <Routes>
          <Route path="/" element={
            <LandingPage 
              onGetStarted={() => navigate('/register')} 
              onLogin={() => navigate('/admin')} 
            />
          } />
          <Route path="/admin" element={
            <AdminLogin 
              onLogin={handleLogin} 
              onShowRegistration={() => navigate('/register')} 
            />
          } />
          <Route path="/register" element={<SellerRegistration />} />
          <Route path="/chat" element={<ChatInterface />} />
          <Route path="/robot" element={<RobotInterface />} />
          <Route path="/upload" element={<UploadPage />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/about" element={<About />} />
          <Route path="/documentation" element={<Documentation />} />
          <Route path="/guides" element={<Guides />} />
          <Route path="/partnerships" element={<Partnerships />} />
          <Route path="/press" element={<Press />} />
          <Route path="/support" element={<Support />} />
        </Routes>
      </div>
    );
  }

  // Interface admin
  const adminTabs = [
    { id: 'dashboard', label: 'Dashboard', icon: BarChart3 },
    { id: 'catalog', label: 'Catalogue', icon: Package },
    { id: 'enriched', label: 'Catalogue Enrichi', icon: Brain },
    { id: 'ecommerce', label: 'E-commerce', icon: Store },
    { id: 'conversations', label: 'Conversations', icon: MessageSquare },
    { id: 'ai-training', label: 'Entraînement IA', icon: Brain },
    { id: 'ml-dashboard', label: 'ML Dashboard', icon: Database },
    { id: 'robot', label: 'Robot OmnIA', icon: Bot },
    { id: 'messaging', label: 'Messagerie', icon: Mail },
    { id: 'stt', label: 'Speech-to-Text', icon: Mic },
    { id: 'voice-chat', label: 'Chat Vocal', icon: Volume2 }
  ];

  // Ajouter l'onglet Super Admin si nécessaire
  if (currentUser?.role === 'super_admin') {
    adminTabs.unshift({ id: 'super-admin', label: 'Super Admin', icon: Users });
  }

  const renderDashboard = () => (
    <div className="space-y-8">
      {/* Header Dashboard */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white">
            Tableau de bord {currentUser?.company_name}
          </h1>
          <p className="text-gray-300">
            Plan {currentUser?.plan} • Statut {currentUser?.status}
          </p>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-green-400 rounded-full animate-pulse"></div>
            <span className="text-green-300">OmnIA actif</span>
          </div>
          <button
            onClick={() => window.open('/robot', '_blank')}
            className="bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-400 hover:to-emerald-500 text-white px-6 py-3 rounded-xl font-semibold transition-all flex items-center gap-2"
          >
            <Bot className="w-5 h-5" />
            Tester OmnIA
          </button>
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
              <p className="text-3xl font-bold text-white">€2,456</p>
              <p className="text-orange-300 text-sm">Via OmnIA</p>
            </div>
            <DollarSign className="w-10 h-10 text-orange-400" />
          </div>
        </div>
      </div>

      {/* Graphiques et activité récente */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Graphique conversations */}
        <div className="bg-white/10 backdrop-blur-xl rounded-2xl p-6 border border-white/20">
          <h3 className="text-xl font-bold text-white mb-6">Conversations (7 derniers jours)</h3>
          <div className="h-64 flex items-end gap-2">
            {[45, 52, 38, 61, 55, 48, 67].map((height, index) => (
              <div key={index} className="flex-1 bg-gradient-to-t from-cyan-500 to-blue-600 rounded-t-lg" style={{ height: `${height}%` }}>
                <div className="w-full h-full rounded-t-lg opacity-80"></div>
              </div>
            ))}
          </div>
          <div className="flex justify-between text-sm text-gray-400 mt-2">
            <span>Lun</span>
            <span>Mar</span>
            <span>Mer</span>
            <span>Jeu</span>
            <span>Ven</span>
            <span>Sam</span>
            <span>Dim</span>
          </div>
        </div>

        {/* Activité récente */}
        <div className="bg-white/10 backdrop-blur-xl rounded-2xl p-6 border border-white/20">
          <h3 className="text-xl font-bold text-white mb-6">Activité récente</h3>
          <div className="space-y-4">
            <div className="flex items-center gap-3 p-3 bg-black/20 rounded-xl">
              <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center">
                <ShoppingCart className="w-4 h-4 text-white" />
              </div>
              <div className="flex-1">
                <p className="text-white font-medium">Vente réalisée</p>
                <p className="text-gray-400 text-sm">Canapé ALYANA - 799€</p>
              </div>
              <span className="text-gray-400 text-sm">Il y a 2h</span>
            </div>
            
            <div className="flex items-center gap-3 p-3 bg-black/20 rounded-xl">
              <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
                <MessageSquare className="w-4 h-4 text-white" />
              </div>
              <div className="flex-1">
                <p className="text-white font-medium">Nouvelle conversation</p>
                <p className="text-gray-400 text-sm">Client intéressé par tables</p>
              </div>
              <span className="text-gray-400 text-sm">Il y a 5h</span>
            </div>
            
            <div className="flex items-center gap-3 p-3 bg-black/20 rounded-xl">
              <div className="w-8 h-8 bg-purple-500 rounded-full flex items-center justify-center">
                <Brain className="w-4 h-4 text-white" />
              </div>
              <div className="flex-1">
                <p className="text-white font-medium">IA mise à jour</p>
                <p className="text-gray-400 text-sm">Catalogue synchronisé</p>
              </div>
              <span className="text-gray-400 text-sm">Il y a 1j</span>
            </div>
          </div>
        </div>
      </div>

      {/* Actions rapides */}
      <div className="bg-white/10 backdrop-blur-xl rounded-2xl p-6 border border-white/20">
        <h3 className="text-xl font-bold text-white mb-6">Actions rapides</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <button
            onClick={() => setActiveTab('catalog')}
            className="bg-purple-600/20 hover:bg-purple-600/30 border border-purple-500/50 text-purple-300 p-4 rounded-xl transition-all hover:scale-105 text-left"
          >
            <Package className="w-6 h-6 mb-2" />
            <div className="font-semibold">Gérer le catalogue</div>
            <div className="text-sm opacity-80">247 produits</div>
          </button>
          
          <button
            onClick={() => setActiveTab('ai-training')}
            className="bg-cyan-600/20 hover:bg-cyan-600/30 border border-cyan-500/50 text-cyan-300 p-4 rounded-xl transition-all hover:scale-105 text-left"
          >
            <Brain className="w-6 h-6 mb-2" />
            <div className="font-semibold">Entraîner l'IA</div>
            <div className="text-sm opacity-80">Optimiser OmnIA</div>
          </button>
          
          <button
            onClick={() => setActiveTab('conversations')}
            className="bg-blue-600/20 hover:bg-blue-600/30 border border-blue-500/50 text-blue-300 p-4 rounded-xl transition-all hover:scale-105 text-left"
          >
            <MessageSquare className="w-6 h-6 mb-2" />
            <div className="font-semibold">Voir conversations</div>
            <div className="text-sm opacity-80">1,234 échanges</div>
          </button>
          
          <button
            onClick={() => window.open('/robot', '_blank')}
            className="bg-green-600/20 hover:bg-green-600/30 border border-green-500/50 text-green-300 p-4 rounded-xl transition-all hover:scale-105 text-left"
          >
            <Bot className="w-6 h-6 mb-2" />
            <div className="font-semibold">Tester OmnIA</div>
            <div className="text-sm opacity-80">Interface robot</div>
          </button>
        </div>
      </div>
    </div>
  );

  const renderSuperAdmin = () => (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white">Super Administration OmnIA</h1>
          <p className="text-gray-300">Gestion globale de la plateforme</p>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse"></div>
          <span className="text-red-300 font-semibold">Mode Super Admin</span>
        </div>
      </div>

      {/* Stats globales */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-blue-600/20 backdrop-blur-xl rounded-2xl p-6 border border-blue-500/30">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-blue-200 text-sm mb-1">Revendeurs Actifs</p>
              <p className="text-3xl font-bold text-white">{JSON.parse(localStorage.getItem('validated_retailers') || '[]').length}</p>
            </div>
            <Store className="w-10 h-10 text-blue-400" />
          </div>
        </div>
        
        <div className="bg-yellow-600/20 backdrop-blur-xl rounded-2xl p-6 border border-yellow-500/30">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-yellow-200 text-sm mb-1">Demandes en Attente</p>
              <p className="text-3xl font-bold text-white">{pendingApplications.length}</p>
            </div>
            <Clock className="w-10 h-10 text-yellow-400" />
          </div>
        </div>
        
        <div className="bg-green-600/20 backdrop-blur-xl rounded-2xl p-6 border border-green-500/30">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-green-200 text-sm mb-1">Conversations Totales</p>
              <p className="text-3xl font-bold text-white">12,456</p>
            </div>
            <MessageSquare className="w-10 h-10 text-green-400" />
          </div>
        </div>
        
        <div className="bg-purple-600/20 backdrop-blur-xl rounded-2xl p-6 border border-purple-500/30">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-purple-200 text-sm mb-1">Revenus Générés</p>
              <p className="text-3xl font-bold text-white">€45,678</p>
            </div>
            <DollarSign className="w-10 h-10 text-purple-400" />
          </div>
        </div>
      </div>

      {/* Demandes en attente */}
      <div className="bg-white/10 backdrop-blur-xl rounded-2xl p-8 border border-white/20">
        <h2 className="text-2xl font-bold text-white mb-6">
          Demandes de Validation ({pendingApplications.length})
        </h2>
        
        {pendingApplications.length === 0 ? (
          <div className="text-center py-12">
            <CheckCircle className="w-16 h-16 text-green-400 mx-auto mb-4" />
            <h3 className="text-xl font-bold text-white mb-2">Aucune demande en attente</h3>
            <p className="text-gray-400">Toutes les demandes ont été traitées</p>
          </div>
        ) : (
          <div className="space-y-6">
            {pendingApplications.map((application) => (
              <div key={application.id} className="bg-black/20 rounded-xl p-6 border border-white/10">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  {/* Informations entreprise */}
                  <div>
                    <h3 className="text-lg font-bold text-white mb-3">{application.companyName}</h3>
                    <div className="space-y-2 text-sm">
                      <div className="flex items-center gap-2">
                        <Building className="w-4 h-4 text-gray-400" />
                        <span className="text-gray-300">SIRET: {application.siret}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <MapPin className="w-4 h-4 text-gray-400" />
                        <span className="text-gray-300">{application.city}, {application.postalCode}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Award className="w-4 h-4 text-gray-400" />
                        <span className="text-gray-300">Plan: {application.selectedPlan}</span>
                      </div>
                    </div>
                  </div>

                  {/* Contact */}
                  <div>
                    <h4 className="font-semibold text-white mb-3">Contact</h4>
                    <div className="space-y-2 text-sm">
                      <div className="flex items-center gap-2">
                        <User className="w-4 h-4 text-gray-400" />
                        <span className="text-gray-300">{application.firstName} {application.lastName}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Mail className="w-4 h-4 text-gray-400" />
                        <span className="text-gray-300">{application.email}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Phone className="w-4 h-4 text-gray-400" />
                        <span className="text-gray-300">{application.phone}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Briefcase className="w-4 h-4 text-gray-400" />
                        <span className="text-gray-300">{application.position}</span>
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex flex-col gap-3">
                    <div className="text-sm text-gray-400 mb-2">
                      Soumis le {new Date(application.submittedAt).toLocaleDateString('fr-FR')}
                    </div>
                    
                    {application.kbisFile && (
                      <div className="bg-blue-500/20 border border-blue-400/30 rounded-lg p-3 mb-3">
                        <div className="flex items-center gap-2">
                          <FileText className="w-4 h-4 text-blue-400" />
                          <span className="text-blue-300 text-sm">Kbis: {application.kbisFile.name}</span>
                        </div>
                      </div>
                    )}
                    
                    <div className="flex gap-3">
                      <button
                        onClick={() => handleValidateApplication(application.id, true)}
                        className="flex-1 bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-400 hover:to-emerald-500 text-white py-3 rounded-xl font-semibold transition-all flex items-center justify-center gap-2"
                      >
                        <CheckCircle className="w-4 h-4" />
                        Approuver
                      </button>
                      <button
                        onClick={() => handleValidateApplication(application.id, false)}
                        className="flex-1 bg-gradient-to-r from-red-500 to-red-600 hover:from-red-400 hover:to-red-500 text-white py-3 rounded-xl font-semibold transition-all flex items-center justify-center gap-2"
                      >
                        <X className="w-4 h-4" />
                        Rejeter
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Revendeurs validés */}
      <div className="bg-white/10 backdrop-blur-xl rounded-2xl p-8 border border-white/20">
        <h2 className="text-2xl font-bold text-white mb-6">Revendeurs Validés</h2>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-white/20">
                <th className="text-left p-3 text-cyan-300">Entreprise</th>
                <th className="text-left p-3 text-cyan-300">Email</th>
                <th className="text-left p-3 text-cyan-300">Plan</th>
                <th className="text-left p-3 text-cyan-300">Statut</th>
                <th className="text-left p-3 text-cyan-300">Dernière connexion</th>
              </tr>
            </thead>
            <tbody>
              {JSON.parse(localStorage.getItem('validated_retailers') || '[]').map((retailer: any) => (
                <tr key={retailer.id} className="border-b border-white/10">
                  <td className="p-3 text-white">{retailer.company_name}</td>
                  <td className="p-3 text-gray-300">{retailer.email}</td>
                  <td className="p-3">
                    <span className="bg-cyan-500/20 text-cyan-300 px-2 py-1 rounded-full text-xs">
                      {retailer.plan}
                    </span>
                  </td>
                  <td className="p-3">
                    <span className="bg-green-500/20 text-green-300 px-2 py-1 rounded-full text-xs">
                      {retailer.status}
                    </span>
                  </td>
                  <td className="p-3 text-gray-400 text-sm">
                    {retailer.last_login ? new Date(retailer.last_login).toLocaleDateString('fr-FR') : 'Jamais'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );

  const renderTabContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return renderDashboard();
      case 'super-admin':
        return renderSuperAdmin();
      case 'catalog':
        return <CatalogManagement />;
      case 'enriched':
        return <ProductsEnrichedTable />;
      case 'ecommerce':
        return <EcommerceIntegration onConnected={handlePlatformConnected} />;
      case 'conversations':
        return <ConversationHistory />;
      case 'ai-training':
        return <AITrainingInterface />;
      case 'ml-dashboard':
        return <MLTrainingDashboard />;
      case 'robot':
        return <OmniaRobotTab />;
      case 'messaging':
        return <MessagingSystem />;
      case 'stt':
        return <SpeechToTextInterface />;
      case 'voice-chat':
        return <VoiceChatInterface />;
      default:
        return renderDashboard();
    }
  };

  return (
    <div className="h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-purple-900 flex overflow-hidden">
      <NotificationSystem notifications={notifications} onRemove={removeNotification} />
      
      {/* Background Effects */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-20 left-20 w-72 h-72 bg-cyan-500/30 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-20 right-20 w-96 h-96 bg-purple-500/20 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '2s' }}></div>
      </div>

      {/* Sidebar */}
      <div className={`${sidebarOpen ? 'w-80' : 'w-20'} bg-slate-800/95 backdrop-blur-xl border-r border-slate-700/50 transition-all duration-300 flex flex-col relative z-10`}>
        {/* Header Sidebar */}
        <div className="p-6 border-b border-slate-700/50">
          <div className="flex items-center justify-between">
            {sidebarOpen && (
              <div className="flex items-center gap-3">
                <Logo size="sm" />
                <div>
                  <h2 className="text-white font-bold">OmnIA Admin</h2>
                  <p className="text-cyan-300 text-sm">{currentUser?.company_name}</p>
                </div>
              </div>
            )}
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="text-gray-400 hover:text-white transition-colors"
            >
              <Menu className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
          {adminTabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all text-left ${
                  activeTab === tab.id
                    ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30'
                    : 'text-gray-300 hover:bg-white/10 hover:text-white'
                }`}
              >
                <Icon className="w-5 h-5 flex-shrink-0" />
                {sidebarOpen && <span className="font-medium">{tab.label}</span>}
                {!sidebarOpen && activeTab === tab.id && (
                  <div className="absolute left-full ml-2 bg-slate-800 text-white px-2 py-1 rounded text-sm whitespace-nowrap">
                    {tab.label}
                  </div>
                )}
              </button>
            );
          })}
        </nav>

        {/* User Info & Logout */}
        <div className="p-4 border-t border-slate-700/50">
          {sidebarOpen ? (
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-full flex items-center justify-center">
                  <User className="w-5 h-5 text-white" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-white font-medium truncate">{currentUser?.email}</div>
                  <div className="text-cyan-300 text-sm">{currentUser?.plan}</div>
                </div>
              </div>
              <button
                onClick={handleLogout}
                className="w-full flex items-center gap-3 px-4 py-3 text-gray-300 hover:text-red-300 hover:bg-red-500/10 rounded-xl transition-all"
              >
                <LogOut className="w-5 h-5" />
                <span>Déconnexion</span>
              </button>
            </div>
          ) : (
            <button
              onClick={handleLogout}
              className="w-full p-3 text-gray-300 hover:text-red-300 hover:bg-red-500/10 rounded-xl transition-all"
              title="Déconnexion"
            >
              <LogOut className="w-5 h-5 mx-auto" />
            </button>
          )}
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col relative z-10 overflow-hidden">
        {/* Top Bar */}
        <div className="bg-slate-800/90 backdrop-blur-xl border-b border-slate-700/50 p-4 flex-shrink-0">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <h1 className="text-xl font-bold text-white">
                {adminTabs.find(tab => tab.id === activeTab)?.label || 'Dashboard'}
              </h1>
              {activeTab === 'dashboard' && (
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                  <span className="text-green-300 text-sm">Système opérationnel</span>
                </div>
              )}
            </div>
            
            <div className="flex items-center gap-4">
              {/* Notifications */}
              <button className="relative p-2 text-gray-400 hover:text-white transition-colors">
                <Bell className="w-5 h-5" />
                {pendingApplications.length > 0 && (
                  <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                    {pendingApplications.length}
                  </span>
                )}
              </button>
              
              {/* Actions rapides */}
              <div className="flex items-center gap-2">
                <button
                  onClick={() => window.open('/robot', '_blank')}
                  className="bg-green-600/20 hover:bg-green-600/30 text-green-300 px-3 py-2 rounded-xl transition-all flex items-center gap-2"
                >
                  <Bot className="w-4 h-4" />
                  <span className="hidden sm:inline">Robot</span>
                </button>
                <button
                  onClick={() => window.open('/chat', '_blank')}
                  className="bg-blue-600/20 hover:bg-blue-600/30 text-blue-300 px-3 py-2 rounded-xl transition-all flex items-center gap-2"
                >
                  <MessageSquare className="w-4 h-4" />
                  <span className="hidden sm:inline">Chat</span>
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Content Area */}
        <div className="flex-1 overflow-y-auto p-6">
          {renderTabContent()}
        </div>
      </div>

      {/* Routes pour les pages publiques */}
      <Routes>
        <Route path="/chat" element={<ChatInterface />} />
        <Route path="/robot" element={<RobotInterface />} />
        <Route path="/upload" element={<UploadPage />} />
        <Route path="/contact" element={<Contact />} />
        <Route path="/about" element={<About />} />
        <Route path="/documentation" element={<Documentation />} />
        <Route path="/guides" element={<Guides />} />
        <Route path="/partnerships" element={<Partnerships />} />
        <Route path="/press" element={<Press />} />
        <Route path="/support" element={<Support />} />
      </Routes>
    </div>
  );
};

export default App;