import React from 'react';
import { Store, Megaphone, Camera, Search, Bot, BarChart3, Settings } from 'lucide-react';

interface NavigationProps {
  currentPath: string;
}

export const Navigation: React.FC<NavigationProps> = ({ currentPath }) => {
  const modules = [
    { 
      id: 'ecommerce', 
      label: 'E-Commerce', 
      icon: Store, 
      path: '/ecommerce',
      description: 'Catalogue & Ventes',
      color: 'from-blue-500 to-cyan-600'
    },
    { 
      id: 'marketing', 
      label: 'Marketing', 
      icon: Megaphone, 
      path: '/marketing',
      description: 'Ads & Campagnes',
      color: 'from-green-500 to-emerald-600'
    },
    { 
      id: 'vision', 
      label: 'Vision', 
      icon: Camera, 
      path: '/vision',
      description: 'IA Visuelle',
      color: 'from-purple-500 to-pink-600'
    },
    { 
      id: 'seo', 
      label: 'SEO', 
      icon: Search, 
      path: '/seo',
      description: 'Référencement',
      color: 'from-orange-500 to-red-600'
    },
    { 
      id: 'bot', 
      label: 'OmnIA Bot', 
      icon: Bot, 
      path: '/bot',
      description: 'Robot IA',
      color: 'from-cyan-500 to-blue-600'
    },
    { 
      id: 'analytics', 
      label: 'Analytics', 
      icon: BarChart3, 
      path: '/analytics',
      description: 'Statistiques',
      color: 'from-pink-500 to-purple-600'
    },
    { 
      id: 'admin', 
      label: 'Admin', 
      icon: Settings, 
      path: '/admin',
      description: 'Gestion',
      color: 'from-red-500 to-pink-600'
    }
  ];

  return (
    <nav className="bg-white/10 backdrop-blur-xl rounded-2xl p-4 border border-white/20">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 xl:grid-cols-7 gap-4">
        {modules.map((module) => {
          const Icon = module.icon;
          const isActive = currentPath === module.path;
          
          return (
            <a
              key={module.id}
              href={module.path}
              className={`group relative overflow-hidden rounded-xl p-6 transition-all duration-300 hover:scale-105 ${
                isActive 
                  ? 'bg-gradient-to-r ' + module.color + ' text-white shadow-2xl' 
                  : 'bg-black/20 hover:bg-white/10 text-gray-300 hover:text-white'
              }`}
            >
              <div className="relative z-10">
                <Icon className={`w-8 h-8 mx-auto mb-3 transition-transform group-hover:scale-110 ${
                  isActive ? 'text-white' : 'text-cyan-400'
                }`} />
                <h3 className="font-bold text-center mb-1">{module.label}</h3>
                <p className={`text-xs text-center ${
                  isActive ? 'text-white/80' : 'text-gray-400'
                }`}>
                  {module.description}
                </p>
              </div>
              
              {/* Hover effect */}
              <div className={`absolute inset-0 bg-gradient-to-r ${module.color} opacity-0 group-hover:opacity-20 transition-opacity duration-300`}></div>
              
              {/* Active indicator */}
              {isActive && (
                <div className="absolute top-2 right-2 w-3 h-3 bg-white rounded-full animate-pulse"></div>
              )}
            </a>
          );
        })}
      </div>
    </nav>
  );
};