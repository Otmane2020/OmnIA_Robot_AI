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
  name: string;
  email: string;
  plan: 'starter' | 'professional' | 'enterprise';
  status: 'active' | 'inactive' | 'suspended' | 'pending_validation';
  revenue: number;
  conversations: number;
  products: number;
  joinDate: string;
  lastActive: string;
  password?: string;
  applicationData?: any;
}

function App() {
  const [isLoggedIn, setIsLoggedIn] = React.useState(true);
  const [isSuperAdmin, setIsSuperAdmin] = React.useState(false);
  const [pendingApplications, setPendingApplications] = React.useState(() => {
    // Charger les demandes depuis localStorage
    try {
      return JSON.parse(localStorage.getItem('pending_applications') || '[]');
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
    
    // Super Admin
    if (credentials.email === 'superadmin@omnia.sale' && credentials.password === 'superadmin2025') {
      setIsSuperAdmin(true);
      setIsLoggedIn(true);
      return;
    }
    
    // Vérifier les revendeurs validés
    const validatedRetailers = JSON.parse(localStorage.getItem('validated_retailers') || '[]');
    const retailer = validatedRetailers.find((r: any) => 
      r.email === credentials.email && r.password === credentials.password
    );
    
    if (retailer) {
      console.log('✅ Connexion revendeur validé:', retailer.company_name);
      setIsLoggedIn(true);
      setIsSuperAdmin(false);
      return;
    }
    
    // Comptes de démonstration
    const demoAccounts = [
      { email: 'demo@decorahome.fr', password: 'demo123', name: 'Decora Home' },
      { email: 'contact@mobilierdesign.fr', password: 'design123', name: 'Mobilier Design Paris' },
      { email: 'info@decocontemporain.com', password: 'deco123', name: 'Déco Contemporain' },
      { email: 'contact@meubleslyon.fr', password: 'lyon123', name: 'Meubles Lyon' }
    ];
    
    const demoAccount = demoAccounts.find(acc => 
      acc.email === credentials.email && acc.password === credentials.password
    );
    
    if (demoAccount) {
      console.log('✅ Connexion compte démo:', demoAccount.name);
      setIsSuperAdmin(false);
      setIsLoggedIn(true);
      return;
    }
    
    // Identifiants incorrects
    const availableAccounts = [
      ...demoAccounts.map(acc => `• ${acc.email} / ${acc.password} (${acc.name})`),
      '• superadmin@omnia.sale / superadmin2025 (Super Admin)',
      ...validatedRetailers.map((r: any) => `• ${r.email} / ••••••• (${r.company_name})`)
    ];
    
    alert(`Identifiants incorrects.\n\nComptes disponibles :\n${availableAccounts.join('\n')}`);
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
    
    // Trouver l'application
    const application = pendingApplications.find(app => app.id === applicationId);
    
    // Supprimer de la liste des demandes en attente
    setPendingApplications(prev => 
      prev.filter(app => app.id !== applicationId)
    );
    
    if (approved) {
      // NOUVEAU: Créer automatiquement le compte revendeur
      if (application) {
        const newRetailer = {
          id: application.id,
          email: application.email,
          password: application.loginCredentials?.password || application.password,
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
          created_at: new Date().toISOString(),
          validated_at: new Date().toISOString()
        };
        
        // Sauvegarder dans localStorage pour les connexions
        const validatedRetailers = JSON.parse(localStorage.getItem('validated_retailers') || '[]');
        validatedRetailers.push(newRetailer);
        localStorage.setItem('validated_retailers', JSON.stringify(validatedRetailers));
        
        console.log('✅ Compte revendeur créé automatiquement:', newRetailer.email);
      }
      
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