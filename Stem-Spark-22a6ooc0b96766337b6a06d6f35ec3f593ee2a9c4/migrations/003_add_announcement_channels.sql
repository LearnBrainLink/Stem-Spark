-- Add is_announcement column to chat_channels table
ALTER TABLE chat_channels ADD COLUMN IF NOT EXISTS is_announcement BOOLEAN DEFAULT FALSE;

-- Create an announcement channel for general announcements
INSERT INTO chat_channels (name, description, is_announcement, created_at) 
VALUES ('General Announcements', 'Important announcements for all users', TRUE, NOW())
ON CONFLICT (name) DO NOTHING;

-- Create an announcement channel for system updates
INSERT INTO chat_channels (name, description, is_announcement, created_at) 
VALUES ('System Updates', 'System maintenance and updates', TRUE, NOW())
ON CONFLICT (name) DO NOTHING;

-- Add indexes for better performance
CREATE INDEX IF NOT EXISTS idx_chat_messages_channel_id ON chat_messages(channel_id);
CREATE INDEX IF NOT EXISTS idx_chat_messages_created_at ON chat_messages(created_at);
CREATE INDEX IF NOT EXISTS idx_chat_channel_members_channel_id ON chat_channel_members(channel_id);
CREATE INDEX IF NOT EXISTS idx_chat_channel_members_user_id ON chat_channel_members(user_id);

-- Add RLS policies for chat_channels
ALTER TABLE chat_channels ENABLE ROW LEVEL SECURITY;

-- Allow all authenticated users to read channels
CREATE POLICY "Allow authenticated users to read channels" ON chat_channels
    FOR SELECT USING (auth.role() = 'authenticated');

-- Allow authenticated users to insert channels (for admins)
CREATE POLICY "Allow authenticated users to insert channels" ON chat_channels
    FOR INSERT WITH CHECK (auth.role() = 'authenticated');

-- Allow channel creators to update their channels
CREATE POLICY "Allow channel creators to update channels" ON chat_channels
    FOR UPDATE USING (auth.uid()::text = created_by);

-- Add RLS policies for chat_channel_members
ALTER TABLE chat_channel_members ENABLE ROW LEVEL SECURITY;

-- Allow users to read channel members
CREATE POLICY "Allow users to read channel members" ON chat_channel_members
    FOR SELECT USING (auth.role() = 'authenticated');

-- Allow users to join channels
CREATE POLICY "Allow users to join channels" ON chat_channel_members
    FOR INSERT WITH CHECK (auth.role() = 'authenticated');

-- Allow users to leave channels
CREATE POLICY "Allow users to leave channels" ON chat_channel_members
    FOR DELETE USING (auth.uid()::text = user_id);

-- Add RLS policies for chat_messages
ALTER TABLE chat_messages ENABLE ROW LEVEL SECURITY;

-- Allow users to read messages in channels they're members of
CREATE POLICY "Allow users to read messages" ON chat_messages
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM chat_channel_members 
            WHERE channel_id = chat_messages.channel_id 
            AND user_id = auth.uid()::text
        )
    );

-- Allow users to send messages in channels they're members of
CREATE POLICY "Allow users to send messages" ON chat_messages
    FOR INSERT WITH CHECK (
        auth.uid()::text = sender_id AND
        EXISTS (
            SELECT 1 FROM chat_channel_members 
            WHERE channel_id = chat_messages.channel_id 
            AND user_id = auth.uid()::text
        )
    );

-- Allow message senders to edit their own messages
CREATE POLICY "Allow users to edit their messages" ON chat_messages
    FOR UPDATE USING (auth.uid()::text = sender_id);

-- Allow message senders to delete their own messages
CREATE POLICY "Allow users to delete their messages" ON chat_messages
    FOR DELETE USING (auth.uid()::text = sender_id); 