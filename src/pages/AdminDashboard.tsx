const menuItems = [
    {
      id: 'dashboard',
      label: 'Dashboard',
      icon: BarChart3,
      color: 'bg-blue-500'
    },
    {
      id: 'omnia-bot',
      label: 'OmnIA Bot',
      icon: Bot,
      color: 'bg-cyan-500',
      subItems: [
        { id: 'robot', label: 'Robot OmnIA', icon: Bot },
        { id: 'conversations', label: 'Conversations', icon: MessageSquare },
        { id: 'speech-to-text', label: 'Speech-to-Text', icon: Mic }
      ]
    },
    {
      id: 'ads-marketing',
      label: 'Ads & Marketing',
      icon: TrendingUp,
      color: 'bg-purple-500',
      subItems: [
        { id: 'google-merchant', label: 'Google Merchant', icon: Store },
        { id: 'budget', label: 'Budget', icon: DollarSign },
        { id: 'google-ads', label: 'Google Ads', icon: Zap, subItems: [
          { id: 'analytics', label: 'Analytics', icon: BarChart3 },
          { id: 'integration', label: 'Intégration', icon: Link },
          { id: 'campaigns', label: 'Campagnes publicitaires', icon: Target },
          { id: 'optimization', label: 'Optimisation', icon: TrendingUp }
        ]}
      ]
    },
    {
      id: 'catalog',
      label: 'Catalogue',
      icon: Package,
      color: 'bg-green-500',
      subItems: [
        { id: 'products', label: 'Produits', icon: Package },
        { id: 'enriched', label: 'Produits Enrichis', icon: Sparkles },
        { id: 'import', label: 'Import/Export', icon: Upload }
      ]
    },
    {
      id: 'ecommerce',
      label: 'E-commerce',
      icon: Store,
      color: 'bg-indigo-500',
      subItems: [
        { id: 'platforms', label: 'Plateformes', icon: Globe },
        { id: 'orders', label: 'Commandes', icon: ShoppingCart },
        { id: 'customers', label: 'Clients', icon: Users }
      ]
    },
    {
      id: 'google-merchant',
      label: 'Google Merchant',
      icon: Store,
      color: 'bg-red-500',
      subItems: [
        { id: 'feed-xml', label: 'Flux XML', icon: FileText },
        { id: 'guide', label: 'Guide d\'importation', icon: BookOpen }
      ]
    },
    {
      id: 'seo',
      label: 'SEO',
      icon: Search,
      color: 'bg-green-600',
      subItems: [
        { id: 'blog-articles', label: 'Blog & Articles', icon: FileText },
        { id: 'auto-blogging', label: 'Auto Blogging', icon: Bot },
        { id: 'backlinks', label: 'Backlinks', icon: Link },
        { id: 'integration', label: 'Intégration', icon: Globe },
        { id: 'optimization', label: 'Optimisation SEO', icon: Search }
      ]
    },
    {
      id: 'social-media',
      label: 'Réseaux Sociaux',
      icon: Share2,
      color: 'bg-pink-500',
      subItems: [
        { id: 'analytics', label: 'Analytics', icon: BarChart3 },
        { id: 'facebook', label: 'Intégration Facebook', icon: Globe },
        { id: 'instagram', label: 'Intégration Instagram', icon: Camera },
        { id: 'ads-management', label: 'Ads Management', icon: Target },
        { id: 'auto-posting', label: 'Auto-posting', icon: Send },
        { id: 'facebook-catalog', label: 'Catalogue Facebook', icon: Package }
      ]
    },
    {
      id: 'budgets',
      label: 'Budgets',
      icon: DollarSign,
      color: 'bg-yellow-500',
      subItems: [
        { id: 'budget-overview', label: 'Vue d\'ensemble', icon: BarChart3 },
        { id: 'ads-allocation', label: 'Répartition Ads', icon: PieChart },
        { id: 'roi-tracking', label: 'ROI Tracking', icon: TrendingUp }
      ]
    },
    {
      id: 'analytics',
      label: 'Analytics',
      icon: BarChart3,
      color: 'bg-orange-500'
    },
    {
      id: 'subscription',
      label: 'Abonnement',
      icon: CreditCard,
      color: 'bg-purple-600'
    },
    {
      id: 'settings',
      label: 'Paramètres',
      icon: Settings,
      color: 'bg-gray-600'
    }
  ];

  const renderGoogleMerchant = () => (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-white">Google Merchant Center</h2>
      
      <div className="bg-white/10 backdrop-blur-xl rounded-2xl p-6 border border-white/20">
        <h3 className="text-xl font-bold text-white mb-4">Flux XML Google Shopping</h3>
        <p className="text-gray-300 mb-4">
          Générez automatiquement votre flux XML pour Google Merchant Center basé sur vos produits enrichis.
        </p>
        
        <div className="bg-blue-500/20 border border-blue-400/50 rounded-xl p-4 mb-4">
          <h4 className="font-semibold text-blue-200 mb-2">📊 Champs inclus dans le flux :</h4>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-2 text-sm text-blue-300">
            <div>• ID produit</div>
            <div>• Titre</div>
            <div>• Description</div>
            <div>• Catégorie Google</div>
            <div>• Lien produit</div>
            <div>• Image principale</div>
            <div>• Condition</div>
            <div>• Disponibilité</div>
            <div>• Prix</div>
            <div>• Prix barré</div>
            <div>• MPN</div>
            <div>• Marque</div>
            <div>• Lien canonique</div>
            <div>• Images additionnelles</div>
            <div>• Dimensions</div>
            <div>• Matériau</div>
            <div>• GTIN</div>
            <div>• Couleur</div>
            <div>• Quantité</div>
            <div>• Taille</div>
          </div>
        </div>
        
        <div className="flex gap-4">
          <button className="bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-xl font-semibold transition-all">
            Générer Flux XML
          </button>
          <button className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-xl font-semibold transition-all">
            Télécharger XML
          </button>
        </div>
        
        <div className="mt-4 p-4 bg-green-500/20 border border-green-400/30 rounded-xl">
          <p className="text-green-300 text-sm">
            <strong>URL du flux :</strong> https://{currentUser?.company_name?.toLowerCase().replace(/[^a-z0-9]/g, '') || 'boutique'}.omnia.sale/feed/xml/google-shopping.xml
          </p>
        </div>
      </div>
      
      <div className="bg-white/10 backdrop-blur-xl rounded-2xl p-6 border border-white/20">
        <h3 className="text-xl font-bold text-white mb-4">Guide d'importation Google Merchant</h3>
        
        <div className="space-y-4">
          <div className="bg-blue-500/20 border border-blue-400/50 rounded-xl p-4">
            <h4 className="font-semibold text-blue-200 mb-2">📋 Étapes d'importation :</h4>
            <ol className="text-blue-300 text-sm space-y-2">
              <li>1. <strong>Connectez-vous à Google Merchant Center</strong></li>
              <li>2. <strong>Produits → Flux</strong> → Ajouter un flux</li>
              <li>3. <strong>URL du flux :</strong> Copiez l'URL générée ci-dessus</li>
              <li>4. <strong>Pays/Langue :</strong> France / Français</li>
              <li>5. <strong>Validation :</strong> Google vérifie automatiquement</li>
            </ol>
          </div>
          
          <div className="bg-green-500/20 border border-green-400/50 rounded-xl p-4">
            <h4 className="font-semibold text-green-200 mb-2">✅ Avantages :</h4>
            <ul className="text-green-300 text-sm space-y-1">
              <li>• Synchronisation automatique quotidienne</li>
              <li>• Optimisation SEO automatique</li>
              <li>• Gestion des stocks en temps réel</li>
              <li>• Conformité Google Shopping</li>
            </ul>
          </div>
        </div>
      </div>
      
      <div className="text-center py-20">
        <Store className="w-16 h-16 text-gray-400 mx-auto mb-4" />
        <h3 className="text-xl font-bold text-white mb-2">Configuration en cours</h3>
        <p className="text-gray-400">Fonctionnalités Google Merchant en développement</p>
      </div>
    </div>
  );