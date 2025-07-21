# Vercel Environment Variables Setup

To fix the database connection issues in your Vercel deployment, you need to add your Supabase environment variables to Vercel.

## Steps to Add Environment Variables in Vercel:

1. **Go to your Vercel Dashboard**
   - Visit [vercel.com](https://vercel.com)
   - Sign in and navigate to your project

2. **Access Project Settings**
   - Click on your project
   - Go to the "Settings" tab
   - Click on "Environment Variables" in the left sidebar

3. **Add the following environment variables:**

   ```
   NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
   SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key
   ```

4. **Environment Selection:**
   - Select "Production" for all variables
   - Select "Preview" if you want them in preview deployments
   - Select "Development" if you want them in development deployments

5. **Redeploy:**
   - After adding the variables, trigger a new deployment
   - Go to "Deployments" tab and click "Redeploy" on your latest deployment

## Supabase RLS Policy Fix:

If you're still getting connection errors, you may need to fix your Supabase RLS (Row Level Security) policies:

1. **Go to your Supabase Dashboard**
2. **Navigate to Authentication > Policies**
3. **For each table (profiles, internships, etc.), either:**
   - **Option A:** Temporarily disable RLS for testing
   - **Option B:** Create simple policies that allow authenticated access

### Example RLS Policy for profiles table:
```sql
-- Allow authenticated users to read all profiles
CREATE POLICY "Allow authenticated read access" ON profiles
FOR SELECT USING (auth.role() = 'authenticated');

-- Allow users to update their own profile
CREATE POLICY "Allow users to update own profile" ON profiles
FOR UPDATE USING (auth.uid() = id);
```

## Testing the Connection:

After setting up the environment variables and fixing RLS policies:

1. **Redeploy your Vercel app**
2. **Visit your admin dashboard**
3. **Check the browser console for connection logs**
4. **You should see "✅ Connected" status instead of "❌ Connection Error"**

## Troubleshooting:

- **If you see "Database connection issue"**: Check that your Supabase tables exist and have data
- **If you see "Connection Error"**: Verify your environment variables are correct
- **If you see RLS policy errors**: Fix the policies in Supabase dashboard

## Local Development:

For local development, make sure you have a `.env.local` file with the same variables:

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key
```

Then run:
```bash
npm run dev
``` 