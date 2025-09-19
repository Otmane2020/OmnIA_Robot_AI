/*
  # Fix UUID Functions in Database

  1. Enable UUID Extension
    - Enable uuid-ossp extension for UUID generation
    
  2. Fix RLS Policies
    - Replace uid() with auth.uid() for user authentication
    - Use gen_random_uuid() for auto-generated UUIDs
    
  3. Update All Tables
    - Fix all RLS policies with correct auth functions
    - Ensure proper UUID generation
*/

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Fix retailers table RLS policies
DROP POLICY IF EXISTS "Retailers can read own data" ON retailers;
DROP POLICY IF EXISTS "Retailers can update own data" ON retailers;
DROP POLICY IF EXISTS "Super admin full access retailers" ON retailers;

CREATE POLICY "Retailers can read own data"
  ON retailers
  FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Retailers can update own data"
  ON retailers
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Super admin full access retailers"
  ON retailers
  FOR ALL
  TO authenticated
  USING ((auth.jwt() ->> 'role'::text) = 'super_admin'::text);

-- Fix retailer_products table RLS policies
DROP POLICY IF EXISTS "Retailers can manage own products" ON retailer_products;

CREATE POLICY "Retailers can manage own products"
  ON retailer_products
  FOR ALL
  TO authenticated
  USING (auth.uid() = retailer_id);

-- Fix retailer_conversations table RLS policies
DROP POLICY IF EXISTS "Retailers can read own conversations" ON retailer_conversations;

CREATE POLICY "Retailers can read own conversations"
  ON retailer_conversations
  FOR SELECT
  TO authenticated
  USING (auth.uid() = retailer_id);

-- Fix retailer_analytics table RLS policies
DROP POLICY IF EXISTS "Retailers can read own analytics" ON retailer_analytics;

CREATE POLICY "Retailers can read own analytics"
  ON retailer_analytics
  FOR ALL
  TO authenticated
  USING (auth.uid() = retailer_id);

-- Fix retailer_subdomains table RLS policies
DROP POLICY IF EXISTS "Retailers can read own subdomains" ON retailer_subdomains;

CREATE POLICY "Retailers can read own subdomains"
  ON retailer_subdomains
  FOR SELECT
  TO authenticated
  USING (auth.uid() = retailer_id);

-- Fix shopify_products table RLS policies
DROP POLICY IF EXISTS "Retailers can manage own Shopify products" ON shopify_products;
DROP POLICY IF EXISTS "Super admin full access shopify products" ON shopify_products;

CREATE POLICY "Retailers can manage own Shopify products"
  ON shopify_products
  FOR ALL
  TO authenticated
  USING (auth.uid() = retailer_id);

CREATE POLICY "Super admin full access shopify products"
  ON shopify_products
  FOR ALL
  TO authenticated
  USING ((auth.jwt() ->> 'role'::text) = 'super_admin'::text);

-- Fix ai_products table RLS policies
DROP POLICY IF EXISTS "Authenticated users manage own store products" ON ai_products;

CREATE POLICY "Authenticated users manage own store products"
  ON ai_products
  FOR ALL
  TO authenticated
  USING ((store_id IS NULL) OR (auth.uid() = store_id));

-- Fix vendors table RLS policies
DROP POLICY IF EXISTS "Vendors can read own data" ON vendors;
DROP POLICY IF EXISTS "Vendors can update own data" ON vendors;

CREATE POLICY "Vendors can read own data"
  ON vendors
  FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Vendors can update own data"
  ON vendors
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = id);

-- Fix products table RLS policies
DROP POLICY IF EXISTS "Vendors can manage own products" ON products;

CREATE POLICY "Vendors can manage own products"
  ON products
  FOR ALL
  TO authenticated
  USING (auth.uid() = vendor_id);

-- Fix variants table RLS policies
DROP POLICY IF EXISTS "Variants follow product access" ON variants;

CREATE POLICY "Variants follow product access"
  ON variants
  FOR ALL
  TO authenticated
  USING (EXISTS (
    SELECT 1
    FROM products
    WHERE (products.id = variants.product_id) 
    AND (auth.uid() = products.vendor_id)
  ));

-- Fix product_images table RLS policies
DROP POLICY IF EXISTS "Images follow product access" ON product_images;

CREATE POLICY "Images follow product access"
  ON product_images
  FOR ALL
  TO authenticated
  USING (EXISTS (
    SELECT 1
    FROM products
    WHERE (products.id = product_images.product_id) 
    AND (auth.uid() = products.vendor_id)
  ));

-- Fix attributes table RLS policies
DROP POLICY IF EXISTS "Attributes follow vendor access" ON attributes;

CREATE POLICY "Attributes follow vendor access"
  ON attributes
  FOR ALL
  TO authenticated
  USING (auth.uid() = vendor_id);

-- Fix attribute_values table RLS policies
DROP POLICY IF EXISTS "Attribute values follow attribute access" ON attribute_values;

CREATE POLICY "Attribute values follow attribute access"
  ON attribute_values
  FOR ALL
  TO authenticated
  USING (EXISTS (
    SELECT 1
    FROM attributes
    WHERE (attributes.id = attribute_values.attribute_id) 
    AND (auth.uid() = attributes.vendor_id)
  ));

-- Fix product_attribute_values table RLS policies
DROP POLICY IF EXISTS "Product attributes follow product access" ON product_attribute_values;

CREATE POLICY "Product attributes follow product access"
  ON product_attribute_values
  FOR ALL
  TO authenticated
  USING (EXISTS (
    SELECT 1
    FROM products
    WHERE (products.id = product_attribute_values.product_id) 
    AND (auth.uid() = products.vendor_id)
  ));

-- Fix variant_attribute_values table RLS policies
DROP POLICY IF EXISTS "Variant attributes follow variant access" ON variant_attribute_values;

CREATE POLICY "Variant attributes follow variant access"
  ON variant_attribute_values
  FOR ALL
  TO authenticated
  USING (EXISTS (
    SELECT 1
    FROM variants
    JOIN products ON (products.id = variants.product_id)
    WHERE (variants.id = variant_attribute_values.variant_id) 
    AND (auth.uid() = products.vendor_id)
  ));

-- Fix csv_field_mappings table RLS policies
DROP POLICY IF EXISTS "retailer_csv_mappings" ON csv_field_mappings;

CREATE POLICY "retailer_csv_mappings"
  ON csv_field_mappings
  FOR ALL
  TO authenticated
  USING (auth.uid() = retailer_id);

-- Fix imported_products table RLS policies
DROP POLICY IF EXISTS "Users can manage their own imported products" ON imported_products;

CREATE POLICY "Users can manage their own imported products"
  ON imported_products
  FOR ALL
  TO authenticated
  USING (retailer_id = (auth.uid())::text);