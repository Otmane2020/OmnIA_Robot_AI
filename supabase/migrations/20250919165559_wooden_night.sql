/*
# Create products_enriched table with complete schema

1. New Tables
   - `products_enriched`
     - Complete product information with enriched attributes
     - SEO optimization fields
     - Google Shopping compatibility
     - Dimensional data and specifications
     - Stock and pricing information

2. Security
   - Enable RLS on `products_enriched` table
   - Add policy for public read access
   - Add policy for authenticated users to manage products

3. Features
   - Auto-update timestamp trigger
   - Sample Decora Home products
   - Full attribute support for AI enrichment
*/

-- 1. Extensions nécessaires
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";
CREATE EXTENSION IF NOT EXISTS "pg_trgm";

-- 2. Drop table si elle existe déjà
DROP TABLE IF EXISTS products_enriched CASCADE;

-- 3. Création de la table complète
CREATE TABLE IF NOT EXISTS products_enriched (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    handle TEXT UNIQUE,
    title TEXT NOT NULL,
    description TEXT,
    short_description TEXT,
    vendor TEXT DEFAULT 'Decora Home',
    brand TEXT DEFAULT 'Decora Home',
    category TEXT,
    subcategory TEXT DEFAULT '',
    type TEXT,
    tags TEXT[] DEFAULT '{}',
    
    -- Attributs physiques
    material TEXT DEFAULT '',
    fabric TEXT DEFAULT '',
    color TEXT DEFAULT '',
    style TEXT DEFAULT '',
    room TEXT DEFAULT '',
    
    -- Dimensions
    dimensions TEXT DEFAULT '', -- texte brut si besoin "200x90x75 cm"
    product_length NUMERIC,
    product_width NUMERIC,
    product_height NUMERIC,
    product_depth NUMERIC,
    product_diameter NUMERIC,
    dimension_unit TEXT DEFAULT 'cm',
    weight NUMERIC,
    capacity TEXT DEFAULT '',
    
    -- Prix et stock
    price NUMERIC NOT NULL DEFAULT 0,
    compare_at_price NUMERIC,
    currency TEXT DEFAULT 'EUR',
    stock_qty INTEGER DEFAULT 0,
    stock_quantity INTEGER DEFAULT 0,
    
    -- URLs et images
    image_url TEXT DEFAULT '',
    product_url TEXT DEFAULT '',
    
    -- SEO
    seo_title TEXT DEFAULT '',
    seo_description TEXT DEFAULT '',
    
    -- Google Shopping
    google_product_category TEXT DEFAULT '',
    gtin TEXT DEFAULT '',
    
    -- Publicité
    ad_headline TEXT DEFAULT '',
    ad_description TEXT DEFAULT '',
    
    -- Métadonnées
    confidence_score INTEGER DEFAULT 0,
    enriched_at TIMESTAMPTZ DEFAULT now(),
    enrichment_source TEXT DEFAULT 'manual',
    
    -- Timestamps
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now(),
    
    -- Contraintes
    CONSTRAINT products_enriched_confidence_check CHECK (confidence_score >= 0 AND confidence_score <= 100),
    CONSTRAINT products_enriched_seo_title_length CHECK (char_length(seo_title) <= 70),
    CONSTRAINT products_enriched_seo_desc_length CHECK (char_length(seo_description) <= 155),
    CONSTRAINT products_enriched_ad_headline_length CHECK (char_length(ad_headline) <= 30),
    CONSTRAINT products_enriched_ad_desc_length CHECK (char_length(ad_description) <= 90)
);

-- 4. Trigger pour maj automatique updated_at
CREATE OR REPLACE FUNCTION update_timestamp()
RETURNS TRIGGER AS $$
BEGIN
   NEW.updated_at = now();
   RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER IF NOT EXISTS set_timestamp
BEFORE UPDATE ON products_enriched
FOR EACH ROW
EXECUTE FUNCTION update_timestamp();

-- 5. Index pour les performances
CREATE INDEX IF NOT EXISTS idx_products_enriched_handle ON products_enriched USING btree (handle);
CREATE INDEX IF NOT EXISTS idx_products_enriched_category ON products_enriched USING btree (category);
CREATE INDEX IF NOT EXISTS idx_products_enriched_category_type ON products_enriched USING btree (category, subcategory);
CREATE INDEX IF NOT EXISTS idx_products_enriched_price ON products_enriched USING btree (price);
CREATE INDEX IF NOT EXISTS idx_products_enriched_stock ON products_enriched USING btree (stock_qty);
CREATE INDEX IF NOT EXISTS idx_products_enriched_stock_quantity ON products_enriched USING btree (stock_quantity);
CREATE INDEX IF NOT EXISTS idx_products_enriched_color ON products_enriched USING btree (color);
CREATE INDEX IF NOT EXISTS idx_products_enriched_material ON products_enriched USING btree (material);
CREATE INDEX IF NOT EXISTS idx_products_enriched_style ON products_enriched USING btree (style);
CREATE INDEX IF NOT EXISTS idx_products_enriched_room ON products_enriched USING btree (room);
CREATE INDEX IF NOT EXISTS idx_products_enriched_brand ON products_enriched USING btree (brand);
CREATE INDEX IF NOT EXISTS idx_products_enriched_type ON products_enriched USING btree (type);
CREATE INDEX IF NOT EXISTS idx_products_enriched_confidence ON products_enriched USING btree (confidence_score);
CREATE INDEX IF NOT EXISTS idx_products_enriched_enriched_at ON products_enriched USING btree (enriched_at DESC);
CREATE INDEX IF NOT EXISTS idx_products_enriched_google_category ON products_enriched USING btree (google_product_category);
CREATE INDEX IF NOT EXISTS idx_products_enriched_gtin ON products_enriched USING btree (gtin);
CREATE INDEX IF NOT EXISTS idx_products_enriched_attributes ON products_enriched USING btree (color, material, style);

-- Index de recherche textuelle
CREATE INDEX IF NOT EXISTS idx_products_enriched_title_search ON products_enriched USING gin (to_tsvector('french', title));
CREATE INDEX IF NOT EXISTS idx_products_enriched_description_search ON products_enriched USING gin (to_tsvector('french', description));
CREATE INDEX IF NOT EXISTS idx_products_enriched_search ON products_enriched USING gin (to_tsvector('french', title || ' ' || description));
CREATE INDEX IF NOT EXISTS idx_products_enriched_seo_search ON products_enriched USING gin (to_tsvector('french', seo_title || ' ' || seo_description));
CREATE INDEX IF NOT EXISTS idx_products_enriched_tags ON products_enriched USING gin (tags);
CREATE INDEX IF NOT EXISTS idx_products_enriched_tags_search ON products_enriched USING gin (tags);

-- 6. RLS (Row Level Security)
ALTER TABLE products_enriched ENABLE ROW LEVEL SECURITY;

-- Lecture publique pour tous
CREATE POLICY "Public can read active products"
ON products_enriched
FOR SELECT
USING (stock_qty > 0);

-- Gestion complète pour utilisateurs authentifiés
CREATE POLICY "Authenticated users can manage products"
ON products_enriched
FOR ALL
USING (true)
WITH CHECK (true);

-- 7. Données exemples complètes (Decora Home)
INSERT INTO products_enriched (
    handle, title, description, short_description, vendor, brand, category, subcategory, type, tags,
    material, fabric, color, style, room, dimensions,
    product_length, product_width, product_height, product_depth, product_diameter,
    price, compare_at_price, stock_qty, stock_quantity,
    image_url, product_url,
    seo_title, seo_description,
    ad_headline, ad_description,
    google_product_category, gtin,
    confidence_score, enrichment_source
) VALUES
(
    'canape-alyana-convertible-beige',
    'Canapé d''angle ALYANA convertible et réversible 4 places en velours côtelé beige',
    'Le canapé d''angle ALYANA a été spécialement conçu pour les professionnels à la recherche de mobilier à forte valeur décorative, sans compromis sur la praticité. Pensé pour les intérieurs contemporains et les petits espaces, ce canapé 4 places séduit par son design arrondi tendance, son revêtement en velours côtelé texturé, et ses fonctionnalités intelligentes : couchage intégré, angle réversible, coffre de rangement.',
    'Canapé d''angle convertible 4 places en velours côtelé beige avec coffre de rangement',
    'Decora Home', 'Decora Home', 'Canapé', 'Canapé d''angle', 'Canapé',
    ARRAY['convertible', 'réversible', 'velours', 'côtelé', 'angle', 'beige', 'rangement', 'couchage'],
    'Velours côtelé, bois massif, métal', 'Velours côtelé', 'Beige', 'Moderne', 'Salon',
    '240x160x75 cm (fermé), 240x200 cm (ouvert)',
    240, 160, 75, 90, NULL,
    799, 1399, 100, 100,
    'https://cdn.shopify.com/s/files/1/0903/7578/2665/files/7_23a97631-68d2-4f3e-8f78-b26c7cd4c2ae.png?v=1754406480',
    'https://decorahome.fr/products/canape-dangle-convertible-et-reversible-4-places-en-velours-cotele',
    'Canapé Convertible ALYANA Beige - Design Moderne | Decora Home',
    'Découvrez le canapé convertible ALYANA en velours côtelé beige. Design moderne, 4 places, coffre de rangement. Livraison gratuite.',
    'Canapé ALYANA Convertible',
    'Canapé d''angle convertible 4 places en velours côtelé beige avec coffre de rangement',
    'Furniture > Living Room Furniture > Sofas',
    '3701234567890',
    95, 'deepseek_ai'
),
(
    'table-aurea-travertin-100cm',
    'Table à manger ronde AUREA – Plateau en travertin naturel – Ø100 cm',
    'Apportez une touche d''élégance minérale à votre intérieur avec la table à manger AUREA, une pièce aux lignes douces et à la personnalité affirmée. Disponible en deux dimensions (Ø100 cm et Ø120 cm), elle s''intègre harmonieusement dans les espaces de vie modernes, épurés ou bohèmes.',
    'Table ronde en travertin naturel avec pieds métal noir',
    'Decora Home', 'Decora Home', 'Table', 'Table à manger', 'Table',
    ARRAY['travertin', 'naturel', 'ronde', 'élégant', 'minérale', 'métal noir'],
    'Travertin naturel, métal noir', '', 'Naturel, Beige', 'Contemporain', 'Salle à manger',
    'Ø100x75 cm',
    100, 100, 75, NULL, 100,
    499, 859, 50, 50,
    'https://cdn.shopify.com/s/files/1/0903/7578/2665/files/3_e80b9a50-b032-4267-8f5b-f9130153e3be.png?v=1754406484',
    'https://decorahome.fr/products/table-a-manger-ronde-plateau-en-travertin-naturel-100-120-cm',
    'Table Ronde AUREA Travertin Ø100cm - Élégance Naturelle',
    'Table à manger ronde AUREA en travertin naturel. Design élégant, pieds métal noir. Parfaite pour 4 personnes.',
    'Table AUREA Travertin',
    'Table ronde élégante en travertin naturel avec pieds métal noir, parfaite pour 4 personnes',
    'Furniture > Tables > Dining Tables',
    '3701234567891',
    92, 'deepseek_ai'
),
(
    'table-aurea-travertin-120cm',
    'Table à manger ronde AUREA – Plateau en travertin naturel – Ø120 cm',
    'Apportez une touche d''élégance minérale à votre intérieur avec la table à manger AUREA, une pièce aux lignes douces et à la personnalité affirmée. Cette version Ø120 cm peut accueillir jusqu''à 6 personnes confortablement.',
    'Table ronde en travertin naturel avec pieds métal noir - Grande taille',
    'Decora Home', 'Decora Home', 'Table', 'Table à manger', 'Table',
    ARRAY['travertin', 'naturel', 'ronde', 'élégant', 'minérale', 'métal noir', 'grande taille'],
    'Travertin naturel, métal noir', '', 'Naturel, Beige', 'Contemporain', 'Salle à manger',
    'Ø120x75 cm',
    120, 120, 75, NULL, 120,
    549, 909, 30, 30,
    'https://cdn.shopify.com/s/files/1/0903/7578/2665/files/2_89637aec-60b5-403f-9f0f-57c9a2fa42e4.png?v=1754406484',
    'https://decorahome.fr/products/table-a-manger-ronde-plateau-en-travertin-naturel-100-120-cm',
    'Table Ronde AUREA Travertin Ø120cm - Design Contemporain',
    'Table à manger ronde AUREA en travertin naturel Ø120cm. Design contemporain, pieds métal noir. Parfaite pour 6 personnes.',
    'Table AUREA 120cm',
    'Table ronde élégante en travertin naturel avec pieds métal noir, parfaite pour 6 personnes',
    'Furniture > Tables > Dining Tables',
    '3701234567892',
    92, 'deepseek_ai'
),
(
    'chaise-inaya-gris-chenille',
    'Chaise INAYA en tissu chenille et pieds métal noir - Gris clair',
    'Apportez une touche contemporaine et élégante à votre intérieur avec la chaise INAYA, au design baguette épuré et moderne. Sa structure solide en métal noir mat assure une excellente stabilité tout en apportant une note industrielle chic à votre pièce.',
    'Chaise en tissu chenille avec pieds métal noir',
    'Decora Home', 'Decora Home', 'Chaise', 'Chaise de salle à manger', 'Chaise',
    ARRAY['chenille', 'métal', 'contemporain', 'élégant', 'gris', 'industriel'],
    'Tissu chenille, métal noir', 'Chenille', 'Gris clair', 'Contemporain', 'Salle à manger',
    '45x55x85 cm',
    45, 55, 85, 50, NULL,
    99, 149, 96, 96,
    'https://cdn.shopify.com/s/files/1/0903/7578/2665/files/3_3f11d1af-8ce5-4d2d-a435-cd0a78eb92ee.png?v=1755791319',
    'https://decorahome.fr/products/chaise-en-tissu-serge-chenille-pieds-metal-noir-gris-clair-moka-et-beige',
    'Chaise INAYA Gris Chenille - Design Contemporain | Decora Home',
    'Chaise INAYA en tissu chenille gris avec pieds métal noir. Design contemporain et élégant pour votre salle à manger.',
    'Chaise INAYA Gris',
    'Chaise contemporaine en tissu chenille gris avec pieds métal noir, design élégant',
    'Furniture > Chairs > Dining Chairs',
    '3701234567893',
    88, 'deepseek_ai'
),
(
    'chaise-inaya-moka-chenille',
    'Chaise INAYA en tissu chenille et pieds métal noir - Moka',
    'Apportez une touche contemporaine et élégante à votre intérieur avec la chaise INAYA, au design baguette épuré et moderne. Sa structure solide en métal noir mat assure une excellente stabilité tout en apportant une note industrielle chic à votre pièce.',
    'Chaise en tissu chenille moka avec pieds métal noir',
    'Decora Home', 'Decora Home', 'Chaise', 'Chaise de salle à manger', 'Chaise',
    ARRAY['chenille', 'métal', 'contemporain', 'élégant', 'moka', 'industriel'],
    'Tissu chenille, métal noir', 'Chenille', 'Moka', 'Contemporain', 'Salle à manger',
    '45x55x85 cm',
    45, 55, 85, 50, NULL,
    99, 149, 100, 100,
    'https://cdn.shopify.com/s/files/1/0903/7578/2665/files/1_aae7ccd2-f2cb-4418-8c84-210ace00d753.png?v=1755791319',
    'https://decorahome.fr/products/chaise-en-tissu-serge-chenille-pieds-metal-noir-gris-clair-moka-et-beige',
    'Chaise INAYA Moka Chenille - Design Contemporain | Decora Home',
    'Chaise INAYA en tissu chenille moka avec pieds métal noir. Design contemporain et élégant pour votre salle à manger.',
    'Chaise INAYA Moka',
    'Chaise contemporaine en tissu chenille moka avec pieds métal noir, design élégant',
    'Furniture > Chairs > Dining Chairs',
    '3701234567894',
    88, 'deepseek_ai'
);

-- 8. RLS (Row Level Security)
ALTER TABLE products_enriched ENABLE ROW LEVEL SECURITY;

-- Lecture publique pour tous les produits en stock
CREATE POLICY "Public can read active products"
ON products_enriched
FOR SELECT
USING (stock_qty > 0);

-- Gestion complète pour utilisateurs authentifiés
CREATE POLICY "Authenticated users can manage products"
ON products_enriched
FOR ALL
USING (true)
WITH CHECK (true);