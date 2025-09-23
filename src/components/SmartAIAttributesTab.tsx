import React, { useState, useEffect } from 'react';
import { 
  Brain, Zap, RefreshCw, Loader2, CheckCircle, AlertCircle, 
  Search, Filter, Eye, Edit, Trash2, ExternalLink, 
  Package, Tag, DollarSign, Image, BarChart3, Settings,
  ChevronDown, ChevronUp, X, Save, Upload, Download,
  Sparkles, Database, Globe, Star, TrendingUp, Store
} from 'lucide-react';
import { useNotifications } from './NotificationSystem';
import { supabase } from '../lib/supabase';

interface SmartAIProduct {
  id: string;
  handle: string;
  retailer_id: string;
  title: string;
  description: string;
  short_description: string;
  product_type: string;
  subcategory: string;
  tags: string[];
  brand: string;
  vendor: string;
  material: string;
  color: string;
  style: string;
  room: string;
  dimensions: string;
  weight: string;
  capacity: string;
  price: number;
  compare_at_price?: number;
  currency: string;
  stock_quantity: number;
  availability_status: string;
  gtin: string;
  mpn: string;
  identifier_exists: boolean;
  stock_qty: number;
  image_url: string;
  additional_image_links: string[];
  product_url: string;
  canonical_link: string;
  percent_off: number;
  ai_confidence: number;
  created_at: string;
  updated_at: string;
  seo_title?: string;
  seo_description?: string;
}

const generateHandle = (title: string) => {
  return title.toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .trim();
};

export const SmartAIAttributesTab: React.FC = () => {
  const [products, setProducts] = useState<SmartAIProduct[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<SmartAIProduct[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [loading, setLoading] = useState(true);
  const [isEnriching, setIsEnriching] = useState(false);
  const [enrichmentProgress, setEnrichmentProgress] = useState(0);
  const [showSyncModal, setShowSyncModal] = useState(false);
  const [syncProgress, setSyncProgress] = useState(0);
  const [estimatedTimeRemaining, setEstimatedTimeRemaining] = useState(0);
  const [syncStartTime, setSyncStartTime] = useState(0);
  const [progressIntervalId, setProgressIntervalId] = useState<NodeJS.Timeout | null>(null);
  const [syncStats, setSyncStats] = useState<any>(null);
  const [shopifyConfig, setShopifyConfig] = useState({
    domain: '',
    token: ''
  });
  const [isTestingShopify, setIsTestingShopify] = useState(false);
  const [shopifyStatus, setShopifyStatus] = useState<'disconnected' | 'connected' | 'error'>('disconnected');
  const [showShopifyConfig, setShowShopifyConfig] = useState(false);
  const [showCSVImport, setShowCSVImport] = useState(false);
  const [csvFile, setCsvFile] = useState<File | null>(null);
  const [isProcessingCSV, setIsProcessingCSV] = useState(false);
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

  const { showSuccess, showError, showInfo } = useNotifications();

  // Générer clé de stockage spécifique au revendeur
  const getRetailerStorageKey = (key: string) => {
    if (!currentUser?.email) return key;
    const emailHash = btoa(currentUser.email).replace(/[^a-zA-Z0-9]/g, '').substring(0, 8);
    return `${key}_${emailHash}`;
  };

  useEffect(() => {
    loadSmartAIProducts();
    loadShopifyConfig();
  }, []);

  useEffect(() => {
    filterProducts();
  }, [products, searchTerm, selectedCategory]);

  const filterProducts = () => {
    let filtered = products;

    if (searchTerm) {
      filtered = filtered.filter(product =>
        product.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.product_type.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.material?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.color?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.style?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.room?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (selectedCategory !== 'all') {
      filtered = filtered.filter(product => product.product_type === selectedCategory);
    }

    setFilteredProducts(filtered);
  };

  const loadShopifyConfig = () => {
    try {
      const savedConfig = localStorage.getItem(getRetailerStorageKey('shopify_config'));
      if (savedConfig) {
        const config = JSON.parse(savedConfig);
        setShopifyConfig(config);
        if (config.domain && config.token) {
          setShopifyStatus('connected');
        }
      }
    } catch (error) {
      console.error('❌ Erreur chargement config Shopify:', error);
    }
  };

  const saveShopifyConfig = () => {
    try {
      localStorage.setItem(getRetailerStorageKey('shopify_config'), JSON.stringify(shopifyConfig));
      showSuccess('Configuration sauvegardée', 'Configuration Shopify sauvegardée avec succès.');
    } catch (error) {
      console.error('❌ Erreur sauvegarde config:', error);
      showError('Erreur sauvegarde', 'Impossible de sauvegarder la configuration.');
    }
  };

  const testShopifyConnection = async () => {
    if (!shopifyConfig.domain || !shopifyConfig.token) {
      showError('Configuration incomplète', 'Veuillez remplir le domaine et le token Shopify.');
      return;
    }

    setIsTestingShopify(true);
    setShopifyStatus('disconnected');

    try {
      const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
      const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
      
      if (!supabaseUrl || !supabaseKey) {
        throw new Error('Supabase non configuré');
      }

      const response = await fetch(`${supabaseUrl}/functions/v1/shopify-admin-api`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${supabaseKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: 'test_connection',
          shop_domain: shopifyConfig.domain,
          access_token: shopifyConfig.token
        }),
      });

      if (response.ok) {
        const result = await response.json();
        if (result.success) {
          setShopifyStatus('connected');
          showSuccess('Connexion réussie', `Boutique ${result.shop_info?.name || shopifyConfig.domain} connectée !`);
          saveShopifyConfig();
        } else {
          setShopifyStatus('error');
          showError('Test échoué', result.error || 'Erreur de connexion Shopify.');
        }
      } else {
        setShopifyStatus('error');
        showError('Erreur API', 'Impossible de tester la connexion Shopify.');
      }
    } catch (error) {
      console.error('❌ Erreur test Shopify:', error);
      setShopifyStatus('error');
      showError('Erreur de test', 'Erreur lors du test de connexion.');
    } finally {
      setIsTestingShopify(false);
    }
  };

  const syncFromShopify = async () => {
    if (shopifyStatus !== 'connected') {
      showError('Shopify non connecté', 'Veuillez d\'abord tester et valider la connexion Shopify.');
      return;
    }

    try {
      setShowSyncModal(true);
      showInfo('Synchronisation Shopify', 'Import des produits depuis Shopify...');

      const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
      const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

      // Récupérer les produits Shopify
      const response = await fetch(`${supabaseUrl}/functions/v1/shopify-admin-api`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${supabaseKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: 'get_products',
          shop_domain: shopifyConfig.domain,
          access_token: shopifyConfig.token,
          limit: 100
        }),
      });

      if (!response.ok) {
        throw new Error('Erreur récupération produits Shopify');
      }

      const shopifyData = await response.json();
      if (!shopifyData.success) {
        throw new Error(shopifyData.error || 'Erreur Shopify API');
      }

      // Enrichir avec DeepSeek
      const enrichResponse = await fetch(`${supabaseUrl}/functions/v1/enrich-products`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${supabaseKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          products: shopifyData.products,
          source: 'shopify_smart_ai',
          retailer_id: currentUser?.email || 'demo-retailer-id'
        }),
      });

      if (enrichResponse.ok) {
        const enrichResult = await enrichResponse.json();
        console.log('✅ Enrichissement Shopify réussi:', enrichResult.stats);
        
        // Sauvegarder en localStorage aussi
        localStorage.setItem(getRetailerStorageKey('smart_ai_products'), JSON.stringify(enrichResult.enriched_products || []));
        
        await loadSmartAIProducts();
        setSyncStats(enrichResult.stats);
        
        showSuccess(
          'Synchronisation Shopify terminée !', 
          `${enrichResult.stats?.enriched_count || shopifyData.products.length} produits Shopify enrichis !`
        );
      } else {
        throw new Error('Erreur enrichissement DeepSeek');
      }

    } catch (error) {
      console.error('❌ Erreur sync Shopify:', error);
      showError('Erreur synchronisation', 'Impossible de synchroniser avec Shopify.');
    } finally {
      setShowSyncModal(false);
    }
  };

  const handleSyncFromCSV = async () => {
    setShowCSVImport(true);
  };

  const loadSmartAIProducts = async () => {
    try {
      setLoading(true);
      
      // Essayer de charger depuis Supabase d'abord
      try {
        const { data: enrichedProducts, error } = await supabase
          .from('products_enriched')
          .select('*')
          .gt('stock_qty', 0)
          .order('created_at', { ascending: false });

        if (error) {
          console.error('❌ Erreur chargement Supabase:', error);
          throw error;
        }

        if (enrichedProducts && enrichedProducts.length > 0) {
          console.log(`✅ Produits SMART AI chargés depuis Supabase:`, enrichedProducts.length);
          setProducts(enrichedProducts);
          return;
        }
      } catch (supabaseError) {
        console.log('⚠️ Supabase indisponible, chargement depuis localStorage...');
      }

      // Fallback: charger depuis localStorage
      const localProducts = localStorage.getItem(getRetailerStorageKey('smart_ai_products'));
      if (localProducts) {
        try {
          const parsedProducts = JSON.parse(localProducts);
          console.log(`✅ Produits SMART AI chargés depuis localStorage:`, parsedProducts.length);
          setProducts(parsedProducts);
        } catch (parseError) {
          console.error('❌ Erreur parsing localStorage:', parseError);
          setProducts([]);
        }
      } else {
        console.log(`📦 Aucun produit SMART AI trouvé`);
        setProducts([]);
      }
      
    } catch (error) {
      console.error('❌ Erreur:', error);
      showError('Erreur', 'Erreur lors du chargement des produits SMART AI.');
      setProducts([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSyncWithCatalog = async () => {
    try {
      const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
      const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
      
      if (!supabaseUrl || !supabaseKey) {
        showError('Configuration manquante', 'Supabase non configuré. Cliquez sur "Connect to Supabase" en haut à droite.');
        return;
      }

      // Récupérer les produits du catalogue local
      const catalogProducts = localStorage.getItem(getRetailerStorageKey('catalog_products'));
      if (!catalogProducts) {
        showError('Catalogue vide', 'Aucun produit trouvé dans le catalogue. Allez dans l\'onglet "Catalogue" pour importer vos produits.');
        return;
      }

      const products = JSON.parse(catalogProducts);
      console.log(`📦 Synchronisation SMART AI pour ${currentUser?.email} - ${products.length} produits...`);

      if (products.length === 0) {
        showError('Catalogue vide', 'Aucun produit trouvé dans votre catalogue. Allez dans l\'onglet "Catalogue" pour importer vos produits.');
        return;
      }

      setShowSyncModal(true);
      setSyncProgress(0);
      setEstimatedTimeRemaining(Math.max(products.length * 2, 10)); // 2 secondes par produit minimum
      setSyncStartTime(Date.now());
      
      // Démarrer la simulation de progression
      const progressInterval = setInterval(() => {
        setSyncProgress(prev => {
          const newProgress = Math.min(prev + (100 / Math.max(products.length, 5)), 95);
          const elapsed = (Date.now() - Date.now()) / 1000;
          const estimated = Math.max(Math.round((100 - newProgress) * 0.5), 0);
          setEstimatedTimeRemaining(estimated);
          return newProgress;
        });
      }, 1000);
      
      setProgressIntervalId(progressInterval);
      showInfo('Synchronisation démarrée', 'Enrichissement des produits avec DeepSeek IA...');
      
      // Appeler la fonction d'enrichissement Supabase
      const response = await fetch(`${supabaseUrl}/functions/v1/enrich-products`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${supabaseKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          products: products,
          source: 'smart_ai_sync',
          retailer_id: currentUser?.email || 'demo-retailer-id'
        }),
      });

      // Arrêter la progression simulée
      if (progressInterval) {
        clearInterval(progressInterval);
      }
      setSyncProgress(100);
      setEstimatedTimeRemaining(0);

      if (!response.ok) {
        const errorText = await response.text();
        console.error('❌ Erreur enrichissement:', errorText);
        
        // Essayer de sauvegarder localement en cas d'erreur Supabase
        const enrichedProducts = products.map((product: any) => ({
          id: `smart-ai-${product.id || Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
          handle: product.handle || generateHandle(product.name || product.title || ''),
          retailer_id: currentUser?.email || 'demo-retailer-id',
          title: product.name || product.title || 'Produit sans nom',
          description: product.description || '',
          short_description: (product.description || product.title || '').substring(0, 160),
          product_type: product.category || 'Mobilier',
          subcategory: '',
          tags: [],
          vendor: product.vendor || 'Decora Home',
          brand: product.vendor || 'Decora Home',
          material: '',
          color: '',
          style: '',
          room: '',
          dimensions: '',
          weight: '',
          capacity: '',
          price: parseFloat(product.price) || 0,
          compare_at_price: product.compare_at_price ? parseFloat(product.compare_at_price) : undefined,
          currency: 'EUR',
          stock_quantity: parseInt(product.stock) || 0,
          stock_qty: parseInt(product.stock) || 0,
          availability_status: parseInt(product.stock) > 0 ? 'En stock' : 'Rupture',
          gtin: '',
          mpn: product.sku || '',
          identifier_exists: !!product.sku,
          image_url: product.image_url || 'https://images.pexels.com/photos/1350789/pexels-photo-1350789.jpeg',
          additional_image_links: [],
          product_url: product.product_url || '#',
          canonical_link: product.product_url || '#',
          percent_off: 0,
          ai_confidence: 0.5,
          seo_title: product.name || product.title || '',
          seo_description: (product.description || product.title || '').substring(0, 155),
          enrichment_source: 'local_fallback',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }));
        
        localStorage.setItem(getRetailerStorageKey('smart_ai_products'), JSON.stringify(enrichedProducts));
        setProducts(enrichedProducts);
        
        showError('Supabase indisponible', `Produits sauvegardés localement. ${enrichedProducts.length} produits disponibles en mode hors ligne.`);
        return;
      }

      const result = await response.json();
      console.log('✅ Enrichissement SMART AI réussi:', result.stats);
      
      // Sauvegarder aussi en localStorage pour backup
      if (result.enriched_products) {
        localStorage.setItem(getRetailerStorageKey('smart_ai_products'), JSON.stringify(result.enriched_products));
      }
      
      // Recharger les produits depuis Supabase
      await loadSmartAIProducts();
      
      setSyncStats(result.stats);
      
      showSuccess(
        'Synchronisation SMART AI terminée !', 
        `${result.stats?.enriched_count || products.length} produits enrichis avec tous les attributs IA !`,
        [
          {
            label: 'Voir les résultats',
            action: () => loadSmartAIProducts(),
            variant: 'primary'
          }
        ]
      );

    } catch (error) {
      console.error('❌ Erreur synchronisation SMART AI:', error);
      showError('Erreur de synchronisation', 'Impossible de synchroniser avec le catalogue.');
    } finally {
      setShowSyncModal(false);
      if (progressIntervalId) {
        clearInterval(progressIntervalId);
        setProgressIntervalId(null);
      }
    }
  };

  const handleEnrichWithDeepSeek = async () => {
    try {
      // Vérifier d'abord s'il y a des produits dans le catalogue
      const catalogProducts = localStorage.getItem(getRetailerStorageKey('catalog_products'));
      if (!catalogProducts) {
        showError('Catalogue vide', 'Aucun produit trouvé dans le catalogue. Importez d\'abord votre catalogue dans l\'onglet "Catalogue".');
        return;
      }

      const catalogProductsArray = JSON.parse(catalogProducts);
      if (catalogProductsArray.length === 0) {
        showError('Catalogue vide', 'Aucun produit trouvé. Importez votre catalogue CSV dans l\'onglet "Catalogue".');
        return;
      }

      const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
      const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
      
      if (!supabaseUrl || !supabaseKey) {
        showError('Configuration manquante', 'Supabase non configuré. Cliquez sur "Connect to Supabase" en haut à droite.');
        return;
      }

      setIsEnriching(true);
      setEnrichmentProgress(0);
      
      showInfo('Enrichissement démarré', 'Analyse avancée des produits avec DeepSeek IA...');

      // Simuler progression
      const progressInterval = setInterval(() => {
        setEnrichmentProgress(prev => Math.min(prev + 10, 90));
      }, 500);

      // Appeler la fonction d'enrichissement avancé
      const response = await fetch(`${supabaseUrl}/functions/v1/enrich-products`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${supabaseKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          products: catalogProductsArray,
          source: 'smart_ai_advanced',
          retailer_id: currentUser?.email || 'demo-retailer-id',
          advanced_enrichment: true
        }),
      });

      clearInterval(progressInterval);
      setEnrichmentProgress(100);

      if (!response.ok) {
        const errorText = await response.text();
        console.error('❌ Erreur enrichissement avancé:', errorText);
        showError('Erreur enrichissement', `Erreur API: ${response.status}. ${errorText}`);
        return;
      }

      const result = await response.json();
      console.log('✅ Enrichissement avancé réussi:', result.stats);
      
      // Recharger les produits
      await loadSmartAIProducts();
      
      showSuccess(
        'Enrichissement avancé terminé !', 
        `${result.stats?.enriched_count || catalogProductsArray.length} produits enrichis avec tous les attributs SMART AI !`
      );

    } catch (error) {
      console.error('❌ Erreur enrichissement avancé:', error);
      showError('Erreur d\'enrichissement', 'Impossible d\'enrichir les produits avec DeepSeek.');
    } finally {
      setIsEnriching(false);
      setEnrichmentProgress(0);
    }
  };

  const handleExportSmartAI = () => {
    if (products.length === 0) {
      showError('Aucun produit', 'Aucun produit à exporter.');
      return;
    }

    // Créer le CSV avec tous les champs SMART AI
    const headers = [
      'id', 'handle', 'title', 'description', 'short_description', 'product_type', 'subcategory',
      'tags', 'brand', 'vendor', 'material', 'color', 'style', 'room', 'dimensions', 'weight',
      'capacity', 'price', 'compare_at_price', 'currency', 'stock_quantity', 'availability_status',
      'gtin', 'mpn', 'identifier_exists', 'image_url', 'additional_image_links', 'product_url',
      'canonical_link', 'percent_off', 'ai_confidence', 'created_at', 'updated_at'
    ];

    const csvContent = [
      headers.join(','),
      ...products.map(product => 
        headers.map(header => {
          const value = product[header as keyof SmartAIProduct];
          if (Array.isArray(value)) {
            return `"${value.join(';')}"`;
          }
          if (typeof value === 'string' && value.includes(',')) {
            return `"${value}"`;
          }
          return value || '';
        }).join(',')
      )
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `smart-ai-attributes-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);

    showSuccess('Export réussi', `${products.length} produits SMART AI exportés en CSV.`);
  };

  const categories = [...new Set(products.map(p => p.product_type))].filter(Boolean);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="text-center">
          <Loader2 className="w-16 h-16 text-cyan-400 animate-spin mx-auto mb-4" />
          <p className="text-white text-lg">Chargement des attributs SMART AI...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header avec actions */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-white flex items-center gap-3">
            <Brain className="w-8 h-8 text-purple-400" />
            SMART AI Attributes
          </h2>
          <p className="text-gray-300">Catalogue enrichi avec 30 attributs IA optimisés pour Google Merchant & SEO</p>
          <p className="text-cyan-300 text-sm">{filteredProducts.length} produit(s) enrichi(s) sur {products.length}</p>
        </div>
        
        <div className="flex flex-wrap gap-3">
          <button
            onClick={() => setShowShopifyConfig(!showShopifyConfig)}
            className={`px-6 py-3 rounded-xl flex items-center gap-2 font-semibold transition-all ${
              shopifyStatus === 'connected' 
                ? 'bg-green-600 hover:bg-green-700 text-white' 
                : 'bg-orange-600 hover:bg-orange-700 text-white'
            }`}
          >
            <Store className="w-5 h-5" />
            {shopifyStatus === 'connected' ? 'Shopify Connecté' : 'Configurer Shopify'}
          </button>
          
          <button
            onClick={handleSyncWithCatalog}
            className="bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-400 hover:to-emerald-500 text-white px-6 py-3 rounded-xl flex items-center gap-2 font-semibold transition-all"
          >
            <Database className="w-5 h-5" />
            Sync Catalogue CSV
          </button>
          
          <button
            onClick={handleSyncFromCSV}
            className="bg-gradient-to-r from-blue-500 to-cyan-600 hover:from-blue-400 hover:to-cyan-500 text-white px-6 py-3 rounded-xl flex items-center gap-2 font-semibold transition-all"
          >
            <Upload className="w-5 h-5" />
            Import CSV Direct
          </button>
          
          {shopifyStatus === 'connected' && (
            <button
              onClick={syncFromShopify}
              className="bg-gradient-to-r from-green-500 to-blue-600 hover:from-green-400 hover:to-blue-500 text-white px-6 py-3 rounded-xl flex items-center gap-2 font-semibold transition-all"
            >
              <Store className="w-5 h-5" />
              Sync Shopify
            </button>
          )}
          
          <button
            onClick={handleEnrichWithDeepSeek}
            disabled={isEnriching}
            className="bg-gradient-to-r from-purple-500 to-pink-600 hover:from-purple-400 hover:to-pink-500 disabled:from-gray-600 disabled:to-gray-700 text-white px-6 py-3 rounded-xl flex items-center gap-2 font-semibold transition-all disabled:cursor-not-allowed"
          >
            {isEnriching ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                Enrichissement... {enrichmentProgress}%
              </>
            ) : (
              <>
                <Brain className="w-5 h-5" />
                Enrichir avec DeepSeek
              </>
            )}
          </button>
          
          <button
            onClick={handleExportSmartAI}
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-xl flex items-center gap-2 transition-all"
          >
            <Download className="w-5 h-5" />
            Export CSV
          </button>
          
          <button
            onClick={loadSmartAIProducts}
            className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-3 rounded-xl flex items-center gap-2 transition-all"
          >
            <RefreshCw className="w-4 h-4" />
            Actualiser
          </button>
        </div>
      </div>

      {/* Informations SMART AI */}
      <div className="bg-gradient-to-r from-purple-500/20 to-pink-600/20 backdrop-blur-xl rounded-2xl p-6 border border-purple-400/30">
        <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-purple-400" />
          30 Attributs SMART AI Optimisés
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div>
            <h4 className="font-semibold text-purple-300 mb-2">🎯 SEO & Marketing :</h4>
            <ul className="text-purple-200 text-sm space-y-1">
              <li>• Titre SEO optimisé (60 caractères)</li>
              <li>• Meta description vendeuse (155 caractères)</li>
              <li>• Description courte Google Ads</li>
              <li>• Tags enrichis pour référencement</li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold text-purple-300 mb-2">🛍️ Google Merchant :</h4>
            <ul className="text-purple-200 text-sm space-y-1">
              <li>• GTIN / Code-barres automatique</li>
              <li>• MPN référence fabricant</li>
              <li>• Catégorie Google Shopping</li>
              <li>• Images multiples (jusqu'à 10)</li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold text-purple-300 mb-2">🤖 Attributs IA :</h4>
            <ul className="text-purple-200 text-sm space-y-1">
              <li>• Couleur, matériau, style détectés</li>
              <li>• Dimensions, poids, capacité</li>
              <li>• Pièce de destination optimale</li>
              <li>• Score de confiance IA (0-100%)</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Progression enrichissement */}
      {isEnriching && (
        <div className="bg-purple-500/20 border border-purple-400/50 rounded-xl p-6">
          <div className="flex items-center gap-3 mb-4">
            <Brain className="w-6 h-6 text-purple-400" />
            <h3 className="text-lg font-bold text-white">Enrichissement SMART AI en cours...</h3>
          </div>
          <div className="w-full bg-gray-700 rounded-full h-3 mb-2">
            <div 
              className="bg-gradient-to-r from-purple-500 to-pink-500 h-3 rounded-full transition-all duration-500" 
              style={{ width: `${enrichmentProgress}%` }}
            ></div>
          </div>
          <p className="text-purple-300 text-sm">{enrichmentProgress}% - Extraction de 30 attributs par produit avec DeepSeek</p>
        </div>
      )}

      {/* Barre de recherche et filtres */}
      <div className="bg-white/10 backdrop-blur-xl rounded-2xl p-6 border border-white/20">
        <div className="flex flex-col lg:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Rechercher par titre, catégorie, matériau, couleur, style..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-3 bg-black/40 border border-gray-600 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:border-cyan-400 focus:ring-2 focus:ring-cyan-400/30"
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

      {/* Tableau SMART AI */}
      {products.length === 0 ? (
        <div className="text-center py-20">
          <Brain className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-xl font-bold text-white mb-2">Aucun produit SMART AI</h3>
          <p className="text-gray-400 mb-6">
            Synchronisez votre catalogue pour créer les attributs SMART AI.<br/>
            <span className="text-sm">Assurez-vous d'avoir des produits dans l'onglet "Catalogue" d'abord.</span>
          </p>
          <div className="space-y-4">
            <button
              onClick={() => {
                const catalogProducts = localStorage.getItem(getRetailerStorageKey('catalog_products'));
                if (!catalogProducts) {
                  showError('Catalogue vide', 'Allez d\'abord dans l\'onglet "Catalogue" pour importer vos produits.');
                  return;
                }
                const products = JSON.parse(catalogProducts);
                if (products.length === 0) {
                  showError('Catalogue vide', 'Aucun produit trouvé. Importez votre catalogue CSV dans l\'onglet "Catalogue".');
                  return;
                }
                handleSyncWithCatalog();
              }}
              className="bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-400 hover:to-emerald-500 text-white px-6 py-3 rounded-xl font-semibold transition-all"
            >
              Synchroniser le catalogue ({(() => {
                try {
                  const catalogProducts = localStorage.getItem(getRetailerStorageKey('catalog_products'));
                  return catalogProducts ? JSON.parse(catalogProducts).length : 0;
                } catch {
                  return 0;
                }
              })()} produits)
            </button>
            
            <div className="bg-blue-500/20 border border-blue-400/50 rounded-xl p-4">
              <h4 className="font-semibold text-blue-200 mb-2">💡 Étapes pour utiliser SMART AI :</h4>
              <ol className="text-blue-300 text-sm space-y-1">
                <li>1. Allez dans l'onglet <strong>"Catalogue"</strong></li>
                <li>2. Importez votre catalogue CSV ou connectez Shopify</li>
                <li>3. Revenez ici et cliquez <strong>"Synchroniser le catalogue"</strong></li>
                <li>4. DeepSeek IA enrichira automatiquement vos produits</li>
              </ol>
            </div>
          </div>
        </div>
      ) : (
        <div className="bg-white/10 backdrop-blur-xl rounded-2xl border border-white/20 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-black/20">
                <tr>
                  <th className="text-left p-4 text-purple-300 font-semibold">Produit</th>
                  <th className="text-left p-4 text-purple-300 font-semibold">SEO Optimisé</th>
                  <th className="text-left p-4 text-purple-300 font-semibold">Attributs IA</th>
                  <th className="text-left p-4 text-purple-300 font-semibold">Google Merchant</th>
                  <th className="text-left p-4 text-purple-300 font-semibold">Prix & Stock</th>
                  <th className="text-left p-4 text-purple-300 font-semibold">Confiance IA</th>
                  <th className="text-left p-4 text-purple-300 font-semibold">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredProducts.map((product) => (
                  <tr key={product.id} className="border-b border-white/10 hover:bg-white/5">
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-lg overflow-hidden bg-gray-600 flex-shrink-0">
                          <img 
                            src={product.image_url || 'https://images.pexels.com/photos/1350789/pexels-photo-1350789.jpeg'} 
                            alt={product.title}
                            className="w-full h-full object-cover"
                            onError={(e) => {
                              const target = e.target as HTMLImageElement;
                              target.src = 'https://images.pexels.com/photos/1350789/pexels-photo-1350789.jpeg';
                            }}
                          />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="font-semibold text-white text-sm line-clamp-2">{product.title}</div>
                          <div className="text-gray-400 text-xs">{product.vendor}</div>
                          <div className="text-purple-400 text-xs">Handle: {product.handle}</div>
                          <div className="text-cyan-400 text-xs">ID: {product.id.substring(0, 8)}...</div>
                        </div>
                      </div>
                    </td>
                    <td className="p-4">
                      <div className="space-y-2">
                        <div>
                          <div className="text-white font-semibold text-xs mb-1">SEO Title:</div>
                          <div className="text-gray-300 text-xs line-clamp-2 bg-black/20 rounded p-2">
                            {product.seo_title || product.title || 'Non défini'}
                          </div>
                        </div>
                        <div>
                          <div className="text-white font-semibold text-xs mb-1">Meta Description:</div>
                          <div className="text-gray-300 text-xs line-clamp-3 bg-black/20 rounded p-2">
                            {product.seo_description || 'Non définie'}
                          </div>
                        </div>
                        <div>
                          <div className="text-white font-semibold text-xs mb-1">Description Courte:</div>
                          <div className="text-gray-300 text-xs line-clamp-2 bg-black/20 rounded p-2">
                            {product.short_description || 'Non définie'}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="p-4">
                      <div className="space-y-1">
                        <div className="text-white text-xs font-semibold mb-2">Catégorie:</div>
                        <div className="bg-blue-500/20 text-blue-300 px-2 py-1 rounded text-xs mb-1">
                          {product.product_type}
                        </div>
                        {product.subcategory && (
                          <div className="bg-cyan-500/20 text-cyan-300 px-2 py-1 rounded text-xs mb-1">
                            {product.subcategory}
                          </div>
                        )}
                        
                        <div className="space-y-1 mt-2">
                          {product.material && (
                            <span className="inline-block bg-green-500/20 text-green-300 px-2 py-1 rounded text-xs mr-1">
                              🏗️ {product.material}
                            </span>
                          )}
                          {product.color && (
                            <span className="inline-block bg-blue-500/20 text-blue-300 px-2 py-1 rounded text-xs mr-1">
                              🎨 {product.color}
                            </span>
                          )}
                          {product.style && (
                            <span className="inline-block bg-purple-500/20 text-purple-300 px-2 py-1 rounded text-xs mr-1">
                              ✨ {product.style}
                            </span>
                          )}
                          {product.room && (
                            <span className="inline-block bg-orange-500/20 text-orange-300 px-2 py-1 rounded text-xs mr-1">
                              🏠 {product.room}
                            </span>
                          )}
                        </div>
                        
                        {product.dimensions && (
                          <div className="text-gray-300 text-xs mt-1">📏 {product.dimensions}</div>
                        )}
                        {product.weight && (
                          <div className="text-gray-300 text-xs">⚖️ {product.weight}</div>
                        )}
                        {product.capacity && (
                          <div className="text-gray-300 text-xs">👥 {product.capacity}</div>
                        )}
                      </div>
                    </td>
                    <td className="p-4">
                      <div className="space-y-2">
                        <div>
                          <div className="text-white text-xs font-semibold">GTIN:</div>
                          <div className="text-cyan-400 text-xs font-mono">
                            {product.gtin || 'Auto-généré'}
                          </div>
                        </div>
                        <div>
                          <div className="text-white text-xs font-semibold">MPN:</div>
                          <div className="text-purple-400 text-xs">
                            {product.mpn || 'N/A'}
                          </div>
                        </div>
                        <div>
                          <div className="text-white text-xs font-semibold">Identifiant:</div>
                          <div className={`text-xs ${product.identifier_exists ? 'text-green-400' : 'text-red-400'}`}>
                            {product.identifier_exists ? '✅ Oui' : '❌ Non'}
                          </div>
                        </div>
                        <div>
                          <div className="text-white text-xs font-semibold">Images:</div>
                          <div className="text-gray-300 text-xs">
                            {1 + (product.additional_image_links?.length || 0)} image(s)
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="p-4">
                      <div className="space-y-2">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-green-400">{product.price}€</span>
                          {product.compare_at_price && product.compare_at_price > product.price && (
                            <>
                              <span className="text-gray-400 line-through text-sm">{product.compare_at_price}€</span>
                              {product.percent_off > 0 && (
                                <span className="bg-red-500/20 text-red-300 px-2 py-1 rounded text-xs">
                                  -{product.percent_off}%
                                </span>
                              )}
                            </>
                          )}
                        </div>
                        <div className="text-gray-400 text-xs">{product.currency}</div>
                        <div className="flex items-center gap-2">
                          <div className={`w-2 h-2 rounded-full ${product.stock_quantity > 0 ? 'bg-green-400' : 'bg-red-400'}`}></div>
                          <span className={`font-semibold text-xs ${product.stock_quantity > 0 ? 'text-green-400' : 'text-red-400'}`}>
                            {product.stock_quantity} en stock
                          </span>
                        </div>
                        <div className="text-gray-300 text-xs">{product.availability_status}</div>
                      </div>
                    </td>
                    <td className="p-4">
                      <div className="flex items-center gap-2">
                        <div className={`w-3 h-3 rounded-full ${
                          (product.ai_confidence * 100) >= 80 ? 'bg-green-400' :
                          (product.ai_confidence * 100) >= 60 ? 'bg-yellow-400' :
                          'bg-red-400'
                        }`}></div>
                        <span className="text-white text-sm font-bold">
                          {Math.round((product.ai_confidence || 0) * 100)}%
                        </span>
                      </div>
                      <div className="text-xs text-gray-400 mt-1">
                        {(product.ai_confidence * 100) >= 80 ? 'Excellent' :
                         (product.ai_confidence * 100) >= 60 ? 'Bon' :
                         'À améliorer'}
                      </div>
                      <div className="text-xs text-purple-400 mt-1">
                        DeepSeek IA
                      </div>
                    </td>
                    <td className="p-4">
                      <div className="flex gap-2">
                        <button
                          className="text-blue-400 hover:text-blue-300 p-1"
                          title="Voir détails"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <a
                          href={product.product_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-purple-400 hover:text-purple-300 p-1"
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
      )}

      {/* Stats SMART AI */}
      {products.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="bg-purple-600/20 backdrop-blur-xl rounded-2xl p-6 border border-purple-500/30">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-purple-200 text-sm mb-1">Produits SMART AI</p>
                <p className="text-3xl font-bold text-white">{products.length}</p>
              </div>
              <Brain className="w-10 h-10 text-purple-400" />
            </div>
          </div>
          
          <div className="bg-green-600/20 backdrop-blur-xl rounded-2xl p-6 border border-green-500/30">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-green-200 text-sm mb-1">Confiance Moyenne</p>
                <p className="text-3xl font-bold text-white">
                  {products.length > 0 ? Math.round(products.reduce((sum, p) => sum + (p.ai_confidence * 100), 0) / products.length) : 0}%
                </p>
              </div>
              <CheckCircle className="w-10 h-10 text-green-400" />
            </div>
          </div>
          
          <div className="bg-blue-600/20 backdrop-blur-xl rounded-2xl p-6 border border-blue-500/30">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-blue-200 text-sm mb-1">Catégories</p>
                <p className="text-3xl font-bold text-white">{categories.length}</p>
              </div>
              <Tag className="w-10 h-10 text-blue-400" />
            </div>
          </div>
          
          <div className="bg-orange-600/20 backdrop-blur-xl rounded-2xl p-6 border border-orange-500/30">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-orange-200 text-sm mb-1">En Stock</p>
                <p className="text-3xl font-bold text-white">
                  {products.filter(p => p.stock_quantity > 0).length}
                </p>
              </div>
              <Package className="w-10 h-10 text-orange-400" />
            </div>
          </div>
        </div>
      )}

      {/* Modal de synchronisation */}
      {showSyncModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-800/95 backdrop-blur-xl rounded-2xl p-6 max-w-md w-full border border-slate-600/50">
            <div className="text-center">
              <Brain className="w-16 h-16 text-purple-400 mx-auto mb-4 animate-pulse" />
              <h3 className="text-xl font-bold text-white mb-2">Synchronisation SMART AI</h3>
              <p className="text-purple-300 mb-4">
                Enrichissement des produits avec 30 attributs IA...
              </p>
              <div className="space-y-2">
                <div className="flex items-center justify-center gap-2 text-cyan-300">
                  <div className="w-2 h-2 bg-cyan-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                  <div className="w-2 h-2 bg-cyan-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                  <div className="w-2 h-2 bg-cyan-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                </div>
                <p className="text-sm text-gray-400">Analyse DeepSeek en cours...</p>
                <p className="text-sm text-gray-400">Extraction SEO, Google Merchant, attributs IA...</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};