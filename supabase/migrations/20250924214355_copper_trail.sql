/*
  # Add retailer_id to products_enriched table

  1. Schema Changes
    - Add `retailer_id` column to `products_enriched` table
    - Set up foreign key relationship with `retailers` table
    - Add index for performance
    - Update RLS policies for retailer isolation

  2. Security
    - Update RLS policies to filter by retailer_id
    - Ensure retailers can only see their own enriched products

  3. Data Migration
    - Set default retailer_id for existing products
    - Ensure data consistency
*/

-- Add retailer_id column to products_enriched table
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'products_enriched' AND column_name = 'retailer_id'
  ) THEN
    ALTER TABLE products_enriched ADD COLUMN retailer_id uuid;
    
    -- Set a default retailer_id for existing products (demo retailer)
    UPDATE products_enriched 
    SET retailer_id = '00000000-0000-0000-0000-000000000000'::uuid 
    WHERE retailer_id IS NULL;
    
    -- Make the column NOT NULL after setting defaults
    ALTER TABLE products_enriched ALTER COLUMN retailer_id SET NOT NULL;
    
    -- Add foreign key constraint
    ALTER TABLE products_enriched 
    ADD CONSTRAINT products_enriched_retailer_id_fkey 
    FOREIGN KEY (retailer_id) REFERENCES retailers(id) ON DELETE CASCADE;
    
    -- Add index for performance
    CREATE INDEX IF NOT EXISTS idx_products_enriched_retailer_id 
    ON products_enriched(retailer_id);
    
    -- Add composite index for retailer + handle
    CREATE INDEX IF NOT EXISTS idx_products_enriched_retailer_handle 
    ON products_enriched(retailer_id, handle);
    
    RAISE NOTICE 'retailer_id column added to products_enriched table';
  ELSE
    RAISE NOTICE 'retailer_id column already exists in products_enriched table';
  END IF;
END $$;

-- Update RLS policies for retailer isolation
DROP POLICY IF EXISTS "Authenticated users can manage products" ON products_enriched;
DROP POLICY IF EXISTS "Public can read active products" ON products_enriched;

-- New RLS policies with retailer isolation
CREATE POLICY "Retailers can manage own enriched products"
  ON products_enriched
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM retailers 
      WHERE retailers.id = products_enriched.retailer_id 
      AND auth.uid()::text = retailers.id::text
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM retailers 
      WHERE retailers.id = products_enriched.retailer_id 
      AND auth.uid()::text = retailers.id::text
    )
  );

CREATE POLICY "Public can read active enriched products"
  ON products_enriched
  FOR SELECT
  TO anon, authenticated
  USING (stock_qty > 0);

-- Super admin access to all enriched products
CREATE POLICY "Super admins can manage all enriched products"
  ON products_enriched
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM user_roles 
      WHERE user_roles.user_id = auth.uid() 
      AND user_roles.role = 'super_admin'
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM user_roles 
      WHERE user_roles.user_id = auth.uid() 
      AND user_roles.role = 'super_admin'
    )
  );

-- Service role access for Edge Functions
CREATE POLICY "Service role can manage enriched products"
  ON products_enriched
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);