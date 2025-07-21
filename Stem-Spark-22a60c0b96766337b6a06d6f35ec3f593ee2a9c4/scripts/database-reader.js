const { createClient } = require('@supabase/supabase-js')

// Load environment variables
require('dotenv').config({ path: '.env.local' })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

console.log('🔍 DATABASE READER - Supabase Connection Test')
console.log('=' .repeat(50))

// Environment check
if (!supabaseUrl) {
  console.error('❌ NEXT_PUBLIC_SUPABASE_URL is missing')
  process.exit(1)
}

if (!supabaseAnonKey) {
  console.error('❌ NEXT_PUBLIC_SUPABASE_ANON_KEY is missing')
  process.exit(1)
}

console.log('✅ Supabase URL:', supabaseUrl)
console.log('✅ Anon Key:', supabaseAnonKey.substring(0, 20) + '...')
console.log('✅ Service Key:', supabaseServiceKey ? supabaseServiceKey.substring(0, 20) + '...' : 'Not set')

// Create clients
const supabase = createClient(supabaseUrl, supabaseAnonKey)
const adminSupabase = supabaseServiceKey ? createClient(supabaseUrl, supabaseServiceKey) : supabase

async function testConnection() {
  console.log('\n🔗 Testing Connection...')
  
  try {
    const { data, error } = await supabase.from('profiles').select('count', { count: 'exact', head: true })
    
    if (error) {
      console.error('❌ Connection failed:', error.message)
      return false
    }
    
    console.log('✅ Connection successful!')
    return true
  } catch (err) {
    console.error('❌ Connection error:', err.message)
    return false
  }
}

async function readTableStructure(tableName, client = supabase) {
  console.log(`\n📊 Reading ${tableName} table...`)
  
  try {
    // Get count
    const { count, error: countError } = await client
      .from(tableName)
      .select('*', { count: 'exact', head: true })
    
    if (countError) {
      console.error(`❌ Error reading ${tableName} count:`, countError.message)
      return null
    }
    
    // Get sample data (first 3 rows)
    const { data, error: dataError } = await client
      .from(tableName)
      .select('*')
      .limit(3)
    
    if (dataError) {
      console.error(`❌ Error reading ${tableName} data:`, dataError.message)
      return null
    }
    
    console.log(`✅ ${tableName}: ${count} records`)
    if (data && data.length > 0) {
      console.log('📝 Sample columns:', Object.keys(data[0]).join(', '))
    }
    
    return { count, sampleData: data }
  } catch (err) {
    console.error(`❌ Error with ${tableName}:`, err.message)
    return null
  }
}

async function generateStats() {
  console.log('\n📈 Generating Dashboard Stats...')
  
  const tables = [
    'profiles',
    'internships', 
    'internship_applications',
    'donations',
    'videos',
    'user_activities'
  ]
  
  const stats = {}
  
  for (const table of tables) {
    const result = await readTableStructure(table, adminSupabase)
    if (result) {
      stats[table] = result.count
    }
  }
  
  // Calculate revenue
  try {
    const { data: donations, error } = await adminSupabase
      .from('donations')
      .select('amount')
      .eq('status', 'completed')
    
    if (!error && donations) {
      const totalRevenue = donations.reduce((sum, d) => sum + (d.amount || 0), 0)
      stats.totalRevenue = totalRevenue
      console.log('💰 Total Revenue:', totalRevenue)
    }
  } catch (err) {
    console.log('⚠️ Could not calculate revenue:', err.message)
  }
  
  console.log('\n📊 Final Stats Summary:')
  console.log(JSON.stringify(stats, null, 2))
  
  return stats
}

async function main() {
  const connected = await testConnection()
  
  if (!connected) {
    console.log('\n❌ Cannot proceed without database connection')
    process.exit(1)
  }
  
  await generateStats()
  
  console.log('\n✅ Database reader completed successfully!')
}

main().catch(console.error) 