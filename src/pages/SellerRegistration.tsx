import React, { useState } from 'react';
import { 
  Building, User, Mail, Phone, MapPin, FileText, 
  Upload, ArrowLeft, CheckCircle, AlertCircle, 
  Eye, EyeOff, CreditCard, Globe, Loader2, Flag
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
  phoneCountry: string;
  position: string;
  password: string;
  confirmPassword: string;
  selectedPlan: 'starter' | 'professional' | 'enterprise';
  kbisFile: File | null;
  acceptTerms: boolean;
}

const countries = [
  { code: 'FR', name: 'France', flag: '🇫🇷', dialCode: '+33' },
  { code: 'BE', name: 'Belgique', flag: '🇧🇪', dialCode: '+32' },
  { code: 'CH', name: 'Suisse', flag: '🇨🇭', dialCode: '+41' },
  { code: 'LU', name: 'Luxembourg', flag: '🇱🇺', dialCode: '+352' },
  { code: 'CA', name: 'Canada', flag: '🇨🇦', dialCode: '+1' },
  { code: 'MC', name: 'Monaco', flag: '🇲🇨', dialCode: '+377' }
];

const positions = [
  'Directeur Général',
  'Gérant',
  'Directeur Commercial',
  'Responsable Achats',
  'Responsable Marketing',
  'Responsable E-commerce',
  'Responsable Digital',
  'Chef de Produit',
  'Responsable Magasin',
  'Propriétaire',
  'Associé',
  'Autre'
];

export const SellerRegistration: React.FC<SellerRegistrationProps> = ({ onSubmit, onBack }) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [formData, setFormData] = useState<FormData>({
    companyName: '',
    siret: '',
    address: '',
    postalCode: '',
    city: '',
    country: 'France',
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    phoneCountry: 'FR',
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
  const [authMode, setAuthMode] = useState<'signup' | 'login' | null>(null);
  const [loginData, setLoginData] = useState({ email: '', password: '' });
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const [siretValidation, setSiretValidation] = useState<'idle' | 'validating' | 'valid' | 'invalid'>('idle');

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

  const steps = [
    { id: 0, title: 'Connexion', icon: User, description: 'Email et mot de passe' },
    { id: 1, title: 'Entreprise', icon: Building, description: 'Informations société' },
    { id: 2, title: 'Contact', icon: User, description: 'Responsable compte' },
    { id: 3, title: 'Plan', icon: CreditCard, description: 'Choix abonnement' },
    { id: 4, title: 'Documents', icon: FileText, description: 'Validation Kbis' }
  ];

  // Validation SIRET française
  const validateSIRET = async (siret: string): Promise<boolean> => {
    // Supprimer tous les espaces, tirets et caractères non numériques
    const cleanSiret = siret.replace(/[\s-]/g, '');
    
    // Vérifier le format (14 chiffres)
    if (!/^\d{14}$/.test(cleanSiret)) {
      return false;
    }

    // Algorithme de validation SIRET officiel français
    const digits = cleanSiret.split('').map(Number);
    let sum = 0;
    
    for (let i = 0; i < 14; i++) {
      let digit = digits[i];
      // Pour les positions paires (index impair en base 0), multiplier par 2
      if (i % 2 === 1) {
        digit *= 2;
        if (digit > 9) {
          digit = Math.floor(digit / 10) + (digit % 10);
        }
      }
      sum += digit;
    }
    
    // Le SIRET est valide si la somme est divisible par 10
    const isValid = sum % 10 === 0;
    console.log('🔍 Validation SIRET:', cleanSiret, 'Somme:', sum, 'Valide:', isValid);
    return isValid;
  };

  // Validation email professionnel
  const validateBusinessEmail = (email: string): boolean => {
    const businessEmailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    const freeEmailProviders = ['gmail.com', 'yahoo.com', 'hotmail.com', 'outlook.com', 'free.fr', 'orange.fr'];
    
    if (!businessEmailRegex.test(email)) return false;
    
    const domain = email.split('@')[1]?.toLowerCase();
    return !freeEmailProviders.includes(domain);
  };

  // Validation téléphone français
  const validateFrenchPhone = (phone: string, countryCode: string): boolean => {
    const cleanPhone = phone.replace(/\s/g, '');
    
    switch (countryCode) {
      case 'FR':
        return /^(?:\+33|0)[1-9](?:[0-9]{8})$/.test(cleanPhone);
      case 'BE':
        return /^(?:\+32|0)[1-9](?:[0-9]{7,8})$/.test(cleanPhone);
      case 'CH':
        return /^(?:\+41|0)[1-9](?:[0-9]{8})$/.test(cleanPhone);
      case 'LU':
        return /^(?:\+352)[1-9](?:[0-9]{5,8})$/.test(cleanPhone);
      case 'CA':
        return /^(?:\+1)[2-9](?:[0-9]{9})$/.test(cleanPhone);
      default:
        return cleanPhone.length >= 8;
    }
  };

  // Validation code postal
  const validatePostalCode = (postalCode: string, country: string): boolean => {
    switch (country) {
      case 'France':
        return /^[0-9]{5}$/.test(postalCode);
      case 'Belgique':
        return /^[0-9]{4}$/.test(postalCode);
      case 'Suisse':
        return /^[0-9]{4}$/.test(postalCode);
      case 'Luxembourg':
        return /^[0-9]{4}$/.test(postalCode);
      case 'Canada':
        return /^[A-Za-z]\d[A-Za-z][ -]?\d[A-Za-z]\d$/.test(postalCode);
      default:
        return postalCode.length >= 3;
    }
  };

  const handleInputChange = (field: keyof FormData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    
    // Validation en temps réel pour SIRET
    if (field === 'siret' && value.length >= 14) {
      setSiretValidation('validating');
      validateSIRET(value).then(isValid => {
        setSiretValidation(isValid ? 'valid' : 'invalid');
      });
    }
    
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const handleLogin = async () => {
    if (!loginData.email || !loginData.password) {
      setErrors({ login: 'Email et mot de passe requis' });
      return;
    }

    setIsLoggingIn(true);
    
    try {
      await new Promise(resolve => setTimeout(resolve, 1000));
      console.log('🔐 Connexion réussie:', loginData.email);
      window.location.href = '/admin';
    } catch (error) {
      setErrors({ login: 'Erreur de connexion' });
    } finally {
      setIsLoggingIn(false);
    }
  };

  const validateStep = (step: number): boolean => {
    const newErrors: {[key: string]: string} = {};

    if (step === 0 && authMode === 'signup') {
      if (!formData.email.trim()) {
        newErrors.email = 'Email requis';
      } else if (!validateBusinessEmail(formData.email)) {
        newErrors.email = 'Email professionnel requis (pas Gmail, Yahoo, etc.)';
      }
      
      if (!formData.password.trim()) {
        newErrors.password = 'Mot de passe requis';
      } else if (formData.password.length < 8) {
        newErrors.password = 'Mot de passe trop court (min 8 caractères)';
      } else if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(formData.password)) {
        newErrors.password = 'Mot de passe doit contenir : minuscule, majuscule, chiffre';
      }
      
      if (formData.password !== formData.confirmPassword) {
        newErrors.confirmPassword = 'Mots de passe différents';
      }
    }

    if (step === 1) {
      if (!formData.companyName.trim()) {
        newErrors.companyName = 'Nom de l\'entreprise requis';
      } else if (formData.companyName.length < 2) {
        newErrors.companyName = 'Nom trop court (min 2 caractères)';
      }
      
      if (!formData.siret.trim()) {
        newErrors.siret = 'SIRET requis';
      } else if (siretValidation === 'invalid') {
        newErrors.siret = 'SIRET invalide (14 chiffres requis)';
      }
      
      if (!formData.address.trim()) {
        newErrors.address = 'Adresse requise';
      }
      
      if (!formData.postalCode.trim()) {
        newErrors.postalCode = 'Code postal requis';
      } else if (!validatePostalCode(formData.postalCode, formData.country)) {
        newErrors.postalCode = `Code postal invalide pour ${formData.country}`;
      }
      
      if (!formData.city.trim()) {
        newErrors.city = 'Ville requise';
      }
      
      if (!formData.country.trim()) {
        newErrors.country = 'Pays requis';
      }
    }

    if (step === 2) {
      if (!formData.firstName.trim()) {
        newErrors.firstName = 'Prénom requis';
      }
      
      if (!formData.lastName.trim()) {
        newErrors.lastName = 'Nom requis';
      }
      
      if (!formData.phone.trim()) {
        newErrors.phone = 'Téléphone requis';
      } else if (!validateFrenchPhone(formData.phone, formData.phoneCountry)) {
        const selectedCountry = countries.find(c => c.code === formData.phoneCountry);
        newErrors.phone = `Format téléphone invalide pour ${selectedCountry?.name}`;
      }
      
      if (!formData.position.trim()) {
        newErrors.position = 'Fonction requise';
      }
    }

    if (step === 4) {
      if (!formData.kbisFile) {
        newErrors.kbisFile = 'Document Kbis requis (PDF, JPG, PNG)';
      } else if (formData.kbisFile.size > 10 * 1024 * 1024) {
        newErrors.kbisFile = 'Fichier trop volumineux (max 10MB)';
      }
      
      if (!formData.acceptTerms) {
        newErrors.acceptTerms = 'Acceptation des conditions requise';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    if (currentStep === 0) {
      if (authMode === 'signup') {
        if (validateStep(0)) {
          setCurrentStep(1);
        }
      } else {
        handleLogin();
      }
    } else if (validateStep(currentStep)) {
      setCurrentStep(prev => prev + 1);
    }
  };

  const handleSubmit = async () => {
    console.log('🔄 Tentative de finalisation inscription...');

    // Validation finale complète
    const finalErrors: {[key: string]: string} = {};
    
    // Vérifications obligatoires
    if (!formData.companyName.trim()) finalErrors.companyName = 'Nom entreprise requis';
    if (!formData.siret.trim()) finalErrors.siret = 'SIRET requis';
    if (siretValidation !== 'valid') finalErrors.siret = 'SIRET invalide';
    if (!formData.email.trim()) finalErrors.email = 'Email requis';
    if (!validateBusinessEmail(formData.email)) finalErrors.email = 'Email professionnel requis';
    if (!formData.firstName.trim()) finalErrors.firstName = 'Prénom requis';
    if (!formData.lastName.trim()) finalErrors.lastName = 'Nom requis';
    if (!formData.phone.trim()) finalErrors.phone = 'Téléphone requis';
    if (!validateFrenchPhone(formData.phone, formData.phoneCountry)) finalErrors.phone = 'Téléphone invalide';
    if (!formData.position.trim()) finalErrors.position = 'Fonction requise';
    if (!formData.address.trim()) finalErrors.address = 'Adresse requise';
    if (!formData.city.trim()) finalErrors.city = 'Ville requise';
    if (!validatePostalCode(formData.postalCode, formData.country)) finalErrors.postalCode = 'Code postal invalide';
    if (!formData.kbisFile) finalErrors.kbisFile = 'Document Kbis requis';
    if (!formData.acceptTerms) finalErrors.acceptTerms = 'Acceptation des conditions requise';
    
    if (Object.keys(finalErrors).length > 0) {
      setErrors(finalErrors);
      console.log('❌ Erreurs de validation:', finalErrors);
      
      // Retourner à la première étape avec erreur
      const firstErrorStep = Object.keys(finalErrors)[0];
      if (['email', 'password'].includes(firstErrorStep)) setCurrentStep(0);
      else if (['companyName', 'siret', 'address'].includes(firstErrorStep)) setCurrentStep(1);
      else if (['firstName', 'lastName', 'phone'].includes(firstErrorStep)) setCurrentStep(2);
      else if (['kbisFile', 'acceptTerms'].includes(firstErrorStep)) setCurrentStep(4);
      
      return;
    }

    setIsSubmitting(true);
    console.log('✅ Validation réussie, envoi en cours...');
    
    try {
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      const selectedCountry = countries.find(c => c.name === formData.country);
      const selectedPhoneCountry = countries.find(c => c.code === formData.phoneCountry);
      
      const submissionData = {
        ...formData,
        id: Date.now().toString(),
        submittedAt: new Date().toISOString(),
        status: 'pending',
        proposedSubdomain: formData.companyName.toLowerCase().replace(/[^a-z0-9]/g, '').substring(0, 20),
        fullPhone: `${selectedPhoneCountry?.dialCode} ${formData.phone}`,
        countryFlag: selectedCountry?.flag,
        phoneCountryFlag: selectedPhoneCountry?.flag
      };
      
      console.log('✅ Inscription finalisée avec succès');
      onSubmit(submissionData);
    } catch (error) {
      console.error('Erreur soumission:', error);
      setErrors({ submit: 'Erreur lors de l\'envoi. Veuillez réessayer.' });
    } finally {
      setIsSubmitting(false);
    }
  };

  const formatSIRET = (value: string) => {
    const cleaned = value.replace(/\D/g, '').substring(0, 14);
    const formatted = cleaned.replace(/(\d{3})(\d{3})(\d{3})(\d{5})/, '$1 $2 $3 $4');
    return formatted.substring(0, 17); // 14 chiffres + 3 espaces
  };

  const formatPhone = (value: string) => {
    const cleaned = value.replace(/\D/g, '');
    if (formData.phoneCountry === 'FR') {
      return cleaned.replace(/(\d{2})(\d{2})(\d{2})(\d{2})(\d{2})/, '$1 $2 $3 $4 $5').substring(0, 14);
    }
    return cleaned;
  };

  const renderStep0 = () => (
    <div className="space-y-8">
      <div className="text-center mb-8">
        <div className="w-20 h-20 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-2xl">
          <User className="w-10 h-10 text-white" />
        </div>
        <h2 className="text-3xl font-bold text-white mb-4">Bienvenue sur OmnIA.sale</h2>
        <p className="text-xl text-gray-300">Plateforme IA pour revendeurs de mobilier</p>
      </div>

      {!authMode ? (
        <div className="space-y-6">
          <div className="text-center mb-8">
            <h3 className="text-2xl font-bold text-white mb-4">Choisissez votre action</h3>
            <p className="text-gray-300">Vous avez déjà un compte ou souhaitez en créer un ?</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <button
              onClick={() => setAuthMode('login')}
              className="bg-white/10 hover:bg-white/20 border border-white/20 hover:border-cyan-500/50 rounded-2xl p-8 text-center transition-all hover:scale-105"
            >
              <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-cyan-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <User className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-bold text-white mb-2">Se connecter</h3>
              <p className="text-gray-300">J'ai déjà un compte revendeur</p>
            </button>

            <button
              onClick={() => setAuthMode('signup')}
              className="bg-gradient-to-br from-cyan-500/20 to-blue-600/20 hover:from-cyan-500/30 hover:to-blue-600/30 border border-cyan-500/50 hover:border-cyan-400 rounded-2xl p-8 text-center transition-all hover:scale-105"
            >
              <div className="w-16 h-16 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <Building className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-bold text-white mb-2">Créer un compte</h3>
              <p className="text-gray-300">Nouveau revendeur sur OmnIA</p>
            </button>
          </div>

          <div className="bg-blue-500/20 border border-blue-400/50 rounded-xl p-6 text-center">
            <h4 className="font-semibold text-blue-200 mb-3">🎁 Offre de lancement :</h4>
            <p className="text-blue-300">
              <strong>14 jours d'essai gratuit</strong> sur tous les plans • Aucun engagement • Support inclus
            </p>
          </div>
        </div>
      ) : authMode === 'login' ? (
        <div className="space-y-6">
          <div className="text-center mb-6">
            <h3 className="text-2xl font-bold text-white mb-2">Connexion Revendeur</h3>
            <p className="text-gray-300">Accédez à votre interface admin OmnIA</p>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-cyan-200 mb-2">
                Email professionnel
              </label>
              <input
                type="email"
                value={loginData.email}
                onChange={(e) => setLoginData(prev => ({ ...prev, email: e.target.value }))}
                className="w-full bg-black/40 border border-cyan-500/50 rounded-xl px-4 py-3 text-white placeholder-cyan-400 focus:outline-none focus:border-cyan-400 focus:ring-2 focus:ring-cyan-400/30"
                placeholder="contact@monmagasin.fr"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-cyan-200 mb-2">
                Mot de passe
              </label>
              <input
                type="password"
                value={loginData.password}
                onChange={(e) => setLoginData(prev => ({ ...prev, password: e.target.value }))}
                className="w-full bg-black/40 border border-cyan-500/50 rounded-xl px-4 py-3 text-white placeholder-cyan-400 focus:outline-none focus:border-cyan-400 focus:ring-2 focus:ring-cyan-400/30"
                placeholder="••••••••"
              />
            </div>

            {errors.login && (
              <div className="bg-red-500/20 border border-red-400/50 rounded-xl p-3">
                <p className="text-red-300 text-sm">{errors.login}</p>
              </div>
            )}

            <div className="bg-blue-500/20 border border-blue-400/50 rounded-xl p-4">
              <h4 className="font-semibold text-blue-200 mb-2">🔧 Comptes de test :</h4>
              <div className="space-y-1 text-sm">
                <p className="text-blue-300"><strong>Decora Home:</strong> demo@decorahome.fr / demo123</p>
                <p className="text-blue-300"><strong>Mobilier Design:</strong> contact@mobilierdesign.fr / design123</p>
                <p className="text-blue-300"><strong>Déco Contemporain:</strong> info@decocontemporain.com / deco123</p>
              </div>
            </div>
          </div>

          <div className="flex gap-4">
            <button
              onClick={() => setAuthMode(null)}
              className="flex-1 bg-gray-600 hover:bg-gray-700 text-white py-3 rounded-xl font-semibold transition-all"
            >
              Retour
            </button>
            <button
              onClick={handleLogin}
              disabled={isLoggingIn}
              className="flex-1 bg-gradient-to-r from-blue-500 to-cyan-600 hover:from-blue-400 hover:to-cyan-500 disabled:from-gray-600 disabled:to-gray-700 text-white py-3 rounded-xl font-semibold transition-all flex items-center justify-center gap-2"
            >
              {isLoggingIn ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Connexion...
                </>
              ) : (
                'Se connecter'
              )}
            </button>
          </div>
        </div>
      ) : (
        <div className="space-y-6">
          <div className="text-center mb-6">
            <h3 className="text-2xl font-bold text-white mb-2">Email et Mot de Passe</h3>
            <p className="text-gray-300">Créez vos identifiants de connexion sécurisés</p>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-cyan-200 mb-2">
                Email professionnel * <span className="text-xs text-gray-400">(pas Gmail, Yahoo, etc.)</span>
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
                Mot de passe * <span className="text-xs text-gray-400">(min 8 car., maj, min, chiffre)</span>
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={formData.password}
                  onChange={(e) => handleInputChange('password', e.target.value)}
                  className={`w-full bg-black/40 border rounded-xl px-4 py-3 pr-12 text-white placeholder-cyan-400 focus:outline-none focus:border-cyan-400 focus:ring-2 focus:ring-cyan-400/30 ${
                    errors.password ? 'border-red-500' : 'border-cyan-500/50'
                  }`}
                  placeholder="Mot de passe sécurisé"
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

          <div className="bg-green-500/20 border border-green-400/50 rounded-xl p-6">
            <h4 className="font-semibold text-green-200 mb-3">✅ Avantages revendeur OmnIA :</h4>
            <ul className="text-green-300 space-y-2 text-sm">
              <li>• Assistant IA personnalisé pour votre catalogue</li>
              <li>• Interface admin complète et intuitive</li>
              <li>• Sous-domaine personnalisé (votre-boutique.omnia.sale)</li>
              <li>• Widget intégrable sur votre site</li>
              <li>• Analytics détaillées et reporting</li>
              <li>• Support technique dédié</li>
            </ul>
          </div>

          <div className="flex gap-4">
            <button
              onClick={() => setAuthMode(null)}
              className="flex-1 bg-gray-600 hover:bg-gray-700 text-white py-3 rounded-xl font-semibold transition-all"
            >
              Retour
            </button>
            <button
              onClick={() => {
                if (validateStep(0)) {
                  setCurrentStep(1);
                }
              }}
              className="flex-1 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white py-3 rounded-xl font-semibold transition-all"
            >
              Continuer l'inscription
            </button>
          </div>
        </div>
      )}
    </div>
  );

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
          {formData.companyName && (
            <p className="text-cyan-300 text-sm mt-1">
              🌐 Sous-domaine : <strong>{formData.companyName.toLowerCase().replace(/[^a-z0-9]/g, '').substring(0, 20)}.omnia.sale</strong>
            </p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-cyan-200 mb-2">
            SIRET * <span className="text-xs text-gray-400">(14 chiffres)</span>
          </label>
          <div className="relative">
            <input
              type="text"
              value={formData.siret}
              onChange={(e) => {
                const formatted = formatSIRET(e.target.value);
                handleInputChange('siret', formatted);
              }}
              className={`w-full bg-black/40 border rounded-xl px-4 py-3 pr-12 text-white placeholder-cyan-400 focus:outline-none focus:border-cyan-400 focus:ring-2 focus:ring-cyan-400/30 ${
                errors.siret ? 'border-red-500' : 
                siretValidation === 'valid' ? 'border-green-500' :
                siretValidation === 'invalid' ? 'border-red-500' :
                'border-cyan-500/50'
              }`}
              placeholder="123 456 789 01234"
              maxLength={17}
            />
            <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
              {siretValidation === 'validating' && <Loader2 className="w-5 h-5 text-yellow-400 animate-spin" />}
              {siretValidation === 'valid' && <CheckCircle className="w-5 h-5 text-green-400" />}
              {siretValidation === 'invalid' && <AlertCircle className="w-5 h-5 text-red-400" />}
            </div>
          </div>
          {errors.siret && <p className="text-red-400 text-sm mt-1">{errors.siret}</p>}
          {siretValidation === 'valid' && (
            <p className="text-green-400 text-sm mt-1">✅ SIRET valide</p>
          )}
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
            {countries.map(country => (
              <option key={country.code} value={country.name}>
                {country.flag} {country.name}
              </option>
            ))}
          </select>
          {errors.country && <p className="text-red-400 text-sm mt-1">{errors.country}</p>}
        </div>

        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-cyan-200 mb-2">
            Adresse complète *
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
            onChange={(e) => handleInputChange('postalCode', e.target.value.toUpperCase())}
            className={`w-full bg-black/40 border rounded-xl px-4 py-3 text-white placeholder-cyan-400 focus:outline-none focus:border-cyan-400 focus:ring-2 focus:ring-cyan-400/30 ${
              errors.postalCode ? 'border-red-500' : 'border-cyan-500/50'
            }`}
            placeholder={formData.country === 'France' ? '75008' : formData.country === 'Canada' ? 'H3B 2Y7' : '1000'}
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

      <div className="bg-yellow-500/20 border border-yellow-400/50 rounded-xl p-4">
        <h4 className="font-semibold text-yellow-200 mb-2">📋 Informations requises :</h4>
        <ul className="text-yellow-300 text-sm space-y-1">
          <li>• SIRET français valide (14 chiffres)</li>
          <li>• Adresse du siège social</li>
          <li>• Email professionnel (domaine entreprise)</li>
          <li>• Document Kbis de moins de 3 mois</li>
        </ul>
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
            Prénom du responsable *
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
            Nom du responsable *
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

        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-cyan-200 mb-2">
            Téléphone professionnel *
          </label>
          <div className="flex gap-3">
            <select
              value={formData.phoneCountry}
              onChange={(e) => handleInputChange('phoneCountry', e.target.value)}
              className="bg-black/40 border border-cyan-500/50 rounded-xl px-3 py-3 text-white focus:outline-none focus:border-cyan-400"
            >
              {countries.map(country => (
                <option key={country.code} value={country.code}>
                  {country.flag} {country.dialCode}
                </option>
              ))}
            </select>
            <input
              type="tel"
              value={formData.phone}
              onChange={(e) => {
                const formatted = formatPhone(e.target.value);
                handleInputChange('phone', formatted);
              }}
              className={`flex-1 bg-black/40 border rounded-xl px-4 py-3 text-white placeholder-cyan-400 focus:outline-none focus:border-cyan-400 focus:ring-2 focus:ring-cyan-400/30 ${
                errors.phone ? 'border-red-500' : 'border-cyan-500/50'
              }`}
              placeholder={formData.phoneCountry === 'FR' ? '01 23 45 67 89' : 'Numéro de téléphone'}
            />
          </div>
          {errors.phone && <p className="text-red-400 text-sm mt-1">{errors.phone}</p>}
          {formData.phone && validateFrenchPhone(formData.phone, formData.phoneCountry) && (
            <p className="text-green-400 text-sm mt-1">
              ✅ {countries.find(c => c.code === formData.phoneCountry)?.dialCode} {formData.phone}
            </p>
          )}
        </div>

        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-cyan-200 mb-2">
            Fonction dans l'entreprise *
          </label>
          <select
            value={formData.position}
            onChange={(e) => handleInputChange('position', e.target.value)}
            className={`w-full bg-black/40 border rounded-xl px-4 py-3 text-white focus:outline-none focus:border-cyan-400 focus:ring-2 focus:ring-cyan-400/30 ${
              errors.position ? 'border-red-500' : 'border-cyan-500/50'
            }`}
          >
            <option value="">Sélectionner votre fonction</option>
            {positions.map(position => (
              <option key={position} value={position}>{position}</option>
            ))}
          </select>
          {errors.position && <p className="text-red-400 text-sm mt-1">{errors.position}</p>}
        </div>
      </div>

      <div className="bg-cyan-500/20 border border-cyan-400/50 rounded-xl p-6">
        <h4 className="font-semibold text-cyan-200 mb-3">🌐 Votre sous-domaine OmnIA :</h4>
        <div className="text-center">
          <div className="text-2xl font-bold text-cyan-400 mb-2">
            {formData.companyName ? 
              `${formData.companyName.toLowerCase().replace(/[^a-z0-9]/g, '').substring(0, 20)}.omnia.sale` : 
              'votre-boutique.omnia.sale'
            }
          </div>
          <p className="text-cyan-300 text-sm">Interface admin et chat client personnalisés</p>
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
                <span className="bg-gradient-to-r from-cyan-500 to-blue-600 text-white px-3 py-1 rounded-full text-xs font-bold">
                  POPULAIRE
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
          <div className={`border-2 border-dashed rounded-xl p-6 text-center transition-colors ${
            formData.kbisFile ? 'border-green-500/50 bg-green-500/10' : 'border-cyan-500/50 hover:border-cyan-400/70'
          }`}>
            <input
              type="file"
              accept=".pdf,.jpg,.jpeg,.png"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) {
                  if (file.size > 10 * 1024 * 1024) {
                    setErrors(prev => ({ ...prev, kbisFile: 'Fichier trop volumineux (max 10MB)' }));
                    return;
                  }
                  handleInputChange('kbisFile', file);
                  setErrors(prev => ({ ...prev, kbisFile: '' }));
                }
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
                  <button
                    type="button"
                    onClick={(e) => {
                      e.preventDefault();
                      handleInputChange('kbisFile', null);
                    }}
                    className="mt-2 text-red-400 hover:text-red-300 text-sm underline"
                  >
                    Changer de fichier
                  </button>
                </div>
              ) : (
                <div className="text-cyan-400">
                  <Upload className="w-8 h-8 mx-auto mb-2" />
                  <p className="font-semibold">Cliquez pour uploader le Kbis</p>
                  <p className="text-sm text-gray-400">PDF, JPG, PNG (max 10MB)</p>
                </div>
              )}
            </label>
          </div>
          {errors.kbisFile && <p className="text-red-400 text-sm mt-1">{errors.kbisFile}</p>}
        </div>

        <div className="bg-blue-500/20 border border-blue-400/50 rounded-xl p-6">
          <h4 className="font-semibold text-blue-200 mb-4">📋 Récapitulatif de votre inscription :</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-blue-300">Entreprise :</span>
                <span className="font-semibold text-white">{formData.companyName || 'Non renseigné'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-blue-300">SIRET :</span>
                <span className="font-semibold text-white">{formData.siret || 'Non renseigné'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-blue-300">Contact :</span>
                <span className="font-semibold text-white">{formData.firstName} {formData.lastName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-blue-300">Email :</span>
                <span className="font-semibold text-white">{formData.email || 'Non renseigné'}</span>
              </div>
            </div>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-blue-300">Téléphone :</span>
                <span className="font-semibold text-white">
                  {formData.phone ? `${countries.find(c => c.code === formData.phoneCountry)?.dialCode} ${formData.phone}` : 'Non renseigné'}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-blue-300">Fonction :</span>
                <span className="font-semibold text-white">{formData.position || 'Non renseignée'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-blue-300">Plan :</span>
                <span className="font-semibold text-cyan-400">{plans.find(p => p.id === formData.selectedPlan)?.name}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-blue-300">Sous-domaine :</span>
                <span className="font-semibold text-cyan-400">
                  {formData.companyName ? 
                    `${formData.companyName.toLowerCase().replace(/[^a-z0-9]/g, '').substring(0, 20)}.omnia.sale` : 
                    'votre-boutique.omnia.sale'
                  }
                </span>
              </div>
            </div>
          </div>
        </div>

        <div className="flex items-start gap-3">
          <input
            type="checkbox"
            id="accept-terms"
            checked={formData.acceptTerms}
            onChange={(e) => handleInputChange('acceptTerms', e.target.checked)}
            className={`w-5 h-5 text-cyan-600 bg-gray-800 border-gray-600 rounded focus:ring-cyan-500 mt-1 ${
              errors.acceptTerms ? 'border-red-500' : ''
            }`}
          />
          <label htmlFor="accept-terms" className="text-sm text-gray-300">
            J'accepte les{' '}
            <a href="/terms" target="_blank" className="text-cyan-400 hover:text-cyan-300 underline">
              conditions générales d'utilisation
            </a>{' '}
            et la{' '}
            <a href="/privacy" target="_blank" className="text-cyan-400 hover:text-cyan-300 underline">
              politique de confidentialité
            </a>{' '}
            d'OmnIA.sale *
          </label>
        </div>
        {errors.acceptTerms && <p className="text-red-400 text-sm">{errors.acceptTerms}</p>}

        {errors.submit && (
          <div className="bg-red-500/20 border border-red-400/50 rounded-xl p-4">
            <div className="flex items-center gap-2">
              <AlertCircle className="w-5 h-5 text-red-400" />
              <span className="text-red-300">{errors.submit}</span>
            </div>
          </div>
        )}

        <div className="bg-green-500/20 border border-green-400/50 rounded-xl p-4">
          <h4 className="font-semibold text-green-200 mb-2">✅ Après validation (24-48h) :</h4>
          <ul className="text-green-300 text-sm space-y-1">
            <li>• Email de confirmation avec identifiants</li>
            <li>• Accès à votre interface admin personnalisée</li>
            <li>• Sous-domaine {formData.companyName ? 
              `${formData.companyName.toLowerCase().replace(/[^a-z0-9]/g, '').substring(0, 20)}.omnia.sale` : 
              'votre-boutique.omnia.sale'} activé</li>
            <li>• Formation et accompagnement inclus</li>
          </ul>
        </div>
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
        <div className="mb-8">
          <div className="flex items-center justify-center gap-2 sm:gap-4 px-4">
            {steps.map((step, index) => {
              const StepIcon = step.icon;
              const isActive = currentStep === step.id;
              const isCompleted = currentStep > step.id;
              const isAccessible = currentStep >= step.id || (step.id === 0);
              
              return (
                <React.Fragment key={step.id}>
                  <div 
                    className={`relative w-12 h-12 rounded-2xl flex items-center justify-center font-bold transition-all duration-300 ${
                      isCompleted 
                        ? 'bg-green-500 text-white shadow-lg shadow-green-500/30' 
                        : isActive 
                          ? 'bg-cyan-500 text-white shadow-lg shadow-cyan-500/30 scale-110' 
                          : isAccessible
                            ? 'bg-gray-600 text-gray-300 hover:bg-gray-500 cursor-pointer'
                            : 'bg-gray-700 text-gray-500'
                      Email *
                    onClick={() => isAccessible && authMode === 'signup' && setCurrentStep(step.id)}
                    title={step.description}
                  >
                    {isCompleted ? (
                      <CheckCircle className="w-6 h-6" />
                    ) : (
                      <StepIcon className="w-6 h-6" />
                    )}
                      placeholder="contact@monentreprise.fr ou email@gmail.com"
                    {/* Badge numéro d'étape */}
                    <div className={`absolute -top-2 -right-2 w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                      isCompleted ? 'bg-green-600' : isActive ? 'bg-cyan-600' : 'bg-gray-600'
                  </div>
                  
                  {/* Ligne de connexion */}
                  {index < steps.length - 1 && (
                    <div className={`w-4 sm:w-8 lg:w-16 h-1 transition-all ${
                      currentStep > step.id ? 'bg-cyan-500' : 'bg-gray-600'
                    }`} />
                  )}
                </React.Fragment>
              );
            })}
          </div>
        </div>

        {/* Titre et description de l'étape actuelle */}
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-white mb-2">
            {steps.find(s => s.id === currentStep)?.title || 'Inscription'}
          </h1>
          <p className="text-gray-300">
            {steps.find(s => s.id === currentStep)?.description || 'Processus d\'inscription'}
          </p>
        </div>

        {/* Form Content */}
        <div className="bg-white/10 backdrop-blur-xl rounded-3xl p-8 border border-white/20">
          {currentStep === 0 && renderStep0()}
          {currentStep === 1 && renderStep1()}
          {currentStep === 2 && renderStep2()}
          {currentStep === 3 && renderStep3()}
          {currentStep === 4 && renderStep4()}

          {/* Navigation Buttons */}
          {currentStep > 0 && authMode === 'signup' && (
            <div className="flex justify-between mt-8 pt-6 border-t border-white/20">
              <button
                onClick={() => currentStep > 1 ? setCurrentStep(prev => prev - 1) : setAuthMode(null)}
                className="bg-gray-600 hover:bg-gray-700 text-white px-6 py-3 rounded-xl font-semibold transition-all"
              >
                {currentStep > 1 ? 'Précédent' : 'Retour'}
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
                  disabled={isSubmitting || !formData.acceptTerms || !formData.kbisFile || siretValidation !== 'valid'}
                  className="bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-400 hover:to-emerald-500 disabled:from-gray-600 disabled:to-gray-700 text-white px-6 py-3 rounded-xl font-semibold transition-all disabled:cursor-not-allowed flex items-center gap-2 shadow-lg hover:shadow-green-500/30"
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
          )}
        </div>
      </div>
    </div>
  );
};