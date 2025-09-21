import React from 'react';
import { User, Bot, Volume2, Zap } from 'lucide-react';
import { ChatMessage as ChatMessageType } from '../types';

interface ChatMessageProps {
  message: ChatMessageType;
  onAddToCart: (productId: string, variantId: string) => void;
  onSpeak?: (text: string) => void;
  isPlaying?: boolean;
}

export const ChatMessage: React.FC<ChatMessageProps> = ({ message, onAddToCart, onSpeak, isPlaying }) => {
  // Séparer le message et les produits pour un meilleur affichage
  const hasProducts = message.products && message.products.length > 0;
  
  const formatMessage = (content: string) => {
    // Séparer le contenu principal et la mention ChatGPT
    const parts = content.split(/\n\n\*Powered by (?:ChatGPT|DeepSeek)[^*]*\*/);
    const cleanContent = parts[0].trim();
    const poweredByMatch = content.match(/\*Powered by (?:ChatGPT|DeepSeek)[^*]*\*/);
    
    const lines = cleanContent.split('\n');
    const formattedLines = lines.map((line, index) => {
      if (line.startsWith('### ')) {
        return (
          <h3 key={index} className={`text-lg font-bold mb-3 mt-4 ${message.isUser ? 'text-white' : 'text-gray-800'}`}>
            {line.replace('### ', '')}
          </h3>
        );
      }
      if (line.startsWith('## ')) {
        return (
          <h2 key={index} className={`text-xl font-bold mb-3 mt-4 ${message.isUser ? 'text-white' : 'text-gray-800'}`}>
            {line.replace('## ', '')}
          </h2>
        );
      }
      if (line.startsWith('# ')) {
        return (
          <h1 key={index} className={`text-2xl font-bold mb-4 mt-4 ${message.isUser ? 'text-white' : 'text-gray-800'}`}>
            {line.replace('# ', '')}
          </h1>
        );
      }

      if (line.includes('**')) {
        const parts = line.split(/(\*\*.*?\*\*)/g);
        return (
          <p key={index} className="mb-2">
            {parts.map((part, partIndex) => {
              if (part.startsWith('**') && part.endsWith('**')) {
                return (
                  <strong key={partIndex} className={`font-bold ${message.isUser ? 'text-blue-200' : 'text-blue-600'}`}>
                    {part.slice(2, -2)}
                  </strong>
                );
              }
              return part;
            })}
          </p>
        );
      }

      if (line.includes('*') && !line.includes('**')) {
        const parts = line.split(/(\*.*?\*)/g);
        return (
          <p key={index} className="mb-2">
            {parts.map((part, partIndex) => {
              if (part.startsWith('*') && part.endsWith('*') && !part.startsWith('**')) {
                return (
                  <em key={partIndex} className={`italic font-medium ${message.isUser ? 'text-blue-200' : 'text-blue-600'}`}>
                    {part.slice(1, -1)}
                  </em>
                );
              }
              return part;
            })}
          </p>
        );
      }

      if (line.startsWith('• ') || line.startsWith('- ')) {
        return (
          <div key={index} className="flex items-start gap-3 mb-2 ml-2">
            <span className="text-blue-500 mt-1 font-bold text-lg">•</span>
            <span className={message.isUser ? 'text-blue-100' : 'text-gray-700'}>{line.replace(/^[•-] /, '')}</span>
          </div>
        );
      }

      if (line.trim() === '---' || line.trim() === '___') {
        return <hr key={index} className="border-gray-200 my-4" />;
      }

      if (line.trim() === '') {
        return <br key={index} />;
      }

      return (
        <p key={index} className="mb-2">
          {line}
        </p>
      );
    });

    // Ajouter "Powered by ChatGPT" à la fin si présent
    const hasPoweredBy = poweredByMatch !== null;
    
    return (
      <div>
        {formattedLines}
        {hasPoweredBy && (
          <div className={`mt-3 pt-3 border-t ${message.isUser ? 'border-blue-300' : 'border-gray-200'}`}>
            <span className={`text-xs italic ${message.isUser ? 'text-blue-200' : 'text-gray-500'}`}>
              ⚡ {poweredByMatch[0].replace(/\*/g, '').replace('ChatGPT', 'DeepSeek')}
            </span>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="space-y-4 animate-in slide-in-from-bottom-4 duration-500">
      {/* Message principal */}
      <div className={`flex gap-4 md:gap-6 ${message.isUser ? 'justify-end' : 'justify-start'}`}>
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
            {formatMessage(message.content)}
          </div>
          
          {!message.isUser && onSpeak && (
            <button
              onClick={() => onSpeak(message.content)}
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
      
      {/* Produits séparés du message */}
      {hasProducts && !message.isUser && (
        <div className="ml-16 space-y-4">
          <h4 className="text-lg font-bold text-gray-800 flex items-center gap-2">
            ✨ Mes recommandations
            <span className="bg-cyan-500/20 text-cyan-700 px-3 py-1 rounded-full text-sm border border-cyan-300">
              {message.products.length} produit{message.products.length > 1 ? 's' : ''}
            </span>
          </h4>
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {message.products.map((product) => (
              <div key={product.id} className="bg-white rounded-2xl p-4 shadow-lg border border-gray-200 hover:shadow-xl transition-all">
                <div className="w-full h-40 rounded-xl overflow-hidden mb-4">
                  <img 
                    src={product.image_url || 'https://images.pexels.com/photos/1350789/pexels-photo-1350789.jpeg'} 
                    alt={product.title}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      target.src = 'https://images.pexels.com/photos/1350789/pexels-photo-1350789.jpeg';
                    }}
                  />
                </div>
                <h5 className="font-bold text-gray-800 mb-2 line-clamp-2">{product.title}</h5>
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xl font-bold text-green-600">{product.price}€</span>
                  {product.compareAtPrice && product.compareAtPrice > product.price && (
                    <span className="text-gray-500 line-through text-sm">{product.compareAtPrice}€</span>
                  )}
                </div>
                <button
                  onClick={() => onAddToCart && onAddToCart(product.id, product.variants?.[0]?.id || 'default')}
                  className="w-full bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-400 hover:to-emerald-500 text-white py-2 rounded-xl font-semibold transition-all flex items-center justify-center gap-2"
                >
                  <ShoppingCart className="w-4 h-4" />
                  Ajouter au panier
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};