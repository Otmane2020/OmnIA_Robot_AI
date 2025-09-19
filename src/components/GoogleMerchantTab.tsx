import React, { useState, useEffect } from 'react';
import { 
  Globe, Download, ExternalLink, RefreshCw, Eye, Settings, 
  BarChart3, CheckCircle, AlertCircle, Loader2, Copy, Link
} from 'lucide-react';
import { useNotifications } from './NotificationSystem';

export const GoogleMerchantTab: React.FC = () => {
  const [feedUrl, setFeedUrl] = useState('');
  const [feedStats, setFeedStats] = useState<any>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [lastGenerated, setLastGenerated] = useState<string | null>(null);
  const { showSuccess, showError, showInfo } = useNotifications();

  useEffect(() => {
    generateFeedUrl();
    loadFeedStats();
  }, []);

  const generateFeedUrl = () => {
    const baseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://omnia.sale';
    const url = `${baseUrl}/functions/v1/google-merchant-feed?format=xml&retailer_id=demo-retailer-id`;
    setFeedUrl(url);
  };

  const loadFeedStats = async () => {
    try {
      // Simuler les stats du flux
      const stats = {
        total_products: 247,
        active_products: 234,
        with_images: 220,
        with_seo: 180,
        categories: ['Canapé', 'Table', 'Chaise', 'Lit', 'Rangement'],
        last_updated: new Date().toISOString(),
        google_status: 'approved'
      };
      setFeedStats(stats);
    } catch (error) {
      console.error('Erreur chargement stats flux:', error);
    }
  };

  const generateFeed = async () => {
    setIsGenerating(true);
    showInfo('Génération flux', 'Création du flux Google Merchant en cours...');

    try {
      const response = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/google-merchant-feed`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          retailer_id: 'demo-retailer-id',
          format: 'xml'
        }),
      });

      if (response.ok) {
        setLastGenerated(new Date().toISOString());
        await loadFeedStats();
        showSuccess('Flux généré', 'Flux Google Merchant créé avec succès !');
      } else {
        throw new Error('Erreur génération flux');
      }
    } catch (error) {
      showError('Erreur génération', 'Impossible de générer le flux Google Merchant.');
    } finally {
      setIsGenerating(false);
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
          <h2 className="text-2xl font-bold text-white">Flux Google Merchant</h2>
          <p className="text-gray-300">Gestion automatique du flux produits pour Google Shopping</p>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 bg-green-400 rounded-full animate-pulse"></div>
          <span className="text-green-300 text-sm">Flux actif</span>
        </div>
      </div>

      {/* URL du flux */}
      <div className="bg-white/10 backdrop-blur-xl rounded-2xl p-8 border border-white/20">
        <h3 className="text-xl font-bold text-white mb-6">URL du flux</h3>
        
        <div className="space-y-4">
          <div className="flex gap-3">
            <input
              type="text"
              value={feedUrl}
              readOnly
              className="flex-1 bg-black/40 border border-cyan-500/50 rounded-xl px-4 py-3 text-white font-mono text-sm"
            />
            <button
              onClick={copyFeedUrl}
              className="bg-cyan-600 hover:bg-cyan-700 text-white px-4 py-3 rounded-xl flex items-center gap-2 transition-all"
            >
              <Copy className="w-4 h-4" />
              Copier
            </button>
            <button
              onClick={() => window.open(feedUrl, '_blank')}
              className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-3 rounded-xl flex items-center gap-2 transition-all"
            >
              <ExternalLink className="w-4 h-4" />
              Voir
            </button>
          </div>
          
          <div className="bg-blue-500/20 border border-blue-400/50 rounded-xl p-4">
            <h4 className="font-semibold text-blue-200 mb-2">📋 Configuration Google Merchant Center :</h4>
            <ol className="text-blue-300 text-sm space-y-1">
              <li>1. Connectez-vous à <a href="https://merchants.google.com" target="_blank" className="text-cyan-400 underline">Google Merchant Center</a></li>
              <li>2. Allez dans "Produits" → "Flux"</li>
              <li>3. Cliquez "Ajouter un flux" → "Flux programmé"</li>
              <li>4. Collez l'URL ci-dessus</li>
              <li>5. Définissez la fréquence : "Quotidienne"</li>
            </ol>
          </div>
        </div>
      </div>

      {/* Statistiques du flux */}
      {feedStats && (
        <div className="bg-white/10 backdrop-blur-xl rounded-2xl p-8 border border-white/20">
          <h3 className="text-xl font-bold text-white mb-6">Statistiques du flux</h3>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-6">
            <div className="bg-green-600/20 rounded-xl p-4 text-center">
              <div className="text-2xl font-bold text-green-400">{feedStats.active_products}</div>
              <div className="text-green-300 text-sm">Produits actifs</div>
            </div>
            <div className="bg-blue-600/20 rounded-xl p-4 text-center">
              <div className="text-2xl font-bold text-blue-400">{feedStats.with_images}</div>
              <div className="text-blue-300 text-sm">Avec images</div>
            </div>
            <div className="bg-purple-600/20 rounded-xl p-4 text-center">
              <div className="text-2xl font-bold text-purple-400">{feedStats.with_seo}</div>
              <div className="text-purple-300 text-sm">SEO optimisé</div>
            </div>
            <div className="bg-orange-600/20 rounded-xl p-4 text-center">
              <div className="text-2xl font-bold text-orange-400">{feedStats.categories.length}</div>
              <div className="text-orange-300 text-sm">Catégories</div>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h4 className="font-semibold text-white mb-3">📊 Catégories :</h4>
              <div className="flex flex-wrap gap-2">
                {feedStats.categories.map((category: string, index: number) => (
                  <span key={index} className="bg-cyan-500/20 text-cyan-300 px-3 py-1 rounded-full text-sm">
                    {category}
                  </span>
                ))}
              </div>
            </div>
            <div>
              <h4 className="font-semibold text-white mb-3">🕐 Dernière mise à jour :</h4>
              <p className="text-gray-300">
                {new Date(feedStats.last_updated).toLocaleDateString('fr-FR', {
                  day: '2-digit',
                  month: '2-digit',
                  year: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit'
                })}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Actions */}
      <div className="bg-white/10 backdrop-blur-xl rounded-2xl p-8 border border-white/20">
        <h3 className="text-xl font-bold text-white mb-6">Actions</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <button
            onClick={generateFeed}
            disabled={isGenerating}
            className="bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-400 hover:to-emerald-500 disabled:from-gray-600 disabled:to-gray-700 text-white px-6 py-4 rounded-xl font-semibold transition-all flex items-center justify-center gap-2"
          >
            {isGenerating ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                Génération...
              </>
            ) : (
              <>
                <RefreshCw className="w-5 h-5" />
                Régénérer flux
              </>
            )}
          </button>
          
          <button
            onClick={() => window.open(`${feedUrl}&format=csv`, '_blank')}
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-4 rounded-xl font-semibold transition-all flex items-center justify-center gap-2"
          >
            <Download className="w-5 h-5" />
            Télécharger CSV
          </button>
          
          <button
            onClick={() => window.open('https://merchants.google.com', '_blank')}
            className="bg-purple-600 hover:bg-purple-700 text-white px-6 py-4 rounded-xl font-semibold transition-all flex items-center justify-center gap-2"
          >
            <Globe className="w-5 h-5" />
            Google Merchant
          </button>
        </div>
      </div>
    </div>
  );
};