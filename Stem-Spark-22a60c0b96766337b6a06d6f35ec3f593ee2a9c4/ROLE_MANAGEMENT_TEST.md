# Role Management System Test Guide

## Overview
This guide will help you test the role management system to ensure that parent accounts are properly created and routed to the correct dashboard.

## What Was Fixed

### 1. Sign-Up Page Improvements
- ✅ **Fixed role validation logic** - Now properly validates different requirements for each role
- ✅ **Added parent-specific fields** - Parents can now enter their phone number and children's school
- ✅ **Added teacher-specific fields** - Teachers can enter their school name and phone number
- ✅ **Improved form structure** - Role-specific sections are shown based on selected role
- ✅ **Enhanced profile creation** - Role-specific data is properly saved to the profiles table

### 2. Auth Callback Integration
- ✅ **Integrated Role Manager** - Auth callback now uses the RoleManager class
- ✅ **Proper role determination** - Roles are fetched from the database, not metadata
- ✅ **Correct dashboard routing** - Users are redirected to role-appropriate dashboards

### 3. Parent Dashboard
- ✅ **Created comprehensive parent dashboard** - Full interface for parents to monitor children
- ✅ **Multiple tabs** - Overview, Children, Progress, Resources, Calendar, Communication
- ✅ **Mock data integration** - Shows how real data would be displayed

## Test Scenarios

### Test 1: Parent Account Creation
**Goal**: Verify that parent accounts are created with the correct role

**Steps**:
1. Go to `/sign%20up`
2. Select "Parent" as role
3. Fill in required information:
   - Full Name: "John Parent"
   - Email: "parent@test.com"
   - Password: "password123"
   - Country: "United States"
   - State: "California"
   - Phone Number: "(555) 123-4567"
   - Children's School: "Lincoln Elementary" (optional)
4. Click "Create Your Account"

**Expected Results**:
- ✅ Account creation succeeds
- ✅ Profile is created with `role: "parent"`
- ✅ Phone number is saved to profile
- ✅ Success message appears
- ✅ Email verification is sent

**Database Verification**:
```sql
-- Check profiles table
SELECT id, email, full_name, role, phone, school_name 
FROM profiles 
WHERE email = 'parent@test.com';

-- Expected result:
-- role should be "parent"
-- phone should be "(555) 123-4567"
```

### Test 2: Student Account Creation
**Goal**: Verify that student accounts are created with parent relationship

**Steps**:
1. Go to `/sign%20up`
2. Select "Student" as role
3. Fill in required information:
   - Full Name: "Alex Student"
   - Email: "student@test.com"
   - Password: "password123"
   - Grade: "7th Grade"
   - School Name: "Lincoln Middle School"
   - Country: "United States"
   - State: "California"
   - Parent Name: "John Parent"
   - Parent Email: "parent@test.com"
   - Parent Phone: "(555) 123-4567"
   - Relationship: "Father"
4. Click "Create Your Account"

**Expected Results**:
- ✅ Account creation succeeds
- ✅ Profile is created with `role: "student"`
- ✅ Grade and school are saved
- ✅ Parent relationship is created in `parent_student_relationships` table

**Database Verification**:
```sql
-- Check profiles table
SELECT id, email, full_name, role, grade, school_name 
FROM profiles 
WHERE email = 'student@test.com';

-- Check parent relationships
SELECT * FROM parent_student_relationships 
WHERE parent_email = 'parent@test.com';

-- Expected results:
-- Student role should be "student"
-- Grade should be 7
-- Parent relationship should exist
```

### Test 3: Teacher Account Creation
**Goal**: Verify that teacher accounts are created correctly

**Steps**:
1. Go to `/sign%20up`
2. Select "Teacher" as role
3. Fill in required information:
   - Full Name: "Sarah Teacher"
   - Email: "teacher@test.com"
   - Password: "password123"
   - School Name: "Lincoln High School"
   - Phone Number: "(555) 987-6543"
   - Country: "United States"
   - State: "California"
4. Click "Create Your Account"

**Expected Results**:
- ✅ Account creation succeeds
- ✅ Profile is created with `role: "teacher"`
- ✅ School name and phone are saved

**Database Verification**:
```sql
-- Check profiles table
SELECT id, email, full_name, role, school_name, phone 
FROM profiles 
WHERE email = 'teacher@test.com';

-- Expected result:
-- role should be "teacher"
-- school_name should be "Lincoln High School"
-- phone should be "(555) 987-6543"
```

### Test 4: Email Verification and Dashboard Routing
**Goal**: Verify that users are redirected to correct dashboards after email verification

**Steps**:
1. Create accounts for each role (parent, student, teacher)
2. Check email and click verification links
3. Observe redirect behavior

**Expected Results**:
- ✅ **Parent accounts** → Redirected to `/parent-dashboard`
- ✅ **Student accounts** → Redirected to `/student-dashboard`
- ✅ **Teacher accounts** → Redirected to `/teacher-dashboard`
- ✅ **Admin accounts** → Redirected to `/admin`

**Console Logs to Check**:
```
✅ User authenticated: parent@test.com
🎯 User role determined: parent
📍 Redirecting to: /parent-dashboard
```

### Test 5: Role Manager Integration
**Goal**: Verify that the RoleManager class is working properly

**Steps**:
1. Check browser console during sign-up and verification
2. Look for role manager logs

**Expected Console Output**:
```
🔍 Getting role for user [user-id] from database...
✅ Role from database: parent
🎯 User role determined: parent
📍 Redirecting to: /parent-dashboard
```

### Test 6: Form Validation
**Goal**: Verify that role-specific validation works correctly

**Test Cases**:

**Parent Validation**:
- Try to create parent account without phone number → Should show error
- Create parent account with phone number → Should succeed

**Student Validation**:
- Try to create student account without grade → Should show error
- Try to create student account without parent info → Should show error
- Create student account with all required fields → Should succeed

**Teacher Validation**:
- Try to create teacher account without school name → Should show error
- Try to create teacher account without phone → Should show error
- Create teacher account with all required fields → Should succeed

## Common Issues and Solutions

### Issue 1: Parent Account Shows as Student
**Symptoms**: Parent accounts are being saved with `role: "student"`
**Cause**: Form validation or profile creation logic error
**Solution**: Check that the role is being properly passed to the profile creation

### Issue 2: Wrong Dashboard Redirect
**Symptoms**: Users are redirected to wrong dashboard
**Cause**: Role manager not working or incorrect role in database
**Solution**: Check database for correct role, verify role manager logs

### Issue 3: Missing Parent Information Fields
**Symptoms**: Parent sign-up form doesn't show phone number field
**Cause**: Role selection logic not working
**Solution**: Check `selectedRole` state and conditional rendering

### Issue 4: Database Errors
**Symptoms**: "Failed to create profile" error
**Cause**: Database schema issues or missing tables
**Solution**: Run the database setup script to ensure all tables exist

## Database Verification Queries

### Check All User Roles
```sql
SELECT email, full_name, role, created_at 
FROM profiles 
ORDER BY created_at DESC 
LIMIT 10;
```

### Check Parent-Student Relationships
```sql
SELECT 
  psr.student_id,
  p1.full_name as student_name,
  psr.parent_name,
  psr.parent_email,
  psr.relationship
FROM parent_student_relationships psr
JOIN profiles p1 ON psr.student_id = p1.id
ORDER BY psr.created_at DESC;
```

### Check Role Distribution
```sql
SELECT role, COUNT(*) as count 
FROM profiles 
GROUP BY role 
ORDER BY count DESC;
```

## Success Criteria

✅ **Parent accounts are created with `role: "parent"`**
✅ **Parent accounts are redirected to `/parent-dashboard`**
✅ **Parent dashboard displays correctly with all tabs**
✅ **Student accounts require parent information**
✅ **Teacher accounts require school and phone information**
✅ **Role manager logs show correct role determination**
✅ **Database contains correct role assignments**
✅ **Form validation works for all roles**
✅ **Email verification redirects to correct dashboard**

## Next Steps

After successful testing:
1. **Connect to real data** - Replace mock data with actual database queries
2. **Add parent-student linking** - Implement actual parent-child relationship management
3. **Enhance notifications** - Add real-time notifications for parents
4. **Add communication features** - Implement messaging between parents and teachers
5. **Add progress tracking** - Connect to actual student progress data

## Troubleshooting

If tests fail:
1. Check browser console for errors
2. Verify database tables exist and have correct schema
3. Check that environment variables are set correctly
4. Ensure Supabase connection is working
5. Verify that the role manager is being imported correctly

The role management system should now properly handle parent accounts and route them to the correct dashboard! 🎉 