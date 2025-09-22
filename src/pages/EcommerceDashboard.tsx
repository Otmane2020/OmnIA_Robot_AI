import React, { useState } from 'react';
import { Store, ShoppingCart, Package, TrendingUp, DollarSign, Users, ArrowLeft } from 'lucide-react';
import { Logo } from '../components/Logo';
import { CatalogManagement } from '../components/CatalogManagement';
import { EcommerceIntegration } from '../components/EcommerceIntegration';
import { ShopifyCSVImporter } from '../components/ShopifyCSVImporter';

export const EcommerceDashboard: React.FC = () => {
  const [activeTab, setActiveTab] = useState('catalog');

  const tabs = [
    { id: 'catalog', label: 'Catalogue', icon: Package },
    { id: 'integration', label: 'Intégrations', icon: Store },
    { id: 'orders', label: 'Commandes', icon: ShoppingCart },
    { id: 'customers', label: 'Clients', icon: Users }
  ];

  const stats = [
    { label: 'Produits actifs', value: '247', icon: Package, color: 'bg-blue-500' },
    { label: 'Commandes ce mois', value: '156', icon: ShoppingCart, color: 'bg-green-500' },
    { label: 'Revenus', value: '€12.4k', icon: DollarSign, color: 'bg-purple-500' },
    { label: 'Taux conversion', value: '3.2%', icon: TrendingUp, color: 'bg-orange-500' }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-purple-900">
      {/* Header */}
      <header className="bg-black/20 backdrop-blur-xl border-b border-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center gap-4">
              <Logo size="md" />
              <div>
                <h1 className="text-2xl font-bold text-white">E-Commerce Dashboard</h1>
                <p className="text-cyan-300">Gestion catalogue et ventes</p>
              </div>
            </div>
            <a href="/" className="flex items-center gap-2 text-cyan-400 hover:text-cyan-300 transition-colors">
              <ArrowLeft className="w-4 h-4" />
              Retour accueil
            </a>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {stats.map((stat, index) => {
            const Icon = stat.icon;
            return (
              <div key={index} className="bg-white/10 backdrop-blur-xl rounded-2xl p-6 border border-white/20">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-300 text-sm">{stat.label}</p>
                    <p className="text-3xl font-bold text-white">{stat.value}</p>
                  </div>
                  <div className={`w-12 h-12 ${stat.color} rounded-xl flex items-center justify-center`}>
                    <Icon className="w-6 h-6 text-white" />
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Navigation Tabs */}
        <div className="bg-white/10 backdrop-blur-xl rounded-2xl p-2 border border-white/20 mb-8">
          <div className="flex space-x-2">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-2 px-6 py-3 rounded-xl transition-all ${
                    activeTab === tab.id
                      ? 'bg-cyan-500 text-white'
                      : 'text-gray-400 hover:text-white hover:bg-white/10'
                  }`}
                >
                  <Icon className="w-5 h-5" />
                  <span className="font-medium">{tab.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Tab Content */}
        <div className="bg-white/10 backdrop-blur-xl rounded-2xl border border-white/20 min-h-[600px]">
          {activeTab === 'catalog' && (
            <div className="p-8">
              <CatalogManagement />
            </div>
          )}
          
          {activeTab === 'integration' && (
            <div className="p-8">
              <EcommerceIntegration onConnected={(data) => console.log('Connected:', data)} />
            </div>
          )}
          
          {activeTab === 'orders' && (
            <div className="p-8">
              <div className="text-center py-20">
                <ShoppingCart className="w-16 h-16 text-cyan-400 mx-auto mb-4" />
                <h3 className="text-xl font-bold text-white mb-2">Gestion des Commandes</h3>
                <p className="text-gray-300">Module de gestion des commandes en développement</p>
              </div>
            </div>
          )}
          
          {activeTab === 'customers' && (
            <div className="p-8">
              <div className="text-center py-20">
                <Users className="w-16 h-16 text-purple-400 mx-auto mb-4" />
                <h3 className="text-xl font-bold text-white mb-2">Gestion Clients</h3>
                <p className="text-gray-300">Module de gestion des clients en développement</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};