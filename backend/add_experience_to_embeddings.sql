
-- Add the missing 'experience' column to profile_embeddings
-- BAAI/bge-m3 uses 1024 dimensions
alter table profile_embeddings 
add column if not exists experience vector(1024);
