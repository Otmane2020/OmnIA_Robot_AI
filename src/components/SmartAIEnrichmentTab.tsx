import { supabase } from '../lib/supabase';
import { useNotifications } from './NotificationSystem';
import React, { useState, useEffect } from 'react';
import { 
  Brain, Database, Search, BarChart3, FileText, CheckCircle, AlertCircle, Loader, Eye, Download, Upload, Zap, 
  Package, Tag, DollarSign, Image, Info, Palette, Weight, X, RefreshCw, Edit, Trash2, Plus, Loader2,
  Filter, ChevronDown, ChevronUp, ExternalLink, Target, Sparkles 
} from 'lucide-react';

interface SmartProduct {
  id: string;
  name: string;
  description: string;
  price: number;
  category: string;
  vendor: string;
  image_url: string;
  stock: number;
  extracted_attributes: any;
  confidence_score: number;
}

interface TrainingStats {
  totalProducts: number;
  enrichedProducts: number;
  averageConfidence: number;
  lastTraining: string;
}

export default function SmartAIEnrichmentTab() {
  const [products, setProducts] = useState<SmartProduct[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [trainingStats, setTrainingStats] = useState<TrainingStats>({
    totalProducts: 0,
    enrichedProducts: 0,
    averageConfidence: 0,
    lastTraining: 'Jamais'
  });
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [showResults, setShowResults] = useState(false);
  const { addNotification } = useNotifications();

  const getDemoCSVData = () => {
    return `Handle,Title,Body (HTML),Vendor,Product Category,Type,Tags,Published,Option1 Name,Option1 Value,Option2 Name,Option2 Value,Variant Price,Variant Compare At Price,Variant Requires Shipping,Variant Taxable,Variant Barcode,Image Src,Variant Image,Variant Weight Unit,Cost per item,Status
canape-alyana-beige,Canapé ALYANA Beige,"<p>Canapé 3 places en tissu beige, design moderne et confortable. Structure en bois massif, coussins déhoussables.</p>",Decora Home,Mobilier,Canapé,"canapé, salon, beige, 3 places",TRUE,Couleur,Beige,Matière,Tissu,899.00,1199.00,TRUE,TRUE,,https://images.pexels.com/photos/1350789/pexels-photo-1350789.jpeg,,kg,450.00,active
canape-alyana-gris,Canapé ALYANA Gris,"<p>Canapé 3 places en tissu gris anthracite, design moderne et confortable. Structure en bois massif, coussins déhoussables.</p>",Decora Home,Mobilier,Canapé,"canapé, salon, gris, 3 places",TRUE,Couleur,Gris,Matière,Tissu,899.00,1199.00,TRUE,TRUE,,https://images.pexels.com/photos/1571460/pexels-photo-1571460.jpeg,,kg,450.00,active
canape-alyana-bleu,Canapé ALYANA Bleu,"<p>Canapé 3 places en tissu bleu marine, design moderne et confortable. Structure en bois massif, coussins déhoussables.</p>",Decora Home,Mobilier,Canapé,"canapé, salon, bleu, 3 places",TRUE,Couleur,Bleu,Matière,Tissu,899.00,1199.00,TRUE,TRUE,,https://images.pexels.com/photos/1571463/pexels-photo-1571463.jpeg,,kg,450.00,active
table-aurea,Table AUREA,"<p>Table basse rectangulaire en chêne massif avec finition naturelle. Design scandinave épuré.</p>",Decora Home,Mobilier,Table,"table, salon, chêne, scandinave",TRUE,Matière,Chêne,Finition,Naturelle,349.00,449.00,TRUE,TRUE,,https://images.pexels.com/photos/1571468/pexels-photo-1571468.jpeg,,kg,25.00,active
chaise-inaya,Chaise INAYA,"<p>Chaise de salle à manger en velours vert émeraude avec pieds en métal doré. Confort optimal.</p>",Decora Home,Mobilier,Chaise,"chaise, salle à manger, velours, vert",TRUE,Couleur,Vert,Matière,Velours,129.00,179.00,TRUE,TRUE,,https://images.pexels.com/photos/1571471/pexels-photo-1571471.jpeg,,kg,8.00,active`;
  };

  const parseCSVData = (csvText: string): SmartProduct[] => {
    const lines = csvText.trim().split('\n');
    const headers = lines[0].split(',');
    
    return lines.slice(1).map((line, index) => {
      const values = line.split(',');
      return {
        id: `demo-${index}`,
        name: values[1] || `Produit ${index + 1}`,
        description: values[2]?.replace(/<[^>]*>/g, '') || 'Description non disponible',
        price: parseFloat(values[12]) || 0,
        category: values[4] || 'Non catégorisé',
        vendor: values[3] || 'Vendeur inconnu',
        image_url: values[17] || 'https://images.pexels.com/photos/1350789/pexels-photo-1350789.jpeg',
        stock: Math.floor(Math.random() * 50) + 1,
        extracted_attributes: {},
        confidence_score: 0
      };
    });
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      const reader = new FileReader();
      reader.onload = (e) => {
        const csvText = e.target?.result as string;
        const parsedProducts = parseCSVData(csvText);
        setProducts(parsedProducts);
        addNotification('Fichier CSV chargé avec succès', 'success');
      };
      reader.readAsText(file);
    }
  };

  const simulateAIEnrichment = async (product: SmartProduct): Promise<SmartProduct> => {
    // Simulation d'enrichissement IA
    await new Promise(resolve => setTimeout(resolve, 500 + Math.random() * 1000));
    
    const attributes: any = {};
    const name = product.name.toLowerCase();
    
    // Extraction simulée d'attributs basée sur le nom/description
    if (name.includes('canapé')) {
      attributes.type = 'Canapé';
      attributes.room = 'Salon';
      attributes.seating_capacity = name.includes('3 places') ? '3 places' : '2-3 places';
      if (name.includes('beige')) attributes.color = 'Beige';
      if (name.includes('gris')) attributes.color = 'Gris';
      if (name.includes('bleu')) attributes.color = 'Bleu';
      attributes.material = 'Tissu';
      attributes.style = 'Moderne';
    } else if (name.includes('table')) {
      attributes.type = 'Table basse';
      attributes.room = 'Salon';
      attributes.material = 'Chêne';
      attributes.style = 'Scandinave';
      attributes.shape = 'Rectangulaire';
    } else if (name.includes('chaise')) {
      attributes.type = 'Chaise';
      attributes.room = 'Salle à manger';
      attributes.material = 'Velours';
      attributes.color = 'Vert';
      attributes.style = 'Moderne';
    }

    return {
      ...product,
      extracted_attributes: attributes,
      confidence_score: Math.floor(Math.random() * 30) + 70 // 70-100%
    };
  };

  const handleTraining = async () => {
    setIsLoading(true);
    setShowResults(false);
    
    try {
      let productsToProcess = products;
      
      // Si aucun produit n'est chargé, utiliser les données démo
      if (productsToProcess.length === 0) {
        const demoCSV = getDemoCSVData();
        productsToProcess = parseCSVData(demoCSV);
        setProducts(productsToProcess);
        addNotification('Utilisation des produits démo pour la synchronisation', 'info');
      }

      addNotification('Démarrage de l\'enrichissement IA...', 'info');
      
      const enrichedProducts: SmartProduct[] = [];
      
      for (let i = 0; i < productsToProcess.length; i++) {
        const product = productsToProcess[i];
        const enriched = await simulateAIEnrichment(product);
        enrichedProducts.push(enriched);
        
        // Mise à jour progressive
        setProducts([...enrichedProducts, ...productsToProcess.slice(i + 1)]);
      }
      
      setProducts(enrichedProducts);
      
      // Mise à jour des statistiques
      const avgConfidence = enrichedProducts.reduce((sum, p) => sum + p.confidence_score, 0) / enrichedProducts.length;
      setTrainingStats({
        totalProducts: enrichedProducts.length,
        enrichedProducts: enrichedProducts.length,
        averageConfidence: Math.round(avgConfidence),
        lastTraining: new Date().toLocaleString('fr-FR')
      });
      
      setShowResults(true);
      addNotification(`Enrichissement terminé ! ${enrichedProducts.length} produits traités`, 'success');
      
    } catch (error) {
      console.error('Erreur lors de l\'enrichissement:', error);
      addNotification('Erreur lors de l\'enrichissement IA', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const getConfidenceColor = (score: number) => {
    if (score >= 90) return 'text-green-600 bg-green-50';
    if (score >= 70) return 'text-yellow-600 bg-yellow-50';
    return 'text-red-600 bg-red-50';
  };

  return (
    <div className="space-y-6">
      {/* En-tête */}
      <div className="bg-gradient-to-r from-purple-600 to-blue-600 rounded-lg p-6 text-white">
        <div className="flex items-center space-x-3 mb-4">
          <Sparkles className="w-8 h-8" />
          <h2 className="text-2xl font-bold">Smart AI Enrichment</h2>
        </div>
        <p className="text-purple-100">
          Enrichissement intelligent de votre catalogue avec l'IA avancée
        </p>
      </div>

      {/* Statistiques */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-lg border border-gray-200">
          <div className="flex items-center space-x-2">
            <Package className="w-5 h-5 text-blue-600" />
            <span className="text-sm font-medium text-gray-600">Produits totaux</span>
          </div>
          <p className="text-2xl font-bold text-gray-900 mt-1">{trainingStats.totalProducts}</p>
        </div>
        
        <div className="bg-white p-4 rounded-lg border border-gray-200">
          <div className="flex items-center space-x-2">
            <Brain className="w-5 h-5 text-purple-600" />
            <span className="text-sm font-medium text-gray-600">Enrichis</span>
          </div>
          <p className="text-2xl font-bold text-gray-900 mt-1">{trainingStats.enrichedProducts}</p>
        </div>
        
        <div className="bg-white p-4 rounded-lg border border-gray-200">
          <div className="flex items-center space-x-2">
            <BarChart3 className="w-5 h-5 text-green-600" />
            <span className="text-sm font-medium text-gray-600">Confiance moy.</span>
          </div>
          <p className="text-2xl font-bold text-gray-900 mt-1">{trainingStats.averageConfidence}%</p>
        </div>
        
        <div className="bg-white p-4 rounded-lg border border-gray-200">
          <div className="flex items-center space-x-2">
            <RefreshCw className="w-5 h-5 text-orange-600" />
            <span className="text-sm font-medium text-gray-600">Dernier sync</span>
          </div>
          <p className="text-sm font-bold text-gray-900 mt-1">{trainingStats.lastTraining}</p>
        </div>
      </div>

      {/* Actions */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
          <Upload className="w-5 h-5 mr-2 text-blue-600" />
          Import et Enrichissement
        </h3>
        
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Fichier CSV (optionnel)
            </label>
            <input
              type="file"
              accept=".csv"
              onChange={handleFileUpload}
              className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
            />
            <p className="text-xs text-gray-500 mt-1">
              Si aucun fichier n'est sélectionné, les produits démo seront utilisés
            </p>
          </div>
          
          <button
            onClick={handleTraining}
            disabled={isLoading}
            className="w-full bg-gradient-to-r from-purple-600 to-blue-600 text-white px-6 py-3 rounded-lg font-medium hover:from-purple-700 hover:to-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
          >
            {isLoading ? (
              <>
                <Loader className="w-5 h-5 animate-spin" />
                <span>Synchronisation en cours...</span>
              </>
            ) : (
              <>
                <Zap className="w-5 h-5" />
                <span>Synchroniser le catalogue</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Résultats */}
      {showResults && products.length > 0 && (
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <Eye className="w-5 h-5 mr-2 text-green-600" />
            Résultats de l'enrichissement ({products.length} produits)
          </h3>
          
          <div className="space-y-4 max-h-96 overflow-y-auto">
            {products.map((product) => (
              <div key={product.id} className="border border-gray-200 rounded-lg p-4">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <h4 className="font-medium text-gray-900">{product.name}</h4>
                    <p className="text-sm text-gray-600 mt-1">{product.description}</p>
                    <div className="flex items-center space-x-4 mt-2 text-sm text-gray-500">
                      <span className="flex items-center">
                        <DollarSign className="w-4 h-4 mr-1" />
                        {product.price}€
                      </span>
                      <span className="flex items-center">
                        <Package className="w-4 h-4 mr-1" />
                        Stock: {product.stock}
                      </span>
                    </div>
                  </div>
                  
                  <div className="ml-4">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getConfidenceColor(product.confidence_score)}`}>
                      {product.confidence_score}% confiance
                    </span>
                  </div>
                </div>
                
                {Object.keys(product.extracted_attributes).length > 0 && (
                  <div className="border-t border-gray-100 pt-3">
                    <p className="text-sm font-medium text-gray-700 mb-2">Attributs extraits :</p>
                    <div className="flex flex-wrap gap-2">
                      {Object.entries(product.extracted_attributes).map(([key, value]) => (
                        <span
                          key={key}
                          className="px-2 py-1 bg-blue-50 text-blue-700 rounded text-xs"
                        >
                          {key}: {value as string}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}