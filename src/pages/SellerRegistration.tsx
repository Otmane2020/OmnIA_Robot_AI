import React, { useState } from 'react';
import { 
  Building, User, Mail, Phone, MapPin, CreditCard, 
  Upload, ArrowLeft, CheckCircle, AlertCircle, 
  FileText, Globe, Crown, Zap, Bot
} from 'lucide-react';
import { Logo } from '../components/Logo';

interface SellerRegistrationProps {
  onSubmit: (data: any) => void;
  onBack: () => void;
}

export const SellerRegistration: React.FC<SellerRegistrationProps> = ({ onSubmit, onBack }) => {
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState({
    // Informations entreprise
    companyName: '',
    siret: '',
    address: '',
    postalCode: '',
    city: '',
    country: 'France',
    
    // Contact responsable
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    position: '',
    
    // Plan et configuration
    selectedPlan: 'professional',
    password: '',
    confirmPassword: '',
    
    // Documents
    kbisFile: null as File | null,
    
    // Acceptation
    acceptTerms: false,
    acceptMarketing: false
  });

  const [errors, setErrors] = useState<{[key: string]: string}>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const countries = [
    { code: 'FR', name: 'France', flag: '🇫🇷' },
    { code: 'BE', name: 'Belgique', flag: '🇧🇪' },
    { code: 'CH', name: 'Suisse', flag: '🇨🇭' },
    { code: 'LU', name: 'Luxembourg', flag: '🇱🇺' },
    { code: 'MC', name: 'Monaco', flag: '🇲🇨' },
    { code: 'CA', name: 'Canada', flag: '🇨🇦' },
    { code: 'MA', name: 'Maroc', flag: '🇲🇦' },
    { code: 'TN', name: 'Tunisie', flag: '🇹🇳' },
    { code: 'SN', name: 'Sénégal', flag: '🇸🇳' },
    { code: 'CI', name: 'Côte d\'Ivoire', flag: '🇨🇮' }
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
        'Widget personnalisable'
      ],
      color: 'from-gray-500 to-gray-600'
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
        'Analytics avancées'
      ],
      color: 'from-cyan-500 to-blue-600',
      popular: true
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
        'API personnalisée'
      ],
      color: 'from-purple-500 to-pink-600'
    }
  ];

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
      if (!formData.phone.trim()) newErrors.phone = 'Téléphone requis';
      if (!formData.position.trim()) newErrors.position = 'Fonction requise';
      
      // Validation email
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (formData.email && !emailRegex.test(formData.email)) {
        newErrors.email = 'Format email invalide';
      }
    }

    if (step === 3) {
      if (!formData.password.trim()) newErrors.password = 'Mot de passe requis';
      if (formData.password.length < 6) newErrors.password = 'Minimum 6 caractères';
      if (formData.password !== formData.confirmPassword) {
        newErrors.confirmPassword = 'Les mots de passe ne correspondent pas';
      }
    }

    if (step === 4) {
      if (!formData.acceptTerms) newErrors.acceptTerms = 'Acceptation des CGU requise';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    if (validateStep(currentStep)) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handlePrevious = () => {
    setCurrentStep(currentStep - 1);
    setErrors({});
  };

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const handleFileUpload = (file: File) => {
    if (file.size > 10 * 1024 * 1024) { // 10MB max
      setErrors(prev => ({ ...prev, kbisFile: 'Fichier trop volumineux (max 10MB)' }));
      return;
    }
    
    const allowedTypes = ['application/pdf', 'image/jpeg', 'image/png', 'image/jpg'];
    if (!allowedTypes.includes(file.type)) {
      setErrors(prev => ({ ...prev, kbisFile: 'Format non supporté (PDF, JPG, PNG uniquement)' }));
      return;
    }

    setFormData(prev => ({ ...prev, kbisFile: file }));
    setErrors(prev => ({ ...prev, kbisFile: '' }));
  };

  const handleSubmit = async () => {
    if (!validateStep(4)) return;

    setIsSubmitting(true);
    
    try {
      // Simulate submission delay
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Generate password if not provided
      const finalPassword = formData.password || generatePassword();
      
      const submissionData = {
        ...formData,
        password: finalPassword,
        id: Date.now().toString(),
        submittedAt: new Date().toISOString(),
        status: 'pending_validation',
        proposedSubdomain: formData.companyName.toLowerCase()
          .replace(/[^a-z0-9]/g, '')
          .substring(0, 20)
      };
      
      onSubmit(submissionData);
      
    } catch (error) {
      console.error('Erreur soumission:', error);
      setErrors({ submit: 'Erreur lors de la soumission. Veuillez réessayer.' });
    } finally {
      setIsSubmitting(false);
    }
  };

  const generatePassword = (): string => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let password = '';
    for (let i = 0; i < 8; i++) {
      password += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return password;
  };

  const renderStep1 = () => (
    <div className="space-y-6">
      <div className="text-center mb-8">
        <Building className="w-16 h-16 text-cyan-400 mx-auto mb-4" />
        <h2 className="text-2xl font-bold text-white mb-2">Informations Entreprise</h2>
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
            placeholder="Ex: 12345678901234"
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
            {countries.map((country) => (
              <option key={country.code} value={country.name} className="bg-slate-800">
                {country.flag} {country.name}
              </option>
            ))}
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
            placeholder="Ex: 123 Avenue des Champs-Élysées"
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
            placeholder="Ex: 75008"
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
            placeholder="Ex: Paris"
          />
          {errors.city && <p className="text-red-400 text-sm mt-1">{errors.city}</p>}
        </div>
      </div>
    </div>
  );

  const renderStep2 = () => (
    <div className="space-y-6">
      <div className="text-center mb-8">
        <User className="w-16 h-16 text-purple-400 mx-auto mb-4" />
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
            placeholder="Ex: Jean"
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
            placeholder="Ex: Dupont"
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
            placeholder="Ex: jean.dupont@monmagasin.fr"
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
            placeholder="Ex: +33 1 23 45 67 89"
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
            placeholder="Ex: Directeur, Gérant, Responsable commercial"
          />
          {errors.position && <p className="text-red-400 text-sm mt-1">{errors.position}</p>}
        </div>
      </div>
    </div>
  );

  const renderStep3 = () => (
    <div className="space-y-6">
      <div className="text-center mb-8">
        <Crown className="w-16 h-16 text-yellow-400 mx-auto mb-4" />
        <h2 className="text-2xl font-bold text-white mb-2">Choix du Plan</h2>
        <p className="text-gray-300">Sélectionnez l'abonnement adapté à vos besoins</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {plans.map((plan) => (
          <div
            key={plan.id}
            onClick={() => handleInputChange('selectedPlan', plan.id)}
            className={`relative cursor-pointer rounded-2xl p-6 border-2 transition-all hover:scale-105 ${
              formData.selectedPlan === plan.id
                ? 'border-cyan-400 bg-cyan-500/20 shadow-2xl shadow-cyan-500/30'
                : 'border-white/20 bg-white/10 hover:border-cyan-400/50'
            }`}
          >
            {plan.popular && (
              <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                <span className="bg-gradient-to-r from-cyan-500 to-blue-600 text-white px-4 py-1 rounded-full text-sm font-bold">
                  POPULAIRE
                </span>
              </div>
            )}
            
            <div className="text-center">
              <h3 className="text-xl font-bold text-white mb-2">{plan.name}</h3>
              <div className="text-2xl font-bold text-cyan-400 mb-2">{plan.price}</div>
              <p className="text-gray-400 text-sm mb-4">{plan.description}</p>
              
              <ul className="space-y-2 text-sm">
                {plan.features.map((feature, index) => (
                  <li key={index} className="flex items-center gap-2 text-gray-300">
                    <CheckCircle className="w-4 h-4 text-green-400 flex-shrink-0" />
                    {feature}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8">
        <div>
          <label className="block text-sm font-medium text-cyan-200 mb-2">
            Mot de passe *
          </label>
          <input
            type="password"
            value={formData.password}
            onChange={(e) => handleInputChange('password', e.target.value)}
            className={`w-full bg-black/40 border rounded-xl px-4 py-3 text-white placeholder-cyan-400 focus:outline-none focus:border-cyan-400 focus:ring-2 focus:ring-cyan-400/30 ${
              errors.password ? 'border-red-500' : 'border-cyan-500/50'
            }`}
            placeholder="Minimum 6 caractères"
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
            className={`w-full bg-black/40 border rounded-xl px-4 py-3 text-white placeholder-cyan-400 focus:outline-none focus:border-cyan-400 focus:ring-2 focus:ring-cyan-400/30 ${
              errors.confirmPassword ? 'border-red-500' : 'border-cyan-500/50'
            }`}
            placeholder="Répétez le mot de passe"
          />
          {errors.confirmPassword && <p className="text-red-400 text-sm mt-1">{errors.confirmPassword}</p>}
        </div>
      </div>
    </div>
  );

  const renderStep4 = () => (
    <div className="space-y-6">
      <div className="text-center mb-8">
        <FileText className="w-16 h-16 text-green-400 mx-auto mb-4" />
        <h2 className="text-2xl font-bold text-white mb-2">Documents & Validation</h2>
        <p className="text-gray-300">Finalisez votre inscription</p>
      </div>

      {/* Upload Kbis */}
      <div className="bg-white/10 backdrop-blur-xl rounded-2xl p-6 border border-white/20">
        <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
          <Upload className="w-5 h-5 text-cyan-400" />
          Document Kbis (optionnel)
        </h3>
        
        <div className="border-2 border-dashed border-cyan-400/50 rounded-xl p-6 text-center hover:border-cyan-400/70 transition-colors">
          <input
            type="file"
            accept=".pdf,.jpg,.jpeg,.png"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) handleFileUpload(file);
            }}
            className="hidden"
            id="kbis-upload"
          />
          
          {!formData.kbisFile ? (
            <label htmlFor="kbis-upload" className="cursor-pointer">
              <FileText className="w-12 h-12 text-cyan-400 mx-auto mb-4" />
              <p className="text-white font-semibold mb-2">Cliquez pour uploader votre Kbis</p>
              <p className="text-gray-300 text-sm">PDF, JPG ou PNG • Max 10MB • Moins de 3 mois</p>
            </label>
          ) : (
            <div className="bg-green-500/20 border border-green-400/50 rounded-xl p-4">
              <CheckCircle className="w-8 h-8 text-green-400 mx-auto mb-2" />
              <p className="text-green-300 font-semibold">{formData.kbisFile.name}</p>
              <p className="text-sm text-green-400">
                {(formData.kbisFile.size / 1024 / 1024).toFixed(2)} MB
              </p>
              <button
                onClick={() => handleInputChange('kbisFile', null)}
                className="mt-2 text-sm text-green-300 hover:text-green-200 underline"
              >
                Changer de fichier
              </button>
            </div>
          )}
        </div>
        
        {errors.kbisFile && <p className="text-red-400 text-sm mt-2">{errors.kbisFile}</p>}
      </div>

      {/* Acceptation */}
      <div className="space-y-4">
        <label className="flex items-start gap-3 cursor-pointer">
          <input
            type="checkbox"
            checked={formData.acceptTerms}
            onChange={(e) => handleInputChange('acceptTerms', e.target.checked)}
            className="w-5 h-5 text-cyan-600 bg-black/40 border-cyan-500/50 rounded focus:ring-cyan-500 focus:ring-2 mt-1"
          />
          <span className="text-gray-300 text-sm">
  J'accepte les <a href="/terms" className="text-cyan-400 hover:text-cyan-300 underline">conditions générales d'utilisation</a> 
et la <a href="/privacy" className="text-cyan-400 hover:text-cyan-300 underline">politique de confidentialité</a> d'OmnIA.sale *
          </span>
        </label>
        {errors.acceptTerms && <p className="text-red-400 text-sm">{errors.acceptTerms}</p>}

        <label className="flex items-start gap-3 cursor-pointer">
          <input
            type="checkbox"
            checked={formData.acceptMarketing}
            onChange={(e) => handleInputChange('acceptMarketing', e.target.checked)}
            className="w-5 h-5 text-cyan-600 bg-black/40 border-cyan-500/50 rounded focus:ring-cyan-500 focus:ring-2 mt-1"
          />
          <span className="text-gray-300 text-sm">
            J'accepte de recevoir les actualités produits et conseils d'utilisation par email (optionnel)
          </span>
        </label>
      </div>

      {/* Récapitulatif */}
      <div className="bg-blue-500/20 border border-blue-400/50 rounded-xl p-6">
        <h3 className="font-semibold text-blue-200 mb-4">📋 Récapitulatif de votre inscription :</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
          <div>
            <p className="text-blue-300"><strong>Entreprise :</strong> {formData.companyName || 'Non renseigné'}</p>
            <p className="text-blue-300"><strong>Contact :</strong> {formData.firstName} {formData.lastName}</p>
            <p className="text-blue-300"><strong>Email :</strong> {formData.email || 'Non renseigné'}</p>
          </div>
          <div>
            <p className="text-blue-300"><strong>Plan :</strong> {plans.find(p => p.id === formData.selectedPlan)?.name}</p>
            <p className="text-blue-300"><strong>Sous-domaine :</strong> {formData.companyName ? formData.companyName.toLowerCase().replace(/[^a-z0-9]/g, '').substring(0, 20) : 'boutique'}.omnia.sale</p>
            <p className="text-blue-300"><strong>Kbis :</strong> {formData.kbisFile ? '✅ Uploadé' : '⚠️ Non fourni'}</p>
          </div>
        </div>
      </div>

      {errors.submit && (
        <div className="bg-red-500/20 border border-red-400/50 rounded-xl p-4">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-5 h-5 text-red-400" />
            <span className="text-red-300">{errors.submit}</span>
          </div>
        </div>
      )}
    </div>
  );

  const renderCurrentStep = () => {
    switch (currentStep) {
      case 1: return renderStep1();
      case 2: return renderStep2();
      case 3: return renderStep3();
      case 4: return renderStep4();
      default: return renderStep1();
    }
  };

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
              <div className={`w-12 h-12 rounded-full flex items-center justify-center font-bold text-lg border-2 transition-all ${
                currentStep >= step 
                  ? 'bg-cyan-500 border-cyan-400 text-white shadow-lg shadow-cyan-500/50' 
                  : 'bg-slate-700 border-slate-600 text-gray-400'
              }`}>
                {step}
              </div>
              {step < 4 && (
                <div className={`w-16 h-1 transition-all ${
                  currentStep > step ? 'bg-cyan-500' : 'bg-slate-600'
                }`} />
              )}
            </div>
          ))}
        </div>

        {/* Form Content */}
        <div className="bg-white/10 backdrop-blur-2xl rounded-3xl p-8 border border-white/20 shadow-2xl">
          {renderCurrentStep()}

          {/* Navigation Buttons */}
          <div className="flex justify-between mt-8 pt-6 border-t border-white/20">
            <button
              onClick={handlePrevious}
              disabled={currentStep === 1}
              className="bg-gray-600 hover:bg-gray-700 disabled:bg-gray-800 disabled:cursor-not-allowed text-white px-6 py-3 rounded-xl font-semibold transition-all disabled:opacity-50"
            >
              Précédent
            </button>

            {currentStep < 4 ? (
              <button
                onClick={handleNext}
                className="bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white px-6 py-3 rounded-xl font-semibold transition-all shadow-lg hover:shadow-cyan-500/30"
              >
                Suivant
              </button>
            ) : (
              <button
                onClick={handleSubmit}
                disabled={isSubmitting}
                className="bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-400 hover:to-emerald-500 disabled:from-gray-600 disabled:to-gray-700 text-white px-8 py-3 rounded-xl font-semibold transition-all shadow-lg hover:shadow-green-500/30 disabled:cursor-not-allowed flex items-center gap-2"
              >
                {isSubmitting ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                    Envoi en cours...
                  </>
                ) : (
                  <>
                    <Bot className="w-5 h-5" />
                    Créer mon compte OmnIA
                  </>
                )}
              </button>
            )}
          </div>
        </div>

        {/* Info Box */}
        <div className="mt-8 bg-gradient-to-r from-cyan-500/20 to-blue-600/20 backdrop-blur-xl rounded-2xl p-6 border border-cyan-400/30 text-center">
          <h3 className="text-lg font-bold text-white mb-2">🚀 Après validation</h3>
          <p className="text-cyan-300 mb-4">
            Votre assistant IA sera configuré automatiquement avec votre sous-domaine personnalisé
          </p>
          <div className="flex items-center justify-center gap-6 text-sm">
            <div className="flex items-center gap-2">
              <Zap className="w-4 h-4 text-yellow-400" />
              <span className="text-yellow-300">Validation sous 24h</span>
            </div>
            <div className="flex items-center gap-2">
              <Globe className="w-4 h-4 text-green-400" />
              <span className="text-green-300">Sous-domaine inclus</span>
            </div>
            <div className="flex items-center gap-2">
              <Bot className="w-4 h-4 text-purple-400" />
              <span className="text-purple-300">IA pré-configurée</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};