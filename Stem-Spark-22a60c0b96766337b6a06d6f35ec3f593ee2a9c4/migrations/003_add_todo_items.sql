-- Create todo_items table
CREATE TABLE IF NOT EXISTS todo_items (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  content TEXT NOT NULL,
  completed BOOLEAN DEFAULT FALSE,
  priority TEXT CHECK (priority IN ('low', 'medium', 'high')) DEFAULT 'medium',
  due_date DATE,
  channel_id UUID REFERENCES chat_channels(id) ON DELETE CASCADE,
  created_by UUID REFERENCES profiles(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create index for better performance
CREATE INDEX IF NOT EXISTS idx_todo_items_channel_id ON todo_items(channel_id);
CREATE INDEX IF NOT EXISTS idx_todo_items_created_by ON todo_items(created_by);

-- Enable RLS
ALTER TABLE todo_items ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "Users can view todo items in channels they are members of" ON todo_items
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM chat_channel_members 
      WHERE channel_id = todo_items.channel_id 
      AND user_id = auth.uid()
    )
  );

CREATE POLICY "Users can create todo items in channels they are members of" ON todo_items
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM chat_channel_members 
      WHERE channel_id = todo_items.channel_id 
      AND user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update their own todo items" ON todo_items
  FOR UPDATE USING (
    created_by = auth.uid()
  );

CREATE POLICY "Users can delete their own todo items" ON todo_items
  FOR DELETE USING (
    created_by = auth.uid()
  );

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_todo_items_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to automatically update updated_at
CREATE TRIGGER update_todo_items_updated_at
  BEFORE UPDATE ON todo_items
  FOR EACH ROW
  EXECUTE FUNCTION update_todo_items_updated_at(); 