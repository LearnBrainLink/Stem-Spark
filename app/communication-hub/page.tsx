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
      // Ensure user is added to public channels
      await ensureUserInPublicChannels()
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
        .from('chat_channels')
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
        .from('chat_channel_members')
        .select('channel_id')
        .eq('user_id', user.id)
        .in('channel_id', publicChannels.map(c => c.id))

      if (membershipsError) {
        console.error('Error checking existing memberships:', membershipsError)
        return
      }

      const existingChannelIds = existingMemberships?.map(m => m.channel_id) || []
      const channelsToAdd = publicChannels.filter(c => !existingChannelIds.includes(c.id))

      console.log('Existing memberships:', existingChannelIds)
      console.log('Channels to add user to:', channelsToAdd.map(c => c.id))

      // Add user to public channels they're not already in
      if (channelsToAdd.length > 0) {
        // Add users one by one to avoid batch insert issues
        for (const channel of channelsToAdd) {
          try {
            const { error: insertError } = await supabase
              .from('chat_channel_members')
              .insert({
                user_id: user.id,
                channel_id: channel.id,
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
        return
      }

      console.log('Fetching channels for user:', user.id)

      // Fetch channels that the user can see (public channels + channels they're members of)
      const { data: channels, error } = await supabase
        .from('chat_channels')
        .select('*')
        .order('created_at', { ascending: false })

      if (error) {
        console.error('Error fetching channels:', error)
        return
      }

      if (channels) {
        console.log('Found channels:', channels.map(c => ({ id: c.id, name: c.name, type: c.channel_type })))
        
        // Get member counts for each channel (simplified approach)
        const channelsWithMemberCount = await Promise.all(
          channels.map(async (channel) => {
            try {
              const { count } = await supabase
                .from('chat_channel_members')
                .select('*', { count: 'exact', head: true })
                .eq('channel_id', channel.id)
              
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
        
        // Set first channel as selected if none selected
        if (channelsWithMemberCount.length > 0 && !selectedChannel) {
          setSelectedChannel(channelsWithMemberCount[0].id)
        }
      }
    } catch (error) {
      console.error('Error in fetchChannels:', error)
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

  const sendMessage = async () => {
    if (!newMessage.trim() || !user || !selectedChannel) return

    const { error } = await supabase
      .from('chat_messages')
      .insert([
        {
          content: newMessage,
          sender_id: user.id,
          channel_id: selectedChannel,
          message_type: 'text'
        }
      ])

    if (!error) {
      setNewMessage('')
    }
  }

  const createChannel = async () => {
    try {
      if (!user) return

      console.log('Creating channel:', newChannelData.name)

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

      if (error) {
        console.error('Error creating channel:', error)
        throw new Error(`Failed to create channel: ${error.message}`)
      }

      console.log('Channel created successfully:', channel.id)

      // Add creator as admin first
      const { error: adminError } = await supabase
        .from('chat_channel_members')
        .insert({
          user_id: user.id,
          channel_id: channel.id,
          role: 'admin'
        })

      if (adminError) {
        console.error('Error adding creator as admin:', adminError)
        throw new Error(`Failed to add creator as admin: ${adminError.message}`)
      }

      console.log('Creator added as admin successfully')

      // Add other members to the channel (one by one to avoid batch issues)
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
      
      // Refresh channels
      await fetchChannels()
      
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
                            {userRole === 'admin' || userRole === 'super_admin' ? (
                              <SelectItem value="announcement">Announcement</SelectItem>
                            ) : null}
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