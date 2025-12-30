import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { v4 as uuidv4 } from 'https://deno.land/std@0.106.0/uuid/mod.ts';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { newAdminEmail } = await req.json();
    if (!newAdminEmail) {
      throw new Error("New admin's email is required.");
    }

    // Create an admin client to bypass RLS
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    );

    // Get the current user from the request's auth token
    const authHeader = req.headers.get('Authorization')!;
    const jwt = authHeader.replace('Bearer ', '');
    const { data: { user } } = await supabaseAdmin.auth.getUser(jwt);
    if (!user) {
      throw new Error("Could not identify the current user.");
    }

    // 1. Generate a secure, unique token for the transfer
    const transferToken = uuidv4();
    const expiryDate = new Date();
    expiryDate.setHours(expiryDate.getHours() + 24); // Token is valid for 24 hours

    // 2. Store the token and link it to the current user's company
    // This assumes the 'companies' table has 'admin_transfer_token' and 'admin_transfer_expires_at' columns
    const { data: profile, error: profileError } = await supabaseAdmin
      .from('profiles').select('company_id').eq('id', user.id).single();
    if (profileError || !profile) throw new Error("Could not find the user's company.");
    
    const { error: updateError } = await supabaseAdmin
      .from('companies')
      .update({
        admin_transfer_token: transferToken,
        admin_transfer_expires_at: expiryDate.toISOString(),
      })
      .eq('id', profile.company_id);
    if (updateError) throw new Error("Failed to store the transfer token.");

    // 3. Send a magic link email to the new admin
    // This link should point to a page in your app that handles the token verification
    const transferUrl = `${Deno.env.get('SITE_URL')}/accept-admin-transfer?token=${transferToken}`;
    
    const { error: emailError } = await supabaseAdmin.auth.admin.generateLink({
        type: 'magiclink',
        email: newAdminEmail,
        options: {
            redirectTo: transferUrl
        }
    });

    if (emailError) {
        throw new Error("Could not send invitation email.");
    }

    return new Response(JSON.stringify({ success: true, message: "Transfer invitation sent." }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    })
  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 400,
    })
  }
})