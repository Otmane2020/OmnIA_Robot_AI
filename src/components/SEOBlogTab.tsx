import React, { useState, useEffect } from 'react';
import { 
  FileText, Zap, TrendingUp, Calendar, Eye, Edit, Trash2,
  Plus, Search, Filter, BarChart3, Globe, Target, Brain
} from 'lucide-react';
import { useNotifications } from './NotificationSystem';

interface BlogPost {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  status: 'draft' | 'published' | 'scheduled';
  seo_score: number;
  target_keywords: string[];
  meta_title: string;
  meta_description: string;
  featured_image: string;
  published_at: string;
  views: number;
  shares: number;
  created_at: string;
}

interface SEOKeyword {
  keyword: string;
  volume: number;
  difficulty: number;
  opportunity: number;
  current_rank?: number;
}

export const SEOBlogTab: React.FC = () => {
  const [blogPosts, setBlogPosts] = useState<BlogPost[]>([]);
  const [seoKeywords, setSeoKeywords] = useState<SEOKeyword[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [selectedPost, setSelectedPost] = useState<string | null>(null);
  const { showSuccess, showError, showInfo } = useNotifications();

  useEffect(() => {
    loadBlogPosts();
    loadSEOKeywords();
  }, []);

  const loadBlogPosts = () => {
    const mockPosts: BlogPost[] = [
      {
        id: 'post-1',
        title: 'Tendances Mobilier 2025 : Le Retour du Travertin',
        slug: 'tendances-mobilier-2025-travertin',
        excerpt: 'Découvrez pourquoi le travertin devient le matériau star de 2025 pour les tables et plans de travail...',
        content: 'Article complet sur les tendances...',
        status: 'published',
        seo_score: 92,
        target_keywords: ['tendances mobilier 2025', 'table travertin', 'décoration moderne'],
        meta_title: 'Tendances Mobilier 2025 : Le Travertin Révolutionne la Déco',
        meta_description: 'Découvrez les tendances mobilier 2025 avec le travertin, matériau star pour tables et déco moderne. Guide complet par nos experts.',
        featured_image: 'https://images.pexels.com/photos/1571460/pexels-photo-1571460.jpeg',
        published_at: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
        views: 1240,
        shares: 34,
        created_at: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString()
      },
      {
        id: 'post-2',
        title: 'Comment Choisir son Canapé Convertible : Guide Complet 2025',
        slug: 'choisir-canape-convertible-guide-2025',
        excerpt: 'Canapé convertible ou canapé fixe ? Nos experts vous guident pour faire le bon choix selon votre espace...',
        content: 'Guide détaillé pour choisir...',
        status: 'published',
        seo_score: 88,
        target_keywords: ['canapé convertible', 'choisir canapé', 'guide achat mobilier'],
        meta_title: 'Comment Choisir son Canapé Convertible : Guide Expert 2025',
        meta_description: 'Guide complet pour choisir le canapé convertible parfait. Conseils d\'experts, comparatifs et sélection des meilleurs modèles 2025.',
        featured_image: 'https://images.pexels.com/photos/1350789/pexels-photo-1350789.jpeg',
        published_at: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
        views: 890,
        shares: 28,
        created_at: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000).toISOString()
      },
      {
        id: 'post-3',
        title: 'Aménager un Salon de 20m² : Astuces et Inspirations',
        slug: 'amenager-salon-20m2-astuces',
        excerpt: 'Optimisez votre salon de 20m² avec nos conseils d\'aménagement et notre sélection de meubles adaptés...',
        content: 'Conseils d\'aménagement...',
        status: 'draft',
        seo_score: 76,
        target_keywords: ['aménager salon 20m2', 'petit salon', 'optimiser espace'],
        meta_title: 'Aménager un Salon de 20m² : Guide et Inspirations Déco',
        meta_description: 'Découvrez comment aménager un salon de 20m² avec style. Conseils d\'experts, astuces gain de place et sélection mobilier adapté.',
        featured_image: 'https://images.pexels.com/photos/1866149/pexels-photo-1866149.jpeg',
        published_at: '',
        views: 0,
        shares: 0,
        created_at: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString()
      }
    ];
    setBlogPosts(mockPosts);
  };

  const loadSEOKeywords = () => {
    const mockKeywords: SEOKeyword[] = [
      { keyword: 'canapé convertible', volume: 8900, difficulty: 65, opportunity: 85, current_rank: 12 },
      { keyword: 'table travertin', volume: 2400, difficulty: 45, opportunity: 92, current_rank: 8 },
      { keyword: 'mobilier salon moderne', volume: 5600, difficulty: 70, opportunity: 78, current_rank: 15 },
      { keyword: 'chaise design contemporain', volume: 1800, difficulty: 55, opportunity: 88 },
      { keyword: 'aménagement petit salon', volume: 4200, difficulty: 60, opportunity: 82, current_rank: 18 },
      { keyword: 'tendances déco 2025', volume: 12000, difficulty: 80, opportunity: 75 }
    ];
    setSeoKeywords(mockKeywords);
  };

  const generateBlogPost = async () => {
    setIsGenerating(true);
    showInfo('Génération article', 'Création automatique d\'un article SEO avec IA...');

    try {
      // Simuler la génération IA
      await new Promise(resolve => setTimeout(resolve, 4000));

      const newPost: BlogPost = {
        id: `post-${Date.now()}`,
        title: 'Les 10 Erreurs à Éviter dans l\'Aménagement de Salon',
        slug: '10-erreurs-amenagement-salon',
        excerpt: 'Évitez ces erreurs courantes d\'aménagement et créez un salon harmonieux et fonctionnel avec nos conseils d\'experts...',
        content: 'Article généré automatiquement par IA...',
        status: 'draft',
        seo_score: 85,
        target_keywords: ['erreurs aménagement salon', 'conseils déco salon', 'aménagement salon'],
        meta_title: '10 Erreurs à Éviter dans l\'Aménagement de Salon - Guide Expert',
        meta_description: 'Découvrez les 10 erreurs les plus courantes dans l\'aménagement de salon et comment les éviter. Conseils d\'experts pour un salon parfait.',
        featured_image: 'https://images.pexels.com/photos/1866149/pexels-photo-1866149.jpeg',
        published_at: '',
        views: 0,
        shares: 0,
        created_at: new Date().toISOString()
      };

      setBlogPosts(prev => [newPost, ...prev]);
      
      showSuccess(
        'Article généré !',
        'Article SEO créé automatiquement avec optimisation pour Google !',
        [
          {
            label: 'Voir l\'article',
            action: () => setSelectedPost(newPost.id),
            variant: 'primary'
          }
        ]
      );
    } catch (error) {
      showError('Erreur génération', 'Impossible de générer l\'article automatiquement.');
    } finally {
      setIsGenerating(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'published': return 'bg-green-500/20 text-green-300';
      case 'draft': return 'bg-yellow-500/20 text-yellow-300';
      case 'scheduled': return 'bg-blue-500/20 text-blue-300';
      default: return 'bg-gray-500/20 text-gray-300';
    }
  };

  const getSEOScoreColor = (score: number) => {
    if (score >= 90) return 'text-green-400';
    if (score >= 70) return 'text-yellow-400';
    return 'text-red-400';
  };

  const getOpportunityColor = (opportunity: number) => {
    if (opportunity >= 85) return 'bg-green-500/20 text-green-300';
    if (opportunity >= 70) return 'bg-yellow-500/20 text-yellow-300';
    return 'bg-red-500/20 text-red-300';
  };

  return (
    <div className="space-y-8">
      {/* Header avec stats SEO */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-green-600/20 backdrop-blur-xl rounded-2xl p-6 border border-green-500/30">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-green-200 text-sm mb-1">Articles publiés</p>
              <p className="text-2xl font-bold text-white">{blogPosts.filter(p => p.status === 'published').length}</p>
              <p className="text-green-300 text-sm">Ce mois</p>
            </div>
            <FileText className="w-8 h-8 text-green-400" />
          </div>
        </div>
        
        <div className="bg-blue-600/20 backdrop-blur-xl rounded-2xl p-6 border border-blue-500/30">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-blue-200 text-sm mb-1">Vues totales</p>
              <p className="text-2xl font-bold text-white">{blogPosts.reduce((sum, p) => sum + p.views, 0).toLocaleString()}</p>
              <p className="text-blue-300 text-sm">Trafic organique</p>
            </div>
            <Eye className="w-8 h-8 text-blue-400" />
          </div>
        </div>
        
        <div className="bg-purple-600/20 backdrop-blur-xl rounded-2xl p-6 border border-purple-500/30">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-purple-200 text-sm mb-1">Score SEO moyen</p>
              <p className="text-2xl font-bold text-white">{Math.round(blogPosts.reduce((sum, p) => sum + p.seo_score, 0) / blogPosts.length)}</p>
              <p className="text-purple-300 text-sm">Optimisation</p>
            </div>
            <Target className="w-8 h-8 text-purple-400" />
          </div>
        </div>
        
        <div className="bg-orange-600/20 backdrop-blur-xl rounded-2xl p-6 border border-orange-500/30">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-orange-200 text-sm mb-1">Mots-clés ciblés</p>
              <p className="text-2xl font-bold text-white">{seoKeywords.length}</p>
              <p className="text-orange-300 text-sm">Opportunités</p>
            </div>
            <Search className="w-8 h-8 text-orange-400" />
          </div>
        </div>
      </div>

      {/* Génération automatique d'articles */}
      <div className="bg-white/10 backdrop-blur-xl rounded-2xl p-8 border border-white/20">
        <h3 className="text-xl font-bold text-white mb-6">Génération automatique d'articles SEO</h3>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div>
            <h4 className="font-semibold text-cyan-300 mb-3">🤖 IA de rédaction :</h4>
            <ul className="text-cyan-200 text-sm space-y-2">
              <li>• <strong>Analyse de votre catalogue :</strong> Articles basés sur vos produits</li>
              <li>• <strong>Recherche de mots-clés :</strong> Opportunités SEO automatiques</li>
              <li>• <strong>Optimisation Google :</strong> Titres, métas, structure H1-H6</li>
              <li>• <strong>Contenu expert :</strong> Conseils déco et guides d'achat</li>
              <li>• <strong>Intégration produits :</strong> Liens vers votre catalogue</li>
            </ul>
          </div>
          
          <div>
            <h4 className="font-semibold text-green-300 mb-3">📈 Résultats attendus :</h4>
            <ul className="text-green-200 text-sm space-y-2">
              <li>• <strong>+150% trafic organique</strong> en 6 mois</li>
              <li>• <strong>Top 3 Google</strong> sur vos mots-clés cibles</li>
              <li>• <strong>+40% conversions</strong> depuis le blog</li>
              <li>• <strong>Authority domain</strong> renforcée</li>
              <li>• <strong>Backlinks naturels</strong> augmentés</li>
            </ul>
          </div>
        </div>
        
        <div className="mt-6">
          <button
            onClick={generateBlogPost}
            disabled={isGenerating}
            className="bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 disabled:from-gray-600 disabled:to-gray-700 text-white px-8 py-4 rounded-xl font-bold transition-all flex items-center gap-3"
          >
            {isGenerating ? (
              <>
                <div className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Génération IA en cours...
              </>
            ) : (
              <>
                <Brain className="w-6 h-6" />
                Générer article SEO automatique
              </>
            )}
          </button>
        </div>
      </div>

      {/* Opportunités SEO */}
      <div className="bg-white/10 backdrop-blur-xl rounded-2xl p-8 border border-white/20">
        <h3 className="text-xl font-bold text-white mb-6">Opportunités SEO détectées</h3>
        
        <div className="space-y-4">
          {seoKeywords.map((keyword, index) => (
            <div key={index} className="bg-black/20 rounded-xl p-4 border border-white/10">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <h4 className="font-semibold text-white mb-2">{keyword.keyword}</h4>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                    <div>
                      <span className="text-gray-400">Volume :</span>
                      <span className="text-blue-400 font-bold ml-2">{keyword.volume.toLocaleString()}/mois</span>
                    </div>
                    <div>
                      <span className="text-gray-400">Difficulté :</span>
                      <span className={`font-bold ml-2 ${keyword.difficulty >= 70 ? 'text-red-400' : keyword.difficulty >= 50 ? 'text-yellow-400' : 'text-green-400'}`}>
                        {keyword.difficulty}/100
                      </span>
                    </div>
                    <div>
                      <span className="text-gray-400">Opportunité :</span>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ml-2 ${getOpportunityColor(keyword.opportunity)}`}>
                        {keyword.opportunity}/100
                      </span>
                    </div>
                    {keyword.current_rank && (
                      <div>
                        <span className="text-gray-400">Position :</span>
                        <span className="text-purple-400 font-bold ml-2">#{keyword.current_rank}</span>
                      </div>
                    )}
                  </div>
                </div>
                
                <button
                  onClick={() => {
                    showInfo('Article en préparation', `Article sur "${keyword.keyword}" ajouté à la file de génération !`);
                  }}
                  className="bg-cyan-600 hover:bg-cyan-700 text-white px-4 py-2 rounded-xl transition-all flex items-center gap-2"
                >
                  <Plus className="w-4 h-4" />
                  Créer article
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Liste des articles */}
      <div className="bg-white/10 backdrop-blur-xl rounded-2xl p-8 border border-white/20">
        <h3 className="text-xl font-bold text-white mb-6">Articles du blog</h3>
        
        <div className="space-y-4">
          {blogPosts.map((post) => (
            <div key={post.id} className="bg-black/20 rounded-xl p-6 border border-white/10">
              <div className="flex items-start gap-4">
                <div className="w-20 h-20 rounded-xl overflow-hidden bg-gray-600 flex-shrink-0">
                  <img 
                    src={post.featured_image} 
                    alt={post.title}
                    className="w-full h-full object-cover"
                  />
                </div>
                
                <div className="flex-1">
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <h4 className="font-semibold text-white text-lg mb-2">{post.title}</h4>
                      <p className="text-gray-300 text-sm mb-3">{post.excerpt}</p>
                      
                      <div className="flex items-center gap-4 text-sm">
                        <span className={`px-3 py-1 rounded-full font-medium ${getStatusColor(post.status)}`}>
                          {post.status}
                        </span>
                        <span className="text-gray-400">
                          SEO: <span className={`font-bold ${getSEOScoreColor(post.seo_score)}`}>{post.seo_score}/100</span>
                        </span>
                        {post.views > 0 && (
                          <span className="text-gray-400">
                            {post.views.toLocaleString()} vues
                          </span>
                        )}
                      </div>
                    </div>
                    
                    <div className="flex gap-2">
                      <button className="p-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-all">
                        <Eye className="w-4 h-4" />
                      </button>
                      <button className="p-2 bg-yellow-600 hover:bg-yellow-700 text-white rounded-lg transition-all">
                        <Edit className="w-4 h-4" />
                      </button>
                      <button className="p-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-all">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                  
                  <div className="flex flex-wrap gap-2">
                    {post.target_keywords.slice(0, 3).map((keyword, index) => (
                      <span key={index} className="bg-purple-500/20 text-purple-300 px-2 py-1 rounded-full text-xs">
                        {keyword}
                      </span>
                    ))}
                    {post.target_keywords.length > 3 && (
                      <span className="text-gray-400 text-xs">+{post.target_keywords.length - 3}</span>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};