/*
  # Enrichissement automatique des produits

  1. Nouveaux champs
    - Ajout des champs d'enrichissement IA à products_enriched
    - Attributs de classification (catégorie, couleur, matériau, style)
    - Champs marketing (SEO, publicités, Google Shopping)

  2. Fonctions utilitaires
    - Détection automatique des attributs depuis le texte
    - Synchronisation automatique depuis imported_products
    - Enrichissement automatique des attributs manquants

  3. Triggers
    - Synchronisation automatique après import
    - Enrichissement automatique des nouveaux produits

  4. Index de performance
    - Index pour recherche par attributs
    - Index de recherche textuelle
    - Index pour Google Shopping
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
    ALTER TABLE products_enriched ADD COLUMN enrichment_source TEXT DEFAULT 'manual';
  END IF;
END $$;

-- Fonctions utilitaires pour la détection d'attributs
CREATE OR REPLACE FUNCTION detect_color_from_text(text_input TEXT)
RETURNS TEXT AS $$
DECLARE
  lower_text TEXT := LOWER(text_input);
BEGIN
  IF lower_text ~ '(blanc|white)' THEN RETURN 'blanc';
  ELSIF lower_text ~ '(noir|black)' THEN RETURN 'noir';
  ELSIF lower_text ~ '(gris|grey|gray)' THEN RETURN 'gris';
  ELSIF lower_text ~ '(beige)' THEN RETURN 'beige';
  ELSIF lower_text ~ '(marron|brown)' THEN RETURN 'marron';
  ELSIF lower_text ~ '(bleu|blue)' THEN RETURN 'bleu';
  ELSIF lower_text ~ '(vert|green)' THEN RETURN 'vert';
  ELSIF lower_text ~ '(rouge|red)' THEN RETURN 'rouge';
  ELSIF lower_text ~ '(jaune|yellow)' THEN RETURN 'jaune';
  ELSIF lower_text ~ '(orange)' THEN RETURN 'orange';
  ELSIF lower_text ~ '(rose|pink)' THEN RETURN 'rose';
  ELSIF lower_text ~ '(violet|purple)' THEN RETURN 'violet';
  ELSIF lower_text ~ '(naturel|natural)' THEN RETURN 'naturel';
  ELSIF lower_text ~ '(chêne|oak)' THEN RETURN 'chêne';
  ELSIF lower_text ~ '(noyer|walnut)' THEN RETURN 'noyer';
  ELSIF lower_text ~ '(taupe)' THEN RETURN 'taupe';
  ELSE RETURN '';
  END IF;
END;
$$ LANGUAGE plpgsql IMMUTABLE;

CREATE OR REPLACE FUNCTION detect_material_from_text(text_input TEXT)
RETURNS TEXT AS $$
DECLARE
  lower_text TEXT := LOWER(text_input);
BEGIN
  IF lower_text ~ '(travertin|travertine)' THEN RETURN 'travertin';
  ELSIF lower_text ~ '(marbre|marble)' THEN RETURN 'marbre';
  ELSIF lower_text ~ '(chêne|oak)' THEN RETURN 'chêne';
  ELSIF lower_text ~ '(hêtre|beech)' THEN RETURN 'hêtre';
  ELSIF lower_text ~ '(pin|pine)' THEN RETURN 'pin';
  ELSIF lower_text ~ '(teck|teak)' THEN RETURN 'teck';
  ELSIF lower_text ~ '(noyer|walnut)' THEN RETURN 'noyer';
  ELSIF lower_text ~ '(bois massif|solid wood|massif)' THEN RETURN 'bois massif';
  ELSIF lower_text ~ '(métal|metal|acier|steel)' THEN RETURN 'métal';
  ELSIF lower_text ~ '(verre|glass)' THEN RETURN 'verre';
  ELSIF lower_text ~ '(velours|velvet)' THEN RETURN 'velours';
  ELSIF lower_text ~ '(chenille)' THEN RETURN 'chenille';
  ELSIF lower_text ~ '(cuir|leather)' THEN RETURN 'cuir';
  ELSIF lower_text ~ '(tissu|fabric)' THEN RETURN 'tissu';
  ELSIF lower_text ~ '(rotin|rattan)' THEN RETURN 'rotin';
  ELSIF lower_text ~ '(plastique|plastic)' THEN RETURN 'plastique';
  ELSE RETURN '';
  END IF;
END;
$$ LANGUAGE plpgsql IMMUTABLE;

CREATE OR REPLACE FUNCTION detect_style_from_text(text_input TEXT)
RETURNS TEXT AS $$
DECLARE
  lower_text TEXT := LOWER(text_input);
BEGIN
  IF lower_text ~ '(moderne|modern)' THEN RETURN 'moderne';
  ELSIF lower_text ~ '(contemporain|contemporary)' THEN RETURN 'contemporain';
  ELSIF lower_text ~ '(scandinave|scandinavian)' THEN RETURN 'scandinave';
  ELSIF lower_text ~ '(industriel|industrial)' THEN RETURN 'industriel';
  ELSIF lower_text ~ '(vintage)' THEN RETURN 'vintage';
  ELSIF lower_text ~ '(rustique|rustic)' THEN RETURN 'rustique';
  ELSIF lower_text ~ '(classique|classic)' THEN RETURN 'classique';
  ELSIF lower_text ~ '(minimaliste|minimalist)' THEN RETURN 'minimaliste';
  ELSIF lower_text ~ '(bohème|boho)' THEN RETURN 'bohème';
  ELSE RETURN '';
  END IF;
END;
$$ LANGUAGE plpgsql IMMUTABLE;

CREATE OR REPLACE FUNCTION detect_room_from_text(text_input TEXT)
RETURNS TEXT AS $$
DECLARE
  lower_text TEXT := LOWER(text_input);
BEGIN
  IF lower_text ~ '(salon|living)' THEN RETURN 'salon';
  ELSIF lower_text ~ '(chambre|bedroom)' THEN RETURN 'chambre';
  ELSIF lower_text ~ '(cuisine|kitchen)' THEN RETURN 'cuisine';
  ELSIF lower_text ~ '(bureau|office)' THEN RETURN 'bureau';
  ELSIF lower_text ~ '(salle à manger|dining)' THEN RETURN 'salle à manger';
  ELSIF lower_text ~ '(entrée|entrance)' THEN RETURN 'entrée';
  ELSIF lower_text ~ '(terrasse|terrace)' THEN RETURN 'terrasse';
  ELSE RETURN '';
  END IF;
END;
$$ LANGUAGE plpgsql IMMUTABLE;

CREATE OR REPLACE FUNCTION detect_subcategory_from_text(text_input TEXT, main_category TEXT)
RETURNS TEXT AS $$
DECLARE
  lower_text TEXT := LOWER(text_input);
  lower_category TEXT := LOWER(main_category);
BEGIN
  IF lower_category = 'canapé' THEN
    IF lower_text ~ '(angle|corner)' THEN RETURN 'Canapé d''angle';
    ELSIF lower_text ~ '(convertible|lit)' THEN RETURN 'Canapé convertible';
    ELSE RETURN 'Canapé fixe';
    END IF;
  ELSIF lower_category = 'table' THEN
    IF lower_text ~ '(basse|coffee)' THEN RETURN 'Table basse';
    ELSIF lower_text ~ '(manger|dining)' THEN RETURN 'Table à manger';
    ELSIF lower_text ~ '(console)' THEN RETURN 'Console';
    ELSE RETURN 'Table';
    END IF;
  ELSIF lower_category = 'chaise' THEN
    IF lower_text ~ '(bureau|office)' THEN RETURN 'Chaise de bureau';
    ELSIF lower_text ~ '(fauteuil|armchair)' THEN RETURN 'Fauteuil';
    ELSIF lower_text ~ '(bar|tabouret)' THEN RETURN 'Tabouret de bar';
    ELSE RETURN 'Chaise de salle à manger';
    END IF;
  ELSE
    RETURN '';
  END IF;
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- Fonction pour synchroniser automatiquement vers products_enriched
CREATE OR REPLACE FUNCTION sync_to_products_enriched()
RETURNS TRIGGER AS $$
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
    COALESCE(NEW.external_id, NEW.id::text),
    COALESCE(NEW.external_id, NEW.id::text),
    NEW.name,
    COALESCE(NEW.description, ''),
    COALESCE(NEW.category, 'Mobilier'),
    detect_subcategory_from_text(NEW.name || ' ' || COALESCE(NEW.description, ''), COALESCE(NEW.category, 'Mobilier')),
    detect_color_from_text(NEW.name || ' ' || COALESCE(NEW.description, '')),
    detect_material_from_text(NEW.name || ' ' || COALESCE(NEW.description, '')),
    detect_material_from_text(NEW.name || ' ' || COALESCE(NEW.description, '')), -- fabric = material pour l'instant
    detect_style_from_text(NEW.name || ' ' || COALESCE(NEW.description, '')),
    '', -- dimensions à enrichir plus tard
    detect_room_from_text(NEW.name || ' ' || COALESCE(NEW.description, '')),
    COALESCE(NEW.price, 0),
    COALESCE(NEW.stock, 0),
    COALESCE(NEW.image_url, ''),
    COALESCE(NEW.product_url, ''),
    '{}', -- tags vide par défaut
    COALESCE(NEW.name, '') || ' - Decora Home', -- seo_title basique
    COALESCE(NEW.description, NEW.name, ''), -- seo_description basique
    SUBSTRING(COALESCE(NEW.name, '') FROM 1 FOR 30), -- ad_headline
    SUBSTRING(COALESCE(NEW.name, '') FROM 1 FOR 90), -- ad_description
    '', -- google_product_category à enrichir
    '', -- gtin vide
    COALESCE(NEW.vendor, 'Decora Home'),
    CASE 
      WHEN detect_color_from_text(NEW.name || ' ' || COALESCE(NEW.description, '')) != '' 
           AND detect_material_from_text(NEW.name || ' ' || COALESCE(NEW.description, '')) != '' 
           AND detect_style_from_text(NEW.name || ' ' || COALESCE(NEW.description, '')) != ''
      THEN 85
      WHEN detect_color_from_text(NEW.name || ' ' || COALESCE(NEW.description, '')) != '' 
           AND detect_material_from_text(NEW.name || ' ' || COALESCE(NEW.description, '')) != ''
      THEN 75
      WHEN detect_color_from_text(NEW.name || ' ' || COALESCE(NEW.description, '')) != '' 
           OR detect_material_from_text(NEW.name || ' ' || COALESCE(NEW.description, '')) != ''
      THEN 65
      ELSE 50
    END, -- confidence_score calculé
    NOW(),
    'auto_sync',
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
    enrichment_source = 'auto_sync_update';

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger sur imported_products pour sync automatique
DROP TRIGGER IF EXISTS sync_imported_to_enriched ON imported_products;
CREATE TRIGGER sync_imported_to_enriched
  AFTER INSERT OR UPDATE ON imported_products
  FOR EACH ROW
  WHEN (NEW.status = 'active' AND NEW.stock > 0)
  EXECUTE FUNCTION sync_to_products_enriched();

-- Trigger sur ai_products pour sync automatique
DROP TRIGGER IF EXISTS sync_ai_to_enriched ON ai_products;
CREATE TRIGGER sync_ai_to_enriched
  AFTER INSERT OR UPDATE ON ai_products
  FOR EACH ROW
  WHEN (NEW.stock > 0)
  EXECUTE FUNCTION sync_to_products_enriched();

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

CREATE INDEX IF NOT EXISTS idx_products_enriched_tags_search 
ON products_enriched USING GIN (tags);

CREATE INDEX IF NOT EXISTS idx_products_enriched_google_category 
ON products_enriched (google_product_category);

CREATE INDEX IF NOT EXISTS idx_products_enriched_brand 
ON products_enriched (brand);

CREATE INDEX IF NOT EXISTS idx_products_enriched_gtin 
ON products_enriched (gtin);

CREATE INDEX IF NOT EXISTS idx_products_enriched_confidence 
ON products_enriched (confidence_score DESC);

CREATE INDEX IF NOT EXISTS idx_products_enriched_enriched_at 
ON products_enriched (enriched_at DESC);

CREATE INDEX IF NOT EXISTS idx_products_enriched_room 
ON products_enriched (room);

CREATE INDEX IF NOT EXISTS idx_products_enriched_style 
ON products_enriched (style);

CREATE INDEX IF NOT EXISTS idx_products_enriched_material 
ON products_enriched (material);

CREATE INDEX IF NOT EXISTS idx_products_enriched_color 
ON products_enriched (color);

CREATE INDEX IF NOT EXISTS idx_products_enriched_price 
ON products_enriched (price);

CREATE INDEX IF NOT EXISTS idx_products_enriched_stock 
ON products_enriched (stock_qty);

-- Index de recherche textuelle (sans fonction dans l'expression)
CREATE INDEX IF NOT EXISTS idx_products_enriched_title_search 
ON products_enriched USING gin(to_tsvector('french', title));

CREATE INDEX IF NOT EXISTS idx_products_enriched_description_search 
ON products_enriched USING gin(to_tsvector('french', description));

CREATE INDEX IF NOT EXISTS idx_products_enriched_seo_search 
ON products_enriched USING gin(to_tsvector('french', seo_title || ' ' || seo_description));