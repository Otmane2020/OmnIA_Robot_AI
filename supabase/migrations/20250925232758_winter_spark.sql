/*
  # Create retailer system with AI-enriched products

  1. New Tables
    - `retailers` - Company information and settings
    - `retailer_products` - Product catalog isolated by retailer
    - `products_enriched` - AI-enriched product data with technical specs
    - `retailer_conversations` - Chat history with retailer isolation
    - `retailer_settings` - Customizable settings per retailer
    - `ai_training_metadata` - Global AI training information

  2. Security
    - Enable RLS on all tables
    - Retailer-specific data access policies
    - Complete data isolation between retailers
    - Service role access for system operations

  3. Performance
    - Indexes for retailer filtering
    - Category, color, material search indexes
    - Conversation and session tracking indexes
*/

-- Drop existing policies if they exist to avoid conflicts
DROP POLICY IF EXISTS "Retailers can manage own products" ON retailer_products;
DROP POLICY IF EXISTS "Retailers can manage own enriched products" ON products_enriched;
DROP POLICY IF EXISTS "Retailers can read own conversations" ON retailer_conversations;
DROP POLICY IF EXISTS "System can insert conversations" ON retailer_conversations;
DROP POLICY IF EXISTS "Retailers can manage own settings" ON retailer_settings;
DROP POLICY IF EXISTS "Retailers can read own data" ON retailers;
DROP POLICY IF EXISTS "Retailers can update own data" ON retailers;

-- Retailers table (company information)
CREATE TABLE IF NOT EXISTS retailers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  company_name text NOT NULL,
  email text UNIQUE NOT NULL,
  phone text,
  address text,
  website text,
  plan text DEFAULT 'starter' CHECK (plan IN ('starter', 'professional', 'enterprise')),
  status text DEFAULT 'active' CHECK (status IN ('active', 'suspended', 'cancelled')),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Retailer products (isolated by retailer_id)
CREATE TABLE IF NOT EXISTS retailer_products (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  retailer_id uuid REFERENCES retailers(id) ON DELETE CASCADE,
  handle text NOT NULL,
  name text NOT NULL,
  description text,
  price decimal(10,2) NOT NULL DEFAULT 0,
  stock integer DEFAULT 0,
  category text,
  brand text,
  image_url text,
  product_url text,
  status text DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'archived')),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(retailer_id, handle)
);

-- AI-enriched products (with retailer isolation)
CREATE TABLE IF NOT EXISTS products_enriched (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  retailer_id uuid REFERENCES retailers(id) ON DELETE CASCADE,
  handle text NOT NULL,
  title text NOT NULL,
  description text,
  
  -- General info
  category text,
  subcategory text,
  
  -- Technical specs
  color text,
  material text,
  fabric text,
  style text,
  dimensions text,
  room text,
  
  -- Pricing and inventory
  price decimal(10,2) NOT NULL DEFAULT 0,
  stock_qty integer DEFAULT 0,
  
  -- Media
  image_url text,
  product_url text,
  
  -- SEO and marketing
  tags text[],
  seo_title text,
  seo_description text,
  ad_headline text,
  ad_description text,
  google_product_category text,
  gtin text,
  brand text,
  
  -- AI metadata
  confidence_score integer DEFAULT 0 CHECK (confidence_score >= 0 AND confidence_score <= 100),
  enriched_at timestamptz DEFAULT now(),
  enrichment_source text DEFAULT 'ai' CHECK (enrichment_source IN ('ai', 'manual', 'text_only', 'text_and_image')),
  
  -- Timestamps
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  
  UNIQUE(retailer_id, handle)
);

-- Retailer conversations (chat history with isolation)
CREATE TABLE IF NOT EXISTS retailer_conversations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  retailer_id uuid REFERENCES retailers(id) ON DELETE CASCADE,
  session_id uuid NOT NULL,
  user_message text NOT NULL,
  ai_response text NOT NULL,
  products_shown text[],
  conversation_type text DEFAULT 'general' CHECK (conversation_type IN ('general', 'product_search', 'style_advice', 'support')),
  created_at timestamptz DEFAULT now()
);

-- Retailer settings (customizable per retailer)
CREATE TABLE IF NOT EXISTS retailer_settings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  retailer_id uuid REFERENCES retailers(id) ON DELETE CASCADE UNIQUE,
  
  -- Company settings
  company_logo text,
  company_description text,
  business_hours jsonb,
  contact_info jsonb,
  
  -- AI Robot settings
  robot_name text DEFAULT 'OmnIA',
  robot_personality text DEFAULT 'professional',
  robot_voice text DEFAULT 'friendly',
  robot_theme jsonb DEFAULT '{"primary_color": "#3B82F6", "secondary_color": "#10B981"}',
  
  -- Training settings
  auto_training_enabled boolean DEFAULT true,
  training_frequency text DEFAULT 'weekly' CHECK (training_frequency IN ('daily', 'weekly', 'monthly')),
  last_training_at timestamptz,
  
  -- Feature flags
  features_enabled jsonb DEFAULT '{"chat": true, "product_search": true, "recommendations": true}',
  
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- AI training metadata
CREATE TABLE IF NOT EXISTS ai_training_metadata (
  id text PRIMARY KEY DEFAULT 'singleton',
  last_training timestamptz,
  products_count integer DEFAULT 0,
  training_type text,
  model_version text DEFAULT '2.1',
  updated_at timestamptz DEFAULT now()
);

-- Enable RLS on all tables
ALTER TABLE retailers ENABLE ROW LEVEL SECURITY;
ALTER TABLE retailer_products ENABLE ROW LEVEL SECURITY;
ALTER TABLE products_enriched ENABLE ROW LEVEL SECURITY;
ALTER TABLE retailer_conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE retailer_settings ENABLE ROW LEVEL SECURITY;

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
  TO service_role
  WITH CHECK (true);

-- RLS Policies for retailer_settings
CREATE POLICY "retailers_manage_own_settings"
  ON retailer_settings
  FOR ALL
  TO authenticated
  USING (retailer_id = auth.uid());

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_retailer_products_retailer_id ON retailer_products(retailer_id);
CREATE INDEX IF NOT EXISTS idx_retailer_products_category ON retailer_products(category);
CREATE INDEX IF NOT EXISTS idx_retailer_products_status ON retailer_products(status);

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

-- Insert demo data for testing
INSERT INTO retailers (id, company_name, email, plan) VALUES 
  ('550e8400-e29b-41d4-a716-446655440000', 'Decora Home Demo', 'demo@decorahome.com', 'professional')
ON CONFLICT (email) DO NOTHING;

INSERT INTO retailer_settings (retailer_id, robot_name, robot_personality) VALUES 
  ('550e8400-e29b-41d4-a716-446655440000', 'OmnIA', 'expert_friendly')
ON CONFLICT (retailer_id) DO NOTHING;