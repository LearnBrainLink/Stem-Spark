'use client';

import { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  MessageSquare, 
  Plus, 
  Send, 
  Users, 
  Hash, 
  MoreHorizontal, 
  Search,
  Circle,
  Paperclip,
  Smile
} from 'lucide-react';

interface ChatChannel {
  id: string;
  name: string;
  description?: string;
  channel_type: string;
  created_at: string;
  message_count: number;
  members: {
    id: string;
    user: {
      id: string;
      full_name: string;
      email: string;
      avatar_url?: string;
    };
    role: string;
  }[];
}

interface ChatMessage {
  id: string;
  channel_id: string;
  sender_id: string;
  content: string;
  message_type: string;
  file_url?: string;
  created_at: string;
  sender: {
    id: string;
    full_name: string;
    email: string;
    avatar_url?: string;
  };
}

interface OnlineUser {
  id: string;
  full_name: string;
  avatar_url?: string;
  last_active: string;
}

export default function CommunicationHubPage() {
  const [channels, setChannels] = useState<ChatChannel[]>([]);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [onlineUsers, setOnlineUsers] = useState<OnlineUser[]>([]);
  const [selectedChannel, setSelectedChannel] = useState<ChatChannel | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showCreateChannel, setShowCreateChannel] = useState(false);
  const [showJoinChannel, setShowJoinChannel] = useState(false);
  const [newMessage, setNewMessage] = useState('');
  const [sending, setSending] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Form states
  const [channelForm, setChannelForm] = useState({
    name: '',
    description: '',
    channel_type: 'general'
  });

  const [joinForm, setJoinForm] = useState({
    channel_id: '',
    role: 'member'
  });

  useEffect(() => {
    fetchChannels();
  }, []);

  useEffect(() => {
    if (selectedChannel) {
      fetchMessages(selectedChannel.id);
      fetchOnlineUsers(selectedChannel.id);
    }
  }, [selectedChannel]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const fetchChannels = async () => {
    try {
      setLoading(true);
      
      const userId = 'current-user-id'; // Replace with actual user ID
      const response = await fetch(`/api/messaging/channels?type=user&user_id=${userId}`);
      const data = await response.json();

      if (data.success) {
        setChannels(data.data || []);
        if (data.data && data.data.length > 0 && !selectedChannel) {
          setSelectedChannel(data.data[0]);
        }
      }
    } catch (err) {
      setError('Failed to fetch channels');
      console.error('Error fetching channels:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchMessages = async (channelId: string) => {
    try {
      const response = await fetch(`/api/messaging/messages?channel_id=${channelId}&limit=50`);
      const data = await response.json();

      if (data.success) {
        setMessages(data.data || []);
      }
    } catch (err) {
      console.error('Error fetching messages:', err);
    }
  };

  const fetchOnlineUsers = async (channelId: string) => {
    try {
      const response = await fetch(`/api/messaging/online-users?channel_id=${channelId}`);
      const data = await response.json();

      if (data.success) {
        setOnlineUsers(data.data || []);
      }
    } catch (err) {
      console.error('Error fetching online users:', err);
    }
  };

  const handleCreateChannel = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!channelForm.name.trim()) {
      setError('Channel name is required');
      return;
    }

    try {
      setSending(true);
      setError(null);

      const userId = 'current-user-id'; // Replace with actual user ID
      
      const response = await fetch('/api/messaging/channels', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: channelForm.name.trim(),
          description: channelForm.description.trim(),
          channel_type: channelForm.channel_type,
          created_by: userId
        }),
      });

      const result = await response.json();

      if (result.success) {
        setShowCreateChannel(false);
        setChannelForm({ name: '', description: '', channel_type: 'general' });
        fetchChannels();
      } else {
        setError(result.error || 'Failed to create channel');
      }
    } catch (err) {
      setError('Failed to create channel');
      console.error('Error creating channel:', err);
    } finally {
      setSending(false);
    }
  };

  const handleJoinChannel = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!joinForm.channel_id) {
      setError('Please select a channel');
      return;
    }

    try {
      setSending(true);
      setError(null);

      const userId = 'current-user-id'; // Replace with actual user ID
      
      const response = await fetch('/api/messaging/join', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          channel_id: joinForm.channel_id,
          user_id: userId,
          role: joinForm.role
        }),
      });

      const result = await response.json();

      if (result.success) {
        setShowJoinChannel(false);
        setJoinForm({ channel_id: '', role: 'member' });
        fetchChannels();
      } else {
        setError(result.error || 'Failed to join channel');
      }
    } catch (err) {
      setError('Failed to join channel');
      console.error('Error joining channel:', err);
    } finally {
      setSending(false);
    }
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!newMessage.trim() || !selectedChannel) {
      return;
    }

    try {
      setSending(true);

      const userId = 'current-user-id'; // Replace with actual user ID
      
      const response = await fetch('/api/messaging/messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          channel_id: selectedChannel.id,
          sender_id: userId,
          content: newMessage.trim(),
          message_type: 'text'
        }),
      });

      const result = await response.json();

      if (result.success) {
        setNewMessage('');
        fetchMessages(selectedChannel.id);
      } else {
        setError(result.error || 'Failed to send message');
      }
    } catch (err) {
      setError('Failed to send message');
      console.error('Error sending message:', err);
    } finally {
      setSending(false);
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getChannelTypeColor = (channelType: string) => {
    const colors: Record<string, string> = {
      'general': 'bg-blue-100 text-blue-800',
      'tutoring': 'bg-green-100 text-green-800',
      'volunteer': 'bg-purple-100 text-purple-800',
      'announcement': 'bg-red-100 text-red-800'
    };
    return colors[channelType] || 'bg-gray-100 text-gray-800';
  };

  const filteredChannels = channels.filter(channel =>
    channel.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    channel.description?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 h-screen">
      <div className="flex h-full gap-6">
        {/* Sidebar */}
        <div className="w-80 flex flex-col">
          <div className="mb-4">
            <h1 className="text-2xl font-bold mb-2">Communication Hub</h1>
            <div className="flex gap-2">
              <Dialog open={showCreateChannel} onOpenChange={setShowCreateChannel}>
                <DialogTrigger asChild>
                  <Button size="sm" className="flex items-center gap-2">
                    <Plus className="w-4 h-4" />
                    Create Channel
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Create New Channel</DialogTitle>
                    <DialogDescription>
                      Create a new channel for team communication.
                    </DialogDescription>
                  </DialogHeader>
                  <form onSubmit={handleCreateChannel} className="space-y-4">
                    <div>
                      <Label htmlFor="channel-name">Channel Name *</Label>
                      <Input
                        id="channel-name"
                        value={channelForm.name}
                        onChange={(e) => setChannelForm({ ...channelForm, name: e.target.value })}
                        placeholder="e.g., general, math-tutoring"
                        required
                      />
                    </div>
                    
                    <div>
                      <Label htmlFor="channel-description">Description</Label>
                      <Textarea
                        id="channel-description"
                        value={channelForm.description}
                        onChange={(e) => setChannelForm({ ...channelForm, description: e.target.value })}
                        placeholder="What is this channel about?"
                        rows={3}
                      />
                    </div>

                    <div>
                      <Label htmlFor="channel-type">Channel Type</Label>
                      <Select value={channelForm.channel_type} onValueChange={(value) => setChannelForm({ ...channelForm, channel_type: value })}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="general">General</SelectItem>
                          <SelectItem value="tutoring">Tutoring</SelectItem>
                          <SelectItem value="volunteer">Volunteer</SelectItem>
                          <SelectItem value="announcement">Announcement</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    {error && (
                      <Alert>
                        <AlertDescription>{error}</AlertDescription>
                      </Alert>
                    )}

                    <div className="flex justify-end gap-2">
                      <Button type="button" variant="outline" onClick={() => setShowCreateChannel(false)}>
                        Cancel
                      </Button>
                      <Button type="submit" disabled={sending}>
                        {sending ? 'Creating...' : 'Create Channel'}
                      </Button>
                    </div>
                  </form>
                </DialogContent>
              </Dialog>

              <Dialog open={showJoinChannel} onOpenChange={setShowJoinChannel}>
                <DialogTrigger asChild>
                  <Button size="sm" variant="outline" className="flex items-center gap-2">
                    <Users className="w-4 h-4" />
                    Join Channel
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Join Channel</DialogTitle>
                    <DialogDescription>
                      Join an existing channel to start communicating.
                    </DialogDescription>
                  </DialogHeader>
                  <form onSubmit={handleJoinChannel} className="space-y-4">
                    <div>
                      <Label htmlFor="join-channel">Select Channel</Label>
                      <Select value={joinForm.channel_id} onValueChange={(value) => setJoinForm({ ...joinForm, channel_id: value })}>
                        <SelectTrigger>
                          <SelectValue placeholder="Choose a channel" />
                        </SelectTrigger>
                        <SelectContent>
                          {channels.filter(c => c.channel_type !== 'announcement').map(channel => (
                            <SelectItem key={channel.id} value={channel.id}>
                              #{channel.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    {error && (
                      <Alert>
                        <AlertDescription>{error}</AlertDescription>
                      </Alert>
                    )}

                    <div className="flex justify-end gap-2">
                      <Button type="button" variant="outline" onClick={() => setShowJoinChannel(false)}>
                        Cancel
                      </Button>
                      <Button type="submit" disabled={sending}>
                        {sending ? 'Joining...' : 'Join Channel'}
                      </Button>
                    </div>
                  </form>
                </DialogContent>
              </Dialog>
            </div>
          </div>

          {/* Search */}
          <div className="mb-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                placeholder="Search channels..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>

          {/* Channels List */}
          <div className="flex-1 overflow-y-auto">
            <div className="space-y-1">
              {filteredChannels.map((channel) => (
                <div
                  key={channel.id}
                  onClick={() => setSelectedChannel(channel)}
                  className={`flex items-center gap-3 p-3 rounded-lg cursor-pointer transition-colors ${
                    selectedChannel?.id === channel.id
                      ? 'bg-blue-100 text-blue-900'
                      : 'hover:bg-gray-100'
                  }`}
                >
                  <div className="flex-shrink-0">
                    <Hash className="w-5 h-5 text-gray-500" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-medium truncate">{channel.name}</span>
                      <Badge className={getChannelTypeColor(channel.channel_type)}>
                        {channel.channel_type}
                      </Badge>
                    </div>
                    <p className="text-sm text-gray-500 truncate">
                      {channel.message_count} messages
                    </p>
                  </div>
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
              <div className="flex items-center justify-between p-4 border-b">
                <div className="flex items-center gap-3">
                  <Hash className="w-6 h-6 text-gray-500" />
                  <div>
                    <h2 className="text-xl font-semibold">{selectedChannel.name}</h2>
                    <p className="text-sm text-gray-500">
                      {selectedChannel.description || 'No description'}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Badge className={getChannelTypeColor(selectedChannel.channel_type)}>
                    {selectedChannel.channel_type}
                  </Badge>
                  <Button size="sm" variant="outline">
                    <MoreHorizontal className="w-4 h-4" />
                  </Button>
                </div>
              </div>

              {/* Messages */}
              <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {messages.length === 0 ? (
                  <div className="flex flex-col items-center justify-center h-full text-gray-500">
                    <MessageSquare className="w-12 h-12 mb-4" />
                    <p>No messages yet</p>
                    <p className="text-sm">Start the conversation!</p>
                  </div>
                ) : (
                  messages.map((message) => (
                    <div key={message.id} className="flex gap-3">
                      <div className="flex-shrink-0">
                        <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
                          <span className="text-sm font-medium text-blue-600">
                            {message.sender.full_name.charAt(0).toUpperCase()}
                          </span>
                        </div>
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-medium">{message.sender.full_name}</span>
                          <span className="text-sm text-gray-500">
                            {formatDate(message.created_at)}
                          </span>
                        </div>
                        <p className="text-gray-900">{message.content}</p>
                      </div>
                    </div>
                  ))
                )}
                <div ref={messagesEndRef} />
              </div>

              {/* Message Input */}
              <div className="p-4 border-t">
                <form onSubmit={handleSendMessage} className="flex gap-2">
                  <div className="flex-1 relative">
                    <Input
                      value={newMessage}
                      onChange={(e) => setNewMessage(e.target.value)}
                      placeholder="Type a message..."
                      disabled={sending}
                    />
                    <div className="absolute right-2 top-1/2 transform -translate-y-1/2 flex gap-1">
                      <Button type="button" size="sm" variant="ghost">
                        <Paperclip className="w-4 h-4" />
                      </Button>
                      <Button type="button" size="sm" variant="ghost">
                        <Smile className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                  <Button type="submit" disabled={sending || !newMessage.trim()}>
                    <Send className="w-4 h-4" />
                  </Button>
                </form>
              </div>
            </>
          ) : (
            <div className="flex items-center justify-center h-full text-gray-500">
              <div className="text-center">
                <MessageSquare className="w-16 h-16 mx-auto mb-4" />
                <h3 className="text-lg font-medium mb-2">Select a Channel</h3>
                <p>Choose a channel from the sidebar to start messaging</p>
              </div>
            </div>
          )}
        </div>

        {/* Online Users Sidebar */}
        {selectedChannel && (
          <div className="w-64 border-l">
            <div className="p-4 border-b">
              <h3 className="font-semibold">Online Users</h3>
              <p className="text-sm text-gray-500">{onlineUsers.length} online</p>
            </div>
            <div className="p-4 space-y-3">
              {onlineUsers.map((user) => (
                <div key={user.id} className="flex items-center gap-3">
                  <div className="relative">
                    <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center">
                      <span className="text-sm font-medium text-blue-600">
                        {user.full_name.charAt(0).toUpperCase()}
                      </span>
                    </div>
                    <Circle className="w-3 h-3 text-green-500 absolute -bottom-1 -right-1 fill-current" />
                  </div>
                  <div>
                    <p className="font-medium text-sm">{user.full_name}</p>
                    <p className="text-xs text-gray-500">Online</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
} 