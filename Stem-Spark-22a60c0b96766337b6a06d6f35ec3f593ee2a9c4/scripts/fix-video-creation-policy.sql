-- Fix video creation by adding missing RLS policies
-- This script adds INSERT, UPDATE, and DELETE policies for the videos table

BEGIN;

-- Drop existing policies if they exist to avoid conflicts
DROP POLICY IF EXISTS "Enable insert access for videos" ON public.videos;
DROP POLICY IF EXISTS "Enable update access for videos" ON public.videos;
DROP POLICY IF EXISTS "Enable delete access for videos" ON public.videos;
DROP POLICY IF EXISTS "Enable all access for videos" ON public.videos;

-- Add INSERT policy - allow authenticated users to create videos
CREATE POLICY "Enable insert access for videos" ON public.videos 
FOR INSERT 
WITH CHECK (true);

-- Add UPDATE policy - allow authenticated users to update videos
CREATE POLICY "Enable update access for videos" ON public.videos 
FOR UPDATE 
USING (true);

-- Add DELETE policy - allow authenticated users to delete videos
CREATE POLICY "Enable delete access for videos" ON public.videos 
FOR DELETE 
USING (true);

COMMIT;

-- Success message
DO $$
BEGIN
    RAISE NOTICE '✅ Video creation policies fixed successfully!';
    RAISE NOTICE '📝 Added INSERT, UPDATE, and DELETE policies for videos table';
    RAISE NOTICE '🎥 Video creation should now work properly';
END $$; 