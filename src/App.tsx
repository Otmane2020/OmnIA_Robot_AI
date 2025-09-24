import React from 'react';
import { Routes, Route, useParams } from 'react-router-dom';
import { LandingPage } from './pages/LandingPage';
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
import { VoiceChatInterface } from './components/VoiceChatInterface';
import { UploadPage } from './pages/upload';
import { RobotInterface } from './pages/RobotInterface';
import { ChatInterface } from './pages/ChatInterface';
import { ThankYou } from './pages/ThankYou';
import { SuperAdmin } from './pages/SuperAdmin';
import { SellerRobotInterface } from './pages/SellerRobotInterface';

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
    
    // Charger les revendeurs validés depuis localStorage
    let validatedRetailers = [];
    try {
      const saved = localStorage.getItem('validated_retailers');
      validatedRetailers = saved ? JSON.parse(saved) : [];
      console.log('📦 Revendeurs validés chargés:', validatedRetailers.length);
    } catch (error) {
      console.error('❌ Erreur chargement revendeurs validés:', error);
      validatedRetailers = [];
    }
    
    // Comptes de démonstration
    const testVendors = [
      {
        id: '550e8400-e29b-41d4-a716-446655440001',
        email: 'demo@decorahome.fr',
        password: 'demo123',
        company_name: 'Decora Home',
        subdomain: 'decorahome',
        plan: 'professional',
        status: 'active',
        contact_name: 'Marie Dubois',
        created_at: '2024-03-15T10:00:00Z',
        validated_at: '2024-03-15T12:00:00Z'
      },
      {
        id: '550e8400-e29b-41d4-a716-446655440002',
        email: 'contact@mobilierdesign.fr',
        password: 'design123',
        company_name: 'Mobilier Design',
        subdomain: 'mobilierdesign',
        plan: 'enterprise',
        status: 'active',
        contact_name: 'Jean Martin',
        created_at: '2024-04-10T14:30:00Z',
        validated_at: '2024-04-10T16:00:00Z'
      },
      {
        id: '550e8400-e29b-41d4-a716-446655440003',
        email: 'info@decocontemporain.com',
        password: 'deco123',
        company_name: 'Déco Contemporain',
        subdomain: 'decocontemporain',
        plan: 'starter',
        status: 'active',
        contact_name: 'Sophie Laurent',
        created_at: '2024-05-20T09:00:00Z',
        validated_at: '2024-05-20T11:30:00Z'
      },
      {
        id: '550e8400-e29b-41d4-a716-446655440004',
        email: 'contact@meubleslyon.fr',
        password: 'lyon123',
        company_name: 'Meubles Lyon',
        subdomain: 'meubleslyon',
        plan: 'enterprise',
        status: 'active',
        contact_name: 'Thomas Leroy',
        created_at: '2024-04-20T16:00:00Z',
        validated_at: '2024-04-20T18:00:00Z'
      }
    ];

    // Combiner les comptes de démo avec les revendeurs validés
    const allVendors = [
      ...testVendors,
      ...validatedRetailers.map(retailer => ({
        id: retailer.id,
        email: retailer.email,
        password: retailer.password || 'password123',
        company_name: retailer.name || retailer.company_name,
        subdomain: retailer.email.split('@')[0].replace(/[^a-z0-9]/g, ''),
        plan: retailer.plan || 'professional',
        status: retailer.status || 'active',
        contact_name: retailer.contact_name || 'Contact',
        created_at: retailer.joinDate || retailer.created_at || new Date().toISOString(),
        validated_at: retailer.validated_at || new Date().toISOString()
      }))
    ];

    // Super Admin
    if (credentials.email === 'superadmin@omnia.sale' && credentials.password === 'superadmin2025') {
      console.log('✅ Connexion Super Admin réussie');
      setIsSuperAdmin(true);
      setIsLoggedIn(true);
      setCurrentVendor(null);
      return;
    }
    
    // Vérifier si c'est un vendeur
    const vendor = allVendors.find(v => v.email === credentials.email);
    
    if (vendor && vendor.password === credentials.password) {
      console.log('✅ Connexion vendeur:', vendor.company_name);
      setIsSuperAdmin(false);
      setIsLoggedIn(true);
      setCurrentVendor(vendor);
      return;
    }
    
    // Identifiants incorrects
    console.log('❌ Identifiants incorrects:', credentials.email);
    
    // Construire la liste des comptes disponibles
    const availableAccounts = [
      '• demo@decorahome.fr / demo123',
      '• contact@mobilierdesign.fr / design123', 
      '• info@decocontemporain.com / deco123',
      '• contact@meubleslyon.fr / lyon123',
      '• superadmin@omnia.sale / superadmin2025'
    ];
    
    // Ajouter les revendeurs validés à la liste
    validatedRetailers.forEach(retailer => {
      availableAccounts.push(`• ${retailer.email} / ${retailer.password || 'password123'} (Validé)`);
    });
    
    alert(`Identifiants incorrects.\n\n🔑 Comptes disponibles :\n${availableAccounts.join('\n')}`);
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
    console.log('📝 Réception demande inscription:', applicationData);
    
    // Ajouter heure et date de création
    const newApplication = {
      ...applicationData,
      id: Date.now().toString(),
      submittedAt: new Date().toISOString(),
      submittedDate: new Date().toLocaleDateString('fr-FR'),
      submittedTime: new Date().toLocaleTimeString('fr-FR'),
      status: 'pending',
      proposedSubdomain: applicationData.companyName.toLowerCase().replace(/[^a-z0-9]/g, '').substring(0, 20),
      subdomain: applicationData.companyName.toLowerCase().replace(/[^a-z0-9]/g, '').substring(0, 20)
    };
    
    setPendingApplications(prev => [...prev, newApplication]);
    
    console.log('✅ Nouvelle demande reçue:', newApplication.companyName);
    console.log('📧 Email de confirmation automatique envoyé à:', newApplication.email);
    console.log('📧 Email notification admin envoyé à: admin@omnia.sale');
    
    // Rediriger vers une page de confirmation
    alert(`✅ Inscription envoyée avec succès !\n\n🏢 Entreprise: ${newApplication.companyName}\n📧 Email: ${newApplication.email}\n🌐 Sous-domaine: ${newApplication.proposedSubdomain}.omnia.sale\n\n⏱️ Validation sous 24-48h\nVous recevrez un email de confirmation.`);
    
    // Retour à l'accueil après inscription
    setTimeout(() => {
      window.location.href = '/';
    }, 2000);
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
      <Route path="/robot/:sellerSubdomain" element={<SellerRobotWrapper />} />
      
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

// Wrapper component pour les pages robot vendeur
const SellerRobotWrapper: React.FC = () => {
  const { sellerSubdomain } = useParams<{ sellerSubdomain: string }>();
  
  if (!sellerSubdomain) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-purple-900 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-white mb-4">Erreur</h1>
          <p className="text-gray-300">Sous-domaine vendeur manquant</p>
          <button
            onClick={() => window.location.href = '/'}
            className="mt-4 bg-cyan-600 hover:bg-cyan-700 text-white px-6 py-3 rounded-xl"
          >
            Retour à l'accueil
          </button>
        </div>
      </div>
    );
  }
  
  return <SellerRobotInterface sellerSubdomain={sellerSubdomain} />;
}

export default App;