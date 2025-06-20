-- Quick RLS Fix for Novakinetix Academy
-- Run this in your Supabase SQL Editor to fix the infinite recursion issue

-- Step 1: Disable RLS temporarily for all tables
ALTER TABLE profiles DISABLE ROW LEVEL SECURITY;
ALTER TABLE internships DISABLE ROW LEVEL SECURITY;
ALTER TABLE internship_applications DISABLE ROW LEVEL SECURITY;
ALTER TABLE videos DISABLE ROW LEVEL SECURITY;
ALTER TABLE donations DISABLE ROW LEVEL SECURITY;

-- Step 2: Drop all existing problematic policies
DROP POLICY IF EXISTS "Enable read access for all users" ON profiles;
DROP POLICY IF EXISTS "Enable insert for authenticated users only" ON profiles;
DROP POLICY IF EXISTS "Enable update for users based on email" ON profiles;
DROP POLICY IF EXISTS "Enable delete for users based on email" ON profiles;
DROP POLICY IF EXISTS "Allow authenticated read access" ON profiles;
DROP POLICY IF EXISTS "Allow users to update own profile" ON profiles;

DROP POLICY IF EXISTS "Enable read access for all users" ON internships;
DROP POLICY IF EXISTS "Enable insert for authenticated users only" ON internships;
DROP POLICY IF EXISTS "Enable update for users based on email" ON internships;
DROP POLICY IF EXISTS "Enable delete for users based on email" ON internships;

DROP POLICY IF EXISTS "Enable read access for all users" ON internship_applications;
DROP POLICY IF EXISTS "Enable insert for authenticated users only" ON internship_applications;
DROP POLICY IF EXISTS "Enable update for users based on email" ON internship_applications;
DROP POLICY IF EXISTS "Enable delete for users based on email" ON internship_applications;

DROP POLICY IF EXISTS "Enable read access for all users" ON videos;
DROP POLICY IF EXISTS "Enable insert for authenticated users only" ON videos;
DROP POLICY IF EXISTS "Enable update for users based on email" ON videos;
DROP POLICY IF EXISTS "Enable delete for users based on email" ON videos;

DROP POLICY IF EXISTS "Enable read access for all users" ON donations;
DROP POLICY IF EXISTS "Enable insert for authenticated users only" ON donations;
DROP POLICY IF EXISTS "Enable update for users based on email" ON donations;
DROP POLICY IF EXISTS "Enable delete for users based on email" ON donations;

-- Step 3: Test that tables are accessible
SELECT 'profiles' as table_name, COUNT(*) as record_count FROM profiles
UNION ALL
SELECT 'internships' as table_name, COUNT(*) as record_count FROM internships
UNION ALL
SELECT 'internship_applications' as table_name, COUNT(*) as record_count FROM internship_applications
UNION ALL
SELECT 'videos' as table_name, COUNT(*) as record_count FROM videos
UNION ALL
SELECT 'donations' as table_name, COUNT(*) as record_count FROM donations;

-- Step 4: Optional - Re-enable RLS with simple policies (uncomment if you want RLS)
/*
-- Re-enable RLS
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE internships ENABLE ROW LEVEL SECURITY;
ALTER TABLE internship_applications ENABLE ROW LEVEL SECURITY;
ALTER TABLE videos ENABLE ROW LEVEL SECURITY;
ALTER TABLE donations ENABLE ROW LEVEL SECURITY;

-- Create simple, safe policies
CREATE POLICY "profiles_select_policy" ON profiles FOR SELECT USING (true);
CREATE POLICY "internships_select_policy" ON internships FOR SELECT USING (true);
CREATE POLICY "internship_applications_select_policy" ON internship_applications FOR SELECT USING (true);
CREATE POLICY "videos_select_policy" ON videos FOR SELECT USING (true);
CREATE POLICY "donations_select_policy" ON donations FOR SELECT USING (true);
*/ 