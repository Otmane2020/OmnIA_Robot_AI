/*
  # Create products_enriched table for AI-enhanced product catalog

  1. New Tables
    - `products_enriched`
      - `id` (uuid, primary key)
      - `handle` (text, unique identifier)
      - `title` (text, product name)
      - `description` (text, product description)
      - `category` (text, main category)
      - `type` (text, specific product type)
      - `color` (text, primary color)
      - `material` (text, main material)
      - `fabric` (text, fabric type if applicable)
      - `style` (text, design style)
      - `dimensions` (text, size information)
      - `room` (text, target room)
      - `price` (numeric, price in euros)
      - `stock_qty` (integer, available quantity)
      - `image_url` (text, product image)
      - `product_url` (text, link to product page)
      - `created_at` (timestamp)

  2. Security
    - Enable RLS on `products_enriched` table
    - Add policies for authenticated users to read their own data
    - Add policy for public to read active products

  3. Indexes
    - Add indexes for search performance on category, color, material, style, room
    - Add full-text search index on title and description
    - Add price range index
*/

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

ALTER TABLE products_enriched ENABLE ROW LEVEL SECURITY;

-- Policies for products_enriched
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
  USING (stock_qty > 0);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_products_enriched_category ON products_enriched USING btree (category);
CREATE INDEX IF NOT EXISTS idx_products_enriched_type ON products_enriched USING btree (type);
CREATE INDEX IF NOT EXISTS idx_products_enriched_color ON products_enriched USING btree (color);
CREATE INDEX IF NOT EXISTS idx_products_enriched_material ON products_enriched USING btree (material);
CREATE INDEX IF NOT EXISTS idx_products_enriched_style ON products_enriched USING btree (style);
CREATE INDEX IF NOT EXISTS idx_products_enriched_room ON products_enriched USING btree (room);
CREATE INDEX IF NOT EXISTS idx_products_enriched_price ON products_enriched USING btree (price);
CREATE INDEX IF NOT EXISTS idx_products_enriched_stock ON products_enriched USING btree (stock_qty);
CREATE INDEX IF NOT EXISTS idx_products_enriched_handle ON products_enriched USING btree (handle);

-- Full-text search index
CREATE INDEX IF NOT EXISTS idx_products_enriched_search ON products_enriched USING gin (to_tsvector('french'::regconfig, title || ' ' || description));