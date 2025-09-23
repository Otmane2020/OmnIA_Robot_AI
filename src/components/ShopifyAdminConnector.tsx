import React, { useState } from 'react';
import { Store, Key, CheckCircle, AlertCircle, ExternalLink, Loader2 } from 'lucide-react';

interface ShopifyAdminConnectorProps {
  onConnected: (data: any) => void;
}

export const ShopifyAdminConnector: React.FC<ShopifyAdminConnectorProps> = ({ onConnected }) => {
  const [shopDomain, setShopDomain] = useState('');
  const [accessToken, setAccessToken] = useState('');
  const [isConnecting, setIsConnecting] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState<'idle' | 'testing' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState('');

  const handleConnect = async () => {
    if (!shopDomain || !accessToken) {
      setErrorMessage('Veuillez remplir tous les champs');
      return;
    }

    setIsConnecting(true);
    setConnectionStatus('testing');
    setErrorMessage('');

    try {
      // Simulate connection test
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      const mockData = {
        name: `Boutique ${shopDomain}`,
        platform: 'shopify_admin',
        products_count: 156,
        status: 'connected',
        shop_domain: shopDomain,
        connected_at: new Date().toISOString()
      };

      setConnectionStatus('success');
      onConnected(mockData);

    } catch (error) {
      setConnectionStatus('error');
      setErrorMessage('Erreur de connexion. Vérifiez vos identifiants.');
    } finally {
      setIsConnecting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="text-center">
        <Store className="w-16 h-16 text-green-400 mx-auto mb-4" />
        <h3 className="text-xl font-bold text-white mb-2">Connexion Shopify Admin</h3>
        <p className="text-gray-300">Connectez votre boutique avec un token d'accès Admin</p>
      </div>

      <div className="bg-blue-500/20 border border-blue-400/50 rounded-xl p-4">
        <h4 className="font-semibold text-blue-200 mb-2">📋 Prérequis :</h4>
        <ul className="text-blue-300 text-sm space-y-1">
          <li>• Accès admin à votre boutique Shopify</li>
          <li>• Token d'accès avec permissions produits</li>
          <li>• Boutique active et opérationnelle</li>
        </ul>
      </div>

      <div className="space-y-4">
        <div>
          <label className="block text-sm text-gray-300 mb-2">
            Domaine Shopify *
          </label>
          <input
            type="text"
            value={shopDomain}
            onChange={(e) => setShopDomain(e.target.value)}
            placeholder="votre-boutique.myshopify.com"
            className="w-full bg-black/40 border border-gray-600 rounded-xl px-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:border-cyan-400"
          />
        </div>

        <div>
          <label className="block text-sm text-gray-300 mb-2">
            Token d'accès Admin *
          </label>
          <input
            type="password"
            value={accessToken}
            onChange={(e) => setAccessToken(e.target.value)}
            placeholder="shpat_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"
            className="w-full bg-black/40 border border-gray-600 rounded-xl px-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:border-cyan-400"
          />
        </div>

        {errorMessage && (
          <div className="bg-red-500/20 border border-red-400/50 rounded-xl p-4">
            <div className="flex items-center gap-2">
              <AlertCircle className="w-5 h-5 text-red-400" />
              <span className="text-red-300">{errorMessage}</span>
            </div>
          </div>
        )}

        {connectionStatus === 'success' && (
          <div className="bg-green-500/20 border border-green-400/50 rounded-xl p-4">
            <div className="flex items-center gap-2">
              <CheckCircle className="w-5 h-5 text-green-400" />
              <span className="text-green-300">Connexion Shopify réussie !</span>
            </div>
          </div>
        )}

        <button
          onClick={handleConnect}
          disabled={isConnecting || !shopDomain || !accessToken}
          className="w-full bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-400 hover:to-emerald-500 disabled:from-gray-600 disabled:to-gray-700 text-white py-3 rounded-xl font-semibold transition-all disabled:cursor-not-allowed flex items-center justify-center gap-2"
        >
          {isConnecting ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" />
              {connectionStatus === 'testing' ? 'Test de connexion...' : 'Connexion...'}
            </>
          ) : (
            <>
              <Store className="w-5 h-5" />
              Connecter Shopify
            </>
          )}
        </button>
      </div>

      <div className="bg-yellow-500/20 border border-yellow-400/50 rounded-xl p-4">
        <h4 className="font-semibold text-yellow-200 mb-2">💡 Comment obtenir un token :</h4>
        <ol className="text-yellow-300 text-sm space-y-1">
          <li>1. Allez dans votre Admin Shopify</li>
          <li>2. Apps → Develop apps → Create an app</li>
          <li>3. Configure Admin API access</li>
          <li>4. Copiez le token généré</li>
        </ol>
        <a 
          href="https://help.shopify.com/en/manual/apps/app-types/private-apps"
          target="_blank"
          className="inline-flex items-center gap-1 text-yellow-400 hover:text-yellow-300 text-sm mt-2"
        >
          <ExternalLink className="w-3 h-3" />
          Guide officiel Shopify
        </a>
      </div>
    </div>
  );
};