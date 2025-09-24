@@ .. @@
     stock_quantity = NEW.stock_qty,
+    stock_quantity = COALESCE(NEW.stock_quantity, NEW.stock_qty),
     availability = CASE