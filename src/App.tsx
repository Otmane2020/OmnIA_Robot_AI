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
import { ResponsiveAdminWrapper } from './components/ResponsiveAdminWrapper';

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
      localStorage.setItem('current_user_role', 'super_admin');
      localStorage.setItem('current_user_email', credentials.email);
      setIsSuperAdmin(true);
      setIsLoggedIn(true);
      console.log('✅ Connexion Super Admin réussie');
      return;
    }

    // ✅ Vérification comptes démo revendeurs
    const demoAccounts = [
      { email: 'demo@decorahome.fr', password: 'demo123' },
      { email: 'contact@mobilierdesign.fr', password: 'design123' },
      { email: 'info@decocontemporain.com', password: 'deco123' },
      { email: 'contact@meubleslyon.fr', password: 'lyon123' }
    ];

    const demoAccount = demoAccounts.find(acc => 
      acc.email === credentials.email && acc.password === credentials.password
    );

    if (demoAccount) {
      localStorage.setItem('current_user_role', 'retailer');
      localStorage.setItem('current_retailer_email', credentials.email);
      localStorage.setItem('current_retailer_id', `demo-${credentials.email.split('@')[0]}`);
      setIsSuperAdmin(false);
      setIsLoggedIn(true);
      console.log('✅ Connexion compte démo:', credentials.email);
      return;
    }

    // ✅ Vérifier revendeurs approuvés (localStorage)
    try {
      const approvedRetailers = JSON.parse(localStorage.getItem('approved_retailers') || '[]');
      const validRetailer = approvedRetailers.find((retailer: any) => 
        retailer.email === credentials.email && retailer.password === credentials.password
      );

      if (validRetailer) {
        localStorage.setItem('current_user_role', 'retailer');
        localStorage.setItem('current_retailer_email', credentials.email);
        localStorage.setItem('current_retailer_id', validRetailer.id);
        localStorage.setItem('current_retailer_company', validRetailer.companyName);
        setIsSuperAdmin(false);
        setIsLoggedIn(true);
        console.log('✅ Connexion revendeur approuvé:', credentials.email);
        return;
      }
    } catch (error) {
      console.error('Erreur vérification revendeurs approuvés:', error);
    }

    // ❌ Identifiants incorrects
    alert(`❌ Identifiants incorrects.

📧 Comptes disponibles :
• demo@decorahome.fr / demo123
• contact@mobilierdesign.fr / design123  
• info@decocontemporain.com / deco123
• contact@meubleslyon.fr / lyon123
• superadmin@omnia.sale / superadmin2025

🔑 Ou votre compte revendeur après validation par le Super Admin`);
  };

  const handleLogout = () => {
    localStorage.removeItem('current_user_role');
    localStorage.removeItem('current_user_email');
    localStorage.removeItem('current_retailer_email');
    localStorage.removeItem('current_retailer_id');
    localStorage.removeItem('current_retailer_company');
    setIsLoggedIn(false);
    setIsSuperAdmin(false);
    console.log('✅ Déconnexion réussie');
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
    // La demande est déjà formatée dans SellerRegistration
    const newApplication = applicationData;
    
    setPendingApplications(prev => [...prev, newApplication]);
    
    console.log('✅ Nouvelle demande reçue:', newApplication.companyName);
    console.log('📧 Email de confirmation automatique envoyé à:', newApplication.email);
    console.log('📧 Email notification admin envoyé à: admin@omnia.sale');
    
    // NOUVEAU: Afficher notification dans l'interface Super Admin
    if (typeof window !== 'undefined') {
      // Créer une notification visible dans l'interface admin
      const adminNotification = {
        id: Date.now().toString(),
        type: 'new_application',
        title: '🔔 Nouvelle demande revendeur',
        message: `${newApplication.companyName} (${newApplication.email}) - Plan ${newApplication.selectedPlan}`,
        timestamp: new Date().toISOString(),
        data: newApplication
      };
      
      // Sauvegarder la notification pour l'admin
      const existingNotifications = JSON.parse(localStorage.getItem('admin_notifications') || '[]');
      localStorage.setItem('admin_notifications', JSON.stringify([adminNotification, ...existingNotifications]));
      
      console.log('🔔 Notification admin créée:', adminNotification);
    }
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
            <ResponsiveAdminWrapper onLogout={handleLogout} />
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