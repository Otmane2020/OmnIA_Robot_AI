import React, { useState } from 'react';
import { Store, Upload, Link, CheckCircle, AlertCircle, ExternalLink, Settings } from 'lucide-react';
import { ShopifyCSVImporter } from './ShopifyCSVImporter';
import { SmartAIAttributesTab } from './SmartAIAttributesTab';

interface EcommerceIntegrationProps {
  onConnected: (platformData: any) => void;
}

export const EcommerceIntegration: React.FC<EcommerceIntegrationProps> = ({ onConnected }) => {
  const [activeTab, setActiveTab] = useState('smart-ai');
  const [isConnecting, setIsConnecting] = useState(false);

  const platforms = [
    {
      id: 'smart-ai',
      name: 'SMART AI Attributes',
      icon: Brain,
      description: '30 attributs IA optimisés pour Google Merchant & SEO',
      color: 'from-purple-500 to-pink-600'
    },
    {
      id: 'shopify',
      name: 'Shopify',
      icon: Store,
      description: 'Synchronisation automatique avec votre boutique Shopify',
      color: 'from-green-500 to-emerald-600'
    },
    {
      id: 'csv',
      name: 'Import CSV',
      icon: Upload,
      description: 'Importez votre catalogue au format CSV',
      color: 'from-blue-500 to-cyan-600'
    },
    {
      id: 'xml',
      name: 'Feed XML',
      icon: Link,
      description: 'Connectez votre feed XML automatique',
      color: 'from-purple-500 to-pink-600'
    }
  ];

  const handleShopifyConnect = async () => {
    setIsConnecting(true);
    
    // Simulate Shopify connection
    setTimeout(() => {
      const mockShopifyData = {
        name: 'Boutique Shopify connectée',
        platform: 'shopify',
        products_count: 247,
        status: 'connected',
        connected_at: new Date().toISOString()
      };
      
      onConnected(mockShopifyData);
      setIsConnecting(false);
    }, 2000);
  };

  const handleXMLConnect = async () => {
    setIsConnecting(true);
    
    // Simulate XML feed connection
    setTimeout(() => {
      const mockXMLData = {
        name: 'Feed XML connecté',
        platform: 'xml',
        products_count: 156,
        status: 'connected',
        connected_at: new Date().toISOString()
      };
      
      onConnected(mockXMLData);
      setIsConnecting(false);
    }, 1500);
  };

  const renderShopifyTab = () => (
    <div className="space-y-6">
      <div className="text-center">
        <Store className="w-16 h-16 text-green-400 mx-auto mb-4" />
        <h3 className="text-xl font-bold text-white mb-2">Connexion Shopify</h3>
        <p className="text-gray-300">Synchronisez automatiquement votre catalogue Shopify</p>
      </div>
      
      <div className="bg-green-500/20 border border-green-400/50 rounded-xl p-6">
        <h4 className="font-semibold text-green-200 mb-3">✅ Avantages Shopify :</h4>
        <ul className="text-green-300 space-y-2 text-sm">
          <li>• Synchronisation temps réel des produits</li>
          <li>• Gestion automatique des stocks</li>
          <li>• Mise à jour des prix et promotions</li>
          <li>• Pas de maintenance manuelle</li>
        </ul>
      </div>
      
      <div className="space-y-4">
        <div>
          <label className="block text-sm text-gray-300 mb-2">Domaine Shopify</label>
          <input
            type="text"
            placeholder="votre-boutique.myshopify.com"
            className="w-full bg-black/40 border border-gray-600 rounded-xl px-4 py-3 text-white placeholder-gray-400"
          />
        </div>
        
        <div>
          <label className="block text-sm text-gray-300 mb-2">Token d'accès</label>
          <input
            type="password"
            placeholder="shpat_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"
            className="w-full bg-black/40 border border-gray-600 rounded-xl px-4 py-3 text-white placeholder-gray-400"
          />
        </div>
        
        <button
          onClick={handleShopifyConnect}
          disabled={isConnecting}
          className="w-full bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-400 hover:to-emerald-500 disabled:from-gray-600 disabled:to-gray-700 text-white py-3 rounded-xl font-semibold transition-all disabled:cursor-not-allowed flex items-center justify-center gap-2"
        >
          {isConnecting ? (
            <>
              <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
              Connexion...
            </>
          ) : (
            <>
              <Store className="w-5 h-5" />
              Connecter Shopify
            </>
          )}
        </button>
      </div>
    </div>
  );

  const renderCSVTab = () => (
    <ShopifyCSVImporter onImportComplete={onConnected} />
  );

  const renderXMLTab = () => (
    <div className="space-y-6">
      <div className="text-center">
        <Link className="w-16 h-16 text-purple-400 mx-auto mb-4" />
        <h3 className="text-xl font-bold text-white mb-2">Feed XML</h3>
        <p className="text-gray-300">Connectez votre feed XML pour synchronisation automatique</p>
      </div>
      
      <div className="bg-purple-500/20 border border-purple-400/50 rounded-xl p-6">
        <h4 className="font-semibold text-purple-200 mb-3">📡 Feed XML automatique :</h4>
        <ul className="text-purple-300 space-y-2 text-sm">
          <li>• Synchronisation quotidienne à 3h du matin</li>
          <li>• Détection automatique des nouveaux produits</li>
          <li>• Mise à jour des prix et disponibilités</li>
          <li>• Compatible avec tous les formats XML standards</li>
        </ul>
      </div>
      
      <div className="space-y-4">
        <div>
          <label className="block text-sm text-gray-300 mb-2">URL du feed XML</label>
          <input
            type="url"
            placeholder="https://votre-site.com/products.xml"
            className="w-full bg-black/40 border border-gray-600 rounded-xl px-4 py-3 text-white placeholder-gray-400"
          />
        </div>
        
        <button
          onClick={handleXMLConnect}
          disabled={isConnecting}
          className="w-full bg-gradient-to-r from-purple-500 to-pink-600 hover:from-purple-400 hover:to-pink-500 disabled:from-gray-600 disabled:to-gray-700 text-white py-3 rounded-xl font-semibold transition-all disabled:cursor-not-allowed flex items-center justify-center gap-2"
        >
          {isConnecting ? (
            <>
              <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
              Connexion...
            </>
          ) : (
            <>
              <Link className="w-5 h-5" />
              Connecter Feed XML
            </>
          )}
        </button>
      </div>
    </div>
  );

  return (
    <div className="space-y-8">
      {/* Platform Tabs */}
      <div className="flex justify-center">
        <div className="bg-black/40 backdrop-blur-xl rounded-2xl p-2 border border-white/20">
          <div className="flex space-x-2">
            {platforms.map((platform) => {
              const Icon = platform.icon;
              return (
                <button
                  key={platform.id}
                  onClick={() => setActiveTab(platform.id)}
                  className={`flex items-center gap-2 px-4 py-3 rounded-xl transition-all ${
                    activeTab === platform.id
                      ? 'bg-cyan-500 text-white'
                      : 'text-gray-400 hover:text-white hover:bg-white/10'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span className="font-medium">{platform.name}</span>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Platform Content */}
      <div className="bg-white/10 backdrop-blur-xl rounded-2xl p-8 border border-white/20">
        {activeTab === 'shopify' && renderShopifyTab()}
        {activeTab === 'csv' && renderCSVTab()}
        {activeTab === 'xml' && renderXMLTab()}
      </div>
      {activeTab === 'smart-ai' && <SmartAIAttributesTab />}
    </div>
  );
};