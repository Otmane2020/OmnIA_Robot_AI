import React from 'react';
import { X, ExternalLink, Package, Tag, DollarSign, Calendar, User, BarChart3 } from 'lucide-react';

interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  compare_at_price?: number;
  category: string;
  vendor: string;
  image_url: string;
  product_url: string;
  stock: number;
  status: string;
  source_platform: string;
  sku?: string;
  variants?: ProductVariant[];
  created_at: string;
  updated_at: string;
}

interface ProductVariant {
  id: string;
  title: string;
  price: number;
  compare_at_price?: number;
  stock: number;
  sku: string;
  options: { name: string; value: string }[];
}

interface ProductDetailModalProps {
  product: Product;
  onClose: () => void;
}

export const ProductDetailModal: React.FC<ProductDetailModalProps> = ({ product, onClose }) => {
  const calculateDiscount = (price: number, compareAtPrice?: number): number => {
    if (!compareAtPrice || compareAtPrice <= price) return 0;
    return Math.round(((compareAtPrice - price) / compareAtPrice) * 100);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-500/20 text-green-300';
      case 'inactive': return 'bg-yellow-500/20 text-yellow-300';
      case 'draft': return 'bg-gray-500/20 text-gray-300';
      default: return 'bg-gray-500/20 text-gray-300';
    }
  };

  const getSourceColor = (source: string) => {
    switch (source) {
      case 'shopify': return 'bg-green-500/20 text-green-300';
      case 'csv': return 'bg-blue-500/20 text-blue-300';
      case 'xml': return 'bg-purple-500/20 text-purple-300';
      case 'manual': return 'bg-orange-500/20 text-orange-300';
      default: return 'bg-gray-500/20 text-gray-300';
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-slate-800/95 backdrop-blur-xl rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto border border-slate-600/50">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-slate-600/50">
          <h2 className="text-2xl font-bold text-white">Détails du produit</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="p-6 space-y-8">
          {/* Informations principales */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Image et infos de base */}
            <div>
              <div className="w-full h-80 rounded-2xl overflow-hidden bg-gray-600 mb-6">
                <img 
                  src={product.image_url} 
                  alt={product.name}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    target.src = 'https://images.pexels.com/photos/1350789/pexels-photo-1350789.jpeg';
                  }}
                />
              </div>
              
              <div className="space-y-4">
                <div>
                  <h3 className="text-xl font-bold text-white mb-2">{product.name}</h3>
                  <p className="text-gray-300">{product.description}</p>
                </div>
                
                <div className="flex items-center gap-4">
                  <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(product.status)}`}>
                    {product.status}
                  </span>
                  <span className={`px-3 py-1 rounded-full text-sm font-medium ${getSourceColor(product.source_platform)}`}>
                    {product.source_platform}
                  </span>
                </div>
              </div>
            </div>

            {/* Détails techniques */}
            <div className="space-y-6">
              {/* Prix */}
              <div className="bg-black/20 rounded-xl p-4">
                <h4 className="font-semibold text-white mb-3 flex items-center gap-2">
                  <DollarSign className="w-5 h-5 text-green-400" />
                  Tarification
                </h4>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-gray-300">Prix de vente :</span>
                    <span className="text-green-400 font-bold text-lg">{product.price}€</span>
                  </div>
                  {product.compare_at_price && (
                    <>
                      <div className="flex justify-between">
                        <span className="text-gray-300">Prix barré :</span>
                        <span className="text-gray-400 line-through">{product.compare_at_price}€</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-300">Remise :</span>
                        <span className="text-red-400 font-bold">
                          -{calculateDiscount(product.price, product.compare_at_price)}%
                        </span>
                      </div>
                    </>
                  )}
                </div>
              </div>

              {/* Inventaire */}
              <div className="bg-black/20 rounded-xl p-4">
                <h4 className="font-semibold text-white mb-3 flex items-center gap-2">
                  <Package className="w-5 h-5 text-blue-400" />
                  Inventaire
                </h4>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-gray-300">Stock disponible :</span>
                    <span className={`font-bold ${product.stock > 0 ? 'text-green-400' : 'text-red-400'}`}>
                      {product.stock} unité(s)
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-300">Catégorie :</span>
                    <span className="text-white">{product.category}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-300">Vendeur :</span>
                    <span className="text-white">{product.vendor}</span>
                  </div>
                  {product.sku && (
                    <div className="flex justify-between">
                      <span className="text-gray-300">SKU :</span>
                      <span className="text-cyan-400 font-mono">{product.sku}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Métadonnées */}
              <div className="bg-black/20 rounded-xl p-4">
                <h4 className="font-semibold text-white mb-3 flex items-center gap-2">
                  <Calendar className="w-5 h-5 text-purple-400" />
                  Métadonnées
                </h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-300">ID :</span>
                    <span className="text-cyan-400 font-mono">{product.id}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-300">Créé le :</span>
                    <span className="text-white">{new Date(product.created_at).toLocaleDateString('fr-FR')}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-300">Modifié le :</span>
                    <span className="text-white">{new Date(product.updated_at).toLocaleDateString('fr-FR')}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-300">Source :</span>
                    <span className={`px-2 py-1 rounded text-xs ${getSourceColor(product.source_platform)}`}>
                      {product.source_platform}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Variantes */}
          {product.variants && Array.isArray(product.variants) && product.variants.length > 0 && (
            <div className="bg-black/20 rounded-xl p-6">
              <h4 className="font-semibold text-white mb-4 flex items-center gap-2">
                <Tag className="w-5 h-5 text-orange-400" />
                Variantes ({product.variants.length})
              </h4>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-gray-600/50">
                      <th className="text-left p-3 text-gray-300">Variante</th>
                      <th className="text-left p-3 text-gray-300">Prix</th>
                      <th className="text-left p-3 text-gray-300">Stock</th>
                      <th className="text-left p-3 text-gray-300">SKU</th>
                      <th className="text-left p-3 text-gray-300">Options</th>
                    </tr>
                  </thead>
                  <tbody>
                    {(product.variants || []).map((variant) => (
                      <tr key={variant.id} className="border-b border-gray-700/30">
                        <td className="p-3">
                          <span className="text-white font-medium">{variant.title}</span>
                        </td>
                        <td className="p-3">
                          <div className="flex items-center gap-2">
                            <span className="text-green-400 font-bold">{variant.price}€</span>
                            {variant.compare_at_price && variant.compare_at_price > variant.price && (
                              <span className="text-gray-400 line-through text-sm">{variant.compare_at_price}€</span>
                            )}
                          </div>
                        </td>
                        <td className="p-3">
                          <span className={`font-semibold ${variant.stock > 0 ? 'text-green-400' : 'text-red-400'}`}>
                            {variant.stock}
                          </span>
                        </td>
                        <td className="p-3">
                          <span className="text-cyan-400 font-mono text-sm">{variant.sku}</span>
                        </td>
                        <td className="p-3">
                          <div className="flex flex-wrap gap-1">
                            {(variant.options || []).map((option, index) => (
                              <span key={index} className="bg-purple-500/20 text-purple-300 px-2 py-1 rounded text-xs">
                                {option.name}: {option.value}
                              </span>
                            ))}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="flex justify-between items-center pt-6 border-t border-slate-600/50">
            <a
              href={product.product_url}
              target="_blank"
              rel="noopener noreferrer"
              className="bg-purple-600 hover:bg-purple-700 text-white px-6 py-3 rounded-xl flex items-center gap-2 transition-all"
            >
              <ExternalLink className="w-4 h-4" />
              Voir sur le site
            </a>
            
            <button
              type="button"
              onClick={onClose}
              className="bg-gray-600 hover:bg-gray-700 text-white px-6 py-3 rounded-xl transition-all"
            >
              Fermer
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};