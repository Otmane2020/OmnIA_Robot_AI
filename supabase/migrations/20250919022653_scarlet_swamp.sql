/*
  # Fix trigger functions with proper NEW references

  1. Corrections
    - Fix update_retailer_updated_at function
    - Fix update_shopify_products_updated_at function  
    - Fix update_product_price_ranges function
    - Fix sync_to_products_enriched function
    - Proper NEW.column syntax in all triggers

  2. Security
    - Maintain existing RLS policies
    - Keep all existing constraints
*/

-- Fix update_retailer_updated_at function
CREATE OR REPLACE FUNCTION update_retailer_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Fix update_shopify_products_updated_at function  
CREATE OR REPLACE FUNCTION update_shopify_products_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Fix update_product_price_ranges function
CREATE OR REPLACE FUNCTION update_product_price_ranges()
RETURNS TRIGGER AS $$
BEGIN
    -- Update price ranges for the product
    UPDATE products 
    SET 
        price_min = (
            SELECT MIN(price) 
            FROM variants 
            WHERE product_id = COALESCE(NEW.product_id, OLD.product_id)
        ),
        price_max = (
            SELECT MAX(price) 
            FROM variants 
            WHERE product_id = COALESCE(NEW.product_id, OLD.product_id)
        ),
        compare_at_price_min = (
            SELECT MIN(compare_at_price) 
            FROM variants 
            WHERE product_id = COALESCE(NEW.product_id, OLD.product_id) 
            AND compare_at_price IS NOT NULL
        ),
        compare_at_price_max = (
            SELECT MAX(compare_at_price) 
            FROM variants 
            WHERE product_id = COALESCE(NEW.product_id, OLD.product_id) 
            AND compare_at_price IS NOT NULL
        ),
        updated_at = now()
    WHERE id = COALESCE(NEW.product_id, OLD.product_id);
    
    RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

-- Fix sync_to_products_enriched function
CREATE OR REPLACE FUNCTION sync_to_products_enriched()
RETURNS TRIGGER AS $$
BEGIN
    -- Only sync if product has stock and is active
    IF NEW.stock > 0 AND NEW.status = 'active' THEN
        INSERT INTO products_enriched (
            handle,
            title,
            description,
            category,
            type,
            color,
            material,
            fabric,
            style,
            dimensions,
            room,
            price,
            stock_quantity,
            image_url,
            product_url,
            seo_title,
            seo_description,
            ad_headline,
            ad_description,
            google_product_category,
            gtin,
            brand,
            confidence_score,
            enriched_at,
            enrichment_source
        )
        VALUES (
            COALESCE(NEW.id, NEW.external_id),
            NEW.name,
            COALESCE(NEW.description, ''),
            COALESCE(NEW.category, 'Mobilier'),
            COALESCE(NEW.category, 'Mobilier'),
            COALESCE((NEW.extracted_attributes->>'colors')::text, ''),
            COALESCE((NEW.extracted_attributes->>'materials')::text, ''),
            COALESCE((NEW.extracted_attributes->>'fabrics')::text, ''),
            COALESCE((NEW.extracted_attributes->>'styles')::text, ''),
            COALESCE((NEW.extracted_attributes->>'dimensions')::text, ''),
            COALESCE((NEW.extracted_attributes->>'room')::text, ''),
            COALESCE(NEW.price, 0),
            COALESCE(NEW.stock, 0),
            COALESCE(NEW.image_url, ''),
            COALESCE(NEW.product_url, ''),
            COALESCE(NEW.name, ''),
            COALESCE(NEW.description, ''),
            COALESCE(NEW.name, ''),
            COALESCE(NEW.description, ''),
            COALESCE((NEW.extracted_attributes->>'google_category')::text, ''),
            COALESCE((NEW.extracted_attributes->>'gtin')::text, ''),
            COALESCE(NEW.vendor, 'Boutique'),
            COALESCE(NEW.confidence_score, 0),
            now(),
            'auto_sync'
        )
        ON CONFLICT (handle) DO UPDATE SET
            title = EXCLUDED.title,
            description = EXCLUDED.description,
            category = EXCLUDED.category,
            type = EXCLUDED.type,
            color = EXCLUDED.color,
            material = EXCLUDED.material,
            fabric = EXCLUDED.fabric,
            style = EXCLUDED.style,
            dimensions = EXCLUDED.dimensions,
            room = EXCLUDED.room,
            price = EXCLUDED.price,
            stock_quantity = EXCLUDED.stock_quantity,
            image_url = EXCLUDED.image_url,
            product_url = EXCLUDED.product_url,
            confidence_score = EXCLUDED.confidence_score,
            enriched_at = now(),
            enrichment_source = 'auto_sync';
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Fix create_default_attributes_for_vendor function
CREATE OR REPLACE FUNCTION create_default_attributes_for_vendor()
RETURNS TRIGGER AS $$
BEGIN
    -- Create default color attribute
    INSERT INTO attributes (vendor_id, code, label, type, position)
    VALUES (NEW.id, 'color', 'Couleur', 'color', 1);
    
    -- Create default size attribute  
    INSERT INTO attributes (vendor_id, code, label, type, position)
    VALUES (NEW.id, 'size', 'Taille', 'size', 2);
    
    -- Create default material attribute
    INSERT INTO attributes (vendor_id, code, label, type, position) 
    VALUES (NEW.id, 'material', 'Matériau', 'material', 3);
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;