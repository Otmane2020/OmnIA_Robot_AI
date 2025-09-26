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
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/openai-tts`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ 
            text,
            voice: 'alloy',
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

      // Get audio blob directly from response
      const audioBlob = await response.blob();
      const audioUrl = URL.createObjectURL(audioBlob);
      
      // Play the audio
      const audio = new Audio(audioUrl);
      
      // Clean up the object URL when audio finishes
      audio.onended = () => {
        URL.revokeObjectURL(audioUrl);
      };
      
      await audio.play();
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