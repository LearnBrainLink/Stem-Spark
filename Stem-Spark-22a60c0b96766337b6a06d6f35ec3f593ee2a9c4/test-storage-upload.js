const { createClient } = require('@supabase/supabase-js')

// Test storage upload functionality
async function testStorageUpload() {
  const supabaseUrl = process.env.SUPABASE_URL
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY
  
  if (!supabaseUrl || !supabaseKey) {
    console.error('Missing Supabase environment variables')
    return
  }

  const supabase = createClient(supabaseUrl, supabaseKey)

  try {
    // Test bucket access
    console.log('Testing bucket access...')
    const { data: buckets, error: bucketError } = await supabase.storage.listBuckets()
    
    if (bucketError) {
      console.error('Bucket access error:', bucketError)
      return
    }

    console.log('Available buckets:', buckets.map(b => b.name))

    // Test chat-attachments bucket specifically
    const { data: files, error: filesError } = await supabase.storage
      .from('chat-attachments')
      .list('images')

    if (filesError) {
      console.error('Files list error:', filesError)
    } else {
      console.log('Files in chat-attachments/images:', files)
    }

    console.log('✅ Storage test completed successfully')
  } catch (error) {
    console.error('❌ Storage test failed:', error)
  }
}

testStorageUpload() 