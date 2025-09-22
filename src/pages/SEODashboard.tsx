import React, { useState } from 'react';
import { Search, TrendingUp, FileText, Globe, ArrowLeft, Target, BarChart3, Zap } from 'lucide-react';
import { Logo } from '../components/Logo';

export const SEODashboard: React.FC = () => {
  const [activeTab, setActiveTab] = useState('overview');

  const tabs = [
    { id: 'overview', label: 'Vue d\'ensemble', icon: BarChart3 },
    { id: 'keywords', label: 'Mots-clés', icon: Search },
    { id: 'content', label: 'Contenu', icon: FileText },
    { id: 'performance', label: 'Performance', icon: TrendingUp }
  ];

  const seoStats = [
    { label: 'Position moyenne', value: '12.4', icon: TrendingUp, color: 'bg-blue-500' },
    { label: 'Mots-clés top 10', value: '89', icon: Target, color: 'bg-green-500' },
    { label: 'Trafic organique', value: '+24%', icon: Globe, color: 'bg-purple-500' },
    { label: 'Score SEO', value: '87/100', icon: Zap, color: 'bg-orange-500' }
  ];

  const topKeywords = [
    { keyword: 'canapé moderne', position: 3, volume: '2.1k', trend: '+12%' },
    { keyword: 'table travertin', position: 7, volume: '890', trend: '+8%' },
    { keyword: 'mobilier design', position: 15, volume: '1.5k', trend: '+5%' },
    { keyword: 'chaise bureau', position: 9, volume: '1.2k', trend: '+18%' }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-purple-900">
      {/* Header */}
      <header className="bg-black/20 backdrop-blur-xl border-b border-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center gap-4">
              <Logo size="md" />
              <div>
                <h1 className="text-2xl font-bold text-white">SEO Dashboard</h1>
                <p className="text-cyan-300">Optimisation et référencement naturel</p>
              </div>
            </div>
            <a href="/" className="flex items-center gap-2 text-cyan-400 hover:text-cyan-300 transition-colors">
              <ArrowLeft className="w-4 h-4" />
              Retour accueil
            </a>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {seoStats.map((stat, index) => {
            const Icon = stat.icon;
            return (
              <div key={index} className="bg-white/10 backdrop-blur-xl rounded-2xl p-6 border border-white/20">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-300 text-sm">{stat.label}</p>
                    <p className="text-3xl font-bold text-white">{stat.value}</p>
                  </div>
                  <div className={`w-12 h-12 ${stat.color} rounded-xl flex items-center justify-center`}>
                    <Icon className="w-6 h-6 text-white" />
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Navigation Tabs */}
        <div className="bg-white/10 backdrop-blur-xl rounded-2xl p-2 border border-white/20 mb-8">
          <div className="flex space-x-2">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-2 px-6 py-3 rounded-xl transition-all ${
                    activeTab === tab.id
                      ? 'bg-cyan-500 text-white'
                      : 'text-gray-400 hover:text-white hover:bg-white/10'
                  }`}
                >
                  <Icon className="w-5 h-5" />
                  <span className="font-medium">{tab.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Tab Content */}
        <div className="bg-white/10 backdrop-blur-xl rounded-2xl border border-white/20 min-h-[600px] p-8">
          {activeTab === 'overview' && (
            <div className="space-y-8">
              <h2 className="text-2xl font-bold text-white">Vue d'ensemble SEO</h2>
              
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div className="bg-black/20 rounded-xl p-6">
                  <h3 className="text-lg font-bold text-white mb-6">Performance Globale</h3>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <span className="text-gray-300">Score SEO technique</span>
                      <div className="flex items-center gap-2">
                        <div className="w-20 h-2 bg-gray-700 rounded-full">
                          <div className="w-4/5 h-2 bg-green-500 rounded-full"></div>
                        </div>
                        <span className="text-green-400 font-bold">87/100</span>
                      </div>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-300">Vitesse de chargement</span>
                      <div className="flex items-center gap-2">
                        <div className="w-20 h-2 bg-gray-700 rounded-full">
                          <div className="w-3/4 h-2 bg-yellow-500 rounded-full"></div>
                        </div>
                        <span className="text-yellow-400 font-bold">2.1s</span>
                      </div>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-300">Mobile-friendly</span>
                      <div className="flex items-center gap-2">
                        <div className="w-20 h-2 bg-gray-700 rounded-full">
                          <div className="w-full h-2 bg-green-500 rounded-full"></div>
                        </div>
                        <span className="text-green-400 font-bold">100%</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="bg-black/20 rounded-xl p-6">
                  <h3 className="text-lg font-bold text-white mb-6">Trafic Organique</h3>
                  <div className="space-y-4">
                    <div className="text-center">
                      <div className="text-3xl font-bold text-cyan-400 mb-2">+24%</div>
                      <div className="text-gray-300">vs mois dernier</div>
                    </div>
                    <div className="grid grid-cols-2 gap-4 text-center">
                      <div>
                        <div className="text-xl font-bold text-white">8.9k</div>
                        <div className="text-gray-400 text-sm">Sessions</div>
                      </div>
                      <div>
                        <div className="text-xl font-bold text-white">12.4k</div>
                        <div className="text-gray-400 text-sm">Pages vues</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'keywords' && (
            <div className="space-y-6">
              <h2 className="text-2xl font-bold text-white">Mots-clés & Positions</h2>
              
              <div className="bg-black/20 rounded-xl overflow-hidden">
                <table className="w-full">
                  <thead className="bg-black/40">
                    <tr>
                      <th className="text-left p-4 text-cyan-300 font-semibold">Mot-clé</th>
                      <th className="text-left p-4 text-cyan-300 font-semibold">Position</th>
                      <th className="text-left p-4 text-cyan-300 font-semibold">Volume</th>
                      <th className="text-left p-4 text-cyan-300 font-semibold">Évolution</th>
                    </tr>
                  </thead>
                  <tbody>
                    {topKeywords.map((keyword, index) => (
                      <tr key={index} className="border-b border-white/10">
                        <td className="p-4 text-white font-medium">{keyword.keyword}</td>
                        <td className="p-4">
                          <span className={`px-3 py-1 rounded-full text-sm font-bold ${
                            keyword.position <= 3 ? 'bg-green-500/20 text-green-300' :
                            keyword.position <= 10 ? 'bg-yellow-500/20 text-yellow-300' :
                            'bg-red-500/20 text-red-300'
                          }`}>
                            #{keyword.position}
                          </span>
                        </td>
                        <td className="p-4 text-gray-300">{keyword.volume}/mois</td>
                        <td className="p-4">
                          <span className="text-green-400 font-bold">{keyword.trend}</span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {activeTab === 'content' && (
            <div className="text-center py-20">
              <FileText className="w-16 h-16 text-cyan-400 mx-auto mb-4" />
              <h3 className="text-xl font-bold text-white mb-2">Optimisation Contenu</h3>
              <p className="text-gray-300">Génération et optimisation de contenu SEO</p>
            </div>
          )}

          {activeTab === 'performance' && (
            <div className="text-center py-20">
              <TrendingUp className="w-16 h-16 text-green-400 mx-auto mb-4" />
              <h3 className="text-xl font-bold text-white mb-2">Performance SEO</h3>
              <p className="text-gray-300">Métriques et évolution du référencement</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};