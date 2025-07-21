-- STEM Spark Academy Setup Guide
-- Follow these steps to get your system working

-- Step 1: Run the clean database setup
-- This script creates all necessary tables and sample data
-- File: clean-database-setup.sql

-- Step 2: Create test accounts in the database
-- This creates the profile records for test users
-- File: create-working-test-accounts.sql

-- Step 3: Create auth users in Supabase Dashboard
-- Go to your Supabase Dashboard > Authentication > Users
-- Click "Add user" and create these users:

-- User 1:
-- Email: student@test.com
-- Password: TestStudent123!
-- Email Confirmed: YES
-- User ID: aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa (copy this exactly)

-- User 2:
-- Email: teacher@test.com  
-- Password: TestTeacher123!
-- Email Confirmed: YES
-- User ID: bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb (copy this exactly)

-- User 3:
-- Email: admin@test.com
-- Password: TestAdmin123!
-- Email Confirmed: YES  
-- User ID: cccccccc-cccc-cccc-cccc-cccccccccccc (copy this exactly)

-- Step 4: Configure Supabase Auth Settings
-- Go to Authentication > Settings in Supabase Dashboard
-- Set these URLs:
-- Site URL: https://your-domain.com (or http://localhost:3000 for development)
-- Redirect URLs: https://your-domain.com/auth/callback

-- Step 5: Test the login
-- Go to your app's /login page
-- Try logging in with any of the test accounts
-- You should be redirected to the appropriate dashboard

-- Troubleshooting:
-- If you get "Database error querying schema":
-- 1. Make sure you ran clean-database-setup.sql first
-- 2. Check that all tables exist in your Supabase database
-- 3. Verify RLS policies are enabled
-- 4. Make sure the auth users have the correct UUIDs

-- If login fails:
-- 1. Check that the user exists in both auth.users and public.profiles
-- 2. Verify the email is confirmed in auth.users
-- 3. Check the browser console for detailed error messages

DO $$
BEGIN
    RAISE NOTICE '📋 STEM Spark Academy Setup Guide';
    RAISE NOTICE '';
    RAISE NOTICE '✅ Step 1: Run clean-database-setup.sql';
    RAISE NOTICE '✅ Step 2: Run create-working-test-accounts.sql';
    RAISE NOTICE '⏳ Step 3: Create auth users in Supabase Dashboard';
    RAISE NOTICE '⏳ Step 4: Configure auth settings';
    RAISE NOTICE '⏳ Step 5: Test login';
    RAISE NOTICE '';
    RAISE NOTICE '🔗 Need help? Check the comments in this file for detailed instructions.';
END $$;
