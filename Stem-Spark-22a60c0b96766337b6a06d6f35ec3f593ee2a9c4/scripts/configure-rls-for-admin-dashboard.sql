-- This script enables RLS and creates policies to allow admins to view dashboard stats.

-- First, let's create the applications table if it doesn't exist
CREATE OR REPLACE FUNCTION create_applications_table_if_not_exists()
RETURNS void AS $$
BEGIN
  -- Check if the table exists
  IF NOT EXISTS (
    SELECT FROM pg_tables 
    WHERE schemaname = 'public' 
    AND tablename = 'applications'
  ) THEN
    -- Create the applications table
    CREATE TABLE applications (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      student_id UUID NOT NULL,
      internship_id UUID NOT NULL,
      status TEXT NOT NULL DEFAULT 'pending',
      student_statement TEXT,
      parent_approval BOOLEAN DEFAULT false,
      created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
      updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
    );
    
    -- Add comment
    COMMENT ON TABLE applications IS 'Stores student applications for internships';
  END IF;
END;
$$ LANGUAGE plpgsql;

-- Execute the function to create applications table if needed
SELECT create_applications_table_if_not_exists();

-- Enable RLS on the tables if not already enabled.
-- You can comment these out if RLS is already enabled on these tables.
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.internships ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.applications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.internship_applications ENABLE ROW LEVEL SECURITY;

-- Drop existing admin select policies if they exist, to avoid conflicts.
DROP POLICY IF EXISTS "Allow admin users to read all profiles" ON public.profiles;
DROP POLICY IF EXISTS "Allow admin users to read all internships" ON public.internships;
DROP POLICY IF EXISTS "Allow admin users to read all applications" ON public.applications;
DROP POLICY IF EXISTS "Allow admin users to read all internship_applications" ON public.internship_applications;

-- We need a way to check if a user is an admin.
-- This function checks for the 'admin' role in the 'profiles' table.
-- Make sure you have a 'role' column in your 'profiles' table.
CREATE OR REPLACE FUNCTION is_admin(user_id uuid)
RETURNS boolean AS $$
  SELECT EXISTS (
    SELECT 1
    FROM profiles
    WHERE id = user_id AND role = 'admin'
  );
$$ LANGUAGE sql SECURITY DEFINER;

-- Create policies that grant SELECT access to admins.
-- These policies will be enforced on the views that the dashboard uses.
CREATE POLICY "Allow admin users to read all profiles"
ON public.profiles
FOR SELECT TO authenticated
USING (is_admin(auth.uid()));

CREATE POLICY "Allow admin users to read all internships"
ON public.internships
FOR SELECT TO authenticated
USING (is_admin(auth.uid()));

CREATE POLICY "Allow admin users to read all applications"
ON public.applications
FOR SELECT TO authenticated
USING (is_admin(auth.uid()));

CREATE POLICY "Allow admin users to read all internship_applications"
ON public.internship_applications
FOR SELECT TO authenticated
USING (is_admin(auth.uid()));

-- Since RLS is now on, we should also add policies for non-admin users.
-- Here are some example policies. You will need to adjust these to your application's logic.

-- Allow users to see their own profile.
DROP POLICY IF EXISTS "Allow individual user access to their own profile" ON public.profiles;
CREATE POLICY "Allow individual user access to their own profile"
ON public.profiles
FOR SELECT TO authenticated
USING (auth.uid() = id);

-- Allow authenticated users to see all internships (assuming they are public)
-- If not, you might want to restrict this further.
DROP POLICY IF EXISTS "Allow authenticated users to view internships" ON public.internships;
CREATE POLICY "Allow authenticated users to view internships"
ON public.internships
FOR SELECT TO authenticated
USING (true);

-- Allow users to see their own applications.
DROP POLICY IF EXISTS "Allow individual user to see their own applications" ON public.applications;
CREATE POLICY "Allow individual user to see their own applications"
ON public.applications
FOR SELECT TO authenticated
USING (auth.uid() = student_id);

-- Allow users to see their own internship applications.
DROP POLICY IF EXISTS "Allow individual user to see their own internship applications" ON public.internship_applications;
CREATE POLICY "Allow individual user to see their own internship applications"
ON public.internship_applications
FOR SELECT TO authenticated
USING (auth.uid() = student_id); 