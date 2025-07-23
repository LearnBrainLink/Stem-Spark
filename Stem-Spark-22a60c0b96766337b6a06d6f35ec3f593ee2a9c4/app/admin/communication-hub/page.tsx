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
  AlertTriangle
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
  channel_type: 'public' | 'private' | 'group' | 'announcement'
  created_by: string
  created_at: string
  member_count: number
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

  useEffect(() => {
    if (selectedChannel) {
      loadMessages(selectedChannel.id)
      subscribeToMessages(selectedChannel.id)
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
      const { data, error } = await supabase
        .from('chat_messages')
        .select(`
          *,
          profiles:profiles(full_name)
        `)
        .eq('channel_id', channelId)
        .order('created_at', { ascending: true })

      if (!error && data) {
        setMessages(data.map(msg => ({
          ...msg,
          sender_name: msg.profiles?.full_name || 'Unknown'
        })))
      }
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
      }, (payload) => {
        const newMessage = payload.new as Message
        setMessages(prev => [...prev, newMessage])
      })
      .subscribe()

    return () => subscription.unsubscribe()
  }

  const handleSendMessage = async () => {
    if (!newMessage.trim() || !user || !selectedChannel) return

    try {
      const { error } = await supabase
        .from('chat_messages')
        .insert({
          content: newMessage,
          sender_id: user.id,
          channel_id: selectedChannel.id,
          message_type: 'text'
        })

      if (!error) {
        setNewMessage('')
      } else {
        console.error('Error sending message:', error)
      }
    } catch (error) {
      console.error('Error sending message:', error)
    }
  }

  const handleCreateChannel = async () => {
    try {
      if (!user) return

      const { data: channel, error } = await supabase
        .from('chat_channels')
        .insert({
          name: newChannelData.name,
          description: newChannelData.description,
          channel_type: newChannelData.channel_type,
          created_by: user.id
        })
        .select()
        .single()

      if (error) throw error

      // Add members to the channel
      if (newChannelData.selectedUsers.length > 0) {
        const memberInserts = newChannelData.selectedUsers.map(userId => ({
          user_id: userId,
          channel_id: channel.id,
          role: 'member'
        }))

        await supabase
          .from('chat_channel_members')
          .insert(memberInserts)
      }

      // Add creator as admin
      await supabase
        .from('chat_channel_members')
        .insert({
          user_id: user.id,
          channel_id: channel.id,
          role: 'admin'
        })

      setNewChannelData({
        name: '',
        description: '',
        channel_type: 'public',
        selectedUsers: []
      })
      setShowCreateDialog(false)
      loadChannels()
    } catch (error) {
      console.error('Error creating channel:', error)
      alert('Failed to create channel. Please try again.')
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
    return userRole === 'admin' || userRole === 'super_admin'
  }

  const canDeleteChannel = (channel: Channel) => {
    return userRole === 'admin' || userRole === 'super_admin'
  }

  const canSendMessage = (channel: Channel) => {
    if (channel.channel_type === 'announcement') {
      return userRole === 'admin' || userRole === 'super_admin'
    }
    return true
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
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Communication Hub</h1>
        <p className="text-gray-600">Manage messaging channels and communications</p>
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
                              <SelectItem value="announcement">Announcement</SelectItem>
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
                        <Button onClick={handleDebugCreateChannel} className="w-full mt-2" variant="outline">
                          Create as Admin (Debug)
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