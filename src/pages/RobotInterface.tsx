import React, { useState, useEffect, useRef } from 'react';
import { 
  Mic, MicOff, Volume2, VolumeX, Send, Image, Loader2, QrCode, Camera, 
  Music, Settings, ArrowLeft, Bot, Power, Zap, Eye, EyeOff, Users, 
  Sparkles, X, Sliders, RotateCcw, Play, Pause, Square
} from 'lucide-react';
import { ChatMessage } from '../components/ChatMessage';
import { ProductCard } from '../components/ProductCard';
import { CartButton } from '../components/CartButton';
import { RobotAvatar } from '../components/RobotAvatar';
import { useWhisperSTT } from '../hooks/useWhisperSTT';
import { useGoogleTTS } from '../hooks/useGoogleTTS';
import { ChatMessage as ChatMessageType, Product, RobotStatus } from '../types';

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

export const RobotInterface: React.FC = () => {
  const [messages, setMessages] = useState<ChatMessageType[]>([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [products, setProducts] = useState<Product[]>([]);
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [showProducts, setShowProducts] = useState(false);
  const [isAnalyzingPhoto, setIsAnalyzingPhoto] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [showQRModal, setShowQRModal] = useState(false);
  const [robotStatus, setRobotStatus] = useState<RobotStatus>({
    position: { x: 0, y: 0, rotation: 0 },
    battery: 95,
    isMoving: false,
    isSpeaking: false,
    currentTask: 'Prêt à vous aider',
    nearbyProducts: [],
    visualCapabilities: {
      cameraActive: true,
      analysisInProgress: false,
      lastAnalysis: '',
      currentView: 'showroom',
      detectedObjects: ['canapé', 'table', 'chaise'],
      sceneDescription: 'Showroom mobilier moderne'
    },
    voiceCapabilities: {
      isListening: false,
      voiceRecognitionActive: true,
      currentLanguage: 'fr-FR',
      voicePersonality: 'friendly'
    }
  });

  // États pour les paramètres robot
  const [robotMode, setRobotMode] = useState('actif');
  const [robotPersonality, setRobotPersonality] = useState('energique');
  const [movementSpeed, setMovementSpeed] = useState(50);
  const [danceFrequency, setDanceFrequency] = useState('rare');
  const [isRobotOn, setIsRobotOn] = useState(true);
  const [humanDetected, setHumanDetected] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // 🎤 STT
  const { isRecording, startRecording, stopRecording, transcript } = useWhisperSTT({ continuous: false });
  // 🔊 TTS
  const { speak, stopSpeaking, isSpeaking } = useGoogleTTS();

  // Message de bienvenue avec analyse photo
  useEffect(() => {
    const photoAnalysis = localStorage.getItem('photo_analysis');
    const uploadedPhoto = localStorage.getItem('uploaded_photo');
    
    if (photoAnalysis && uploadedPhoto) {
      const greeting = `📸 J'ai analysé votre photo ! ${photoAnalysis}`;
      setMessages([{ 
        id: Date.now().toString(), 
        content: greeting, 
        isUser: false, 
        timestamp: new Date(), 
        products: [],
        photoUrl: uploadedPhoto
      }]);
      speak(greeting);
      
      // Nettoyer après utilisation
      localStorage.removeItem('photo_analysis');
      localStorage.removeItem('uploaded_photo');
    } else {
      const greeting = "Bonjour ! Je suis OmnIA 🤖 Votre Robot Designer spécialisé en mobilier. J'ai analysé 668 produits de votre catalogue. Comment puis-je vous aider ?";
      setMessages([{ id: Date.now().toString(), content: greeting, isUser: false, timestamp: new Date(), products: [] }]);
      speak(greeting);
    }
  }, []);

  // Scroll auto
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // --- Appel API IA amélioré ---
  const sendToAI = async (message: string): Promise<{ message: string; products: Product[] }> => {
    try {
      const res = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/unified-chat`, {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          "Authorization": `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`
        },
        body: JSON.stringify({
          message: message,
          retailer_id: 'demo-retailer-id',
          conversation_context: messages.slice(-3).map(m => ({
            role: m.isUser ? 'user' : 'assistant',
            content: m.content
          }))
        }),
      });

      if (!res.ok) throw new Error("Erreur API");
      const data = await res.json();
      
      // Parser les produits depuis la réponse
      const foundProducts = data.products || [];
      
      return {
        message: data.message || "Comment puis-je vous aider ?",
        products: foundProducts
      };
    } catch (err) {
      console.error("❌ Erreur sendToAI:", err);
      return {
        message: "Erreur de communication avec l'assistant IA.",
        products: []
      };
    }
  };

  // --- Gestion des messages texte ---
  const handleSendMessage = async (messageText: string) => {
    if (!messageText.trim()) return;

    // Ajout message utilisateur
    setMessages(prev => [...prev, { id: Date.now().toString(), content: messageText, isUser: true, timestamp: new Date() }]);
    setInputMessage('');
    setIsTyping(true);

    try {
      // 🔥 Envoi au moteur IA amélioré
      const aiResponse = await sendToAI(messageText);

      // Ajout réponse IA avec produits
      setMessages(prev => [...prev, {
        id: (Date.now() + 1).toString(),
        content: aiResponse.message,
        isUser: false,
        timestamp: new Date(),
        products: aiResponse.products
      }]);

      setProducts(aiResponse.products);
      setShowProducts(aiResponse.products.length > 0);

      speak(aiResponse.message);
    } catch (error) {
      console.error("❌ Erreur handleSendMessage:", error);
      const errorMessage = "Désolé, petit souci technique 🤖. Pouvez-vous reformuler ?";
      setMessages(prev => [...prev, { id: (Date.now() + 1).toString(), content: errorMessage, isUser: false, timestamp: new Date(), products: [] }]);
      speak(errorMessage);
    } finally {
      setIsTyping(false);
    }
  };

  // --- Gestion des photos ---
  const handlePhotoUpload = async (file: File) => {
    if (!file.type.startsWith('image/')) return;
    setIsAnalyzingPhoto(true);

    try {
      const base64 = await fileToBase64(file);

      const response = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/enrich-products`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ image_base64: base64 }),
      });

      let analysis = "📸 Analyse en cours...";
      let foundProducts: Product[] = [];

      if (response.ok) {
        const visionData = await response.json();
        analysis = visionData.analysis;
        // On enrichit avec l'IA
        const aiResponse = await sendToAI(`Analyse cette image: ${analysis}`);
        foundProducts = aiResponse.products;
      }

      setMessages(prev => [...prev, {
        id: Date.now().toString(),
        content: analysis,
        isUser: false,
        timestamp: new Date(),
        products: foundProducts,
        photoUrl: URL.createObjectURL(file),
      }]);

      setProducts(foundProducts);
      setShowProducts(foundProducts.length > 0);
      speak(analysis);

    } catch (error) {
      console.error("❌ Erreur analyse photo:", error);
    } finally {
      setIsAnalyzingPhoto(false);
    }
  };

  const fileToBase64 = (file: File): Promise<string> => new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve((reader.result as string).split(',')[1]);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });

  // --- Fonctions Robot ---
  const handleRobotPower = () => {
    setIsRobotOn(!isRobotOn);
    setRobotStatus(prev => ({
      ...prev,
      currentTask: !isRobotOn ? 'Activation...' : 'Mise en veille...'
    }));
    
    setTimeout(() => {
      setRobotStatus(prev => ({
        ...prev,
        currentTask: !isRobotOn ? 'Prêt à vous aider' : 'En veille'
      }));
    }, 2000);
  };

  const handleRobotMove = () => {
    if (!isRobotOn) return;
    setRobotStatus(prev => ({ ...prev, isMoving: true, currentTask: 'Déplacement...' }));
    setTimeout(() => {
      setRobotStatus(prev => ({ ...prev, isMoving: false, currentTask: 'Position atteinte' }));
    }, 3000);
  };

  const handleRobotDance = () => {
    if (!isRobotOn) return;
    setRobotStatus(prev => ({ ...prev, currentTask: 'Danse de célébration !' }));
    setTimeout(() => {
      setRobotStatus(prev => ({ ...prev, currentTask: 'Prêt à vous aider' }));
    }, 5000);
  };

  const handleRobotSleep = () => {
    if (!isRobotOn) return;
    setRobotStatus(prev => ({ ...prev, currentTask: 'Mode veille activé' }));
  };

  const handleCameraToggle = () => {
    if (!isRobotOn) return;
    setRobotStatus(prev => ({
      ...prev,
      visualCapabilities: {
        ...prev.visualCapabilities,
        cameraActive: !prev.visualCapabilities.cameraActive
      },
      currentTask: prev.visualCapabilities.cameraActive ? 'Caméra désactivée' : 'Caméra activée'
    }));
  };

  const handleHumanDetection = () => {
    if (!isRobotOn) return;
    setHumanDetected(!humanDetected);
    if (!humanDetected) {
      const greetingMessage = "👋 Bonjour ! Je vous ai détecté ! Bienvenue dans notre showroom ! Comment puis-je vous aider aujourd'hui ?";
      setMessages(prev => [...prev, {
        id: Date.now().toString(),
        content: greetingMessage,
        isUser: false,
        timestamp: new Date(),
        products: []
      }]);
      speak(greetingMessage);
      setRobotStatus(prev => ({ ...prev, currentTask: 'Salutation client détecté' }));
    } else {
      setRobotStatus(prev => ({ ...prev, currentTask: 'Détection humain désactivée' }));
    }
  };

  // --- Micro ---
  const handleMicClick = () => {
    if (!isRobotOn) return;
    if (isRecording) {
      stopRecording();
      setRobotStatus(prev => ({
        ...prev,
        voiceCapabilities: { ...prev.voiceCapabilities, isListening: false }
      }));
    } else {
      startRecording();
      setRobotStatus(prev => ({
        ...prev,
        voiceCapabilities: { ...prev.voiceCapabilities, isListening: true }
      }));
    }
  };

  // --- Volume ---
  const handleVolumeClick = () => {
    if (!isRobotOn) return;
    if (isSpeaking) {
      stopSpeaking();
      setRobotStatus(prev => ({ ...prev, isSpeaking: false }));
    }
  };

  // --- QR Code pour photo ---
  const handleQRClick = () => {
    if (!isRobotOn) return;
    setShowQRModal(true);
  };

  // --- Envoi auto quand Whisper transcrit ---
  useEffect(() => {
    if (transcript && transcript.trim() !== '') {
      handleSendMessage(transcript);
    }
  }, [transcript]);

  const handleSuggestionClick = (suggestion: string) => {
    handleSendMessage(suggestion);
  };

  const handleAddToCart = (productId: string, variantId: string) => {
    console.log('Ajout au panier:', productId, variantId);
  };

  return (
    <div className="flex h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-purple-900">
      
      {/* 👈 Sidebar Robot - 40% de l'écran */}
      <div className="w-2/5 bg-slate-900/95 flex flex-col relative overflow-hidden">
        {/* Background effects */}
        <div className="absolute inset-0 opacity-30">
          <div className="absolute top-20 left-10 w-32 h-32 bg-cyan-400/20 rounded-full blur-2xl"></div>
          <div className="absolute bottom-20 right-10 w-40 h-40 bg-purple-400/20 rounded-full blur-2xl"></div>
        </div>

        {/* Header avec retour Admin */}
        <div className="relative z-10 p-6 border-b border-white/10">
          <button
            onClick={() => window.location.href = '/admin'}
            className="flex items-center gap-2 text-cyan-300 hover:text-cyan-200 transition-colors mb-6"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Admin</span>
          </button>
          
          {/* Logo OmnIA */}
          <div className="flex items-center gap-4 mb-6">
            <div className="w-16 h-16 bg-gradient-to-br from-cyan-400 to-blue-500 rounded-2xl flex items-center justify-center relative shadow-2xl border-2 border-cyan-300/50">
              <div className="w-8 h-8 bg-white rounded-xl flex items-center justify-center">
                <div className="w-6 h-6 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-lg"></div>
              </div>
              <div className="absolute -top-1 -right-1 w-4 h-4 bg-green-400 rounded-full animate-bounce"></div>
            </div>
            <div>
              <h1 className="text-white font-bold text-xl">OmnIA</h1>
              <p className="text-cyan-300 text-sm">Commercial Mobilier IA</p>
            </div>
          </div>

          {/* Info magasin */}
          <div className="bg-white/10 backdrop-blur-xl rounded-xl p-4 border border-white/20">
            <div className="text-white font-bold text-sm">Decora Home</div>
            <div className="text-cyan-300 text-xs">668 produits actifs</div>
            <div className="text-cyan-400 text-xs">Plan Professional</div>
          </div>
        </div>

        {/* Robot Avatar Gradient avec bouche souriante */}
        <div className="relative z-10 flex-1 flex flex-col p-8 space-y-8">
          <div className="relative mb-8">
            <div className="w-48 h-48 mx-auto bg-gradient-to-br from-cyan-400 via-blue-500 to-purple-600 rounded-3xl shadow-2xl relative overflow-hidden border-4 border-cyan-400/50">
              {/* Grands yeux ronds animés */}
              <div className="absolute top-12 left-1/2 transform -translate-x-1/2 flex gap-6">
                <div className="w-12 h-12 bg-white rounded-full border-3 border-slate-300 flex items-center justify-center">
                  <div className={`w-6 h-6 rounded-full transition-all duration-300 ${
                    robotStatus.visualCapabilities.cameraActive && isRobotOn ? 'bg-cyan-500 animate-pulse' : 'bg-gray-400'
                  }`}></div>
                </div>
                <div className="w-12 h-12 bg-white rounded-full border-3 border-slate-300 flex items-center justify-center">
                  <div className={`w-6 h-6 rounded-full transition-all duration-300 ${
                    robotStatus.voiceCapabilities.isListening ? 'bg-red-500 animate-pulse' : 'bg-cyan-500'
                  }`}></div>
                </div>
              </div>
              
              {/* Bouche souriante animée */}
              <div className="absolute bottom-16 left-1/2 transform -translate-x-1/2">
                <div className={`w-16 h-8 bg-white rounded-full transition-all duration-300 relative overflow-hidden ${
                  isSpeaking ? 'animate-pulse scale-110' : ''
                }`}>
                  {/* Sourire */}
                  <div className="absolute bottom-1 left-1/2 transform -translate-x-1/2 w-12 h-6 border-b-4 border-gray-800 rounded-full"></div>
                  {/* Dents */}
                  <div className="absolute bottom-2 left-1/2 transform -translate-x-1/2 flex gap-1">
                    <div className="w-1 h-2 bg-gray-800 rounded-full"></div>
                    <div className="w-1 h-2 bg-gray-800 rounded-full"></div>
                    <div className="w-1 h-2 bg-gray-800 rounded-full"></div>
                  </div>
                </div>
              </div>
              
              {/* Particules d'énergie */}
              <div className="absolute top-4 left-4 w-3 h-3 bg-cyan-400 rounded-full animate-bounce"></div>
              <div className="absolute top-6 right-5 w-2 h-2 bg-purple-400 rounded-full animate-bounce" style={{ animationDelay: '0.5s' }}></div>
              <div className="absolute bottom-6 left-5 w-3 h-3 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: '1s' }}></div>
              
              {/* Effet de brillance */}
              <div className="absolute inset-0 bg-gradient-to-br from-white/30 via-transparent to-transparent pointer-events-none rounded-3xl"></div>
              
              {/* Indicateur d'état */}
              {!isRobotOn && (
                <div className="absolute inset-0 bg-black/60 rounded-3xl flex items-center justify-center">
                  <div className="text-white text-center">
                    <Power className="w-8 h-8 mx-auto mb-2 opacity-50" />
                    <p className="text-sm opacity-75">Éteint</p>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Barre de progression */}
          <div className="w-full h-3 bg-slate-700/50 rounded-full mb-6">
            <div 
              className="h-full bg-gradient-to-r from-cyan-400 to-purple-500 rounded-full transition-all duration-1000" 
              style={{ width: `${robotStatus.battery}%` }}
            ></div>
          </div>

          {/* Statut Robot */}
          <div className="text-center mb-8">
            <div className="text-white font-bold text-xl mb-4">{robotStatus.currentTask}</div>
            <div className="flex items-center justify-center gap-8 text-sm">
              <div className="flex items-center gap-2">
                <div className={`w-3 h-3 rounded-full animate-pulse ${isRobotOn ? 'bg-green-400' : 'bg-red-400'}`}></div>
                <span className={`font-semibold ${isRobotOn ? 'text-green-300' : 'text-red-300'}`}>
                  {robotStatus.battery}%
                </span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-1 h-4 bg-cyan-400 rounded-full"></div>
                <div className="w-1 h-3 bg-cyan-400 rounded-full"></div>
                <div className="w-1 h-5 bg-cyan-400 rounded-full"></div>
                <span className="text-cyan-300 font-semibold ml-2">
                  {isRobotOn ? 'Connecté' : 'Hors ligne'}
                </span>
              </div>
            </div>
          </div>

          {/* Boutons de contrôle resserrés - Grid 3x3 */}
          <div className="grid grid-cols-3 gap-2 mb-4">
            {/* Première rangée - Micro, Volume, Détection humain */}
            <button
              onClick={handleMicClick}
              disabled={!isRobotOn}
              className={`w-16 h-16 rounded-2xl flex items-center justify-center transition-all duration-300 hover:scale-105 shadow-lg ${
                isRecording
                  ? 'bg-red-500 shadow-red-500/40 animate-pulse'
                  : isRobotOn 
                    ? 'bg-purple-500 hover:bg-purple-400'
                    : 'bg-gray-600 cursor-not-allowed'
              }`}
            >
              {isRecording ? <MicOff className="w-6 h-6 text-white" /> : <Mic className="w-6 h-6 text-white" />}
            </button>

            <button
              onClick={handleVolumeClick}
              disabled={!isRobotOn}
              className={`w-16 h-16 rounded-2xl flex items-center justify-center transition-all duration-300 hover:scale-105 shadow-lg ${
                isSpeaking
                  ? 'bg-green-500 shadow-green-500/40 animate-pulse'
                  : isRobotOn
                    ? 'bg-green-500 hover:bg-green-400 shadow-lg'
                    : 'bg-gray-600 cursor-not-allowed'
              }`}
            >
              {isSpeaking ? <VolumeX className="w-6 h-6 text-white" /> : <Volume2 className="w-6 h-6 text-white" />}
            </button>

            <button
              onClick={handleHumanDetection}
              disabled={!isRobotOn}
              className={`w-16 h-16 rounded-2xl flex items-center justify-center transition-all duration-300 hover:scale-105 shadow-lg ${
                humanDetected && isRobotOn
                  ? 'bg-pink-500 hover:bg-pink-400 animate-pulse'
                  : isRobotOn
                    ? 'bg-pink-500 hover:bg-pink-400'
                    : 'bg-gray-600 cursor-not-allowed'
              }`}
              title="Détection humain pour salutation"
            >
              <div className="relative">
                <Users className="w-6 h-6 text-white" />
                {humanDetected && isRobotOn && (
                  <div className="absolute -top-1 -right-1 w-4 h-4 bg-green-400 rounded-full animate-pulse"></div>
                )}
              </div>
            </button>

            {/* Deuxième rangée */}
            <button
              onClick={handleQRClick}
              disabled={!isRobotOn}
              className={`w-16 h-16 rounded-2xl flex items-center justify-center transition-all duration-300 hover:scale-105 shadow-lg ${
                isRobotOn ? 'bg-orange-500 hover:bg-orange-400' : 'bg-gray-600 cursor-not-allowed'
              }`}
            >
              <QrCode className="w-6 h-6 text-white" />
            </button>

            <button
              onClick={() => setShowSettings(true)}
              disabled={!isRobotOn}
              className={`w-16 h-16 rounded-2xl flex items-center justify-center transition-all duration-300 hover:scale-105 shadow-lg ${
                isRobotOn ? 'bg-orange-500 hover:bg-orange-400' : 'bg-gray-600 cursor-not-allowed'
              }`}
              title="Paramètres robot"
            >
              <Settings className="w-6 h-6 text-white" />
            </button>

            <button
              onClick={handleRobotPower}
              className={`w-16 h-16 rounded-2xl flex items-center justify-center transition-all duration-300 hover:scale-110 shadow-2xl border-4 ${
                isRobotOn
                  ? 'bg-gradient-to-br from-green-400 to-emerald-500 border-green-300 shadow-green-500/50'
                  : 'bg-gradient-to-br from-red-400 to-red-500 border-red-300 shadow-red-500/50'
              }`}
            >
              <Power className="w-8 h-8 text-white" />
            </button>

            {/* Troisième rangée */}
            <button
              onClick={handleRobotMove}
              disabled={!isRobotOn}
              className={`w-16 h-16 rounded-2xl flex flex-col items-center justify-center transition-all duration-300 hover:scale-105 shadow-lg ${
                isRobotOn ? 'bg-blue-500 hover:bg-blue-400' : 'bg-gray-600 cursor-not-allowed'
              }`}
            >
              <div className="text-white text-sm font-bold mb-1">+</div>
              <span className="text-white text-xs">Bouger</span>
            </button>

            <button
              onClick={handleRobotDance}
              disabled={!isRobotOn}
              className={`w-16 h-16 rounded-2xl flex flex-col items-center justify-center transition-all duration-300 hover:scale-105 shadow-lg ${
                isRobotOn ? 'bg-purple-500 hover:bg-purple-400' : 'bg-gray-600 cursor-not-allowed'
              }`}
            >
              <Music className="w-6 h-6 text-white mb-1" />
              <span className="text-white text-xs">Danser</span>
            </button>

            <button
              onClick={handleRobotSleep}
              disabled={!isRobotOn}
              className={`w-16 h-16 rounded-2xl flex flex-col items-center justify-center transition-all duration-300 hover:scale-105 shadow-lg ${
                isRobotOn ? 'bg-gray-600 hover:bg-gray-500' : 'bg-gray-700 cursor-not-allowed'
              }`}
            >
              <div className="w-6 h-6 border-2 border-white rounded flex items-center justify-center mb-1">
                <div className="w-3 h-3 bg-white rounded-full"></div>
              </div>
              <span className="text-white text-xs">Veille</span>
            </button>
          </div>

          {/* Capacités Robot */}
          <div className="bg-cyan-500/20 border border-cyan-400/50 rounded-xl p-4">
            <h4 className="font-semibold text-cyan-200 mb-3 flex items-center gap-2">
              <Bot className="w-4 h-4" />
              🤖 Capacités robot :
            </h4>
            <ul className="text-cyan-300 text-sm space-y-1">
              <li>• Déplacement autonome dans le showroom</li>
              <li>• Danse de célébration lors des ventes</li>
              <li>• Reconnaissance vocale et synthèse</li>
              <li>• Analyse photo et recommandations</li>
              <li>• Détection humain pour salutation</li>
              <li>• Gestion du panier et commandes</li>
            </ul>
          </div>
        </div>
      </div>

      {/* 👉 Zone de chat principale - 60% de l'écran */}
      <div className="w-3/5 flex flex-col" style={{ backgroundColor: 'rgb(236 72 153 / 0.2)' }}>
        {/* Header de conversation */}
        <div className="bg-slate-800 border-b border-slate-700 p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className={`w-3 h-3 rounded-full animate-pulse ${isRobotOn ? 'bg-green-400' : 'bg-red-400'}`}></div>
              <div>
                <h2 className="text-xl font-bold text-white">Conversation OmnIA</h2>
                <p className="text-gray-300">Robot IA à votre écoute</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <button 
                onClick={() => setShowSettings(true)}
                className="p-2 bg-purple-500/20 hover:bg-purple-500/30 rounded-xl transition-colors border border-purple-400/50"
              >
                <Settings className="w-5 h-5 text-purple-300" />
              </button>
              <CartButton 
                items={cartItems}
                onUpdateQuantity={() => {}}
                onRemoveItem={() => {}}
                onCheckout={() => {}}
              />
            </div>
          </div>
        </div>

        {/* Zone des messages */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {messages.map(msg => (
            <ChatMessage key={msg.id} message={msg} onAddToCart={handleAddToCart} />
          ))}
          {isTyping && (
            <div className="flex justify-start">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-full flex items-center justify-center">
                  <div className="w-5 h-5 bg-white/20 rounded-full animate-pulse"></div>
                </div>
                <div className="bg-white p-4 rounded-2xl shadow-lg border border-gray-200">
                  <div className="flex items-center gap-2">
                    <div className="flex gap-1">
                      <div className="w-2 h-2 bg-cyan-400 rounded-full animate-bounce"></div>
                      <div className="w-2 h-2 bg-cyan-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                      <div className="w-2 h-2 bg-cyan-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                    </div>
                    <span className="text-gray-600 text-sm">OmnIA réfléchit...</span>
                  </div>
                </div>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Suggestions rapides */}
        <div className="px-6 py-4">
          <div className="flex gap-3 overflow-x-auto pb-2">
            <button
              onClick={() => handleSuggestionClick("🛋️ Canapé beige")}
              className="flex-shrink-0 px-4 py-2 bg-blue-100 hover:bg-blue-200 text-blue-700 rounded-full border border-blue-300 transition-all whitespace-nowrap flex items-center gap-2"
            >
              🛋️ Canapé beige
            </button>
            <button
              onClick={() => handleSuggestionClick("🪑 Table ronde")}
              className="flex-shrink-0 px-4 py-2 bg-orange-100 hover:bg-orange-200 text-orange-700 rounded-full border border-orange-300 transition-all whitespace-nowrap flex items-center gap-2"
            >
              🪑 Table ronde
            </button>
            <button
              onClick={() => handleSuggestionClick("💺 Chaise bureau")}
              className="flex-shrink-0 px-4 py-2 bg-green-100 hover:bg-green-200 text-green-700 rounded-full border border-green-300 transition-all whitespace-nowrap flex items-center gap-2"
            >
              💺 Chaise bureau
            </button>
            <button
              onClick={() => handleSuggestionClick("✨ Tendances 2025")}
              className="flex-shrink-0 px-4 py-2 bg-yellow-100 hover:bg-yellow-200 text-yellow-700 rounded-full border border-yellow-300 transition-all whitespace-nowrap flex items-center gap-2"
            >
              ✨ Tendances 2025
            </button>
          </div>
        </div>

        {/* Zone de saisie */}
        <div className="p-6 bg-slate-800 border-t border-slate-700">
          <div className="flex gap-3">
            <div className="flex-1 relative">
              <input
                type="text"
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSendMessage(inputMessage)}
                placeholder="Écrivez votre message..."
                disabled={!isRobotOn}
                className="w-full bg-slate-700 border border-slate-600 rounded-2xl px-6 py-4 text-white placeholder-slate-400 focus:outline-none focus:border-cyan-400 focus:ring-2 focus:ring-cyan-400/30 disabled:opacity-50 disabled:cursor-not-allowed"
              />
            </div>
            
            <button
              onClick={handleQRClick}
              disabled={!isRobotOn}
              className={`w-16 h-16 rounded-2xl flex items-center justify-center transition-all hover:scale-105 shadow-lg ${
                isRobotOn ? 'bg-purple-500 hover:bg-purple-600' : 'bg-gray-600 cursor-not-allowed'
              }`}
              title="QR Code pour upload photo mobile"
            >
              <QrCode className="w-6 h-6 text-white" />
            </button>

            <button
              onClick={() => handleSendMessage(inputMessage)}
              disabled={!inputMessage.trim() || !isRobotOn}
              className="w-16 h-16 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 disabled:from-gray-400 disabled:to-gray-500 rounded-2xl flex items-center justify-center transition-all hover:scale-105 disabled:cursor-not-allowed shadow-lg"
            >
              <Send className="w-6 h-6 text-white" />
            </button>
          </div>
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
      </div>

      {/* Modal QR Code pour photo */}
      {showQRModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-800/95 backdrop-blur-xl rounded-2xl p-6 max-w-md w-full border border-slate-600/50 shadow-2xl">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-white flex items-center gap-2">
                <QrCode className="w-6 h-6 text-purple-400" />
                📱 Scanner pour envoyer photo
              </h3>
              <button
                onClick={() => setShowQRModal(false)}
                className="text-gray-400 hover:text-white transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="text-center space-y-6">
              <div className="w-48 h-48 bg-white rounded-2xl flex items-center justify-center mx-auto shadow-lg">
                <img 
                  src={`https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent('https://omnia.sale/upload')}`}
                  alt="QR Code"
                  className="w-44 h-44 rounded-xl"
                />
              </div>
              <div>
                <h4 className="text-lg font-bold text-white mb-2">📱 Scannez avec votre mobile</h4>
                <p className="text-gray-300 text-sm mb-4">
                  Ouvrez l'appareil photo de votre téléphone et scannez ce QR code pour envoyer une photo de votre espace
                </p>
                <div className="bg-purple-500/20 border border-purple-400/50 rounded-xl p-3">
                  <p className="text-purple-300 text-sm">
                    📸 OmnIA analysera votre photo et vous donnera des conseils personnalisés !
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowQRModal(false)}
                className="w-full bg-gray-600 hover:bg-gray-700 text-white py-3 rounded-xl transition-all"
              >
                Fermer
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Paramètres Robot */}
      {showSettings && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-800/95 backdrop-blur-xl rounded-2xl p-6 max-w-md w-full border border-slate-600/50 shadow-2xl">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-white flex items-center gap-2">
                <Settings className="w-6 h-6 text-cyan-400" />
                Paramètres Robot
              </h3>
              <button
                onClick={() => setShowSettings(false)}
                className="text-gray-400 hover:text-white transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="space-y-6">
              {/* Mode questionnement */}
              <div>
                <label className="block text-sm text-cyan-300 mb-2">Mode questionnement</label>
                <select
                  value={robotMode}
                  onChange={(e) => setRobotMode(e.target.value)}
                  className="w-full bg-black/40 border border-cyan-500/50 rounded-xl px-4 py-3 text-white"
                >
                  <option value="actif">Actif - Pose des questions pour préciser</option>
                  <option value="passif">Passif - Répond seulement aux demandes</option>
                  <option value="proactif">Proactif - Propose activement des produits</option>
                </select>
              </div>

              {/* Personnalité robot */}
              <div>
                <label className="block text-sm text-cyan-300 mb-2">Personnalité robot</label>
                <select
                  value={robotPersonality}
                  onChange={(e) => setRobotPersonality(e.target.value)}
                  className="w-full bg-black/40 border border-cyan-500/50 rounded-xl px-4 py-3 text-white"
                >
                  <option value="energique">Énergique et commercial</option>
                  <option value="professionnel">Professionnel et courtois</option>
                  <option value="amical">Amical et décontracté</option>
                  <option value="expert">Expert technique</option>
                </select>
              </div>

              {/* Vitesse de déplacement */}
              <div>
                <label className="block text-sm text-cyan-300 mb-2">
                  Vitesse de déplacement: {movementSpeed}%
                </label>
                <input
                  type="range"
                  min="10"
                  max="100"
                  value={movementSpeed}
                  onChange={(e) => setMovementSpeed(parseInt(e.target.value))}
                  className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer slider"
                />
                <div className="flex justify-between text-xs text-gray-400 mt-1">
                  <span>Lent</span>
                  <span>Rapide</span>
                </div>
              </div>

              {/* Fréquence de danse */}
              <div>
                <label className="block text-sm text-cyan-300 mb-2">Fréquence de danse</label>
                <select
                  value={danceFrequency}
                  onChange={(e) => setDanceFrequency(e.target.value)}
                  className="w-full bg-black/40 border border-cyan-500/50 rounded-xl px-4 py-3 text-white"
                >
                  <option value="jamais">Jamais (ventes uniquement)</option>
                  <option value="rare">Rare (ventes importantes)</option>
                  <option value="normal">Normal (toutes les ventes)</option>
                  <option value="frequent">Fréquent (interactions positives)</option>
                </select>
              </div>

              {/* Capacités robot */}
              <div className="bg-cyan-500/20 border border-cyan-400/50 rounded-xl p-4">
                <h4 className="font-semibold text-cyan-200 mb-3 flex items-center gap-2">
                  <Bot className="w-4 h-4" />
                  🤖 Capacités robot :
                </h4>
                <ul className="text-cyan-300 text-sm space-y-1">
                  <li>• Déplacement autonome dans le showroom</li>
                  <li>• Danse de célébration lors des ventes</li>
                  <li>• Reconnaissance vocale et synthèse</li>
                  <li>• Analyse photo et recommandations</li>
                  <li>• Détection humain pour salutation</li>
                  <li>• Gestion du panier et commandes</li>
                </ul>
              </div>

              {/* Bouton fermer */}
              <button
                onClick={() => setShowSettings(false)}
                className="w-full bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white py-3 rounded-xl font-semibold transition-all"
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