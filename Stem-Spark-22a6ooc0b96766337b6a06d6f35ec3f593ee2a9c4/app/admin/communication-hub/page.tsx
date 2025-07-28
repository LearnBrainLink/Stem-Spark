'use client';
import React, { useEffect, useState } from 'react';
import { createClient } from '@supabase/supabase-js';
import { useRouter } from 'next/navigation';
import WhatsAppChat from '@/components/whatsapp-chat';
import { useChatStore } from '@/lib/store/chat-store';
import { toast } from 'react-hot-toast';

// Admin-specific components
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Users, MessageSquare, BarChart2, CheckCircle } from 'lucide-react';
import { checkAdmin, getAdminStats } from '@/lib/admin-actions'; // Assuming these functions exist

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
    totalMessages: 0,
  });

  useEffect(() => {
    const initialize = async () => {
      try {
        const { data: { session }, error: sessionError } = await supabase.auth.getSession();

        if (sessionError || !session) {
          toast.error('Authentication error. Redirecting to login.');
          router.push('/login');
          return;
        }

        const user = session.user;
        const isAdmin = await checkAdmin(user.id);

        if (!isAdmin) {
          toast.error('Access denied. You must be an admin.');
          router.push('/dashboard');
          return;
        }

        const { data: profile, error: profileError } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', user.id)
          .single();

        if (profileError || !profile) {
          toast.error('Failed to fetch user profile.');
          router.push('/login');
          return;
        }

        setCurrentUser(profile);
        setAuthenticated(true);
        loadAdminStats();

        // Set up user presence
        const channel = supabase.channel('user-presence', {
          config: {
            presence: {
              key: user.id,
            },
          },
        });

        channel.on('presence', { event: 'sync' }, () => {
          // You can handle presence updates here if needed, e.g., for the online user count
        });

        channel.subscribe(async (status) => {
          if (status === 'SUBSCRIBED') {
            await channel.track({ is_online: true, last_seen: new Date().toISOString() });
          }
        });

        // Add beforeunload event listener to update presence
        const handleBeforeUnload = async () => {
          await channel.track({ is_online: false, last_seen: new Date().toISOString() });
          await channel.unsubscribe();
        };

        window.addEventListener('beforeunload', handleBeforeUnload);

        return () => {
          handleBeforeUnload();
          window.removeEventListener('beforeunload', handleBeforeUnload);
        };
      } catch (error) {
        toast.error('An unexpected error occurred during initialization.');
        router.push('/login');
      } finally {
        setIsLoading(false);
      }
    };

    initialize();
  }, [router, setCurrentUser, setAuthenticated]);

  const loadAdminStats = async () => {
    try {
      const adminStats = await getAdminStats();
      setStats(adminStats);
    } catch (error) {
      toast.error('Failed to load admin statistics.');
    }
  };

  if (isLoading || !currentUser) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-xl font-semibold">Loading Admin Hub...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Admin Header */}
      <div className="bg-white border-b border-gray-200 px-6 py-4">
        <h1 className="text-2xl font-bold text-gray-800">Admin Communication Hub</h1>
        <p className="text-sm text-gray-500">Oversee and manage all user communications.</p>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mt-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Users</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalUsers}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Online Users</CardTitle>
              <CheckCircle className="h-4 w-4 text-green-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.onlineUsers}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Chats</CardTitle>
              <MessageSquare className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalChats}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Messages</CardTitle>
              <BarChart2 className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalMessages}</div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Main Chat Area */}
      <div className="h-[calc(100vh-200px)]">
        <WhatsAppChat />
      </div>
    </div>
  );
} 