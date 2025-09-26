# 🛍️ Guide : Connecter votre boutique Shopify à OmnIA

## **Méthode Simple : Token Storefront API**

### **Étape 1 : Créer une App privée dans Shopify**

1. **Connectez-vous à votre Admin Shopify**
   - Allez sur : `votre-boutique.myshopify.com/admin`

2. **Accéder aux Apps**
   - Menu de gauche → **"Apps"**
   - Cliquez sur **"App and sales channel settings"**

3. **Développer une App**
   - Cliquez sur **"Develop apps"**
   - Puis **"Create an app"**

### **Étape 2 : Configuration de l'App**

1. **Informations de base**
   ```
   App name: OmnIA Connector
   App developer: Votre nom/entreprise
   ```

2. **Configurer l'API Storefront**
   - Onglet **"Configuration"**
   - Section **"Storefront API access"**
   - Cliquez **"Configure"**

3. **Activer les permissions**
   - ✅ **"Storefront API access"** → Enable
   - Permissions automatiques :
     - `unauthenticated_read_product_listings`
     - `unauthenticated_read_product_inventory`
     - `unauthenticated_read_collection_listings`

### **Étape 3 : Récupérer le Token**

1. **Générer le token**
   - Cliquez **"Install app"**
   - Confirmez l'installation
   - Le token généré fait exactement **32 caractères**
   - Format : `c29b0658dd9fb6ba8e7d8f799f06bc2f` (exemple)

2. **Copier le Storefront access token**
   - **32 caractères** (pas de préfixe shpat_)
   - Exemple : `c29b0658dd9fb6ba8e7d8f799f06bc2f`
   - **⚠️ Gardez ce token secret et sécurisé !**

### **Étape 4 : Connecter à OmnIA**

1. **Dans l'interface OmnIA Admin**
   - Onglet **"Catalogue"**
   - Section **"Plateformes E-commerce"**
   - Cliquez **"Configurer"**

2. **Remplir les informations**
   ```
   Nom boutique: qnxv91-2w (sans .myshopify.com)
   Token: c29b0658dd9fb6ba8e7d8f799f06bc2f
   ```

3. **Tester la connexion**
   - Cliquez **"Tester le token"** d'abord
   - Puis **"Connecter avec token"**
   - Vérification automatique
   - Import du catalogue

## **🧪 Test de votre token :**

Votre boutique : `https://qnxv91-2w.myshopify.com`
Votre token : `c29b0658dd9fb6ba8e7d8f799f06bc2f`

**Test rapide :**
1. Entrez `qnxv91-2w` dans "Nom boutique"
2. Entrez `c29b0658dd9fb6ba8e7d8f799f06bc2f` dans "Token"
3. Cliquez **"Tester le token"**
4. Si ✅ succès → Cliquez **"Connecter avec token"**

## **✅ Avantages de cette méthode :**

- ✅ **Pas d'OAuth complexe**
- ✅ **Connexion directe et rapide**
- ✅ **Accès lecture seule sécurisé**
- ✅ **Synchronisation temps réel**
- ✅ **Aucune modification possible**

## **🔧 Permissions Shopify requises :**

Dans votre app Shopify, activez uniquement :
- ✅ `unauthenticated_read_product_listings`
- ✅ `unauthenticated_read_product_inventory`
- ✅ `unauthenticated_write_checkouts` (optionnel pour panier)

**❌ Toutes les autres permissions sont inutiles pour OmnIA**

## **🔒 Sécurité :**

- Token en lecture seule uniquement
- Aucun accès aux commandes ou clients
- Révocable à tout moment depuis Shopify
- Chiffrement des communications

---

**Prêt à connecter votre boutique Shopify ? Suivez le guide ! 🚀**