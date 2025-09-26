const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
};

import { createClient } from 'npm:@supabase/supabase-js@2';

interface ProductEnrichmentRequest {
  products: any[];
  retailer_id: string;
  force_full_enrichment?: boolean;
  source_filter?: string;
  vendor_id?: string;
  enable_image_analysis?: boolean;
}

interface EnrichedAttributes {
  general_info: {
    title: string;
    brand: string;
    product_type: string;
    subcategory: string;
  };
  technical_specs: {
    dimensions?: string;
    seat_height?: string;
    bed_surface?: string;
    structure?: string;
    material: string;
    color: string;
    style: string;
    room: string;
    capacity?: string;
  };
  features: {
    convertible?: boolean;
    storage?: boolean;
    angle_reversible?: boolean;
    adjustable?: boolean;
    foldable?: boolean;
    extendable?: boolean;
  };
  seo_marketing: {
    seo_title: string;
    seo_description: string;
    ad_headline: string;
    ad_description: string;
    tags: string[];
    google_product_category: string;
  };
  ai_confidence: {
    overall: number;
    color: number;
    style: number;
    dimensions: number;
    material: number;
    category: number;
  };
  enrichment_source?: string;
}

/* -------------------- ENTRYPOINT -------------------- */
Deno.serve(async (req: Request) => {
  if (req.method === "GET") {
    return new Response(
      JSON.stringify({
        status: "OK",
        message: "Edge Function enrich-products-cron is running",
        timestamp: new Date().toISOString()
      }),
      { status: 200, headers: { "Content-Type": "application/json", ...corsHeaders } }
    );
  }

  if (req.method === "OPTIONS") {
    return new Response(null, { status: 200, headers: corsHeaders });
  }

  try {
    const { products, retailer_id, force_full_enrichment = false, vendor_id, enable_image_analysis = true }: ProductEnrichmentRequest = await req.json();

    console.log("🤖 [enrich-products-cron] Start enrichment:", {
      products_count: products?.length || 0,
      retailer_id,
      vendor_id,
      force_full_enrichment,
      enable_image_analysis
    });

    if (!products || products.length === 0) {
      return errorResponse("Aucun produit fourni pour enrichissement", 400);
    }

    // Vérification retailer_id
    if (!isValidUUID(retailer_id)) {
      return errorResponse(`Invalid retailer_id: ${retailer_id}`, 400);
    }

    // Init Supabase
    const supabaseUrl = Deno.env.get("SUPABASE_URL");
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
    if (!supabaseUrl || !supabaseKey) {
      return errorResponse("Configuration Supabase manquante", 500);
    }
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Produits actifs
    const activeProducts = products.filter(
      (p) => p.status === "active" && (p.stock > 0 || p.quantityAvailable > 0 || p.stock_qty > 0)
    );
    console.log(`📦 Produits actifs: ${activeProducts.length}/${products.length}`);

    const enrichedProducts = [];
    let successCount = 0;
    let errorCount = 0;

    for (const [index, product] of activeProducts.entries()) {
      try {
        console.log(`🔄 [${index + 1}/${activeProducts.length}] ${product.name?.substring(0, 60)}`);
        const enrichedAttr = await enrichProductWithAI(product, enable_image_analysis);
        const enrichedProduct = createEnrichedProduct(product, enrichedAttr, retailer_id || vendor_id!);
        enrichedProducts.push(enrichedProduct);
        successCount++;
      } catch (err) {
        console.error(`❌ Erreur enrichissement ${product.name}:`, err);
        errorCount++;
      }
    }

    // Sauvegarde
    if (enrichedProducts.length > 0) {
      const { error } = await supabase.from("products_enriched").upsert(enrichedProducts, {
        onConflict: "handle",
        ignoreDuplicates: false
      });
      if (error) console.warn("⚠️ Erreur Supabase:", error);
      else console.log("💾 Produits enrichis sauvegardés");
    }

    const stats = {
      products_processed: successCount,
      products_failed: errorCount,
      success_rate: Math.round((successCount / activeProducts.length) * 100),
      enriched_products: enrichedProducts.length,
      execution_time: new Date().toISOString(),
      retailer_id
    };

    return new Response(JSON.stringify({ success: true, stats }), {
      headers: { "Content-Type": "application/json", ...corsHeaders },
    });
  } catch (err) {
    console.error("❌ Global error:", err);
    return errorResponse(err.message, 500);
  }
});

/* -------------------- ENRICHMENT CORE -------------------- */
async function enrichProductWithAI(product: any, enableImageAnalysis: boolean): Promise<EnrichedAttributes> {
  const deepseekApiKey = Deno.env.get("DEEPSEEK_API_KEY");
  if (!deepseekApiKey) return enrichProductBasic(product);

  try {
    const prompt = `
PRODUIT: ${product.name || product.title}
DESCRIPTION: ${product.description || "Aucune"}
CATÉGORIE: ${product.category || product.productType}
PRIX: ${product.price || 0}€
MARQUE: ${product.vendor || product.brand}
TAGS: ${Array.isArray(product.tags) ? product.tags.join(", ") : product.tags || "Aucun"}
`;

    const response = await fetch("https://api.deepseek.com/chat/completions", {
      method: "POST",
      headers: { Authorization: `Bearer ${deepseekApiKey}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        model: "deepseek-chat",
        messages: [
          { role: "system", content: "Expert mobilier. Réponds uniquement JSON valide." },
          { role: "user", content: `Analyse produit et retourne JSON: ${prompt}` }
        ],
        max_tokens: 800,
        temperature: 0.1
      })
    });

    const data = await response.json();
    const content = data.choices[0]?.message?.content;
    if (!content) throw new Error("DeepSeek a renvoyé vide");

    const jsonMatch = content.match(/\{[\s\S]*\}/);
    const enriched: EnrichedAttributes = jsonMatch ? JSON.parse(jsonMatch[0]) : enrichProductBasic(product);

    if (enableImageAnalysis && product.image_url) {
      const vision = await analyzeProductImage(product.image_url);
      if (vision) {
        enriched.technical_specs = { ...enriched.technical_specs, ...vision };
        enriched.enrichment_source = "text_and_image";
      }
    }

    return enriched;
  } catch (err) {
    console.warn("⚠️ Fallback enrichissement basique:", err);
    return enrichProductBasic(product);
  }
}

/* -------------------- IMAGE ANALYSIS -------------------- */
async function analyzeProductImage(imageUrl: string) {
  const openaiApiKey = Deno.env.get("OPENAI_API_KEY");
  if (!openaiApiKey) return null;

  try {
    const res = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: { Authorization: `Bearer ${openaiApiKey}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        model: "gpt-4-vision-preview",
        messages: [
          {
            role: "user",
            content: [
              { type: "text", text: "Analyse cette image et retourne JSON { color, material, style, room }" },
              { type: "image_url", image_url: { url: imageUrl, detail: "low" } }
            ]
          }
        ]
      })
    });
    const data = await res.json();
    const content = data.choices[0]?.message?.content;
    const jsonMatch = content?.match(/\{[\s\S]*\}/);
    return jsonMatch ? JSON.parse(jsonMatch[0]) : null;
  } catch {
    return null;
  }
}

/* -------------------- FALLBACK BASIC -------------------- */
function enrichProductBasic(product: any): EnrichedAttributes {
  const text = `${product.name || ""} ${product.description || ""}`.toLowerCase();
  return {
    general_info: {
      title: product.name || "Sans titre",
      brand: product.vendor || "Inconnu",
      product_type: detectCategory(text),
      subcategory: detectSubcategory(text)
    },
    technical_specs: {
      material: detectMaterial(text) || "N/A",
      color: detectColor(text) || "N/A",
      style: detectStyle(text) || "Moderne",
      room: detectRoom(text) || "Salon",
      dimensions: extractDimensions(text)
    },
    features: {
      convertible: text.includes("convertible"),
      storage: text.includes("rangement"),
      adjustable: text.includes("réglable")
    },
    seo_marketing: {
      seo_title: (product.name || "").substring(0, 60),
      seo_description: (product.description || "").substring(0, 150),
      ad_headline: (product.name || "").substring(0, 25),
      ad_description: (product.description || "").substring(0, 80),
      tags: generateBasicTags(text),
      google_product_category: "696"
    },
    ai_confidence: { overall: 50, color: 40, style: 50, dimensions: 30, material: 40, category: 60 },
    enrichment_source: "text_only"
  };
}

/* -------------------- HELPERS -------------------- */
function isValidUUID(str: string) {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(str);
}
function errorResponse(msg: string, status: number) {
  return new Response(JSON.stringify({ success: false, error: msg }), {
    status,
    headers: { "Content-Type": "application/json", ...corsHeaders }
  });
}
function detectCategory(t: string) {
  if (t.includes("canapé") || t.includes("sofa")) return "Canapé";
  if (t.includes("table")) return "Table";
  if (t.includes("chaise") || t.includes("fauteuil")) return "Chaise";
  if (t.includes("lit")) return "Lit";
  if (t.includes("armoire") || t.includes("commode")) return "Rangement";
  return "Mobilier";
}
function detectSubcategory(t: string) {
  if (t.includes("angle")) return "Canapé d'angle";
  if (t.includes("convertible")) return "Canapé convertible";
  if (t.includes("basse")) return "Table basse";
  if (t.includes("manger")) return "Table à manger";
  return "";
}
function detectColor(t: string) {
  return ["blanc", "noir", "gris", "beige", "bleu", "vert", "rouge"].find((c) => t.includes(c)) || "";
}
function detectMaterial(t: string) {
  return ["bois", "métal", "verre", "tissu", "cuir", "velours"].find((m) => t.includes(m)) || "";
}
function detectStyle(t: string) {
  return ["moderne", "scandinave", "industriel", "vintage"].find((s) => t.includes(s)) || "";
}
function detectRoom(t: string) {
  return ["salon", "chambre", "cuisine", "bureau"].find((r) => t.includes(r)) || "";
}
function extractDimensions(t: string) {
  const m = t.match(/(\d+)\s*[x×]\s*(\d+)(?:\s*[x×]\s*(\d+))?\s*cm/);
  return m ? `L:${m[1]}cm × l:${m[2]}cm${m[3] ? ` × H:${m[3]}cm` : ""}` : "";
}
function generateBasicTags(t: string) {
  const tags = [];
  if (detectCategory(t) !== "Mobilier") tags.push(detectCategory(t).toLowerCase());
  if (detectMaterial(t)) tags.push(detectMaterial(t));
  if (detectColor(t)) tags.push(detectColor(t));
  if (t.includes("design")) tags.push("design");
  return tags;
}
function createEnrichedProduct(product: any, attr: EnrichedAttributes, retailerId: string) {
  return {
    id: product.id || `enriched-${Date.now()}`,
    handle: product.handle || generateHandle(product.name || ""),
    title: attr.general_info.title,
    description: product.description || "",
    category: att
