import React, { useState, useEffect } from 'react';
import { Bot, Zap, CheckCircle, Loader2, Database, Brain, Wifi, Sparkles } from 'lucide-react';

interface RobotInitializationScreenProps {
  onComplete: () => void;
}

export const RobotInitializationScreen: React.FC<RobotInitializationScreenProps> = ({ onComplete }) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [progress, setProgress] = useState(0);
  const [isComplete, setIsComplete] = useState(false);

  const initSteps = [
    { icon: Bot, label: 'Initialisation OmnIA', duration: 800 },
    { icon: Database, label: 'Chargement catalogue', duration: 600 },
    { icon: Brain, label: 'Activation IA', duration: 500 },
    { icon: Wifi, label: 'Connexion établie', duration: 400 }
  ];

  useEffect(() => {
    const totalDuration = 2300;
    let startTime = Date.now();
    
    const interval = setInterval(() => {
      const elapsed = Date.now() - startTime;
      const newProgress = Math.min((elapsed / totalDuration) * 100, 100);
      setProgress(newProgress);
      
      const stepIndex = Math.floor((elapsed / totalDuration) * initSteps.length);
      if (stepIndex !== currentStep && stepIndex < initSteps.length) {
        setCurrentStep(stepIndex);
      }
      
      if (elapsed >= totalDuration) {
        clearInterval(interval);
        setProgress(100);
        setIsComplete(true);
        setTimeout(onComplete, 500);
      }
    }, 16);

    return () => clearInterval(interval);
  }, [onComplete]);

  const CurrentIcon = initSteps[currentStep]?.icon || Bot;

  return (
    <div className="fixed inset-0 bg-gradient-to-br from-slate-900 via-blue-900 to-purple-900 flex items-center justify-center z-50 overflow-hidden">
      {/* Animated Background */}
      <div className="absolute inset-0">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-cyan-500/20 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-purple-500/20 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }}></div>
        <div className="absolute top-1/2 left-1/2 w-64 h-64 bg-blue-500/15 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '2s' }}></div>
      </div>

      <div className="relative z-10 text-center max-w-md mx-auto p-8">
        {/* Main Robot Avatar */}
        <div className="relative mb-8">
          <div className="w-32 h-32 bg-gradient-to-br from-cyan-400 via-blue-500 to-purple-600 rounded-full flex items-center justify-center mx-auto shadow-2xl shadow-cyan-500/50 border-4 border-cyan-400/70 relative overflow-hidden">
            <CurrentIcon className="w-16 h-16 text-white z-10" />
            
            {/* Holographic effect */}
            <div className="absolute inset-0 bg-gradient-to-r from-cyan-400/30 via-transparent to-purple-400/30 animate-pulse"></div>
          </div>
          
          {/* Floating particles */}
          <div className="absolute -top-4 -left-4 w-4 h-4 bg-cyan-400 rounded-full animate-bounce" style={{ animationDelay: '0.5s' }}></div>
          <div className="absolute -top-2 -right-6 w-3 h-3 bg-purple-400 rounded-full animate-bounce" style={{ animationDelay: '1s' }}></div>
          <div className="absolute -bottom-4 -right-4 w-4 h-4 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: '1.5s' }}></div>
          
          {/* Rotating rings */}
          <div className="absolute inset-0 w-32 h-32 border-2 border-cyan-400/20 rounded-full animate-spin mx-auto" style={{ animationDuration: '4s' }}></div>
          <div className="absolute inset-2 w-28 h-28 border-2 border-purple-400/20 rounded-full animate-spin mx-auto" style={{ animationDuration: '3s', animationDirection: 'reverse' }}></div>
        </div>

        {/* Title with gradient */}
        <h1 className="text-5xl font-bold mb-4">
          <span className="bg-gradient-to-r from-cyan-400 via-blue-400 to-purple-400 bg-clip-text text-transparent animate-pulse">
            OmnIA
          </span>
        </h1>
        <p className="text-cyan-300 text-xl mb-8 font-medium">Commercial Mobilier IA</p>

        {/* Current Step with enhanced animation */}
        <div className="mb-8">
          <div className="flex items-center justify-center gap-3 mb-6">
            <div className="w-8 h-8 bg-gradient-to-r from-cyan-500 to-blue-600 rounded-full flex items-center justify-center animate-pulse">
              <CurrentIcon className="w-4 h-4 text-white" />
            </div>
            <span className="text-white font-semibold text-lg animate-pulse">
              {initSteps[currentStep]?.label || 'Initialisation...'}
            </span>
          </div>
          
          {/* Enhanced Progress Bar */}
          <div className="relative w-full bg-slate-700/50 rounded-full h-4 mb-4 overflow-hidden">
            <div 
              className="bg-gradient-to-r from-cyan-500 via-blue-500 to-purple-600 h-4 rounded-full transition-all duration-300 relative overflow-hidden" 
              style={{ width: `${progress}%` }}
            >
              <div className="absolute inset-0 bg-gradient-to-r from-white/20 to-transparent animate-pulse"></div>
            </div>
          </div>
          
          <p className="text-cyan-300 text-lg font-bold">{Math.round(progress)}%</p>
        </div>

        {/* Steps visualization */}
        <div className="grid grid-cols-2 gap-4">
          {initSteps.map((step, index) => {
            const StepIcon = step.icon;
            const isActive = index === currentStep;
            const isCompleted = index < currentStep;
            
            return (
              <div 
                key={index}
                className={`p-4 rounded-xl border transition-all duration-500 ${
                  isCompleted 
                    ? 'bg-green-500/20 border-green-400/50 scale-95' 
                    : isActive 
                      ? 'bg-cyan-500/20 border-cyan-400/50 scale-105 animate-pulse' 
                      : 'bg-slate-700/30 border-slate-600/30 scale-90 opacity-50'
                }`}
              >
                <div className={`w-8 h-8 rounded-full flex items-center justify-center mx-auto mb-2 ${
                  isCompleted 
                    ? 'bg-green-500' 
                    : isActive 
                      ? 'bg-cyan-500' 
                      : 'bg-slate-600'
                }`}>
                  {isCompleted ? (
                    <CheckCircle className="w-4 h-4 text-white" />
                  ) : isActive ? (
                    <Loader2 className="w-4 h-4 text-white animate-spin" />
                  ) : (
                    <StepIcon className="w-4 h-4 text-white" />
                  )}
                </div>
                <span className={`text-xs font-medium block text-center ${
                  isActive ? 'text-white' : isCompleted ? 'text-green-300' : 'text-gray-400'
                }`}>
                  {step.label}
                </span>
              </div>
            );
          })}
        </div>

        {/* Completion animation */}
        {isComplete && (
          <div className="mt-8 animate-in fade-in duration-500">
            <div className="flex items-center justify-center gap-2 text-green-400 text-lg font-bold">
              <CheckCircle className="w-6 h-6" />
              <span>Prêt à vous aider !</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};