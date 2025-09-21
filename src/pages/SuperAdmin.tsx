import React, { useState, useEffect } from 'react';
import { 
  Users, CheckCircle, AlertCircle, Eye, Search, Filter,
  Building, Mail, Phone, MapPin, Calendar, FileText, 
  Globe, Settings, LogOut, Bell, X, ExternalLink,
  Loader2, Trash2, UserCheck, UserX, Clock, Star,
  BarChart3, Target, TrendingUp, DollarSign
} from 'lucide-react';
import { Logo } from '../components/Logo';
import { useNotifications } from '../components/NotificationSystem';

interface SuperAdminProps {
  onLogout: () => void;
  pendingApplications: any[];
  onValidateApplication: (applicationId: string, approved: boolean) => void;
}

interface AdminNotification {
  id: string;
  type: string;
  title: string;
  message: string;
  timestamp: string;
  data: any;
  read?: boolean;
}

export const SuperAdmin: React.FC<SuperAdminProps> = ({ onLogout, pendingApplications, onValidateApplication }) => {
  const [activeTab, setActiveTab] = useState('applications');
  const [selectedApplication, setSelectedApplication] = useState<any>(null);
  const [notifications, setNotifications] = useState<AdminNotification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [showNotifications, setShowNotifications] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const { showSuccess, showError, showInfo } = useNotifications();

  // Charger les notifications admin
  useEffect(() => {
    const loadNotifications = () => {
      try {
        const adminNotifications = JSON.parse(localStorage.getItem('admin_notifications') || '[]');
        setNotifications(adminNotifications);
        setUnreadCount(adminNotifications.filter((n: AdminNotification) => !n.read).length);
      } catch (error) {
        console.error('Erreur chargement notifications:', error);
      }
    };

    loadNotifications();
    
    // Vérifier périodiquement les nouvelles notifications
    const interval = setInterval(loadNotifications, 5000);
    return () => clearInterval(interval);
  }, []);

  const markNotificationAsRead = (notificationId: string) => {
    const updatedNotifications = notifications.map(n => 
      n.id === notificationId ? { ...n, read: true } : n
    );
    setNotifications(updatedNotifications);
    localStorage.setItem('admin_notifications', JSON.stringify(updatedNotifications));
    setUnreadCount(prev => Math.max(0, prev - 1));
  };

  const deleteNotification = (notificationId: string) => {
    const updatedNotifications = notifications.filter(n => n.id !== notificationId);
    setNotifications(updatedNotifications);
    localStorage.setItem('admin_notifications', JSON.stringify(updatedNotifications));
    setUnreadCount(updatedNotifications.filter(n => !n.read).length);
  };

  const handleValidateApplication = (applicationId: string, approved: boolean) => {
    const application = pendingApplications.find(app => app.id === applicationId);
    
    if (approved) {
      // Créer le compte revendeur
      const newRetailer = {
        id: applicationId,
        email: application.email,
        password: application.password,
        companyName: application.companyName,
        subdomain: application.subdomain,
        plan: application.selectedPlan,
        status: 'active',
        contactName: `${application.firstName} ${application.lastName}`,
        phone: application.phone,
        address: application.address,
        city: application.city,
        postalCode: application.postalCode,
        siret: application.siret,
        position: application.position,
        createdAt: new Date().toISOString(),
        validatedAt: new Date().toISOString(),
        lastLogin: null
      };

      // Sauvegarder dans localStorage
      const existingRetailers = JSON.parse(localStorage.getItem('approved_retailers') || '[]');
      localStorage.setItem('approved_retailers', JSON.stringify([...existingRetailers, newRetailer]));

      showSuccess(
        'Revendeur approuvé', 
        `${application.companyName} a été approuvé et peut maintenant se connecter !`,
        [
          {
            label: 'Voir le compte',
            action: () => setSelectedApplication(newRetailer),
            variant: 'primary'
          }
        ]
      );

      console.log('✅ Revendeur approuvé:', newRetailer);
      console.log('📧 Email d\'approbation envoyé à:', application.email);
      console.log('🔑 Identifiants de connexion:', {
        email: application.email,
        password: application.password,
        interface: `https://omnia.sale/admin`,
        subdomain: `https://${application.subdomain}.omnia.sale`
      });
    } else {
      showError('Revendeur rejeté', `La demande de ${application.companyName} a été rejetée.`);
      console.log('❌ Revendeur rejeté:', application.companyName);
      console.log('📧 Email de rejet envoyé à:', application.email);
    }

    // Marquer la notification comme traitée
    const relatedNotification = notifications.find(n => 
      n.data && n.data.email === application.email
    );
    if (relatedNotification) {
      markNotificationAsRead(relatedNotification.id);
    }

    onValidateApplication(applicationId, approved);
  };

  const filteredApplications = pendingApplications.filter(app => {
    const matchesSearch = searchTerm === '' || 
      app.companyName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      app.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      app.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      app.lastName.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesFilter = filterStatus === 'all' || app.status === filterStatus;
    
    return matchesSearch && matchesFilter;
  });

  const renderApplications = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-white">
          Demandes de revendeurs ({pendingApplications.length})
        </h2>
        <div className="flex items-center gap-4">
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
            <option value="approved">Approuvés</option>
            <option value="rejected">Rejetés</option>
          </select>
        </div>
      </div>

      {filteredApplications.length === 0 ? (
        <div className="text-center py-20">
          <Users className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-xl font-bold text-white mb-2">
            {searchTerm || filterStatus !== 'all' ? 'Aucun résultat' : 'Aucune demande en attente'}
          </h3>
          <p className="text-gray-400">
            {searchTerm || filterStatus !== 'all' 
              ? 'Aucune demande ne correspond à vos critères.'
              : 'Les nouvelles demandes de revendeurs apparaîtront ici.'}
          </p>
        </div>
      ) : (
        <div className="grid gap-6">
          {filteredApplications.map((application) => (
            <div key={application.id} className="bg-slate-700/50 backdrop-blur-xl rounded-2xl p-6 border border-slate-600/50 hover:border-cyan-500/50 transition-all">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-12 h-12 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-xl flex items-center justify-center">
                      <Building className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-white">{application.companyName}</h3>
                      <p className="text-cyan-400">{application.email}</p>
                      <p className="text-gray-300 text-sm">
                        {application.firstName} {application.lastName} • {application.position}
                      </p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-4">
                    <div className="bg-black/20 rounded-xl p-3">
                      <div className="flex items-center gap-2 mb-1">
                        <Building className="w-4 h-4 text-blue-400" />
                        <span className="text-blue-300 text-sm font-semibold">Entreprise</span>
                      </div>
                      <div className="text-white text-sm">SIRET: {application.siret}</div>
                      <div className="text-gray-300 text-xs">{application.address}, {application.city}</div>
                    </div>

                    <div className="bg-black/20 rounded-xl p-3">
                      <div className="flex items-center gap-2 mb-1">
                        <Mail className="w-4 h-4 text-green-400" />
                        <span className="text-green-300 text-sm font-semibold">Contact</span>
                      </div>
                      <div className="text-white text-sm">{application.phone}</div>
                      <div className="text-gray-300 text-xs">{application.position}</div>
                    </div>

                    <div className="bg-black/20 rounded-xl p-3">
                      <div className="flex items-center gap-2 mb-1">
                        <Globe className="w-4 h-4 text-purple-400" />
                        <span className="text-purple-300 text-sm font-semibold">Plan & Domaine</span>
                      </div>
                      <div className="text-white text-sm">{application.selectedPlan}</div>
                      <div className="text-gray-300 text-xs">{application.subdomain}.omnia.sale</div>
                    </div>
                  </div>

                  <div className="flex items-center gap-4 text-sm text-gray-400">
                    <span className="flex items-center gap-1">
                      <Calendar className="w-4 h-4" />
                      {application.submittedDate} à {application.submittedTime}
                    </span>
                    <span className="flex items-center gap-1">
                      <Clock className="w-4 h-4" />
                      #{application.id}
                    </span>
                    {application.kbisFile && (
                      <span className="flex items-center gap-1 text-green-400">
                        <FileText className="w-4 h-4" />
                        Kbis fourni
                      </span>
                    )}
                  </div>
                </div>

                <div className="flex flex-col gap-3 ml-4">
                  <button
                    onClick={() => handleValidateApplication(application.id, true)}
                    className="bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-400 hover:to-emerald-500 text-white px-6 py-3 rounded-xl font-semibold transition-all flex items-center gap-2 shadow-lg hover:shadow-green-500/30"
                  >
                    <UserCheck className="w-4 h-4" />
                    Approuver
                  </button>
                  
                  <button
                    onClick={() => setSelectedApplication(application)}
                    className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-xl font-semibold transition-all flex items-center gap-2"
                  >
                    <Eye className="w-4 h-4" />
                    Détails
                  </button>
                  
                  <button
                    onClick={() => handleValidateApplication(application.id, false)}
                    className="bg-red-600 hover:bg-red-700 text-white px-6 py-3 rounded-xl font-semibold transition-all flex items-center gap-2 shadow-lg hover:shadow-red-500/30"
                  >
                    <UserX className="w-4 h-4" />
                    Rejeter
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );

  const renderRevenueOverview = () => (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-white">Vue d'ensemble des revenus</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-green-600/20 backdrop-blur-xl rounded-2xl p-6 border border-green-500/30">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-green-200 text-sm mb-1">MRR Total</p>
              <p className="text-3xl font-bold text-white">€48,200</p>
              <p className="text-green-400 text-sm">+12% ce mois</p>
            </div>
            <DollarSign className="w-10 h-10 text-green-400" />
          </div>
        </div>
        
        <div className="bg-blue-600/20 backdrop-blur-xl rounded-2xl p-6 border border-blue-500/30">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-blue-200 text-sm mb-1">Revendeurs Actifs</p>
              <p className="text-3xl font-bold text-white">127</p>
              <p className="text-green-400 text-sm">+8 ce mois</p>
            </div>
            <Users className="w-10 h-10 text-blue-400" />
          </div>
        </div>
        
        <div className="bg-purple-600/20 backdrop-blur-xl rounded-2xl p-6 border border-purple-500/30">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-purple-200 text-sm mb-1">Conversations</p>
              <p className="text-3xl font-bold text-white">156,789</p>
              <p className="text-green-400 text-sm">+23% ce mois</p>
            </div>
            <BarChart3 className="w-10 h-10 text-purple-400" />
          </div>
        </div>
        
        <div className="bg-orange-600/20 backdrop-blur-xl rounded-2xl p-6 border border-orange-500/30">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-orange-200 text-sm mb-1">Conversion Moy.</p>
              <p className="text-3xl font-bold text-white">42.8%</p>
              <p className="text-green-400 text-sm">+5% ce mois</p>
            </div>
            <Target className="w-10 h-10 text-orange-400" />
          </div>
        </div>
      </div>

      <div className="bg-slate-700/50 backdrop-blur-xl rounded-2xl p-6 border border-slate-600/50">
        <h3 className="text-lg font-bold text-white mb-4">Top Revendeurs par Revenus</h3>
        <div className="space-y-3">
          {[
            { name: 'Decora Home', revenue: 12400, plan: 'enterprise', conversations: 2341 },
            { name: 'Mobilier Design', revenue: 8900, plan: 'professional', conversations: 1876 },
            { name: 'Déco Lyon', revenue: 6700, plan: 'professional', conversations: 1234 },
            { name: 'Meubles Paris', revenue: 4500, plan: 'starter', conversations: 987 }
          ].map((retailer, index) => (
            <div key={index} className="flex items-center justify-between p-4 bg-black/20 rounded-xl">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-full flex items-center justify-center">
                  <span className="text-white font-bold text-sm">{index + 1}</span>
                </div>
                <div>
                  <div className="font-semibold text-white">{retailer.name}</div>
                  <div className="text-gray-300 text-sm">{retailer.plan} • {retailer.conversations} conversations</div>
                </div>
              </div>
              <div className="text-right">
                <div className="text-green-400 font-bold">€{retailer.revenue.toLocaleString()}</div>
                <div className="text-gray-400 text-sm">ce mois</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  const renderNotifications = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-white">
          Notifications ({notifications.length})
        </h2>
        <div className="flex gap-2">
          <button
            onClick={() => {
              const updatedNotifications = notifications.map(n => ({ ...n, read: true }));
              setNotifications(updatedNotifications);
              localStorage.setItem('admin_notifications', JSON.stringify(updatedNotifications));
              setUnreadCount(0);
            }}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-xl text-sm"
          >
            Marquer tout lu
          </button>
          <button
            onClick={() => {
              setNotifications([]);
              localStorage.removeItem('admin_notifications');
              setUnreadCount(0);
            }}
            className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-xl text-sm"
          >
            Effacer tout
          </button>
        </div>
      </div>

      {notifications.length === 0 ? (
        <div className="text-center py-20">
          <Bell className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-xl font-bold text-white mb-2">Aucune notification</h3>
          <p className="text-gray-400">Les notifications apparaîtront ici</p>
        </div>
      ) : (
        <div className="space-y-4">
          {notifications.map((notification) => (
            <div key={notification.id} className={`p-4 rounded-xl border transition-all ${
              notification.read 
                ? 'bg-slate-700/30 border-slate-600/30' 
                : 'bg-blue-500/20 border-blue-400/50'
            }`}>
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <h4 className="font-semibold text-white">{notification.title}</h4>
                    {!notification.read && (
                      <div className="w-2 h-2 bg-blue-400 rounded-full animate-pulse"></div>
                    )}
                  </div>
                  <p className="text-gray-300 mb-2">{notification.message}</p>
                  <div className="text-xs text-gray-400">
                    {new Date(notification.timestamp).toLocaleString('fr-FR')}
                  </div>
                </div>
                
                <div className="flex gap-2">
                  {!notification.read && (
                    <button
                      onClick={() => markNotificationAsRead(notification.id)}
                      className="text-blue-400 hover:text-blue-300 p-1"
                      title="Marquer comme lu"
                    >
                      <CheckCircle className="w-4 h-4" />
                    </button>
                  )}
                  <button
                    onClick={() => deleteNotification(notification.id)}
                    className="text-red-400 hover:text-red-300 p-1"
                    title="Supprimer"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-purple-900">
      {/* Background Effects */}
      <div className="absolute inset-0 opacity-20">
        <div className="absolute top-20 left-20 w-72 h-72 bg-cyan-500/30 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-20 right-20 w-96 h-96 bg-purple-500/20 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '2s' }}></div>
      </div>

      <div className="relative z-10 flex h-screen">
        {/* Sidebar */}
        <div className="w-64 bg-slate-800/90 backdrop-blur-2xl border-r border-slate-700/50 p-6">
          <div className="flex items-center gap-3 mb-8">
            <Logo size="sm" />
            <div>
              <h1 className="text-lg font-bold text-white">Super Admin</h1>
              <p className="text-cyan-300 text-sm">OmnIA.sale</p>
            </div>
          </div>

          <nav className="space-y-2">
            <button
              onClick={() => setActiveTab('applications')}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all text-left ${
                activeTab === 'applications'
                  ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30'
                  : 'text-gray-300 hover:bg-white/10 hover:text-white'
              }`}
            >
              <Users className="w-5 h-5" />
              <span className="font-medium">Demandes revendeurs</span>
              {pendingApplications.length > 0 && (
                <span className="bg-red-500 text-white text-xs px-2 py-1 rounded-full">
                  {pendingApplications.length}
                </span>
              )}
            </button>

            <button
              onClick={() => setActiveTab('notifications')}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all text-left ${
                activeTab === 'notifications'
                  ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30'
                  : 'text-gray-300 hover:bg-white/10 hover:text-white'
              }`}
            >
              <Bell className="w-5 h-5" />
              <span className="font-medium">Notifications</span>
              {unreadCount > 0 && (
                <span className="bg-red-500 text-white text-xs px-2 py-1 rounded-full">
                  {unreadCount}
                </span>
              )}
            </button>

            <button
              onClick={() => setActiveTab('overview')}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all text-left ${
                activeTab === 'overview'
                  ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30'
                  : 'text-gray-300 hover:bg-white/10 hover:text-white'
              }`}
            >
              <BarChart3 className="w-5 h-5" />
              <span className="font-medium">Vue d'ensemble</span>
            </button>
          </nav>

          <div className="absolute bottom-6 left-6 right-6">
            <button
              onClick={onLogout}
              className="w-full bg-red-600 hover:bg-red-700 text-white py-3 rounded-xl font-semibold transition-all flex items-center justify-center gap-2"
            >
              <LogOut className="w-4 h-4" />
              Déconnexion
            </button>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 flex flex-col">
          {/* Header */}
          <div className="bg-slate-800/90 backdrop-blur-xl border-b border-slate-700/50 p-6">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-bold text-white">OmnIA Super Admin</h1>
                <p className="text-gray-300">Gestion plateforme et revendeurs</p>
              </div>
              
              <div className="flex items-center gap-4">
                {/* Notifications Badge */}
                <button
                  onClick={() => setShowNotifications(!showNotifications)}
                  className="relative bg-slate-600 hover:bg-slate-700 text-white p-3 rounded-xl transition-all"
                >
                  <Bell className="w-5 h-5" />
                  {unreadCount > 0 && (
                    <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs w-5 h-5 rounded-full flex items-center justify-center animate-bounce">
                      {unreadCount}
                    </span>
                  )}
                </button>

                <div className="text-right">
                  <div className="text-white font-semibold">Super Admin</div>
                  <div className="text-cyan-400 text-sm">superadmin@omnia.sale</div>
                </div>
              </div>
            </div>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto p-8">
            {activeTab === 'applications' && renderApplications()}
            {activeTab === 'notifications' && renderNotifications()}
            {activeTab === 'overview' && renderRevenueOverview()}
          </div>
        </div>
      </div>

      {/* Modal détails application */}
      {selectedApplication && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-800/95 backdrop-blur-xl rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto border border-slate-600/50">
            <div className="flex items-center justify-between p-6 border-b border-slate-600/50">
              <h2 className="text-xl font-bold text-white">Détails de la demande</h2>
              <button
                onClick={() => setSelectedApplication(null)}
                className="text-gray-400 hover:text-white"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="p-6 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-black/20 rounded-xl p-4">
                  <h3 className="font-semibold text-white mb-3">🏢 Informations entreprise</h3>
                  <div className="space-y-2 text-sm">
                    <div><span className="text-gray-400">Nom :</span> <span className="text-white">{selectedApplication.companyName}</span></div>
                    <div><span className="text-gray-400">SIRET :</span> <span className="text-white">{selectedApplication.siret}</span></div>
                    <div><span className="text-gray-400">Adresse :</span> <span className="text-white">{selectedApplication.address}</span></div>
                    <div><span className="text-gray-400">Ville :</span> <span className="text-white">{selectedApplication.city} {selectedApplication.postalCode}</span></div>
                    <div><span className="text-gray-400">Pays :</span> <span className="text-white">{selectedApplication.country}</span></div>
                  </div>
                </div>

                <div className="bg-black/20 rounded-xl p-4">
                  <h3 className="font-semibold text-white mb-3">👤 Contact responsable</h3>
                  <div className="space-y-2 text-sm">
                    <div><span className="text-gray-400">Nom :</span> <span className="text-white">{selectedApplication.firstName} {selectedApplication.lastName}</span></div>
                    <div><span className="text-gray-400">Email :</span> <span className="text-white">{selectedApplication.email}</span></div>
                    <div><span className="text-gray-400">Téléphone :</span> <span className="text-white">{selectedApplication.phone}</span></div>
                    <div><span className="text-gray-400">Fonction :</span> <span className="text-white">{selectedApplication.position}</span></div>
                  </div>
                </div>

                <div className="bg-black/20 rounded-xl p-4">
                  <h3 className="font-semibold text-white mb-3">💳 Plan et domaine</h3>
                  <div className="space-y-2 text-sm">
                    <div><span className="text-gray-400">Plan :</span> <span className="text-white">{selectedApplication.selectedPlan}</span></div>
                    <div><span className="text-gray-400">Sous-domaine :</span> <span className="text-cyan-400">{selectedApplication.subdomain}.omnia.sale</span></div>
                  </div>
                </div>

                <div className="bg-black/20 rounded-xl p-4">
                  <h3 className="font-semibold text-white mb-3">📅 Informations système</h3>
                  <div className="space-y-2 text-sm">
                    <div><span className="text-gray-400">Soumis le :</span> <span className="text-white">{selectedApplication.submittedDate}</span></div>
                    <div><span className="text-gray-400">Heure :</span> <span className="text-white">{selectedApplication.submittedTime}</span></div>
                    <div><span className="text-gray-400">Référence :</span> <span className="text-white">#{selectedApplication.id}</span></div>
                    <div><span className="text-gray-400">Kbis :</span> <span className={selectedApplication.kbisFile ? "text-green-400" : "text-yellow-400"}>{selectedApplication.kbisFile ? "✅ Fourni" : "⚠️ Non fourni"}</span></div>
                  </div>
                </div>
              </div>

              <div className="flex gap-4">
                <button
                  onClick={() => {
                    handleValidateApplication(selectedApplication.id, true);
                    setSelectedApplication(null);
                  }}
                  className="flex-1 bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-400 hover:to-emerald-500 text-white py-3 rounded-xl font-semibold transition-all flex items-center justify-center gap-2"
                >
                  <UserCheck className="w-4 h-4" />
                  Approuver
                </button>
                
                <button
                  onClick={() => {
                    handleValidateApplication(selectedApplication.id, false);
                    setSelectedApplication(null);
                  }}
                  className="flex-1 bg-red-600 hover:bg-red-700 text-white py-3 rounded-xl font-semibold transition-all flex items-center justify-center gap-2"
                >
                  <UserX className="w-4 h-4" />
                  Rejeter
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Dropdown notifications */}
        {showNotifications && (
          <div className="absolute top-20 right-4 w-96 bg-slate-800/95 backdrop-blur-xl rounded-xl border border-slate-600/50 shadow-2xl z-50 max-h-96 overflow-y-auto">
            <div className="p-4 border-b border-slate-600/50">
              <div className="flex items-center justify-between">
                <h3 className="font-semibold text-white">Notifications ({unreadCount} non lues)</h3>
                <button
                  onClick={() => setShowNotifications(false)}
                  className="text-gray-400 hover:text-white"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>
            
            <div className="max-h-80 overflow-y-auto">
              {notifications.slice(0, 10).map((notification) => (
                <div 
                  key={notification.id}
                  className={`p-4 border-b border-slate-600/30 hover:bg-slate-700/30 transition-all ${
                    !notification.read ? 'bg-blue-500/10' : ''
                  }`}
                  onClick={() => markNotificationAsRead(notification.id)}
                >
                  <div className="flex items-start gap-3">
                    {!notification.read && (
                      <div className="w-2 h-2 bg-blue-400 rounded-full mt-2"></div>
                    )}
                    <div className="flex-1 min-w-0">
                      <h4 className="font-medium text-white text-sm">{notification.title}</h4>
                      <p className="text-gray-300 text-xs mt-1 line-clamp-2">{notification.message}</p>
                      <div className="text-xs text-gray-400 mt-2">
                        {new Date(notification.timestamp).toLocaleDateString('fr-FR')}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};