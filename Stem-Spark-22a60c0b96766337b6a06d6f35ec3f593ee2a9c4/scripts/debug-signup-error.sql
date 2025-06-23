-- Debug script for sign-up database errors
-- Run this to check table structures and test inserts

-- Check profiles table structure
SELECT 
  column_name, 
  data_type, 
  is_nullable, 
  column_default
FROM information_schema.columns 
WHERE table_name = 'profiles' 
ORDER BY ordinal_position;

-- Check parent_student_relationships table structure
SELECT 
  column_name, 
  data_type, 
  is_nullable, 
  column_default
FROM information_schema.columns 
WHERE table_name = 'parent_student_relationships' 
ORDER BY ordinal_position;

-- Check user_activities table structure
SELECT 
  column_name, 
  data_type, 
  is_nullable, 
  column_default
FROM information_schema.columns 
WHERE table_name = 'user_activities' 
ORDER BY ordinal_position;

-- Test profile insert with sample data
-- This will help identify any constraint violations
DO $$
DECLARE
  test_user_id UUID := gen_random_uuid();
  insert_error TEXT;
BEGIN
  -- Try to insert a test profile
  BEGIN
    INSERT INTO profiles (
      id, 
      email, 
      full_name, 
      role, 
      grade, 
      school, 
      country, 
      state, 
      phone, 
      email_verified
    ) VALUES (
      test_user_id,
      'test@example.com',
      'Test User',
      'student',
      7,
      'Test School',
      'United States',
      'California',
      '(555) 123-4567',
      false
    );
    
    RAISE NOTICE '✅ Test profile insert successful';
    
    -- Clean up test data
    DELETE FROM profiles WHERE id = test_user_id;
    
  EXCEPTION WHEN OTHERS THEN
    insert_error := SQLERRM;
    RAISE NOTICE '❌ Profile insert failed: %', insert_error;
  END;
END $$;

-- Test parent_student_relationships insert
DO $$
DECLARE
  test_user_id UUID := gen_random_uuid();
  test_parent_id UUID := gen_random_uuid();
  insert_error TEXT;
BEGIN
  -- First create a test user
  INSERT INTO profiles (id, email, full_name, role) VALUES (test_user_id, 'student@test.com', 'Test Student', 'student');
  
  -- Try to insert parent relationship
  BEGIN
    INSERT INTO parent_student_relationships (
      student_id,
      parent_name,
      parent_email,
      parent_phone,
      relationship
    ) VALUES (
      test_user_id,
      'Test Parent',
      'parent@test.com',
      '(555) 123-4567',
      'mother'
    );
    
    RAISE NOTICE '✅ Test parent relationship insert successful';
    
  EXCEPTION WHEN OTHERS THEN
    insert_error := SQLERRM;
    RAISE NOTICE '❌ Parent relationship insert failed: %', insert_error;
  END;
  
  -- Clean up test data
  DELETE FROM parent_student_relationships WHERE student_id = test_user_id;
  DELETE FROM profiles WHERE id = test_user_id;
END $$;

-- Test user_activities insert
DO $$
DECLARE
  test_user_id UUID := gen_random_uuid();
  insert_error TEXT;
BEGIN
  -- First create a test user
  INSERT INTO profiles (id, email, full_name, role) VALUES (test_user_id, 'user@test.com', 'Test User', 'student');
  
  -- Try to insert activity
  BEGIN
    INSERT INTO user_activities (
      user_id,
      activity_type,
      activity_description,
      metadata
    ) VALUES (
      test_user_id,
      'account_created',
      'Test account creation',
      '{"role": "student", "test": true}'::jsonb
    );
    
    RAISE NOTICE '✅ Test user activity insert successful';
    
  EXCEPTION WHEN OTHERS THEN
    insert_error := SQLERRM;
    RAISE NOTICE '❌ User activity insert failed: %', insert_error;
  END;
  
  -- Clean up test data
  DELETE FROM user_activities WHERE user_id = test_user_id;
  DELETE FROM profiles WHERE id = test_user_id;
END $$;

-- Check for any RLS policy issues
SELECT 
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd,
  qual,
  with_check
FROM pg_policies 
WHERE tablename IN ('profiles', 'parent_student_relationships', 'user_activities')
ORDER BY tablename, policyname; 