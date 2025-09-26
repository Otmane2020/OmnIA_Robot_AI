import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    // Create Supabase client with service role key for bypassing RLS
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false
        }
      }
    )

    const { 
      companyName,
      email,
      firstName,
      lastName,
      phone,
      address,
      city,
      postalCode,
      siret,
      position,
      selectedPlan,
      uniqueSubdomain,
      kbisFileName
    } = await req.json()

    console.log('📝 Processing retailer registration:', {
      companyName,
      email,
      uniqueSubdomain,
      selectedPlan
    })

    // 1. Create subdomain entry
    const { data: subdomainData, error: subdomainError } = await supabaseAdmin
      .from('retailer_subdomains')
      .insert({
        subdomain: uniqueSubdomain,
        dns_status: 'pending',
        ssl_status: 'pending'
      })
      .select()
      .single()

    if (subdomainError) {
      console.error('❌ Subdomain creation error:', subdomainError)
      throw new Error(`Failed to create subdomain: ${subdomainError.message}`)
    }

    console.log('✅ Subdomain created:', uniqueSubdomain)

    // 2. Create retailer application
    const { data: applicationData, error: applicationError } = await supabaseAdmin
      .from('retailer_applications')
      .insert({
        company_name: companyName,
        email: email,
        first_name: firstName,
        last_name: lastName,
        phone: phone,
        address: address,
        city: city,
        postal_code: postalCode,
        siret: siret,
        position: position,
        plan: selectedPlan,
        proposed_subdomain: uniqueSubdomain,
        kbis_document_url: kbisFileName ? `kbis-${Date.now()}.pdf` : null,
        status: 'pending'
      })
      .select()
      .single()

    if (applicationError) {
      console.error('❌ Application creation error:', applicationError)
      
      // Clean up subdomain if application creation fails
      await supabaseAdmin
        .from('retailer_subdomains')
        .delete()
        .eq('id', subdomainData.id)
      
      throw new Error(`Failed to create application: ${applicationError.message}`)
    }

    console.log('✅ Application created:', applicationData.id)

    // 3. Simulate DNS/SSL activation after 2 seconds
    setTimeout(async () => {
      try {
        await supabaseAdmin
          .from('retailer_subdomains')
          .update({
            dns_status: 'active',
            ssl_status: 'active',
            activated_at: new Date().toISOString()
          })
          .eq('id', subdomainData.id)
        
        console.log('🌐 DNS/SSL activated for:', uniqueSubdomain)
      } catch (error) {
        console.error('⚠️ DNS/SSL activation error:', error)
      }
    }, 2000)

    // Return success response
    return new Response(
      JSON.stringify({
        success: true,
        data: {
          applicationId: applicationData.id,
          subdomainId: subdomainData.id,
          subdomain: uniqueSubdomain,
          status: 'pending'
        }
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    )

  } catch (error) {
    console.error('❌ Registration error:', error)
    
    return new Response(
      JSON.stringify({
        success: false,
        error: error.message || 'Registration failed'
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      }
    )
  }
})