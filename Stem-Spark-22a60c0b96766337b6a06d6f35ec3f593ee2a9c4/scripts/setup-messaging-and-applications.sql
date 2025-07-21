-- Setup Messaging System and Intern Applications
-- This script creates the necessary tables for the communication hub and intern applications

-- Create intern_applications table
CREATE TABLE IF NOT EXISTS intern_applications (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    full_name TEXT NOT NULL,
    email TEXT NOT NULL,
    phone TEXT,
    grade INTEGER NOT NULL,
    school TEXT NOT NULL,
    bio TEXT NOT NULL,
    specialties TEXT[] DEFAULT '{}',
    experience TEXT,
    motivation TEXT NOT NULL,
    availability TEXT NOT NULL,
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create channels table for messaging
CREATE TABLE IF NOT EXISTS channels (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name TEXT NOT NULL UNIQUE,
    description TEXT,
    type TEXT NOT NULL CHECK (type IN ('general', 'parent_teacher', 'announcements', 'admin_only')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create messages table
CREATE TABLE IF NOT EXISTS messages (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    content TEXT NOT NULL,
    sender_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    channel_id UUID REFERENCES channels(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Insert default channels
INSERT INTO channels (name, description, type) VALUES
    ('General', 'General discussion for all users', 'general'),
    ('Parent-Teacher', 'Communication between parents and teachers', 'parent_teacher'),
    ('Announcements', 'Important announcements from administrators', 'announcements'),
    ('Admin Only', 'Administrative discussions', 'admin_only')
ON CONFLICT (name) DO NOTHING;

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_intern_applications_status ON intern_applications(status);
CREATE INDEX IF NOT EXISTS idx_intern_applications_created_at ON intern_applications(created_at);
CREATE INDEX IF NOT EXISTS idx_messages_channel_id ON messages(channel_id);
CREATE INDEX IF NOT EXISTS idx_messages_created_at ON messages(created_at);
CREATE INDEX IF NOT EXISTS idx_messages_sender_id ON messages(sender_id);

-- Enable Row Level Security
ALTER TABLE intern_applications ENABLE ROW LEVEL SECURITY;
ALTER TABLE channels ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;

-- RLS Policies for intern_applications
-- Anyone can insert (submit applications)
CREATE POLICY "Anyone can submit applications" ON intern_applications
    FOR INSERT WITH CHECK (true);

-- Only admins can view all applications
CREATE POLICY "Admins can view all applications" ON intern_applications
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM profiles 
            WHERE profiles.id = auth.uid() 
            AND profiles.role = 'admin'
        )
    );

-- Only admins can update applications
CREATE POLICY "Admins can update applications" ON intern_applications
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM profiles 
            WHERE profiles.id = auth.uid() 
            AND profiles.role = 'admin'
        )
    );

-- RLS Policies for channels
-- Everyone can view channels
CREATE POLICY "Everyone can view channels" ON channels
    FOR SELECT USING (true);

-- Only admins can insert/update/delete channels
CREATE POLICY "Admins can manage channels" ON channels
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM profiles 
            WHERE profiles.id = auth.uid() 
            AND profiles.role = 'admin'
        )
    );

-- RLS Policies for messages
-- Everyone can view messages in channels they have access to
CREATE POLICY "Users can view messages" ON messages
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM channels 
            WHERE channels.id = messages.channel_id
            AND (
                channels.type = 'general' OR
                channels.type = 'parent_teacher' OR
                (channels.type = 'announcements' AND EXISTS (
                    SELECT 1 FROM profiles 
                    WHERE profiles.id = auth.uid() 
                    AND profiles.role = 'admin'
                )) OR
                (channels.type = 'admin_only' AND EXISTS (
                    SELECT 1 FROM profiles 
                    WHERE profiles.id = auth.uid() 
                    AND profiles.role = 'admin'
                ))
            )
        )
    );

-- Users can insert messages based on channel permissions
CREATE POLICY "Users can send messages" ON messages
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM channels 
            WHERE channels.id = messages.channel_id
            AND (
                channels.type = 'general' OR
                channels.type = 'parent_teacher' OR
                (channels.type = 'announcements' AND EXISTS (
                    SELECT 1 FROM profiles 
                    WHERE profiles.id = auth.uid() 
                    AND profiles.role = 'admin'
                )) OR
                (channels.type = 'admin_only' AND EXISTS (
                    SELECT 1 FROM profiles 
                    WHERE profiles.id = auth.uid() 
                    AND profiles.role = 'admin'
                ))
            )
        )
    );

-- Users can update their own messages
CREATE POLICY "Users can update own messages" ON messages
    FOR UPDATE USING (sender_id = auth.uid());

-- Users can delete their own messages
CREATE POLICY "Users can delete own messages" ON messages
    FOR DELETE USING (sender_id = auth.uid());

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger for intern_applications
CREATE TRIGGER update_intern_applications_updated_at 
    BEFORE UPDATE ON intern_applications 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

-- Grant necessary permissions
GRANT ALL ON intern_applications TO authenticated;
GRANT ALL ON channels TO authenticated;
GRANT ALL ON messages TO authenticated;

-- Grant usage on sequences
GRANT USAGE ON ALL SEQUENCES IN SCHEMA public TO authenticated;

-- Insert some sample data for testing
INSERT INTO intern_applications (full_name, email, phone, grade, school, bio, specialties, experience, motivation, availability) VALUES
    ('John Smith', 'john.smith@email.com', '(555) 123-4567', 11, 'Lincoln High School', 'I am passionate about computer science and robotics.', ARRAY['Computer Science', 'Robotics'], 'I have experience with Python and Arduino projects.', 'I want to gain real-world experience and contribute to innovative projects.', 'Available after school and weekends'),
    ('Sarah Johnson', 'sarah.johnson@email.com', '(555) 234-5678', 12, 'Washington High School', 'I love mathematics and physics.', ARRAY['Mathematics', 'Physics'], 'I have participated in math competitions.', 'I want to explore STEM careers and develop my skills.', 'Available during summer break and weekends')
ON CONFLICT DO NOTHING;

-- Create a view for admin dashboard stats
CREATE OR REPLACE VIEW admin_dashboard_stats AS
SELECT 
    (SELECT COUNT(*) FROM profiles) as total_users,
    (SELECT COUNT(*) FROM intern_applications) as total_applications,
    (SELECT COUNT(*) FROM intern_applications WHERE status = 'pending') as pending_applications,
    (SELECT COUNT(*) FROM messages) as total_messages,
    (SELECT COUNT(*) FROM channels) as total_channels;

-- Grant access to the view
GRANT SELECT ON admin_dashboard_stats TO authenticated;

COMMENT ON TABLE intern_applications IS 'Stores intern applications submitted by students';
COMMENT ON TABLE channels IS 'Stores messaging channels for the communication hub';
COMMENT ON TABLE messages IS 'Stores messages sent in channels';
COMMENT ON VIEW admin_dashboard_stats IS 'Provides statistics for the admin dashboard'; 