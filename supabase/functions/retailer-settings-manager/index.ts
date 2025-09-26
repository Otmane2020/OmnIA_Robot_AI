const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
};

import { createClient } from 'npm:@supabase/supabase-js@2';

interface RetailerSettingsRequest {
  action: 'get' | 'update';
  retailer_id: string;
  settings?: {
    // Company information (from /register)
    company_name?: string;
    contact_name?: string;
    email?: string;
    phone?: string;
    address?: string;
    city?: string;
    postal_code?: string;
    siret?: string;
    position?: string;
    
    // Robot configuration
    robot_name?: string;
    robot_personality?: 'commercial' | 'expert' | 'friendly';
    language?: 'fr' | 'en' | 'es' | 'de';
    voice_provider?: 'browser' | 'elevenlabs' | 'openai';
    voice_speed?: number;
    theme_colors?: {
      primary: string;
      secondary: string;
    };
    widget_position?: 'bottom-right' | 'bottom-left';
    auto_training?: boolean;
  };
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, {
      status: 200,
      headers: corsHeaders,
    });
  }

  try {
    const { action, retailer_id, settings }: RetailerSettingsRequest = await req.json();
    
    console.log('⚙️ [retailer-settings] Action:', action, 'pour retailer:', retailer_id);
    
    // Validate retailer_id as UUID
    const isRetailerIdUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(retailer_id);
    if (retailer_id && !isRetailerIdUuid) {
      return new Response(
        JSON.stringify({
          success: false,
          error: 'Invalid retailer_id format. Must be a valid UUID.',
          details: `Received retailer_id: ${retailer_id}`
        }),
        {
          status: 400,
          headers: { 'Content-Type': 'application/json', ...corsHeaders }
        }
      );
    }

    // Initialize Supabase
    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
    
    if (!supabaseUrl || !supabaseKey) {
      throw new Error('Configuration Supabase manquante');
    }
    
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Validate retailer exists
    const { data: retailer, error: retailerError } = await supabase
      .from('retailers')
      .select('*')
      .eq('id', retailer_id)
      .single();

    if (retailerError || !retailer) {
      throw new Error(`Retailer ${retailer_id} non trouvé`);
    }

    if (action === 'get') {
      // Get current settings
      const { data: currentSettings } = await supabase
        .from('retailer_settings')
        .select('*')
        .eq('retailer_id', retailer_id)
        .single();

      const responseSettings = {
        // Company info from retailers table
        company_name: retailer.company_name,
        contact_name: retailer.contact_name,
        email: retailer.email,
        phone: retailer.phone,
        address: retailer.address,
        city: retailer.city,
        postal_code: retailer.postal_code,
        siret: retailer.siret,
        position: retailer.position,
        
        // Robot settings from retailer_settings table or defaults
        robot_name: currentSettings?.robot_name || 'OmnIA',
        robot_personality: currentSettings?.robot_personality || 'commercial',
        language: currentSettings?.language || 'fr',
        voice_provider: currentSettings?.voice_provider || 'browser',
        voice_speed: currentSettings?.voice_speed || 1.0,
        theme_colors: currentSettings?.theme_colors || {
          primary: '#0891b2',
          secondary: '#1e40af'
        },
        widget_position: currentSettings?.widget_position || 'bottom-right',
        auto_training: currentSettings?.auto_training !== false
      };

      return new Response(
        JSON.stringify({
          success: true,
          settings: responseSettings,
          retailer_id
        }),
        {
          headers: {
            'Content-Type': 'application/json',
            ...corsHeaders,
          },
        }
      );

    } else if (action === 'update' && settings) {
      // Update company information in retailers table
      const companyUpdates: any = {};
      if (settings.company_name) companyUpdates.company_name = settings.company_name;
      if (settings.contact_name) companyUpdates.contact_name = settings.contact_name;
      if (settings.email) companyUpdates.email = settings.email;
      if (settings.phone) companyUpdates.phone = settings.phone;
      if (settings.address) companyUpdates.address = settings.address;
      if (settings.city) companyUpdates.city = settings.city;
      if (settings.postal_code) companyUpdates.postal_code = settings.postal_code;
      if (settings.siret) companyUpdates.siret = settings.siret;
      if (settings.position) companyUpdates.position = settings.position;

      if (Object.keys(companyUpdates).length > 0) {
        companyUpdates.updated_at = new Date().toISOString();
        
        const { error: retailerUpdateError } = await supabase
          .from('retailers')
          .update(companyUpdates)
          .eq('id', retailer_id);

        if (retailerUpdateError) {
          console.error('❌ [retailer-settings] Erreur mise à jour retailer:', retailerUpdateError);
          throw retailerUpdateError;
        }
      }

      // Update robot settings in retailer_settings table
      const robotSettings: any = {
        retailer_id,
        updated_at: new Date().toISOString()
      };
      
      if (settings.robot_name) robotSettings.robot_name = settings.robot_name;
      if (settings.robot_personality) robotSettings.robot_personality = settings.robot_personality;
      if (settings.language) robotSettings.language = settings.language;
      if (settings.voice_provider) robotSettings.voice_provider = settings.voice_provider;
      if (settings.voice_speed) robotSettings.voice_speed = settings.voice_speed;
      if (settings.theme_colors) robotSettings.theme_colors = settings.theme_colors;
      if (settings.widget_position) robotSettings.widget_position = settings.widget_position;
      if (settings.auto_training !== undefined) robotSettings.auto_training = settings.auto_training;

      const { error: settingsError } = await supabase
        .from('retailer_settings')
        .upsert(robotSettings, { onConflict: 'retailer_id' });

      if (settingsError) {
        console.error('❌ [retailer-settings] Erreur mise à jour settings:', settingsError);
        throw settingsError;
      }

      console.log('✅ [retailer-settings] Paramètres mis à jour pour:', retailer.company_name);

      return new Response(
        JSON.stringify({
          success: true,
          message: 'Paramètres mis à jour avec succès',
          retailer_id,
          updated_at: new Date().toISOString()
        }),
        {
          headers: {
            'Content-Type': 'application/json',
            ...corsHeaders,
          },
        }
      );
    }

    throw new Error('Action non supportée');

  } catch (error) {
    console.error('❌ [retailer-settings] Erreur:', error);
    
    return new Response(
      JSON.stringify({
        success: false,
        error: 'Erreur lors de la gestion des paramètres',
        details: error.message
      }),
      {
        status: 500,
        headers: {
          'Content-Type': 'application/json',
          ...corsHeaders,
        },
      }
    );
  }
});