import React, { useState, useEffect } from 'react';
import { 
  Mail, Send, Inbox, Archive, Settings, Search, 
  Plus, Reply, Forward, Trash2, Star, Clock,
  Server, CheckCircle, AlertCircle, Loader2, X,
  User, Building, Phone, MapPin, Calendar
} from 'lucide-react';

interface Email {
  id: string;
  from: string;
  to: string;
  subject: string;
  content: string;
  timestamp: Date;
  read: boolean;
  starred: boolean;
  type: 'received' | 'sent' | 'draft';
  retailer_info?: {
    company_name: string;
    plan: string;
    status: string;
  };
}

interface IMAPConfig {
  server: string;
  port: number;
  username: string;
  password: string;
  ssl: boolean;
}

export const MessagingSystem: React.FC = () => {
  const [emails, setEmails] = useState<Email[]>([]);
  const [selectedEmail, setSelectedEmail] = useState<Email | null>(null);
  const [activeTab, setActiveTab] = useState<'inbox' | 'sent' | 'drafts' | 'settings'>('inbox');
  const [showCompose, setShowCompose] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [unreadCount, setUnreadCount] = useState(0);
  const [isTestingConnection, setIsTestingConnection] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState<'disconnected' | 'connected' | 'error'>('disconnected');
  
  const [imapConfig, setImapConfig] = useState<IMAPConfig>({
    server: 'mail.omnia.sale',
    port: 993,
    username: 'support@omnia.sale',
    password: '',
    ssl: true
  });

  const [composeEmail, setComposeEmail] = useState({
    to: '',
    subject: '',
    content: ''
  });

  useEffect(() => {
    loadEmails();
  }, []);

  useEffect(() => {
    const unread = emails.filter(email => !email.read && email.type === 'received').length;
    setUnreadCount(unread);
  }, [emails]);

  const loadEmails = () => {
    // Charger emails depuis localStorage + emails de démo
    const savedEmails = JSON.parse(localStorage.getItem('omnia_emails') || '[]');
    
    const demoEmails: Email[] = [
      {
        id: 'demo-1',
        from: 'contact@mobilierdesign.fr',
        to: 'support@omnia.sale',
        subject: 'Problème import catalogue CSV',
        content: `Bonjour,

J'ai des difficultés pour importer mon catalogue CSV. Le fichier fait 2MB avec 150 produits mais l'import reste bloqué à 45%.

Pouvez-vous m'aider ?

Cordialement,
Jean Martin
Mobilier Design Paris`,
        timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000),
        read: false,
        starred: false,
        type: 'received',
        retailer_info: {
          company_name: 'Mobilier Design Paris',
          plan: 'Professional',
          status: 'active'
        }
      },
      {
        id: 'demo-2',
        from: 'info@decocontemporain.com',
        to: 'support@omnia.sale',
        subject: 'Configuration voix robot OmnIA',
        content: `Bonjour l'équipe OmnIA,

Comment puis-je changer la voix de mon robot ? Mes clients préfèrent une voix féminine.

Merci,
Sophie Laurent
Déco Contemporain`,
        timestamp: new Date(Date.now() - 4 * 60 * 60 * 1000),
        read: true,
        starred: true,
        type: 'received',
        retailer_info: {
          company_name: 'Déco Contemporain',
          plan: 'Enterprise',
          status: 'active'
        }
      },
      {
        id: 'demo-3',
        from: 'support@omnia.sale',
        to: 'contact@mobilierdesign.fr',
        subject: 'Re: Problème import catalogue CSV',
        content: `Bonjour Jean,

Merci pour votre message. Le problème d'import à 45% est généralement lié à des caractères spéciaux dans les descriptions.

Voici la solution :
1. Ouvrez votre CSV avec Excel
2. Sauvegardez en UTF-8 (CSV UTF-8)
3. Relancez l'import

Si le problème persiste, envoyez-moi votre fichier CSV.

Cordialement,
Équipe Support OmnIA`,
        timestamp: new Date(Date.now() - 1 * 60 * 60 * 1000),
        read: true,
        starred: false,
        type: 'sent'
      }
    ];

    const allEmails = [...savedEmails, ...demoEmails];
    setEmails(allEmails);
  };

  const handleTestConnection = async () => {
    setIsTestingConnection(true);
    setConnectionStatus('disconnected');

    try {
      // Simuler test de connexion IMAP
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      if (imapConfig.server && imapConfig.username && imapConfig.password) {
        setConnectionStatus('connected');
        console.log('✅ Connexion IMAP simulée réussie');
      } else {
        setConnectionStatus('error');
        console.log('❌ Paramètres IMAP manquants');
      }
    } catch (error) {
      setConnectionStatus('error');
      console.error('❌ Erreur test connexion:', error);
    } finally {
      setIsTestingConnection(false);
    }
  };

  const handleSendEmail = () => {
    if (!composeEmail.to || !composeEmail.subject || !composeEmail.content) {
      alert('Veuillez remplir tous les champs');
      return;
    }

    const newEmail: Email = {
      id: Date.now().toString(),
      from: 'support@omnia.sale',
      to: composeEmail.to,
      subject: composeEmail.subject,
      content: composeEmail.content,
      timestamp: new Date(),
      read: true,
      starred: false,
      type: 'sent'
    };

    setEmails(prev => [newEmail, ...prev]);
    
    // Sauvegarder dans localStorage
    const allEmails = [newEmail, ...emails];
    localStorage.setItem('omnia_emails', JSON.stringify(allEmails.filter(e => e.id.startsWith('custom-'))));

    setComposeEmail({ to: '', subject: '', content: '' });
    setShowCompose(false);
    setActiveTab('sent');

    console.log('📧 Email envoyé:', newEmail.subject);
  };

  const handleReply = (email: Email) => {
    setComposeEmail({
      to: email.from,
      subject: `Re: ${email.subject}`,
      content: `\n\n--- Message original ---\nDe: ${email.from}\nDate: ${email.timestamp.toLocaleString('fr-FR')}\nObjet: ${email.subject}\n\n${email.content}`
    });
    setShowCompose(true);
  };

  const markAsRead = (emailId: string) => {
    setEmails(prev => prev.map(email => 
      email.id === emailId ? { ...email, read: true } : email
    ));
  };

  const toggleStar = (emailId: string) => {
    setEmails(prev => prev.map(email => 
      email.id === emailId ? { ...email, starred: !email.starred } : email
    ));
  };

  const deleteEmail = (emailId: string) => {
    setEmails(prev => prev.filter(email => email.id !== emailId));
    if (selectedEmail?.id === emailId) {
      setSelectedEmail(null);
    }
  };

  const filteredEmails = emails.filter(email => {
    const matchesTab = 
      (activeTab === 'inbox' && email.type === 'received') ||
      (activeTab === 'sent' && email.type === 'sent') ||
      (activeTab === 'drafts' && email.type === 'draft');
    
    const matchesSearch = searchTerm === '' || 
      email.subject.toLowerCase().includes(searchTerm.toLowerCase()) ||
      email.from.toLowerCase().includes(searchTerm.toLowerCase()) ||
      email.content.toLowerCase().includes(searchTerm.toLowerCase());
    
    return matchesTab && matchesSearch;
  });

  const renderEmailList = () => (
    <div className="space-y-2">
      {filteredEmails.map((email) => (
        <div
          key={email.id}
          onClick={() => {
            setSelectedEmail(email);
            if (!email.read) markAsRead(email.id);
          }}
          className={`p-4 rounded-xl border cursor-pointer transition-all hover:scale-[1.02] ${
            selectedEmail?.id === email.id
              ? 'bg-cyan-500/20 border-cyan-400/50'
              : email.read
                ? 'bg-black/20 border-white/10 hover:bg-black/30'
                : 'bg-blue-500/20 border-blue-400/50 hover:bg-blue-500/30'
          }`}
        >
          <div className="flex items-start justify-between">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                {!email.read && <div className="w-2 h-2 bg-blue-400 rounded-full"></div>}
                <span className={`font-semibold ${email.read ? 'text-gray-300' : 'text-white'}`}>
                  {email.type === 'sent' ? `À: ${email.to}` : `De: ${email.from}`}
                </span>
                {email.starred && <Star className="w-4 h-4 text-yellow-400 fill-current" />}
              </div>
              <h3 className={`font-medium mb-2 line-clamp-1 ${email.read ? 'text-gray-300' : 'text-white'}`}>
                {email.subject}
              </h3>
              <p className="text-gray-400 text-sm line-clamp-2">{email.content}</p>
              {email.retailer_info && (
                <div className="flex items-center gap-2 mt-2">
                  <span className="bg-purple-500/20 text-purple-300 px-2 py-1 rounded text-xs">
                    {email.retailer_info.plan}
                  </span>
                  <span className="text-gray-400 text-xs">{email.retailer_info.company_name}</span>
                </div>
              )}
            </div>
            <div className="flex flex-col items-end gap-2">
              <span className="text-gray-400 text-xs">
                {email.timestamp.toLocaleDateString('fr-FR', { 
                  day: '2-digit', 
                  month: '2-digit',
                  hour: '2-digit',
                  minute: '2-digit'
                })}
              </span>
              <div className="flex gap-1">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    toggleStar(email.id);
                  }}
                  className="text-gray-400 hover:text-yellow-400 transition-colors"
                >
                  <Star className={`w-4 h-4 ${email.starred ? 'fill-current text-yellow-400' : ''}`} />
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    deleteEmail(email.id);
                  }}
                  className="text-gray-400 hover:text-red-400 transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );

  const renderEmailDetail = () => {
    if (!selectedEmail) {
      return (
        <div className="flex items-center justify-center h-full">
          <div className="text-center">
            <Mail className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-bold text-white mb-2">Sélectionnez un email</h3>
            <p className="text-gray-400">Choisissez un email dans la liste pour le lire</p>
          </div>
        </div>
      );
    }

    return (
      <div className="h-full flex flex-col">
        {/* Header email */}
        <div className="bg-black/20 rounded-xl p-6 mb-6">
          <div className="flex items-start justify-between mb-4">
            <div className="flex-1">
              <h2 className="text-xl font-bold text-white mb-2">{selectedEmail.subject}</h2>
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <User className="w-4 h-4 text-gray-400" />
                  <span className="text-gray-300">De: {selectedEmail.from}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Mail className="w-4 h-4 text-gray-400" />
                  <span className="text-gray-300">À: {selectedEmail.to}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-gray-400" />
                  <span className="text-gray-300">
                    {selectedEmail.timestamp.toLocaleString('fr-FR')}
                  </span>
                </div>
              </div>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => handleReply(selectedEmail)}
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-xl flex items-center gap-2 transition-all"
              >
                <Reply className="w-4 h-4" />
                Répondre
              </button>
              <button
                onClick={() => toggleStar(selectedEmail.id)}
                className={`p-2 rounded-xl transition-all ${
                  selectedEmail.starred 
                    ? 'bg-yellow-500/20 text-yellow-400' 
                    : 'bg-gray-600 hover:bg-gray-700 text-gray-300'
                }`}
              >
                <Star className={`w-4 h-4 ${selectedEmail.starred ? 'fill-current' : ''}`} />
              </button>
            </div>
          </div>

          {selectedEmail.retailer_info && (
            <div className="bg-purple-500/20 border border-purple-400/30 rounded-xl p-4">
              <h4 className="font-semibold text-purple-200 mb-2 flex items-center gap-2">
                <Building className="w-4 h-4" />
                Informations revendeur
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                <div>
                  <span className="text-purple-300">Entreprise:</span>
                  <div className="text-white font-medium">{selectedEmail.retailer_info.company_name}</div>
                </div>
                <div>
                  <span className="text-purple-300">Plan:</span>
                  <div className="text-white font-medium">{selectedEmail.retailer_info.plan}</div>
                </div>
                <div>
                  <span className="text-purple-300">Statut:</span>
                  <div className={`font-medium ${
                    selectedEmail.retailer_info.status === 'active' ? 'text-green-400' : 'text-red-400'
                  }`}>
                    {selectedEmail.retailer_info.status}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Contenu email */}
        <div className="flex-1 bg-white/10 backdrop-blur-xl rounded-xl p-6 border border-white/20">
          <div className="prose prose-invert max-w-none">
            <div className="whitespace-pre-wrap text-gray-300 leading-relaxed">
              {selectedEmail.content}
            </div>
          </div>
        </div>
      </div>
    );
  };

  const renderCompose = () => (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-slate-800/95 backdrop-blur-xl rounded-2xl p-6 max-w-2xl w-full border border-slate-600/50 shadow-2xl">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-bold text-white">Nouveau message</h3>
          <button
            onClick={() => setShowCompose(false)}
            className="text-gray-400 hover:text-white transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-sm text-gray-300 mb-2">Destinataire</label>
            <input
              type="email"
              value={composeEmail.to}
              onChange={(e) => setComposeEmail(prev => ({ ...prev, to: e.target.value }))}
              className="w-full bg-black/40 border border-gray-600 rounded-xl px-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:border-cyan-400"
              placeholder="email@revendeur.com"
            />
          </div>

          <div>
            <label className="block text-sm text-gray-300 mb-2">Objet</label>
            <input
              type="text"
              value={composeEmail.subject}
              onChange={(e) => setComposeEmail(prev => ({ ...prev, subject: e.target.value }))}
              className="w-full bg-black/40 border border-gray-600 rounded-xl px-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:border-cyan-400"
              placeholder="Objet du message"
            />
          </div>

          <div>
            <label className="block text-sm text-gray-300 mb-2">Message</label>
            <textarea
              value={composeEmail.content}
              onChange={(e) => setComposeEmail(prev => ({ ...prev, content: e.target.value }))}
              rows={8}
              className="w-full bg-black/40 border border-gray-600 rounded-xl px-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:border-cyan-400 resize-none"
              placeholder="Votre message..."
            />
          </div>

          <div className="flex justify-between">
            <button
              onClick={() => setShowCompose(false)}
              className="bg-gray-600 hover:bg-gray-700 text-white px-6 py-3 rounded-xl transition-all"
            >
              Annuler
            </button>
            <button
              onClick={handleSendEmail}
              className="bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-400 hover:to-emerald-500 text-white px-6 py-3 rounded-xl font-semibold transition-all flex items-center gap-2"
            >
              <Send className="w-4 h-4" />
              Envoyer
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  const renderSettings = () => (
    <div className="space-y-6">
      <h3 className="text-xl font-bold text-white">Configuration Email</h3>
      
      {/* Configuration IMAP */}
      <div className="bg-white/10 backdrop-blur-xl rounded-2xl p-6 border border-white/20">
        <h4 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
          <Server className="w-5 h-5 text-cyan-400" />
          Configuration IMAP/POP
        </h4>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          <div>
            <label className="block text-sm text-gray-300 mb-2">Serveur</label>
            <input
              type="text"
              value={imapConfig.server}
              onChange={(e) => setImapConfig(prev => ({ ...prev, server: e.target.value }))}
              className="w-full bg-black/40 border border-gray-600 rounded-xl px-4 py-3 text-white"
              placeholder="mail.omnia.sale"
            />
          </div>
          
          <div>
            <label className="block text-sm text-gray-300 mb-2">Port</label>
            <input
              type="number"
              value={imapConfig.port}
              onChange={(e) => setImapConfig(prev => ({ ...prev, port: parseInt(e.target.value) }))}
              className="w-full bg-black/40 border border-gray-600 rounded-xl px-4 py-3 text-white"
            />
          </div>
          
          <div>
            <label className="block text-sm text-gray-300 mb-2">Nom d'utilisateur</label>
            <input
              type="text"
              value={imapConfig.username}
              onChange={(e) => setImapConfig(prev => ({ ...prev, username: e.target.value }))}
              className="w-full bg-black/40 border border-gray-600 rounded-xl px-4 py-3 text-white"
              placeholder="support@omnia.sale"
            />
          </div>
          
          <div>
            <label className="block text-sm text-gray-300 mb-2">Mot de passe</label>
            <input
              type="password"
              value={imapConfig.password}
              onChange={(e) => setImapConfig(prev => ({ ...prev, password: e.target.value }))}
              className="w-full bg-black/40 border border-gray-600 rounded-xl px-4 py-3 text-white"
              placeholder="••••••••"
            />
          </div>
        </div>

        <div className="flex items-center gap-4 mb-6">
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={imapConfig.ssl}
              onChange={(e) => setImapConfig(prev => ({ ...prev, ssl: e.target.checked }))}
              className="w-4 h-4 text-cyan-600 bg-gray-800 border-gray-600 rounded focus:ring-cyan-500"
            />
            <span className="text-gray-300">SSL/TLS activé</span>
          </label>
        </div>

        <div className="flex items-center gap-4">
          <button
            onClick={handleTestConnection}
            disabled={isTestingConnection}
            className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 text-white px-6 py-3 rounded-xl font-semibold transition-all disabled:cursor-not-allowed flex items-center gap-2"
          >
            {isTestingConnection ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Test en cours...
              </>
            ) : (
              <>
                <Server className="w-4 h-4" />
                Tester la connexion
              </>
            )}
          </button>

          <div className={`flex items-center gap-2 px-4 py-2 rounded-xl ${
            connectionStatus === 'connected' ? 'bg-green-500/20 text-green-300' :
            connectionStatus === 'error' ? 'bg-red-500/20 text-red-300' :
            'bg-gray-500/20 text-gray-300'
          }`}>
            {connectionStatus === 'connected' ? (
              <CheckCircle className="w-4 h-4" />
            ) : connectionStatus === 'error' ? (
              <AlertCircle className="w-4 h-4" />
            ) : (
              <Clock className="w-4 h-4" />
            )}
            <span className="text-sm font-medium">
              {connectionStatus === 'connected' ? 'Connecté' :
               connectionStatus === 'error' ? 'Erreur' :
               'Non testé'}
            </span>
          </div>
        </div>

        {connectionStatus === 'connected' && (
          <div className="mt-4 bg-green-500/20 border border-green-400/30 rounded-xl p-4">
            <h5 className="font-semibold text-green-200 mb-2">✅ Connexion réussie !</h5>
            <ul className="text-green-300 text-sm space-y-1">
              <li>• Serveur IMAP accessible</li>
              <li>• Authentification validée</li>
              <li>• SSL/TLS fonctionnel</li>
              <li>• Prêt à recevoir les emails</li>
            </ul>
          </div>
        )}
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      {/* Header avec stats */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-white">Messagerie Support</h2>
          <p className="text-gray-300">Gestion des emails revendeurs depuis support@omnia.sale</p>
        </div>
        
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <div className={`w-3 h-3 rounded-full ${
              connectionStatus === 'connected' ? 'bg-green-400 animate-pulse' : 'bg-red-400'
            }`}></div>
            <span className="text-gray-300 text-sm">
              {connectionStatus === 'connected' ? 'Serveur connecté' : 'Serveur déconnecté'}
            </span>
          </div>
          
          {unreadCount > 0 && (
            <div className="bg-red-500 text-white px-3 py-1 rounded-full text-sm font-bold">
              {unreadCount} non lu{unreadCount > 1 ? 's' : ''}
            </div>
          )}
          
          <button
            onClick={() => setShowCompose(true)}
            className="bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-400 hover:to-emerald-500 text-white px-4 py-2 rounded-xl font-semibold transition-all flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            Nouveau
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-[600px]">
        {/* Sidebar emails */}
        <div className="lg:col-span-1">
          <div className="bg-white/10 backdrop-blur-xl rounded-2xl border border-white/20 h-full flex flex-col">
            {/* Tabs */}
            <div className="p-4 border-b border-white/10">
              <div className="flex gap-2">
                <button
                  onClick={() => setActiveTab('inbox')}
                  className={`flex items-center gap-2 px-3 py-2 rounded-xl transition-all ${
                    activeTab === 'inbox' 
                      ? 'bg-cyan-500 text-white' 
                      : 'text-gray-400 hover:text-white hover:bg-white/10'
                  }`}
                >
                  <Inbox className="w-4 h-4" />
                  Reçus
                  {unreadCount > 0 && activeTab !== 'inbox' && (
                    <span className="bg-red-500 text-white px-2 py-1 rounded-full text-xs">
                      {unreadCount}
                    </span>
                  )}
                </button>
                <button
                  onClick={() => setActiveTab('sent')}
                  className={`flex items-center gap-2 px-3 py-2 rounded-xl transition-all ${
                    activeTab === 'sent' 
                      ? 'bg-cyan-500 text-white' 
                      : 'text-gray-400 hover:text-white hover:bg-white/10'
                  }`}
                >
                  <Send className="w-4 h-4" />
                  Envoyés
                </button>
                <button
                  onClick={() => setActiveTab('settings')}
                  className={`flex items-center gap-2 px-3 py-2 rounded-xl transition-all ${
                    activeTab === 'settings' 
                      ? 'bg-cyan-500 text-white' 
                      : 'text-gray-400 hover:text-white hover:bg-white/10'
                  }`}
                >
                  <Settings className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Recherche */}
            {activeTab !== 'settings' && (
              <div className="p-4 border-b border-white/10">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type="text"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 bg-black/40 border border-gray-600 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:border-cyan-400"
                    placeholder="Rechercher..."
                  />
                </div>
              </div>
            )}

            {/* Contenu */}
            <div className="flex-1 overflow-y-auto p-4">
              {activeTab === 'settings' ? renderSettings() : renderEmailList()}
            </div>
          </div>
        </div>

        {/* Zone de lecture */}
        <div className="lg:col-span-2">
          <div className="bg-white/10 backdrop-blur-xl rounded-2xl border border-white/20 h-full p-6">
            {renderEmailDetail()}
          </div>
        </div>
      </div>

      {/* Modal composition */}
      {showCompose && renderCompose()}
    </div>
  );
};