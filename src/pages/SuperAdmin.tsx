import React from 'react';
import { Shield, Users, Clock, CheckCircle, XCircle, Building, Mail, Phone, MapPin, Calendar, User, Briefcase, Globe, CreditCard } from 'lucide-react';

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
}

interface SuperAdminProps {
  onLogout: () => void;
  pendingApplications: Application[];
  onValidateApplication: (applicationId: string, approved: boolean) => void;
}

export function SuperAdmin({ onLogout, pendingApplications, onValidateApplication }: SuperAdminProps) {
  const handleApprove = (applicationId: string) => {
    onValidateApplication(applicationId, true);
  };

  const handleReject = (applicationId: string) => {
    onValidateApplication(applicationId, false);
  };

  const getPlanColor = (plan: string) => {
    switch (plan) {
      case 'starter': return 'bg-green-100 text-green-800';
      case 'professional': return 'bg-blue-100 text-blue-800';
      case 'enterprise': return 'bg-purple-100 text-purple-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getPlanPrice = (plan: string) => {
    switch (plan) {
      case 'starter': return '49€/mois';
      case 'professional': return '149€/mois';
      case 'enterprise': return '299€/mois';
      default: return 'N/A';
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-3">
              <Shield className="w-8 h-8 text-indigo-600" />
              <div>
                <h1 className="text-xl font-bold text-gray-900">Super Admin</h1>
                <p className="text-sm text-gray-500">Gestion des demandes d'inscription</p>
              </div>
            </div>
            <button
              onClick={onLogout}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              Déconnexion
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <Clock className="w-8 h-8 text-yellow-500" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">En attente</p>
                <p className="text-2xl font-bold text-gray-900">{pendingApplications.length}</p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <CheckCircle className="w-8 h-8 text-green-500" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Approuvées</p>
                <p className="text-2xl font-bold text-gray-900">0</p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <XCircle className="w-8 h-8 text-red-500" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Rejetées</p>
                <p className="text-2xl font-bold text-gray-900">0</p>
              </div>
            </div>
          </div>
        </div>

        {/* Applications List */}
        <div className="bg-white shadow rounded-lg">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-medium text-gray-900 flex items-center">
              <Users className="w-5 h-5 mr-2" />
              Demandes d'inscription ({pendingApplications.length})
            </h2>
          </div>

          {pendingApplications.length === 0 ? (
            <div className="p-12 text-center">
              <Users className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">Aucune demande en attente</h3>
              <p className="text-gray-500">Les nouvelles demandes d'inscription apparaîtront ici.</p>
            </div>
          ) : (
            <div className="divide-y divide-gray-200">
              {pendingApplications.map((application) => (
                <div key={application.id} className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      {/* Header */}
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center space-x-3">
                          <Building className="w-6 h-6 text-indigo-600" />
                          <div>
                            <h3 className="text-lg font-semibold text-gray-900">{application.companyName}</h3>
                            <p className="text-sm text-gray-500">Demande reçue le {application.submittedDate} à {application.submittedTime}</p>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          <span className={`px-3 py-1 rounded-full text-sm font-medium ${getPlanColor(application.plan)}`}>
                            {application.plan.charAt(0).toUpperCase() + application.plan.slice(1)} - {getPlanPrice(application.plan)}
                          </span>
                        </div>
                      </div>

                      {/* Details Grid */}
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
                        <div className="flex items-center space-x-2">
                          <User className="w-4 h-4 text-gray-400" />
                          <span className="text-sm text-gray-600">{application.firstName} {application.lastName}</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Mail className="w-4 h-4 text-gray-400" />
                          <span className="text-sm text-gray-600">{application.email}</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Phone className="w-4 h-4 text-gray-400" />
                          <span className="text-sm text-gray-600">{application.phone}</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <MapPin className="w-4 h-4 text-gray-400" />
                          <span className="text-sm text-gray-600">{application.address}, {application.city} {application.postalCode}</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Briefcase className="w-4 h-4 text-gray-400" />
                          <span className="text-sm text-gray-600">{application.position}</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <CreditCard className="w-4 h-4 text-gray-400" />
                          <span className="text-sm text-gray-600">SIRET: {application.siret}</span>
                        </div>
                      </div>

                      {/* Subdomain */}
                      <div className="bg-gray-50 rounded-lg p-4 mb-4">
                        <div className="flex items-center space-x-2">
                          <Globe className="w-4 h-4 text-gray-400" />
                          <span className="text-sm font-medium text-gray-700">Sous-domaine proposé:</span>
                          <code className="text-sm bg-white px-2 py-1 rounded border">{application.proposedSubdomain}.omnia.sale</code>
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="flex space-x-3">
                        <button
                          onClick={() => handleApprove(application.id)}
                          className="flex items-center px-4 py-2 bg-green-600 text-white text-sm font-medium rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
                        >
                          <CheckCircle className="w-4 h-4 mr-2" />
                          Approuver
                        </button>
                        <button
                          onClick={() => handleReject(application.id)}
                          className="flex items-center px-4 py-2 bg-red-600 text-white text-sm font-medium rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                        >
                          <XCircle className="w-4 h-4 mr-2" />
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
      </main>
    </div>
  );
}