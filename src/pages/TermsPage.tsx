import React from 'react';
import { ArrowLeft, FileText, Shield, Users, CreditCard } from 'lucide-react';
import { Logo } from '../components/Logo';
import { Footer } from '../components/Footer';

export const TermsPage: React.FC = () => {
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
            <FileText className="w-16 h-16 text-cyan-400 mx-auto mb-4" />
            <h1 className="text-3xl font-bold text-white mb-2">Conditions Générales d'Utilisation</h1>
            <p className="text-gray-300">OmnIA.sale - Dernière mise à jour : 15 janvier 2025</p>
          </div>

          <div className="prose prose-invert max-w-none space-y-8">
            {/* Article 1 */}
            <section>
              <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                <Shield className="w-6 h-6 text-cyan-400" />
                1. Objet et champ d'application
              </h2>
              <div className="text-gray-300 space-y-4">
                <p>
                  Les présentes Conditions Générales d'Utilisation (CGU) régissent l'utilisation de la plateforme OmnIA.sale, 
                  service d'assistant robot IA spécialisé dans le mobilier et la décoration d'intérieur.
                </p>
                <p>
                  OmnIA.sale est une plateforme SaaS (Software as a Service) destinée aux revendeurs de mobilier souhaitant 
                  intégrer un assistant conversationnel intelligent sur leurs sites e-commerce.
                </p>
                <p>
                  L'utilisation de nos services implique l'acceptation pleine et entière des présentes CGU.
                </p>
              </div>
            </section>

            {/* Article 2 */}
            <section>
              <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                <Users className="w-6 h-6 text-green-400" />
                2. Définitions
              </h2>
              <div className="text-gray-300 space-y-4">
                <ul className="space-y-2">
                  <li><strong>OmnIA :</strong> Assistant robot IA conversationnel spécialisé en mobilier</li>
                  <li><strong>Revendeur :</strong> Professionnel du mobilier utilisant nos services</li>
                  <li><strong>Plateforme :</strong> Ensemble des services OmnIA.sale</li>
                  <li><strong>Widget :</strong> Code intégrable sur les sites e-commerce</li>
                  <li><strong>Catalogue :</strong> Base de données produits du revendeur</li>
                </ul>
              </div>
            </section>

            {/* Article 3 */}
            <section>
              <h2 className="text-xl font-bold text-white mb-4">3. Inscription et accès aux services</h2>
              <div className="text-gray-300 space-y-4">
                <p>
                  L'inscription sur OmnIA.sale est réservée aux professionnels du mobilier disposant d'un SIRET valide.
                </p>
                <p>
                  Chaque revendeur s'engage à fournir des informations exactes et à jour lors de son inscription.
                </p>
                <p>
                  L'accès aux services est conditionné à la validation de la demande par notre équipe sous 48h ouvrées.
                </p>
              </div>
            </section>

            {/* Article 4 */}
            <section>
              <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                <CreditCard className="w-6 h-6 text-purple-400" />
                4. Tarification et facturation
              </h2>
              <div className="text-gray-300 space-y-4">
                <p>
                  Nos services sont proposés selon trois plans tarifaires : Starter (29€/mois), 
                  Professional (79€/mois) et Enterprise (199€/mois).
                </p>
                <p>
                  Une période d'essai gratuite de 14 jours est offerte sur tous les plans.
                </p>
                <p>
                  La facturation s'effectue mensuellement par prélèvement automatique.
                </p>
                <p>
                  Les prix sont exprimés en euros TTC et peuvent être modifiés avec un préavis de 30 jours.
                </p>
              </div>
            </section>

            {/* Article 5 */}
            <section>
              <h2 className="text-xl font-bold text-white mb-4">5. Propriété intellectuelle</h2>
              <div className="text-gray-300 space-y-4">
                <p>
                  OmnIA.sale et tous ses composants (logiciels, algorithmes, interfaces) sont protégés par le droit d'auteur.
                </p>
                <p>
                  Les revendeurs conservent la propriété de leurs catalogues produits et données clients.
                </p>
                <p>
                  L'utilisation de nos services ne confère aucun droit de propriété sur la technologie OmnIA.
                </p>
              </div>
            </section>

            {/* Article 6 */}
            <section>
              <h2 className="text-xl font-bold text-white mb-4">6. Protection des données</h2>
              <div className="text-gray-300 space-y-4">
                <p>
                  OmnIA.sale s'engage à protéger les données personnelles conformément au RGPD.
                </p>
                <p>
                  Les conversations avec l'assistant IA sont anonymisées et utilisées uniquement pour améliorer le service.
                </p>
                <p>
                  Les catalogues produits sont stockés de manière sécurisée et ne sont jamais partagés avec des tiers.
                </p>
              </div>
            </section>

            {/* Article 7 */}
            <section>
              <h2 className="text-xl font-bold text-white mb-4">7. Responsabilités</h2>
              <div className="text-gray-300 space-y-4">
                <p>
                  OmnIA.sale s'engage à fournir un service de qualité avec une disponibilité de 99,9%.
                </p>
                <p>
                  Les revendeurs sont responsables de la qualité et de l'exactitude de leurs catalogues produits.
                </p>
                <p>
                  OmnIA.sale ne peut être tenu responsable des ventes ou transactions effectuées via l'assistant.
                </p>
              </div>
            </section>

            {/* Article 8 */}
            <section>
              <h2 className="text-xl font-bold text-white mb-4">8. Résiliation</h2>
              <div className="text-gray-300 space-y-4">
                <p>
                  Les services peuvent être résiliés à tout moment par le revendeur avec un préavis de 30 jours.
                </p>
                <p>
                  OmnIA.sale se réserve le droit de suspendre un compte en cas de non-respect des CGU.
                </p>
                <p>
                  En cas de résiliation, les données sont conservées 30 jours puis définitivement supprimées.
                </p>
              </div>
            </section>

            {/* Article 9 */}
            <section>
              <h2 className="text-xl font-bold text-white mb-4">9. Droit applicable</h2>
              <div className="text-gray-300 space-y-4">
                <p>
                  Les présentes CGU sont soumises au droit français.
                </p>
                <p>
                  Tout litige sera soumis à la compétence exclusive des tribunaux de Paris.
                </p>
              </div>
            </section>
          </div>

          {/* Contact */}
          <div className="mt-12 bg-cyan-500/20 border border-cyan-400/50 rounded-xl p-6">
            <h3 className="text-lg font-bold text-cyan-200 mb-4">Questions sur nos CGU ?</h3>
            <p className="text-cyan-300 mb-4">
              Notre équipe juridique est à votre disposition pour toute clarification.
            </p>
            <a 
              href="mailto:legal@omnia.sale"
              className="inline-flex items-center gap-2 bg-cyan-600 hover:bg-cyan-700 text-white px-4 py-2 rounded-xl transition-all"
            >
              <Mail className="w-4 h-4" />
              legal@omnia.sale
            </a>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
};