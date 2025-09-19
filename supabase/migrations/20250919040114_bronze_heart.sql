/*
  # Fix products_enriched table and insert sample data

  1. Enable required extensions
  2. Fix table structure if needed
  3. Insert sample enriched products
  4. Set up proper RLS policies

  This migration fixes the uid() and @@ .. @@ syntax errors.
*/

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Ensure products_enriched table exists with proper structure
CREATE TABLE IF NOT EXISTS products_enriched (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    handle text,
    title text,
    description text,
    category text,
    type text,
    color text,
    material text,
    fabric text,
    style text,
    dimensions text,
    room text,
    price numeric,
    stock_qty integer DEFAULT 0,
    stock_quantity integer DEFAULT 0,
    image_url text,
    product_url text,
    created_at timestamp without time zone DEFAULT now(),
    subcategory text DEFAULT '',
    tags text[] DEFAULT '{}',
    seo_title text DEFAULT '',
    seo_description text DEFAULT '',
    ad_headline text DEFAULT '',
    ad_description text DEFAULT '',
    google_product_category text DEFAULT '',
    gtin text DEFAULT '',
    brand text DEFAULT '',
    confidence_score integer DEFAULT 0,
    enriched_at timestamp with time zone DEFAULT now(),
    enrichment_source text DEFAULT 'manual'
);

-- Enable RLS
ALTER TABLE products_enriched ENABLE ROW LEVEL SECURITY;

-- Create policies for public access to active products
CREATE POLICY IF NOT EXISTS "Public can read active products"
  ON products_enriched
  FOR SELECT
  TO anon, authenticated
  USING (stock_qty > 0);

-- Create policy for authenticated users to manage products
CREATE POLICY IF NOT EXISTS "Authenticated users can manage products"
  ON products_enriched
  FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Insert sample enriched products
INSERT INTO products_enriched (
    handle,
    title,
    description,
    category,
    type,
    color,
    material,
    fabric,
    style,
    dimensions,
    room,
    price,
    stock_qty,
    stock_quantity,
    image_url,
    product_url,
    subcategory,
    tags,
    seo_title,
    seo_description,
    ad_headline,
    ad_description,
    google_product_category,
    gtin,
    brand,
    confidence_score,
    enrichment_source
) VALUES
    (
        'canape-moderne-beige-3-places',
        'Canapé moderne beige 3 places',
        'Canapé confortable en tissu beige avec structure en bois massif. Design moderne et épuré, parfait pour votre salon contemporain.',
        'Canapé',
        'Canapé 3 places',
        'Beige, Naturel',
        'Bois massif, Tissu',
        'Tissu texturé',
        'Moderne, Contemporain',
        '200x90x85cm',
        'Salon',
        899.99,
        15,
        15,
        'https://images.pexels.com/photos/1350789/pexels-photo-1350789.jpeg?auto=compress&cs=tinysrgb&w=800',
        'https://example.com/canape-moderne-beige',
        'Canapé fixe',
        ARRAY['moderne', 'beige', 'salon', '3-places', 'confort'],
        'Canapé Moderne Beige 3 Places - Confort Premium | Decora Home',
        'Découvrez notre canapé moderne beige 3 places en tissu premium. Design contemporain, confort optimal. Livraison gratuite.',
        'Canapé Moderne Beige Premium',
        'Tissu premium, design contemporain, confort optimal pour salon moderne.',
        'Furniture > Living Room Furniture > Sofas',
        '3701234567890',
        'Decora Home',
        92,
        'vision_ai'
    ),
    (
        'table-chene-massif-180cm',
        'Table à manger chêne massif 180cm',
        'Table à manger rectangulaire en chêne massif naturel. Finition huilée, pieds en métal noir. Capacité 6-8 personnes.',
        'Table',
        'Table à manger',
        'Chêne naturel, Métal noir',
        'Chêne massif, Métal',
        '',
        'Industriel, Moderne',
        '180x90x75cm',
        'Salle à manger',
        1299.99,
        8,
        8,
        'https://images.pexels.com/photos/1571460/pexels-photo-1571460.jpeg?auto=compress&cs=tinysrgb&w=800',
        'https://example.com/table-chene-massif',
        'Table rectangulaire',
        ARRAY['chêne', 'massif', 'industriel', 'salle-a-manger', '6-places'],
        'Table Chêne Massif 180cm - Style Industriel | Decora Home',
        'Table à manger chêne massif 180cm style industriel. Finition huilée, pieds métal noir. Pour 6-8 personnes.',
        'Table Chêne Massif Industriel',
        'Chêne massif authentique, style industriel, capacité 6-8 personnes.',
        'Furniture > Tables > Dining Tables',
        '3701234567891',
        'Decora Home',
        88,
        'ai_extraction'
    ),
    (
        'fauteuil-scandinave-gris-clair',
        'Fauteuil scandinave gris clair',
        'Fauteuil au style scandinave en tissu gris clair avec pieds en bois naturel. Assise rembourrée pour un confort optimal.',
        'Fauteuil',
        'Fauteuil d\'appoint',
        'Gris clair, Bois naturel',
        'Bois, Tissu',
        'Tissu chenille',
        'Scandinave, Nordique',
        '75x80x85cm',
        'Salon, Chambre',
        349.99,
        12,
        12,
        'https://images.pexels.com/photos/586763/pexels-photo-586763.jpeg?auto=compress&cs=tinysrgb&w=800',
        'https://example.com/fauteuil-scandinave',
        'Fauteuil avec accoudoirs',
        ARRAY['scandinave', 'gris', 'bois', 'confort', 'nordique'],
        'Fauteuil Scandinave Gris Clair - Design Nordique | Decora Home',
        'Fauteuil scandinave gris clair avec pieds bois naturel. Design nordique authentique, confort optimal.',
        'Fauteuil Scandinave Confort',
        'Style nordique authentique, tissu premium, pieds bois naturel.',
        'Furniture > Chairs > Accent Chairs',
        '3701234567892',
        'Decora Home',
        85,
        'manual'
    )
ON CONFLICT (handle) DO UPDATE SET
    title = EXCLUDED.title,
    description = EXCLUDED.description,
    price = EXCLUDED.price,
    stock_qty = EXCLUDED.stock_qty,
    stock_quantity = EXCLUDED.stock_quantity,
    enriched_at = now();