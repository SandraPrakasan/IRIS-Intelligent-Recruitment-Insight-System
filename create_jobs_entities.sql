-- Create table for storing extracted job entities
create table if not exists jobs_entities (
  job_id uuid references jobs(id) on delete cascade primary key,
  skills text[],
  technical_skills text[],
  experience_level text,
  qualification text[],
  work_experience text[],
  preferred_skills text[],
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now()
);

-- Optional: Enable RLS
alter table jobs_entities enable row level security;

-- Policy examples (adjust as needed)
-- create policy "Public read access" on jobs_entities for select using (true);
-- create policy "Service role full access" on jobs_entities using (true) with check (true);
