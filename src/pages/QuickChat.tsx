import React, { useState, useEffect, useRef } from 'react';
import { 
  Send, Bot, User, Mic, MicOff, Volume2, VolumeX, 
  Camera, QrCode, ShoppingCart, Star, Eye, ExternalLink,
  Palette, Ruler, Package, Tag, ArrowLeft, Sparkles
} from 'lucide-react';
import { useWhisperSTT } from '../hooks/useWhisperSTT';
import { useGoogleTTS } from '../hooks/useGoogleTTS';

interface ChatMessage {
  id: string;
  content: string;
  isUser: boolean;
  timestamp: Date;
  products?: EnrichedProduct[];
}

interface EnrichedProduct {
  id: string;
  handle: string;
  title: string;
  description: string;
  price: number;
  compare_at_price?: number;
  category: string;
  subcategory: string;
  color: string;
  material: string;
  fabric: string;
  style: string;
  dimensions: string;
  room: string;
  image_url: string;
  product_url: string;
  stock_qty: number;
  tags: string[];
  seo_title: string;
  seo_description: string;
  brand: string;
  confidence_score: number;
  variants?: ProductVariant[];
}

interface ProductVariant {
  id: string;
  title: string;
  color: string;
  price: number;
  compare_at_price?: number;
  image_url: string;
  stock_qty: number;
}

export const QuickChat: React.FC = () => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [selectedPhoto, setSelectedPhoto] = useState<File | null>(null);
  const [isAnalyzingPhoto, setIsAnalyzingPhoto] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Voice capabilities
  const { isRecording, startRecording, stopRecording, transcript } = useWhisperSTT({ continuous: false });
  const { speak, stopSpeaking, isSpeaking } = useGoogleTTS();

  useEffect(() => {
    // Message de bienvenue intelligent
    const welcomeMessage: ChatMessage = {
      id: 'welcome',
      content: `Bonjour ! Je suis OmnIA 🤖 votre conseiller déco intelligent.

J'ai analysé notre catalogue enrichi avec **Smart AI** et je peux vous aider à :
• 🛋️ Trouver le mobilier parfait selon votre style
• 🎨 Analyser vos photos d'intérieur avec **OpenAI Vision**
• 📏 Proposer des dimensions et couleurs adaptées
• 💡 Créer des harmonies déco personnalisées

**Dites-moi :** Quel projet déco vous inspire ? Quelle pièce souhaitez-vous transformer ?`,
      isUser: false,
      timestamp: new Date()
    };
    
    setMessages([welcomeMessage]);
    speak("Bonjour ! Je suis OmnIA, votre conseiller déco intelligent. Quel projet vous inspire ?");
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  useEffect(() => {
    if (transcript && transcript.trim()) {
      handleSendMessage(transcript);
    }
  }, [transcript]);

  const handleSendMessage = async (messageText: string) => {
    if (!messageText.trim()) return;

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      content: messageText,
      isUser: true,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputMessage('');
    setIsTyping(true);

    try {
      // Appel à l'API chat intelligent avec DeepSeek + OpenAI Vision
      const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
      const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
      
      if (!supabaseUrl || !supabaseKey) {
        throw new Error('Configuration Supabase manquante');
      }

      const response = await fetch(`${supabaseUrl}/functions/v1/intelligent-quickchat`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${supabaseKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: messageText,
          conversation_history: messages.slice(-3).map(m => ({
            role: m.isUser ? 'user' : 'assistant',
            content: m.content
          })),
          photo_context: selectedPhoto ? await fileToBase64(selectedPhoto) : null
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('❌ Erreur API Response:', response.status, errorText);
        throw new Error(`Erreur API: ${response.status}`);
      }

      try {
        const data = await response.json();
        
        const botMessage: ChatMessage = {
          id: (Date.now() + 1).toString(),
          content: data.message,
          isUser: false,
          timestamp: new Date(),
          products: data.products || []
        };

        setMessages(prev => [...prev, botMessage]);
        speak(data.message);
      } catch (parseError) {
        console.error('❌ Erreur parsing JSON:', parseError);
        throw new Error('Réponse API invalide');
      }
    } catch (error) {
      console.error('❌ Erreur chat complète:', error);
      
      const errorMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        content: `Désolé, problème de connexion 🤖 ${error instanceof Error ? error.message : 'Erreur inconnue'}. Pouvez-vous réessayer ?`,
        isUser: false,
        timestamp: new Date()
      };
      
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsTyping(false);
    }
  };

  const handlePhotoUpload = async (file: File) => {
    if (!file.type.startsWith('image/')) return;
    
    setSelectedPhoto(file);
    setIsAnalyzingPhoto(true);

    try {
      const base64 = await fileToBase64(file);
      
      const response = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/gpt-vision-analyzer`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          image_base64: base64,
          analysis_type: 'interior_design'
        }),
      });

      if (response.ok) {
        const data = await response.json();
        
        const photoMessage: ChatMessage = {
          id: Date.now().toString(),
          content: data.analysis,
          isUser: false,
          timestamp: new Date(),
          products: data.recommended_products || []
        };

        setMessages(prev => [...prev, photoMessage]);
        speak(data.analysis);
      }
    } catch (error) {
      console.error('❌ Erreur analyse photo:', error);
    } finally {
      setIsAnalyzingPhoto(false);
      setSelectedPhoto(null);
    }
  };

  const fileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve((reader.result as string).split(',')[1]);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
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
    }
  };

  const generateQRCode = (url: string) => {
    return `https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${encodeURIComponent(url)}`;
  };

  const handleProductClick = (product: EnrichedProduct) => {
    // Ouvrir la fiche produit dans un nouvel onglet
    window.open(product.product_url, '_blank');
  };

  const handleAddToCart = (product: EnrichedProduct, variant?: any) => {
    const selectedVariant = variant || product.variants?.[0];
    const cartMessage = `✅ **${product.title}** ${selectedVariant ? `(${selectedVariant.color})` : ''} ajouté au panier ! Autre chose vous intéresse ?`;
    
    // Ajouter message de confirmation
    const confirmMessage: ChatMessage = {
      id: (Date.now() + Math.random()).toString(),
      content: cartMessage,
      isUser: false,
      timestamp: new Date()
    };
    
    setMessages(prev => [...prev, confirmMessage]);
    speak(cartMessage);
  };
  const renderProductCard = (product: EnrichedProduct) => (
    <div key={product.id} className="bg-white rounded-2xl p-4 shadow-lg border border-gray-200 hover:shadow-xl transition-all hover:scale-[1.02] group">
      <div className="flex gap-4">
        {/* Image principale */}
        <div className="w-24 h-24 rounded-xl overflow-hidden bg-gray-100 flex-shrink-0 shadow-md cursor-pointer" onClick={() => handleProductClick(product)}>
          <img 
            src={product.image_url} 
            alt={product.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform"
            onError={(e) => {
              const target = e.target as HTMLImageElement;
              target.src = 'https://images.pexels.com/photos/1350789/pexels-photo-1350789.jpeg';
            }}
          />
        </div>

        <div className="flex-1 min-w-0">
          <h3 className="font-bold text-gray-800 text-base mb-1 line-clamp-2 cursor-pointer hover:text-blue-600" onClick={() => handleProductClick(product)}>
            {product.title}
          </h3>
          <p className="text-blue-600 text-xs font-medium mb-2">{product.brand} • {product.category}</p>
          
          {/* Prix et promotion */}
          <div className="flex items-center gap-2 mb-3">
            <span className="text-xl font-bold text-green-600">{product.price}€</span>
            {product.compare_at_price && product.compare_at_price > product.price && (
              <>
                <span className="text-sm text-gray-500 line-through">{product.compare_at_price}€</span>
                <span className="bg-red-100 text-red-700 px-2 py-1 rounded-full text-xs font-bold animate-pulse">
                  -{Math.round(((product.compare_at_price - product.price) / product.compare_at_price) * 100)}%
                </span>
              </>
            )}
          </div>

          {/* Attributs Smart AI */}
          <div className="flex flex-wrap gap-1 mb-3">
            {product.color && (
              <span className="bg-purple-100 text-purple-700 px-2 py-1 rounded-full text-xs flex items-center gap-1 font-medium">
                <Palette className="w-2 h-2" />
                {product.color}
              </span>
            )}
            {product.material && (
              <span className="bg-orange-100 text-orange-700 px-2 py-1 rounded-full text-xs flex items-center gap-1 font-medium">
                <Tag className="w-2 h-2" />
                {product.material}
              </span>
            )}
            {product.dimensions && (
              <span className="bg-blue-100 text-blue-700 px-2 py-1 rounded-full text-xs flex items-center gap-1 font-medium">
                <Ruler className="w-2 h-2" />
                {product.dimensions}
              </span>
            )}
            {product.style && (
              <span className="bg-green-100 text-green-700 px-2 py-1 rounded-full text-xs flex items-center gap-1 font-medium">
                <Sparkles className="w-2 h-2" />
                {product.style}
              </span>
            )}
            {product.room && (
              <span className="bg-cyan-100 text-cyan-700 px-2 py-1 rounded-full text-xs flex items-center gap-1 font-medium">
                🏠 {product.room}
              </span>
            )}
          </div>

          {/* Variantes de couleur si disponibles */}
          {product.variants && product.variants.length > 1 && (
            <div className="mb-3">
              <p className="text-xs text-gray-600 mb-1 font-medium">
                {product.variants.length} variante{product.variants.length > 1 ? 's' : ''} disponible{product.variants.length > 1 ? 's' : ''} :
              </p>
              <div className="flex gap-1">
                {product.variants.slice(0, 4).map((variant, index) => (
                  <div key={index} className="relative group">
                    <div className="w-8 h-8 rounded-lg overflow-hidden border-2 border-gray-200 hover:border-blue-400 cursor-pointer transition-all hover:scale-110 shadow-sm">
                      <img 
                        src={variant.image_url} 
                        alt={variant.color}
                        className="w-full h-full object-cover"
                        title={`${variant.color} - ${variant.price}€`}
                        onError={(e) => {
                          const target = e.target as HTMLImageElement;
                          target.src = 'https://images.pexels.com/photos/1350789/pexels-photo-1350789.jpeg';
                        }}
                      />
                    </div>
                    <div className="absolute -bottom-8 left-1/2 transform -translate-x-1/2 bg-black text-white px-2 py-1 rounded-lg text-xs opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-10 shadow-lg">
                      {variant.color} - {variant.price}€
                      <div className="text-xs text-gray-300">{variant.stock_qty} stock</div>
                    </div>
                  </div>
                ))}
                {product.variants.length > 4 && (
                  <div className="w-8 h-8 rounded-lg bg-gray-100 border-2 border-gray-200 flex items-center justify-center text-xs text-gray-600 font-medium">
                    +{product.variants.length - 4}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-2">
            <button 
              onClick={() => handleProductClick(product)}
              className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-2 px-3 rounded-xl text-xs font-semibold flex items-center justify-center gap-1 transition-all hover:scale-105"
            >
              <Eye className="w-3 h-3" />
              Voir
            </button>
            <button 
              onClick={() => handleAddToCart(product)}
              className="flex-1 bg-green-600 hover:bg-green-700 text-white py-2 px-3 rounded-xl text-xs font-semibold flex items-center justify-center gap-1 transition-all hover:scale-105"
            >
              <ShoppingCart className="w-3 h-3" />
              Panier
            </button>
            <button 
              onClick={() => window.open(generateQRCode(product.product_url), '_blank')}
              className="p-2 bg-purple-100 hover:bg-purple-200 text-purple-700 rounded-xl transition-all hover:scale-105"
              title="QR Code"
            >
              <QrCode className="w-3 h-3" />
            </button>
            <a
              href={product.product_url}
              target="_blank"
              rel="noopener noreferrer"
              className="p-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl transition-all hover:scale-105"
              title="Voir sur le site"
            >
              <ExternalLink className="w-3 h-3" />
            </a>
          </div>
        </div>
      </div>

      {/* Confiance IA */}
      <div className="mt-3 pt-3 border-t border-gray-100 flex items-center justify-between text-xs">
        <div className="flex items-center gap-2">
          <Sparkles className="w-3 h-3 text-purple-500" />
          <span className="text-purple-600 font-semibold">Smart AI: {product.confidence_score}%</span>
        </div>
        <div className="flex items-center gap-2">
          <Package className="w-3 h-3 text-green-500" />
          <span className="text-green-600 font-semibold">{product.stock_qty} en stock</span>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-purple-900">
      {/* Header */}
      <div className="bg-black/20 backdrop-blur-xl border-b border-white/10 p-4">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              onClick={() => window.location.href = '/admin'}
              className="flex items-center gap-2 text-cyan-400 hover:text-cyan-300 transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              Admin
            </button>
            <div className="w-10 h-10 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-xl flex items-center justify-center">
              <Bot className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-white font-bold">OmnIA QuickChat</h1>
              <p className="text-cyan-300 text-sm">Chat intelligent avec Smart AI</p>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <div className="bg-green-500/20 text-green-300 px-3 py-1 rounded-full text-sm flex items-center gap-1">
              <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
              Smart AI actif
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto p-4 h-[calc(100vh-80px)] flex flex-col">
        {/* Zone des messages */}
        <div className="flex-1 overflow-y-auto space-y-6 mb-6">
          {messages.map((message) => (
            <div key={message.id} className={`flex gap-4 ${message.isUser ? 'justify-end' : 'justify-start'}`}>
              {!message.isUser && (
                <div className="w-10 h-10 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-full flex items-center justify-center flex-shrink-0">
                  <Bot className="w-5 h-5 text-white" />
                </div>
              )}
              
              <div className={`max-w-[70%] ${message.isUser ? 'order-first' : ''}`}>
                <div className={`rounded-2xl p-4 ${
                  message.isUser
                    ? 'bg-gradient-to-r from-blue-500 to-purple-600 text-white'
                    : 'bg-white text-gray-800 shadow-lg'
                }`}>
                  <div className="whitespace-pre-wrap">{message.content}</div>
                  
                  {!message.isUser && (
                    <button
                      onClick={() => speak(message.content)}
                      className="mt-2 inline-flex items-center gap-1 px-3 py-1 bg-blue-100 text-blue-700 rounded-lg text-xs hover:bg-blue-200 transition-colors"
                    >
                      <Volume2 className="w-3 h-3" />
                      Écouter
                    </button>
                  )}
                </div>
                
                {/* Affichage des produits enrichis */}
                {message.products && message.products.length > 0 && (
                  <div className="mt-6 space-y-6">
                    <h3 className="text-white font-bold text-xl flex items-center gap-3">
                      <Sparkles className="w-5 h-5 text-cyan-400" />
                      Mes recommandations Smart AI
                      <span className="bg-cyan-500/20 text-cyan-300 px-3 py-1 rounded-full text-base font-semibold">
                        {message.products.length} produit{message.products.length > 1 ? 's' : ''}
                      </span>
                    </h3>
                    <div className="grid gap-6">
                      {message.products.map(renderProductCard)}
                    </div>
                  </div>
                )}
              </div>

              {message.isUser && (
                <div className="w-10 h-10 bg-gradient-to-br from-gray-600 to-gray-800 rounded-full flex items-center justify-center flex-shrink-0">
                  <User className="w-5 h-5 text-white" />
                </div>
              )}
            </div>
          ))}
          
          {isTyping && (
            <div className="flex gap-4">
              <div className="w-10 h-10 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-full flex items-center justify-center">
                <Bot className="w-5 h-5 text-white" />
              </div>
              <div className="bg-white rounded-2xl p-4 shadow-lg">
                <div className="flex items-center gap-2">
                  <div className="flex gap-1">
                    <div className="w-2 h-2 bg-cyan-500 rounded-full animate-bounce"></div>
                    <div className="w-2 h-2 bg-cyan-500 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                    <div className="w-2 h-2 bg-cyan-500 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                  </div>
                  <span className="text-gray-600 text-sm">OmnIA analyse avec Smart AI...</span>
                </div>
              </div>
            </div>
          )}
          
          <div ref={messagesEndRef} />
        </div>

        {/* Suggestions rapides */}
        <div className="mb-4">
          <div className="flex gap-2 overflow-x-auto pb-2">
            <button
              onClick={() => handleSendMessage("🛋️ Canapé moderne pour salon")}
              className="flex-shrink-0 px-4 py-2 bg-blue-500/20 hover:bg-blue-500/30 text-blue-300 rounded-xl border border-blue-500/30 transition-all text-sm"
            >
              🛋️ Canapé moderne
            </button>
            <button
              onClick={() => handleSendMessage("🪑 Table ronde travertin")}
              className="flex-shrink-0 px-4 py-2 bg-purple-500/20 hover:bg-purple-500/30 text-purple-300 rounded-xl border border-purple-500/30 transition-all text-sm"
            >
              🪑 Table travertin
            </button>
            <button
              onClick={() => handleSendMessage("💺 Chaise AVINA beige")}
              className="flex-shrink-0 px-4 py-2 bg-green-500/20 hover:bg-green-500/30 text-green-300 rounded-xl border border-green-500/30 transition-all text-sm"
            >
              💺 Chaise AVINA
            </button>
            <button
              onClick={() => handleSendMessage("🎨 Conseils déco salon moderne")}
              className="flex-shrink-0 px-4 py-2 bg-orange-500/20 hover:bg-orange-500/30 text-orange-300 rounded-xl border border-orange-500/30 transition-all text-sm"
            >
              🎨 Conseils déco
            </button>
          </div>
        </div>

        {/* Zone de saisie */}
        <div className="bg-white/10 backdrop-blur-xl rounded-2xl p-4 border border-white/20">
          {/* Statut vocal */}
          {(isRecording || isAnalyzingPhoto) && (
            <div className="mb-4 p-3 bg-blue-500/20 border border-blue-400/50 rounded-xl">
              <div className="flex items-center gap-3">
                {isRecording ? (
                  <>
                    <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse"></div>
                    <span className="text-red-300 font-medium text-sm">🎤 Parlez maintenant...</span>
                  </>
                ) : isAnalyzingPhoto ? (
                  <>
                    <div className="w-3 h-3 bg-purple-500 rounded-full animate-pulse"></div>
                    <span className="text-purple-300 font-medium text-sm">📸 Analyse photo avec OpenAI Vision...</span>
                  </>
                ) : null}
              </div>
            </div>
          )}

          <div className="flex gap-3">
            {/* Contrôles vocaux */}
            <button
              onClick={handleMicClick}
              className={`w-12 h-12 rounded-xl flex items-center justify-center transition-all ${
                isRecording
                  ? 'bg-red-500 hover:bg-red-600 animate-pulse'
                  : 'bg-purple-500 hover:bg-purple-600'
              }`}
              title={isRecording ? 'Arrêter' : 'Micro'}
            >
              {isRecording ? <MicOff className="w-5 h-5 text-white" /> : <Mic className="w-5 h-5 text-white" />}
            </button>

            <button
              onClick={handleVolumeClick}
              className={`w-12 h-12 rounded-xl flex items-center justify-center transition-all ${
                isSpeaking
                  ? 'bg-green-500 hover:bg-green-600 animate-pulse'
                  : 'bg-green-500 hover:bg-green-600'
              }`}
              title="Volume"
            >
              {isSpeaking ? <VolumeX className="w-5 h-5 text-white" /> : <Volume2 className="w-5 h-5 text-white" />}
            </button>

            {/* Input photo */}
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
              className="w-12 h-12 bg-pink-500 hover:bg-pink-600 disabled:bg-gray-500 rounded-xl flex items-center justify-center transition-all"
              title="Analyser photo"
            >
              <Camera className="w-5 h-5 text-white" />
            </button>

            {/* Champ de saisie */}
            <div className="flex-1 relative">
              <input
                type="text"
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSendMessage(inputMessage)}
                placeholder="Décrivez votre projet déco..."
                className="w-full bg-slate-700/50 border border-slate-600/50 rounded-xl px-4 py-3 text-white placeholder-slate-400 focus:outline-none focus:border-cyan-400 focus:ring-2 focus:ring-cyan-400/30"
              />
            </div>

            {/* Bouton envoyer */}
            <button
              onClick={() => handleSendMessage(inputMessage)}
              disabled={!inputMessage.trim()}
              className="w-12 h-12 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 disabled:from-gray-600 disabled:to-gray-700 rounded-xl flex items-center justify-center transition-all disabled:cursor-not-allowed"
            >
              <Send className="w-5 h-5 text-white" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};