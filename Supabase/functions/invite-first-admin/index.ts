import { serve } from 'https://deno.land/std@0.177.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.8'
import { corsHeaders } from '../_shared/cors.ts'

serve(async (req) => {
  if (req.method === 'OPTIONS') { return new Response('ok', { headers: corsHeaders }) }
  try {
    const { adminEmail, domain } = await req.json();
    if (!adminEmail || !domain) throw new Error("Admin email and domain are required.");
    if (adminEmail.split('@')[1] !== domain) throw new Error("Admin email must belong to the verified domain.");

    const supabaseAdmin = createClient(Deno.env.get('SUPABASE_URL')!, Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!);

    const { data: orgData, error: orgError } = await supabaseAdmin.from('organizations').select('id').eq('verified_domain', domain).eq('is_verified', true).single();
    if (orgError || !orgData) throw new Error("Cannot send invite: Organization is not verified.");

    const { error: inviteError } = await supabaseAdmin.auth.admin.inviteUserByEmail(adminEmail);
    if (inviteError) throw inviteError;

    return new Response(JSON.stringify({ success: true, message: `Invitation sent to ${adminEmail}.` }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 });
  }
})