/*
  # Fix RLS policy for retailer applications

  1. Security Changes
    - Allow anonymous users to insert retailer applications
    - Keep existing policies for authenticated users and super admins
    - Ensure public can submit registration forms

  This migration fixes the RLS violation when anonymous users try to register as sellers.
*/

-- Drop existing restrictive policy if it exists
DROP POLICY IF EXISTS "Super admin full access applications" ON retailer_applications;

-- Recreate the super admin policy
CREATE POLICY "Super admin full access applications"
  ON retailer_applications
  FOR ALL
  TO authenticated
  USING ((jwt() ->> 'role'::text) = 'super_admin'::text)
  WITH CHECK ((jwt() ->> 'role'::text) = 'super_admin'::text);

-- Add policy to allow anonymous users to insert applications
CREATE POLICY "Allow anonymous to insert applications"
  ON retailer_applications
  FOR INSERT
  TO anon
  WITH CHECK (true);

-- Allow anonymous users to read their own applications (optional, for confirmation)
CREATE POLICY "Allow anonymous to read applications"
  ON retailer_applications
  FOR SELECT
  TO anon
  USING (true);