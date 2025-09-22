import React, { useState, useEffect } from 'react';
import { 
  Shield, Users, Building, CheckCircle, XCircle, Clock, Mail, Phone, MapPin, 
  FileText, Download, Eye, Edit, Trash2, Plus, Search, Filter, BarChart3,
  DollarSign, TrendingUp, AlertCircle, Settings, ArrowLeft, Send, User
} from 'lucide-react';
import { Logo } from '../components/Logo';

interface RetailerApplication {
  id: string;
  company_name: string;
  email: string;
  first_name: string;
  last_name: string;
  phone: string;
  address: string;
  city: string;
  postal_code: string;
  siret: string;
  position: string;
  plan: 'starter' | 'professional' | 'enterprise';
  proposed_subdomain: string;
  kbis_document_url?: string;
  status: 'pending' | 'approved' | 'rejected';
  submitted_at: string;
  processed_at?: string;
  processed_by?: string;
  rejection_reason?: string;
}

export const SuperAdmin: React.FC = () => {
  const [applications, setApplications] = useState<RetailerApplication[]>([]);
  const [activeTab, setActiveTab] = useState('pending');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedApplication, setSelectedApplication] = useState<RetailerApplication | null>(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [loading, setLoading] = useState(true);

  const tabs = [
    { id: 'pending', label: 'En attente', icon: Clock, count: applications.filter(app => app.status === 'pending').length },
    { id: 'approved', label: 'Approuvées', icon: CheckCircle, count: applications.filter(app => app.status === 'approved').length },
    { id: 'rejected', label: 'Rejetées', icon: XCircle, count: applications.filter(app => app.status === 'rejected').length },
    { id: 'all', label: 'Toutes', icon: Users, count: applications.length }
  ];

  const stats = [
    { label: 'Demandes totales', value: applications.length.toString(), icon: FileText, color: 'bg-blue-500' },
    { label: 'En attente', value: applications.filter(app => app.status === 'pending').length.toString(), icon: Clock, color: 'bg-yellow-500' },
    { label: 'Approuvées', value: applications.filter(app => app.status === 'approved').length.toString(), icon: CheckCircle, color: 'bg-green-500' },
    { label: 'Rejetées', value: applications.filter(app => app.status === 'rejected').length.toString(), icon: XCircle, color: 'bg-red-500' }
  ];

  useEffect(() => {
    loadApplications();
  }, []);

  const loadApplications = () => {
    // Mock data - remplacez par vos vraies données
    const mockApplications: RetailerApplication[] = [
      {
        id: '1',
        company_name: 'Mobilier Design Paris',
        email: 'contact@mobilierdesign.fr',
        first_name: 'Jean',
        last_name: 'Martin',
        phone: '01 42 34 56 78',
        address: '123 Rue de Rivoli',
        city: 'Paris',
        postal_code: '75001',
        siret: '12345678901234',
        position: 'Directeur Commercial',
        plan: 'professional',
        proposed_subdomain: 'mobilier-design-paris',
        status: 'pending',
        submitted_at: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString()
      },
      {
        id: '2',
        company_name: 'Déco Contemporain',
        email: 'info@decocontemporain.com',
        first_name: 'Sophie',
        last_name: 'Laurent',
        phone: '04 78 90 12 34',
        address: '456 Avenue de la République',
        city: 'Lyon',
        postal_code: '69003',
        siret: '98765432109876',
        position: 'Responsable E-commerce',
        plan: 'enterprise',
        proposed_subdomain: 'deco-contemporain',
        status: 'approved',
        submitted_at: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
        processed_at: new Date(Date.now() - 12 * 60 * 60 * 1000).toISOString(),
        processed_by: 'Super Admin'
      },
      {
        id: '3',
        company_name: 'Meubles Lyon',
        email: 'contact@meubleslyon.fr',
        first_name: 'Pierre',
        last_name: 'Dubois',
        phone: '04 72 11 22 33',
        address: '789 Cours Lafayette',
        city: 'Lyon',
        postal_code: '69006',
        siret: '11223344556677',
        position: 'Gérant',
        plan: 'starter',
        proposed_subdomain: 'meubles-lyon',
        status: 'rejected',
        submitted_at: new Date(Date.now() - 48 * 60 * 60 * 1000).toISOString(),
        processed_at: new Date(Date.now() - 36 * 60 * 60 * 1000).toISOString(),
        processed_by: 'Super Admin',
        rejection_reason: 'Document Kbis manquant'
      }
    ];

    setApplications(mockApplications);
    setLoading(false);
  };

  const handleApproveApplication = (applicationId: string) => {
    if (confirm('Approuver cette demande de revendeur ?')) {
      setApplications(prev => prev.map(app => 
        app.id === applicationId 
          ? { 
              ...app, 
              status: 'approved', 
              processed_at: new Date().toISOString(),
              processed_by: 'Super Admin'
            }
          : app
      ));
    }
  };

  const handleRejectApplication = (applicationId: string) => {
    const reason = prompt('Raison du rejet :');
    if (reason) {
      setApplications(prev => prev.map(app => 
        app.id === applicationId 
          ? { 
              ...app, 
              status: 'rejected', 
              processed_at: new Date().toISOString(),
              processed_by: 'Super Admin',
              rejection_reason: reason
            }
          : app
      ));
    }
  };

  const filteredApplications = applications.filter(app => {
    const matchesTab = activeTab === 'all' || app.status === activeTab;
    const matchesSearch = searchTerm === '' || 
      app.company_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      app.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      app.first_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      app.last_name.toLowerCase().includes(searchTerm.toLowerCase());
    
    return matchesTab && matchesSearch;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-500/20 text-yellow-300';
      case 'approved': return 'bg-green-500/20 text-green-300';
      case 'rejected': return 'bg-red-500/20 text-red-300';
      default: return 'bg-gray-500/20 text-gray-300';
    }
  };

  const getPlanColor = (plan: string) => {
    switch (plan) {
      case 'starter': return 'bg-blue-500/20 text-blue-300';
      case 'professional': return 'bg-purple-500/20 text-purple-300';
      case 'enterprise': return 'bg-orange-500/20 text-orange-300';
      default: return 'bg-gray-500/20 text-gray-300';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-purple-900 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-cyan-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-white text-lg">Chargement Super Admin...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-purple-900">
      {/* Header */}
      <header className="bg-black/20 backdrop-blur-xl border-b border-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-gradient-to-br from-red-500 to-pink-600 rounded-2xl flex items-center justify-center">
                <Shield className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-white">Super Admin OmnIA</h1>
                <p className="text-red-300">Gestion des demandes revendeurs</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div className="text-right">
                <p className="text-white font-semibold">Super Admin</p>
                <p className="text-red-300 text-sm">superadmin@omnia.sale</p>
              </div>
              <a href="/" className="flex items-center gap-2 text-red-400 hover:text-red-300 transition-colors">
                <ArrowLeft className="w-4 h-4" />
                Retour accueil
              </a>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {stats.map((stat, index) => {
            const Icon = stat.icon;
            return (
              <div key={index} className="bg-white/10 backdrop-blur-xl rounded-2xl p-6 border border-white/20">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-300 text-sm">{stat.label}</p>
                    <p className="text-3xl font-bold text-white">{stat.value}</p>
                  </div>
                  <div className={`w-12 h-12 ${stat.color} rounded-xl flex items-center justify-center`}>
                    <Icon className="w-6 h-6 text-white" />
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Navigation Tabs */}
        <div className="bg-white/10 backdrop-blur-xl rounded-2xl p-2 border border-white/20 mb-8">
          <div className="flex space-x-2">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-2 px-6 py-3 rounded-xl transition-all ${
                    activeTab === tab.id
                      ? 'bg-red-500 text-white'
                      : 'text-gray-400 hover:text-white hover:bg-white/10'
                  }`}
                >
                  <Icon className="w-5 h-5" />
                  <span className="font-medium">{tab.label}</span>
                  {tab.count > 0 && (
                    <span className="bg-white/20 text-white px-2 py-1 rounded-full text-xs">
                      {tab.count}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Search Bar */}
        <div className="bg-white/10 backdrop-blur-xl rounded-2xl p-6 border border-white/20 mb-8">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Rechercher par entreprise, email, nom..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-3 bg-black/40 border border-gray-600 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:border-red-400 focus:ring-2 focus:ring-red-400/30"
            />
          </div>
        </div>

        {/* Applications Table */}
        <div className="bg-white/10 backdrop-blur-xl rounded-2xl border border-white/20 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-black/20">
                <tr>
                  <th className="text-left p-4 text-red-300 font-semibold">Entreprise</th>
                  <th className="text-left p-4 text-red-300 font-semibold">Contact</th>
                  <th className="text-left p-4 text-red-300 font-semibold">Plan</th>
                  <th className="text-left p-4 text-red-300 font-semibold">Statut</th>
                  <th className="text-left p-4 text-red-300 font-semibold">Date</th>
                  <th className="text-left p-4 text-red-300 font-semibold">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredApplications.map((application) => (
                  <tr key={application.id} className="border-b border-white/10 hover:bg-white/5">
                    <td className="p-4">
                      <div>
                        <div className="font-semibold text-white">{application.company_name}</div>
                        <div className="text-gray-400 text-sm">{application.proposed_subdomain}.omnia.sale</div>
                        <div className="text-gray-500 text-xs">SIRET: {application.siret}</div>
                      </div>
                    </td>
                    <td className="p-4">
                      <div>
                        <div className="text-white">{application.first_name} {application.last_name}</div>
                        <div className="text-gray-400 text-sm">{application.email}</div>
                        <div className="text-gray-500 text-xs">{application.phone}</div>
                        <div className="text-gray-500 text-xs">{application.position}</div>
                      </div>
                    </td>
                    <td className="p-4">
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${getPlanColor(application.plan)}`}>
                        {application.plan}
                      </span>
                    </td>
                    <td className="p-4">
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(application.status)}`}>
                        {application.status === 'pending' ? 'En attente' :
                         application.status === 'approved' ? 'Approuvée' : 'Rejetée'}
                      </span>
                    </td>
                    <td className="p-4">
                      <div className="text-white text-sm">
                        {new Date(application.submitted_at).toLocaleDateString('fr-FR')}
                      </div>
                      <div className="text-gray-400 text-xs">
                        {new Date(application.submitted_at).toLocaleTimeString('fr-FR')}
                      </div>
                    </td>
                    <td className="p-4">
                      <div className="flex gap-2">
                        <button
                          onClick={() => {
                            setSelectedApplication(application);
                            setShowDetailModal(true);
                          }}
                          className="text-blue-400 hover:text-blue-300 p-1"
                          title="Voir détails"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        
                        {application.status === 'pending' && (
                          <>
                            <button
                              onClick={() => handleApproveApplication(application.id)}
                              className="text-green-400 hover:text-green-300 p-1"
                              title="Approuver"
                            >
                              <CheckCircle className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleRejectApplication(application.id)}
                              className="text-red-400 hover:text-red-300 p-1"
                              title="Rejeter"
                            >
                              <XCircle className="w-4 h-4" />
                            </button>
                          </>
                        )}
                        
                        <button
                          className="text-purple-400 hover:text-purple-300 p-1"
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

        {/* Empty State */}
        {filteredApplications.length === 0 && (
          <div className="text-center py-20">
            <Users className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-bold text-white mb-2">Aucune demande trouvée</h3>
            <p className="text-gray-400">
              {searchTerm ? 'Aucune demande ne correspond à votre recherche.' : 'Aucune demande de revendeur pour le moment.'}
            </p>
          </div>
        )}
      </div>

      {/* Detail Modal */}
      {showDetailModal && selectedApplication && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-800/95 backdrop-blur-xl rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto border border-slate-600/50">
            <div className="flex items-center justify-between p-6 border-b border-slate-600/50">
              <h2 className="text-2xl font-bold text-white">Détails de la demande</h2>
              <button
                onClick={() => setShowDetailModal(false)}
                className="text-gray-400 hover:text-white transition-colors"
              >
                <XCircle className="w-6 h-6" />
              </button>
            </div>

            <div className="p-6 space-y-6">
              {/* Informations entreprise */}
              <div className="bg-black/20 rounded-xl p-4">
                <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                  <Building className="w-5 h-5 text-blue-400" />
                  Informations entreprise
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-gray-300">Entreprise:</span>
                    <div className="text-white font-medium">{selectedApplication.company_name}</div>
                  </div>
                  <div>
                    <span className="text-gray-300">SIRET:</span>
                    <div className="text-white font-medium">{selectedApplication.siret}</div>
                  </div>
                  <div>
                    <span className="text-gray-300">Adresse:</span>
                    <div className="text-white font-medium">
                      {selectedApplication.address}<br />
                      {selectedApplication.postal_code} {selectedApplication.city}
                    </div>
                  </div>
                  <div>
                    <span className="text-gray-300">Plan choisi:</span>
                    <div className={`inline-block px-2 py-1 rounded text-xs font-medium ${getPlanColor(selectedApplication.plan)}`}>
                      {selectedApplication.plan}
                    </div>
                  </div>
                </div>
              </div>

              {/* Contact */}
              <div className="bg-black/20 rounded-xl p-4">
                <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                  <User className="w-5 h-5 text-green-400" />
                  Contact responsable
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-gray-300">Nom:</span>
                    <div className="text-white font-medium">{selectedApplication.first_name} {selectedApplication.last_name}</div>
                  </div>
                  <div>
                    <span className="text-gray-300">Fonction:</span>
                    <div className="text-white font-medium">{selectedApplication.position}</div>
                  </div>
                  <div>
                    <span className="text-gray-300">Email:</span>
                    <div className="text-white font-medium">{selectedApplication.email}</div>
                  </div>
                  <div>
                    <span className="text-gray-300">Téléphone:</span>
                    <div className="text-white font-medium">{selectedApplication.phone}</div>
                  </div>
                </div>
              </div>

              {/* Statut */}
              <div className="bg-black/20 rounded-xl p-4">
                <h3 className="text-lg font-bold text-white mb-4">Statut de traitement</h3>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-gray-300">Statut actuel:</span>
                    <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(selectedApplication.status)}`}>
                      {selectedApplication.status === 'pending' ? 'En attente' :
                       selectedApplication.status === 'approved' ? 'Approuvée' : 'Rejetée'}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-300">Soumise le:</span>
                    <span className="text-white">{new Date(selectedApplication.submitted_at).toLocaleString('fr-FR')}</span>
                  </div>
                  {selectedApplication.processed_at && (
                    <div className="flex items-center justify-between">
                      <span className="text-gray-300">Traitée le:</span>
                      <span className="text-white">{new Date(selectedApplication.processed_at).toLocaleString('fr-FR')}</span>
                    </div>
                  )}
                  {selectedApplication.processed_by && (
                    <div className="flex items-center justify-between">
                      <span className="text-gray-300">Traitée par:</span>
                      <span className="text-white">{selectedApplication.processed_by}</span>
                    </div>
                  )}
                  {selectedApplication.rejection_reason && (
                    <div>
                      <span className="text-gray-300">Raison du rejet:</span>
                      <div className="text-red-300 mt-1">{selectedApplication.rejection_reason}</div>
                    </div>
                  )}
                </div>
              </div>

              {/* Actions */}
              <div className="flex justify-between pt-6 border-t border-slate-600/50">
                <button
                  onClick={() => setShowDetailModal(false)}
                  className="bg-gray-600 hover:bg-gray-700 text-white px-6 py-3 rounded-xl transition-all"
                >
                  Fermer
                </button>
                
                {selectedApplication.status === 'pending' && (
                  <div className="flex gap-3">
                    <button
                      onClick={() => {
                        handleRejectApplication(selectedApplication.id);
                        setShowDetailModal(false);
                      }}
                      className="bg-red-600 hover:bg-red-700 text-white px-6 py-3 rounded-xl transition-all flex items-center gap-2"
                    >
                      <XCircle className="w-4 h-4" />
                      Rejeter
                    </button>
                    <button
                      onClick={() => {
                        handleApproveApplication(selectedApplication.id);
                        setShowDetailModal(false);
                      }}
                      className="bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-xl transition-all flex items-center gap-2"
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