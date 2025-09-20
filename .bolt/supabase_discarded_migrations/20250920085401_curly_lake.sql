/*
  # Add stock_qty column to products_enriched

  1. New Column
    - `stock_qty` (integer, default 0)
  2. Data Migration
    - Copy values from stock_quantity to stock_qty
  3. Performance
    - Add index for stock filtering
    - Add constraint for positive values
*/

-- Add the stock_qty column
ALTER TABLE products_enriched 
ADD COLUMN IF NOT EXISTS stock_qty INTEGER DEFAULT 0;

-- Migrate existing data
UPDATE products_enriched 
SET stock_qty = COALESCE(stock_quantity, 0);

-- Add index for performance
CREATE INDEX IF NOT EXISTS idx_products_enriched_stock_qty 
ON products_enriched (stock_qty);

-- Add constraint to ensure positive stock
ALTER TABLE products_enriched 
ADD CONSTRAINT IF NOT EXISTS products_enriched_stock_qty_positive 
CHECK (stock_qty >= 0);