// Quick Video Creation Test
// This will help identify the exact error

const { createClient } = require('@supabase/supabase-js');

async function quickTest() {
  console.log('🔧 Video Creation Diagnostic Tool');
  console.log('=====================================\n');
  
  // You need to manually add your Supabase credentials here:
  const SUPABASE_URL = 'YOUR_SUPABASE_URL_HERE';
  const SUPABASE_ANON_KEY = 'YOUR_SUPABASE_ANON_KEY_HERE';
  
  if (SUPABASE_URL === 'YOUR_SUPABASE_URL_HERE') {
    console.log('❌ Please edit this file and add your Supabase credentials:');
    console.log('1. Go to Supabase Dashboard > Settings > API');
    console.log('2. Copy your Project URL and anon/public key');
    console.log('3. Replace the values in this file');
    console.log('4. Run: node quick-video-test.js');
    return;
  }
  
  const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
  
  try {
    console.log('🧪 Testing video insertion...');
    
    const testVideo = {
      title: 'Test Video ' + Date.now(),
      description: 'Test description',
      video_url: 'https://youtube.com/watch?v=test123',
      duration: 600,
      category: 'programming',
      status: 'active'
    };
    
    const { data, error } = await supabase
      .from('videos')
      .insert(testVideo)
      .select()
      .single();
    
    if (error) {
      console.log('❌ Video creation failed!');
      console.log('Error message:', error.message);
      console.log('Error code:', error.code);
      console.log('Error details:', error.details);
      
      if (error.message.includes('policy')) {
        console.log('\n💡 SOLUTION: This is an RLS policy issue.');
        console.log('Run this SQL in your Supabase Dashboard:');
        console.log('----------------------------------------');
        console.log(`-- Drop existing policies first
DROP POLICY IF EXISTS "videos_insert_policy" ON public.videos;
DROP POLICY IF EXISTS "videos_update_policy" ON public.videos;
DROP POLICY IF EXISTS "videos_delete_policy" ON public.videos;

-- Create new policies
CREATE POLICY "videos_insert_policy" ON public.videos 
FOR INSERT TO authenticated WITH CHECK (true);

CREATE POLICY "videos_update_policy" ON public.videos 
FOR UPDATE TO authenticated USING (true);

CREATE POLICY "videos_delete_policy" ON public.videos 
FOR DELETE TO authenticated USING (true);`);
        console.log('----------------------------------------');
      }
      
      return;
    }
    
    console.log('✅ Video created successfully!');
    console.log('Video ID:', data.id);
    
    // Clean up
    await supabase.from('videos').delete().eq('id', data.id);
    console.log('✅ Test video cleaned up');
    
  } catch (err) {
    console.log('💥 Unexpected error:', err.message);
  }
}

quickTest(); 