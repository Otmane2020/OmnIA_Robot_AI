import React, { useState, useEffect, useRef } from 'react';
import { 
  Mic, MicOff, Volume2, VolumeX, Camera, Settings, Power, 
  Send, ArrowLeft, User, Loader2, Upload, QrCode, ShoppingCart,
  Sparkles, Zap, Eye, EyeOff, MessageSquare, Bot, Play, Pause,
  RotateCcw, Move, Music, Wifi, Battery, Signal, Image, X
} from 'lucide-react';
import { ChatMessage } from '../components/ChatMessage';
import { ProductCard } from '../components/ProductCard';
import { CartButton } from '../components/CartButton';
import { RobotAvatar } from '../components/RobotAvatar';
import { useWhisperSTT } from '../hooks/useWhisperSTT';
import { useGoogleTTS } from '../hooks/useGoogleTTS';
import { ChatMessage as ChatMessageType, Product } from '../types';

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

interface RobotState {
  position: { x: number; y: number; rotation: number };
  isMoving: boolean;
  isDancing: boolean;
  isCharging: boolean;
  battery: number;
  mood: 'happy' | 'thinking' | 'speaking' | 'dancing' | 'moving' | 'sleeping';
  currentTask: string;
}

export const RobotInterface: React.FC = () => {
  const [messages, setMessages] = useState<ChatMessageType[]>([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [products, setProducts] = useState<Product[]>([]);
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [showSettings, setShowSettings] = useState(false);
  const [currentSpeakingMessage, setCurrentSpeakingMessage] = useState<string | null>(null);
  const [selectedPhoto, setSelectedPhoto] = useState<File | null>(null);
  const [isAnalyzingPhoto, setIsAnalyzingPhoto] = useState(false);
  const [showQR, setShowQR] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [pendingSTTMessages, setPendingSTTMessages] = useState<any[]>([]);
  
  // Robot state
  const [robotState, setRobotState] = useState<RobotState>({
    position: { x: 0, y: 0, rotation: 0 },
    isMoving: false,
    isDancing: false,
    isCharging: true,
    battery: 95,
    mood: 'happy',
    currentTask: 'Prêt à vous aider'
  });
  
  const [isRobotOn, setIsRobotOn] = useState(true);
  const [isDetectingHuman, setIsDetectingHuman] = useState(false);
  const [isMicOn, setIsMicOn] = useState(true);
  const [isVolumeOn, setIsVolumeOn] = useState(true);
  const [currentUser, setCurrentUser] = useState(() => {
    const loggedUser = localStorage.getItem('current_logged_user');
    if (loggedUser) {
      try {
        return JSON.parse(loggedUser);
      } catch {
        return null;
      }
    }
    return null;
  });
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

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
    handleInitialGreeting();
    checkForPendingSTTMessages();
  }, []);

  useEffect(() => {
    // Vérifier les messages STT en attente toutes les 2 secondes
    const interval = setInterval(checkForPendingSTTMessages, 2000);
    return () => clearInterval(interval);
  }, []);

  const checkForPendingSTTMessages = () => {
    const pending = JSON.parse(localStorage.getItem('robot_pending_messages') || '[]');
    if (pending.length > 0) {
      // Traiter les nouveaux messages STT
      pending.forEach((msg: any) => {
        if (!pendingSTTMessages.find(p => p.id === msg.id)) {
          handleSendMessage(msg.content);
        }
      });
      
      setPendingSTTMessages(pending);
      // Vider la queue après traitement
      localStorage.removeItem('robot_pending_messages');
    }
  };
  useEffect(() => {
    if (transcript && !isProcessing) {
      handleSendMessage(transcript);
      resetSTT();
    }
  }, [transcript, isProcessing]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  useEffect(() => {
    setRobotState(prev => ({
      ...prev,
      mood: isSpeaking ? 'speaking' : isRecording ? 'thinking' : 'happy'
    }));
  }, [isSpeaking, isRecording]);

  const handleInitialGreeting = () => {
    const companyName = currentUser?.company_name || 'notre boutique';
    const greeting = `Bonjour ! Je suis OmnIA 🤖 Robot Designer spécialisé pour ${companyName}. Comment puis-je vous aider aujourd'hui ?`;
    
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
    setRobotState(prev => ({ ...prev, mood: 'thinking', currentTask: 'Analyse de votre demande...' }));

    try {
      // Appel à unified-chat qui utilise DeepSeek + products_enriched
      const searchResponse = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/unified-chat`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          message: messageText,
          retailer_id: currentUser?.email || 'demo-retailer-id'
        }),
      });

      let aiResponse = '';
      let foundProducts: Product[] = [];

      if (searchResponse.ok) {
        const searchData = await searchResponse.json();
        aiResponse = searchData.message;
        foundProducts = searchData.products || [];
        
        console.log('🤖 Réponse unified-chat:', {
          message: aiResponse.substring(0, 50),
          products_count: foundProducts.length,
          enriched_search: searchData.enriched_search
        });
      } else {
        aiResponse = "Je rencontre des difficultés techniques. Pouvez-vous reformuler ?";
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
      
      if (foundProducts.length > 0) {
        handleRobotMove();
      }
      
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
      setRobotState(prev => ({ ...prev, mood: 'happy', currentTask: 'Prêt à vous aider' }));
    }
  };

  const handlePhotoUpload = async (file: File) => {
    if (!file.type.startsWith('image/')) {
      alert('Veuillez sélectionner une image valide');
      return;
    }

    setSelectedPhoto(file);
    setIsAnalyzingPhoto(true);
    setRobotState(prev => ({ ...prev, mood: 'thinking', currentTask: 'Analyse de votre photo...' }));

    try {
      // Créer une URL pour l'image
      const imageUrl = URL.createObjectURL(file);
      
      // Simuler l'analyse IA de l'image
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Analyse simulée basée sur le nom du fichier
      const fileName = file.name.toLowerCase();
      let analysis = '';
      
      if (fileName.includes('salon') || fileName.includes('living')) {
        analysis = `🏠 **Analyse de votre salon :**

**Espace détecté :** Salon moderne avec canapé existant
**Style :** Contemporain avec tons neutres
**Besoins identifiés :** Table basse manquante

**💡 Mes recommandations :**
• **Table AUREA Ø100cm** (499€) - Travertin naturel parfait avec votre style
• **Chaises INAYA** (99€) - Complément idéal en gris clair

**🎨 Conseil déco :** Ajoutez des coussins colorés pour réchauffer l'ambiance !`;
      } else {
        analysis = `📸 **Analyse de votre espace :**

**Style détecté :** Moderne et épuré
**Ambiance :** Chaleureuse avec potentiel d'amélioration
**Opportunités :** Optimisation de l'aménagement

**💡 Mes recommandations personnalisées :**
• **Canapé ALYANA** (799€) - Convertible velours côtelé
• **Table AUREA** (499€) - Travertin naturel élégant

**🎨 Conseil d'expert :** L'harmonie des matériaux créera une ambiance cohérente !`;
      }

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
      handleRobotDance(); // Danse après analyse photo
      
    } catch (error) {
      console.error('Erreur analyse photo:', error);
      alert('Erreur lors de l\'analyse de la photo');
    } finally {
      setIsAnalyzingPhoto(false);
      setSelectedPhoto(null);
      setRobotState(prev => ({ ...prev, mood: 'happy', currentTask: 'Prêt à vous aider' }));
    }
  };

  const handleMicClick = () => {
    if (!isRobotOn) {
      alert('⚡ Robot éteint ! Allumez-le d\'abord avec le bouton Power.');
      return;
    }
    
    if (isRecording) {
      stopRecording();
      setRobotState(prev => ({ ...prev, mood: 'happy' }));
    } else {
      if (isMicOn) {
        startRecording();
        setRobotState(prev => ({ ...prev, mood: 'thinking', currentTask: 'Écoute en cours...' }));
      } else {
        setIsMicOn(true);
        setTimeout(() => {
          startRecording();
          setRobotState(prev => ({ ...prev, mood: 'thinking', currentTask: 'Écoute en cours...' }));
        }, 500);
      }
    }
  };

  const handleVolumeClick = () => {
    if (!isRobotOn) {
      alert('⚡ Robot éteint ! Allumez-le d\'abord avec le bouton Power.');
      return;
    }
    
    if (isSpeaking) {
      stopSpeaking();
      setCurrentSpeakingMessage(null);
      setRobotState(prev => ({ ...prev, mood: 'happy' }));
    } else {
      setIsVolumeOn(!isVolumeOn);
      if (isVolumeOn) {
        alert('🔊 Volume activé !');
      } else {
        alert('🔇 Volume désactivé !');
      }
    }
  };

  const handlePowerToggle = () => {
    setIsRobotOn(!isRobotOn);
    if (!isRobotOn) {
      // Allumer le robot
      setIsMicOn(true);
      setIsVolumeOn(true);
      setIsDetectingHuman(false);
      setRobotState(prev => ({ 
        ...prev, 
        mood: 'happy', 
        currentTask: 'Démarrage...',
        battery: 95
      }));
      alert('⚡ Robot OmnIA allumé !');
      setTimeout(() => {
        setRobotState(prev => ({ ...prev, currentTask: 'Prêt à vous aider' }));
      }, 2000);
    } else {
      // Éteindre le robot
      setIsMicOn(false);
      setIsVolumeOn(false);
      setIsDetectingHuman(false);
      setRobotState(prev => ({ 
        ...prev, 
        mood: 'sleeping', 
        currentTask: 'Mode veille...',
        battery: 95
      }));
      alert('💤 Robot OmnIA éteint !');
      stopSpeaking();
      if (isRecording) stopRecording();
    }
  };

  const handleHumanDetectionToggle = () => {
    if (!isRobotOn) {
      alert('⚡ Robot éteint ! Allumez-le d\'abord avec le bouton Power.');
      return;
    }
    
    setIsDetectingHuman(!isDetectingHuman);
    if (!isDetectingHuman) {
      setRobotState(prev => ({ ...prev, currentTask: 'Détection humaine activée' }));
      alert('👁️ Détection humaine activée !');
      // Simuler détection après 3 secondes
      setTimeout(() => {
        if (isDetectingHuman && isRobotOn) {
          const greetingMessage: ChatMessageType = {
            id: Date.now().toString(),
            content: "👋 Bonjour ! Je vous ai détecté. Bienvenue dans notre showroom ! Comment puis-je vous aider ?",
            isUser: false,
            timestamp: new Date(),
            products: []
          };
          setMessages(prev => [...prev, greetingMessage]);
          speak("Bonjour ! Je vous ai détecté. Bienvenue dans notre showroom !");
        }
      }, 3000);
    } else {
      setRobotState(prev => ({ ...prev, currentTask: 'Détection humaine désactivée' }));
      alert('👁️ Détection humaine désactivée !');
    }
  };

  const handleRobotMove = () => {
    if (!isRobotOn) return;
    
    setRobotState(prev => ({ 
      ...prev, 
      isMoving: true, 
      currentTask: 'Déplacement vers les produits...',
      mood: 'moving'
    }));
    
    setTimeout(() => {
      setRobotState(prev => ({ 
        ...prev, 
        isMoving: false, 
        currentTask: 'Présentation des produits',
        position: { x: prev.position.x + 10, y: prev.position.y, rotation: 0 }
      }));
    }, 2000);
  };

  const handleRobotDance = () => {
    if (!isRobotOn) return;
    
    setRobotState(prev => ({ 
      ...prev, 
      isDancing: true, 
      currentTask: 'Danse de bienvenue !',
      mood: 'dancing'
    }));
    
    setTimeout(() => {
      setRobotState(prev => ({ 
        ...prev, 
        isDancing: false, 
        currentTask: 'Prêt à vous aider',
        mood: 'happy'
      }));
    }, 3000);
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
      
      handleRobotDance(); // Danse de célébration
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

  return (
    <div className="h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-purple-900 flex overflow-hidden">
      {/* Background Effects */}
      <div className="absolute inset-0 opacity-20">
        <div className="absolute top-20 left-20 w-72 h-72 bg-cyan-500/30 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-20 right-20 w-96 h-96 bg-purple-500/20 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '2s' }}></div>
      </div>

      {/* Sidebar - Robot Control Panel - FIXE */}
      <div className="w-96 bg-slate-800/95 backdrop-blur-xl border-r border-slate-700/50 flex flex-col relative z-10 h-screen overflow-hidden">
        {/* Header */}
        <div className="p-6 flex-shrink-0">
          <button
            onClick={() => window.location.href = '/admin'}
            className="flex items-center gap-2 text-cyan-400 hover:text-cyan-300 transition-colors mb-6"
          >
            <ArrowLeft className="w-4 h-4" />
            Admin
          </button>
          
          {/* Logo OmnIA */}
          <div className="flex items-center gap-4 mb-8 pb-6 border-b border-slate-700/50">
            <div className="w-14 h-14 bg-gradient-to-br from-cyan-500 to-purple-600 rounded-2xl flex items-center justify-center relative shadow-2xl">
              <Bot className="w-8 h-8 text-white" />
              <div className="absolute -top-1 -right-1 w-4 h-4 bg-green-400 rounded-full animate-bounce"></div>
            </div>
            <div>
              <h1 className="text-xl font-bold text-white">OmnIA</h1>
              <p className="text-cyan-300">Commercial Mobilier IA</p>
            </div>
          </div>
        </div>

        {/* Contenu principal - CENTRÉ */}
        <div className="flex flex-col items-center justify-center p-6 space-y-6 flex-1">
          {/* Robot Avatar */}
          <div className="relative">
            <RobotAvatar
              mood={robotState.mood}
              isListening={isRecording}
              isSpeaking={isSpeaking}
              isMoving={robotState.isMoving}
              isDancing={robotState.isDancing}
              battery={robotState.battery}
              position={robotState.position}
              size="xl"
            />
          </div>

          {/* Status du robot */}
          <div className="text-center">
            <div className="text-white font-bold text-lg mb-3">{robotState.currentTask}</div>
            <div className="flex items-center justify-center gap-4 text-sm">
              <div className="flex items-center gap-1">
                <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                <span className="text-green-300 font-semibold">{robotState.battery}%</span>
              </div>
              <div className="flex items-center gap-1">
                <Signal className="w-4 h-4 text-cyan-400" />
                <span className="text-cyan-300 font-semibold">Connecté</span>
              </div>
            </div>
          </div>

          {/* Boutons de contrôle - Grid 3x3 */}
          <div className="grid grid-cols-3 gap-3 w-full max-w-sm">
            {/* Première rangée */}
            <button
              onClick={handleMicClick}
              disabled={!sttSupported}
              className={`relative group ${
                !isRobotOn
                  ? 'bg-gradient-to-br from-gray-600 to-gray-700 shadow-lg shadow-gray-500/40 opacity-50'
                  : !isMicOn
                  ? 'bg-gradient-to-br from-gray-500 to-gray-600 shadow-lg shadow-gray-500/40'
                  : isRecording
                  ? 'bg-gradient-to-br from-red-500 to-red-600 shadow-lg shadow-red-500/40 animate-pulse'
                  : 'bg-gradient-to-br from-purple-500 to-purple-600 hover:from-purple-400 hover:to-purple-500 shadow-lg shadow-purple-500/30 hover:shadow-purple-500/50'
              } ${!sttSupported || !isRobotOn ? 'opacity-50 cursor-not-allowed' : ''} 
              w-16 h-16 rounded-2xl flex items-center justify-center transition-all duration-300 hover:scale-110 border-2 border-white/20`}
              title={!isRobotOn ? 'Robot éteint' : !isMicOn ? 'Micro désactivé' : isRecording ? 'Arrêter l\'enregistrement' : 'Commencer l\'enregistrement vocal'}
            >
              {!isRobotOn || !isMicOn ? (
                <MicOff className="w-6 h-6 text-white" />
              ) : isRecording ? (
                <MicOff className="w-6 h-6 text-white" />
              ) : (
                <Mic className="w-6 h-6 text-white" />
              )}
              
              {isRecording && isMicOn && (
                <div className="absolute inset-0 rounded-2xl border-2 border-red-400/50 animate-ping"></div>
              )}
              
              <div className={`absolute -top-1 -right-1 w-3 h-3 rounded-full ${isRobotOn && isMicOn ? 'bg-green-400' : 'bg-red-400'} animate-pulse`}></div>
            </button>

            <button
              onClick={handleVolumeClick}
              className={`relative group ${
                !isRobotOn
                  ? 'bg-gradient-to-br from-gray-600 to-gray-700 shadow-lg shadow-gray-500/40 opacity-50'
                  : !isVolumeOn
                  ? 'bg-gradient-to-br from-gray-500 to-gray-600 shadow-lg shadow-gray-500/40'
                  : isSpeaking
                  ? 'bg-gradient-to-br from-green-500 to-green-600 shadow-lg shadow-green-500/40 animate-pulse'
                  : 'bg-gradient-to-br from-green-500 to-green-600 hover:from-green-400 hover:to-green-500 shadow-lg shadow-green-500/30 hover:shadow-green-500/50'
              } w-16 h-16 rounded-2xl flex items-center justify-center transition-all duration-300 hover:scale-110 border-2 border-white/20`}
              title={!isRobotOn ? 'Robot éteint' : !isVolumeOn ? 'Volume désactivé' : isSpeaking ? 'Arrêter la lecture' : 'Volume activé'}
            >
              {!isRobotOn || !isVolumeOn ? (
                <VolumeX className="w-6 h-6 text-white" />
              ) : isSpeaking ? (
                <VolumeX className="w-6 h-6 text-white" />
              ) : (
                <Volume2 className="w-6 h-6 text-white" />
              )}
              
              <div className={`absolute -top-1 -right-1 w-3 h-3 rounded-full ${isRobotOn && isVolumeOn ? 'bg-green-400' : 'bg-red-400'} animate-pulse`}></div>
            </button>

            <button
              onClick={() => fileInputRef.current?.click()}
              disabled={!isRobotOn}
              className="relative group bg-gradient-to-br from-pink-500 to-pink-600 hover:from-pink-400 hover:to-pink-500 shadow-lg shadow-pink-500/30 hover:shadow-pink-500/50 w-16 h-16 rounded-2xl flex items-center justify-center transition-all duration-300 hover:scale-110 border-2 border-white/20 disabled:opacity-50"
              title="Analyser une photo"
            >
              <Camera className="w-6 h-6 text-white" />
              <div className={`absolute -top-1 -right-1 w-3 h-3 rounded-full ${isRobotOn ? 'bg-green-400' : 'bg-red-400'} animate-pulse`}></div>
            </button>

            {/* Deuxième rangée */}
            <button
              onClick={() => setShowQR(!showQR)}
              disabled={!isRobotOn}
              className="relative group bg-gradient-to-br from-orange-500 to-orange-600 hover:from-orange-400 hover:to-orange-500 shadow-lg shadow-orange-500/30 hover:shadow-orange-500/50 w-16 h-16 rounded-2xl flex items-center justify-center transition-all duration-300 hover:scale-110 border-2 border-white/20 disabled:opacity-50"
              title="QR Code upload photo"
            >
              <QrCode className="w-6 h-6 text-white" />
              <div className={`absolute -top-1 -right-1 w-3 h-3 rounded-full ${isRobotOn ? 'bg-green-400' : 'bg-red-400'} animate-pulse`}></div>
            </button>

            <button
              onClick={() => setShowSettings(!showSettings)}
              disabled={!isRobotOn}
              className="relative group bg-gradient-to-br from-orange-500 to-orange-600 hover:from-orange-400 hover:to-orange-500 shadow-lg shadow-orange-500/30 hover:shadow-orange-500/50 w-16 h-16 rounded-2xl flex items-center justify-center transition-all duration-300 hover:scale-110 border-2 border-white/20 disabled:opacity-50"
              title="Paramètres"
            >
              <Settings className="w-6 h-6 text-white" />
              <div className={`absolute -top-1 -right-1 w-3 h-3 rounded-full ${isRobotOn ? 'bg-green-400' : 'bg-red-400'} animate-pulse`}></div>
            </button>

            <button
              onClick={handleHumanDetectionToggle}
              disabled={!isRobotOn}
              className={`relative group ${
                !isRobotOn
                  ? 'bg-gradient-to-br from-gray-600 to-gray-700 opacity-50'
                  : isDetectingHuman
                  ? 'bg-gradient-to-br from-green-500 to-green-600 shadow-lg shadow-green-500/40'
                  : 'bg-gradient-to-br from-blue-500 to-blue-600 shadow-lg shadow-blue-500/40'
              } w-16 h-16 rounded-2xl flex items-center justify-center transition-all duration-300 hover:scale-110 border-2 border-white/20 disabled:cursor-not-allowed disabled:opacity-50`}
              title={!isRobotOn ? 'Robot éteint' : isDetectingHuman ? 'Détection active' : 'Activer détection'}
            >
              {isDetectingHuman ? (
                <Eye className="w-6 h-6 text-white" />
              ) : (
                <EyeOff className="w-6 h-6 text-white" />
              )}
              <div className={`absolute -top-1 -right-1 w-3 h-3 rounded-full ${isRobotOn && isDetectingHuman ? 'bg-green-400' : 'bg-red-400'} animate-pulse`}></div>
            </button>

            {/* Troisième rangée */}
            <button
              onClick={handleRobotMove}
              disabled={!isRobotOn || robotState.isMoving}
              className="relative group bg-gradient-to-br from-blue-500 to-blue-600 hover:from-blue-400 hover:to-blue-500 shadow-lg shadow-blue-500/30 hover:shadow-blue-500/50 w-16 h-16 rounded-2xl flex flex-col items-center justify-center transition-all duration-300 hover:scale-110 border-2 border-white/20 disabled:opacity-50"
              title={!isRobotOn ? 'Robot éteint' : robotState.isMoving ? 'Déplacement en cours...' : 'Faire bouger le robot'}
            >
              <div className="text-white text-xs font-bold mb-1">+</div>
              <span className="text-white text-xs">Bouger</span>
              <div className={`absolute -top-1 -right-1 w-3 h-3 rounded-full ${isRobotOn && !robotState.isMoving ? 'bg-green-400' : 'bg-red-400'} animate-pulse`}></div>
            </button>

            <button
              onClick={handleRobotDance}
              disabled={!isRobotOn || robotState.isDancing}
              className="relative group bg-gradient-to-br from-pink-500 to-purple-600 hover:from-pink-400 hover:to-purple-500 shadow-lg shadow-pink-500/30 hover:shadow-pink-500/50 w-16 h-16 rounded-2xl flex flex-col items-center justify-center transition-all duration-300 hover:scale-110 border-2 border-white/20 disabled:opacity-50"
              title={!isRobotOn ? 'Robot éteint' : robotState.isDancing ? 'Danse en cours...' : 'Faire danser le robot'}
            >
              <Music className="w-5 h-5 text-white mb-1" />
              <span className="text-white text-xs">Danser</span>
              <div className={`absolute -top-1 -right-1 w-3 h-3 rounded-full ${isRobotOn && !robotState.isDancing ? 'bg-green-400' : 'bg-red-400'} animate-pulse`}></div>
            </button>

            <button
              onClick={handlePowerToggle}
              className={`relative group ${
                isRobotOn
                  ? 'bg-gradient-to-br from-green-500 to-green-600 shadow-lg shadow-green-500/40'
                  : 'bg-gradient-to-br from-gray-600 to-gray-700 shadow-lg shadow-gray-500/40'
              } w-16 h-16 rounded-2xl flex flex-col items-center justify-center transition-all duration-300 hover:scale-110 border-2 border-white/20`}
              title={isRobotOn ? 'Éteindre le robot' : 'Allumer le robot'}
            >
              <div className="w-5 h-5 border-2 border-white rounded flex items-center justify-center mb-1">
                <div className="w-2 h-2 bg-white rounded-full"></div>
              </div>
              <span className="text-white text-xs">Veille</span>
              <div className={`absolute -top-1 -right-1 w-3 h-3 rounded-full ${isRobotOn ? 'bg-green-400' : 'bg-red-400'} animate-pulse`}></div>
            </button>
          </div>
        </div>
      </div>

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col relative z-10 h-screen">
        {/* Chat Header - FIXE */}
        <div className="bg-slate-800/90 backdrop-blur-xl border-b border-slate-700/50 p-4 flex-shrink-0">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-3 h-3 bg-green-400 rounded-full animate-pulse"></div>
              <div>
                <h2 className="text-xl font-bold text-white">
                  Conversation OmnIA • {currentUser?.company_name || 'Revendeur'}
                </h2>
                <p className="text-gray-300">Robot IA spécialisé {currentUser?.company_name || 'mobilier'}</p>
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

        {/* Messages Area - SCROLLABLE */}
        <div className="flex-1 overflow-y-auto p-6 bg-slate-700/20 backdrop-blur-sm">
          <div className="space-y-6 max-w-4xl mx-auto">
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
                      <span className="text-cyan-300 text-sm">OmnIA réfléchit...</span>
                    </div>
                  </div>
                </div>
              </div>
            )}
            
            {/* Affichage des produits */}
            {products.length > 0 && (
              <div className="space-y-6">
                <h3 className="text-2xl font-bold text-white flex items-center gap-3">
                  <Sparkles className="w-6 h-6 text-cyan-400" />
                  Mes recommandations
                  <span className="bg-cyan-500/20 text-cyan-300 px-3 py-1 rounded-full text-sm">
                    {products.length} produit{products.length > 1 ? 's' : ''}
                  </span>
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
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

        {/* Input Area - FIXE EN BAS */}
        <div className="bg-slate-800/90 backdrop-blur-xl border-t border-slate-700/50 p-6 flex-shrink-0">
          <div className="max-w-4xl mx-auto">
            {/* Suggestions */}
            <div className="mb-4">
              <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
                <button
                  onClick={() => handleSuggestionClick("🛋️ Canapé beige")}
                  className="flex-shrink-0 px-4 py-2 bg-purple-500/20 hover:bg-purple-500/30 text-purple-300 hover:text-white text-sm rounded-xl border border-purple-500/30 transition-all whitespace-nowrap"
                >
                  🛋️ Canapé beige
                </button>
                <button
                  onClick={() => handleSuggestionClick("🪑 Table ronde")}
                  className="flex-shrink-0 px-4 py-2 bg-blue-500/20 hover:bg-blue-500/30 text-blue-300 hover:text-white text-sm rounded-xl border border-blue-500/30 transition-all whitespace-nowrap"
                >
                  🪑 Table ronde
                </button>
                <button
                  onClick={() => handleSuggestionClick("💺 Chaise bureau")}
                  className="flex-shrink-0 px-4 py-2 bg-purple-500/20 hover:bg-purple-500/30 text-purple-300 hover:text-white text-sm rounded-xl border border-purple-500/30 transition-all whitespace-nowrap"
                >
                  💺 Chaise bureau
                </button>
                <button
                  onClick={() => handleSuggestionClick("✨ Tendances 2025")}
                  className="flex-shrink-0 px-4 py-2 bg-yellow-500/20 hover:bg-yellow-500/30 text-yellow-300 hover:text-white text-sm rounded-xl border border-yellow-500/30 transition-all whitespace-nowrap"
                >
                  ✨ Tendances 2025
                </button>
              </div>
            </div>

            {/* Statut vocal */}
            {(isRecording || isProcessing || isAnalyzingPhoto) && (
              <div className="mb-4 p-4 bg-blue-500/20 border border-blue-400/50 rounded-xl">
                <div className="flex items-center gap-3">
                  {isRecording ? (
                    <>
                      <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse"></div>
                      <span className="text-red-300 font-semibold">🎤 Écoute active... Parlez maintenant</span>
                    </>
                  ) : isProcessing ? (
                    <>
                      <Loader2 className="w-4 h-4 text-blue-400 animate-spin" />
                      <span className="text-blue-300 font-semibold">🔄 Transcription Whisper en cours...</span>
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

            {/* Statut détection humaine */}
            {isDetectingHuman && (
              <div className="mb-4 p-4 bg-green-500/20 border border-green-400/50 rounded-xl">
                <div className="flex items-center gap-3">
                  <Eye className="w-4 h-4 text-green-400" />
                  <span className="text-green-300 font-semibold">
                    👁️ Détection humaine active - Showroom {currentUser?.company_name || 'boutique'} surveillé
                  </span>
                </div>
              </div>
            )}

            {/* Input avec boutons */}
            <div className="flex gap-4">
              <div className="flex-1 relative">
                <input
                  ref={inputRef}
                  type="text"
                  value={inputMessage}
                  onChange={(e) => setInputMessage(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleSendMessage(inputMessage)}
                  placeholder="Écrivez votre message..."
                  className="w-full bg-slate-700/50 border border-slate-600/50 rounded-2xl px-6 py-4 text-white placeholder-slate-400 focus:outline-none focus:border-cyan-400 focus:ring-2 focus:ring-cyan-400/30"
                />
              </div>
              
              {/* Input photo caché */}
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

              {/* Bouton Photo */}
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

              {/* Bouton Envoyer */}
              <button
                onClick={() => handleSendMessage(inputMessage)}
                disabled={!inputMessage.trim()}
                className="relative group bg-gradient-to-br from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 disabled:from-gray-600 disabled:to-gray-700 shadow-lg shadow-cyan-500/30 hover:shadow-cyan-500/50 w-14 h-14 rounded-2xl flex items-center justify-center transition-all duration-300 hover:scale-110 disabled:cursor-not-allowed disabled:scale-100 border-2 border-white/20"
                title="Envoyer le message"
              >
                <Send className="w-6 h-6 text-white" />
              </button>
            </div>

            {/* Erreur vocale avec diagnostic */}
            {sttError && (
              <div className="mt-3 p-3 bg-red-500/20 border border-red-400/50 rounded-xl">
                <p className="text-red-300">🎤 {sttError}</p>
                <div className="mt-2 text-xs text-red-400">
                  <p>💡 Solutions :</p>
                  <p>• Autorisez l'accès au microphone</p>
                  <p>• Vérifiez que votre micro fonctionne</p>
                  <p>• Essayez de recharger la page</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Modal QR Code */}
      {showQR && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-800/95 backdrop-blur-xl rounded-2xl p-6 max-w-md w-full border border-slate-600/50">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-white">QR Code Chat OmnIA</h3>
              <button
                onClick={() => setShowQR(false)}
                className="text-gray-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="text-center">
              <div className="w-48 h-48 bg-white rounded-2xl flex items-center justify-center mx-auto mb-4">
                <img 
                  src={`https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(window.location.origin + '/upload')}`}
                  alt="QR Code"
                  className="w-44 h-44 rounded-xl"
                />
              </div>
              <p className="text-gray-300">Scannez pour envoyer une photo depuis votre mobile</p>
              <p className="text-cyan-400 text-sm mt-2 font-mono">→ {window.location.origin}/upload</p>
            </div>
          </div>
        </div>
      )}

      {/* Panneau paramètres */}
      {showSettings && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-800/95 backdrop-blur-xl rounded-2xl p-8 max-w-md w-full border border-slate-600/50">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-white">Paramètres Robot</h3>
              <button
                onClick={() => setShowSettings(false)}
                className="text-gray-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="space-y-6">
              <div>
                <label className="block text-sm text-gray-300 mb-2">Personnalité robot</label>
                <select className="w-full bg-black/40 border border-gray-600 rounded-xl px-4 py-3 text-white">
                  <option value="energetic">Énergique et commercial</option>
                  <option value="professional">Professionnel et expert</option>
                  <option value="friendly">Amical et décontracté</option>
                </select>
              </div>

              <div>
                <label className="block text-sm text-gray-300 mb-2">Vitesse de déplacement</label>
                <input
                  type="range"
                  min="1"
                  max="10"
                  defaultValue="5"
                  className="w-full"
                />
              </div>

              <div>
                <label className="block text-sm text-gray-300 mb-2">Fréquence de danse</label>
                <select className="w-full bg-black/40 border border-gray-600 rounded-xl px-4 py-3 text-white">
                  <option value="rare">Rare (ventes uniquement)</option>
                  <option value="normal">Normal (interactions importantes)</option>
                  <option value="frequent">Fréquent (toutes les interactions)</option>
                </select>
              </div>
              
              <div className="bg-blue-500/20 border border-blue-400/50 rounded-xl p-4">
                <h4 className="font-semibold text-blue-200 mb-2">🤖 Capacités robot :</h4>
                <ul className="text-blue-300 text-sm space-y-1">
                  <li>• Déplacement autonome dans le showroom</li>
                  <li>• Danse de célébration lors des ventes</li>
                  <li>• Reconnaissance vocale et synthèse</li>
                  <li>• Analyse photo et recommandations</li>
                  <li>• Gestion du panier et commandes</li>
                </ul>
              </div>
              
              <button
                onClick={() => setShowSettings(false)}
                className="w-full bg-cyan-600 hover:bg-cyan-700 text-white py-3 rounded-xl font-semibold transition-all"
              >
                Fermer
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};