import React, { useState, useEffect } from 'react';
import {
  Users, Database, CheckCircle, AlertCircle, CreditCard, Receipt,
  TrendingUp, MessageSquare, ShoppingCart, Upload, Download,
  Bot, Globe, FileText, Eye, Settings, Store, LogOut, BarChart3, Brain,
  Clock, Star, X, ShoppingBag, Home, Search, Target, Palette, Zap
} from 'lucide-react';
import { Logo } from '../components/Logo';
import { EcommerceIntegration } from '../components/EcommerceIntegration';
import { ShopifyAdminConnector } from '../components/ShopifyAdminConnector';
import { AITrainingInterface } from '../components/AITrainingInterface';
import { OmniaRobotTab } from '../components/OmniaRobotTab';
import { CatalogManagement } from '../components/CatalogManagement';
import { MLTrainingDashboard } from '../components/MLTrainingDashboard';
import { ProductDetailModal } from '../components/ProductDetailModal';
import { AddProductModal } from '../components/AddProductModal';
import { ConversationHistory } from '../components/ConversationHistory';
import { ProductsEnrichedTable } from '../components/ProductsEnrichedTable';
import { NotificationSystem, useNotifications } from '../components/NotificationSystem';
import { supabase } from '../lib/supabase';

interface AdminDashboardProps {
  onLogout: () => void;
}

interface DashboardStats {
  conversations: number;
  conversions: number;
  products: number;
  revenue: number;
  visitors: number;
  sessionDuration: string;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({ onLogout }) => {
  const { notifications, showSuccess, showError, showInfo, removeNotification } = useNotifications();
  
  const [activeTab, setActiveTab] = useState('dashboard');
  const [stats, setStats] = useState<DashboardStats>({
    conversations: 1234,
    conversions: 42,
    products: 247,
    revenue: 45600,
    visitors: 89,
    sessionDuration: '4m 12s'
  });

  // Menu items selon l'image
  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: BarChart3, color: 'bg-cyan-500' },
    { id: 'ecommerce', label: 'E-Commerce', icon: ShoppingCart, color: 'bg-green-500' },
    { id: 'ads', label: 'Ads & Marketing', icon: Target, color: 'bg-blue-500' },
    { id: 'vision', label: 'Vision & Studio', icon: Palette, color: 'bg-pink-500' },
    { id: 'seo', label: 'SEO', icon: Search, color: 'bg-purple-500' },
    { id: 'omnia', label: 'OmnIA Bot', icon: Bot, color: 'bg-pink-600' },
    { id: 'analytics', label: 'Analytics', icon: BarChart3, color: 'bg-orange-500' },
    { id: 'admin', label: 'Admin', icon: Settings, color: 'bg-gray-500' }
  ];

  // Cards du dashboard selon l'image
  const dashboardCards = [
    { 
      title: 'E-Commerce', 
      subtitle: '247 Produits', 
      icon: ShoppingCart, 
      color: 'bg-green-500',
      onClick: () => setActiveTab('ecommerce')
    },
    { 
      title: 'Ads & Marketing', 
      subtitle: '4.2x ROAS', 
      icon: Target, 
      color: 'bg-blue-500',
      onClick: () => setActiveTab('ads')
    },
    { 
      title: 'Vision & Studio', 
      subtitle: 'AR/VR', 
      icon: Palette, 
      color: 'bg-pink-500',
      onClick: () => setActiveTab('vision')
    },
    { 
      title: 'SEO', 
      subtitle: '15 Articles', 
      icon: Search, 
      color: 'bg-purple-500',
      onClick: () => setActiveTab('seo')
    },
    { 
      title: 'OmnIA Bot', 
      subtitle: '1,234 Chats', 
      icon: Bot, 
      color: 'bg-pink-600',
      onClick: () => setActiveTab('omnia')
    },
    { 
      title: 'Analytics', 
      subtitle: '42% Conv.', 
      icon: BarChart3, 
      color: 'bg-orange-500',
      onClick: () => setActiveTab('analytics')
    },
    { 
      title: 'Admin', 
      subtitle: '100% Uptime', 
      icon: Settings, 
      color: 'bg-gray-500',
      onClick: () => setActiveTab('admin')
    }
  ];

  const renderDashboard = () => (
    <div className="space-y-8">
      {/* Cards Grid - Style exact de l'image */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {dashboardCards.map((card, index) => {
          const Icon = card.icon;
          return (
            <div
              key={index}
              onClick={card.onClick}
              className="bg-slate-700/50 backdrop-blur-xl rounded-3xl p-6 border border-slate-600/30 hover:border-cyan-400/50 transition-all cursor-pointer hover:scale-105 group"
            >
              <div className="flex flex-col items-center text-center space-y-4">
                <div className={`w-16 h-16 ${card.color} rounded-2xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform`}>
                  <Icon className="w-8 h-8 text-white" />
                </div>
                <div>
                  <h3 className="text-white font-bold text-lg">{card.title}</h3>
                  <p className="text-gray-300 text-sm">{card.subtitle}</p>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Synthèse d'activité - Style exact de l'image */}
      <div className="bg-slate-700/50 backdrop-blur-xl rounded-3xl p-8 border border-slate-600/30">
        <h2 className="text-2xl font-bold text-white mb-8">Synthèse d'activité</h2>
        
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-8">
          <div className="text-center">
            <div className="text-4xl font-bold text-green-400 mb-2">{stats.products}</div>
            <div className="text-gray-300 text-sm">Produits</div>
          </div>
          <div className="text-center">
            <div className="text-4xl font-bold text-cyan-400 mb-2">{stats.conversations.toLocaleString()}</div>
            <div className="text-gray-300 text-sm">Conversations</div>
          </div>
          <div className="text-center">
            <div className="text-4xl font-bold text-purple-400 mb-2">€{stats.revenue.toLocaleString()}</div>
            <div className="text-gray-300 text-sm">Revenus</div>
          </div>
          <div className="text-center">
            <div className="text-4xl font-bold text-orange-400 mb-2">{stats.conversions}%</div>
            <div className="text-gray-300 text-sm">Conversion</div>
          </div>
          <div className="text-center">
            <div className="text-4xl font-bold text-cyan-400 mb-2">{stats.visitors}</div>
            <div className="text-gray-300 text-sm">Visiteurs</div>
          </div>
          <div className="text-center">
            <div className="text-4xl font-bold text-pink-400 mb-2">{stats.sessionDuration}</div>
            <div className="text-gray-300 text-sm">Session moy.</div>
          </div>
        </div>
      </div>
    </div>
  );

  const renderEcommerce = () => (
    <div className="space-y-8">
      <h2 className="text-2xl font-bold text-white">E-Commerce</h2>
      <div className="bg-slate-700/50 backdrop-blur-xl rounded-3xl p-8 border border-slate-600/30">
        <p className="text-gray-300">Gestion des produits et catalogue</p>
      </div>
    </div>
  );

  const renderAds = () => (
    <div className="space-y-8">
      <h2 className="text-2xl font-bold text-white">Ads & Marketing</h2>
      <div className="bg-slate-700/50 backdrop-blur-xl rounded-3xl p-8 border border-slate-600/30">
        <p className="text-gray-300">Campagnes publicitaires et marketing</p>
      </div>
    </div>
  );

  const renderVision = () => (
    <div className="space-y-8">
      <h2 className="text-2xl font-bold text-white">Vision & Studio</h2>
      <div className="bg-slate-700/50 backdrop-blur-xl rounded-3xl p-8 border border-slate-600/30">
        <p className="text-gray-300">Réalité augmentée et studio virtuel</p>
      </div>
    </div>
  );

  const renderSEO = () => (
    <div className="space-y-8">
      <h2 className="text-2xl font-bold text-white">SEO</h2>
      <div className="bg-slate-700/50 backdrop-blur-xl rounded-3xl p-8 border border-slate-600/30">
        <p className="text-gray-300">Optimisation pour les moteurs de recherche</p>
      </div>
    </div>
  );

  const renderOmnIA = () => (
    <div className="space-y-8">
      <h2 className="text-2xl font-bold text-white">OmnIA Bot</h2>
      <div className="bg-slate-700/50 backdrop-blur-xl rounded-3xl p-8 border border-slate-600/30">
        <p className="text-gray-300">Configuration et gestion du robot IA</p>
      </div>
    </div>
  );

  const renderAnalytics = () => (
    <div className="space-y-8">
      <h2 className="text-2xl font-bold text-white">Analytics</h2>
      <div className="bg-slate-700/50 backdrop-blur-xl rounded-3xl p-8 border border-slate-600/30">
        <p className="text-gray-300">Statistiques et analyses détaillées</p>
      </div>
    </div>
  );

  const renderAdmin = () => (
    <div className="space-y-8">
      <h2 className="text-2xl font-bold text-white">Administration</h2>
      <div className="bg-slate-700/50 backdrop-blur-xl rounded-3xl p-8 border border-slate-600/30">
        <p className="text-gray-300">Paramètres système et configuration</p>
      </div>
    </div>
  );

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard': return renderDashboard();
      case 'ecommerce': return renderEcommerce();
      case 'ads': return renderAds();
      case 'vision': return renderVision();
      case 'seo': return renderSEO();
      case 'omnia': return renderOmnIA();
      case 'analytics': return renderAnalytics();
      case 'admin': return renderAdmin();
      default: return renderDashboard();
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-purple-900">
      <NotificationSystem notifications={notifications} onRemove={removeNotification} />
      
      {/* Background Effects */}
      <div className="absolute inset-0 opacity-20">
        <div className="absolute top-20 left-20 w-72 h-72 bg-cyan-500/30 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-20 right-20 w-96 h-96 bg-purple-500/20 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '2s' }}></div>
      </div>

      <div className="relative z-10 flex h-screen">
        {/* Sidebar - Style exact de l'image */}
        <div className="w-64 bg-slate-800/90 backdrop-blur-2xl border-r border-slate-700/50 p-6">
          {/* Header avec logo - Style exact */}
          <div className="flex items-center gap-3 mb-8">
            <div className="w-8 h-8 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-xl flex items-center justify-center">
              <Bot className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-white font-bold text-lg">OmnIA Admin</h1>
              <p className="text-cyan-300 text-sm">Decora Home</p>
            </div>
          </div>

          {/* Navigation Menu - Style exact de l'image */}
          <nav className="space-y-2">
            {menuItems.map((item) => {
              const Icon = item.icon;
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-2xl transition-all text-left ${
                    activeTab === item.id
                      ? 'bg-cyan-500/30 text-white border border-cyan-500/50'
                      : 'text-gray-300 hover:bg-slate-700/50 hover:text-white'
                  }`}
                >
                  <div className={`w-8 h-8 ${item.color} rounded-xl flex items-center justify-center`}>
                    <Icon className="w-4 h-4 text-white" />
                  </div>
                  <span className="font-medium">{item.label}</span>
                </button>
              );
            })}
          </nav>
        </div>

        {/* Main Content */}
        <div className="flex-1 flex flex-col">
          {/* Header - Style exact de l'image */}
          <div className="bg-slate-800/90 backdrop-blur-xl border-b border-slate-700/50 p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <Home className="w-6 h-6 text-cyan-400" />
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-xl flex items-center justify-center">
                    <Bot className="w-4 h-4 text-white" />
                  </div>
                  <span className="text-white font-bold text-xl">OmnIA Admin</span>
                </div>
              </div>
              
              <div className="flex items-center gap-4">
                <button
                  onClick={() => window.open('/chat', '_blank')}
                  className="bg-gradient-to-r from-purple-500 to-pink-600 hover:from-purple-400 hover:to-pink-500 text-white px-6 py-3 rounded-2xl font-semibold transition-all shadow-lg hover:shadow-purple-500/50"
                >
                  Tester OmnIA
                </button>
                <button className="p-3 bg-slate-700/50 hover:bg-slate-600/50 rounded-2xl transition-all">
                  <Settings className="w-5 h-5 text-gray-300" />
                </button>
                <button
                  onClick={onLogout}
                  className="p-3 bg-red-500/20 hover:bg-red-500/30 rounded-2xl transition-all"
                >
                  <LogOut className="w-5 h-5 text-red-300" />
                </button>
              </div>
            </div>
          </div>

          {/* Content Area */}
          <div className="flex-1 overflow-y-auto p-8">
            {renderContent()}
          </div>
        </div>
      </div>
    </div>
  );
};