import React, { useState, useEffect } from 'react';
import { Bot, Zap, Heart, Music, Move, Battery } from 'lucide-react';

interface RobotAvatarProps {
  mood: 'sleeping' | 'neutral' | 'happy' | 'thinking' | 'speaking' | 'dancing' | 'moving';
  isListening?: boolean;
  isSpeaking?: boolean;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  isTyping?: boolean;
  isMoving?: boolean;
  isDancing?: boolean;
  battery?: number;
  position?: { x: number; y: number; rotation: number };
}

export const RobotAvatar: React.FC<RobotAvatarProps> = ({ 
  mood, 
  isListening = false, 
  isSpeaking = false,
  size = 'lg',
  isTyping = false,
  isMoving = false,
  isDancing = false,
  battery = 100,
  position = { x: 0, y: 0, rotation: 0 }
}) => {
  const [eyeBlink, setEyeBlink] = useState(0);
  const [mouthAnimation, setMouthAnimation] = useState(0);
  const [danceStep, setDanceStep] = useState(0);
  const [walkCycle, setWalkCycle] = useState(0);

  useEffect(() => {
    // Animation de clignement des yeux
    const blinkInterval = setInterval(() => {
      setEyeBlink(1);
      setTimeout(() => setEyeBlink(0), 150);
    }, 3000 + Math.random() * 2000);

    // Animation de la bouche quand il parle
    let mouthInterval: NodeJS.Timeout;
    if (isSpeaking) {
      mouthInterval = setInterval(() => {
        setMouthAnimation(prev => (prev + 1) % 4);
      }, 200);
    } else {
      setMouthAnimation(0);
    }

    // Animation de danse
    let danceInterval: NodeJS.Timeout;
    if (isDancing) {
      danceInterval = setInterval(() => {
        setDanceStep(prev => (prev + 1) % 8);
      }, 300);
    }

    // Animation de marche
    let walkInterval: NodeJS.Timeout;
    if (isMoving) {
      walkInterval = setInterval(() => {
        setWalkCycle(prev => (prev + 1) % 4);
      }, 200);
    }

    return () => {
      clearInterval(blinkInterval);
      if (mouthInterval) clearInterval(mouthInterval);
      if (danceInterval) clearInterval(danceInterval);
      if (walkInterval) clearInterval(walkInterval);
    };
  }, [isSpeaking, isDancing, isMoving]);

  const sizeClasses = {
    sm: 'w-12 h-12',
    md: 'w-16 h-16', 
    lg: 'w-20 h-20',
    xl: 'w-24 h-24'
  };

  const getGlowEffect = () => {
    if (isDancing) return 'shadow-pink-500/50 animate-pulse';
    if (isMoving) return 'shadow-blue-500/50 animate-pulse';
    if (isSpeaking) return 'shadow-green-500/50 animate-pulse';
    if (isListening) return 'shadow-red-500/50 animate-pulse';
    if (mood === 'thinking') return 'shadow-yellow-500/50';
    return 'shadow-cyan-500/50';
  };

  const getRobotTransform = () => {
    let transform = `rotate(${position.rotation}deg)`;
    
    if (isDancing) {
      const danceX = Math.sin(danceStep * 0.5) * 5;
      const danceY = Math.cos(danceStep * 0.7) * 3;
      const danceRotation = Math.sin(danceStep * 0.3) * 10;
      transform += ` translate(${danceX}px, ${danceY}px) rotate(${danceRotation}deg)`;
    }
    
    if (isMoving) {
      const walkX = Math.sin(walkCycle * 1.5) * 2;
      const walkY = Math.abs(Math.sin(walkCycle * 3)) * 1;
      transform += ` translate(${walkX}px, ${-walkY}px)`;
    }
    
    return transform;
  };

  return (
    <div className="relative">
      {/* Robot Body */}
      <div 
        className={`${sizeClasses[size]} relative transition-all duration-300`}
        style={{ transform: getRobotTransform() }}
      >
        {/* Corps principal du robot */}
        <div className="w-full h-full bg-gradient-to-br from-slate-200 to-white rounded-3xl border-4 border-slate-300 shadow-2xl relative overflow-hidden">
          
          {/* Tête du robot */}
          <div className="absolute top-1 left-1/2 transform -translate-x-1/2 w-3/4 h-1/2 bg-gradient-to-br from-slate-600 to-slate-800 rounded-2xl border-2 border-slate-500 flex items-center justify-center">
            
            {/* Yeux animés */}
            <div className="absolute top-2 left-1/2 transform -translate-x-1/2 flex gap-1">
              <div 
                className={`w-2 h-2 rounded-full transition-all duration-150 ${
                  mood === 'sleeping' ? 'bg-gray-400' :
                  mood === 'thinking' ? 'bg-yellow-400 animate-pulse' :
                  mood === 'speaking' ? 'bg-green-400 animate-bounce' :
                  mood === 'dancing' ? 'bg-pink-400 animate-spin' :
                  mood === 'moving' ? 'bg-blue-400 animate-pulse' :
                  'bg-cyan-400 animate-pulse'
                }`}
                style={{ 
                  transform: eyeBlink > 0 ? 'scaleY(0.1)' : 'scaleY(1)',
                  opacity: mood === 'sleeping' ? 0.3 : 1
                }}
              />
              <div 
                className={`w-2 h-2 rounded-full transition-all duration-150 ${
                  mood === 'sleeping' ? 'bg-gray-400' :
                  mood === 'thinking' ? 'bg-yellow-400 animate-pulse' :
                  mood === 'speaking' ? 'bg-green-400 animate-bounce' :
                  mood === 'dancing' ? 'bg-pink-400 animate-spin' :
                  mood === 'moving' ? 'bg-blue-400 animate-pulse' :
                  'bg-cyan-400 animate-pulse'
                }`}
                style={{ 
                  transform: eyeBlink > 0 ? 'scaleY(0.1)' : 'scaleY(1)',
                  opacity: mood === 'sleeping' ? 0.3 : 1,
                  animationDelay: '0.5s'
                }}
              />
            </div>

            {/* Bouche souriante animée */}
            <div className="absolute bottom-2 left-1/2 transform -translate-x-1/2">
              <div 
                className={`w-3 h-1.5 rounded-full transition-all duration-200 ${
                  mood === 'happy' || mood === 'dancing' ? 'bg-cyan-400' :
                  mood === 'speaking' ? 'bg-green-400 animate-pulse' :
                  mood === 'thinking' ? 'bg-yellow-400' :
                  'bg-cyan-400'
                }`}
                style={{
                  transform: isSpeaking ? `scaleY(${1.2 + mouthAnimation * 0.2})` : 'scaleY(1)',
                  borderRadius: mood === 'happy' || mood === 'dancing' ? '50% 50% 80% 80%' : '50% 50% 80% 80%'
                }}
              />
            </div>

            {/* Écran d'affichage */}
            <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-8 h-4 bg-black rounded border border-slate-400">
              <div className="w-full h-full bg-gradient-to-r from-cyan-400 to-blue-500 rounded animate-pulse opacity-80"></div>
            </div>
          </div>

          {/* Corps du robot */}
          <div className="absolute bottom-1 left-1/2 transform -translate-x-1/2 w-4/5 h-2/5 bg-gradient-to-br from-slate-300 to-slate-400 rounded-xl border-2 border-slate-400">
            
            {/* Panel de contrôle */}
            <div className="absolute top-1 left-1/2 transform -translate-x-1/2 flex gap-1">
              <div className={`w-1 h-1 rounded-full ${mood === 'happy' ? 'bg-green-400' : 'bg-gray-400'}`}></div>
              <div className={`w-1 h-1 rounded-full ${isSpeaking ? 'bg-blue-400 animate-pulse' : 'bg-gray-400'}`}></div>
              <div className={`w-1 h-1 rounded-full ${isListening ? 'bg-red-400 animate-pulse' : 'bg-gray-400'}`}></div>
            </div>

            {/* Barre de batterie */}
            <div className="absolute bottom-1 left-1/2 transform -translate-x-1/2 w-3/4 h-0.5 bg-gray-600 rounded-full">
              <div 
                className={`h-full rounded-full transition-all duration-1000 ${
                  battery > 50 ? 'bg-green-400' : battery > 20 ? 'bg-yellow-400' : 'bg-red-400'
                }`}
                style={{ width: `${battery}%` }}
              />
            </div>
          </div>

          {/* Bras du robot (animation de danse) */}
          {isDancing && (
            <>
              <div 
                className="absolute left-0 top-1/2 w-2 h-4 bg-slate-400 rounded-full"
                style={{
                  transform: `rotate(${Math.sin(danceStep * 0.5) * 30}deg)`,
                  transformOrigin: 'top center'
                }}
              />
              <div 
                className="absolute right-0 top-1/2 w-2 h-4 bg-slate-400 rounded-full"
                style={{
                  transform: `rotate(${Math.sin(danceStep * 0.5 + Math.PI) * 30}deg)`,
                  transformOrigin: 'top center'
                }}
              />
            </>
          )}

          {/* Jambes du robot (animation de marche) */}
          {isMoving && (
            <>
              <div 
                className="absolute left-1/4 bottom-0 w-1 h-3 bg-slate-500 rounded-full"
                style={{
                  transform: `rotate(${Math.sin(walkCycle * 2) * 15}deg)`,
                  transformOrigin: 'top center'
                }}
              />
              <div 
                className="absolute right-1/4 bottom-0 w-1 h-3 bg-slate-500 rounded-full"
                style={{
                  transform: `rotate(${Math.sin(walkCycle * 2 + Math.PI) * 15}deg)`,
                  transformOrigin: 'top center'
                }}
              />
            </>
          )}

          {/* Effets visuels selon l'état */}
          {isListening && (
            <div className="absolute top-0 right-0 w-2 h-2 bg-red-500 rounded-full animate-pulse">
              <div className="absolute inset-0 bg-red-500 rounded-full animate-ping opacity-75"></div>
            </div>
          )}

          {isSpeaking && (
            <div className="absolute top-0 left-0 flex gap-0.5">
              {[...Array(3)].map((_, i) => (
                <div 
                  key={i}
                  className="w-0.5 bg-green-400 rounded-full animate-pulse"
                  style={{
                    height: `${4 + Math.sin(Date.now() * 0.01 + i) * 2}px`,
                    animationDelay: `${i * 100}ms`
                  }}
                />
              ))}
            </div>
          )}

          {mood === 'thinking' && (
            <div className="absolute top-0 right-0 w-2 h-2 bg-yellow-400 rounded-full animate-bounce"></div>
          )}

          {isDancing && (
            <>
              <div className="absolute inset-0 border-2 border-pink-400 rounded-3xl animate-ping"></div>
              <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
                <Music className="w-3 h-3 text-pink-400 animate-spin" />
              </div>
            </>
          )}

          {isMoving && (
            <>
              <div className="absolute inset-0 border-2 border-blue-400 rounded-3xl animate-pulse"></div>
              <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
                <Move className="w-3 h-3 text-blue-400 animate-bounce" />
              </div>
            </>
          )}

          {/* Effet de brillance */}
          <div className="absolute inset-0 bg-gradient-to-br from-white/20 via-transparent to-transparent pointer-events-none rounded-3xl"></div>
        </div>

        {/* Effet de lueur externe */}
        <div className={`absolute inset-0 ${sizeClasses[size]} rounded-3xl blur-xl opacity-30 ${getGlowEffect()}`}></div>
      </div>

      {/* Indicateurs de statut */}
      <div className="absolute -bottom-6 left-1/2 transform -translate-x-1/2 flex gap-1">
        {/* Batterie */}
        <div className={`w-1 h-1 rounded-full ${battery > 20 ? 'bg-green-400' : 'bg-red-400'}`}></div>
        
        {/* Connexion */}
        <div className="w-1 h-1 rounded-full bg-cyan-400 animate-pulse"></div>
        
        {/* État */}
        <div className={`w-1 h-1 rounded-full ${
          mood === 'happy' ? 'bg-green-400' :
          mood === 'thinking' ? 'bg-yellow-400' :
          mood === 'speaking' ? 'bg-blue-400' :
          mood === 'dancing' ? 'bg-pink-400' :
          mood === 'moving' ? 'bg-blue-400' :
          'bg-gray-400'
        } animate-pulse`}></div>
      </div>

      {/* Particules d'émotion */}
      {mood === 'happy' && (
        <div className="absolute -top-2 left-1/2 transform -translate-x-1/2">
          <Heart className="w-3 h-3 text-pink-400 animate-bounce" />
        </div>
      )}

      {mood === 'dancing' && (
        <div className="absolute -top-2 -right-2">
          <Music className="w-3 h-3 text-pink-400 animate-spin" />
        </div>
      )}

      {mood === 'thinking' && (
        <div className="absolute -top-2 left-1/2 transform -translate-x-1/2">
          <div className="flex gap-1">
            <div className="w-1 h-1 bg-yellow-400 rounded-full animate-bounce"></div>
            <div className="w-1 h-1 bg-yellow-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
            <div className="w-1 h-1 bg-yellow-400 rounded-full animate-bounce" style={{ animationDelay: '0.4s' }}></div>
          </div>
        </div>
      )}
    </div>
  );
};