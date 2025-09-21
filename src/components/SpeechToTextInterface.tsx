import React, { useState, useRef, useEffect } from 'react';
import { Mic, MicOff, Volume2, VolumeX, Play, Pause, Download, Trash2, Upload, Settings } from 'lucide-react';
import { useWhisperSTT } from '../hooks/useWhisperSTT';

interface TranscriptionResult {
  id: string;
  audioUrl: string;
  transcript: string;
  confidence: number;
  duration: number;
  timestamp: Date;
  language: string;
  speaker?: string;
}

interface SpeechToTextInterfaceProps {
  onTranscriptionComplete?: (result: TranscriptionResult) => void;
  onSendMessage?: (message: string) => void;
  autoSend?: boolean;
}

export const SpeechToTextInterface: React.FC<SpeechToTextInterfaceProps> = ({
  onTranscriptionComplete,
  onSendMessage,
  autoSend = true
}) => {
  const [transcriptions, setTranscriptions] = useState<TranscriptionResult[]>([]);
  const [isPlaying, setIsPlaying] = useState<string | null>(null);
  const [selectedLanguage, setSelectedLanguage] = useState('fr-FR');
  const [showSettings, setShowSettings] = useState(false);
  const [audioQuality, setAudioQuality] = useState<'standard' | 'high'>('standard');
  
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const {
    isRecording,
    isProcessing,
    transcript,
    error,
    startRecording,
    stopRecording,
    reset,
    isSupported
  } = useWhisperSTT({
    language: selectedLanguage,
    continuous: false
  });

  // Auto-send transcript when completed
  useEffect(() => {
    if (transcript && transcript.trim() && autoSend && onSendMessage) {
      onSendMessage(transcript);
      reset();
    }
  }, [transcript, autoSend, onSendMessage, reset]);

  // Save transcription when completed
  useEffect(() => {
    if (transcript && transcript.trim() && !isProcessing) {
      const newTranscription: TranscriptionResult = {
        id: Date.now().toString(),
        audioUrl: '', // Would be set if we saved the audio
        transcript: transcript,
        confidence: 0.95, // Mock confidence
        duration: 0, // Would be calculated from audio
        timestamp: new Date(),
        language: selectedLanguage,
        speaker: 'Client'
      };

      setTranscriptions(prev => [newTranscription, ...prev]);
      
      if (onTranscriptionComplete) {
        onTranscriptionComplete(newTranscription);
      }
    }
  }, [transcript, isProcessing, selectedLanguage, onTranscriptionComplete]);

  const handleMicClick = () => {
    if (isRecording) {
      stopRecording();
    } else {
      startRecording();
    }
  };

  const handleFileUpload = async (file: File) => {
    if (!file.type.startsWith('audio/')) {
      alert('Veuillez sélectionner un fichier audio valide');
      return;
    }

    try {
      // Create audio URL for playback
      const audioUrl = URL.createObjectURL(file);
      
      // Simulate transcription (in real app, send to Whisper API)
      const mockTranscript = "Transcription simulée du fichier audio uploadé. Bonjour, je cherche un canapé moderne pour mon salon.";
      
      const newTranscription: TranscriptionResult = {
        id: Date.now().toString(),
        audioUrl: audioUrl,
        transcript: mockTranscript,
        confidence: 0.92,
        duration: 15, // Mock duration
        timestamp: new Date(),
        language: selectedLanguage,
        speaker: 'Client (Fichier)'
      };

      setTranscriptions(prev => [newTranscription, ...prev]);
      
      if (onTranscriptionComplete) {
        onTranscriptionComplete(newTranscription);
      }

      if (autoSend && onSendMessage) {
        onSendMessage(mockTranscript);
      }

    } catch (error) {
      console.error('Erreur upload audio:', error);
      alert('Erreur lors du traitement du fichier audio');
    }
  };

  const playAudio = (transcription: TranscriptionResult) => {
    if (!transcription.audioUrl) return;

    if (isPlaying === transcription.id) {
      // Stop current audio
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
      setIsPlaying(null);
    } else {
      // Play new audio
      if (audioRef.current) {
        audioRef.current.pause();
      }
      
      const audio = new Audio(transcription.audioUrl);
      audioRef.current = audio;
      
      audio.onplay = () => setIsPlaying(transcription.id);
      audio.onended = () => setIsPlaying(null);
      audio.onerror = () => setIsPlaying(null);
      
      audio.play();
    }
  };

  const downloadTranscription = (transcription: TranscriptionResult) => {
    const content = `Transcription OmnIA
Date: ${transcription.timestamp.toLocaleString('fr-FR')}
Langue: ${transcription.language}
Confiance: ${Math.round(transcription.confidence * 100)}%
Durée: ${transcription.duration}s

Texte:
${transcription.transcript}`;

    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `transcription-${transcription.id}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const deleteTranscription = (id: string) => {
    setTranscriptions(prev => prev.filter(t => t.id !== id));
  };

  if (!isSupported) {
    return (
      <div className="bg-red-500/20 border border-red-400/50 rounded-2xl p-6">
        <h3 className="text-lg font-bold text-red-200 mb-2">❌ Reconnaissance vocale non supportée</h3>
        <p className="text-red-300 mb-4">
          Votre navigateur ne supporte pas la reconnaissance vocale. 
          Utilisez Chrome, Edge ou Safari pour cette fonctionnalité.
        </p>
        <div className="space-y-2 text-sm text-red-300">
          <p>• Chrome: Support complet</p>
          <p>• Edge: Support complet</p>
          <p>• Safari: Support partiel</p>
          <p>• Firefox: Non supporté</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header avec contrôles */}
      <div className="bg-white/10 backdrop-blur-xl rounded-2xl p-6 border border-white/20">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-xl font-bold text-white flex items-center gap-2">
            🎤 Module Speech-to-Text
          </h3>
          <button
            onClick={() => setShowSettings(!showSettings)}
            className="bg-gray-600 hover:bg-gray-700 text-white p-2 rounded-xl"
          >
            <Settings className="w-5 h-5" />
          </button>
        </div>

        {/* Contrôles principaux */}
        <div className="flex items-center gap-4 mb-6">
          <button
            onClick={handleMicClick}
            disabled={isProcessing}
            className={`relative p-4 rounded-2xl transition-all duration-300 shadow-lg border-2 ${
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
            
            {isRecording && (
              <div className="absolute inset-0 rounded-2xl border-2 border-red-400/30 animate-ping" />
            )}
          </button>

          <div className="flex-1">
            <div className="text-white font-semibold mb-1">
              {isRecording ? '🎤 Enregistrement en cours...' :
               isProcessing ? '🔄 Transcription avec Whisper...' :
               '🤖 Prêt à transcrire'}
            </div>
            <div className="text-gray-300 text-sm">
              {isRecording ? 'Parlez maintenant, cliquez pour arrêter' :
               isProcessing ? 'Analyse audio avec DeepSeek Whisper' :
               'Cliquez sur le micro pour commencer'}
            </div>
          </div>

          <input
            ref={fileInputRef}
            type="file"
            accept="audio/*"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) handleFileUpload(file);
            }}
            className="hidden"
          />
          
          <button
            onClick={() => fileInputRef.current?.click()}
            className="bg-purple-600 hover:bg-purple-700 text-white p-3 rounded-xl flex items-center gap-2"
            title="Uploader un fichier audio"
          >
            <Upload className="w-5 h-5" />
            Fichier
          </button>
        </div>

        {/* Transcript actuel */}
        {transcript && (
          <div className="bg-blue-500/20 border border-blue-400/50 rounded-xl p-4 mb-4">
            <h4 className="font-semibold text-blue-200 mb-2">📝 Transcription en cours:</h4>
            <p className="text-blue-100">{transcript}</p>
            {autoSend && onSendMessage && (
              <p className="text-blue-300 text-sm mt-2">✅ Sera envoyé automatiquement au chat</p>
            )}
          </div>
        )}

        {/* Erreur */}
        {error && (
          <div className="bg-red-500/20 border border-red-400/50 rounded-xl p-4 mb-4">
            <h4 className="font-semibold text-red-200 mb-2">❌ Erreur:</h4>
            <p className="text-red-300">{error}</p>
          </div>
        )}

        {/* Paramètres */}
        {showSettings && (
          <div className="bg-black/20 rounded-xl p-4 border border-gray-600/50">
            <h4 className="font-semibold text-white mb-4">⚙️ Paramètres STT</h4>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm text-gray-300 mb-2">Langue</label>
                <select
                  value={selectedLanguage}
                  onChange={(e) => setSelectedLanguage(e.target.value)}
                  className="w-full bg-black/40 border border-gray-600 rounded-xl px-3 py-2 text-white"
                >
                  <option value="fr-FR">Français</option>
                  <option value="en-US">English</option>
                  <option value="es-ES">Español</option>
                  <option value="de-DE">Deutsch</option>
                  <option value="it-IT">Italiano</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm text-gray-300 mb-2">Qualité audio</label>
                <select
                  value={audioQuality}
                  onChange={(e) => setAudioQuality(e.target.value as 'standard' | 'high')}
                  className="w-full bg-black/40 border border-gray-600 rounded-xl px-3 py-2 text-white"
                >
                  <option value="standard">Standard (16kHz)</option>
                  <option value="high">Haute (44kHz)</option>
                </select>
              </div>
              
              <div className="flex items-center gap-2 pt-6">
                <input
                  type="checkbox"
                  checked={autoSend}
                  onChange={() => {}} // Controlled by parent
                  className="w-4 h-4"
                />
                <label className="text-sm text-gray-300">Envoi automatique</label>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Historique des transcriptions */}
      <div className="bg-white/10 backdrop-blur-xl rounded-2xl p-6 border border-white/20">
        <h3 className="text-lg font-bold text-white mb-6">📋 Historique des transcriptions</h3>
        
        {transcriptions.length === 0 ? (
          <div className="text-center py-8">
            <Mic className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-300">Aucune transcription pour le moment</p>
            <p className="text-sm text-gray-400">Commencez un enregistrement ou uploadez un fichier audio</p>
          </div>
        ) : (
          <div className="space-y-4 max-h-96 overflow-y-auto">
            {transcriptions.map((transcription) => (
              <div key={transcription.id} className="bg-black/20 rounded-xl p-4 border border-white/10">
                <div className="flex justify-between items-start mb-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-full flex items-center justify-center">
                      <Mic className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <div className="font-semibold text-white">
                        {transcription.speaker || 'Client'}
                      </div>
                      <div className="text-gray-400 text-sm">
                        {transcription.timestamp.toLocaleString('fr-FR')} • 
                        Confiance: {Math.round(transcription.confidence * 100)}%
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex gap-2">
                    {transcription.audioUrl && (
                      <button
                        onClick={() => playAudio(transcription)}
                        className="text-blue-400 hover:text-blue-300 p-1"
                        title="Écouter l'audio"
                      >
                        {isPlaying === transcription.id ? (
                          <Pause className="w-4 h-4" />
                        ) : (
                          <Play className="w-4 h-4" />
                        )}
                      </button>
                    )}
                    
                    <button
                      onClick={() => downloadTranscription(transcription)}
                      className="text-green-400 hover:text-green-300 p-1"
                      title="Télécharger"
                    >
                      <Download className="w-4 h-4" />
                    </button>
                    
                    <button
                      onClick={() => deleteTranscription(transcription.id)}
                      className="text-red-400 hover:text-red-300 p-1"
                      title="Supprimer"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
                
                <div className="bg-white/5 rounded-lg p-3">
                  <p className="text-gray-200 leading-relaxed">{transcription.transcript}</p>
                </div>
                
                {onSendMessage && (
                  <button
                    onClick={() => onSendMessage(transcription.transcript)}
                    className="mt-3 bg-cyan-600 hover:bg-cyan-700 text-white px-4 py-2 rounded-lg text-sm flex items-center gap-2"
                  >
                    <Volume2 className="w-4 h-4" />
                    Envoyer au chat
                  </button>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Informations techniques */}
      <div className="bg-gradient-to-r from-cyan-500/20 to-blue-600/20 backdrop-blur-xl rounded-2xl p-6 border border-cyan-400/30">
        <h3 className="text-lg font-bold text-white mb-4">🔧 Informations techniques</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h4 className="font-semibold text-cyan-300 mb-2">🎤 Reconnaissance vocale:</h4>
            <ul className="text-cyan-200 text-sm space-y-1">
              <li>• API Whisper (DeepSeek) pour transcription</li>
              <li>• Support temps réel et fichiers audio</li>
              <li>• Langues: Français, Anglais, Espagnol, etc.</li>
              <li>• Formats: MP3, WAV, M4A, WebM</li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold text-cyan-300 mb-2">⚡ Fonctionnalités:</h4>
            <ul className="text-cyan-200 text-sm space-y-1">
              <li>• Transcription en temps réel</li>
              <li>• Upload de fichiers audio</li>
              <li>• Historique des transcriptions</li>
              <li>• Export en format texte</li>
              <li>• Intégration chat automatique</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};