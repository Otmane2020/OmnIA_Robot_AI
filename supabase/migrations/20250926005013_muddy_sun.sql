/*
  # Fix UUID = text operator error

  1. Problem
    - SQL queries failing with "operator does not exist: uuid = text"
    - Type mismatch between UUID columns and text values
    - Need explicit type casting for comparisons

  2. Solution
    - Add explicit type casts where needed
    - Update functions that compare UUID with text
    - Ensure consistent UUID handling across all tables

  3. Tables affected
    - All tables with UUID foreign keys
    - Functions using auth.uid() comparisons
    - RLS policies with UUID comparisons
*/

-- Fix RLS policies that compare UUID with text
DROP POLICY IF EXISTS "Retailers can manage own Shopify products" ON shopify_products;
CREATE POLICY "Retailers can manage own Shopify products"
  ON shopify_products
  FOR ALL
  TO authenticated
  USING (auth.uid()::text = retailer_id::text);

DROP POLICY IF EXISTS "Role-based admin access shopify products" ON shopify_products;
CREATE POLICY "Role-based admin access shopify products"
  ON shopify_products
  FOR ALL
  TO public
  USING (get_user_role(auth.uid()) = 'super_admin'::text);

-- Fix retailers table policies
DROP POLICY IF EXISTS "Retailers can manage own data" ON retailers;
CREATE POLICY "Retailers can manage own data"
  ON retailers
  FOR ALL
  TO authenticated
  USING (auth.uid()::text = id::text);

DROP POLICY IF EXISTS "Role-based admin access retailers" ON retailers;
CREATE POLICY "Role-based admin access retailers"
  ON retailers
  FOR ALL
  TO public
  USING (get_user_role(auth.uid()) = 'super_admin'::text);

-- Fix retailer_conversations policies
DROP POLICY IF EXISTS "Retailers can read own conversations" ON retailer_conversations;
CREATE POLICY "Retailers can read own conversations"
  ON retailer_conversations
  FOR SELECT
  TO authenticated
  USING (auth.uid()::text = retailer_id::text);

DROP POLICY IF EXISTS "retailers_view_conversations" ON retailer_conversations;
CREATE POLICY "retailers_view_conversations"
  ON retailer_conversations
  FOR SELECT
  TO public
  USING (auth.uid()::text = retailer_id::text);

-- Fix retailer_analytics policies
DROP POLICY IF EXISTS "Retailers can read own analytics" ON retailer_analytics;
CREATE POLICY "Retailers can read own analytics"
  ON retailer_analytics
  FOR ALL
  TO authenticated
  USING (auth.uid()::text = retailer_id::text);

-- Fix retailer_subdomains policies
DROP POLICY IF EXISTS "Retailers can read own subdomains" ON retailer_subdomains;
CREATE POLICY "Retailers can read own subdomains"
  ON retailer_subdomains
  FOR SELECT
  TO authenticated
  USING (auth.uid()::text = retailer_id::text);

-- Fix products_enriched policies
DROP POLICY IF EXISTS "Retailers can manage own enriched products" ON products_enriched;
CREATE POLICY "Retailers can manage own enriched products"
  ON products_enriched
  FOR ALL
  TO authenticated
  USING (EXISTS ( 
    SELECT 1 FROM retailers 
    WHERE retailers.id::text = products_enriched.retailer_id::text 
    AND auth.uid()::text = retailers.id::text
  ));

-- Fix retailer_products policies
DROP POLICY IF EXISTS "Retailers can manage own products" ON retailer_products;
CREATE POLICY "Retailers can manage own products"
  ON retailer_products
  FOR ALL
  TO authenticated
  USING (auth.uid()::text = retailer_id::text);

DROP POLICY IF EXISTS "retailers_manage_products" ON retailer_products;
CREATE POLICY "retailers_manage_products"
  ON retailer_products
  FOR ALL
  TO public
  USING (auth.uid()::text = retailer_id::text);

-- Fix imported_products policies
DROP POLICY IF EXISTS "Retailers can manage own imported products" ON imported_products;
CREATE POLICY "Retailers can manage own imported products"
  ON imported_products
  FOR ALL
  TO authenticated
  USING (retailer_id::text = auth.uid()::text);

-- Fix csv_field_mappings policies
DROP POLICY IF EXISTS "retailer_csv_mappings" ON csv_field_mappings;
CREATE POLICY "retailer_csv_mappings"
  ON csv_field_mappings
  FOR ALL
  TO authenticated
  USING (auth.uid()::text = retailer_id::text);

-- Fix ai_products policies
DROP POLICY IF EXISTS "Authenticated users manage own store products" ON ai_products;
CREATE POLICY "Authenticated users manage own store products"
  ON ai_products
  FOR ALL
  TO authenticated
  USING ((store_id IS NULL) OR (auth.uid()::text = store_id::text));

-- Fix sellers table policies
DROP POLICY IF EXISTS "Sellers can read own data" ON sellers;
CREATE POLICY "Sellers can read own data"
  ON sellers
  FOR SELECT
  TO authenticated
  USING (auth.uid()::text = id::text);

DROP POLICY IF EXISTS "Sellers can update own data" ON sellers;
CREATE POLICY "Sellers can update own data"
  ON sellers
  FOR UPDATE
  TO authenticated
  USING (auth.uid()::text = id::text);

-- Fix seller_products policies
DROP POLICY IF EXISTS "Sellers can manage own products" ON seller_products;
CREATE POLICY "Sellers can manage own products"
  ON seller_products
  FOR ALL
  TO authenticated
  USING (seller_id::text = auth.uid()::text);

-- Fix seller_conversations policies
DROP POLICY IF EXISTS "Sellers can read own conversations" ON seller_conversations;
CREATE POLICY "Sellers can read own conversations"
  ON seller_conversations
  FOR SELECT
  TO authenticated
  USING (seller_id::text = auth.uid()::text);

-- Fix seller_settings policies
DROP POLICY IF EXISTS "Sellers can manage own settings" ON seller_settings;
CREATE POLICY "Sellers can manage own settings"
  ON seller_settings
  FOR ALL
  TO authenticated
  USING (seller_id::text = auth.uid()::text);

-- Fix seller_analytics policies
DROP POLICY IF EXISTS "Sellers can read own analytics" ON seller_analytics;
CREATE POLICY "Sellers can read own analytics"
  ON seller_analytics
  FOR ALL
  TO authenticated
  USING (seller_id::text = auth.uid()::text);

-- Fix vendors table policies
DROP POLICY IF EXISTS "Vendors can read own data" ON vendors;
CREATE POLICY "Vendors can read own data"
  ON vendors
  FOR SELECT
  TO authenticated
  USING (auth.uid()::text = id::text);

DROP POLICY IF EXISTS "Vendors can update own data" ON vendors;
CREATE POLICY "Vendors can update own data"
  ON vendors
  FOR UPDATE
  TO authenticated
  USING (auth.uid()::text = id::text);

-- Fix products table policies
DROP POLICY IF EXISTS "Vendors can manage own products" ON products;
CREATE POLICY "Vendors can manage own products"
  ON products
  FOR ALL
  TO authenticated
  USING (auth.uid()::text = vendor_id::text);

-- Fix variants table policies
DROP POLICY IF EXISTS "Variants follow product access" ON variants;
CREATE POLICY "Variants follow product access"
  ON variants
  FOR ALL
  TO authenticated
  USING (EXISTS ( 
    SELECT 1 FROM products 
    WHERE products.id = variants.product_id 
    AND auth.uid()::text = products.vendor_id::text
  ));

-- Fix product_images table policies
DROP POLICY IF EXISTS "Images follow product access" ON product_images;
CREATE POLICY "Images follow product access"
  ON product_images
  FOR ALL
  TO authenticated
  USING (EXISTS ( 
    SELECT 1 FROM products 
    WHERE products.id = product_images.product_id 
    AND auth.uid()::text = products.vendor_id::text
  ));

-- Fix attributes table policies
DROP POLICY IF EXISTS "Attributes follow vendor access" ON attributes;
CREATE POLICY "Attributes follow vendor access"
  ON attributes
  FOR ALL
  TO authenticated
  USING (auth.uid()::text = vendor_id::text);

-- Fix attribute_values table policies
DROP POLICY IF EXISTS "Attribute values follow attribute access" ON attribute_values;
CREATE POLICY "Attribute values follow attribute access"
  ON attribute_values
  FOR ALL
  TO authenticated
  USING (EXISTS ( 
    SELECT 1 FROM attributes 
    WHERE attributes.id = attribute_values.attribute_id 
    AND auth.uid()::text = attributes.vendor_id::text
  ));

-- Fix product_attribute_values table policies
DROP POLICY IF EXISTS "Product attributes follow product access" ON product_attribute_values;
CREATE POLICY "Product attributes follow product access"
  ON product_attribute_values
  FOR ALL
  TO authenticated
  USING (EXISTS ( 
    SELECT 1 FROM products 
    WHERE products.id = product_attribute_values.product_id 
    AND auth.uid()::text = products.vendor_id::text
  ));

-- Fix variant_attribute_values table policies
DROP POLICY IF EXISTS "Variant attributes follow variant access" ON variant_attribute_values;
CREATE POLICY "Variant attributes follow variant access"
  ON variant_attribute_values
  FOR ALL
  TO authenticated
  USING (EXISTS ( 
    SELECT 1 FROM variants 
    JOIN products ON products.id = variants.product_id 
    WHERE variants.id = variant_attribute_values.variant_id 
    AND auth.uid()::text = products.vendor_id::text
  ));

-- Fix user_roles table policies
DROP POLICY IF EXISTS "Users can view their own roles" ON user_roles;
CREATE POLICY "Users can view their own roles"
  ON user_roles
  FOR SELECT
  TO public
  USING (auth.uid()::text = user_id::text);

-- Fix security_audit_log table policies
DROP POLICY IF EXISTS "Super admins can read audit logs" ON security_audit_log;
CREATE POLICY "Super admins can read audit logs"
  ON security_audit_log
  FOR SELECT
  TO public
  USING (get_user_role(auth.uid()) = 'super_admin'::text);

-- Fix security_rate_limits table policies
DROP POLICY IF EXISTS "Super admins can manage rate limits" ON security_rate_limits;
CREATE POLICY "Super admins can manage rate limits"
  ON security_rate_limits
  FOR ALL
  TO public
  USING (get_user_role(auth.uid()) = 'super_admin'::text);

-- Fix security_events table policies
DROP POLICY IF EXISTS "Super admins can read security events" ON security_events;
CREATE POLICY "Super admins can read security events"
  ON security_events
  FOR SELECT
  TO public
  USING (get_user_role(auth.uid()) = 'super_admin'::text);

-- Update get_user_role function to handle UUID casting properly
CREATE OR REPLACE FUNCTION get_user_role(user_uuid uuid)
RETURNS text
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN (
    SELECT role::text
    FROM user_roles
    WHERE user_id = user_uuid
    LIMIT 1
  );
END;
$$;