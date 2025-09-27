/*
  # Create retailer management system with proper isolation

  1. New Tables
    - `retailers` - Company information and account details
    - `retailer_products` - Products isolated by retailer_id
    - `products_enriched` - AI-enriched products with retailer isolation
    - `retailer_conversations` - Chat history with retailer isolation
    - `retailer_settings` - Customizable settings per retailer
    - `ai_training_metadata` - Global AI training metadata

  2. Security
    - Enable RLS on all tables
    - Add policies for retailer data isolation
    - Add policies for public read access where appropriate
    - Add policies for super admin access

  3. Performance
    - Add indexes for common queries
    - Add full-text search indexes
    - Add composite indexes for filtering
*/

-- Drop existing policies if they exist to avoid conflicts
DROP POLICY IF EXISTS "Retailers can manage own products" ON retailer_products;
DROP POLICY IF EXISTS "Retailers can manage own enriched products" ON products_enriched;
DROP POLICY IF EXISTS "Retailers can read own conversations" ON retailer_conversations;
DROP POLICY IF EXISTS "System can insert conversations" ON retailer_conversations;
DROP POLICY IF EXISTS "Retailers can manage own settings" ON retailer_settings;
DROP POLICY IF EXISTS "Retailers can read own data" ON retailers;
DROP POLICY IF EXISTS "Retailers can update own data" ON retailers;
DROP POLICY IF EXISTS "retailers_read_own_data" ON retailers;
DROP POLICY IF EXISTS "retailers_update_own_data" ON retailers;
DROP POLICY IF EXISTS "retailers_manage_own_products" ON retailer_products;
DROP POLICY IF EXISTS "retailers_manage_own_enriched_products" ON products_enriched;
DROP POLICY IF EXISTS "public_read_active_enriched_products" ON products_enriched;
DROP POLICY IF EXISTS "retailers_read_own_conversations" ON retailer_conversations;
DROP POLICY IF EXISTS "system_insert_conversations" ON retailer_conversations;
DROP POLICY IF EXISTS "retailers_manage_own_settings" ON retailer_settings;

-- Retailers table (company information)
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
  subdomain text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Retailer products (isolated by retailer_id)
CREATE TABLE IF NOT EXISTS retailer_products (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  retailer_id uuid NOT NULL REFERENCES retailers(id) ON DELETE CASCADE,
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
  retailer_id uuid NOT NULL REFERENCES retailers(id) ON DELETE CASCADE,
  handle text NOT NULL,
  title text NOT NULL,
  description text DEFAULT '',
  
  -- General categorization
  category text DEFAULT '',
  subcategory text DEFAULT '',
  
  -- Technical specifications
  color text DEFAULT '',
  material text DEFAULT '',
  fabric text DEFAULT '',
  style text DEFAULT '',
  dimensions text DEFAULT '',
  room text DEFAULT '',
  
  -- Pricing and inventory
  price numeric(10,2) NOT NULL DEFAULT 0,
  stock_qty integer DEFAULT 0,
  
  -- Media
  image_url text DEFAULT '',
  product_url text DEFAULT '',
  
  -- SEO and marketing attributes
  tags text[] DEFAULT '{}',
  seo_title text DEFAULT '' CHECK (char_length(seo_title) <= 70),
  seo_description text DEFAULT '' CHECK (char_length(seo_description) <= 155),
  ad_headline text DEFAULT '' CHECK (char_length(ad_headline) <= 30),
  ad_description text DEFAULT '' CHECK (char_length(ad_description) <= 90),
  google_product_category text DEFAULT '',
  gtin text DEFAULT '',
  brand text DEFAULT '',
  
  -- AI metadata
  confidence_score integer DEFAULT 0 CHECK (confidence_score >= 0 AND confidence_score <= 100),
  enriched_at timestamptz DEFAULT now(),
  enrichment_source text DEFAULT 'manual' CHECK (enrichment_source IN ('manual', 'ai', 'text_only', 'text_and_image')),
  
  -- Timestamps
  created_at timestamptz DEFAULT now(),
  
  -- Ensure unique handle per retailer
  UNIQUE(retailer_id, handle)
);

-- Retailer conversations (chat history with isolation)
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

-- Retailer settings (customizable per retailer)
CREATE TABLE IF NOT EXISTS retailer_settings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  retailer_id uuid NOT NULL REFERENCES retailers(id) ON DELETE CASCADE,
  
  -- Company settings
  company_logo text,
  company_description text,
  business_hours jsonb,
  contact_info jsonb,
  
  -- AI Robot settings
  robot_name text DEFAULT 'OmnIA',
  robot_personality text DEFAULT 'commercial' CHECK (robot_personality IN ('commercial', 'expert', 'friendly')),
  language text DEFAULT 'fr' CHECK (language IN ('fr', 'en', 'es', 'de')),
  voice_provider text DEFAULT 'browser' CHECK (voice_provider IN ('browser', 'elevenlabs', 'openai')),
  voice_speed numeric(3,1) DEFAULT 1.0 CHECK (voice_speed >= 0.5 AND voice_speed <= 2.0),
  theme_colors jsonb DEFAULT '{"primary": "#0891b2", "secondary": "#1e40af"}',
  widget_position text DEFAULT 'bottom-right' CHECK (widget_position IN ('bottom-right', 'bottom-left')),
  auto_training boolean DEFAULT true,
  
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  
  UNIQUE(retailer_id)
);

-- AI training metadata
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
CREATE INDEX IF NOT EXISTS idx_retailers_email ON retailers(email);
CREATE INDEX IF NOT EXISTS idx_retailers_subdomain ON retailers(subdomain);

CREATE INDEX IF NOT EXISTS idx_retailer_products_retailer_id ON retailer_products(retailer_id);
CREATE INDEX IF NOT EXISTS idx_retailer_products_category ON retailer_products(category);
CREATE INDEX IF NOT EXISTS idx_retailer_products_status ON retailer_products(retailer_id, status);

CREATE INDEX IF NOT EXISTS idx_products_enriched_retailer_id ON products_enriched(retailer_id);
CREATE INDEX IF NOT EXISTS idx_products_enriched_category ON products_enriched(category);
CREATE INDEX IF NOT EXISTS idx_products_enriched_color ON products_enriched(color);
CREATE INDEX IF NOT EXISTS idx_products_enriched_material ON products_enriched(material);
CREATE INDEX IF NOT EXISTS idx_products_enriched_style ON products_enriched(style);
CREATE INDEX IF NOT EXISTS idx_products_enriched_room ON products_enriched(room);
CREATE INDEX IF NOT EXISTS idx_products_enriched_price ON products_enriched(price);
CREATE INDEX IF NOT EXISTS idx_products_enriched_stock_quantity ON products_enriched(stock_qty);
CREATE INDEX IF NOT EXISTS idx_products_enriched_confidence ON products_enriched(confidence_score);
CREATE INDEX IF NOT EXISTS idx_products_enriched_enriched_at ON products_enriched(enriched_at DESC);
CREATE INDEX IF NOT EXISTS idx_products_enriched_retailer_handle ON products_enriched(retailer_id, handle);
CREATE INDEX IF NOT EXISTS idx_products_enriched_handle ON products_enriched(handle);
CREATE INDEX IF NOT EXISTS idx_products_enriched_brand ON products_enriched(brand);
CREATE INDEX IF NOT EXISTS idx_products_enriched_google_category ON products_enriched(google_product_category);
CREATE INDEX IF NOT EXISTS idx_products_enriched_gtin ON products_enriched(gtin);
CREATE INDEX IF NOT EXISTS idx_products_enriched_attributes ON products_enriched(color, material, style);
CREATE INDEX IF NOT EXISTS idx_products_enriched_tags ON products_enriched USING gin(tags);

-- Full-text search indexes
CREATE INDEX IF NOT EXISTS idx_products_enriched_title_search ON products_enriched USING gin(to_tsvector('french', title));
CREATE INDEX IF NOT EXISTS idx_products_enriched_description_search ON products_enriched USING gin(to_tsvector('french', description));
CREATE INDEX IF NOT EXISTS idx_products_enriched_search ON products_enriched USING gin(to_tsvector('french', title || ' ' || description));
CREATE INDEX IF NOT EXISTS idx_products_enriched_seo_search ON products_enriched USING gin(to_tsvector('french', seo_title || ' ' || seo_description));

CREATE INDEX IF NOT EXISTS idx_retailer_conversations_retailer_id ON retailer_conversations(retailer_id);
CREATE INDEX IF NOT EXISTS idx_retailer_conversations_session_id ON retailer_conversations(session_id);
CREATE INDEX IF NOT EXISTS idx_retailer_conversations_created_at ON retailer_conversations(created_at DESC);

-- Insert demo data for testing (only after all tables are created)
INSERT INTO retailers (id, company_name, email, plan, contact_name, subdomain) VALUES 
  ('550e8400-e29b-41d4-a716-446655440000', 'Decora Home Demo', 'demo@decorahome.com', 'professional', 'Demo User', 'decorahome')
ON CONFLICT (email) DO NOTHING;

INSERT INTO retailer_settings (retailer_id, robot_name, robot_personality) VALUES 
  ('550e8400-e29b-41d4-a716-446655440000', 'OmnIA', 'commercial')
ON CONFLICT (retailer_id) DO NOTHING;