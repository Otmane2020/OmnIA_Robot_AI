const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
};

import { createClient } from 'npm:@supabase/supabase-js@2';

interface SemanticSearchRequest {
  query: string;
  retailer_id?: string;
  limit?: number;
  filters?: {
    category?: string;
    material?: string;
    color?: string;
    style?: string;
    room?: string;
    price_max?: number;
    price_min?: number;
  };
}

interface IntentSearch {
  category?: string;
  material?: string;
  color?: string;
  style?: string;
  room?: string;
  shape?: string;
  price_max?: number;
  price_min?: number;
  keywords: string[];
  confidence: number;
}

interface SearchResult {
  product: any;
  relevance_score: number;
  matched_attributes: string[];
  intent_match: boolean;
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, {
      status: 200,
      headers: corsHeaders,
    });
  }

  try {
    const { query, retailer_id = 'demo-retailer-id', limit = 10, filters = {} }: SemanticSearchRequest = await req.json();
    
    console.log('🔍 Recherche sémantique:', query);
    console.log('🎯 Filtres:', filters);

    // Initialize Supabase
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // 🧠 ÉTAPE 1: Analyser l'intention avec IA
    const searchIntent = await analyzeSearchIntentWithAI(query);
    console.log('🧠 Intention extraite:', searchIntent);

    // 🔍 ÉTAPE 2: Recherche dans products_enriched avec filtrage dynamique
    const searchResults = await searchEnrichedProducts(supabase, searchIntent, filters, limit);
    console.log('📦 Produits trouvés:', searchResults.length);

    // 🎯 ÉTAPE 3: Scorer et classer les résultats
    const scoredResults = searchResults.map(product => ({
      ...product,
      relevance_score: calculateSemanticRelevance(product, searchIntent),
      matched_attributes: getMatchedAttributes(product, searchIntent),
      intent_match: hasIntentMatch(product, searchIntent)
    })).sort((a, b) => b.relevance_score - a.relevance_score);

    return new Response(
      JSON.stringify({
        success: true,
        query: query,
        intent: searchIntent,
        results: scoredResults.slice(0, limit),
        total_found: scoredResults.length,
        search_time: new Date().toISOString()
      }),
      {
        headers: {
          'Content-Type': 'application/json',
          ...corsHeaders,
        },
      }
    );

  } catch (error) {
    console.error('❌ Erreur recherche sémantique:', error);
    
    return new Response(
      JSON.stringify({
        success: false,
        error: 'Erreur lors de la recherche sémantique',
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

async function analyzeSearchIntentWithAI(query: string): Promise<IntentSearch> {
  const deepseekApiKey = Deno.env.get('DEEPSEEK_API_KEY');
  
  if (!deepseekApiKey) {
    console.log('⚠️ DeepSeek non configuré, analyse basique');
    return analyzeSearchIntentBasic(query);
  }

  try {
    const prompt = `Analyse cette recherche mobilier et extrait l'intention au format JSON strict :

RECHERCHE: "${query}"

Extrait UNIQUEMENT ces attributs au format JSON :
{
  "category": "canapé|table|chaise|lit|rangement|meuble tv|decoration",
  "material": "bois|métal|verre|tissu|cuir|velours|travertin|marbre|plastique|rotin",
  "color": "blanc|noir|gris|beige|marron|bleu|vert|rouge|jaune|orange|rose|violet|naturel|chêne|noyer|taupe",
  "style": "moderne|contemporain|scandinave|industriel|vintage|rustique|classique|minimaliste|bohème",
  "room": "salon|chambre|cuisine|bureau|salle à manger|entrée|terrasse",
  "shape": "rond|carré|rectangulaire|ovale|angle",
  "price_max": 500,
  "price_min": 100,
  "keywords": ["mot1", "mot2"],
  "confidence": 85
}

RÈGLES:
- Utilise UNIQUEMENT les valeurs listées
- Si information manquante, ne pas inclure la clé
- confidence: 0-100 basé sur la clarté de l'intention
- keywords: mots-clés importants extraits

RÉPONSE JSON UNIQUEMENT:`;

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
            content: 'Tu es un expert en analyse d\'intention de recherche mobilier. Réponds uniquement en JSON valide.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        max_tokens: 300,
        temperature: 0.1,
        stream: false
      }),
    });

    if (response.ok) {
      const data = await response.json();
      const content = data.choices[0]?.message?.content?.trim();
      
      if (content) {
        try {
          const parsed = JSON.parse(content);
          console.log('✅ Intention IA extraite:', parsed);
          return {
            ...parsed,
            keywords: parsed.keywords || extractKeywordsBasic(query)
          };
        } catch (parseError) {
          console.log('⚠️ JSON invalide, fallback basique');
        }
      }
    }
  } catch (error) {
    console.log('⚠️ Erreur DeepSeek, fallback basique');
  }

  return analyzeSearchIntentBasic(query);
}

function analyzeSearchIntentBasic(query: string): IntentSearch {
  const lowerQuery = query.toLowerCase();
  
  // Détecter catégorie
  let category;
  if (lowerQuery.includes('canapé') || lowerQuery.includes('sofa')) category = 'canapé';
  else if (lowerQuery.includes('table')) category = 'table';
  else if (lowerQuery.includes('chaise') || lowerQuery.includes('fauteuil')) category = 'chaise';
  else if (lowerQuery.includes('lit') || lowerQuery.includes('matelas')) category = 'lit';
  else if (lowerQuery.includes('armoire') || lowerQuery.includes('commode')) category = 'rangement';
  else if (lowerQuery.includes('meuble tv') || lowerQuery.includes('télé')) category = 'meuble tv';

  // Détecter couleur
  let color;
  const colors = ['blanc', 'noir', 'gris', 'beige', 'marron', 'bleu', 'vert', 'rouge', 'jaune', 'orange', 'rose', 'violet', 'naturel', 'chêne', 'noyer', 'taupe'];
  for (const c of colors) {
    if (lowerQuery.includes(c)) {
      color = c;
      break;
    }
  }

  // Détecter matériau
  let material;
  const materials = ['bois', 'métal', 'verre', 'tissu', 'cuir', 'velours', 'travertin', 'marbre', 'plastique', 'rotin'];
  for (const m of materials) {
    if (lowerQuery.includes(m)) {
      material = m;
      break;
    }
  }

  // Détecter style
  let style;
  const styles = ['moderne', 'contemporain', 'scandinave', 'industriel', 'vintage', 'rustique', 'classique', 'minimaliste', 'bohème'];
  for (const s of styles) {
    if (lowerQuery.includes(s)) {
      style = s;
      break;
    }
  }

  // Détecter pièce
  let room;
  const rooms = ['salon', 'chambre', 'cuisine', 'bureau', 'salle à manger', 'entrée', 'terrasse'];
  for (const r of rooms) {
    if (lowerQuery.includes(r)) {
      room = r;
      break;
    }
  }

  // Détecter forme
  let shape;
  const shapes = ['rond', 'carré', 'rectangulaire', 'ovale', 'angle'];
  for (const sh of shapes) {
    if (lowerQuery.includes(sh)) {
      shape = sh;
      break;
    }
  }

  // Détecter prix
  const priceMatch = lowerQuery.match(/(?:sous|under|moins de|max|maximum)\s*(\d+)/);
  const price_max = priceMatch ? parseInt(priceMatch[1]) : undefined;

  const keywords = extractKeywordsBasic(query);
  
  // Calculer confiance
  let confidence = 30; // Base
  if (category) confidence += 25;
  if (color) confidence += 20;
  if (material) confidence += 20;
  if (style) confidence += 15;
  if (room) confidence += 10;
  if (shape) confidence += 10;
  if (price_max) confidence += 10;

  return {
    category,
    material,
    color,
    style,
    room,
    shape,
    price_max,
    keywords,
    confidence: Math.min(confidence, 100)
  };
}

function extractKeywordsBasic(query: string): string[] {
  return query
    .toLowerCase()
    .split(/\s+/)
    .filter(word => word.length > 2)
    .filter(word => !['le', 'la', 'les', 'un', 'une', 'des', 'du', 'de', 'pour', 'avec', 'sans', 'dans', 'sur'].includes(word));
}

async function searchEnrichedProducts(supabase: any, intent: IntentSearch, filters: any, limit: number) {
  try {
    console.log('🔍 Recherche dans products_enriched...');

    // Construire la requête dynamique
    let query = supabase
      .from('products_enriched')
      .select('*')
      .gt('stock_qty', 0);

    // Filtrage par intention détectée
    if (intent.category) {
      query = query.or(`type.ilike.%${intent.category}%,category.ilike.%${intent.category}%`);
    }

    if (intent.color) {
      query = query.ilike('color', `%${intent.color}%`);
    }

    if (intent.material) {
      query = query.ilike('material', `%${intent.material}%`);
    }

    if (intent.style) {
      query = query.ilike('style', `%${intent.style}%`);
    }

    if (intent.room) {
      query = query.ilike('room', `%${intent.room}%`);
    }

    // Filtrage par prix
    if (intent.price_max) {
      query = query.lte('price', intent.price_max);
    }

    if (intent.price_min) {
      query = query.gte('price', intent.price_min);
    }

    // Filtres additionnels
    if (filters.category) {
      query = query.ilike('category', `%${filters.category}%`);
    }

    if (filters.material) {
      query = query.ilike('material', `%${filters.material}%`);
    }

    if (filters.color) {
      query = query.ilike('color', `%${filters.color}%`);
    }

    if (filters.price_max) {
      query = query.lte('price', filters.price_max);
    }

    if (filters.price_min) {
      query = query.gte('price', filters.price_min);
    }

    // Recherche textuelle dans titre et description
    if (intent.keywords.length > 0) {
      const searchConditions = intent.keywords.map(keyword => 
        `title.ilike.%${keyword}%,description.ilike.%${keyword}%`
      ).join(',');
      query = query.or(searchConditions);
    }

    query = query.limit(limit * 2); // Récupérer plus pour le scoring

    const { data: products, error } = await query;

    if (error) {
      console.error('❌ Erreur requête products_enriched:', error);
      return [];
    }

    console.log('✅ Produits enrichis trouvés:', products?.length || 0);
    return products || [];

  } catch (error) {
    console.error('❌ Erreur recherche enrichie:', error);
    return [];
  }
}

function calculateSemanticRelevance(product: any, intent: IntentSearch): number {
  let score = 0;
  
  // Score de base pour correspondance exacte
  if (intent.category && (
    product.type?.toLowerCase().includes(intent.category) ||
    product.category?.toLowerCase().includes(intent.category)
  )) {
    score += 40;
  }

  // Score couleur
  if (intent.color && product.color?.toLowerCase().includes(intent.color)) {
    score += 25;
  }

  // Score matériau
  if (intent.material && (
    product.material?.toLowerCase().includes(intent.material) ||
    product.fabric?.toLowerCase().includes(intent.material)
  )) {
    score += 25;
  }

  // Score style
  if (intent.style && product.style?.toLowerCase().includes(intent.style)) {
    score += 20;
  }

  // Score pièce
  if (intent.room && product.room?.toLowerCase().includes(intent.room)) {
    score += 15;
  }

  // Score prix
  if (intent.price_max && product.price <= intent.price_max) {
    score += 10;
  }

  // Score mots-clés dans titre/description
  if (intent.keywords.length > 0) {
    const productText = `${product.title} ${product.description}`.toLowerCase();
    const keywordMatches = intent.keywords.filter(keyword => 
      productText.includes(keyword)
    );
    score += keywordMatches.length * 5;
  }

  return Math.min(score, 100);
}

function getMatchedAttributes(product: any, intent: IntentSearch): string[] {
  const matches = [];
  
  if (intent.category && (
    product.type?.toLowerCase().includes(intent.category) ||
    product.category?.toLowerCase().includes(intent.category)
  )) {
    matches.push('catégorie');
  }

  if (intent.color && product.color?.toLowerCase().includes(intent.color)) {
    matches.push('couleur');
  }

  if (intent.material && (
    product.material?.toLowerCase().includes(intent.material) ||
    product.fabric?.toLowerCase().includes(intent.material)
  )) {
    matches.push('matériau');
  }

  if (intent.style && product.style?.toLowerCase().includes(intent.style)) {
    matches.push('style');
  }

  if (intent.room && product.room?.toLowerCase().includes(intent.room)) {
    matches.push('pièce');
  }

  return matches;
}

function hasIntentMatch(product: any, intent: IntentSearch): boolean {
  return getMatchedAttributes(product, intent).length > 0;
}