'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { supabase } from '@/lib/supabase/client'
import Link from 'next/link'
import Image from 'next/image'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { 
  MessageSquare, 
  Send,
  Users,
  Hash,
  Bell,
  Search,
  Plus,
  ArrowRight,
  X,
  CheckCircle,
  Trash2,
  Shield,
  UserX,
  UserCheck,
  AlertTriangle,
  ArrowLeft,
  Image as ImageIcon,
  Paperclip,
  Edit,
  Forward,
  MoreVertical,
  Smile,
  Reply,
  Eye,
  EyeOff
} from 'lucide-react'

interface Message {
  id: string
  content: string
  sender_id: string
  sender_name: string
  channel_id: string
  created_at: string
  message_type: 'text' | 'file' | 'image' | 'system'
  file_url?: string
  image_url?: string
  image_caption?: string
  file_name?: string
  file_size?: number
  file_type?: string
  edited_at?: string
  edited_by?: string
  reply_to_id?: string
  reply_to?: { content: string; profiles: { full_name: string } }
  forwarded_from_id?: string
  forwarded_from?: { content: string; profiles: { full_name: string } }
  is_deleted?: boolean
  reactions?: Record<string, string[]>
  read_by?: string[]
  sender?: { // Added for consistency
    full_name: string
    avatar_url?: string
  }
}

interface Channel {
  id: string
  name: string
  description: string
  channel_type: 'public' | 'private' | 'group' | 'announcement'
  created_by: string
  created_at: string
  member_count: number
  group_role?: string
}

interface User {
  id: string
  full_name: string
  email: string
  role: string
  avatar_url?: string
}

export default function AdminCommunicationHub() {
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [channels, setChannels] = useState<Channel[]>([])
  const [messages, setMessages] = useState<Message[]>([])
  const [selectedChannel, setSelectedChannel] = useState<Channel | null>(null)
  const [newMessage, setNewMessage] = useState('')
  const [users, setUsers] = useState<User[]>([])
  const [unreadCounts, setUnreadCounts] = useState<{[key: string]: number}>({})
  const [showCreateDialog, setShowCreateDialog] = useState(false)
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)
  const [channelToDelete, setChannelToDelete] = useState<Channel | null>(null)
  const [newChannelData, setNewChannelData] = useState({
    name: '',
    description: '',
    channel_type: 'public' as const,
    selectedUsers: [] as string[]
  })
  const [userRole, setUserRole] = useState<string>('')
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedChannelType, setSelectedChannelType] = useState('all')
  const subscriptionRef = useRef<any>(null)
  
  // New state for enhanced features
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [uploading, setUploading] = useState(false)
  const [editingMessage, setEditingMessage] = useState<Message | null>(null)
  const [replyToMessage, setReplyToMessage] = useState<Message | null>(null)
  const [showForwardDialog, setShowForwardDialog] = useState(false)
  const [forwardingMessage, setForwardingMessage] = useState<Message | null>(null)
  const [targetChannelId, setTargetChannelId] = useState('')
  const [showReactions, setShowReactions] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const imageInputRef = useRef<HTMLInputElement>(null)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const handleDebugCreateChannel = async () => {
    if (!user) {
      alert('You must be logged in to perform this action.');
      return;
    }
  
    try {
      const response = await fetch('/api/admin/debug/create-channel-as-admin', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...newChannelData,
          user_id: user.id,
        }),
      });
  
      const result = await response.json();
  
      if (!response.ok) {
        throw new Error(result.error || 'An unknown error occurred');
      }
  
      alert('Debug channel created successfully!');
      await loadChannels();
      setShowCreateDialog(false);
    } catch (error: any) {
      alert(`Debug channel creation failed: ${error.message}`);
      console.error(error);
    }
  };

  useEffect(() => {
    checkAuthAndLoadData()

    // Cleanup subscription on unmount
    return () => {
      if (subscriptionRef.current) {
        subscriptionRef.current.unsubscribe()
      }
    }
  }, [])

  useEffect(() => {
    // This effect handles URL persistence and ensures a channel is selected when channels load.
    if (channels.length === 0 || selectedChannel) return;

    if (typeof window !== 'undefined') {
      const urlParams = new URLSearchParams(window.location.search);
      const channelIdFromUrl = urlParams.get('channel');
      
      const channelToSelect = channelIdFromUrl 
        ? channels.find(c => c.id === channelIdFromUrl)
        : channels[0];
      
      if (channelToSelect) {
        setSelectedChannel(channelToSelect);
      }
    }
  }, [channels, selectedChannel]);


  useEffect(() => {
    // This effect manages subscriptions and loads messages when the selectedChannel changes.
    // It's crucial that this is separate from the channel initialization logic.
    if (!selectedChannel) return;
    
    // Update URL
    if (typeof window !== 'undefined') {
      const url = new URL(window.location.href);
      url.searchParams.set('channel', selectedChannel.id);
      window.history.replaceState({ path: url.href }, '', url.href);
    }

    // Unsubscribe from the previous channel before subscribing to a new one
    if (subscriptionRef.current) {
      subscriptionRef.current.unsubscribe();
    }
    
    // Load messages for the new channel
    loadMessages(selectedChannel.id);
    
    // Subscribe to new messages for the selected channel
    const subscription = subscribeToMessages(selectedChannel.id);
    subscriptionRef.current = subscription;

  }, [selectedChannel?.id]); // Depend only on the ID to avoid re-running due to object reference changes

  const checkAuthAndLoadData = async () => {
    try {
      const { data: { user: authUser }, error: authError } = await supabase.auth.getUser()
      
      if (authError || !authUser) {
        window.location.href = '/login'
        return
      }
      
      // Load user profile and then all other data
      await loadUserProfile(authUser.id);
      await loadCommunicationData(authUser.id);
    } catch (error) {
      console.error('Error in checkAuthAndLoadData:', error)
    } finally {
      setLoading(false)
    }
  }

  const loadUserProfile = async (userId: string) => {
    try {
      const { data: profile, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single()

      if (error) {
        console.error('Error loading profile:', error)
        throw error;
      }

      setUser(profile)
      setUserRole(profile.role || '')
    } catch (error) {
      console.error('Error in loadUserProfile:', error)
    }
  }

  const loadCommunicationData = async (userId: string) => {
    try {
      await Promise.all([
        loadChannels(),
        loadUsers(),
        loadUnreadCounts(userId)
      ])
    } catch (error) {
      console.error('Error loading communication data:', error)
    }
  }

  const loadChannels = async () => {
    try {
      const { data: channelData, error: channelError } = await supabase
        .from('chat_channels')
        .select('*')
        .order('created_at', { ascending: false })

      if (channelError) {
        throw channelError;
      }
      
      if (channelData) {
        const channelsWithMemberCount = await Promise.all(
          channelData.map(async (channel) => {
            const { count } = await supabase
              .from('chat_channel_members')
              .select('*', { count: 'exact', head: true })
              .eq('channel_id', channel.id)
            
            return {
              ...channel,
              member_count: count || 0
            }
          })
        )
        setChannels(channelsWithMemberCount);
      }
    } catch (error) {
      console.error('Error loading channels:', error)
    }
  }

  const loadUsers = async () => {
    try {
      const { data: userData, error } = await supabase
        .from('profiles')
        .select('id, full_name, email, role, avatar_url')
        .order('full_name')

      if (error) throw error;
      
      if (userData) {
        setUsers(userData)
      }
    } catch (error) {
      console.error('Error loading users:', error)
    }
  }

  const loadUnreadCounts = async (userId: string) => {
    try {
      // This would need to be implemented based on your unread message tracking
      // For now, we'll set empty counts
      setUnreadCounts({})
    } catch (error) {
      console.error('Error loading unread counts:', error)
    }
  }

  const loadMessages = async (channelId: string) => {
    try {
      const { data: messagesData, error: messagesError } = await supabase
        .from('chat_messages')
        .select(`
          *,
          sender:profiles(full_name, avatar_url),
          reply_to:chat_messages(content, sender:profiles(full_name))
        `)
        .eq('channel_id', channelId)
        .order('created_at', { ascending: true });

      if (messagesError) {
        console.error('Error loading messages:', messagesError);
        setMessages([]);
        return;
      }

      if (!messagesData || messagesData.length === 0) {
        setMessages([]);
        return;
      }
      
      // The data is already shaped correctly due to the new query
      const formattedMessages = messagesData.map((msg: any) => ({
        ...msg,
        sender_name: msg.sender?.full_name || 'Unknown User',
        reply_to: msg.reply_to ? {
          content: msg.reply_to.content,
          profiles: {
            full_name: msg.reply_to.sender?.full_name || 'Unknown User'
          }
        } : undefined
      }))

      setMessages(formattedMessages);
    } catch (error) {
      console.error('Error in loadMessages:', error);
      setMessages([]);
    }
  };

  const subscribeToMessages = (channelId: string) => {
    const subscription = supabase
      .channel(`admin-messages:${channelId}`) // Using a unique channel name for admin
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'chat_messages',
        filter: `channel_id=eq.${channelId}`
      }, async (payload) => {
        if (payload.eventType === 'INSERT') {
          const newMessage = payload.new as any;
          const { data: sender } = await supabase
            .from('profiles')
            .select('full_name, avatar_url')
            .eq('id', newMessage.sender_id)
            .single();

          const messageWithSender = {
            ...newMessage,
            sender_name: sender?.full_name || 'Unknown User',
            sender: {
              full_name: sender?.full_name || 'Unknown User',
              avatar_url: sender?.avatar_url
            }
          };
          setMessages(prev => [...prev, messageWithSender]);
        } else if (payload.eventType === 'UPDATE') {
          const updatedMessage = payload.new as any;
           setMessages(prev => prev.map(msg => 
            msg.id === updatedMessage.id ? { ...msg, ...updatedMessage, content: updatedMessage.content, edited_at: updatedMessage.edited_at } : msg
          ));
        }
        else if (payload.eventType === 'DELETE') {
          setMessages(prev => prev.filter(msg => msg.id !== payload.old.id));
        }
      })
      .subscribe((status) => {
        console.log(`Admin subscription status for ${channelId}:`, status)
        if (status === 'CHANNEL_ERROR') {
          console.error('Subscription failed, retrying...');
          setTimeout(() => subscribeToMessages(channelId), 5000);
        }
      });

    return subscription
  }

  // File upload handling
  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      setSelectedFile(file)
    }
  }

  const uploadFile = async (file: File): Promise<string> => {
    const formData = new FormData()
    formData.append('file', file)
    formData.append('type', file.type.startsWith('image/') ? 'image' : 'file')

    const response = await fetch('/api/upload', {
      method: 'POST',
      body: formData
    })

    if (!response.ok) {
      throw new Error('Upload failed')
    }

    const data = await response.json()
    return data.url
  }

  // Enhanced message sending
  const handleSendMessage = async () => {
    if ((!newMessage.trim() && !selectedFile) || !user || !selectedChannel) return

    try {
      setUploading(true)
      let fileUrl = ''
      let imageUrl = ''
      let messageType: 'text' | 'file' | 'image' = 'text'
      let fileName = ''
      let fileSize = 0
      let fileType = ''

      if (selectedFile) {
        // NOTE: The uploadFile function is a placeholder and should be implemented
        // with a proper backend endpoint for handling file uploads.
        // For now, we'll simulate the upload.
        // fileUrl = await uploadFile(selectedFile) 
        fileName = selectedFile.name
        fileSize = selectedFile.size
        fileType = selectedFile.type
        
        if (selectedFile.type.startsWith('image/')) {
          // You would get the real URL from your upload service
          // imageUrl = fileUrl 
          messageType = 'image'
        } else {
          messageType = 'file'
        }
      }

      const messageData: any = {
        content: newMessage.trim(),
        channel_id: selectedChannel.id,
        sender_id: user.id, // Ensure sender_id is set
        message_type: messageType
      }

      if (fileUrl) messageData.file_url = fileUrl
      if (imageUrl) messageData.image_url = imageUrl
      if (fileName) messageData.file_name = fileName
      if (fileSize) messageData.file_size = fileSize
      if (fileType) messageData.file_type = fileType
      if (replyToMessage) messageData.reply_to_id = replyToMessage.id

      const { data, error } = await supabase
        .from('chat_messages')
        .insert(messageData)
        .select(`
          *,
          sender:profiles(full_name, avatar_url)
        `)
        .single()

      if (error) throw error

      const messageWithSender = {
        ...data,
        sender_name: data.sender?.full_name || 'Unknown User',
      } as Message

      // No need to manually add to state, subscription should handle it.
      // setMessages(prev => [...prev, messageWithSender]) 
      
      setNewMessage('')
      setSelectedFile(null)
      setReplyToMessage(null)
      if (fileInputRef.current) fileInputRef.current.value = ''
      if (imageInputRef.current) imageInputRef.current.value = ''
    } catch (error) {
      console.error('Error sending message:', error)
      alert('Failed to send message')
    } finally {
      setUploading(false)
    }
  }

  // Message editing
  const handleEditMessage = async (messageId: string, newContent: string) => {
    try {
      const response = await fetch(`/api/messaging/messages/${messageId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content: newContent })
      })

      if (!response.ok) throw new Error('Failed to edit message')

      const updatedMessage = await response.json()
      setMessages(prev => prev.map(msg => 
        msg.id === messageId ? { ...msg, ...updatedMessage } : msg
      ))
      setEditingMessage(null)
    } catch (error) {
      console.error('Error editing message:', error)
      alert('Failed to edit message')
    }
  }

  // Message deletion
  const handleDeleteMessage = async (messageId: string) => {
    if (!confirm('Are you sure you want to delete this message?')) return

    try {
      const { error } = await supabase
        .from('chat_messages')
        .delete()
        .eq('id', messageId)

      if (error) throw error

      // Optimistic update
      setMessages(prev => prev.filter(msg => msg.id !== messageId))
    } catch (error) {
      console.error('Error deleting message:', error)
      alert('Failed to delete message')
    }
  }

  // Message forwarding
  const handleForwardMessage = async () => {
    if (!forwardingMessage || !targetChannelId) return

    try {
      // This should be a server-side operation for security
      const { error } = await supabase.rpc('forward_message', {
        original_message_id: forwardingMessage.id,
        target_channel_id: targetChannelId,
        forwarding_user_id: user.id
      })

      if (error) throw error

      setShowForwardDialog(false)
      setForwardingMessage(null)
      setTargetChannelId('')
      alert('Message forwarded successfully')
    } catch (error) {
      console.error('Error forwarding message:', error)
      alert('Failed to forward message')
    }
  }

  // Message reactions
  const handleReaction = async (messageId: string, reaction: string) => {
    try {
      // This should also be a server-side operation
      const { error } = await supabase.rpc('toggle_reaction', {
        message_id_param: messageId,
        reaction_param: reaction,
        user_id_param: user.id
      })

      if (error) throw error

      // The subscription should handle the update, but we can do an optimistic update
      setMessages(prev => prev.map(msg => {
        if (msg.id === messageId) {
          const newReactions = { ...(msg.reactions || {}) };
          // This is a simplified optimistic update. A real implementation
          // would need more logic to handle adding/removing users from a reaction.
          if (newReactions[reaction]) {
            delete newReactions[reaction];
          } else {
            newReactions[reaction] = [user.id];
          }
          return { ...msg, reactions: newReactions };
        }
        return msg;
      }));

    } catch (error) {
      console.error('Error adding reaction:', error)
    }
  }

  // Scroll to bottom
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const handleCreateChannel = async () => {
    try {
      if (!user) return

      console.log('Creating channel with user:', user.email)

      // Get user profile to determine their role
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', user.id)
        .single()

      if (profileError) {
        console.error('Profile error:', profileError)
        throw new Error('Failed to verify user status')
      }

      if (!profile) {
        throw new Error('User profile not found')
      }

      console.log('User role confirmed:', profile.role)

      // Create channel directly using Supabase
      const { data: channel, error: channelError } = await supabase
        .from('chat_channels')
        .insert({
          name: newChannelData.name,
          description: newChannelData.description,
          channel_type: newChannelData.channel_type || 'public',
          created_by: user.id
        })
        .select()
        .single()

      if (channelError) {
        console.error('Channel creation error:', channelError)
        throw channelError
      }

      console.log('Channel created:', channel)

      // Add creator as admin member (channel creator is always admin of their channel)
      const { error: memberError } = await supabase
        .from('chat_channel_members')
        .insert({
          channel_id: channel.id,
          user_id: user.id,
          role: 'admin'
        })

      if (memberError) {
        console.error('Member creation error:', memberError);
      }

      if (newChannelData.selectedUsers.length > 0) {
        const memberInserts = newChannelData.selectedUsers.map(userId => ({
          user_id: userId,
          channel_id: channel.id,
          role: 'member'
        }));

        const { error: membersError } = await supabase
          .from('chat_channel_members')
          .insert(memberInserts);

        if (membersError) {
          console.error('Additional members error:', membersError);
        }
      }

      setNewChannelData({
        name: '',
        description: '',
        channel_type: 'public',
        selectedUsers: []
      });
      setShowCreateDialog(false);
      loadChannels();
      
      console.log('Channel creation completed successfully');
    } catch (error) {
      console.error('Error creating channel:', error);
      alert(`Failed to create channel: ${error.message}`);
    }
  };

  const handleDeleteChannel = async () => {
    if (!channelToDelete) return

    try {
      // Delete all messages in the channel
      await supabase
        .from('chat_messages')
        .delete()
        .eq('channel_id', channelToDelete.id)

      // Delete all channel members
      await supabase
        .from('chat_channel_members')
        .delete()
        .eq('channel_id', channelToDelete.id)

      // Delete the channel
      const { error } = await supabase
        .from('chat_channels')
        .delete()
        .eq('id', channelToDelete.id)

      if (error) throw error

      setShowDeleteDialog(false)
      setChannelToDelete(null)
      loadChannels()
    } catch (error) {
      console.error('Error deleting channel:', error)
      alert('Failed to delete channel. Please try again.')
    }
  }

  const toggleUserSelection = (userId: string) => {
    setNewChannelData(prev => ({
      ...prev,
      selectedUsers: prev.selectedUsers.includes(userId)
        ? prev.selectedUsers.filter(id => id !== userId)
        : [...prev.selectedUsers, userId]
    }))
  }

  const canCreateChannel = () => {
    // Allow all authenticated users to create channels
    return !!user
  }

  const canDeleteChannel = (channel: Channel) => {
    // Only admins and super_admins can delete channels
    return userRole === 'admin' || userRole === 'super_admin'
  }

  const canSendMessage = (channel: Channel) => {
    if (channel.channel_type === 'announcement') {
      return userRole === 'admin' || userRole === 'super_admin'
    }
    return true
  }

  // Function to get the appropriate dashboard URL based on user role
  const getDashboardUrl = () => {
    switch (userRole) {
      case 'admin':
      case 'super_admin':
        return '/admin'
      case 'intern':
        return '/intern-dashboard'
      case 'student':
        return '/student-dashboard'
      case 'parent':
        return '/parent-dashboard'
      case 'teacher':
        return '/teacher-dashboard'
      default:
        return '/dashboard'
    }
  }

  const filteredChannels = channels.filter(channel => {
    const matchesSearch = channel.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         channel.description.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesType = selectedChannelType === 'all' || channel.channel_type === selectedChannelType
    
    return matchesSearch && matchesType
  })

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-xl">Loading communication hub...</div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Communication Hub</h1>
          <p className="text-gray-600">Manage messaging channels and communications</p>
        </div>
        <Button 
          variant="outline" 
          onClick={() => window.location.href = getDashboardUrl()}
          className="flex items-center gap-2"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Dashboard
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Channels Sidebar */}
        <div className="lg:col-span-1">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span className="flex items-center">
                  <Hash className="w-5 h-5 mr-2" />
                  Channels ({channels.length})
                </span>
                {canCreateChannel() && (
                  <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
                    <DialogTrigger asChild>
                      <Button size="sm">
                        <Plus className="w-4 h-4 mr-1" />
                        Create
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-md">
                      <DialogHeader>
                        <DialogTitle>Create New Channel</DialogTitle>
                        <DialogDescription>
                          Create a new communication channel for the community.
                        </DialogDescription>
                      </DialogHeader>
                      <div className="space-y-4">
                        <div>
                          <Label htmlFor="channel-name">Channel Name</Label>
                          <Input
                            id="channel-name"
                            value={newChannelData.name}
                            onChange={(e) => setNewChannelData(prev => ({ ...prev, name: e.target.value }))}
                            placeholder="Enter channel name"
                          />
                        </div>
                        <div>
                          <Label htmlFor="channel-description">Description</Label>
                          <Textarea
                            id="channel-description"
                            value={newChannelData.description}
                            onChange={(e) => setNewChannelData(prev => ({ ...prev, description: e.target.value }))}
                            placeholder="Enter channel description"
                          />
                        </div>
                        <div>
                          <Label htmlFor="channel-type">Channel Type</Label>
                          <Select
                            value={newChannelData.channel_type}
                            onValueChange={(value: any) => setNewChannelData(prev => ({ ...prev, channel_type: value }))}
                          >
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="public">Public</SelectItem>
                              <SelectItem value="private">Private</SelectItem>
                              <SelectItem value="group">Group</SelectItem>
                              {(userRole === 'admin' || userRole === 'super_admin') && (
                                <SelectItem value="announcement">Announcement</SelectItem>
                              )}
                            </SelectContent>
                          </Select>
                        </div>
                        <div>
                          <Label>Add Members</Label>
                          <Select
                            onValueChange={(value) => {
                              if (!newChannelData.selectedUsers.includes(value)) {
                                setNewChannelData(prev => ({
                                  ...prev,
                                  selectedUsers: [...prev.selectedUsers, value]
                                }))
                              }
                            }}
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Select users to add" />
                            </SelectTrigger>
                            <SelectContent>
                              {users.map(user => (
                                <SelectItem key={user.id} value={user.id}>
                                  {user.full_name} ({user.role})
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          {newChannelData.selectedUsers.length > 0 && (
                            <div className="mt-2 flex flex-wrap gap-1">
                              {newChannelData.selectedUsers.map(userId => {
                                const user = users.find(u => u.id === userId)
                                return (
                                  <Badge key={userId} variant="secondary">
                                    {user?.full_name}
                                    <button
                                      onClick={() => setNewChannelData(prev => ({
                                        ...prev,
                                        selectedUsers: prev.selectedUsers.filter(id => id !== userId)
                                      }))}
                                      className="ml-1"
                                    >
                                      ×
                                    </button>
                                  </Badge>
                                )
                              })}
                            </div>
                          )}
                        </div>
                        <Button onClick={handleCreateChannel} className="w-full">
                          Create Channel
                        </Button>
                      </div>
                    </DialogContent>
                  </Dialog>
                )}
              </CardTitle>
              <div className="flex space-x-2">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <Input
                    placeholder="Search channels..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
                <Select value={selectedChannelType} onValueChange={setSelectedChannelType}>
                  <SelectTrigger className="w-32">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All</SelectItem>
                    <SelectItem value="public">Public</SelectItem>
                    <SelectItem value="private">Private</SelectItem>
                    <SelectItem value="group">Group</SelectItem>
                    <SelectItem value="announcement">Announcement</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {filteredChannels.map((channel) => (
                  <div
                    key={channel.id}
                    className={`p-3 rounded-lg cursor-pointer transition-colors ${
                      selectedChannel?.id === channel.id
                        ? 'bg-blue-50 border border-blue-200'
                        : 'hover:bg-gray-50'
                    }`}
                    onClick={() => setSelectedChannel(channel)}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <h4 className="font-medium text-gray-900">#{channel.name}</h4>
                        <p className="text-sm text-gray-600">{channel.description}</p>
                        <div className="flex items-center space-x-2 mt-1">
                          <Badge variant="outline" className="text-xs">
                            {channel.channel_type}
                          </Badge>
                          <div className="flex items-center text-xs text-gray-500">
                            <Users className="w-3 h-3 mr-1" />
                            {channel.member_count}
                          </div>
                        </div>
                      </div>
                      {canDeleteChannel(channel) && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation()
                            setChannelToDelete(channel)
                            setShowDeleteDialog(true)
                          }}
                          className="text-red-600 hover:text-red-900"
                        >
                          <X className="w-4 h-4" />
                        </Button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Messages Area */}
        <div className="lg:col-span-3">
          <Card>
            <CardHeader>
              <CardTitle>Messages</CardTitle>
            </CardHeader>
            <CardContent>
              {selectedChannel ? (
                <div className="space-y-4">
                  {/* Messages */}
                  <div className="flex-1 overflow-y-auto p-4 space-y-4">
                    {messages.map((message) => (
                      <div key={message.id} className={`flex ${message.sender_id === user?.id ? 'justify-end' : 'justify-start'}`}>
                        <div className={`max-w-xs lg:max-w-md ${message.sender_id === user?.id ? 'bg-blue-500 text-white' : 'bg-gray-100 text-gray-900'} rounded-lg p-3 relative group`}>
                          
                          {/* Reply indicator */}
                          {message.reply_to && (
                            <div className="text-xs opacity-75 mb-1 border-l-2 border-current pl-2">
                              Replying to {message.reply_to.profiles.full_name}: {message.reply_to.content.substring(0, 50)}...
                            </div>
                          )}

                          {/* Forwarded indicator */}
                          {message.forwarded_from && (
                            <div className="text-xs opacity-75 mb-1">
                              ↪ Forwarded from {message.forwarded_from.profiles.full_name}
                            </div>
                          )}

                          {/* Message content */}
                          <div className="break-words">
                            {message.content}
                          </div>

                          {/* Image */}
                          {message.image_url && (
                            <div className="mt-2">
                              <img 
                                src={message.image_url} 
                                alt="Message attachment"
                                className="max-w-full rounded-lg cursor-pointer"
                                onClick={() => window.open(message.image_url, '_blank')}
                              />
                              {message.image_caption && (
                                <div className="text-xs mt-1 opacity-75">{message.image_caption}</div>
                              )}
                            </div>
                          )}

                          {/* File attachment */}
                          {message.file_url && message.message_type === 'file' && (
                            <div className="mt-2 p-2 bg-black bg-opacity-10 rounded">
                              <div className="flex items-center space-x-2">
                                <Paperclip className="w-4 h-4" />
                                <div className="flex-1 min-w-0">
                                  <div className="text-sm font-medium truncate">{message.file_name}</div>
                                  <div className="text-xs opacity-75">
                                    {message.file_size ? `${(message.file_size / 1024).toFixed(1)} KB` : ''}
                                  </div>
                                </div>
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  onClick={() => window.open(message.file_url, '_blank')}
                                >
                                  Download
                                </Button>
                              </div>
                            </div>
                          )}

                          {/* Edited indicator */}
                          {message.edited_at && (
                            <div className="text-xs opacity-75 mt-1">(edited)</div>
                          )}

                          {/* Message actions */}
                          <div className="absolute top-1 right-1 opacity-0 group-hover:opacity-100 transition-opacity">
                            <div className="flex space-x-1">
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => setShowReactions(showReactions === message.id ? null : message.id)}
                              >
                                <Smile className="w-3 h-3" />
                              </Button>
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => setReplyToMessage(message)}
                              >
                                <Reply className="w-3 h-3" />
                              </Button>
                              {message.sender_id === user?.id && (
                                <>
                                  <Button
                                    size="sm"
                                    variant="ghost"
                                    onClick={() => setEditingMessage(message)}
                                  >
                                    <Edit className="w-3 h-3" />
                                  </Button>
                                  <Button
                                    size="sm"
                                    variant="ghost"
                                    onClick={() => handleDeleteMessage(message.id)}
                                  >
                                    <Trash2 className="w-3 h-3" />
                                  </Button>
                                </>
                              )}
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => {
                                  setForwardingMessage(message)
                                  setShowForwardDialog(true)
                                }}
                              >
                                <Forward className="w-3 h-3" />
                              </Button>
                            </div>
                          </div>

                          {/* Reactions */}
                          {message.reactions && Object.keys(message.reactions).length > 0 && (
                            <div className="mt-2 flex flex-wrap gap-1">
                              {Object.entries(message.reactions).map(([userId, reactions]) => (
                                reactions.map((reaction, index) => (
                                  <Badge key={`${userId}-${index}`} variant="secondary" className="text-xs">
                                    {reaction}
                                  </Badge>
                                ))
                              ))}
                            </div>
                          )}

                          {/* Reaction picker */}
                          {showReactions === message.id && (
                            <div className="absolute bottom-full right-0 mb-2 bg-white border rounded-lg p-2 shadow-lg">
                              <div className="flex space-x-1">
                                {['👍', '❤️', '😄', '😮', '😢', '😡'].map((reaction) => (
                                  <Button
                                    key={reaction}
                                    size="sm"
                                    variant="ghost"
                                    onClick={() => {
                                      handleReaction(message.id, reaction)
                                      setShowReactions(null)
                                    }}
                                  >
                                    {reaction}
                                  </Button>
                                ))}
                              </div>
                            </div>
                          )}

                          {/* Timestamp */}
                          <div className="text-xs opacity-75 mt-1">
                            {new Date(message.created_at).toLocaleTimeString()}
                          </div>
                        </div>
                      </div>
                    ))}
                    <div ref={messagesEndRef} />
                  </div>

                  {/* Message Input */}
                  <div className="border-t p-4">
                    {/* Reply indicator */}
                    <div className="mb-2 p-2 bg-gray-100 rounded-lg">
                      <div className="flex items-center justify-between">
                        <div className="text-sm">
                          <span className="font-medium">Replying to:</span> {replyToMessage?.content.substring(0, 50)}...
                        </div>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => setReplyToMessage(null)}
                        >
                          <X className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>

                    {/* Selected file indicator */}
                    {selectedFile && (
                      <div className="mb-2 p-2 bg-blue-100 rounded-lg">
                        <div className="flex items-center justify-between">
                          <div className="text-sm">
                            <span className="font-medium">File:</span> {selectedFile.name}
                          </div>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => {
                              setSelectedFile(null)
                              if (fileInputRef.current) fileInputRef.current.value = ''
                              if (imageInputRef.current) imageInputRef.current.value = ''
                            }}
                          >
                            <X className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    )}

                    <div className="flex items-center space-x-2">
                      {/* File upload buttons */}
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => imageInputRef.current?.click()}
                        disabled={uploading}
                      >
                        <ImageIcon className="w-4 h-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => fileInputRef.current?.click()}
                        disabled={uploading}
                      >
                        <Paperclip className="w-4 h-4" />
                      </Button>

                      {/* Hidden file inputs */}
                      <input
                        ref={imageInputRef}
                        type="file"
                        accept="image/*"
                        onChange={handleFileSelect}
                        className="hidden"
                      />
                      <input
                        ref={fileInputRef}
                        type="file"
                        accept=".pdf,.doc,.docx,.txt,.zip"
                        onChange={handleFileSelect}
                        className="hidden"
                      />

                      {/* Message input */}
                      <div className="flex-1">
                        <Input
                          value={newMessage}
                          onChange={(e) => setNewMessage(e.target.value)}
                          placeholder="Type a message..."
                          onKeyPress={(e) => {
                            if (e.key === 'Enter' && !e.shiftKey) {
                              e.preventDefault()
                              handleSendMessage()
                            }
                          }}
                          disabled={uploading}
                        />
                      </div>

                      {/* Send button */}
                      <Button
                        onClick={handleSendMessage}
                        disabled={uploading || (!newMessage.trim() && !selectedFile)}
                      >
                        {uploading ? (
                          <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        ) : (
                          <Send className="w-4 h-4" />
                        )}
                      </Button>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  Select a channel to start messaging
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Delete Channel Dialog */}
      <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center">
              <AlertTriangle className="w-5 h-5 mr-2 text-red-600" />
              Delete Channel
            </DialogTitle>
            <DialogDescription>
              Are you sure you want to delete the channel "{channelToDelete?.name}"? This action cannot be undone and will remove all messages in this channel.
            </DialogDescription>
          </DialogHeader>
          <div className="flex space-x-2">
            <Button
              variant="outline"
              onClick={() => {
                setShowDeleteDialog(false)
                setChannelToDelete(null)
              }}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleDeleteChannel}
            >
              <Trash2 className="w-4 h-4 mr-2" />
              Delete Channel
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Edit Message Dialog */}
      <Dialog open={!!editingMessage} onOpenChange={() => setEditingMessage(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Message</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <Textarea
              value={editingMessage?.content || ''}
              onChange={(e) => setEditingMessage(prev => prev ? { ...prev, content: e.target.value } : null)}
              placeholder="Edit your message..."
              rows={3}
            />
            <div className="flex justify-end space-x-2">
              <Button variant="outline" onClick={() => setEditingMessage(null)}>
                Cancel
              </Button>
              <Button 
                onClick={() => editingMessage && handleEditMessage(editingMessage.id, editingMessage.content)}
              >
                Save Changes
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Forward Message Dialog */}
      <Dialog open={showForwardDialog} onOpenChange={setShowForwardDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Forward Message</DialogTitle>
            <DialogDescription>
              Select a channel to forward this message to.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Select Channel</Label>
              <Select value={targetChannelId} onValueChange={setTargetChannelId}>
                <SelectTrigger>
                  <SelectValue placeholder="Choose a channel" />
                </SelectTrigger>
                <SelectContent>
                  {channels.map((channel) => (
                    <SelectItem key={channel.id} value={channel.id}>
                      {channel.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex justify-end space-x-2">
              <Button variant="outline" onClick={() => setShowForwardDialog(false)}>
                Cancel
              </Button>
              <Button 
                onClick={handleForwardMessage}
                disabled={!targetChannelId}
              >
                Forward
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
} 
