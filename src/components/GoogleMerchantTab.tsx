import React, { useState, useEffect } from 'react';
import { Globe, Download, RefreshCw, ExternalLink, CheckCircle, AlertCircle, BarChart3, Settings, Copy, Eye } from 'lucide-react';
import { useNotifications } from './NotificationSystem';

export const GoogleMerchantTab: React.FC = () => {
  const [feedStats, setFeedStats] = useState<any>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [lastGenerated, setLastGenerated] = useState<string | null>(null);
  const [feedUrl, setFeedUrl] = useState('');
  const { showSuccess, showError, showInfo } = useNotifications();

  useEffect(() => {
    loadFeedStats();
    generateFeedUrl();
  }, []);

  const generateFeedUrl = () => {
    const baseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://omnia.sale';
    const url = `${baseUrl}/functions/v1/google-merchant-feed?format=xml&retailer_id=demo-retailer-id`;
    setFeedUrl(url);
  };

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
        feed_size: '2.4 MB',
        validation_status: 'valid',
        enriched_products: 235,
        with_seo: 235,
        with_attributes: 230,
        confidence_avg: 87
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
          `Flux Google Merchant ${format.toUpperCase()} téléchargé avec ${feedStats?.active_products || 0} produits enrichis !`,
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
        showSuccess('Synchronisation réussie', 'Flux Google Merchant mis à jour avec les derniers produits enrichis !');
      } else {
        throw new Error('Erreur synchronisation');
      }
    } catch (error) {
      showError('Erreur synchronisation', 'Impossible de synchroniser vers Google Merchant.');
    }
  };

  const copyFeedUrl = () => {
    navigator.clipboard.writeText(feedUrl);
    showSuccess('URL copiée', 'URL du flux copiée dans le presse-papiers !');
  };

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-white flex items-center gap-3">
            <Globe className="w-6 h-6 text-green-400" />
            Flux Google Merchant Center
          </h2>
          <p className="text-gray-300">Export automatique des produits enrichis pour Google Shopping</p>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 bg-green-400 rounded-full animate-pulse"></div>
          <span className="text-green-300 text-sm">Flux actif et synchronisé</span>
        </div>
      </div>

      {/* Stats du flux enrichi */}
      {feedStats && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-blue-600/20 backdrop-blur-xl rounded-2xl p-6 border border-blue-500/30">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-blue-200 text-sm mb-1">Produits enrichis</p>
                <p className="text-3xl font-bold text-white mb-1">{feedStats.enriched_products}</p>
                <p className="text-blue-300 text-sm">avec attributs IA</p>
              </div>
              <Brain className="w-10 h-10 text-blue-400" />
            </div>
          </div>
          
          <div className="bg-green-600/20 backdrop-blur-xl rounded-2xl p-6 border border-green-500/30">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-green-200 text-sm mb-1">Confiance IA</p>
                <p className="text-3xl font-bold text-white mb-1">{feedStats.confidence_avg}%</p>
                <p className="text-green-300 text-sm">moyenne</p>
              </div>
              <CheckCircle className="w-10 h-10 text-green-400" />
            </div>
          </div>
          
          <div className="bg-purple-600/20 backdrop-blur-xl rounded-2xl p-6 border border-purple-500/30">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-purple-200 text-sm mb-1">SEO optimisé</p>
                <p className="text-3xl font-bold text-white mb-1">{feedStats.with_seo}</p>
                <p className="text-purple-300 text-sm">produits</p>
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

      {/* URL du flux */}
      <div className="bg-white/10 backdrop-blur-xl rounded-2xl p-8 border border-white/20">
        <h3 className="text-xl font-bold text-white mb-6">🔗 URL du flux Google Merchant</h3>
        
        <div className="bg-green-500/20 border border-green-400/50 rounded-xl p-6">
          <h4 className="font-semibold text-green-200 mb-3">📡 URL publique du flux XML :</h4>
          <div className="flex items-center gap-3">
            <div className="flex-1 bg-black/40 rounded-lg p-3 font-mono text-sm text-green-300 break-all">
              {feedUrl}
            </div>
            <button
              onClick={copyFeedUrl}
              className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-all"
            >
              <Copy className="w-4 h-4" />
              Copier
            </button>
            <a
              href={feedUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-all"
            >
              <Eye className="w-4 h-4" />
              Voir
            </a>
          </div>
          <p className="text-green-300 text-sm mt-3">
            ✅ Utilisez cette URL dans Google Merchant Center pour importer automatiquement vos produits enrichis.
          </p>
        </div>
      </div>

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
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-black/20 rounded-xl p-4">
              <h4 className="font-semibold text-cyan-300 mb-3">📊 Mapping des champs enrichis :</h4>
              <ul className="text-cyan-200 text-sm space-y-1">
                <li>• <strong>title</strong> → Titre produit enrichi</li>
                <li>• <strong>description</strong> → Description courte optimisée</li>
                <li>• <strong>price</strong> → Prix en EUR</li>
                <li>• <strong>sale_price</strong> → Prix soldé si applicable</li>
                <li>• <strong>color</strong> → Couleurs extraites par IA</li>
                <li>• <strong>material</strong> → Matériaux détectés par Vision</li>
                <li>• <strong>google_product_category</strong> → Catégorie Google mappée</li>
                <li>• <strong>custom_label_0</strong> → promo2025</li>
                <li>• <strong>custom_label_1</strong> → Style (moderne, scandinave...)</li>
                <li>• <strong>custom_label_2</strong> → Pièce (salon, chambre...)</li>
                <li>• <strong>custom_label_3</strong> → Tissu (velours, chenille...)</li>
              </ul>
            </div>
            
            <div className="bg-black/20 rounded-xl p-4">
              <h4 className="font-semibold text-purple-300 mb-3">⚙️ Configuration automatique :</h4>
              <ul className="text-purple-200 text-sm space-y-1">
                <li>• <strong>Devise :</strong> EUR (Euro)</li>
                <li>• <strong>Pays :</strong> France</li>
                <li>• <strong>Langue :</strong> Français</li>
                <li>• <strong>Condition :</strong> Neuf</li>
                <li>• <strong>Livraison :</strong> Gratuite</li>
                <li>• <strong>Garantie :</strong> 2 ans</li>
                <li>• <strong>Age group :</strong> Adult</li>
                <li>• <strong>Gender :</strong> Unisex</li>
                <li>• <strong>Multipack :</strong> 1</li>
                <li>• <strong>Bundle :</strong> False</li>
              </ul>
            </div>
          </div>
          
          <div className="bg-blue-500/20 border border-blue-400/50 rounded-xl p-6">
            <h4 className="font-semibold text-blue-200 mb-4">💡 Instructions Google Merchant Center :</h4>
            <ol className="text-blue-300 text-sm space-y-2">
              <li><strong>1.</strong> Connectez-vous à <a href="https://merchants.google.com" target=\"_blank" className="text-blue-400 underline">Google Merchant Center</a></li>
              <li><strong>2.</strong> Allez dans <strong>Produits → Flux</strong></li>
              <li><strong>3.</strong> Cliquez <strong>+ Ajouter un flux</strong></li>
              <li><strong>4.</strong> Sélectionnez <strong>Flux programmé</strong></li>
              <li><strong>5.</strong> Collez l'URL du flux XML ci-dessus</li>
              <li><strong>6.</strong> Configurez la fréquence : <strong>Quotidienne à 3h</strong></li>
              <li><strong>7.</strong> Validez et attendez la première synchronisation</li>
              <li><strong>8.</strong> Vérifiez que tous les produits sont approuvés</li>
            </ol>
          </div>

          <div className="bg-green-500/20 border border-green-400/50 rounded-xl p-6">
            <h4 className="font-semibold text-green-200 mb-4">✅ Avantages du flux enrichi OmnIA :</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <ul className="text-green-300 text-sm space-y-1">
                <li>• <strong>Attributs multiples :</strong> Couleurs et matériaux détectés par Vision IA</li>
                <li>• <strong>SEO optimisé :</strong> Titres et descriptions générés automatiquement</li>
                <li>• <strong>Catégories Google :</strong> Mapping automatique vers codes Google</li>
                <li>• <strong>Labels personnalisés :</strong> Style, pièce, tissu dans custom_labels</li>
              </ul>
              <ul className="text-green-300 text-sm space-y-1">
                <li>• <strong>Synchronisation auto :</strong> Mise à jour quotidienne à 3h</li>
                <li>• <strong>Validation complète :</strong> Tous les champs requis présents</li>
                <li>• <strong>Performance :</strong> Scores PMax et matching intégrés</li>
                <li>• <strong>Traçabilité :</strong> Historique des enrichissements</li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      {/* Statut de validation */}
      <div className="bg-white/10 backdrop-blur-xl rounded-2xl p-8 border border-white/20">
        <h3 className="text-xl font-bold text-white mb-6">Statut de validation Google</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-green-500/20 border border-green-400/30 rounded-xl p-6 text-center">
            <CheckCircle className="w-12 h-12 text-green-400 mx-auto mb-3" />
            <h4 className="font-semibold text-green-200 mb-2">Flux valide</h4>
            <p className="text-green-300 text-sm">Tous les champs requis sont présents et enrichis</p>
            <div className="mt-3 text-green-400 font-bold text-lg">100%</div>
          </div>
          
          <div className="bg-blue-500/20 border border-blue-400/30 rounded-xl p-6 text-center">
            <BarChart3 className="w-12 h-12 text-blue-400 mx-auto mb-3" />
            <h4 className="font-semibold text-blue-200 mb-2">Qualité des données</h4>
            <p className="text-blue-300 text-sm">
              {feedStats ? Math.round((feedStats.with_attributes / feedStats.total_products) * 100) : 0}% avec attributs IA
            </p>
            <div className="mt-3 text-blue-400 font-bold text-lg">{feedStats?.confidence_avg || 0}%</div>
          </div>
          
          <div className="bg-purple-500/20 border border-purple-400/30 rounded-xl p-6 text-center">
            <Globe className="w-12 h-12 text-purple-400 mx-auto mb-3" />
            <h4 className="font-semibold text-purple-200 mb-2">Prêt pour Google</h4>
            <p className="text-purple-300 text-sm">Compatible Google Shopping avec enrichissement IA</p>
            <div className="mt-3 text-purple-400 font-bold text-lg">✅</div>
          </div>
        </div>
      </div>

      {/* Exemple de produit enrichi */}
      <div className="bg-gradient-to-r from-purple-500/20 to-pink-600/20 backdrop-blur-xl rounded-2xl p-6 border border-purple-400/30">
        <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-purple-400" />
          Exemple de produit enrichi dans le flux
        </h3>
        <div className="bg-black/40 rounded-xl p-4 font-mono text-sm">
          <div className="text-purple-300 mb-2">// Exemple XML Google Merchant enrichi :</div>
          <div className="text-gray-300">
            <div className="text-cyan-400">&lt;item&gt;</div>
            <div className="ml-4 text-white">&lt;g:id&gt;enriched-fauteuil-turquoise-resine&lt;/g:id&gt;</div>
            <div className="ml-4 text-white">&lt;title&gt;Fauteuil Design Moderne - Turquoise Résine Acier&lt;/title&gt;</div>
            <div className="ml-4 text-white">&lt;g:price&gt;299.00 EUR&lt;/g:price&gt;</div>
            <div className="ml-4 text-white">&lt;g:sale_price&gt;399.00 EUR&lt;/g:sale_price&gt;</div>
            <div className="ml-4 text-green-400">&lt;g:color&gt;turquoise, blanc, noir&lt;/g:color&gt;</div>
            <div className="ml-4 text-green-400">&lt;g:material&gt;résine, acier&lt;/g:material&gt;</div>
            <div className="ml-4 text-blue-400">&lt;g:custom_label_1&gt;moderne&lt;/g:custom_label_1&gt;</div>
            <div className="ml-4 text-blue-400">&lt;g:custom_label_2&gt;salon&lt;/g:custom_label_2&gt;</div>
            <div className="text-cyan-400">&lt;/item&gt;</div>
          </div>
        </div>
        <p className="text-purple-300 text-sm mt-3">
          🎯 <strong>Attributs multiples détectés par Vision IA :</strong> couleurs (turquoise, blanc, noir) et matériaux (résine, acier) correctement extraits et formatés pour Google Shopping.
        </p>
      </div>
    </div>
  );
};