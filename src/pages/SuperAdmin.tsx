import React, { useState, useEffect } from 'react';
import { 
  Shield, Users, Building, CheckCircle, X, Eye, Mail, 
  Phone, MapPin, FileText, Calendar, Clock, AlertCircle,
  Download, ExternalLink, BarChart3, TrendingUp, DollarSign,
  LogOut, Settings, Database, Globe, Target, Zap
} from 'lucide-react';
import { Logo } from '../components/Logo';
import { NotificationSystem, useNotifications } from '../components/NotificationSystem';

interface Application {
  id: string;
  companyName: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  postalCode: string;
  siret: string;
  position: string;
  selectedPlan: string;
  kbisFile?: File;
  submittedAt: string;
  submittedDate: string;
  submittedTime: string;
  status: 'pending' | 'approved' | 'rejected';
  proposedSubdomain: string;
}

interface SuperAdminProps {
  onLogout: () => void;
  pendingApplications: Application[];
  onValidateApplication: (applicationId: string, approved: boolean) => void;
}

interface GlobalStats {
  totalRetailers: number;
  totalConversations: number;
  totalRevenue: number;
  activeUsers: number;
  conversionRate: number;
  avgSessionDuration: string;
}

export const SuperAdmin: React.FC<SuperAdminProps> = ({ 
  onLogout, 
  pendingApplications, 
  onValidateApplication 
}) => {
  const [activeTab, setActiveTab] = useState('applications');
  const [selectedApplication, setSelectedApplication] = useState<Application | null>(null);
  const [globalStats, setGlobalStats] = useState<GlobalStats>({
    totalRetailers: 156,
    totalConversations: 45680,
    totalRevenue: 234500,
    activeUsers: 1240,
    conversionRate: 38,
    avgSessionDuration: '4m 12s'
  });
  const { notifications, removeNotification, showSuccess, showError, showInfo } = useNotifications();

  useEffect(() => {
    showInfo('Super Admin', 'Interface Super Admin chargée avec succès !');
  }, []);

  const handleApproveApplication = (application: Application) => {
    onValidateApplication(application.id, true);
    setSelectedApplication(null);
    showSuccess(
      'Demande approuvée !',
      `${application.companyName} a été approuvé. Email de bienvenue envoyé.`,
      [
        {
          label: 'Voir le nouveau revendeur',
          action: () => setActiveTab('retailers'),
          variant: 'primary'
        }
      ]
    );
  };

  const handleRejectApplication = (application: Application) => {
    const reason = prompt('Raison du rejet (optionnel):');
    onValidateApplication(application.id, false);
    setSelectedApplication(null);
    showError(
      'Demande rejetée',
      `${application.companyName} a été rejeté. Email d'information envoyé.`
    );
  };

  const tabs = [
    { id: 'overview', label: 'Vue d\'ensemble', icon: BarChart3 },
    { id: 'applications', label: 'Demandes', icon: FileText, badge: pendingApplications.length },
    { id: 'retailers', label: 'Revendeurs', icon: Building },
    { id: 'analytics', label: 'Analytics', icon: TrendingUp },
    { id: 'system', label: 'Système', icon: Settings }
  ];

  const renderOverview = () => (
    <div className="space-y-8">
      <div>
        <h2 className="text-3xl font-bold text-white mb-2">Vue d'ensemble OmnIA</h2>
        <p className="text-gray-300">Statistiques globales de la plateforme</p>
      </div>

      {/* Stats globales */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-6">
        <div className="bg-blue-600/20 backdrop-blur-xl rounded-2xl p-6 border border-blue-500/30">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-blue-200 text-sm mb-1">Revendeurs</p>
              <p className="text-3xl font-bold text-white">{globalStats.totalRetailers}</p>
              <p className="text-blue-300 text-sm">Actifs</p>
            </div>
            <Building className="w-10 h-10 text-blue-400" />
          </div>
        </div>
        
        <div className="bg-green-600/20 backdrop-blur-xl rounded-2xl p-6 border border-green-500/30">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-green-200 text-sm mb-1">Conversations</p>
              <p className="text-3xl font-bold text-white">{globalStats.totalConversations.toLocaleString()}</p>
              <p className="text-green-300 text-sm">Total</p>
            </div>
            <Users className="w-10 h-10 text-green-400" />
          </div>
        </div>
        
        <div className="bg-purple-600/20 backdrop-blur-xl rounded-2xl p-6 border border-purple-500/30">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-purple-200 text-sm mb-1">Revenus</p>
              <p className="text-3xl font-bold text-white">€{globalStats.totalRevenue.toLocaleString()}</p>
              <p className="text-purple-300 text-sm">MRR</p>
            </div>
            <DollarSign className="w-10 h-10 text-purple-400" />
          </div>
        </div>
        
        <div className="bg-orange-600/20 backdrop-blur-xl rounded-2xl p-6 border border-orange-500/30">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-orange-200 text-sm mb-1">Utilisateurs</p>
              <p className="text-3xl font-bold text-white">{globalStats.activeUsers.toLocaleString()}</p>
              <p className="text-orange-300 text-sm">Actifs</p>
            </div>
            <Users className="w-10 h-10 text-orange-400" />
          </div>
        </div>
        
        <div className="bg-cyan-600/20 backdrop-blur-xl rounded-2xl p-6 border border-cyan-500/30">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-cyan-200 text-sm mb-1">Conversion</p>
              <p className="text-3xl font-bold text-white">{globalStats.conversionRate}%</p>
              <p className="text-cyan-300 text-sm">Moyenne</p>
            </div>
            <TrendingUp className="w-10 h-10 text-cyan-400" />
          </div>
        </div>
        
        <div className="bg-pink-600/20 backdrop-blur-xl rounded-2xl p-6 border border-pink-500/30">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-pink-200 text-sm mb-1">Session</p>
              <p className="text-3xl font-bold text-white">{globalStats.avgSessionDuration}</p>
              <p className="text-pink-300 text-sm">Durée moy.</p>
            </div>
            <Clock className="w-10 h-10 text-pink-400" />
          </div>
        </div>
      </div>

      {/* Demandes en attente */}
      {pendingApplications.length > 0 && (
        <div className="bg-yellow-500/20 border border-yellow-400/50 rounded-2xl p-6">
          <h3 className="text-xl font-bold text-yellow-200 mb-4 flex items-center gap-2">
            <AlertCircle className="w-6 h-6" />
            🔔 {pendingApplications.length} demande(s) en attente
          </h3>
          <div className="space-y-3">
            {pendingApplications.slice(0, 3).map((app) => (
              <div key={app.id} className="flex items-center justify-between p-4 bg-black/20 rounded-xl">
                <div>
                  <h4 className="font-semibold text-white">{app.companyName}</h4>
                  <p className="text-yellow-300 text-sm">{app.firstName} {app.lastName} • {app.selectedPlan}</p>
                </div>
                <button
                  onClick={() => {
                    setSelectedApplication(app);
                    setActiveTab('applications');
                  }}
                  className="bg-yellow-600 hover:bg-yellow-700 text-white px-4 py-2 rounded-xl transition-all"
                >
                  Examiner
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );

  const renderApplications = () => (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold text-white mb-2">Demandes de Revendeurs</h2>
          <p className="text-gray-300">{pendingApplications.length} demande(s) en attente de validation</p>
        </div>
      </div>

      {pendingApplications.length === 0 ? (
        <div className="text-center py-20">
          <FileText className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-xl font-bold text-white mb-2">Aucune demande en attente</h3>
          <p className="text-gray-400">Toutes les demandes ont été traitées</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
          {pendingApplications.map((application) => (
            <div key={application.id} className="bg-white/10 backdrop-blur-xl rounded-2xl p-6 border border-white/20 hover:border-cyan-500/50 transition-all">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-bold text-white">{application.companyName}</h3>
                <span className="bg-yellow-500/20 text-yellow-300 px-3 py-1 rounded-full text-xs font-medium">
                  En attente
                </span>
              </div>
              
              <div className="space-y-3 mb-6">
                <div className="flex items-center gap-2 text-sm">
                  <User className="w-4 h-4 text-gray-400" />
                  <span className="text-gray-300">{application.firstName} {application.lastName}</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <Mail className="w-4 h-4 text-gray-400" />
                  <span className="text-gray-300">{application.email}</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <Phone className="w-4 h-4 text-gray-400" />
                  <span className="text-gray-300">{application.phone}</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <MapPin className="w-4 h-4 text-gray-400" />
                  <span className="text-gray-300">{application.city}</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <Building className="w-4 h-4 text-gray-400" />
                  <span className="text-gray-300">SIRET: {application.siret}</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <Calendar className="w-4 h-4 text-gray-400" />
                  <span className="text-gray-300">{application.submittedDate} à {application.submittedTime}</span>
                </div>
              </div>
              
              <div className="flex gap-3">
                <button
                  onClick={() => setSelectedApplication(application)}
                  className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-2 rounded-xl transition-all flex items-center justify-center gap-2"
                >
                  <Eye className="w-4 h-4" />
                  Examiner
                </button>
                <button
                  onClick={() => handleApproveApplication(application)}
                  className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-xl transition-all"
                >
                  <CheckCircle className="w-4 h-4" />
                </button>
                <button
                  onClick={() => handleRejectApplication(application)}
                  className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-xl transition-all"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal de détail */}
      {selectedApplication && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-800/95 backdrop-blur-xl rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto border border-slate-600/50">
            <div className="p-8">
              <div className="flex items-center justify-between mb-8">
                <h2 className="text-2xl font-bold text-white">Demande de {selectedApplication.companyName}</h2>
                <button
                  onClick={() => setSelectedApplication(null)}
                  className="text-gray-400 hover:text-white transition-colors"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Informations entreprise */}
                <div className="bg-black/20 rounded-xl p-6">
                  <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                    <Building className="w-5 h-5 text-blue-400" />
                    Entreprise
                  </h3>
                  <div className="space-y-3">
                    <div>
                      <label className="text-sm text-gray-400">Nom de l'entreprise</label>
                      <p className="text-white font-semibold">{selectedApplication.companyName}</p>
                    </div>
                    <div>
                      <label className="text-sm text-gray-400">SIRET</label>
                      <p className="text-white font-mono">{selectedApplication.siret}</p>
                    </div>
                    <div>
                      <label className="text-sm text-gray-400">Adresse</label>
                      <p className="text-white">{selectedApplication.address}</p>
                      <p className="text-white">{selectedApplication.postalCode} {selectedApplication.city}</p>
                    </div>
                    <div>
                      <label className="text-sm text-gray-400">Plan choisi</label>
                      <span className="inline-block bg-cyan-500/20 text-cyan-300 px-3 py-1 rounded-full text-sm font-medium mt-1">
                        {selectedApplication.selectedPlan.charAt(0).toUpperCase() + selectedApplication.selectedPlan.slice(1)}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Contact responsable */}
                <div className="bg-black/20 rounded-xl p-6">
                  <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                    <User className="w-5 h-5 text-green-400" />
                    Contact
                  </h3>
                  <div className="space-y-3">
                    <div>
                      <label className="text-sm text-gray-400">Responsable</label>
                      <p className="text-white font-semibold">{selectedApplication.firstName} {selectedApplication.lastName}</p>
                    </div>
                    <div>
                      <label className="text-sm text-gray-400">Fonction</label>
                      <p className="text-white">{selectedApplication.position}</p>
                    </div>
                    <div>
                      <label className="text-sm text-gray-400">Email</label>
                      <p className="text-white">{selectedApplication.email}</p>
                    </div>
                    <div>
                      <label className="text-sm text-gray-400">Téléphone</label>
                      <p className="text-white">{selectedApplication.phone}</p>
                    </div>
                    <div>
                      <label className="text-sm text-gray-400">Soumis le</label>
                      <p className="text-white">{selectedApplication.submittedDate} à {selectedApplication.submittedTime}</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Document Kbis */}
              {selectedApplication.kbisFile && (
                <div className="mt-8 bg-black/20 rounded-xl p-6">
                  <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                    <FileText className="w-5 h-5 text-purple-400" />
                    Document Kbis
                  </h3>
                  <div className="flex items-center gap-4">
                    <div className="w-16 h-16 bg-purple-500/20 rounded-xl flex items-center justify-center">
                      <FileText className="w-8 h-8 text-purple-400" />
                    </div>
                    <div>
                      <p className="text-white font-semibold">{selectedApplication.kbisFile.name}</p>
                      <p className="text-gray-400 text-sm">
                        {(selectedApplication.kbisFile.size / 1024 / 1024).toFixed(2)} MB • {selectedApplication.kbisFile.type}
                      </p>
                    </div>
                    <button className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-xl transition-all flex items-center gap-2">
                      <Download className="w-4 h-4" />
                      Télécharger
                    </button>
                  </div>
                </div>
              )}

              {/* Actions */}
              <div className="flex justify-between mt-8 pt-6 border-t border-slate-600/50">
                <button
                  onClick={() => setSelectedApplication(null)}
                  className="bg-gray-600 hover:bg-gray-700 text-white px-6 py-3 rounded-xl transition-all"
                >
                  Fermer
                </button>
                
                <div className="flex gap-4">
                  <button
                    onClick={() => handleRejectApplication(selectedApplication)}
                    className="bg-red-600 hover:bg-red-700 text-white px-6 py-3 rounded-xl transition-all flex items-center gap-2"
                  >
                    <X className="w-4 h-4" />
                    Rejeter
                  </button>
                  <button
                    onClick={() => handleApproveApplication(selectedApplication)}
                    className="bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-xl transition-all flex items-center gap-2"
                  >
                    <CheckCircle className="w-4 h-4" />
                    Approuver
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );

  const renderRetailers = () => (
    <div className="space-y-8">
      <div>
        <h2 className="text-3xl font-bold text-white mb-2">Revendeurs Actifs</h2>
        <p className="text-gray-300">{globalStats.totalRetailers} revendeurs sur la plateforme</p>
      </div>

      <div className="bg-white/10 backdrop-blur-xl rounded-2xl p-8 border border-white/20">
        <div className="text-center py-12">
          <Building className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-xl font-bold text-white mb-2">Liste des revendeurs</h3>
          <p className="text-gray-400">Interface de gestion des revendeurs en développement</p>
        </div>
      </div>
    </div>
  );

  const renderAnalytics = () => (
    <div className="space-y-8">
      <div>
        <h2 className="text-3xl font-bold text-white mb-2">Analytics Globales</h2>
        <p className="text-gray-300">Performances de la plateforme OmnIA</p>
      </div>

      <div className="bg-white/10 backdrop-blur-xl rounded-2xl p-8 border border-white/20">
        <div className="text-center py-12">
          <BarChart3 className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-xl font-bold text-white mb-2">Analytics avancées</h3>
          <p className="text-gray-400">Tableaux de bord et métriques détaillées en développement</p>
        </div>
      </div>
    </div>
  );

  const renderSystem = () => (
    <div className="space-y-8">
      <div>
        <h2 className="text-3xl font-bold text-white mb-2">Administration Système</h2>
        <p className="text-gray-300">Configuration et maintenance de la plateforme</p>
      </div>

      <div className="bg-white/10 backdrop-blur-xl rounded-2xl p-8 border border-white/20">
        <div className="text-center py-12">
          <Settings className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-xl font-bold text-white mb-2">Paramètres système</h3>
          <p className="text-gray-400">Configuration serveur et maintenance en développement</p>
        </div>
      </div>
    </div>
  );

  const renderTabContent = () => {
    switch (activeTab) {
      case 'overview':
        return renderOverview();
      case 'applications':
        return renderApplications();
      case 'retailers':
        return renderRetailers();
      case 'analytics':
        return renderAnalytics();
      case 'system':
        return renderSystem();
      default:
        return renderOverview();
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

      <div className="relative z-10 flex h-screen">
        {/* Sidebar */}
        <div className="w-80 bg-black/20 backdrop-blur-2xl border-r border-white/10 flex flex-col">
          {/* Header */}
          <div className="p-6 border-b border-white/10">
            <Logo size="md" />
            <div className="mt-4 p-4 bg-red-500/20 rounded-xl border border-red-400/30">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gradient-to-br from-red-500 to-red-600 rounded-xl flex items-center justify-center">
                  <Shield className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h3 className="text-white font-bold">Super Admin</h3>
                  <p className="text-red-300 text-sm">Accès complet</p>
                </div>
              </div>
            </div>
          </div>

          {/* Navigation */}
          <nav className="flex-1 p-6 space-y-2 overflow-y-auto">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all text-left relative ${
                    activeTab === tab.id
                      ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 shadow-lg'
                      : 'text-gray-300 hover:bg-white/10 hover:text-white'
                  }`}
                >
                  <Icon className="w-5 h-5" />
                  <span className="font-medium">{tab.label}</span>
                  {tab.badge && tab.badge > 0 && (
                    <span className="absolute right-3 bg-red-500 text-white text-xs font-bold rounded-full w-6 h-6 flex items-center justify-center animate-bounce">
                      {tab.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>

          {/* Footer */}
          <div className="p-6 border-t border-white/10">
            <button
              onClick={onLogout}
              className="w-full flex items-center gap-3 px-4 py-3 text-red-300 hover:text-red-200 hover:bg-red-500/20 rounded-xl transition-all"
            >
              <LogOut className="w-5 h-5" />
              <span className="font-medium">Déconnexion</span>
            </button>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 overflow-y-auto">
          <div className="p-8">
            {renderTabContent()}
          </div>
        </div>
      </div>
    </div>
  );
};