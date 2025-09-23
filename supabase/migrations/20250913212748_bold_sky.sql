/*
  # Add inventory_management column to imported_products table

  1. Changes
    - Add `inventory_management` column to `imported_products` table
    - Set default value to 'shopify' for existing records
    - Allow NULL values for flexibility

  2. Notes
    - This column stores how inventory is managed (e.g., 'shopify', 'manual', 'third_party')
    - Default value ensures existing records work properly
*/

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'imported_products' AND column_name = 'inventory_management'
  ) THEN
    ALTER TABLE imported_products ADD COLUMN inventory_management text DEFAULT 'shopify';
  END IF;
END $$;