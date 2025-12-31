import { createClient } from '@supabase/supabase-js'

// Get your URL and Key from your Supabase project's API settings
const supabaseUrl = 'https://obhychdzwbytlzwrjrbl.supabase.co'      // <-- Paste your Project URL here
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9iaHljaGR6d2J5dGx6d3JqcmJsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTg4ODEwNTksImV4cCI6MjA3NDQ1NzA1OX0.DJQuvRMD98-9HO_jm-JItK9wVFRButJJ_iK4IXzCE40' // <-- Paste your 'anon' public key here

// This creates the connection
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
    auth: {
        storage: sessionStorage,
        autoRefreshToken: true,
        persistSession: true,
        detectSessionInUrl: true
    }
})