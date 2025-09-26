const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
};

import { createClient } from "npm:@supabase/supabase-js@2";

interface UnifiedChatRequest {
  message: string;
  retailer_id?: string;
  session_id?: string;
  user_id?: string;
  conversation_context?: Array<{ role: "user" | "assistant"; content: string }>;
}

const DEFAULT_RETAILER_ID = "00000000-0000-0000-0000-000000000000";

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { status: 200, headers: corsHeaders });
  }

  try {
    const {
      message,
      retailer_id = DEFAULT_RETAILER_ID,
      session_id = crypto.randomUUID(),
      user_id,
      conversation_context = [],
    }: UnifiedChatRequest = await req.json();

    console.log("🤖 [UnifiedChat] Message reçu:", message);

    const openaiApiKey = Deno.env.get("OPENAI_API_KEY");
    if (!openaiApiKey) {
      return new Response(
        JSON.stringify({
          message:
            "Bonjour ! Je suis OmnIA, votre conseiller mobilier. Que cherchez-vous pour votre intérieur ?",
          products: [],
          fallback: true,
        }),
        { headers: { "Content-Type": "application/json", ...corsHeaders } },
      );
    }

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
    );

    // 1️⃣ Recherche produits pertinents
    const relevantProducts = await getRelevantProductsForQuery(
      message,
      retailer_id,
    );

    // 2️⃣ Réponse IA
    const aiResponse = await generateExpertResponse(
      message,
      relevantProducts,
      conversation_context,
      openaiApiKey,
    );

    // Forcer l’affichage de produits si IA n’en renvoie pas
    if (aiResponse.selectedProducts.length === 0 &&
      relevantProducts.length > 0) {
      aiResponse.selectedProducts = relevantProducts.slice(0, 2);
      aiResponse.should_show_products = true;
    }

    // 3️⃣ Sauvegarde dans Supabase
    await saveConversation(supabase, {
      user_id,
      session_id,
      retailer_id,
      message,
      intent: analyzeProductIntent(message),
      response: aiResponse.message,
      products: aiResponse.selectedProducts,
    });

    return new Response(
      JSON.stringify({
        message: aiResponse.message,
        products: aiResponse.selectedProducts,
        should_show_products: aiResponse.should_show_products,
        filtered_count: relevantProducts.length,
      }),
      { headers: { "Content-Type": "application/json", ...corsHeaders } },
    );
  } catch (error) {
    console.error("❌ Erreur unified-chat:", error);

    return new Response(
      JSON.stringify({
        message: "Petit souci technique 😅 pouvez-vous reformuler ?",
        products: [],
        fallback: true,
      }),
      { headers: { "Content-Type": "application/json", ...corsHeaders } },
    );
  }
});

/* ------------------ HELPERS ------------------ */

async function getRelevantProductsForQuery(query: string, retailerId: string) {
  try {
    console.log("🔍 Recherche produits pour:", query);
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
    );

    const productIntent = analyzeProductIntent(query);
    const extractedAttributes = extractAttributesFromQuery(query);

    let qb = supabase.from("products_enriched")
      .select(
        "id, handle, title, description, category, subcategory, color, material, fabric, style, dimensions, room, price, stock_qty, image_url, product_url, confidence_score, enriched_at",
      )
      .gt("stock_qty", 0);

    // Filtrage retailer
    const isUuid = /^[0-9a-f-]{36}$/i.test(retailerId);
    if (retailerId && isUuid) qb = qb.eq("retailer_id", retailerId);

    if (productIntent.category) {
      qb = qb.or(
        `category.ilike.%${productIntent.category}%,subcategory.ilike.%${productIntent.category}%`,
      );
    }
    if (extractedAttributes.colors.length > 0) {
      qb = qb.or(
        extractedAttributes.colors.map((c) => `color.ilike.%${c}%`).join(","),
      );
    }
    if (extractedAttributes.materials.length > 0) {
      qb = qb.or(
        extractedAttributes.materials.map((m) =>
          `material.ilike.%${m}%,fabric.ilike.%${m}%`
        ).join(","),
      );
    }

    qb = qb.order("confidence_score", { ascending: false }).limit(5);

    const { data: enrichedData, error } = await qb;
    if (error) console.error("❌ Erreur DB:", error);

    return enrichedData || [];
  } catch (err) {
    console.error("❌ Erreur recherche produits:", err);
    return [];
  }
}

function analyzeProductIntent(query: string) {
  const lower = query.toLowerCase();
  const map: Record<string, string[]> = {
    canapé: ["canapé", "sofa"],
    table: ["table", "manger", "basse"],
    chaise: ["chaise", "fauteuil"],
    lit: ["lit", "matelas"],
    rangement: ["armoire", "commode"],
    "meuble tv": ["meuble tv", "télé"],
  };

  for (const [cat, words] of Object.entries(map)) {
    if (words.some((w) => lower.includes(w))) return { category: cat };
  }
  return { category: null };
}

function extractAttributesFromQuery(query: string) {
  const lower = query.toLowerCase();
  const colors = ["blanc", "noir", "gris", "beige", "bleu", "vert", "rouge"]
    .filter((c) => lower.includes(c));
  const materials = ["bois", "marbre", "travertin", "métal", "acier", "verre"]
    .filter((m) => lower.includes(m));
  return { colors, materials, dimensions: [] };
}

async function generateExpertResponse(
  query: string,
  products: any[],
  context: any[],
  apiKey: string,
) {
  const productsContext = products.length > 0
    ? products.map((p) => `• ${p.title} - ${p.price}€`).join("\n")
    : "Aucun produit trouvé.";

  const systemPrompt = `Tu es OmnIA, conseiller déco. Réponds court (2 phrases max). 
Propose toujours des produits si disponibles.
Produits dispo : 
${productsContext}`;

  const messages = [
    { role: "system", content: systemPrompt },
    ...context.slice(-2),
    { role: "user", content: query },
  ];

  const resp = await fetch("https://api.deepseek.com/chat/completions", {
    method: "POST",
    headers: { "Authorization": `Bearer ${apiKey}`, "Content-Type": "application/json" },
    body: JSON.stringify({ model: "deepseek-chat", messages, max_tokens: 120 }),
  });

  const data = await resp.json();
  const msg = data.choices?.[0]?.message?.content || "Pouvez-vous préciser ?";
  return { message: msg, selectedProducts: products.slice(0, 2), should_show_products: products.length > 0 };
}

async function saveConversation(supabase: any, data: any) {
  try {
    await supabase.from("retailer_conversations").insert({
      user_id: data.user_id,
      session_id: data.session_id,
      retailer_id: data.retailer_id,
      message: data.message,
      intent: data.intent?.category,
      response: data.response,
      products: data.products,
      timestamp: new Date().toISOString(),
    });
    console.log("💾 Conversation sauvegardée");
  } catch (err) {
    console.error("❌ Erreur sauvegarde conversation:", err);
  }
}
