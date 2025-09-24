import React, { useState } from 'react';
import { ChevronDown, ChevronUp, Image, Tag, DollarSign, Package } from 'lucide-react';

interface ProductVariant {
  id: string;
  title: string;
  price: number;
  compareAtPrice?: number;
  availableForSale: boolean;
  quantityAvailable: number;
  selectedOptions: Array<{
    name: string;
    value: string;
  }>;
  image?: string;
  sku?: string;
}

interface ProductVariantSelectorProps {
  variants: ProductVariant[];
  selectedVariant: ProductVariant;
  onVariantChange: (variant: ProductVariant) => void;
  productImages?: string[];
}

export const ProductVariantSelector: React.FC<ProductVariantSelectorProps> = ({
  variants,
  selectedVariant,
  onVariantChange,
  productImages = []
}) => {
  const [showAllVariants, setShowAllVariants] = useState(false);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);

  if (variants.length <= 1) {
    return null;
  }

  // Grouper les options par nom
  const optionGroups = variants.reduce((groups: any, variant) => {
    variant.selectedOptions.forEach(option => {
      if (!groups[option.name]) {
        groups[option.name] = new Set();
      }
      groups[option.name].add(option.value);
    });
    return groups;
  }, {});

  const handleOptionChange = (optionName: string, optionValue: string) => {
    // Trouver la variante correspondante
    const matchingVariant = variants.find(variant =>
      variant.selectedOptions.some(option => 
        option.name === optionName && option.value === optionValue
      )
    );

    if (matchingVariant) {
      onVariantChange(matchingVariant);
    }
  };

  const calculateDiscount = (price: number, compareAtPrice?: number): number => {
    if (!compareAtPrice || compareAtPrice <= price) return 0;
    return Math.round(((compareAtPrice - price) / compareAtPrice) * 100);
  };

  return (
    <div className="space-y-4">
      {/* Sélecteurs d'options */}
      <div className="space-y-3">
        {Object.entries(optionGroups).map(([optionName, values]) => {
          const currentValue = selectedVariant.selectedOptions.find(
            option => option.name === optionName
          )?.value;

          return (
            <div key={optionName}>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {optionName}
              </label>
              <div className="flex flex-wrap gap-2">
                {Array.from(values as Set<string>).map((value) => {
                  const isSelected = currentValue === value;
                  const variantForValue = variants.find(v =>
                    v.selectedOptions.some(opt => opt.name === optionName && opt.value === value)
                  );
                  const isAvailable = variantForValue?.availableForSale && 
                                   (variantForValue?.quantityAvailable || 0) > 0;

                  return (
                    <button
                      key={value}
                      onClick={() => handleOptionChange(optionName, value)}
                      disabled={!isAvailable}
                      className={`px-4 py-2 rounded-xl border-2 transition-all font-medium ${
                        isSelected
                          ? 'border-blue-500 bg-blue-50 text-blue-700'
                          : isAvailable
                          ? 'border-gray-300 bg-white text-gray-700 hover:border-blue-300 hover:bg-blue-50'
                          : 'border-gray-200 bg-gray-100 text-gray-400 cursor-not-allowed'
                      }`}
                    >
                      {value}
                      {!isAvailable && (
                        <span className="ml-2 text-xs">(Rupture)</span>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>

      {/* Informations variante sélectionnée */}
      <div className="bg-gray-50 rounded-xl p-4 border border-gray-200">
        <div className="flex items-center justify-between mb-3">
          <h4 className="font-semibold text-gray-800">Variante sélectionnée</h4>
          <div className="flex items-center gap-2">
            <span className="text-2xl font-bold text-green-600">{selectedVariant.price}€</span>
            {selectedVariant.compareAtPrice && selectedVariant.compareAtPrice > selectedVariant.price && (
              <>
                <span className="text-lg text-gray-500 line-through">{selectedVariant.compareAtPrice}€</span>
                <span className="bg-red-100 text-red-700 px-2 py-1 rounded-full text-xs font-bold">
                  -{calculateDiscount(selectedVariant.price, selectedVariant.compareAtPrice)}%
                </span>
              </>
            )}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <span className="text-gray-600">Stock :</span>
            <span className={`ml-2 font-semibold ${
              selectedVariant.quantityAvailable > 0 ? 'text-green-600' : 'text-red-600'
            }`}>
              {selectedVariant.quantityAvailable} disponible(s)
            </span>
          </div>
          {selectedVariant.sku && (
            <div>
              <span className="text-gray-600">SKU :</span>
              <span className="ml-2 font-mono text-gray-800">{selectedVariant.sku}</span>
            </div>
          )}
        </div>

        {/* Options de la variante */}
        <div className="mt-3 flex flex-wrap gap-2">
          {selectedVariant.selectedOptions.map((option, index) => (
            <span
              key={index}
              className="inline-flex items-center gap-1 px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-xs font-medium"
            >
              <Tag className="w-3 h-3" />
              {option.name}: {option.value}
            </span>
          ))}
        </div>
      </div>

      {/* Galerie d'images additionnelles */}
      {productImages.length > 1 && (
        <div className="space-y-3">
          <h4 className="font-semibold text-gray-800 flex items-center gap-2">
            <Image className="w-4 h-4" />
            Photos additionnelles ({productImages.length})
          </h4>
          
          {/* Image principale */}
          <div className="w-full h-64 rounded-xl overflow-hidden bg-gray-100 border border-gray-200">
            <img
              src={productImages[selectedImageIndex]}
              alt={`Photo ${selectedImageIndex + 1}`}
              className="w-full h-full object-cover"
              onError={(e) => {
                const target = e.target as HTMLImageElement;
                target.src = 'https://images.pexels.com/photos/1350789/pexels-photo-1350789.jpeg';
              }}
            />
          </div>

          {/* Miniatures */}
          <div className="flex gap-2 overflow-x-auto pb-2">
            {productImages.map((image, index) => (
              <button
                key={index}
                onClick={() => setSelectedImageIndex(index)}
                className={`flex-shrink-0 w-16 h-16 rounded-lg overflow-hidden border-2 transition-all ${
                  selectedImageIndex === index
                    ? 'border-blue-500 shadow-lg'
                    : 'border-gray-200 hover:border-blue-300'
                }`}
              >
                <img
                  src={image}
                  alt={`Miniature ${index + 1}`}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    target.src = 'https://images.pexels.com/photos/1350789/pexels-photo-1350789.jpeg';
                  }}
                />
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Liste complète des variantes (optionnel) */}
      {variants.length > 3 && (
        <div>
          <button
            onClick={() => setShowAllVariants(!showAllVariants)}
            className="flex items-center gap-2 text-blue-600 hover:text-blue-700 font-medium"
          >
            {showAllVariants ? (
              <>
                <ChevronUp className="w-4 h-4" />
                Masquer les variantes
              </>
            ) : (
              <>
                <ChevronDown className="w-4 h-4" />
                Voir toutes les variantes ({variants.length})
              </>
            )}
          </button>

          {showAllVariants && (
            <div className="mt-3 space-y-2 max-h-48 overflow-y-auto">
              {variants.map((variant) => (
                <div
                  key={variant.id}
                  onClick={() => onVariantChange(variant)}
                  className={`p-3 rounded-lg border cursor-pointer transition-all ${
                    selectedVariant.id === variant.id
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-200 bg-white hover:border-blue-300 hover:bg-blue-50'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="font-medium text-gray-800">{variant.title}</div>
                      <div className="text-sm text-gray-600">
                        {variant.selectedOptions.map(opt => `${opt.name}: ${opt.value}`).join(' • ')}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-bold text-green-600">{variant.price}€</div>
                      <div className={`text-xs ${
                        variant.quantityAvailable > 0 ? 'text-green-600' : 'text-red-600'
                      }`}>
                        {variant.quantityAvailable > 0 ? `${variant.quantityAvailable} en stock` : 'Rupture'}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};