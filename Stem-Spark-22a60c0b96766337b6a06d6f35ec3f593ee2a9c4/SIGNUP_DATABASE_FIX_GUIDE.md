# Sign-Up Database Error Fix Guide

## 🚨 Problem
You're getting a "Database error saving new user" when trying to sign up.

## 🔧 Solution

### Step 1: Run the Database Fix Script

1. **Open your Supabase Dashboard**
   - Go to your Supabase project
   - Navigate to the SQL Editor

2. **Run the Fix Script**
   - Copy and paste the contents of `scripts/fix-signup-database-error.sql`
   - Click "Run" to execute the script

3. **Check the Output**
   - The script will show detailed progress messages
   - Look for ✅ success messages and ❌ error messages
   - The script will test all database operations

### Step 2: Verify the Fix

After running the script, you should see output like:
```
✅ profiles table exists
✅ Added email column
✅ Added full_name column
✅ Profile insert test successful
✅ Parent relationship insert test successful
✅ User activity insert test successful
🎉 Database fix script completed!
```

### Step 3: Test Sign-Up

1. **Try signing up again** with a new account
2. **Check the browser console** for any error messages
3. **Look for the detailed error message** in the sign-up form

## 🔍 What the Fix Script Does

The script addresses these common issues:

### 1. **Missing Columns**
- Adds any missing columns to the `profiles` table
- Adds missing columns to `parent_student_relationships` table
- Adds missing columns to `user_activities` table

### 2. **Field Name Mismatches**
- Fixes `description` vs `activity_description` field name issues
- Ensures all field names match the database schema

### 3. **RLS Policy Issues**
- Drops conflicting policies
- Creates proper Row Level Security policies
- Ensures users can insert their own profiles

### 4. **Table Structure**
- Creates missing tables if they don't exist
- Ensures proper foreign key relationships
- Adds proper constraints and defaults

## 🐛 If You Still Get Errors

### Check the Specific Error Message

The sign-up page now shows detailed error messages. Look for:

1. **Profile creation error**: Shows the exact database error
2. **Activity logging error**: Shows if user activity logging fails
3. **Parent relationship error**: Shows if parent info creation fails

### Common Error Types and Solutions

| Error Type | Solution |
|------------|----------|
| `column "X" does not exist` | Run the fix script again |
| `policy violation` | Check RLS policies in the fix script |
| `foreign key violation` | Ensure auth.users table exists |
| `constraint violation` | Check data types and constraints |

### Debug Steps

1. **Run the debug script**:
   ```sql
   -- Copy and run scripts/debug-signup-error.sql
   ```

2. **Check table structures**:
   ```sql
   SELECT column_name, data_type, is_nullable 
   FROM information_schema.columns 
   WHERE table_name = 'profiles';
   ```

3. **Test manual insert**:
   ```sql
   INSERT INTO profiles (id, email, full_name, role) 
   VALUES (gen_random_uuid(), 'test@example.com', 'Test User', 'student');
   ```

## 📋 Pre-Fix Checklist

Before running the fix script, ensure:

- ✅ Your Supabase project is active
- ✅ You have admin access to the database
- ✅ The SQL Editor is accessible
- ✅ You can run SQL commands

## 📋 Post-Fix Checklist

After running the fix script, verify:

- ✅ All tables exist (`profiles`, `parent_student_relationships`, `user_activities`)
- ✅ All required columns exist in each table
- ✅ RLS policies are properly configured
- ✅ Test inserts work without errors
- ✅ Sign-up form shows success message

## 🆘 Still Having Issues?

If you're still experiencing problems:

1. **Check the browser console** for JavaScript errors
2. **Check the network tab** for failed API calls
3. **Run the debug script** to identify specific issues
4. **Check Supabase logs** for server-side errors

## 📞 Support

If none of the above solutions work, please provide:
- The exact error message from the sign-up form
- The browser console error messages
- The output from the debug script
- Your Supabase project URL (if public) 