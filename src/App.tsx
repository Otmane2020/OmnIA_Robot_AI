import React, { useState, useEffect } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { LandingPage } from './pages/LandingPage';
import { RobotInterface } from './pages/RobotInterface';
import { ChatInterface } from './pages/ChatInterface';
import { AdminLogin } from './pages/AdminLogin';
import { AdminDashboard } from './pages/AdminDashboard';
import { SellerRegistration } from './pages/SellerRegistration';
import { About } from './pages/About';
import { Contact } from './pages/Contact';
import { Support } from './pages/Support';
import { Documentation } from './pages/Documentation';
import { Guides } from './pages/Guides';
import { Press } from './pages/Press';
import { Partnerships } from './pages/Partnerships';
import { UploadPage } from './pages/upload';
import { ThankYou } from './pages/ThankYou';
import { SuperAdmin } from './pages/SuperAdmin';
import { SellerRobotInterface } from './pages/SellerRobotInterface';
import { APITest } from './pages/APITest';

interface Retailer {
  id: string;
  company_name: string;
  subdomain: string;
  email: string;
}

function App() {
  const [currentRetailer, setCurrentRetailer] = useState<Retailer | null>(null);

  useEffect(() => {
    // Check if we're on a subdomain
    const hostname = window.location.hostname;
    const parts = hostname.split('.');
    
    if (parts.length > 2) {
      const subdomain = parts[0];
      // Mock retailer data - in production, fetch from API
      setCurrentRetailer({
        id: '1',
        company_name: subdomain,
        subdomain: subdomain,
        email: `contact@${subdomain}.com`
      });
    }
  }, []);

  return (
    <Routes>
      <Route path="/" element={<LandingPage />} />
      <Route path="/robot/:retailerId" element={<RobotInterface />} />
      <Route path="/chat/:retailerId" element={<ChatInterface />} />
      <Route path="/admin/login" element={<AdminLogin />} />
      <Route path="/admin/dashboard" element={<AdminDashboard />} />
      <Route path="/admin/super" element={<SuperAdmin />} />
      <Route path="/seller/register" element={<SellerRegistration />} />
      <Route path="/seller/robot" element={<SellerRobotInterface />} />
      <Route path="/about" element={<About />} />
      <Route path="/contact" element={<Contact />} />
      <Route path="/support" element={<Support />} />
      <Route path="/documentation" element={<Documentation />} />
      <Route path="/guides" element={<Guides />} />
      <Route path="/press" element={<Press />} />
      <Route path="/partnerships" element={<Partnerships />} />
      <Route path="/upload" element={<UploadPage />} />
      <Route path="/thank-you" element={<ThankYou />} />
      <Route path="/testapi" element={<APITest />} />
    </Routes>
  );
}

export default App;