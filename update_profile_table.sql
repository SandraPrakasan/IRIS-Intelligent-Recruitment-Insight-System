-- Update profiles table to include all extended profile fields
-- This will add all the fields that are currently only in the UI

ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS email TEXT,
ADD COLUMN IF NOT EXISTS phone TEXT,
ADD COLUMN IF NOT EXISTS current_position TEXT,
ADD COLUMN IF NOT EXISTS address TEXT,
ADD COLUMN IF NOT EXISTS linkedin TEXT,
ADD COLUMN IF NOT EXISTS github TEXT,
ADD COLUMN IF NOT EXISTS portfolio TEXT,
ADD COLUMN IF NOT EXISTS experience_years TEXT,
ADD COLUMN IF NOT EXISTS education TEXT,
ADD COLUMN IF NOT EXISTS certifications TEXT,
ADD COLUMN IF NOT EXISTS technical_skills TEXT,
ADD COLUMN IF NOT EXISTS languages TEXT,
ADD COLUMN IF NOT EXISTS professional_references TEXT,
ADD COLUMN IF NOT EXISTS desired_salary TEXT,
ADD COLUMN IF NOT EXISTS industry_experience TEXT,
ADD COLUMN IF NOT EXISTS career_goals TEXT,
ADD COLUMN IF NOT EXISTS willing_to_relocate BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS available_remote BOOLEAN DEFAULT FALSE;

-- Add indexes for better performance on commonly searched fields
CREATE INDEX IF NOT EXISTS idx_profiles_technical_skills ON profiles USING gin(to_tsvector('english', technical_skills));
CREATE INDEX IF NOT EXISTS idx_profiles_willing_to_relocate ON profiles(willing_to_relocate);
CREATE INDEX IF NOT EXISTS idx_profiles_available_remote ON profiles(available_remote);
CREATE INDEX IF NOT EXISTS idx_profiles_experience_years ON profiles(experience_years);

-- Add comments to document the new fields
COMMENT ON COLUMN profiles.email IS 'User email address';
COMMENT ON COLUMN profiles.phone IS 'User phone number';
COMMENT ON COLUMN profiles.current_position IS 'Current job title/position';
COMMENT ON COLUMN profiles.address IS 'User address';
COMMENT ON COLUMN profiles.linkedin IS 'LinkedIn profile URL';
COMMENT ON COLUMN profiles.github IS 'GitHub profile URL';
COMMENT ON COLUMN profiles.portfolio IS 'Portfolio website URL';
COMMENT ON COLUMN profiles.experience_years IS 'Years of work experience';
COMMENT ON COLUMN profiles.education IS 'Educational background';
COMMENT ON COLUMN profiles.certifications IS 'Professional certifications';
COMMENT ON COLUMN profiles.technical_skills IS 'Technical skills (comma-separated)';
COMMENT ON COLUMN profiles.languages IS 'Languages known (comma-separated)';
COMMENT ON COLUMN profiles.professional_references IS 'Professional references';
COMMENT ON COLUMN profiles.desired_salary IS 'Desired salary range';
COMMENT ON COLUMN profiles.industry_experience IS 'Industry experience description';
COMMENT ON COLUMN profiles.career_goals IS 'Career goals and aspirations';
COMMENT ON COLUMN profiles.willing_to_relocate IS 'Willing to relocate for work';
COMMENT ON COLUMN profiles.available_remote IS 'Available for remote work';
