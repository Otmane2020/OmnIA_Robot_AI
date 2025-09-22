import React, { useState } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import LandingPage from './pages/LandingPage';
import SellerRegistration from './pages/SellerRegistration';
import { AdminLogin } from './pages/AdminLogin';
import { About } from './pages/About';
import Contact from './pages/Contact';
import Support from './pages/Support';
import Documentation from './pages/Documentation';
import Guides from './pages/Guides';
import Press from './pages/Press';
import Partnerships from './pages/Partnerships';

function App() {
  const [pendingApplications, setPendingApplications] = useState<any[]>([]);

  const handleValidateApplication = (applicationId: string, approved: boolean) => {
    console.log('🔄 Validation application:', applicationId, approved ? 'APPROUVÉE' : 'REJETÉE');
    
    // Récupérer la demande
    const application = pendingApplications.find(app => app.id === applicationId);
    if (!application) {
      alert('❌ Erreur : Demande introuvable');
      return;
    }

    // Vérifier les doublons avant validation
    const existingRetailers = JSON.parse(localStorage.getItem('validated_retailers') || '[]');
    
    // Contrôle email unique
    const emailExists = existingRetailers.some((retailer: any) => 
      retailer.email?.toLowerCase() === application.email?.toLowerCase()
    );
    
    // Contrôle nom entreprise unique
    const companyExists = existingRetailers.some((retailer: any) => 
      retailer.company_name?.toLowerCase() === application.companyName?.toLowerCase()
    );
    
    if (emailExists) {
      alert('❌ Erreur : Cet email est déjà utilisé par un autre revendeur validé');
      return;
    }
    
    if (companyExists) {
      alert('❌ Erreur : Cette entreprise est déjà enregistrée');
      return;
    }

    if (approved) {
      // Créer le compte revendeur validé avec mot de passe sécurisé
      const securePassword = application.password || `omnia${Date.now().toString().slice(-4)}`;
      
      const validatedRetailer = {
        id: application.id,
        email: application.email,
        password: securePassword,
        company_name: application.companyName,
        subdomain: application.proposedSubdomain || application.companyName.toLowerCase().replace(/[^a-z0-9]/g, '').substring(0, 20),
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
        position: application.position,
        created_at: new Date().toISOString(),
        last_login: null
      };
      
      // Sauvegarder dans localStorage
      existingRetailers.push(validatedRetailer);
      localStorage.setItem('validated_retailers', JSON.stringify(existingRetailers));
      
      console.log('✅ Revendeur validé et sauvegardé:', validatedRetailer.company_name);
      console.log('🔑 Identifiants de connexion:', {
        email: validatedRetailer.email,
        password: securePassword,
        subdomain: validatedRetailer.subdomain
      });
      
      alert(`✅ Revendeur approuvé !\n\nIdentifiants de connexion :\n• Email: ${validatedRetailer.email}\n• Mot de passe: ${securePassword}\n• Sous-domaine: ${validatedRetailer.subdomain}.omnia.sale`);
    } else {
      const rejectionReason = prompt('Raison du rejet (optionnel):') || 'Informations insuffisantes';
      console.log('❌ Demande rejetée:', rejectionReason);
      alert(`❌ Demande rejetée pour ${application.companyName}\nRaison: ${rejectionReason}`);
    }
    
    // Supprimer de la liste des demandes en attente
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/register" element={<SellerRegistration />} />
        <Route path="/admin" element={<AdminLogin />} />
        <Route path="/about" element={<About />} />
        <Route path="/contact" element={<Contact />} />
        <Route path="/support" element={<Support />} />
        <Route path="/docs" element={<Documentation />} />
        <Route path="/guides" element={<Guides />} />
        <Route path="/press" element={<Press />} />
        <Route path="/partnerships" element={<Partnerships />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </div>
  );
}

export default App;