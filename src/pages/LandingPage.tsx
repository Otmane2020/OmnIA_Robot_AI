import React from 'react';
import { ArrowRight, Bot, Sparkles, Zap, Users, Globe, CheckCircle, Star, Play, ChevronRight } from 'lucide-react';
import { Logo } from '../components/Logo';

interface LandingPageProps {
  onGetStarted: () => void;
  onLogin: () => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({ onGetStarted, onLogin }) => {
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
              <button
                onClick={onLogin}
                className="text-cyan-400 hover:text-cyan-300 transition-colors font-medium"
              >
                Connexion
              </button>
              <button
                onClick={onGetStarted}
                className="bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white px-6 py-3 rounded-xl font-semibold transition-all shadow-lg hover:shadow-cyan-500/30"
              >
                Commencer
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="text-center">
          <h1 className="text-4xl md:text-6xl font-bold text-white mb-6">
            Assistant Robot IA
            <span className="block bg-gradient-to-r from-cyan-400 via-blue-400 to-purple-400 bg-clip-text text-transparent">
              pour Revendeurs Mobilier
            </span>
          </h1>
          <p className="text-xl text-gray-300 max-w-3xl mx-auto mb-8">
            Transformez votre catalogue en assistant intelligent. OmnIA conseille vos clients 24/7 avec expertise mobilier et recommandations personnalisées.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
            <button
              onClick={onGetStarted}
              className="bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white px-8 py-4 rounded-xl font-bold text-lg transition-all shadow-2xl hover:shadow-cyan-500/40 flex items-center justify-center gap-2"
            >
              <Bot className="w-6 h-6" />
              Créer mon Robot IA
              <ArrowRight className="w-5 h-5" />
            </button>
            <button
              onClick={() => window.open('/robot', '_blank')}
              className="bg-white/10 backdrop-blur-xl border border-white/20 text-white px-8 py-4 rounded-xl font-semibold text-lg transition-all hover:bg-white/20 flex items-center justify-center gap-2"
            >
              <Play className="w-5 h-5" />
              Voir la démo
            </button>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-20">
            <div className="bg-white/10 backdrop-blur-xl rounded-2xl p-6 border border-white/20">
              <div className="text-3xl font-bold text-cyan-400 mb-2">1000+</div>
              <div className="text-gray-300">Conversations/jour</div>
            </div>
            <div className="bg-white/10 backdrop-blur-xl rounded-2xl p-6 border border-white/20">
              <div className="text-3xl font-bold text-green-400 mb-2">42%</div>
              <div className="text-gray-300">Taux de conversion</div>
            </div>
            <div className="bg-white/10 backdrop-blur-xl rounded-2xl p-6 border border-white/20">
              <div className="text-3xl font-bold text-purple-400 mb-2">24/7</div>
              <div className="text-gray-300">Disponibilité</div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-5xl font-bold text-white mb-6">
            Pourquoi choisir
            <span className="block bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text text-transparent">
              OmnIA.sale ?
            </span>
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          <div className="bg-white/10 backdrop-blur-xl rounded-2xl p-8 border border-white/20 hover:border-cyan-500/50 transition-all hover:scale-105">
            <div className="w-16 h-16 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-2xl flex items-center justify-center mb-6">
              <Bot className="w-8 h-8 text-white" />
            </div>
            <h3 className="text-xl font-bold text-white mb-4">Assistant IA Expert</h3>
            <p className="text-gray-300">
              Robot conversationnel spécialisé mobilier avec reconnaissance vocale et conseils personnalisés.
            </p>
          </div>

          <div className="bg-white/10 backdrop-blur-xl rounded-2xl p-8 border border-white/20 hover:border-purple-500/50 transition-all hover:scale-105">
            <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-pink-600 rounded-2xl flex items-center justify-center mb-6">
              <Sparkles className="w-8 h-8 text-white" />
            </div>
            <h3 className="text-xl font-bold text-white mb-4">Multi-Catalogues</h3>
            <p className="text-gray-300">
              Support CSV, XML, API Shopify avec synchronisation automatique et enrichissement IA.
            </p>
          </div>

          <div className="bg-white/10 backdrop-blur-xl rounded-2xl p-8 border border-white/20 hover:border-green-500/50 transition-all hover:scale-105">
            <div className="w-16 h-16 bg-gradient-to-br from-green-500 to-emerald-600 rounded-2xl flex items-center justify-center mb-6">
              <Globe className="w-8 h-8 text-white" />
            </div>
            <h3 className="text-xl font-bold text-white mb-4">Widget Intégrable</h3>
            <p className="text-gray-300">
              Code embed simple pour intégrer OmnIA sur votre site e-commerce existant.
            </p>
          </div>

          <div className="bg-white/10 backdrop-blur-xl rounded-2xl p-8 border border-white/20 hover:border-orange-500/50 transition-all hover:scale-105">
            <div className="w-16 h-16 bg-gradient-to-br from-orange-500 to-red-600 rounded-2xl flex items-center justify-center mb-6">
              <Zap className="w-8 h-8 text-white" />
            </div>
            <h3 className="text-xl font-bold text-white mb-4">Interface Admin</h3>
            <p className="text-gray-300">
              Dashboard complet pour gérer catalogue, analytics, conversations et paramètres robot.
            </p>
          </div>

          <div className="bg-white/10 backdrop-blur-xl rounded-2xl p-8 border border-white/20 hover:border-yellow-500/50 transition-all hover:scale-105">
            <div className="w-16 h-16 bg-gradient-to-br from-yellow-500 to-orange-600 rounded-2xl flex items-center justify-center mb-6">
              <Users className="w-8 h-8 text-white" />
            </div>
            <h3 className="text-xl font-bold text-white mb-4">Domaines Personnalisés</h3>
            <p className="text-gray-300">
              Sous-domaines omnia.sale personnalisés pour chaque revendeur avec SSL automatique.
            </p>
          </div>

          <div className="bg-white/10 backdrop-blur-xl rounded-2xl p-8 border border-white/20 hover:border-pink-500/50 transition-all hover:scale-105">
            <div className="w-16 h-16 bg-gradient-to-br from-pink-500 to-purple-600 rounded-2xl flex items-center justify-center mb-6">
              <Star className="w-8 h-8 text-white" />
            </div>
            <h3 className="text-xl font-bold text-white mb-4">Analytics Avancées</h3>
            <p className="text-gray-300">
              Statistiques détaillées : conversations, conversions, produits populaires, ROI.
            </p>
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-5xl font-bold text-white mb-6">
            Tarification Simple
            <span className="block bg-gradient-to-r from-green-400 to-cyan-400 bg-clip-text text-transparent">
              et Transparente
            </span>
          </h2>
          <p className="text-xl text-gray-300">14 jours d'essai gratuit sur tous les plans</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Starter */}
          <div className="bg-white/10 backdrop-blur-xl rounded-2xl p-8 border border-white/20">
            <div className="text-center">
              <h3 className="text-2xl font-bold text-white mb-4">Starter</h3>
              <div className="text-4xl font-bold text-cyan-400 mb-6">€29<span className="text-lg text-gray-400">/mois</span></div>
              <ul className="space-y-3 mb-8">
                <li className="flex items-center gap-2 text-gray-300">
                  <CheckCircle className="w-5 h-5 text-green-400" />
                  1000 conversations/mois
                </li>
                <li className="flex items-center gap-2 text-gray-300">
                  <CheckCircle className="w-5 h-5 text-green-400" />
                  500 produits max
                </li>
                <li className="flex items-center gap-2 text-gray-300">
                  <CheckCircle className="w-5 h-5 text-green-400" />
                  Support email
                </li>
                <li className="flex items-center gap-2 text-gray-300">
                  <CheckCircle className="w-5 h-5 text-green-400" />
                  Widget personnalisable
                </li>
              </ul>
              <button
                onClick={onGetStarted}
                className="w-full bg-gradient-to-r from-gray-600 to-gray-700 hover:from-gray-500 hover:to-gray-600 text-white py-3 rounded-xl font-semibold transition-all"
              >
                Commencer
              </button>
            </div>
          </div>

          {/* Professional */}
          <div className="bg-white/10 backdrop-blur-xl rounded-2xl p-8 border-2 border-cyan-500 relative">
            <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
              <span className="bg-gradient-to-r from-cyan-500 to-blue-600 text-white px-6 py-2 rounded-full text-sm font-bold">
                POPULAIRE
              </span>
            </div>
            <div className="text-center">
              <h3 className="text-2xl font-bold text-white mb-4">Professional</h3>
              <div className="text-4xl font-bold text-cyan-400 mb-6">€79<span className="text-lg text-gray-400">/mois</span></div>
              <ul className="space-y-3 mb-8">
                <li className="flex items-center gap-2 text-gray-300">
                  <CheckCircle className="w-5 h-5 text-green-400" />
                  5000 conversations/mois
                </li>
                <li className="flex items-center gap-2 text-gray-300">
                  <CheckCircle className="w-5 h-5 text-green-400" />
                  Produits illimités
                </li>
                <li className="flex items-center gap-2 text-gray-300">
                  <CheckCircle className="w-5 h-5 text-green-400" />
                  Support prioritaire
                </li>
                <li className="flex items-center gap-2 text-gray-300">
                  <CheckCircle className="w-5 h-5 text-green-400" />
                  Domaine personnalisé
                </li>
                <li className="flex items-center gap-2 text-gray-300">
                  <CheckCircle className="w-5 h-5 text-green-400" />
                  Analytics avancées
                </li>
              </ul>
              <button
                onClick={onGetStarted}
                className="w-full bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white py-3 rounded-xl font-semibold transition-all shadow-lg hover:shadow-cyan-500/30"
              >
                Commencer
              </button>
            </div>
          </div>

          {/* Enterprise */}
          <div className="bg-white/10 backdrop-blur-xl rounded-2xl p-8 border border-white/20">
            <div className="text-center">
              <h3 className="text-2xl font-bold text-white mb-4">Enterprise</h3>
              <div className="text-4xl font-bold text-cyan-400 mb-6">€199<span className="text-lg text-gray-400">/mois</span></div>
              <ul className="space-y-3 mb-8">
                <li className="flex items-center gap-2 text-gray-300">
                  <CheckCircle className="w-5 h-5 text-green-400" />
                  Conversations illimitées
                </li>
                <li className="flex items-center gap-2 text-gray-300">
                  <CheckCircle className="w-5 h-5 text-green-400" />
                  Multi-magasins
                </li>
                <li className="flex items-center gap-2 text-gray-300">
                  <CheckCircle className="w-5 h-5 text-green-400" />
                  Support dédié
                </li>
                <li className="flex items-center gap-2 text-gray-300">
                  <CheckCircle className="w-5 h-5 text-green-400" />
                  White-label
                </li>
                <li className="flex items-center gap-2 text-gray-300">
                  <CheckCircle className="w-5 h-5 text-green-400" />
                  API personnalisée
                </li>
              </ul>
              <button
                onClick={onGetStarted}
                className="w-full bg-gradient-to-r from-purple-500 to-pink-600 hover:from-purple-400 hover:to-pink-500 text-white py-3 rounded-xl font-semibold transition-all shadow-lg hover:shadow-purple-500/30"
              >
                Commencer
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="bg-gradient-to-r from-cyan-500/20 to-blue-600/20 backdrop-blur-xl rounded-3xl p-12 border border-cyan-400/30 text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">
            Prêt à transformer votre business ?
          </h2>
          <p className="text-xl text-gray-300 mb-8 max-w-2xl mx-auto">
            Rejoignez les revendeurs qui ont déjà adopté l'IA pour booster leurs ventes et améliorer l'expérience client.
          </p>
          <button
            onClick={onGetStarted}
            className="bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white px-12 py-4 rounded-xl font-bold text-xl transition-all shadow-2xl hover:shadow-cyan-500/40 flex items-center justify-center gap-3 mx-auto"
          >
            <Bot className="w-6 h-6" />
            Créer mon Assistant IA
            <ChevronRight className="w-6 h-6" />
          </button>
        </div>
      </section>

      {/* Footer */}
      <footer className="relative z-10 bg-black/20 backdrop-blur-xl border-t border-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <Logo size="sm" />
            <div className="flex items-center space-x-6 mt-6 md:mt-0">
              <a href="/about" className="text-gray-400 hover:text-cyan-400 transition-colors">À propos</a>
              <a href="/contact" className="text-gray-400 hover:text-cyan-400 transition-colors">Contact</a>
              <a href="/support" className="text-gray-400 hover:text-cyan-400 transition-colors">Support</a>
              <a href="/documentation" className="text-gray-400 hover:text-cyan-400 transition-colors">Documentation</a>
            </div>
          </div>
          <div className="mt-8 pt-8 border-t border-white/10 text-center">
            <p className="text-gray-400">
              © 2025 OmnIA.sale - Assistant Robot IA pour Revendeurs Mobilier
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};