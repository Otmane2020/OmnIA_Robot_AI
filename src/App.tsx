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
    
    // Super Admin
    if (credentials.email === 'superadmin@omnia.sale' && credentials.password === 'superadmin2025') {
      setIsSuperAdmin(true);
      setIsLoggedIn(true);
      return;
    }
    
    // Vérifier les revendeurs validés
    const validatedRetailers = JSON.parse(localStorage.getItem('validated_retailers') || '[]');
    const retailer = validatedRetailers.find((r: any) => 
      r.email === credentials.email && r.password_hash === credentials.password
    );
    
    if (retailer) {
      console.log('✅ Connexion revendeur réussie:', retailer.company_name);
      
      // Mettre à jour last_login
      const updatedRetailers = validatedRetailers.map((r: any) => 
        r.id === retailer.id ? { ...r, last_login: new Date().toISOString() } : r
      );
      localStorage.setItem('validated_retailers', JSON.stringify(updatedRetailers));
      
      setIsSuperAdmin(false);
      setIsLoggedIn(true);
      return;
    }
    
    // Decora Home - Boutique principale
    if (credentials.email === 'demo@decorahome.fr' && credentials.password === 'demo123') {
      setIsSuperAdmin(false);
      setIsLoggedIn(true);
    }
    // Mobilier Design Paris
    else if (credentials.email === 'contact@mobilierdesign.fr' && credentials.password === 'design123') {
      setIsSuperAdmin(false);
      setIsLoggedIn(true);
    }
    // Déco Contemporain
    else if (credentials.email === 'info@decocontemporain.com' && credentials.password === 'deco123') {
      setIsSuperAdmin(false);
      setIsLoggedIn(true);
    }
    // Meubles Lyon
    else if (credentials.email === 'contact@meubleslyon.fr' && credentials.password === 'lyon123') {
      setIsSuperAdmin(false);
      setIsLoggedIn(true);
    }
    // Autres boutiques
    else if (credentials.email === 'admin@mobilierdesign.fr' && credentials.password === 'design123') {
      setIsSuperAdmin(false);
      setIsLoggedIn(true);
    }
    else if (credentials.email === 'contact@decocontemporain.com' && credentials.password === 'deco123') {
      setIsSuperAdmin(false);
      setIsLoggedIn(true);
    }
    else {
      alert('Identifiants incorrects.\n\nComptes disponibles :\n• demo@decorahome.fr / demo123\n• contact@mobilierdesign.fr / design123\n• info@decocontemporain.com / deco123\n• contact@meubleslyon.fr / lyon123\n• superadmin@omnia.sale / superadmin2025\n\nOu utilisez les identifiants de revendeur validé.');
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
    
    const application = pendingApplications.find(app => app.id === applicationId);
    if (!application) return;
    
    // Supprimer de la liste des demandes en attente
    setPendingApplications(prev => 
      prev.filter(app => app.id !== applicationId)
    );
    
    if (approved) {
      // Créer le sous-domaine unique
      const uniqueSubdomain = `${application.companyName.toLowerCase().replace(/[^a-z0-9]/g, '').substring(0, 15)}${Date.now().toString().slice(-4)}`;
      
      // Simuler création du compte revendeur
      const newRetailerAccount = {
        id: `retailer-${Date.now()}`,
        company_name: application.companyName,
        email: application.email,
        subdomain: uniqueSubdomain,
        password: application.password,
        plan: application.selectedPlan,
        status: 'active',
        created_at: new Date().toISOString(),
        validated_at: new Date().toISOString()
      };
      
      // Sauvegarder le nouveau revendeur
      const existingRetailers = JSON.parse(localStorage.getItem('validated_retailers') || '[]');
      existingRetailers.push(newRetailerAccount);
      localStorage.setItem('validated_retailers', JSON.stringify(existingRetailers));
      
      console.log('✅ Revendeur créé:', {
        company: newRetailerAccount.company_name,
        subdomain: `${uniqueSubdomain}.omnia.sale`,
        email: newRetailerAccount.email
      });
      
      // Simuler envoi email d'approbation
      console.log('📧 Email d\'approbation envoyé à:', application.email);
      console.log('🌐 Sous-domaine créé:', `${uniqueSubdomain}.omnia.sale`);
      console.log('🔑 Identifiants:', {
        email: application.email,
        password: application.password,
        subdomain: uniqueSubdomain
      });
    } else {
      console.log('📧 Email de rejet envoyé');
      console.log('📋 Demande d\'informations complémentaires');
    }
  };

  const handleRegistrationSubmit = (applicationData: any) => {
    // Ajouter heure et date de création
    const newApplication = {
      ...applicationData,
      submittedDate: new Date().toLocaleDateString('fr-FR'),
      submittedTime: new Date().toLocaleTimeString('fr-FR'),
      status: 'pending_validation'
    };
    
    setPendingApplications(prev => [...prev, newApplication]);
    
    console.log('✅ Nouvelle demande reçue:', newApplication.companyName);
    console.log('📧 Emails automatiques envoyés');
    console.log('🌐 Sous-domaine réservé:', newApplication.subdomain);
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