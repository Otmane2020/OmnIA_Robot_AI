import React, { useState, useEffect } from 'react';
import { Store, Eye, CreditCard as Edit, Save, RefreshCw, Palette, Type, Image, LayoutGrid as Layout, Settings, Monitor, Smartphone, Tablet, TrendingUp } from 'lucide-react';
import { useNotifications } from './NotificationSystem';

interface ShopPageBuilderProps {
  retailerId?: string;
  companyName?: string;
  subdomain?: string;
}

interface ShopPageConfig {
  header: {
    logo_url: string;
    company_name: string;
    navigation_items: string[];
    contact_info: {
      phone: string;
      email: string;
      address: string;
    };
  };
  hero: {
    title: string;
    subtitle: string;
    background_image: string;
    cta_text: string;
    cta_link: string;
  };
  products: {
    featured_products: string[];
    categories_display: string[];
    products_per_page: number;
    show_filters: boolean;
  };
  footer: {
    description: string;
    social_links: {
      facebook?: string;
      instagram?: string;
      twitter?: string;
    };
    legal_pages: string[];
  };
  theme: {
    primary_color: string;
    secondary_color: string;
    font_family: string;
    border_radius: string;
  };
  seo: {
    meta_title: string;
    meta_description: string;
    keywords: string[];
  };
}

export const ShopPageBuilder: React.FC<ShopPageBuilderProps> = ({ 
  retailerId, 
  companyName, 
  subdomain 
}) => {
  const [pageConfig, setPageConfig] = useState<ShopPageConfig | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [activeSection, setActiveSection] = useState('header');
  const [previewMode, setPreviewMode] = useState<'desktop' | 'tablet' | 'mobile'>('desktop');
  const [showPreview, setShowPreview] = useState(false);
  const { showSuccess, showError, showInfo } = useNotifications();

  useEffect(() => {
    loadShopPageConfig();
  }, [retailerId]);

  const loadShopPageConfig = async () => {
    try {
      setIsLoading(true);
      
      // Charger la configuration existante ou créer une par défaut
      const savedConfig = localStorage.getItem(`shop_page_config_${retailerId || 'demo'}`);
      
      if (savedConfig) {
        setPageConfig(JSON.parse(savedConfig));
      } else {
        // Configuration par défaut
        const defaultConfig: ShopPageConfig = {
          header: {
            logo_url: '',
            company_name: companyName || 'Ma Boutique',
            navigation_items: ['Accueil', 'Catalogue', 'À propos', 'Contact'],
            contact_info: {
              phone: '+33 1 23 45 67 89',
              email: 'contact@maboutique.fr',
              address: '123 Rue de la Paix, 75001 Paris'
            }
          },
          hero: {
            title: `Bienvenue chez ${companyName || 'Ma Boutique'}`,
            subtitle: 'Découvrez notre collection de mobilier design et contemporain',
            background_image: 'https://images.pexels.com/photos/1350789/pexels-photo-1350789.jpeg',
            cta_text: 'Découvrir le catalogue',
            cta_link: '#catalogue'
          },
          products: {
            featured_products: [],
            categories_display: ['Canapés', 'Tables', 'Chaises', 'Rangement'],
            products_per_page: 12,
            show_filters: true
          },
          footer: {
            description: `${companyName || 'Ma Boutique'} - Spécialiste du mobilier design depuis 2020`,
            social_links: {
              facebook: '',
              instagram: '',
              twitter: ''
            },
            legal_pages: ['Mentions légales', 'CGV', 'Politique de confidentialité']
          },
          theme: {
            primary_color: '#0891b2',
            secondary_color: '#1e40af',
            font_family: 'Inter',
            border_radius: '12px'
          },
          seo: {
            meta_title: `${companyName || 'Ma Boutique'} - Mobilier Design et Contemporain`,
            meta_description: `Découvrez la collection ${companyName || 'Ma Boutique'} : canapés, tables, chaises design. Livraison gratuite. Garantie 2 ans.`,
            keywords: ['mobilier', 'design', 'canapé', 'table', 'chaise', companyName?.toLowerCase() || 'boutique']
          }
        };
        
        setPageConfig(defaultConfig);
      }
      
    } catch (error) {
      console.error('❌ Erreur chargement config:', error);
      showError('Erreur chargement', 'Impossible de charger la configuration de la boutique.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSaveConfig = async () => {
    if (!pageConfig) return;
    
    setIsSaving(true);
    
    try {
      // Sauvegarder la configuration
      localStorage.setItem(`shop_page_config_${retailerId || 'demo'}`, JSON.stringify(pageConfig));
      
      // Générer la page HTML
      const htmlPage = generateShopHTML(pageConfig, subdomain);
      localStorage.setItem(`shop_page_html_${retailerId || 'demo'}`, htmlPage);
      
      showSuccess(
        'Configuration sauvegardée',
        'Votre page boutique a été mise à jour avec succès',
        [
          {
            label: 'Voir aperçu',
            action: () => setShowPreview(true),
            variant: 'primary'
          }
        ]
      );
      
    } catch (error) {
      console.error('❌ Erreur sauvegarde:', error);
      showError('Erreur sauvegarde', 'Impossible de sauvegarder la configuration.');
    } finally {
      setIsSaving(false);
    }
  };

  const generateShopHTML = (config: ShopPageConfig, subdomain?: string): string => {
    return `<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${config.seo.meta_title}</title>
  <meta name="description" content="${config.seo.meta_description}">
  <meta name="keywords" content="${config.seo.keywords.join(', ')}">
  
  <!-- Open Graph -->
  <meta property="og:title" content="${config.seo.meta_title}">
  <meta property="og:description" content="${config.seo.meta_description}">
  <meta property="og:image" content="${config.hero.background_image}">
  <meta property="og:url" content="https://${subdomain || 'boutique'}.omnia.sale">
  
  <!-- Styles -->
  <style>
    :root {
      --primary-color: ${config.theme.primary_color};
      --secondary-color: ${config.theme.secondary_color};
      --border-radius: ${config.theme.border_radius};
    }
    
    * { margin: 0; padding: 0; box-sizing: border-box; }
    
    body {
      font-family: '${config.theme.font_family}', sans-serif;
      line-height: 1.6;
      color: #333;
    }
    
    .header {
      background: white;
      box-shadow: 0 2px 10px rgba(0,0,0,0.1);
      padding: 1rem 0;
    }
    
    .container {
      max-width: 1200px;
      margin: 0 auto;
      padding: 0 1rem;
    }
    
    .hero {
      background: linear-gradient(rgba(0,0,0,0.4), rgba(0,0,0,0.4)), url('${config.hero.background_image}');
      background-size: cover;
      background-position: center;
      color: white;
      text-align: center;
      padding: 6rem 0;
    }
    
    .hero h1 {
      font-size: 3rem;
      margin-bottom: 1rem;
      font-weight: bold;
    }
    
    .hero p {
      font-size: 1.2rem;
      margin-bottom: 2rem;
    }
    
    .cta-button {
      background: var(--primary-color);
      color: white;
      padding: 1rem 2rem;
      border: none;
      border-radius: var(--border-radius);
      font-size: 1.1rem;
      font-weight: bold;
      cursor: pointer;
      text-decoration: none;
      display: inline-block;
      transition: all 0.3s ease;
    }
    
    .cta-button:hover {
      transform: translateY(-2px);
      box-shadow: 0 10px 25px rgba(0,0,0,0.2);
    }
    
    .products-section {
      padding: 4rem 0;
      background: #f8f9fa;
    }
    
    .product-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
      gap: 2rem;
      margin-top: 2rem;
    }
    
    .product-card {
      background: white;
      border-radius: var(--border-radius);
      overflow: hidden;
      box-shadow: 0 4px 15px rgba(0,0,0,0.1);
      transition: transform 0.3s ease;
    }
    
    .product-card:hover {
      transform: translateY(-5px);
    }
    
    .product-image {
      width: 100%;
      height: 200px;
      object-fit: cover;
    }
    
    .product-info {
      padding: 1.5rem;
    }
    
    .product-title {
      font-size: 1.1rem;
      font-weight: bold;
      margin-bottom: 0.5rem;
    }
    
    .product-price {
      color: var(--primary-color);
      font-size: 1.2rem;
      font-weight: bold;
    }
    
    .footer {
      background: #2d3748;
      color: white;
      padding: 3rem 0;
      text-align: center;
    }
    
    /* Widget OmnIA */
    #omnia-chat {
      position: fixed;
      bottom: 20px;
      right: 20px;
      z-index: 1000;
    }
  </style>
</head>
<body>
  <!-- Header -->
  <header class="header">
    <div class="container">
      <nav style="display: flex; justify-content: space-between; align-items: center;">
        <div style="display: flex; align-items: center; gap: 1rem;">
          ${config.header.logo_url ? `<img src="${config.header.logo_url}" alt="Logo" style="height: 40px;">` : ''}
          <h2 style="color: var(--primary-color); font-weight: bold;">${config.header.company_name}</h2>
        </div>
        <div style="display: flex; gap: 2rem;">
          ${config.header.navigation_items.map(item => `<a href="#${item.toLowerCase()}" style="color: #333; text-decoration: none; font-weight: 500;">${item}</a>`).join('')}
        </div>
      </nav>
    </div>
  </header>

  <!-- Hero Section -->
  <section class="hero">
    <div class="container">
      <h1>${config.hero.title}</h1>
      <p>${config.hero.subtitle}</p>
      <a href="${config.hero.cta_link}" class="cta-button">${config.hero.cta_text}</a>
    </div>
  </section>

  <!-- Products Section -->
  <section class="products-section" id="catalogue">
    <div class="container">
      <h2 style="text-align: center; font-size: 2.5rem; margin-bottom: 1rem; color: #2d3748;">Notre Collection</h2>
      <p style="text-align: center; color: #666; margin-bottom: 3rem;">Découvrez nos meubles design sélectionnés avec soin</p>
      
      <div class="product-grid">
        <!-- Les produits seront chargés dynamiquement -->
        <div class="product-card">
          <img src="https://images.pexels.com/photos/1350789/pexels-photo-1350789.jpeg" alt="Canapé" class="product-image">
          <div class="product-info">
            <h3 class="product-title">Canapé ALYANA</h3>
            <p style="color: #666; margin-bottom: 1rem;">Canapé convertible en velours côtelé</p>
            <div class="product-price">799€</div>
          </div>
        </div>
        
        <div class="product-card">
          <img src="https://images.pexels.com/photos/1571460/pexels-photo-1571460.jpeg" alt="Table" class="product-image">
          <div class="product-info">
            <h3 class="product-title">Table AUREA</h3>
            <p style="color: #666; margin-bottom: 1rem;">Table ronde en travertin naturel</p>
            <div class="product-price">499€</div>
          </div>
        </div>
        
        <div class="product-card">
          <img src="https://images.pexels.com/photos/586763/pexels-photo-586763.jpeg" alt="Chaise" class="product-image">
          <div class="product-info">
            <h3 class="product-title">Chaise INAYA</h3>
            <p style="color: #666; margin-bottom: 1rem;">Chaise en tissu chenille</p>
            <div class="product-price">99€</div>
          </div>
        </div>
      </div>
    </div>
  </section>

  <!-- Footer -->
  <footer class="footer">
    <div class="container">
      <p style="margin-bottom: 1rem;">${config.footer.description}</p>
      <div style="display: flex; justify-content: center; gap: 2rem; margin-bottom: 2rem;">
        ${config.footer.legal_pages.map(page => `<a href="#${page.toLowerCase()}" style="color: #cbd5e0;">${page}</a>`).join('')}
      </div>
      <p style="color: #a0aec0;">© 2025 ${config.header.company_name}. Tous droits réservés.</p>
    </div>
  </footer>

  <!-- Widget OmnIA -->
  <div id="omnia-chat" data-store="${subdomain || 'demo'}"></div>
  <script src="https://widget.omnia.sale/embed.js"></script>
  
  <!-- Analytics -->
  <script>
    // Google Analytics ou autre tracking
    console.log('Page boutique ${config.header.company_name} chargée');
  </script>
</body>
</html>`;
  };

  const updateConfig = (section: string, field: string, value: any) => {
    if (!pageConfig) return;
    
    setPageConfig(prev => ({
      ...prev!,
      [section]: {
        ...prev![section as keyof ShopPageConfig],
        [field]: value
      }
    }));
  };

  const sections = [
    { id: 'header', label: 'En-tête', icon: Layout },
    { id: 'hero', label: 'Section Hero', icon: Image },
    { id: 'products', label: 'Produits', icon: Store },
    { id: 'footer', label: 'Pied de page', icon: Type },
    { id: 'theme', label: 'Thème', icon: Palette },
    { id: 'seo', label: 'SEO', icon: TrendingUp }
  ];

  const renderSectionEditor = () => {
    if (!pageConfig) return null;

    switch (activeSection) {
      case 'header':
        return (
          <div className="space-y-4">
            <div>
              <label className="block text-sm text-cyan-300 mb-2">Nom de la boutique</label>
              <input
                type="text"
                value={pageConfig.header.company_name}
                onChange={(e) => updateConfig('header', 'company_name', e.target.value)}
                className="w-full bg-black/40 border border-cyan-500/50 rounded-xl px-4 py-3 text-white"
              />
            </div>
            
            <div>
              <label className="block text-sm text-cyan-300 mb-2">URL du logo</label>
              <input
                type="url"
                value={pageConfig.header.logo_url}
                onChange={(e) => updateConfig('header', 'logo_url', e.target.value)}
                className="w-full bg-black/40 border border-cyan-500/50 rounded-xl px-4 py-3 text-white"
                placeholder="https://example.com/logo.png"
              />
            </div>
            
            <div>
              <label className="block text-sm text-cyan-300 mb-2">Téléphone</label>
              <input
                type="tel"
                value={pageConfig.header.contact_info.phone}
                onChange={(e) => updateConfig('header', 'contact_info', {
                  ...pageConfig.header.contact_info,
                  phone: e.target.value
                })}
                className="w-full bg-black/40 border border-cyan-500/50 rounded-xl px-4 py-3 text-white"
              />
            </div>
          </div>
        );

      case 'hero':
        return (
          <div className="space-y-4">
            <div>
              <label className="block text-sm text-cyan-300 mb-2">Titre principal</label>
              <input
                type="text"
                value={pageConfig.hero.title}
                onChange={(e) => updateConfig('hero', 'title', e.target.value)}
                className="w-full bg-black/40 border border-cyan-500/50 rounded-xl px-4 py-3 text-white"
              />
            </div>
            
            <div>
              <label className="block text-sm text-cyan-300 mb-2">Sous-titre</label>
              <textarea
                value={pageConfig.hero.subtitle}
                onChange={(e) => updateConfig('hero', 'subtitle', e.target.value)}
                className="w-full bg-black/40 border border-cyan-500/50 rounded-xl px-4 py-3 text-white resize-none"
                rows={3}
              />
            </div>
            
            <div>
              <label className="block text-sm text-cyan-300 mb-2">Image de fond</label>
              <input
                type="url"
                value={pageConfig.hero.background_image}
                onChange={(e) => updateConfig('hero', 'background_image', e.target.value)}
                className="w-full bg-black/40 border border-cyan-500/50 rounded-xl px-4 py-3 text-white"
              />
            </div>
            
            <div>
              <label className="block text-sm text-cyan-300 mb-2">Texte du bouton</label>
              <input
                type="text"
                value={pageConfig.hero.cta_text}
                onChange={(e) => updateConfig('hero', 'cta_text', e.target.value)}
                className="w-full bg-black/40 border border-cyan-500/50 rounded-xl px-4 py-3 text-white"
              />
            </div>
          </div>
        );

      case 'theme':
        return (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm text-cyan-300 mb-2">Couleur principale</label>
                <div className="flex gap-2">
                  <input
                    type="color"
                    value={pageConfig.theme.primary_color}
                    onChange={(e) => updateConfig('theme', 'primary_color', e.target.value)}
                    className="w-12 h-12 rounded-lg border border-gray-600"
                  />
                  <input
                    type="text"
                    value={pageConfig.theme.primary_color}
                    onChange={(e) => updateConfig('theme', 'primary_color', e.target.value)}
                    className="flex-1 bg-black/40 border border-cyan-500/50 rounded-xl px-4 py-3 text-white"
                  />
                </div>
              </div>
              
              <div>
                <label className="block text-sm text-cyan-300 mb-2">Couleur secondaire</label>
                <div className="flex gap-2">
                  <input
                    type="color"
                    value={pageConfig.theme.secondary_color}
                    onChange={(e) => updateConfig('theme', 'secondary_color', e.target.value)}
                    className="w-12 h-12 rounded-lg border border-gray-600"
                  />
                  <input
                    type="text"
                    value={pageConfig.theme.secondary_color}
                    onChange={(e) => updateConfig('theme', 'secondary_color', e.target.value)}
                    className="flex-1 bg-black/40 border border-cyan-500/50 rounded-xl px-4 py-3 text-white"
                  />
                </div>
              </div>
            </div>
            
            <div>
              <label className="block text-sm text-cyan-300 mb-2">Police de caractères</label>
              <select
                value={pageConfig.theme.font_family}
                onChange={(e) => updateConfig('theme', 'font_family', e.target.value)}
                className="w-full bg-black/40 border border-cyan-500/50 rounded-xl px-4 py-3 text-white"
              >
                <option value="Inter">Inter</option>
                <option value="Roboto">Roboto</option>
                <option value="Open Sans">Open Sans</option>
                <option value="Poppins">Poppins</option>
                <option value="Montserrat">Montserrat</option>
              </select>
            </div>
          </div>
        );

      case 'seo':
        return (
          <div className="space-y-4">
            <div>
              <label className="block text-sm text-cyan-300 mb-2">Titre SEO (max 70 caractères)</label>
              <input
                type="text"
                value={pageConfig.seo.meta_title}
                onChange={(e) => updateConfig('seo', 'meta_title', e.target.value)}
                className="w-full bg-black/40 border border-cyan-500/50 rounded-xl px-4 py-3 text-white"
                maxLength={70}
              />
              <div className="text-xs text-gray-400 mt-1">
                {pageConfig.seo.meta_title.length}/70 caractères
              </div>
            </div>
            
            <div>
              <label className="block text-sm text-cyan-300 mb-2">Meta description (max 155 caractères)</label>
              <textarea
                value={pageConfig.seo.meta_description}
                onChange={(e) => updateConfig('seo', 'meta_description', e.target.value)}
                className="w-full bg-black/40 border border-cyan-500/50 rounded-xl px-4 py-3 text-white resize-none"
                rows={3}
                maxLength={155}
              />
              <div className="text-xs text-gray-400 mt-1">
                {pageConfig.seo.meta_description.length}/155 caractères
              </div>
            </div>
            
            <div>
              <label className="block text-sm text-cyan-300 mb-2">Mots-clés (séparés par des virgules)</label>
              <input
                type="text"
                value={pageConfig.seo.keywords.join(', ')}
                onChange={(e) => updateConfig('seo', 'keywords', e.target.value.split(',').map(k => k.trim()))}
                className="w-full bg-black/40 border border-cyan-500/50 rounded-xl px-4 py-3 text-white"
                placeholder="mobilier, design, canapé, table"
              />
            </div>
          </div>
        );

      default:
        return <div className="text-white">Section en développement</div>;
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-cyan-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-white text-lg">Chargement du constructeur de boutique...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold text-white flex items-center gap-3">
            <Store className="w-8 h-8 text-blue-400" />
            Constructeur de Boutique
          </h2>
          <p className="text-gray-300 mt-2">
            Créez votre page boutique personnalisée avec widget OmnIA intégré
          </p>
        </div>
        
        <div className="flex items-center gap-3">
          <div className="flex bg-black/40 rounded-xl p-1">
            <button
              onClick={() => setPreviewMode('desktop')}
              className={`p-2 rounded-lg transition-all ${previewMode === 'desktop' ? 'bg-cyan-500 text-white' : 'text-gray-400'}`}
            >
              <Monitor className="w-4 h-4" />
            </button>
            <button
              onClick={() => setPreviewMode('tablet')}
              className={`p-2 rounded-lg transition-all ${previewMode === 'tablet' ? 'bg-cyan-500 text-white' : 'text-gray-400'}`}
            >
              <Tablet className="w-4 h-4" />
            </button>
            <button
              onClick={() => setPreviewMode('mobile')}
              className={`p-2 rounded-lg transition-all ${previewMode === 'mobile' ? 'bg-cyan-500 text-white' : 'text-gray-400'}`}
            >
              <Smartphone className="w-4 h-4" />
            </button>
          </div>
          
          <button
            onClick={() => setShowPreview(true)}
            className="bg-purple-600/20 hover:bg-purple-600/30 border border-purple-400/50 text-purple-300 px-4 py-2 rounded-xl transition-all flex items-center gap-2"
          >
            <Eye className="w-4 h-4" />
            Aperçu
          </button>
          
          <button
            onClick={handleSaveConfig}
            disabled={isSaving}
            className="bg-gradient-to-r from-blue-500 to-cyan-600 hover:from-blue-400 hover:to-cyan-500 disabled:from-gray-600 disabled:to-gray-700 text-white px-6 py-3 rounded-xl font-semibold transition-all disabled:cursor-not-allowed flex items-center gap-2"
          >
            {isSaving ? (
              <>
                <RefreshCw className="w-5 h-5 animate-spin" />
                Sauvegarde...
              </>
            ) : (
              <>
                <Save className="w-5 h-5" />
                Sauvegarder
              </>
            )}
          </button>
        </div>
      </div>

      {/* Interface d'édition */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Menu sections */}
        <div className="bg-white/10 backdrop-blur-xl rounded-2xl p-6 border border-white/20">
          <h3 className="text-lg font-bold text-white mb-4">Sections</h3>
          <nav className="space-y-2">
            {sections.map((section) => {
              const Icon = section.icon;
              return (
                <button
                  key={section.id}
                  onClick={() => setActiveSection(section.id)}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all text-left ${
                    activeSection === section.id
                      ? 'bg-cyan-500/30 text-white border border-cyan-500/50'
                      : 'text-gray-300 hover:bg-white/10 hover:text-white'
                  }`}
                >
                  <Icon className="w-5 h-5" />
                  <span className="font-medium">{section.label}</span>
                </button>
              );
            })}
          </nav>
        </div>

        {/* Éditeur de section */}
        <div className="lg:col-span-3 bg-white/10 backdrop-blur-xl rounded-2xl p-6 border border-white/20">
          <h3 className="text-xl font-bold text-white mb-6">
            {sections.find(s => s.id === activeSection)?.label}
          </h3>
          {renderSectionEditor()}
        </div>
      </div>

      {/* Informations boutique */}
      <div className="bg-gradient-to-r from-blue-500/20 to-cyan-600/20 backdrop-blur-xl rounded-2xl p-8 border border-blue-400/30">
        <h3 className="text-2xl font-bold text-white mb-4">Votre Boutique OmnIA</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div>
            <div className="text-cyan-300 text-sm">URL de votre boutique</div>
            <div className="text-white font-bold text-lg">
              {subdomain || 'demo'}.omnia.sale
            </div>
          </div>
          <div>
            <div className="text-cyan-300 text-sm">Widget OmnIA</div>
            <div className="text-white">Intégré automatiquement</div>
          </div>
          <div>
            <div className="text-cyan-300 text-sm">Responsive</div>
            <div className="text-white">Mobile, tablette, desktop</div>
          </div>
        </div>
      </div>

      {/* Modal aperçu */}
      {showPreview && pageConfig && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-800/95 backdrop-blur-xl rounded-2xl max-w-7xl w-full max-h-[90vh] overflow-y-auto border border-slate-600/50">
            <div className="flex items-center justify-between p-6 border-b border-slate-600/50">
              <h2 className="text-2xl font-bold text-white">Aperçu Boutique</h2>
              <button
                onClick={() => setShowPreview(false)}
                className="text-gray-400 hover:text-white transition-colors text-2xl"
              >
                ×
              </button>
            </div>

            <div className="p-6">
              <div className={`mx-auto bg-white rounded-xl overflow-hidden shadow-2xl ${
                previewMode === 'mobile' ? 'max-w-sm' : 
                previewMode === 'tablet' ? 'max-w-2xl' : 'max-w-6xl'
              }`}>
                <iframe
                  srcDoc={generateShopHTML(pageConfig, subdomain)}
                  className="w-full h-96 border-0"
                  title="Aperçu boutique"
                />
              </div>
              
              <div className="flex justify-center gap-4 mt-6">
                <button
                  onClick={() => setShowPreview(false)}
                  className="bg-gray-600 hover:bg-gray-700 text-white px-6 py-3 rounded-xl transition-all"
                >
                  Fermer
                </button>
                <button
                  onClick={() => {
                    const html = generateShopHTML(pageConfig, subdomain);
                    const blob = new Blob([html], { type: 'text/html' });
                    const url = URL.createObjectURL(blob);
                    const a = document.createElement('a');
                    a.href = url;
                    a.download = `boutique-${subdomain || 'demo'}.html`;
                    a.click();
                    URL.revokeObjectURL(url);
                  }}
                  className="bg-gradient-to-r from-blue-500 to-cyan-600 hover:from-blue-400 hover:to-cyan-500 text-white px-6 py-3 rounded-xl font-semibold transition-all"
                >
                  Télécharger HTML
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};