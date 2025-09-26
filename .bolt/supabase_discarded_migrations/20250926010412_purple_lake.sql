/*
  # Fix UUID = text operator errors comprehensively

  This migration fixes all instances where UUID columns are compared with text values
  by adding explicit type casting (::text) to ensure proper type matching.

  ## Changes Made

  1. **RLS Policies**
     - Updated all policies using auth.uid() comparisons
     - Added explicit ::text casting for UUID columns
     - Fixed foreign key comparisons

  2. **Functions**
     - Updated get_user_role function
     - Fixed all UUID comparison functions
     - Added proper type casting

  3. **Tables Affected**
     - All tables with UUID foreign keys and RLS policies
     - Functions using auth.uid() comparisons

  ## Security
     - All RLS policies maintain the same security level
     - No changes to access control logic
     - Only type casting additions for compatibility
*/

-- Drop and recreate get_user_role function with proper type casting
DROP FUNCTION IF EXISTS get_user_role(uuid);

CREATE OR REPLACE FUNCTION get_user_role(user_uuid uuid)
RETURNS text AS $$
BEGIN
  RETURN (
    SELECT role::text
    FROM user_roles 
    WHERE user_id = user_uuid
    LIMIT 1
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Update RLS policies for retailers table
DROP POLICY IF EXISTS "Retailers can manage own data" ON retailers;
CREATE POLICY "Retailers can manage own data"
  ON retailers
  FOR ALL
  TO authenticated
  USING ((auth.uid())::text = id::text);

DROP POLICY IF EXISTS "Role-based admin access retailers" ON retailers;
CREATE POLICY "Role-based admin access retailers"
  ON retailers
  FOR ALL
  TO public
  USING (get_user_role(auth.uid()) = 'super_admin');

-- Update RLS policies for user_roles table
DROP POLICY IF EXISTS "Super admins can manage all roles" ON user_roles;
CREATE POLICY "Super admins can manage all roles"
  ON user_roles
  FOR ALL
  TO public
  USING (get_user_role(auth.uid()) = 'super_admin');

DROP POLICY IF EXISTS "Users can view their own roles" ON user_roles;
CREATE POLICY "Users can view their own roles"
  ON user_roles
  FOR SELECT
  TO public
  USING ((auth.uid())::text = user_id::text);

-- Update RLS policies for retailer_conversations table
DROP POLICY IF EXISTS "Retailers can read own conversations" ON retailer_conversations;
CREATE POLICY "Retailers can read own conversations"
  ON retailer_conversations
  FOR SELECT
  TO authenticated
  USING ((auth.uid())::text = retailer_id::text);

DROP POLICY IF EXISTS "retailers_view_conversations" ON retailer_conversations;
CREATE POLICY "retailers_view_conversations"
  ON retailer_conversations
  FOR SELECT
  TO public
  USING ((auth.uid())::text = retailer_id::text);

-- Update RLS policies for seller_conversations table
DROP POLICY IF EXISTS "Sellers can read own conversations" ON seller_conversations;
CREATE POLICY "Sellers can read own conversations"
  ON seller_conversations
  FOR SELECT
  TO authenticated
  USING (seller_id::text = (auth.uid())::text);

-- Update RLS policies for seller_products table
DROP POLICY IF EXISTS "Sellers can manage own products" ON seller_products;
CREATE POLICY "Sellers can manage own products"
  ON seller_products
  FOR ALL
  TO authenticated
  USING (seller_id::text = (auth.uid())::text);

-- Update RLS policies for products_enriched table
DROP POLICY IF EXISTS "Retailers can manage own enriched products" ON products_enriched;
CREATE POLICY "Retailers can manage own enriched products"
  ON products_enriched
  FOR ALL
  TO authenticated
  USING (EXISTS (
    SELECT 1
    FROM retailers
    WHERE retailers.id::text = products_enriched.retailer_id::text 
    AND (auth.uid())::text = retailers.id::text
  ));

DROP POLICY IF EXISTS "Super admins can manage all enriched products" ON products_enriched;
CREATE POLICY "Super admins can manage all enriched products"
  ON products_enriched
  FOR ALL
  TO authenticated
  USING (EXISTS (
    SELECT 1
    FROM user_roles
    WHERE user_roles.user_id = auth.uid() 
    AND user_roles.role = 'super_admin'::user_role
  ));

-- Update RLS policies for retailer_products table
DROP POLICY IF EXISTS "Retailers can manage own products" ON retailer_products;
CREATE POLICY "Retailers can manage own products"
  ON retailer_products
  FOR ALL
  TO authenticated
  USING ((auth.uid())::text = retailer_id::text);

DROP POLICY IF EXISTS "retailers_manage_products" ON retailer_products;
CREATE POLICY "retailers_manage_products"
  ON retailer_products
  FOR ALL
  TO public
  USING ((auth.uid())::text = retailer_id::text);

-- Update RLS policies for shopify_products table
DROP POLICY IF EXISTS "Retailers can manage own Shopify products" ON shopify_products;
CREATE POLICY "Retailers can manage own Shopify products"
  ON shopify_products
  FOR ALL
  TO authenticated
  USING ((auth.uid())::text = retailer_id::text);

-- Update RLS policies for imported_products table
DROP POLICY IF EXISTS "Retailers can manage own imported products" ON imported_products;
CREATE POLICY "Retailers can manage own imported products"
  ON imported_products
  FOR ALL
  TO authenticated
  USING (retailer_id::text = (auth.uid())::text);

-- Update RLS policies for retailer_analytics table
DROP POLICY IF EXISTS "Retailers can read own analytics" ON retailer_analytics;
CREATE POLICY "Retailers can read own analytics"
  ON retailer_analytics
  FOR ALL
  TO authenticated
  USING ((auth.uid())::text = retailer_id::text);

-- Update RLS policies for seller_analytics table
DROP POLICY IF EXISTS "Sellers can read own analytics" ON seller_analytics;
CREATE POLICY "Sellers can read own analytics"
  ON seller_analytics
  FOR ALL
  TO authenticated
  USING (seller_id::text = (auth.uid())::text);

-- Update RLS policies for seller_settings table
DROP POLICY IF EXISTS "Sellers can manage own settings" ON seller_settings;
CREATE POLICY "Sellers can manage own settings"
  ON seller_settings
  FOR ALL
  TO authenticated
  USING (seller_id::text = (auth.uid())::text);

-- Update RLS policies for retailer_subdomains table
DROP POLICY IF EXISTS "Retailers can read own subdomains" ON retailer_subdomains;
CREATE POLICY "Retailers can read own subdomains"
  ON retailer_subdomains
  FOR SELECT
  TO authenticated
  USING ((auth.uid())::text = retailer_id::text);

-- Update RLS policies for csv_field_mappings table
DROP POLICY IF EXISTS "retailer_csv_mappings" ON csv_field_mappings;
CREATE POLICY "retailer_csv_mappings"
  ON csv_field_mappings
  FOR ALL
  TO authenticated
  USING ((auth.uid())::text = retailer_id::text);

-- Update RLS policies for ai_products table
DROP POLICY IF EXISTS "Authenticated users manage own store products" ON ai_products;
CREATE POLICY "Authenticated users manage own store products"
  ON ai_products
  FOR ALL
  TO authenticated
  USING ((store_id IS NULL) OR ((auth.uid())::text = store_id::text));

-- Update RLS policies for variants table
DROP POLICY IF EXISTS "Variants follow product access" ON variants;
CREATE POLICY "Variants follow product access"
  ON variants
  FOR ALL
  TO authenticated
  USING (EXISTS (
    SELECT 1
    FROM products
    WHERE products.id = variants.product_id 
    AND (auth.uid())::text = products.vendor_id::text
  ));

-- Update RLS policies for products table
DROP POLICY IF EXISTS "Vendors can manage own products" ON products;
CREATE POLICY "Vendors can manage own products"
  ON products
  FOR ALL
  TO authenticated
  USING ((auth.uid())::text = vendor_id::text);

-- Update RLS policies for product_images table
DROP POLICY IF EXISTS "Images follow product access" ON product_images;
CREATE POLICY "Images follow product access"
  ON product_images
  FOR ALL
  TO authenticated
  USING (EXISTS (
    SELECT 1
    FROM products
    WHERE products.id = product_images.product_id 
    AND (auth.uid())::text = products.vendor_id::text
  ));

-- Update RLS policies for attributes table
DROP POLICY IF EXISTS "Attributes follow vendor access" ON attributes;
CREATE POLICY "Attributes follow vendor access"
  ON attributes
  FOR ALL
  TO authenticated
  USING ((auth.uid())::text = vendor_id::text);

-- Update RLS policies for attribute_values table
DROP POLICY IF EXISTS "Attribute values follow attribute access" ON attribute_values;
CREATE POLICY "Attribute values follow attribute access"
  ON attribute_values
  FOR ALL
  TO authenticated
  USING (EXISTS (
    SELECT 1
    FROM attributes
    WHERE attributes.id = attribute_values.attribute_id 
    AND (auth.uid())::text = attributes.vendor_id::text
  ));

-- Update RLS policies for product_attribute_values table
DROP POLICY IF EXISTS "Product attributes follow product access" ON product_attribute_values;
CREATE POLICY "Product attributes follow product access"
  ON product_attribute_values
  FOR ALL
  TO authenticated
  USING (EXISTS (
    SELECT 1
    FROM products
    WHERE products.id = product_attribute_values.product_id 
    AND (auth.uid())::text = products.vendor_id::text
  ));

-- Update RLS policies for variant_attribute_values table
DROP POLICY IF EXISTS "Variant attributes follow variant access" ON variant_attribute_values;
CREATE POLICY "Variant attributes follow variant access"
  ON variant_attribute_values
  FOR ALL
  TO authenticated
  USING (EXISTS (
    SELECT 1
    FROM variants
    JOIN products ON products.id = variants.product_id
    WHERE variants.id = variant_attribute_values.variant_id 
    AND (auth.uid())::text = products.vendor_id::text
  ));

-- Update RLS policies for vendors table
DROP POLICY IF EXISTS "Vendors can read own data" ON vendors;
CREATE POLICY "Vendors can read own data"
  ON vendors
  FOR SELECT
  TO authenticated
  USING ((auth.uid())::text = id::text);

DROP POLICY IF EXISTS "Vendors can update own data" ON vendors;
CREATE POLICY "Vendors can update own data"
  ON vendors
  FOR UPDATE
  TO authenticated
  USING ((auth.uid())::text = id::text);

-- Update RLS policies for sellers table
DROP POLICY IF EXISTS "Sellers can read own data" ON sellers;
CREATE POLICY "Sellers can read own data"
  ON sellers
  FOR SELECT
  TO authenticated
  USING ((auth.uid())::text = id::text);

DROP POLICY IF EXISTS "Sellers can update own data" ON sellers;
CREATE POLICY "Sellers can update own data"
  ON sellers
  FOR UPDATE
  TO authenticated
  USING ((auth.uid())::text = id::text);