const { createClient } = require('@supabase/supabase-js')

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

async function testChannelCreation() {
  try {
    console.log('Testing channel creation...')
    
    const supabase = createClient(supabaseUrl, supabaseAnonKey)
    
    // Sign in as an admin user
    const { data: { user }, error: signInError } = await supabase.auth.signInWithPassword({
      email: 'yatish.grandhe@gmail.com',
      password: 'test123' // You'll need to use the actual password
    })
    
    if (signInError) {
      console.error('Sign in error:', signInError)
      return
    }
    
    console.log('Signed in as:', user.email)
    
    // Get the session
    const { data: { session }, error: sessionError } = await supabase.auth.getSession()
    if (sessionError || !session) {
      console.error('Session error:', sessionError)
      return
    }
    
    console.log('Got session, access token:', session.access_token ? 'Present' : 'Missing')
    
    // Test the API
    const response = await fetch('http://localhost:3000/api/messaging/channels', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${session.access_token}`
      },
      body: JSON.stringify({
        name: 'Test Channel',
        description: 'Test channel created via script',
        channel_type: 'public'
      })
    })
    
    const result = await response.json()
    console.log('Response status:', response.status)
    console.log('Response body:', result)
    
  } catch (error) {
    console.error('Test error:', error)
  }
}

testChannelCreation() 