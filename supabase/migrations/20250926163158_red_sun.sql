/*
  # Smart AI Products Schema Migration

  1. New Tables
    - `retailers` - Company information and account details
    - `retailer_products` - Product catalog isolated by retailer
    - `products_enriched` - AI-enriched products with advanced attributes
    - `retailer_conversations` - Chat history with retailer isolation
    - `retailer_settings` - Customizable settings per retailer
    - `ai_training_metadata` - AI training status and metadata

  2. Security
    - Enable RLS on all tables
    - Add policies for retailer data isolation
    - Public read access for active enriched products

  3. Performance
    - Add indexes for search and filtering
    - Full-text search capabilities
    - Optimized queries for Smart AI features

  4. Demo Data
    - Insert demo retailer for testing
    - Default settings configuration
*/

-- Drop existing policies if they exist to avoid conflicts
DROP POLICY IF EXISTS "Retailers can manage own products" ON retailer_products;
DROP POLICY IF EXISTS "Retailers can manage own enriched products" ON products_enriched;
DROP POLICY IF EXISTS "Retailers can read own conversations" ON retailer_conversations;
DROP POLICY IF EXISTS "System can insert conversations" ON retailer_conversations;
DROP POLICY IF EXISTS "Retailers can manage own settings" ON retailer_settings;
DROP POLICY IF EXISTS "Retailers can read own data" ON retailers;
DROP POLICY IF EXISTS "Retailers can update own data" ON retailers;

-- Create retailers table first (base table)
CREATE TABLE IF NOT EXISTS retailers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  company_name text NOT NULL,
  email text UNIQUE NOT NULL,
  phone text,
  address text,
  city text,
  postal_code text,
  siret text,
  contact_name text,
  position text,
  website text,
  plan text DEFAULT 'starter' CHECK (plan IN ('starter', 'professional', 'enterprise')),
  status text DEFAULT 'active' CHECK (status IN ('active', 'suspended', 'cancelled')),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create retailer_settings table (depends on retailers)
CREATE TABLE IF NOT EXISTS retailer_settings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  retailer_id uuid REFERENCES retailers(id) ON DELETE CASCADE,
  
  -- Company settings
  company_logo text,
  company_description text,
  business_hours jsonb DEFAULT '{}',
  contact_info jsonb DEFAULT '{}',
  
  -- AI Robot settings
  robot_name text DEFAULT 'OmnIA',
  robot_personality text DEFAULT 'professional' CHECK (robot_personality IN ('professional', 'friendly', 'expert', 'commercial', 'expert_friendly')),
  robot_voice text DEFAULT 'friendly',
  robot_theme jsonb DEFAULT '{"primary_color": "#3B82F6", "secondary_color": "#10B981"}',
  
  -- Training settings
  auto_training_enabled boolean DEFAULT true,
  training_frequency text DEFAULT 'weekly' CHECK (training_frequency IN ('daily', 'weekly', 'monthly')),
  last_training_at timestamptz,
  
  -- Feature flags
  features_enabled jsonb DEFAULT '{"chat": true, "product_search": true, "recommendations": true}',
  
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  
  UNIQUE(retailer_id)
);

-- Create retailer_products table (depends on retailers)
CREATE TABLE IF NOT EXISTS retailer_products (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  retailer_id uuid REFERENCES retailers(id) ON DELETE CASCADE,
  external_id text NOT NULL,
  handle text NOT NULL,
  name text NOT NULL,
  description text DEFAULT '',
  price decimal(10,2) NOT NULL DEFAULT 0,
  compare_at_price decimal(10,2),
  stock integer DEFAULT 0,
  category text DEFAULT '',
  vendor text DEFAULT '',
  brand text DEFAULT '',
  image_url text DEFAULT '',
  product_url text DEFAULT '',
  source_platform text DEFAULT 'manual' CHECK (source_platform IN ('manual', 'csv', 'shopify', 'xml', 'api')),
  status text DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'archived')),
  sku text DEFAULT '',
  tags text[] DEFAULT '{}',
  extracted_attributes jsonb DEFAULT '{}',
  confidence_score integer DEFAULT 0 CHECK (confidence_score >= 0 AND confidence_score <= 100),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  
  UNIQUE(retailer_id, external_id, source_platform)
);

-- Create products_enriched table (AI-enhanced products with retailer isolation)
CREATE TABLE IF NOT EXISTS products_enriched (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  retailer_id uuid REFERENCES retailers(id) ON DELETE CASCADE,
  handle text NOT NULL,
  title text NOT NULL,
  description text DEFAULT '',
  
  -- General info
  category text DEFAULT '',
  subcategory text DEFAULT '',
  
  -- Technical specs
  color text DEFAULT '',
  material text DEFAULT '',
  fabric text DEFAULT '',
  style text DEFAULT '',
  dimensions text DEFAULT '',
  room text DEFAULT '',
  
  -- Pricing and inventory
  price decimal(10,2) NOT NULL DEFAULT 0,
  stock_qty integer DEFAULT 0,
  
  -- Media
  image_url text DEFAULT '',
  product_url text DEFAULT '',
  
  -- SEO and marketing
  tags text[] DEFAULT '{}',
  seo_title text DEFAULT '',
  seo_description text DEFAULT '',
  ad_headline text DEFAULT '',
  ad_description text DEFAULT '',
  google_product_category text DEFAULT '',
  gtin text DEFAULT '',
  brand text DEFAULT '',
  
  -- AI metadata
  confidence_score integer DEFAULT 0 CHECK (confidence_score >= 0 AND confidence_score <= 100),
  enriched_at timestamptz DEFAULT now(),
  enrichment_source text DEFAULT 'ai' CHECK (enrichment_source IN ('ai', 'manual', 'text_only', 'text_and_image')),
  
  -- Timestamps
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  
  UNIQUE(retailer_id, handle)
);

-- Create retailer_conversations table (depends on retailers)
CREATE TABLE IF NOT EXISTS retailer_conversations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  retailer_id uuid REFERENCES retailers(id) ON DELETE CASCADE,
  session_id uuid NOT NULL,
  user_message text NOT NULL,
  ai_response text NOT NULL,
  products_shown text[] DEFAULT '{}',
  user_ip text,
  user_agent text,
  conversation_type text DEFAULT 'general' CHECK (conversation_type IN ('general', 'product_search', 'style_advice', 'support')),
  satisfaction_score integer CHECK (satisfaction_score >= 1 AND satisfaction_score <= 5),
  created_at timestamptz DEFAULT now()
);

-- Create ai_training_metadata table (global metadata)
CREATE TABLE IF NOT EXISTS ai_training_metadata (
  id text PRIMARY KEY DEFAULT 'singleton',
  last_training timestamptz DEFAULT now(),
  products_count integer DEFAULT 0,
  training_type text DEFAULT 'full',
  model_version text DEFAULT '2.1',
  updated_at timestamptz DEFAULT now(),
  created_at timestamptz DEFAULT now()
);

-- Enable RLS on all tables
ALTER TABLE retailers ENABLE ROW LEVEL SECURITY;
ALTER TABLE retailer_products ENABLE ROW LEVEL SECURITY;
ALTER TABLE products_enriched ENABLE ROW LEVEL SECURITY;
ALTER TABLE retailer_conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE retailer_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_training_metadata ENABLE ROW LEVEL SECURITY;

-- RLS Policies for retailers table
CREATE POLICY "retailers_read_own_data"
  ON retailers
  FOR SELECT
  TO authenticated
  USING (auth.uid()::text = id::text);

CREATE POLICY "retailers_update_own_data"
  ON retailers
  FOR UPDATE
  TO authenticated
  USING (auth.uid()::text = id::text);

-- RLS Policies for retailer_products
CREATE POLICY "retailers_manage_own_products"
  ON retailer_products
  FOR ALL
  TO authenticated
  USING (retailer_id = auth.uid());

-- RLS Policies for products_enriched
CREATE POLICY "retailers_manage_own_enriched_products"
  ON products_enriched
  FOR ALL
  TO authenticated
  USING (retailer_id = auth.uid());

CREATE POLICY "public_read_active_enriched_products"
  ON products_enriched
  FOR SELECT
  TO anon, authenticated
  USING (stock_qty > 0);

-- RLS Policies for retailer_conversations
CREATE POLICY "retailers_read_own_conversations"
  ON retailer_conversations
  FOR SELECT
  TO authenticated
  USING (retailer_id = auth.uid());

CREATE POLICY "system_insert_conversations"
  ON retailer_conversations
  FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

-- RLS Policies for retailer_settings
CREATE POLICY "retailers_manage_own_settings"
  ON retailer_settings
  FOR ALL
  TO authenticated
  USING (retailer_id = auth.uid());

-- RLS Policies for ai_training_metadata
CREATE POLICY "anyone_read_training_metadata"
  ON ai_training_metadata
  FOR SELECT
  TO anon, authenticated
  USING (true);

CREATE POLICY "authenticated_update_training_metadata"
  ON ai_training_metadata
  FOR ALL
  TO authenticated
  WITH CHECK (true);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_retailers_email ON retailers(email);
CREATE INDEX IF NOT EXISTS idx_retailers_status ON retailers(status);

CREATE INDEX IF NOT EXISTS idx_retailer_products_retailer_id ON retailer_products(retailer_id);
CREATE INDEX IF NOT EXISTS idx_retailer_products_category ON retailer_products(category);
CREATE INDEX IF NOT EXISTS idx_retailer_products_status ON retailer_products(status);
CREATE INDEX IF NOT EXISTS idx_retailer_products_retailer_status ON retailer_products(retailer_id, status);

CREATE INDEX IF NOT EXISTS idx_products_enriched_retailer_id ON products_enriched(retailer_id);
CREATE INDEX IF NOT EXISTS idx_products_enriched_category ON products_enriched(category);
CREATE INDEX IF NOT EXISTS idx_products_enriched_color ON products_enriched(color);
CREATE INDEX IF NOT EXISTS idx_products_enriched_material ON products_enriched(material);
CREATE INDEX IF NOT EXISTS idx_products_enriched_style ON products_enriched(style);
CREATE INDEX IF NOT EXISTS idx_products_enriched_room ON products_enriched(room);
CREATE INDEX IF NOT EXISTS idx_products_enriched_price ON products_enriched(price);
CREATE INDEX IF NOT EXISTS idx_products_enriched_stock ON products_enriched(stock_qty);
CREATE INDEX IF NOT EXISTS idx_products_enriched_confidence ON products_enriched(confidence_score);
CREATE INDEX IF NOT EXISTS idx_products_enriched_retailer_category ON products_enriched(retailer_id, category);
CREATE INDEX IF NOT EXISTS idx_products_enriched_retailer_stock ON products_enriched(retailer_id, stock_qty);

-- Full-text search indexes
CREATE INDEX IF NOT EXISTS idx_products_enriched_title_search ON products_enriched USING gin(to_tsvector('french', title));
CREATE INDEX IF NOT EXISTS idx_products_enriched_description_search ON products_enriched USING gin(to_tsvector('french', description));
CREATE INDEX IF NOT EXISTS idx_products_enriched_tags_search ON products_enriched USING gin(tags);

CREATE INDEX IF NOT EXISTS idx_retailer_conversations_retailer_id ON retailer_conversations(retailer_id);
CREATE INDEX IF NOT EXISTS idx_retailer_conversations_session_id ON retailer_conversations(session_id);
CREATE INDEX IF NOT EXISTS idx_retailer_conversations_retailer_session ON retailer_conversations(retailer_id, session_id);
CREATE INDEX IF NOT EXISTS idx_retailer_conversations_created_at ON retailer_conversations(created_at DESC);

CREATE INDEX IF NOT EXISTS idx_retailer_settings_retailer_id ON retailer_settings(retailer_id);

-- Insert demo data for testing (only after all tables are created)
DO $$
BEGIN
  -- Insert demo retailer
  INSERT INTO retailers (id, company_name, email, phone, contact_name, plan, status) VALUES 
    ('550e8400-e29b-41d4-a716-446655440000', 'Decora Home Demo', 'demo@decorahome.com', '+33 1 23 45 67 89', 'Demo Manager', 'professional', 'active')
  ON CONFLICT (email) DO NOTHING;

  -- Insert demo settings (only if retailer exists)
  INSERT INTO retailer_settings (retailer_id, robot_name, robot_personality, auto_training_enabled) VALUES 
    ('550e8400-e29b-41d4-a716-446655440000', 'OmnIA', 'expert_friendly', true)
  ON CONFLICT (retailer_id) DO NOTHING;

  -- Insert demo products
  INSERT INTO retailer_products (retailer_id, external_id, handle, name, description, price, compare_at_price, stock, category, vendor, image_url, product_url, source_platform, status) VALUES 
    ('550e8400-e29b-41d4-a716-446655440000', 'demo-canape-alyana', 'canape-alyana-convertible', 'Canapé ALYANA convertible', 'Canapé d''angle convertible 4 places en velours côtelé', 799.00, 1399.00, 100, 'Canapé', 'Decora Home', 'https://cdn.shopify.com/s/files/1/0903/7578/2665/files/7_23a97631-68d2-4f3e-8f78-b26c7cd4c2ae.png', 'https://decorahome.fr/products/canape-dangle-convertible', 'demo', 'active'),
    ('550e8400-e29b-41d4-a716-446655440000', 'demo-table-aurea', 'table-aurea-travertin', 'Table AUREA travertin', 'Table ronde en travertin naturel avec pieds métal noir', 499.00, 859.00, 50, 'Table', 'Decora Home', 'https://cdn.shopify.com/s/files/1/0903/7578/2665/files/3_e80b9a50-b032-4267-8f5b-f9130153e3be.png', 'https://decorahome.fr/products/table-aurea', 'demo', 'active'),
    ('550e8400-e29b-41d4-a716-446655440000', 'demo-chaise-inaya', 'chaise-inaya-chenille', 'Chaise INAYA chenille', 'Chaise en tissu chenille avec pieds métal noir', 99.00, 149.00, 96, 'Chaise', 'Decora Home', 'https://cdn.shopify.com/s/files/1/0903/7578/2665/files/3_3f11d1af-8ce5-4d2d-a435-cd0a78eb92ee.png', 'https://decorahome.fr/products/chaise-inaya', 'demo', 'active')
  ON CONFLICT (retailer_id, external_id, source_platform) DO NOTHING;

  -- Insert enriched products with AI attributes
  INSERT INTO products_enriched (retailer_id, handle, title, description, category, subcategory, color, material, style, room, price, stock_qty, image_url, product_url, tags, confidence_score, brand) VALUES 
    ('550e8400-e29b-41d4-a716-446655440000', 'canape-alyana-smart', 'Canapé ALYANA convertible - Smart AI', 'Canapé d''angle convertible 4 places en velours côtelé beige avec coffre de rangement et mécanisme de conversion facile', 'Canapé', 'Canapé d''angle convertible', 'beige', 'velours côtelé', 'moderne', 'salon', 799.00, 100, 'https://cdn.shopify.com/s/files/1/0903/7578/2665/files/7_23a97631-68d2-4f3e-8f78-b26c7cd4c2ae.png', 'https://decorahome.fr/products/canape-dangle-convertible', ARRAY['canapé', 'convertible', 'velours', 'beige', 'moderne'], 92, 'Decora Home'),
    ('550e8400-e29b-41d4-a716-446655440000', 'table-aurea-smart', 'Table AUREA travertin - Smart AI', 'Table ronde en travertin naturel avec pieds en métal noir, design contemporain et élégant', 'Table', 'Table à manger ronde', 'naturel', 'travertin', 'contemporain', 'salle à manger', 499.00, 50, 'https://cdn.shopify.com/s/files/1/0903/7578/2665/files/3_e80b9a50-b032-4267-8f5b-f9130153e3be.png', 'https://decorahome.fr/products/table-aurea', ARRAY['table', 'travertin', 'ronde', 'naturel'], 88, 'Decora Home'),
    ('550e8400-e29b-41d4-a716-446655440000', 'chaise-inaya-smart', 'Chaise INAYA chenille - Smart AI', 'Chaise en tissu chenille avec pieds métal noir, design baguette épuré et moderne', 'Chaise', 'Chaise de salle à manger', 'gris', 'chenille', 'moderne', 'salle à manger', 99.00, 96, 'https://cdn.shopify.com/s/files/1/0903/7578/2665/files/3_3f11d1af-8ce5-4d2d-a435-cd0a78eb92ee.png', 'https://decorahome.fr/products/chaise-inaya', ARRAY['chaise', 'chenille', 'gris', 'moderne'], 85, 'Decora Home')
  ON CONFLICT (retailer_id, handle) DO NOTHING;

EXCEPTION
  WHEN OTHERS THEN
    RAISE NOTICE 'Demo data insertion failed: %', SQLERRM;
END $$;

-- Create ai_training_metadata table (global)
CREATE TABLE IF NOT EXISTS ai_training_metadata (
  id text PRIMARY KEY DEFAULT 'singleton',
  last_training timestamptz DEFAULT now(),
  products_count integer DEFAULT 0,
  training_type text DEFAULT 'full',
  model_version text DEFAULT '2.1',
  updated_at timestamptz DEFAULT now(),
  created_at timestamptz DEFAULT now()
);

-- Enable RLS on all tables
ALTER TABLE retailers ENABLE ROW LEVEL SECURITY;
ALTER TABLE retailer_products ENABLE ROW LEVEL SECURITY;
ALTER TABLE products_enriched ENABLE ROW LEVEL SECURITY;
ALTER TABLE retailer_conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE retailer_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_training_metadata ENABLE ROW LEVEL SECURITY;

-- RLS Policies for retailers table
CREATE POLICY "retailers_read_own_data"
  ON retailers
  FOR SELECT
  TO authenticated
  USING (auth.uid()::text = id::text);

CREATE POLICY "retailers_update_own_data"
  ON retailers
  FOR UPDATE
  TO authenticated
  USING (auth.uid()::text = id::text);

-- RLS Policies for retailer_products
CREATE POLICY "retailers_manage_own_products"
  ON retailer_products
  FOR ALL
  TO authenticated
  USING (retailer_id = auth.uid());

-- RLS Policies for products_enriched
CREATE POLICY "retailers_manage_own_enriched_products"
  ON products_enriched
  FOR ALL
  TO authenticated
  USING (retailer_id = auth.uid());

CREATE POLICY "public_read_active_enriched_products"
  ON products_enriched
  FOR SELECT
  TO anon, authenticated
  USING (stock_qty > 0);

-- RLS Policies for retailer_conversations
CREATE POLICY "retailers_read_own_conversations"
  ON retailer_conversations
  FOR SELECT
  TO authenticated
  USING (retailer_id = auth.uid());

CREATE POLICY "system_insert_conversations"
  ON retailer_conversations
  FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

-- RLS Policies for retailer_settings
CREATE POLICY "retailers_manage_own_settings"
  ON retailer_settings
  FOR ALL
  TO authenticated
  USING (retailer_id = auth.uid());

-- RLS Policies for ai_training_metadata
CREATE POLICY "anyone_read_training_metadata"
  ON ai_training_metadata
  FOR SELECT
  TO anon, authenticated
  USING (true);

CREATE POLICY "authenticated_update_training_metadata"
  ON ai_training_metadata
  FOR ALL
  TO authenticated
  WITH CHECK (true);

-- Insert initial training metadata
INSERT INTO ai_training_metadata (id, last_training, products_count, training_type, model_version) VALUES 
  ('singleton', now(), 3, 'initial', '2.1')
ON CONFLICT (id) DO UPDATE SET
  updated_at = now();