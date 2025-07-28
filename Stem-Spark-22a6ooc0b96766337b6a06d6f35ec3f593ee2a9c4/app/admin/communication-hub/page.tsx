'use client';

import React, { useEffect, useState } from 'react';
import { createClient } from '@supabase/supabase-js';
import { useRouter } from 'next/navigation';
import WhatsAppChat from '@/components/whatsapp-chat';
import { useChatStore } from '@/lib/store/chat-store';
import { toast } from 'react-hot-toast';
import { Shield, Settings, UserPlus, MessageSquare } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export default function AdminCommunicationHubPage() {
  const router = useRouter();
  const { setCurrentUser, setAuthenticated, currentUser } = useChatStore();
  const [isLoading, setIsLoading] = useState(true);
  const [stats, setStats] = useState({
    totalUsers: 0,
    onlineUsers: 0,
    totalChats: 0,
    totalMessages: 0
  });

  useEffect(() => {
    let mounted = true;

    const checkAdminAuth = async () => {
      try {
        const { data: { user }, error } = await supabase.auth.getUser();
        
        if (error) {
          console.error('Auth error:', error);
          if (mounted) {
            router.push('/login');
          }
          return;
        }

        if (!user) {
          if (mounted) {
            router.push('/login');
          }
          return;
        }

        // Get user profile data and check admin status
        const { data: profile, error: profileError } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', user.id)
          .single();

        if (profileError) {
          console.error('Profile error:', profileError);
          toast.error('Failed to load user profile');
          return;
        }

        if (!profile) {
          console.error('No profile found');
          toast.error('User profile not found');
          return;
        }

        // Check if user is admin
        if (profile.role !== 'admin' && !profile.is_super_admin) {
          toast.error('Access denied. Admin privileges required.');
          router.push('/dashboard');
          return;
        }

        // Set user in chat store with admin privileges
        const chatUser = {
          id: user.id,
          email: user.email || '',
          username: profile.username,
          full_name: profile.full_name,
          avatar_url: profile.avatar_url,
          last_seen: profile.last_seen || new Date().toISOString(),
          is_online: profile.is_online || false,
          role: profile.role || 'admin',
          status_message: profile.status_message || 'Admin - NovaKinetix Academy'
        };

        if (mounted) {
          setCurrentUser(chatUser);
          setAuthenticated(true);
          setIsLoading(false);
        }

        // Auto-update presence to online
        await supabase.rpc('update_user_presence', {
          user_uuid: user.id,
          online_status: true
        });

        // Load admin stats
        await loadAdminStats();

      } catch (error) {
        console.error('Error checking admin auth:', error);
        if (mounted) {
          toast.error('Authentication failed');
          router.push('/login');
        }
      }
    };

    const loadAdminStats = async () => {
      try {
        // Get total users
        const { count: totalUsers } = await supabase
          .from('profiles')
          .select('*', { count: 'exact', head: true });

        // Get online users
        const { count: onlineUsers } = await supabase
          .from('user_presence')
          .select('*', { count: 'exact', head: true })
          .eq('is_online', true);

        // Get total chats
        const { count: totalChats } = await supabase
          .from('chats')
          .select('*', { count: 'exact', head: true });

        // Get total messages
        const { count: totalMessages } = await supabase
          .from('messages')
          .select('*', { count: 'exact', head: true });

        setStats({
          totalUsers: totalUsers || 0,
          onlineUsers: onlineUsers || 0,
          totalChats: totalChats || 0,
          totalMessages: totalMessages || 0
        });
      } catch (error) {
        console.error('Error loading admin stats:', error);
      }
    };

    checkAdminAuth();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        if (event === 'SIGNED_OUT' || !session) {
          if (mounted) {
            setCurrentUser(null);
            setAuthenticated(false);
            router.push('/login');
          }
        }
      }
    );

    // Cleanup function
    return () => {
      mounted = false;
      subscription.unsubscribe();
      
      // Set user offline when leaving
      if (mounted) {
        supabase.auth.getUser().then(({ data: { user } }) => {
          if (user) {
            supabase.rpc('update_user_presence', {
              user_uuid: user.id,
              online_status: false
            });
          }
        });
      }
    };
  }, [router, setCurrentUser, setAuthenticated]);

  // Handle page visibility changes
  useEffect(() => {
    const handleVisibilityChange = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        await supabase.rpc('update_user_presence', {
          user_uuid: user.id,
          online_status: !document.hidden
        });
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    
    // Handle beforeunload to set offline
    const handleBeforeUnload = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        await supabase.rpc('update_user_presence', {
          user_uuid: user.id,
          online_status: false
        });
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, []);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">
            Loading Admin Chat...
          </h2>
          <p className="text-gray-600">
            Setting up admin dashboard and real-time messaging
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Admin Header */}
      <div className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <Shield className="h-6 w-6 text-blue-600" />
              <h1 className="text-2xl font-bold text-gray-900">Admin Communication Hub</h1>
            </div>
            <Badge variant="secondary" className="bg-blue-100 text-blue-800">
              {currentUser?.role === 'admin' ? 'Administrator' : 'Super Admin'}
            </Badge>
          </div>

          <div className="flex items-center gap-4">
            {/* Stats */}
            <div className="flex gap-6 text-sm">
              <div className="text-center">
                <div className="font-semibold text-gray-900">{stats.totalUsers}</div>
                <div className="text-gray-600">Total Users</div>
              </div>
              <div className="text-center">
                <div className="font-semibold text-green-600">{stats.onlineUsers}</div>
                <div className="text-gray-600">Online</div>
              </div>
              <div className="text-center">
                <div className="font-semibold text-blue-600">{stats.totalChats}</div>
                <div className="text-gray-600">Chats</div>
              </div>
              <div className="text-center">
                <div className="font-semibold text-purple-600">{stats.totalMessages}</div>
                <div className="text-gray-600">Messages</div>
              </div>
            </div>

            {/* Admin Actions */}
            <div className="flex gap-2">
              <Button variant="outline" size="sm">
                <UserPlus className="h-4 w-4 mr-2" />
                Invite Users
              </Button>
              <Button variant="outline" size="sm">
                <MessageSquare className="h-4 w-4 mr-2" />
                Broadcast
              </Button>
              <Button variant="outline" size="sm">
                <Settings className="h-4 w-4 mr-2" />
                Settings
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Chat Area */}
      <div className="h-[calc(100vh-80px)]">
        <WhatsAppChat />
      </div>
    </div>
  );
} 