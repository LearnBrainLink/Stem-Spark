'use client'

import { useState, useEffect } from 'react'
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
  ArrowLeft
} from 'lucide-react'

interface Message {
  id: string
  content: string
  sender_id: string
  sender_name: string
  channel_id: string
  created_at: string
  message_type: 'text' | 'file' | 'system'
}

interface Channel {
  id: string
  name: string
  description: string
  channel_type: 'public' | 'private' | 'group' | 'announcement' | 'admin_group' | 'intern_group' | 'parent_group' | 'student_group'
  created_by: string
  created_at: string
  member_count: number
  group_role?: string // For group-specific channels
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
  const [currentSubscription, setCurrentSubscription] = useState<any>(null)

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
    checkAuth()
  }, [])

  // Cleanup effect for component unmounting
  useEffect(() => {
    return () => {
      if (currentSubscription) {
        currentSubscription.unsubscribe()
      }
    }
  }, [currentSubscription])

  useEffect(() => {
    if (selectedChannel) {
      loadMessages(selectedChannel.id)
      
      // Unsubscribe from previous subscription if it exists
      if (currentSubscription) {
        currentSubscription.unsubscribe()
      }
      
      // Create new subscription
      const subscription = subscribeToMessages(selectedChannel.id)
      setCurrentSubscription(subscription)
    }
    
    // Cleanup function to unsubscribe when component unmounts or selectedChannel changes
    return () => {
      if (currentSubscription) {
        currentSubscription.unsubscribe()
      }
    }
  }, [selectedChannel])

  const checkAuth = async () => {
    try {
      const { data: { user: authUser }, error: authError } = await supabase.auth.getUser()
      
      if (authError || !authUser) {
        window.location.href = '/login'
        return
      }

      await loadUserProfile(authUser.id)
      await loadCommunicationData(authUser.id)
    } catch (error) {
      console.error('Error in checkAuth:', error)
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
        return
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
    } finally {
      setLoading(false)
    }
  }

  const loadChannels = async () => {
    try {
      const { data: channelData, error: channelError } = await supabase
        .from('chat_channels')
        .select('*')
        .order('created_at', { ascending: false })

      if (!channelError && channelData) {
        // Get member count for each channel
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
        
        setChannels(channelsWithMemberCount)
        if (channelsWithMemberCount.length > 0) {
          setSelectedChannel(channelsWithMemberCount[0])
        }
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

      if (!error && userData) {
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
      // First get all messages for the channel
      const { data: messages, error: messagesError } = await supabase
        .from('chat_messages')
        .select('*')
        .eq('channel_id', channelId)
        .order('created_at', { ascending: true })

      if (messagesError) {
        console.error('Error loading messages:', messagesError)
        return
      }

      if (!messages || messages.length === 0) {
        setMessages([])
        return
      }

      // Get unique sender IDs
      const senderIds = [...new Set(messages.map(msg => msg.sender_id))]

      // Fetch sender information for all senders
      const { data: senders, error: sendersError } = await supabase
        .from('profiles')
        .select('id, full_name, email')
        .in('id', senderIds)

      if (sendersError) {
        console.error('Error loading senders:', sendersError)
      }

      // Create a map of sender ID to sender info
      const senderMap = new Map()
      if (senders) {
        senders.forEach(sender => {
          senderMap.set(sender.id, sender)
        })
      }

      // Combine messages with sender information
      const messagesWithSenders = messages.map(msg => ({
        ...msg,
        sender_name: senderMap.get(msg.sender_id)?.full_name || 'Unknown User'
      }))

      setMessages(messagesWithSenders)
    } catch (error) {
      console.error('Error loading messages:', error)
    }
  }

  const subscribeToMessages = (channelId: string) => {
    const subscription = supabase
      .channel(`messages:${channelId}`)
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'chat_messages',
        filter: `channel_id=eq.${channelId}`
      }, async (payload) => {
        const newMessage = payload.new as any
        
        // Fetch sender information for the new message
        try {
          const { data: senderData, error: senderError } = await supabase
            .from('profiles')
            .select('full_name, email')
            .eq('id', newMessage.sender_id)
            .single()
          
          if (senderError) {
            console.error('Error fetching sender info:', senderError)
          }
          
          const messageWithSender = {
            ...newMessage,
            sender_name: senderData?.full_name || 'Unknown User'
          }
          
          setMessages(prev => [...prev, messageWithSender])
          console.log('New message received:', messageWithSender)
        } catch (error) {
          console.error('Error fetching sender info for new message:', error)
          // Add message without sender info as fallback
          setMessages(prev => [...prev, { ...newMessage, sender_name: 'Unknown User' }])
        }
      })
      .on('postgres_changes', {
        event: 'DELETE',
        schema: 'public',
        table: 'chat_messages',
        filter: `channel_id=eq.${channelId}`
      }, (payload) => {
        // Remove deleted message from state
        setMessages(prev => prev.filter(msg => msg.id !== payload.old.id))
      })
      .subscribe((status) => {
        console.log('Subscription status:', status)
      })

    return subscription
  }

  const handleSendMessage = async () => {
    if (!newMessage.trim() || !user || !selectedChannel) {
      console.log('Cannot send message:', { 
        hasMessage: !!newMessage.trim(), 
        hasUser: !!user, 
        hasChannel: !!selectedChannel 
      })
      return
    }

    try {
      console.log('Sending message:', {
        content: newMessage,
        sender_id: user.id,
        channel_id: selectedChannel.id,
        channel_name: selectedChannel.name
      })

      const { data, error } = await supabase
        .from('chat_messages')
        .insert({
          content: newMessage.trim(),
          sender_id: user.id,
          channel_id: selectedChannel.id,
          message_type: 'text'
        })
        .select()

      if (error) {
        console.error('Error sending message:', error)
        alert(`Failed to send message: ${error.message}`)
        return
      }

      if (data && data.length > 0) {
        console.log('Message sent successfully:', data[0])
        setNewMessage('')
      } else {
        console.error('No data returned from message insert')
        alert('Message sent but no confirmation received')
      }
    } catch (error) {
      console.error('Error sending message:', error)
      alert(`Failed to send message: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
  }

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
        console.error('Member creation error:', memberError)
        // Don't throw here, channel was created successfully
      }

      // Add members to the channel if any were selected
      if (newChannelData.selectedUsers.length > 0) {
        const memberInserts = newChannelData.selectedUsers.map(userId => ({
          user_id: userId,
          channel_id: channel.id,
          role: 'member'
        }))

        const { error: membersError } = await supabase
          .from('chat_channel_members')
          .insert(memberInserts)

        if (membersError) {
          console.error('Additional members error:', membersError)
          // Don't throw here, channel was created successfully
        }
      }

      // If this is a group channel, automatically add users based on their roles
      if (['admin_group', 'intern_group', 'parent_group', 'student_group'].includes(channel.channel_type)) {
        await addUsersToGroupChannel(channel.id, channel.channel_type)
      }

      setNewChannelData({
        name: '',
        description: '',
        channel_type: 'public',
        selectedUsers: []
      })
      setShowCreateDialog(false)
      loadChannels()
      
      console.log('Channel creation completed successfully')
    } catch (error) {
      console.error('Error creating channel:', error)
      alert(`Failed to create channel: ${error.message}`)
    }
  }

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

  // Function to get users by role
  const getUsersByRole = async (role: string) => {
    try {
      const { data: users, error } = await supabase
        .from('profiles')
        .select('id, full_name, email, role')
        .eq('role', role)
      
      if (error) {
        console.error('Error fetching users by role:', error)
        return []
      }
      
      return users || []
    } catch (error) {
      console.error('Error in getUsersByRole:', error)
      return []
    }
  }

  // Function to automatically add users to group channels
  const addUsersToGroupChannel = async (channelId: string, channelType: string) => {
    try {
      let targetRole = ''
      
      // Map channel types to roles
      switch (channelType) {
        case 'admin_group':
          targetRole = 'admin'
          break
        case 'intern_group':
          targetRole = 'intern'
          break
        case 'parent_group':
          targetRole = 'parent'
          break
        case 'student_group':
          targetRole = 'student'
          break
        default:
          return // Not a group channel
      }
      
      // Get all users with the target role
      const users = await getUsersByRole(targetRole)
      
      if (users.length === 0) {
        console.log(`No users found with role: ${targetRole}`)
        return
      }
      
      // Add all users to the channel
      const memberInserts = users.map(user => ({
        channel_id: channelId,
        user_id: user.id,
        role: 'member'
      }))
      
      const { error } = await supabase
        .from('chat_channel_members')
        .insert(memberInserts)
      
      if (error) {
        console.error('Error adding users to group channel:', error)
      } else {
        console.log(`Added ${users.length} users to ${channelType} channel`)
      }
    } catch (error) {
      console.error('Error in addUsersToGroupChannel:', error)
    }
  }

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
                              {/* Only admins can create announcement and role-specific channels */}
                              {(userRole === 'admin' || userRole === 'super_admin') && (
                                <>
                                  <SelectItem value="announcement">Announcement</SelectItem>
                                  <SelectItem value="admin_group">Admin Group</SelectItem>
                                  <SelectItem value="intern_group">Intern Group</SelectItem>
                                  <SelectItem value="parent_group">Parent Group</SelectItem>
                                  <SelectItem value="student_group">Student Group</SelectItem>
                                </>
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
                    <SelectItem value="admin_group">Admin Group</SelectItem>
                    <SelectItem value="intern_group">Intern Group</SelectItem>
                    <SelectItem value="parent_group">Parent Group</SelectItem>
                    <SelectItem value="student_group">Student Group</SelectItem>
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
                  <div className="space-y-4 max-h-96 overflow-y-auto">
                    {messages.map((message) => (
                      <div key={message.id} className="flex space-x-3">
                        <div className="flex-shrink-0">
                          <div className="h-8 w-8 rounded-full bg-blue-500 flex items-center justify-center text-white text-sm font-medium">
                            {message.sender_name.charAt(0).toUpperCase()}
                          </div>
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center space-x-2">
                            <span className="text-sm font-medium text-gray-900">
                              {message.sender_name}
                            </span>
                            <span className="text-xs text-gray-500">
                              {new Date(message.created_at).toLocaleString()}
                            </span>
                            {message.message_type === 'system' && (
                              <Badge variant="secondary" className="text-xs">System</Badge>
                            )}
                          </div>
                          <p className="text-sm text-gray-700 mt-1">{message.content}</p>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Message Input */}
                  <div className="border-t border-gray-200 pt-4">
                    {canSendMessage(selectedChannel) ? (
                      <div className="flex space-x-2">
                        <Input
                          type="text"
                          value={newMessage}
                          onChange={(e) => setNewMessage(e.target.value)}
                          onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                          placeholder="Type your message..."
                          className="flex-1"
                        />
                        <Button
                          onClick={handleSendMessage}
                          disabled={!newMessage.trim()}
                        >
                          <Send className="w-4 h-4 mr-2" />
                          Send
                        </Button>
                      </div>
                    ) : (
                      <div className="text-sm text-gray-500 text-center py-2">
                        You don't have permission to send messages in this channel
                      </div>
                    )}
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
    </div>
  )
} 