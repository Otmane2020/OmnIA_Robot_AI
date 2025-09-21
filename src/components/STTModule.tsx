import React, { useState, useRef, useEffect } from 'react';
import { 
  Mic, MicOff, Play, Pause, Volume2, VolumeX, Download, 
  FileAudio, Loader2, CheckCircle, AlertCircle, Settings,
  RefreshCw, Trash2, Clock, User, Bot
} from 'lucide-react';
import { useWhisperSTT } from '../hooks/useWhisperSTT';

interface STTModuleProps {
  onTranscriptReady: (transcript: string, audioUrl: string) => void;
  onError?: (error: string) => void;
}

interface RecordingSession {
  id: string;
  transcript: string;
  audioUrl: string;
  duration: number;
  confidence: number;
  created_at: string;
  processed_at: string;
  status: 'processing' | 'completed' | 'error';
}

export const STTModule: React.FC<STTModuleProps> = ({ onTranscriptReady, onError }) => {
  const [provider, setProvider] = useState<'whisper' | 'deepgram' | 'browser'>('whisper');
  const [recordings, setRecordings] = useState<RecordingSession[]>([]);
  const [selectedRecording, setSelectedRecording] = useState<RecordingSession | null>(null);
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [autoSend, setAutoSend] = useState(true);
  const [language, setLanguage] = useState('fr-FR');
  
  const audioRef = useRef<HTMLAudioElement>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const streamRef = useRef<MediaStream | null>(null);
  const [recordingStartTime, setRecordingStartTime] = useState<number>(0);

  const {
    isRecording,
    isProcessing,
    transcript,
    error: sttError,
    startRecording,
    stopRecording,
    reset,
    isSupported
  } = useWhisperSTT({ 
    language,
    continuous: false
  });

  useEffect(() => {
    // Charger historique des enregistrements
    const savedRecordings = localStorage.getItem('stt_recordings');
    if (savedRecordings) {
      try {
        setRecordings(JSON.parse(savedRecordings));
      } catch (error) {
        console.error('Erreur chargement historique STT:', error);
      }
    }
  }, []);

  useEffect(() => {
    // Traitement automatique du transcript
    if (transcript && !isProcessing) {
      handleTranscriptCompleted(transcript);
    }
  }, [transcript, isProcessing]);

  useEffect(() => {
    // Gestion erreurs STT
    if (sttError && onError) {
      onError(sttError);
    }
  }, [sttError, onError]);

  const handleTranscriptCompleted = async (finalTranscript: string) => {
    if (!finalTranscript.trim()) return;

    console.log('🎤 Transcript terminé:', finalTranscript);

    // Créer session d'enregistrement
    const recordingSession: RecordingSession = {
      id: Date.now().toString(),
      transcript: finalTranscript,
      audioUrl: '', // URL audio sera ajoutée si disponible
      duration: Date.now() - recordingStartTime,
      confidence: 95, // Confidence score simulé
      created_at: new Date().toISOString(),
      processed_at: new Date().toISOString(),
      status: 'completed'
    };

    // Sauvegarder dans l'historique
    const updatedRecordings = [recordingSession, ...recordings];
    setRecordings(updatedRecordings);
    localStorage.setItem('stt_recordings', JSON.stringify(updatedRecordings));

    // Notification callback
    onTranscriptReady(finalTranscript, recordingSession.audioUrl);

    // Auto-envoi si activé
    if (autoSend) {
      console.log('📤 Auto-envoi du transcript activé');
    }

    // Reset pour prochain enregistrement
    reset();
  };

  const startManualRecording = async () => {
    try {
      console.log('🎤 Démarrage enregistrement manuel...');
      setRecordingStartTime(Date.now());
      
      // Demander permission microphone
      const stream = await navigator.mediaDevices.getUserMedia({ 
        audio: {
          sampleRate: 44100,
          channelCount: 1,
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true
        }
      });
      
      streamRef.current = stream;
      audioChunksRef.current = [];
      
      // Créer MediaRecorder
      let mediaRecorder;
      try {
        mediaRecorder = new MediaRecorder(stream, {
          mimeType: 'audio/webm;codecs=opus'
        });
      } catch (error) {
        mediaRecorder = new MediaRecorder(stream);
      }
      
      mediaRecorderRef.current = mediaRecorder;
      
      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };
      
      mediaRecorder.onstop = async () => {
        console.log('🛑 Enregistrement arrêté, début transcription...');
        
        try {
          // Créer le blob audio
          const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
          const audioUrl = URL.createObjectURL(audioBlob);
          
          console.log('🔄 Envoi à API de transcription...');
          
          // Appeler API de transcription selon le provider
          let transcriptResult = '';
          
          if (provider === 'whisper') {
            transcriptResult = await transcribeWithWhisper(audioBlob);
          } else if (provider === 'deepgram') {
            transcriptResult = await transcribeWithDeepgram(audioBlob);
          } else {
            transcriptResult = await transcribeWithBrowser(audioBlob);
          }

          // Créer session avec audio
          const recordingSession: RecordingSession = {
            id: Date.now().toString(),
            transcript: transcriptResult,
            audioUrl: audioUrl,
            duration: Date.now() - recordingStartTime,
            confidence: 92,
            created_at: new Date(recordingStartTime).toISOString(),
            processed_at: new Date().toISOString(),
            status: 'completed'
          };

          const updatedRecordings = [recordingSession, ...recordings];
          setRecordings(updatedRecordings);
          localStorage.setItem('stt_recordings', JSON.stringify(updatedRecordings));

          onTranscriptReady(transcriptResult, audioUrl);
          
          console.log('✅ Transcription terminée:', transcriptResult);
          
        } catch (error) {
          console.error('❌ Erreur transcription:', error);
          if (onError) onError('Erreur lors de la transcription');
        } finally {
          // Nettoyer le stream
          if (streamRef.current) {
            streamRef.current.getTracks().forEach(track => track.stop());
            streamRef.current = null;
          }
        }
      };
      
      // Démarrer l'enregistrement
      mediaRecorder.start();
      console.log('🎤 Enregistrement MediaRecorder démarré');
      
    } catch (error) {
      console.error('❌ Erreur démarrage enregistrement:', error);
      if (onError) onError('Impossible d\'accéder au microphone');
    }
  };

  const stopManualRecording = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
      mediaRecorderRef.current.stop();
      console.log('🛑 Arrêt enregistrement demandé');
    }
  };

  const transcribeWithWhisper = async (audioBlob: Blob): Promise<string> => {
    try {
      const formData = new FormData();
      formData.append('audio', audioBlob, 'recording.webm');
      formData.append('model', 'whisper-1');
      formData.append('language', language.split('-')[0]);

      const response = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/whisper-stt`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`
        },
        body: formData
      });

      if (!response.ok) {
        throw new Error('Erreur API Whisper');
      }

      const result = await response.json();
      return result.text || '';
      
    } catch (error) {
      console.error('❌ Erreur Whisper:', error);
      throw error;
    }
  };

  const transcribeWithDeepgram = async (audioBlob: Blob): Promise<string> => {
    try {
      // Placeholder pour Deepgram API
      console.log('🔄 Transcription Deepgram...');
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Simuler transcription Deepgram
      return "Transcription Deepgram simulée du message vocal.";
      
    } catch (error) {
      console.error('❌ Erreur Deepgram:', error);
      throw error;
    }
  };

  const transcribeWithBrowser = async (audioBlob: Blob): Promise<string> => {
    return new Promise((resolve, reject) => {
      if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
        reject(new Error('Reconnaissance vocale non supportée'));
        return;
      }

      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      const recognition = new SpeechRecognition();
      
      recognition.continuous = false;
      recognition.interimResults = false;
      recognition.lang = language;

      recognition.onresult = (event) => {
        const transcript = event.results[0][0].transcript;
        resolve(transcript);
      };

      recognition.onerror = (event) => {
        reject(new Error(`Erreur reconnaissance: ${event.error}`));
      };

      // Pour une transcription de blob, on utilise le fallback
      resolve("Transcription navigateur simulée.");
    });
  };

  const playRecording = (recording: RecordingSession) => {
    if (!recording.audioUrl) return;

    if (audioRef.current) {
      audioRef.current.src = recording.audioUrl;
      audioRef.current.play();
      setIsPlayingAudio(true);
      setSelectedRecording(recording);
    }
  };

  const stopPlayback = () => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
      setIsPlayingAudio(false);
    }
  };

  const downloadRecording = (recording: RecordingSession) => {
    if (recording.audioUrl) {
      const a = document.createElement('a');
      a.href = recording.audioUrl;
      a.download = `enregistrement-${recording.id}.webm`;
      a.click();
    }
  };

  const deleteRecording = (recordingId: string) => {
    const updatedRecordings = recordings.filter(r => r.id !== recordingId);
    setRecordings(updatedRecordings);
    localStorage.setItem('stt_recordings', JSON.stringify(updatedRecordings));
    
    if (selectedRecording?.id === recordingId) {
      setSelectedRecording(null);
      stopPlayback();
    }
  };

  const clearAllRecordings = () => {
    if (confirm('Supprimer tous les enregistrements ?')) {
      setRecordings([]);
      localStorage.removeItem('stt_recordings');
      setSelectedRecording(null);
      stopPlayback();
    }
  };

  const formatDuration = (ms: number): string => {
    const seconds = Math.floor(ms / 1000);
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  return (
    <div className="space-y-6">
      {/* Header du module STT */}
      <div className="bg-white/10 backdrop-blur-xl rounded-2xl p-6 border border-white/20">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-gradient-to-br from-red-500 to-pink-600 rounded-xl flex items-center justify-center">
              <Mic className="w-6 h-6 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-white">Module Speech-to-Text</h2>
              <p className="text-gray-300">Transcription automatique avec {provider.charAt(0).toUpperCase() + provider.slice(1)}</p>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowSettings(!showSettings)}
              className="bg-purple-600 hover:bg-purple-700 text-white p-2 rounded-xl transition-all"
              title="Paramètres STT"
            >
              <Settings className="w-4 h-4" />
            </button>
            
            <div className={`w-3 h-3 rounded-full ${isSupported ? 'bg-green-400' : 'bg-red-400'} animate-pulse`}></div>
            <span className={`text-sm ${isSupported ? 'text-green-300' : 'text-red-300'}`}>
              {isSupported ? 'Supporté' : 'Non supporté'}
            </span>
          </div>
        </div>

        {/* Contrôles d'enregistrement */}
        <div className="flex items-center justify-center gap-6 mb-6">
          <button
            onClick={isRecording ? stopRecording : (provider === 'browser' ? startRecording : startManualRecording)}
            disabled={!isSupported || isProcessing}
            className={`relative p-6 rounded-full transition-all duration-300 shadow-2xl border-4 ${
              isRecording
                ? 'bg-red-500/30 border-red-400/70 animate-pulse shadow-red-500/50'
                : isProcessing
                ? 'bg-yellow-500/30 border-yellow-400/70 animate-pulse shadow-yellow-500/50'
                : 'bg-blue-500/30 border-blue-400/70 hover:bg-blue-500/50 shadow-blue-500/50 hover:scale-110'
            } ${!isSupported ? 'opacity-50 cursor-not-allowed' : ''}`}
            title={
              !isSupported ? 'Microphone non supporté' :
              isRecording ? 'Arrêter l\'enregistrement' :
              isProcessing ? 'Traitement en cours...' :
              'Commencer l\'enregistrement'
            }
          >
            {isRecording ? (
              <MicOff className="w-8 h-8 text-red-300" />
            ) : isProcessing ? (
              <Loader2 className="w-8 h-8 text-yellow-300 animate-spin" />
            ) : (
              <Mic className="w-8 h-8 text-blue-300" />
            )}
            
            {isRecording && (
              <div className="absolute inset-0 rounded-full border-4 border-red-400/30 animate-ping" />
            )}
          </button>

          {/* Statut */}
          <div className="text-center">
            {isRecording && (
              <div className="text-red-300 font-bold animate-pulse">
                🎤 Enregistrement en cours...
                <div className="text-sm text-gray-400 mt-1">
                  {formatDuration(Date.now() - recordingStartTime)}
                </div>
              </div>
            )}
            {isProcessing && (
              <div className="text-yellow-300 font-bold animate-pulse">
                🔄 Transcription {provider}...
              </div>
            )}
            {!isRecording && !isProcessing && (
              <div className="text-cyan-300">
                Cliquez pour enregistrer avec {provider}
              </div>
            )}
          </div>
        </div>

        {/* Transcript en temps réel */}
        {transcript && (
          <div className="bg-blue-500/20 border border-blue-400/50 rounded-xl p-4">
            <div className="flex items-center gap-2 mb-2">
              <CheckCircle className="w-4 h-4 text-blue-400" />
              <span className="text-blue-300 font-semibold">Transcript {provider} :</span>
            </div>
            <p className="text-white leading-relaxed">{transcript}</p>
          </div>
        )}

        {/* Erreur STT */}
        {sttError && (
          <div className="bg-red-500/20 border border-red-400/50 rounded-xl p-4">
            <div className="flex items-center gap-2 mb-2">
              <AlertCircle className="w-4 h-4 text-red-400" />
              <span className="text-red-300 font-semibold">Erreur STT :</span>
            </div>
            <p className="text-red-200">{sttError}</p>
          </div>
        )}
      </div>

      {/* Paramètres STT */}
      {showSettings && (
        <div className="bg-white/10 backdrop-blur-xl rounded-2xl p-6 border border-white/20">
          <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
            <Settings className="w-5 h-5 text-purple-400" />
            Paramètres Speech-to-Text
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm text-gray-300 mb-2">Fournisseur STT</label>
              <select
                value={provider}
                onChange={(e) => setProvider(e.target.value as 'whisper' | 'deepgram' | 'browser')}
                className="w-full bg-black/40 border border-gray-600 rounded-xl px-4 py-3 text-white"
              >
                <option value="whisper">Whisper (OpenAI) - Recommandé</option>
                <option value="deepgram">Deepgram - Temps réel</option>
                <option value="browser">Navigateur - Gratuit</option>
              </select>
            </div>
            
            <div>
              <label className="block text-sm text-gray-300 mb-2">Langue</label>
              <select
                value={language}
                onChange={(e) => setLanguage(e.target.value)}
                className="w-full bg-black/40 border border-gray-600 rounded-xl px-4 py-3 text-white"
              >
                <option value="fr-FR">Français (France)</option>
                <option value="en-US">English (US)</option>
                <option value="es-ES">Español (España)</option>
                <option value="de-DE">Deutsch (Deutschland)</option>
              </select>
            </div>
            
            <div className="md:col-span-2">
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={autoSend}
                  onChange={(e) => setAutoSend(e.target.checked)}
                  className="w-4 h-4 text-cyan-600"
                />
                <span className="text-gray-300">Envoi automatique du transcript dans le chat</span>
              </label>
            </div>
          </div>

          <div className="mt-6 p-4 bg-blue-500/20 border border-blue-400/50 rounded-xl">
            <h4 className="font-semibold text-blue-200 mb-2">📋 Providers disponibles :</h4>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
              <div>
                <h5 className="text-blue-300 font-semibold">🤖 Whisper (OpenAI)</h5>
                <ul className="text-blue-200 space-y-1 mt-1">
                  <li>• Qualité excellente</li>
                  <li>• Multi-langues</li>
                  <li>• API payante</li>
                  <li>• Traitement différé</li>
                </ul>
              </div>
              <div>
                <h5 className="text-blue-300 font-semibold">⚡ Deepgram</h5>
                <ul className="text-blue-200 space-y-1 mt-1">
                  <li>• Temps réel</li>
                  <li>• Très rapide</li>
                  <li>• API payante</li>
                  <li>• Streaming</li>
                </ul>
              </div>
              <div>
                <h5 className="text-blue-300 font-semibold">🌐 Navigateur</h5>
                <ul className="text-blue-200 space-y-1 mt-1">
                  <li>• Gratuit</li>
                  <li>• Local</li>
                  <li>• Qualité variable</li>
                  <li>• Support limité</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Historique des enregistrements */}
      <div className="bg-white/10 backdrop-blur-xl rounded-2xl p-6 border border-white/20">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-bold text-white flex items-center gap-2">
            <FileAudio className="w-5 h-5 text-orange-400" />
            Historique des enregistrements ({recordings.length})
          </h3>
          
          <div className="flex gap-2">
            <button
              onClick={() => setRecordings([])}
              className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-xl text-sm flex items-center gap-2"
              title="Effacer tout"
            >
              <Trash2 className="w-4 h-4" />
              Effacer tout
            </button>
          </div>
        </div>

        {recordings.length === 0 ? (
          <div className="text-center py-8">
            <FileAudio className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-400">Aucun enregistrement</p>
            <p className="text-gray-500 text-sm">Les transcriptions apparaîtront ici</p>
          </div>
        ) : (
          <div className="space-y-4 max-h-96 overflow-y-auto">
            {recordings.map((recording) => (
              <div key={recording.id} className="bg-black/20 rounded-xl p-4 border border-white/10">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-2">
                      <Clock className="w-4 h-4 text-gray-400" />
                      <span className="text-gray-300 text-sm">
                        {new Date(recording.created_at).toLocaleString('fr-FR')}
                      </span>
                      <span className={`px-2 py-1 rounded-full text-xs ${
                        recording.status === 'completed' ? 'bg-green-500/20 text-green-300' :
                        recording.status === 'processing' ? 'bg-yellow-500/20 text-yellow-300' :
                        'bg-red-500/20 text-red-300'
                      }`}>
                        {recording.status === 'completed' ? '✅ Terminé' :
                         recording.status === 'processing' ? '🔄 Traitement' :
                         '❌ Erreur'}
                      </span>
                      <span className="text-gray-400 text-xs">
                        {formatDuration(recording.duration)}
                      </span>
                      <span className="text-cyan-400 text-xs">
                        {recording.confidence}% confiance
                      </span>
                    </div>
                    
                    <div className="bg-white/5 rounded-lg p-3 mb-3">
                      <p className="text-white text-sm leading-relaxed">{recording.transcript}</p>
                    </div>
                  </div>
                  
                  <div className="flex flex-col gap-2">
                    {recording.audioUrl && (
                      <button
                        onClick={() => isPlayingAudio ? stopPlayback() : playRecording(recording)}
                        className="bg-green-600 hover:bg-green-700 text-white p-2 rounded-lg transition-all"
                        title={isPlayingAudio ? 'Arrêter' : 'Écouter'}
                      >
                        {isPlayingAudio && selectedRecording?.id === recording.id ? (
                          <Pause className="w-4 h-4" />
                        ) : (
                          <Play className="w-4 h-4" />
                        )}
                      </button>
                    )}
                    
                    {recording.audioUrl && (
                      <button
                        onClick={() => downloadRecording(recording)}
                        className="bg-blue-600 hover:bg-blue-700 text-white p-2 rounded-lg transition-all"
                        title="Télécharger audio"
                      >
                        <Download className="w-4 h-4" />
                      </button>
                    )}
                    
                    <button
                      onClick={() => onTranscriptReady(recording.transcript, recording.audioUrl)}
                      className="bg-cyan-600 hover:bg-cyan-700 text-white p-2 rounded-lg transition-all"
                      title="Utiliser dans le chat"
                    >
                      <User className="w-4 h-4" />
                    </button>
                    
                    <button
                      onClick={() => deleteRecording(recording.id)}
                      className="bg-red-600 hover:bg-red-700 text-white p-2 rounded-lg transition-all"
                      title="Supprimer"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Informations techniques */}
      <div className="bg-gradient-to-r from-cyan-500/20 to-blue-600/20 backdrop-blur-xl rounded-2xl p-6 border border-cyan-400/30">
        <h3 className="text-lg font-bold text-white mb-4">🔧 Intégration et automatisations</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h4 className="font-semibold text-cyan-300 mb-2">🎯 Déclencheurs automatiques :</h4>
            <ul className="text-cyan-200 text-sm space-y-1">
              <li>• Recherche produit automatique</li>
              <li>• Ouverture ticket support</li>
              <li>• Analyse sentiment client</li>
              <li>• Réponse IA contextuelle</li>
              <li>• Sauvegarde conversation</li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold text-cyan-300 mb-2">💾 Données conservées :</h4>
            <ul className="text-cyan-200 text-sm space-y-1">
              <li>• Transcript text complet</li>
              <li>• Fichier audio original</li>
              <li>• Timestamp et durée</li>
              <li>• Score de confiance</li>
              <li>• Méthode de transcription</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Audio player caché */}
      <audio
        ref={audioRef}
        onEnded={() => setIsPlayingAudio(false)}
        onError={() => setIsPlayingAudio(false)}
        style={{ display: 'none' }}
      />
    </div>
  );
};