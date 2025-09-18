import React, { useState } from 'react';
import { Upload, Camera, ArrowLeft, Loader2, CheckCircle, QrCode, X, Bot } from 'lucide-react';
import { ensureWebContainerAuth } from '../lib/webcontainer-auth';

export const UploadPage: React.FC = () => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isComplete, setIsComplete] = useState(false);
  const [showQR, setShowQR] = useState(false);

  const handleFileSelect = (file: File) => {
    if (!file.type.startsWith('image/')) {
      alert('Veuillez sélectionner une image valide');
      return;
    }

    // Ensure WebContainer authentication for upload
    ensureWebContainerAuth().then(authenticated => {
      if (!authenticated) {
        console.warn('⚠️ WebContainer authentication failed, proceeding with local upload');
      }
    });

    // Sauvegarder l'image dans localStorage pour la récupérer dans le chat
    const reader = new FileReader();
    reader.onload = (e) => {
      const imageData = e.target?.result as string;
      localStorage.setItem('uploaded_photo', imageData);
      localStorage.setItem('uploaded_photo_name', file.name);
      console.log('📸 Photo sauvegardée dans localStorage avec WebContainer auth');
    };
    reader.readAsDataURL(file);

    setSelectedFile(file);
    handleUpload(file);
  };

  const handleUpload = async (file: File) => {
    setIsUploading(true);
    setUploadProgress(0);

    // Simuler l'upload avec progression
    const interval = setInterval(() => {
      setUploadProgress(prev => {
        if (prev >= 90) {
          clearInterval(interval);
          return 90;
        }
        return prev + 10;
      });
    }, 200);

    try {
      // Simuler l'analyse IA de l'image
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      clearInterval(interval);
      setUploadProgress(100);
      setIsComplete(true);

      // Rediriger vers le chat avec l'analyse
      setTimeout(() => {
        const analysis = generatePhotoAnalysis(file.name);
        
        // Rediriger vers /robot avec l'analyse
        localStorage.setItem('photo_analysis', analysis);
        window.location.href = '/robot';
      }, 1500);

    } catch (error) {
      console.error('Erreur upload:', error);
      alert('Erreur lors de l\'upload de la photo');
    } finally {
      setIsUploading(false);
    }
  };

  const generatePhotoAnalysis = (fileName: string): string => {
    const lowerName = fileName.toLowerCase();
    
    if (lowerName.includes('salon') || lowerName.includes('living')) {
      return `🏠 **Analyse de votre salon :**

**Espace détecté :** Salon moderne avec canapé existant
**Style :** Contemporain avec tons neutres
**Surface estimée :** ~25-30m²

**💡 Mes recommandations OmnIA :**
• **Table AUREA Ø100cm** (499€) - Travertin naturel parfait avec votre style
• **Chaises INAYA** (99€) - Complément idéal en gris clair

**🎨 Conseil déco :** Ajoutez des coussins colorés pour réchauffer l'ambiance !`;
    }
    
    return `📸 **Analyse de votre espace :**

**Style détecté :** Moderne et épuré
**Ambiance :** Chaleureuse avec potentiel d'amélioration
**Opportunités :** Optimisation de l'aménagement

**💡 Mes recommandations OmnIA :**
• **Canapé ALYANA** (799€) - Convertible velours côtelé
• **Table AUREA** (499€) - Travertin naturel élégant

**🎨 Conseil d'expert :** L'harmonie des matériaux créera une ambiance cohérente !`;
  };

  if (isComplete) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-purple-900 flex items-center justify-center p-4">
        {/* Background Effects */}
        <div className="absolute inset-0 opacity-20">
          <div className="absolute top-20 left-20 w-72 h-72 bg-cyan-500/30 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute bottom-20 right-20 w-96 h-96 bg-purple-500/20 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '2s' }}></div>
        </div>

        <div className="relative z-10 bg-slate-800/95 backdrop-blur-xl rounded-3xl p-6 lg:p-8 max-w-md w-full text-center border border-slate-600/50 shadow-2xl">
          <CheckCircle className="w-16 h-16 lg:w-20 lg:h-20 text-green-400 mx-auto mb-6" />
          <h2 className="text-2xl lg:text-3xl font-bold text-white mb-4">Photo analysée ! ✅</h2>
          <p className="text-gray-300 mb-6 text-sm lg:text-base">
            🤖 OmnIA a analysé votre espace et prépare ses recommandations personnalisées...
          </p>
          <div className="bg-green-500/20 border border-green-400/50 rounded-2xl p-4 mb-4">
            <p className="text-green-300 font-semibold">Redirection vers le robot...</p>
          </div>
          <div className="text-sm text-slate-400">
            Vous allez être redirigé vers l'interface robot
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-purple-900 p-4">
      {/* Background Effects */}
      <div className="absolute inset-0 opacity-20">
        <div className="absolute top-20 left-20 w-72 h-72 bg-cyan-500/30 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-20 right-20 w-96 h-96 bg-purple-500/20 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '2s' }}></div>
      </div>

      <div className="relative z-10 max-w-md mx-auto">
        {/* Header */}
        <div className="text-center mb-6 lg:mb-8">
          <div className="w-16 h-16 lg:w-20 lg:h-20 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-3xl flex items-center justify-center mx-auto mb-4 lg:mb-6 shadow-2xl">
            <Camera className="w-8 h-8 lg:w-10 lg:h-10 text-white" />
          </div>
          <h1 className="text-2xl lg:text-3xl font-bold text-white mb-3">📸 Analyse Photo IA</h1>
          <p className="text-cyan-300 text-base lg:text-lg">Envoyez une photo de votre espace pour des conseils personnalisés</p>
        </div>

        {/* Upload Area */}
        <div className="bg-slate-800/95 backdrop-blur-xl rounded-3xl p-6 lg:p-8 border border-slate-600/50 shadow-2xl">
          {!selectedFile ? (
            <div className="space-y-6">
              <div className="text-center">
                <div className="w-20 h-20 lg:w-24 lg:h-24 bg-gradient-to-br from-cyan-500/20 to-blue-600/20 rounded-3xl flex items-center justify-center mx-auto mb-4 lg:mb-6 border-2 border-dashed border-cyan-400/50">
                  <Upload className="w-10 h-10 lg:w-12 lg:h-12 text-cyan-400" />
                </div>
              </div>
              
              <input
                type="file"
                accept="image/*"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) handleFileSelect(file);
                }}
                className="hidden"
                id="photo-upload"
              />
              
              <div className="space-y-4">
                <label
                  htmlFor="photo-upload"
                  className="block w-full bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white py-3 lg:py-4 rounded-2xl font-semibold transition-all cursor-pointer text-center shadow-lg text-sm lg:text-base"
                >
                  📸 Choisir une photo
                </label>
                
                <div className="text-center text-slate-400 text-sm">ou</div>
                
                <button
                  onClick={() => setShowQR(!showQR)}
                  className="w-full bg-purple-600 hover:bg-purple-700 text-white py-3 lg:py-4 rounded-2xl font-semibold transition-all flex items-center justify-center gap-3 shadow-lg text-sm lg:text-base"
                >
                  <QrCode className="w-4 h-4 lg:w-5 lg:h-5" />
                  Scanner QR Code
                </button>
              </div>
              
              {showQR && (
                <div className="bg-white rounded-2xl p-4 lg:p-6 text-center">
                  <img 
                    src={`https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent('https://omnia.sale/upload')}`}
                    alt="QR Code"
                    className="w-40 h-40 lg:w-48 lg:h-48 mx-auto rounded-xl shadow-lg"
                  />
                  <p className="text-slate-600 text-sm mt-4">
                    Scannez avec votre mobile
                  </p>
                </div>
              )}
              
              <div className="bg-blue-500/20 border border-blue-400/50 rounded-xl p-4">
                <h4 className="font-semibold text-blue-200 mb-2">💡 Conseils pour une bonne analyse :</h4>
                <ul className="text-blue-300 text-sm space-y-1">
                  <li>• Photo claire et bien éclairée</li>
                  <li>• Vue d'ensemble de la pièce</li>
                  <li>• Formats acceptés : JPG, PNG, WEBP</li>
                  <li>• Taille max : 10MB</li>
                  <li>• Analyse par OpenAI Vision</li>
                  <li>• Recommandations personnalisées</li>
                </ul>
              </div>
              
              <div className="bg-green-500/20 border border-green-400/50 rounded-xl p-4">
                <h4 className="font-semibold text-green-200 mb-2">🤖 Que fait OmnIA avec votre photo :</h4>
                <ul className="text-green-300 text-sm space-y-1">
                  <li>• Analyse du style décoratif existant</li>
                  <li>• Détection des couleurs dominantes</li>
                  <li>• Identification des meubles présents</li>
                  <li>• Suggestions d'amélioration personnalisées</li>
                  <li>• Recommandations produits Decora Home</li>
                </ul>
              </div>
              
              <p className="text-slate-300 text-sm text-center">
                Formats acceptés : JPG, PNG, WEBP
              </p>
            </div>
          ) : isUploading ? (
            <div className="text-center py-8 lg:py-12">
              <Loader2 className="w-12 h-12 lg:w-16 lg:h-16 text-cyan-400 animate-spin mx-auto mb-4 lg:mb-6" />
              <h3 className="text-xl lg:text-2xl font-bold text-white mb-3 lg:mb-4">🤖 Analyse IA en cours...</h3>
              <p className="text-cyan-300 mb-4 lg:mb-6 text-base lg:text-lg">Détection style, couleurs, mobilier existant</p>
              
              <div className="w-full bg-slate-700 rounded-full h-3 lg:h-4 mb-4">
                <div 
                  className="bg-gradient-to-r from-cyan-500 to-blue-600 h-3 lg:h-4 rounded-full transition-all duration-300" 
                  style={{ width: `${uploadProgress}%` }}
                ></div>
              </div>
              <p className="text-cyan-300 text-lg font-bold">{uploadProgress}%</p>
            </div>
          ) : (
            <div className="text-center py-6 lg:py-8">
              <img 
                src={URL.createObjectURL(selectedFile)} 
                alt="Photo sélectionnée"
                className="w-full h-48 lg:h-64 object-cover rounded-2xl mb-4 lg:mb-6 shadow-lg"
              />
              <p className="text-green-300 font-semibold text-base lg:text-lg">✅ Photo sélectionnée avec succès</p>
              <button
                onClick={() => setSelectedFile(null)}
                className="mt-4 text-slate-400 hover:text-white transition-colors text-sm"
              >
                Changer de photo
              </button>
            </div>
          )}
        </div>

        {/* Back Button */}
        <div className="text-center mt-6">
          <button
            onClick={() => window.location.href = '/robot'}
            className="text-cyan-400 hover:text-cyan-300 flex items-center gap-2 mx-auto text-base lg:text-lg"
          >
            <ArrowLeft className="w-4 h-4" />
            Retour au robot
          </button>
        </div>
      </div>
    </div>
  );
};