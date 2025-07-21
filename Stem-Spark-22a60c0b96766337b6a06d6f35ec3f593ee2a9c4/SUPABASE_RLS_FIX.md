# 🔧 Fix Supabase RLS Policy Infinite Recursion

## 🎯 **The Problem**
Your admin dashboard shows "Database tables may not exist or have RLS policy issues" because of an **infinite recursion** in your Supabase RLS (Row Level Security) policies.

## 🚨 **Error Details**
- **Error:** `infinite recursion detected in policy for relation "profiles"`
- **Cause:** RLS policies are referencing themselves or creating circular dependencies
- **Impact:** Cannot read any data from your database tables

## 🔧 **Quick Fix (Recommended)**

### **Option 1: Temporarily Disable RLS (Fastest)**

1. **Go to Supabase Dashboard:**
   - Visit [https://supabase.com/dashboard](https://supabase.com/dashboard)
   - Select your project: `qnuevynptgkoivekuzer`

2. **Disable RLS for each table:**
   - Go to **Table Editor**
   - Click on each table: `profiles`, `internships`, `internship_applications`, `videos`, `donations`
   - Click the **Settings** tab (gear icon)
   - **Toggle OFF** "Enable Row Level Security"
   - Click **Save**

3. **Test the fix:**
   ```bash
   node scripts/simple-db-diagnostic.js
   ```

### **Option 2: Fix RLS Policies (More Secure)**

1. **Go to Supabase Dashboard:**
   - Visit [https://supabase.com/dashboard](https://supabase.com/dashboard)
   - Select your project: `qnuevynptgkoivekuzer`

2. **Remove problematic policies:**
   - Go to **Authentication** → **Policies**
   - For each table, **delete all existing policies**
   - Click the trash icon next to each policy

3. **Create simple, safe policies:**
   - Click **New Policy** for each table
   - Choose **"Create a policy from scratch"**
   - Use these settings:

   **For `profiles` table:**
   - Name: `profiles_select_policy`
   - Target roles: `authenticated`
   - Policy definition: `true`
   - Click **Review** and **Save policy**

   **For `internships` table:**
   - Name: `internships_select_policy`
   - Target roles: `authenticated`
   - Policy definition: `true`
   - Click **Review** and **Save policy**

   **Repeat for:** `internship_applications`, `videos`, `donations`

## 🧪 **Test Your Fix**

After applying either fix, run this command to verify:

```bash
node scripts/simple-db-diagnostic.js
```

You should see:
```
✅ Basic connection successful!
📊 Found X records in profiles table
✅ profiles: X records
✅ internships: X records
✅ internship_applications: X records
✅ videos: X records
✅ donations: X records
🎉 SUCCESS: Database is working perfectly!
```

## 🚀 **Start Your Development Server**

Once the database is working:

```bash
npm run dev
```

Visit your admin dashboard and you should see:
- ✅ **Green "Connected" status**
- 📊 **Real data** instead of sample data
- 🎨 **Smooth animations** working

## 🔍 **If Tables Don't Exist**

If you get "relation does not exist" errors, create the tables:

1. **Go to Table Editor** in Supabase
2. **Create these tables:**

   **profiles:**
   ```sql
   id: uuid (primary key)
   email: text
   full_name: text
   role: text
   created_at: timestamp
   ```

   **internships:**
   ```sql
   id: uuid (primary key)
   title: text
   company: text
   description: text
   created_at: timestamp
   ```

   **internship_applications:**
   ```sql
   id: uuid (primary key)
   user_id: uuid (foreign key to profiles.id)
   internship_id: uuid (foreign key to internships.id)
   status: text
   applied_at: timestamp
   ```

   **videos:**
   ```sql
   id: uuid (primary key)
   title: text
   description: text
   url: text
   created_at: timestamp
   ```

   **donations:**
   ```sql
   id: uuid (primary key)
   amount: numeric
   status: text
   created_at: timestamp
   ```

## 🎯 **Expected Results**

After fixing RLS policies, your admin dashboard will show:
- **Real user counts** from your database
- **Actual internship data**
- **Live application statistics**
- **Real revenue from donations**
- **Interactive charts** with real data

## 📞 **Need Help?**

If you're still having issues:
1. Check the browser console for specific error messages
2. Verify your Supabase project is active and online
3. Ensure your API keys are correct in `.env.local`
4. Try the temporary RLS disable option first

Your admin dashboard is ready - just need to fix this RLS policy issue! 🎉 