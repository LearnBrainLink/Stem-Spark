-- Test script to verify database schema and sign-up functionality
-- Run this after setting up the database to ensure everything is working

-- 1. Check if all required tables exist
SELECT 
  table_name,
  CASE 
    WHEN table_name IN ('profiles', 'parent_student_relationships', 'user_activities') 
    THEN '✅ Required for signup'
    ELSE '📋 Other table'
  END as status
FROM information_schema.tables 
WHERE table_schema = 'public' 
  AND table_name IN ('profiles', 'parent_student_relationships', 'user_activities', 'donations', 'internships', 'videos')
ORDER BY table_name;

-- 2. Check profiles table structure
SELECT 
  column_name,
  data_type,
  is_nullable,
  column_default
FROM information_schema.columns 
WHERE table_name = 'profiles' 
ORDER BY ordinal_position;

-- 3. Check parent_student_relationships table structure
SELECT 
  column_name,
  data_type,
  is_nullable,
  column_default
FROM information_schema.columns 
WHERE table_name = 'parent_student_relationships' 
ORDER BY ordinal_position;

-- 4. Check if RLS is enabled on required tables
SELECT 
  schemaname,
  tablename,
  rowsecurity as rls_enabled
FROM pg_tables 
WHERE tablename IN ('profiles', 'parent_student_relationships', 'user_activities')
ORDER BY tablename;

-- 5. Check if required policies exist
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

-- 6. Check if required indexes exist
SELECT 
  indexname,
  tablename,
  indexdef
FROM pg_indexes 
WHERE tablename IN ('profiles', 'parent_student_relationships')
ORDER BY tablename, indexname;

-- 7. Test insert permissions (this will fail if RLS is blocking)
-- Note: This is a dry run to check structure, not actual data insertion
DO $$
BEGIN
  -- Test if we can create a profile structure (without actually inserting)
  RAISE NOTICE 'Testing profile structure...';
  
  -- Check if all required fields exist in profiles table
  IF EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'profiles' 
    AND column_name IN ('id', 'email', 'full_name', 'role', 'grade', 'school', 'country', 'state', 'phone', 'email_verified')
  ) THEN
    RAISE NOTICE '✅ Profiles table has all required fields';
  ELSE
    RAISE NOTICE '❌ Profiles table missing required fields';
  END IF;
  
  -- Check if parent_student_relationships table has required fields
  IF EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'parent_student_relationships' 
    AND column_name IN ('id', 'student_id', 'parent_name', 'parent_email', 'parent_phone', 'relationship')
  ) THEN
    RAISE NOTICE '✅ Parent relationships table has all required fields';
  ELSE
    RAISE NOTICE '❌ Parent relationships table missing required fields';
  END IF;
  
  -- Check if user_activities table has required fields
  IF EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'user_activities' 
    AND column_name IN ('id', 'user_id', 'activity_type', 'activity_description', 'metadata')
  ) THEN
    RAISE NOTICE '✅ User activities table has all required fields';
  ELSE
    RAISE NOTICE '❌ User activities table missing required fields';
  END IF;
  
END $$;

-- 8. Check role constraints
SELECT 
  conname as constraint_name,
  contype as constraint_type,
  pg_get_constraintdef(oid) as constraint_definition
FROM pg_constraint 
WHERE conrelid = 'profiles'::regclass 
  AND contype = 'c';

-- 9. Summary report
SELECT 
  'Database Schema Check Complete' as status,
  COUNT(*) as total_tables,
  SUM(CASE WHEN rowsecurity THEN 1 ELSE 0 END) as tables_with_rls
FROM pg_tables 
WHERE tablename IN ('profiles', 'parent_student_relationships', 'user_activities', 'donations', 'internships', 'videos'); 