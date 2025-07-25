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
  Bell
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
} from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { toast } from '@/hooks/use-toast';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

interface Message {
  id: string;
  content: string;
  sender_id: string;
  channel_id: string;
  created_at: string;
  updated_at?: string;
  message_type?: string;
  sender?: {
    id: string;
    email: string;
    full_name?: string;
  };
}

interface Channel {
  id: string;
  name: string;
  description?: string;
  created_at: string;
  is_announcement?: boolean;
}

interface User {
  id: string;
  email: string;
  full_name?: string;
}

export default function UserCommunicationHub() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [channels, setChannels] = useState<Channel[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [selectedChannel, setSelectedChannel] = useState<string>('');
  const [newMessage, setNewMessage] = useState('');
  const [editingMessage, setEditingMessage] = useState<string | null>(null);
  const [editContent, setEditContent] = useState('');
  const [forwardDialogOpen, setForwardDialogOpen] = useState(false);
  const [forwardingMessage, setForwardingMessage] = useState<Message | null>(null);
  const [forwardTarget, setForwardTarget] = useState<{ channelId?: string; userId?: string }>({});
  const [searchQuery, setSearchQuery] = useState('');
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const realtimeSubscription = useRef<any>(null);

  // Enhanced real-time messaging
  const setupRealtimeMessaging = useCallback((channelId: string) => {
    if (realtimeSubscription.current) {
      supabase.removeChannel(realtimeSubscription.current);
    }

    realtimeSubscription.current = supabase
      .channel(`messages:${channelId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'chat_messages',
          filter: `channel_id=eq.${channelId}`,
        },
        (payload) => {
          console.log('Real-time message update:', payload);
          
          if (payload.eventType === 'INSERT') {
            const newMessage = payload.new as Message;
            setMessages(prev => {
              if (prev.find(msg => msg.id === newMessage.id)) {
                return prev;
              }
              return [...prev, newMessage];
            });
          } else if (payload.eventType === 'UPDATE') {
            const updatedMessage = payload.new as Message;
            setMessages(prev => 
              prev.map(msg => 
                msg.id === updatedMessage.id ? updatedMessage : msg
              )
            );
          } else if (payload.eventType === 'DELETE') {
            const deletedMessage = payload.old as Message;
            setMessages(prev => prev.filter(msg => msg.id !== deletedMessage.id));
          }
        }
      )
      .subscribe((status) => {
        console.log('Realtime subscription status:', status);
        if (status === 'SUBSCRIBED') {
          toast({
            title: "Connected",
            description: "Real-time messaging active",
          });
        }
      });

    return realtimeSubscription.current;
  }, []);

  const getCurrentUser = async () => {
    try {
      const { data: { user }, error } = await supabase.auth.getUser();
      if (error) throw error;
      setCurrentUser(user);
    } catch (error) {
      console.error('Error getting current user:', error);
    }
  };

  const fetchChannels = async () => {
    try {
      setIsLoading(true);
      const { data, error } = await supabase
        .from('chat_channels')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      
      setChannels(data || []);
      if (data && data.length > 0 && !selectedChannel) {
        setSelectedChannel(data[0].id);
      }
    } catch (error) {
      console.error('Error fetching channels:', error);
      toast({
        title: "Error",
        description: "Failed to load channels",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const fetchUsers = async () => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('id, email, full_name')
        .order('full_name', { ascending: true });

      if (error) throw error;
      setUsers(data || []);
    } catch (error) {
      console.error('Error fetching users:', error);
    }
  };

  const fetchMessages = async (channelId: string) => {
    try {
      setIsLoading(true);
      const { data, error } = await supabase
        .from('chat_messages')
        .select(`
          *,
          sender:profiles(id, email, full_name)
        `)
        .eq('channel_id', channelId)
        .order('created_at', { ascending: true });

      if (error) throw error;
      setMessages(data || []);
      
      // Setup real-time messaging
      setupRealtimeMessaging(channelId);
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

  const sendMessage = async () => {
    if (!newMessage.trim() || !selectedChannel || !currentUser) return;

    try {
      const { error } = await supabase
        .from('chat_messages')
        .insert({
          content: newMessage.trim(),
          sender_id: currentUser.id,
          channel_id: selectedChannel,
        });

      if (error) throw error;
      setNewMessage('');
    } catch (error) {
      console.error('Error sending message:', error);
      toast({
        title: "Error",
        description: "Failed to send message",
        variant: "destructive",
      });
    }
  };

  const editMessage = async () => {
    if (!editingMessage || !editContent.trim()) return;

    try {
      const response = await fetch(`/api/messaging/messages/${editingMessage}/edit`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content: editContent.trim() }),
      });

      if (!response.ok) throw new Error('Failed to edit message');

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

  const deleteMessage = async (messageId: string) => {
    if (!confirm('Are you sure you want to delete this message?')) return;

    try {
      const response = await fetch(`/api/messaging/messages/${messageId}/delete`, {
        method: 'DELETE',
      });

      if (!response.ok) throw new Error('Failed to delete message');

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
    if (!forwardingMessage || (!forwardTarget.channelId && !forwardTarget.userId)) return;

    try {
      const response = await fetch(`/api/messaging/messages/${forwardingMessage.id}/forward`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          targetChannelId: forwardTarget.channelId,
          targetUserId: forwardTarget.userId,
        }),
      });

      if (!response.ok) throw new Error('Failed to forward message');

      setForwardDialogOpen(false);
      setForwardingMessage(null);
      setForwardTarget({});
      toast({
        title: "Success",
        description: "Message forwarded successfully",
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

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    getCurrentUser();
    fetchChannels();
    fetchUsers();
  }, []);

  useEffect(() => {
    if (selectedChannel) {
      fetchMessages(selectedChannel);
    }
  }, [selectedChannel]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Cleanup realtime subscription on unmount
  useEffect(() => {
    return () => {
      if (realtimeSubscription.current) {
        supabase.removeChannel(realtimeSubscription.current);
      }
    };
  }, []);

  const filteredMessages = messages.filter(message =>
    message.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
    message.sender?.full_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    message.sender?.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const currentChannel = channels.find(c => c.id === selectedChannel);

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar */}
      <div className="w-80 bg-white border-r border-gray-200 flex flex-col">
        <div className="p-4 border-b border-gray-200">
          <h1 className="text-xl font-bold text-gray-900">Communication Hub</h1>
          <p className="text-sm text-gray-600">Connect with your community</p>
        </div>

        {/* Search */}
        <div className="p-4 border-b border-gray-200">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              placeholder="Search messages..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        {/* Channels */}
        <div className="flex-1 overflow-y-auto">
          <div className="p-4">
            <h2 className="text-sm font-semibold text-gray-700 mb-3 flex items-center">
              <MessageCircle className="h-4 w-4 mr-2" />
              Channels
            </h2>
            {isLoading ? (
              <div className="text-center py-4">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600 mx-auto"></div>
              </div>
            ) : (
              channels.map((channel) => (
                <div
                  key={channel.id}
                  onClick={() => setSelectedChannel(channel.id)}
                  className={`p-3 rounded-lg cursor-pointer transition-colors ${
                    selectedChannel === channel.id
                      ? 'bg-blue-50 border border-blue-200'
                      : 'hover:bg-gray-50'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="font-medium text-gray-900">{channel.name}</div>
                    {channel.is_announcement && (
                      <Bell className="h-4 w-4 text-yellow-500" />
                    )}
                  </div>
                  {channel.description && (
                    <div className="text-sm text-gray-600">{channel.description}</div>
                  )}
                </div>
              ))
            )}
          </div>
        </div>

        {/* Current User */}
        <div className="p-4 border-t border-gray-200">
          <div className="flex items-center space-x-3">
            <Avatar className="h-8 w-8">
              <AvatarFallback>
                {currentUser?.email?.charAt(0) || 'U'}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-900 truncate">
                {currentUser?.email || 'Loading...'}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col">
        {selectedChannel ? (
          <>
            {/* Channel Header */}
            <div className="bg-white border-b border-gray-200 p-4">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-lg font-semibold text-gray-900">
                    {currentChannel?.name}
                  </h2>
                  <p className="text-sm text-gray-600">
                    {messages.length} messages
                  </p>
                </div>
                <div className="flex items-center space-x-2">
                  {currentChannel?.is_announcement && (
                    <Badge variant="secondary" className="flex items-center">
                      <Bell className="h-3 w-3 mr-1" />
                      Announcement
                    </Badge>
                  )}
                  <Badge variant="secondary">
                    <Users className="h-3 w-3 mr-1" />
                    Active
                  </Badge>
                </div>
              </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {isLoading ? (
                <div className="text-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                  <p className="text-gray-600 mt-2">Loading messages...</p>
                </div>
              ) : filteredMessages.length === 0 ? (
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
                filteredMessages.map((message) => (
                  <div key={message.id} className="flex items-start space-x-3">
                    <Avatar className="h-8 w-8">
                      <AvatarFallback>
                        {message.sender?.full_name?.charAt(0) || message.sender?.email?.charAt(0) || 'U'}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center space-x-2">
                        <span className="text-sm font-medium text-gray-900">
                          {message.sender?.full_name || message.sender?.email}
                        </span>
                        <span className="text-xs text-gray-500">
                          {new Date(message.created_at).toLocaleString()}
                        </span>
                        {message.updated_at && (
                          <Badge variant="outline" className="text-xs">Edited</Badge>
                        )}
                        {message.message_type === 'forwarded' && (
                          <Badge variant="outline" className="text-xs">Forwarded</Badge>
                        )}
                      </div>
                      <div className="mt-1">
                        {editingMessage === message.id ? (
                          <div className="space-y-2">
                            <Textarea
                              value={editContent}
                              onChange={(e) => setEditContent(e.target.value)}
                              className="min-h-[60px]"
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
                          <p className="text-sm text-gray-700">{message.content}</p>
                        )}
                      </div>
                    </div>
                    {message.sender_id === currentUser?.id && (
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                            <MoreVertical className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => {
                            setEditingMessage(message.id);
                            setEditContent(message.content);
                          }}>
                            <Edit className="h-4 w-4 mr-2" />
                            Edit Message
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => {
                            setForwardingMessage(message);
                            setForwardDialogOpen(true);
                          }}>
                            <Forward className="h-4 w-4 mr-2" />
                            Forward Message
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem 
                            onClick={() => deleteMessage(message.id)}
                            className="text-red-600"
                          >
                            <Trash2 className="h-4 w-4 mr-2" />
                            Delete Message
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    )}
                  </div>
                ))
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Message Input */}
            <div className="bg-white border-t border-gray-200 p-4">
              <div className="flex space-x-2">
                <Input
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  placeholder="Type your message..."
                  onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
                  className="flex-1"
                />
                <Button onClick={sendMessage} disabled={!newMessage.trim()}>
                  <Send className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center">
              <MessageCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                Select a channel
              </h3>
              <p className="text-gray-600">
                Choose a channel from the sidebar to start messaging
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Forward Message Dialog */}
      <Dialog open={forwardDialogOpen} onOpenChange={setForwardDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Forward Message</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium text-gray-700">Original Message</label>
              <div className="mt-1 p-3 bg-gray-50 rounded-md">
                <p className="text-sm text-gray-600">{forwardingMessage?.content}</p>
              </div>
            </div>
            
            <div>
              <label className="text-sm font-medium text-gray-700">Forward to Channel</label>
              <select
                className="mt-1 w-full p-2 border border-gray-300 rounded-md"
                onChange={(e) => setForwardTarget({ channelId: e.target.value, userId: undefined })}
              >
                <option value="">Select a channel</option>
                {channels.map((channel) => (
                  <option key={channel.id} value={channel.id}>
                    {channel.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-sm font-medium text-gray-700">Or Forward to User</label>
              <select
                className="mt-1 w-full p-2 border border-gray-300 rounded-md"
                onChange={(e) => setForwardTarget({ userId: e.target.value, channelId: undefined })}
              >
                <option value="">Select a user</option>
                {users.map((user) => (
                  <option key={user.id} value={user.id}>
                    {user.full_name || user.email}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex justify-end space-x-2">
              <Button variant="outline" onClick={() => setForwardDialogOpen(false)}>
                Cancel
              </Button>
              <Button 
                onClick={forwardMessage}
                disabled={!forwardTarget.channelId && !forwardTarget.userId}
              >
                Forward
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
} 