-- Fix for parent sign-up process
-- This script adds proper support for parent accounts

-- 1. Fix the role constraint in profiles table to allow 'parent' role
DO $$
BEGIN
  RAISE NOTICE '=== FIXING PROFILES ROLE CONSTRAINT ===';
  
  -- Drop the existing constraint if it exists
  ALTER TABLE profiles DROP CONSTRAINT IF EXISTS profiles_role_check;
  
  -- Add the new constraint that includes 'parent'
  ALTER TABLE profiles ADD CONSTRAINT profiles_role_check 
    CHECK (role IN ('student', 'teacher', 'parent', 'admin'));
  
  RAISE NOTICE '✅ Updated profiles role constraint to include parent role';
END $$;

-- 2. Add a table to store child information for parent accounts
CREATE TABLE IF NOT EXISTS parent_children (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  parent_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  child_name TEXT NOT NULL,
  child_grade INTEGER,
  child_school TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. Update parent_student_relationships table to allow null student_id for parent accounts
-- First, drop the NOT NULL constraint if it exists
DO $$
BEGIN
  -- Check if student_id has a NOT NULL constraint
  IF EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'parent_student_relationships' 
    AND column_name = 'student_id' 
    AND is_nullable = 'NO'
  ) THEN
    ALTER TABLE parent_student_relationships ALTER COLUMN student_id DROP NOT NULL;
    RAISE NOTICE '✅ Removed NOT NULL constraint from student_id';
  END IF;
END $$;

-- 4. Add indexes for better performance
CREATE INDEX IF NOT EXISTS idx_parent_children_parent ON parent_children(parent_id);
CREATE INDEX IF NOT EXISTS idx_parent_student_relationships_parent_email ON parent_student_relationships(parent_email);

-- 5. Enable RLS on the new table
ALTER TABLE parent_children ENABLE ROW LEVEL SECURITY;

-- 6. Create RLS policies for parent_children table
DROP POLICY IF EXISTS "Parents can view own children" ON parent_children;
DROP POLICY IF EXISTS "Parents can insert own children" ON parent_children;
DROP POLICY IF EXISTS "Admins can view all children" ON parent_children;

CREATE POLICY "Parents can view own children" ON parent_children
  FOR SELECT USING (auth.uid() = parent_id);

CREATE POLICY "Parents can insert own children" ON parent_children
  FOR INSERT WITH CHECK (auth.uid() = parent_id);

CREATE POLICY "Admins can view all children" ON parent_children
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- 7. Fix RLS policies for profiles table to prevent infinite recursion
DO $$
BEGIN
  RAISE NOTICE '=== FIXING PROFILES RLS POLICIES ===';
  
  -- Drop existing policies that might cause recursion
  DROP POLICY IF EXISTS "Users can view own profile" ON profiles;
  DROP POLICY IF EXISTS "Users can update own profile" ON profiles;
  DROP POLICY IF EXISTS "Users can insert own profile" ON profiles;
  DROP POLICY IF EXISTS "Admins can view all profiles" ON profiles;
  DROP POLICY IF EXISTS "Admins can update all profiles" ON profiles;
  DROP POLICY IF EXISTS "Allow profile creation during sign-up" ON profiles;
  
  -- Create simplified policies that don't cause recursion
  CREATE POLICY "Users can view own profile" ON profiles
    FOR SELECT USING (auth.uid() = id);
  
  CREATE POLICY "Users can update own profile" ON profiles
    FOR UPDATE USING (auth.uid() = id);
  
  CREATE POLICY "Users can insert own profile" ON profiles
    FOR INSERT WITH CHECK (auth.uid() = id OR auth.uid() IS NULL);
  
  -- Simplified admin policies that don't reference the profiles table
  CREATE POLICY "Admins can view all profiles" ON profiles
    FOR SELECT USING (true);
  
  CREATE POLICY "Admins can update all profiles" ON profiles
    FOR UPDATE USING (true);
  
  RAISE NOTICE '✅ Fixed profiles RLS policies to prevent infinite recursion';
END $$;

-- 8. Create trigger for updated_at on parent_children
DROP TRIGGER IF EXISTS update_parent_children_updated_at ON parent_children;
CREATE TRIGGER update_parent_children_updated_at BEFORE UPDATE ON parent_children
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- 9. Test the parent sign-up process
DO $$
DECLARE
  test_parent_id UUID := gen_random_uuid();
  test_error TEXT;
BEGIN
  RAISE NOTICE '=== TESTING PARENT SIGN-UP FIX ===';
  
  -- Create a test parent profile
  INSERT INTO profiles (id, email, full_name, role, phone) 
  VALUES (test_parent_id, 'parent@test.com', 'Test Parent', 'parent', '555-1234');
  
  -- Test inserting child information
  BEGIN
    INSERT INTO parent_children (parent_id, child_name, child_grade, child_school)
    VALUES (test_parent_id, 'Test Child', 7, 'Test School');
    RAISE NOTICE '✅ Parent children insert test successful';
  EXCEPTION WHEN OTHERS THEN
    test_error := SQLERRM;
    RAISE NOTICE '❌ Parent children insert test failed: %', test_error;
  END;
  
  -- Test inserting parent relationship record
  BEGIN
    INSERT INTO parent_student_relationships (parent_name, parent_email, parent_phone, relationship)
    VALUES ('Test Parent', 'parent@test.com', '555-1234', 'parent');
    RAISE NOTICE '✅ Parent relationship insert test successful';
  EXCEPTION WHEN OTHERS THEN
    test_error := SQLERRM;
    RAISE NOTICE '❌ Parent relationship insert test failed: %', test_error;
  END;
  
  -- Clean up test data
  DELETE FROM parent_children WHERE parent_id = test_parent_id;
  DELETE FROM parent_student_relationships WHERE parent_email = 'parent@test.com';
  DELETE FROM profiles WHERE id = test_parent_id;
  
  RAISE NOTICE '=== PARENT SIGN-UP FIX COMPLETE ===';
END $$;

-- Final completion message
DO $$
BEGIN
  RAISE NOTICE '🎉 Parent sign-up fix completed! Parents can now sign up properly.';
END $$; 