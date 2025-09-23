import React, { useState, useEffect } from 'react';
import { 
  Users, CheckCircle, XCircle, Clock, Mail, Phone, 
  Building, MapPin, FileText, Eye, Download, 
  BarChart3, TrendingUp, UserCheck, AlertCircle,
  LogOut, Bot, Globe, Star, Package, MessageSquare,
  Calendar, Filter, Search, RefreshCw, Settings
} from 'lucide-react';

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
  proposedSubdomain: string;
  submittedAt: string;
  submittedDate: string;
  submittedTime: string;
  status: string;
  kbisFile?: any;
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
  const [activeTab, setActiveTab] = useState('applications');
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [selectedApplication, setSelectedApplication] = useState<Application | null>(null);
  const [showDetailModal, setShowDetailModal] = useState(false);

  // Statistiques globales
  const [globalStats, setGlobalStats] = useState({
    totalRetailers: 156,
    pendingApplications: pendingApplications.length,
    monthlyRevenue: 12450,
    totalConversations: 45678,
    averageConversion: 38,
    topPerformers: [
      { name: 'Decora Home', revenue: 2450, conversations: 1234 },
      { name: 'Mobilier Design Paris', revenue: 1890, conversations: 987 },
      { name: 'Déco Contemporain', revenue: 1650, conversations: 756 }
    ]
  });

  const tabs = [
    { id: 'applications', label: 'Demandes', icon: FileText, count: pendingApplications.length },
    { id: 'retailers', label: 'Revendeurs', icon: Users, count: globalStats.totalRetailers },
    { id: 'analytics', label: 'Analytics', icon: BarChart3 },
    { id: 'system', label: 'Système', icon: Settings }
  ];

  const filteredApplications = pendingApplications.filter(app => {
    const matchesSearch = searchTerm === '' || 
      app.companyName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      app.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      app.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      app.lastName.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = filterStatus === 'all' || app.status === filterStatus;
    
    return matchesSearch && matchesStatus;
  });

  const handleViewApplication = (application: Application) => {
    setSelectedApplication(application);
    setShowDetailModal(true);
  };

  const handleValidateFromModal = (approved: boolean) => {
    if (selectedApplication) {
      onValidateApplication(selectedApplication.id, approved);
      setShowDetailModal(false);
      setSelectedApplication(null);
    }
  };

  const renderApplications = () => (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-white">Demandes d'Inscription</h2>
          <p className="text-gray-300">{filteredApplications.length} demande(s) en attente de validation</p>
        </div>
        <button
          onClick={() => window.location.reload()}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-xl flex items-center gap-2 transition-all"
        >
          <RefreshCw className="w-4 h-4" />
          Actualiser
        </button>
      </div>

      {/* Filtres */}
      <div className="bg-white/10 backdrop-blur-xl rounded-2xl p-6 border border-white/20">
        <div className="flex flex-col lg:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Rechercher par entreprise, email, nom..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-3 bg-black/40 border border-gray-600 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:border-cyan-400"
            />
          </div>
          
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="bg-black/40 border border-gray-600 rounded-xl px-4 py-3 text-white"
          >
            <option value="all">Tous les statuts</option>
            <option value="pending">En attente</option>
            <option value="approved">Approuvé</option>
            <option value="rejected">Rejeté</option>
          </select>
        </div>
      </div>

      {/* Liste des demandes */}
      {filteredApplications.length === 0 ? (
        <div className="text-center py-20">
          <FileText className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-xl font-bold text-white mb-2">Aucune demande trouvée</h3>
          <p className="text-gray-400">
            {searchTerm || filterStatus !== 'all' 
              ? 'Aucune demande ne correspond à vos critères.'
              : 'Aucune nouvelle demande d\'inscription.'}
          </p>
        </div>
      ) : (
        <div className="bg-white/10 backdrop-blur-xl rounded-2xl border border-white/20 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-black/20">
                <tr>
                  <th className="text-left p-4 text-cyan-300 font-semibold">Entreprise</th>
                  <th className="text-left p-4 text-cyan-300 font-semibold">Contact</th>
                  <th className="text-left p-4 text-cyan-300 font-semibold">Plan</th>
                  <th className="text-left p-4 text-cyan-300 font-semibold">Soumission</th>
                  <th className="text-left p-4 text-cyan-300 font-semibold">Statut</th>
                  <th className="text-left p-4 text-cyan-300 font-semibold">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredApplications.map((application) => (
                  <tr key={application.id} className="border-b border-white/10 hover:bg-white/5">
                    <td className="p-4">
                      <div>
                        <div className="font-semibold text-white">{application.companyName}</div>
                        <div className="text-gray-400 text-sm">{application.siret}</div>
                        <div className="text-gray-400 text-sm">{application.city}</div>
                        <div className="text-cyan-400 text-xs">
                          {application.proposedSubdomain}.omnia.sale
                        </div>
                      </div>
                    </td>
                    <td className="p-4">
                      <div>
                        <div className="text-white">{application.firstName} {application.lastName}</div>
                        <div className="text-gray-400 text-sm">{application.position}</div>
                        <div className="text-cyan-400 text-sm">{application.email}</div>
                        <div className="text-gray-400 text-sm">{application.phone}</div>
                      </div>
                    </td>
                    <td className="p-4">
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                        application.selectedPlan === 'enterprise' ? 'bg-purple-500/20 text-purple-300' :
                        application.selectedPlan === 'professional' ? 'bg-blue-500/20 text-blue-300' :
                        'bg-green-500/20 text-green-300'
                      }`}>
                        {application.selectedPlan}
                      </span>
                    </td>
                    <td className="p-4">
                      <div className="text-white text-sm">{application.submittedDate}</div>
                      <div className="text-gray-400 text-xs">{application.submittedTime}</div>
                    </td>
                    <td className="p-4">
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                        application.status === 'pending' ? 'bg-yellow-500/20 text-yellow-300' :
                        application.status === 'approved' ? 'bg-green-500/20 text-green-300' :
                        'bg-red-500/20 text-red-300'
                      }`}>
                        {application.status === 'pending' ? 'En attente' :
                         application.status === 'approved' ? 'Approuvé' :
                         'Rejeté'}
                      </span>
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
                        
                        {application.status === 'pending' && (
                          <>
                            <button
                              onClick={() => onValidateApplication(application.id, true)}
                              className="text-green-400 hover:text-green-300 p-1"
                              title="Approuver"
                            >
                              <CheckCircle className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => onValidateApplication(application.id, false)}
                              className="text-red-400 hover:text-red-300 p-1"
                              title="Rejeter"
                            >
                              <XCircle className="w-4 h-4" />
                            </button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );

  const renderRetailers = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-white">Revendeurs Actifs</h2>
          <p className="text-gray-300">{globalStats.totalRetailers} revendeur(s) enregistré(s)</p>
        </div>
      </div>

      <div className="bg-white/10 backdrop-blur-xl rounded-2xl p-6 border border-white/20">
        <h3 className="text-lg font-bold text-white mb-4">Top Performers</h3>
        <div className="space-y-4">
          {globalStats.topPerformers.map((retailer, index) => (
            <div key={index} className="flex items-center justify-between p-4 bg-black/20 rounded-xl">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-full flex items-center justify-center">
                  <span className="text-white font-bold text-sm">#{index + 1}</span>
                </div>
                <div>
                  <div className="font-semibold text-white">{retailer.name}</div>
                  <div className="text-gray-400 text-sm">{retailer.conversations} conversations</div>
                </div>
              </div>
              <div className="text-right">
                <div className="text-green-400 font-bold">€{retailer.revenue.toLocaleString()}</div>
                <div className="text-gray-400 text-sm">Ce mois</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  const renderAnalytics = () => (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-white">Analytics Globales</h2>
        <p className="text-gray-300">Vue d'ensemble de la plateforme OmnIA</p>
      </div>

      {/* Stats globales */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-blue-600/20 backdrop-blur-xl rounded-2xl p-6 border border-blue-500/30">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-blue-200 text-sm mb-1">Revendeurs</p>
              <p className="text-3xl font-bold text-white">{globalStats.totalRetailers}</p>
            </div>
            <Users className="w-10 h-10 text-blue-400" />
          </div>
        </div>
        
        <div className="bg-green-600/20 backdrop-blur-xl rounded-2xl p-6 border border-green-500/30">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-green-200 text-sm mb-1">Revenus</p>
              <p className="text-3xl font-bold text-white">€{globalStats.monthlyRevenue.toLocaleString()}</p>
            </div>
            <TrendingUp className="w-10 h-10 text-green-400" />
          </div>
        </div>
        
        <div className="bg-purple-600/20 backdrop-blur-xl rounded-2xl p-6 border border-purple-500/30">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-purple-200 text-sm mb-1">Conversations</p>
              <p className="text-3xl font-bold text-white">{globalStats.totalConversations.toLocaleString()}</p>
            </div>
            <MessageSquare className="w-10 h-10 text-purple-400" />
          </div>
        </div>
        
        <div className="bg-orange-600/20 backdrop-blur-xl rounded-2xl p-6 border border-orange-500/30">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-orange-200 text-sm mb-1">Conversion</p>
              <p className="text-3xl font-bold text-white">{globalStats.averageConversion}%</p>
            </div>
            <BarChart3 className="w-10 h-10 text-orange-400" />
          </div>
        </div>
      </div>
    </div>
  );

  const renderSystem = () => (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-white">Administration Système</h2>
        <p className="text-gray-300">Gestion et maintenance de la plateforme</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white/10 backdrop-blur-xl rounded-2xl p-6 border border-white/20">
          <h3 className="text-lg font-bold text-white mb-4">État des Services</h3>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-gray-300">API OmnIA</span>
              <span className="flex items-center gap-2 text-green-300">
                <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                Opérationnel
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-300">Base de données</span>
              <span className="flex items-center gap-2 text-green-300">
                <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                Opérationnel
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-300">IA DeepSeek</span>
              <span className="flex items-center gap-2 text-green-300">
                <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                Opérationnel
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-300">Synthèse vocale</span>
              <span className="flex items-center gap-2 text-yellow-300">
                <div className="w-2 h-2 bg-yellow-400 rounded-full"></div>
                Maintenance
              </span>
            </div>
          </div>
        </div>

        <div className="bg-white/10 backdrop-blur-xl rounded-2xl p-6 border border-white/20">
          <h3 className="text-lg font-bold text-white mb-4">Actions Système</h3>
          <div className="space-y-3">
            <button className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 rounded-xl transition-all text-left px-4">
              Sauvegarder la base de données
            </button>
            <button className="w-full bg-purple-600 hover:bg-purple-700 text-white py-2 rounded-xl transition-all text-left px-4">
              Redémarrer les services IA
            </button>
            <button className="w-full bg-orange-600 hover:bg-orange-700 text-white py-2 rounded-xl transition-all text-left px-4">
              Nettoyer les logs anciens
            </button>
            <button className="w-full bg-red-600 hover:bg-red-700 text-white py-2 rounded-xl transition-all text-left px-4">
              Maintenance planifiée
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  const renderContent = () => {
    switch (activeTab) {
      case 'applications':
        return renderApplications();
      case 'retailers':
        return renderRetailers();
      case 'analytics':
        return renderAnalytics();
      case 'system':
        return renderSystem();
      default:
        return renderApplications();
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-purple-900 flex">
      {/* Sidebar */}
      <div className="w-80 bg-slate-800/95 backdrop-blur-xl border-r border-slate-700/50 flex flex-col">
        {/* Header */}
        <div className="p-6 border-b border-slate-700/50">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 bg-gradient-to-br from-red-500 to-pink-600 rounded-2xl flex items-center justify-center">
              <UserCheck className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-white">Super Admin</h1>
              <p className="text-red-300 text-sm">omnia.sale</p>
            </div>
          </div>
          
          <div className="bg-red-500/20 backdrop-blur-xl rounded-xl p-3 border border-red-400/30">
            <div className="text-red-200 font-bold text-sm">Accès Administrateur</div>
            <div className="text-red-300 text-xs">Gestion globale plateforme</div>
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
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all text-left ${
                  activeTab === tab.id
                    ? 'bg-red-500/20 text-red-300 border border-red-500/30'
                    : 'text-gray-300 hover:bg-white/10 hover:text-white'
                }`}
              >
                <Icon className="w-5 h-5" />
                <span className="font-medium">{tab.label}</span>
                {tab.count !== undefined && tab.count > 0 && (
                  <span className="ml-auto bg-red-500/30 text-red-300 px-2 py-1 rounded-full text-xs">
                    {tab.count}
                  </span>
                )}
              </button>
            );
          })}
        </nav>

        {/* Footer */}
        <div className="p-6 border-t border-slate-700/50">
          <button
            onClick={onLogout}
            className="w-full bg-red-600 hover:bg-red-700 text-white py-3 rounded-xl transition-all flex items-center justify-center gap-2 font-semibold"
          >
            <LogOut className="w-4 h-4" />
            Déconnexion Admin
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-y-auto">
        <div className="p-8">
          {renderContent()}
        </div>
      </div>

      {/* Modal détail application */}
      {showDetailModal && selectedApplication && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-800/95 backdrop-blur-xl rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto border border-slate-600/50">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-bold text-white">Détails de la demande</h3>
                <button
                  onClick={() => setShowDetailModal(false)}
                  className="text-gray-400 hover:text-white"
                >
                  <XCircle className="w-5 h-5" />
                </button>
              </div>

              <div className="space-y-6">
                {/* Informations entreprise */}
                <div className="bg-black/20 rounded-xl p-4">
                  <h4 className="font-semibold text-white mb-3 flex items-center gap-2">
                    <Building className="w-5 h-5 text-blue-400" />
                    Entreprise
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-gray-400">Nom :</span>
                      <div className="text-white font-medium">{selectedApplication.companyName}</div>
                    </div>
                    <div>
                      <span className="text-gray-400">SIRET :</span>
                      <div className="text-white font-medium">{selectedApplication.siret}</div>
                    </div>
                    <div>
                      <span className="text-gray-400">Adresse :</span>
                      <div className="text-white font-medium">
                        {selectedApplication.address}<br />
                        {selectedApplication.postalCode} {selectedApplication.city}
                      </div>
                    </div>
                    <div>
                      <span className="text-gray-400">Plan choisi :</span>
                      <div className="text-white font-medium">{selectedApplication.selectedPlan}</div>
                    </div>
                  </div>
                </div>

                {/* Contact */}
                <div className="bg-black/20 rounded-xl p-4">
                  <h4 className="font-semibold text-white mb-3 flex items-center gap-2">
                    <Users className="w-5 h-5 text-green-400" />
                    Contact
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-gray-400">Nom :</span>
                      <div className="text-white font-medium">{selectedApplication.firstName} {selectedApplication.lastName}</div>
                    </div>
                    <div>
                      <span className="text-gray-400">Fonction :</span>
                      <div className="text-white font-medium">{selectedApplication.position}</div>
                    </div>
                    <div>
                      <span className="text-gray-400">Email :</span>
                      <div className="text-white font-medium">{selectedApplication.email}</div>
                    </div>
                    <div>
                      <span className="text-gray-400">Téléphone :</span>
                      <div className="text-white font-medium">{selectedApplication.phone}</div>
                    </div>
                  </div>
                </div>

                {/* Sous-domaine */}
                <div className="bg-cyan-500/20 border border-cyan-400/30 rounded-xl p-4">
                  <h4 className="font-semibold text-cyan-200 mb-2 flex items-center gap-2">
                    <Globe className="w-5 h-5" />
                    Sous-domaine proposé
                  </h4>
                  <div className="text-cyan-300 font-mono">
                    {selectedApplication.proposedSubdomain}.omnia.sale
                  </div>
                </div>

                {/* Actions */}
                {selectedApplication.status === 'pending' && (
                  <div className="flex gap-4">
                    <button
                      onClick={() => handleValidateFromModal(true)}
                      className="flex-1 bg-green-600 hover:bg-green-700 text-white py-3 rounded-xl font-semibold transition-all flex items-center justify-center gap-2"
                    >
                      <CheckCircle className="w-4 h-4" />
                      Approuver
                    </button>
                    <button
                      onClick={() => handleValidateFromModal(false)}
                      className="flex-1 bg-red-600 hover:bg-red-700 text-white py-3 rounded-xl font-semibold transition-all flex items-center justify-center gap-2"
                    >
                      <XCircle className="w-4 h-4" />
                      Rejeter
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