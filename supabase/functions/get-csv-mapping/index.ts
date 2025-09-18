const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
};

import { createClient } from 'npm:@supabase/supabase-js@2';

interface GetMappingRequest {
  retailer_id: string;
}

// Default mappings template
const DEFAULT_MAPPINGS = [
  // Product basics
  { csv_header: 'Handle', shopify_field: 'Handle', is_required: true, default_value: null },
  { csv_header: 'Title', shopify_field: 'Title', is_required: true, default_value: null },
  { csv_header: 'Body (HTML)', shopify_field: 'Body (HTML)', is_required: false, default_value: null },
  { csv_header: 'Vendor', shopify_field: 'Vendor', is_required: false, default_value: 'Decora Home' },
  { csv_header: 'Product Category', shopify_field: 'Product Category', is_required: false, default_value: null },
  { csv_header: 'Type', shopify_field: 'Type', is_required: false, default_value: null },
  { csv_header: 'Tags', shopify_field: 'Tags', is_required: false, default_value: null },
  { csv_header: 'Published', shopify_field: 'Published', is_required: false, default_value: 'TRUE' },

  // Options
  { csv_header: 'Option1 Name', shopify_field: 'Option1 Name', is_required: false, default_value: null },
  { csv_header: 'Option1 Value', shopify_field: 'Option1 Value', is_required: false, default_value: null },
  { csv_header: 'Option1 Linked To', shopify_field: 'Option1 Linked To', is_required: false, default_value: null },
  { csv_header: 'Option2 Name', shopify_field: 'Option2 Name', is_required: false, default_value: null },
  { csv_header: 'Option2 Value', shopify_field: 'Option2 Value', is_required: false, default_value: null },
  { csv_header: 'Option2 Linked To', shopify_field: 'Option2 Linked To', is_required: false, default_value: null },
  { csv_header: 'Option3 Name', shopify_field: 'Option3 Name', is_required: false, default_value: null },
  { csv_header: 'Option3 Value', shopify_field: 'Option3 Value', is_required: false, default_value: null },
  { csv_header: 'Option3 Linked To', shopify_field: 'Option3 Linked To', is_required: false, default_value: null },

  // Variants
  { csv_header: 'Variant SKU', shopify_field: 'Variant SKU', is_required: false, default_value: null },
  { csv_header: 'Variant Grams', shopify_field: 'Variant Grams', is_required: false, default_value: '0' },
  { csv_header: 'Variant Inventory Tracker', shopify_field: 'Variant Inventory Tracker', is_required: false, default_value: 'shopify' },
  { csv_header: 'Variant Inventory Qty', shopify_field: 'Variant Inventory Qty', is_required: false, default_value: '0' },
  { csv_header: 'Variant Inventory Policy', shopify_field: 'Variant Inventory Policy', is_required: false, default_value: 'deny' },
  { csv_header: 'Variant Fulfillment Service', shopify_field: 'Variant Fulfillment Service', is_required: false, default_value: 'manual' },
  { csv_header: 'Variant Price', shopify_field: 'Variant Price', is_required: true, default_value: '0' },
  { csv_header: 'Variant Compare At Price', shopify_field: 'Variant Compare At Price', is_required: false, default_value: null },
  { csv_header: 'Variant Requires Shipping', shopify_field: 'Variant Requires Shipping', is_required: false, default_value: 'TRUE' },
  { csv_header: 'Variant Taxable', shopify_field: 'Variant Taxable', is_required: false, default_value: 'TRUE' },
  { csv_header: 'Variant Barcode', shopify_field: 'Variant Barcode', is_required: false, default_value: null },

  // Images
  { csv_header: 'Image Src', shopify_field: 'Image Src', is_required: false, default_value: null },
  { csv_header: 'Image Position', shopify_field: 'Image Position', is_required: false, default_value: '1' },
  { csv_header: 'Image Alt Text', shopify_field: 'Image Alt Text', is_required: false, default_value: null },

  // Misc
  { csv_header: 'Gift Card', shopify_field: 'Gift Card', is_required: false, default_value: 'FALSE' },
  { csv_header: 'SEO Title', shopify_field: 'SEO Title', is_required: false, default_value: null },
  { csv_header: 'SEO Description', shopify_field: 'SEO Description', is_required: false, default_value: null }
];

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, {
      status: 200,
      headers: corsHeaders,
    });
  }

  try {
    const { retailer_id }: GetMappingRequest = await req.json();
    
    console.log('📋 Récupération mappage CSV pour:', retailer_id);

    // Initialize Supabase
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Get existing mappings
    const { data: existingMappings, error } = await supabase
      .from('csv_field_mappings')
      .select('*')
      .eq('retailer_id', retailer_id);

    if (error) {
      console.error('❌ Erreur récupération mappage:', error);
      throw error;
    }

    // If no mappings exist, create default ones
    if (!existingMappings || existingMappings.length === 0) {
      console.log('🔧 Création mappage par défaut...');
      
      const defaultMappingData = DEFAULT_MAPPINGS.map(mapping => ({
        retailer_id,
        ...mapping
      }));

      const { data: newMappings, error: insertError } = await supabase
        .from('csv_field_mappings')
        .insert(defaultMappingData)
        .select();

      if (insertError) {
        console.error('❌ Erreur création mappage par défaut:', insertError);
        throw insertError;
      }

      console.log('✅ Mappage par défaut créé:', newMappings?.length || 0, 'champs');

      return new Response(
        JSON.stringify({
          success: true,
          mappings: newMappings || [],
          is_default: true
        }),
        {
          headers: {
            'Content-Type': 'application/json',
            ...corsHeaders,
          },
        }
      );
    }

    console.log('✅ Mappage existant récupéré:', existingMappings.length, 'champs');

    return new Response(
      JSON.stringify({
        success: true,
        mappings: existingMappings,
        is_default: false
      }),
      {
        headers: {
          'Content-Type': 'application/json',
          ...corsHeaders,
        },
      }
    );

  } catch (error) {
    console.error('❌ Erreur récupération mappage CSV:', error);
    
    return new Response(
      JSON.stringify({
        success: false,
        error: 'Erreur lors de la récupération du mappage',
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