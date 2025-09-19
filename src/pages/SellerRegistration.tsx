import React, { useState } from 'react';
import { ArrowLeft, Building, User, Mail, Phone, MapPin, CreditCard, Upload, CheckCircle, AlertCircle } from 'lucide-react';
import { Logo } from '../components/Logo';

interface SellerRegistrationProps {
  onSubmit: (data: any) => void;
  onBack: () => void;
}

interface FormData {
  companyName: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  postalCode: string;
  country: string;
  siret: string;
  position: string;
  selectedPlan: string;
  password: string;
  confirmPassword: string;
  kbisFile: File | null;
  acceptTerms: boolean;
}

export const SellerRegistration: React.FC<SellerRegistrationProps> = ({ onSubmit, onBack }) => {
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState<FormData>({
    companyName: '',
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    postalCode: '',
    country: 'France',
    siret: '',
    position: '',
    selectedPlan: 'professional',
    password: '',
    confirmPassword: '',
    kbisFile: null,
    acceptTerms: false
  });
  const [errors, setErrors] = useState<{[key: string]: string}>({});
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
      features: ['5000 conversations/mois', 'Produits illimités', 'Support prioritaire', 'Domaine personnalisé', 'Analytics avancées'],
      popular: true
    },
    {
      id: 'enterprise',
      name: 'Enterprise',
      price: '199€/mois',
      features: ['Conversations illimitées', 'Multi-magasins', 'Support dédié', 'White-label', 'API personnalisée']
    }
  ];

  const validateStep = (step: number): boolean => {
    const newErrors: {[key: string]: string} = {};

    if (step === 1) {
      if (!formData.companyName.trim()) newErrors.companyName = 'Nom de l\'entreprise requis';
      if (!formData.firstName.trim()) newErrors.firstName = 'Prénom requis';
      if (!formData.lastName.trim()) newErrors.lastName = 'Nom requis';
      if (!formData.email.trim()) newErrors.email = 'Email requis';
      if (!/\S+@\S+\.\S+/.test(formData.email)) newErrors.email = 'Email invalide';
      if (!formData.phone.trim()) newErrors.phone = 'Téléphone requis';
    }

    if (step === 2) {
      if (!formData.address.trim()) newErrors.address = 'Adresse requise';
      if (!formData.city.trim()) newErrors.city = 'Ville requise';
      if (!formData.postalCode.trim()) newErrors.postalCode = 'Code postal requis';
      if (!/^\d{14}$/.test(formData.siret.replace(/\s/g, ''))) {
        newErrors.siret = 'SIRET doit contenir exactement 14 chiffres';
      }
      if (!formData.position.trim()) newErrors.position = 'Fonction requise';
    }

    if (step === 3) {
      if (!formData.password) newErrors.password = 'Mot de passe requis';
      if (formData.password.length < 8) newErrors.password = 'Minimum 8 caractères';
      if (formData.password !== formData.confirmPassword) newErrors.confirmPassword = 'Mots de passe différents';
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

  const handleSubmit = async () => {
    if (!validateStep(3)) return;

    setIsSubmitting(true);

    try {
      const submissionData = {
        ...formData,
        id: `app-${Date.now()}`,
        submittedAt: new Date().toISOString(),
        submittedDate: new Date().toLocaleDateString('fr-FR'),
        submittedTime: new Date().toLocaleTimeString('fr-FR'),
        proposedSubdomain: formData.companyName.toLowerCase().replace(/[^a-z0-9]/g, '').substring(0, 20)
      };

      await new Promise(resolve => setTimeout(resolve, 2000));
      onSubmit(submissionData);
    } catch (error) {
      console.error('Erreur soumission:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const formatSiret = (value: string) => {
    const numbers = value.replace(/\D/g, '');
    if (numbers.length <= 14) {
      return numbers.replace(/(\d{3})(\d{3})(\d{3})(\d{5})/, '$1 $2 $3 $4').trim();
    }
    return numbers.substring(0, 14).replace(/(\d{3})(\d{3})(\d{3})(\d{5})/, '$1 $2 $3 $4');
  };

  const renderStep1 = () => (
    <div className="space-y-6">
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold text-white mb-2">Informations de l'entreprise</h2>
        <p className="text-gray-300">Renseignez les détails de votre société</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-cyan-200 mb-2">
            Nom de l'entreprise *
          </label>
          <div className="relative">
            <Building className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-cyan-400" />
            <input
              type="text"
              value={formData.companyName}
              onChange={(e) => handleInputChange('companyName', e.target.value)}
              className={`w-full pl-12 pr-4 py-3 bg-black/40 border rounded-xl text-white placeholder-cyan-400 focus:outline-none focus:ring-2 focus:ring-cyan-400/30 ${
                errors.companyName ? 'border-red-500' : 'border-cyan-500/50 focus:border-cyan-400'
              }`}
              placeholder="Decora Home"
            />
          </div>
          {errors.companyName && <p className="text-red-400 text-sm mt-1">{errors.companyName}</p>}
        </div>

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
              className={`w-full pl-12 pr-4 py-3 bg-black/40 border rounded-xl text-white placeholder-cyan-400 focus:outline-none focus:ring-2 focus:ring-cyan-400/30 ${
                errors.firstName ? 'border-red-500' : 'border-cyan-500/50 focus:border-cyan-400'
              }`}
              placeholder="Alexandre"
            />
          </div>
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
            className={`w-full px-4 py-3 bg-black/40 border rounded-xl text-white placeholder-cyan-400 focus:outline-none focus:ring-2 focus:ring-cyan-400/30 ${
              errors.lastName ? 'border-red-500' : 'border-cyan-500/50 focus:border-cyan-400'
            }`}
            placeholder="Martin"
          />
          {errors.lastName && <p className="text-red-400 text-sm mt-1">{errors.lastName}</p>}
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
              className={`w-full pl-12 pr-4 py-3 bg-black/40 border rounded-xl text-white placeholder-cyan-400 focus:outline-none focus:ring-2 focus:ring-cyan-400/30 ${
                errors.email ? 'border-red-500' : 'border-cyan-500/50 focus:border-cyan-400'
              }`}
              placeholder="contact@decorahome.fr"
            />
          </div>
          {errors.email && <p className="text-red-400 text-sm mt-1">{errors.email}</p>}
        </div>

        <div>
          <label className="block text-sm font-medium text-cyan-200 mb-2">
            Téléphone 🇫🇷 *
          </label>
          <div className="relative">
            <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-cyan-400" />
            <input
              type="tel"
              value={formData.phone}
              onChange={(e) => handleInputChange('phone', e.target.value)}
              className={`w-full pl-12 pr-4 py-3 bg-black/40 border rounded-xl text-white placeholder-cyan-400 focus:outline-none focus:ring-2 focus:ring-cyan-400/30 ${
                errors.phone ? 'border-red-500' : 'border-cyan-500/50 focus:border-cyan-400'
              }`}
              placeholder="+33 1 84 88 32 45"
            />
          </div>
          {errors.phone && <p className="text-red-400 text-sm mt-1">{errors.phone}</p>}
        </div>
      </div>
    </div>
  );

  const renderStep2 = () => (
    <div className="space-y-6">
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold text-white mb-2">Adresse et informations légales</h2>
        <p className="text-gray-300">Détails de votre établissement</p>
      </div>

      <div className="space-y-6">
        <div>
          <label className="block text-sm font-medium text-cyan-200 mb-2">
            Adresse complète *
          </label>
          <div className="relative">
            <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-cyan-400" />
            <input
              type="text"
              value={formData.address}
              onChange={(e) => handleInputChange('address', e.target.value)}
              className={`w-full pl-12 pr-4 py-3 bg-black/40 border rounded-xl text-white placeholder-cyan-400 focus:outline-none focus:ring-2 focus:ring-cyan-400/30 ${
                errors.address ? 'border-red-500' : 'border-cyan-500/50 focus:border-cyan-400'
              }`}
              placeholder="123 Avenue des Champs-Élysées"
            />
          </div>
          {errors.address && <p className="text-red-400 text-sm mt-1">{errors.address}</p>}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-cyan-200 mb-2">
              Code postal *
            </label>
            <input
              type="text"
              value={formData.postalCode}
              onChange={(e) => handleInputChange('postalCode', e.target.value)}
              className={`w-full px-4 py-3 bg-black/40 border rounded-xl text-white placeholder-cyan-400 focus:outline-none focus:ring-2 focus:ring-cyan-400/30 ${
                errors.postalCode ? 'border-red-500' : 'border-cyan-500/50 focus:border-cyan-400'
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
              className={`w-full px-4 py-3 bg-black/40 border rounded-xl text-white placeholder-cyan-400 focus:outline-none focus:ring-2 focus:ring-cyan-400/30 ${
                errors.city ? 'border-red-500' : 'border-cyan-500/50 focus:border-cyan-400'
              }`}
              placeholder="Paris"
            />
            {errors.city && <p className="text-red-400 text-sm mt-1">{errors.city}</p>}
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-cyan-200 mb-2">
            SIRET (14 caractères) *
          </label>
          <div className="relative">
            <CreditCard className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-cyan-400" />
            <input
              type="text"
              value={formData.siret}
              onChange={(e) => {
                const formatted = formatSiret(e.target.value);
                handleInputChange('siret', formatted);
              }}
              className={`w-full pl-12 pr-4 py-3 bg-black/40 border rounded-xl text-white placeholder-cyan-400 focus:outline-none focus:ring-2 focus:ring-cyan-400/30 font-mono ${
                errors.siret ? 'border-red-500' : 'border-cyan-500/50 focus:border-cyan-400'
              }`}
              placeholder="897 801 775 00015"
              maxLength={17}
            />
          </div>
          {errors.siret && <p className="text-red-400 text-sm mt-1">{errors.siret}</p>}
          <p className="text-cyan-300 text-xs mt-1">Format: XXX XXX XXX XXXXX (14 chiffres)</p>
        </div>

        <div>
          <label className="block text-sm font-medium text-cyan-200 mb-2">
            Votre fonction *
          </label>
          <input
            type="text"
            value={formData.position}
            onChange={(e) => handleInputChange('position', e.target.value)}
            className={`w-full px-4 py-3 bg-black/40 border rounded-xl text-white placeholder-cyan-400 focus:outline-none focus:ring-2 focus:ring-cyan-400/30 ${
              errors.position ? 'border-red-500' : 'border-cyan-500/50 focus:border-cyan-400'
            }`}
            placeholder="Directeur Commercial"
          />
          {errors.position && <p className="text-red-400 text-sm mt-1">{errors.position}</p>}
        </div>
      </div>
    </div>
  );

  const renderStep3 = () => (
    <div className="space-y-6">
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold text-white mb-2">Choix du plan et finalisation</h2>
        <p className="text-gray-300">Sélectionnez votre abonnement OmnIA</p>
      </div>

      {/* Plans */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        {plans.map((plan) => (
          <div
            key={plan.id}
            onClick={() => handleInputChange('selectedPlan', plan.id)}
            className={`cursor-pointer rounded-2xl p-6 border transition-all ${
              formData.selectedPlan === plan.id
                ? 'border-cyan-500 bg-cyan-500/20 shadow-lg shadow-cyan-500/30'
                : 'border-white/20 bg-white/10 hover:border-cyan-500/50'
            } ${plan.popular ? 'relative' : ''}`}
          >
            {plan.popular && (
              <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                <span className="bg-gradient-to-r from-cyan-500 to-blue-600 text-white px-3 py-1 rounded-full text-xs font-bold">
                  POPULAIRE
                </span>
              </div>
            )}
            
            <div className="text-center mb-4">
              <h3 className="text-xl font-bold text-white mb-2">{plan.name}</h3>
              <div className="text-2xl font-bold text-cyan-400">{plan.price}</div>
            </div>

            <ul className="space-y-2">
              {plan.features.map((feature, index) => (
                <li key={index} className="flex items-center gap-2 text-sm text-gray-300">
                  <CheckCircle className="w-4 h-4 text-green-400 flex-shrink-0" />
                  {feature}
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>

      {/* Mot de passe */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-cyan-200 mb-2">
            Mot de passe *
          </label>
          <input
            type="password"
            value={formData.password}
            onChange={(e) => handleInputChange('password', e.target.value)}
            className={`w-full px-4 py-3 bg-black/40 border rounded-xl text-white placeholder-cyan-400 focus:outline-none focus:ring-2 focus:ring-cyan-400/30 ${
              errors.password ? 'border-red-500' : 'border-cyan-500/50 focus:border-cyan-400'
            }`}
            placeholder="Minimum 8 caractères"
          />
          {errors.password && <p className="text-red-400 text-sm mt-1">{errors.password}</p>}
        </div>

        <div>
          <label className="block text-sm font-medium text-cyan-200 mb-2">
            Confirmer le mot de passe *
          </label>
          <input
            type="password"
            value={formData.confirmPassword}
            onChange={(e) => handleInputChange('confirmPassword', e.target.value)}
            className={`w-full px-4 py-3 bg-black/40 border rounded-xl text-white placeholder-cyan-400 focus:outline-none focus:ring-2 focus:ring-cyan-400/30 ${
              errors.confirmPassword ? 'border-red-500' : 'border-cyan-500/50 focus:border-cyan-400'
            }`}
            placeholder="Répétez le mot de passe"
          />
          {errors.confirmPassword && <p className="text-red-400 text-sm mt-1">{errors.confirmPassword}</p>}
        </div>
      </div>

      {/* Document Kbis */}
      <div>
        <label className="block text-sm font-medium text-cyan-200 mb-2">
          Document Kbis (moins de 3 mois)
        </label>
        <div className="border-2 border-dashed border-cyan-500/50 rounded-xl p-6 text-center">
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
            <Upload className="w-12 h-12 text-cyan-400 mx-auto mb-2" />
            <p className="text-white font-medium">Cliquez pour uploader votre Kbis</p>
            <p className="text-gray-400 text-sm">PDF, JPG, PNG acceptés</p>
          </label>
          {formData.kbisFile && (
            <div className="mt-4 p-3 bg-green-500/20 rounded-lg border border-green-400/30">
              <p className="text-green-300 font-medium">{formData.kbisFile.name}</p>
              <p className="text-green-400 text-sm">{(formData.kbisFile.size / 1024 / 1024).toFixed(2)} MB</p>
            </div>
          )}
        </div>
      </div>

      {/* Conditions */}
      <div className="flex items-start gap-3">
        <input
          type="checkbox"
          id="terms"
          checked={formData.acceptTerms}
          onChange={(e) => handleInputChange('acceptTerms', e.target.checked)}
          className="w-5 h-5 text-cyan-600 bg-black/40 border-cyan-500/50 rounded focus:ring-cyan-500 mt-1"
        />
        <label htmlFor="terms" className="text-gray-300 text-sm">
          J'accepte les <a href="#" className="text-cyan-400 hover:text-cyan-300">conditions d'utilisation</a> et 
          la <a href="#" className="text-cyan-400 hover:text-cyan-300">politique de confidentialité</a> d'OmnIA.sale *
        </label>
      </div>
      {errors.acceptTerms && <p className="text-red-400 text-sm">{errors.acceptTerms}</p>}
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
              Retour
            </button>
          </div>
        </div>
      </header>

      <div className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="bg-white/10 backdrop-blur-2xl rounded-3xl p-8 border border-white/20 shadow-2xl">
          {/* Progress Steps */}
          <div className="flex items-center justify-center mb-12">
            {[1, 2, 3].map((step) => (
              <div key={step} className="flex items-center">
                <div className={`w-12 h-12 rounded-full flex items-center justify-center font-bold ${
                  currentStep >= step 
                    ? 'bg-cyan-500 text-white' 
                    : 'bg-gray-600 text-gray-300'
                }`}>
                  {step}
                </div>
                {step < 3 && (
                  <div className={`w-16 h-1 ${
                    currentStep > step ? 'bg-cyan-500' : 'bg-gray-600'
                  }`} />
                )}
              </div>
            ))}
          </div>

          {/* Step Content */}
          {currentStep === 1 && renderStep1()}
          {currentStep === 2 && renderStep2()}
          {currentStep === 3 && renderStep3()}

          {/* Navigation */}
          <div className="flex justify-between mt-12">
            {currentStep > 1 ? (
              <button
                onClick={() => setCurrentStep(prev => prev - 1)}
                className="bg-gray-600 hover:bg-gray-700 text-white px-6 py-3 rounded-xl transition-all"
              >
                Précédent
              </button>
            ) : (
              <div></div>
            )}

            {currentStep < 3 ? (
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
                className="bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-400 hover:to-emerald-500 disabled:from-gray-600 disabled:to-gray-700 text-white px-8 py-3 rounded-xl font-semibold transition-all disabled:cursor-not-allowed flex items-center gap-2"
              >
                {isSubmitting ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
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