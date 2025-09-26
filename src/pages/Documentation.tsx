import React, { useState } from 'react';
import { Book, Code, Download, ExternalLink, ArrowLeft, Search, FileText, Video, Zap } from 'lucide-react';

export const Documentation: React.FC = () => {
  const [activeSection, setActiveSection] = useState('getting-started');

  const sections = [
    { id: 'getting-started', title: 'Démarrage Rapide', icon: Zap },
    { id: 'integration', title: 'Intégration Widget', icon: Code },
    { id: 'catalog', title: 'Gestion Catalogue', icon: FileText },
    { id: 'customization', title: 'Personnalisation', icon: Book },
    { id: 'api', title: 'API Reference', icon: Code }
  ];

  const renderGettingStarted = () => (
    <div className="space-y-8">
      <div>
        <h2 className="text-3xl font-bold text-white mb-4">Démarrage Rapide</h2>
        <p className="text-gray-300 text-lg">Configurez OmnIA en moins de 10 minutes</p>
      </div>

      <div className="bg-white/10 backdrop-blur-xl rounded-2xl p-6 border border-white/20">
        <h3 className="text-xl font-bold text-white mb-4">1. Création du compte</h3>
        <div className="space-y-4">
          <div className="flex items-start gap-3">
            <div className="w-6 h-6 bg-cyan-500 rounded-full flex items-center justify-center text-white text-sm font-bold">1</div>
            <div>
              <p className="text-white font-medium">Inscription revendeur</p>
              <p className="text-gray-300 text-sm">Rendez-vous sur <code className="bg-cyan-500/20 px-2 py-1 rounded">seller.omnia.sale/register</code></p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <div className="w-6 h-6 bg-cyan-500 rounded-full flex items-center justify-center text-white text-sm font-bold">2</div>
            <div>
              <p className="text-white font-medium">Upload Kbis</p>
              <p className="text-gray-300 text-sm">Document de moins de 3 mois requis</p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <div className="w-6 h-6 bg-cyan-500 rounded-full flex items-center justify-center text-white text-sm font-bold">3</div>
            <div>
              <p className="text-white font-medium">Validation sous 24h</p>
              <p className="text-gray-300 text-sm">Réception des identifiants par email</p>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white/10 backdrop-blur-xl rounded-2xl p-6 border border-white/20">
        <h3 className="text-xl font-bold text-white mb-4">2. Configuration du catalogue</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-black/20 rounded-xl p-4">
            <h4 className="font-semibold text-cyan-300 mb-2">📄 Import CSV</h4>
            <p className="text-sm text-gray-300">Format recommandé pour débuter</p>
            <code className="text-xs text-cyan-400 block mt-2 bg-black/40 p-2 rounded">
              nom,prix,image_url,description
            </code>
          </div>
          <div className="bg-black/20 rounded-xl p-4">
            <h4 className="font-semibold text-purple-300 mb-2">🛍️ API Shopify</h4>
            <p className="text-sm text-gray-300">Synchronisation automatique</p>
            <p className="text-xs text-purple-400 mt-2">Token Storefront requis</p>
          </div>
          <div className="bg-black/20 rounded-xl p-4">
            <h4 className="font-semibold text-orange-300 mb-2">📡 Feed XML</h4>
            <p className="text-sm text-gray-300">URL de votre feed produits</p>
            <p className="text-xs text-orange-400 mt-2">Mise à jour automatique</p>
          </div>
        </div>
      </div>

      <div className="bg-white/10 backdrop-blur-xl rounded-2xl p-6 border border-white/20">
        <h3 className="text-xl font-bold text-white mb-4">3. Intégration sur votre site</h3>
        <div className="bg-black/40 rounded-xl p-4 border border-cyan-500/30">
          <code className="text-cyan-400 text-sm block">
            {`<script src="https://widget.omnia.sale/embed.js"></script>
<div id="omnia-chat" data-store="votre-magasin"></div>`}
          </code>
        </div>
        <p className="text-gray-300 text-sm mt-3">
          Remplacez <code className="bg-cyan-500/20 px-1 rounded">votre-magasin</code> par votre identifiant fourni
        </p>
      </div>
    </div>
  );

  const renderIntegration = () => (
    <div className="space-y-8">
      <div>
        <h2 className="text-3xl font-bold text-white mb-4">Intégration Widget</h2>
        <p className="text-gray-300 text-lg">Guide complet d'intégration du widget OmnIA</p>
      </div>

      <div className="bg-white/10 backdrop-blur-xl rounded-2xl p-6 border border-white/20">
        <h3 className="text-xl font-bold text-white mb-4">Code d'intégration de base</h3>
        <div className="bg-black/40 rounded-xl p-4 border border-cyan-500/30 mb-4">
          <code className="text-cyan-400 text-sm block whitespace-pre">
{`<!-- Intégration OmnIA Widget -->
<script src="https://widget.omnia.sale/embed.js"></script>
<div id="omnia-chat" 
     data-store="votre-magasin"
     data-theme="auto"
     data-position="bottom-right">
</div>`}
          </code>
        </div>
        <button className="bg-cyan-600 hover:bg-cyan-700 text-white px-4 py-2 rounded-xl text-sm">
          Copier le code
        </button>
      </div>

      <div className="bg-white/10 backdrop-blur-xl rounded-2xl p-6 border border-white/20">
        <h3 className="text-xl font-bold text-white mb-4">Options de personnalisation</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-white/20">
                <th className="text-left p-3 text-cyan-300">Attribut</th>
                <th className="text-left p-3 text-cyan-300">Description</th>
                <th className="text-left p-3 text-cyan-300">Valeurs</th>
              </tr>
            </thead>
            <tbody>
              <tr className="border-b border-white/10">
                <td className="p-3 text-white font-mono">data-store</td>
                <td className="p-3 text-gray-300">Identifiant de votre magasin</td>
                <td className="p-3 text-gray-300">Fourni lors de l'inscription</td>
              </tr>
              <tr className="border-b border-white/10">
                <td className="p-3 text-white font-mono">data-theme</td>
                <td className="p-3 text-gray-300">Thème d'apparence</td>
                <td className="p-3 text-gray-300">auto, light, dark</td>
              </tr>
              <tr className="border-b border-white/10">
                <td className="p-3 text-white font-mono">data-position</td>
                <td className="p-3 text-gray-300">Position du widget</td>
                <td className="p-3 text-gray-300">bottom-right, bottom-left</td>
              </tr>
              <tr>
                <td className="p-3 text-white font-mono">data-language</td>
                <td className="p-3 text-gray-300">Langue de l'interface</td>
                <td className="p-3 text-gray-300">fr, en, es, de</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <div className="bg-white/10 backdrop-blur-xl rounded-2xl p-6 border border-white/20">
        <h3 className="text-xl font-bold text-white mb-4">Intégration avancée</h3>
        <div className="bg-black/40 rounded-xl p-4 border border-purple-500/30">
          <code className="text-purple-400 text-sm block whitespace-pre">
{`<!-- Configuration avancée -->
<script>
window.OmniaConfig = {
  store: 'votre-magasin',
  theme: {
    primaryColor: '#0891b2',
    borderRadius: '12px',
    fontFamily: 'Inter, sans-serif'
  },
  behavior: {
    autoOpen: false,
    showWelcome: true,
    enableVoice: true
  },
  callbacks: {
    onProductClick: function(product) {
      // Votre logique personnalisée
      console.log('Produit cliqué:', product);
    },
    onCartAdd: function(product, variant) {
      // Intégration avec votre panier
      addToCart(product, variant);
    }
  }
};
</script>
<script src="https://widget.omnia.sale/embed.js"></script>`}
          </code>
        </div>
      </div>
    </div>
  );

  const renderCatalog = () => (
    <div className="space-y-8">
      <div>
        <h2 className="text-3xl font-bold text-white mb-4">Gestion du Catalogue</h2>
        <p className="text-gray-300 text-lg">Importez et gérez vos produits efficacement</p>
      </div>

      <div className="bg-white/10 backdrop-blur-xl rounded-2xl p-6 border border-white/20">
        <h3 className="text-xl font-bold text-white mb-4">Format CSV recommandé</h3>
        <div className="bg-black/40 rounded-xl p-4 border border-green-500/30 mb-4">
          <code className="text-green-400 text-sm block">
            nom,prix,image_url,description,categorie,stock,url_produit
          </code>
        </div>
        <div className="bg-black/40 rounded-xl p-4 border border-green-500/30">
          <code className="text-green-400 text-xs block whitespace-pre">
{`"Canapé ALYANA Beige",799,"https://...","Canapé convertible...","Canapé",10,"https://..."
"Table AUREA Ø100cm",499,"https://...","Table travertin...","Table",5,"https://..."`}
          </code>
        </div>
      </div>

      <div className="bg-white/10 backdrop-blur-xl rounded-2xl p-6 border border-white/20">
        <h3 className="text-xl font-bold text-white mb-4">Connexion Shopify</h3>
        <div className="space-y-4">
          <div className="bg-blue-500/20 border border-blue-400/30 rounded-xl p-4">
            <h4 className="font-semibold text-blue-200 mb-2">Étapes de configuration :</h4>
            <ol className="text-sm text-blue-300 space-y-2">
              <li>1. <strong>Admin Shopify</strong> → Apps → Develop apps</li>
              <li>2. <strong>Create an app</strong> → Nom: "OmnIA Connector"</li>
              <li>3. <strong>Configure Storefront API</strong> → Enable</li>
              <li>4. <strong>Copier le token</strong> → Coller dans OmnIA Admin</li>
            </ol>
          </div>
          <div className="bg-green-500/20 border border-green-400/30 rounded-xl p-4">
            <h4 className="font-semibold text-green-200 mb-2">✅ Avantages :</h4>
            <ul className="text-sm text-green-300 space-y-1">
              <li>• Synchronisation automatique temps réel</li>
              <li>• Gestion des stocks automatique</li>
              <li>• Pas de maintenance manuelle</li>
              <li>• Accès lecture seule sécurisé</li>
            </ul>
          </div>
        </div>
      </div>

      <div className="bg-white/10 backdrop-blur-xl rounded-2xl p-6 border border-white/20">
        <h3 className="text-xl font-bold text-white mb-4">Feed XML</h3>
        <p className="text-gray-300 mb-4">Pour les catalogues avec feed automatique :</p>
        <div className="bg-black/40 rounded-xl p-4 border border-orange-500/30">
          <code className="text-orange-400 text-sm block">
            https://votre-site.com/products.xml
          </code>
        </div>
        <p className="text-gray-300 text-sm mt-3">
          Le feed sera synchronisé automatiquement toutes les 24h
        </p>
      </div>
    </div>
  );

  const renderCustomization = () => (
    <div className="space-y-8">
      <div>
        <h2 className="text-3xl font-bold text-white mb-4">Personnalisation</h2>
        <p className="text-gray-300 text-lg">Adaptez OmnIA à votre marque et vos besoins</p>
      </div>

      <div className="bg-white/10 backdrop-blur-xl rounded-2xl p-6 border border-white/20">
        <h3 className="text-xl font-bold text-white mb-4">Personnalité de l'assistant</h3>
        <div className="space-y-4">
          <div>
            <label className="block text-sm text-cyan-300 mb-2">Style de conversation</label>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <div className="bg-black/20 rounded-xl p-3 border border-cyan-500/30">
                <h4 className="font-semibold text-white">Professionnel</h4>
                <p className="text-xs text-gray-300">Ton expert et courtois</p>
              </div>
              <div className="bg-black/20 rounded-xl p-3 border border-purple-500/30">
                <h4 className="font-semibold text-white">Amical</h4>
                <p className="text-xs text-gray-300">Décontracté et chaleureux</p>
              </div>
              <div className="bg-black/20 rounded-xl p-3 border border-orange-500/30">
                <h4 className="font-semibold text-white">Expert</h4>
                <p className="text-xs text-gray-300">Technique et précis</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white/10 backdrop-blur-xl rounded-2xl p-6 border border-white/20">
        <h3 className="text-xl font-bold text-white mb-4">Apparence du widget</h3>
        <div className="bg-black/40 rounded-xl p-4 border border-cyan-500/30">
          <code className="text-cyan-400 text-sm block whitespace-pre">
{`window.OmniaConfig = {
  theme: {
    primaryColor: '#0891b2',      // Couleur principale
    secondaryColor: '#1e40af',    // Couleur secondaire
    borderRadius: '12px',         // Arrondi des angles
    fontFamily: 'Inter',          // Police de caractères
    chatBubble: {
      backgroundColor: '#1f2937', // Fond des messages
      textColor: '#ffffff',       // Couleur du texte
      borderColor: '#0891b2'       // Bordure
    }
  }
};`}
          </code>
        </div>
      </div>
    </div>
  );

  const renderAPI = () => (
    <div className="space-y-8">
      <div>
        <h2 className="text-3xl font-bold text-white mb-4">API Reference</h2>
        <p className="text-gray-300 text-lg">Documentation technique de l'API OmnIA</p>
      </div>

      <div className="bg-white/10 backdrop-blur-xl rounded-2xl p-6 border border-white/20">
        <h3 className="text-xl font-bold text-white mb-4">Endpoints principaux</h3>
        <div className="space-y-4">
          <div className="bg-black/20 rounded-xl p-4">
            <div className="flex items-center gap-2 mb-2">
              <span className="bg-green-500 text-white px-2 py-1 rounded text-xs font-bold">POST</span>
              <code className="text-cyan-400">/api/chat</code>
            </div>
            <p className="text-gray-300 text-sm mb-2">Envoyer un message à l'assistant IA</p>
            <div className="bg-black/40 rounded p-2">
              <code className="text-green-400 text-xs">
                {`{ "message": "Je cherche un canapé moderne" }`}
              </code>
            </div>
          </div>

          <div className="bg-black/20 rounded-xl p-4">
            <div className="flex items-center gap-2 mb-2">
              <span className="bg-blue-500 text-white px-2 py-1 rounded text-xs font-bold">GET</span>
              <code className="text-cyan-400">/api/products</code>
            </div>
            <p className="text-gray-300 text-sm mb-2">Récupérer la liste des produits</p>
            <div className="bg-black/40 rounded p-2">
              <code className="text-blue-400 text-xs">
                {`?category=canapé&limit=10&page=1`}
              </code>
            </div>
          </div>

          <div className="bg-black/20 rounded-xl p-4">
            <div className="flex items-center gap-2 mb-2">
              <span className="bg-purple-500 text-white px-2 py-1 rounded text-xs font-bold">POST</span>
              <code className="text-cyan-400">/api/cart/add</code>
            </div>
            <p className="text-gray-300 text-sm mb-2">Ajouter un produit au panier</p>
            <div className="bg-black/40 rounded p-2">
              <code className="text-purple-400 text-xs">
                {`{ "productId": "123", "variantId": "456", "quantity": 1 }`}
              </code>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white/10 backdrop-blur-xl rounded-2xl p-6 border border-white/20">
        <h3 className="text-xl font-bold text-white mb-4">Authentification</h3>
        <p className="text-gray-300 mb-4">Utilisez votre clé API dans l'en-tête Authorization :</p>
        <div className="bg-black/40 rounded-xl p-4 border border-cyan-500/30">
          <code className="text-cyan-400 text-sm block">
            Authorization: Bearer votre_cle_api_omnia
          </code>
        </div>
      </div>
    </div>
  );

  const renderContent = () => {
    switch (activeSection) {
      case 'getting-started': return renderGettingStarted();
      case 'integration': return renderIntegration();
      case 'catalog': return renderCatalog();
      case 'customization': return renderCustomization();
      case 'api': return renderAPI();
      default: return renderGettingStarted();
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-purple-900">
      {/* Background Effects */}
      <div className="absolute inset-0 opacity-20">
        <div className="absolute top-20 left-20 w-72 h-72 bg-cyan-500/30 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-20 right-20 w-96 h-96 bg-purple-500/20 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '2s' }}></div>
      </div>

      {/* Header */}
      <header className="relative z-10 bg-black/20 backdrop-blur-xl border-b border-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-xl flex items-center justify-center">
                <span className="text-white font-bold text-lg">O</span>
              </div>
              <div>
                <h1 className="text-xl font-bold text-white">OmnIA</h1>
                <p className="text-cyan-300 text-sm">Documentation</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <a href="/" className="flex items-center gap-2 text-cyan-400 hover:text-cyan-300 transition-colors">
                <ArrowLeft className="w-4 h-4" />
                Retour à l'accueil
              </a>
            </div>
          </div>
        </div>
      </header>

      <div className="relative z-10 flex h-screen">
        {/* Sidebar */}
        <div className="w-64 bg-black/20 backdrop-blur-2xl border-r border-white/10 p-6">
          <div className="mb-8">
            <h1 className="text-xl font-bold text-white mb-2">Documentation</h1>
            <p className="text-cyan-300 text-sm">Guide complet OmnIA</p>
          </div>

          <nav className="space-y-2">
            {sections.map((section) => {
              const Icon = section.icon;
              return (
                <button
                  key={section.id}
                  onClick={() => setActiveSection(section.id)}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all text-left ${
                    activeSection === section.id
                      ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30'
                      : 'text-gray-300 hover:bg-white/10 hover:text-white'
                  }`}
                >
                  <Icon className="w-5 h-5" />
                  <span className="text-sm font-medium">{section.title}</span>
                </button>
              );
            })}
          </nav>
        </div>

        {/* Main Content */}
        <div className="flex-1 overflow-y-auto p-8">
          {renderContent()}
        </div>
      </div>
    </div>
  );
};