@@ .. @@
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