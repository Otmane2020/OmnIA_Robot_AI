export const ResponsiveAdminWrapper: React.FC<ResponsiveAdminWrapperProps> = ({ onLogout }) => {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 1024); // lg breakpoint pour tablettes aussi
    };

    // Check initial size
    checkMobile();

    // Add event listener
    window.addEventListener('resize', checkMobile);

    // Cleanup
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Force mobile detection on small screens and tablets
  if (typeof window !== 'undefined' && window.innerWidth < 1024) {
    return <AdminMobileDashboard onLogout={onLogout} />;
  }

  // Desktop version (1024px+)
  return <AdminDashboard onLogout={onLogout} />;
};