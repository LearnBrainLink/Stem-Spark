-- Complete database setup for STEM Spark Academy
-- This script creates all necessary tables, functions, and sample data

BEGIN;

-- Drop existing tables if they exist (for clean setup)
DROP TABLE IF EXISTS user_activities CASCADE;
DROP TABLE IF EXISTS parent_info CASCADE;
DROP TABLE IF EXISTS internship_applications CASCADE;
DROP TABLE IF EXISTS applications CASCADE;
DROP TABLE IF EXISTS videos CASCADE;
DROP TABLE IF EXISTS internships CASCADE;
DROP TABLE IF EXISTS profiles CASCADE;

-- Create profiles table
CREATE TABLE profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
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
CREATE TABLE parent_info (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    student_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    parent_name TEXT NOT NULL,
    parent_email TEXT NOT NULL,
    parent_phone TEXT,
    relationship TEXT CHECK (relationship IN ('mother', 'father', 'guardian', 'other')),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create internships table
CREATE TABLE internships (
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
    created_by UUID REFERENCES profiles(id),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create internship_applications table
CREATE TABLE internship_applications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    internship_id UUID REFERENCES internships(id) ON DELETE CASCADE,
    student_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    application_text TEXT NOT NULL,
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected', 'withdrawn')),
    applied_at TIMESTAMPTZ DEFAULT NOW(),
    reviewed_at TIMESTAMPTZ,
    reviewed_by UUID REFERENCES profiles(id),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(internship_id, student_id)
);

-- Create user_activities table
CREATE TABLE user_activities (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    activity_type TEXT NOT NULL,
    activity_description TEXT NOT NULL,
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create videos table
CREATE TABLE videos (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    description TEXT,
    video_url TEXT,
    thumbnail_url TEXT,
    duration INTEGER,
    category TEXT,
    grade_level INTEGER,
    status TEXT DEFAULT 'active' CHECK (status IN ('active', 'inactive')),
    created_by UUID REFERENCES profiles(id),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX idx_profiles_email ON profiles(email);
CREATE INDEX idx_profiles_role ON profiles(role);
CREATE INDEX idx_internships_status ON internships(status);
CREATE INDEX idx_applications_student ON internship_applications(student_id);
CREATE INDEX idx_applications_internship ON internship_applications(internship_id);
CREATE INDEX idx_activities_user ON user_activities(user_id);
CREATE INDEX idx_videos_status ON videos(status);

-- Enable Row Level Security
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE parent_info ENABLE ROW LEVEL SECURITY;
ALTER TABLE internships ENABLE ROW LEVEL SECURITY;
ALTER TABLE internship_applications ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_activities ENABLE ROW LEVEL SECURITY;
ALTER TABLE videos ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
-- Profiles: Users can read their own profile, admins can read all
CREATE POLICY "Users can view own profile" ON profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update own profile" ON profiles FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Admins can view all profiles" ON profiles FOR ALL USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
);

-- Parent info: Students and admins can access
CREATE POLICY "Students can view own parent info" ON parent_info FOR SELECT USING (
    student_id = auth.uid() OR 
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
);

-- Internships: Everyone can read active internships
CREATE POLICY "Everyone can view active internships" ON internships FOR SELECT USING (status = 'active');
CREATE POLICY "Admins can manage internships" ON internships FOR ALL USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
);

-- Applications: Students can manage their own, admins can view all
CREATE POLICY "Students can manage own applications" ON internship_applications FOR ALL USING (
    student_id = auth.uid() OR 
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
);

-- Activities: Users can view their own, admins can view all
CREATE POLICY "Users can view own activities" ON user_activities FOR SELECT USING (
    user_id = auth.uid() OR 
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
);

-- Videos: Everyone can view active videos
CREATE POLICY "Everyone can view active videos" ON videos FOR SELECT USING (status = 'active');
CREATE POLICY "Teachers and admins can manage videos" ON videos FOR ALL USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('teacher', 'admin'))
);

-- Create function to handle new user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.profiles (id, email, full_name, email_verified)
    VALUES (
        NEW.id,
        NEW.email,
        COALESCE(NEW.raw_user_meta_data->>'full_name', ''),
        CASE WHEN NEW.email_confirmed_at IS NOT NULL THEN true ELSE false END
    );
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger for new user signup
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Insert sample internships
INSERT INTO internships (
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
    '10000000-0000-0000-0000-000000000001',
    'Summer Engineering Program',
    'TechCorp Industries',
    'Join our exciting summer engineering program where you will work on real-world projects, learn from experienced engineers, and develop your technical skills. This program covers robotics, programming, and engineering design principles.',
    'Must be in grades 6-8, basic programming knowledge helpful but not required, enthusiasm for STEM subjects',
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
    '10000000-0000-0000-0000-000000000002',
    'Robotics Workshop Internship',
    'Innovation Labs',
    'Hands-on experience building and programming robots. Students will learn about sensors, actuators, and control systems while working on exciting robotics projects.',
    'Grades 7-8, interest in robotics and technology, no prior experience necessary',
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
    '10000000-0000-0000-0000-000000000003',
    'Environmental Engineering Project',
    'Green Solutions Inc',
    'Work on environmental sustainability projects including water purification systems, renewable energy solutions, and environmental monitoring systems.',
    'Grades 6-8, interest in environmental science and engineering, team collaboration skills',
    'Seattle, WA',
    '10 weeks',
    '2024-12-31',
    '2024-06-10',
    '2024-08-20',
    10,
    2,
    'active'
);

-- Insert sample videos
INSERT INTO videos (
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
    '20000000-0000-0000-0000-000000000001',
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
    '20000000-0000-0000-0000-000000000002',
    'Building Your First Robot',
    'Step-by-step guide to building a simple robot using basic components',
    'https://example.com/video2',
    '/placeholder.svg?height=200&width=300',
    2400,
    'Robotics',
    7,
    'active'
),
(
    '20000000-0000-0000-0000-000000000003',
    'Programming Fundamentals',
    'Learn the basics of programming with fun, interactive examples',
    'https://example.com/video3',
    '/placeholder.svg?height=200&width=300',
    2100,
    'Programming',
    8,
    'active'
);

COMMIT;

-- Success message
DO $$
BEGIN
    RAISE NOTICE '✅ Database setup completed successfully!';
    RAISE NOTICE '📊 Created tables: profiles, parent_info, internships, internship_applications, user_activities, videos';
    RAISE NOTICE '🔒 Enabled Row Level Security with proper policies';
    RAISE NOTICE '📝 Inserted sample data: 3 internships, 3 videos';
    RAISE NOTICE '🔍 Created performance indexes';
    RAISE NOTICE '⚡ Created triggers for automatic profile creation';
    RAISE NOTICE '';
    RAISE NOTICE '🎯 Next steps:';
    RAISE NOTICE '   1. Run create-test-accounts.sql to create test users';
    RAISE NOTICE '   2. Configure Supabase Auth settings';
    RAISE NOTICE '   3. Set up email templates in Supabase dashboard';
END $$;
