import React, { useState } from 'react';
import { Building, User, Mail, Phone, MapPin, CreditCard, FileText, CheckCircle, ArrowLeft } from 'lucide-react';
import { Logo } from '../components/Logo';

export const SellerRegistration: React.FC = () => {
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState({
    companyName: '',
    email: '',
    firstName: '',
    lastName: '',
    phone: '',
    address: '',
    city: '',
    postalCode: '',
    siret: '',
    position: '',
    selectedPlan: 'professional',
    proposedSubdomain: '',
    password: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const plans = [
    {
      id: 'starter',
      name: 'Starter',
      price: '29€/mois',
      features: ['1000 conversations/mois', '500 produits max', 'Support email']
    },
    {
      id: 'professional',
      name: 'Professional',
      price: '79€/mois',
      features: ['5000 conversations/mois', 'Produits illimités', 'Support prioritaire'],
      popular: true
    },
    {
      id: 'enterprise',
      name: 'Enterprise',
      price: '199€/mois',
      features: ['Conversations illimitées', 'Multi-magasins', 'Support dédié']
    }
  ];

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    // Simulate form submission
    setTimeout(() => {
      setIsSubmitted(true);
      setIsSubmitting(false);
    }, 2000);
  };

  if (isSubmitted) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-purple-900 flex items-center justify-center p-4">
        <div className="bg-white/10 backdrop-blur-xl rounded-2xl p-8 border border-white/20 text-center max-w-md">
          <CheckCircle className="w-16 h-16 text-green-400 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-white mb-4">Demande envoyée !</h2>
          <p className="text-gray-300 mb-6">
            Votre demande d'inscription a été envoyée. Notre équipe vous contactera sous 24h.
          </p>
          <button
            onClick={() => window.location.href = '/'}
            className="bg-gradient-to-r from-cyan-500 to-blue-600 text-white px-6 py-3 rounded-xl font-semibold"
          >
            Retour à l'accueil
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-purple-900">
      {/* Header */}
      <header className="bg-black/20 backdrop-blur-xl border-b border-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <Logo size="md" />
            <a href="/" className="flex items-center gap-2 text-cyan-400 hover:text-cyan-300 transition-colors">
              <ArrowLeft className="w-4 h-4" />
              Retour à l'accueil
            </a>
          </div>
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Hero */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-white mb-4">
            Devenir Revendeur
            <span className="block bg-gradient-to-r from-cyan-400 via-blue-400 to-purple-400 bg-clip-text text-transparent">
              OmnIA.sale
            </span>
          </h1>
          <p className="text-xl text-gray-300">
            Rejoignez les 500+ revendeurs qui transforment leur business avec l'IA
          </p>
        </div>

        {/* Form */}
        <div className="bg-white/10 backdrop-blur-xl rounded-2xl p-8 border border-white/20">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Company Info */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-cyan-200 mb-2">
                  Nom de l'entreprise *
                </label>
                <input
                  type="text"
                  value={formData.companyName}
                  onChange={(e) => handleInputChange('companyName', e.target.value)}
                  className="w-full bg-black/40 border border-cyan-500/50 rounded-xl px-4 py-3 text-white placeholder-cyan-400 focus:outline-none focus:border-cyan-400"
                  placeholder="Mon Magasin de Meubles"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-cyan-200 mb-2">
                  SIRET *
                </label>
                <input
                  type="text"
                  value={formData.siret}
                  onChange={(e) => handleInputChange('siret', e.target.value)}
                  className="w-full bg-black/40 border border-cyan-500/50 rounded-xl px-4 py-3 text-white placeholder-cyan-400 focus:outline-none focus:border-cyan-400"
                  placeholder="12345678901234"
                  required
                />
              </div>
            </div>

            {/* Contact Info */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-cyan-200 mb-2">
                  Prénom *
                </label>
                <input
                  type="text"
                  value={formData.firstName}
                  onChange={(e) => handleInputChange('firstName', e.target.value)}
                  className="w-full bg-black/40 border border-cyan-500/50 rounded-xl px-4 py-3 text-white placeholder-cyan-400 focus:outline-none focus:border-cyan-400"
                  placeholder="Jean"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-cyan-200 mb-2">
                  Nom *
                </label>
                <input
                  type="text"
                  value={formData.lastName}
                  onChange={(e) => handleInputChange('lastName', e.target.value)}
                  className="w-full bg-black/40 border border-cyan-500/50 rounded-xl px-4 py-3 text-white placeholder-cyan-400 focus:outline-none focus:border-cyan-400"
                  placeholder="Dupont"
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-cyan-200 mb-2">
                  Email professionnel *
                </label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => handleInputChange('email', e.target.value)}
                  className="w-full bg-black/40 border border-cyan-500/50 rounded-xl px-4 py-3 text-white placeholder-cyan-400 focus:outline-none focus:border-cyan-400"
                  placeholder="contact@monmagasin.fr"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-cyan-200 mb-2">
                  Téléphone *
                </label>
                <input
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => handleInputChange('phone', e.target.value)}
                  className="w-full bg-black/40 border border-cyan-500/50 rounded-xl px-4 py-3 text-white placeholder-cyan-400 focus:outline-none focus:border-cyan-400"
                  placeholder="01 23 45 67 89"
                  required
                />
              </div>
            </div>

            {/* Plan Selection */}
            <div>
              <label className="block text-sm font-medium text-cyan-200 mb-4">
                Choisissez votre plan
              </label>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {plans.map((plan) => (
                  <div
                    key={plan.id}
                    onClick={() => handleInputChange('selectedPlan', plan.id)}
                    className={`relative p-6 rounded-xl border cursor-pointer transition-all ${
                      formData.selectedPlan === plan.id
                        ? 'bg-cyan-500/20 border-cyan-400 text-cyan-300'
                        : 'bg-black/20 border-white/20 text-gray-300 hover:border-cyan-400/50'
                    }`}
                  >
                    {plan.popular && (
                      <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                        <span className="bg-gradient-to-r from-cyan-500 to-blue-600 text-white px-3 py-1 rounded-full text-xs font-bold">
                          POPULAIRE
                        </span>
                      </div>
                    )}
                    <h3 className="text-lg font-bold mb-2">{plan.name}</h3>
                    <p className="text-xl font-bold mb-4">{plan.price}</p>
                    <ul className="space-y-2 text-sm">
                      {plan.features.map((feature, index) => (
                        <li key={index} className="flex items-center gap-2">
                          <CheckCircle className="w-4 h-4 text-green-400" />
                          {feature}
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 disabled:from-gray-600 disabled:to-gray-700 text-white py-4 rounded-xl font-semibold transition-all disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {isSubmitting ? (
                <>
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                  Envoi en cours...
                </>
              ) : (
                'Envoyer la demande'
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};