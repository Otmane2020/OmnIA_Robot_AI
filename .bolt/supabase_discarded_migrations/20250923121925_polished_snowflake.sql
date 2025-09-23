/*
  # Fonction de synchronisation automatique catalogue vers produits enrichis

  1. Nouvelle fonction
    - `sync_catalog_to_enriched()` - Fonction trigger pour synchronisation automatique
    - Se déclenche sur INSERT/UPDATE de `product_catalog`
    - Met à jour ou crée automatiquement dans `products_enriched`

  2. Trigger
    - `trigger_catalog_sync` - Déclenche la synchronisation automatique
    - Activé sur INSERT et UPDATE de `product_catalog`

  3. Fonctionnalités
    - Synchronisation temps réel des données de base
    - Préservation des données enrichies existantes
    - Mise à jour des timestamps automatique
    - Gestion des erreurs avec logs
*/

-- Fonction de synchronisation automatique
CREATE OR REPLACE FUNCTION sync_catalog_to_enriched()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    enriched_exists boolean := false;
    percent_off_calc integer := 0;
BEGIN
    -- Vérifier si le produit enrichi existe déjà
    SELECT EXISTS(
        SELECT 1 FROM products_enriched 
        WHERE catalog_product_id = NEW.id
    ) INTO enriched_exists;

    -- Calculer le pourcentage de remise
    IF NEW.compare_at_price IS NOT NULL AND NEW.compare_at_price > NEW.price THEN
        percent_off_calc := round(((NEW.compare_at_price - NEW.price) / NEW.compare_at_price * 100)::numeric);
    END IF;

    IF enriched_exists THEN
        -- Mettre à jour le produit enrichi existant (préserver les données IA)
        UPDATE products_enriched SET
            title = NEW.name,
            description = COALESCE(NEW.description, ''),
            short_description = left(COALESCE(NEW.description, NEW.name), 160),
            price = NEW.price,
            compare_at_price = NEW.compare_at_price,
            stock_quantity = NEW.stock_quantity,
            stock_qty = NEW.stock_quantity,
            availability_status = CASE 
                WHEN NEW.stock_quantity > 0 THEN 'in_stock' 
                ELSE 'out_of_stock' 
            END,
            vendor = COALESCE(NEW.vendor, vendor),
            image_url = COALESCE(NEW.image_url, image_url),
            product_url = COALESCE(NEW.product_url, product_url),
            canonical_link = COALESCE(NEW.product_url, canonical_link),
            percent_off = percent_off_calc,
            updated_at = now()
        WHERE catalog_product_id = NEW.id;
        
        RAISE NOTICE 'Produit enrichi mis à jour: %', NEW.name;
    ELSE
        -- Créer un nouveau produit enrichi avec données de base
        INSERT INTO products_enriched (
            catalog_product_id,
            retailer_id,
            title,
            description,
            short_description,
            price,
            compare_at_price,
            currency,
            stock_quantity,
            stock_qty,
            availability_status,
            product_type,
            subcategory,
            brand,
            vendor,
            material,
            color,
            style,
            room,
            dimensions,
            weight,
            capacity,
            gtin,
            mpn,
            identifier_exists,
            image_url,
            additional_image_links,
            product_url,
            canonical_link,
            seo_title,
            seo_description,
            tags,
            percent_off,
            ai_confidence,
            enrichment_source,
            enrichment_version,
            last_enriched_at,
            created_at,
            updated_at
        ) VALUES (
            NEW.id,
            NEW.retailer_id,
            NEW.name,
            COALESCE(NEW.description, ''),
            left(COALESCE(NEW.description, NEW.name), 160),
            NEW.price,
            NEW.compare_at_price,
            'EUR',
            NEW.stock_quantity,
            NEW.stock_quantity,
            CASE WHEN NEW.stock_quantity > 0 THEN 'in_stock' ELSE 'out_of_stock' END,
            COALESCE(NEW.category, 'Mobilier'),
            '', -- subcategory vide, sera enrichi par IA
            COALESCE(NEW.vendor, 'Boutique'),
            COALESCE(NEW.vendor, 'Boutique'),
            '', -- material vide, sera enrichi par IA
            '', -- color vide, sera enrichi par IA
            'Moderne', -- style par défaut
            'Salon', -- room par défaut
            '', -- dimensions vides, seront enrichies par IA
            '', -- weight vide, sera enrichi par IA
            '', -- capacity vide, sera enrichi par IA
            '', -- gtin vide, sera enrichi par IA
            '', -- mpn vide, sera enrichi par IA
            false, -- identifier_exists par défaut
            COALESCE(NEW.image_url, 'https://images.pexels.com/photos/1350789/pexels-photo-1350789.jpeg'),
            '{}', -- additional_image_links vide
            COALESCE(NEW.product_url, '#'),
            COALESCE(NEW.product_url, '#'),
            NEW.name, -- seo_title basique
            format('Découvrez %s dans notre collection. Qualité premium et livraison gratuite.', NEW.name), -- seo_description basique
            ARRAY[COALESCE(NEW.category, 'mobilier')], -- tags basiques
            percent_off_calc,
            0.3, -- ai_confidence faible car pas encore enrichi par IA
            'catalog_sync', -- source de l'enrichissement
            '1.0',
            now(),
            now(),
            now()
        );
        
        RAISE NOTICE 'Nouveau produit enrichi créé: %', NEW.name;
    END IF;

    -- Ajouter à la queue d'enrichissement IA pour améliorer les données
    INSERT INTO enrichment_queue (
        catalog_product_id,
        retailer_id,
        operation_type,
        priority,
        status
    ) VALUES (
        NEW.id,
        NEW.retailer_id,
        TG_OP,
        6, -- Priorité moyenne pour sync automatique
        'pending'
    ) ON CONFLICT DO NOTHING; -- Éviter les doublons

    RETURN NEW;

EXCEPTION
    WHEN OTHERS THEN
        -- Logger l'erreur mais ne pas faire échouer l'opération principale
        RAISE WARNING 'Erreur synchronisation catalogue vers enrichi pour produit %: %', NEW.name, SQLERRM;
        
        -- Insérer un log d'erreur
        INSERT INTO enrichment_logs (
            catalog_product_id,
            retailer_id,
            operation_type,
            enrichment_status,
            error_message,
            error_details,
            created_at
        ) VALUES (
            NEW.id,
            NEW.retailer_id,
            TG_OP,
            'failed',
            SQLERRM,
            jsonb_build_object(
                'error_code', SQLSTATE,
                'error_context', 'sync_catalog_to_enriched',
                'product_name', NEW.name,
                'trigger_operation', TG_OP
            ),
            now()
        );
        
        RETURN NEW;
END;
$$;

-- Créer le trigger de synchronisation automatique
DROP TRIGGER IF EXISTS trigger_catalog_sync ON product_catalog;
CREATE TRIGGER trigger_catalog_sync
    AFTER INSERT OR UPDATE ON product_catalog
    FOR EACH ROW
    EXECUTE FUNCTION sync_catalog_to_enriched();

-- Fonction pour gérer la suppression (optionnelle)
CREATE OR REPLACE FUNCTION handle_catalog_deletion()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    -- Supprimer le produit enrichi correspondant
    DELETE FROM products_enriched 
    WHERE catalog_product_id = OLD.id;
    
    -- Supprimer les éléments de la queue d'enrichissement
    DELETE FROM enrichment_queue 
    WHERE catalog_product_id = OLD.id;
    
    -- Logger la suppression
    INSERT INTO enrichment_logs (
        catalog_product_id,
        retailer_id,
        operation_type,
        enrichment_status,
        created_at
    ) VALUES (
        OLD.id,
        OLD.retailer_id,
        'DELETE',
        'success',
        now()
    );
    
    RAISE NOTICE 'Produit enrichi supprimé: %', OLD.name;
    
    RETURN OLD;
END;
$$;

-- Créer le trigger de suppression
DROP TRIGGER IF EXISTS trigger_catalog_deletion ON product_catalog;
CREATE TRIGGER trigger_catalog_deletion
    AFTER DELETE ON product_catalog
    FOR EACH ROW
    EXECUTE FUNCTION handle_catalog_deletion();

-- Fonction utilitaire pour synchroniser manuellement tous les produits existants
CREATE OR REPLACE FUNCTION sync_all_catalog_to_enriched(retailer_id_param text DEFAULT NULL)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    product_record record;
    processed_count integer := 0;
    error_count integer := 0;
    start_time timestamptz;
BEGIN
    start_time := clock_timestamp();
    
    -- Parcourir tous les produits du catalogue
    FOR product_record IN 
        SELECT * FROM product_catalog 
        WHERE (retailer_id_param IS NULL OR retailer_id = retailer_id_param)
        AND status = 'active'
        ORDER BY updated_at DESC
    LOOP
        BEGIN
            -- Déclencher la synchronisation pour chaque produit
            PERFORM sync_catalog_to_enriched() FROM (
                SELECT product_record.* 
            ) AS NEW;
            
            processed_count := processed_count + 1;
            
        EXCEPTION
            WHEN OTHERS THEN
                error_count := error_count + 1;
                RAISE WARNING 'Erreur sync produit %: %', product_record.name, SQLERRM;
        END;
    END LOOP;
    
    RETURN jsonb_build_object(
        'synchronized_products', processed_count,
        'errors', error_count,
        'execution_time_ms', EXTRACT(EPOCH FROM (clock_timestamp() - start_time)) * 1000,
        'message', format('Synchronisation terminée: %s produits traités', processed_count)
    );
END;
$$;

-- Commentaires pour documentation
COMMENT ON FUNCTION sync_catalog_to_enriched() IS 'Fonction trigger pour synchronisation automatique du catalogue vers les produits enrichis';
COMMENT ON FUNCTION handle_catalog_deletion() IS 'Fonction trigger pour gérer la suppression des produits enrichis lors de suppression du catalogue';
COMMENT ON FUNCTION sync_all_catalog_to_enriched(text) IS 'Fonction utilitaire pour synchroniser manuellement tous les produits du catalogue';

-- Index pour améliorer les performances de synchronisation
CREATE INDEX IF NOT EXISTS idx_products_enriched_catalog_id_lookup 
ON products_enriched(catalog_product_id);

CREATE INDEX IF NOT EXISTS idx_enrichment_queue_catalog_id_lookup 
ON enrichment_queue(catalog_product_id);

-- Vue pour monitoring de la synchronisation
CREATE OR REPLACE VIEW catalog_sync_monitoring AS
SELECT 
    pc.id as catalog_id,
    pc.retailer_id,
    pc.name as catalog_name,
    pc.category as catalog_category,
    pc.price as catalog_price,
    pc.stock_quantity as catalog_stock,
    pc.status as catalog_status,
    pc.updated_at as catalog_updated_at,
    pe.id as enriched_id,
    pe.title as enriched_title,
    pe.product_type as enriched_type,
    pe.ai_confidence,
    pe.enrichment_source,
    pe.last_enriched_at,
    pe.updated_at as enriched_updated_at,
    CASE 
        WHEN pe.id IS NULL THEN 'not_synced'
        WHEN pe.updated_at < pc.updated_at THEN 'needs_update'
        ELSE 'synced'
    END as sync_status,
    eq.status as queue_status,
    eq.retry_count
FROM product_catalog pc
LEFT JOIN products_enriched pe ON pc.id = pe.catalog_product_id
LEFT JOIN enrichment_queue eq ON pc.id = eq.catalog_product_id AND eq.status IN ('pending', 'processing')
ORDER BY pc.updated_at DESC;

COMMENT ON VIEW catalog_sync_monitoring IS 'Vue de monitoring pour suivre la synchronisation entre catalogue et produits enrichis';