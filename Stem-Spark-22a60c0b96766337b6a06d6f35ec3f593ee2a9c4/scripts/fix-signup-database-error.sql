-- Comprehensive fix for sign-up database errors
-- This script addresses common issues that prevent user creation

-- 1. First, let's check what tables exist and their current structure
DO $$
BEGIN
  RAISE NOTICE '=== CHECKING EXISTING TABLE STRUCTURES ===';
END $$;

-- Check if profiles table exists and its structure
SELECT 
  CASE 
    WHEN EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'profiles') 
    THEN '✅ profiles table exists'
    ELSE '❌ profiles table missing'
  END as table_status;

-- Check profiles table columns
SELECT 
  column_name, 
  data_type, 
  is_nullable,
  column_default
FROM information_schema.columns 
WHERE table_name = 'profiles' 
ORDER BY ordinal_position;

-- 2. Fix profiles table structure
DO $$
BEGIN
  RAISE NOTICE '=== FIXING PROFILES TABLE ===';
  
  -- Ensure profiles table exists with correct structure
  IF NOT EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'profiles') THEN
    CREATE TABLE profiles (
      id UUID REFERENCES auth.users ON DELETE CASCADE,
      email TEXT,
      full_name TEXT,
      role TEXT DEFAULT 'student' CHECK (role IN ('student', 'teacher', 'parent', 'admin')),
      grade INTEGER,
      school TEXT,
      country TEXT,
      state TEXT,
      phone TEXT,
      email_verified BOOLEAN DEFAULT FALSE,
      created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
      updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
      PRIMARY KEY (id)
    );
    RAISE NOTICE '✅ Created profiles table';
  ELSE
    RAISE NOTICE '✅ profiles table already exists';
  END IF;
  
  -- Add missing columns if they don't exist
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'profiles' AND column_name = 'email') THEN
    ALTER TABLE profiles ADD COLUMN email TEXT;
    RAISE NOTICE '✅ Added email column';
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'profiles' AND column_name = 'full_name') THEN
    ALTER TABLE profiles ADD COLUMN full_name TEXT;
    RAISE NOTICE '✅ Added full_name column';
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'profiles' AND column_name = 'role') THEN
    ALTER TABLE profiles ADD COLUMN role TEXT DEFAULT 'student' CHECK (role IN ('student', 'teacher', 'parent', 'admin'));
    RAISE NOTICE '✅ Added role column';
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'profiles' AND column_name = 'grade') THEN
    ALTER TABLE profiles ADD COLUMN grade INTEGER;
    RAISE NOTICE '✅ Added grade column';
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'profiles' AND column_name = 'school') THEN
    ALTER TABLE profiles ADD COLUMN school TEXT;
    RAISE NOTICE '✅ Added school column';
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'profiles' AND column_name = 'country') THEN
    ALTER TABLE profiles ADD COLUMN country TEXT;
    RAISE NOTICE '✅ Added country column';
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'profiles' AND column_name = 'state') THEN
    ALTER TABLE profiles ADD COLUMN state TEXT;
    RAISE NOTICE '✅ Added state column';
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'profiles' AND column_name = 'phone') THEN
    ALTER TABLE profiles ADD COLUMN phone TEXT;
    RAISE NOTICE '✅ Added phone column';
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'profiles' AND column_name = 'email_verified') THEN
    ALTER TABLE profiles ADD COLUMN email_verified BOOLEAN DEFAULT FALSE;
    RAISE NOTICE '✅ Added email_verified column';
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'profiles' AND column_name = 'created_at') THEN
    ALTER TABLE profiles ADD COLUMN created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();
    RAISE NOTICE '✅ Added created_at column';
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'profiles' AND column_name = 'updated_at') THEN
    ALTER TABLE profiles ADD COLUMN updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();
    RAISE NOTICE '✅ Added updated_at column';
  END IF;
END $$;

-- 3. Fix parent_student_relationships table
DO $$
BEGIN
  RAISE NOTICE '=== FIXING PARENT_STUDENT_RELATIONSHIPS TABLE ===';
  
  -- Ensure table exists
  IF NOT EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'parent_student_relationships') THEN
    CREATE TABLE parent_student_relationships (
      id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
      student_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
      parent_name TEXT NOT NULL,
      parent_email TEXT NOT NULL,
      parent_phone TEXT,
      relationship TEXT NOT NULL,
      created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
      updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
    );
    RAISE NOTICE '✅ Created parent_student_relationships table';
  END IF;
  
  -- Add missing columns
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'parent_student_relationships' AND column_name = 'student_id') THEN
    ALTER TABLE parent_student_relationships ADD COLUMN student_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;
    RAISE NOTICE '✅ Added student_id column';
  END IF;
END $$;

-- 4. Fix user_activities table
DO $$
BEGIN
  RAISE NOTICE '=== FIXING USER_ACTIVITIES TABLE ===';
  
  -- Ensure table exists
  IF NOT EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'user_activities') THEN
    CREATE TABLE user_activities (
      id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
      user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
      activity_type TEXT NOT NULL,
      activity_description TEXT,
      metadata JSONB DEFAULT '{}',
      created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
    );
    RAISE NOTICE '✅ Created user_activities table';
  END IF;
  
  -- Add missing columns
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'user_activities' AND column_name = 'activity_description') THEN
    ALTER TABLE user_activities ADD COLUMN activity_description TEXT;
    RAISE NOTICE '✅ Added activity_description column';
  END IF;
  
  -- Remove old description column if it exists
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'user_activities' AND column_name = 'description') THEN
    ALTER TABLE user_activities DROP COLUMN description;
    RAISE NOTICE '✅ Removed old description column';
  END IF;
END $$;

-- 5. Enable RLS and create policies
DO $$
BEGIN
  RAISE NOTICE '=== SETTING UP RLS POLICIES ===';
  
  -- Enable RLS
  ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
  ALTER TABLE parent_student_relationships ENABLE ROW LEVEL SECURITY;
  ALTER TABLE user_activities ENABLE ROW LEVEL SECURITY;
  
  RAISE NOTICE '✅ Enabled RLS on all tables';
END $$;

-- Create a function to handle profile creation during sign-up
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  -- Insert profile for new user
  INSERT INTO public.profiles (id, email, full_name, role, email_verified)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', ''),
    COALESCE(NEW.raw_user_meta_data->>'role', 'student'),
    NEW.email_confirmed_at IS NOT NULL
  );
  
  -- Log the activity
  INSERT INTO public.user_activities (user_id, activity_type, activity_description, metadata)
  VALUES (
    NEW.id,
    'account_created',
    'Account created via sign-up',
    jsonb_build_object('role', COALESCE(NEW.raw_user_meta_data->>'role', 'student'))
  );
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger for new user sign-up
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- Drop existing policies to avoid conflicts
DROP POLICY IF EXISTS "Users can view own profile" ON profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON profiles;
DROP POLICY IF EXISTS "Users can insert own profile" ON profiles;
DROP POLICY IF EXISTS "Admins can view all profiles" ON profiles;
DROP POLICY IF EXISTS "Admins can update all profiles" ON profiles;
DROP POLICY IF EXISTS "Users can view parent relationships" ON parent_student_relationships;
DROP POLICY IF EXISTS "Users can insert parent relationships" ON parent_student_relationships;
DROP POLICY IF EXISTS "Admins can view all parent relationships" ON parent_student_relationships;
DROP POLICY IF EXISTS "Users can view own activities" ON user_activities;
DROP POLICY IF EXISTS "Users can insert own activities" ON user_activities;
DROP POLICY IF EXISTS "Admins can view all activities" ON user_activities;

-- Create new policies (simplified for sign-up compatibility)
CREATE POLICY "Users can view own profile" ON profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON profiles
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile" ON profiles
  FOR INSERT WITH CHECK (auth.uid() = id);

CREATE POLICY "Admins can view all profiles" ON profiles
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

CREATE POLICY "Admins can update all profiles" ON profiles
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- 6. Test the fixes
DO $$
DECLARE
  test_user_id UUID := gen_random_uuid();
  test_error TEXT;
BEGIN
  RAISE NOTICE '=== TESTING FIXES ===';
  
  -- Test profile insert
  BEGIN
    INSERT INTO profiles (
      id, email, full_name, role, grade, school, country, state, phone, email_verified
    ) VALUES (
      test_user_id, 'test@example.com', 'Test User', 'student', 7, 'Test School', 'US', 'CA', '555-1234', false
    );
    RAISE NOTICE '✅ Profile insert test successful';
  EXCEPTION WHEN OTHERS THEN
    test_error := SQLERRM;
    RAISE NOTICE '❌ Profile insert test failed: %', test_error;
  END;
  
  -- Test parent relationship insert
  BEGIN
    INSERT INTO parent_student_relationships (
      student_id, parent_name, parent_email, parent_phone, relationship
    ) VALUES (
      test_user_id, 'Test Parent', 'parent@test.com', '555-5678', 'mother'
    );
    RAISE NOTICE '✅ Parent relationship insert test successful';
  EXCEPTION WHEN OTHERS THEN
    test_error := SQLERRM;
    RAISE NOTICE '❌ Parent relationship insert test failed: %', test_error;
  END;
  
  -- Test user activity insert
  BEGIN
    INSERT INTO user_activities (
      user_id, activity_type, activity_description, metadata
    ) VALUES (
      test_user_id, 'account_created', 'Test account creation', '{"role": "student"}'::jsonb
    );
    RAISE NOTICE '✅ User activity insert test successful';
  EXCEPTION WHEN OTHERS THEN
    test_error := SQLERRM;
    RAISE NOTICE '❌ User activity insert test failed: %', test_error;
  END;
  
  -- Clean up test data
  DELETE FROM user_activities WHERE user_id = test_user_id;
  DELETE FROM parent_student_relationships WHERE student_id = test_user_id;
  DELETE FROM profiles WHERE id = test_user_id;
  
  RAISE NOTICE '=== CLEANUP COMPLETE ===';
END $$;

-- Final completion message
DO $$
BEGIN
  RAISE NOTICE '🎉 Database fix script completed! Try signing up again.';
END $$; 