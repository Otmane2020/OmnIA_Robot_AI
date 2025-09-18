import React, { useState, useEffect } from 'react';
import { 
  Search, Filter, Plus, Eye, Edit, Trash2, ExternalLink, 
  Package, Tag, DollarSign, Image, BarChart3, Settings,
  ChevronDown, ChevronUp, X, Save, AlertCircle, CheckCircle,
  Upload, Download, Brain, Zap, RefreshCw, Globe, Star,
  FileText, Loader2
} from 'lucide-react';
import { useNotifications } from './NotificationSystem';

interface EnrichedProduct {
  id: string;
  handle: string;
  title: string;
  description: string;
  category: string;
  subcategory: string;
  type: string;
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
  created_at: string;
}

interface GoogleCategory {
  id: string;
  category: string;
  subcategory: string;
  google_product_category: string;
  description: string;
}

export const ProductsEnrichedTable: React.FC = () => {
  const [products, setProducts] = useState<EnrichedProduct[]>([]);
  const [googleCategories, setGoogleCategories] = useState<GoogleCategory[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<EnrichedProduct[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedConfidence, setSelectedConfidence] = useState('all');
  const [showFilters, setShowFilters] = useState(false);
  const [selectedProducts, setSelectedProducts] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isEnriching, setIsEnriching] = useState(false);
  const [enrichmentProgress, setEnrichmentProgress] = useState(0);
  const [showGoogleCategoryModal, setShowGoogleCategoryModal] = useState(false);
  const [csvFile, setCsvFile] = useState<File | null>(null);
  const [editingProduct, setEditingProduct] = useState<EnrichedProduct | null>(null);
  const { showSuccess, showError, showInfo } = useNotifications();

  useEffect(() => {
    loadEnrichedProducts();
    loadGoogleCategories();
  }, []);

  useEffect(() => {
    filterProducts();
  }, [products, searchTerm, selectedCategory, selectedConfidence]);

  const loadEnrichedProducts = async () => {
    try {
      setIsLoading(true);
      
      // Charger les produits enrichis depuis localStorage
      const savedProducts = localStorage.getItem('enriched_products');
      const catalogProducts = localStorage.getItem('catalog_products');
      
      let enrichedProducts: EnrichedProduct[] = [];
      
      if (savedProducts) {
        try {
          enrichedProducts = JSON.parse(savedProducts);
          console.log('📦 Produits enrichis chargés:', enrichedProducts.length);
        } catch (error) {
          console.error('Erreur parsing produits enrichis:', error);
        }
      }
      
      // Si pas de produits enrichis, créer à partir du catalogue principal
      if (enrichedProducts.length === 0 && catalogProducts) {
        try {
          const mainCatalog = JSON.parse(catalogProducts);
          enrichedProducts = mainCatalog.map((product: any) => ({
            id: product.id || `enriched-${Date.now()}-${Math.random()}`,
            handle: product.handle || product.id,
            title: product.title || product.name || 'Produit sans nom',
            description: product.description || '',
            category: detectCategory(product.title || product.name || ''),
            subcategory: detectSubcategory(product.title || product.name || '', product.description || ''),
            type: product.productType || product.category || 'Mobilier',
            color: detectColor(product.title + ' ' + product.description),
            material: detectMaterial(product.title + ' ' + product.description),
            fabric: detectFabric(product.title + ' ' + product.description),
            style: detectStyle(product.title + ' ' + product.description),
            dimensions: extractDimensions(product.description || ''),
            room: detectRoom(product.title + ' ' + product.description),
            price: product.price || 0,
            stock_qty: product.stock || product.quantityAvailable || 0,
            image_url: product.image_url || '',
            product_url: product.product_url || '',
            tags: Array.isArray(product.tags) ? product.tags : [],
            seo_title: generateSEOTitle(product.title || product.name || ''),
            seo_description: generateSEODescription(product.title || product.name || '', product.description || ''),
            ad_headline: generateAdHeadline(product.title || product.name || ''),
            ad_description: generateAdDescription(product.title || product.name || ''),
            google_product_category: getGoogleCategoryCode(detectCategory(product.title || product.name || '')),
            gtin: '',
            brand: product.vendor || 'Decora Home',
            confidence_score: 75,
            enriched_at: new Date().toISOString(),
            enrichment_source: 'auto',
            created_at: product.created_at || new Date().toISOString()
          }));
          
          // Sauvegarder les produits enrichis
          localStorage.setItem('enriched_products', JSON.stringify(enrichedProducts));
          console.log('✅ Catalogue principal converti en catalogue enrichi:', enrichedProducts.length);
        } catch (error) {
          console.error('Erreur conversion catalogue:', error);
        }
      }
      
      setProducts(enrichedProducts);
      setFilteredProducts(enrichedProducts);
      
    } catch (error) {
      console.error('❌ Erreur chargement produits enrichis:', error);
      showError('Erreur de chargement', 'Impossible de charger le catalogue enrichi.');
    } finally {
      setIsLoading(false);
    }
  };

  const loadGoogleCategories = async () => {
    try {
      // Charger les catégories Google depuis localStorage ou créer par défaut
      const savedCategories = localStorage.getItem('google_categories');
      
      let categories: GoogleCategory[] = [];
      
      if (savedCategories) {
        categories = JSON.parse(savedCategories);
      } else {
        // Créer les catégories par défaut
        categories = getDefaultGoogleCategories();
        localStorage.setItem('google_categories', JSON.stringify(categories));
      }
      
      setGoogleCategories(categories);
      console.log('✅ Catégories Google chargées:', categories.length);
      
    } catch (error) {
      console.error('❌ Erreur chargement catégories Google:', error);
    }
  };

  const getDefaultGoogleCategories = (): GoogleCategory[] => [
    { id: '1', category: 'Canapé', subcategory: 'Canapé fixe', google_product_category: '635', description: 'Canapés fixes et droits' },
    { id: '2', category: 'Canapé', subcategory: 'Canapé d\'angle', google_product_category: '635', description: 'Canapés d\'angle et modulaires' },
    { id: '3', category: 'Canapé', subcategory: 'Canapé convertible', google_product_category: '635', description: 'Canapés-lits et convertibles' },
    { id: '4', category: 'Chaise', subcategory: 'Chaise de salle à manger', google_product_category: '436', description: 'Chaises pour salle à manger' },
    { id: '5', category: 'Chaise', subcategory: 'Chaise de bureau', google_product_category: '436', description: 'Chaises et fauteuils de bureau' },
    { id: '6', category: 'Chaise', subcategory: 'Fauteuil', google_product_category: '436', description: 'Fauteuils et sièges d\'appoint' },
    { id: '7', category: 'Table', subcategory: 'Table à manger', google_product_category: '443', description: 'Tables de salle à manger' },
    { id: '8', category: 'Table', subcategory: 'Table basse', google_product_category: '443', description: 'Tables basses et tables de salon' },
    { id: '9', category: 'Table', subcategory: 'Table de bureau', google_product_category: '443', description: 'Tables et bureaux de travail' },
    { id: '10', category: 'Lit', subcategory: 'Lit simple', google_product_category: '630', description: 'Lits simples et 1 place' },
    { id: '11', category: 'Lit', subcategory: 'Lit double', google_product_category: '630', description: 'Lits doubles et 2 places' },
    { id: '12', category: 'Rangement', subcategory: 'Armoire', google_product_category: '443', description: 'Armoires et penderies' },
    { id: '13', category: 'Rangement', subcategory: 'Commode', google_product_category: '443', description: 'Commodes et chiffonniers' },
    { id: '14', category: 'Rangement', subcategory: 'Bibliothèque', google_product_category: '443', description: 'Bibliothèques et étagères' },
    { id: '15', category: 'Éclairage', subcategory: 'Lampe de table', google_product_category: '594', description: 'Lampes de table et de chevet' },
    { id: '16', category: 'Éclairage', subcategory: 'Lampadaire', google_product_category: '594', description: 'Lampadaires et éclairage sur pied' },
    { id: '17', category: 'Décoration', subcategory: 'Miroir', google_product_category: '696', description: 'Miroirs décoratifs' },
    { id: '18', category: 'Décoration', subcategory: 'Tapis', google_product_category: '696', description: 'Tapis et moquettes' }
  ];

  const filterProducts = () => {
    let filtered = products;

    if (searchTerm) {
      filtered = filtered.filter(product =>
        product.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.brand.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()))
      );
    }

    if (selectedCategory !== 'all') {
      filtered = filtered.filter(product => product.category === selectedCategory);
    }

    if (selectedConfidence !== 'all') {
      const confidenceRanges = {
        'high': [80, 100],
        'medium': [50, 79],
        'low': [0, 49]
      };
      const range = confidenceRanges[selectedConfidence as keyof typeof confidenceRanges];
      if (range) {
        filtered = filtered.filter(product => 
          product.confidence_score >= range[0] && product.confidence_score <= range[1]
        );
      }
    }

    setFilteredProducts(filtered);
  };

  const handleManualEnrichment = async () => {
    if (selectedProducts.length === 0) {
      showError('Sélection requise', 'Veuillez sélectionner au moins un produit à enrichir.');
      return;
    }

    setIsEnriching(true);
    setEnrichmentProgress(0);
    
    try {
      showInfo('Enrichissement démarré', `Enrichissement IA de ${selectedProducts.length} produit(s) avec DeepSeek...`);
      
      const productsToEnrich = products.filter(p => selectedProducts.includes(p.id));
      const enrichedResults = [];
      
      for (let i = 0; i < productsToEnrich.length; i++) {
        const product = productsToEnrich[i];
        
        try {
          console.log(`🤖 Enrichissement ${i + 1}/${productsToEnrich.length}: ${product.title.substring(0, 30)}...`);
          
          // Enrichir avec IA
          const enrichedAttributes = await enrichProductWithAI(product);
          
          const enrichedProduct = {
            ...product,
            ...enrichedAttributes,
            confidence_score: enrichedAttributes.confidence_score || 85,
            enriched_at: new Date().toISOString(),
            enrichment_source: 'manual'
          };
          
          enrichedResults.push(enrichedProduct);
          
          // Mettre à jour le progrès
          setEnrichmentProgress(Math.round(((i + 1) / productsToEnrich.length) * 100));
          
        } catch (error) {
          console.error(`❌ Erreur enrichissement ${product.title}:`, error);
          // Garder le produit original en cas d'erreur
          enrichedResults.push(product);
        }
        
        // Pause entre les enrichissements
        await new Promise(resolve => setTimeout(resolve, 500));
      }
      
      // Mettre à jour les produits dans la liste
      const updatedProducts = products.map(product => {
        const enriched = enrichedResults.find(r => r.id === product.id);
        return enriched || product;
      });
      
      setProducts(updatedProducts);
      
      // Sauvegarder dans localStorage
      localStorage.setItem('enriched_products', JSON.stringify(updatedProducts));
      
      setSelectedProducts([]);
      
      showSuccess(
        'Enrichissement terminé',
        `${enrichedResults.length} produit(s) enrichi(s) avec succès !`,
        [
          {
            label: 'Voir les résultats',
            action: () => setSelectedCategory('all'),
            variant: 'primary'
          }
        ]
      );
      
    } catch (error) {
      console.error('❌ Erreur enrichissement manuel:', error);
      showError('Erreur d\'enrichissement', 'Erreur lors de l\'enrichissement manuel des produits.');
    } finally {
      setIsEnriching(false);
      setEnrichmentProgress(0);
    }
  };

  const enrichProductWithAI = async (product: EnrichedProduct) => {
    try {
      const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
      const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

      if (!supabaseUrl || !supabaseKey) {
        throw new Error('Supabase non configuré');
      }

      const response = await fetch(`${supabaseUrl}/functions/v1/enrich-products`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${supabaseKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          products: [product]
        }),
      });

      if (!response.ok) {
        throw new Error('Erreur API enrichissement');
      }

      const result = await response.json();
      
      if (result.enriched_products && result.enriched_products.length > 0) {
        return result.enriched_products[0].enriched_attributes;
      }
      
      // Fallback enrichissement local
      return enrichProductLocally(product);
      
    } catch (error) {
      console.error('❌ Erreur enrichissement IA:', error);
      // Fallback enrichissement local
      return enrichProductLocally(product);
    }
  };

  const enrichProductLocally = (product: EnrichedProduct) => {
    const text = `${product.title} ${product.description}`.toLowerCase();
    
    return {
      category: detectCategory(product.title),
      subcategory: detectSubcategory(product.title, product.description),
      color: detectColor(text),
      material: detectMaterial(text),
      fabric: detectFabric(text),
      style: detectStyle(text),
      dimensions: extractDimensions(product.description),
      room: detectRoom(text),
      tags: generateTags(text),
      seo_title: generateSEOTitle(product.title),
      seo_description: generateSEODescription(product.title, product.description),
      ad_headline: generateAdHeadline(product.title),
      ad_description: generateAdDescription(product.title),
      google_product_category: getGoogleCategoryCode(detectCategory(product.title)),
      gtin: '',
      brand: product.brand || 'Decora Home',
      confidence_score: 75
    };
  };

  const handleBulkEnrichment = async () => {
    setIsEnriching(true);
    setEnrichmentProgress(0);
    
    try {
      showInfo('Enrichissement global', 'Enrichissement IA de tous les produits du catalogue...');
      
      const enrichedResults = [];
      
      for (let i = 0; i < products.length; i++) {
        const product = products[i];
        
        try {
          const enrichedAttributes = await enrichProductWithAI(product);
          
          const enrichedProduct = {
            ...product,
            ...enrichedAttributes,
            confidence_score: enrichedAttributes.confidence_score || 85,
            enriched_at: new Date().toISOString(),
            enrichment_source: 'bulk'
          };
          
          enrichedResults.push(enrichedProduct);
          
          setEnrichmentProgress(Math.round(((i + 1) / products.length) * 100));
          
        } catch (error) {
          console.error(`❌ Erreur enrichissement ${product.title}:`, error);
          enrichedResults.push(product);
        }
        
        await new Promise(resolve => setTimeout(resolve, 300));
      }
      
      setProducts(enrichedResults);
      localStorage.setItem('enriched_products', JSON.stringify(enrichedResults));
      
      showSuccess(
        'Enrichissement global terminé',
        `${enrichedResults.length} produits enrichis avec IA !`
      );
      
    } catch (error) {
      console.error('❌ Erreur enrichissement global:', error);
      showError('Erreur d\'enrichissement', 'Erreur lors de l\'enrichissement global.');
    } finally {
      setIsEnriching(false);
      setEnrichmentProgress(0);
    }
  };

  const handleGoogleCategoryImport = async (file: File) => {
    try {
      const text = await file.text();
      const lines = text.split('\n');
      const headers = lines[0].split(',').map(h => h.trim().replace(/"/g, ''));
      
      const newCategories: GoogleCategory[] = [];
      
      for (let i = 1; i < lines.length; i++) {
        if (!lines[i].trim()) continue;
        
        const values = lines[i].split(',').map(v => v.trim().replace(/"/g, ''));
        const category: any = {};
        
        headers.forEach((header, index) => {
          category[header] = values[index] || '';
        });
        
        if (category.category && category.google_product_category) {
          newCategories.push({
            id: `cat-${Date.now()}-${i}`,
            category: category.category,
            subcategory: category.subcategory || '',
            google_product_category: category.google_product_category,
            description: category.description || ''
          });
        }
      }
      
      setGoogleCategories(prev => [...prev, ...newCategories]);
      localStorage.setItem('google_categories', JSON.stringify([...googleCategories, ...newCategories]));
      
      showSuccess('Import réussi', `${newCategories.length} catégories Google importées !`);
      
    } catch (error) {
      console.error('❌ Erreur import catégories:', error);
      showError('Erreur d\'import', 'Erreur lors de l\'import des catégories Google.');
    }
  };

  const handleUpdateProduct = (updatedProduct: EnrichedProduct) => {
    const updatedProducts = products.map(p => 
      p.id === updatedProduct.id ? updatedProduct : p
    );
    
    setProducts(updatedProducts);
    localStorage.setItem('enriched_products', JSON.stringify(updatedProducts));
    
    showSuccess('Produit modifié', 'Le produit a été modifié avec succès.');
    setEditingProduct(null);
  };

  const handleDeleteProduct = (productId: string) => {
    if (confirm('Supprimer ce produit du catalogue enrichi ?')) {
      const updatedProducts = products.filter(p => p.id !== productId);
      setProducts(updatedProducts);
      localStorage.setItem('enriched_products', JSON.stringify(updatedProducts));
      showSuccess('Produit supprimé', 'Le produit a été supprimé du catalogue enrichi.');
    }
  };

  const handleSelectProduct = (productId: string) => {
    setSelectedProducts(prev =>
      prev.includes(productId)
        ? prev.filter(id => id !== productId)
        : [...prev, productId]
    );
  };

  const handleSelectAll = () => {
    if (selectedProducts.length === filteredProducts.length) {
      setSelectedProducts([]);
    } else {
      setSelectedProducts(filteredProducts.map(p => p.id));
    }
  };

  const getConfidenceColor = (score: number) => {
    if (score >= 80) return 'bg-green-500/20 text-green-300';
    if (score >= 50) return 'bg-yellow-500/20 text-yellow-300';
    return 'bg-red-500/20 text-red-300';
  };

  const categories = [...new Set(products.map(p => p.category))];

  // Fonctions de détection et génération
  const detectCategory = (title: string): string => {
    const lowerTitle = title.toLowerCase();
    if (lowerTitle.includes('canapé') || lowerTitle.includes('sofa')) return 'Canapé';
    if (lowerTitle.includes('table')) return 'Table';
    if (lowerTitle.includes('chaise') || lowerTitle.includes('fauteuil')) return 'Chaise';
    if (lowerTitle.includes('lit')) return 'Lit';
    if (lowerTitle.includes('armoire') || lowerTitle.includes('commode')) return 'Rangement';
    if (lowerTitle.includes('lampe') || lowerTitle.includes('éclairage')) return 'Éclairage';
    if (lowerTitle.includes('miroir') || lowerTitle.includes('tapis')) return 'Décoration';
    return 'Mobilier';
  };

  const detectSubcategory = (title: string, description: string): string => {
    const text = `${title} ${description}`.toLowerCase();
    
    if (text.includes('canapé')) {
      if (text.includes('angle')) return 'Canapé d\'angle';
      if (text.includes('convertible')) return 'Canapé convertible';
      return 'Canapé fixe';
    }
    
    if (text.includes('table')) {
      if (text.includes('basse')) return 'Table basse';
      if (text.includes('manger')) return 'Table à manger';
      if (text.includes('bureau')) return 'Table de bureau';
      return 'Table';
    }
    
    if (text.includes('chaise')) {
      if (text.includes('bureau')) return 'Chaise de bureau';
      return 'Chaise de salle à manger';
    }
    
    if (text.includes('fauteuil')) return 'Fauteuil';
    
    return '';
  };

  const detectColor = (text: string): string => {
    const colors = ['blanc', 'noir', 'gris', 'beige', 'marron', 'bleu', 'vert', 'rouge', 'jaune', 'orange', 'rose', 'violet', 'naturel', 'chêne', 'noyer', 'taupe'];
    for (const color of colors) {
      if (text.includes(color)) return color;
    }
    return '';
  };

  const detectMaterial = (text: string): string => {
    const materials = ['bois', 'métal', 'verre', 'tissu', 'cuir', 'velours', 'travertin', 'marbre', 'plastique', 'rotin', 'chenille'];
    for (const material of materials) {
      if (text.includes(material)) return material;
    }
    return '';
  };

  const detectFabric = (text: string): string => {
    const fabrics = ['velours', 'chenille', 'lin', 'coton', 'cuir', 'tissu', 'polyester'];
    for (const fabric of fabrics) {
      if (text.includes(fabric)) return fabric;
    }
    return '';
  };

  const detectStyle = (text: string): string => {
    const styles = ['moderne', 'contemporain', 'scandinave', 'industriel', 'vintage', 'rustique', 'classique', 'minimaliste', 'bohème'];
    for (const style of styles) {
      if (text.includes(style)) return style;
    }
    return '';
  };

  const detectRoom = (text: string): string => {
    const rooms = ['salon', 'chambre', 'cuisine', 'bureau', 'salle à manger', 'entrée', 'terrasse'];
    for (const room of rooms) {
      if (text.includes(room)) return room;
    }
    return '';
  };

  const extractDimensions = (description: string): string => {
    const dimensionMatch = description.match(/(\d+)\s*[x×]\s*(\d+)(?:\s*[x×]\s*(\d+))?\s*cm/i);
    return dimensionMatch ? dimensionMatch[0] : '';
  };

  const generateTags = (text: string): string[] => {
    const tags = [];
    const color = detectColor(text);
    const material = detectMaterial(text);
    const style = detectStyle(text);
    
    if (color) tags.push(color);
    if (material) tags.push(material);
    if (style) tags.push(style);
    if (text.includes('convertible')) tags.push('convertible');
    if (text.includes('rangement')) tags.push('rangement');
    
    return tags;
  };

  const generateSEOTitle = (title: string): string => {
    return `${title} - Decora Home`.substring(0, 70);
  };

  const generateSEODescription = (title: string, description: string): string => {
    const shortDesc = description.substring(0, 100) || title;
    return `${shortDesc}. Livraison gratuite. Decora Home.`.substring(0, 155);
  };

  const generateAdHeadline = (title: string): string => {
    return title.substring(0, 30);
  };

  const generateAdDescription = (title: string): string => {
    return `${title}. Promo !`.substring(0, 90);
  };

  const getGoogleCategoryCode = (category: string): string => {
    const mapping: { [key: string]: string } = {
      'Canapé': '635',
      'Chaise': '436',
      'Table': '443',
      'Lit': '630',
      'Rangement': '443',
      'Éclairage': '594',
      'Décoration': '696'
    };
    return mapping[category] || '443';
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="text-center">
          <Loader2 className="w-16 h-16 text-cyan-400 animate-spin mx-auto mb-4" />
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
            onClick={handleManualEnrichment}
            disabled={selectedProducts.length === 0 || isEnriching}
            className="bg-gradient-to-r from-purple-500 to-pink-600 hover:from-purple-400 hover:to-pink-500 disabled:from-gray-600 disabled:to-gray-700 text-white px-4 py-2 rounded-xl flex items-center gap-2 font-semibold transition-all disabled:cursor-not-allowed"
          >
            {isEnriching ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Enrichissement... ({enrichmentProgress}%)
              </>
            ) : (
              <>
                <Brain className="w-4 h-4" />
                Enrichir Manuel ({selectedProducts.length})
              </>
            )}
          </button>
          
          <button
            onClick={handleBulkEnrichment}
            disabled={isEnriching}
            className="bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 disabled:from-gray-600 disabled:to-gray-700 text-white px-4 py-2 rounded-xl flex items-center gap-2 font-semibold transition-all disabled:cursor-not-allowed"
          >
            <Zap className="w-4 h-4" />
            Enrichir Tout
          </button>
          
          <button
            onClick={() => setShowGoogleCategoryModal(true)}
            className="bg-orange-600 hover:bg-orange-700 text-white px-4 py-2 rounded-xl flex items-center gap-2 transition-all"
          >
            <Globe className="w-4 h-4" />
            Google Categories
          </button>
          
          <button
            onClick={loadEnrichedProducts}
            className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-xl flex items-center gap-2 transition-all"
          >
            <RefreshCw className="w-4 h-4" />
            Actualiser
          </button>
        </div>
      </div>

      {/* Barre de recherche et filtres */}
      <div className="bg-white/10 backdrop-blur-xl rounded-2xl p-6 border border-white/20">
        <div className="flex flex-col lg:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Rechercher par titre, catégorie, marque, tags..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-3 bg-black/40 border border-gray-600 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:border-cyan-400 focus:ring-2 focus:ring-cyan-400/30"
            />
          </div>
          
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-3 rounded-xl flex items-center gap-2 transition-all"
          >
            <Filter className="w-4 h-4" />
            Filtres
            {showFilters ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </button>
        </div>

        {showFilters && (
          <div className="mt-6 pt-6 border-t border-gray-600/50">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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
                <label className="block text-sm text-gray-300 mb-2">Confiance IA</label>
                <select
                  value={selectedConfidence}
                  onChange={(e) => setSelectedConfidence(e.target.value)}
                  className="w-full bg-black/40 border border-gray-600 rounded-xl px-3 py-2 text-white"
                >
                  <option value="all">Tous les niveaux</option>
                  <option value="high">Élevée (80-100%)</option>
                  <option value="medium">Moyenne (50-79%)</option>
                  <option value="low">Faible (0-49%)</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm text-gray-300 mb-2">Actions</label>
                <div className="flex gap-2">
                  <button
                    onClick={() => {
                      const csvContent = generateCSVExport(filteredProducts);
                      const blob = new Blob([csvContent], { type: 'text/csv' });
                      const url = URL.createObjectURL(blob);
                      const a = document.createElement('a');
                      a.href = url;
                      a.download = 'catalogue-enrichi.csv';
                      a.click();
                      URL.revokeObjectURL(url);
                    }}
                    className="bg-green-600 hover:bg-green-700 text-white px-3 py-2 rounded-lg text-sm"
                  >
                    <Download className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Actions en lot */}
      {selectedProducts.length > 0 && (
        <div className="bg-purple-500/20 border border-purple-400/50 rounded-xl p-4">
          <div className="flex items-center justify-between">
            <span className="text-purple-300 font-semibold">
              {selectedProducts.length} produit(s) sélectionné(s)
            </span>
            <div className="flex gap-2">
              <button
                onClick={() => setSelectedProducts([])}
                className="text-gray-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Tableau des produits enrichis */}
      <div className="bg-white/10 backdrop-blur-xl rounded-2xl border border-white/20 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-black/20">
              <tr>
                <th className="text-left p-4">
                  <input
                    type="checkbox"
                    checked={selectedProducts.length === filteredProducts.length && filteredProducts.length > 0}
                    onChange={handleSelectAll}
                    className="w-4 h-4 text-cyan-600 bg-gray-800 border-gray-600 rounded focus:ring-cyan-500"
                  />
                </th>
                <th className="text-left p-4 text-cyan-300 font-semibold">Produit</th>
                <th className="text-left p-4 text-cyan-300 font-semibold">Catégorie</th>
                <th className="text-left p-4 text-cyan-300 font-semibold">Attributs IA</th>
                <th className="text-left p-4 text-cyan-300 font-semibold">Google Category</th>
                <th className="text-left p-4 text-cyan-300 font-semibold">Confiance</th>
                <th className="text-left p-4 text-cyan-300 font-semibold">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredProducts.map((product) => (
                <tr key={product.id} className="border-b border-white/10 hover:bg-white/5">
                  <td className="p-4">
                    <input
                      type="checkbox"
                      checked={selectedProducts.includes(product.id)}
                      onChange={() => handleSelectProduct(product.id)}
                      className="w-4 h-4 text-cyan-600 bg-gray-800 border-gray-600 rounded focus:ring-cyan-500"
                    />
                  </td>
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
                        <div className="text-gray-400 text-xs">{product.brand}</div>
                        <div className="text-green-400 font-bold">{product.price}€</div>
                      </div>
                    </div>
                  </td>
                  <td className="p-4">
                    <div className="space-y-1">
                      <span className="text-white font-medium">{product.category}</span>
                      {product.subcategory && (
                        <div className="text-gray-400 text-xs">{product.subcategory}</div>
                      )}
                    </div>
                  </td>
                  <td className="p-4">
                    <div className="space-y-1">
                      {product.color && (
                        <span className="bg-blue-500/20 text-blue-300 px-2 py-1 rounded text-xs mr-1">
                          {product.color}
                        </span>
                      )}
                      {product.material && (
                        <span className="bg-green-500/20 text-green-300 px-2 py-1 rounded text-xs mr-1">
                          {product.material}
                        </span>
                      )}
                      {product.style && (
                        <span className="bg-purple-500/20 text-purple-300 px-2 py-1 rounded text-xs mr-1">
                          {product.style}
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="p-4">
                    <div className="space-y-1">
                      <span className="text-orange-400 font-mono text-sm">{product.google_product_category}</span>
                      <div className="text-gray-400 text-xs">
                        {googleCategories.find(cat => cat.google_product_category === product.google_product_category)?.description || 'Non mappé'}
                      </div>
                    </div>
                  </td>
                  <td className="p-4">
                    <div className="flex items-center gap-2">
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${getConfidenceColor(product.confidence_score)}`}>
                        {product.confidence_score}%
                      </span>
                      <div className="flex">
                        {[...Array(5)].map((_, i) => (
                          <Star 
                            key={i} 
                            className={`w-3 h-3 ${i < Math.floor(product.confidence_score / 20) ? 'text-yellow-400 fill-current' : 'text-gray-600'}`} 
                          />
                        ))}
                      </div>
                    </div>
                  </td>
                  <td className="p-4">
                    <div className="flex gap-2">
                      <button
                        onClick={() => setEditingProduct(product)}
                        className="text-yellow-400 hover:text-yellow-300 p-1"
                        title="Modifier"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <a
                        href={product.product_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-purple-400 hover:text-purple-300 p-1"
                        title="Voir le produit"
                      >
                        <ExternalLink className="w-4 h-4" />
                      </a>
                      <button
                        onClick={() => handleDeleteProduct(product.id)}
                        className="text-red-400 hover:text-red-300 p-1"
                        title="Supprimer"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
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
          <Brain className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-xl font-bold text-white mb-2">Aucun produit enrichi trouvé</h3>
          <p className="text-gray-400 mb-6">
            {searchTerm || selectedCategory !== 'all' || selectedConfidence !== 'all'
              ? 'Aucun produit ne correspond à vos critères de recherche.'
              : 'Votre catalogue enrichi est vide. Enrichissez vos produits avec l\'IA.'}
          </p>
          <button
            onClick={handleBulkEnrichment}
            className="bg-gradient-to-r from-purple-500 to-pink-600 hover:from-purple-400 hover:to-pink-500 text-white px-6 py-3 rounded-xl font-semibold transition-all"
          >
            Enrichir le catalogue avec IA
          </button>
        </div>
      )}

      {/* Modal Google Categories */}
      {showGoogleCategoryModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-800/95 backdrop-blur-xl rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto border border-slate-600/50">
            <div className="flex items-center justify-between p-6 border-b border-slate-600/50">
              <h2 className="text-2xl font-bold text-white">Gestion Catégories Google Shopping</h2>
              <button
                onClick={() => setShowGoogleCategoryModal(false)}
                className="text-gray-400 hover:text-white transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="p-6 space-y-6">
              {/* Import CSV */}
              <div className="bg-black/20 rounded-xl p-4">
                <h3 className="text-lg font-bold text-white mb-4">Import CSV Catégories</h3>
                <div className="flex gap-4">
                  <input
                    type="file"
                    accept=".csv"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) handleGoogleCategoryImport(file);
                    }}
                    className="hidden"
                    id="google-csv-upload"
                  />
                  <label
                    htmlFor="google-csv-upload"
                    className="bg-cyan-600 hover:bg-cyan-700 text-white px-4 py-2 rounded-xl cursor-pointer flex items-center gap-2"
                  >
                    <Upload className="w-4 h-4" />
                    Importer CSV
                  </label>
                  <button
                    onClick={() => {
                      const csvContent = generateGoogleCategoriesCSV();
                      const blob = new Blob([csvContent], { type: 'text/csv' });
                      const url = URL.createObjectURL(blob);
                      const a = document.createElement('a');
                      a.href = url;
                      a.download = 'google-categories-template.csv';
                      a.click();
                      URL.revokeObjectURL(url);
                    }}
                    className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-xl flex items-center gap-2"
                  >
                    <Download className="w-4 h-4" />
                    Template CSV
                  </button>
                </div>
              </div>

              {/* Liste des catégories */}
              <div className="bg-black/20 rounded-xl p-4 max-h-96 overflow-y-auto">
                <h3 className="text-lg font-bold text-white mb-4">Catégories Google Shopping ({googleCategories.length})</h3>
                <div className="space-y-2">
                  {googleCategories.map((category) => (
                    <div key={category.id} className="flex items-center justify-between p-3 bg-white/5 rounded-lg">
                      <div className="flex-1">
                        <div className="font-semibold text-white">{category.category} → {category.subcategory}</div>
                        <div className="text-gray-400 text-sm">{category.description}</div>
                      </div>
                      <div className="text-orange-400 font-mono font-bold">
                        {category.google_product_category}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal d'édition produit */}
      {editingProduct && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-800/95 backdrop-blur-xl rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto border border-slate-600/50">
            <div className="flex items-center justify-between p-6 border-b border-slate-600/50">
              <h2 className="text-2xl font-bold text-white">Modifier le produit enrichi</h2>
              <button
                onClick={() => setEditingProduct(null)}
                className="text-gray-400 hover:text-white transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="p-6">
              <ProductEditForm
                product={editingProduct}
                googleCategories={googleCategories}
                onSave={handleUpdateProduct}
                onCancel={() => setEditingProduct(null)}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// Composant de formulaire d'édition
const ProductEditForm: React.FC<{
  product: EnrichedProduct;
  googleCategories: GoogleCategory[];
  onSave: (product: EnrichedProduct) => void;
  onCancel: () => void;
}> = ({ product, googleCategories, onSave, onCancel }) => {
  const [formData, setFormData] = useState(product);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({
      ...formData,
      enriched_at: new Date().toISOString(),
      enrichment_source: 'manual'
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm text-gray-300 mb-2">Titre</label>
          <input
            type="text"
            value={formData.title}
            onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
            className="w-full bg-black/40 border border-gray-600 rounded-xl px-4 py-3 text-white"
          />
        </div>
        
        <div>
          <label className="block text-sm text-gray-300 mb-2">Catégorie</label>
          <input
            type="text"
            value={formData.category}
            onChange={(e) => setFormData(prev => ({ ...prev, category: e.target.value }))}
            className="w-full bg-black/40 border border-gray-600 rounded-xl px-4 py-3 text-white"
          />
        </div>
        
        <div>
          <label className="block text-sm text-gray-300 mb-2">Sous-catégorie</label>
          <input
            type="text"
            value={formData.subcategory}
            onChange={(e) => setFormData(prev => ({ ...prev, subcategory: e.target.value }))}
            className="w-full bg-black/40 border border-gray-600 rounded-xl px-4 py-3 text-white"
          />
        </div>
        
        <div>
          <label className="block text-sm text-gray-300 mb-2">Couleur</label>
          <input
            type="text"
            value={formData.color}
            onChange={(e) => setFormData(prev => ({ ...prev, color: e.target.value }))}
            className="w-full bg-black/40 border border-gray-600 rounded-xl px-4 py-3 text-white"
          />
        </div>
        
        <div>
          <label className="block text-sm text-gray-300 mb-2">Matériau</label>
          <input
            type="text"
            value={formData.material}
            onChange={(e) => setFormData(prev => ({ ...prev, material: e.target.value }))}
            className="w-full bg-black/40 border border-gray-600 rounded-xl px-4 py-3 text-white"
          />
        </div>
        
        <div>
          <label className="block text-sm text-gray-300 mb-2">Style</label>
          <input
            type="text"
            value={formData.style}
            onChange={(e) => setFormData(prev => ({ ...prev, style: e.target.value }))}
            className="w-full bg-black/40 border border-gray-600 rounded-xl px-4 py-3 text-white"
          />
        </div>
        
        <div>
          <label className="block text-sm text-gray-300 mb-2">Pièce</label>
          <select
            value={formData.room}
            onChange={(e) => setFormData(prev => ({ ...prev, room: e.target.value }))}
            className="w-full bg-black/40 border border-gray-600 rounded-xl px-4 py-3 text-white"
          >
            <option value="">Sélectionner une pièce</option>
            <option value="salon">Salon</option>
            <option value="chambre">Chambre</option>
            <option value="cuisine">Cuisine</option>
            <option value="bureau">Bureau</option>
            <option value="salle à manger">Salle à manger</option>
            <option value="entrée">Entrée</option>
            <option value="terrasse">Terrasse</option>
          </select>
        </div>
        
        <div>
          <label className="block text-sm text-gray-300 mb-2">Google Category</label>
          <select
            value={formData.google_product_category}
            onChange={(e) => setFormData(prev => ({ ...prev, google_product_category: e.target.value }))}
            className="w-full bg-black/40 border border-gray-600 rounded-xl px-4 py-3 text-white"
          >
            <option value="">Sélectionner une catégorie Google</option>
            {googleCategories.map((cat) => (
              <option key={cat.id} value={cat.google_product_category}>
                {cat.google_product_category} - {cat.category} → {cat.subcategory}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div>
        <label className="block text-sm text-gray-300 mb-2">Description</label>
        <textarea
          value={formData.description}
          onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
          rows={4}
          className="w-full bg-black/40 border border-gray-600 rounded-xl px-4 py-3 text-white resize-none"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm text-gray-300 mb-2">SEO Title (≤70 caractères)</label>
          <input
            type="text"
            value={formData.seo_title}
            onChange={(e) => setFormData(prev => ({ ...prev, seo_title: e.target.value.substring(0, 70) }))}
            className="w-full bg-black/40 border border-gray-600 rounded-xl px-4 py-3 text-white"
            maxLength={70}
          />
          <div className="text-xs text-gray-400 mt-1">{formData.seo_title.length}/70</div>
        </div>
        
        <div>
          <label className="block text-sm text-gray-300 mb-2">SEO Description (≤155 caractères)</label>
          <textarea
            value={formData.seo_description}
            onChange={(e) => setFormData(prev => ({ ...prev, seo_description: e.target.value.substring(0, 155) }))}
            rows={3}
            className="w-full bg-black/40 border border-gray-600 rounded-xl px-4 py-3 text-white resize-none"
            maxLength={155}
          />
          <div className="text-xs text-gray-400 mt-1">{formData.seo_description.length}/155</div>
        </div>
      </div>

      <div className="flex justify-between pt-6 border-t border-gray-600/50">
        <button
          type="button"
          onClick={onCancel}
          className="bg-gray-600 hover:bg-gray-700 text-white px-6 py-3 rounded-xl transition-all"
        >
          Annuler
        </button>
        
        <button
          type="submit"
          className="bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-400 hover:to-emerald-500 text-white px-6 py-3 rounded-xl flex items-center gap-2 font-semibold transition-all"
        >
          <Save className="w-4 h-4" />
          Sauvegarder
        </button>
      </div>
    </form>
  );
};

// Fonction pour générer le CSV d'export
const generateCSVExport = (products: EnrichedProduct[]): string => {
  const headers = [
    'id', 'title', 'category', 'subcategory', 'color', 'material', 'fabric', 
    'style', 'dimensions', 'room', 'price', 'stock_qty', 'google_product_category',
    'seo_title', 'seo_description', 'ad_headline', 'ad_description', 'brand',
    'confidence_score', 'enriched_at'
  ];
  
  const csvContent = [
    headers.join(','),
    ...products.map(product => 
      headers.map(header => {
        const value = product[header as keyof EnrichedProduct];
        if (Array.isArray(value)) return `"${value.join(', ')}"`;
        return `"${value || ''}"`;
      }).join(',')
    )
  ].join('\n');
  
  return csvContent;
};

// Fonction pour générer le template CSV Google Categories
const generateGoogleCategoriesCSV = (): string => {
  const headers = ['category', 'subcategory', 'google_product_category', 'description'];
  const examples = [
    ['Canapé', 'Canapé fixe', '635', 'Canapés fixes et droits'],
    ['Chaise', 'Chaise de bureau', '436', 'Chaises et fauteuils de bureau'],
    ['Table', 'Table à manger', '443', 'Tables de salle à manger']
  ];
  
  return [
    headers.join(','),
    ...examples.map(row => row.map(cell => `"${cell}"`).join(','))
  ].join('\n');
};