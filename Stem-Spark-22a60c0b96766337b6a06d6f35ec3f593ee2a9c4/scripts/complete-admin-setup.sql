-- Complete Admin Dashboard Setup Script
-- This script creates all necessary tables, policies, and empty structure for the admin dashboard

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Drop existing tables if they exist (in correct order due to foreign keys)
DROP TABLE IF EXISTS site_configuration CASCADE;
DROP TABLE IF EXISTS user_activities CASCADE;
DROP TABLE IF EXISTS internship_applications CASCADE;
DROP TABLE IF EXISTS donations CASCADE;
DROP TABLE IF EXISTS user_progress CASCADE;
DROP TABLE IF EXISTS videos CASCADE;
DROP TABLE IF EXISTS internships CASCADE;
DROP TABLE IF EXISTS applications CASCADE;
DROP TABLE IF EXISTS profiles CASCADE;

-- Create profiles table
CREATE TABLE profiles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email TEXT UNIQUE NOT NULL,
    full_name TEXT,
    avatar_url TEXT,
    role TEXT DEFAULT 'student' CHECK (role IN ('student', 'teacher', 'admin')),
    email_verified BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create applications table
CREATE TABLE applications (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    description TEXT,
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create internships table
CREATE TABLE internships (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title TEXT NOT NULL,
    description TEXT,
    requirements TEXT,
    duration TEXT,
    location TEXT,
    salary_range TEXT,
    status TEXT DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'draft')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create videos table
CREATE TABLE videos (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title TEXT NOT NULL,
    description TEXT,
    url TEXT NOT NULL,
    thumbnail_url TEXT,
    duration INTEGER,
    category TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create user_progress table
CREATE TABLE user_progress (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    video_id UUID REFERENCES videos(id) ON DELETE CASCADE,
    progress_percentage INTEGER DEFAULT 0,
    completed BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create donations table
CREATE TABLE donations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    amount DECIMAL(10,2) NOT NULL,
    currency TEXT DEFAULT 'USD',
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'completed', 'failed')),
    payment_method TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create internship_applications table
CREATE TABLE internship_applications (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    internship_id UUID REFERENCES internships(id) ON DELETE CASCADE,
    cover_letter TEXT,
    resume_url TEXT,
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
    applied_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create user_activities table
CREATE TABLE user_activities (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    activity_type TEXT NOT NULL,
    description TEXT,
    metadata JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create site_configuration table
CREATE TABLE site_configuration (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    key TEXT UNIQUE NOT NULL,
    value TEXT,
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX idx_profiles_email ON profiles(email);
CREATE INDEX idx_profiles_role ON profiles(role);
CREATE INDEX idx_profiles_created_at ON profiles(created_at);
CREATE INDEX idx_applications_user_id ON applications(user_id);
CREATE INDEX idx_applications_status ON applications(status);
CREATE INDEX idx_internships_status ON internships(status);
CREATE INDEX idx_internships_created_at ON internships(created_at);
CREATE INDEX idx_videos_category ON videos(category);
CREATE INDEX idx_user_progress_user_id ON user_progress(user_id);
CREATE INDEX idx_donations_user_id ON donations(user_id);
CREATE INDEX idx_donations_status ON donations(status);
CREATE INDEX idx_donations_created_at ON donations(created_at);
CREATE INDEX idx_internship_applications_user_id ON internship_applications(user_id);
CREATE INDEX idx_internship_applications_internship_id ON internship_applications(internship_id);
CREATE INDEX idx_internship_applications_status ON internship_applications(status);
CREATE INDEX idx_user_activities_user_id ON user_activities(user_id);
CREATE INDEX idx_user_activities_created_at ON user_activities(created_at);
CREATE INDEX idx_site_configuration_key ON site_configuration(key);

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for updated_at
CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON profiles FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_applications_updated_at BEFORE UPDATE ON applications FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_internships_updated_at BEFORE UPDATE ON internships FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_videos_updated_at BEFORE UPDATE ON videos FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_user_progress_updated_at BEFORE UPDATE ON user_progress FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_donations_updated_at BEFORE UPDATE ON donations FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_internship_applications_updated_at BEFORE UPDATE ON internship_applications FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_site_configuration_updated_at BEFORE UPDATE ON site_configuration FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Enable Row Level Security (RLS)
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE applications ENABLE ROW LEVEL SECURITY;
ALTER TABLE internships ENABLE ROW LEVEL SECURITY;
ALTER TABLE videos ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE donations ENABLE ROW LEVEL SECURITY;
ALTER TABLE internship_applications ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_activities ENABLE ROW LEVEL SECURITY;
ALTER TABLE site_configuration ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for profiles
CREATE POLICY "Users can view their own profile" ON profiles
    FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile" ON profiles
    FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Admins can view all profiles" ON profiles
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM profiles 
            WHERE id = auth.uid() AND role = 'admin'
        )
    );

-- Create RLS policies for applications
CREATE POLICY "Users can view their own applications" ON applications
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create applications" ON applications
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Admins can view all applications" ON applications
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM profiles 
            WHERE id = auth.uid() AND role = 'admin'
        )
    );

-- Create RLS policies for internships
CREATE POLICY "Anyone can view active internships" ON internships
    FOR SELECT USING (status = 'active');

CREATE POLICY "Admins can manage all internships" ON internships
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM profiles 
            WHERE id = auth.uid() AND role = 'admin'
        )
    );

-- Create RLS policies for videos
CREATE POLICY "Anyone can view videos" ON videos
    FOR SELECT USING (true);

CREATE POLICY "Admins can manage videos" ON videos
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM profiles 
            WHERE id = auth.uid() AND role = 'admin'
        )
    );

-- Create RLS policies for user_progress
CREATE POLICY "Users can view their own progress" ON user_progress
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own progress" ON user_progress
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own progress" ON user_progress
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Admins can view all progress" ON user_progress
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM profiles 
            WHERE id = auth.uid() AND role = 'admin'
        )
    );

-- Create RLS policies for donations
CREATE POLICY "Users can view their own donations" ON donations
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create donations" ON donations
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Admins can view all donations" ON donations
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM profiles 
            WHERE id = auth.uid() AND role = 'admin'
        )
    );

-- Create RLS policies for internship_applications
CREATE POLICY "Users can view their own applications" ON internship_applications
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create applications" ON internship_applications
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Admins can view all applications" ON internship_applications
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM profiles 
            WHERE id = auth.uid() AND role = 'admin'
        )
    );

-- Create RLS policies for user_activities
CREATE POLICY "Users can view their own activities" ON user_activities
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "System can insert activities" ON user_activities
    FOR INSERT WITH CHECK (true);

CREATE POLICY "Admins can view all activities" ON user_activities
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM profiles 
            WHERE id = auth.uid() AND role = 'admin'
        )
    );

-- Create RLS policies for site_configuration
CREATE POLICY "Admins can manage site configuration" ON site_configuration
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM profiles 
            WHERE id = auth.uid() AND role = 'admin'
        )
    );

-- Create views for admin dashboard analytics
CREATE OR REPLACE VIEW admin_dashboard_stats AS
SELECT 
    (SELECT COUNT(*) FROM profiles) as total_users,
    (SELECT COUNT(*) FROM profiles WHERE role = 'student') as total_students,
    (SELECT COUNT(*) FROM profiles WHERE role = 'teacher') as total_teachers,
    (SELECT COUNT(*) FROM profiles WHERE role = 'admin') as total_admins,
    (SELECT COUNT(*) FROM profiles WHERE email_verified = true) as verified_users,
    (SELECT COUNT(*) FROM internships WHERE status = 'active') as active_internships,
    (SELECT COUNT(*) FROM internship_applications WHERE status = 'pending') as pending_applications,
    (SELECT COUNT(*) FROM internship_applications WHERE status = 'approved') as approved_applications,
    (SELECT COUNT(*) FROM donations WHERE status = 'completed') as completed_donations,
    (SELECT COALESCE(SUM(amount), 0) FROM donations WHERE status = 'completed') as total_revenue,
    (SELECT COUNT(*) FROM videos) as total_videos,
    (SELECT COUNT(*) FROM user_progress WHERE completed = true) as completed_videos;

-- Create view for user growth analytics
CREATE OR REPLACE VIEW user_growth_analytics AS
SELECT 
    DATE_TRUNC('month', created_at) as month,
    COUNT(*) as new_users,
    COUNT(CASE WHEN role = 'student' THEN 1 END) as new_students,
    COUNT(CASE WHEN role = 'teacher' THEN 1 END) as new_teachers,
    COUNT(CASE WHEN role = 'admin' THEN 1 END) as new_admins
FROM profiles 
WHERE created_at >= NOW() - INTERVAL '12 months'
GROUP BY DATE_TRUNC('month', created_at)
ORDER BY month;

-- Create view for revenue analytics
CREATE OR REPLACE VIEW revenue_analytics AS
SELECT 
    DATE_TRUNC('month', created_at) as month,
    COUNT(*) as total_donations,
    COUNT(CASE WHEN status = 'completed' THEN 1 END) as completed_donations,
    COALESCE(SUM(CASE WHEN status = 'completed' THEN amount ELSE 0 END), 0) as monthly_revenue,
    COALESCE(AVG(CASE WHEN status = 'completed' THEN amount END), 0) as average_donation
FROM donations 
WHERE created_at >= NOW() - INTERVAL '12 months'
GROUP BY DATE_TRUNC('month', created_at)
ORDER BY month;

-- Grant necessary permissions
GRANT ALL ON ALL TABLES IN SCHEMA public TO authenticated;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO authenticated;
GRANT ALL ON ALL FUNCTIONS IN SCHEMA public TO authenticated;

-- Grant permissions for views
GRANT SELECT ON admin_dashboard_stats TO authenticated;
GRANT SELECT ON user_growth_analytics TO authenticated;
GRANT SELECT ON revenue_analytics TO authenticated;

-- Verify setup
SELECT 'Setup completed successfully! All tables created with empty structure.' as status;

-- Show table counts for verification (should all be 0)
SELECT 
    'profiles' as table_name, COUNT(*) as record_count FROM profiles
UNION ALL
SELECT 'internships', COUNT(*) FROM internships
UNION ALL
SELECT 'videos', COUNT(*) FROM videos
UNION ALL
SELECT 'donations', COUNT(*) FROM donations
UNION ALL
SELECT 'internship_applications', COUNT(*) FROM internship_applications
UNION ALL
SELECT 'applications', COUNT(*) FROM applications
UNION ALL
SELECT 'user_progress', COUNT(*) FROM user_progress
UNION ALL
SELECT 'user_activities', COUNT(*) FROM user_activities
UNION ALL
SELECT 'site_configuration', COUNT(*) FROM site_configuration;

-- Show admin dashboard stats (should all be 0)
SELECT * FROM admin_dashboard_stats; 