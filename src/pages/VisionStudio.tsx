import React, { useState } from 'react';
import { Camera, Eye, Image, Zap, ArrowLeft, Upload, Scan, Brain } from 'lucide-react';
import { Logo } from '../components/Logo';
import { CameraInterface } from '../components/CameraInterface';
import { PhotoUploadInterface } from '../components/PhotoUploadInterface';

export const VisionStudio: React.FC = () => {
  const [activeTab, setActiveTab] = useState('camera');
  const [showCamera, setShowCamera] = useState(false);
  const [showPhotoUpload, setShowPhotoUpload] = useState(false);

  const tabs = [
    { id: 'camera', label: 'Caméra Live', icon: Camera },
    { id: 'upload', label: 'Upload Photo', icon: Upload },
    { id: 'analysis', label: 'Analyse IA', icon: Brain },
    { id: 'gallery', label: 'Galerie', icon: Image }
  ];

  const visionStats = [
    { label: 'Photos analysées', value: '1,234', icon: Image, color: 'bg-blue-500' },
    { label: 'Détections', value: '5,678', icon: Eye, color: 'bg-green-500' },
    { label: 'Précision IA', value: '94%', icon: Brain, color: 'bg-purple-500' },
    { label: 'Temps moyen', value: '2.3s', icon: Zap, color: 'bg-orange-500' }
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
                <h1 className="text-2xl font-bold text-white">Vision & Studio</h1>
                <p className="text-cyan-300">Analyse visuelle et reconnaissance IA</p>
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
          {visionStats.map((stat, index) => {
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
          {activeTab === 'camera' && (
            <div className="space-y-6">
              <div className="text-center">
                <h2 className="text-2xl font-bold text-white mb-4">Caméra Vision IA</h2>
                <p className="text-gray-300 mb-8">Détection en temps réel avec analyse intelligente</p>
                
                <button
                  onClick={() => setShowCamera(true)}
                  className="bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-400 hover:to-emerald-500 text-white px-8 py-4 rounded-2xl font-bold text-lg transition-all shadow-2xl hover:shadow-green-500/40 flex items-center gap-3 mx-auto"
                >
                  <Camera className="w-6 h-6" />
                  Activer la caméra
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-black/20 rounded-xl p-6">
                  <h3 className="font-bold text-cyan-300 mb-3">🎯 Détection</h3>
                  <ul className="text-cyan-200 text-sm space-y-1">
                    <li>• Reconnaissance faciale</li>
                    <li>• Détection d'objets</li>
                    <li>• Analyse de mouvement</li>
                    <li>• Comptage de personnes</li>
                  </ul>
                </div>
                
                <div className="bg-black/20 rounded-xl p-6">
                  <h3 className="font-bold text-green-300 mb-3">🧠 IA Avancée</h3>
                  <ul className="text-green-200 text-sm space-y-1">
                    <li>• Analyse comportementale</li>
                    <li>• Reconnaissance d'émotions</li>
                    <li>• Prédiction d'intentions</li>
                    <li>• Personnalisation temps réel</li>
                  </ul>
                </div>
                
                <div className="bg-black/20 rounded-xl p-6">
                  <h3 className="font-bold text-purple-300 mb-3">📊 Analytics</h3>
                  <ul className="text-purple-200 text-sm space-y-1">
                    <li>• Heatmaps de regard</li>
                    <li>• Temps d'attention</li>
                    <li>• Zones d'intérêt</li>
                    <li>• Conversion tracking</li>
                  </ul>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'upload' && (
            <div className="space-y-6">
              <div className="text-center">
                <h2 className="text-2xl font-bold text-white mb-4">Upload & Analyse Photo</h2>
                <p className="text-gray-300 mb-8">Analysez vos espaces avec l'IA OmnIA</p>
                
                <button
                  onClick={() => setShowPhotoUpload(true)}
                  className="bg-gradient-to-r from-purple-500 to-pink-600 hover:from-purple-400 hover:to-pink-500 text-white px-8 py-4 rounded-2xl font-bold text-lg transition-all shadow-2xl hover:shadow-purple-500/40 flex items-center gap-3 mx-auto"
                >
                  <Upload className="w-6 h-6" />
                  Analyser une photo
                </button>
              </div>
            </div>
          )}

          {activeTab === 'analysis' && (
            <div className="text-center py-20">
              <Brain className="w-16 h-16 text-purple-400 mx-auto mb-4" />
              <h3 className="text-xl font-bold text-white mb-2">Analyse IA Avancée</h3>
              <p className="text-gray-300">Résultats d'analyse et insights</p>
            </div>
          )}

          {activeTab === 'gallery' && (
            <div className="text-center py-20">
              <Image className="w-16 h-16 text-blue-400 mx-auto mb-4" />
              <h3 className="text-xl font-bold text-white mb-2">Galerie Photos</h3>
              <p className="text-gray-300">Historique des analyses visuelles</p>
            </div>
          )}
        </div>
      </div>

      {/* Modals */}
      {showCamera && (
        <CameraInterface
          onClose={() => setShowCamera(false)}
          onPersonDetected={() => console.log('Person detected')}
        />
      )}

      {showPhotoUpload && (
        <PhotoUploadInterface
          onPhotoAnalyzed={(analysis, imageUrl) => {
            console.log('Photo analyzed:', analysis);
            setShowPhotoUpload(false);
          }}
          onClose={() => setShowPhotoUpload(false)}
        />
      )}
    </div>
  );
};