import React, { useState } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { LandingPage } from './pages/LandingPage';
import { EcommerceDashboard } from './pages/EcommerceDashboard';
import { MarketingDashboard } from './pages/MarketingDashboard';
import { VisionStudio } from './pages/VisionStudio';
import { SEODashboard } from './pages/SEODashboard';
import { OmniaBotDashboard } from './pages/OmniaBotDashboard';
import { AnalyticsDashboard } from './pages/AnalyticsDashboard';
import { AdminDashboard } from './pages/AdminDashboard';

function App() {
        <Route path="/ecommerce" element={<EcommerceDashboard />} />
        <Route path="/marketing" element={<MarketingDashboard />} />
        <Route path="/vision" element={<VisionStudio />} />
        <Route path="/seo" element={<SEODashboard />} />
        <Route path="/bot" element={<OmniaBotDashboard />} />
        <Route path="/analytics" element={<AnalyticsDashboard />} />
        <Route path="/admin" element={<AdminDashboard />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
}
export default App;