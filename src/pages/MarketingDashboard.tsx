import React, { useState } from 'react';
import { Megaphone, Target, BarChart3, Mail, ArrowLeft, TrendingUp, Users, Eye, Click } from 'lucide-react';
import { Logo } from '../components/Logo';

export const MarketingDashboard: React.FC = () => {
  const [activeTab, setActiveTab] = useState('campaigns');

  const tabs = [
    { id: 'campaigns', label: 'Campagnes', icon: Megaphone },
    { id: 'ads', label: 'Publicités', icon: Target },
    { id: 'email', label: 'Email Marketing', icon: Mail },
    { id: 'analytics', label: 'Performance', icon: BarChart3 }
  ];

  const campaignStats = [
    { label: 'Impressions', value: '45.2k', icon: Eye, color: 'bg-blue-500' },
    { label: 'Clics', value: '1.8k', icon: Click, color: 'bg-green-500' },
    { label: 'CTR', value: '4.1%', icon: TrendingUp, color: 'bg-purple-500' },
    { label: 'Conversions', value: '89', icon: Users, color: 'bg-orange-500' }
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
                <h1 className="text-2xl font-bold text-white">Marketing & Publicités</h1>
                <p className="text-cyan-300">Campagnes et performance publicitaire</p>
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
          {campaignStats.map((stat, index) => {
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
          {activeTab === 'campaigns' && (
            <div className="space-y-6">
              <h2 className="text-2xl font-bold text-white">Campagnes Marketing</h2>
              
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="bg-black/20 rounded-xl p-6">
                  <h3 className="text-lg font-bold text-white mb-4">Campagne Active</h3>
                  <div className="space-y-4">
                    <div className="flex justify-between">
                      <span className="text-gray-300">Nom:</span>
                      <span className="text-white font-medium">Mobilier Hiver 2025</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-300">Budget:</span>
                      <span className="text-green-400 font-bold">€2,500</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-300">Durée:</span>
                      <span className="text-white">15 jours restants</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-300">Performance:</span>
                      <span className="text-cyan-400 font-bold">Excellente</span>
                    </div>
                  </div>
                </div>

                <div className="bg-black/20 rounded-xl p-6">
                  <h3 className="text-lg font-bold text-white mb-4">Prochaines Actions</h3>
                  <div className="space-y-3">
                    <div className="flex items-center gap-3 p-3 bg-blue-500/20 rounded-lg">
                      <Target className="w-5 h-5 text-blue-400" />
                      <span className="text-blue-300">Optimiser audiences</span>
                    </div>
                    <div className="flex items-center gap-3 p-3 bg-green-500/20 rounded-lg">
                      <Mail className="w-5 h-5 text-green-400" />
                      <span className="text-green-300">Lancer email retargeting</span>
                    </div>
                    <div className="flex items-center gap-3 p-3 bg-purple-500/20 rounded-lg">
                      <BarChart3 className="w-5 h-5 text-purple-400" />
                      <span className="text-purple-300">Analyser ROI</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'ads' && (
            <div className="text-center py-20">
              <Target className="w-16 h-16 text-cyan-400 mx-auto mb-4" />
              <h3 className="text-xl font-bold text-white mb-2">Gestion Publicités</h3>
              <p className="text-gray-300">Google Ads, Facebook Ads, et autres plateformes</p>
            </div>
          )}

          {activeTab === 'email' && (
            <div className="text-center py-20">
              <Mail className="w-16 h-16 text-green-400 mx-auto mb-4" />
              <h3 className="text-xl font-bold text-white mb-2">Email Marketing</h3>
              <p className="text-gray-300">Campagnes email et automation</p>
            </div>
          )}

          {activeTab === 'analytics' && (
            <div className="text-center py-20">
              <BarChart3 className="w-16 h-16 text-purple-400 mx-auto mb-4" />
              <h3 className="text-xl font-bold text-white mb-2">Performance Marketing</h3>
              <p className="text-gray-300">Analytics et ROI des campagnes</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};