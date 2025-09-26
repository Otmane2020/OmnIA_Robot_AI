import React, { useState, useEffect } from 'react';
import { ShoppingBag, CheckCircle, AlertCircle, Upload, Download, Eye, Settings, TrendingUp, Package, Star } from 'lucide-react';

interface GoogleMerchantProduct {
  id: string;
  title: string;
  description: string;
  price: number;
  availability: 'in stock' | 'out of stock' | 'preorder';
  condition: 'new' | 'used' | 'refurbished';
  brand: string;
  gtin: string;
  mpn: string;
  google_product_category: string;
  product_type: string;
  image_link: string;
  additional_image_links: string[];
  status: 'approved' | 'pending' | 'disapproved';
  impressions: number;
  clicks: number;
  ctr: number;
}

interface GoogleMerchantTabProps {
  retailerId: string;
  companyName: string;
}

export const GoogleMerchantTab: React.FC<GoogleMerchantTabProps> = ({ retailerId, companyName }) => {
  const [products, setProducts] = useState<GoogleMerchantProduct[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedProduct, setSelectedProduct] = useState<GoogleMerchantProduct | null>(null);
  const [feedStatus, setFeedStatus] = useState({
    lastUpdate: new Date(),
    totalProducts: 0,
    approvedProducts: 0,
    pendingProducts: 0,
    disapprovedProducts: 0
  });

  useEffect(() => {
    loadGoogleMerchantData();
  }, []);

  const loadGoogleMerchantData = async () => {
    try {
      setIsLoading(true);
      
      // Simuler des produits Google Merchant
      const mockProducts: GoogleMerchantProduct[] = [
        {
          id: 'gmc-1',
          title: 'Canapé ALYANA 3 places en velours bleu',
          description: 'Canapé moderne 3 places en velours bleu avec pieds en bois massif',
          price: 899,
          availability: 'in stock',
          condition: 'new',
          brand: companyName,
          gtin: '3700123456789',
          mpn: 'ALYANA-3P-BLUE',
          google_product_category: 'Furniture > Living Room Furniture > Sofas',
          product_type: 'Canapés > Canapés 3 places',
          image_link: 'https://images.pexels.com/photos/1350789/pexels-photo-1350789.jpeg',
          additional_image_links: [],
          status: 'approved',
          impressions: 12450,
          clicks: 234,
          ctr: 1.88
        },
        {
          id: 'gmc-2',
          title: 'Table basse AUREA en chêne massif',
          description: 'Table basse design en chêne massif avec finition naturelle',
          price: 449,
          availability: 'in stock',
          condition: 'new',
          brand: companyName,
          gtin: '3700123456790',
          mpn: 'AUREA-TB-OAK',
          google_product_category: 'Furniture > Living Room Furniture > Coffee Tables',
          product_type: 'Tables > Tables basses',
          image_link: 'https://images.pexels.com/photos/1571460/pexels-photo-1571460.jpeg',
          additional_image_links: [],
          status: 'pending',
          impressions: 8920,
          clicks: 156,
          ctr: 1.75
        },
        {
          id: 'gmc-3',
          title: 'Chaise INAYA en tissu gris',
          description: 'Chaise moderne en tissu gris avec structure métallique',
          price: 129,
          availability: 'out of stock',
          condition: 'new',
          brand: companyName,
          gtin: '3700123456791',
          mpn: 'INAYA-CH-GREY',
          google_product_category: 'Furniture > Chairs > Dining Chairs',
          product_type: 'Chaises > Chaises de salle à manger',
          image_link: 'https://images.pexels.com/photos/586763/pexels-photo-586763.jpeg',
          additional_image_links: [],
          status: 'disapproved',
          impressions: 0,
          clicks: 0,
          ctr: 0
        }
      ];
      
      setProducts(mockProducts);
      
      // Calculer les statistiques du feed
      setFeedStatus({
        lastUpdate: new Date(),
        totalProducts: mockProducts.length,
        approvedProducts: mockProducts.filter(p => p.status === 'approved').length,
        pendingProducts: mockProducts.filter(p => p.status === 'pending').length,
        disapprovedProducts: mockProducts.filter(p => p.status === 'disapproved').length
      });
      
    } catch (error) {
      console.error('Erreur chargement Google Merchant:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'approved': return 'bg-green-500/20 text-green-300 border-green-400/50';
      case 'pending': return 'bg-yellow-500/20 text-yellow-300 border-yellow-400/50';
      case 'disapproved': return 'bg-red-500/20 text-red-300 border-red-400/50';
      default: return 'bg-gray-500/20 text-gray-300 border-gray-400/50';
    }
  };

  const getAvailabilityColor = (availability: string) => {
    switch (availability) {
      case 'in stock': return 'text-green-400';
      case 'out of stock': return 'text-red-400';
      case 'preorder': return 'text-yellow-400';
      default: return 'text-gray-400';
    }
  };

  const generateFeed = async () => {
    try {
      // Simuler la génération du feed XML
      const feedXml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:g="http://base.google.com/ns/1.0">
  <channel>
    <title>${companyName} - Catalogue Produits</title>
    <link>https://${retailerId}.omnia.sale</link>
    <description>Catalogue produits ${companyName}</description>
    ${products.map(product => `
    <item>
      <g:id>${product.id}</g:id>
      <g:title>${product.title}</g:title>
      <g:description>${product.description}</g:description>
      <g:price>${product.price} EUR</g:price>
      <g:availability>${product.availability}</g:availability>
      <g:condition>${product.condition}</g:condition>
      <g:brand>${product.brand}</g:brand>
      <g:gtin>${product.gtin}</g:gtin>
      <g:mpn>${product.mpn}</g:mpn>
      <g:google_product_category>${product.google_product_category}</g:google_product_category>
      <g:product_type>${product.product_type}</g:product_type>
      <g:image_link>${product.image_link}</g:image_link>
    </item>`).join('')}
  </channel>
</rss>`;

      // Créer un blob et télécharger
      const blob = new Blob([feedXml], { type: 'application/xml' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `google-merchant-feed-${retailerId}.xml`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      
    } catch (error) {
      console.error('Erreur génération feed:', error);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-cyan-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-white text-lg">Chargement Google Merchant Center...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold text-white mb-2">Google Merchant Center</h2>
          <p className="text-gray-300">Gestion du catalogue produits pour Google Shopping</p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={generateFeed}
            className="bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-400 hover:to-emerald-500 text-white px-6 py-3 rounded-xl font-semibold transition-all flex items-center gap-2"
          >
            <Download className="w-5 h-5" />
            Télécharger Feed XML
          </button>
          <button className="bg-blue-600/20 hover:bg-blue-600/30 border border-blue-400/50 text-blue-300 px-6 py-3 rounded-xl font-semibold transition-all flex items-center gap-2">
            <Upload className="w-5 h-5" />
            Synchroniser
          </button>
        </div>
      </div>

      {/* Stats du Feed */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-blue-600/20 backdrop-blur-xl rounded-2xl p-6 border border-blue-500/30">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-blue-200 text-sm mb-1">Total Produits</p>
              <p className="text-3xl font-bold text-white">{feedStatus.totalProducts}</p>
            </div>
            <Package className="w-10 h-10 text-blue-400" />
          </div>
        </div>
        
        <div className="bg-green-600/20 backdrop-blur-xl rounded-2xl p-6 border border-green-500/30">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-green-200 text-sm mb-1">Approuvés</p>
              <p className="text-3xl font-bold text-white">{feedStatus.approvedProducts}</p>
            </div>
            <CheckCircle className="w-10 h-10 text-green-400" />
          </div>
        </div>
        
        <div className="bg-yellow-600/20 backdrop-blur-xl rounded-2xl p-6 border border-yellow-500/30">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-yellow-200 text-sm mb-1">En attente</p>
              <p className="text-3xl font-bold text-white">{feedStatus.pendingProducts}</p>
            </div>
            <Settings className="w-10 h-10 text-yellow-400" />
          </div>
        </div>
        
        <div className="bg-red-600/20 backdrop-blur-xl rounded-2xl p-6 border border-red-500/30">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-red-200 text-sm mb-1">Refusés</p>
              <p className="text-3xl font-bold text-white">{feedStatus.disapprovedProducts}</p>
            </div>
            <AlertCircle className="w-10 h-10 text-red-400" />
          </div>
        </div>
      </div>

      {/* Configuration du Feed */}
      <div className="bg-white/10 backdrop-blur-xl rounded-2xl p-8 border border-white/20">
        <h3 className="text-2xl font-bold text-white mb-6">Configuration du Feed</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm text-cyan-300 mb-2">URL du Feed</label>
            <div className="flex">
              <input
                type="text"
                value={`https://${retailerId}.omnia.sale/feed/google-merchant.xml`}
                readOnly
                className="flex-1 bg-black/40 border border-cyan-500/50 rounded-l-xl px-4 py-3 text-white"
              />
              <button
                onClick={() => navigator.clipboard.writeText(`https://${retailerId}.omnia.sale/feed/google-merchant.xml`)}
                className="bg-cyan-600 hover:bg-cyan-700 text-white px-4 py-3 rounded-r-xl transition-all"
              >
                Copier
              </button>
            </div>
          </div>
          
          <div>
            <label className="block text-sm text-cyan-300 mb-2">Fréquence de mise à jour</label>
            <select className="w-full bg-black/40 border border-cyan-500/50 rounded-xl px-4 py-3 text-white">
              <option value="daily">Quotidienne</option>
              <option value="weekly">Hebdomadaire</option>
              <option value="manual">Manuelle</option>
            </select>
          </div>
          
          <div>
            <label className="block text-sm text-cyan-300 mb-2">Devise par défaut</label>
            <select className="w-full bg-black/40 border border-cyan-500/50 rounded-xl px-4 py-3 text-white">
              <option value="EUR">EUR - Euro</option>
              <option value="USD">USD - Dollar US</option>
              <option value="GBP">GBP - Livre Sterling</option>
            </select>
          </div>
          
          <div>
            <label className="block text-sm text-cyan-300 mb-2">Pays de vente</label>
            <select className="w-full bg-black/40 border border-cyan-500/50 rounded-xl px-4 py-3 text-white">
              <option value="FR">France</option>
              <option value="BE">Belgique</option>
              <option value="CH">Suisse</option>
              <option value="CA">Canada</option>
            </select>
          </div>
        </div>
        
        <div className="mt-6">
          <p className="text-gray-300 text-sm mb-4">
            Dernière mise à jour: {feedStatus.lastUpdate.toLocaleDateString('fr-FR')} à {feedStatus.lastUpdate.toLocaleTimeString('fr-FR')}
          </p>
          <button className="bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white px-6 py-3 rounded-xl font-semibold transition-all">
            Sauvegarder la configuration
          </button>
        </div>
      </div>

      {/* Liste des Produits */}
      <div className="bg-white/10 backdrop-blur-xl rounded-2xl border border-white/20 overflow-hidden">
        <div className="p-6 border-b border-white/10">
          <h3 className="text-2xl font-bold text-white">Produits dans le Feed</h3>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-black/20">
              <tr>
                <th className="text-left p-4 text-cyan-300 font-semibold">Produit</th>
                <th className="text-left p-4 text-cyan-300 font-semibold">Prix</th>
                <th className="text-left p-4 text-cyan-300 font-semibold">Disponibilité</th>
                <th className="text-left p-4 text-cyan-300 font-semibold">Statut</th>
                <th className="text-left p-4 text-cyan-300 font-semibold">Performance</th>
                <th className="text-left p-4 text-cyan-300 font-semibold">Actions</th>
              </tr>
            </thead>
            <tbody>
              {products.map((product) => (
                <tr key={product.id} className="border-b border-white/5 hover:bg-white/5">
                  <td className="p-4">
                    <div className="flex items-center gap-3">
                      <img 
                        src={product.image_link} 
                        alt={product.title}
                        className="w-12 h-12 object-cover rounded-lg"
                      />
                      <div>
                        <div className="text-white font-semibold">{product.title}</div>
                        <div className="text-gray-400 text-sm">{product.brand}</div>
                      </div>
                    </div>
                  </td>
                  <td className="p-4">
                    <div className="text-white font-bold">{product.price}€</div>
                  </td>
                  <td className="p-4">
                    <span className={`${getAvailabilityColor(product.availability)} font-semibold`}>
                      {product.availability === 'in stock' ? 'En stock' : 
                       product.availability === 'out of stock' ? 'Rupture' : 'Précommande'}
                    </span>
                  </td>
                  <td className="p-4">
                    <span className={`px-3 py-1 rounded-full text-xs font-bold border ${getStatusColor(product.status)}`}>
                      {product.status === 'approved' ? 'Approuvé' :
                       product.status === 'pending' ? 'En attente' : 'Refusé'}
                    </span>
                  </td>
                  <td className="p-4">
                    <div className="text-sm">
                      <div className="text-white">{product.impressions.toLocaleString()} impressions</div>
                      <div className="text-gray-400">{product.clicks} clics • {product.ctr}% CTR</div>
                    </div>
                  </td>
                  <td className="p-4">
                    <button
                      onClick={() => setSelectedProduct(product)}
                      className="bg-blue-600/20 hover:bg-blue-600/30 border border-blue-400/50 text-blue-300 px-3 py-2 rounded-lg text-sm transition-all flex items-center gap-2"
                    >
                      <Eye className="w-4 h-4" />
                      Détails
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal Détails Produit */}
      {selectedProduct && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-800/95 backdrop-blur-xl rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto border border-slate-600/50">
            <div className="p-6 border-b border-slate-600/50">
              <div className="flex items-center justify-between">
                <h3 className="text-2xl font-bold text-white">Détails Google Merchant</h3>
                <button
                  onClick={() => setSelectedProduct(null)}
                  className="text-gray-400 hover:text-white text-2xl"
                >
                  ×
                </button>
              </div>
            </div>
            
            <div className="p-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div>
                  <img 
                    src={selectedProduct.image_link} 
                    alt={selectedProduct.title}
                    className="w-full h-64 object-cover rounded-xl mb-4"
                  />
                  
                  <div className="space-y-4">
                    <div>
                      <h4 className="text-lg font-bold text-white mb-2">Performance</h4>
                      <div className="grid grid-cols-3 gap-4">
                        <div className="bg-blue-600/20 rounded-xl p-4 text-center">
                          <div className="text-2xl font-bold text-white">{selectedProduct.impressions.toLocaleString()}</div>
                          <div className="text-blue-300 text-sm">Impressions</div>
                        </div>
                        <div className="bg-green-600/20 rounded-xl p-4 text-center">
                          <div className="text-2xl font-bold text-white">{selectedProduct.clicks}</div>
                          <div className="text-green-300 text-sm">Clics</div>
                        </div>
                        <div className="bg-purple-600/20 rounded-xl p-4 text-center">
                          <div className="text-2xl font-bold text-white">{selectedProduct.ctr}%</div>
                          <div className="text-purple-300 text-sm">CTR</div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="space-y-6">
                  <div>
                    <h4 className="text-lg font-bold text-white mb-4">Informations Produit</h4>
                    <div className="space-y-3">
                      <div>
                        <label className="text-cyan-300 text-sm">Titre</label>
                        <div className="text-white">{selectedProduct.title}</div>
                      </div>
                      <div>
                        <label className="text-cyan-300 text-sm">Description</label>
                        <div className="text-white">{selectedProduct.description}</div>
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="text-cyan-300 text-sm">Prix</label>
                          <div className="text-white font-bold">{selectedProduct.price}€</div>
                        </div>
                        <div>
                          <label className="text-cyan-300 text-sm">Marque</label>
                          <div className="text-white">{selectedProduct.brand}</div>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div>
                    <h4 className="text-lg font-bold text-white mb-4">Attributs Google</h4>
                    <div className="space-y-3">
                      <div>
                        <label className="text-cyan-300 text-sm">GTIN</label>
                        <div className="text-white">{selectedProduct.gtin}</div>
                      </div>
                      <div>
                        <label className="text-cyan-300 text-sm">MPN</label>
                        <div className="text-white">{selectedProduct.mpn}</div>
                      </div>
                      <div>
                        <label className="text-cyan-300 text-sm">Catégorie Google</label>
                        <div className="text-white">{selectedProduct.google_product_category}</div>
                      </div>
                      <div>
                        <label className="text-cyan-300 text-sm">Type de produit</label>
                        <div className="text-white">{selectedProduct.product_type}</div>
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="text-cyan-300 text-sm">Disponibilité</label>
                          <div className={`font-semibold ${getAvailabilityColor(selectedProduct.availability)}`}>
                            {selectedProduct.availability === 'in stock' ? 'En stock' : 
                             selectedProduct.availability === 'out of stock' ? 'Rupture' : 'Précommande'}
                          </div>
                        </div>
                        <div>
                          <label className="text-cyan-300 text-sm">État</label>
                          <div className="text-white">{selectedProduct.condition === 'new' ? 'Neuf' : selectedProduct.condition}</div>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex gap-3">
                    <button className="flex-1 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white py-3 rounded-xl font-semibold transition-all">
                      Modifier
                    </button>
                    <button className="flex-1 bg-gray-600/20 hover:bg-gray-600/30 border border-gray-400/50 text-gray-300 py-3 rounded-xl font-semibold transition-all">
                      Exclure du feed
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};