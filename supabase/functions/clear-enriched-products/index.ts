const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
};

import { createClient } from 'npm:@supabase/supabase-js@2';

interface ClearEnrichedProductsRequest {
  retailer_id?: string;
  confirm_deletion?: boolean;
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, {
      status: 200,
      headers: corsHeaders,
    });
  }

  try {
    const { retailer_id, confirm_deletion = false }: ClearEnrichedProductsRequest = await req.json();
    
    console.log('🗑️ Demande de suppression produits enrichis:', {
      retailer_id,
      confirm_deletion
    });

    if (!confirm_deletion) {
      return new Response(
        JSON.stringify({
          success: false,
          error: 'Confirmation de suppression requise',
          details: 'Ajoutez confirm_deletion: true pour confirmer la suppression'
        }),
        {
          status: 400,
          headers: {
            'Content-Type': 'application/json',
            ...corsHeaders,
          },
        }
      );
    }

    // Initialize Supabase
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Compter les produits avant suppression
    const { count: totalCount } = await supabase
      .from('products_enriched')
      .select('*', { count: 'exact', head: true });

    console.log('📊 Produits enrichis avant suppression:', totalCount);

    // Build delete query
    let deleteQuery = supabase
      .from('products_enriched')
      .delete();

    // Si retailer_id spécifié et valide, supprimer seulement ses produits
    // Sinon, supprimer tous les produits enrichis en utilisant une comparaison UUID valide
    if (retailer_id && retailer_id !== "") {
      deleteQuery = deleteQuery.eq('retailer_id', retailer_id);
    } else {
      // Supprimer tous les produits enrichis en utilisant une comparaison UUID valide
      // '00000000-0000-0000-0000-000000000000' est un UUID valide et "minimum"
      deleteQuery = deleteQuery.gt('id', '00000000-0000-0000-0000-000000000000');
    }

    const { data, error, count } = await deleteQuery;

    if (error) {
      console.error('❌ Erreur suppression produits enrichis:', error);
      throw error;
    }

    console.log('✅ Produits enrichis supprimés:', count || 0);

    // Aussi nettoyer la table ai_products si spécifié
    // La colonne 'id' de ai_products est TEXT, donc neq('', '') est OK
    if (retailer_id && retailer_id !== "") {
      const { error: aiError } = await supabase
        .from('ai_products')
        .delete()
        .eq('store_id', retailer_id);

      if (aiError) {
        // Log warning but don't fail the main operation
        console.warn('⚠️ Erreur suppression ai_products pour retailer_id:', aiError);
      } else {
        console.log('✅ Produits IA supprimés pour retailer:', retailer_id);
      }
    } else {
      // Supprimer tous les produits IA
      const { error: aiError } = await supabase
        .from('ai_products')
        .delete()
        .neq('id', '');

      if (aiError) {
        console.warn('⚠️ Erreur suppression ai_products:', aiError);
      } else {
        console.log('✅ Tous les produits IA supprimés');
      }
    }

    // Réinitialiser les métadonnées d'entraînement
    await supabase
      .from('ai_training_metadata')
      .upsert({
        id: 'singleton',
        last_training: new Date().toISOString(),
        products_count: 0,
        training_type: 'reset',
        model_version: '1.0-reset',
        updated_at: new Date().toISOString()
      }, { onConflict: 'id' });

    return new Response(
      JSON.stringify({
        success: true,
        message: retailer_id ? 
          `Produits enrichis supprimés pour le revendeur ${retailer_id}` :
          'Tous les produits enrichis ont été supprimés',
        deleted_count: count || 0,
        total_before: totalCount || 0,
        retailer_id: retailer_id || 'all',
        deleted_at: new Date().toISOString()
      }),
      {
        headers: {
          'Content-Type': 'application/json',
          ...corsHeaders,
        },
      }
    );

  } catch (error) {
    console.error('❌ Erreur suppression produits enrichis:', error);
    
    return new Response(
      JSON.stringify({
        success: false,
        error: 'Erreur lors de la suppression des produits enrichis',
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