-- Complete Database Setup for STEM Spark Academy
-- This script will create everything needed for the application to work

BEGIN;

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Drop existing objects to start fresh
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP FUNCTION IF EXISTS public.handle_new_user() CASCADE;

-- Drop all tables in correct order (respecting foreign keys)
DROP TABLE IF EXISTS user_activities CASCADE;
DROP TABLE IF EXISTS parent_info CASCADE;
DROP TABLE IF EXISTS internship_applications CASCADE;
DROP TABLE IF EXISTS videos CASCADE;
DROP TABLE IF EXISTS internships CASCADE;
DROP TABLE IF EXISTS profiles CASCADE;

-- Create profiles table (foundation table)
CREATE TABLE public.profiles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email TEXT UNIQUE NOT NULL,
    full_name TEXT DEFAULT '',
    role TEXT NOT NULL DEFAULT 'student' CHECK (role IN ('student', 'teacher', 'admin')),
    grade INTEGER CHECK (grade >= 5 AND grade <= 8),
    country TEXT DEFAULT '',
    state TEXT DEFAULT '',
    school_name TEXT DEFAULT '',
    email_verified BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create parent_info table
CREATE TABLE public.parent_info (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    student_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    parent_name TEXT NOT NULL DEFAULT '',
    parent_email TEXT NOT NULL DEFAULT '',
    parent_phone TEXT DEFAULT '',
    relationship TEXT DEFAULT 'parent' CHECK (relationship IN ('mother', 'father', 'guardian', 'parent', 'other')),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create internships table
CREATE TABLE public.internships (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL DEFAULT '',
    company TEXT NOT NULL DEFAULT '',
    description TEXT NOT NULL DEFAULT '',
    requirements TEXT DEFAULT '',
    location TEXT DEFAULT '',
    duration TEXT DEFAULT '',
    application_deadline DATE,
    start_date DATE,
    end_date DATE,
    max_participants INTEGER DEFAULT 10,
    current_participants INTEGER DEFAULT 0,
    status TEXT DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'completed')),
    created_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create internship_applications table
CREATE TABLE public.internship_applications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    internship_id UUID NOT NULL REFERENCES public.internships(id) ON DELETE CASCADE,
    student_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    application_text TEXT NOT NULL DEFAULT '',
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected', 'withdrawn')),
    applied_at TIMESTAMPTZ DEFAULT NOW(),
    reviewed_at TIMESTAMPTZ,
    reviewed_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(internship_id, student_id)
);

-- Create user_activities table
CREATE TABLE public.user_activities (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    activity_type TEXT NOT NULL DEFAULT '',
    activity_description TEXT NOT NULL DEFAULT '',
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create videos table
CREATE TABLE public.videos (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL DEFAULT '',
    description TEXT DEFAULT '',
    video_url TEXT DEFAULT '',
    thumbnail_url TEXT DEFAULT '',
    duration INTEGER DEFAULT 0,
    category TEXT DEFAULT '',
    grade_level INTEGER DEFAULT 6,
    status TEXT DEFAULT 'active' CHECK (status IN ('active', 'inactive')),
    created_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_profiles_email ON public.profiles(email);
CREATE INDEX IF NOT EXISTS idx_profiles_role ON public.profiles(role);
CREATE INDEX IF NOT EXISTS idx_profiles_created_at ON public.profiles(created_at);

CREATE INDEX IF NOT EXISTS idx_parent_info_student_id ON public.parent_info(student_id);

CREATE INDEX IF NOT EXISTS idx_internships_status ON public.internships(status);
CREATE INDEX IF NOT EXISTS idx_internships_deadline ON public.internships(application_deadline);

CREATE INDEX IF NOT EXISTS idx_applications_student_id ON public.internship_applications(student_id);
CREATE INDEX IF NOT EXISTS idx_applications_internship_id ON public.internship_applications(internship_id);
CREATE INDEX IF NOT EXISTS idx_applications_status ON public.internship_applications(status);

CREATE INDEX IF NOT EXISTS idx_activities_user_id ON public.user_activities(user_id);
CREATE INDEX IF NOT EXISTS idx_activities_type ON public.user_activities(activity_type);
CREATE INDEX IF NOT EXISTS idx_activities_created_at ON public.user_activities(created_at);

CREATE INDEX IF NOT EXISTS idx_videos_status ON public.videos(status);
CREATE INDEX IF NOT EXISTS idx_videos_grade_level ON public.videos(grade_level);

-- Enable Row Level Security on all tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.parent_info ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.internships ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.internship_applications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_activities ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.videos ENABLE ROW LEVEL SECURITY;

-- Create RLS policies that work
-- Profiles policies
DROP POLICY IF EXISTS "Enable read access for own profile" ON public.profiles;
DROP POLICY IF EXISTS "Enable update access for own profile" ON public.profiles;
DROP POLICY IF EXISTS "Enable insert access for own profile" ON public.profiles;

CREATE POLICY "Enable read access for own profile" ON public.profiles 
    FOR SELECT USING (auth.uid() = id OR auth.jwt() ->> 'role' = 'admin');

CREATE POLICY "Enable update access for own profile" ON public.profiles 
    FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Enable insert access for own profile" ON public.profiles 
    FOR INSERT WITH CHECK (auth.uid() = id);

-- Parent info policies
DROP POLICY IF EXISTS "Enable access for student parent info" ON public.parent_info;
CREATE POLICY "Enable access for student parent info" ON public.parent_info 
    FOR ALL USING (student_id = auth.uid());

-- Internships policies (everyone can read active internships)
DROP POLICY IF EXISTS "Enable read access for active internships" ON public.internships;
CREATE POLICY "Enable read access for active internships" ON public.internships 
    FOR SELECT USING (status = 'active' OR auth.jwt() ->> 'role' = 'admin');

-- Applications policies
DROP POLICY IF EXISTS "Enable access for own applications" ON public.internship_applications;
CREATE POLICY "Enable access for own applications" ON public.internship_applications 
    FOR ALL USING (student_id = auth.uid() OR auth.jwt() ->> 'role' = 'admin');

-- Activities policies
DROP POLICY IF EXISTS "Enable read access for own activities" ON public.user_activities;
DROP POLICY IF EXISTS "Enable insert access for own activities" ON public.user_activities;

CREATE POLICY "Enable read access for own activities" ON public.user_activities 
    FOR SELECT USING (user_id = auth.uid() OR auth.jwt() ->> 'role' = 'admin');

CREATE POLICY "Enable insert access for own activities" ON public.user_activities 
    FOR INSERT WITH CHECK (user_id = auth.uid());

-- Videos policies (everyone can view active videos)
DROP POLICY IF EXISTS "Enable read access for active videos" ON public.videos;
CREATE POLICY "Enable read access for active videos" ON public.videos 
    FOR SELECT USING (status = 'active' OR auth.jwt() ->> 'role' = 'admin');

-- Create function to handle new user registration
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
DECLARE
    user_role TEXT DEFAULT 'student';
BEGIN
    -- Get role from metadata if provided
    IF NEW.raw_user_meta_data ? 'role' THEN
        user_role := NEW.raw_user_meta_data->>'role';
    END IF;

    -- Insert new profile
    INSERT INTO public.profiles (
        id,
        email,
        full_name,
        role,
        email_verified,
        created_at,
        updated_at
    ) VALUES (
        NEW.id,
        NEW.email,
        COALESCE(NEW.raw_user_meta_data->>'full_name', ''),
        user_role,
        CASE WHEN NEW.email_confirmed_at IS NOT NULL THEN true ELSE false END,
        NOW(),
        NOW()
    );

    -- Log the user creation
    INSERT INTO public.user_activities (
        user_id,
        activity_type,
        activity_description,
        metadata,
        created_at
    ) VALUES (
        NEW.id,
        'account_created',
        'New user account created',
        jsonb_build_object('role', user_role, 'email', NEW.email),
        NOW()
    );

    RETURN NEW;
EXCEPTION
    WHEN others THEN
        -- Log the error but don't fail the auth process
        RAISE WARNING 'Failed to create profile for user %: %', NEW.id, SQLERRM;
        RETURN NEW;
END;
$$;

-- Create the trigger
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Insert sample data
INSERT INTO public.internships (
    id,
    title,
    company,
    description,
    requirements,
    location,
    duration,
    application_deadline,
    start_date,
    end_date,
    max_participants,
    current_participants,
    status
) VALUES 
(
    '11111111-1111-1111-1111-111111111111',
    'Summer Engineering Program',
    'TechCorp Industries',
    'Join our exciting summer engineering program where you will work on real-world projects, learn from experienced engineers, and develop your technical skills. This program covers software development, robotics, and engineering design principles.',
    'Must be in grades 6-8, basic programming knowledge helpful but not required. Strong interest in STEM fields and problem-solving skills.',
    'San Francisco, CA',
    '8 weeks',
    '2024-12-31',
    '2024-06-15',
    '2024-08-10',
    15,
    3,
    'active'
),
(
    '22222222-2222-2222-2222-222222222222',
    'Robotics Workshop Internship',
    'Innovation Labs',
    'Hands-on experience building and programming robots. Students will learn about sensors, actuators, control systems, and basic AI concepts while working on exciting robotics projects.',
    'Grades 7-8, interest in robotics and technology. No prior experience required, but enthusiasm for learning is essential.',
    'Austin, TX',
    '6 weeks',
    '2024-12-31',
    '2024-06-20',
    '2024-08-01',
    12,
    5,
    'active'
),
(
    '33333333-3333-3333-3333-333333333333',
    'Environmental Science Research',
    'Green Future Institute',
    'Participate in real environmental research projects focusing on climate change, renewable energy, and sustainability. Work alongside professional researchers and contribute to meaningful scientific work.',
    'Grades 6-8, interest in environmental science and research. Strong analytical thinking and curiosity about the natural world.',
    'Portland, OR',
    '10 weeks',
    '2024-12-31',
    '2024-06-01',
    '2024-08-15',
    10,
    2,
    'active'
);

-- Insert sample videos
INSERT INTO public.videos (
    id,
    title,
    description,
    video_url,
    thumbnail_url,
    duration,
    category,
    grade_level,
    status
) VALUES 
(
    '44444444-4444-4444-4444-444444444444',
    'Introduction to Engineering',
    'Learn the basics of engineering and discover different engineering disciplines including mechanical, electrical, software, and environmental engineering.',
    'https://example.com/video1',
    '/placeholder.svg?height=200&width=300',
    1800,
    'Engineering Basics',
    6,
    'active'
),
(
    '55555555-5555-5555-5555-555555555555',
    'Building Your First Robot',
    'Step-by-step guide to building a simple robot using basic components. Learn about motors, sensors, and programming basics.',
    'https://example.com/video2',
    '/placeholder.svg?height=200&width=300',
    2400,
    'Robotics',
    7,
    'active'
),
(
    '66666666-6666-6666-6666-666666666666',
    'Climate Change and You',
    'Understanding climate change, its impacts, and what young people can do to make a difference in environmental protection.',
    'https://example.com/video3',
    '/placeholder.svg?height=200&width=300',
    2100,
    'Environmental Science',
    8,
    'active'
);

COMMIT;

-- Success message
DO $$
BEGIN
    RAISE NOTICE '';
    RAISE NOTICE '🎉 ===== DATABASE SETUP COMPLETED SUCCESSFULLY! =====';
    RAISE NOTICE '';
    RAISE NOTICE '✅ All tables created with proper structure';
    RAISE NOTICE '✅ Row Level Security enabled with working policies';
    RAISE NOTICE '✅ Indexes created for optimal performance';
    RAISE NOTICE '✅ Trigger created for automatic profile creation';
    RAISE NOTICE '✅ Sample data inserted (3 internships, 3 videos)';
    RAISE NOTICE '';
    RAISE NOTICE '📋 NEXT STEPS:';
    RAISE NOTICE '1. Run the test-database-connection.js script';
    RAISE NOTICE '2. Create test user accounts in Supabase Auth Dashboard';
    RAISE NOTICE '3. Test login functionality';
    RAISE NOTICE '';
    RAISE NOTICE '🔑 Test accounts to create in Supabase Dashboard:';
    RAISE NOTICE '   - student@test.com (password: TestStudent123!)';
    RAISE NOTICE '   - teacher@test.com (password: TestTeacher123!)';
    RAISE NOTICE '   - admin@test.com (password: TestAdmin123!)';
    RAISE NOTICE '';
END $$;
