import React, { useState } from 'react';
import { ShoppingCart, X, Plus, Minus, ExternalLink } from 'lucide-react';

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

interface CartButtonProps {
  items: CartItem[];
  onUpdateQuantity: (itemId: string, quantity: number) => void;
  onRemoveItem: (itemId: string) => void;
  onCheckout: () => void;
}

export const CartButton: React.FC<CartButtonProps> = ({ 
  items, 
  onUpdateQuantity, 
  onRemoveItem, 
  onCheckout 
}) => {
  const [isOpen, setIsOpen] = useState(false);
  
  const totalItems = items.reduce((sum, item) => sum + item.quantity, 0);
  const totalPrice = items.reduce((sum, item) => sum + (item.price * item.quantity), 0);

  if (totalItems === 0) {
    return (
      <button
        className="relative p-2 sm:p-3 bg-slate-700/50 hover:bg-slate-600/50 text-gray-400 rounded-xl transition-all border border-slate-600/50"
        title="Panier vide"
      >
        <ShoppingCart className="w-4 h-4 sm:w-5 sm:h-5" />
      </button>
    );
  }

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 sm:p-3 bg-gradient-to-r from-emerald-500 to-green-600 hover:from-emerald-400 hover:to-green-500 text-white rounded-xl transition-all border border-emerald-400 shadow-lg hover:shadow-emerald-500/50 hover:scale-105"
        title={`${totalItems} article${totalItems > 1 ? 's' : ''} - ${totalPrice.toFixed(2)}€`}
      >
        <ShoppingCart className="w-4 h-4 sm:w-5 sm:h-5" />
        <span className="absolute -top-1 -right-1 sm:-top-2 sm:-right-2 bg-red-500 text-white text-xs font-bold rounded-full w-5 h-5 sm:w-6 sm:h-6 flex items-center justify-center animate-bounce border-2 border-white">
          {totalItems}
        </span>
      </button>

      {isOpen && (
        <div className="absolute top-full right-0 mt-2 w-80 sm:w-96 bg-gradient-to-br from-white to-gray-50 backdrop-blur-xl rounded-2xl border border-gray-200 shadow-2xl z-50">
          <div className="p-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-gray-800">🛒 Panier ({totalItems})</h3>
              <button
                onClick={() => setIsOpen(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 max-h-60 sm:max-h-80 overflow-y-auto">
              {items.map((item) => (
                <div key={item.id} className="flex gap-3 p-3 bg-gradient-to-r from-gray-50 to-white rounded-xl border border-gray-200 shadow-sm">
                  <div className="w-16 h-16 rounded-lg overflow-hidden bg-gray-600 flex-shrink-0">
                    <img 
                      src={item.image_url} 
                      alt={item.title}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        target.src = 'https://images.pexels.com/photos/1350789/pexels-photo-1350789.jpeg';
                      }}
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="font-semibold text-gray-800 text-sm mb-1 line-clamp-2">{item.title}</h4>
                    <div className="flex items-center justify-between">
                      <span className="text-emerald-600 font-bold">{item.price}€</span>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => onUpdateQuantity(item.id, Math.max(0, item.quantity - 1))}
                          className="w-6 h-6 bg-red-500 hover:bg-red-600 text-white rounded-full flex items-center justify-center transition-all hover:scale-110 border border-red-400"
                        >
                          <Minus className="w-3 h-3" />
                        </button>
                        <span className="text-gray-800 font-bold w-8 text-center">{item.quantity}</span>
                        <button
                          onClick={() => onUpdateQuantity(item.id, item.quantity + 1)}
                          className="w-6 h-6 bg-emerald-500 hover:bg-emerald-600 text-white rounded-full flex items-center justify-center transition-all hover:scale-110 border border-emerald-400"
                        >
                          <Plus className="w-3 h-3" />
                        </button>
                      </div>
                    </div>
                    <div className="flex items-center justify-between mt-2">
                      <button
                        onClick={() => onRemoveItem(item.id)}
                        className="text-xs text-red-600 hover:text-red-700 font-medium"
                      >
                        Supprimer
                      </button>
                      <a
                        href={item.product_url}
                        target="_blank"
                        className="text-xs text-blue-600 hover:text-blue-700 flex items-center gap-1 font-medium"
                      >
                        <ExternalLink className="w-3 h-3" />
                        Voir
                      </a>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="border-t border-gray-200 pt-4 mt-4">
              <div className="flex items-center justify-between mb-4">
                <span className="text-lg font-bold text-gray-800">Total</span>
                <span className="text-2xl font-bold text-emerald-600">{totalPrice.toFixed(2)}€</span>
              </div>
              <button
                onClick={onCheckout}
                className="w-full bg-gradient-to-r from-emerald-500 to-green-600 hover:from-emerald-400 hover:to-green-500 text-white py-4 rounded-xl font-bold transition-all shadow-lg hover:shadow-emerald-500/50 flex items-center justify-center gap-2 hover:scale-105"
              >
                <ShoppingCart className="w-4 h-4" />
                🚀 Commander maintenant
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};