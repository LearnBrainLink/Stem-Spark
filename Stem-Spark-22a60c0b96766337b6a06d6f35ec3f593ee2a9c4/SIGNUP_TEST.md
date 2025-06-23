# Sign Up Functionality Test Guide

## ✅ What's Been Fixed

### 1. **Role Selection**
- Fixed role selection to properly save the selected role
- Added validation to ensure role is selected before submission
- Role is now correctly stored in the `profiles` table

### 2. **Form Data Handling**
- Removed dependency on complex FormData handling
- Direct form state management for better reliability
- All form fields are properly validated before submission

### 3. **Database Integration**
- Direct Supabase client integration for immediate feedback
- Proper error handling and user feedback
- Role is saved directly to the `profiles` table

### 4. **Email Verification**
- Simplified auth callback for email verification
- Users are redirected to appropriate dashboard based on role
- Email verification status is updated in the database

## 🧪 How to Test

### Step 1: Test Student Sign Up
1. Go to `/sign%20up`
2. Select "Student" as role
3. Fill in all required fields:
   - Full Name: "Test Student"
   - Email: "student@test.com"
   - Password: "password123"
   - Confirm Password: "password123"
   - Grade Level: "6th Grade"
   - Country: "United States"
   - State: "California"
   - Parent Name: "Test Parent"
   - Parent Email: "parent@test.com"
   - Relationship: "Mother"
4. Click "Create Your Account"
5. Check for success message
6. Verify in Supabase that user was created with role "student"

### Step 2: Test Teacher Sign Up
1. Go to `/sign%20up`
2. Select "Teacher" as role
3. Fill in basic fields:
   - Full Name: "Test Teacher"
   - Email: "teacher@test.com"
   - Password: "password123"
   - Confirm Password: "password123"
4. Click "Create Your Account"
5. Check for success message
6. Verify in Supabase that user was created with role "teacher"

### Step 3: Test Parent Sign Up
1. Go to `/sign%20up`
2. Select "Parent" as role
3. Fill in basic fields:
   - Full Name: "Test Parent"
   - Email: "parent@test.com"
   - Password: "password123"
   - Confirm Password: "password123"
4. Click "Create Your Account"
5. Check for success message
6. Verify in Supabase that user was created with role "parent"

## 🔍 Verification Steps

### Check Database
Run these queries in Supabase SQL Editor:

```sql
-- Check all profiles
SELECT id, email, full_name, role, email_verified, created_at 
FROM profiles 
ORDER BY created_at DESC;

-- Check user activities
SELECT user_id, activity_type, description, created_at 
FROM user_activities 
ORDER BY created_at DESC;
```

### Expected Results
1. **Student**: Should have role="student", grade, country, state, school_name
2. **Teacher**: Should have role="teacher", basic info only
3. **Parent**: Should have role="parent", basic info only
4. **Activities**: Should show "account_created" activity for each user

## 🚨 Common Issues & Solutions

### Issue: "Failed to create profile"
**Solution**: Check that the `profiles` table exists and has the correct structure

### Issue: "Passwords do not match"
**Solution**: Ensure both password fields are identical

### Issue: "Students must provide grade level and parent information"
**Solution**: Fill in all required fields for student registration

### Issue: "Please select your role"
**Solution**: Make sure to select a role from the dropdown

## 📊 Database Schema Verification

Ensure your `profiles` table has these columns:
- `id` (UUID, primary key)
- `email` (TEXT, unique)
- `full_name` (TEXT)
- `role` (TEXT, check constraint for 'student', 'teacher', 'admin', 'parent')
- `grade` (INTEGER, nullable)
- `country` (TEXT, nullable)
- `state` (TEXT, nullable)
- `school_name` (TEXT, nullable)
- `email_verified` (BOOLEAN, default false)
- `created_at` (TIMESTAMP)
- `updated_at` (TIMESTAMP)

## 🎯 Success Criteria

✅ **Sign up works without errors**
✅ **Role is properly saved to database**
✅ **Email verification link is sent**
✅ **User is redirected to appropriate dashboard after verification**
✅ **All form validations work correctly**
✅ **Error messages are clear and helpful**

## 🔧 Troubleshooting

If sign up still doesn't work:

1. **Check Console**: Look for JavaScript errors in browser console
2. **Check Network**: Look for failed API calls in Network tab
3. **Check Supabase Logs**: Look for database errors in Supabase dashboard
4. **Verify Environment Variables**: Ensure Supabase URL and keys are correct
5. **Check RLS Policies**: Ensure profiles table allows inserts for authenticated users

---

**Need Help?** The sign up should now work correctly with proper role saving and no errors! 