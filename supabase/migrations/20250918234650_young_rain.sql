/*
  # Create OmnIA Database Schema

  1. New Tables
    - `products_enriched` - Table principale des produits enrichis avec IA
    - `flux_google_merchant` - Flux Google Shopping automatique
    - `ai_training_metadata` - Métadonnées d'entraînement IA
    - `retailer_conversations` - Historique conversations clients
    - `retailer_analytics` - Analytics détaillées par revendeur

  2. Security
    - Enable RLS on all tables
    - Add policies for authenticated users and public access where needed
    - Proper data isolation per retailer

  3. Triggers
    - Auto-sync from imported_products to products_enriched
    - Auto-generation of Google Merchant feed
    - Update timestamps on modifications

  4. Functions
    - Trigger functions for data synchronization
    - Automatic enrichment pipeline
*/

-- Drop existing policies to avoid conflicts
DROP POLICY IF EXISTS "Authenticated users can manage products" ON products_enriched;
DROP POLICY IF EXISTS "Public can read active products" ON products_enriched;
DROP POLICY IF EXISTS "Anyone can insert conversations" ON retailer_conversations;
DROP POLICY IF EXISTS "Retailers can read own conversations" ON retailer_conversations;
DROP POLICY IF EXISTS "Retailers can read own analytics" ON retailer_analytics;
DROP POLICY IF EXISTS "Anyone can read training metadata" ON ai_training_metadata;
DROP POLICY IF EXISTS "Authenticated users can update training metadata" ON ai_training_metadata;

-- Create products_enriched table with all required fields
CREATE TABLE IF NOT EXISTS products_enriched (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  handle text NOT NULL,
  title text,
  description text,
  short_description text,
  vendor text,
  brand text,
  category text,
  subcategory text DEFAULT '',
  tags text[] DEFAULT '{}',
  material text,
  color text,
  fabric text,
  style text,
  room text,
  dimensions text,
  weight text,
  capacity text,
  price numeric,
  compare_at_price numeric,
  currency text DEFAULT 'EUR',
  stock_quantity integer DEFAULT 0,
  availability text DEFAULT 'in stock',
  seo_title text DEFAULT '',
  seo_description text DEFAULT '',
  google_category text DEFAULT '',
  pmax_score integer DEFAULT 0,
  image_url text,
  image_alt text,
  gallery_urls jsonb DEFAULT '[]',
  intent_tags text[] DEFAULT '{}',
  matching_score integer DEFAULT 0,
  chat_history_ref text,
  confidence_score integer DEFAULT 0,
  enriched_at timestamptz DEFAULT now(),
  enrichment_source text DEFAULT 'manual',
  created_at timestamptz DEFAULT now()
);

-- Create flux_google_merchant table for Google Shopping feed
CREATE TABLE IF NOT EXISTS flux_google_merchant (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id uuid REFERENCES products_enriched(id) ON DELETE CASCADE,
  google_id text NOT NULL,
  title text NOT NULL,
  description text,
  link text NOT NULL,
  image_link text,
  additional_image_links text[],
  availability text DEFAULT 'in stock',
  price text NOT NULL,
  sale_price text,
  brand text,
  gtin text,
  mpn text,
  condition text DEFAULT 'new',
  adult boolean DEFAULT false,
  multipack integer,
  is_bundle boolean DEFAULT false,
  age_group text,
  color text,
  gender text,
  material text,
  pattern text,
  size text,
  size_type text,
  size_system text,
  item_group_id text,
  google_product_category text,
  product_type text,
  custom_label_0 text,
  custom_label_1 text,
  custom_label_2 text,
  custom_label_3 text,
  custom_label_4 text,
  promotion_id text,
  excluded_destination text[],
  included_destination text[],
  shipping_label text,
  shipping_weight text,
  shipping_length text,
  shipping_width text,
  shipping_height text,
  display_ads_id text,
  display_ads_similar_ids text[],
  display_ads_title text,
  display_ads_link text,
  display_ads_value numeric,
  mobile_link text,
  ads_redirect text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create ai_training_metadata table
CREATE TABLE IF NOT EXISTS ai_training_metadata (
  id text PRIMARY KEY DEFAULT 'singleton',
  last_training timestamptz DEFAULT now(),
  products_count integer DEFAULT 0,
  training_type text DEFAULT 'full',
  model_version text DEFAULT '1.0',
  updated_at timestamptz DEFAULT now(),
  created_at timestamptz DEFAULT now()
);

-- Create retailer_conversations table
CREATE TABLE IF NOT EXISTS retailer_conversations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  retailer_id uuid,
  session_id text NOT NULL,
  user_message text NOT NULL,
  ai_response text NOT NULL,
  products_shown jsonb,
  user_ip text,
  user_agent text,
  conversation_type text DEFAULT 'product_search',
  satisfaction_score integer,
  created_at timestamptz DEFAULT now(),
  CONSTRAINT retailer_conversations_conversation_type_check 
    CHECK (conversation_type = ANY (ARRAY['product_search'::text, 'design_advice'::text, 'general'::text])),
  CONSTRAINT retailer_conversations_satisfaction_score_check 
    CHECK (satisfaction_score >= 1 AND satisfaction_score <= 5)
);

-- Create retailer_analytics table
CREATE TABLE IF NOT EXISTS retailer_analytics (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  retailer_id uuid,
  date date NOT NULL,
  conversations_count integer DEFAULT 0,
  unique_visitors integer DEFAULT 0,
  products_viewed integer DEFAULT 0,
  cart_additions integer DEFAULT 0,
  conversions integer DEFAULT 0,
  revenue numeric(10,2) DEFAULT 0,
  avg_session_duration interval,
  top_products jsonb,
  top_searches jsonb,
  created_at timestamptz DEFAULT now(),
  UNIQUE(retailer_id, date)
);

-- Enable RLS on all tables
ALTER TABLE products_enriched ENABLE ROW LEVEL SECURITY;
ALTER TABLE flux_google_merchant ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_training_metadata ENABLE ROW LEVEL SECURITY;
ALTER TABLE retailer_conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE retailer_analytics ENABLE ROW LEVEL SECURITY;

-- Create policies with proper DROP IF EXISTS
CREATE POLICY "Authenticated users can manage products"
  ON products_enriched
  FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Public can read active products"
  ON products_enriched
  FOR SELECT
  TO anon, authenticated
  USING (stock_quantity > 0);

CREATE POLICY "Anyone can insert conversations"
  ON retailer_conversations
  FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

CREATE POLICY "Retailers can read own conversations"
  ON retailer_conversations
  FOR SELECT
  TO authenticated
  USING (retailer_id::text = uid()::text);

CREATE POLICY "Retailers can read own analytics"
  ON retailer_analytics
  FOR ALL
  TO authenticated
  USING (retailer_id::text = uid()::text)
  WITH CHECK (retailer_id::text = uid()::text);

CREATE POLICY "Anyone can read training metadata"
  ON ai_training_metadata
  FOR SELECT
  TO anon, authenticated
  USING (true);

CREATE POLICY "Authenticated users can update training metadata"
  ON ai_training_metadata
  FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_products_enriched_handle ON products_enriched USING btree (handle);
CREATE INDEX IF NOT EXISTS idx_products_enriched_category ON products_enriched USING btree (category);
CREATE INDEX IF NOT EXISTS idx_products_enriched_color ON products_enriched USING btree (color);
CREATE INDEX IF NOT EXISTS idx_products_enriched_material ON products_enriched USING btree (material);
CREATE INDEX IF NOT EXISTS idx_products_enriched_style ON products_enriched USING btree (style);
CREATE INDEX IF NOT EXISTS idx_products_enriched_price ON products_enriched USING btree (price);
CREATE INDEX IF NOT EXISTS idx_products_enriched_stock ON products_enriched USING btree (stock_quantity);
CREATE INDEX IF NOT EXISTS idx_products_enriched_enriched_at ON products_enriched USING btree (enriched_at DESC);
CREATE INDEX IF NOT EXISTS idx_products_enriched_confidence ON products_enriched USING btree (confidence_score);
CREATE INDEX IF NOT EXISTS idx_products_enriched_tags ON products_enriched USING gin (tags);
CREATE INDEX IF NOT EXISTS idx_products_enriched_search ON products_enriched USING gin (to_tsvector('french'::regconfig, title || ' ' || description));

CREATE INDEX IF NOT EXISTS idx_flux_google_merchant_product_id ON flux_google_merchant USING btree (product_id);
CREATE INDEX IF NOT EXISTS idx_flux_google_merchant_google_id ON flux_google_merchant USING btree (google_id);
CREATE INDEX IF NOT EXISTS idx_flux_google_merchant_availability ON flux_google_merchant USING btree (availability);
CREATE INDEX IF NOT EXISTS idx_flux_google_merchant_price ON flux_google_merchant USING btree (price);
CREATE INDEX IF NOT EXISTS idx_flux_google_merchant_category ON flux_google_merchant USING btree (google_product_category);

CREATE INDEX IF NOT EXISTS idx_retailer_conversations_retailer_id ON retailer_conversations USING btree (retailer_id);
CREATE INDEX IF NOT EXISTS idx_retailer_conversations_session_id ON retailer_conversations USING btree (session_id);
CREATE INDEX IF NOT EXISTS idx_retailer_conversations_created_at ON retailer_conversations USING btree (created_at DESC);

CREATE INDEX IF NOT EXISTS idx_retailer_analytics_retailer_date ON retailer_analytics USING btree (retailer_id, date);
CREATE INDEX IF NOT EXISTS idx_retailer_analytics_date ON retailer_analytics USING btree (date DESC);

-- Create trigger function for auto-sync to products_enriched
CREATE OR REPLACE FUNCTION sync_to_products_enriched()
RETURNS TRIGGER AS $$
BEGIN
  -- Insert or update in products_enriched when imported_products changes
  INSERT INTO products_enriched (
    handle,
    title,
    description,
    vendor,
    brand,
    category,
    subcategory,
    material,
    color,
    style,
    price,
    compare_at_price,
    stock_quantity,
    availability,
    image_url,
    enrichment_source,
    confidence_score
  ) VALUES (
    COALESCE(NEW.external_id, 'product-' || NEW.id::text),
    NEW.name,
    NEW.description,
    NEW.vendor,
    NEW.vendor,
    NEW.category,
    '',
    '',
    '',
    '',
    NEW.price,
    NEW.compare_at_price,
    NEW.stock,
    CASE WHEN NEW.stock > 0 THEN 'in stock' ELSE 'out of stock' END,
    NEW.image_url,
    'auto_import',
    50
  )
  ON CONFLICT (handle) DO UPDATE SET
    title = EXCLUDED.title,
    description = EXCLUDED.description,
    vendor = EXCLUDED.vendor,
    brand = EXCLUDED.brand,
    category = EXCLUDED.category,
    price = EXCLUDED.price,
    compare_at_price = EXCLUDED.compare_at_price,
    stock_quantity = EXCLUDED.stock_quantity,
    availability = EXCLUDED.availability,
    image_url = EXCLUDED.image_url,
    enriched_at = now();

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger function for Google Merchant sync
CREATE OR REPLACE FUNCTION sync_to_google_merchant()
RETURNS TRIGGER AS $$
BEGIN
  -- Insert or update in flux_google_merchant when products_enriched changes
  INSERT INTO flux_google_merchant (
    product_id,
    google_id,
    title,
    description,
    link,
    image_link,
    availability,
    price,
    sale_price,
    brand,
    condition,
    color,
    material,
    google_product_category,
    product_type,
    custom_label_0,
    custom_label_1,
    custom_label_2,
    custom_label_3
  ) VALUES (
    NEW.id,
    NEW.handle,
    NEW.title,
    NEW.short_description,
    'https://omnia.sale/products/' || NEW.handle,
    NEW.image_url,
    NEW.availability,
    NEW.price::text || ' EUR',
    CASE WHEN NEW.compare_at_price IS NOT NULL AND NEW.compare_at_price > NEW.price 
         THEN NEW.compare_at_price::text || ' EUR' 
         ELSE NULL END,
    NEW.brand,
    'new',
    NEW.color,
    NEW.material,
    NEW.google_category,
    NEW.category,
    NEW.style,
    NEW.room,
    NEW.fabric,
    NEW.subcategory
  )
  ON CONFLICT (google_id) DO UPDATE SET
    title = EXCLUDED.title,
    description = EXCLUDED.description,
    link = EXCLUDED.link,
    image_link = EXCLUDED.image_link,
    availability = EXCLUDED.availability,
    price = EXCLUDED.price,
    sale_price = EXCLUDED.sale_price,
    brand = EXCLUDED.brand,
    color = EXCLUDED.color,
    material = EXCLUDED.material,
    google_product_category = EXCLUDED.google_product_category,
    product_type = EXCLUDED.product_type,
    custom_label_0 = EXCLUDED.custom_label_0,
    custom_label_1 = EXCLUDED.custom_label_1,
    custom_label_2 = EXCLUDED.custom_label_2,
    custom_label_3 = EXCLUDED.custom_label_3,
    updated_at = now();

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers
DROP TRIGGER IF EXISTS sync_imported_to_enriched ON imported_products;
CREATE TRIGGER sync_imported_to_enriched
  AFTER INSERT OR UPDATE ON imported_products
  FOR EACH ROW
  WHEN (NEW.status = 'active' AND NEW.stock > 0)
  EXECUTE FUNCTION sync_to_products_enriched();

DROP TRIGGER IF EXISTS sync_enriched_to_google ON products_enriched;
CREATE TRIGGER sync_enriched_to_google
  AFTER INSERT OR UPDATE ON products_enriched
  FOR EACH ROW
  WHEN (NEW.stock_quantity > 0 AND NEW.availability = 'in stock')
  EXECUTE FUNCTION sync_to_google_merchant();

-- Add unique constraint on handle for products_enriched
ALTER TABLE products_enriched 
ADD CONSTRAINT products_enriched_handle_unique 
UNIQUE (handle);

-- Add unique constraint on google_id for flux_google_merchant
ALTER TABLE flux_google_merchant 
ADD CONSTRAINT flux_google_merchant_google_id_unique 
UNIQUE (google_id);

-- Insert initial training metadata
INSERT INTO ai_training_metadata (id, last_training, products_count, training_type, model_version)
VALUES ('singleton', now(), 0, 'initial', '1.0')
ON CONFLICT (id) DO NOTHING;