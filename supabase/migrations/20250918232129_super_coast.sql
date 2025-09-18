/*
  # Create OmnIA Database Schema

  1. New Tables
    - `products_enriched` - Table principale des produits enrichis avec IA
    - `flux_google_merchant` - Flux Google Merchant Center
    - `product_attributes` - Attributs extraits par IA
    - `training_logs` - Logs d'entraînement IA
    - `ai_training_metadata` - Métadonnées d'entraînement

  2. Security
    - Enable RLS on all tables
    - Add policies for authenticated users

  3. Triggers
    - Auto-sync from imported_products to products_enriched
    - Auto-sync from products_enriched to flux_google_merchant
*/

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_trgm";

-- Table products_enriched avec TOUS les champs requis
CREATE TABLE IF NOT EXISTS products_enriched (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  handle text UNIQUE NOT NULL,
  title text NOT NULL,
  description text DEFAULT '',
  short_description text DEFAULT '',
  vendor text DEFAULT '',
  brand text DEFAULT '',
  category text DEFAULT '',
  subcategory text DEFAULT '',
  tags text[] DEFAULT '{}',
  material text DEFAULT '',
  color text DEFAULT '',
  fabric text DEFAULT '',
  style text DEFAULT '',
  room text DEFAULT '',
  dimensions text DEFAULT '',
  weight text DEFAULT '',
  capacity text DEFAULT '',
  price numeric(10,2) DEFAULT 0,
  compare_at_price numeric(10,2),
  currency text DEFAULT 'EUR',
  stock_quantity integer DEFAULT 0,
  availability text DEFAULT 'Disponible',
  seo_title text DEFAULT '',
  seo_description text DEFAULT '',
  google_category text DEFAULT '',
  pmax_score integer DEFAULT 0,
  image_url text DEFAULT '',
  image_alt text DEFAULT '',
  gallery_urls text[] DEFAULT '{}',
  intent_tags text[] DEFAULT '{}',
  matching_score integer DEFAULT 0,
  chat_history_ref text DEFAULT '',
  product_url text DEFAULT '',
  sku text DEFAULT '',
  gtin text DEFAULT '',
  mpn text DEFAULT '',
  condition text DEFAULT 'new',
  confidence_score integer DEFAULT 0,
  enriched_at timestamptz DEFAULT now(),
  enrichment_source text DEFAULT 'manual',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Table flux_google_merchant pour Google Shopping
CREATE TABLE IF NOT EXISTS flux_google_merchant (
  id text PRIMARY KEY,
  title text NOT NULL,
  description text DEFAULT '',
  link text DEFAULT '',
  image_link text DEFAULT '',
  additional_image_link text DEFAULT '',
  availability text DEFAULT 'in stock',
  price text DEFAULT '',
  sale_price text DEFAULT '',
  brand text DEFAULT '',
  gtin text DEFAULT '',
  mpn text DEFAULT '',
  condition text DEFAULT 'new',
  google_product_category text DEFAULT '',
  product_type text DEFAULT '',
  color text DEFAULT '',
  material text DEFAULT '',
  pattern text DEFAULT '',
  size text DEFAULT '',
  custom_label_0 text DEFAULT 'promo2025',
  custom_label_1 text DEFAULT '',
  custom_label_2 text DEFAULT '',
  custom_label_3 text DEFAULT '',
  custom_label_4 text DEFAULT '',
  shipping_weight text DEFAULT '',
  shipping_length text DEFAULT '',
  shipping_width text DEFAULT '',
  shipping_height text DEFAULT '',
  age_group text DEFAULT 'adult',
  gender text DEFAULT 'unisex',
  item_group_id text DEFAULT '',
  multipack integer DEFAULT 1,
  is_bundle boolean DEFAULT false,
  adult boolean DEFAULT false,
  energy_efficiency_class text DEFAULT '',
  min_energy_efficiency_class text DEFAULT '',
  max_energy_efficiency_class text DEFAULT '',
  tax text DEFAULT '',
  tax_country text DEFAULT 'FR',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Table product_attributes pour les attributs IA
CREATE TABLE IF NOT EXISTS product_attributes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id text NOT NULL,
  attribute_name text NOT NULL,
  attribute_value text NOT NULL,
  confidence_score integer DEFAULT 0,
  extraction_method text DEFAULT 'ai',
  extracted_at timestamptz DEFAULT now(),
  UNIQUE(product_id, attribute_name, attribute_value)
);

-- Table training_logs pour les logs d'entraînement
CREATE TABLE IF NOT EXISTS training_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  status text NOT NULL CHECK (status IN ('success', 'failed', 'running')),
  log text DEFAULT '',
  products_processed integer DEFAULT 0,
  attributes_extracted integer DEFAULT 0,
  conversations_analyzed integer DEFAULT 0,
  trigger_type text DEFAULT 'manual',
  execution_time_ms integer DEFAULT 0,
  errors text DEFAULT '',
  created_at timestamptz DEFAULT now()
);

-- Table ai_training_metadata (singleton)
CREATE TABLE IF NOT EXISTS ai_training_metadata (
  id text PRIMARY KEY DEFAULT 'singleton',
  last_training timestamptz DEFAULT now(),
  products_count integer DEFAULT 0,
  training_type text DEFAULT 'full',
  model_version text DEFAULT '1.0',
  success_rate numeric(5,2) DEFAULT 0,
  retailers_processed integer DEFAULT 0,
  cron_execution_time timestamptz,
  updated_at timestamptz DEFAULT now(),
  created_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE products_enriched ENABLE ROW LEVEL SECURITY;
ALTER TABLE flux_google_merchant ENABLE ROW LEVEL SECURITY;
ALTER TABLE product_attributes ENABLE ROW LEVEL SECURITY;
ALTER TABLE training_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_training_metadata ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Public can read enriched products"
  ON products_enriched
  FOR SELECT
  TO anon, authenticated
  USING (stock_quantity > 0);

CREATE POLICY "Authenticated users can manage enriched products"
  ON products_enriched
  FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Public can read Google Merchant feed"
  ON flux_google_merchant
  FOR SELECT
  TO anon, authenticated
  USING (true);

CREATE POLICY "Authenticated users can manage Google Merchant feed"
  ON flux_google_merchant
  FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Authenticated users can manage product attributes"
  ON product_attributes
  FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Authenticated users can read training logs"
  ON training_logs
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can manage training metadata"
  ON ai_training_metadata
  FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Indexes pour performance
CREATE INDEX IF NOT EXISTS idx_products_enriched_category ON products_enriched(category);
CREATE INDEX IF NOT EXISTS idx_products_enriched_color ON products_enriched(color);
CREATE INDEX IF NOT EXISTS idx_products_enriched_material ON products_enriched(material);
CREATE INDEX IF NOT EXISTS idx_products_enriched_style ON products_enriched(style);
CREATE INDEX IF NOT EXISTS idx_products_enriched_price ON products_enriched(price);
CREATE INDEX IF NOT EXISTS idx_products_enriched_stock ON products_enriched(stock_quantity);
CREATE INDEX IF NOT EXISTS idx_products_enriched_tags ON products_enriched USING gin(tags);
CREATE INDEX IF NOT EXISTS idx_products_enriched_search ON products_enriched USING gin(to_tsvector('french', title || ' ' || description));

CREATE INDEX IF NOT EXISTS idx_flux_google_merchant_category ON flux_google_merchant(google_product_category);
CREATE INDEX IF NOT EXISTS idx_flux_google_merchant_availability ON flux_google_merchant(availability);

CREATE INDEX IF NOT EXISTS idx_product_attributes_product ON product_attributes(product_id);
CREATE INDEX IF NOT EXISTS idx_product_attributes_name ON product_attributes(attribute_name);

-- Fonction pour mettre à jour updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Triggers pour updated_at
CREATE TRIGGER update_products_enriched_updated_at
  BEFORE UPDATE ON products_enriched
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_flux_google_merchant_updated_at
  BEFORE UPDATE ON flux_google_merchant
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Fonction de synchronisation vers products_enriched
CREATE OR REPLACE FUNCTION sync_to_products_enriched()
RETURNS TRIGGER AS $$
BEGIN
  -- Insérer ou mettre à jour dans products_enriched
  INSERT INTO products_enriched (
    id,
    handle,
    title,
    description,
    short_description,
    vendor,
    brand,
    category,
    subcategory,
    price,
    compare_at_price,
    currency,
    stock_quantity,
    availability,
    image_url,
    product_url,
    sku,
    enriched_at,
    enrichment_source,
    created_at
  ) VALUES (
    gen_random_uuid(),
    COALESCE(NEW.external_id, NEW.name),
    NEW.name,
    COALESCE(NEW.description, ''),
    LEFT(COALESCE(NEW.description, ''), 200),
    COALESCE(NEW.vendor, 'Boutique'),
    COALESCE(NEW.vendor, 'Boutique'),
    COALESCE(NEW.category, 'Mobilier'),
    '',
    COALESCE(NEW.price, 0),
    NEW.compare_at_price,
    'EUR',
    COALESCE(NEW.stock, 0),
    CASE WHEN COALESCE(NEW.stock, 0) > 0 THEN 'Disponible' ELSE 'Rupture' END,
    COALESCE(NEW.image_url, ''),
    COALESCE(NEW.product_url, ''),
    '',
    now(),
    'auto_sync',
    now()
  )
  ON CONFLICT (handle) DO UPDATE SET
    title = EXCLUDED.title,
    description = EXCLUDED.description,
    short_description = EXCLUDED.short_description,
    vendor = EXCLUDED.vendor,
    brand = EXCLUDED.brand,
    category = EXCLUDED.category,
    price = EXCLUDED.price,
    compare_at_price = EXCLUDED.compare_at_price,
    stock_quantity = EXCLUDED.stock_quantity,
    availability = EXCLUDED.availability,
    image_url = EXCLUDED.image_url,
    product_url = EXCLUDED.product_url,
    enriched_at = now(),
    updated_at = now();

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Fonction de synchronisation vers flux_google_merchant
CREATE OR REPLACE FUNCTION sync_to_google_merchant()
RETURNS TRIGGER AS $$
BEGIN
  -- Insérer ou mettre à jour dans flux_google_merchant
  INSERT INTO flux_google_merchant (
    id,
    title,
    description,
    link,
    image_link,
    additional_image_link,
    availability,
    price,
    sale_price,
    brand,
    gtin,
    mpn,
    condition,
    google_product_category,
    product_type,
    color,
    material,
    pattern,
    size,
    custom_label_0
  ) VALUES (
    NEW.id::text,
    NEW.title,
    NEW.short_description,
    NEW.product_url,
    NEW.image_url,
    array_to_string(NEW.gallery_urls, ','),
    CASE WHEN NEW.availability = 'Disponible' THEN 'in stock' ELSE 'out of stock' END,
    NEW.price || ' EUR',
    CASE WHEN NEW.compare_at_price IS NOT NULL THEN NEW.compare_at_price || ' EUR' END,
    NEW.brand,
    NEW.gtin,
    NEW.sku,
    'new',
    NEW.google_category,
    NEW.category || CASE WHEN NEW.subcategory != '' THEN ' > ' || NEW.subcategory ELSE '' END,
    NEW.color,
    NEW.material,
    array_to_string(NEW.tags, ','),
    NEW.dimensions,
    'promo2025'
  )
  ON CONFLICT (id) DO UPDATE SET
    title = EXCLUDED.title,
    description = EXCLUDED.description,
    link = EXCLUDED.link,
    image_link = EXCLUDED.image_link,
    additional_image_link = EXCLUDED.additional_image_link,
    availability = EXCLUDED.availability,
    price = EXCLUDED.price,
    sale_price = EXCLUDED.sale_price,
    brand = EXCLUDED.brand,
    gtin = EXCLUDED.gtin,
    mpn = EXCLUDED.mpn,
    google_product_category = EXCLUDED.google_product_category,
    product_type = EXCLUDED.product_type,
    color = EXCLUDED.color,
    material = EXCLUDED.material,
    pattern = EXCLUDED.pattern,
    size = EXCLUDED.size,
    updated_at = now();

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers de synchronisation
CREATE TRIGGER sync_imported_to_enriched
  AFTER INSERT OR UPDATE ON imported_products
  FOR EACH ROW
  WHEN (NEW.status = 'active' AND NEW.stock > 0)
  EXECUTE FUNCTION sync_to_products_enriched();

CREATE TRIGGER sync_enriched_to_merchant
  AFTER INSERT OR UPDATE ON products_enriched
  FOR EACH ROW
  WHEN (NEW.stock_quantity > 0)
  EXECUTE FUNCTION sync_to_google_merchant();

-- Insérer des données de test
INSERT INTO products_enriched (
  handle,
  title,
  description,
  short_description,
  vendor,
  brand,
  category,
  subcategory,
  tags,
  material,
  color,
  fabric,
  style,
  room,
  dimensions,
  price,
  compare_at_price,
  stock_quantity,
  availability,
  image_url,
  product_url,
  seo_title,
  seo_description,
  google_category,
  confidence_score
) VALUES 
(
  'canape-alyana-beige',
  'Canapé ALYANA convertible - Beige',
  'Canapé d''angle convertible 4 places en velours côtelé beige avec coffre de rangement',
  'Canapé d''angle convertible 4 places en velours côtelé beige',
  'Decora Home',
  'Decora Home',
  'Canapé',
  'Canapé d''angle convertible',
  ARRAY['convertible', 'velours', 'beige', 'angle', 'rangement'],
  'velours côtelé',
  'beige',
  'velours',
  'moderne',
  'salon',
  '280x180x75cm',
  799.00,
  1399.00,
  100,
  'Disponible',
  'https://cdn.shopify.com/s/files/1/0903/7578/2665/files/7_23a97631-68d2-4f3e-8f78-b26c7cd4c2ae.png?v=1754406480',
  'https://decorahome.fr/products/canape-dangle-convertible-et-reversible-4-places-en-velours-cotele',
  'Canapé ALYANA convertible beige - Decora Home',
  'Canapé d''angle convertible 4 places en velours côtelé beige. Livraison gratuite.',
  '635',
  95
),
(
  'table-aurea-100',
  'Table AUREA Ø100cm - Travertin',
  'Table ronde en travertin naturel avec pieds métal noir',
  'Table ronde en travertin naturel',
  'Decora Home',
  'Decora Home',
  'Table',
  'Table à manger ronde',
  ARRAY['travertin', 'naturel', 'ronde', 'métal'],
  'travertin',
  'naturel',
  '',
  'moderne',
  'salle à manger',
  'Ø100x75cm',
  499.00,
  859.00,
  50,
  'Disponible',
  'https://cdn.shopify.com/s/files/1/0903/7578/2665/files/3_e80b9a50-b032-4267-8f5b-f9130153e3be.png?v=1754406484',
  'https://decorahome.fr/products/table-a-manger-ronde-plateau-en-travertin-naturel-100-120-cm',
  'Table AUREA travertin naturel Ø100cm - Decora Home',
  'Table ronde en travertin naturel avec pieds métal noir. Design moderne.',
  '443',
  90
),
(
  'chaise-inaya-gris',
  'Chaise INAYA - Gris chenille',
  'Chaise en tissu chenille avec pieds métal noir',
  'Chaise en tissu chenille',
  'Decora Home',
  'Decora Home',
  'Chaise',
  'Chaise de salle à manger',
  ARRAY['chenille', 'gris', 'métal', 'contemporain'],
  'chenille',
  'gris',
  'chenille',
  'contemporain',
  'salle à manger',
  '45x50x80cm',
  99.00,
  149.00,
  96,
  'Disponible',
  'https://cdn.shopify.com/s/files/1/0903/7578/2665/files/3_3f11d1af-8ce5-4d2d-a435-cd0a78eb92ee.png?v=1755791319',
  'https://decorahome.fr/products/chaise-en-tissu-serge-chenille-pieds-metal-noir-gris-clair-moka-et-beige',
  'Chaise INAYA gris chenille - Decora Home',
  'Chaise en tissu chenille avec pieds métal noir. Design contemporain.',
  '436',
  85
);

-- Insérer métadonnées d'entraînement
INSERT INTO ai_training_metadata (
  id,
  last_training,
  products_count,
  training_type,
  model_version,
  success_rate
) VALUES (
  'singleton',
  now(),
  3,
  'initial',
  '2.0',
  95.0
) ON CONFLICT (id) DO UPDATE SET
  last_training = EXCLUDED.last_training,
  products_count = EXCLUDED.products_count,
  updated_at = now();