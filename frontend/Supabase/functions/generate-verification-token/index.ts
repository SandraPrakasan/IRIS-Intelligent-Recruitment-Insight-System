// supabase/functions/generate-verification-token/index.ts

import { serve } from 'https://deno.land/std@0.177.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.8'
import { corsHeaders } from '../_shared/cors.ts'

serve(async (req) => {
  // This is the crucial block that handles the browser's preflight check
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { email } = await req.json();
    const domain = email.split('@')[1];
    if (!domain) {
      throw new Error("Invalid email format.");
    }

    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    );

    const { data: blockedDomain } = await supabaseAdmin
      .from('blocked_domains')
      .select('domain')
      .eq('domain', domain)
      .single();

    if (blockedDomain) {
      throw new Error("Please use a business email. Free email providers are not allowed.");
    }

    const { data, error } = await supabaseAdmin
      .from('organizations')
      .insert({
        name: domain,
        verified_domain: domain,
      })
      .select('verification_token')
      .single();

    if (error) throw error;

    return new Response(JSON.stringify({ 
        verification_token: data.verification_token,
        domain: domain
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    });

  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 400,
    });
  }
})