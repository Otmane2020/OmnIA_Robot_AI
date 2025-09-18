/*
  # Create Google Shopping Categories mapping table

  1. New Tables
    - `google_categories`
      - `id` (uuid, primary key)
      - `category` (text) - Catégorie principale (ex: Canapé, Table, Chaise)
      - `subcategory` (text) - Sous-catégorie (ex: Canapé d'angle, Table basse)
      - `google_code` (text) - Code numérique Google Shopping (ex: 635, 443, 436)
      - `google_category` (text) - Taxonomie complète Google (ex: Furniture > Living Room Furniture > Sofas)
      - `description` (text) - Description de la catégorie
      - `is_active` (boolean) - Catégorie active
      - `created_at` (timestamp)
      - `updated_at` (timestamp)

  2. Security
    - Enable RLS on `google_categories` table
    - Add policy for public read access (tous les revendeurs)
    - Add policy for admin write access

  3. Data
    - Insert default Google Shopping categories mapping
    - Categories for furniture, home & garden, lighting
*/

CREATE TABLE IF NOT EXISTS google_categories (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  category text NOT NULL,
  subcategory text NOT NULL,
  google_code text NOT NULL,
  google_category text NOT NULL,
  description text DEFAULT '',
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE google_categories ENABLE ROW LEVEL SECURITY;

-- Politique de lecture publique (tous les revendeurs peuvent lire)
CREATE POLICY "Public read access for google categories"
  ON google_categories
  FOR SELECT
  TO public
  USING (is_active = true);

-- Politique d'écriture pour les admins
CREATE POLICY "Admin write access for google categories"
  ON google_categories
  FOR ALL
  TO authenticated
  USING (
    (jwt() ->> 'role'::text) = 'super_admin'::text OR
    (jwt() ->> 'email'::text) = 'admin@omnia.sale'::text
  );

-- Index pour performance
CREATE INDEX IF NOT EXISTS idx_google_categories_category ON google_categories(category);
CREATE INDEX IF NOT EXISTS idx_google_categories_code ON google_categories(google_code);
CREATE INDEX IF NOT EXISTS idx_google_categories_active ON google_categories(is_active);

-- Insérer les catégories par défaut
INSERT INTO google_categories (category, subcategory, google_code, google_category, description) VALUES
-- CANAPÉS ET SOFAS
('Canapé', 'Canapé fixe', '635', 'Furniture > Living Room Furniture > Sofas', 'Canapés droits et fixes'),
('Canapé', 'Canapé d''angle', '635', 'Furniture > Living Room Furniture > Sofas', 'Canapés d''angle et modulaires'),
('Canapé', 'Canapé convertible', '635', 'Furniture > Living Room Furniture > Sofas', 'Canapés-lits et convertibles'),
('Canapé', 'Banquette', '635', 'Furniture > Living Room Furniture > Sofas', 'Banquettes et méridienne'),

-- TABLES
('Table', 'Table à manger', '443', 'Furniture > Tables > Dining Tables', 'Tables de salle à manger'),
('Table', 'Table basse', '443', 'Furniture > Tables > Coffee Tables', 'Tables basses de salon'),
('Table', 'Console', '443', 'Furniture > Tables > Console Tables', 'Consoles et tables d''appoint'),
('Table', 'Bureau', '443', 'Furniture > Tables > Desks', 'Bureaux et tables de travail'),
('Table', 'Table de chevet', '443', 'Furniture > Tables > Nightstands', 'Tables de nuit'),

-- CHAISES ET FAUTEUILS
('Chaise', 'Chaise de salle à manger', '436', 'Furniture > Chairs > Dining Chairs', 'Chaises de repas'),
('Chaise', 'Chaise de bureau', '436', 'Furniture > Chairs > Office Chairs', 'Chaises de bureau ergonomiques'),
('Chaise', 'Fauteuil', '436', 'Furniture > Chairs > Armchairs', 'Fauteuils de salon'),
('Chaise', 'Tabouret', '436', 'Furniture > Chairs > Stools', 'Tabourets et tabourets de bar'),
('Chaise', 'Chaise longue', '436', 'Furniture > Chairs > Lounge Chairs', 'Chaises longues et relax'),

-- LITS ET CHAMBRE
('Lit', 'Lit double', '537', 'Furniture > Bedroom Furniture > Beds', 'Lits doubles et queen size'),
('Lit', 'Lit simple', '537', 'Furniture > Bedroom Furniture > Beds', 'Lits simples et enfant'),
('Lit', 'Tête de lit', '537', 'Furniture > Bedroom Furniture > Headboards', 'Têtes de lit'),
('Lit', 'Matelas', '4044', 'Furniture > Bedroom Furniture > Mattresses', 'Matelas et sommiers'),

-- RANGEMENT
('Rangement', 'Armoire', '6552', 'Furniture > Storage Furniture > Wardrobes', 'Armoires et dressings'),
('Rangement', 'Commode', '6552', 'Furniture > Storage Furniture > Dressers', 'Commodes et chiffonniers'),
('Rangement', 'Bibliothèque', '6552', 'Furniture > Storage Furniture > Bookcases', 'Bibliothèques et étagères'),
('Rangement', 'Vitrine', '6552', 'Furniture > Storage Furniture > Display Cases', 'Vitrines et vaisselier'),

-- MEUBLES TV ET MULTIMÉDIA
('Meuble TV', 'Meuble TV', '6330', 'Furniture > Entertainment Centers & TV Stands', 'Meubles TV et supports'),
('Meuble TV', 'Meuble hi-fi', '6330', 'Furniture > Entertainment Centers & TV Stands', 'Meubles audio et multimédia'),

-- DÉCORATION
('Décoration', 'Miroir', '594', 'Home & Garden > Decor > Mirrors', 'Miroirs décoratifs'),
('Décoration', 'Tableau', '594', 'Home & Garden > Decor > Artwork', 'Tableaux et œuvres d''art'),
('Décoration', 'Vase', '594', 'Home & Garden > Decor > Vases', 'Vases et objets déco'),
('Décoration', 'Coussin', '1985', 'Home & Garden > Decor > Throw Pillows', 'Coussins décoratifs'),

-- ÉCLAIRAGE
('Éclairage', 'Lampe de table', '594', 'Home & Garden > Lighting > Lamps', 'Lampes de table et chevet'),
('Éclairage', 'Lampadaire', '594', 'Home & Garden > Lighting > Lamps', 'Lampadaires et éclairage sur pied'),
('Éclairage', 'Suspension', '594', 'Home & Garden > Lighting > Ceiling Lights', 'Suspensions et plafonniers'),
('Éclairage', 'Applique', '594', 'Home & Garden > Lighting > Wall Sconces', 'Appliques murales'),

-- EXTÉRIEUR ET JARDIN
('Extérieur', 'Salon de jardin', '985', 'Home & Garden > Lawn & Garden > Outdoor Furniture', 'Mobilier de jardin'),
('Extérieur', 'Parasol', '985', 'Home & Garden > Lawn & Garden > Outdoor Umbrellas', 'Parasols et tonnelles'),

-- TEXTILES ET TAPIS
('Textile', 'Tapis', '2435', 'Home & Garden > Decor > Rugs', 'Tapis et carpettes'),
('Textile', 'Rideau', '1985', 'Home & Garden > Decor > Window Treatments', 'Rideaux et voilages'),
('Textile', 'Plaid', '1985', 'Home & Garden > Decor > Throws', 'Plaids et jetés de canapé')

ON CONFLICT (category, subcategory) DO NOTHING;

-- Trigger pour updated_at
CREATE OR REPLACE FUNCTION update_google_categories_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_google_categories_updated_at
  BEFORE UPDATE ON google_categories
  FOR EACH ROW
  EXECUTE FUNCTION update_google_categories_updated_at();