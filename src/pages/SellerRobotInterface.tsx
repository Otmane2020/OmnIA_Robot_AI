import React, { useState, useEffect, useRef } from 'react';
import { 
  Mic, MicOff, Volume2, VolumeX, Camera, Settings, Power, 
  Send, ArrowLeft, User, Loader2, Upload, QrCode, ShoppingCart,
  Sparkles, Zap, Eye, EyeOff, MessageSquare, Bot, Play, Pause,
  RotateCcw, Move, Music, Wifi, Battery, Signal, Image
} from 'lucide-react';
import { ChatMessage } from '../components/ChatMessage';
import { ProductCard } from '../components/ProductCard';
import { CartButton } from '../components/CartButton';
import { RobotAvatar } from '../components/RobotAvatar';
import { useWhisperSTT } from '../hooks/useWhisperSTT';
import { useGoogleTTS } from '../hooks/useGoogleTTS';
import { ChatMessage as ChatMessageType, Product } from '../types';

interface SellerRobotInterfaceProps {
  sellerSubdomain: string;
}

interface CartItem {
  id: string;
  productId: string;
  variantId: string;
  title: string;
  price: number;
  quantity: number;
  image_url: string;
  product_url: string;
}

interface SellerInfo {
  id: string;
  company_name: string;
  subdomain: string;
  contact_name: string;
  robot_name: string;
  theme_colors: {
    primary: string;
    secondary: string;
  };
}

export const SellerRobotInterface: React.FC<SellerRobotInterfaceProps> = ({ sellerSubdomain }) => {
  const [messages, setMessages] = useState<ChatMessageType[]>([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [products, setProducts] = useState<Product[]>([]);
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [sellerInfo, setSellerInfo] = useState<SellerInfo | null>(null);
  const [isAnalyzingPhoto, setIsAnalyzingPhoto] = useState(false);
  const [currentSpeakingMessage, setCurrentSpeakingMessage] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const { 
    isRecording, 
    isProcessing, 
    transcript, 
    error: sttError,
    startRecording, 
    stopRecording, 
    reset: resetSTT,
    isSupported: sttSupported
  } = useWhisperSTT({ continuous: false });

  const { 
    speak, 
    stopSpeaking, 
    isSpeaking 
  } = useGoogleTTS();

  useEffect(() => {
    loadSellerInfo();
    handleInitialGreeting();
  }, [sellerSubdomain]);

  useEffect(() => {
    if (transcript && !isProcessing) {
      handleSendMessage(transcript);
      resetSTT();
    }
  }, [transcript, isProcessing]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const loadSellerInfo = async () => {
    try {
      // Load seller info from localStorage or API
      const savedSellers = localStorage.getItem('validated_retailers');
      let sellers = [];
      
      if (savedSellers) {
        sellers = JSON.parse(savedSellers);
      }
      
      // Find seller by subdomain
      const seller = sellers.find((s: any) => s.subdomain === sellerSubdomain);
      
      if (seller) {
        const settings = localStorage.getItem(`seller_${seller.id}_settings`);
        const parsedSettings = settings ? JSON.parse(settings) : {};
        
        setSellerInfo({
          id: seller.id,
          company_name: seller.company_name || seller.name,
          subdomain: seller.subdomain,
          contact_name: seller.contact_name,
          robot_name: parsedSettings.robot_name || 'OmnIA',
          theme_colors: parsedSettings.theme_colors || {
            primary: '#0891b2',
            secondary: '#1e40af'
          }
        });
      } else {
        // Default seller info if not found
        setSellerInfo({
          id: 'default',
          company_name: sellerSubdomain,
          subdomain: sellerSubdomain,
          contact_name: sellerSubdomain,
          robot_name: 'OmnIA',
          theme_colors: {
            primary: '#0891b2',
            secondary: '#1e40af'
          }
        });
      }
    } catch (error) {
      console.error('❌ Erreur chargement info vendeur:', error);
    }
  };

  const handleInitialGreeting = () => {
    const greeting = sellerInfo 
      ? `Bonjour ! Je suis ${sellerInfo.robot_name} 🤖 Votre assistant mobilier IA. Comment puis-je vous aider ?`
      : "Bonjour ! Je suis OmnIA 🤖 Votre assistant mobilier IA. Comment puis-je vous aider ?";
    
    const greetingMessage: ChatMessageType = {
      id: Date.now().toString(),
      content: greeting,
      isUser: false,
      timestamp: new Date(),
      products: []
    };
    
    setMessages([greetingMessage]);
    speak(greeting);
  };

  const handleSendMessage = async (messageText: string) => {
    if (!messageText.trim()) return;

    const userMessage: ChatMessageType = {
      id: Date.now().toString(),
      content: messageText,
      isUser: true,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputMessage('');
    setIsTyping(true);

    try {
      // Call seller-specific chat API
      const searchResponse = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/seller-chat`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          message: messageText,
          seller_id: sellerInfo?.id || 'default',
          seller_subdomain: sellerSubdomain
        }),
      });

      let aiResponse = '';
      let foundProducts: Product[] = [];

      if (searchResponse.ok) {
        const searchData = await searchResponse.json();
        aiResponse = searchData.message;
        foundProducts = searchData.products || [];
      } else {
        aiResponse = "Je rencontre des difficultés techniques. Pouvez-vous reformuler ?";
      }

      // Save conversation to seller-specific storage
      if (sellerInfo) {
        saveConversationToStorage(sellerInfo.id, messageText, aiResponse, foundProducts);
      }

      const botMessage: ChatMessageType = {
        id: (Date.now() + 1).toString(),
        content: aiResponse,
        isUser: false,
        timestamp: new Date(),
        products: foundProducts
      };

      setMessages(prev => [...prev, botMessage]);
      setProducts(foundProducts);
      
      speak(aiResponse);
      setCurrentSpeakingMessage(aiResponse);

    } catch (error) {
      console.error('❌ Erreur envoi message:', error);
      
      const errorMessage: ChatMessageType = {
        id: (Date.now() + 1).toString(),
        content: "Désolé, je rencontre des difficultés techniques. Pouvez-vous reformuler ?",
        isUser: false,
        timestamp: new Date(),
        products: []
      };

      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsTyping(false);
    }
  };

  const saveConversationToStorage = (sellerId: string, userMessage: string, aiResponse: string, products: Product[]) => {
    try {
      // Clé spécifique au vendeur pour isolation complète
      const conversationKey = `seller_${sellerId}_conversations`;
      const existingConversations = localStorage.getItem(conversationKey);
      let conversations = existingConversations ? JSON.parse(existingConversations) : [];
      
      const newConversation = {
        id: `${sellerId}-${Date.now()}`,
        seller_id: sellerId,
        session_id: `session-${Date.now()}`,
        user_message: userMessage,
        ai_response: aiResponse,
        products_shown: products.map(p => p.title),
        conversation_type: 'product_search',
        created_at: new Date().toISOString()
      };
      
      conversations.unshift(newConversation);
      
      // Keep only last 100 conversations
      if (conversations.length > 100) {
        conversations = conversations.slice(0, 100);
      }
      
      localStorage.setItem(conversationKey, JSON.stringify(conversations));
      console.log(`💾 Conversation sauvegardée pour vendeur ${sellerId}`);
      
    } catch (error) {
      console.error('❌ Erreur sauvegarde conversation:', error);
    }
  };

  const handlePhotoUpload = async (file: File) => {
    if (!file.type.startsWith('image/')) {
      alert('Veuillez sélectionner une image valide');
      return;
    }

    setIsAnalyzingPhoto(true);

    try {
      // Create URL for image
      const imageUrl = URL.createObjectURL(file);
      
      // Simulate AI analysis
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      const analysis = `📸 **Analyse de votre espace par ${sellerInfo?.robot_name || 'OmnIA'} :**

**Style détecté :** Moderne et épuré
**Ambiance :** Chaleureuse avec potentiel d'amélioration
**Opportunités :** Optimisation de l'aménagement

**💡 Mes recommandations ${sellerInfo?.company_name || 'personnalisées'} :**
• Produits adaptés à votre style
• Solutions d'aménagement optimales

**🎨 Conseil d'expert :** L'harmonie des matériaux créera une ambiance cohérente !`;

      const photoMessage: ChatMessageType = {
        id: Date.now().toString(),
        content: analysis,
        isUser: false,
        timestamp: new Date(),
        products: [],
        photoUrl: imageUrl
      };

      setMessages(prev => [...prev, photoMessage]);
      
      speak(analysis);
      
    } catch (error) {
      console.error('Erreur analyse photo:', error);
      alert('Erreur lors de l\'analyse de la photo');
    } finally {
      setIsAnalyzingPhoto(false);
    }
  };

  const handleMicClick = () => {
    if (isRecording) {
      stopRecording();
    } else {
      startRecording();
    }
  };

  const handleVolumeClick = () => {
    if (isSpeaking) {
      stopSpeaking();
      setCurrentSpeakingMessage(null);
    }
  };

  const handleAddToCart = (productId: string, variantId: string) => {
    const product = products.find(p => p.id === productId);
    const variant = product?.variants.find(v => v.id === variantId);
    
    if (product && variant) {
      const existingItem = cartItems.find(item => item.variantId === variantId);
      
      if (existingItem) {
        setCartItems(prev => prev.map(item =>
          item.variantId === variantId
            ? { ...item, quantity: item.quantity + 1 }
            : item
        ));
      } else {
        const newItem: CartItem = {
          id: Date.now().toString(),
          productId,
          variantId,
          title: product.title,
          price: variant.price,
          quantity: 1,
          image_url: product.image_url,
          product_url: product.product_url
        };
        setCartItems(prev => [...prev, newItem]);
      }

      const confirmMessage: ChatMessageType = {
        id: Date.now().toString(),
        content: `✅ **${product.title}** ajouté au panier ! Autre chose ?`,
        isUser: false,
        timestamp: new Date(),
        products: []
      };
      setMessages(prev => [...prev, confirmMessage]);
    }
  };

  const handleUpdateCartQuantity = (itemId: string, quantity: number) => {
    if (quantity === 0) {
      setCartItems(prev => prev.filter(item => item.id !== itemId));
    } else {
      setCartItems(prev => prev.map(item =>
        item.id === itemId ? { ...item, quantity } : item
      ));
    }
  };

  const handleRemoveCartItem = (itemId: string) => {
    setCartItems(prev => prev.filter(item => item.id !== itemId));
  };

  const handleCheckout = () => {
    const checkoutMessage: ChatMessageType = {
      id: Date.now().toString(),
      content: `🛒 **Commande en cours !** ${cartItems.length} article(s) pour ${cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0).toFixed(2)}€. Redirection vers le paiement...`,
      isUser: false,
      timestamp: new Date(),
      products: []
    };
    setMessages(prev => [...prev, checkoutMessage]);
    
    setTimeout(() => {
      alert('Redirection vers le système de paiement...');
    }, 1500);
  };

  const handleSuggestionClick = (suggestion: string) => {
    handleSendMessage(suggestion);
  };

  if (!sellerInfo) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-purple-900 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-cyan-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-white text-lg">Chargement du robot {sellerSubdomain}...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-purple-900 flex">
      {/* Background Effects */}
      <div className="absolute inset-0 opacity-20">
        <div className="absolute top-20 left-20 w-72 h-72 bg-cyan-500/30 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-20 right-20 w-96 h-96 bg-purple-500/20 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '2s' }}></div>
      </div>

      {/* Mobile Header */}
      <div className="lg:hidden fixed top-0 left-0 right-0 z-40 bg-slate-800/95 backdrop-blur-xl border-b border-slate-700/50 p-4">
        <div className="flex items-center justify-between">
          <button
            onClick={() => window.location.href = '/'}
            className="flex items-center gap-2 text-cyan-400 hover:text-cyan-300 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span className="text-sm">Retour</span>
          </button>
          
          <div className="flex items-center gap-3">
            <div 
              className="w-10 h-10 rounded-xl flex items-center justify-center relative"
              style={{ backgroundColor: sellerInfo.theme_colors.primary }}
            >
              <Bot className="w-5 h-5 text-white" />
              <div className="absolute -top-1 -right-1 w-3 h-3 bg-green-400 rounded-full animate-bounce"></div>
            </div>
            <div>
              <h1 className="text-white font-bold">{sellerInfo.robot_name}</h1>
              <p className="text-cyan-300 text-xs">{sellerInfo.company_name}</p>
            </div>
          </div>

          <CartButton 
            items={cartItems}
            onUpdateQuantity={handleUpdateCartQuantity}
            onRemoveItem={handleRemoveCartItem}
            onCheckout={handleCheckout}
          />
        </div>
      </div>

      {/* Sidebar - Robot Control Panel */}
      <div className="hidden lg:flex w-96 bg-slate-800/95 backdrop-blur-xl border-r border-slate-700/50 flex-col relative z-10 h-screen overflow-hidden">
        {/* Header */}
        <div className="p-6">
          <button
            onClick={() => window.location.href = '/'}
            className="flex items-center gap-2 text-cyan-400 hover:text-cyan-300 transition-colors mb-6"
          >
            <ArrowLeft className="w-4 h-4" />
            Retour
          </button>
          
          {/* Seller Logo */}
          <div className="flex items-center gap-4 mb-8 pb-6 border-b border-slate-700/50">
            <div 
              className="w-14 h-14 rounded-2xl flex items-center justify-center relative shadow-2xl"
              style={{ backgroundColor: sellerInfo?.theme_colors.primary }}
            >
              <Bot className="w-8 h-8 text-white" />
              <div className="absolute -top-1 -right-1 w-4 h-4 bg-green-400 rounded-full animate-bounce"></div>
            </div>
            <div>
              <h1 className="text-xl font-bold text-white">{sellerInfo?.robot_name}</h1>
              <p className="text-cyan-300">{sellerInfo?.company_name}</p>
            </div>
          </div>
        </div>

        {/* Robot Avatar and Controls */}
        <div className="flex flex-col items-center p-6 space-y-6 flex-1 justify-center">
          <div className="relative">
            <RobotAvatar
              mood={isSpeaking ? 'speaking' : isRecording ? 'thinking' : 'happy'}
              isListening={isRecording}
              isSpeaking={isSpeaking}
              size="xl"
            />
          </div>

          <div className="text-center">
            <div className="text-white font-bold text-lg mb-3">Prêt à vous aider</div>
            <div className="flex items-center justify-center gap-4 text-sm">
              <div className="flex items-center gap-1">
                <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                <span className="text-green-300 font-semibold">En ligne</span>
              </div>
              <div className="flex items-center gap-1">
                <Signal className="w-4 h-4 text-cyan-400" />
                <span className="text-cyan-300 font-semibold">Connecté</span>
              </div>
            </div>
          </div>

          {/* Control Buttons */}
          <div className="grid grid-cols-2 gap-4 w-full max-w-xs">
            <button
              onClick={handleMicClick}
              disabled={!sttSupported}
              className={`relative group ${
                isRecording
                  ? 'bg-gradient-to-br from-purple-500 to-purple-600 shadow-lg shadow-purple-500/40'
                  : 'bg-gradient-to-br from-purple-500 to-purple-600 hover:from-purple-400 hover:to-purple-500 shadow-lg shadow-purple-500/30 hover:shadow-purple-500/50'
              } ${!sttSupported ? 'opacity-50 cursor-not-allowed' : ''} 
              w-24 h-24 rounded-2xl flex items-center justify-center transition-all duration-300 hover:scale-110 border-2 border-white/20`}
              title={isRecording ? 'Arrêter l\'enregistrement' : 'Commencer l\'enregistrement vocal'}
            >
              {isRecording ? (
                <MicOff className="w-10 h-10 text-white" />
              ) : (
                <Mic className="w-10 h-10 text-white" />
              )}
              
              {isRecording && (
                <div className="absolute inset-0 rounded-2xl border-2 border-red-400/50 animate-ping"></div>
              )}
            </button>

            <button
              onClick={handleVolumeClick}
              className={`relative group ${
                isSpeaking
                  ? 'bg-gradient-to-br from-green-500 to-green-600 shadow-lg shadow-green-500/40 animate-pulse'
                  : 'bg-gradient-to-br from-green-500 to-green-600 hover:from-green-400 hover:to-green-500 shadow-lg shadow-green-500/30 hover:shadow-green-500/50'
              } w-24 h-24 rounded-2xl flex items-center justify-center transition-all duration-300 hover:scale-110 border-2 border-white/20`}
              title={isSpeaking ? 'Arrêter la lecture' : 'Volume'}
            >
              {isSpeaking ? (
                <VolumeX className="w-10 h-10 text-white" />
              ) : (
                <Volume2 className="w-10 h-10 text-white" />
              )}
            </button>

            <button
              onClick={() => fileInputRef.current?.click()}
              className="relative group bg-gradient-to-br from-pink-500 to-pink-600 hover:from-pink-400 hover:to-pink-500 shadow-lg shadow-pink-500/30 hover:shadow-pink-500/50 w-24 h-24 rounded-2xl flex items-center justify-center transition-all duration-300 hover:scale-110 border-2 border-white/20"
              title="Analyser une photo"
            >
              <Camera className="w-10 h-10 text-white" />
            </button>

            <button
              className="relative group bg-gradient-to-br from-orange-500 to-orange-600 hover:from-orange-400 hover:to-orange-500 shadow-lg shadow-orange-500/30 hover:shadow-orange-500/50 w-24 h-24 rounded-2xl flex items-center justify-center transition-all duration-300 hover:scale-110 border-2 border-white/20"
              title="Paramètres"
            >
              <Settings className="w-10 h-10 text-white" />
            </button>
          </div>

          <div className="text-center">
            <div className="flex items-center justify-center gap-2 mb-2">
              <Zap className="w-5 h-5 text-green-400" />
              <span className="text-green-300 font-bold">Prêt à vous conseiller</span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col relative z-10 lg:ml-0 mt-20 lg:mt-0">
        {/* Chat Header */}
        <div className="hidden lg:block bg-slate-800/80 backdrop-blur-xl border-b border-slate-700/50 p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-3 h-3 bg-green-400 rounded-full animate-pulse"></div>
              <div>
                <h2 className="text-xl font-bold text-white">Chat avec {sellerInfo.robot_name}</h2>
                <p className="text-gray-300">{sellerInfo.company_name} - Assistant IA personnalisé</p>
              </div>
            </div>
            <CartButton 
              items={cartItems}
              onUpdateQuantity={handleUpdateCartQuantity}
              onRemoveItem={handleRemoveCartItem}
              onCheckout={handleCheckout}
            />
          </div>
        </div>

        {/* Messages Area */}
        <div className="flex-1 overflow-y-auto p-8 bg-slate-700/20 backdrop-blur-sm">
          <div className="max-w-6xl mx-auto space-y-6">
            {messages.map((message) => (
              <ChatMessage
                key={message.id}
                message={message}
                onAddToCart={handleAddToCart}
                onSpeak={speak}
                isPlaying={currentSpeakingMessage === message.content}
              />
            ))}
            
            {isTyping && (
              <div className="flex justify-start">
                <div className="flex items-center gap-4">
                  <RobotAvatar
                    mood="thinking"
                    isListening={false}
                    isSpeaking={false}
                    size="md"
                  />
                  <div className="bg-slate-700/80 backdrop-blur-xl p-4 rounded-2xl shadow-lg border border-cyan-500/30">
                    <div className="flex items-center gap-2">
                      <div className="flex gap-1">
                        <div className="w-2 h-2 bg-cyan-400 rounded-full animate-bounce"></div>
                        <div className="w-2 h-2 bg-cyan-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                        <div className="w-2 h-2 bg-cyan-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                      </div>
                      <span className="text-cyan-300 text-sm">{sellerInfo.robot_name} réfléchit...</span>
                    </div>
                  </div>
                </div>
              </div>
            )}
            
            {/* Product Display */}
            {products.length > 0 && (
              <div className="space-y-6">
                <h3 className="text-2xl font-bold text-white flex items-center gap-3">
                  <Sparkles className="w-6 h-6 text-cyan-400" />
                  Recommandations {sellerInfo.company_name}
                  <span className="bg-cyan-500/20 text-cyan-300 px-3 py-1 rounded-full text-sm">
                    {products.length} produit{products.length > 1 ? 's' : ''}
                  </span>
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
                  {products.map((product) => (
                    <ProductCard
                      key={product.id}
                      product={product}
                      onAddToCart={handleAddToCart}
                    />
                  ))}
                </div>
              </div>
            )}
            
            <div ref={messagesEndRef} />
          </div>
        </div>

        {/* Input Area */}
        <div className="p-8 bg-slate-800/80 backdrop-blur-xl border-t border-slate-700/50">
          <div className="max-w-6xl mx-auto">
            {/* Suggestions */}
            <div className="mb-4">
              <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
                <button
                  onClick={() => handleSuggestionClick("🛋️ Canapé moderne")}
                  className="flex-shrink-0 px-4 py-2 bg-purple-500/20 hover:bg-purple-500/30 text-purple-300 hover:text-white text-sm rounded-xl border border-purple-500/30 transition-all whitespace-nowrap"
                >
                  🛋️ Canapé moderne
                </button>
                <button
                  onClick={() => handleSuggestionClick("🪑 Table design")}
                  className="flex-shrink-0 px-4 py-2 bg-blue-500/20 hover:bg-blue-500/30 text-blue-300 hover:text-white text-sm rounded-xl border border-blue-500/30 transition-all whitespace-nowrap"
                >
                  🪑 Table design
                </button>
                <button
                  onClick={() => handleSuggestionClick("💺 Chaise confort")}
                  className="flex-shrink-0 px-4 py-2 bg-purple-500/20 hover:bg-purple-500/30 text-purple-300 hover:text-white text-sm rounded-xl border border-purple-500/30 transition-all whitespace-nowrap"
                >
                  💺 Chaise confort
                </button>
                <button
                  onClick={() => handleSuggestionClick("✨ Conseils déco")}
                  className="flex-shrink-0 px-4 py-2 bg-yellow-500/20 hover:bg-yellow-500/30 text-yellow-300 hover:text-white text-sm rounded-xl border border-yellow-500/30 transition-all whitespace-nowrap"
                >
                  ✨ Conseils déco
                </button>
              </div>
            </div>

            {/* Status */}
            {(isRecording || isProcessing || isAnalyzingPhoto) && (
              <div className="mb-4 p-4 bg-blue-500/20 border border-blue-400/50 rounded-xl">
                <div className="flex items-center gap-3">
                  {isRecording ? (
                    <>
                      <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse"></div>
                      <span className="text-red-300 font-semibold">🎤 Parlez maintenant...</span>
                    </>
                  ) : isProcessing ? (
                    <>
                      <Loader2 className="w-4 h-4 text-blue-400 animate-spin" />
                      <span className="text-blue-300 font-semibold">🔄 Transcription en cours...</span>
                    </>
                  ) : isAnalyzingPhoto ? (
                    <>
                      <Loader2 className="w-4 h-4 text-purple-400 animate-spin" />
                      <span className="text-purple-300 font-semibold">📸 Analyse photo en cours...</span>
                    </>
                  ) : null}
                </div>
              </div>
            )}

            {/* Input */}
            <div className="flex gap-4">
              <div className="flex-1 relative">
                <input
                  type="text"
                  value={inputMessage}
                  onChange={(e) => setInputMessage(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleSendMessage(inputMessage)}
                  placeholder="Écrivez votre message..."
                  className="w-full bg-slate-700/50 border border-slate-600/50 rounded-2xl px-6 py-4 text-white placeholder-slate-400 focus:outline-none focus:border-cyan-400 focus:ring-2 focus:ring-cyan-400/30"
                />
              </div>
              
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) handlePhotoUpload(file);
                }}
                className="hidden"
              />

              <button
                onClick={() => fileInputRef.current?.click()}
                disabled={isAnalyzingPhoto}
                className="relative group bg-gradient-to-br from-purple-500 to-purple-600 hover:from-purple-400 hover:to-purple-500 shadow-lg shadow-purple-500/30 hover:shadow-purple-500/50 w-14 h-14 rounded-2xl flex items-center justify-center transition-all duration-300 hover:scale-110 border-2 border-white/20 disabled:opacity-50"
                title="Analyser une photo"
              >
                {isAnalyzingPhoto ? (
                  <Loader2 className="w-6 h-6 text-white animate-spin" />
                ) : (
                  <Image className="w-6 h-6 text-white" />
                )}
              </button>

              <button
                onClick={() => handleSendMessage(inputMessage)}
                disabled={!inputMessage.trim()}
                className="relative group bg-gradient-to-br from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 disabled:from-gray-600 disabled:to-gray-700 shadow-lg shadow-cyan-500/30 hover:shadow-cyan-500/50 w-14 h-14 rounded-2xl flex items-center justify-center transition-all duration-300 hover:scale-110 disabled:cursor-not-allowed disabled:scale-100 border-2 border-white/20"
                title="Envoyer le message"
              >
                <Send className="w-6 h-6 text-white" />
              </button>
            </div>

            {/* Error Display */}
            {sttError && (
              <div className="mt-3 p-3 bg-red-500/20 border border-red-400/50 rounded-xl">
                <p className="text-red-300">🎤 {sttError}</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};