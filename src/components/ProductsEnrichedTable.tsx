import React, { useState, useEffect } from 'react';
import { 
  Search, Filter, Plus, Eye, Edit, Trash2, ExternalLink, 
  Package, Tag, DollarSign, Image, BarChart3, Settings,
  ChevronDown, ChevronUp, X, Save, AlertCircle, CheckCircle,
  Upload, Loader2, Database, Zap
} from 'lucide-react';
import { useNotifications } from './NotificationSystem';

interface EnrichedProduct {
  id: string;
  handle: string;
  title: string;
  description: string;
  price: number;
  compare_at_price?: number;
  category: string;
  subcategory: string;
  vendor: string;
  brand: string;
  material: string;
  color: string;
  style: string;
  room: string;
  dimensions: string;
  weight: string;
  capacity: string;
  stock_qty: number;
  image_url: string;
  product_url: string;
  seo_title: string;
  seo_description: string;
  tags: string[];
  ai_confidence: number;
  enrichment_source: string;
  created_at: string;
  updated_at: string;
}

export const ProductsEnrichedTable: React.FC = () => {
  const [products, setProducts] = useState<EnrichedProduct[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<EnrichedProduct[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedSource, setSelectedSource] = useState('all');
  const [showFilters, setShowFilters] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isImporting, setIsImporting] = useState(false);
  const { showSuccess, showError, showInfo } = useNotifications();

  const [currentUser, setCurrentUser] = useState(() => {
    const loggedUser = localStorage.getItem('current_logged_user');
    if (loggedUser) {
      try {
        return JSON.parse(loggedUser);
      } catch {
        return null;
      }
    }
    return null;
  });

  useEffect(() => {
    loadEnrichedProducts();
  }, []);

  useEffect(() => {
    // Filtrer les produits
    let filtered = products;

    if (searchTerm) {
      filtered = filtered.filter(product =>
        product.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.vendor.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.material.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.color.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (selectedCategory !== 'all') {
      filtered = filtered.filter(product => product.category === selectedCategory);
    }

    if (selectedSource !== 'all') {
      filtered = filtered.filter(product => product.enrichment_source === selectedSource);
    }

    setFilteredProducts(filtered);
  }, [products, searchTerm, selectedCategory, selectedSource]);

  const loadEnrichedProducts = async () => {
    try {
      setIsLoading(true);
      
      // Vérifier la configuration Supabase
      const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
      const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

      if (!supabaseUrl || !supabaseKey) {
        console.log('⚠️ Supabase non configuré, chargement des produits locaux');
        loadLocalProducts();
        return;
      }

      if (!supabaseUrl.startsWith('http')) {
        console.error('❌ URL Supabase invalide:', supabaseUrl);
        showError('Configuration Supabase', 'URL Supabase invalide. Vérifiez votre fichier .env');
        loadLocalProducts();
        return;
      }

      console.log('📦 Chargement produits enrichis depuis Supabase...');

      const response = await fetch(`${supabaseUrl}/rest/v1/products_enriched?select=*&order=created_at.desc&limit=100`, {
        headers: {
          'apikey': supabaseKey,
          'Authorization': `Bearer ${supabaseKey}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        console.log('✅ Produits enrichis chargés:', data.length);
        setProducts(data);
      } else {
        console.log('⚠️ Erreur chargement Supabase, fallback local');
        loadLocalProducts();
      }

    } catch (error) {
      console.error('❌ Erreur chargement Supabase:', error);
      showError('Erreur chargement', 'Impossible de charger les produits enrichis depuis Supabase');
      loadLocalProducts();
    } finally {
      setIsLoading(false);
    }
  };

  const loadLocalProducts = () => {
    try {
      // Charger depuis localStorage comme fallback
      const localProducts = localStorage.getItem('catalog_products');
      if (localProducts) {
        const parsed = JSON.parse(localProducts);
        const enrichedLocal = parsed.map((product: any) => ({
          id: product.id || `local-${Date.now()}-${Math.random()}`,
          handle: product.handle || product.id,
          title: product.name || product.title || 'Produit sans nom',
          description: product.description || '',
          price: parseFloat(product.price) || 0,
          compare_at_price: product.compare_at_price,
          category: product.category || product.productType || 'Mobilier',
          subcategory: '',
          vendor: product.vendor || 'Decora Home',
          brand: product.vendor || 'Decora Home',
          material: '',
          color: '',
          style: '',
          room: '',
          dimensions: '',
          weight: '',
          capacity: '',
          stock_qty: parseInt(product.stock) || 0,
          image_url: product.image_url || 'https://images.pexels.com/photos/1350789/pexels-photo-1350789.jpeg',
          product_url: product.product_url || '#',
          seo_title: product.title || '',
          seo_description: '',
          tags: Array.isArray(product.tags) ? product.tags : [],
          ai_confidence: 0.5,
          enrichment_source: 'local',
          created_at: product.created_at || new Date().toISOString(),
          updated_at: product.updated_at || new Date().toISOString()
        }));
        
        console.log('📦 Produits locaux chargés:', enrichedLocal.length);
        setProducts(enrichedLocal);
      }
    } catch (error) {
      console.error('❌ Erreur chargement local:', error);
      setProducts([]);
    }
  };

  const handleImportCatalog = async () => {
    try {
      setIsImporting(true);
      showInfo('Import en cours', 'Démarrage de l\'import automatique du catalogue...');

      // Vérifier la configuration Supabase
      const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
      const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

      if (!supabaseUrl || !supabaseKey) {
        showError(
          'Configuration manquante', 
          'Supabase non configuré. Cliquez sur "Connect to Supabase" en haut à droite pour configurer la base de données.'
        );
        return;
      }

      if (!supabaseUrl.startsWith('http')) {
        showError(
          'URL invalide', 
          'L\'URL Supabase est invalide. Vérifiez votre configuration dans les variables d\'environnement.'
        );
        return;
      }

      // Récupérer les produits du catalogue local
      const localProducts = localStorage.getItem('catalog_products');
      if (!localProducts) {
        showError(
          'Catalogue vide', 
          'Aucun produit trouvé dans le catalogue local. Importez d\'abord des produits via CSV ou Shopify.'
        );
        return;
      }

      const products = JSON.parse(localProducts);
      console.log('📦 Produits à importer:', products.length);

      if (products.length === 0) {
        showError('Catalogue vide', 'Aucun produit à importer.');
        return;
      }

      // Préparer les données pour l'import
      const importData = {
        products: products.map((product: any) => ({
          external_id: product.id || `import-${Date.now()}-${Math.random()}`,
          name: product.name || product.title || 'Produit sans nom',
          description: product.description || '',
          price: parseFloat(product.price) || 0,
          compare_at_price: product.compare_at_price ? parseFloat(product.compare_at_price) : null,
          category: product.category || product.productType || 'Mobilier',
          vendor: product.vendor || 'Decora Home',
          image_url: product.image_url || '',
          product_url: product.product_url || '#',
          stock: parseInt(product.stock) || 0,
          source_platform: 'catalog_import',
          status: 'active',
          extracted_attributes: product.extracted_attributes || {}
        })),
        retailer_id: currentUser?.email || 'demo-retailer-id',
        source: 'catalog_import'
      };

      console.log('🚀 Envoi à save-imported-products...');

      // Appeler la fonction Supabase
      const response = await fetch(`${supabaseUrl}/functions/v1/save-imported-products`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${supabaseKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(importData)
      });

      if (!response.ok) {
        const errorData = await response.json();
        console.error('❌ Erreur import catalogue:', errorData);
        throw new Error(errorData.details || errorData.error || 'Erreur inconnue');
      }

      const result = await response.json();
      console.log('✅ Import réussi:', result);

      // Déclencher l'enrichissement automatique
      try {
        showInfo('Enrichissement IA', 'Démarrage de l\'enrichissement automatique avec DeepSeek...');

        const enrichResponse = await fetch(`${supabaseUrl}/functions/v1/enrich-products`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${supabaseKey}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            products: importData.products,
            source: 'catalog_import',
            retailer_id: currentUser?.email || 'demo-retailer-id'
          })
        });

        if (enrichResponse.ok) {
          const enrichResult = await enrichResponse.json();
          console.log('✅ Enrichissement réussi:', enrichResult.stats);
          
          showSuccess(
            'Import et enrichissement terminés !',
            `${result.saved_count} produits importés et ${enrichResult.stats?.enriched_count || 0} enrichis avec l'IA !`,
            [
              {
                label: 'Voir catalogue enrichi',
                action: () => loadEnrichedProducts(),
                variant: 'primary'
              },
              {
                label: 'Tester OmnIA',
                action: () => window.open('/robot', '_blank'),
                variant: 'secondary'
              }
            ]
          );
        } else {
          showSuccess(
            'Import terminé',
            `${result.saved_count} produits importés avec succès ! Enrichissement en arrière-plan...`
          );
        }
      } catch (enrichError) {
        console.log('⚠️ Enrichissement échoué:', enrichError);
        showSuccess(
          'Import terminé',
          `${result.saved_count} produits importés avec succès ! Enrichissement en arrière-plan...`
        );
      }

      // Recharger les produits enrichis
      await loadEnrichedProducts();

    } catch (error) {
      console.error('❌ Erreur import catalogue:', error);
      showError(
        'Erreur import catalogue',
        error.message || 'Erreur lors de l\'import automatique du catalogue'
      );
    } finally {
      setIsImporting(false);
    }
  };

  const categories = [...new Set(products.map(p => p.category))];
  const sources = [...new Set(products.map(p => p.enrichment_source))];

  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 0.8) return 'text-green-400';
    if (confidence >= 0.6) return 'text-yellow-400';
    return 'text-red-400';
  };

  const getSourceColor = (source: string) => {
    switch (source) {
      case 'deepseek': return 'bg-purple-500/20 text-purple-300';
      case 'openai': return 'bg-green-500/20 text-green-300';
      case 'manual': return 'bg-blue-500/20 text-blue-300';
      case 'local': return 'bg-gray-500/20 text-gray-300';
      default: return 'bg-gray-500/20 text-gray-300';
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-cyan-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-white text-lg">Chargement du catalogue enrichi...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header avec actions */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-white">Catalogue Enrichi IA</h2>
          <p className="text-gray-300">{filteredProducts.length} produit(s) enrichi(s) sur {products.length}</p>
        </div>
        
        <div className="flex flex-wrap gap-3">
          <button
            onClick={handleImportCatalog}
            disabled={isImporting}
            className="bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-400 hover:to-emerald-500 disabled:from-gray-600 disabled:to-gray-700 text-white px-6 py-3 rounded-xl font-semibold transition-all disabled:cursor-not-allowed flex items-center gap-2"
          >
            {isImporting ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                Import en cours...
              </>
            ) : (
              <>
                <Zap className="w-5 h-5" />
                🚀 Lancer Import Automatique
              </>
            )}
          </button>
          
          <button
            onClick={loadEnrichedProducts}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-3 rounded-xl flex items-center gap-2 transition-all"
          >
            <Database className="w-4 h-4" />
            Actualiser
          </button>
        </div>
      </div>

      {/* Barre de recherche et filtres */}
      <div className="bg-white/10 backdrop-blur-xl rounded-2xl p-6 border border-white/20">
        <div className="flex flex-col lg:flex-row gap-4">
          {/* Recherche */}
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Rechercher par nom, catégorie, matériau, couleur..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-3 bg-black/40 border border-gray-600 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:border-cyan-400 focus:ring-2 focus:ring-cyan-400/30"
            />
          </div>
          
          {/* Bouton filtres */}
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-3 rounded-xl flex items-center gap-2 transition-all"
          >
            <Filter className="w-4 h-4" />
            Filtres
            {showFilters ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </button>
        </div>

        {/* Filtres étendus */}
        {showFilters && (
          <div className="mt-6 pt-6 border-t border-gray-600/50">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm text-gray-300 mb-2">Catégorie</label>
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="w-full bg-black/40 border border-gray-600 rounded-xl px-3 py-2 text-white"
                >
                  <option value="all">Toutes les catégories</option>
                  {categories.map(category => (
                    <option key={category} value={category}>{category}</option>
                  ))}
                </select>
              </div>
              
              <div>
                <label className="block text-sm text-gray-300 mb-2">Source enrichissement</label>
                <select
                  value={selectedSource}
                  onChange={(e) => setSelectedSource(e.target.value)}
                  className="w-full bg-black/40 border border-gray-600 rounded-xl px-3 py-2 text-white"
                >
                  <option value="all">Toutes les sources</option>
                  {sources.map(source => (
                    <option key={source} value={source}>
                      {source === 'deepseek' ? 'DeepSeek IA' : 
                       source === 'openai' ? 'OpenAI' : 
                       source === 'manual' ? 'Manuel' : 
                       source === 'local' ? 'Local' : source}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Tableau des produits enrichis */}
      <div className="bg-white/10 backdrop-blur-xl rounded-2xl border border-white/20 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-black/20">
              <tr>
                <th className="text-left p-4 text-cyan-300 font-semibold">Produit</th>
                <th className="text-left p-4 text-cyan-300 font-semibold">Prix</th>
                <th className="text-left p-4 text-cyan-300 font-semibold">Attributs IA</th>
                <th className="text-left p-4 text-cyan-300 font-semibold">SEO</th>
                <th className="text-left p-4 text-cyan-300 font-semibold">Confiance</th>
                <th className="text-left p-4 text-cyan-300 font-semibold">Source</th>
                <th className="text-left p-4 text-cyan-300 font-semibold">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredProducts.map((product) => (
                <tr key={product.id} className="border-b border-white/10 hover:bg-white/5">
                  <td className="p-4">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-lg overflow-hidden bg-gray-600 flex-shrink-0">
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
                        <div className="text-gray-400 text-xs">{product.vendor}</div>
                        <div className="text-gray-500 text-xs">{product.category}</div>
                      </div>
                    </div>
                  </td>
                  <td className="p-4">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-green-400">{product.price}€</span>
                      {product.compare_at_price && product.compare_at_price > product.price && (
                        <span className="text-gray-400 line-through text-sm">{product.compare_at_price}€</span>
                      )}
                    </div>
                  </td>
                  <td className="p-4">
                    <div className="space-y-1">
                      {product.material && (
                        <span className="inline-block bg-blue-500/20 text-blue-300 px-2 py-1 rounded text-xs mr-1">
                          {product.material}
                        </span>
                      )}
                      {product.color && (
                        <span className="inline-block bg-purple-500/20 text-purple-300 px-2 py-1 rounded text-xs mr-1">
                          {product.color}
                        </span>
                      )}
                      {product.style && (
                        <span className="inline-block bg-orange-500/20 text-orange-300 px-2 py-1 rounded text-xs mr-1">
                          {product.style}
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="p-4">
                    <div className="text-xs">
                      <div className="text-white font-medium line-clamp-1">{product.seo_title}</div>
                      <div className="text-gray-400 line-clamp-2">{product.seo_description}</div>
                    </div>
                  </td>
                  <td className="p-4">
                    <span className={`font-bold ${getConfidenceColor(product.ai_confidence)}`}>
                      {Math.round(product.ai_confidence * 100)}%
                    </span>
                  </td>
                  <td className="p-4">
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${getSourceColor(product.enrichment_source)}`}>
                      {product.enrichment_source}
                    </span>
                  </td>
                  <td className="p-4">
                    <div className="flex gap-2">
                      <a
                        href={product.product_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-purple-400 hover:text-purple-300 p-1"
                        title="Ouvrir lien externe"
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

      {/* Message si aucun produit */}
      {filteredProducts.length === 0 && (
        <div className="text-center py-20">
          <Package className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-xl font-bold text-white mb-2">Aucun produit enrichi trouvé</h3>
          <p className="text-gray-400 mb-6">
            {searchTerm || selectedCategory !== 'all' || selectedSource !== 'all'
              ? 'Aucun produit ne correspond à vos critères de recherche.'
              : 'Votre catalogue enrichi est vide. Importez des produits pour commencer.'}
          </p>
          <button
            onClick={handleImportCatalog}
            disabled={isImporting}
            className="bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-400 hover:to-emerald-500 disabled:from-gray-600 disabled:to-gray-700 text-white px-6 py-3 rounded-xl font-semibold transition-all disabled:cursor-not-allowed flex items-center gap-2"
          >
            {isImporting ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                Import en cours...
              </>
            ) : (
              <>
                <Zap className="w-5 h-5" />
                Importer le catalogue
              </>
            )}
          </button>
        </div>
      )}

      {/* Info panel */}
      <div className="bg-gradient-to-r from-cyan-500/20 to-blue-600/20 backdrop-blur-xl rounded-2xl p-6 border border-cyan-400/30">
        <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
          <BarChart3 className="w-5 h-5 text-cyan-400" />
          À propos du catalogue enrichi
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h4 className="font-semibold text-cyan-300 mb-2">🤖 Enrichissement IA :</h4>
            <ul className="text-cyan-200 text-sm space-y-1">
              <li>• Extraction automatique des attributs (couleur, matériau, style)</li>
              <li>• Optimisation SEO avec titres et descriptions</li>
              <li>• Classification intelligente par pièce et usage</li>
              <li>• Score de confiance IA pour chaque produit</li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold text-cyan-300 mb-2">📊 Utilisation :</h4>
            <ul className="text-cyan-200 text-sm space-y-1">
              <li>• Améliore les réponses d'OmnIA Robot</li>
              <li>• Recherche intelligente par attributs</li>
              <li>• Recommandations personnalisées clients</li>
              <li>• Export pour Google Shopping et SEO</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};