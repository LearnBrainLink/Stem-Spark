-- Quick fix for video creation issue
-- Run this in your Supabase SQL Editor

-- Check current policies on videos table
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual 
FROM pg_policies 
WHERE tablename = 'videos';

-- Drop existing policies if they exist to avoid conflicts
DROP POLICY IF EXISTS "videos_insert_policy" ON public.videos;
DROP POLICY IF EXISTS "videos_update_policy" ON public.videos;
DROP POLICY IF EXISTS "videos_delete_policy" ON public.videos;

-- Add missing policies for videos table
CREATE POLICY "videos_insert_policy" ON public.videos 
FOR INSERT 
TO authenticated 
WITH CHECK (true);

CREATE POLICY "videos_update_policy" ON public.videos 
FOR UPDATE 
TO authenticated 
USING (true);

CREATE POLICY "videos_delete_policy" ON public.videos 
FOR DELETE 
TO authenticated 
USING (true);

-- Check if policies were created successfully
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual 
FROM pg_policies 
WHERE tablename = 'videos'; 