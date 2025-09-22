import React, { useState } from 'react';
import { Bot, MessageSquare, Settings, Zap, ArrowLeft, Mic, Volume2, Brain } from 'lucide-react';
import { Logo } from '../components/Logo';
import { OmniaRobotTab } from '../components/OmniaRobotTab';
import { VoiceChatInterface } from '../components/VoiceChatInterface';
import { AITrainingInterface } from '../components/AITrainingInterface';

export const OmniaBotDashboard: React.FC = () => {
  const [activeTab, setActiveTab] = useState('robot');

  const tabs = [
    { id: 'robot', label: 'Configuration Robot', icon: Bot },
    { id: 'chat', label: 'Chat Vocal', icon: MessageSquare },
    { id: 'training', label: 'Entraînement IA', icon: Brain },
    { id: 'settings', label: 'Paramètres', icon: Settings }
  ];

  const botStats = [
    { label: 'Conversations', value: '1,234', icon: MessageSquare, color: 'bg-blue-500' },
    { label: 'Taux satisfaction', value: '94%', icon: Zap, color: 'bg-green-500' },
    { label: 'Temps réponse', value: '0.8s', icon: Brain, color: 'bg-purple-500' },
    { label: 'Disponibilité', value: '99.9%', icon: Bot, color: 'bg-orange-500' }
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
                <h1 className="text-2xl font-bold text-white">OmnIA Bot Dashboard</h1>
                <p className="text-cyan-300">Configuration et gestion du robot IA</p>
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
          {botStats.map((stat, index) => {
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
          {activeTab === 'robot' && (
            <div className="p-8">
              <OmniaRobotTab />
            </div>
          )}
          
          {activeTab === 'chat' && (
            <div className="p-8">
              <VoiceChatInterface />
            </div>
          )}
          
          {activeTab === 'training' && (
            <div className="p-8">
              <AITrainingInterface onTrainingComplete={(stats) => console.log('Training complete:', stats)} />
            </div>
          )}
          
          {activeTab === 'settings' && (
            <div className="p-8">
              <div className="space-y-6">
                <h2 className="text-2xl font-bold text-white">Paramètres Avancés</h2>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="bg-black/20 rounded-xl p-6">
                    <h3 className="text-lg font-bold text-white mb-4">Configuration Voix</h3>
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm text-cyan-300 mb-2">Fournisseur TTS</label>
                        <select className="w-full bg-black/40 border border-cyan-500/50 rounded-xl px-4 py-3 text-white">
                          <option value="elevenlabs">ElevenLabs (Premium)</option>
                          <option value="openai">OpenAI TTS</option>
                          <option value="browser">Navigateur (Gratuit)</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm text-cyan-300 mb-2">Voix sélectionnée</label>
                        <select className="w-full bg-black/40 border border-cyan-500/50 rounded-xl px-4 py-3 text-white">
                          <option value="onyx">Onyx (Homme, grave)</option>
                          <option value="alloy">Alloy (Homme, clair)</option>
                          <option value="nova">Nova (Femme, douce)</option>
                          <option value="shimmer">Shimmer (Femme, énergique)</option>
                        </select>
                      </div>
                    </div>
                  </div>

                  <div className="bg-black/20 rounded-xl p-6">
                    <h3 className="text-lg font-bold text-white mb-4">Personnalité IA</h3>
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm text-cyan-300 mb-2">Style de conversation</label>
                        <select className="w-full bg-black/40 border border-cyan-500/50 rounded-xl px-4 py-3 text-white">
                          <option value="commercial">Commercial & Amical</option>
                          <option value="expert">Expert Technique</option>
                          <option value="conseil">Conseiller Déco</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm text-cyan-300 mb-2">Niveau de détail</label>
                        <select className="w-full bg-black/40 border border-cyan-500/50 rounded-xl px-4 py-3 text-white">
                          <option value="concis">Concis</option>
                          <option value="detaille">Détaillé</option>
                          <option value="technique">Technique</option>
                        </select>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};