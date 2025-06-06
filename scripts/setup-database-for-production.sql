-- =============================================================================
-- STEM Spark Academy - Production Database Setup
-- For Supabase Project: qnuevynptgkoivekuzer
-- =============================================================================

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =============================================================================
-- 1. PROFILES TABLE (User Information)
-- =============================================================================
CREATE TABLE IF NOT EXISTS profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  full_name TEXT NOT NULL,
  role TEXT NOT NULL DEFAULT 'student' CHECK (role IN ('student', 'teacher', 'admin', 'parent')),
  grade TEXT,
  school_name TEXT,
  country TEXT,
  state TEXT,
  parent_name TEXT,
  parent_email TEXT,
  parent_phone TEXT,
  relationship TEXT,
  email_verified BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================================================
-- 2. INTERNSHIPS TABLE
-- =============================================================================
CREATE TABLE IF NOT EXISTS internships (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  title TEXT NOT NULL,
  company TEXT NOT NULL,
  description TEXT NOT NULL,
  requirements TEXT[],
  location TEXT NOT NULL,
  duration TEXT NOT NULL,
  application_deadline DATE NOT NULL,
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'closed')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================================================
-- 3. INTERNSHIP APPLICATIONS TABLE
-- =============================================================================
CREATE TABLE IF NOT EXISTS internship_applications (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  internship_id UUID REFERENCES internships(id) ON DELETE CASCADE NOT NULL,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected', 'withdrawn')),
  application_date TIMESTAMPTZ DEFAULT NOW(),
  notes TEXT,
  UNIQUE(user_id, internship_id)
);

-- =============================================================================
-- 4. VIDEOS TABLE
-- =============================================================================
CREATE TABLE IF NOT EXISTS videos (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  video_url TEXT NOT NULL,
  thumbnail_url TEXT,
  duration INTEGER, -- in seconds
  category TEXT NOT NULL,
  difficulty_level TEXT DEFAULT 'beginner' CHECK (difficulty_level IN ('beginner', 'intermediate', 'advanced')),
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'inactive')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================================================
-- 5. USER ACTIVITIES TABLE (Logging)
-- =============================================================================
CREATE TABLE IF NOT EXISTS user_activities (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  activity_type TEXT NOT NULL,
  activity_description TEXT NOT NULL,
  metadata JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================================================
-- 6. ROW LEVEL SECURITY (RLS) POLICIES
-- =============================================================================

-- Enable RLS on all tables
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE internships ENABLE ROW LEVEL SECURITY;
ALTER TABLE internship_applications ENABLE ROW LEVEL SECURITY;
ALTER TABLE videos ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_activities ENABLE ROW LEVEL SECURITY;

-- Profiles policies
CREATE POLICY "Users can view own profile" ON profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update own profile" ON profiles FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Service role can do everything on profiles" ON profiles FOR ALL USING (auth.jwt() ->> 'role' = 'service_role');

-- Internships policies (public read, admin write)
CREATE POLICY "Anyone can view active internships" ON internships FOR SELECT USING (status = 'active');
CREATE POLICY "Service role can manage internships" ON internships FOR ALL USING (auth.jwt() ->> 'role' = 'service_role');

-- Applications policies
CREATE POLICY "Users can view own applications" ON internship_applications FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create own applications" ON internship_applications FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Service role can manage applications" ON internship_applications FOR ALL USING (auth.jwt() ->> 'role' = 'service_role');

-- Videos policies (public read)
CREATE POLICY "Anyone can view active videos" ON videos FOR SELECT USING (status = 'active');
CREATE POLICY "Service role can manage videos" ON videos FOR ALL USING (auth.jwt() ->> 'role' = 'service_role');

-- User activities policies
CREATE POLICY "Users can view own activities" ON user_activities FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Service role can manage activities" ON user_activities FOR ALL USING (auth.jwt() ->> 'role' = 'service_role');

-- =============================================================================
-- 7. FUNCTIONS AND TRIGGERS
-- =============================================================================

-- Function to handle new user registration
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO profiles (id, email, full_name, role)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', 'New User'),
    COALESCE(NEW.raw_user_meta_data->>'role', 'student')
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger for new user registration
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
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
CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON profiles FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_internships_updated_at BEFORE UPDATE ON internships FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- =============================================================================
-- 8. SAMPLE DATA
-- =============================================================================

-- Insert sample internships
INSERT INTO internships (title, company, description, requirements, location, duration, application_deadline) VALUES
('Junior Software Developer Intern', 'TechCorp', 'Learn software development with our experienced team', ARRAY['Basic programming knowledge', 'Enthusiasm to learn'], 'San Francisco, CA', '3 months', '2024-12-31'),
('Engineering Assistant', 'BuildIt Inc', 'Assist with engineering projects and learn CAD software', ARRAY['Interest in engineering', 'Basic math skills'], 'Austin, TX', '2 months', '2024-12-31'),
('Data Science Intern', 'DataWorks', 'Introduction to data analysis and machine learning', ARRAY['Basic statistics', 'Python knowledge helpful'], 'Remote', '4 months', '2024-12-31')
ON CONFLICT DO NOTHING;

-- Insert sample videos
INSERT INTO videos (title, description, video_url, category, difficulty_level) VALUES
('Introduction to Programming', 'Learn the basics of programming with Python', 'https://example.com/video1', 'Programming', 'beginner'),
('Building Your First Robot', 'Step-by-step guide to building a simple robot', 'https://example.com/video2', 'Robotics', 'intermediate'),
('Web Development Fundamentals', 'Learn HTML, CSS, and JavaScript basics', 'https://example.com/video3', 'Web Development', 'beginner')
ON CONFLICT DO NOTHING;

-- =============================================================================
-- SETUP COMPLETE
-- =============================================================================

SELECT 'Database setup completed successfully!' as message;
SELECT 'Tables created: profiles, internships, internship_applications, videos, user_activities' as tables;
SELECT 'RLS policies enabled and configured' as security;
SELECT 'Sample data inserted' as data;
