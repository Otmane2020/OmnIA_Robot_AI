const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
};

import { createClient } from 'npm:@supabase/supabase-js@2';

interface EnrichProductsRequest {
  products?: any[];
  retailer_id?: string;
  image_base64?: string;
  image_url?: string;
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, {
      status: 200,
      headers: corsHeaders,
    });
  }

  try {
    const { products, retailer_id, image_base64, image_url }: EnrichProductsRequest = await req.json();
    
    console.log('🤖 Enrichissement produits demandé');

    // Si c'est une analyse d'image
    if (image_base64 || image_url) {
      const analysis = await analyzeImageWithAI(image_base64, image_url);
      return new Response(
        JSON.stringify({ 
          analysis,
          success: true 
        }),
        {
          headers: { 'Content-Type': 'application/json', ...corsHeaders }
        }
      );
    }

    // Si c'est un enrichissement de produits
    if (products && products.length > 0) {
      const enrichedResults = await enrichProductsWithAI(products);
      return new Response(
        JSON.stringify({
          success: true,
          enriched_products: enrichedResults,
          count: enrichedResults.length
        }),
        {
          headers: { 'Content-Type': 'application/json', ...corsHeaders }
        }
      );
    }

    return new Response(
      JSON.stringify({
        success: false,
        error: 'Aucune donnée à enrichir fournie'
      }),
      {
        status: 400,
        headers: { 'Content-Type': 'application/json', ...corsHeaders }
      }
    );

  } catch (error) {
    console.error('❌ Erreur enrichissement:', error);
    
    return new Response(
      JSON.stringify({
        success: false,
        error: 'Erreur lors de l\'enrichissement',
        details: error.message
      }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json', ...corsHeaders }
      }
    );
  }
});

async function analyzeImageWithAI(imageBase64?: string, imageUrl?: string): Promise<string> {
  try {
    // Simuler l'analyse d'image avec IA
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    const analyses = [
      `🏠 **Analyse de votre salon :**

**Espace détecté :** Salon moderne avec canapé existant
**Style :** Contemporain avec tons neutres
**Besoins identifiés :** Table basse manquante

**💡 Mes recommandations :**
• **Table AUREA Ø100cm** (499€) - Travertin naturel parfait avec votre style
• **Chaises INAYA** (99€) - Complément idéal en gris clair

**🎨 Conseil déco :** Ajoutez des coussins colorés pour réchauffer l'ambiance !`,

      `📸 **Analyse de votre espace :**

**Style détecté :** Moderne et épuré
**Ambiance :** Chaleureuse avec potentiel d'amélioration
**Opportunités :** Optimisation de l'aménagement

**💡 Mes recommandations personnalisées :**
• **Canapé ALYANA** (799€) - Convertible velours côtelé
• **Table AUREA** (499€) - Travertin naturel élégant

**🎨 Conseil d'expert :** L'harmonie des matériaux créera une ambiance cohérente !`
    ];

    return analyses[Math.floor(Math.random() * analyses.length)];

  } catch (error) {
    console.error('❌ Erreur analyse image:', error);
    return "📸 Analyse en cours... Votre espace a du potentiel ! Que souhaitez-vous améliorer ?";
  }
}

async function enrichProductsWithAI(products: any[]): Promise<any[]> {
  const enrichedResults = [];

  for (const product of products) {
    try {
      // Simuler l'enrichissement IA
      const enriched = {
        ...product,
        enriched_attributes: {
          category: 'Mobilier',
          type: detectProductType(product.name || ''),
          color: detectColor(product.name + ' ' + product.description),
          material: detectMaterial(product.name + ' ' + product.description),
          style: detectStyle(product.name + ' ' + product.description),
          room: detectRoom(product.name + ' ' + product.description),
          confidence_score: 75
        },
        enriched_at: new Date().toISOString()
      };

      enrichedResults.push(enriched);

    } catch (error) {
      console.error('❌ Erreur enrichissement produit:', error);
    }
  }

  return enrichedResults;
}

function detectProductType(text: string): string {
  const lowerText = text.toLowerCase();
  if (lowerText.includes('canapé') || lowerText.includes('sofa')) return 'canapé';
  if (lowerText.includes('table')) return 'table';
  if (lowerText.includes('chaise') || lowerText.includes('fauteuil')) return 'chaise';
  if (lowerText.includes('lit')) return 'lit';
  if (lowerText.includes('armoire') || lowerText.includes('commode')) return 'rangement';
  return 'mobilier';
}

function detectColor(text: string): string {
  const lowerText = text.toLowerCase();
  const colors = ['blanc', 'noir', 'gris', 'beige', 'marron', 'bleu', 'vert', 'rouge', 'naturel', 'chêne', 'taupe'];
  for (const color of colors) {
    if (lowerText.includes(color)) return color;
  }
  return '';
}

function detectMaterial(text: string): string {
  const lowerText = text.toLowerCase();
  const materials = ['bois', 'métal', 'verre', 'tissu', 'cuir', 'velours', 'travertin', 'marbre', 'chenille'];
  for (const material of materials) {
    if (lowerText.includes(material)) return material;
  }
  return '';
}

function detectStyle(text: string): string {
  const lowerText = text.toLowerCase();
  const styles = ['moderne', 'contemporain', 'scandinave', 'industriel', 'vintage', 'classique', 'minimaliste'];
  for (const style of styles) {
    if (lowerText.includes(style)) return style;
  }
  return '';
}

function detectRoom(text: string): string {
  const lowerText = text.toLowerCase();
  const rooms = ['salon', 'chambre', 'cuisine', 'bureau', 'salle à manger', 'entrée'];
  for (const room of rooms) {
    if (lowerText.includes(room)) return room;
  }
  return '';
}