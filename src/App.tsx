@@ .. @@
import { ThankYou } from './pages/ThankYou';
import { SuperAdmin } from './pages/SuperAdmin';
import { SellerRobotInterface } from './pages/SellerRobotInterface';
+import { APITest } from './pages/APITest';

interface Retailer {
@@ .. @@
      <Route path="/press" element={<Press />} />
      <Route path="/partnerships" element={<Partnerships />} />
      <Route path="/upload" element={<UploadPage />} />
+      <Route path="/testapi" element={<APITest />} />
    </Routes>
  );