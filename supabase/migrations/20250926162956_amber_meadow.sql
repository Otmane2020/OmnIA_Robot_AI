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
   - Full-text search indexes for products
   - Category and attribute indexes
   - Retailer isolation indexes

4. Demo Data
   - Sample retailer for testing
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

-- 1. Create retailers table first (base table)
CREATE TABLE IF NOT EXISTS retailers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  company_name text NOT NULL,
  email text UNIQUE NOT NULL,
  phone text,
  address text,
  city text,
  postal_code text,
  siret text,
  position text,
  website text,
  plan text DEFAULT 'starter' CHECK (plan IN ('starter', 'professional', 'enterprise')),
  status text DEFAULT 'active' CHECK (status IN ('active', 'suspended', 'cancelled')),
  contact_name text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- 2. Create retailer_settings table (depends on retailers)
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

-- 3. Create retailer_products table (depends on retailers)
CREATE TABLE IF NOT EXISTS retailer_products (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  retailer_id uuid REFERENCES retailers(id) ON DELETE CASCADE,
  external_id text NOT NULL,
  name text NOT NULL,
  description text DEFAULT '',
  price decimal(10,2) NOT NULL DEFAULT 0,
  compare_at_price decimal(10,2),
  category text DEFAULT '',
  vendor text DEFAULT '',
  image_url text DEFAULT '',
  product_url text DEFAULT '',
  stock integer DEFAULT 0,
  source_platform text DEFAULT 'manual' CHECK (source_platform IN ('shopify', 'csv', 'xml', 'manual')),
  status text DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'draft')),
  sku text DEFAULT '',
  tags text[] DEFAULT '{}',
  extracted_attributes jsonb DEFAULT '{}',
  confidence_score integer DEFAULT 0 CHECK (confidence_score >= 0 AND confidence_score <= 100),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  
  UNIQUE(retailer_id, external_id, source_platform)
);

-- 4. Create products_enriched table (depends on retailers)
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
  enrichment_source text DEFAULT 'manual' CHECK (enrichment_source IN ('manual', 'ai', 'text_only', 'text_and_image')),
  
  -- Timestamps
  created_at timestamptz DEFAULT now(),
  
  UNIQUE(retailer_id, handle)
);

-- 5. Create retailer_conversations table (depends on retailers)
CREATE TABLE IF NOT EXISTS retailer_conversations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  retailer_id uuid REFERENCES retailers(id) ON DELETE CASCADE,
  session_id text NOT NULL,
  user_message text NOT NULL,
  ai_response text NOT NULL,
  products_shown jsonb DEFAULT '[]',
  user_ip text,
  user_agent text,
  conversation_type text DEFAULT 'product_search' CHECK (conversation_type IN ('product_search', 'design_advice', 'general')),
  satisfaction_score integer CHECK (satisfaction_score >= 1 AND satisfaction_score <= 5),
  created_at timestamptz DEFAULT now()
);

-- 6. Create ai_training_metadata table (standalone)
CREATE TABLE IF NOT EXISTS ai_training_metadata (
  id text PRIMARY KEY DEFAULT 'singleton',
  last_training timestamptz DEFAULT now(),
  products_count integer DEFAULT 0,
  training_type text DEFAULT 'full',
  model_version text DEFAULT '1.0',
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

CREATE POLICY "anyone_insert_conversations"
  ON retailer_conversations
  FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

CREATE POLICY "service_manage_conversations"
  ON retailer_conversations
  FOR ALL
  TO service_role
  USING (true);

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
  USING (true)
  WITH CHECK (true);

-- Create indexes for performance
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

CREATE INDEX IF NOT EXISTS idx_retailer_settings_retailer_id ON retailer_settings(retailer_id);

-- Insert demo data for testing (only after all tables are created)
INSERT INTO retailers (id, company_name, email, plan, contact_name, phone, address, city, postal_code, siret, position) VALUES 
  ('550e8400-e29b-41d4-a716-446655440000', 'Decora Home Demo', 'demo@decorahome.com', 'professional', 'Demo User', '+33 1 23 45 67 89', '123 Rue Demo', 'Paris', '75001', '12345678901234', 'Gérant')
ON CONFLICT (email) DO NOTHING;

INSERT INTO retailer_settings (retailer_id, robot_name, robot_personality, robot_theme) VALUES 
  ('550e8400-e29b-41d4-a716-446655440000', 'OmnIA', 'expert_friendly', '{"primary_color": "#0891b2", "secondary_color": "#1e40af"}')
ON CONFLICT (retailer_id) DO NOTHING;

-- Insert sample enriched products for demo
INSERT INTO products_enriched (
  retailer_id, handle, title, description, category, subcategory, 
  color, material, style, room, price, stock_qty, image_url, product_url,
  tags, seo_title, seo_description, confidence_score, brand
) VALUES 
  (
    '550e8400-e29b-41d4-a716-446655440000',
    'canape-alyana-convertible',
    'Canapé ALYANA convertible - Velours côtelé',
    'Canapé d''angle convertible 4 places en velours côtelé avec coffre de rangement. Design arrondi tendance pour intérieurs contemporains.',
    'Canapé',
    'Canapé d''angle convertible',
    'beige',
    'velours côtelé',
    'moderne',
    'salon',
    799.00,
    100,
    'https://cdn.shopify.com/s/files/1/0903/7578/2665/files/7_23a97631-68d2-4f3e-8f78-b26c7cd4c2ae.png?v=1754406480',
    'https://decorahome.fr/products/canape-dangle-convertible-et-reversible-4-places-en-velours-cotele',
    ARRAY['convertible', 'velours', 'angle', 'rangement'],
    'Canapé ALYANA convertible velours côtelé - Decora Home',
    'Canapé d''angle convertible 4 places en velours côtelé beige. Design moderne avec coffre de rangement. Livraison gratuite.',
    92,
    'Decora Home'
  ),
  (
    '550e8400-e29b-41d4-a716-446655440000',
    'table-aurea-travertin',
    'Table AUREA - Travertin naturel Ø100cm',
    'Table ronde en travertin naturel avec pieds en métal noir. Élégance minérale pour espaces modernes et bohèmes.',
    'Table',
    'Table à manger ronde',
    'naturel',
    'travertin naturel',
    'contemporain',
    'salle à manger',
    499.00,
    50,
    'https://cdn.shopify.com/s/files/1/0903/7578/2665/files/3_e80b9a50-b032-4267-8f5b-f9130153e3be.png?v=1754406484',
    'https://decorahome.fr/products/table-a-manger-ronde-plateau-en-travertin-naturel-100-120-cm',
    ARRAY['travertin', 'ronde', 'naturel', 'élégant'],
    'Table AUREA travertin naturel Ø100cm - Decora Home',
    'Table ronde en travertin naturel avec pieds métal noir. Design contemporain et élégant. Livraison gratuite.',
    88,
    'Decora Home'
  ),
  (
    '550e8400-e29b-41d4-a716-446655440000',
    'chaise-inaya-chenille',
    'Chaise INAYA - Tissu chenille gris clair',
    'Chaise en tissu chenille avec pieds métal noir. Design baguette épuré et moderne avec structure solide.',
    'Chaise',
    'Chaise de salle à manger',
    'gris clair',
    'tissu chenille',
    'contemporain',
    'salle à manger',
    99.00,
    96,
    'https://cdn.shopify.com/s/files/1/0903/7578/2665/files/3_3f11d1af-8ce5-4d2d-a435-cd0a78eb92ee.png?v=1755791319',
    'https://decorahome.fr/products/chaise-en-tissu-serge-chenille-pieds-metal-noir-gris-clair-moka-et-beige',
    ARRAY['chenille', 'métal', 'contemporain', 'élégant'],
    'Chaise INAYA tissu chenille gris clair - Decora Home',
    'Chaise en tissu chenille avec pieds métal noir. Design contemporain et élégant. Structure solide.',
    76,
    'Decora Home'
  )
ON CONFLICT (retailer_id, handle) DO NOTHING;

-- 7. Create retailer_conversations table (depends on retailers)
CREATE TABLE IF NOT EXISTS retailer_conversations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  retailer_id uuid REFERENCES retailers(id) ON DELETE CASCADE,
  session_id text NOT NULL,
  user_message text NOT NULL,
  ai_response text NOT NULL,
  products_shown jsonb DEFAULT '[]',
  user_ip text,
  user_agent text,
  conversation_type text DEFAULT 'product_search' CHECK (conversation_type IN ('product_search', 'design_advice', 'general')),
  satisfaction_score integer CHECK (satisfaction_score >= 1 AND satisfaction_score <= 5),
  created_at timestamptz DEFAULT now()
);

-- 8. Create ai_training_metadata table (standalone)
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

CREATE POLICY "anyone_insert_conversations"
  ON retailer_conversations
  FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

CREATE POLICY "service_manage_conversations"
  ON retailer_conversations
  FOR ALL
  TO service_role
  USING (true);

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
  USING (true)
  WITH CHECK (true);

-- Create indexes for performance
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

CREATE INDEX IF NOT EXISTS idx_retailer_settings_retailer_id ON retailer_settings(retailer_id);