import React, { useState, useEffect } from 'react';
import { 
  Search, Filter, Eye, Edit, Trash2, ExternalLink, 
  Package, Tag, DollarSign, Image, BarChart3, Settings,
  ChevronDown, ChevronUp, X, Save, AlertCircle, CheckCircle,
  Brain, Sparkles, Zap, RefreshCw, Download, Upload, Globe,
  Camera, Loader2
} from 'lucide-react';
import { useNotifications } from './NotificationSystem';

interface EnrichedProduct {
  id: string;
  handle: string;
  title: string;
  description: string;
  short_description: string;
  vendor: string;
  brand: string;
  category: string;
  subcategory: string;
  tags: string[];
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
  availability: string;
  seo_title: string;
  seo_description: string;
  google_category: string;
  pmax_score: number;
  image_url: string;
  image_alt: string;
  gallery_urls: string[];
  intent_tags: string[];
  matching_score: number;
  chat_history_ref: string;
  confidence_score: number;
  enriched_at: string;
  enrichment_source: string;
  created_at: string;
}

interface ProductsEnrichedTableProps {
  vendorId?: string;
}

export const ProductsEnrichedTable: React.FC<ProductsEnrichedTableProps> = ({ vendorId }) => {
  const [products, setProducts] = useState<EnrichedProduct[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<EnrichedProduct[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedColor, setSelectedColor] = useState('all');
  const [selectedMaterial, setSelectedMaterial] = useState('all');
  const [selectedStyle, setSelectedStyle] = useState('all');
  const [showFilters, setShowFilters] = useState(false);
  const [selectedProducts, setSelectedProducts] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isEnriching, setIsEnriching] = useState(false);
  const [isAnalyzingImages, setIsAnalyzingImages] = useState(false);
  const [viewMode, setViewMode] = useState<'table' | 'grid'>('table');
  const [selectedProduct, setSelectedProduct] = useState<EnrichedProduct | null>(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const { showSuccess, showError, showInfo } = useNotifications();

  useEffect(() => {
    loadEnrichedProducts();
  }, [vendorId]);

  useEffect(() => {
    // Filtrer les produits
    let filtered = products;

    if (searchTerm) {
      filtered = filtered.filter(product =>
        product.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.brand.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.seo_title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()))
      );
    }

    if (selectedCategory !== 'all') {
      filtered = filtered.filter(product => product.category === selectedCategory);
    }

    if (selectedColor !== 'all') {
      filtered = filtered.filter(product => product.color === selectedColor);
    }

    if (selectedMaterial !== 'all') {
      filtered = filtered.filter(product => product.material === selectedMaterial);
    }

    if (selectedStyle !== 'all') {
      filtered = filtered.filter(product => product.style === selectedStyle);
    }

    setFilteredProducts(filtered);
  }, [products, searchTerm, selectedCategory, selectedColor, selectedMaterial, selectedStyle]);

  const loadEnrichedProducts = async () => {
    try {
      setIsLoading(true);
      
      // Simuler le chargement depuis la base de données
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Générer des produits enrichis de démonstration avec TOUS les champs
      const mockEnrichedProducts = generateCompleteEnrichedProducts();
      
      console.log('📦 Produits enrichis complets chargés:', mockEnrichedProducts.length);
      setProducts(mockEnrichedProducts);
      setFilteredProducts(mockEnrichedProducts);
      
    } catch (error) {
      console.error('❌ Erreur chargement produits enrichis:', error);
      showError('Erreur de chargement', 'Impossible de charger les produits enrichis.');
    } finally {
      setIsLoading(false);
    }
  };

  const generateCompleteEnrichedProducts = (): EnrichedProduct[] => {
    // Charger les produits du catalogue normal
    const savedProducts = localStorage.getItem('catalog_products');
    let baseProducts = [];
    
    if (savedProducts) {
      try {
        baseProducts = JSON.parse(savedProducts);
      } catch (error) {
        console.error('Erreur parsing produits sauvegardés:', error);
      }
    }
    
    // Produits de base Decora Home avec TOUS les attributs
    const decoraProducts = [
      {
        id: 'decora-fauteuil-turquoise-resine',
        name: 'Fauteuil – Design Moderne et Confort Haut de Gamme en Résine et Acier (Turquoise, Noir, Blanc)',
        description: 'Fauteuil design moderne en résine haute qualité avec pieds en acier. Disponible en turquoise, noir et blanc. Confort optimal pour salon contemporain.',
        price: 299,
        compare_at_price: 399,
        category: 'Fauteuil',
        vendor: 'Decora Home',
        image_url: 'https://images.pexels.com/photos/586763/pexels-photo-586763.jpeg',
        product_url: 'https://decorahome.fr/products/fauteuil-design-moderne-resine-acier',
        stock: 25
      },
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
        stock: 100
      },
      {
        id: 'decora-table-aurea-100',
        name: 'Table AUREA Ø100cm - Travertin',
        description: 'Table ronde en travertin naturel avec pieds métal noir',
        price: 499,
        compare_at_price: 859,
        category: 'Table',
        vendor: 'Decora Home',
        image_url: 'https://cdn.shopify.com/s/files/1/0903/7578/2665/files/3_e80b9a50-b032-4267-8f5b-f9130153e3be.png?v=1754406484',
        product_url: 'https://decorahome.fr/products/table-a-manger-ronde-plateau-en-travertin-naturel-100-120-cm',
        stock: 50
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
        stock: 96
      }
    ];
    
    // Combiner produits de base + produits importés
    const allProducts = [...decoraProducts, ...baseProducts];
    
    // Enrichir automatiquement chaque produit avec TOUS les champs
    return allProducts.map(product => enrichProductComplete(product));
  };

  const enrichProductComplete = (product: any): EnrichedProduct => {
    const text = `${product.name || product.title || ''} ${product.description || ''} ${product.category || ''}`.toLowerCase();
    
    // Enrichissement complet avec TOUS les champs
    const enriched: EnrichedProduct = {
      id: product.id || `enriched-${Date.now()}-${Math.random()}`,
      handle: product.handle || product.id || `handle-${Date.now()}`,
      title: product.name || product.title || 'Produit sans nom',
      description: product.description || '',
      short_description: (product.description || product.name || '').substring(0, 200),
      vendor: product.vendor || 'Decora Home',
      brand: product.vendor || 'Decora Home',
      category: detectCategory(text),
      subcategory: detectSubcategory(text),
      tags: generateTags(text),
      material: detectMaterial(text),
      color: detectColor(text),
      style: detectStyle(text),
      room: detectRoom(text),
      dimensions: detectDimensions(text),
      weight: detectWeight(text),
      capacity: detectCapacity(text),
      price: product.price || 0,
      compare_at_price: product.compare_at_price,
      currency: 'EUR',
      stock_quantity: product.stock || product.quantityAvailable || 0,
      availability: (product.stock || product.quantityAvailable || 0) > 0 ? 'Disponible' : 'Rupture de stock',
      seo_title: generateSEOTitle(product.name || product.title, detectColor(text), detectMaterial(text)),
      seo_description: generateSEODescription(product.name || product.title, detectStyle(text), detectMaterial(text)),
      google_category: getGoogleCategory(detectCategory(text)),
      pmax_score: calculatePmaxScore(product.price, product.compare_at_price, detectColor(text), detectMaterial(text)),
      image_url: product.image_url || 'https://images.pexels.com/photos/1350789/pexels-photo-1350789.jpeg',
      image_alt: product.name || product.title || '',
      gallery_urls: product.gallery_urls || [],
      intent_tags: generateIntentTags(text),
      matching_score: calculateMatchingScore(detectColor(text), detectMaterial(text), detectStyle(text)),
      chat_history_ref: '',
      confidence_score: calculateConfidence(text),
      enriched_at: new Date().toISOString(),
      enrichment_source: 'auto',
      created_at: product.created_at || new Date().toISOString()
    };
    
    return enriched;
  };

  // Fonctions de détection améliorées
  const detectCategory = (text: string): string => {
    if (text.includes('fauteuil') || text.includes('armchair')) return 'Fauteuil';
    if (text.includes('canapé') || text.includes('sofa')) return 'Canapé';
    if (text.includes('table')) return 'Table';
    if (text.includes('chaise') || text.includes('chair')) return 'Chaise';
    if (text.includes('lit') || text.includes('bed')) return 'Lit';
    if (text.includes('armoire') || text.includes('commode')) return 'Rangement';
    if (text.includes('meuble tv')) return 'Meuble TV';
    return 'Mobilier';
  };

  const detectSubcategory = (text: string): string => {
    if (text.includes('fauteuil') && text.includes('design')) return 'Fauteuil design moderne';
    if (text.includes('angle')) return 'Canapé d\'angle';
    if (text.includes('convertible')) return 'Canapé convertible';
    if (text.includes('basse')) return 'Table basse';
    if (text.includes('manger')) return 'Table à manger';
    if (text.includes('bureau')) return 'Chaise de bureau';
    return '';
  };

  const detectColor = (text: string): string => {
    // Ordre de priorité pour les couleurs multiples
    if (text.includes('turquoise')) return 'turquoise';
    if (text.includes('blanc') || text.includes('white')) return 'blanc';
    if (text.includes('noir') || text.includes('black')) return 'noir';
    if (text.includes('gris') || text.includes('grey')) return 'gris';
    if (text.includes('beige')) return 'beige';
    if (text.includes('marron') || text.includes('brown')) return 'marron';
    if (text.includes('bleu') || text.includes('blue')) return 'bleu';
    if (text.includes('vert') || text.includes('green')) return 'vert';
    if (text.includes('rouge') || text.includes('red')) return 'rouge';
    if (text.includes('jaune') || text.includes('yellow')) return 'jaune';
    if (text.includes('orange')) return 'orange';
    if (text.includes('rose') || text.includes('pink')) return 'rose';
    if (text.includes('violet') || text.includes('purple')) return 'violet';
    if (text.includes('naturel') || text.includes('natural')) return 'naturel';
    if (text.includes('chêne') || text.includes('oak')) return 'chêne';
    if (text.includes('noyer') || text.includes('walnut')) return 'noyer';
    if (text.includes('taupe')) return 'taupe';
    return '';
  };

  const detectMaterial = (text: string): string => {
    // Matériaux spécifiques en premier
    if (text.includes('résine') || text.includes('resin')) return 'résine';
    if (text.includes('acier') || text.includes('steel')) return 'acier';
    if (text.includes('travertin') || text.includes('travertine')) return 'travertin';
    if (text.includes('marbre') || text.includes('marble')) return 'marbre';
    if (text.includes('velours côtelé')) return 'velours côtelé';
    if (text.includes('velours') || text.includes('velvet')) return 'velours';
    if (text.includes('chenille')) return 'chenille';
    if (text.includes('chêne massif')) return 'chêne massif';
    if (text.includes('chêne') || text.includes('oak')) return 'chêne';
    if (text.includes('bois massif')) return 'bois massif';
    if (text.includes('bois') || text.includes('wood')) return 'bois';
    if (text.includes('métal') || text.includes('metal')) return 'métal';
    if (text.includes('verre') || text.includes('glass')) return 'verre';
    if (text.includes('tissu') || text.includes('fabric')) return 'tissu';
    if (text.includes('cuir') || text.includes('leather')) return 'cuir';
    if (text.includes('plastique') || text.includes('plastic')) return 'plastique';
    if (text.includes('rotin') || text.includes('rattan')) return 'rotin';
    return '';
  };

  const detectStyle = (text: string): string => {
    if (text.includes('moderne') || text.includes('modern')) return 'moderne';
    if (text.includes('contemporain') || text.includes('contemporary')) return 'contemporain';
    if (text.includes('scandinave') || text.includes('scandinavian')) return 'scandinave';
    if (text.includes('industriel') || text.includes('industrial')) return 'industriel';
    if (text.includes('vintage')) return 'vintage';
    if (text.includes('rustique') || text.includes('rustic')) return 'rustique';
    if (text.includes('classique') || text.includes('classic')) return 'classique';
    if (text.includes('minimaliste') || text.includes('minimalist')) return 'minimaliste';
    if (text.includes('bohème') || text.includes('boho')) return 'bohème';
    return '';
  };

  const detectRoom = (text: string): string => {
    if (text.includes('salon') || text.includes('living')) return 'salon';
    if (text.includes('chambre') || text.includes('bedroom')) return 'chambre';
    if (text.includes('cuisine') || text.includes('kitchen')) return 'cuisine';
    if (text.includes('bureau') || text.includes('office')) return 'bureau';
    if (text.includes('salle à manger') || text.includes('dining')) return 'salle à manger';
    if (text.includes('entrée') || text.includes('entrance')) return 'entrée';
    if (text.includes('terrasse') || text.includes('terrace')) return 'terrasse';
    return '';
  };

  const detectDimensions = (text: string): string => {
    const match = text.match(/(\d+)\s*[x×]\s*(\d+)(?:\s*[x×]\s*(\d+))?\s*cm/);
    if (match) return match[0];
    
    const diameterMatch = text.match(/ø\s*(\d+)\s*cm/);
    if (diameterMatch) return diameterMatch[0];
    
    return '';
  };

  const detectWeight = (text: string): string => {
    const match = text.match(/(\d+(?:\.\d+)?)\s*kg/);
    return match ? match[0] : '';
  };

  const detectCapacity = (text: string): string => {
    const match = text.match(/(\d+)\s*places?/);
    if (match) return match[0];
    
    const personMatch = text.match(/(\d+)\s*personnes?/);
    return personMatch ? personMatch[0] : '';
  };

  const generateTags = (text: string): string[] => {
    const tags = [];
    
    // Couleurs
    if (text.includes('turquoise')) tags.push('turquoise');
    if (text.includes('blanc')) tags.push('blanc');
    if (text.includes('noir')) tags.push('noir');
    
    // Matériaux
    if (text.includes('résine')) tags.push('résine');
    if (text.includes('acier')) tags.push('acier');
    if (text.includes('velours')) tags.push('velours');
    if (text.includes('travertin')) tags.push('travertin');
    if (text.includes('chenille')) tags.push('chenille');
    
    // Fonctionnalités
    if (text.includes('convertible')) tags.push('convertible');
    if (text.includes('rangement')) tags.push('rangement');
    if (text.includes('angle')) tags.push('angle');
    if (text.includes('moderne')) tags.push('moderne');
    if (text.includes('design')) tags.push('design');
    if (text.includes('confort')) tags.push('confort');
    if (text.includes('haut de gamme')) tags.push('haut de gamme');
    
    return tags;
  };

  const generateIntentTags = (text: string): string[] => {
    const intentTags = [];
    
    // Tags d'intention pour l'IA
    if (text.includes('salon')) intentTags.push('salon');
    if (text.includes('moderne')) intentTags.push('style_moderne');
    if (text.includes('confort')) intentTags.push('recherche_confort');
    if (text.includes('design')) intentTags.push('design_contemporain');
    if (text.includes('haut de gamme')) intentTags.push('premium');
    
    return intentTags;
  };

  const generateSEOTitle = (name: string, color: string, material: string): string => {
    let title = name;
    if (color) title += ` ${color}`;
    if (material) title += ` ${material}`;
    title += ' - Decora Home';
    return title.substring(0, 70);
  };

  const generateSEODescription = (name: string, style: string, material: string): string => {
    let desc = `${name}`;
    if (material) desc += ` en ${material}`;
    if (style) desc += ` de style ${style}`;
    desc += '. Livraison gratuite. Garantie qualité Decora Home.';
    return desc.substring(0, 155);
  };

  const getGoogleCategory = (category: string): string => {
    const categoryMap: { [key: string]: string } = {
      'Fauteuil': 'Furniture > Living Room Furniture > Chairs',
      'Canapé': 'Furniture > Living Room Furniture > Sofas',
      'Table': 'Furniture > Tables',
      'Chaise': 'Furniture > Chairs',
      'Lit': 'Furniture > Bedroom Furniture > Beds',
      'Rangement': 'Furniture > Storage Furniture',
      'Meuble TV': 'Furniture > Entertainment Centers',
      'Décoration': 'Home & Garden > Decor'
    };
    return categoryMap[category] || 'Furniture';
  };

  const calculatePmaxScore = (price: number, comparePrice?: number, color?: string, material?: string): number => {
    let score = 50; // Base
    
    // Bonus promo
    if (comparePrice && comparePrice > price) {
      const discount = ((comparePrice - price) / comparePrice) * 100;
      score += Math.min(discount, 30);
    }
    
    // Bonus attributs
    if (color) score += 10;
    if (material) score += 10;
    
    return Math.min(score, 100);
  };

  const calculateMatchingScore = (color: string, material: string, style: string): number => {
    let score = 0;
    if (color) score += 30;
    if (material) score += 30;
    if (style) score += 25;
    return Math.min(score, 100);
  };

  const calculateConfidence = (text: string): number => {
    let confidence = 30; // Base
    if (detectColor(text)) confidence += 20;
    if (detectMaterial(text)) confidence += 25;
    if (detectStyle(text)) confidence += 15;
    if (detectRoom(text)) confidence += 10;
    return Math.min(confidence, 100);
  };

  const calculateDiscount = (price: number, compareAtPrice?: number): number => {
    if (!compareAtPrice || compareAtPrice <= price) return 0;
    return Math.round(((compareAtPrice - price) / compareAtPrice) * 100);
  };

  const handleAnalyzeWithVision = async () => {
    setIsAnalyzingImages(true);
    showInfo('Analyse Vision IA', 'Analyse des images avec OpenAI Vision pour extraction précise des attributs...');
    
    try {
      // Analyser chaque produit avec Vision AI
      for (const product of products.slice(0, 5)) { // Limiter à 5 pour éviter les timeouts
        if (product.image_url) {
          try {
            const response = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/vision-attribute-extractor`, {
              method: 'POST',
              headers: {
                'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({
                image_url: product.image_url,
                product_title: product.title,
                product_description: product.description
              }),
            });

            if (response.ok) {
              const result = await response.json();
              console.log('✅ Vision AI pour', product.title.substring(0, 30), ':', result.attributes);
            }
          } catch (error) {
            console.error('❌ Erreur Vision AI pour', product.title, ':', error);
          }
        }
      }
      
      showSuccess(
        'Analyse Vision terminée',
        'Les attributs ont été extraits avec précision grâce à l\'analyse d\'image !',
        [
          {
            label: 'Actualiser',
            action: () => loadEnrichedProducts(),
            variant: 'primary'
          }
        ]
      );
      
    } catch (error) {
      showError('Erreur Vision AI', 'Impossible d\'analyser les images avec Vision AI.');
    } finally {
      setIsAnalyzingImages(false);
    }
  };

  const handleExportGoogleMerchant = async (format: 'xml' | 'csv') => {
    try {
      showInfo('Export en cours', `Génération du flux Google Merchant au format ${format.toUpperCase()}...`);
      
      const response = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/google-merchant-feed?format=${format}&retailer_id=demo-retailer-id`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
        },
      });

      if (response.ok) {
        const blob = await response.blob();
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `google-merchant-feed.${format}`;
        a.click();
        URL.revokeObjectURL(url);
        
        showSuccess('Export réussi', `Flux Google Merchant ${format.toUpperCase()} téléchargé !`);
      } else {
        throw new Error('Erreur génération flux');
      }
    } catch (error) {
      showError('Erreur export', 'Impossible de générer le flux Google Merchant.');
    }
  };

  const handleSyncFromCatalog = async () => {
    showInfo('Synchronisation', 'Synchronisation du catalogue vers les produits enrichis...');
    
    try {
      // Forcer la synchronisation via Supabase
      const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
      const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
      
      if (supabaseUrl && supabaseKey) {
        console.log('🔄 Déclenchement synchronisation forcée...');
        
        const syncResponse = await fetch(`${supabaseUrl}/functions/v1/enrich-products-cron`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${supabaseKey}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            retailer_id: 'demo-retailer-id',
            force_full_enrichment: true,
            source_filter: null
          }),
        });
        
        if (syncResponse.ok) {
          const syncResult = await syncResponse.json();
          console.log('✅ Synchronisation forcée réussie:', syncResult);
          
          showSuccess(
            'Synchronisation réussie', 
            `${syncResult.enriched_products || 0} produits synchronisés vers le catalogue enrichi !`,
            [
              {
                label: 'Actualiser',
                action: () => loadEnrichedProducts(),
                variant: 'primary'
              }
            ]
          );
          
          // Recharger les données
          await loadEnrichedProducts();
          return;
        }
      }
      
      // Fallback local si Supabase échoue
      const savedProducts = localStorage.getItem('catalog_products');
      if (savedProducts) {
        const catalogProducts = JSON.parse(savedProducts);
        const newEnrichedProducts = catalogProducts.map((product: any) => enrichProductComplete(product));
        setProducts(newEnrichedProducts);
        showSuccess('Synchronisation locale', `${newEnrichedProducts.length} produits enrichis localement !`);
      } else {
        showError('Catalogue vide', 'Aucun produit trouvé dans le catalogue principal.');
      }
    } catch (error) {
      console.error('❌ Erreur synchronisation:', error);
      showError('Erreur de synchronisation', 'Impossible de synchroniser le catalogue.');
    }
  };

  const categories = [...new Set(products.map(p => p.category))];
  const colors = [...new Set(products.map(p => p.color).filter(Boolean))];
  const materials = [...new Set(products.map(p => p.material).filter(Boolean))];
  const styles = [...new Set(products.map(p => p.style).filter(Boolean))];

  const getConfidenceColor = (score: number) => {
    if (score >= 80) return 'bg-green-500/20 text-green-300';
    if (score >= 60) return 'bg-yellow-500/20 text-yellow-300';
    return 'bg-red-500/20 text-red-300';
  };

  const getEnrichmentSourceColor = (source: string) => {
    switch (source) {
      case 'vision_ai': return 'bg-purple-500/20 text-purple-300';
      case 'ai': return 'bg-blue-500/20 text-blue-300';
      case 'auto': return 'bg-cyan-500/20 text-cyan-300';
      case 'manual': return 'bg-orange-500/20 text-orange-300';
      default: return 'bg-gray-500/20 text-gray-300';
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="text-center">
          <Brain className="w-16 h-16 text-purple-400 animate-pulse mx-auto mb-4" />
          <p className="text-white text-lg">Chargement du catalogue enrichi...</p>
          <p className="text-gray-400 text-sm">Analyse IA des attributs produits</p>
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
            <Brain className="w-6 h-6 text-purple-400" />
            Catalogue Enrichi IA Complet
          </h2>
          <p className="text-gray-300">{filteredProducts.length} produit(s) enrichi(s) sur {products.length}</p>
        </div>
        
        <div className="flex flex-wrap gap-3">
          <button
            onClick={handleSyncFromCatalog}
            className="bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white px-4 py-2 rounded-xl flex items-center gap-2 font-semibold transition-all"
          >
            <RefreshCw className="w-4 h-4" />
            Sync depuis catalogue
          </button>
          
          <button
            onClick={handleAnalyzeWithVision}
            disabled={isAnalyzingImages}
            className="bg-gradient-to-r from-purple-500 to-pink-600 hover:from-purple-400 hover:to-pink-500 disabled:from-gray-600 disabled:to-gray-700 text-white px-4 py-2 rounded-xl flex items-center gap-2 font-semibold transition-all disabled:cursor-not-allowed"
          >
            {isAnalyzingImages ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Analyse Vision...
              </>
            ) : (
              <>
                <Camera className="w-4 h-4" />
                Analyser avec Vision AI
              </>
            )}
          </button>
          
          <button
            onClick={() => handleExportGoogleMerchant('xml')}
            className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-xl flex items-center gap-2 transition-all"
          >
            <Globe className="w-4 h-4" />
            Export XML Google
          </button>
          
          <button
            onClick={() => handleExportGoogleMerchant('csv')}
            className="bg-orange-600 hover:bg-orange-700 text-white px-4 py-2 rounded-xl flex items-center gap-2 transition-all"
          >
            <Download className="w-4 h-4" />
            Export CSV Google
          </button>
          
          <button
            onClick={() => setViewMode(viewMode === 'table' ? 'grid' : 'table')}
            className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-xl flex items-center gap-2 transition-all"
          >
            <BarChart3 className="w-4 h-4" />
            {viewMode === 'table' ? 'Vue grille' : 'Vue tableau'}
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
              placeholder="Rechercher par nom, catégorie, tags, SEO..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-3 bg-black/40 border border-gray-600 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:border-purple-400 focus:ring-2 focus:ring-purple-400/30"
            />
          </div>
          
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-3 rounded-xl flex items-center gap-2 transition-all"
          >
            <Filter className="w-4 h-4" />
            Filtres IA
            {showFilters ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </button>
        </div>

        {showFilters && (
          <div className="mt-6 pt-6 border-t border-gray-600/50">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
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
                <label className="block text-sm text-gray-300 mb-2">Couleur</label>
                <select
                  value={selectedColor}
                  onChange={(e) => setSelectedColor(e.target.value)}
                  className="w-full bg-black/40 border border-gray-600 rounded-xl px-3 py-2 text-white"
                >
                  <option value="all">Toutes les couleurs</option>
                  {colors.map(color => (
                    <option key={color} value={color}>{color}</option>
                  ))}
                </select>
              </div>
              
              <div>
                <label className="block text-sm text-gray-300 mb-2">Matériau</label>
                <select
                  value={selectedMaterial}
                  onChange={(e) => setSelectedMaterial(e.target.value)}
                  className="w-full bg-black/40 border border-gray-600 rounded-xl px-3 py-2 text-white"
                >
                  <option value="all">Tous les matériaux</option>
                  {materials.map(material => (
                    <option key={material} value={material}>{material}</option>
                  ))}
                </select>
              </div>
              
              <div>
                <label className="block text-sm text-gray-300 mb-2">Style</label>
                <select
                  value={selectedStyle}
                  onChange={(e) => setSelectedStyle(e.target.value)}
                  className="w-full bg-black/40 border border-gray-600 rounded-xl px-3 py-2 text-white"
                >
                  <option value="all">Tous les styles</option>
                  {styles.map(style => (
                    <option key={style} value={style}>{style}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Tableau complet des produits enrichis */}
      <div className="bg-white/10 backdrop-blur-xl rounded-2xl border border-white/20 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-black/20">
              <tr>
                <th className="text-left p-4 text-purple-300 font-semibold">Produit</th>
                <th className="text-left p-4 text-purple-300 font-semibold">Prix</th>
                <th className="text-left p-4 text-purple-300 font-semibold">Attributs IA</th>
                <th className="text-left p-4 text-purple-300 font-semibold">SEO</th>
                <th className="text-left p-4 text-purple-300 font-semibold">Google</th>
                <th className="text-left p-4 text-purple-300 font-semibold">Scores</th>
                <th className="text-left p-4 text-purple-300 font-semibold">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredProducts.map((product) => (
                <tr key={product.id} className="border-b border-white/10 hover:bg-white/5">
                  <td className="p-4">
                    <div className="flex items-center gap-3">
                      <div className="w-16 h-16 rounded-lg overflow-hidden bg-gray-600 flex-shrink-0">
                        <img 
                          src={product.image_url} 
                          alt={product.image_alt}
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            const target = e.target as HTMLImageElement;
                            target.src = 'https://images.pexels.com/photos/1350789/pexels-photo-1350789.jpeg';
                          }}
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="font-semibold text-white text-sm mb-1">{product.title}</div>
                        <div className="text-gray-400 text-xs mb-1">{product.brand} • {product.vendor}</div>
                        <div className="text-gray-500 text-xs line-clamp-2">{product.short_description}</div>
                        <div className="text-cyan-400 text-xs">ID: {product.handle}</div>
                      </div>
                    </div>
                  </td>
                  <td className="p-4">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-green-400">{product.price}€</span>
                        {product.compare_at_price && product.compare_at_price > product.price && (
                          <>
                            <span className="text-gray-400 line-through text-sm">{product.compare_at_price}€</span>
                            <span className="bg-red-500/20 text-red-300 px-2 py-1 rounded-full text-xs">
                              -{calculateDiscount(product.price, product.compare_at_price)}%
                            </span>
                          </>
                        )}
                      </div>
                      <div className="text-xs text-gray-400">
                        Stock: {product.stock_quantity} • {product.availability}
                      </div>
                    </div>
                  </td>
                  <td className="p-4">
                    <div className="space-y-2">
                      <div className="flex flex-wrap gap-1">
                        {product.category && (
                          <span className="bg-blue-500/20 text-blue-300 px-2 py-1 rounded text-xs">
                            📦 {product.category}
                          </span>
                        )}
                        {product.subcategory && (
                          <span className="bg-indigo-500/20 text-indigo-300 px-2 py-1 rounded text-xs">
                            {product.subcategory}
                          </span>
                        )}
                      </div>
                      <div className="flex flex-wrap gap-1">
                        {product.color && (
                          <span className="bg-pink-500/20 text-pink-300 px-2 py-1 rounded text-xs">
                            🎨 {product.color}
                          </span>
                        )}
                        {product.material && (
                          <span className="bg-green-500/20 text-green-300 px-2 py-1 rounded text-xs">
                            🏗️ {product.material}
                          </span>
                        )}
                        {product.style && (
                          <span className="bg-purple-500/20 text-purple-300 px-2 py-1 rounded text-xs">
                            ✨ {product.style}
                          </span>
                        )}
                      </div>
                      {product.room && (
                        <div className="text-gray-400 text-xs">📍 {product.room}</div>
                      )}
                      {product.dimensions && (
                        <div className="text-gray-400 text-xs">📏 {product.dimensions}</div>
                      )}
                      {product.weight && (
                        <div className="text-gray-400 text-xs">⚖️ {product.weight}</div>
                      )}
                      {product.capacity && (
                        <div className="text-gray-400 text-xs">👥 {product.capacity}</div>
                      )}
                    </div>
                  </td>
                  <td className="p-4">
                    <div className="space-y-1">
                      <div className="text-white text-xs font-medium line-clamp-1">{product.seo_title}</div>
                      <div className="text-gray-400 text-xs line-clamp-2">{product.seo_description}</div>
                    </div>
                  </td>
                  <td className="p-4">
                    <div className="space-y-1">
                      <div className="text-cyan-400 text-xs">{product.google_category}</div>
                      <div className="text-gray-400 text-xs">PMax: {product.pmax_score}%</div>
                    </div>
                  </td>
                  <td className="p-4">
                    <div className="text-center space-y-1">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getConfidenceColor(product.confidence_score)}`}>
                        {product.confidence_score}%
                      </span>
                      <div className="text-xs text-gray-400">Match: {product.matching_score}%</div>
                      <div className={`text-xs px-2 py-1 rounded ${getEnrichmentSourceColor(product.enrichment_source)}`}>
                        {product.enrichment_source}
                      </div>
                    </div>
                  </td>
                  <td className="p-4">
                    <div className="flex gap-2">
                      <button
                        onClick={() => {
                          setSelectedProduct(product);
                          setShowDetailModal(true);
                        }}
                        className="text-blue-400 hover:text-blue-300 p-1"
                        title="Voir détails complets"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                      <a
                        href={product.image_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-purple-400 hover:text-purple-300 p-1"
                        title="Voir image"
                      >
                        <Image className="w-4 h-4" />
                      </a>
                      <a
                        href={`https://decorahome.fr/products/${product.handle}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-green-400 hover:text-green-300 p-1"
                        title="Voir sur Shopify"
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

      {/* Modal détails produit */}
      {showDetailModal && selectedProduct && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-800/95 backdrop-blur-xl rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto border border-slate-600/50">
            <div className="flex items-center justify-between p-6 border-b border-slate-600/50">
              <h2 className="text-2xl font-bold text-white">Détails complets du produit</h2>
              <button
                onClick={() => setShowDetailModal(false)}
                className="text-gray-400 hover:text-white transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="p-6 space-y-6">
              {/* Informations de base */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div>
                  <img 
                    src={selectedProduct.image_url} 
                    alt={selectedProduct.image_alt}
                    className="w-full h-64 object-cover rounded-xl"
                  />
                </div>
                <div className="space-y-4">
                  <div>
                    <h3 className="text-xl font-bold text-white mb-2">{selectedProduct.title}</h3>
                    <p className="text-gray-300">{selectedProduct.description}</p>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-gray-400">Prix :</span>
                      <span className="text-green-400 font-bold ml-2">{selectedProduct.price}€</span>
                    </div>
                    {selectedProduct.compare_at_price && (
                      <div>
                        <span className="text-gray-400">Prix barré :</span>
                        <span className="text-gray-400 line-through ml-2">{selectedProduct.compare_at_price}€</span>
                      </div>
                    )}
                    <div>
                      <span className="text-gray-400">Stock :</span>
                      <span className="text-white ml-2">{selectedProduct.stock_quantity}</span>
                    </div>
                    <div>
                      <span className="text-gray-400">Disponibilité :</span>
                      <span className="text-white ml-2">{selectedProduct.availability}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Attributs détaillés */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <div className="bg-black/20 rounded-xl p-4">
                  <h4 className="font-semibold text-cyan-300 mb-3">🏷️ Classification</h4>
                  <div className="space-y-2 text-sm">
                    <div><span className="text-gray-400">Catégorie :</span> <span className="text-white">{selectedProduct.category}</span></div>
                    <div><span className="text-gray-400">Sous-catégorie :</span> <span className="text-white">{selectedProduct.subcategory}</span></div>
                    <div><span className="text-gray-400">Marque :</span> <span className="text-white">{selectedProduct.brand}</span></div>
                    <div><span className="text-gray-400">Vendeur :</span> <span className="text-white">{selectedProduct.vendor}</span></div>
                  </div>
                </div>

                <div className="bg-black/20 rounded-xl p-4">
                  <h4 className="font-semibold text-green-300 mb-3">🎨 Attributs physiques</h4>
                  <div className="space-y-2 text-sm">
                    <div><span className="text-gray-400">Couleur :</span> <span className="text-white">{selectedProduct.color || 'Non spécifié'}</span></div>
                    <div><span className="text-gray-400">Matériau :</span> <span className="text-white">{selectedProduct.material || 'Non spécifié'}</span></div>
                    <div><span className="text-gray-400">Style :</span> <span className="text-white">{selectedProduct.style || 'Non spécifié'}</span></div>
                    <div><span className="text-gray-400">Pièce :</span> <span className="text-white">{selectedProduct.room || 'Non spécifié'}</span></div>
                    <div><span className="text-gray-400">Dimensions :</span> <span className="text-white">{selectedProduct.dimensions || 'Non spécifié'}</span></div>
                    <div><span className="text-gray-400">Poids :</span> <span className="text-white">{selectedProduct.weight || 'Non spécifié'}</span></div>
                    <div><span className="text-gray-400">Capacité :</span> <span className="text-white">{selectedProduct.capacity || 'Non spécifié'}</span></div>
                  </div>
                </div>

                <div className="bg-black/20 rounded-xl p-4">
                  <h4 className="font-semibold text-purple-300 mb-3">📈 SEO & Marketing</h4>
                  <div className="space-y-2 text-sm">
                    <div><span className="text-gray-400">Titre SEO :</span> <span className="text-white text-xs">{selectedProduct.seo_title}</span></div>
                    <div><span className="text-gray-400">Description SEO :</span> <span className="text-white text-xs">{selectedProduct.seo_description}</span></div>
                    <div><span className="text-gray-400">Catégorie Google :</span> <span className="text-white text-xs">{selectedProduct.google_category}</span></div>
                    <div><span className="text-gray-400">Score PMax :</span> <span className="text-white">{selectedProduct.pmax_score}%</span></div>
                  </div>
                </div>
              </div>

              {/* Tags et scores */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-black/20 rounded-xl p-4">
                  <h4 className="font-semibold text-orange-300 mb-3">🏷️ Tags</h4>
                  <div className="space-y-3">
                    <div>
                      <span className="text-gray-400 text-sm">Tags produit :</span>
                      <div className="flex flex-wrap gap-1 mt-1">
                        {selectedProduct.tags.map((tag, index) => (
                          <span key={index} className="bg-blue-500/20 text-blue-300 px-2 py-1 rounded text-xs">
                            {tag}
                          </span>
                        ))}
                      </div>
                    </div>
                    <div>
                      <span className="text-gray-400 text-sm">Tags d'intention :</span>
                      <div className="flex flex-wrap gap-1 mt-1">
                        {selectedProduct.intent_tags.map((tag, index) => (
                          <span key={index} className="bg-purple-500/20 text-purple-300 px-2 py-1 rounded text-xs">
                            {tag}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="bg-black/20 rounded-xl p-4">
                  <h4 className="font-semibold text-yellow-300 mb-3">📊 Scores IA</h4>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-gray-400 text-sm">Confiance :</span>
                      <span className={`px-2 py-1 rounded text-xs ${getConfidenceColor(selectedProduct.confidence_score)}`}>
                        {selectedProduct.confidence_score}%
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-400 text-sm">Matching :</span>
                      <span className="text-white">{selectedProduct.matching_score}%</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-400 text-sm">Source :</span>
                      <span className={`px-2 py-1 rounded text-xs ${getEnrichmentSourceColor(selectedProduct.enrichment_source)}`}>
                        {selectedProduct.enrichment_source}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-400 text-sm">Enrichi le :</span>
                      <span className="text-white text-xs">
                        {new Date(selectedProduct.enriched_at).toLocaleDateString('fr-FR')}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="flex justify-between items-center pt-6 border-t border-slate-600/50">
                <div className="flex gap-3">
                  <a
                    href={`https://decorahome.fr/products/${selectedProduct.handle}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-xl flex items-center gap-2 transition-all"
                  >
                    <ExternalLink className="w-4 h-4" />
                    Voir sur Shopify
                  </a>
                  
                  <button
                    onClick={() => handleAnalyzeWithVision()}
                    className="bg-purple-600 hover:bg-purple-700 text-white px-6 py-3 rounded-xl flex items-center gap-2 transition-all"
                  >
                    <Camera className="w-4 h-4" />
                    Analyser avec Vision AI
                  </button>
                </div>
                
                <button
                  onClick={() => setShowDetailModal(false)}
                  className="bg-gray-600 hover:bg-gray-700 text-white px-6 py-3 rounded-xl transition-all"
                >
                  Fermer
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Message si aucun produit */}
      {filteredProducts.length === 0 && (
        <div className="text-center py-20">
          <Brain className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-xl font-bold text-white mb-2">Aucun produit enrichi trouvé</h3>
          <p className="text-gray-400 mb-6">
            {searchTerm || selectedCategory !== 'all' || selectedColor !== 'all' || selectedMaterial !== 'all' || selectedStyle !== 'all'
              ? 'Aucun produit ne correspond à vos critères de recherche.'
              : 'Votre catalogue enrichi est vide. Synchronisez depuis votre catalogue principal.'}
          </p>
          <div className="flex gap-4 justify-center">
            <button
              onClick={handleSyncFromCatalog}
              className="bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white px-6 py-3 rounded-xl font-semibold transition-all"
            >
              Synchroniser le catalogue
            </button>
            <button
              onClick={handleAnalyzeWithVision}
              className="bg-gradient-to-r from-purple-500 to-pink-600 hover:from-purple-400 hover:to-pink-500 text-white px-6 py-3 rounded-xl font-semibold transition-all"
            >
              Analyser avec Vision AI
            </button>
          </div>
        </div>
      )}

      {/* Statistiques d'enrichissement */}
      <div className="bg-gradient-to-r from-purple-500/20 to-pink-600/20 backdrop-blur-xl rounded-2xl p-6 border border-purple-400/30">
        <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
          <BarChart3 className="w-5 h-5 text-purple-400" />
          Statistiques d'enrichissement IA complet
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
          <div className="text-center">
            <div className="text-2xl font-bold text-purple-400">{products.length}</div>
            <div className="text-purple-300 text-sm">Produits enrichis</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-green-400">
              {Math.round(products.reduce((sum, p) => sum + p.confidence_score, 0) / products.length) || 0}%
            </div>
            <div className="text-green-300 text-sm">Confiance moyenne</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-cyan-400">{categories.length}</div>
            <div className="text-cyan-300 text-sm">Catégories</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-orange-400">{colors.length + materials.length}</div>
            <div className="text-orange-300 text-sm">Attributs extraits</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-pink-400">
              {Math.round(products.reduce((sum, p) => sum + p.pmax_score, 0) / products.length) || 0}%
            </div>
            <div className="text-pink-300 text-sm">Score PMax moyen</div>
          </div>
        </div>
      </div>
    </div>
  );
};