import React, { useState, useEffect } from 'react';
import { ShoppingCart, Plus, Minus, Star, Heart, Eye, Filter, Search, ArrowLeft } from 'lucide-react';
import { Logo } from '../components/Logo';

interface Product {
  id: string;
  title: string;
  description: string;
  price: number;
  compareAtPrice?: number;
  image_url: string;
  category: string;
  vendor: string;
  stock: number;
  rating: number;
  reviews: number;
}

interface CartItem {
  id: string;
  productId: string;
  title: string;
  price: number;
  quantity: number;
  image_url: string;
}

export const Shop: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [showCart, setShowCart] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadProducts();
  }, []);

  const loadProducts = () => {
    // Produits Decora Home
    const decoraProducts: Product[] = [
      {
        id: 'decora-alyana-beige',
        title: 'Canapé ALYANA convertible - Beige',
        description: 'Canapé d\'angle convertible 4 places en velours côtelé beige avec coffre de rangement',
        price: 799,
        compareAtPrice: 1399,
        image_url: 'https://cdn.shopify.com/s/files/1/0903/7578/2665/files/7_23a97631-68d2-4f3e-8f78-b26c7cd4c2ae.png',
        category: 'Canapé',
        vendor: 'Decora Home',
        stock: 45,
        rating: 4.8,
        reviews: 127
      },
      {
        id: 'decora-aurea-100',
        title: 'Table AUREA Ø100cm - Travertin',
        description: 'Table ronde en travertin naturel avec pieds métal noir',
        price: 499,
        compareAtPrice: 859,
        image_url: 'https://cdn.shopify.com/s/files/1/0903/7578/2665/files/3_e80b9a50-b032-4267-8f5b-f9130153e3be.png',
        category: 'Table',
        vendor: 'Decora Home',
        stock: 30,
        rating: 4.9,
        reviews: 89
      },
      {
        id: 'decora-inaya-gris',
        title: 'Chaise INAYA - Gris chenille',
        description: 'Chaise en tissu chenille avec pieds métal noir',
        price: 99,
        compareAtPrice: 149,
        image_url: 'https://cdn.shopify.com/s/files/1/0903/7578/2665/files/3_3f11d1af-8ce5-4d2d-a435-cd0a78eb92ee.png',
        category: 'Chaise',
        vendor: 'Decora Home',
        stock: 96,
        rating: 4.7,
        reviews: 203
      },
      {
        id: 'decora-aurea-120',
        title: 'Table AUREA Ø120cm - Travertin',
        description: 'Table ronde en travertin naturel avec pieds métal noir - Grande taille',
        price: 549,
        compareAtPrice: 909,
        image_url: 'https://cdn.shopify.com/s/files/1/0903/7578/2665/files/2_89637aec-60b5-403f-9f0f-57c9a2fa42e4.png',
        category: 'Table',
        vendor: 'Decora Home',
        stock: 25,
        rating: 4.9,
        reviews: 67
      },
      {
        id: 'decora-inaya-moka',
        title: 'Chaise INAYA - Moka chenille',
        description: 'Chaise en tissu chenille moka avec pieds métal noir',
        price: 99,
        compareAtPrice: 149,
        image_url: 'https://cdn.shopify.com/s/files/1/0903/7578/2665/files/1_aae7ccd2-f2cb-4418-8c84-210ace00d753.png',
        category: 'Chaise',
        vendor: 'Decora Home',
        stock: 100,
        rating: 4.7,
        reviews: 156
      }
    ];

    setProducts(decoraProducts);
    setIsLoading(false);
  };

  const addToCart = (product: Product) => {
    const existingItem = cartItems.find(item => item.productId === product.id);
    
    if (existingItem) {
      setCartItems(prev => prev.map(item =>
        item.productId === product.id
          ? { ...item, quantity: item.quantity + 1 }
          : item
      ));
    } else {
      const newItem: CartItem = {
        id: Date.now().toString(),
        productId: product.id,
        title: product.title,
        price: product.price,
        quantity: 1,
        image_url: product.image_url
      };
      setCartItems(prev => [...prev, newItem]);
    }
  };

  const updateQuantity = (itemId: string, quantity: number) => {
    if (quantity === 0) {
      setCartItems(prev => prev.filter(item => item.id !== itemId));
    } else {
      setCartItems(prev => prev.map(item =>
        item.id === itemId ? { ...item, quantity } : item
      ));
    }
  };

  const getTotalPrice = () => {
    return cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  };

  const getTotalItems = () => {
    return cartItems.reduce((sum, item) => sum + item.quantity, 0);
  };

  const handleCheckout = () => {
    // Redirection vers Stripe Checkout
    alert(`Redirection vers Stripe Checkout pour ${getTotalPrice().toFixed(2)}€`);
  };

  const filteredProducts = products.filter(product => {
    const matchesSearch = searchTerm === '' || 
      product.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.description.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesCategory = selectedCategory === 'all' || product.category === selectedCategory;
    
    return matchesSearch && matchesCategory;
  });

  const categories = [...new Set(products.map(p => p.category))];

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-purple-900 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-cyan-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-white text-lg">Chargement de la boutique...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-purple-900">
      {/* Header */}
      <header className="bg-black/20 backdrop-blur-xl border-b border-white/10 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center gap-4">
              <button
                onClick={() => window.location.href = '/admin'}
                className="flex items-center gap-2 text-cyan-400 hover:text-cyan-300 transition-colors"
              >
                <ArrowLeft className="w-4 h-4" />
                Admin
              </button>
              <Logo size="md" />
            </div>
            
            <div className="flex items-center gap-4">
              {/* Panier */}
              <button
                onClick={() => setShowCart(!showCart)}
                className="relative p-3 bg-gradient-to-r from-emerald-500 to-green-600 hover:from-emerald-400 hover:to-green-500 text-white rounded-xl transition-all shadow-xl shadow-emerald-500/40"
              >
                <ShoppingCart className="w-6 h-6" />
                {getTotalItems() > 0 && (
                  <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs font-bold rounded-full w-6 h-6 flex items-center justify-center">
                    {getTotalItems()}
                  </span>
                )}
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Hero Section */}
        <div className="text-center mb-16">
          <h1 className="text-4xl md:text-6xl font-bold text-white mb-6">
            Boutique Decora Home
            <span className="block bg-gradient-to-r from-cyan-400 via-blue-400 to-purple-400 bg-clip-text text-transparent">
              Mobilier Design
            </span>
          </h1>
          <p className="text-xl text-gray-300 max-w-3xl mx-auto">
            Découvrez notre collection exclusive de mobilier moderne et contemporain
          </p>
        </div>

        {/* Filtres */}
        <div className="bg-white/10 backdrop-blur-xl rounded-2xl p-6 border border-white/20 mb-12">
          <div className="flex flex-col lg:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Rechercher un produit..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-3 bg-black/40 border border-gray-600 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:border-cyan-400"
              />
            </div>
            
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="bg-black/40 border border-gray-600 rounded-xl px-4 py-3 text-white"
            >
              <option value="all">Toutes les catégories</option>
              {categories.map(category => (
                <option key={category} value={category}>{category}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Grille de produits */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredProducts.map((product) => (
            <div key={product.id} className="bg-white/10 backdrop-blur-xl rounded-2xl p-6 border border-white/20 hover:border-cyan-500/50 transition-all hover:scale-105">
              <div className="relative mb-4">
                <div className="w-full h-64 rounded-xl overflow-hidden bg-gray-600">
                  <img 
                    src={product.image_url} 
                    alt={product.title}
                    className="w-full h-full object-cover"
                  />
                </div>
                <button className="absolute top-3 right-3 p-2 bg-black/50 rounded-full text-white hover:bg-black/70 transition-all">
                  <Heart className="w-4 h-4" />
                </button>
              </div>
              
              <div className="mb-4">
                <h3 className="font-bold text-white text-lg mb-2">{product.title}</h3>
                <p className="text-gray-300 text-sm mb-3 line-clamp-2">{product.description}</p>
                
                <div className="flex items-center gap-2 mb-3">
                  <div className="flex items-center gap-1">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className={`w-4 h-4 ${i < Math.floor(product.rating) ? 'text-yellow-400 fill-current' : 'text-gray-400'}`} />
                    ))}
                  </div>
                  <span className="text-gray-400 text-sm">({product.reviews})</span>
                </div>
                
                <div className="flex items-center gap-2 mb-4">
                  <span className="text-2xl font-bold text-green-400">{product.price}€</span>
                  {product.compareAtPrice && (
                    <>
                      <span className="text-gray-400 line-through">{product.compareAtPrice}€</span>
                      <span className="bg-red-500/20 text-red-300 px-2 py-1 rounded-full text-xs">
                        -{Math.round(((product.compareAtPrice - product.price) / product.compareAtPrice) * 100)}%
                      </span>
                    </>
                  )}
                </div>
                
                <div className="text-gray-300 text-sm mb-4">
                  Stock: <span className={product.stock > 0 ? 'text-green-400' : 'text-red-400'}>{product.stock}</span>
                </div>
              </div>
              
              <div className="flex gap-2">
                <button
                  onClick={() => addToCart(product)}
                  disabled={product.stock === 0}
                  className="flex-1 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 disabled:from-gray-600 disabled:to-gray-700 text-white py-3 rounded-xl font-semibold transition-all disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  <ShoppingCart className="w-4 h-4" />
                  Ajouter au panier
                </button>
                <button className="p-3 bg-white/10 hover:bg-white/20 text-white rounded-xl transition-all">
                  <Eye className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Panier latéral */}
      {showCart && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex justify-end">
          <div className="w-full max-w-md bg-white h-full overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-gray-800">Panier ({getTotalItems()})</h2>
                <button
                  onClick={() => setShowCart(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              {cartItems.length === 0 ? (
                <div className="text-center py-12">
                  <ShoppingCart className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600">Votre panier est vide</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {cartItems.map((item) => (
                    <div key={item.id} className="flex gap-4 p-4 bg-gray-50 rounded-xl">
                      <div className="w-16 h-16 rounded-lg overflow-hidden bg-gray-200">
                        <img 
                          src={item.image_url} 
                          alt={item.title}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div className="flex-1">
                        <h4 className="font-semibold text-gray-800 mb-2">{item.title}</h4>
                        <div className="flex items-center justify-between">
                          <span className="text-green-600 font-bold">{item.price}€</span>
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => updateQuantity(item.id, item.quantity - 1)}
                              className="w-8 h-8 bg-red-500 hover:bg-red-600 text-white rounded-full flex items-center justify-center"
                            >
                              <Minus className="w-4 h-4" />
                            </button>
                            <span className="w-8 text-center font-bold">{item.quantity}</span>
                            <button
                              onClick={() => updateQuantity(item.id, item.quantity + 1)}
                              className="w-8 h-8 bg-green-500 hover:bg-green-600 text-white rounded-full flex items-center justify-center"
                            >
                              <Plus className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                  
                  <div className="border-t pt-4">
                    <div className="flex justify-between items-center mb-4">
                      <span className="text-xl font-bold text-gray-800">Total</span>
                      <span className="text-2xl font-bold text-green-600">{getTotalPrice().toFixed(2)}€</span>
                    </div>
                    <button
                      onClick={handleCheckout}
                      className="w-full bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-400 hover:to-emerald-500 text-white py-4 rounded-xl font-bold transition-all shadow-xl"
                    >
                      Payer avec Stripe
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};