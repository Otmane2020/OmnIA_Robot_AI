const handleSendMessage = async (messageText: string, mode: "search" | "chat" = "chat") => {
  if (!messageText.trim()) return;

  const userMessage: ChatMessageType = {
    id: Date.now().toString(),
    content: messageText,
    isUser: true,
    timestamp: new Date(),
  };
  setMessages(prev => [...prev, userMessage]);
  setInputMessage('');
  setIsTyping(true);

  try {
    const endpoint = mode === "search"
      ? `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/ai-smart-search`
      : `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/chatgpt-smart-query`;

    const response = await fetch(endpoint, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ query: messageText, message: messageText }),
    });

    let aiResponse = "";
    let foundProducts: Product[] = [];

    if (response.ok) {
      const data = await response.json();
      foundProducts = data.results || data.products || [];
      aiResponse = data.message || `Voici ${foundProducts.length} produit(s) correspondant(s).`;
    } else {
      aiResponse = "⚠️ Erreur technique lors de la recherche.";
    }

    const botMessage: ChatMessageType = {
      id: (Date.now() + 1).toString(),
      content: aiResponse,
      isUser: false,
      timestamp: new Date(),
      products: foundProducts,
    };

    setMessages(prev => [...prev, botMessage]);
    setProducts(foundProducts);
    speak(aiResponse);
  } catch (error) {
    console.error("❌ Erreur Robot:", error);
  } finally {
    setIsTyping(false);
  }
};
