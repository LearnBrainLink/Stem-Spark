-- Enable Row Level Security for chat_messages
ALTER TABLE public.chat_messages ENABLE ROW LEVEL SECURITY;

-- Drop existing policies to avoid conflicts
DROP POLICY IF EXISTS "Enable all access for authenticated users" ON public.chat_messages;
DROP POLICY IF EXISTS "Enable insert for authenticated users" ON public.chat_messages;

-- Create a new policy that allows authenticated users to insert messages
-- and select messages from channels they are members of.
CREATE POLICY "Enable insert and select for channel members"
ON public.chat_messages
FOR ALL
TO authenticated
USING (
  (auth.uid() IN ( SELECT user_id FROM chat_channel_members WHERE channel_id = chat_messages.channel_id ))
)
WITH CHECK (
  (auth.uid() IN ( SELECT user_id FROM chat_channel_members WHERE channel_id = chat_messages.channel_id ))
);

-- Grant all permissions to the authenticated role
GRANT ALL ON TABLE public.chat_messages TO authenticated;

-- Grant all permissions to the service_role for administrative tasks
GRANT ALL ON TABLE public.chat_messages TO service_role; 