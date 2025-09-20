import React, { useState, useEffect } from 'react';
import { 
  Users, Building, Mail, Phone, MapPin, FileText, 
  CheckCircle, X, Eye, Calendar, CreditCard, Globe,
  BarChart3, TrendingUp, DollarSign, Package, MessageSquare,
  Settings, LogOut, Search, Filter, Download, Upload,
  AlertCircle, Clock, Star, Award, Zap, Bot, User
} from 'lucide-react';
import { Logo } from '../components/Logo';

interface Application {
  id: string;
  companyName: string;
  email: string;
  firstName: string;
  lastName: string;
  phone: string;
  address: string;
  city: string;
  postalCode: string;
  country: string;
  siret: string;
  position: string;
  selectedPlan: string;
  subdomain: string;
  kbisFile?: File;
  submittedDate: string;
  submittedTime: string;
  status: string;
  password?: string;
  acceptTerms?: boolean;
}

interface SuperAdminProps {
  onLogout: () => void;
  pendingApplications: Application[];
  onValidateApplication: (applicationId: string, approved: boolean, rejectionReason?: string) => void;
}

export const SuperAdmin: React.FC<SuperAdminProps> = ({ 
  onLogout, 
  pendingApplications = [], 
  onValidateApplication 
}) => {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [selectedApplication, setSelectedApplication] = useState<Application | null>(null);
  const [showApplicationDetail, setShowApplicationDetail] = useState(false);
  const [showKbisViewer, setShowKbisViewer] = useState(false);
  const [rejectionReason, setRejectionReason] = useState('');
  const [showRejectionModal, setShowRejectionModal] = useState(false);
  const [applicationToReject, setApplicationToReject] = useState<string | null>(null);

  // Mock data for dashboard
  const [dashboardStats, setDashboardStats] = useState({
    totalRetailers: 156,
    activeRetailers: 142,
    pendingApplications: pendingApplications.length,
    totalRevenue: 45600,
    monthlyGrowth: 23,
    conversationsToday: 1247,
    newSignupsToday: 8,
    totalConversations: 89234,
    avgConversionRate: 42,
    topPerformingRetailer: 'Decora Home',
    systemUptime: 99.9
  });

  const [recentActivity, setRecentActivity] = useState([
    {
      id: '1',
      type: 'new_application',
      message: 'Nouvelle demande: Mobilier Design Paris',
      timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
      status: 'pending',
      details: 'Plan Professional - SIRET validé'
    },
    {
      id: '2',
      type: 'retailer_approved',
      message: 'Revendeur approuvé: Déco Contemporain',
      timestamp: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(),
      status: 'success',
      details: 'Sous-domaine créé: decocontemporain2024.omnia.sale'
    },
    {
      id: '3',
      type: 'payment_received',
      message: 'Paiement reçu: Meubles Lyon (79€)',
      timestamp: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString(),
      status: 'success',
      details: 'Plan Professional - Paiement automatique'
    },
    {
      id: '4',
      type: 'ai_training',
      message: 'Entraînement IA terminé: 247 produits analysés',
      timestamp: new Date(Date.now() - 8 * 60 * 60 * 1000).toISOString(),
      status: 'success',
      details: 'Modèle v2.1 déployé avec succès'
    },
    {
      id: '5',
      type: 'system_update',
      message: 'Mise à jour système: OmnIA v2.5.0',
      timestamp: new Date(Date.now() - 12 * 60 * 60 * 1000).toISOString(),
      status: 'success',
      details: 'Nouvelles fonctionnalités vocales déployées'
    }
  ]);

  // Mettre à jour les stats avec le nombre réel de demandes
  useEffect(() => {
    setDashboardStats(prev => ({
      ...prev,
      pendingApplications: pendingApplications.length
    }));
  }, [pendingApplications]);

  // Filtrer les applications avec protection contre undefined
  const filteredApplications = pendingApplications.filter(app => {
    if (!app) return false;
    
    const matchesSearch = !searchTerm || 
      (typeof app.companyName === 'string' && app.companyName.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (typeof app.email === 'string' && app.email.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (typeof app.firstName === 'string' && app.firstName.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (typeof app.lastName === 'string' && app.lastName.toLowerCase().includes(searchTerm.toLowerCase()));
    
    const matchesStatus = filterStatus === 'all' || 
      (typeof app.status === 'string' && app.status === filterStatus) ||
      (!app.status && filterStatus === 'pending');
    
    return matchesSearch && matchesStatus;
  });

  const handleApproveApplication = (applicationId: string) => {
    const application = pendingApplications.find(app => app.id === applicationId);
    if (!application) return;

    if (confirm(`Approuver la demande de ${application.companyName || 'cette entreprise'} ?`)) {
      onValidateApplication(applicationId, true);
      
      // Ajouter à l'activité récente
      const newActivity = {
        id: Date.now().toString(),
        type: 'retailer_approved',
        message: `Revendeur approuvé: ${application.companyName || 'Entreprise'}`,
        timestamp: new Date().toISOString(),
        status: 'success',
        details: `Sous-domaine créé: ${application.subdomain || 'domaine'}.omnia.sale`
      };
      setRecentActivity(prev => [newActivity, ...prev.slice(0, 9)]);
    }
  };

  const handleRejectApplication = (applicationId: string) => {
    setApplicationToReject(applicationId);
    setShowRejectionModal(true);
  };

  const confirmRejection = () => {
    if (applicationToReject) {
      const application = pendingApplications.find(app => app.id === applicationToReject);
      
      onValidateApplication(applicationToReject, false, rejectionReason);
      
      // Ajouter à l'activité récente
      const newActivity = {
        id: Date.now().toString(),
        type: 'application_rejected',
        message: `Demande rejetée: ${application?.companyName || 'Entreprise'}`,
        timestamp: new Date().toISOString(),
        status: 'warning',
        details: rejectionReason || 'Informations complémentaires requises'
      };
      setRecentActivity(prev => [newActivity, ...prev.slice(0, 9)]);
      
      setShowRejectionModal(false);
      setApplicationToReject(null);
      setRejectionReason('');
    }
  };

  const handleViewApplication = (application: Application) => {
    setSelectedApplication(application);
    setShowApplicationDetail(true);
  };

  const handleViewKbis = (application: Application) => {
    setSelectedApplication(application);
    setShowKbisViewer(true);
  };

  const getStatusColor = (status?: string) => {
    if (!status || typeof status !== 'string') {
      return 'bg-yellow-500/20 text-yellow-300 border-yellow-400/50';
    }
    
    switch (status.toLowerCase()) {
      case 'pending':
      case 'pending_validation':
        return 'bg-yellow-500/20 text-yellow-300 border-yellow-400/50';
      case 'approved':
        return 'bg-green-500/20 text-green-300 border-green-400/50';
      case 'rejected':
        return 'bg-red-500/20 text-red-300 border-red-400/50';
      default:
        return 'bg-gray-500/20 text-gray-300 border-gray-400/50';
    }
  };

  const getStatusLabel = (status?: string) => {
    if (!status || typeof status !== 'string') {
      return 'En attente';
    }
    
    switch (status.toLowerCase()) {
      case 'pending':
      case 'pending_validation':
        return 'En attente';
      case 'approved':
        return 'Approuvé';
      case 'rejected':
        return 'Rejeté';
      default:
        return 'Inconnu';
    }
  };

  const getActivityIcon = (type?: string) => {
    if (!type || typeof type !== 'string') {
      return AlertCircle;
    }
    
    switch (type) {
      case 'new_application': return FileText;
      case 'retailer_approved': return CheckCircle;
      case 'application_rejected': return X;
      case 'payment_received': return DollarSign;
      case 'ai_training': return Bot;
      case 'system_update': return Zap;
      default: return AlertCircle;
    }
  };

  const getActivityColor = (status?: string) => {
    if (!status || typeof status !== 'string') {
      return 'bg-gray-500/20 text-gray-400';
    }
    
    switch (status) {
      case 'success': return 'bg-green-500/20 text-green-400';
      case 'warning': return 'bg-yellow-500/20 text-yellow-400';
      case 'error': return 'bg-red-500/20 text-red-400';
      case 'pending': return 'bg-blue-500/20 text-blue-400';
      default: return 'bg-gray-500/20 text-gray-400';
    }
  };

  const renderDashboard = () => (
    <div className="space-y-8">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-blue-600/20 backdrop-blur-xl rounded-2xl p-6 border border-blue-500/30">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-blue-200 text-sm mb-1">Revendeurs Actifs</p>
              <p className="text-3xl font-bold text-white">{dashboardStats.activeRetailers}</p>
              <p className="text-blue-300 text-sm">sur {dashboardStats.totalRetailers} total</p>
            </div>
            <Users className="w-10 h-10 text-blue-400" />
          </div>
        </div>
        
        <div className="bg-green-600/20 backdrop-blur-xl rounded-2xl p-6 border border-green-500/30">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-green-200 text-sm mb-1">Revenus Mensuels</p>
              <p className="text-3xl font-bold text-white">{dashboardStats.totalRevenue.toLocaleString()}€</p>
              <p className="text-green-300 text-sm">+{dashboardStats.monthlyGrowth}% ce mois</p>
            </div>
            <DollarSign className="w-10 h-10 text-green-400" />
          </div>
        </div>
        
        <div className="bg-purple-600/20 backdrop-blur-xl rounded-2xl p-6 border border-purple-500/30">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-purple-200 text-sm mb-1">Conversations Aujourd'hui</p>
              <p className="text-3xl font-bold text-white">{dashboardStats.conversationsToday.toLocaleString()}</p>
              <p className="text-purple-300 text-sm">Toutes plateformes</p>
            </div>
            <MessageSquare className="w-10 h-10 text-purple-400" />
          </div>
        </div>
        
        <div className="bg-orange-600/20 backdrop-blur-xl rounded-2xl p-6 border border-orange-500/30">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-orange-200 text-sm mb-1">Demandes en Attente</p>
              <p className="text-3xl font-bold text-white">{dashboardStats.pendingApplications}</p>
              <p className="text-orange-300 text-sm">À valider</p>
            </div>
            <Clock className="w-10 h-10 text-orange-400" />
          </div>
        </div>
      </div>

      {/* Performance Overview */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-white/10 backdrop-blur-xl rounded-2xl p-8 border border-white/20">
          <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
            <TrendingUp className="w-6 h-6 text-green-400" />
            Performance Globale
          </h3>
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-gray-300">Taux de conversion moyen</span>
              <span className="text-green-400 font-bold text-xl">{dashboardStats.avgConversionRate}%</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-300">Conversations totales</span>
              <span className="text-cyan-400 font-bold text-xl">{dashboardStats.totalConversations.toLocaleString()}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-300">Uptime système</span>
              <span className="text-green-400 font-bold text-xl">{dashboardStats.systemUptime}%</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-300">Revendeur top</span>
              <span className="text-purple-400 font-bold">{dashboardStats.topPerformingRetailer}</span>
            </div>
          </div>
        </div>

        {/* Recent Activity */}
        <div className="bg-white/10 backdrop-blur-xl rounded-2xl p-8 border border-white/20">
          <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
            <Clock className="w-6 h-6 text-cyan-400" />
            Activité Récente
          </h3>
          <div className="space-y-4 max-h-80 overflow-y-auto">
            {recentActivity.map((activity) => {
              const Icon = getActivityIcon(activity.type);
              return (
                <div key={activity.id} className="flex items-start gap-4 p-4 bg-black/20 rounded-xl hover:bg-black/30 transition-all">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center ${getActivityColor(activity.status)}`}>
                    <Icon className="w-5 h-5" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-white font-medium">{activity.message}</p>
                    <p className="text-gray-400 text-sm">{activity.details}</p>
                    <p className="text-gray-500 text-xs">
                      {new Date(activity.timestamp).toLocaleString('fr-FR')}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-gradient-to-r from-cyan-500/20 to-blue-600/20 backdrop-blur-xl rounded-2xl p-8 border border-cyan-400/30">
        <h3 className="text-xl font-bold text-white mb-6">Actions Rapides</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <button
            onClick={() => setActiveTab('applications')}
            className="bg-yellow-600/20 hover:bg-yellow-600/30 border border-yellow-500/50 text-yellow-300 p-4 rounded-xl transition-all hover:scale-105 flex items-center gap-3"
          >
            <FileText className="w-6 h-6" />
            <div className="text-left">
              <div className="font-semibold">Valider demandes</div>
              <div className="text-sm opacity-80">{pendingApplications.length} en attente</div>
            </div>
          </button>
          
          <button
            onClick={() => setActiveTab('retailers')}
            className="bg-green-600/20 hover:bg-green-600/30 border border-green-500/50 text-green-300 p-4 rounded-xl transition-all hover:scale-105 flex items-center gap-3"
          >
            <Users className="w-6 h-6" />
            <div className="text-left">
              <div className="font-semibold">Gérer revendeurs</div>
              <div className="text-sm opacity-80">{dashboardStats.activeRetailers} actifs</div>
            </div>
          </button>
          
          <button
            onClick={() => setActiveTab('analytics')}
            className="bg-purple-600/20 hover:bg-purple-600/30 border border-purple-500/50 text-purple-300 p-4 rounded-xl transition-all hover:scale-105 flex items-center gap-3"
          >
            <BarChart3 className="w-6 h-6" />
            <div className="text-left">
              <div className="font-semibold">Voir analytics</div>
              <div className="text-sm opacity-80">Rapports détaillés</div>
            </div>
          </button>
          
          <button
            onClick={() => window.open('/chat', '_blank')}
            className="bg-cyan-600/20 hover:bg-cyan-600/30 border border-cyan-500/50 text-cyan-300 p-4 rounded-xl transition-all hover:scale-105 flex items-center gap-3"
          >
            <Bot className="w-6 h-6" />
            <div className="text-left">
              <div className="font-semibold">Tester OmnIA</div>
              <div className="text-sm opacity-80">Interface robot</div>
            </div>
          </button>
        </div>
      </div>
    </div>
  );

  const renderApplications = () => (
    <div className="space-y-6">
      {/* Header avec filtres */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-white">Demandes de Revendeurs</h2>
          <p className="text-gray-300">{filteredApplications.length} demande(s) à traiter</p>
        </div>
        
        <div className="flex gap-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Rechercher..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-4 py-2 bg-black/40 border border-gray-600 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:border-cyan-400"
            />
          </div>
          
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="bg-black/40 border border-gray-600 rounded-xl px-4 py-2 text-white"
          >
            <option value="all">Tous les statuts</option>
            <option value="pending">En attente</option>
            <option value="pending_validation">Validation</option>
            <option value="approved">Approuvées</option>
            <option value="rejected">Rejetées</option>
          </select>
          
          <button
            onClick={() => {
              const csvContent = generateCSVExport(pendingApplications);
              downloadCSV(csvContent, 'demandes_revendeurs.csv');
            }}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-xl flex items-center gap-2"
          >
            <Download className="w-4 h-4" />
            Export CSV
          </button>
        </div>
      </div>

      {/* Liste des applications */}
      {filteredApplications.length === 0 ? (
        <div className="text-center py-20">
          <FileText className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-xl font-bold text-white mb-2">Aucune demande</h3>
          <p className="text-gray-400">
            {searchTerm || filterStatus !== 'all' 
              ? 'Aucune demande ne correspond à vos critères.'
              : 'Aucune demande de revendeur en attente.'}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
          {filteredApplications.map((application) => (
            <div key={application.id} className="bg-white/10 backdrop-blur-xl rounded-2xl p-6 border border-white/20 hover:border-cyan-500/50 transition-all group">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-xl flex items-center justify-center shadow-lg">
                    <Building className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h3 className="font-bold text-white">{application.companyName || 'Nom non renseigné'}</h3>
                    <p className="text-cyan-400 text-sm">{application.email || 'Email non renseigné'}</p>
                  </div>
                </div>
                
                <span className={`px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(application.status)}`}>
                  {getStatusLabel(application.status)}
                </span>
              </div>

              <div className="space-y-2 mb-6 text-sm">
                <div className="flex items-center gap-2 text-gray-300">
                  <User className="w-4 h-4" />
                  <span>{(application.firstName || '') + ' ' + (application.lastName || '')}</span>
                </div>
                <div className="flex items-center gap-2 text-gray-300">
                  <Phone className="w-4 h-4" />
                  <span>{application.phone || 'Non renseigné'}</span>
                </div>
                <div className="flex items-center gap-2 text-gray-300">
                  <MapPin className="w-4 h-4" />
                  <span>{(application.city || 'Ville non renseignée') + (application.country ? `, ${application.country}` : '')}</span>
                </div>
                <div className="flex items-center gap-2 text-gray-300">
                  <Globe className="w-4 h-4" />
                  <span className="text-cyan-400 font-mono text-xs">
                    {(typeof application.subdomain === 'string' && application.subdomain) 
                      ? `${application.subdomain}.omnia.sale` 
                      : `${(application.companyName || 'boutique').toLowerCase().replace(/[^a-z0-9]/g, '').substring(0, 15)}.omnia.sale`}
                  </span>
                </div>
                <div className="flex items-center gap-2 text-gray-300">
                  <CreditCard className="w-4 h-4" />
                  <span className="capitalize">{application.selectedPlan || 'Plan non sélectionné'}</span>
                </div>
                <div className="flex items-center gap-2 text-gray-300">
                  <Calendar className="w-4 h-4" />
                  <span>{(application.submittedDate || 'Date inconnue') + ' à ' + (application.submittedTime || 'Heure inconnue')}</span>
                </div>
                
                {/* Document Kbis */}
                {application.kbisFile && (
                  <div className="flex items-center gap-2 text-gray-300">
                    <FileText className="w-4 h-4" />
                    <span className="text-green-400">Kbis fourni ({(application.kbisFile.size / 1024 / 1024).toFixed(2)} MB)</span>
                  </div>
                )}
              </div>

              {/* Actions */}
              <div className="space-y-3">
                <button
                  onClick={() => handleViewApplication(application)}
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 px-4 rounded-xl flex items-center justify-center gap-2 transition-all hover:scale-105"
                >
                  <Eye className="w-4 h-4" />
                  Voir détails complets
                </button>
                
                {/* Boutons de validation - CONDITION CORRIGÉE */}
                {(!application.status || 
                  application.status === 'pending' || 
                  application.status === 'pending_validation') && (
                  <div className="grid grid-cols-2 gap-3">
                    <button
                      onClick={() => handleApproveApplication(application.id)}
                      className="bg-green-600 hover:bg-green-700 text-white py-3 px-4 rounded-xl flex items-center justify-center gap-2 transition-all hover:scale-105 shadow-lg hover:shadow-green-500/50"
                    >
                      <CheckCircle className="w-4 h-4" />
                      Approuver
                    </button>
                    <button
                      onClick={() => handleRejectApplication(application.id)}
                      className="bg-red-600 hover:bg-red-700 text-white py-3 px-4 rounded-xl flex items-center justify-center gap-2 transition-all hover:scale-105 shadow-lg hover:shadow-red-500/50"
                    >
                      <X className="w-4 h-4" />
                      Rejeter
                    </button>
                  </div>
                )}
                
                {/* Bouton Kbis si disponible */}
                {application.kbisFile && (
                  <button
                    onClick={() => handleViewKbis(application)}
                    className="w-full bg-purple-600 hover:bg-purple-700 text-white py-2 px-4 rounded-xl flex items-center justify-center gap-2 transition-all text-sm"
                  >
                    <FileText className="w-4 h-4" />
                    Visualiser Kbis
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );

  const renderRetailers = () => {
    // Mock data pour les revendeurs actifs
    const mockRetailers = [
      {
        id: 'retailer-1',
        companyName: 'Decora Home',
        email: 'demo@decorahome.fr',
        plan: 'professional',
        status: 'active',
        revenue: 12500,
        conversations: 1234,
        products: 247,
        joinDate: '2024-01-15',
        lastActive: '2025-01-15T10:30:00Z',
        subdomain: 'decorahome'
      },
      {
        id: 'retailer-2',
        companyName: 'Mobilier Design Paris',
        email: 'contact@mobilierdesign.fr',
        plan: 'enterprise',
        status: 'active',
        revenue: 25600,
        conversations: 2156,
        products: 456,
        joinDate: '2024-02-20',
        lastActive: '2025-01-15T09:15:00Z',
        subdomain: 'mobilierdesign'
      },
      {
        id: 'retailer-3',
        companyName: 'Déco Contemporain',
        email: 'info@decocontemporain.com',
        plan: 'professional',
        status: 'active',
        revenue: 8900,
        conversations: 892,
        products: 189,
        joinDate: '2024-03-10',
        lastActive: '2025-01-14T16:45:00Z',
        subdomain: 'decocontemporain'
      },
      {
        id: 'retailer-4',
        companyName: 'Meubles Lyon',
        email: 'contact@meubleslyon.fr',
        plan: 'starter',
        status: 'active',
        revenue: 3400,
        conversations: 456,
        products: 123,
        joinDate: '2024-04-05',
        lastActive: '2025-01-13T14:20:00Z',
        subdomain: 'meubleslyon'
      }
    ];

    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-white">Revendeurs Actifs</h2>
            <p className="text-gray-300">{mockRetailers.length} revendeur(s) actif(s)</p>
          </div>
          <div className="flex gap-3">
            <button
              onClick={() => {
                const csvContent = generateRetailersCSVExport(mockRetailers);
                downloadCSV(csvContent, 'revendeurs_actifs.csv');
              }}
              className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-xl flex items-center gap-2"
            >
              <Download className="w-4 h-4" />
              Exporter CSV
            </button>
          </div>
        </div>

        <div className="bg-white/10 backdrop-blur-xl rounded-2xl border border-white/20 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-black/20">
                <tr>
                  <th className="text-left p-4 text-cyan-300 font-semibold">Revendeur</th>
                  <th className="text-left p-4 text-cyan-300 font-semibold">Plan</th>
                  <th className="text-left p-4 text-cyan-300 font-semibold">Revenus</th>
                  <th className="text-left p-4 text-cyan-300 font-semibold">Conversations</th>
                  <th className="text-left p-4 text-cyan-300 font-semibold">Produits</th>
                  <th className="text-left p-4 text-cyan-300 font-semibold">Dernière activité</th>
                  <th className="text-left p-4 text-cyan-300 font-semibold">Actions</th>
                </tr>
              </thead>
              <tbody>
                {mockRetailers.map((retailer) => (
                  <tr key={retailer.id} className="border-b border-white/10 hover:bg-white/5">
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-xl flex items-center justify-center">
                          <Building className="w-5 h-5 text-white" />
                        </div>
                        <div>
                          <div className="font-semibold text-white">{retailer.companyName}</div>
                          <div className="text-gray-400 text-sm">{retailer.email}</div>
                          <div className="text-cyan-400 text-xs font-mono">{retailer.subdomain}.omnia.sale</div>
                        </div>
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
                      <span className="text-green-400 font-bold">{retailer.revenue.toLocaleString()}€</span>
                    </td>
                    <td className="p-4">
                      <span className="text-cyan-400 font-semibold">{retailer.conversations.toLocaleString()}</span>
                    </td>
                    <td className="p-4">
                      <span className="text-purple-400 font-semibold">{retailer.products}</span>
                    </td>
                    <td className="p-4">
                      <span className="text-gray-300 text-sm">
                        {new Date(retailer.lastActive).toLocaleDateString('fr-FR')}
                      </span>
                    </td>
                    <td className="p-4">
                      <div className="flex gap-2">
                        <button
                          onClick={() => window.open(`https://${retailer.subdomain}.omnia.sale`, '_blank')}
                          className="text-blue-400 hover:text-blue-300 p-1"
                          title="Voir le site"
                        >
                          <Globe className="w-4 h-4" />
                        </button>
                        <button
                          className="text-purple-400 hover:text-purple-300 p-1"
                          title="Voir analytics"
                        >
                          <BarChart3 className="w-4 h-4" />
                        </button>
                        <button
                          className="text-gray-400 hover:text-gray-300 p-1"
                          title="Paramètres"
                        >
                          <Settings className="w-4 h-4" />
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
  };

  const renderAnalytics = () => (
    <div className="space-y-8">
      <h2 className="text-2xl font-bold text-white">Analytics Globales</h2>
      
      {/* Métriques principales */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-blue-600/20 backdrop-blur-xl rounded-2xl p-6 border border-blue-500/30">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-blue-200 text-sm mb-1">Conversations Totales</p>
              <p className="text-3xl font-bold text-white">{dashboardStats.totalConversations.toLocaleString()}</p>
              <p className="text-blue-300 text-sm">+12% cette semaine</p>
            </div>
            <MessageSquare className="w-10 h-10 text-blue-400" />
          </div>
        </div>
        
        <div className="bg-green-600/20 backdrop-blur-xl rounded-2xl p-6 border border-green-500/30">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-green-200 text-sm mb-1">Taux Conversion</p>
              <p className="text-3xl font-bold text-white">{dashboardStats.avgConversionRate}%</p>
              <p className="text-green-300 text-sm">+5% vs mois dernier</p>
            </div>
            <TrendingUp className="w-10 h-10 text-green-400" />
          </div>
        </div>
        
        <div className="bg-purple-600/20 backdrop-blur-xl rounded-2xl p-6 border border-purple-500/30">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-purple-200 text-sm mb-1">Revenus ARR</p>
              <p className="text-3xl font-bold text-white">{(dashboardStats.totalRevenue * 12).toLocaleString()}€</p>
              <p className="text-purple-300 text-sm">Annuel récurrent</p>
            </div>
            <DollarSign className="w-10 h-10 text-purple-400" />
          </div>
        </div>
        
        <div className="bg-orange-600/20 backdrop-blur-xl rounded-2xl p-6 border border-orange-500/30">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-orange-200 text-sm mb-1">Uptime Système</p>
              <p className="text-3xl font-bold text-white">{dashboardStats.systemUptime}%</p>
              <p className="text-orange-300 text-sm">30 derniers jours</p>
            </div>
            <Zap className="w-10 h-10 text-orange-400" />
          </div>
        </div>
      </div>

      {/* Graphiques et détails */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-white/10 backdrop-blur-xl rounded-2xl p-8 border border-white/20">
          <h3 className="text-xl font-bold text-white mb-6">Revenus par Plan</h3>
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-gray-300">Starter (29€/mois)</span>
              <div className="text-right">
                <span className="text-green-400 font-bold">12,180€</span>
                <div className="text-gray-400 text-sm">42 revendeurs</div>
              </div>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-300">Professional (79€/mois)</span>
              <div className="text-right">
                <span className="text-green-400 font-bold">28,420€</span>
                <div className="text-gray-400 text-sm">89 revendeurs</div>
              </div>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-300">Enterprise (199€/mois)</span>
              <div className="text-right">
                <span className="text-green-400 font-bold">5,970€</span>
                <div className="text-gray-400 text-sm">25 revendeurs</div>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white/10 backdrop-blur-xl rounded-2xl p-8 border border-white/20">
          <h3 className="text-xl font-bold text-white mb-6">Performance par Région</h3>
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-gray-300">🇫🇷 France</span>
              <div className="text-right">
                <span className="text-cyan-400 font-bold">89 revendeurs</span>
                <div className="text-gray-400 text-sm">67% du total</div>
              </div>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-300">🇧🇪 Belgique</span>
              <div className="text-right">
                <span className="text-cyan-400 font-bold">23 revendeurs</span>
                <div className="text-gray-400 text-sm">17% du total</div>
              </div>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-300">🇨🇭 Suisse</span>
              <div className="text-right">
                <span className="text-cyan-400 font-bold">12 revendeurs</span>
                <div className="text-gray-400 text-sm">9% du total</div>
              </div>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-300">🇨🇦 Canada</span>
              <div className="text-right">
                <span className="text-cyan-400 font-bold">8 revendeurs</span>
                <div className="text-gray-400 text-sm">6% du total</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Top Performers */}
      <div className="bg-white/10 backdrop-blur-xl rounded-2xl p-8 border border-white/20">
        <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
          <Award className="w-6 h-6 text-yellow-400" />
          Top Performers du Mois
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-yellow-500/20 border border-yellow-400/50 rounded-xl p-6 text-center">
            <div className="w-16 h-16 bg-gradient-to-br from-yellow-500 to-orange-600 rounded-full flex items-center justify-center mx-auto mb-4">
              <Award className="w-8 h-8 text-white" />
            </div>
            <h4 className="font-bold text-white mb-2">🥇 Decora Home</h4>
            <p className="text-yellow-300 text-sm mb-2">2,156 conversations</p>
            <p className="text-yellow-400 font-bold">47% conversion</p>
          </div>
          
          <div className="bg-gray-500/20 border border-gray-400/50 rounded-xl p-6 text-center">
            <div className="w-16 h-16 bg-gradient-to-br from-gray-500 to-gray-600 rounded-full flex items-center justify-center mx-auto mb-4">
              <Award className="w-8 h-8 text-white" />
            </div>
            <h4 className="font-bold text-white mb-2">🥈 Mobilier Design</h4>
            <p className="text-gray-300 text-sm mb-2">1,892 conversations</p>
            <p className="text-gray-400 font-bold">44% conversion</p>
          </div>
          
          <div className="bg-orange-500/20 border border-orange-400/50 rounded-xl p-6 text-center">
            <div className="w-16 h-16 bg-gradient-to-br from-orange-500 to-red-600 rounded-full flex items-center justify-center mx-auto mb-4">
              <Award className="w-8 h-8 text-white" />
            </div>
            <h4 className="font-bold text-white mb-2">🥉 Déco Contemporain</h4>
            <p className="text-orange-300 text-sm mb-2">1,234 conversations</p>
            <p className="text-orange-400 font-bold">41% conversion</p>
          </div>
        </div>
      </div>
    </div>
  );

  // Fonctions utilitaires
  const generateCSVExport = (applications: Application[]) => {
    const headers = [
      'ID', 'Entreprise', 'Email', 'Contact', 'Téléphone', 'Ville', 'Pays',
      'SIRET', 'Plan', 'Statut', 'Date soumission', 'Sous-domaine'
    ];
    
    const rows = applications.map(app => [
      app.id || '',
      app.companyName || '',
      app.email || '',
      `${app.firstName || ''} ${app.lastName || ''}`.trim(),
      app.phone || '',
      app.city || '',
      app.country || '',
      app.siret || '',
      app.selectedPlan || '',
      app.status || 'pending',
      app.submittedDate || '',
      (typeof app.subdomain === 'string' && app.subdomain) ? `${app.subdomain}.omnia.sale` : ''
    ]);
    
    return [headers, ...rows].map(row => row.join(',')).join('\n');
  };

  const generateRetailersCSVExport = (retailers: any[]) => {
    const headers = [
      'ID', 'Entreprise', 'Email', 'Plan', 'Statut', 'Revenus', 
      'Conversations', 'Produits', 'Date inscription', 'Dernière activité', 'Sous-domaine'
    ];
    
    const rows = retailers.map(retailer => [
      retailer.id || '',
      retailer.companyName || '',
      retailer.email || '',
      retailer.plan || '',
      retailer.status || '',
      retailer.revenue || '0',
      retailer.conversations || '0',
      retailer.products || '0',
      retailer.joinDate || '',
      retailer.lastActive || '',
      retailer.subdomain ? `${retailer.subdomain}.omnia.sale` : ''
    ]);
    
    return [headers, ...rows].map(row => row.join(',')).join('\n');
  };

  const downloadCSV = (content: string, filename: string) => {
    const blob = new Blob([content], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', filename);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-purple-900">
      {/* Background Effects */}
      <div className="absolute inset-0 opacity-20">
        <div className="absolute top-20 left-20 w-72 h-72 bg-cyan-500/30 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-20 right-20 w-96 h-96 bg-purple-500/20 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '2s' }}></div>
      </div>

      {/* Header */}
      <header className="relative z-10 bg-black/20 backdrop-blur-xl border-b border-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center gap-4">
              <Logo size="md" />
              <div>
                <h1 className="text-xl font-bold text-white">Super Admin</h1>
                <p className="text-cyan-300">Gestion Plateforme OmnIA</p>
              </div>
            </div>
            
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-green-400 rounded-full animate-pulse"></div>
                <span className="text-green-300 text-sm">Système opérationnel</span>
              </div>
              <button
                onClick={onLogout}
                className="flex items-center gap-2 bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-xl transition-all"
              >
                <LogOut className="w-4 h-4" />
                Déconnexion
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Navigation Tabs */}
        <div className="flex justify-center mb-8">
          <div className="bg-black/40 backdrop-blur-xl rounded-2xl p-2 border border-white/20">
            <div className="flex space-x-2">
              {[
                { id: 'dashboard', label: 'Dashboard', icon: BarChart3 },
                { id: 'applications', label: 'Demandes', icon: FileText },
                { id: 'retailers', label: 'Revendeurs', icon: Users },
                { id: 'analytics', label: 'Analytics', icon: TrendingUp }
              ].map((tab) => {
                const Icon = tab.icon;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`flex items-center gap-2 px-6 py-3 rounded-xl transition-all ${
                      activeTab === tab.id
                        ? 'bg-cyan-500 text-white'
                        : 'text-gray-400 hover:text-white hover:bg-white/10'
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    <span className="font-medium">{tab.label}</span>
                    {tab.id === 'applications' && pendingApplications.length > 0 && (
                      <span className="bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                        {pendingApplications.length}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Content */}
        {activeTab === 'dashboard' && renderDashboard()}
        {activeTab === 'applications' && renderApplications()}
        {activeTab === 'retailers' && renderRetailers()}
        {activeTab === 'analytics' && renderAnalytics()}
      </div>

      {/* Modal détail application */}
      {showApplicationDetail && selectedApplication && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-800/95 backdrop-blur-xl rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto border border-slate-600/50">
            <div className="flex items-center justify-between p-6 border-b border-slate-600/50">
              <h2 className="text-2xl font-bold text-white">Détails de la demande</h2>
              <button
                onClick={() => setShowApplicationDetail(false)}
                className="text-gray-400 hover:text-white transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="p-6 space-y-8">
              {/* Informations entreprise */}
              <div className="bg-black/20 rounded-xl p-6">
                <h3 className="font-semibold text-white mb-4 flex items-center gap-2">
                  <Building className="w-5 h-5 text-cyan-400" />
                  Informations Entreprise
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="text-gray-400 text-sm">Nom de l'entreprise</label>
                    <p className="text-white font-semibold">{selectedApplication.companyName || 'Non renseigné'}</p>
                  </div>
                  <div>
                    <label className="text-gray-400 text-sm">SIRET</label>
                    <p className="text-white font-mono">{selectedApplication.siret || 'Non renseigné'}</p>
                  </div>
                  <div className="md:col-span-2">
                    <label className="text-gray-400 text-sm">Adresse complète</label>
                    <p className="text-white">
                      {selectedApplication.address || 'Non renseignée'}<br />
                      {selectedApplication.postalCode || ''} {selectedApplication.city || ''}<br />
                      {selectedApplication.country || ''}
                    </p>
                  </div>
                </div>
              </div>

              {/* Contact responsable */}
              <div className="bg-black/20 rounded-xl p-6">
                <h3 className="font-semibold text-white mb-4 flex items-center gap-2">
                  <User className="w-5 h-5 text-green-400" />
                  Contact Responsable
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="text-gray-400 text-sm">Nom complet</label>
                    <p className="text-white font-semibold">
                      {(selectedApplication.firstName || '') + ' ' + (selectedApplication.lastName || '')}
                    </p>
                  </div>
                  <div>
                    <label className="text-gray-400 text-sm">Fonction</label>
                    <p className="text-white">{selectedApplication.position || 'Non renseignée'}</p>
                  </div>
                  <div>
                    <label className="text-gray-400 text-sm">Email professionnel</label>
                    <p className="text-cyan-400">{selectedApplication.email || 'Non renseigné'}</p>
                  </div>
                  <div>
                    <label className="text-gray-400 text-sm">Téléphone</label>
                    <p className="text-white">{selectedApplication.phone || 'Non renseigné'}</p>
                  </div>
                </div>
              </div>

              {/* Configuration compte */}
              <div className="bg-black/20 rounded-xl p-6">
                <h3 className="font-semibold text-white mb-4 flex items-center gap-2">
                  <Globe className="w-5 h-5 text-purple-400" />
                  Configuration du Compte
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="text-gray-400 text-sm">Plan choisi</label>
                    <p className="text-white font-semibold capitalize">{selectedApplication.selectedPlan || 'Non sélectionné'}</p>
                  </div>
                  <div>
                    <label className="text-gray-400 text-sm">Sous-domaine proposé</label>
                    <p className="text-cyan-400 font-mono">
                      {(typeof selectedApplication.subdomain === 'string' && selectedApplication.subdomain)
                        ? `${selectedApplication.subdomain}.omnia.sale`
                        : `${(selectedApplication.companyName || 'boutique').toLowerCase().replace(/[^a-z0-9]/g, '').substring(0, 15)}.omnia.sale`}
                    </p>
                  </div>
                  <div>
                    <label className="text-gray-400 text-sm">Date de soumission</label>
                    <p className="text-white">
                      {selectedApplication.submittedDate || 'Date inconnue'} à {selectedApplication.submittedTime || 'Heure inconnue'}
                    </p>
                  </div>
                  <div>
                    <label className="text-gray-400 text-sm">Statut actuel</label>
                    <span className={`inline-block px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(selectedApplication.status)}`}>
                      {getStatusLabel(selectedApplication.status)}
                    </span>
                  </div>
                </div>
              </div>

              {/* Document Kbis */}
              {selectedApplication.kbisFile && (
                <div className="bg-black/20 rounded-xl p-6">
                  <h3 className="font-semibold text-white mb-4 flex items-center gap-2">
                    <FileText className="w-5 h-5 text-orange-400" />
                    Document Kbis
                  </h3>
                  <div className="flex items-center justify-between p-4 bg-green-500/20 border border-green-400/50 rounded-xl">
                    <div>
                      <p className="text-green-200 font-semibold">{selectedApplication.kbisFile.name}</p>
                      <p className="text-green-300 text-sm">
                        Taille: {(selectedApplication.kbisFile.size / 1024 / 1024).toFixed(2)} MB
                      </p>
                      <p className="text-green-400 text-xs">
                        Type: {selectedApplication.kbisFile.type}
                      </p>
                    </div>
                    <button
                      onClick={() => handleViewKbis(selectedApplication)}
                      className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-xl flex items-center gap-2 transition-all"
                    >
                      <Eye className="w-4 h-4" />
                      Visualiser
                    </button>
                  </div>
                </div>
              )}

              {/* Actions de validation */}
              <div className="flex justify-between pt-6 border-t border-slate-600/50">
                <button
                  onClick={() => setShowApplicationDetail(false)}
                  className="bg-gray-600 hover:bg-gray-700 text-white px-6 py-3 rounded-xl transition-all"
                >
                  Fermer
                </button>
                
                {(!selectedApplication.status || 
                  selectedApplication.status === 'pending' || 
                  selectedApplication.status === 'pending_validation') && (
                  <div className="flex gap-3">
                    <button
                      onClick={() => {
                        handleRejectApplication(selectedApplication.id);
                        setShowApplicationDetail(false);
                      }}
                      className="bg-red-600 hover:bg-red-700 text-white px-6 py-3 rounded-xl flex items-center gap-2 transition-all shadow-lg hover:shadow-red-500/50"
                    >
                      <X className="w-4 h-4" />
                      Rejeter
                    </button>
                    <button
                      onClick={() => {
                        handleApproveApplication(selectedApplication.id);
                        setShowApplicationDetail(false);
                      }}
                      className="bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-xl flex items-center gap-2 transition-all shadow-lg hover:shadow-green-500/50"
                    >
                      <CheckCircle className="w-4 h-4" />
                      Approuver
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal visualisation Kbis */}
      {showKbisViewer && selectedApplication?.kbisFile && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-800/95 backdrop-blur-xl rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto border border-slate-600/50">
            <div className="flex items-center justify-between p-6 border-b border-slate-600/50">
              <h2 className="text-2xl font-bold text-white flex items-center gap-2">
                <FileText className="w-6 h-6 text-orange-400" />
                Document Kbis - {selectedApplication.companyName}
              </h2>
              <button
                onClick={() => setShowKbisViewer(false)}
                className="text-gray-400 hover:text-white transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="p-6">
              <div className="bg-black/20 rounded-xl p-6 mb-6">
                <h3 className="font-semibold text-white mb-4">Informations du fichier</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                  <div>
                    <span className="text-gray-400">Nom du fichier :</span>
                    <p className="text-white font-semibold">{selectedApplication.kbisFile.name}</p>
                  </div>
                  <div>
                    <span className="text-gray-400">Taille :</span>
                    <p className="text-white font-semibold">{(selectedApplication.kbisFile.size / 1024 / 1024).toFixed(2)} MB</p>
                  </div>
                  <div>
                    <span className="text-gray-400">Type :</span>
                    <p className="text-white font-semibold">{selectedApplication.kbisFile.type}</p>
                  </div>
                </div>
              </div>

              {/* Aperçu du document */}
              <div className="bg-white rounded-xl p-6 min-h-96 flex items-center justify-center">
                {selectedApplication.kbisFile.type.startsWith('image/') ? (
                  <img 
                    src={URL.createObjectURL(selectedApplication.kbisFile)}
                    alt="Document Kbis"
                    className="max-w-full max-h-96 object-contain rounded-lg shadow-lg"
                  />
                ) : selectedApplication.kbisFile.type === 'application/pdf' ? (
                  <div className="text-center">
                    <FileText className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                    <h4 className="text-lg font-semibold text-gray-800 mb-2">Document PDF</h4>
                    <p className="text-gray-600 mb-4">{selectedApplication.kbisFile.name}</p>
                    <button
                      onClick={() => {
                        const url = URL.createObjectURL(selectedApplication.kbisFile!);
                        window.open(url, '_blank');
                      }}
                      className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 mx-auto"
                    >
                      <Eye className="w-4 h-4" />
                      Ouvrir le PDF
                    </button>
                  </div>
                ) : (
                  <div className="text-center">
                    <FileText className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                    <h4 className="text-lg font-semibold text-gray-800 mb-2">Document non prévisualisable</h4>
                    <p className="text-gray-600 mb-4">Type: {selectedApplication.kbisFile.type}</p>
                    <button
                      onClick={() => {
                        const url = URL.createObjectURL(selectedApplication.kbisFile!);
                        const a = document.createElement('a');
                        a.href = url;
                        a.download = selectedApplication.kbisFile!.name;
                        a.click();
                      }}
                      className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 mx-auto"
                    >
                      <Download className="w-4 h-4" />
                      Télécharger
                    </button>
                  </div>
                )}
              </div>

              {/* Actions de validation depuis le viewer Kbis */}
              {(!selectedApplication.status || 
                selectedApplication.status === 'pending' || 
                selectedApplication.status === 'pending_validation') && (
                <div className="flex justify-center gap-4 pt-6 border-t border-slate-600/50">
                  <button
                    onClick={() => {
                      handleRejectApplication(selectedApplication.id);
                      setShowKbisViewer(false);
                    }}
                    className="bg-red-600 hover:bg-red-700 text-white px-8 py-3 rounded-xl flex items-center gap-2 transition-all shadow-lg hover:shadow-red-500/50"
                  >
                    <X className="w-5 h-5" />
                    Rejeter la demande
                  </button>
                  <button
                    onClick={() => {
                      handleApproveApplication(selectedApplication.id);
                      setShowKbisViewer(false);
                    }}
                    className="bg-green-600 hover:bg-green-700 text-white px-8 py-3 rounded-xl flex items-center gap-2 transition-all shadow-lg hover:shadow-green-500/50"
                  >
                    <CheckCircle className="w-5 h-5" />
                    Approuver la demande
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Modal de rejet avec raison */}
      {showRejectionModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-800/95 backdrop-blur-xl rounded-2xl max-w-md w-full border border-slate-600/50">
            <div className="flex items-center justify-between p-6 border-b border-slate-600/50">
              <h2 className="text-xl font-bold text-white">Rejeter la demande</h2>
              <button
                onClick={() => {
                  setShowRejectionModal(false);
                  setApplicationToReject(null);
                  setRejectionReason('');
                }}
                className="text-gray-400 hover:text-white transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Raison du rejet (optionnel)
                </label>
                <textarea
                  value={rejectionReason}
                  onChange={(e) => setRejectionReason(e.target.value)}
                  rows={4}
                  className="w-full bg-black/40 border border-gray-600 rounded-xl px-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:border-red-400 focus:ring-2 focus:ring-red-400/30 resize-none"
                  placeholder="Ex: Document Kbis illisible, informations manquantes, SIRET invalide..."
                />
              </div>

              <div className="bg-red-500/20 border border-red-400/50 rounded-xl p-4">
                <h4 className="font-semibold text-red-200 mb-2">⚠️ Conséquences du rejet :</h4>
                <ul className="text-red-300 text-sm space-y-1">
                  <li>• Email automatique envoyé au demandeur</li>
                  <li>• Possibilité de re-soumission avec corrections</li>
                  <li>• Sous-domaine libéré pour réutilisation</li>
                </ul>
              </div>

              <div className="flex justify-between">
                <button
                  onClick={() => {
                    setShowRejectionModal(false);
                    setApplicationToReject(null);
                    setRejectionReason('');
                  }}
                  className="bg-gray-600 hover:bg-gray-700 text-white px-6 py-3 rounded-xl transition-all"
                >
                  Annuler
                </button>
                <button
                  onClick={confirmRejection}
                  className="bg-red-600 hover:bg-red-700 text-white px-6 py-3 rounded-xl flex items-center gap-2 transition-all"
                >
                  <X className="w-4 h-4" />
                  Confirmer le rejet
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};