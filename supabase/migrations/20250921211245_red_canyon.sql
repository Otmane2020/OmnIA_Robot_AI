/*
  # Create Google Merchant table for product feeds

  1. New Tables
    - `google_merchant_products`
      - `id` (uuid, primary key)
      - `retailer_id` (uuid, foreign key to retailers)
      - `product_id` (uuid, reference to enriched product)
      - All Google Shopping feed fields
      - `created_at` (timestamp)
      - `updated_at` (timestamp)
  
  2. Security
    - Enable RLS on `google_merchant_products` table
    - Add policy for retailers to manage their own Google Merchant data
*/

CREATE TABLE IF NOT EXISTS google_merchant_products (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  retailer_id uuid NOT NULL,
  product_id uuid,
  
  -- Google Shopping required fields
  google_id text NOT NULL,
  title text NOT NULL,
  description text NOT NULL,
  item_group_id text,
  link text NOT NULL,
  product_type text,
  google_product_category text,
  image_link text NOT NULL,
  condition text DEFAULT 'new',
  availability text NOT NULL,
  price text NOT NULL,
  sale_price text,
  
  -- Product identifiers
  mpn text,
  brand text NOT NULL,
  gtin text,
  identifier_exists text DEFAULT 'no',
  
  -- Additional fields
  canonical_link text,
  additional_image_link_1 text DEFAULT '',
  additional_image_link_2 text DEFAULT '',
  additional_image_link_3 text DEFAULT '',
  additional_image_link_4 text DEFAULT '',
  
  -- Product attributes
  product_length text DEFAULT '',
  product_width text DEFAULT '',
  product_height text DEFAULT '',
  percent_off integer DEFAULT 0,
  material text DEFAULT '',
  color text DEFAULT '',
  size text DEFAULT '',
  quantity integer DEFAULT 0,
  
  -- Product highlights
  product_highlight_1 text DEFAULT '',
  product_highlight_2 text DEFAULT '',
  product_highlight_3 text DEFAULT '',
  
  -- Metadata
  feed_generated_at timestamptz,
  last_updated_at timestamptz DEFAULT now(),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  
  CONSTRAINT google_merchant_products_retailer_google_id_unique UNIQUE (retailer_id, google_id)
);

-- Add retailer_id to products_enriched if not exists
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'products_enriched' AND column_name = 'retailer_id'
  ) THEN
    ALTER TABLE products_enriched ADD COLUMN retailer_id text DEFAULT 'demo-retailer-id';
  END IF;
END $$;

-- Enable RLS
ALTER TABLE google_merchant_products ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Retailers can manage own Google Merchant products"
  ON google_merchant_products
  FOR ALL
  TO authenticated
  USING (retailer_id = (SELECT email FROM retailers WHERE id = auth.uid()));

CREATE POLICY "Public can read active Google Merchant products"
  ON google_merchant_products
  FOR SELECT
  TO anon, authenticated
  USING (availability = 'in stock');

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_google_merchant_retailer_id ON google_merchant_products(retailer_id);
CREATE INDEX IF NOT EXISTS idx_google_merchant_availability ON google_merchant_products(availability);
CREATE INDEX IF NOT EXISTS idx_google_merchant_category ON google_merchant_products(google_product_category);
CREATE INDEX IF NOT EXISTS idx_products_enriched_retailer_id ON products_enriched(retailer_id);

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_google_merchant_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger
CREATE TRIGGER update_google_merchant_updated_at
  BEFORE UPDATE ON google_merchant_products
  FOR EACH ROW
  EXECUTE FUNCTION update_google_merchant_updated_at();