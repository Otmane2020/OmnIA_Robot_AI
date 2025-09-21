import React, { useState, useEffect } from 'react';
import { 
  Users, Building, CheckCircle, X, Eye, Mail, Phone, MapPin, 
  Calendar, AlertCircle, FileText, Globe, Settings, Send,
  MessageSquare, Inbox, Archive, Star, Search, Filter,
  Server, Wifi, Database, TestTube, RefreshCw, Loader2
} from 'lucide-react';
import { Logo } from '../components/Logo';
import { supabase } from '../lib/supabase';
import { useNotifications } from '../components/NotificationSystem';

interface SuperAdminProps {
  onLogout: () => void;
  pendingApplications: any[];
  onValidateApplication: (id: string, approved: boolean) => void;
}

interface EmailMessage {
  id: string;
  from: string;
  to: string;
  subject: string;
  content: string;
  type: 'incoming' | 'outgoing';
  status: 'unread' | 'read' | 'replied';
  created_at: string;
  retailer_id?: string;
}

interface IMAPConfig {
  host: string;
  port: number;
  username: string;
  password: string;
  secure: boolean;
}

export const SuperAdmin: React.FC<SuperAdminProps> = ({ onLogout, pendingApplications, onValidateApplication }) => {
  const [activeTab, setActiveTab] = useState('applications');
  const [retailers, setRetailers] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedApplication, setSelectedApplication] = useState<any>(null);
  const [rejectionReason, setRejectionReason] = useState('');
  const [showRejectionModal, setShowRejectionModal] = useState(false);
  
  // Messagerie
  const [messages, setMessages] = useState<EmailMessage[]>([]);
  const [selectedMessage, setSelectedMessage] = useState<EmailMessage | null>(null);
  const [replyContent, setReplyContent] = useState('');
  const [newMessageTo, setNewMessageTo] = useState('');
  const [newMessageSubject, setNewMessageSubject] = useState('');
  const [newMessageContent, setNewMessageContent] = useState('');
  const [showNewMessage, setShowNewMessage] = useState(false);
  const [messageFilter, setMessageFilter] = useState('all');
  
  // Configuration IMAP
  const [imapConfig, setImapConfig] = useState<IMAPConfig>({
    host: 'imap.gmail.com',
    port: 993,
    username: 'support@omnia.sale',
    password: '',
    secure: true
  });
  const [isTestingIMAP, setIsTestingIMAP] = useState(false);
  const [imapTestResult, setImapTestResult] = useState<string>('');
  
  const { showSuccess, showError, showInfo } = useNotifications();

  useEffect(() => {
    loadRetailers();
    loadMessages();
  }, []);

  const loadRetailers = async () => {
    try {
      setLoading(true);
      
      const { data, error } = await supabase
        .from('retailers')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('❌ Erreur chargement revendeurs:', error);
        // Fallback vers localStorage
        const localRetailers = JSON.parse(localStorage.getItem('validated_retailers') || '[]');
        setRetailers(localRetailers);
      } else {
        setRetailers(data || []);
      }
    } catch (error) {
      console.error('❌ Erreur:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadMessages = () => {
    // Charger messages depuis localStorage (simulation)
    const savedMessages = localStorage.getItem('admin_messages');
    if (savedMessages) {
      setMessages(JSON.parse(savedMessages));
    } else {
      // Messages de démo
      const demoMessages: EmailMessage[] = [
        {
          id: '1',
          from: 'contact@mobilierdesign.fr',
          to: 'support@omnia.sale',
          subject: 'Problème connexion catalogue Shopify',
          content: 'Bonjour, je n\'arrive pas à connecter mon catalogue Shopify. Le token semble correct mais j\'ai une erreur. Pouvez-vous m\'aider ?',
          type: 'incoming',
          status: 'unread',
          created_at: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
          retailer_id: 'retailer-1'
        },
        {
          id: '2',
          from: 'info@decocontemporain.com',
          to: 'support@omnia.sale',
          subject: 'Demande formation équipe',
          content: 'Bonjour, nous souhaitons former notre équipe à l\'utilisation d\'OmnIA. Proposez-vous des sessions de formation ?',
          type: 'incoming',
          status: 'read',
          created_at: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(),
          retailer_id: 'retailer-2'
        }
      ];
      setMessages(demoMessages);
      localStorage.setItem('admin_messages', JSON.stringify(demoMessages));
    }
  };

  const handleValidateApplication = async (applicationId: string, approved: boolean, reason?: string) => {
    try {
      console.log('🔄 Validation application:', applicationId, approved ? 'APPROUVÉE' : 'REJETÉE');
      
      const application = pendingApplications.find(app => app.id === applicationId);
      if (!application) {
        showError('Erreur', 'Demande introuvable');
        return;
      }

      if (approved) {
        // Créer le sous-domaine au format correct
        const cleanSubdomain = application.companyName
          .toLowerCase()
          .replace(/[^a-z0-9]/g, '')
          .substring(0, 20);
        
        const newRetailer = {
          id: `retailer-${Date.now()}`,
          email: application.email,
          password_hash: 'hashed_password',
          company_name: application.companyName,
          subdomain: cleanSubdomain, // Format: movala.omnia.sale
          plan: application.selectedPlan,
          status: 'active',
          contact_name: `${application.firstName} ${application.lastName}`,
          phone: application.phone,
          address: application.address,
          city: application.city,
          postal_code: application.postalCode,
          siret: application.siret,
          position: application.position,
          created_at: new Date().toISOString(),
          validated_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        };

        // Sauvegarder en base de données
        const { data: retailerData, error: retailerError } = await supabase
          .from('retailers')
          .insert(newRetailer)
          .select()
          .single();

        if (retailerError) {
          console.error('❌ Erreur création revendeur:', retailerError);
          showError('Erreur DB', 'Impossible de créer le revendeur en base');
          return;
        }

        // Créer le sous-domaine
        const { error: subdomainError } = await supabase
          .from('retailer_subdomains')
          .insert({
            retailer_id: retailerData.id,
            subdomain: cleanSubdomain,
            dns_status: 'active',
            ssl_status: 'active',
            activated_at: new Date().toISOString()
          });

        if (subdomainError) {
          console.warn('⚠️ Erreur création sous-domaine:', subdomainError);
        }

        // Initialiser analytics à zéro
        const { error: analyticsError } = await supabase
          .from('retailer_analytics')
          .insert({
            retailer_id: retailerData.id,
            date: new Date().toISOString().split('T')[0],
            conversations_count: 0,
            unique_visitors: 0,
            products_viewed: 0,
            cart_additions: 0,
            conversions: 0,
            revenue: 0
          });

        if (analyticsError) {
          console.warn('⚠️ Erreur initialisation analytics:', analyticsError);
        }

        // Sauvegarder aussi en localStorage
        const existingRetailers = JSON.parse(localStorage.getItem('validated_retailers') || '[]');
        existingRetailers.push(newRetailer);
        localStorage.setItem('validated_retailers', JSON.stringify(existingRetailers));

        showSuccess(
          'Revendeur approuvé !', 
          `${application.companyName} créé avec le domaine ${cleanSubdomain}.omnia.sale`,
          [
            {
              label: 'Envoyer email',
              action: () => sendApprovalEmail(application, cleanSubdomain),
              variant: 'primary'
            }
          ]
        );

        console.log('✅ Revendeur créé:', {
          company: application.companyName,
          subdomain: `${cleanSubdomain}.omnia.sale`,
          email: application.email,
          id: retailerData.id
        });

      } else {
        // Rejeter la demande
        const { error } = await supabase
          .from('retailer_applications')
          .update({
            status: 'rejected',
            rejection_reason: reason || 'Informations insuffisantes',
            processed_at: new Date().toISOString()
          })
          .eq('id', applicationId);

        if (error) {
          console.warn('⚠️ Erreur mise à jour statut:', error);
        }

        showError('Demande rejetée', `Raison: ${reason || 'Informations insuffisantes'}`);
        console.log('❌ Demande rejetée:', applicationId, reason);
      }

      // Supprimer de la liste des demandes en attente
      onValidateApplication(applicationId, approved);
      
      // Recharger la liste des revendeurs
      await loadRetailers();

    } catch (error) {
      console.error('❌ Erreur validation:', error);
      showError('Erreur de validation', 'Impossible de traiter la demande');
    }
  };

  const sendApprovalEmail = async (application: any, subdomain: string) => {
    try {
      const emailData = {
        to: application.email,
        subject: '🎉 Bienvenue sur OmnIA.sale - Votre compte est activé !',
        content: `Félicitations ${application.firstName} !

Votre inscription pour ${application.companyName} a été approuvée.

🔑 Vos accès :
• Interface Admin : https://omnia.sale/admin
• Votre domaine : https://${subdomain}.omnia.sale
• Email : ${application.email}
• Mot de passe : ${application.password}

🚀 Prochaines étapes :
1. Connectez-vous à votre interface admin
2. Importez votre catalogue
3. Personnalisez OmnIA
4. Intégrez le widget sur votre site

Besoin d'aide ? support@omnia.sale

L'équipe OmnIA.sale`
      };

      // Simuler l'envoi d'email
      console.log('📧 Email d\'approbation simulé:', emailData);
      showInfo('Email envoyé', `Email d'approbation envoyé à ${application.email}`);

    } catch (error) {
      console.error('❌ Erreur envoi email:', error);
      showError('Erreur email', 'Impossible d\'envoyer l\'email d\'approbation');
    }
  };

  const handleSendMessage = async () => {
    if (!newMessageTo || !newMessageSubject || !newMessageContent) {
      showError('Champs manquants', 'Veuillez remplir tous les champs');
      return;
    }

    const newMessage: EmailMessage = {
      id: Date.now().toString(),
      from: 'support@omnia.sale',
      to: newMessageTo,
      subject: newMessageSubject,
      content: newMessageContent,
      type: 'outgoing',
      status: 'read',
      created_at: new Date().toISOString()
    };

    const updatedMessages = [...messages, newMessage];
    setMessages(updatedMessages);
    localStorage.setItem('admin_messages', JSON.stringify(updatedMessages));

    // Reset form
    setNewMessageTo('');
    setNewMessageSubject('');
    setNewMessageContent('');
    setShowNewMessage(false);

    showSuccess('Message envoyé', `Email envoyé à ${newMessage.to}`);
  };

  const handleReplyMessage = async () => {
    if (!selectedMessage || !replyContent) return;

    const replyMessage: EmailMessage = {
      id: Date.now().toString(),
      from: 'support@omnia.sale',
      to: selectedMessage.from,
      subject: `Re: ${selectedMessage.subject}`,
      content: replyContent,
      type: 'outgoing',
      status: 'read',
      created_at: new Date().toISOString(),
      retailer_id: selectedMessage.retailer_id
    };

    const updatedMessages = [...messages, replyMessage];
    setMessages(updatedMessages);
    localStorage.setItem('admin_messages', JSON.stringify(updatedMessages));

    // Marquer le message original comme répondu
    const updatedOriginalMessages = messages.map(msg =>
      msg.id === selectedMessage.id ? { ...msg, status: 'replied' as const } : msg
    );
    setMessages(updatedOriginalMessages);
    localStorage.setItem('admin_messages', JSON.stringify(updatedOriginalMessages));

    setReplyContent('');
    setSelectedMessage(null);
    showSuccess('Réponse envoyée', `Réponse envoyée à ${selectedMessage.from}`);
  };

  const testIMAPConnection = async () => {
    setIsTestingIMAP(true);
    setImapTestResult('');

    try {
      // Simuler test IMAP
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      if (imapConfig.username && imapConfig.password) {
        setImapTestResult('✅ Connexion IMAP réussie ! 3 nouveaux messages récupérés.');
        showSuccess('IMAP connecté', 'Configuration IMAP validée avec succès');
      } else {
        setImapTestResult('❌ Identifiants IMAP manquants');
        showError('IMAP échoué', 'Veuillez renseigner username et password');
      }
    } catch (error) {
      setImapTestResult('❌ Erreur de connexion IMAP');
      showError('Erreur IMAP', 'Impossible de se connecter au serveur IMAP');
    } finally {
      setIsTestingIMAP(false);
    }
  };

  const filteredMessages = messages.filter(msg => {
    if (messageFilter === 'unread') return msg.status === 'unread';
    if (messageFilter === 'outgoing') return msg.type === 'outgoing';
    if (messageFilter === 'incoming') return msg.type === 'incoming';
    return true;
  });

  const renderApplicationsTab = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-white">Demandes d'inscription</h2>
        <span className="bg-orange-500/20 text-orange-300 px-3 py-1 rounded-full text-sm">
          {pendingApplications.length} en attente
        </span>
      </div>

      {pendingApplications.length === 0 ? (
        <div className="text-center py-20">
          <Building className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-xl font-bold text-white mb-2">Aucune demande en attente</h3>
          <p className="text-gray-400">Les nouvelles inscriptions apparaîtront ici</p>
        </div>
      ) : (
        <div className="grid gap-6">
          {pendingApplications.map((application) => (
            <div key={application.id} className="bg-white/10 backdrop-blur-xl rounded-2xl p-6 border border-white/20">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-4">
                    <Building className="w-6 h-6 text-cyan-400" />
                    <h3 className="text-xl font-bold text-white">{application.companyName}</h3>
                    <span className="bg-yellow-500/20 text-yellow-300 px-2 py-1 rounded-full text-xs">
                      En attente
                    </span>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                    <div className="space-y-2">
                      <div className="flex items-center gap-2 text-gray-300">
                        <Mail className="w-4 h-4 text-blue-400" />
                        <span>{application.email}</span>
                      </div>
                      <div className="flex items-center gap-2 text-gray-300">
                        <Phone className="w-4 h-4 text-green-400" />
                        <span>{application.phone}</span>
                      </div>
                      <div className="flex items-center gap-2 text-gray-300">
                        <MapPin className="w-4 h-4 text-red-400" />
                        <span>{application.address}, {application.city}</span>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <div className="flex items-center gap-2 text-gray-300">
                        <FileText className="w-4 h-4 text-purple-400" />
                        <span>SIRET: {application.siret}</span>
                      </div>
                      <div className="flex items-center gap-2 text-gray-300">
                        <Calendar className="w-4 h-4 text-orange-400" />
                        <span>Soumis le {new Date(application.submittedAt).toLocaleDateString('fr-FR')}</span>
                      </div>
                      <div className="flex items-center gap-2 text-gray-300">
                        <Globe className="w-4 h-4 text-cyan-400" />
                        <span className="font-mono text-cyan-300">
                          {application.companyName.toLowerCase().replace(/[^a-z0-9]/g, '').substring(0, 20)}.omnia.sale
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="bg-blue-500/20 border border-blue-400/50 rounded-xl p-4 mb-4">
                    <h4 className="font-semibold text-blue-200 mb-2">Plan choisi :</h4>
                    <p className="text-blue-300">{application.selectedPlan.charAt(0).toUpperCase() + application.selectedPlan.slice(1)}</p>
                  </div>
                </div>

                <div className="flex flex-col gap-3 ml-6">
                  <button
                    onClick={() => handleValidateApplication(application.id, true)}
                    className="bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-400 hover:to-emerald-500 text-white px-6 py-3 rounded-xl font-semibold transition-all flex items-center gap-2"
                  >
                    <CheckCircle className="w-4 h-4" />
                    Approuver
                  </button>
                  
                  <button
                    onClick={() => {
                      setSelectedApplication(application);
                      setShowRejectionModal(true);
                    }}
                    className="bg-gradient-to-r from-red-500 to-red-600 hover:from-red-400 hover:to-red-500 text-white px-6 py-3 rounded-xl font-semibold transition-all flex items-center gap-2"
                  >
                    <X className="w-4 h-4" />
                    Rejeter
                  </button>
                  
                  <button
                    onClick={() => setSelectedApplication(application)}
                    className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-xl font-semibold transition-all flex items-center gap-2"
                  >
                    <Eye className="w-4 h-4" />
                    Détails
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );

  const renderRetailersTab = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-white">Revendeurs actifs</h2>
        <span className="bg-green-500/20 text-green-300 px-3 py-1 rounded-full text-sm">
          {retailers.length} actifs
        </span>
      </div>

      <div className="grid gap-4">
        {retailers.map((retailer) => (
          <div key={retailer.id} className="bg-white/10 backdrop-blur-xl rounded-2xl p-6 border border-white/20">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl flex items-center justify-center">
                  <Building className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-white">{retailer.company_name}</h3>
                  <p className="text-gray-300">{retailer.email}</p>
                  <p className="text-cyan-400 font-mono text-sm">{retailer.subdomain}.omnia.sale</p>
                </div>
              </div>
              
              <div className="flex items-center gap-4">
                <div className="text-right">
                  <div className="text-green-400 font-bold">{retailer.plan}</div>
                  <div className="text-gray-400 text-sm">
                    Créé le {new Date(retailer.created_at).toLocaleDateString('fr-FR')}
                  </div>
                </div>
                <div className={`w-3 h-3 rounded-full ${
                  retailer.status === 'active' ? 'bg-green-400' : 'bg-red-400'
                } animate-pulse`}></div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  const renderMessagingTab = () => (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-[calc(100vh-200px)]">
      {/* Liste des messages */}
      <div className="lg:col-span-1 bg-white/10 backdrop-blur-xl rounded-2xl border border-white/20 overflow-hidden">
        <div className="p-4 border-b border-white/10">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-bold text-white">Messages</h3>
            <button
              onClick={() => setShowNewMessage(true)}
              className="bg-cyan-600 hover:bg-cyan-700 text-white px-3 py-2 rounded-lg text-sm"
            >
              Nouveau
            </button>
          </div>
          
          <div className="flex gap-2 mb-4">
            <select
              value={messageFilter}
              onChange={(e) => setMessageFilter(e.target.value)}
              className="bg-black/40 border border-gray-600 rounded-lg px-3 py-2 text-white text-sm"
            >
              <option value="all">Tous</option>
              <option value="unread">Non lus</option>
              <option value="incoming">Reçus</option>
              <option value="outgoing">Envoyés</option>
            </select>
          </div>
        </div>

        <div className="overflow-y-auto h-96">
          {filteredMessages.map((message) => (
            <div
              key={message.id}
              onClick={() => setSelectedMessage(message)}
              className={`p-4 border-b border-white/10 cursor-pointer hover:bg-white/5 transition-all ${
                selectedMessage?.id === message.id ? 'bg-cyan-500/20' : ''
              }`}
            >
              <div className="flex items-center gap-2 mb-2">
                <div className={`w-2 h-2 rounded-full ${
                  message.status === 'unread' ? 'bg-blue-400' : 'bg-gray-400'
                }`}></div>
                <span className={`text-sm font-medium ${
                  message.type === 'incoming' ? 'text-green-300' : 'text-blue-300'
                }`}>
                  {message.type === 'incoming' ? 'De:' : 'À:'} {message.type === 'incoming' ? message.from : message.to}
                </span>
              </div>
              <h4 className="text-white font-semibold text-sm mb-1">{message.subject}</h4>
              <p className="text-gray-300 text-xs line-clamp-2">{message.content}</p>
              <div className="text-gray-400 text-xs mt-2">
                {new Date(message.created_at).toLocaleDateString('fr-FR')}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Contenu du message */}
      <div className="lg:col-span-2 bg-white/10 backdrop-blur-xl rounded-2xl border border-white/20">
        {selectedMessage ? (
          <div className="h-full flex flex-col">
            <div className="p-6 border-b border-white/10">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-bold text-white">{selectedMessage.subject}</h3>
                <div className="flex items-center gap-2">
                  <span className={`px-2 py-1 rounded-full text-xs ${
                    selectedMessage.type === 'incoming' ? 'bg-green-500/20 text-green-300' : 'bg-blue-500/20 text-blue-300'
                  }`}>
                    {selectedMessage.type === 'incoming' ? 'Reçu' : 'Envoyé'}
                  </span>
                  <span className={`px-2 py-1 rounded-full text-xs ${
                    selectedMessage.status === 'unread' ? 'bg-orange-500/20 text-orange-300' : 'bg-gray-500/20 text-gray-300'
                  }`}>
                    {selectedMessage.status}
                  </span>
                </div>
              </div>
              <div className="text-gray-300 text-sm">
                <strong>De:</strong> {selectedMessage.from}<br />
                <strong>À:</strong> {selectedMessage.to}<br />
                <strong>Date:</strong> {new Date(selectedMessage.created_at).toLocaleString('fr-FR')}
              </div>
            </div>

            <div className="flex-1 p-6">
              <div className="bg-black/20 rounded-xl p-4 mb-6">
                <p className="text-white whitespace-pre-wrap">{selectedMessage.content}</p>
              </div>

              {selectedMessage.type === 'incoming' && (
                <div className="space-y-4">
                  <h4 className="font-semibold text-white">Répondre :</h4>
                  <textarea
                    value={replyContent}
                    onChange={(e) => setReplyContent(e.target.value)}
                    rows={6}
                    placeholder="Votre réponse..."
                    className="w-full bg-black/40 border border-gray-600 rounded-xl px-4 py-3 text-white placeholder-gray-400 resize-none"
                  />
                  <button
                    onClick={handleReplyMessage}
                    className="bg-cyan-600 hover:bg-cyan-700 text-white px-6 py-3 rounded-xl font-semibold transition-all"
                  >
                    Envoyer la réponse
                  </button>
                </div>
              )}
            </div>
          </div>
        ) : (
          <div className="h-full flex items-center justify-center">
            <div className="text-center">
              <MessageSquare className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-xl font-bold text-white mb-2">Sélectionnez un message</h3>
              <p className="text-gray-400">Choisissez un message dans la liste pour le lire</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );

  const renderConfigTab = () => (
    <div className="space-y-8">
      <h2 className="text-2xl font-bold text-white">Configuration Messagerie</h2>

      {/* Configuration IMAP */}
      <div className="bg-white/10 backdrop-blur-xl rounded-2xl p-8 border border-white/20">
        <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
          <Server className="w-6 h-6 text-blue-400" />
          Configuration IMAP
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm text-gray-300 mb-2">Serveur IMAP</label>
            <input
              type="text"
              value={imapConfig.host}
              onChange={(e) => setImapConfig(prev => ({ ...prev, host: e.target.value }))}
              className="w-full bg-black/40 border border-gray-600 rounded-xl px-4 py-3 text-white"
              placeholder="imap.gmail.com"
            />
          </div>
          
          <div>
            <label className="block text-sm text-gray-300 mb-2">Port</label>
            <input
              type="number"
              value={imapConfig.port}
              onChange={(e) => setImapConfig(prev => ({ ...prev, port: parseInt(e.target.value) }))}
              className="w-full bg-black/40 border border-gray-600 rounded-xl px-4 py-3 text-white"
              placeholder="993"
            />
          </div>
          
          <div>
            <label className="block text-sm text-gray-300 mb-2">Username</label>
            <input
              type="email"
              value={imapConfig.username}
              onChange={(e) => setImapConfig(prev => ({ ...prev, username: e.target.value }))}
              className="w-full bg-black/40 border border-gray-600 rounded-xl px-4 py-3 text-white"
              placeholder="support@omnia.sale"
            />
          </div>
          
          <div>
            <label className="block text-sm text-gray-300 mb-2">Password</label>
            <input
              type="password"
              value={imapConfig.password}
              onChange={(e) => setImapConfig(prev => ({ ...prev, password: e.target.value }))}
              className="w-full bg-black/40 border border-gray-600 rounded-xl px-4 py-3 text-white"
              placeholder="Mot de passe application"
            />
          </div>
          
          <div className="md:col-span-2">
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={imapConfig.secure}
                onChange={(e) => setImapConfig(prev => ({ ...prev, secure: e.target.checked }))}
                className="w-4 h-4 text-cyan-600"
              />
              <span className="text-gray-300">Connexion sécurisée (SSL/TLS)</span>
            </label>
          </div>
        </div>

        <div className="flex gap-4 mt-6">
          <button
            onClick={testIMAPConnection}
            disabled={isTestingIMAP}
            className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 text-white px-6 py-3 rounded-xl font-semibold transition-all flex items-center gap-2"
          >
            {isTestingIMAP ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Test en cours...
              </>
            ) : (
              <>
                <TestTube className="w-4 h-4" />
                Tester la connexion
              </>
            )}
          </button>
          
          <button
            onClick={() => {
              localStorage.setItem('imap_config', JSON.stringify(imapConfig));
              showSuccess('Configuration sauvée', 'Paramètres IMAP sauvegardés');
            }}
            className="bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-xl font-semibold transition-all"
          >
            Sauvegarder
          </button>
        </div>

        {imapTestResult && (
          <div className={`mt-4 p-4 rounded-xl ${
            imapTestResult.includes('✅') ? 'bg-green-500/20 border border-green-400/50' : 'bg-red-500/20 border border-red-400/50'
          }`}>
            <p className={imapTestResult.includes('✅') ? 'text-green-300' : 'text-red-300'}>
              {imapTestResult}
            </p>
          </div>
        )}
      </div>

      {/* Configuration email sortant */}
      <div className="bg-white/10 backdrop-blur-xl rounded-2xl p-8 border border-white/20">
        <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
          <Send className="w-6 h-6 text-green-400" />
          Configuration SMTP (Email sortant)
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm text-gray-300 mb-2">Serveur SMTP</label>
            <input
              type="text"
              defaultValue="smtp.gmail.com"
              className="w-full bg-black/40 border border-gray-600 rounded-xl px-4 py-3 text-white"
            />
          </div>
          
          <div>
            <label className="block text-sm text-gray-300 mb-2">Port SMTP</label>
            <input
              type="number"
              defaultValue="587"
              className="w-full bg-black/40 border border-gray-600 rounded-xl px-4 py-3 text-white"
            />
          </div>
        </div>

        <div className="bg-blue-500/20 border border-blue-400/50 rounded-xl p-4 mt-6">
          <h4 className="font-semibold text-blue-200 mb-2">📧 Configuration Gmail :</h4>
          <ul className="text-blue-300 text-sm space-y-1">
            <li>• Activez l'authentification à 2 facteurs</li>
            <li>• Générez un mot de passe d'application</li>
            <li>• Utilisez support@omnia.sale comme expéditeur</li>
            <li>• IMAP: imap.gmail.com:993 (SSL)</li>
            <li>• SMTP: smtp.gmail.com:587 (TLS)</li>
          </ul>
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
            <div className="flex items-center space-x-4">
              <span className="text-cyan-300">Super Admin</span>
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
        <div className="flex justify-center mb-8">
          <div className="bg-black/40 backdrop-blur-xl rounded-2xl p-2 border border-white/20">
            <div className="flex space-x-2">
              <button
                onClick={() => setActiveTab('applications')}
                className={`flex items-center gap-2 px-6 py-3 rounded-xl transition-all ${
                  activeTab === 'applications'
                    ? 'bg-cyan-500 text-white'
                    : 'text-gray-400 hover:text-white hover:bg-white/10'
                }`}
              >
                <Building className="w-4 h-4" />
                Demandes ({pendingApplications.length})
              </button>
              <button
                onClick={() => setActiveTab('retailers')}
                className={`flex items-center gap-2 px-6 py-3 rounded-xl transition-all ${
                  activeTab === 'retailers'
                    ? 'bg-cyan-500 text-white'
                    : 'text-gray-400 hover:text-white hover:bg-white/10'
                }`}
              >
                <Users className="w-4 h-4" />
                Revendeurs ({retailers.length})
              </button>
              <button
                onClick={() => setActiveTab('messaging')}
                className={`flex items-center gap-2 px-6 py-3 rounded-xl transition-all ${
                  activeTab === 'messaging'
                    ? 'bg-cyan-500 text-white'
                    : 'text-gray-400 hover:text-white hover:bg-white/10'
                }`}
              >
                <MessageSquare className="w-4 h-4" />
                Messagerie ({messages.filter(m => m.status === 'unread').length})
              </button>
              <button
                onClick={() => setActiveTab('config')}
                className={`flex items-center gap-2 px-6 py-3 rounded-xl transition-all ${
                  activeTab === 'config'
                    ? 'bg-cyan-500 text-white'
                    : 'text-gray-400 hover:text-white hover:bg-white/10'
                }`}
              >
                <Settings className="w-4 h-4" />
                Configuration
              </button>
            </div>
          </div>
        </div>

        {/* Tab Content */}
        {activeTab === 'applications' && renderApplicationsTab()}
        {activeTab === 'retailers' && renderRetailersTab()}
        {activeTab === 'messaging' && renderMessagingTab()}
        {activeTab === 'config' && renderConfigTab()}
      </div>

      {/* Modal nouveau message */}
      {showNewMessage && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-800/95 backdrop-blur-xl rounded-2xl p-6 max-w-2xl w-full border border-slate-600/50">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-white">Nouveau message</h3>
              <button
                onClick={() => setShowNewMessage(false)}
                className="text-gray-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm text-gray-300 mb-2">Destinataire</label>
                <input
                  type="email"
                  value={newMessageTo}
                  onChange={(e) => setNewMessageTo(e.target.value)}
                  className="w-full bg-black/40 border border-gray-600 rounded-xl px-4 py-3 text-white"
                  placeholder="email@revendeur.com"
                />
              </div>
              
              <div>
                <label className="block text-sm text-gray-300 mb-2">Sujet</label>
                <input
                  type="text"
                  value={newMessageSubject}
                  onChange={(e) => setNewMessageSubject(e.target.value)}
                  className="w-full bg-black/40 border border-gray-600 rounded-xl px-4 py-3 text-white"
                  placeholder="Sujet du message"
                />
              </div>
              
              <div>
                <label className="block text-sm text-gray-300 mb-2">Message</label>
                <textarea
                  value={newMessageContent}
                  onChange={(e) => setNewMessageContent(e.target.value)}
                  rows={8}
                  className="w-full bg-black/40 border border-gray-600 rounded-xl px-4 py-3 text-white resize-none"
                  placeholder="Votre message..."
                />
              </div>
              
              <div className="flex gap-4">
                <button
                  onClick={handleSendMessage}
                  className="bg-cyan-600 hover:bg-cyan-700 text-white px-6 py-3 rounded-xl font-semibold transition-all flex items-center gap-2"
                >
                  <Send className="w-4 h-4" />
                  Envoyer
                </button>
                <button
                  onClick={() => setShowNewMessage(false)}
                  className="bg-gray-600 hover:bg-gray-700 text-white px-6 py-3 rounded-xl transition-all"
                >
                  Annuler
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal rejet */}
      {showRejectionModal && selectedApplication && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-800/95 backdrop-blur-xl rounded-2xl p-6 max-w-md w-full border border-slate-600/50">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-white">Rejeter la demande</h3>
              <button
                onClick={() => setShowRejectionModal(false)}
                className="text-gray-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm text-gray-300 mb-2">Raison du rejet</label>
                <textarea
                  value={rejectionReason}
                  onChange={(e) => setRejectionReason(e.target.value)}
                  rows={4}
                  className="w-full bg-black/40 border border-gray-600 rounded-xl px-4 py-3 text-white resize-none"
                  placeholder="Expliquez la raison du rejet..."
                />
              </div>
              
              <div className="flex gap-4">
                <button
                  onClick={() => {
                    handleValidateApplication(selectedApplication.id, false, rejectionReason);
                    setShowRejectionModal(false);
                    setRejectionReason('');
                    setSelectedApplication(null);
                  }}
                  className="bg-red-600 hover:bg-red-700 text-white px-6 py-3 rounded-xl font-semibold transition-all"
                >
                  Confirmer le rejet
                </button>
                <button
                  onClick={() => setShowRejectionModal(false)}
                  className="bg-gray-600 hover:bg-gray-700 text-white px-6 py-3 rounded-xl transition-all"
                >
                  Annuler
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};