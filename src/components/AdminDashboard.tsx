@@ .. @@
   const tabs = [
     { id: 'dashboard', label: 'Tableau de bord', icon: BarChart3 },
     { id: 'catalogue', label: 'Catalogue', icon: Database },
     { id: 'enriched', label: 'Catalogue Enrichi', icon: Brain },
+    { id: 'seo', label: 'SEO', icon: Search },
+    { id: 'google-ads', label: 'Google Ads', icon: Target },
+    { id: 'shop-page', label: 'Page Boutique', icon: Store },
     { id: 'integration', label: 'Intégration', icon: Globe },
     { id: 'ml-training', label: 'Entraînement IA', icon: Brain },
     { id: 'robot', label: 'Robot OmnIA', icon: Bot },
     { id: 'api-test', label: 'Test API', icon: Settings },
     { id: 'historique', label: 'Historique', icon: MessageSquare },
     { id: 'abonnement', label: 'Abonnement', icon: CreditCard },
     { id: 'settings', label: 'Paramètres', icon: Settings }
   ];
@@ .. @@
+  const renderSEO = () => (
+    <div className="space-y-8">
+      <div className="flex items-center justify-between">
+        <h2 className="text-2xl font-bold text-white">Optimisation SEO</h2>
+        <div className="flex items-center gap-2">
+          <div className="w-3 h-3 bg-green-400 rounded-full animate-pulse"></div>
+          <span className="text-green-300 text-sm">Analyse SEO active</span>
+        </div>
+      </div>
+      <SEOOptimizationTab retailerId={vendorId} />
+    </div>
+  );
+
+  const renderGoogleAds = () => (
+    <div className="space-y-8">
+      <div className="flex items-center justify-between">
+        <h2 className="text-2xl font-bold text-white">Google Ads</h2>
+        <div className="flex items-center gap-2">
+          <div className="w-3 h-3 bg-red-400 rounded-full animate-pulse"></div>
+          <span className="text-red-300 text-sm">Campagnes optimisées</span>
+        </div>
+      </div>
+      <GoogleAdsTab retailerId={vendorId} />
+    </div>
+  );
+
+  const renderShopPage = () => (
+    <div className="space-y-8">
+      <div className="flex items-center justify-between">
+        <h2 className="text-2xl font-bold text-white">Page Boutique</h2>
+        <div className="flex items-center gap-2">
+          <div className="w-3 h-3 bg-blue-400 rounded-full animate-pulse"></div>
+          <span className="text-blue-300 text-sm">Boutique en ligne</span>
+        </div>
+      </div>
+      <ShopPageBuilder 
+        retailerId={vendorId} 
+        companyName={companyName}
+        subdomain={companyName?.toLowerCase().replace(/[^a-z0-9]/g, '-')}
+      />
+    </div>
+  );
+
   const renderMLTraining = () => (
     <div className="space-y-8">
       <div className="flex items-center justify-between">
         <h2 className="text-2xl font-bold text-white">Entraînement IA</h2>
         <div className="flex items-center gap-2">
           <div className="w-3 h-3 bg-purple-400 rounded-full animate-pulse"></div>
-          <span className="text-purple-300 text-sm">IA en apprentissage</span>
+          <span className="text-purple-300 text-sm">Smart AI actif</span>
         </div>
       </div>
-      <MLTrainingTab vendorId={vendorId} />
+      <SmartAIEnrichmentTab retailerId={vendorId} />
     </div>
   );
@@ .. @@
         case 'catalogue':
           return renderCatalogue();
         case 'enriched':
           return renderEnriched();
+        case 'seo':
+          return renderSEO();
+        case 'google-ads':
+          return renderGoogleAds();
+        case 'shop-page':
+          return renderShopPage();
         case 'integration':
           return renderIntegration();
         case 'ml-training':
           return renderMLTraining();
         case 'robot':
           return renderRobot();
         case 'api-test':
           return renderAPITest();
         case 'historique':
           return renderHistorique();
         case 'abonnement':
           return renderAbonnement();
         case 'settings':
           return renderSettings();
         default:
           return renderDashboard();
       }
     };
@@ .. @@