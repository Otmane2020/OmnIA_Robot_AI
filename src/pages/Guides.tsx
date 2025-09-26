import React, { useState } from 'react';
import { BookOpen, Video, Download, ExternalLink, ArrowLeft, Clock, User, Star } from 'lucide-react';
import { Logo } from '../components/Logo';
import { Logo } from '../components/Logo';

export const Guides: React.FC = () => {
  const [activeCategory, setActiveCategory] = useState('all');

  const guides = [
    {
      id: 'quick-start',
      title: 'Guide de Démarrage Rapide',
      description: 'Configurez OmnIA en 10 minutes chrono',
      category: 'getting-started',
      duration: '10 min',
      difficulty: 'Débutant',
      type: 'article',
      content: `
# Guide de Démarrage Rapide OmnIA

## 1. Inscription Revendeur (2 min)
- Rendez-vous sur seller.omnia.sale/register
- Remplissez vos informations entreprise
- Uploadez votre Kbis (< 3 mois)
- Choisissez votre plan

## 2. Validation (24h max)
- Notre équipe valide votre dossier
- Réception des identifiants par email
- Accès à votre interface admin

## 3. Configuration Catalogue (5 min)
- Connectez-vous à votre admin
- Importez votre catalogue (CSV/Shopify/XML)
- Configurez la personnalité d'OmnIA

## 4. Intégration Widget (3 min)
- Copiez le code widget fourni
- Collez-le sur votre site
- Testez avec vos premiers clients

✅ Votre assistant IA est opérationnel !
      `
    },
    {
      id: 'shopify-integration',
      title: 'Intégration Shopify Complète',
      description: 'Connectez votre boutique Shopify en 5 étapes',
      category: 'integration',
      duration: '15 min',
      difficulty: 'Intermédiaire',
      type: 'video',
      content: `
# Intégration Shopify Complète

## Prérequis
- Boutique Shopify active
- Accès admin Shopify
- Compte OmnIA validé

## Étape 1 : Créer l'App Shopify
1. **Admin Shopify** → Apps → App and sales channel settings
2. **Develop apps** → Create an app
3. **Nom**: "OmnIA Connector"
4. **Developer**: Votre nom/entreprise

## Étape 2 : Configuration API
1. **Configuration** → Storefront API access
2. **Configure** → Enable Storefront API access
3. **Permissions automatiques** activées

## Étape 3 : Récupération Token
1. **Install app** → Confirmer
2. **Copier le Storefront access token**
3. Format: shpat_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx

## Étape 4 : Connexion OmnIA
1. **Interface Admin OmnIA** → Catalogue → API Shopify
2. **Nom boutique**: votre-boutique (sans .myshopify.com)
3. **Token**: Coller le token Shopify
4. **Tester la connexion**

## Étape 5 : Synchronisation
- Import automatique du catalogue
- Synchronisation temps réel des stocks
- Gestion des prix et promotions

🎉 Votre catalogue Shopify est connecté !
      `
    },
    {
      id: 'widget-customization',
      title: 'Personnalisation Avancée du Widget',
      description: 'Adaptez l\'apparence et le comportement d\'OmnIA',
      category: 'customization',
      duration: '20 min',
      difficulty: 'Avancé',
      type: 'article',
      content: `
# Personnalisation Avancée du Widget

## Configuration de Base
\`\`\`html
<script>
window.OmniaConfig = {
  store: 'votre-magasin',
  theme: 'auto',
  position: 'bottom-right'
};
</script>
<script src="https://widget.omnia.sale/embed.js"></script>
\`\`\`

## Thème Personnalisé
\`\`\`javascript
window.OmniaConfig = {
  theme: {
    primaryColor: '#0891b2',
    secondaryColor: '#1e40af',
    backgroundColor: '#1f2937',
    textColor: '#ffffff',
    borderRadius: '12px',
    fontFamily: 'Inter, sans-serif'
  }
};
\`\`\`

## Callbacks Personnalisés
\`\`\`javascript
window.OmniaConfig = {
  callbacks: {
    onProductClick: function(product) {
      // Tracking analytics
      gtag('event', 'product_view', {
        product_id: product.id,
        product_name: product.title
      });
    },
    onCartAdd: function(product, variant) {
      // Intégration panier existant
      addToExistingCart(product, variant);
    },
    onConversationStart: function() {
      // Tracking engagement
      console.log('Conversation démarrée');
    }
  }
};
\`\`\`

## Positionnement Avancé
\`\`\`css
#omnia-chat {
  position: fixed !important;
  bottom: 20px !important;
  right: 20px !important;
  z-index: 9999 !important;
}
\`\`\`
      `
    },
    {
      id: 'analytics-setup',
      title: 'Configuration Analytics',
      description: 'Suivez les performances de votre assistant IA',
      category: 'analytics',
      duration: '12 min',
      difficulty: 'Intermédiaire',
      type: 'article',
      content: `
# Configuration Analytics OmnIA

## Métriques Disponibles
- **Conversations**: Nombre total et par période
- **Taux de conversion**: Visiteurs → Acheteurs
- **Produits populaires**: Les plus demandés
- **Satisfaction client**: Notes et retours

## Intégration Google Analytics
\`\`\`javascript
window.OmniaConfig = {
  analytics: {
    googleAnalytics: 'GA_MEASUREMENT_ID',
    trackConversations: true,
    trackProductViews: true,
    trackCartAdditions: true
  }
};
\`\`\`

## Webhooks Personnalisés
\`\`\`javascript
window.OmniaConfig = {
  webhooks: {
    onConversationEnd: 'https://votre-site.com/webhook/conversation',
    onProductRecommendation: 'https://votre-site.com/webhook/recommendation',
    onCartAdd: 'https://votre-site.com/webhook/cart'
  }
};
\`\`\`

## Dashboard Analytics
Accédez aux statistiques détaillées dans votre interface admin :
- **Temps réel**: Conversations en cours
- **Historique**: Tendances sur 30/90 jours
- **Comparaisons**: Performance vs période précédente
- **Export**: Données CSV pour analyse externe
      `
    }
  ];

  const categories = [
    { id: 'all', label: 'Tous les guides' },
    { id: 'getting-started', label: 'Démarrage' },
    { id: 'integration', label: 'Intégration' },
    { id: 'customization', label: 'Personnalisation' },
    { id: 'analytics', label: 'Analytics' }
  ];

  const filteredGuides = activeCategory === 'all' 
    ? guides 
    : guides.filter(guide => guide.category === activeCategory);

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'Débutant': return 'bg-green-500/20 text-green-300';
      case 'Intermédiaire': return 'bg-yellow-500/20 text-yellow-300';
      case 'Avancé': return 'bg-red-500/20 text-red-300';
      default: return 'bg-gray-500/20 text-gray-300';
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'video': return Video;
      case 'download': return Download;
      default: return BookOpen;
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
            <Logo size="md" />
            <div className="flex items-center space-x-4">
              <a href="/" className="flex items-center gap-2 text-cyan-400 hover:text-cyan-300 transition-colors">
                <ArrowLeft className="w-4 h-4" />
                Retour à l'accueil
              </a>
            </div>
          </div>
        </div>
      </header>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Hero Section */}
        <div className="text-center mb-16">
          <h1 className="text-4xl md:text-6xl font-bold text-white mb-6">
            Guides & Tutoriels
            <span className="block bg-gradient-to-r from-cyan-400 via-blue-400 to-purple-400 bg-clip-text text-transparent">
              OmnIA.sale
            </span>
          </h1>
          <p className="text-xl text-gray-300 max-w-3xl mx-auto">
            Apprenez à maîtriser OmnIA avec nos guides détaillés et tutoriels vidéo
          </p>
        </div>

        {/* Category Filter */}
        <div className="flex flex-wrap justify-center gap-4 mb-12">
          {categories.map((category) => (
            <button
              key={category.id}
              onClick={() => setActiveCategory(category.id)}
              className={`px-6 py-3 rounded-xl font-semibold transition-all ${
                activeCategory === category.id
                  ? 'bg-gradient-to-r from-cyan-500 to-blue-600 text-white'
                  : 'bg-white/10 text-gray-300 hover:bg-white/20 hover:text-white'
              }`}
            >
              {category.label}
            </button>
          ))}
        </div>

        {/* Guides Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredGuides.map((guide) => {
            const TypeIcon = getTypeIcon(guide.type);
            return (
              <div key={guide.id} className="bg-white/10 backdrop-blur-xl rounded-2xl p-6 border border-white/20 hover:border-cyan-500/50 transition-all hover:scale-105">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-12 h-12 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-xl flex items-center justify-center">
                    <TypeIcon className="w-6 h-6 text-white" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-lg font-bold text-white">{guide.title}</h3>
                    <div className="flex items-center gap-2 mt-1">
                      <Clock className="w-3 h-3 text-gray-400" />
                      <span className="text-xs text-gray-400">{guide.duration}</span>
                    </div>
                  </div>
                </div>
                
                <p className="text-gray-300 mb-4">{guide.description}</p>
                
                <div className="flex items-center justify-between mb-4">
                  <span className={`px-3 py-1 rounded-full text-xs font-medium ${getDifficultyColor(guide.difficulty)}`}>
                    {guide.difficulty}
                  </span>
                  <div className="flex items-center gap-1">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className="w-3 h-3 text-yellow-400 fill-current" />
                    ))}
                  </div>
                </div>
                
                <button className="w-full bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white py-3 rounded-xl font-semibold transition-all">
                  {guide.type === 'video' ? 'Regarder' : 'Lire le guide'}
                </button>
              </div>
            );
          })}
        </div>

        {/* Featured Guide */}
        <div className="mt-16 bg-gradient-to-r from-cyan-500/20 to-blue-600/20 backdrop-blur-xl rounded-3xl p-8 border border-cyan-400/30">
          <div className="text-center">
            <h2 className="text-3xl font-bold text-white mb-4">Guide Complet</h2>
            <p className="text-xl text-gray-300 mb-8">
              Maîtrisez OmnIA de A à Z avec notre formation complète
            </p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              <div className="text-center">
                <div className="text-2xl font-bold text-cyan-400">12</div>
                <div className="text-gray-300">Modules</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-cyan-400">3h</div>
                <div className="text-gray-300">Durée</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-cyan-400">Gratuit</div>
                <div className="text-gray-300">Prix</div>
              </div>
            </div>
            <button className="bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white px-8 py-4 rounded-2xl font-bold text-lg transition-all shadow-2xl hover:shadow-cyan-500/40">
              Commencer la formation
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};