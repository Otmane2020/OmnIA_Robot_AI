import React, { useState, useEffect, useRef } from 'react';
import { Mic, MicOff, Volume2, VolumeX, Send, Image, Loader2, QrCode, Camera, Music, Settings, ArrowLeft, X } from 'lucide-react';
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

export const ChatInterface: React.FC = () => {
  const [messages, setMessages] = useState<ChatMessageType[]>([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [products, setProducts] = useState<Product[]>([]);
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [showProducts, setShowProducts] = useState(false);
  const [isAnalyzingPhoto, setIsAnalyzingPhoto] = useState(false);
  const [showQR, setShowQR] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // 🎤 STT
  const { isRecording, startRecording, stopRecording, transcript } = useWhisperSTT({ continuous: false });
  // 🔊 TTS
  const { speak, stopSpeaking, isSpeaking } = useGoogleTTS();

  // Message de bienvenue
  useEffect(() => {
    const greeting = "Bonjour ! Je suis OmnIA 🤖 Votre Robot Designer spécialisé en mobilier. J'ai analysé 668 produits de votre catalogue. Comment puis-je vous aider ?";
    setMessages([{ id: Date.now().toString(), content: greeting, isUser: false, timestamp: new Date(), products: [] }]);
    speak(greeting);
  }, []);

  // Scroll auto
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Produits Decora Home
  const getDecoraProducts = () => [
    {
      id: 'decora-canape-alyana-beige',
      handle: 'canape-alyana-beige',
      title: 'Canapé ALYANA convertible - Beige',
      productType: 'Canapé',
      vendor: 'Decora Home',
      tags: ['convertible', 'velours', 'beige'],
      price: 799,
      compareAtPrice: 1399,
      availableForSale: true,
      quantityAvailable: 100,
      image_url: 'https://cdn.shopify.com/s/files/1/0903/7578/2665/files/7_23a97631-68d2-4f3e-8f78-b26c7cd4c2ae.png?v=1754406480',
      product_url: 'https://decorahome.fr/products/canape-dangle-convertible-et-reversible-4-places-en-velours-cotele',
      description: 'Canapé d\'angle convertible 4 places en velours côtelé beige avec coffre de rangement',
      variants: [{
        id: 'variant-beige',
        title: 'Beige',
        price: 799,
        compareAtPrice: 1399,
        availableForSale: true,
        quantityAvailable: 100,
        selectedOptions: [{ name: 'Couleur', value: 'Beige' }]
      }]
    },
    {
      id: 'decora-table-aurea-100',
      handle: 'table-aurea-100',
      title: 'Table AUREA Ø100cm - Travertin',
      productType: 'Table',
      vendor: 'Decora Home',
      tags: ['travertin', 'ronde', 'naturel'],
      price: 499,
      compareAtPrice: 859,
      availableForSale: true,
      quantityAvailable: 50,
      image_url: 'https://cdn.shopify.com/s/files/1/0903/7578/2665/files/3_e80b9a50-b032-4267-8f5b-f9130153e3be.png?v=1754406484',
      product_url: 'https://decorahome.fr/products/table-a-manger-ronde-plateau-en-travertin-naturel-100-120-cm',
      description: 'Table ronde en travertin naturel avec pieds métal noir',
      variants: [{
        id: 'variant-100cm',
        title: 'Ø100cm',
        price: 499,
        compareAtPrice: 859,
        availableForSale: true,
        quantityAvailable: 50,
        selectedOptions: [{ name: 'Taille', value: '100cm' }]
      }]
    },
    {
      id: 'decora-chaise-inaya-gris',
      handle: 'chaise-inaya-gris',
      title: 'Chaise INAYA - Gris chenille',
      productType: 'Chaise',
      vendor: 'Decora Home',
      tags: ['chenille', 'métal', 'gris'],
      price: 99,
      compareAtPrice: 149,
      availableForSale: true,
      quantityAvailable: 96,
      image_url: 'https://cdn.shopify.com/s/files/1/0903/7578/2665/files/3_3f11d1af-8ce5-4d2d-a435-cd0a78eb92ee.png?v=1755791319',
      product_url: 'https://decorahome.fr/products/chaise-en-tissu-serge-chenille-pieds-metal-noir-gris-clair-moka-et-beige',
      description: 'Chaise en tissu chenille avec pieds métal noir',
      variants: [{
        id: 'variant-gris',
        title: 'Gris clair',
        price: 99,
        compareAtPrice: 149,
        availableForSale: true,
        quantityAvailable: 96,
        selectedOptions: [{ name: 'Couleur', value: 'Gris clair' }]
      }]
    }
  ];

  // --- Appel API IA ---
  const sendToAI = async (message: string): Promise<string> => {
    try {
      const res = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/chat`, {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          "Authorization": `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`
        },
        body: JSON.stringify({
          message: message
        }),
      });

      if (!res.ok) throw new Error("Erreur API");
      
      // Lecture en streaming pour réponse rapide
      const reader = res.body?.getReader();
      const decoder = new TextDecoder();
      let result = '';
      
      if (reader) {
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          result += decoder.decode(value);
        }
      }
      
      // Rechercher des produits si mention spécifique
      if (message.toLowerCase().includes('canapé')) {
        const decoraProducts = getDecoraProducts().filter(p => p.productType === 'Canapé');
        setProducts(decoraProducts);
        setShowProducts(true);
      } else if (message.toLowerCase().includes('table')) {
        const decoraProducts = getDecoraProducts().filter(p => p.productType === 'Table');
        setProducts(decoraProducts);
        setShowProducts(true);
      } else if (message.toLowerCase().includes('chaise')) {
        const decoraProducts = getDecoraProducts().filter(p => p.productType === 'Chaise');
        setProducts(decoraProducts);
        setShowProducts(true);
      }
      
      return result || "Comment puis-je vous aider ?";
    } catch (err) {
      console.error("❌ Erreur sendToAI:", err);
      return "Erreur de communication avec l'assistant IA.";
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
      // 🔥 Envoi au moteur IA
      const aiResponse = await sendToAI(messageText);

      // Ajout réponse IA
      setMessages(prev => [...prev, {
        id: (Date.now() + 1).toString(),
        content: aiResponse,
        isUser: false,
        timestamp: new Date(),
        products: products
      }]);

      speak(aiResponse);
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
        await sendToAI(`Analyse cette image: ${analysis}`);
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

  // --- Micro ---
  const handleMicClick = () => {
    if (isRecording) stopRecording();
    else startRecording();
  };

  // --- Volume ---
  const handleVolumeClick = () => {
    if (isSpeaking) stopSpeaking();
  };

  // --- Envoi auto quand Whisper transcrit ---
  useEffect(() => {
    if (transcript && transcript.trim() !== '' && !isTyping) {
      handleSendMessage(transcript);
    }
  }, [transcript, isTyping]);

  const handleSuggestionClick = (suggestion: string) => {
    handleSendMessage(suggestion);
  };

  const handleAddToCart = (productId: string, variantId: string) => {
    // Logique d'ajout au panier
    console.log('Ajout au panier:', productId, variantId);
  };

  return (
    <div className="flex h-screen bg-white">
      
      {/* 👈 Sidebar Robot - Design exact de la photo */}
      <div className="w-2/5 bg-slate-900/95 flex flex-col relative overflow-hidden sticky top-0 h-screen" style={{ width: '40%' }}>
        {/* Background effects */}
        <div className="absolute inset-0 opacity-30">
          <div className="absolute top-20 left-10 w-32 h-32 bg-cyan-400/20 rounded-full blur-2xl"></div>
          <div className="absolute bottom-20 right-10 w-40 h-40 bg-purple-400/20 rounded-full blur-2xl"></div>
        </div>

        {/* Header avec retour Admin */}
        <div className="relative z-10 p-4 border-b border-white/10 sticky top-0 bg-slate-900/95 backdrop-blur-xl">
          <button
            onClick={() => window.location.href = '/admin'}
            className="flex items-center gap-2 text-cyan-300 hover:text-cyan-200 transition-colors mb-4"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Admin</span>
          </button>
          
          {/* Logo OmnIA - Style exact de la photo */}
          <div className="flex items-center gap-3 mb-4">
            <div className="w-14 h-14 bg-gradient-to-br from-cyan-400 to-blue-500 rounded-2xl flex items-center justify-center relative shadow-2xl border-2 border-cyan-300/50">
              <div className="w-7 h-7 bg-white rounded-xl flex items-center justify-center">
                <div className="w-5 h-5 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-lg"></div>
              </div>
              <div className="absolute -top-1 -right-1 w-4 h-4 bg-green-400 rounded-full animate-bounce"></div>
            </div>
            <div>
              <h1 className="text-white font-bold text-lg">OmnIA</h1>
              <p className="text-cyan-300 text-xs">Commercial Mobilier IA</p>
            </div>
          </div>

          {/* Info magasin */}
          <div className="bg-white/10 backdrop-blur-xl rounded-xl p-3 border border-white/20">
            <div className="text-white font-bold text-sm">Decora Home</div>
            <div className="text-cyan-300 text-xs">668 produits actifs</div>
            <div className="text-cyan-400 text-xs">Plan Professional</div>
          </div>
        </div>

        {/* Contenu principal - Style exact de la photo */}
        <div className="relative z-10 flex-1 flex flex-col p-6 space-y-6">
          {/* Robot Avatar en haut */}
          <div className="relative mb-8">
            <div className="w-40 h-40 mx-auto bg-gradient-to-br from-cyan-400 via-blue-500 to-purple-600 rounded-3xl shadow-2xl relative overflow-hidden border-4 border-cyan-300/50">
              {/* Grands yeux ronds comme sur l'image */}
              <div className="absolute top-8 left-1/2 transform -translate-x-1/2 flex gap-4">
                <div className="w-16 h-16 bg-white rounded-full border-3 border-cyan-400 flex items-center justify-center shadow-xl">
                  <div className="w-8 h-8 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-full animate-pulse"></div>
                </div>
                <div className="w-16 h-16 bg-white rounded-full border-3 border-cyan-400 flex items-center justify-center shadow-xl">
                  <div className="w-8 h-8 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-full animate-pulse" style={{ animationDelay: '0.5s' }}></div>
                </div>
              </div>
              
              {/* Sourire */}
              <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2">
                <div className="w-16 h-8 bg-white rounded-full border-2 border-cyan-400 flex items-center justify-center shadow-lg">
                  <div className="w-12 h-4 bg-gradient-to-r from-cyan-500 to-blue-600 rounded-full"></div>
                </div>
              </div>
              
              {/* Corps du robot */}
              <div className="absolute bottom-2 left-1/2 transform -translate-x-1/2 w-16 h-8 bg-gradient-to-br from-slate-300 to-slate-400 rounded-xl border border-slate-400">
                <div className="absolute top-1 left-1/2 transform -translate-x-1/2 flex gap-1">
                  <div className="w-1 h-1 bg-green-400 rounded-full animate-pulse"></div>
                  <div className="w-1 h-1 bg-blue-400 rounded-full animate-pulse" style={{ animationDelay: '0.3s' }}></div>
                  <div className="w-1 h-1 bg-purple-400 rounded-full animate-pulse" style={{ animationDelay: '0.6s' }}></div>
                </div>
              </div>
              
              {/* Particules d'énergie */}
              <div className="absolute top-2 left-2 w-2 h-2 bg-cyan-400 rounded-full animate-bounce"></div>
              <div className="absolute top-4 right-3 w-1.5 h-1.5 bg-purple-400 rounded-full animate-bounce" style={{ animationDelay: '0.5s' }}></div>
              <div className="absolute bottom-4 left-3 w-2 h-2 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: '1s' }}></div>
              
              {/* Effet de brillance */}
              <div className="absolute inset-0 bg-gradient-to-br from-white/30 via-transparent to-transparent pointer-events-none rounded-3xl"></div>
            </div>
          </div>

          {/* Barre de progression cyan */}
          <div className="w-full h-2 bg-slate-700/50 rounded-full mb-4">
            <div className="w-full h-full bg-gradient-to-r from-cyan-400 to-purple-500 rounded-full"></div>
          </div>

          {/* Statut Robot */}
          <div className="text-center mb-6">
            <div className="text-white font-bold text-xl mb-3">Prêt à vous aider</div>
            <div className="flex items-center justify-center gap-6 text-sm">
              <div className="flex items-center gap-1">
                <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                <span className="text-green-300 font-semibold">95%</span>
              </div>
              <div className="flex items-center gap-1">
                <div className="w-1 h-3 bg-cyan-400 rounded-full"></div>
                <div className="w-1 h-2 bg-cyan-400 rounded-full"></div>
                <div className="w-1 h-4 bg-cyan-400 rounded-full"></div>
                <span className="text-cyan-300 font-semibold ml-2">Connecté</span>
              </div>
            </div>
          </div>

          {/* Boutons de contrôle - Grid 3x2 comme sur la photo */}
          <div className="grid grid-cols-3 gap-3 mb-3">
            {/* Première rangée */}
            <button
              onClick={handleMicClick}
              className={`w-16 h-16 rounded-2xl flex items-center justify-center transition-all duration-300 hover:scale-105 shadow-lg shadow-purple-500/40 ${
                isRecording
                  ? 'bg-purple-500 animate-pulse'
                  : 'bg-purple-500 hover:bg-purple-400'
              }`}
            >
              <Mic className="w-6 h-6 text-white" />
            </button>

            <button
              onClick={handleVolumeClick}
              className={`w-16 h-16 rounded-2xl flex items-center justify-center transition-all duration-300 hover:scale-105 shadow-lg shadow-green-500/40 ${
                isSpeaking
                  ? 'bg-green-500 animate-pulse'
                  : 'bg-green-500 hover:bg-green-400'
              }`}
            >
              <Volume2 className="w-6 h-6 text-white" />
            </button>

            <button
              onClick={() => fileInputRef.current?.click()}
              className="w-16 h-16 bg-pink-500 hover:bg-pink-400 shadow-lg shadow-pink-500/40 rounded-2xl flex items-center justify-center transition-all duration-300 hover:scale-105"
              title="Reconnaissance et détection humain"
            >
              <div className="relative">
                <Camera className="w-6 h-6 text-white" />
                <div className="absolute -top-1 -right-1 w-3 h-3 bg-green-400 rounded-full animate-pulse"></div>
              </div>
            </button>
          </div>

          {/* Deuxième rangée de boutons */}
          <div className="grid grid-cols-3 gap-3 mb-3">
            <button 
              onClick={() => setShowQR(!showQR)}
              className="w-16 h-16 bg-orange-500 hover:bg-orange-400 shadow-lg shadow-orange-500/40 rounded-2xl flex items-center justify-center transition-all duration-300 hover:scale-105"
            >
              <QrCode className="w-6 h-6 text-white" />
            </button>

            <button
              className="w-16 h-16 bg-orange-500 hover:bg-orange-400 shadow-lg shadow-orange-500/40 rounded-2xl flex items-center justify-center transition-all duration-300 hover:scale-105"
              title="Paramètres robot"
            >
              <Settings className="w-6 h-6 text-white" />
            </button>

            <button
              className="w-16 h-16 bg-green-500 hover:bg-green-400 shadow-lg shadow-green-500/40 rounded-2xl flex items-center justify-center transition-all duration-300 hover:scale-105"
            >
              <div className="w-6 h-6 bg-white rounded-full flex items-center justify-center">
                <div className="w-4 h-4 bg-green-500 rounded-full"></div>
              </div>
            </button>
          </div>

          {/* Troisième rangée de boutons */}
          <div className="grid grid-cols-3 gap-3 mb-3">
            <button className="w-16 h-16 bg-blue-500 hover:bg-blue-400 shadow-lg shadow-blue-500/40 rounded-2xl flex flex-col items-center justify-center transition-all duration-300 hover:scale-105">
              <div className="text-white text-xs font-bold mb-1">+</div>
              <span className="text-white text-xs">Bouger</span>
            </button>
            <button
              className="w-16 h-16 bg-purple-500 hover:bg-purple-400 shadow-lg shadow-purple-500/40 rounded-2xl flex flex-col items-center justify-center transition-all duration-300 hover:scale-105"
            >
              <Music className="w-5 h-5 text-white mb-1" />
              <span className="text-white text-xs">Danser</span>
            </button>

            <button className="w-16 h-16 bg-gray-600 hover:bg-gray-500 shadow-lg shadow-gray-500/40 rounded-2xl flex flex-col items-center justify-center transition-all duration-300 hover:scale-105">
              <div className="w-5 h-5 border-2 border-white rounded flex items-center justify-center mb-1">
                <div className="w-2 h-2 bg-white rounded-full"></div>
              </div>
              <span className="text-white text-xs">Veille</span>
            </button>
          </div>

        </div>
      </div>

      {/* 👉 Zone de chat principale avec background rose */}
      <div className="flex-1 flex flex-col" style={{ backgroundColor: 'rgb(236 72 153 / 0.2)' }}>
        {/* Header de conversation */}
        <div className="bg-gradient-to-r from-purple-600 via-pink-600 to-violet-600 border-b border-purple-500/50 p-6 sticky top-0 z-10 backdrop-blur-xl">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-3 h-3 bg-green-400 rounded-full animate-pulse"></div>
              <div>
                <h2 className="text-xl font-bold text-white">Conversation OmnIA</h2>
                <p className="text-gray-300">Robot IA à votre écoute</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <button 
                onClick={() => setShowQR(!showQR)}
                className="p-2 bg-purple-500/20 hover:bg-purple-500/30 rounded-xl transition-colors border border-purple-400/50"
                title="QR Code pour mobile"
              >
                <QrCode className="w-5 h-5 text-purple-300" />
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
        <div className="flex-1 overflow-y-auto p-6 space-y-6" style={{ backgroundColor: '#f8f8f8' }}>
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

        {/* Suggestions rapides - Style exact de la photo */}
        <div className="px-6 py-4" style={{ backgroundColor: '#f8f8f8' }}>
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

        {/* Zone de saisie - Style exact de la photo */}
        <div className="p-6 border-t border-slate-700 sticky bottom-0 z-10 bg-slate-900/80 backdrop-blur-xl">
          <div className="flex gap-3">
            <div className="flex-1 relative">
              <input
                type="text"
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSendMessage(inputMessage)}
                placeholder="Écrivez votre message..."
                className="w-full bg-slate-700 border border-slate-600 rounded-2xl px-6 py-4 text-white placeholder-slate-400 focus:outline-none focus:border-cyan-400 focus:ring-2 focus:ring-cyan-400/30"
              />
            </div>
            
            <button
              onClick={() => setShowQR(!showQR)}
              className="w-14 h-14 bg-purple-500 hover:bg-purple-600 rounded-2xl flex items-center justify-center transition-all hover:scale-105 shadow-xl shadow-purple-500/40"
              title="QR Code pour upload photo mobile"
            >
              <QrCode className="w-6 h-6 text-white" />
            </button>
            
            <button
              onClick={() => fileInputRef.current?.click()}
              disabled={isAnalyzingPhoto}
              className="relative group bg-gradient-to-br from-pink-500 to-pink-600 hover:from-pink-400 hover:to-pink-500 shadow-xl shadow-pink-500/40 hover:shadow-pink-500/60 w-14 h-14 rounded-2xl flex items-center justify-center transition-all duration-300 hover:scale-110 disabled:opacity-50"
              title="Analyser une photo"
            >
              {isAnalyzingPhoto ? (
                <Loader2 className="w-6 h-6 text-white animate-spin" />
              ) : (
                <Camera className="w-6 h-6 text-white" />
              )}
            </button>

            <button
              onClick={() => handleSendMessage(inputMessage)}
              disabled={!inputMessage.trim()}
              className="relative group bg-gradient-to-br from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 disabled:from-gray-600 disabled:to-gray-700 shadow-xl shadow-cyan-500/40 hover:shadow-cyan-500/60 w-14 h-14 rounded-2xl flex items-center justify-center transition-all duration-300 hover:scale-110 disabled:cursor-not-allowed disabled:scale-100"
              title="Envoyer le message"
            >
              <Send className="w-6 h-6 text-white" />
            </button>
          </div>
          
          {/* Modal QR Code */}
          {showQR && (
            <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
              <div className="bg-white/95 backdrop-blur-xl rounded-2xl p-6 max-w-md w-full border border-gray-200 shadow-2xl">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-xl font-bold text-gray-800">📱 Scanner pour envoyer photo</h3>
                  <button
                    onClick={() => setShowQR(false)}
                    className="text-gray-400 hover:text-gray-600 transition-colors"
                  >
                    <X className="w-6 h-6" />
                  </button>
                </div>
                <div className="text-center">
                  <div className="w-48 h-48 bg-white rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg border border-gray-200">
                    <img 
                      src={`https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(window.location.origin + '/upload')}`}
                      alt="QR Code"
                      className="w-44 h-44 rounded-xl"
                    />
                  </div>
                  <p className="text-gray-600 mb-4">Scannez pour envoyer une photo depuis votre mobile</p>
                  <div className="bg-blue-50 border border-blue-200 rounded-xl p-3">
                    <p className="text-blue-700 text-sm">
                      📸 Scannez → Allez sur /upload → Envoyez photo → Retour auto au chat !
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}
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
    </div>
  );
};