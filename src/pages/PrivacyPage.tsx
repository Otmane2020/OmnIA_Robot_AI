import React from 'react';
import { ArrowLeft, Shield, Database, Eye, Lock } from 'lucide-react';
import { Logo } from '../components/Logo';
import { Footer } from '../components/Footer';

export const PrivacyPage: React.FC = () => {
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
        <div className="bg-white/10 backdrop-blur-xl rounded-2xl p-8 border border-white/20">
          <div className="text-center mb-8">
            <Shield className="w-16 h-16 text-green-400 mx-auto mb-4" />
            <h1 className="text-3xl font-bold text-white mb-2">Politique de Confidentialité</h1>
            <p className="text-gray-300">OmnIA.sale - Dernière mise à jour : 15 janvier 2025</p>
          </div>

          <div className="prose prose-invert max-w-none space-y-8">
            {/* Section 1 */}
            <section>
              <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                <Database className="w-6 h-6 text-blue-400" />
                1. Collecte des données
              </h2>
              <div className="text-gray-300 space-y-4">
                <p>
                  OmnIA.sale collecte uniquement les données nécessaires au fonctionnement de nos services :
                </p>
                <ul className="space-y-2 ml-6">
                  <li>• <strong>Données d'inscription :</strong> Informations entreprise, contact responsable, SIRET</li>
                  <li>• <strong>Données produits :</strong> Catalogues importés par les revendeurs</li>
                  <li>• <strong>Données d'usage :</strong> Conversations avec l'assistant IA (anonymisées)</li>
                  <li>• <strong>Données techniques :</strong> Logs de performance et analytics</li>
                </ul>
              </div>
            </section>

            {/* Section 2 */}
            <section>
              <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                <Eye className="w-6 h-6 text-purple-400" />
                2. Utilisation des données
              </h2>
              <div className="text-gray-300 space-y-4">
                <p>Vos données sont utilisées exclusivement pour :</p>
                <ul className="space-y-2 ml-6">
                  <li>• Fournir et améliorer nos services IA</li>
                  <li>• Personnaliser l'expérience utilisateur</li>
                  <li>• Générer des analytics et statistiques</li>
                  <li>• Assurer le support technique</li>
                  <li>• Respecter nos obligations légales</li>
                </ul>
                <p>
                  <strong>Nous ne vendons jamais vos données à des tiers.</strong>
                </p>
              </div>
            </section>

            {/* Section 3 */}
            <section>
              <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                <Lock className="w-6 h-6 text-green-400" />
                3. Sécurité et protection
              </h2>
              <div className="text-gray-300 space-y-4">
                <p>OmnIA.sale met en œuvre des mesures de sécurité avancées :</p>
                <ul className="space-y-2 ml-6">
                  <li>• <strong>Chiffrement :</strong> Toutes les données sont chiffrées en transit et au repos</li>
                  <li>• <strong>Accès contrôlé :</strong> Authentification multi-facteurs obligatoire</li>
                  <li>• <strong>Surveillance :</strong> Monitoring 24/7 des accès et activités</li>
                  <li>• <strong>Sauvegardes :</strong> Backups quotidiens automatiques</li>
                  <li>• <strong>Conformité :</strong> Respect des standards ISO 27001</li>
                </ul>
              </div>
            </section>

            {/* Section 4 */}
            <section>
              <h2 className="text-xl font-bold text-white mb-4">4. Cookies et technologies similaires</h2>
              <div className="text-gray-300 space-y-4">
                <p>OmnIA.sale utilise des cookies pour :</p>
                <ul className="space-y-2 ml-6">
                  <li>• Maintenir votre session de connexion</li>
                  <li>• Mémoriser vos préférences d'interface</li>
                  <li>• Analyser l'utilisation de la plateforme</li>
                  <li>• Améliorer les performances</li>
                </ul>
                <p>
                  Vous pouvez configurer vos préférences cookies dans les paramètres de votre navigateur.
                </p>
              </div>
            </section>

            {/* Section 5 */}
            <section>
              <h2 className="text-xl font-bold text-white mb-4">5. Vos droits RGPD</h2>
              <div className="text-gray-300 space-y-4">
                <p>Conformément au RGPD, vous disposez des droits suivants :</p>
                <ul className="space-y-2 ml-6">
                  <li>• <strong>Droit d'accès :</strong> Consulter vos données personnelles</li>
                  <li>• <strong>Droit de rectification :</strong> Corriger vos informations</li>
                  <li>• <strong>Droit à l'effacement :</strong> Supprimer vos données</li>
                  <li>• <strong>Droit à la portabilité :</strong> Récupérer vos données</li>
                  <li>• <strong>Droit d'opposition :</strong> Refuser certains traitements</li>
                </ul>
                <p>
                  Pour exercer ces droits, contactez-nous à : 
                  <a href="mailto:privacy@omnia.sale" className="text-cyan-400 hover:text-cyan-300 ml-1">
                    privacy@omnia.sale
                  </a>
                </p>
              </div>
            </section>

            {/* Section 6 */}
            <section>
              <h2 className="text-xl font-bold text-white mb-4">6. Conservation des données</h2>
              <div className="text-gray-300 space-y-4">
                <p>Les durées de conservation varient selon le type de données :</p>
                <ul className="space-y-2 ml-6">
                  <li>• <strong>Données compte :</strong> Durée de l'abonnement + 3 ans</li>
                  <li>• <strong>Catalogues produits :</strong> Durée de l'abonnement + 1 an</li>
                  <li>• <strong>Conversations IA :</strong> 2 ans (anonymisées après 6 mois)</li>
                  <li>• <strong>Logs techniques :</strong> 1 an maximum</li>
                </ul>
              </div>
            </section>

            {/* Section 7 */}
            <section>
              <h2 className="text-xl font-bold text-white mb-4">7. Transferts internationaux</h2>
              <div className="text-gray-300 space-y-4">
                <p>
                  Vos données sont hébergées en Europe (France) sur des serveurs sécurisés.
                </p>
                <p>
                  Certains sous-traitants (OpenAI, ElevenLabs) peuvent traiter des données hors UE 
                  avec des garanties de protection équivalentes.
                </p>
              </div>
            </section>

            {/* Section 8 */}
            <section>
              <h2 className="text-xl font-bold text-white mb-4">8. Contact et réclamations</h2>
              <div className="text-gray-300 space-y-4">
                <p>
                  Pour toute question relative à la protection de vos données :
                </p>
                <div className="bg-green-500/20 border border-green-400/50 rounded-xl p-4">
                  <p><strong>Délégué à la Protection des Données (DPO)</strong></p>
                  <p>Email : privacy@omnia.sale</p>
                  <p>Adresse : OmnIA.sale, 123 Avenue des Champs-Élysées, 75008 Paris</p>
                </div>
                <p>
                  Vous pouvez également saisir la CNIL en cas de réclamation : 
                  <a href="https://www.cnil.fr" target="_blank" className="text-cyan-400 hover:text-cyan-300 ml-1">
                    www.cnil.fr
                  </a>
                </p>
              </div>
            </section>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
};