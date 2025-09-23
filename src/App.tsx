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
    
    // Sauvegarder l'utilisateur connecté
    const saveCurrentUser = (userInfo: any) => {
      localStorage.setItem('current_logged_user', JSON.stringify(userInfo));
      console.log('✅ Utilisateur sauvegardé:', userInfo.email);
    };
    
    // Vérifier les revendeurs validés en localStorage
    const validatedRetailers = JSON.parse(localStorage.getItem('validated_retailers') || '[]');
    const validatedRetailer = validatedRetailers.find((retailer: any) => 
      retailer.email === credentials.email && retailer.password === credentials.password
    );
    
    if (validatedRetailer) {
      console.log('✅ Connexion revendeur validé:', validatedRetailer.company_name);
      saveCurrentUser(validatedRetailer);
      setIsSuperAdmin(false);
      setIsLoggedIn(true);
      return;
    }
    
    // Super Admin
    if (credentials.email === 'superadmin@omnia.sale' && credentials.password === 'superadmin2025') {
      setIsSuperAdmin(true);
      setIsLoggedIn(true);
      saveCurrentUser({ email: credentials.email, company_name: 'Super Admin', plan: 'Admin' });
    }
    // Decora Home - Boutique principale
    else if (credentials.email === 'demo@decorahome.fr' && credentials.password === 'demo123') {
      setIsLoggedIn(true);
      saveCurrentUser({ email: credentials.email, company_name: 'Decora Home', plan: 'Professional' });
    }
    // Mobilier Design Paris
    else if (credentials.email === 'contact@mobilierdesign.fr' && credentials.password === 'design123') {
      setIsSuperAdmin(false);
      setIsLoggedIn(true);
      saveCurrentUser({ email: credentials.email, company_name: 'Mobilier Design Paris', plan: 'Professional' });
    }
    // Déco Contemporain
    else if (credentials.email === 'info@decocontemporain.com' && credentials.password === 'deco123') {
      setIsSuperAdmin(false);
      setIsLoggedIn(true);
      saveCurrentUser({ email: credentials.email, company_name: 'Déco Contemporain', plan: 'Enterprise' });
    }
    // Meubles Lyon
    else if (credentials.email === 'contact@meubleslyon.fr' && credentials.password === 'lyon123') {
      setIsSuperAdmin(false);
      setIsLoggedIn(true);
      saveCurrentUser({ email: credentials.email, company_name: 'Meubles Lyon', plan: 'Starter' });
    }
    // Excel Formation
    else if (credentials.email === 'excelformation20@gmail.com' && credentials.password === 'excel123') {
      setIsSuperAdmin(false);
      setIsLoggedIn(true);
      saveCurrentUser({ email: credentials.email, company_name: 'Excel Formation', plan: 'Professional' });
    }
    else {
      alert('Identifiants incorrects.\n\nComptes disponibles :\n• demo@decorahome.fr / demo123\n• contact@mobilierdesign.fr / design123\n• info@decocontemporain.com / deco123\n• contact@meubleslyon.fr / lyon123\n• excelformation20@gmail.com / excel123\n• superadmin@omnia.sale / superadmin2025');
    }
  };

  const handleLogout = () => {
    setIsLoggedIn(false);
    setIsSuperAdmin(false);
    localStorage.removeItem('current_logged_user');
  };

  const handleGetStarted = () => {
    window.location.href = '/register';
  };

  const handleShowLogin = () => {
    window.location.href = '/admin';
  };

  const handleValidateApplication = (applicationId: string, approved: boolean) => {
    console.log('🔄 Validation application:', applicationId, approved ? 'APPROUVÉE' : 'REJETÉE');
    
    if (approved) {
      // Récupérer la demande
      const application = pendingApplications.find(app => app.id === applicationId);
      if (application) {
        // Créer le compte revendeur validé
        const validatedRetailer = {
          id: application.id,
          email: application.email,
          password: application.password || `omnia${Date.now().toString().slice(-4)}`,
          company_name: application.companyName,
          subdomain: application.proposedSubdomain,
          plan: application.selectedPlan,
          status: 'active',
          validated_at: new Date().toISOString(),
          first_name: application.firstName,
          last_name: application.lastName,
          phone: application.phone,
          address: application.address,
          city: application.city,
          postal_code: application.postalCode,
          siret: application.siret,
          position: application.position
        };
        
        // Sauvegarder dans localStorage
        const existingRetailers = JSON.parse(localStorage.getItem('validated_retailers') || '[]');
        existingRetailers.push(validatedRetailer);
        localStorage.setItem('validated_retailers', JSON.stringify(existingRetailers));
        
        console.log('✅ Revendeur validé et sauvegardé:', validatedRetailer.company_name);
      }
    }
    
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