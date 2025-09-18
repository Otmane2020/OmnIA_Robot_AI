import React, { useState, useEffect } from 'react';
import { 
  Search, Filter, Plus, Eye, Edit, Trash2, Save, X,
  Brain, Palette, Hammer, Home, Ruler, Tag, DollarSign,
  ChevronDown, ChevronUp, CheckCircle, AlertCircle
} from 'lucide-react';
import { useNotifications } from './NotificationSystem';

interface EnrichedProduct {
  id: string;
  sku: string;
  gtin: string;
  handle: string;
  title: string;
  description: string;
  short_description: string;
  category: string;
  subcategory: string;
  color: string;
  material: string;
  fabric: string;
  style: string;
  dimensions: string;
  weight: string;
  capacity: string;
  room: string;
  price: number;
  compare_at_price?: number;
  currency: string;
  stock_quantity: number;
  availability: string;
  stock_qty: number;
  image_url: string;
  image_alt: string;
  gallery_urls: string[];
  product_url: string;
  tags: string[];
  seo_title: string;
  seo_description: string;
  google_category: string;
  pmax_score: number;
  ad_headline: string;
  ad_description: string;
  google_product_category: string;
  brand: string;
  intent_tags: any;
  matching_score: number;
  chat_history_ref: string;
  confidence_score: number;
  enriched_at: string;
  enrichment_source: string;
  created_at: string;
}

export const ProductsEnrichedTable: React.FC = () => {
  const [products, setProducts] = useState<EnrichedProduct[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<EnrichedProduct[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedMaterial, setSelectedMaterial] = useState('all');
  const [selectedColor, setSelectedColor] = useState('all');
  const [selectedRoom, setSelectedRoom] = useState('all');
  const [showFilters, setShowFilters] = useState(false);
  const [selectedProducts, setSelectedProducts] = useState<string[]>([]);
  const [editingProduct, setEditingProduct] = useState<string | null>(null);
  const [editValues, setEditValues] = useState<Partial<EnrichedProduct>>({});
  const [isLoading, setIsLoading] = useState(true);
  const [cronStatus, setCronStatus] = useState<any>(null);
  const [cronMode, setCronMode] = useState<'auto' | 'manual'>('auto');
  const [isRunningCron, setIsRunningCron] = useState(false);
  const { showSuccess, showError, showInfo } = useNotifications();

  // Mock enriched products data
  const mockEnrichedProducts: EnrichedProduct[] = [
    {
      id: 'enriched-1',
      sku: 'ALYAAVCOTBEI-DH',
      gtin: '3701234567890',
      handle: 'canape-alyana-beige',
      title: 'Canapé ALYANA convertible - Beige',
      description: 'Canapé d\'angle convertible 4 places en velours côtelé beige avec coffre de rangement',
      short_description: 'Canapé d\'angle convertible 4 places velours côtelé beige',
      category: 'Canapé',
      subcategory: 'Canapé d\'angle convertible',
      color: 'Beige',
      material: 'Velours',
      fabric: 'Velours côtelé',
      style: 'Moderne',
      dimensions: '280x180x75cm',
      weight: '45kg',
      capacity: '4 places',
      room: 'Salon',
      price: 799,
      compare_at_price: 1399,
      currency: 'EUR',
      stock_quantity: 100,
      availability: 'En stock',
      stock_qty: 100,
      image_url: 'https://cdn.shopify.com/s/files/1/0903/7578/2665/files/7_23a97631-68d2-4f3e-8f78-b26c7cd4c2ae.png?v=1754406480',
      image_alt: 'Canapé d\'angle convertible ALYANA beige velours côtelé',
      gallery_urls: [
        'https://cdn.shopify.com/s/files/1/0903/7578/2665/files/1_c424b028-7399-4639-ba8f-487e0d71d0f6.png',
        'https://cdn.shopify.com/s/files/1/0903/7578/2665/files/3_329df0e2-31cd-4628-a3ac-06213e4e2741.png'
      ],
      product_url: 'https://decorahome.fr/products/canape-dangle-convertible-et-reversible-4-places-en-velours-cotele',
      tags: ['convertible', 'angle', 'velours', 'rangement', '4-places'],
      seo_title: 'Canapé d\'angle convertible ALYANA beige - Velours côtelé',
      seo_description: 'Canapé d\'angle convertible 4 places en velours côtelé beige. Couchage intégré, coffre rangement. Livraison gratuite.',
      google_category: 'Furniture > Living Room Furniture > Sofas',
      pmax_score: 92,
      ad_headline: 'Canapé ALYANA Convertible',
      ad_description: 'Canapé d\'angle 4 places velours côtelé. Convertible + rangement. Promo -43%',
      google_product_category: '635',
      brand: 'Decora Home',
      intent_tags: {
        category: 'canapé',
        material: 'velours',
        color: 'beige',
        feature: 'convertible',
        storage: 'coffre',
        seating: '4-places'
      },
      matching_score: 95,
      chat_history_ref: '',
      confidence_score: 95,
      enriched_at: '2025-01-15T10:30:00Z',
      enrichment_source: 'ai',
      created_at: '2024-12-15T10:30:00Z'
    },
    {
      id: 'enriched-2',
      sku: 'TB18T100-DH',
      gtin: '3701234567891',
      handle: 'table-aurea-100',
      title: 'Table AUREA Ø100cm - Travertin',
      description: 'Table ronde en travertin naturel avec pieds métal noir',
      short_description: 'Table ronde travertin naturel Ø100cm pieds métal',
      category: 'Table',
      subcategory: 'Table à manger ronde',
      color: 'Naturel',
      material: 'Travertin',
      fabric: '',
      style: 'Contemporain',
      dimensions: '100x100x75cm',
      weight: '25kg',
      capacity: '4 personnes',
      room: 'Salle à manger',
      price: 499,
      compare_at_price: 859,
      currency: 'EUR',
      stock_quantity: 50,
      availability: 'En stock',
      stock_qty: 50,
      image_url: 'https://cdn.shopify.com/s/files/1/0903/7578/2665/files/3_e80b9a50-b032-4267-8f5b-f9130153e3be.png?v=1754406484',
      image_alt: 'Table ronde AUREA travertin naturel Ø100cm',
      gallery_urls: [
        'https://cdn.shopify.com/s/files/1/0903/7578/2665/files/2_89637aec-60b5-403f-9f0f-57c9a2fa42e4.png'
      ],
      product_url: 'https://decorahome.fr/products/table-a-manger-ronde-plateau-en-travertin-naturel-100-120-cm',
      tags: ['travertin', 'ronde', 'naturel', 'élégant', 'minérale'],
      seo_title: 'Table ronde AUREA travertin naturel Ø100cm - Decora Home',
      seo_description: 'Table à manger ronde AUREA en travertin naturel Ø100cm. Pieds métal noir. Design contemporain élégant. Livraison offerte.',
      google_category: 'Furniture > Dining Room Furniture > Tables',
      pmax_score: 88,
      ad_headline: 'Table AUREA Travertin Ø100cm',
      ad_description: 'Table ronde travertin naturel. Design contemporain. Pieds métal noir. -42%',
      google_product_category: '443',
      brand: 'Decora Home',
      intent_tags: {
        category: 'table',
        material: 'travertin',
        shape: 'ronde',
        size: '100cm',
        style: 'contemporain'
      },
      matching_score: 88,
      chat_history_ref: '',
      confidence_score: 92,
      enriched_at: '2025-01-15T09:15:00Z',
      enrichment_source: 'ai',
      created_at: '2024-11-20T09:15:00Z'
    },
    {
      id: 'enriched-3',
      sku: 'DC11PNNCHLG-DH',
      gtin: '3701234567892',
      handle: 'chaise-inaya-gris',
      title: 'Chaise INAYA - Gris chenille',
      description: 'Chaise en tissu chenille avec pieds métal noir',
      short_description: 'Chaise chenille gris pieds métal noir design contemporain',
      category: 'Chaise',
      subcategory: 'Chaise de salle à manger',
      color: 'Gris',
      material: 'Métal',
      fabric: 'Chenille',
      style: 'Industriel',
      dimensions: '45x50x85cm',
      weight: '5kg',
      capacity: '1 personne',
      room: 'Salle à manger',
      price: 99,
      compare_at_price: 149,
      currency: 'EUR',
      stock_quantity: 96,
      availability: 'En stock',
      stock_qty: 96,
      image_url: 'https://cdn.shopify.com/s/files/1/0903/7578/2665/files/3_3f11d1af-8ce5-4d2d-a435-cd0a78eb92ee.png?v=1755791319',
      image_alt: 'Chaise INAYA chenille gris pieds métal noir',
      gallery_urls: [
        'https://cdn.shopify.com/s/files/1/0903/7578/2665/files/1_aae7ccd2-f2cb-4418-8c84-210ace00d753.png'
      ],
      product_url: 'https://decorahome.fr/products/chaise-en-tissu-serge-chenille-pieds-metal-noir-gris-clair-moka-et-beige',
      tags: ['chenille', 'métal', 'contemporain', 'élégant', 'gris'],
      seo_title: 'Chaise INAYA chenille gris - Pieds métal noir - Decora Home',
      seo_description: 'Chaise INAYA en tissu chenille gris avec pieds métal noir. Design contemporain élégant. Confort optimal. Livraison rapide.',
      google_category: 'Furniture > Dining Room Furniture > Chairs',
      pmax_score: 85,
      ad_headline: 'Chaise INAYA Chenille Gris',
      ad_description: 'Chaise chenille + métal noir. Design contemporain. Confort optimal. -34%',
      google_product_category: '436',
      brand: 'Decora Home',
      intent_tags: {
        category: 'chaise',
        material: 'chenille',
        color: 'gris',
        style: 'industriel',
        frame: 'métal'
      },
      matching_score: 85,
      chat_history_ref: '',
      confidence_score: 88,
      enriched_at: '2025-01-15T08:22:00Z',
      enrichment_source: 'ai',
      created_at: '2024-10-05T14:22:00Z'
    }
  ];

  useEffect(() => {
    loadEnrichedProducts();
    loadCronStatus();
  }, []);

  useEffect(() => {
    filterProducts();
  }, [products, searchTerm, selectedCategory, selectedMaterial, selectedColor, selectedRoom]);

  const loadEnrichedProducts = async () => {
    try {
      setIsLoading(true);
      
      // Simuler le chargement depuis la DB
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // Charger depuis localStorage si disponible
      const savedProducts = localStorage.getItem('enriched_products');
      let allProducts = [...mockEnrichedProducts];
      
      if (savedProducts) {
        try {
          const parsed = JSON.parse(savedProducts);
          allProducts = [...parsed, ...mockEnrichedProducts];
        } catch (error) {
          console.error('Erreur parsing produits enrichis:', error);
        }
      }
      
      setProducts(allProducts);
      console.log('✅ Produits enrichis chargés:', allProducts.length);
      
    } catch (error) {
      console.error('❌ Erreur chargement produits enrichis:', error);
      showError('Erreur de chargement', 'Impossible de charger les produits enrichis.');
    } finally {
      setIsLoading(false);
    }
  };

  const loadCronStatus = async () => {
    try {
      // Simuler le statut du cron d'enrichissement
      const mockCronStatus = {
        enabled: true,
        last_run: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
        next_run: new Date(Date.now() + 22 * 60 * 60 * 1000).toISOString(),
        products_enriched: 247,
        success_rate: 94
      };
      
      setCronStatus(mockCronStatus);
    } catch (error) {
      console.error('❌ Erreur chargement statut cron:', error);
    }
  };

  const filterProducts = () => {
    let filtered = products;

    if (searchTerm) {
      filtered = filtered.filter(product =>
        product.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.subcategory.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.material.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.color.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (selectedCategory !== 'all') {
      filtered = filtered.filter(product => product.category === selectedCategory);
    }

    if (selectedMaterial !== 'all') {
      filtered = filtered.filter(product => product.material === selectedMaterial);
    }

    if (selectedColor !== 'all') {
      filtered = filtered.filter(product => product.color === selectedColor);
    }

    if (selectedRoom !== 'all') {
      filtered = filtered.filter(product => product.room === selectedRoom);
    }

    setFilteredProducts(filtered);
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

  const handleDeleteSelected = () => {
    if (selectedProducts.length === 0) return;
    
    if (confirm(`Supprimer ${selectedProducts.length} produit(s) enrichi(s) sélectionné(s) ?`)) {
      const updatedProducts = products.filter(p => !selectedProducts.includes(p.id));
      setProducts(updatedProducts);
      localStorage.setItem('enriched_products', JSON.stringify(updatedProducts));
      setSelectedProducts([]);
      showSuccess('Produits supprimés', `${selectedProducts.length} produit(s) enrichi(s) supprimé(s).`);
    }
  };

  const handleEditProduct = (productId: string) => {
    const product = products.find(p => p.id === productId);
    if (product) {
      setEditingProduct(productId);
      setEditValues(product);
    }
  };

  const handleSaveEdit = () => {
    if (!editingProduct) return;

    const updatedProducts = products.map(p => 
      p.id === editingProduct ? { ...p, ...editValues } : p
    );
    
    setProducts(updatedProducts);
    localStorage.setItem('enriched_products', JSON.stringify(updatedProducts));
    setEditingProduct(null);
    setEditValues({});
    showSuccess('Produit modifié', 'Les attributs enrichis ont été mis à jour.');
  };

  const handleCancelEdit = () => {
    setEditingProduct(null);
    setEditValues({});
  };

  const detectCategory = (title: string) => {
    const lowerTitle = title.toLowerCase();
    if (lowerTitle.includes('canapé') || lowerTitle.includes('sofa')) return 'Canapé';
    if (lowerTitle.includes('table')) return 'Table';
    if (lowerTitle.includes('chaise')) return 'Chaise';
    if (lowerTitle.includes('lit')) return 'Lit';
    if (lowerTitle.includes('armoire') || lowerTitle.includes('placard')) return 'Armoire';
    if (lowerTitle.includes('commode') || lowerTitle.includes('tiroir')) return 'Commode';
    if (lowerTitle.includes('étagère') || lowerTitle.includes('bibliothèque')) return 'Étagère';
    if (lowerTitle.includes('fauteuil')) return 'Fauteuil';
    if (lowerTitle.includes('bureau')) return 'Bureau';
    if (lowerTitle.includes('miroir')) return 'Miroir';
    if (lowerTitle.includes('lampe') || lowerTitle.includes('luminaire')) return 'Éclairage';
    if (lowerTitle.includes('tapis')) return 'Tapis';
    if (lowerTitle.includes('coussin')) return 'Coussin';
    if (lowerTitle.includes('rideau') || lowerTitle.includes('voilage')) return 'Rideau';
    return 'Mobilier';
  };

  const detectSubcategory = (title: string) => {
    const lowerTitle = title.toLowerCase();
    if (lowerTitle.includes('convertible')) return 'Canapé convertible';
    if (lowerTitle.includes('angle')) return 'Canapé d\'angle';
    if (lowerTitle.includes('ronde')) return 'Table ronde';
    if (lowerTitle.includes('rectangulaire')) return 'Table rectangulaire';
    if (lowerTitle.includes('bar')) return 'Table de bar';
    if (lowerTitle.includes('basse')) return 'Table basse';
    if (lowerTitle.includes('chevet')) return 'Table de chevet';
    if (lowerTitle.includes('console')) return 'Console';
    if (lowerTitle.includes('extensible')) return 'Table extensible';
    return '';
  };

  const detectColor = (text: string) => {
    const lowerText = text.toLowerCase();
    if (lowerText.includes('blanc') || lowerText.includes('white')) return 'Blanc';
    if (lowerText.includes('noir') || lowerText.includes('black')) return 'Noir';
    if (lowerText.includes('gris') || lowerText.includes('grey') || lowerText.includes('gray')) return 'Gris';
    if (lowerText.includes('beige') || lowerText.includes('sable')) return 'Beige';
    if (lowerText.includes('marron') || lowerText.includes('brun') || lowerText.includes('brown')) return 'Marron';
    if (lowerText.includes('bleu') || lowerText.includes('blue')) return 'Bleu';
    if (lowerText.includes('rouge') || lowerText.includes('red')) return 'Rouge';
    if (lowerText.includes('vert') || lowerText.includes('green')) return 'Vert';
    if (lowerText.includes('jaune') || lowerText.includes('yellow')) return 'Jaune';
    if (lowerText.includes('rose') || lowerText.includes('pink')) return 'Rose';
    if (lowerText.includes('violet') || lowerText.includes('purple')) return 'Violet';
    if (lowerText.includes('orange')) return 'Orange';
    if (lowerText.includes('naturel') || lowerText.includes('natural')) return 'Naturel';
    if (lowerText.includes('doré') || lowerText.includes('gold')) return 'Doré';
    if (lowerText.includes('argenté') || lowerText.includes('silver')) return 'Argenté';
    return '';
  };

  const detectMaterial = (text: string) => {
    const lowerText = text.toLowerCase();
    if (lowerText.includes('bois') || lowerText.includes('wood')) return 'Bois';
    if (lowerText.includes('métal') || lowerText.includes('metal')) return 'Métal';
    if (lowerText.includes('verre') || lowerText.includes('glass')) return 'Verre';
    if (lowerText.includes('plastique') || lowerText.includes('plastic')) return 'Plastique';
    if (lowerText.includes('cuir') || lowerText.includes('leather')) return 'Cuir';
    if (lowerText.includes('tissu') || lowerText.includes('fabric')) return 'Tissu';
    if (lowerText.includes('velours') || lowerText.includes('velvet')) return 'Velours';
    if (lowerText.includes('lin') || lowerText.includes('linen')) return 'Lin';
    if (lowerText.includes('coton') || lowerText.includes('cotton')) return 'Coton';
    if (lowerText.includes('marbre') || lowerText.includes('marble')) return 'Marbre';
    if (lowerText.includes('travertin')) return 'Travertin';
    if (lowerText.includes('céramique') || lowerText.includes('ceramic')) return 'Céramique';
    if (lowerText.includes('rotin') || lowerText.includes('rattan')) return 'Rotin';
    if (lowerText.includes('osier') || lowerText.includes('wicker')) return 'Osier';
    if (lowerText.includes('bambou') || lowerText.includes('bamboo')) return 'Bambou';
    return '';
  };

  const detectFabric = (text: string) => {
    const lowerText = text.toLowerCase();
    if (lowerText.includes('chenille')) return 'Chenille';
    if (lowerText.includes('côtelé')) return 'Velours côtelé';
    if (lowerText.includes('bouclé')) return 'Bouclé';
    if (lowerText.includes('sergé')) return 'Sergé';
    if (lowerText.includes('jacquard')) return 'Jacquard';
    if (lowerText.includes('tweed')) return 'Tweed';
    if (lowerText.includes('denim')) return 'Denim';
    if (lowerText.includes('satin')) return 'Satin';
    if (lowerText.includes('soie') || lowerText.includes('silk')) return 'Soie';
    return '';
  };

  const detectStyle = (text: string) => {
    const lowerText = text.toLowerCase();
    if (lowerText.includes('moderne') || lowerText.includes('modern')) return 'Moderne';
    if (lowerText.includes('contemporain') || lowerText.includes('contemporary')) return 'Contemporain';
    if (lowerText.includes('industriel') || lowerText.includes('industrial')) return 'Industriel';
    if (lowerText.includes('scandinave') || lowerText.includes('scandinavian')) return 'Scandinave';
    if (lowerText.includes('vintage') || lowerText.includes('rétro')) return 'Vintage';
    if (lowerText.includes('classique') || lowerText.includes('classic')) return 'Classique';
    if (lowerText.includes('rustique') || lowerText.includes('rustic')) return 'Rustique';
    if (lowerText.includes('bohème') || lowerText.includes('boho')) return 'Bohème';
    if (lowerText.includes('minimaliste') || lowerText.includes('minimalist')) return 'Minimaliste';
    if (lowerText.includes('art déco')) return 'Art Déco';
    return '';
  };

  const extractDimensions = (text: string) => {
    const dimensionRegex = /(\d+)\s*[x×]\s*(\d+)(?:\s*[x×]\s*(\d+))?/i;
    const match = text.match(dimensionRegex);
    if (match) {
      return match[3] ? `${match[1]}x${match[2]}x${match[3]}cm` : `${match[1]}x${match[2]}cm`;
    }
    return '';
  };

  const detectRoom = (text: string) => {
    const lowerText = text.toLowerCase();
    if (lowerText.includes('salon') || lowerText.includes('living')) return 'Salon';
    if (lowerText.includes('chambre') || lowerText.includes('bedroom')) return 'Chambre';
    if (lowerText.includes('cuisine') || lowerText.includes('kitchen')) return 'Cuisine';
    if (lowerText.includes('salle à manger') || lowerText.includes('dining')) return 'Salle à manger';
    if (lowerText.includes('bureau') || lowerText.includes('office')) return 'Bureau';
    if (lowerText.includes('salle de bain') || lowerText.includes('bathroom')) return 'Salle de bain';
    if (lowerText.includes('entrée') || lowerText.includes('entrance')) return 'Entrée';
    if (lowerText.includes('terrasse') || lowerText.includes('terrace')) return 'Terrasse';
    if (lowerText.includes('jardin') || lowerText.includes('garden')) return 'Jardin';
    return '';
  };

  const generateTags = (product: any) => {
    const tags = [];
    const title = (product.title || '').toLowerCase();
    const description = (product.description || '').toLowerCase();
    
    if (title.includes('convertible')) tags.push('convertible');
    if (title.includes('angle')) tags.push('angle');
    if (title.includes('rangement')) tags.push('rangement');
    if (title.includes('places')) tags.push(title.match(/(\d+)\s*places?/)?.[1] + '-places');
    if (description.includes('livraison')) tags.push('livraison');
    if (description.includes('gratuite')) tags.push('gratuite');
    
    return tags.filter(Boolean);
  };

  const generateSEOTitle = (product: any) => {
    const title = product.title || 'Produit';
    const category = detectCategory(title);
    const material = detectMaterial(title + ' ' + (product.description || ''));
    const color = detectColor(title + ' ' + (product.description || ''));
    
    let seoTitle = title;
    if (material) seoTitle += ` - ${material}`;
    if (color) seoTitle += ` ${color}`;
    seoTitle += ' - Decora Home';
    
    return seoTitle.substring(0, 60);
  };

  const generateSEODescription = (product: any) => {
    const title = product.title || 'Produit';
    const category = detectCategory(title);
    const material = detectMaterial(title + ' ' + (product.description || ''));
    const color = detectColor(title + ' ' + (product.description || ''));
    
    let description = `${title}`;
    if (material) description += ` en ${material.toLowerCase()}`;
    if (color) description += ` ${color.toLowerCase()}`;
    description += '. Design contemporain élégant. Livraison offerte.';
    
    return description.substring(0, 160);
  };

  const generateAdHeadline = (product: any) => {
    const title = product.title || 'Produit';
    return title.substring(0, 30);
  };

  const generateAdDescription = (product: any) => {
    const material = detectMaterial(product.title + ' ' + (product.description || ''));
    const style = detectStyle(product.title + ' ' + (product.description || ''));
    
    let description = '';
    if (material) description += `${material}. `;
    if (style) description += `${style}. `;
    description += 'Promo exceptionnelle.';
    
    return description.substring(0, 90);
  };

  const getGoogleCategory = (product: any) => {
    const category = detectCategory(product.title || '');
    const categoryMap: { [key: string]: string } = {
      'Canapé': '635',
      'Table': '443',
      'Chaise': '436',
      'Lit': '569',
      'Armoire': '436',
      'Commode': '436',
      'Étagère': '436',
      'Fauteuil': '436',
      'Bureau': '443',
      'Miroir': '594',
      'Éclairage': '594',
      'Tapis': '505',
      'Coussin': '569',
      'Rideau': '569'
    };
    return categoryMap[category] || '436';
  };

  const calculateConfidenceScore = (product: any) => {
    let score = 50;
    
    if (product.title) score += 10;
    if (product.description) score += 10;
    if (product.price) score += 10;
    if (product.image_url) score += 10;
    if (detectCategory(product.title || '')) score += 5;
    if (detectMaterial(product.title + ' ' + (product.description || ''))) score += 5;
    
    return Math.min(score, 100);
  };

  const handleRunEnrichmentCron = async () => {
    try {
      setIsRunningCron(true);
      showInfo('Enrichissement démarré', 'Analyse IA des produits en cours...');
      
      // Récupérer les produits du catalogue principal
      const catalogProducts = localStorage.getItem('catalog_products');
      if (!catalogProducts) {
        showError('Aucun produit', 'Aucun produit trouvé dans le catalogue principal à enrichir.');
        return;
      }
      
      const products = JSON.parse(catalogProducts);
      console.log('📦 Produits à enrichir:', products.length);
      
      // Simuler l'enrichissement IA
      await new Promise(resolve => setTimeout(resolve, cronMode === 'auto' ? 1000 : 3000));
      
      // Enrichir automatiquement tous les produits du catalogue
      const newEnrichedProducts = products.map((product: any) => ({
        id: `enriched-${product.id || Date.now()}`,
        sku: product.sku || generateSKU(product),
        gtin: generateGTIN(product),
        handle: product.handle || product.id || 'produit-enrichi',
        title: product.title || product.name || 'Produit sans nom',
        description: product.description || '',
        short_description: generateShortDescription(product),
        category: detectCategory(product.title || product.name || ''),
        subcategory: detectSubcategory(product.title || product.name || ''),
        color: detectColor(product.title + ' ' + product.description),
        material: detectMaterial(product.title + ' ' + product.description),
        fabric: detectFabric(product.title + ' ' + product.description),
        style: detectStyle(product.title + ' ' + product.description),
        dimensions: extractDimensions(product.description || ''),
        weight: extractWeight(product.description || ''),
        capacity: extractCapacity(product.title + ' ' + product.description),
        room: detectRoom(product.title + ' ' + product.description),
        price: product.price || 0,
        compare_at_price: product.compare_at_price || product.compareAtPrice,
        currency: 'EUR',
        stock_quantity: product.stock || product.quantityAvailable || 0,
        availability: (product.stock || product.quantityAvailable || 0) > 0 ? 'En stock' : 'Rupture',
        stock_qty: product.stock || product.quantityAvailable || 0,
        image_url: product.image_url || 'https://images.pexels.com/photos/1350789/pexels-photo-1350789.jpeg',
        image_alt: generateImageAlt(product),
        gallery_urls: extractGalleryUrls(product),
        product_url: product.product_url || '#',
        tags: generateTags(product),
        seo_title: generateSEOTitle(product),
        seo_description: generateSEODescription(product),
        google_category: generateGoogleCategory(product),
        pmax_score: calculatePMaxScore(product),
        ad_headline: generateAdHeadline(product),
        ad_description: generateAdDescription(product),
        google_product_category: getGoogleCategory(product),
        brand: product.vendor || 'Decora Home',
        intent_tags: generateIntentTags(product),
        matching_score: calculateMatchingScore(product),
        chat_history_ref: '',
        confidence_score: calculateConfidenceScore(product),
        enriched_at: new Date().toISOString(),
        enrichment_source: cronMode === 'auto' ? 'cron_auto' : 'manual',
        created_at: product.created_at || new Date().toISOString()
      }));
      
      // Fusionner avec les produits enrichis existants (éviter doublons)
      const existingEnriched = products.filter((p: any) => 
        !newEnrichedProducts.find(np => np.handle === p.handle) &&
        !mockEnrichedProducts.find(mp => mp.handle === p.handle)
      );
      const allEnrichedProducts = [...mockEnrichedProducts, ...newEnrichedProducts];
      
      setProducts(allEnrichedProducts);
      localStorage.setItem('enriched_products', JSON.stringify(allEnrichedProducts));
      
      showSuccess(
        cronMode === 'auto' ? 'Cron automatique terminé' : 'Enrichissement manuel terminé', 
        `${newEnrichedProducts.length} nouveau(x) produit(s) enrichi(s) ajouté(s) !`,
        [
          {
            label: 'Voir le catalogue enrichi',
            action: () => setSearchTerm(''),
            variant: 'primary'
          }
        ]
      );
      
    } catch (error) {
      console.error('❌ Erreur enrichissement:', error);
      showError('Erreur enrichissement', 'Erreur lors de l\'enrichissement automatique.');
    } finally {
      setIsRunningCron(false);
    }
  };

  const categories = [...new Set(products.map(p => p.category))];
  const materials = [...new Set(products.map(p => p.material).filter(Boolean))];
  const colors = [...new Set(products.map(p => p.color).filter(Boolean))];
  const rooms = [...new Set(products.map(p => p.room).filter(Boolean))];

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-cyan-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-white text-lg">Chargement catalogue enrichi...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header avec statut cron */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-white flex items-center gap-3">
            <Brain className="w-8 h-8 text-purple-400" />
            Catalogue Enrichi IA
          </h2>
          <p className="text-gray-300">{filteredProducts.length} produit(s) enrichi(s) sur {products.length}</p>
        </div>
        
        <div className="flex flex-wrap gap-3">
          {/* Mode Cron */}
          <div className="flex items-center gap-2 bg-black/40 rounded-xl p-2 border border-gray-600">
            <button
              onClick={() => setCronMode('auto')}
              className={`px-3 py-1 rounded-lg text-sm font-medium transition-all ${
                cronMode === 'auto' 
                  ? 'bg-green-500 text-white' 
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              Auto
            </button>
            <button
              onClick={() => setCronMode('manual')}
              className={`px-3 py-1 rounded-lg text-sm font-medium transition-all ${
                cronMode === 'manual' 
                  ? 'bg-blue-500 text-white' 
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              Manuel
            </button>
          </div>
          
          <button
            onClick={handleRunEnrichmentCron}
            disabled={isRunningCron}
            className="bg-gradient-to-r from-purple-500 to-pink-600 hover:from-purple-400 hover:to-pink-500 text-white px-4 py-2 rounded-xl flex items-center gap-2 font-semibold transition-all"
          >
            {isRunningCron ? (
              <>
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                Enrichissement...
              </>
            ) : (
              <>
                <Brain className="w-4 h-4" />
                {cronMode === 'auto' ? 'Cron Auto' : 'Enrichir Manuel'}
              </>
            )}
          </button>
          
          {selectedProducts.length > 0 && (
            <button
              onClick={handleDeleteSelected}
              className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-xl flex items-center gap-2 transition-all"
            >
              <Trash2 className="w-4 h-4" />
              Supprimer ({selectedProducts.length})
            </button>
          )}
        </div>
      </div>

      {/* Statut du cron d'enrichissement */}
      {cronStatus && (
        <div className={`border rounded-xl p-4 ${
          cronMode === 'auto' 
            ? 'bg-green-500/20 border-green-400/50' 
            : 'bg-blue-500/20 border-blue-400/50'
        }`}>
          <h3 className="font-semibold text-purple-200 mb-3 flex items-center gap-2">
            <Brain className="w-5 h-5" />
            {cronMode === 'auto' ? 'Cron d\'enrichissement automatique' : 'Enrichissement manuel'}
          </h3>
          
          {cronMode === 'auto' && (
            <div className="bg-green-500/20 border border-green-400/30 rounded-lg p-3 mb-4">
              <h4 className="font-semibold text-green-200 mb-2">🤖 Mode automatique actif :</h4>
              <ul className="text-green-300 text-sm space-y-1">
                <li>• Détection automatique des nouveaux produits</li>
                <li>• Enrichissement IA toutes les 6h</li>
                <li>• Mise à jour des attributs manquants</li>
                <li>• Génération SEO et Google Shopping</li>
              </ul>
            </div>
          )}
          
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-sm">
            <div className="text-center">
              <div className="text-2xl font-bold text-green-400">
                {cronMode === 'auto' ? 'AUTO' : 'MANUEL'}
              </div>
              <div className="text-green-300">Mode</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-400">{cronStatus.products_enriched}</div>
              <div className="text-purple-300">Produits enrichis</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-400">{cronStatus.success_rate}%</div>
              <div className="text-blue-300">Taux de succès</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-orange-400">
                {cronMode === 'auto' 
                  ? new Date(cronStatus.next_run).toLocaleDateString('fr-FR')
                  : 'Sur demande'
                }
              </div>
              <div className="text-orange-300">
                {cronMode === 'auto' ? 'Prochaine exécution' : 'Exécution'}
              </div>
            </div>
          </div>
        </div>
      )}

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
          
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-3 rounded-xl flex items-center gap-2 transition-all"
          >
            <Filter className="w-4 h-4" />
            Filtres enrichis
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
                <label className="block text-sm text-gray-300 mb-2">Pièce</label>
                <select
                  value={selectedRoom}
                  onChange={(e) => setSelectedRoom(e.target.value)}
                  className="w-full bg-black/40 border border-gray-600 rounded-xl px-3 py-2 text-white"
                >
                  <option value="all">Toutes les pièces</option>
                  {rooms.map(room => (
                    <option key={room} value={room}>{room}</option>
                  ))}
                </select>
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
              {selectedProducts.length} produit(s) enrichi(s) sélectionné(s)
            </span>
            <div className="flex gap-2">
              <button
                onClick={() => setSelectedProducts([])}
                className="text-gray-400 hover:text-white"
        {/* Export/Import Actions */}
        <div className="flex gap-4 mb-6">
          <button
            onClick={() => {
              const csvContent = [
                'id,sku,gtin,handle,title,description,short_description,vendor,brand,category,subcategory,material,color,style,room,dimensions,weight,capacity,price,compare_at_price,currency,stock_quantity,availability,seo_title,seo_description,google_category,pmax_score,image_url,image_alt,gallery_urls,intent_tags,matching_score,chat_history_ref',
                ...enrichedProducts.map(product => [
                  product.id,
                  product.sku || '',
                  product.gtin || '',
                  product.handle || '',
                  product.title || '',
                  product.description || '',
                  product.short_description || '',
                  product.vendor || '',
                  product.brand || '',
                  product.category || '',
                  product.subcategory || '',
                  product.material || '',
                  product.color || '',
                  product.style || '',
                  product.room || '',
                  product.dimensions || '',
                  product.weight || '',
                  product.capacity || '',
                  product.price || '',
                  product.compare_at_price || '',
                  product.currency || 'EUR',
                  product.stock_qty || '',
                  product.availability || '',
                  product.seo_title || '',
                  product.seo_description || '',
                  product.google_category || '',
                  product.pmax_score || '',
                  product.image_url || '',
                  product.image_alt || '',
                  product.gallery_urls || '',
                  JSON.stringify(product.intent_tags || {}),
                  product.matching_score || '',
                  product.chat_history_ref || ''
                ].join(','))
              ].join('\n');
              
              const blob = new Blob([csvContent], { type: 'text/csv' });
              const url = URL.createObjectURL(blob);
              const a = document.createElement('a');
              a.href = url;
              a.download = 'catalogue-enrichi.csv';
              a.click();
              URL.revokeObjectURL(url);
            }}
            className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-xl flex items-center gap-2"
          >
            <Download className="w-4 h-4" />
            Exporter CSV
          </button>
          
          <input
            ref={fileInputRef}
            type="file"
            accept=".csv"
            onChange={handleImportCSV}
            className="hidden"
          />
          <button
            onClick={() => fileInputRef.current?.click()}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-xl flex items-center gap-2"
          >
            <Upload className="w-4 h-4" />
            Importer CSV
          </button>
        </div>
      </div>
                <button
                  onClick={() => {
                    const csvContent = [
                      'category,subcategory,google_code,google_category',
                      ...googleCategories.map(cat => 
                        `"${cat.category}","${cat.subcategory}","${cat.google_code}","${cat.google_category}"`
                      )
                    ].join('\n');
                    
                    const blob = new Blob([csvContent], { type: 'text/csv' });
                    const url = URL.createObjectURL(blob);
                    const a = document.createElement('a');
                    a.href = url;
                    a.download = 'google-categories-mapping.csv';
                    a.click();
                    URL.revokeObjectURL(url);
                  }}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-xl flex items-center gap-2"
                >
                  <Download className="w-4 h-4" />
                  Exporter CSV
                </button>
                
        </div>
                <input
                  type="file"
                  accept=".csv"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) {
                      // Importer CSV de catégories
                      const reader = new FileReader();
                      reader.onload = (event) => {
                        try {
                          const csv = event.target?.result as string;
                          const lines = csv.split('\n');
                          const headers = lines[0].split(',');
                          const newCategories = [];
                          
                          for (let i = 1; i < lines.length; i++) {
                            if (lines[i].trim()) {
                              const values = lines[i].split(',').map(v => v.replace(/"/g, ''));
                              newCategories.push({
                                category: values[0],
                                subcategory: values[1],
                                google_code: values[2],
                                google_category: values[3]
                              });
                            }
                          }
                          
                          setGoogleCategories(newCategories);
                          localStorage.setItem('google_categories', JSON.stringify(newCategories));
                          showSuccess('Import réussi', `${newCategories.length} catégories importées !`);
                        } catch (error) {
                          showError('Erreur import', 'Format CSV invalide.');
                        }
                      };
                      reader.readAsText(file);
                    }
                  }}
                  className="hidden"
                  id="csv-import"
                />
                <label
                  htmlFor="csv-import"
                  className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-xl flex items-center gap-2 cursor-pointer"
                >
                  <Upload className="w-4 h-4" />
                  Importer CSV
                </label>
              </div>
              
      )}

      {/* Tableau des produits enrichis */}
                  Correspondance automatique entre vos catégories et les codes Google Shopping officiels.
                  Cette base sert pour tous les revendeurs et optimise Google Ads/Merchant Center.
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
                <th className="text-left p-4 text-cyan-300 font-semibold">Sous-catégorie</th>
                <th className="text-left p-4 text-cyan-300 font-semibold">Couleur</th>
                <th className="text-left p-4 text-cyan-300 font-semibold">Matériau</th>
                <th className="text-left p-4 text-cyan-300 font-semibold">Tissu</th>
                <th className="text-left p-4 text-cyan-300 font-semibold">Style</th>
                <th className="text-left p-4 text-cyan-300 font-semibold">Dimensions</th>
                <th className="text-left p-4 text-cyan-300 font-semibold">Pièce</th>
                <th className="text-left p-4 text-cyan-300 font-semibold">Tags</th>
                <th className="text-left p-4 text-cyan-300 font-semibold">SEO</th>
                <th className="text-left p-4 text-cyan-300 font-semibold">Score IA</th>
                <th className="text-left p-4 text-cyan-300 font-semibold">Prix</th>
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
                        <div className="text-gray-400 text-xs">{product.handle}</div>
                      </div>
                    </div>
                  </td>
                  <td className="p-4">
                    {editingProduct === product.id ? (
                      <input
                        type="text"
                        value={editValues.category || ''}
                        onChange={(e) => setEditValues(prev => ({ ...prev, category: e.target.value }))}
                        className="w-full bg-black/40 border border-gray-600 rounded px-2 py-1 text-white text-sm"
                      />
                    ) : (
                      <span className="text-white">{product.category}</span>
                    )}
                  </td>
                  <td className="p-4">
                    {editingProduct === product.id ? (
                      <input
                        type="text"
                        value={editValues.subcategory || ''}
                        onChange={(e) => setEditValues(prev => ({ ...prev, subcategory: e.target.value }))}
                        className="w-full bg-black/40 border border-gray-600 rounded px-2 py-1 text-white text-sm"
                      />
                    ) : (
                      <span className="text-white">{product.subcategory}</span>
                    )}
                  </td>
                  <td className="p-4">
                    {editingProduct === product.id ? (
                      <input
                        type="text"
                        value={editValues.color || ''}
                        onChange={(e) => setEditValues(prev => ({ ...prev, color: e.target.value }))}
                        className="w-full bg-black/40 border border-gray-600 rounded px-2 py-1 text-white text-sm"
                      />
                    ) : (
                      <span className="text-white">{product.color}</span>
                    )}
                  </td>
                  <td className="p-4">
                    {editingProduct === product.id ? (
                      <input
                        type="text"
                        value={editValues.material || ''}
                        onChange={(e) => setEditValues(prev => ({ ...prev, material: e.target.value }))}
                        className="w-full bg-black/40 border border-gray-600 rounded px-2 py-1 text-white text-sm"
                      />
                    ) : (
                      <span className="text-white">{product.material}</span>
                    )}
                  </td>
                  <td className="p-4">
                    {editingProduct === product.id ? (
                      <input
                        type="text"
                        value={editValues.fabric || ''}
                        onChange={(e) => setEditValues(prev => ({ ...prev, fabric: e.target.value }))}
                        className="w-full bg-black/40 border border-gray-600 rounded px-2 py-1 text-white text-sm"
                      />
                    ) : (
                      <span className="text-white">{product.fabric}</span>
                    )}
                  </td>
                  <td className="p-4">
                    {editingProduct === product.id ? (
                      <input
                        type="text"
                        value={editValues.style || ''}
                        onChange={(e) => setEditValues(prev => ({ ...prev, style: e.target.value }))}
                        className="w-full bg-black/40 border border-gray-600 rounded px-2 py-1 text-white text-sm"
                      />
                    ) : (
                      <span className="text-white">{product.style}</span>
                    )}
                  </td>
                  <td className="p-4">
                    {editingProduct === product.id ? (
                      <input
                        type="text"
                        value={editValues.dimensions || ''}
                        onChange={(e) => setEditValues(prev => ({ ...prev, dimensions: e.target.value }))}
                        className="w-full bg-black/40 border border-gray-600 rounded px-2 py-1 text-white text-sm"
                      />
                    ) : (
                      <span className="text-white">{product.dimensions}</span>
                    )}
                  </td>
                  <td className="p-4">
                    {editingProduct === product.id ? (
                      <input
                        type="text"
                        value={editValues.room || ''}
                        onChange={(e) => setEditValues(prev => ({ ...prev, room: e.target.value }))}
                        className="w-full bg-black/40 border border-gray-600 rounded px-2 py-1 text-white text-sm"
                      />
                    ) : (
                      <span className="text-white">{product.room}</span>
                    )}
                  </td>
                  <td className="p-4">
                    <div className="flex flex-wrap gap-1 max-w-32">
                      {(product.tags || []).slice(0, 3).map((tag, index) => (
                        <span key={index} className="bg-blue-500/20 text-blue-300 px-2 py-1 rounded text-xs">
                          {tag}
                        </span>
                      ))}
                      {(product.tags || []).length > 3 && (
                        <span className="text-gray-400 text-xs">+{(product.tags || []).length - 3}</span>
                      )}
                    </div>
                  </td>
                  <td className="p-4">
                    <div className="text-center">
                      <div className="text-sm text-white font-semibold">{product.seo_title?.substring(0, 20) || 'Non défini'}...</div>
                      <div className="text-xs text-gray-400">{product.seo_description?.substring(0, 30) || 'Aucune description'}...</div>
                    </div>
                  </td>
                  <td className="p-4">
                    <div className="text-center">
                      <div className={`text-lg font-bold ${
                        (product.confidence_score || 0) >= 80 ? 'text-green-400' :
                        (product.confidence_score || 0) >= 60 ? 'text-yellow-400' :
                        'text-red-400'
                      }`}>
                        {product.confidence_score || 0}%
                      </div>
                      <div className="text-xs text-gray-400">Confiance IA</div>
                    </div>
                  </td>
                  <td className="p-4">
                    <span className="font-bold text-green-400">{product.price}€</span>
                  </td>
                  <td className="p-4">
                    <div className="flex gap-2">
                      {editingProduct === product.id ? (
                        <>
                          <button
                            onClick={handleSaveEdit}
                            className="text-green-400 hover:text-green-300 p-1"
                            title="Sauvegarder"
                          >
                            <Save className="w-4 h-4" />
                          </button>
                          <button
                            onClick={handleCancelEdit}
                            className="text-red-400 hover:text-red-300 p-1"
                            title="Annuler"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </>
                      ) : (
                        <button
                          onClick={() => handleEditProduct(product.id)}
                          className="text-yellow-400 hover:text-yellow-300 p-1"
                          title="Modifier"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                      )}
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
            {searchTerm || selectedCategory !== 'all' || selectedMaterial !== 'all' || selectedColor !== 'all'
              ? 'Aucun produit ne correspond à vos critères de recherche.'
              : 'Votre catalogue enrichi est vide. Lancez l\'enrichissement IA.'}
          </p>
          <button
            onClick={handleRunEnrichmentCron}
            className="bg-gradient-to-r from-purple-500 to-pink-600 hover:from-purple-400 hover:to-pink-500 text-white px-6 py-3 rounded-xl font-semibold transition-all"
          >
            Enrichir le catalogue avec IA
          </button>
        </div>
      )}
    </div>
  );
};