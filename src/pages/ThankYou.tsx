import React, { useEffect, useState } from 'react';
import { CheckCircle, Mail, Clock, Globe, ArrowRight, Home, MessageSquare, FileText } from 'lucide-react';

interface ApplicationData {
  companyName: string;
  email: string;
  firstName: string;
  lastName: string;
  phone: string;
  selectedPlan: string;
  proposedSubdomain: string;
  submittedAt: string;
}

export const ThankYou: React.FC = () => {
  const [applicationData, setApplicationData] = useState<ApplicationData | null>(null);
  const [timeRemaining, setTimeRemaining] = useState('');

  useEffect(() => {
    // Récupérer les données de l'inscription depuis localStorage
    const savedData = localStorage.getItem('registration_data');
    if (savedData) {
      try {
        const data = JSON.parse(savedData);
        setApplicationData(data);
        
        // Calculer le temps restant pour la validation (24-48h)
        const submittedTime = new Date(data.submittedAt);
        const validationTime = new Date(submittedTime.getTime() + 24 * 60 * 60 * 1000); // +24h
        
        const updateTimeRemaining = () => {
          const now = new Date();
          const diff = validationTime.getTime() - now.getTime();
          
          if (diff > 0) {
            const hours = Math.floor(diff / (1000 * 60 * 60));
            const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
            setTimeRemaining(`${hours}h ${minutes}min`);
          } else {
            setTimeRemaining('Validation en cours...');
          }
        };
        
        updateTimeRemaining();
        const interval = setInterval(updateTimeRemaining, 60000); // Update every minute
        
        return () => clearInterval(interval);
      } catch (error) {
        console.error('Erreur parsing données inscription:', error);
      }
    }
  }, []);

  const planDetails = {
    starter: { name: 'Starter', price: '29€/mois', features: ['1000 conversations', '500 produits', 'Support email'] },
    professional: { name: 'Professional', price: '79€/mois', features: ['5000 conversations', 'Produits illimités', 'Support prioritaire'] },
    enterprise: { name: 'Enterprise', price: '199€/mois', features: ['Conversations illimitées', 'Multi-magasins', 'Support dédié'] }
  };

  const currentPlan = applicationData ? planDetails[applicationData.selectedPlan as keyof typeof planDetails] : null;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-purple-900">
      {/* Background Effects */}
      <div className="absolute inset-0 opacity-20">
        <div className="absolute top-20 left-20 w-72 h-72 bg-cyan-500/30 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-20 right-20 w-96 h-96 bg-purple-500/20 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '2s' }}></div>
        <div className="absolute top-1/2 left-1/2 w-64 h-64 bg-green-500/20 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '4s' }}></div>
      </div>

      {/* Header */}
      <header className="relative z-10 bg-black/20 backdrop-blur-xl border-b border-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-xl flex items-center justify-center">
                <span className="text-white font-bold text-lg">O</span>
              </div>
              <div>
                <h1 className="text-xl font-bold text-white">OmnIA</h1>
                <p className="text-cyan-300 text-sm">Merci</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <a href="/" className="flex items-center gap-2 text-cyan-400 hover:text-cyan-300 transition-colors">
                <Home className="w-4 h-4" />
                Accueil
              </a>
            </div>
          </div>
        </div>
      </header>

      <div className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Success Animation */}
        <div className="text-center mb-12">
          <div className="relative inline-block">
            <div className="w-32 h-32 bg-gradient-to-br from-green-400 to-emerald-600 rounded-full flex items-center justify-center mx-auto mb-6 shadow-2xl shadow-green-500/50 animate-bounce">
              <CheckCircle className="w-16 h-16 text-white" />
            </div>
            
            {/* Floating particles */}
            <div className="absolute -top-4 -left-4 w-4 h-4 bg-green-400 rounded-full animate-bounce" style={{ animationDelay: '0.5s' }}></div>
            <div className="absolute -top-2 -right-6 w-3 h-3 bg-emerald-400 rounded-full animate-bounce" style={{ animationDelay: '1s' }}></div>
            <div className="absolute -bottom-4 -right-4 w-4 h-4 bg-green-500 rounded-full animate-bounce" style={{ animationDelay: '1.5s' }}></div>
          </div>
          
          <h1 className="text-4xl md:text-6xl font-bold text-white mb-6">
            ✅ Inscription envoyée !
            <span className="block bg-gradient-to-r from-green-400 via-emerald-400 to-cyan-400 bg-clip-text text-transparent">
              Merci pour votre confiance
            </span>
          </h1>
          
          <p className="text-xl text-gray-300 max-w-3xl mx-auto">
            Votre demande d'inscription OmnIA.sale a été transmise avec succès à notre équipe
          </p>
        </div>

        {/* Application Summary */}
        {applicationData && (
          <div className="bg-white/10 backdrop-blur-xl rounded-2xl p-8 border border-white/20 mb-8">
            <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-3">
              <FileText className="w-6 h-6 text-cyan-400" />
              Récapitulatif de votre demande
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-4">
                <div className="bg-black/20 rounded-xl p-4">
                  <h3 className="font-semibold text-cyan-300 mb-3">🏢 Informations entreprise</h3>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-300">Entreprise :</span>
                      <span className="text-white font-semibold">{applicationData.companyName}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-300">Contact :</span>
                      <span className="text-white">{applicationData.firstName} {applicationData.lastName}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-300">Email :</span>
                      <span className="text-white">{applicationData.email}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-300">Téléphone :</span>
                      <span className="text-white">{applicationData.phone}</span>
                    </div>
                  </div>
                </div>
                
                <div className="bg-black/20 rounded-xl p-4">
                  <h3 className="font-semibold text-purple-300 mb-3">💳 Plan sélectionné</h3>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-300">Plan :</span>
                      <span className="text-white font-semibold">{currentPlan?.name}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-300">Prix :</span>
                      <span className="text-green-400 font-bold">{currentPlan?.price}</span>
                    </div>
                    <div className="text-gray-300">
                      <div className="font-medium mb-1">Inclus :</div>
                      <ul className="space-y-1">
                        {currentPlan?.features.map((feature, index) => (
                          <li key={index} className="flex items-center gap-2">
                            <CheckCircle className="w-3 h-3 text-green-400" />
                            <span className="text-xs">{feature}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="space-y-4">
                <div className="bg-black/20 rounded-xl p-4">
                  <h3 className="font-semibold text-green-300 mb-3">🌐 Votre futur domaine</h3>
                  <div className="space-y-2 text-sm">
                    <div className="bg-green-500/20 border border-green-400/30 rounded-lg p-3">
                      <div className="text-green-200 font-semibold">
                        {applicationData.proposedSubdomain}.omnia.sale
                      </div>
                      <div className="text-green-300 text-xs mt-1">
                        Interface admin personnalisée
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="bg-black/20 rounded-xl p-4">
                  <h3 className="font-semibold text-orange-300 mb-3">⏱️ Temps de validation</h3>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-300">Soumis le :</span>
                      <span className="text-white">
                        {new Date(applicationData.submittedAt).toLocaleDateString('fr-FR', {
                          day: '2-digit',
                          month: '2-digit',
                          year: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-300">Validation dans :</span>
                      <span className="text-orange-400 font-bold">{timeRemaining}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Next Steps */}
        <div className="bg-white/10 backdrop-blur-xl rounded-2xl p-8 border border-white/20 mb-8">
          <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-3">
            <Clock className="w-6 h-6 text-orange-400" />
            Prochaines étapes
          </h2>
          
          <div className="space-y-6">
            <div className="flex items-start gap-4">
              <div className="w-8 h-8 bg-yellow-500 rounded-full flex items-center justify-center text-white font-bold text-sm">1</div>
              <div>
                <h3 className="font-semibold text-white mb-2">📋 Validation de votre dossier (24-48h)</h3>
                <p className="text-gray-300 text-sm">
                  Notre équipe examine votre demande et vérifie les documents fournis (Kbis, informations entreprise).
                </p>
              </div>
            </div>
            
            <div className="flex items-start gap-4">
              <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center text-white font-bold text-sm">2</div>
              <div>
                <h3 className="font-semibold text-white mb-2">📧 Email de confirmation</h3>
                <p className="text-gray-300 text-sm">
                  Vous recevrez un email avec vos identifiants de connexion et le lien vers votre interface admin personnalisée.
                </p>
              </div>
            </div>
            
            <div className="flex items-start gap-4">
              <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center text-white font-bold text-sm">3</div>
              <div>
                <h3 className="font-semibold text-white mb-2">🚀 Activation de votre compte</h3>
                <p className="text-gray-300 text-sm">
                  Accès immédiat à votre interface admin, import de catalogue, et configuration d'OmnIA selon votre marque.
                </p>
              </div>
            </div>
            
            <div className="flex items-start gap-4">
              <div className="w-8 h-8 bg-purple-500 rounded-full flex items-center justify-center text-white font-bold text-sm">4</div>
              <div>
                <h3 className="font-semibold text-white mb-2">🎯 Formation et accompagnement</h3>
                <p className="text-gray-300 text-sm">
                  Formation personnalisée à l'utilisation d'OmnIA et intégration sur votre site e-commerce.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Contact Info */}
        <div className="bg-white/10 backdrop-blur-xl rounded-2xl p-8 border border-white/20 mb-8">
          <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-3">
            <Mail className="w-6 h-6 text-cyan-400" />
            Besoin d'aide ?
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-black/20 rounded-xl p-4">
              <h3 className="font-semibold text-cyan-300 mb-3">📞 Support commercial</h3>
              <div className="space-y-2 text-sm">
                <div className="text-white">+33 1 84 88 32 45</div>
                <div className="text-gray-300">Lun-Ven : 9h00 - 18h00</div>
                <a href="mailto:commercial@omnia.sale" className="text-cyan-400 hover:text-cyan-300">
                  commercial@omnia.sale
                </a>
              </div>
            </div>
            
            <div className="bg-black/20 rounded-xl p-4">
              <h3 className="font-semibold text-green-300 mb-3">💬 Support technique</h3>
              <div className="space-y-2 text-sm">
                <div className="text-white">Chat en direct</div>
                <div className="text-gray-300">Réponse sous 2h</div>
                <a href="mailto:support@omnia.sale" className="text-green-400 hover:text-green-300">
                  support@omnia.sale
                </a>
              </div>
            </div>
          </div>
        </div>

        {/* What to expect */}
        <div className="bg-gradient-to-r from-green-500/20 to-emerald-600/20 backdrop-blur-xl rounded-2xl p-8 border border-green-400/30 mb-8">
          <h2 className="text-2xl font-bold text-white mb-6">🎁 Pendant l'attente, découvrez OmnIA</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="w-16 h-16 bg-blue-500/30 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <MessageSquare className="w-8 h-8 text-blue-400" />
              </div>
              <h3 className="font-semibold text-white mb-2">Testez la démo</h3>
              <p className="text-gray-300 text-sm mb-4">
                Découvrez OmnIA en action avec notre démo interactive
              </p>
              <a
                href="/chat"
                className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-xl text-sm font-semibold transition-all"
              >
                <MessageSquare className="w-4 h-4" />
                Tester OmnIA
              </a>
            </div>
            
            <div className="text-center">
              <div className="w-16 h-16 bg-purple-500/30 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <FileText className="w-8 h-8 text-purple-400" />
              </div>
              <h3 className="font-semibold text-white mb-2">Documentation</h3>
              <p className="text-gray-300 text-sm mb-4">
                Consultez nos guides d'intégration et tutoriels
              </p>
              <a
                href="/documentation"
                className="inline-flex items-center gap-2 bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-xl text-sm font-semibold transition-all"
              >
                <FileText className="w-4 h-4" />
                Voir les guides
              </a>
            </div>
            
            <div className="text-center">
              <div className="w-16 h-16 bg-orange-500/30 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <Globe className="w-8 h-8 text-orange-400" />
              </div>
              <h3 className="font-semibold text-white mb-2">Préparez votre site</h3>
              <p className="text-gray-300 text-sm mb-4">
                Préparez l'intégration du widget OmnIA sur votre site
              </p>
              <a
                href="/guides"
                className="inline-flex items-center gap-2 bg-orange-600 hover:bg-orange-700 text-white px-4 py-2 rounded-xl text-sm font-semibold transition-all"
              >
                <Globe className="w-4 h-4" />
                Guide intégration
              </a>
            </div>
          </div>
        </div>

        {/* Email confirmation notice */}
        <div className="bg-cyan-500/20 border border-cyan-400/50 rounded-xl p-6 mb-8">
          <div className="flex items-center gap-3 mb-4">
            <Mail className="w-6 h-6 text-cyan-400" />
            <h3 className="text-lg font-bold text-white">📧 Email de confirmation envoyé</h3>
          </div>
          <p className="text-cyan-200 mb-4">
            Un email de confirmation a été envoyé à <strong>{applicationData?.email}</strong> avec :
          </p>
          <ul className="text-cyan-300 text-sm space-y-1">
            <li>• Récapitulatif de votre demande</li>
            <li>• Numéro de référence de dossier</li>
            <li>• Liens vers la documentation</li>
            <li>• Coordonnées de notre équipe</li>
          </ul>
        </div>

        {/* CTA Section */}
        <div className="text-center">
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a
              href="/"
              className="bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white px-8 py-4 rounded-2xl font-bold text-lg transition-all shadow-2xl hover:shadow-cyan-500/40 flex items-center justify-center gap-2"
            >
              <Home className="w-5 h-5" />
              Retour à l'accueil
            </a>
            
            <a
              href="/chat"
              className="bg-white/10 hover:bg-white/20 text-white px-8 py-4 rounded-2xl font-bold text-lg transition-all border border-white/20 flex items-center justify-center gap-2"
            >
              <MessageSquare className="w-5 h-5" />
              Tester OmnIA
            </a>
          </div>
          
          <p className="text-gray-400 text-sm mt-6">
            Une question ? Contactez-nous à <a href="mailto:support@omnia.sale" className="text-cyan-400 hover:text-cyan-300">support@omnia.sale</a>
          </p>
        </div>
      </div>
    </div>
  );
};