/*
  # Table de mapping des catégories Google Shopping

  1. Nouvelle table
    - `google_categories_mapping`
      - `id` (uuid, primary key)
      - `category` (text) - Catégorie principale
      - `subcategory` (text) - Sous-catégorie
      - `google_product_category` (text) - Code Google Shopping
      - `description` (text) - Description
      - `created_at` (timestamp)

  2. Sécurité
    - Enable RLS sur `google_categories_mapping`
    - Politique de lecture pour tous les utilisateurs authentifiés
    - Politique d'écriture pour les super admins uniquement

  3. Données initiales
    - Import des catégories mobilier avec codes Google Shopping
*/

CREATE TABLE IF NOT EXISTS google_categories_mapping (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  category text NOT NULL,
  subcategory text NOT NULL,
  google_product_category text NOT NULL,
  description text DEFAULT '',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE google_categories_mapping ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read google categories"
  ON google_categories_mapping
  FOR SELECT
  TO authenticated, anon
  USING (true);

CREATE POLICY "Super admin can manage google categories"
  ON google_categories_mapping
  FOR ALL
  TO authenticated
  USING ((jwt() ->> 'role'::text) = 'super_admin'::text)
  WITH CHECK ((jwt() ->> 'role'::text) = 'super_admin'::text);

-- Insertion des données de mapping mobilier
INSERT INTO google_categories_mapping (category, subcategory, google_product_category, description) VALUES
-- Canapés et sièges
('Canapé', 'Canapé fixe', '635', 'Canapés fixes et droits'),
('Canapé', 'Canapé d''angle', '635', 'Canapés d''angle et modulaires'),
('Canapé', 'Canapé convertible', '635', 'Canapés-lits et convertibles'),
('Canapé', 'Canapé-lit', '635', 'Canapés avec fonction couchage'),

-- Chaises et fauteuils
('Chaise', 'Chaise de salle à manger', '436', 'Chaises pour salle à manger'),
('Chaise', 'Chaise de bureau', '436', 'Chaises et fauteuils de bureau'),
('Chaise', 'Fauteuil', '436', 'Fauteuils et sièges d''appoint'),
('Chaise', 'Tabouret', '436', 'Tabourets et sièges hauts'),
('Chaise', 'Tabouret de bar', '436', 'Tabourets de bar et comptoir'),

-- Tables
('Table', 'Table à manger', '443', 'Tables de salle à manger'),
('Table', 'Table basse', '443', 'Tables basses et tables de salon'),
('Table', 'Table de bureau', '443', 'Tables et bureaux de travail'),
('Table', 'Console', '443', 'Consoles et tables d''appoint'),
('Table', 'Table de chevet', '443', 'Tables de nuit et chevets'),

-- Lits et matelas
('Lit', 'Lit simple', '630', 'Lits simples et 1 place'),
('Lit', 'Lit double', '630', 'Lits doubles et 2 places'),
('Lit', 'Lit king size', '630', 'Lits king size et très grands'),
('Lit', 'Matelas', '630', 'Matelas et sommiers'),
('Lit', 'Tête de lit', '630', 'Têtes de lit et accessoires'),

-- Rangement
('Rangement', 'Armoire', '443', 'Armoires et penderies'),
('Rangement', 'Commode', '443', 'Commodes et chiffonniers'),
('Rangement', 'Bibliothèque', '443', 'Bibliothèques et étagères'),
('Rangement', 'Meuble TV', '443', 'Meubles TV et supports'),
('Rangement', 'Vitrine', '443', 'Vitrines et vaisselliers'),

-- Éclairage
('Éclairage', 'Lampe de table', '594', 'Lampes de table et de chevet'),
('Éclairage', 'Lampadaire', '594', 'Lampadaires et éclairage sur pied'),
('Éclairage', 'Suspension', '594', 'Suspensions et lustres'),
('Éclairage', 'Applique', '594', 'Appliques murales'),

-- Décoration
('Décoration', 'Miroir', '696', 'Miroirs décoratifs'),
('Décoration', 'Tapis', '696', 'Tapis et moquettes'),
('Décoration', 'Coussin', '696', 'Coussins et textiles'),
('Décoration', 'Rideau', '696', 'Rideaux et voilages'),

-- Mobilier extérieur
('Extérieur', 'Salon de jardin', '985', 'Salons de jardin complets'),
('Extérieur', 'Chaise de jardin', '985', 'Chaises et fauteuils d''extérieur'),
('Extérieur', 'Table de jardin', '985', 'Tables d''extérieur'),
('Extérieur', 'Parasol', '985', 'Parasols et protection solaire');