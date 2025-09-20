import React, { useState, useEffect } from 'react';
import { 
  Building, User, Mail, Phone, MapPin, FileText, 
  Upload, ArrowLeft, CheckCircle, AlertCircle, 
  Eye, EyeOff, CreditCard, Globe, Loader2
} from 'lucide-react';
import { Logo } from '../components/Logo';

interface SellerRegistrationProps {
  onSubmit: (data: any) => void;
  onBack: () => void;
}

interface FormData {
  companyName: string;
  siret: string;
  address: string;
  postalCode: string;
  city: string;
  country: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  position: string;
  password: string;
  confirmPassword: string;
  selectedPlan: 'starter' | 'professional' | 'enterprise';
  kbisFile: File | null;
  acceptTerms: boolean;
}

export const SellerRegistration: React.FC<SellerRegistrationProps> = ({ onSubmit, onBack }) => {
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState<FormData>({
    companyName: '',
    siret: '',
    address: '',
    postalCode: '',
    city: '',
    country: '',
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    position: '',
    password: '',
    confirmPassword: '',
    selectedPlan: 'professional',
    kbisFile: null,
    acceptTerms: false
  });
  const [errors, setErrors] = useState<{[key: string]: string}>({});
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const plans = [
    {
      id: 'starter',
      name: 'Starter',
      price: '29€/mois',
      features: ['1000 conversations/mois', '500 produits max', 'Support email', 'Widget personnalisable']
    },
    {
      id: 'professional',
      name: 'Professional',
      price: '79€/mois',
      features: ['5000 conversations/mois', 'Produits illimités', 'Support prioritaire', 'Domaine personnalisé'],
      popular: true
    },
    {
      id: 'enterprise',
      name: 'Enterprise',
      price: '199€/mois',
      features: ['Conversations illimitées', 'Multi-magasins', 'Support dédié', 'White-label']
    }
  ];

  const [showAccountCreation, setShowAccountCreation] = useState(false);
  const [accountCreationStep, setAccountCreationStep] = useState(0);
  const [isAccountCreated, setIsAccountCreated] = useState(false);
  const [createdAccountInfo, setCreatedAccountInfo] = useState<any>(null);

  // Define creationSteps at component level to avoid undefined reference
  const creationSteps = [
    { icon: CheckCircle, label: 'Validation demande', duration: 1200 },
    { icon: FileText, label: 'Vérification Kbis', duration: 1000 },
    { icon: Globe, label: 'Création sous-domaine unique', duration: 800 },
    { icon: Mail, label: 'Envoi emails confirmation', duration: 600 }
  ];

  // Move useEffect outside conditional to maintain hooks order
  useEffect(() => {
    if (showAccountCreation) {
      const timer = setTimeout(() => {
        if (accountCreationStep < creationSteps.length - 1) {
          setAccountCreationStep(prev => prev + 1);
        } else {
          // Terminer après toutes les étapes
          setTimeout(handleAccountCreationComplete, 800);
        }
      }, creationSteps[accountCreationStep]?.duration || 1000);

      return () => clearTimeout(timer);
    }
  }, [accountCreationStep, showAccountCreation]);

  const generateUniqueSubdomain = (companyName: string): string => {
    // Générer un sous-domaine basé sur le nom de la boutique
    const cleanName = companyName
      .toLowerCase()
      .replace(/[^a-z0-9\s]/g, '') // Garder les espaces temporairement
      .replace(/\s+/g, '') // Supprimer tous les espaces
      .substring(0, 20); // Longueur max
    
    // Ajouter un suffixe numérique pour l'unicité
    const suffix = Math.floor(Math.random() * 9999).toString().padStart(4, '0');
    return `${cleanName}${suffix}`;
  };

  const sendNotificationEmail = async (type: string, data: any) => {
    // Simulation d'envoi d'email sans appel API externe
    console.log('📧 Email simulé envoyé:', {
      type,
      to: data.email,
      company: data.companyName,
      subdomain: data.subdomain
    });
    
    // Simuler un délai d'envoi
    await new Promise(resolve => setTimeout(resolve, 500));
    return true;
  };

  const handleAccountCreationComplete = async () => {
    const uniqueSubdomain = generateUniqueSubdomain(formData.companyName);
    const accountPassword = formData.password || `omnia${Date.now().toString().slice(-4)}`;
    
    const accountInfo = {
      ...formData,
      id: Date.now().toString(),
      submittedAt: new Date().toISOString(),
      status: 'pending_validation',
      subdomain: uniqueSubdomain,
      password: accountPassword,
      proposedSubdomain: uniqueSubdomain
    };
    
    setCreatedAccountInfo(accountInfo);
    setIsAccountCreated(true);
    
    // Envoyer emails de notification (simulation)
    try {
      await sendNotificationEmail('application_received', accountInfo);
      await sendNotificationEmail('new_application_admin', accountInfo);
      console.log('✅ Notifications envoyées avec succès');
    } catch (error) {
      console.log('⚠️ Erreur envoi notifications (mode simulation)');
    }
    
    // Sauvegarder la demande
    onSubmit(accountInfo);
    
    console.log('✅ Compte créé:', {
      company: accountInfo.companyName,
      subdomain: uniqueSubdomain,
      email: accountInfo.email
    });
  };

  const handleInputChange = (field: keyof FormData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const validateStep = (step: number): boolean => {
    const newErrors: {[key: string]: string} = {};

    if (step === 1) {
      if (!formData.companyName.trim()) newErrors.companyName = 'Nom de l\'entreprise requis';
      if (!formData.siret.trim()) newErrors.siret = 'SIRET requis';
      if (!formData.address.trim()) newErrors.address = 'Adresse requise';
      if (!formData.postalCode.trim()) newErrors.postalCode = 'Code postal requis';
      if (!formData.city.trim()) newErrors.city = 'Ville requise';
      if (!formData.country.trim()) newErrors.country = 'Pays requis';
    }

    if (step === 2) {
      if (!formData.firstName.trim()) newErrors.firstName = 'Prénom requis';
      if (!formData.lastName.trim()) newErrors.lastName = 'Nom requis';
      if (!formData.email.trim()) newErrors.email = 'Email requis';
      if (!/\S+@\S+\.\S+/.test(formData.email)) newErrors.email = 'Email invalide';
      if (!formData.phone.trim()) newErrors.phone = 'Téléphone requis';
      if (!formData.position.trim()) newErrors.position = 'Fonction requise';
      if (!formData.password.trim()) newErrors.password = 'Mot de passe requis';
      if (formData.password.length < 6) newErrors.password = 'Minimum 6 caractères';
      if (formData.password !== formData.confirmPassword) newErrors.confirmPassword = 'Mots de passe différents';
    }

    if (step === 4) {
      if (!formData.kbisFile) newErrors.kbisFile = 'Document Kbis requis';
      if (!formData.acceptTerms) newErrors.acceptTerms = 'Acceptation des conditions requise';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    if (validateStep(currentStep)) {
      setCurrentStep(prev => prev + 1);
    }
  };

  const handleSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!validateStep(4)) return;

    // Vérifier les doublons avant soumission
    const existingApplications = JSON.parse(localStorage.getItem('pending_applications') || '[]');
    const existingRetailers = JSON.parse(localStorage.getItem('validated_retailers') || '[]');
    
    // Vérifier email unique dans les demandes en attente
    const emailInPending = existingApplications.some((app: any) => 
      app.email?.toLowerCase() === formData.email.toLowerCase()
    );
    
    // Vérifier email unique dans les revendeurs validés
    const emailInValidated = existingRetailers.some((retailer: any) => 
      retailer.email?.toLowerCase() === formData.email.toLowerCase()
    );
    
    // Vérifier SIRET unique dans les demandes en attente
    const siretInPending = existingApplications.some((app: any) => 
      app.siret === formData.siret
    );
    
    // Vérifier SIRET unique dans les revendeurs validés
    const siretInValidated = existingRetailers.some((retailer: any) => 
      retailer.siret === formData.siret
    );
    
    if (emailInPending || emailInValidated) {
      alert('❌ Erreur : Cet email est déjà utilisé. Veuillez utiliser un autre email.');
      return;
    }
    
    if (siretInPending || siretInValidated) {
      alert('❌ Erreur : Ce SIRET est déjà enregistré. Veuillez vérifier votre numéro SIRET.');
      return;
    }

    setIsSubmitting(true);
    
    try {
      // Simuler l'envoi de la demande
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Passer à l'écran de création de compte
      setShowAccountCreation(true);
      setAccountCreationStep(0);
      
    } catch (error) {
      console.error('Erreur soumission:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Écran de confirmation finale
  if (isAccountCreated && createdAccountInfo) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-purple-900 flex items-center justify-center p-4">
        {/* Background Effects */}
        <div className="absolute inset-0 opacity-20">
          <div className="absolute top-20 left-20 w-72 h-72 bg-cyan-500/30 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute bottom-20 right-20 w-96 h-96 bg-purple-500/20 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '2s' }}></div>
        </div>

        <div className="relative z-10 bg-white/10 backdrop-blur-2xl rounded-3xl p-8 max-w-lg w-full border border-white/20 shadow-2xl text-center">
          <div className="w-20 h-20 bg-gradient-to-br from-green-500 to-emerald-600 rounded-full flex items-center justify-center mx-auto mb-6 shadow-2xl">
            <CheckCircle className="w-10 h-10 text-white" />
          </div>
          
          <h1 className="text-3xl font-bold text-white mb-4">🎉 Inscription réussie !</h1>
          <p className="text-gray-300 mb-8">
            Votre demande a été envoyée avec succès. Notre équipe va la valider sous 24h.
          </p>
          
          <div className="bg-green-500/20 border border-green-400/50 rounded-xl p-6 mb-8">
            <h3 className="font-semibold text-green-200 mb-4">📧 Emails envoyés :</h3>
            <div className="space-y-2 text-green-300 text-sm">
              <div>✅ Confirmation à {createdAccountInfo.email}</div>
              <div>✅ Notification admin pour validation</div>
              <div>✅ Domaine créé : <strong>{createdAccountInfo.subdomain}.omnia.sale</strong></div>
            </div>
          </div>
          
          <div className="bg-blue-500/20 border border-blue-400/50 rounded-xl p-6 mb-8">
            <h3 className="font-semibold text-blue-200 mb-4">⏱️ Prochaines étapes :</h3>
            <div className="space-y-2 text-blue-300 text-sm text-left">
              <div>1. <strong>Validation (24-48h)</strong> : Examen de votre dossier</div>
              <div>2. <strong>Email d'approbation</strong> : Réception de vos identifiants</div>
              <div>3. <strong>Connexion</strong> : Accès à {createdAccountInfo.subdomain}.omnia.sale</div>
              <div>4. <strong>Configuration</strong> : Import de votre catalogue</div>
            </div>
          </div>
          
          <button
            onClick={() => window.location.href = '/'}
            className="w-full bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white py-4 rounded-xl font-bold text-lg transition-all shadow-2xl hover:shadow-cyan-500/40"
          >
            Retour à l'accueil
          </button>
        </div>
      </div>
    );
  }
  // Écran de création de compte
  if (showAccountCreation) {
    const CurrentIcon = creationSteps[accountCreationStep]?.icon || CheckCircle;

    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-purple-900 flex items-center justify-center p-4">
        {/* Background Effects */}
        <div className="absolute inset-0 opacity-20">
          <div className="absolute top-20 left-20 w-72 h-72 bg-cyan-500/30 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute bottom-20 right-20 w-96 h-96 bg-purple-500/20 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '2s' }}></div>
        </div>

        <div className="relative z-10 bg-white/10 backdrop-blur-2xl rounded-3xl p-8 max-w-md w-full border border-white/20 shadow-2xl text-center">
          {/* Animation principale */}
          <div className="mb-8">
            <div className="w-20 h-20 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-full flex items-center justify-center mx-auto mb-6 shadow-2xl relative">
              <CurrentIcon className="w-10 h-10 text-white" />
              <div className="absolute inset-0 border-4 border-cyan-400/30 rounded-full animate-ping"></div>
            </div>
            <h2 className="text-2xl font-bold text-white mb-2">Traitement de votre demande</h2>
            <p className="text-cyan-300">{creationSteps[accountCreationStep]?.label || 'Configuration...'}</p>
          </div>

          {/* Étapes de création */}
          <div className="space-y-4 mb-8">
            {creationSteps.map((step, index) => {
              const StepIcon = step.icon;
              const isActive = index === accountCreationStep;
              const isCompleted = index < accountCreationStep;
              
              return (
                <div 
                  key={index}
                  className={`flex items-center gap-4 p-4 rounded-xl transition-all ${
                    isCompleted 
                      ? 'bg-green-500/20 border border-green-400/50' 
                      : isActive 
                        ? 'bg-cyan-500/20 border border-cyan-400/50 animate-pulse' 
                        : 'bg-slate-700/30 border border-slate-600/30 opacity-50'
                  }`}
                >
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                    isCompleted 
                      ? 'bg-green-500' 
                      : isActive 
                        ? 'bg-cyan-500' 
                        : 'bg-slate-600'
                  }`}>
                    {isCompleted ? (
                      <CheckCircle className="w-4 h-4 text-white" />
                    ) : isActive ? (
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    ) : (
                      <StepIcon className="w-4 h-4 text-white" />
                    )}
                  </div>
                  <span className={`font-medium ${
                    isActive ? 'text-white' : isCompleted ? 'text-green-300' : 'text-gray-400'
                  }`}>
                    {step.label}
                  </span>
                </div>
              );
            })}
          </div>

          {/* Informations de création */}
          <div className="bg-blue-500/20 border border-blue-400/50 rounded-xl p-4 mb-6">
            <h4 className="font-semibold text-blue-200 mb-2">🏢 Votre futur compte :</h4>
            <div className="text-blue-300 text-sm space-y-1">
              <div><strong>Entreprise :</strong> {formData.companyName}</div>
              <div><strong>Email :</strong> {formData.email}</div>
              <div><strong>Plan :</strong> {plans.find(p => p.id === formData.selectedPlan)?.name}</div>
              <div><strong>Sous-domaine :</strong> {generateUniqueSubdomain(formData.companyName)}.omnia.sale</div>
            </div>
          </div>
          
          <div className="bg-green-500/20 border border-green-400/50 rounded-xl p-4 mb-6">
            <h4 className="font-semibold text-green-200 mb-2">📧 Notifications automatiques :</h4>
            <div className="space-y-1 text-green-300 text-sm">
              <div>• Email de confirmation envoyé</div>
              <div>• Admin notifié pour validation</div>
              <div>• Sous-domaine réservé automatiquement</div>
            </div>
          </div>

          {accountCreationStep === creationSteps.length - 1 && (
            <div className="bg-green-500/20 border border-green-400/50 rounded-xl p-4">
              <div className="flex items-center gap-2 justify-center text-green-300">
                <CheckCircle className="w-5 h-5" />
                <span className="font-semibold">Compte créé avec succès !</span>
              </div>
            </div>
          )}
        </div>
      </div>
    );
  }

  const renderStep1 = () => (
    <div className="space-y-6">
      <div className="text-center mb-8">
        <Building className="w-16 h-16 text-cyan-400 mx-auto mb-4" />
        <h2 className="text-2xl font-bold text-white mb-2">Informations Entreprise</h2>
        <p className="text-gray-300">Renseignez les détails de votre société</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-cyan-200 mb-2">
            Nom de l'entreprise *
          </label>
          <input
            type="text"
            value={formData.companyName}
            onChange={(e) => handleInputChange('companyName', e.target.value)}
            className={`w-full bg-black/40 border rounded-xl px-4 py-3 text-white placeholder-cyan-400 focus:outline-none focus:border-cyan-400 focus:ring-2 focus:ring-cyan-400/30 ${
              errors.companyName ? 'border-red-500' : 'border-cyan-500/50'
            }`}
            placeholder="Ex: Mobilier Design Paris"
          />
          {errors.companyName && <p className="text-red-400 text-sm mt-1">{errors.companyName}</p>}
        </div>

        <div>
          <label className="block text-sm font-medium text-cyan-200 mb-2">
            SIRET *
          </label>
          <input
            type="text"
            value={formData.siret}
            onChange={(e) => handleInputChange('siret', e.target.value)}
            className={`w-full bg-black/40 border rounded-xl px-4 py-3 text-white placeholder-cyan-400 focus:outline-none focus:border-cyan-400 focus:ring-2 focus:ring-cyan-400/30 ${
              errors.siret ? 'border-red-500' : 'border-cyan-500/50'
            }`}
            placeholder="12345678901234"
          />
          {errors.siret && <p className="text-red-400 text-sm mt-1">{errors.siret}</p>}
        </div>

        <div>
          <label className="block text-sm font-medium text-cyan-200 mb-2">
            Pays *
          </label>
          <select
            value={formData.country}
            onChange={(e) => handleInputChange('country', e.target.value)}
            className={`w-full bg-black/40 border rounded-xl px-4 py-3 text-white focus:outline-none focus:border-cyan-400 focus:ring-2 focus:ring-cyan-400/30 ${
              errors.country ? 'border-red-500' : 'border-cyan-500/50'
            }`}
          >
            <option value="">Sélectionner un pays</option>
            <option value="France">France</option>
            <option value="Belgique">Belgique</option>
            <option value="Suisse">Suisse</option>
            <option value="Luxembourg">Luxembourg</option>
            <option value="Canada">Canada</option>
          </select>
          {errors.country && <p className="text-red-400 text-sm mt-1">{errors.country}</p>}
        </div>

        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-cyan-200 mb-2">
            Adresse *
          </label>
          <input
            type="text"
            value={formData.address}
            onChange={(e) => handleInputChange('address', e.target.value)}
            className={`w-full bg-black/40 border rounded-xl px-4 py-3 text-white placeholder-cyan-400 focus:outline-none focus:border-cyan-400 focus:ring-2 focus:ring-cyan-400/30 ${
              errors.address ? 'border-red-500' : 'border-cyan-500/50'
            }`}
            placeholder="123 Avenue des Champs-Élysées"
          />
          {errors.address && <p className="text-red-400 text-sm mt-1">{errors.address}</p>}
        </div>

        <div>
          <label className="block text-sm font-medium text-cyan-200 mb-2">
            Code postal *
          </label>
          <input
            type="text"
            value={formData.postalCode}
            onChange={(e) => handleInputChange('postalCode', e.target.value)}
            className={`w-full bg-black/40 border rounded-xl px-4 py-3 text-white placeholder-cyan-400 focus:outline-none focus:border-cyan-400 focus:ring-2 focus:ring-cyan-400/30 ${
              errors.postalCode ? 'border-red-500' : 'border-cyan-500/50'
            }`}
            placeholder="75008"
          />
          {errors.postalCode && <p className="text-red-400 text-sm mt-1">{errors.postalCode}</p>}
        </div>

        <div>
          <label className="block text-sm font-medium text-cyan-200 mb-2">
            Ville *
          </label>
          <input
            type="text"
            value={formData.city}
            onChange={(e) => handleInputChange('city', e.target.value)}
            className={`w-full bg-black/40 border rounded-xl px-4 py-3 text-white placeholder-cyan-400 focus:outline-none focus:border-cyan-400 focus:ring-2 focus:ring-cyan-400/30 ${
              errors.city ? 'border-red-500' : 'border-cyan-500/50'
            }`}
            placeholder="Paris"
          />
          {errors.city && <p className="text-red-400 text-sm mt-1">{errors.city}</p>}
        </div>
      </div>
    </div>
  );

  const renderStep2 = () => (
    <div className="space-y-6">
      <div className="text-center mb-8">
        <User className="w-16 h-16 text-cyan-400 mx-auto mb-4" />
        <h2 className="text-2xl font-bold text-white mb-2">Contact Responsable</h2>
        <p className="text-gray-300">Personne en charge du compte OmnIA</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-cyan-200 mb-2">
            Prénom *
          </label>
          <input
            type="text"
            value={formData.firstName}
            onChange={(e) => handleInputChange('firstName', e.target.value)}
            className={`w-full bg-black/40 border rounded-xl px-4 py-3 text-white placeholder-cyan-400 focus:outline-none focus:border-cyan-400 focus:ring-2 focus:ring-cyan-400/30 ${
              errors.firstName ? 'border-red-500' : 'border-cyan-500/50'
            }`}
            placeholder="Jean"
          />
          {errors.firstName && <p className="text-red-400 text-sm mt-1">{errors.firstName}</p>}
        </div>

        <div>
          <label className="block text-sm font-medium text-cyan-200 mb-2">
            Nom *
          </label>
          <input
            type="text"
            value={formData.lastName}
            onChange={(e) => handleInputChange('lastName', e.target.value)}
            className={`w-full bg-black/40 border rounded-xl px-4 py-3 text-white placeholder-cyan-400 focus:outline-none focus:border-cyan-400 focus:ring-2 focus:ring-cyan-400/30 ${
              errors.lastName ? 'border-red-500' : 'border-cyan-500/50'
            }`}
            placeholder="Dupont"
          />
          {errors.lastName && <p className="text-red-400 text-sm mt-1">{errors.lastName}</p>}
        </div>

        <div>
          <label className="block text-sm font-medium text-cyan-200 mb-2">
            Email professionnel *
          </label>
          <input
            type="email"
            value={formData.email}
            onChange={(e) => handleInputChange('email', e.target.value)}
            className={`w-full bg-black/40 border rounded-xl px-4 py-3 text-white placeholder-cyan-400 focus:outline-none focus:border-cyan-400 focus:ring-2 focus:ring-cyan-400/30 ${
              errors.email ? 'border-red-500' : 'border-cyan-500/50'
            }`}
            placeholder="contact@monmagasin.fr"
          />
          {errors.email && <p className="text-red-400 text-sm mt-1">{errors.email}</p>}
        </div>

        <div>
          <label className="block text-sm font-medium text-cyan-200 mb-2">
            Téléphone *
          </label>
          <input
            type="tel"
            value={formData.phone}
            onChange={(e) => handleInputChange('phone', e.target.value)}
            className={`w-full bg-black/40 border rounded-xl px-4 py-3 text-white placeholder-cyan-400 focus:outline-none focus:border-cyan-400 focus:ring-2 focus:ring-cyan-400/30 ${
              errors.phone ? 'border-red-500' : 'border-cyan-500/50'
            }`}
            placeholder="+33 1 23 45 67 89"
          />
          {errors.phone && <p className="text-red-400 text-sm mt-1">{errors.phone}</p>}
        </div>

        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-cyan-200 mb-2">
            Fonction dans l'entreprise *
          </label>
          <input
            type="text"
            value={formData.position}
            onChange={(e) => handleInputChange('position', e.target.value)}
            className={`w-full bg-black/40 border rounded-xl px-4 py-3 text-white placeholder-cyan-400 focus:outline-none focus:border-cyan-400 focus:ring-2 focus:ring-cyan-400/30 ${
              errors.position ? 'border-red-500' : 'border-cyan-500/50'
            }`}
            placeholder="Directeur, Gérant, Responsable commercial..."
          />
          {errors.position && <p className="text-red-400 text-sm mt-1">{errors.position}</p>}
        </div>

        <div>
          <label className="block text-sm font-medium text-cyan-200 mb-2">
            Mot de passe *
          </label>
          <div className="relative">
            <input
              type={showPassword ? 'text' : 'password'}
              value={formData.password}
              onChange={(e) => handleInputChange('password', e.target.value)}
              className={`w-full bg-black/40 border rounded-xl px-4 py-3 pr-12 text-white placeholder-cyan-400 focus:outline-none focus:border-cyan-400 focus:ring-2 focus:ring-cyan-400/30 ${
                errors.password ? 'border-red-500' : 'border-cyan-500/50'
              }`}
              placeholder="Minimum 6 caractères"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-cyan-400 hover:text-cyan-300"
            >
              {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
            </button>
          </div>
          {errors.password && <p className="text-red-400 text-sm mt-1">{errors.password}</p>}
        </div>

        <div>
          <label className="block text-sm font-medium text-cyan-200 mb-2">
            Confirmer le mot de passe *
          </label>
          <div className="relative">
            <input
              type={showConfirmPassword ? 'text' : 'password'}
              value={formData.confirmPassword}
              onChange={(e) => handleInputChange('confirmPassword', e.target.value)}
              className={`w-full bg-black/40 border rounded-xl px-4 py-3 pr-12 text-white placeholder-cyan-400 focus:outline-none focus:border-cyan-400 focus:ring-2 focus:ring-cyan-400/30 ${
                errors.confirmPassword ? 'border-red-500' : 'border-cyan-500/50'
              }`}
              placeholder="Répéter le mot de passe"
            />
            <button
              type="button"
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-cyan-400 hover:text-cyan-300"
            >
              {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
            </button>
          </div>
          {errors.confirmPassword && <p className="text-red-400 text-sm mt-1">{errors.confirmPassword}</p>}
        </div>
      </div>
    </div>
  );

  const renderStep3 = () => (
    <div className="space-y-6">
      <div className="text-center mb-8">
        <CreditCard className="w-16 h-16 text-cyan-400 mx-auto mb-4" />
        <h2 className="text-2xl font-bold text-white mb-2">Choisir votre plan</h2>
        <p className="text-gray-300">14 jours d'essai gratuit sur tous les plans</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {plans.map((plan) => (
          <div
            key={plan.id}
            onClick={() => handleInputChange('selectedPlan', plan.id)}
            className={`relative cursor-pointer rounded-2xl p-6 border-2 transition-all hover:scale-105 ${
              formData.selectedPlan === plan.id
                ? 'border-cyan-500 bg-cyan-500/20 shadow-2xl shadow-cyan-500/20'
                : 'border-white/20 bg-white/10 hover:border-cyan-500/50'
            }`}
          >
            {plan.popular && (
              <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                <span className="bg-gradient-to-r from-cyan-500 to-blue-600 text-white px-4 py-1 rounded-full text-sm font-semibold">
                  Populaire
                </span>
              </div>
            )}
            
            {formData.selectedPlan === plan.id && (
              <div className="absolute top-4 right-4">
                <CheckCircle className="w-6 h-6 text-cyan-400" />
              </div>
            )}
            
            {formData.companyName && (
              <div className="mb-4 p-3 bg-cyan-500/20 rounded-lg border border-cyan-400/50">
                <p className="text-cyan-300 text-sm font-medium">Votre boutique :</p>
                <span className="text-cyan-200 text-sm">
                  {formData.companyName ? `${generateUniqueSubdomain(formData.companyName)}.omnia.sale` : 'votre-boutique.omnia.sale'}
                </span>
              </div>
            )}
            
            <div className="text-center">
              <h3 className="text-xl font-bold text-white mb-2">{plan.name}</h3>
              <div className="text-2xl font-bold text-cyan-400 mb-4">{plan.price}</div>
              <ul className="space-y-2 text-sm text-gray-300">
                {plan.features.map((feature, index) => (
                  <li key={index} className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-green-400 flex-shrink-0" />
                    {feature}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  const renderStep4 = () => (
    <div className="space-y-6">
      <div className="text-center mb-8">
        <FileText className="w-16 h-16 text-cyan-400 mx-auto mb-4" />
        <h2 className="text-2xl font-bold text-white mb-2">Documents et Validation</h2>
        <p className="text-gray-300">Finalisez votre inscription</p>
      </div>

      <div className="space-y-6">
        <div>
          <label className="block text-sm font-medium text-cyan-200 mb-2">
            Document Kbis (moins de 3 mois) *
          </label>
          
          <div className="bg-yellow-500/20 border border-yellow-400/50 rounded-xl p-4">
            <h4 className="font-semibold text-yellow-200 mb-2">⚡ Workflow automatique :</h4>
            <div className="space-y-1 text-yellow-300 text-sm">
              <div>• Validation admin sous 24h</div>
              <div>• Création automatique sous-domaine unique</div>
              <div>• Envoi identifiants de connexion</div>
              <div>• Base de données vierge initialisée</div>
            </div>
          </div>
          
          <div className="border-2 border-dashed border-cyan-500/50 rounded-xl p-6 text-center hover:border-cyan-400/70 transition-colors">
            <input
              type="file"
              accept=".pdf,.jpg,.jpeg,.png"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) handleInputChange('kbisFile', file);
              }}
              className="hidden"
              id="kbis-upload"
            />
            <label htmlFor="kbis-upload" className="cursor-pointer">
              {formData.kbisFile ? (
                <div className="text-green-400">
                  <CheckCircle className="w-8 h-8 mx-auto mb-2" />
                  <p className="font-semibold">{formData.kbisFile.name}</p>
                  <p className="text-sm text-gray-400">
                    {(formData.kbisFile.size / 1024 / 1024).toFixed(2)} MB
                  </p>
                </div>
              ) : (
                <div className="text-cyan-400">
                  <Upload className="w-8 h-8 mx-auto mb-2" />
                  <p className="font-semibold">Cliquez pour uploader</p>
                  <p className="text-sm text-gray-400">PDF, JPG, PNG (max 10MB)</p>
                </div>
              )}
            </label>
          </div>
          {errors.kbisFile && <p className="text-red-400 text-sm mt-1">{errors.kbisFile}</p>}
        </div>

        <div className="bg-blue-500/20 border border-blue-400/50 rounded-xl p-4">
          <h4 className="font-semibold text-blue-200 mb-2">📋 Récapitulatif de votre inscription :</h4>
          <div className="space-y-2 text-sm text-blue-300">
            <div className="flex justify-between">
              <span>Entreprise :</span>
              <span className="font-semibold">{formData.companyName || 'Non renseigné'}</span>
            </div>
            <div className="flex justify-between">
              <span>Contact :</span>
              <span className="font-semibold">{formData.firstName} {formData.lastName}</span>
            </div>
            <div className="flex justify-between">
              <span>Email :</span>
              <span className="font-semibold">{formData.email || 'Non renseigné'}</span>
            </div>
            <div className="flex justify-between">
              <span>Plan :</span>
              <span className="font-semibold">{plans.find(p => p.id === formData.selectedPlan)?.name}</span>
            </div>
            <div className="flex justify-between">
              <span>Sous-domaine :</span>
              <span className="font-semibold text-cyan-400">
                {formData.companyName ? 
                  `${formData.companyName.toLowerCase().replace(/[^a-z0-9]/g, '').substring(0, 20)}.omnia.sale` : 
                  'votre-boutique.omnia.sale'
                }
              </span>
            </div>
          </div>
        </div>

        <div className="flex items-start gap-3">
          <input
            type="checkbox"
            id="accept-terms"
            checked={formData.acceptTerms}
            onChange={(e) => handleInputChange('acceptTerms', e.target.checked)}
            className="w-5 h-5 text-cyan-600 bg-gray-800 border-gray-600 rounded focus:ring-cyan-500 mt-1"
          />
          <label htmlFor="accept-terms" className="text-sm text-gray-300">
            J'accepte les{' '}
            <a href="/terms" className="text-cyan-400 hover:text-cyan-300 underline">
              conditions générales d'utilisation
            </a>{' '}
            et la{' '}
            <a href="/privacy" className="text-cyan-400 hover:text-cyan-300 underline">
              politique de confidentialité
            </a>{' '}
            d'OmnIA.sale *
          </label>
        </div>
        {errors.acceptTerms && <p className="text-red-400 text-sm">{errors.acceptTerms}</p>}
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-purple-900">
      {/* Background Effects */}
      <div className="absolute inset-0 opacity-20">
        <div className="absolute top-20 left-20 w-72 h-72 bg-cyan-500/30 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-20 right-20 w-96 h-96 bg-purple-500/20 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '2s' }}></div>
      </div>

      {/* Header */}
      <header className="relative z-10 bg-black/20 backdrop-blur-xl border-b border-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <Logo size="md" />
            <button
              onClick={onBack}
              className="flex items-center gap-2 text-cyan-400 hover:text-cyan-300 transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              Retour à l'accueil
            </button>
          </div>
        </div>
      </header>

      <div className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Progress Steps */}
        <div className="flex items-center justify-center mb-12">
          {[1, 2, 3, 4].map((step) => (
            <div key={step} className="flex items-center">
              <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold ${
                currentStep >= step 
                  ? 'bg-cyan-500 text-white' 
                  : 'bg-gray-600 text-gray-300'
              }`}>
                {step}
              </div>
              {step < 4 && (
                <div className={`w-16 h-1 ${
                  currentStep > step ? 'bg-cyan-500' : 'bg-gray-600'
                }`} />
              )}
            </div>
          ))}
        </div>

        {/* Form Content */}
        <div className="bg-white/10 backdrop-blur-xl rounded-3xl p-8 border border-white/20">
          {currentStep === 1 && renderStep1()}
          {currentStep === 2 && renderStep2()}
          {currentStep === 3 && renderStep3()}
          {currentStep === 4 && renderStep4()}

          {/* Navigation Buttons */}
          <div className="flex justify-between mt-8 pt-6 border-t border-white/20">
            <button
              onClick={() => currentStep > 1 ? setCurrentStep(prev => prev - 1) : onBack()}
              className="bg-gray-600 hover:bg-gray-700 text-white px-6 py-3 rounded-xl font-semibold transition-all"
            >
              {currentStep > 1 ? 'Précédent' : 'Annuler'}
            </button>

            {currentStep < 4 ? (
              <button
                onClick={handleNext}
                className="bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white px-6 py-3 rounded-xl font-semibold transition-all"
              >
                Suivant
              </button>
            ) : (
              <button
                onClick={handleSubmit}
                disabled={isSubmitting}
                className="bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-400 hover:to-emerald-500 disabled:from-gray-600 disabled:to-gray-700 text-white px-6 py-3 rounded-xl font-semibold transition-all disabled:cursor-not-allowed flex items-center gap-2"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Envoi en cours...
                  </>
                ) : (
                  <>
                    <CheckCircle className="w-5 h-5" />
                    Finaliser l'inscription
                  </>
                )}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};