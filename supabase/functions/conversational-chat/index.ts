import { useState, useCallback } from "react";

interface ConversationMessage {
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
}

interface ConversationalAIOptions {
  maxContextLength?: number;
  temperature?: number;
  model?: string;
}

export const useConversationalAI = (options: ConversationalAIOptions = {}) => {
  const [isThinking, setIsThinking] = useState(false);
  const [conversationHistory, setConversationHistory] = useState<ConversationMessage[]>([]);
  const [error, setError] = useState<string | null>(null);

  const maxContextLength = options.maxContextLength || 10;
  const temperature = options.temperature || 0.7;
  const model = options.model || "gpt-4o-mini";

  const sendMessage = useCallback(
    async (userMessage: string): Promise<string> => {
      if (!userMessage.trim()) {
        throw new Error("Message vide");
      }

      setIsThinking(true);
      setError(null);

      try {
        const userMsg: ConversationMessage = {
          role: "user",
          content: userMessage,
          timestamp: new Date(),
        };

        const contextMessages = [...conversationHistory, userMsg]
          .slice(-maxContextLength)
          .map((msg) => ({
            role: msg.role,
            content: msg.content,
          }));

        console.log("📡 Envoi au serveur conversational-chat avec", contextMessages.length, "messages");

        const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
        const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

        if (!supabaseUrl || !supabaseKey) {
          throw new Error("Supabase non configuré");
        }

        const response = await fetch(`${supabaseUrl}/functions/v1/conversational-chat`, {
          method: "POST",
          headers: {
            Authorization: `Bearer ${supabaseKey}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            messages: contextMessages,
            model,
            temperature,
            max_tokens: 300,
          }),
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || "Erreur ChatGPT API");
        }

        const result = await response.json();
        const aiResponse = result.message || "Je n’ai pas pu comprendre votre demande.";

        const assistantMsg: ConversationMessage = {
          role: "assistant",
          content: aiResponse,
          timestamp: new Date(),
        };

        setConversationHistory((prev) => [...prev, userMsg, assistantMsg]);

        return aiResponse;
      } catch (err: any) {
        console.error("❌ Erreur ChatGPT:", err);
        setError(err.message);
        throw err;
      } finally {
        setIsThinking(false);
      }
    },
    [conversationHistory, maxContextLength, temperature, model]
  );

  const clearHistory = useCallback(() => {
    setConversationHistory([]);
    setError(null);
  }, []);

  return {
    isThinking,
    conversationHistory,
    error,
    sendMessage,
    clearHistory,
  };
};
