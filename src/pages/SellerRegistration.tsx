import React, { useState } from 'react';
import { 
  Building, User, Mail, Phone, MapPin, FileText, 
  Upload, ArrowLeft, CheckCircle, AlertCircle, 
  Eye, EyeOff, CreditCard, Globe, Loader2, Flag,
  Lock, Shield, Calendar, Clock, Sparkles
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
  acceptNewsletter: boolean;
}

interface StepStatus {
  completed: boolean;
  current: boolean;
  hasErrors: boolean;
}

export const SellerRegistration: React.FC<SellerRegistrationProps> = ({ onSubmit, onBack }) => {
  const [currentStep, setCurrentStep] = useState(1);
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
    position: '',
    password: '',
    confirmPassword: '',
    selectedPlan: 'professional',
    kbisFile: null,
    acceptTerms: false,
    acceptNewsletter: true
  });
  const [errors, setErrors] = useState<{[key: string]: string}>({});
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [stepStatuses, setStepStatuses] = useState<{[key: number]: StepStatus}>({
    1: { completed: false, current: true, hasErrors: false },
    2: { completed: false, current: false, hasErrors: false },
    3: { completed: false, current: false, hasErrors: false },
    4: { completed: false, current: false, hasErrors: false }
  });

  const countries = [
    { code: 'FR', name: 'France', flag: '🇫🇷' },
    { code: 'BE', name: 'Belgique', flag: '🇧🇪' },
    { code: 'CH', name: 'Suisse', flag: '🇨🇭' },
    { code: 'LU', name: 'Luxembourg', flag: '🇱🇺' },
    { code: 'CA', name: 'Canada', flag: '🇨🇦' },
    { code: 'MC', name: 'Monaco', flag: '🇲🇨' },
    { code: 'DE', name: 'Allemagne', flag: '🇩🇪' },
    { code: 'IT', name: 'Italie', flag: '🇮🇹' },
    { code: 'ES', name: 'Espagne', flag: '🇪🇸' },
    { code: 'PT', name: 'Portugal', flag: '🇵🇹' },
    { code: 'NL', name: 'Pays-Bas', flag: '🇳🇱' },
    { code: 'AT', name: 'Autriche', flag: '🇦🇹' }
  ];

  const steps = [
    { 
      id: 1, 
      title: 'Entreprise', 
      icon: Building, 
      description: 'Informations société',
      fields: ['companyName', 'siret', 'address', 'postalCode', 'city', 'country']
    },
    { 
      id: 2, 
      title: 'Contact', 
      icon: User, 
      description: 'Responsable compte',
      fields: ['firstName', 'lastName', 'email', 'phone', 'position', 'password', 'confirmPassword']
    },
    { 
      id: 3, 
      title: 'Plan', 
      icon: CreditCard, 
      description: 'Abonnement OmnIA',
      fields: ['selectedPlan']
    },
    { 
      id: 4, 
      title: 'Validation', 
      icon: Shield, 
      description: 'Documents & CGU',
      fields: ['kbisFile', 'acceptTerms']
    }
  ];

  const plans = [
    {
      id: 'starter',
      name: 'Starter',
      price: '29€/mois',
      description: 'Parfait pour débuter',
      features: [
        '1000 conversations/mois',
        '500 produits max',
        'Support email',
        'Widget personnalisable',
        'Analytics de base',
        'Google Merchant basique'
      ],
      color: 'from-gray-600 to-gray-700'
    },
    {
      id: 'professional',
      name: 'Professional',
      price: '79€/mois',
      description: 'Le plus populaire',
      features: [
        '5000 conversations/mois',
        'Produits illimités',
        'Support prioritaire',
        'Domaine personnalisé',
        'Analytics avancées',
        'API complète',
        'Vision AR/VR (NOUVEAU)',
        'Google Ads automatique',
        'SEO Blog IA',
        'Catalogue enrichi IA'
      ],
      popular: true,
      color: 'from-cyan-500 to-blue-600'
    },
    {
      id: 'enterprise',
      name: 'Enterprise',
      price: '199€/mois',
      description: 'Pour les grandes enseignes',
      features: [
        'Conversations illimitées',
        'Multi-magasins',
        'Support dédié',
        'White-label',
        'API personnalisée',
        'Formation équipe',
        'Showroom robot physique',
        'IA prédictive avancée',
        'Marketplace intégration',
        'Insights business IA'
      ],
      color: 'from-purple-500 to-pink-600'
    }
  ];

  const validateField = (field: string, value: any): string => {
    switch (field) {
      case 'companyName':
        if (!value || value.trim().length < 2) return 'Nom d\'entreprise requis (min. 2 caractères)';
        break;
      case 'siret':
        if (!value || value.trim().length !== 14) return 'SIRET requis (14 chiffres)';
        if (!/^\d{14}$/.test(value.replace(/\s/g, ''))) return 'SIRET invalide (chiffres uniquement)';
        break;
      case 'address':
        if (!value || value.trim().length < 5) return 'Adresse requise (min. 5 caractères)';
        break;
      case 'postalCode':
        if (!value || value.trim().length < 4) return 'Code postal requis';
        break;
      case 'city':
        if (!value || value.trim().length < 2) return 'Ville requise';
        break;
      case 'country':
        if (!value) return 'Pays requis';
        break;
      case 'firstName':
        if (!value || value.trim().length < 2) return 'Prénom requis (min. 2 caractères)';
        break;
      case 'lastName':
        if (!value || value.trim().length < 2) return 'Nom requis (min. 2 caractères)';
        break;
      case 'email':
        if (!value) return 'Email requis';
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) return 'Email invalide';
        break;
      case 'phone':
        if (!value) return 'Téléphone requis';
        if (!/^[\+]?[0-9\s\-\(\)]{8,}$/.test(value)) return 'Numéro de téléphone invalide';
        break;
      case 'position':
        if (!value || value.trim().length < 2) return 'Fonction requise';
        break;
      case 'password':
        if (!value) return 'Mot de passe requis';
        if (value.length < 8) return 'Minimum 8 caractères';
        if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(value)) return 'Doit contenir : minuscule, majuscule, chiffre';
        break;
      case 'confirmPassword':
        if (!value) return 'Confirmation requise';
        if (value !== formData.password) return 'Mots de passe différents';
        break;
      case 'kbisFile':
        if (!value) return 'Document Kbis requis';
        if (value.size > 10 * 1024 * 1024) return 'Fichier trop volumineux (max 10MB)';
        break;
      case 'acceptTerms':
        if (!value) return 'Acceptation des conditions requise';
        break;
    }
    return '';
  };

  const handleInputChange = (field: keyof FormData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    
    // Validation en temps réel
    const error = validateField(field, value);
    setErrors(prev => ({ ...prev, [field]: error }));
    
    // Mettre à jour le statut de l'étape
    updateStepStatus(currentStep);
  };

  const updateStepStatus = (step: number) => {
    const stepInfo = steps.find(s => s.id === step);
    if (!stepInfo) return;

    const hasErrors = stepInfo.fields.some(field => {
      const value = formData[field as keyof FormData];
      return validateField(field, value) !== '';
    });

    const isCompleted = stepInfo.fields.every(field => {
      const value = formData[field as keyof FormData];
      return value && validateField(field, value) === '';
    });

    setStepStatuses(prev => ({
      ...prev,
      [step]: {
        completed: isCompleted,
        current: prev[step].current,
        hasErrors: hasErrors
      }
    }));
  };

  const validateStep = (step: number): boolean => {
    const stepInfo = steps.find(s => s.id === step);
    if (!stepInfo) return false;

    const newErrors: {[key: string]: string} = {};
    
    stepInfo.fields.forEach(field => {
      const value = formData[field as keyof FormData];
      const error = validateField(field, value);
      if (error) newErrors[field] = error;
    });

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    if (validateStep(currentStep)) {
      setStepStatuses(prev => ({
        ...prev,
        [currentStep]: { completed: true, current: false, hasErrors: false },
        [currentStep + 1]: { completed: false, current: true, hasErrors: false }
      }));
      setCurrentStep(prev => prev + 1);
    }
  };

  const handlePrevious = () => {
    if (currentStep > 1) {
      setStepStatuses(prev => ({
        ...prev,
        [currentStep]: { completed: false, current: false, hasErrors: false },
        [currentStep - 1]: { completed: false, current: true, hasErrors: false }
      }));
      setCurrentStep(prev => prev - 1);
    } else {
      onBack();
    }
  };

  const handleSubmit = async () => {
    if (!validateStep(4)) return;

    setIsSubmitting(true);
    
    try {
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      const submissionData = {
        ...formData,
        id: Date.now().toString(),
        submittedAt: new Date().toISOString(),
        status: 'pending',
        proposedSubdomain: formData.companyName.toLowerCase().replace(/[^a-z0-9]/g, '').substring(0, 20)
      };
      
      onSubmit(submissionData);
    } catch (error) {
      console.error('Erreur soumission:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const getStepIcon = (step: any, index: number) => {
    const Icon = step.icon;
    const status = stepStatuses[step.id];
    
    if (status.completed) {
      return <CheckCircle className="w-6 h-6 text-green-400" />;
    } else if (status.current) {
      return <Icon className="w-6 h-6 text-cyan-400" />;
    } else if (status.hasErrors) {
      return <AlertCircle className="w-6 h-6 text-red-400" />;
    } else {
      return <Icon className="w-6 h-6 text-gray-400" />;
    }
  };

  const getStepColor = (step: any) => {
    const status = stepStatuses[step.id];
    
    if (status.completed) {
      return 'bg-green-500/20 border-green-400/50 text-green-300';
    } else if (status.current) {
      return 'bg-cyan-500/20 border-cyan-400/50 text-cyan-300';
    } else if (status.hasErrors) {
      return 'bg-red-500/20 border-red-400/50 text-red-300';
    } else {
      return 'bg-gray-500/20 border-gray-400/50 text-gray-400';
    }
  };

  const renderStep1 = () => (
    <div className="space-y-6">
      <div className="text-center mb-8">
        <div className="w-20 h-20 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-2xl">
          <Building className="w-10 h-10 text-white" />
        </div>
        <h2 className="text-3xl font-bold text-white mb-3">Informations Entreprise</h2>
        <p className="text-gray-300 text-lg">Renseignez les détails de votre société</p>
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
            className={`w-full bg-black/40 border rounded-xl px-4 py-3 text-white placeholder-cyan-400 focus:outline-none focus:border-cyan-400 focus:ring-2 focus:ring-cyan-400/30 transition-all ${
              errors.companyName ? 'border-red-500 ring-red-500/30' : 'border-cyan-500/50'
            }`}
            placeholder="Ex: Mobilier Design Paris"
          />
          {errors.companyName && <p className="text-red-400 text-sm mt-1 flex items-center gap-1"><AlertCircle className="w-3 h-3" />{errors.companyName}</p>}
        </div>

        <div>
          <label className="block text-sm font-medium text-cyan-200 mb-2">
            SIRET *
          </label>
          <input
            type="text"
            value={formData.siret}
            onChange={(e) => handleInputChange('siret', e.target.value.replace(/\s/g, ''))}
            className={`w-full bg-black/40 border rounded-xl px-4 py-3 text-white placeholder-cyan-400 focus:outline-none focus:border-cyan-400 focus:ring-2 focus:ring-cyan-400/30 transition-all ${
              errors.siret ? 'border-red-500 ring-red-500/30' : 'border-cyan-500/50'
            }`}
            placeholder="12345678901234"
            maxLength={14}
          />
          {errors.siret && <p className="text-red-400 text-sm mt-1 flex items-center gap-1"><AlertCircle className="w-3 h-3" />{errors.siret}</p>}
          <p className="text-xs text-gray-400 mt-1">14 chiffres sans espaces</p>
        </div>

        <div>
          <label className="block text-sm font-medium text-cyan-200 mb-2">
            Pays *
          </label>
          <div className="relative">
            <select
              value={formData.country}
              onChange={(e) => handleInputChange('country', e.target.value)}
              className={`w-full bg-black/40 border rounded-xl px-4 py-3 text-white focus:outline-none focus:border-cyan-400 focus:ring-2 focus:ring-cyan-400/30 transition-all appearance-none ${
                errors.country ? 'border-red-500 ring-red-500/30' : 'border-cyan-500/50'
              }`}
            >
              <option value="">Sélectionner un pays</option>
              {countries.map((country) => (
                <option key={country.code} value={country.name}>
                  {country.flag} {country.name}
                </option>
              ))}
            </select>
            <Flag className="absolute right-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-cyan-400 pointer-events-none" />
          </div>
          {errors.country && <p className="text-red-400 text-sm mt-1 flex items-center gap-1"><AlertCircle className="w-3 h-3" />{errors.country}</p>}
        </div>

        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-cyan-200 mb-2">
            Adresse complète *
          </label>
          <div className="relative">
            <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-cyan-400" />
            <input
              type="text"
              value={formData.address}
              onChange={(e) => handleInputChange('address', e.target.value)}
              className={`w-full bg-black/40 border rounded-xl pl-12 pr-4 py-3 text-white placeholder-cyan-400 focus:outline-none focus:border-cyan-400 focus:ring-2 focus:ring-cyan-400/30 transition-all ${
                errors.address ? 'border-red-500 ring-red-500/30' : 'border-cyan-500/50'
              }`}
              placeholder="123 Avenue des Champs-Élysées"
            />
          </div>
          {errors.address && <p className="text-red-400 text-sm mt-1 flex items-center gap-1"><AlertCircle className="w-3 h-3" />{errors.address}</p>}
        </div>

        <div>
          <label className="block text-sm font-medium text-cyan-200 mb-2">
            Code postal *
          </label>
          <input
            type="text"
            value={formData.postalCode}
            onChange={(e) => handleInputChange('postalCode', e.target.value)}
            className={`w-full bg-black/40 border rounded-xl px-4 py-3 text-white placeholder-cyan-400 focus:outline-none focus:border-cyan-400 focus:ring-2 focus:ring-cyan-400/30 transition-all ${
              errors.postalCode ? 'border-red-500 ring-red-500/30' : 'border-cyan-500/50'
            }`}
            placeholder="75008"
          />
          {errors.postalCode && <p className="text-red-400 text-sm mt-1 flex items-center gap-1"><AlertCircle className="w-3 h-3" />{errors.postalCode}</p>}
        </div>

        <div>
          <label className="block text-sm font-medium text-cyan-200 mb-2">
            Ville *
          </label>
          <input
            type="text"
            value={formData.city}
            onChange={(e) => handleInputChange('city', e.target.value)}
            className={`w-full bg-black/40 border rounded-xl px-4 py-3 text-white placeholder-cyan-400 focus:outline-none focus:border-cyan-400 focus:ring-2 focus:ring-cyan-400/30 transition-all ${
              errors.city ? 'border-red-500 ring-red-500/30' : 'border-cyan-500/50'
            }`}
            placeholder="Paris"
          />
          {errors.city && <p className="text-red-400 text-sm mt-1 flex items-center gap-1"><AlertCircle className="w-3 h-3" />{errors.city}</p>}
        </div>
      </div>

      {/* Aperçu sous-domaine */}
      <div className="bg-blue-500/20 border border-blue-400/50 rounded-xl p-6">
        <h4 className="font-semibold text-blue-200 mb-3 flex items-center gap-2">
          <Globe className="w-5 h-5" />
          Votre futur domaine OmnIA :
        </h4>
        <div className="bg-black/40 rounded-lg p-3 border border-blue-400/30">
          <code className="text-cyan-400 text-lg font-mono">
            {formData.companyName ? 
              `${formData.companyName.toLowerCase().replace(/[^a-z0-9]/g, '').substring(0, 20)}.omnia.sale` : 
              'votre-boutique.omnia.sale'
            }
          </code>
        </div>
        <p className="text-blue-300 text-sm mt-2">
          Ce sera l'adresse de votre assistant OmnIA personnalisé
        </p>
      </div>
    </div>
  );

  const renderStep2 = () => (
    <div className="space-y-6">
      <div className="text-center mb-8">
        <div className="w-20 h-20 bg-gradient-to-br from-purple-500 to-pink-600 rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-2xl">
          <User className="w-10 h-10 text-white" />
        </div>
        <h2 className="text-3xl font-bold text-white mb-3">Contact Responsable</h2>
        <p className="text-gray-300 text-lg">Personne en charge du compte OmnIA</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-cyan-200 mb-2">
            Prénom *
          </label>
          <div className="relative">
            <User className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-cyan-400" />
            <input
              type="text"
              value={formData.firstName}
              onChange={(e) => handleInputChange('firstName', e.target.value)}
              className={`w-full bg-black/40 border rounded-xl pl-12 pr-4 py-3 text-white placeholder-cyan-400 focus:outline-none focus:border-cyan-400 focus:ring-2 focus:ring-cyan-400/30 transition-all ${
                errors.firstName ? 'border-red-500 ring-red-500/30' : 'border-cyan-500/50'
              }`}
              placeholder="Jean"
            />
          </div>
          {errors.firstName && <p className="text-red-400 text-sm mt-1 flex items-center gap-1"><AlertCircle className="w-3 h-3" />{errors.firstName}</p>}
        </div>

        <div>
          <label className="block text-sm font-medium text-cyan-200 mb-2">
            Nom *
          </label>
          <div className="relative">
            <User className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-cyan-400" />
            <input
              type="text"
              value={formData.lastName}
              onChange={(e) => handleInputChange('lastName', e.target.value)}
              className={`w-full bg-black/40 border rounded-xl pl-12 pr-4 py-3 text-white placeholder-cyan-400 focus:outline-none focus:border-cyan-400 focus:ring-2 focus:ring-cyan-400/30 transition-all ${
                errors.lastName ? 'border-red-500 ring-red-500/30' : 'border-cyan-500/50'
              }`}
              placeholder="Dupont"
            />
          </div>
          {errors.lastName && <p className="text-red-400 text-sm mt-1 flex items-center gap-1"><AlertCircle className="w-3 h-3" />{errors.lastName}</p>}
        </div>

        <div>
          <label className="block text-sm font-medium text-cyan-200 mb-2">
            Email professionnel *
          </label>
          <div className="relative">
            <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-cyan-400" />
            <input
              type="email"
              value={formData.email}
              onChange={(e) => handleInputChange('email', e.target.value)}
              className={`w-full bg-black/40 border rounded-xl pl-12 pr-4 py-3 text-white placeholder-cyan-400 focus:outline-none focus:border-cyan-400 focus:ring-2 focus:ring-cyan-400/30 transition-all ${
                errors.email ? 'border-red-500 ring-red-500/30' : 'border-cyan-500/50'
              }`}
              placeholder="contact@monmagasin.fr"
            />
          </div>
          {errors.email && <p className="text-red-400 text-sm mt-1 flex items-center gap-1"><AlertCircle className="w-3 h-3" />{errors.email}</p>}
        </div>

        <div>
          <label className="block text-sm font-medium text-cyan-200 mb-2">
            Téléphone *
          </label>
          <div className="relative">
            <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-cyan-400" />
            <input
              type="tel"
              value={formData.phone}
              onChange={(e) => handleInputChange('phone', e.target.value)}
              className={`w-full bg-black/40 border rounded-xl pl-12 pr-4 py-3 text-white placeholder-cyan-400 focus:outline-none focus:border-cyan-400 focus:ring-2 focus:ring-cyan-400/30 transition-all ${
                errors.phone ? 'border-red-500 ring-red-500/30' : 'border-cyan-500/50'
              }`}
              placeholder="+33 1 23 45 67 89"
            />
          </div>
          {errors.phone && <p className="text-red-400 text-sm mt-1 flex items-center gap-1"><AlertCircle className="w-3 h-3" />{errors.phone}</p>}
        </div>

        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-cyan-200 mb-2">
            Fonction dans l'entreprise *
          </label>
          <select
            value={formData.position}
            onChange={(e) => handleInputChange('position', e.target.value)}
            className={`w-full bg-black/40 border rounded-xl px-4 py-3 text-white focus:outline-none focus:border-cyan-400 focus:ring-2 focus:ring-cyan-400/30 transition-all ${
              errors.position ? 'border-red-500 ring-red-500/30' : 'border-cyan-500/50'
            }`}
          >
            <option value="">Sélectionner votre fonction</option>
            <option value="Directeur">Directeur</option>
            <option value="Gérant">Gérant</option>
            <option value="Responsable commercial">Responsable commercial</option>
            <option value="Responsable marketing">Responsable marketing</option>
            <option value="Chef de produit">Chef de produit</option>
            <option value="Autre">Autre</option>
          </select>
          {errors.position && <p className="text-red-400 text-sm mt-1 flex items-center gap-1"><AlertCircle className="w-3 h-3" />{errors.position}</p>}
        </div>

        <div>
          <label className="block text-sm font-medium text-cyan-200 mb-2">
            Mot de passe *
          </label>
          <div className="relative">
            <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-cyan-400" />
            <input
              type={showPassword ? 'text' : 'password'}
              value={formData.password}
              onChange={(e) => handleInputChange('password', e.target.value)}
              className={`w-full bg-black/40 border rounded-xl pl-12 pr-12 py-3 text-white placeholder-cyan-400 focus:outline-none focus:border-cyan-400 focus:ring-2 focus:ring-cyan-400/30 transition-all ${
                errors.password ? 'border-red-500 ring-red-500/30' : 'border-cyan-500/50'
              }`}
              placeholder="Minimum 8 caractères"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-cyan-400 hover:text-cyan-300 transition-colors"
            >
              {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
            </button>
          </div>
          {errors.password && <p className="text-red-400 text-sm mt-1 flex items-center gap-1"><AlertCircle className="w-3 h-3" />{errors.password}</p>}
          <div className="mt-2 space-y-1">
            <div className={`text-xs flex items-center gap-2 transition-colors ${formData.password.length >= 8 ? 'text-green-400' : 'text-gray-400'}`}>
              <div className={`w-2 h-2 rounded-full transition-colors ${formData.password.length >= 8 ? 'bg-green-400' : 'bg-gray-400'}`}></div>
              Au moins 8 caractères
            </div>
            <div className={`text-xs flex items-center gap-2 transition-colors ${/(?=.*[a-z])(?=.*[A-Z])/.test(formData.password) ? 'text-green-400' : 'text-gray-400'}`}>
              <div className={`w-2 h-2 rounded-full transition-colors ${/(?=.*[a-z])(?=.*[A-Z])/.test(formData.password) ? 'bg-green-400' : 'bg-gray-400'}`}></div>
              Majuscules et minuscules
            </div>
            <div className={`text-xs flex items-center gap-2 transition-colors ${/(?=.*\d)/.test(formData.password) ? 'text-green-400' : 'text-gray-400'}`}>
              <div className={`w-2 h-2 rounded-full transition-colors ${/(?=.*\d)/.test(formData.password) ? 'bg-green-400' : 'bg-gray-400'}`}></div>
              Au moins un chiffre
            </div>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-cyan-200 mb-2">
            Confirmer le mot de passe *
          </label>
          <div className="relative">
            <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-cyan-400" />
            <input
              type={showConfirmPassword ? 'text' : 'password'}
              value={formData.confirmPassword}
              onChange={(e) => handleInputChange('confirmPassword', e.target.value)}
              className={`w-full bg-black/40 border rounded-xl pl-12 pr-12 py-3 text-white placeholder-cyan-400 focus:outline-none focus:border-cyan-400 focus:ring-2 focus:ring-cyan-400/30 transition-all ${
                errors.confirmPassword ? 'border-red-500 ring-red-500/30' : 'border-cyan-500/50'
              }`}
              placeholder="Répéter le mot de passe"
            />
            <button
              type="button"
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-cyan-400 hover:text-cyan-300 transition-colors"
            >
              {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
            </button>
          </div>
          {errors.confirmPassword && <p className="text-red-400 text-sm mt-1 flex items-center gap-1"><AlertCircle className="w-3 h-3" />{errors.confirmPassword}</p>}
          {formData.confirmPassword && formData.password === formData.confirmPassword && (
            <p className="text-green-400 text-sm mt-1 flex items-center gap-1">
              <CheckCircle className="w-3 h-3" />
              Mots de passe identiques
            </p>
          )}
        </div>
      </div>
    </div>
  );

  const renderStep3 = () => (
    <div className="space-y-6">
      <div className="text-center mb-8">
        <div className="w-20 h-20 bg-gradient-to-br from-green-500 to-emerald-600 rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-2xl">
          <CreditCard className="w-10 h-10 text-white" />
        </div>
        <h2 className="text-3xl font-bold text-white mb-3">Choisir votre plan</h2>
        <p className="text-gray-300 text-lg">14 jours d'essai gratuit sur tous les plans</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
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
                <span className="bg-gradient-to-r from-cyan-500 to-blue-600 text-white px-4 py-1 rounded-full text-sm font-bold animate-pulse">
                  ⭐ POPULAIRE
                </span>
              </div>
            )}
            
            <div className="text-center">
              <h3 className="text-2xl font-bold text-white mb-2">{plan.name}</h3>
              <p className="text-gray-400 mb-4">{plan.description}</p>
              <div className="text-3xl font-bold text-cyan-400 mb-6">{plan.price}</div>
              <ul className="space-y-3 text-sm text-gray-300 text-left">
                {plan.features.map((feature, index) => (
                  <li key={index} className="flex items-center gap-3">
                    <CheckCircle className="w-4 h-4 text-green-400 flex-shrink-0" />
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        ))}
      </div>

      <div className="bg-gradient-to-r from-cyan-500/20 to-blue-600/20 backdrop-blur-xl rounded-2xl p-6 border border-cyan-400/30">
        <h4 className="font-semibold text-white mb-4 flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-cyan-400" />
          Nouveautés 2025 incluses dans Professional et Enterprise :
        </h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
          <div>
            <h5 className="font-semibold text-cyan-300 mb-2">🕶️ Vision AR/VR :</h5>
            <ul className="text-cyan-200 space-y-1">
              <li>• AR Mobile : placement produits 3D</li>
              <li>• VR Showroom : visite immersive</li>
              <li>• IA Photo : intégration automatique</li>
            </ul>
          </div>
          <div>
            <h5 className="font-semibold text-green-300 mb-2">🤖 IA Avancée :</h5>
            <ul className="text-green-200 space-y-1">
              <li>• Google Ads automatique</li>
              <li>• SEO Blog génération IA</li>
              <li>• Insights prédictifs</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );

  const renderStep4 = () => (
    <div className="space-y-6">
      <div className="text-center mb-8">
        <div className="w-20 h-20 bg-gradient-to-br from-orange-500 to-red-600 rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-2xl">
          <Shield className="w-10 h-10 text-white" />
        </div>
        <h2 className="text-3xl font-bold text-white mb-3">Documents et Validation</h2>
        <p className="text-gray-300 text-lg">Finalisez votre inscription</p>
      </div>

      <div className="space-y-6">
        <div>
          <label className="block text-sm font-medium text-cyan-200 mb-2">
            Document Kbis (moins de 3 mois) *
          </label>
          <div className={`border-2 border-dashed rounded-xl p-8 text-center transition-colors ${
            formData.kbisFile 
              ? 'border-green-400/70 bg-green-500/10' 
              : errors.kbisFile 
                ? 'border-red-400/70 bg-red-500/10' 
                : 'border-cyan-500/50 hover:border-cyan-400/70'
          }`}>
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
                  <CheckCircle className="w-12 h-12 mx-auto mb-4" />
                  <p className="font-bold text-lg">{formData.kbisFile.name}</p>
                  <p className="text-sm text-green-300">
                    {(formData.kbisFile.size / 1024 / 1024).toFixed(2)} MB • {formData.kbisFile.type}
                  </p>
                  <p className="text-xs text-green-400 mt-2">✅ Document validé</p>
                </div>
              ) : (
                <div className="text-cyan-400">
                  <Upload className="w-12 h-12 mx-auto mb-4" />
                  <p className="font-bold text-lg">Cliquez pour uploader votre Kbis</p>
                  <p className="text-sm text-gray-400 mt-2">PDF, JPG, PNG (max 10MB)</p>
                  <p className="text-xs text-cyan-300 mt-2">Document de moins de 3 mois obligatoire</p>
                </div>
              )}
            </label>
          </div>
          {errors.kbisFile && <p className="text-red-400 text-sm mt-1 flex items-center gap-1"><AlertCircle className="w-3 h-3" />{errors.kbisFile}</p>}
        </div>

        <div className="bg-blue-500/20 border border-blue-400/50 rounded-xl p-6">
          <h4 className="font-semibold text-blue-200 mb-4 flex items-center gap-2">
            <FileText className="w-5 h-5" />
            📋 Récapitulatif de votre inscription :
          </h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-blue-300">
            <div className="space-y-2">
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
                <span>Pays :</span>
                <span className="font-semibold">
                  {countries.find(c => c.name === formData.country)?.flag} {formData.country}
                </span>
              </div>
            </div>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span>Plan :</span>
                <span className="font-semibold">{plans.find(p => p.id === formData.selectedPlan)?.name}</span>
              </div>
              <div className="flex justify-between">
                <span>Prix :</span>
                <span className="font-semibold">{plans.find(p => p.id === formData.selectedPlan)?.price}</span>
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
              <div className="flex justify-between">
                <span>Essai gratuit :</span>
                <span className="font-semibold text-green-400">14 jours</span>
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-4">
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
          {errors.acceptTerms && <p className="text-red-400 text-sm flex items-center gap-1"><AlertCircle className="w-3 h-3" />{errors.acceptTerms}</p>}

          <div className="flex items-start gap-3">
            <input
              type="checkbox"
              id="accept-newsletter"
              checked={formData.acceptNewsletter}
              onChange={(e) => handleInputChange('acceptNewsletter', e.target.checked)}
              className="w-5 h-5 text-cyan-600 bg-gray-800 border-gray-600 rounded focus:ring-cyan-500 mt-1"
            />
            <label htmlFor="accept-newsletter" className="text-sm text-gray-300">
              Je souhaite recevoir les actualités OmnIA et conseils e-commerce par email
            </label>
          </div>
        </div>

        <div className="bg-green-500/20 border border-green-400/50 rounded-xl p-6">
          <h4 className="font-semibold text-green-200 mb-3 flex items-center gap-2">
            <Clock className="w-5 h-5" />
            ⏱️ Prochaines étapes après validation :
          </h4>
          <ol className="text-green-300 space-y-2 text-sm">
            <li className="flex items-center gap-3">
              <span className="bg-green-500 text-white w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold">1</span>
              <span><strong>Validation (24-48h)</strong> : Notre équipe examine votre dossier</span>
            </li>
            <li className="flex items-center gap-3">
              <span className="bg-green-500 text-white w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold">2</span>
              <span><strong>Email de confirmation</strong> : Réception de vos identifiants</span>
            </li>
            <li className="flex items-center gap-3">
              <span className="bg-green-500 text-white w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold">3</span>
              <span><strong>Configuration</strong> : Import de votre catalogue</span>
            </li>
            <li className="flex items-center gap-3">
              <span className="bg-green-500 text-white w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold">4</span>
              <span><strong>Formation</strong> : Prise en main de l'interface</span>
            </li>
          </ol>
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

      <div className="relative z-10 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Progress Steps avec icônes allumées/éteintes */}
        <div className="flex items-center justify-center mb-12">
          {steps.map((step, index) => {
            const Icon = step.icon;
            const status = stepStatuses[step.id];
            
            return (
              <div key={step.id} className="flex items-center">
                <div className={`relative group transition-all duration-300 ${
                  status.current ? 'scale-110' : ''
                }`}>
                  <div className={`w-16 h-16 rounded-2xl flex flex-col items-center justify-center font-bold border-2 transition-all duration-300 ${
                    status.completed 
                      ? 'bg-green-500/30 border-green-400 text-green-300 shadow-lg shadow-green-500/30' 
                      : status.current 
                        ? 'bg-cyan-500/30 border-cyan-400 text-cyan-300 shadow-lg shadow-cyan-500/30 animate-pulse' 
                        : status.hasErrors
                          ? 'bg-red-500/20 border-red-400/50 text-red-300'
                          : 'bg-gray-600/20 border-gray-500/50 text-gray-400'
                  }`}>
                    {getStepIcon(step, index)}
                    <span className="text-xs font-bold mt-1">{step.id}</span>
                  </div>
                  
                  {/* Tooltip */}
                  <div className="absolute -bottom-12 left-1/2 transform -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <div className="bg-black/80 text-white text-xs px-3 py-2 rounded-lg whitespace-nowrap">
                      {step.title}
                    </div>
                  </div>
                </div>
                
                {index < steps.length - 1 && (
                  <div className={`w-16 h-1 transition-all duration-300 ${
                    stepStatuses[step.id].completed ? 'bg-cyan-500' : 'bg-gray-600'
                  }`} />
                )}
              </div>
            );
          })}
        </div>

        {/* Step Title */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-3 mb-4">
            <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${getStepColor(steps[currentStep - 1])}`}>
              {getStepIcon(steps[currentStep - 1], currentStep - 1)}
            </div>
            <div>
              <h3 className="text-xl font-bold text-white">{steps[currentStep - 1].title}</h3>
              <p className="text-gray-400 text-sm">{steps[currentStep - 1].description}</p>
            </div>
          </div>
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
              onClick={handlePrevious}
              className="bg-gray-600 hover:bg-gray-700 text-white px-8 py-3 rounded-xl font-semibold transition-all flex items-center gap-2"
            >
              <ArrowLeft className="w-4 h-4" />
              {currentStep > 1 ? 'Précédent' : 'Annuler'}
            </button>

            {currentStep < 4 ? (
              <button
                onClick={handleNext}
                disabled={stepStatuses[currentStep]?.hasErrors}
                className="bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 disabled:from-gray-600 disabled:to-gray-700 text-white px-8 py-3 rounded-xl font-semibold transition-all disabled:cursor-not-allowed flex items-center gap-2"
              >
                Suivant
                <ArrowLeft className="w-4 h-4 rotate-180" />
              </button>
            ) : (
              <button
                onClick={handleSubmit}
                disabled={isSubmitting || stepStatuses[4]?.hasErrors}
                className="bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-400 hover:to-emerald-500 disabled:from-gray-600 disabled:to-gray-700 text-white px-8 py-3 rounded-xl font-semibold transition-all disabled:cursor-not-allowed flex items-center gap-2"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Finalisation...
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

        {/* Help Section */}
        <div className="mt-8 bg-gradient-to-r from-cyan-500/20 to-blue-600/20 backdrop-blur-xl rounded-2xl p-6 border border-cyan-400/30 text-center">
          <h4 className="text-lg font-bold text-white mb-2">Besoin d'aide ?</h4>
          <p className="text-cyan-300 mb-4">
            Notre équipe vous accompagne dans votre inscription
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a
              href="mailto:support@omnia.sale"
              className="bg-cyan-600 hover:bg-cyan-700 text-white px-6 py-3 rounded-xl font-semibold transition-all flex items-center justify-center gap-2"
            >
              <Mail className="w-4 h-4" />
              support@omnia.sale
            </a>
            <a
              href="tel:+33184883245"
              className="bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-xl font-semibold transition-all flex items-center justify-center gap-2"
            >
              <Phone className="w-4 h-4" />
              +33 1 84 88 32 45
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};