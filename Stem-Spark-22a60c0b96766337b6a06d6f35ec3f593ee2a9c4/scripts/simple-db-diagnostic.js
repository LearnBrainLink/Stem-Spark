const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

console.log('🔧 SIMPLE DATABASE DIAGNOSTIC');
console.log('==================================================');

// Try to read .env.local file manually
let envVars = {};
try {
  const envPath = path.join(__dirname, '..', '.env.local');
  if (fs.existsSync(envPath)) {
    const envContent = fs.readFileSync(envPath, 'utf8');
    envContent.split('\n').forEach(line => {
      const [key, ...valueParts] = line.split('=');
      if (key && valueParts.length > 0) {
        envVars[key.trim()] = valueParts.join('=').trim();
      }
    });
    console.log('✅ Found .env.local file');
  } else {
    console.log('⚠️ No .env.local file found');
  }
} catch (err) {
  console.log('⚠️ Could not read .env.local file:', err.message);
}

// Get environment variables
const supabaseUrl = envVars.NEXT_PUBLIC_SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = envVars.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.log('❌ Missing Supabase environment variables!');
  console.log('');
  console.log('🔧 QUICK FIX:');
  console.log('1. Create a .env.local file in your project root with:');
  console.log('   NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co');
  console.log('   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key_here');
  console.log('');
  console.log('2. Get these values from: https://supabase.com/dashboard');
  console.log('   → Your Project → Settings → API');
  console.log('');
  process.exit(1);
}

console.log('✅ Environment variables found');
console.log(`URL: ${supabaseUrl}`);

const supabase = createClient(supabaseUrl, supabaseKey);

async function diagnoseDatabase() {
  console.log('\n🔍 Diagnosing database issues...');
  
  // Test 1: Basic connection
  console.log('\n1️⃣ Testing basic connection...');
  try {
    const { data, error } = await supabase
      .from('profiles')
      .select('count', { count: 'exact', head: true });
    
    if (error) {
      console.log('❌ Connection failed:', error.message);
      
      if (error.message.includes('infinite recursion')) {
        console.log('\n🔧 ISSUE: RLS Policy Infinite Recursion');
        console.log('==================================================');
        console.log('This is a common Supabase RLS policy issue.');
        console.log('');
        console.log('QUICK FIX:');
        console.log('1. Go to https://supabase.com/dashboard');
        console.log('2. Select your project');
        console.log('3. Go to Authentication → Policies');
        console.log('4. For the "profiles" table:');
        console.log('   - Click "New Policy"');
        console.log('   - Choose "Create a policy from scratch"');
        console.log('   - Name: "profiles_select_policy"');
        console.log('   - Target roles: authenticated');
        console.log('   - Policy definition: true');
        console.log('   - Click "Review" and "Save policy"');
        console.log('');
        console.log('5. Repeat for other tables (internships, etc.)');
        console.log('');
        console.log('ALTERNATIVE: Temporarily disable RLS');
        console.log('- Go to Table Editor → profiles → Settings');
        console.log('- Toggle off "Enable Row Level Security"');
        console.log('');
      } else if (error.message.includes('relation') && error.message.includes('does not exist')) {
        console.log('\n🔧 ISSUE: Tables Don\'t Exist');
        console.log('==================================================');
        console.log('The required database tables are missing.');
        console.log('');
        console.log('QUICK FIX:');
        console.log('1. Go to https://supabase.com/dashboard');
        console.log('2. Select your project');
        console.log('3. Go to Table Editor');
        console.log('4. Create these tables:');
        console.log('   - profiles (id, email, full_name, role, created_at)');
        console.log('   - internships (id, title, company, description, created_at)');
        console.log('   - internship_applications (id, user_id, internship_id, status, applied_at)');
        console.log('   - videos (id, title, description, url, created_at)');
        console.log('   - donations (id, amount, status, created_at)');
        console.log('');
      } else {
        console.log('\n🔧 ISSUE: Unknown Database Error');
        console.log('==================================================');
        console.log('Error details:', error.message);
        console.log('');
        console.log('TROUBLESHOOTING:');
        console.log('1. Check your Supabase project is active');
        console.log('2. Verify your API keys are correct');
        console.log('3. Check if your database is online');
        console.log('');
      }
      
      return false;
    }
    
    console.log('✅ Basic connection successful!');
    console.log(`📊 Found ${data || 0} records in profiles table`);
    return true;
    
  } catch (err) {
    console.log('❌ Unexpected error:', err.message);
    return false;
  }
}

async function testAllTables() {
  console.log('\n2️⃣ Testing all required tables...');
  
  const tables = ['profiles', 'internships', 'internship_applications', 'videos', 'donations'];
  let allGood = true;
  
  for (const table of tables) {
    try {
      const { data, error } = await supabase
        .from(table)
        .select('count', { count: 'exact', head: true });
      
      if (error) {
        console.log(`❌ ${table}: ${error.message}`);
        allGood = false;
      } else {
        console.log(`✅ ${table}: ${data || 0} records`);
      }
    } catch (err) {
      console.log(`❌ ${table}: ${err.message}`);
      allGood = false;
    }
  }
  
  return allGood;
}

async function main() {
  const connectionOk = await diagnoseDatabase();
  
  if (connectionOk) {
    const tablesOk = await testAllTables();
    
    if (tablesOk) {
      console.log('\n🎉 SUCCESS: Database is working perfectly!');
      console.log('Your admin dashboard should now display real data.');
      console.log('');
      console.log('Next steps:');
      console.log('1. Start your development server: npm run dev');
      console.log('2. Visit your admin dashboard');
      console.log('3. You should see real data instead of sample data');
    } else {
      console.log('\n⚠️ PARTIAL SUCCESS: Some tables have issues');
      console.log('Check the specific table errors above.');
    }
  } else {
    console.log('\n❌ FAILED: Database connection issues detected');
    console.log('Please follow the fix instructions above.');
    console.log('');
    console.log('After fixing, run this script again to verify.');
  }
}

main().catch(console.error); 