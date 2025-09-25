const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
};

import { createClient } from 'npm:@supabase/supabase-js@2';

interface SaveMappingRequest {
  retailer_id: string;
  mappings: Array<{
    csv_header: string;
    shopify_field: string;
    is_required: boolean;
    default_value?: string;
  }>;
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, {
      status: 200,
      headers: corsHeaders,
    });
  }

  try {
    const { retailer_id, mappings }: SaveMappingRequest = await req.json();
    
    console.log('💾 Sauvegarde mappage CSV:', {
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
      retailer_id,
      mappings_count: mappings.length
    });

    // Initialize Supabase
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Clear existing mappings for this retailer
    await supabase
      .from('csv_field_mappings')
      .delete()
      .eq('retailer_id', retailer_id);

    // Insert new mappings
    const mappingData = mappings.map(mapping => ({
      retailer_id,
      csv_header: mapping.csv_header,
      shopify_field: mapping.shopify_field,
      is_required: mapping.is_required,
      default_value: mapping.default_value
    }));

    const { data, error } = await supabase
      .from('csv_field_mappings')
      .insert(mappingData)
      .select();

    if (error) {
      console.error('❌ Erreur sauvegarde mappage:', error);
      throw error;
    }

    console.log('✅ Mappage sauvegardé:', data?.length || 0, 'champs');

    return new Response(
      JSON.stringify({
        success: true,
        message: `Mappage CSV sauvegardé avec succès`,
        saved_mappings: data?.length || 0
      }),
      {
        headers: {
          'Content-Type': 'application/json',
          ...corsHeaders,
        },
      }
    );

  } catch (error) {
    console.error('❌ Erreur sauvegarde mappage CSV:', error);
    
    return new Response(
      JSON.stringify({
        success: false,
        error: 'Erreur lors de la sauvegarde du mappage',
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