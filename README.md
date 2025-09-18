# OmnIA.sale - Plateforme IA pour Revendeurs Mobilier

OmnIA.sale est la plateforme IA complète pour revendeurs de mobilier. Elle combine assistant conversationnel intelligent, interface admin professionnelle et intégration e-commerce pour transformer l'expérience client.

## Features

- 🤖 **Assistant IA Expert**: Conseils personnalisés mobilier avec OpenAI
- 🛋️ **Multi-Catalogues**: Support CSV, XML, API Shopify
- 🏢 **Interfac Admin**: Gestion complète pour revendeurs
- 🎤 **Interaction Vocale**: Reconnaissance et synthèse vocale en français
- 🎨 **Design Premium**: Interface glassmorphism responsive
- 📱 **Widget Intégrable**: Code embed pour sites e-commerce
- 💬 **Suggestions Contextuelles**: Options de réponse rapide pour l'UX
- 🛍️ **Intégration E-commerce**: Connexion directe paniers
- 💳 **Abonnements**: Plans Starter, Pro, Enterprise
- 🌐 **Domaines Personnalisés**: sous-domaines omnia.sale

## Pour les Revendeurs

### 🏢 Interface Admin Complète

1. **Connexion Sécurisée**: Authentification entreprise avec Kbis
2. **Gestion Catalogue**: Import CSV/XML/Shopify automatique
3. **Configuration IA**: Personnalisation de l'assistant
4. **Analytics**: Statistiques conversations et ventes
5. **Abonnements**: Gestion facturation et upgrades

### 📊 Formats Supportés

**CSV** (Recommandé):
```csv
nom,prix,image_url,description,categorie,stock,url_produit
"Canapé ALYANA",799,"https://...","Description","Canapé",10,"https://..."
```

**XML Feed**:
```xml
<products>
  <product>
    <title>Canapé ALYANA</title>
    <price>799</price>
    <image>https://...</image>
  </product>
</products>
```

**API Shopify**: Synchronisation automatique temps réel

## Intégration Widget

```html
<script src="https://widget.omnia.sale/embed.js"></script>
<div id="omnia-chat" data-store="votre-magasin"></div>
```

## Tarification

- **Starter**: 29€/mois - 1000 conversations, 500 produits
- **Professional**: 79€/mois - 5000 conversations, produits illimités
- **Enterprise**: 199€/mois - Conversations illimitées, multi-magasins

**14 jours d'essai gratuit sur tous les plans**

## Setup Instructions

### Prerequisites

1. **OpenAI API Key**: Clé API OpenAI pour l'intelligence conversationnelle
2. **Catalogue Produits**: Support CSV, XML ou API Shopify
3. **Supabase**: Base de données et Edge Functions pour l'IA

### Configuration

1. **Configurer Supabase**: Cliquez sur "Connect to Supabase" en haut à droite
2. **Variables d'environnement Supabase** (OBLIGATOIRE pour la voix):
   - Dans votre dashboard Supabase, allez dans **Edge Functions**
   - Cliquez sur **Environment Variables** dans le menu de gauche
   - Ajoutez ces variables :
     - `DEEPSEEK_API_KEY`: Votre clé API DeepSeek (OBLIGATOIRE)
     - `ELEVENLABS_API_KEY`: Votre clé API ElevenLabs (OBLIGATOIRE pour la voix)
     - `ELEVENLABS_VOICE_ID`: ID de la voix ElevenLabs (optionnel)

### Intégration Shopify

Pour l'intégration avec Shopify :
1. **Créer une App Privée Shopify**:
   - Aller dans Shopify Admin → Apps → App and sales channel settings
   - Cliquer "Develop apps" → "Create an app"
   - Configurer l'accès Storefront API avec ces permissions :
     - `unauthenticated_read_product_listings`
     - `unauthenticated_read_product_inventory`
     - `unauthenticated_write_checkouts`
     - `unauthenticated_write_customers`

2. **Récupérer les Identifiants**:
   - Copier le token d'accès Storefront
   - Noter le domaine du magasin (ex: `magasin.myshopify.com`)

### Clés API

L'application nécessite ces variables d'environnement dans Supabase :
- `DEEPSEEK_API_KEY`: Votre clé API DeepSeek
- `SHOPIFY_DOMAIN`: Domaine du magasin Shopify (optionnel)
- `SHOPIFY_STOREFRONT_ACCESS_TOKEN`: Token Shopify Storefront API (optionnel)

## Usage

1. Démarrer une conversation en français
2. Demander des meubles (canapé, table, chaise, etc.) pour voir les produits
3. Utiliser la conversation générale pour l'assistance design
4. Cliquer sur les cartes produits pour voir détails et ajouter au panier
5. Utiliser les suggestions rapides pour des requêtes courantes
6. Sélectionner les variantes produits et ajouter directement au panier

## Technology Stack

- **Frontend**: React, TypeScript, Tailwind CSS
- **Backend**: Supabase Edge Functions
- **AI**: DeepSeek Chat
- **E-commerce**: Multi-catalogues (CSV, XML, Shopify)
- **Deployment**: Automatic with Supabase

## Roadmap

- ✅ **Phase 1**: Plateforme OmnIA.sale avec multi-catalogues
- 🔄 **Phase 2**: Interface admin complète
- 🚀 **Phase 3**: Widget intégrable et domaines personnalisés
- 🎯 **Phase 4**: Marketplace et intégrations avancées

## Development

```bash
npm run dev
```

Le serveur de développement inclut la configuration automatique pour les fonctions Supabase.

## Contact

Pour plus d'informations ou support technique, contactez-nous à support@omnia.sale