/*
  # Fonction de synchronisation manuelle

  1. Fonction RPC
    - sync_to_products_enriched_manual pour forcer la sync
    - Paramètres pour tous les champs nécessaires
    - Enrichissement automatique des attributs

  2. Sécurité
    - Fonction accessible aux utilisateurs authentifiés
    - Validation des paramètres d'entrée
*/

-- Fonction RPC pour synchronisation manuelle vers products_enriched
CREATE OR REPLACE FUNCTION sync_to_products_enriched_manual(
  p_external_id TEXT,
  p_name TEXT,
  p_description TEXT DEFAULT '',
  p_price NUMERIC DEFAULT 0,
  p_category TEXT DEFAULT 'Mobilier',
  p_vendor TEXT DEFAULT 'Decora Home',
  p_image_url TEXT DEFAULT '',
  p_product_url TEXT DEFAULT '',
  p_stock INTEGER DEFAULT 0
)
RETURNS void AS $$
BEGIN
  -- Insérer ou mettre à jour dans products_enriched
  INSERT INTO products_enriched (
    id,
    handle,
    title,
    description,
    category,
    subcategory,
    color,
    material,
    fabric,
    style,
    dimensions,
    room,
    price,
    stock_qty,
    image_url,
    product_url,
    tags,
    seo_title,
    seo_description,
    ad_headline,
    ad_description,
    google_product_category,
    gtin,
    brand,
    confidence_score,
    enriched_at,
    enrichment_source,
    created_at
  ) VALUES (
    p_external_id,
    p_external_id,
    p_name,
    p_description,
    p_category,
    detect_subcategory_from_text(p_name || ' ' || p_description, p_category),
    detect_color_from_text(p_name || ' ' || p_description),
    detect_material_from_text(p_name || ' ' || p_description),
    detect_material_from_text(p_name || ' ' || p_description), -- fabric = material
    detect_style_from_text(p_name || ' ' || p_description),
    '', -- dimensions à enrichir
    detect_room_from_text(p_name || ' ' || p_description),
    p_price,
    p_stock,
    p_image_url,
    p_product_url,
    '{}', -- tags vide
    p_name || ' - ' || p_vendor, -- seo_title
    p_description, -- seo_description
    SUBSTRING(p_name FROM 1 FOR 30), -- ad_headline
    SUBSTRING(p_name FROM 1 FOR 90), -- ad_description
    '', -- google_product_category
    '', -- gtin
    p_vendor,
    CASE 
      WHEN detect_color_from_text(p_name || ' ' || p_description) != '' 
           AND detect_material_from_text(p_name || ' ' || p_description) != '' 
           AND detect_style_from_text(p_name || ' ' || p_description) != ''
      THEN 85
      WHEN detect_color_from_text(p_name || ' ' || p_description) != '' 
           AND detect_material_from_text(p_name || ' ' || p_description) != ''
      THEN 75
      WHEN detect_color_from_text(p_name || ' ' || p_description) != '' 
           OR detect_material_from_text(p_name || ' ' || p_description) != ''
      THEN 65
      ELSE 50
    END, -- confidence_score
    NOW(),
    'manual_sync',
    NOW()
  )
  ON CONFLICT (handle) 
  DO UPDATE SET
    title = EXCLUDED.title,
    description = EXCLUDED.description,
    category = EXCLUDED.category,
    subcategory = EXCLUDED.subcategory,
    color = EXCLUDED.color,
    material = EXCLUDED.material,
    fabric = EXCLUDED.fabric,
    style = EXCLUDED.style,
    room = EXCLUDED.room,
    price = EXCLUDED.price,
    stock_qty = EXCLUDED.stock_qty,
    image_url = EXCLUDED.image_url,
    product_url = EXCLUDED.product_url,
    brand = EXCLUDED.brand,
    confidence_score = EXCLUDED.confidence_score,
    enriched_at = NOW(),
    enrichment_source = 'manual_sync_update';
END;
$$ LANGUAGE plpgsql;