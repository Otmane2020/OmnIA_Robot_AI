import React, { useState, useEffect } from 'react';
import { Settings, Save, User, Bot, Palette, Globe, Shield, Bell, Trash2, AlertTriangle, RefreshCw } from 'lucide-react';
import { useNotifications } from './NotificationSystem';

interface Seller {
  id: string;
  email: string;
  company_name: string;
  subdomain: string;
  plan: string;
  status: string;
  contact_name: string;
  phone?: string;
  address?: string;
  city?: string;
  postal_code?: string;
  siret?: string;
  position?: string;
  avatar_url?: string;
}

interface SellerSettingsData {
  robot_name: string;
  robot_personality: 'commercial' | 'expert' | 'friendly';
  language: 'fr' | 'en' | 'es' | 'de';
  voice_provider: 'browser' | 'elevenlabs' | 'openai';
  voice_speed: number;
  theme_colors: {
    primary: string;
    secondary: string;
  };
  widget_position: 'bottom-right' | 'bottom-left';
  auto_training: boolean;
  // Informations vendeur éditables (depuis /register)
  company_name: string;
  contact_name: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  postal_code: string;
  siret: string;
  position: string;
}

interface SellerSettingsProps {
  seller: Seller;
  onUpdate: () => void;
}

export const SellerSettings: React.FC<SellerSettingsProps> = ({ seller, onUpdate }) => {
  const [settings, setSettings] = useState<SellerSettingsData>({
    robot_name: 'OmnIA',
    robot_personality: 'commercial',
    language: 'fr',
    voice_provider: 'browser',
    voice_speed: 1.0,
    theme_colors: {
      primary: '#0891b2',
      secondary: '#1e40af'
    },
    widget_position: 'bottom-right',
    auto_training: true,
    // Initialiser avec les données du vendeur (depuis /register)
    company_name: seller.company_name || '',
    contact_name: seller.contact_name || '',
    email: seller.email || '',
    phone: seller.phone || '',
    address: seller.address || '',
    city: seller.city || '',
    postal_code: seller.postal_code || '',
    siret: seller.siret || '',
    position: seller.position || ''
  });
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isResetting, setIsResetting] = useState(false);
  const { showSuccess, showError } = useNotifications();

  useEffect(() => {
    loadSellerSettings();
  }, [seller.id]);

  const loadSellerSettings = async () => {
    try {
      setIsLoading(true);
      
      const savedSettings = localStorage.getItem(`seller_${seller.id}_settings`);
      if (savedSettings) {
        try {
          const parsed = JSON.parse(savedSettings);
          setSettings(prev => ({ ...prev, ...parsed }));
          console.log('⚙️ Paramètres vendeur chargés depuis localStorage');
        } catch (error) {
          console.error('Erreur parsing paramètres:', error);
          console.log('⚙️ Utilisation des paramètres par défaut');
        }
      } else {
        console.log('⚙️ Nouveau vendeur - paramètres par défaut');
      }
      
    } catch (error) {
      console.error('❌ Erreur chargement paramètres:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSaveSettings = async () => {
    try {
      setIsSaving(true);
      
      // Sauvegarder les paramètres robot
      localStorage.setItem(`seller_${seller.id}_settings`, JSON.stringify(settings));
      
      // Mettre à jour les informations vendeur dans validated_retailers
      const validatedRetailers = JSON.parse(localStorage.getItem('validated_retailers') || '[]');
      const updatedRetailers = validatedRetailers.map((retailer: any) => 
        retailer.id === seller.id ? { 
          ...retailer, 
          company_name: settings.company_name,
          contact_name: settings.contact_name,
          email: settings.email,
          phone: settings.phone,
          address: settings.address,
          city: settings.city,
          postal_code: settings.postal_code,
          siret: settings.siret,
          position: settings.position
        } : retailer
      );
      localStorage.setItem('validated_retailers', JSON.stringify(updatedRetailers));
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      showSuccess('Paramètres sauvegardés', 'Vos paramètres ont été mis à jour avec succès.');
      onUpdate(); // Déclencher la mise à jour du vendeur dans App.tsx
      
    } catch (error) {
      console.error('❌ Erreur sauvegarde paramètres:', error);
      showError('Erreur de sauvegarde', 'Impossible de sauvegarder les paramètres.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleSettingChange = (key: string, value: any) => {
    setSettings(prev => ({ ...prev, [key]: value }));
  };

  const handleThemeColorChange = (colorKey: string, value: string) => {
    setSettings(prev => ({
      ...prev,
      theme_colors: {
        ...prev.theme_colors,
        [colorKey]: value
      }
    }));
  };

  const handleResetAllData = async () => {
    const confirmMessage = `⚠️ ATTENTION : Cette action va supprimer TOUTES vos données :

• Tous vos produits importés
• Historique des conversations
• Analytics et statistiques
• Paramètres personnalisés
• Données d'utilisation

Cette action est IRRÉVERSIBLE.

Êtes-vous absolument sûr de vouloir continuer ?`;

    if (!confirm(confirmMessage)) {
      return;
    }

    // Double confirmation pour sécurité
    const doubleConfirm = prompt(`Pour confirmer, tapez exactement : RESET

Cela supprimera définitivement toutes vos données.`);

    if (doubleConfirm !== 'RESET') {
      showError('Réinitialisation annulée', 'Confirmation incorrecte. Aucune donnée n\'a été supprimée.');
      return;
    }

    setIsResetting(true);

    try {
      console.log('🗑️ RÉINITIALISATION COMPLÈTE pour vendeur:', seller.id);

      // Liste de toutes les clés localStorage à supprimer pour ce vendeur
      const keysToRemove = [
        `seller_${seller.id}_products`,
        `seller_${seller.id}_conversations`,
        `seller_${seller.id}_analytics_1d`,
        `seller_${seller.id}_analytics_7d`,
        `seller_${seller.id}_analytics_30d`,
        `seller_${seller.id}_usage`,
        `seller_${seller.id}_settings`,
        `seller_${seller.id}_enriched_products`,
        `vendor_${seller.id}_products`,
        `vendor_${seller.id}_enriched_products`
      ];

      // Supprimer toutes les données du vendeur
      keysToRemove.forEach(key => {
        localStorage.removeItem(key);
        console.log('🗑️ Supprimé:', key);
      });

      // Simuler le processus de réinitialisation
      await new Promise(resolve => setTimeout(resolve, 2000));

      showSuccess(
        'Réinitialisation terminée',
        'Toutes vos données ont été supprimées. Votre compte est maintenant vierge et prêt pour un nouveau démarrage.',
        [
          {
            label: 'Recharger la page',
            action: () => window.location.reload(),
            variant: 'primary'
          }
        ]
      );

      // Recharger automatiquement après 3 secondes
      setTimeout(() => {
        window.location.reload();
      }, 3000);

    } catch (error) {
      console.error('❌ Erreur réinitialisation:', error);
      showError('Erreur de réinitialisation', 'Impossible de réinitialiser les données.');
    } finally {
      setIsResetting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-cyan-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-white text-lg">Chargement des paramètres...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-white">Paramètres</h2>
          <p className="text-gray-300">Configuration de votre compte et robot IA</p>
        </div>
        
        <button
          onClick={handleSaveSettings}
          disabled={isSaving}
          className="bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-400 hover:to-emerald-500 disabled:from-gray-600 disabled:to-gray-700 text-white px-6 py-3 rounded-xl font-semibold transition-all disabled:cursor-not-allowed flex items-center gap-2"
        >
          {isSaving ? (
            <>
              <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
              Sauvegarde...
            </>
          ) : (
            <>
              <Save className="w-5 h-5" />
              Sauvegarder
            </>
          )}
        </button>
      </div>

      {/* Account Information */}
      <div className="bg-white/10 backdrop-blur-xl rounded-2xl p-8 border border-white/20">
        <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
          <User className="w-6 h-6 text-cyan-400" />
          Informations du Compte (depuis /register)
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm text-gray-300 mb-2">Nom de l'entreprise</label>
            <input
              type="text"
              value={settings.company_name}
              onChange={(e) => handleSettingChange('company_name', e.target.value)}
              className="w-full bg-black/40 border border-cyan-500/50 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-cyan-400"
              placeholder="Nom de votre entreprise"
            />
          </div>
          <div>
            <label className="block text-sm text-gray-300 mb-2">Contact principal</label>
            <input
              type="text"
              value={settings.contact_name}
              onChange={(e) => handleSettingChange('contact_name', e.target.value)}
              className="w-full bg-black/40 border border-cyan-500/50 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-cyan-400"
              placeholder="Nom du responsable"
            />
          </div>
          <div>
            <label className="block text-sm text-gray-300 mb-2">Email professionnel</label>
            <input
              type="email"
              value={settings.email}
              onChange={(e) => handleSettingChange('email', e.target.value)}
              className="w-full bg-black/40 border border-cyan-500/50 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-cyan-400"
              placeholder="contact@monentreprise.fr"
            />
          </div>
          <div>
            <label className="block text-sm text-gray-300 mb-2">Téléphone</label>
            <input
              type="tel"
              value={settings.phone}
              onChange={(e) => handleSettingChange('phone', e.target.value)}
              placeholder="+33 1 23 45 67 89"
              className="w-full bg-black/40 border border-cyan-500/50 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-cyan-400"
            />
          </div>
          <div>
            <label className="block text-sm text-gray-300 mb-2">Adresse</label>
            <input
              type="text"
              value={settings.address}
              onChange={(e) => handleSettingChange('address', e.target.value)}
              placeholder="123 Rue de la Paix"
              className="w-full bg-black/40 border border-cyan-500/50 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-cyan-400"
            />
          </div>
          <div>
            <label className="block text-sm text-gray-300 mb-2">Ville</label>
            <input
              type="text"
              value={settings.city}
              onChange={(e) => handleSettingChange('city', e.target.value)}
              placeholder="Paris"
              className="w-full bg-black/40 border border-cyan-500/50 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-cyan-400"
            />
          </div>
          <div>
            <label className="block text-sm text-gray-300 mb-2">Code postal</label>
            <input
              type="text"
              value={settings.postal_code}
              onChange={(e) => handleSettingChange('postal_code', e.target.value)}
              placeholder="75001"
              className="w-full bg-black/40 border border-cyan-500/50 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-cyan-400"
            />
          </div>
          <div>
            <label className="block text-sm text-gray-300 mb-2">SIRET</label>
            <input
              type="text"
              value={settings.siret}
              onChange={(e) => handleSettingChange('siret', e.target.value)}
              placeholder="12345678901234"
              className="w-full bg-black/40 border border-cyan-500/50 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-cyan-400"
            />
          </div>
          <div>
            <label className="block text-sm text-gray-300 mb-2">Fonction</label>
            <input
              type="text"
              value={settings.position}
              onChange={(e) => handleSettingChange('position', e.target.value)}
              placeholder="Directeur, Gérant..."
              className="w-full bg-black/40 border border-cyan-500/50 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-cyan-400"
            />
          </div>
        </div>
        
        <div className="mt-6">
          <button
            onClick={handleSaveSettings}
            disabled={isSaving}
            className="bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-400 hover:to-emerald-500 disabled:from-gray-600 disabled:to-gray-700 text-white px-6 py-3 rounded-xl font-semibold transition-all disabled:cursor-not-allowed flex items-center gap-2"
          >
            {isSaving ? (
              <>
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                Sauvegarde...
              </>
            ) : (
              <>
                <Save className="w-5 h-5" />
                Sauvegarder les informations
              </>
            )}
          </button>
        </div>
      </div>

      {/* Robot Configuration */}
      <div className="bg-white/10 backdrop-blur-xl rounded-2xl p-8 border border-white/20">
        <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
          <Bot className="w-6 h-6 text-purple-400" />
          Configuration Robot IA
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm text-gray-300 mb-2">Nom du robot</label>
            <input
              type="text"
              value={settings.robot_name}
              onChange={(e) => handleSettingChange('robot_name', e.target.value)}
              className="w-full bg-black/40 border border-cyan-500/50 rounded-xl px-4 py-3 text-white"
            />
          </div>
          
          <div>
            <label className="block text-sm text-gray-300 mb-2">Personnalité</label>
            <select
              value={settings.robot_personality}
              onChange={(e) => handleSettingChange('robot_personality', e.target.value)}
              className="w-full bg-black/40 border border-cyan-500/50 rounded-xl px-4 py-3 text-white"
            >
              <option value="commercial">Commercial & Amical</option>
              <option value="expert">Expert Technique</option>
              <option value="friendly">Conseiller Déco</option>
            </select>
          </div>
          
          <div>
            <label className="block text-sm text-gray-300 mb-2">Langue</label>
            <select
              value={settings.language}
              onChange={(e) => handleSettingChange('language', e.target.value)}
              className="w-full bg-black/40 border border-cyan-500/50 rounded-xl px-4 py-3 text-white"
            >
              <option value="fr">Français</option>
              <option value="en">English</option>
              <option value="es">Español</option>
              <option value="de">Deutsch</option>
            </select>
          </div>
          
          <div>
            <label className="block text-sm text-gray-300 mb-2">Fournisseur de voix</label>
            <select
              value={settings.voice_provider}
              onChange={(e) => handleSettingChange('voice_provider', e.target.value)}
              className="w-full bg-black/40 border border-cyan-500/50 rounded-xl px-4 py-3 text-white"
            >
              <option value="browser">Navigateur (Gratuit)</option>
              <option value="elevenlabs">ElevenLabs (Premium)</option>
              <option value="openai">OpenAI (Premium)</option>
            </select>
          </div>
          
          <div>
            <label className="block text-sm text-gray-300 mb-2">Vitesse de parole: {settings.voice_speed}x</label>
            <input
              type="range"
              min="0.5"
              max="2"
              step="0.1"
              value={settings.voice_speed}
              onChange={(e) => handleSettingChange('voice_speed', parseFloat(e.target.value))}
              className="w-full"
            />
          </div>
          
          <div>
            <label className="block text-sm text-gray-300 mb-2">Position du widget</label>
            <select
              value={settings.widget_position}
              onChange={(e) => handleSettingChange('widget_position', e.target.value)}
              className="w-full bg-black/40 border border-cyan-500/50 rounded-xl px-4 py-3 text-white"
            >
              <option value="bottom-right">Bas droite</option>
              <option value="bottom-left">Bas gauche</option>
            </select>
          </div>
        </div>
        
        <div className="mt-6">
          <label className="flex items-center gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={settings.auto_training}
              onChange={(e) => handleSettingChange('auto_training', e.target.checked)}
              className="w-5 h-5 text-cyan-600 bg-gray-800 border-gray-600 rounded focus:ring-cyan-500"
            />
            <span className="text-white">Entraînement automatique quotidien</span>
          </label>
          <p className="text-gray-400 text-sm mt-1 ml-8">
            Le robot s'entraîne automatiquement chaque nuit avec vos nouveaux produits
          </p>
        </div>
      </div>

      {/* Theme Configuration */}
      <div className="bg-white/10 backdrop-blur-xl rounded-2xl p-8 border border-white/20">
        <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
          <Palette className="w-6 h-6 text-pink-400" />
          Thème et Apparence
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm text-gray-300 mb-2">Couleur principale</label>
            <div className="flex gap-3">
              <input
                type="color"
                value={settings.theme_colors.primary}
                onChange={(e) => handleThemeColorChange('primary', e.target.value)}
                className="w-12 h-12 rounded-xl border border-gray-600"
              />
              <input
                type="text"
                value={settings.theme_colors.primary}
                onChange={(e) => handleThemeColorChange('primary', e.target.value)}
                className="flex-1 bg-black/40 border border-cyan-500/50 rounded-xl px-4 py-3 text-white font-mono"
              />
            </div>
          </div>
          
          <div>
            <label className="block text-sm text-gray-300 mb-2">Couleur secondaire</label>
            <div className="flex gap-3">
              <input
                type="color"
                value={settings.theme_colors.secondary}
                onChange={(e) => handleThemeColorChange('secondary', e.target.value)}
                className="w-12 h-12 rounded-xl border border-gray-600"
              />
              <input
                type="text"
                value={settings.theme_colors.secondary}
                onChange={(e) => handleThemeColorChange('secondary', e.target.value)}
                className="flex-1 bg-black/40 border border-cyan-500/50 rounded-xl px-4 py-3 text-white font-mono"
              />
            </div>
          </div>
        </div>
        
        {/* Theme Preview */}
        <div className="mt-6 p-4 bg-black/20 rounded-xl">
          <h4 className="text-white font-semibold mb-3">Aperçu du thème :</h4>
          <div className="flex gap-4">
            <div 
              className="w-16 h-16 rounded-xl flex items-center justify-center text-white font-bold"
              style={{ backgroundColor: settings.theme_colors.primary }}
            >
              Bot
            </div>
            <div 
              className="w-16 h-16 rounded-xl flex items-center justify-center text-white font-bold"
              style={{ backgroundColor: settings.theme_colors.secondary }}
            >
              UI
            </div>
          </div>
        </div>
      </div>

      {/* Widget Code */}
      <div className="bg-white/10 backdrop-blur-xl rounded-2xl p-8 border border-white/20">
        <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
          <Globe className="w-6 h-6 text-green-400" />
          Code d'Intégration Widget
        </h3>
        
        <div className="bg-black/40 rounded-xl p-4 border border-cyan-500/30">
          <code className="text-cyan-400 text-sm block whitespace-pre">
{`<!-- Widget OmnIA pour ${seller.company_name} -->
<script src="https://widget.omnia.sale/embed.js"></script>
<div id="omnia-chat" 
     data-seller="${seller.subdomain}"
     data-theme-primary="${settings.theme_colors.primary}"
     data-theme-secondary="${settings.theme_colors.secondary}"
     data-position="${settings.widget_position}"
     data-language="${settings.language}">
</div>`}
          </code>
        </div>
        
        <div className="mt-4 flex gap-4">
          <button
            onClick={() => {
              const code = `<script src="https://widget.omnia.sale/embed.js"></script>\n<div id="omnia-chat" data-seller="${seller.subdomain}"></div>`;
              navigator.clipboard.writeText(code);
              showSuccess('Code copié', 'Le code widget a été copié dans le presse-papiers.');
            }}
            className="bg-cyan-600 hover:bg-cyan-700 text-white px-4 py-2 rounded-xl transition-all"
          >
            Copier le code
          </button>
          
          <button
            onClick={() => window.open(`/robot/${seller.subdomain}`, '_blank')}
            className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-xl transition-all"
          >
            Tester le widget
          </button>
        </div>
      </div>

      {/* Security Settings */}
      <div className="bg-white/10 backdrop-blur-xl rounded-2xl p-8 border border-white/20">
        <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
          <Shield className="w-6 h-6 text-red-400" />
          Sécurité
        </h3>
        
        <div className="space-y-4">
          <div className="bg-yellow-500/20 border border-yellow-400/50 rounded-xl p-4">
            <h4 className="font-semibold text-yellow-200 mb-2">🔐 Changement de mot de passe</h4>
            <p className="text-yellow-300 text-sm mb-4">
              Pour changer votre mot de passe, contactez notre support à support@omnia.sale
            </p>
            <button className="bg-yellow-600 hover:bg-yellow-700 text-white px-4 py-2 rounded-xl text-sm">
              Contacter le support
            </button>
          </div>
          
          <div className="bg-red-500/20 border border-red-400/50 rounded-xl p-4">
            <h4 className="font-semibold text-red-200 mb-2">⚠️ Suppression du compte</h4>
            <p className="text-red-300 text-sm mb-4">
              La suppression du compte est irréversible et supprimera toutes vos données
            </p>
            <button className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-xl text-sm">
              Demander la suppression
            </button>
          </div>
        </div>
      </div>

      {/* Data Management */}
      <div className="bg-white/10 backdrop-blur-xl rounded-2xl p-8 border border-white/20">
        <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
          <RefreshCw className="w-6 h-6 text-orange-400" />
          Gestion des Données
        </h3>
        
        <div className="space-y-4">
          <div className="bg-orange-500/20 border border-orange-400/50 rounded-xl p-4">
            <h4 className="font-semibold text-orange-200 mb-2 flex items-center gap-2">
              <AlertTriangle className="w-5 h-5" />
              Réinitialisation Complète du Compte
            </h4>
            <p className="text-orange-300 text-sm mb-4">
              Supprime TOUTES vos données : produits, conversations, analytics, paramètres.
              Votre compte repartira de zéro comme un nouveau vendeur.
            </p>
            <div className="bg-red-500/20 border border-red-400/30 rounded-lg p-3 mb-4">
              <h5 className="font-semibold text-red-200 mb-2">⚠️ Données qui seront supprimées :</h5>
              <ul className="text-red-300 text-xs space-y-1">
                <li>• Catalogue produits importés</li>
                <li>• Historique des conversations</li>
                <li>• Analytics et statistiques</li>
                <li>• Paramètres robot personnalisés</li>
                <li>• Données d'utilisation et métriques</li>
                <li>• Produits enrichis par IA</li>
              </ul>
            </div>
            <button
              onClick={handleResetAllData}
              disabled={isResetting}
              className="bg-red-600 hover:bg-red-700 disabled:bg-red-800 text-white px-6 py-3 rounded-xl font-semibold transition-all disabled:cursor-not-allowed flex items-center gap-2"
            >
              {isResetting ? (
                <>
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                  Réinitialisation...
                </>
              ) : (
                <>
                  <Trash2 className="w-5 h-5" />
                  Réinitialiser Toutes les Données
                </>
              )}
            </button>
          </div>
          
          <div className="bg-blue-500/20 border border-blue-400/50 rounded-xl p-4">
            <h4 className="font-semibold text-blue-200 mb-2">💡 Cas d'usage de la réinitialisation :</h4>
            <ul className="text-blue-300 text-sm space-y-1">
              <li>• Nouveau démarrage avec un catalogue différent</li>
              <li>• Test de nouvelles configurations</li>
              <li>• Nettoyage après des tests de développement</li>
              <li>• Résolution de problèmes de données corrompues</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};