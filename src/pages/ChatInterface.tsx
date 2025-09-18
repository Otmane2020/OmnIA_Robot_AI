import React, { useState, useEffect, useRef } from 'react';
import { Mic, MicOff, Volume2, VolumeX, Send, Image, Loader2 } from 'lucide-react';

import { ChatMessage } from '../components/ChatMessage';
import { ProductCard } from '../components/ProductCard';
import { CartButton } from '../components/CartButton';
import { RobotAvatar } from '../components/RobotAvatar';
import { useWhisperSTT } from '../hooks/useWhisperSTT';
import { useGoogleTTS } from '../hooks/useGoogleTTS';
import { ChatMessage as ChatMessageType, Product } from '../types';

export const ChatInterface: React.FC = () => {
  const [messages, setMessages] = useState<ChatMessageType[]>([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [products, setProducts] = useState<Product[]>([]);
  const [cartItems, setCartItems] = useState<any[]>([]);
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
    const greeting = "Bonjour 👋 Je suis OmnIA 🤖, votre conseiller mobilier Decora Home. Que cherchez-vous aujourd'hui ?";
    setMessages([{ id: Date.now().toString(), content: greeting, isUser: false, timestamp: new Date(), products: [] }]);
    speak(greeting);
  }, []);

  // Scroll auto
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // --- Appel API IA ---
  const sendToAI = async (message: string): Promise<string> => {
    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          model: "gpt-4o-mini",
          temperature: 0.6,
          messages: [{ role: "user", content: message }],
        }),
      });

      if (!res.ok) throw new Error("Erreur API");
      const data = await res.json();
      return data.reply;
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

      // TODO: Parser aiResponse pour sortir des produits si besoin
      const foundProducts: Product[] = [];

      // Ajout réponse IA
      setMessages(prev => [...prev, {
        id: (Date.now() + 1).toString(),
        content: aiResponse,
        isUser: false,
        timestamp: new Date(),
        products: foundProducts
      }]);

      setProducts(foundProducts);
      setShowProducts(foundProducts.length > 0);

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
        // On enrichit avec l’IA
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
    if (transcript && transcript.trim() !== '') {
      handleSendMessage(transcript);
    }
  }, [transcript]);

  return (
    <div className="flex h-screen bg-white">
      
      {/* 👈 Sidebar Robot */}
      <div className="luxury-sidebar flex flex-col p-6 w-2/5 sticky top-0 h-screen overflow-y-auto border-r bg-gray-50">
        <div className="flex items-center gap-3 mb-6">
          <RobotAvatar />
          <h2 className="text-lg font-bold">OmnIA - Conseiller</h2>
          <CartButton items={cartItems} onCheckout={() => {}} />
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto space-y-4 pr-2">
          {messages.map(msg => (
            <ChatMessage key={msg.id} message={msg} onAddToCart={() => {}} />
          ))}
          {(isTyping) && <p className="text-gray-400">OmnIA réfléchit...</p>}
          <div ref={messagesEndRef} />
        </div>

        {/* Zone input */}
        <div className="flex items-center gap-2 mt-4">
          <input
            type="text"
            className="flex-1 border rounded-lg p-2"
            placeholder="Votre message..."
            value={inputMessage}
            onChange={e => setInputMessage(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleSendMessage(inputMessage)}
          />
          <button onClick={() => handleSendMessage(inputMessage)} className="p-2 bg-blue-500 text-white rounded-lg">
            <Send size={18} />
          </button>
          <button onClick={handleMicClick} className="p-2 bg-gray-200 rounded-lg">
            {isRecording ? <MicOff className="text-red-500" /> : <Mic />}
          </button>
          <button onClick={handleVolumeClick} className="p-2 bg-gray-200 rounded-lg">
            {isSpeaking ? <VolumeX className="text-red-500" /> : <Volume2 />}
          </button>
          <button onClick={() => fileInputRef.current?.click()} className="p-2 bg-gray-200 rounded-lg">
            <Image />
          </button>
          <input 
            type="file" 
            accept="image/*" 
            className="hidden" 
            ref={fileInputRef} 
            onChange={e => e.target.files && handlePhotoUpload(e.target.files[0])}
          />
        </div>
      </div>

      {/* 👉 Colonne droite Produits */}
      <div className="flex-1 p-6 overflow-y-auto">
        {showProducts && (
          <div className="grid grid-cols-2 gap-4">
            {products.map(product => (
              <ProductCard key={product.id} product={product} onAddToCart={() => {}} />
            ))}
          </div>
        )}
        {isAnalyzingPhoto && (
          <div className="flex justify-center items-center h-full">
            <Loader2 className="animate-spin text-gray-500" size={32} />
          </div>
        )}
      </div>
    </div>
  );
};
