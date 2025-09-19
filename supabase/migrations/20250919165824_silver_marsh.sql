/*
  # Add stock_qty column to products_enriched

  1. New Columns
    - `stock_qty` (integer, default 0) - Standardized stock field

  2. Data Migration
    - Copy values from stock_quantity to stock_qty
    - Ensure consistency between both fields

  3. Index
    - Add index on stock_qty for performance
*/

-- Add stock_qty column if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'products_enriched' AND column_name = 'stock_qty'
  ) THEN
    ALTER TABLE products_enriched
    ADD COLUMN stock_qty INTEGER DEFAULT 0;
  END IF;
END $$;

-- Update stock_qty with values from stock_quantity
UPDATE products_enriched
SET stock_qty = COALESCE(stock_quantity, 0);

-- Add index for performance
CREATE INDEX IF NOT EXISTS idx_products_enriched_stock_qty 
ON products_enriched (stock_qty);

-- Add constraint to ensure stock_qty is not negative
ALTER TABLE products_enriched 
ADD CONSTRAINT IF NOT EXISTS products_enriched_stock_qty_check 
CHECK (stock_qty >= 0);