// Test video creation - Run this to debug the exact error
// Usage: node test-video-creation.js

const { createClient } = require('@supabase/supabase-js');

async function testVideoCreation() {
  console.log('🧪 Testing Video Creation...');
  
  // Get environment variables
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  
  if (!supabaseUrl || !supabaseAnonKey) {
    console.error('❌ Missing Supabase environment variables');
    console.log('Make sure you have NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY set');
    return;
  }
  
  console.log('✅ Environment variables found');
  console.log('📍 Supabase URL:', supabaseUrl);
  
  // Create Supabase client
  const supabase = createClient(supabaseUrl, supabaseAnonKey);
  
  // Test data
  const testVideo = {
    title: 'Test Video',
    description: 'This is a test video',
    video_url: 'https://youtube.com/watch?v=test',
    duration: 900, // 15 minutes in seconds
    category: 'programming',
    status: 'active',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };
  
  console.log('📝 Test video data:', testVideo);
  
  try {
    // Test 1: Check if videos table exists
    console.log('\n🔍 Test 1: Checking videos table...');
    const { data: tableCheck, error: tableError } = await supabase
      .from('videos')
      .select('count(*)')
      .limit(1);
      
    if (tableError) {
      console.error('❌ Videos table error:', tableError.message);
      return;
    }
    
    console.log('✅ Videos table accessible');
    
    // Test 2: Try to insert video
    console.log('\n📤 Test 2: Attempting to insert video...');
    const { data, error } = await supabase
      .from('videos')
      .insert(testVideo)
      .select()
      .single();
      
    if (error) {
      console.error('❌ Insert failed:', error.message);
      console.error('🔍 Error details:', error);
      
      if (error.message.includes('policy')) {
        console.log('\n💡 This is an RLS policy error. You need to run the SQL fix.');
        console.log('📋 Copy and paste this in your Supabase SQL Editor:');
        console.log(`
CREATE POLICY IF NOT EXISTS "videos_insert_policy" ON public.videos 
FOR INSERT 
TO authenticated 
WITH CHECK (true);

CREATE POLICY IF NOT EXISTS "videos_update_policy" ON public.videos 
FOR UPDATE 
TO authenticated 
USING (true);

CREATE POLICY IF NOT EXISTS "videos_delete_policy" ON public.videos 
FOR DELETE 
TO authenticated 
USING (true);
        `);
      }
      
      return;
    }
    
    console.log('✅ Video created successfully!');
    console.log('📄 Created video:', data);
    
    // Clean up - delete the test video
    console.log('\n🧹 Cleaning up test video...');
    const { error: deleteError } = await supabase
      .from('videos')
      .delete()
      .eq('id', data.id);
      
    if (deleteError) {
      console.log('⚠️ Could not delete test video:', deleteError.message);
    } else {
      console.log('✅ Test video cleaned up');
    }
    
  } catch (err) {
    console.error('💥 Unexpected error:', err.message);
  }
}

// Run the test
testVideoCreation().then(() => {
  console.log('\n🏁 Test completed');
}).catch(err => {
  console.error('💥 Test failed:', err);
}); 