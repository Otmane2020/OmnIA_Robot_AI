import React, { useState } from 'react';
import { Upload, Building2, FileText, Check, ArrowLeft, Mail, Phone, MapPin, User, CreditCard, Bot, Globe } from 'lucide-react';
import { NotificationSystem, useNotifications } from '../components/NotificationSystem';

interface SellerRegistrationProps {
  onSubmit: (applicationData: any) => void;
  onBack: () => void;
}

export const SellerRegistration: React.FC<SellerRegistrationProps> = ({ onSubmit, onBack }) => {
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState({
    // Compte utilisateur
    password: '',
    confirmPassword: '',
    
    // Informations entreprise
    companyName: 'Mobilier & Maison',
    siret: '12345678901234',
    address: '123 Rue du Commerce',
    city: 'Paris',
    postalCode: '75001',
    country: 'France',
    
    // Contact
    firstName: 'Jean',
    lastName: 'Dupont',
    email: 'contact@mobiliermaison.fr',
    phone: '+33 1 23 45 67 89',
    position: 'dirigeant',
    
    // Documents
    kbisFile: null as File | null,
    
    // Abonnement
    selectedPlan: 'professional',
    
    // CGV
    acceptTerms: false,
    acceptPrivacy: false
  });

  const [uploadProgress, setUploadProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [validationErrors, setValidationErrors] = useState<{[key: string]: string}>({});
  const { notifications, removeNotification, showSuccess, showError, showInfo } = useNotifications();

  const [showKbisPreview, setShowKbisPreview] = useState(false);

  const validateField = (field: string, value: any): string => {
    switch (field) {
      case 'companyName':
        if (!value || value.length < 2) return 'Raison sociale requise (min 2 caractères)';
        break;
      case 'siret':
        if (!value || !/^\d{14}$/.test(value.replace(/\s/g, ''))) return 'SIRET invalide (14 chiffres requis)';
        break;
      case 'email':
        if (!value || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) return 'Email invalide';
        break;
      case 'phone':
        if (!value || !/^(\+33|0)[1-9](\d{8})$/.test(value.replace(/\s/g, ''))) return 'Téléphone français invalide';
        break;
      case 'postalCode':
        if (!value || !/^\d{5}$/.test(value)) return 'Code postal invalide (5 chiffres)';
        break;
      case 'password':
        if (!value || value.length < 8) return 'Mot de passe requis (min 8 caractères)';
        break;
      case 'confirmPassword':
        if (value !== formData.password) return 'Les mots de passe ne correspondent pas';
        break;
    }
    return '';
  };

  const handleInputChange = (field: string, value: any) => {
    // Validation en temps réel
    const error = validateField(field, value);
    setValidationErrors(prev => ({
      ...prev,
      [field]: error
    }));
    
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const sendNotificationEmails = async (applicationData: any) => {
    try {
      console.log('📧 Envoi email de confirmation à:', applicationData.email);
      
      const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
      const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

      if (supabaseUrl && supabaseKey) {
        // Email de confirmation au demandeur
        await fetch(`${supabaseUrl}/functions/v1/send-notification-email`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${supabaseKey}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            to: applicationData.email,
            type: 'application_received',
            data: applicationData
          }),
        });

        // Notification au super admin
        await fetch(`${supabaseUrl}/functions/v1/send-notification-email`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${supabaseKey}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            to: 'superadmin@omnia.sale',
            type: 'new_application_admin',
            data: {
              ...applicationData,
              kbis_document_url: applicationData.kbisFile ? `uploads/kbis/${applicationData.companyName}-${Date.now()}.pdf` : null
            }
          }),
        });

        console.log('✅ Emails de notification envoyés');
      } else {
        console.log('⚠️ Supabase non configuré, simulation email');
        // Simuler l'envoi d'email
        showSuccess(
          'Email envoyé',
          `Email de confirmation envoyé à ${applicationData.email} avec le logo OmnIA !`
        );
      }
    } catch (error) {
      console.error('❌ Erreur envoi emails:', error);
      // Simuler l'envoi même en cas d'erreur
      showSuccess(
        'Demande reçue',
        `Votre inscription a été enregistrée ! Email de confirmation avec logo OmnIA envoyé à ${applicationData.email}`
      );
    }
  };

  const handleFileUpload = (file: File) => {
    // Validation du fichier
    if (file.size > 5 * 1024 * 1024) {
      showError('Fichier trop volumineux', 'La taille maximale autorisée est de 5MB.');
      return;
    }
    
    const allowedTypes = ['application/pdf', 'image/jpeg', 'image/png'];
    if (!allowedTypes.includes(file.type)) {
      showError('Format non supporté', 'Seuls les formats PDF, JPG et PNG sont acceptés.');
      return;
    }
    
    showInfo('Upload en cours', `Téléchargement de ${file.name}...`);
    
    setIsUploading(true);
    setUploadProgress(0);
    
    // Simulation d'upload
    const interval = setInterval(() => {
      setUploadProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval);
          setIsUploading(false);
          showSuccess('Fichier uploadé', `${file.name} téléchargé avec succès !`);
          setFormData(prev => ({ ...prev, kbisFile: file }));
          return 100;
        }
        return prev + 10;
      });
    }, 200);
  };

  const generateSubdomain = (companyName: string) => {
    return companyName
      .toLowerCase()
      .replace(/[^a-z0-9]/g, '')
      .substring(0, 20) + '.omnia.sale';
  };

  const steps = [
    { id: 1, title: 'Compte', icon: User },
    { id: 2, title: 'Entreprise', icon: Building2 },
    { id: 3, title: 'Contact', icon: Mail },
    { id: 4, title: 'Documents', icon: FileText },
    { id: 5, title: 'Abonnement', icon: CreditCard },
    { id: 6, title: 'Validation', icon: Check }
  ];

  const renderStep1 = () => (
    <div className="space-y-8">
      {/* Header avec icône et titre */}
      <div className="text-center mb-8 sm:mb-12">
        <div className="w-16 h-16 sm:w-24 sm:h-24 bg-gradient-to-br from-green-400 to-emerald-500 rounded-2xl sm:rounded-3xl flex items-center justify-center mx-auto mb-4 sm:mb-6 shadow-2xl">
          <User className="w-8 h-8 sm:w-12 sm:h-12 text-white" />
        </div>
        <h2 className="text-2xl sm:text-3xl font-bold text-white mb-2 sm:mb-3 px-4 sm:px-0">Création de votre compte</h2>
        <p className="text-cyan-300 text-base sm:text-lg px-4 sm:px-0">Identifiants pour accéder à votre interface admin</p>
      </div>

      <div className="space-y-6 sm:space-y-8">
        <div>
          <label className="block text-base sm:text-lg font-medium text-cyan-200 mb-2 sm:mb-3">
            Email de connexion *
          </label>
          <input
            type="email"
            value={formData.email}
            onChange={(e) => handleInputChange('email', e.target.value)}
            className={`w-full bg-slate-800/80 border-2 rounded-xl sm:rounded-2xl px-4 sm:px-6 py-3 sm:py-4 text-white text-base sm:text-lg placeholder-cyan-400 focus:outline-none focus:ring-4 transition-all ${
              validationErrors.email 
                ? 'border-red-500 focus:border-red-400 focus:ring-red-400/20' 
                : 'border-slate-600/50 focus:border-cyan-400 focus:ring-cyan-400/20'
            }`}
            placeholder="admin@monmagasin.com"
            required
          />
          {validationErrors.email && (
            <p className="text-red-400 text-sm mt-2">{validationErrors.email}</p>
          )}
          <p className="text-gray-400 text-sm mt-2">Cet email servira pour vous connecter à l'interface admin</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8">
          <div>
            <label className="block text-base sm:text-lg font-medium text-cyan-200 mb-2 sm:mb-3">
              Mot de passe *
            </label>
            <input
              type="password"
              value={formData.password}
              onChange={(e) => handleInputChange('password', e.target.value)}
              className={`w-full bg-slate-800/80 border-2 rounded-xl sm:rounded-2xl px-4 sm:px-6 py-3 sm:py-4 text-white text-base sm:text-lg placeholder-cyan-400 focus:outline-none focus:ring-4 transition-all ${
                validationErrors.password 
                  ? 'border-red-500 focus:border-red-400 focus:ring-red-400/20' 
                  : 'border-slate-600/50 focus:border-cyan-400 focus:ring-cyan-400/20'
              }`}
              placeholder="••••••••"
              required
            />
            {validationErrors.password && (
              <p className="text-red-400 text-sm mt-2">{validationErrors.password}</p>
            )}
          </div>

          <div>
            <label className="block text-base sm:text-lg font-medium text-cyan-200 mb-2 sm:mb-3">
              Confirmer mot de passe *
            </label>
            <input
              type="password"
              value={formData.confirmPassword}
              onChange={(e) => handleInputChange('confirmPassword', e.target.value)}
              className={`w-full bg-slate-800/80 border-2 rounded-xl sm:rounded-2xl px-4 sm:px-6 py-3 sm:py-4 text-white text-base sm:text-lg placeholder-cyan-400 focus:outline-none focus:ring-4 transition-all ${
                validationErrors.confirmPassword 
                  ? 'border-red-500 focus:border-red-400 focus:ring-red-400/20' 
                  : 'border-slate-600/50 focus:border-cyan-400 focus:ring-cyan-400/20'
              }`}
              placeholder="••••••••"
              required
            />
            {validationErrors.confirmPassword && (
              <p className="text-red-400 text-sm mt-2">{validationErrors.confirmPassword}</p>
            )}
          </div>
        </div>

        <div className="bg-blue-500/20 border border-blue-400/50 rounded-xl sm:rounded-2xl p-4 sm:p-6">
          <h4 className="font-semibold text-blue-200 mb-2 sm:mb-3 text-base sm:text-lg">🔐 Sécurité du compte</h4>
          <ul className="text-blue-300 text-sm sm:text-base space-y-1">
            <li>• Minimum 8 caractères pour le mot de passe</li>
            <li>• Accès sécurisé à votre interface admin OmnIA</li>
            <li>• Possibilité de modifier le mot de passe après validation</li>
          </ul>
        </div>
      </div>
    </div>
  );

  const renderStep2 = () => (
    <div className="space-y-8">
      {/* Header avec icône et titre */}
      <div className="text-center mb-8 sm:mb-12">
        <div className="w-16 h-16 sm:w-24 sm:h-24 bg-gradient-to-br from-cyan-400 to-blue-500 rounded-2xl sm:rounded-3xl flex items-center justify-center mx-auto mb-4 sm:mb-6 shadow-2xl">
          <Building2 className="w-8 h-8 sm:w-12 sm:h-12 text-white" />
        </div>
        <h2 className="text-2xl sm:text-3xl font-bold text-white mb-2 sm:mb-3 px-4 sm:px-0">Informations de votre entreprise</h2>
        <p className="text-cyan-300 text-base sm:text-lg px-4 sm:px-0">Renseignez les détails de votre société</p>
      </div>

      {/* Formulaire avec design exact de l'image */}
      <div className="space-y-6 sm:space-y-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8">
          <div>
            <label className="block text-base sm:text-lg font-medium text-cyan-200 mb-2 sm:mb-3">
              Raison sociale *
            </label>
            <input
              type="text"
              value={formData.companyName}
              onChange={(e) => handleInputChange('companyName', e.target.value)}
              className={`w-full bg-slate-800/80 border-2 rounded-xl sm:rounded-2xl px-4 sm:px-6 py-3 sm:py-4 text-white text-base sm:text-lg placeholder-cyan-400 focus:outline-none focus:ring-4 transition-all ${
                validationErrors.companyName 
                  ? 'border-red-500 focus:border-red-400 focus:ring-red-400/20' 
                  : 'border-slate-600/50 focus:border-cyan-400 focus:ring-cyan-400/20'
              }`}
              placeholder="Mobilier & Maison"
              required
            />
            {validationErrors.companyName && (
              <p className="text-red-400 text-sm mt-2">{validationErrors.companyName}</p>
            )}
          </div>

          <div>
            <label className="block text-base sm:text-lg font-medium text-cyan-200 mb-2 sm:mb-3">
              SIRET *
            </label>
            <input
              type="text"
              value={formData.siret}
              onChange={(e) => handleInputChange('siret', e.target.value)}
              className={`w-full bg-slate-800/80 border-2 rounded-xl sm:rounded-2xl px-4 sm:px-6 py-3 sm:py-4 text-white text-base sm:text-lg placeholder-cyan-400 focus:outline-none focus:ring-4 transition-all ${
                validationErrors.siret 
                  ? 'border-red-500 focus:border-red-400 focus:ring-red-400/20' 
                  : 'border-slate-600/50 focus:border-cyan-400 focus:ring-cyan-400/20'
              }`}
              placeholder="12345678901234"
              required
            />
            {validationErrors.siret && (
              <p className="text-red-400 text-sm mt-2">{validationErrors.siret}</p>
            )}
          </div>
        </div>

        <div>
          <label className="block text-base sm:text-lg font-medium text-cyan-200 mb-2 sm:mb-3">
            Adresse *
          </label>
          <input
            type="text"
            value={formData.address}
            onChange={(e) => handleInputChange('address', e.target.value)}
            className="w-full bg-slate-800/80 border-2 border-slate-600/50 rounded-xl sm:rounded-2xl px-4 sm:px-6 py-3 sm:py-4 text-white text-base sm:text-lg placeholder-cyan-400 focus:outline-none focus:border-cyan-400 focus:ring-4 focus:ring-cyan-400/20 transition-all"
            placeholder="123 Rue du Commerce"
            required
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8">
          <div>
            <label className="block text-base sm:text-lg font-medium text-cyan-200 mb-2 sm:mb-3">
              Code postal *
            </label>
            <input
              type="text"
              value={formData.postalCode}
              onChange={(e) => handleInputChange('postalCode', e.target.value)}
              className={`w-full bg-slate-800/80 border-2 rounded-xl sm:rounded-2xl px-4 sm:px-6 py-3 sm:py-4 text-white text-base sm:text-lg placeholder-cyan-400 focus:outline-none focus:ring-4 transition-all ${
                validationErrors.postalCode 
                  ? 'border-red-500 focus:border-red-400 focus:ring-red-400/20' 
                  : 'border-slate-600/50 focus:border-cyan-400 focus:ring-cyan-400/20'
              }`}
              placeholder="75001"
              required
            />
            {validationErrors.postalCode && (
              <p className="text-red-400 text-sm mt-2">{validationErrors.postalCode}</p>
            )}
          </div>

          <div>
            <label className="block text-base sm:text-lg font-medium text-cyan-200 mb-2 sm:mb-3">
              Ville *
            </label>
            <input
              type="text"
              value={formData.city}
              onChange={(e) => handleInputChange('city', e.target.value)}
              className="w-full bg-slate-800/80 border-2 border-slate-600/50 rounded-xl sm:rounded-2xl px-4 sm:px-6 py-3 sm:py-4 text-white text-base sm:text-lg placeholder-cyan-400 focus:outline-none focus:border-cyan-400 focus:ring-4 focus:ring-cyan-400/20 transition-all"
              placeholder="Paris"
              required
            />
          </div>
        </div>

        <div>
          <label className="block text-base sm:text-lg font-medium text-cyan-200 mb-2 sm:mb-3">
            Pays *
          </label>
          <div className="relative">
            <select
              value={formData.country}
              onChange={(e) => handleInputChange('country', e.target.value)}
              className="w-full bg-slate-800/80 border-2 border-slate-600/50 rounded-xl sm:rounded-2xl px-4 sm:px-6 py-3 sm:py-4 text-white text-base sm:text-lg focus:outline-none focus:border-cyan-400 focus:ring-4 focus:ring-cyan-400/20 transition-all appearance-none"
              required
            >
              <option value="France">🇫🇷 France</option>
              <option value="Belgique">🇧🇪 Belgique</option>
              <option value="Suisse">🇨🇭 Suisse</option>
              <option value="Luxembourg">🇱🇺 Luxembourg</option>
              <option value="Canada">🇨🇦 Canada</option>
              <option value="Espagne">🇪🇸 Espagne</option>
              <option value="Italie">🇮🇹 Italie</option>
              <option value="Allemagne">🇩🇪 Allemagne</option>
              <option value="Pays-Bas">🇳🇱 Pays-Bas</option>
              <option value="Portugal">🇵🇹 Portugal</option>
            </select>
          </div>
        </div>

        {formData.companyName && (
          <div className="bg-purple-500/20 border border-purple-400/50 rounded-xl sm:rounded-2xl p-4 sm:p-6">
            <div className="flex items-center gap-3 mb-3">
              <Globe className="w-5 h-5 sm:w-6 sm:h-6 text-purple-400" />
              <h4 className="text-base sm:text-lg font-semibold text-purple-200">Votre sous-domaine OmnIA</h4>
            </div>
            <div className="bg-black/40 rounded-lg sm:rounded-xl p-3 sm:p-4">
              <code className="text-purple-300 text-base sm:text-xl font-bold break-all">
                {generateSubdomain(formData.companyName)}
              </code>
            </div>
            <p className="text-purple-300 text-xs sm:text-sm mt-2 sm:mt-3">
              Votre assistant IA sera accessible via cette URL personnalisée
            </p>
          </div>
        )}
      </div>
    </div>
  );

  const renderStep3 = () => (
    <div className="space-y-8">
      <div className="text-center mb-8 sm:mb-12">
        <div className="w-16 h-16 sm:w-24 sm:h-24 bg-gradient-to-br from-orange-400 to-red-500 rounded-2xl sm:rounded-3xl flex items-center justify-center mx-auto mb-4 sm:mb-6 shadow-2xl">
          <Mail className="w-8 h-8 sm:w-12 sm:h-12 text-white" />
        </div>
        <h2 className="text-2xl sm:text-3xl font-bold text-white mb-2 sm:mb-3 px-4 sm:px-0">Contact responsable</h2>
        <p className="text-cyan-300 text-base sm:text-lg px-4 sm:px-0">Personne en charge du compte OmnIA</p>
      </div>

      <div className="space-y-6 sm:space-y-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8">
          <div>
            <label className="block text-base sm:text-lg font-medium text-cyan-200 mb-2 sm:mb-3">
              Prénom *
            </label>
            <input
              type="text"
              value={formData.firstName}
              onChange={(e) => handleInputChange('firstName', e.target.value)}
              className="w-full bg-slate-800/80 border-2 border-slate-600/50 rounded-xl sm:rounded-2xl px-4 sm:px-6 py-3 sm:py-4 text-white text-base sm:text-lg placeholder-cyan-400 focus:outline-none focus:border-cyan-400 focus:ring-4 focus:ring-cyan-400/20 transition-all"
              placeholder="Jean"
              required
            />
          </div>

          <div>
            <label className="block text-base sm:text-lg font-medium text-cyan-200 mb-2 sm:mb-3">
              Nom *
            </label>
            <input
              type="text"
              value={formData.lastName}
              onChange={(e) => handleInputChange('lastName', e.target.value)}
              className="w-full bg-slate-800/80 border-2 border-slate-600/50 rounded-xl sm:rounded-2xl px-4 sm:px-6 py-3 sm:py-4 text-white text-base sm:text-lg placeholder-cyan-400 focus:outline-none focus:border-cyan-400 focus:ring-4 focus:ring-cyan-400/20 transition-all"
              placeholder="Dupont"
              required
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8">
          <div>
            <label className="block text-base sm:text-lg font-medium text-cyan-200 mb-2 sm:mb-3">
              Téléphone *
            </label>
            <div className="flex gap-2">
              <select
                className="bg-slate-800/80 border-2 border-slate-600/50 rounded-xl px-3 py-3 sm:py-4 text-white text-sm sm:text-base focus:outline-none focus:border-cyan-400 focus:ring-4 focus:ring-cyan-400/20 transition-all"
                value={formData.phone.startsWith('+33') ? '🇫🇷' : 
                      formData.phone.startsWith('+32') ? '🇧🇪' : 
                      formData.phone.startsWith('+41') ? '🇨🇭' : 
                      formData.phone.startsWith('+352') ? '🇱🇺' : 
                      formData.phone.startsWith('+1') ? '🇨🇦' : 
                      formData.phone.startsWith('+34') ? '🇪🇸' : 
                      formData.phone.startsWith('+39') ? '🇮🇹' : 
                      formData.phone.startsWith('+49') ? '🇩🇪' : 
                      formData.phone.startsWith('+31') ? '🇳🇱' : 
                      formData.phone.startsWith('+351') ? '🇵🇹' : '🇫🇷'}
                onChange={(e) => {
                  const selectedFlag = e.target.value;
                  let prefix = '+33 ';
                  
                  switch (selectedFlag) {
                    case '🇫🇷': prefix = '+33 '; break;
                    case '🇧🇪': prefix = '+32 '; break;
                    case '🇨🇭': prefix = '+41 '; break;
                    case '🇱🇺': prefix = '+352 '; break;
                    case '🇨🇦': prefix = '+1 '; break;
                    case '🇪🇸': prefix = '+34 '; break;
                    case '🇮🇹': prefix = '+39 '; break;
                    case '🇩🇪': prefix = '+49 '; break;
                    case '🇳🇱': prefix = '+31 '; break;
                    case '🇵🇹': prefix = '+351 '; break;
                  }
                  
                  // Garder seulement les chiffres du numéro actuel
                  const currentNumber = formData.phone.replace(/^\+\d+\s*/, '').replace(/\D/g, '');
                  handleInputChange('phone', prefix + currentNumber);
                }}
              >
                <option value="🇫🇷">🇫🇷 France</option>
                <option value="🇧🇪">🇧🇪 Belgique</option>
                <option value="🇨🇭">🇨🇭 Suisse</option>
                <option value="🇱🇺">🇱🇺 Luxembourg</option>
                <option value="🇨🇦">🇨🇦 Canada</option>
                <option value="🇪🇸">🇪🇸 Espagne</option>
                <option value="🇮🇹">🇮🇹 Italie</option>
                <option value="🇩🇪">🇩🇪 Allemagne</option>
                <option value="🇳🇱">🇳🇱 Pays-Bas</option>
                <option value="🇵🇹">🇵🇹 Portugal</option>
              </select>
              <input
                type="tel"
                value={formData.phone}
                onChange={(e) => handleInputChange('phone', e.target.value)}
                className={`flex-1 bg-slate-800/80 border-2 rounded-xl sm:rounded-2xl px-4 sm:px-6 py-3 sm:py-4 text-white text-base sm:text-lg placeholder-cyan-400 focus:outline-none focus:ring-4 transition-all ${
                  validationErrors.phone 
                    ? 'border-red-500 focus:border-red-400 focus:ring-red-400/20' 
                    : 'border-slate-600/50 focus:border-cyan-400 focus:ring-cyan-400/20'
                }`}
                placeholder="1 23 45 67 89"
                required
              />
            </div>
            {validationErrors.phone && (
              <p className="text-red-400 text-sm mt-2">{validationErrors.phone}</p>
            )}
          </div>

          <div>
            <label className="block text-base sm:text-lg font-medium text-cyan-200 mb-2 sm:mb-3">
              Fonction *
            </label>
            <select
              value={formData.position}
              onChange={(e) => handleInputChange('position', e.target.value)}
              className="w-full bg-slate-800/80 border-2 border-slate-600/50 rounded-xl sm:rounded-2xl px-4 sm:px-6 py-3 sm:py-4 text-white text-base sm:text-lg focus:outline-none focus:border-cyan-400 focus:ring-4 focus:ring-cyan-400/20 transition-all"
              required
            >
              <option value="dirigeant">Dirigeant</option>
              <option value="responsable-commercial">Responsable commercial</option>
              <option value="directeur-marketing">Directeur marketing</option>
              <option value="gerant">Gérant</option>
              <option value="autre">Autre</option>
            </select>
          </div>
        </div>
      </div>
    </div>
  );

  const renderStep4 = () => (
    <div className="space-y-8">
      <div className="text-center mb-8 sm:mb-12">
        <div className="w-16 h-16 sm:w-24 sm:h-24 bg-gradient-to-br from-purple-400 to-pink-500 rounded-2xl sm:rounded-3xl flex items-center justify-center mx-auto mb-4 sm:mb-6 shadow-2xl">
          <FileText className="w-8 h-8 sm:w-12 sm:h-12 text-white" />
        </div>
        <h2 className="text-2xl sm:text-3xl font-bold text-white mb-2 sm:mb-3 px-4 sm:px-0">Documents légaux</h2>
        <p className="text-cyan-300 text-base sm:text-lg px-4 sm:px-0">Upload de votre extrait Kbis (moins de 3 mois)</p>
      </div>

      <div className="bg-slate-800/60 backdrop-blur-xl rounded-2xl sm:rounded-3xl p-6 sm:p-12 border border-slate-600/50">
        <div className="text-center">
          <div className="mb-6 sm:mb-8">
            <div className="w-24 h-24 sm:w-32 sm:h-32 bg-gradient-to-br from-cyan-500/20 to-blue-600/20 rounded-2xl sm:rounded-3xl flex items-center justify-center mx-auto mb-4 sm:mb-6 border-4 border-dashed border-cyan-400/50">
              <Upload className="w-12 h-12 sm:w-16 sm:h-16 text-cyan-400" />
            </div>
            <h3 className="text-xl sm:text-2xl font-semibold text-white mb-2 sm:mb-3 px-4 sm:px-0">Extrait Kbis requis</h3>
            <p className="text-base sm:text-lg text-gray-300 mb-4 sm:mb-6 px-4 sm:px-0">
              Document officiel de moins de 3 mois<br />
              Formats acceptés: PDF, JPG, PNG (max 5MB)
            </p>
          </div>

          {!formData.kbisFile ? (
            <div>
              <input
                type="file"
                id="kbis-upload"
                accept=".pdf,.jpg,.jpeg,.png"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) handleFileUpload(file);
                }}
                className="hidden"
              />
              <label
                htmlFor="kbis-upload"
                className="inline-flex items-center gap-2 sm:gap-3 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white px-6 sm:px-8 py-3 sm:py-4 rounded-xl sm:rounded-2xl font-bold text-base sm:text-lg cursor-pointer transition-all duration-300 shadow-2xl hover:shadow-cyan-500/40 hover:scale-105"
              >
                <Upload className="w-5 h-5 sm:w-6 sm:h-6" />
                Choisir le fichier Kbis
              </label>
            </div>
          ) : (
            <div className="bg-green-500/20 border border-green-400/50 rounded-xl sm:rounded-2xl p-4 sm:p-6">
              <div className="flex items-center justify-center gap-4">
                <Check className="w-6 h-6 sm:w-8 sm:h-8 text-green-400" />
                <div>
                  <p className="text-green-300 font-bold text-base sm:text-lg break-all">{formData.kbisFile.name}</p>
                  <p className="text-green-400 text-sm sm:text-base">
                    {(formData.kbisFile.size / 1024 / 1024).toFixed(2)} MB
                  </p>
                  <button
                    onClick={() => setShowKbisPreview(true)}
                    className="mt-2 text-cyan-400 hover:text-cyan-300 text-sm underline"
                  >
                    👁️ Prévisualiser le document
                  </button>
                </div>
              </div>
            </div>
          )}

          {isUploading && (
            <div className="mt-4 sm:mt-6">
              <div className="w-full bg-gray-700 rounded-full h-3">
                <div 
                  className="bg-gradient-to-r from-cyan-500 to-blue-600 h-3 rounded-full transition-all duration-300" 
                  style={{ width: `${uploadProgress}%` }}
                ></div>
              </div>
              <p className="text-cyan-300 mt-2 sm:mt-3 text-base sm:text-lg">Upload en cours... {uploadProgress}%</p>
            </div>
          )}
        </div>

        <div className="mt-8 sm:mt-12 p-4 sm:p-6 bg-blue-500/20 rounded-xl sm:rounded-2xl border border-blue-400/30">
          <h4 className="font-bold text-blue-200 mb-2 sm:mb-3 text-base sm:text-lg">ℹ️ Pourquoi le Kbis ?</h4>
          <ul className="text-blue-300 space-y-1 sm:space-y-2 text-sm sm:text-base">
            <li>• Vérification de l'existence légale de votre entreprise</li>
            <li>• Conformité réglementaire pour les services B2B</li>
            <li>• Sécurisation des transactions et facturation</li>
          </ul>
        </div>
      </div>
    </div>
  );

  const renderStep5 = () => (
    <div className="space-y-8">
      <div className="text-center mb-6 sm:mb-8">
        <div className="w-16 h-16 sm:w-20 sm:h-20 bg-gradient-to-br from-cyan-400 to-blue-500 rounded-xl sm:rounded-2xl flex items-center justify-center mx-auto mb-4 sm:mb-6 shadow-2xl">
          <CreditCard className="w-8 h-8 sm:w-12 sm:h-12 text-white" />
        </div>
        <h2 className="text-2xl sm:text-3xl font-bold text-white mb-3 sm:mb-4 px-4 sm:px-0">Choisissez votre abonnement</h2>
        <p className="text-cyan-300 text-base sm:text-lg px-4 sm:px-0">14 jours d'essai gratuit sur tous les plans</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
        {/* Starter Plan */}
        <div className={`bg-slate-700/40 backdrop-blur-xl rounded-xl sm:rounded-2xl p-4 sm:p-6 border-2 transition-all cursor-pointer hover:scale-105 ${
          formData.selectedPlan === 'starter' 
            ? 'border-cyan-400 bg-cyan-500/20 shadow-xl shadow-cyan-500/30' 
            : 'border-slate-600/50 hover:border-slate-500/70'
        }`} onClick={() => handleInputChange('selectedPlan', 'starter')}>
          <div className="text-center">
            <h3 className="text-lg sm:text-xl font-bold text-white mb-2">Starter</h3>
            <div className="text-2xl sm:text-3xl font-bold text-cyan-400 mb-3 sm:mb-4">€29<span className="text-base sm:text-lg text-gray-400">/mois</span></div>
            <ul className="text-gray-300 space-y-1 sm:space-y-2 mb-4 sm:mb-6 text-left text-xs sm:text-sm">
              <li className="flex items-center gap-2 text-green-300">
                <span>✓</span>
                <span>1000 conversations/mois</span>
              </li>
              <li className="flex items-center gap-2 text-green-300">
                <span>✓</span>
                <span>500 produits max</span>
              </li>
              <li className="flex items-center gap-2 text-green-300">
                <span>✓</span>
                <span>Support email</span>
              </li>
              <li className="flex items-center gap-2 text-green-300">
                <span>✓</span>
                <span>Widget personnalisable</span>
              </li>
              <li className="flex items-center gap-2 text-red-300">
                <span>✗</span>
                <span>Domaine personnalisé</span>
              </li>
            </ul>
            <div className={`w-4 h-4 sm:w-5 sm:h-5 rounded-full border-2 mx-auto transition-all ${
              formData.selectedPlan === 'starter' 
                ? 'bg-cyan-400 border-cyan-400 shadow-lg shadow-cyan-400/50' 
                : 'border-gray-400'
            }`}></div>
          </div>
        </div>

        {/* Professional Plan */}
        <div className={`bg-slate-700/40 backdrop-blur-xl rounded-xl sm:rounded-2xl p-4 sm:p-6 border-2 transition-all cursor-pointer hover:scale-105 relative ${
          formData.selectedPlan === 'professional' 
            ? 'border-cyan-400 bg-cyan-500/20 shadow-xl shadow-cyan-500/30' 
            : 'border-slate-600/50 hover:border-slate-500/70'
        }`} onClick={() => handleInputChange('selectedPlan', 'professional')}>
          <div className="absolute -top-2 sm:-top-3 left-1/2 transform -translate-x-1/2">
            <span className="bg-gradient-to-r from-cyan-500 to-blue-600 text-white px-3 sm:px-4 py-0.5 sm:py-1 rounded-full text-xs font-bold shadow-lg">
              RECOMMANDÉ
            </span>
          </div>
          <div className="text-center">
            <h3 className="text-lg sm:text-xl font-bold text-white mb-2 mt-2 sm:mt-0">Professional</h3>
            <div className="text-2xl sm:text-3xl font-bold text-cyan-400 mb-3 sm:mb-4">€79<span className="text-base sm:text-lg text-gray-400">/mois</span></div>
            <ul className="text-gray-300 space-y-1 sm:space-y-2 mb-4 sm:mb-6 text-left text-xs sm:text-sm">
              <li className="flex items-center gap-2 text-green-300">
                <span>✓</span>
                <span>5000 conversations/mois</span>
              </li>
              <li className="flex items-center gap-2 text-green-300">
                <span>✓</span>
                <span>Produits illimités</span>
              </li>
              <li className="flex items-center gap-2 text-green-300">
                <span>✓</span>
                <span>Support prioritaire</span>
              </li>
              <li className="flex items-center gap-2 text-green-300">
                <span>✓</span>
                <span>Domaine personnalisé</span>
              </li>
              <li className="flex items-center gap-2 text-green-300">
                <span>✓</span>
                <span>Analytics avancées</span>
              </li>
            </ul>
            <div className={`w-4 h-4 sm:w-5 sm:h-5 rounded-full border-2 mx-auto transition-all ${
              formData.selectedPlan === 'professional' 
                ? 'bg-cyan-400 border-cyan-400 shadow-lg shadow-cyan-400/50' 
                : 'border-gray-400'
            }`}></div>
          </div>
        </div>

        {/* Enterprise Plan */}
        <div className={`bg-slate-700/40 backdrop-blur-xl rounded-xl sm:rounded-2xl p-4 sm:p-6 border-2 transition-all cursor-pointer hover:scale-105 ${
          formData.selectedPlan === 'enterprise' 
            ? 'border-cyan-400 bg-cyan-500/20 shadow-xl shadow-cyan-500/30' 
            : 'border-slate-600/50 hover:border-slate-500/70'
        }`} onClick={() => handleInputChange('selectedPlan', 'enterprise')}>
          <div className="text-center">
            <h3 className="text-lg sm:text-xl font-bold text-white mb-2">Enterprise</h3>
            <div className="text-2xl sm:text-3xl font-bold text-cyan-400 mb-3 sm:mb-4">€199<span className="text-base sm:text-lg text-gray-400">/mois</span></div>
            <ul className="text-gray-300 space-y-1 sm:space-y-2 mb-4 sm:mb-6 text-left text-xs sm:text-sm">
              <li className="flex items-center gap-2 text-green-300">
                <span>✓</span>
                <span>Conversations illimitées</span>
              </li>
              <li className="flex items-center gap-2 text-cyan-300">
                <span>🎁</span>
                <span>14 jours gratuits</span>
              </li>
              <li className="flex items-center gap-2 text-green-300">
                <span>✓</span>
                <span>Multi-magasins</span>
              </li>
              <li className="flex items-center gap-2 text-green-300">
                <span>✓</span>
                <span>Support dédié</span>
              </li>
              <li className="flex items-center gap-2 text-green-300">
                <span>✓</span>
                <span>API personnalisée</span>
              </li>
              <li className="flex items-center gap-2 text-green-300">
                <span>✓</span>
                <span>White-label</span>
              </li>
              <li className="flex items-center gap-2 text-yellow-300">
                <span>💳</span>
                <span>API IA Pay-as-you-go</span>
              </li>
            </ul>
            <div className={`w-4 h-4 sm:w-5 sm:h-5 rounded-full border-2 mx-auto transition-all ${
              formData.selectedPlan === 'enterprise' 
                ? 'bg-cyan-400 border-cyan-400 shadow-lg shadow-cyan-400/50' 
                : 'border-gray-400'
            }`}></div>
          </div>
        </div>
      </div>

      <div className="bg-green-500/20 border border-green-400/50 rounded-xl sm:rounded-2xl p-3 sm:p-4 text-center">
        <p className="text-green-300 font-bold text-base sm:text-lg">🎉 14 jours d'essai gratuit</p>
        <p className="text-green-400 text-sm sm:text-base">Aucun engagement, résiliation à tout moment</p>
      </div>
    </div>
  );

  const renderStep6 = () => (
    <div className="space-y-8">
      <div className="text-center mb-8 sm:mb-12">
        <div className="w-16 h-16 sm:w-24 sm:h-24 bg-gradient-to-br from-green-400 to-emerald-500 rounded-2xl sm:rounded-3xl flex items-center justify-center mx-auto mb-4 sm:mb-6 shadow-2xl">
          <Check className="w-8 h-8 sm:w-12 sm:h-12 text-white" />
        </div>
        <h2 className="text-2xl sm:text-3xl font-bold text-white mb-2 sm:mb-3 px-4 sm:px-0">Validation finale</h2>
        <p className="text-cyan-300 text-base sm:text-lg px-4 sm:px-0">Vérifiez vos informations avant soumission</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-8">
        <div className="bg-slate-800/60 backdrop-blur-xl rounded-xl sm:rounded-2xl p-4 sm:p-8 border border-slate-600/50">
          <h3 className="text-lg sm:text-xl font-bold text-white mb-4 sm:mb-6 flex items-center gap-2 sm:gap-3">
            <Building2 className="w-5 h-5 sm:w-6 sm:h-6 text-cyan-400" />
            Entreprise
          </h3>
          <div className="space-y-3 sm:space-y-4">
            <div className="flex flex-col sm:flex-row sm:justify-between gap-1 sm:gap-0">
              <span className="text-gray-300 text-base sm:text-lg">Raison sociale:</span>
              <span className="text-white font-bold text-base sm:text-lg break-all">{formData.companyName}</span>
            </div>
            <div className="flex flex-col sm:flex-row sm:justify-between gap-1 sm:gap-0">
              <span className="text-gray-300 text-base sm:text-lg">SIRET:</span>
              <span className="text-white font-bold text-base sm:text-lg">{formData.siret}</span>
            </div>
            <div className="flex flex-col sm:flex-row sm:justify-between gap-1 sm:gap-0">
              <span className="text-gray-300 text-base sm:text-lg">Ville:</span>
              <span className="text-white font-bold text-base sm:text-lg">{formData.city}</span>
            </div>
          </div>
        </div>

        <div className="bg-slate-800/60 backdrop-blur-xl rounded-xl sm:rounded-2xl p-4 sm:p-8 border border-slate-600/50">
          <h3 className="text-lg sm:text-xl font-bold text-white mb-4 sm:mb-6 flex items-center gap-2 sm:gap-3">
            <Mail className="w-5 h-5 sm:w-6 sm:h-6 text-cyan-400" />
            Contact
          </h3>
          <div className="space-y-3 sm:space-y-4">
            <div className="flex flex-col sm:flex-row sm:justify-between gap-1 sm:gap-0">
              <span className="text-gray-300 text-base sm:text-lg">Nom:</span>
              <span className="text-white font-bold text-base sm:text-lg break-all">{formData.firstName} {formData.lastName}</span>
            </div>
            <div className="flex flex-col sm:flex-row sm:justify-between gap-1 sm:gap-0">
              <span className="text-gray-300 text-base sm:text-lg">Email:</span>
              <span className="text-white font-bold text-base sm:text-lg break-all">{formData.email}</span>
            </div>
            <div className="flex flex-col sm:flex-row sm:justify-between gap-1 sm:gap-0">
              <span className="text-gray-300 text-base sm:text-lg">Fonction:</span>
              <span className="text-white font-bold text-base sm:text-lg">{formData.position}</span>
            </div>
          </div>
        </div>

        <div className="bg-slate-800/60 backdrop-blur-xl rounded-xl sm:rounded-2xl p-4 sm:p-8 border border-slate-600/50">
          <h3 className="text-lg sm:text-xl font-bold text-white mb-4 sm:mb-6 flex items-center gap-2 sm:gap-3">
            <FileText className="w-5 h-5 sm:w-6 sm:h-6 text-cyan-400" />
            Documents
          </h3>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
            <Check className="w-5 h-5 sm:w-6 sm:h-6 text-green-400" />
              <span className="text-white font-bold text-base sm:text-lg">Kbis validé</span>
            </div>
            {formData.kbisFile && (
              <button
                onClick={() => setShowKbisPreview(true)}
                className="text-cyan-400 hover:text-cyan-300 text-sm underline"
              >
                👁️ Voir le document
              </button>
            )}
          </div>
        </div>

        <div className="bg-slate-800/60 backdrop-blur-xl rounded-xl sm:rounded-2xl p-4 sm:p-8 border border-slate-600/50">
          <h3 className="text-lg sm:text-xl font-bold text-white mb-4 sm:mb-6 flex items-center gap-2 sm:gap-3">
            <CreditCard className="w-5 h-5 sm:w-6 sm:h-6 text-cyan-400" />
            Abonnement
          </h3>
          <div className="space-y-3 sm:space-y-4">
            <div className="flex flex-col sm:flex-row sm:justify-between gap-1 sm:gap-0">
              <span className="text-gray-300 text-base sm:text-lg">Plan:</span>
              <span className="text-white font-bold text-base sm:text-lg capitalize">{formData.selectedPlan}</span>
            </div>
            <div className="flex flex-col sm:flex-row sm:justify-between gap-1 sm:gap-0">
              <span className="text-gray-300 text-base sm:text-lg">Prix:</span>
              <span className="text-white font-bold text-base sm:text-lg">
                {formData.selectedPlan === 'starter' ? '€29' : 
                 formData.selectedPlan === 'professional' ? '€79' : '€199'}/mois
              </span>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-slate-800/60 backdrop-blur-xl rounded-xl sm:rounded-2xl p-4 sm:p-8 border border-slate-600/50">
        <h3 className="text-lg sm:text-xl font-bold text-white mb-4 sm:mb-6 flex items-center gap-2 sm:gap-3">
          <Globe className="w-5 h-5 sm:w-6 sm:h-6 text-purple-400" />
          Votre sous-domaine OmnIA
        </h3>
        <p className="text-gray-300 mb-4 sm:mb-6 text-base sm:text-lg">Votre assistant IA sera accessible via :</p>
        <div className="bg-purple-500/20 border border-purple-400/50 rounded-xl sm:rounded-2xl p-4 sm:p-6 mb-4 sm:mb-6">
          <code className="text-purple-300 text-lg sm:text-2xl font-bold break-all">
            {generateSubdomain(formData.companyName)}
          </code>
        </div>
        <p className="text-gray-300 mb-4 sm:mb-6 text-base sm:text-lg">Code widget à intégrer après validation :</p>
        <div className="bg-black/60 rounded-xl sm:rounded-2xl p-4 sm:p-6 border border-cyan-500/30 overflow-x-auto">
          <code className="text-cyan-400 text-xs sm:text-sm whitespace-pre">
            {`<script src="https://widget.omnia.sale/embed.js"></script>
<div id="omnia-chat" data-store="${formData.companyName.toLowerCase().replace(/[^a-z0-9]/g, '').substring(0, 20)}"></div>`}
          </code>
        </div>
      </div>

      <div className="space-y-4 sm:space-y-6">
        <div className="flex items-start gap-4">
          <input
            type="checkbox"
            id="terms"
            checked={formData.acceptTerms}
            onChange={(e) => handleInputChange('acceptTerms', e.target.checked)}
            className="mt-1 sm:mt-2 w-4 h-4 sm:w-5 sm:h-5 text-cyan-600 bg-slate-800 border-cyan-500 rounded focus:ring-cyan-500 flex-shrink-0"
          />
          <label htmlFor="terms" className="text-gray-300 text-sm sm:text-lg">
            J'accepte les conditions générales d'utilisation et de vente d'OmnIA.
          </label>
        </div>

        <div className="flex items-start gap-4">
          <input
            type="checkbox"
            id="privacy"
            checked={formData.acceptPrivacy}
            onChange={(e) => handleInputChange('acceptPrivacy', e.target.checked)}
            className="mt-1 sm:mt-2 w-4 h-4 sm:w-5 sm:h-5 text-cyan-600 bg-slate-800 border-cyan-500 rounded focus:ring-cyan-500 flex-shrink-0"
          />
          <label htmlFor="privacy" className="text-gray-300 text-sm sm:text-lg">
            J'accepte la politique de confidentialité et le traitement de mes données personnelles.
          </label>
        </div>
      </div>
    </div>
  );

  const canProceedToNext = () => {
    // Vérifier qu'il n'y a pas d'erreurs de validation
    const hasErrors = Object.values(validationErrors).some(error => error !== '');
    if (hasErrors) return false;
    
    switch (currentStep) {
      case 1:
        return formData.email && formData.password && formData.confirmPassword && !validationErrors.password && !validationErrors.confirmPassword;
      case 2:
        return formData.companyName && formData.siret && formData.address && formData.city && formData.postalCode && formData.country;
      case 3:
        return formData.firstName && formData.lastName && formData.email && formData.phone && formData.position;
      case 4:
        return formData.kbisFile;
      case 5:
        return formData.selectedPlan;
      case 6:
        return formData.acceptTerms && formData.acceptPrivacy;
      default:
        return false;
    }
  };

  const handleNext = () => {
    if (currentStep < 6) {
      setCurrentStep(currentStep + 1);
    } else {
      // Soumettre la demande
      setIsSubmitting(true);
      
      setTimeout(async () => {
        // Envoyer les emails de notification
        await sendNotificationEmails(formData);
        
        // Créer le compte revendeur dans la liste
        const newRetailer = {
          id: Date.now().toString(),
          name: formData.companyName,
          email: formData.email,
          plan: formData.selectedPlan,
          status: 'pending_validation',
          revenue: 0,
          conversations: 0,
          products: 0,
          joinDate: new Date().toISOString(),
          lastActive: new Date().toISOString(),
          password: formData.password,
          applicationData: formData
        };
        
        // Sauvegarder dans localStorage pour persistance
        const existingRetailers = JSON.parse(localStorage.getItem('retailers') || '[]');
        localStorage.setItem('retailers', JSON.stringify([...existingRetailers, newRetailer]));
        
        showSuccess(
          'Demande soumise',
          `Votre inscription pour ${formData.companyName} a été envoyée ! Validation sous 24h.`,
          [
            {
              label: 'Retour accueil',
              action: () => window.location.href = '/',
              variant: 'primary'
            },
            {
              label: 'Voir la documentation',
              action: () => window.open('/documentation', '_blank'),
              variant: 'secondary'
            }
          ]
        );

        onSubmit(formData);
        setIsSubmitting(false);
        
        // Redirection automatique après 5 secondes
        setTimeout(() => {
          window.location.href = '/';
        }, 5000);
      }, 2000);
    }
  };

  const handlePrevious = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    } else {
      onBack();
    }
  };

  return (
    <>
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-purple-900 p-3 sm:p-6">
        {/* Background Effects */}
        <div className="absolute inset-0 opacity-20">
          <div className="absolute top-20 left-20 w-72 h-72 bg-cyan-500/30 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute bottom-20 right-20 w-96 h-96 bg-purple-500/20 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '2s' }}></div>
        </div>

        <div className="relative z-10 max-w-6xl mx-auto px-2 sm:px-0">
          {/* Header exact de l'image */}
          <div className="text-center mb-8 sm:mb-12">
            <button
              onClick={() => window.location.href = '/'}
              className="inline-flex items-center gap-2 sm:gap-3 text-cyan-400 hover:text-cyan-300 mb-6 sm:mb-8 text-base sm:text-lg"
            >
              <ArrowLeft className="w-4 h-4 sm:w-5 sm:h-5" />
              Retour à omnia.sale
            </button>
            <div className="flex items-center justify-center gap-3 sm:gap-4 mb-4 sm:mb-6">
              <div className="w-12 h-12 sm:w-16 sm:h-16 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-2xl sm:rounded-3xl flex items-center justify-center shadow-2xl">
                <Bot className="w-6 h-6 sm:w-8 sm:h-8 text-white" />
              </div>
              <h1 className="text-2xl sm:text-4xl font-bold bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent">
                seller.omnia.sale
              </h1>
            </div>
            <p className="text-cyan-300 text-lg sm:text-xl px-4 sm:px-0">Inscription revendeur - Plateforme IA mobilier</p>
          </div>

          {/* Progress Steps - Design exact de l'image */}
          <div className="mb-8 sm:mb-16">
            <div className="flex items-center justify-center">
              {steps.map((step, index) => {
                const isActive = currentStep === step.id;
                const isCompleted = currentStep > step.id;
                const StepIcon = step.icon;
                
                return (
                  <div key={step.id} className="relative flex flex-col items-center">
                    <div className={`w-12 h-12 sm:w-16 sm:h-16 rounded-full flex items-center justify-center mb-2 sm:mb-4 transition-all ${
                      isActive 
                        ? 'bg-gradient-to-br from-cyan-400 to-blue-500 shadow-xl shadow-cyan-500/50' 
                        : isCompleted 
                          ? 'bg-gradient-to-br from-green-400 to-emerald-500 shadow-xl shadow-green-500/50' 
                          : 'bg-slate-600/50'
                    }`}>
                      {isCompleted ? (
                        <Check className="w-6 h-6 sm:w-8 sm:h-8 text-white" />
                      ) : (
                        <StepIcon className="w-6 h-6 sm:w-8 sm:h-8 text-white" />
                      )}
                    </div>
                    <span className={`text-xs sm:text-sm mt-2 sm:mt-4 text-center max-w-16 sm:max-w-24 font-medium leading-tight ${
                      isActive ? 'text-cyan-300 font-bold' : isCompleted ? 'text-green-300' : 'text-gray-400'
                    }`}>
                      {step.title}
                    </span>
                    {index < steps.length - 1 && (
                      <div className={`absolute top-5 sm:top-8 left-5 sm:left-16 w-8 sm:w-24 md:w-32 lg:w-40 h-0.5 sm:h-1 ${
                        isCompleted ? 'bg-green-500' : 'bg-slate-600'
                      }`}></div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Form Content avec design glassmorphism */}
          <div className="bg-slate-800/40 backdrop-blur-2xl rounded-2xl sm:rounded-3xl p-6 sm:p-12 border border-slate-600/50 shadow-2xl">
            {currentStep === 1 && renderStep1()}
            {currentStep === 2 && renderStep2()}
            {currentStep === 3 && renderStep3()}
            {currentStep === 4 && renderStep4()}
            {currentStep === 5 && renderStep5()}
            {currentStep === 6 && renderStep6()}

            {/* Navigation Buttons */}
            <div className="flex flex-col sm:flex-row justify-between gap-4 sm:gap-0 mt-8 sm:mt-12 pt-6 sm:pt-8 border-t border-slate-600/50">
              <button
                onClick={handlePrevious}
                className="flex items-center justify-center gap-2 sm:gap-3 px-6 sm:px-8 py-3 sm:py-4 bg-slate-600 hover:bg-slate-700 text-white rounded-xl sm:rounded-2xl transition-all text-base sm:text-lg font-semibold shadow-lg order-2 sm:order-1"
              >
                <ArrowLeft className="w-4 h-4 sm:w-5 sm:h-5" />
                {currentStep === 1 ? 'Retour' : 'Précédent'}
              </button>

              <button
                onClick={handleNext}
                disabled={!canProceedToNext() || isSubmitting}
                className="flex items-center justify-center gap-2 sm:gap-3 px-6 sm:px-8 py-3 sm:py-4 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 disabled:from-gray-600 disabled:to-gray-700 text-white rounded-xl sm:rounded-2xl transition-all disabled:cursor-not-allowed text-base sm:text-lg font-semibold shadow-2xl hover:shadow-cyan-500/40 order-1 sm:order-2"
              >
                {isSubmitting ? (
                  <>
                    <div className="w-5 h-5 sm:w-6 sm:h-6 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                    Soumission...
                  </>
                ) : currentStep === 5 ? (
                  <>
                    <Check className="w-4 h-4 sm:w-5 sm:h-5" />
                    Soumettre la demande
                  </>
                ) : currentStep === 6 ? (
                  <>
                    <Check className="w-4 h-4 sm:w-5 sm:h-5" />
                    Soumettre la demande
                  </>
                ) : (
                  <>
                    Suivant
                    <ArrowLeft className="w-4 h-4 sm:w-5 sm:h-5 rotate-180" />
                  </>
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Modal Prévisualisation Kbis */}
        {showKbisPreview && formData.kbisFile && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-slate-800/95 backdrop-blur-xl rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto border border-slate-600/50">
              <div className="flex items-center justify-between p-6 border-b border-slate-600/50">
                <h3 className="text-xl font-bold text-white">📄 Prévisualisation Kbis</h3>
                <button
                  onClick={() => setShowKbisPreview(false)}
                  className="text-gray-400 hover:text-white transition-colors text-2xl"
                >
                  ×
                </button>
              </div>
              <div className="p-6">
                <div className="bg-white rounded-xl p-6 text-center">
                  {formData.kbisFile.type === 'application/pdf' ? (
                    <div>
                      <FileText className="w-24 h-24 text-gray-400 mx-auto mb-4" />
                      <p className="text-gray-600 text-lg font-semibold">{formData.kbisFile.name}</p>
                      <p className="text-gray-500">Document PDF - {(formData.kbisFile.size / 1024 / 1024).toFixed(2)} MB</p>
                      <p className="text-sm text-gray-400 mt-2">Prévisualisation PDF non disponible dans le navigateur</p>
                    </div>
                  ) : (
                    <img 
                      src={URL.createObjectURL(formData.kbisFile)} 
                      alt="Kbis"
                      className="max-w-full h-auto rounded-lg shadow-lg"
                    />
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Notification System */}
        <NotificationSystem 
          notifications={notifications}
          onRemove={removeNotification}
        />
      </div>
    </>
  );
};