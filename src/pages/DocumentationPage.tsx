import React, { useState } from 'react';
import { ArrowLeft, Book, Search, Code, Zap, Settings, Bot, Store } from 'lucide-react';
import { Logo } from '../components/Logo';
import { Footer } from '../components/Footer';

export const DocumentationPage: React.FC = () => {
  const [activeSection, setActiveSection] = useState('getting-started');
  const [searchTerm, setSearchTerm] = useState('');

  const sections = [
    {
      id: 'getting-started',
      title: 'Démarrage rapide',
      icon: Zap,
      content: `
# 🚀 Démarrage rapide OmnIA

## 1. Inscription et validation

1. **Créez votre compte** sur [omnia.sale/register](/register)
2. **Remplissez** les informations entreprise et SIRET
3. **Choisissez** votre plan (14 jours gratuits)
4. **Attendez** la validation (24-48h)

## 2. Configuration initiale

1. **Connectez-vous** à votre interface admin
2. **Importez** votre catalogue (CSV, Shopify, XML)
3. **Configurez** OmnIA selon votre marque
4. **Testez** l'assistant robot

## 3. Intégration sur votre site

\`\`\`html
<script src="https://widget.omnia.sale/embed.js"></script>
<div id="omnia-chat" data-store="votre-magasin"></div>
\`\`\`

## 4. Formation et support

- 📚 Consultez cette documentation
- 🎥 Regardez nos tutoriels vidéo
- 💬 Contactez le support : support@omnia.sale
      `
    },
    {
      id: 'catalog-import',
      title: 'Import catalogue',
      icon: Store,
      content: `
# 📦 Import de votre catalogue

## Formats supportés

### CSV (Recommandé)
\`\`\`csv
nom,prix,image_url,description,categorie,stock,url_produit
"Canapé ALYANA",799,"https://...","Description","Canapé",10,"https://..."
\`\`\`

### Shopify API
- Synchronisation automatique temps réel
- Gestion des stocks et prix
- Import des variantes

### Feed XML
- Synchronisation quotidienne programmée
- Compatible avec tous les formats standards

## Étapes d'import

1. **Préparez** votre fichier CSV avec les colonnes requises
2. **Uploadez** via l'interface admin
3. **Mappez** les champs si nécessaire
4. **Validez** l'import
5. **Entraînez** l'IA automatiquement

## Bonnes pratiques

- Utilisez des descriptions détaillées (couleurs, matériaux, dimensions)
- Incluez des images haute qualité
- Catégorisez précisément vos produits
- Maintenez les stocks à jour
      `
    },
    {
      id: 'robot-config',
      title: 'Configuration robot',
      icon: Bot,
      content: `
# 🤖 Configuration du robot OmnIA

## Personnalité

Configurez la personnalité de votre robot :

- **Commercial & Amical** : Ton chaleureux et vendeur
- **Expert Technique** : Réponses précises et détaillées  
- **Conseiller Déco** : Focus sur l'aménagement d'intérieur

## Voix et langue

### Fournisseurs TTS
- **ElevenLabs** (Premium) : Voix naturelle haute qualité
- **OpenAI TTS** (Standard) : Voix claire et rapide
- **Navigateur** (Gratuit) : Synthèse vocale basique

### Voix disponibles
- **Onyx** : Homme, grave et posé
- **Alloy** : Homme, clair et dynamique
- **Nova** : Femme, douce et professionnelle
- **Shimmer** : Femme, énergique et moderne

## Paramètres avancés

\`\`\`javascript
{
  "personality": "commercial",
  "language": "fr-FR",
  "voice_provider": "elevenlabs",
  "voice_id": "onyx",
  "speech_rate": 1.2,
  "response_length": "medium"
}
\`\`\`

## Entraînement IA

L'IA s'entraîne automatiquement sur :
- Votre catalogue produits
- Les conversations clients
- Les préférences détectées
- Les tendances de vente
      `
    },
    {
      id: 'api-reference',
      title: 'Référence API',
      icon: Code,
      content: `
# 🔌 API OmnIA.sale

## Authentification

Toutes les requêtes API nécessitent une clé d'authentification :

\`\`\`bash
curl -H "Authorization: Bearer YOUR_API_KEY" \\
     -H "Content-Type: application/json" \\
     https://api.omnia.sale/v1/
\`\`\`

## Endpoints principaux

### Chat avec OmnIA
\`\`\`javascript
POST /v1/chat
{
  "message": "Je cherche un canapé bleu",
  "session_id": "optional-session-id",
  "user_context": {
    "budget": "500-1000",
    "room": "salon"
  }
}
\`\`\`

### Import produits
\`\`\`javascript
POST /v1/products/import
{
  "source": "csv|shopify|xml",
  "data": "...",
  "auto_train": true
}
\`\`\`

### Analytics
\`\`\`javascript
GET /v1/analytics?period=30d
{
  "conversations": 1234,
  "conversions": 89,
  "top_products": [...],
  "satisfaction": 4.7
}
\`\`\`

## Webhooks

Configurez des webhooks pour recevoir les événements :

\`\`\`javascript
{
  "events": ["conversation.started", "product.added_to_cart", "order.completed"],
  "url": "https://votre-site.com/webhook",
  "secret": "webhook-secret"
}
\`\`\`

## Codes d'erreur

- **200** : Succès
- **400** : Requête invalide
- **401** : Non authentifié
- **403** : Accès refusé
- **429** : Limite de taux atteinte
- **500** : Erreur serveur
      `
    },
    {
      id: 'troubleshooting',
      title: 'Dépannage',
      icon: Settings,
      content: `
# 🔧 Guide de dépannage

## Problèmes courants

### Import catalogue échoue
**Symptômes :** Import bloqué à 45%
**Solutions :**
1. Vérifiez l'encodage UTF-8 de votre CSV
2. Supprimez les caractères spéciaux des descriptions
3. Limitez les descriptions à 2000 caractères
4. Contactez le support avec votre fichier

### Robot ne répond pas
**Symptômes :** Pas de réponse ou erreur
**Solutions :**
1. Vérifiez votre connexion internet
2. Actualisez la page
3. Videz le cache navigateur
4. Vérifiez le statut sur [status.omnia.sale](https://status.omnia.sale)

### Voix ne fonctionne pas
**Symptômes :** Pas de synthèse vocale
**Solutions :**
1. Autorisez l'audio dans votre navigateur
2. Vérifiez le volume système
3. Testez avec un autre navigateur
4. Contactez le support si le problème persiste

### Widget ne s'affiche pas
**Symptômes :** Widget invisible sur le site
**Solutions :**
1. Vérifiez le code d'intégration
2. Contrôlez les conflits CSS
3. Testez en mode incognito
4. Vérifiez la console développeur

## Logs et diagnostics

### Activer les logs détaillés
\`\`\`javascript
localStorage.setItem('omnia_debug', 'true');
\`\`\`

### Vérifier la connexion API
\`\`\`javascript
fetch('https://api.omnia.sale/v1/health')
  .then(r => r.json())
  .then(console.log);
\`\`\`

## Support avancé

Pour un support technique avancé :
1. **Collectez** les logs d'erreur
2. **Notez** les étapes de reproduction
3. **Envoyez** à support@omnia.sale
4. **Incluez** votre ID revendeur
      `
    }
  ];

  const filteredSections = sections.filter(section =>
    section.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    section.content.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const renderContent = (content: string) => {
    return content.split('\n').map((line, index) => {
      // Headers
      if (line.startsWith('# ')) {
        return <h1 key={index} className="text-3xl font-bold text-white mb-6 mt-8">{line.replace('# ', '')}</h1>;
      }
      if (line.startsWith('## ')) {
        return <h2 key={index} className="text-2xl font-bold text-cyan-300 mb-4 mt-6">{line.replace('## ', '')}</h2>;
      }
      if (line.startsWith('### ')) {
        return <h3 key={index} className="text-xl font-bold text-white mb-3 mt-4">{line.replace('### ', '')}</h3>;
      }

      // Code blocks
      if (line.startsWith('```')) {
        return <div key={index} className="my-4"></div>;
      }

      // Lists
      if (line.startsWith('- ') || line.startsWith('* ')) {
        return (
          <li key={index} className="text-gray-300 mb-2 ml-4">
            {line.replace(/^[*-] /, '')}
          </li>
        );
      }

      // Numbered lists
      if (/^\d+\./.test(line)) {
        return (
          <li key={index} className="text-gray-300 mb-2 ml-4">
            {line.replace(/^\d+\. /, '')}
          </li>
        );
      }

      // Bold text
      if (line.includes('**')) {
        const parts = line.split(/(\*\*.*?\*\*)/g);
        return (
          <p key={index} className="text-gray-300 mb-3">
            {parts.map((part, partIndex) => {
              if (part.startsWith('**') && part.endsWith('**')) {
                return <strong key={partIndex} className="text-white">{part.slice(2, -2)}</strong>;
              }
              return part;
            })}
          </p>
        );
      }

      // Regular paragraphs
      if (line.trim() && !line.startsWith('#') && !line.startsWith('```')) {
        return <p key={index} className="text-gray-300 mb-3">{line}</p>;
      }

      return <br key={index} />;
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-purple-900">
      {/* Header */}
      <header className="bg-black/20 backdrop-blur-xl border-b border-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center gap-4">
              <Logo size="md" />
              <div>
                <h1 className="text-2xl font-bold text-white">Documentation OmnIA</h1>
                <p className="text-cyan-300">Guides et références techniques</p>
              </div>
            </div>
            <a href="/" className="flex items-center gap-2 text-cyan-400 hover:text-cyan-300 transition-colors">
              <ArrowLeft className="w-4 h-4" />
              Retour accueil
            </a>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-white/10 backdrop-blur-xl rounded-2xl p-6 border border-white/20 sticky top-8">
              {/* Search */}
              <div className="relative mb-6">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Rechercher..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 bg-black/40 border border-gray-600 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:border-cyan-400"
                />
              </div>

              {/* Navigation */}
              <nav className="space-y-2">
                {filteredSections.map((section) => {
                  const Icon = section.icon;
                  return (
                    <button
                      key={section.id}
                      onClick={() => setActiveSection(section.id)}
                      className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all text-left ${
                        activeSection === section.id
                          ? 'bg-cyan-500 text-white'
                          : 'text-gray-400 hover:text-white hover:bg-white/10'
                      }`}
                    >
                      <Icon className="w-5 h-5" />
                      <span className="font-medium">{section.title}</span>
                    </button>
                  );
                })}
              </nav>
            </div>
          </div>

          {/* Content */}
          <div className="lg:col-span-3">
            <div className="bg-white/10 backdrop-blur-xl rounded-2xl p-8 border border-white/20">
              {sections
                .filter(section => section.id === activeSection)
                .map(section => (
                  <div key={section.id} className="prose prose-invert max-w-none">
                    {renderContent(section.content)}
                  </div>
                ))}
            </div>

            {/* Quick Links */}
            <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-cyan-500/20 border border-cyan-400/50 rounded-xl p-6">
                <h3 className="text-lg font-bold text-cyan-200 mb-4">🚀 Liens rapides</h3>
                <ul className="space-y-2">
                  <li><a href="/robot" className="text-cyan-300 hover:text-white transition-colors">Tester OmnIA Robot</a></li>
                  <li><a href="/admin" className="text-cyan-300 hover:text-white transition-colors">Interface Admin</a></li>
                  <li><a href="/register" className="text-cyan-300 hover:text-white transition-colors">Créer un compte</a></li>
                  <li><a href="/contact" className="text-cyan-300 hover:text-white transition-colors">Contacter le support</a></li>
                </ul>
              </div>

              <div className="bg-green-500/20 border border-green-400/50 rounded-xl p-6">
                <h3 className="text-lg font-bold text-green-200 mb-4">💡 Besoin d'aide ?</h3>
                <p className="text-green-300 mb-4">
                  Notre équipe support est disponible pour vous accompagner.
                </p>
                <a 
                  href="mailto:support@omnia.sale"
                  className="inline-flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-xl transition-all"
                >
                  <Book className="w-4 h-4" />
                  Contacter le support
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
};