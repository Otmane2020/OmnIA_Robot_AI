/*
  # Fix duplicate RLS policy error for retailer_products

  1. Problem
    - Policy "Retailers can manage own products" already exists
    - Need to handle existing policies safely

  2. Solution
    - Use DO blocks to check policy existence before creation
    - Drop and recreate policies safely
    - Ensure proper RLS configuration
*/

-- First, ensure RLS is enabled
ALTER TABLE retailer_products ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist (safe approach)
DO $$
BEGIN
  -- Drop all existing policies for retailer_products
  DROP POLICY IF EXISTS "Retailers can manage own products" ON retailer_products;
  DROP POLICY IF EXISTS "admins_view_products" ON retailer_products;
  DROP POLICY IF EXISTS "service_manage_products" ON retailer_products;
  DROP POLICY IF EXISTS "Retailers can manage own data" ON retailer_products;
  DROP POLICY IF EXISTS "Role-based admin access" ON retailer_products;
  
  EXCEPTION WHEN OTHERS THEN
    -- Ignore errors if policies don't exist
    NULL;
END $$;

-- Create policies with proper conditions
CREATE POLICY "Retailers can manage own products"
  ON retailer_products
  FOR ALL
  TO authenticated
  USING (auth.uid()::text = retailer_id::text)
  WITH CHECK (auth.uid()::text = retailer_id::text);

CREATE POLICY "admins_view_products"
  ON retailer_products
  FOR SELECT
  TO public
  USING (
    EXISTS (
      SELECT 1 FROM user_roles 
      WHERE user_roles.user_id = auth.uid() 
      AND user_roles.role = 'super_admin'::user_role
    )
  );

CREATE POLICY "service_manage_products"
  ON retailer_products
  FOR ALL
  TO public
  USING (auth.role() = 'service_role')
  WITH CHECK (auth.role() = 'service_role');