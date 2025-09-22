import React from 'react';
import { useState, useEffect } from 'react';
import { Sparkles, Star, TrendingUp } from 'lucide-react';
import { Product } from '../types';
import { ProductCard } from './ProductCard';

interface FeaturedProductsProps {
  products: Product[];
  cachedProducts?: Product[];
  onAddToCart?: (productId: string, variantId: string) => void;
}

export const FeaturedProducts: React.FC<FeaturedProductsProps> = ({ products, cachedProducts = [], onAddToCart }) => {
  const [isCollapsed, setIsCollapsed] = useState(false);

  // Ne pas afficher si pas de produits valides
  const allProducts = [...products, ...cachedProducts];
  const validProducts = allProducts.filter(p => p && p.title && p.price > 0);
  
  if (validProducts.length === 0) {
    return null;
  }

  if (products.length === 0) {
    return (
      <div className="fixed bottom-20 right-4 z-30 lg:bottom-4">
        <button className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-600 rounded-full flex items-center justify-center shadow-2xl hover:scale-110 transition-all">
          <Sparkles className="w-6 h-6 text-white" />
        </button>
      </div>
    );
  }

  return (
    <div className="fixed bottom-20 right-4 z-30 lg:bottom-4">
      <div className="relative">
        <button 
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-600 rounded-full flex items-center justify-center shadow-2xl hover:scale-110 transition-all"
        >
          <Sparkles className="w-6 h-6 text-white" />
        </button>
        
        {/* Badge avec nombre de produits */}
        <div className="absolute -top-2 -right-2 w-6 h-6 bg-cyan-500 rounded-full flex items-center justify-center text-white text-xs font-bold">
          {validProducts.length}
        </div>
      </div>
    </div>
  );
};