import React from 'react';
import { User, Bot, Volume2, Zap, ShoppingCart, Sparkles } from 'lucide-react';
import { ChatMessage as ChatMessageType } from '../types';
import { ProductCard } from './ProductCard';

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
    const lines = content.split('\n');
    return lines.map((line, index) => {
      if (line.startsWith('**') && line.endsWith('**')) {
        return (
          <h3 key={index} className={`font-bold text-lg mb-2 ${message.isUser ? 'text-blue-100' : 'text-blue-600'}`}>
            {line.replace(/\*\*/g, '')}
          </h3>
        );
      }
      
      if (line.startsWith('• ')) {
        return (
          <div key={index} className={`flex items-start gap-2 mb-2 ${message.isUser ? 'text-blue-100' : 'text-gray-700'}`}>
            <span className="text-cyan-400 mt-1">•</span>
            <span>{line.substring(2)}</span>
          </div>
        );
      }
      
      if (line.includes('€')) {
        const parts = line.split(/(€\d+|\d+€)/);
        return (
          <p key={index} className="mb-2">
            {parts.map((part, partIndex) => {
              if (part.match(/€\d+|\d+€/)) {
                return (
                  <span key={partIndex} className="font-bold text-green-500">
                    {part}
                  </span>
                );
              }
              return part;
            })}
          </p>
        );
      }
      
      return line ? <p key={index} className="mb-2">{line}</p> : <br key={index} />;
    });
  };

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
        
        {/* Products Display */}
        {message.products && message.products.length > 0 && (
          <div className="mt-6 space-y-4">
            <h3 className="text-lg font-bold text-white flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-cyan-400" />
              Produits recommandés
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {message.products.map((product) => (
                <ProductCard
                  key={product.id}
                  product={product}
                  onAddToCart={onAddToCart}
                />
              ))}
            </div>
          </div>
        )}
        
        <div className="text-xs text-gray-500 mt-2 px-2 md:px-3 py-1 bg-gray-100 rounded-full inline-block border border-gray-200 font-medium">
          {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
        </div>
      </div>

      {/* User avatar */}
      {message.isUser && (
        <div className="hidden md:block flex-shrink-0">
          <div className="w-10 h-10 md:w-12 md:h-12 bg-gradient-to-br from-gray-600 to-gray-800 rounded-2xl flex items-center justify-center shadow-lg border-2 border-gray-400/30">
            <User className="w-5 h-5 md:w-6 md:h-6 text-white" />
          </div>
        </div>
      )}
    </div>
  );
};