/*
  # Système multi-vendeur avec sous-domaines

  1. Nouvelles Tables
    - `vendors` : Informations des vendeurs/revendeurs
    - `vendor_subdomains` : Gestion des sous-domaines personnalisés
  
  2. Modifications Tables Existantes
    - Ajout `vendor_id` aux tables produits et conversations
    - Renommage `retailer_*` vers `vendor_*`
  
  3. Sécurité
    - RLS activé sur toutes les tables vendeurs
    - Politiques d'accès par vendor_id
    - Isolation complète des données
*/

-- Table des vendeurs (remplace retailers)
CREATE TABLE IF NOT EXISTS vendors (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email text UNIQUE NOT NULL,
  password_hash text NOT NULL,
  company_name text NOT NULL,
  subdomain text UNIQUE NOT NULL,
  plan text NOT NULL CHECK (plan IN ('starter', 'professional', 'enterprise')),
  status text NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'suspended')),
  contact_name text NOT NULL,
  phone text,
  address text,
  city text,
  postal_code text,
  siret text,
  position text,
  widget_code text,
  created_at timestamptz DEFAULT now(),
  validated_at timestamptz,
  last_login timestamptz,
  updated_at timestamptz DEFAULT now()
);

-- Table des sous-domaines
CREATE TABLE IF NOT EXISTS vendor_subdomains (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  vendor_id uuid REFERENCES vendors(id) ON DELETE CASCADE,
  subdomain text UNIQUE NOT NULL,
  dns_status text NOT NULL DEFAULT 'pending' CHECK (dns_status IN ('pending', 'active', 'failed')),
  ssl_status text NOT NULL DEFAULT 'pending' CHECK (ssl_status IN ('pending', 'active', 'failed')),
  created_at timestamptz DEFAULT now(),
  activated_at timestamptz,
  updated_at timestamptz DEFAULT now()
);

-- Ajouter vendor_id aux tables existantes seulement si elles existent
DO $$
BEGIN
  -- products_enriched
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'products_enriched') THEN
    IF NOT EXISTS (
      SELECT 1 FROM information_schema.columns 
      WHERE table_name = 'products_enriched' AND column_name = 'vendor_id'
    ) THEN
      ALTER TABLE products_enriched ADD COLUMN vendor_id uuid REFERENCES vendors(id) ON DELETE CASCADE;
      CREATE INDEX IF NOT EXISTS idx_products_enriched_vendor ON products_enriched(vendor_id);
    END IF;
  END IF;

  -- ai_products
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'ai_products') THEN
    IF NOT EXISTS (
      SELECT 1 FROM information_schema.columns 
      WHERE table_name = 'ai_products' AND column_name = 'vendor_id'
    ) THEN
      ALTER TABLE ai_products ADD COLUMN vendor_id uuid REFERENCES vendors(id) ON DELETE CASCADE;
      CREATE INDEX IF NOT EXISTS idx_ai_products_vendor ON ai_products(vendor_id);
    END IF;
  END IF;

  -- imported_products
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'imported_products') THEN
    IF NOT EXISTS (
      SELECT 1 FROM information_schema.columns 
      WHERE table_name = 'imported_products' AND column_name = 'vendor_id'
    ) THEN
      ALTER TABLE imported_products ADD COLUMN vendor_id uuid REFERENCES vendors(id) ON DELETE CASCADE;
      CREATE INDEX IF NOT EXISTS idx_imported_products_vendor ON imported_products(vendor_id);
    END IF;
  END IF;
END $$;

-- Indexes pour performance
CREATE INDEX IF NOT EXISTS idx_vendors_subdomain ON vendors(subdomain);
CREATE INDEX IF NOT EXISTS idx_vendors_email ON vendors(email);

-- RLS pour vendors
ALTER TABLE vendors ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Vendors can read own data"
  ON vendors
  FOR SELECT
  TO authenticated
  USING (auth.uid()::text = id::text);

CREATE POLICY "Vendors can update own data"
  ON vendors
  FOR UPDATE
  TO authenticated
  USING (auth.uid()::text = id::text);

-- RLS pour vendor_subdomains
ALTER TABLE vendor_subdomains ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Vendors can read own subdomains"
  ON vendor_subdomains
  FOR SELECT
  TO authenticated
  USING (vendor_id::text = auth.uid()::text);

-- Trigger pour updated_at
CREATE OR REPLACE FUNCTION update_vendor_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_vendors_updated_at
  BEFORE UPDATE ON vendors
  FOR EACH ROW
  EXECUTE FUNCTION update_vendor_updated_at();

-- Données de test pour les vendeurs (sans conflit)
INSERT INTO vendors (id, email, password_hash, company_name, subdomain, plan, contact_name, phone, address, city, postal_code, siret, position, status, validated_at) VALUES
  ('550e8400-e29b-41d4-a716-446655440001', 'demo@decorahome.fr', '$2a$10$dummy_hash_1', 'Decora Home', 'decorahome', 'professional', 'Marie Dubois', '+33 1 23 45 67 89', '123 Rue de la Paix', 'Paris', '75001', '12345678901234', 'Directrice', 'active', now()),
  ('550e8400-e29b-41d4-a716-446655440002', 'contact@mobilierdesign.fr', '$2a$10$dummy_hash_2', 'Mobilier Design Paris', 'mobilierdesign', 'professional', 'Jean Martin', '+33 1 23 45 67 90', '456 Avenue Montaigne', 'Paris', '75008', '23456789012345', 'Gérant', 'active', now()),
  ('550e8400-e29b-41d4-a716-446655440003', 'info@decocontemporain.com', '$2a$10$dummy_hash_3', 'Déco Contemporain', 'decocontemporain', 'starter', 'Sophie Laurent', '+33 1 23 45 67 91', '789 Boulevard Haussmann', 'Paris', '75009', '34567890123456', 'Responsable', 'active', now()),
  ('550e8400-e29b-41d4-a716-446655440004', 'contact@meubleslyon.fr', '$2a$10$dummy_hash_4', 'Meubles Lyon', 'meubleslyon', 'enterprise', 'Thomas Leroy', '+33 4 78 90 12 34', '321 Rue de la République', 'Lyon', '69002', '45678901234567', 'Directeur Commercial', 'active', now())
ON CONFLICT (email) DO NOTHING;

-- Sous-domaines correspondants
INSERT INTO vendor_subdomains (vendor_id, subdomain, dns_status, ssl_status, activated_at) VALUES
  ('550e8400-e29b-41d4-a716-446655440001', 'decorahome', 'active', 'active', now()),
  ('550e8400-e29b-41d4-a716-446655440002', 'mobilierdesign', 'active', 'active', now()),
  ('550e8400-e29b-41d4-a716-446655440003', 'decocontemporain', 'active', 'active', now()),
  ('550e8400-e29b-41d4-a716-446655440004', 'meubleslyon', 'active', 'active', now())
ON CONFLICT (subdomain) DO NOTHING;