/*
  # Recreate products_enriched table with complete data

  1. Drop and recreate table
    - Complete products_enriched table with all Google Shopping fields
    - Proper data types and constraints
    - Sample data from Decora Home catalog

  2. Security
    - Enable RLS
    - Add policies for public read and authenticated write

  3. Sample Data
    - ALYANA Canapé with complete attributes
    - AUREA Table with dimensions
    - INAYA Chaise with materials
*/

-- Drop existing table if exists
DROP TABLE IF EXISTS products_enriched CASCADE;

-- Create extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";
CREATE EXTENSION IF NOT EXISTS "pg_trgm";

-- Create complete products_enriched table
CREATE TABLE products_enriched (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    handle text UNIQUE NOT NULL,
    title text NOT NULL,
    description text DEFAULT '',
    category text DEFAULT '',
    subcategory text DEFAULT '',
    tags text[] DEFAULT '{}',
    color text DEFAULT '',
    material text DEFAULT '',
    fabric text DEFAULT '',
    style text DEFAULT '',
    dimensions text DEFAULT '',
    room text DEFAULT '',
    price numeric(10,2) DEFAULT 0,
    stock_qty integer DEFAULT 0,
    stock_quantity integer DEFAULT 0,
    image_url text DEFAULT '',
    product_url text DEFAULT '',
    
    -- Dimensions détaillées
    product_length numeric(8,2),
    product_width numeric(8,2), 
    product_height numeric(8,2),
    product_depth numeric(8,2),
    product_diameter numeric(8,2),
    dimension_unit text DEFAULT 'cm',
    
    -- SEO
    seo_title text DEFAULT '',
    seo_description text DEFAULT '',
    
    -- Google Shopping
    google_product_category text DEFAULT '',
    gtin text DEFAULT '',
    brand text DEFAULT 'Decora Home',
    
    -- Marketing
    ad_headline text DEFAULT '',
    ad_description text DEFAULT '',
    
    -- Metadata
    confidence_score integer DEFAULT 0,
    enriched_at timestamptz DEFAULT now(),
    enrichment_source text DEFAULT 'manual',
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now()
);

-- Create indexes
CREATE INDEX idx_products_enriched_category ON products_enriched(category);
CREATE INDEX idx_products_enriched_price ON products_enriched(price);
CREATE INDEX idx_products_enriched_stock ON products_enriched(stock_qty);
CREATE INDEX idx_products_enriched_search ON products_enriched USING gin(to_tsvector('french', title || ' ' || description));

-- Enable RLS
ALTER TABLE products_enriched ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Public can read active products"
ON products_enriched FOR SELECT
USING (stock_qty > 0);

CREATE POLICY "Authenticated users can manage products"
ON products_enriched FOR ALL
USING (true)
WITH CHECK (true);

-- Insert sample data from Decora Home catalog
INSERT INTO products_enriched (
    handle, title, description, category, subcategory, tags,
    color, material, fabric, style, dimensions, room,
    price, stock_qty, stock_quantity, image_url, product_url,
    product_length, product_width, product_height, product_depth, product_diameter,
    seo_title, seo_description, google_product_category, gtin, brand,
    ad_headline, ad_description, confidence_score, enrichment_source
) VALUES 
(
    'canape-alyana-beige',
    'Canapé d''angle convertible ALYANA 4 places en velours côtelé beige',
    'Canapé d''angle moderne en velours côtelé beige avec coffre de rangement intégré et fonction convertible, parfait pour un salon design et pratique.',
    'Canapé',
    'Canapé d''angle',
    ARRAY['convertible', 'velours', 'beige', 'angle', 'rangement'],
    'Beige',
    'Velours côtelé, bois, métal',
    'Velours côtelé',
    'Moderne',
    '240x160x75cm',
    'Salon',
    799.00,
    45,
    45,
    'https://cdn.shopify.com/s/files/1/0903/7578/2665/files/7_23a97631-68d2-4f3e-8f78-b26c7cd4c2ae.png',
    'https://decorahome.fr/products/canape-alyana-velours-beige',
    240.0,
    160.0,
    75.0,
    90.0,
    NULL,
    'Canapé Convertible ALYANA Beige - Design Moderne | Decora Home',
    'Découvrez le canapé convertible ALYANA en velours côtelé beige. Design moderne, 4 places, coffre de rangement. Livraison gratuite.',
    'Furniture > Living Room Furniture > Sofas',
    '3701234567890',
    'Decora Home',
    'Canapé ALYANA Convertible',
    'Velours côtelé premium, 4 places, convertible avec coffre. Design moderne pour salon.',
    95,
    'deepseek_ai'
),
(
    'table-aurea-travertin-100',
    'Table à manger ronde AUREA plateau travertin naturel Ø100cm',
    'Table ronde élégante en travertin naturel avec pieds métal noir, parfaite pour 4 personnes. Design contemporain et matériaux nobles.',
    'Table',
    'Table à manger',
    ARRAY['travertin', 'ronde', 'naturel', 'métal'],
    'Naturel, Travertin',
    'Travertin naturel, métal noir',
    '',
    'Contemporain',
    'Ø100x75cm',
    'Salle à manger',
    499.00,
    30,
    30,
    'https://cdn.shopify.com/s/files/1/0903/7578/2665/files/3_e80b9a50-b032-4267-8f5b-f9130153e3be.png',
    'https://decorahome.fr/products/table-aurea-travertin-100cm',
    100.0,
    100.0,
    75.0,
    NULL,
    100.0,
    'Table Ronde AUREA Travertin Ø100cm - Élégance Naturelle',
    'Table à manger ronde AUREA en travertin naturel. Design élégant, pieds métal noir. Parfaite pour 4 personnes.',
    'Furniture > Tables > Dining Tables',
    '3701234567891',
    'Decora Home',
    'Table AUREA Travertin',
    'Élégance naturelle, travertin authentique, design contemporain. Ø100cm.',
    92,
    'vision_ai'
),
(
    'chaise-inaya-gris-chenille',
    'Chaise INAYA en tissu chenille et pieds métal noir - Gris clair',
    'Chaise contemporaine en tissu chenille gris avec structure métal noir mat. Design baguette épuré et moderne pour salle à manger.',
    'Chaise',
    'Chaise de salle à manger',
    ARRAY['chenille', 'métal', 'gris', 'contemporain'],
    'Gris clair',
    'Chenille, métal noir',
    'Chenille',
    'Contemporain',
    '45x55x85cm',
    'Salle à manger',
    99.00,
    96,
    96,
    'https://cdn.shopify.com/s/files/1/0903/7578/2665/files/3_3f11d1af-8ce5-4d2d-a435-cd0a78eb92ee.png',
    'https://decorahome.fr/products/chaise-inaya-gris-chenille',
    45.0,
    55.0,
    85.0,
    50.0,
    NULL,
    'Chaise INAYA Gris Chenille - Design Contemporain | Decora Home',
    'Chaise INAYA en tissu chenille gris avec pieds métal noir. Design contemporain et confort optimal.',
    'Furniture > Chairs > Dining Chairs',
    '3701234567892',
    'Decora Home',
    'Chaise INAYA Design',
    'Tissu chenille premium, pieds métal noir, design contemporain élégant.',
    88,
    'ai_extraction'
),
(
    'table-aurea-travertin-120',
    'Table à manger ronde AUREA plateau travertin naturel Ø120cm',
    'Table ronde élégante en travertin naturel avec pieds métal noir, parfaite pour 6 personnes. Design contemporain et matériaux nobles.',
    'Table',
    'Table à manger',
    ARRAY['travertin', 'ronde', 'naturel', 'métal', 'grande'],
    'Naturel, Travertin',
    'Travertin naturel, métal noir',
    '',
    'Contemporain',
    'Ø120x75cm',
    'Salle à manger',
    549.00,
    25,
    25,
    'https://cdn.shopify.com/s/files/1/0903/7578/2665/files/2_89637aec-60b5-403f-9f0f-57c9a2fa42e4.png',
    'https://decorahome.fr/products/table-aurea-travertin-120cm',
    120.0,
    120.0,
    75.0,
    NULL,
    120.0,
    'Table Ronde AUREA Travertin Ø120cm - Grande Taille',
    'Table à manger ronde AUREA en travertin naturel Ø120cm. Design élégant pour 6 personnes.',
    'Furniture > Tables > Dining Tables',
    '3701234567893',
    'Decora Home',
    'Table AUREA 120cm',
    'Grande table travertin, 6 personnes, design contemporain élégant.',
    90,
    'manual'
),
(
    'chaise-inaya-moka-chenille',
    'Chaise INAYA en tissu chenille et pieds métal noir - Moka',
    'Chaise contemporaine en tissu chenille moka avec structure métal noir mat. Design baguette épuré et moderne pour salle à manger.',
    'Chaise',
    'Chaise de salle à manger',
    ARRAY['chenille', 'métal', 'moka', 'contemporain'],
    'Moka',
    'Chenille, métal noir',
    'Chenille',
    'Contemporain',
    '45x55x85cm',
    'Salle à manger',
    99.00,
    100,
    100,
    'https://cdn.shopify.com/s/files/1/0903/7578/2665/files/1_aae7ccd2-f2cb-4418-8c84-210ace00d753.png',
    'https://decorahome.fr/products/chaise-inaya-moka-chenille',
    45.0,
    55.0,
    85.0,
    50.0,
    NULL,
    'Chaise INAYA Moka Chenille - Design Contemporain | Decora Home',
    'Chaise INAYA en tissu chenille moka avec pieds métal noir. Design contemporain et confort optimal.',
    'Furniture > Chairs > Dining Chairs',
    '3701234567894',
    'Decora Home',
    'Chaise INAYA Moka',
    'Tissu chenille moka, pieds métal noir, design contemporain.',
    88,
    'ai_extraction'
);

-- Create trigger for updated_at
CREATE OR REPLACE FUNCTION update_products_enriched_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_products_enriched_updated_at
    BEFORE UPDATE ON products_enriched
    FOR EACH ROW
    EXECUTE FUNCTION update_products_enriched_updated_at();