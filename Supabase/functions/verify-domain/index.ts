import { serve } from 'https://deno.land/std@0.177.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.8'
import { corsHeaders } from '../_shared/cors.ts'

serve(async (req) => {
  if (req.method === 'OPTIONS') { return new Response('ok', { headers: corsHeaders }) }
  try {
    const { domain } = await req.json();
    if (!domain) throw new Error("Domain is required.");

    const supabaseAdmin = createClient(Deno.env.get('SUPABASE_URL')!, Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!);

    const { data: orgData, error: orgError } = await supabaseAdmin.from('organizations').select('verification_token, is_verified').eq('verified_domain', domain).single();
    if (orgError) throw new Error("Could not find an organization for this domain.");
    if (orgData.is_verified) return new Response(JSON.stringify({ success: true, message: 'Domain is already verified.' }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } });

    const expectedToken = `${orgData.verification_token}`;
    let isVerified = false;
    const txtRecords = await Deno.resolveDns(domain, "TXT");

    for (const record of txtRecords) { if (record.includes(expectedToken)) { isVerified = true; break; } }

    if (isVerified) {
      await supabaseAdmin.from('organizations').update({ is_verified: true, verification_token: null // <-- The added line }).eq('verified_domain', domain);
      return new Response(JSON.stringify({ success: true, message: 'Domain verified!' }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    } else {
      throw new Error("Verification failed. TXT record not found or has not propagated yet.");
    }
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 });
  }
})