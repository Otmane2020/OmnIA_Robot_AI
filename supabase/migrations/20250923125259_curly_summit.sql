/*
  # Add id column to imported_products table

  1. Table Changes
    - Add `id` column as uuid primary key to `imported_products` table
    - Convert existing composite primary key to unique constraint
    
  2. Security
    - Maintain existing RLS policies
    - Preserve data integrity with unique constraint
    
  3. Changes
    - Drop current primary key (retailer_id, external_id, source_platform)
    - Add new id column with uuid default
    - Set id as new primary key
    - Add unique constraint on (retailer_id, external_id, source_platform)
*/

-- Add id column to imported_products table
ALTER TABLE public.imported_products 
ADD COLUMN IF NOT EXISTS id uuid DEFAULT gen_random_uuid() NOT NULL;

-- Drop existing primary key constraint
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.table_constraints 
    WHERE constraint_name = 'imported_products_pkey' 
    AND table_name = 'imported_products'
  ) THEN
    ALTER TABLE public.imported_products DROP CONSTRAINT imported_products_pkey;
  END IF;
END $$;

-- Set id as the new primary key
ALTER TABLE public.imported_products 
ADD CONSTRAINT imported_products_pkey PRIMARY KEY (id);

-- Add unique constraint for the original composite key
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints 
    WHERE constraint_name = 'imported_products_retailer_external_source_unique' 
    AND table_name = 'imported_products'
  ) THEN
    ALTER TABLE public.imported_products 
    ADD CONSTRAINT imported_products_retailer_external_source_unique 
    UNIQUE (retailer_id, external_id, source_platform);
  END IF;
END $$;