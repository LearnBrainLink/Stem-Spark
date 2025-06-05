-- Complete database setup with all necessary tables and data
BEGIN;

-- Ensure all necessary tables exist
CREATE TABLE IF NOT EXISTS profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT UNIQUE NOT NULL,
    full_name TEXT,
    role TEXT NOT NULL DEFAULT 'student',
    grade INTEGER,
    country TEXT,
    state TEXT,
    school_name TEXT,
    email_verified BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS parent_info (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    student_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    parent_name TEXT NOT NULL,
    parent_email TEXT NOT NULL,
    parent_phone TEXT,
    relationship TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS internships (
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
    status TEXT DEFAULT 'active',
    created_by UUID REFERENCES profiles(id),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS internship_applications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    internship_id UUID REFERENCES internships(id) ON DELETE CASCADE,
    student_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    application_text TEXT NOT NULL,
    status TEXT DEFAULT 'pending',
    applied_at TIMESTAMPTZ DEFAULT NOW(),
    reviewed_at TIMESTAMPTZ,
    reviewed_by UUID REFERENCES profiles(id),
    UNIQUE(internship_id, student_id)
);

CREATE TABLE IF NOT EXISTS user_activities (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    activity_type TEXT NOT NULL,
    activity_description TEXT NOT NULL,
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS videos (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    description TEXT,
    video_url TEXT,
    thumbnail_url TEXT,
    duration INTEGER,
    category TEXT,
    grade_level INTEGER,
    status TEXT DEFAULT 'active',
    created_by UUID REFERENCES profiles(id),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_profiles_email ON profiles(email);
CREATE INDEX IF NOT EXISTS idx_profiles_role ON profiles(role);
CREATE INDEX IF NOT EXISTS idx_internships_status ON internships(status);
CREATE INDEX IF NOT EXISTS idx_applications_student ON internship_applications(student_id);
CREATE INDEX IF NOT EXISTS idx_applications_internship ON internship_applications(internship_id);

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
    '2024-04-15',
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
    '2024-05-01',
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
    '2024-04-30',
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
    RAISE NOTICE '📝 Inserted sample data: 3 internships, 3 videos';
    RAISE NOTICE '🔍 Created performance indexes';
    RAISE NOTICE '';
    RAISE NOTICE '🎯 Next steps:';
    RAISE NOTICE '   1. Configure Supabase Auth settings';
    RAISE NOTICE '   2. Set up email templates';
    RAISE NOTICE '   3. Test user registration and login';
END $$;
