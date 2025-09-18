/*
  # Add AI enrichment fields to products_enriched table

  1. New Columns
    - Classification: category, subcategory, tags
    - Characteristics: color, material, fabric, style, room, dimensions
    - Marketing: seo_title, seo_description, ad_headline, ad_description
    - Google Shopping: google_product_category, gtin, brand
    - Technical: confidence_score, enriched_at, enrichment_source

  2. Constraints
    - Confidence score validation (0-100)
    - SEO field length limits
    - Ad content length limits

  3. Indexes
    - Performance indexes for search and filtering
    - Full-text search index for content discovery
*/

-- Ajouter les nouveaux champs d'enrichissement IA
DO $$
BEGIN
  -- 🏷️ Classification & Attributs
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'products_enriched' AND column_name = 'category'
  ) THEN
    ALTER TABLE products_enriched ADD COLUMN category TEXT DEFAULT '';
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'products_enriched' AND column_name = 'subcategory'
  ) THEN
    ALTER TABLE products_enriched ADD COLUMN subcategory TEXT DEFAULT '';
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'products_enriched' AND column_name = 'tags'
  ) THEN
    ALTER TABLE products_enriched ADD COLUMN tags TEXT[] DEFAULT '{}';
  END IF;

  -- 🎨 Caractéristiques
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'products_enriched' AND column_name = 'color'
  ) THEN
    ALTER TABLE products_enriched ADD COLUMN color TEXT DEFAULT '';
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'products_enriched' AND column_name = 'material'
  ) THEN
    ALTER TABLE products_enriched ADD COLUMN material TEXT DEFAULT '';
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'products_enriched' AND column_name = 'fabric'
  ) THEN
    ALTER TABLE products_enriched ADD COLUMN fabric TEXT DEFAULT '';
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'products_enriched' AND column_name = 'style'
  ) THEN
    ALTER TABLE products_enriched ADD COLUMN style TEXT DEFAULT '';
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'products_enriched' AND column_name = 'room'
  ) THEN
    ALTER TABLE products_enriched ADD COLUMN room TEXT DEFAULT '';
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'products_enriched' AND column_name = 'dimensions'
  ) THEN
    ALTER TABLE products_enriched ADD COLUMN dimensions TEXT DEFAULT '';
  END IF;

  -- 📈 Marketing (SEO + Ads)
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'products_enriched' AND column_name = 'seo_title'
  ) THEN
    ALTER TABLE products_enriched ADD COLUMN seo_title TEXT DEFAULT '';
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'products_enriched' AND column_name = 'seo_description'
  ) THEN
    ALTER TABLE products_enriched ADD COLUMN seo_description TEXT DEFAULT '';
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'products_enriched' AND column_name = 'ad_headline'
  ) THEN
    ALTER TABLE products_enriched ADD COLUMN ad_headline TEXT DEFAULT '';
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'products_enriched' AND column_name = 'ad_description'
  ) THEN
    ALTER TABLE products_enriched ADD COLUMN ad_description TEXT DEFAULT '';
  END IF;

  -- 🛍️ Google Shopping
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'products_enriched' AND column_name = 'google_product_category'
  ) THEN
    ALTER TABLE products_enriched ADD COLUMN google_product_category TEXT DEFAULT '';
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'products_enriched' AND column_name = 'gtin'
  ) THEN
    ALTER TABLE products_enriched ADD COLUMN gtin TEXT DEFAULT '';
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'products_enriched' AND column_name = 'brand'
  ) THEN
    ALTER TABLE products_enriched ADD COLUMN brand TEXT DEFAULT '';
  END IF;

  -- Champs techniques
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'products_enriched' AND column_name = 'confidence_score'
  ) THEN
    ALTER TABLE products_enriched ADD COLUMN confidence_score INTEGER DEFAULT 0;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'products_enriched' AND column_name = 'enriched_at'
  ) THEN
    ALTER TABLE products_enriched ADD COLUMN enriched_at TIMESTAMP WITH TIME ZONE DEFAULT now();
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'products_enriched' AND column_name = 'enrichment_source'
  ) THEN
    ALTER TABLE products_enriched ADD COLUMN enrichment_source TEXT DEFAULT 'ai';
  END IF;
END $$;

-- Ajouter les contraintes de validation
DO $$
BEGIN
  -- Contrainte pour score de confiance
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints
    WHERE table_name = 'products_enriched' AND constraint_name = 'products_enriched_confidence_check'
  ) THEN
    ALTER TABLE products_enriched ADD CONSTRAINT products_enriched_confidence_check 
    CHECK (confidence_score >= 0 AND confidence_score <= 100);
  END IF;

  -- Contrainte pour longueur SEO title
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints
    WHERE table_name = 'products_enriched' AND constraint_name = 'products_enriched_seo_title_length'
  ) THEN
    ALTER TABLE products_enriched ADD CONSTRAINT products_enriched_seo_title_length 
    CHECK (char_length(seo_title) <= 70);
  END IF;

  -- Contrainte pour longueur SEO description
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints
    WHERE table_name = 'products_enriched' AND constraint_name = 'products_enriched_seo_desc_length'
  ) THEN
    ALTER TABLE products_enriched ADD CONSTRAINT products_enriched_seo_desc_length 
    CHECK (char_length(seo_description) <= 155);
  END IF;

  -- Contrainte pour longueur ad headline
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints
    WHERE table_name = 'products_enriched' AND constraint_name = 'products_enriched_ad_headline_length'
  ) THEN
    ALTER TABLE products_enriched ADD CONSTRAINT products_enriched_ad_headline_length 
    CHECK (char_length(ad_headline) <= 30);
  END IF;

  -- Contrainte pour longueur ad description
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints
    WHERE table_name = 'products_enriched' AND constraint_name = 'products_enriched_ad_desc_length'
  ) THEN
    ALTER TABLE products_enriched ADD CONSTRAINT products_enriched_ad_desc_length 
    CHECK (char_length(ad_description) <= 90);
  END IF;
END $$;

-- Créer les index de performance si ils n'existent pas
CREATE INDEX IF NOT EXISTS idx_products_enriched_category_type 
ON products_enriched (category, subcategory);

CREATE INDEX IF NOT EXISTS idx_products_enriched_attributes 
ON products_enriched (color, material, style);

CREATE INDEX IF NOT EXISTS idx_products_enriched_material 
ON products_enriched (material);

CREATE INDEX IF NOT EXISTS idx_products_enriched_color 
ON products_enriched (color);

CREATE INDEX IF NOT EXISTS idx_products_enriched_style 
ON products_enriched (style);

CREATE INDEX IF NOT EXISTS idx_products_enriched_room 
ON products_enriched (room);

CREATE INDEX IF NOT EXISTS idx_products_enriched_category 
ON products_enriched (category);

CREATE INDEX IF NOT EXISTS idx_products_enriched_type 
ON products_enriched (type);

CREATE INDEX IF NOT EXISTS idx_products_enriched_tags_search 
ON products_enriched USING GIN (tags);

CREATE INDEX IF NOT EXISTS idx_products_enriched_google_category 
ON products_enriched (google_product_category);

CREATE INDEX IF NOT EXISTS idx_products_enriched_brand 
ON products_enriched (brand);

CREATE INDEX IF NOT EXISTS idx_products_enriched_gtin 
ON products_enriched (gtin);

CREATE INDEX IF NOT EXISTS idx_products_enriched_confidence 
ON products_enriched (confidence_score);

CREATE INDEX IF NOT EXISTS idx_products_enriched_enriched_at 
ON products_enriched (enriched_at DESC);

CREATE INDEX IF NOT EXISTS idx_products_enriched_price 
ON products_enriched (price);

CREATE INDEX IF NOT EXISTS idx_products_enriched_stock 
ON products_enriched (stock_qty);

CREATE INDEX IF NOT EXISTS idx_products_enriched_handle 
ON products_enriched (handle);

-- Index de recherche textuelle full-text (séparé pour éviter l'erreur IMMUTABLE)
CREATE INDEX IF NOT EXISTS idx_products_enriched_title_search 
ON products_enriched USING gin(to_tsvector('french', title));

CREATE INDEX IF NOT EXISTS idx_products_enriched_description_search 
ON products_enriched USING gin(to_tsvector('french', description));

CREATE INDEX IF NOT EXISTS idx_products_enriched_seo_search 
ON products_enriched USING gin(to_tsvector('french', seo_title || ' ' || seo_description));

CREATE INDEX IF NOT EXISTS idx_products_enriched_search 
ON products_enriched USING gin(to_tsvector('french', title || ' ' || description));