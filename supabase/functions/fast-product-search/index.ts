const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
};

import { createClient } from 'npm:@supabase/supabase-js@2';

interface FastSearchRequest {
  attributes: {
    category?: string;
    subcategory?: string;
    color?: string;
    material?: string;
    style?: string;
    room?: string;
    price_max?: number;
    price_min?: number;
    features?: string[];
  };
  retailer_id?: string;
  limit?: number;
}

interface ProductResult {
  id: string;
  title: string;
  category: string;
  subcategory: string;
  color: string;
  material: string;
  style: string;
  price: number;
  stock_qty: number;
  image_url: string;
  product_url: string;
  confidence_score: number;
  relevance_score: number;
  matched_attributes: string[];
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, {
      status: 200,
      headers: corsHeaders,
    });
  }

  try {
    const { attributes, retailer_id, limit = 5 }: FastSearchRequest = await req.json();
    
    console.log('⚡ [fast-search] Recherche rapide:', attributes);

    const startTime = Date.now();

    // Initialize Supabase
    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
    
    if (!supabaseUrl || !supabaseKey) {
      throw new Error('Configuration Supabase manquante');
    }
    
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Construire la requête SQL optimisée
    let query = supabase
      .from('products_enriched')
      .select(`
        id, handle, title, category, subcategory, color, material, 
        style, dimensions, room, price, stock_qty, image_url, 
        product_url, confidence_score, brand, retailer_id
      `)
      .gt('stock_qty', 0);

    // Filtrage par retailer si spécifié
    if (retailer_id) {
      const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(retailer_id);
      if (isUuid) {
        query = query.eq('retailer_id', retailer_id);
      }
    }

    // Filtrage par attributs (ordre de priorité)
    if (attributes.category) {
      query = query.or(`category.ilike.%${attributes.category}%,subcategory.ilike.%${attributes.category}%`);
    }

    if (attributes.subcategory) {
      query = query.ilike('subcategory', `%${attributes.subcategory}%`);
    }

    if (attributes.color) {
      query = query.ilike('color', `%${attributes.color}%`);
    }

    if (attributes.material) {
      query = query.or(`material.ilike.%${attributes.material}%,fabric.ilike.%${attributes.material}%`);
    }

    if (attributes.style) {
      query = query.ilike('style', `%${attributes.style}%`);
    }

    if (attributes.room) {
      query = query.ilike('room', `%${attributes.room}%`);
    }

    // Filtrage par prix
    if (attributes.price_max) {
      query = query.lte('price', attributes.price_max);
    }
    if (attributes.price_min) {
      query = query.gte('price', attributes.price_min);
    }

    // Ordonner par confiance IA et limiter
    query = query
      .order('confidence_score', { ascending: false })
      .order('price', { ascending: true })
      .limit(limit * 2); // Récupérer plus pour le scoring

    const { data: rawProducts, error } = await query;

    if (error) {
      console.error('❌ [fast-search] Erreur DB:', error);
      throw error;
    }

    const products = rawProducts || [];
    console.log('📦 [fast-search] Produits bruts trouvés:', products.length);

    // Scorer les produits par pertinence
    const scoredProducts = scoreProductRelevance(products, attributes);
    
    // Limiter aux meilleurs résultats
    const finalResults = scoredProducts.slice(0, limit);

    const searchTime = Date.now() - startTime;
    console.log(`⚡ [fast-search] Recherche terminée en ${searchTime}ms:`, finalResults.length, 'produits');

    return new Response(
      JSON.stringify({
        success: true,
        products: finalResults,
        total_found: scoredProducts.length,
        search_time_ms: searchTime,
        attributes_used: attributes,
        retailer_id
      }),
      {
        headers: {
          'Content-Type': 'application/json',
          ...corsHeaders,
        },
      }
    );

  } catch (error) {
    console.error('❌ [fast-search] Erreur recherche:', error);
    
    return new Response(
      JSON.stringify({
        success: false,
        error: 'Erreur lors de la recherche rapide',
        details: error.message,
        products: []
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

function scoreProductRelevance(products: any[], searchAttributes: any): ProductResult[] {
  return products.map(product => {
    let score = 0;
    const matches: string[] = [];

    // Score catégorie (priorité maximale)
    if (searchAttributes.category && (
      product.category?.toLowerCase().includes(searchAttributes.category.toLowerCase()) ||
      product.subcategory?.toLowerCase().includes(searchAttributes.category.toLowerCase())
    )) {
      score += 40;
      matches.push('catégorie');
    }

    // Score sous-catégorie
    if (searchAttributes.subcategory && 
        product.subcategory?.toLowerCase().includes(searchAttributes.subcategory.toLowerCase())) {
      score += 30;
      matches.push('sous-catégorie');
    }

    // Score couleur
    if (searchAttributes.color && 
        product.color?.toLowerCase().includes(searchAttributes.color.toLowerCase())) {
      score += 25;
      matches.push('couleur');
    }

    // Score matériau
    if (searchAttributes.material && (
      product.material?.toLowerCase().includes(searchAttributes.material.toLowerCase()) ||
      product.fabric?.toLowerCase().includes(searchAttributes.material.toLowerCase())
    )) {
      score += 20;
      matches.push('matériau');
    }

    // Score style
    if (searchAttributes.style && 
        product.style?.toLowerCase().includes(searchAttributes.style.toLowerCase())) {
      score += 15;
      matches.push('style');
    }

    // Score pièce
    if (searchAttributes.room && 
        product.room?.toLowerCase().includes(searchAttributes.room.toLowerCase())) {
      score += 10;
      matches.push('pièce');
    }

    // Score prix
    if (searchAttributes.price_max && product.price <= searchAttributes.price_max) {
      score += 10;
      matches.push('prix');
    }

    // Bonus confiance IA
    score += (product.confidence_score || 0) * 0.1;

    // Bonus stock élevé
    if (product.stock_qty > 10) score += 5;

    return {
      id: product.id,
      title: product.title,
      category: product.category,
      subcategory: product.subcategory,
      color: product.color,
      material: product.material,
      style: product.style,
      price: product.price,
      stock_qty: product.stock_qty,
      image_url: product.image_url,
      product_url: product.product_url,
      confidence_score: product.confidence_score,
      relevance_score: Math.min(score, 100),
      matched_attributes: matches
    };
  }).sort((a, b) => b.relevance_score - a.relevance_score);
}