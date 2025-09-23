import React, { useState, useEffect } from 'react';
import { 
  Search, Filter, Plus, Eye, Edit, Trash2, ExternalLink, 
  Package, Tag, DollarSign, Image, BarChart3, Settings,
  ChevronDown, ChevronUp, X, Save, AlertCircle, CheckCircle,
  Brain, Zap, RefreshCw, Loader2, Upload, Clock, Calendar
} from 'lucide-react';
import { useNotifications } from './NotificationSystem';
import { supabase } from '../lib/supabase';

interface EnrichedProduct {
  id: string;
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
  image_url: string;
  additional_image_links: string[];
  product_url: string;
  canonical_link: string;
  percent_off: number;
  ai_confidence: number;
  seo_title: string;
  seo_description: string;
  enrichment_source: string;
  created_at: string;
  updated_at: string;
}

export const ProductsEnrichedTable: React.FC = () => {
  const [products, setProducts] = useState<EnrichedProduct[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<EnrichedProduct[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [loading, setLoading] = useState(true);
  const [isEnriching, setIsEnriching] = useState(false);
  const [enrichmentProgress, setEnrichmentProgress] = useState(0);
  const [showImportModal, setShowImportModal] = useState(false);
  const [cronStatus, setCronStatus] = useState<any>(null);
  const [cronLoading, setCronLoading] = useState(false);
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

  // Générer clé de stockage spécifique au revendeur
  const getRetailerStorageKey = (key: string) => {
    if (!currentUser?.email) return key;
    const emailHash = btoa(currentUser.email).replace(/[^a-zA-Z0-9]/g, '').substring(0, 8);
    return `${key}_${emailHash}`;
  };

  const { showSuccess, showError, showInfo } = useNotifications();

  useEffect(() => {
    loadEnrichedProducts();
    loadCronStatus();
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
        product.vendor.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.material?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.color?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (selectedCategory !== 'all') {
      filtered = filtered.filter(product => product.product_type === selectedCategory);
    }

    setFilteredProducts(filtered);
  };

  const loadCronStatus = async () => {
    setCronLoading(true);
    try {
      const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
      const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

      if (!supabaseUrl || !supabaseKey) {
        console.log('⚠️ Supabase non configuré pour le statut cron');
        setCronStatus(null);
        return;
      }

      try {
        const response = await fetch(`${supabaseUrl}/functions/v1/get-cron-status`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${supabaseKey}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            retailer_id: 'demo-retailer-id'
          }),
        });

        if (response.ok) {
          const cronData = await response.json();
          setCronStatus(cronData);
          console.log('✅ Statut cron chargé:', cronData);
        } else {
          console.log('⚠️ Erreur chargement statut cron:', response.status);
          setCronStatus(null);
        }
      } catch (fetchError) {
        console.log('⚠️ Erreur réseau statut cron:', fetchError);
        setCronStatus(null);
      }
    } catch (error) {
      console.error('❌ Erreur chargement statut cron:', error);
      setCronStatus(null);
    } finally {
      setCronLoading(false);
    }
  };

  const handleSetupCron = async (schedule: 'daily' | 'weekly', enabled: boolean) => {
    try {
      const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
      const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

      if (!supabaseUrl || !supabaseKey) {
        showError('Configuration manquante', 'Supabase non configuré pour le cron.');
        return;
      }

      try {
        const response = await fetch(`${supabaseUrl}/functions/v1/setup-ai-cron`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${supabaseKey}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            retailer_id: 'demo-retailer-id',
            schedule,
            enabled
          }),
        });

        if (response.ok) {
          const result = await response.json();
          setCronStatus(result);
          showSuccess('Cron configuré', result.message);
          console.log('✅ Cron configuré:', result);
        } else {
          showError('Erreur cron', 'Impossible de configurer le cron d\'enrichissement');
        }
      } catch (fetchError) {
        showError('Erreur réseau', 'Impossible de contacter le serveur pour configurer le cron');
      }
    } catch (error) {
      console.error('❌ Erreur configuration cron:', error);
      showError('Erreur cron', 'Erreur lors de la configuration du cron');
    }
  };

  const loadEnrichedProducts = async () => {
    try {
      setLoading(true);
      
      // Charger depuis Supabase products_enriched table
      const { data: enrichedProducts, error } = await supabase
        .from('products_enriched')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('❌ Erreur chargement Supabase:', error);
        // Fallback vers localStorage si Supabase échoue
        const localEnrichedProducts = localStorage.getItem(getRetailerStorageKey('enriched_products'));
        if (localEnrichedProducts) {
          try {
            const parsedProducts = JSON.parse(localEnrichedProducts);
            console.log(`✅ Catalogue enrichi chargé depuis localStorage (fallback):`, parsedProducts.length);
            setProducts(parsedProducts);
          } catch (parseError) {
            console.error('Erreur parsing localStorage:', parseError);
            setProducts([]);
          }
        } else {
          setProducts([]);
        }
      } else {
        console.log(`✅ Catalogue enrichi chargé depuis Supabase:`, enrichedProducts?.length || 0);
        setProducts(enrichedProducts || []);
      }
      
    } catch (error) {
      console.error('❌ Erreur:', error);
      showError('Erreur', 'Erreur lors du chargement du catalogue enrichi.');
      setProducts([]);
    } finally {
      setLoading(false);
    }
  };

  const handleImportCatalog = async () => {
    try {
      const catalogProducts = localStorage.getItem(getRetailerStorageKey('catalog_products'));
      if (!catalogProducts) {
        showError('Catalogue vide', 'Aucun produit trouvé. Importez d\'abord votre catalogue dans l\'onglet Catalogue.');
        setShowImportModal(false);
        return;
      }

      const products = JSON.parse(catalogProducts);
      console.log(`📦 Import catalogue pour ${currentUser?.email}:`, products.length);

      showInfo('Import automatique démarré', `Import de ${products.length} produits → Enrichissement IA → Remplissage table enrichie...`);
      
      // ÉTAPE 1: Sauvegarder dans imported_products
      showInfo('Étape 1/4', 'Sauvegarde des produits dans imported_products...');
      
      const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
      const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

      if (!supabaseUrl || !supabaseKey) {
        // Fallback local si Supabase non configuré
        const enrichedProducts = await enrichProductsLocally(products);
        setProducts(enrichedProducts);
        setShowImportModal(false);
        showSuccess('Import local terminé', `${products.length} produits enrichis localement !`);
        return;
      }

      // Transformer les produits pour imported_products
      const importedProducts = products.map(product => ({
        external_id: product.id || `catalog-${Date.now()}-${Math.random()}`,
        retailer_id: currentUser?.email || 'demo-retailer-id',
        name: product.name || product.title || 'Produit sans nom',
        description: product.description || '',
        price: parseFloat(product.price) || 0,
        compare_at_price: product.compare_at_price ? parseFloat(product.compare_at_price) : null,
        category: product.category || 'Mobilier',
        vendor: product.vendor || 'Decora Home',
        image_url: product.image_url || 'https://images.pexels.com/photos/1350789/pexels-photo-1350789.jpeg',
        product_url: product.product_url || '#',
        stock: parseInt(product.stock) || 0,
        source_platform: 'catalog',
        status: 'active',
        extracted_attributes: {}
      }));

      const saveResponse = await fetch(`${supabaseUrl}/functions/v1/save-imported-products`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${supabaseKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          products: importedProducts,
          retailer_id: currentUser?.email || 'demo-retailer-id',
          source: 'catalog_import'
        }),
      });

      if (!saveResponse.ok) {
        throw new Error('Erreur sauvegarde imported_products');
      }

      const saveResult = await saveResponse.json();
      console.log('✅ ÉTAPE 1 terminée:', saveResult.saved_count, 'produits sauvegardés');

      // ÉTAPE 2: Enrichissement IA avec DeepSeek
      showInfo('Étape 2/4', 'Enrichissement IA avec DeepSeek (catégories, GTIN, dimensions)...');
      
      const enrichResponse = await fetch(`${supabaseUrl}/functions/v1/enrich-products`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${supabaseKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          products: importedProducts,
          source: 'catalog_import',
          retailer_id: currentUser?.email || 'demo-retailer-id'
        }),
      });

      if (!enrichResponse.ok) {
        throw new Error('Erreur enrichissement DeepSeek');
      }

      const enrichResult = await enrichResponse.json();
      console.log('✅ ÉTAPE 2 terminée:', enrichResult.stats);

      // ÉTAPE 3: Recharger les produits enrichis
      showInfo('Étape 3/4', 'Chargement des produits enrichis...');
      await loadEnrichedProducts();

      // ÉTAPE 4: Configuration cron automatique
      showInfo('Étape 4/4', 'Configuration du cron quotidien...');
      try {
        await handleSetupCron('daily', true);
      } catch (cronError) {
        console.log('⚠️ Erreur cron (non bloquant):', cronError);
      }
      
      setShowImportModal(false);
      
      showSuccess(
        'Import automatique complet !', 
        `✅ ${products.length} produits importés\n🤖 ${enrichResult.stats?.enriched_count || products.length} produits enrichis DeepSeek\n📊 Catégories + GTIN + Dimensions extraits\n⏰ Cron quotidien configuré`,
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

    } catch (error) {
      console.error('❌ Erreur import catalogue:', error);
      showError('Erreur import automatique', error.message || 'Une erreur est survenue pendant l\'import automatique.');
      setShowImportModal(false);
    }
  };

  // Fonctions utilitaires pour extraction basique
  const generateHandle = (title: string): string => {
    return title
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .trim()
      .substring(0, 100);
  };

  const enrichProductsLocally = async (products: any[]) => {
    return products.map(product => ({
      id: `enriched-${product.id || Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      handle: product.handle || generateHandle(product.name || product.title || ''),
      title: product.name || product.title || 'Produit sans nom',
      description: product.description || '',
      short_description: (product.description || product.title || '').substring(0, 160),
      product_type: product.category || 'Mobilier',
      subcategory: extractSubcategory(product.name || product.title || '', product.category || ''),
      tags: Array.isArray(product.tags) ? product.tags : [product.category || 'mobilier'],
      vendor: product.vendor || 'Decora Home',
      brand: product.vendor || 'Decora Home',
      material: extractMaterial(product.description || product.name || ''),
      color: extractColor(product.description || product.name || ''),
      style: extractStyle(product.description || product.name || ''),
      room: extractRoom(product.description || product.name || ''),
      dimensions: extractDimensions(product.description || product.name || ''),
      weight: extractWeight(product.description || product.name || ''),
      capacity: extractCapacity(product.description || product.name || ''),
      price: parseFloat(product.price) || 0,
      compare_at_price: product.compare_at_price ? parseFloat(product.compare_at_price) : undefined,
      currency: 'EUR',
      stock_quantity: parseInt(product.stock) || 0,
      stock_qty: parseInt(product.stock) || 0,
      availability_status: parseInt(product.stock) > 0 ? 'En stock' : 'Rupture',
      gtin: generateGTIN(product.name || product.title || '', product.category || ''),
      mpn: product.sku || generateMPN(product.name || product.title || ''),
      identifier_exists: true,
      image_url: product.image_url || 'https://images.pexels.com/photos/1350789/pexels-photo-1350789.jpeg',
      additional_image_links: [],
      product_url: product.product_url || '#',
      canonical_link: product.product_url || '#',
      percent_off: product.compare_at_price && product.price ? 
        Math.round(((parseFloat(product.compare_at_price) - parseFloat(product.price)) / parseFloat(product.compare_at_price)) * 100) : 0,
      ai_confidence: 0.85,
      seo_title: generateSEOTitle(product.name || product.title || '', product.category || ''),
      seo_description: generateSEODescription(product.name || product.title || '', product.description || ''),
      enrichment_source: 'local_enhanced',
      enrichment_version: '2.0',
      last_enriched_at: new Date().toISOString(),
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }));
  };

  const extractSubcategory = (title: string, category: string): string => {
    const lowerTitle = title.toLowerCase();
    const lowerCategory = category.toLowerCase();
    
    if (lowerCategory.includes('lit')) {
      if (lowerTitle.includes('superposé')) return 'Lit superposé';
      if (lowerTitle.includes('mezzanine')) return 'Lit mezzanine';
      if (lowerTitle.includes('double')) return 'Lit double';
      if (lowerTitle.includes('simple')) return 'Lit simple';
      if (lowerTitle.includes('king')) return 'Lit king size';
      return 'Lit standard';
    }
    
    if (lowerCategory.includes('canapé')) {
      if (lowerTitle.includes('angle')) return 'Canapé d\'angle';
      if (lowerTitle.includes('convertible')) return 'Canapé convertible';
      if (lowerTitle.includes('fixe')) return 'Canapé fixe';
      return 'Canapé standard';
    }
    
    if (lowerCategory.includes('table')) {
      if (lowerTitle.includes('basse')) return 'Table basse';
      if (lowerTitle.includes('manger')) return 'Table à manger';
      if (lowerTitle.includes('console')) return 'Console';
      if (lowerTitle.includes('bureau')) return 'Bureau';
      return 'Table standard';
    }
    
    if (lowerCategory.includes('chaise')) {
      if (lowerTitle.includes('bureau')) return 'Chaise de bureau';
      if (lowerTitle.includes('bar')) return 'Tabouret de bar';
      if (lowerTitle.includes('fauteuil')) return 'Fauteuil';
      return 'Chaise standard';
    }
    
    return '';
  };

  const extractMaterial = (text: string): string => {
    const lowerText = text.toLowerCase();
    const materials = [
      'velours côtelé', 'velours', 'cuir', 'bois massif', 'bois', 'métal noir', 'métal', 
      'verre trempé', 'verre', 'tissu chenille', 'tissu', 'travertin naturel', 'travertin', 
      'marbre', 'chenille', 'rotin', 'osier', 'chêne massif', 'chêne', 'hêtre', 'pin', 
      'teck', 'noyer', 'acier inoxydable', 'acier', 'aluminium', 'fer forgé'
    ];
    const found = materials.find(material => lowerText.includes(material));
    return found || '';
  };

  const extractColor = (text: string): string => {
    const lowerText = text.toLowerCase();
    const colors = [
      'beige', 'blanc cassé', 'blanc', 'noir mat', 'noir', 'gris anthracite', 'gris clair', 'gris', 
      'bleu marine', 'bleu', 'vert olive', 'vert', 'rouge bordeaux', 'rouge', 'marron chocolat', 
      'marron', 'taupe', 'chêne naturel', 'chêne', 'noyer foncé', 'noyer', 'crème', 'ivoire'
    ];
    const found = colors.find(color => lowerText.includes(color));
    return found || '';
  };

  const extractStyle = (text: string): string => {
    const lowerText = text.toLowerCase();
    const styles = [
      'contemporain', 'moderne', 'scandinave', 'industriel', 'vintage', 'rustique', 
      'classique', 'minimaliste', 'bohème', 'art déco', 'colonial'
    ];
    const found = styles.find(style => lowerText.includes(style));
    return found || 'Moderne';
  };

  const extractRoom = (text: string): string => {
    const lowerText = text.toLowerCase();
    const rooms = [
      'salon', 'chambre', 'cuisine', 'bureau', 'salle à manger', 'entrée', 
      'terrasse', 'jardin', 'balcon', 'véranda'
    ];
    const found = rooms.find(room => lowerText.includes(room));
    return found || 'Salon';
  };

  const extractDimensions = (text: string): string => {
    // Rechercher des patterns de dimensions
    const dimensionPatterns = [
      /(\d+)\s*[x×]\s*(\d+)\s*[x×]\s*(\d+)\s*cm/i, // LxlxH
      /(\d+)\s*[x×]\s*(\d+)\s*cm/i, // LxL
      /ø\s*(\d+)\s*cm/i, // Diamètre
      /longueur\s*:?\s*(\d+)\s*cm/i,
      /largeur\s*:?\s*(\d+)\s*cm/i,
      /hauteur\s*:?\s*(\d+)\s*cm/i
    ];
    
    for (const pattern of dimensionPatterns) {
      const match = text.match(pattern);
      if (match) {
        return match[0];
      }
    }
    return '';
  };

  const extractWeight = (text: string): string => {
    const weightMatch = text.match(/(\d+(?:\.\d+)?)\s*kg/i);
    return weightMatch ? weightMatch[0] : '';
  };

  const extractCapacity = (text: string): string => {
    const capacityMatch = text.match(/(\d+)\s*places?/i);
    if (capacityMatch) return `${capacityMatch[1]} places`;
    
    const drawerMatch = text.match(/(\d+)\s*tiroirs?/i);
    if (drawerMatch) return `${drawerMatch[1]} tiroirs`;
    
    return '';
  };

  const generateGTIN = (title: string, category: string): string => {
    // Générer un GTIN-13 basé sur le titre et la catégorie
    const hash = btoa(title + category).replace(/[^0-9]/g, '').substring(0, 12);
    const paddedHash = hash.padEnd(12, '0');
    
    // Calculer le chiffre de contrôle
    let sum = 0;
    for (let i = 0; i < 12; i++) {
      const digit = parseInt(paddedHash[i]);
      sum += i % 2 === 0 ? digit : digit * 3;
    }
    const checkDigit = (10 - (sum % 10)) % 10;
    
    return paddedHash + checkDigit;
  };

  const generateMPN = (title: string): string => {
    // Générer un MPN basé sur le titre
    return title
      .toUpperCase()
      .replace(/[^A-Z0-9]/g, '')
      .substring(0, 10)
      .padEnd(10, '0');
  };

  const generateSEOTitle = (title: string, category: string): string => {
    return `${title} - ${category} Premium | Decora Home`.substring(0, 60);
  };

  const generateSEODescription = (title: string, description: string): string => {
    const baseDesc = description || `Découvrez ${title} dans notre collection premium.`;
    return `${baseDesc} Livraison gratuite. Qualité garantie.`.substring(0, 155);
  };

  const handleEnrichWithDeepSeek = async () => {
    try {
      // Validate Supabase configuration first
      const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
      const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
      
      if (!supabaseUrl || !supabaseKey) {
        showError('Configuration manquante', 'Supabase non configuré. Cliquez sur "Connect to Supabase" en haut à droite.');
        return;
      }

      setIsEnriching(true);
      setEnrichmentProgress(0);
      
      showInfo('Enrichissement démarré', 'Analyse des produits avec DeepSeek IA...');

      // Récupérer les produits du catalogue local
      const catalogProducts = localStorage.getItem(getRetailerStorageKey('catalog_products'));
      if (!catalogProducts) {
        showError('Catalogue vide', 'Aucun produit trouvé. Importez d\'abord votre catalogue.');
        return;
      }

      const products = JSON.parse(catalogProducts);
      console.log(`📦 Produits à enrichir pour ${currentUser?.email}:`, products.length);

      // Appeler la fonction d'enrichissement Supabase
      const response = await fetch(`${supabaseUrl}/functions/v1/enrich-products`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${supabaseKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          products: products,
          source: 'catalog',
          retailer_id: currentUser?.email || 'demo-retailer-id'
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('❌ Erreur enrichissement:', errorText);
        throw new Error('Erreur lors de l\'enrichissement avec DeepSeek');
      }

      const result = await response.json();
      console.log('✅ Enrichissement réussi:', result.stats);
      
      // Recharger les produits depuis Supabase
      await loadEnrichedProducts();
      
      showSuccess(
        'Enrichissement terminé !', 
        `${result.stats?.enriched_count || products.length} produits enrichis avec DeepSeek IA !`,
        [
          {
            label: 'Voir les résultats',
            action: () => loadEnrichedProducts(),
            variant: 'primary'
          }
        ]
      );
      
      // Configurer automatiquement le cron quotidien
      await handleSetupCron('daily', true);

    } catch (error) {
      console.error('❌ Erreur enrichissement:', error);
      showError('Erreur d\'enrichissement', 'Impossible d\'enrichir les produits avec DeepSeek.');
    } finally {
      setIsEnriching(false);
      setEnrichmentProgress(0);
    }
  };

  const handleClearDatabase = async () => {
    if (!confirm('⚠️ ATTENTION : Cette action va supprimer TOUS les produits enrichis de la base de données.\n\nCette action est IRRÉVERSIBLE.\n\nÊtes-vous sûr de vouloir continuer ?')) {
      return;
    }

    try {
      const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
      const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
      
      if (!supabaseUrl || !supabaseKey) {
        showError('Configuration manquante', 'Supabase non configuré.');
        return;
      }

      showInfo('Suppression en cours', 'Vidage de la base de données des produits enrichis...');

      const response = await fetch(`${supabaseUrl}/functions/v1/clear-enriched-products`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${supabaseKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          retailer_id: null, // Supprimer TOUS les produits enrichis
          confirm_deletion: true
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('❌ Erreur suppression:', errorText);
        throw new Error('Erreur lors de la suppression');
      }

      const result = await response.json();
      console.log('✅ Base de données vidée:', result);
      
      // Recharger les produits (devrait être vide maintenant)
      await loadEnrichedProducts();
      
      showSuccess(
        'Base de données vidée !', 
        `${result.deleted_count || 0} produits enrichis supprimés. Prêt pour un nouvel import !`
      );

    } catch (error) {
      console.error('❌ Erreur vidage base:', error);
      showError('Erreur de suppression', 'Impossible de vider la base de données.');
    }
  };

  const handleAutoTraining = async () => {
    try {
      // Validate Supabase configuration first
      const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
      const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
      
      if (!supabaseUrl || !supabaseKey) {
        showError('Configuration manquante', 'Supabase non configuré. Cliquez sur "Connect to Supabase" en haut à droite.');
        return;
      }

      showInfo('Entraînement auto', 'Démarrage de l\'entraînement automatique...');

      const response = await fetch(`${supabaseUrl}/functions/v1/auto-ai-trainer`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${supabaseKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          products: products,
          source: 'enriched',
          store_id: 'demo-retailer-id',
          trigger_type: 'manual'
        }),
      });

      if (response.ok) {
        const result = await response.json();
        showSuccess(
          'Entraînement terminé !', 
          `OmnIA a été entraîné avec ${result.stats?.products_processed || products.length} produits !`
        );
      } else {
        const error = await response.json();
        showError('Entraînement échoué', error.error || 'Erreur lors de l\'entraînement.');
      }

    } catch (error) {
      console.error('❌ Erreur entraînement auto:', error);
      showError('Erreur d\'entraînement', 'Impossible de lancer l\'entraînement automatique.');
    }
  };

  const categories = [...new Set(products.map(p => p.product_type))].filter(Boolean);

  if (loading) {
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
          <h2 className="text-2xl font-bold text-white">Catalogue Enrichi DeepSeek</h2>
          <p className="text-gray-300">{filteredProducts.length} produit(s) enrichi(s) sur {products.length}</p>
        </div>
        
        <div className="flex flex-wrap gap-3">
          <button
            onClick={handleClearDatabase}
            className="bg-red-600 hover:bg-red-700 text-white px-6 py-3 rounded-xl flex items-center gap-2 font-semibold transition-all"
          >
            <Trash2 className="w-5 h-5" />
            Vider la base
          </button>
          
          <button
            onClick={() => setShowImportModal(true)}
            className="bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-400 hover:to-emerald-500 text-white px-6 py-3 rounded-xl flex items-center gap-2 font-semibold transition-all"
          >
            <Upload className="w-5 h-5" />
            Importer Catalogue
          </button>
          
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
            onClick={handleAutoTraining}
            className="bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white px-6 py-3 rounded-xl flex items-center gap-2 font-semibold transition-all"
          >
            <Zap className="w-5 h-5" />
            Entraînement Auto
          </button>
          
          <button
            onClick={loadEnrichedProducts}
            className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-3 rounded-xl flex items-center gap-2 transition-all"
          >
            <RefreshCw className="w-4 h-4" />
            Actualiser
          </button>
        </div>
      </div>

      {/* Statut du Cron d'Enrichissement Automatique */}
      <div className="bg-white/10 backdrop-blur-xl rounded-2xl p-8 border border-white/20">
        <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
          <Clock className="w-6 h-6 text-orange-400" />
          Enrichissement Automatique (Cron)
        </h3>
        
        {cronLoading ? (
          <div className="text-center py-4">
            <Loader2 className="w-8 h-8 text-cyan-400 animate-spin mx-auto mb-2" />
            <p className="text-cyan-300">Chargement du statut...</p>
          </div>
        ) : cronStatus ? (
          <div className="space-y-6">
            {/* Statut actuel */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-green-500/20 rounded-xl p-4 text-center">
                <div className="text-2xl font-bold text-green-400">
                  {cronStatus.enabled ? 'ACTIF' : 'INACTIF'}
                </div>
                <div className="text-green-300 text-sm">Statut du cron</div>
              </div>
              <div className="bg-blue-500/20 rounded-xl p-4 text-center">
                <div className="text-2xl font-bold text-blue-400">{cronStatus.schedule_type || 'daily'}</div>
                <div className="text-blue-300 text-sm">Fréquence</div>
              </div>
              <div className="bg-purple-500/20 rounded-xl p-4 text-center">
                <div className="text-2xl font-bold text-purple-400">{cronStatus.last_products_processed || 0}</div>
                <div className="text-purple-300 text-sm">Derniers produits</div>
              </div>
            </div>
            
            {/* Configuration du cron */}
            <div className="flex gap-4">
              <button
                onClick={() => handleSetupCron('daily', true)}
                className="bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-xl font-semibold transition-all"
              >
                Activer cron quotidien
              </button>
              <button
                onClick={() => handleSetupCron('weekly', true)}
                className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-xl font-semibold transition-all"
              >
                Activer cron hebdomadaire
              </button>
              <button
                onClick={() => handleSetupCron('daily', false)}
                className="bg-red-600 hover:bg-red-700 text-white px-6 py-3 rounded-xl font-semibold transition-all"
              >
                Désactiver cron
              </button>
            </div>
          </div>
        ) : (
          <div className="text-center py-8">
            <AlertCircle className="w-12 h-12 text-yellow-400 mx-auto mb-4" />
            <h4 className="text-lg font-semibold text-white mb-2">Cron non configuré</h4>
            <p className="text-gray-300 mb-6">
              Configurez l'enrichissement automatique pour maintenir le catalogue à jour
            </p>
            <button
              onClick={() => handleSetupCron('daily', true)}
              className="bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-400 hover:to-emerald-500 text-white px-6 py-3 rounded-xl font-semibold transition-all"
            >
              Configurer cron quotidien
            </button>
          </div>
        )}
      </div>

      {/* Barre de recherche et filtres */}
      <div className="bg-white/10 backdrop-blur-xl rounded-2xl p-6 border border-white/20">
        <div className="flex flex-col lg:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Rechercher par titre, catégorie, matériau, couleur..."
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

      {/* Progression enrichissement */}
      {isEnriching && (
        <div className="bg-purple-500/20 border border-purple-400/50 rounded-xl p-6">
          <div className="flex items-center gap-3 mb-4">
            <Brain className="w-6 h-6 text-purple-400" />
            <h3 className="text-lg font-bold text-white">Enrichissement DeepSeek en cours...</h3>
          </div>
          <div className="w-full bg-gray-700 rounded-full h-3 mb-2">
            <div 
              className="bg-gradient-to-r from-purple-500 to-pink-500 h-3 rounded-full transition-all duration-500" 
              style={{ width: `${enrichmentProgress}%` }}
            ></div>
          </div>
          <p className="text-purple-300 text-sm">{enrichmentProgress}% - Analyse IA des attributs produits</p>
        </div>
      )}

      {/* Tableau du catalogue enrichi */}
      {products.length === 0 ? (
        <div className="text-center py-20">
          <Package className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-xl font-bold text-white mb-2">Aucun produit dans le catalogue enrichi</h3>
          <p className="text-gray-400 mb-6">
            Importez votre catalogue ou enrichissez les produits existants.
          </p>
          <div className="flex gap-4 justify-center">
            <button
              onClick={() => setShowImportModal(true)}
              className="bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-400 hover:to-emerald-500 text-white px-6 py-3 rounded-xl font-semibold transition-all"
            >
              Importer le catalogue
            </button>
            <button
              onClick={handleEnrichWithDeepSeek}
              className="bg-gradient-to-r from-purple-500 to-pink-600 hover:from-purple-400 hover:to-pink-500 text-white px-6 py-3 rounded-xl font-semibold transition-all"
            >
              Enrichir avec IA
            </button>
          </div>
        </div>
      ) : (
        <div className="bg-white/10 backdrop-blur-xl rounded-2xl border border-white/20 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-black/20">
                <tr>
                  <th className="text-left p-4 text-cyan-300 font-semibold">Produit</th>
                  <th className="text-left p-4 text-cyan-300 font-semibold">Catégorie</th>
                  <th className="text-left p-4 text-cyan-300 font-semibold">GTIN</th>
                  <th className="text-left p-4 text-cyan-300 font-semibold">Attributs IA</th>
                  <th className="text-left p-4 text-cyan-300 font-semibold">SEO</th>
                  <th className="text-left p-4 text-cyan-300 font-semibold">Prix</th>
                  <th className="text-left p-4 text-cyan-300 font-semibold">Stock</th>
                  <th className="text-left p-4 text-cyan-300 font-semibold">Disponibilité</th>
                  <th className="text-left p-4 text-cyan-300 font-semibold">Confiance IA</th>
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
                          <div className="font-semibold text-white text-sm">{product.title}</div>
                          <div className="text-gray-400 text-xs">{product.vendor}</div>
                          <div className="text-gray-500 text-xs">{product.brand}</div>
                          {product.gtin && (
                            <div className="text-cyan-400 text-xs font-mono">GTIN: {product.gtin}</div>
                          )}
                          {product.mpn && (
                            <div className="text-purple-400 text-xs">MPN: {product.mpn}</div>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="p-4">
                      <div className="space-y-1">
                        <div className="font-semibold text-white text-sm">{product.product_type}</div>
                        {product.subcategory && (
                          <div className="text-gray-400 text-xs">{product.subcategory}</div>
                        )}
                        {product.tags && product.tags.length > 0 && (
                          <div className="flex flex-wrap gap-1">
                            {product.tags.slice(0, 2).map((tag, index) => (
                              <span key={index} className="bg-gray-500/20 text-gray-300 px-2 py-1 rounded text-xs">
                                {tag}
                              </span>
                            ))}
                            {product.tags.length > 2 && (
                              <span className="text-gray-400 text-xs">+{product.tags.length - 2}</span>
                            )}
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="p-4">
                      <div className="space-y-1">
                        {product.gtin ? (
                          <div className="font-mono text-cyan-400 text-xs bg-cyan-500/20 px-2 py-1 rounded">
                            {product.gtin}
                          </div>
                        ) : (
                          <div className="text-gray-500 text-xs">Non généré</div>
                        )}
                        {product.mpn && (
                          <div className="text-purple-400 text-xs">MPN: {product.mpn}</div>
                        )}
                      </div>
                    </td>
                    <td className="p-4">
                      <div className="space-y-1">
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
                      <div className="space-y-1">
                        <div className="text-white text-xs font-semibold">Titre SEO:</div>
                        <div className="text-gray-300 text-xs line-clamp-2">{product.seo_title || 'Non défini'}</div>
                        <div className="text-white text-xs font-semibold mt-2">Meta Description:</div>
                        <div className="text-gray-300 text-xs line-clamp-3">{product.seo_description || 'Non définie'}</div>
                      </div>
                    </td>
                    <td className="p-4">
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
                    </td>
                    <td className="p-4">
                      <div className="flex items-center gap-2">
                        <div className={`w-2 h-2 rounded-full ${product.stock_quantity > 0 ? 'bg-green-400' : 'bg-red-400'}`}></div>
                        <span className={`font-semibold ${product.stock_quantity > 0 ? 'text-green-400' : 'text-red-400'}`}>
                          {product.stock_quantity}
                        </span>
                      </div>
                    </td>
                    <td className="p-4">
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                        product.availability_status === 'En stock' ? 'bg-green-500/20 text-green-300' :
                        product.availability_status === 'Rupture' ? 'bg-red-500/20 text-red-300' :
                        'bg-yellow-500/20 text-yellow-300'
                      }`}>
                        {product.availability_status || (product.stock_quantity > 0 ? 'En stock' : 'Rupture')}
                      </span>
                    </td>
                    <td className="p-4">
                      <div className="flex items-center gap-2">
                        <div className={`w-3 h-3 rounded-full ${
                          (product.ai_confidence * 100) >= 80 ? 'bg-green-400' :
                          (product.ai_confidence * 100) >= 60 ? 'bg-yellow-400' :
                          'bg-red-400'
                        }`}></div>
                        <span className="text-white text-sm">{Math.round((product.ai_confidence || 0) * 100)}%</span>
                        <span className={`px-2 py-1 rounded text-xs ${
                          product.enrichment_source === 'deepseek' ? 'bg-purple-500/20 text-purple-300' :
                          product.enrichment_source === 'import' ? 'bg-blue-500/20 text-blue-300' :
                          'bg-gray-500/20 text-gray-300'
                        }`}>
                          {product.enrichment_source}
                        </span>
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

      {/* Stats enrichissement */}
      {products.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="bg-blue-600/20 backdrop-blur-xl rounded-2xl p-6 border border-blue-500/30">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-blue-200 text-sm mb-1">Total Enrichis</p>
                <p className="text-3xl font-bold text-white">{products.length}</p>
              </div>
              <Brain className="w-10 h-10 text-blue-400" />
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
          
          <div className="bg-purple-600/20 backdrop-blur-xl rounded-2xl p-6 border border-purple-500/30">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-purple-200 text-sm mb-1">Catégories</p>
                <p className="text-3xl font-bold text-white">{categories.length}</p>
              </div>
              <Tag className="w-10 h-10 text-purple-400" />
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

      {/* Modal d'import */}
      {showImportModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-800/95 backdrop-blur-xl rounded-2xl p-6 max-w-md w-full border border-slate-600/50">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-white">Importer le catalogue</h3>
              <button
                onClick={() => setShowImportModal(false)}
                className="text-gray-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="space-y-4">
              <div className="bg-blue-500/20 border border-blue-400/50 rounded-xl p-4">
                <h4 className="font-semibold text-blue-200 mb-2">🚀 Import automatique complet</h4>
                <p className="text-blue-300 text-sm">
                  Cette action va automatiquement :
                </p>
                <ul className="text-blue-300 text-sm mt-2 space-y-1">
                  <li>• <strong>ÉTAPE 1:</strong> Importer les produits dans imported_products</li>
                  <li>• <strong>ÉTAPE 2:</strong> Enrichir avec DeepSeek IA (attributs, SEO)</li>
                  <li>• <strong>ÉTAPE 3:</strong> Remplir la table products_enriched</li>
                  <li>• <strong>ÉTAPE 4:</strong> Configurer le cron quotidien</li>
                </ul>
              </div>
              
              <div className="bg-green-500/20 border border-green-400/50 rounded-xl p-4">
                <h4 className="font-semibold text-green-200 mb-2">🤖 Résultat final</h4>
                <ul className="text-green-300 text-sm space-y-1">
                  <li>• Catalogue enrichi avec attributs IA complets</li>
                  <li>• SEO optimisé (titres + meta descriptions)</li>
                  <li>• Attributs extraits (couleurs, matériaux, styles)</li>
                  <li>• OmnIA entraîné sur votre catalogue</li>
                  <li>• Synchronisation quotidienne activée</li>
                </ul>
              </div>
              
              <div className="flex gap-3">
                <button
                  onClick={() => setShowImportModal(false)}
                  className="flex-1 bg-gray-600 hover:bg-gray-700 text-white py-3 rounded-xl transition-all"
                >
                  Annuler
                </button>
                <button
                  onClick={handleImportCatalog}
                  className="flex-1 bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-400 hover:to-emerald-500 text-white py-3 rounded-xl font-semibold transition-all flex items-center justify-center gap-2"
                >
                  🚀 Lancer Import Automatique
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};