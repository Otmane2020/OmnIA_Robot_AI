import React, { useState, useEffect } from 'react';
import { 
  ShoppingBag, Download, ExternalLink, Copy, CheckCircle, 
  AlertCircle, BarChart3, Globe, Target, Zap, Eye, Settings,
  TrendingUp, Package, Image, FileText, Link, RefreshCw
} from 'lucide-react';
import { useNotifications } from './NotificationSystem';

interface GoogleMerchantStats {
  total_products: number;
  active_products: number;
  products_with_images: number;
  products_with_gtin: number;
  avg_price: number;
  categories_count: number;
  last_sync: string;
}

interface MerchantProduct {
  id: string;
  title: string;
  description: string;
  price: string;
  availability: 'in stock' | 'out of stock';
  condition: 'new' | 'used' | 'refurbished';
  brand: string;
  image_link: string;
  link: string;
  google_product_category: string;
  product_type: string;
  color?: string;
  material?: string;
  size?: string;
  custom_label_0?: string;
  custom_label_1?: string;
  custom_label_2?: string;
  custom_label_3?: string;
}

export const GoogleMerchantTab: React.FC = () => {
  const [stats, setStats] = useState<GoogleMerchantStats>({
    total_products: 247,
    active_products: 235,
    products_with_images: 230,
    products_with_gtin: 180,
    avg_price: 425,
    categories_count: 8,
    last_sync: new Date().toISOString()
  });
  
  const [feedUrl, setFeedUrl] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [merchantProducts, setMerchantProducts] = useState<MerchantProduct[]>([]);
  const { showSuccess, showError, showInfo } = useNotifications();

  useEffect(() => {
    generateFeedUrl();
    loadMerchantProducts();
  }, []);

  const generateFeedUrl = () => {
    const baseUrl = window.location.origin;
    const generatedUrl = `${baseUrl}/api/google-merchant-feed.xml`;
    setFeedUrl(generatedUrl);
  };

  const loadMerchantProducts = () => {
    // Mock data - remplacez par vos vraies données
    const mockProducts: MerchantProduct[] = [
      {
        id: 'decora-canape-alyana-beige',
        title: 'Canapé ALYANA convertible - Beige',
        description: 'Canapé d\'angle convertible 4 places en velours côtelé beige avec coffre de rangement',
        price: '799.00 EUR',
        availability: 'in stock',
        condition: 'new',
        brand: 'Decora Home',
        image_link: 'https://cdn.shopify.com/s/files/1/0903/7578/2665/files/7_23a97631-68d2-4f3e-8f78-b26c7cd4c2ae.png',
        link: 'https://decorahome.fr/products/canape-dangle-convertible-et-reversible-4-places-en-velours-cotele',
        google_product_category: 'Furniture > Living Room Furniture > Sofas',
        product_type: 'Canapé > Canapé d\'angle',
        color: 'Beige',
        material: 'Velours côtelé',
        custom_label_0: 'Convertible',
        custom_label_1: 'Salon',
        custom_label_2: 'Premium',
        custom_label_3: 'Decora Home'
      },
      {
        id: 'decora-table-aurea-100',
        title: 'Table AUREA Ø100cm - Travertin',
        description: 'Table ronde en travertin naturel avec pieds métal noir',
        price: '499.00 EUR',
        availability: 'in stock',
        condition: 'new',
        brand: 'Decora Home',
        image_link: 'https://cdn.shopify.com/s/files/1/0903/7578/2665/files/3_e80b9a50-b032-4267-8f5b-f9130153e3be.png',
        link: 'https://decorahome.fr/products/table-a-manger-ronde-plateau-en-travertin-naturel-100-120-cm',
        google_product_category: 'Furniture > Tables > Dining Tables',
        product_type: 'Table > Table à manger',
        color: 'Naturel',
        material: 'Travertin',
        size: 'Ø100cm',
        custom_label_0: 'Ronde',
        custom_label_1: 'Salle à manger',
        custom_label_2: 'Premium',
        custom_label_3: 'Decora Home'
      },
      {
        id: 'decora-chaise-inaya-gris',
        title: 'Chaise INAYA - Gris chenille',
        description: 'Chaise en tissu chenille avec pieds métal noir',
        price: '99.00 EUR',
        availability: 'in stock',
        condition: 'new',
        brand: 'Decora Home',
        image_link: 'https://cdn.shopify.com/s/files/1/0903/7578/2665/files/3_3f11d1af-8ce5-4d2d-a435-cd0a78eb92ee.png',
        link: 'https://decorahome.fr/products/chaise-en-tissu-serge-chenille-pieds-metal-noir-gris-clair-moka-et-beige',
        google_product_category: 'Furniture > Chairs > Dining Chairs',
        product_type: 'Chaise > Chaise de salle à manger',
        color: 'Gris',
        material: 'Chenille',
        custom_label_0: 'Design',
        custom_label_1: 'Salle à manger',
        custom_label_2: 'Standard',
        custom_label_3: 'Decora Home'
      }
    ];
    
    setMerchantProducts(mockProducts);
  };

  const handleGenerateFeed = async () => {
    setIsGenerating(true);
    showInfo('Génération flux', 'Création du flux Google Merchant en cours...');

    try {
      // Simuler la génération
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      showSuccess(
        'Flux généré !',
        'Flux Google Merchant créé avec succès ! Copiez l\'URL dans Google Merchant Center.',
        [
          {
            label: 'Copier URL',
            action: () => {
              navigator.clipboard.writeText(feedUrl);
              showSuccess('URL copiée', 'URL du flux copiée dans le presse-papiers !');
            },
            variant: 'primary'
          },
          {
            label: 'Ouvrir Google Merchant',
            action: () => window.open('https://merchants.google.com', '_blank'),
            variant: 'secondary'
          }
        ]
      );
    } catch (error) {
      showError('Erreur génération', 'Impossible de générer le flux Google Merchant.');
    } finally {
      setIsGenerating(false);
    }
  };

  const copyFeedUrl = () => {
    navigator.clipboard.writeText(feedUrl);
    showSuccess('URL copiée', 'URL du flux copiée dans le presse-papiers !');
  };

  return (
    <div className="space-y-8">
      {/* Header avec stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-blue-600/20 backdrop-blur-xl rounded-2xl p-6 border border-blue-500/30">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-blue-200 text-sm mb-1">Produits actifs</p>
              <p className="text-3xl font-bold text-white mb-1">{stats.active_products}</p>
              <p className="text-blue-300 text-sm">Sur {stats.total_products} total</p>
            </div>
            <Package className="w-10 h-10 text-blue-400" />
          </div>
        </div>
        
        <div className="bg-green-600/20 backdrop-blur-xl rounded-2xl p-6 border border-green-500/30">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-green-200 text-sm mb-1">Avec images</p>
              <p className="text-3xl font-bold text-white mb-1">{stats.products_with_images}</p>
              <p className="text-green-300 text-sm">{Math.round((stats.products_with_images / stats.total_products) * 100)}% couverture</p>
            </div>
            <Image className="w-10 h-10 text-green-400" />
          </div>
        </div>
        
        <div className="bg-purple-600/20 backdrop-blur-xl rounded-2xl p-6 border border-purple-500/30">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-purple-200 text-sm mb-1">Prix moyen</p>
              <p className="text-3xl font-bold text-white mb-1">€{stats.avg_price}</p>
              <p className="text-purple-300 text-sm">Catalogue</p>
            </div>
            <Target className="w-10 h-10 text-purple-400" />
          </div>
        </div>
        
        <div className="bg-orange-600/20 backdrop-blur-xl rounded-2xl p-6 border border-orange-500/30">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-orange-200 text-sm mb-1">Catégories</p>
              <p className="text-3xl font-bold text-white mb-1">{stats.categories_count}</p>
              <p className="text-orange-300 text-sm">Organisées</p>
            </div>
            <BarChart3 className="w-10 h-10 text-orange-400" />
          </div>
        </div>
      </div>

      {/* Configuration du flux */}
      <div className="bg-white/10 backdrop-blur-xl rounded-2xl p-8 border border-white/20">
        <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
          <Globe className="w-6 h-6 text-green-400" />
          Configuration Google Merchant Center
        </h3>
        
        <div className="space-y-6">
          <div className="bg-green-500/20 border border-green-400/50 rounded-xl p-6">
            <h4 className="font-semibold text-green-200 mb-3 flex items-center gap-2">
              <CheckCircle className="w-5 h-5" />
              ✅ Flux automatique configuré
            </h4>
            <div className="space-y-3">
              <div>
                <label className="block text-sm text-green-300 mb-2">URL du flux XML :</label>
                <div className="flex gap-3">
                  <input
                    type="text"
                    value={feedUrl}
                    readOnly
                    className="flex-1 bg-black/40 border border-green-500/50 rounded-xl px-4 py-3 text-white font-mono text-sm"
                  />
                  <button
                    onClick={copyFeedUrl}
                    className="bg-green-600 hover:bg-green-700 text-white px-4 py-3 rounded-xl flex items-center gap-2 transition-all"
                  >
                    <Copy className="w-4 h-4" />
                    Copier
                  </button>
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm text-green-300 mb-2">Format :</label>
                  <select className="w-full bg-black/40 border border-green-500/50 rounded-xl px-4 py-3 text-white">
                    <option value="xml">XML (Recommandé)</option>
                    <option value="csv">CSV</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm text-green-300 mb-2">Fréquence de mise à jour :</label>
                  <select className="w-full bg-black/40 border border-green-500/50 rounded-xl px-4 py-3 text-white">
                    <option value="daily">Quotidienne (Recommandé)</option>
                    <option value="weekly">Hebdomadaire</option>
                    <option value="manual">Manuelle</option>
                  </select>
                </div>
              </div>
            </div>
          </div>

          <div className="flex gap-4">
            <button
              onClick={handleGenerateFeed}
              disabled={isGenerating}
              className="bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-400 hover:to-emerald-500 disabled:from-gray-600 disabled:to-gray-700 text-white px-6 py-3 rounded-xl font-semibold transition-all flex items-center gap-2"
            >
              {isGenerating ? (
                <>
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Génération...
                </>
              ) : (
                <>
                  <RefreshCw className="w-5 h-5" />
                  Régénérer le flux
                </>
              )}
            </button>
            
            <button
              onClick={() => setShowPreview(!showPreview)}
              className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-xl font-semibold transition-all flex items-center gap-2"
            >
              <Eye className="w-5 h-5" />
              {showPreview ? 'Masquer' : 'Aperçu'} produits
            </button>
            
            <button
              onClick={() => window.open('https://merchants.google.com', '_blank')}
              className="bg-orange-600 hover:bg-orange-700 text-white px-6 py-3 rounded-xl font-semibold transition-all flex items-center gap-2"
            >
              <ExternalLink className="w-5 h-5" />
              Google Merchant Center
            </button>
          </div>
        </div>
      </div>

      {/* Instructions de configuration */}
      <div className="bg-white/10 backdrop-blur-xl rounded-2xl p-8 border border-white/20">
        <h3 className="text-xl font-bold text-white mb-6">📋 Instructions Google Merchant Center</h3>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div>
            <h4 className="font-semibold text-cyan-300 mb-4">🚀 Configuration initiale :</h4>
            <ol className="text-cyan-200 space-y-3 text-sm">
              <li className="flex items-start gap-3">
                <span className="bg-cyan-500 text-white w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0">1</span>
                <div>
                  <strong>Créer un compte Google Merchant Center</strong>
                  <p className="text-cyan-300 text-xs mt-1">Rendez-vous sur merchants.google.com</p>
                </div>
              </li>
              <li className="flex items-start gap-3">
                <span className="bg-cyan-500 text-white w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0">2</span>
                <div>
                  <strong>Ajouter votre site web</strong>
                  <p className="text-cyan-300 text-xs mt-1">Vérifier et revendiquer votre domaine</p>
                </div>
              </li>
              <li className="flex items-start gap-3">
                <span className="bg-cyan-500 text-white w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0">3</span>
                <div>
                  <strong>Configurer les informations entreprise</strong>
                  <p className="text-cyan-300 text-xs mt-1">Adresse, contact, politique retours</p>
                </div>
              </li>
              <li className="flex items-start gap-3">
                <span className="bg-cyan-500 text-white w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0">4</span>
                <div>
                  <strong>Ajouter le flux produits</strong>
                  <p className="text-cyan-300 text-xs mt-1">Coller l'URL générée ci-dessus</p>
                </div>
              </li>
            </ol>
          </div>
          
          <div>
            <h4 className="font-semibold text-green-300 mb-4">📈 Optimisations automatiques :</h4>
            <ul className="text-green-200 space-y-2 text-sm">
              <li className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-green-400" />
                <strong>Catégories Google :</strong> Mapping automatique
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-green-400" />
                <strong>Attributs enrichis :</strong> Couleur, matériau, style
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-green-400" />
                <strong>Images optimisées :</strong> URLs valides et accessibles
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-green-400" />
                <strong>Prix dynamiques :</strong> Promotions et prix barrés
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-green-400" />
                <strong>Stock temps réel :</strong> Disponibilité automatique
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-green-400" />
                <strong>SEO optimisé :</strong> Titres et descriptions
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* Aperçu des produits */}
      {showPreview && (
        <div className="bg-white/10 backdrop-blur-xl rounded-2xl p-8 border border-white/20">
          <h3 className="text-xl font-bold text-white mb-6">Aperçu du flux Google Merchant</h3>
          
          <div className="space-y-4 max-h-96 overflow-y-auto">
            {merchantProducts.map((product) => (
              <div key={product.id} className="bg-black/20 rounded-xl p-4 border border-white/10">
                <div className="flex gap-4">
                  <div className="w-16 h-16 rounded-lg overflow-hidden bg-gray-600 flex-shrink-0">
                    <img 
                      src={product.image_link} 
                      alt={product.title}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        target.src = 'https://images.pexels.com/photos/1350789/pexels-photo-1350789.jpeg';
                      }}
                    />
                  </div>
                  <div className="flex-1">
                    <div className="flex justify-between items-start mb-2">
                      <h4 className="font-semibold text-white">{product.title}</h4>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        product.availability === 'in stock' 
                          ? 'bg-green-500/20 text-green-300' 
                          : 'bg-red-500/20 text-red-300'
                      }`}>
                        {product.availability}
                      </span>
                    </div>
                    <p className="text-gray-300 text-sm mb-2">{product.google_product_category}</p>
                    <div className="flex items-center justify-between">
                      <span className="text-green-400 font-bold">{product.price}</span>
                      <div className="flex gap-2">
                        {product.color && (
                          <span className="bg-blue-500/20 text-blue-300 px-2 py-1 rounded text-xs">
                            {product.color}
                          </span>
                        )}
                        {product.material && (
                          <span className="bg-purple-500/20 text-purple-300 px-2 py-1 rounded text-xs">
                            {product.material}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Diagnostic et optimisations */}
      <div className="bg-white/10 backdrop-blur-xl rounded-2xl p-8 border border-white/20">
        <h3 className="text-xl font-bold text-white mb-6">🔍 Diagnostic du flux</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-green-500/20 rounded-xl border border-green-400/30">
              <span className="text-green-300">Images produits</span>
              <div className="flex items-center gap-2">
                <CheckCircle className="w-5 h-5 text-green-400" />
                <span className="text-green-400 font-bold">{Math.round((stats.products_with_images / stats.total_products) * 100)}%</span>
              </div>
            </div>
            
            <div className="flex items-center justify-between p-4 bg-yellow-500/20 rounded-xl border border-yellow-400/30">
              <span className="text-yellow-300">Codes GTIN</span>
              <div className="flex items-center gap-2">
                <AlertCircle className="w-5 h-5 text-yellow-400" />
                <span className="text-yellow-400 font-bold">{Math.round((stats.products_with_gtin / stats.total_products) * 100)}%</span>
              </div>
            </div>
            
            <div className="flex items-center justify-between p-4 bg-green-500/20 rounded-xl border border-green-400/30">
              <span className="text-green-300">Catégories Google</span>
              <div className="flex items-center gap-2">
                <CheckCircle className="w-5 h-5 text-green-400" />
                <span className="text-green-400 font-bold">100%</span>
              </div>
            </div>
          </div>
          
          <div className="space-y-4">
            <div className="bg-blue-500/20 border border-blue-400/50 rounded-xl p-4">
              <h4 className="font-semibold text-blue-200 mb-2">🎯 Recommandations :</h4>
              <ul className="text-blue-300 text-sm space-y-1">
                <li>• Ajouter des codes GTIN pour améliorer la visibilité</li>
                <li>• Optimiser les descriptions avec mots-clés</li>
                <li>• Utiliser les custom labels pour le ciblage</li>
                <li>• Configurer les promotions saisonnières</li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      {/* Actions rapides */}
      <div className="bg-gradient-to-r from-cyan-500/20 to-blue-600/20 backdrop-blur-xl rounded-2xl p-6 border border-cyan-400/30">
        <h3 className="text-lg font-bold text-white mb-4">Actions rapides</h3>
        <div className="flex flex-wrap gap-4">
          <button
            onClick={() => window.open(`${feedUrl}?format=xml`, '_blank')}
            className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-xl flex items-center gap-2 transition-all"
          >
            <Download className="w-4 h-4" />
            Télécharger XML
          </button>
          <button
            onClick={() => window.open(`${feedUrl}?format=csv`, '_blank')}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-xl flex items-center gap-2 transition-all"
          >
            <Download className="w-4 h-4" />
            Télécharger CSV
          </button>
          <button
            onClick={() => window.open('https://support.google.com/merchants/answer/7052112', '_blank')}
            className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-xl flex items-center gap-2 transition-all"
          >
            <FileText className="w-4 h-4" />
            Guide Google
          </button>
        </div>
      </div>
    </div>
  );
};