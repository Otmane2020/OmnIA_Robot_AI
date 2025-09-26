const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
};

import { createClient } from 'npm:@supabase/supabase-js@2';

interface ShopifyImportRequest {
  products: any[];
  store_id: string;
  import_type: 'csv' | 'api' | 'xml';
  mapping_config?: {
    title_field?: string;
    price_field?: string;
    description_field?: string;
    image_field?: string;
  };
}

interface ShopifyProductData {
  handle: string;
  title: string;
  body_html: string;
  vendor: string;
  product_category: string;
  product_type: string;
  tags: string;
  published: boolean;
  
  // Options
  option1_name: string;
  option1_value: string;
  option1_linked_to: string;
  option2_name: string;
  option2_value: string;
  option2_linked_to: string;
  option3_name: string;
  option3_value: string;
  option3_linked_to: string;
  
  // Variant details
  variant_sku: string;
  variant_grams: number;
  variant_inventory_tracker: string;
  variant_inventory_qty: number;
  variant_inventory_policy: string;
  variant_fulfillment_service: string;
  variant_price: number;
  variant_compare_at_price?: number;
  variant_requires_shipping: boolean;
  variant_taxable: boolean;
  variant_barcode: string;
  
  // Images
  image_src: string;
  image_position: number;
  image_alt_text: string;
  variant_image: string;
  
  // Settings
  gift_card: boolean;
  variant_weight_unit: string;
  variant_tax_code: string;
  cost_per_item: number;
  status: string;
  
  // SEO
  seo_title: string;
  seo_description: string;
  seo_hidden: boolean;
  
  // Google Shopping
  google_product_category: string;
  google_gender: string;
  google_age_group: string;
  google_mpn: string;
  google_condition: string;
  google_custom_product: string;
  google_custom_label_0: string;
  google_custom_label_1: string;
  google_custom_label_2: string;
  google_custom_label_3: string;
  google_custom_label_4: string;
  
  // Metafields
  breadcrumbs: string;
  globo_swatch_group: string;
  globo_swatch_group_2: string;
  easyflow_options: any;
  rating_count: number;
  
  // Shopify metafields
  back_type: string;
  backrest_type: string;
  backrest_upholstery_color: string;
  backrest_upholstery_material: string;
  bed_frame_features: string;
  bedding_size: string;
  chair_features: string;
  color_pattern: string;
  decoration_material: string;
  door_material: string;
  door_type: string;
  firmness: string;
  flower_color: string;
  frame_color: string;
  furniture_fixture_features: string;
  furniture_fixture_material: string;
  kitchen_dining_items_included: string;
  leg_color: string;
  light_color: string;
  light_temperature: string;
  material: string;
  mattress_features: string;
  mount_stand_features: string;
  mounting_type: string;
  plant_class: string;
  plant_name: string;
  seat_type: string;
  seat_upholstery_color: string;
  seat_upholstery_material: string;
  shape: string;
  style: string;
  suitable_location: string;
  tabletop_color: string;
  tabletop_material: string;
  tabletop_shape: string;
  upholstery_color: string;
  upholstery_material: string;
  
  store_id: string;
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, {
      status: 200,
      headers: corsHeaders,
    });
  }

  try {
    const { products, store_id, import_type, mapping_config }: ShopifyImportRequest = await req.json();
    
    console.log('📦 Import Shopify:', {
      // Validate store_id as UUID
      const isStoreIdUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(store_id);
      if (store_id && !isStoreIdUuid) {
        return new Response(
          JSON.stringify({
            success: false,
            error: 'Invalid store_id format. Must be a valid UUID.',
            details: `Received store_id: ${store_id}`
          }),
          {
            status: 400,
            headers: { 'Content-Type': 'application/json', ...corsHeaders }
          }
        );
      }
      products_count: products.length,
      store_id,
      import_type
    });

    // Initialize Supabase
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Map products to Shopify format
    const mappedProducts: ShopifyProductData[] = [];
    
    for (const product of products) {
      try {
        const mappedProduct = mapProductToShopifyFormat(product, store_id, import_type, mapping_config);
        mappedProducts.push(mappedProduct);
      } catch (error) {
        console.error('❌ Erreur mapping produit:', error);
        // Continue with other products
      }
    }

    console.log(`✅ ${mappedProducts.length}/${products.length} produits mappés`);

    // Insert into database
    if (mappedProducts.length > 0) {
      const { data, error } = await supabase
        .from('shopify_products')
        .upsert(mappedProducts, { 
          onConflict: 'store_id,handle',
          ignoreDuplicates: false 
        })
        .select();

      if (error) {
        console.error('❌ Erreur insertion DB:', error);
        throw error;
      }

      console.log('✅ Produits insérés en DB:', data?.length || 0);

      // Also add to ai_products for AI training
      const aiProducts = mappedProducts.map(product => ({
        id: `shopify-${product.handle}-${store_id}`,
        name: product.title,
        description: stripHtml(product.body_html),
        price: product.variant_price,
        category: product.product_type || product.product_category || 'Mobilier',
        vendor: product.vendor || 'Boutique',
        image_url: product.image_src || '',
        product_url: `#${product.handle}`,
        stock: product.variant_inventory_qty,
        source_platform: 'shopify',
        store_id: store_id,
        extracted_attributes: extractAttributesFromShopify(product),
        confidence_score: calculateShopifyConfidence(product),
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }));

      const { error: aiError } = await supabase
        .from('ai_products')
        .upsert(aiProducts, { onConflict: 'id' });

      if (aiError) {
        console.warn('⚠️ Erreur ajout ai_products:', aiError);
      } else {
        console.log('✅ Produits ajoutés à ai_products pour IA');
      }
    }

    return new Response(
      JSON.stringify({
        success: true,
        message: `${mappedProducts.length} produits Shopify importés avec succès`,
        stats: {
          total_products: products.length,
          mapped_products: mappedProducts.length,
          import_type,
          store_id,
          imported_at: new Date().toISOString()
        }
      }),
      {
        headers: {
          'Content-Type': 'application/json',
          ...corsHeaders,
        },
      }
    );

  } catch (error) {
    console.error('❌ Erreur import Shopify:', error);
    
    return new Response(
      JSON.stringify({
        success: false,
        error: 'Erreur lors de l\'import des produits Shopify',
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

function mapProductToShopifyFormat(
  product: any, 
  store_id: string, 
  import_type: string,
  mapping_config?: any
): ShopifyProductData {
  
  // Handle different import sources
  if (import_type === 'api') {
    return mapShopifyAPIProduct(product, store_id);
  } else if (import_type === 'csv') {
    return mapCSVProduct(product, store_id, mapping_config);
  } else if (import_type === 'xml') {
    return mapXMLProduct(product, store_id);
  }
  
  throw new Error(`Type d'import non supporté: ${import_type}`);
}

function mapShopifyAPIProduct(product: any, store_id: string): ShopifyProductData {
  const firstVariant = product.variants?.[0] || {};
  const firstImage = product.images?.[0] || {};
  
  return {
    store_id,
    handle: product.handle || generateHandle(product.title),
    title: product.title || '',
    body_html: product.body_html || product.description || '',
    vendor: product.vendor || '',
    product_category: product.product_type || '',
    product_type: product.product_type || '',
    tags: Array.isArray(product.tags) ? product.tags.join(', ') : (product.tags || ''),
    published: product.status === 'active',
    
    // Options from first variant
    option1_name: firstVariant.option1 ? 'Option 1' : '',
    option1_value: firstVariant.option1 || '',
    option1_linked_to: '',
    option2_name: firstVariant.option2 ? 'Option 2' : '',
    option2_value: firstVariant.option2 || '',
    option2_linked_to: '',
    option3_name: firstVariant.option3 ? 'Option 3' : '',
    option3_value: firstVariant.option3 || '',
    option3_linked_to: '',
    
    // Variant details
    variant_sku: firstVariant.sku || '',
    variant_grams: firstVariant.grams || firstVariant.weight || 0,
    variant_inventory_tracker: firstVariant.inventory_management || '',
    variant_inventory_qty: firstVariant.inventory_quantity || 0,
    variant_inventory_policy: firstVariant.inventory_policy || 'deny',
    variant_fulfillment_service: firstVariant.fulfillment_service || 'manual',
    variant_price: parseFloat(firstVariant.price) || 0,
    variant_compare_at_price: firstVariant.compare_at_price ? parseFloat(firstVariant.compare_at_price) : null,
    variant_requires_shipping: firstVariant.requires_shipping !== false,
    variant_taxable: firstVariant.taxable !== false,
    variant_barcode: firstVariant.barcode || '',
    
    // Images
    image_src: firstImage.src || product.featured_image || '',
    image_position: firstImage.position || 0,
    image_alt_text: firstImage.alt || product.title || '',
    variant_image: firstVariant.image_id ? firstImage.src : '',
    
    // Settings
    gift_card: product.gift_card || false,
    variant_weight_unit: firstVariant.weight_unit || 'kg',
    variant_tax_code: firstVariant.tax_code || '',
    cost_per_item: 0,
    status: product.status || 'active',
    
    // SEO
    seo_title: product.seo_title || product.title || '',
    seo_description: product.seo_description || '',
    seo_hidden: false,
    
    // Google Shopping (defaults)
    google_product_category: '',
    google_gender: '',
    google_age_group: '',
    google_mpn: '',
    google_condition: 'new',
    google_custom_product: '',
    google_custom_label_0: '',
    google_custom_label_1: '',
    google_custom_label_2: '',
    google_custom_label_3: '',
    google_custom_label_4: '',
    
    // Metafields (defaults)
    breadcrumbs: '',
    globo_swatch_group: '',
    globo_swatch_group_2: '',
    easyflow_options: {},
    rating_count: 0,
    
    // Shopify metafields (extract from product if available)
    back_type: extractMetafield(product, 'back-type'),
    backrest_type: extractMetafield(product, 'backrest-type'),
    backrest_upholstery_color: extractMetafield(product, 'backrest-upholstery-color'),
    backrest_upholstery_material: extractMetafield(product, 'backrest-upholstery-material'),
    bed_frame_features: extractMetafield(product, 'bed-frame-features'),
    bedding_size: extractMetafield(product, 'bedding-size'),
    chair_features: extractMetafield(product, 'chair-features'),
    color_pattern: extractMetafield(product, 'color-pattern'),
    decoration_material: extractMetafield(product, 'decoration-material'),
    door_material: extractMetafield(product, 'door-material'),
    door_type: extractMetafield(product, 'door-type'),
    firmness: extractMetafield(product, 'firmness'),
    flower_color: extractMetafield(product, 'flower-color'),
    frame_color: extractMetafield(product, 'frame-color'),
    furniture_fixture_features: extractMetafield(product, 'furniture-fixture-features'),
    furniture_fixture_material: extractMetafield(product, 'furniture-fixture-material'),
    kitchen_dining_items_included: extractMetafield(product, 'kitchen-dining-furniture-items-included'),
    leg_color: extractMetafield(product, 'leg-color'),
    light_color: extractMetafield(product, 'light-color'),
    light_temperature: extractMetafield(product, 'light-temperature'),
    material: extractMetafield(product, 'material'),
    mattress_features: extractMetafield(product, 'mattress-features'),
    mount_stand_features: extractMetafield(product, 'mount-stand-features'),
    mounting_type: extractMetafield(product, 'mounting-type'),
    plant_class: extractMetafield(product, 'plant-class'),
    plant_name: extractMetafield(product, 'plant-name'),
    seat_type: extractMetafield(product, 'seat-type'),
    seat_upholstery_color: extractMetafield(product, 'seat-upholstery-color'),
    seat_upholstery_material: extractMetafield(product, 'seat-upholstery-material'),
    shape: extractMetafield(product, 'shape'),
    style: extractMetafield(product, 'style'),
    suitable_location: extractMetafield(product, 'suitable-location'),
    tabletop_color: extractMetafield(product, 'tabletop-color'),
    tabletop_material: extractMetafield(product, 'tabletop-material'),
    tabletop_shape: extractMetafield(product, 'tabletop-shape'),
    upholstery_color: extractMetafield(product, 'upholstery-color'),
    upholstery_material: extractMetafield(product, 'upholstery-material')
  };
}

function mapCSVProduct(product: any, store_id: string, mapping_config?: any): ShopifyProductData {
  const config = mapping_config || {};
  
  return {
    store_id,
    handle: product.Handle || generateHandle(product[config.title_field] || product.Title || product.nom),
    title: product.Title || product[config.title_field] || product.nom || '',
    body_html: product['Body (HTML)'] || product[config.description_field] || product.description || '',
    vendor: product.Vendor || product.vendor || product.marque || '',
    product_category: product['Product Category'] || product.category || product.categorie || '',
    product_type: product.Type || product.type || '',
    tags: product.Tags || product.tags || '',
    published: product.Published !== 'FALSE',
    
    // Options
    option1_name: product['Option1 Name'] || '',
    option1_value: product['Option1 Value'] || '',
    option1_linked_to: product['Option1 Linked To'] || '',
    option2_name: product['Option2 Name'] || '',
    option2_value: product['Option2 Value'] || '',
    option2_linked_to: product['Option2 Linked To'] || '',
    option3_name: product['Option3 Name'] || '',
    option3_value: product['Option3 Value'] || '',
    option3_linked_to: product['Option3 Linked To'] || '',
    
    // Variant details
    variant_sku: product['Variant SKU'] || '',
    variant_grams: parseInt(product['Variant Grams']) || 0,
    variant_inventory_tracker: product['Variant Inventory Tracker'] || '',
    variant_inventory_qty: parseInt(product['Variant Inventory Qty']) || 0,
    variant_inventory_policy: product['Variant Inventory Policy'] || 'deny',
    variant_fulfillment_service: product['Variant Fulfillment Service'] || 'manual',
    variant_price: parseFloat(product['Variant Price'] || product[config.price_field] || product.prix) || 0,
    variant_compare_at_price: product['Variant Compare At Price'] ? parseFloat(product['Variant Compare At Price']) : null,
    variant_requires_shipping: product['Variant Requires Shipping'] !== 'FALSE',
    variant_taxable: product['Variant Taxable'] !== 'FALSE',
    variant_barcode: product['Variant Barcode'] || '',
    
    // Images
    image_src: product['Image Src'] || product[config.image_field] || product.image_url || '',
    image_position: parseInt(product['Image Position']) || 0,
    image_alt_text: product['Image Alt Text'] || '',
    variant_image: product['Variant Image'] || '',
    
    // Settings
    gift_card: product['Gift Card'] === 'TRUE',
    variant_weight_unit: product['Variant Weight Unit'] || 'kg',
    variant_tax_code: product['Variant Tax Code'] || '',
    cost_per_item: parseFloat(product['Cost per item']) || 0,
    status: product.Status || 'active',
    
    // SEO
    seo_title: product['SEO Title'] || '',
    seo_description: product['SEO Description'] || '',
    seo_hidden: product['SEO Hidden (product.metafields.seo.hidden)'] === 'TRUE',
    
    // Google Shopping
    google_product_category: product['Google Shopping / Google Product Category'] || '',
    google_gender: product['Google Shopping / Gender'] || '',
    google_age_group: product['Google Shopping / Age Group'] || '',
    google_mpn: product['Google Shopping / MPN'] || '',
    google_condition: product['Google Shopping / Condition'] || 'new',
    google_custom_product: product['Google Shopping / Custom Product'] || '',
    google_custom_label_0: product['Google Shopping / Custom Label 0'] || '',
    google_custom_label_1: product['Google Shopping / Custom Label 1'] || '',
    google_custom_label_2: product['Google Shopping / Custom Label 2'] || '',
    google_custom_label_3: product['Google Shopping / Custom Label 3'] || '',
    google_custom_label_4: product['Google Shopping / Custom Label 4'] || '',
    
    // Metafields
    breadcrumbs: product['Breadcrumbs (product.metafields.bodanu.product_custom_breadcrumbs)'] || '',
    globo_swatch_group: product['Globo swatch product group (product.metafields.globo-color-swatch--product-groups.gcs_product_groups)'] || '',
    globo_swatch_group_2: product['Globo swatch product group 2 (product.metafields.globo-color-swatch--product-groups.gcs_product_groups_2)'] || '',
    easyflow_options: parseJSON(product['EasyFlow Product options (product.metafields.product_options.options)']),
    rating_count: parseInt(product['Nombre d\'évaluations de produit (product.metafields.reviews.rating_count)']) || 0,
    
    // Shopify metafields
    back_type: product['Type de dossier (product.metafields.shopify.back-type)'] || '',
    backrest_type: product['Type de repose-dos (product.metafields.shopify.backrest-type)'] || '',
    backrest_upholstery_color: product['Couleur du revêtement du dossier (product.metafields.shopify.backrest-upholstery-color)'] || '',
    backrest_upholstery_material: product['Matériau de rembourrage du dossier (product.metafields.shopify.backrest-upholstery-material)'] || '',
    bed_frame_features: product['Caractéristiques du lit/cadre (product.metafields.shopify.bed-frame-features)'] || '',
    bedding_size: product['Taille des draps (product.metafields.shopify.bedding-size)'] || '',
    chair_features: product['Caractéristiques de la chaise (product.metafields.shopify.chair-features)'] || '',
    color_pattern: product['Couleur (product.metafields.shopify.color-pattern)'] || '',
    decoration_material: product['Matériau de décoration (product.metafields.shopify.decoration-material)'] || '',
    door_material: product['Matériau de la porte (product.metafields.shopify.door-material)'] || '',
    door_type: product['Type de porte (product.metafields.shopify.door-type)'] || '',
    firmness: product['Fermeté (product.metafields.shopify.firmness)'] || '',
    flower_color: product['Couleur de la fleur (product.metafields.shopify.flower-color)'] || '',
    frame_color: product['Couleur du cadre (product.metafields.shopify.frame-color)'] || '',
    furniture_fixture_features: product['Caractéristiques du meuble/luminaire (product.metafields.shopify.furniture-fixture-features)'] || '',
    furniture_fixture_material: product['Matériau du meuble/luminaire (product.metafields.shopify.furniture-fixture-material)'] || '',
    kitchen_dining_items_included: product['Meubles de cuisine/salle à manger inclus (product.metafields.shopify.kitchen-dining-furniture-items-included)'] || '',
    leg_color: product['Couleur des pieds (product.metafields.shopify.leg-color)'] || '',
    light_color: product['Couleur claire (product.metafields.shopify.light-color)'] || '',
    light_temperature: product['Température de la lumière (product.metafields.shopify.light-temperature)'] || '',
    material: product['Matériel (product.metafields.shopify.material)'] || '',
    mattress_features: product['Caractéristiques du matelas (product.metafields.shopify.mattress-features)'] || '',
    mount_stand_features: product['Caractéristiques du support (product.metafields.shopify.mount-stand-features)'] || '',
    mounting_type: product['Type de montage (product.metafields.shopify.mounting-type)'] || '',
    plant_class: product['Classe de plante (product.metafields.shopify.plant-class)'] || '',
    plant_name: product['Nom de la plante (product.metafields.shopify.plant-name)'] || '',
    seat_type: product['Type de siège (product.metafields.shopify.seat-type)'] || '',
    seat_upholstery_color: product['Couleur du revêtement du siège (product.metafields.shopify.seat-upholstery-color)'] || '',
    seat_upholstery_material: product['Matériau de rembourrage du siège (product.metafields.shopify.seat-upholstery-material)'] || '',
    shape: product['Forme (product.metafields.shopify.shape)'] || '',
    style: product['Style (product.metafields.shopify.style)'] || '',
    suitable_location: product['Emplacement approprié (product.metafields.shopify.suitable-location)'] || '',
    tabletop_color: product['Couleur du plateau de table (product.metafields.shopify.tabletop-color)'] || '',
    tabletop_material: product['Matériau du plateau de table (product.metafields.shopify.tabletop-material)'] || '',
    tabletop_shape: product['Forme du plateau de table (product.metafields.shopify.tabletop-shape)'] || '',
    upholstery_color: product['Couleur du revêtement (product.metafields.shopify.upholstery-color)'] || '',
    upholstery_material: product['Matériau du revêtement (product.metafields.shopify.upholstery-material)'] || ''
  };
}

function mapXMLProduct(product: any, store_id: string): ShopifyProductData {
  return {
    store_id,
    handle: product.handle || generateHandle(product.title),
    title: product.title || '',
    body_html: product.description || '',
    vendor: product.vendor || '',
    product_category: product.category || '',
    product_type: product.productType || '',
    tags: Array.isArray(product.tags) ? product.tags.join(', ') : '',
    published: true,
    
    // Basic variant info
    option1_name: '',
    option1_value: '',
    option1_linked_to: '',
    option2_name: '',
    option2_value: '',
    option2_linked_to: '',
    option3_name: '',
    option3_value: '',
    option3_linked_to: '',
    
    variant_sku: '',
    variant_grams: 0,
    variant_inventory_tracker: '',
    variant_inventory_qty: product.stock || 0,
    variant_inventory_policy: 'deny',
    variant_fulfillment_service: 'manual',
    variant_price: parseFloat(product.price) || 0,
    variant_compare_at_price: product.compareAtPrice ? parseFloat(product.compareAtPrice) : null,
    variant_requires_shipping: true,
    variant_taxable: true,
    variant_barcode: '',
    
    image_src: product.image_url || '',
    image_position: 0,
    image_alt_text: product.title || '',
    variant_image: '',
    
    gift_card: false,
    variant_weight_unit: 'kg',
    variant_tax_code: '',
    cost_per_item: 0,
    status: 'active',
    
    seo_title: product.title || '',
    seo_description: '',
    seo_hidden: false,
    
    // Google Shopping defaults
    google_product_category: '',
    google_gender: '',
    google_age_group: '',
    google_mpn: '',
    google_condition: 'new',
    google_custom_product: '',
    google_custom_label_0: '',
    google_custom_label_1: '',
    google_custom_label_2: '',
    google_custom_label_3: '',
    google_custom_label_4: '',
    
    // Metafields defaults
    breadcrumbs: '',
    globo_swatch_group: '',
    globo_swatch_group_2: '',
    easyflow_options: {},
    rating_count: 0,
    
    // Shopify metafields defaults
    back_type: '',
    backrest_type: '',
    backrest_upholstery_color: '',
    backrest_upholstery_material: '',
    bed_frame_features: '',
    bedding_size: '',
    chair_features: '',
    color_pattern: '',
    decoration_material: '',
    door_material: '',
    door_type: '',
    firmness: '',
    flower_color: '',
    frame_color: '',
    furniture_fixture_features: '',
    furniture_fixture_material: '',
    kitchen_dining_items_included: '',
    leg_color: '',
    light_color: '',
    light_temperature: '',
    material: '',
    mattress_features: '',
    mount_stand_features: '',
    mounting_type: '',
    plant_class: '',
    plant_name: '',
    seat_type: '',
    seat_upholstery_color: '',
    seat_upholstery_material: '',
    shape: '',
    style: '',
    suitable_location: '',
    tabletop_color: '',
    tabletop_material: '',
    tabletop_shape: '',
    upholstery_color: '',
    upholstery_material: ''
  };
}

function extractMetafield(product: any, fieldName: string): string {
  // Try to extract from metafields if available
  if (product.metafields) {
    const metafield = product.metafields.find((mf: any) => 
      mf.key === fieldName || mf.namespace === 'shopify' && mf.key === fieldName
    );
    if (metafield) {
      return metafield.value || '';
    }
  }
  
  // Try direct property access
  return product[fieldName] || '';
}

function generateHandle(title: string): string {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .trim()
    .substring(0, 100);
}

function stripHtml(html: string): string {
  return html.replace(/<[^>]*>/g, '').trim();
}

function parseJSON(jsonString: string): any {
  try {
    return JSON.parse(jsonString || '{}');
  } catch {
    return {};
  }
}

function extractAttributesFromShopify(product: ShopifyProductData): any {
  const attributes: any = {
    colors: [],
    materials: [],
    styles: [],
    features: [],
    room: []
  };

  // Extract from metafields
  if (product.color_pattern) attributes.colors.push(product.color_pattern);
  if (product.upholstery_color) attributes.colors.push(product.upholstery_color);
  if (product.frame_color) attributes.colors.push(product.frame_color);
  if (product.leg_color) attributes.colors.push(product.leg_color);
  
  if (product.material) attributes.materials.push(product.material);
  if (product.upholstery_material) attributes.materials.push(product.upholstery_material);
  if (product.furniture_fixture_material) attributes.materials.push(product.furniture_fixture_material);
  if (product.tabletop_material) attributes.materials.push(product.tabletop_material);
  
  if (product.style) attributes.styles.push(product.style);
  if (product.suitable_location) attributes.room.push(product.suitable_location);
  
  // Extract features from various fields
  if (product.chair_features) attributes.features.push(product.chair_features);
  if (product.bed_frame_features) attributes.features.push(product.bed_frame_features);
  if (product.furniture_fixture_features) attributes.features.push(product.furniture_fixture_features);

  return attributes;
}

function calculateShopifyConfidence(product: ShopifyProductData): number {
  let confidence = 0;
  
  // Basic info
  if (product.title) confidence += 20;
  if (product.body_html) confidence += 15;
  if (product.image_src) confidence += 15;
  if (product.variant_price > 0) confidence += 10;
  
  // Metafields add confidence
  if (product.material) confidence += 10;
  if (product.color_pattern) confidence += 10;
  if (product.style) confidence += 10;
  if (product.suitable_location) confidence += 5;
  if (product.chair_features || product.furniture_fixture_features) confidence += 5;
  
  return Math.min(confidence, 100);
}