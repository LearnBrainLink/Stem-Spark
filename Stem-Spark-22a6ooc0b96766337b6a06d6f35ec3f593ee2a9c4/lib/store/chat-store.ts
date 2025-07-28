import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import { createClient } from '@supabase/supabase-js';
import { v4 as uuidv4 } from 'uuid';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';

dayjs.extend(relativeTime);

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export interface User {
  id: string;
  email: string;
  username?: string;
  full_name?: string;
  avatar_url?: string;
  last_seen: string;
  is_online: boolean;
  role: string;
  status_message?: string;
}

export interface Message {
  id: string;
  chat_id: string;
  sender_id: string;
  content: string;
  message_type: 'text' | 'image' | 'file' | 'forwarded';
  edited: boolean;
  edited_at?: string;
  seen_by: string[];
  forwarded_from?: string;
  reply_to?: string;
  created_at: string;
  updated_at: string;
  deleted_for_everyone: boolean;
  deleted_for_sender: boolean;
  reactions?: Record<string, string[]>;
  read_receipts?: Record<string, string>;
  sender?: User;
  original_message?: Message;
  reply_message?: Message;
}

export interface Channel {
  id: string;
  name: string;
  type: 'general' | 'announcements' | 'parent_teacher' | 'admin_only';
  description?: string;
  created_at: string;
  last_message_at?: string;
  last_message_id?: string;
  last_message?: Message;
  unread_count?: number;
}

export interface TypingUser {
  user_id: string;
  user: User;
  chat_id: string;
  updated_at: string;
}

export interface ChatState {
  // Current user
  currentUser: User | null;
  isAuthenticated: boolean;

  // Channels (chats)
  channels: Channel[];
  selectedChannelId: string | null;
  selectedChannel: Channel | null;
  
  // Messages
  messages: Record<string, Message[]>;
  loadingMessages: Record<string, boolean>;
  
  // Users and presence
  users: User[];
  onlineUsers: string[];
  typingUsers: TypingUser[];
  
  // UI state
  isLoading: boolean;
  error: string | null;
  searchQuery: string;
  filteredChannels: Channel[];
  
  // Message actions
  editingMessage: string | null;
  replyingTo: Message | null;
  forwardingMessage: Message | null;
  selectedMessages: string[];
  
  // Real-time subscriptions
  subscriptions: Map<string, any>;
}

export interface ChatActions {
  // Actions
  setCurrentUser: (user: User | null) => void;
  setAuthenticated: (isAuth: boolean) => void;
  
  // Channel actions
  loadChannels: () => Promise<void>;
  selectChannel: (channelId: string) => void;
  
  // Message actions
  loadMessages: (channelId: string) => Promise<void>;
  sendMessage: (channelId: string, content: string, type?: string) => Promise<void>;
  editMessage: (messageId: string, content: string) => Promise<void>;
  deleteMessage: (messageId: string, deleteForEveryone?: boolean) => Promise<void>;
  forwardMessage: (messageId: string, channelIds: string[]) => Promise<void>;
  markMessageSeen: (messageId: string) => Promise<void>;
  reactToMessage: (messageId: string, emoji: string) => Promise<void>;
  
  // Message selection
  setEditingMessage: (messageId: string | null) => void;
  setReplyingTo: (message: Message | null) => void;
  setForwardingMessage: (message: Message | null) => void;
  toggleMessageSelection: (messageId: string) => void;
  clearSelectedMessages: () => void;
  
  // Presence and typing
  updatePresence: (isOnline: boolean) => Promise<void>;
  updateTypingStatus: (channelId: string, isTyping: boolean) => Promise<void>;
  
  // Search
  setSearchQuery: (query: string) => void;
  searchMessages: (query: string) => Promise<Message[]>;
  
  // Real-time subscriptions
  setupRealtimeSubscriptions: () => void;
  cleanupSubscriptions: () => void;
  
  // Utility
  getChannelName: (channel: Channel) => string;
  getChannelAvatar: (channel: Channel) => string;
  getLastMessage: (channel: Channel) => Message | null;
  getUnreadCount: (channelId: string) => number;
  isUserOnline: (userId: string) => boolean;
  getLastSeen: (userId: string) => string;
  
  // Error handling
  setError: (error: string | null) => void;
  clearError: () => void;
}

export type ChatStore = ChatState & ChatActions;

export const useChatStore = create<ChatStore>()(
  devtools(
    (set, get) => ({
      // Initial state
      currentUser: null,
      isAuthenticated: false,
      channels: [],
      selectedChannelId: null,
      selectedChannel: null,
      messages: {},
      loadingMessages: {},
      users: [],
      onlineUsers: [],
      typingUsers: [],
      isLoading: false,
      error: null,
      searchQuery: '',
      filteredChannels: [],
      editingMessage: null,
      replyingTo: null,
      forwardingMessage: null,
      selectedMessages: [],
      subscriptions: new Map(),

      // Actions
      setCurrentUser: (user) => set({ currentUser: user }),
      setAuthenticated: (isAuth) => set({ isAuthenticated: isAuth }),

      loadChannels: async () => {
        const { currentUser } = get();
        if (!currentUser) return;

        set({ isLoading: true });
        try {
          const { data: channels, error } = await supabase
            .from('channels')
            .select('*')
            .order('created_at', { ascending: false });

          if (error) throw error;

          set({ channels: channels || [] });
        } catch (error) {
          console.error('Error loading channels:', error);
          set({ error: 'Failed to load channels' });
        } finally {
          set({ isLoading: false });
        }
      },

      selectChannel: (channelId) => {
        const { channels } = get();
        const selectedChannel = channels.find(c => c.id === channelId);
        set({ selectedChannelId: channelId, selectedChannel });
        get().loadMessages(channelId);
      },

      loadMessages: async (channelId) => {
        const { currentUser } = get();
        if (!currentUser || !channelId) return;

        set(state => ({ 
          loadingMessages: { ...state.loadingMessages, [channelId]: true } 
        }));

        try {
          const { data: messages, error } = await supabase
            .from('messages')
            .select(`
              *,
              sender:profiles!messages_sender_id_fkey(
                id,
                email,
                full_name,
                avatar_url,
                role
              )
            `)
            .eq('chat_id', channelId)
            .order('created_at', { ascending: true });

          if (error) throw error;

          set(state => ({
            messages: { ...state.messages, [channelId]: messages || [] },
            loadingMessages: { ...state.loadingMessages, [channelId]: false }
          }));
        } catch (error) {
          console.error('Error loading messages:', error);
          set(state => ({
            loadingMessages: { ...state.loadingMessages, [channelId]: false }
          }));
        }
      },

      sendMessage: async (channelId, content, type = 'text') => {
        const { currentUser } = get();
        if (!currentUser || !content.trim()) return;

        const tempId = `temp-${uuidv4()}`;
        const newMessage: Message = {
          id: tempId,
          chat_id: channelId,
          sender_id: currentUser.id,
          content: content.trim(),
          message_type: type as any,
          edited: false,
          seen_by: [],
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          deleted_for_everyone: false,
          deleted_for_sender: false,
          reactions: {},
          read_receipts: {},
          sender: currentUser
        };

        // Optimistically add message to UI
        set(state => ({
          messages: {
            ...state.messages,
            [channelId]: [...(state.messages[channelId] || []), newMessage]
          }
        }));

        try {
          const { data: message, error } = await supabase
            .from('messages')
            .insert({
              chat_id: channelId,
              sender_id: currentUser.id,
              content: content.trim(),
              message_type: type
            })
            .select(`
              *,
              sender:profiles!messages_sender_id_fkey(
                id,
                email,
                full_name,
                avatar_url,
                role
              )
            `)
            .single();

          if (error) throw error;

          // Replace temp message with real message
          set(state => ({
            messages: {
              ...state.messages,
              [channelId]: (state.messages[channelId] || []).map(msg =>
                msg.id === tempId ? message : msg
              )
            }
          }));
        } catch (error) {
          console.error('Error sending message:', error);
          // Remove temp message on error
          set(state => ({
            messages: {
              ...state.messages,
              [channelId]: (state.messages[channelId] || []).filter(msg => msg.id !== tempId)
            }
          }));
        }
      },

      editMessage: async (messageId, content) => {
        const { currentUser } = get();
        if (!currentUser || !content.trim()) return;

        try {
          const { error } = await supabase
            .from('messages')
            .update({
              content: content.trim(),
              edited: true,
              edited_at: new Date().toISOString()
            })
            .eq('id', messageId)
            .eq('sender_id', currentUser.id);

          if (error) throw error;

          // Update message in store
          set(state => ({
            messages: Object.fromEntries(
              Object.entries(state.messages).map(([channelId, messages]) => [
                channelId,
                messages.map(msg =>
                  msg.id === messageId
                    ? { ...msg, content: content.trim(), edited: true, edited_at: new Date().toISOString() }
                    : msg
                )
              ])
            )
          }));
        } catch (error) {
          console.error('Error editing message:', error);
        }
      },

      deleteMessage: async (messageId, deleteForEveryone = false) => {
        const { currentUser } = get();
        if (!currentUser) return;

        try {
          if (deleteForEveryone) {
            const { error } = await supabase
              .from('messages')
              .update({ deleted_for_everyone: true })
              .eq('id', messageId);

            if (error) throw error;
          } else {
            const { error } = await supabase
              .from('messages')
              .update({ deleted_for_sender: true })
              .eq('id', messageId)
              .eq('sender_id', currentUser.id);

            if (error) throw error;
          }

          // Update message in store
          set(state => ({
            messages: Object.fromEntries(
              Object.entries(state.messages).map(([channelId, messages]) => [
                channelId,
                messages.map(msg =>
                  msg.id === messageId
                    ? { ...msg, deleted_for_everyone: deleteForEveryone, deleted_for_sender: !deleteForEveryone }
                    : msg
                )
              ])
            )
          }));
        } catch (error) {
          console.error('Error deleting message:', error);
        }
      },

      forwardMessage: async (messageId, channelIds) => {
        const { currentUser } = get();
        if (!currentUser) return;

        try {
          // Get the original message
          const { data: originalMessage, error: fetchError } = await supabase
            .from('messages')
            .select('*')
            .eq('id', messageId)
            .single();

          if (fetchError) throw fetchError;

          // Forward to each channel
          for (const channelId of channelIds) {
            await supabase
              .from('messages')
              .insert({
                chat_id: channelId,
                sender_id: currentUser.id,
                content: originalMessage.content,
                message_type: originalMessage.message_type,
                forwarded_from: messageId
              });
          }
        } catch (error) {
          console.error('Error forwarding message:', error);
        }
      },

      markMessageSeen: async (messageId) => {
        const { currentUser } = get();
        if (!currentUser) return;

        try {
          const { error } = await supabase
            .from('messages')
            .update({
              seen_by: `{${currentUser.id}}`
            })
            .eq('id', messageId)
            .neq('seen_by', `{${currentUser.id}}`);

          if (error) throw error;
        } catch (error) {
          console.error('Error marking message as seen:', error);
        }
      },

      reactToMessage: async (messageId, emoji) => {
        const { currentUser } = get();
        if (!currentUser) return;

        try {
          const { error } = await supabase
            .from('messages')
            .update({
              reactions: { [emoji]: [currentUser.id] }
            })
            .eq('id', messageId);

          if (error) throw error;
        } catch (error) {
          console.error('Error reacting to message:', error);
        }
      },

      setEditingMessage: (messageId) => set({ editingMessage: messageId }),
      setReplyingTo: (message) => set({ replyingTo: message }),
      setForwardingMessage: (message) => set({ forwardingMessage: message }),
      toggleMessageSelection: (messageId) => {
        set(state => ({
          selectedMessages: state.selectedMessages.includes(messageId)
            ? state.selectedMessages.filter(id => id !== messageId)
            : [...state.selectedMessages, messageId]
        }));
      },
      clearSelectedMessages: () => set({ selectedMessages: [] }),

      updatePresence: async (isOnline) => {
        const { currentUser } = get();
        if (!currentUser) return;

        try {
          await supabase
            .from('user_presence')
            .upsert({
              user_id: currentUser.id,
              is_online: isOnline,
              last_seen: new Date().toISOString()
            });
        } catch (error) {
          console.error('Error updating presence:', error);
        }
      },

      updateTypingStatus: async (channelId, isTyping) => {
        const { currentUser } = get();
        if (!currentUser) return;

        try {
          await supabase
            .from('typing_status')
            .upsert({
              chat_id: channelId,
              user_id: currentUser.id,
              is_typing: isTyping
            });
        } catch (error) {
          console.error('Error updating typing status:', error);
        }
      },

      setSearchQuery: (query) => {
        set({ searchQuery: query });
        const { channels } = get();
        const filtered = channels.filter(channel =>
          channel.name.toLowerCase().includes(query.toLowerCase()) ||
          channel.description?.toLowerCase().includes(query.toLowerCase())
        );
        set({ filteredChannels: filtered });
      },

      searchMessages: async (query) => {
        const { currentUser } = get();
        if (!currentUser) return [];

        try {
          const { data: messages, error } = await supabase
            .from('messages')
            .select(`
              *,
              sender:profiles!messages_sender_id_fkey(
                id,
                email,
                full_name,
                avatar_url,
                role
              )
            `)
            .textSearch('content', query)
            .order('created_at', { ascending: false });

          if (error) throw error;
          return messages || [];
        } catch (error) {
          console.error('Error searching messages:', error);
          return [];
        }
      },

      setupRealtimeSubscriptions: () => {
        const { currentUser } = get();
        if (!currentUser) return;

        // Subscribe to new messages
        const messagesSubscription = supabase
          .channel('messages')
          .on('postgres_changes', {
            event: 'INSERT',
            schema: 'public',
            table: 'messages'
          }, (payload) => {
            const newMessage = payload.new as Message;
            set(state => ({
              messages: {
                ...state.messages,
                [newMessage.chat_id]: [...(state.messages[newMessage.chat_id] || []), newMessage]
              }
            }));
          })
          .subscribe();

        // Subscribe to message updates
        const messageUpdatesSubscription = supabase
          .channel('message_updates')
          .on('postgres_changes', {
            event: 'UPDATE',
            schema: 'public',
            table: 'messages'
          }, (payload) => {
            const updatedMessage = payload.new as Message;
            set(state => ({
              messages: Object.fromEntries(
                Object.entries(state.messages).map(([channelId, messages]) => [
                  channelId,
                  messages.map(msg =>
                    msg.id === updatedMessage.id ? updatedMessage : msg
                  )
                ])
              )
            }));
          })
          .subscribe();

        set(state => ({
          subscriptions: new Map([
            ['messages', messagesSubscription],
            ['message_updates', messageUpdatesSubscription]
          ])
        }));
      },

      cleanupSubscriptions: () => {
        const { subscriptions } = get();
        subscriptions.forEach(subscription => {
          supabase.removeChannel(subscription);
        });
        set({ subscriptions: new Map() });
      },

      getChannelName: (channel) => channel.name,
      getChannelAvatar: (channel) => '',
      getLastMessage: (channel) => channel.last_message || null,
      getUnreadCount: (channelId) => {
        const { messages, currentUser } = get();
        const channelMessages = messages[channelId] || [];
        return channelMessages.filter(msg => 
          msg.sender_id !== currentUser?.id && 
          !msg.seen_by?.includes(currentUser?.id || '')
        ).length;
      },
      isUserOnline: (userId) => {
        const { onlineUsers } = get();
        return onlineUsers.includes(userId);
      },
      getLastSeen: (userId) => {
        const { users } = get();
        const user = users.find(u => u.id === userId);
        return user ? dayjs(user.last_seen).fromNow() : 'Unknown';
      },

      setError: (error) => set({ error }),
      clearError: () => set({ error: null })
    }),
    {
      name: 'chat-store'
    }
  )
); 