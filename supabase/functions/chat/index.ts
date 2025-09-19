const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
};

interface ChatRequest {
  message: string;
}

interface Product {
  id: string;
  title: string;
  description: string;
  price: number;
  image_url: string;
  stock_qty: number;
  is_published: boolean;
  status: string;
}

// ⚡️ Récupérer max 5 produits depuis Supabase
async function getProductsFromDB(query: string): Promise<Product[]> {
  try {
    const url = `${Deno.env.get("SUPABASE_URL")}/rest/v1/products?select=*&status=eq.active&is_published=eq.true&stock_qty=gt.0&or=(title.ilike.%25${encodeURIComponent(query)}%25,description.ilike.%25${encodeURIComponent(query)}%25)&limit=5`;
    const res = await fetch(url, {
      headers: {
        "apikey": Deno.env.get("SUPABASE_KEY")!,
        "Authorization": `Bearer ${Deno.env.get("SUPABASE_KEY")}`,
      },
    });
    if (!res.ok) return [];
    return await res.json();
  } catch (e) {
    console.error("DB fetch error:", e);
    return [];
  }
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { status: 200, headers: corsHeaders });
  }

  try {
    const { message }: ChatRequest = await req.json();

    // 🔎 Chercher produits correspondants
    const products = await getProductsFromDB(message);

    // Construire la liste de produits
    const productsList =
      products.length > 0
        ? products.map(p => `- ${p.title} (${p.price}€)`).join("\n")
        : "⚠️ Aucun produit trouvé, relance la discussion avec une question ou propose une catégorie proche.";

    // Prompt système
    const systemPrompt = `
Tu es OmnIA, vendeur de meubles Decora Home.
Tu parles comme un humain, pas comme un robot.

🎯 Règles :
- Si demande générale : poser une question avant de proposer.
- Si demande précise : proposer un produit trouvé dans le catalogue ci-dessous.
- Si aucun produit exact : proposer une alternative ou relancer la discussion.
- NE JAMAIS INVENTER DE PRODUIT.

Produits disponibles :
${productsList}
`;

    // 🚀 Streaming depuis OpenAI
    const deepseekApiKey = Deno.env.get('DEEPSEEK_API_KEY');
    
    let aiResponse;
    
    if (deepseekApiKey) {
      // Essayer DeepSeek d'abord
      console.log('🤖 Utilisation DeepSeek Chat...');
      aiResponse = await fetch("https://api.deepseek.com/chat/completions", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${deepseekApiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "deepseek-chat",
          messages: [
            { role: "system", content: systemPrompt },
            { role: "user", content: message },
          ],
          max_tokens: 80,
          temperature: 0.8,
          stream: false,
        }),
      });
      
      if (aiResponse.ok) {
        const data = await aiResponse.json();
        const responseText = data.choices[0]?.message?.content || "Comment puis-je vous aider ?";
        
        return new Response(
          JSON.stringify({ message: responseText }),
          {
            headers: {
              "Content-Type": "application/json",
              ...corsHeaders,
            },
          }
        );
      }
    }
    
    // Fallback vers OpenAI si DeepSeek échoue
    console.log('🔄 Fallback vers OpenAI...');
    if (!aiResponse || !aiResponse.ok) {
      const openaiApiKey = Deno.env.get('OPENAI_API_KEY');
      if (!openaiApiKey) {
        return new Response(
          JSON.stringify({ message: "Bonjour ! Je suis OmnIA. Comment puis-je vous aider ?" }),
          {
            headers: { "Content-Type": "application/json", ...corsHeaders },
          }
        );
      }
      
      aiResponse = await fetch("https://api.openai.com/v1/chat/completions", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${openaiApiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "gpt-4o-mini",
          messages: [
            { role: "system", content: systemPrompt },
            { role: "user", content: message },
          ],
          max_tokens: 80,
          temperature: 0.8,
          stream: false,
        }),
      });
    }

    if (!aiResponse.ok) {
      throw new Error("API error");
    }

    const data = await aiResponse.json();
    const responseText = data.choices[0]?.message?.content || "Comment puis-je vous aider ?";

    return new Response(
      JSON.stringify({ message: responseText }),
      {
        headers: {
          "Content-Type": "application/json",
          ...corsHeaders,
        },
      }
    );
  } catch (error) {
    console.error("Error in chat function:", error);

    return new Response(
      JSON.stringify({
        message: "Je rencontre un souci technique, peux-tu reformuler ?",
      }),
      {
        status: 200,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
});
