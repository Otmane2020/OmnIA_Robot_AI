const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
};

import { createClient } from 'npm:@supabase/supabase-js@2';

interface SmartQueryRequest {
  message: string;
  user_id?: string;
  session_id?: string;
  retailer_id?: string;
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { status: 200, headers: corsHeaders });
  }

  try {
    const { message, user_id, session_id, retailer_id = 'default' }: SmartQueryRequest = await req.json();
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    );

    // 🔍 Filtrer les vrais produits
    const { data: products } = await supabase
      .from('imported_products')
      .select('external_id, name, description, price, category, vendor, image_url, stock, extracted_attributes')
      .eq('retailer_id', retailer_id)
      .eq('status', 'active')
      .gt('stock', 0)
      .limit(5);

    const enriched = (products || []).map(p => {
      const attrs = p.extracted_attributes || {};
      return {
        id: p.external_id,
        name: p.name,
        description: p.description,
        price: p.price,
        category: p.category,
        vendor: p.vendor,
        image_url: p.image_url,
        stock: p.stock,
        ai_attributes: {
          colors: attrs.colors || [],
          materials: attrs.materials || [],
          dimensions: attrs.dimensions || {},
          styles: attrs.styles || [],
          features: attrs.features || [],
          room: attrs.room || [],
          confidence_score: attrs.confidence_score || 0,
        },
        seo_optimized: {
          title: attrs.seo_title || "",
          description: attrs.seo_description || "",
          tags: attrs.seo_tags || [],
        },
      };
    });

    // 🧠 GPT génère la réponse courte vendeur
    const openaiApiKey = Deno.env.get("OPENAI_API_KEY");
    const systemPrompt = `Tu es OmnIA, vendeur expert Decora Home. 
Réponds comme un vendeur humain chaleureux en 20 mots max, 
propose le produit le plus pertinent avec prix et termine par une question engageante.`;

    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${openaiApiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: message },
        ],
        max_tokens: 60,
        temperature: 0.8,
      }),
    });

    const data = await response.json();
    const aiMessage = data.choices[0]?.message?.content || "Comment puis-je vous aider ?";

    return new Response(
      JSON.stringify({
        message: aiMessage,
        products: enriched,
        should_show_products: enriched.length > 0,
        conversation_id: crypto.randomUUID(),
      }),
      { headers: { "Content-Type": "application/json", ...corsHeaders } }
    );
  } catch (error) {
    return new Response(
      JSON.stringify({ message: "Erreur technique.", products: [], error: true }),
      { status: 500, headers: { "Content-Type": "application/json", ...corsHeaders } }
    );
  }
});
