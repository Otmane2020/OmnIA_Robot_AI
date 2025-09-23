import React, { useState, useEffect } from 'react';
import {
  Users, Building, CheckCircle, X, Eye, Edit, Trash2, Plus,
  Mail, Phone, MapPin, Calendar, FileText, AlertCircle,
  Search, Filter, Download, Upload, Settings, LogOut,
  User, CreditCard, Globe, BarChart3, Clock, Star
} from 'lucide-react';
import { Logo } from '../components/Logo';

interface Application {
  id: string;
  companyName: string;
  siret: string;
  address: string;
  postalCode: string;
  city: string;
  country: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  position: string;
  password: string;
  selectedPlan: 'starter' | 'professional' | 'enterprise';
  kbisFile: File | null;
  submittedAt: string;
  submittedDate: string;
  submittedTime: string;
  status: 'pending' | 'approved' | 'rejected';
  proposedSubdomain: string;
}

interface Retailer {
  id: string;
  companyName: string;
  email: string;
  password: string;
  plan: 'starter' | 'professional' | 'enterprise';
  status: 'active' | 'inactive' | 'suspended';
  revenue: number;
  conversations: number;
  products: number;
  joinDate: string;
  lastActive: string;
  subdomain: string;
  contactName: string;
  phone: string;
  address: string;
  city: string;
  siret: string;
}

interface SuperAdminProps {
  onLogout: () => void;
  pendingApplications: Application[];
  onValidateApplication: (applicationId: string, approved: boolean) => void;
}

export const SuperAdmin: React.FC<SuperAdminProps> = ({ 
  onLogout, 
  pendingApplications, 
  onValidateApplication 
}) => {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [retailers, setRetailers] = useState<Retailer[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [planFilter, setPlanFilter] = useState('all');
  const [selectedApplication, setSelectedApplication] = useState<Application | null>(null);
  const [selectedRetailer, setSelectedRetailer] = useState<Retailer | null>(null);
  const [showApplicationModal, setShowApplicationModal] = useState(false);
  const [showRetailerModal, setShowRetailerModal] = useState(false);
  const [showCreateRetailerModal, setShowCreateRetailerModal] = useState(false);
  const [selectedKbis, setSelectedKbis] = useState<{ application: Application; kbisFile: File } | null>(null);
  const [showKbisModal, setShowKbisModal] = useState(false);

  // Charger les revendeurs depuis localStorage
  useEffect(() => {
    try {
      const savedRetailers = localStorage.getItem('approved_retailers');
      if (savedRetailers) {
        setRetailers(JSON.parse(savedRetailers));
      } else {
        // Revendeurs de démonstration
        const demoRetailers: Retailer[] = [
          {
            id: 'retailer-1',
            companyName: 'Decora Home',
            email: 'demo@decorahome.fr',
            password: 'demo123',
            plan: 'professional',
            status: 'active',
            revenue: 15420,
            conversations: 1234,
            products: 247,
            joinDate: '2024-03-15',
            lastActive: '2025-01-15',
            subdomain: 'decorahome',
            contactName: 'Marie Dubois',
            phone: '+33 1 23 45 67 89',
            address: '123 Rue de la Paix',
            city: 'Paris',
            siret: '12345678901234'
          },
          {
            id: 'retailer-2',
            companyName: 'Mobilier Design',
            email: 'contact@mobilierdesign.fr',
            password: 'design123',
            plan: 'enterprise',
            status: 'active',
            revenue: 28750,
            conversations: 2156,
            products: 456,
            joinDate: '2024-01-20',
            lastActive: '2025-01-14',
            subdomain: 'mobilierdesign',
            contactName: 'Jean Martin',
            phone: '+33 1 34 56 78 90',
            address: '456 Avenue Montaigne',
            city: 'Lyon',
            siret: '23456789012345'
          }
        ];
        setRetailers(demoRetailers);
        localStorage.setItem('approved_retailers', JSON.stringify(demoRetailers));
      }
    } catch (error) {
      console.error('Erreur chargement revendeurs:', error);
    }
  }, []);

  // Sauvegarder les revendeurs dans localStorage
  useEffect(() => {
    localStorage.setItem('approved_retailers', JSON.stringify(retailers));
  }, [retailers]);

  const handleApproveApplication = (application: Application) => {
    console.log('✅ APPROBATION:', application.companyName);
    
    // Créer le nouveau revendeur
    const newRetailer: Retailer = {
      id: `retailer-${Date.now()}`,
      companyName: application.companyName,
      email: application.email,
      password: application.password,
      plan: application.selectedPlan,
      status: 'active',
      revenue: 0,
      conversations: 0,
      products: 0,
      joinDate: new Date().toISOString().split('T')[0],
      lastActive: new Date().toISOString().split('T')[0],
      subdomain: application.proposedSubdomain,
      contactName: `${application.firstName} ${application.lastName}`,
      phone: application.phone,
      address: application.address,
      city: application.city,
      siret: application.siret
    };

    // Ajouter aux revendeurs
    setRetailers(prev => [...prev, newRetailer]);
    
    // Supprimer de la liste des demandes
    onValidateApplication(application.id, true);
    
    // Simuler l'envoi d'email
    console.log('📧 EMAIL APPROBATION envoyé à:', application.email);
    console.log('🔑 Identifiants:', {
      email: application.email,
      password: application.password,
      subdomain: `${application.proposedSubdomain}.omnia.sale`
    });
    
    alert(`✅ Revendeur approuvé !\n\nIdentifiants envoyés à ${application.email} :\n• Email: ${application.email}\n• Mot de passe: ${application.password}\n• Domaine: ${application.proposedSubdomain}.omnia.sale`);
  };

  const handleRejectApplication = (application: Application) => {
    const reason = prompt('Raison du rejet (sera envoyée par email) :');
    if (reason) {
      console.log('❌ REJET:', application.companyName, 'Raison:', reason);
      console.log('📧 EMAIL REJET envoyé à:', application.email);
      
      onValidateApplication(application.id, false);
      alert(`❌ Demande rejetée.\n\nEmail envoyé à ${application.email} avec la raison :\n"${reason}"`);
    }
  };

  const handleViewApplication = (application: Application) => {
    setSelectedApplication(application);
    setShowApplicationModal(true);
  };

  const handleEditApplication = (application: Application) => {
    setSelectedApplication(application);
    setShowApplicationModal(true);
  };

  const handleDeleteApplication = (applicationId: string) => {
    if (confirm('Supprimer définitivement cette demande ?')) {
      onValidateApplication(applicationId, false);
      console.log('🗑️ Demande supprimée:', applicationId);
    }
  };

  const handleViewKbis = (application: Application) => {
    if (application.kbisFile) {
      setSelectedKbis({ application, kbisFile: application.kbisFile });
      setShowKbisModal(true);
    } else {
      alert('Aucun document Kbis disponible pour cette demande.');
    }
  };

  const handleCreateRetailer = (retailerData: any) => {
    const newRetailer: Retailer = {
      id: `retailer-${Date.now()}`,
      companyName: retailerData.companyName,
      email: retailerData.email,
      password: retailerData.password,
      plan: retailerData.plan,
      status: 'active',
      revenue: 0,
      conversations: 0,
      products: 0,
      joinDate: new Date().toISOString().split('T')[0],
      lastActive: new Date().toISOString().split('T')[0],
      subdomain: retailerData.companyName.toLowerCase().replace(/[^a-z0-9]/g, '').substring(0, 20),
      contactName: `${retailerData.firstName} ${retailerData.lastName}`,
      phone: retailerData.phone,
      address: retailerData.address,
      city: retailerData.city,
      siret: retailerData.siret
    };

    setRetailers(prev => [...prev, newRetailer]);
    setShowCreateRetailerModal(false);
    
    console.log('✅ Revendeur créé manuellement:', newRetailer.companyName);
    alert(`✅ Revendeur créé !\n\nIdentifiants :\n• Email: ${newRetailer.email}\n• Mot de passe: ${newRetailer.password}\n• Domaine: ${newRetailer.subdomain}.omnia.sale`);
  };

  const handleEditRetailer = (retailer: Retailer) => {
    setSelectedRetailer(retailer);
    setShowRetailerModal(true);
  };

  const handleUpdateRetailer = (updatedData: any) => {
    if (selectedRetailer) {
      setRetailers(prev => prev.map(r => 
        r.id === selectedRetailer.id 
          ? { ...r, ...updatedData, lastActive: new Date().toISOString().split('T')[0] }
          : r
      ));
      setShowRetailerModal(false);
      setSelectedRetailer(null);
      console.log('✅ Revendeur modifié:', updatedData.companyName);
    }
  };

  const handleDeleteRetailer = (retailerId: string) => {
    if (confirm('Supprimer définitivement ce revendeur ? Cette action est irréversible.')) {
      setRetailers(prev => prev.filter(r => r.id !== retailerId));
      console.log('🗑️ Revendeur supprimé:', retailerId);
    }
  };

  const filteredApplications = pendingApplications.filter(app => {
    const matchesSearch = searchTerm === '' || 
      app.companyName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      app.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      `${app.firstName} ${app.lastName}`.toLowerCase().includes(searchTerm.toLowerCase());
    
    return matchesSearch;
  });

  const filteredRetailers = retailers.filter(retailer => {
    const matchesSearch = searchTerm === '' || 
      retailer.companyName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      retailer.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      retailer.contactName.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || retailer.status === statusFilter;
    const matchesPlan = planFilter === 'all' || retailer.plan === planFilter;
    
    return matchesSearch && matchesStatus && matchesPlan;
  });

  const stats = {
    totalRetailers: retailers.length,
    activeRetailers: retailers.filter(r => r.status === 'active').length,
    pendingApplications: pendingApplications.length,
    totalRevenue: retailers.reduce((sum, r) => sum + r.revenue, 0),
    totalConversations: retailers.reduce((sum, r) => sum + r.conversations, 0),
    totalProducts: retailers.reduce((sum, r) => sum + r.products, 0)
  };

  const tabs = [
    { id: 'dashboard', label: 'Tableau de bord', icon: BarChart3 },
    { id: 'applications', label: 'Demandes en attente', icon: Clock },
    { id: 'retailers', label: 'Revendeurs', icon: Users },
    { id: 'settings', label: 'Paramètres', icon: Settings }
  ];

  const renderDashboard = () => (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold text-white">Tableau de bord Super Admin</h2>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 bg-green-400 rounded-full animate-pulse"></div>
          <span className="text-green-300 text-sm">Système opérationnel</span>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-blue-600/20 backdrop-blur-xl rounded-2xl p-6 border border-blue-500/30">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-blue-200 text-sm mb-1">Revendeurs Actifs</p>
              <p className="text-3xl font-bold text-white mb-1">{stats.activeRetailers}</p>
              <p className="text-green-400 text-sm">sur {stats.totalRetailers} total</p>
            </div>
            <Users className="w-10 h-10 text-blue-400" />
          </div>
        </div>
        
        <div className="bg-orange-600/20 backdrop-blur-xl rounded-2xl p-6 border border-orange-500/30">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-orange-200 text-sm mb-1">Demandes en attente</p>
              <p className="text-3xl font-bold text-white mb-1">{stats.pendingApplications}</p>
              <p className="text-orange-400 text-sm">À traiter</p>
            </div>
            <Clock className="w-10 h-10 text-orange-400" />
          </div>
        </div>
        
        <div className="bg-green-600/20 backdrop-blur-xl rounded-2xl p-6 border border-green-500/30">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-green-200 text-sm mb-1">Revenus Total</p>
              <p className="text-3xl font-bold text-white mb-1">€{stats.totalRevenue.toLocaleString()}</p>
              <p className="text-green-400 text-sm">Ce mois</p>
            </div>
            <CreditCard className="w-10 h-10 text-green-400" />
          </div>
        </div>
        
        <div className="bg-purple-600/20 backdrop-blur-xl rounded-2xl p-6 border border-purple-500/30">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-purple-200 text-sm mb-1">Conversations</p>
              <p className="text-3xl font-bold text-white mb-1">{stats.totalConversations.toLocaleString()}</p>
              <p className="text-purple-400 text-sm">Total plateforme</p>
            </div>
            <BarChart3 className="w-10 h-10 text-purple-400" />
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-white/10 backdrop-blur-xl rounded-2xl p-8 border border-white/20">
        <h3 className="text-2xl font-bold text-white mb-6">Actions Rapides</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <button
            onClick={() => setActiveTab('applications')}
            className="bg-orange-500/20 hover:bg-orange-500/30 border border-orange-400/50 rounded-xl p-6 text-left transition-all"
          >
            <Clock className="w-8 h-8 text-orange-400 mb-3" />
            <h4 className="text-lg font-semibold text-white mb-2">Traiter les demandes</h4>
            <p className="text-gray-300 text-sm">{stats.pendingApplications} en attente</p>
          </button>
          
          <button
            onClick={() => setShowCreateRetailerModal(true)}
            className="bg-green-500/20 hover:bg-green-500/30 border border-green-400/50 rounded-xl p-6 text-left transition-all"
          >
            <Plus className="w-8 h-8 text-green-400 mb-3" />
            <h4 className="text-lg font-semibold text-white mb-2">Nouveau revendeur</h4>
            <p className="text-gray-300 text-sm">Création manuelle</p>
          </button>
          
          <button
            onClick={() => setActiveTab('retailers')}
            className="bg-blue-500/20 hover:bg-blue-500/30 border border-blue-400/50 rounded-xl p-6 text-left transition-all"
          >
            <Users className="w-8 h-8 text-blue-400 mb-3" />
            <h4 className="text-lg font-semibold text-white mb-2">Gérer revendeurs</h4>
            <p className="text-gray-300 text-sm">{stats.activeRetailers} actifs</p>
          </button>
        </div>
      </div>
    </div>
  );

  const renderApplications = () => (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-white">Demandes d'inscription</h2>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 bg-orange-400 rounded-full animate-pulse"></div>
          <span className="text-orange-300 text-sm">{pendingApplications.length} en attente</span>
        </div>
      </div>

      {/* Search */}
      <div className="bg-white/10 backdrop-blur-xl rounded-2xl p-6 border border-white/20">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            placeholder="Rechercher par entreprise, email, contact..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-3 bg-black/40 border border-gray-600 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:border-cyan-400"
          />
        </div>
      </div>

      {/* Applications Table */}
      <div className="bg-white/10 backdrop-blur-xl rounded-2xl border border-white/20 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-black/20">
              <tr>
                <th className="text-left p-4 text-cyan-300 font-semibold">Entreprise</th>
                <th className="text-left p-4 text-cyan-300 font-semibold">Contact</th>
                <th className="text-left p-4 text-cyan-300 font-semibold">Plan</th>
                <th className="text-left p-4 text-cyan-300 font-semibold">Soumis le</th>
                <th className="text-left p-4 text-cyan-300 font-semibold">Identifiants</th>
                <th className="text-left p-4 text-cyan-300 font-semibold">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredApplications.map((application) => (
                <tr key={application.id} className="border-b border-white/10 hover:bg-white/5">
                  <td className="p-4">
                    <div>
                      <div className="font-semibold text-white">{application.companyName}</div>
                      <div className="text-gray-400 text-sm">SIRET: {application.siret}</div>
                      <div className="text-gray-400 text-sm">{application.city}, {application.country}</div>
                    </div>
                  </td>
                  <td className="p-4">
                    <div>
                      <div className="text-white">{application.firstName} {application.lastName}</div>
                      <div className="text-gray-400 text-sm">{application.email}</div>
                      <div className="text-gray-400 text-sm">{application.phone}</div>
                      <div className="text-gray-400 text-sm">{application.position}</div>
                    </div>
                  </td>
                  <td className="p-4">
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                      application.selectedPlan === 'enterprise' ? 'bg-purple-500/20 text-purple-300' :
                      application.selectedPlan === 'professional' ? 'bg-blue-500/20 text-blue-300' :
                      'bg-gray-500/20 text-gray-300'
                    }`}>
                      {application.selectedPlan}
                    </span>
                  </td>
                  <td className="p-4">
                    <div className="text-white text-sm">{application.submittedDate}</div>
                    <div className="text-gray-400 text-xs">{application.submittedTime}</div>
                  </td>
                  <td className="p-4">
                    <div className="bg-green-500/20 border border-green-400/30 rounded-lg p-2">
                      <div className="text-green-300 text-xs">Email: {application.email}</div>
                      <div className="text-green-300 text-xs">Mot de passe: {application.password}</div>
                      <div className="text-green-300 text-xs">Domaine: {application.proposedSubdomain}.omnia.sale</div>
                    </div>
                  </td>
                  <td className="p-4">
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleViewApplication(application)}
                        className="text-blue-400 hover:text-blue-300 p-1"
                        title="Voir détails"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleEditApplication(application)}
                        className="text-yellow-400 hover:text-yellow-300 p-1"
                        title="Modifier"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleViewKbis(application)}
                        className="text-purple-400 hover:text-purple-300 p-1"
                        title="Voir Kbis"
                      >
                        <FileText className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDeleteApplication(application.id)}
                        className="text-red-400 hover:text-red-300 p-1"
                        title="Supprimer"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleApproveApplication(application)}
                        className="bg-green-600 hover:bg-green-700 text-white px-3 py-1 rounded-lg text-xs"
                      >
                        ✅ Approuver
                      </button>
                      <button
                        onClick={() => handleRejectApplication(application)}
                        className="bg-red-600 hover:bg-red-700 text-white px-3 py-1 rounded-lg text-xs"
                      >
                        ❌ Rejeter
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {filteredApplications.length === 0 && (
        <div className="text-center py-20">
          <Clock className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-xl font-bold text-white mb-2">Aucune demande en attente</h3>
          <p className="text-gray-400">Toutes les demandes ont été traitées</p>
        </div>
      )}
    </div>
  );

  const renderRetailers = () => (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-white">Gestion des Revendeurs</h2>
        <button
          onClick={() => setShowCreateRetailerModal(true)}
          className="bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-400 hover:to-emerald-500 text-white px-6 py-3 rounded-xl font-semibold transition-all flex items-center gap-2"
        >
          <Plus className="w-5 h-5" />
          Nouveau revendeur
        </button>
      </div>

      {/* Filters */}
      <div className="bg-white/10 backdrop-blur-xl rounded-2xl p-6 border border-white/20">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Rechercher..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-3 bg-black/40 border border-gray-600 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:border-cyan-400"
            />
          </div>
          
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="bg-black/40 border border-gray-600 rounded-xl px-4 py-3 text-white"
          >
            <option value="all">Tous les statuts</option>
            <option value="active">Actif</option>
            <option value="inactive">Inactif</option>
            <option value="suspended">Suspendu</option>
          </select>
          
          <select
            value={planFilter}
            onChange={(e) => setPlanFilter(e.target.value)}
            className="bg-black/40 border border-gray-600 rounded-xl px-4 py-3 text-white"
          >
            <option value="all">Tous les plans</option>
            <option value="starter">Starter</option>
            <option value="professional">Professional</option>
            <option value="enterprise">Enterprise</option>
          </select>
          
          <button className="bg-cyan-600 hover:bg-cyan-700 text-white px-4 py-3 rounded-xl flex items-center gap-2">
            <Download className="w-4 h-4" />
            Exporter
          </button>
        </div>
      </div>

      {/* Retailers Table */}
      <div className="bg-white/10 backdrop-blur-xl rounded-2xl border border-white/20 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-black/20">
              <tr>
                <th className="text-left p-4 text-cyan-300 font-semibold">Revendeur</th>
                <th className="text-left p-4 text-cyan-300 font-semibold">Plan</th>
                <th className="text-left p-4 text-cyan-300 font-semibold">Statut</th>
                <th className="text-left p-4 text-cyan-300 font-semibold">Performances</th>
                <th className="text-left p-4 text-cyan-300 font-semibold">Identifiants</th>
                <th className="text-left p-4 text-cyan-300 font-semibold">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredRetailers.map((retailer) => (
                <tr key={retailer.id} className="border-b border-white/10 hover:bg-white/5">
                  <td className="p-4">
                    <div>
                      <div className="font-semibold text-white">{retailer.companyName}</div>
                      <div className="text-gray-400 text-sm">{retailer.contactName}</div>
                      <div className="text-gray-400 text-sm">{retailer.email}</div>
                      <div className="text-gray-400 text-sm">{retailer.subdomain}.omnia.sale</div>
                    </div>
                  </td>
                  <td className="p-4">
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                      retailer.plan === 'enterprise' ? 'bg-purple-500/20 text-purple-300' :
                      retailer.plan === 'professional' ? 'bg-blue-500/20 text-blue-300' :
                      'bg-gray-500/20 text-gray-300'
                    }`}>
                      {retailer.plan}
                    </span>
                  </td>
                  <td className="p-4">
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                      retailer.status === 'active' ? 'bg-green-500/20 text-green-300' :
                      retailer.status === 'inactive' ? 'bg-yellow-500/20 text-yellow-300' :
                      'bg-red-500/20 text-red-300'
                    }`}>
                      {retailer.status}
                    </span>
                  </td>
                  <td className="p-4">
                    <div className="text-sm">
                      <div className="text-green-400">€{retailer.revenue.toLocaleString()}</div>
                      <div className="text-blue-400">{retailer.conversations} conv.</div>
                      <div className="text-purple-400">{retailer.products} prod.</div>
                    </div>
                  </td>
                  <td className="p-4">
                    <div className="bg-blue-500/20 border border-blue-400/30 rounded-lg p-2">
                      <div className="text-blue-300 text-xs">Email: {retailer.email}</div>
                      <div className="text-blue-300 text-xs">Mot de passe: {retailer.password}</div>
                      <div className="text-blue-300 text-xs">Domaine: {retailer.subdomain}.omnia.sale</div>
                    </div>
                  </td>
                  <td className="p-4">
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleEditRetailer(retailer)}
                        className="text-yellow-400 hover:text-yellow-300 p-1"
                        title="Modifier"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDeleteRetailer(retailer.id)}
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

      {filteredRetailers.length === 0 && (
        <div className="text-center py-20">
          <Users className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-xl font-bold text-white mb-2">Aucun revendeur trouvé</h3>
          <p className="text-gray-400">Aucun revendeur ne correspond à vos critères</p>
        </div>
      )}
    </div>
  );

  const renderSettings = () => (
    <div className="space-y-8">
      <h2 className="text-2xl font-bold text-white">Paramètres Système</h2>
      
      <div className="bg-white/10 backdrop-blur-xl rounded-2xl p-8 border border-white/20">
        <h3 className="text-xl font-bold text-white mb-6">Configuration Globale</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm text-gray-300 mb-2">Validation automatique</label>
            <select className="w-full bg-black/40 border border-gray-600 rounded-xl px-4 py-3 text-white">
              <option value="manual">Validation manuelle</option>
              <option value="auto">Validation automatique</option>
            </select>
          </div>
          
          <div>
            <label className="block text-sm text-gray-300 mb-2">Délai de validation (heures)</label>
            <input
              type="number"
              defaultValue="24"
              className="w-full bg-black/40 border border-gray-600 rounded-xl px-4 py-3 text-white"
            />
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
      case 'applications': return renderApplications();
      case 'retailers': return renderRetailers();
      case 'settings': return renderSettings();
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
        {/* Sidebar */}
        <div className="w-80 bg-slate-800/90 backdrop-blur-2xl border-r border-slate-700/50 p-6">
          {/* Header */}
          <div className="flex items-center gap-3 mb-8">
            <div className="w-12 h-12 bg-gradient-to-br from-red-500 to-pink-600 rounded-xl flex items-center justify-center">
              <Settings className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-white">Super Admin</h1>
              <p className="text-sm text-red-300">OmnIA.sale</p>
            </div>
          </div>

          {/* Navigation */}
          <nav className="space-y-2 mb-8">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all text-left ${
                    activeTab === tab.id
                      ? 'bg-red-500/30 text-white border border-red-500/50'
                      : 'text-gray-300 hover:bg-slate-700/50 hover:text-white'
                  }`}
                >
                  <Icon className="w-5 h-5" />
                  <span className="font-medium">{tab.label}</span>
                  {tab.id === 'applications' && pendingApplications.length > 0 && (
                    <span className="ml-auto bg-orange-500 text-white text-xs px-2 py-1 rounded-full">
                      {pendingApplications.length}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>

          <button
            onClick={onLogout}
            className="w-full bg-red-600/20 hover:bg-red-600/30 text-red-300 px-4 py-3 rounded-xl font-medium border border-red-500/30 transition-all flex items-center gap-2"
          >
            <LogOut className="w-5 h-5" />
            Déconnexion
          </button>
        </div>

        {/* Main Content */}
        <div className="flex-1 overflow-y-auto p-8">
          {renderContent()}
        </div>
      </div>

      {/* Application Detail Modal */}
      {showApplicationModal && selectedApplication && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-800/95 backdrop-blur-xl rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto border border-slate-600/50">
            <div className="flex items-center justify-between p-6 border-b border-slate-600/50">
              <h3 className="text-2xl font-bold text-white">Détails de la demande</h3>
              <button
                onClick={() => setShowApplicationModal(false)}
                className="text-gray-400 hover:text-white"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
            
            <div className="p-6 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-black/20 rounded-xl p-4">
                  <h4 className="font-semibold text-white mb-3">🏢 Informations entreprise</h4>
                  <div className="space-y-2 text-sm">
                    <div><span className="text-gray-400">Entreprise:</span> <span className="text-white">{selectedApplication.companyName}</span></div>
                    <div><span className="text-gray-400">SIRET:</span> <span className="text-white">{selectedApplication.siret}</span></div>
                    <div><span className="text-gray-400">Adresse:</span> <span className="text-white">{selectedApplication.address}</span></div>
                    <div><span className="text-gray-400">Ville:</span> <span className="text-white">{selectedApplication.postalCode} {selectedApplication.city}</span></div>
                    <div><span className="text-gray-400">Pays:</span> <span className="text-white">{selectedApplication.country}</span></div>
                  </div>
                </div>
                
                <div className="bg-black/20 rounded-xl p-4">
                  <h4 className="font-semibold text-white mb-3">👤 Contact responsable</h4>
                  <div className="space-y-2 text-sm">
                    <div><span className="text-gray-400">Nom:</span> <span className="text-white">{selectedApplication.firstName} {selectedApplication.lastName}</span></div>
                    <div><span className="text-gray-400">Email:</span> <span className="text-white">{selectedApplication.email}</span></div>
                    <div><span className="text-gray-400">Téléphone:</span> <span className="text-white">{selectedApplication.phone}</span></div>
                    <div><span className="text-gray-400">Fonction:</span> <span className="text-white">{selectedApplication.position}</span></div>
                  </div>
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-black/20 rounded-xl p-4">
                  <h4 className="font-semibold text-white mb-3">💳 Plan et domaine</h4>
                  <div className="space-y-2 text-sm">
                    <div><span className="text-gray-400">Plan choisi:</span> <span className="text-white">{selectedApplication.selectedPlan}</span></div>
                    <div><span className="text-gray-400">Sous-domaine:</span> <span className="text-cyan-400">{selectedApplication.proposedSubdomain}.omnia.sale</span></div>
                  </div>
                </div>
                
                <div className="bg-black/20 rounded-xl p-4">
                  <h4 className="font-semibold text-white mb-3">📅 Informations soumission</h4>
                  <div className="space-y-2 text-sm">
                    <div><span className="text-gray-400">Date:</span> <span className="text-white">{selectedApplication.submittedDate}</span></div>
                    <div><span className="text-gray-400">Heure:</span> <span className="text-white">{selectedApplication.submittedTime}</span></div>
                    <div><span className="text-gray-400">Référence:</span> <span className="text-white">#{selectedApplication.id}</span></div>
                  </div>
                </div>
              </div>

              <div className="bg-green-500/20 border border-green-400/30 rounded-xl p-4">
                <h4 className="font-semibold text-green-200 mb-3">🔑 Identifiants de connexion</h4>
                <div className="space-y-2 text-sm">
                  <div><span className="text-green-300">Email:</span> <span className="text-white font-mono">{selectedApplication.email}</span></div>
                  <div><span className="text-green-300">Mot de passe:</span> <span className="text-white font-mono">{selectedApplication.password}</span></div>
                  <div><span className="text-green-300">URL admin:</span> <span className="text-cyan-400">https://omnia.sale/admin</span></div>
                  <div><span className="text-green-300">Domaine boutique:</span> <span className="text-cyan-400">https://{selectedApplication.proposedSubdomain}.omnia.sale</span></div>
                </div>
              </div>
              
              <div className="flex justify-between">
                <div className="flex gap-3">
                  <button
                    onClick={() => handleApproveApplication(selectedApplication)}
                    className="bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-xl font-semibold transition-all"
                  >
                    ✅ Approuver
                  </button>
                  <button
                    onClick={() => handleRejectApplication(selectedApplication)}
                    className="bg-red-600 hover:bg-red-700 text-white px-6 py-3 rounded-xl font-semibold transition-all"
                  >
                    ❌ Rejeter
                  </button>
                  {selectedApplication.kbisFile && (
                    <button
                      onClick={() => handleViewKbis(selectedApplication)}
                      className="bg-purple-600 hover:bg-purple-700 text-white px-6 py-3 rounded-xl font-semibold transition-all"
                    >
                      📄 Voir Kbis
                    </button>
                  )}
                </div>
                <button
                  onClick={() => setShowApplicationModal(false)}
                  className="bg-gray-600 hover:bg-gray-700 text-white px-6 py-3 rounded-xl transition-all"
                >
                  Fermer
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Kbis Viewer Modal */}
      {showKbisModal && selectedKbis && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-800/95 backdrop-blur-xl rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto border border-slate-600/50">
            <div className="flex items-center justify-between p-6 border-b border-slate-600/50">
              <h3 className="text-2xl font-bold text-white">Document Kbis - {selectedKbis.application.companyName}</h3>
              <button
                onClick={() => setShowKbisModal(false)}
                className="text-gray-400 hover:text-white"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
            
            <div className="p-6">
              <div className="bg-black/20 rounded-xl p-4 mb-6">
                <h4 className="font-semibold text-white mb-2">📄 Informations document</h4>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div><span className="text-gray-400">Nom:</span> <span className="text-white">{selectedKbis.kbisFile.name}</span></div>
                  <div><span className="text-gray-400">Taille:</span> <span className="text-white">{(selectedKbis.kbisFile.size / 1024 / 1024).toFixed(2)} MB</span></div>
                  <div><span className="text-gray-400">Type:</span> <span className="text-white">{selectedKbis.kbisFile.type}</span></div>
                  <div><span className="text-gray-400">Modifié:</span> <span className="text-white">{new Date(selectedKbis.kbisFile.lastModified).toLocaleDateString('fr-FR')}</span></div>
                </div>
              </div>
              
              <div className="text-center">
                {selectedKbis.kbisFile.type.startsWith('image/') ? (
                  <img
                    src={URL.createObjectURL(selectedKbis.kbisFile)}
                    alt="Document Kbis"
                    className="max-w-full h-auto rounded-xl border border-gray-600"
                  />
                ) : selectedKbis.kbisFile.type === 'application/pdf' ? (
                  <div className="bg-red-500/20 border border-red-400/50 rounded-xl p-8">
                    <FileText className="w-16 h-16 text-red-400 mx-auto mb-4" />
                    <h4 className="text-lg font-semibold text-white mb-2">Document PDF</h4>
                    <p className="text-gray-300 mb-4">{selectedKbis.kbisFile.name}</p>
                    <button
                      onClick={() => {
                        const url = URL.createObjectURL(selectedKbis.kbisFile);
                        window.open(url, '_blank');
                      }}
                      className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-xl"
                    >
                      Ouvrir le PDF
                    </button>
                  </div>
                ) : (
                  <div className="bg-gray-500/20 border border-gray-400/50 rounded-xl p-8">
                    <FileText className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                    <h4 className="text-lg font-semibold text-white mb-2">Document non prévisualisable</h4>
                    <p className="text-gray-300 mb-4">{selectedKbis.kbisFile.name}</p>
                    <button
                      onClick={() => {
                        const url = URL.createObjectURL(selectedKbis.kbisFile);
                        const a = document.createElement('a');
                        a.href = url;
                        a.download = selectedKbis.kbisFile.name;
                        a.click();
                      }}
                      className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-xl"
                    >
                      Télécharger
                    </button>
                  </div>
                )}
              </div>
              
              <div className="flex justify-center mt-6">
                <button
                  onClick={() => setShowKbisModal(false)}
                  className="bg-gray-600 hover:bg-gray-700 text-white px-6 py-3 rounded-xl transition-all"
                >
                  Fermer
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Create Retailer Modal */}
      {showCreateRetailerModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-800/95 backdrop-blur-xl rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto border border-slate-600/50">
            <div className="flex items-center justify-between p-6 border-b border-slate-600/50">
              <h3 className="text-2xl font-bold text-white">Créer un nouveau revendeur</h3>
              <button
                onClick={() => setShowCreateRetailerModal(false)}
                className="text-gray-400 hover:text-white"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
            
            <form onSubmit={(e) => {
              e.preventDefault();
              const formData = new FormData(e.target as HTMLFormElement);
              const retailerData = {
                companyName: formData.get('companyName'),
                email: formData.get('email'),
                password: formData.get('password'),
                firstName: formData.get('firstName'),
                lastName: formData.get('lastName'),
                phone: formData.get('phone'),
                address: formData.get('address'),
                city: formData.get('city'),
                siret: formData.get('siret'),
                plan: formData.get('plan')
              };
              handleCreateRetailer(retailerData);
            }} className="p-6 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm text-gray-300 mb-2">Nom entreprise *</label>
                  <input
                    name="companyName"
                    type="text"
                    required
                    className="w-full bg-black/40 border border-gray-600 rounded-xl px-4 py-3 text-white"
                    placeholder="Mon Magasin"
                  />
                </div>
                <div>
                  <label className="block text-sm text-gray-300 mb-2">SIRET *</label>
                  <input
                    name="siret"
                    type="text"
                    required
                    className="w-full bg-black/40 border border-gray-600 rounded-xl px-4 py-3 text-white"
                    placeholder="12345678901234"
                  />
                </div>
                <div>
                  <label className="block text-sm text-gray-300 mb-2">Prénom *</label>
                  <input
                    name="firstName"
                    type="text"
                    required
                    className="w-full bg-black/40 border border-gray-600 rounded-xl px-4 py-3 text-white"
                    placeholder="Jean"
                  />
                </div>
                <div>
                  <label className="block text-sm text-gray-300 mb-2">Nom *</label>
                  <input
                    name="lastName"
                    type="text"
                    required
                    className="w-full bg-black/40 border border-gray-600 rounded-xl px-4 py-3 text-white"
                    placeholder="Dupont"
                  />
                </div>
                <div>
                  <label className="block text-sm text-gray-300 mb-2">Email *</label>
                  <input
                    name="email"
                    type="email"
                    required
                    className="w-full bg-black/40 border border-gray-600 rounded-xl px-4 py-3 text-white"
                    placeholder="contact@monmagasin.fr"
                  />
                </div>
                <div>
                  <label className="block text-sm text-gray-300 mb-2">Mot de passe *</label>
                  <input
                    name="password"
                    type="text"
                    required
                    className="w-full bg-black/40 border border-gray-600 rounded-xl px-4 py-3 text-white"
                    placeholder="motdepasse123"
                  />
                </div>
                <div>
                  <label className="block text-sm text-gray-300 mb-2">Téléphone *</label>
                  <input
                    name="phone"
                    type="tel"
                    required
                    className="w-full bg-black/40 border border-gray-600 rounded-xl px-4 py-3 text-white"
                    placeholder="+33 1 23 45 67 89"
                  />
                </div>
                <div>
                  <label className="block text-sm text-gray-300 mb-2">Plan *</label>
                  <select
                    name="plan"
                    required
                    className="w-full bg-black/40 border border-gray-600 rounded-xl px-4 py-3 text-white"
                  >
                    <option value="starter">Starter</option>
                    <option value="professional">Professional</option>
                    <option value="enterprise">Enterprise</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm text-gray-300 mb-2">Adresse *</label>
                  <input
                    name="address"
                    type="text"
                    required
                    className="w-full bg-black/40 border border-gray-600 rounded-xl px-4 py-3 text-white"
                    placeholder="123 Rue de la Paix"
                  />
                </div>
                <div>
                  <label className="block text-sm text-gray-300 mb-2">Ville *</label>
                  <input
                    name="city"
                    type="text"
                    required
                    className="w-full bg-black/40 border border-gray-600 rounded-xl px-4 py-3 text-white"
                    placeholder="Paris"
                  />
                </div>
              </div>
              
              <div className="flex justify-between">
                <button
                  type="button"
                  onClick={() => setShowCreateRetailerModal(false)}
                  className="bg-gray-600 hover:bg-gray-700 text-white px-6 py-3 rounded-xl transition-all"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-400 hover:to-emerald-500 text-white px-6 py-3 rounded-xl font-semibold transition-all"
                >
                  Créer le revendeur
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Retailer Modal */}
      {showRetailerModal && selectedRetailer && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-800/95 backdrop-blur-xl rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto border border-slate-600/50">
            <div className="flex items-center justify-between p-6 border-b border-slate-600/50">
              <h3 className="text-2xl font-bold text-white">Modifier le revendeur</h3>
              <button
                onClick={() => setShowRetailerModal(false)}
                className="text-gray-400 hover:text-white"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
            
            <form onSubmit={(e) => {
              e.preventDefault();
              const formData = new FormData(e.target as HTMLFormElement);
              const updatedData = {
                companyName: formData.get('companyName'),
                email: formData.get('email'),
                password: formData.get('password'),
                contactName: formData.get('contactName'),
                phone: formData.get('phone'),
                address: formData.get('address'),
                city: formData.get('city'),
                siret: formData.get('siret'),
                plan: formData.get('plan'),
                status: formData.get('status')
              };
              handleUpdateRetailer(updatedData);
            }} className="p-6 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm text-gray-300 mb-2">Nom entreprise *</label>
                  <input
                    name="companyName"
                    type="text"
                    defaultValue={selectedRetailer.companyName}
                    required
                    className="w-full bg-black/40 border border-gray-600 rounded-xl px-4 py-3 text-white"
                  />
                </div>
                <div>
                  <label className="block text-sm text-gray-300 mb-2">Contact *</label>
                  <input
                    name="contactName"
                    type="text"
                    defaultValue={selectedRetailer.contactName}
                    required
                    className="w-full bg-black/40 border border-gray-600 rounded-xl px-4 py-3 text-white"
                  />
                </div>
                <div>
                  <label className="block text-sm text-gray-300 mb-2">Email *</label>
                  <input
                    name="email"
                    type="email"
                    defaultValue={selectedRetailer.email}
                    required
                    className="w-full bg-black/40 border border-gray-600 rounded-xl px-4 py-3 text-white"
                  />
                </div>
                <div>
                  <label className="block text-sm text-gray-300 mb-2">Mot de passe *</label>
                  <input
                    name="password"
                    type="text"
                    defaultValue={selectedRetailer.password}
                    required
                    className="w-full bg-black/40 border border-gray-600 rounded-xl px-4 py-3 text-white"
                  />
                </div>
                <div>
                  <label className="block text-sm text-gray-300 mb-2">Téléphone *</label>
                  <input
                    name="phone"
                    type="tel"
                    defaultValue={selectedRetailer.phone}
                    required
                    className="w-full bg-black/40 border border-gray-600 rounded-xl px-4 py-3 text-white"
                  />
                </div>
                <div>
                  <label className="block text-sm text-gray-300 mb-2">Plan *</label>
                  <select
                    name="plan"
                    defaultValue={selectedRetailer.plan}
                    required
                    className="w-full bg-black/40 border border-gray-600 rounded-xl px-4 py-3 text-white"
                  >
                    <option value="starter">Starter</option>
                    <option value="professional">Professional</option>
                    <option value="enterprise">Enterprise</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm text-gray-300 mb-2">Statut *</label>
                  <select
                    name="status"
                    defaultValue={selectedRetailer.status}
                    required
                    className="w-full bg-black/40 border border-gray-600 rounded-xl px-4 py-3 text-white"
                  >
                    <option value="active">Actif</option>
                    <option value="inactive">Inactif</option>
                    <option value="suspended">Suspendu</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm text-gray-300 mb-2">SIRET *</label>
                  <input
                    name="siret"
                    type="text"
                    defaultValue={selectedRetailer.siret}
                    required
                    className="w-full bg-black/40 border border-gray-600 rounded-xl px-4 py-3 text-white"
                  />
                </div>
                <div>
                  <label className="block text-sm text-gray-300 mb-2">Adresse *</label>
                  <input
                    name="address"
                    type="text"
                    defaultValue={selectedRetailer.address}
                    required
                    className="w-full bg-black/40 border border-gray-600 rounded-xl px-4 py-3 text-white"
                  />
                </div>
                <div>
                  <label className="block text-sm text-gray-300 mb-2">Ville *</label>
                  <input
                    name="city"
                    type="text"
                    defaultValue={selectedRetailer.city}
                    required
                    className="w-full bg-black/40 border border-gray-600 rounded-xl px-4 py-3 text-white"
                  />
                </div>
              </div>
              
              <div className="flex justify-between">
                <button
                  type="button"
                  onClick={() => setShowRetailerModal(false)}
                  className="bg-gray-600 hover:bg-gray-700 text-white px-6 py-3 rounded-xl transition-all"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white px-6 py-3 rounded-xl font-semibold transition-all"
                >
                  Sauvegarder
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};