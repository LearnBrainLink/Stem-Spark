'use client';

import React, { useState, useEffect, useRef } from 'react';
import { createClient } from '@supabase/supabase-js';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
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
  Search
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
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
}

interface User {
  id: string;
  email: string;
  full_name?: string;
}

export default function CommunicationHub() {
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
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    getCurrentUser();
    fetchChannels();
    fetchUsers();
  }, []);

  useEffect(() => {
    if (selectedChannel) {
      fetchMessages(selectedChannel);
      subscribeToMessages(selectedChannel);
    }
  }, [selectedChannel]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const getCurrentUser = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    setCurrentUser(user);
  };

  const fetchChannels = async () => {
    const { data, error } = await supabase
      .from('chat_channels')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching channels:', error);
      toast({
        title: "Error",
        description: "Failed to load channels",
        variant: "destructive",
      });
    } else {
      setChannels(data || []);
      if (data && data.length > 0 && !selectedChannel) {
        setSelectedChannel(data[0].id);
      }
    }
  };

  const fetchUsers = async () => {
    const { data, error } = await supabase
      .from('profiles')
      .select('id, email, full_name')
      .order('full_name', { ascending: true });

    if (error) {
      console.error('Error fetching users:', error);
    } else {
      setUsers(data || []);
    }
  };

  const fetchMessages = async (channelId: string) => {
    const { data, error } = await supabase
      .from('chat_messages')
      .select(`
        *,
        sender:profiles(id, email, full_name)
      `)
      .eq('channel_id', channelId)
      .order('created_at', { ascending: true });

    if (error) {
      console.error('Error fetching messages:', error);
      toast({
        title: "Error",
        description: "Failed to load messages",
        variant: "destructive",
      });
    } else {
      setMessages(data || []);
    }
  };

  const subscribeToMessages = (channelId: string) => {
    const subscription = supabase
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
          if (payload.eventType === 'INSERT') {
            setMessages(prev => [...prev, payload.new as Message]);
          } else if (payload.eventType === 'UPDATE') {
            setMessages(prev => 
              prev.map(msg => 
                msg.id === payload.new.id ? payload.new as Message : msg
              )
            );
          } else if (payload.eventType === 'DELETE') {
            setMessages(prev => prev.filter(msg => msg.id !== payload.old.id));
          }
        }
      )
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  };

  const sendMessage = async () => {
    if (!newMessage.trim() || !selectedChannel || !currentUser) return;

    const { error } = await supabase
      .from('chat_messages')
      .insert({
        content: newMessage.trim(),
        sender_id: currentUser.id,
        channel_id: selectedChannel,
      });

    if (error) {
      console.error('Error sending message:', error);
      toast({
        title: "Error",
        description: "Failed to send message",
        variant: "destructive",
      });
    } else {
      setNewMessage('');
    }
  };

  const editMessage = async () => {
    if (!editingMessage || !editContent.trim()) return;

    const response = await fetch(`/api/messaging/messages/${editingMessage}/edit`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ content: editContent.trim() }),
    });

    if (response.ok) {
      setEditingMessage(null);
      setEditContent('');
      toast({
        title: "Success",
        description: "Message updated successfully",
      });
    } else {
      toast({
        title: "Error",
        description: "Failed to update message",
        variant: "destructive",
      });
    }
  };

  const deleteMessage = async (messageId: string) => {
    const response = await fetch(`/api/messaging/messages/${messageId}/delete`, {
      method: 'DELETE',
    });

    if (response.ok) {
      toast({
        title: "Success",
        description: "Message deleted successfully",
      });
    } else {
      toast({
        title: "Error",
        description: "Failed to delete message",
        variant: "destructive",
      });
    }
  };

  const forwardMessage = async () => {
    if (!forwardingMessage || (!forwardTarget.channelId && !forwardTarget.userId)) return;

    const response = await fetch(`/api/messaging/messages/${forwardingMessage.id}/forward`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        targetChannelId: forwardTarget.channelId,
        targetUserId: forwardTarget.userId,
      }),
    });

    if (response.ok) {
      setForwardDialogOpen(false);
      setForwardingMessage(null);
      setForwardTarget({});
      toast({
        title: "Success",
        description: "Message forwarded successfully",
      });
    } else {
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

  const filteredMessages = messages.filter(message =>
    message.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
    message.sender?.full_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    message.sender?.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar */}
      <div className="w-80 bg-white border-r border-gray-200 flex flex-col">
        <div className="p-4 border-b border-gray-200">
          <h1 className="text-xl font-bold text-gray-900">Communication Hub</h1>
          <p className="text-sm text-gray-600">Manage messages and channels</p>
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
            {channels.map((channel) => (
              <div
                key={channel.id}
                onClick={() => setSelectedChannel(channel.id)}
                className={`p-3 rounded-lg cursor-pointer transition-colors ${
                  selectedChannel === channel.id
                    ? 'bg-blue-50 border border-blue-200'
                    : 'hover:bg-gray-50'
                }`}
              >
                <div className="font-medium text-gray-900">{channel.name}</div>
                {channel.description && (
                  <div className="text-sm text-gray-600">{channel.description}</div>
                )}
              </div>
            ))}
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
                    {channels.find(c => c.id === selectedChannel)?.name}
                  </h2>
                  <p className="text-sm text-gray-600">
                    {messages.length} messages
                  </p>
                </div>
                <Badge variant="secondary">
                  <Users className="h-3 w-3 mr-1" />
                  Active
                </Badge>
              </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {filteredMessages.map((message) => (
                <div key={message.id} className="flex items-start space-x-3">
                  <Avatar className="h-8 w-8">
                    <AvatarImage src="" />
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
                        Edit
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => {
                        setForwardingMessage(message);
                        setForwardDialogOpen(true);
                      }}>
                        <Forward className="h-4 w-4 mr-2" />
                        Forward
                      </DropdownMenuItem>
                      <DropdownMenuItem 
                        onClick={() => deleteMessage(message.id)}
                        className="text-red-600"
                      >
                        <Trash2 className="h-4 w-4 mr-2" />
                        Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              ))}
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