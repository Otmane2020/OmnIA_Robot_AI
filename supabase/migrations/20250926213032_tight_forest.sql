/*
  # Fix duplicate RLS policies

  1. Security
    - Drop existing policies safely with IF EXISTS
    - Recreate clean policies for retailer_products table
    - Ensure proper access control for retailers and admins
*/

-- Drop existing policies safely
DROP POLICY IF EXISTS "Retailers can manage own products" ON retailer_products;
DROP POLICY IF EXISTS "admins_view_products" ON retailer_products;
DROP POLICY IF EXISTS "service_manage_products" ON retailer_products;

-- Recreate policies cleanly
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
      WHERE user_id = auth.uid() 
      AND role = 'super_admin'::user_role
    )
  );

CREATE POLICY "service_manage_products"
  ON retailer_products
  FOR ALL
  TO public
  USING (auth.role() = 'service_role')
  WITH CHECK (auth.role() = 'service_role');