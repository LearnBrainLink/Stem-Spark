'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Textarea } from '@/components/ui/textarea'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { 
  MessageSquare, 
  Send, 
  Plus, 
  Users, 
  Settings,
  Search,
  Filter
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
  channel_type: 'public' | 'announcement'
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
  const [channels, setChannels] = useState<Channel[]>([])
  const [messages, setMessages] = useState<Message[]>([])
  const [users, setUsers] = useState<User[]>([])
  const [selectedChannel, setSelectedChannel] = useState<string>('')
  const [newMessage, setNewMessage] = useState('')
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedChannelType, setSelectedChannelType] = useState('all')
  const [user, setUser] = useState<any>(null)
  const [userRole, setUserRole] = useState<string>('')
  const [loading, setLoading] = useState(true)
  const [messagesLoading, setMessagesLoading] = useState(false)
  const [isCreateChannelOpen, setIsCreateChannelOpen] = useState(false)
  const [newChannelData, setNewChannelData] = useState({
    name: '',
    description: '',
    channel_type: 'public' as const,
    selectedUsers: [] as string[]
  })

  const supabase = createClient()

  useEffect(() => {
    checkUser()
    fetchData()
  }, [])

  useEffect(() => {
    if (selectedChannel) {
      fetchMessages(selectedChannel)
      subscribeToMessages(selectedChannel)
    }
  }, [selectedChannel])

  const checkUser = async () => {
    const { data: { user } } = await supabase.auth.getUser()
    if (user) {
      setUser(user)
      const { data: profile } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', user.id)
        .single()
      setUserRole(profile?.role || '')
    }
  }

  const fetchData = async () => {
    try {
      await Promise.all([
        fetchUsers()
      ])
      // Only ensure user is in public channels if not creating a channel
      if (!isCreateChannelOpen) {
        await ensureUserInPublicChannels()
      }
      // Refresh channels after ensuring user is in public channels
      await fetchChannels()
    } catch (error) {
      console.error('Error fetching data:', error)
    } finally {
      setLoading(false)
    }
  }

  const ensureUserInPublicChannels = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        console.log('No authenticated user found')
        return
      }

      console.log('Ensuring user is in public channels for user:', user.id)

      // Get all public channels
      const { data: publicChannels, error: channelsError } = await supabase
        .from('channels')
        .select('id')
        .eq('channel_type', 'public')

      if (channelsError) {
        console.error('Error fetching public channels:', channelsError)
        return
      }

      if (!publicChannels || publicChannels.length === 0) {
        console.log('No public channels found')
        return
      }

      console.log('Found public channels:', publicChannels.map(c => c.id))

      // Check which public channels the user is already a member of
      const { data: existingMemberships, error: membershipsError } = await supabase
        .from('chat_participants')
        .select('chat_id')
        .eq('user_id', user.id)
        .in('chat_id', publicChannels.map(c => c.id))

      if (membershipsError) {
        console.error('Error checking existing memberships:', membershipsError)
        return
      }

      const existingChannelIds = existingMemberships?.map(m => m.chat_id) || []
      const channelsToAdd = publicChannels.filter(c => !existingChannelIds.includes(c.id))

      console.log('Existing memberships:', existingChannelIds)
      console.log('Channels to add user to:', channelsToAdd.map(c => c.id))

      // Add user to public channels they're not already in
      if (channelsToAdd.length > 0) {
        // Add users one by one to avoid batch insert issues
        for (const channel of channelsToAdd) {
          try {
            const { error: insertError } = await supabase
              .from('chat_participants')
              .insert({
                user_id: user.id,
                chat_id: channel.id,
                role: 'member'
              })

            if (insertError) {
              console.error(`Error adding user to channel ${channel.id}:`, insertError)
            } else {
              console.log(`Successfully added user to channel ${channel.id}`)
            }
          } catch (error) {
            console.error(`Error adding user to channel ${channel.id}:`, error)
          }
        }
      } else {
        console.log('User is already a member of all public channels')
      }
    } catch (error) {
      console.error('Error ensuring user in public channels:', error)
    }
  }

  const fetchChannels = async () => {
    try {
      // First, get the current user's ID
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        console.error('No authenticated user')
        setChannels([])
        return
      }

      console.log('Fetching channels for user:', user.id)

      // Fetch channels that the user can see (public channels + channels they're members of + channels they created)
      const { data: channels, error } = await supabase
        .from('channels')
        .select('*')
        .order('created_at', { ascending: false })

      if (error) {
        console.error('Error fetching channels:', error)
        setChannels([])
        return
      }

      if (channels) {
        console.log('Found channels:', channels.map(c => ({ id: c.id, name: c.name, type: c.channel_type })))
        
        // Get member counts for each channel (simplified approach)
        const channelsWithMemberCount = await Promise.all(
          channels.map(async (channel) => {
            try {
              const { count } = await supabase
                .from('chat_participants')
                .select('*', { count: 'exact', head: true })
                .eq('chat_id', channel.id)
              
              return {
                ...channel,
                member_count: count || 0
              }
            } catch (error) {
              console.error(`Error getting member count for channel ${channel.id}:`, error)
              return {
                ...channel,
                member_count: 0
              }
            }
          })
        )

        setChannels(channelsWithMemberCount)
        console.log('Channels loaded successfully:', channelsWithMemberCount.length)
      } else {
        console.log('No channels found')
        setChannels([])
      }
    } catch (error) {
      console.error('Error in fetchChannels:', error)
      setChannels([])
    }
  }

  const fetchUsers = async () => {
    const { data, error } = await supabase
      .from('profiles')
      .select('id, full_name, email, role')
      .order('full_name')

    if (!error && data) {
      setUsers(data)
    }
  }

  const fetchMessages = async (channelId: string) => {
    try {
      console.log('Fetching messages for channel:', channelId)
      setMessagesLoading(true)
      
      // First, get basic messages without complex relationships
      const { data, error } = await supabase
        .from('messages')
        .select('*')
        .eq('channel_id', channelId)
        .order('created_at', { ascending: true })

      if (error) {
        console.error('Error loading messages:', error)
        setMessages([])
        // It's possible the user doesn't have access, so don't alert.
        return
      }

      if (data) {
        console.log(`Found ${data.length} messages for channel ${channelId}`)
        
        // Get sender profiles separately
        const senderIds = [...new Set(data.map(msg => msg.sender_id).filter(Boolean))]
        const { data: profiles } = await supabase
          .from('profiles')
          .select('id, full_name, avatar_url')
          .in('id', senderIds)

        const profilesMap = new Map(profiles?.map(p => [p.id, p]) || [])
        
        const formattedMessages = data.map(msg => {
          const sender = profilesMap.get(msg.sender_id)
          return {
            ...msg,
            sender_name: sender?.full_name || 'Unknown User',
            avatar_url: sender?.avatar_url
          }
        })
        
        setMessages(formattedMessages)
      } else {
        console.log('No messages found for channel:', channelId)
        setMessages([])
      }
    } catch (error) {
      console.error('Error in fetchMessages catch block:', error)
      setMessages([])
    } finally {
      setMessagesLoading(false)
    }
  }

  const subscribeToMessages = (channelId: string) => {
    try {
      console.log('Subscribing to messages for channel:', channelId)
      
      const subscription = supabase
        .channel(`messages:${channelId}`)
        .on('postgres_changes', {
          event: 'INSERT',
          schema: 'public',
          table: 'messages',
          filter: `channel_id=eq.${channelId}`
        }, (payload) => {
          console.log('New message received:', payload.new)
          const newMessage = payload.new as Message
          
          // Fetch the sender name for the new message
          supabase
            .from('profiles')
            .select('full_name')
            .eq('id', newMessage.sender_id)
            .single()
            .then(({ data: profile }) => {
              const messageWithSender = {
                ...newMessage,
                sender_name: profile?.full_name || 'Unknown'
              }
              setMessages(prev => [...prev, messageWithSender])
            })
            .catch((error) => {
              console.error('Error fetching sender name for new message:', error)
              const messageWithSender = {
                ...newMessage,
                sender_name: 'Unknown'
              }
              setMessages(prev => [...prev, messageWithSender])
            })
        })
        .subscribe((status) => {
          console.log('Subscription status:', status)
        })

      return () => {
        console.log('Unsubscribing from messages for channel:', channelId)
        subscription.unsubscribe()
      }
    } catch (error) {
      console.error('Error setting up message subscription:', error)
      return () => {}
    }
  }

  const sendMessage = async () => {
    if (!newMessage.trim() || !user || !selectedChannel) return

    try {
      console.log('Sending message to channel:', selectedChannel)
      setMessagesLoading(true)
      
      const { error } = await supabase
        .from('messages')
        .insert([
          {
            content: newMessage,
            sender_id: user.id,
            channel_id: selectedChannel,
            message_type: 'text'
          }
        ])

      if (error) {
        console.error('Error sending message:', error)
        alert(`Failed to send message: ${error.message}`)
        return
      }

      console.log('Message sent successfully')
      setNewMessage('')
    } catch (error) {
      console.error('Error in sendMessage:', error)
      alert('Failed to send message. Please try again.')
    } finally {
      setMessagesLoading(false)
    }
  }

  const createChannel = async () => {
    try {
      if (!user) return

      console.log('Creating channel:', newChannelData.name)

      // Use the API route instead of calling Supabase directly
      const response = await fetch('/api/messaging/channels', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: newChannelData.name,
          description: newChannelData.description,
          channel_type: newChannelData.channel_type,
        }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to create channel')
      }

      const { channel } = await response.json()
      console.log('Channel created successfully:', channel.id)

      // Add other members to the channel if any were selected
      if (newChannelData.selectedUsers.length > 0) {
        for (const userId of newChannelData.selectedUsers) {
          try {
            const { error: memberError } = await supabase
              .from('chat_channel_members')
              .insert({
                user_id: userId,
                channel_id: channel.id,
                role: 'member'
              })

            if (memberError) {
              console.error(`Error adding user ${userId} to channel:`, memberError)
            } else {
              console.log(`Successfully added user ${userId} to channel`)
            }
          } catch (error) {
            console.error(`Error adding user ${userId} to channel:`, error)
          }
        }
      }

      setNewChannelData({
        name: '',
        description: '',
        channel_type: 'public',
        selectedUsers: []
      })
      setIsCreateChannelOpen(false)
      
      // Add the new channel to the local state instead of refetching
      const newChannel = {
        ...channel,
        member_count: 1 + newChannelData.selectedUsers.length
      }
      setChannels(prev => [newChannel, ...prev])
      
      console.log('Channel creation completed successfully')
    } catch (error) {
      console.error('Error creating channel:', error)
      alert(`Failed to create channel: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
  }

  const canSendMessage = (channel: Channel) => {
    if (channel.channel_type === 'announcement') {
      return userRole === 'admin' || userRole === 'super_admin'
    }
    return true
  }

  const canViewChannel = (channel: Channel) => {
    if (channel.channel_type === 'announcement') {
      return userRole === 'admin' || userRole === 'super_admin'
    }
    return true
  }

  const canCreateChannel = () => {
    return userRole === 'student' || userRole === 'intern' || userRole === 'admin' || userRole === 'super_admin'
  }

  const filteredChannels = channels.filter(channel => {
    const matchesSearch = channel.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         channel.description.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesType = selectedChannelType === 'all' || channel.channel_type === selectedChannelType
    
    return matchesSearch && matchesType && canViewChannel(channel)
  })

  // Function to get a consistent color for a user based on their ID
  const getUserColor = (userId: string) => {
    const colors = [
      'bg-blue-500',
      'bg-green-500', 
      'bg-purple-500',
      'bg-pink-500',
      'bg-indigo-500',
      'bg-red-500',
      'bg-yellow-500',
      'bg-teal-500',
      'bg-orange-500',
      'bg-cyan-500'
    ]
    
    // Use the user ID to consistently assign a color
    const hash = userId.split('').reduce((a, b) => {
      a = ((a << 5) - a) + b.charCodeAt(0)
      return a & a
    }, 0)
    
    return colors[Math.abs(hash) % colors.length]
  }

  // Function to check if message is from current user
  const isOwnMessage = (message: Message) => {
    return message.sender_id === user?.id
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
                <Dialog open={isCreateChannelOpen} onOpenChange={setIsCreateChannelOpen}>
                  <DialogTrigger asChild>
                    <Button>
                      <Plus className="w-4 h-4 mr-2" />
                      Create Channel
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Create New Channel</DialogTitle>
                      <DialogDescription>
                        Create a new communication channel for the community.
                      </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4">
                      <div>
                        <label className="text-sm font-medium">Channel Name</label>
                        <Input
                          value={newChannelData.name}
                          onChange={(e) => setNewChannelData(prev => ({ ...prev, name: e.target.value }))}
                          placeholder="Enter channel name"
                        />
                      </div>
                      <div>
                        <label className="text-sm font-medium">Description</label>
                        <Textarea
                          value={newChannelData.description}
                          onChange={(e) => setNewChannelData(prev => ({ ...prev, description: e.target.value }))}
                          placeholder="Enter channel description"
                        />
                      </div>
                      <div>
                        <label className="text-sm font-medium">Channel Type</label>
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
                        <label className="text-sm font-medium">Add Members</label>
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
                      <Button onClick={createChannel} className="w-full">
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
                <CardTitle className="flex items-center justify-between">
                  <span>Channels</span>
                  <Badge variant="secondary">{channels.length}</Badge>
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
                        selectedChannel === channel.id
                          ? 'bg-blue-50 border border-blue-200'
                          : 'hover:bg-gray-50'
                      }`}
                      onClick={() => setSelectedChannel(channel.id)}
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
                      {messagesLoading ? (
                        <div className="text-center py-8 text-gray-500">Loading messages...</div>
                      ) : messages.length === 0 ? (
                        <div className="text-center py-8 text-gray-500">No messages yet in this channel.</div>
                      ) : (
                        messages.map((message) => (
                          <div key={message.id} className={`flex space-x-3 ${isOwnMessage(message) ? 'justify-end' : 'justify-start'}`}>
                            {!isOwnMessage(message) && (
                              <div className="flex-shrink-0">
                                <div className={`h-8 w-8 rounded-full flex items-center justify-center text-white text-sm font-medium ${getUserColor(message.sender_id)}`}>
                                  {message.sender_name.charAt(0).toUpperCase()}
                                </div>
                              </div>
                            )}
                            <div className={`flex-1 max-w-xs ${isOwnMessage(message) ? 'order-first' : ''}`}>
                              {!isOwnMessage(message) && (
                                <div className="flex items-center space-x-2 mb-1">
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
                              )}
                              <div className={`p-3 rounded-lg ${
                                isOwnMessage(message) 
                                  ? 'bg-blue-500 text-white ml-auto' 
                                  : 'bg-gray-100 text-gray-900'
                              }`}>
                                <p className="text-sm">{message.content}</p>
                                {isOwnMessage(message) && (
                                  <div className="text-right mt-1">
                                    <span className="text-xs opacity-70">
                                      {new Date(message.created_at).toLocaleString()}
                                    </span>
                                  </div>
                                )}
                              </div>
                            </div>
                            {isOwnMessage(message) && (
                              <div className="flex-shrink-0">
                                <div className={`h-8 w-8 rounded-full flex items-center justify-center text-white text-sm font-medium ${getUserColor(message.sender_id)}`}>
                                  {message.sender_name.charAt(0).toUpperCase()}
                                </div>
                              </div>
                            )}
                          </div>
                        ))
                      )}
                    </div>

                    {/* Message Input */}
                    <div className="border-t border-gray-200 pt-4">
                      {canSendMessage(channels.find(c => c.id === selectedChannel)!) ? (
                        <div className="flex space-x-2">
                          <Input
                            type="text"
                            value={newMessage}
                            onChange={(e) => setNewMessage(e.target.value)}
                            onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
                            placeholder="Type your message..."
                            className="flex-1"
                          />
                          <Button
                            onClick={sendMessage}
                            disabled={!newMessage.trim() || messagesLoading}
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