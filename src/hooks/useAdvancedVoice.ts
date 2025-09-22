import { useState, useCallback, useRef } from 'react';

interface VoiceSettings {
  voiceId?: string;
  stability?: number;
  similarityBoost?: number;
  style?: number;
  useSpeakerBoost?: boolean;
}

interface AdvancedVoiceOptions {
  provider?: 'elevenlabs' | 'browser';
  voiceSettings?: VoiceSettings;
  language?: string;
}

export const useAdvancedVoice = (options: AdvancedVoiceOptions = {}) => {
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [currentVoice, setCurrentVoice] = useState<string>('elevenlabs');
  const [error, setError] = useState<string | null>(null);
  
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const speechRequestRef = useRef(false);

  const speak = useCallback(async (text: string) => {
    // Arrêter toute lecture en cours
    if (isSpeaking || speechRequestRef.current) {
      stopSpeaking();
    }

    if (!text || text.trim().length === 0) {
      console.log('❌ Texte vide, pas de synthèse vocale');
      return;
    }

    speechRequestRef.current = true;
    setIsLoading(true);
    setError(null);

    console.log('🎤 Démarrage synthèse vocale:', text.substring(0, 50) + '...');

    // Nettoyer le texte pour la synthèse vocale
    const cleanText = text
      .replace(/\*\*/g, '') // Supprimer le markdown gras
      .replace(/\*/g, '') // Supprimer le markdown italique
      .replace(/#{1,6}\s/g, '') // Supprimer les titres markdown
      .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1') // Convertir les liens markdown
      .replace(/`([^`]+)`/g, '$1') // Supprimer les backticks
      .replace(/\n+/g, '. ') // Remplacer les retours à la ligne par des points
      .replace(/\s+/g, ' ') // Normaliser les espaces
      .replace(/🤖|🛋️|🎨|💡|📏|✨|🏠|🎯|📍|👋|🔍|🎵|▶️|✅|⚠️|❌/g, '') // Supprimer emojis
      .trim();

    try {
      // Utiliser OpenAI TTS en priorité
      if (options.provider === 'openai' || options.provider === 'elevenlabs' || !options.provider) {
        await speakWithOpenAI(cleanText);
      } else if (options.provider === 'elevenlabs') {
        await speakWithElevenLabs(cleanText);
      } else {
        await speakWithBrowser(cleanText);
      }
    } catch (error) {
      console.error('❌ Erreur synthèse vocale:', error);
      setError(error.message);
      
      // Fallback vers synthèse navigateur
      console.log('🔄 Fallback vers synthèse navigateur');
      try {
        await speakWithBrowser(cleanText);
      } catch (fallbackError) {
        console.log('🔄 Fallback vers synthèse navigateur');
      }
    } finally {
      speechRequestRef.current = false;
      setIsLoading(false);
    }
  }, [options.provider, options.voiceSettings, options.language]);

  const speakWithOpenAI = async (text: string) => {
    const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
    const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

    if (!supabaseUrl || !supabaseKey) {
      throw new Error('Supabase non configuré');
    }

    console.log('🔊 Synthèse DeepSeek TTS...');
    
    const response = await fetch(`${supabaseUrl}/functions/v1/openai-tts`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${supabaseKey}`
      },
      body: JSON.stringify({
        text: text,
        voice: 'onyx', // Voix masculine plus grave
        model: 'tts-1', // tts-1 ou tts-1-hd
        speed: 1.1 // Vitesse légèrement plus rapide
      })
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Erreur DeepSeek TTS');
    }

    const audioBlob = await response.blob();
    const audioUrl = URL.createObjectURL(audioBlob);
    const audio = new Audio(audioUrl);
    audioRef.current = audio;

    return new Promise<void>((resolve, reject) => {
      audio.oncanplay = () => {
        setIsLoading(false);
        setIsSpeaking(true);
      };

      audio.onplay = () => {
        console.log('🎵 OmnIA parle avec DeepSeek TTS');
        setIsSpeaking(true);
        setIsLoading(false);
      };

      audio.onended = () => {
        console.log('✅ OmnIA a terminé de parler');
        setIsSpeaking(false);
        URL.revokeObjectURL(audioUrl);
        audioRef.current = null;
        resolve();
      };

      audio.onerror = (error) => {
        console.error('❌ Erreur lecture audio:', error);
        setIsSpeaking(false);
        setIsLoading(false);
        URL.revokeObjectURL(audioUrl);
        audioRef.current = null;
        reject(new Error('Erreur lecture audio'));
      };

      audio.play().catch(reject);
    });
  };

  const speakWithElevenLabs = async (text: string) => {
    const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
    const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

    if (!supabaseUrl || !supabaseKey) {
      throw new Error('Supabase non configuré');
    }

    console.log('🔊 Synthèse ElevenLabs...');
    
    const response = await fetch(`${supabaseUrl}/functions/v1/elevenlabs-tts`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${supabaseKey}`
      },
      body: JSON.stringify({
        text: text,
        voice_id: options.voiceSettings?.voiceId || 'EIe4oLyymVX7lKVYli9m',
        model_id: 'eleven_multilingual_v2',
        voice_settings: {
          stability: options.voiceSettings?.stability || 0.8,
          similarity_boost: options.voiceSettings?.similarityBoost || 0.95,
          style: options.voiceSettings?.style || 0.2,
          use_speaker_boost: options.voiceSettings?.useSpeakerBoost || true
        }
      })
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Erreur ElevenLabs');
    }

    const audioBlob = await response.blob();
    const audioUrl = URL.createObjectURL(audioBlob);
    const audio = new Audio(audioUrl);
    audioRef.current = audio;

    return new Promise<void>((resolve, reject) => {
      audio.oncanplay = () => {
        setIsLoading(false);
        setIsSpeaking(true);
      };

      audio.onplay = () => {
        console.log('🎵 Lecture ElevenLabs démarrée');
        setIsSpeaking(true);
        setIsLoading(false);
      };

      audio.onended = () => {
        console.log('✅ Lecture terminée');
        setIsSpeaking(false);
        URL.revokeObjectURL(audioUrl);
        audioRef.current = null;
        resolve();
      };

      audio.onerror = (error) => {
        console.error('❌ Erreur lecture audio:', error);
        setIsSpeaking(false);
        setIsLoading(false);
        URL.revokeObjectURL(audioUrl);
        audioRef.current = null;
        reject(new Error('Erreur lecture audio'));
      };

      audio.play().catch(reject);
    });
  };

  const speakWithBrowser = async (text: string) => {
    return new Promise<void>((resolve, reject) => {
      if (!('speechSynthesis' in window)) {
        reject(new Error('Synthèse vocale non supportée'));
        return;
      }

      // Arrêter toute synthèse en cours
      window.speechSynthesis.cancel();

      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = options.language || 'fr-FR';
      utterance.rate = 0.9;
      utterance.pitch = 1;
      utterance.volume = 1;

      // Essayer de trouver une voix française
      const voices = window.speechSynthesis.getVoices();
      const frenchVoice = voices.find(voice => 
        voice.lang.startsWith('fr') || voice.name.toLowerCase().includes('french')
      );

      if (frenchVoice) {
        utterance.voice = frenchVoice;
      }

      utterance.onstart = () => {
        console.log('🎵 Synthèse navigateur démarrée');
        setIsSpeaking(true);
        setIsLoading(false);
      };

      utterance.onend = () => {
        console.log('✅ Synthèse navigateur terminée');
        setIsSpeaking(false);
        resolve();
      };

      utterance.onerror = (event) => {
        console.error('❌ Erreur synthèse navigateur:', event);
        setIsSpeaking(false);
        resolve();
      };

      window.speechSynthesis.speak(utterance);
    });
  };

  const stopSpeaking = useCallback(() => {
    console.log('🛑 Arrêt synthèse vocale');

    // Arrêter ElevenLabs
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current = null;
    }

    // Arrêter synthèse navigateur
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }

    setIsSpeaking(false);
    setIsLoading(false);
    speechRequestRef.current = false;
  }, []);

  const setVoiceProvider = useCallback((provider: 'elevenlabs' | 'browser') => {
    setCurrentVoice(provider);
  }, []);

  return {
    speak,
    stopSpeaking,
    isSpeaking,
    isLoading,
    error,
    currentVoice,
    setVoiceProvider
  };
};