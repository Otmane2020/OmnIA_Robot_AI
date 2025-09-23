import React, { useState, useRef } from 'react';
import { Camera, Upload, QrCode, X, Loader2, Eye } from 'lucide-react';

interface PhotoUploadInterfaceProps {
  onPhotoAnalyzed: (analysis: string, imageUrl: string) => void;
  onClose: () => void;
}

export const PhotoUploadInterface: React.FC<PhotoUploadInterfaceProps> = ({ onPhotoAnalyzed, onClose }) => {
  const [showQRCode, setShowQRCode] = useState(false);
  const [uploadedImage, setUploadedImage] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const qrCodeUrl = `${window.location.origin}/photo-upload`;

  const handleFileUpload = async (file: File) => {
    if (!file.type.startsWith('image/')) {
      alert('Veuillez sélectionner une image valide');
      return;
    }

    // Créer une URL pour l'image
    const imageUrl = URL.createObjectURL(file);
    setUploadedImage(imageUrl);
    setIsAnalyzing(true);

    try {
      // Simuler l'analyse IA de l'image
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Analyse simulée basée sur le nom du fichier et contexte
      const fileName = file.name.toLowerCase();
      let analysis = '';
      
      if (fileName.includes('salon') || fileName.includes('living')) {
        analysis = `🏠 **Analyse de votre salon :**

**Espace détecté :** Salon moderne avec canapé existant
**Style :** Contemporain avec tons neutres
**Besoins identifiés :** Table basse manquante

**💡 Mes recommandations :**
• **Table AUREA Ø100cm** (499€) - Travertin naturel parfait avec votre style
• **Chaises INAYA** (99€) - Complément idéal en gris clair

**🎨 Conseil déco :** Ajoutez des coussins colorés pour réchauffer l'ambiance !`;
      } else if (fileName.includes('chambre') || fileName.includes('bedroom')) {
        analysis = `🛏️ **Analyse de votre chambre :**

**Espace détecté :** Chambre avec lit double
**Style :** Épuré et moderne
**Besoins identifiés :** Rangement et table de chevet

**💡 Mes recommandations :**
• **Commode moderne** - Pour optimiser le rangement
• **Tables de chevet assorties** - Harmonie parfaite

**🎨 Conseil déco :** Privilégiez des tons apaisants comme le beige ou gris !`;
      } else {
        analysis = `📸 **Analyse de votre espace :**

**Style détecté :** Moderne et épuré
**Ambiance :** Chaleureuse avec potentiel d'amélioration
**Opportunités :** Optimisation de l'aménagement

**💡 Mes recommandations personnalisées :**
• **Canapé ALYANA** (799€) - Convertible velours côtelé, parfait pour votre espace
• **Table AUREA** (499€) - Travertin naturel, apportera élégance et caractère

**🎨 Conseil d'expert :** L'harmonie des matériaux créera une ambiance cohérente !`;
      }

      onPhotoAnalyzed(analysis, imageUrl);
      
    } catch (error) {
      console.error('Erreur analyse photo:', error);
      alert('Erreur lors de l\'analyse de la photo');
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-slate-800/95 backdrop-blur-xl rounded-2xl p-6 max-w-md w-full border border-slate-600/50 shadow-2xl">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-bold text-white flex items-center gap-2">
            <Camera className="w-6 h-6 text-cyan-400" />
            Analyse photo IA
          </h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {!showQRCode ? (
          <div className="space-y-6">
            <div className="text-center">
              <div className="w-20 h-20 bg-gradient-to-br from-cyan-500/20 to-blue-600/20 rounded-2xl flex items-center justify-center mx-auto mb-4 border-2 border-dashed border-cyan-400/50">
                <Upload className="w-10 h-10 text-cyan-400" />
              </div>
              <p className="text-gray-300 mb-4">
                Envoyez-moi une photo de votre espace pour des conseils personnalisés
              </p>
            </div>

            <div className="space-y-4">
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) handleFileUpload(file);
                }}
                className="hidden"
              />
              
              <button
                onClick={() => fileInputRef.current?.click()}
                className="w-full bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white py-3 rounded-xl font-semibold transition-all flex items-center justify-center gap-2"
              >
                <Upload className="w-5 h-5" />
                Choisir une photo
              </button>

              <div className="text-center text-gray-400">ou</div>

              <button
                onClick={() => setShowQRCode(true)}
                className="w-full bg-purple-600 hover:bg-purple-700 text-white py-3 rounded-xl font-semibold transition-all flex items-center justify-center gap-2"
              >
                <QrCode className="w-5 h-5" />
                Scanner avec mobile
              </button>
            </div>

            {uploadedImage && (
              <div className="mt-6">
                {isAnalyzing ? (
                  <div className="text-center py-8">
                    <Loader2 className="w-12 h-12 text-cyan-400 animate-spin mx-auto mb-4" />
                    <p className="text-cyan-300 font-semibold">🤖 Analyse IA en cours...</p>
                    <p className="text-gray-400 text-sm">Détection style, couleurs, mobilier existant</p>
                  </div>
                ) : (
                  <div className="text-center">
                    <img 
                      src={uploadedImage} 
                      alt="Photo uploadée"
                      className="w-full h-48 object-cover rounded-xl mb-4"
                    />
                    <p className="text-green-300 font-semibold">✅ Photo analysée avec succès !</p>
                  </div>
                )}
              </div>
            )}
          </div>
        ) : (
          <div className="text-center space-y-6">
            <QrCode className="w-10 h-10 text-cyan-400" />
            <h4 className="text-lg font-bold text-white mb-2">📱 Scannez pour envoyer une photo</h4>
            <div className="w-48 h-48 bg-white rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg">
              <img 
                src={`https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent('https://omnia.sale/upload')}`}
                alt="QR Code"
                className="w-44 h-44 rounded-xl"
              />
            </div>
            <p className="text-gray-300 mb-4">
              Scannez ce QR code avec votre mobile pour envoyer une photo de votre espace
            </p>
            <div className="w-48 h-48 bg-white rounded-2xl flex items-center justify-center mx-auto shadow-lg">
              <img 
                src={`https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(qrCodeUrl)}`}
                alt="QR Code"
                className="w-44 h-44 rounded-xl"
              />
            </div>
            <div>
              <h4 className="text-lg font-bold text-white mb-2">📱 Scannez avec votre mobile</h4>
              <p className="text-gray-300 text-sm">
                Ouvrez l'appareil photo de votre téléphone et scannez ce QR code pour envoyer une photo
              </p>
            </div>
            <button
              onClick={() => setShowQRCode(false)}
              className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-xl transition-all"
            >
              Retour
            </button>
          </div>
        )}
      </div>
    </div>
  );
};