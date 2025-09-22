import React, { useState, useEffect, useRef } from 'react';
import { 
  Send, Mic, MicOff, Volume2, VolumeX, Camera, Upload, 
  Bot, User, Sparkles, ShoppingCart, ArrowLeft, Settings,
  Zap, Heart, Music, Move, Battery, Wifi, Signal
} from 'lucide-react';
import { Logo } from '../components/Logo';
import { ChatMessage } from '../components/ChatMessage';
import { SuggestionChips } from '../components/SuggestionChips';
import { TypingIndicator } from '../components/TypingIndicator';
import { CartButton } from '../components/CartButton';
import { RobotAvatar } from '../components/RobotAvatar';
import { RobotInitializationScreen } from '../components/RobotInitializationScreen';
import { useWhisperSTT } from '../hooks/useWhisperSTT';
import { useAdvancedVoice } from '../hooks/useAdvancedVoice';
import { ChatMessage as ChatMessageType } from '../types';

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
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [showInitialization, setShowInitialization] = useState(true);
  const [robotMood, setRobotMood] = useState<'sleeping' | 'neutral' | 'happy' | 'thinking' | 'speaking' | 'dancing' | 'moving'>('neutral');
  const [robotPosition, setRobotPosition] = useState({ x: 0, y: 0, rotation: 0 });
  const [robotBattery, setRobotBattery] = useState(100);
  const [isRobotMoving, setIsRobotMoving] = useState(false);
  const [isRobotDancing, setIsRobotDancing] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Voice hooks
  const { 
    isRecording, 
    isProcessing, 
    transcript, 
    error: sttError,
    startRecording, 
    stopRecording, 
    reset: resetSTT 
  } = useWhisperSTT({ language: 'fr' });

  const { 
    speak, 
    stopSpeaking, 
    isSpeaking, 
    isLoading: ttsLoading,
    error: ttsError 
  } = useAdvancedVoice({ 
    provider: 'elevenlabs',
    voiceSettings: {
      voiceId: 'EIe4oLyymVX7lKVYli9m',
      stability: 0.8,
      similarityBoost: 0.95
    }
  });

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    if (transcript && !isProcessing) {
      handleSendMessage(transcript);
      resetSTT();
    }
  }, [transcript, isProcessing]);

  useEffect(() => {
    // Update robot mood based on state
    if (isSpeaking) {
      setRobotMood('speaking');
    } else if (isRecording) {
      setRobotMood('thinking');
    } else if (isRobotDancing) {
      setRobotMood('dancing');
    } else if (isRobotMoving) {
      setRobotMood('moving');
    } else {
      setRobotMood('happy');
    }
  }, [isSpeaking, isRecording, isRobotDancing, isRobotMoving]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleSendMessage = async (messageText?: string) => {
    const text = messageText || inputMessage.trim();
    if (!text) return;

    const userMessage: ChatMessageType = {
      id: Date.now().toString(),
      content: text,
      isUser: true,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputMessage('');
    setIsTyping(true);
    setRobotMood('thinking');

    try {
      // Simulate AI response
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      const aiResponse = generateRobotResponse(text);
      
      const botMessage: ChatMessageType = {
        id: (Date.now() + 1).toString(),
        content: aiResponse.message,
        isUser: false,
        timestamp: new Date(),
        products: aiResponse.products
      };

      setMessages(prev => [...prev, botMessage]);
      
      // Speak the response
      if (aiResponse.message) {
        await speak(aiResponse.message);
      }

    } catch (error) {
      console.error('Erreur envoi message:', error);
    } finally {
      setIsTyping(false);
      setRobotMood('happy');
    }
  };

  const generateRobotResponse = (message: string) => {
    const lowerMessage = message.toLowerCase();
    
    // Salutations
    if (lowerMessage.includes('bonjour') || lowerMessage.includes('salut') || lowerMessage.includes('hello')) {
      return {
        message: "Bonjour ! Ravi de vous rencontrer ! 😊 Je suis OmnIA, votre robot designer spécialisé en mobilier. Comment puis-je vous aider à créer l'intérieur de vos rêves ?",
        products: []
      };
    }

    // Canapés
    if (lowerMessage.includes('canapé') || lowerMessage.includes('sofa')) {
      return {
        message: "Excellent choix ! Notre canapé ALYANA convertible en velours côtelé est parfait pour les intérieurs modernes. Design arrondi, couchage intégré et coffre de rangement !",
        products: [
          {
            id: 'decora-canape-alyana',
            title: 'Canapé ALYANA convertible - Beige',
            productType: 'Canapé',
            vendor: 'Decora Home',
            price: 799,
            compareAtPrice: 1399,
            availableForSale: true,
            quantityAvailable: 100,
            image_url: 'https://cdn.shopify.com/s/files/1/0903/7578/2665/files/7_23a97631-68d2-4f3e-8f78-b26c7cd4c2ae.png?v=1754406480',
            product_url: 'https://decorahome.fr/products/canape-dangle-convertible-et-reversible-4-places-en-velours-cotele',
            description: 'Canapé d\'angle convertible 4 places en velours côtelé',
            variants: [{
              id: 'var-beige',
              title: 'Beige',
              price: 799,
              compareAtPrice: 1399,
              availableForSale: true,
              quantityAvailable: 100,
              selectedOptions: []
            }],
            tags: ['convertible', 'velours', 'beige'],
            handle: 'canape-alyana'
          }
        ]
      };
    }

    // Tables
    if (lowerMessage.includes('table')) {
      return {
        message: "Parfait ! Notre table AUREA en travertin naturel apporte une élégance minérale unique. Disponible en Ø100cm et Ø120cm pour s'adapter à votre espace !",
        products: [
          {
            id: 'decora-table-aurea',
            title: 'Table AUREA Ø100cm - Travertin',
            productType: 'Table',
            vendor: 'Decora Home',
            price: 499,
            compareAtPrice: 859,
            availableForSale: true,
            quantityAvailable: 50,
            image_url: 'https://cdn.shopify.com/s/files/1/0903/7578/2665/files/3_e80b9a50-b032-4267-8f5b-f9130153e3be.png?v=1754406484',
            product_url: 'https://decorahome.fr/products/table-a-manger-ronde-plateau-en-travertin-naturel-100-120-cm',
            description: 'Table ronde en travertin naturel',
            variants: [{
              id: 'var-100cm',
              title: 'Ø100cm',
              price: 499,
              compareAtPrice: 859,
              availableForSale: true,
              quantityAvailable: 50,
              selectedOptions: []
            }],
            tags: ['travertin', 'ronde'],
            handle: 'table-aurea'
          }
        ]
      };
    }

    // Chaises
    if (lowerMessage.includes('chaise') || lowerMessage.includes('fauteuil')) {
      return {
        message: "Super ! Notre chaise INAYA en tissu chenille avec pieds métal noir offre un design contemporain épuré. Confort et style garantis !",
        products: [
          {
            id: 'decora-chaise-inaya',
            title: 'Chaise INAYA - Gris chenille',
            productType: 'Chaise',
            vendor: 'Decora Home',
            price: 99,
            compareAtPrice: 149,
            availableForSale: true,
            quantityAvailable: 96,
            image_url: 'https://cdn.shopify.com/s/files/1/0903/7578/2665/files/3_3f11d1af-8ce5-4d2d-a435-cd0a78eb92ee.png?v=1755791319',
            product_url: 'https://decorahome.fr/products/chaise-en-tissu-serge-chenille-pieds-metal-noir-gris-clair-moka-et-beige',
            description: 'Chaise en tissu chenille avec pieds métal noir',
            variants: [{
              id: 'var-gris',
              title: 'Gris clair',
              price: 99,
              compareAtPrice: 149,
              availableForSale: true,
              quantityAvailable: 96,
              selectedOptions: []
            }],
            tags: ['chenille', 'gris'],
            handle: 'chaise-inaya'
          }
        ]
      };
    }

    // Réponse par défaut
    return {
      message: "Intéressant ! Pouvez-vous me dire plus précisément ce que vous cherchez ? Je suis là pour vous conseiller sur notre collection Decora Home ! 🤖",
      products: []
    };
  };

  const handleAddToCart = (productId: string, variantId: string) => {
    // Find product in messages
    const product = messages
      .flatMap(m => m.products || [])
      .find(p => p.id === productId);

    if (!product) return;

    const variant = product.variants.find(v => v.id === variantId) || product.variants[0];
    
    const cartItem: CartItem = {
      id: `${productId}-${variantId}`,
      productId,
      variantId,
      title: `${product.title} - ${variant.title}`,
      price: variant.price,
      quantity: 1,
      image_url: product.image_url,
      product_url: product.product_url
    };

    setCartItems(prev => {
      const existingItem = prev.find(item => item.id === cartItem.id);
      if (existingItem) {
        return prev.map(item => 
          item.id === cartItem.id 
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      }
      return [...prev, cartItem];
    });

    // Robot celebration
    setIsRobotDancing(true);
    setTimeout(() => setIsRobotDancing(false), 2000);
  };

  const handleUpdateCartQuantity = (itemId: string, quantity: number) => {
    if (quantity <= 0) {
      setCartItems(prev => prev.filter(item => item.id !== itemId));
    } else {
      setCartItems(prev => prev.map(item => 
        item.id === itemId ? { ...item, quantity } : item
      ));
    }
  };

  const handleRemoveFromCart = (itemId: string) => {
    setCartItems(prev => prev.filter(item => item.id !== itemId));
  };

  const handleCheckout = () => {
    alert('Redirection vers le checkout...');
  };

  const handlePhotoUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file && file.type.startsWith('image/')) {
      const photoUrl = URL.createObjectURL(file);
      
      const photoMessage: ChatMessageType = {
        id: Date.now().toString(),
        content: 'J\'ai envoyé une photo de mon espace',
        isUser: true,
        timestamp: new Date(),
        photoUrl
      };

      setMessages(prev => [...prev, photoMessage]);
      
      // Simulate photo analysis
      setTimeout(() => {
        const analysisMessage: ChatMessageType = {
          id: (Date.now() + 1).toString(),
          content: `📸 Belle photo ! Votre espace a du potentiel ! 

💡 **Mes suggestions :**
• **Canapé ALYANA** (799€) - Convertible parfait pour votre salon
• **Table AUREA** (499€) - Travertin élégant qui s'harmoniserait parfaitement

🎨 **Conseil déco :** Ajoutez des coussins colorés pour réchauffer l'ambiance !

Que souhaitez-vous améliorer en priorité ?`,
          isUser: false,
          timestamp: new Date(),
          products: [
            {
              id: 'decora-canape-alyana',
              title: 'Canapé ALYANA convertible - Beige',
              productType: 'Canapé',
              vendor: 'Decora Home',
              price: 799,
              compareAtPrice: 1399,
              availableForSale: true,
              quantityAvailable: 100,
              image_url: 'https://cdn.shopify.com/s/files/1/0903/7578/2665/files/7_23a97631-68d2-4f3e-8f78-b26c7cd4c2ae.png?v=1754406480',
              product_url: 'https://decorahome.fr/products/canape-dangle-convertible-et-reversible-4-places-en-velours-cotele',
              description: 'Canapé d\'angle convertible 4 places en velours côtelé',
              variants: [{
                id: 'var-beige',
                title: 'Beige',
                price: 799,
                compareAtPrice: 1399,
                availableForSale: true,
                quantityAvailable: 100,
                selectedOptions: []
              }],
              tags: ['convertible', 'velours', 'beige'],
              handle: 'canape-alyana'
            }
          ]
        };

        setMessages(prev => [...prev, analysisMessage]);
        speak(analysisMessage.content);
      }, 2000);
    }
  };

  const handleMicClick = () => {
    if (isRecording) {
      stopRecording();
    } else {
      startRecording();
    }
  };

  const suggestions = [
    "Montrez-moi vos canapés",
    "Tables en travertin",
    "Chaises design",
    "Conseils salon moderne",
    "Budget 500-1000€"
  ];

  if (showInitialization) {
    return <RobotInitializationScreen onComplete={() => setShowInitialization(false)} />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-purple-900 flex flex-col">
      {/* Header */}
      <header className="bg-black/20 backdrop-blur-xl border-b border-white/10 flex-shrink-0">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center gap-4">
              <Logo size="sm" />
              <div className="hidden sm:block">
                <h1 className="text-xl font-bold text-white">OmnIA Robot</h1>
                <p className="text-cyan-300 text-sm">Assistant Designer IA</p>
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              {/* Robot Status */}
              <div className="hidden lg:flex items-center gap-2 bg-black/40 rounded-xl px-3 py-2">
                <RobotAvatar 
                  mood={robotMood}
                  size="sm"
                  isListening={isRecording}
                  isSpeaking={isSpeaking}
                  isMoving={isRobotMoving}
                  isDancing={isRobotDancing}
                  battery={robotBattery}
                  position={robotPosition}
                />
                <div className="text-xs">
                  <div className="text-white font-medium">OmnIA</div>
                  <div className="text-cyan-300">En ligne</div>
                </div>
              </div>

              {/* Cart */}
              <CartButton
                items={cartItems}
                onUpdateQuantity={handleUpdateCartQuantity}
                onRemoveItem={handleRemoveFromCart}
                onCheckout={handleCheckout}
              />

              {/* Settings */}
              <button
                onClick={() => setShowSettings(!showSettings)}
                className="p-2 bg-purple-600 hover:bg-purple-700 text-white rounded-xl transition-all"
              >
                <Settings className="w-5 h-5" />
              </button>

              <a href="/" className="flex items-center gap-2 text-cyan-400 hover:text-cyan-300 transition-colors">
                <ArrowLeft className="w-4 h-4" />
                <span className="hidden sm:inline">Retour</span>
              </a>
            </div>
          </div>
        </div>
      </header>

      {/* Settings Panel */}
      {showSettings && (
        <div className="bg-black/20 backdrop-blur-xl border-b border-white/10 p-4">
          <div className="max-w-7xl mx-auto">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <button
                onClick={() => {
                  setIsRobotMoving(true);
                  setTimeout(() => setIsRobotMoving(false), 3000);
                }}
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-xl flex items-center gap-2 transition-all"
              >
                <Move className="w-4 h-4" />
                Déplacer robot
              </button>
              
              <button
                onClick={() => {
                  setIsRobotDancing(true);
                  setTimeout(() => setIsRobotDancing(false), 5000);
                }}
                className="bg-pink-600 hover:bg-pink-700 text-white px-4 py-2 rounded-xl flex items-center gap-2 transition-all"
              >
                <Music className="w-4 h-4" />
                Mode danse
              </button>
              
              <button
                onClick={() => setRobotBattery(prev => Math.max(prev - 10, 0))}
                className="bg-orange-600 hover:bg-orange-700 text-white px-4 py-2 rounded-xl flex items-center gap-2 transition-all"
              >
                <Battery className="w-4 h-4" />
                Batterie: {robotBattery}%
              </button>
              
              <button
                onClick={() => setShowSettings(false)}
                className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-xl transition-all"
              >
                Fermer
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Chat Area */}
      <div className="flex-1 flex flex-col max-w-4xl mx-auto w-full px-4 py-6">
        {/* Messages */}
        <div className="flex-1 overflow-y-auto space-y-6 mb-6">
          {messages.length === 0 && (
            <div className="text-center py-20">
              <RobotAvatar 
                mood="happy"
                size="xl"
                battery={robotBattery}
              />
              <h2 className="text-2xl font-bold text-white mt-6 mb-4">
                Bonjour ! Je suis OmnIA 🤖
              </h2>
              <p className="text-gray-300 text-lg mb-8">
                Votre robot designer spécialisé en mobilier Decora Home
              </p>
              <div className="bg-cyan-500/20 border border-cyan-400/50 rounded-2xl p-6 max-w-md mx-auto">
                <h3 className="text-cyan-200 font-semibold mb-3">💡 Je peux vous aider à :</h3>
                <ul className="text-cyan-300 text-sm space-y-2">
                  <li>• Trouver le mobilier parfait pour votre espace</li>
                  <li>• Vous conseiller sur les couleurs et styles</li>
                  <li>• Calculer les dimensions optimales</li>
                  <li>• Créer des harmonies déco</li>
                </ul>
              </div>
            </div>
          )}

          {messages.map((message) => (
            <ChatMessage
              key={message.id}
              message={message}
              onAddToCart={handleAddToCart}
              onSpeak={speak}
              isPlaying={isSpeaking}
            />
          ))}

          {isTyping && <TypingIndicator />}
          <div ref={messagesEndRef} />
        </div>

        {/* Suggestions */}
        <SuggestionChips
          suggestions={suggestions}
          onSuggestionClick={handleSendMessage}
        />

        {/* Input Area */}
        <div className="bg-white/10 backdrop-blur-xl rounded-2xl p-4 border border-white/20">
          <div className="flex gap-3">
            {/* Photo Upload */}
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handlePhotoUpload}
              className="hidden"
            />
            <button
              onClick={() => fileInputRef.current?.click()}
              className="p-3 bg-purple-600 hover:bg-purple-700 text-white rounded-xl transition-all hover:scale-105"
              title="Envoyer une photo"
            >
              <Camera className="w-5 h-5" />
            </button>

            {/* Voice Input */}
            <button
              onClick={handleMicClick}
              className={`p-3 rounded-xl transition-all hover:scale-105 ${
                isRecording
                  ? 'bg-red-500 hover:bg-red-600 animate-pulse'
                  : 'bg-green-600 hover:bg-green-700'
              } text-white`}
              title={isRecording ? 'Arrêter l\'enregistrement' : 'Enregistrement vocal'}
            >
              {isRecording ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
            </button>

            {/* Text Input */}
            <input
              type="text"
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
              placeholder="Tapez votre message ou utilisez la voix..."
              className="flex-1 px-4 py-3 bg-black/40 border border-cyan-500/50 rounded-xl text-white placeholder-cyan-400 focus:outline-none focus:border-cyan-400 focus:ring-2 focus:ring-cyan-400/30"
            />

            {/* Send Button */}
            <button
              onClick={() => handleSendMessage()}
              disabled={!inputMessage.trim()}
              className="p-3 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 disabled:from-gray-600 disabled:to-gray-700 text-white rounded-xl transition-all hover:scale-105 disabled:cursor-not-allowed"
            >
              <Send className="w-5 h-5" />
            </button>
          </div>

          {/* Voice Status */}
          {(isRecording || isProcessing || ttsLoading || sttError || ttsError) && (
            <div className="mt-3 flex items-center gap-2 text-sm">
              {isRecording && (
                <div className="flex items-center gap-2 text-red-300">
                  <div className="w-2 h-2 bg-red-400 rounded-full animate-pulse"></div>
                  Enregistrement en cours...
                </div>
              )}
              {isProcessing && (
                <div className="flex items-center gap-2 text-yellow-300">
                  <div className="w-2 h-2 bg-yellow-400 rounded-full animate-pulse"></div>
                  Transcription...
                </div>
              )}
              {ttsLoading && (
                <div className="flex items-center gap-2 text-green-300">
                  <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                  Génération vocale...
                </div>
              )}
              {(sttError || ttsError) && (
                <div className="text-red-300">
                  Erreur: {sttError || ttsError}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};