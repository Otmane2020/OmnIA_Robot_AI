import React, { useState, useEffect } from 'react';
import { CreditCard, TrendingUp, CheckCircle, AlertCircle, Crown, Zap, Users, Package, MessageSquare, DollarSign, Calendar, ArrowUp, ArrowDown } from 'lucide-react';
import { useNotifications } from './NotificationSystem';

interface Seller {
  id: string;
  email: string;
  company_name: string;
  subdomain: string;
  plan: 'starter' | 'professional' | 'enterprise';
  status: string;
  contact_name: string;
  created_at: string;
  validated_at?: string;
}

interface SubscriptionUsage {
  conversations_used: number;
  conversations_limit: number;
  products_count: number;
  products_limit: number | null;
  current_period_start: string;
  current_period_end: string;
  next_billing_date: string;
}

interface SellerSubscriptionManagerProps {
  seller: Seller;
  onUpdate: () => void;
}

export const SellerSubscriptionManager: React.FC<SellerSubscriptionManagerProps> = ({ seller, onUpdate }) => {
  const [usage, setUsage] = useState<SubscriptionUsage | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isUpgrading, setIsUpgrading] = useState(false);
  const [isDowngrading, setIsDowngrading] = useState(false);
  const { showSuccess, showError, showInfo } = useNotifications();

  const plans = [
    {
      id: 'starter',
      name: 'Starter',
      price: 29,
      conversations_limit: 1000,
      products_limit: 500,
      features: [
        '1000 conversations/mois',
        '500 produits max',
        'Support email',
        'Widget personnalisable',
        'Analytics de base'
      ],
      color: 'from-gray-500 to-gray-600'
    },
    {
      id: 'professional',
      name: 'Professional',
      price: 79,
      conversations_limit: 5000,
      products_limit: null,
      features: [
        '5000 conversations/mois',
        'Produits illimités',
        'Support prioritaire',
        'Domaine personnalisé',
        'Analytics avancées',
        'API complète'
      ],
      color: 'from-cyan-500 to-blue-600',
      popular: true
    },
    {
      id: 'enterprise',
      name: 'Enterprise',
      price: 199,
      conversations_limit: null,
      products_limit: null,
      features: [
        'Conversations illimitées',
        'Multi-magasins',
        'Support dédié',
        'White-label',
        'API personnalisée',
        'Formation équipe'
      ],
      color: 'from-purple-500 to-pink-600'
    }
  ];

  useEffect(() => {
    loadSubscriptionData();
  }, [seller.id]);

  const loadSubscriptionData = async () => {
    try {
      setIsLoading(true);
      
      // Simuler le chargement des données d'abonnement
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Charger l'utilisation depuis localStorage ou générer des données réalistes
      const savedUsage = localStorage.getItem(`seller_${seller.id}_usage`);
      let subscriptionUsage: SubscriptionUsage;
      
      if (savedUsage) {
        try {
          subscriptionUsage = JSON.parse(savedUsage);
        } catch (error) {
          console.error('Erreur parsing usage:', error);
          subscriptionUsage = generateDefaultUsage();
        }
      } else {
        subscriptionUsage = generateDefaultUsage();
        localStorage.setItem(`seller_${seller.id}_usage`, JSON.stringify(subscriptionUsage));
      }
      
      setUsage(subscriptionUsage);
      
    } catch (error) {
      console.error('❌ Erreur chargement abonnement:', error);
      showError('Erreur de chargement', 'Impossible de charger les données d\'abonnement.');
    } finally {
      setIsLoading(false);
    }
  };

  const generateDefaultUsage = (): SubscriptionUsage => {
    const currentPlan = plans.find(p => p.id === seller.plan);
    const now = new Date();
    const periodStart = new Date(now.getFullYear(), now.getMonth(), 1);
    const periodEnd = new Date(now.getFullYear(), now.getMonth() + 1, 0);
    const nextBilling = new Date(now.getFullYear(), now.getMonth() + 1, 1);
    
    // Générer une utilisation réaliste basée sur l'ancienneté du compte
    const accountAge = seller.created_at ? 
      Math.floor((Date.now() - new Date(seller.created_at).getTime()) / (1000 * 60 * 60 * 24)) : 0;
    
    const conversationsUsed = accountAge > 0 ? 
      Math.floor(Math.random() * (currentPlan?.conversations_limit || 1000) * 0.3) : 0;
    
    const productsCount = getSellerProductsCount();
    
    return {
      conversations_used: conversationsUsed,
      conversations_limit: currentPlan?.conversations_limit || 1000,
      products_count: productsCount,
      products_limit: currentPlan?.products_limit,
      current_period_start: periodStart.toISOString(),
      current_period_end: periodEnd.toISOString(),
      next_billing_date: nextBilling.toISOString()
    };
  };

  const getSellerProductsCount = (): number => {
    try {
      const savedProducts = localStorage.getItem(`seller_${seller.id}_products`);
      if (savedProducts) {
        const products = JSON.parse(savedProducts);
        return products.filter((p: any) => p.status === 'active').length;
      }
    } catch (error) {
      console.error('Erreur comptage produits:', error);
    }
    return 0;
  };

  const handleUpgrade = async (newPlan: string) => {
    setIsUpgrading(true);
    
    try {
      // Simuler l'upgrade
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Mettre à jour le plan du vendeur
      const validatedRetailers = JSON.parse(localStorage.getItem('validated_retailers') || '[]');
      const updatedRetailers = validatedRetailers.map((retailer: any) => 
        retailer.id === seller.id ? { ...retailer, plan: newPlan } : retailer
      );
      localStorage.setItem('validated_retailers', JSON.stringify(updatedRetailers));
      
      // Mettre à jour l'utilisation avec les nouvelles limites
      const newPlanData = plans.find(p => p.id === newPlan);
      if (newPlanData && usage) {
        const updatedUsage = {
          ...usage,
          conversations_limit: newPlanData.conversations_limit || usage.conversations_limit,
          products_limit: newPlanData.products_limit
        };
        setUsage(updatedUsage);
        localStorage.setItem(`seller_${seller.id}_usage`, JSON.stringify(updatedUsage));
      }
      
      showSuccess(
        'Upgrade réussi !',
        `Votre plan a été mis à niveau vers ${newPlanData?.name}. Les nouvelles fonctionnalités sont disponibles immédiatement.`,
        [
          {
            label: 'Voir les nouvelles fonctionnalités',
            action: () => showInfo('Nouvelles fonctionnalités', `Plan ${newPlanData?.name} activé avec succès !`),
            variant: 'primary'
          }
        ]
      );
      
      onUpdate();
      
    } catch (error) {
      showError('Erreur d\'upgrade', 'Impossible de mettre à niveau votre plan.');
    } finally {
      setIsUpgrading(false);
    }
  };

  const handleDowngrade = async (newPlan: string) => {
    const newPlanData = plans.find(p => p.id === newPlan);
    
    if (!confirm(`Êtes-vous sûr de vouloir rétrograder vers le plan ${newPlanData?.name} ? Cette action prendra effet à la fin de votre période de facturation actuelle.`)) {
      return;
    }
    
    setIsDowngrading(true);
    
    try {
      // Simuler le downgrade
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Programmer le downgrade pour la fin de période
      const downgradePlan = {
        seller_id: seller.id,
        new_plan: newPlan,
        effective_date: usage?.next_billing_date,
        scheduled_at: new Date().toISOString()
      };
      localStorage.setItem(`seller_${seller.id}_scheduled_downgrade`, JSON.stringify(downgradePlan));
      
      showInfo(
        'Downgrade programmé',
        `Votre plan sera rétrogradé vers ${newPlanData?.name} le ${new Date(usage?.next_billing_date || Date.now()).toLocaleDateString('fr-FR')}. Vous conservez vos fonctionnalités actuelles jusqu'à cette date.`
      );
      
    } catch (error) {
      showError('Erreur de downgrade', 'Impossible de programmer la rétrogradation.');
    } finally {
      setIsDowngrading(false);
    }
  };

  const getCurrentPlan = () => plans.find(p => p.id === seller.plan);
  const currentPlan = getCurrentPlan();

  const getUsagePercentage = (used: number, limit: number | null): number => {
    if (limit === null) return 0; // Illimité
    return Math.min((used / limit) * 100, 100);
  };

  const getUsageColor = (percentage: number): string => {
    if (percentage < 50) return 'bg-green-500';
    if (percentage < 80) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-cyan-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-white text-lg">Chargement de votre abonnement...</p>
        </div>
      </div>
    );
  }

  if (!usage || !currentPlan) {
    return (
      <div className="text-center py-20">
        <AlertCircle className="w-16 h-16 text-red-400 mx-auto mb-4" />
        <h3 className="text-xl font-bold text-white mb-2">Erreur de chargement</h3>
        <p className="text-gray-400">Impossible de charger les données d'abonnement.</p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-white">Gestion de l'Abonnement</h2>
          <p className="text-gray-300">Plan actuel : {currentPlan.name}</p>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 bg-green-400 rounded-full animate-pulse"></div>
          <span className="text-green-300 text-sm">Abonnement actif</span>
        </div>
      </div>

      {/* Plan Actuel */}
      <div className="bg-white/10 backdrop-blur-xl rounded-2xl p-8 border border-white/20">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            <div className={`w-16 h-16 bg-gradient-to-r ${currentPlan.color} rounded-2xl flex items-center justify-center`}>
              <Crown className="w-8 h-8 text-white" />
            </div>
            <div>
              <h3 className="text-2xl font-bold text-white">{currentPlan.name}</h3>
              <p className="text-gray-300">Plan actuel</p>
            </div>
          </div>
          <div className="text-right">
            <div className="text-3xl font-bold text-cyan-400">€{currentPlan.price}</div>
            <div className="text-gray-300">/mois</div>
            <div className="text-sm text-green-400 mt-1">Actif</div>
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h4 className="font-semibold text-white mb-3">Fonctionnalités incluses :</h4>
            <ul className="space-y-2">
              {currentPlan.features.map((feature, index) => (
                <li key={index} className="flex items-center gap-2 text-gray-300">
                  <CheckCircle className="w-4 h-4 text-green-400" />
                  {feature}
                </li>
              ))}
            </ul>
          </div>
          
          <div>
            <h4 className="font-semibold text-white mb-3">Informations de facturation :</h4>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-300">Période actuelle :</span>
                <span className="text-white">
                  {new Date(usage.current_period_start).toLocaleDateString('fr-FR')} - {new Date(usage.current_period_end).toLocaleDateString('fr-FR')}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-300">Prochaine facturation :</span>
                <span className="text-white">{new Date(usage.next_billing_date).toLocaleDateString('fr-FR')}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-300">Statut :</span>
                <span className="text-green-400 font-semibold">Actif</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Utilisation */}
      <div className="bg-white/10 backdrop-blur-xl rounded-2xl p-8 border border-white/20">
        <h3 className="text-xl font-bold text-white mb-6">Utilisation ce mois</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Conversations */}
          <div className="bg-black/20 rounded-xl p-6">
            <div className="flex items-center gap-3 mb-4">
              <MessageSquare className="w-6 h-6 text-blue-400" />
              <h4 className="font-semibold text-white">Conversations</h4>
            </div>
            <div className="space-y-3">
              <div className="flex justify-between text-sm">
                <span className="text-gray-300">Utilisées</span>
                <span className="text-white font-semibold">
                  {usage.conversations_used.toLocaleString()} / {usage.conversations_limit ? usage.conversations_limit.toLocaleString() : '∞'}
                </span>
              </div>
              {usage.conversations_limit && (
                <div className="w-full bg-gray-700 rounded-full h-3">
                  <div 
                    className={`h-3 rounded-full transition-all ${getUsageColor(getUsagePercentage(usage.conversations_used, usage.conversations_limit))}`}
                    style={{ width: `${getUsagePercentage(usage.conversations_used, usage.conversations_limit)}%` }}
                  ></div>
                </div>
              )}
              <div className="text-xs text-gray-400">
                {usage.conversations_limit ? 
                  `${Math.round(getUsagePercentage(usage.conversations_used, usage.conversations_limit))}% utilisé` :
                  'Illimité'
                }
              </div>
            </div>
          </div>
          
          {/* Produits */}
          <div className="bg-black/20 rounded-xl p-6">
            <div className="flex items-center gap-3 mb-4">
              <Package className="w-6 h-6 text-purple-400" />
              <h4 className="font-semibold text-white">Produits</h4>
            </div>
            <div className="space-y-3">
              <div className="flex justify-between text-sm">
                <span className="text-gray-300">Catalogue</span>
                <span className="text-white font-semibold">
                  {usage.products_count} / {usage.products_limit || '∞'}
                </span>
              </div>
              {usage.products_limit && (
                <div className="w-full bg-gray-700 rounded-full h-3">
                  <div 
                    className={`h-3 rounded-full transition-all ${getUsageColor(getUsagePercentage(usage.products_count, usage.products_limit))}`}
                    style={{ width: `${getUsagePercentage(usage.products_count, usage.products_limit)}%` }}
                  ></div>
                </div>
              )}
              <div className="text-xs text-gray-400">
                {usage.products_limit ? 
                  `${Math.round(getUsagePercentage(usage.products_count, usage.products_limit))}% utilisé` :
                  'Illimité'
                }
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Plans Disponibles */}
      <div className="bg-white/10 backdrop-blur-xl rounded-2xl p-8 border border-white/20">
        <h3 className="text-xl font-bold text-white mb-6">Plans Disponibles</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {plans.map((plan) => {
            const isCurrentPlan = plan.id === seller.plan;
            const isUpgrade = plans.findIndex(p => p.id === plan.id) > plans.findIndex(p => p.id === seller.plan);
            const isDowngrade = plans.findIndex(p => p.id === plan.id) < plans.findIndex(p => p.id === seller.plan);
            
            return (
              <div
                key={plan.id}
                className={`relative rounded-2xl p-6 border transition-all ${
                  isCurrentPlan
                    ? 'border-cyan-500 bg-cyan-500/20 shadow-2xl shadow-cyan-500/20'
                    : 'border-white/20 bg-white/10 hover:border-cyan-500/50'
                }`}
              >
                {plan.popular && (
                  <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                    <span className="bg-gradient-to-r from-cyan-500 to-blue-600 text-white px-4 py-1 rounded-full text-sm font-bold">
                      POPULAIRE
                    </span>
                  </div>
                )}
                
                {isCurrentPlan && (
                  <div className="absolute top-4 right-4">
                    <CheckCircle className="w-6 h-6 text-cyan-400" />
                  </div>
                )}
                
                <div className="text-center mb-6">
                  <h4 className="text-xl font-bold text-white mb-2">{plan.name}</h4>
                  <div className="flex items-baseline justify-center mb-4">
                    <span className="text-3xl font-bold text-white">€{plan.price}</span>
                    <span className="text-gray-400 ml-2">/mois</span>
                  </div>
                </div>

                <ul className="space-y-2 mb-6">
                  {plan.features.map((feature, featureIndex) => (
                    <li key={featureIndex} className="flex items-center gap-2 text-sm">
                      <CheckCircle className="w-4 h-4 text-green-400 flex-shrink-0" />
                      <span className="text-gray-300">{feature}</span>
                    </li>
                  ))}
                </ul>

                {isCurrentPlan ? (
                  <div className="text-center">
                    <div className="bg-cyan-500/20 text-cyan-300 py-3 rounded-xl font-semibold">
                      Plan Actuel
                    </div>
                  </div>
                ) : isUpgrade ? (
                  <button
                    onClick={() => handleUpgrade(plan.id)}
                    disabled={isUpgrading}
                    className="w-full bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-400 hover:to-emerald-500 disabled:from-gray-600 disabled:to-gray-700 text-white py-3 rounded-xl font-semibold transition-all disabled:cursor-not-allowed flex items-center justify-center gap-2"
                  >
                    {isUpgrading ? (
                      <>
                        <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                        Upgrade...
                      </>
                    ) : (
                      <>
                        <ArrowUp className="w-4 h-4" />
                        Upgrade
                      </>
                    )}
                  </button>
                ) : (
                  <button
                    onClick={() => handleDowngrade(plan.id)}
                    disabled={isDowngrading}
                    className="w-full bg-gray-600 hover:bg-gray-700 disabled:bg-gray-700 text-white py-3 rounded-xl font-semibold transition-all disabled:cursor-not-allowed flex items-center justify-center gap-2"
                  >
                    {isDowngrading ? (
                      <>
                        <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                        Downgrade...
                      </>
                    ) : (
                      <>
                        <ArrowDown className="w-4 h-4" />
                        Downgrade
                      </>
                    )}
                  </button>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Historique de Facturation */}
      <div className="bg-white/10 backdrop-blur-xl rounded-2xl p-8 border border-white/20">
        <h3 className="text-xl font-bold text-white mb-6">Historique de Facturation</h3>
        
        <div className="space-y-4">
          <div className="flex items-center justify-between p-4 bg-black/20 rounded-xl">
            <div className="flex items-center gap-3">
              <Calendar className="w-5 h-5 text-green-400" />
              <div>
                <div className="font-semibold text-white">Janvier 2025</div>
                <div className="text-sm text-gray-400">Plan {currentPlan.name}</div>
              </div>
            </div>
            <div className="text-right">
              <div className="font-bold text-green-400">€{currentPlan.price}</div>
              <div className="text-sm text-green-300">Payé</div>
            </div>
          </div>
          
          <div className="flex items-center justify-between p-4 bg-black/20 rounded-xl">
            <div className="flex items-center gap-3">
              <Calendar className="w-5 h-5 text-blue-400" />
              <div>
                <div className="font-semibold text-white">Décembre 2024</div>
                <div className="text-sm text-gray-400">Plan {currentPlan.name}</div>
              </div>
            </div>
            <div className="text-right">
              <div className="font-bold text-green-400">€{currentPlan.price}</div>
              <div className="text-sm text-green-300">Payé</div>
            </div>
          </div>
        </div>
        
        <div className="mt-6 text-center">
          <button
            onClick={() => showInfo(
              'Portail de facturation',
              'Accédez au portail client pour télécharger vos factures et gérer vos moyens de paiement.',
              [
                {
                  label: 'Ouvrir le portail',
                  action: () => window.open('https://billing.omnia.sale/portal', '_blank'),
                  variant: 'primary'
                }
              ]
            )}
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-xl font-semibold transition-all"
          >
            Voir toutes les factures
          </button>
        </div>
      </div>

      {/* Support */}
      <div className="bg-gradient-to-r from-cyan-500/20 to-blue-600/20 backdrop-blur-xl rounded-2xl p-6 border border-cyan-400/30">
        <h3 className="text-lg font-bold text-white mb-4">Besoin d'aide avec votre abonnement ?</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h4 className="font-semibold text-cyan-300 mb-2">📞 Support commercial :</h4>
            <ul className="text-cyan-200 text-sm space-y-1">
              <li>• Téléphone : +33 1 84 88 32 45</li>
              <li>• Email : commercial@omnia.sale</li>
              <li>• Lun-Ven : 9h00 - 18h00</li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold text-cyan-300 mb-2">💳 Support facturation :</h4>
            <ul className="text-cyan-200 text-sm space-y-1">
              <li>• Email : billing@omnia.sale</li>
              <li>• Portail client 24/7</li>
              <li>• Réponse sous 24h</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};