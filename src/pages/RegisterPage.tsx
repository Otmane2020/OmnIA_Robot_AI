import React, { useState } from 'react';
import { Building, User, Mail, Phone, MapPin, CreditCard, ArrowLeft, CheckCircle, Upload, FileText } from 'lucide-react';
import { Logo } from '../components/Logo';

export const RegisterPage: React.FC = () => {
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState({
    // Informations entreprise
    companyName: '',
    siret: '',
    address: '',
    city: '',
    postalCode: '',
    country: 'France',
    
    // Contact responsable
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    position: '',
    password: '',
    confirmPassword: '',
    
    // Plan et domaine
    selectedPlan: 'professional',
    proposedSubdomain: '',
    
    // Documents
    kbisFile: null as File | null,
    
    // Acceptation
    acceptTerms: false,
    acceptNewsletter: false
  });

  const [errors, setErrors] = useState<{[key: string]: string}>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const plans = [
    {
      id: 'starter',
      name: 'Starter',
      price: '29€/mois',
      features: [
        '1000 conversations/mois',
        '500 produits max',
        'Support email',
        'Widget personnalisable'
      ],
      color: 'from-blue-500 to-cyan-600'
    },
    {
      id: 'professional',
      name: 'Professional',
      price: '79€/mois',
      features: [
        '5000 conversations/mois',
        'Produits illimités',
        'Support prioritaire',
        'Domaine personnalisé',
        'Analytics avancées'
      ],
      color: 'from-purple-500 to-pink-600',
      popular: true
    },
    {
      id: 'enterprise',
      name: 'Enterprise',
      price: '199€/mois',
      features: [
        'Conversations illimitées',
        'Multi-magasins',
        'Support dédié',
        'White-label',
        'API personnalisée'
      ],
      color: 'from-orange-500 to-red-600'
    }
  ];

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
    
    // Auto-generate subdomain from company name
    if (field === 'companyName' && value) {
      const subdomain = value
        .toLowerCase()
        .replace(/[^a-z0-9\s-]/g, '')
        .replace(/\s+/g, '-')
        .replace(/-+/g, '-')
        .trim()
        .substring(0, 20);
      setFormData(prev => ({ ...prev, proposedSubdomain: subdomain }));
    }
  };

  const validateStep = (step: number): boolean => {
    const newErrors: {[key: string]: string} = {};

    if (step === 1) {
      if (!formData.companyName.trim()) newErrors.companyName = 'Nom d\'entreprise requis';
      if (!formData.siret.trim()) newErrors.siret = 'SIRET requis';
      if (!formData.address.trim()) newErrors.address = 'Adresse requise';
      if (!formData.city.trim()) newErrors.city = 'Ville requise';
      if (!formData.postalCode.trim()) newErrors.postalCode = 'Code postal requis';
    }

    if (step === 2) {
      if (!formData.firstName.trim()) newErrors.firstName = 'Prénom requis';
      if (!formData.lastName.trim()) newErrors.lastName = 'Nom requis';
      if (!formData.email.trim()) newErrors.email = 'Email requis';
      if (!formData.phone.trim()) newErrors.phone = 'Téléphone requis';
      if (!formData.position.trim()) newErrors.position = 'Fonction requise';
      if (!formData.password) newErrors.password = 'Mot de passe requis';
      if (formData.password !== formData.confirmPassword) newErrors.confirmPassword = 'Mots de passe différents';
    }

    if (step === 4) {
      if (!formData.acceptTerms) newErrors.acceptTerms = 'Acceptation des CGV requise';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    if (validateStep(currentStep)) {
      setCurrentStep(prev => Math.min(prev + 1, 4));
    }
  };

  const handlePrevious = () => {
    setCurrentStep(prev => Math.max(prev - 1, 1));
  };

  const handleSubmit = async () => {
    if (!validateStep(4)) return;

    setIsSubmitting(true);

    try {
      // Simuler l'envoi de la demande
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Rediriger vers une page de confirmation
      alert('Demande envoyée avec succès ! Vous recevrez un email de confirmation sous 24h.');
      window.location.href = '/';
      
    } catch (error) {
      alert('Erreur lors de l\'envoi. Veuillez réessayer.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderStep1 = () => (
    <div className="space-y-6">
      <div className="text-center mb-8">
        <Building className="w-16 h-16 text-cyan-400 mx-auto mb-4" />
        <h2 className="text-2xl font-bold text-white mb-2">Informations entreprise</h2>
        <p className="text-gray-300">Renseignez les détails de votre entreprise</p>
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
            className={`w-full px-4 py-3 bg-black/40 border rounded-xl text-white placeholder-cyan-400 focus:outline-none focus:ring-2 focus:ring-cyan-400/30 ${
              errors.companyName ? 'border-red-500' : 'border-cyan-500/50'
            }`}
            placeholder="Mobilier Design Paris"
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
            className={`w-full px-4 py-3 bg-black/40 border rounded-xl text-white placeholder-cyan-400 focus:outline-none focus:ring-2 focus:ring-cyan-400/30 ${
              errors.siret ? 'border-red-500' : 'border-cyan-500/50'
            }`}
            placeholder="12345678901234"
          />
          {errors.siret && <p className="text-red-400 text-sm mt-1">{errors.siret}</p>}
        </div>

        <div>
          <label className="block text-sm font-medium text-cyan-200 mb-2">
            Pays
          </label>
          <select
            value={formData.country}
            onChange={(e) => handleInputChange('country', e.target.value)}
            className="w-full px-4 py-3 bg-black/40 border border-cyan-500/50 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-cyan-400/30"
          >
            <option value="France">France</option>
            <option value="Belgique">Belgique</option>
            <option value="Suisse">Suisse</option>
            <option value="Canada">Canada</option>
          </select>
        </div>

        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-cyan-200 mb-2">
            Adresse *
          </label>
          <input
            type="text"
            value={formData.address}
            onChange={(e) => handleInputChange('address', e.target.value)}
            className={`w-full px-4 py-3 bg-black/40 border rounded-xl text-white placeholder-cyan-400 focus:outline-none focus:ring-2 focus:ring-cyan-400/30 ${
              errors.address ? 'border-red-500' : 'border-cyan-500/50'
            }`}
            placeholder="123 Rue de Rivoli"
          />
          {errors.address && <p className="text-red-400 text-sm mt-1">{errors.address}</p>}
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
              errors.city ? 'border-red-500' : 'border-cyan-500/50'
            }`}
            placeholder="Paris"
          />
          {errors.city && <p className="text-red-400 text-sm mt-1">{errors.city}</p>}
        </div>

        <div>
          <label className="block text-sm font-medium text-cyan-200 mb-2">
            Code postal *
          </label>
          <input
            type="text"
            value={formData.postalCode}
            onChange={(e) => handleInputChange('postalCode', e.target.value)}
            className={`w-full px-4 py-3 bg-black/40 border rounded-xl text-white placeholder-cyan-400 focus:outline-none focus:ring-2 focus:ring-cyan-400/30 ${
              errors.postalCode ? 'border-red-500' : 'border-cyan-500/50'
            }`}
            placeholder="75001"
          />
          {errors.postalCode && <p className="text-red-400 text-sm mt-1">{errors.postalCode}</p>}
        </div>
      </div>
    </div>
  );

  const renderStep2 = () => (
    <div className="space-y-6">
      <div className="text-center mb-8">
        <User className="w-16 h-16 text-green-400 mx-auto mb-4" />
        <h2 className="text-2xl font-bold text-white mb-2">Contact responsable</h2>
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
            className={`w-full px-4 py-3 bg-black/40 border rounded-xl text-white placeholder-cyan-400 focus:outline-none focus:ring-2 focus:ring-cyan-400/30 ${
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
            className={`w-full px-4 py-3 bg-black/40 border rounded-xl text-white placeholder-cyan-400 focus:outline-none focus:ring-2 focus:ring-cyan-400/30 ${
              errors.lastName ? 'border-red-500' : 'border-cyan-500/50'
            }`}
            placeholder="Martin"
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
            className={`w-full px-4 py-3 bg-black/40 border rounded-xl text-white placeholder-cyan-400 focus:outline-none focus:ring-2 focus:ring-cyan-400/30 ${
              errors.email ? 'border-red-500' : 'border-cyan-500/50'
            }`}
            placeholder="contact@monentreprise.com"
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
            className={`w-full px-4 py-3 bg-black/40 border rounded-xl text-white placeholder-cyan-400 focus:outline-none focus:ring-2 focus:ring-cyan-400/30 ${
              errors.phone ? 'border-red-500' : 'border-cyan-500/50'
            }`}
            placeholder="01 23 45 67 89"
          />
          {errors.phone && <p className="text-red-400 text-sm mt-1">{errors.phone}</p>}
        </div>

        <div>
          <label className="block text-sm font-medium text-cyan-200 mb-2">
            Fonction *
          </label>
          <input
            type="text"
            value={formData.position}
            onChange={(e) => handleInputChange('position', e.target.value)}
            className={`w-full px-4 py-3 bg-black/40 border rounded-xl text-white placeholder-cyan-400 focus:outline-none focus:ring-2 focus:ring-cyan-400/30 ${
              errors.position ? 'border-red-500' : 'border-cyan-500/50'
            }`}
            placeholder="Directeur Commercial"
          />
          {errors.position && <p className="text-red-400 text-sm mt-1">{errors.position}</p>}
        </div>

        <div>
          <label className="block text-sm font-medium text-cyan-200 mb-2">
            Mot de passe *
          </label>
          <input
            type="password"
            value={formData.password}
            onChange={(e) => handleInputChange('password', e.target.value)}
            className={`w-full px-4 py-3 bg-black/40 border rounded-xl text-white placeholder-cyan-400 focus:outline-none focus:ring-2 focus:ring-cyan-400/30 ${
              errors.password ? 'border-red-500' : 'border-cyan-500/50'
            }`}
            placeholder="••••••••"
          />
          {errors.password && <p className="text-red-400 text-sm mt-1">{errors.password}</p>}
        </div>

        <div>
          <label className="block text-sm font-medium text-cyan-200 mb-2">
            Confirmer mot de passe *
          </label>
          <input
            type="password"
            value={formData.confirmPassword}
            onChange={(e) => handleInputChange('confirmPassword', e.target.value)}
            className={`w-full px-4 py-3 bg-black/40 border rounded-xl text-white placeholder-cyan-400 focus:outline-none focus:ring-2 focus:ring-cyan-400/30 ${
              errors.confirmPassword ? 'border-red-500' : 'border-cyan-500/50'
            }`}
            placeholder="••••••••"
          />
          {errors.confirmPassword && <p className="text-red-400 text-sm mt-1">{errors.confirmPassword}</p>}
        </div>
      </div>
    </div>
  );

  const renderStep3 = () => (
    <div className="space-y-6">
      <div className="text-center mb-8">
        <CreditCard className="w-16 h-16 text-purple-400 mx-auto mb-4" />
        <h2 className="text-2xl font-bold text-white mb-2">Choisir votre plan</h2>
        <p className="text-gray-300">14 jours d'essai gratuit sur tous les plans</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {plans.map((plan) => (
          <div
            key={plan.id}
            onClick={() => handleInputChange('selectedPlan', plan.id)}
            className={`cursor-pointer rounded-2xl p-6 border-2 transition-all hover:scale-105 relative ${
              formData.selectedPlan === plan.id
                ? 'border-cyan-500 bg-cyan-500/20'
                : 'border-white/20 bg-white/10 hover:border-cyan-500/50'
            }`}
          >
            {plan.popular && (
              <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                <span className="bg-gradient-to-r from-purple-500 to-pink-600 text-white px-4 py-1 rounded-full text-sm font-bold">
                  POPULAIRE
                </span>
              </div>
            )}
            
            <div className="text-center">
              <h3 className="text-xl font-bold text-white mb-2">{plan.name}</h3>
              <div className="text-3xl font-bold text-cyan-400 mb-4">{plan.price}</div>
              
              <ul className="space-y-2 mb-6">
                {plan.features.map((feature, index) => (
                  <li key={index} className="flex items-center gap-2 text-gray-300 text-sm">
                    <CheckCircle className="w-4 h-4 text-green-400 flex-shrink-0" />
                    {feature}
                  </li>
                ))}
              </ul>
              
              {formData.selectedPlan === plan.id && (
                <div className="flex items-center justify-center gap-2 text-cyan-300">
                  <CheckCircle className="w-5 h-5" />
                  <span className="font-semibold">Plan sélectionné</span>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      <div className="bg-cyan-500/20 border border-cyan-400/50 rounded-xl p-6">
        <h3 className="text-lg font-bold text-cyan-200 mb-4">Votre domaine OmnIA</h3>
        <div className="flex items-center gap-2">
          <input
            type="text"
            value={formData.proposedSubdomain}
            onChange={(e) => handleInputChange('proposedSubdomain', e.target.value)}
            className="flex-1 px-4 py-3 bg-black/40 border border-cyan-500/50 rounded-xl text-white placeholder-cyan-400 focus:outline-none focus:ring-2 focus:ring-cyan-400/30"
            placeholder="mon-entreprise"
          />
          <span className="text-cyan-300 font-medium">.omnia.sale</span>
        </div>
        <p className="text-cyan-300 text-sm mt-2">
          Votre assistant robot sera accessible sur : {formData.proposedSubdomain || 'votre-domaine'}.omnia.sale
        </p>
      </div>
    </div>
  );

  const renderStep4 = () => (
    <div className="space-y-6">
      <div className="text-center mb-8">
        <FileText className="w-16 h-16 text-orange-400 mx-auto mb-4" />
        <h2 className="text-2xl font-bold text-white mb-2">Documents et validation</h2>
        <p className="text-gray-300">Finalisation de votre inscription</p>
      </div>

      <div className="bg-white/10 backdrop-blur-xl rounded-2xl p-6 border border-white/20">
        <h3 className="text-lg font-bold text-white mb-4">Document Kbis (optionnel)</h3>
        <div className="border-2 border-dashed border-cyan-500/50 rounded-xl p-6 text-center">
          <input
            type="file"
            accept=".pdf,.jpg,.jpeg,.png"
            onChange={(e) => handleInputChange('kbisFile', e.target.files?.[0] || null)}
            className="hidden"
            id="kbis-upload"
          />
          <label htmlFor="kbis-upload" className="cursor-pointer">
            <Upload className="w-12 h-12 text-cyan-400 mx-auto mb-4" />
            <p className="text-white font-semibold mb-2">Télécharger votre Kbis</p>
            <p className="text-gray-300 text-sm">PDF, JPG ou PNG - Max 5MB</p>
          </label>
          {formData.kbisFile && (
            <div className="mt-4 bg-green-500/20 border border-green-400/50 rounded-lg p-3">
              <p className="text-green-300 font-medium">{formData.kbisFile.name}</p>
              <p className="text-green-400 text-sm">{(formData.kbisFile.size / 1024 / 1024).toFixed(2)} MB</p>
            </div>
          )}
        </div>
      </div>

      <div className="space-y-4">
        <label className="flex items-start gap-3 cursor-pointer">
          <input
            type="checkbox"
            checked={formData.acceptTerms}
            onChange={(e) => handleInputChange('acceptTerms', e.target.checked)}
            className="w-5 h-5 text-cyan-600 bg-gray-800 border-gray-600 rounded focus:ring-cyan-500 mt-1"
          />
          <span className="text-gray-300">
            J'accepte les <a href="/terms" className="text-cyan-400 hover:text-cyan-300">conditions générales</a> et la 
            <a href="/privacy" className="text-cyan-400 hover:text-cyan-300"> politique de confidentialité</a> d'OmnIA.sale *
          </span>
        </label>
        {errors.acceptTerms && <p className="text-red-400 text-sm">{errors.acceptTerms}</p>}

        <label className="flex items-start gap-3 cursor-pointer">
          <input
            type="checkbox"
            checked={formData.acceptNewsletter}
            onChange={(e) => handleInputChange('acceptNewsletter', e.target.checked)}
            className="w-5 h-5 text-cyan-600 bg-gray-800 border-gray-600 rounded focus:ring-cyan-500 mt-1"
          />
          <span className="text-gray-300">
            Je souhaite recevoir les actualités et conseils OmnIA par email
          </span>
        </label>
      </div>

      <div className="bg-green-500/20 border border-green-400/50 rounded-xl p-6">
        <h3 className="text-lg font-bold text-green-200 mb-4">🎉 Récapitulatif</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
          <div>
            <span className="text-green-300">Entreprise:</span>
            <div className="text-white font-medium">{formData.companyName}</div>
          </div>
          <div>
            <span className="text-green-300">Contact:</span>
            <div className="text-white font-medium">{formData.firstName} {formData.lastName}</div>
          </div>
          <div>
            <span className="text-green-300">Email:</span>
            <div className="text-white font-medium">{formData.email}</div>
          </div>
          <div>
            <span className="text-green-300">Plan:</span>
            <div className="text-white font-medium">{plans.find(p => p.id === formData.selectedPlan)?.name}</div>
          </div>
          <div>
            <span className="text-green-300">Domaine:</span>
            <div className="text-white font-medium">{formData.proposedSubdomain}.omnia.sale</div>
          </div>
          <div>
            <span className="text-green-300">Essai gratuit:</span>
            <div className="text-white font-medium">14 jours</div>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-purple-900">
      {/* Header */}
      <header className="bg-black/20 backdrop-blur-xl border-b border-white/10">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <Logo size="md" />
            <a href="/" className="flex items-center gap-2 text-cyan-400 hover:text-cyan-300 transition-colors">
              <ArrowLeft className="w-4 h-4" />
              Retour accueil
            </a>
          </div>
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Progress Steps */}
        <div className="flex items-center justify-center mb-8">
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
        <div className="bg-white/10 backdrop-blur-xl rounded-2xl p-8 border border-white/20">
          {currentStep === 1 && renderStep1()}
          {currentStep === 2 && renderStep2()}
          {currentStep === 3 && renderStep3()}
          {currentStep === 4 && renderStep4()}

          {/* Navigation Buttons */}
          <div className="flex justify-between pt-8 border-t border-white/10 mt-8">
            <button
              onClick={handlePrevious}
              disabled={currentStep === 1}
              className="bg-gray-600 hover:bg-gray-700 disabled:bg-gray-800 disabled:cursor-not-allowed text-white px-6 py-3 rounded-xl transition-all"
            >
              Précédent
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
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                    Envoi en cours...
                  </>
                ) : (
                  <>
                    <Send className="w-5 h-5" />
                    Envoyer la demande
                  </>
                )}
              </button>
            )}
          </div>
        </div>

        {/* Info Panel */}
        <div className="mt-8 bg-gradient-to-r from-cyan-500/20 to-blue-600/20 backdrop-blur-xl rounded-2xl p-6 border border-cyan-400/30">
          <h3 className="text-lg font-bold text-white mb-4">🚀 Après votre inscription</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h4 className="font-semibold text-cyan-300 mb-2">⏱️ Validation (24-48h) :</h4>
              <ul className="text-cyan-200 text-sm space-y-1">
                <li>• Vérification des informations</li>
                <li>• Validation du document Kbis</li>
                <li>• Création de votre compte</li>
                <li>• Configuration de votre domaine</li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-cyan-300 mb-2">🎯 Mise en service :</h4>
              <ul className="text-cyan-200 text-sm space-y-1">
                <li>• Accès à votre interface admin</li>
                <li>• Import de votre catalogue</li>
                <li>• Configuration d'OmnIA</li>
                <li>• Formation et support</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};