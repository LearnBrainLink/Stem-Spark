-- Fix RLS Policy Issues for Novakinetix Academy
-- This script will fix the infinite recursion and access issues

-- 1. First, let's see what policies exist
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual 
FROM pg_policies 
WHERE schemaname = 'public';

-- 2. Drop problematic policies that might cause infinite recursion
-- Drop all existing policies on profiles table
DROP POLICY IF EXISTS "Enable read access for all users" ON profiles;
DROP POLICY IF EXISTS "Enable insert for authenticated users only" ON profiles;
DROP POLICY IF EXISTS "Enable update for users based on email" ON profiles;
DROP POLICY IF EXISTS "Enable delete for users based on email" ON profiles;
DROP POLICY IF EXISTS "Allow authenticated read access" ON profiles;
DROP POLICY IF EXISTS "Allow users to update own profile" ON profiles;

-- Drop policies on other tables
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

-- 3. Create simple, safe policies for each table

-- Profiles table policies
CREATE POLICY "profiles_select_policy" ON profiles
FOR SELECT USING (true);

CREATE POLICY "profiles_insert_policy" ON profiles
FOR INSERT WITH CHECK (auth.uid() = id);

CREATE POLICY "profiles_update_policy" ON profiles
FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "profiles_delete_policy" ON profiles
FOR DELETE USING (auth.uid() = id);

-- Internships table policies
CREATE POLICY "internships_select_policy" ON internships
FOR SELECT USING (true);

CREATE POLICY "internships_insert_policy" ON internships
FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "internships_update_policy" ON internships
FOR UPDATE USING (auth.role() = 'authenticated');

CREATE POLICY "internships_delete_policy" ON internships
FOR DELETE USING (auth.role() = 'authenticated');

-- Internship applications table policies
CREATE POLICY "internship_applications_select_policy" ON internship_applications
FOR SELECT USING (true);

CREATE POLICY "internship_applications_insert_policy" ON internship_applications
FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "internship_applications_update_policy" ON internship_applications
FOR UPDATE USING (auth.role() = 'authenticated');

CREATE POLICY "internship_applications_delete_policy" ON internship_applications
FOR DELETE USING (auth.role() = 'authenticated');

-- Videos table policies
CREATE POLICY "videos_select_policy" ON videos
FOR SELECT USING (true);

CREATE POLICY "videos_insert_policy" ON videos
FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "videos_update_policy" ON videos
FOR UPDATE USING (auth.role() = 'authenticated');

CREATE POLICY "videos_delete_policy" ON videos
FOR DELETE USING (auth.role() = 'authenticated');

-- Donations table policies
CREATE POLICY "donations_select_policy" ON donations
FOR SELECT USING (true);

CREATE POLICY "donations_insert_policy" ON donations
FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "donations_update_policy" ON donations
FOR UPDATE USING (auth.role() = 'authenticated');

CREATE POLICY "donations_delete_policy" ON donations
FOR DELETE USING (auth.role() = 'authenticated');

-- 4. Verify the policies were created
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual 
FROM pg_policies 
WHERE schemaname = 'public'
ORDER BY tablename, policyname;

-- 5. Test basic access
SELECT COUNT(*) as profiles_count FROM profiles;
SELECT COUNT(*) as internships_count FROM internships;
SELECT COUNT(*) as applications_count FROM internship_applications;
SELECT COUNT(*) as videos_count FROM videos;
SELECT COUNT(*) as donations_count FROM donations; 