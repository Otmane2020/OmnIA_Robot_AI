import React, { useState, useEffect } from 'react';
import { MessageSquare, User, Bot, Clock, MapPin, Monitor, Smartphone, Star, Eye, Filter, Search } from 'lucide-react';
import { supabase } from '../lib/supabase';

interface Conversation {
  id: string;
  session_id: string;
  role: 'client' | 'robot';
  message?: string;
  response?: string;
  products?: string[];
  intent?: string;
  final_action?: string;
  location?: string;
  ip_address?: string;
  user_agent?: string;
  satisfaction_score?: number;
  duration?: string;
  created_at: string;
}

interface ConversationSession {
  session_id: string;
  messages: Conversation[];
  start_time: string;
  end_time: string;
  total_duration: string;
  products_shown: string[];
  final_action?: string;
  client_info: {
    location?: string;
    device?: string;
    ip?: string;
  };
}

export const ConversationHistory: React.FC = () => {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [sessions, setSessions] = useState<ConversationSession[]>([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState<'sessions' | 'messages'>('sessions');
  const [searchTerm, setSearchTerm] = useState('');
  const [filterIntent, setFilterIntent] = useState('all');
  const [selectedSession, setSelectedSession] = useState<string | null>(null);

  useEffect(() => {
    loadConversations();
  }, []);

  // Générer des conversations de démo réalistes
  const generateDemoConversations = (): Conversation[] => {
    const demoConversations = [
      // Session 1 - Recherche canapé
      {
        id: 'demo-1-1',
        session_id: 'demo-session-1',
        role: 'client' as const,
        message: 'Bonjour, je cherche un canapé pour mon salon',
        intent: 'product_search',
        location: 'Paris, France',
        ip_address: '192.168.1.100',
        user_agent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        created_at: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString()
      },
      {
        id: 'demo-1-2',
        session_id: 'demo-session-1',
        role: 'robot' as const,
        response: 'Bonjour ! Parfait, quel style vous plaît ? Notre ALYANA convertible en velours côtelé est très apprécié !',
        products: ['Canapé ALYANA'],
        final_action: 'product_recommendation',
        created_at: new Date(Date.now() - 2 * 60 * 60 * 1000 + 30000).toISOString()
      },
      {
        id: 'demo-1-3',
        session_id: 'demo-session-1',
        role: 'client' as const,
        message: 'Il fait quelle taille ?',
        intent: 'product_inquiry',
        location: 'Paris, France',
        ip_address: '192.168.1.100',
        user_agent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        created_at: new Date(Date.now() - 2 * 60 * 60 * 1000 + 60000).toISOString()
      },
      {
        id: 'demo-1-4',
        session_id: 'demo-session-1',
        role: 'robot' as const,
        response: 'Le canapé ALYANA fait 280x180cm une fois déplié en lit. Parfait pour un salon moderne !',
        final_action: 'information_provided',
        created_at: new Date(Date.now() - 2 * 60 * 60 * 1000 + 90000).toISOString()
      },
      
      // Session 2 - Achat table
      {
        id: 'demo-2-1',
        session_id: 'demo-session-2',
        role: 'client' as const,
        message: 'Je veux une table ronde en travertin',
        intent: 'product_search',
        location: 'Lyon, France',
        ip_address: '192.168.1.101',
        user_agent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 15_0 like Mac OS X)',
        created_at: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString()
      },
      {
        id: 'demo-2-2',
        session_id: 'demo-session-2',
        role: 'robot' as const,
        response: 'Excellente idée ! Notre table AUREA en travertin naturel est disponible en Ø100cm (499€) et Ø120cm (549€)',
        products: ['Table AUREA'],
        final_action: 'product_recommendation',
        created_at: new Date(Date.now() - 4 * 60 * 60 * 1000 + 30000).toISOString()
      },
      {
        id: 'demo-2-3',
        session_id: 'demo-session-2',
        role: 'client' as const,
        message: 'Je prends la 120cm',
        intent: 'purchase_intent',
        location: 'Lyon, France',
        ip_address: '192.168.1.101',
        user_agent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 15_0 like Mac OS X)',
        created_at: new Date(Date.now() - 4 * 60 * 60 * 1000 + 60000).toISOString()
      },
      {
        id: 'demo-2-4',
        session_id: 'demo-session-2',
        role: 'robot' as const,
        response: 'Parfait ! Table AUREA Ø120cm ajoutée. Souhaitez-vous des chaises assorties ?',
        final_action: 'cart_add',
        created_at: new Date(Date.now() - 4 * 60 * 60 * 1000 + 90000).toISOString()
      },
      
      // Session 3 - Conseil déco
      {
        id: 'demo-3-1',
        session_id: 'demo-session-3',
        role: 'client' as const,
        message: 'Conseils pour aménager une chambre de 12m²',
        intent: 'advice_request',
        location: 'Marseille, France',
        ip_address: '192.168.1.102',
        user_agent: 'Mozilla/5.0 (iPad; CPU OS 15_0 like Mac OS X)',
        created_at: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString()
      },
      {
        id: 'demo-3-2',
        session_id: 'demo-session-3',
        role: 'robot' as const,
        response: 'Pour 12m², privilégiez un lit avec rangements intégrés et des meubles multifonctions. Couleurs claires pour agrandir !',
        final_action: 'advice_provided',
        created_at: new Date(Date.now() - 6 * 60 * 60 * 1000 + 30000).toISOString()
      },
      
      // Session 4 - Recherche chaise
      {
        id: 'demo-4-1',
        session_id: 'demo-session-4',
        role: 'client' as const,
        message: 'Chaise de bureau ergonomique',
        intent: 'product_search',
        location: 'Toulouse, France',
        ip_address: '192.168.1.103',
        user_agent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)',
        created_at: new Date(Date.now() - 8 * 60 * 60 * 1000).toISOString()
      },
      {
        id: 'demo-4-2',
        session_id: 'demo-session-4',
        role: 'robot' as const,
        response: 'Notre chaise INAYA en chenille avec structure métal offre un excellent confort. Design contemporain à 99€ !',
        products: ['Chaise INAYA'],
        final_action: 'product_recommendation',
        created_at: new Date(Date.now() - 8 * 60 * 60 * 1000 + 30000).toISOString()
      }
    ];

    return demoConversations;
  };

  // Charger les conversations depuis localStorage aussi
  const loadLocalConversations = () => {
    try {
      const localConversations = localStorage.getItem('omnia_conversations');
      if (localConversations) {
        const parsed = JSON.parse(localConversations);
        return parsed.map((conv: any) => ({
          id: conv.id || crypto.randomUUID(),
          session_id: conv.session_id || 'local-session',
          user_message: conv.content || conv.message,
          ai_response: conv.response,
          products_shown: conv.products || [],
          user_ip: '127.0.0.1',
          user_agent: 'Local Browser',
          conversation_type: 'product_search',
          created_at: conv.timestamp || new Date().toISOString()
        }));
      }
    } catch (error) {
      console.error('Erreur chargement conversations locales:', error);
    }
    return [];
  };

  const loadConversations = async () => {
    try {
      setLoading(true);
      
      // Charger conversations locales
      const localConversations = loadLocalConversations();
      
      // Ajouter conversations de démo si pas assez de données
      const demoConversations = generateDemoConversations();
      
      const { data, error } = await supabase
        .from('retailer_conversations')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(200);

      if (error) {
        console.error('❌ Erreur chargement conversations:', error);
        // Utiliser seulement les conversations locales si erreur DB
        const allConversations = [...localConversations, ...demoConversations];
        setConversations(allConversations);
        const sessionGroups = groupConversationsBySession(allConversations);
        setSessions(sessionGroups);
        return;
      }

      // Combiner conversations DB, locales et démo
      const allConversations = [...(data || []), ...localConversations, ...demoConversations];
      setConversations(allConversations);
      
      // Grouper par sessions
      const sessionGroups = groupConversationsBySession(allConversations);
      setSessions(sessionGroups);
      
      console.log('✅ Conversations chargées:', allConversations.length, '(DB:', data?.length || 0, '+ Local:', localConversations.length, '+ Démo:', demoConversations.length, ')');

    } catch (error) {
      console.error('❌ Erreur:', error);
      // Fallback vers conversations locales + démo
      const localConversations = loadLocalConversations();
      const demoConversations = generateDemoConversations();
      const allConversations = [...localConversations, ...demoConversations];
      setConversations(allConversations);
      const sessionGroups = groupConversationsBySession(allConversations);
      setSessions(sessionGroups);
    } finally {
      setLoading(false);
    }
  };

  const groupConversationsBySession = (conversations: Conversation[]): ConversationSession[] => {
    const sessionMap = new Map<string, Conversation[]>();
    
    conversations.forEach(conv => {
      const sessionId = conv.session_id || 'no-session';
      if (!sessionMap.has(sessionId)) {
        sessionMap.set(sessionId, []);
      }
      sessionMap.get(sessionId)!.push(conv);
    });

    return Array.from(sessionMap.entries()).map(([sessionId, messages]) => {
      const sortedMessages = messages.sort((a, b) => 
        new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
      );
      
      const startTime = sortedMessages[0]?.created_at;
      const endTime = sortedMessages[sortedMessages.length - 1]?.created_at;
      
      // Calculer durée
      const duration = startTime && endTime ? 
        Math.round((new Date(endTime).getTime() - new Date(startTime).getTime()) / 1000) : 0;
      
      // Extraire produits mentionnés
      const productsShown = new Set<string>();
      messages.forEach(msg => {
        if (msg.products && Array.isArray(msg.products)) {
          msg.products.forEach(product => productsShown.add(product));
        }
      });

      // Détecter action finale
      const lastRobotMessage = messages.filter(m => m.role === 'robot').pop();
      const finalAction = lastRobotMessage?.final_action || 'conversation_ended';

      // Info client
      const clientMessage = messages.find(m => m.role === 'client');
      const clientInfo = {
        location: clientMessage?.location || 'Inconnue',
        device: getDeviceType(clientMessage?.user_agent || ''),
        ip: clientMessage?.ip_address || 'Non renseignée'
      };

      return {
        session_id: sessionId,
        messages: sortedMessages,
        start_time: startTime,
        end_time: endTime,
        total_duration: formatDuration(duration),
        products_shown: Array.from(productsShown),
        final_action: finalAction,
        client_info: clientInfo
      };
    }).sort((a, b) => new Date(b.start_time).getTime() - new Date(a.start_time).getTime());
  };

  const getDeviceType = (userAgent: string): string => {
    if (userAgent.includes('Mobile')) return 'Mobile';
    if (userAgent.includes('Tablet')) return 'Tablette';
    return 'Desktop';
  };

  const formatDuration = (seconds: number): string => {
    if (seconds < 60) return `${seconds}s`;
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}m ${remainingSeconds}s`;
  };

  const getIntentColor = (intent?: string) => {
    switch (intent) {
      case 'product_search': return 'bg-blue-500/20 text-blue-300';
      case 'price_inquiry': return 'bg-green-500/20 text-green-300';
      case 'advice_request': return 'bg-purple-500/20 text-purple-300';
      case 'purchase_intent': return 'bg-orange-500/20 text-orange-300';
      default: return 'bg-gray-500/20 text-gray-300';
    }
  };

  const getActionColor = (action?: string) => {
    switch (action) {
      case 'cart_add': return 'bg-green-500/20 text-green-300';
      case 'purchase': return 'bg-green-600/20 text-green-400';
      case 'quote_request': return 'bg-blue-500/20 text-blue-300';
      case 'callback_request': return 'bg-purple-500/20 text-purple-300';
      default: return 'bg-gray-500/20 text-gray-300';
    }
  };

  const filteredSessions = sessions.filter(session => {
    const matchesSearch = searchTerm === '' || 
      session.messages.some(msg => 
        (msg.message || msg.response || '').toLowerCase().includes(searchTerm.toLowerCase())
      );
    
    const matchesIntent = filterIntent === 'all' || 
      session.messages.some(msg => msg.intent === filterIntent);
    
    return matchesSearch && matchesIntent;
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-cyan-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-white text-lg">Chargement de l'historique...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header avec stats */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-white">Historique des Conversations OmnIA</h2>
          <p className="text-gray-300">{sessions.length} session(s) • {conversations.length} message(s) total</p>
        </div>
        
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 bg-green-400 rounded-full animate-pulse"></div>
          <span className="text-green-300 text-sm">Sauvegarde automatique active</span>
        </div>
      </div>

      {/* Filtres et recherche */}
      <div className="bg-white/10 backdrop-blur-xl rounded-2xl p-6 border border-white/20">
        <div className="flex flex-col lg:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Rechercher dans les conversations..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-3 bg-black/40 border border-gray-600 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:border-cyan-400"
            />
          </div>
          
          <select
            value={filterIntent}
            onChange={(e) => setFilterIntent(e.target.value)}
            className="bg-black/40 border border-gray-600 rounded-xl px-4 py-3 text-white"
          >
            <option value="all">Toutes les intentions</option>
            <option value="product_search">Recherche produit</option>
            <option value="price_inquiry">Demande de prix</option>
            <option value="advice_request">Demande conseil</option>
            <option value="purchase_intent">Intention d'achat</option>
          </select>
          
          <div className="flex gap-2">
            <button
              onClick={() => setViewMode('sessions')}
              className={`px-4 py-3 rounded-xl transition-all ${
                viewMode === 'sessions' 
                  ? 'bg-cyan-500 text-white' 
                  : 'bg-gray-600 text-gray-300 hover:bg-gray-500'
              }`}
            >
              Sessions
            </button>
            <button
              onClick={() => setViewMode('messages')}
              className={`px-4 py-3 rounded-xl transition-all ${
                viewMode === 'messages' 
                  ? 'bg-cyan-500 text-white' 
                  : 'bg-gray-600 text-gray-300 hover:bg-gray-500'
              }`}
            >
              Messages
            </button>
          </div>
        </div>
      </div>

      {/* Vue par sessions */}
      {viewMode === 'sessions' && (
        <div className="space-y-4">
          {filteredSessions.map((session) => (
            <div key={session.session_id} className="bg-white/10 backdrop-blur-xl rounded-2xl border border-white/20 overflow-hidden">
              {/* Header session */}
              <div 
                className="p-6 cursor-pointer hover:bg-white/5 transition-all"
                onClick={() => setSelectedSession(
                  selectedSession === session.session_id ? null : session.session_id
                )}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-full flex items-center justify-center">
                      <MessageSquare className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-white">
                        Session {session.session_id.substring(0, 8)}
                      </h3>
                      <div className="flex items-center gap-4 text-sm text-gray-400">
                        <span className="flex items-center gap-1">
                          <Clock className="w-4 h-4" />
                          {new Date(session.start_time).toLocaleDateString('fr-FR', {
                            day: '2-digit',
                            month: '2-digit',
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </span>
                        <span>Durée: {session.total_duration}</span>
                        <span>{session.messages.length} messages</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <div className="flex items-center gap-2 mb-1">
                        <MapPin className="w-4 h-4 text-gray-400" />
                        <span className="text-gray-300 text-sm">{session.client_info.location}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        {session.client_info.device === 'Mobile' ? (
                          <Smartphone className="w-4 h-4 text-gray-400" />
                        ) : (
                          <Monitor className="w-4 h-4 text-gray-400" />
                        )}
                        <span className="text-gray-300 text-sm">{session.client_info.device}</span>
                      </div>
                    </div>
                    
                    <div className={`px-3 py-1 rounded-full text-xs font-medium ${getActionColor(session.final_action)}`}>
                      {session.final_action}
                    </div>
                    
                    <div className="text-gray-400">
                      {selectedSession === session.session_id ? '▲' : '▼'}
                    </div>
                  </div>
                </div>
              </div>

              {/* Détails session étendus */}
              {selectedSession === session.session_id && (
                <div className="border-t border-white/10 p-6 space-y-4">
                  {/* Produits montrés */}
                  {session.products_shown.length > 0 && (
                    <div className="bg-blue-500/20 border border-blue-400/30 rounded-xl p-4">
                      <h4 className="font-semibold text-blue-200 mb-2 flex items-center gap-2">
                        <Eye className="w-4 h-4" />
                        Produits présentés ({session.products_shown.length})
                      </h4>
                      <div className="flex flex-wrap gap-2">
                        {session.products_shown.map((product, index) => (
                          <span key={index} className="bg-blue-600/30 text-blue-200 px-3 py-1 rounded-full text-sm">
                            {product}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Messages de la session */}
                  <div className="space-y-3">
                    <h4 className="font-semibold text-white">💬 Flux de conversation :</h4>
                    <div className="space-y-3 max-h-96 overflow-y-auto">
                      {session.messages.map((msg, index) => (
                        <div key={index} className={`flex gap-3 ${msg.role === 'client' ? 'justify-end' : 'justify-start'}`}>
                          {msg.role === 'robot' && (
                            <div className="w-8 h-8 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-full flex items-center justify-center flex-shrink-0">
                              <Bot className="w-4 h-4 text-white" />
                            </div>
                          )}
                          
                          <div className={`max-w-[70%] ${msg.role === 'client' ? 'order-first' : ''}`}>
                            <div className={`rounded-2xl px-4 py-3 ${
                              msg.role === 'client'
                                ? 'bg-gradient-to-r from-cyan-500 to-blue-600 text-white'
                                : 'bg-black/40 text-cyan-100 border border-cyan-500/30'
                            }`}>
                              <p className="text-sm">{msg.message || msg.response}</p>
                            </div>
                            
                            <div className="flex items-center gap-2 mt-1 text-xs text-gray-400">
                              <Clock className="w-3 h-3" />
                              {new Date(msg.created_at).toLocaleTimeString('fr-FR', {
                                hour: '2-digit',
                                minute: '2-digit',
                                second: '2-digit'
                              })}
                              
                              {msg.intent && (
                                <span className={`px-2 py-0.5 rounded-full ${getIntentColor(msg.intent)}`}>
                                  {msg.intent}
                                </span>
                              )}
                            </div>
                          </div>

                          {msg.role === 'client' && (
                            <div className="w-8 h-8 bg-gradient-to-br from-slate-600 to-slate-800 rounded-full flex items-center justify-center flex-shrink-0">
                              <User className="w-4 h-4 text-white" />
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Informations techniques */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="bg-black/20 rounded-lg p-3">
                      <h5 className="text-white font-semibold mb-2 text-sm">📍 Informations client</h5>
                      <div className="space-y-1 text-xs">
                        <div className="text-gray-300">📍 {session.client_info.location}</div>
                        <div className="text-gray-300">💻 {session.client_info.device}</div>
                        <div className="text-gray-300">🌐 {session.client_info.ip}</div>
                      </div>
                    </div>
                    
                    <div className="bg-black/20 rounded-lg p-3">
                      <h5 className="text-white font-semibold mb-2 text-sm">⏱️ Timing</h5>
                      <div className="space-y-1 text-xs">
                        <div className="text-gray-300">Début: {new Date(session.start_time).toLocaleTimeString('fr-FR')}</div>
                        <div className="text-gray-300">Fin: {new Date(session.end_time).toLocaleTimeString('fr-FR')}</div>
                        <div className="text-gray-300">Durée: {session.total_duration}</div>
                      </div>
                    </div>
                    
                    <div className="bg-black/20 rounded-lg p-3">
                      <h5 className="text-white font-semibold mb-2 text-sm">🎯 Résultat</h5>
                      <div className={`px-2 py-1 rounded-full text-xs font-medium ${getActionColor(session.final_action)}`}>
                        {session.final_action}
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Vue par messages */}
      {viewMode === 'messages' && (
        <div className="bg-white/10 backdrop-blur-xl rounded-2xl border border-white/20 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-black/20">
                <tr>
                  <th className="text-left p-4 text-cyan-300 font-semibold">Rôle</th>
                  <th className="text-left p-4 text-cyan-300 font-semibold">Message</th>
                  <th className="text-left p-4 text-cyan-300 font-semibold">Intention</th>
                  <th className="text-left p-4 text-cyan-300 font-semibold">Produits</th>
                  <th className="text-left p-4 text-cyan-300 font-semibold">Date</th>
                </tr>
              </thead>
              <tbody>
                {conversations.filter(conv => {
                  const matchesSearch = searchTerm === '' || 
                    (conv.message || conv.response || '').toLowerCase().includes(searchTerm.toLowerCase());
                  const matchesIntent = filterIntent === 'all' || conv.intent === filterIntent;
                  return matchesSearch && matchesIntent;
                }).map((conv) => (
                  <tr key={conv.id} className="border-b border-white/10 hover:bg-white/5">
                    <td className="p-4">
                      <div className="flex items-center gap-2">
                        {conv.role === 'robot' ? (
                          <Bot className="w-4 h-4 text-cyan-400" />
                        ) : (
                          <User className="w-4 h-4 text-blue-400" />
                        )}
                        <span className="text-white font-medium">
                          {conv.role === 'robot' ? 'OmnIA' : 'Client'}
                        </span>
                      </div>
                    </td>
                    <td className="p-4">
                      <div className="text-white text-sm max-w-md">
                        {(conv.message || conv.response || '').substring(0, 100)}
                        {(conv.message || conv.response || '').length > 100 && '...'}
                      </div>
                    </td>
                    <td className="p-4">
                      {conv.intent && (
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getIntentColor(conv.intent)}`}>
                          {conv.intent}
                        </span>
                      )}
                    </td>
                    <td className="p-4">
                      {conv.products && conv.products.length > 0 && (
                        <div className="flex flex-wrap gap-1">
                          {conv.products.slice(0, 2).map((product, index) => (
                            <span key={index} className="bg-purple-500/20 text-purple-300 px-2 py-1 rounded text-xs">
                              {product}
                            </span>
                          ))}
                          {conv.products.length > 2 && (
                            <span className="text-gray-400 text-xs">+{conv.products.length - 2}</span>
                          )}
                        </div>
                      )}
                    </td>
                    <td className="p-4">
                      <div className="text-gray-300 text-sm">
                        {new Date(conv.created_at).toLocaleDateString('fr-FR', {
                          day: '2-digit',
                          month: '2-digit',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Message si aucune conversation */}
      {sessions.length === 0 && (
        <div className="text-center py-20">
          <MessageSquare className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-xl font-bold text-white mb-2">Aucune conversation enregistrée</h3>
          <p className="text-gray-400 mb-6">
            Les conversations avec OmnIA apparaîtront ici automatiquement
          </p>
          <button
            onClick={() => window.open('/chat', '_blank')}
            className="bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white px-6 py-3 rounded-xl font-semibold transition-all"
          >
            Tester OmnIA
          </button>
        </div>
      )}
    </div>
  );
};