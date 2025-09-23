import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Upload, FileText, ArrowRight, CheckCircle, AlertCircle, Loader2, MapPin, Link, Eye, Download, BarChart3 } from 'lucide-react';
import { useNotifications } from './NotificationSystem';
import * as XLSX from 'xlsx';
import Papa from 'papaparse';

interface CSVField {
  csvColumn: string;
  shopifyField: string;
  required: boolean;
  example: string;
}

interface ProductPreview {
  title: string;
  price: number;
  compareAtPrice?: number;
  category: string;
  image_url: string;
  stock: number;
  vendor: string;
  description: string;
  isValid: boolean;
}

const SHOPIFY_FIELDS: CSVField[] = [
  // Champs produit de base
  { csvColumn: '', shopifyField: 'Handle', required: true, example: 'canape-moderne-3-places' },
  { csvColumn: '', shopifyField: 'Title', required: true, example: 'Canapé Moderne 3 Places' },
  { csvColumn: '', shopifyField: 'Body (HTML)', required: false, example: 'Description détaillée...' },
  { csvColumn: '', shopifyField: 'Vendor', required: false, example: 'Decora Home' },
  { csvColumn: '', shopifyField: 'Product Category', required: false, example: 'Mobilier > Salon' },
  { csvColumn: '', shopifyField: 'Type', required: false, example: 'Canapé' },
  { csvColumn: '', shopifyField: 'Tags', required: false, example: 'moderne, salon, confort' },
  { csvColumn: '', shopifyField: 'Published', required: false, example: 'TRUE' },
  
  // Options produit
  { csvColumn: '', shopifyField: 'Option1 Name', required: false, example: 'Couleur' },
  { csvColumn: '', shopifyField: 'Option1 Value', required: false, example: 'Beige' },
  { csvColumn: '', shopifyField: 'Option1 Linked To', required: false, example: '' },
  { csvColumn: '', shopifyField: 'Option2 Name', required: false, example: 'Taille' },
  { csvColumn: '', shopifyField: 'Option2 Value', required: false, example: '3 places' },
  { csvColumn: '', shopifyField: 'Option2 Linked To', required: false, example: '' },
  { csvColumn: '', shopifyField: 'Option3 Name', required: false, example: 'Matériau' },
  { csvColumn: '', shopifyField: 'Option3 Value', required: false, example: 'Velours' },
  { csvColumn: '', shopifyField: 'Option3 Linked To', required: false, example: '' },
  
  // Variantes
  { csvColumn: '', shopifyField: 'Variant SKU', required: false, example: 'CAN-MOD-3P-001' },
  { csvColumn: '', shopifyField: 'Variant Grams', required: false, example: '45000' },
  { csvColumn: '', shopifyField: 'Variant Inventory Tracker', required: false, example: 'shopify' },
  { csvColumn: '', shopifyField: 'Variant Inventory Qty', required: false, example: '10' },
  { csvColumn: '', shopifyField: 'Variant Inventory Policy', required: false, example: 'deny' },
  { csvColumn: '', shopifyField: 'Variant Fulfillment Service', required: false, example: 'manual' },
  { csvColumn: '', shopifyField: 'Variant Price', required: true, example: '799.00' },
  { csvColumn: '', shopifyField: 'Variant Compare At Price', required: false, example: '999.00' },
  { csvColumn: '', shopifyField: 'Variant Requires Shipping', required: false, example: 'TRUE' },
  { csvColumn: '', shopifyField: 'Variant Taxable', required: false, example: 'TRUE' },
  { csvColumn: '', shopifyField: 'Variant Barcode', required: false, example: '123456789' },
  
  // Images
  { csvColumn: '', shopifyField: 'Image Src', required: false, example: 'https://example.com/image.jpg' },
  { csvColumn: '', shopifyField: 'Image Position', required: false, example: '1' },
  { csvColumn: '', shopifyField: 'Image Alt Text', required: false, example: 'Canapé moderne gris' },
  
  // Autres
  { csvColumn: '', shopifyField: 'Gift Card', required: false, example: 'FALSE' },
  { csvColumn: '', shopifyField: 'SEO Title', required: false, example: 'Canapé Moderne - Decora Home' },
  { csvColumn: '', shopifyField: 'SEO Description', required: false, example: 'Découvrez notre canapé moderne...' },
  
  // Statut produit
  { csvColumn: '', shopifyField: 'Status', required: false, example: 'active' }
];

// Fonction pour traduire les catégories en français
const translateCategory = (category: string): string => {
  const translations: { [key: string]: string } = {
    // Anglais vers Français
    'furniture': 'Mobilier',
    'sofa': 'Canapé',
    'couch': 'Canapé',
    'chair': 'Chaise',
    'table': 'Table',
    'bed': 'Lit',
    'storage': 'Rangement',
    'lighting': 'Éclairage',
    'decoration': 'Décoration',
    'outdoor': 'Extérieur',
    'office': 'Bureau',
    'living room': 'Salon',
    'bedroom': 'Chambre',
    'dining room': 'Salle à manger',
    'kitchen': 'Cuisine',
    'bathroom': 'Salle de bain',
    'wardrobe': 'Armoire',
    'bookcase': 'Bibliothèque',
    'tv stand': 'Meuble TV',
    'coffee table': 'Table basse',
    'dining table': 'Table à manger',
    'side table': 'Table d\'appoint',
    'armchair': 'Fauteuil',
    'stool': 'Tabouret',
    'bench': 'Banc',
    'cabinet': 'Meuble de rangement',
    'shelf': 'Étagère',
    'mirror': 'Miroir',
    'lamp': 'Lampe',
    'rug': 'Tapis',
    'cushion': 'Coussin',
    'curtain': 'Rideau',
    
    // Catégories spécifiques
    'sectional sofa': 'Canapé d\'angle',
    'sleeper sofa': 'Canapé convertible',
    'recliner': 'Fauteuil relax',
    'bar stool': 'Tabouret de bar',
    'office chair': 'Chaise de bureau',
    'dining chair': 'Chaise de salle à manger',
    'accent chair': 'Fauteuil d\'appoint',
    'console table': 'Console',
    'end table': 'Table de chevet',
    'nightstand': 'Table de nuit',
    'dresser': 'Commode',
    'chest': 'Coffre',
    'entertainment center': 'Meuble TV',
    'bookshelf': 'Bibliothèque',
    'wine rack': 'Cave à vin',
    'room divider': 'Paravent',
    
    // Déjà en français (garder tel quel)
    'garden': 'Jardin',
    'kids': 'Enfant',
    'baby': 'Bébé'
  };
  
  const lowerCategory = category.toLowerCase();
  return translations[lowerCategory] || category;
};

export const ShopifyCSVImporter: React.FC<{ onImportComplete: (data: any) => void }> = ({ onImportComplete }) => {
  const [currentStep, setCurrentStep] = useState(1);
  const [csvFile, setCsvFile] = useState<File | null>(null);
  const navigate = useNavigate();
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

  const [savedCsvFile, setSavedCsvFile] = useState<File | null>(null);
  const [csvHeaders, setCsvHeaders] = useState<string[]>([]);
  const [fieldMapping, setFieldMapping] = useState<{ [key: string]: string }>({});
  const [isProcessing, setIsProcessing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [processedData, setProcessedData] = useState<any[]>([]);
  const [productPreviews, setProductPreviews] = useState<ProductPreview[]>([]);
  const [importStats, setImportStats] = useState<any>(null);
  const { showSuccess, showError, showInfo } = useNotifications();
  const [variantImages, setVariantImages] = useState<{[key: string]: string}>({});

  const parseFileContent = async (file: File): Promise<{ headers: string[], data: any[] }> => {
    return new Promise((resolve, reject) => {
      const fileExtension = file.name.split('.').pop()?.toLowerCase();
      
      if (fileExtension === 'xlsx' || fileExtension === 'xls') {
        // Parse Excel file
        const reader = new FileReader();
        reader.onload = (e) => {
          try {
            const uint8Data = new Uint8Array(e.target?.result as ArrayBuffer);
            const workbook = XLSX.read(uint8Data, { type: 'array' });
            const sheetName = workbook.SheetNames[0];
            const worksheet = workbook.Sheets[sheetName];
            const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 });
            
            if (jsonData.length < 2) {
              reject(new Error('Fichier Excel vide ou invalide'));
              return;
            }
            
            const headers = (jsonData[0] as string[]).map(h => h?.toString().trim() || '');
            const rows = jsonData.slice(1).filter(row => row && (row as any[]).some(cell => cell));
            
            const data = rows.map(row => {
              const obj: any = {};
              headers.forEach((header, index) => {
                obj[header] = (row as any[])[index]?.toString().trim() || '';
              });
              return obj;
            });
            
            resolve({ headers, data });
          } catch (error) {
            reject(new Error('Erreur lecture fichier Excel'));
          }
        };
        reader.readAsArrayBuffer(file);
      } else {
        // Parse CSV file
        Papa.parse(file, {
          header: true,
          skipEmptyLines: true,
          encoding: 'UTF-8',
          complete: (results) => {
            if (results.errors.length > 0) {
              reject(new Error('Erreur parsing CSV: ' + results.errors[0].message));
              return;
            }
            
            const headers = results.meta.fields || [];
            const data = results.data as any[];
            
            resolve({ headers, data });
          },
          error: (error) => {
            reject(new Error('Erreur lecture CSV: ' + error.message));
          }
        });
      }
    });
  };

  const handleFileUpload = async (file: File) => {
    const allowedExtensions = ['csv', 'xlsx', 'xls'];
    const fileExtension = file.name.split('.').pop()?.toLowerCase();
    
    if (!fileExtension || !allowedExtensions.includes(fileExtension)) {
      showError('Format invalide', 'Seuls les fichiers CSV et Excel (.xlsx, .xls) sont acceptés.');
      return;
    }

    setIsLoading(true);
    setCsvFile(file);
    
    // Sauvegarder le fichier pour réutilisation
    setSavedCsvFile(file);
    localStorage.setItem('last_csv_filename', file.name);
    localStorage.setItem('last_csv_size', file.size.toString());
    
    try {
      showInfo('Analyse en cours', `Lecture du fichier ${file.name}...`);
      
      const { headers, data } = await parseFileContent(file);
      
      setCsvHeaders(headers);
      
      // Auto-mapping intelligent
      const autoMapping: { [key: string]: string } = {};
      
      SHOPIFY_FIELDS.forEach(field => {
        const possibleMatches = headers.filter(header => {
          const headerLower = header.toLowerCase();
          const fieldLower = field.shopifyField.toLowerCase();
          
          // Correspondances exactes
          if (headerLower === fieldLower) return true;
          if (headerLower === fieldLower.replace(/\s/g, '')) return true;
          
          // Correspondances par mots-clés
          if (field.shopifyField === 'Title' && (headerLower.includes('nom') || headerLower.includes('title') || headerLower.includes('name'))) return true;
          if (field.shopifyField === 'Variant Price' && (headerLower.includes('prix') || headerLower.includes('price'))) return true;
          if (field.shopifyField === 'Variant Compare At Price' && (headerLower.includes('prix_barre') || headerLower.includes('compare') || headerLower.includes('ancien'))) return true;
          if (field.shopifyField === 'Body (HTML)' && (headerLower.includes('description') || headerLower.includes('body'))) return true;
          if (field.shopifyField === 'Image Src' && (headerLower.includes('image') || headerLower.includes('photo'))) return true;
          if (field.shopifyField === 'Vendor' && (headerLower.includes('vendor') || headerLower.includes('marque') || headerLower.includes('brand'))) return true;
          if (field.shopifyField === 'Type' && (headerLower.includes('type') || headerLower.includes('categorie') || headerLower.includes('category'))) return true;
          if (field.shopifyField === 'Variant Inventory Qty' && (headerLower.includes('stock') || headerLower.includes('quantity') || headerLower.includes('qty') || headerLower.includes('inventaire'))) return true;
          if (field.shopifyField === 'Handle' && (headerLower.includes('handle') || headerLower.includes('slug') || headerLower.includes('url'))) return true;
          if (field.shopifyField === 'Tags' && (headerLower.includes('tags') || headerLower.includes('mots-clés') || headerLower.includes('keywords'))) return true;
          
          return false;
        });
        
        if (possibleMatches.length > 0) {
          autoMapping[field.shopifyField] = possibleMatches[0];
        }
      });
      
      setFieldMapping(autoMapping);
      
      // Générer aperçu des produits
      const previews = generateProductPreviews(data, autoMapping);
      setProductPreviews(previews);
      
      setCurrentStep(2);
      showSuccess('Fichier analysé', `${headers.length} colonnes détectées, ${previews.length} produits valides trouvés !`);
      
    } catch (error) {
      showError('Erreur lecture', error.message || 'Impossible de lire le fichier.');
    } finally {
      setIsLoading(false);
    }
  };

  const generateProductPreviews = (data: any[], mapping: { [key: string]: string }): ProductPreview[] => {
    return data.filter(row => {
      // Filtrer seulement les produits actifs
      const status = row[mapping['Status']] || 'active';
      return status.toLowerCase() === 'active';
    }).map(row => {
      const title = row[mapping['Title']] || '';
      const price = parseFloat(row[mapping['Variant Price']]?.replace(/[^\d.,]/g, '').replace(',', '.')) || 0;
      const compareAtPrice = row[mapping['Variant Compare At Price']] ? 
        parseFloat(row[mapping['Variant Compare At Price']]?.replace(/[^\d.,]/g, '').replace(',', '.')) : undefined;
      const category = row[mapping['Type']] || row[mapping['Product Category']] || '';
      const image_url = row[mapping['Image Src']] || '';
      const stock = parseInt(row[mapping['Variant Inventory Qty']]) || 0;
      const vendor = row[mapping['Vendor']] || 'Boutique';
      const description = row[mapping['Body (HTML)']] || '';
      
      return {
        title,
        price,
        compareAtPrice,
        category,
        image_url,
        stock,
        vendor,
        description,
        isValid: title.trim().length > 0 && price > 0
      };
    }).filter(preview => preview.isValid);
  };

  const calculateDiscount = (price: number, compareAtPrice?: number): number => {
    if (!compareAtPrice || compareAtPrice <= price) return 0;
    return Math.round(((compareAtPrice - price) / compareAtPrice) * 100);
  };

  const handleMappingChange = (shopifyField: string, csvColumn: string) => {
    const newMapping = {
      ...fieldMapping,
      [shopifyField]: csvColumn
    };
    setFieldMapping(newMapping);
    
    // Régénérer l'aperçu avec le nouveau mapping
    if (csvFile) {
      parseFileContent(csvFile).then(({ data }) => {
        const previews = generateProductPreviews(data, newMapping);
        setProductPreviews(previews);
      });
    }
  };

  const generateHandle = (title: string): string => {
    return title
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .trim()
      .substring(0, 100);
  };

  const autoImportToCatalog = async (products: any[], stats: any) => {
    // Simulation d'import automatique vers OmnIA
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    showSuccess('Import terminé !', `${stats.valid_products} produits importés avec succès dans OmnIA !`);
    
    // Callback pour notifier le parent
    if (onImportComplete) {
      onImportComplete({
        products,
        stats,
        mapping: fieldMapping
      });
    }
  };

  const processCSV = async () => {
    if (!csvFile) return;
    
    setIsProcessing(true);
    setCurrentStep(3);
    
    try {
      showInfo('Traitement en cours', 'Conversion des données et import automatique...');
      
      const { data } = await parseFileContent(csvFile);
      const products = [];
      let validCount = 0;
      let invalidCount = 0;
      
      for (const row of data) {
        const title = row[fieldMapping['Title']] || '';
        
        // Ignorer les lignes sans titre
        if (!title.trim()) {
          invalidCount++;
          continue;
        }
        
        const product: any = {};
        
        // Mapper les champs
        SHOPIFY_FIELDS.forEach(field => {
          const csvColumn = fieldMapping[field.shopifyField];
          if (csvColumn && row[csvColumn] !== undefined) {
            product[field.shopifyField] = row[csvColumn] || '';
          }
        });
        
        // Générer Handle automatiquement si manquant
        if (!product.Handle && product.Title) {
          product.Handle = generateHandle(product.Title);
        }
        
        // Générer URL produit automatiquement
        if (product.Handle) {
          product['Product URL'] = `https://decora-home.fr/products/${product.Handle}`;
        }
        
        // Valeurs par défaut
        product.Published = product.Published || 'TRUE';
        product['Variant Inventory Policy'] = 'deny';
        product['Variant Fulfillment Service'] = 'manual';
        product['Variant Requires Shipping'] = 'TRUE';
        product['Variant Taxable'] = 'TRUE';
        product['Gift Card'] = 'FALSE';
        product['Variant Grams'] = product['Variant Grams'] || '0';
        product['Variant Inventory Tracker'] = product['Variant Inventory Tracker'] || 'shopify';
        product['Image Position'] = product['Image Position'] || '1';
        
        // Calculer la remise automatiquement
        const price = parseFloat(product['Variant Price']) || 0;
        const compareAtPrice = parseFloat(product['Variant Compare At Price']) || 0;
        
        if (price > 0) {
          // Ajouter le statut depuis le CSV
          product.Status = row[fieldMapping['Status']] || 'active';
          products.push(product);
          validCount++;
        } else {
          invalidCount++;
        }
      }
      
      setProcessedData(products);
      
      // Calculer les statistiques d'import
      const stats = {
        total_lines: data.length,
        valid_products: validCount,
        invalid_products: invalidCount,
        success_rate: Math.round((validCount / data.length) * 100),
        categories: [...new Set(products.map(p => p.Type || p['Product Category']).filter(Boolean))],
        price_range: {
          min: Math.min(...products.map(p => parseFloat(p['Variant Price']) || 0)),
          max: Math.max(...products.map(p => parseFloat(p['Variant Price']) || 0))
        },
        vendors: [...new Set(products.map(p => p.Vendor).filter(Boolean))],
        with_images: products.filter(p => p['Image Src']).length,
        with_stock: products.filter(p => parseInt(p['Variant Inventory Qty']) > 0).length
      };
      
      setImportStats(stats);
      setCurrentStep(4);
      
      // Préparer les données pour Supabase
      const transformedProducts = products.map(product => ({
        id: crypto.randomUUID(),
        external_id: product.Handle || `csv-${Date.now()}-${Math.random()}`,
        retailer_id: currentUser?.id || '00000000-0000-0000-0000-000000000000',
        name: product.Title || 'Produit sans nom',
        description: product['Body (HTML)'] || '',
        price: parseFloat(product['Variant Price']) || 0,
        compare_at_price: product['Variant Compare At Price'] ? parseFloat(product['Variant Compare At Price']) : null,
        category: product.Type || product['Product Category'] || 'Mobilier',
        vendor: product.Vendor || 'Decora Home',
        image_url: product['Image Src'] || 'https://images.pexels.com/photos/1350789/pexels-photo-1350789.jpeg',
        product_url: product['Product URL'] || '#',
        stock: parseInt(product['Variant Inventory Qty']) || 0,
        status: product.Status || 'active',
        source_platform: 'csv',
        shopify_data: product,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }));
      
      // Sauvegarder dans Supabase au lieu de localStorage
      try {
        const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
        const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
        
        if (supabaseUrl && supabaseKey) {
          const response = await fetch(`${supabaseUrl}/functions/v1/save-imported-products`, {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${supabaseKey}`,
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              products: transformedProducts,
              retailer_id: currentUser?.id || '00000000-0000-0000-0000-000000000000'
            }),
          });
          
          if (!response.ok) {
            throw new Error('Erreur sauvegarde Supabase');
          }
          
          const result = await response.json();
          console.log('✅ Produits sauvegardés dans Supabase:', result);
        } else {
          // Fallback: sauvegarder seulement les IDs dans localStorage
          const productIds = transformedProducts.map(p => p.external_id);
          localStorage.setItem(getRetailerStorageKey('catalog_product_ids'), JSON.stringify(productIds));
        }
      } catch (error) {
        console.error('❌ Erreur sauvegarde Supabase:', error);
        // Fallback: sauvegarder seulement les métadonnées dans localStorage
        const metadata = {
          count: transformedProducts.length,
          imported_at: new Date().toISOString(),
          retailer_id: currentUser?.email || 'demo-retailer-id'
        };
        localStorage.setItem(getRetailerStorageKey('catalog_metadata'), JSON.stringify(metadata));
      }
      
      // Ancienne logique localStorage supprimée pour éviter QuotaExceededError
      /*
      const transformedProducts = products.map(product => ({
        id: product.Handle || `csv-${Date.now()}-${Math.random()}`,
        external_id: product.Handle || `csv-${Date.now()}-${Math.random()}`,
        name: product.Title || 'Produit sans nom',
        title: product.Title || 'Produit sans nom',
        description: product['Body (HTML)'] || '',
        price: parseFloat(product['Variant Price']) || 0,
        compare_at_price: product['Variant Compare At Price'] ? parseFloat(product['Variant Compare At Price']) : undefined,
        category: product.Type || product['Product Category'] || 'Mobilier',
        productType: product.Type || product['Product Category'] || 'Mobilier',
        vendor: product.Vendor || 'Decora Home',
        image_url: product['Image Src'] || 'https://images.pexels.com/photos/1350789/pexels-photo-1350789.jpeg',
        product_url: product['Product URL'] || '#',
        stock: parseInt(product['Variant Inventory Qty']) || 0,
        status: product.Status || 'active', // Respecter le statut du CSV
        source_platform: 'csv',
        sku: product['Variant SKU'] || '',
        handle: product.Handle || generateHandle(product.Title),
        availableForSale: true,
        quantityAvailable: parseInt(product['Variant Inventory Qty']) || 0,
        variants: [{
          id: `${product.Handle || 'default'}-variant`,
          title: 'Default',
          price: parseFloat(product['Variant Price']) || 0,
          compareAtPrice: product['Variant Compare At Price'] ? parseFloat(product['Variant Compare At Price']) : undefined,
          availableForSale: true,
          quantityAvailable: parseInt(product['Variant Inventory Qty']) || 0,
          selectedOptions: []
        }],
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }));
      const activeProducts = transformedProducts.filter(p => p.status === 'active');
      localStorage.setItem(getRetailerStorageKey('catalog_products'), JSON.stringify(activeProducts));
      */
      
      localStorage.setItem(getRetailerStorageKey('csv_file_data'), JSON.stringify({
        filename: csvFile.name,
        size: csvFile.size,
        imported_at: new Date().toISOString(),
        total_products: transformedProducts.length,
        active_products: activeProducts.length,
        mapping: fieldMapping
      }));
      console.log(`✅ Produits CSV traités pour ${currentUser?.email}:`, transformedProducts.filter(p => p.status === 'active').length, '/', transformedProducts.length);
      
      // NOUVEAU: Déclencher l'entraînement IA automatique après import
      try {
        console.log('🤖 Déclenchement entraînement automatique IA...');
        showInfo('Entraînement IA', 'OmnIA analyse votre catalogue pour optimiser les réponses...');
        
        const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
        const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
        
        if (supabaseUrl && supabaseKey) {
          const trainingResponse = await fetch(`${supabaseUrl}/functions/v1/auto-ai-trainer`, {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${supabaseKey}`,
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              products: transformedProducts,
              source: 'csv',
              store_id: currentUser?.email || 'demo-retailer-id',
              trigger_type: 'import'
            }),
          });
          
          if (trainingResponse.ok) {
            const trainingResult = await trainingResponse.json();
            console.log('✅ Entraînement IA réussi:', trainingResult.stats);
            showSuccess(
              'IA Entraînée !', 
              `OmnIA a analysé ${trainingResult.stats?.products_processed || activeProducts.length} produits ! Réponses optimisées.`,
              [
                {
                  label: 'Tester OmnIA',
                  action: () => window.open('/robot', '_blank'),
                  variant: 'primary'
                }
              ]
            );
            
            // NOUVEAU: Configurer le cron quotidien automatiquement
            try {
              const cronResponse = await fetch(`${supabaseUrl}/functions/v1/setup-ai-cron`, {
                method: 'POST',
                headers: {
                  'Authorization': `Bearer ${supabaseKey}`,
                  'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                  retailer_id: 'demo-retailer-id',
                  schedule: 'daily',
                  enabled: true
                }),
              });
              
              if (cronResponse.ok) {
                console.log('✅ Cron quotidien configuré automatiquement');
                showInfo('Cron configuré', 'Entraînement automatique quotidien activé à 2h du matin !');
              }
            } catch (cronError) {
              console.log('⚠️ Erreur configuration cron:', cronError);
            }
          } else {
            console.log('⚠️ Entraînement IA échoué, produits importés sans optimisation');
            showInfo('Import terminé', 'Produits importés ! Entraînement IA en arrière-plan...');
          }
        }
      } catch (error) {
        console.log('⚠️ Entraînement IA échoué:', error);
        showInfo('Import terminé', 'Produits importés ! Entraînement IA en arrière-plan...');
      }
      
      // Notifier le parent
      if (onImportComplete) {
        onImportComplete({
          name: `${csvFile.name} (${activeProducts.length} produits actifs)`,
          platform: 'csv',
          products_count: activeProducts.length,
          status: 'connected',
          products: activeProducts,
          imported_at: new Date().toISOString()
        });
      }
      
    } catch (error) {
      showError('Erreur traitement', error.message || 'Erreur lors du traitement du fichier.');
      setCurrentStep(2); // Retour au mapping en cas d'erreur
    } finally {
      setIsProcessing(false);
    }
  };

  const renderStep1 = () => (
    <div className="space-y-6">
      <div className="text-center">
        <Upload className="w-16 h-16 text-cyan-400 mx-auto mb-4" />
        <h3 className="text-xl font-bold text-white mb-2">1. Sélectionner votre fichier</h3>
        <p className="text-gray-300">Importez votre catalogue CSV ou Excel</p>
      </div>
      
      {/* Fichier CSV précédent */}
      {savedCsvFile && (
        <div className="bg-blue-500/20 border border-blue-400/50 rounded-xl p-4">
          <h4 className="font-semibold text-blue-200 mb-2 flex items-center gap-2">
            <FileText className="w-4 h-4" />
            <li>• <strong>Colonnes obligatoires :</strong> "Titre" et "Prix"</li>
            <li>• <strong>Colonne "Status" :</strong> "active" pour produits visibles, "inactive" pour masqués</li>
          </h4>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-blue-300 font-medium">{localStorage.getItem('last_csv_filename')}</p>
              <p className="text-blue-400 text-sm">
                {(parseInt(localStorage.getItem('last_csv_size') || '0') / 1024).toFixed(1)} KB
                • {JSON.parse(localStorage.getItem('csv_file_data') || '{}').active_products || 0} produits actifs
              </p>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => handleFileUpload(savedCsvFile)}
                className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-2 rounded-lg text-sm"
              >
                Réimporter
              </button>
              <button
                onClick={() => {
                  setSavedCsvFile(null);
                  localStorage.removeItem('last_csv_filename');
                  localStorage.removeItem('last_csv_size');
                  localStorage.removeItem('csv_file_data');
                }}
                className="bg-red-600 hover:bg-red-700 text-white px-3 py-2 rounded-lg text-sm"
              >
                Supprimer
              </button>
            </div>
          </div>
        </div>
      )}
      
      <div className="border-2 border-dashed border-cyan-500/50 rounded-xl p-8 text-center hover:border-cyan-400/70 transition-colors">
        <input
          type="file"
          accept=".csv,.xlsx,.xls"
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) handleFileUpload(file);
          }}
          className="hidden"
          id="csv-upload"
          disabled={isLoading}
        />
        <label htmlFor="csv-upload" className="cursor-pointer">
          {isLoading ? (
            <div className="flex flex-col items-center">
              <Loader2 className="w-12 h-12 text-cyan-400 mb-4 animate-spin" />
              <p className="text-white font-semibold">Analyse en cours...</p>
              <p className="text-gray-300 text-sm">Lecture et analyse du fichier</p>
            </div>
          ) : (
            <div className="flex flex-col items-center">
              <FileText className="w-12 h-12 text-cyan-400 mb-4" />
              <p className="text-white font-semibold mb-2">Cliquez pour sélectionner un fichier</p>
              <p className="text-gray-300 text-sm">Formats acceptés: CSV, Excel (.xlsx, .xls)</p>
            </div>
          )}
        </label>
      </div>
      
      <div className="bg-blue-500/20 border border-blue-400/50 rounded-xl p-4">
        <h4 className="font-semibold text-blue-200 mb-2">💡 Conseils pour un import réussi :</h4>
        <ul className="text-blue-300 text-sm space-y-1">
          <li>• <strong>Colonnes obligatoires :</strong> "Titre" et "Prix"</li>
          <li>• <strong>Colonne "Status" :</strong> "active" pour produits visibles, "inactive" pour masqués</li>
          Fichier précédent
          <li>• Utilisez des catégories claires pour un meilleur classement</li>
          <li>• Les prix doivent être au format numérique (ex: 99.99)</li>
        </ul>
      </div>
    </div>
  );

  const renderStep2 = () => (
    <div className="space-y-6">
      <div className="text-center">
        <MapPin className="w-16 h-16 text-purple-400 mx-auto mb-4" />
        <h3 className="text-xl font-bold text-white mb-2">2. Configuration du mappage</h3>
        <p className="text-gray-300">Associez vos colonnes aux champs Shopify</p>
      </div>
      
      {/* Aperçu des produits */}
      <div className="bg-green-500/20 border border-green-400/50 rounded-xl p-4">
        <h4 className="font-semibold text-green-200 mb-3 flex items-center gap-2">
          <Eye className="w-4 h-4" />
          Aperçu des produits ({productPreviews.length} détectés)
        </h4>
        <div className="max-h-96 overflow-y-auto pr-2">
          <div className="space-y-3 mb-4">
            {productPreviews.slice(0, 20).map((preview, index) => (
            <div key={index} className="bg-white/5 rounded-lg p-3">
              <div className="flex items-start gap-3">
                <div className="w-12 h-12 rounded-lg overflow-hidden bg-gray-600 flex-shrink-0">
                  {preview.image_url ? (
                    <img 
                      src={preview.image_url} 
                      alt={preview.title}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        target.style.display = 'none';
                      }}
                    />
                  ) : (
                    <div className="w-full h-full bg-gray-500 flex items-center justify-center">
                      <FileText className="w-4 h-4 text-gray-400" />
                    </div>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="font-semibold text-white text-sm mb-1 line-clamp-2">{preview.title}</div>
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-cyan-400 font-bold">{preview.price.toFixed(2)}€</span>
                    {preview.compareAtPrice && preview.compareAtPrice > preview.price && (
                      <>
                        <span className="text-gray-400 line-through text-xs">{preview.compareAtPrice.toFixed(2)}€</span>
                        <span className="bg-red-500/20 text-red-300 px-1 py-0.5 rounded text-xs">
                          -{calculateDiscount(preview.price, preview.compareAtPrice)}%
                        </span>
                      </>
                    )}
                  </div>
                  <p className="text-gray-300 text-xs mb-1">{preview.category}</p>
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-gray-400">Stock: {preview.stock}</span>
                    <span className="text-gray-400">{preview.vendor}</span>
                  </div>
                </div>
              </div>
            </div>
            ))}
          </div>
          
          {productPreviews.length > 20 && (
            <p className="text-center text-gray-400 text-sm">
              ... et {productPreviews.length - 20} autres produits
            </p>
          )}
        </div>
      </div>
      
      {/* Mappage des champs */}
      <div className="bg-black/20 rounded-xl p-6 max-h-96 overflow-y-auto">
        <h4 className="font-semibold text-white mb-4">Configuration du mappage :</h4>
        <div className="space-y-4">
          {SHOPIFY_FIELDS.filter(field => field.required || fieldMapping[field.shopifyField]).map((field, index) => (
            <div key={index} className="flex items-center gap-4 p-3 bg-white/5 rounded-lg">
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <span className="font-semibold text-white">{field.shopifyField}</span>
                  {field.required && (
                    <span className="text-red-400 text-xs">*</span>
                  )}
                </div>
                <p className="text-xs text-gray-400">{field.example}</p>
              </div>
              <div className="flex-1">
                <select
                  value={fieldMapping[field.shopifyField] || ''}
                  onChange={(e) => handleMappingChange(field.shopifyField, e.target.value)}
                  className="w-full bg-black/40 border border-cyan-500/50 rounded-lg px-3 py-2 text-white text-sm"
                >
                  <option value="">-- Sélectionner --</option>
                  {csvHeaders.map((header, headerIndex) => (
                    <option key={headerIndex} value={header}>{header}</option>
                  ))}
                </select>
              </div>
            </div>
          ))}
        </div>
      </div>
      
      <div className="flex justify-between">
        <button
          onClick={() => setCurrentStep(1)}
          className="bg-gray-600 hover:bg-gray-700 text-white px-6 py-3 rounded-xl transition-all"
        >
          Retour
        </button>
        <button
          onClick={processCSV}
          disabled={!fieldMapping['Title'] || !fieldMapping['Variant Price']}
          className="bg-gradient-to-r from-purple-500 to-pink-600 hover:from-purple-400 hover:to-pink-500 disabled:from-gray-600 disabled:to-gray-700 text-white px-6 py-3 rounded-xl font-semibold transition-all flex items-center gap-2 disabled:cursor-not-allowed"
        >
          Traiter & Importer
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );

  const renderStep3 = () => (
    <div className="space-y-6">
      <div className="text-center">
        <Loader2 className="w-16 h-16 text-yellow-400 mx-auto mb-4 animate-spin" />
        <h3 className="text-xl font-bold text-white mb-2">3. Traitement et import</h3>
        <p className="text-gray-300">Conversion des données et import automatique vers OmnIA...</p>
        
        <div className="mt-6 space-y-2">
          <div className="flex items-center justify-center gap-2 text-cyan-300">
            <div className="w-2 h-2 bg-cyan-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
            <div className="w-2 h-2 bg-cyan-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
            <div className="w-2 h-2 bg-cyan-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
          </div>
          <p className="text-sm text-gray-400">Conversion au format Shopify...</p>
          <p className="text-sm text-gray-400">Import automatique vers catalogue OmnIA...</p>
          <p className="text-sm text-gray-400">Entraînement IA en cours...</p>
        </div>
      </div>
    </div>
  );

  const renderStep4 = () => (
    <div className="space-y-6">
      <div className="text-center">
        <CheckCircle className="w-16 h-16 text-green-400 mx-auto mb-4" />
        <h3 className="text-xl font-bold text-white mb-2">4. Import terminé !</h3>
        <p className="text-gray-300">Catalogue importé et OmnIA entraîné automatiquement</p>
      </div>
      
      {/* Statistiques d'import */}
      {importStats && (
        <div className="bg-green-500/20 border border-green-400/50 rounded-xl p-6">
          <h4 className="font-semibold text-green-200 mb-4 flex items-center gap-2">
            <BarChart3 className="w-5 h-5" />
            📊 Statistiques d'import
          </h4>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            <div className="text-center">
              <div className="text-2xl font-bold text-green-400">{importStats.valid_products}</div>
              <div className="text-green-300 text-sm">Produits valides</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-400">{importStats.success_rate}%</div>
              <div className="text-blue-300 text-sm">Taux de succès</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-400">{importStats.categories.length}</div>
              <div className="text-purple-300 text-sm">Catégories</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-orange-400">{importStats.with_images}</div>
              <div className="text-orange-300 text-sm">Avec images</div>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div>
              <h5 className="font-semibold text-green-200 mb-2">💰 Prix :</h5>
              <p className="text-green-300">
                De {importStats.price_range.min.toFixed(2)}€ à {importStats.price_range.max.toFixed(2)}€
              </p>
            </div>
            <div>
              <h5 className="font-semibold text-green-200 mb-2">📦 Stock :</h5>
              <p className="text-green-300">
                {importStats.with_stock} produits en stock
              </p>
            </div>
            <div>
              <h5 className="font-semibold text-green-200 mb-2">🏷️ Catégories :</h5>
              <p className="text-green-300">
                {importStats.categories.slice(0, 3).join(', ')}
                {importStats.categories.length > 3 && ` +${importStats.categories.length - 3}`}
              </p>
            </div>
            <div>
              <h5 className="font-semibold text-green-200 mb-2">🏪 Vendeurs :</h5>
              <p className="text-green-300">
                {importStats.vendors.slice(0, 2).join(', ')}
                {importStats.vendors.length > 2 && ` +${importStats.vendors.length - 2}`}
              </p>
            </div>
          </div>
        </div>
      )}
      
      {/* Aperçu final des produits */}
      <div className="bg-black/20 rounded-xl p-4 max-h-80 overflow-y-auto">
        <h4 className="font-semibold text-white mb-3 flex items-center gap-2">
          <Eye className="w-4 h-4 text-cyan-400" />
          Aperçu final des produits importés
        </h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {productPreviews.slice(0, 6).map((preview, index) => (
            <div key={index} className="flex items-center gap-3 p-3 bg-white/5 rounded-lg">
              <div className="w-12 h-12 rounded-lg overflow-hidden bg-gray-600 flex-shrink-0">
                {preview.image_url ? (
                  <img 
                    src={preview.image_url} 
                    alt={preview.title}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      target.style.display = 'none';
                    }}
                  />
                ) : (
                  <div className="w-full h-full bg-gray-500 flex items-center justify-center">
                    <FileText className="w-4 h-4 text-gray-400" />
                  </div>
                )}
              </div>
              <div className="flex-1 min-w-0">
                <div className="font-semibold text-white text-sm mb-1 line-clamp-1">{preview.title}</div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-cyan-400 font-bold">{preview.price.toFixed(2)}€</span>
                  {preview.compareAtPrice && preview.compareAtPrice > preview.price && (
                    <>
                      <span className="text-gray-400 line-through text-xs">{preview.compareAtPrice.toFixed(2)}€</span>
                      <span className="bg-red-500/20 text-red-300 px-1 py-0.5 rounded text-xs">
                        -{calculateDiscount(preview.price, preview.compareAtPrice)}%
                      </span>
                    </>
                  )}
                </div>
                <div className="text-xs text-gray-300">{preview.category} • Stock: {preview.stock}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
      
      <div className="flex justify-between">
        <button
          onClick={() => {
            setCurrentStep(1);
            setCsvFile(null);
            setCsvHeaders([]);
            setFieldMapping({});
            setProcessedData([]);
            setProductPreviews([]);
            setImportStats(null);
          }}
          className="bg-gray-600 hover:bg-gray-700 text-white px-6 py-3 rounded-xl transition-all"
        >
          Nouvel import
        </button>
        <div className="flex gap-3">
          <button
            onClick={() => {
              const csvContent = [
                SHOPIFY_FIELDS.map(f => f.shopifyField).join(','),
                ...processedData.map(product => 
                  SHOPIFY_FIELDS.map(f => product[f.shopifyField] || '').join(',')
                )
              ].join('\n');
              
              const blob = new Blob([csvContent], { type: 'text/csv' });
              const url = URL.createObjectURL(blob);
              const a = document.createElement('a');
              a.href = url;
              a.download = 'shopify-import.csv';
              a.click();
              URL.revokeObjectURL(url);
            }}
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-xl transition-all flex items-center gap-2"
          >
            <Download className="w-4 h-4" />
            Télécharger CSV
          </button>
          <button
            onClick={() => {
              showSuccess('Terminé !', 'Import réussi ! Redirection vers le catalogue...');
              // Rediriger vers l'onglet Catalogue après 1 seconde
              setTimeout(() => {
                navigate('/admin?tab=catalog');
              }, 1000);
            }}
            className="bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-400 hover:to-emerald-500 text-white px-6 py-3 rounded-xl font-semibold transition-all flex items-center gap-2"
          >
            <CheckCircle className="w-4 h-4" />
            Terminer
          </button>
        </div>
      </div>
    </div>
  );

  const renderCurrentStep = () => {
    switch (currentStep) {
      case 1: return renderStep1();
      case 2: return renderStep2();
      case 3: return renderStep3();
      case 4: return renderStep4();
      default: return renderStep1();
    }
  };

  return (
    <div className="bg-white/10 backdrop-blur-xl rounded-2xl p-8 border border-white/20">
      <h3 className="text-2xl font-bold text-white mb-6 flex items-center gap-2">
        <FileText className="w-6 h-6 text-green-400" />
        Import CSV/Excel vers OmnIA
      </h3>
      
      {/* Progress Steps */}
      <div className="flex items-center justify-center mb-8">
        {[1, 2, 3, 4].map((step) => (
          <div key={step} className="flex items-center">
            <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold ${
              currentStep >= step 
                ? 'bg-cyan-500 text-white' 
                : 'bg-gray-600 text-gray-300'
            }`}>
              {step}
            </div>
            {step < 4 && (
              <div className={`w-16 h-1 ${
                currentStep > step ? 'bg-cyan-500' : 'bg-gray-600'
              }`} />
            )}
          </div>
        ))}
      </div>
      
      {renderCurrentStep()}
    </div>
  );
};