import React, { useState, useEffect } from 'react';
import { Bot, Settings, Mic, Volume2, Camera, Power, MessageSquare, Sparkles } from 'lucide-react';

export const OmniaRobotTab: React.FC = () => {
  const [isActive, setIsActive] = useState(true);
  const [isListening, setIsListening] = useState(false);

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-white">Configuration Robot OmnIA</h2>
        <div className="flex items-center gap-2">
          <div className={`w-3 h-3 rounded-full animate-pulse ${isActive ? 'bg-green-400' : 'bg-red-400'}`}></div>
          <span className={`text-sm ${isActive ? 'text-green-300' : 'text-red-300'}`}>
            {isActive ? 'Robot actif' : 'Robot inactif'}
          </span>
        </div>
      </div>

      {/* Robot Status Card */}
      <div className="bg-white/10 backdrop-blur-xl rounded-2xl p-8 border border-white/20">
        <div className="flex items-center gap-6 mb-6">
          <div className="w-20 h-20 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-2xl flex items-center justify-center">
            <Bot className="w-10 h-10 text-white" />
          </div>
          <div>
            <h3 className="text-2xl font-bold text-white mb-2">OmnIA Robot</h3>
            <p className="text-gray-300">Assistant IA commercial spécialisé en mobilier</p>
            <div className="flex items-center gap-2 mt-2">
              <Sparkles className="w-4 h-4 text-cyan-400" />
              <span className="text-cyan-300 text-sm">IA entraînée sur votre catalogue</span>
            </div>
          </div>
        </div>

        {/* Control Buttons */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6">
          <button
            onClick={() => setIsListening(!isListening)}
            className={`p-4 rounded-xl border transition-all ${
              isListening 
                ? 'bg-red-500/20 border-red-400/50 text-red-300' 
                : 'bg-purple-500/20 border-purple-400/50 text-purple-300 hover:bg-purple-500/30'
            }`}
          >
            <Mic className="w-6 h-6 mx-auto mb-2" />
            <span className="text-sm">{isListening ? 'Écoute...' : 'Micro'}</span>
          </button>

          <button className="p-4 rounded-xl bg-green-500/20 border border-green-400/50 text-green-300 hover:bg-green-500/30 transition-all">
            <Volume2 className="w-6 h-6 mx-auto mb-2" />
            <span className="text-sm">Volume</span>
          </button>

          <button className="p-4 rounded-xl bg-purple-500/20 border border-purple-400/50 text-purple-300 hover:bg-purple-500/30 transition-all">
            <Camera className="w-6 h-6 mx-auto mb-2" />
            <span className="text-sm">Caméra</span>
          </button>

          <button className="p-4 rounded-xl bg-orange-500/20 border border-orange-400/50 text-orange-300 hover:bg-orange-500/30 transition-all">
            <Settings className="w-6 h-6 mx-auto mb-2" />
            <span className="text-sm">Config</span>
          </button>

          <button
            onClick={() => setIsActive(!isActive)}
            className={`p-4 rounded-xl border transition-all ${
              isActive 
                ? 'bg-green-500/20 border-green-400/50 text-green-300 hover:bg-green-500/30' 
                : 'bg-red-500/20 border-red-400/50 text-red-300 hover:bg-red-500/30'
            }`}
          >
            <Power className="w-6 h-6 mx-auto mb-2" />
            <span className="text-sm">{isActive ? 'ON' : 'OFF'}</span>
          </button>
        </div>

        {/* Status Buttons */}
        <div className="flex gap-4">
          <button className="bg-green-600/20 hover:bg-green-600/30 border border-green-500/50 text-green-300 px-6 py-3 rounded-xl font-semibold transition-all">
            ✅ Prêt à vous conseiller
          </button>
          <button className="bg-purple-600/20 hover:bg-purple-600/30 border border-purple-500/50 text-purple-300 px-6 py-3 rounded-xl font-semibold transition-all">
            🧠 IA Entraînée
          </button>
        </div>
      </div>

      {/* Configuration Panel */}
      <div className="bg-white/10 backdrop-blur-xl rounded-2xl p-8 border border-white/20">
        <h3 className="text-xl font-bold text-white mb-6">Paramètres du Robot</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm text-cyan-300 mb-2">Nom du robot</label>
            <input
              type="text"
              defaultValue="OmnIA"
              className="w-full bg-black/40 border border-cyan-500/50 rounded-xl px-4 py-3 text-white"
            />
          </div>
          
          <div>
            <label className="block text-sm text-cyan-300 mb-2">Personnalité</label>
            <select className="w-full bg-black/40 border border-cyan-500/50 rounded-xl px-4 py-3 text-white">
              <option value="commercial">Commercial & Amical</option>
              <option value="expert">Expert Technique</option>
              <option value="conseil">Conseiller Déco</option>
            </select>
          </div>
          
          <div>
            <label className="block text-sm text-cyan-300 mb-2">Langue</label>
            <select className="w-full bg-black/40 border border-cyan-500/50 rounded-xl px-4 py-3 text-white">
              <option value="fr">Français</option>
              <option value="en">English</option>
              <option value="es">Español</option>
            </select>
          </div>
          
          <div>
            <label className="block text-sm text-cyan-300 mb-2">Vitesse de parole</label>
            <input
              type="range"
              min="0.5"
              max="2"
              step="0.1"
              defaultValue="1.2"
              className="w-full"
            />
          </div>
          
          <div>
            <label className="block text-sm text-cyan-300 mb-2">Fournisseur de voix</label>
            <select className="w-full bg-black/40 border border-cyan-500/50 rounded-xl px-4 py-3 text-white">
              <option value="browser">Navigateur (Gratuit)</option>
              <option value="google">Google TTS (Premium)</option>
              <option value="deepseek">DeepSeek TTS (Premium)</option>
            </select>
          </div>
          
          <div>
            <label className="block text-sm text-cyan-300 mb-2">Genre de voix</label>
            <select className="w-full bg-black/40 border border-cyan-500/50 rounded-xl px-4 py-3 text-white">
              <option value="onyx">Homme - Onyx (Recommandé)</option>
              <option value="alloy">Homme - Alloy</option>
              <option value="echo">Homme - Echo</option>
              <option value="nova">Femme - Nova</option>
              <option value="shimmer">Femme - Shimmer</option>
              <option value="neutral">Neutre</option>
            </select>
          </div>
        </div>
        
        <div className="mt-6">
          <button className="bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white px-6 py-3 rounded-xl font-semibold transition-all">
            Sauvegarder la configuration
          </button>
        </div>
      </div>

      {/* Test Panel */}
      <div className="bg-white/10 backdrop-blur-xl rounded-2xl p-8 border border-white/20">
        <h3 className="text-xl font-bold text-white mb-6">Test du Robot</h3>
        
        <div className="flex gap-4">
          <button 
            onClick={() => window.open('/robot', '_blank')}
            className="bg-green-500/20 hover:bg-green-500/30 border border-green-400/50 text-green-300 px-6 py-3 rounded-xl font-semibold transition-all flex items-center gap-2"
          >
            <MessageSquare className="w-5 h-5" />
            Tester OmnIA
          </button>
          
          <button className="bg-blue-500/20 hover:bg-blue-500/30 border border-blue-400/50 text-blue-300 px-6 py-3 rounded-xl font-semibold transition-all">
            Voir les logs
          </button>
        </div>
      </div>
    </div>
  );
};