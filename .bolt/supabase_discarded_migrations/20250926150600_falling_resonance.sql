/*
  # Create products_enriched table with comprehensive attributes

  1. New Tables
    - `products_enriched`
      - `id` (uuid, primary key)
      - `handle` (text, unique)
      - `title` (text, required)
      - `description` (text)
      - Category and technical specifications
      - Pricing and inventory data
      - SEO and marketing fields
      - AI metadata with confidence scoring
      - Retailer isolation with UUID foreign key

  2. Security
    - Enable RLS on `products_enriched` table
    - Add policy for retailer-specific access using UUID comparison
    - Add policy for service role access

  3. Performance
    - Comprehensive indexing for search and filtering
    - Full-text search index for French content
    - Automatic timestamp updates

  4. Changes
    - Fixed UUID/text type mismatch by using proper UUID type for retailer_id
    - Added foreign key constraint to retailers table
    - Proper type casting for UUID comparisons in policies
*/

-- Create products_enriched table with comprehensive attributes
CREATE TABLE IF NOT EXISTS products_enriched (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  handle text UNIQUE NOT NULL,
  title text NOT NULL,
  description text DEFAULT '',
  
  -- General product info
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
  price decimal(10,2) DEFAULT 0,
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
  enrichment_source text DEFAULT 'manual',
  
  -- Retailer isolation with proper UUID type
  retailer_id uuid NOT NULL,
  
  -- Timestamps
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Add foreign key constraint to retailers table
ALTER TABLE products_enriched 
ADD CONSTRAINT fk_products_enriched_retailer 
FOREIGN KEY (retailer_id) REFERENCES retailers(id) ON DELETE CASCADE;

-- Enable Row Level Security
ALTER TABLE products_enriched ENABLE ROW LEVEL SECURITY;

-- Create policy for retailer-specific access with proper UUID casting
CREATE POLICY "Retailers can access their own enriched products"
  ON products_enriched
  FOR ALL
  TO authenticated
  USING (retailer_id = (auth.uid())::uuid);

-- Create policy for service role (for Edge Functions)
CREATE POLICY "Service role can access all enriched products"
  ON products_enriched
  FOR ALL
  TO service_role
  USING (true);

-- Create policy for public read access to active products
CREATE POLICY "Public can read active enriched products"
  ON products_enriched
  FOR SELECT
  TO anon, authenticated
  USING (stock_qty > 0);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_products_enriched_retailer_id ON products_enriched(retailer_id);
CREATE INDEX IF NOT EXISTS idx_products_enriched_category ON products_enriched(category);
CREATE INDEX IF NOT EXISTS idx_products_enriched_category_type ON products_enriched(category, subcategory);
CREATE INDEX IF NOT EXISTS idx_products_enriched_color ON products_enriched(color);
CREATE INDEX IF NOT EXISTS idx_products_enriched_material ON products_enriched(material);
CREATE INDEX IF NOT EXISTS idx_products_enriched_style ON products_enriched(style);
CREATE INDEX IF NOT EXISTS idx_products_enriched_room ON products_enriched(room);
CREATE INDEX IF NOT EXISTS idx_products_enriched_confidence ON products_enriched(confidence_score);
CREATE INDEX IF NOT EXISTS idx_products_enriched_created_at ON products_enriched(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_products_enriched_price ON products_enriched(price);
CREATE INDEX IF NOT EXISTS idx_products_enriched_stock ON products_enriched(stock_qty);
CREATE INDEX IF NOT EXISTS idx_products_enriched_handle ON products_enriched(handle);
CREATE INDEX IF NOT EXISTS idx_products_enriched_brand ON products_enriched(brand);
CREATE INDEX IF NOT EXISTS idx_products_enriched_enriched_at ON products_enriched(enriched_at DESC);
CREATE INDEX IF NOT EXISTS idx_products_enriched_retailer_handle ON products_enriched(retailer_id, handle);

-- Create composite indexes for common queries
CREATE INDEX IF NOT EXISTS idx_products_enriched_attributes ON products_enriched(color, material, style);
CREATE INDEX IF NOT EXISTS idx_products_enriched_search_filters ON products_enriched(retailer_id, category, stock_qty);

-- Create full-text search indexes
CREATE INDEX IF NOT EXISTS idx_products_enriched_title_search 
  ON products_enriched 
  USING gin(to_tsvector('french', title));

CREATE INDEX IF NOT EXISTS idx_products_enriched_description_search 
  ON products_enriched 
  USING gin(to_tsvector('french', description));

CREATE INDEX IF NOT EXISTS idx_products_enriched_search 
  ON products_enriched 
  USING gin(to_tsvector('french', title || ' ' || description));

CREATE INDEX IF NOT EXISTS idx_products_enriched_tags_search 
  ON products_enriched 
  USING gin(tags);

CREATE INDEX IF NOT EXISTS idx_products_enriched_seo_search 
  ON products_enriched 
  USING gin(to_tsvector('french', seo_title || ' ' || seo_description));

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger to automatically update updated_at
DROP TRIGGER IF EXISTS update_products_enriched_updated_at ON products_enriched;
CREATE TRIGGER update_products_enriched_updated_at
  BEFORE UPDATE ON products_enriched
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();