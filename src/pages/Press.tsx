import React from 'react';
import { Newspaper, Download, ExternalLink, ArrowLeft, Calendar, Award, Users } from 'lucide-react';
import { Logo } from '../components/Logo';
import { Logo } from '../components/Logo';

export const Press: React.FC = () => {
  const pressReleases = [
    {
      date: '15 Janvier 2025',
      title: 'OmnIA.sale lève 2M€ pour révolutionner la vente de mobilier avec l\'IA',
      excerpt: 'La startup française spécialisée dans les assistants conversationnels pour revendeurs de mobilier annonce une levée de fonds...',
      category: 'Financement',
      link: '#'
    },
    {
      date: '3 Janvier 2025',
      title: 'Plus de 500 revendeurs adoptent la solution OmnIA en 2024',
      excerpt: 'Bilan exceptionnel pour OmnIA.sale qui compte désormais plus de 500 revendeurs partenaires à travers l\'Europe...',
      category: 'Croissance',
      link: '#'
    },
    {
      date: '20 Décembre 2024',
      title: 'OmnIA remporte le Prix Innovation E-commerce 2024',
      excerpt: 'La solution d\'intelligence artificielle conversationnelle d\'OmnIA.sale a été récompensée lors du salon E-commerce Paris...',
      category: 'Récompense',
      link: '#'
    }
  ];

  const mediaKit = [
    {
      title: 'Kit Presse Complet',
      description: 'Logos, photos, communiqués de presse',
      format: 'ZIP (15 MB)',
      type: 'download'
    },
    {
      title: 'Logos Haute Résolution',
      description: 'PNG, SVG, formats vectoriels',
      format: 'ZIP (5 MB)',
      type: 'download'
    },
    {
      title: 'Photos Équipe',
      description: 'Photos officielles dirigeants',
      format: 'ZIP (8 MB)',
      type: 'download'
    },
    {
      title: 'Captures d\'Écran',
      description: 'Interface OmnIA, dashboard admin',
      format: 'ZIP (12 MB)',
      type: 'download'
    }
  ];

  const awards = [
    {
      year: '2024',
      title: 'Prix Innovation E-commerce',
      organization: 'Salon E-commerce Paris',
      category: 'Intelligence Artificielle'
    },
    {
      year: '2024',
      title: 'Startup de l\'Année',
      organization: 'French Tech',
      category: 'Retail Tech'
    },
    {
      year: '2023',
      title: 'Best AI Solution',
      organization: 'European Retail Awards',
      category: 'Customer Experience'
    }
  ];

  const stats = [
    { number: '500+', label: 'Revendeurs partenaires' },
    { number: '98%', label: 'Satisfaction client' },
    { number: '+40%', label: 'Augmentation conversions' },
    { number: '24/7', label: 'Disponibilité assistant' }
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
          </div>
        </div>
      </header>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Hero Section */}
        <div className="text-center mb-16">
          <h1 className="text-4xl md:text-6xl font-bold text-white mb-6">
            Espace Presse
            <span className="block bg-gradient-to-r from-cyan-400 via-blue-400 to-purple-400 bg-clip-text text-transparent">
              OmnIA.sale
            </span>
          </h1>
          <p className="text-xl text-gray-300 max-w-3xl mx-auto">
            Actualités, communiqués de presse et ressources média
          </p>
        </div>

        {/* Stats Section */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-16">
          {stats.map((stat, index) => (
            <div key={index} className="bg-white/10 backdrop-blur-xl rounded-2xl p-6 border border-white/20 text-center">
              <div className="text-3xl font-bold text-cyan-400 mb-2">{stat.number}</div>
              <div className="text-gray-300 text-sm">{stat.label}</div>
            </div>
          ))}
        </div>

        {/* Press Releases */}
        <div className="bg-white/10 backdrop-blur-xl rounded-2xl p-8 border border-white/20 mb-16">
          <h2 className="text-3xl font-bold text-white mb-8">Communiqués de Presse</h2>
          <div className="space-y-6">
            {pressReleases.map((release, index) => (
              <div key={index} className="bg-black/20 rounded-xl p-6 border border-white/10 hover:border-cyan-500/30 transition-all">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <Calendar className="w-4 h-4 text-cyan-400" />
                      <span className="text-cyan-300 text-sm">{release.date}</span>
                      <span className="bg-cyan-500/20 text-cyan-300 px-2 py-1 rounded-full text-xs">
                        {release.category}
                      </span>
                    </div>
                    <h3 className="text-xl font-bold text-white mb-3">{release.title}</h3>
                    <p className="text-gray-300">{release.excerpt}</p>
                  </div>
                  <div className="flex gap-3">
                    <button className="bg-cyan-600 hover:bg-cyan-700 text-white px-4 py-2 rounded-xl flex items-center gap-2">
                      <ExternalLink className="w-4 h-4" />
                      Lire
                    </button>
                    <button className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-xl flex items-center gap-2">
                      <Download className="w-4 h-4" />
                      PDF
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Awards */}
        <div className="bg-white/10 backdrop-blur-xl rounded-2xl p-8 border border-white/20 mb-16">
          <h2 className="text-3xl font-bold text-white mb-8 text-center">Récompenses & Distinctions</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {awards.map((award, index) => (
              <div key={index} className="bg-black/20 rounded-xl p-6 border border-white/10 text-center">
                <div className="w-16 h-16 bg-gradient-to-br from-yellow-500 to-orange-600 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Award className="w-8 h-8 text-white" />
                </div>
                <div className="text-yellow-400 font-bold text-lg mb-1">{award.year}</div>
                <h3 className="font-bold text-white mb-2">{award.title}</h3>
                <p className="text-gray-300 text-sm mb-1">{award.organization}</p>
                <span className="bg-yellow-500/20 text-yellow-300 px-2 py-1 rounded-full text-xs">
                  {award.category}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Media Kit */}
        <div className="bg-white/10 backdrop-blur-xl rounded-2xl p-8 border border-white/20 mb-16">
          <h2 className="text-3xl font-bold text-white mb-8">Kit Média</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {mediaKit.map((item, index) => (
              <div key={index} className="bg-black/20 rounded-xl p-6 border border-white/10 hover:border-cyan-500/30 transition-all">
                <div className="w-12 h-12 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-xl flex items-center justify-center mb-4">
                  <Download className="w-6 h-6 text-white" />
                </div>
                <h3 className="font-bold text-white mb-2">{item.title}</h3>
                <p className="text-gray-300 text-sm mb-3">{item.description}</p>
                <div className="flex items-center justify-between">
                  <span className="text-cyan-400 text-xs">{item.format}</span>
                  <button className="bg-cyan-600 hover:bg-cyan-700 text-white px-3 py-1 rounded-lg text-xs">
                    Télécharger
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Contact Press */}
        <div className="bg-gradient-to-r from-cyan-500/20 to-blue-600/20 backdrop-blur-xl rounded-3xl p-8 border border-cyan-400/30 text-center">
          <h2 className="text-3xl font-bold text-white mb-4">Contact Presse</h2>
          <p className="text-xl text-gray-300 mb-8">
            Pour toute demande média ou interview
          </p>
          <div className="flex flex-col sm:flex-row gap-6 justify-center items-center">
            <div className="text-center">
              <div className="font-bold text-white">Marie Rousseau</div>
              <div className="text-cyan-400">Responsable Communication</div>
              <a href="mailto:presse@omnia.sale" className="text-cyan-300 hover:text-cyan-200">
                presse@omnia.sale
              </a>
            </div>
            <div className="text-center">
              <div className="font-bold text-white">+33 1 84 88 32 50</div>
              <div className="text-gray-300">Ligne directe presse</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};