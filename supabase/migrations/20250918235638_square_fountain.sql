/*
  # Add stock_quantity field to products_enriched table

  1. New Fields
    - `stock_quantity` (integer, default 0) - Additional stock field for compatibility

  2. Purpose
    - Ensure compatibility with CSV imports that use "Stock Quantity" field
    - Maintain existing stock_qty field for backward compatibility
    - Allow both stock fields to coexist
*/

-- Add stock_quantity field to products_enriched table if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'products_enriched' AND column_name = 'stock_quantity'
  ) THEN
    ALTER TABLE products_enriched ADD COLUMN stock_quantity integer DEFAULT 0;
  END IF;
END $$;

-- Update the sync trigger to handle both stock fields
CREATE OR REPLACE FUNCTION sync_to_products_enriched()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO products_enriched (
    handle,
    title,
    description,
    short_description,
    vendor,
    brand,
    category,
    subcategory,
    tags,
    material,
    color,
    fabric,
    style,
    room,
    dimensions,
    weight,
    capacity,
    price,
    compare_at_price,
    currency,
    stock_qty,
    stock_quantity,
    availability,
    seo_title,
    seo_description,
    google_category,
    pmax_score,
    image_url,
    image_alt,
    gallery_urls,
    intent_tags,
    matching_score,
    chat_history_ref,
    confidence_score,
    enriched_at,
    enrichment_source
  ) VALUES (
    COALESCE(NEW.external_id, NEW.name),
    NEW.name,
    NEW.description,
    LEFT(NEW.description, 160),
    NEW.vendor,
    NEW.vendor,
    NEW.category,
    '',
    ARRAY[]::text[],
    '',
    '',
    '',
    '',
    '',
    '',
    '',
    '',
    NEW.price,
    NEW.compare_at_price,
    'EUR',
    NEW.stock,
    COALESCE(NEW.stock_quantity, NEW.stock, 0),
    CASE WHEN COALESCE(NEW.stock_quantity, NEW.stock, 0) > 0 THEN 'in stock' ELSE 'out of stock' END,
    NEW.name,
    LEFT(NEW.description, 155),
    '',
    0,
    NEW.image_url,
    NEW.name,
    ARRAY[]::text[],
    ARRAY[]::text[],
    0,
    '',
    0,
    now(),
    'auto_import'
  )
  ON CONFLICT (handle) DO UPDATE SET
    title = EXCLUDED.title,
    description = EXCLUDED.description,
    short_description = EXCLUDED.short_description,
    vendor = EXCLUDED.vendor,
    brand = EXCLUDED.brand,
    category = EXCLUDED.category,
    price = EXCLUDED.price,
    compare_at_price = EXCLUDED.compare_at_price,
    stock_qty = EXCLUDED.stock_qty,
    stock_quantity = EXCLUDED.stock_quantity,
    availability = EXCLUDED.availability,
    image_url = EXCLUDED.image_url,
    updated_at = now();

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;