import React, { useState, useEffect } from 'react';
import { 
  Target, TrendingUp, DollarSign, Eye, Play, Pause, Settings,
  BarChart3, Users, MousePointer, ShoppingCart, Zap, Brain,
  AlertCircle, CheckCircle, Plus, Edit, Trash2, ExternalLink
} from 'lucide-react';
import { useNotifications } from './NotificationSystem';

interface GoogleAdsStats {
  total_spend: number;
  total_clicks: number;
  total_impressions: number;
  total_conversions: number;
  avg_cpc: number;
  avg_ctr: number;
  roas: number;
  active_campaigns: number;
}

interface AdsCampaign {
  id: string;
  name: string;
  type: 'Performance Max' | 'Search' | 'Shopping' | 'Display';
  status: 'active' | 'paused' | 'ended';
  budget: number;
  spend: number;
  clicks: number;
  impressions: number;
  conversions: number;
  ctr: number;
  cpc: number;
  roas: number;
  created_at: string;
}

export const GoogleAdsTab: React.FC = () => {
  const [stats, setStats] = useState<GoogleAdsStats>({
    total_spend: 2450,
    total_clicks: 1240,
    total_impressions: 45600,
    total_conversions: 89,
    avg_cpc: 1.98,
    avg_ctr: 2.7,
    roas: 4.2,
    active_campaigns: 3
  });
  
  const [campaigns, setCampaigns] = useState<AdsCampaign[]>([]);
  const [isCreating, setIsCreating] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const { showSuccess, showError, showInfo } = useNotifications();

  useEffect(() => {
    loadCampaigns();
  }, []);

  const loadCampaigns = () => {
    const mockCampaigns: AdsCampaign[] = [
      {
        id: 'pmax-mobilier-2025',
        name: 'Performance Max - Mobilier 2025',
        type: 'Performance Max',
        status: 'active',
        budget: 50,
        spend: 1200,
        clicks: 680,
        impressions: 25400,
        conversions: 45,
        ctr: 2.7,
        cpc: 1.76,
        roas: 4.8,
        created_at: '2025-01-01T00:00:00Z'
      },
      {
        id: 'search-canapes',
        name: 'Search - Canapés Premium',
        type: 'Search',
        status: 'active',
        budget: 30,
        spend: 890,
        clicks: 420,
        impressions: 15200,
        conversions: 28,
        ctr: 2.8,
        cpc: 2.12,
        roas: 3.9,
        created_at: '2024-12-15T00:00:00Z'
      },
      {
        id: 'shopping-tables',
        name: 'Shopping - Tables Design',
        type: 'Shopping',
        status: 'paused',
        budget: 25,
        spend: 360,
        clicks: 140,
        impressions: 5000,
        conversions: 16,
        ctr: 2.8,
        cpc: 2.57,
        roas: 3.2,
        created_at: '2024-11-20T00:00:00Z'
      }
    ];
    
    setCampaigns(mockCampaigns);
  };

  const handleCreatePerformanceMax = async () => {
    setIsCreating(true);
    showInfo('Création campagne', 'Création automatique d\'une campagne Performance Max avec IA...');

    try {
      // Simuler la création
      await new Promise(resolve => setTimeout(resolve, 3000));
      
      const newCampaign: AdsCampaign = {
        id: `pmax-${Date.now()}`,
        name: 'Performance Max - IA Auto',
        type: 'Performance Max',
        status: 'active',
        budget: 40,
        spend: 0,
        clicks: 0,
        impressions: 0,
        conversions: 0,
        ctr: 0,
        cpc: 0,
        roas: 0,
        created_at: new Date().toISOString()
      };
      
      setCampaigns(prev => [newCampaign, ...prev]);
      
      showSuccess(
        'Campagne créée !',
        'Campagne Performance Max créée automatiquement avec ciblage IA optimisé !',
        [
          {
            label: 'Voir dans Google Ads',
            action: () => window.open('https://ads.google.com', '_blank'),
            variant: 'primary'
          }
        ]
      );
    } catch (error) {
      showError('Erreur création', 'Impossible de créer la campagne automatiquement.');
    } finally {
      setIsCreating(false);
    }
  };

  const toggleCampaignStatus = (campaignId: string) => {
    setCampaigns(prev => prev.map(campaign => 
      campaign.id === campaignId 
        ? { ...campaign, status: campaign.status === 'active' ? 'paused' : 'active' }
        : campaign
    ));
    
    const campaign = campaigns.find(c => c.id === campaignId);
    const newStatus = campaign?.status === 'active' ? 'paused' : 'active';
    
    showSuccess(
      'Campagne mise à jour',
      `Campagne ${newStatus === 'active' ? 'activée' : 'mise en pause'} avec succès !`
    );
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-500/20 text-green-300';
      case 'paused': return 'bg-yellow-500/20 text-yellow-300';
      case 'ended': return 'bg-red-500/20 text-red-300';
      default: return 'bg-gray-500/20 text-gray-300';
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'Performance Max': return 'bg-purple-500/20 text-purple-300';
      case 'Search': return 'bg-blue-500/20 text-blue-300';
      case 'Shopping': return 'bg-green-500/20 text-green-300';
      case 'Display': return 'bg-orange-500/20 text-orange-300';
      default: return 'bg-gray-500/20 text-gray-300';
    }
  };

  return (
    <div className="space-y-8">
      {/* Stats globales */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-green-600/20 backdrop-blur-xl rounded-2xl p-6 border border-green-500/30">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-green-200 text-sm mb-1">Dépenses</p>
              <p className="text-3xl font-bold text-white mb-1">€{stats.total_spend.toLocaleString()}</p>
              <p className="text-green-300 text-sm">Ce mois</p>
            </div>
            <DollarSign className="w-10 h-10 text-green-400" />
          </div>
        </div>
        
        <div className="bg-blue-600/20 backdrop-blur-xl rounded-2xl p-6 border border-blue-500/30">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-blue-200 text-sm mb-1">Clics</p>
              <p className="text-3xl font-bold text-white mb-1">{stats.total_clicks.toLocaleString()}</p>
              <p className="text-blue-300 text-sm">CTR: {stats.avg_ctr}%</p>
            </div>
            <MousePointer className="w-10 h-10 text-blue-400" />
          </div>
        </div>
        
        <div className="bg-purple-600/20 backdrop-blur-xl rounded-2xl p-6 border border-purple-500/30">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-purple-200 text-sm mb-1">Conversions</p>
              <p className="text-3xl font-bold text-white mb-1">{stats.total_conversions}</p>
              <p className="text-purple-300 text-sm">Ventes</p>
            </div>
            <ShoppingCart className="w-10 h-10 text-purple-400" />
          </div>
        </div>
        
        <div className="bg-orange-600/20 backdrop-blur-xl rounded-2xl p-6 border border-orange-500/30">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-orange-200 text-sm mb-1">ROAS</p>
              <p className="text-3xl font-bold text-white mb-1">{stats.roas.toFixed(1)}x</p>
              <p className="text-orange-300 text-sm">Retour investissement</p>
            </div>
            <TrendingUp className="w-10 h-10 text-orange-400" />
          </div>
        </div>
      </div>

      {/* Création automatique Performance Max */}
      <div className="bg-white/10 backdrop-blur-xl rounded-2xl p-8 border border-white/20">
        <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
          <Brain className="w-6 h-6 text-purple-400" />
          Création automatique Performance Max
        </h3>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div>
            <h4 className="font-semibold text-cyan-300 mb-4">🤖 IA de campagne :</h4>
            <ul className="text-cyan-200 text-sm space-y-2">
              <li>• <strong>Analyse catalogue :</strong> Sélection produits performants</li>
              <li>• <strong>Ciblage intelligent :</strong> Audiences similaires automatiques</li>
              <li>• <strong>Enchères optimisées :</strong> CPA cible basé sur historique</li>
              <li>• <strong>Assets créatifs :</strong> Titres et descriptions générés</li>
              <li>• <strong>Extensions auto :</strong> Prix, promotions, avis</li>
              <li>• <strong>Optimisation continue :</strong> Ajustements quotidiens</li>
            </ul>
          </div>
          
          <div>
            <h4 className="font-semibold text-green-300 mb-4">📈 Résultats attendus :</h4>
            <ul className="text-green-200 text-sm space-y-2">
              <li>• <strong>+200% impressions</strong> vs campagnes manuelles</li>
              <li>• <strong>ROAS 4.5x+</strong> avec optimisation IA</li>
              <li>• <strong>CPC -30%</strong> grâce au machine learning</li>
              <li>• <strong>Couverture 100%</strong> : Search, Shopping, Display, YouTube</li>
              <li>• <strong>Audiences étendues</strong> : Découverte nouveaux clients</li>
              <li>• <strong>Gestion automatique</strong> : 0 intervention manuelle</li>
            </ul>
          </div>
        </div>
        
        <div className="mt-6">
          <button
            onClick={handleCreatePerformanceMax}
            disabled={isCreating}
            className="bg-gradient-to-r from-purple-500 to-pink-600 hover:from-purple-400 hover:to-pink-500 disabled:from-gray-600 disabled:to-gray-700 text-white px-8 py-4 rounded-xl font-bold transition-all flex items-center gap-3"
          >
            {isCreating ? (
              <>
                <div className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Création IA en cours...
              </>
            ) : (
              <>
                <Zap className="w-6 h-6" />
                Créer Performance Max automatique
              </>
            )}
          </button>
        </div>
      </div>

      {/* Liste des campagnes */}
      <div className="bg-white/10 backdrop-blur-xl rounded-2xl p-8 border border-white/20">
        <h3 className="text-xl font-bold text-white mb-6">Campagnes actives</h3>
        
        <div className="space-y-4">
          {campaigns.map((campaign) => (
            <div key={campaign.id} className="bg-black/20 rounded-xl p-6 border border-white/10">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-4">
                  <div>
                    <h4 className="font-semibold text-white text-lg">{campaign.name}</h4>
                    <div className="flex items-center gap-3 mt-1">
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${getTypeColor(campaign.type)}`}>
                        {campaign.type}
                      </span>
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(campaign.status)}`}>
                        {campaign.status}
                      </span>
                    </div>
                  </div>
                </div>
                
                <div className="flex gap-2">
                  <button
                    onClick={() => toggleCampaignStatus(campaign.id)}
                    className={`p-2 rounded-xl transition-all ${
                      campaign.status === 'active'
                        ? 'bg-yellow-600 hover:bg-yellow-700 text-white'
                        : 'bg-green-600 hover:bg-green-700 text-white'
                    }`}
                    title={campaign.status === 'active' ? 'Mettre en pause' : 'Activer'}
                  >
                    {campaign.status === 'active' ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                  </button>
                  <button className="p-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl transition-all">
                    <Settings className="w-4 h-4" />
                  </button>
                  <button className="p-2 bg-red-600 hover:bg-red-700 text-white rounded-xl transition-all">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
              
              <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4 text-sm">
                <div className="text-center">
                  <div className="text-white font-bold">€{campaign.budget}</div>
                  <div className="text-gray-400">Budget/jour</div>
                </div>
                <div className="text-center">
                  <div className="text-red-400 font-bold">€{campaign.spend}</div>
                  <div className="text-gray-400">Dépensé</div>
                </div>
                <div className="text-center">
                  <div className="text-blue-400 font-bold">{campaign.clicks}</div>
                  <div className="text-gray-400">Clics</div>
                </div>
                <div className="text-center">
                  <div className="text-purple-400 font-bold">{campaign.impressions.toLocaleString()}</div>
                  <div className="text-gray-400">Impressions</div>
                </div>
                <div className="text-center">
                  <div className="text-green-400 font-bold">{campaign.conversions}</div>
                  <div className="text-gray-400">Conversions</div>
                </div>
                <div className="text-center">
                  <div className="text-cyan-400 font-bold">{campaign.ctr.toFixed(1)}%</div>
                  <div className="text-gray-400">CTR</div>
                </div>
                <div className="text-center">
                  <div className="text-orange-400 font-bold">{campaign.roas.toFixed(1)}x</div>
                  <div className="text-gray-400">ROAS</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Optimisations IA */}
      <div className="bg-white/10 backdrop-blur-xl rounded-2xl p-8 border border-white/20">
        <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
          <Brain className="w-6 h-6 text-cyan-400" />
          Optimisations IA automatiques
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-green-500/20 border border-green-400/50 rounded-xl p-6">
            <h4 className="font-semibold text-green-200 mb-3">✅ Optimisations actives :</h4>
            <ul className="text-green-300 text-sm space-y-2">
              <li>• <strong>Enchères intelligentes :</strong> CPA cible ajusté quotidiennement</li>
              <li>• <strong>Audiences dynamiques :</strong> Mise à jour basée sur conversions</li>
              <li>• <strong>Mots-clés négatifs :</strong> Ajout automatique des termes non-convertisseurs</li>
              <li>• <strong>Extensions adaptatives :</strong> Promotions et prix en temps réel</li>
              <li>• <strong>Budgets flexibles :</strong> Réallocation selon performance</li>
            </ul>
          </div>
          
          <div className="bg-blue-500/20 border border-blue-400/50 rounded-xl p-6">
            <h4 className="font-semibold text-blue-200 mb-3">🎯 Prochaines optimisations :</h4>
            <ul className="text-blue-300 text-sm space-y-2">
              <li>• <strong>Saisonnalité :</strong> Ajustement budgets selon tendances</li>
              <li>• <strong>Géolocalisation :</strong> Ciblage zones à fort potentiel</li>
              <li>• <strong>Créatifs dynamiques :</strong> Tests A/B automatiques</li>
              <li>• <strong>Cross-selling :</strong> Produits complémentaires</li>
              <li>• <strong>Remarketing :</strong> Audiences personnalisées</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Actions rapides */}
      <div className="bg-gradient-to-r from-cyan-500/20 to-blue-600/20 backdrop-blur-xl rounded-2xl p-6 border border-cyan-400/30">
        <h3 className="text-lg font-bold text-white mb-4">Actions rapides</h3>
        <div className="flex flex-wrap gap-4">
          <button
            onClick={() => window.open('https://ads.google.com', '_blank')}
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-xl flex items-center gap-2 transition-all"
          >
            <ExternalLink className="w-4 h-4" />
            Google Ads
          </button>
          <button
            onClick={() => showInfo('Rapport en préparation', 'Génération du rapport de performance en cours...')}
            className="bg-purple-600 hover:bg-purple-700 text-white px-6 py-3 rounded-xl flex items-center gap-2 transition-all"
          >
            <BarChart3 className="w-4 h-4" />
            Rapport performance
          </button>
          <button
            onClick={() => showInfo('Optimisation lancée', 'Analyse IA des campagnes en cours pour optimisations...')}
            className="bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-xl flex items-center gap-2 transition-all"
          >
            <Zap className="w-4 h-4" />
            Optimiser avec IA
          </button>
        </div>
      </div>
    </div>
  );
};