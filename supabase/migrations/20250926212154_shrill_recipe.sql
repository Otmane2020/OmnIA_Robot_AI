/*
  # Fix duplicate RLS policy error

  1. Security Policies
    - Drop existing policies if they exist before creating new ones
    - Add policies for retailers to manage their own products
    - Add policies for admins to view all products
*/

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Retailers can manage own products" ON retailer_products;
DROP POLICY IF EXISTS "admins_view_products" ON retailer_products;
DROP POLICY IF EXISTS "public_view_products" ON retailer_products;
DROP POLICY IF EXISTS "retailers_manage_products" ON retailer_products;
DROP POLICY IF EXISTS "service_manage_products" ON retailer_products;

-- Create policies for retailer_products
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