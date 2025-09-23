import React, { useState, useEffect } from 'react';
import { X, Save, Plus, Trash2, Image, Package, DollarSign, Tag, FileText } from 'lucide-react';

interface ProductVariant {
  id: string;
  title: string;
  price: number;
  compare_at_price?: number;
  stock: number;
  sku: string;
  options: { name: string; value: string }[];
}

interface ProductFormData {
  name: string;
  description: string;
  price: number;
  compare_at_price?: number;
  category: string;
  vendor: string;
  image_url: string;
  product_url: string;
  stock: number;
  status: 'active' | 'inactive' | 'draft';
  sku: string;
  product_type: 'simple' | 'variable';
  variants: ProductVariant[];
}

interface AddProductModalProps {
  product?: any;
  onSave: (productData: ProductFormData) => void;
  onClose: () => void;
}

export const AddProductModal: React.FC<AddProductModalProps> = ({ product, onSave, onClose }) => {
  const [formData, setFormData] = useState<ProductFormData>({
    name: '',
    description: '',
    price: 0,
    compare_at_price: undefined,
    category: '',
    vendor: 'Decora Home',
    image_url: '',
    product_url: '',
    stock: 0,
    status: 'active',
    sku: '',
    product_type: 'simple',
    variants: []
  });

  const [errors, setErrors] = useState<{[key: string]: string}>({});

  useEffect(() => {
    if (product) {
      setFormData({
        name: product.name || '',
        description: product.description || '',
        price: product.price || 0,
        compare_at_price: product.compare_at_price,
        category: product.category || '',
        vendor: product.vendor || 'Decora Home',
        image_url: product.image_url || '',
        product_url: product.product_url || '',
        stock: product.stock || 0,
        status: product.status || 'active',
        sku: product.sku || '',
        product_type: product.variants && product.variants.length > 1 ? 'variable' : 'simple',
        variants: product.variants || []
      });
    }
  }, [product]);

  const validateForm = (): boolean => {
    const newErrors: {[key: string]: string} = {};

    if (!formData.name.trim()) newErrors.name = 'Nom requis';
    if (formData.price <= 0) newErrors.price = 'Prix doit être supérieur à 0';
    if (!formData.category.trim()) newErrors.category = 'Catégorie requise';
    if (!formData.vendor.trim()) newErrors.vendor = 'Vendeur requis';

    if (formData.product_type === 'variable' && formData.variants.length === 0) {
      newErrors.variants = 'Au moins une variante requise pour un produit variable';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (validateForm()) {
      onSave(formData);
    }
  };

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const addVariant = () => {
    const newVariant: ProductVariant = {
      id: `variant-${Date.now()}`,
      title: `Variante ${formData.variants.length + 1}`,
      price: formData.price,
      compare_at_price: formData.compare_at_price,
      stock: formData.stock,
      sku: `${formData.sku}-${formData.variants.length + 1}`,
      options: [{ name: 'Option', value: 'Valeur' }]
    };
    
    setFormData(prev => ({
      ...prev,
      variants: [...prev.variants, newVariant]
    }));
  };

  const updateVariant = (index: number, field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      variants: prev.variants.map((variant, i) => 
        i === index ? { ...variant, [field]: value } : variant
      )
    }));
  };

  const removeVariant = (index: number) => {
    setFormData(prev => ({
      ...prev,
      variants: prev.variants.filter((_, i) => i !== index)
    }));
  };

  const updateVariantOption = (variantIndex: number, optionIndex: number, field: 'name' | 'value', value: string) => {
    setFormData(prev => ({
      ...prev,
      variants: prev.variants.map((variant, i) => 
        i === variantIndex 
          ? {
              ...variant,
              options: variant.options.map((option, j) => 
                j === optionIndex ? { ...option, [field]: value } : option
              )
            }
          : variant
      )
    }));
  };

  const addVariantOption = (variantIndex: number) => {
    setFormData(prev => ({
      ...prev,
      variants: prev.variants.map((variant, i) => 
        i === variantIndex 
          ? {
              ...variant,
              options: [...variant.options, { name: 'Option', value: 'Valeur' }]
            }
          : variant
      )
    }));
  };

  const removeVariantOption = (variantIndex: number, optionIndex: number) => {
    setFormData(prev => ({
      ...prev,
      variants: prev.variants.map((variant, i) => 
        i === variantIndex 
          ? {
              ...variant,
              options: variant.options.filter((_, j) => j !== optionIndex)
            }
          : variant
      )
    }));
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-slate-800/95 backdrop-blur-xl rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto border border-slate-600/50">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-slate-600/50">
          <h2 className="text-2xl font-bold text-white">
            {product ? 'Modifier le produit' : 'Ajouter un produit'}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-8">
          {/* Informations de base */}
          <div className="bg-black/20 rounded-xl p-6">
            <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
              <FileText className="w-5 h-5 text-cyan-400" />
              Informations générales
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm text-gray-300 mb-2">Nom du produit *</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => handleInputChange('name', e.target.value)}
                  className={`w-full bg-black/40 border rounded-xl px-4 py-3 text-white ${
                    errors.name ? 'border-red-500' : 'border-gray-600'
                  }`}
                  placeholder="Ex: Canapé moderne 3 places"
                />
                {errors.name && <p className="text-red-400 text-sm mt-1">{errors.name}</p>}
              </div>
              
              <div>
                <label className="block text-sm text-gray-300 mb-2">SKU</label>
                <input
                  type="text"
                  value={formData.sku}
                  onChange={(e) => handleInputChange('sku', e.target.value)}
                  className="w-full bg-black/40 border border-gray-600 rounded-xl px-4 py-3 text-white"
                  placeholder="Ex: CAN-MOD-3P-001"
                />
              </div>
              
              <div>
                <label className="block text-sm text-gray-300 mb-2">Catégorie *</label>
                <input
                  type="text"
                  value={formData.category}
                  onChange={(e) => handleInputChange('category', e.target.value)}
                  className={`w-full bg-black/40 border rounded-xl px-4 py-3 text-white ${
                    errors.category ? 'border-red-500' : 'border-gray-600'
                  }`}
                  placeholder="Ex: Canapé, Table, Chaise"
                />
                {errors.category && <p className="text-red-400 text-sm mt-1">{errors.category}</p>}
              </div>
              
              <div>
                <label className="block text-sm text-gray-300 mb-2">Vendeur *</label>
                <input
                  type="text"
                  value={formData.vendor}
                  onChange={(e) => handleInputChange('vendor', e.target.value)}
                  className={`w-full bg-black/40 border rounded-xl px-4 py-3 text-white ${
                    errors.vendor ? 'border-red-500' : 'border-gray-600'
                  }`}
                  placeholder="Ex: Decora Home"
                />
                {errors.vendor && <p className="text-red-400 text-sm mt-1">{errors.vendor}</p>}
              </div>
            </div>
            
            <div className="mt-4">
              <label className="block text-sm text-gray-300 mb-2">Description</label>
              <textarea
                value={formData.description}
                onChange={(e) => handleInputChange('description', e.target.value)}
                rows={4}
                className="w-full bg-black/40 border border-gray-600 rounded-xl px-4 py-3 text-white resize-none"
                placeholder="Description détaillée du produit..."
              />
            </div>
          </div>

          {/* Prix et inventaire */}
          <div className="bg-black/20 rounded-xl p-6">
            <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
              <DollarSign className="w-5 h-5 text-green-400" />
              Prix et inventaire
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div>
                <label className="block text-sm text-gray-300 mb-2">Prix de vente *</label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  value={formData.price}
                  onChange={(e) => handleInputChange('price', parseFloat(e.target.value) || 0)}
                  className={`w-full bg-black/40 border rounded-xl px-4 py-3 text-white ${
                    errors.price ? 'border-red-500' : 'border-gray-600'
                  }`}
                  placeholder="0.00"
                />
                {errors.price && <p className="text-red-400 text-sm mt-1">{errors.price}</p>}
              </div>
              
              <div>
                <label className="block text-sm text-gray-300 mb-2">Prix barré</label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  value={formData.compare_at_price || ''}
                  onChange={(e) => handleInputChange('compare_at_price', e.target.value ? parseFloat(e.target.value) : undefined)}
                  className="w-full bg-black/40 border border-gray-600 rounded-xl px-4 py-3 text-white"
                  placeholder="0.00"
                />
              </div>
              
              <div>
                <label className="block text-sm text-gray-300 mb-2">Stock</label>
                <input
                  type="number"
                  min="0"
                  value={formData.stock}
                  onChange={(e) => handleInputChange('stock', parseInt(e.target.value) || 0)}
                  className="w-full bg-black/40 border border-gray-600 rounded-xl px-4 py-3 text-white"
                  placeholder="0"
                />
              </div>
              
              <div>
                <label className="block text-sm text-gray-300 mb-2">Statut</label>
                <select
                  value={formData.status}
                  onChange={(e) => handleInputChange('status', e.target.value)}
                  className="w-full bg-black/40 border border-gray-600 rounded-xl px-4 py-3 text-white"
                >
                  <option value="active">Actif</option>
                  <option value="inactive">Inactif</option>
                  <option value="draft">Brouillon</option>
                </select>
              </div>
            </div>
          </div>

          {/* Images et liens */}
          <div className="bg-black/20 rounded-xl p-6">
            <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
              <Image className="w-5 h-5 text-purple-400" />
              Images et liens
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm text-gray-300 mb-2">URL de l'image</label>
                <input
                  type="url"
                  value={formData.image_url}
                  onChange={(e) => handleInputChange('image_url', e.target.value)}
                  className="w-full bg-black/40 border border-gray-600 rounded-xl px-4 py-3 text-white"
                  placeholder="https://example.com/image.jpg"
                />
              </div>
              
              <div>
                <label className="block text-sm text-gray-300 mb-2">URL du produit</label>
                <input
                  type="url"
                  value={formData.product_url}
                  onChange={(e) => handleInputChange('product_url', e.target.value)}
                  className="w-full bg-black/40 border border-gray-600 rounded-xl px-4 py-3 text-white"
                  placeholder="https://example.com/produit"
                />
              </div>
            </div>
            
            {/* Aperçu image */}
            {formData.image_url && (
              <div className="mt-4">
                <label className="block text-sm text-gray-300 mb-2">Aperçu</label>
                <div className="w-32 h-32 rounded-xl overflow-hidden bg-gray-600">
                  <img 
                    src={formData.image_url} 
                    alt="Aperçu"
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      target.style.display = 'none';
                    }}
                  />
                </div>
              </div>
            )}
          </div>

          {/* Type de produit */}
          <div className="bg-black/20 rounded-xl p-6">
            <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
              <Package className="w-5 h-5 text-orange-400" />
              Type de produit
            </h3>
            
            <div className="flex gap-4 mb-6">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  name="product_type"
                  value="simple"
                  checked={formData.product_type === 'simple'}
                  onChange={(e) => handleInputChange('product_type', e.target.value)}
                  className="w-4 h-4 text-cyan-600"
                />
                <span className="text-white">Produit simple</span>
              </label>
              
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  name="product_type"
                  value="variable"
                  checked={formData.product_type === 'variable'}
                  onChange={(e) => handleInputChange('product_type', e.target.value)}
                  className="w-4 h-4 text-cyan-600"
                />
                <span className="text-white">Produit variable</span>
              </label>
            </div>

            {/* Gestion des variantes */}
            {formData.product_type === 'variable' && (
              <div>
                <div className="flex items-center justify-between mb-4">
                  <h4 className="font-semibold text-white">Variantes</h4>
                  <button
                    type="button"
                    onClick={addVariant}
                    className="bg-cyan-600 hover:bg-cyan-700 text-white px-3 py-2 rounded-lg flex items-center gap-2 text-sm"
                  >
                    <Plus className="w-4 h-4" />
                    Ajouter variante
                  </button>
                </div>
                
                {errors.variants && <p className="text-red-400 text-sm mb-4">{errors.variants}</p>}
                
                <div className="space-y-4">
                  {formData.variants.map((variant, variantIndex) => (
                    <div key={variant.id} className="bg-black/40 rounded-xl p-4 border border-gray-600/50">
                      <div className="flex items-center justify-between mb-4">
                        <h5 className="font-semibold text-white">Variante {variantIndex + 1}</h5>
                        <button
                          type="button"
                          onClick={() => removeVariant(variantIndex)}
                          className="text-red-400 hover:text-red-300"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
                        <div>
                          <label className="block text-sm text-gray-300 mb-1">Titre</label>
                          <input
                            type="text"
                            value={variant.title}
                            onChange={(e) => updateVariant(variantIndex, 'title', e.target.value)}
                            className="w-full bg-black/40 border border-gray-600 rounded-lg px-3 py-2 text-white text-sm"
                          />
                        </div>
                        
                        <div>
                          <label className="block text-sm text-gray-300 mb-1">Prix</label>
                          <input
                            type="number"
                            step="0.01"
                            value={variant.price}
                            onChange={(e) => updateVariant(variantIndex, 'price', parseFloat(e.target.value) || 0)}
                            className="w-full bg-black/40 border border-gray-600 rounded-lg px-3 py-2 text-white text-sm"
                          />
                        </div>
                        
                        <div>
                          <label className="block text-sm text-gray-300 mb-1">Stock</label>
                          <input
                            type="number"
                            value={variant.stock}
                            onChange={(e) => updateVariant(variantIndex, 'stock', parseInt(e.target.value) || 0)}
                            className="w-full bg-black/40 border border-gray-600 rounded-lg px-3 py-2 text-white text-sm"
                          />
                        </div>
                        
                        <div>
                          <label className="block text-sm text-gray-300 mb-1">Image variante</label>
                          <input
                            type="url"
                            value={variantImages[variant.id] || ''}
                            onChange={(e) => setVariantImages(prev => ({ ...prev, [variant.id]: e.target.value }))}
                            className="w-full bg-black/40 border border-gray-600 rounded-lg px-3 py-2 text-white text-sm"
                            placeholder="URL image variante"
                          />
                          {variantImages[variant.id] && (
                            <div className="mt-2">
                              <img 
                                src={variantImages[variant.id]} 
                                alt="Aperçu variante"
                                className="w-16 h-16 rounded-lg object-cover"
                                onError={(e) => {
                                  const target = e.target as HTMLImageElement;
                                  target.style.display = 'none';
                                }}
                              />
                            </div>
                          )}
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm text-gray-300 mb-1">SKU</label>
                          <input
                            type="text"
                            value={variant.sku}
                            onChange={(e) => updateVariant(variantIndex, 'sku', e.target.value)}
                            className="w-full bg-black/40 border border-gray-600 rounded-lg px-3 py-2 text-white text-sm"
                          />
                        </div>
                        
                        <div>
                          <label className="block text-sm text-gray-300 mb-1">Prix barré</label>
                          <input
                            type="number"
                            step="0.01"
                            value={variant.compare_at_price || ''}
                            onChange={(e) => updateVariant(variantIndex, 'compare_at_price', e.target.value ? parseFloat(e.target.value) : undefined)}
                            className="w-full bg-black/40 border border-gray-600 rounded-lg px-3 py-2 text-white text-sm"
                          />
                        </div>
                      </div>
                      
                      {/* Options de variante */}
                      <div>
                        <div className="flex items-center justify-between mb-2">
                          <label className="block text-sm text-gray-300">Options</label>
                          <button
                            type="button"
                            onClick={() => addVariantOption(variantIndex)}
                            className="text-cyan-400 hover:text-cyan-300 text-sm"
                          >
                            + Ajouter option
                          </button>
                        </div>
                        
                        <div className="space-y-2">
                          {variant.options.map((option, optionIndex) => (
                            <div key={optionIndex} className="flex gap-2">
                              <input
                                type="text"
                                value={option.name}
                                onChange={(e) => updateVariantOption(variantIndex, optionIndex, 'name', e.target.value)}
                                className="flex-1 bg-black/40 border border-gray-600 rounded-lg px-3 py-2 text-white text-sm"
                                placeholder="Nom option (ex: Couleur)"
                              />
                              <input
                                type="text"
                                value={option.value}
                                onChange={(e) => updateVariantOption(variantIndex, optionIndex, 'value', e.target.value)}
                                className="flex-1 bg-black/40 border border-gray-600 rounded-lg px-3 py-2 text-white text-sm"
                                placeholder="Valeur (ex: Rouge)"
                              />
                              <button
                                type="button"
                                onClick={() => removeVariantOption(variantIndex, optionIndex)}
                                className="text-red-400 hover:text-red-300 p-2"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Actions */}
          <div className="flex justify-between pt-6 border-t border-slate-600/50">
            <button
              type="button"
              onClick={onClose}
              className="bg-gray-600 hover:bg-gray-700 text-white px-6 py-3 rounded-xl transition-all"
            >
              Annuler
            </button>
            
            <button
              type="submit"
              className="bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-400 hover:to-emerald-500 text-white px-6 py-3 rounded-xl flex items-center gap-2 font-semibold transition-all"
            >
              <Save className="w-4 h-4" />
              {product ? 'Modifier' : 'Ajouter'} le produit
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};