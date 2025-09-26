import React from 'react';
import { Users, Target, Award, Globe, ArrowLeft, Lightbulb, Heart, Zap } from 'lucide-react';

export const About: React.FC = () => {
  const team = [
    {
      name: 'Alexandre Martin',
      role: 'CEO & Fondateur',
      description: 'Expert IA et e-commerce, 15 ans d\'expérience',
      image: 'https://images.pexels.com/photos/2379004/pexels-photo-2379004.jpeg?auto=compress&cs=tinysrgb&w=300&h=300&fit=crop'
    },
    {
      name: 'Sophie Dubois',
      role: 'CTO',
      description: 'Architecte logiciel, spécialiste intelligence artificielle',
      image: 'https://images.pexels.com/photos/3785077/pexels-photo-3785077.jpeg?auto=compress&cs=tinysrgb&w=300&h=300&fit=crop'
    },
    {
      name: 'Thomas Leroy',
      role: 'Head of Design',
      description: 'Designer UX/UI, expert en expérience utilisateur',
      image: 'https://images.pexels.com/photos/2182970/pexels-photo-2182970.jpeg?auto=compress&cs=tinysrgb&w=300&h=300&fit=crop'
    },
    {
      name: 'Marie Rousseau',
      role: 'Customer Success',
      description: 'Accompagnement client, formation et support',
      image: 'https://images.pexels.com/photos/3756679/pexels-photo-3756679.jpeg?auto=compress&cs=tinysrgb&w=300&h=300&fit=crop'
    }
  ];

  const values = [
    {
      icon: Lightbulb,
      title: 'Innovation',
      description: 'Nous repoussons les limites de l\'IA conversationnelle pour créer des expériences client exceptionnelles.',
      color: 'from-yellow-500 to-orange-600'
    },
    {
      icon: Heart,
      title: 'Passion',
      description: 'Notre équipe est passionnée par la transformation digitale du secteur du mobilier.',
      color: 'from-pink-500 to-red-600'
    },
    {
      icon: Zap,
      title: 'Excellence',
      description: 'Nous visons l\'excellence dans chaque interaction, chaque fonctionnalité, chaque détail.',
      color: 'from-purple-500 to-indigo-600'
    },
    {
      icon: Users,
      title: 'Collaboration',
      description: 'Nous travaillons main dans la main avec nos clients pour créer des solutions sur mesure.',
      color: 'from-blue-500 to-cyan-600'
    }
  ];

  const milestones = [
    { year: '2023', title: 'Création d\'OmnIA', description: 'Lancement de la première version' },
    { year: '2024', title: '100+ Revendeurs', description: 'Adoption massive par les professionnels' },
    { year: '2024', title: 'IA Vocale', description: 'Intégration reconnaissance et synthèse vocale' },
    { year: '2025', title: '500+ Clients', description: 'Expansion européenne et nouvelles fonctionnalités' }
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
                <p className="text-cyan-300 text-sm">À propos</p>
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
            À propos d'OmnIA
            <span className="block bg-gradient-to-r from-cyan-400 via-blue-400 to-purple-400 bg-clip-text text-transparent">
              L'avenir de la vente de mobilier
            </span>
          </h1>
          <p className="text-xl text-gray-300 max-w-4xl mx-auto">
            Nous révolutionnons l'expérience d'achat de mobilier en combinant intelligence artificielle, 
            expertise métier et technologie de pointe pour créer des assistants conversationnels exceptionnels.
          </p>
        </div>

        {/* Mission Section */}
        <div className="bg-white/10 backdrop-blur-xl rounded-2xl p-8 border border-white/20 mb-16">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
            <div>
              <h2 className="text-3xl font-bold text-white mb-6">Notre Mission</h2>
              <p className="text-gray-300 text-lg leading-relaxed mb-6">
                Démocratiser l'intelligence artificielle pour les revendeurs de mobilier en créant 
                des assistants conversationnels qui comprennent vraiment les besoins des clients 
                et transforment chaque interaction en opportunité de vente.
              </p>
              <div className="flex items-center gap-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-cyan-400">500+</div>
                  <div className="text-gray-400 text-sm">Revendeurs</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-400">98%</div>
                  <div className="text-gray-400 text-sm">Satisfaction</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-purple-400">+40%</div>
                  <div className="text-gray-400 text-sm">Conversions</div>
                </div>
              </div>
            </div>
            <div className="relative">
              <div className="w-full h-64 bg-gradient-to-br from-cyan-500/20 to-blue-600/20 rounded-2xl flex items-center justify-center">
                <div className="text-center">
                  <div className="w-24 h-24 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Target className="w-12 h-12 text-white" />
                  </div>
                  <h3 className="text-xl font-bold text-white">Vision 2025</h3>
                  <p className="text-cyan-300">Leader européen de l'IA mobilier</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Values Section */}
        <div className="mb-16">
          <h2 className="text-3xl font-bold text-white text-center mb-12">Nos Valeurs</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {values.map((value, index) => {
              const Icon = value.icon;
              return (
                <div key={index} className="bg-white/10 backdrop-blur-xl rounded-2xl p-6 border border-white/20 hover:border-cyan-500/50 transition-all hover:scale-105 text-center">
                  <div className={`w-16 h-16 bg-gradient-to-r ${value.color} rounded-2xl flex items-center justify-center mx-auto mb-4`}>
                    <Icon className="w-8 h-8 text-white" />
                  </div>
                  <h3 className="text-xl font-bold text-white mb-3">{value.title}</h3>
                  <p className="text-gray-300">{value.description}</p>
                </div>
              );
            })}
          </div>
        </div>

        {/* Timeline */}
        <div className="bg-white/10 backdrop-blur-xl rounded-2xl p-8 border border-white/20 mb-16">
          <h2 className="text-3xl font-bold text-white text-center mb-12">Notre Histoire</h2>
          <div className="space-y-8">
            {milestones.map((milestone, index) => (
              <div key={index} className="flex items-center gap-6">
                <div className="w-16 h-16 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-full flex items-center justify-center flex-shrink-0">
                  <span className="text-white font-bold">{milestone.year}</span>
                </div>
                <div className="flex-1">
                  <h3 className="text-xl font-bold text-white mb-2">{milestone.title}</h3>
                  <p className="text-gray-300">{milestone.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Team Section */}
        <div className="mb-16">
          <h2 className="text-3xl font-bold text-white text-center mb-12">Notre Équipe</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {team.map((member, index) => (
              <div key={index} className="bg-white/10 backdrop-blur-xl rounded-2xl p-6 border border-white/20 hover:border-cyan-500/50 transition-all hover:scale-105 text-center">
                <div className="w-24 h-24 rounded-full overflow-hidden mx-auto mb-4 border-4 border-cyan-500/30">
                  <img 
                    src={member.image} 
                    alt={member.name}
                    className="w-full h-full object-cover"
                  />
                </div>
                <h3 className="text-lg font-bold text-white mb-1">{member.name}</h3>
                <p className="text-cyan-400 font-medium mb-3">{member.role}</p>
                <p className="text-gray-300 text-sm">{member.description}</p>
              </div>
            ))}
          </div>
        </div>

        {/* CTA Section */}
        <div className="bg-gradient-to-r from-cyan-500/20 to-blue-600/20 backdrop-blur-xl rounded-3xl p-8 border border-cyan-400/30 text-center">
          <h2 className="text-3xl font-bold text-white mb-4">Rejoignez l'aventure OmnIA</h2>
          <p className="text-xl text-gray-300 mb-8">
            Transformez votre business avec l'intelligence artificielle
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button
              onClick={() => window.location.href = 'https://seller.omnia.sale/register'}
              className="bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white px-8 py-4 rounded-2xl font-bold text-lg transition-all shadow-2xl hover:shadow-cyan-500/40"
            >
              Devenir revendeur
            </button>
            <button
              onClick={() => window.location.href = '/contact'}
              className="bg-white/10 hover:bg-white/20 text-white px-8 py-4 rounded-2xl font-bold text-lg transition-all border border-white/20"
            >
              Nous contacter
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};