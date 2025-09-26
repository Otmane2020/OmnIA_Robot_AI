import React, { useState, useEffect } from 'react';
import { X, Save, Package, Tag, DollarSign, Image, FileText } from 'lucide-react';

interface Product {
  id?: string;
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
  sku?: string;
}

interface AddProductModalProps {
  product?: Product | null;
  onSave: (productData: Partial<Product>) => void;
  onClose: () => void;
}

export const AddProductModal: React.FC<AddProductModalProps> = ({ product, onSave, onClose }) => {
  const [formData, setFormData] = useState<Partial<Product>>({
    name: '',
    description: '',
    price: 0,
    compare_at_price: undefined,
    category: 'Mobilier',
    vendor: 'Boutique',
    image_url: '',
    product_url: '',
    stock: 0,
    status: 'active',
    sku: ''
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (product) {
      setFormData({
        name: product.name || '',
        description: product.description || '',
        price: product.price || 0,
        compare_at_price: product.compare_at_price,
        category: product.category || 'Mobilier',
        vendor: product.vendor || 'Boutique',
        image_url: product.image_url || '',
        product_url: product.product_url || '',
        stock: product.stock || 0,
        status: product.status || 'active',
        sku: product.sku || ''
      });
    }
  }, [product]);

  const handleInputChange = (field: keyof Product, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.name?.trim()) {
      newErrors.name = 'Le nom du produit est requis';
    }

    if (!formData.price || formData.price <= 0) {
      newErrors.price = 'Le prix doit être supérieur à 0';
    }

    if (!formData.category?.trim()) {
      newErrors.category = 'La catégorie est requise';
    }

    if (!formData.vendor?.trim()) {
      newErrors.vendor = 'Le vendeur est requis';
    }

    if (formData.stock === undefined || formData.stock < 0) {
      newErrors.stock = 'Le stock doit être supérieur ou égal à 0';
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

  const categories = [
    'Mobilier', 'Canapé', 'Chaise', 'Table', 'Lit', 'Rangement',
    'Éclairage', 'Décoration', 'Extérieur', 'Bureau'
  ];

  const statusOptions = [
    { value: 'active', label: 'Actif' },
    { value: 'inactive', label: 'Inactif' },
    { value: 'draft', label: 'Brouillon' }
  ];

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-slate-800/95 backdrop-blur-xl rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto border border-slate-600/50">
        <div className="flex items-center justify-between p-6 border-b border-slate-600/50">
          <h2 className="text-2xl font-bold text-white flex items-center gap-2">
            <Package className="w-6 h-6 text-cyan-400" />
            {product ? 'Modifier le produit' : 'Ajouter un produit'}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white transition-colors text-2xl"
          >
            ×
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Informations de base */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-white mb-4">Informations de base</h3>
              
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Nom du produit *
                </label>
                <input
                  type="text"
                  value={formData.name || ''}
                  onChange={(e) => handleInputChange('name', e.target.value)}
                  className={`w-full bg-black/40 border rounded-xl px-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-cyan-400/30 ${
                    errors.name ? 'border-red-500' : 'border-gray-600'
                  }`}
                  placeholder="Ex: Canapé ALYANA convertible"
                />
                {errors.name && <p className="text-red-400 text-sm mt-1">{errors.name}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Description
                </label>
                <textarea
                  value={formData.description || ''}
                  onChange={(e) => handleInputChange('description', e.target.value)}
                  rows={4}
                  className="w-full bg-black/40 border border-gray-600 rounded-xl px-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-cyan-400/30"
                  placeholder="Description détaillée du produit..."
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Catégorie *
                  </label>
                  <select
                    value={formData.category || ''}
                    onChange={(e) => handleInputChange('category', e.target.value)}
                    className={`w-full bg-black/40 border rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-cyan-400/30 ${
                      errors.category ? 'border-red-500' : 'border-gray-600'
                    }`}
                  >
                    {categories.map(cat => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                  {errors.category && <p className="text-red-400 text-sm mt-1">{errors.category}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Vendeur *
                  </label>
                  <input
                    type="text"
                    value={formData.vendor || ''}
                    onChange={(e) => handleInputChange('vendor', e.target.value)}
                    className={`w-full bg-black/40 border rounded-xl px-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-cyan-400/30 ${
                      errors.vendor ? 'border-red-500' : 'border-gray-600'
                    }`}
                    placeholder="Ex: Decora Home"
                  />
                  {errors.vendor && <p className="text-red-400 text-sm mt-1">{errors.vendor}</p>}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  SKU
                </label>
                <input
                  type="text"
                  value={formData.sku || ''}
                  onChange={(e) => handleInputChange('sku', e.target.value)}
                  className="w-full bg-black/40 border border-gray-600 rounded-xl px-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-cyan-400/30"
                  placeholder="Ex: ALYAAVCOTBEI-DH"
                />
              </div>
            </div>

            {/* Prix et stock */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-white mb-4">Prix et stock</h3>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Prix *
                  </label>
                  <div className="relative">
                    <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      type="number"
                      step="0.01"
                      min="0"
                      value={formData.price || ''}
                      onChange={(e) => handleInputChange('price', parseFloat(e.target.value) || 0)}
                      className={`w-full bg-black/40 border rounded-xl pl-10 pr-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-cyan-400/30 ${
                        errors.price ? 'border-red-500' : 'border-gray-600'
                      }`}
                      placeholder="0.00"
                    />
                  </div>
                  {errors.price && <p className="text-red-400 text-sm mt-1">{errors.price}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Prix comparé
                  </label>
                  <div className="relative">
                    <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      type="number"
                      step="0.01"
                      min="0"
                      value={formData.compare_at_price || ''}
                      onChange={(e) => handleInputChange('compare_at_price', parseFloat(e.target.value) || undefined)}
                      className="w-full bg-black/40 border border-gray-600 rounded-xl pl-10 pr-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-cyan-400/30"
                      placeholder="0.00"
                    />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Stock *
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={formData.stock || ''}
                    onChange={(e) => handleInputChange('stock', parseInt(e.target.value) || 0)}
                    className={`w-full bg-black/40 border rounded-xl px-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-cyan-400/30 ${
                      errors.stock ? 'border-red-500' : 'border-gray-600'
                    }`}
                    placeholder="0"
                  />
                  {errors.stock && <p className="text-red-400 text-sm mt-1">{errors.stock}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Statut
                  </label>
                  <select
                    value={formData.status || 'active'}
                    onChange={(e) => handleInputChange('status', e.target.value as 'active' | 'inactive' | 'draft')}
                    className="w-full bg-black/40 border border-gray-600 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-cyan-400/30"
                  >
                    {statusOptions.map(option => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  URL de l'image
                </label>
                <div className="relative">
                  <Image className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="url"
                    value={formData.image_url || ''}
                    onChange={(e) => handleInputChange('image_url', e.target.value)}
                    className="w-full bg-black/40 border border-gray-600 rounded-xl pl-10 pr-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-cyan-400/30"
                    placeholder="https://example.com/image.jpg"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  URL du produit
                </label>
                <input
                  type="url"
                  value={formData.product_url || ''}
                  onChange={(e) => handleInputChange('product_url', e.target.value)}
                  className="w-full bg-black/40 border border-gray-600 rounded-xl px-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-cyan-400/30"
                  placeholder="https://example.com/product"
                />
              </div>
            </div>
          </div>

          {/* Preview */}
          {formData.image_url && (
            <div className="bg-black/20 rounded-xl p-4">
              <h4 className="text-white font-semibold mb-3">Aperçu</h4>
              <div className="flex gap-4">
                <div className="w-24 h-24 rounded-lg overflow-hidden bg-gray-600 flex-shrink-0">
                  <img 
                    src={formData.image_url} 
                    alt={formData.name}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      target.src = 'https://images.pexels.com/photos/1350789/pexels-photo-1350789.jpeg';
                    }}
                  />
                </div>
                <div className="flex-1">
                  <h5 className="font-semibold text-white">{formData.name || 'Nom du produit'}</h5>
                  <p className="text-gray-400 text-sm">{formData.vendor} • {formData.category}</p>
                  <div className="flex items-center gap-2 mt-2">
                    <span className="text-xl font-bold text-green-400">{formData.price}€</span>
                    {formData.compare_at_price && formData.compare_at_price > (formData.price || 0) && (
                      <span className="text-gray-400 line-through text-sm">{formData.compare_at_price}€</span>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

          <div className="flex justify-end gap-4 pt-6 border-t border-slate-600/50">
            <button
              type="button"
              onClick={onClose}
              className="bg-gray-600 hover:bg-gray-700 text-white px-6 py-3 rounded-xl transition-all"
            >
              Annuler
            </button>
            <button
              type="submit"
              className="bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white px-6 py-3 rounded-xl font-semibold transition-all flex items-center gap-2"
            >
              <Save className="w-4 h-4" />
              {product ? 'Modifier' : 'Ajouter'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};