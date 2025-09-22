import { useState, useCallback, useRef, useEffect } from 'react';

interface WhisperSTTOptions {
  language?: string;
  model?: string;
  continuous?: boolean;
}

export const useWhisperSTT = (options: WhisperSTTOptions = {}) => {
  const [isRecording, setIsRecording] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isSupported, setIsSupported] = useState(false);
  
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const streamRef = useRef<MediaStream | null>(null);
  const recognitionRef = useRef<any>(null);
  const continuousMode = options.continuous || false;

  // Check browser support
  useEffect(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    setIsSupported(!!SpeechRecognition);
    
    if (!SpeechRecognition) {
      console.warn('❌ Reconnaissance vocale non supportée par ce navigateur');
    } else {
      setError(null);
      console.log('✅ Reconnaissance vocale supportée');
    }
  }, []);

  const startRecording = useCallback(async () => {
    try {
      setError(null);
      setTranscript('');
      
      console.log('🎤 Tentative démarrage enregistrement...');
      
      // Use browser speech recognition if supported and continuous mode
      if (isSupported && continuousMode) {
        console.log('🎤 Utilisation reconnaissance navigateur');
        return startBrowserRecognition();
      }
      
      console.log('🎤 Utilisation MediaRecorder pour Whisper');
      
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
      
      console.log('✅ Accès microphone accordé');
      streamRef.current = stream;
      audioChunksRef.current = [];
      
      // Créer MediaRecorder
      let mediaRecorder;
      try {
        mediaRecorder = new MediaRecorder(stream, {
          mimeType: 'audio/webm;codecs=opus'
        });
      } catch (error) {
        // Fallback si opus non supporté
        mediaRecorder = new MediaRecorder(stream);
      }
      
      mediaRecorderRef.current = mediaRecorder;
      
      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };
      
      mediaRecorder.onstop = async () => {
        setIsRecording(false);
        setIsProcessing(true);
        console.log('🔄 Arrêt enregistrement, début transcription...');
        
        try {
          // Créer le blob audio
          const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
          
          // Envoyer à Whisper API
          await transcribeWithWhisper(audioBlob);
          console.log('✅ Transcription terminée');
          
        } catch (error) {
          console.error('❌ Erreur transcription:', error);
          setError('Erreur lors de la transcription');
        } finally {
          setIsProcessing(false);
          // Nettoyer le stream
          if (streamRef.current) {
            streamRef.current.getTracks().forEach(track => track.stop());
            streamRef.current = null;
          }
        }
      };
      
      // Démarrer l'enregistrement
      mediaRecorder.start();
      setIsRecording(true);
      console.log('🎤 Enregistrement MediaRecorder démarré');
      console.log('🎤 Enregistrement démarré');
      
    } catch (error) {
      console.error('❌ Erreur démarrage enregistrement:', error);
      setError('Impossible d\'accéder au microphone');
    }
  }, [isSupported, continuousMode]);

  const startBrowserRecognition = useCallback(() => {
    if (!isSupported) return;

    console.log('🎤 Démarrage reconnaissance navigateur (continu:', continuousMode, ')...');

    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    const recognition = new SpeechRecognition();
    recognitionRef.current = recognition;

    // Configuration optimisée pour conversation
    recognition.continuous = continuousMode; // Écoute continue selon le mode
    recognition.interimResults = true; // Résultats intermédiaires pour feedback
    recognition.lang = options.language || 'fr-FR';
    recognition.maxAlternatives = 1;
    
    // Améliorer la précision pour le mobilier
    if ('webkitSpeechGrammarList' in window) {
      const grammar = '#JSGF V1.0; grammar mobilier; public <mobilier> = canapé | table | chaise | lit | armoire | commode | fauteuil | bureau | salon | chambre;';
      const speechRecognitionList = new (window as any).webkitSpeechGrammarList();
      speechRecognitionList.addFromString(grammar, 1);
      recognition.grammars = speechRecognitionList;
    }

    console.log('🎤 Configuration reconnaissance:', { 
      lang: recognition.lang, 
      continuous: recognition.continuous,
      interimResults: recognition.interimResults
    });

    recognition.onstart = () => {
      console.log('🎤 Reconnaissance vocale démarrée');
      setIsRecording(true);
      setError(null);
    };

    recognition.onresult = (event) => {
      let interimTranscript = '';
      let finalTranscript = '';
      
      for (let i = event.resultIndex; i < event.results.length; i++) {
        const result = event.results[i];
        const transcript = result[0].transcript;
        
        if (result.isFinal) {
          finalTranscript += transcript;
          console.log('🎤 Transcription finale:', transcript);
          console.log('🎤 Confiance:', result[0].confidence);
        } else {
          interimTranscript += transcript;
          console.log('🎤 Transcription intermédiaire:', transcript);
        }
      }
      
      // Utiliser la transcription finale si disponible, sinon l'intermédiaire
      const bestTranscript = finalTranscript || interimTranscript;
      
      if (bestTranscript.trim().length > 2) {
        setTranscript(bestTranscript.trim());
        
        // Arrêter automatiquement après transcription finale
        if (finalTranscript && !continuousMode) {
          setTimeout(() => recognition.stop(), 500);
        }
      }
    };

    recognition.onerror = (event) => {
      console.error('❌ Erreur reconnaissance vocale:', event.error);
      console.error('❌ Détails erreur:', event);
      
      if (event.error === 'not-allowed') {
        setError('🎤 Permission microphone refusée. Cliquez sur l\'icône 🔒 dans la barre d\'adresse et autorisez le microphone.');
      } else if (event.error === 'no-speech') {
        console.log('⚠️ Aucune parole détectée, redémarrage...');
        setError('🎤 Aucune parole détectée. Parlez plus fort ou rapprochez-vous du microphone.');
      } else if (event.error !== 'aborted') {
        setError(`🎤 Erreur reconnaissance: ${event.error}. Vérifiez votre microphone.`);
      }
      
      setIsRecording(false);
    };

    recognition.onend = () => {
      console.log('🎤 Reconnaissance vocale terminée');
      setIsRecording(false);
      recognitionRef.current = null;
      
      // Redémarrer automatiquement si en mode continu et pas d'erreur
      if (continuousMode && !error) {
        setTimeout(() => {
          if (recognitionRef.current && !isRecording) {
            try {
              recognition.start();
            } catch (error) {
              console.log('Impossible de redémarrer la reconnaissance');
            }
          }
        }, 1000);
      }
    };

    // Start recognition
    try {
      recognition.start();
      console.log('🎤 Reconnaissance démarrée avec succès');
    } catch (error) {
      console.error('❌ Erreur démarrage reconnaissance:', error);
      setError('Erreur démarrage reconnaissance vocale');
    }
  }, [isSupported, options.language, continuousMode]);

  const stopRecording = useCallback(() => {
    // Stop browser recognition
    if (recognitionRef.current) {
      console.log('🛑 Arrêt reconnaissance navigateur');
      
      try {
        recognitionRef.current.stop();
        recognitionRef.current = null;
      } catch (error) {
        console.log('Reconnaissance déjà arrêtée');
      }
    }
    
    // Stop media recorder
    if (mediaRecorderRef.current && isRecording) {
      console.log('🛑 Arrêt MediaRecorder');
      
      mediaRecorderRef.current.stop();
      console.log('🛑 Enregistrement arrêté');
    }
    
    setIsRecording(false);
  }, [isRecording]);

  const transcribeWithWhisper = async (audioBlob: Blob) => {
    try {
      const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
      const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

      console.log('🔄 Préparation envoi Whisper...');

      if (!supabaseUrl || !supabaseKey) {
        throw new Error('Supabase non configuré');
      }

      // Convertir en FormData pour Whisper
      const formData = new FormData();
      formData.append('audio', audioBlob, 'recording.webm');
      formData.append('model', options.model || 'whisper-1');
      formData.append('language', options.language || 'fr');
      
      console.log('📦 Taille audio:', audioBlob.size, 'bytes');

      console.log('🔄 Envoi à Whisper API...');

      const response = await fetch(`${supabaseUrl}/functions/v1/whisper-stt`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${supabaseKey}`
        },
        body: formData
      });

      if (!response.ok) {
        const errorData = await response.json();
        console.error('❌ Erreur Whisper détaillée:', errorData);
        throw new Error(errorData.error || 'Erreur Whisper API');
      }

      const result = await response.json();
      const transcribedText = result.text || '';
      
      console.log('✅ Transcription Whisper:', transcribedText);
      setTranscript(transcribedText);
      setError(null);
      
      return transcribedText;
      
    } catch (error) {
      console.error('❌ Erreur Whisper:', error);
      throw error;
    }
  };

  const reset = useCallback(() => {
    setTranscript('');
    setError(null);
    
    console.log('🔄 Reset STT');
    setIsRecording(false);
    setIsProcessing(false);
    
    // Stop browser recognition
    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
        console.log('🛑 Reconnaissance arrêtée lors du reset');
        recognitionRef.current = null;
      } catch (error) {
        console.log('Reconnaissance déjà arrêtée');
      }
    }
    
    // Nettoyer les ressources
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    
    if (mediaRecorderRef.current) {
      mediaRecorderRef.current = null;
    }
    
    audioChunksRef.current = [];
  }, []);

  return {
    isRecording,
    isProcessing,
    isSupported,
    transcript,
    error,
    startRecording,
    stopRecording,
    reset
  };
};