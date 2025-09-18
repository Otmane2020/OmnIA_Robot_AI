/*
  # Table produits enrichis complète avec tous les champs

  1. Nouvelle table products_enriched avec tous les champs requis
    - Informations de base (title, description, vendor, brand)
    - Catégorisation (category, subcategory, tags)
    - Attributs physiques (material, color, style, room, dimensions, weight)
    - Capacité et spécifications (capacity, availability)
    - Prix et commerce (price, compare_at_price, currency, stock_quantity)
    - SEO et marketing (seo_title, seo_description, google_category, pmax_score)
    - Images (image_url, image_alt, gallery_urls)
    - IA et matching (intent_tags, matching_score, chat_history_ref)

  2. Table flux Google Merchant
    - Tous les champs requis pour Google Shopping
    - Mapping automatique depuis products_enriched
    - Export XML/CSV compatible

  3. Fonctions d'enrichissement avec vision IA
    - Analyse d'image avec OpenAI Vision
    - Extraction d'attributs précise
    - Détection automatique des matériaux et couleurs
*/

-- Supprimer l'ancienne table si elle existe
DROP TABLE IF EXISTS products_enriched CASCADE;

-- Créer la nouvelle table products_enriched complète
CREATE TABLE products_enriched (
  id TEXT PRIMARY KEY,
  handle TEXT NOT NULL,
  
  -- 📝 Informations de base
  title TEXT,
  description TEXT,
  short_description TEXT,
  vendor TEXT,
  brand TEXT,
  
  -- 🏷️ Catégorisation
  category TEXT,
  subcategory TEXT,
  tags TEXT[] DEFAULT '{}',
  
  -- 🎨 Attributs physiques
  material TEXT,
  color TEXT,
  style TEXT,
  room TEXT,
  dimensions TEXT,
  weight TEXT,
  capacity TEXT,
  
  -- 💰 Prix et commerce
  price NUMERIC,
  compare_at_price NUMERIC,
  currency TEXT DEFAULT 'EUR',
  stock_quantity INTEGER DEFAULT 0,
  availability TEXT DEFAULT 'Disponible',
  
  -- 📈 SEO et marketing
  seo_title TEXT,
  seo_description TEXT,
  google_category TEXT,
  pmax_score INTEGER DEFAULT 0,
  
  -- 🖼️ Images
  image_url TEXT,
  image_alt TEXT,
  gallery_urls TEXT[],
  
  -- 🤖 IA et matching
  intent_tags TEXT[],
  matching_score INTEGER DEFAULT 0,
  chat_history_ref TEXT,
  
  -- 📊 Métadonnées
  confidence_score INTEGER DEFAULT 0,
  enriched_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  enrichment_source TEXT DEFAULT 'manual',
  created_at TIMESTAMP WITHOUT TIME ZONE DEFAULT now(),
  
  -- Contraintes
  CONSTRAINT products_enriched_confidence_check CHECK (confidence_score >= 0 AND confidence_score <= 100),
  CONSTRAINT products_enriched_seo_title_length CHECK (char_length(seo_title) <= 70),
  CONSTRAINT products_enriched_seo_desc_length CHECK (char_length(seo_description) <= 155),
  CONSTRAINT products_enriched_pmax_score_check CHECK (pmax_score >= 0 AND pmax_score <= 100),
  CONSTRAINT products_enriched_matching_score_check CHECK (matching_score >= 0 AND matching_score <= 100)
);

-- Créer la table flux Google Merchant
CREATE TABLE IF NOT EXISTS flux_google_merchant (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  link TEXT,
  image_link TEXT,
  additional_image_link TEXT,
  availability TEXT DEFAULT 'in stock',
  price TEXT,
  sale_price TEXT,
  brand TEXT,
  gtin TEXT,
  mpn TEXT,
  condition TEXT DEFAULT 'new',
  google_product_category TEXT,
  product_type TEXT,
  color TEXT,
  material TEXT,
  pattern TEXT,
  size TEXT,
  custom_label_0 TEXT DEFAULT 'promo2025',
  custom_label_1 TEXT,
  custom_label_2 TEXT,
  custom_label_3 TEXT,
  custom_label_4 TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Fonction pour synchroniser products_enriched vers flux Google Merchant
CREATE OR REPLACE FUNCTION sync_to_google_merchant()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO flux_google_merchant (
    id, title, description, link, image_link, additional_image_link,
    availability, price, sale_price, brand, gtin, mpn, condition,
    google_product_category, product_type, color, material, pattern,
    size, custom_label_0
  ) VALUES (
    NEW.id,
    NEW.title,
    COALESCE(NEW.short_description, NEW.description),
    NEW.image_url, -- Utiliser image_url comme link temporaire
    NEW.image_url,
    CASE WHEN array_length(NEW.gallery_urls, 1) > 0 THEN array_to_string(NEW.gallery_urls, ',') END,
    CASE WHEN NEW.availability = 'Disponible' THEN 'in stock' ELSE 'out of stock' END,
    NEW.price || ' EUR',
    CASE WHEN NEW.compare_at_price IS NOT NULL THEN NEW.compare_at_price || ' EUR' END,
    NEW.vendor,
    '', -- gtin vide par défaut
    NEW.handle, -- mpn = handle
    'new',
    NEW.google_category,
    NEW.category || CASE WHEN NEW.subcategory != '' THEN ' > ' || NEW.subcategory ELSE '' END,
    NEW.color,
    NEW.material,
    CASE WHEN array_length(NEW.tags, 1) > 0 THEN array_to_string(NEW.tags, ',') ELSE '' END,
    NEW.dimensions,
    'promo2025'
  )
  ON CONFLICT (id) 
  DO UPDATE SET
    title = EXCLUDED.title,
    description = EXCLUDED.description,
    link = EXCLUDED.link,
    image_link = EXCLUDED.image_link,
    additional_image_link = EXCLUDED.additional_image_link,
    availability = EXCLUDED.availability,
    price = EXCLUDED.price,
    sale_price = EXCLUDED.sale_price,
    brand = EXCLUDED.brand,
    google_product_category = EXCLUDED.google_product_category,
    product_type = EXCLUDED.product_type,
    color = EXCLUDED.color,
    material = EXCLUDED.material,
    pattern = EXCLUDED.pattern,
    size = EXCLUDED.size,
    updated_at = NOW();

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger pour synchroniser automatiquement vers Google Merchant
CREATE TRIGGER sync_enriched_to_merchant
  AFTER INSERT OR UPDATE ON products_enriched
  FOR EACH ROW
  EXECUTE FUNCTION sync_to_google_merchant();

-- Fonction pour enrichir automatiquement depuis imported_products
CREATE OR REPLACE FUNCTION sync_to_products_enriched()
RETURNS TRIGGER AS $$
DECLARE
  detected_color TEXT;
  detected_material TEXT;
  detected_style TEXT;
  detected_room TEXT;
  detected_subcategory TEXT;
  generated_tags TEXT[];
BEGIN
  -- Détecter les attributs depuis le texte
  detected_color := detect_color_from_text(NEW.name || ' ' || COALESCE(NEW.description, ''));
  detected_material := detect_material_from_text(NEW.name || ' ' || COALESCE(NEW.description, ''));
  detected_style := detect_style_from_text(NEW.name || ' ' || COALESCE(NEW.description, ''));
  detected_room := detect_room_from_text(NEW.name || ' ' || COALESCE(NEW.description, ''));
  detected_subcategory := detect_subcategory_from_text(NEW.name || ' ' || COALESCE(NEW.description, ''), NEW.category);
  
  -- Générer tags automatiquement
  generated_tags := generate_auto_tags(NEW.name || ' ' || COALESCE(NEW.description, ''), detected_color, detected_material, detected_style);

  -- Insérer dans products_enriched avec tous les champs
  INSERT INTO products_enriched (
    id, handle, title, description, short_description, vendor, brand,
    category, subcategory, tags, material, color, style, room,
    dimensions, weight, capacity, price, compare_at_price, currency,
    stock_quantity, availability, seo_title, seo_description,
    google_category, pmax_score, image_url, image_alt, gallery_urls,
    intent_tags, matching_score, chat_history_ref, confidence_score,
    enriched_at, enrichment_source, created_at
  ) VALUES (
    COALESCE(NEW.external_id, NEW.id::text),
    COALESCE(NEW.external_id, NEW.id::text),
    NEW.name,
    COALESCE(NEW.description, ''),
    SUBSTRING(COALESCE(NEW.description, NEW.name) FROM 1 FOR 200),
    COALESCE(NEW.vendor, 'Decora Home'),
    COALESCE(NEW.vendor, 'Decora Home'),
    COALESCE(NEW.category, 'Mobilier'),
    detected_subcategory,
    generated_tags,
    detected_material,
    detected_color,
    detected_style,
    detected_room,
    extract_dimensions_from_text(NEW.name || ' ' || COALESCE(NEW.description, '')),
    extract_weight_from_text(NEW.name || ' ' || COALESCE(NEW.description, '')),
    extract_capacity_from_text(NEW.name || ' ' || COALESCE(NEW.description, '')),
    COALESCE(NEW.price, 0),
    NEW.compare_at_price,
    'EUR',
    COALESCE(NEW.stock, 0),
    CASE WHEN COALESCE(NEW.stock, 0) > 0 THEN 'Disponible' ELSE 'Rupture de stock' END,
    generate_seo_title(NEW.name, detected_color, detected_material, COALESCE(NEW.vendor, 'Decora Home')),
    generate_seo_description(NEW.name, detected_style, detected_material),
    get_google_category_from_category(COALESCE(NEW.category, 'Mobilier')),
    calculate_pmax_score(NEW.price, NEW.compare_at_price, detected_color, detected_material),
    COALESCE(NEW.image_url, ''),
    NEW.name,
    '{}', -- gallery_urls vide par défaut
    generated_tags, -- intent_tags = tags
    calculate_matching_score(detected_color, detected_material, detected_style),
    '', -- chat_history_ref vide
    calculate_confidence_score(detected_color, detected_material, detected_style, detected_room),
    NOW(),
    'auto_sync',
    NOW()
  )
  ON CONFLICT (handle) 
  DO UPDATE SET
    title = EXCLUDED.title,
    description = EXCLUDED.description,
    short_description = EXCLUDED.short_description,
    vendor = EXCLUDED.vendor,
    brand = EXCLUDED.brand,
    category = EXCLUDED.category,
    subcategory = EXCLUDED.subcategory,
    tags = EXCLUDED.tags,
    material = EXCLUDED.material,
    color = EXCLUDED.color,
    style = EXCLUDED.style,
    room = EXCLUDED.room,
    dimensions = EXCLUDED.dimensions,
    weight = EXCLUDED.weight,
    capacity = EXCLUDED.capacity,
    price = EXCLUDED.price,
    compare_at_price = EXCLUDED.compare_at_price,
    stock_quantity = EXCLUDED.stock_quantity,
    availability = EXCLUDED.availability,
    seo_title = EXCLUDED.seo_title,
    seo_description = EXCLUDED.seo_description,
    google_category = EXCLUDED.google_category,
    pmax_score = EXCLUDED.pmax_score,
    image_url = EXCLUDED.image_url,
    image_alt = EXCLUDED.image_alt,
    intent_tags = EXCLUDED.intent_tags,
    matching_score = EXCLUDED.matching_score,
    confidence_score = EXCLUDED.confidence_score,
    enriched_at = NOW();

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Fonctions utilitaires améliorées
CREATE OR REPLACE FUNCTION detect_color_from_text(text_input TEXT)
RETURNS TEXT AS $$
DECLARE
  lower_text TEXT := LOWER(text_input);
BEGIN
  -- Couleurs spécifiques en premier
  IF lower_text ~ '(turquoise)' THEN RETURN 'turquoise';
  ELSIF lower_text ~ '(blanc|white)' THEN RETURN 'blanc';
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
  -- Matériaux spécifiques en premier
  IF lower_text ~ '(résine|resin)' THEN RETURN 'résine';
  ELSIF lower_text ~ '(acier|steel)' THEN RETURN 'acier';
  ELSIF lower_text ~ '(travertin|travertine)' THEN RETURN 'travertin';
  ELSIF lower_text ~ '(marbre|marble)' THEN RETURN 'marbre';
  ELSIF lower_text ~ '(velours côtelé)' THEN RETURN 'velours côtelé';
  ELSIF lower_text ~ '(velours|velvet)' THEN RETURN 'velours';
  ELSIF lower_text ~ '(chenille)' THEN RETURN 'chenille';
  ELSIF lower_text ~ '(chêne massif)' THEN RETURN 'chêne massif';
  ELSIF lower_text ~ '(chêne|oak)' THEN RETURN 'chêne';
  ELSIF lower_text ~ '(bois massif)' THEN RETURN 'bois massif';
  ELSIF lower_text ~ '(bois|wood)' THEN RETURN 'bois';
  ELSIF lower_text ~ '(métal|metal)' THEN RETURN 'métal';
  ELSIF lower_text ~ '(verre|glass)' THEN RETURN 'verre';
  ELSIF lower_text ~ '(tissu|fabric)' THEN RETURN 'tissu';
  ELSIF lower_text ~ '(cuir|leather)' THEN RETURN 'cuir';
  ELSIF lower_text ~ '(plastique|plastic)' THEN RETURN 'plastique';
  ELSIF lower_text ~ '(rotin|rattan)' THEN RETURN 'rotin';
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
BEGIN
  -- Sous-catégories spécifiques selon la catégorie principale
  IF LOWER(main_category) = 'canapé' THEN
    IF lower_text ~ '(angle|corner)' THEN RETURN 'Canapé d''angle';
    ELSIF lower_text ~ '(convertible|lit)' THEN RETURN 'Canapé convertible';
    ELSIF lower_text ~ '(fixe|droit)' THEN RETURN 'Canapé fixe';
    ELSE RETURN 'Canapé';
    END IF;
  ELSIF LOWER(main_category) = 'table' THEN
    IF lower_text ~ '(basse|coffee)' THEN RETURN 'Table basse';
    ELSIF lower_text ~ '(manger|dining)' THEN RETURN 'Table à manger';
    ELSIF lower_text ~ '(console)' THEN RETURN 'Console';
    ELSE RETURN 'Table';
    END IF;
  ELSIF LOWER(main_category) = 'chaise' THEN
    IF lower_text ~ '(fauteuil|armchair)' THEN RETURN 'Fauteuil';
    ELSIF lower_text ~ '(bureau|office)' THEN RETURN 'Chaise de bureau';
    ELSIF lower_text ~ '(bar|tabouret)' THEN RETURN 'Tabouret de bar';
    ELSE RETURN 'Chaise de salle à manger';
    END IF;
  ELSE
    RETURN main_category;
  END IF;
END;
$$ LANGUAGE plpgsql IMMUTABLE;

CREATE OR REPLACE FUNCTION generate_auto_tags(text_input TEXT, color_val TEXT, material_val TEXT, style_val TEXT)
RETURNS TEXT[] AS $$
DECLARE
  tags TEXT[] := '{}';
  lower_text TEXT := LOWER(text_input);
BEGIN
  -- Ajouter couleur si détectée
  IF color_val != '' THEN
    tags := array_append(tags, color_val);
  END IF;
  
  -- Ajouter matériau si détecté
  IF material_val != '' THEN
    tags := array_append(tags, material_val);
  END IF;
  
  -- Ajouter style si détecté
  IF style_val != '' THEN
    tags := array_append(tags, style_val);
  END IF;
  
  -- Ajouter fonctionnalités
  IF lower_text ~ '(convertible)' THEN tags := array_append(tags, 'convertible'); END IF;
  IF lower_text ~ '(rangement|storage)' THEN tags := array_append(tags, 'rangement'); END IF;
  IF lower_text ~ '(angle|corner)' THEN tags := array_append(tags, 'angle'); END IF;
  IF lower_text ~ '(réversible|reversible)' THEN tags := array_append(tags, 'réversible'); END IF;
  IF lower_text ~ '(pliable|foldable)' THEN tags := array_append(tags, 'pliable'); END IF;
  IF lower_text ~ '(extensible|extendable)' THEN tags := array_append(tags, 'extensible'); END IF;
  IF lower_text ~ '(roulettes|wheels)' THEN tags := array_append(tags, 'roulettes'); END IF;
  IF lower_text ~ '(réglable|adjustable)' THEN tags := array_append(tags, 'réglable'); END IF;
  
  RETURN tags;
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- Fonctions utilitaires pour l'enrichissement
CREATE OR REPLACE FUNCTION extract_dimensions_from_text(text_input TEXT)
RETURNS TEXT AS $$
DECLARE
  dimension_match TEXT;
BEGIN
  -- Chercher format LxlxH
  SELECT substring(text_input FROM '(\d+\s*[x×]\s*\d+(?:\s*[x×]\s*\d+)?\s*cm)') INTO dimension_match;
  IF dimension_match IS NOT NULL THEN
    RETURN dimension_match;
  END IF;
  
  -- Chercher diamètre
  SELECT substring(text_input FROM '(ø\s*\d+\s*cm)') INTO dimension_match;
  IF dimension_match IS NOT NULL THEN
    RETURN dimension_match;
  END IF;
  
  RETURN '';
END;
$$ LANGUAGE plpgsql IMMUTABLE;

CREATE OR REPLACE FUNCTION extract_weight_from_text(text_input TEXT)
RETURNS TEXT AS $$
DECLARE
  weight_match TEXT;
BEGIN
  SELECT substring(text_input FROM '(\d+(?:\.\d+)?\s*kg)') INTO weight_match;
  RETURN COALESCE(weight_match, '');
END;
$$ LANGUAGE plpgsql IMMUTABLE;

CREATE OR REPLACE FUNCTION extract_capacity_from_text(text_input TEXT)
RETURNS TEXT AS $$
DECLARE
  capacity_match TEXT;
BEGIN
  SELECT substring(text_input FROM '(\d+\s*places?)') INTO capacity_match;
  IF capacity_match IS NOT NULL THEN
    RETURN capacity_match;
  END IF;
  
  SELECT substring(text_input FROM '(\d+\s*personnes?)') INTO capacity_match;
  RETURN COALESCE(capacity_match, '');
END;
$$ LANGUAGE plpgsql IMMUTABLE;

CREATE OR REPLACE FUNCTION generate_seo_title(name_val TEXT, color_val TEXT, material_val TEXT, brand_val TEXT)
RETURNS TEXT AS $$
BEGIN
  RETURN SUBSTRING(
    name_val || 
    CASE WHEN color_val != '' THEN ' ' || color_val ELSE '' END ||
    CASE WHEN material_val != '' THEN ' ' || material_val ELSE '' END ||
    ' - ' || brand_val
    FROM 1 FOR 70
  );
END;
$$ LANGUAGE plpgsql IMMUTABLE;

CREATE OR REPLACE FUNCTION generate_seo_description(name_val TEXT, style_val TEXT, material_val TEXT)
RETURNS TEXT AS $$
BEGIN
  RETURN SUBSTRING(
    name_val ||
    CASE WHEN material_val != '' THEN ' en ' || material_val ELSE '' END ||
    CASE WHEN style_val != '' THEN ' de style ' || style_val ELSE '' END ||
    '. Livraison gratuite. Garantie qualité.'
    FROM 1 FOR 155
  );
END;
$$ LANGUAGE plpgsql IMMUTABLE;

CREATE OR REPLACE FUNCTION get_google_category_from_category(category_val TEXT)
RETURNS TEXT AS $$
BEGIN
  CASE LOWER(category_val)
    WHEN 'canapé' THEN RETURN 'Furniture > Living Room Furniture > Sofas';
    WHEN 'table' THEN RETURN 'Furniture > Tables';
    WHEN 'chaise' THEN RETURN 'Furniture > Chairs';
    WHEN 'lit' THEN RETURN 'Furniture > Bedroom Furniture > Beds';
    WHEN 'rangement' THEN RETURN 'Furniture > Storage Furniture';
    WHEN 'meuble tv' THEN RETURN 'Furniture > Entertainment Centers';
    WHEN 'fauteuil' THEN RETURN 'Furniture > Living Room Furniture > Chairs';
    ELSE RETURN 'Furniture';
  END CASE;
END;
$$ LANGUAGE plpgsql IMMUTABLE;

CREATE OR REPLACE FUNCTION calculate_pmax_score(price_val NUMERIC, compare_price_val NUMERIC, color_val TEXT, material_val TEXT)
RETURNS INTEGER AS $$
DECLARE
  score INTEGER := 50; -- Score de base
BEGIN
  -- Bonus pour prix attractif
  IF compare_price_val IS NOT NULL AND compare_price_val > price_val THEN
    score := score + 20; -- Bonus promo
  END IF;
  
  -- Bonus pour attributs détectés
  IF color_val != '' THEN score := score + 10; END IF;
  IF material_val != '' THEN score := score + 10; END IF;
  
  -- Bonus pour prix compétitif
  IF price_val < 200 THEN score := score + 10; END IF;
  
  RETURN LEAST(score, 100);
END;
$$ LANGUAGE plpgsql IMMUTABLE;

CREATE OR REPLACE FUNCTION calculate_matching_score(color_val TEXT, material_val TEXT, style_val TEXT)
RETURNS INTEGER AS $$
DECLARE
  score INTEGER := 0;
BEGIN
  IF color_val != '' THEN score := score + 30; END IF;
  IF material_val != '' THEN score := score + 30; END IF;
  IF style_val != '' THEN score := score + 25; END IF;
  
  RETURN LEAST(score, 100);
END;
$$ LANGUAGE plpgsql IMMUTABLE;

CREATE OR REPLACE FUNCTION calculate_confidence_score(color_val TEXT, material_val TEXT, style_val TEXT, room_val TEXT)
RETURNS INTEGER AS $$
DECLARE
  score INTEGER := 30; -- Score de base
BEGIN
  IF color_val != '' THEN score := score + 20; END IF;
  IF material_val != '' THEN score := score + 25; END IF;
  IF style_val != '' THEN score := score + 15; END IF;
  IF room_val != '' THEN score := score + 10; END IF;
  
  RETURN LEAST(score, 100);
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- Créer les index de performance
CREATE INDEX IF NOT EXISTS idx_products_enriched_handle ON products_enriched (handle);
CREATE INDEX IF NOT EXISTS idx_products_enriched_category ON products_enriched (category);
CREATE INDEX IF NOT EXISTS idx_products_enriched_color ON products_enriched (color);
CREATE INDEX IF NOT EXISTS idx_products_enriched_material ON products_enriched (material);
CREATE INDEX IF NOT EXISTS idx_products_enriched_style ON products_enriched (style);
CREATE INDEX IF NOT EXISTS idx_products_enriched_room ON products_enriched (room);
CREATE INDEX IF NOT EXISTS idx_products_enriched_price ON products_enriched (price);
CREATE INDEX IF NOT EXISTS idx_products_enriched_stock ON products_enriched (stock_quantity);
CREATE INDEX IF NOT EXISTS idx_products_enriched_brand ON products_enriched (brand);
CREATE INDEX IF NOT EXISTS idx_products_enriched_confidence ON products_enriched (confidence_score);
CREATE INDEX IF NOT EXISTS idx_products_enriched_enriched_at ON products_enriched (enriched_at DESC);
CREATE INDEX IF NOT EXISTS idx_products_enriched_tags_search ON products_enriched USING GIN (tags);
CREATE INDEX IF NOT EXISTS idx_products_enriched_category_type ON products_enriched (category, subcategory);
CREATE INDEX IF NOT EXISTS idx_products_enriched_attributes ON products_enriched (color, material, style);

-- Index de recherche textuelle (sans fonction dans l'expression)
CREATE INDEX IF NOT EXISTS idx_products_enriched_title_search 
ON products_enriched USING gin (to_tsvector('french', title));

CREATE INDEX IF NOT EXISTS idx_products_enriched_description_search 
ON products_enriched USING gin (to_tsvector('french', description));

CREATE INDEX IF NOT EXISTS idx_products_enriched_seo_search 
ON products_enriched USING gin (to_tsvector('french', seo_title || ' ' || seo_description));

-- Activer RLS
ALTER TABLE products_enriched ENABLE ROW LEVEL SECURITY;
ALTER TABLE flux_google_merchant ENABLE ROW LEVEL SECURITY;

-- Politiques RLS
CREATE POLICY "Public can read active products" ON products_enriched
  FOR SELECT TO anon, authenticated
  USING (stock_quantity > 0);

CREATE POLICY "Authenticated users can manage products" ON products_enriched
  FOR ALL TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Public can read merchant feed" ON flux_google_merchant
  FOR SELECT TO anon, authenticated
  USING (true);

CREATE POLICY "Authenticated users can manage merchant feed" ON flux_google_merchant
  FOR ALL TO authenticated
  USING (true)
  WITH CHECK (true);

-- Trigger pour synchroniser imported_products vers products_enriched
DROP TRIGGER IF EXISTS sync_imported_to_enriched ON imported_products;
CREATE TRIGGER sync_imported_to_enriched
  AFTER INSERT OR UPDATE ON imported_products
  FOR EACH ROW
  WHEN (NEW.status = 'active' AND NEW.stock > 0)
  EXECUTE FUNCTION sync_to_products_enriched();

-- Trigger pour synchroniser ai_products vers products_enriched
DROP TRIGGER IF EXISTS sync_ai_to_enriched ON ai_products;
CREATE TRIGGER sync_ai_to_enriched
  AFTER INSERT OR UPDATE ON ai_products
  FOR EACH ROW
  WHEN (NEW.stock > 0)
  EXECUTE FUNCTION sync_to_products_enriched();