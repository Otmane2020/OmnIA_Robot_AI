import React, { useState, useRef, useEffect } from 'react';
import { Upload, Brain, Database, Search, BarChart3, FileText, CheckCircle, AlertCircle, Loader, Clock } from 'lucide-react';
import { useNotifications } from './NotificationSystem';

interface ProductPreview {
  id: string;
  name: string;
  description: string;
  price: number;
  compare_at_price?: number;
  category?: string;
  subcategory?: string;
  vendor: string;
  image_url: string;
  product_url: string;
  stock: number;
  ai_vision_summary?: string;
  tags?: string[];
  confidence_score?: number;
}

interface AITrainingInterfaceProps {
  onTrainingComplete?: (stats: any) => void;
}

export const AITrainingInterface: React.FC<AITrainingInterfaceProps> = ({ onTrainingComplete }) => {
  const [csvFile, setCsvFile] = useState<File | null>(null);
  const [isTraining, setIsTraining] = useState(false);
  const [trainingProgress, setTrainingProgress] = useState(0);
  const [trainingStatus, setTrainingStatus] = useState<'idle' | 'training' | 'success' | 'error'>('idle');
  const [trainingStats, setTrainingStats] = useState<any>(null);
  const [errorMessage, setErrorMessage] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<ProductPreview[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [cronStatus, setCronStatus] = useState<any>(null);
  const [cronLoading, setCronLoading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { showSuccess, showError, showInfo } = useNotifications();

  // Charger le statut du cron au démarrage
  useEffect(() => {
    loadCronStatus();
  }, []);

  // Fonction utilitaire pour calculer le pourcentage de réduction
  const calculateDiscount = (price: number, compareAtPrice?: number): number => {
    if (!compareAtPrice || compareAtPrice <= price) return 0;
    return Math.round(((compareAtPrice - price) / compareAtPrice) * 100);
  };

  const loadCronStatus = async () => {
    setCronLoading(true);
    try {
      const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
      const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

      if (supabaseUrl && supabaseKey) {
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
        }
      }
    } catch (error) {
      console.error('❌ Erreur chargement statut cron:', error);
    } finally {
      setCronLoading(false);
    }
  };

  const handleSetupCron = async (schedule: 'daily' | 'weekly', enabled: boolean) => {
    try {
      const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
      const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

      if (supabaseUrl && supabaseKey) {
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
          showError('Erreur cron', 'Impossible de configurer le cron d\'entraînement');
        }
      }
    } catch (error) {
      console.error('❌ Erreur configuration cron:', error);
      showError('Erreur cron', 'Erreur lors de la configuration du cron');
    }
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file && file.type === 'text/csv') {
      setCsvFile(file);
      setTrainingStatus('idle');
      setErrorMessage('');
      showSuccess('Fichier sélectionné', `${file.name} prêt pour l'entraînement IA.`);
      
      // Recharger le statut du cron après entraînement
      await loadCronStatus();
    } else {
      showError('Format invalide', 'Veuillez sélectionner un fichier CSV valide.');
    }
  };

  const handleTraining = async (isIncremental = false) => {
    if (!csvFile) {
      showError('Fichier manquant', 'Veuillez d\'abord sélectionner un fichier CSV.');
      return;
    }

    showInfo('Entraînement démarré', `Analyse IA ${isIncremental ? 'incrémentale' : 'complète'} avec Vision IA automatique en cours...`);
    setIsTraining(true);
    setTrainingStatus('training');
    setTrainingProgress(0);
    setErrorMessage('');

    try {
      // Read CSV file
      const csvContent = await csvFile.text();
      console.log('📄 CSV lu:', csvContent.length, 'caractères');

      // Simulate training progress
      const progressInterval = setInterval(() => {
        setTrainingProgress(prev => Math.min(prev + 10, 90));
      }, 500);

      // Call AI training function
      const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
      const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

      if (!supabaseUrl || !supabaseKey) {
        throw new Error('Supabase non configuré');
      }

      const response = await fetch(`${supabaseUrl}/functions/v1/ai-catalog-trainer`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${supabaseKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          csvData: csvContent,
          isIncremental,
          enable_vision_ai: true
        }),
      });

      clearInterval(progressInterval);
      setTrainingProgress(100);

      if (response.ok) {
        const result = await response.json();
        console.log('✅ Entraînement réussi:', result);
        
        // Trigger auto-training for future imports
        console.log('🔄 Configuration auto-training pour futurs imports...');
        
        setTrainingStatus('success');
        setTrainingStats(result.stats);
        
        showSuccess(
          'Entraînement terminé',
          `${result.stats.products_processed} produits analysés avec Vision IA ! ${result.stats.attributes_extracted} attributs extraits et ${result.stats.vision_analyses || 0} analyses visuelles !`,
          [
            {
              label: 'Tester la recherche',
              action: () => setSearchQuery('canapé bleu moderne'),
              variant: 'primary'
            },
            {
              label: 'Voir OmnIA',
              action: () => window.open('/chat', '_blank'),
              variant: 'secondary'
            }
          ]
        );

        if (onTrainingComplete) {
          onTrainingComplete(result.stats);
        }

        // Déclencher l'entraînement automatique après import manuel
        await setupCron('daily', true);
      } else {
        const error = await response.json();
        showError('Entraînement échoué', error.details || 'Erreur lors de l\'entraînement IA.');
        throw new Error(error.details || 'Erreur lors de l\'entraînement');
      }

    } catch (error) {
      console.error('❌ Erreur entraînement:', error);
      showError('Erreur d\'entraînement', error.message || 'Erreur lors de l\'entraînement IA.');
      setTrainingStatus('error');
    } finally {
      setIsTraining(false);
    }
  };

  const handleSmartSearch = async () => {
    if (!searchQuery.trim()) return;

    setIsSearching(true);
    setSearchResults([]);

    try {
      const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
      const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

      const response = await fetch(`${supabaseUrl}/functions/v1/ai-smart-search`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${supabaseKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          query: searchQuery,
          limit: 10
        }),
      });

      if (response.ok) {
        const result = await response.json();
        console.log('🔍 Résultats recherche:', result);
        showSuccess('Recherche terminée', `${result.results?.length || 0} produits trouvés avec l'IA !`);
        
        // Transformer les résultats pour inclure les nouvelles données
        const transformedResults = (result.results || []).map((product: any) => ({
          id: product.id,
          name: product.name || product.title,
          description: product.description || '',
          price: product.price || 0,
          compare_at_price: product.compare_at_price,
          category: product.category || 'Mobilier',
          subcategory: product.subcategory || '',
          vendor: product.vendor || 'Boutique',
          image_url: product.image_url || 'https://images.pexels.com/photos/1350789/pexels-photo-1350789.jpeg',
          product_url: product.product_url || '#',
          stock: product.stock || 0,
          ai_vision_summary: product.extracted_attributes?.ai_vision_summary || '',
          tags: product.extracted_attributes?.tags || [],
          confidence_score: product.confidence_score || 0
        }));
        
        setSearchResults(transformedResults);
      } else {
        const error = await response.json();
        showError('Recherche échouée', 'Erreur lors de la recherche intelligente.');
        console.error('❌ Erreur recherche:', error);
      }

    } catch (error) {
      showError('Erreur de recherche', 'Impossible d\'effectuer la recherche intelligente.');
      console.error('❌ Erreur recherche intelligente:', error);
    } finally {
      setIsSearching(false);
    }
  };

  const sampleQueries = [
    "Je cherche un canapé bleu pour mon salon",
    "Table en chêne sous 500€",
    "Meubles minimalistes pour petit appartement",
    "Chaise de bureau ergonomique",
    "Mobilier scandinave chambre"
  ];

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="text-center">
        <h2 className="text-3xl font-bold text-white mb-4 flex items-center justify-center gap-3">
          <Brain className="w-8 h-8 text-cyan-400" />
          Entraînement IA Catalogue avec Vision IA
        </h2>
        <p className="text-gray-300 text-lg">
          Transformez votre catalogue en assistant intelligent avec analyse visuelle automatique
        </p>
      </div>

      {/* Statut du Cron d'Entraînement */}
      <div className="bg-white/10 backdrop-blur-xl rounded-2xl p-8 border border-white/20">
        <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
          <Clock className="w-6 h-6 text-orange-400" />
          Entraînement Automatique (Cron)
        </h3>
        
        {cronLoading ? (
          <div className="text-center py-4">
            <Loader className="w-8 h-8 text-cyan-400 animate-spin mx-auto mb-2" />
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
            
            {/* Informations détaillées */}
            <div className="bg-black/20 rounded-xl p-4">
              <h4 className="font-semibold text-white mb-3">📊 Informations détaillées :</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-gray-300">🕐 Dernière exécution :</p>
                  <p className="text-white font-semibold">
                    {cronStatus.last_run ? new Date(cronStatus.last_run).toLocaleString('fr-FR') : 'Jamais'}
                  </p>
                </div>
                <div>
                  <p className="text-gray-300">⏰ Prochaine exécution :</p>
                  <p className="text-white font-semibold">
                    {cronStatus.next_run ? new Date(cronStatus.next_run).toLocaleString('fr-FR') : 'Non programmée'}
                  </p>
                </div>
                <div>
                  <p className="text-gray-300">🔄 Exécutions totales :</p>
                  <p className="text-white font-semibold">{cronStatus.total_runs || 0}</p>
                </div>
                <div>
                  <p className="text-gray-300">✅ Taux de succès :</p>
                  <p className="text-white font-semibold">{cronStatus.success_rate || 0}%</p>
                </div>
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
              Configurez l'entraînement automatique pour maintenir OmnIA à jour
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
      {/* CSV Upload Section */}
      <div className="bg-white/10 backdrop-blur-xl rounded-2xl p-8 border border-white/20">
        <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
          <Upload className="w-6 h-6 text-cyan-400" />
          1. Upload de votre catalogue CSV
        </h3>

        <div className="space-y-6">
          <div className="border-2 border-dashed border-cyan-400/50 rounded-2xl p-8 text-center hover:border-cyan-400/70 transition-all">
            <input
              ref={fileInputRef}
              type="file"
              accept=".csv"
              onChange={handleFileUpload}
              className="hidden"
            />
            
            {!csvFile ? (
              <div>
                <FileText className="w-16 h-16 text-cyan-400 mx-auto mb-4" />
                <h4 className="text-lg font-semibold text-white mb-2">
                  Sélectionnez votre fichier CSV
                </h4>
                <p className="text-gray-300 mb-4">
                  Format requis : nom, prix, description, catégorie, image_url
                </p>
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white px-6 py-3 rounded-xl font-semibold transition-all"
                >
                  Choisir le fichier CSV
                </button>
              </div>
            ) : (
              <div className="bg-green-500/20 border border-green-400/50 rounded-xl p-4">
                <CheckCircle className="w-8 h-8 text-green-400 mx-auto mb-2" />
                <p className="text-green-300 font-semibold">{csvFile.name}</p>
                <p className="text-sm text-green-400">
                  {(csvFile.size / 1024).toFixed(1)} KB
                </p>
                <button
                  onClick={() => {
                    setCsvFile(null);
                    if (fileInputRef.current) fileInputRef.current.value = '';
                  }}
                  className="mt-2 text-sm text-green-300 hover:text-green-200 underline"
                >
                  Changer de fichier
                </button>
              </div>
            )}
          </div>

          {/* CSV Format Example */}
          <div className="bg-black/40 rounded-xl p-4 border border-cyan-500/30">
            <h4 className="font-semibold text-cyan-300 mb-2">📋 Format CSV attendu :</h4>
            <code className="text-cyan-400 text-sm block">
              nom,prix,prix_barre,description,categorie,image_url,vendor,stock
            </code>
            <div className="mt-2 text-xs text-gray-400">
              <p>• <strong>nom</strong> : Nom du produit</p>
              <p>• <strong>prix</strong> : Prix de vente actuel</p>
              <p>• <strong>prix_barre</strong> : Prix avant solde (optionnel)</p>
              <p>• <strong>description</strong> : Description détaillée (couleurs, matériaux, dimensions)</p>
              <p>• <strong>categorie</strong> : Type de produit (canapé, table, chaise...)</p>
              <p>• <strong>image_url</strong> : URL de l'image pour analyse Vision IA</p>
            </div>
          </div>
        </div>
      </div>

      {/* Training Section */}
      <div className="bg-white/10 backdrop-blur-xl rounded-2xl p-8 border border-white/20">
        <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
          <Brain className="w-6 h-6 text-purple-400" />
          2. Entraînement du modèle IA avec Vision IA
        </h3>

        {trainingStatus === 'idle' && (
          <div className="space-y-4">
            <p className="text-gray-300">
              L'IA va analyser chaque produit (texte + image) pour extraire automatiquement :
            </p>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
              <div className="bg-black/20 rounded-lg p-3">
                <div className="text-blue-400 font-semibold">🎨 Couleurs</div>
                <div className="text-gray-300">blanc, noir, bleu...</div>
              </div>
              <div className="bg-black/20 rounded-lg p-3">
                <div className="text-green-400 font-semibold">🏗️ Matériaux</div>
                <div className="text-gray-300">bois, métal, tissu...</div>
              </div>
              <div className="bg-black/20 rounded-lg p-3">
                <div className="text-yellow-400 font-semibold">📏 Dimensions</div>
                <div className="text-gray-300">L×l×H en cm</div>
              </div>
              <div className="bg-black/20 rounded-lg p-3">
                <div className="text-purple-400 font-semibold">✨ Styles</div>
                <div className="text-gray-300">moderne, scandinave...</div>
              </div>
              <div className="bg-black/20 rounded-lg p-3">
                <div className="text-pink-400 font-semibold">👁️ Vision IA</div>
                <div className="text-gray-300">analyse visuelle...</div>
              </div>
              <div className="bg-black/20 rounded-lg p-3">
                <div className="text-orange-400 font-semibold">🏷️ Tags IA</div>
                <div className="text-gray-300">mots-clés extraits...</div>
              </div>
              <div className="bg-black/20 rounded-lg p-3">
                <div className="text-red-400 font-semibold">💰 Promotions</div>
                <div className="text-gray-300">prix, réductions...</div>
              </div>
              <div className="bg-black/20 rounded-lg p-3">
                <div className="text-cyan-400 font-semibold">📂 Catégories</div>
                <div className="text-gray-300">type, sous-type...</div>
              </div>
            </div>
            
            <div className="bg-blue-500/20 border border-blue-400/50 rounded-xl p-4">
              <h4 className="font-semibold text-blue-200 mb-2">🤖 Entraînement automatique avec Vision IA :</h4>
              <ul className="text-blue-300 text-sm space-y-1">
                <li>• Déclenchement automatique après chaque import</li>
                <li>• Analyse visuelle automatique de chaque image produit</li>
                <li>• Cron quotidien à 2h du matin pour mise à jour</li>
                <li>• Analyse IA de tous les nouveaux produits</li>
                <li>• Extraction tags depuis titre et description</li>
                <li>• Amélioration continue des réponses OmnIA</li>
              </ul>
            </div>
            
            <div className="flex gap-4">
              <button
                onClick={() => handleTraining(false)}
                disabled={!csvFile || isTraining}
                className="flex-1 bg-gradient-to-r from-purple-500 to-pink-600 hover:from-purple-400 hover:to-pink-500 disabled:from-gray-600 disabled:to-gray-700 text-white py-3 px-6 rounded-xl font-semibold transition-all disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                <Brain className="w-5 h-5" />
                Entraînement complet + Vision IA
              </button>
              
              <button
                onClick={() => handleTraining(true)}
                disabled={!csvFile || isTraining}
                className="bg-cyan-600 hover:bg-cyan-700 disabled:bg-gray-600 text-white py-3 px-6 rounded-xl font-semibold transition-all disabled:cursor-not-allowed flex items-center gap-2"
              >
                <Database className="w-5 h-5" />
                Mise à jour incrémentale
              </button>
            </div>
          </div>
        )}

        {trainingStatus === 'training' && (
          <div className="text-center py-8">
            <Loader className="w-12 h-12 text-purple-400 animate-spin mx-auto mb-4" />
            <h4 className="text-lg font-semibold text-white mb-2">
              🤖 Entraînement IA + Vision IA en cours...
            </h4>
            <p className="text-purple-300 mb-4">
              Analyse texte + images et extraction des attributs avec IA
            </p>
            <div className="w-full bg-gray-700 rounded-full h-3 mb-2">
              <div 
                className="bg-gradient-to-r from-purple-500 to-pink-500 h-3 rounded-full transition-all duration-500" 
                style={{ width: `${trainingProgress}%` }}
              ></div>
            </div>
            <p className="text-sm text-gray-400">{trainingProgress}% terminé</p>
          </div>
        )}

        {trainingStatus === 'success' && trainingStats && (
          <div className="text-center py-8">
            <CheckCircle className="w-12 h-12 text-green-400 mx-auto mb-4" />
            <h4 className="text-lg font-semibold text-white mb-2">✅ Entraînement + Vision IA terminé !</h4>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
              <div className="bg-green-500/20 rounded-xl p-4">
                <div className="text-2xl font-bold text-green-400">{trainingStats.products_processed}</div>
                <div className="text-green-300 text-sm">Produits traités</div>
              </div>
              <div className="bg-blue-500/20 rounded-xl p-4">
                <div className="text-2xl font-bold text-blue-400">{trainingStats.attributes_extracted}</div>
                <div className="text-blue-300 text-sm">Attributs extraits</div>
              </div>
              <div className="bg-purple-500/20 rounded-xl p-4">
                <div className="text-2xl font-bold text-purple-400">
                  {trainingStats.training_mode === 'incremental' ? 'INC' : 'FULL'}
                </div>
                <div className="text-purple-300 text-sm">Mode entraînement</div>
              </div>
              <div className="bg-yellow-500/20 rounded-xl p-4">
                <div className="text-2xl font-bold text-yellow-400">IA</div>
                <div className="text-yellow-300 text-sm">Modèle actif</div>
              </div>
            </div>
          </div>
        )}

        {trainingStatus === 'error' && (
          <div className="text-center py-8">
            <AlertCircle className="w-12 h-12 text-red-400 mx-auto mb-4" />
            <h4 className="text-lg font-semibold text-white mb-2">❌ Erreur d'entraînement</h4>
            <p className="text-red-300 mb-4">{errorMessage}</p>
            <button
              onClick={() => setTrainingStatus('idle')}
              className="bg-cyan-600 hover:bg-cyan-700 text-white py-2 px-4 rounded-xl"
            >
              Réessayer
            </button>
          </div>
        )}
      </div>

      {/* Smart Search Testing */}
      {trainingStatus === 'success' && (
        <div className="bg-white/10 backdrop-blur-xl rounded-2xl p-8 border border-white/20">
          <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
            <Search className="w-6 h-6 text-cyan-400" />
            3. Test de recherche intelligente
          </h3>

          <div className="space-y-6">
            <div className="flex gap-3">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSmartSearch()}
                placeholder="Ex: canapé bleu pour salon moderne sous 800€"
                className="flex-1 bg-black/40 border border-cyan-500/50 rounded-xl px-4 py-3 text-white placeholder-cyan-400 focus:outline-none focus:border-cyan-400 focus:ring-2 focus:ring-cyan-400/30"
              />
              <button
                onClick={handleSmartSearch}
                disabled={isSearching || !searchQuery.trim()}
                className="bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 disabled:from-gray-600 disabled:to-gray-700 text-white px-6 py-3 rounded-xl font-semibold transition-all disabled:cursor-not-allowed flex items-center gap-2"
              >
                {isSearching ? (
                  <Loader className="w-5 h-5 animate-spin" />
                ) : (
                  <Search className="w-5 h-5" />
                )}
                Rechercher
              </button>
            </div>

            {/* Sample Queries */}
            <div>
              <p className="text-sm text-gray-400 mb-3">Exemples de recherches intelligentes :</p>
              <div className="flex flex-wrap gap-2">
                {sampleQueries.map((query, index) => (
                  <button
                    key={index}
                    onClick={() => setSearchQuery(query)}
                    className="text-xs bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-300 px-3 py-2 rounded-lg border border-cyan-500/30 transition-all"
                  >
                    {query}
                  </button>
                ))}
              </div>
            </div>

            {/* Search Results */}
            {searchResults.length > 0 && (
              <div className="space-y-4">
                <h4 className="font-semibold text-white">Résultats trouvés ({searchResults.length}) :</h4>
                <div className="grid gap-4">
                  {searchResults.map((result, index) => (
                    <div key={index} className="bg-black/20 rounded-xl p-4 border border-white/10">
                      <div className="flex gap-4">
                        <div className="w-16 h-16 rounded-lg overflow-hidden bg-gray-600 flex-shrink-0">
                          {result.image_url && (
                            <img 
                              src={result.image_url} 
                              alt={result.name}
                              className="w-full h-full object-cover"
                            />
                          )}
                        </div>
                        <div className="flex-1">
                          <div className="flex justify-between items-start mb-2">
                            <h5 className="font-semibold text-white">{result.name}</h5>
                            <div className="text-right">
                              <div className="text-cyan-400 font-bold">{result.price}€</div>
                              <div className="text-xs text-green-400">
                                Score: {Math.round(result.relevance_score)}%
                              </div>
                            </div>
                          </div>
                          <p className="text-gray-300 text-sm mb-2">{result.category}</p>
                          
                          {/* Matched Attributes */}
                          <div className="flex flex-wrap gap-1 mb-2">
                            {result.matched_attributes?.map((attr: string, i: number) => (
                              <span key={i} className="bg-green-500/20 text-green-300 px-2 py-1 rounded text-xs">
                                {attr}
                              </span>
                            ))}
                          </div>
                          
                          {/* AI Reasoning */}
                          {result.ai_reasoning && (
                            <p className="text-xs text-blue-300 italic">
                              🤖 {result.ai_reasoning}
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Training Info */}
      <div className="bg-gradient-to-r from-cyan-500/20 to-blue-600/20 backdrop-blur-xl rounded-2xl p-6 border border-cyan-400/30">
        <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
          <BarChart3 className="w-5 h-5 text-cyan-400" />
          Capacités IA du système
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h4 className="font-semibold text-cyan-300 mb-2">🎯 Extraction automatique :</h4>
            <ul className="text-sm text-gray-300 space-y-1">
              <li>• Couleurs (bleu, beige, chêne, noir...)</li>
              <li>• Matériaux (bois, métal, verre, tissu...)</li>
              <li>• Dimensions (L×l×H, diamètre...)</li>
              <li>• Styles (scandinave, moderne, industriel...)</li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold text-cyan-300 mb-2">🔍 Recherche intelligente :</h4>
            <ul className="text-sm text-gray-300 space-y-1">
              <li>• "Canapé bleu salon" → couleur + pièce</li>
              <li>• "Table chêne sous 500€" → matériau + prix</li>
              <li>• "Mobilier minimaliste petit appartement"</li>
              <li>• Apprentissage continu avec nouveaux CSV</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};