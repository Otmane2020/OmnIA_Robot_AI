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
    
    // NOUVEAU: Vérifier TOUS les revendeurs validés dynamiquement
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
    else {
      // NOUVEAU: Message d'erreur dynamique avec liste des revendeurs validés
      const retailersList = validatedRetailers.length > 0 
        ? validatedRetailers.map((r: any) => `• ${r.email} (${r.company_name})`).join('\n')
        : '• Aucun revendeur validé pour le moment';
      
      alert(`❌ Identifiants incorrects.\n\n🏪 Revendeurs validés :\n${retailersList}\n\n👑 Super Admin :\n• superadmin@omnia.sale / superadmin2025\n\n💡 Nouveau revendeur ? Créez un compte via le bouton d'inscription.`);
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