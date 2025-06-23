# 🎥 Video Creation Fix Guide

## 🔍 Issue Diagnosis
The video creation is failing because **Supabase environment variables are missing**. This is preventing the application from connecting to your database.

## ✅ Quick Fix (5 minutes)

### Step 1: Get Your Supabase Configuration
1. Go to your [Supabase Dashboard](https://app.supabase.com)
2. Select your project
3. Go to **Settings** → **API**
4. Copy these three values:
   - **Project URL** (looks like: `https://abcdefgh.supabase.co`)
   - **anon public** key (starts with `eyJhbGciOiJIUzI1NiIs...`)
   - **service_role** key (starts with `eyJhbGciOiJIUzI1NiIs...`)

### Step 2: Create Environment File
1. In your project root folder, create a file named `.env.local`
2. Add this content (replace with your actual values):

```bash
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key_here
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key_here
```

### Step 3: Restart Your Development Server
```bash
# Stop your current server (Ctrl+C)
# Then restart:
npm run dev
# or
pnpm dev
```

### Step 4: Test Video Creation
1. Go to Admin → Videos
2. Try creating a video
3. If it still fails, continue to Step 5

### Step 5: Fix Database Permissions (If Needed)
If you get a "policy" or "permission" error, run this SQL in your **Supabase Dashboard → SQL Editor**:

```sql
-- Fix video creation permissions
DROP POLICY IF EXISTS "videos_insert_policy" ON public.videos;
DROP POLICY IF EXISTS "videos_update_policy" ON public.videos;
DROP POLICY IF EXISTS "videos_delete_policy" ON public.videos;

CREATE POLICY "videos_insert_policy" ON public.videos 
FOR INSERT TO authenticated WITH CHECK (true);

CREATE POLICY "videos_update_policy" ON public.videos 
FOR UPDATE TO authenticated USING (true);

CREATE POLICY "videos_delete_policy" ON public.videos 
FOR DELETE TO authenticated USING (true);
```

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