import React, { useState, useEffect, useRef } from 'react';
import { 
  Mic, MicOff, Volume2, VolumeX, Camera, Settings, Power, 
  Send, ArrowLeft, User, Loader2, Upload, QrCode, ShoppingCart,
  Sparkles, Zap, Eye, Bot, Play, Pause, Move, Music, Wifi, Battery, Signal, Image
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
  battery: number;
  mood: 'happy' | 'thinking' | 'speaking' | 'dancing' | 'moving';
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
  const [showQR, setShowQR] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Robot state
  const [robotState, setRobotState] = useState<RobotState>({
    position: { x: 0, y: 0, rotation: 0 },
    isMoving: false,
    isDancing: false,
    battery: 95,
    mood: 'happy',
    currentTask: 'Prêt à vous aider'
  });

  // Hooks voix & texte
  const { 
    isRecording, isProcessing, transcript, error: sttError,
    startRecording, stopRecording, reset: resetSTT, isSupported: sttSupported
  } = useWhisperSTT({ continuous: false });

  const { speak, stopSpeaking, isSpeaking } = useGoogleTTS();

  // Premier message d’accueil
  useEffect(() => {
    const greeting = "Bonjour 👋 Je suis OmnIA 🤖, conseiller mobilier. Que cherchez-vous aujourd'hui ?";
    const greetingMessage: ChatMessageType = {
      id: Date.now().toString(),
      content: greeting,
      isUser: false,
      timestamp: new Date(),
      products: []
    };
    setMessages([greetingMessage]);
    speak(greeting);
  }, []);

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

  /* ----------------- Envoi message ----------------- */
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
    setRobotState(prev => ({ ...prev, mood: 'thinking', currentTask: 'Analyse en cours...' }));

    try {
      // 🔌 Appel à la nouvelle fonction Chat Smart
      const res = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/chatgpt-smart-query`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          message: messageText,
          retailer_id: 'demo-retailer-id',
          session_id: `session-${Date.now()}`
        }),
      });

      let aiResponse = "Petit souci technique 🤖";
      let foundProducts: Product[] = [];

      if (res.ok) {
        const data = await res.json();
        aiResponse = data.message;
        foundProducts = data.products || [];

        console.log('🤖 SmartQuery:', {
          intent: data.intent_detected,
          produits: foundProducts.length,
          temps: data.thinking_time
        });

        // fallback si aucun produit trouvé
        if (foundProducts.length === 0 && messageText.toLowerCase().includes('canapé')) {
          foundProducts = getFallbackProducts().filter(p => p.productType === 'Canapé').slice(0, 2);
          aiResponse = "🛋️ Voici quelques canapés que je peux vous proposer :";
        }
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
      if (foundProducts.length > 0) handleRobotMove();
      speak(aiResponse);
      setCurrentSpeakingMessage(aiResponse);

    } catch (error) {
      console.error('❌ Erreur SmartQuery:', error);
      const errorMessage: ChatMessageType = {
        id: (Date.now() + 1).toString(),
        content: "Oups ! Un souci technique. Pouvez-vous reformuler ? 🤖",
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

  /* ----------------- Robot actions ----------------- */
  const handleMicClick = () => isRecording ? stopRecording() : startRecording();
  const handleVolumeClick = () => stopSpeaking();

  const handleRobotMove = () => {
    setRobotState(prev => ({ ...prev, isMoving: true, mood: 'moving', currentTask: 'Se déplace...' }));
    setTimeout(() => setRobotState(prev => ({ ...prev, isMoving: false, mood: 'happy', currentTask: 'Produits prêts' })), 1500);
  };
  const handleRobotDance = () => {
    setRobotState(prev => ({ ...prev, isDancing: true, mood: 'dancing', currentTask: 'Danse 🎵' }));
    setTimeout(() => setRobotState(prev => ({ ...prev, isDancing: false, mood: 'happy', currentTask: 'Prêt à vous aider' })), 3000);
  };

  /* ----------------- Panier ----------------- */
  const handleAddToCart = (productId: string, variantId: string) => {
    const product = products.find(p => p.id === productId);
    const variant = product?.variants.find(v => v.id === variantId);
    if (!product || !variant) return;

    const existing = cartItems.find(item => item.variantId === variantId);
    if (existing) {
      setCartItems(prev => prev.map(i => i.variantId === variantId ? { ...i, quantity: i.quantity + 1 } : i));
    } else {
      setCartItems(prev => [...prev, {
        id: Date.now().toString(),
        productId, variantId,
        title: product.title,
        price: variant.price,
        quantity: 1,
        image_url: product.image_url,
        product_url: product.product_url
      }]);
    }

    setMessages(prev => [...prev, {
      id: Date.now().toString(),
      content: `✅ ${product.title} ajouté au panier !`,
      isUser: false,
      timestamp: new Date(),
      products: []
    }]);
    handleRobotDance();
  };

  const handleCheckout = () => {
    setMessages(prev => [...prev, {
      id: Date.now().toString(),
      content: `🛒 Commande validée : ${cartItems.length} article(s) pour ${cartItems.reduce((s, i) => s + i.price * i.quantity, 0)}€.`,
      isUser: false,
      timestamp: new Date(),
      products: []
    }]);
    setTimeout(() => alert("Redirection paiement..."), 1500);
  };

  /* ----------------- Fallback ----------------- */
  const getFallbackProducts = (): Product[] => [
    {
      id: 'decora-canape-alyana',
      title: 'Canapé ALYANA beige convertible',
      productType: 'Canapé',
      vendor: 'Decora Home',
      price: 799,
      compareAtPrice: 1399,
      availableForSale: true,
      quantityAvailable: 100,
      image_url: 'https://decorahome.fr/images/canape.png',
      product_url: 'https://decorahome.fr/products/canape-alyana',
      description: 'Canapé convertible 4 places en velours beige',
      variants: [{ id: 'alyana-beige', title: 'Beige', price: 799, availableForSale: true, quantityAvailable: 100, selectedOptions: [] }]
    }
  ];

  /* ----------------- UI ----------------- */
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-purple-900 flex">
      {/* Sidebar robot */}
      <div className="hidden lg:flex w-96 bg-slate-800/95 border-r border-slate-700/50 flex-col relative">
        <div className="p-6">
          <button onClick={() => window.location.href = '/admin'} className="text-cyan-400">← Admin</button>
          <div className="mt-6 flex items-center gap-4">
            <div className="w-14 h-14 bg-gradient-to-br from-cyan-500 to-purple-600 rounded-2xl flex items-center justify-center">
              <Bot className="w-8 h-8 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-white">OmnIA</h1>
              <p className="text-cyan-300">Conseiller mobilier IA</p>
            </div>
          </div>
        </div>
        <div className="flex-1 flex flex-col items-center justify-center">
          <RobotAvatar mood={robotState.mood} isListening={isRecording} isSpeaking={isSpeaking} size="xl" />
          <p className="mt-4 text-white">{robotState.currentTask}</p>
        </div>
      </div>

      {/* Main Chat */}
      <div className="flex-1 flex flex-col">
        <div className="flex-1 overflow-y-auto p-6">
          {messages.map(m => (
            <ChatMessage key={m.id} message={m} onAddToCart={handleAddToCart} onSpeak={speak} isPlaying={currentSpeakingMessage === m.content} />
          ))}
          {isTyping && <p className="text-cyan-300">OmnIA réfléchit...</p>}
          {products.length > 0 && (
            <div className="mt-6">
              <h3 className="text-xl font-bold text-white flex items-center gap-2">
                <Sparkles className="w-6 h-6 text-cyan-400" /> Recommandations
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-4">
                {products.map(p => <ProductCard key={p.id} product={p} onAddToCart={handleAddToCart} />)}
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>
        {/* Input */}
        <div className="p-4 bg-slate-800 border-t border-slate-700 flex gap-2">
          <input
            ref={inputRef}
            type="text"
            value={inputMessage}
            onChange={e => setInputMessage(e.target.value)}
            onKeyPress={e => e.key === 'Enter' && handleSendMessage(inputMessage)}
            placeholder="Écrivez votre message..."
            className="flex-1 bg-slate-700/50 border border-slate-600 rounded-xl px-4 py-2 text-white"
          />
          <button onClick={() => handleSendMessage(inputMessage)} disabled={!inputMessage.trim()} className="bg-cyan-600 px-4 py-2 rounded-xl text-white">
            <Send className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Panier */}
      <CartButton items={cartItems} onUpdateQuantity={() => {}} onRemoveItem={() => {}} onCheckout={handleCheckout} />
    </div>
  );
};
