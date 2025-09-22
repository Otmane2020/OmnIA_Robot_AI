import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { LandingPage } from './pages/LandingPage';
import { AdminLogin } from './pages/AdminLogin';
import { AdminDashboard } from './pages/AdminDashboard';
import { SuperAdmin } from './pages/SuperAdmin';
import { RegisterPage } from './pages/RegisterPage';
import { RobotInterface } from './pages/RobotInterface';
import { EcommerceDashboard } from './pages/EcommerceDashboard';
import { MarketingDashboard } from './pages/MarketingDashboard';
import { VisionStudio } from './pages/VisionStudio';
import { SEODashboard } from './pages/SEODashboard';
import { OmniaBotDashboard } from './pages/OmniaBotDashboard';
import { AnalyticsDashboard } from './pages/AnalyticsDashboard';

function App() {
  return (
    <Routes>
      <Route path="/" element={<LandingPage onGetStarted={() => window.location.href = '/register'} onLogin={() => window.location.href = '/admin'} />} />
      <Route path="/admin" element={<AdminLogin onLogin={() => window.location.href = '/dashboard'} onShowRegistration={() => window.location.href = '/register'} />} />
      <Route path="/dashboard" element={<AdminDashboard />} />
      <Route path="/superadmin" element={<SuperAdmin />} />
      <Route path="/register" element={<RegisterPage />} />
      <Route path="/robot" element={<RobotInterface />} />
      <Route path="/chat" element={<RobotInterface />} />
      <Route path="/ecommerce" element={<EcommerceDashboard />} />
      <Route path="/marketing" element={<MarketingDashboard />} />
      <Route path="/vision" element={<VisionStudio />} />
      <Route path="/seo" element={<SEODashboard />} />
      <Route path="/bot" element={<OmniaBotDashboard />} />
      <Route path="/analytics" element={<AnalyticsDashboard />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default App;