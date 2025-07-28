import { createClient } from '@supabase/supabase-js';

// Note: It's generally better to use the server client for server-side actions,
// but for simplicity in this refactor, we'll use the client-side instance.
// Ensure your RLS policies are robust.
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export const checkAdmin = async (userId: string): Promise<boolean> => {
  if (!userId) {
    return false;
  }

  try {
    const { data: profile, error } = await supabase
      .from('profiles')
      .select('role, is_super_admin')
      .eq('id', userId)
      .single();

    if (error) {
      console.error('Error checking admin status:', error);
      return false;
    }

    return profile?.role === 'admin' || profile?.is_super_admin === true;
  } catch (error) {
    console.error('Unexpected error in checkAdmin:', error);
    return false;
  }
};

export const getAdminStats = async () => {
  try {
    const [
      { count: totalUsers },
      { count: onlineUsers },
      { count: totalChannels },
      { count: totalMessages }
    ] = await Promise.all([
      supabase.from('profiles').select('*', { count: 'exact', head: true }),
      supabase.from('user_presence').select('*', { count: 'exact', head: true }).eq('is_online', true),
      supabase.from('channels').select('*', { count: 'exact', head: true }),
      supabase.from('messages').select('*', { count: 'exact', head: true })
    ]);

    return {
      totalUsers: totalUsers || 0,
      onlineUsers: onlineUsers || 0,
      totalChats: totalChannels || 0,
      totalMessages: totalMessages || 0,
    };
  } catch (error) {
    console.error('Error fetching admin stats:', error);
    return {
      totalUsers: 0,
      onlineUsers: 0,
      totalChats: 0,
      totalMessages: 0,
    };
  }
}; 