import React, { useState } from 'react';
import { Mail, Phone, MapPin, Clock, Send, ArrowLeft, MessageSquare, Users, Briefcase } from 'lucide-react';
import { Logo } from '../components/Logo';

export const Contact: React.FC = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    company: '',
    subject: '',
    message: '',
    type: 'general'
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const contactTypes = [
    { id: 'general', label: 'Question générale', icon: MessageSquare },
    { id: 'sales', label: 'Équipe commerciale', icon: Briefcase },
    { id: 'support', label: 'Support technique', icon: Users }
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    // Simulate form submission
    setTimeout(() => {
      setIsSubmitted(true);
      setIsSubmitting(false);
    }, 2000);
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  if (isSubmitted) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-purple-900 flex items-center justify-center p-4">
        <div className="bg-white/10 backdrop-blur-xl rounded-2xl p-8 border border-white/20 text-center max-w-md">
          <div className="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-4">
            <Send className="w-8 h-8 text-white" />
          </div>
          <h2 className="text-2xl font-bold text-white mb-4">Message envoyé !</h2>
          <p className="text-gray-300 mb-6">
            Merci pour votre message. Notre équipe vous répondra sous 24h.
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
            <div className="flex items-center space-x-4">
              <a href="/" className="flex items-center gap-2 text-cyan-400 hover:text-cyan-300 transition-colors">
                <ArrowLeft className="w-4 h-4" />
                Retour à l'accueil
              </a>
            </div>
          </div>
        </div>
      </header>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Hero Section */}
        <div className="text-center mb-16">
          <h1 className="text-4xl md:text-6xl font-bold text-white mb-6">
            Contactez-nous
            <span className="block bg-gradient-to-r from-cyan-400 via-blue-400 to-purple-400 bg-clip-text text-transparent">
              Nous sommes là pour vous aider
            </span>
          </h1>
          <p className="text-xl text-gray-300 max-w-3xl mx-auto">
            Une question ? Un projet ? Notre équipe OmnIA vous accompagne
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Contact Form */}
          <div className="bg-white/10 backdrop-blur-xl rounded-2xl p-8 border border-white/20">
            <h2 className="text-2xl font-bold text-white mb-6">Envoyez-nous un message</h2>
            
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-cyan-200 mb-2">
                    Nom complet *
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => handleInputChange('name', e.target.value)}
                    className="w-full bg-black/40 border border-cyan-500/50 rounded-xl px-4 py-3 text-white placeholder-cyan-400 focus:outline-none focus:border-cyan-400 focus:ring-2 focus:ring-cyan-400/30"
                    placeholder="Jean Dupont"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-cyan-200 mb-2">
                    Email *
                  </label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => handleInputChange('email', e.target.value)}
                    className="w-full bg-black/40 border border-cyan-500/50 rounded-xl px-4 py-3 text-white placeholder-cyan-400 focus:outline-none focus:border-cyan-400 focus:ring-2 focus:ring-cyan-400/30"
                    placeholder="jean@monmagasin.fr"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-cyan-200 mb-2">
                  Entreprise
                </label>
                <input
                  type="text"
                  value={formData.company}
                  onChange={(e) => handleInputChange('company', e.target.value)}
                  className="w-full bg-black/40 border border-cyan-500/50 rounded-xl px-4 py-3 text-white placeholder-cyan-400 focus:outline-none focus:border-cyan-400 focus:ring-2 focus:ring-cyan-400/30"
                  placeholder="Mon Magasin de Meubles"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-cyan-200 mb-2">
                  Type de demande
                </label>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  {contactTypes.map((type) => {
                    const Icon = type.icon;
                    return (
                      <button
                        key={type.id}
                        type="button"
                        onClick={() => handleInputChange('type', type.id)}
                        className={`flex items-center gap-2 p-3 rounded-xl border transition-all ${
                          formData.type === type.id
                            ? 'bg-cyan-500/20 border-cyan-400 text-cyan-300'
                            : 'bg-black/20 border-white/20 text-gray-300 hover:border-cyan-400/50'
                        }`}
                      >
                        <Icon className="w-4 h-4" />
                        <span className="text-sm font-medium">{type.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-cyan-200 mb-2">
                  Sujet *
                </label>
                <input
                  type="text"
                  value={formData.subject}
                  onChange={(e) => handleInputChange('subject', e.target.value)}
                  className="w-full bg-black/40 border border-cyan-500/50 rounded-xl px-4 py-3 text-white placeholder-cyan-400 focus:outline-none focus:border-cyan-400 focus:ring-2 focus:ring-cyan-400/30"
                  placeholder="Intégration OmnIA sur mon site"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-cyan-200 mb-2">
                  Message *
                </label>
                <textarea
                  value={formData.message}
                  onChange={(e) => handleInputChange('message', e.target.value)}
                  rows={6}
                  className="w-full bg-black/40 border border-cyan-500/50 rounded-xl px-4 py-3 text-white placeholder-cyan-400 focus:outline-none focus:border-cyan-400 focus:ring-2 focus:ring-cyan-400/30 resize-none"
                  placeholder="Décrivez votre demande en détail..."
                  required
                />
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
                  <>
                    <Send className="w-5 h-5" />
                    Envoyer le message
                  </>
                )}
              </button>
            </form>
          </div>

          {/* Contact Info */}
          <div className="space-y-8">
            <div className="bg-white/10 backdrop-blur-xl rounded-2xl p-8 border border-white/20">
              <h2 className="text-2xl font-bold text-white mb-6">Informations de contact</h2>
              
              <div className="space-y-6">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-cyan-600 rounded-xl flex items-center justify-center">
                    <Mail className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <div className="font-semibold text-white">Email</div>
                    <a href="mailto:contact@omnia.sale" className="text-cyan-400 hover:text-cyan-300">
                      contact@omnia.sale
                    </a>
                  </div>
                </div>

                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl flex items-center justify-center">
                    <Phone className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <div className="font-semibold text-white">Téléphone</div>
                    <a href="tel:+33184883245" className="text-cyan-400 hover:text-cyan-300">
                      +33 1 84 88 32 45
                    </a>
                  </div>
                </div>

                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-600 rounded-xl flex items-center justify-center">
                    <MapPin className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <div className="font-semibold text-white">Adresse</div>
                    <div className="text-gray-300">
                      123 Avenue des Champs-Élysées<br />
                      75008 Paris, France
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-gradient-to-br from-orange-500 to-red-600 rounded-xl flex items-center justify-center">
                    <Clock className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <div className="font-semibold text-white">Horaires</div>
                    <div className="text-gray-300">
                      Lun-Ven : 9h00 - 18h00<br />
                      Sam : 10h00 - 16h00
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white/10 backdrop-blur-xl rounded-2xl p-8 border border-white/20">
              <h3 className="text-xl font-bold text-white mb-4">Support Prioritaire</h3>
              <p className="text-gray-300 mb-4">
                Clients Professional et Enterprise bénéficient d'un support prioritaire avec :
              </p>
              <ul className="space-y-2 text-gray-300">
                <li className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-cyan-400 rounded-full"></div>
                  Réponse sous 4h garantie
                </li>
                <li className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-cyan-400 rounded-full"></div>
                  Ligne directe dédiée
                </li>
                <li className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-cyan-400 rounded-full"></div>
                  Support technique avancé
                </li>
                <li className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-cyan-400 rounded-full"></div>
                  Formation personnalisée
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};