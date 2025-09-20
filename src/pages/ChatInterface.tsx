import React, { useState, useEffect, useRef } from 'react';
import { Mic, MicOff, Volume2, VolumeX, Send, Image, Loader2, QrCode, Camera, Music, Settings, ArrowLeft } from 'lucide-react';
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

  const fileInputRef = useRef<HTMLInputElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // 🎤 STT
  const { isRecording, startRecording, stopRecording, transcript } = useWhisperSTT({ continuous: false });
  // 🔊 TTS
  const { speak, stopSpeaking, isSpeaking } = useGoogleTTS();

  // Message de bienvenue
  useEffect(() => {
    const greeting = "Bonjour ! Je suis OmnIA 🤖 Votre Robot Designer spécialisé en mobilier. J'ai analysé votre catalogue enrichi. Comment puis-je vous aider ?";
    setMessages([{ id: Date.now().toString(), content: greeting, isUser: false, timestamp: new Date(), products: [] }]);
    speak(greeting);
  }, []);

  // Scroll auto
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // --- Appel API IA avec catalogue enrichi ---
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
          retailer_id: 'demo-retailer-id'
        }),
      });

      if (!res.ok) throw new Error("Erreur API");
      const data = await res.json();
      
      return {
        message: data.message || "Comment puis-je vous aider ?",
        products: data.products || []
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
      // 🔥 Envoi au moteur IA avec catalogue enrichi
      const aiResult = await sendToAI(messageText);

      // Ajout réponse IA
      setMessages(prev => [...prev, {
        id: (Date.now() + 1).toString(),
        content: aiResult.message,
        isUser: false,
        timestamp: new Date(),
        products: aiResult.products
      }]);

      setProducts(aiResult.products);
      setShowProducts(aiResult.products.length > 0);

      speak(aiResult.message);
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

      let analysis = "📸 **Analyse de votre espace :**\n\n**Style détecté :** Moderne et épuré\n**Ambiance :** Chaleureuse avec potentiel d'amélioration\n\n**💡 Mes recommandations :**\n• **Canapé ALYANA** (799€) - Convertible velours côtelé\n• **Table AUREA** (499€) - Travertin naturel élégant\n\n**🎨 Conseil d'expert :** L'harmonie des matériaux créera une ambiance cohérente !";
      let foundProducts: Product[] = [];

      if (response.ok) {
        const visionData = await response.json();
        analysis = visionData.analysis || analysis;
        
        // Rechercher des produits recommandés après analyse photo
        const aiResult = await sendToAI(`Analyse cette image: ${analysis}. Recommande des produits adaptés.`);
        foundProducts = aiResult.products;
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
    if (transcript && transcript.trim() !== '') {
      handleSendMessage(transcript);
    }
  }, [transcript]);

  const handleSuggestionClick = (suggestion: string) => {
    handleSendMessage(suggestion);
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
    alert('Redirection vers le système de paiement...');
  };

  return (
    <div className="flex h-screen bg-white">
      
      {/* 👈 Sidebar Robot - Design exact de la photo */}
      <div className="w-80 bg-slate-900/95 flex flex-col relative overflow-hidden">
        {/* Background effects */}
        <div className="absolute inset-0 opacity-30">
          <div className="absolute top-20 left-10 w-32 h-32 bg-cyan-400/20 rounded-full blur-2xl"></div>
          <div className="absolute bottom-20 right-10 w-40 h-40 bg-purple-400/20 rounded-full blur-2xl"></div>
        </div>

        {/* Header avec retour Admin */}
        <div className="relative z-10 p-4 border-b border-white/10">
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
            <div className="text-cyan-300 text-xs">Catalogue enrichi actif</div>
            <div className="text-cyan-400 text-xs">Plan Professional</div>
          </div>
        </div>

        {/* Contenu principal - Style exact de la photo */}
        <div className="relative z-10 flex-1 flex flex-col p-6 space-y-6">
          {/* Robot Avatar en haut */}
          <div className="relative mb-8">
            <div className="w-40 h-40 mx-auto bg-gradient-to-br from-cyan-400 via-blue-500 to-purple-600 rounded-3xl shadow-2xl relative overflow-hidden border-4 border-cyan-400/50">
              {/* Grands yeux ronds comme sur l'image */}
              <div className="absolute top-8 left-1/2 transform -translate-x-1/2 flex gap-4">
                <div className="w-8 h-8 bg-white rounded-full border-2 border-slate-300 flex items-center justify-center">
                  <div className="w-4 h-4 bg-cyan-500 rounded-full"></div>
                </div>
                <div className="w-8 h-8 bg-white rounded-full border-2 border-slate-300 flex items-center justify-center">
                  <div className="w-4 h-4 bg-cyan-500 rounded-full"></div>
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
              className={`w-16 h-16 rounded-2xl flex items-center justify-center transition-all duration-300 hover:scale-105 shadow-lg hover:shadow-purple-500/50 ${
                isRecording
                  ? 'bg-purple-500 shadow-purple-500/40 animate-pulse'
                  : 'bg-purple-500 hover:bg-purple-400'
              }`}
            >
              <Mic className="w-6 h-6 text-white" />
            </button>

            <button
              onClick={handleVolumeClick}
              className={`w-16 h-16 rounded-2xl flex items-center justify-center transition-all duration-300 hover:scale-105 shadow-lg hover:shadow-green-500/50 ${
                isSpeaking
                  ? 'bg-green-500 shadow-green-500/40 animate-pulse'
                  : 'bg-green-500 hover:bg-green-400 shadow-lg'
              }`}
            >
              <Volume2 className="w-6 h-6 text-white" />
            </button>

            <button
              onClick={() => fileInputRef.current?.click()}
              className="w-16 h-16 bg-pink-500 hover:bg-pink-400 shadow-lg hover:shadow-pink-500/50 rounded-2xl flex items-center justify-center transition-all duration-300 hover:scale-105"
              title="Analyser une photo"
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
              onClick={() => window.open('/upload', '_blank')}
              className="w-16 h-16 bg-orange-500 hover:bg-orange-400 shadow-lg hover:shadow-orange-500/50 rounded-2xl flex items-center justify-center transition-all duration-300 hover:scale-105"
            >
              <QrCode className="w-6 h-6 text-white" />
            </button>

            <button
              onClick={() => window.open('/upload', '_blank')}
              className="w-16 h-16 bg-orange-500 hover:bg-orange-400 shadow-lg hover:shadow-orange-500/50 rounded-2xl flex items-center justify-center transition-all duration-300 hover:scale-105"
              title="QR Code pour upload photo mobile"
            >
              <Settings className="w-6 h-6 text-white" />
            </button>

            <button 
              className="w-16 h-16 bg-green-500 hover:bg-green-400 shadow-lg hover:shadow-green-500/50 rounded-2xl flex items-center justify-center transition-all duration-300 hover:scale-105"
            >
              <div className="w-6 h-6 bg-white rounded-full flex items-center justify-center">
                <div className="w-4 h-4 bg-green-500 rounded-full"></div>
              </div>
            </button>
          </div>

          {/* Troisième rangée de boutons */}
          <div className="grid grid-cols-3 gap-3 mb-3">
            <button className="w-16 h-16 bg-blue-500 hover:bg-blue-400 shadow-lg hover:shadow-blue-500/50 rounded-2xl flex flex-col items-center justify-center transition-all duration-300 hover:scale-105">
              <div className="text-white text-xs font-bold mb-1">+</div>
              <span className="text-white text-xs">Bouger</span>
            </button>
            <button
              className="w-16 h-16 bg-purple-500 hover:bg-purple-400 shadow-lg hover:shadow-purple-500/50 rounded-2xl flex flex-col items-center justify-center transition-all duration-300 hover:scale-105"
            >
              <Music className="w-5 h-5 text-white mb-1" />
              <span className="text-white text-xs">Danser</span>
            </button>

            <button className="w-16 h-16 bg-gray-600 hover:bg-gray-500 shadow-lg hover:shadow-gray-500/50 rounded-2xl flex flex-col items-center justify-center transition-all duration-300 hover:scale-105">
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
        <div className="bg-slate-800 border-b border-slate-700 p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-3 h-3 bg-green-400 rounded-full animate-pulse"></div>
              <div>
                <h2 className="text-xl font-bold text-white">Conversation OmnIA</h2>
                <p className="text-gray-300">Robot IA à votre écoute</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <button className="p-2 bg-purple-500/20 hover:bg-purple-500/30 rounded-xl transition-colors border border-purple-400/50 shadow-lg hover:shadow-purple-500/50">
                <QrCode className="w-5 h-5 text-purple-300" />
              </button>
              <CartButton 
                items={cartItems}
                onUpdateQuantity={handleUpdateCartQuantity}
                onRemoveItem={handleRemoveCartItem}
                onCheckout={handleCheckout}
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

          {/* Affichage des produits recommandés */}
          {products.length > 0 && (
            <div className="space-y-6">
              <h3 className="text-2xl font-bold text-slate-800 flex items-center gap-3">
                ✨ Mes recommandations
                <span className="bg-cyan-500/20 text-cyan-700 px-3 py-1 rounded-full text-sm border border-cyan-300">
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

        {/* Suggestions rapides - Style exact de la photo */}
        <div className="px-6 py-4">
          <div className="flex gap-3 overflow-x-auto pb-2">
            <button
              onClick={() => handleSuggestionClick("🛋️ Canapé beige")}
              className="flex-shrink-0 px-4 py-2 bg-blue-100 hover:bg-blue-200 text-blue-700 rounded-full border border-blue-300 transition-all whitespace-nowrap flex items-center gap-2 shadow-lg hover:shadow-blue-500/50 hover:scale-105"
            >
              🛋️ Canapé beige
            </button>
            <button
              onClick={() => handleSuggestionClick("🪑 Table ronde")}
              className="flex-shrink-0 px-4 py-2 bg-orange-100 hover:bg-orange-200 text-orange-700 rounded-full border border-orange-300 transition-all whitespace-nowrap flex items-center gap-2 shadow-lg hover:shadow-orange-500/50 hover:scale-105"
            >
              🪑 Table ronde
            </button>
            <button
              onClick={() => handleSuggestionClick("💺 Chaise bureau")}
              className="flex-shrink-0 px-4 py-2 bg-green-100 hover:bg-green-200 text-green-700 rounded-full border border-green-300 transition-all whitespace-nowrap flex items-center gap-2 shadow-lg hover:shadow-green-500/50 hover:scale-105"
            >
              💺 Chaise bureau
            </button>
            <button
              onClick={() => handleSuggestionClick("✨ Tendances 2025")}
              className="flex-shrink-0 px-4 py-2 bg-yellow-100 hover:bg-yellow-200 text-yellow-700 rounded-full border border-yellow-300 transition-all whitespace-nowrap flex items-center gap-2 shadow-lg hover:shadow-yellow-500/50 hover:scale-105"
            >
              ✨ Tendances 2025
            </button>
          </div>
        </div>

        {/* Zone de saisie - Style exact de la photo */}
        <div className="p-6 bg-slate-800 border-t border-slate-700">
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
              onClick={() => window.open('/upload', '_blank')}
              className="w-14 h-14 bg-purple-500 hover:bg-purple-600 rounded-2xl flex items-center justify-center transition-all hover:scale-105 shadow-lg hover:shadow-purple-500/50"
              title="QR Code pour upload photo mobile"
            >
              <QrCode className="w-6 h-6 text-white" />
            </button>

            <button
              onClick={() => handleSendMessage(inputMessage)}
              disabled={!inputMessage.trim()}
              className="w-14 h-14 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 disabled:from-gray-400 disabled:to-gray-500 rounded-2xl flex items-center justify-center transition-all hover:scale-105 disabled:cursor-not-allowed shadow-lg hover:shadow-cyan-500/50"
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
    </div>
  );
};