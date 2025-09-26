import React from 'react';
import { Mail, Phone, MessageCircle, Clock, CheckCircle, AlertCircle, HelpCircle, ArrowLeft } from 'lucide-react';

export const Support: React.FC = () => {
  const supportChannels = [
    {
      icon: Mail,
      title: 'Email Support',
      description: 'Réponse sous 24h',
      contact: 'support@omnia.sale',
      action: 'mailto:support@omnia.sale',
      color: 'from-blue-500 to-cyan-600'
    },
    {
      icon: Phone,
      title: 'Support Téléphonique',
      description: 'Lun-Ven 9h-18h',
      contact: '+33 1 84 88 32 45',
      action: 'tel:+33184883245',
      color: 'from-green-500 to-emerald-600'
    },
    {
      icon: MessageCircle,
      title: 'Chat en Direct',
      description: 'Réponse immédiate',
      contact: 'Démarrer le chat',
      action: '/chat',
      color: 'from-purple-500 to-pink-600'
    }
  ];

  const faqItems = [
    {
      question: 'Comment intégrer OmnIA sur mon site ?',
      answer: 'Copiez le code widget fourni dans votre interface admin et collez-le sur votre site. L\'intégration prend moins de 5 minutes.',
      category: 'Intégration'
    },
    {
      question: 'Puis-je personnaliser l\'apparence d\'OmnIA ?',
      answer: 'Oui, vous pouvez personnaliser les couleurs, le logo, les messages et la personnalité de votre assistant depuis l\'interface admin.',
      category: 'Personnalisation'
    },
    {
      question: 'Comment importer mon catalogue produits ?',
      answer: 'Trois méthodes : upload CSV, connexion API Shopify, ou feed XML. Le format CSV est recommandé pour débuter.',
      category: 'Catalogue'
    },
    {
      question: 'Quels sont les formats de fichiers supportés ?',
      answer: 'CSV (recommandé), XML, et API Shopify. Nous supportons aussi les feeds produits automatiques.',
      category: 'Catalogue'
    },
    {
      question: 'Comment fonctionne la facturation ?',
      answer: 'Facturation mensuelle automatique. 14 jours d\'essai gratuit, puis prélèvement selon votre plan choisi.',
      category: 'Facturation'
    },
    {
      question: 'Puis-je changer de plan à tout moment ?',
      answer: 'Oui, upgrade immédiat ou downgrade en fin de cycle. Aucun engagement, résiliation possible à tout moment.',
      category: 'Facturation'
    }
  ];

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
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-xl flex items-center justify-center">
                <span className="text-white font-bold text-lg">O</span>
              </div>
              <div>
                <h1 className="text-xl font-bold text-white">OmnIA</h1>
                <p className="text-cyan-300 text-sm">Support</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <a href="/" className="flex items-center gap-2 text-cyan-400 hover:text-cyan-300 transition-colors">
                <ArrowLeft className="w-4 h-4" />
                Retour à l'accueil
              </a>
            </div>
          </div>
        </div>
      </header>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Hero Section */}
        <div className="text-center mb-16">
          <h1 className="text-4xl md:text-6xl font-bold text-white mb-6">
            Centre d'Aide
            <span className="block bg-gradient-to-r from-cyan-400 via-blue-400 to-purple-400 bg-clip-text text-transparent">
              OmnIA.sale
            </span>
          </h1>
          <p className="text-xl text-gray-300 max-w-3xl mx-auto">
            Trouvez rapidement les réponses à vos questions ou contactez notre équipe d'experts
          </p>
        </div>

        {/* Support Channels */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
          {supportChannels.map((channel, index) => {
            const Icon = channel.icon;
            return (
              <div key={index} className="bg-white/10 backdrop-blur-xl rounded-2xl p-8 border border-white/20 hover:border-cyan-500/50 transition-all hover:scale-105">
                <div className={`w-16 h-16 bg-gradient-to-r ${channel.color} rounded-2xl flex items-center justify-center mb-6`}>
                  <Icon className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-xl font-bold text-white mb-2">{channel.title}</h3>
                <p className="text-gray-300 mb-4">{channel.description}</p>
                <a
                  href={channel.action}
                  className="inline-flex items-center gap-2 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white px-6 py-3 rounded-xl font-semibold transition-all"
                >
                  {channel.contact}
                </a>
              </div>
            );
          })}
        </div>

        {/* FAQ Section */}
        <div className="bg-white/10 backdrop-blur-xl rounded-2xl p-8 border border-white/20">
          <h2 className="text-3xl font-bold text-white mb-8 text-center">Questions Fréquentes</h2>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {faqItems.map((item, index) => (
              <div key={index} className="bg-black/20 rounded-xl p-6 border border-white/10">
                <div className="flex items-start gap-3 mb-4">
                  <HelpCircle className="w-5 h-5 text-cyan-400 mt-1 flex-shrink-0" />
                  <div>
                    <span className="inline-block bg-cyan-500/20 text-cyan-300 px-2 py-1 rounded-full text-xs font-medium mb-2">
                      {item.category}
                    </span>
                    <h3 className="text-lg font-semibold text-white">{item.question}</h3>
                  </div>
                </div>
                <p className="text-gray-300 leading-relaxed">{item.answer}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Status Section */}
        <div className="mt-16 bg-white/10 backdrop-blur-xl rounded-2xl p-8 border border-white/20">
          <h2 className="text-2xl font-bold text-white mb-6 text-center">État des Services</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="flex items-center gap-3 p-4 bg-green-500/20 rounded-xl border border-green-400/30">
              <CheckCircle className="w-6 h-6 text-green-400" />
              <div>
                <div className="font-semibold text-white">API OmnIA</div>
                <div className="text-sm text-green-300">Opérationnel</div>
              </div>
            </div>
            
            <div className="flex items-center gap-3 p-4 bg-green-500/20 rounded-xl border border-green-400/30">
              <CheckCircle className="w-6 h-6 text-green-400" />
              <div>
                <div className="font-semibold text-white">Widgets</div>
                <div className="text-sm text-green-300">Opérationnel</div>
              </div>
            </div>
            
            <div className="flex items-center gap-3 p-4 bg-yellow-500/20 rounded-xl border border-yellow-400/30">
              <AlertCircle className="w-6 h-6 text-yellow-400" />
              <div>
                <div className="font-semibold text-white">Synthèse Vocale</div>
                <div className="text-sm text-yellow-300">Maintenance</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};