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
    // Enhanced product text preparation with better context
    const productText = `
PRODUIT: ${product.title || product.name || ''}
DESCRIPTION: ${product.description || ''}
CATÉGORIE: ${product.productType || product.category || ''}
PRIX: ${product.price || 0}€
TAGS: ${Array.isArray(product.tags) ? product.tags.join(', ') : ''}
MARQUE: ${product.vendor || product.brand || ''}
VARIANTES: ${product.variants ? JSON.stringify(product.variants.slice(0, 3)) : 'Aucune'}
SOURCE: ${source}
    `.trim();

    const prompt = `Analyse ce produit mobilier avec PRÉCISION MAXIMALE et extrait les attributs au format JSON strict.

${productText}

EXTRAIT avec PRÉCISION MAXIMALE ces attributs au format JSON exact :
{
  "colors": ["couleur1", "couleur2"],
  "materials": ["matériau1", "matériau2"], 
  "subcategory": "Description TRÈS précise du type avec toutes les caractéristiques (ex: Canapé d'angle convertible 4 places avec coffre rangement, Table basse ronde travertin pieds métal)",
  "dimensions": {
    "length": 200,
    "width": 100,
    "height": 75,
    "depth": 90,
    "seat_height": 45,
    "diameter": 100,
    "unit": "cm"
  },
  "styles": ["style1", "style2"],
  "categories": ["catégorie1"],
  "features": ["fonctionnalité1", "fonctionnalité2"],
  "room": ["salon", "chambre"],
  "capacity": {
    "seats": 4,
    "storage_volume": "200L",
    "weight_capacity": "120kg"
  },
  "technical_details": {
    "assembly_required": true,
    "warranty": "2 ans",
    "origin": "France",
    "certifications": ["FSC", "PEFC"]
  },
  "confidence_score": 85
}

RÈGLES ULTRA-STRICTES POUR PRÉCISION MAXIMALE:
- Couleurs: blanc, noir, gris, beige, marron, bleu, vert, rouge, jaune, orange, rose, violet, crème, naturel, anthracite, taupe, ivoire, chêne, noyer, teck
- Matériaux: chêne massif, hêtre, pin, teck, noyer, bois massif, métal noir, acier inoxydable, verre trempé, tissu chenille, cuir véritable, velours côtelé, travertin naturel, marbre blanc, plastique ABS, rotin naturel, osier
- Styles: moderne, contemporain, scandinave, industriel, vintage, rustique, classique, minimaliste, bohème, baroque
- Subcategory: Description ULTRA-précise avec TOUS les détails (matériau + forme + fonctionnalités + capacité)
- Dimensions en cm uniquement si mentionnées
- Extraire TOUTES les dimensions disponibles (L, l, H, P, diamètre, hauteur assise)
- Pièces: salon, chambre, cuisine, bureau, salle à manger, entrée
- Fonctionnalités: convertible, réversible, pliable, extensible, rangement intégré, tiroirs, roulettes, réglable en hauteur, pivotant, déhoussable, empilable
- confidence_score: 0-100 basé sur la RICHESSE et PRÉCISION des informations extraites
- Si informations manquantes ou floues, réduire le score de confiance
- Privilégier la PRÉCISION sur la quantité

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
            content: 'Tu es un EXPERT SENIOR en mobilier et design d\'intérieur avec 20 ans d\'expérience. Tu extrais des attributs avec PRÉCISION MAXIMALE au format JSON. Analyse CHAQUE détail du produit. Aucun texte supplémentaire.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        max_tokens: 1000,
        temperature: 0.05,
        stream: false
      }),
    });

    if (response.ok) {
      const data = await response.json();
      const content = data.choices[0]?.message?.content?.trim();
      
      if (content) {
        try {
          const extracted = JSON.parse(content);
          
          // Enhanced validation and scoring
          const validatedExtracted = validateAndEnhanceExtraction(extracted, product);
          
          console.log('✅ [auto-ai-trainer] IA extraction réussie:', {
            product: product.title?.substring(0, 30),
            colors: validatedExtracted.colors?.length || 0,
            materials: validatedExtracted.materials?.length || 0,
            subcategory: validatedExtracted.subcategory || 'Non définie',
            confidence: validatedExtracted.confidence_score || 0,
            dimensions_count: Object.keys(validatedExtracted.dimensions || {}).length
          });
          
          return {
            ...validatedExtracted,
            confidence_score: validatedExtracted.confidence_score || 50
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

function validateAndEnhanceExtraction(extracted: any, product: any): ExtractedAttributes {
  // Enhanced validation and confidence adjustment
  const validated = { ...extracted };
  
  // Validate colors against known color palette
  const validColors = ['blanc', 'noir', 'gris', 'beige', 'marron', 'bleu', 'vert', 'rouge', 'jaune', 'orange', 'rose', 'violet', 'crème', 'naturel', 'anthracite', 'taupe', 'ivoire', 'chêne', 'noyer', 'teck'];
  if (validated.colors) {
    validated.colors = validated.colors.filter((color: string) => 
      validColors.some(validColor => 
        color.toLowerCase().includes(validColor) || validColor.includes(color.toLowerCase())
      )
    );
  }
  
  // Validate materials
  const validMaterials = ['chêne massif', 'hêtre', 'pin', 'teck', 'noyer', 'bois massif', 'métal noir', 'acier inoxydable', 'verre trempé', 'tissu chenille', 'cuir véritable', 'velours côtelé', 'travertin naturel', 'marbre blanc', 'plastique', 'rotin naturel'];
  if (validated.materials) {
    validated.materials = validated.materials.filter((material: string) =>
      validMaterials.some(validMaterial =>
        material.toLowerCase().includes(validMaterial.toLowerCase()) || 
        validMaterial.toLowerCase().includes(material.toLowerCase())
      )
    );
  }
  
  // Enhanced subcategory validation and enrichment
  if (validated.subcategory) {
    const productText = `${product.title || ''} ${product.description || ''}`.toLowerCase();
    
    // Add missing details to subcategory if found in text
    if (productText.includes('convertible') && !validated.subcategory.toLowerCase().includes('convertible')) {
      validated.subcategory += ' convertible';
    }
    if (productText.includes('rangement') && !validated.subcategory.toLowerCase().includes('rangement')) {
      validated.subcategory += ' avec rangement';
    }
    if (productText.includes('angle') && !validated.subcategory.toLowerCase().includes('angle')) {
      validated.subcategory += ' d\'angle';
    }
  }
  
  // Enhanced confidence scoring based on data richness
  let enhancedConfidence = 20; // Base score
  
  if (validated.colors && validated.colors.length > 0) enhancedConfidence += 15;
  if (validated.materials && validated.materials.length > 0) enhancedConfidence += 20;
  if (validated.dimensions && Object.keys(validated.dimensions).length > 2) enhancedConfidence += 25;
  if (validated.subcategory && validated.subcategory.length > 20) enhancedConfidence += 15;
  if (validated.styles && validated.styles.length > 0) enhancedConfidence += 10;
  if (validated.features && validated.features.length > 0) enhancedConfidence += 10;
  if (validated.capacity) enhancedConfidence += 10;
  if (validated.technical_details) enhancedConfidence += 5;
  
  // Bonus for rich product descriptions
  const descriptionLength = (product.description || '').length;
  if (descriptionLength > 500) enhancedConfidence += 10;
  else if (descriptionLength > 200) enhancedConfidence += 5;
  
  // Penalty for missing critical info
  if (!validated.colors || validated.colors.length === 0) enhancedConfidence -= 10;
  if (!validated.materials || validated.materials.length === 0) enhancedConfidence -= 15;
  if (!validated.dimensions || Object.keys(validated.dimensions).length < 2) enhancedConfidence -= 10;
  
  validated.confidence_score = Math.max(10, Math.min(enhancedConfidence, 100));
  
  return validated;
}
function extractAttributesBasic(product: any): ExtractedAttributes {
  const text = `${product.title || product.name || ''} ${product.description || ''} ${product.productType || product.category || ''}`.toLowerCase();
  
  // Enhanced category and subcategory detection
  let category = 'Mobilier';
  let subcategory = '';
  
  if (text.includes('canapé') || text.includes('sofa')) {
    category = 'Canapé';
    // Build detailed subcategory
    subcategory = 'Canapé';
    if (text.includes('angle')) subcategory += ' d\'angle';
    if (text.includes('convertible')) subcategory += ' convertible';
    if (text.includes('places')) {
      const placesMatch = text.match(/(\d+)\s*places?/);
      if (placesMatch) subcategory += ` ${placesMatch[1]} places`;
    }
    if (text.includes('rangement') || text.includes('coffre')) subcategory += ' avec rangement';
    if (text.includes('velours')) subcategory += ' en velours';
    if (text.includes('côtelé')) subcategory += ' côtelé';
  } else if (text.includes('table')) {
    category = 'Table';
    subcategory = 'Table';
    if (text.includes('basse')) subcategory = 'Table basse';
    else if (text.includes('manger') || text.includes('repas')) subcategory = 'Table à manger';
    else if (text.includes('bureau')) subcategory = 'Bureau';
    else if (text.includes('console')) subcategory = 'Console';
    
    // Add shape details
    if (text.includes('ronde')) subcategory += ' ronde';
    else if (text.includes('rectangulaire')) subcategory += ' rectangulaire';
    else if (text.includes('carrée')) subcategory += ' carrée';
    
    // Add material details
    if (text.includes('travertin')) subcategory += ' en travertin';
    else if (text.includes('bois')) subcategory += ' en bois';
    else if (text.includes('verre')) subcategory += ' en verre';
    
    // Add size if mentioned
    const diameterMatch = text.match(/ø\s*(\d+)\s*cm/);
    if (diameterMatch) subcategory += ` Ø${diameterMatch[1]}cm`;
  } else if (text.includes('chaise') || text.includes('fauteuil')) {
    category = 'Chaise';
    subcategory = text.includes('fauteuil') ? 'Fauteuil' : 'Chaise';
    if (text.includes('bureau')) subcategory += ' de bureau';
    else if (text.includes('bar')) subcategory = 'Tabouret de bar';
    else if (text.includes('salle à manger')) subcategory += ' de salle à manger';
    
    // Add material and style details
    if (text.includes('chenille')) subcategory += ' en tissu chenille';
    if (text.includes('métal noir')) subcategory += ' pieds métal noir';
    if (text.includes('ergonomique')) subcategory += ' ergonomique';
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

  // Enhanced color extraction with better pattern matching
  const colorPatterns = [
    { name: 'blanc', patterns: ['blanc', 'white', 'ivoire', 'crème', 'cream', 'écru', 'cassé', 'lait'] },
    { name: 'noir', patterns: ['noir', 'black', 'anthracite', 'charbon', 'ébène', 'jais', 'carbone'] },
    { name: 'gris', patterns: ['gris', 'grey', 'gray', 'argent', 'silver', 'platine', 'acier', 'souris'] },
    { name: 'beige', patterns: ['beige', 'sable', 'sand', 'lin', 'écru', 'nude', 'champagne', 'vanille'] },
    { name: 'marron', patterns: ['marron', 'brown', 'chocolat', 'café', 'moka', 'cognac', 'caramel', 'noisette', 'châtaigne'] },
    { name: 'bleu', patterns: ['bleu', 'blue', 'marine', 'navy', 'cobalt', 'turquoise', 'cyan', 'azur', 'indigo', 'pétrole'] },
    { name: 'vert', patterns: ['vert', 'green', 'olive', 'sauge', 'menthe', 'émeraude', 'jade', 'kaki', 'forest'] },
    { name: 'rouge', patterns: ['rouge', 'red', 'bordeaux', 'cerise', 'carmin', 'vermillon', 'grenat', 'rubis'] },
    { name: 'jaune', patterns: ['jaune', 'yellow', 'moutarde', 'citron', 'or', 'gold', 'ocre', 'soleil'] },
    { name: 'orange', patterns: ['orange', 'corail', 'abricot', 'mandarine', 'cuivre', 'rouille', 'terre cuite'] },
    { name: 'rose', patterns: ['rose', 'pink', 'fuchsia', 'magenta', 'saumon', 'poudré', 'bonbon'] },
    { name: 'violet', patterns: ['violet', 'purple', 'mauve', 'lilas', 'prune', 'aubergine', 'lavande'] },
    { name: 'chêne', patterns: ['chêne', 'oak', 'chêne clair', 'chêne foncé', 'chêne naturel', 'chêne blanchi'] },
    { name: 'noyer', patterns: ['noyer', 'walnut', 'noyer américain', 'noyer européen'] },
    { name: 'teck', patterns: ['teck', 'teak', 'teck huilé'] },
    { name: 'naturel', patterns: ['naturel', 'natural', 'brut', 'raw', 'authentique'] },
    { name: 'taupe', patterns: ['taupe', 'greige', 'mushroom', 'pierre'] }
  ];
  
  const colors = colorPatterns
    .filter(({ patterns }) => patterns.some(pattern => text.includes(pattern)))
    .map(({ name }) => name);

  // Enhanced material extraction with more precision
  const materialPatterns = [
    { name: 'chêne massif', patterns: ['chêne massif', 'chêne', 'oak', 'solid oak'] },
    { name: 'hêtre', patterns: ['hêtre', 'beech'] },
    { name: 'pin', patterns: ['pin', 'pine'] },
    { name: 'teck', patterns: ['teck', 'teak'] },
    { name: 'noyer', patterns: ['noyer', 'walnut'] },
    { name: 'bois massif', patterns: ['bois massif', 'solid wood', 'massif', 'bois véritable'] },
    { name: 'métal noir', patterns: ['métal noir', 'black metal', 'acier noir'] },
    { name: 'acier inoxydable', patterns: ['acier inoxydable', 'inox', 'stainless steel'] },
    { name: 'verre trempé', patterns: ['verre trempé', 'tempered glass', 'verre sécurit'] },
    { name: 'verre', patterns: ['verre', 'glass', 'cristal'] },
    { name: 'tissu chenille', patterns: ['tissu chenille', 'chenille', 'chenille fabric'] },
    { name: 'tissu', patterns: ['tissu', 'fabric', 'textile'] },
    { name: 'cuir véritable', patterns: ['cuir véritable', 'genuine leather', 'cuir pleine fleur'] },
    { name: 'cuir', patterns: ['cuir', 'leather'] },
    { name: 'velours côtelé', patterns: ['velours côtelé', 'corduroy velvet', 'côtelé'] },
    { name: 'velours', patterns: ['velours', 'velvet'] },
    { name: 'travertin naturel', patterns: ['travertin naturel', 'travertin', 'travertine natural'] },
    { name: 'marbre blanc', patterns: ['marbre blanc', 'white marble'] },
    { name: 'marbre', patterns: ['marbre', 'marble'] },
    { name: 'rotin naturel', patterns: ['rotin naturel', 'natural rattan'] },
    { name: 'rotin', patterns: ['rotin', 'rattan', 'osier', 'wicker'] }
  ];
  
  const materials = materialPatterns
    .filter(({ patterns }) => patterns.some(pattern => text.includes(pattern)))
    .map(({ name }) => name);

  // Enhanced dimensions extraction with multiple formats
  const dimensions: any = { unit: 'cm' };
  const dimPatterns = [
    // Combined formats
    { key: 'combined_lxwxh', regex: /(\d+(?:[.,]\d+)?)\s*[x×]\s*(\d+(?:[.,]\d+)?)\s*[x×]\s*(\d+(?:[.,]\d+)?)\s*cm/gi },
    { key: 'combined_lxw', regex: /(\d+(?:[.,]\d+)?)\s*[x×]\s*(\d+(?:[.,]\d+)?)\s*cm/gi },
    // Individual dimensions
    { key: 'length', regex: /(?:longueur|length|l)\s*:?\s*(\d+(?:[.,]\d+)?)\s*cm/gi },
    { key: 'width', regex: /(?:largeur|width|w)\s*:?\s*(\d+(?:[.,]\d+)?)\s*cm/gi },
    { key: 'height', regex: /(?:hauteur|height|h)\s*:?\s*(\d+(?:[.,]\d+)?)\s*cm/gi },
    { key: 'depth', regex: /(?:profondeur|depth|p)\s*:?\s*(\d+(?:[.,]\d+)?)\s*cm/gi },
    { key: 'diameter', regex: /(?:diamètre|diameter|ø)\s*:?\s*(\d+(?:[.,]\d+)?)\s*cm/gi },
    { key: 'seat_height', regex: /(?:hauteur\s+d?[\'']?assise|seat\s+height)\s*:?\s*(\d+(?:[.,]\d+)?)\s*cm/gi }
  ];
  
  dimPatterns.forEach(({ key, regex }) => {
    const match = regex.exec(text);
    if (match) {
      if (key === 'combined_lxwxh') {
        dimensions.length = parseFloat(match[1].replace(',', '.'));
        dimensions.width = parseFloat(match[2].replace(',', '.'));
        dimensions.height = parseFloat(match[3].replace(',', '.'));
      } else if (key === 'combined_lxw') {
        dimensions.length = parseFloat(match[1].replace(',', '.'));
        dimensions.width = parseFloat(match[2].replace(',', '.'));
      } else {
        dimensions[key] = parseFloat(match[1].replace(',', '.'));
      }
    }
  });

  // Enhanced style extraction
  const stylePatterns = [
    { name: 'moderne', patterns: ['moderne', 'modern', 'design moderne'] },
    { name: 'contemporain', patterns: ['contemporain', 'contemporary', 'design contemporain'] },
    { name: 'scandinave', patterns: ['scandinave', 'scandinavian', 'nordique', 'nordic'] },
    { name: 'industriel', patterns: ['industriel', 'industrial', 'loft', 'factory'] },
    { name: 'vintage', patterns: ['vintage', 'rétro', 'retro', 'années'] },
    { name: 'rustique', patterns: ['rustique', 'rustic', 'campagne', 'country'] },
    { name: 'classique', patterns: ['classique', 'classic', 'traditionnel', 'traditional'] },
    { name: 'minimaliste', patterns: ['minimaliste', 'minimalist', 'épuré', 'simple'] },
    { name: 'bohème', patterns: ['bohème', 'boho', 'bohemian', 'ethnique'] }
  ];
  
  const styles = stylePatterns
    .filter(({ patterns }) => patterns.some(pattern => text.includes(pattern)))
    .map(({ name }) => name);

  // Enhanced room detection
  const roomPatterns = [
    { name: 'salon', patterns: ['salon', 'living', 'séjour', 'pièce à vivre'] },
    { name: 'chambre', patterns: ['chambre', 'bedroom', 'chambre à coucher'] },
    { name: 'cuisine', patterns: ['cuisine', 'kitchen', 'coin repas'] },
    { name: 'bureau', patterns: ['bureau', 'office', 'espace de travail'] },
    { name: 'salle à manger', patterns: ['salle à manger', 'dining', 'coin repas'] },
    { name: 'entrée', patterns: ['entrée', 'entrance', 'hall', 'vestibule'] }
  ];
  
  const room = roomPatterns
    .filter(({ patterns }) => patterns.some(pattern => text.includes(pattern)))
    .map(({ name }) => name);

  // Enhanced features extraction
  const featurePatterns = [
    { name: 'convertible', patterns: ['convertible', 'couchage', 'lit d\'appoint'] },
    { name: 'réversible', patterns: ['réversible', 'reversible', 'angle réversible'] },
    { name: 'rangement intégré', patterns: ['rangement', 'storage', 'coffre', 'compartiment'] },
    { name: 'tiroirs', patterns: ['tiroir', 'tiroirs', 'drawer', 'drawers'] },
    { name: 'roulettes', patterns: ['roulettes', 'wheels', 'roulant', 'mobile'] },
    { name: 'réglable en hauteur', patterns: ['réglable', 'adjustable', 'hauteur variable'] },
    { name: 'pivotant', patterns: ['pivotant', 'swivel', 'rotatif'] },
    { name: 'déhoussable', patterns: ['déhoussable', 'removable cover', 'housse amovible'] },
    { name: 'empilable', patterns: ['empilable', 'stackable', 'empilage'] },
    { name: 'pliable', patterns: ['pliable', 'foldable', 'pliant'] },
    { name: 'extensible', patterns: ['extensible', 'extendable', 'rallonge'] }
  ];
  
  const features = featurePatterns
    .filter(({ patterns }) => patterns.some(pattern => text.includes(pattern)))
    .map(({ name }) => name);

  // Enhanced confidence calculation
  let confidence = 20; // Base score
  if (colors.length > 0) confidence += 20;
  if (materials.length > 0) confidence += 25;
  if (Object.keys(dimensions).length > 1) confidence += 20;
  if (styles.length > 0) confidence += 15;
  if (features.length > 0) confidence += 10;
  if (room.length > 0) confidence += 10;
  
  // Bonus for detailed subcategory
  if (subcategory.length > 20) confidence += 10;
  
  // Bonus for rich description
  const descriptionLength = (product.description || '').length;
  if (descriptionLength > 300) confidence += 5;
  
  // Extract capacity information
  const capacity: any = {};
  const seatsMatch = text.match(/(\d+)\s*places?/);
  if (seatsMatch) capacity.seats = parseInt(seatsMatch[1]);
  
  const storageMatch = text.match(/(\d+)\s*l(?:itres?)?/i);
  if (storageMatch) capacity.storage_volume = `${storageMatch[1]}L`;

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
    capacity: Object.keys(capacity).length > 0 ? capacity : undefined,
    technical_details: extractTechnicalDetails(text),
    confidence_score: Math.min(confidence, 100)
  };
}
function extractTechnicalDetails(text: string): any {
  const details: any = {};
  
  // Assembly
  if (text.includes('montage') || text.includes('assemblage')) {
    details.assembly_required = true;
  }
  
  // Warranty
  const warrantyMatch = text.match(/(?:garantie|warranty)\s*:?\s*(\d+)\s*(ans?|years?)/i);
  if (warrantyMatch) {
    details.warranty = `${warrantyMatch[1]} ans`;
  }
  
  // Origin
  const originMatch = text.match(/(?:fabriqué en|made in|origine)\s*:?\s*([a-zA-ZÀ-ÿ\s]+)/i);
  if (originMatch) {
    details.origin = originMatch[1].trim();
  }
  
  // Certifications
  const certifications = [];
  if (text.includes('fsc')) certifications.push('FSC');
  if (text.includes('pefc')) certifications.push('PEFC');
  if (text.includes('oeko-tex')) certifications.push('OEKO-TEX');
  if (certifications.length > 0) details.certifications = certifications;
  
  return Object.keys(details).length > 0 ? details : undefined;
}