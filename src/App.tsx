const handleLogin = (credentials: { email: string; password: string }) => {
    console.log('Login attempt:', credentials);
    
    // Nettoyer les espaces et normaliser l'email
    const cleanEmail = credentials.email.trim().toLowerCase();
    const cleanPassword = credentials.password.trim();
    
    // Sauvegarder l'utilisateur connecté
    const saveCurrentUser = (userInfo: any) => {
      localStorage.setItem('current_logged_user', JSON.stringify(userInfo));
      console.log('✅ Utilisateur sauvegardé:', userInfo.email);
    };
    
    // Vérifier les revendeurs validés en localStorage
    const validatedRetailers = JSON.parse(localStorage.getItem('validated_retailers') || '[]');
    const validatedRetailer = validatedRetailers.find((retailer: any) => 
      retailer.email?.toLowerCase() === cleanEmail && retailer.password === cleanPassword
    );
    
    if (validatedRetailer) {
      console.log('✅ Connexion revendeur validé:', validatedRetailer.company_name);
      
      // Mettre à jour la dernière connexion
      const updatedRetailers = validatedRetailers.map((retailer: any) => 
        retailer.id === validatedRetailer.id 
          ? { ...retailer, last_login: new Date().toISOString() }
          : retailer
      );
      localStorage.setItem('validated_retailers', JSON.stringify(updatedRetailers));
      
      saveCurrentUser(validatedRetailer);
      setIsSuperAdmin(false);
      setIsLoggedIn(true);
      return;
    }
    
    // Super Admin
    if (cleanEmail === 'superadmin@omnia.sale' && cleanPassword === 'superadmin2025') {
      setIsSuperAdmin(true);
      setIsLoggedIn(true);
      saveCurrentUser({ email: cleanEmail, company_name: 'Super Admin', plan: 'Admin' });
    }
    // Decora Home - Boutique principale
    else if (cleanEmail === 'demo@decorahome.fr' && cleanPassword === 'demo123') {
      setIsLoggedIn(true);
      saveCurrentUser({ email: cleanEmail, company_name: 'Decora Home', plan: 'Professional' });
    }
    // Mobilier Design Paris
    else if (cleanEmail === 'contact@mobilierdesign.fr' && cleanPassword === 'design123') {
      setIsSuperAdmin(false);
      setIsLoggedIn(true);
      saveCurrentUser({ email: cleanEmail, company_name: 'Mobilier Design Paris', plan: 'Professional' });
    }
    // Déco Contemporain
    else if (cleanEmail === 'info@decocontemporain.com' && cleanPassword === 'deco123') {
      setIsSuperAdmin(false);
      setIsLoggedIn(true);
      saveCurrentUser({ email: cleanEmail, company_name: 'Déco Contemporain', plan: 'Enterprise' });
    }
    // Meubles Lyon
    else if (cleanEmail === 'contact@meubleslyon.fr' && cleanPassword === 'lyon123') {
      setIsSuperAdmin(false);
      setIsLoggedIn(true);
      saveCurrentUser({ email: cleanEmail, company_name: 'Meubles Lyon', plan: 'Starter' });
    }
    else {
      // Vérifier si l'email existe dans les demandes en attente
      const pendingApplications = JSON.parse(localStorage.getItem('pending_applications') || '[]');
      const pendingApplication = pendingApplications.find((app: any) => 
        app.email?.toLowerCase() === cleanEmail
      );
      
      if (pendingApplication) {
        alert('⏳ Votre demande est en cours de validation.\n\nStatut: En attente\nEntreprise: ' + pendingApplication.companyName + '\n\nVous recevrez un email dès validation (24-48h max).');
      } else {
        alert('❌ Identifiants incorrects.\n\n📋 Comptes de démonstration :\n• demo@decorahome.fr / demo123\n• contact@mobilierdesign.fr / design123\n• info@decocontemporain.com / deco123\n• contact@meubleslyon.fr / lyon123\n• superadmin@omnia.sale / superadmin2025\n\n🆕 Nouveau revendeur ? Créez votre compte sur /register');
      }
    }
  };