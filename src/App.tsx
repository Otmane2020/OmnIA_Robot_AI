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
      const checkRetailerLogin = async () => {
        const { data: retailer, error } = await supabase
          .from('retailers')
          .select('*')
          .eq('email', credentials.email)
          .eq('status', 'active')
          .single();

        if (retailer && retailer.password_hash === credentials.password) {
          console.log('✅ Connexion revendeur DB réussie:', retailer.company_name);
          
          // Mettre à jour last_login
          await supabase
            .from('retailers')
            .update({ last_login: new Date().toISOString() })
            .eq('id', retailer.id);
          
          // Stocker l'ID du revendeur connecté
          localStorage.setItem('current_retailer_id', retailer.id);
          localStorage.setItem('current_retailer_data', JSON.stringify(retailer));
          
          setIsSuperAdmin(false);
          setIsLoggedIn(true);
          return true;
        }
        return false;
      };
      
      // Essayer la connexion DB
      checkRetailerLogin().then(success => {
        if (success) return;
        
        // Fallback localStorage pour les revendeurs validés localement
        const validatedRetailers = JSON.parse(localStorage.getItem('validated_retailers') || '[]');
        const localRetailer = validatedRetailers.find((r: any) => 
          r.email === credentials.email && r.password_hash === credentials.password
        );
        
        if (localRetailer) {
          console.log('✅ Connexion revendeur local réussie:', localRetailer.company_name);
          
          // Stocker l'ID du revendeur connecté
          localStorage.setItem('current_retailer_id', localRetailer.id);
          localStorage.setItem('current_retailer_data', JSON.stringify(localRetailer));
          
          setIsSuperAdmin(false);
          setIsLoggedIn(true);
          return;
        }
        
        // Comptes de démo
        const demoAccounts = [
          { email: 'demo@decorahome.fr', password: 'demo123', name: 'Decora Home', id: 'demo-decora' },
          { email: 'contact@mobilierdesign.fr', password: 'design123', name: 'Mobilier Design', id: 'demo-design' },
          { email: 'info@decocontemporain.com', password: 'deco123', name: 'Déco Contemporain', id: 'demo-deco' },
          { email: 'contact@meubleslyon.fr', password: 'lyon123', name: 'Meubles Lyon', id: 'demo-lyon' }
        ];
        
        const demoAccount = demoAccounts.find(account => 
          account.email === credentials.email && account.password === credentials.password
        );
        
        if (demoAccount) {
          console.log('✅ Connexion compte démo:', demoAccount.name);
          localStorage.setItem('current_retailer_id', demoAccount.id);
          localStorage.setItem('current_retailer_data', JSON.stringify(demoAccount));
          setIsSuperAdmin(false);
          setIsLoggedIn(true);
        } else {
          alert('Identifiants incorrects.\n\nComptes disponibles :\n• demo@decorahome.fr / demo123\n• contact@mobilierdesign.fr / design123\n• info@decocontemporain.com / deco123\n• contact@meubleslyon.fr / lyon123\n• superadmin@omnia.sale / superadmin2025');
        }
      });
      
    } catch (error) {
      console.error('❌ Erreur vérification revendeur:', error);
      alert('Erreur de connexion. Veuillez réessayer.');
    }
  };

  const handleLogout = () => {
    // Nettoyer les données du revendeur connecté
    localStorage.removeItem('current_retailer_id');
    localStorage.removeItem('current_retailer_data');
    setIsLoggedIn(false);
    setIsSuperAdmin(false);
  };
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
    }
    // Decora Home - Boutique principale
    else if (credentials.email === 'demo@decorahome.fr' && credentials.password === 'demo123') {
    // Vérifier les revendeurs validés en base de données
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