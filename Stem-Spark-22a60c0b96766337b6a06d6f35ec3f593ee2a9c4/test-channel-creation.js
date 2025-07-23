const { createClient } = require('@supabase/supabase-js')

// Test channel creation
async function testChannelCreation() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  if (!supabaseUrl || !supabaseAnonKey) {
    console.error('Missing environment variables')
    return
  }

  const supabase = createClient(supabaseUrl, supabaseAnonKey)

  try {
    console.log('Testing channel creation...')

    // First, let's check if we can read existing channels
    const { data: existingChannels, error: readError } = await supabase
      .from('chat_channels')
      .select('*')
      .limit(5)

    if (readError) {
      console.error('Error reading channels:', readError)
      return
    }

    console.log('Existing channels:', existingChannels)

    // Test creating a channel (this will fail without auth, but we can see the error)
    const { data: newChannel, error: createError } = await supabase
      .from('chat_channels')
      .insert({
        name: 'Test Channel',
        description: 'Test channel creation',
        channel_type: 'public',
        created_by: 'test-user-id'
      })
      .select()
      .single()

    if (createError) {
      console.log('Expected error creating channel (no auth):', createError.message)
    } else {
      console.log('Channel created:', newChannel)
    }

    // Test reading channel members
    const { data: members, error: membersError } = await supabase
      .from('chat_channel_members')
      .select('*')
      .limit(5)

    if (membersError) {
      console.error('Error reading members:', membersError)
    } else {
      console.log('Channel members:', members)
    }

  } catch (error) {
    console.error('Test failed:', error)
  }
}

testChannelCreation() 