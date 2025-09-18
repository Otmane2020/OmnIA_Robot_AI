/*
  # Add extracted_attributes column to imported_products

  1. Changes
    - Add `extracted_attributes` column (jsonb) to `imported_products` table
    - Set default value to empty JSON object
    - Add index for better query performance

  2. Security
    - No RLS changes needed as table already has proper policies
*/

-- Add the missing extracted_attributes column
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'imported_products' AND column_name = 'extracted_attributes'
  ) THEN
    ALTER TABLE imported_products ADD COLUMN extracted_attributes jsonb DEFAULT '{}'::jsonb;
  END IF;
END $$;

-- Add index for better performance on extracted_attributes queries
CREATE INDEX IF NOT EXISTS idx_imported_products_extracted_attributes 
ON imported_products USING gin (extracted_attributes);