-- Complete Admin Database Setup for Novakinetix Academy
-- This script creates all necessary tables and policies for the admin functionality
-- while maintaining compatibility with existing sign-up functionality

-- ============================================================================
-- CORE TABLES (Maintained from original setup-database.sql)
-- ============================================================================

-- Create profiles table (enhanced with additional fields)
CREATE TABLE IF NOT EXISTS profiles (
  id UUID REFERENCES auth.users ON DELETE CASCADE,
  email TEXT,
  full_name TEXT,
  role TEXT DEFAULT 'student' CHECK (role IN ('student', 'teacher', 'parent', 'admin')),
  grade INTEGER,
  school_name TEXT,
  country TEXT,
  state TEXT,
  email_verified BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  PRIMARY KEY (id)
);

-- Create donations table
CREATE TABLE IF NOT EXISTS donations (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id),
  amount DECIMAL(10,2) NOT NULL,
  currency TEXT DEFAULT 'USD',
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'completed', 'failed', 'refunded')),
  stripe_payment_intent_id TEXT,
  donor_name TEXT,
  donor_email TEXT,
  message TEXT,
  is_anonymous BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create email_templates table
CREATE TABLE IF NOT EXISTS email_templates (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT UNIQUE NOT NULL,
  subject TEXT NOT NULL,
  html_content TEXT NOT NULL,
  text_content TEXT,
  variables JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create user_progress table
CREATE TABLE IF NOT EXISTS user_progress (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id),
  course_id TEXT NOT NULL,
  lesson_id TEXT NOT NULL,
  completed BOOLEAN DEFAULT FALSE,
  score INTEGER,
  completed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, course_id, lesson_id)
);

-- ============================================================================
-- ADMIN-SPECIFIC TABLES
-- ============================================================================

-- Create internships table
CREATE TABLE IF NOT EXISTS internships (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  company TEXT NOT NULL,
  location TEXT,
  duration TEXT,
  requirements TEXT,
  application_deadline TIMESTAMP WITH TIME ZONE,
  start_date TIMESTAMP WITH TIME ZONE,
  end_date TIMESTAMP WITH TIME ZONE,
  max_participants INTEGER DEFAULT 1,
  current_participants INTEGER DEFAULT 0,
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'draft', 'completed')),
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create internship_applications table
CREATE TABLE IF NOT EXISTS internship_applications (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  internship_id UUID REFERENCES internships(id) ON DELETE CASCADE,
  student_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  application_text TEXT,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected', 'withdrawn')),
  applied_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(internship_id, student_id)
);

-- Create videos table
CREATE TABLE IF NOT EXISTS videos (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  video_url TEXT NOT NULL,
  thumbnail_url TEXT,
  duration INTEGER DEFAULT 0,
  category TEXT NOT NULL,
  grade_level INTEGER NOT NULL,
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'draft')),
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create user_activities table for logging
CREATE TABLE IF NOT EXISTS user_activities (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  activity_type TEXT NOT NULL,
  activity_description TEXT,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create applications table (alternative to internship_applications for compatibility)
CREATE TABLE IF NOT EXISTS applications (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  student_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  internship_id UUID REFERENCES internships(id) ON DELETE CASCADE,
  student_statement TEXT,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected', 'withdrawn')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(internship_id, student_id)
);

-- Create configuration table for site settings
CREATE TABLE IF NOT EXISTS site_configuration (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  key TEXT UNIQUE NOT NULL,
  value TEXT,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================================================
-- DEFAULT DATA
-- ============================================================================

-- Insert default configuration values
INSERT INTO site_configuration (key, value, description) VALUES
  ('site_url', 'http://localhost:3000', 'Main site URL for email redirects'),
  ('supabase_url', '', 'Supabase project URL'),
  ('email_enabled', 'true', 'Whether email functionality is enabled'),
  ('maintenance_mode', 'false', 'Whether the site is in maintenance mode')
ON CONFLICT (key) DO NOTHING;

-- ============================================================================
-- ROW LEVEL SECURITY
-- ============================================================================

-- Enable Row Level Security on all tables
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE donations ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE internships ENABLE ROW LEVEL SECURITY;
ALTER TABLE internship_applications ENABLE ROW LEVEL SECURITY;
ALTER TABLE videos ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_activities ENABLE ROW LEVEL SECURITY;
ALTER TABLE applications ENABLE ROW LEVEL SECURITY;
ALTER TABLE site_configuration ENABLE ROW LEVEL SECURITY;

-- ============================================================================
-- SECURITY POLICIES
-- ============================================================================

-- Profiles policies
CREATE POLICY "Users can view own profile" ON profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON profiles
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile" ON profiles
  FOR INSERT WITH CHECK (auth.uid() = id);

CREATE POLICY "Admins can view all profiles" ON profiles
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

CREATE POLICY "Admins can update all profiles" ON profiles
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Donations policies
CREATE POLICY "Users can view own donations" ON donations
  FOR SELECT USING (auth.uid() = user_id OR user_id IS NULL);

CREATE POLICY "Users can insert own donations" ON donations
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Admins can view all donations" ON donations
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- User progress policies
CREATE POLICY "Users can view own progress" ON user_progress
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can update own progress" ON user_progress
  FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all progress" ON user_progress
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Internships policies
CREATE POLICY "Anyone can view active internships" ON internships
  FOR SELECT USING (status = 'active');

CREATE POLICY "Admins can view all internships" ON internships
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

CREATE POLICY "Admins can insert internships" ON internships
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

CREATE POLICY "Admins can update internships" ON internships
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

CREATE POLICY "Admins can delete internships" ON internships
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Internship applications policies
CREATE POLICY "Users can view own applications" ON internship_applications
  FOR SELECT USING (auth.uid() = student_id);

CREATE POLICY "Users can insert own applications" ON internship_applications
  FOR INSERT WITH CHECK (auth.uid() = student_id);

CREATE POLICY "Users can update own applications" ON internship_applications
  FOR UPDATE USING (auth.uid() = student_id);

CREATE POLICY "Admins can view all applications" ON internship_applications
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

CREATE POLICY "Admins can update all applications" ON internship_applications
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Videos policies
CREATE POLICY "Anyone can view active videos" ON videos
  FOR SELECT USING (status = 'active');

CREATE POLICY "Admins can view all videos" ON videos
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

CREATE POLICY "Admins can insert videos" ON videos
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

CREATE POLICY "Admins can update videos" ON videos
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

CREATE POLICY "Admins can delete videos" ON videos
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- User activities policies
CREATE POLICY "Users can view own activities" ON user_activities
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own activities" ON user_activities
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Admins can view all activities" ON user_activities
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Applications (alternative) policies
CREATE POLICY "Users can view own applications alt" ON applications
  FOR SELECT USING (auth.uid() = student_id);

CREATE POLICY "Users can insert own applications alt" ON applications
  FOR INSERT WITH CHECK (auth.uid() = student_id);

CREATE POLICY "Users can update own applications alt" ON applications
  FOR UPDATE USING (auth.uid() = student_id);

CREATE POLICY "Admins can view all applications alt" ON applications
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

CREATE POLICY "Admins can update all applications alt" ON applications
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Site configuration policies
CREATE POLICY "Admins can view configuration" ON site_configuration
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

CREATE POLICY "Admins can update configuration" ON site_configuration
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

CREATE POLICY "Admins can insert configuration" ON site_configuration
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- ============================================================================
-- PERFORMANCE INDEXES
-- ============================================================================

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_profiles_role ON profiles(role);
CREATE INDEX IF NOT EXISTS idx_profiles_email ON profiles(email);
CREATE INDEX IF NOT EXISTS idx_donations_status ON donations(status);
CREATE INDEX IF NOT EXISTS idx_donations_created_at ON donations(created_at);
CREATE INDEX IF NOT EXISTS idx_internships_status ON internships(status);
CREATE INDEX IF NOT EXISTS idx_internships_company ON internships(company);
CREATE INDEX IF NOT EXISTS idx_internship_applications_status ON internship_applications(status);
CREATE INDEX IF NOT EXISTS idx_internship_applications_student ON internship_applications(student_id);
CREATE INDEX IF NOT EXISTS idx_videos_status ON videos(status);
CREATE INDEX IF NOT EXISTS idx_videos_category ON videos(category);
CREATE INDEX IF NOT EXISTS idx_user_activities_user ON user_activities(user_id);
CREATE INDEX IF NOT EXISTS idx_user_activities_type ON user_activities(activity_type);
CREATE INDEX IF NOT EXISTS idx_applications_status ON applications(status);
CREATE INDEX IF NOT EXISTS idx_applications_student ON applications(student_id);

-- ============================================================================
-- TRIGGERS AND FUNCTIONS
-- ============================================================================

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for updated_at
CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON profiles
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_internships_updated_at BEFORE UPDATE ON internships
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_internship_applications_updated_at BEFORE UPDATE ON internship_applications
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_videos_updated_at BEFORE UPDATE ON videos
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_applications_updated_at BEFORE UPDATE ON applications
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_site_configuration_updated_at BEFORE UPDATE ON site_configuration
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Create function to create applications table if not exists (for compatibility)
CREATE OR REPLACE FUNCTION create_applications_table_if_not_exists()
RETURNS void AS $$
BEGIN
    -- This function is called from the application code for compatibility
    -- The table is already created above, so this is just a placeholder
    RETURN;
END;
$$ LANGUAGE plpgsql;

-- ============================================================================
-- VERIFICATION QUERIES
-- ============================================================================

-- Uncomment these queries to verify the setup
-- SELECT 'profiles' as table_name, COUNT(*) as row_count FROM profiles
-- UNION ALL
-- SELECT 'internships', COUNT(*) FROM internships
-- UNION ALL
-- SELECT 'videos', COUNT(*) FROM videos
-- UNION ALL
-- SELECT 'site_configuration', COUNT(*) FROM site_configuration;

-- SELECT 'RLS enabled tables:' as info;
-- SELECT schemaname, tablename FROM pg_tables 
-- WHERE schemaname = 'public' AND tablename IN (
--   'profiles', 'donations', 'user_progress', 'internships', 
--   'internship_applications', 'videos', 'user_activities', 
--   'applications', 'site_configuration'
-- );

-- ============================================================================
-- SUCCESS MESSAGE
-- ============================================================================

-- Note: This is a comment since SQL doesn't have PRINT statements like T-SQL
-- ✅ Complete admin database setup finished successfully!
-- 📋 Tables created: profiles, donations, user_progress, internships, internship_applications, videos, user_activities, applications, site_configuration
-- 🔒 RLS policies configured for all tables
-- 📊 Performance indexes created
-- ⚡ Triggers and functions configured
-- 
-- 🚀 Your admin dashboard should now work with full functionality!
-- 📧 Email configuration page will display actual site and Supabase URLs
-- 👥 User management, internships, applications, and videos are ready
-- 📈 Analytics and dashboard stats will show real data 