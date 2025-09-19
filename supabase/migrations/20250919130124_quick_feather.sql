/*
  # Add product dimensions to products_enriched table

  1. New Columns
    - `product_length` (numeric) - Longueur du produit en cm
    - `product_width` (numeric) - Largeur du produit en cm  
    - `product_height` (numeric) - Hauteur du produit en cm
    - `product_depth` (numeric) - Profondeur du produit en cm
    - `product_diameter` (numeric) - Diamètre pour produits ronds en cm
    - `dimension_unit` (text) - Unité de mesure (cm par défaut)

  2. Updates
    - Mise à jour des produits existants avec dimensions extraites
    - Index pour recherche par dimensions

  3. Security
    - Maintien des politiques RLS existantes
*/

-- Ajouter les colonnes de dimensions
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'products_enriched' AND column_name = 'product_length'
  ) THEN
    ALTER TABLE products_enriched ADD COLUMN product_length numeric(8,2);
  END IF;
  
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'products_enriched' AND column_name = 'product_width'
  ) THEN
    ALTER TABLE products_enriched ADD COLUMN product_width numeric(8,2);
  END IF;
  
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'products_enriched' AND column_name = 'product_height'
  ) THEN
    ALTER TABLE products_enriched ADD COLUMN product_height numeric(8,2);
  END IF;
  
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'products_enriched' AND column_name = 'product_depth'
  ) THEN
    ALTER TABLE products_enriched ADD COLUMN product_depth numeric(8,2);
  END IF;
  
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'products_enriched' AND column_name = 'product_diameter'
  ) THEN
    ALTER TABLE products_enriched ADD COLUMN product_diameter numeric(8,2);
  END IF;
  
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'products_enriched' AND column_name = 'dimension_unit'
  ) THEN
    ALTER TABLE products_enriched ADD COLUMN dimension_unit text DEFAULT 'cm';
  END IF;
END $$;

-- Créer index pour recherche par dimensions
CREATE INDEX IF NOT EXISTS idx_products_enriched_dimensions 
ON products_enriched (product_length, product_width, product_height);

-- Mettre à jour les produits existants avec dimensions extraites de la description
UPDATE products_enriched 
SET 
  product_length = CASE 
    WHEN title LIKE '%ALYANA%' THEN 240.0
    WHEN title LIKE '%AUREA%' AND title LIKE '%100%' THEN 100.0
    WHEN title LIKE '%AUREA%' AND title LIKE '%120%' THEN 120.0
    WHEN title LIKE '%INAYA%' THEN 45.0
    ELSE NULL
  END,
  product_width = CASE 
    WHEN title LIKE '%ALYANA%' THEN 160.0
    WHEN title LIKE '%AUREA%' AND title LIKE '%100%' THEN 100.0
    WHEN title LIKE '%AUREA%' AND title LIKE '%120%' THEN 120.0
    WHEN title LIKE '%INAYA%' THEN 55.0
    ELSE NULL
  END,
  product_height = CASE 
    WHEN title LIKE '%ALYANA%' THEN 75.0
    WHEN title LIKE '%AUREA%' THEN 75.0
    WHEN title LIKE '%INAYA%' THEN 85.0
    ELSE NULL
  END,
  product_diameter = CASE 
    WHEN title LIKE '%AUREA%' AND title LIKE '%100%' THEN 100.0
    WHEN title LIKE '%AUREA%' AND title LIKE '%120%' THEN 120.0
    ELSE NULL
  END,
  dimension_unit = 'cm'
WHERE product_length IS NULL;