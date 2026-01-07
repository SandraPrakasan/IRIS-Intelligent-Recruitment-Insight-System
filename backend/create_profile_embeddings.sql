-- Enable the pgvector extension to work with embedding vectors
create extension if not exists vector;

-- Create a table to store embeddings for each profile column
-- We use 1024 dimensions for the BAAI/bge-m3 model
create table if not exists profile_embeddings (
  id uuid references profiles(id) on delete cascade primary key,
  headline vector(1024),
  summary vector(1024),
  skills vector(1024),
  technical_skills vector(1024),
  certifications vector(1024),
  languages vector(1024),
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable Row Level Security (RLS)
alter table profile_embeddings enable row level security;

-- Create policies (Adjust based on your actual auth requirements)
-- Allow read access to everyone (or authenticated users)
create policy "Allow read access for all users"
on profile_embeddings for select
using ( true );

-- Allow update/insert only for service_role or the user who owns the profile
-- (Assuming auth.uid() matches the profile id)
create policy "Users can update their own embeddings"
on profile_embeddings for all
using ( auth.uid() = id );
