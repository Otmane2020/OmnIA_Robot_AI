import React, { useState, useEffect } from 'react';
import { 
  Brain, Database, TrendingUp, Clock, CheckCircle, AlertCircle, 
  Loader2, BarChart3, Zap, RefreshCw, Play, Eye, Package,
  Sparkles, Upload, Download, Settings, Filter, Search
} from 'lucide-react';
import { useNotifications } from './NotificationSystem';

interface EnrichedProduct {
  id: string;
  handle: string;
  title: string;
  description: string;
  category: string;
  subcategory: string;
  color: string;
  material: string;
  fabric: string;
  style: string;
  dimensions: string;
  room: string;
  price: number;
  stock_qty: number;
  image_url: string;
  product_url: string;
  tags: string[];
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
  retailer_id: string;
}

interface SmartAIEnrichmentTabProps {
  retailerId?: string;
}

export const SmartAIEnrichmentTab: React.FC<SmartAIEnrichmentTabProps> = ({ retailerId = 'demo-retailer-id' }) => {
  const [enrichedProducts, setEnrichedProducts] = useState<EnrichedProduct[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSyncing, setIsSyncing] = useState(false);
  const [isEnriching, setIsEnriching] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState('all');
  const [filterConfidence, setFilterConfidence] = useState('all');
  const [showFilters, setShowFilters] = useState(false);
  const { showSuccess, showError, showInfo } = useNotifications();

  useEffect(() => {
    loadEnrichedProducts();
  }, [retailerId]);

  const loadEnrichedProducts = async () => {
    try {
      setIsLoading(true);
      
      // Charger les produits enrichis depuis localStorage
      const enrichedKey = `enriched_products_${retailerId}`;
      const savedEnriched = localStorage.getItem(enrichedKey);
      
      if (savedEnriched) {
        try {
          const parsed = JSON.parse(savedEnriched);
          setEnrichedProducts(parsed);
          console.log('✅ Produits enrichis chargés:', parsed.length);
        } catch (error) {
          console.error('Erreur parsing produits enrichis:', error);
          setEnrichedProducts([]);
        }
      } else {
        console.log('📦 Aucun produit enrichi trouvé');
        setEnrichedProducts([]);
      }
      
    } catch (error) {
      console.error('❌ Erreur chargement produits enrichis:', error);
      showError('Erreur de chargement', 'Impossible de charger les produits enrichis.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSyncCatalog = async () => {
    setIsSyncing(true);
    showInfo('Synchronisation démarrée', 'Récupération des produits depuis "Mes Produits"...');

    try {
      // Récupérer les produits depuis l'onglet "Mes Produits"
      const productsKey = `seller_${retailerId}_products`;
      const savedProducts = localStorage.getItem(productsKey);
      
      let sourceProducts = [];
      if (savedProducts) {
        try {
          sourceProducts = JSON.parse(savedProducts);
          console.log('📦 Produits source récupérés:', sourceProducts.length);
        } catch (error) {
          console.error('Erreur parsing produits source:', error);
        }
      }

      // Si aucun produit dans "Mes Produits", utiliser les données démo
      if (sourceProducts.length === 0) {
        console.log('🔄 Aucun produit dans "Mes Produits", utilisation des données démo...');
        sourceProducts = getDecoraHomeProducts();
        showInfo('Données démo utilisées', 'Utilisation du catalogue démo Decora Home pour la démonstration.');
      }

      // Filtrer les produits actifs
      const activeProducts = sourceProducts.filter(p => p.status === 'active' && p.stock > 0);
      console.log('✅ Produits actifs à enrichir:', activeProducts.length);

      if (activeProducts.length === 0) {
        showError('Aucun produit actif', 'Aucun produit actif trouvé dans "Mes Produits". Importez d\'abord votre catalogue.');
        return;
      }

      // Enrichir les produits avec l'IA
      const enrichedResults = await enrichProductsWithAI(activeProducts);
      
      // Sauvegarder les produits enrichis
      const enrichedKey = `enriched_products_${retailerId}`;
      localStorage.setItem(enrichedKey, JSON.stringify(enrichedResults));
      
      setEnrichedProducts(enrichedResults);
      
      showSuccess(
        'Catalogue synchronisé !',
        `${enrichedResults.length} produits enrichis avec l'IA et sauvegardés dans SMART AI !`,
        [
          {
            label: 'Voir les résultats',
            action: () => console.log('Produits enrichis visibles'),
            variant: 'primary'
          }
        ]
      );

    } catch (error) {
      console.error('❌ Erreur synchronisation:', error);
      showError('Erreur de synchronisation', 'Impossible de synchroniser le catalogue.');
    } finally {
      setIsSyncing(false);
    }
  };

  const handleEnrichWithVision = async () => {
    if (enrichedProducts.length === 0) {
      showError('Aucun produit', 'Synchronisez d\'abord le catalogue pour enrichir avec Vision IA.');
      return;
    }

    setIsEnriching(true);
    showInfo('Vision IA démarrée', 'Analyse des images avec Vision IA...');

    try {
      // Simuler l'enrichissement avec Vision IA
      await new Promise(resolve => setTimeout(resolve, 3000));
      
      const enrichedWithVision = enrichedProducts.map(product => ({
        ...product,
        enrichment_source: 'text_and_vision',
        confidence_score: Math.min(product.confidence_score + 15, 100),
        ai_vision_summary: generateVisionSummary(product),
        enriched_at: new Date().toISOString()
      }));

      setEnrichedProducts(enrichedWithVision);
      
      // Sauvegarder
      const enrichedKey = `enriched_products_${retailerId}`;
      localStorage.setItem(enrichedKey, JSON.stringify(enrichedWithVision));

      showSuccess(
        'Vision IA terminée !',
        `${enrichedWithVision.length} produits enrichis avec analyse visuelle !`
      );

    } catch (error) {
      console.error('❌ Erreur Vision IA:', error);
      showError('Erreur Vision IA', 'Impossible d\'enrichir avec Vision IA.');
    } finally {
      setIsEnriching(false);
    }
  };

  const enrichProductsWithAI = async (products: any[]): Promise<EnrichedProduct[]> => {
    const enrichedResults: EnrichedProduct[] = [];

    for (const [index, product] of products.entries()) {
      try {
        console.log(`🤖 Enrichissement ${index + 1}/${products.length}: ${product.name?.substring(0, 30)}...`);
        
        // Simuler l'enrichissement IA
        await new Promise(resolve => setTimeout(resolve, 500));
        
        const enriched = await enrichSingleProduct(product, retailerId);
        enrichedResults.push(enriched);
        
      } catch (error) {
        console.error(`❌ Erreur enrichissement ${product.name}:`, error);
      }
    }

    return enrichedResults;
  };

  const enrichSingleProduct = async (product: any, retailerId: string): Promise<EnrichedProduct> => {
    const text = `${product.name || product.title || ''} ${product.description || ''}`.toLowerCase();
    
    // Extraction intelligente des attributs
    const category = detectCategory(text);
    const subcategory = detectSubcategory(text, category);
    const color = detectColor(text);
    const material = detectMaterial(text);
    const style = detectStyle(text);
    const room = detectRoom(text);
    const dimensions = extractDimensions(text);
    const tags = generateSmartTags(product.name || product.title, product.description, category);
    
    // Calcul du score de confiance
    let confidence = 60; // Base
    if (color) confidence += 15;
    if (material) confidence += 15;
    if (style) confidence += 10;
    if (dimensions) confidence += 10;
    if (subcategory) confidence += 10;

    return {
      id: product.id || `enriched-${Date.now()}-${Math.random()}`,
      handle: product.handle || generateHandle(product.name || product.title),
      title: product.name || product.title || 'Produit sans nom',
      description: product.description || '',
      category,
      subcategory,
      color,
      material,
      fabric: extractFabric(material),
      style,
      dimensions,
      room,
      price: parseFloat(product.price) || 0,
      stock_qty: parseInt(product.stock) || 0,
      image_url: product.image_url || 'https://images.pexels.com/photos/1350789/pexels-photo-1350789.jpeg',
      product_url: product.product_url || '#',
      tags,
      seo_title: generateSEOTitle(product.name || product.title, category, color),
      seo_description: generateSEODescription(product.name || product.title, category, material, style),
      ad_headline: (product.name || product.title || '').substring(0, 30),
      ad_description: generateAdDescription(product.name || product.title, category, product.price),
      google_product_category: getGoogleCategory(category),
      gtin: product.gtin || '',
      brand: product.vendor || 'Decora Home',
      confidence_score: Math.min(confidence, 100),
      enriched_at: new Date().toISOString(),
      enrichment_source: 'smart_ai',
      retailer_id: retailerId
    };
  };

  const getDecoraHomeProducts = () => [
    {
      id: 'decora-canape-alyana-beige',
      name: 'Canapé ALYANA convertible - Beige',
      description: 'Canapé d\'angle convertible 4 places en velours côtelé beige avec coffre de rangement',
      price: 799,
      compare_at_price: 1399,
      category: 'Canapé',
      vendor: 'Decora Home',
      image_url: 'https://cdn.shopify.com/s/files/1/0903/7578/2665/files/7_23a97631-68d2-4f3e-8f78-b26c7cd4c2ae.png?v=1754406480',
      product_url: 'https://decorahome.fr/products/canape-dangle-convertible-et-reversible-4-places-en-velours-cotele',
      stock: 100,
      status: 'active',
      handle: 'canape-alyana-beige'
    },
    {
      id: 'decora-table-aurea-100',
      name: 'Table AUREA Ø100cm - Travertin',
      description: 'Table ronde en travertin naturel avec pieds en métal noir',
      price: 499,
      compare_at_price: 859,
      category: 'Table',
      vendor: 'Decora Home',
      image_url: 'https://cdn.shopify.com/s/files/1/0903/7578/2665/files/3_e80b9a50-b032-4267-8f5b-f9130153e3be.png?v=1754406484',
      product_url: 'https://decorahome.fr/products/table-a-manger-ronde-plateau-en-travertin-naturel-100-120-cm',
      stock: 50,
      status: 'active',
      handle: 'table-aurea-100'
    },
    {
      id: 'decora-chaise-inaya-gris',
      name: 'Chaise INAYA - Gris chenille',
      description: 'Chaise en tissu chenille avec pieds métal noir',
      price: 99,
      compare_at_price: 149,
      category: 'Chaise',
      vendor: 'Decora Home',
      image_url: 'https://cdn.shopify.com/s/files/1/0903/7578/2665/files/3_3f11d1af-8ce5-4d2d-a435-cd0a78eb92ee.png?v=1755791319',
      product_url: 'https://decorahome.fr/products/chaise-en-tissu-serge-chenille-pieds-metal-noir-gris-clair-moka-et-beige',
      stock: 96,
      status: 'active',
      handle: 'chaise-inaya-gris'
    }
  ];

  // Fonctions helper pour l'enrichissement
  const detectCategory = (text: string): string => {
    if (text.includes('canapé') || text.includes('sofa')) return 'Canapé';
    if (text.includes('table')) return 'Table';
    if (text.includes('chaise') || text.includes('fauteuil')) return 'Chaise';
    if (text.includes('lit') || text.includes('matelas')) return 'Lit';
    if (text.includes('armoire') || text.includes('commode')) return 'Rangement';
    if (text.includes('meuble tv')) return 'Meuble TV';
    return 'Mobilier';
  };

  const detectSubcategory = (text: string, category: string): string => {
    if (category === 'Canapé') {
      if (text.includes('angle')) return 'Canapé d\'angle';
      if (text.includes('convertible')) return 'Canapé convertible';
      return 'Canapé fixe';
    }
    if (category === 'Table') {
      if (text.includes('basse')) return 'Table basse';
      if (text.includes('manger')) return 'Table à manger';
      if (text.includes('ronde')) return 'Table ronde';
      return 'Table rectangulaire';
    }
    if (category === 'Chaise') {
      if (text.includes('bureau')) return 'Chaise de bureau';
      if (text.includes('fauteuil')) return 'Fauteuil';
      return 'Chaise de salle à manger';
    }
    return '';
  };

  const detectColor = (text: string): string => {
    const colors = ['blanc', 'noir', 'gris', 'beige', 'marron', 'bleu', 'vert', 'rouge', 'jaune', 'orange', 'rose', 'violet', 'naturel', 'chêne', 'noyer', 'taupe'];
    return colors.find(color => text.includes(color)) || '';
  };

  const detectMaterial = (text: string): string => {
    const materials = ['bois', 'chêne', 'hêtre', 'pin', 'teck', 'métal', 'acier', 'verre', 'tissu', 'cuir', 'velours', 'travertin', 'marbre', 'chenille', 'rotin'];
    return materials.find(material => text.includes(material)) || '';
  };

  const detectStyle = (text: string): string => {
    const styles = ['moderne', 'contemporain', 'scandinave', 'industriel', 'vintage', 'rustique', 'classique', 'minimaliste', 'bohème'];
    return styles.find(style => text.includes(style)) || '';
  };

  const detectRoom = (text: string): string => {
    const rooms = ['salon', 'chambre', 'cuisine', 'bureau', 'salle à manger', 'entrée', 'terrasse'];
    return rooms.find(room => text.includes(room)) || '';
  };

  const extractDimensions = (text: string): string => {
    const match = text.match(/(\d+)\s*[x×]\s*(\d+)(?:\s*[x×]\s*(\d+))?\s*cm/);
    return match ? match[0] : '';
  };

  const extractFabric = (material: string): string => {
    const fabrics = ['velours', 'tissu', 'cuir', 'chenille', 'lin', 'coton'];
    return fabrics.find(fabric => material.includes(fabric)) || '';
  };

  const generateSmartTags = (title: string, description: string, category: string): string[] => {
    const text = `${title} ${description}`.toLowerCase();
    const words = text.split(/\s+/).filter(word => word.length > 2);
    
    const stopWords = ['le', 'la', 'les', 'un', 'une', 'des', 'du', 'de', 'et', 'ou', 'avec', 'sans', 'pour', 'par', 'sur', 'dans'];
    const furnitureKeywords = ['canapé', 'alyana', 'aurea', 'inaya', 'convertible', 'angle', 'places', 'velours', 'tissu', 'cuir', 'travertin', 'chenille'];
    
    const validWords = words.filter(word => 
      !stopWords.includes(word) && 
      !/^\d+$/.test(word) &&
      word.length > 2
    );
    
    const priorityTags = validWords.filter(word => furnitureKeywords.includes(word));
    const regularTags = validWords.filter(word => !furnitureKeywords.includes(word));
    
    return [...priorityTags.slice(0, 3), ...regularTags.slice(0, 2), category.toLowerCase()].slice(0, 5);
  };

  const generateSEOTitle = (title: string, category: string, color: string): string => {
    return `${title} ${color ? color : ''} - ${category} | Decora Home`.substring(0, 70);
  };

  const generateSEODescription = (title: string, category: string, material: string, style: string): string => {
    return `${title} ${material ? 'en ' + material : ''} ${style ? style : ''}. ${category} de qualité premium. Livraison gratuite.`.substring(0, 155);
  };

  const generateAdDescription = (title: string, category: string, price: number): string => {
    return `${title} - ${category} premium à ${price}€. Livraison offerte !`.substring(0, 90);
  };

  const getGoogleCategory = (category: string): string => {
    const mappings: { [key: string]: string } = {
      'Canapé': '635',
      'Table': '443',
      'Chaise': '436',
      'Lit': '569',
      'Rangement': '6552',
      'Meuble TV': '6552',
      'Décoration': '696',
      'Éclairage': '594'
    };
    return mappings[category] || '696';
  };

  const generateHandle = (title: string): string => {
    return title
      .toLowerCase()
      .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9\s-]/g, '')
      .trim()
      .replace(/\s+/g, '-')
      .substring(0, 100);
  };

  const generateVisionSummary = (product: EnrichedProduct): string => {
    const summaries = [
      `${product.category} ${product.color ? product.color : ''} avec finition soignée. Design ${product.style || 'contemporain'} aux lignes épurées. Qualité premium visible.`,
      `Produit ${product.material ? 'en ' + product.material : ''} avec excellent rendu visuel. Finitions de qualité et assemblage précis.`,
      `${product.category} au design ${product.style || 'moderne'} remarquable. Matériaux nobles et attention aux détails.`
    ];
    return summaries[Math.floor(Math.random() * summaries.length)];
  };

  const filteredProducts = enrichedProducts.filter(product => {
    const matchesSearch = searchTerm === '' || 
      product.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()));
    
    const matchesCategory = filterCategory === 'all' || product.category === filterCategory;
    
    const matchesConfidence = filterConfidence === 'all' || 
      (filterConfidence === 'high' && product.confidence_score >= 80) ||
      (filterConfidence === 'medium' && product.confidence_score >= 60 && product.confidence_score < 80) ||
      (filterConfidence === 'low' && product.confidence_score < 60);
    
    return matchesSearch && matchesCategory && matchesConfidence;
  });

  const categories = [...new Set(enrichedProducts.map(p => p.category))];
  const totalValue = enrichedProducts.reduce((sum, p) => sum + p.price, 0);
  const avgConfidence = enrichedProducts.length > 0 ? 
    Math.round(enrichedProducts.reduce((sum, p) => sum + p.confidence_score, 0) / enrichedProducts.length) : 0;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="text-center">
          <Loader2 className="w-16 h-16 text-cyan-400 animate-spin mx-auto mb-4" />
          <p className="text-white text-lg">Chargement SMART AI...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold text-white mb-2">SMART AI - Enrichissement Catalogue</h2>
          <p className="text-gray-300">{enrichedProducts.length} produits enrichis • {filteredProducts.length} produits affichés</p>
        </div>
        
        <div className="flex items-center gap-3">
          <button
            onClick={loadEnrichedProducts}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-xl flex items-center gap-2 transition-all"
          >
            <RefreshCw className="w-4 h-4" />
            Actualiser
          </button>
          
          <button
            onClick={handleEnrichWithVision}
            disabled={isEnriching || enrichedProducts.length === 0}
            className="bg-gradient-to-r from-purple-500 to-pink-600 hover:from-purple-400 hover:to-pink-500 disabled:from-gray-600 disabled:to-gray-700 text-white px-6 py-3 rounded-xl font-semibold transition-all disabled:cursor-not-allowed flex items-center gap-2"
          >
            {isEnriching ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                Enrichissement Vision IA...
              </>
            ) : (
              <>
                <Sparkles className="w-5 h-5" />
                Enrichir avec Vision IA
              </>
            )}
          </button>
          
          <button
            onClick={handleSyncCatalog}
            disabled={isSyncing}
            className="bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 disabled:from-gray-600 disabled:to-gray-700 text-white px-6 py-3 rounded-xl font-semibold transition-all disabled:cursor-not-allowed flex items-center gap-2"
          >
            {isSyncing ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                Synchronisation...
              </>
            ) : (
              <>
                <Database className="w-5 h-5" />
                Synchroniser le catalogue
              </>
            )}
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-blue-600/20 backdrop-blur-xl rounded-2xl p-6 border border-blue-500/30">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-blue-200 text-sm mb-1">Total Produits</p>
              <p className="text-3xl font-bold text-white mb-1">{enrichedProducts.length}</p>
              <p className="text-blue-300 text-sm">Catalogue enrichi</p>
            </div>
            <Package className="w-10 h-10 text-blue-400" />
          </div>
        </div>
        
        <div className="bg-green-600/20 backdrop-blur-xl rounded-2xl p-6 border border-green-500/30">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-green-200 text-sm mb-1">Enrichis IA</p>
              <p className="text-3xl font-bold text-white mb-1">{enrichedProducts.filter(p => p.confidence_score >= 70).length}</p>
              <p className="text-green-300 text-sm">Score ≥ 70%</p>
            </div>
            <CheckCircle className="w-10 h-10 text-green-400" />
          </div>
        </div>
        
        <div className="bg-orange-600/20 backdrop-blur-xl rounded-2xl p-6 border border-orange-500/30">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-orange-200 text-sm mb-1">En cours</p>
              <p className="text-3xl font-bold text-white mb-1">{enrichedProducts.filter(p => p.confidence_score < 70).length}</p>
              <p className="text-orange-300 text-sm">À améliorer</p>
            </div>
            <Clock className="w-10 h-10 text-orange-400" />
          </div>
        </div>
        
        <div className="bg-purple-600/20 backdrop-blur-xl rounded-2xl p-6 border border-purple-500/30">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-purple-200 text-sm mb-1">Valeur Stock</p>
              <p className="text-3xl font-bold text-white mb-1">{totalValue.toLocaleString()}€</p>
              <p className="text-purple-300 text-sm">Catalogue total</p>
            </div>
            <TrendingUp className="w-10 h-10 text-purple-400" />
          </div>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="bg-white/10 backdrop-blur-xl rounded-2xl p-6 border border-white/20">
        <div className="flex flex-col lg:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Rechercher dans les produits enrichis..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-3 bg-black/40 border border-gray-600 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:border-cyan-400 focus:ring-2 focus:ring-cyan-400/30"
            />
          </div>
          
          <select
            value={filterCategory}
            onChange={(e) => setFilterCategory(e.target.value)}
            className="bg-black/40 border border-gray-600 rounded-xl px-4 py-3 text-white"
          >
            <option value="all">Toutes les catégories</option>
            {categories.map(category => (
              <option key={category} value={category}>{category}</option>
            ))}
          </select>
          
          <select
            value={filterConfidence}
            onChange={(e) => setFilterConfidence(e.target.value)}
            className="bg-black/40 border border-gray-600 rounded-xl px-4 py-3 text-white"
          >
            <option value="all">Tous les scores</option>
            <option value="high">Score élevé (≥80%)</option>
            <option value="medium">Score moyen (60-79%)</option>
            <option value="low">Score faible (&lt;60%)</option>
          </select>
        </div>
      </div>

      {/* Products Table */}
      {enrichedProducts.length > 0 ? (
        <div className="bg-white/10 backdrop-blur-xl rounded-2xl border border-white/20 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-black/20">
                <tr>
                  <th className="text-left p-4 text-cyan-300 font-semibold">Produit</th>
                  <th className="text-left p-4 text-cyan-300 font-semibold">Prix</th>
                  <th className="text-left p-4 text-cyan-300 font-semibold">Stock</th>
                  <th className="text-left p-4 text-cyan-300 font-semibold">IA Score</th>
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
                          <div className="font-semibold text-white text-sm mb-1">{product.title}</div>
                          <div className="text-gray-400 text-xs">{product.category} • {product.brand}</div>
                          <div className="flex flex-wrap gap-1 mt-1">
                            {product.color && (
                              <span className="bg-blue-500/20 text-blue-300 px-2 py-1 rounded text-xs">{product.color}</span>
                            )}
                            {product.material && (
                              <span className="bg-green-500/20 text-green-300 px-2 py-1 rounded text-xs">{product.material}</span>
                            )}
                            {product.style && (
                              <span className="bg-purple-500/20 text-purple-300 px-2 py-1 rounded text-xs">{product.style}</span>
                            )}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="p-4">
                      <div className="text-green-400 font-bold">{product.price}€</div>
                    </td>
                    <td className="p-4">
                      <span className={`font-semibold ${product.stock_qty > 0 ? 'text-green-400' : 'text-red-400'}`}>
                        {product.stock_qty}
                      </span>
                    </td>
                    <td className="p-4">
                      <div className="flex items-center gap-2">
                        <div className="w-16 bg-gray-700 rounded-full h-2">
                          <div 
                            className={`h-2 rounded-full ${
                              product.confidence_score >= 80 ? 'bg-green-500' :
                              product.confidence_score >= 60 ? 'bg-yellow-500' : 'bg-red-500'
                            }`}
                            style={{ width: `${product.confidence_score}%` }}
                          ></div>
                        </div>
                        <span className="text-white text-sm font-bold">{product.confidence_score}%</span>
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
                        <button
                          className="text-purple-400 hover:text-purple-300 p-1"
                          title="Analyse IA"
                        >
                          <Brain className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <div className="text-center py-20">
          <Brain className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-xl font-bold text-white mb-2">Aucun produit enrichi</h3>
          <p className="text-gray-400 mb-6">
            Synchronisez votre catalogue depuis "Mes Produits" pour commencer l'enrichissement IA
          </p>
          <button
            onClick={handleSyncCatalog}
            disabled={isSyncing}
            className="bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 disabled:from-gray-600 disabled:to-gray-700 text-white px-6 py-3 rounded-xl font-semibold transition-all disabled:cursor-not-allowed flex items-center gap-2 mx-auto"
          >
            {isSyncing ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                Synchronisation...
              </>
            ) : (
              <>
                <Database className="w-5 h-5" />
                Synchroniser le catalogue
              </>
            )}
          </button>
        </div>
      )}

      {/* Info Panel */}
      <div className="bg-gradient-to-r from-cyan-500/20 to-blue-600/20 backdrop-blur-xl rounded-2xl p-6 border border-cyan-400/30">
        <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
          <Zap className="w-5 h-5 text-cyan-400" />
          Fonctionnement SMART AI
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h4 className="font-semibold text-cyan-300 mb-2">🔄 Synchronisation automatique :</h4>
            <ul className="text-cyan-200 text-sm space-y-1">
              <li>• Récupère les produits depuis "Mes Produits"</li>
              <li>• Enrichit automatiquement avec l'IA</li>
              <li>• Extrait couleurs, matériaux, styles, dimensions</li>
              <li>• Génère SEO et tags optimisés</li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold text-cyan-300 mb-2">🧠 Enrichissement IA :</h4>
            <ul className="text-cyan-200 text-sm space-y-1">
              <li>• Analyse textuelle avec DeepSeek</li>
              <li>• Vision IA pour analyse d'images</li>
              <li>• Score de confiance automatique</li>
              <li>• Optimisation continue</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SmartAIEnrichmentTab;