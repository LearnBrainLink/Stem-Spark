const { createClient } = require('@supabase/supabase-js')

// Manually set environment variables from .env.local
process.env.NEXT_PUBLIC_SUPABASE_URL = 'https://qnuevynptgkoivekuzer.supabase.co'
process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFudWV2eW5wdGdrb2l2ZWt1emVyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDg5NzM4MzYsImV4cCI6MjA2NDU0OTgzNn0.z3GzoVvcFXFx1CL1LA3cww_0587aUwrlkZStgQFRrww'
process.env.SUPABASE_SERVICE_ROLE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFudWV2eW5wdGdrb2l2ZWt1emVyIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc0ODk3MzgzNiwiZXhwIjoyMDY0NTQ5ODM2fQ.0dzieduL18-aoMkfxPTD95bP7tykb764LAEsuOjUkVA'

console.log('🔍 SUPABASE CONNECTION TEST')
console.log('=' .repeat(50))

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

console.log('✅ Environment Variables:')
console.log('- URL:', supabaseUrl)
console.log('- Anon Key:', supabaseAnonKey.substring(0, 20) + '...')
console.log('- Service Key:', supabaseServiceKey.substring(0, 20) + '...')

// Create Supabase clients
const supabase = createClient(supabaseUrl, supabaseAnonKey)
const adminSupabase = createClient(supabaseUrl, supabaseServiceKey)

async function testConnection() {
  console.log('\n🔗 Testing Basic Connection...')
  
  try {
    // First, test if we can connect at all
    console.log('🔍 Testing basic auth...')
    const { data: authData, error: authError } = await supabase.auth.getUser()
    console.log('Auth test result:', { authData: !!authData, authError: authError?.message })
    
    // Try to list all tables first
    console.log('🔍 Testing table access...')
    const { data: tables, error: tableError } = await adminSupabase
      .from('information_schema.tables')
      .select('table_name')
      .eq('table_schema', 'public')
    
    if (tableError) {
      console.log('❌ Cannot access table schema:', tableError.message)
    } else {
      console.log('✅ Available tables:', tables?.map(t => t.table_name) || 'none')
    }
    
    // Try profiles table
    console.log('🔍 Testing profiles table...')
    const { count, error } = await supabase.from('profiles').select('*', { count: 'exact', head: true })
    
    if (error) {
      console.error('❌ Profiles table error:', error.message)
      console.error('❌ Error details:', JSON.stringify(error, null, 2))
      
      // Try a different approach - just select without count
      console.log('🔍 Trying simple select...')
      const { data: simpleData, error: simpleError } = await supabase.from('profiles').select('*').limit(1)
      
      if (simpleError) {
        console.error('❌ Simple select failed:', simpleError.message)
        return false
      } else {
        console.log('✅ Simple select worked! Data length:', simpleData?.length || 0)
        return true
      }
    }
    
    console.log('✅ Connection successful!')
    console.log('📊 Profiles table has', count || 0, 'records')
    return true
  } catch (err) {
    console.error('❌ Connection error:', err.message)
    console.error('❌ Full error:', err)
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
      
      const { count, error } = await adminSupabase
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
    const { data, error } = await adminSupabase
      .from('donations')
      .select('amount')
      .eq('status', 'completed')
    
    if (error) {
      console.log('❌ Revenue calculation failed:', error.message)
      return 0
    }
    
    const total = data.reduce((sum, donation) => sum + (donation.amount || 0), 0)
    console.log('✅ Total revenue: $', total)
    return total
  } catch (err) {
    console.log('❌ Revenue calculation error:', err.message)
    return 0
  }
}

async function main() {
  const connected = await testConnection()
  
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
    console.log('📝 You may need to create these tables in your Supabase database')
  } else {
    console.log('✅ All tables accessible - ready for real data integration!')
    console.log('🚀 You can now start your Next.js app and see real data in the admin dashboard')
  }
  
  console.log('\n✅ Database connection test completed!')
}

main().catch(console.error) 