/*
  # Multi-Seller Platform Database Schema

  1. New Tables
    - `sellers` - Individual seller accounts with their own dashboards
    - `seller_products` - Products specific to each seller
    - `seller_conversations` - Chat history isolated per seller
    - `seller_settings` - Individual seller configurations
    - `seller_analytics` - Performance metrics per seller

  2. Security
    - Enable RLS on all new tables
    - Add policies for seller data isolation
    - Ensure sellers can only access their own data

  3. Relationships
    - Link all seller data through seller_id foreign keys
    - Maintain data integrity with proper constraints
*/

-- Create sellers table
CREATE TABLE IF NOT EXISTS sellers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email text UNIQUE NOT NULL,
  password_hash text NOT NULL,
  company_name text NOT NULL,
  subdomain text UNIQUE NOT NULL,
  plan text NOT NULL CHECK (plan IN ('starter', 'professional', 'enterprise')),
  status text NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'suspended')),
  contact_name text NOT NULL,
  phone text,
  address text,
  city text,
  postal_code text,
  siret text,
  position text,
  avatar_url text,
  created_at timestamptz DEFAULT now(),
  validated_at timestamptz,
  last_login timestamptz,
  updated_at timestamptz DEFAULT now()
);

-- Create seller_products table
CREATE TABLE IF NOT EXISTS seller_products (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  seller_id uuid NOT NULL REFERENCES sellers(id) ON DELETE CASCADE,
  external_id text NOT NULL,
  name text NOT NULL,
  description text DEFAULT '',
  price numeric(10,2) NOT NULL DEFAULT 0,
  compare_at_price numeric(10,2),
  category text DEFAULT '',
  vendor text DEFAULT '',
  image_url text DEFAULT '',
  product_url text DEFAULT '',
  stock integer DEFAULT 0,
  source_platform text NOT NULL DEFAULT 'manual' CHECK (source_platform IN ('shopify', 'csv', 'xml', 'manual')),
  status text NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'draft')),
  sku text DEFAULT '',
  tags text[] DEFAULT '{}',
  extracted_attributes jsonb DEFAULT '{}',
  confidence_score integer DEFAULT 0 CHECK (confidence_score >= 0 AND confidence_score <= 100),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(seller_id, external_id, source_platform)
);

-- Create seller_conversations table
CREATE TABLE IF NOT EXISTS seller_conversations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  seller_id uuid NOT NULL REFERENCES sellers(id) ON DELETE CASCADE,
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

-- Create seller_settings table
CREATE TABLE IF NOT EXISTS seller_settings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  seller_id uuid NOT NULL REFERENCES sellers(id) ON DELETE CASCADE,
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
  UNIQUE(seller_id)
);

-- Create seller_analytics table
CREATE TABLE IF NOT EXISTS seller_analytics (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  seller_id uuid NOT NULL REFERENCES sellers(id) ON DELETE CASCADE,
  date date NOT NULL,
  conversations_count integer DEFAULT 0,
  unique_visitors integer DEFAULT 0,
  products_viewed integer DEFAULT 0,
  cart_additions integer DEFAULT 0,
  conversions integer DEFAULT 0,
  revenue numeric(10,2) DEFAULT 0,
  avg_session_duration interval,
  top_products jsonb DEFAULT '[]',
  top_searches jsonb DEFAULT '[]',
  created_at timestamptz DEFAULT now(),
  UNIQUE(seller_id, date)
);

-- Enable RLS on all tables
ALTER TABLE sellers ENABLE ROW LEVEL SECURITY;
ALTER TABLE seller_products ENABLE ROW LEVEL SECURITY;
ALTER TABLE seller_conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE seller_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE seller_analytics ENABLE ROW LEVEL SECURITY;

-- Policies for sellers table
CREATE POLICY "Sellers can read own data"
  ON sellers
  FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Sellers can update own data"
  ON sellers
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = id);

-- Policies for seller_products table
CREATE POLICY "Sellers can manage own products"
  ON seller_products
  FOR ALL
  TO authenticated
  USING (seller_id = auth.uid());

-- Policies for seller_conversations table
CREATE POLICY "Sellers can read own conversations"
  ON seller_conversations
  FOR SELECT
  TO authenticated
  USING (seller_id = auth.uid());

CREATE POLICY "Anyone can insert conversations"
  ON seller_conversations
  FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

-- Policies for seller_settings table
CREATE POLICY "Sellers can manage own settings"
  ON seller_settings
  FOR ALL
  TO authenticated
  USING (seller_id = auth.uid());

-- Policies for seller_analytics table
CREATE POLICY "Sellers can read own analytics"
  ON seller_analytics
  FOR ALL
  TO authenticated
  USING (seller_id = auth.uid());

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_seller_products_seller_id ON seller_products(seller_id);
CREATE INDEX IF NOT EXISTS idx_seller_products_status ON seller_products(seller_id, status);
CREATE INDEX IF NOT EXISTS idx_seller_conversations_seller_id ON seller_conversations(seller_id);
CREATE INDEX IF NOT EXISTS idx_seller_conversations_session ON seller_conversations(seller_id, session_id);
CREATE INDEX IF NOT EXISTS idx_seller_analytics_seller_date ON seller_analytics(seller_id, date);

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_seller_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for updated_at
CREATE TRIGGER update_sellers_updated_at
  BEFORE UPDATE ON sellers
  FOR EACH ROW
  EXECUTE FUNCTION update_seller_updated_at();

CREATE TRIGGER update_seller_products_updated_at
  BEFORE UPDATE ON seller_products
  FOR EACH ROW
  EXECUTE FUNCTION update_seller_updated_at();

CREATE TRIGGER update_seller_settings_updated_at
  BEFORE UPDATE ON seller_settings
  FOR EACH ROW
  EXECUTE FUNCTION update_seller_updated_at();