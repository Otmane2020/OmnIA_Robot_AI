import React, { useState, useEffect } from 'react';
import {
  Users, Building, CheckCircle, X, Eye, Edit, Trash2, Plus,
  Mail, Phone, MapPin, Calendar, FileText, AlertCircle,
  Search, Filter, Download, Upload, Settings, LogOut,
  User, CreditCard, Globe, BarChart3, Clock, Star
} from 'lucide-react';
import { Logo } from '../components/Logo';

interface Application {
  id: string;
  companyName: string;
  siret: string;
  address: string;
  postalCode: string;
  city: string;
  country: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  position: string;
  password: string;
  selectedPlan: 'starter' | 'professional' | 'enterprise';
  kbisFile: File | null;
  submittedAt: string;
  submittedDate: string;
  submittedTime: string;
  status: 'pending' | 'approved' | 'rejected';
  proposedSubdomain: string;
}

interface Retailer {
  id: string;
  companyName: string;
  email: string;
  password: string;
  plan: 'starter' | 'professional' | 'enterprise';
  status: 'active' | 'inactive' | 'suspended';
  revenue: number;
  conversations: number;
  products: number;
  joinDate: string;
  lastActive: string;
  subdomain: string;
  contactName: string;
  phone: string;
  address: string;
  city: string;
  siret: string;
}

interface SuperAdminProps {
  onLogout: () => void;
  pendingApplications: Application[];
  onValidateApplication: (applicationId: string, approved: boolean) => void;
}

export const SuperAdmin: React.FC<SuperAdminProps> = ({ 
  onLogout, 
  pendingApplications, 
  onValidateApplication 
}) => {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [retailers, setRetailers] = useState<Retailer[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [planFilter, setPlanFilter] = useState('all');
  const [selectedApplication, setSelectedApplication] = useState<Application | null>(null);
  const [selectedRetailer, setSelectedRetailer] = useState<Retailer | null>(null);
  const [showApplicationModal, setShowApplicationModal] = useState(false);
  const [showRetailerModal, setShowRetailerModal] = useState(false);
  const [showCreateRetailerModal, setShowCreateRetailerModal] = useState(false);
  const [selectedKbis, setSelectedKbis] = useState<{ application: Application; kbisFile: File } | null>(null);
  const [showKbisModal, setShowKbisModal] = useState(false);

  // Charger les revendeurs depuis localStorage
  useEffect(() => {
    try {
      const savedRetailers = localStorage.getItem('approved_retailers');
      if (savedRetailers) {
        setRetailers(JSON.parse(savedRetailers));
      } else {
        // Revendeurs de démonstration
        const demoRetailers: Retailer[] = [
          {
            id: 'retailer-1',
            companyName: 'Decora Home',
            email: 'demo@decorahome.fr',
            password: 'demo123',
            plan: 'professional',
            status: 'active',
            revenue: 15420,
            conversations: 1234,
            products: 247,
            joinDate: '2024-03-15',
            lastActive: '2025-01-15',
            subdomain: 'decorahome',
            contactName: 'Marie Dubois',
            phone: '+33 1 23 45 67 89',
            address: '123 Rue de la Paix',
            city: 'Paris',
            siret: '12345678901234'
          },
          {
            id: 'retailer-2',
            companyName: 'Mobilier Design',
            email: 'contact@mobilierdesign.fr',
            password: 'design123',
            plan: 'enterprise',
            status: 'active',
            revenue: 28750,
            conversations: 2156,
            products: 456,
            joinDate: '2024-01-20',
            lastActive: '2025-01-14',
            subdomain: 'mobilierdesign',
            contactName: 'Jean Martin',
            phone: '+33 1 34 56 78 90',
            address: '456 Avenue Montaigne',
            city: 'Lyon',
            siret: '23456789012345'
          }
        ];
        setRetailers(demoRetailers);
        localStorage.setItem('approved_retailers', JSON.stringify(demoRetailers));
      }
    } catch (error) {
      console.error('Erreur chargement revendeurs:', error);
    }
  }, []);

  // Sauvegarder les revendeurs dans localStorage
  useEffect(() => {
    localStorage.setItem('approved_retailers', JSON.stringify(retailers));
  }, [retailers]);

  const handleApproveApplication = (application: Application) => {
    console.log('✅ APPROBATION:', application.companyName);
    
    // Créer le nouveau revendeur
    const newRetailer: Retailer = {
      id: `retailer-${Date.now()}`,
      companyName: application.companyName,
      email: application.email,
      password: application.password,
      plan: application.selectedPlan,
      status: 'active',
      revenue: 0,
      conversations: 0,
      products: 0,
      joinDate: new Date().toISOString().split('T')[0],
      lastActive: new Date().toISOString().split('T')[0],
      subdomain: application.proposedSubdomain,
      contactName: `${application.firstName} ${application.lastName}`,
      phone: application.phone,
      address: application.address,
      city: application.city,
      siret: application.siret
    };

    // Ajouter aux revendeurs
    setRetailers(prev => [...prev, newRetailer]);
    
    // Supprimer de la liste des demandes
    onValidateApplication(application.id, true);
    
    // Simuler l'envoi d'email
    console.log('📧 EMAIL APPROBATION envoyé à:', application.email);
    console.log('🔑 Identifiants:', {
      email: application.email,
      password: application.password,
      subdomain: `${application.proposedSubdomain}.omnia.sale`
    });
    
    alert(`✅ Revendeur approuvé !\n\nIdentifiants envoyés à ${application.email} :\n• Email: ${application.email}\n• Mot de passe: ${application.password}\n• Domaine: ${application.proposedSubdomain}.omnia.sale`);
  };

  const handleRejectApplication = (application: Application) => {
    const reason = prompt('Raison du rejet (sera envoyée par email) :');
    if (reason) {
      console.log('❌ REJET:', application.companyName, 'Raison:', reason);
      console.log('📧 EMAIL REJET envoyé à:', application.email);
      
      onValidateApplication(application.id, false);
      alert(`❌ Demande rejetée.\n\nEmail envoyé à ${application.email} avec la raison :\n"${reason}"`);
    }
  };

  const handleViewApplication = (application: Application) => {
    setSelectedApplication(application);
    setShowApplicationModal(true);
  };

  const handleEditApplication = (application: Application) => {
    setSelectedApplication(application);
    setShowApplicationModal(true);
  };

  const handleDeleteApplication = (applicationId: string) => {
    if (confirm('Supprimer définitivement cette demande ?')) {
      onValidateApplication(applicationId, false);
      console.log('🗑️ Demande supprimée:', applicationId);
    }
  };

  const handleViewKbis = (application: Application) => {
    if (application.kbisFile) {
      setSelectedKbis({ application, kbisFile: application.kbisFile });
      setShowKbisModal(true);
    } else {
      alert('Aucun document Kbis disponible pour cette demande.');
    }
  };

  const handleCreateRetailer = (retailerData: any) => {
    const newRetailer: Retailer = {
      id: `retailer-${Date.now()}`,
      companyName: retailerData.companyName,
      email: retailerData.email,
      password: retailerData.password,
      plan: retailerData.plan,
      status: 'active',
      revenue: 0,
      conversations: 0,
      products: 0,
      joinDate: new Date().toISOString().split('T')[0],
      lastActive: new Date().toISOString().split('T')[0],
      subdomain: retailerData.companyName.toLowerCase().replace(/[^a-z0-9]/g, '').substring(0, 20),
      contactName: `${retailerData.firstName} ${retailerData.lastName}`,
      phone: retailerData.phone,
      address: retailerData.address,
      city: retailerData.city,
      siret: retailerData.siret
    }
  }
}