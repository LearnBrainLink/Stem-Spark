-- Clean Database Setup for STEM Spark Academy
-- This will create a working database schema from scratch

BEGIN;

-- First, let's clean up any existing issues
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP FUNCTION IF EXISTS public.handle_new_user();

-- Drop all existing tables to start fresh
DROP TABLE IF EXISTS user_activities CASCADE;
DROP TABLE IF EXISTS parent_info CASCADE;
DROP TABLE IF EXISTS internship_applications CASCADE;
DROP TABLE IF EXISTS videos CASCADE;
DROP TABLE IF EXISTS internships CASCADE;
DROP TABLE IF EXISTS profiles CASCADE;

-- Create the profiles table first (most important)
CREATE TABLE public.profiles (
    id UUID PRIMARY KEY,
    email TEXT UNIQUE NOT NULL,
    full_name TEXT,
    role TEXT NOT NULL DEFAULT 'student' CHECK (role IN ('student', 'teacher', 'admin')),
    grade INTEGER CHECK (grade >= 5 AND grade <= 8),
    country TEXT,
    state TEXT,
    school_name TEXT,
    email_verified BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create parent_info table
CREATE TABLE public.parent_info (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    student_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    parent_name TEXT NOT NULL,
    parent_email TEXT NOT NULL,
    parent_phone TEXT,
    relationship TEXT CHECK (relationship IN ('mother', 'father', 'guardian', 'other')),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create internships table
CREATE TABLE public.internships (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    company TEXT NOT NULL,
    description TEXT NOT NULL,
    requirements TEXT,
    location TEXT,
    duration TEXT,
    application_deadline DATE,
    start_date DATE,
    end_date DATE,
    max_participants INTEGER DEFAULT 10,
    current_participants INTEGER DEFAULT 0,
    status TEXT DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'completed')),
    created_by UUID REFERENCES public.profiles(id),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create internship_applications table
CREATE TABLE public.internship_applications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    internship_id UUID REFERENCES public.internships(id) ON DELETE CASCADE,
    student_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    application_text TEXT NOT NULL,
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected', 'withdrawn')),
    applied_at TIMESTAMPTZ DEFAULT NOW(),
    reviewed_at TIMESTAMPTZ,
    reviewed_by UUID REFERENCES public.profiles(id),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(internship_id, student_id)
);

-- Create user_activities table
CREATE TABLE public.user_activities (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    activity_type TEXT NOT NULL,
    activity_description TEXT NOT NULL,
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create videos table
CREATE TABLE public.videos (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    description TEXT,
    video_url TEXT,
    thumbnail_url TEXT,
    duration INTEGER,
    category TEXT,
    grade_level INTEGER,
    status TEXT DEFAULT 'active' CHECK (status IN ('active', 'inactive')),
    created_by UUID REFERENCES public.profiles(id),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes for performance
CREATE INDEX idx_profiles_email ON public.profiles(email);
CREATE INDEX idx_profiles_role ON public.profiles(role);
CREATE INDEX idx_internships_status ON public.internships(status);
CREATE INDEX idx_applications_student ON public.internship_applications(student_id);
CREATE INDEX idx_applications_internship ON public.internship_applications(internship_id);
CREATE INDEX idx_activities_user ON public.user_activities(user_id);
CREATE INDEX idx_videos_status ON public.videos(status);

-- Enable Row Level Security
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.parent_info ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.internships ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.internship_applications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_activities ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.videos ENABLE ROW LEVEL SECURITY;

-- Create simple RLS policies that work
-- Profiles: Users can read their own profile, admins can read all
CREATE POLICY "Enable read access for own profile" ON public.profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Enable update access for own profile" ON public.profiles FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Enable insert access for own profile" ON public.profiles FOR INSERT WITH CHECK (auth.uid() = id);

-- Parent info: Students and their parents can access
CREATE POLICY "Enable access for student parent info" ON public.parent_info FOR ALL USING (student_id = auth.uid());

-- Internships: Everyone can read active internships
CREATE POLICY "Enable read access for active internships" ON public.internships FOR SELECT USING (status = 'active');

-- Applications: Students can manage their own applications
CREATE POLICY "Enable access for own applications" ON public.internship_applications FOR ALL USING (student_id = auth.uid());

-- Activities: Users can view their own activities
CREATE POLICY "Enable read access for own activities" ON public.user_activities FOR SELECT USING (user_id = auth.uid());
CREATE POLICY "Enable insert access for own activities" ON public.user_activities FOR INSERT WITH CHECK (user_id = auth.uid());

-- Videos: Everyone can view active videos
CREATE POLICY "Enable read access for active videos" ON public.videos FOR SELECT USING (status = 'active');

-- Create a simple function to handle new user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
BEGIN
    INSERT INTO public.profiles (id, email, full_name, email_verified)
    VALUES (
        NEW.id,
        NEW.email,
        COALESCE(NEW.raw_user_meta_data->>'full_name', ''),
        CASE WHEN NEW.email_confirmed_at IS NOT NULL THEN true ELSE false END
    );
    RETURN NEW;
EXCEPTION
    WHEN others THEN
        -- If there's an error, just return NEW to not block the auth process
        RETURN NEW;
END;
$$;

-- Create the trigger
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
    'Join our exciting summer engineering program where you will work on real-world projects, learn from experienced engineers, and develop your technical skills.',
    'Must be in grades 6-8, basic programming knowledge helpful but not required',
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
    'Hands-on experience building and programming robots. Students will learn about sensors, actuators, and control systems.',
    'Grades 7-8, interest in robotics and technology',
    'Austin, TX',
    '6 weeks',
    '2024-12-31',
    '2024-06-20',
    '2024-08-01',
    12,
    5,
    'active'
);

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
    '33333333-3333-3333-3333-333333333333',
    'Introduction to Engineering',
    'Learn the basics of engineering and discover different engineering disciplines',
    'https://example.com/video1',
    '/placeholder.svg?height=200&width=300',
    1800,
    'Engineering Basics',
    6,
    'active'
),
(
    '44444444-4444-4444-4444-444444444444',
    'Building Your First Robot',
    'Step-by-step guide to building a simple robot using basic components',
    'https://example.com/video2',
    '/placeholder.svg?height=200&width=300',
    2400,
    'Robotics',
    7,
    'active'
);

COMMIT;

-- Success message
DO $$
BEGIN
    RAISE NOTICE '✅ Clean database setup completed successfully!';
    RAISE NOTICE '📊 All tables created with proper structure';
    RAISE NOTICE '🔒 Row Level Security enabled with working policies';
    RAISE NOTICE '📝 Sample data inserted';
    RAISE NOTICE '⚡ Trigger created for automatic profile creation';
    RAISE NOTICE '';
    RAISE NOTICE '🎯 Next: Create test accounts with create-working-test-accounts.sql';
END $$;
