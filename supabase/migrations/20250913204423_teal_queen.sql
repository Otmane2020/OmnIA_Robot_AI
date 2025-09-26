/*
  # Create imported_products table

  1. New Tables
    - `imported_products`
      - `external_id` (text, not null) - ID externe du produit
      - `retailer_id` (text, not null) - ID du revendeur
      - `name` (text) - Nom du produit
      - `description` (text) - Description du produit
      - `price` (numeric) - Prix du produit
      - `compare_at_price` (numeric) - Prix de comparaison
      - `category` (text) - Catégorie du produit
      - `vendor` (text) - Vendeur/marque
      - `image_url` (text) - URL de l'image
      - `product_url` (text) - URL du produit
      - `stock` (integer) - Stock disponible
      - `source_platform` (text) - Plateforme source (shopify, csv, xml)
      - `status` (text) - Statut du produit
      - `shopify_data` (jsonb) - Données Shopify brutes
      - `created_at` (timestamptz) - Date de création
      - `updated_at` (timestamptz) - Date de mise à jour

  2. Security
    - Enable RLS on `imported_products` table
    - Add policies for authenticated users to manage their own products
*/

CREATE TABLE IF NOT EXISTS public.imported_products (
    external_id TEXT NOT NULL,
    retailer_id TEXT NOT NULL,
    name TEXT,
    description TEXT,
    price NUMERIC(10,2),
    compare_at_price NUMERIC(10,2),
    category TEXT,
    vendor TEXT,
    image_url TEXT,
    product_url TEXT,
    stock INTEGER DEFAULT 0,
    source_platform TEXT NOT NULL,
    status TEXT DEFAULT 'active',
    shopify_data JSONB,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    PRIMARY KEY (retailer_id, external_id, source_platform)
);

ALTER TABLE public.imported_products ENABLE ROW LEVEL SECURITY;

-- Create policies for imported_products
CREATE POLICY "Users can manage their own imported products"
    ON public.imported_products
    FOR ALL
    TO authenticated
    USING (retailer_id = auth.uid()::text)
    WITH CHECK (retailer_id = auth.uid()::text);

-- Allow anonymous users to read products for demo purposes
CREATE POLICY "Anonymous can read imported products"
    ON public.imported_products
    FOR SELECT
    TO anon
    USING (true);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_imported_products_retailer_id ON public.imported_products(retailer_id);
CREATE INDEX IF NOT EXISTS idx_imported_products_source ON public.imported_products(source_platform);
CREATE INDEX IF NOT EXISTS idx_imported_products_status ON public.imported_products(status);
CREATE INDEX IF NOT EXISTS idx_imported_products_created_at ON public.imported_products(created_at DESC);