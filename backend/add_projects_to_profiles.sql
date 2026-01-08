
-- Add 'projects' column to profiles table to store extracted project details
-- It will store a JSONB array of objects: [{ title, technologies_used, description }]
alter table profiles 
add column if not exists projects jsonb default '[]'::jsonb;
