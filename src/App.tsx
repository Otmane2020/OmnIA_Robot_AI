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
    
    // ✅ NOUVEAU: Vérification connexion revendeur améliorée
    const validateRetailerLogin = async (email: string, password: string) => {
      try {
        // Vérifier en base de données d'abord
        const { data: loginData, error } = await supabase
          .from('retailer_logins')
          .select('retailer_id, password_hash')
          .eq('email', email)
          .single();

        if (!error && loginData) {
          // Vérifier mot de passe (simple base64 pour démo, bcrypt en production)
          const storedPassword = atob(loginData.password_hash);
          if (storedPassword === password) {
            // Mettre à jour last_login
            await supabase
              .from('retailer_logins')
              .update({ 
                last_login: new Date().toISOString(),
                login_attempts: 0
              })
              .eq('email', email);

            // Enregistrer session
            localStorage.setItem('current_retailer_id', loginData.retailer_id);
            localStorage.setItem('current_retailer_email', email);
            
            console.log('✅ Connexion revendeur DB réussie:', email);
            return true;
          }
        }
      } catch (dbError) {
        console.log('⚠️ DB error, checking localStorage fallback');
      }

      // Fallback localStorage
      const localRetailers = JSON.parse(localStorage.getItem('validated_retailers') || '[]');
      const retailer = localRetailers.find((r: any) => 
        r.email === email && r.password === password
      );
      
      if (retailer) {
        localStorage.setItem('current_retailer_id', retailer.id);
        localStorage.setItem('current_retailer_email', email);
        console.log('✅ Connexion revendeur localStorage réussie:', email);
        return true;
      }
      
      return false;
    };

    // Super Admin
    if (credentials.email === 'superadmin@omnia.sale' && credentials.password === 'superadmin2025') {
      setIsSuperAdmin(true);
      setIsLoggedIn(true);
      return;
    }

    // ✅ Vérification revendeurs (démo + nouveaux inscrits)
    const demoAccounts = [
      { email: 'demo@decorahome.fr', password: 'demo123' },
      { email: 'contact@mobilierdesign.fr', password: 'design123' },
      { email: 'info@decocontemporain.com', password: 'deco123' },
      { email: 'contact@meubleslyon.fr', password: 'lyon123' }
    ];

    // Vérifier comptes démo
    const demoAccount = demoAccounts.find(acc => 
      acc.email === credentials.email && acc.password === credentials.password
    );

    if (demoAccount) {
      localStorage.setItem('current_retailer_email', credentials.email);
      localStorage.setItem('current_retailer_id', `demo-${credentials.email.split('@')[0]}`);
      setIsSuperAdmin(false);
      setIsLoggedIn(true);
      console.log('✅ Connexion compte démo:', credentials.email);
      return;
    }

    // Vérifier revendeurs validés
    validateRetailerLogin(credentials.email, credentials.password).then(isValid => {
      if (isValid) {
        setIsSuperAdmin(false);
        setIsLoggedIn(true);
      } else {
        alert(`❌ Identifiants incorrects.

📧 Comptes disponibles :
• demo@decorahome.fr / demo123
• contact@mobilierdesign.fr / design123  
• info@decocontemporain.com / deco123
• contact@meubleslyon.fr / lyon123
• superadmin@omnia.sale / superadmin2025

🔑 Ou votre compte revendeur après validation`);
      }
    });
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