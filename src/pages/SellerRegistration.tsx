const handleSubmit = async (e?: React.FormEvent) => {
     if (e) e.preventDefault();
     if (!validateStep(4)) return;

     // Vérifier les doublons avant soumission
     const existingApplications = JSON.parse(localStorage.getItem('pending_applications') || '[]');
     const existingRetailers = JSON.parse(localStorage.getItem('validated_retailers') || '[]');
     
    // Nettoyer et normaliser les données
    const cleanEmail = formData.email.trim().toLowerCase();
    const cleanCompanyName = formData.companyName.trim().toLowerCase();
    const cleanSiret = formData.siret.trim();
    
    // Vérifier email unique dans les demandes en attente
     const emailInPending = existingApplications.some((app: any) => 
      app.email?.toLowerCase() === cleanEmail
     );
     
     // Vérifier email unique dans les revendeurs validés
     const emailInValidated = existingRetailers.some((retailer: any) => 
      retailer.email?.toLowerCase() === cleanEmail
     );
     
    // Vérifier nom entreprise unique dans les demandes en attente
    const companyInPending = existingApplications.some((app: any) => 
      app.companyName?.toLowerCase() === cleanCompanyName
    );
    
    // Vérifier nom entreprise unique dans les revendeurs validés
    const companyInValidated = existingRetailers.some((retailer: any) => 
      retailer.company_name?.toLowerCase() === cleanCompanyName
    );
    
    // Vérifier SIRET unique dans les demandes en attente
     const siretInPending = existingApplications.some((app: any) => 
      app.siret === cleanSiret
     );
     
     // Vérifier SIRET unique dans les revendeurs validés
     const siretInValidated = existingRetailers.some((retailer: any) => 
      retailer.siret === cleanSiret
     );
     
     if (emailInPending || emailInValidated) {
      alert('❌ Erreur de doublon :\n\nCet email est déjà utilisé par un autre revendeur.\n\n💡 Solutions :\n• Utilisez un autre email professionnel\n• Contactez support@omnia.sale si c\'est une erreur');
      return;
    }
    
    if (companyInPending || companyInValidated) {
      alert('❌ Erreur de doublon :\n\nCette entreprise est déjà enregistrée.\n\n💡 Solutions :\n• Vérifiez le nom exact de votre entreprise\n• Contactez support@omnia.sale si c\'est votre entreprise');
      return;
    }
     
     if (siretInPending || siretInValidated) {
      alert('❌ Erreur de doublon :\n\nCe SIRET est déjà enregistré.\n\n💡 Solutions :\n• Vérifiez votre numéro SIRET\n• Contactez support@omnia.sale si c\'est une erreur');
      return;
     }
   };