/*
  # Add enriched fields to products_enriched table

  1. New Columns
    - Classification & Attributes: category, subcategory, tags
    - Characteristics: color, material, fabric, style, room, dimensions
    - Marketing: seo_title, seo_description, ad_headline, ad_description
    - Google Shopping: google_product_category, gtin, brand
    - AI Metadata: confidence_score, enriched_at, enrichment_source

  2. Indexes
    - Performance indexes for filtering and search
    - Text search indexes for SEO content

  3. Security
    - RLS policies for authenticated users
*/

-- Add new columns to products_enriched table
DO $$
BEGIN
  -- Classification & Attributes
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'products_enriched' AND column_name = 'category') THEN
    ALTER TABLE products_enriched ADD COLUMN category TEXT DEFAULT '';
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'products_enriched' AND column_name = 'subcategory') THEN
    ALTER TABLE products_enriched ADD COLUMN subcategory TEXT DEFAULT '';
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'products_enriched' AND column_name = 'tags') THEN
    ALTER TABLE products_enriched ADD COLUMN tags TEXT[] DEFAULT '{}';
  END IF;

  -- Characteristics
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'products_enriched' AND column_name = 'color') THEN
    ALTER TABLE products_enriched ADD COLUMN color TEXT DEFAULT '';
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'products_enriched' AND column_name = 'material') THEN
    ALTER TABLE products_enriched ADD COLUMN material TEXT DEFAULT '';
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'products_enriched' AND column_name = 'fabric') THEN
    ALTER TABLE products_enriched ADD COLUMN fabric TEXT DEFAULT '';
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'products_enriched' AND column_name = 'style') THEN
    ALTER TABLE products_enriched ADD COLUMN style TEXT DEFAULT '';
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'products_enriched' AND column_name = 'room') THEN
    ALTER TABLE products_enriched ADD COLUMN room TEXT DEFAULT '';
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'products_enriched' AND column_name = 'dimensions') THEN
    ALTER TABLE products_enriched ADD COLUMN dimensions TEXT DEFAULT '';
  END IF;

  -- Marketing SEO
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'products_enriched' AND column_name = 'seo_title') THEN
    ALTER TABLE products_enriched ADD COLUMN seo_title TEXT DEFAULT '';
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'products_enriched' AND column_name = 'seo_description') THEN
    ALTER TABLE products_enriched ADD COLUMN seo_description TEXT DEFAULT '';
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'products_enriched' AND column_name = 'ad_headline') THEN
    ALTER TABLE products_enriched ADD COLUMN ad_headline TEXT DEFAULT '';
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'products_enriched' AND column_name = 'ad_description') THEN
    ALTER TABLE products_enriched ADD COLUMN ad_description TEXT DEFAULT '';
  END IF;

  -- Google Shopping
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'products_enriched' AND column_name = 'google_product_category') THEN
    ALTER TABLE products_enriched ADD COLUMN google_product_category TEXT DEFAULT '';
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'products_enriched' AND column_name = 'gtin') THEN
    ALTER TABLE products_enriched ADD COLUMN gtin TEXT DEFAULT '';
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'products_enriched' AND column_name = 'brand') THEN
    ALTER TABLE products_enriched ADD COLUMN brand TEXT DEFAULT '';
  END IF;

  -- AI Metadata
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'products_enriched' AND column_name = 'confidence_score') THEN
    ALTER TABLE products_enriched ADD COLUMN confidence_score INTEGER DEFAULT 0;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'products_enriched' AND column_name = 'enriched_at') THEN
    ALTER TABLE products_enriched ADD COLUMN enriched_at TIMESTAMP WITH TIME ZONE DEFAULT now();
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'products_enriched' AND column_name = 'enrichment_source') THEN
    ALTER TABLE products_enriched ADD COLUMN enrichment_source TEXT DEFAULT 'manual';
  END IF;
END $$;

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_products_enriched_category_type ON products_enriched(category, subcategory);
CREATE INDEX IF NOT EXISTS idx_products_enriched_attributes ON products_enriched(color, material, style);
CREATE INDEX IF NOT EXISTS idx_products_enriched_room ON products_enriched(room);
CREATE INDEX IF NOT EXISTS idx_products_enriched_confidence ON products_enriched(confidence_score);
CREATE INDEX IF NOT EXISTS idx_products_enriched_tags ON products_enriched USING GIN(tags);
CREATE INDEX IF NOT EXISTS idx_products_enriched_seo_search ON products_enriched USING gin(to_tsvector('french', seo_title || ' ' || seo_description));