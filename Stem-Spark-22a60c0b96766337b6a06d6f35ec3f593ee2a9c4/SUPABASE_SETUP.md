# Supabase Setup Guide for Admin Dashboard

## Required Environment Variables

Create a `.env.local` file in your project root with the following variables:

```env
# Your Supabase project URL
NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co

# Your Supabase anon/public key
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here

# Your Supabase service role key (for admin operations)
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key-here

# Optional: Site URL for authentication redirects
NEXT_PUBLIC_SITE_URL=http://localhost:3000
```

## Where to Find These Values

1. Go to your [Supabase Dashboard](https://supabase.com/dashboard)
2. Select your project
3. Go to **Settings** → **API**
4. Copy the values:
   - **URL**: This is your `NEXT_PUBLIC_SUPABASE_URL`
   - **anon public**: This is your `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - **service_role**: This is your `SUPABASE_SERVICE_ROLE_KEY`

## Required Database Tables

The admin dashboard expects these tables in your Supabase database:

### 1. profiles
- User information and roles
- Columns: id, email, full_name, role, created_at, etc.

### 2. internships
- Internship programs
- Columns: id, title, description, status, created_at, etc.

### 3. internship_applications
- Student applications for internships
- Columns: id, student_id, internship_id, status, applied_at, etc.

### 4. donations
- Revenue/donation tracking
- Columns: id, amount, status, created_at, etc.

### 5. videos
- Educational video content
- Columns: id, title, description, video_url, created_at, etc.

## Testing Your Connection

After setting up your environment variables, you can test the connection by running:

```bash
node scripts/simple-db-reader.js
```

This will verify that:
- Environment variables are set correctly
- Database connection is working
- All required tables are accessible
- Real data can be fetched for the dashboard

## Next Steps

Once your environment is configured:
1. Restart your development server
2. Visit `/admin` to see real data in the dashboard
3. All admin pages will now display actual data from your Supabase database

## Troubleshooting

### "Missing environment variables" error
- Make sure `.env.local` is in your project root
- Restart your development server after adding the file
- Check that variable names match exactly (including `NEXT_PUBLIC_` prefix)

### "Connection failed" error
- Verify your Supabase URL is correct
- Check that your API keys are valid
- Ensure your Supabase project is active

### "Table doesn't exist" error
- Create the required tables in your Supabase database
- Check table names match exactly (case-sensitive)
- Verify your service role key has proper permissions 