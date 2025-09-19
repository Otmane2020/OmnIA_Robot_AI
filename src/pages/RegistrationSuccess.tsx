import React from 'react';
import { CheckCircle, Mail, Clock, ArrowRight, Home } from 'lucide-react';
import { Logo } from '../components/Logo';

export const RegistrationSuccess: React.FC = () => {
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
          <div className="flex items-center justify-between h-16">
            <Logo size="md" />
            <a href="/admin" className="flex items-center gap-2 text-cyan-400 hover:text-cyan-300 transition-colors">
              <ArrowLeft className="w-4 h-4" />
              Interface Admin
            </a>
          </div>
        </div>
      </header>

      <div className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center">
          {/* Success Icon */}
          <div className="w-32 h-32 bg-gradient-to-br from-green-500 to-emerald-600 rounded-full flex items-center justify-center mx-auto mb-8 shadow-2xl">
            <CheckCircle className="w-16 h-16 text-white" />
          </div>

          {/* Title */}
          <h1 className="text-4xl md:text-6xl font-bold text-white mb-6">
            Inscription réussie !
            <span className="block bg-gradient-to-r from-green-400 via-emerald-400 to-cyan-400 bg-clip-text text-transparent">
              Bienvenue sur OmnIA
            </span>
          </h1>

          <p className="text-xl text-gray-300 max-w-3xl mx-auto mb-12">
            Votre compte a été créé avec succès. Notre équipe examine votre dossier.
          </p>

          {/* Steps */}
          <div className="bg-white/10 backdrop-blur-xl rounded-2xl p-8 border border-white/20 mb-12">
            <h2 className="text-2xl font-bold text-white mb-8">Prochaines étapes</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="text-center">
                <div className="w-16 h-16 bg-yellow-500/30 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <Clock className="w-8 h-8 text-yellow-400" />
                </div>
                <h3 className="text-lg font-bold text-white mb-2">1. Validation</h3>
                <p className="text-gray-300 text-sm">
                  Notre équipe examine votre dossier sous 24-48h
                </p>
              </div>
              
              <div className="text-center">
                <div className="w-16 h-16 bg-blue-500/30 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <Mail className="w-8 h-8 text-blue-400" />
                </div>
                <h3 className="text-lg font-bold text-white mb-2">2. Confirmation</h3>
                <p className="text-gray-300 text-sm">
                  Réception de vos identifiants par email
                </p>
              </div>
              
              <div className="text-center">
                <div className="w-16 h-16 bg-green-500/30 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <ArrowRight className="w-8 h-8 text-green-400" />
                </div>
                <h3 className="text-lg font-bold text-white mb-2">3. Configuration</h3>
                <p className="text-gray-300 text-sm">
                  Import de votre catalogue et personnalisation
                </p>
              </div>
            </div>
          </div>

          {/* Contact Info */}
          <div className="bg-gradient-to-r from-cyan-500/20 to-blue-600/20 backdrop-blur-xl rounded-2xl p-8 border border-cyan-400/30">
            <h3 className="text-xl font-bold text-white mb-4">Besoin d'aide ?</h3>
            <p className="text-cyan-300 mb-6">
              Notre équipe est disponible pour vous accompagner
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <a
                href="mailto:support@omnia.sale"
                className="bg-cyan-600 hover:bg-cyan-700 text-white px-6 py-3 rounded-xl font-semibold transition-all flex items-center justify-center gap-2"
              >
                <Mail className="w-4 h-4" />
                support@omnia.sale
              </a>
              <a
                href="/"
                className="bg-white/10 hover:bg-white/20 text-white px-6 py-3 rounded-xl font-semibold transition-all border border-white/20 flex items-center justify-center gap-2"
              >
                <Home className="w-4 h-4" />
                Retour à l'accueil
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};