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
  const { setCurrentUser, setAuthenticated, currentUser } = useChatStore();
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const initialize = async () => {
      try {
        const { data: { session }, error: sessionError } = await supabase.auth.getSession();

        if (sessionError || !session) {
          toast.error('You must be logged in to chat.');
          router.push('/login');
          return;
        }

        const user = session.user;
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

        // Set up user presence
        const channel = supabase.channel('user-presence', {
          config: {
            presence: {
              key: user.id,
            },
          },
        });

        channel.subscribe(async (status) => {
          if (status === 'SUBSCRIBED') {
            await channel.track({ is_online: true, last_seen: new Date().toISOString() });
          }
        });

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
        toast.error('An unexpected error occurred.');
        router.push('/login');
      } finally {
        setIsLoading(false);
      }
    };

    initialize();
  }, [router, setCurrentUser, setAuthenticated]);

  if (isLoading || !currentUser) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-xl font-semibold">Loading Chat...</div>
      </div>
    );
  }

  return (
    <div className="h-screen">
      <WhatsAppChat />
    </div>
  );
} 