import { supabase } from './supabase';

export interface User {
  id: string;
  email: string;
  role: 'retailer' | 'super_admin';
  retailer_id?: string;
  company_name?: string;
  plan?: string;
}

export const signUp = async (email: string, password: string, userData: any) => {
  try {
    console.log('🔐 Inscription utilisateur:', email);

    // 1. Créer l'utilisateur dans Supabase Auth
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          company_name: userData.companyName,
          first_name: userData.firstName,
          last_name: userData.lastName,
          phone: userData.phone,
          role: 'retailer'
        }
      }
    });

    if (authError) {
      console.error('❌ Erreur auth:', authError);
      throw authError;
    }

    if (!authData.user) {
      throw new Error('Utilisateur non créé');
    }

    console.log('✅ Utilisateur auth créé:', authData.user.id);

    // 2. Créer le profil revendeur
    const { data: retailerData, error: retailerError } = await supabase
      .from('retailers')
      .insert({
        id: authData.user.id,
        email: email,
        company_name: userData.companyName,
        contact_name: `${userData.firstName} ${userData.lastName}`,
        phone: userData.phone,
        address: userData.address,
        city: userData.city,
        postal_code: userData.postalCode,
        siret: userData.siret,
        position: userData.position,
        plan: userData.selectedPlan || 'professional',
        status: 'pending_validation'
      })
      .select()
      .single();

    if (retailerError) {
      console.error('❌ Erreur création revendeur:', retailerError);
      throw retailerError;
    }

    console.log('✅ Revendeur créé:', retailerData);

    return {
      user: authData.user,
      retailer: retailerData
    };

  } catch (error) {
    console.error('❌ Erreur inscription:', error);
    throw error;
  }
};

export const signIn = async (email: string, password: string) => {
  try {
    console.log('🔐 Connexion utilisateur:', email);

    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password
    });

    if (error) {
      console.error('❌ Erreur connexion:', error);
      throw error;
    }

    if (!data.user) {
      throw new Error('Connexion échouée');
    }

    // Récupérer les infos revendeur
    const { data: retailerData } = await supabase
      .from('retailers')
      .select('*')
      .eq('id', data.user.id)
      .single();

    console.log('✅ Connexion réussie:', data.user.email);

    return {
      user: data.user,
      retailer: retailerData
    };

  } catch (error) {
    console.error('❌ Erreur connexion:', error);
    throw error;
  }
};

export const signOut = async () => {
  try {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
    console.log('✅ Déconnexion réussie');
  } catch (error) {
    console.error('❌ Erreur déconnexion:', error);
    throw error;
  }
};

export const getCurrentUser = async (): Promise<User | null> => {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) return null;

    // Récupérer les infos revendeur
    const { data: retailerData } = await supabase
      .from('retailers')
      .select('*')
      .eq('id', user.id)
      .single();

    return {
      id: user.id,
      email: user.email || '',
      role: user.user_metadata?.role || 'retailer',
      retailer_id: retailerData?.id,
      company_name: retailerData?.company_name,
      plan: retailerData?.plan
    };

  } catch (error) {
    console.error('❌ Erreur récupération utilisateur:', error);
    return null;
  }
};