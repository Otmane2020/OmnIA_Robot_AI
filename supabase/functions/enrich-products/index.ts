const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
};

import { createClient } from "npm:@supabase/supabase-js@2";

interface EnrichProductsRequest {
  products?: any[];
  retailer_id?: string;
  image_base64?: string;
  image_url?: string;
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { status: 200, headers: corsHeaders });
  }

  try {
    const { products, retailer_id, image_base64, image_url }: EnrichProductsRequest =
      await req.json();

    console.log("🤖 Enrichissement demandé...");

    // Cas analyse image
    if (image_base64 || image_url) {
      const analysis = await analyzeImageWithAI(image_base64, image_url);
      return new Response(JSON.stringify({ analysis, success: true }), {
        headers: { "Content-Type": "application/json", ...corsHeaders },
      });
    }

    // Cas enrichissement produits
    if (products && products.length > 0) {
      const enrichedResults = await enrichProductsWithAI(products, retailer_id);
      return new Response(
        JSON.stringify({
          success: true,
          enriched_products: enrichedResults,
          count: enrichedResults.length,
        }),
        { headers: { "Content-Type": "application/json", ...corsHeaders } },
      );
    }

    return new Response(
      JSON.stringify({ success: false, error: "Aucune donnée fournie" }),
      { status: 400, headers: { "Content-Type": "application/json", ...corsHeaders } },
    );
  } catch (error) {
    console.error("❌ Erreur enrich-products:", error);
    return new Response(
      JSON.stringify({
        success: false,
        error: "Erreur enrichissement IA",
        details: error.message,
      }),
      { status: 500, headers: { "Content-Type": "application/json", ...corsHeaders } },
    );
  }
});

/* -------------------- Analyse Image IA -------------------- */
async function analyzeImageWithAI(imageBase64?: string, imageUrl?: string): Promise<string> {
  try {
    const apiKey = Deno.env.get("OPENAI_API_KEY");
    if (!apiKey) throw new Error("OPENAI_API_KEY manquant");

    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        messages: [
          {
            role: "system",
            content: "Tu es un expert en mobilier et décoration. Analyse uniquement et renvoie du JSON clair.",
          },
          {
            role: "user",
            content: [
              { type: "text", text: "Analyse cette photo de pièce et propose attributs + recommandations" },
              imageBase64
                ? { type: "image_url", image_url: { url: `data:image/jpeg;base64,${imageBase64}` } }
                : { type: "image_url", image_url: { url: imageUrl! } },
            ],
          },
        ],
      }),
    });

    const data = await response.json();
    return data.choices?.[0]?.message?.content || "📸 Analyse non disponible.";
  } catch (err) {
    console.error("⚠️ Fallback analyse image:", err);
    return "📸 Analyse en cours... Votre espace a du potentiel !";
  }
}

/* -------------------- Enrichissement Produits -------------------- */
async function enrichProductsWithAI(products: any[], retailer_id?: string): Promise<any[]> {
  const supabaseUrl = Deno.env.get("SUPABASE_URL");
  const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
  const supabase = supabaseUrl && supabaseKey ? createClient(supabaseUrl, supabaseKey) : null;

  const enrichedResults = [];

  for (const product of products) {
    try {
      const attributes = await extractAttributesWithAI(product);

      const enriched = {
        ...product,
        extracted_attributes: attributes,
        enriched_at: new Date().toISOString(),
      };

      enrichedResults.push(enriched);

      if (retailer_id && supabase) {
        await supabase.from("ai_products").upsert({
          retailer_id,
          name: product.name,
          vendor: product.vendor || "unknown",
          extracted_attributes: attributes,
          enriched_at: new Date().toISOString(),
        });
      }
    } catch (err) {
      console.error("⚠️ Enrichissement basique:", err);
      enrichedResults.push({
        ...product,
        extracted_attributes: extractAttributesBasic(product),
        enriched_at: new Date().toISOString(),
      });
    }
  }

  return enrichedResults;
}

/* -------------------- Extraction via OpenAI -------------------- */
async function extractAttributesWithAI(product: any): Promise<any> {
  const apiKey = Deno.env.get("OPENAI_API_KEY");
  if (!apiKey) return extractAttributesBasic(product);

  const prompt = `Analyse ce produit mobilier et renvoie uniquement du JSON structuré :
Nom: ${product.name}
Description: ${product.description || ""}
Catégorie: ${product.category || ""}`;

  const res = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
    body: JSON.stringify({
      model: "gpt-4o-mini",
      messages: [
        { role: "system", content: "Expert mobilier. Réponds uniquement JSON valide." },
        { role: "user", content: prompt },
      ],
      temperature: 0.1,
    }),
  });

  const data = await res.json();
  try {
    return JSON.parse(data.choices[0]?.message?.content || "{}");
  } catch {
    return extractAttributesBasic(product);
  }
}

/* -------------------- Fallback extraction basique -------------------- */
function extractAttributesBasic(product: any): any {
  const text = `${product.name || ""} ${product.description || ""}`.toLowerCase();
  const colors = ["blanc", "noir", "gris", "beige", "marron", "bleu", "vert", "rouge", "taupe"].filter(c =>
    text.includes(c),
  );
  const materials = ["bois", "métal", "verre", "tissu", "cuir", "velours", "travertin", "marbre"].filter(m =>
    text.includes(m),
  );
  const styles = ["moderne", "contemporain", "scandinave", "industriel", "vintage", "classique"].filter(s =>
    text.includes(s),
  );
  const rooms = ["salon", "chambre", "cuisine", "bureau", "salle à manger"].filter(r => text.includes(r));

  return {
    colors,
    materials,
    styles,
    categories: [product.category || "mobilier"],
    room: rooms,
    priceRange: {
      min: product.price || 0,
      max: product.price || 0,
      currency: "EUR",
    },
  };
}
