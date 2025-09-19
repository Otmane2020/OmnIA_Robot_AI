import React, { useState } from 'react';
import { Target, Key, CheckCircle, AlertCircle, ExternalLink, Loader2, Settings, BarChart3 } from 'lucide-react';

interface GoogleAdsConnectorProps {
  onConnected: (data: any) => void;
}

export const GoogleAdsConnector: React.FC<GoogleAdsConnectorProps> = ({ onConnected }) => {
  const [step, setStep] = useState(1);
  const [isConnecting, setIsConnecting] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState<'idle' | 'connecting' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState('');
  const [formData, setFormData] = useState({
    customerId: '',
    developerToken: '',
    clientId: '',
    clientSecret: '',
    refreshToken: ''
  });

  const handleConnect = async () => {
    if (!formData.customerId || !formData.developerToken) {
      setErrorMessage('Customer ID et Developer Token requis');
      return;
    }

    setIsConnecting(true);
    setConnectionStatus('connecting');
    setErrorMessage('');

    try {
      // Simuler la connexion OAuth Google Ads
      await new Promise(resolve => setTimeout(resolve, 3000));
      
      const mockData = {
        name: 'Google Ads connecté',
        platform: 'google_ads',
        customer_id: formData.customerId,
        campaigns_count: 5,
        status: 'connected',
        connected_at: new Date().toISOString()
      };

      setConnectionStatus('success');
      onConnected(mockData);

    } catch (error) {
      setConnectionStatus('error');
      setErrorMessage('Erreur de connexion Google Ads. Vérifiez vos identifiants.');
    } finally {
      setIsConnecting(false);
    }
  };

  const renderStep1 = () => (
    <div className="space-y-6">
      <div className="text-center">
        <Target className="w-16 h-16 text-green-400 mx-auto mb-4" />
        <h3 className="text-xl font-bold text-white mb-2">Connexion Google Ads API</h3>
        <p className="text-gray-300">Connectez votre compte Google Ads pour la gestion automatique</p>
      </div>

      <div className="bg-yellow-500/20 border border-yellow-400/50 rounded-xl p-6">
        <h4 className="font-semibold text-yellow-200 mb-4">⚠️ Prérequis Google Ads API :</h4>
        <ol className="text-yellow-300 text-sm space-y-2">
          <li>1. <strong>Compte Google Ads actif</strong> avec historique de dépenses</li>
          <li>2. <strong>Accès développeur approuvé</strong> par Google (peut prendre 24-48h)</li>
          <li>3. <strong>Application OAuth configurée</strong> dans Google Cloud Console</li>
          <li>4. <strong>Token développeur</strong> obtenu depuis Google Ads</li>
        </ol>
      </div>

      <div className="space-y-4">
        <div>
          <label className="block text-sm text-gray-300 mb-2">
            Customer ID Google Ads *
          </label>
          <input
            type="text"
            value={formData.customerId}
            onChange={(e) => setFormData(prev => ({ ...prev, customerId: e.target.value }))}
            placeholder="123-456-7890"
            className="w-full bg-black/40 border border-gray-600 rounded-xl px-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:border-cyan-400"
          />
          <p className="text-xs text-gray-400 mt-1">Format: XXX-XXX-XXXX (trouvé dans votre compte Google Ads)</p>
        </div>

        <div>
          <label className="block text-sm text-gray-300 mb-2">
            Developer Token *
          </label>
          <input
            type="password"
            value={formData.developerToken}
            onChange={(e) => setFormData(prev => ({ ...prev, developerToken: e.target.value }))}
            placeholder="Votre token développeur Google Ads"
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

        <button
          onClick={handleConnect}
          disabled={isConnecting || !formData.customerId || !formData.developerToken}
          className="w-full bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-400 hover:to-emerald-500 disabled:from-gray-600 disabled:to-gray-700 text-white py-3 rounded-xl font-semibold transition-all disabled:cursor-not-allowed flex items-center justify-center gap-2"
        >
          {isConnecting ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" />
              Connexion en cours...
            </>
          ) : (
            <>
              <Target className="w-5 h-5" />
              Connecter Google Ads
            </>
          )}
        </button>
      </div>

      <div className="bg-blue-500/20 border border-blue-400/50 rounded-xl p-6">
        <h4 className="font-semibold text-blue-200 mb-3">📋 Guide de configuration :</h4>
        <ol className="text-blue-300 text-sm space-y-2">
          <li>1. <strong>Google Cloud Console :</strong> Créer un projet et activer Google Ads API</li>
          <li>2. <strong>OAuth 2.0 :</strong> Configurer les identifiants client</li>
          <li>3. <strong>Google Ads :</strong> Demander l'accès développeur</li>
          <li>4. <strong>Token :</strong> Générer le developer token</li>
          <li>5. <strong>Test :</strong> Vérifier l'accès avec OmnIA</li>
        </ol>
        <a 
          href="https://developers.google.com/google-ads/api/docs/first-call/overview"
          target="_blank"
          className="inline-flex items-center gap-1 text-blue-400 hover:text-blue-300 text-sm mt-3"
        >
          <ExternalLink className="w-3 h-3" />
          Documentation officielle Google Ads API
        </a>
      </div>
    </div>
  );

  const renderStep2 = () => (
    <div className="space-y-6">
      <div className="text-center">
        <Settings className="w-16 h-16 text-purple-400 mx-auto mb-4" />
        <h3 className="text-xl font-bold text-white mb-2">Configuration OAuth</h3>
        <p className="text-gray-300">Paramètres d'authentification Google</p>
      </div>

      <div className="space-y-4">
        <div>
          <label className="block text-sm text-gray-300 mb-2">Client ID OAuth</label>
          <input
            type="text"
            value={formData.clientId}
            onChange={(e) => setFormData(prev => ({ ...prev, clientId: e.target.value }))}
            placeholder="123456789-abc.apps.googleusercontent.com"
            className="w-full bg-black/40 border border-gray-600 rounded-xl px-4 py-3 text-white placeholder-gray-400"
          />
        </div>

        <div>
          <label className="block text-sm text-gray-300 mb-2">Client Secret</label>
          <input
            type="password"
            value={formData.clientSecret}
            onChange={(e) => setFormData(prev => ({ ...prev, clientSecret: e.target.value }))}
            placeholder="Votre client secret OAuth"
            className="w-full bg-black/40 border border-gray-600 rounded-xl px-4 py-3 text-white placeholder-gray-400"
          />
        </div>

        <div>
          <label className="block text-sm text-gray-300 mb-2">Refresh Token</label>
          <input
            type="password"
            value={formData.refreshToken}
            onChange={(e) => setFormData(prev => ({ ...prev, refreshToken: e.target.value }))}
            placeholder="Token de rafraîchissement"
            className="w-full bg-black/40 border border-gray-600 rounded-xl px-4 py-3 text-white placeholder-gray-400"
          />
        </div>
      </div>

      <div className="flex gap-4">
        <button
          onClick={() => setStep(1)}
          className="bg-gray-600 hover:bg-gray-700 text-white px-6 py-3 rounded-xl transition-all"
        >
          Retour
        </button>
        <button
          onClick={handleConnect}
          className="flex-1 bg-gradient-to-r from-purple-500 to-pink-600 hover:from-purple-400 hover:to-pink-500 text-white py-3 rounded-xl font-semibold transition-all"
        >
          Finaliser la connexion
        </button>
      </div>
    </div>
  );

  if (connectionStatus === 'success') {
    return (
      <div className="text-center py-8">
        <CheckCircle className="w-16 h-16 text-green-400 mx-auto mb-4" />
        <h3 className="text-xl font-bold text-white mb-2">Google Ads connecté !</h3>
        <p className="text-green-300 mb-6">
          API configurée avec succès. Campagnes automatiques disponibles.
        </p>
        <div className="bg-green-500/20 border border-green-400/50 rounded-xl p-4">
          <h4 className="font-semibold text-green-200 mb-2">✅ Fonctionnalités activées :</h4>
          <ul className="text-green-300 text-sm space-y-1">
            <li>• Création automatique campagnes Performance Max</li>
            <li>• Optimisation enchères avec IA</li>
            <li>• Génération créatifs automatiques</li>
            <li>• Rapports de performance temps réel</li>
          </ul>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white/10 backdrop-blur-xl rounded-2xl p-8 border border-white/20">
      <div className="mb-6">
        <div className="flex items-center justify-center mb-4">
          {[1, 2].map((stepNum) => (
            <div key={stepNum} className="flex items-center">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold ${
                step >= stepNum ? 'bg-cyan-500 text-white' : 'bg-gray-600 text-gray-300'
              }`}>
                {stepNum}
              </div>
              {stepNum < 2 && (
                <div className={`w-12 h-1 ${step > stepNum ? 'bg-cyan-500' : 'bg-gray-600'}`} />
              )}
            </div>
          ))}
        </div>
      </div>

      {step === 1 ? renderStep1() : renderStep2()}
    </div>
  );
};