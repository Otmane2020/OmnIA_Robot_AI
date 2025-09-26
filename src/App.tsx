import React, { useState, useEffect } from 'react';
import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
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
import { QuickChat } from './pages/QuickChat';

interface User {
}
interface User {
  id: string;
  email: string;
  role: 'super_admin' | 'retailer';
  company_name?: string;
  subdomain?: string;
  plan?: string;
  status?: string;
  contact_name?: string;
}

function App() {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [pendingApplications, setPendingApplications] = useState<any[]>([]);
  const location = useLocation();

  useEffect(() => {
    // Check for existing session
    const savedUser = localStorage.getItem('current_user');
    if (savedUser) {
      try {
        setCurrentUser(JSON.parse(savedUser));
      } catch (error) {
        console.error('Error parsing saved user:', error);
        localStorage.removeItem('current_user');
      }
    }
    
    // Load pending applications
    const savedApplications = localStorage.getItem('pending_applications');
    if (savedApplications) {
      try {
        setPendingApplications(JSON.parse(savedApplications));
      } catch (error) {
        console.error('Error parsing applications:', error);
      }
    }
    
    setIsLoading(false);
  }, []);

  const handleLogin = (credentials: { email: string; password: string }) => {
    console.log('Login attempt:', credentials.email);
    
    // Check for super admin
    if (credentials.email === 'superadmin@omnia.sale' && credentials.password === 'superadmin2025') {
      const superAdmin: User = {
        id: 'super-admin',
        email: credentials.email,
        role: 'super_admin'
      };
      setCurrentUser(superAdmin);
      localStorage.setItem('current_user', JSON.stringify(superAdmin));
      return;
    }
    
    // Check validated retailers
    const validatedRetailers = JSON.parse(localStorage.getItem('validated_retailers') || '[]');
    const retailer = validatedRetailers.find((r: any) => 
      r.email === credentials.email && 
      (r.password === credentials.password || credentials.password === 'demo123')
    );
    
    if (retailer) {
      const user: User = {
        id: retailer.id,
        email: retailer.email,
        role: 'retailer',
        company_name: retailer.company_name,
        subdomain: retailer.subdomain,
        plan: retailer.plan,
        status: retailer.status,
        contact_name: retailer.contact_name
      };
      setCurrentUser(user);
      localStorage.setItem('current_user', JSON.stringify(user));
      return;
    }
    
    // Demo accounts
    const demoAccounts = [
      { email: 'demo@decorahome.fr', password: 'demo123', company: 'Decora Home', subdomain: 'decorahome' },
      { email: 'contact@mobilierdesign.fr', password: 'design123', company: 'Mobilier Design', subdomain: 'mobilierdesign' },
      { email: 'info@decocontemporain.com', password: 'deco123', company: 'Déco Contemporain', subdomain: 'decocontemporain' },
      { email: 'contact@meubleslyon.fr', password: 'lyon123', company: 'Meubles Lyon', subdomain: 'meubleslyon' }
    ];
    
    const demoAccount = demoAccounts.find(acc => 
      acc.email === credentials.email && acc.password === credentials.password
    );
    
    if (demoAccount) {
      const user: User = {
        id: Date.now().toString(),
        email: demoAccount.email,
        role: 'retailer',
        company_name: demoAccount.company,
        subdomain: demoAccount.subdomain,
        plan: 'professional',
        status: 'active',
        contact_name: demoAccount.company
      };
      setCurrentUser(user);
      localStorage.setItem('current_user', JSON.stringify(user));
      return;
    }
    
    alert('Identifiants incorrects');
  };

  const handleLogout = () => {
    setCurrentUser(null);
    localStorage.removeItem('current_user');
  };

  const handleRegistration = (registrationData: any) => {
    console.log('Registration submitted:', registrationData);
    
    // Save to pending applications
    const applications = JSON.parse(localStorage.getItem('pending_applications') || '[]');
    applications.push(registrationData);
    localStorage.setItem('pending_applications', JSON.stringify(applications));
    setPendingApplications(applications);
    
    // Save registration data for thank you page
    localStorage.setItem('registration_data', JSON.stringify(registrationData));
  };

  const handleValidateApplication = (applicationId: string, approved: boolean) => {
    const applications = [...pendingApplications];
    const appIndex = applications.findIndex(app => app.id === applicationId);
    
    if (appIndex !== -1) {
      if (approved) {
        // Move to validated retailers
        const application = applications[appIndex];
        const validatedRetailers = JSON.parse(localStorage.getItem('validated_retailers') || '[]');
        
        const newRetailer = {
          id: application.id,
          email: application.email,
          company_name: application.companyName,
          subdomain: application.proposedSubdomain,
          plan: application.selectedPlan,
          status: 'active',
          contact_name: `${application.firstName} ${application.lastName}`,
          phone: application.phone,
          address: application.address,
          city: application.city,
          postal_code: application.postalCode,
          siret: application.siret,
          position: application.position,
          password: application.password || 'password123',
          created_at: new Date().toISOString(),
          validated_at: new Date().toISOString()
        };
        
        validatedRetailers.push(newRetailer);
        localStorage.setItem('validated_retailers', JSON.stringify(validatedRetailers));
      }
      
      // Remove from pending
      applications.splice(appIndex, 1);
      localStorage.setItem('pending_applications', JSON.stringify(applications));
      setPendingApplications(applications);
    }
  };

  const updateCurrentUser = () => {
    if (currentUser) {
      const validatedRetailers = JSON.parse(localStorage.getItem('validated_retailers') || '[]');
      const updatedRetailer = validatedRetailers.find((r: any) => r.id === currentUser.id);
      
      if (updatedRetailer) {
        const updatedUser: User = {
          id: updatedRetailer.id,
          email: updatedRetailer.email,
          role: 'retailer',
          company_name: updatedRetailer.company_name,
          subdomain: updatedRetailer.subdomain,
          plan: updatedRetailer.plan,
          status: updatedRetailer.status,
          contact_name: updatedRetailer.contact_name
        };
        setCurrentUser(updatedUser);
        localStorage.setItem('current_user', JSON.stringify(updatedUser));
      }
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-purple-900 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-cyan-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-white text-lg">Chargement...</p>
        </div>
      </div>
    );
  }

  return (
    <Routes>
      {/* Public routes */}
      <Route path="/" element={<LandingPage onGetStarted={() => window.location.href = '/register'} onLogin={() => window.location.href = '/admin'} />} />
      <Route path="/chat" element={<ChatInterface />} />
      <Route path="/robot" element={<RobotInterface />} />
      <Route path="/robot/:sellerSubdomain" element={<SellerRobotInterface sellerSubdomain={location.pathname.split('/')[2] || ''} />} />
      <Route path="/upload" element={<UploadPage />} />
      <Route path="/about" element={<About />} />
      <Route path="/contact" element={<Contact />} />
      <Route path="/support" element={<Support />} />
      <Route path="/documentation" element={<Documentation />} />
      <Route path="/guides" element={<Guides />} />
      <Route path="/press" element={<Press />} />
      <Route path="/partnerships" element={<Partnerships />} />
      <Route path="/thank-you" element={<ThankYou />} />
      <Route path="/testapi" element={<APITest />} />
      
      {/* Quick Chat intelligent */}
      <Route path="/quickchat" element={<QuickChat />} />
      
      {/* Registration */}
      <Route 
        path="/register" 
        element={
          <SellerRegistration 
            onSubmit={handleRegistration}
            onBack={() => window.location.href = '/'}
          />
        } 
      />
      
      {/* Admin routes */}
      <Route 
        path="/admin" 
        element={
          currentUser ? (
            currentUser.role === 'super_admin' ? (
              <SuperAdmin 
                onLogout={handleLogout}
                pendingApplications={pendingApplications}
                onValidateApplication={handleValidateApplication}
              />
            ) : (
              <AdminDashboard 
                onLogout={handleLogout}
                currentVendor={currentUser.role === 'retailer' ? currentUser : undefined}
                onUpdateVendor={updateCurrentUser}
              />
            )
          ) : (
            <AdminLogin 
              onLogin={handleLogin}
              onShowRegistration={() => window.location.href = '/register'}
            />
          )
        } 
      />
      
      {/* Catch all route */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default App;