-- Complete database setup with all necessary tables and data
BEGIN;

-- Drop existing tables if they exist to start fresh
DROP TABLE IF EXISTS user_activities CASCADE;
DROP TABLE IF EXISTS internship_applications CASCADE;
DROP TABLE IF EXISTS videos CASCADE;
DROP TABLE IF EXISTS internships CASCADE;
DROP TABLE IF EXISTS parent_info CASCADE;
DROP TABLE IF EXISTS profiles CASCADE;

-- Create profiles table with proper structure
CREATE TABLE profiles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT UNIQUE NOT NULL,
    full_name TEXT,
    role TEXT NOT NULL DEFAULT 'student',
    user_type TEXT NOT NULL DEFAULT 'student', -- 'student', 'admin', 'parent'
    grade INTEGER,
    country TEXT,
    state TEXT,
    school_name TEXT,
    email_verified BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE parent_info (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    student_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    parent_name TEXT NOT NULL,
    parent_email TEXT NOT NULL,
    parent_phone TEXT,
    relationship TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE internships (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    company TEXT NOT NULL,
    description TEXT NOT NULL,
    requirements TEXT,
    benefits TEXT,
    location TEXT,
    duration TEXT,
    application_deadline DATE,
    start_date DATE,
    end_date DATE,
    max_participants INTEGER DEFAULT 10,
    current_participants INTEGER DEFAULT 0,
    status TEXT DEFAULT 'published', -- 'draft', 'published', 'closed'
    created_by UUID REFERENCES profiles(id),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE internship_applications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    internship_id UUID REFERENCES internships(id) ON DELETE CASCADE,
    student_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    application_text TEXT NOT NULL,
    status TEXT DEFAULT 'pending', -- 'pending', 'approved', 'rejected'
    applied_at TIMESTAMPTZ DEFAULT NOW(),
    reviewed_at TIMESTAMPTZ,
    reviewed_by UUID REFERENCES profiles(id),
    UNIQUE(internship_id, student_id)
);

CREATE TABLE user_activities (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    activity_type TEXT NOT NULL,
    activity_description TEXT NOT NULL,
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE videos (
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
CREATE INDEX IF NOT EXISTS idx_profiles_user_type ON profiles(user_type);
CREATE INDEX IF NOT EXISTS idx_profiles_user_id ON profiles(user_id);
CREATE INDEX IF NOT EXISTS idx_internships_status ON internships(status);
CREATE INDEX IF NOT EXISTS idx_internships_deadline ON internships(application_deadline);
CREATE INDEX IF NOT EXISTS idx_applications_student ON internship_applications(student_id);
CREATE INDEX IF NOT EXISTS idx_applications_internship ON internship_applications(internship_id);
CREATE INDEX IF NOT EXISTS idx_applications_status ON internship_applications(status);

-- Insert demo admin profiles (these will need to be linked to actual auth.users after signup)
INSERT INTO profiles (
    id,
    email,
    full_name,
    role,
    user_type,
    country,
    state,
    email_verified
) VALUES 
(
    '00000000-0000-0000-0000-000000000001',
    'sarah.johnson@stemspark.edu',
    'Dr. Sarah Johnson',
    'STEM Education Director',
    'admin',
    'United States',
    'California',
    true
),
(
    '00000000-0000-0000-0000-000000000002',
    'michael.chen@stemspark.edu',
    'Prof. Michael Chen',
    'Engineering Program Lead',
    'admin',
    'United States',
    'Texas',
    true
),
(
    '00000000-0000-0000-0000-000000000003',
    'emily.rodriguez@stemspark.edu',
    'Dr. Emily Rodriguez',
    'Computer Science Coordinator',
    'admin',
    'United States',
    'Massachusetts',
    true
),
(
    '00000000-0000-0000-0000-000000000004',
    'james.wilson@stemspark.edu',
    'Dr. James Wilson',
    'Mathematics Department Head',
    'admin',
    'United States',
    'New York',
    true
);

-- Insert sample internships created by admin users
INSERT INTO internships (
    id,
    title,
    company,
    description,
    requirements,
    benefits,
    location,
    duration,
    application_deadline,
    start_date,
    end_date,
    max_participants,
    current_participants,
    status,
    created_by
) VALUES 
(
    '10000000-0000-0000-0000-000000000001',
    'Software Development Internship',
    'TechEd Solutions',
    'Join our team to develop cutting-edge educational software applications. You will work with experienced developers to create tools that help students learn STEM subjects more effectively. This internship offers hands-on experience with modern web technologies, database design, and user interface development.',
    'Basic programming knowledge in Python or JavaScript, strong problem-solving skills, enthusiasm for educational technology, and ability to work collaboratively in an agile development environment.',
    'Mentorship from senior developers, real project experience, certificate of completion, potential job offer, flexible work arrangements, and professional development opportunities.',
    'San Francisco, CA',
    '12 weeks',
    '2024-03-15',
    '2024-06-01',
    '2024-08-15',
    5,
    2,
    'published',
    '00000000-0000-0000-0000-000000000001'
),
(
    '10000000-0000-0000-0000-000000000002',
    'Robotics Engineering Internship',
    'RoboLearn Inc.',
    'Design and build autonomous robots for educational purposes. Work with Arduino, sensors, and mechanical components to create engaging learning tools. You will participate in the full development cycle from concept to deployment, including 3D printing, circuit design, and programming.',
    'Interest in robotics and engineering, basic electronics knowledge, ability to work in teams, familiarity with programming concepts, and enthusiasm for hands-on learning.',
    'Hands-on robotics experience, industry mentorship, project portfolio development, access to cutting-edge equipment, and networking opportunities with industry professionals.',
    'Austin, TX',
    '10 weeks',
    '2024-03-20',
    '2024-06-15',
    '2024-08-20',
    8,
    3,
    'published',
    '00000000-0000-0000-0000-000000000002'
),
(
    '10000000-0000-0000-0000-000000000003',
    'Data Science Research Internship',
    'EduData Analytics',
    'Analyze educational data to improve learning outcomes. Use Python, R, and machine learning techniques to discover insights from student performance data. You will work on real research projects that have the potential to impact educational policy and practice.',
    'Basic statistics knowledge, familiarity with Python or R, interest in data analysis, strong analytical thinking skills, and ability to communicate findings effectively.',
    'Research experience, data science skills development, publication opportunities, mentorship from PhD-level researchers, and potential conference presentation opportunities.',
    'Boston, MA',
    '8 weeks',
    '2024-04-01',
    '2024-07-01',
    '2024-08-25',
    6,
    1,
    'published',
    '00000000-0000-0000-0000-000000000003'
),
(
    '10000000-0000-0000-0000-000000000004',
    'Cybersecurity Internship',
    'SecureEdu Technologies',
    'Learn about network security, ethical hacking, and digital forensics. Work with industry-standard tools to identify vulnerabilities and develop security solutions for educational institutions.',
    'Basic networking knowledge, interest in cybersecurity, strong attention to detail, ethical mindset, and willingness to learn new technologies.',
    'Industry certifications, hands-on security experience, mentorship from certified security professionals, and potential full-time employment opportunities.',
    'Washington, DC',
    '12 weeks',
    '2024-03-10',
    '2024-06-10',
    '2024-08-30',
    4,
    0,
    'published',
    '00000000-0000-0000-0000-000000000004'
),
(
    '10000000-0000-0000-0000-000000000005',
    'Biomedical Engineering Internship',
    'MedTech Innovations',
    'Develop medical devices and educational tools for healthcare training. Work on projects involving 3D modeling, simulation software, and prototype development for medical education.',
    'Interest in healthcare and engineering, basic knowledge of biology or anatomy, problem-solving skills, and ability to work with precision.',
    'Medical device development experience, healthcare industry exposure, professional networking, and potential patent collaboration opportunities.',
    'Chicago, IL',
    '10 weeks',
    '2024-03-25',
    '2024-06-20',
    '2024-08-25',
    6,
    1,
    'published',
    '00000000-0000-0000-0000-000000000001'
),
(
    '10000000-0000-0000-0000-000000000006',
    'Environmental Science Research Internship',
    'GreenTech Research Institute',
    'Conduct field research on environmental sustainability and climate change impacts. Use data collection equipment, analyze environmental samples, and contribute to ongoing research projects.',
    'Interest in environmental science, basic chemistry knowledge, physical fitness for fieldwork, and commitment to environmental sustainability.',
    'Field research experience, scientific publication opportunities, environmental monitoring skills, and potential graduate school recommendations.',
    'Portland, OR',
    '8 weeks',
    '2024-04-05',
    '2024-07-05',
    '2024-08-30',
    10,
    4,
    'published',
    '00000000-0000-0000-0000-000000000002'
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
    status,
    created_by
) VALUES 
(
    '20000000-0000-0000-0000-000000000001',
    'Introduction to Engineering',
    'Learn the basics of engineering and discover different engineering disciplines. This comprehensive guide covers mechanical, electrical, civil, and software engineering.',
    'https://example.com/videos/intro-engineering',
    '/api/placeholder/300/200',
    1800,
    'Engineering Basics',
    6,
    'active',
    '00000000-0000-0000-0000-000000000001'
),
(
    '20000000-0000-0000-0000-000000000002',
    'Building Your First Robot',
    'Step-by-step guide to building a simple robot using basic components. Learn about sensors, motors, and basic programming concepts.',
    'https://example.com/videos/first-robot',
    '/api/placeholder/300/200',
    2400,
    'Robotics',
    7,
    'active',
    '00000000-0000-0000-0000-000000000002'
),
(
    '20000000-0000-0000-0000-000000000003',
    'Programming Fundamentals',
    'Learn the basics of programming with fun, interactive examples. Covers variables, loops, functions, and problem-solving strategies.',
    'https://example.com/videos/programming-basics',
    '/api/placeholder/300/200',
    2100,
    'Programming',
    8,
    'active',
    '00000000-0000-0000-0000-000000000003'
),
(
    '20000000-0000-0000-0000-000000000004',
    'Data Science for Beginners',
    'Introduction to data science concepts including data collection, analysis, and visualization. Perfect for middle school students.',
    'https://example.com/videos/data-science',
    '/api/placeholder/300/200',
    1950,
    'Data Science',
    7,
    'active',
    '00000000-0000-0000-0000-000000000003'
),
(
    '20000000-0000-0000-0000-000000000005',
    'Environmental Engineering Solutions',
    'Explore how engineers solve environmental problems through innovative technologies and sustainable design practices.',
    'https://example.com/videos/environmental-engineering',
    '/api/placeholder/300/200',
    2200,
    'Environmental Science',
    8,
    'active',
    '00000000-0000-0000-0000-000000000004'
);

-- Insert some sample applications
INSERT INTO internship_applications (
    internship_id,
    student_id,
    application_text,
    status
) VALUES 
(
    '10000000-0000-0000-0000-000000000001',
    '00000000-0000-0000-0000-000000000001',
    'I am very interested in software development and have been learning Python for the past year. I built a simple calculator app and would love to work on educational software that can help other students learn better.',
    'approved'
),
(
    '10000000-0000-0000-0000-000000000002',
    '00000000-0000-0000-0000-000000000002',
    'Robotics has always fascinated me. I have experience with Arduino and built a line-following robot for my school science fair. I am excited about the opportunity to work with more advanced robotics systems.',
    'pending'
);

COMMIT;

-- Create a function to link profiles to auth users after signup
CREATE OR REPLACE FUNCTION link_profile_to_auth_user(profile_email TEXT, auth_user_id UUID)
RETURNS VOID AS $$
BEGIN
    UPDATE profiles 
    SET user_id = auth_user_id 
    WHERE email = profile_email AND user_id IS NULL;
END;
$$ LANGUAGE plpgsql;

-- Success message
DO $$
BEGIN
    RAISE NOTICE '✅ Database setup completed successfully!';
    RAISE NOTICE '📊 Created tables: profiles, parent_info, internships, internship_applications, user_activities, videos';
    RAISE NOTICE '👥 Inserted 4 admin profiles (need to be linked to auth.users after signup)';
    RAISE NOTICE '💼 Inserted 6 sample internships with various STEM fields';
    RAISE NOTICE '🎥 Inserted 5 educational videos';
    RAISE NOTICE '📝 Inserted 2 sample applications';
    RAISE NOTICE '🔍 Created performance indexes';
    RAISE NOTICE '';
    RAISE NOTICE '🎯 Next steps:';
    RAISE NOTICE '   1. Admin users need to sign up with these emails:';
    RAISE NOTICE '      - sarah.johnson@stemspark.edu (Password: AdminPass123!)';
    RAISE NOTICE '      - michael.chen@stemspark.edu (Password: AdminPass123!)';
    RAISE NOTICE '      - emily.rodriguez@stemspark.edu (Password: AdminPass123!)';
    RAISE NOTICE '      - james.wilson@stemspark.edu (Password: AdminPass123!)';
    RAISE NOTICE '   2. After signup, run: SELECT link_profile_to_auth_user(''email@domain.com'', auth_user_id);';
    RAISE NOTICE '   3. Configure Supabase Auth settings';
    RAISE NOTICE '   4. Set up email templates';
    RAISE NOTICE '   5. Test user registration and login';
END;
$$;
