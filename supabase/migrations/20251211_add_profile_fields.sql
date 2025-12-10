-- Add full_name and canvas_url to user_profiles table
ALTER TABLE user_profiles
ADD COLUMN IF NOT EXISTS full_name TEXT,
ADD COLUMN IF NOT EXISTS canvas_url TEXT;

-- Create index for better query performance on full_name
CREATE INDEX IF NOT EXISTS idx_user_profiles_full_name ON user_profiles(full_name);

-- Add insert policy for user profiles (allow users to create their own profile)
CREATE POLICY "Users can insert their own profile"
  ON user_profiles FOR INSERT
  WITH CHECK (auth.uid() = id);
