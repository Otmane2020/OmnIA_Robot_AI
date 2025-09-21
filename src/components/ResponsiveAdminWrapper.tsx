@@ .. @@
 export const ResponsiveAdminWrapper: React.FC<ResponsiveAdminWrapperProps> = ({ onLogout }) => {
   const [isMobile, setIsMobile] = useState(false);
 
   useEffect(() => {
     const checkMobile = () => {
-      setIsMobile(window.innerWidth < 768); // md breakpoint
+      setIsMobile(window.innerWidth < 1024); // lg breakpoint pour tablettes aussi
     };
 
     // Check initial size
@@ .. @@
   }, []);
 
-  // Force mobile detection on small screens
-  if (typeof window !== 'undefined' && window.innerWidth < 768) {
+  // Force mobile detection on small screens and tablets
+  if (typeof window !== 'undefined' && window.innerWidth < 1024) {
     return <AdminMobileDashboard onLogout={onLogout} />;
   }
 
-  // Desktop version
+  // Desktop version (1024px+)
   return <AdminDashboard onLogout={onLogout} />;
 };