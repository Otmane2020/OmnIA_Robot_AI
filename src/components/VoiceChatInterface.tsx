import React, { useState, useEffect } from 'react';
import { Mic, MicOff, Volume2, VolumeX, Bot, User, Settings, Zap } from 'lucide-react';
import { useWhisperSTT } from '../hooks/useWhisperSTT';
import { useConversationalAI } from '../hooks/useConversationalAI';
import { useAdvancedVoice } from '../hooks/useAdvancedVoice';

interface VoiceChatMessage {
  id: string;
  content: string;
  isUser: boolean;
  timestamp: Date;
  audioUrl?: string;
}

export const VoiceChatInterface: React.FC = () => {
  const [messages, setMessages] = useState<VoiceChatMessage[]>([]);
  const [showSettings, setShowSettings] = useState(false);
  const [voiceProvider, setVoiceProvider] = useState<'elevenlabs' | 'browser'>('elevenlabs');
  
  // Hooks pour la fonctionnalité vocale
  const { 
    isRecording, 
    isProcessing, 
    transcript, 
    error: sttError,
    startRecording, 
    stopRecording, 
    reset: resetSTT 
  } = useWhisperSTT({ language: 'fr' });

  const { 
    isThinking, 
    sendMessage, 
    clearHistory,
    error: aiError 
  } = useConversationalAI({ 
    maxContextLength: 10,
    temperature: 0.7 
  });

  const { 
    speak, 
    stopSpeaking, 
    isSpeaking, 
    isLoading: ttsLoading,
    error: ttsError,
  } = useAdvancedVoice({ 
    provider: voiceProvider,
    voiceSettings: {
      voiceId: 'EIe4oLyymVX7lKVYli9m', // Voix masculine française
      stability: 0.7,
      similarityBoost: 0.9,
      style: 0.1,
      useSpeakerBoost: true
    }
  });

  // Traitement automatique de la transcription
  useEffect(() => {
    if (transcript && !isProcessing && !isThinking) {
      handleVoiceMessage(transcript);
    }
  }, [transcript, isProcessing, isThinking]);

  const handleVoiceMessage = async (transcribedText: string) => {
    if (!transcribedText.trim()) return;

    // Ajouter le message utilisateur
    const userMessage: VoiceChatMessage = {
      id: Date.now().toString(),
      content: transcribedText,
      isUser: true,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);

    try {
      // Obtenir la réponse IA
      const aiResponse = await sendMessage(transcribedText);

      // Ajouter le message IA
      const aiMessage: VoiceChatMessage = {
        id: (Date.now() + 1).toString(),
        content: aiResponse,
        isUser: false,
        timestamp: new Date()
      };

      setMessages(prev => [...prev, aiMessage]);

      // Lire la réponse automatiquement
      await speak(aiResponse);

    } catch (error) {
      console.error('❌ Erreur traitement message vocal:', error);
      
      const errorMessage: VoiceChatMessage = {
        id: (Date.now() + 1).toString(),
        content: 'Désolé, je rencontre des difficultés techniques. Pouvez-vous répéter ?',
        isUser: false,
        timestamp: new Date()
      };

      setMessages(prev => [...prev, errorMessage]);
    }

    // Réinitialiser la transcription
    resetSTT();
  };

  const handleMicClick = () => {
    if (isRecording) {
      stopRecording();
    } else {
      startRecording();
    }
  };

  const handleClearConversation = () => {
    setMessages([]);
    clearHistory();
    resetSTT();
    stopSpeaking();
  };

  const currentError = sttError || aiError || ttsError;

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="text-center">
        <div className="flex items-center justify-center gap-3 mb-4">
          <div className="w-12 h-12 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-2xl flex items-center justify-center">
            <Bot className="w-6 h-6 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-white">Discussion Vocale OmnIA</h1>
        </div>
        <p className="text-cyan-300">Assistant robot IA avec reconnaissance et synthèse vocale</p>
      </div>

      {/* Voice Controls */}
      <div className="bg-white/10 backdrop-blur-xl rounded-2xl p-6 border border-white/20">
        <div className="flex items-center justify-center gap-6">
          {/* Microphone Button */}
          <button
            onClick={handleMicClick}
            disabled={isProcessing || isThinking}
            className={`relative p-6 rounded-full transition-all duration-300 shadow-2xl border-4 ${
              isRecording
                ? 'bg-red-500/30 border-red-400/70 animate-pulse shadow-red-500/50'
                : isProcessing
                ? 'bg-yellow-500/30 border-yellow-400/70 animate-pulse shadow-yellow-500/50'
                : 'bg-blue-500/30 border-blue-400/70 hover:bg-blue-500/50 shadow-blue-500/50 hover:scale-110'
            }`}
            title={
              isRecording ? 'Arrêter l\'enregistrement' :
              isProcessing ? 'Traitement en cours...' :
              'Commencer l\'enregistrement vocal'
            }
          >
            {isRecording ? (
              <MicOff className="w-8 h-8 text-red-300" />
            ) : isProcessing ? (
              <div className="w-8 h-8 border-2 border-yellow-300 border-t-transparent rounded-full animate-spin" />
            ) : (
              <Mic className="w-8 h-8 text-blue-300" />
            )}
            
            {/* Pulse effect when recording */}
            {isRecording && (
              <div className="absolute inset-0 rounded-full border-4 border-red-400/30 animate-ping" />
            )}
          </button>

          {/* Voice Output Control */}
          <button
            onClick={isSpeaking ? stopSpeaking : undefined}
            disabled={!isSpeaking && !ttsLoading}
            className={`p-4 rounded-full transition-all duration-300 shadow-lg border-2 ${
              isSpeaking
                ? 'bg-green-500/30 border-green-400/70 animate-pulse shadow-green-500/50'
                : ttsLoading
                ? 'bg-yellow-500/30 border-yellow-400/70 animate-pulse shadow-yellow-500/50'
                : 'bg-gray-500/30 border-gray-500/50 cursor-not-allowed'
            }`}
            title={
              isSpeaking ? 'Arrêter la lecture' :
              ttsLoading ? 'Génération audio...' :
              'Aucune lecture en cours'
            }
          >
            {isSpeaking ? (
              <Volume2 className="w-6 h-6 text-green-300" />
            ) : ttsLoading ? (
              <div className="w-6 h-6 border-2 border-yellow-300 border-t-transparent rounded-full animate-spin" />
            ) : (
              <VolumeX className="w-6 h-6 text-gray-400" />
            )}
          </button>

          {/* Settings Button */}
          <button
            onClick={() => setShowSettings(!showSettings)}
            className="p-4 rounded-full bg-purple-500/30 border-2 border-purple-400/70 hover:bg-purple-500/50 text-purple-300 transition-all duration-300 shadow-lg hover:shadow-purple-500/50"
            title="Paramètres vocaux"
          >
            <Settings className="w-6 h-6" />
          </button>
        </div>

        {/* Status Display */}
        <div className="mt-6 text-center">
          {isRecording && (
            <div className="text-red-300 font-bold animate-pulse">
              🎤 Enregistrement en cours... Parlez maintenant
            </div>
          )}
          {isProcessing && (
            <div className="text-yellow-300 font-bold animate-pulse">
              🔄 Transcription avec Whisper...
            </div>
          )}
          {isThinking && (
            <div className="text-blue-300 font-bold animate-pulse">
              🤖 OmnIA réfléchit...
            </div>
          )}
          {ttsLoading && (
            <div className="text-green-300 font-bold animate-pulse">
              🔊 Génération vocale...
            </div>
          )}
          {isSpeaking && (
            <div className="text-green-300 font-bold animate-pulse">
              🎵 OmnIA parle...
            </div>
          )}
          {!isRecording && !isProcessing && !isThinking && !ttsLoading && !isSpeaking && (
            <div className="text-cyan-300">
              Cliquez sur le microphone pour commencer une conversation vocale
            </div>
          )}
        </div>

        {/* Current Transcript */}
        {transcript && (
          <div className="mt-4 p-4 bg-blue-500/20 border border-blue-400/30 rounded-xl">
            <div className="flex items-center gap-2 mb-2">
              <Mic className="w-4 h-4 text-blue-400" />
              <span className="text-blue-300 font-semibold">Transcription :</span>
            </div>
            <p className="text-white">{transcript}</p>
          </div>
        )}

        {/* Error Display */}
        {currentError && (
          <div className="mt-4 p-4 bg-red-500/20 border border-red-400/30 rounded-xl">
            <div className="flex items-center gap-2 mb-2">
              <Zap className="w-4 h-4 text-red-400" />
              <span className="text-red-300 font-semibold">Erreur :</span>
            </div>
            <p className="text-red-200">{currentError}</p>
          </div>
        )}
      </div>

      {/* Voice Settings */}
      {showSettings && (
        <div className="bg-white/10 backdrop-blur-xl rounded-2xl p-6 border border-white/20">
          <h3 className="text-lg font-bold text-white mb-4">Paramètres Vocaux</h3>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm text-cyan-300 mb-2">Fournisseur de voix</label>
              <select
                value={voiceProvider}
                onChange={(e) => {
                  const provider = e.target.value as 'elevenlabs' | 'browser';
                  setVoiceProvider(provider);
                  setVoiceProvider(provider);
                }}
                className="w-full bg-black/40 border border-cyan-500/50 rounded-xl px-4 py-2 text-white"
              >
                <option value="elevenlabs">ElevenLabs (Qualité premium)</option>
                <option value="browser">Navigateur (Gratuit)</option>
              </select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <button
                onClick={handleClearConversation}
                className="bg-red-600 hover:bg-red-700 text-white py-2 px-4 rounded-xl transition-all"
              >
                Effacer conversation
              </button>
              <button
                onClick={() => setShowSettings(false)}
                className="bg-gray-600 hover:bg-gray-700 text-white py-2 px-4 rounded-xl transition-all"
              >
                Fermer
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Conversation History */}
      <div className="bg-white/10 backdrop-blur-xl rounded-2xl p-6 border border-white/20">
        <h3 className="text-lg font-bold text-white mb-4">Historique de conversation</h3>
        
        {messages.length === 0 ? (
          <div className="text-center py-8">
            <Bot className="w-16 h-16 text-cyan-400 mx-auto mb-4" />
            <p className="text-gray-300">Aucune conversation vocale pour le moment</p>
            <p className="text-sm text-gray-400">Cliquez sur le microphone pour commencer</p>
          </div>
        ) : (
          <div className="space-y-4 max-h-96 overflow-y-auto">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex gap-4 ${message.isUser ? 'justify-end' : 'justify-start'}`}
              >
                {!message.isUser && (
                  <div className="w-10 h-10 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-full flex items-center justify-center">
                    <Bot className="w-5 h-5 text-white" />
                  </div>
                )}
                
                <div className={`max-w-[70%] ${message.isUser ? 'order-first' : ''}`}>
                  <div
                    className={`rounded-2xl px-4 py-3 ${
                      message.isUser
                        ? 'bg-gradient-to-r from-cyan-500 to-blue-600 text-white'
                        : 'bg-black/40 text-cyan-100 border border-cyan-500/30'
                    }`}
                  >
                    <p className="leading-relaxed">{message.content}</p>
                  </div>
                  
                  {!message.isUser && (
                    <button
                      onClick={() => speak(message.content)}
                      className="mt-2 inline-flex items-center gap-2 px-3 py-1 rounded-lg bg-cyan-500/20 text-cyan-300 hover:bg-cyan-500/30 transition-all text-sm"
                    >
                      <Volume2 className="w-3 h-3" />
                      Réécouter
                    </button>
                  )}
                  
                  <div className="text-xs text-gray-400 mt-2">
                    {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </div>
                </div>

                {message.isUser && (
                  <div className="w-10 h-10 bg-gradient-to-br from-slate-600 to-slate-800 rounded-full flex items-center justify-center">
                    <User className="w-5 h-5 text-white" />
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Instructions */}
      <div className="bg-gradient-to-r from-cyan-500/20 to-blue-600/20 backdrop-blur-xl rounded-2xl p-6 border border-cyan-400/30">
        <h3 className="text-lg font-bold text-white mb-4">💡 Comment utiliser la discussion vocale</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
          <div>
            <h4 className="font-semibold text-cyan-300 mb-2">🎤 Reconnaissance vocale :</h4>
            <ul className="text-cyan-200 space-y-1">
              <li>• Cliquez sur le microphone</li>
              <li>• Parlez clairement en français</li>
              <li>• Whisper transcrit automatiquement</li>
              <li>• Recliquez pour arrêter</li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold text-cyan-300 mb-2">🔊 Synthèse vocale :</h4>
            <ul className="text-cyan-200 space-y-1">
              <li>• ElevenLabs pour qualité premium</li>
              <li>• Lecture automatique des réponses</li>
              <li>• Bouton volume pour arrêter</li>
              <li>• Fallback navigateur si erreur</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};