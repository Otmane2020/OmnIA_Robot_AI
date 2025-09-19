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
    
    let openaiResponse;
    
    if (deepseekApiKey) {
      // Essayer DeepSeek d'abord
      openaiResponse = await fetch("https://api.deepseek.com/chat/completions", {
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
          temperature: 0.9,
          stream: true,
        }),
      });
    }
    
    // Fallback vers OpenAI si DeepSeek échoue
    if (!openaiResponse || !openaiResponse.ok) {
      const openaiApiKey = Deno.env.get('OPENAI_API_KEY');
      if (!openaiApiKey) {
        throw new Error("Aucune API configurée");
      }
      
      openaiResponse = await fetch("https://api.openai.com/v1/chat/completions", {
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
          temperature: 0.9,
          stream: true,
        }),
      });
    }

    if (!openaiResponse.ok) {
      throw new Error("API error");
    }
      method: "POST",
      headers: {
        "Authorization": `Bearer ${Deno.env.get("DEEPSEEK_API_KEY")}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "deepseek-chat",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: message },
        ],
        max_tokens: 80,
        temperature: 0.9,
        stream: true, // ⚡️ Active le streaming
      }),
    }).catch(() => 
      // Fallback vers OpenAI si DeepSeek échoue
      fetch("https://api.openai.com/v1/chat/completions", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${Deno.env.get("OPENAI_API_KEY")}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "gpt-4o-mini",
          messages: [
            { role: "system", content: systemPrompt },
            { role: "user", content: message },
          ],
          max_tokens: 80,
          temperature: 0.9,
          stream: true,
        }),
      })
    );

    if (!openaiResponse.ok) {
      throw new Error("OpenAI API error");
    }

    // Renvoi en streaming vers le client
    const stream = new ReadableStream({
      async start(controller) {
        const reader = openaiResponse.body!.getReader();
        const decoder = new TextDecoder();
        let buffer = "";

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          buffer += decoder.decode(value, { stream: true });
          const parts = buffer.split("\n\n");

          for (const part of parts) {
            if (part.startsWith("data:")) {
              const json = part.replace("data: ", "").trim();
              if (json === "[DONE]") {
                controller.close();
                return;
              }
              try {
                const parsed = JSON.parse(json);
                const content = parsed.choices?.[0]?.delta?.content;
                if (content) {
                  controller.enqueue(
                    new TextEncoder().encode(content)
                  );
                }
              } catch (_) {}
            }
          }
        }
      },
    });

    return new Response(stream, {
      headers: {
        "Content-Type": "text/event-stream",
        ...corsHeaders,
      },
    });
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
