import React from 'react';
import { Handshake, Building, Globe, TrendingUp, ArrowLeft, CheckCircle, Star, Users } from 'lucide-react';
import { Logo } from '../components/Logo';
import { Logo } from '../components/Logo';

export const Partnerships: React.FC = () => {
  const partnerTypes = [
    {
      icon: Building,
      title: 'Revendeurs Mobilier',
      description: 'Magasins physiques et e-commerce',
      benefits: [
        'Assistant IA personnalisé',
        'Interface admin complète',
        'Support technique dédié',
        'Formation équipe incluse'
      ],
      color: 'from-cyan-500 to-blue-600'
    },
    {
      icon: Globe,
      title: 'Intégrateurs Web',
      description: 'Agences et développeurs',
      benefits: [
        'API complète documentée',
        'SDK JavaScript',
        'Commission sur les ventes',
        'Support technique prioritaire'
      ],
      color: 'from-green-500 to-emerald-600'
    },
    {
      icon: TrendingUp,
      title: 'Distributeurs',
      description: 'Réseaux et franchises',
      benefits: [
        'Licence white-label',
        'Multi-magasins centralisé',
        'Tarifs préférentiels',
        'Accompagnement déploiement'
      ],
      color: 'from-purple-500 to-pink-600'
    }
  ];

  const currentPartners = [
    {
      name: 'Decora Home',
      type: 'Revendeur Premium',
      description: 'Mobilier design contemporain',
      results: '+45% conversions, 1200+ conversations/mois',
      logo: 'https://images.pexels.com/photos/1350789/pexels-photo-1350789.jpeg?auto=compress&cs=tinysrgb&w=100&h=100&fit=crop'
    },
    {
      name: 'Mobilier Design Paris',
      type: 'Franchise',
      description: '12 magasins en Île-de-France',
      results: '€50k+ revenus générés via OmnIA',
      logo: 'https://images.pexels.com/photos/1571460/pexels-photo-1571460.jpeg?auto=compress&cs=tinysrgb&w=100&h=100&fit=crop'
    },
    {
      name: 'WebMobilier Agency',
      type: 'Intégrateur',
      description: 'Agence spécialisée e-commerce mobilier',
      results: '25 intégrations réussies',
      logo: 'https://images.pexels.com/photos/1866149/pexels-photo-1866149.jpeg?auto=compress&cs=tinysrgb&w=100&h=100&fit=crop'
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
            <Logo size="md" />
      </header>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Hero Section */}
        <div className="text-center mb-16">
          <h1 className="text-4xl md:text-6xl font-bold text-white mb-6">
            Partenariats
            <span className="block bg-gradient-to-r from-cyan-400 via-blue-400 to-purple-400 bg-clip-text text-transparent">
              Grandissons ensemble
            </span>
          </h1>
          <p className="text-xl text-gray-300 max-w-3xl mx-auto">
            Rejoignez l'écosystème OmnIA et participez à la révolution de la vente de mobilier
          </p>
        </div>

        {/* Partner Types */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
          {partnerTypes.map((type, index) => {
            const Icon = type.icon;
            return (
              <div key={index} className="bg-white/10 backdrop-blur-xl rounded-2xl p-8 border border-white/20 hover:border-cyan-500/50 transition-all hover:scale-105">
                <div className={`w-16 h-16 bg-gradient-to-r ${type.color} rounded-2xl flex items-center justify-center mb-6`}>
                  <Icon className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-xl font-bold text-white mb-3">{type.title}</h3>
                <p className="text-gray-300 mb-6">{type.description}</p>
                <ul className="space-y-2">
                  {type.benefits.map((benefit, benefitIndex) => (
                    <li key={benefitIndex} className="flex items-center gap-2 text-gray-300">
                      <CheckCircle className="w-4 h-4 text-green-400 flex-shrink-0" />
                      <span className="text-sm">{benefit}</span>
                    </li>
                  ))}
                </ul>
                <button className="w-full mt-6 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white py-3 rounded-xl font-semibold transition-all">
                  Devenir partenaire
                </button>
              </div>
            );
          })}
        </div>

        {/* Current Partners */}
        <div className="bg-white/10 backdrop-blur-xl rounded-2xl p-8 border border-white/20 mb-16">
          <h2 className="text-3xl font-bold text-white text-center mb-12">Nos Partenaires</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {currentPartners.map((partner, index) => (
              <div key={index} className="bg-black/20 rounded-xl p-6 border border-white/10">
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-12 h-12 rounded-xl overflow-hidden">
                    <img 
                      src={partner.logo} 
                      alt={partner.name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div>
                    <h3 className="font-bold text-white">{partner.name}</h3>
                    <p className="text-cyan-400 text-sm">{partner.type}</p>
                  </div>
                </div>
                <p className="text-gray-300 text-sm mb-3">{partner.description}</p>
                <div className="bg-green-500/20 border border-green-400/30 rounded-lg p-3">
                  <p className="text-green-300 text-sm font-medium">{partner.results}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Partnership Benefits */}
        <div className="bg-white/10 backdrop-blur-xl rounded-2xl p-8 border border-white/20 mb-16">
          <h2 className="text-3xl font-bold text-white text-center mb-8">Avantages Partenaires</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="bg-black/20 rounded-xl p-6">
              <h3 className="font-bold text-cyan-300 mb-3">🚀 Croissance Accélérée</h3>
              <ul className="text-gray-300 text-sm space-y-2">
                <li>• +40% de conversions moyennes</li>
                <li>• Réduction du temps de vente</li>
                <li>• Augmentation panier moyen</li>
                <li>• Fidélisation client renforcée</li>
              </ul>
            </div>
            
            <div className="bg-black/20 rounded-xl p-6">
              <h3 className="font-bold text-green-300 mb-3">💰 Modèle Économique</h3>
              <ul className="text-gray-300 text-sm space-y-2">
                <li>• Tarifs préférentiels partenaires</li>
                <li>• Commissions sur recommandations</li>
                <li>• Support marketing inclus</li>
                <li>• ROI positif dès le 1er mois</li>
              </ul>
            </div>
            
            <div className="bg-black/20 rounded-xl p-6">
              <h3 className="font-bold text-purple-300 mb-3">🤝 Accompagnement</h3>
              <ul className="text-gray-300 text-sm space-y-2">
                <li>• Formation équipe complète</li>
                <li>• Support technique dédié</li>
                <li>• Webinaires mensuels</li>
                <li>• Communauté partenaires</li>
              </ul>
            </div>
          </div>
        </div>

        {/* CTA Section */}
        <div className="bg-gradient-to-r from-cyan-500/20 to-blue-600/20 backdrop-blur-xl rounded-3xl p-8 border border-cyan-400/30 text-center">
          <h2 className="text-3xl font-bold text-white mb-4">Intéressé par un partenariat ?</h2>
          <p className="text-xl text-gray-300 mb-8">
            Discutons de votre projet et des opportunités de collaboration
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button
              onClick={() => window.location.href = '/contact'}
              className="bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white px-8 py-4 rounded-2xl font-bold text-lg transition-all shadow-2xl hover:shadow-cyan-500/40"
            >
              Nous contacter
            </button>
            <button
              onClick={() => window.location.href = 'https://seller.omnia.sale/register'}
              className="bg-white/10 hover:bg-white/20 text-white px-8 py-4 rounded-2xl font-bold text-lg transition-all border border-white/20"
            >
              Inscription revendeur
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};