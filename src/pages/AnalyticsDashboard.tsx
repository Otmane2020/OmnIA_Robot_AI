import React, { useState } from 'react';
import { BarChart3, TrendingUp, Users, Clock, ArrowLeft, Eye, MessageSquare, ShoppingCart } from 'lucide-react';
import { Logo } from '../components/Logo';
import { ConversationHistory } from '../components/ConversationHistory';
import { MLTrainingDashboard } from '../components/MLTrainingDashboard';

export const AnalyticsDashboard: React.FC = () => {
  const [activeTab, setActiveTab] = useState('overview');

  const tabs = [
    { id: 'overview', label: 'Vue d\'ensemble', icon: BarChart3 },
    { id: 'conversations', label: 'Conversations', icon: MessageSquare },
    { id: 'ml', label: 'Machine Learning', icon: TrendingUp },
    { id: 'users', label: 'Utilisateurs', icon: Users }
  ];

  const analyticsStats = [
    { label: 'Conversations totales', value: '12.4k', icon: MessageSquare, color: 'bg-blue-500' },
    { label: 'Taux de conversion', value: '42%', icon: ShoppingCart, color: 'bg-green-500' },
    { label: 'Temps moyen session', value: '4m 32s', icon: Clock, color: 'bg-purple-500' },
    { label: 'Visiteurs uniques', value: '8.9k', icon: Eye, color: 'bg-orange-500' }
  ];

  const conversationTrends = [
    { hour: '09h', conversations: 45 },
    { hour: '10h', conversations: 78 },
    { hour: '11h', conversations: 92 },
    { hour: '12h', conversations: 65 },
    { hour: '13h', conversations: 43 },
    { hour: '14h', conversations: 89 },
    { hour: '15h', conversations: 112 },
    { hour: '16h', conversations: 98 },
    { hour: '17h', conversations: 87 },
    { hour: '18h', conversations: 76 }
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
                <h1 className="text-2xl font-bold text-white">Analytics Dashboard</h1>
                <p className="text-cyan-300">Statistiques et performance OmnIA</p>
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
          {analyticsStats.map((stat, index) => {
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
        <div className="bg-white/10 backdrop-blur-xl rounded-2xl border border-white/20 min-h-[600px]">
          {activeTab === 'overview' && (
            <div className="p-8 space-y-8">
              <h2 className="text-2xl font-bold text-white">Vue d'ensemble Analytics</h2>
              
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div className="bg-black/20 rounded-xl p-6">
                  <h3 className="text-lg font-bold text-white mb-6">Conversations par heure</h3>
                  <div className="space-y-3">
                    {conversationTrends.map((trend, index) => (
                      <div key={index} className="flex items-center justify-between">
                        <span className="text-gray-300">{trend.hour}</span>
                        <div className="flex items-center gap-3">
                          <div className="w-32 h-2 bg-gray-700 rounded-full">
                            <div 
                              className="h-2 bg-cyan-500 rounded-full" 
                              style={{ width: `${(trend.conversations / 112) * 100}%` }}
                            ></div>
                          </div>
                          <span className="text-white font-medium w-8">{trend.conversations}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="bg-black/20 rounded-xl p-6">
                  <h3 className="text-lg font-bold text-white mb-6">Top Produits Demandés</h3>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between p-3 bg-white/5 rounded-lg">
                      <span className="text-white">Canapé ALYANA</span>
                      <span className="text-cyan-400 font-bold">89 mentions</span>
                    </div>
                    <div className="flex items-center justify-between p-3 bg-white/5 rounded-lg">
                      <span className="text-white">Table AUREA</span>
                      <span className="text-cyan-400 font-bold">67 mentions</span>
                    </div>
                    <div className="flex items-center justify-between p-3 bg-white/5 rounded-lg">
                      <span className="text-white">Chaise INAYA</span>
                      <span className="text-cyan-400 font-bold">54 mentions</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
          
          {activeTab === 'conversations' && (
            <div className="p-8">
              <ConversationHistory />
            </div>
          )}
          
          {activeTab === 'ml' && (
            <div className="p-8">
              <MLTrainingDashboard />
            </div>
          )}
          
          {activeTab === 'users' && (
            <div className="p-8">
              <div className="text-center py-20">
                <Users className="w-16 h-16 text-purple-400 mx-auto mb-4" />
                <h3 className="text-xl font-bold text-white mb-2">Analytics Utilisateurs</h3>
                <p className="text-gray-300">Comportement et segmentation des utilisateurs</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};