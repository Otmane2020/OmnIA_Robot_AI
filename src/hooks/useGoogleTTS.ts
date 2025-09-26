import { useState, useCallback } from 'react';

export const useGoogleTTS = () => {
  const [isSpeaking, setIsSpeaking] = useState(false);

  const speak = useCallback(async (text: string) => {
    if (!text.trim()) return;

    setIsSpeaking(true);

    try {
      // Try DeepSeek TTS first
      await speakWithDeepSeek(text);
    } catch (error) {
      console.log('DeepSeek TTS fallback to browser TTS');
      // Fallback to browser TTS
      speakWithBrowser(text);
    } finally {
      setIsSpeaking(false);
    }
  }, []);

  const speakWithDeepSeek = async (text: string) => {
    if (!import.meta.env.VITE_SUPABASE_URL || !import.meta.env.VITE_SUPABASE_ANON_KEY) {
      console.log('Supabase not configured, using browser TTS');
      throw new Error('Supabase not configured');
    }

    try {
      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/google-tts`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ 
            text,
            voice: 'fr-FR-Wavenet-C',
            speed: 1.0
          }),
        }
      );

      if (!response.ok) {
        let errorMessage = `HTTP ${response.status}`;
        try {
          const errorData = await response.json();
          errorMessage += `: ${errorData.error || errorData.message || ''}`;
        } catch {
          // If response is not JSON, use status text
          errorMessage += `: ${response.statusText}`;
        }
        throw new Error(errorMessage);
      }

      const data = await response.json();
      
      if (data.audioContent) {
        // Play the audio
        const audio = new Audio(`data:audio/mp3;base64,${data.audioContent}`);
        await audio.play();
      } else {
        throw new Error('No audio content received');
      }
    } catch (error) {
      console.log(`DeepSeek TTS failed, falling back to browser TTS: ${error.message}`);
      throw error;
    }
  };

  const speakWithBrowser = (text: string) => {
    if ('speechSynthesis' in window) {
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = 'fr-FR';
      utterance.rate = 1.0;
      utterance.pitch = 1.0;
      
      utterance.onend = () => setIsSpeaking(false);
      utterance.onerror = () => setIsSpeaking(false);
      
      speechSynthesis.speak(utterance);
    } else {
      console.warn('Speech synthesis not supported');
      setIsSpeaking(false);
    }
  };

  const stopSpeaking = useCallback(() => {
    if ('speechSynthesis' in window) {
      speechSynthesis.cancel();
    }
    setIsSpeaking(false);
  }, []);

  return {
    speak,
    stopSpeaking,
    isSpeaking,
  };
};