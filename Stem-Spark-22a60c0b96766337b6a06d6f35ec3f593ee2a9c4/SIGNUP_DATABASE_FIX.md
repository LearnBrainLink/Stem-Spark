# Sign-Up Database Fix Guide

## 🚨 Issues Fixed

### 1. **Database Schema Mismatch**
- **Problem**: Sign-up page was trying to use fields that didn't exist in the database
- **Solution**: Updated `setup-database.sql` to include all required fields

### 2. **Missing Tables**
- **Problem**: `parent_student_relationships` table was missing
- **Solution**: Added the table with proper structure and RLS policies

### 3. **Field Name Mismatches**
- **Problem**: Code was using `school_name` but database had `school`
- **Solution**: Fixed field names to match database schema

### 4. **Policy Conflicts**
- **Problem**: Policies already existed causing "policy already exists" errors
- **Solution**: Added `DROP POLICY IF EXISTS` statements before creating policies

## 📋 Database Changes Made

### Profiles Table Updates
```sql
-- Added missing fields
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS country TEXT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS state TEXT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS phone TEXT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS email_verified BOOLEAN DEFAULT FALSE;
```

### New Parent-Student Relationships Table
```sql
CREATE TABLE IF NOT EXISTS parent_student_relationships (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  student_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  parent_name TEXT NOT NULL,
  parent_email TEXT NOT NULL,
  parent_phone TEXT,
  relationship TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

### Fixed Policy Creation
```sql
-- Drop existing policies to avoid conflicts
DROP POLICY IF EXISTS "Users can view own profile" ON profiles;
-- ... (all other policies)

-- Recreate policies
CREATE POLICY "Users can view own profile" ON profiles
  FOR SELECT USING (auth.uid() = id);
-- ... (all other policies)
```

## 🔧 Code Changes Made

### Sign-Up Page Fixes
1. **Fixed field mapping**:
   ```javascript
   // Before
   profileData.school_name = formData.schoolName;
   
   // After
   profileData.school = formData.schoolName;
   ```

2. **Added proper error handling** for parent relationship creation
3. **Ensured all required fields are included** in profile creation

## 🧪 Testing Steps

### 1. Run Database Setup
```bash
# In your Supabase SQL editor, run:
# Copy and paste the entire setup-database.sql file
```

### 2. Verify Database Schema
```bash
# Run the test script to verify everything is set up correctly:
# Copy and paste test-signup-database.sql
```

### 3. Test Sign-Up Functionality

#### Test Case 1: Parent Account
1. Go to `/sign%20up`
2. Select "Parent" role
3. Fill in:
   - Full Name: "Test Parent"
   - Email: "parent@test.com"
   - Password: "password123"
   - Country: "United States"
   - State: "California"
   - Phone: "(555) 123-4567"
4. Click "Create Your Account"

**Expected Result**: ✅ Success message, profile created with `role: "parent"`

#### Test Case 2: Student Account
1. Go to `/sign%20up`
2. Select "Student" role
3. Fill in all required fields including parent information
4. Click "Create Your Account"

**Expected Result**: ✅ Success message, profile created with `role: "student"`, parent relationship created

#### Test Case 3: Teacher Account
1. Go to `/sign%20up`
2. Select "Teacher" role
3. Fill in all required fields
4. Click "Create Your Account"

**Expected Result**: ✅ Success message, profile created with `role: "teacher"`

### 4. Database Verification Queries

#### Check Profiles
```sql
SELECT id, email, full_name, role, grade, school, country, state, phone, email_verified
FROM profiles
ORDER BY created_at DESC
LIMIT 5;
```

#### Check Parent Relationships
```sql
SELECT 
  psr.student_id,
  p.full_name as student_name,
  psr.parent_name,
  psr.parent_email,
  psr.relationship
FROM parent_student_relationships psr
JOIN profiles p ON psr.student_id = p.id
ORDER BY psr.created_at DESC;
```

#### Check User Activities
```sql
SELECT 
  ua.user_id,
  p.full_name,
  ua.activity_type,
  ua.activity_description,
  ua.metadata
FROM user_activities ua
JOIN profiles p ON ua.user_id = p.id
ORDER BY ua.created_at DESC
LIMIT 10;
```

## 🚨 Common Issues and Solutions

### Issue 1: "Policy already exists" Error
**Solution**: The updated `setup-database.sql` now includes `DROP POLICY IF EXISTS` statements

### Issue 2: "Column does not exist" Error
**Solution**: Run the updated `setup-database.sql` to add missing columns

### Issue 3: "Table does not exist" Error
**Solution**: The script now creates all required tables including `parent_student_relationships`

### Issue 4: RLS Blocking Inserts
**Solution**: All necessary RLS policies are now properly configured

## ✅ Success Criteria

After running the fixes:

1. **✅ Database Schema**: All required tables and fields exist
2. **✅ RLS Policies**: All policies are created without conflicts
3. **✅ Sign-Up Flow**: All role types can be created successfully
4. **✅ Profile Creation**: Profiles are saved with correct role and data
5. **✅ Parent Relationships**: Student accounts create parent relationship records
6. **✅ Activity Logging**: User activities are properly logged
7. **✅ Email Verification**: Users receive verification emails
8. **✅ Dashboard Routing**: Users are redirected to correct dashboards

## 🔄 Next Steps

1. **Run the database setup script** in your Supabase project
2. **Test the sign-up functionality** with different roles
3. **Verify email verification** works correctly
4. **Check dashboard routing** for each role type
5. **Monitor for any remaining errors** and address them

## 📞 Support

If you encounter any issues:

1. Check the browser console for JavaScript errors
2. Check the Supabase logs for database errors
3. Run the test script to verify database schema
4. Ensure all environment variables are set correctly

The sign-up functionality should now work correctly for all user types! 🎉 