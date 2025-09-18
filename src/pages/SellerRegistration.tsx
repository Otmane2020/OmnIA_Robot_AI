import React, { useState } from 'react';
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
  const [currentStep, setCurrentStep] = useState(0); // Commencer par l'écran de choix
  const [formData, setFormData] = useState<FormData>({
    companyName: '',
    siret: '',
    address: '',
    postalCode: '',
    city: '',
    country: '',
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
  const [authMode, setAuthMode] = useState<'signup' | 'login' | null>(null);
  const [loginData, setLoginData] = useState({ email: '', password: '' });
  const [authMode, setAuthMode] = useState<'signup' | 'login' | null>(null);
  const [loginData, setLoginData] = useState({ email: '', password: '' });

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
    { id: 0, title: 'Connexion', icon: User, description: 'Connexion ou inscription' },
    { id: 0, title: 'Connexion', icon: User, description: 'Connexion ou inscription' },
    { id: 1, title: 'Entreprise', icon: Building, description: 'Informations société' },
    { id: 2, title: 'Contact', icon: Mail, description: 'Responsable compte' },
    { id: 3, title: 'Plan', icon: CreditCard, description: 'Choix abonnement' },
    { id: 4, title: 'Documents', icon: FileText, description: 'Validation Kbis' }
  ];
  const handleInputChange = (field: keyof FormData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const handleLogin = async () => {
    if (!loginData.email || !loginData.password) {
      setErrors({ login: 'Email et mot de passe requis' });
      return;
    }

    // Simuler la connexion
    console.log('🔐 Tentative de connexion:', loginData.email);
    
    // Rediriger vers l'admin si connexion réussie
    window.location.href = '/admin';
  };
  const handleLogin = async () => {
    if (!loginData.email || !loginData.password) {
      setErrors({ login: 'Email et mot de passe requis' });
      return;
    }

    // Simuler la connexion
    console.log('🔐 Tentative de connexion:', loginData.email);
    
    // Rediriger vers l'admin si connexion réussie
    window.location.href = '/admin';
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
    if (currentStep === 0) {
      if (authMode === 'signup') {
        setCurrentStep(1); // Aller à l'étape entreprise
      } else {
        handleLogin();
      }
    } else if (validateStep(currentStep)) {
    if (currentStep === 0) {
      if (authMode === 'signup') {
        setCurrentStep(1); // Aller à l'étape entreprise
      } else {
        handleLogin();
      }
    } else if (validateStep(currentStep)) {
      setCurrentStep(prev => prev + 1);
    }
    }
  };

  const handleSubmit = async () => {
    if (!validateStep(4)) return;

    setIsSubmitting(true);
    
    try {
      // Simuler l'envoi
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
              className="flex-1 bg-gradient-to-r from-blue-500 to-cyan-600 hover:from-blue-400 hover:to-cyan-500 text-white py-3 rounded-xl font-semibold transition-all"
            >
              Se connecter
            </button>
          </div>
        </div>
      ) : (
        <div className="space-y-6">
          <div className="text-center mb-6">
            <h3 className="text-2xl font-bold text-white mb-2">Créer votre compte revendeur</h3>
            <p className="text-gray-300">Rejoignez les 500+ revendeurs qui utilisent OmnIA</p>
          </div>

          <div className="bg-green-500/20 border border-green-400/50 rounded-xl p-6">
            <h4 className="font-semibold text-green-200 mb-3">✅ Avantages revendeur OmnIA :</h4>
            <ul className="text-green-300 space-y-2 text-sm">
              <li>• Assistant IA personnalisé pour votre catalogue</li>
              <li>• Interface admin complète et intuitive</li>
              <li>• Widget intégrable sur votre site</li>
              <li>• Analytics détaillées et reporting</li>
              <li>• Support technique dédié</li>
              <li>• Formation et accompagnement inclus</li>
            </ul>
          </div>

          <div className="bg-blue-500/20 border border-blue-400/50 rounded-xl p-6">
            <h4 className="font-semibold text-blue-200 mb-3">📋 Processus d'inscription :</h4>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-sm">
              <div className="text-center">
                <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center mx-auto mb-2">
                  <span className="text-white font-bold">1</span>
                </div>
                <p className="text-blue-300">Informations entreprise</p>
              </div>
              <div className="text-center">
                <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center mx-auto mb-2">
                  <span className="text-white font-bold">2</span>
                </div>
                <p className="text-blue-300">Contact responsable</p>
              </div>
              <div className="text-center">
                <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center mx-auto mb-2">
                  <span className="text-white font-bold">3</span>
                </div>
                <p className="text-blue-300">Choix du plan</p>
              </div>
              <div className="text-center">
                <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center mx-auto mb-2">
                  <span className="text-white font-bold">4</span>
                </div>
                <p className="text-blue-300">Validation Kbis</p>
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
              onClick={() => setCurrentStep(1)}
              className="flex-1 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white py-3 rounded-xl font-semibold transition-all"
            >
              Commencer l'inscription
            </button>
          </div>
        </div>
      )}
    </div>
  );
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
              className="flex-1 bg-gradient-to-r from-blue-500 to-cyan-600 hover:from-blue-400 hover:to-cyan-500 text-white py-3 rounded-xl font-semibold transition-all"
            >
              Se connecter
            </button>
          </div>
        </div>
      ) : (
        <div className="space-y-6">
          <div className="text-center mb-6">
            <h3 className="text-2xl font-bold text-white mb-2">Créer votre compte revendeur</h3>
            <p className="text-gray-300">Rejoignez les 500+ revendeurs qui utilisent OmnIA</p>
          </div>

          <div className="bg-green-500/20 border border-green-400/50 rounded-xl p-6">
            <h4 className="font-semibold text-green-200 mb-3">✅ Avantages revendeur OmnIA :</h4>
            <ul className="text-green-300 space-y-2 text-sm">
              <li>• Assistant IA personnalisé pour votre catalogue</li>
              <li>• Interface admin complète et intuitive</li>
              <li>• Widget intégrable sur votre site</li>
              <li>• Analytics détaillées et reporting</li>
              <li>• Support technique dédié</li>
              <li>• Formation et accompagnement inclus</li>
            </ul>
          </div>

          <div className="bg-blue-500/20 border border-blue-400/50 rounded-xl p-6">
            <h4 className="font-semibold text-blue-200 mb-3">📋 Processus d'inscription :</h4>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-sm">
              <div className="text-center">
                <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center mx-auto mb-2">
                  <span className="text-white font-bold">1</span>
                </div>
                <p className="text-blue-300">Informations entreprise</p>
              </div>
              <div className="text-center">
                <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center mx-auto mb-2">
                  <span className="text-white font-bold">2</span>
                </div>
                <p className="text-blue-300">Contact responsable</p>
              </div>
              <div className="text-center">
                <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center mx-auto mb-2">
                  <span className="text-white font-bold">3</span>
                </div>
                <p className="text-blue-300">Choix du plan</p>
              </div>
              <div className="text-center">
                <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center mx-auto mb-2">
                  <span className="text-white font-bold">4</span>
                </div>
                <p className="text-blue-300">Validation Kbis</p>
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
              onClick={() => setCurrentStep(1)}
              className="flex-1 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white py-3 rounded-xl font-semibold transition-all"
            >
              Commencer l'inscription
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
        <div className="flex items-center justify-center mb-12 overflow-x-auto">
          {steps.map((step) => {
            const StepIcon = step.icon;
            const isActive = currentStep === step.id;
            const isCompleted = currentStep > step.id;
            const isAccessible = currentStep >= step.id || (step.id === 0);
            
            return (
            const StepIcon = step.icon;
            const isActive = currentStep === step.id;
            const isCompleted = currentStep > step.id;
            const isAccessible = currentStep >= step.id || (step.id === 0);
            
            return (
            <div key={step} className="flex items-center">
              <div 
                className={`relative w-12 h-12 rounded-2xl flex items-center justify-center font-bold transition-all duration-300 ${
                  isCompleted 
                    ? 'bg-green-500 text-white shadow-lg shadow-green-500/30' 
                    : isActive 
                      ? 'bg-cyan-500 text-white shadow-lg shadow-cyan-500/30 scale-110' 
                      : isAccessible
                        ? 'bg-gray-600 text-gray-300 hover:bg-gray-500 cursor-pointer'
                        : 'bg-gray-700 text-gray-500'
                }`}
                onClick={() => isAccessible && setCurrentStep(step.id)}
                title={step.description}
              >
                {isCompleted ? (
                  <CheckCircle className="w-6 h-6" />
                ) : (
                  <StepIcon className="w-6 h-6" />
                )}
                
                {/* Badge numéro d'étape */}
                <div className={`absolute -top-2 -right-2 w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                  isCompleted ? 'bg-green-600' : isActive ? 'bg-cyan-600' : 'bg-gray-600'
                }`}>
                  {step.id}
                </div>
                      : isAccessible
                        ? 'bg-gray-600 text-gray-300 hover:bg-gray-500 cursor-pointer'
                        : 'bg-gray-700 text-gray-500'
                }`}
                onClick={() => isAccessible && setCurrentStep(step.id)}
                title={step.description}
              >
                {isCompleted ? (
                  <CheckCircle className="w-6 h-6" />
                ) : (
                  <StepIcon className="w-6 h-6" />
                )}
                
                {/* Badge numéro d'étape */}
                <div className={\`absolute -top-2 -right-2 w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                  isCompleted ? 'bg-green-600' : isActive ? 'bg-cyan-600' : 'bg-gray-600'
                }`}>
                  {step.id}
                </div>
              </div>
              
              {/* Ligne de connexion */}
              {step.id < steps.length - 1 && (
              {/* Ligne de connexion */}
              {step.id < steps.length - 1 && (
                <div className={\`w-16 h-1 ${
                  currentStep > step.id ? 'bg-cyan-500' : 'bg-gray-600'
                }`} />
              )}
            </div>
            );
            );
          })}
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
          {currentStep === 0 && renderStep0()}
          {currentStep === 1 && renderStep1()}
          {currentStep === 2 && renderStep2()}
          {currentStep === 3 && renderStep3()}
          {currentStep === 4 && renderStep4()}

          {/* Navigation Buttons */}
          {currentStep > 0 && (
            <div className="flex justify-between mt-8 pt-6 border-t border-white/20">
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
          )}
          )}
        </div>
      </div>
    </div>
  );
};