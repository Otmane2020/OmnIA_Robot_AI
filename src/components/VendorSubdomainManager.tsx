import React, { useState, useEffect } from 'react';
import { Globe, CheckCircle, AlertCircle, Loader2, ExternalLink, Settings, Plus, Trash2 } from 'lucide-react';
import { useNotifications } from './NotificationSystem';

interface Subdomain {
  id: string;
  vendor_id: string;
  subdomain: string;
  dns_status: 'pending' | 'active' | 'failed';
  ssl_status: 'pending' | 'active' | 'failed';
  created_at: string;
  activated_at?: string;
}

interface VendorSubdomainManagerProps {
  vendorId: string;
  companyName: string;
}

export const VendorSubdomainManager: React.FC<VendorSubdomainManagerProps> = ({ vendorId, companyName }) => {
  const [subdomains, setSubdomains] = useState<Subdomain[]>([]);
  const [newSubdomain, setNewSubdomain] = useState('');
  const [isCreating, setIsCreating] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const { showSuccess, showError, showInfo } = useNotifications();

  useEffect(() => {
    loadSubdomains();
  }, [vendorId]);

  const loadSubdomains = async () => {
    try {
      setIsLoading(true);
      
      // Simuler le chargement des sous-domaines
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // Générer sous-domaine par défaut basé sur le nom de l'entreprise
      const defaultSubdomain = companyName.toLowerCase().replace(/[^a-z0-9]/g, '').substring(0, 20);
      
      const mockSubdomains: Subdomain[] = [
        {
          id: `subdomain-${vendorId}`,
          vendor_id: vendorId,
          subdomain: defaultSubdomain,
          dns_status: 'active',
          ssl_status: 'active',
          created_at: new Date().toISOString(),
          activated_at: new Date().toISOString()
        }
      ];
      
      setSubdomains(mockSubdomains);
      console.log('✅ Sous-domaines chargés:', mockSubdomains.length);
      
    } catch (error) {
      console.error('❌ Erreur chargement sous-domaines:', error);
      showError('Erreur de chargement', 'Impossible de charger les sous-domaines.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateSubdomain = async () => {
    if (!newSubdomain.trim()) {
      showError('Sous-domaine requis', 'Veuillez saisir un nom de sous-domaine.');
      return;
    }

    // Valider le format du sous-domaine
    const subdomainRegex = /^[a-z0-9][a-z0-9-]*[a-z0-9]$/;
    if (!subdomainRegex.test(newSubdomain)) {
      showError('Format invalide', 'Le sous-domaine doit contenir uniquement des lettres, chiffres et tirets.');
      return;
    }

    setIsCreating(true);
    
    try {
      // Simuler la création du sous-domaine
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      const newSubdomainData: Subdomain = {
        id: `subdomain-${Date.now()}`,
        vendor_id: vendorId,
        subdomain: newSubdomain,
        dns_status: 'pending',
        ssl_status: 'pending',
        created_at: new Date().toISOString()
      };
      
      setSubdomains(prev => [...prev, newSubdomainData]);
      setNewSubdomain('');
      
      showSuccess(
        'Sous-domaine créé',
        `${newSubdomain}.omnia.sale a été créé avec succès !`,
        [
          {
            label: 'Voir le site',
            action: () => window.open(`https://${newSubdomain}.omnia.sale`, '_blank'),
            variant: 'primary'
          }
        ]
      );
      
    } catch (error) {
      showError('Erreur de création', 'Impossible de créer le sous-domaine.');
    } finally {
      setIsCreating(false);
    }
  };

  const handleDeleteSubdomain = async (subdomainId: string) => {
    if (!confirm('Supprimer ce sous-domaine ? Cette action est irréversible.')) {
      return;
    }

    try {
      setSubdomains(prev => prev.filter(s => s.id !== subdomainId));
      showSuccess('Sous-domaine supprimé', 'Le sous-domaine a été supprimé avec succès.');
    } catch (error) {
      showError('Erreur de suppression', 'Impossible de supprimer le sous-domaine.');
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-500/20 text-green-300';
      case 'pending': return 'bg-yellow-500/20 text-yellow-300';
      case 'failed': return 'bg-red-500/20 text-red-300';
      default: return 'bg-gray-500/20 text-gray-300';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active': return CheckCircle;
      case 'pending': return Loader2;
      case 'failed': return AlertCircle;
      default: return AlertCircle;
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="text-center">
          <Loader2 className="w-16 h-16 text-cyan-400 animate-spin mx-auto mb-4" />
          <p className="text-white text-lg">Chargement des sous-domaines...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-white">Gestion des Sous-domaines</h2>
          <p className="text-gray-300">Gérez vos domaines personnalisés OmnIA</p>
        </div>
        <div className="flex items-center gap-2">
          <Globe className="w-5 h-5 text-cyan-400" />
          <span className="text-cyan-300">{subdomains.length} sous-domaine(s)</span>
        </div>
      </div>

      {/* Création nouveau sous-domaine */}
      <div className="bg-white/10 backdrop-blur-xl rounded-2xl p-8 border border-white/20">
        <h3 className="text-xl font-bold text-white mb-6">Créer un nouveau sous-domaine</h3>
        
        <div className="flex gap-4">
          <div className="flex-1">
            <div className="flex items-center">
              <input
                type="text"
                value={newSubdomain}
                onChange={(e) => setNewSubdomain(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ''))}
                placeholder="nom-boutique"
                className="flex-1 bg-black/40 border border-cyan-500/50 rounded-l-xl px-4 py-3 text-white placeholder-cyan-400 focus:outline-none focus:border-cyan-400"
              />
              <div className="bg-cyan-500/20 border border-cyan-500/50 border-l-0 rounded-r-xl px-4 py-3 text-cyan-300 font-semibold">
                .omnia.sale
              </div>
            </div>
          </div>
          
          <button
            onClick={handleCreateSubdomain}
            disabled={isCreating || !newSubdomain.trim()}
            className="bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 disabled:from-gray-600 disabled:to-gray-700 text-white px-6 py-3 rounded-xl font-semibold transition-all disabled:cursor-not-allowed flex items-center gap-2"
          >
            {isCreating ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                Création...
              </>
            ) : (
              <>
                <Plus className="w-5 h-5" />
                Créer
              </>
            )}
          </button>
        </div>
        
        <div className="mt-4 text-sm text-gray-400">
          <p>• Utilisez uniquement des lettres, chiffres et tirets</p>
          <p>• Le sous-domaine doit faire entre 3 et 20 caractères</p>
          <p>• Configuration DNS et SSL automatique</p>
        </div>
      </div>

      {/* Liste des sous-domaines */}
      <div className="bg-white/10 backdrop-blur-xl rounded-2xl border border-white/20 overflow-hidden">
        <div className="p-6 border-b border-white/10">
          <h3 className="text-xl font-bold text-white">Sous-domaines actifs</h3>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-black/20">
              <tr>
                <th className="text-left p-4 text-cyan-300 font-semibold">Sous-domaine</th>
                <th className="text-left p-4 text-cyan-300 font-semibold">DNS</th>
                <th className="text-left p-4 text-cyan-300 font-semibold">SSL</th>
                <th className="text-left p-4 text-cyan-300 font-semibold">Créé le</th>
                <th className="text-left p-4 text-cyan-300 font-semibold">Actions</th>
              </tr>
            </thead>
            <tbody>
              {subdomains.map((subdomain) => {
                const DNSIcon = getStatusIcon(subdomain.dns_status);
                const SSLIcon = getStatusIcon(subdomain.ssl_status);
                
                return (
                  <tr key={subdomain.id} className="border-b border-white/10 hover:bg-white/5">
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        <Globe className="w-5 h-5 text-cyan-400" />
                        <div>
                          <div className="font-semibold text-white">
                            {subdomain.subdomain}.omnia.sale
                          </div>
                          <div className="text-gray-400 text-xs">
                            ID: {subdomain.id.substring(0, 8)}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="p-4">
                      <div className="flex items-center gap-2">
                        <DNSIcon className={`w-4 h-4 ${subdomain.dns_status === 'pending' ? 'animate-spin' : ''}`} />
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(subdomain.dns_status)}`}>
                          {subdomain.dns_status}
                        </span>
                      </div>
                    </td>
                    <td className="p-4">
                      <div className="flex items-center gap-2">
                        <SSLIcon className={`w-4 h-4 ${subdomain.ssl_status === 'pending' ? 'animate-spin' : ''}`} />
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(subdomain.ssl_status)}`}>
                          {subdomain.ssl_status}
                        </span>
                      </div>
                    </td>
                    <td className="p-4">
                      <div className="text-white text-sm">
                        {new Date(subdomain.created_at).toLocaleDateString('fr-FR')}
                      </div>
                      {subdomain.activated_at && (
                        <div className="text-gray-400 text-xs">
                          Activé: {new Date(subdomain.activated_at).toLocaleDateString('fr-FR')}
                        </div>
                      )}
                    </td>
                    <td className="p-4">
                      <div className="flex gap-2">
                        <a
                          href={`https://${subdomain.subdomain}.omnia.sale`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-400 hover:text-blue-300 p-1"
                          title="Ouvrir le site"
                        >
                          <ExternalLink className="w-4 h-4" />
                        </a>
                        <button
                          className="text-purple-400 hover:text-purple-300 p-1"
                          title="Configurer"
                        >
                          <Settings className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteSubdomain(subdomain.id)}
                          className="text-red-400 hover:text-red-300 p-1"
                          title="Supprimer"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Informations sur les sous-domaines */}
      <div className="bg-gradient-to-r from-cyan-500/20 to-blue-600/20 backdrop-blur-xl rounded-2xl p-6 border border-cyan-400/30">
        <h3 className="text-lg font-bold text-white mb-4">💡 À propos des sous-domaines OmnIA</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h4 className="font-semibold text-cyan-300 mb-2">🌐 Fonctionnalités :</h4>
            <ul className="text-cyan-200 text-sm space-y-1">
              <li>• Interface admin personnalisée</li>
              <li>• Chat client avec votre marque</li>
              <li>• SSL automatique et sécurisé</li>
              <li>• Analytics dédiées</li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold text-cyan-300 mb-2">⚙️ Configuration :</h4>
            <ul className="text-cyan-200 text-sm space-y-1">
              <li>• DNS configuré automatiquement</li>
              <li>• Certificat SSL Let's Encrypt</li>
              <li>• CDN global pour performance</li>
              <li>• Monitoring 24/7</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};