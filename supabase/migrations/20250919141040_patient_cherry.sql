/*
  # Fix products_enriched table with proper PostgreSQL functions

  1. Extensions
    - Enable uuid-ossp and pgcrypto for UUID generation
    - Enable pg_trgm for text search

  2. Table Structure
    - Create products_enriched with all required fields
    - Use gen_random_uuid() instead of uid()
    - Add proper constraints and indexes

  3. Sample Data
    - Insert Decora Home products with complete attributes
    - All fields properly filled for Google Shopping

  4. Security
    - Enable RLS with proper policies
    - Use auth.uid() for Supabase authentication
*/

-- 1. Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";
CREATE EXTENSION IF NOT EXISTS "pg_trgm";

-- 2. Drop existing table if exists (clean start)
DROP TABLE IF EXISTS products_enriched CASCADE;

-- 3. Create products_enriched table with all required fields
CREATE TABLE products_enriched (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    handle text UNIQUE NOT NULL,
    title text NOT NULL,
    description text DEFAULT '',
    short_description text DEFAULT '',
    vendor text DEFAULT 'Decora Home',
    category text DEFAULT '',
    subcategory text DEFAULT '',
    tags text[] DEFAULT '{}',
    
    -- Physical attributes
    material text DEFAULT '',
    color text DEFAULT '',
    fabric text DEFAULT '',
    style text DEFAULT '',
    room text DEFAULT '',
    dimensions text DEFAULT '',
    weight numeric DEFAULT 0,
    capacity text DEFAULT '',
    
    -- Pricing
    price numeric DEFAULT 0,
    compare_at_price numeric,
    currency text DEFAULT 'EUR',
    
    -- Stock
    stock_qty integer DEFAULT 0,
    stock_quantity integer DEFAULT 0,
    available boolean DEFAULT true,
    
    -- URLs
    image_url text DEFAULT '',
    product_url text DEFAULT '',
    
    -- Dimensions (for Google Shopping)
    product_length numeric,
    product_width numeric,
    product_height numeric,
    product_depth numeric,
    product_diameter numeric,
    dimension_unit text DEFAULT 'cm',
    
    -- SEO fields
    seo_title text DEFAULT '',
    seo_description text DEFAULT '',
    slug text DEFAULT '',
    
    -- Google Shopping fields
    google_product_category text DEFAULT '',
    gtin text DEFAULT '',
    brand text DEFAULT 'Decora Home',
    
    -- Marketing fields
    ad_headline text DEFAULT '',
    ad_description text DEFAULT '',
    product_highlights text[] DEFAULT '{}',
    
    -- Custom labels for Google Ads
    custom_label_0 text DEFAULT '',
    custom_label_1 text DEFAULT '',
    custom_label_2 text DEFAULT '',
    custom_label_3 text DEFAULT '',
    custom_label_4 text DEFAULT '',
    
    -- AI enrichment
    confidence_score integer DEFAULT 0 CHECK (confidence_score >= 0 AND confidence_score <= 100),
    enriched_at timestamptz DEFAULT now(),
    enrichment_source text DEFAULT 'manual',
    
    -- Timestamps
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now()
);

-- 4. Create indexes for performance
CREATE INDEX idx_products_enriched_handle ON products_enriched(handle);
CREATE INDEX idx_products_enriched_category ON products_enriched(category, subcategory);
CREATE INDEX idx_products_enriched_price ON products_enriched(price);
CREATE INDEX idx_products_enriched_stock ON products_enriched(stock_quantity);
CREATE INDEX idx_products_enriched_search ON products_enriched USING gin(to_tsvector('french', title || ' ' || description));
CREATE INDEX idx_products_enriched_attributes ON products_enriched(color, material, style);
CREATE INDEX idx_products_enriched_room ON products_enriched(room);
CREATE INDEX idx_products_enriched_confidence ON products_enriched(confidence_score);

-- 5. Create trigger function for updated_at
CREATE OR REPLACE FUNCTION update_products_enriched_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 6. Create trigger
DROP TRIGGER IF EXISTS update_products_enriched_updated_at ON products_enriched;
CREATE TRIGGER update_products_enriched_updated_at
  BEFORE UPDATE ON products_enriched
  FOR EACH ROW
  EXECUTE FUNCTION update_products_enriched_updated_at();

-- 7. Insert complete Decora Home sample data
INSERT INTO products_enriched (
    handle, title, description, short_description, vendor, category, subcategory,
    material, color, fabric, style, room, dimensions, weight, capacity,
    price, compare_at_price, stock_qty, stock_quantity, available,
    image_url, product_url,
    product_length, product_width, product_height, product_depth, product_diameter,
    seo_title, seo_description, slug,
    google_product_category, gtin, brand,
    ad_headline, ad_description, product_highlights,
    custom_label_0, custom_label_1, custom_label_2, custom_label_3, custom_label_4,
    confidence_score, enrichment_source
) VALUES
(
    'canape-alyana-velours-beige',
    'Canapé d''angle convertible ALYANA 4 places en velours côtelé beige',
    'Canapé d''angle moderne en velours côtelé beige avec coffre de rangement intégré et fonction convertible, parfait pour un salon design et pratique. Structure en bois massif, pieds métal noir, déhoussable.',
    'Canapé convertible 4 places velours beige',
    'Decora Home',
    'Canapé', 'Canapé d''angle',
    'Velours côtelé, bois massif, métal', 'Beige, Velours côtelé', 'Velours côtelé', 'Moderne, Contemporain', 'Salon',
    '240x160x75cm', 45.5, '4 places',
    799.00, 1399.00, 45, 45, true,
    'https://cdn.shopify.com/s/files/1/0903/7578/2665/files/7_23a97631-68d2-4f3e-8f78-b26c7cd4c2ae.png',
    'https://decorahome.fr/products/canape-alyana-velours-beige',
    240, 160, 75, 90, NULL,
    'Canapé Convertible ALYANA Beige - Design Moderne | Decora Home',
    'Découvrez le canapé convertible ALYANA en velours côtelé beige. Design moderne, 4 places, coffre de rangement. Livraison gratuite.',
    'canape-alyana-velours-beige',
    'Furniture > Living Room Furniture > Sofas', '3701234567890', 'Decora Home',
    'Canapé ALYANA Convertible', 'Velours côtelé premium, 4 places, convertible avec coffre. Design moderne pour salon.',
    '{"Canapé convertible en 2 secondes", "Tissu déhoussable lavable en machine", "Fabriqué en France"}',
    'promo', 'marge_forte', 'best_seller', 'saison_hiver', 'premium',
    95, 'deepseek_ai'
),
(
    'table-aurea-travertin-100cm',
    'Table à manger ronde AUREA plateau travertin naturel Ø100cm',
    'Table ronde élégante en travertin naturel avec pieds métal noir, parfaite pour 4 personnes. Design contemporain et matériaux nobles pour une salle à manger raffinée.',
    'Table ronde travertin Ø100cm',
    'Decora Home',
    'Table', 'Table à manger',
    'Travertin naturel, métal noir', 'Naturel, Travertin', '', 'Contemporain, Minéral', 'Salle à manger',
    'Ø100x75cm', 28.0, '4 personnes',
    499.00, 859.00, 30, 30, true,
    'https://cdn.shopify.com/s/files/1/0903/7578/2665/files/3_e80b9a50-b032-4267-8f5b-f9130153e3be.png',
    'https://decorahome.fr/products/table-aurea-travertin-100cm',
    100, 100, 75, NULL, 100,
    'Table Ronde AUREA Travertin Ø100cm - Élégance Naturelle',
    'Table à manger ronde AUREA en travertin naturel. Design élégant, pieds métal noir. Parfaite pour 4 personnes.',
    'table-aurea-travertin-100cm',
    'Furniture > Tables > Dining Tables', '3701234567891', 'Decora Home',
    'Table AUREA Travertin', 'Élégance naturelle, travertin authentique, design contemporain. Ø100cm.',
    '{"Travertin naturel véritable", "Pieds métal noir ultra-stables", "Design contemporain intemporel"}',
    'standard', 'marge_moyenne', 'tendance', 'saison_hiver', 'premium',
    92, 'deepseek_ai'
),
(
    'chaise-inaya-chenille-gris',
    'Chaise INAYA en tissu chenille et pieds métal noir - Gris clair',
    'Chaise contemporaine en tissu chenille gris avec pieds métal noir. Design baguette épuré et moderne, structure solide pour un confort optimal et une note industrielle chic.',
    'Chaise chenille gris pieds métal',
    'Decora Home',
    'Chaise', 'Chaise de salle à manger',
    'Chenille, métal noir', 'Gris, Chenille', 'Chenille', 'Contemporain, Design', 'Salle à manger',
    '45x55x85cm', 6.2, '1 personne',
    99.00, 149.00, 96, 96, true,
    'https://cdn.shopify.com/s/files/1/0903/7578/2665/files/3_3f11d1af-8ce5-4d2d-a435-cd0a78eb92ee.png',
    'https://decorahome.fr/products/chaise-inaya-chenille-gris',
    45, 55, 85, 50, NULL,
    'Chaise INAYA Gris Chenille - Design Contemporain | Decora Home',
    'Chaise INAYA en tissu chenille gris avec pieds métal noir. Design contemporain et confort optimal.',
    'chaise-inaya-chenille-gris',
    'Furniture > Chairs > Dining Chairs', '3701234567892', 'Decora Home',
    'Chaise INAYA Design', 'Tissu chenille premium, pieds métal noir, design contemporain élégant.',
    '{"Tissu chenille ultra-doux", "Pieds métal noir anti-rayures", "Design baguette moderne"}',
    'promo', 'marge_forte', 'nouveau', 'saison_hiver', 'standard',
    88, 'deepseek_ai'
);

-- 8. Enable Row Level Security
ALTER TABLE products_enriched ENABLE ROW LEVEL SECURITY;

-- 9. Create RLS policies using auth.uid() (Supabase function)
CREATE POLICY "Public can read active products"
  ON products_enriched
  FOR SELECT
  TO anon, authenticated
  USING (available = true AND stock_quantity > 0);

CREATE POLICY "Authenticated users can manage products"
  ON products_enriched
  FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- 10. Create function to sync from ai_products to products_enriched
CREATE OR REPLACE FUNCTION sync_to_products_enriched()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO products_enriched (
    handle, title, description, category, material, color, style, room,
    price, stock_quantity, image_url, product_url, vendor, brand,
    confidence_score, enrichment_source, created_at, updated_at
  ) VALUES (
    COALESCE(NEW.id, gen_random_uuid()::text),
    NEW.name,
    NEW.description,
    NEW.category,
    COALESCE((NEW.extracted_attributes->>'materials')::text, ''),
    COALESCE((NEW.extracted_attributes->>'colors')::text, ''),
    COALESCE((NEW.extracted_attributes->>'styles')::text, ''),
    COALESCE((NEW.extracted_attributes->>'room')::text, ''),
    NEW.price,
    NEW.stock,
    NEW.image_url,
    NEW.product_url,
    NEW.vendor,
    NEW.vendor,
    NEW.confidence_score,
    'ai_sync',
    NEW.created_at,
    NEW.updated_at
  )
  ON CONFLICT (handle) DO UPDATE SET
    title = EXCLUDED.title,
    description = EXCLUDED.description,
    price = EXCLUDED.price,
    stock_quantity = EXCLUDED.stock_quantity,
    updated_at = now();
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 11. Create trigger for auto-sync
DROP TRIGGER IF EXISTS sync_ai_to_enriched ON ai_products;
CREATE TRIGGER sync_ai_to_enriched
  AFTER INSERT OR UPDATE ON ai_products
  FOR EACH ROW
  WHEN (NEW.stock > 0)
  EXECUTE FUNCTION sync_to_products_enriched();