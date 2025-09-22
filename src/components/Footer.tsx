import React from 'react';
import { Logo } from './Logo';
import { Mail, Phone, MapPin, ExternalLink } from 'lucide-react';

export const Footer: React.FC = () => {
  return (
    <footer className="relative z-10 bg-black/40 backdrop-blur-xl border-t border-white/10 py-12">
      <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-6 xl:px-8">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6 sm:gap-8">
          {/* Logo et description */}
          <div>
            <Logo size="sm" />
            <p className="text-gray-400 mt-4 text-sm sm:text-base">
              La plateforme IA pour revendeurs de mobilier
            </p>
            <div className="mt-4 space-y-2">
              <div className="flex items-center gap-2 text-gray-400 text-sm">
                <Mail className="w-4 h-4" />
                <a href="mailto:support@omnia.sale" className="hover:text-white transition-colors">
                  support@omnia.sale
                </a>
              </div>
              <div className="flex items-center gap-2 text-gray-400 text-sm">
                <Phone className="w-4 h-4" />
                <span>+33 1 23 45 67 89</span>
              </div>
              <div className="flex items-center gap-2 text-gray-400 text-sm">
                <MapPin className="w-4 h-4" />
                <span>Paris, France</span>
              </div>
            </div>
          </div>
          
          {/* Produit */}
          <div>
            <h3 className="text-white font-semibold mb-3 sm:mb-4 text-sm sm:text-base">Produit</h3>
            <ul className="space-y-1 sm:space-y-2 text-gray-400 text-sm sm:text-base">
              <li><a href="/robot" className="hover:text-white transition-colors">🤖 OmnIA Robot</a></li>
              <li><a href="/chat" className="hover:text-white transition-colors">💬 Chat IA</a></li>
              <li><a href="/admin" className="hover:text-white transition-colors">🏢 Interface Admin</a></li>
              <li><a href="/analytics" className="hover:text-white transition-colors">📊 Analytics</a></li>
              <li><a href="/ecommerce" className="hover:text-white transition-colors">🛒 E-Commerce</a></li>
            </ul>
          </div>
          
          {/* Solutions */}
          <div>
            <h3 className="text-white font-semibold mb-3 sm:mb-4 text-sm sm:text-base">Solutions</h3>
            <ul className="space-y-1 sm:space-y-2 text-gray-400 text-sm sm:text-base">
              <li><a href="/marketing" className="hover:text-white transition-colors">📢 Marketing</a></li>
              <li><a href="/vision" className="hover:text-white transition-colors">📷 Vision IA</a></li>
              <li><a href="/seo" className="hover:text-white transition-colors">🔍 SEO</a></li>
              <li><a href="/bot" className="hover:text-white transition-colors">🤖 Bot Config</a></li>
              <li><a href="/integrations" className="hover:text-white transition-colors">🔗 Intégrations</a></li>
            </ul>
          </div>
          
          {/* Support */}
          <div>
            <h3 className="text-white font-semibold mb-3 sm:mb-4 text-sm sm:text-base">Support</h3>
            <ul className="space-y-1 sm:space-y-2 text-gray-400 text-sm sm:text-base">
              <li><a href="/documentation" className="hover:text-white transition-colors">📚 Documentation</a></li>
              <li><a href="/guides" className="hover:text-white transition-colors">📖 Guides</a></li>
              <li><a href="/contact" className="hover:text-white transition-colors">📞 Contact</a></li>
              <li><a href="/support" className="hover:text-white transition-colors">🆘 Support</a></li>
              <li>
                <a 
                  href="https://github.com/omnia-sale" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="hover:text-white transition-colors flex items-center gap-1"
                >
                  💻 GitHub
                  <ExternalLink className="w-3 h-3" />
                </a>
              </li>
            </ul>
          </div>
        </div>
        
        {/* Bottom section */}
        <div className="border-t border-white/10 mt-12 pt-8">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="text-center md:text-left">
              <p className="text-gray-400 text-sm sm:text-base">
                &copy; 2025 OmnIA.sale. Tous droits réservés.
              </p>
              <p className="text-gray-500 text-xs">
                Assistant Robot IA pour Revendeurs Mobilier
              </p>
            </div>
            
            <div className="flex items-center gap-6">
              <a href="/terms" className="text-gray-400 hover:text-white transition-colors text-sm">
                Conditions générales
              </a>
              <a href="/privacy" className="text-gray-400 hover:text-white transition-colors text-sm">
                Confidentialité
              </a>
              <a href="/cookies" className="text-gray-400 hover:text-white transition-colors text-sm">
                Cookies
              </a>
            </div>
          </div>
          
          {/* Status */}
          <div className="mt-6 flex items-center justify-center gap-4 text-xs text-gray-500">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
              <span>Tous les systèmes opérationnels</span>
            </div>
            <div className="flex items-center gap-2">
              <Wifi className="w-3 h-3" />
              <span>API connectées</span>
            </div>
            <div className="flex items-center gap-2">
              <Signal className="w-3 h-3" />
              <span>Latence: 0.8s</span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};