-- Requête PostgreSQL corrigée
INSERT INTO products_enriched (
    stock_qty,
    stock_quantity,
    image_url
) VALUES (
    NEW.stock_qty,
    NEW.stock_quantity,
    NEW.image_url
);