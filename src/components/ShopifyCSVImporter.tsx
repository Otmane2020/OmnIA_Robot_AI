import React, { useState, useRef } from 'react';
import { Upload, Download, FileText, CheckCircle, AlertCircle, Loader2, Eye, X, Package, BarChart3 } from 'lucide-react';
import { useNotifications } from './NotificationSystem';
import { supabase } from '../lib/supabase';

interface ShopifyCSVImporterProps {
  onImportComplete: (data: any) => void;
  retailerId?: string;
}

interface CSVProduct {
  Handle: string;
  Title: string;
  'Body (HTML)': string;
  Vendor: string;
  'Product Category': string;
  Type: string;
  Tags: string;
  Published: string;
  'Option1 Name': string;
  'Option1 Value': string;
  'Variant Price': string;
  'Variant Compare At Price': string;
  'Variant Inventory Qty': string;
  'Image Src': string;
  'Variant SKU': string;
}

export const ShopifyCSVImporter: React.FC<ShopifyCSVImporterProps> = ({ onImportComplete, retailerId }) => {
  const [csvFile, setCsvFile] = useState<File | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [processingStep, setProcessingStep] = useState('');
  const [csvData, setCsvData] = useState<CSVProduct[]>([]);
  const [showPreview, setShowPreview] = useState(false);
  const [previewData, setPreviewData] = useState<any[]>([]);
  const [importStats, setImportStats] = useState<any>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { showSuccess, showError, showInfo } = useNotifications();

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!file.name.endsWith('.csv')) {
      showError('Format invalide', 'Veuillez sélectionner un fichier CSV.');
      return;
    }

    setCsvFile(file);
    setIsProcessing(true);
    setProcessingStep('Lecture du fichier CSV...');

    try {
      const text = await file.text();
      const lines = text.split('\n').filter(line => line.trim());
      
      if (lines.length < 2) {
        throw new Error('Le fichier CSV doit contenir au moins un en-tête et une ligne de données.');
      }

      const headers = lines[0].split(',').map(h => h.replace(/"/g, '').trim());
      const data: CSVProduct[] = [];

      for (let i = 1; i < lines.length; i++) {
        const values = parseCSVLine(lines[i]);
        if (values.length >= headers.length) {
          const row: any = {};
          headers.forEach((header, index) => {
            row[header] = values[index]?.replace(/"/g, '').trim() || '';
          });
          data.push(row as CSVProduct);
        }
      }

      setCsvData(data);
      setProcessingStep('Analyse des produits variables...');
      
      // Analyser les produits variables vs single
      const stats = analyzeProductVariations(data);
      setImportStats(stats);
      
      // Créer aperçu des produits groupés
      const preview = createProductPreview(data);
      setPreviewData(preview);
      
      setProcessingStep('Prêt pour import');
      showSuccess(
        'CSV analysé avec succès',
        `${stats.variableProducts} produits variables • ${stats.totalVariations} variations`,
        [
          {
            label: 'Voir aperçu',
            action: () => setShowPreview(true),
            variant: 'primary'
          }
        ]
      );

    } catch (error) {
      console.error('Erreur lecture CSV:', error);
      showError('Erreur de lecture', error instanceof Error ? error.message : 'Impossible de lire le fichier CSV.');
    } finally {
      setIsProcessing(false);
    }
  };

  const parseCSVLine = (line: string): string[] => {
    const result: string[] = [];
    let current = '';
    let inQuotes = false;
    
    for (let i = 0; i < line.length; i++) {
      const char = line[i];
      
      if (char === '"') {
        inQuotes = !inQuotes;
      } else if (char === ',' && !inQuotes) {
        result.push(current);
        current = '';
      } else {
        current += char;
      }
    }
    
    result.push(current);
    return result;
  };

  const analyzeProductVariations = (data: CSVProduct[]) => {
    const groupedByHandle = new Map<string, CSVProduct[]>();
    
    data.forEach(product => {
      const handle = product.Handle || 'unknown';
      if (!groupedByHandle.has(handle)) {
        groupedByHandle.set(handle, []);
      }
      groupedByHandle.get(handle)!.push(product);
    });

    const variableProducts = groupedByHandle.size;
    const totalVariations = data.length;
    const singleProducts = Array.from(groupedByHandle.values()).filter(group => group.length === 1).length;
    const multiVariantProducts = Array.from(groupedByHandle.values()).filter(group => group.length > 1).length;

    return {
      variableProducts,
      totalVariations,
      singleProducts,
      multiVariantProducts,
      averageVariationsPerProduct: Math.round(totalVariations / variableProducts * 10) / 10
    };
  };

  const createProductPreview = (data: CSVProduct[]) => {
    const groupedByHandle = new Map<string, CSVProduct[]>();
    
    data.forEach(product => {
      const handle = product.Handle || 'unknown';
      if (!groupedByHandle.has(handle)) {
        groupedByHandle.set(handle, []);
      }
      groupedByHandle.get(handle)!.push(product);
    });

    return Array.from(groupedByHandle.entries()).slice(0, 10).map(([handle, variations]) => {
      const mainProduct = variations[0];
      return {
        handle,
        title: mainProduct.Title,
        vendor: mainProduct.Vendor,
        category: mainProduct['Product Category'] || mainProduct.Type,
        variations: variations.map(v => ({
          option: v['Option1 Value'] || 'Default',
          price: parseFloat(v['Variant Price']) || 0,
          comparePrice: parseFloat(v['Variant Compare At Price']) || 0,
          stock: parseInt(v['Variant Inventory Qty']) || 0,
          sku: v['Variant SKU']
        })),
        image: mainProduct['Image Src'],
        description: mainProduct['Body (HTML)']?.substring(0, 200) + '...'
      };
    });
  };

  const handleImport = async () => {
    if (!csvData.length) return;

    setIsProcessing(true);
    setProcessingStep('Import des produits variables...');

    try {
      // Grouper par handle pour créer des produits variables
      const groupedByHandle = new Map<string, CSVProduct[]>();
      
      csvData.forEach(product => {
        const handle = product.Handle || `product-${Date.now()}-${Math.random()}`;
        if (!groupedByHandle.has(handle)) {
          groupedByHandle.set(handle, []);
        }
        groupedByHandle.get(handle)!.push(product);
      });

      const processedProducts = Array.from(groupedByHandle.entries()).map(([handle, variations]) => {
        const mainProduct = variations[0];
        
        return {
          id: handle,
          handle: handle,
          title: mainProduct.Title,
          name: mainProduct.Title,
          description: cleanDescription(mainProduct['Body (HTML)'] || ''),
          body_html: mainProduct['Body (HTML)'] || '',
          vendor: mainProduct.Vendor || 'Decora Home',
          product_type: mainProduct.Type || mainProduct['Product Category'] || 'Mobilier',
          category: mainProduct['Product Category'] || mainProduct.Type || 'Mobilier',
          tags: mainProduct.Tags || '',
          published: mainProduct.Published === 'TRUE',
          image_src: mainProduct['Image Src'] || 'https://images.pexels.com/photos/1350789/pexels-photo-1350789.jpeg',
          image_url: mainProduct['Image Src'] || 'https://images.pexels.com/photos/1350789/pexels-photo-1350789.jpeg',
          
          // Variations avec prix individuels
          variations: variations.map((variant, index) => ({
            id: `${handle}-var-${index}`,
            title: variant['Option1 Value'] || 'Default',
            option1_name: variant['Option1 Name'] || 'Couleur',
            option1_value: variant['Option1 Value'] || 'Default',
            price: parseFloat(variant['Variant Price']) || 0,
            variant_price: parseFloat(variant['Variant Price']) || 0,
            compare_at_price: parseFloat(variant['Variant Compare At Price']) || 0,
            compareAtPrice: parseFloat(variant['Variant Compare At Price']) || 0,
            inventory_quantity: parseInt(variant['Variant Inventory Qty']) || 0,
            variant_inventory_qty: parseInt(variant['Variant Inventory Qty']) || 0,
            stock: parseInt(variant['Variant Inventory Qty']) || 0,
            sku: variant['Variant SKU'] || '',
            variant_sku: variant['Variant SKU'] || ''
          })),
          
          // Prix principal (minimum des variations)
          price: Math.min(...variations.map(v => parseFloat(v['Variant Price']) || 0)),
          compare_at_price: Math.min(...variations.map(v => parseFloat(v['Variant Compare At Price']) || 0)),
          
          // Stock total
          stock: variations.reduce((sum, v) => sum + (parseInt(v['Variant Inventory Qty']) || 0), 0),
          inventory_quantity: variations.reduce((sum, v) => sum + (parseInt(v['Variant Inventory Qty']) || 0), 0),
          
          // Métadonnées
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          source: 'shopify_csv_import',
          import_date: new Date().toISOString()
        };
      });

      setProcessingStep('Sauvegarde en cours...');
      
      // Sauvegarder via Supabase Edge Function pour éviter les limites localStorage
      try {
        if (retailerId) {
          // Utiliser Supabase pour les gros volumes
          const { data, error } = await supabase.functions.invoke('save-imported-products', {
            body: {
              products: processedProducts.map(product => ({
                external_id: product.id,
                retailer_id: retailerId,
                name: product.title,
                description: product.description,
                price: product.price,
                compare_at_price: product.compare_at_price,
                category: product.category,
                vendor: product.vendor,
                image_url: product.image_url,
                product_url: `#${product.handle}`,
                stock: product.stock,
                source_platform: 'csv',
                status: 'active',
                extracted_attributes: {},
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString()
              })),
              retailer_id: retailerId,
              source: 'csv'
            }
          });

          if (error) {
            throw new Error(`Erreur Supabase: ${error.message}`);
          }

          console.log('✅ Produits sauvegardés via Supabase:', data?.saved_count || 0);
        } else {
          // Fallback localStorage pour les petits volumes ou mode démo
          localStorage.setItem('catalog_products', JSON.stringify(processedProducts));
        }
      } catch (error) {
        console.error('Erreur sauvegarde:', error);
        showError('Erreur de sauvegarde', 'Impossible de sauvegarder les produits. Veuillez réessayer.');
        return;
      }

      setProcessingStep('Import terminé');
      
      showSuccess(
        'Import Shopify réussi',
        `${importStats.variableProducts} produits variables importés avec ${importStats.totalVariations} variations`,
        [
          {
            label: 'Voir catalogue',
            action: () => onImportComplete(processedProducts),
            variant: 'primary'
          }
        ]
      );

      // Callback avec les données
      onImportComplete(processedProducts);

      // Reset
      setCsvFile(null);
      setCsvData([]);
      setPreviewData([]);
      setImportStats(null);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }

    } catch (error) {
      console.error('Erreur import:', error);
      showError('Erreur d\'import', 'Impossible d\'importer les produits.');
    } finally {
      setIsProcessing(false);
    }
  };

  const cleanDescription = (html: string): string => {
    return html
      .replace(/<[^>]*>/g, '')
      .replace(/&[^;]+;/g, ' ')
      .trim();
  };

  const downloadTemplate = () => {
    const template = `Handle,Title,Body (HTML),Vendor,Product Category,Type,Tags,Published,Option1 Name,Option1 Value,Variant Price,Variant Compare At Price,Variant Inventory Qty,Image Src,Variant SKU
canape-ventu-convertible,Canapé VENTU convertible,"Alliant design contemporain, fonctionnalité intelligente et grand confort, le canapé VENTU se distingue par ses lignes épurées et son espace couchage élargi.",Decora Home,Canapé,Mobilier,"canapé,convertible,moderne",TRUE,Couleur,Gris moderne,899,1299,50,https://images.pexels.com/photos/1350789/pexels-photo-1350789.jpeg,VENTU-GRIS
canape-ventu-convertible,Canapé VENTU convertible,"Alliant design contemporain, fonctionnalité intelligente et grand confort, le canapé VENTU se distingue par ses lignes épurées et son espace couchage élargi.",Decora Home,Canapé,Mobilier,"canapé,convertible,moderne",TRUE,Couleur,Beige doux,899,1299,45,https://images.pexels.com/photos/1350789/pexels-photo-1350789.jpeg,VENTU-BEIGE`;

    const blob = new Blob([template], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'shopify_template_variations.csv';
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-xl font-bold text-white flex items-center gap-2">
            <Upload className="w-6 h-6 text-blue-400" />
            Import CSV Shopify
          </h3>
          <p className="text-gray-300 text-sm mt-1">
            Importez vos produits Shopify avec variations complètes
          </p>
        </div>
        
        <button
          onClick={downloadTemplate}
          className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 text-sm transition-all"
        >
          <Download className="w-4 h-4" />
          Template CSV
        </button>
      </div>

      {/* Zone d'upload */}
      <div className="bg-white/10 backdrop-blur-xl rounded-2xl p-8 border border-white/20 border-dashed">
        <div className="text-center">
          <input
            ref={fileInputRef}
            type="file"
            accept=".csv"
            onChange={handleFileUpload}
            className="hidden"
            id="csv-upload"
          />
          
          {!csvFile ? (
            <label htmlFor="csv-upload" className="cursor-pointer">
              <FileText className="w-16 h-16 text-blue-400 mx-auto mb-4" />
              <h4 className="text-lg font-semibold text-white mb-2">
                Sélectionnez votre fichier CSV Shopify
              </h4>
              <p className="text-gray-300 mb-4">
                Glissez-déposez ou cliquez pour sélectionner
              </p>
              <div className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg inline-flex items-center gap-2 transition-all">
                <Upload className="w-5 h-5" />
                Choisir un fichier
              </div>
            </label>
          ) : (
            <div className="space-y-4">
              <CheckCircle className="w-16 h-16 text-green-400 mx-auto" />
              <div>
                <h4 className="text-lg font-semibold text-white">{csvFile.name}</h4>
                <p className="text-gray-300">
                  {(csvFile.size / 1024 / 1024).toFixed(2)} MB
                </p>
              </div>
              
              {importStats && (
                <div className="bg-blue-500/20 rounded-xl p-4 border border-blue-400/50">
                  <h5 className="font-semibold text-blue-200 mb-3">Analyse du fichier :</h5>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                    <div className="text-center">
                      <div className="text-2xl font-bold text-purple-400">{importStats.variableProducts}</div>
                      <div className="text-purple-300">Produits variables</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-cyan-400">{importStats.totalVariations}</div>
                      <div className="text-cyan-300">Variations totales</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-green-400">{importStats.multiVariantProducts}</div>
                      <div className="text-green-300">Multi-variations</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-orange-400">{importStats.averageVariationsPerProduct}</div>
                      <div className="text-orange-300">Moy. variations</div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* État du traitement */}
      {isProcessing && (
        <div className="bg-blue-500/20 rounded-xl p-4 border border-blue-400/50">
          <div className="flex items-center gap-3">
            <Loader2 className="w-5 h-5 text-blue-400 animate-spin" />
            <span className="text-blue-200 font-medium">{processingStep}</span>
          </div>
        </div>
      )}

      {/* Actions */}
      {csvFile && !isProcessing && importStats && (
        <div className="flex gap-4">
          <button
            onClick={() => setShowPreview(true)}
            className="flex-1 bg-purple-600 hover:bg-purple-700 text-white py-3 rounded-xl flex items-center justify-center gap-2 font-semibold transition-all"
          >
            <Eye className="w-5 h-5" />
            Aperçu ({importStats.variableProducts} produits)
          </button>
          
          <button
            onClick={handleImport}
            className="flex-1 bg-green-600 hover:bg-green-700 text-white py-3 rounded-xl flex items-center justify-center gap-2 font-semibold transition-all"
          >
            <Package className="w-5 h-5" />
            Importer {importStats.variableProducts} produits
          </button>
        </div>
      )}

      {/* Modal aperçu */}
      {showPreview && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-800/95 backdrop-blur-xl rounded-2xl max-w-6xl w-full max-h-[90vh] overflow-y-auto border border-slate-600/50">
            <div className="flex items-center justify-between p-6 border-b border-slate-600/50">
              <h2 className="text-2xl font-bold text-white flex items-center gap-2">
                <Eye className="w-6 h-6 text-purple-400" />
                Aperçu des produits variables
              </h2>
              <button
                onClick={() => setShowPreview(false)}
                className="text-gray-400 hover:text-white transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="p-6">
              <div className="grid gap-6">
                {previewData.map((product, index) => (
                  <div key={index} className="bg-white/10 rounded-xl p-4 border border-white/20">
                    <div className="flex gap-4">
                      <div className="w-20 h-20 rounded-lg overflow-hidden bg-gray-600 flex-shrink-0">
                        <img 
                          src={product.image} 
                          alt={product.title}
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            const target = e.target as HTMLImageElement;
                            target.src = 'https://images.pexels.com/photos/1350789/pexels-photo-1350789.jpeg';
                          }}
                        />
                      </div>
                      
                      <div className="flex-1">
                        <h3 className="font-bold text-white text-lg mb-1">{product.title}</h3>
                        <p className="text-gray-300 text-sm mb-2">{product.vendor} • {product.category}</p>
                        <p className="text-gray-400 text-xs mb-3 line-clamp-2">{product.description}</p>
                        
                        <div className="bg-cyan-500/20 rounded-lg p-3 border border-cyan-400/30">
                          <div className="text-cyan-300 text-sm font-semibold mb-2">
                            {product.variations.length} variation(s) :
                          </div>
                          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
                            {product.variations.map((variation: any, vIndex: number) => (
                              <div key={vIndex} className="bg-black/20 rounded p-2">
                                <div className="font-medium text-white text-sm">{variation.option}</div>
                                <div className="flex justify-between items-center mt-1">
                                  <div className="text-green-400 font-bold text-sm">{variation.price}€</div>
                                  <div className="text-gray-400 text-xs">Stock: {variation.stock}</div>
                                </div>
                                {variation.comparePrice > variation.price && (
                                  <div className="text-red-400 text-xs line-through">{variation.comparePrice}€</div>
                                )}
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="flex justify-end gap-4 mt-6">
                <button
                  onClick={() => setShowPreview(false)}
                  className="bg-gray-600 hover:bg-gray-700 text-white px-6 py-3 rounded-xl transition-all"
                >
                  Fermer
                </button>
                <button
                  onClick={() => {
                    setShowPreview(false);
                    handleImport();
                  }}
                  className="bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-xl transition-all"
                >
                  Importer ces produits
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};