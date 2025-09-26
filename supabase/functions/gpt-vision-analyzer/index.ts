const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
};

import { createClient } from "npm:@supabase/supabase-js@2";

// ============ ENTRYPOINT ============
Deno.serve(async (req: Request) => {
  // Healthcheck
  if (req.method === "GET") {
    return new Response(
      JSON.stringify({
        status: "OK",
        message: "Edge Function gpt-vision-analyzer is running",
        timestamp: new Date().toISOString(),
      }),
      { status: 200, headers: { "Content-Type": "application/json", ...corsHeaders } }
    );
  }

  if (req.method === "OPTIONS") {
    return new Response(null, { status: 200, headers: corsHeaders });
  }

  try {
    console.log("🤖 CRON VISION QUOTIDIEN: démarrage...");
    const startTime = Date.now();

    // Init Supabase
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Récupérer les retailers actifs
    const { data: retailers, error: retailersError } = await supabase
      .from("retailers")
      .select("id, company_name, email, plan")
      .eq("status", "active");

    if (retailersError) throw retailersError;
    console.log("🏪 Retailers actifs:", retailers?.length || 0);

    let totalProducts = 0;
    let totalAnalyzed = 0;
    const results = [];

    for (const retailer of retailers || []) {
      try {
        console.log(`🔄 Retailer ${retailer.company_name} (${retailer.id})`);

        // Produits modifiés depuis 24h
        const { data: products } = await supabase
          .from("retailer_products")
          .select("*")
          .eq("retailer_id", retailer.id)
          .eq("status", "active")
          .gte("updated_at", new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString());

        if (!products || products.length === 0) {
          console.log(`⚠️ Aucun produit récent pour ${retailer.company_name}`);
          continue;
        }

        totalProducts += products.length;

        const analyzedProducts = [];
        for (const product of products) {
          if (!product.image_url) continue;

          const vision = await analyzeProductImage(product.image_url, product);
          analyzedProducts.push({ ...product, vision });
          totalAnalyzed++;
        }

        // Conversations récentes
        const { data: conversations } = await supabase
          .from("retailer_conversations")
          .select("*")
          .eq("retailer_id", retailer.id)
          .gte("created_at", new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString());

        // Entraînement
        const trainerRes = await fetch(`${supabaseUrl}/functions/v1/auto-ai-trainer`, {
          method: "POST",
          headers: {
            "Authorization": `Bearer ${supabaseKey}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            products: analyzedProducts,
            conversations: conversations || [],
            source: "cron-vision",
            store_id: retailer.id,
            trigger_type: "daily_cron",
            cron_time: new Date().toISOString(),
          }),
        });

        if (trainerRes.ok) {
          const trainerData = await trainerRes.json();
          results.push({
            retailer_id: retailer.id,
            company_name: retailer.company_name,
            success: true,
            products_processed: trainerData.stats?.products_processed || products.length,
            vision_used: analyzedProducts.length,
            conversations: conversations?.length || 0,
          });
          console.log(`✅ ${retailer.company_name}: ${analyzedProducts.length} images analysées`);
        } else {
          results.push({ retailer_id: retailer.id, company_name: retailer.company_name, success: false });
        }

        await new Promise((res) => setTimeout(res, 800)); // pause API

      } catch (err) {
        console.error(`❌ Retailer ${retailer.company_name}:`, err);
        results.push({
          retailer_id: retailer.id,
          company_name: retailer.company_name,
          success: false,
          error: err.message,
        });
      }
    }

    // Sauvegarde log
    await supabase.from("training_logs").insert({
      status: results.some((r) => r.success) ? "success" : "failed",
      log: JSON.stringify({
        type: "cron-vision",
        execution_time: new Date().toISOString(),
        retailers_processed: results.length,
        total_products: totalProducts,
        total_analyzed: totalAnalyzed,
        results,
      }),
      products_processed: totalProducts,
      conversations_analyzed: totalAnalyzed,
      trigger_type: "daily_cron",
      created_at: new Date().toISOString(),
    });

    const duration = Date.now() - startTime;
    return new Response(
      JSON.stringify({
        success: true,
        message: "CRON vision terminé",
        stats: { retailers: results.length, products: totalProducts, analyzed: totalAnalyzed, duration_ms: duration },
        results,
      }),
      { headers: { "Content-Type": "application/json", ...corsHeaders } }
    );
  } catch (error) {
    console.error("❌ Erreur CRON Vision:", error);
    return new Response(
      JSON.stringify({ success: false, error: error.message }),
      { status: 500, headers: { "Content-Type": "application/json", ...corsHeaders } }
    );
  }
});

// ============ GPT VISION ============
async function analyzeProductImage(imageUrl: string, product: any) {
  const openaiKey = Deno.env.get("OPENAI_API_KEY");
  if (!openaiKey) return null;

  try {
    const res = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: { Authorization: `Bearer ${openaiKey}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        model: "gpt-4-vision-preview",
        messages: [
          {
            role: "user",
            content: [
              { type: "text", text: `Analyse cette image de mobilier. Réponds en JSON strict :
{ "color": "string", "material": "string", "style": "string", "room": "string" }` },
              { type: "image_url", image_url: { url: imageUrl, detail: "low" } },
            ],
          },
        ],
        max_tokens: 300,
      }),
    });

    if (!res.ok) throw new Error(`Vision API status ${res.status}`);
    const data = await res.json();
    const content = data.choices[0]?.message?.content;
    const match = content?.match(/\{[\s\S]*\}/);
    return match ? JSON.parse(match[0]) : null;
  } catch (err) {
    console.warn("⚠️ Vision fail:", err);
    return null;
  }
}
