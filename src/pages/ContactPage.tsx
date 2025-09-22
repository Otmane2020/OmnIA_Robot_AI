import React, { useState } from 'react';
import { ArrowLeft, Mail, Phone, MapPin, Send, MessageSquare, Clock, CheckCircle } from 'lucide-react';
import { Logo } from '../components/Logo';
import { Footer } from '../components/Footer';

export const ContactPage: React.FC = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    company: '',
    subject: '',
    message: '',
    type: 'support'
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const contactTypes = [
    { id: 'support', label: 'Support technique', icon: MessageSquare },
    { id: 'sales', label: 'Informations commerciales', icon: Phone },
    { id: 'partnership', label: 'Partenariats', icon: Mail },
    { id: 'press', label: 'Presse & médias', icon: Mail }
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    // Simulate form submission
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    setIsSubmitted(true);
    setIsSubmitting(false);
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  if (isSubmitted) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-purple-900 flex items-center justify-center">
        <div className="text-center max-w-md mx-auto p-8">
          <CheckCircle className="w-20 h-20 text-green-400 mx-auto mb-6" />
          <h1 className="text-3xl font-bold text-white mb-4">Message envoyé !</h1>
          <p className="text-gray-300 mb-8">
            Merci pour votre message. Notre équipe vous répondra sous 24h.
          </p>
          <a 
            href="/"
            className="bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white px-6 py-3 rounded-xl font-semibold transition-all"
          >
            Retour à l'accueil
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-purple-900">
      {/* Header */}
      <header className="bg-black/20 backdrop-blur-xl border-b border-white/10">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <Logo size="md" />
            <a href="/" className="flex items-center gap-2 text-cyan-400 hover:text-cyan-300 transition-colors">
              <ArrowLeft className="w-4 h-4" />
              Retour accueil
            </a>
          </div>
        </div>
      </header>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-white mb-4">Contactez-nous</h1>
          <p className="text-xl text-gray-300">
            Notre équipe est là pour vous accompagner
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Informations de contact */}
          <div className="space-y-8">
            <div className="bg-white/10 backdrop-blur-xl rounded-2xl p-8 border border-white/20">
              <h2 className="text-2xl font-bold text-white mb-6">Nos coordonnées</h2>
              
              <div className="space-y-6">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-cyan-500/20 rounded-xl flex items-center justify-center">
                    <Mail className="w-6 h-6 text-cyan-400" />
                  </div>
                  <div>
                    <h3 className="text-white font-semibold mb-1">Email</h3>
                    <p className="text-gray-300">support@omnia.sale</p>
                    <p className="text-gray-400 text-sm">Réponse sous 24h</p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-green-500/20 rounded-xl flex items-center justify-center">
                    <Phone className="w-6 h-6 text-green-400" />
                  </div>
                  <div>
                    <h3 className="text-white font-semibold mb-1">Téléphone</h3>
                    <p className="text-gray-300">+33 1 23 45 67 89</p>
                    <p className="text-gray-400 text-sm">Lun-Ven 9h-18h</p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-purple-500/20 rounded-xl flex items-center justify-center">
                    <MapPin className="w-6 h-6 text-purple-400" />
                  </div>
                  <div>
                    <h3 className="text-white font-semibold mb-1">Adresse</h3>
                    <p className="text-gray-300">
                      123 Avenue des Champs-Élysées<br />
                      75008 Paris, France
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-orange-500/20 rounded-xl flex items-center justify-center">
                    <Clock className="w-6 h-6 text-orange-400" />
                  </div>
                  <div>
                    <h3 className="text-white font-semibold mb-1">Horaires</h3>
                    <p className="text-gray-300">
                      Lundi - Vendredi : 9h00 - 18h00<br />
                      Support 24/7 pour les urgences
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Contacts spécialisés */}
            <div className="bg-white/10 backdrop-blur-xl rounded-2xl p-8 border border-white/20">
              <h2 className="text-2xl font-bold text-white mb-6">Contacts spécialisés</h2>
              
              <div className="space-y-4">
                <div className="flex justify-between items-center p-4 bg-black/20 rounded-xl">
                  <div>
                    <h3 className="text-white font-semibold">Support technique</h3>
                    <p className="text-gray-400 text-sm">Aide configuration et bugs</p>
                  </div>
                  <a href="mailto:support@omnia.sale" className="text-cyan-400 hover:text-cyan-300">
                    support@omnia.sale
                  </a>
                </div>

                <div className="flex justify-between items-center p-4 bg-black/20 rounded-xl">
                  <div>
                    <h3 className="text-white font-semibold">Équipe commerciale</h3>
                    <p className="text-gray-400 text-sm">Démonstrations et devis</p>
                  </div>
                  <a href="mailto:sales@omnia.sale" className="text-cyan-400 hover:text-cyan-300">
                    sales@omnia.sale
                  </a>
                </div>

                <div className="flex justify-between items-center p-4 bg-black/20 rounded-xl">
                  <div>
                    <h3 className="text-white font-semibold">Partenariats</h3>
                    <p className="text-gray-400 text-sm">Intégrations et collaborations</p>
                  </div>
                  <a href="mailto:partnerships@omnia.sale" className="text-cyan-400 hover:text-cyan-300">
                    partnerships@omnia.sale
                  </a>
                </div>
              </div>
            </div>
          </div>

          {/* Formulaire de contact */}
          <div className="bg-white/10 backdrop-blur-xl rounded-2xl p-8 border border-white/20">
            <h2 className="text-2xl font-bold text-white mb-6">Envoyez-nous un message</h2>
            
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Type de demande */}
              <div>
                <label className="block text-sm font-medium text-cyan-200 mb-3">
                  Type de demande
                </label>
                <div className="grid grid-cols-2 gap-3">
                  {contactTypes.map((type) => {
                    const Icon = type.icon;
                    return (
                      <button
                        key={type.id}
                        type="button"
                        onClick={() => handleInputChange('type', type.id)}
                        className={`p-3 rounded-xl border transition-all ${
                          formData.type === type.id
                            ? 'border-cyan-500 bg-cyan-500/20 text-cyan-300'
                            : 'border-gray-600 bg-black/20 text-gray-400 hover:border-cyan-500/50'
                        }`}
                      >
                        <Icon className="w-5 h-5 mx-auto mb-2" />
                        <span className="text-xs font-medium">{type.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Informations personnelles */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-cyan-200 mb-2">
                    Nom complet *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => handleInputChange('name', e.target.value)}
                    className="w-full px-4 py-3 bg-black/40 border border-cyan-500/50 rounded-xl text-white placeholder-cyan-400 focus:outline-none focus:border-cyan-400 focus:ring-2 focus:ring-cyan-400/30"
                    placeholder="Jean Martin"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-cyan-200 mb-2">
                    Email *
                  </label>
                  <input
                    type="email"
                    required
                    value={formData.email}
                    onChange={(e) => handleInputChange('email', e.target.value)}
                    className="w-full px-4 py-3 bg-black/40 border border-cyan-500/50 rounded-xl text-white placeholder-cyan-400 focus:outline-none focus:border-cyan-400 focus:ring-2 focus:ring-cyan-400/30"
                    placeholder="contact@monentreprise.com"
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
                  className="w-full px-4 py-3 bg-black/40 border border-cyan-500/50 rounded-xl text-white placeholder-cyan-400 focus:outline-none focus:border-cyan-400 focus:ring-2 focus:ring-cyan-400/30"
                  placeholder="Mobilier Design Paris"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-cyan-200 mb-2">
                  Sujet *
                </label>
                <input
                  type="text"
                  required
                  value={formData.subject}
                  onChange={(e) => handleInputChange('subject', e.target.value)}
                  className="w-full px-4 py-3 bg-black/40 border border-cyan-500/50 rounded-xl text-white placeholder-cyan-400 focus:outline-none focus:border-cyan-400 focus:ring-2 focus:ring-cyan-400/30"
                  placeholder="Problème d'import catalogue"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-cyan-200 mb-2">
                  Message *
                </label>
                <textarea
                  required
                  rows={6}
                  value={formData.message}
                  onChange={(e) => handleInputChange('message', e.target.value)}
                  className="w-full px-4 py-3 bg-black/40 border border-cyan-500/50 rounded-xl text-white placeholder-cyan-400 focus:outline-none focus:border-cyan-400 focus:ring-2 focus:ring-cyan-400/30 resize-none"
                  placeholder="Décrivez votre demande en détail..."
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

            {/* Info supplémentaire */}
            <div className="mt-8 bg-cyan-500/20 border border-cyan-400/50 rounded-xl p-6">
              <h3 className="text-lg font-bold text-cyan-200 mb-4">💡 Avant de nous contacter</h3>
              <ul className="text-cyan-300 text-sm space-y-2">
                <li>• Consultez notre <a href="/documentation" className="underline hover:text-white">documentation</a> pour les questions techniques</li>
                <li>• Vérifiez notre <a href="/status" className="underline hover:text-white">page de statut</a> en cas de problème</li>
                <li>• Testez <a href="/robot" className="underline hover:text-white">OmnIA en démo</a> pour découvrir les fonctionnalités</li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
};