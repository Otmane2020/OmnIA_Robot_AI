/*
  # Fix retailer_id type mismatch in imported_products table

  1. Changes
    - Change `retailer_id` column type from UUID to TEXT in `imported_products` table
    - This resolves the COALESCE type mismatch error when saving products
    - Allows the application to use string values like 'demo-retailer-id' or email addresses

  2. Security
    - Maintains existing RLS policies
    - No changes to access control
*/

-- Change retailer_id column type from UUID to TEXT
ALTER TABLE imported_products 
ALTER COLUMN retailer_id TYPE TEXT;