-- =============================================================================
-- STEM Spark Academy - FIXED Database Setup
-- Correcting column naming issues
-- =============================================================================

-- Clean up any existing problematic objects
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP FUNCTION IF EXISTS handle_new_user() CASCADE;
DROP POLICY IF EXISTS "Users can view own activities" ON user_activities;
DROP POLICY IF EXISTS "Service role can manage activities" ON user_activities;
DROP POLICY IF EXISTS "Users can view own applications" ON internship_applications;
DROP POLICY IF EXISTS "Users can create own applications" ON internship_applications;
DROP POLICY IF EXISTS "Service role can manage applications" ON internship_applications;

-- Drop tables if they exist (in correct order)
DROP TABLE IF EXISTS user_activities CASCADE;
DROP TABLE IF EXISTS internship_applications CASCADE;
DROP TABLE IF EXISTS videos CASCADE;
DROP TABLE IF EXISTS internships CASCADE;
DROP TABLE IF EXISTS profiles CASCADE;

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =============================================================================
-- 1. PROFILES TABLE (User Information)
-- =============================================================================
CREATE TABLE profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  full_name TEXT NOT NULL DEFAULT '',
  role TEXT NOT NULL DEFAULT 'student' CHECK (role IN ('student', 'teacher', 'admin', 'parent')),
  grade TEXT DEFAULT '',
  school_name TEXT DEFAULT '',
  country TEXT DEFAULT '',
  state TEXT DEFAULT '',
  parent_name TEXT DEFAULT '',
  parent_email TEXT DEFAULT '',
  parent_phone TEXT DEFAULT '',
  relationship TEXT DEFAULT '',
  email_verified BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================================================
-- 2. INTERNSHIPS TABLE
-- =============================================================================
CREATE TABLE internships (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  title TEXT NOT NULL DEFAULT '',
  company TEXT NOT NULL DEFAULT '',
  description TEXT NOT NULL DEFAULT '',
  requirements TEXT[] DEFAULT '{}',
  location TEXT NOT NULL DEFAULT '',
  duration TEXT NOT NULL DEFAULT '',
  application_deadline DATE NOT NULL DEFAULT CURRENT_DATE + INTERVAL '30 days',
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'closed')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================================================
-- 3. INTERNSHIP APPLICATIONS TABLE (Fixed column name)
-- =============================================================================
CREATE TABLE internship_applications (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  student_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  internship_id UUID REFERENCES internships(id) ON DELETE CASCADE NOT NULL,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected', 'withdrawn')),
  application_date TIMESTAMPTZ DEFAULT NOW(),
  application_text TEXT DEFAULT '',
  notes TEXT DEFAULT '',
  UNIQUE(student_id, internship_id)
);

-- =============================================================================
-- 4. VIDEOS TABLE
-- =============================================================================
CREATE TABLE videos (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  title TEXT NOT NULL DEFAULT '',
  description TEXT DEFAULT '',
  video_url TEXT NOT NULL DEFAULT '',
  thumbnail_url TEXT DEFAULT '',
  duration INTEGER DEFAULT 0, -- in seconds
  category TEXT NOT NULL DEFAULT 'general',
  difficulty_level TEXT DEFAULT 'beginner' CHECK (difficulty_level IN ('beginner', 'intermediate', 'advanced')),
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'inactive')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================================================
-- 5. USER ACTIVITIES TABLE (Fixed column name)
-- =============================================================================
CREATE TABLE user_activities (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  activity_type TEXT NOT NULL DEFAULT '',
  activity_description TEXT NOT NULL DEFAULT '',
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================================================
-- 6. CREATE INDEXES FOR PERFORMANCE
-- =============================================================================
CREATE INDEX idx_profiles_email ON profiles(email);
CREATE INDEX idx_profiles_role ON profiles(role);
CREATE INDEX idx_internships_status ON internships(status);
CREATE INDEX idx_internships_deadline ON internships(application_deadline);
CREATE INDEX idx_applications_student ON internship_applications(student_id);
CREATE INDEX idx_applications_internship ON internship_applications(internship_id);
CREATE INDEX idx_activities_user ON user_activities(user_id);
CREATE INDEX idx_videos_status ON videos(status);

-- =============================================================================
-- 7. ROW LEVEL SECURITY (RLS) POLICIES
-- =============================================================================

-- Enable RLS on all tables
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE internships ENABLE ROW LEVEL SECURITY;
ALTER TABLE internship_applications ENABLE ROW LEVEL SECURITY;
ALTER TABLE videos ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_activities ENABLE ROW LEVEL SECURITY;

-- Profiles policies
CREATE POLICY "Users can view own profile" ON profiles 
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON profiles 
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile" ON profiles 
  FOR INSERT WITH CHECK (auth.uid() = id);

-- Internships policies (public read)
CREATE POLICY "Anyone can view active internships" ON internships 
  FOR SELECT USING (status = 'active');

-- Applications policies (fixed column reference)
CREATE POLICY "Users can view own applications" ON internship_applications 
  FOR SELECT USING (auth.uid() = student_id);

CREATE POLICY "Users can create own applications" ON internship_applications 
  FOR INSERT WITH CHECK (auth.uid() = student_id);

CREATE POLICY "Users can update own applications" ON internship_applications 
  FOR UPDATE USING (auth.uid() = student_id);

-- Videos policies (public read)
CREATE POLICY "Anyone can view active videos" ON videos 
  FOR SELECT USING (status = 'active');

-- User activities policies (fixed column reference)
CREATE POLICY "Users can view own activities" ON user_activities 
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own activities" ON user_activities 
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- =============================================================================
-- 8. FUNCTIONS AND TRIGGERS
-- =============================================================================

-- Function to handle new user registration
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER 
LANGUAGE plpgsql 
SECURITY DEFINER 
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name, role, email_verified)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', ''),
    COALESCE(NEW.raw_user_meta_data->>'role', 'student'),
    CASE WHEN NEW.email_confirmed_at IS NOT NULL THEN true ELSE false END
  );
  
  -- Log the user creation
  INSERT INTO public.user_activities (user_id, activity_type, activity_description, metadata)
  VALUES (
    NEW.id,
    'account_created',
    'New user account created',
    jsonb_build_object('role', COALESCE(NEW.raw_user_meta_data->>'role', 'student'))
  );
  
  RETURN NEW;
EXCEPTION
  WHEN others THEN
    -- Log error but don't fail the auth process
    RAISE WARNING 'Failed to create profile for user %: %', NEW.id, SQLERRM;
    RETURN NEW;
END;
$$;

-- Trigger for new user registration
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers for updated_at
CREATE TRIGGER update_profiles_updated_at 
  BEFORE UPDATE ON profiles 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_internships_updated_at 
  BEFORE UPDATE ON internships 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- =============================================================================
-- 9. SAMPLE DATA
-- =============================================================================

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
  status
) VALUES
(
  '11111111-1111-1111-1111-111111111111',
  'Junior Software Developer Intern', 
  'TechCorp', 
  'Learn software development with our experienced team. Work on real projects and gain hands-on experience with modern technologies.', 
  ARRAY['Basic programming knowledge', 'Enthusiasm to learn', 'Problem-solving skills'], 
  'San Francisco, CA', 
  '3 months', 
  '2024-12-31',
  'active'
),
(
  '22222222-2222-2222-2222-222222222222',
  'Engineering Assistant', 
  'BuildIt Inc', 
  'Assist with engineering projects and learn CAD software. Great opportunity to see how engineering principles are applied in real-world projects.', 
  ARRAY['Interest in engineering', 'Basic math skills', 'Attention to detail'], 
  'Austin, TX', 
  '2 months', 
  '2024-12-31',
  'active'
),
(
  '33333333-3333-3333-3333-333333333333',
  'Data Science Intern', 
  'DataWorks', 
  'Introduction to data analysis and machine learning. Learn to work with real datasets and create meaningful insights.', 
  ARRAY['Basic statistics', 'Python knowledge helpful', 'Curiosity about data'], 
  'Remote', 
  '4 months', 
  '2024-12-31',
  'active'
);

-- Insert sample videos
INSERT INTO videos (
  id,
  title, 
  description, 
  video_url, 
  thumbnail_url,
  category, 
  difficulty_level,
  duration,
  status
) VALUES
(
  '44444444-4444-4444-4444-444444444444',
  'Introduction to Programming', 
  'Learn the basics of programming with Python. Perfect for beginners who want to start their coding journey.', 
  'https://example.com/video1',
  '/placeholder.svg?height=200&width=300',
  'Programming', 
  'beginner',
  1800,
  'active'
),
(
  '55555555-5555-5555-5555-555555555555',
  'Building Your First Robot', 
  'Step-by-step guide to building a simple robot. Learn about sensors, motors, and basic programming.', 
  'https://example.com/video2',
  '/placeholder.svg?height=200&width=300',
  'Robotics', 
  'intermediate',
  2400,
  'active'
),
(
  '66666666-6666-6666-6666-666666666666',
  'Web Development Fundamentals', 
  'Learn HTML, CSS, and JavaScript basics. Build your first website from scratch.', 
  'https://example.com/video3',
  '/placeholder.svg?height=200&width=300',
  'Web Development', 
  'beginner',
  2100,
  'active'
);

-- =============================================================================
-- 10. VERIFICATION QUERIES
-- =============================================================================

-- Verify tables were created
SELECT 
  schemaname,
  tablename,
  tableowner
FROM pg_tables 
WHERE schemaname = 'public' 
  AND tablename IN ('profiles', 'internships', 'internship_applications', 'videos', 'user_activities')
ORDER BY tablename;

-- Verify sample data was inserted
SELECT 'Internships' as table_name, count(*) as record_count FROM internships
UNION ALL
SELECT 'Videos' as table_name, count(*) as record_count FROM videos;

-- =============================================================================
-- SUCCESS MESSAGE
-- =============================================================================
DO $$
BEGIN
  RAISE NOTICE '';
  RAISE NOTICE '🎉 ===== DATABASE SETUP COMPLETED SUCCESSFULLY! =====';
  RAISE NOTICE '';
  RAISE NOTICE '✅ All tables created with correct column names';
  RAISE NOTICE '✅ Fixed student_id and user_id column references';
  RAISE NOTICE '✅ Row Level Security policies configured';
  RAISE NOTICE '✅ Triggers and functions created';
  RAISE NOTICE '✅ Sample data inserted (3 internships, 3 videos)';
  RAISE NOTICE '✅ Indexes created for performance';
  RAISE NOTICE '';
  RAISE NOTICE '📋 TABLES CREATED:';
  RAISE NOTICE '   - profiles (user information)';
  RAISE NOTICE '   - internships (available opportunities)';
  RAISE NOTICE '   - internship_applications (student applications)';
  RAISE NOTICE '   - videos (learning content)';
  RAISE NOTICE '   - user_activities (activity logging)';
  RAISE NOTICE '';
  RAISE NOTICE '🔑 READY FOR AUTHENTICATION TESTING!';
  RAISE NOTICE '';
END $$;
