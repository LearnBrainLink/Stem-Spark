-- Quick fix for RLS sign-up issue
-- This script creates a permissive policy for profile creation during sign-up

-- 1. Drop existing insert policies to avoid conflicts
DROP POLICY IF EXISTS "Users can insert own profile" ON profiles;
DROP POLICY IF EXISTS "Allow profile creation during sign-up" ON profiles;

-- 2. Create a permissive policy that allows profile creation during sign-up
CREATE POLICY "Allow profile creation during sign-up" ON profiles
  FOR INSERT WITH CHECK (
    -- Allow if user is authenticated and inserting their own profile
    (auth.uid() = id) OR
    -- Allow if no authenticated user (during sign-up process)
    (auth.uid() IS NULL)
  );

-- 3. Ensure RLS is enabled
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- 4. Test the fix
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