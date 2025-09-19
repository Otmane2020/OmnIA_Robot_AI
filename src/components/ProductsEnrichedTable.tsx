import React, { useState, useEffect } from 'react';
import { 
  Search, Filter, Plus, Eye, Edit, Trash2, ExternalLink, 
  Package, Tag, DollarSign, Image, BarChart3, Settings,
  ChevronDown, ChevronUp, X, Save, AlertCircle, CheckCircle,
  Brain, Zap, Globe, TrendingUp
} from 'lucide-react';
import { useNotifications } from './NotificationSystem';

interface EnrichedProduct {
  id: string;
  handle: string;
  title: string;
  description: string;
  category: string;
  type: string;
  color: string;
  material: string;
  fabric: string;
  style: string;
  dimensions: string;
  room: string;
  price: number;
  stock_quantity: number;
  image_url: string;
  product_url: string;
  seo_title: string;
  seo_description: string;
  ad_headline: string;
  ad_description: string;
  google_product_category: string;
  gtin: string;
  brand: string;
  confidence_score: number;
  enriched_at: string;
  enrichment_source: string;
}

export const ProductsEnrichedTable: React.FC = () => {
  const [products, setProducts] = useState<EnrichedProduct[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<EnrichedProduct[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedSource, setSelectedSource] = useState('all');
  const [showFilters, setShowFilters] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isEnriching, setIsEnriching] = useState(false);
  const { showSuccess, showError, showInfo } = useNotifications();

  useEffect(() => {
    loadEnrichedProducts();
  }, []);

  const loadEnrichedProducts = () => {
    // Mock data - remplacez par vos vraies données depuis products_enriched
    const mockProducts: EnrichedProduct[] = [
      {
        id: 'enriched-1',
        handle: 'canape-alyana-beige',
        title: 'Canapé ALYANA convertible - Beige',
        description: 'Canapé d\'angle convertible 4 places en velours côtelé beige avec coffre de rangement',
        category: 'Canapé',
        type: 'Canapé d\'angle',
        color: 'Beige, Velours côtelé',
        material: 'Velours, Métal',
        fabric: 'Velours côtelé',
        style: 'Moderne, Contemporain',
        dimensions: '280x180x75cm',
        room: 'Salon',
        price: 799,
        stock_quantity: 100,
        image_url: 'https://cdn.shopify.com/s/files/1/0903/7578/2665/files/7_23a97631-68d2-4f3e-8f78-b26c7cd4c2ae.png',
        product_url: 'https://decorahome.fr/products/canape-dangle-convertible-et-reversible-4-places-en-velours-cotele',
        seo_title: 'Canapé Convertible ALYANA Beige - Design Moderne | Decora Home',
        seo_description: 'Découvrez le canapé convertible ALYANA en velours côtelé beige. Design moderne, 4 places, coffre de rangement. Livraison gratuite.',
        ad_headline: 'Canapé ALYANA Convertible',
        ad_description: 'Velours côtelé premium, 4 places, convertible avec coffre. Design moderne pour salon.',
        google_product_category: 'Furniture > Living Room Furniture > Sofas',
        gtin: '3701234567890',
        brand: 'Decora Home',
        confidence_score: 95,
        enriched_at: new Date().toISOString(),
        enrichment_source: 'vision_ai'
      },
      {
        id: 'enriched-2',
        handle: 'table-aurea-travertin',
        title: 'Table AUREA Ø100cm - Travertin',
        description: 'Table ronde en travertin naturel avec pieds métal noir',
        category: 'Table',
        type: 'Table à manger',
        color: 'Naturel, Travertin',
        material: 'Travertin, Métal noir',
        fabric: '',
        style: 'Moderne, Minéral',
        dimensions: 'Ø100x75cm',
        room: 'Salle à manger',
        price: 499,
        stock_quantity: 50,
        image_url: 'https://cdn.shopify.com/s/files/1/0903/7578/2665/files/3_e80b9a50-b032-4267-8f5b-f9130153e3be.png',
        product_url: 'https://decorahome.fr/products/table-a-manger-ronde-plateau-en-travertin-naturel-100-120-cm',
        seo_title: 'Table Ronde AUREA Travertin Ø100cm - Élégance Naturelle',
        seo_description: 'Table à manger ronde AUREA en travertin naturel. Design élégant, pieds métal noir. Parfaite pour 4 personnes.',
        ad_headline: 'Table AUREA Travertin',
        ad_description: 'Élégance naturelle, travertin authentique, design contemporain. Ø100cm.',
        google_product_category: 'Furniture > Tables > Dining Tables',
        gtin: '3701234567891',
        brand: 'Decora Home',
        confidence_score: 92,
        enriched_at: new Date().toISOString(),
        enrichment_source: 'manual'
      },
      {
        id: 'enriched-3',
        handle: 'chaise-inaya-gris',
        title: 'Chaise INAYA - Gris chenille',
        description: 'Chaise en tissu chenille avec pieds métal noir',
        category: 'Chaise',
        type: 'Chaise de salle à manger',
        color: 'Gris, Chenille',
        material: 'Chenille, Métal noir',
        fabric: 'Chenille',
        style: 'Contemporain, Design',
        dimensions: '45x55x85cm',
        room: 'Salle à manger',
        price: 99,
        stock_quantity: 96,
        image_url: 'https://cdn.shopify.com/s/files/1/0903/7578/2665/files/3_3f11d1af-8ce5-4d2d-a435-cd0a78eb92ee.png',
        product_url: 'https://decorahome.fr/products/chaise-en-tissu-serge-chenille-pieds-metal-noir-gris-clair-moka-et-beige',
        seo_title: 'Chaise INAYA Gris Chenille - Design Contemporain | Decora Home',
        seo_description: 'Chaise INAYA en tissu chenille gris avec pieds métal noir. Design contemporain et confort optimal.',
        ad_headline: 'Chaise INAYA Design',
        ad_description: 'Tissu chenille premium, pieds métal noir, design contemporain élégant.',
        google_product_category: 'Furniture > Chairs > Dining Chairs',
        gtin: '3701234567892',
        brand: 'Decora Home',
        confidence_score: 88,
        enriched_at: new Date().toISOString(),
        enrichment_source: 'ai_extraction'
      }
    ];

    setProducts(mockProducts);
    setFilteredProducts(mockProducts);
    setIsLoading(false);
  };

  const handleEnrichWithAI = async (productId: string) => {
    setIsEnriching(true);
    showInfo('Enrichissement IA', 'Analyse du produit avec intelligence artificielle...');

    try {
      // Simuler l'enrichissement IA
      await new Promise(resolve => setTimeout(resolve, 3000));

      setProducts(prev => prev.map(product => 
        product.id === productId 
          ? {
              ...product,
              confidence_score: Math.min(product.confidence_score + 10, 100),
              enriched_at: new Date().toISOString(),
              enrichment_source: 'ai_vision'
            }
          : product
      ));

      showSuccess(
        'Enrichissement terminé !',
        'Produit enrichi avec IA Vision. Attributs mis à jour automatiquement.',
        [
          {
            label: 'Voir Google Merchant',
            action: () => window.open('https://merchants.google.com', '_blank'),
            variant: 'primary'
          }
        ]
      );
    } catch (error) {
      showError('Erreur enrichissement', 'Impossible d\'enrichir le produit avec l\'IA.');
    } finally {
      setIsEnriching(false);
    }
  };

  const getConfidenceColor = (score: number) => {
    if (score >= 90) return 'bg-green-500/20 text-green-300';
    if (score >= 70) return 'bg-yellow-500/20 text-yellow-300';
    return 'bg-red-500/20 text-red-300';
  };

  const getSourceColor = (source: string) => {
    switch (source) {
      case 'vision_ai': return 'bg-purple-500/20 text-purple-300';
      case 'ai_extraction': return 'bg-blue-500/20 text-blue-300';
      case 'manual': return 'bg-orange-500/20 text-orange-300';
      default: return 'bg-gray-500/20 text-gray-300';
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-cyan-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-white text-lg">Chargement catalogue enrichi...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header avec stats */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-white">Catalogue Enrichi IA</h2>
          <p className="text-gray-300">{filteredProducts.length} produit(s) enrichi(s) • Score moyen: {Math.round(products.reduce((sum, p) => sum + p.confidence_score, 0) / products.length)}%</p>
        </div>
        
        <div className="flex flex-wrap gap-3">
          <button
            onClick={() => handleEnrichWithAI('all')}
            disabled={isEnriching}
            className="bg-gradient-to-r from-purple-500 to-pink-600 hover:from-purple-400 hover:to-pink-500 disabled:from-gray-600 disabled:to-gray-700 text-white px-4 py-2 rounded-xl flex items-center gap-2 font-semibold transition-all"
          >
            {isEnriching ? (
              <>
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                Enrichissement...
              </>
            ) : (
              <>
                <Brain className="w-4 h-4" />
                Enrichir avec IA
              </>
            )}
          </button>
          
          <button
            onClick={() => window.open('https://merchants.google.com', '_blank')}
            className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-xl flex items-center gap-2 transition-all"
          >
            <Globe className="w-4 h-4" />
            Google Merchant
          </button>
        </div>
      </div>

      {/* Barre de recherche et filtres */}
      <div className="bg-white/10 backdrop-blur-xl rounded-2xl p-6 border border-white/20">
        <div className="flex flex-col lg:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Rechercher par nom, catégorie, couleur, matériau..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-3 bg-black/40 border border-gray-600 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:border-cyan-400 focus:ring-2 focus:ring-cyan-400/30"
            />
          </div>
          
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-3 rounded-xl flex items-center gap-2 transition-all"
          >
            <Filter className="w-4 h-4" />
            Filtres
            {showFilters ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* Tableau enrichi */}
      <div className="bg-white/10 backdrop-blur-xl rounded-2xl border border-white/20 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-black/20">
              <tr>
                <th className="text-left p-4 text-cyan-300 font-semibold">Produit</th>
                <th className="text-left p-4 text-cyan-300 font-semibold">Attributs IA</th>
                <th className="text-left p-4 text-cyan-300 font-semibold">SEO</th>
                <th className="text-left p-4 text-cyan-300 font-semibold">Google Ads</th>
                <th className="text-left p-4 text-cyan-300 font-semibold">Score IA</th>
                <th className="text-left p-4 text-cyan-300 font-semibold">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredProducts.map((product) => (
                <tr key={product.id} className="border-b border-white/10 hover:bg-white/5">
                  <td className="p-4">
                    <div className="flex items-center gap-3">
                      <div className="w-16 h-16 rounded-lg overflow-hidden bg-gray-600 flex-shrink-0">
                        <img 
                          src={product.image_url} 
                          alt={product.title}
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            const target = e.target as HTMLImageElement;
                            target.src = 'https://images.pexels.com/photos/1350789/pexels-photo-1350789.jpeg';
                          }}
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="font-semibold text-white text-sm">{product.title}</div>
                        <div className="text-gray-400 text-xs">{product.category} • {product.brand}</div>
                        <div className="text-green-400 font-bold">{product.price}€</div>
                        <div className="text-gray-500 text-xs">Stock: {product.stock_quantity}</div>
                      </div>
                    </div>
                  </td>
                  
                  <td className="p-4">
                    <div className="space-y-1">
                      {product.color && (
                        <div className="flex flex-wrap gap-1">
                          {product.color.split(',').slice(0, 2).map((color, index) => (
                            <span key={index} className="bg-blue-500/20 text-blue-300 px-2 py-1 rounded text-xs">
                              {color.trim()}
                            </span>
                          ))}
                        </div>
                      )}
                      {product.material && (
                        <div className="flex flex-wrap gap-1">
                          {product.material.split(',').slice(0, 2).map((material, index) => (
                            <span key={index} className="bg-green-500/20 text-green-300 px-2 py-1 rounded text-xs">
                              {material.trim()}
                            </span>
                          ))}
                        </div>
                      )}
                      {product.style && (
                        <div className="flex flex-wrap gap-1">
                          {product.style.split(',').slice(0, 2).map((style, index) => (
                            <span key={index} className="bg-purple-500/20 text-purple-300 px-2 py-1 rounded text-xs">
                              {style.trim()}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  </td>
                  
                  <td className="p-4">
                    <div className="space-y-1 text-xs">
                      <div className="text-white font-medium">{product.seo_title.substring(0, 30)}...</div>
                      <div className="text-gray-400">{product.seo_description.substring(0, 40)}...</div>
                      <div className="text-cyan-400">GTIN: {product.gtin || 'Non défini'}</div>
                    </div>
                  </td>
                  
                  <td className="p-4">
                    <div className="space-y-1 text-xs">
                      <div className="text-white font-medium">{product.ad_headline}</div>
                      <div className="text-gray-400">{product.ad_description.substring(0, 40)}...</div>
                      <div className="text-orange-400">{product.google_product_category.split(' > ').pop()}</div>
                    </div>
                  </td>
                  
                  <td className="p-4">
                    <div className="text-center">
                      <span className={`px-3 py-1 rounded-full text-sm font-medium ${getConfidenceColor(product.confidence_score)}`}>
                        {product.confidence_score}%
                      </span>
                      <div className="text-xs text-gray-400 mt-1">
                        <span className={`px-2 py-1 rounded-full ${getSourceColor(product.enrichment_source)}`}>
                          {product.enrichment_source}
                        </span>
                      </div>
                    </div>
                  </td>
                  
                  <td className="p-4">
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleEnrichWithAI(product.id)}
                        className="text-purple-400 hover:text-purple-300 p-1"
                        title="Enrichir avec IA"
                      >
                        <Brain className="w-4 h-4" />
                      </button>
                      <button
                        className="text-blue-400 hover:text-blue-300 p-1"
                        title="Voir détails"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                      <button
                        className="text-yellow-400 hover:text-yellow-300 p-1"
                        title="Modifier"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <a
                        href={product.product_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-green-400 hover:text-green-300 p-1"
                        title="Ouvrir lien"
                      >
                        <ExternalLink className="w-4 h-4" />
                      </a>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Stats d'enrichissement */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-green-600/20 backdrop-blur-xl rounded-2xl p-6 border border-green-500/30">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-green-200 text-sm mb-1">Score moyen</p>
              <p className="text-2xl font-bold text-white">{Math.round(products.reduce((sum, p) => sum + p.confidence_score, 0) / products.length)}%</p>
              <p className="text-green-300 text-sm">Enrichissement IA</p>
            </div>
            <TrendingUp className="w-8 h-8 text-green-400" />
          </div>
        </div>
        
        <div className="bg-blue-600/20 backdrop-blur-xl rounded-2xl p-6 border border-blue-500/30">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-blue-200 text-sm mb-1">Avec GTIN</p>
              <p className="text-2xl font-bold text-white">{products.filter(p => p.gtin).length}</p>
              <p className="text-blue-300 text-sm">Google Shopping</p>
            </div>
            <Package className="w-8 h-8 text-blue-400" />
          </div>
        </div>
        
        <div className="bg-purple-600/20 backdrop-blur-xl rounded-2xl p-6 border border-purple-500/30">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-purple-200 text-sm mb-1">SEO optimisé</p>
              <p className="text-2xl font-bold text-white">{products.filter(p => p.seo_title && p.seo_description).length}</p>
              <p className="text-purple-300 text-sm">Référencement</p>
            </div>
            <Zap className="w-8 h-8 text-purple-400" />
          </div>
        </div>
        
        <div className="bg-orange-600/20 backdrop-blur-xl rounded-2xl p-6 border border-orange-500/30">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-orange-200 text-sm mb-1">Ads prêts</p>
              <p className="text-2xl font-bold text-white">{products.filter(p => p.ad_headline && p.ad_description).length}</p>
              <p className="text-orange-300 text-sm">Google Ads</p>
            </div>
            <Target className="w-8 h-8 text-orange-400" />
          </div>
        </div>
      </div>
    </div>
  );
};