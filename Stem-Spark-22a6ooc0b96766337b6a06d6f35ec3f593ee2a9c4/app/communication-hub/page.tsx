'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { createClient } from '@supabase/supabase-js';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { 
  MoreVertical, 
  Edit, 
  Trash2, 
  Forward, 
  Send, 
  Users,
  MessageCircle,
  Search,
  Bell,
  Shield,
  AlertCircle,
  UserPlus,
  Copy,
  Reply,
  Check,
  CheckCheck,
  Phone,
  Video,
  Settings,
  Smile,
  Paperclip,
  Mic,
  Plus,
  X,
  User,
  Clock,
  Eye,
  EyeOff
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { toast } from '@/hooks/use-toast';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

interface User {
  id: string;
  email: string;
  username?: string;
  full_name?: string;
  avatar_url?: string;
  last_seen: string;
  is_online: boolean;
  role?: string;
}

interface Chat {
  id: string;
  name?: string;
  is_group: boolean;
  is_announcement: boolean;
  description?: string;
  avatar_url?: string;
  participants: string[];
  created_by: string;
  created_at: string;
  updated_at: string;
  last_message_at: string;
  last_message?: Message;
  unread_count?: number;
}

interface Message {
  id: string;
  chat_id: string;
  sender_id: string;
  content: string;
  message_type: 'text' | 'image' | 'file' | 'system';
  edited: boolean;
  edited_at?: string;
  seen_by: string[];
  forwarded_from?: string;
  reply_to?: string;
  created_at: string;
  updated_at: string;
  sender?: User;
  forwarded_message?: Message;
  reply_message?: Message;
}

interface TypingStatus {
  id: string;
  chat_id: string;
  user_id: string;
  is_typing: boolean;
  updated_at: string;
  user?: User;
}

export default function WhatsAppCommunicationHub() {
  // Main state
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [chats, setChats] = useState<Chat[]>([]);
  const [selectedChat, setSelectedChat] = useState<string>('');
  const [messages, setMessages] = useState<Message[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [typingUsers, setTypingUsers] = useState<TypingStatus[]>([]);
  
  // UI state
  const [newMessage, setNewMessage] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isConnected, setIsConnected] = useState(false);
  const [showUserInfo, setShowUserInfo] = useState(false);
  
  // Message actions state
  const [editingMessage, setEditingMessage] = useState<string | null>(null);
  const [editContent, setEditContent] = useState('');
  const [replyingTo, setReplyingTo] = useState<Message | null>(null);
  const [forwardDialogOpen, setForwardDialogOpen] = useState(false);
  const [forwardingMessage, setForwardingMessage] = useState<Message | null>(null);
  const [selectedForwardChats, setSelectedForwardChats] = useState<string[]>([]);
  
  // Dialog state
  const [newChatDialogOpen, setNewChatDialogOpen] = useState(false);
  const [newGroupDialogOpen, setNewGroupDialogOpen] = useState(false);
  const [chatInfoDialogOpen, setChatInfoDialogOpen] = useState(false);
  const [selectedUsers, setSelectedUsers] = useState<string[]>([]);
  const [groupName, setGroupName] = useState('');
  
  // Refs
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const messageInputRef = useRef<HTMLInputElement>(null);
  const realtimeSubscription = useRef<any>(null);
  const typingTimeout = useRef<NodeJS.Timeout | null>(null);
  const presenceInterval = useRef<NodeJS.Timeout | null>(null);
  const currentChatRef = useRef<string>('');
  const messageQueue = useRef<Set<string>>(new Set());

  // Helper functions
  const isAdmin = currentUser?.role === 'admin';
  
  const canSendInChat = (chat: Chat | undefined) => {
    if (!chat?.is_announcement) return true;
    return isAdmin;
  };

  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    
    if (days === 0) {
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } else if (days === 1) {
      return 'Yesterday';
    } else if (days < 7) {
      return date.toLocaleDateString([], { weekday: 'short' });
    } else {
      return date.toLocaleDateString([], { month: 'short', day: 'numeric' });
    }
  };

  const formatLastSeen = (lastSeen: string) => {
    const date = new Date(lastSeen);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const minutes = Math.floor(diff / (1000 * 60));
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    
    if (minutes < 1) return 'Just now';
    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    if (days < 7) return `${days}d ago`;
    return date.toLocaleDateString();
  };

  const getChatName = (chat: Chat) => {
    if (chat.is_group) return chat.name || 'Group Chat';
    
    // For direct chats, show the other participant's name
    const otherParticipant = chat.participants.find(p => p !== currentUser?.id);
    const otherUser = users.find(u => u.id === otherParticipant);
    return otherUser?.full_name || otherUser?.username || otherUser?.email || 'Unknown User';
  };

  const getChatAvatar = (chat: Chat) => {
    if (chat.avatar_url) return chat.avatar_url;
    if (chat.is_group) return null;
    
    const otherParticipant = chat.participants.find(p => p !== currentUser?.id);
    const otherUser = users.find(u => u.id === otherParticipant);
    return otherUser?.avatar_url;
  };

  const getMessageSeenStatus = (message: Message) => {
    if (message.sender_id === currentUser?.id) {
      const currentChat = chats.find(c => c.id === message.chat_id);
      if (!currentChat) return 'sent';
      
      const otherParticipants = currentChat.participants.filter(p => p !== currentUser?.id);
      const seenByOthers = message.seen_by.filter(id => id !== currentUser?.id);
      
      if (seenByOthers.length === otherParticipants.length) return 'seen';
      if (seenByOthers.length > 0) return 'delivered';
      return 'sent';
    }
    return 'received';
  };

  // Real-time setup
  const setupRealtimeConnection = useCallback((chatId: string) => {
    console.log('🔌 Setting up real-time connection for chat:', chatId);
    
    if (realtimeSubscription.current) {
      console.log('🧹 Cleaning up existing connection');
      supabase.removeChannel(realtimeSubscription.current);
      realtimeSubscription.current = null;
    }

    currentChatRef.current = chatId;

    realtimeSubscription.current = supabase
      .channel(`whatsapp-chat:${chatId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'messages',
          filter: `chat_id=eq.${chatId}`,
        },
        (payload) => {
          console.log('📨 New message received:', payload);
          const newMessage = payload.new as Message;
          
          if (messageQueue.current.has(newMessage.id)) {
            return;
          }
          
          messageQueue.current.add(newMessage.id);
          fetchMessageWithSender(newMessage.id);
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'messages',
          filter: `chat_id=eq.${chatId}`,
        },
        (payload) => {
          console.log('✏️ Message updated:', payload);
          const updatedMessage = payload.new as Message;
          
          setMessages(prev => 
            prev.map(msg => 
              msg.id === updatedMessage.id ? { ...msg, ...updatedMessage } : msg
            )
          );
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'DELETE',
          schema: 'public',
          table: 'messages',
          filter: `chat_id=eq.${chatId}`,
        },
        (payload) => {
          console.log('🗑️ Message deleted:', payload);
          const deletedMessage = payload.old as Message;
          
          setMessages(prev => prev.filter(msg => msg.id !== deletedMessage.id));
        }
      )
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'typing_status',
          filter: `chat_id=eq.${chatId}`,
        },
        (payload) => {
          console.log('⌨️ Typing status update:', payload);
          fetchTypingStatus(chatId);
        }
      )
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'users',
        },
        (payload) => {
          console.log('👤 User status update:', payload);
          const updatedUser = payload.new as User;
          
          setUsers(prev => 
            prev.map(user => 
              user.id === updatedUser.id ? { ...user, ...updatedUser } : user
            )
          );
        }
      )
      .subscribe((status) => {
        console.log('🔗 Connection status:', status);
        setIsConnected(status === 'SUBSCRIBED');
        
        if (status === 'SUBSCRIBED') {
          toast({
            title: "Connected",
            description: "Real-time messaging active",
          });
        } else if (status === 'CHANNEL_ERROR') {
          toast({
            title: "Connection Error",
            description: "Real-time connection failed",
            variant: "destructive",
          });
        }
      });

    return realtimeSubscription.current;
  }, []);

  // Data fetching functions
  const fetchMessageWithSender = async (messageId: string) => {
    try {
      const { data, error } = await supabase
        .from('messages')
        .select(`
          *,
          sender:users!messages_sender_id_fkey(id, email, username, full_name, avatar_url, is_online, last_seen),
          forwarded_message:messages!messages_forwarded_from_fkey(id, content, sender_id, created_at),
          reply_message:messages!messages_reply_to_fkey(id, content, sender_id, created_at)
        `)
        .eq('id', messageId)
        .single();

      if (error) throw error;

      if (data) {
        setMessages(prev => {
          const existingIndex = prev.findIndex(msg => msg.id === data.id);
          if (existingIndex >= 0) {
            const newMessages = [...prev];
            newMessages[existingIndex] = data;
            return newMessages;
          }
          return [...prev, data];
        });
        
        messageQueue.current.delete(messageId);
      }
    } catch (error) {
      console.error('Error fetching message with sender:', error);
      messageQueue.current.delete(messageId);
    }
  };

  const fetchCurrentUser = async () => {
    try {
      const { data: { user }, error: authError } = await supabase.auth.getUser();
      if (authError) throw authError;
      
      if (user) {
        // Try to get user from our users table
        let { data: userData, error: userError } = await supabase
          .from('users')
          .select('*')
          .eq('id', user.id)
          .single();

        // If user doesn't exist in our users table, create them
        if (userError && userError.code === 'PGRST116') {
          const { data: newUser, error: insertError } = await supabase
            .from('users')
            .insert({
              id: user.id,
              email: user.email!,
              full_name: user.user_metadata?.full_name,
              avatar_url: user.user_metadata?.avatar_url,
              is_online: true
            })
            .select()
            .single();

          if (insertError) {
            console.error('Error creating user:', insertError);
            return;
          }
          userData = newUser;
        } else if (userError) {
          throw userError;
        }

        setCurrentUser(userData);
        
        // Update user as online
        await supabase
          .from('users')
          .update({ is_online: true, last_seen: new Date().toISOString() })
          .eq('id', user.id);
      }
    } catch (error) {
      console.error('Error fetching current user:', error);
    }
  };

  const fetchUsers = async () => {
    try {
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .order('full_name', { ascending: true });

      if (error) throw error;
      setUsers(data || []);
    } catch (error) {
      console.error('Error fetching users:', error);
    }
  };

  const fetchChats = async () => {
    try {
      setIsLoading(true);
      const { data, error } = await supabase
        .from('chats')
        .select('*')
        .order('last_message_at', { ascending: false });

      if (error) throw error;
      
      const chatsWithLastMessage = await Promise.all(
        (data || []).map(async (chat) => {
          // Get last message
          const { data: lastMessage } = await supabase
            .from('messages')
            .select(`
              *,
              sender:users!messages_sender_id_fkey(full_name, username)
            `)
            .eq('chat_id', chat.id)
            .order('created_at', { ascending: false })
            .limit(1)
            .single();

          // Get unread count
          const { count: unreadCount } = await supabase
            .from('messages')
            .select('*', { count: 'exact', head: true })
            .eq('chat_id', chat.id)
            .neq('sender_id', currentUser?.id)
            .not('seen_by', 'cs', `{${currentUser?.id}}`);

          return {
            ...chat,
            last_message: lastMessage,
            unread_count: unreadCount || 0
          };
        })
      );
      
      setChats(chatsWithLastMessage);
      
      if (chatsWithLastMessage.length > 0 && !selectedChat) {
        setSelectedChat(chatsWithLastMessage[0].id);
      }
    } catch (error) {
      console.error('Error fetching chats:', error);
      toast({
        title: "Error",
        description: "Failed to load chats",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const fetchMessages = async (chatId: string) => {
    try {
      setIsLoading(true);
      console.log('📥 Fetching messages for chat:', chatId);
      
      const { data, error } = await supabase
        .from('messages')
        .select(`
          *,
          sender:users!messages_sender_id_fkey(id, email, username, full_name, avatar_url, is_online, last_seen),
          forwarded_message:messages!messages_forwarded_from_fkey(id, content, sender_id, created_at),
          reply_message:messages!messages_reply_to_fkey(id, content, sender_id, created_at)
        `)
        .eq('chat_id', chatId)
        .order('created_at', { ascending: true });

      if (error) throw error;
      
      console.log('📨 Fetched messages:', data);
      
      if (currentChatRef.current === chatId) {
        setMessages(data || []);
        messageQueue.current.clear();
        
        // Mark messages as seen
        if (currentUser) {
          await supabase.rpc('mark_messages_as_seen', { chat_uuid: chatId });
        }
        
        setupRealtimeConnection(chatId);
        fetchTypingStatus(chatId);
      }
    } catch (error) {
      console.error('Error fetching messages:', error);
      toast({
        title: "Error",
        description: "Failed to load messages",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const fetchTypingStatus = async (chatId: string) => {
    try {
      const { data, error } = await supabase
        .from('typing_status')
        .select(`
          *,
          user:users!typing_status_user_id_fkey(id, full_name, username)
        `)
        .eq('chat_id', chatId)
        .eq('is_typing', true)
        .neq('user_id', currentUser?.id);

      if (error) throw error;
      setTypingUsers(data || []);
    } catch (error) {
      console.error('Error fetching typing status:', error);
    }
  };

  // Message actions
  const sendMessage = async () => {
    if (!newMessage.trim() || !selectedChat || !currentUser) return;

    const currentChat = chats.find(c => c.id === selectedChat);
    
    if (!canSendInChat(currentChat)) {
      toast({
        title: "Access Denied",
        description: "Only admins can send messages in announcement channels",
        variant: "destructive",
      });
      return;
    }

    try {
      console.log('📤 Sending message');

      const optimisticMessage: Message = {
        id: `temp-${Date.now()}`,
        chat_id: selectedChat,
        sender_id: currentUser.id,
        content: newMessage.trim(),
        message_type: 'text',
        edited: false,
        seen_by: [currentUser.id],
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        sender: currentUser,
        reply_to: replyingTo?.id
      };

      setMessages(prev => [...prev, optimisticMessage]);
      setNewMessage('');
      setReplyingTo(null);

      const messageData: any = {
        chat_id: selectedChat,
        sender_id: currentUser.id,
        content: newMessage.trim(),
        message_type: 'text',
        seen_by: [currentUser.id]
      };

      if (replyingTo) {
        messageData.reply_to = replyingTo.id;
      }

      const { data, error } = await supabase
        .from('messages')
        .insert(messageData)
        .select()
        .single();

      if (error) {
        console.error('Supabase error:', error);
        setMessages(prev => prev.filter(msg => msg.id !== optimisticMessage.id));
        throw error;
      }

      // Update last message time for chat
      await supabase
        .from('chats')
        .update({ last_message_at: new Date().toISOString() })
        .eq('id', selectedChat);

      console.log('✅ Message sent successfully:', data);
      
      setMessages(prev => 
        prev.map(msg => 
          msg.id === optimisticMessage.id ? data : msg
        )
      );
      
    } catch (error) {
      console.error('Error sending message:', error);
      toast({
        title: "Error",
        description: "Failed to send message. Please try again.",
        variant: "destructive",
      });
    }
  };

  const editMessage = async () => {
    if (!editingMessage || !editContent.trim()) return;

    try {
      const { error } = await supabase
        .from('messages')
        .update({ 
          content: editContent.trim(), 
          edited: true, 
          edited_at: new Date().toISOString() 
        })
        .eq('id', editingMessage);

      if (error) throw error;

      setEditingMessage(null);
      setEditContent('');
      
      toast({
        title: "Success",
        description: "Message updated successfully",
      });
    } catch (error) {
      console.error('Error editing message:', error);
      toast({
        title: "Error",
        description: "Failed to update message",
        variant: "destructive",
      });
    }
  };

  const deleteMessage = async (messageId: string, deleteForEveryone: boolean = false) => {
    try {
      if (deleteForEveryone) {
        const { error } = await supabase
          .from('messages')
          .delete()
          .eq('id', messageId);

        if (error) throw error;
      } else {
        // Soft delete - replace content with "This message was deleted"
        const { error } = await supabase
          .from('messages')
          .update({ 
            content: 'This message was deleted',
            message_type: 'system'
          })
          .eq('id', messageId);

        if (error) throw error;
      }

      toast({
        title: "Success",
        description: "Message deleted successfully",
      });
    } catch (error) {
      console.error('Error deleting message:', error);
      toast({
        title: "Error",
        description: "Failed to delete message",
        variant: "destructive",
      });
    }
  };

  const forwardMessage = async () => {
    if (!forwardingMessage || selectedForwardChats.length === 0) return;

    try {
      for (const chatId of selectedForwardChats) {
        const { error } = await supabase
          .from('messages')
          .insert({
            chat_id: chatId,
            sender_id: currentUser?.id,
            content: forwardingMessage.content,
            message_type: forwardingMessage.message_type,
            forwarded_from: forwardingMessage.id,
            seen_by: [currentUser?.id]
          });

        if (error) throw error;

        // Update last message time for chat
        await supabase
          .from('chats')
          .update({ last_message_at: new Date().toISOString() })
          .eq('id', chatId);
      }

      setForwardDialogOpen(false);
      setForwardingMessage(null);
      setSelectedForwardChats([]);
      
      toast({
        title: "Success",
        description: `Message forwarded to ${selectedForwardChats.length} chat(s)`,
      });
    } catch (error) {
      console.error('Error forwarding message:', error);
      toast({
        title: "Error",
        description: "Failed to forward message",
        variant: "destructive",
      });
    }
  };

  const copyMessage = async (message: Message) => {
    try {
      await navigator.clipboard.writeText(message.content);
      toast({
        title: "Copied",
        description: "Message copied to clipboard",
      });
    } catch (error) {
      console.error('Error copying message:', error);
      toast({
        title: "Error",
        description: "Failed to copy message",
        variant: "destructive",
      });
    }
  };

  // Typing indicator functions
  const handleTyping = useCallback(async () => {
    if (!currentUser || !selectedChat) return;

    try {
      await supabase
        .from('typing_status')
        .upsert({
          chat_id: selectedChat,
          user_id: currentUser.id,
          is_typing: true,
          updated_at: new Date().toISOString()
        });

      if (typingTimeout.current) {
        clearTimeout(typingTimeout.current);
      }

      typingTimeout.current = setTimeout(async () => {
        await supabase
          .from('typing_status')
          .update({ is_typing: false })
          .eq('chat_id', selectedChat)
          .eq('user_id', currentUser.id);
      }, 3000);
    } catch (error) {
      console.error('Error updating typing status:', error);
    }
  }, [currentUser, selectedChat]);

  // Chat management functions
  const createDirectChat = async (userId: string) => {
    try {
      const { data, error } = await supabase.rpc('create_direct_chat', {
        other_user_id: userId
      });

      if (error) throw error;
      
      setSelectedChat(data);
      setNewChatDialogOpen(false);
      await fetchChats();
      
      toast({
        title: "Success",
        description: "Chat created successfully",
      });
    } catch (error) {
      console.error('Error creating direct chat:', error);
      toast({
        title: "Error",
        description: "Failed to create chat",
        variant: "destructive",
      });
    }
  };

  const createGroupChat = async () => {
    if (!groupName.trim() || selectedUsers.length === 0) {
      toast({
        title: "Error",
        description: "Please enter a group name and select users",
        variant: "destructive",
      });
      return;
    }

    try {
      const { data, error } = await supabase.rpc('create_group_chat', {
        chat_name: groupName.trim(),
        participant_ids: selectedUsers
      });

      if (error) throw error;
      
      setSelectedChat(data);
      setNewGroupDialogOpen(false);
      setGroupName('');
      setSelectedUsers([]);
      await fetchChats();
      
      toast({
        title: "Success",
        description: "Group chat created successfully",
      });
    } catch (error) {
      console.error('Error creating group chat:', error);
      toast({
        title: "Error",
        description: "Failed to create group chat",
        variant: "destructive",
      });
    }
  };

  // Presence management
  const updatePresence = useCallback(async () => {
    if (!currentUser) return;

    try {
      await supabase
        .from('users')
        .update({ 
          is_online: true, 
          last_seen: new Date().toISOString() 
        })
        .eq('id', currentUser.id);
    } catch (error) {
      console.error('Error updating presence:', error);
    }
  }, [currentUser]);

  // Scroll to bottom
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  // Effects
  useEffect(() => {
    fetchCurrentUser();
    fetchUsers();
    
    return () => {
      if (realtimeSubscription.current) {
        console.log('🧹 Cleaning up real-time connection on unmount');
        supabase.removeChannel(realtimeSubscription.current);
      }
      if (typingTimeout.current) {
        clearTimeout(typingTimeout.current);
      }
      if (presenceInterval.current) {
        clearInterval(presenceInterval.current);
      }
    };
  }, []);

  useEffect(() => {
    if (currentUser) {
      fetchChats();
      
      // Set up presence interval
      presenceInterval.current = setInterval(updatePresence, 30000);
      updatePresence();
    }
  }, [currentUser, updatePresence]);

  useEffect(() => {
    if (selectedChat && selectedChat !== currentChatRef.current) {
      console.log('🔄 Chat changed to:', selectedChat);
      currentChatRef.current = selectedChat;
      fetchMessages(selectedChat);
    }
  }, [selectedChat]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Filter chats and messages
  const filteredChats = chats.filter(chat =>
    getChatName(chat).toLowerCase().includes(searchQuery.toLowerCase())
  );

  const currentChat = chats.find(c => c.id === selectedChat);
  const canSendInCurrentChat = canSendInChat(currentChat);

  const getTypingText = () => {
    if (typingUsers.length === 0) return '';
    if (typingUsers.length === 1) {
      return `${typingUsers[0].user?.full_name || typingUsers[0].user?.username || 'Someone'} is typing...`;
    }
    return `${typingUsers.length} people are typing...`;
  };

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Sidebar */}
      <div className="w-80 bg-white border-r border-gray-200 flex flex-col">
        {/* Header */}
        <div className="p-4 bg-green-600 text-white">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Avatar className="h-10 w-10">
                <AvatarImage src={currentUser?.avatar_url} />
                <AvatarFallback className="bg-green-700">
                  {currentUser?.full_name?.charAt(0) || currentUser?.email?.charAt(0) || 'U'}
                </AvatarFallback>
              </Avatar>
              <div>
                <h1 className="text-lg font-semibold">
                  {currentUser?.full_name || currentUser?.username || 'User'}
                </h1>
                {isAdmin && (
                  <div className="flex items-center">
                    <Shield className="h-3 w-3 mr-1" />
                    <span className="text-xs">Admin</span>
                  </div>
                )}
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <div className={`w-2 h-2 rounded-full ${isConnected ? 'bg-green-300' : 'bg-red-300'}`}></div>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="sm" className="text-white hover:bg-green-700">
                    <MoreVertical className="h-5 w-5" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={() => setShowUserInfo(true)}>
                    <User className="h-4 w-4 mr-2" />
                    Profile
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setNewGroupDialogOpen(true)}>
                    <Users className="h-4 w-4 mr-2" />
                    New Group
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem>
                    <Settings className="h-4 w-4 mr-2" />
                    Settings
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </div>

        {/* Search */}
        <div className="p-3 border-b border-gray-200">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              placeholder="Search or start new chat"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 border-gray-300"
            />
          </div>
        </div>

        {/* New Chat Button */}
        <div className="p-3 border-b border-gray-200">
          <Button 
            onClick={() => setNewChatDialogOpen(true)}
            className="w-full bg-green-600 hover:bg-green-700"
          >
            <Plus className="h-4 w-4 mr-2" />
            New Chat
          </Button>
        </div>

        {/* Chats List */}
        <div className="flex-1 overflow-y-auto">
          {isLoading ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600 mx-auto"></div>
            </div>
          ) : filteredChats.length === 0 ? (
            <div className="text-center py-8">
              <MessageCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600">No chats yet</p>
              <p className="text-sm text-gray-500">Start a new conversation</p>
            </div>
          ) : (
            filteredChats.map((chat) => {
              const chatName = getChatName(chat);
              const chatAvatar = getChatAvatar(chat);
              const lastMessage = chat.last_message;
              
              return (
                <div
                  key={chat.id}
                  onClick={() => setSelectedChat(chat.id)}
                  className={`p-3 border-b border-gray-100 cursor-pointer hover:bg-gray-50 ${
                    selectedChat === chat.id ? 'bg-green-50 border-l-4 border-l-green-600' : ''
                  }`}
                >
                  <div className="flex items-center space-x-3">
                    <div className="relative">
                      <Avatar className="h-12 w-12">
                        <AvatarImage src={chatAvatar} />
                        <AvatarFallback className="bg-gray-300">
                          {chat.is_group ? (
                            <Users className="h-6 w-6" />
                          ) : (
                            chatName.charAt(0)
                          )}
                        </AvatarFallback>
                      </Avatar>
                      {chat.is_announcement && (
                        <Bell className="absolute -top-1 -right-1 h-4 w-4 text-yellow-500 bg-white rounded-full" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <h3 className="text-sm font-semibold text-gray-900 truncate">
                          {chatName}
                        </h3>
                        <div className="flex items-center space-x-2">
                          {lastMessage && (
                            <span className="text-xs text-gray-500">
                              {formatTime(lastMessage.created_at)}
                            </span>
                          )}
                          {chat.unread_count > 0 && (
                            <Badge className="bg-green-600 text-white text-xs min-w-[20px] h-5 flex items-center justify-center rounded-full">
                              {chat.unread_count > 99 ? '99+' : chat.unread_count}
                            </Badge>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center justify-between mt-1">
                        <p className="text-sm text-gray-600 truncate">
                          {lastMessage ? (
                            <span>
                              {lastMessage.sender_id === currentUser?.id && (
                                <span className="text-gray-500">You: </span>
                              )}
                              {lastMessage.message_type === 'system' ? (
                                <em>{lastMessage.content}</em>
                              ) : (
                                lastMessage.content
                              )}
                            </span>
                          ) : (
                            <span className="text-gray-400">No messages yet</span>
                          )}
                        </p>
                        {lastMessage && lastMessage.sender_id === currentUser?.id && (
                          <div className="flex items-center">
                            {getMessageSeenStatus(lastMessage) === 'seen' ? (
                              <CheckCheck className="h-4 w-4 text-blue-500" />
                            ) : getMessageSeenStatus(lastMessage) === 'delivered' ? (
                              <CheckCheck className="h-4 w-4 text-gray-400" />
                            ) : (
                              <Check className="h-4 w-4 text-gray-400" />
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col">
        {selectedChat ? (
          <>
            {/* Chat Header */}
            <div className="bg-white border-b border-gray-200 p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <Avatar className="h-10 w-10">
                    <AvatarImage src={getChatAvatar(currentChat!)} />
                    <AvatarFallback className="bg-gray-300">
                      {currentChat?.is_group ? (
                        <Users className="h-5 w-5" />
                      ) : (
                        getChatName(currentChat!).charAt(0)
                      )}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <h2 className="text-lg font-semibold text-gray-900 truncate">
                      {getChatName(currentChat!)}
                    </h2>
                    <div className="flex items-center space-x-2">
                      {currentChat?.is_announcement && (
                        <Badge variant="secondary" className="text-xs">
                          <Bell className="h-3 w-3 mr-1" />
                          Announcement
                        </Badge>
                      )}
                      {!canSendInCurrentChat && (
                        <Badge variant="outline" className="text-orange-600 text-xs">
                          <AlertCircle className="h-3 w-3 mr-1" />
                          Read Only
                        </Badge>
                      )}
                      <p className="text-sm text-gray-500">
                        {getTypingText() || (
                          currentChat?.is_group ? 
                            `${currentChat.participants.length} members` :
                            (() => {
                              const otherParticipant = currentChat?.participants.find(p => p !== currentUser?.id);
                              const otherUser = users.find(u => u.id === otherParticipant);
                              return otherUser?.is_online ? 'Online' : `Last seen ${formatLastSeen(otherUser?.last_seen || '')}`;
                            })()
                        )}
                      </p>
                    </div>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  {!currentChat?.is_group && (
                    <>
                      <Button variant="ghost" size="sm">
                        <Phone className="h-5 w-5" />
                      </Button>
                      <Button variant="ghost" size="sm">
                        <Video className="h-5 w-5" />
                      </Button>
                    </>
                  )}
                  <Button 
                    variant="ghost" 
                    size="sm"
                    onClick={() => setChatInfoDialogOpen(true)}
                  >
                    <MoreVertical className="h-5 w-5" />
                  </Button>
                </div>
              </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-2 bg-gray-50">
              {isLoading ? (
                <div className="text-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600 mx-auto"></div>
                  <p className="text-gray-600 mt-2">Loading messages...</p>
                </div>
              ) : messages.length === 0 ? (
                <div className="text-center py-8">
                  <MessageCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">
                    No messages yet
                  </h3>
                  <p className="text-gray-600">
                    Start the conversation by sending a message
                  </p>
                </div>
              ) : (
                messages.map((message, index) => {
                  const isOwnMessage = message.sender_id === currentUser?.id;
                  const showSender = !isOwnMessage && (
                    index === 0 || 
                    messages[index - 1].sender_id !== message.sender_id ||
                    new Date(message.created_at).getTime() - new Date(messages[index - 1].created_at).getTime() > 300000 // 5 minutes
                  );
                  
                  return (
                    <div key={message.id} className={`flex ${isOwnMessage ? 'justify-end' : 'justify-start'}`}>
                      <div className={`max-w-xs lg:max-w-md ${isOwnMessage ? 'order-1' : 'order-2'}`}>
                        {showSender && !isOwnMessage && (
                          <p className="text-xs text-gray-500 mb-1 ml-2">
                            {message.sender?.full_name || message.sender?.username || message.sender?.email}
                          </p>
                        )}
                        
                        <div className="group relative">
                          <div
                            className={`relative p-3 rounded-lg ${
                              isOwnMessage
                                ? 'bg-green-600 text-white'
                                : message.message_type === 'system'
                                ? 'bg-gray-200 text-gray-600 text-center italic'
                                : 'bg-white text-gray-900 shadow-sm border border-gray-200'
                            }`}
                          >
                            {/* Reply indicator */}
                            {message.reply_to && message.reply_message && (
                              <div className={`mb-2 p-2 border-l-4 ${
                                isOwnMessage ? 'border-green-300 bg-green-700' : 'border-gray-300 bg-gray-50'
                              } rounded text-xs`}>
                                <p className={`font-semibold ${isOwnMessage ? 'text-green-200' : 'text-gray-600'}`}>
                                  Replying to {message.reply_message.sender_id === currentUser?.id ? 'You' : 'Message'}
                                </p>
                                <p className={`${isOwnMessage ? 'text-green-200' : 'text-gray-500'} truncate`}>
                                  {message.reply_message.content}
                                </p>
                              </div>
                            )}
                            
                            {/* Forwarded indicator */}
                            {message.forwarded_from && (
                              <div className={`mb-2 flex items-center text-xs ${
                                isOwnMessage ? 'text-green-200' : 'text-gray-500'
                              }`}>
                                <Forward className="h-3 w-3 mr-1" />
                                Forwarded
                              </div>
                            )}
                            
                            {/* Message content */}
                            {editingMessage === message.id ? (
                              <div className="space-y-2">
                                <Textarea
                                  value={editContent}
                                  onChange={(e) => setEditContent(e.target.value)}
                                  className="min-h-[60px] text-sm"
                                />
                                <div className="flex space-x-2">
                                  <Button size="sm" onClick={editMessage}>
                                    Save
                                  </Button>
                                  <Button 
                                    size="sm" 
                                    variant="outline"
                                    onClick={() => {
                                      setEditingMessage(null);
                                      setEditContent('');
                                    }}
                                  >
                                    Cancel
                                  </Button>
                                </div>
                              </div>
                            ) : (
                              <p className="text-sm whitespace-pre-wrap">
                                {message.content}
                              </p>
                            )}
                            
                            {/* Message metadata */}
                            <div className={`flex items-center justify-between mt-1 text-xs ${
                              isOwnMessage ? 'text-green-200' : 'text-gray-500'
                            }`}>
                              <span>
                                {formatTime(message.created_at)}
                                {message.edited && <span className="ml-1">(edited)</span>}
                              </span>
                              {isOwnMessage && (
                                <div className="flex items-center">
                                  {message.id.startsWith('temp-') ? (
                                    <Clock className="h-3 w-3" />
                                  ) : getMessageSeenStatus(message) === 'seen' ? (
                                    <CheckCheck className="h-3 w-3 text-blue-300" />
                                  ) : getMessageSeenStatus(message) === 'delivered' ? (
                                    <CheckCheck className="h-3 w-3" />
                                  ) : (
                                    <Check className="h-3 w-3" />
                                  )}
                                </div>
                              )}
                            </div>
                          </div>
                          
                          {/* Message actions menu */}
                          {message.message_type !== 'system' && !message.id.startsWith('temp-') && (
                            <div className="absolute top-0 right-0 opacity-0 group-hover:opacity-100 transition-opacity">
                              <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                  <Button variant="ghost" size="sm" className="h-6 w-6 p-0 bg-white shadow-md">
                                    <MoreVertical className="h-3 w-3" />
                                  </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end">
                                  <DropdownMenuItem onClick={() => setReplyingTo(message)}>
                                    <Reply className="h-4 w-4 mr-2" />
                                    Reply
                                  </DropdownMenuItem>
                                  <DropdownMenuItem onClick={() => copyMessage(message)}>
                                    <Copy className="h-4 w-4 mr-2" />
                                    Copy
                                  </DropdownMenuItem>
                                  <DropdownMenuItem onClick={() => {
                                    setForwardingMessage(message);
                                    setForwardDialogOpen(true);
                                  }}>
                                    <Forward className="h-4 w-4 mr-2" />
                                    Forward
                                  </DropdownMenuItem>
                                  {message.sender_id === currentUser?.id && (
                                    <>
                                      <DropdownMenuSeparator />
                                      <DropdownMenuItem onClick={() => {
                                        setEditingMessage(message.id);
                                        setEditContent(message.content);
                                      }}>
                                        <Edit className="h-4 w-4 mr-2" />
                                        Edit
                                      </DropdownMenuItem>
                                      <DropdownMenuItem onClick={() => deleteMessage(message.id, false)}>
                                        <Trash2 className="h-4 w-4 mr-2" />
                                        Delete for me
                                      </DropdownMenuItem>
                                      <DropdownMenuItem 
                                        onClick={() => deleteMessage(message.id, true)}
                                        className="text-red-600"
                                      >
                                        <Trash2 className="h-4 w-4 mr-2" />
                                        Delete for everyone
                                      </DropdownMenuItem>
                                    </>
                                  )}
                                </DropdownMenuContent>
                              </DropdownMenu>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Message Input */}
            <div className="bg-white border-t border-gray-200 p-4">
              {/* Reply indicator */}
              {replyingTo && (
                <div className="mb-3 p-3 bg-gray-50 border-l-4 border-green-600 rounded">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-semibold text-gray-600">
                        Replying to {replyingTo.sender?.full_name || 'Message'}
                      </p>
                      <p className="text-sm text-gray-500 truncate">
                        {replyingTo.content}
                      </p>
                    </div>
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      onClick={() => setReplyingTo(null)}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              )}
              
              {!canSendInCurrentChat ? (
                <div className="flex items-center justify-center p-4 bg-orange-50 border border-orange-200 rounded-lg">
                  <AlertCircle className="h-5 w-5 text-orange-500 mr-2" />
                  <span className="text-sm text-orange-700">
                    Only admins can send messages in announcement channels
                  </span>
                </div>
              ) : (
                <div className="flex items-center space-x-2">
                  <Button variant="ghost" size="sm">
                    <Paperclip className="h-5 w-5" />
                  </Button>
                  <div className="flex-1 relative">
                    <Input
                      ref={messageInputRef}
                      value={newMessage}
                      onChange={(e) => {
                        setNewMessage(e.target.value);
                        handleTyping();
                      }}
                      placeholder="Type a message..."
                      onKeyPress={(e) => {
                        if (e.key === 'Enter' && !e.shiftKey) {
                          e.preventDefault();
                          sendMessage();
                        }
                      }}
                      className="pr-20"
                    />
                    <div className="absolute right-2 top-1/2 transform -translate-y-1/2 flex items-center space-x-1">
                      <Button variant="ghost" size="sm">
                        <Smile className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                  {newMessage.trim() ? (
                    <Button 
                      onClick={sendMessage}
                      className="bg-green-600 hover:bg-green-700"
                    >
                      <Send className="h-4 w-4" />
                    </Button>
                  ) : (
                    <Button variant="ghost" size="sm">
                      <Mic className="h-5 w-5" />
                    </Button>
                  )}
                </div>
              )}
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center bg-gray-50">
            <div className="text-center">
              <MessageCircle className="h-16 w-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-xl font-medium text-gray-900 mb-2">
                Welcome to WhatsApp-Style Chat
              </h3>
              <p className="text-gray-600 mb-4">
                Select a chat from the sidebar to start messaging
              </p>
              <Button 
                onClick={() => setNewChatDialogOpen(true)}
                className="bg-green-600 hover:bg-green-700"
              >
                <Plus className="h-4 w-4 mr-2" />
                Start New Chat
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* New Chat Dialog */}
      <Dialog open={newChatDialogOpen} onOpenChange={setNewChatDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Start New Chat</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="max-h-60 overflow-y-auto">
              {users
                .filter(user => user.id !== currentUser?.id)
                .map((user) => (
                  <div
                    key={user.id}
                    onClick={() => createDirectChat(user.id)}
                    className="flex items-center space-x-3 p-2 hover:bg-gray-50 rounded cursor-pointer"
                  >
                    <div className="relative">
                      <Avatar className="h-10 w-10">
                        <AvatarImage src={user.avatar_url} />
                        <AvatarFallback>
                          {user.full_name?.charAt(0) || user.email.charAt(0)}
                        </AvatarFallback>
                      </Avatar>
                      {user.is_online && (
                        <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-white rounded-full"></div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900">
                        {user.full_name || user.username || user.email}
                      </p>
                      <p className="text-xs text-gray-500">
                        {user.is_online ? 'Online' : `Last seen ${formatLastSeen(user.last_seen)}`}
                      </p>
                    </div>
                  </div>
                ))}
            </div>
            <div className="flex justify-end space-x-2">
              <Button variant="outline" onClick={() => setNewChatDialogOpen(false)}>
                Cancel
              </Button>
              <Button 
                onClick={() => setNewGroupDialogOpen(true)}
                className="bg-green-600 hover:bg-green-700"
              >
                Create Group
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Forward Message Dialog */}
      <Dialog open={forwardDialogOpen} onOpenChange={setForwardDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Forward Message</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="p-3 bg-gray-50 rounded border">
              <p className="text-sm text-gray-600">
                {forwardingMessage?.content}
              </p>
            </div>
            
            <div className="max-h-60 overflow-y-auto space-y-2">
              {chats.map((chat) => (
                <div
                  key={chat.id}
                  onClick={() => {
                    setSelectedForwardChats(prev => 
                      prev.includes(chat.id) 
                        ? prev.filter(id => id !== chat.id)
                        : [...prev, chat.id]
                    );
                  }}
                  className={`flex items-center space-x-3 p-2 rounded cursor-pointer ${
                    selectedForwardChats.includes(chat.id) 
                      ? 'bg-green-100 border border-green-300' 
                      : 'hover:bg-gray-50'
                  }`}
                >
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={getChatAvatar(chat)} />
                    <AvatarFallback>
                      {chat.is_group ? (
                        <Users className="h-4 w-4" />
                      ) : (
                        getChatName(chat).charAt(0)
                      )}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">
                      {getChatName(chat)}
                    </p>
                  </div>
                  {selectedForwardChats.includes(chat.id) && (
                    <Check className="h-4 w-4 text-green-600" />
                  )}
                </div>
              ))}
            </div>

            <div className="flex justify-end space-x-2">
              <Button variant="outline" onClick={() => {
                setForwardDialogOpen(false);
                setForwardingMessage(null);
                setSelectedForwardChats([]);
              }}>
                Cancel
              </Button>
              <Button 
                onClick={forwardMessage}
                disabled={selectedForwardChats.length === 0}
                className="bg-green-600 hover:bg-green-700"
              >
                Forward ({selectedForwardChats.length})
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
} 