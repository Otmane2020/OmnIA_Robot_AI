/*
  # Create Google Categories mapping table

  1. New Table
    - `google_categories_mapping`
      - `id` (uuid, primary key)
      - `category` (text) - Main category like "Canapé", "Table", etc.
      - `subcategory` (text) - Specific subcategory like "Canapé d'angle"
      - `google_product_category` (text) - Google Shopping category ID
      - `description` (text) - Description of the category
      - `created_at` (timestamp)
      - `updated_at` (timestamp)

  2. Security
    - Enable RLS on table
    - Add policies for authenticated users

  3. Initial Data
    - Insert default Google Shopping categories mapping
*/

-- Create Google Categories mapping table
CREATE TABLE IF NOT EXISTS google_categories_mapping (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  category text NOT NULL,
  subcategory text NOT NULL,
  google_product_category text NOT NULL,
  description text DEFAULT '',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE google_categories_mapping ENABLE ROW LEVEL SECURITY;

-- Add policies
CREATE POLICY "Anyone can read Google categories"
  ON google_categories_mapping
  FOR SELECT
  TO authenticated, anon
  USING (true);

CREATE POLICY "Authenticated users can manage Google categories"
  ON google_categories_mapping
  FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Insert default Google Shopping categories
INSERT INTO google_categories_mapping (category, subcategory, google_product_category, description) VALUES
-- Canapés (Google Shopping ID: 635)
('Canapé', 'Canapé fixe', '635', 'Canapés fixes et droits'),
('Canapé', 'Canapé d''angle', '635', 'Canapés d''angle et modulaires'),
('Canapé', 'Canapé convertible', '635', 'Canapés-lits et convertibles'),
('Canapé', 'Canapé 2 places', '635', 'Canapés 2 places et love seats'),
('Canapé', 'Canapé 3 places', '635', 'Canapés 3 places standard'),

-- Chaises (Google Shopping ID: 436)
('Chaise', 'Chaise de salle à manger', '436', 'Chaises pour salle à manger'),
('Chaise', 'Chaise de bureau', '436', 'Chaises et fauteuils de bureau'),
('Chaise', 'Fauteuil', '436', 'Fauteuils et sièges d''appoint'),
('Chaise', 'Tabouret', '436', 'Tabourets et sièges hauts'),
('Chaise', 'Chaise longue', '436', 'Chaises longues et relax'),

-- Tables (Google Shopping ID: 443)
('Table', 'Table à manger', '443', 'Tables de salle à manger'),
('Table', 'Table basse', '443', 'Tables basses et tables de salon'),
('Table', 'Table de bureau', '443', 'Tables et bureaux de travail'),
('Table', 'Console', '443', 'Consoles et tables d''appoint'),
('Table', 'Table de chevet', '443', 'Tables de chevet et de nuit'),

-- Lits (Google Shopping ID: 630)
('Lit', 'Lit simple', '630', 'Lits simples et 1 place'),
('Lit', 'Lit double', '630', 'Lits doubles et 2 places'),
('Lit', 'Lit king size', '630', 'Lits king size et très grands'),
('Lit', 'Lit enfant', '630', 'Lits pour enfants'),
('Lit', 'Lit superposé', '630', 'Lits superposés et mezzanines'),

-- Rangement (Google Shopping ID: 443)
('Rangement', 'Armoire', '443', 'Armoires et penderies'),
('Rangement', 'Commode', '443', 'Commodes et chiffonniers'),
('Rangement', 'Bibliothèque', '443', 'Bibliothèques et étagères'),
('Rangement', 'Vitrine', '443', 'Vitrines et buffets'),
('Rangement', 'Coffre', '443', 'Coffres et bancs de rangement'),

-- Meuble TV (Google Shopping ID: 443)
('Meuble TV', 'Meuble TV bas', '443', 'Meubles TV bas et consoles'),
('Meuble TV', 'Meuble TV suspendu', '443', 'Meubles TV muraux et suspendus'),
('Meuble TV', 'Meuble TV d''angle', '443', 'Meubles TV d''angle'),

-- Éclairage (Google Shopping ID: 594)
('Éclairage', 'Lampe de table', '594', 'Lampes de table et de chevet'),
('Éclairage', 'Lampadaire', '594', 'Lampadaires et éclairage sur pied'),
('Éclairage', 'Suspension', '594', 'Suspensions et lustres'),
('Éclairage', 'Applique', '594', 'Appliques murales'),

-- Décoration (Google Shopping ID: 696)
('Décoration', 'Miroir', '696', 'Miroirs décoratifs'),
('Décoration', 'Tapis', '696', 'Tapis et moquettes'),
('Décoration', 'Coussin', '696', 'Coussins et textiles déco'),
('Décoration', 'Vase', '696', 'Vases et objets déco'),

-- Extérieur (Google Shopping ID: 443)
('Extérieur', 'Salon de jardin', '443', 'Salons de jardin et mobilier extérieur'),
('Extérieur', 'Parasol', '443', 'Parasols et protection solaire'),
('Extérieur', 'Barbecue', '443', 'Barbecues et équipements extérieur')

ON CONFLICT DO NOTHING;

-- Créer les index de performance si ils n'existent pas
CREATE INDEX IF NOT EXISTS idx_products_enriched_category_type 
ON products_enriched (category, subcategory);

CREATE INDEX IF NOT EXISTS idx_products_enriched_attributes 
ON products_enriched (color, material, style, room);

CREATE INDEX IF NOT EXISTS idx_products_enriched_tags 
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

-- Index de recherche textuelle séparés (évite les fonctions complexes)
CREATE INDEX IF NOT EXISTS idx_products_enriched_title_search 
ON products_enriched USING gin(to_tsvector('french', title));

CREATE INDEX IF NOT EXISTS idx_products_enriched_description_search 
ON products_enriched USING gin(to_tsvector('french', description));

-- Index pour les tags
CREATE INDEX IF NOT EXISTS idx_products_enriched_tags_search 
ON products_enriched USING gin(tags);