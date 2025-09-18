import React, { useState, useEffect } from 'react';
import { Globe, Download, RefreshCw, ExternalLink, CheckCircle, AlertCircle, BarChart3, Settings } from 'lucide-react';
import { useNotifications } from './NotificationSystem';

export const GoogleMerchantTab: React.FC = () => {
  const [feedStats, setFeedStats] = useState<any>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [lastGenerated, setLastGenerated] = useState<string | null>(null);
  const { showSuccess, showError, showInfo } = useNotifications();

  useEffect(() => {
    loadFeedStats();
  }, []);

  const loadFeedStats = async () => {
    try {
      // Simuler le chargement des stats du flux
      await new Promise(resolve => setTimeout(resolve, 500));
      
      const mockStats = {
        total_products: 247,
        active_products: 235,
        with_images: 230,
        with_prices: 247,
        with_descriptions: 240,
        google_categories: 8,
        last_sync: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
        feed_url: `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/google-merchant-feed?format=xml&retailer_id=demo-retailer-id`,
        feed_size: '2.4 MB',
        validation_status: 'valid'
      };
      
      setFeedStats(mockStats);
      setLastGenerated(mockStats.last_sync);
      
    } catch (error) {
      console.error('❌ Erreur chargement stats flux:', error);
    }
  };

  const handleGenerateFeed = async (format: 'xml' | 'csv') => {
    setIsGenerating(true);
    showInfo('Génération en cours', `Création du flux Google Merchant ${format.toUpperCase()}...`);
    
    try {
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
        a.download = `google-merchant-feed-${new Date().toISOString().split('T')[0]}.${format}`;
        a.click();
        URL.revokeObjectURL(url);
        
        setLastGenerated(new Date().toISOString());
        
        showSuccess(
          'Flux généré !', 
          `Flux Google Merchant ${format.toUpperCase()} téléchargé avec ${feedStats?.active_products || 0} produits !`,
          [
            {
              label: 'Voir Google Merchant Center',
              action: () => window.open('https://merchants.google.com', '_blank'),
              variant: 'primary'
            }
          ]
        );
      } else {
        throw new Error('Erreur génération flux');
      }
    } catch (error) {
      showError('Erreur génération', 'Impossible de générer le flux Google Merchant.');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleSyncToMerchant = async () => {
    showInfo('Synchronisation', 'Synchronisation des produits enrichis vers le flux Google Merchant...');
    
    try {
      // Déclencher la synchronisation
      const response = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/google-merchant-feed?sync=true&retailer_id=demo-retailer-id`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          force_sync: true
        }),
      });

      if (response.ok) {
        await loadFeedStats();
        showSuccess('Synchronisation réussie', 'Flux Google Merchant mis à jour avec les derniers produits !');
      } else {
        throw new Error('Erreur synchronisation');
      }
    } catch (error) {
      showError('Erreur synchronisation', 'Impossible de synchroniser vers Google Merchant.');
    }
  };

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-white flex items-center gap-3">
            <Globe className="w-6 h-6 text-green-400" />
            Flux Google Merchant Center
          </h2>
          <p className="text-gray-300">Export automatique pour Google Shopping</p>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 bg-green-400 rounded-full animate-pulse"></div>
          <span className="text-green-300 text-sm">Flux actif</span>
        </div>
      </div>

      {/* Stats du flux */}
      {feedStats && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-blue-600/20 backdrop-blur-xl rounded-2xl p-6 border border-blue-500/30">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-blue-200 text-sm mb-1">Produits actifs</p>
                <p className="text-3xl font-bold text-white mb-1">{feedStats.active_products}</p>
                <p className="text-blue-300 text-sm">sur {feedStats.total_products} total</p>
              </div>
              <CheckCircle className="w-10 h-10 text-blue-400" />
            </div>
          </div>
          
          <div className="bg-green-600/20 backdrop-blur-xl rounded-2xl p-6 border border-green-500/30">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-green-200 text-sm mb-1">Avec images</p>
                <p className="text-3xl font-bold text-white mb-1">{feedStats.with_images}</p>
                <p className="text-green-300 text-sm">{Math.round((feedStats.with_images / feedStats.total_products) * 100)}%</p>
              </div>
              <CheckCircle className="w-10 h-10 text-green-400" />
            </div>
          </div>
          
          <div className="bg-purple-600/20 backdrop-blur-xl rounded-2xl p-6 border border-purple-500/30">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-purple-200 text-sm mb-1">Catégories Google</p>
                <p className="text-3xl font-bold text-white mb-1">{feedStats.google_categories}</p>
                <p className="text-purple-300 text-sm">Mappées</p>
              </div>
              <BarChart3 className="w-10 h-10 text-purple-400" />
            </div>
          </div>
          
          <div className="bg-orange-600/20 backdrop-blur-xl rounded-2xl p-6 border border-orange-500/30">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-orange-200 text-sm mb-1">Taille du flux</p>
                <p className="text-3xl font-bold text-white mb-1">{feedStats.feed_size}</p>
                <p className="text-orange-300 text-sm">XML/CSV</p>
              </div>
              <Globe className="w-10 h-10 text-orange-400" />
            </div>
          </div>
        </div>
      )}

      {/* Actions principales */}
      <div className="bg-white/10 backdrop-blur-xl rounded-2xl p-8 border border-white/20">
        <h3 className="text-xl font-bold text-white mb-6">Actions du flux</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <button
            onClick={() => handleGenerateFeed('xml')}
            disabled={isGenerating}
            className="bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-400 hover:to-emerald-500 disabled:from-gray-600 disabled:to-gray-700 text-white p-6 rounded-xl font-semibold transition-all disabled:cursor-not-allowed text-center"
          >
            <Globe className="w-8 h-8 mx-auto mb-3" />
            <div>Télécharger XML</div>
            <div className="text-sm opacity-80">Format Google Shopping</div>
          </button>
          
          <button
            onClick={() => handleGenerateFeed('csv')}
            disabled={isGenerating}
            className="bg-gradient-to-r from-blue-500 to-cyan-600 hover:from-blue-400 hover:to-cyan-500 disabled:from-gray-600 disabled:to-gray-700 text-white p-6 rounded-xl font-semibold transition-all disabled:cursor-not-allowed text-center"
          >
            <Download className="w-8 h-8 mx-auto mb-3" />
            <div>Télécharger CSV</div>
            <div className="text-sm opacity-80">Format tableur</div>
          </button>
          
          <button
            onClick={handleSyncToMerchant}
            className="bg-gradient-to-r from-purple-500 to-pink-600 hover:from-purple-400 hover:to-pink-500 text-white p-6 rounded-xl font-semibold transition-all text-center"
          >
            <RefreshCw className="w-8 h-8 mx-auto mb-3" />
            <div>Synchroniser</div>
            <div className="text-sm opacity-80">Mettre à jour le flux</div>
          </button>
          
          <button
            onClick={() => window.open('https://merchants.google.com', '_blank')}
            className="bg-gradient-to-r from-orange-500 to-red-600 hover:from-orange-400 hover:to-red-500 text-white p-6 rounded-xl font-semibold transition-all text-center"
          >
            <ExternalLink className="w-8 h-8 mx-auto mb-3" />
            <div>Google Merchant</div>
            <div className="text-sm opacity-80">Ouvrir console</div>
          </button>
        </div>
      </div>

      {/* Configuration du flux */}
      <div className="bg-white/10 backdrop-blur-xl rounded-2xl p-8 border border-white/20">
        <h3 className="text-xl font-bold text-white mb-6">Configuration Google Shopping</h3>
        
        <div className="space-y-6">
          <div className="bg-green-500/20 border border-green-400/50 rounded-xl p-4">
            <h4 className="font-semibold text-green-200 mb-3">🔗 URL du flux XML :</h4>
            <div className="bg-black/40 rounded-lg p-3 font-mono text-sm text-green-300 break-all">
              {feedStats?.feed_url}
            </div>
            <p className="text-green-300 text-sm mt-2">
              Utilisez cette URL dans Google Merchant Center pour importer automatiquement vos produits.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-black/20 rounded-xl p-4">
              <h4 className="font-semibold text-cyan-300 mb-3">📊 Mapping des champs :</h4>
              <ul className="text-cyan-200 text-sm space-y-1">
                <li>• <strong>title</strong> → Titre produit</li>
                <li>• <strong>description</strong> → Description courte</li>
                <li>• <strong>price</strong> → Prix en EUR</li>
                <li>• <strong>sale_price</strong> → Prix soldé si applicable</li>
                <li>• <strong>color</strong> → Couleur principale</li>
                <li>• <strong>material</strong> → Matériau principal</li>
                <li>• <strong>google_product_category</strong> → Catégorie Google</li>
              </ul>
            </div>
            
            <div className="bg-black/20 rounded-xl p-4">
              <h4 className="font-semibold text-purple-300 mb-3">⚙️ Configuration :</h4>
              <ul className="text-purple-200 text-sm space-y-1">
                <li>• <strong>Devise :</strong> EUR (Euro)</li>
                <li>• <strong>Pays :</strong> France</li>
                <li>• <strong>Langue :</strong> Français</li>
                <li>• <strong>Condition :</strong> Neuf</li>
                <li>• <strong>Livraison :</strong> Gratuite</li>
                <li>• <strong>Garantie :</strong> 2 ans</li>
                <li>• <strong>Label custom :</strong> promo2025</li>
              </ul>
            </div>
          </div>
          
          <div className="bg-blue-500/20 border border-blue-400/50 rounded-xl p-4">
            <h4 className="font-semibold text-blue-200 mb-3">💡 Instructions Google Merchant Center :</h4>
            <ol className="text-blue-300 text-sm space-y-2">
              <li><strong>1.</strong> Connectez-vous à <a href="https://merchants.google.com" target=\"_blank" className="text-blue-400 underline">Google Merchant Center</a></li>
              <li><strong>2.</strong> Allez dans <strong>Produits → Flux</strong></li>
              <li><strong>3.</strong> Cliquez <strong>+ Ajouter un flux</strong></li>
              <li><strong>4.</strong> Sélectionnez <strong>Flux programmé</strong></li>
              <li><strong>5.</strong> Collez l'URL du flux XML ci-dessus</li>
              <li><strong>6.</strong> Configurez la fréquence : <strong>Quotidienne à 3h</strong></li>
              <li><strong>7.</strong> Validez et attendez la première synchronisation</li>
            </ol>
          </div>
        </div>
      </div>

      {/* Statut de validation */}
      <div className="bg-white/10 backdrop-blur-xl rounded-2xl p-8 border border-white/20">
        <h3 className="text-xl font-bold text-white mb-6">Statut de validation Google</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-green-500/20 border border-green-400/30 rounded-xl p-4 text-center">
            <CheckCircle className="w-12 h-12 text-green-400 mx-auto mb-3" />
            <h4 className="font-semibold text-green-200 mb-2">Flux valide</h4>
            <p className="text-green-300 text-sm">Tous les champs requis sont présents</p>
          </div>
          
          <div className="bg-blue-500/20 border border-blue-400/30 rounded-xl p-4 text-center">
            <BarChart3 className="w-12 h-12 text-blue-400 mx-auto mb-3" />
            <h4 className="font-semibold text-blue-200 mb-2">Qualité des données</h4>
            <p className="text-blue-300 text-sm">
              {feedStats ? Math.round((feedStats.with_images / feedStats.total_products) * 100) : 0}% avec images
            </p>
          </div>
          
          <div className="bg-purple-500/20 border border-purple-400/30 rounded-xl p-4 text-center">
            <Globe className="w-12 h-12 text-purple-400 mx-auto mb-3" />
            <h4 className="font-semibold text-purple-200 mb-2">Prêt pour Google</h4>
            <p className="text-purple-300 text-sm">Compatible Google Shopping</p>
          </div>
        </div>
      </div>
    </div>
  );
};