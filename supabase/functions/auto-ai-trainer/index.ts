@@ .. @@
interface ExtractedAttributes {
  colors: string[];
  materials: string[];
  dimensions: {
    length?: number;
    width?: number;
    height?: number;
    depth?: number;
    diameter?: number;
    unit: string;
  };
  styles: string[];
  categories: string[];
  subcategory: string;
  priceRange: {
    min?: number;
    max?: number;
    currency: string;
  };
  features: string[];
  room: string[];
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
    // Initialize Supabase client with error handling
    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
    
    if (!supabaseUrl || !supabaseKey) {
      console.error('❌ [auto-ai-trainer] Variables d\'environnement Supabase manquantes');
      return new Response(
        JSON.stringify({
          success: false,
          error: 'Configuration Supabase manquante',
          details: 'SUPABASE_URL et SUPABASE_SERVICE_ROLE_KEY requis'
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

    const { products, source, store_id, trigger_type }: AutoTrainingRequest = await req.json();
    
    console.log('🤖 [auto-ai-trainer] Auto-training déclenché:', {
      source,
      products_count: products.length,
      trigger_type,
      store_id
    });

    const supabase = createClient(supabaseUrl, supabaseKey);

    // Process products with AI extraction
    const processedProducts = [];
    const batchSize = 10; // Process in batches to avoid timeouts
    
    console.log('🧠 [auto-ai-trainer] Démarrage extraction IA par batch...');
    
    for (let i = 0; i < products.length; i += batchSize) {
      const batch = products.slice(i, i + batchSize);
      console.log(`📦 [auto-ai-trainer] Traitement batch ${Math.floor(i/batchSize) + 1}/${Math.ceil(products.length/batchSize)}`);
      
      const batchPromises = batch.map(async (product) => {
        try {
          const attributes = await extractAttributesWithAI(product, source);
          return {
            // Standardize product format
            id: `${store_id || 'default'}-${product.id || product.external_id || Date.now()}`,
            name: product.title || product.name || 'Produit sans nom',
            description: product.description || '',
            price: parseFloat(product.price) || 0,
            compare_at_price: parseFloat(product.compare_at_price) || null,
            category: product.productType || product.category || 'Mobilier',
            vendor: product.vendor || 'Boutique',
            image_url: product.image_url || product.featuredImage?.url || '',
            product_url: product.product_url || `#${product.handle || product.id}`,
            stock: product.quantityAvailable || product.stock || 0,
            source_platform: source,
            store_id: store_id,
            retailer_id: store_id, // Add retailer_id for proper isolation
            extracted_attributes: attributes,
            confidence_score: attributes.confidence_score,
            last_trained: new Date().toISOString(),
          };
        } catch (error) {
          console.error('❌ [auto-ai-trainer] Erreur traitement produit:', error);
          return null;
        }
      });
      
      const batchResults = await Promise.all(batchPromises);
      const validResults = batchResults.filter(result => result !== null);
      processedProducts.push(...validResults);
      
      // Small delay between batches
      if (i + batchSize < products.length) {
        await new Promise(resolve => setTimeout(resolve, 500));
      }
    }

    console.log(`✅ [auto-ai-trainer] ${processedProducts.length}/${products.length} produits traités avec succès`);

    // Store in database with upsert (update or insert)
    if (processedProducts.length > 0) {
      // Insérer dans ai_products
      const { error: upsertError } = await supabase
        .from('ai_products')
        .upsert(processedProducts, { 
          onConflict: 'id',
          ignoreDuplicates: false 
        });

      if (upsertError) {
        console.error('❌ [auto-ai-trainer] Erreur upsert:', upsertError);
        throw upsertError;
      }

      // NOUVEAU: Insérer aussi dans imported_products pour déclencher le trigger de sync
      console.log('🔄 [auto-ai-trainer] Synchronisation vers imported_products pour trigger...');
      const importedProducts = processedProducts.map(product => ({
        external_id: product.id,
        retailer_id: store_id,
        name: product.name,
        description: product.description || '',
        price: product.price,
        compare_at_price: product.compare_at_price,
        category: product.category,
        vendor: product.vendor || 'Decora Home',
        image_url: product.image_url,
        product_url: product.product_url,
        stock: product.stock,
        source_platform: source,
        status: 'active',
        extracted_attributes: product.extracted_attributes || {},
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }));

      const { error: importedError } = await supabase
        .from('imported_products')
        .upsert(importedProducts, { 
          onConflict: 'retailer_id,external_id,source_platform',
          ignoreDuplicates: false 
        });

      if (importedError) {
        console.error('❌ [auto-ai-trainer] Erreur sync imported_products:', importedError);
        // Ne pas faire échouer tout le processus
      } else {
        console.log('✅ [auto-ai-trainer] Produits synchronisés vers imported_products:', importedProducts.length);
      }
    }

    // Update training metadata
    await updateTrainingMetadata(supabase, {
      products_count: processedProducts.length,
      source_platform: source,
      trigger_type,
      store_id: store_id
    });

    // Update OmnIA Robot knowledge base
    await updateRobotKnowledge(supabase, processedProducts, source);

    console.log('🤖 [auto-ai-trainer] OmnIA Robot mis à jour avec nouveau catalogue');

    return new Response(
      JSON.stringify({
        success: true,
        message: `🤖 OmnIA Robot entraîné automatiquement ! ${processedProducts.length} produits analysés depuis ${source}.`,
        stats: {
          products_processed: processedProducts.length,
          products_enriched: processedProducts.length,
          source_platform: source,
          trigger_type,
          attributes_extracted: processedProducts.reduce((sum, p) => 
            sum + Object.keys(p.extracted_attributes).length, 0),
          confidence_avg: processedProducts.reduce((sum, p) => 
            sum + p.confidence_score, 0) / processedProducts.length,
          processed_at: new Date().toISOString()
        }
      }),
      {
        headers: {
          'Content-Type': 'application/json',
          ...corsHeaders,
        },
      }
    );

  } catch (error) {
    console.error('❌ [auto-ai-trainer] Erreur auto-training:', error);
    
    return new Response(
      JSON.stringify({
        success: false,
        error: 'Erreur lors de l\'entraînement automatique IA',
        details: error?.message || 'Erreur inconnue'
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

async function extractAttributesWithAI(product: any, source: string): Promise<ExtractedAttributes> {
  const deepseekApiKey = Deno.env.get('DEEPSEEK_API_KEY');
  
  if (!deepseekApiKey) {
    console.log('⚠️ [auto-ai-trainer] DeepSeek non configuré, extraction basique pour:', product.title?.substring(0, 30));
    return extractAttributesBasic(product);
  }

  try {
    const productText = `
PRODUIT: ${product.title || product.name || ''}
DESCRIPTION: ${product.description || ''}
CATÉGORIE: ${product.productType || product.category || ''}
PRIX: ${product.price || 0}€
TAGS: ${Array.isArray(product.tags) ? product.tags.join(', ') : ''}
SOURCE: ${source}
    `.trim();

    const prompt = `\Analyse ce produit mobilier et extrait UNIQUEMENT les attributs au format JSON strict.

${productText}

EXTRAIT ces attributs au format JSON exact :
{
  "colors": ["couleur1", "couleur2"],
  "materials": ["matériau1", "matériau2"], 
  "subcategory": "Description précise du type (ex: Canapé d'angle convertible, Table basse ronde)",
  "dimensions": {
    "length": 200,
    "width": 100,
    "height": 75,
    "unit": "cm"
  },
  "styles": ["style1", "style2"],
  "categories": ["catégorie1"],
  "features": ["fonctionnalité1", "fonctionnalité2"],
  "room": ["salon", "chambre"],
  "confidence_score": 85
}

RÈGLES STRICTES:
- Couleurs: blanc, noir, gris, beige, marron, bleu, vert, rouge, jaune, orange, rose, violet, crème, naturel, anthracite, taupe, ivoire, chêne, noyer, teck
- Matériaux: chêne, hêtre, pin, teck, noyer, bois massif, métal, acier, verre, tissu, cuir, velours, travertin, marbre, plastique, rotin
- Styles: moderne, contemporain, scandinave, industriel, vintage, rustique, classique, minimaliste, bohème, baroque
- Subcategory: Description précise et spécifique du produit (ex: "Canapé d'angle convertible", "Table basse ronde", "Chaise de bureau ergonomique")
- Dimensions en cm uniquement si mentionnées
- Pièces: salon, chambre, cuisine, bureau, salle à manger, entrée
- Fonctionnalités: convertible, réversible, pliable, extensible, rangement, tiroir, roulettes, réglable
- confidence_score: 0-100 basé sur la qualité des informations

RÉPONSE JSON UNIQUEMENT, AUCUN TEXTE:`;

    const response = await fetch('https://api.deepseek.com/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${deepseekApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'deepseek-chat',
        messages: [
          {
            role: 'system',
            content: 'Tu es un expert en mobilier et design d\'intérieur. Tu extrais UNIQUEMENT des attributs structurés au format JSON avec sous-catégories précises. Aucun texte supplémentaire.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        max_tokens: 700,
        temperature: 0.1,
        stream: false
      }),
    });

    if (response.ok) {
      const data = await response.json();
      const content = data.choices[0]?.message?.content?.trim();
      
      if (content) {
        try {
          const extracted = JSON.parse(content);
          console.log('✅ [auto-ai-trainer] IA extraction réussie:', {
            product: product.title?.substring(0, 30),
            colors: extracted.colors?.length || 0,
            materials: extracted.materials?.length || 0,
            subcategory: extracted.subcategory || 'Non définie',
            confidence: extracted.confidence_score || 0
          });
          
          return {
            ...extracted,
            confidence_score: extracted.confidence_score || 50
          };
        } catch (parseError) {
          console.log('⚠️ [auto-ai-trainer] JSON invalide, fallback basique pour:', product.title?.substring(0, 30));
        }
      }
    } else {
      console.log('⚠️ [auto-ai-trainer] DeepSeek erreur, fallback basique');
    }
  } catch (error) {
    console.log('⚠️ [auto-ai-trainer] Erreur DeepSeek, fallback basique:', error);
  }

  return extractAttributesBasic(product);
}

function extractAttributesBasic(product: any): ExtractedAttributes {
  const text = `${product.title || product.name || ''} ${product.description || ''} ${product.productType || product.category || ''}`.toLowerCase();
  
  // Detect category and subcategory
  let category = 'Mobilier';
  let subcategory = '';
  
  if (text.includes('canapé') || text.includes('sofa')) {
    category = 'Canapé';
    if (text.includes('angle')) subcategory = 'Canapé d\'angle';
    else if (text.includes('convertible')) subcategory = 'Canapé convertible';
    else if (text.includes('lit')) subcategory = 'Canapé-lit';
    else subcategory = 'Canapé fixe';
  } else if (text.includes('table')) {
    category = 'Table';
    if (text.includes('basse')) subcategory = 'Table basse';
    else if (text.includes('manger') || text.includes('repas')) subcategory = 'Table à manger';
    else if (text.includes('bureau')) subcategory = 'Bureau';
    else if (text.includes('console')) subcategory = 'Console';
    else if (text.includes('ronde')) subcategory = 'Table ronde';
    else if (text.includes('rectangulaire')) subcategory = 'Table rectangulaire';
    else subcategory = 'Table';
  } else if (text.includes('chaise') || text.includes('fauteuil')) {
    category = 'Chaise';
    if (text.includes('bureau')) subcategory = 'Chaise de bureau';
    else if (text.includes('fauteuil')) subcategory = 'Fauteuil';
    else if (text.includes('bar')) subcategory = 'Tabouret de bar';
    else subcategory = 'Chaise de salle à manger';
  } else if (text.includes('lit')) {
    category = 'Lit';
    if (text.includes('simple')) subcategory = 'Lit simple';
    else if (text.includes('double')) subcategory = 'Lit double';
    else if (text.includes('queen')) subcategory = 'Lit Queen';
    else if (text.includes('king')) subcategory = 'Lit King';
    else subcategory = 'Lit';
  } else if (text.includes('armoire') || text.includes('commode')) {
    category = 'Rangement';
    if (text.includes('armoire')) subcategory = 'Armoire';
    else if (text.includes('commode')) subcategory = 'Commode';
    else if (text.includes('bibliothèque')) subcategory = 'Bibliothèque';
    else subcategory = 'Meuble de rangement';
  }

  // Extract colors with comprehensive patterns
  const colorPatterns = [
    { name: 'blanc', patterns: ['blanc', 'white', 'ivoire', 'crème', 'cream'] },
    { name: 'noir', patterns: ['noir', 'black', 'anthracite', 'charbon'] },
    { name: 'gris', patterns: ['gris', 'grey', 'gray', 'argent', 'silver'] },
    { name: 'beige', patterns: ['beige', 'sable', 'sand', 'lin', 'écru'] },
    { name: 'marron', patterns: ['marron', 'brown', 'chocolat', 'café', 'moka', 'cognac'] },
    { name: 'bleu', patterns: ['bleu', 'blue', 'marine', 'navy', 'cobalt', 'turquoise'] },
    { name: 'vert', patterns: ['vert', 'green', 'olive', 'sauge', 'menthe'] },
    { name: 'rouge', patterns: ['rouge', 'red', 'bordeaux', 'cerise', 'carmin'] },
    { name: 'jaune', patterns: ['jaune', 'yellow', 'moutarde', 'citron'] },
    { name: 'orange', patterns: ['orange', 'corail', 'abricot', 'mandarine'] },
    { name: 'rose', patterns: ['rose', 'pink', 'fuchsia', 'magenta'] },
    { name: 'violet', patterns: ['violet', 'purple', 'mauve', 'lilas', 'prune'] },
    { name: 'chêne', patterns: ['chêne', 'oak', 'chêne clair', 'chêne foncé'] },
    { name: 'noyer', patterns: ['noyer', 'walnut', 'noyer américain'] },
    { name: 'teck', patterns: ['teck', 'teak'] },
    { name: 'naturel', patterns: ['naturel', 'natural', 'brut', 'raw'] },
    { name: 'taupe', patterns: ['taupe', 'greige'] }
  ];
  
  const colors = colorPatterns
    .filter(({ patterns }) => patterns.some(pattern => text.includes(pattern)))
    .map(({ name }) => name);

  // Extract materials with comprehensive patterns
  const materialPatterns = [
    { name: 'chêne', patterns: ['chêne', 'oak'] },
    { name: 'hêtre', patterns: ['hêtre', 'beech'] },
    { name: 'pin', patterns: ['pin', 'pine'] },
    { name: 'teck', patterns: ['teck', 'teak'] },
    { name: 'noyer', patterns: ['noyer', 'walnut'] },
    { name: 'bois massif', patterns: ['bois massif', 'solid wood', 'massif'] },
    { name: 'métal', patterns: ['métal', 'metal', 'acier', 'steel', 'fer', 'iron'] },
    { name: 'verre', patterns: ['verre', 'glass', 'cristal'] },
    { name: 'tissu', patterns: ['tissu', 'fabric', 'textile'] },
    { name: 'cuir', patterns: ['cuir', 'leather'] },
    { name: 'velours', patterns: ['velours', 'velvet', 'côtelé'] },
    { name: 'travertin', patterns: ['travertin', 'travertine'] },
    { name: 'marbre', patterns: ['marbre', 'marble'] },
    { name: 'chenille', patterns: ['chenille'] },
    { name: 'rotin', patterns: ['rotin', 'rattan', 'osier', 'wicker'] }
  ];
  
  const materials = materialPatterns
    .filter(({ patterns }) => patterns.some(pattern => text.includes(pattern)))
    .map(({ name }) => name);

  // Extract dimensions
  const dimensions: any = { unit: 'cm' };
  const dimPatterns = [
    { key: 'length', regex: /(?:longueur|length|l)\s*:?\s*(\d+(?:[.,]\d+)?)\s*cm/gi },
    { key: 'width', regex: /(?:largeur|width|w)\s*:?\s*(\d+(?:[.,]\d+)?)\s*cm/gi },
    { key: 'height', regex: /(?:hauteur|height|h)\s*:?\s*(\d+(?:[.,]\d+)?)\s*cm/gi },
    { key: 'diameter', regex: /(?:diamètre|diameter|ø)\s*:?\s*(\d+(?:[.,]\d+)?)\s*cm/gi },
    { key: 'depth', regex: /(?:profondeur|depth|p)\s*:?\s*(\d+(?:[.,]\d+)?)\s*cm/gi }
  ];
  
  dimPatterns.forEach(({ key, regex }) => {
    const match = regex.exec(text);
    if (match) {
      dimensions[key] = parseFloat(match[1].replace(',', '.'));
    }
  });

  // Extract styles
  const stylePatterns = [
    'moderne', 'modern', 'contemporain', 'contemporary', 'scandinave', 'scandinavian',
    'industriel', 'industrial', 'vintage', 'rustique', 'rustic', 'classique', 'classic',
    'minimaliste', 'minimalist', 'bohème', 'boho', 'baroque'
  ];
  
  const styles = stylePatterns.filter(style => text.includes(style));

  // Extract room types
  const roomPatterns = [
    'salon', 'living', 'chambre', 'bedroom', 'cuisine', 'kitchen',
    'bureau', 'office', 'salle à manger', 'dining', 'entrée', 'entrance'
  ];
  
  const room = roomPatterns.filter(r => text.includes(r));

  // Extract features
  const featurePatterns = [
    'convertible', 'réversible', 'reversible', 'pliable', 'foldable',
    'extensible', 'extendable', 'rangement', 'storage', 'tiroir', 'drawer',
    'roulettes', 'wheels', 'réglable', 'adjustable'
  ];
  
  const features = featurePatterns.filter(feature => text.includes(feature));

  // Calculate confidence score
  let confidence = 0;
  if (colors.length > 0) confidence += 20;
  if (materials.length > 0) confidence += 25;
  if (Object.keys(dimensions).length > 1) confidence += 20;
  if (styles.length > 0) confidence += 15;
  if (features.length > 0) confidence += 10;
  if (room.length > 0) confidence += 10;

  return {
    colors: [...new Set(colors)],
    materials: [...new Set(materials)],
    subcategory,
    dimensions,
    styles: [...new Set(styles)],
    categories: [category],
    priceRange: {
      min: parseFloat(product.price) || 0,
      max: parseFloat(product.price) || 0,
      currency: 'EUR'
    },
    features: [...new Set(features)],
    room: [...new Set(room)],
    confidence_score: Math.min(confidence, 100)
  };
}