/*
  # Fix products_enriched table with all required fields

  1. Extensions
    - Enable UUID and crypto extensions
  
  2. Table Structure
    - Create/update products_enriched with all required fields
    - Add dimensions, SEO, Google Shopping fields
    - Add proper indexes for performance
  
  3. Security
    - Enable RLS
    - Add policies for read/write access
  
  4. Triggers
    - Auto-update timestamp trigger
  
  5. Sample Data
    - Insert realistic Decora Home products
*/

-- 1. Activer les extensions nécessaires
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- 2. Créer/corriger la table products_enriched
DROP TABLE IF EXISTS products_enriched CASCADE;

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
    
    -- Attributs physiques
    material text DEFAULT '',
    color text DEFAULT '',
    fabric text DEFAULT '',
    style text DEFAULT '',
    room text DEFAULT '',
    dimensions text DEFAULT '',
    weight numeric DEFAULT 0,
    capacity text DEFAULT '',
    
    -- Prix et stock
    price numeric DEFAULT 0,
    compare_at_price numeric,
    currency text DEFAULT 'EUR',
    stock_qty integer DEFAULT 0,
    stock_quantity integer DEFAULT 0,
    
    -- URLs et images
    image_url text DEFAULT '',
    product_url text DEFAULT '',
    gallery_images jsonb DEFAULT '[]',
    
    -- Dimensions détaillées
    product_length numeric,
    product_width numeric,
    product_height numeric,
    product_depth numeric,
    product_diameter numeric,
    dimension_unit text DEFAULT 'cm',
    
    -- SEO
    seo_title text DEFAULT '',
    seo_description text DEFAULT '',
    slug text DEFAULT '',
    
    -- Codes produit
    sku text DEFAULT '',
    gtin text DEFAULT '',
    mpn text DEFAULT '',
    
    -- Google Shopping
    google_product_category text DEFAULT '',
    product_type text DEFAULT '',
    condition text DEFAULT 'new',
    availability text DEFAULT 'in stock',
    brand text DEFAULT 'Decora Home',
    
    -- Marketing
    ad_headline text DEFAULT '',
    ad_description text DEFAULT '',
    product_highlights text[] DEFAULT '{}',
    custom_label_0 text DEFAULT '',
    custom_label_1 text DEFAULT '',
    custom_label_2 text DEFAULT '',
    custom_label_3 text DEFAULT '',
    custom_label_4 text DEFAULT '',
    
    -- Métadonnées
    confidence_score integer DEFAULT 0,
    enriched_at timestamptz DEFAULT now(),
    enrichment_source text DEFAULT 'manual',
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now()
);

-- 3. Trigger pour updated_at
CREATE OR REPLACE FUNCTION update_products_enriched_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_products_enriched_updated_at
BEFORE UPDATE ON products_enriched
FOR EACH ROW
EXECUTE FUNCTION update_products_enriched_timestamp();

-- 4. Index pour performance
CREATE INDEX IF NOT EXISTS idx_products_enriched_category ON products_enriched(category);
CREATE INDEX IF NOT EXISTS idx_products_enriched_price ON products_enriched(price);
CREATE INDEX IF NOT EXISTS idx_products_enriched_stock ON products_enriched(stock_qty);
CREATE INDEX IF NOT EXISTS idx_products_enriched_title_search ON products_enriched USING gin(to_tsvector('french', title));
CREATE INDEX IF NOT EXISTS idx_products_enriched_description_search ON products_enriched USING gin(to_tsvector('french', description));

-- 5. Activer RLS et politiques
ALTER TABLE products_enriched ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow read access to everyone"
ON products_enriched
FOR SELECT
USING (true);

CREATE POLICY "Allow authenticated write"
ON products_enriched
FOR ALL
TO authenticated
USING (true)
WITH CHECK (true);

-- 6. Insérer des données d'exemple Decora Home
INSERT INTO products_enriched (
    handle, title, description, short_description, vendor, category, subcategory,
    material, color, fabric, style, room, dimensions, weight, capacity,
    price, compare_at_price, stock_qty, stock_quantity, image_url, product_url,
    product_length, product_width, product_height, product_depth, product_diameter,
    seo_title, seo_description, slug, sku, gtin, mpn,
    google_product_category, product_type, brand,
    ad_headline, ad_description, product_highlights,
    custom_label_0, custom_label_1, custom_label_2, custom_label_3, custom_label_4,
    confidence_score, enrichment_source
) VALUES
(
    'canape-alyana-beige-convertible',
    'Canapé d''angle convertible ALYANA 4 places en velours côtelé beige',
    'Canapé d''angle moderne en velours côtelé beige avec coffre de rangement intégré et fonction convertible, parfait pour un salon design et pratique. Structure en bois massif, pieds métal noir, assise haute densité.',
    'Canapé convertible 4 places velours beige',
    'Decora Home',
    'Canapé', 'Canapé d''angle',
    'Velours côtelé, bois massif, métal',
    'Beige, Velours côtelé',
    'Velours côtelé',
    'Moderne, Contemporain',
    'Salon',
    '240x160x75cm',
    45.5, '4 places',
    799.00, 1399.00,
    45, 45,
    'https://cdn.shopify.com/s/files/1/0903/7578/2665/files/7_23a97631-68d2-4f3e-8f78-b26c7cd4c2ae.png',
    'https://decorahome.fr/products/canape-dangle-convertible-et-reversible-4-places-en-velours-cotele',
    240, 160, 75, 90, NULL,
    'Canapé Convertible ALYANA Beige - Design Moderne | Decora Home',
    'Découvrez le canapé convertible ALYANA en velours côtelé beige. Design moderne, 4 places, coffre de rangement. Livraison gratuite.',
    'canape-alyana-beige-convertible',
    'ALYAAVCOTBEI-DH', '3701234567890', 'ALYANA-BEIGE-2025',
    'Furniture > Living Room Furniture > Sofas',
    'Mobilier > Salon > Canapés',
    'Decora Home',
    'Canapé ALYANA Convertible',
    'Velours côtelé premium, 4 places, convertible avec coffre. Design moderne pour salon.',
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
    'Travertin naturel, métal noir',
    'Naturel, Travertin',
    '',
    'Contemporain, Minéral',
    'Salle à manger',
    'Ø100x75cm',
    25.0, '4 personnes',
    499.00, 859.00,
    30, 30,
    'https://cdn.shopify.com/s/files/1/0903/7578/2665/files/3_e80b9a50-b032-4267-8f5b-f9130153e3be.png',
    'https://decorahome.fr/products/table-a-manger-ronde-plateau-en-travertin-naturel-100-120-cm',
    100, 100, 75, NULL, 100,
    'Table Ronde AUREA Travertin Ø100cm - Élégance Naturelle',
    'Table à manger ronde AUREA en travertin naturel. Design élégant, pieds métal noir. Parfaite pour 4 personnes.',
    'table-aurea-travertin-100cm',
    'TB18T100-DH', '3701234567891', 'AUREA-100-2025',
    'Furniture > Tables > Dining Tables',
    'Mobilier > Salle à manger > Tables',
    'Decora Home',
    'Table AUREA Travertin',
    'Élégance naturelle, travertin authentique, design contemporain. Ø100cm.',
    '{"Travertin naturel véritable", "Pieds métal noir ultra-stable", "Design intemporel"}',
    'stock', 'qualite_premium', 'tendance', 'saison_printemps', 'mineral',
    92, 'deepseek_ai'
),
(
    'chaise-inaya-gris-chenille',
    'Chaise INAYA en tissu chenille et pieds métal noir - Gris clair',
    'Chaise contemporaine en tissu chenille gris avec pieds métal noir. Design baguette épuré et moderne, structure solide pour un confort optimal.',
    'Chaise chenille gris pieds métal',
    'Decora Home',
    'Chaise', 'Chaise de salle à manger',
    'Chenille, métal noir',
    'Gris clair, Chenille',
    'Chenille',
    'Contemporain, Design',
    'Salle à manger',
    '45x55x85cm',
    6.5, '1 personne',
    99.00, 149.00,
    96, 96,
    'https://cdn.shopify.com/s/files/1/0903/7578/2665/files/3_3f11d1af-8ce5-4d2d-a435-cd0a78eb92ee.png',
    'https://decorahome.fr/products/chaise-en-tissu-serge-chenille-pieds-metal-noir-gris-clair-moka-et-beige',
    45, 55, 85, 45, NULL,
    'Chaise INAYA Gris Chenille - Design Contemporain | Decora Home',
    'Chaise INAYA en tissu chenille gris avec pieds métal noir. Design contemporain et confort optimal.',
    'chaise-inaya-gris-chenille',
    'DC11PNNCHLG-DH', '3701234567892', 'INAYA-GRIS-2025',
    'Furniture > Chairs > Dining Chairs',
    'Mobilier > Salle à manger > Chaises',
    'Decora Home',
    'Chaise INAYA Design',
    'Tissu chenille premium, pieds métal noir, design contemporain élégant.',
    '{"Tissu chenille ultra-doux", "Structure métal ultra-stable", "Design épuré moderne"}',
    'nouveau', 'confort', 'design', 'saison_automne', 'accessible',
    88, 'deepseek_ai'
);