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
  siret: string;
  position: string;
  selectedPlan: string;
  subdomain: string;
  kbisFile?: File;
  submittedDate: string;
  submittedTime: string;
  status: string;
  password?: string;
}

interface SuperAdminProps {
  onLogout: () => void;
  pendingApplications: Application[];
  onValidateApplication: (applicationId: string, approved: boolean) => void;
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

  // Mock data for dashboard
  const [dashboardStats, setDashboardStats] = useState({
    totalRetailers: 156,
    activeRetailers: 142,
    pendingApplications: pendingApplications.length,
    totalRevenue: 45600,
    monthlyGrowth: 23,
    conversationsToday: 1247,
    newSignupsToday: 8
  });

  const [recentActivity, setRecentActivity] = useState([
    {
      id: '1',
      type: 'new_application',
      message: 'Nouvelle demande: Mobilier Design Paris',
      timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
      status: 'pending'
    },
    {
      id: '2',
      type: 'retailer_approved',
      message: 'Revendeur approuvé: Déco Contemporain',
      timestamp: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(),
      status: 'success'
    },
    {
      id: '3',
      type: 'payment_received',
      message: 'Paiement reçu: Meubles Lyon (79€)',
      timestamp: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString(),
      status: 'success'
    }
  ]);

  // Filtrer les applications
  const filteredApplications = pendingApplications.filter(app => {
    // Protection contre les valeurs undefined avec l'opérateur optionnel
    const matchesSearch = !searchTerm || 
      app.companyName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      app.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      app.firstName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      app.lastName?.toLowerCase().includes(searchTerm.toLowerCase());
    
    // Protection contre les valeurs undefined pour le statut
    const matchesStatus = filterStatus === 'all' || 
      (app.status && typeof app.status === 'string' && app.status === filterStatus);
    
    return matchesSearch && matchesStatus;
  });

  const handleApproveApplication = (applicationId: string) => {
    if (confirm('Approuver cette demande de revendeur ?')) {
      onValidateApplication(applicationId, true);
    }
  };

  const handleRejectApplication = (applicationId: string) => {
    const reason = prompt('Raison du rejet (optionnel):');
    if (reason !== null) { // null si annulé
      onValidateApplication(applicationId, false);
    }
  };

  const handleViewApplication = (application: Application) => {
    setSelectedApplication(application);
    setShowApplicationDetail(true);
  };

  const getStatusColor = (status?: string) => {
    // Protection contre les valeurs undefined
    if (!status || typeof status !== 'string') {
      return 'bg-gray-500/20 text-gray-300';
    }
    
    switch (status) {
      case 'pending': return 'bg-yellow-500/20 text-yellow-300';
      case 'approved': return 'bg-green-500/20 text-green-300';
      case 'rejected': return 'bg-red-500/20 text-red-300';
      default: return 'bg-gray-500/20 text-gray-300';
    }
  };

  const getActivityIcon = (type?: string) => {
    // Protection contre les valeurs undefined
    if (!type || typeof type !== 'string') {
      return AlertCircle;
    }
    
    switch (type) {
      case 'new_application': return FileText;
      case 'retailer_approved': return CheckCircle;
      case 'payment_received': return DollarSign;
      default: return AlertCircle;
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

      {/* Recent Activity */}
      <div className="bg-white/10 backdrop-blur-xl rounded-2xl p-8 border border-white/20">
        <h3 className="text-xl font-bold text-white mb-6">Activité Récente</h3>
        <div className="space-y-4">
          {recentActivity.map((activity) => {
            const Icon = getActivityIcon(activity.type);
            return (
              <div key={activity.id} className="flex items-center gap-4 p-4 bg-black/20 rounded-xl">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                  activity.status === 'success' ? 'bg-green-500/20' : 'bg-yellow-500/20'
                }`}>
                  <Icon className={`w-5 h-5 ${
                    activity.status === 'success' ? 'text-green-400' : 'text-yellow-400'
                  }`} />
                </div>
                <div className="flex-1">
                  <p className="text-white font-medium">{activity.message}</p>
                  <p className="text-gray-400 text-sm">
                    {new Date(activity.timestamp).toLocaleString('fr-FR')}
                  </p>
                </div>
              </div>
            );
          })}
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
            <option value="approved">Approuvées</option>
            <option value="rejected">Rejetées</option>
          </select>
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
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {filteredApplications.map((application) => (
            <div key={application.id} className="bg-white/10 backdrop-blur-xl rounded-2xl p-6 border border-white/20 hover:border-cyan-500/50 transition-all">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-xl flex items-center justify-center">
                    <Building className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h3 className="font-bold text-white">{application.companyName || 'Nom non renseigné'}</h3>
                    <p className="text-cyan-400 text-sm">{application.email || 'Email non renseigné'}</p>
                  </div>
                </div>
                
                <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(application.status)}`}>
                  {application.status || 'pending'}
                </span>
              </div>

              <div className="space-y-2 mb-4 text-sm">
                <div className="flex items-center gap-2 text-gray-300">
                  <User className="w-4 h-4" />
                  <span>{application.firstName || ''} {application.lastName || ''}</span>
                </div>
                <div className="flex items-center gap-2 text-gray-300">
                  <Phone className="w-4 h-4" />
                  <span>{application.phone || 'Non renseigné'}</span>
                </div>
                <div className="flex items-center gap-2 text-gray-300">
                  <MapPin className="w-4 h-4" />
                  <span>{application.city || 'Ville non renseignée'}</span>
                </div>
                <div className="flex items-center gap-2 text-gray-300">
                  <Globe className="w-4 h-4" />
                  <span className="text-cyan-400">
                    {application.subdomain && typeof application.subdomain === 'string' 
                      ? `${application.subdomain}.omnia.sale` 
                      : 'Domaine à générer'}
                  </span>
                </div>
                <div className="flex items-center gap-2 text-gray-300">
                  <CreditCard className="w-4 h-4" />
                  <span>{application.selectedPlan || 'Plan non sélectionné'}</span>
                </div>
                <div className="flex items-center gap-2 text-gray-300">
                  <Calendar className="w-4 h-4" />
                  <span>{application.submittedDate || 'Date inconnue'} à {application.submittedTime || 'Heure inconnue'}</span>
                </div>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => handleViewApplication(application)}
                  className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-xl flex items-center justify-center gap-2 transition-all"
                >
                  <Eye className="w-4 h-4" />
                  Voir détails
                </button>
                
                {(!application.status || application.status === 'pending') && (
                  <>
                    <button
                      onClick={() => handleApproveApplication(application.id)}
                      className="bg-green-600 hover:bg-green-700 text-white py-2 px-4 rounded-xl flex items-center gap-2 transition-all"
                    >
                      <CheckCircle className="w-4 h-4" />
                      Approuver
                    </button>
                    <button
                      onClick={() => handleRejectApplication(application.id)}
                      className="bg-red-600 hover:bg-red-700 text-white py-2 px-4 rounded-xl flex items-center gap-2 transition-all"
                    >
                      <X className="w-4 h-4" />
                      Rejeter
                    </button>
                  </>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );

  const renderRetailers = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-white">Revendeurs Actifs</h2>
        <button className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-xl flex items-center gap-2">
          <Download className="w-4 h-4" />
          Exporter CSV
        </button>
      </div>

      <div className="bg-white/10 backdrop-blur-xl rounded-2xl p-6 border border-white/20">
        <p className="text-gray-300 text-center py-8">
          Liste des revendeurs actifs - Fonctionnalité en développement
        </p>
      </div>
    </div>
  );

  const renderAnalytics = () => (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-white">Analytics Globales</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white/10 backdrop-blur-xl rounded-2xl p-6 border border-white/20">
          <h3 className="text-lg font-bold text-white mb-4">Revenus par Plan</h3>
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-gray-300">Starter (29€)</span>
              <span className="text-green-400 font-bold">12,180€</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-300">Professional (79€)</span>
              <span className="text-green-400 font-bold">28,420€</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-300">Enterprise (199€)</span>
              <span className="text-green-400 font-bold">5,000€</span>
            </div>
          </div>
        </div>

        <div className="bg-white/10 backdrop-blur-xl rounded-2xl p-6 border border-white/20">
          <h3 className="text-lg font-bold text-white mb-4">Conversations</h3>
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-gray-300">Aujourd'hui</span>
              <span className="text-cyan-400 font-bold">1,247</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-300">Cette semaine</span>
              <span className="text-cyan-400 font-bold">8,934</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-300">Ce mois</span>
              <span className="text-cyan-400 font-bold">34,567</span>
            </div>
          </div>
        </div>

        <div className="bg-white/10 backdrop-blur-xl rounded-2xl p-6 border border-white/20">
          <h3 className="text-lg font-bold text-white mb-4">Performance</h3>
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-gray-300">Taux conversion</span>
              <span className="text-green-400 font-bold">42%</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-300">Satisfaction</span>
              <span className="text-yellow-400 font-bold">4.8/5</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-300">Uptime</span>
              <span className="text-green-400 font-bold">99.9%</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

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
          <div className="bg-slate-800/95 backdrop-blur-xl rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto border border-slate-600/50">
            <div className="flex items-center justify-between p-6 border-b border-slate-600/50">
              <h2 className="text-2xl font-bold text-white">Détails de la demande</h2>
              <button
                onClick={() => setShowApplicationDetail(false)}
                className="text-gray-400 hover:text-white transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="p-6 space-y-6">
              {/* Informations entreprise */}
              <div className="bg-black/20 rounded-xl p-4">
                <h3 className="font-semibold text-white mb-3 flex items-center gap-2">
                  <Building className="w-5 h-5 text-cyan-400" />
                  Informations Entreprise
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-gray-400">Nom :</span>
                    <span className="text-white ml-2">{selectedApplication.companyName || 'Non renseigné'}</span>
                  </div>
                  <div>
                    <span className="text-gray-400">SIRET :</span>
                    <span className="text-white ml-2">{selectedApplication.siret || 'Non renseigné'}</span>
                  </div>
                  <div className="md:col-span-2">
                    <span className="text-gray-400">Adresse :</span>
                    <span className="text-white ml-2">
                      {selectedApplication.address || 'Non renseignée'}, {selectedApplication.postalCode || ''} {selectedApplication.city || ''}
                    </span>
                  </div>
                </div>
              </div>

              {/* Contact */}
              <div className="bg-black/20 rounded-xl p-4">
                <h3 className="font-semibold text-white mb-3 flex items-center gap-2">
                  <User className="w-5 h-5 text-green-400" />
                  Contact Responsable
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-gray-400">Nom :</span>
                    <span className="text-white ml-2">{selectedApplication.firstName || ''} {selectedApplication.lastName || ''}</span>
                  </div>
                  <div>
                    <span className="text-gray-400">Email :</span>
                    <span className="text-white ml-2">{selectedApplication.email || 'Non renseigné'}</span>
                  </div>
                  <div>
                    <span className="text-gray-400">Téléphone :</span>
                    <span className="text-white ml-2">{selectedApplication.phone || 'Non renseigné'}</span>
                  </div>
                  <div>
                    <span className="text-gray-400">Fonction :</span>
                    <span className="text-white ml-2">{selectedApplication.position || 'Non renseignée'}</span>
                  </div>
                </div>
              </div>

              {/* Plan et domaine */}
              <div className="bg-black/20 rounded-xl p-4">
                <h3 className="font-semibold text-white mb-3 flex items-center gap-2">
                  <Globe className="w-5 h-5 text-purple-400" />
                  Configuration
                </h3>
                <div className="space-y-2 text-sm">
                  <div>
                    <span className="text-gray-400">Plan choisi :</span>
                    <span className="text-white ml-2 font-semibold">{selectedApplication.selectedPlan || 'Non sélectionné'}</span>
                  </div>
                  <div>
                    <span className="text-gray-400">Sous-domaine :</span>
                    <span className="text-cyan-400 ml-2 font-mono">
                      {selectedApplication.subdomain && typeof selectedApplication.subdomain === 'string'
                        ? `${selectedApplication.subdomain}.omnia.sale`
                        : 'À générer'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="flex justify-between pt-6 border-t border-slate-600/50">
                <button
                  onClick={() => setShowApplicationDetail(false)}
                  className="bg-gray-600 hover:bg-gray-700 text-white px-6 py-3 rounded-xl transition-all"
                >
                  Fermer
                </button>
                
                {(!selectedApplication.status || selectedApplication.status === 'pending') && (
                  <div className="flex gap-3">
                    <button
                      onClick={() => {
                        handleRejectApplication(selectedApplication.id);
                        setShowApplicationDetail(false);
                      }}
                      className="bg-red-600 hover:bg-red-700 text-white px-6 py-3 rounded-xl flex items-center gap-2 transition-all"
                    >
                      <X className="w-4 h-4" />
                      Rejeter
                    </button>
                    <button
                      onClick={() => {
                        handleApproveApplication(selectedApplication.id);
                        setShowApplicationDetail(false);
                      }}
                      className="bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-xl flex items-center gap-2 transition-all"
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
    </div>
  );
};