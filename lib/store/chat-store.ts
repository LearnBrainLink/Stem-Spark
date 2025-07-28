import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import { supabase } from '@/lib/supabase/client';
import { v4 as uuidv4 } from 'uuid';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';

dayjs.extend(relativeTime);

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

export interface Chat {
  id: string;
  name?: string;
  is_group: boolean;
  is_announcement: boolean;
  description?: string;
  avatar_url?: string;
  participants: string[];
  created_by?: string;
  created_at: string;
  updated_at: string;
  last_message_at: string;
  last_message_id?: string;
  last_message?: Message;
  unread_count?: number;
  participant_details?: User[];
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

  // Chats
  chats: Chat[];
  selectedChatId: string | null;
  selectedChat: Chat | null;
  
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
  filteredChats: Chat[];
  
  // Message actions
  editingMessage: string | null;
  replyingTo: Message | null;
  forwardingMessage: Message | null;
  selectedMessages: string[];
  
  // Real-time subscriptions
  subscriptions: Map<string, any>;
  
  // Actions
  setCurrentUser: (user: User | null) => void;
  setAuthenticated: (isAuth: boolean) => void;
  
  // Chat actions
  loadChats: () => Promise<void>;
  selectChat: (chatId: string) => void;
  createDirectChat: (userId: string) => Promise<string | null>;
  createGroupChat: (name: string, participantIds: string[], isAnnouncement?: boolean) => Promise<string | null>;
  
  // Message actions
  loadMessages: (chatId: string) => Promise<void>;
  sendMessage: (chatId: string, content: string, type?: string) => Promise<void>;
  editMessage: (messageId: string, content: string) => Promise<void>;
  deleteMessage: (messageId: string, deleteForEveryone?: boolean) => Promise<void>;
  forwardMessage: (messageId: string, chatIds: string[]) => Promise<void>;
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
  updateTypingStatus: (chatId: string, isTyping: boolean) => Promise<void>;
  
  // Search
  setSearchQuery: (query: string) => void;
  searchMessages: (query: string) => Promise<Message[]>;
  
  // Real-time subscriptions
  setupRealtimeSubscriptions: () => void;
  cleanupSubscriptions: () => void;
  
  // Utility
  getChatName: (chat: Chat) => string;
  getChatAvatar: (chat: Chat) => string;
  getLastMessage: (chat: Chat) => Message | null;
  getUnreadCount: (chatId: string) => number;
  isUserOnline: (userId: string) => boolean;
  getLastSeen: (userId: string) => string;
  
  // Error handling
  setError: (error: string | null) => void;
  clearError: () => void;
}

export const useChatStore = create<ChatState>()(
  devtools(
    (set, get) => ({
      // Initial state
      currentUser: null,
      isAuthenticated: false,
      chats: [],
      selectedChatId: null,
      selectedChat: null,
      messages: {},
      loadingMessages: {},
      users: [],
      onlineUsers: [],
      typingUsers: [],
      isLoading: false,
      error: null,
      searchQuery: '',
      filteredChats: [],
      editingMessage: null,
      replyingTo: null,
      forwardingMessage: null,
      selectedMessages: [],
      subscriptions: new Map(),

      // Actions
      setCurrentUser: (user) => {
        set({ currentUser: user });
        if (user) {
          get().updatePresence(true);
          get().setupRealtimeSubscriptions();
        }
      },

      setAuthenticated: (isAuth) => set({ isAuthenticated: isAuth }),

      // Chat actions
      loadChats: async () => {
        try {
          set({ isLoading: true, error: null });
          
          const { data: chatsData, error: chatsError } = await supabase
            .from('chats')
            .select(`
              *,
              last_message:messages!chats_last_message_id_fkey(
                id,
                content,
                sender_id,
                message_type,
                created_at,
                sender:users!messages_sender_id_fkey(
                  id,
                  full_name,
                  username,
                  avatar_url
                )
              )
            `)
            .order('last_message_at', { ascending: false });

          if (chatsError) throw chatsError;

          // Get participant details for each chat
          const chatsWithParticipants = await Promise.all(
            (chatsData || []).map(async (chat) => {
              const { data: participantData } = await supabase
                .from('users')
                .select('id, full_name, username, avatar_url, is_online, last_seen, role')
                .in('id', chat.participants);

              return {
                ...chat,
                participant_details: participantData || [],
                unread_count: await get().getUnreadCount(chat.id)
              };
            })
          );

          set({ 
            chats: chatsWithParticipants,
            filteredChats: chatsWithParticipants,
            isLoading: false 
          });
        } catch (error) {
          console.error('Error loading chats:', error);
          set({ error: 'Failed to load chats', isLoading: false });
        }
      },

      selectChat: (chatId) => {
        const chat = get().chats.find(c => c.id === chatId);
        set({ 
          selectedChatId: chatId, 
          selectedChat: chat || null,
          editingMessage: null,
          replyingTo: null,
          selectedMessages: []
        });
        
        if (chatId) {
          get().loadMessages(chatId);
        }
      },

      createDirectChat: async (userId) => {
        try {
          const currentUser = get().currentUser;
          if (!currentUser) return null;

          const { data, error } = await supabase.rpc('create_direct_chat', {
            user1_uuid: currentUser.id,
            user2_uuid: userId
          });

          if (error) throw error;

          await get().loadChats();
          return data;
        } catch (error) {
          console.error('Error creating direct chat:', error);
          set({ error: 'Failed to create chat' });
          return null;
        }
      },

      createGroupChat: async (name, participantIds, isAnnouncement = false) => {
        try {
          const currentUser = get().currentUser;
          if (!currentUser) return null;

          const { data, error } = await supabase.rpc('create_group_chat', {
            chat_name: name,
            creator_uuid: currentUser.id,
            participant_uuids: participantIds,
            is_announcement_chat: isAnnouncement
          });

          if (error) throw error;

          await get().loadChats();
          return data;
        } catch (error) {
          console.error('Error creating group chat:', error);
          set({ error: 'Failed to create group chat' });
          return null;
        }
      },

      // Message actions
      loadMessages: async (chatId) => {
        try {
          set(state => ({
            loadingMessages: { ...state.loadingMessages, [chatId]: true }
          }));

          const { data, error } = await supabase
            .from('messages')
            .select(`
              *,
              sender:users!messages_sender_id_fkey(
                id,
                full_name,
                username,
                avatar_url,
                role
              ),
              original_message:messages!messages_forwarded_from_fkey(
                id,
                content,
                sender_id,
                created_at,
                sender:users!messages_sender_id_fkey(
                  id,
                  full_name,
                  username
                )
              ),
              reply_message:messages!messages_reply_to_fkey(
                id,
                content,
                sender_id,
                created_at,
                sender:users!messages_sender_id_fkey(
                  id,
                  full_name,
                  username
                )
              )
            `)
            .eq('chat_id', chatId)
            .order('created_at', { ascending: true });

          if (error) throw error;

          set(state => ({
            messages: { ...state.messages, [chatId]: data || [] },
            loadingMessages: { ...state.loadingMessages, [chatId]: false }
          }));

          // Mark messages as seen
          const currentUser = get().currentUser;
          if (currentUser && data) {
            const unseenMessages = data.filter(msg => 
              msg.sender_id !== currentUser.id && 
              !msg.seen_by.includes(currentUser.id)
            );
            
            for (const message of unseenMessages) {
              await get().markMessageSeen(message.id);
            }
          }
        } catch (error) {
          console.error('Error loading messages:', error);
          set(state => ({
            loadingMessages: { ...state.loadingMessages, [chatId]: false },
            error: 'Failed to load messages'
          }));
        }
      },

      sendMessage: async (chatId, content, type = 'text') => {
        try {
          const currentUser = get().currentUser;
          const replyingTo = get().replyingTo;
          
          if (!currentUser) return;

          // Optimistic update
          const optimisticMessage: Message = {
            id: `temp-${uuidv4()}`,
            chat_id: chatId,
            sender_id: currentUser.id,
            content,
            message_type: type as any,
            edited: false,
            seen_by: [currentUser.id],
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
            deleted_for_everyone: false,
            deleted_for_sender: false,
            reply_to: replyingTo?.id,
            sender: currentUser,
            reply_message: replyingTo || undefined
          };

          set(state => ({
            messages: {
              ...state.messages,
              [chatId]: [...(state.messages[chatId] || []), optimisticMessage]
            },
            replyingTo: null
          }));

          const { data, error } = await supabase
            .from('messages')
            .insert({
              chat_id: chatId,
              sender_id: currentUser.id,
              content,
              message_type: type,
              reply_to: replyingTo?.id
            })
            .select(`
              *,
              sender:users!messages_sender_id_fkey(
                id,
                full_name,
                username,
                avatar_url,
                role
              )
            `)
            .single();

          if (error) throw error;

          // Replace optimistic message with real one
          set(state => ({
            messages: {
              ...state.messages,
              [chatId]: state.messages[chatId]?.map(msg => 
                msg.id === optimisticMessage.id ? data : msg
              ) || []
            }
          }));

          // Stop typing
          await get().updateTypingStatus(chatId, false);
          
        } catch (error) {
          console.error('Error sending message:', error);
          // Remove optimistic message on error
          set(state => ({
            messages: {
              ...state.messages,
              [chatId]: state.messages[chatId]?.filter(msg => 
                !msg.id.startsWith('temp-')
              ) || []
            },
            error: 'Failed to send message'
          }));
        }
      },

      editMessage: async (messageId, content) => {
        try {
          const { error } = await supabase
            .from('messages')
            .update({ 
              content, 
              edited: true, 
              edited_at: new Date().toISOString() 
            })
            .eq('id', messageId);

          if (error) throw error;

          set({ editingMessage: null });
        } catch (error) {
          console.error('Error editing message:', error);
          set({ error: 'Failed to edit message' });
        }
      },

      deleteMessage: async (messageId, deleteForEveryone = false) => {
        try {
          const updateData = deleteForEveryone 
            ? { deleted_for_everyone: true }
            : { deleted_for_sender: true };

          const { error } = await supabase
            .from('messages')
            .update(updateData)
            .eq('id', messageId);

          if (error) throw error;
        } catch (error) {
          console.error('Error deleting message:', error);
          set({ error: 'Failed to delete message' });
        }
      },

      forwardMessage: async (messageId, chatIds) => {
        try {
          const message = Object.values(get().messages)
            .flat()
            .find(m => m.id === messageId);
          
          if (!message) return;

          for (const chatId of chatIds) {
            await get().sendMessage(chatId, message.content, 'forwarded');
          }

          set({ forwardingMessage: null });
        } catch (error) {
          console.error('Error forwarding message:', error);
          set({ error: 'Failed to forward message' });
        }
      },

      markMessageSeen: async (messageId) => {
        try {
          const currentUser = get().currentUser;
          if (!currentUser) return;

          const { error } = await supabase.rpc('mark_message_seen', {
            message_uuid: messageId,
            user_uuid: currentUser.id
          });

          if (error) throw error;
        } catch (error) {
          console.error('Error marking message as seen:', error);
        }
      },

      reactToMessage: async (messageId, emoji) => {
        try {
          const currentUser = get().currentUser;
          if (!currentUser) return;

          // Get current message
          const message = Object.values(get().messages)
            .flat()
            .find(m => m.id === messageId);
          
          if (!message) return;

          const reactions = message.reactions || {};
          const emojiReactions = reactions[emoji] || [];
          
          // Toggle reaction
          const newReactions = emojiReactions.includes(currentUser.id)
            ? emojiReactions.filter(id => id !== currentUser.id)
            : [...emojiReactions, currentUser.id];

          const updatedReactions = { ...reactions };
          if (newReactions.length === 0) {
            delete updatedReactions[emoji];
          } else {
            updatedReactions[emoji] = newReactions;
          }

          const { error } = await supabase
            .from('messages')
            .update({ reactions: updatedReactions })
            .eq('id', messageId);

          if (error) throw error;
        } catch (error) {
          console.error('Error reacting to message:', error);
          set({ error: 'Failed to react to message' });
        }
      },

      // Message selection
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

      // Presence and typing
      updatePresence: async (isOnline) => {
        try {
          const currentUser = get().currentUser;
          if (!currentUser) return;

          const { error } = await supabase.rpc('update_user_presence', {
            user_uuid: currentUser.id,
            online_status: isOnline
          });

          if (error) throw error;
        } catch (error) {
          console.error('Error updating presence:', error);
        }
      },

      updateTypingStatus: async (chatId, isTyping) => {
        try {
          const currentUser = get().currentUser;
          if (!currentUser) return;

          const { error } = await supabase.rpc('update_typing_status', {
            chat_uuid: chatId,
            user_uuid: currentUser.id,
            is_typing_status: isTyping
          });

          if (error) throw error;
        } catch (error) {
          console.error('Error updating typing status:', error);
        }
      },

      // Search
      setSearchQuery: (query) => {
        set({ searchQuery: query });
        const chats = get().chats;
        
        if (!query.trim()) {
          set({ filteredChats: chats });
          return;
        }

        const filtered = chats.filter(chat => {
          const chatName = get().getChatName(chat).toLowerCase();
          return chatName.includes(query.toLowerCase());
        });

        set({ filteredChats: filtered });
      },

      searchMessages: async (query) => {
        try {
          const { data, error } = await supabase
            .from('messages')
            .select(`
              *,
              sender:users!messages_sender_id_fkey(
                id,
                full_name,
                username,
                avatar_url
              )
            `)
            .textSearch('content', query)
            .order('created_at', { ascending: false })
            .limit(50);

          if (error) throw error;
          return data || [];
        } catch (error) {
          console.error('Error searching messages:', error);
          return [];
        }
      },

      // Real-time subscriptions
      setupRealtimeSubscriptions: () => {
        const currentUser = get().currentUser;
        if (!currentUser) return;

        get().cleanupSubscriptions();

        // Subscribe to presence updates
        const presenceChannel = supabase
          .channel('user_presence')
          .on(
            'postgres_changes',
            { event: '*', schema: 'public', table: 'user_presence' },
            (payload) => {
              console.log('Presence update:', payload);
              // Update online users
              if (payload.eventType === 'UPDATE') {
                const presence = payload.new as any;
                set(state => ({
                  onlineUsers: presence.is_online 
                    ? [...state.onlineUsers.filter(id => id !== presence.user_id), presence.user_id]
                    : state.onlineUsers.filter(id => id !== presence.user_id)
                }));
              }
            }
          )
          .subscribe();

        // Subscribe to typing status
        const typingChannel = supabase
          .channel('typing_status')
          .on(
            'postgres_changes',
            { event: '*', schema: 'public', table: 'typing_status' },
            async (payload) => {
              console.log('Typing update:', payload);
              
              if (payload.eventType === 'UPDATE' || payload.eventType === 'INSERT') {
                const typing = payload.new as any;
                
                if (typing.is_typing && typing.user_id !== currentUser.id) {
                  // Get user details
                  const { data: userData } = await supabase
                    .from('users')
                    .select('*')
                    .eq('id', typing.user_id)
                    .single();

                  if (userData) {
                    set(state => ({
                      typingUsers: [
                        ...state.typingUsers.filter(t => 
                          t.user_id !== typing.user_id || t.chat_id !== typing.chat_id
                        ),
                        {
                          user_id: typing.user_id,
                          user: userData,
                          chat_id: typing.chat_id,
                          updated_at: typing.updated_at
                        }
                      ]
                    }));
                  }
                } else {
                  // Remove typing user
                  set(state => ({
                    typingUsers: state.typingUsers.filter(t => 
                      t.user_id !== typing.user_id || t.chat_id !== typing.chat_id
                    )
                  }));
                }
              }
            }
          )
          .subscribe();

        // Subscribe to message updates
        const messagesChannel = supabase
          .channel('messages')
          .on(
            'postgres_changes',
            { event: '*', schema: 'public', table: 'messages' },
            async (payload) => {
              console.log('Message update:', payload);
              
              if (payload.eventType === 'INSERT') {
                const newMessage = payload.new as any;
                
                // Get full message with sender info
                const { data: fullMessage } = await supabase
                  .from('messages')
                  .select(`
                    *,
                    sender:users!messages_sender_id_fkey(
                      id,
                      full_name,
                      username,
                      avatar_url,
                      role
                    )
                  `)
                  .eq('id', newMessage.id)
                  .single();

                if (fullMessage) {
                  set(state => ({
                    messages: {
                      ...state.messages,
                      [newMessage.chat_id]: [
                        ...(state.messages[newMessage.chat_id] || []).filter(m => 
                          !m.id.startsWith('temp-')
                        ),
                        fullMessage
                      ]
                    }
                  }));
                }
              } else if (payload.eventType === 'UPDATE') {
                const updatedMessage = payload.new as any;
                
                set(state => ({
                  messages: {
                    ...state.messages,
                    [updatedMessage.chat_id]: (state.messages[updatedMessage.chat_id] || [])
                      .map(msg => msg.id === updatedMessage.id ? { ...msg, ...updatedMessage } : msg)
                  }
                }));
              }
            }
          )
          .subscribe();

        get().subscriptions.set('presence', presenceChannel);
        get().subscriptions.set('typing', typingChannel);
        get().subscriptions.set('messages', messagesChannel);
      },

      cleanupSubscriptions: () => {
        const subscriptions = get().subscriptions;
        subscriptions.forEach((channel) => {
          supabase.removeChannel(channel);
        });
        subscriptions.clear();
      },

      // Utility functions
      getChatName: (chat) => {
        const currentUser = get().currentUser;
        if (!currentUser) return chat.name || 'Unknown';

        if (chat.name) return chat.name;

        if (chat.is_group) {
          return chat.participant_details
            ?.filter(p => p.id !== currentUser.id)
            .map(p => p.full_name || p.username || p.email)
            .join(', ') || 'Group Chat';
        }

        const otherParticipant = chat.participant_details?.find(p => p.id !== currentUser.id);
        return otherParticipant?.full_name || otherParticipant?.username || otherParticipant?.email || 'Unknown User';
      },

      getChatAvatar: (chat) => {
        const currentUser = get().currentUser;
        
        if (chat.avatar_url) return chat.avatar_url;
        
        if (!chat.is_group) {
          const otherParticipant = chat.participant_details?.find(p => p.id !== currentUser?.id);
          return otherParticipant?.avatar_url || '';
        }
        
        return '';
      },

      getLastMessage: (chat) => {
        return chat.last_message || null;
      },

      getUnreadCount: async (chatId) => {
        try {
          const currentUser = get().currentUser;
          if (!currentUser) return 0;

          const { data, error } = await supabase.rpc('get_unread_count', {
            chat_uuid: chatId,
            user_uuid: currentUser.id
          });

          if (error) throw error;
          return data || 0;
        } catch (error) {
          console.error('Error getting unread count:', error);
          return 0;
        }
      },

      isUserOnline: (userId) => {
        return get().onlineUsers.includes(userId);
      },

      getLastSeen: (userId) => {
        const user = get().users.find(u => u.id === userId);
        if (!user?.last_seen) return 'Never';
        
        const lastSeen = dayjs(user.last_seen);
        const now = dayjs();
        
        if (now.diff(lastSeen, 'minute') < 5) return 'Just now';
        if (now.diff(lastSeen, 'hour') < 1) return lastSeen.fromNow();
        if (now.diff(lastSeen, 'day') < 1) return `Last seen ${lastSeen.format('HH:mm')}`;
        if (now.diff(lastSeen, 'week') < 1) return `Last seen ${lastSeen.format('ddd HH:mm')}`;
        
        return `Last seen ${lastSeen.format('MMM DD')}`;
      },

      // Error handling
      setError: (error) => set({ error }),
      clearError: () => set({ error: null }),
    }),
    {
      name: 'chat-store',
      partialize: (state) => ({
        // Only persist essential data
        currentUser: state.currentUser,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
); 