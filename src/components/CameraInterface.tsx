import React, { useEffect, useRef, useState } from 'react';
import { Camera, X, Eye, EyeOff, Users, Zap } from 'lucide-react';

interface CameraInterfaceProps {
  onClose: () => void;
  onPersonDetected: () => void;
}

export const CameraInterface: React.FC<CameraInterfaceProps> = ({ onClose, onPersonDetected }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isActive, setIsActive] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [personDetected, setPersonDetected] = useState(false);
  const [detectionCount, setDetectionCount] = useState(0);

  useEffect(() => {
    startCamera();
    return () => {
      stopCamera();
    };
  }, []);

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { 
          width: { ideal: 1280 },
          height: { ideal: 720 },
          facingMode: 'user'
        } 
      });
      
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        setIsActive(true);
        
        // Simuler la détection de personne après 3 secondes
        setTimeout(() => {
          setPersonDetected(true);
          setDetectionCount(1);
          onPersonDetected();
          
          // Continuer la détection périodique
          const detectionInterval = setInterval(() => {
            setDetectionCount(prev => prev + 1);
          }, 5000);
          
          // Nettoyer l'intervalle après 30 secondes
          setTimeout(() => {
            clearInterval(detectionInterval);
          }, 30000);
        }, 3000);
      }
    } catch (error) {
      console.error('❌ Erreur accès caméra:', error);
      setError('Impossible d\'accéder à la caméra. Vérifiez les permissions dans votre navigateur.');
    }
  };

  const stopCamera = () => {
    if (videoRef.current && videoRef.current.srcObject) {
      const stream = videoRef.current.srcObject as MediaStream;
      stream.getTracks().forEach(track => track.stop());
      videoRef.current.srcObject = null;
    }
    setIsActive(false);
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-slate-800/95 backdrop-blur-xl rounded-2xl p-6 max-w-3xl w-full border border-slate-600/50 shadow-2xl">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-bold text-white flex items-center gap-2">
            <Camera className="w-6 h-6 text-green-400" />
            Vision Robot OmnIA
          </h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {error ? (
          <div className="text-center py-8">
            <Camera className="w-16 h-16 text-red-400 mx-auto mb-4" />
            <h4 className="text-lg font-semibold text-white mb-2">Erreur caméra</h4>
            <p className="text-red-300 mb-4">{error}</p>
            <div className="space-y-2 text-sm text-gray-300">
              <p>💡 Pour activer la caméra :</p>
              <p>1. Cliquez sur l'icône 🔒 dans la barre d'adresse</p>
              <p>2. Autorisez l'accès à la caméra</p>
              <p>3. Rechargez la page</p>
            </div>
            <button
              onClick={onClose}
              className="mt-4 bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-xl"
            >
              Fermer
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="relative rounded-xl overflow-hidden bg-gray-900">
              <video
                ref={videoRef}
                autoPlay
                playsInline
                muted
                className="w-full h-80 object-cover"
              />
              
              {/* Overlay de détection */}
              <div className="absolute inset-0 flex items-center justify-center">
                {!isActive && (
                  <div className="text-white text-center">
                    <Camera className="w-12 h-12 mx-auto mb-2 animate-pulse" />
                    <p>Activation de la caméra...</p>
                  </div>
                )}
                
                {personDetected && (
                  <div className="absolute top-4 left-4 bg-green-500/90 text-white px-4 py-2 rounded-lg flex items-center gap-2 shadow-lg">
                    <Users className="w-4 h-4" />
                    <span className="text-sm font-semibold">Personne détectée ({detectionCount})</span>
                  </div>
                )}
                
                {isActive && (
                  <div className="absolute top-4 right-4 bg-blue-500/90 text-white px-4 py-2 rounded-lg flex items-center gap-2 shadow-lg">
                    <Eye className="w-4 h-4" />
                    <span className="text-sm font-semibold">Vision active</span>
                  </div>
                )}
              </div>
              
              {/* Grille de détection */}
              <div className="absolute inset-0 pointer-events-none">
                <div className="w-full h-full border-2 border-cyan-400/30 rounded-xl"></div>
                <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-40 h-40 border-2 border-green-400/50 rounded-full animate-pulse"></div>
                
                {/* Points de détection */}
                <div className="absolute top-1/4 left-1/4 w-2 h-2 bg-cyan-400 rounded-full animate-ping"></div>
                <div className="absolute top-1/4 right-1/4 w-2 h-2 bg-cyan-400 rounded-full animate-ping" style={{ animationDelay: '0.5s' }}></div>
                <div className="absolute bottom-1/4 left-1/4 w-2 h-2 bg-cyan-400 rounded-full animate-ping" style={{ animationDelay: '1s' }}></div>
                <div className="absolute bottom-1/4 right-1/4 w-2 h-2 bg-cyan-400 rounded-full animate-ping" style={{ animationDelay: '1.5s' }}></div>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className={`w-3 h-3 rounded-full ${isActive ? 'bg-green-400 animate-pulse' : 'bg-gray-400'}`}></div>
                <span className="text-white text-sm">
                  {isActive ? 'Vision robot active - Détection en cours' : 'Vision robot inactive'}
                </span>
              </div>
              
              <button
                onClick={onClose}
                className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-xl transition-all"
              >
                Fermer
              </button>
            </div>

            <div className="bg-blue-500/20 border border-blue-400/50 rounded-xl p-4">
              <h4 className="font-semibold text-blue-200 mb-2 flex items-center gap-2">
                <Zap className="w-4 h-4" />
                🤖 Capacités Vision Robot :
              </h4>
              <ul className="text-blue-300 text-sm space-y-1">
                <li>• Détection automatique des visiteurs</li>
                <li>• Salutation personnalisée à l'arrivée</li>
                <li>• Analyse de l'espace et des besoins</li>
                <li>• Recommandations basées sur l'observation</li>
                <li>• Suivi des mouvements dans le showroom</li>
              </ul>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};