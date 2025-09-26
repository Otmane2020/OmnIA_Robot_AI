const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
};

import { createClient } from "npm:@supabase/supabase-js@2";

interface TrainingRequest {
  csvData: string;
  isIncremental?: boolean;
}

interface ExtractedAttributes {
  colors: string[];
  materials: string[];
  dimensions: {
    length?: number;
    width?: number;
    height?: number;
    depth?: number;
    seatHeight?: number;
    diameter?: number;
    unit: string;
  };
  styles: string[];
  categories: string[];
  priceRange: {
    min?: number;
    max?: number;
    currency: string;
  };
  features: string[];
  room: string[];
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { status: 200, headers: corsHeaders });
  }

  try {
    const { csvData, isIncremental = false }: TrainingRequest = await req.json();

    console.log("🤖 Démarrage entraînement IA catalogue...");
    console.log("📊 Mode incrémental:", isIncremental);

    // Init Supabase
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Parse CSV
    const products = parseCSVData(csvData);
    console.log("📦 Produits parsés:", products.length);

    const processedProducts = [];

    for (const product of products) {
      console.log(`🔍 Traitement: ${product.name?.substring(0, 40)}...`);

      const attributes = await extractAttributesWithAI(product);

      const processedProduct = {
        ...product,
        extracted_attributes: attributes,
        processed_at: new Date().toISOString(),
        confidence_score: calculateConfidenceScore(attributes),
      };

      processedProducts.push(processedProduct);
    }

    // Si full retrain → vider la table
    if (!isIncremental) {
      await supabase.from("ai_products").delete().neq("id", "");
    }

    // Upsert produits
    const { error: insertError } = await supabase
      .from("ai_products")
      .upsert(processedProducts, { onConflict: "name,vendor" });

    if (insertError) {
      console.error("❌ Erreur insertion:", insertError);
      throw insertError;
    }

    // Update training metadata
    await updateTrainingMetadata(supabase, processedProducts.length, isIncremental);

    console.log("✅ Entraînement terminé:", processedProducts.length, "produits");

    return new Response(
      JSON.stringify({
        success: true,
        message: `Entraînement IA terminé ! ${processedProducts.length} produits traités.`,
        stats: {
          products_processed: processedProducts.length,
          training_mode: isIncremental ? "incremental" : "full",
          processed_at: new Date().toISOString(),
        },
      }),
      { headers: { "Content-Type": "application/json", ...corsHeaders } }
    );
  } catch (error) {
    console.error("❌ Erreur entraînement IA:", error);

    return new Response(
      JSON.stringify({
        success: false,
        error: "Erreur lors de l'entraînement IA du catalogue",
        details: error.message,
      }),
      { status: 500, headers: { "Content-Type": "application/json", ...corsHeaders } }
    );
  }
});

function parseCSVData(csvContent: string): any[] {
  const lines = csvContent.trim().split("\n");
  if (lines.length < 2) throw new Error("CSV invalide - minimum 2 lignes requises");

  const headers = lines[0].split(",").map((h) => h.trim().replace(/"/g, ""));
  const products = [];

  for (let i = 1; i < lines.length; i++) {
    if (!lines[i].trim()) continue;

    const values = parseCSVLine(lines[i]);
    const product: any = {};

    headers.forEach((header, index) => {
      const value = values[index]?.trim().replace(/"/g, "") || "";

      switch (header.toLowerCase()) {
        case "nom":
        case "name":
        case "title":
          product.name = value;
          break;
        case "prix":
        case "price":
          product.price = parseFloat(value.replace(/[^\d.,]/g, "").replace(",", ".")) || 0;
          break;
        case "description":
          product.description = value;
          break;
        case "categorie":
        case "category":
        case "type":
          product.category = value;
          break;
        case "image_url":
        case "image":
          product.image_url = value;
          break;
        case "url_produit":
        case "product_url":
        case "url":
          product.product_url = value;
          break;
        case "stock":
        case "quantity":
          product.stock = parseInt(value) || 0;
          break;
        case "marque":
        case "vendor":
        case "brand":
          product.vendor = value;
          break;
        default:
          product[header] = value;
      }
    });

    if (product.name) products.push(product);
  }

  return products;
}

function parseCSVLine(line: string): string[] {
  const result = [];
  let current = "";
  let inQuotes = false;

  for (let i = 0; i < line.length; i++) {
    const char = line[i];

    if (char === '"') {
      inQuotes = !inQuotes;
    } else if (char === "," && !inQuotes) {
      result.push(current);
      current = "";
    } else {
      current += char;
    }
  }

  result.push(current);
  return result;
}

async function extractAttributesWithAI(product: any): Promise<ExtractedAttributes> {
  const apiKey = Deno.env.get("OPENAI_API_KEY");
  if (!apiKey) {
    console.log("⚠️ OpenAI non configuré, fallback basic");
    return extractAttributesBasic(product);
  }

  let textAttrs: ExtractedAttributes = extractAttributesBasic(product);
  let visionAttrs: Partial<ExtractedAttributes> = {};

  try {
    // --- Analyse texte ---
    const textPrompt = `Analyse ce produit mobilier et retourne les attributs JSON strict.
Nom: ${product.name}
Description: ${product.description || ""}
Catégorie: ${product.category || ""}
Prix: ${product.price || 0}€`;

    const textRes = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        messages: [
          { role: "system", content: "Tu es un expert en mobilier. Réponds uniquement en JSON valide." },
          { role: "user", content: textPrompt },
        ],
        temperature: 0.1,
      }),
    });

    if (textRes.ok) {
      const data = await textRes.json();
      const content = data.choices[0]?.message?.content?.trim();
      if (content) textAttrs = { ...textAttrs, ...JSON.parse(content) };
    }

    // --- Analyse image si dispo ---
    if (product.image_url) {
      const visionRes = await fetch("https://api.openai.com/v1/chat/completions", {
        method: "POST",
        headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
        body: JSON.stringify({
          model: "gpt-4-vision-preview",
          messages: [
            {
              role: "user",
              content: [
                { type: "text", text: "Analyse l'image et retourne couleurs, matériaux, style, pièce." },
                { type: "image_url", image_url: product.image_url },
              ],
            },
          ],
          max_tokens: 300,
        }),
      });

      if (visionRes.ok) {
        const vData = await visionRes.json();
        const vContent = vData.choices[0]?.message?.content?.trim();
        if (vContent) visionAttrs = JSON.parse(vContent);
      }
    }

    // --- Fusion ---
    return {
      colors: [...new Set([...(textAttrs.colors || []), ...(visionAttrs.colors || [])])],
      materials: [...new Set([...(textAttrs.materials || []), ...(visionAttrs.materials || [])])],
      dimensions: textAttrs.dimensions,
      styles: [...new Set([...(textAttrs.styles || []), ...(visionAttrs.styles || [])])],
      categories: [...new Set([...(textAttrs.categories || []), ...(visionAttrs.categories || [])])],
      priceRange: textAttrs.priceRange,
      features: [...new Set([...(textAttrs.features || []), ...(visionAttrs.features || [])])],
      room: [...new Set([...(textAttrs.room || []), ...(visionAttrs.room || [])])],
    };
  } catch (e) {
    console.error("⚠️ Erreur extraction IA:", e);
    return extractAttributesBasic(product);
  }
}

function extractAttributesBasic(product: any): ExtractedAttributes {
  const text = `${product.name || ""} ${product.description || ""} ${product.category || ""}`.toLowerCase();

  const colors = ["blanc", "noir", "gris", "beige", "marron", "rouge", "bleu", "vert"].filter((c) =>
    text.includes(c)
  );
  const materials = ["bois", "métal", "acier", "verre", "tissu", "cuir", "velours", "marbre"].filter((m) =>
    text.includes(m)
  );
  const styles = ["moderne", "scandinave", "industriel", "vintage", "minimaliste"].filter((s) =>
    text.includes(s)
  );
  const room = ["salon", "chambre", "cuisine", "bureau", "salle à manger"].filter((r) => text.includes(r));
  const features = ["convertible", "réversible", "extensible", "rangement", "pliable"].filter((f) =>
    text.includes(f)
  );

  return {
    colors,
    materials,
    dimensions: { unit: "cm" },
    styles,
    categories: [product.category || "mobilier"],
    priceRange: { min: product.price, max: product.price, currency: "EUR" },
    features,
    room,
  };
}

function calculateConfidenceScore(attrs: ExtractedAttributes): number {
  let score = 0;
  if (attrs.colors.length > 0) score += 20;
  if (attrs.materials.length > 0) score += 20;
  if (attrs.styles.length > 0) score += 15;
  if (attrs.features.length > 0) score += 15;
  if (attrs.room.length > 0) score += 10;
  if (Object.keys(attrs.dimensions).length > 1) score += 20;
  return Math.min(score, 100);
}

async function updateTrainingMetadata(supabase: any, count: number, incremental: boolean) {
  const metadata = {
    last_training: new Date().toISOString(),
    products_count: count,
    training_type: incremental ? "incremental" : "full",
    model_version: "1.1",
  };
  await supabase.from("ai_training_metadata").upsert(metadata, { onConflict: "id" });
}
