/*
  # Create products_enriched table (safe migration)

  1. New Tables
    - `products_enriched`
      - `id` (uuid, primary key)
      - `handle` (text, unique identifier)
      - `title` (text, product name)
      - `description` (text, product description)
      - `category` (text, main category)
      - `type` (text, specific product type)
      - `color` (text, main color)
      - `material` (text, main material)
      - `fabric` (text, fabric type)
      - `style` (text, design style)
      - `dimensions` (text, size information)
      - `room` (text, target room)
      - `price` (numeric, price)
      - `stock_qty` (integer, stock quantity)
      - `image_url` (text, product image)
      - `product_url` (text, product link)
      - `created_at` (timestamp)

  2. Security
    - Enable RLS on `products_enriched` table
    - Add policies for authenticated users (only if not exists)

  3. Indexes
    - Performance indexes for search and filtering
*/

-- Create table only if it doesn't exist
CREATE TABLE IF NOT EXISTS products_enriched (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  handle text UNIQUE NOT NULL,
  title text,
  description text,
  category text,
  type text,
  color text,
  material text,
  fabric text,
  style text,
  dimensions text,
  room text,
  price numeric,
  stock_qty integer DEFAULT 0,
  image_url text,
  product_url text,
  created_at timestamp without time zone DEFAULT now()
);

-- Enable RLS only if not already enabled
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_tables 
    WHERE tablename = 'products_enriched' 
    AND rowsecurity = true
  ) THEN
    ALTER TABLE products_enriched ENABLE ROW LEVEL SECURITY;
  END IF;
END $$;

-- Create policies only if they don't exist
DO $$
BEGIN
  -- Policy for authenticated users to manage products
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'products_enriched' 
    AND policyname = 'Authenticated users can manage products'
  ) THEN
    CREATE POLICY "Authenticated users can manage products"
      ON products_enriched
      FOR ALL
      TO authenticated
      USING (true)
      WITH CHECK (true);
  END IF;

  -- Policy for public to read active products
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'products_enriched' 
    AND policyname = 'Public can read active products'
  ) THEN
    CREATE POLICY "Public can read active products"
      ON products_enriched
      FOR SELECT
      TO anon, authenticated
      USING (stock_qty > 0);
  END IF;
END $$;

-- Create indexes for performance (only if they don't exist)
CREATE INDEX IF NOT EXISTS idx_products_enriched_handle ON products_enriched USING btree (handle);
CREATE INDEX IF NOT EXISTS idx_products_enriched_category ON products_enriched USING btree (category);
CREATE INDEX IF NOT EXISTS idx_products_enriched_type ON products_enriched USING btree (type);
CREATE INDEX IF NOT EXISTS idx_products_enriched_color ON products_enriched USING btree (color);
CREATE INDEX IF NOT EXISTS idx_products_enriched_material ON products_enriched USING btree (material);
CREATE INDEX IF NOT EXISTS idx_products_enriched_style ON products_enriched USING btree (style);
CREATE INDEX IF NOT EXISTS idx_products_enriched_room ON products_enriched USING btree (room);
CREATE INDEX IF NOT EXISTS idx_products_enriched_price ON products_enriched USING btree (price);
CREATE INDEX IF NOT EXISTS idx_products_enriched_stock ON products_enriched USING btree (stock_qty);
CREATE INDEX IF NOT EXISTS idx_products_enriched_search ON products_enriched USING gin (to_tsvector('french'::regconfig, ((title || ' '::text) || description)));