-- Fix Video Table Column Schema Issue
-- This script detects and fixes the column name mismatch in the videos table

DO $$
BEGIN
    -- Check if the videos table exists
    IF NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'videos' AND table_schema = 'public') THEN
        RAISE NOTICE 'Videos table does not exist. Creating it now...';
        
        -- Create the videos table with correct schema
        CREATE TABLE public.videos (
            id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
            title TEXT NOT NULL,
            description TEXT,
            video_url TEXT NOT NULL,
            thumbnail_url TEXT,
            duration INTEGER DEFAULT 0,
            category TEXT DEFAULT 'general',
            status TEXT DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'draft')),
            created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
            updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        );

        -- Enable RLS
        ALTER TABLE public.videos ENABLE ROW LEVEL SECURITY;

        -- Create RLS policies
        CREATE POLICY "videos_select_policy" ON public.videos FOR SELECT TO authenticated USING (true);
        CREATE POLICY "videos_insert_policy" ON public.videos FOR INSERT TO authenticated WITH CHECK (true);
        CREATE POLICY "videos_update_policy" ON public.videos FOR UPDATE TO authenticated USING (true);
        CREATE POLICY "videos_delete_policy" ON public.videos FOR DELETE TO authenticated USING (true);

        RAISE NOTICE 'Videos table created successfully with video_url column.';
        
    ELSE
        RAISE NOTICE 'Videos table exists. Checking column structure...';
        
        -- Check if video_url column exists
        IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'videos' AND column_name = 'video_url' AND table_schema = 'public') THEN
            RAISE NOTICE 'Column video_url already exists - no changes needed.';
            
        -- Check if url column exists instead
        ELSIF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'videos' AND column_name = 'url' AND table_schema = 'public') THEN
            RAISE NOTICE 'Found url column instead of video_url. Renaming column...';
            
            -- Rename url column to video_url
            ALTER TABLE public.videos RENAME COLUMN url TO video_url;
            
            RAISE NOTICE 'Successfully renamed url column to video_url.';
            
        ELSE
            RAISE NOTICE 'Neither video_url nor url column found. Adding video_url column...';
            
            -- Add the video_url column
            ALTER TABLE public.videos ADD COLUMN video_url TEXT NOT NULL DEFAULT '';
            
            RAISE NOTICE 'Added video_url column to videos table.';
        END IF;
        
        -- Ensure other required columns exist
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'videos' AND column_name = 'category' AND table_schema = 'public') THEN
            ALTER TABLE public.videos ADD COLUMN category TEXT DEFAULT 'general';
            RAISE NOTICE 'Added category column to videos table.';
        END IF;
        
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'videos' AND column_name = 'status' AND table_schema = 'public') THEN
            ALTER TABLE public.videos ADD COLUMN status TEXT DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'draft'));
            RAISE NOTICE 'Added status column to videos table.';
        END IF;
        
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'videos' AND column_name = 'duration' AND table_schema = 'public') THEN
            ALTER TABLE public.videos ADD COLUMN duration INTEGER DEFAULT 0;
            RAISE NOTICE 'Added duration column to videos table.';
        END IF;
    END IF;

    -- Ensure RLS policies exist
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'videos' AND policyname = 'videos_insert_policy') THEN
        CREATE POLICY "videos_insert_policy" ON public.videos FOR INSERT TO authenticated WITH CHECK (true);
        RAISE NOTICE 'Created videos_insert_policy.';
    END IF;

    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'videos' AND policyname = 'videos_update_policy') THEN
        CREATE POLICY "videos_update_policy" ON public.videos FOR UPDATE TO authenticated USING (true);
        RAISE NOTICE 'Created videos_update_policy.';
    END IF;

    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'videos' AND policyname = 'videos_delete_policy') THEN
        CREATE POLICY "videos_delete_policy" ON public.videos FOR DELETE TO authenticated USING (true);
        RAISE NOTICE 'Created videos_delete_policy.';
    END IF;

    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'videos' AND policyname = 'videos_select_policy') THEN
        CREATE POLICY "videos_select_policy" ON public.videos FOR SELECT TO authenticated USING (true);
        RAISE NOTICE 'Created videos_select_policy.';
    END IF;

    RAISE NOTICE 'Video table schema fix completed successfully!';

END $$;

-- Display final table structure
SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'videos' AND table_schema = 'public'
ORDER BY ordinal_position; 