import React, { useState } from 'react';
import { ExternalLink, QrCode, ShoppingCart, Tag, Info, Ruler, Palette, Weight } from 'lucide-react';
import { Product } from '../types';
import { extractSpecifications } from '../../supabase/functions/_shared/specExtractor';

interface ProductCardProps {
  product: Product;
  onAddToCart?: (productId: string, variantId: string) => void;
}

export const ProductCard: React.FC<ProductCardProps> = ({ product, onAddToCart }) => {
  const [showQR, setShowQR] = useState(false);
  const [showSpecs, setShowSpecs] = useState(false);
  const [selectedVariant, setSelectedVariant] = useState(() => {
    if (product.variants && product.variants.length > 0) {
      return product.variants[0];
    }
    return {
      id: 'default',
      title: 'Default',
      price: product.price || 0,
      compareAtPrice: product.compareAtPrice,
      availableForSale: product.availableForSale || false,
      quantityAvailable: product.quantityAvailable || 0,
      selectedOptions: []
    };
  });
  
  // Defensive checks for all product properties
  const safeProduct = {
    ...product,
    description: product.description || '',
    title: product.title || '',
    productType: product.productType || '',
    tags: Array.isArray(product.tags) ? product.tags : [],
    variants: Array.isArray(product.variants) ? product.variants : []
  };
  
  const tagsToDisplay = safeProduct.tags;
  
  const specs = extractSpecifications(safeProduct.description, safeProduct.title, safeProduct.productType);
  
  const generateQRCode = (url: string) => {
    return `https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${encodeURIComponent(url)}`;
  };

  const handleAddToCart = () => {
    if (onAddToCart && selectedVariant) {
      onAddToCart(safeProduct.id, selectedVariant.id);
    }
  };

  return (
    <div className="bg-gradient-to-br from-white to-gray-50 rounded-3xl p-6 shadow-2xl border-2 border-gray-200 hover:shadow-cyan-500/20 hover:border-cyan-400 transition-all duration-500 hover:scale-105 group relative overflow-hidden animate-in slide-in-from-bottom-4">
      <div className="flex flex-col gap-6">
        <div className="w-full h-56 rounded-2xl overflow-hidden flex-shrink-0 shadow-xl border-2 border-gray-200 relative group-hover:shadow-cyan-200/50 transition-all group-hover:border-cyan-300">
          <img 
            src={safeProduct.image_url || 'https://images.pexels.com/photos/1350789/pexels-photo-1350789.jpeg?auto=compress&cs=tinysrgb&w=300&h=300&fit=crop'} 
            alt={safeProduct.title}
            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
            onError={(e) => {
              const target = e.target as HTMLImageElement;
              target.src = 'https://images.pexels.com/photos/1350789/pexels-photo-1350789.jpeg?auto=compress&cs=tinysrgb&w=300&h=300&fit=crop';
            }}
          />
          
          {/* Badge promotion */}
          {selectedVariant.compareAtPrice && selectedVariant.compareAtPrice > selectedVariant.price && (
            <div className="absolute top-4 right-4 bg-gradient-to-r from-red-500 to-red-600 text-white px-3 py-1 rounded-full text-sm font-bold shadow-lg animate-pulse">
              -{Math.round(((selectedVariant.compareAtPrice - selectedVariant.price) / selectedVariant.compareAtPrice) * 100)}%
            </div>
          )}
        </div>
        
        <div className="flex-1 min-w-0">
          <h3 className="font-bold text-gray-800 text-xl mb-3 line-clamp-2 group-hover:text-cyan-700 transition-colors leading-tight">{safeProduct.title}</h3>
          <p className="text-cyan-600 mb-4 font-semibold">{safeProduct.vendor || 'Vendeur'}</p>
          
          {tagsToDisplay.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-4 overflow-hidden">
              {tagsToDisplay.slice(0, 3).map((tag, index) => (
                <span key={index} className="inline-flex items-center gap-1 px-3 py-1 bg-gradient-to-r from-cyan-100 to-blue-100 text-cyan-700 text-sm rounded-full border border-cyan-200 font-medium">
                  <Tag className="w-4 h-4" />
                  {tag}
                </span>
              ))}
              {tagsToDisplay.length > 3 && (
                <span className="text-sm text-gray-600 px-3 py-1 bg-gray-100 rounded-full border border-gray-200">+{tagsToDisplay.length - 3}</span>
              )}
            </div>
          )}
          
          <div className="flex flex-col gap-4">
            <div>
              <div className="flex items-center gap-2">
                <p className="text-3xl font-bold text-green-600">{selectedVariant.price}€</p>
                {selectedVariant.compareAtPrice && selectedVariant.compareAtPrice > selectedVariant.price && (
                  <>
                    <p className="text-xl text-gray-500 line-through">{selectedVariant.compareAtPrice}€</p>
                  </>
                )}
              </div>
              <p className="text-base text-gray-600 font-medium">
                {safeProduct.availableForSale ? 
                  `✅ ${selectedVariant.quantityAvailable || safeProduct.quantityAvailable || 0} en stock` : 
                  'Rupture de stock'
                }
              </p>
            </div>
            <div className="flex gap-3 flex-wrap">
              <button
                onClick={() => setShowSpecs(!showSpecs)}
                className="p-3 bg-purple-100 hover:bg-purple-200 text-purple-700 rounded-xl transition-all hover:scale-110 border border-purple-300 shadow-lg"
                title="Voir spécifications"
              >
                <Info className="w-5 h-5" />
              </button>
              <button
                onClick={() => setShowQR(!showQR)}
                className="p-3 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl transition-all hover:scale-110 border border-gray-300 shadow-lg"
                title="Voir QR Code"
              >
                <QrCode className="w-5 h-5" />
              </button>
              <a
                href={safeProduct.product_url || '#'}
                target="_blank"
                rel="noopener noreferrer"
                className="p-3 bg-blue-100 hover:bg-blue-200 text-blue-700 rounded-xl transition-all hover:scale-110 border border-blue-300 shadow-lg"
                title="Voir la fiche"
              >
                <ExternalLink className="w-5 h-5" />
              </a>
              {safeProduct.availableForSale && onAddToCart && (
                <button
                  onClick={handleAddToCart}
                  className="p-3 bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-400 hover:to-emerald-500 text-white rounded-xl transition-all hover:scale-110 border border-green-300 font-bold shadow-xl hover:shadow-green-500/50"
                  title="Ajouter au panier"
                >
                  <ShoppingCart className="w-5 h-5" />
                </button>
              )}
            </div>
          </div>
          
          {safeProduct.variants.length > 1 && (
            <div className="mt-4">
              <select
                value={selectedVariant.id}
                onChange={(e) => {
                  const variant = safeProduct.variants.find(v => v.id === e.target.value);
                  if (variant) setSelectedVariant(variant);
                }}
                className="w-full p-2 md:p-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-blue-400 bg-white text-gray-800 font-semibold shadow-sm text-sm hover:border-blue-300 transition-all"
              >
                {safeProduct.variants.map((variant) => (
                  <option key={variant.id} value={variant.id}>
                    {variant.title} - {variant.price}€
                  </option>
                ))}
              </select>
            </div>
          )}
        </div>
      </div>
      
      {showSpecs && (
        <div className="mt-4 p-4 bg-gray-50 rounded-xl border border-gray-200 shadow-lg animate-in slide-in-from-top-2">
          <h4 className="font-semibold text-gray-800 mb-3 flex items-center gap-2 text-sm md:text-base">
            <Info className="w-5 h-5" />
            Spécifications
          </h4>
          <div className="space-y-3 text-sm text-gray-700">
            {specs.dimensions && (
              <div className="flex items-center gap-2">
                <Ruler className="w-4 h-4 text-blue-500" />
                <span className="font-medium text-gray-800">Dimensions:</span>
                <span className="break-all">
                  {specs.dimensions.longueur && `L: ${specs.dimensions.longueur}cm`}
                  {specs.dimensions.largeur && ` × l: ${specs.dimensions.largeur}cm`}
                  {specs.dimensions.hauteur && ` × H: ${specs.dimensions.hauteur}cm`}
                </span>
              </div>
            )}
            
            {specs.materials && specs.materials.length > 0 && (
              <div className="flex items-center gap-2">
                <Tag className="w-4 h-4 text-green-500" />
                <span className="font-medium text-gray-800">Matériaux:</span>
                <span className="break-words">{specs.materials.join(', ')}</span>
              </div>
            )}
            
            {specs.colors && specs.colors.length > 0 && (
              <div className="flex items-center gap-2">
                <Palette className="w-4 h-4 text-pink-400" />
                <span className="font-medium text-gray-800">Couleurs:</span>
                <span className="break-words text-gray-700">{specs.colors.join(', ')}</span>
              </div>
            )}
            
            {specs.weight && (
              <div className="flex items-center gap-2">
                <Weight className="w-4 h-4 text-orange-400" />
                <span className="font-medium text-gray-800">Poids:</span>
                <span className="text-gray-700">{specs.weight.value} {specs.weight.unit}</span>
              </div>
            )}
            
            {specs.density && (
              <div className="flex items-center gap-2">
                <Info className="w-4 h-4 text-teal-600" />
                <span className="font-medium text-gray-800">Densité:</span>
                <span className="text-gray-700">{specs.density.value} {specs.density.unit}</span>
              </div>
            )}
            
            {specs.categorySpecs && (
              <div className="mt-4 pt-3 border-t border-gray-300">
                <span className="font-medium text-gray-800">Spécifications produit:</span>
                <div className="mt-2 space-y-2">
                  {specs.categorySpecs.canapeType && (
                    <div className="text-gray-700">Type: {specs.categorySpecs.canapeType}</div>
                  )}
                  {specs.categorySpecs.canapeState && (
                    <div className="text-gray-700">État: {specs.categorySpecs.canapeState}</div>
                  )}
                  {specs.categorySpecs.litType && (
                    <div className="text-gray-700">Taille: {specs.categorySpecs.litType}</div>
                  )}
                  {specs.categorySpecs.matelasType && (
                    <div className="text-gray-700">Type matelas: {specs.categorySpecs.matelasType}</div>
                  )}
                  {specs.categorySpecs.ressort !== undefined && (
                    <div className="text-gray-700">Ressorts: {specs.categorySpecs.ressort ? 'Oui' : 'Non'}</div>
                  )}
                  {specs.categorySpecs.fermete && (
                    <div className="text-gray-700">Fermeté: {specs.categorySpecs.fermete}</div>
                  )}
                  {specs.categorySpecs.defaultDensity && (
                    <div className="text-gray-700">Densité mousse: {specs.categorySpecs.defaultDensity.value} {specs.categorySpecs.defaultDensity.unit}</div>
                  )}
                  {specs.categorySpecs.chaiseType && (
                    <div className="text-gray-700">Type: {specs.categorySpecs.chaiseType}</div>
                  )}
                  {specs.categorySpecs.accoudoirs !== undefined && (
                    <div className="text-gray-700">Accoudoirs: {specs.categorySpecs.accoudoirs ? 'Oui' : 'Non'}</div>
                  )}
                  {specs.categorySpecs.pivotant && (
                    <div className="text-gray-700">Pivotant: Oui</div>
                  )}
                  {specs.categorySpecs.reglableHauteur && (
                    <div className="text-gray-700">Hauteur réglable: Oui</div>
                  )}
                </div>
              </div>
            )}
            
            {specs.capacity && (
              <div className="flex items-center gap-2">
                <Info className="w-4 h-4 text-indigo-600" />
                <span className="font-medium text-gray-800">Capacité:</span>
                <span className="break-all text-gray-700">
                  {specs.capacity.seats && `${specs.capacity.seats} places`}
                  {specs.capacity.drawers && `, ${specs.capacity.drawers} tiroirs`}
                  {specs.capacity.shelves && `, ${specs.capacity.shelves} étagères`}
                </span>
              </div>
            )}
          </div>
        </div>
      )}
      
      {showQR && (
       <div className="mt-4 flex justify-center animate-in slide-in-from-top-2">
         <div className="p-4 bg-white rounded-xl shadow-lg border border-gray-200">
            <img
              src={generateQRCode(safeProduct.product_url || window.location.href)} 
              alt="QR Code"
             className="rounded-xl shadow-lg w-24 h-24 md:w-32 md:h-32"
            />
          </div>
        </div>
      )}
    </div>
  );
};