'use client';

import React, { useEffect, useState } from 'react';
import { createClient } from '@supabase/supabase-js';
import { useRouter } from 'next/navigation';
import WhatsAppChat from '@/components/whatsapp-chat';
import { useChatStore } from '@/lib/store/chat-store';
import { toast } from 'react-hot-toast';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export default function CommunicationHubPage() {
  const router = useRouter();
  const { setCurrentUser, setAuthenticated } = useChatStore();
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let mounted = true;

    const checkAuth = async () => {
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

        // Get user profile data
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

        // Set user in chat store
        const chatUser = {
          id: user.id,
          email: user.email || '',
          username: profile.username,
          full_name: profile.full_name,
          avatar_url: profile.avatar_url,
          last_seen: profile.last_seen || new Date().toISOString(),
          is_online: profile.is_online || false,
          role: profile.role || 'student',
          status_message: profile.status_message || 'Hey there! I am using NovaKinetix Academy Chat'
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

      } catch (error) {
        console.error('Error checking auth:', error);
        if (mounted) {
          toast.error('Authentication failed');
          router.push('/login');
        }
      }
    };

    checkAuth();

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
            Loading Chat...
          </h2>
          <p className="text-gray-600">
            Setting up your real-time messaging experience
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <WhatsAppChat />
    </div>
  );
} 