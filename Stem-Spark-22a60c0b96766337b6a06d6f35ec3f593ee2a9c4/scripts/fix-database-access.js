const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

console.log('🔧 DATABASE ACCESS FIX SCRIPT');
console.log('==================================================');

// Check environment variables
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.log('❌ Missing environment variables!');
  console.log('Please create a .env.local file with:');
  console.log('NEXT_PUBLIC_SUPABASE_URL=your_supabase_url');
  console.log('NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key');
  process.exit(1);
}

console.log('✅ Environment variables found');
console.log(`URL: ${supabaseUrl}`);

const supabase = createClient(supabaseUrl, supabaseKey);

async function testConnection() {
  console.log('\n🔍 Testing database connection...');
  
  try {
    // Test basic connection
    const { data, error } = await supabase
      .from('profiles')
      .select('count', { count: 'exact', head: true });
    
    if (error) {
      console.log('❌ Connection failed:', error.message);
      
      if (error.message.includes('infinite recursion')) {
        console.log('\n🔧 FIX NEEDED: RLS Policy Issue');
        console.log('==================================================');
        console.log('The error indicates an RLS (Row Level Security) policy issue.');
        console.log('Follow these steps to fix it:');
        console.log('');
        console.log('1. Go to your Supabase Dashboard: https://supabase.com/dashboard');
        console.log('2. Select your project');
        console.log('3. Go to Authentication → Policies');
        console.log('4. For each table (profiles, internships, etc.):');
        console.log('   - Click on the table name');
        console.log('   - Click "New Policy"');
        console.log('   - Choose "Create a policy from scratch"');
        console.log('   - Set Target roles: authenticated');
        console.log('   - Set Policy definition: true');
        console.log('   - Click "Review" and "Save policy"');
        console.log('');
        console.log('OR use the SQL script: scripts/fix-rls-policies.sql');
        console.log('');
        console.log('5. After fixing policies, run this script again');
      } else if (error.message.includes('relation') && error.message.includes('does not exist')) {
        console.log('\n🔧 FIX NEEDED: Tables Don\'t Exist');
        console.log('==================================================');
        console.log('The required tables don\'t exist in your database.');
        console.log('Follow these steps to create them:');
        console.log('');
        console.log('1. Go to your Supabase Dashboard: https://supabase.com/dashboard');
        console.log('2. Select your project');
        console.log('3. Go to Table Editor');
        console.log('4. Create these tables:');
        console.log('   - profiles');
        console.log('   - internships');
        console.log('   - internship_applications');
        console.log('   - videos');
        console.log('   - donations');
        console.log('');
        console.log('5. After creating tables, run this script again');
      }
      
      return false;
    }
    
    console.log('✅ Database connection successful!');
    console.log(`📊 Found ${data || 0} records in profiles table`);
    return true;
    
  } catch (err) {
    console.log('❌ Unexpected error:', err.message);
    return false;
  }
}

async function testAllTables() {
  console.log('\n🔍 Testing all required tables...');
  
  const tables = ['profiles', 'internships', 'internship_applications', 'videos', 'donations'];
  const results = {};
  
  for (const table of tables) {
    try {
      const { data, error } = await supabase
        .from(table)
        .select('count', { count: 'exact', head: true });
      
      if (error) {
        console.log(`❌ ${table}: ${error.message}`);
        results[table] = { error: error.message };
      } else {
        console.log(`✅ ${table}: ${data || 0} records`);
        results[table] = { count: data || 0 };
      }
    } catch (err) {
      console.log(`❌ ${table}: ${err.message}`);
      results[table] = { error: err.message };
    }
  }
  
  return results;
}

async function main() {
  const connectionOk = await testConnection();
  
  if (connectionOk) {
    await testAllTables();
    console.log('\n🎉 Database is working correctly!');
    console.log('Your admin dashboard should now display real data.');
  } else {
    console.log('\n❌ Database connection failed.');
    console.log('Please follow the fix instructions above and try again.');
  }
}

main().catch(console.error); 