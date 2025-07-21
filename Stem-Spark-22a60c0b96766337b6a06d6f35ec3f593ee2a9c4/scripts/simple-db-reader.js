const { createClient } = require('@supabase/supabase-js')

console.log('🔍 SIMPLE DATABASE READER - Supabase Connection Test')
console.log('=' .repeat(60))

// Check environment variables
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

console.log('Environment Variables Check:')
console.log('- SUPABASE_URL:', supabaseUrl || 'NOT SET')
console.log('- ANON_KEY:', supabaseAnonKey ? 'SET (' + supabaseAnonKey.substring(0, 20) + '...)' : 'NOT SET')
console.log('- SERVICE_KEY:', supabaseServiceKey ? 'SET (' + supabaseServiceKey.substring(0, 20) + '...)' : 'NOT SET')

if (!supabaseUrl || !supabaseAnonKey) {
  console.log('\n❌ Missing required environment variables!')
  console.log('Please set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY')
  
  // Try to provide helpful instructions
  console.log('\n📝 To set environment variables:')
  console.log('1. Create a .env.local file in your project root')
  console.log('2. Add these lines:')
  console.log('   NEXT_PUBLIC_SUPABASE_URL=your_supabase_url')
  console.log('   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key')
  console.log('   SUPABASE_SERVICE_ROLE_KEY=your_service_key')
  
  process.exit(1)
}

// Create Supabase client
const supabase = createClient(supabaseUrl, supabaseAnonKey)

async function testBasicConnection() {
  console.log('\n🔗 Testing Basic Connection...')
  
  try {
    const { data, error } = await supabase.from('profiles').select('count', { count: 'exact', head: true })
    
    if (error) {
      console.error('❌ Connection failed:', error.message)
      return false
    }
    
    console.log('✅ Connection successful!')
    console.log('📊 Profiles table has', data || 'unknown', 'records')
    return true
  } catch (err) {
    console.error('❌ Connection error:', err.message)
    return false
  }
}

async function testAllTables() {
  console.log('\n📊 Testing All Admin Dashboard Tables...')
  
  const tables = [
    { name: 'profiles', description: 'User profiles' },
    { name: 'internships', description: 'Internship programs' },
    { name: 'internship_applications', description: 'Applications' },
    { name: 'donations', description: 'Revenue/donations' },
    { name: 'videos', description: 'Video content' },
  ]
  
  const results = {}
  
  for (const table of tables) {
    try {
      console.log(`\n🔍 Testing ${table.name}...`)
      
      const { count, error } = await supabase
        .from(table.name)
        .select('*', { count: 'exact', head: true })
      
      if (error) {
        console.log(`❌ ${table.name}: ${error.message}`)
        results[table.name] = { error: error.message, count: 0 }
      } else {
        console.log(`✅ ${table.name}: ${count || 0} records`)
        results[table.name] = { count: count || 0 }
      }
    } catch (err) {
      console.log(`❌ ${table.name}: ${err.message}`)
      results[table.name] = { error: err.message, count: 0 }
    }
  }
  
  return results
}

async function calculateRevenue() {
  console.log('\n💰 Calculating Revenue...')
  
  try {
    const { data, error } = await supabase
      .from('donations')
      .select('amount')
      .eq('status', 'completed')
    
    if (error) {
      console.log('❌ Revenue calculation failed:', error.message)
      return 0
    }
    
    const total = data.reduce((sum, donation) => sum + (donation.amount || 0), 0)
    console.log('✅ Total revenue:', total)
    return total
  } catch (err) {
    console.log('❌ Revenue calculation error:', err.message)
    return 0
  }
}

async function main() {
  const connected = await testBasicConnection()
  
  if (!connected) {
    console.log('\n❌ Cannot proceed - no database connection')
    process.exit(1)
  }
  
  const tableResults = await testAllTables()
  const revenue = await calculateRevenue()
  
  console.log('\n📈 DASHBOARD STATS SUMMARY:')
  console.log('=' .repeat(40))
  console.log('Users:', tableResults.profiles?.count || 0)
  console.log('Internships:', tableResults.internships?.count || 0)
  console.log('Applications:', tableResults.internship_applications?.count || 0)
  console.log('Videos:', tableResults.videos?.count || 0)
  console.log('Revenue: $', revenue)
  
  console.log('\n🎯 NEXT STEPS:')
  if (Object.values(tableResults).some(r => r.error)) {
    console.log('❌ Some tables have errors - check your database schema')
  } else {
    console.log('✅ All tables accessible - ready for real data integration!')
  }
  
  console.log('\n✅ Database reader completed!')
}

main().catch(console.error) 