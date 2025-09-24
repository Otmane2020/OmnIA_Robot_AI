@@ .. @@
   stock_qty integer DEFAULT 0,
   image_url text DEFAULT '',
   product_url text DEFAULT '',
+  stock_quantity integer DEFAULT 0,
   created_at timestamptz DEFAULT now(),
   updated_at timestamptz DEFAULT now()
 );