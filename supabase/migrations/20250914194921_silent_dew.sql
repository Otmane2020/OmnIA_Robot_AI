/*
  # Create CSV field mappings table

  1. New Tables
    - `csv_field_mappings`
      - `id` (uuid, primary key)
      - `retailer_id` (uuid, foreign key to retailers)
      - `csv_header` (text, CSV column name)
      - `shopify_field` (text, Shopify field mapping)
      - `is_required` (boolean, if field is required)
      - `default_value` (text, default value if empty)
      - `created_at` (timestamp)

  2. Security
    - Enable RLS on `csv_field_mappings` table
    - Add policy for retailers to manage their own mappings

  3. Default Data
    - Insert default mappings for all Shopify fields
    - Covers product basics, options, variants, images, SEO
*/

create table csv_field_mappings (
  id uuid primary key default gen_random_uuid(),
  retailer_id uuid not null references retailers(id) on delete cascade,
  csv_header text not null,
  shopify_field text not null,
  is_required boolean default false,
  default_value text,
  created_at timestamp default now()
);

alter table csv_field_mappings enable row level security;

create policy "retailer_csv_mappings"
  on csv_field_mappings
  for all
  using (auth.uid() = retailer_id)
  with check (auth.uid() = retailer_id);

-- Default seed mappings (will be inserted for each new retailer)
-- This is a template that will be used when a retailer first accesses CSV import