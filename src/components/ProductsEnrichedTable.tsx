import React, { useState, useEffect } from 'react';
import { Search, Filter, Eye, CreditCard as Edit, Trash2, ExternalLink, Package, Tag, DollarSign, Image, BarChart3, Settings, ChevronDown, ChevronUp, X, Save, AlertCircle, CheckCircle, Brain, Sparkles, Zap, RefreshCw, Download, Upload, Camera, Loader2 } from 'lucide-react';
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
  compare_at_price?: number;
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
  ai_attributes?: {
    colors: string[];
    materials: string[];
    styles: string[];
    features: string[];
    room: string[];
  };
  seo_optimized?: {
    title: string;
    description: string;
    tags: string[];
  };
  ai_vision_analysis?: string;
}

interface ProductsEnrichedTableProps {
  retailerId?: string;
}

export const ProductsEnrichedTable: React.FC<ProductsEnrichedTableProps> = ({ retailerId }) => {
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
  const [viewMode, setViewMode] = useState<'table' | 'grid'>('table');
  const [showAIVisionModal, setShowAIVisionModal] = useState(false);
  const [selectedProductForVision, setSelectedProductForVision] = useState<EnrichedProduct | null>(null);
  const [aiVisionAnalysis, setAiVisionAnalysis] = useState<string>('');
  const [isAnalyzingVision, setIsAnalyzingVision] = useState(false);
  const { showSuccess, showError, showInfo } = useNotifications();

  useEffect(() => {
    loadEnrichedProducts();
  }, [retailerId]);

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
      
      // Générer des produits enrichis de démonstration basés sur le catalogue
      const mockEnrichedProducts = generateMockEnrichedProducts();
      
      console.log('📦 Produits enrichis chargés:', mockEnrichedProducts.length);
      setProducts(mockEnrichedProducts);
      setFilteredProducts(mockEnrichedProducts);
      
    } catch (error) {
      console.error('❌ Erreur chargement produits enrichis:', error);
      showError('Erreur de chargement', 'Impossible de charger les produits enrichis.');
    } finally {
      setIsLoading(false);
    }
  };

  const calculateDiscount = (price: number, compareAtPrice?: number): number => {
    if (!compareAtPrice || compareAtPrice <= price) return 0;
    return Math.round(((compareAtPrice - price) / compareAtPrice) * 100);
  };

  const handleAnalyzeImage = async (product: EnrichedProduct) => {
    setSelectedProductForVision(product);
    setShowAIVisionModal(true);
    setIsAnalyzingVision(true);
    setAiVisionAnalysis('');

    try {
      showInfo('Analyse Vision IA', 'Analyse de l\'image du produit avec OpenAI Vision...');

      const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
      const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

      if (supabaseUrl && supabaseKey) {
        const response = await fetch(`${supabaseUrl}/functions/v1/gpt-vision-analyzer`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${supabaseKey}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            image_url: product.image_url,
            analysis_type: 'product_identification',
            context: {
              product_name: product.title,
              category: product.category,
              existing_description: product.description
            }
          }),
        });

        if (response.ok) {
          const result = await response.json();
          setAiVisionAnalysis(result.analysis || 'Analyse non disponible');
          showSuccess('Vision IA terminée', 'Analyse de l\'image terminée avec succès !');
        } else {
          throw new Error('Erreur API Vision');
        }
      } else {
        // Fallback analysis
        const fallbackAnalysis = generateFallbackVisionAnalysis(product);
        setAiVisionAnalysis(fallbackAnalysis);
        showSuccess('Vision IA simulée', 'Analyse simulée générée avec succès !');
      }
    } catch (error) {
      console.error('❌ Erreur analyse Vision IA:', error);
      const fallbackAnalysis = generateFallbackVisionAnalysis(product);
      setAiVisionAnalysis(fallbackAnalysis);
      showError('Erreur Vision IA', 'Erreur lors de l\'analyse, analyse simulée générée.');
    } finally {
      setIsAnalyzingVision(false);
    }
  };

  const generateFallbackVisionAnalysis = (product: EnrichedProduct): string => {
    return `🔍 **Analyse Vision IA - ${product.title}**

**Style visuel détecté :** ${product.style || 'Contemporain'} avec lignes épurées
**Couleurs dominantes :** ${product.color || 'Tons neutres'} avec finitions soignées
**Matériaux visibles :** ${product.material || 'Matériaux de qualité'} avec texture ${product.fabric ? product.fabric : 'lisse'}
**Qualité perçue :** Premium avec attention aux détails
**Ambiance :** ${product.room || 'Polyvalent'} - Design intemporel

**💡 Points forts visuels :**
• Finitions soignées et professionnelles
• Proportions harmonieuses et équilibrées
• Couleurs tendance et intemporelles
• Design adapté aux intérieurs modernes

**🎯 Recommandations :**
• Parfait pour un intérieur ${product.style || 'contemporain'}
• S'harmonise avec des tons ${product.color || 'neutres'}
• Idéal pour ${product.room || 'salon'} moderne`;
  };

  const generateMockEnrichedProducts = (): EnrichedProduct[] => {
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
    
    // Produits de base Decora Home
    const decoraProducts = [
      {
        id: 'decora-canape-alyana-beige',
        name: 'Canapé ALYANA convertible - Beige',
        description: 'Canapé d\'angle convertible 4 places en velours côtelé beige avec coffre de rangement',
        price: 799,
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
        category: 'Chaise',
        vendor: 'Decora Home',
        image_url: 'https://cdn.shopify.com/s/files/1/0903/7578/2665/files/3_3f11d1af-8ce5-4d2d-a435-cd0a78eb92ee.png?v=1755791319',
        product_url: 'https://decorahome.fr/products/chaise-en-tissu-serge-chenille-pieds-metal-noir-gris-clair-moka-et-beige',
        stock: 96
      }
    ];
    
    // Combiner produits de base + produits importés
    const allProducts = [...decoraProducts, ...baseProducts];
    
    // Enrichir automatiquement chaque produit
    return allProducts.map(product => enrichProduct(product));
  };

  const enrichProduct = (product: any): EnrichedProduct => {
    const text = `${product.name || product.title || ''} ${product.description || ''} ${product.category || ''}`.toLowerCase();
    
    // Enrichissement automatique basé sur le texte
    const enriched = {
      id: product.id || `enriched-${Date.now()}-${Math.random()}`,
      handle: product.handle || product.id || `handle-${Date.now()}`,
      title: product.name || product.title || 'Produit sans nom',
      description: product.description || '',
      category: detectCategory(text),
      subcategory: detectSubcategory(text),
      color: detectColor(text),
      material: detectMaterial(text),
      fabric: detectFabric(text),
      style: detectStyle(text),
      dimensions: detectDimensions(text),
      room: detectRoom(text),
      price: product.price || 0,
      compare_at_price: product.compare_at_price || product.compareAtPrice,
      stock_qty: product.stock || product.quantityAvailable || 0,
      image_url: product.image_url || 'https://images.pexels.com/photos/1350789/pexels-photo-1350789.jpeg',
      product_url: product.product_url || '#',
      tags: generateTags(product.name || product.title || '', product.description || ''),
      seo_title: generateSEOTitle(product.name || product.title, detectColor(text), detectMaterial(text)),
      seo_description: generateSEODescription(product.name || product.title, detectStyle(text), detectMaterial(text)),
      ad_headline: generateAdHeadline(product.name || product.title),
      ad_description: generateAdDescription(product.name || product.title, detectMaterial(text)),
      google_product_category: getGoogleCategory(detectCategory(text)),
      gtin: '',
      brand: product.vendor || 'Decora Home',
      confidence_score: calculateConfidence(text),
      enriched_at: new Date().toISOString(),
      enrichment_source: 'auto',
      created_at: product.created_at || new Date().toISOString(),
      ai_attributes: {
        colors: detectColor(text) ? [detectColor(text)] : [],
        materials: detectMaterial(text) ? [detectMaterial(text)] : [],
        styles: detectStyle(text) ? [detectStyle(text)] : [],
        features: extractFeatures(text),
        room: detectRoom(text) ? [detectRoom(text)] : []
      },
      seo_optimized: {
        title: generateSEOTitle(product.name || product.title, detectColor(text), detectMaterial(text)),
        description: generateSEODescription(product.name || product.title, detectStyle(text), detectMaterial(text)),
        tags: generateTags(product.name || product.title || '', product.description || '')
      }
    };
    
    return enriched;
  };

  const extractFeatures = (text: string): string[] => {
    const features = [];
    if (text.includes('convertible')) features.push('convertible');
    if (text.includes('rangement')) features.push('rangement');
    if (text.includes('angle')) features.push('angle');
    if (text.includes('réversible')) features.push('réversible');
    if (text.includes('pliable')) features.push('pliable');
    if (text.includes('extensible')) features.push('extensible');
    if (text.includes('réglable')) features.push('réglable');
    if (text.includes('pivotant')) features.push('pivotant');
    return features;
  };

  // Fonctions de détection
  const detectCategory = (text: string): string => {
    if (text.includes('canapé') || text.includes('sofa')) return 'Canapé';
    if (text.includes('table')) return 'Table';
    if (text.includes('chaise') || text.includes('fauteuil')) return 'Chaise';
    if (text.includes('lit')) return 'Lit';
    if (text.includes('armoire') || text.includes('commode')) return 'Rangement';
    if (text.includes('meuble tv')) return 'Meuble TV';
    return 'Mobilier';
  };

  const detectSubcategory = (text: string): string => {
    if (text.includes('angle')) return 'Canapé d\'angle';
    if (text.includes('convertible')) return 'Canapé convertible';
    if (text.includes('basse')) return 'Table basse';
    if (text.includes('manger')) return 'Table à manger';
    if (text.includes('bureau')) return 'Chaise de bureau';
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

  const detectDimensions = (text: string): string => {
    const match = text.match(/(\d+)\s*[x×]\s*(\d+)(?:\s*[x×]\s*(\d+))?\s*cm/);
    return match ? match[0] : '';
  };

  const detectRoom = (text: string): string => {
    const rooms = ['salon', 'chambre', 'cuisine', 'bureau', 'salle à manger', 'entrée', 'terrasse'];
    for (const room of rooms) {
      if (text.includes(room)) return room;
    }
    return '';
  };

  const generateTags = (title: string, description: string): string[] => {
    const text = `${title} ${description}`.toLowerCase();
    const tags = new Set<string>();
    
    // Mots vides à exclure
    const stopWords = ['le', 'la', 'les', 'un', 'une', 'des', 'du', 'de', 'et', 'ou', 'avec', 'sans', 'pour', 'dans', 'sur', 'sous', 'par', 'ce', 'cette', 'ces', 'son', 'sa', 'ses'];
    
    // Extraire les mots significatifs du titre et de la description
    const words = text
      .replace(/[^\w\s]/g, ' ') // Supprimer la ponctuation
      .split(/\s+/)
      .filter(word => word.length > 2 && !stopWords.includes(word))
      .filter(word => !['cm', 'mm', 'kg', 'eur', 'euro', 'euros'].includes(word));
    
    // Ajouter les mots les plus fréquents comme tags
    const wordCount = new Map<string, number>();
    words.forEach(word => {
      wordCount.set(word, (wordCount.get(word) || 0) + 1);
    });
    
    // Prendre les 3-5 mots les plus fréquents
    const sortedWords = Array.from(wordCount.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([word]) => word);
    
    sortedWords.forEach(word => tags.add(word));
    
    // Ajouter des tags spécifiques basés sur le contenu
    if (text.includes('convertible')) tags.add('convertible');
    if (text.includes('rangement')) tags.add('rangement');
    if (text.includes('angle')) tags.add('angle');
    if (text.includes('moderne')) tags.add('moderne');
    if (text.includes('design')) tags.add('design');
    if (text.includes('scandinave')) tags.add('scandinave');
    if (text.includes('industriel')) tags.add('industriel');
    if (text.includes('vintage')) tags.add('vintage');
    if (text.includes('luxe')) tags.add('luxe');
    if (text.includes('premium')) tags.add('premium');
    
    return Array.from(tags).slice(0, 5);
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

  const generateAdHeadline = (name: string): string => {
    return name.substring(0, 30);
  };

  const generateAdDescription = (name: string, material: string): string => {
    let desc = name;
    if (material) desc += ` ${material}`;
    desc += '. Promo !';
    return desc.substring(0, 90);
  };

  const getGoogleCategory = (category: string): string => {
    const categoryMap: { [key: string]: string } = {
      'Canapé': '635',
      'Table': '443', 
      'Chaise': '436',
      'Lit': '569',
      'Rangement': '6552',
      'Meuble TV': '6552',
      'Décoration': '696',
      'Éclairage': '594'
    };
    return categoryMap[category] || '';
  };

  const calculateConfidence = (text: string): number => {
    let confidence = 30; // Base
    if (detectColor(text)) confidence += 20;
    if (detectMaterial(text)) confidence += 20;
    if (detectStyle(text)) confidence += 15;
    if (detectRoom(text)) confidence += 10;
    if (detectDimensions(text)) confidence += 5;
    return Math.min(confidence, 100);
  };

  const handleEnrichAll = async () => {
    setIsEnriching(true);
    showInfo('Enrichissement en cours', 'Analyse IA de tous les produits du catalogue...');
    
    try {
      // Simuler l'enrichissement IA
      await new Promise(resolve => setTimeout(resolve, 3000));
      
      // Recharger les produits enrichis
      await loadEnrichedProducts();
      
      showSuccess(
        'Enrichissement terminé',
        `${products.length} produits enrichis avec succès !`,
        [
          {
            label: 'Voir les résultats',
            action: () => setViewMode('grid'),
            variant: 'primary'
          }
        ]
      );
      
    } catch (error) {
      showError('Erreur d\'enrichissement', 'Impossible d\'enrichir les produits.');
    } finally {
      setIsEnriching(false);
    }
  };

  const handleSyncFromCatalog = async () => {
    showInfo('Synchronisation', 'Synchronisation du catalogue vers les produits enrichis...');
    
    try {
      // Charger les produits du catalogue normal ET imported_products
      const savedProducts = localStorage.getItem('catalog_products');
      let allProducts = [];
      
      if (savedProducts) {
        try {
          const catalogProducts = JSON.parse(savedProducts);
          allProducts = [...allProducts, ...catalogProducts];
          console.log('📦 Produits du catalogue chargés:', catalogProducts.length);
        } catch (error) {
          console.error('Erreur parsing catalogue:', error);
        }
      }
      
      // NOUVEAU: Forcer la synchronisation via Supabase
      try {
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
              source_filter: null // Tous les produits
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
                  action: () => window.location.reload(),
                  variant: 'primary'
                }
              ]
            );
            
            // Recharger les données
            await loadEnrichedProducts();
            return;
          } else {
            console.log('⚠️ Synchronisation Supabase échouée, fallback local');
          }
        }
      } catch (error) {
        console.log('⚠️ Erreur synchronisation Supabase:', error);
      }
      
      // Fallback: enrichissement local
      if (allProducts.length > 0) {
        const newEnrichedProducts = allProducts.map((product: any) => enrichProduct(product));
        
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
      case 'ai': return 'bg-purple-500/20 text-purple-300';
      case 'auto': return 'bg-blue-500/20 text-blue-300';
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
            Catalogue Enrichi IA
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
            onClick={handleEnrichAll}
            disabled={isEnriching}
            className="bg-gradient-to-r from-purple-500 to-pink-600 hover:from-purple-400 hover:to-pink-500 disabled:from-gray-600 disabled:to-gray-700 text-white px-4 py-2 rounded-xl flex items-center gap-2 font-semibold transition-all disabled:cursor-not-allowed"
          >
            {isEnriching ? (
              <>
                <Zap className="w-4 h-4 animate-spin" />
                Enrichissement...
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4" />
                Enrichir tout
              </>
            )}
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
          {/* Recherche */}
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
          
          {/* Bouton filtres */}
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-3 rounded-xl flex items-center gap-2 transition-all"
          >
            <Filter className="w-4 h-4" />
            Filtres IA
            {showFilters ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </button>
        </div>

        {/* Filtres étendus */}
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

      {/* Tableau des produits enrichis */}
      {viewMode === 'table' ? (
        <div className="bg-white/10 backdrop-blur-xl rounded-2xl border border-white/20 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-black/20">
                <tr>
                  <th className="text-left p-4 text-purple-300 font-semibold">Produit</th>
                  <th className="text-left p-4 text-purple-300 font-semibold">Prix & Promo</th>
                  <th className="text-left p-4 text-purple-300 font-semibold">Couleurs IA</th>
                  <th className="text-left p-4 text-purple-300 font-semibold">Matériaux IA</th>
                  <th className="text-left p-4 text-purple-300 font-semibold">Styles IA</th>
                  <th className="text-left p-4 text-purple-300 font-semibold">Fonctionnalités IA</th>
                  <th className="text-left p-4 text-purple-300 font-semibold">SEO Optimisé IA</th>
                  <th className="text-left p-4 text-purple-300 font-semibold">Confiance</th>
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
                          {product.dimensions && (
                            <div className="text-gray-500 text-xs">📏 {product.dimensions}</div>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="p-4">
                      <div className="flex items-center gap-2">
                        <span className="text-xl font-bold text-green-400">{product.price}€</span>
                        {product.compare_at_price && product.compare_at_price > product.price && (
                          <>
                            <span className="text-gray-400 line-through text-sm">{product.compare_at_price}€</span>
                            <span className="bg-red-500/20 text-red-300 px-2 py-1 rounded-full text-xs font-bold">
                              -{calculateDiscount(product.price, product.compare_at_price)}%
                            </span>
                          </>
                        )}
                      </div>
                    </td>
                    <td className="p-4">
                      <div className="flex flex-wrap gap-1">
                        {product.ai_attributes?.colors.map((color, index) => (
                          <span key={index} className="bg-pink-500/20 text-pink-300 px-2 py-1 rounded text-xs">
                            🎨 {color}
                          </span>
                        ))}
                        {(!product.ai_attributes?.colors || product.ai_attributes.colors.length === 0) && (
                          <span className="text-gray-500 text-xs">Aucune couleur détectée</span>
                        )}
                      </div>
                    </td>
                    <td className="p-4">
                      <div className="flex flex-wrap gap-1">
                        {product.ai_attributes?.materials.map((material, index) => (
                          <span key={index} className="bg-green-500/20 text-green-300 px-2 py-1 rounded text-xs">
                            🏗️ {material}
                          </span>
                        ))}
                        {(!product.ai_attributes?.materials || product.ai_attributes.materials.length === 0) && (
                          <span className="text-gray-500 text-xs">Aucun matériau détecté</span>
                        )}
                      </div>
                    </td>
                    <td className="p-4">
                      <div className="flex flex-wrap gap-1">
                        {product.ai_attributes?.styles.map((style, index) => (
                          <span key={index} className="bg-purple-500/20 text-purple-300 px-2 py-1 rounded text-xs">
                            ✨ {style}
                          </span>
                        ))}
                        {(!product.ai_attributes?.styles || product.ai_attributes.styles.length === 0) && (
                          <span className="text-gray-500 text-xs">Aucun style détecté</span>
                        )}
                      </div>
                    </td>
                    <td className="p-4">
                      <div className="space-y-1">
                        <div className="flex flex-wrap gap-1">
                          {product.ai_attributes?.features.map((feature, index) => (
                            <span key={index} className="bg-orange-500/20 text-orange-300 px-2 py-1 rounded text-xs">
                              ⚙️ {feature}
                            </span>
                          ))}
                        </div>
                        {product.ai_attributes?.room.map((room, index) => (
                          <span key={index} className="bg-blue-500/20 text-blue-300 px-2 py-1 rounded text-xs">
                            🏠 {room}
                          </span>
                        ))}
                        {(!product.ai_attributes?.features || product.ai_attributes.features.length === 0) && 
                         (!product.ai_attributes?.room || product.ai_attributes.room.length === 0) && (
                          <span className="text-gray-500 text-xs">Aucune fonctionnalité détectée</span>
                        )}
                      </div>
                    </td>
                    <td className="p-4">
                      <div className="space-y-1">
                        <div className="text-white text-xs font-medium line-clamp-1">{product.seo_optimized?.title || product.seo_title}</div>
                        <div className="text-gray-400 text-xs line-clamp-2">{product.seo_optimized?.description || product.seo_description}</div>
                        <div className="flex flex-wrap gap-1 mt-1">
                          {(product.seo_optimized?.tags || product.tags).slice(0, 3).map((tag, index) => (
                            <span key={index} className="bg-cyan-500/20 text-cyan-300 px-1 py-0.5 rounded text-xs">
                              #{tag}
                            </span>
                          ))}
                        </div>
                        {product.google_product_category && (
                          <div className="text-cyan-400 text-xs">Google: {product.google_product_category}</div>
                        )}
                      </div>
                    </td>
                    <td className="p-4">
                      <div className="text-center">
                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${getConfidenceColor(product.confidence_score)}`}>
                          {product.confidence_score}%
                        </span>
                        <div className={`text-xs mt-1 px-2 py-1 rounded ${getEnrichmentSourceColor(product.enrichment_source)}`}>
                          {product.enrichment_source}
                        </div>
                      </div>
                    </td>
                    <td className="p-4">
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleAnalyzeImage(product)}
                          className="text-purple-400 hover:text-purple-300 p-1"
                          title="Analyse Vision IA"
                        >
                          <Camera className="w-4 h-4" />
                        </button>
                        <a
                          href={product.product_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-400 hover:text-blue-300 p-1"
                          title="Ouvrir lien externe"
                        >
                          <ExternalLink className="w-4 h-4" />
                        </a>
                        <button
                          className="text-purple-400 hover:text-purple-300 p-1"
                          title="Modifier enrichissement"
                        >
                          <Edit className="w-4 h-4" />
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
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredProducts.map((product) => (
            <div key={product.id} className="bg-white/10 backdrop-blur-xl rounded-2xl p-4 border border-white/20 hover:border-purple-500/50 transition-all hover:scale-105">
              <div className="w-full h-48 rounded-xl overflow-hidden bg-gray-600 mb-4">
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
              
              <h3 className="font-semibold text-white mb-2 line-clamp-2">{product.title}</h3>
              <p className="text-gray-300 text-sm mb-3">{product.category} • {product.brand}</p>
              
              <div className="flex items-center gap-2 mb-3">
                <span className="text-xl font-bold text-green-400">{product.price}€</span>
                {product.compare_at_price && product.compare_at_price > product.price && (
                  <>
                    <span className="text-gray-400 line-through text-sm">{product.compare_at_price}€</span>
                    <span className="bg-red-500/20 text-red-300 px-2 py-1 rounded-full text-xs font-bold">
                      -{calculateDiscount(product.price, product.compare_at_price)}%
                    </span>
                  </>
                )}
                <span className={`px-2 py-1 rounded-full text-xs ${getConfidenceColor(product.confidence_score)}`}>
                  {product.confidence_score}%
                </span>
              </div>
              
              {/* Couleurs IA */}
              {product.ai_attributes?.colors && product.ai_attributes.colors.length > 0 && (
                <div className="bg-pink-500/20 rounded-xl p-3 mb-3 border border-pink-400/30">
                  <h4 className="text-pink-200 font-semibold text-xs mb-2">🎨 Couleurs IA ({product.ai_attributes.colors.length})</h4>
                  <div className="flex flex-wrap gap-1">
                    {product.ai_attributes.colors.map((color, index) => (
                      <span key={index} className="bg-pink-600/30 text-pink-200 px-2 py-1 rounded text-xs">
                        {color}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Matériaux IA */}
              {product.ai_attributes?.materials && product.ai_attributes.materials.length > 0 && (
                <div className="bg-green-500/20 rounded-xl p-3 mb-3 border border-green-400/30">
                  <h4 className="text-green-200 font-semibold text-xs mb-2">🏗️ Matériaux IA ({product.ai_attributes.materials.length})</h4>
                  <div className="flex flex-wrap gap-1">
                    {product.ai_attributes.materials.map((material, index) => (
                      <span key={index} className="bg-green-600/30 text-green-200 px-2 py-1 rounded text-xs">
                        {material}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Styles IA */}
              {product.ai_attributes?.styles && product.ai_attributes.styles.length > 0 && (
                <div className="bg-purple-500/20 rounded-xl p-3 mb-3 border border-purple-400/30">
                  <h4 className="text-purple-200 font-semibold text-xs mb-2">✨ Styles IA ({product.ai_attributes.styles.length})</h4>
                  <div className="flex flex-wrap gap-1">
                    {product.ai_attributes.styles.map((style, index) => (
                      <span key={index} className="bg-purple-600/30 text-purple-200 px-2 py-1 rounded text-xs">
                        {style}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Fonctionnalités IA */}
              {product.ai_attributes?.features && product.ai_attributes.features.length > 0 && (
                <div className="bg-orange-500/20 rounded-xl p-3 mb-3 border border-orange-400/30">
                  <h4 className="text-orange-200 font-semibold text-xs mb-2">⚙️ Fonctionnalités IA ({product.ai_attributes.features.length})</h4>
                  <div className="flex flex-wrap gap-1">
                    {product.ai_attributes.features.map((feature, index) => (
                      <span key={index} className="bg-orange-600/30 text-orange-200 px-2 py-1 rounded text-xs">
                        {feature}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Pièces IA */}
              {product.ai_attributes?.room && product.ai_attributes.room.length > 0 && (
                <div className="bg-blue-500/20 rounded-xl p-3 mb-3 border border-blue-400/30">
                  <h4 className="text-blue-200 font-semibold text-xs mb-2">🏠 Pièces IA ({product.ai_attributes.room.length})</h4>
                  <div className="flex flex-wrap gap-1">
                    {product.ai_attributes.room.map((room, index) => (
                      <span key={index} className="bg-blue-600/30 text-blue-200 px-2 py-1 rounded text-xs">
                        {room}
                      </span>
                    ))}
                  </div>
                </div>
              )}
              
              {/* SEO Preview */}
              <div className="bg-cyan-500/20 rounded-xl p-3 mb-4 border border-cyan-400/30">
                <h4 className="text-cyan-200 font-semibold text-xs mb-2">🔍 SEO Optimisé IA</h4>
                <div className="space-y-2">
                  <div>
                    <div className="text-cyan-300 text-xs font-medium">Titre SEO :</div>
                    <div className="text-white text-xs line-clamp-1">{product.seo_optimized?.title || product.seo_title}</div>
                  </div>
                  <div>
                    <div className="text-cyan-300 text-xs font-medium">Description SEO :</div>
                    <div className="text-gray-300 text-xs line-clamp-2">{product.seo_optimized?.description || product.seo_description}</div>
                  </div>
                  <div>
                    <div className="text-cyan-300 text-xs font-medium">Tags SEO :</div>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {(product.seo_optimized?.tags || product.tags).slice(0, 4).map((tag, index) => (
                        <span key={index} className="bg-cyan-600/30 text-cyan-200 px-1 py-0.5 rounded text-xs">
                          #{tag}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="flex gap-2">
                <button
                  onClick={() => handleAnalyzeImage(product)}
                  className="flex-1 bg-purple-600 hover:bg-purple-700 text-white py-2 rounded-lg flex items-center justify-center gap-1 text-sm"
                >
                  <Camera className="w-3 h-3" />
                  Vision IA
                </button>
                <a
                  href={product.product_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-2 rounded-lg flex items-center justify-center gap-1 text-sm"
                >
                  <ExternalLink className="w-3 h-3" />
                  Voir
                </a>
              </div>
            </div>
          ))}
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
              onClick={handleEnrichAll}
              className="bg-gradient-to-r from-purple-500 to-pink-600 hover:from-purple-400 hover:to-pink-500 text-white px-6 py-3 rounded-xl font-semibold transition-all"
            >
              Enrichir avec IA
            </button>
          </div>
        </div>
      )}

      {/* Modal Vision IA */}
      {showAIVisionModal && selectedProductForVision && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-800/95 backdrop-blur-xl rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto border border-slate-600/50">
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-slate-600/50">
              <h2 className="text-2xl font-bold text-white flex items-center gap-3">
                <Camera className="w-6 h-6 text-purple-400" />
                Vision IA - Analyse d'image
              </h2>
              <button
                onClick={() => {
                  setShowAIVisionModal(false);
                  setSelectedProductForVision(null);
                  setAiVisionAnalysis('');
                }}
                className="text-gray-400 hover:text-white transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="p-6 space-y-6">
              {/* Produit analysé */}
              <div className="bg-purple-500/20 rounded-xl p-4 border border-purple-400/30">
                <div className="flex items-center gap-4">
                  <div className="w-20 h-20 rounded-xl overflow-hidden bg-gray-600 flex-shrink-0">
                    <img 
                      src={selectedProductForVision.image_url} 
                      alt={selectedProductForVision.title}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        target.src = 'https://images.pexels.com/photos/1350789/pexels-photo-1350789.jpeg';
                      }}
                    />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-white mb-1">{selectedProductForVision.title}</h3>
                    <p className="text-purple-300">{selectedProductForVision.category} • {selectedProductForVision.brand}</p>
                    <div className="flex items-center gap-2 mt-2">
                      <span className="text-green-400 font-bold">{selectedProductForVision.price}€</span>
                      {selectedProductForVision.compare_at_price && selectedProductForVision.compare_at_price > selectedProductForVision.price && (
                        <>
                          <span className="text-gray-400 line-through text-sm">{selectedProductForVision.compare_at_price}€</span>
                          <span className="bg-red-500/20 text-red-300 px-2 py-1 rounded-full text-xs">
                            -{calculateDiscount(selectedProductForVision.price, selectedProductForVision.compare_at_price)}%
                          </span>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Image analysée */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div>
                  <h4 className="text-white font-semibold mb-3">📸 Image analysée :</h4>
                  <div className="w-full h-80 rounded-xl overflow-hidden bg-gray-600 border border-purple-400/30">
                    <img 
                      src={selectedProductForVision.image_url} 
                      alt={selectedProductForVision.title}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        target.src = 'https://images.pexels.com/photos/1350789/pexels-photo-1350789.jpeg';
                      }}
                    />
                  </div>
                </div>

                <div>
                  <h4 className="text-white font-semibold mb-3">🤖 Analyse Vision IA :</h4>
                  <div className="bg-black/40 rounded-xl p-4 border border-purple-400/30 h-80 overflow-y-auto">
                    {isAnalyzingVision ? (
                      <div className="flex flex-col items-center justify-center h-full">
                        <Loader2 className="w-12 h-12 text-purple-400 animate-spin mb-4" />
                        <p className="text-purple-300 text-center">
                          Analyse de l'image en cours avec OpenAI Vision...
                        </p>
                        <div className="flex items-center gap-2 mt-3">
                          <div className="w-2 h-2 bg-purple-400 rounded-full animate-bounce"></div>
                          <div className="w-2 h-2 bg-purple-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                          <div className="w-2 h-2 bg-purple-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                        </div>
                      </div>
                    ) : aiVisionAnalysis ? (
                      <div className="text-white text-sm leading-relaxed whitespace-pre-line">
                        {aiVisionAnalysis}
                      </div>
                    ) : (
                      <div className="flex items-center justify-center h-full text-gray-400">
                        <p>Cliquez sur "Analyser" pour démarrer l'analyse Vision IA</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="flex justify-between items-center pt-6 border-t border-slate-600/50">
                <div className="flex gap-3">
                  <button
                    onClick={() => handleAnalyzeImage(selectedProductForVision)}
                    disabled={isAnalyzingVision}
                    className="bg-gradient-to-r from-purple-500 to-pink-600 hover:from-purple-400 hover:to-pink-500 disabled:from-gray-600 disabled:to-gray-700 text-white px-6 py-3 rounded-xl font-semibold transition-all disabled:cursor-not-allowed flex items-center gap-2"
                  >
                    {isAnalyzingVision ? (
                      <>
                        <Loader2 className="w-5 h-5 animate-spin" />
                        Analyse...
                      </>
                    ) : (
                      <>
                        <Camera className="w-5 h-5" />
                        {aiVisionAnalysis ? 'Réanalyser' : 'Analyser'}
                      </>
                    )}
                  </button>
                  
                  <a
                    href={selectedProductForVision.product_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-xl font-semibold transition-all flex items-center gap-2"
                  >
                    <ExternalLink className="w-5 h-5" />
                    Voir le produit
                  </a>
                </div>
                
                <button
                  onClick={() => {
                    setShowAIVisionModal(false);
                    setSelectedProductForVision(null);
                    setAiVisionAnalysis('');
                  }}
                  className="bg-gray-600 hover:bg-gray-700 text-white px-6 py-3 rounded-xl transition-all"
                >
                  Fermer
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Statistiques d'enrichissement */}
      <div className="bg-gradient-to-r from-purple-500/20 to-pink-600/20 backdrop-blur-xl rounded-2xl p-6 border border-purple-400/30">
        <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
          <BarChart3 className="w-5 h-5 text-purple-400" />
          Statistiques d'enrichissement IA
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
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
            <div className="text-cyan-300 text-sm">Catégories détectées</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-orange-400">{colors.length + materials.length}</div>
            <div className="text-orange-300 text-sm">Attributs extraits</div>
          </div>
        </div>
      </div>
    </div>
  );
};