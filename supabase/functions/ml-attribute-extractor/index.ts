const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
};

import { createClient } from 'npm:@supabase/supabase-js@2';

interface MLExtractionRequest {
  products: any[];
  trigger_type: 'sync_update' | 'manual' | 'daily_cron';
}

interface ExtractedAttributes {
  categorie: string;
  couleurs: string[];
  materiaux: string[];
  dimensions: string;
  style: string;
  piece: string;
  gamme_prix: 'entrée de gamme' | 'standard' | 'premium';
  confidence_score: number;
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, {
      status: 200,
      headers: corsHeaders,
    });
  }

  try {
    const { products, trigger_type }: MLExtractionRequest = await req.json();
    
    console.log('🧠 Démarrage extraction attributs ML:', {
      products_count: products.length,
      trigger_type
    });

    // Initialize Supabase
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    const openaiApiKey = Deno.env.get('OPENAI_API_KEY');
    
    if (!openaiApiKey) {
      console.log('⚠️ OpenAI non configuré, extraction basique');
      return await processBasicExtraction(supabase, products);
    }

    // Process products in batches to avoid timeouts
    const batchSize = 10;
    const results = [];
    let totalProcessed = 0;
    let totalAttributesExtracted = 0;

    console.log(`📦 Traitement par batch de ${batchSize} produits...`);

    for (let i = 0; i < products.length; i += batchSize) {
      const batch = products.slice(i, i + batchSize);
      console.log(`🔄 Batch ${Math.floor(i/batchSize) + 1}/${Math.ceil(products.length/batchSize)}`);

      const batchPromises = batch.map(async (product) => {
        try {
          const attributes = await extractAttributesWithOpenAI(product, openaiApiKey);
          await saveProductAttributes(supabase, product.id, attributes);
          
          totalProcessed++;
          totalAttributesExtracted += Object.keys(attributes).length;
          
          return {
            product_id: product.id,
            product_name: product.title?.substring(0, 50),
            success: true,
            attributes_count: Object.keys(attributes).length,
            confidence: attributes.confidence_score
          };

        } catch (error) {
          console.error(`❌ Erreur extraction produit ${product.id}:`, error);
          return {
            product_id: product.id,
            product_name: product.title?.substring(0, 50),
            success: false,
            error: error.message
          };
        }
      });

      const batchResults = await Promise.all(batchPromises);
      results.push(...batchResults);

      // Pause between batches
      if (i + batchSize < products.length) {
        await new Promise(resolve => setTimeout(resolve, 500));
      }
    }

    // Save training stats
    const stats = {
      products_processed: totalProcessed,
      attributes_extracted: totalAttributesExtracted,
      success_rate: (results.filter(r => r.success).length / results.length) * 100,
      trigger_type,
      executed_at: new Date().toISOString()
    };

    await supabase.from('training_logs').insert({
      status: totalProcessed > 0 ? 'success' : 'failed',
      products_processed: totalProcessed,
      attributes_extracted: totalAttributesExtracted,
      trigger_type,
      execution_time_ms: Date.now() - Date.now(),
      errors: results.filter(r => !r.success).map(r => r.error).join('; ') || null
    });

    console.log('✅ Extraction ML terminée:', stats);

    return new Response(
      JSON.stringify({
        success: true,
        message: `Extraction ML terminée: ${totalProcessed} produits traités`,
        stats,
        results: results
      }),
      {
        headers: {
          'Content-Type': 'application/json',
          ...corsHeaders,
        },
      }
    );

  } catch (error) {
    console.error('❌ Erreur extraction ML:', error);
    
    return new Response(
      JSON.stringify({
        success: false,
        error: 'Erreur lors de l\'extraction des attributs ML',
        details: error.message
      }),
      {
        status: 500,
        headers: {
          'Content-Type': 'application/json',
          ...corsHeaders,
        },
      }
    );
  }
});

async function extractAttributesWithOpenAI(product: any, openaiApiKey: string): Promise<ExtractedAttributes> {
  try {
    // Clean HTML description
    const cleanDescription = product.body_html 
      ? product.body_html.replace(/<[^>]*>/g, '').replace(/&[^;]+;/g, ' ').trim()
      : '';

    const productText = `
TITRE: ${product.title || ''}
DESCRIPTION: ${cleanDescription}
TYPE: ${product.product_type || ''}
PRIX: ${product.variants?.[0]?.price || 0}€
TAGS: ${Array.isArray(product.tags) ? product.tags.join(', ') : product.tags || ''}
    `.trim();

    const prompt = `Tu es un moteur d'extraction d'attributs spécialisé dans le mobilier.
À partir du texte suivant (titre + description HTML), renvoie un JSON strictement valide :

{
  "categorie": "canapé|table|chaise|lit|rangement|meuble tv|decoration",
  "couleurs": ["blanc", "noir", "gris", "beige", "marron", "bleu", "vert", "rouge", "jaune", "orange", "rose", "violet", "naturel", "chêne", "noyer"],
  "materiaux": ["bois", "chêne", "hêtre", "pin", "teck", "métal", "acier", "verre", "tissu", "cuir", "velours", "travertin", "marbre", "plastique", "rotin"],
  "dimensions": "LxlxH en cm ou diamètre",
  "style": "moderne|contemporain|scandinave|industriel|vintage|rustique|classique|minimaliste|bohème",
  "piece": "salon|chambre|cuisine|bureau|salle à manger|entrée",
  "gamme_prix": "entrée de gamme|standard|premium",
  "confidence_score": 85
}

Texte du produit : ${productText}

RÈGLES STRICTES:
- Utilise UNIQUEMENT les valeurs listées ci-dessus
- confidence_score: 0-100 basé sur la qualité des informations
- Si information manquante, ne pas inventer
- Réponse JSON uniquement, aucun texte supplémentaire

RÉPONSE JSON UNIQUEMENT:`;

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openaiApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini', // Faster and cheaper
        messages: [
          {
            role: 'system',
            content: 'Tu es un expert en mobilier et design d\'intérieur. Tu extrais UNIQUEMENT des attributs structurés au format JSON. Aucun texte supplémentaire.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        max_tokens: 400,
        temperature: 0.1, // Very low for consistency
      }),
    });

    if (response.ok) {
      const data = await response.json();
      const content = data.choices[0]?.message?.content?.trim();
      
      if (content) {
        try {
          const extracted = JSON.parse(content);
          console.log('✅ Attributs extraits par IA:', {
            product: product.title?.substring(0, 30),
            categorie: extracted.categorie,
            couleurs: extracted.couleurs?.length || 0,
            materiaux: extracted.materiaux?.length || 0,
            confidence: extracted.confidence_score
          });
          
          return {
            ...extracted,
            confidence_score: extracted.confidence_score || 50
          };
        } catch (parseError) {
          console.log('⚠️ JSON invalide, fallback extraction basique');
        }
      }
    } else {
      console.log('⚠️ OpenAI erreur, fallback extraction basique');
    }
  } catch (error) {
    console.log('⚠️ Erreur OpenAI, fallback extraction basique:', error);
  }

  // Fallback to basic extraction
  return extractAttributesBasic(product);
}

function extractAttributesBasic(product: any): ExtractedAttributes {
  const text = `${product.title || ''} ${product.body_html || ''} ${product.product_type || ''}`.toLowerCase();
  
  // Detect category
  let categorie = 'mobilier';
  if (text.includes('canapé') || text.includes('sofa')) categorie = 'canapé';
  else if (text.includes('table')) categorie = 'table';
  else if (text.includes('chaise') || text.includes('fauteuil')) categorie = 'chaise';
  else if (text.includes('lit') || text.includes('matelas')) categorie = 'lit';
  else if (text.includes('armoire') || text.includes('commode')) categorie = 'rangement';
  else if (text.includes('meuble tv') || text.includes('tv')) categorie = 'meuble tv';

  // Detect colors
  const couleurs = [];
  const colorPatterns = ['blanc', 'noir', 'gris', 'beige', 'marron', 'bleu', 'vert', 'rouge', 'jaune', 'orange', 'rose', 'violet', 'naturel', 'chêne', 'noyer'];
  colorPatterns.forEach(color => {
    if (text.includes(color)) couleurs.push(color);
  });

  // Detect materials
  const materiaux = [];
  const materialPatterns = ['bois', 'chêne', 'hêtre', 'pin', 'teck', 'métal', 'acier', 'verre', 'tissu', 'cuir', 'velours', 'travertin', 'marbre', 'plastique', 'rotin'];
  materialPatterns.forEach(material => {
    if (text.includes(material)) materiaux.push(material);
  });

  // Detect style
  let style = '';
  const stylePatterns = ['moderne', 'contemporain', 'scandinave', 'industriel', 'vintage', 'rustique', 'classique', 'minimaliste', 'bohème'];
  for (const s of stylePatterns) {
    if (text.includes(s)) {
      style = s;
      break;
    }
  }

  // Detect room
  let piece = '';
  const roomPatterns = ['salon', 'chambre', 'cuisine', 'bureau', 'salle à manger', 'entrée'];
  for (const room of roomPatterns) {
    if (text.includes(room)) {
      piece = room;
      break;
    }
  }

  // Price range based on price
  const price = parseFloat(product.variants?.[0]?.price || '0');
  let gamme_prix: 'entrée de gamme' | 'standard' | 'premium' = 'standard';
  if (price < 200) gamme_prix = 'entrée de gamme';
  else if (price > 800) gamme_prix = 'premium';

  // Extract dimensions
  const dimensionMatch = text.match(/(\d+)\s*[x×]\s*(\d+)(?:\s*[x×]\s*(\d+))?\s*cm/);
  const dimensions = dimensionMatch ? dimensionMatch[0] : '';

  // Calculate confidence score
  let confidence = 30; // Base
  if (couleurs.length > 0) confidence += 20;
  if (materiaux.length > 0) confidence += 20;
  if (style) confidence += 15;
  if (piece) confidence += 10;
  if (dimensions) confidence += 5;

  return {
    categorie,
    couleurs,
    materiaux,
    dimensions,
    style,
    piece,
    gamme_prix,
    confidence_score: Math.min(confidence, 100)
  };
}

async function saveProductAttributes(supabase: any, productId: string, attributes: ExtractedAttributes) {
  try {
    // Get product from database
    const { data: product } = await supabase
      .from('products')
      .select('id')
      .eq('shopify_id', productId)
      .single();

    if (!product) {
      console.warn('⚠️ Produit non trouvé pour extraction:', productId);
      return;
    }

    // Upsert attributes
    const { error } = await supabase
      .from('product_attributes')
      .upsert({
        product_id: product.id,
        categorie: attributes.categorie,
        couleurs: attributes.couleurs,
        materiaux: attributes.materiaux,
        dimensions: attributes.dimensions,
        style: attributes.style,
        piece: attributes.piece,
        gamme_prix: attributes.gamme_prix,
        confidence_score: attributes.confidence_score,
        extracted_at: new Date().toISOString()
      }, { onConflict: 'product_id' });

    if (error) {
      console.error('❌ Erreur sauvegarde attributs:', error);
      throw error;
    }

    console.log(`✅ Attributs sauvegardés pour produit ${productId}`);

  } catch (error) {
    console.error('❌ Erreur sauvegarde attributs:', error);
    throw error;
  }
}

async function processBasicExtraction(supabase: any, products: any[]) {
  let processed = 0;
  
  for (const product of products) {
    try {
      const attributes = extractAttributesBasic(product);
      await saveProductAttributes(supabase, product.id, attributes);
      processed++;
    } catch (error) {
      console.error('❌ Erreur extraction basique:', error);
    }
  }

  return new Response(
    JSON.stringify({
      success: true,
      message: `Extraction basique terminée: ${processed} produits`,
      stats: {
        products_processed: processed,
        method: 'basic_extraction'
      }
    }),
    {
      headers: { 'Content-Type': 'application/json', ...corsHeaders }
    }
  );
}