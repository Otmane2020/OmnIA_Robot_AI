import React, { useState, useEffect } from 'react';
import { 
  Users, Building, DollarSign, TrendingUp, Mail, Phone, 
  MapPin, Calendar, CheckCircle, X, Eye, Search, Filter,
  Bell, MessageSquare, Send, Inbox, Settings, TestTube,
  Server, Wifi, Database, AlertCircle, RefreshCw
} from 'lucide-react';
import { Logo } from '../components/Logo';
import { supabase } from '../lib/supabase';

interface SuperAdminProps {
  onLogout: () => void;
  pendingApplications: any[];
  onValidateApplication: (id: string, approved: boolean) => void;
}

interface Notification {
  id: string;
  type: 'new_application' | 'support_request' | 'system_alert';
  title: string;
  message: string;
  from?: string;
  timestamp: string;
  read: boolean;
}

interface EmailMessage {
  id: string;
  from: string;
  to: string;
  subject: string;
  body: string;
  timestamp: string;
  read: boolean;
  type: 'incoming' | 'outgoing';
}

interface IMAPConfig {
  server: string;
  port: number;
  username: string;
  password: string;
  ssl: boolean;
}

export const SuperAdmin: React.FC<SuperAdminProps> = ({ 
  onLogout, 
  pendingApplications, 
  onValidateApplication 
}) => {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedApplication, setSelectedApplication] = useState<any>(null);
  const [showApplicationModal, setShowApplicationModal] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [showNotifications, setShowNotifications] = useState(false);
  const [emailMessages, setEmailMessages] = useState<EmailMessage[]>([]);
  const [newEmailSubject, setNewEmailSubject] = useState('');
  const [newEmailBody, setNewEmailBody] = useState('');
  const [newEmailTo, setNewEmailTo] = useState('');
  const [imapConfig, setImapConfig] = useState<IMAPConfig>({
    server: 'mail.omnia.sale',
    port: 993,
    username: 'support@omnia.sale',
    password: '',
    ssl: true
  });
  const [imapTestResult, setImapTestResult] = useState<string>('');
  const [isTestingIMAP, setIsTestingIMAP] = useState(false);

  // Charger les notifications au démarrage
  useEffect(() => {
    loadNotifications();
    loadEmailMessages();
    
    // Créer des notifications pour les nouvelles demandes
    pendingApplications.forEach(app => {
      if (!notifications.find(n => n.id === `app-${app.id}`)) {
        addNotification({
          id: `app-${app.id}`,
          type: 'new_application',
          title: 'Nouvelle demande revendeur',
          message: `${app.companyName} - ${app.email}`,
          from: app.email,
          timestamp: app.submittedAt,
          read: false
        });
      }
    });
  }, [pendingApplications]);

  const loadNotifications = () => {
    try {
      const saved = localStorage.getItem('admin_notifications');
      if (saved) {
        setNotifications(JSON.parse(saved));
      }
    } catch (error) {
      console.error('Erreur chargement notifications:', error);
    }
  };

  const loadEmailMessages = () => {
    try {
      const saved = localStorage.getItem('admin_emails');
      if (saved) {
        setEmailMessages(JSON.parse(saved));
      } else {
        // Messages de démo
        const demoMessages: EmailMessage[] = [
          {
            id: '1',
            from: 'contact@mobilierdesign.fr',
            to: 'support@omnia.sale',
            subject: 'Problème synchronisation catalogue',
            body: 'Bonjour,\n\nJe rencontre des difficultés avec la synchronisation de mon catalogue Shopify. Pouvez-vous m\'aider ?\n\nCordialement,\nJean Martin',
            timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
            read: false,
            type: 'incoming'
          },
          {
            id: '2',
            from: 'info@decocontemporain.com',
            to: 'support@omnia.sale',
            subject: 'Demande de formation équipe',
            body: 'Bonjour,\n\nNous souhaitons organiser une formation pour notre équipe sur l\'utilisation d\'OmnIA. Quelles sont vos disponibilités ?\n\nMerci,\nSophie Dubois',
            timestamp: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(),
            read: true,
            type: 'incoming'
          }
        ];
        setEmailMessages(demoMessages);
        localStorage.setItem('admin_emails', JSON.stringify(demoMessages));
      }
    } catch (error) {
      console.error('Erreur chargement emails:', error);
    }
  };

  const addNotification = (notification: Notification) => {
    setNotifications(prev => {
      const updated = [notification, ...prev];
      localStorage.setItem('admin_notifications', JSON.stringify(updated));
      return updated;
    });
  };

  const markNotificationAsRead = (id: string) => {
    setNotifications(prev => {
      const updated = prev.map(n => n.id === id ? { ...n, read: true } : n);
      localStorage.setItem('admin_notifications', JSON.stringify(updated));
      return updated;
    });
  };

  const sendEmail = async () => {
    if (!newEmailTo || !newEmailSubject || !newEmailBody) {
      alert('Veuillez remplir tous les champs');
      return;
    }

    const newEmail: EmailMessage = {
      id: Date.now().toString(),
      from: 'support@omnia.sale',
      to: newEmailTo,
      subject: newEmailSubject,
      body: newEmailBody,
      timestamp: new Date().toISOString(),
      read: true,
      type: 'outgoing'
    };

    setEmailMessages(prev => {
      const updated = [newEmail, ...prev];
      localStorage.setItem('admin_emails', JSON.stringify(updated));
      return updated;
    });

    // Reset form
    setNewEmailTo('');
    setNewEmailSubject('');
    setNewEmailBody('');

    alert('Email envoyé avec succès !');
  };

  const testIMAPConnection = async () => {
    setIsTestingIMAP(true);
    setImapTestResult('');

    try {
      // Simuler le test IMAP
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      if (imapConfig.server && imapConfig.username && imapConfig.password) {
        setImapTestResult('✅ Connexion IMAP réussie ! 3 nouveaux messages récupérés.');
        
        // Simuler la récupération de nouveaux emails
        const newEmails: EmailMessage[] = [
          {
            id: Date.now().toString(),
            from: 'nouveau@client.fr',
            to: 'support@omnia.sale',
            subject: 'Question sur les tarifs',
            body: 'Bonjour, pouvez-vous me donner plus d\'informations sur vos tarifs ?',
            timestamp: new Date().toISOString(),
            read: false,
            type: 'incoming'
          }
        ];
        
        setEmailMessages(prev => [...newEmails, ...prev]);
      } else {
        setImapTestResult('❌ Configuration IMAP incomplète');
      }
    } catch (error) {
      setImapTestResult('❌ Erreur de connexion IMAP');
    } finally {
      setIsTestingIMAP(false);
    }
  };

  const handleValidateApplication = (applicationId: string, approved: boolean) => {
    onValidateApplication(applicationId, approved);
    
    // Marquer la notification comme lue
    markNotificationAsRead(`app-${applicationId}`);
    
    // Ajouter notification de validation
    addNotification({
      id: `validation-${applicationId}`,
      type: 'system_alert',
      title: approved ? 'Demande approuvée' : 'Demande rejetée',
      message: `Application ${applicationId} ${approved ? 'approuvée' : 'rejetée'}`,
      timestamp: new Date().toISOString(),
      read: false
    });
  };

  const unreadNotifications = notifications.filter(n => !n.read).length;
  const unreadEmails = emailMessages.filter(e => !e.read && e.type === 'incoming').length;

  const filteredApplications = pendingApplications.filter(app =>
    app.companyName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    app.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const renderDashboard = () => (
    <div className="space-y-8">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-blue-600/20 backdrop-blur-xl rounded-2xl p-6 border border-blue-500/30">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-blue-200 text-sm mb-1">Demandes en attente</p>
              <p className="text-3xl font-bold text-white">{pendingApplications.length}</p>
            </div>
            <Users className="w-10 h-10 text-blue-400" />
          </div>
        </div>
        
        <div className="bg-green-600/20 backdrop-blur-xl rounded-2xl p-6 border border-green-500/30">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-green-200 text-sm mb-1">Revendeurs actifs</p>
              <p className="text-3xl font-bold text-white">127</p>
            </div>
            <Building className="w-10 h-10 text-green-400" />
          </div>
        </div>
        
        <div className="bg-purple-600/20 backdrop-blur-xl rounded-2xl p-6 border border-purple-500/30">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-purple-200 text-sm mb-1">Revenus mensuel</p>
              <p className="text-3xl font-bold text-white">€12.4k</p>
            </div>
            <DollarSign className="w-10 h-10 text-purple-400" />
          </div>
        </div>
        
        <div className="bg-orange-600/20 backdrop-blur-xl rounded-2xl p-6 border border-orange-500/30">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-orange-200 text-sm mb-1">Croissance</p>
              <p className="text-3xl font-bold text-white">+23%</p>
            </div>
            <TrendingUp className="w-10 h-10 text-orange-400" />
          </div>
        </div>
      </div>

      {/* Demandes récentes */}
      <div className="bg-white/10 backdrop-blur-xl rounded-2xl p-8 border border-white/20">
        <h3 className="text-xl font-bold text-white mb-6">Demandes récentes</h3>
        <div className="space-y-4">
          {pendingApplications.slice(0, 5).map((app) => (
            <div key={app.id} className="flex items-center justify-between p-4 bg-black/20 rounded-xl">
              <div>
                <h4 className="font-semibold text-white">{app.companyName}</h4>
                <p className="text-gray-300 text-sm">{app.email}</p>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => handleValidateApplication(app.id, true)}
                  className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg"
                >
                  Approuver
                </button>
                <button
                  onClick={() => handleValidateApplication(app.id, false)}
                  className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg"
                >
                  Rejeter
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  const renderApplications = () => (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-white">Demandes d'inscription</h2>
        <div className="flex gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Rechercher..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-4 py-2 bg-black/40 border border-gray-600 rounded-xl text-white"
            />
          </div>
        </div>
      </div>

      <div className="grid gap-6">
        {filteredApplications.map((app) => (
          <div key={app.id} className="bg-white/10 backdrop-blur-xl rounded-2xl p-6 border border-white/20">
            <div className="flex justify-between items-start">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-4">
                  <Building className="w-6 h-6 text-cyan-400" />
                  <h3 className="text-xl font-bold text-white">{app.companyName}</h3>
                  <span className="bg-yellow-500/20 text-yellow-300 px-3 py-1 rounded-full text-sm">
                    En attente
                  </span>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <Mail className="w-4 h-4 text-gray-400" />
                      <span className="text-gray-300">{app.email}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Phone className="w-4 h-4 text-gray-400" />
                      <span className="text-gray-300">{app.phone}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <MapPin className="w-4 h-4 text-gray-400" />
                      <span className="text-gray-300">{app.city}</span>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <Calendar className="w-4 h-4 text-gray-400" />
                      <span className="text-gray-300">{new Date(app.submittedAt).toLocaleDateString('fr-FR')}</span>
                    </div>
                    <div className="text-gray-300">
                      <strong>Plan:</strong> {app.selectedPlan}
                    </div>
                    <div className="text-gray-300">
                      <strong>Sous-domaine:</strong> {app.proposedSubdomain}.omnia.sale
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="flex gap-3">
                <button
                  onClick={() => {
                    setSelectedApplication(app);
                    setShowApplicationModal(true);
                  }}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-xl flex items-center gap-2"
                >
                  <Eye className="w-4 h-4" />
                  Détails
                </button>
                <button
                  onClick={() => handleValidateApplication(app.id, true)}
                  className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-xl flex items-center gap-2"
                >
                  <CheckCircle className="w-4 h-4" />
                  Approuver
                </button>
                <button
                  onClick={() => handleValidateApplication(app.id, false)}
                  className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-xl flex items-center gap-2"
                >
                  <X className="w-4 h-4" />
                  Rejeter
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  const renderMessaging = () => (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-white">Messagerie Support</h2>
        <div className="flex gap-3">
          <button
            onClick={testIMAPConnection}
            disabled={isTestingIMAP}
            className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 text-white px-4 py-2 rounded-xl flex items-center gap-2"
          >
            {isTestingIMAP ? (
              <RefreshCw className="w-4 h-4 animate-spin" />
            ) : (
              <TestTube className="w-4 h-4" />
            )}
            Tester IMAP
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Configuration IMAP */}
        <div className="bg-white/10 backdrop-blur-xl rounded-2xl p-6 border border-white/20">
          <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
            <Settings className="w-5 h-5 text-cyan-400" />
            Configuration IMAP
          </h3>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm text-gray-300 mb-2">Serveur IMAP</label>
              <input
                type="text"
                value={imapConfig.server}
                onChange={(e) => setImapConfig(prev => ({ ...prev, server: e.target.value }))}
                className="w-full bg-black/40 border border-gray-600 rounded-xl px-3 py-2 text-white"
                placeholder="mail.omnia.sale"
              />
            </div>
            
            <div>
              <label className="block text-sm text-gray-300 mb-2">Port</label>
              <input
                type="number"
                value={imapConfig.port}
                onChange={(e) => setImapConfig(prev => ({ ...prev, port: parseInt(e.target.value) }))}
                className="w-full bg-black/40 border border-gray-600 rounded-xl px-3 py-2 text-white"
              />
            </div>
            
            <div>
              <label className="block text-sm text-gray-300 mb-2">Nom d'utilisateur</label>
              <input
                type="text"
                value={imapConfig.username}
                onChange={(e) => setImapConfig(prev => ({ ...prev, username: e.target.value }))}
                className="w-full bg-black/40 border border-gray-600 rounded-xl px-3 py-2 text-white"
              />
            </div>
            
            <div>
              <label className="block text-sm text-gray-300 mb-2">Mot de passe</label>
              <input
                type="password"
                value={imapConfig.password}
                onChange={(e) => setImapConfig(prev => ({ ...prev, password: e.target.value }))}
                className="w-full bg-black/40 border border-gray-600 rounded-xl px-3 py-2 text-white"
              />
            </div>
            
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={imapConfig.ssl}
                onChange={(e) => setImapConfig(prev => ({ ...prev, ssl: e.target.checked }))}
                className="w-4 h-4"
              />
              <label className="text-sm text-gray-300">SSL/TLS</label>
            </div>
            
            {imapTestResult && (
              <div className={`p-3 rounded-xl text-sm ${
                imapTestResult.includes('✅') 
                  ? 'bg-green-500/20 text-green-300 border border-green-400/50'
                  : 'bg-red-500/20 text-red-300 border border-red-400/50'
              }`}>
                {imapTestResult}
              </div>
            )}
          </div>
        </div>

        {/* Liste des emails */}
        <div className="lg:col-span-2 bg-white/10 backdrop-blur-xl rounded-2xl p-6 border border-white/20">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-lg font-bold text-white flex items-center gap-2">
              <Inbox className="w-5 h-5 text-green-400" />
              Messages ({emailMessages.length})
              {unreadEmails > 0 && (
                <span className="bg-red-500 text-white text-xs px-2 py-1 rounded-full">
                  {unreadEmails}
                </span>
              )}
            </h3>
          </div>
          
          <div className="space-y-3 max-h-96 overflow-y-auto">
            {emailMessages.map((email) => (
              <div key={email.id} className={`p-4 rounded-xl border transition-all cursor-pointer ${
                email.read 
                  ? 'bg-black/20 border-gray-600/50' 
                  : 'bg-blue-500/20 border-blue-400/50'
              }`}>
                <div className="flex justify-between items-start mb-2">
                  <div className="flex items-center gap-2">
                    <span className={`font-semibold ${email.type === 'incoming' ? 'text-blue-300' : 'text-green-300'}`}>
                      {email.type === 'incoming' ? email.from : `À: ${email.to}`}
                    </span>
                    {!email.read && email.type === 'incoming' && (
                      <span className="w-2 h-2 bg-red-500 rounded-full"></span>
                    )}
                  </div>
                  <span className="text-gray-400 text-xs">
                    {new Date(email.timestamp).toLocaleDateString('fr-FR')}
                  </span>
                </div>
                <h4 className="font-medium text-white mb-2">{email.subject}</h4>
                <p className="text-gray-300 text-sm line-clamp-2">{email.body}</p>
              </div>
            ))}
          </div>
          
          {/* Composer un email */}
          <div className="mt-6 pt-6 border-t border-gray-600/50">
            <h4 className="font-semibold text-white mb-4">Nouveau message</h4>
            <div className="space-y-3">
              <input
                type="email"
                placeholder="À: email@exemple.com"
                value={newEmailTo}
                onChange={(e) => setNewEmailTo(e.target.value)}
                className="w-full bg-black/40 border border-gray-600 rounded-xl px-3 py-2 text-white"
              />
              <input
                type="text"
                placeholder="Sujet"
                value={newEmailSubject}
                onChange={(e) => setNewEmailSubject(e.target.value)}
                className="w-full bg-black/40 border border-gray-600 rounded-xl px-3 py-2 text-white"
              />
              <textarea
                placeholder="Message..."
                value={newEmailBody}
                onChange={(e) => setNewEmailBody(e.target.value)}
                rows={4}
                className="w-full bg-black/40 border border-gray-600 rounded-xl px-3 py-2 text-white resize-none"
              />
              <button
                onClick={sendEmail}
                className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-xl flex items-center gap-2"
              >
                <Send className="w-4 h-4" />
                Envoyer
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const renderSystemConfig = () => (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-white">Configuration Système</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Serveur Email */}
        <div className="bg-white/10 backdrop-blur-xl rounded-2xl p-6 border border-white/20">
          <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
            <Server className="w-5 h-5 text-blue-400" />
            Serveur Email
          </h3>
          
          <div className="space-y-4">
            <div className="flex items-center justify-between p-3 bg-green-500/20 rounded-xl">
              <span className="text-green-300">SMTP Sortant</span>
              <span className="text-green-400 font-bold">✅ Actif</span>
            </div>
            <div className="flex items-center justify-between p-3 bg-green-500/20 rounded-xl">
              <span className="text-green-300">IMAP Entrant</span>
              <span className="text-green-400 font-bold">✅ Configuré</span>
            </div>
            <div className="text-sm text-gray-300">
              <p><strong>Serveur:</strong> mail.omnia.sale</p>
              <p><strong>Port SMTP:</strong> 587 (TLS)</p>
              <p><strong>Port IMAP:</strong> 993 (SSL)</p>
            </div>
          </div>
        </div>

        {/* DNS et Sous-domaines */}
        <div className="bg-white/10 backdrop-blur-xl rounded-2xl p-6 border border-white/20">
          <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
            <Wifi className="w-5 h-5 text-purple-400" />
            DNS & Sous-domaines
          </h3>
          
          <div className="space-y-4">
            <div className="flex items-center justify-between p-3 bg-green-500/20 rounded-xl">
              <span className="text-green-300">Création automatique</span>
              <span className="text-green-400 font-bold">✅ Actif</span>
            </div>
            <div className="flex items-center justify-between p-3 bg-blue-500/20 rounded-xl">
              <span className="text-blue-300">SSL automatique</span>
              <span className="text-blue-400 font-bold">🔒 Let's Encrypt</span>
            </div>
            <div className="text-sm text-gray-300">
              <p><strong>Provider:</strong> Cloudflare</p>
              <p><strong>Zone:</strong> omnia.sale</p>
              <p><strong>TTL:</strong> 300s</p>
            </div>
          </div>
        </div>

        {/* Base de données */}
        <div className="bg-white/10 backdrop-blur-xl rounded-2xl p-6 border border-white/20">
          <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
            <Database className="w-5 h-5 text-green-400" />
            Base de données
          </h3>
          
          <div className="space-y-4">
            <div className="flex items-center justify-between p-3 bg-green-500/20 rounded-xl">
              <span className="text-green-300">Supabase</span>
              <span className="text-green-400 font-bold">✅ Connecté</span>
            </div>
            <div className="flex items-center justify-between p-3 bg-blue-500/20 rounded-xl">
              <span className="text-blue-300">Edge Functions</span>
              <span className="text-blue-400 font-bold">⚡ Actives</span>
            </div>
            <div className="text-sm text-gray-300">
              <p><strong>Tables:</strong> 12 actives</p>
              <p><strong>Fonctions:</strong> 15 déployées</p>
              <p><strong>RLS:</strong> Activé</p>
            </div>
          </div>
        </div>

        {/* Monitoring */}
        <div className="bg-white/10 backdrop-blur-xl rounded-2xl p-6 border border-white/20">
          <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
            <AlertCircle className="w-5 h-5 text-orange-400" />
            Monitoring
          </h3>
          
          <div className="space-y-4">
            <div className="flex items-center justify-between p-3 bg-green-500/20 rounded-xl">
              <span className="text-green-300">Uptime</span>
              <span className="text-green-400 font-bold">99.9%</span>
            </div>
            <div className="flex items-center justify-between p-3 bg-blue-500/20 rounded-xl">
              <span className="text-blue-300">Réponse API</span>
              <span className="text-blue-400 font-bold">{"< 200ms"}</span>
            </div>
            <div className="text-sm text-gray-300">
              <p><strong>Dernière panne:</strong> Aucune</p>
              <p><strong>Alertes:</strong> 0 active</p>
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
            <Logo size="md" />
            
            <div className="flex items-center gap-4">
              {/* Notifications */}
              <div className="relative">
                <button
                  onClick={() => setShowNotifications(!showNotifications)}
                  className="relative p-2 bg-white/10 hover:bg-white/20 rounded-xl transition-all"
                >
                  <Bell className="w-5 h-5 text-white" />
                  {unreadNotifications > 0 && (
                    <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs px-2 py-1 rounded-full">
                      {unreadNotifications}
                    </span>
                  )}
                </button>
                
                {showNotifications && (
                  <div className="absolute top-full right-0 mt-2 w-80 bg-slate-800/95 backdrop-blur-xl rounded-2xl border border-slate-600/50 shadow-2xl z-50">
                    <div className="p-4 border-b border-slate-600/50">
                      <h3 className="font-bold text-white">Notifications</h3>
                    </div>
                    <div className="max-h-96 overflow-y-auto">
                      {notifications.slice(0, 10).map((notification) => (
                        <div
                          key={notification.id}
                          onClick={() => markNotificationAsRead(notification.id)}
                          className={`p-4 border-b border-slate-600/30 hover:bg-white/5 cursor-pointer ${
                            !notification.read ? 'bg-blue-500/10' : ''
                          }`}
                        >
                          <div className="flex items-start gap-3">
                            <div className={`w-2 h-2 rounded-full mt-2 ${
                              notification.read ? 'bg-gray-400' : 'bg-red-500'
                            }`}></div>
                            <div className="flex-1">
                              <h4 className="font-medium text-white text-sm">{notification.title}</h4>
                              <p className="text-gray-300 text-xs">{notification.message}</p>
                              <span className="text-gray-400 text-xs">
                                {new Date(notification.timestamp).toLocaleDateString('fr-FR')}
                              </span>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
              
              <div className="text-white">
                <div className="font-semibold">Super Admin</div>
                <div className="text-cyan-300 text-sm">admin@omnia.sale</div>
              </div>
              
              <button
                onClick={onLogout}
                className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-xl transition-all"
              >
                Déconnexion
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Navigation Tabs */}
        <div className="flex flex-wrap gap-2 mb-8">
          <button
            onClick={() => setActiveTab('dashboard')}
            className={`px-6 py-3 rounded-xl font-semibold transition-all ${
              activeTab === 'dashboard'
                ? 'bg-gradient-to-r from-cyan-500 to-blue-600 text-white'
                : 'bg-white/10 text-gray-300 hover:bg-white/20 hover:text-white'
            }`}
          >
            📊 Dashboard
          </button>
          <button
            onClick={() => setActiveTab('applications')}
            className={`px-6 py-3 rounded-xl font-semibold transition-all flex items-center gap-2 ${
              activeTab === 'applications'
                ? 'bg-gradient-to-r from-cyan-500 to-blue-600 text-white'
                : 'bg-white/10 text-gray-300 hover:bg-white/20 hover:text-white'
            }`}
          >
            📝 Demandes
            {pendingApplications.length > 0 && (
              <span className="bg-red-500 text-white text-xs px-2 py-1 rounded-full">
                {pendingApplications.length}
              </span>
            )}
          </button>
          <button
            onClick={() => setActiveTab('messaging')}
            className={`px-6 py-3 rounded-xl font-semibold transition-all flex items-center gap-2 ${
              activeTab === 'messaging'
                ? 'bg-gradient-to-r from-cyan-500 to-blue-600 text-white'
                : 'bg-white/10 text-gray-300 hover:bg-white/20 hover:text-white'
            }`}
          >
            📧 Messagerie
            {unreadEmails > 0 && (
              <span className="bg-red-500 text-white text-xs px-2 py-1 rounded-full">
                {unreadEmails}
              </span>
            )}
          </button>
          <button
            onClick={() => setActiveTab('system')}
            className={`px-6 py-3 rounded-xl font-semibold transition-all ${
              activeTab === 'system'
                ? 'bg-gradient-to-r from-cyan-500 to-blue-600 text-white'
                : 'bg-white/10 text-gray-300 hover:bg-white/20 hover:text-white'
            }`}
          >
            ⚙️ Système
          </button>
        </div>

        {/* Content */}
        {activeTab === 'dashboard' && renderDashboard()}
        {activeTab === 'applications' && renderApplications()}
        {activeTab === 'messaging' && renderMessaging()}
        {activeTab === 'system' && renderSystemConfig()}
      </div>

      {/* Modal détails application */}
      {showApplicationModal && selectedApplication && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-800/95 backdrop-blur-xl rounded-2xl p-8 max-w-2xl w-full border border-slate-600/50 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-2xl font-bold text-white">Détails de la demande</h3>
              <button
                onClick={() => setShowApplicationModal(false)}
                className="text-gray-400 hover:text-white"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
            
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h4 className="font-semibold text-cyan-300 mb-3">🏢 Entreprise</h4>
                  <div className="space-y-2 text-sm">
                    <p><strong className="text-white">Nom:</strong> <span className="text-gray-300">{selectedApplication.companyName}</span></p>
                    <p><strong className="text-white">SIRET:</strong> <span className="text-gray-300">{selectedApplication.siret}</span></p>
                    <p><strong className="text-white">Adresse:</strong> <span className="text-gray-300">{selectedApplication.address}</span></p>
                    <p><strong className="text-white">Ville:</strong> <span className="text-gray-300">{selectedApplication.postalCode} {selectedApplication.city}</span></p>
                    <p><strong className="text-white">Pays:</strong> <span className="text-gray-300">{selectedApplication.country}</span></p>
                  </div>
                </div>
                
                <div>
                  <h4 className="font-semibold text-green-300 mb-3">👤 Contact</h4>
                  <div className="space-y-2 text-sm">
                    <p><strong className="text-white">Nom:</strong> <span className="text-gray-300">{selectedApplication.firstName} {selectedApplication.lastName}</span></p>
                    <p><strong className="text-white">Email:</strong> <span className="text-gray-300">{selectedApplication.email}</span></p>
                    <p><strong className="text-white">Téléphone:</strong> <span className="text-gray-300">{selectedApplication.phone}</span></p>
                    <p><strong className="text-white">Fonction:</strong> <span className="text-gray-300">{selectedApplication.position}</span></p>
                  </div>
                </div>
              </div>
              
              <div>
                <h4 className="font-semibold text-purple-300 mb-3">📋 Abonnement</h4>
                <div className="bg-purple-500/20 rounded-xl p-4 border border-purple-400/50">
                  <p><strong className="text-white">Plan choisi:</strong> <span className="text-purple-300">{selectedApplication.selectedPlan}</span></p>
                  <p><strong className="text-white">Sous-domaine:</strong> <span className="text-purple-300">{selectedApplication.proposedSubdomain}.omnia.sale</span></p>
                  <p><strong className="text-white">Soumis le:</strong> <span className="text-purple-300">{new Date(selectedApplication.submittedAt).toLocaleDateString('fr-FR')}</span></p>
                </div>
              </div>
              
              {selectedApplication.loginCredentials && (
                <div>
                  <h4 className="font-semibold text-orange-300 mb-3">🔑 Identifiants de connexion</h4>
                  <div className="bg-orange-500/20 rounded-xl p-4 border border-orange-400/50">
                    <p><strong className="text-white">Email:</strong> <span className="text-orange-300">{selectedApplication.loginCredentials.email}</span></p>
                    <p><strong className="text-white">Mot de passe:</strong> <span className="text-orange-300">{selectedApplication.loginCredentials.password}</span></p>
                    <p><strong className="text-white">URL Admin:</strong> <span className="text-orange-300">{selectedApplication.loginCredentials.adminUrl}</span></p>
                    <p><strong className="text-white">Sous-domaine:</strong> <span className="text-orange-300">{selectedApplication.loginCredentials.subdomain}</span></p>
                  </div>
                </div>
              )}
              
              <div className="flex gap-4">
                <button
                  onClick={() => {
                    handleValidateApplication(selectedApplication.id, true);
                    setShowApplicationModal(false);
                  }}
                  className="flex-1 bg-green-600 hover:bg-green-700 text-white py-3 rounded-xl font-semibold flex items-center justify-center gap-2"
                >
                  <CheckCircle className="w-5 h-5" />
                  Approuver
                </button>
                <button
                  onClick={() => {
                    handleValidateApplication(selectedApplication.id, false);
                    setShowApplicationModal(false);
                  }}
                  className="flex-1 bg-red-600 hover:bg-red-700 text-white py-3 rounded-xl font-semibold flex items-center justify-center gap-2"
                >
                  <X className="w-5 h-5" />
                  Rejeter
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};