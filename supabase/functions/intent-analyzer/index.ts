import React from 'react';
import { User, Bot, Volume2, Zap, ShoppingCart, Sparkles } from 'lucide-react';
import { ChatMessage as ChatMessageType } from '../types';

interface ChatMessageProps {
  message: ChatMessageType;
  onAddToCart: (productId: string, variantId: string) => void;
  onSpeak?: (text: string) => void;
  isPlaying?: boolean;
  onQuickReply?: (text: string) => void;
}

export const ChatMessage: React.FC<ChatMessageProps> = ({ 
  message, 
  onAddToCart, 
  onSpeak, 
  isPlaying,
  onQuickReply 
}) => {
  const formatMessage = (content: string) => {
    // Séparer le contenu principal et la mention ChatGPT
    const parts = content.split(/\n\n\*Powered by ChatGPT[^*]*\*/);
    const cleanContent = parts[0].trim();
    const poweredByMatch = content.match(/\*Powered by ChatGPT[^*]*\*/);
    
    const lines = cleanContent.split('\n');
    const formattedLines = lines.map((line, index) => {
      // ... (le reste du formatage reste identique)
      // Garder tout le code existant de formatMessage
      return line; // placeholder
    });

    // Ajouter "Powered by ChatGPT" à la fin si présent
    const hasPoweredBy = poweredByMatch !== null;
    
    return (
      <div>
        {formattedLines}
        {hasPoweredBy && (
          <div className={`mt-3 pt-3 border-t ${message.isUser ? 'border-blue-300' : 'border-gray-200'}`}>
            <span className={`text-xs italic ${message.isUser ? 'text-blue-200' : 'text-gray-500'}`}>
              ⚡ {poweredByMatch[0].replace(/\*/g, '')}
            </span>
          </div>
        )}
      </div>
    );
  };

  // Nouvelle fonction pour détecter les produits dans le message
  const extractProducts = (content: string) => {
    const productRegex = /PRODUCT:([^:]+):([^:]+):([^:]+):([^\n]+)/g;
    const products = [];
    let match;
    
    while ((match = productRegex.exec(content)) !== null) {
      products.push({
        id: match[1],
        variantId: match[2],
        name: match[3],
        price: match[4]
      });
    }
    
    return products;
  };

  // Nouvelle fonction pour détecter les réponses rapides
  const extractQuickReplies = (content: string) => {
    const quickReplyRegex = /QUICK_REPLY:([^\n]+)/g;
    const quickReplies = [];
    let match;
    
    while ((match = quickReplyRegex.exec(content)) !== null) {
      quickReplies.push(match[1]);
    }
    
    return quickReplies;
  };

  const products = extractProducts(message.content);
  const quickReplies = extractQuickReplies(message.content);
  const cleanContent = message.content.replace(/(PRODUCT|QUICK_REPLY):[^\n]*\n?/g, '');

  return (
    <div className={`flex gap-4 md:gap-6 ${message.isUser ? 'justify-end' : 'justify-start'} animate-in slide-in-from-bottom-4 duration-500`}>
      {!message.isUser && (
        <div className="flex-shrink-0">
          <div className="w-10 h-10 md:w-12 md:h-12 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-2xl flex items-center justify-center shadow-lg relative border-2 border-cyan-400/30">
            <Bot className="w-5 h-5 md:w-6 md:h-6 text-white" />
            <div className="absolute -top-1 -right-1 w-3 h-3 bg-green-400 rounded-full animate-bounce"></div>
            {isPlaying && (
              <div className="absolute inset-0 border-2 border-green-400 rounded-2xl animate-pulse"></div>
            )}
          </div>
        </div>
      )}
      
      <div className={`max-w-[75%] ${message.isUser ? 'order-first' : ''}`}>
        <div
          className={`rounded-2xl px-4 md:px-5 py-3 md:py-4 shadow-lg ${
            message.isUser
              ? 'bg-gradient-to-r from-blue-500 to-purple-600 text-white ml-auto shadow-blue-500/20 border border-blue-400/50'
              : 'bg-white text-gray-800 border border-gray-200 shadow-gray-200/50'
          }`}
        >
          {/* Photo Preview */}
          {message.photoUrl && (
            <div className="mb-4">
              <img 
                src={message.photoUrl} 
                alt="Photo envoyée"
                className="w-full max-w-sm h-40 md:h-48 object-cover rounded-xl border border-gray-200 shadow-lg"
              />
              <p className={`text-sm mt-3 font-medium ${message.isUser ? 'text-blue-200' : 'text-blue-600'}`}>
                📸 Photo analysée par OmnIA Vision
              </p>
            </div>
          )}
          
          <div className={`${message.isUser ? 'text-white' : 'text-gray-800'} leading-relaxed`}>
            {formatMessage(cleanContent)}
          </div>
          
          {/* Affichage des produits */}
          {products.length > 0 && (
            <div className="mt-4 space-y-3">
              {products.map((product, index) => (
                <div key={index} className="flex items-center gap-4 p-3 bg-gray-50 rounded-xl border border-gray-200">
                  <div className="flex-1">
                    <h4 className="font-medium text-gray-800">{product.name}</h4>
                    <p className="text-blue-600 font-bold">{product.price}</p>
                  </div>
                  <button
                    onClick={() => onAddToCart(product.id, product.variantId)}
                    className="flex-shrink-0 px-3 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors flex items-center gap-2"
                  >
                    <ShoppingCart className="w-4 h-4" />
                    Ajouter
                  </button>
                </div>
              ))}
            </div>
          )}
          
          {/* Réponses rapides */}
          {quickReplies.length > 0 && (
            <div className="mt-4 flex flex-wrap gap-2">
              {quickReplies.map((reply, index) => (
                <button
                  key={index}
                  onClick={() => onQuickReply && onQuickReply(reply)}
                  className="px-3 py-2 bg-blue-100 text-blue-700 rounded-full hover:bg-blue-200 transition-colors text-sm font-medium flex items-center gap-1"
                >
                  <Sparkles className="w-4 h-4" />
                  {reply}
                </button>
              ))}
            </div>
          )}
          
          {!message.isUser && onSpeak && (
            <button
              onClick={() => onSpeak(cleanContent)}
              className="mt-3 inline-flex items-center gap-2 px-3 md:px-4 py-2 rounded-xl bg-blue-100 text-blue-700 hover:bg-blue-200 transition-all text-sm font-medium border border-blue-200 hover:scale-105"
            >
              <Volume2 className="w-4 h-4" />
              Réécouter
            </button>
          )}
          
        </div>
        
        <div className="text-xs text-gray-500 mt-2 px-2 md:px-3 py-1 bg-gray-100 rounded-full inline-block border border-gray-200 font-medium">
          {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
        </div>
      </div>

      {/* User avatar - only show on desktop and when there's no photo */}
      {message.isUser && !message.photoUrl && (
        <div className="hidden md:block flex-shrink-0">
          <div className="w-10 h-10 md:w-12 md:h-12 bg-gradient-to-br from-gray-600 to-gray-800 rounded-2xl flex items-center justify-center shadow-lg border-2 border-gray-400/30">
            <div className="w-5 h-5 md:w-6 md:h-6 bg-blue-100 rounded-full flex items-center justify-center">
              <span className="text-blue-600 font-bold text-sm">U</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};