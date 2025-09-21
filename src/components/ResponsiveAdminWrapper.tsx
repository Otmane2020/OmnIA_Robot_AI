import React, { useState, useEffect } from 'react';
import { AdminDashboard } from '../pages/AdminDashboard';
import { AdminMobileDashboard } from '../pages/AdminMobileDashboard';

interface ResponsiveAdminWrapperProps {
  onLogout: () => void;
}

export const ResponsiveAdminWrapper: React.FC<ResponsiveAdminWrapperProps> = ({ onLogout }) => {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768); // md breakpoint
    };

    // Check initial size
    checkMobile();

    // Listen for resize
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Force mobile detection on small screens
  if (typeof window !== 'undefined' && window.innerWidth < 768) {
    return <AdminMobileDashboard onLogout={onLogout} />;
  }

  // Desktop version
  return <AdminDashboard onLogout={onLogout} />;
};