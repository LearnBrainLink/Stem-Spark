# 🎥 Video Creation Fix Guide

## 🔍 Issue Diagnosis
The video creation is failing because of a **database schema column mismatch**. The code expects a `video_url` column but your database table has a `url` column instead. This needs to be fixed in your Supabase database.

## ✅ Quick Fix (2 minutes)

### Step 1: Fix Database Schema
1. Go to your [Supabase Dashboard](https://app.supabase.com)
2. Select your project
3. Go to **SQL Editor**
4. Copy and run this SQL script:

```sql
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

        -- Enable RLS and create policies
        ALTER TABLE public.videos ENABLE ROW LEVEL SECURITY;
        CREATE POLICY "videos_select_policy" ON public.videos FOR SELECT TO authenticated USING (true);
        CREATE POLICY "videos_insert_policy" ON public.videos FOR INSERT TO authenticated WITH CHECK (true);
        CREATE POLICY "videos_update_policy" ON public.videos FOR UPDATE TO authenticated USING (true);
        CREATE POLICY "videos_delete_policy" ON public.videos FOR DELETE TO authenticated USING (true);

        RAISE NOTICE 'Videos table created successfully with video_url column.';
        
    ELSE
        -- Check if url column exists instead of video_url
        IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'videos' AND column_name = 'url' AND table_schema = 'public') THEN
            RAISE NOTICE 'Found url column instead of video_url. Renaming column...';
            ALTER TABLE public.videos RENAME COLUMN url TO video_url;
            RAISE NOTICE 'Successfully renamed url column to video_url.';
        END IF;
        
        -- Ensure required columns exist
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'videos' AND column_name = 'video_url' AND table_schema = 'public') THEN
            ALTER TABLE public.videos ADD COLUMN video_url TEXT NOT NULL DEFAULT '';
        END IF;
        
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'videos' AND column_name = 'category' AND table_schema = 'public') THEN
            ALTER TABLE public.videos ADD COLUMN category TEXT DEFAULT 'general';
        END IF;
        
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'videos' AND column_name = 'status' AND table_schema = 'public') THEN
            ALTER TABLE public.videos ADD COLUMN status TEXT DEFAULT 'active';
        END IF;
        
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'videos' AND column_name = 'duration' AND table_schema = 'public') THEN
            ALTER TABLE public.videos ADD COLUMN duration INTEGER DEFAULT 0;
        END IF;
    END IF;

    -- Ensure RLS policies exist
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'videos' AND policyname = 'videos_insert_policy') THEN
        CREATE POLICY "videos_insert_policy" ON public.videos FOR INSERT TO authenticated WITH CHECK (true);
    END IF;

    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'videos' AND policyname = 'videos_update_policy') THEN
        CREATE POLICY "videos_update_policy" ON public.videos FOR UPDATE TO authenticated USING (true);
    END IF;

    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'videos' AND policyname = 'videos_delete_policy') THEN
        CREATE POLICY "videos_delete_policy" ON public.videos FOR DELETE TO authenticated USING (true);
    END IF;

    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'videos' AND policyname = 'videos_select_policy') THEN
        CREATE POLICY "videos_select_policy" ON public.videos FOR SELECT TO authenticated USING (true);
    END IF;

    RAISE NOTICE 'Video table schema fix completed successfully!';
END $$;
```

### Step 2: Test Video Creation
1. Go to Admin → Videos
2. Try creating a video - it should work immediately!

## 🧪 Testing & Debugging

### Browser Console Test
1. Go to your admin videos page
2. Open browser console (F12)
3. Paste and run the contents of `browser-video-test.js`
4. Check the detailed error output

### Environment Check
Run this command to verify your configuration:
```bash
node check-env.js
```

## 🔧 Common Issues & Solutions

### Issue: "Missing Supabase environment variables"
**Solution:** Follow Step 1-3 above to create `.env.local` file

### Issue: "Database permission error" or "policy" error
**Solution:** Run the SQL in Step 5

### Issue: "Table does not exist" error
**Solution:** Your videos table doesn't exist. Create it with:
```sql
CREATE TABLE public.videos (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  title text NOT NULL,
  description text,
  video_url text NOT NULL,
  duration integer DEFAULT 0,
  category text DEFAULT 'general',
  status text DEFAULT 'active',
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.videos ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "videos_select_policy" ON public.videos FOR SELECT TO authenticated USING (true);
CREATE POLICY "videos_insert_policy" ON public.videos FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "videos_update_policy" ON public.videos FOR UPDATE TO authenticated USING (true);
CREATE POLICY "videos_delete_policy" ON public.videos FOR DELETE TO authenticated USING (true);
```

### Issue: Still not working
1. Check browser console for errors
2. Check terminal/server console for errors
3. Verify you're logged in as an admin user
4. Try refreshing the page and clearing browser cache

## 📁 File Structure
Your project should have:
```
your-project/
├── .env.local          ← CREATE THIS FILE (Step 2)
├── package.json
├── app/
├── components/
└── ...
```

## 🚨 Security Note
- Never commit `.env.local` to git (it should be in `.gitignore`)
- Never share your service role key publicly
- Use environment variables for production deployment

## ✅ Success Indicators
When everything is working correctly:
1. ✅ Environment check shows all variables are set
2. ✅ Video creation form submits without errors
3. ✅ New videos appear in the videos list
4. ✅ Browser console shows no errors

## 📞 Need Help?
If you're still having issues:
1. Check the browser console for specific error messages
2. Run the browser test script for detailed diagnostics
3. Verify your Supabase project is active and accessible 