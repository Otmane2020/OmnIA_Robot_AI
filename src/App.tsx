import React from 'react';
import { Routes, Route } from 'react-router-dom';
import { LandingPage } from './pages/LandingPage';
import { AdminLogin } from './pages/AdminLogin';
import { AdminDashboard } from './pages/AdminDashboard';
import { SuperAdmin } from './pages/SuperAdmin';
import { SellerRegistration } from './pages/SellerRegistration';
import { About } from './pages/About';
import { Contact } from './pages/Contact';
import { Support } from './pages/Support';
import { Documentation } from './pages/Documentation';
import { Guides } from './pages/Guides';
import { Press } from './pages/Press';
import { Partnerships } from './pages/Partnerships';
import { VoiceChatInterface } from './components/VoiceChatInterface';
import { UploadPage } from './pages/upload';
import { RobotInterface } from './pages/RobotInterface';
import { ChatInterface } from './pages/ChatInterface';

interface Retailer {
  id: string;
  company_name: string;
  email: string;
  subdomain: string;
  plan: 'starter' | 'professional' | 'enterprise';
  status: 'active' | 'inactive' | 'suspended' | 'pending_validation';
  contact_name: string;
  phone?: string;
  address?: string;
  city?: string;
  postal_code?: string;
  siret?: string;
  position?: string;
  password?: string;
  created_at: string;
  validated_at?: string;
}

interface Vendor {
  id: string;
  company_name: string;
  email: string;
  subdomain: string;
  plan: 'starter' | 'professional' | 'enterprise';
  status: 'active' | 'inactive' | 'suspended' | 'pending_validation';
  contact_name: string;
  phone?: string;
  address?: string;
  city?: string;
  postal_code?: string;
  siret?: string;
  position?: string;
  password?: string;
  created_at: string;
  validated_at?: string;
}

function App() {
  const [isLoggedIn, setIsLoggedIn] = React.useState(true);
  const [isSuperAdmin, setIsSuperAdmin] = React.useState(false);
  const [currentVendor, setCurrentVendor] = React.useState<Vendor | null>(null);
  const [pendingApplications, setPendingApplications] = React.useState(() => {
    // Charger les demandes depuis localStorage
    try {
      const saved = localStorage.getItem('pending_applications');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  // Sauvegarder les demandes dans localStorage à chaque changement
  React.useEffect(() => {
    localStorage.setItem('pending_applications', JSON.stringify(pendingApplications));
  }, [pendingApplications]);

  const handleLogin = (credentials: { email: string; password: string }) => {
    console.log('Login attempt:', credentials);
    
    // Définir les vendeurs de test
    const testVendors: Vendor[] = [
      {
        id: '550e8400-e29b-41d4-a716-446655440001',
        email: 'demo@decorahome.fr',
        company_name: 'Decora Home',
        subdomain: 'decorahome',
        plan: 'professional',
        status: 'active',
        contact_name: 'Marie Dubois',
        phone: '+33 1 23 45 67 89',
        address: '123 Rue de la Paix',
        city: 'Paris',
        postal_code: '75001',
        siret: '12345678901234',
        position: 'Directrice',
        created_at: '2024-01-15T10:00:00Z',
        validated_at: '2024-01-15T12:00:00Z'
      },
      {
        id: '550e8400-e29b-41d4-a716-446655440002',
        email: 'contact@mobilierdesign.fr',
        company_name: 'Mobilier Design Paris',
        subdomain: 'mobilierdesign',
        plan: 'professional',
        status: 'active',
        contact_name: 'Jean Martin',
        phone: '+33 1 23 45 67 90',
        created_at: '2024-02-10T14:00:00Z',
        validated_at: '2024-02-10T16:00:00Z'
      },
      {
        id: '550e8400-e29b-41d4-a716-446655440003',
        email: 'info@decocontemporain.com',
        company_name: 'Déco Contemporain',
        subdomain: 'decocontemporain',
        plan: 'starter',
        status: 'active',
        contact_name: 'Sophie Laurent',
        created_at: '2024-03-05T09:00:00Z',
        validated_at: '2024-03-05T11:00:00Z'
      },
      {
        id: '550e8400-e29b-41d4-a716-446655440004',
        email: 'contact@meubleslyon.fr',
        company_name: 'Meubles Lyon',
        subdomain: 'meubleslyon',
        plan: 'enterprise',
        status: 'active',
        contact_name: 'Thomas Leroy',
        created_at: '2024-04-20T16:00:00Z',
        validated_at: '2024-04-20T18:00:00Z'
      }
    ];

    // Super Admin
    if (credentials.email === 'superadmin@omnia.sale' && credentials.password === 'superadmin2025') {
      setIsSuperAdmin(true);
      setIsLoggedIn(true);
      setCurrentVendor(null);
    }
    else {
      // Vérifier si c'est un vendeur
      const vendor = testVendors.find(v => v.email === credentials.email);
      const validPasswords = ['demo123', 'design123', 'deco123', 'lyon123'];
      
      if (vendor && validPasswords.includes(credentials.password)) {
        setIsSuperAdmin(false);
        setIsLoggedIn(true);
        setCurrentVendor(vendor);
        console.log('✅ Connexion vendeur:', vendor.company_name);
      } else {
        alert('Identifiants incorrects.\n\nComptes disponibles :\n• demo@decorahome.fr / demo123\n• contact@mobilierdesign.fr / design123\n• info@decocontemporain.com / deco123\n• contact@meubleslyon.fr / lyon123\n• superadmin@omnia.sale / superadmin2025');
      }
    }
  };

  const handleLogout = () => {
    setIsLoggedIn(false);
    setIsSuperAdmin(false);
    setCurrentVendor(null);
  };

  const handleGetStarted = () => {
    window.location.href = '/register';
  };

  const handleShowLogin = () => {
    window.location.href = '/admin';
  };

  const handleValidateApplication = (applicationId: string, approved: boolean) => {
    console.log('🔄 Validation application:', applicationId, approved ? 'APPROUVÉE' : 'REJETÉE');
    
    // Supprimer de la liste des demandes en attente
    setPendingApplications(prev => 
      prev.filter(app => app.id !== applicationId)
    );
    
    if (approved) {
      console.log('📧 Email d\'approbation envoyé');
      console.log('🌐 Sous-domaine créé');
      console.log('🔑 Identifiants de connexion communiqués');
    } else {
      console.log('📧 Email de rejet envoyé');
      console.log('📋 Demande d\'informations complémentaires');
    }
  };

  const handleRegistrationSubmit = (applicationData: any) => {
    // Ajouter heure et date de création
    const newApplication = {
      ...applicationData,
      id: Date.now().toString(),
      submittedAt: new Date().toISOString(),
      submittedDate: new Date().toLocaleDateString('fr-FR'),
      submittedTime: new Date().toLocaleTimeString('fr-FR'),
      status: 'pending',
      proposedSubdomain: applicationData.companyName.toLowerCase().replace(/[^a-z0-9]/g, '').substring(0, 20)
    };
    
    setPendingApplications(prev => [...prev, newApplication]);
    
    console.log('✅ Nouvelle demande reçue:', newApplication.companyName);
    console.log('📧 Email de confirmation automatique envoyé à:', newApplication.email);
    console.log('📧 Email notification admin envoyé à: admin@omnia.sale');
  };

  return (
    <Routes>
      <Route path="/" element={
        <LandingPage 
          onGetStarted={handleGetStarted}
          onLogin={handleShowLogin}
        />
      } />
      
      <Route path="/chat" element={<ChatInterface />} />
      <Route path="/robot" element={<RobotInterface />} />
      
      <Route path="/admin" element={
        isLoggedIn ? (
          isSuperAdmin ? (
            <SuperAdmin 
              onLogout={handleLogout}
              pendingApplications={pendingApplications}
              onValidateApplication={handleValidateApplication}
            />
          ) : (
            <AdminDashboard 
              onLogout={handleLogout}
              currentVendor={currentVendor}
            />
          )
        ) : (
          <AdminLogin 
            onLogin={handleLogin}
            onShowRegistration={() => window.location.href = '/register'}
          />
        )
      } />
      
      <Route path="/register" element={
        <SellerRegistration 
          onSubmit={handleRegistrationSubmit}
          onBack={() => window.location.href = '/'}
        />
      } />
      
      <Route path="/about" element={<About />} />
      <Route path="/contact" element={<Contact />} />
      <Route path="/support" element={<Support />} />
      <Route path="/documentation" element={<Documentation />} />
      <Route path="/guides" element={<Guides />} />
      <Route path="/press" element={<Press />} />
      <Route path="/partnerships" element={<Partnerships />} />
      <Route path="/upload" element={<UploadPage />} />
    </Routes>
  );
}

export default App;
      setIsSuperAdmin(false);
      setIsLoggedIn(true);
    }
    else {
      alert('Identifiants incorrects.\n\nComptes disponibles :\n• demo@decorahome.fr / demo123\n• contact@mobilierdesign.fr / design123\n• info@decocontemporain.com / deco123\n• contact@meubleslyon.fr / lyon123\n• superadmin@omnia.sale / superadmin2025');
    }
  };

  const handleLogout = () => {
    setIsLoggedIn(false);
    setIsSuperAdmin(false);
  };

  const handleGetStarted = () => {
    window.location.href = '/register';
  };

  const handleShowLogin = () => {
    window.location.href = '/admin';
  };

  const handleValidateApplication = (applicationId: string, approved: boolean) => {
    console.log('🔄 Validation application:', applicationId, approved ? 'APPROUVÉE' : 'REJETÉE');
    
    // Supprimer de la liste des demandes en attente
    setPendingApplications(prev => 
      prev.filter(app => app.id !== applicationId)
    );
    
    if (approved) {
      console.log('📧 Email d\'approbation envoyé');
      console.log('🌐 Sous-domaine créé');
      console.log('🔑 Identifiants de connexion communiqués');
    } else {
      console.log('📧 Email de rejet envoyé');
      console.log('📋 Demande d\'informations complémentaires');
    }
  };

  const handleRegistrationSubmit = (applicationData: any) => {
    // Ajouter heure et date de création
    const newApplication = {
      ...applicationData,
      id: Date.now().toString(),
      submittedAt: new Date().toISOString(),
      submittedDate: new Date().toLocaleDateString('fr-FR'),
      submittedTime: new Date().toLocaleTimeString('fr-FR'),
      status: 'pending',
      proposedSubdomain: applicationData.companyName.toLowerCase().replace(/[^a-z0-9]/g, '').substring(0, 20)
    };
    
    setPendingApplications(prev => [...prev, newApplication]);
    
    console.log('✅ Nouvelle demande reçue:', newApplication.companyName);
    console.log('📧 Email de confirmation automatique envoyé à:', newApplication.email);
    console.log('📧 Email notification admin envoyé à: admin@omnia.sale');
  };

  return (
    <Routes>
      <Route path="/" element={
        <LandingPage 
          onGetStarted={handleGetStarted}
          onLogin={handleShowLogin}
        />
      } />
      
      <Route path="/chat" element={<ChatInterface />} />
      <Route path="/chat" element={<RobotInterface />} />
      
      <Route path="/admin" element={
        isLoggedIn ? (
          isSuperAdmin ? (
            <SuperAdmin 
              onLogout={handleLogout}
              pendingApplications={pendingApplications}
              onValidateApplication={handleValidateApplication}
            />
          ) : (
            <AdminDashboard onLogout={handleLogout} />
          )
        ) : (
          <AdminLogin 
            onLogin={handleLogin}
            onShowRegistration={() => window.location.href = '/register'}
          />
        )
      } />
      
      <Route path="/register" element={
        <SellerRegistration 
          onSubmit={handleRegistrationSubmit}
          onBack={() => window.location.href = '/'}
        />
      } />
      
      <Route path="/about" element={<About />} />
      <Route path="/contact" element={<Contact />} />
      <Route path="/support" element={<Support />} />
      <Route path="/documentation" element={<Documentation />} />
      <Route path="/guides" element={<Guides />} />
      <Route path="/press" element={<Press />} />
      <Route path="/partnerships" element={<Partnerships />} />
      <Route path="/robot" element={<RobotInterface />} />
    </Routes>
  );
}

export default App;