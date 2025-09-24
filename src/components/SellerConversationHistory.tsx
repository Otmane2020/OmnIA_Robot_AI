import React, { useState, useEffect } from 'react';
import { MessageSquare, User, Bot, Clock, MapPin, Monitor, Smartphone, Search, Filter } from 'lucide-react';

interface SellerConversation {
  id: string;
  seller_id: string;
  session_id: string;
  user_message: string;
  ai_response: string;
  products_shown: string[];
  user_ip?: string;
  user_agent?: string;
  conversation_type: 'product_search' | 'design_advice' | 'general';
  satisfaction_score?: number;
  created_at: string;
}

interface SellerConversationHistoryProps {
  sellerId: string;
}

export const SellerConversationHistory: React.FC<SellerConversationHistoryProps> = ({ sellerId }) => {
  const [conversations, setConversations] = useState<SellerConversation[]>([]);
  const [filteredConversations, setFilteredConversations] = useState<SellerConversation[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [isLoading, setIsLoading] = useState(true);
  const [selectedSession, setSelectedSession] = useState<string | null>(null);

  useEffect(() => {
    loadSellerConversations();
  }, [sellerId]);

  useEffect(() => {
    // Filter conversations
    let filtered = conversations;

    if (searchTerm) {
      filtered = filtered.filter(conv =>
        conv.user_message.toLowerCase().includes(searchTerm.toLowerCase()) ||
        conv.ai_response.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (filterType !== 'all') {
      filtered = filtered.filter(conv => conv.conversation_type === filterType);
    }

    setFilteredConversations(filtered);
  }, [conversations, searchTerm, filterType]);

  const loadSellerConversations = async () => {
    try {
      setIsLoading(true);
      
      // Charger UNIQUEMENT les conversations de ce vendeur spécifique
      const sellerConversationKey = `seller_${sellerId}_conversations`;
      const savedConversations = localStorage.getItem(sellerConversationKey);
      
      let sellerConversations: SellerConversation[] = [];
      if (savedConversations) {
        try {
          sellerConversations = JSON.parse(savedConversations);
          console.log(`💬 Conversations vendeur ${sellerId} chargées:`, sellerConversations.length);
        } catch (error) {
          console.error('Erreur parsing conversations:', error);
          sellerConversations = [];
        }
      } else {
        console.log(`💬 Nouveau vendeur ${sellerId} - aucune conversation`);
        sellerConversations = [];
      }
      
      setConversations(sellerConversations);
      setFilteredConversations(sellerConversations);
      
    } catch (error) {
      console.error('❌ Erreur chargement conversations:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'product_search': return 'bg-blue-500/20 text-blue-300';
      case 'design_advice': return 'bg-purple-500/20 text-purple-300';
      case 'general': return 'bg-gray-500/20 text-gray-300';
      default: return 'bg-gray-500/20 text-gray-300';
    }
  };

  const getDeviceIcon = (userAgent?: string) => {
    if (!userAgent) return Monitor;
    if (userAgent.includes('Mobile') || userAgent.includes('iPhone')) return Smartphone;
    return Monitor;
  };

  const groupConversationsBySession = () => {
    const sessions = new Map<string, SellerConversation[]>();
    
    filteredConversations.forEach(conv => {
      if (!sessions.has(conv.session_id)) {
        sessions.set(conv.session_id, []);
      }
      sessions.get(conv.session_id)!.push(conv);
    });

    return Array.from(sessions.entries()).map(([sessionId, convs]) => ({
      session_id: sessionId,
      conversations: convs.sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime()),
      start_time: convs[0]?.created_at,
      message_count: convs.length,
      last_message: convs[convs.length - 1]?.created_at
    }));
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-cyan-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-white text-lg">Chargement de l'historique...</p>
        </div>
      </div>
    );
  }

  const sessions = groupConversationsBySession();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-white">Mes Conversations</h2>
          <p className="text-gray-300">{sessions.length} session(s) • {conversations.length} message(s) total</p>
        </div>
        
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 bg-green-400 rounded-full animate-pulse"></div>
          <span className="text-green-300 text-sm">Historique personnel</span>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="bg-white/10 backdrop-blur-xl rounded-2xl p-6 border border-white/20">
        <div className="flex flex-col lg:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Rechercher dans vos conversations..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-3 bg-black/40 border border-gray-600 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:border-cyan-400"
            />
          </div>
          
          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            className="bg-black/40 border border-gray-600 rounded-xl px-4 py-3 text-white"
          >
            <option value="all">Tous les types</option>
            <option value="product_search">Recherche produit</option>
            <option value="design_advice">Conseil déco</option>
            <option value="general">Général</option>
          </select>
        </div>
      </div>

      {/* Conversations by Session */}
      <div className="space-y-4">
        {sessions.map((session) => (
          <div key={session.session_id} className="bg-white/10 backdrop-blur-xl rounded-2xl border border-white/20 overflow-hidden">
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
                      <span>{session.message_count} messages</span>
                    </div>
                  </div>
                </div>
                
                <div className="text-gray-400">
                  {selectedSession === session.session_id ? '▲' : '▼'}
                </div>
              </div>
            </div>

            {selectedSession === session.session_id && (
              <div className="border-t border-white/10 p-6 space-y-4">
                <div className="space-y-3 max-h-96 overflow-y-auto">
                  {session.conversations.map((conv, index) => (
                    <div key={index} className="space-y-2">
                      {/* User Message */}
                      <div className="flex gap-3 justify-end">
                        <div className="bg-gradient-to-r from-cyan-500 to-blue-600 rounded-2xl px-4 py-3 max-w-[70%]">
                          <p className="text-white text-sm">{conv.user_message}</p>
                        </div>
                        <div className="w-8 h-8 bg-gradient-to-br from-slate-600 to-slate-800 rounded-full flex items-center justify-center flex-shrink-0">
                          <User className="w-4 h-4 text-white" />
                        </div>
                      </div>
                      
                      {/* AI Response */}
                      <div className="flex gap-3">
                        <div className="w-8 h-8 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-full flex items-center justify-center flex-shrink-0">
                          <Bot className="w-4 h-4 text-white" />
                        </div>
                        <div className="bg-black/40 text-cyan-100 border border-cyan-500/30 rounded-2xl px-4 py-3 max-w-[70%]">
                          <p className="text-sm">{conv.ai_response}</p>
                          {conv.products_shown.length > 0 && (
                            <div className="mt-2 flex flex-wrap gap-1">
                              {conv.products_shown.map((product, i) => (
                                <span key={i} className="bg-purple-500/20 text-purple-300 px-2 py-1 rounded text-xs">
                                  {product}
                                </span>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-4 text-xs text-gray-400 ml-11">
                        <span className="flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {new Date(conv.created_at).toLocaleTimeString('fr-FR')}
                        </span>
                        <span className={`px-2 py-1 rounded-full ${getTypeColor(conv.conversation_type)}`}>
                          {conv.conversation_type}
                        </span>
                        {conv.satisfaction_score && (
                          <span className="text-yellow-400">
                            {'★'.repeat(conv.satisfaction_score)}
                          </span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Empty State */}
      {sessions.length === 0 && (
        <div className="text-center py-20">
          <MessageSquare className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-xl font-bold text-white mb-2">Aucune conversation enregistrée</h3>
          <p className="text-gray-400 mb-6">
            Les conversations avec votre robot OmnIA apparaîtront ici
          </p>
          <button
            onClick={() => window.open(`/robot/${sellerId}`, '_blank')}
            className="bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white px-6 py-3 rounded-xl font-semibold transition-all"
          >
            Tester votre robot
          </button>
        </div>
      )}
    </div>
  );
};