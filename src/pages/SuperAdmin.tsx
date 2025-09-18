import React, { useState } from 'react';
import { 
  Users, Store, BarChart3, Settings, Shield, 
  Search, Filter, Eye, Edit, Trash2, Plus,
  CheckCircle, XCircle, AlertTriangle, Crown,
  TrendingUp, DollarSign, Calendar, Mail,
  FileText, Download, ExternalLink
} from 'lucide-react';
import { Logo } from '../components/Logo';
import { NotificationSystem, useNotifications } from '../components/NotificationSystem';

interface SuperAdminProps {
  onLogout: () => void;
  pendingApplications: any[];
  onValidateApplication: (id: string, approved: boolean) => void;
}

interface Retailer {
  id: string;
  name: string;
  email: string;
  plan: 'starter' | 'professional' | 'enterprise';
  status: 'active' | 'inactive' | 'suspended';
  revenue: number;
  conversations: number;
  products: number;
  joinDate: string;
  lastActive: string;
  password?: string;
  applicationData?: any;
}

export const SuperAdmin: React.FC<SuperAdminProps> = ({ onLogout, pendingApplications, onValidateApplication }) => {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [searchTerm, setSearchTerm] = useState('');
  const [filterPlan, setFilterPlan] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');
  const [showValidationModal, setShowValidationModal] = useState(false);
  const [selectedApplication, setSelectedApplication] = useState<any>(null);
  const [showKbisModal, setShowKbisModal] = useState(false);
  const [selectedKbis, setSelectedKbis] = useState<any>(null);
  const [showApplicationModal, setShowApplicationModal] = useState(false);
  const [showAddRetailerModal, setShowAddRetailerModal] = useState(false);
  const [newRetailerData, setNewRetailerData] = useState({
    name: '',
    email: '',
    password: '',
    plan: 'professional',
    status: 'active'
  });
  const [retailers, setRetailers] = useState<Retailer[]>(() => {
    // Charger les revendeurs depuis localStorage
    try {
      const saved = localStorage.getItem('retailers');
      return saved ? JSON.parse(saved) : [
        {
          id: '1',
          name: 'Mobilier Design Paris',
          email: 'contact@mobilierdesign.fr',
          password: 'design123',
          plan: 'enterprise',
          status: 'active',
          revenue: 5890,
          conversations: 3456,
          products: 234,
          joinDate: '2024-01-15',
          lastActive: '2024-03-15'
        },
        {
          id: '2',
          name: 'Déco Contemporain',
          email: 'info@decocontemporain.com',
          password: 'deco123',
          plan: 'professional',
          status: 'active',
          revenue: 3200,
          conversations: 2100,
          products: 156,
          joinDate: '2024-02-01',
          lastActive: '2024-03-14'
        },
        {
          id: '3',
          name: 'Decora Home',
          email: 'admin@decorahome.fr',
          password: 'demo123',
          plan: 'professional',
          status: 'active',
          revenue: 2450,
          conversations: 1234,
          products: 89,
          joinDate: '2024-02-20',
          lastActive: '2024-03-13'
        },
        {
          id: '4',
          name: 'Meubles Lyon',
          email: 'contact@meubleslyon.fr',
          password: 'lyon123',
          plan: 'starter',
          status: 'active',
          revenue: 890,
          conversations: 456,
          products: 45,
          joinDate: '2024-03-01',
          lastActive: '2024-03-12'
        }
      ];
    } catch (error) {
      console.error('Erreur chargement retailers:', error);
      return [];
    }
  });
  const { notifications, showSuccess, showError, showInfo, removeNotification } = useNotifications();

  // Sauvegarder les revendeurs dans localStorage à chaque changement
  React.useEffect(() => {
    localStorage.setItem('retailers', JSON.stringify(retailers));
  }, [retailers]);
  const handleViewKbis = (application: any) => {
    setSelectedKbis(application);
    setShowKbisModal(true);
  };

  const handleViewApplication = (application: any) => {
    setSelectedApplication(application);
    setShowApplicationModal(true);
  };

  const handleEditRetailer = (retailer: Retailer) => {
    setNewRetailerData({
      name: retailer.name,
      email: retailer.email,
      password: retailer.password || '',
      plan: retailer.plan,
      status: retailer.status
    });
    setSelectedApplication(retailer);
    setShowAddRetailerModal(true);
  };

  const handleDeleteRetailer = (retailerId: string) => {
    if (confirm('Supprimer ce revendeur ? Cette action est irréversible.')) {
      setRetailers(prev => prev.filter(r => r.id !== retailerId));
      showSuccess('Revendeur supprimé', 'Le revendeur a été supprimé avec succès.');
    }
  };

  const handleAddRetailer = () => {
    if (!newRetailerData.name || !newRetailerData.email || !newRetailerData.password) {
      showError('Champs manquants', 'Veuillez remplir tous les champs obligatoires.');
      return;
    }

    const newRetailer: Retailer = {
      id: Date.now().toString(),
      name: newRetailerData.name,
      email: newRetailerData.email,
      password: newRetailerData.password,
      plan: newRetailerData.plan as any,
      status: newRetailerData.status as any,
      revenue: 0,
      conversations: 0,
      products: 0,
      joinDate: new Date().toISOString(),
      lastActive: new Date().toISOString()
    };

    if (selectedApplication && selectedApplication.id) {
      // Mode édition
      setRetailers(prev => prev.map(r => 
        r.id === selectedApplication.id ? { ...r, ...newRetailerData } : r
      ));
      showSuccess('Revendeur modifié', 'Les informations ont été mises à jour.');
    } else {
      // Mode création
      setRetailers(prev => [...prev, newRetailer]);
      showSuccess('Revendeur créé', `${newRetailer.name} a été créé avec succès.`);
    }

    setShowAddRetailerModal(false);
    setSelectedApplication(null);
    setNewRetailerData({
      name: '',
      email: '',
      password: '',
      plan: 'professional',
      status: 'active'
    });
  };
  const tabs = [
    { id: 'dashboard', label: 'Tableau de bord', icon: BarChart3 },
    { id: 'retailers', label: 'Revendeurs', icon: Store },
    { id: 'applications', label: 'Demandes', icon: Users },
    { id: 'users', label: 'Utilisateurs', icon: Users },
    { id: 'analytics', label: 'Analytics', icon: TrendingUp },
    { id: 'settings', label: 'Paramètres', icon: Settings }
  ];

  const getPlanColor = (plan: string) => {
    switch (plan) {
      case 'starter': return 'bg-gray-500/20 text-gray-300';
      case 'professional': return 'bg-cyan-500/20 text-cyan-300';
      case 'enterprise': return 'bg-purple-500/20 text-purple-300';
      default: return 'bg-gray-500/20 text-gray-300';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-500/20 text-green-300';
      case 'inactive': return 'bg-yellow-500/20 text-yellow-300';
      case 'suspended': return 'bg-red-500/20 text-red-300';
      default: return 'bg-gray-500/20 text-gray-300';
    }
  };

  const handleValidateApplication = (application: any, approved: boolean) => {
    if (approved) {
      console.log(`✅ Application approuvée: ${application.companyName}`);
      console.log(`🌐 Sous-domaine créé: ${application.proposedSubdomain}`);
      
      // Simuler l'envoi d'email d'approbation
      console.log(`📧 Email d'approbation envoyé à: ${application.email}`);
      console.log(`📧 Contenu: Compte activé, identifiants: ${application.email} / ${application.password}`);
      
      // Créer le nouveau revendeur
      const newRetailer: Retailer = {
        id: Date.now().toString(),
        name: application.companyName,
        email: application.email,
        password: application.password,
        applicationData: application,
        plan: application.selectedPlan,
        status: 'active',
        revenue: 0,
        conversations: 0,
        products: 0,
        joinDate: new Date().toISOString(),
        lastActive: new Date().toISOString()
      };
      
      setRetailers(prev => [...prev, newRetailer]);
      
      showSuccess(
        'Demande approuvée',
        `${application.companyName} a été approuvé ! Email envoyé avec identifiants: ${application.email} / ${application.password}`,
        [
          {
            label: 'Voir les revendeurs',
            action: () => setActiveTab('retailers'),
            variant: 'primary'
          }
        ]
      );

      onValidateApplication(application.id, true);
    } else {
      console.log(`❌ Application rejetée: ${application.companyName}`);
      
      // Simuler l'envoi d'email de rejet
      console.log(`📧 Email de rejet envoyé à: ${application.email}`);
      console.log(`📧 Contenu: Demande rejetée, informations complémentaires requises`);
      
      showInfo(
        'Demande rejetée',
        `${application.companyName} a été rejeté. Email d'explication envoyé.`
      );

      onValidateApplication(application.id, false);
    }
    setShowValidationModal(false);
    setSelectedApplication(null);
  };

  const filteredRetailers = retailers.filter(retailer => {
    const matchesSearch = retailer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         retailer.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesPlan = filterPlan === 'all' || retailer.plan === filterPlan;
    const matchesStatus = filterStatus === 'all' || retailer.status === filterStatus;
    
    return matchesSearch && matchesPlan && matchesStatus;
  });

  const totalRevenue = retailers.reduce((sum, retailer) => sum + retailer.revenue, 0);
  const totalConversations = retailers.reduce((sum, retailer) => sum + retailer.conversations, 0);
  const activeRetailers = retailers.filter(r => r.status === 'active').length;

  const renderDashboard = () => (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-bold text-white mb-2">Super Administration</h1>
          <p className="text-gray-300 text-lg">Gestion de la plateforme OmnIA.sale</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center">
            <span className="text-2xl font-bold text-gray-800">O</span>
          </div>
          <div>
            <div className="text-white font-bold text-xl">OmnIA.sale</div>
            <div className="text-gray-400 text-sm">Super Admin</div>
          </div>
        </div>
      </div>

      {/* Stats Cards - Exact layout from image */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-blue-600/20 backdrop-blur-xl rounded-2xl p-6 border border-blue-500/30">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-blue-200 text-sm mb-1">Revendeurs Actifs</p>
              <p className="text-4xl font-bold text-white mb-1">{activeRetailers}</p>
              <p className="text-green-400 text-sm">+12% ce mois</p>
            </div>
            <Store className="w-12 h-12 text-cyan-400" />
          </div>
        </div>
        
        <div className="bg-green-600/20 backdrop-blur-xl rounded-2xl p-6 border border-green-500/30">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-green-200 text-sm mb-1">Revenus Totaux</p>
              <p className="text-4xl font-bold text-white mb-1">€{totalRevenue.toLocaleString()}</p>
              <p className="text-green-400 text-sm">+23% ce mois</p>
            </div>
            <DollarSign className="w-12 h-12 text-green-400" />
          </div>
        </div>
        
        <div className="bg-purple-600/20 backdrop-blur-xl rounded-2xl p-6 border border-purple-500/30">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-purple-200 text-sm mb-1">Conversations IA</p>
              <p className="text-4xl font-bold text-white mb-1">{totalConversations.toLocaleString()}</p>
              <p className="text-green-400 text-sm">+34% ce mois</p>
            </div>
            <BarChart3 className="w-12 h-12 text-purple-400" />
          </div>
        </div>
        
        <div className="bg-orange-600/20 backdrop-blur-xl rounded-2xl p-6 border border-orange-500/30">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-orange-200 text-sm mb-1">Taux Conversion</p>
              <p className="text-4xl font-bold text-white mb-1">28%</p>
              <p className="text-green-400 text-sm">+5% ce mois</p>
            </div>
            <TrendingUp className="w-12 h-12 text-orange-400" />
          </div>
        </div>
      </div>

      {/* Activité Récente - Exact layout from image */}
      <div className="bg-blue-800/30 backdrop-blur-xl rounded-2xl p-8 border border-blue-500/30 mb-8">
        <h2 className="text-2xl font-bold text-white mb-6">Activité Récente</h2>
        <div className="space-y-4">
          <div className="flex items-center gap-4 p-4 bg-blue-700/20 rounded-xl border border-blue-500/20">
            <CheckCircle className="w-6 h-6 text-green-400" />
            <div className="flex-1">
              <p className="text-white text-lg">Nouveau revendeur inscrit: <strong>Mobilier Moderne</strong></p>
              <p className="text-blue-200 text-sm">Plan Professional • Il y a 2h</p>
            </div>
          </div>
          <div className="flex items-center gap-4 p-4 bg-blue-700/20 rounded-xl border border-blue-500/20">
            <TrendingUp className="w-6 h-6 text-blue-400" />
            <div className="flex-1">
              <p className="text-white text-lg">Pic de conversations: <strong>+150% aujourd'hui</strong></p>
              <p className="text-blue-200 text-sm">Tous revendeurs • Il y a 4h</p>
            </div>
          </div>
          <div className="flex items-center gap-4 p-4 bg-blue-700/20 rounded-xl border border-blue-500/20">
            <DollarSign className="w-6 h-6 text-green-400" />
            <div className="flex-1">
              <p className="text-white text-lg">Upgrade plan: <strong>Decora Home → Enterprise</strong></p>
              <p className="text-blue-200 text-sm">+€120/mois • Il y a 6h</p>
            </div>
          </div>
        </div>
      </div>

      {/* Top Revendeurs et Répartition des Plans */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Top Revendeurs (Revenus) */}
        <div className="bg-blue-800/30 backdrop-blur-xl rounded-2xl p-8 border border-blue-500/30">
          <h2 className="text-2xl font-bold text-white mb-6">Top Revendeurs (Revenus)</h2>
          <div className="space-y-4">
            <div className="flex items-center gap-4 p-4 bg-blue-700/20 rounded-xl border border-blue-500/20">
              <div className="w-10 h-10 bg-cyan-500 rounded-full flex items-center justify-center text-white font-bold text-lg">
                1
              </div>
              <div className="flex-1">
                <div className="flex justify-between items-center">
                  <div>
                    <p className="text-white text-lg font-bold">Mobilier Design Paris</p>
                    <p className="text-blue-200 text-sm">enterprise</p>
                  </div>
                  <div className="text-right">
                    <p className="text-green-400 text-xl font-bold">€5890</p>
                    <p className="text-blue-200 text-sm">3456 conv.</p>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="flex items-center gap-4 p-4 bg-blue-700/20 rounded-xl border border-blue-500/20">
              <div className="w-10 h-10 bg-cyan-500 rounded-full flex items-center justify-center text-white font-bold text-lg">
                2
              </div>
              <div className="flex-1">
                <div className="flex justify-between items-center">
                  <div>
                    <p className="text-white text-lg font-bold">Déco Contemporain</p>
                    <p className="text-blue-200 text-sm">professional</p>
                  </div>
                  <div className="text-right">
                    <p className="text-green-400 text-xl font-bold">€3200</p>
                    <p className="text-blue-200 text-sm">2100 conv.</p>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="flex items-center gap-4 p-4 bg-blue-700/20 rounded-xl border border-blue-500/20">
              <div className="w-10 h-10 bg-cyan-500 rounded-full flex items-center justify-center text-white font-bold text-lg">
                3
              </div>
              <div className="flex-1">
                <div className="flex justify-between items-center">
                  <div>
                    <p className="text-white text-lg font-bold">Decora Home</p>
                    <p className="text-blue-200 text-sm">professional</p>
                  </div>
                  <div className="text-right">
                    <p className="text-green-400 text-xl font-bold">€2450</p>
                    <p className="text-blue-200 text-sm">1234 conv.</p>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="flex items-center gap-4 p-4 bg-blue-700/20 rounded-xl border border-blue-500/20">
              <div className="w-10 h-10 bg-cyan-500 rounded-full flex items-center justify-center text-white font-bold text-lg">
                4
              </div>
              <div className="flex-1">
                <div className="flex justify-between items-center">
                  <div>
                    <p className="text-white text-lg font-bold">Meubles Lyon</p>
                    <p className="text-blue-200 text-sm">starter</p>
                  </div>
                  <div className="text-right">
                    <p className="text-green-400 text-xl font-bold">€890</p>
                    <p className="text-blue-200 text-sm">456 conv.</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Répartition des Plans */}
        <div className="bg-blue-800/30 backdrop-blur-xl rounded-2xl p-8 border border-blue-500/30">
          <h2 className="text-2xl font-bold text-white mb-6">Répartition des Plans</h2>
          <div className="space-y-6">
            {/* Starter */}
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-white text-lg font-medium">Starter</span>
                <span className="text-white text-lg font-bold">25%</span>
              </div>
              <div className="w-full bg-slate-700 rounded-full h-3">
                <div className="bg-gray-500 h-3 rounded-full transition-all duration-1000" style={{ width: '25%' }}></div>
              </div>
            </div>

            {/* Professional */}
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-white text-lg font-medium">Professional</span>
                <span className="text-white text-lg font-bold">50%</span>
              </div>
              <div className="w-full bg-slate-700 rounded-full h-3">
                <div className="bg-cyan-500 h-3 rounded-full transition-all duration-1000" style={{ width: '50%' }}></div>
              </div>
            </div>

            {/* Enterprise */}
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-white text-lg font-medium">Enterprise</span>
                <span className="text-white text-lg font-bold">25%</span>
              </div>
              <div className="w-full bg-slate-700 rounded-full h-3">
                <div className="bg-purple-500 h-3 rounded-full transition-all duration-1000" style={{ width: '25%' }}></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const renderApplications = () => (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-white">Demandes de Création</h2>
        <div className="bg-orange-500/20 border border-orange-400/50 rounded-xl px-4 py-2">
          <span className="text-orange-300 font-semibold">{pendingApplications.length} en attente</span>
        </div>
      </div>

      <div className="grid gap-6">
        {pendingApplications.map((application) => (
          <div key={application.id} className="bg-white/10 backdrop-blur-xl rounded-2xl p-6 border border-white/20">
            <div className="flex justify-between items-start mb-4">
              <div>
                <h3 className="text-xl font-bold text-white mb-2">{application.companyName}</h3>
                <div className="space-y-1">
                  <p className="text-gray-300 flex items-center gap-2">
                    📧 {application.email}
                  </p>
                  <p className="text-gray-300 flex items-center gap-2">
                    📞 {application.phone}
                  </p>
                  <p className="text-gray-300 flex items-center gap-2">
                    🏢 {application.address}, {application.city}
                  </p>
                  <p className="text-gray-300 flex items-center gap-2">
                    🌐 {application.country}
                  </p>
                  <p className="text-gray-300 flex items-center gap-2">
                    👤 {application.firstName} {application.lastName} - {application.position}
                  </p>
                  <p className="text-gray-300 flex items-center gap-2">
                    📄 SIRET: {application.siret}
                  </p>
                  <p className="text-gray-300 flex items-center gap-2">
                    🔑 Mot de passe: {application.password}
                  </p>
                </div>
                <div className="text-sm text-gray-400 mt-3 space-y-1">
                  <p>📅 Soumis le {application.submittedDate || new Date(application.submittedAt || Date.now()).toLocaleDateString('fr-FR')}</p>
                  <p>🕐 À {application.submittedTime || new Date(application.submittedAt || Date.now()).toLocaleTimeString('fr-FR')}</p>
                  <p>⏱️ Il y a {Math.floor((Date.now() - new Date(application.submittedAt || Date.now()).getTime()) / (1000 * 60 * 60))}h</p>
                </div>
              </div>
              <span className={`px-3 py-1 rounded-full text-xs font-medium ${getPlanColor(application.plan)}`}>
                {application.plan}
              </span>
            </div>

            {/* Affichage du fichier Kbis si disponible */}
            <div className="mb-4 p-4 bg-blue-500/20 border border-blue-400/30 rounded-xl">
              <div className="flex items-center gap-2 mb-2">
                <FileText className="w-4 h-4 text-blue-400" />
                <span className="text-blue-200 font-semibold">Document Kbis</span>
              </div>
              {application.kbisFile ? (
                <div className="flex items-center justify-between">
                  <div className="text-sm text-blue-300">
                  📄 {application.kbisFile.name} ({(application.kbisFile.size / 1024 / 1024).toFixed(2)} MB)
                  </div>
                  <button
                    onClick={() => handleViewKbis(application)}
                    className="text-cyan-400 hover:text-cyan-300 text-sm underline"
                  >
                    👁️ Voir le document
                  </button>
                </div>
              ) : (
                <div className="text-sm text-yellow-300">⚠️ Aucun fichier Kbis uploadé</div>
              )}
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => {
            {/* Actions rapides */}
            <div className="flex gap-3 mb-4">
              <button
                onClick={() => handleViewApplication(application)}
                className="bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-xl flex items-center gap-2 text-sm"
              >
                <Eye className="w-4 h-4" />
                Voir détails
              </button>
              <button
                onClick={() => handleViewKbis(application)}
                className="bg-purple-600 hover:bg-purple-700 text-white py-2 px-4 rounded-xl flex items-center gap-2 text-sm"
                disabled={!application.kbisFile}
              >
                <FileText className="w-4 h-4" />
                Voir Kbis
              </button>
            </div>
                  setSelectedApplication(application);
                  setShowValidationModal(true);
                }}
                className="flex-1 bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-400 hover:to-emerald-500 text-white py-3 px-6 rounded-xl font-semibold transition-all"
              >
                ✅ Valider la demande
              </button>
              <button
                onClick={() => handleValidateApplication(application, false)}
                className="flex-1 bg-gradient-to-r from-red-500 to-red-600 hover:from-red-400 hover:to-red-500 text-white py-3 px-6 rounded-xl font-semibold transition-all"
              >
                ❌ Rejeter
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  const renderRetailers = () => (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h2 className="text-2xl font-bold text-white">Gestion des Revendeurs</h2>
        <button className="bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white px-4 py-2 rounded-xl flex items-center gap-2">
          onClick={() => {
            setSelectedApplication(null);
            setNewRetailerData({
              name: '',
              email: '',
              password: '',
              plan: 'professional',
              status: 'active'
            });
            setShowAddRetailerModal(true);
          }}
          <Plus className="w-4 h-4" />
          Nouveau revendeur
        </button>
      </div>

      {/* Filtres */}
      <div className="bg-white/10 backdrop-blur-xl rounded-2xl p-6 border border-white/20">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Rechercher..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-3 bg-black/40 border border-gray-600 rounded-xl text-white placeholder-gray-400"
            />
          </div>
          <select
            value={filterPlan}
            onChange={(e) => setFilterPlan(e.target.value)}
            className="bg-black/40 border border-gray-600 rounded-xl px-4 py-3 text-white"
          >
            <option value="all">Tous les plans</option>
            <option value="starter">Starter</option>
            <option value="professional">Professional</option>
            <option value="enterprise">Enterprise</option>
          </select>
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="bg-black/40 border border-gray-600 rounded-xl px-4 py-3 text-white"
          >
            <option value="all">Tous les statuts</option>
            <option value="active">Actif</option>
            <option value="inactive">Inactif</option>
            <option value="suspended">Suspendu</option>
          </select>
        </div>
      </div>
      <div className="bg-white/10 backdrop-blur-xl rounded-2xl border border-white/20 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-black/20">
              <tr>
                <th className="text-left p-4 text-cyan-300 font-semibold">Revendeur</th>
                <th className="text-left p-4 text-cyan-300 font-semibold">Plan</th>
                <th className="text-left p-4 text-cyan-300 font-semibold">Statut</th>
                <th className="text-left p-4 text-cyan-300 font-semibold">Revenus</th>
                <th className="text-left p-4 text-cyan-300 font-semibold">Conversations</th>
                <th className="text-left p-4 text-cyan-300 font-semibold">Identifiants</th>
                <th className="text-left p-4 text-cyan-300 font-semibold">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredRetailers.map((retailer) => (
                <tr key={retailer.id} className="border-b border-white/10 hover:bg-white/5">
                  <td className="p-4">
                    <div>
                      <div className="font-semibold text-white">{retailer.name}</div>
                      <div className="text-sm text-gray-400">{retailer.email}</div>
                    </div>
                  </td>
                  <td className="p-4">
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${getPlanColor(retailer.plan)}`}>
                      {retailer.plan}
                    </span>
                  </td>
                  <td className="p-4">
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(retailer.status)}`}>
                      {retailer.status}
                    </span>
                  </td>
                  <td className="p-4">
                    <div className="font-semibold text-green-400">€{retailer.revenue}</div>
                  </td>
                  <td className="p-4">
                    <div className="font-semibold text-white">{retailer.conversations.toLocaleString()}</div>
                  </td>
                  <td className="p-4">
                    <div className="text-sm">
                      <div className="text-cyan-400 font-mono">{retailer.email}</div>
                      <div className="text-gray-400 font-mono">{retailer.password || '••••••••'}</div>
                    </div>
                  </td>
                  <td className="p-4">
                    <div className="flex gap-2">
                      <button className="text-blue-400 hover:text-blue-300 p-1">
                        onClick={() => handleViewApplication(retailer)}
                        <Eye className="w-4 h-4" />
                      </button>
                      <button className="text-yellow-400 hover:text-yellow-300 p-1">
                        <Edit className="w-4 h-4" />
                      </button>
                      <button className="text-red-400 hover:text-red-300 p-1">
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

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard': return renderDashboard();
      case 'retailers': return renderRetailers();
      case 'applications': return renderApplications();
      case 'users': return <div className="text-white">Gestion des utilisateurs - En développement</div>;
      case 'analytics': return <div className="text-white">Analytics avancées - En développement</div>;
      case 'settings': return <div className="text-white">Paramètres système - En développement</div>;
      default: return renderDashboard();
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-purple-900">
      {/* Background Effects */}
      <div className="absolute inset-0 opacity-20">
        <div className="absolute top-20 left-20 w-72 h-72 bg-cyan-500/30 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-20 right-20 w-96 h-96 bg-purple-500/20 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '2s' }}></div>
      </div>

      <div className="relative z-10 flex h-screen">
        {/* Sidebar - Exact design from image */}
        <div className="w-80 bg-slate-800/90 backdrop-blur-2xl border-r border-slate-700/50 p-6">
          {/* Header with orange crown icon */}
          <div className="flex items-center gap-3 mb-8">
            <div className="w-12 h-12 bg-orange-500 rounded-xl flex items-center justify-center">
              <Crown className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-white">Super Admin</h1>
              <p className="text-sm text-orange-300">omnia.sale</p>
            </div>
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

          {/* Super Admin Access Card */}
          <div className="bg-yellow-600/20 border border-yellow-500/30 rounded-xl p-4 mb-6">
            <div className="flex items-center gap-2 mb-2">
              <Shield className="w-5 h-5 text-yellow-400" />
              <span className="text-yellow-300 font-semibold">Accès Super Admin</span>
            </div>
            <p className="text-yellow-200 text-sm">Gestion complète de la plateforme</p>
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

      {/* Modal de validation */}
      {showValidationModal && selectedApplication && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-slate-800 rounded-2xl p-6 max-w-2xl w-full">
            <h2 className="text-2xl font-bold text-white mb-6">Validation de {selectedApplication.companyName}</h2>
            
            <div className="space-y-4 mb-6">
              <div className="bg-green-500/20 border border-green-400/50 rounded-xl p-4">
                <h3 className="font-semibold text-green-300 mb-2">✅ Création du compte revendeur</h3>
                <ul className="text-sm text-green-200 space-y-1">
                  <li>• Compte admin créé avec accès complet</li>
                  <li>• Interface de gestion catalogue activée</li>
                  <li>• Configuration OmnIA personnalisée</li>
                  <li>• Abonnement {selectedApplication.plan} activé</li>
                </ul>
              </div>

              <div className="bg-purple-500/20 border border-purple-400/50 rounded-xl p-4">
                <h3 className="font-semibold text-purple-300 mb-2">🌐 Sous-domaine assigné</h3>
                <div className="bg-black/40 rounded-lg p-3">
                  <code className="text-purple-300 text-lg">{selectedApplication.proposedSubdomain}</code>
                </div>
                <p className="text-sm text-purple-200 mt-2">
                  Le client pourra accéder à son OmnIA via cette URL personnalisée
                </p>
              </div>
            </div>

            <div className="flex gap-4">
              <button
                onClick={() => handleValidateApplication(selectedApplication, true)}
                className="flex-1 bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-400 hover:to-emerald-500 text-white py-3 px-6 rounded-xl font-semibold transition-all"
              >
                ✅ Confirmer la validation
              </button>
              <button
                onClick={() => setShowValidationModal(false)}
                className="bg-gray-600 hover:bg-gray-700 text-white py-3 px-6 rounded-xl font-semibold transition-all"
              >
                Annuler
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Notification System */}
      <NotificationSystem 
        notifications={notifications}
        onRemove={removeNotification}
      />

      {/* Modal Kbis */}
      {showKbisModal && selectedKbis && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-800/95 backdrop-blur-xl rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto border border-slate-600/50">
            <div className="flex items-center justify-between p-6 border-b border-slate-600/50">
              <h3 className="text-xl font-bold text-white">📄 Document Kbis - {selectedKbis.companyName}</h3>
              <button
                onClick={() => setShowKbisModal(false)}
                className="text-gray-400 hover:text-white transition-colors text-2xl"
              >
                ×
              </button>
      {/* Modal détails application */}
      {showApplicationModal && selectedApplication && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-800/95 backdrop-blur-xl rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto border border-slate-600/50">
            <div className="flex items-center justify-between p-6 border-b border-slate-600/50">
              <h3 className="text-xl font-bold text-white">📋 Détails - {selectedApplication.companyName}</h3>
              <button
                onClick={() => setShowApplicationModal(false)}
                className="text-gray-400 hover:text-white transition-colors text-2xl"
              >
                ×
              </button>
            </div>
            <div className="p-6 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-black/20 rounded-xl p-4">
                  <h4 className="font-semibold text-white mb-3">🏢 Informations entreprise</h4>
                  <div className="space-y-2 text-sm">
                    <div><span className="text-gray-400">Nom :</span> <span className="text-white">{selectedApplication.companyName}</span></div>
                    <div><span className="text-gray-400">SIRET :</span> <span className="text-white">{selectedApplication.siret}</span></div>
                    <div><span className="text-gray-400">Adresse :</span> <span className="text-white">{selectedApplication.address}</span></div>
                    <div><span className="text-gray-400">Ville :</span> <span className="text-white">{selectedApplication.postalCode} {selectedApplication.city}</span></div>
                    <div><span className="text-gray-400">Pays :</span> <span className="text-white">{selectedApplication.country}</span></div>
                  </div>
                </div>
                <div className="bg-black/20 rounded-xl p-4">
                  <h4 className="font-semibold text-white mb-3">👤 Contact responsable</h4>
                  <div className="space-y-2 text-sm">
                    <div><span className="text-gray-400">Nom :</span> <span className="text-white">{selectedApplication.firstName} {selectedApplication.lastName}</span></div>
                    <div><span className="text-gray-400">Email :</span> <span className="text-white">{selectedApplication.email}</span></div>
                    <div><span className="text-gray-400">Téléphone :</span> <span className="text-white">{selectedApplication.phone}</span></div>
                    <div><span className="text-gray-400">Fonction :</span> <span className="text-white">{selectedApplication.position}</span></div>
                    <div><span className="text-gray-400">Mot de passe :</span> <span className="text-cyan-400 font-mono">{selectedApplication.password}</span></div>
                  </div>
                </div>
              </div>
              <div className="bg-black/20 rounded-xl p-4">
                <h4 className="font-semibold text-white mb-3">📊 Informations abonnement</h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                  <div><span className="text-gray-400">Plan :</span> <span className="text-white">{selectedApplication.selectedPlan}</span></div>
                  <div><span className="text-gray-400">Sous-domaine :</span> <span className="text-cyan-400">{selectedApplication.proposedSubdomain}.omnia.sale</span></div>
                  <div><span className="text-gray-400">Soumis le :</span> <span className="text-white">{new Date(selectedApplication.submittedAt).toLocaleDateString('fr-FR')}</span></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal ajout/édition revendeur */}
      {showAddRetailerModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-800/95 backdrop-blur-xl rounded-2xl max-w-md w-full border border-slate-600/50">
            <div className="flex items-center justify-between p-6 border-b border-slate-600/50">
              <h3 className="text-xl font-bold text-white">
                {selectedApplication ? 'Modifier revendeur' : 'Nouveau revendeur'}
              </h3>
              <button
                onClick={() => {
                  setShowAddRetailerModal(false);
                  setSelectedApplication(null);
                }}
                className="text-gray-400 hover:text-white transition-colors"
              >
                ×
              </button>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm text-gray-300 mb-2">Nom de l'entreprise *</label>
                <input
                  type="text"
                  value={newRetailerData.name}
                  onChange={(e) => setNewRetailerData(prev => ({ ...prev, name: e.target.value }))}
                  className="w-full bg-black/40 border border-gray-600 rounded-xl px-4 py-3 text-white"
                  placeholder="Nom de l'entreprise"
                />
              </div>
              <div>
                <label className="block text-sm text-gray-300 mb-2">Email *</label>
                <input
                  type="email"
                  value={newRetailerData.email}
                  onChange={(e) => setNewRetailerData(prev => ({ ...prev, email: e.target.value }))}
                  className="w-full bg-black/40 border border-gray-600 rounded-xl px-4 py-3 text-white"
                  placeholder="contact@entreprise.fr"
                />
              </div>
              <div>
                <label className="block text-sm text-gray-300 mb-2">Mot de passe *</label>
                <input
                  type="text"
                  value={newRetailerData.password}
                  onChange={(e) => setNewRetailerData(prev => ({ ...prev, password: e.target.value }))}
                  className="w-full bg-black/40 border border-gray-600 rounded-xl px-4 py-3 text-white"
                  placeholder="motdepasse123"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm text-gray-300 mb-2">Plan</label>
                  <select
                    value={newRetailerData.plan}
                    onChange={(e) => setNewRetailerData(prev => ({ ...prev, plan: e.target.value }))}
                    className="w-full bg-black/40 border border-gray-600 rounded-xl px-4 py-3 text-white"
                  >
                    <option value="starter">Starter</option>
                    <option value="professional">Professional</option>
                    <option value="enterprise">Enterprise</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm text-gray-300 mb-2">Statut</label>
                  <select
                    value={newRetailerData.status}
                    onChange={(e) => setNewRetailerData(prev => ({ ...prev, status: e.target.value }))}
                    className="w-full bg-black/40 border border-gray-600 rounded-xl px-4 py-3 text-white"
                  >
                    <option value="active">Actif</option>
                    <option value="inactive">Inactif</option>
                    <option value="suspended">Suspendu</option>
                  </select>
                </div>
              </div>
              <div className="flex gap-4 pt-4">
                <button
                  onClick={() => {
                    setShowAddRetailerModal(false);
                    setSelectedApplication(null);
                  }}
                  className="flex-1 bg-gray-600 hover:bg-gray-700 text-white py-3 rounded-xl"
                >
                  Annuler
                </button>
                <button
                  onClick={handleAddRetailer}
                  className="flex-1 bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-400 hover:to-emerald-500 text-white py-3 rounded-xl font-semibold"
                >
                  {selectedApplication ? 'Modifier' : 'Créer'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
            </div>
            <div className="p-6">
              <div className="bg-white rounded-xl p-6 text-center">
                {selectedKbis.kbisFile && selectedKbis.kbisFile instanceof File ? (
                  selectedKbis.kbisFile.type === 'application/pdf' ? (
                    <div>
                      <FileText className="w-24 h-24 text-gray-400 mx-auto mb-4" />
                      <p className="text-gray-600 text-lg font-semibold">{selectedKbis.kbisFile.name}</p>
                      <p className="text-gray-500">Document PDF - {(selectedKbis.kbisFile.size / 1024 / 1024).toFixed(2)} MB</p>
                      <p className="text-sm text-gray-400 mt-2">Prévisualisation PDF non disponible dans le navigateur</p>
                      <button
                        onClick={() => {
                          const url = URL.createObjectURL(selectedKbis.kbisFile);
                          window.open(url, '_blank');
                        }}
                        className="mt-4 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg"
                        title="Voir détails"
                      >
                        📥 Télécharger le PDF
                  <li>• Email envoyé avec identifiants de connexion</li>
                      </button>
                    </div>
                        onClick={() => handleEditRetailer(retailer)}
                  ) : (
                    <img 
                      src={URL.createObjectURL(selectedKbis.kbisFile)} 
                      alt="Kbis"
                      className="max-w-full h-auto rounded-lg shadow-lg"
                    />
                  )
                ) : selectedKbis.kbisFile ? (
                  <div>
                    <FileText className="w-24 h-24 text-orange-400 mx-auto mb-4" />
              <div className="bg-blue-500/20 border border-blue-400/50 rounded-xl p-4">
                <h3 className="font-semibold text-blue-300 mb-2">🔑 Identifiants de connexion</h3>
                <div className="bg-black/40 rounded-lg p-3 space-y-2">
                        <Download className="w-4 h-4" />
                  <div className="flex justify-between">
                    <span className="text-blue-200">Email :</span>
                    <code className="text-blue-300">{selectedApplication.email}</code>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-blue-200">Mot de passe :</span>
                    <code className="text-blue-300">{selectedApplication.password}</code>
                  </div>
                </div>
              </div>
                        title="Modifier"
                    <p className="text-gray-600 text-lg font-semibold">Document Kbis disponible</p>
                    <p className="text-orange-500">Fichier: {selectedKbis.kbisFile.name || 'Document uploadé'}</p>
                    <p className="text-sm text-gray-400 mt-2">⚠️ Prévisualisation non disponible - Le fichier n'est plus accessible après rechargement de la page</p>
                    <p className="text-xs text-gray-400 mt-1">Les fichiers ne sont pas persistés dans localStorage pour des raisons de performance</p>
                        onClick={() => handleDeleteRetailer(retailer.id)}
                  </div>
                        title="Supprimer"
                ) : (
                  <div>
                    <AlertTriangle className="w-24 h-24 text-yellow-400 mx-auto mb-4" />
                    <p className="text-gray-600 text-lg">Aucun document Kbis uploadé</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};