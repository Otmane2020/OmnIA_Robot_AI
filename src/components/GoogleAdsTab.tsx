import React, { useState, useEffect } from 'react';
import { 
  Target, TrendingUp, DollarSign, Eye, Settings, Play, Pause,
  BarChart3, Users, ShoppingCart, Zap, AlertCircle, CheckCircle
} from 'lucide-react';
import { useNotifications } from './NotificationSystem';

interface Campaign {
  id: string;
  name: string;
  type: 'performance_max' | 'search' | 'shopping';
  status: 'active' | 'paused' | 'draft';
  budget: number;
  spend: number;
  impressions: number;
  clicks: number;
  conversions: number;
  roas: number;
  created_at: string;
}

export const GoogleAdsTab: React.FC = () => {
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [isCreating, setIsCreating] = useState(false);
  const [selectedCampaign, setSelectedCampaign] = useState<string | null>(null);
  const { showSuccess, showError, showInfo } = useNotifications();

  useEffect(() => {
    loadCampaigns();
  }, []);

  const loadCampaigns = () => {
    // Simuler des campagnes Performance Max
    const mockCampaigns: Campaign[] = [
      {
        id: 'pmax-decora-1',
        name: 'Performance Max - Mobilier Decora Home',
        type: 'performance_max',
        status: 'active',
        budget: 50,
        spend: 42.30,
        impressions: 15420,
        clicks: 234,
        conversions: 12,
        roas: 4.2,
        created_at: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString()
      },
      {
        id: 'pmax-canapes-2',
        name: 'Performance Max - Canapés Premium',
        type: 'performance_max',
        status: 'active',
        budget: 30,
        spend: 28.90,
        impressions: 8930,
        clicks: 156,
        conversions: 8,
        roas: 3.8,
        created_at: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString()
      },
      {
        id: 'shopping-tables-3',
        name: 'Shopping - Tables & Chaises',
        type: 'shopping',
        status: 'paused',
        budget: 25,
        spend: 18.50,
        impressions: 5240,
        clicks: 89,
        conversions: 4,
        roas: 2.9,
        created_at: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString()
      }
    ];
    setCampaigns(mockCampaigns);
  };

  const createPerformanceMaxCampaign = async () => {
    setIsCreating(true);
    showInfo('Création campagne', 'Création automatique d\'une campagne Performance Max...');

    try {
      // Simuler la création
      await new Promise(resolve => setTimeout(resolve, 3000));

      const newCampaign: Campaign = {
        id: `pmax-auto-${Date.now()}`,
        name: `Performance Max Auto - ${new Date().toLocaleDateString('fr-FR')}`,
        type: 'performance_max',
        status: 'draft',
        budget: 40,
        spend: 0,
        impressions: 0,
        clicks: 0,
        conversions: 0,
        roas: 0,
        created_at: new Date().toISOString()
      };

      setCampaigns(prev => [newCampaign, ...prev]);
      
      showSuccess(
        'Campagne créée !',
        'Performance Max créée automatiquement avec vos produits enrichis !',
        [
          {
            label: 'Voir dans Google Ads',
            action: () => window.open('https://ads.google.com', '_blank'),
            variant: 'primary'
          }
        ]
      );
    } catch (error) {
      showError('Erreur création', 'Impossible de créer la campagne Performance Max.');
    } finally {
      setIsCreating(false);
    }
  };

  const toggleCampaign = (campaignId: string) => {
    setCampaigns(prev => prev.map(campaign => 
      campaign.id === campaignId 
        ? { ...campaign, status: campaign.status === 'active' ? 'paused' : 'active' }
        : campaign
    ));
    
    const campaign = campaigns.find(c => c.id === campaignId);
    const newStatus = campaign?.status === 'active' ? 'paused' : 'active';
    
    showSuccess(
      'Campagne mise à jour',
      `Campagne ${newStatus === 'active' ? 'activée' : 'mise en pause'} !`
    );
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-500/20 text-green-300';
      case 'paused': return 'bg-yellow-500/20 text-yellow-300';
      case 'draft': return 'bg-gray-500/20 text-gray-300';
      default: return 'bg-gray-500/20 text-gray-300';
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'performance_max': return 'bg-purple-500/20 text-purple-300';
      case 'shopping': return 'bg-blue-500/20 text-blue-300';
      case 'search': return 'bg-green-500/20 text-green-300';
      default: return 'bg-gray-500/20 text-gray-300';
    }
  };

  return (
    <div className="space-y-8">
      {/* Header avec stats globales */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-green-600/20 backdrop-blur-xl rounded-2xl p-6 border border-green-500/30">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-green-200 text-sm mb-1">Dépenses</p>
              <p className="text-2xl font-bold text-white">€{campaigns.reduce((sum, c) => sum + c.spend, 0).toFixed(2)}</p>
              <p className="text-green-300 text-sm">Ce mois</p>
            </div>
            <DollarSign className="w-8 h-8 text-green-400" />
          </div>
        </div>
        
        <div className="bg-blue-600/20 backdrop-blur-xl rounded-2xl p-6 border border-blue-500/30">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-blue-200 text-sm mb-1">Clics</p>
              <p className="text-2xl font-bold text-white">{campaigns.reduce((sum, c) => sum + c.clicks, 0).toLocaleString()}</p>
              <p className="text-blue-300 text-sm">Total</p>
            </div>
            <Eye className="w-8 h-8 text-blue-400" />
          </div>
        </div>
        
        <div className="bg-purple-600/20 backdrop-blur-xl rounded-2xl p-6 border border-purple-500/30">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-purple-200 text-sm mb-1">Conversions</p>
              <p className="text-2xl font-bold text-white">{campaigns.reduce((sum, c) => sum + c.conversions, 0)}</p>
              <p className="text-purple-300 text-sm">Ventes</p>
            </div>
            <ShoppingCart className="w-8 h-8 text-purple-400" />
          </div>
        </div>
        
        <div className="bg-orange-600/20 backdrop-blur-xl rounded-2xl p-6 border border-orange-500/30">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-orange-200 text-sm mb-1">ROAS Moyen</p>
              <p className="text-2xl font-bold text-white">{(campaigns.reduce((sum, c) => sum + c.roas, 0) / campaigns.length).toFixed(1)}</p>
              <p className="text-orange-300 text-sm">Retour pub</p>
            </div>
            <TrendingUp className="w-8 h-8 text-orange-400" />
          </div>
        </div>
      </div>

      {/* Création automatique Performance Max */}
      <div className="bg-white/10 backdrop-blur-xl rounded-2xl p-8 border border-white/20">
        <h3 className="text-xl font-bold text-white mb-6">Création automatique Performance Max</h3>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div>
            <h4 className="font-semibold text-cyan-300 mb-3">🎯 Configuration automatique :</h4>
            <ul className="text-cyan-200 text-sm space-y-2">
              <li>• <strong>Flux produits :</strong> Synchronisation automatique depuis votre catalogue</li>
              <li>• <strong>Images :</strong> Toutes les images produits incluses</li>
              <li>• <strong>Audiences :</strong> Ciblage intelligent basé sur l'IA</li>
              <li>• <strong>Enchères :</strong> Optimisation automatique pour conversions</li>
              <li>• <strong>Extensions :</strong> Prix, promotions, avis automatiques</li>
            </ul>
          </div>
          
          <div>
            <h4 className="font-semibold text-green-300 mb-3">✨ Avantages Performance Max :</h4>
            <ul className="text-green-200 text-sm space-y-2">
              <li>• <strong>Tous les réseaux :</strong> Search, Shopping, YouTube, Display, Gmail</li>
              <li>• <strong>IA Google :</strong> Optimisation automatique des enchères</li>
              <li>• <strong>Audiences intelligentes :</strong> Ciblage prédictif</li>
              <li>• <strong>Créations automatiques :</strong> Annonces générées par IA</li>
              <li>• <strong>ROI optimisé :</strong> +30% de conversions en moyenne</li>
            </ul>
          </div>
        </div>
        
        <div className="mt-6">
          <button
            onClick={createPerformanceMaxCampaign}
            disabled={isCreating}
            className="bg-gradient-to-r from-purple-500 to-pink-600 hover:from-purple-400 hover:to-pink-500 disabled:from-gray-600 disabled:to-gray-700 text-white px-8 py-4 rounded-xl font-bold transition-all flex items-center gap-3"
          >
            {isCreating ? (
              <>
                <Loader2 className="w-6 h-6 animate-spin" />
                Création en cours...
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
                    <h4 className="font-semibold text-white">{campaign.name}</h4>
                    <div className="flex items-center gap-2 mt-1">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getTypeColor(campaign.type)}`}>
                        {campaign.type.replace('_', ' ')}
                      </span>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(campaign.status)}`}>
                        {campaign.status}
                      </span>
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => toggleCampaign(campaign.id)}
                    className={`p-2 rounded-xl transition-all ${
                      campaign.status === 'active' 
                        ? 'bg-yellow-600 hover:bg-yellow-700 text-white' 
                        : 'bg-green-600 hover:bg-green-700 text-white'
                    }`}
                  >
                    {campaign.status === 'active' ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                  </button>
                  <button className="p-2 bg-gray-600 hover:bg-gray-700 text-white rounded-xl transition-all">
                    <Settings className="w-4 h-4" />
                  </button>
                </div>
              </div>
              
              <div className="grid grid-cols-2 md:grid-cols-6 gap-4 text-sm">
                <div>
                  <div className="text-gray-400">Budget</div>
                  <div className="font-bold text-white">€{campaign.budget}/jour</div>
                </div>
                <div>
                  <div className="text-gray-400">Dépensé</div>
                  <div className="font-bold text-green-400">€{campaign.spend.toFixed(2)}</div>
                </div>
                <div>
                  <div className="text-gray-400">Impressions</div>
                  <div className="font-bold text-blue-400">{campaign.impressions.toLocaleString()}</div>
                </div>
                <div>
                  <div className="text-gray-400">Clics</div>
                  <div className="font-bold text-purple-400">{campaign.clicks}</div>
                </div>
                <div>
                  <div className="text-gray-400">Conversions</div>
                  <div className="font-bold text-orange-400">{campaign.conversions}</div>
                </div>
                <div>
                  <div className="text-gray-400">ROAS</div>
                  <div className={`font-bold ${campaign.roas >= 4 ? 'text-green-400' : campaign.roas >= 2 ? 'text-yellow-400' : 'text-red-400'}`}>
                    {campaign.roas.toFixed(1)}x
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Optimisations automatiques */}
      <div className="bg-gradient-to-r from-purple-500/20 to-pink-600/20 backdrop-blur-xl rounded-2xl p-8 border border-purple-400/30">
        <h3 className="text-xl font-bold text-white mb-6">🤖 Optimisations IA automatiques</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h4 className="font-semibold text-purple-300 mb-3">🎯 Ciblage intelligent :</h4>
            <ul className="text-purple-200 text-sm space-y-1">
              <li>• Audiences similaires basées sur vos conversions</li>
              <li>• Ciblage géographique optimisé par performance</li>
              <li>• Exclusions automatiques des audiences non-performantes</li>
              <li>• Ajustements d'enchères par appareil et heure</li>
            </ul>
          </div>
          
          <div>
            <h4 className="font-semibold text-pink-300 mb-3">📊 Optimisation continue :</h4>
            <ul className="text-pink-200 text-sm space-y-1">
              <li>• Ajustement automatique des budgets par performance</li>
              <li>• Rotation des créations selon les CTR</li>
              <li>• Optimisation des mots-clés négatifs</li>
              <li>• Rapports hebdomadaires automatiques</li>
            </ul>
          </div>
        </div>
        
        <div className="mt-6 flex gap-4">
          <button className="bg-purple-600 hover:bg-purple-700 text-white px-6 py-3 rounded-xl font-semibold transition-all">
            Activer optimisations IA
          </button>
          <button className="bg-pink-600 hover:bg-pink-700 text-white px-6 py-3 rounded-xl font-semibold transition-all">
            Configurer audiences
          </button>
        </div>
      </div>
    </div>
  );
};