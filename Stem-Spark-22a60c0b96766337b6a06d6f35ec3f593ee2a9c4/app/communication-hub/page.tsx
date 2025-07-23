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
  CheckCircle
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

export default function CommunicationHub() {
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [channels, setChannels] = useState<Channel[]>([])
  const [messages, setMessages] = useState<Message[]>([])
  const [selectedChannel, setSelectedChannel] = useState<Channel | null>(null)
  const [newMessage, setNewMessage] = useState('')
  const [users, setUsers] = useState<User[]>([])
  const [unreadCounts, setUnreadCounts] = useState<{[key: string]: number}>({})
  const [showCreateDialog, setShowCreateDialog] = useState(false)
  const [newChannelData, setNewChannelData] = useState({
    name: '',
    description: '',
    channel_type: 'public' as const,
    selectedUsers: [] as string[]
  })
  const [userRole, setUserRole] = useState<string>('')
  const [currentSubscription, setCurrentSubscription] = useState<any>(null)

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
      
      // Auto-add user to group channels based on their role
      await addUserToGroupChannels(userId, profile.role)
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
      // Get user session for authentication
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) {
        console.error('No session found')
        return
      }

      // Use the API route with proper authentication
      const response = await fetch('/api/messaging/channels', {
        headers: {
          'Authorization': `Bearer ${session.access_token}`
        }
      })

      if (response.ok) {
        const { channels: channelData } = await response.json()
        
        if (channelData && channelData.length > 0) {
          setChannels(channelData)
          if (!selectedChannel) {
            setSelectedChannel(channelData[0])
          }
        } else {
          setChannels([])
        }
      } else {
        console.error('Failed to load channels:', response.statusText)
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
      // Get user session for authentication
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) {
        console.error('No session found')
        return
      }

      // Use the API route with proper authentication and no limit
      const response = await fetch(`/api/messaging/messages?channel_id=${channelId}&limit=10000`, {
        headers: {
          'Authorization': `Bearer ${session.access_token}`
        }
      })

      if (response.ok) {
        const { messages: messageData } = await response.json()
        
        if (messageData) {
          setMessages(messageData.map((msg: any) => ({
            ...msg,
            sender_name: msg.profiles?.full_name || 'Unknown'
          })))
        }
      } else {
        console.error('Failed to load messages:', response.statusText)
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
      if (!user) {
        console.error('No user found')
        alert('Please log in to create a channel.')
        return
      }

      console.log('Creating channel with data:', newChannelData)
      console.log('Current user:', user)

      // Test database access first
      const testResult = await testDatabaseAccess()
      if (!testResult.success) {
        console.error('Database access test failed:', testResult.error)
        alert(`Database access failed: ${testResult.error}`)
        return
      }

      console.log('Database access test passed')

      // Validate input
      if (!newChannelData.name.trim()) {
        alert('Please enter a channel name.')
        return
      }

      // Create the channel
      const { data: channel, error } = await supabase
        .from('chat_channels')
        .insert({
          name: newChannelData.name.trim(),
          description: newChannelData.description.trim(),
          channel_type: newChannelData.channel_type,
          created_by: user.id
        })
        .select()
        .single()

      if (error) {
        console.error('Error creating channel:', error)
        console.error('Error details:', {
          message: error.message,
          code: error.code,
          details: error.details,
          hint: error.hint
        })
        alert(`Failed to create channel: ${error.message}`)
        return
      }

      console.log('Channel created successfully:', channel)

      // Add creator as admin immediately
      const { error: memberError } = await supabase
        .from('chat_channel_members')
        .insert({
          user_id: user.id,
          channel_id: channel.id,
          role: 'admin'
        })

      if (memberError) {
        console.error('Error adding creator as member:', memberError)
        console.error('Member error details:', {
          message: memberError.message,
          code: memberError.code,
          details: memberError.details,
          hint: memberError.hint
        })
        // If we can't add the creator as member, we should delete the channel
        await supabase.from('chat_channels').delete().eq('id', channel.id)
        alert(`Failed to create channel: ${memberError.message}`)
        return
      }

      console.log('Creator added as admin successfully')

      // Add selected members to the channel
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
          console.error('Error adding members:', membersError)
          // Don't fail the entire operation if adding members fails
        } else {
          console.log('Members added successfully')
        }
      }

      // Reset form and reload channels
      setNewChannelData({
        name: '',
        description: '',
        channel_type: 'public',
        selectedUsers: []
      })
      setShowCreateDialog(false)
      
      // Reload channels and select the new one
      await loadChannels()
      
      // Find and select the newly created channel
      const newChannel = channels.find(c => c.id === channel.id)
      if (newChannel) {
        setSelectedChannel(newChannel)
      }

      console.log('Channel creation completed successfully')
      alert('Channel created successfully!')
    } catch (error) {
      console.error('Error creating channel:', error)
      alert('Failed to create channel. Please try again.')
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
    return userRole === 'student' || userRole === 'intern' || userRole === 'admin' || userRole === 'super_admin'
  }

  const canSendMessage = (channel: Channel) => {
    if (channel.channel_type === 'announcement') {
      return userRole === 'admin' || userRole === 'super_admin'
    }
    return true
  }

  // Add this function after the existing functions
  const testDatabaseAccess = async () => {
    try {
      console.log('Testing database access...')
      
      // Test 1: Check authentication
      const { data: { user: authUser }, error: authError } = await supabase.auth.getUser()
      if (authError || !authUser) {
        console.error('Authentication test failed:', authError)
        return { success: false, error: 'Authentication failed' }
      }
      console.log('Authentication test passed:', authUser.id)

      // Test 2: Check if we can read profiles
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', authUser.id)
        .single()

      if (profileError) {
        console.error('Profile read test failed:', profileError)
        return { success: false, error: 'Cannot read profile' }
      }
      console.log('Profile read test passed:', profile)

      // Test 3: Check if we can read channels
      const { data: channels, error: channelsError } = await supabase
        .from('chat_channels')
        .select('*')
        .limit(1)

      if (channelsError) {
        console.error('Channels read test failed:', channelsError)
        return { success: false, error: 'Cannot read channels' }
      }
      console.log('Channels read test passed:', channels)

      return { success: true, user: authUser, profile }
    } catch (error) {
      console.error('Database access test failed:', error)
      return { success: false, error: 'Database access failed' }
    }
  }

  const addUserToGroupChannels = async (userId: string, role: string) => {
    try {
      // Get or create group channels based on role
      const groupChannelTypes = {
        'admin': 'admin_group',
        'intern': 'intern_group', 
        'parent': 'parent_group',
        'student': 'student_group'
      }

      const channelType = groupChannelTypes[role as keyof typeof groupChannelTypes]
      if (!channelType) return

      // Check if group channel exists, if not create it
      let { data: channel } = await supabase
        .from('chat_channels')
        .select('*')
        .eq('channel_type', channelType)
        .single()

      if (!channel) {
        // Create the group channel
        const { data: newChannel } = await supabase
          .from('chat_channels')
          .insert({
            name: `${role.charAt(0).toUpperCase() + role.slice(1)}s Group`,
            description: `Group channel for ${role}s`,
            channel_type: channelType,
            created_by: userId
          })
          .select()
          .single()
        
        channel = newChannel
      }

      if (channel) {
        // Add user to the channel if not already a member
        const { error: memberError } = await supabase
          .from('chat_channel_members')
          .upsert({
            channel_id: channel.id,
            user_id: userId,
            role: 'member'
          }, { onConflict: 'channel_id,user_id' })

        if (memberError) {
          console.error('Error adding user to group channel:', memberError)
        }
      }
    } catch (error) {
      console.error('Error in addUserToGroupChannels:', error)
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
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Communication Hub</h1>
              <p className="mt-2 text-gray-600">Connect with teachers, parents, and administrators</p>
            </div>
            <div className="mt-4 md:mt-0">
              {canCreateChannel() && (
                <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
                  <DialogTrigger asChild>
                    <Button>
                      <Plus className="w-4 h-4 mr-2" />
                      Create Channel
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
                            {userRole === 'admin' || userRole === 'super_admin' ? (
                              <SelectItem value="announcement">Announcement</SelectItem>
                            ) : null}
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
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Channels Sidebar */}
          <div className="lg:col-span-1">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Hash className="w-5 h-5 mr-2" />
                  Channels ({channels.length})
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {channels.map((channel) => (
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
                        <div>
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
      </div>
    </div>
  )
}
