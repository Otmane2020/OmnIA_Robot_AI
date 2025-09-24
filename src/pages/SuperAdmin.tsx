import React, { useState } from 'react';
import { Shield, Users, Clock, CheckCircle, XCircle, Building, Mail, Phone, MapPin, Calendar, User, Briefcase, Globe, CreditCard, Eye, FileText, Download, Search, Filter } from 'lucide-react';
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
  plan: string;
  proposedSubdomain: string;
  submittedAt: string;
  submittedDate: string;
  submittedTime: string;
  status: string;
  country?: string;
  kbisFile?: File;
}

interface SuperAdminProps {
  onLogout: () => void;
  pendingApplications: Application[];
  onValidateApplication: (applicationId: string, approved: boolean) => void;
}

export const SuperAdmin: React.FC<SuperAdminProps> = ({ onLogout, pendingApplications, onValidateApplication }) => {
  const [selectedApplication, setSelectedApplication] = useState<Application | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterPlan, setFilterPlan] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');

  const handleApprove = (applicationId: string) => {
    if (confirm('Approuver cette demande d\'inscription ?')) {
      onValidateApplication(applicationId, true);
    }
  };

  const handleReject = (applicationId: string) => {
    const reason = prompt('Raison du rejet (optionnel) :');
    if (reason !== null) { // null = annulé, string vide = OK
      onValidateApplication(applicationId, false);
    }
  };

  const getPlanColor = (plan: string) => {
    switch (plan) {
      case 'starter': return 'bg-green-500/20 text-green-300';
      case 'professional': return 'bg-blue-500/20 text-blue-300';
      case 'enterprise': return 'bg-purple-500/20 text-purple-300';
      default: return 'bg-gray-500/20 text-gray-300';
    }
  };

  const getPlanPrice = (plan: string) => {
    switch (plan) {
      case 'starter': return '29€/mois';
      case 'professional': return '79€/mois';
      case 'enterprise': return '199€/mois';
      default: return 'N/A';
    }
  };

  const getCountryFlag = (countryCode: string) => {
    const flags: { [key: string]: string } = {
      'FR': '🇫🇷',
      'BE': '🇧🇪',
      'CH': '🇨🇭',
      'LU': '🇱🇺',
      'CA': '🇨🇦'
    };
    return flags[countryCode] || '🌍';
  };

  const filteredApplications = pendingApplications.filter(app => {
    const matchesSearch = searchTerm === '' || 
      app.companyName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      app.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      app.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      app.lastName.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesPlan = filterPlan === 'all' || app.plan === filterPlan;
    const matchesStatus = filterStatus === 'all' || app.status === filterStatus;
    
    return matchesSearch && matchesPlan && matchesStatus;
  });

  const stats = {
    pending: pendingApplications.filter(app => app.status === 'pending').length,
    approved: pendingApplications.filter(app => app.status === 'approved').length,
    rejected: pendingApplications.filter(app => app.status === 'rejected').length
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
              <div className="w-12 h-12 bg-gradient-to-br from-red-500 to-pink-600 rounded-2xl flex items-center justify-center shadow-2xl">
                <Shield className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-white">Super Admin OmnIA</h1>
                <p className="text-red-300">Gestion des demandes d'inscription</p>
              </div>
            </div>
            <button
              onClick={onLogout}
              className="bg-red-600 hover:bg-red-700 text-white px-6 py-3 rounded-xl font-semibold transition-all flex items-center gap-2"
            >
              <Shield className="w-4 h-4" />
              Déconnexion
            </button>
          </div>
        </div>
      </header>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-yellow-600/20 backdrop-blur-xl rounded-2xl p-6 border border-yellow-500/30">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-yellow-200 text-sm mb-1">En attente</p>
                <p className="text-3xl font-bold text-white mb-1">{stats.pending}</p>
                <p className="text-yellow-300 text-sm">Validation requise</p>
              </div>
              <Clock className="w-10 h-10 text-yellow-400" />
            </div>
          </div>
          
          <div className="bg-green-600/20 backdrop-blur-xl rounded-2xl p-6 border border-green-500/30">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-green-200 text-sm mb-1">Approuvées</p>
                <p className="text-3xl font-bold text-white mb-1">{stats.approved}</p>
                <p className="text-green-300 text-sm">Comptes actifs</p>
              </div>
              <CheckCircle className="w-10 h-10 text-green-400" />
            </div>
          </div>
          
          <div className="bg-red-600/20 backdrop-blur-xl rounded-2xl p-6 border border-red-500/30">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-red-200 text-sm mb-1">Rejetées</p>
                <p className="text-3xl font-bold text-white mb-1">{stats.rejected}</p>
                <p className="text-red-300 text-sm">Informations manquantes</p>
              </div>
              <XCircle className="w-10 h-10 text-red-400" />
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white/10 backdrop-blur-xl rounded-2xl p-6 border border-white/20 mb-8">
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
              <option value="pending">En attente</option>
              <option value="approved">Approuvées</option>
              <option value="rejected">Rejetées</option>
            </select>
          </div>
        </div>

        {/* Applications List */}
        <div className="bg-white/10 backdrop-blur-xl rounded-2xl border border-white/20 overflow-hidden">
          <div className="p-6 border-b border-white/10">
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              <Users className="w-5 h-5" />
              Demandes d'inscription ({filteredApplications.length})
            </h2>
          </div>

          {filteredApplications.length === 0 ? (
            <div className="p-12 text-center">
              <Users className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-xl font-bold text-white mb-2">
                {searchTerm || filterPlan !== 'all' || filterStatus !== 'all' 
                  ? 'Aucune demande correspondante' 
                  : 'Aucune demande en attente'}
              </h3>
              <p className="text-gray-400">
                {searchTerm || filterPlan !== 'all' || filterStatus !== 'all'
                  ? 'Modifiez vos critères de recherche.'
                  : 'Les nouvelles demandes d\'inscription apparaîtront ici.'}
              </p>
            </div>
          ) : (
            <div className="divide-y divide-white/10">
              {filteredApplications.map((application) => (
                <div key={application.id} className="p-6 hover:bg-white/5 transition-all">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      {/* Header */}
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center space-x-3">
                          <div className="w-12 h-12 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-2xl flex items-center justify-center">
                            <Building className="w-6 h-6 text-white" />
                          </div>
                          <div>
                            <h3 className="text-xl font-bold text-white flex items-center gap-2">
                              {getCountryFlag(application.country || 'FR')}
                              {application.companyName}
                            </h3>
                            <p className="text-gray-400">
                              Demande reçue le {application.submittedDate} à {application.submittedTime}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center space-x-3">
                          <span className={`px-3 py-1 rounded-full text-sm font-medium ${getPlanColor(application.plan)}`}>
                            {application.plan.charAt(0).toUpperCase() + application.plan.slice(1)} - {getPlanPrice(application.plan)}
                          </span>
                          <span className="bg-yellow-500/20 text-yellow-300 px-3 py-1 rounded-full text-sm font-medium">
                            {application.status}
                          </span>
                        </div>
                      </div>

                      {/* Details Grid */}
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
                        <div className="bg-black/20 rounded-xl p-3">
                          <div className="flex items-center space-x-2 mb-2">
                            <User className="w-4 h-4 text-cyan-400" />
                            <span className="text-cyan-300 font-semibold text-sm">Contact</span>
                          </div>
                          <div className="text-white font-medium">{application.firstName} {application.lastName}</div>
                          <div className="text-gray-400 text-sm">{application.position}</div>
                        </div>
                        
                        <div className="bg-black/20 rounded-xl p-3">
                          <div className="flex items-center space-x-2 mb-2">
                            <Mail className="w-4 h-4 text-green-400" />
                            <span className="text-green-300 font-semibold text-sm">Email</span>
                          </div>
                          <div className="text-white font-medium">{application.email}</div>
                          <div className="text-gray-400 text-sm">
                            <Phone className="w-3 h-3 inline mr-1" />
                            {application.phone}
                          </div>
                        </div>
                        
                        <div className="bg-black/20 rounded-xl p-3">
                          <div className="flex items-center space-x-2 mb-2">
                            <MapPin className="w-4 h-4 text-purple-400" />
                            <span className="text-purple-300 font-semibold text-sm">Adresse</span>
                          </div>
                          <div className="text-white font-medium">{application.city}</div>
                          <div className="text-gray-400 text-sm">{application.postalCode}</div>
                        </div>
                        
                        <div className="bg-black/20 rounded-xl p-3">
                          <div className="flex items-center space-x-2 mb-2">
                            <CreditCard className="w-4 h-4 text-orange-400" />
                            <span className="text-orange-300 font-semibold text-sm">SIRET</span>
                          </div>
                          <div className="text-white font-mono">{application.siret}</div>
                        </div>
                        
                        <div className="bg-black/20 rounded-xl p-3">
                          <div className="flex items-center space-x-2 mb-2">
                            <Globe className="w-4 h-4 text-blue-400" />
                            <span className="text-blue-300 font-semibold text-sm">Sous-domaine</span>
                          </div>
                          <div className="text-white font-medium">{application.proposedSubdomain}.omnia.sale</div>
                        </div>
                        
                        <div className="bg-black/20 rounded-xl p-3">
                          <div className="flex items-center space-x-2 mb-2">
                            <Calendar className="w-4 h-4 text-pink-400" />
                            <span className="text-pink-300 font-semibold text-sm">Soumission</span>
                          </div>
                          <div className="text-white font-medium">{application.submittedDate}</div>
                          <div className="text-gray-400 text-sm">{application.submittedTime}</div>
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="flex space-x-3">
                        <button
                          onClick={() => handleApprove(application.id)}
                          className="flex items-center px-6 py-3 bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-400 hover:to-emerald-500 text-white font-semibold rounded-xl transition-all shadow-lg hover:shadow-green-500/50"
                        >
                          <CheckCircle className="w-4 h-4 mr-2" />
                          Approuver
                        </button>
                        <button
                          onClick={() => handleReject(application.id)}
                          className="flex items-center px-6 py-3 bg-gradient-to-r from-red-500 to-red-600 hover:from-red-400 hover:to-red-500 text-white font-semibold rounded-xl transition-all shadow-lg hover:shadow-red-500/50"
                        >
                          <XCircle className="w-4 h-4 mr-2" />
                          Rejeter
                        </button>
                        <button
                          onClick={() => setSelectedApplication(application)}
                          className="flex items-center px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl transition-all"
                        >
                          <Eye className="w-4 h-4 mr-2" />
                          Détails
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Modal détails application */}
        {selectedApplication && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-slate-800/95 backdrop-blur-xl rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto border border-slate-600/50">
              <div className="flex items-center justify-between p-6 border-b border-slate-600/50">
                <h2 className="text-2xl font-bold text-white">Détails de la demande</h2>
                <button
                  onClick={() => setSelectedApplication(null)}
                  className="text-gray-400 hover:text-white transition-colors"
                >
                  ×
                </button>
              </div>
              
              <div className="p-6 space-y-6">
                <div className="bg-black/20 rounded-xl p-4">
                  <h3 className="font-bold text-white mb-3">🏢 Informations entreprise</h3>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-300">Entreprise :</span>
                      <span className="text-white font-semibold">{selectedApplication.companyName}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-300">SIRET :</span>
                      <span className="text-white font-mono">{selectedApplication.siret}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-300">Adresse :</span>
                      <span className="text-white">{selectedApplication.address}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-300">Ville :</span>
                      <span className="text-white">{selectedApplication.city} {selectedApplication.postalCode}</span>
                    </div>
                  </div>
                </div>
                
                <div className="bg-black/20 rounded-xl p-4">
                  <h3 className="font-bold text-white mb-3">👤 Contact responsable</h3>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-300">Nom :</span>
                      <span className="text-white">{selectedApplication.firstName} {selectedApplication.lastName}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-300">Email :</span>
                      <span className="text-white">{selectedApplication.email}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-300">Téléphone :</span>
                      <span className="text-white">{selectedApplication.phone}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-300">Fonction :</span>
                      <span className="text-white">{selectedApplication.position}</span>
                    </div>
                  </div>
                </div>
                
                <div className="flex gap-3">
                  <button
                    onClick={() => {
                      handleApprove(selectedApplication.id);
                      setSelectedApplication(null);
                    }}
                    className="flex-1 bg-green-600 hover:bg-green-700 text-white py-3 rounded-xl font-semibold transition-all"
                  >
                    ✅ Approuver
                  </button>
                  <button
                    onClick={() => {
                      handleReject(selectedApplication.id);
                      setSelectedApplication(null);
                    }}
                    className="flex-1 bg-red-600 hover:bg-red-700 text-white py-3 rounded-xl font-semibold transition-all"
                  >
                    ❌ Rejeter
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}