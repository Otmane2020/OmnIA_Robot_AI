import React, { useState } from 'react';
import { 
  Bot, Store, Zap, Globe, Users, BarChart3, 
  CheckCircle, ArrowRight, Play, Star, 
  MessageSquare, ShoppingCart, Palette, Brain,
  Smartphone, Monitor, Tablet, User
} from 'lucide-react';
import { Logo } from '../components/Logo';

interface LandingPageProps {
  onGetStarted: () => void;
  onLogin: () => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({ onGetStarted, onLogin }) => {
  const [activeDemo, setActiveDemo] = useState('chat');

  const features = [
    {
      icon: Bot,
      title: 'Assistant IA Expert',
      description: 'Conseils personnalisés mobilier avec intelligence artificielle avancée',
      color: 'from-cyan-500 to-blue-600'
    },
    {
      icon: Store,
      title: 'Multi-Catalogues',
      description: 'Support CSV, XML, API Shopify pour tous vos produits',
      color: 'from-green-500 to-emerald-600'
    },
    {
      icon: MessageSquare,
      title: 'Interaction Vocale',
      description: 'Reconnaissance et synthèse vocale en français',
      color: 'from-purple-500 to-pink-600'
    },
    {
      icon: Globe,
      title: 'Widget Intégrable',
      description: 'Code embed pour vos sites e-commerce',
      color: 'from-orange-500 to-red-600'
    },
    {
      icon: BarChart3,
      title: 'Analytics Avancées',
      description: 'Statistiques conversations et ventes détaillées',
      color: 'from-indigo-500 to-purple-600'
    },
    {
      icon: ShoppingCart,
      title: 'E-commerce Intégré',
      description: 'Connexion directe paniers et commandes',
      color: 'from-teal-500 to-cyan-600'
    }
  ];

  const testimonials = [
    {
      name: 'Marie Dubois',
      company: 'Mobilier Design Paris',
      text: 'OmnIA a transformé notre expérience client. +40% de conversions !',
      rating: 5
    },
    {
      name: 'Jean Martin',
      company: 'Déco Home Lyon',
      text: 'Interface intuitive, clients ravis. ROI positif dès le 1er mois.',
      rating: 5
    },
    {
      name: 'Sophie Laurent',
      company: 'Meubles Contemporains',
      text: 'Support exceptionnel, intégration facile. Je recommande !',
      rating: 5
    }
  ];

  const plans = [
    {
      name: 'Starter',
      price: '29',
      period: '/mois',
      description: 'Parfait pour débuter',
      features: [
        '1000 conversations/mois',
        '500 produits max',
        'Support email',
        'Widget personnalisable',
        'Analytics de base'
      ],
      popular: false,
      color: 'from-gray-600 to-gray-700'
    },
    {
      name: 'Professional',
      price: '79',
      period: '/mois',
      description: 'Le plus populaire',
      features: [
        '5000 conversations/mois',
        'Produits illimités',
        'Support prioritaire',
        'Domaine personnalisé',
        'Analytics avancées',
        'API complète'
      ],
      popular: true,
      color: 'from-cyan-500 to-blue-600'
    },
    {
      name: 'Enterprise',
      price: '199',
      period: '/mois',
      description: 'Pour les grandes enseignes',
      features: [
        'Conversations illimitées',
        'Multi-magasins',
        'Support dédié',
        'White-label',
        'API personnalisée',
        'Formation équipe'
      ],
      popular: false,
      color: 'from-purple-500 to-pink-600'
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-purple-900">
      {/* Background Effects */}
      <div className="absolute inset-0 opacity-20">
        <div className="absolute top-20 left-20 w-72 h-72 bg-cyan-500/30 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-20 right-20 w-96 h-96 bg-purple-500/20 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '2s' }}></div>
        <div className="absolute top-1/2 left-1/2 w-64 h-64 bg-blue-500/20 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '4s' }}></div>
      </div>

      {/* Header */}
      <header className="relative z-10 bg-black/20 backdrop-blur-xl border-b border-white/10">
        <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-6 xl:px-8">
          <div className="flex justify-between items-center py-4 sm:py-6">
            <Logo size="md" />
            
            <nav className="hidden lg:flex space-x-6 xl:space-x-8">
              <a href="/#features" className="text-white hover:text-cyan-300 transition-colors">Fonctionnalités</a>
              <a href="/#pricing" className="text-white hover:text-cyan-300 transition-colors">Tarifs</a>
              <a href="/#testimonials" className="text-white hover:text-cyan-300 transition-colors">Témoignages</a>
              <a href="/chat" className="text-white hover:text-cyan-300 transition-colors">Démo</a>
            </nav>

            <div className="flex items-center space-x-2 sm:space-x-4">
              <button
                onClick={onLogin}
                className="text-white hover:text-cyan-300 transition-colors text-sm sm:text-base"
              >
                Connexion
              </button>
              <button
                onClick={() => window.location.href = '/register'}
                className="bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white px-3 sm:px-6 py-2 rounded-xl font-semibold transition-all shadow-lg hover:shadow-cyan-500/30 text-xs sm:text-sm lg:text-base"
              >
                <span className="hidden sm:inline">Nouveau revendeur ? Créer un compte</span>
                <span className="sm:hidden">Inscription</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative z-10 pt-12 sm:pt-20 pb-16 sm:pb-32">
        <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-6 xl:px-8 text-center">
          <div className="mb-8">
            <span className="inline-flex items-center gap-2 bg-cyan-500/20 text-cyan-300 px-3 sm:px-4 py-2 rounded-full text-xs sm:text-sm font-medium border border-cyan-500/30">
              <Zap className="w-3 h-3 sm:w-4 sm:h-4" />
              Révolutionnez votre vente de mobilier
            </span>
          </div>
          
          <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-bold text-white mb-4 sm:mb-6 px-2 sm:px-0">
            L'Assistant Robot IA
            <span className="block bg-gradient-to-r from-cyan-400 via-blue-400 to-purple-400 bg-clip-text text-transparent">
              OmnIA
            </span>
          </h1>
          
          <p className="text-base sm:text-lg lg:text-xl text-gray-300 mb-8 sm:mb-12 max-w-3xl mx-auto px-4 sm:px-0">
            Transformez votre expérience client avec OmnIA, l'assistant conversationnel intelligent 
            qui conseille, recommande et vend vos meubles 24h/24.
          </p>

          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center items-center mb-8 sm:mb-16 px-4 sm:px-0">
            <button
              onClick={onGetStarted}
              className="w-full sm:w-auto bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white px-6 sm:px-8 py-3 sm:py-4 rounded-2xl font-bold text-base sm:text-lg transition-all shadow-2xl hover:shadow-cyan-500/40 hover:scale-105 flex items-center justify-center gap-2"
            >
              <Bot className="w-5 h-5 sm:w-6 sm:h-6" />
              Essai gratuit 14 jours
              <ArrowRight className="w-4 h-4 sm:w-5 sm:h-5" />
            </button>
            
            <button 
              onClick={() => window.location.href = '/chat'}
              className="w-full sm:w-auto flex items-center justify-center gap-2 text-white hover:text-cyan-300 transition-colors text-base sm:text-lg"
            >
              <Play className="w-4 h-4 sm:w-5 sm:h-5" />
              Voir la démo (2 min)
            </button>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6 lg:gap-8 max-w-4xl mx-auto px-4 sm:px-0">
            <div className="text-center">
              <div className="text-2xl sm:text-3xl font-bold text-cyan-400">+40%</div>
              <div className="text-gray-400 text-sm sm:text-base">Conversions</div>
            </div>
            <div className="text-center">
              <div className="text-2xl sm:text-3xl font-bold text-green-400">24/7</div>
              <div className="text-gray-400 text-sm sm:text-base">Disponibilité</div>
            </div>
            <div className="text-center">
              <div className="text-2xl sm:text-3xl font-bold text-purple-400">500+</div>
              <div className="text-gray-400 text-sm sm:text-base">Revendeurs</div>
            </div>
            <div className="text-center">
              <div className="text-2xl sm:text-3xl font-bold text-orange-400">98%</div>
              <div className="text-gray-400 text-sm sm:text-base">Satisfaction</div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="relative z-10 py-20 bg-black/20 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-6 xl:px-8">
          <div className="text-center mb-16">
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-white mb-4 px-4 sm:px-0">
              Fonctionnalités Avancées
            </h2>
            <p className="text-base sm:text-lg lg:text-xl text-gray-300 max-w-2xl mx-auto px-4 sm:px-0">
              Une plateforme complète pour révolutionner votre vente de mobilier
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8 px-4 sm:px-0">
            {features.map((feature, index) => {
              const Icon = feature.icon;
              return (
                <div
                  key={index}
                  className="bg-white/10 backdrop-blur-xl rounded-2xl p-6 sm:p-8 border border-white/20 hover:border-cyan-500/50 transition-all hover:scale-105 group"
                >
                  <div className={`w-12 h-12 sm:w-16 sm:h-16 bg-gradient-to-r ${feature.color} rounded-2xl flex items-center justify-center mb-4 sm:mb-6 group-hover:scale-110 transition-transform`}>
                    <Icon className="w-6 h-6 sm:w-8 sm:h-8 text-white" />
                  </div>
                  <h3 className="text-lg sm:text-xl font-bold text-white mb-3 sm:mb-4">{feature.title}</h3>
                  <p className="text-gray-300 text-sm sm:text-base">{feature.description}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Demo Section */}
      <section id="demo" className="relative z-10 py-20">
        <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-6 xl:px-8">
          <div className="text-center mb-16">
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-white mb-4 px-4 sm:px-0">
              Découvrez OmnIA en Action
            </h2>
            <p className="text-base sm:text-lg lg:text-xl text-gray-300 px-4 sm:px-0">
              Interface responsive sur tous les appareils
            </p>
          </div>

          <div className="flex justify-center mb-8">
            <div className="bg-black/40 backdrop-blur-xl rounded-2xl p-1 sm:p-2 border border-white/20 mx-4 sm:mx-0">
              <div className="flex space-x-1 sm:space-x-2">
                <button
                  onClick={() => setActiveDemo('chat')}
                  className={`flex items-center gap-1 sm:gap-2 px-2 sm:px-4 py-2 rounded-xl transition-all text-xs sm:text-sm ${
                    activeDemo === 'chat'
                      ? 'bg-cyan-500 text-white'
                      : 'text-gray-400 hover:text-white'
                  }`}
                >
                  <MessageSquare className="w-3 h-3 sm:w-4 sm:h-4" />
                  <span className="hidden sm:inline">Chat IA</span>
                  <span className="sm:hidden">Chat</span>
                </button>
                <button
                  onClick={() => setActiveDemo('mobile')}
                  className={`flex items-center gap-1 sm:gap-2 px-2 sm:px-4 py-2 rounded-xl transition-all text-xs sm:text-sm ${
                    activeDemo === 'mobile'
                      ? 'bg-cyan-500 text-white'
                      : 'text-gray-400 hover:text-white'
                  }`}
                >
                  <Smartphone className="w-3 h-3 sm:w-4 sm:h-4" />
                  Mobile
                </button>
                <button
                  onClick={() => setActiveDemo('admin')}
                  className={`flex items-center gap-1 sm:gap-2 px-2 sm:px-4 py-2 rounded-xl transition-all text-xs sm:text-sm ${
                    activeDemo === 'admin'
                      ? 'bg-cyan-500 text-white'
                      : 'text-gray-400 hover:text-white'
                  }`}
                >
                  <Monitor className="w-3 h-3 sm:w-4 sm:h-4" />
                  Admin
                </button>
              </div>
            </div>
          </div>

          <div className="bg-white/10 backdrop-blur-xl rounded-3xl p-4 sm:p-8 border border-white/20 mx-4 sm:mx-0">
            <div className="aspect-video bg-gradient-to-br from-slate-800 to-slate-900 rounded-2xl flex items-center justify-center">
              {activeDemo === 'chat' && (
                <div className="w-full h-full bg-gradient-to-br from-slate-900 via-blue-900 to-purple-900 rounded-2xl overflow-hidden relative">
                  {/* Interface Chat OmnIA en action */}
                  <div className="w-full h-full flex flex-col">
                    {/* Header Chat */}
                    <div className="bg-slate-800/90 backdrop-blur-xl border-b border-slate-700/50 p-3 flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-xl flex items-center justify-center">
                          <Bot className="w-4 h-4 text-white" />
                        </div>
                        <div>
                          <h3 className="text-white font-bold text-sm">OmnIA</h3>
                          <p className="text-cyan-300 text-xs">Commercial Mobilier IA</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-1">
                        <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                        <span className="text-green-300 text-xs">En ligne</span>
                      </div>
                    </div>
                    
                    {/* Messages Area */}
                    <div className="flex-1 p-4 space-y-4 overflow-hidden">
                      {/* Message OmnIA */}
                      <div className="flex gap-3">
                        <div className="w-8 h-8 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-full flex items-center justify-center flex-shrink-0">
                          <Bot className="w-4 h-4 text-white" />
                        </div>
                        <div className="bg-black/60 backdrop-blur-xl rounded-2xl p-3 max-w-xs">
                          <p className="text-white text-sm">Bienvenue sur OmnIA ! 🤖 Je suis votre Robot Designer spécialisé en mobilier.</p>
                        </div>
                      </div>
                      
                      {/* Message Utilisateur */}
                      <div className="flex gap-3 justify-end">
                        <div className="bg-gradient-to-r from-cyan-500 to-blue-600 rounded-2xl p-3 max-w-xs">
                          <p className="text-white text-sm">Quelles sont les tendances tables 2025 ?</p>
                        </div>
                        <div className="w-8 h-8 bg-gradient-to-br from-slate-600 to-slate-800 rounded-full flex items-center justify-center flex-shrink-0">
                          <User className="w-4 h-4 text-white" />
                        </div>
                      </div>
                      
                      {/* Réponse OmnIA avec produits */}
                      <div className="flex gap-3">
                        <div className="w-8 h-8 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-full flex items-center justify-center flex-shrink-0">
                          <Bot className="w-4 h-4 text-white" />
                        </div>
                        <div className="bg-black/60 backdrop-blur-xl rounded-2xl p-3 max-w-sm">
                          <p className="text-white text-sm mb-3">🎨 **Tendances 2025** : Matériaux naturels (travertin, marbre), formes organiques, tons terreux !</p>
                          
                          {/* Mini carte produit */}
                          <div className="bg-white/10 rounded-xl p-3 border border-cyan-500/30">
                            <div className="flex gap-2">
                              <div className="w-12 h-12 bg-gray-600 rounded-lg flex-shrink-0 bg-cover bg-center" style={{backgroundImage: 'url(https://images.pexels.com/photos/1571460/pexels-photo-1571460.jpeg?auto=compress&cs=tinysrgb&w=100&h=100&fit=crop)'}}></div>
                              <div className="flex-1 min-w-0">
                                <h4 className="text-white font-semibold text-xs mb-1">Table AUREA</h4>
                                <p className="text-cyan-400 font-bold text-sm">499€</p>
                                <div className="flex gap-1 mt-1">
                                  <button className="bg-green-500/30 text-green-300 px-2 py-1 rounded text-xs">Ajouter</button>
                                  <button className="bg-blue-500/30 text-blue-300 px-2 py-1 rounded text-xs">Voir</button>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    {/* Input Area */}
                    <div className="bg-slate-800/90 border-t border-slate-700/50 p-3">
                      <div className="flex gap-2">
                        <div className="flex-1 bg-slate-700/50 rounded-xl px-3 py-2 text-gray-400 text-sm">
                          Tapez votre message...
                        </div>
                        <button className="bg-gradient-to-r from-cyan-500 to-blue-600 p-2 rounded-xl">
                          <ArrowRight className="w-4 h-4 text-white" />
                        </button>
                      </div>
                    </div>
                  </div>
                  
                  <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent flex items-end p-4 pointer-events-none">
                    <div className="text-white">
                      <h3 className="font-bold text-lg mb-1">Chat IA OmnIA</h3>
                      <p className="text-cyan-300 text-sm">Conseils experts et produits personnalisés</p>
                    </div>
                  </div>
                </div>
              )}
              
              {activeDemo === 'mobile' && (
                <div className="w-full h-full bg-gradient-to-br from-slate-900 via-blue-900 to-purple-900 rounded-2xl overflow-hidden relative">
                  {/* Interface mobile OmnIA */}
                  <div className="w-full h-full flex justify-center items-center">
                    <div className="w-64 h-full bg-black/80 rounded-2xl overflow-hidden border border-slate-600">
                      {/* Mobile Header */}
                      <div className="bg-slate-800 p-3 flex items-center gap-2">
                        <div className="w-6 h-6 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-lg flex items-center justify-center">
                          <Bot className="w-3 h-3 text-white" />
                        </div>
                        <div>
                          <h4 className="text-white font-bold text-xs">OmnIA</h4>
                          <p className="text-cyan-300 text-xs">Robot IA</p>
                        </div>
                        <div className="ml-auto flex items-center gap-1">
                          <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                          <span className="text-green-300 text-xs">En ligne</span>
                        </div>
                      </div>
                      
                      {/* Mobile Messages */}
                      <div className="p-3 space-y-3 h-80 overflow-hidden">
                        <div className="flex gap-2">
                          <div className="w-6 h-6 bg-cyan-500 rounded-full flex items-center justify-center">
                            <Bot className="w-3 h-3 text-white" />
                          </div>
                          <div className="bg-black/60 rounded-xl p-2 max-w-40">
                            <p className="text-white text-xs">Bienvenue ! Je suis OmnIA 🤖 Que cherchez-vous ?</p>
                          </div>
                        </div>
                        
                        <div className="flex gap-2 justify-end">
                          <div className="bg-cyan-500 rounded-xl p-2 max-w-32">
                            <p className="text-white text-xs">Canapé moderne salon</p>
                          </div>
                          <div className="w-6 h-6 bg-slate-600 rounded-full flex items-center justify-center">
                            <User className="w-3 h-3 text-white" />
                          </div>
                        </div>
                        
                        <div className="flex gap-2">
                          <div className="w-6 h-6 bg-cyan-500 rounded-full flex items-center justify-center">
                            <Bot className="w-3 h-3 text-white" />
                          </div>
                          <div className="bg-black/60 rounded-xl p-2 max-w-40">
                            <p className="text-white text-xs">Notre ALYANA convertible est parfait ! 799€</p>
                            <div className="bg-white/10 rounded-lg p-2 mt-2">
                              <div className="flex gap-2">
                                <div className="w-6 h-6 bg-gray-600 rounded bg-cover bg-center" style={{backgroundImage: 'url(https://images.pexels.com/photos/1350789/pexels-photo-1350789.jpeg?auto=compress&cs=tinysrgb&w=50&h=50&fit=crop)'}}></div>
                                <div>
                                  <p className="text-white text-xs font-bold">ALYANA</p>
                                  <p className="text-cyan-400 text-xs">799€</p>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                      
                      {/* Mobile Input */}
                      <div className="bg-slate-800 p-2">
                        <div className="flex gap-1">
                          <div className="flex-1 bg-slate-700 rounded-lg px-2 py-1">
                            <span className="text-gray-400 text-xs">Message...</span>
                          </div>
                          <button className="bg-cyan-500 p-1 rounded-lg">
                            <ArrowRight className="w-3 h-3 text-white" />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent flex items-end p-4 pointer-events-none">
                    <div className="text-white">
                      <h3 className="font-bold text-lg mb-1">Version Mobile</h3>
                      <p className="text-cyan-300 text-sm">Chat OmnIA responsive</p>
                    </div>
                  </div>
                </div>
              )}
              
              {activeDemo === 'admin' && (
                <div className="w-full h-full bg-gradient-to-br from-slate-900 via-blue-900 to-purple-900 rounded-2xl overflow-hidden relative">
                  {/* Interface Admin */}
                  <div className="w-full h-full flex">
                    {/* Sidebar Admin */}
                    <div className="w-1/4 bg-slate-800/90 border-r border-slate-700/50 p-3">
                      <div className="flex items-center gap-2 mb-4">
                        <div className="w-6 h-6 bg-cyan-500 rounded-lg flex items-center justify-center">
                          <Bot className="w-3 h-3 text-white" />
                        </div>
                        <div>
                          <h4 className="text-white font-bold text-xs">OmnIA Admin</h4>
                          <p className="text-cyan-300 text-xs">Decora Home</p>
                        </div>
                      </div>
                      <nav className="space-y-1">
                        <div className="bg-cyan-500/30 text-cyan-300 px-2 py-1 rounded text-xs">📊 Dashboard</div>
                        <div className="text-gray-400 px-2 py-1 text-xs">📦 Catalogue</div>
                        <div className="text-gray-400 px-2 py-1 text-xs">🤖 Robot</div>
                        <div className="text-gray-400 px-2 py-1 text-xs">💳 Abonnement</div>
                      </nav>
                    </div>
                    
                    {/* Main Content */}
                    <div className="flex-1 p-4">
                      <h3 className="text-white font-bold mb-3 text-sm">Tableau de bord</h3>
                      
                      {/* Stats Cards */}
                      <div className="grid grid-cols-2 gap-2 mb-4">
                        <div className="bg-blue-600/20 rounded-lg p-2 text-center">
                          <div className="text-white font-bold text-lg">1,234</div>
                          <div className="text-blue-300 text-xs">Conversations</div>
                        </div>
                        <div className="bg-green-600/20 rounded-lg p-2 text-center">
                          <div className="text-white font-bold text-lg">42%</div>
                          <div className="text-green-300 text-xs">Conversions</div>
                        </div>
                        <div className="bg-purple-600/20 rounded-lg p-2 text-center">
                          <div className="text-white font-bold text-lg">247</div>
                          <div className="text-purple-300 text-xs">Produits</div>
                        </div>
                        <div className="bg-orange-600/20 rounded-lg p-2 text-center">
                          <div className="text-white font-bold text-lg">€2.4k</div>
                          <div className="text-orange-300 text-xs">Revenus</div>
                        </div>
                      </div>
                      
                      {/* Chart Area */}
                      <div className="bg-black/20 rounded-lg p-3">
                        <h4 className="text-white text-xs mb-2">Analytics</h4>
                        <div className="flex items-end gap-1 h-16">
                          {[40, 60, 35, 80, 55, 70, 45].map((height, i) => (
                            <div key={i} className="flex-1 bg-cyan-500/50 rounded-t" style={{ height: `${height}%` }}></div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent flex items-end p-4 pointer-events-none">
                    <div className="text-white">
                      <h3 className="font-bold text-lg mb-1">Dashboard Admin</h3>
                      <p className="text-cyan-300 text-sm">Gestion complète et analytics</p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="relative z-10 py-20 bg-black/20 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-6 xl:px-8">
          <div className="text-center mb-16">
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-white mb-4 px-4 sm:px-0">
              Tarifs Transparents
            </h2>
            <p className="text-base sm:text-lg lg:text-xl text-gray-300 px-4 sm:px-0">
              14 jours d'essai gratuit • Aucun engagement
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8 px-4 sm:px-0">
            {plans.map((plan, index) => (
              <div
                key={index}
                className={`bg-white/10 backdrop-blur-xl rounded-2xl p-6 sm:p-8 border transition-all hover:scale-105 relative ${
                  plan.popular
                    ? 'border-cyan-500 shadow-2xl shadow-cyan-500/20'
                    : 'border-white/20'
                }`}
              >
                {plan.popular && (
                  <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                    <span className="bg-gradient-to-r from-cyan-500 to-blue-600 text-white px-4 py-1 rounded-full text-sm font-bold">
                      POPULAIRE
                    </span>
                  </div>
                )}
                
                <div className="text-center mb-6 sm:mb-8">
                  <h3 className="text-xl sm:text-2xl font-bold text-white mb-2">{plan.name}</h3>
                  <p className="text-gray-400 mb-4 text-sm sm:text-base">{plan.description}</p>
                  <div className="flex items-baseline justify-center">
                    <span className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white">€{plan.price}</span>
                    <span className="text-gray-400 ml-2 text-sm sm:text-base">{plan.period}</span>
                  </div>
                </div>

                <ul className="space-y-3 sm:space-y-4 mb-6 sm:mb-8">
                  {plan.features.map((feature, featureIndex) => (
                    <li key={featureIndex} className="flex items-center gap-3">
                      <CheckCircle className="w-4 h-4 sm:w-5 sm:h-5 text-green-400 flex-shrink-0" />
                      <span className="text-gray-300 text-sm sm:text-base">{feature}</span>
                    </li>
                  ))}
                </ul>

                <button
                  onClick={onGetStarted}
                  className={`w-full py-3 rounded-xl font-semibold transition-all text-sm sm:text-base ${
                    plan.popular
                      ? 'bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white shadow-lg hover:shadow-cyan-500/30'
                      : 'bg-white/10 hover:bg-white/20 text-white border border-white/20'
                  }`}
                >
                  Commencer l'essai gratuit
                </button>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section id="testimonials" className="relative z-10 py-20">
        <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-6 xl:px-8">
          <div className="text-center mb-16">
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-white mb-4 px-4 sm:px-0">
              Ils nous font confiance
            </h2>
            <p className="text-base sm:text-lg lg:text-xl text-gray-300 px-4 sm:px-0">
              Plus de 500 revendeurs utilisent OmnIA
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8 px-4 sm:px-0">
            {testimonials.map((testimonial, index) => (
              <div
                key={index}
                className="bg-white/10 backdrop-blur-xl rounded-2xl p-6 sm:p-8 border border-white/20 hover:border-cyan-500/50 transition-all"
              >
                <div className="flex items-center gap-1 mb-4">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <Star key={i} className="w-4 h-4 sm:w-5 sm:h-5 text-yellow-400 fill-current" />
                  ))}
                </div>
                <p className="text-gray-300 mb-4 sm:mb-6 italic text-sm sm:text-base">"{testimonial.text}"</p>
                <div>
                  <div className="font-semibold text-white text-sm sm:text-base">{testimonial.name}</div>
                  <div className="text-cyan-400 text-xs sm:text-sm">{testimonial.company}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="relative z-10 py-20 bg-gradient-to-r from-cyan-500/20 to-blue-600/20 backdrop-blur-xl">
        <div className="max-w-4xl mx-auto px-3 sm:px-4 lg:px-6 xl:px-8 text-center">
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-white mb-4 sm:mb-6 px-4 sm:px-0">
            Prêt à révolutionner votre vente de mobilier ?
          </h2>
          <p className="text-base sm:text-lg lg:text-xl text-gray-300 mb-6 sm:mb-8 px-4 sm:px-0">
            Rejoignez les 500+ revendeurs qui ont choisi OmnIA
          </p>
          <button
            onClick={onGetStarted}
            className="w-full sm:w-auto bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white px-8 sm:px-12 py-3 sm:py-4 rounded-2xl font-bold text-lg sm:text-xl transition-all shadow-2xl hover:shadow-cyan-500/40 hover:scale-105 flex items-center justify-center gap-2 sm:gap-3 mx-auto"
          >
            <Bot className="w-6 h-6 sm:w-8 sm:h-8" />
            Commencer maintenant
            <ArrowRight className="w-5 h-5 sm:w-6 sm:h-6" />
          </button>
        </div>
      </section>

      {/* Footer */}
      <footer className="relative z-10 bg-black/40 backdrop-blur-xl border-t border-white/10 py-12">
        <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-6 xl:px-8">
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6 sm:gap-8">
            <div>
              <Logo size="sm" />
              <p className="text-gray-400 mt-4 text-sm sm:text-base">
                La plateforme IA pour revendeurs de mobilier
              </p>
            </div>
            
            <div>
              <h3 className="text-white font-semibold mb-3 sm:mb-4 text-sm sm:text-base">Produit</h3>
              <ul className="space-y-1 sm:space-y-2 text-gray-400 text-sm sm:text-base">
                <li><a href="/documentation" className="hover:text-white transition-colors">Documentation</a></li>
                <li><a href="/guides" className="hover:text-white transition-colors">Guides</a></li>
                <li><a href="/chat" className="hover:text-white transition-colors">Démo</a></li>
                <li><a href="/admin" className="hover:text-white transition-colors">Interface Admin</a></li>
              </ul>
            </div>
            
            <div>
              <h3 className="text-white font-semibold mb-3 sm:mb-4 text-sm sm:text-base">Support</h3>
              <ul className="space-y-1 sm:space-y-2 text-gray-400 text-sm sm:text-base">
                <li><a href="/documentation" className="hover:text-white transition-colors">Documentation</a></li>
                <li><a href="/guides" className="hover:text-white transition-colors">Guides</a></li>
                <li><a href="/contact" className="hover:text-white transition-colors">Contact</a></li>
                <li><a href="/support" className="hover:text-white transition-colors">Support</a></li>
              </ul>
            </div>
            
            <div>
              <h3 className="text-white font-semibold mb-3 sm:mb-4 text-sm sm:text-base">Entreprise</h3>
              <ul className="space-y-1 sm:space-y-2 text-gray-400 text-sm sm:text-base">
                <li><a href="/about" className="hover:text-white transition-colors">À propos</a></li>
                <li><a href="/partnerships" className="hover:text-white transition-colors">Partenariats</a></li>
                <li><a href="/admin" className="hover:text-white transition-colors">Espace Revendeur</a></li>
                <li><a href="/press" className="hover:text-white transition-colors">Presse</a></li>
              </ul>
            </div>
            
            <div>
              <h3 className="text-white font-semibold mb-3 sm:mb-4 text-sm sm:text-base">Légal</h3>
              <ul className="space-y-1 sm:space-y-2 text-gray-400 text-sm sm:text-base">
                <li><a href="/contact" className="hover:text-white transition-colors">Contact</a></li>
                <li><a href="/support" className="hover:text-white transition-colors">Support</a></li>
              </ul>
            </div>
          </div>
          
          <div className="border-t border-white/10 mt-12 pt-8 text-center text-gray-400">
            <p className="text-sm sm:text-base">&copy; 2025 OmnIA.sale. Tous droits réservés.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};