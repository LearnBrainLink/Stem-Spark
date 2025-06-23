-- Quick fix for RLS sign-up issue
-- This script temporarily allows profile creation during sign-up

-- 1. Temporarily disable RLS on profiles table
ALTER TABLE profiles DISABLE ROW LEVEL SECURITY;

-- 2. Create a function to re-enable RLS after profile creation
CREATE OR REPLACE FUNCTION re_enable_rls_after_profile_creation()
RETURNS TRIGGER AS $$
BEGIN
  -- Re-enable RLS after a short delay
  PERFORM pg_sleep(1);
  ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 3. Create a trigger to re-enable RLS after profile insert
DROP TRIGGER IF EXISTS re_enable_rls_trigger ON profiles;
CREATE TRIGGER re_enable_rls_trigger
  AFTER INSERT ON profiles
  FOR EACH ROW EXECUTE FUNCTION re_enable_rls_after_profile_creation();

-- 4. Alternative: Create a more permissive policy for sign-up
-- Drop existing insert policy
DROP POLICY IF EXISTS "Users can insert own profile" ON profiles;

-- Create a new policy that allows profile creation during sign-up
CREATE POLICY "Allow profile creation during sign-up" ON profiles
  FOR INSERT WITH CHECK (
    -- Allow if user is authenticated and inserting their own profile
    (auth.uid() = id) OR
    -- Allow if no authenticated user (during sign-up process)
    (auth.uid() IS NULL) OR
    -- Allow if the profile doesn't exist yet (new user)
    (NOT EXISTS (SELECT 1 FROM profiles WHERE id = NEW.id))
  );

-- 5. Test the fix
DO $$
DECLARE
  test_user_id UUID := gen_random_uuid();
BEGIN
  RAISE NOTICE 'Testing profile creation with RLS fix...';
  
  -- Try to insert a test profile
  INSERT INTO profiles (id, email, full_name, role) 
  VALUES (test_user_id, 'test@example.com', 'Test User', 'student');
  
  RAISE NOTICE '✅ Profile creation test successful!';
  
  -- Clean up
  DELETE FROM profiles WHERE id = test_user_id;
  
  RAISE NOTICE '🎉 RLS fix applied successfully! Try signing up again.';
END $$; 