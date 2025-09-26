/*
  # Create products_enriched table

  1. New Tables
    - `products_enriched`
      - Complete product information with AI-enriched attributes
      - Technical specifications (dimensions, materials, colors)
      - SEO and marketing attributes
      - AI confidence scores
      - Retailer isolation with retailer_id

  2. Security
    - Enable RLS on products_enriched table
    - Add policies for retailer-specific data access
    - Ensure data isolation between retailers

  3. Indexes
    - Performance indexes for common queries
    - Retailer-specific filtering
    - Search and categorization
*/

-- Create products_enriched table
CREATE TABLE IF NOT EXISTS products_enriched (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  retailer_id uuid NOT NULL,
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

-- Enable Row Level Security
ALTER TABLE products_enriched ENABLE ROW LEVEL SECURITY;

-- RLS Policies for retailer data isolation
CREATE POLICY "Retailers can manage own enriched products"
  ON products_enriched
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM retailers 
      WHERE retailers.id = products_enriched.retailer_id 
      AND auth.uid()::text = retailers.id::text
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM retailers 
      WHERE retailers.id = products_enriched.retailer_id 
      AND auth.uid()::text = retailers.id::text
    )
  );

-- Policy for public read access to active products
CREATE POLICY "Public can read active enriched products"
  ON products_enriched
  FOR SELECT
  TO anon, authenticated
  USING (stock_qty > 0);

-- Policy for super admins to manage all enriched products
CREATE POLICY "Super admins can manage all enriched products"
  ON products_enriched
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM user_roles 
      WHERE user_roles.user_id = auth.uid() 
      AND user_roles.role = 'super_admin'
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM user_roles 
      WHERE user_roles.user_id = auth.uid() 
      AND user_roles.role = 'super_admin'
    )
  );

-- Policy for service role to manage enriched products
CREATE POLICY "Service role can manage enriched products"
  ON products_enriched
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- Performance indexes for common queries
CREATE INDEX IF NOT EXISTS idx_products_enriched_retailer_id ON products_enriched(retailer_id);
CREATE INDEX IF NOT EXISTS idx_products_enriched_category ON products_enriched(category);
CREATE INDEX IF NOT EXISTS idx_products_enriched_category_type ON products_enriched(category, subcategory);
CREATE INDEX IF NOT EXISTS idx_products_enriched_color ON products_enriched(color);
CREATE INDEX IF NOT EXISTS idx_products_enriched_material ON products_enriched(material);
CREATE INDEX IF NOT EXISTS idx_products_enriched_style ON products_enriched(style);
CREATE INDEX IF NOT EXISTS idx_products_enriched_room ON products_enriched(room);
CREATE INDEX IF NOT EXISTS idx_products_enriched_price ON products_enriched(price);
CREATE INDEX IF NOT EXISTS idx_products_enriched_stock ON products_enriched(stock_qty);
CREATE INDEX IF NOT EXISTS idx_products_enriched_confidence ON products_enriched(confidence_score);
CREATE INDEX IF NOT EXISTS idx_products_enriched_enriched_at ON products_enriched(enriched_at DESC);
CREATE INDEX IF NOT EXISTS idx_products_enriched_retailer_handle ON products_enriched(retailer_id, handle);
CREATE INDEX IF NOT EXISTS idx_products_enriched_handle ON products_enriched(handle);
CREATE INDEX IF NOT EXISTS idx_products_enriched_brand ON products_enriched(brand);
CREATE INDEX IF NOT EXISTS idx_products_enriched_google_category ON products_enriched(google_product_category);
CREATE INDEX IF NOT EXISTS idx_products_enriched_gtin ON products_enriched(gtin);
CREATE INDEX IF NOT EXISTS idx_products_enriched_attributes ON products_enriched(color, material, style);
CREATE INDEX IF NOT EXISTS idx_products_enriched_tags ON products_enriched USING gin(tags);
CREATE INDEX IF NOT EXISTS idx_products_enriched_tags_search ON products_enriched USING gin(tags);

-- Full-text search indexes
CREATE INDEX IF NOT EXISTS idx_products_enriched_title_search ON products_enriched USING gin(to_tsvector('french', title));
CREATE INDEX IF NOT EXISTS idx_products_enriched_description_search ON products_enriched USING gin(to_tsvector('french', description));
CREATE INDEX IF NOT EXISTS idx_products_enriched_search ON products_enriched USING gin(to_tsvector('french', title || ' ' || description));
CREATE INDEX IF NOT EXISTS idx_products_enriched_seo_search ON products_enriched USING gin(to_tsvector('french', seo_title || ' ' || seo_description));

-- Add foreign key constraint to retailers table
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints 
    WHERE constraint_name = 'products_enriched_retailer_id_fkey'
  ) THEN
    ALTER TABLE products_enriched 
    ADD CONSTRAINT products_enriched_retailer_id_fkey 
    FOREIGN KEY (retailer_id) REFERENCES retailers(id) ON DELETE CASCADE;
  END IF;
END $$;