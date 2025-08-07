'use client'

import { useState, useEffect } from 'react'
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
  Trash2,
  Edit,
  Eye,
  Search,
  Filter,
  Calendar,
  User
} from 'lucide-react'

interface Message {
  id: string
  content: string
  sender_id: string
  sender_name: string
  channel_id: string
  channel_name: string
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

export default function AdminMessagingPage() {
  const [channels, setChannels] = useState<Channel[]>([])
  const [messages, setMessages] = useState<Message[]>([])
  const [users, setUsers] = useState<User[]>([])
  const [selectedChannel, setSelectedChannel] = useState<string>('')
  const [selectedMessage, setSelectedMessage] = useState<Message | null>(null)
  const [newMessage, setNewMessage] = useState('')
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedChannelType, setSelectedChannelType] = useState('all')
  const [loading, setLoading] = useState(true)
  const [isCreateChannelOpen, setIsCreateChannelOpen] = useState(false)
  const [isSendMessageOpen, setIsSendMessageOpen] = useState(false)
  const [newChannelData, setNewChannelData] = useState({
    name: '',
    description: '',
    channel_type: 'public' as const,
    selectedUsers: [] as string[]
  })
  const [adminMessageData, setAdminMessageData] = useState({
    content: '',
    channel_id: '',
    message_type: 'text' as const
  })

  useEffect(() => {
    fetchData()
  }, [])

  useEffect(() => {
    if (selectedChannel) {
      fetchMessages(selectedChannel)
      subscribeToMessages(selectedChannel)
    }
  }, [selectedChannel])

  const fetchData = async () => {
    try {
      await Promise.all([
        fetchChannels(),
        fetchUsers(),
        fetchAllMessages()
      ])
    } catch (error) {
      console.error('Error fetching data:', error)
    } finally {
      setLoading(false)
    }
  }

  const fetchChannels = async () => {
    try {
      // Use direct Supabase client approach
      const { createClient } = await import('@supabase/supabase-js')
      
      const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
      const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY
      
      if (!supabaseUrl || !supabaseServiceKey) {
        console.error('Missing Supabase configuration')
        return
      }

      const supabase = createClient(supabaseUrl, supabaseServiceKey, {
        auth: {
          autoRefreshToken: false,
          persistSession: false
        }
      })

      const { data, error } = await supabase
        .from('channels')
        .select('*')
        .order('created_at', { ascending: false })

      if (!error && data) {
        // Get member count for each channel
        const channelsWithMemberCount = await Promise.all(
          data.map(async (channel) => {
            const { count } = await supabase
              .from('chat_participants')
              .select('*', { count: 'exact', head: true })
              .eq('chat_id', channel.id)
            
            return {
              ...channel,
              member_count: count || 0
            }
          })
        )
        setChannels(channelsWithMemberCount)
      }
    } catch (error) {
      console.error('Error fetching channels:', error)
    }
  }

  const fetchUsers = async () => {
    try {
      // Use direct Supabase client approach
      const { createClient } = await import('@supabase/supabase-js')
      
      const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
      const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY
      
      if (!supabaseUrl || !supabaseServiceKey) {
        console.error('Missing Supabase configuration')
        return
      }

      const supabase = createClient(supabaseUrl, supabaseServiceKey, {
        auth: {
          autoRefreshToken: false,
          persistSession: false
        }
      })

      const { data, error } = await supabase
        .from('profiles')
        .select('id, full_name, email, role')
        .order('full_name')

      if (!error && data) {
        setUsers(data)
      }
    } catch (error) {
      console.error('Error fetching users:', error)
    }
  }

  const fetchAllMessages = async () => {
    try {
      // Use direct Supabase client approach
      const { createClient } = await import('@supabase/supabase-js')
      
      const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
      const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY
      
      if (!supabaseUrl || !supabaseServiceKey) {
        console.error('Missing Supabase configuration')
        return
      }

      const supabase = createClient(supabaseUrl, supabaseServiceKey, {
        auth: {
          autoRefreshToken: false,
          persistSession: false
        }
      })

      const { data, error } = await supabase
        .from('messages')
        .select(`
          *,
          profiles:profiles(full_name),
          channels:channels(name)
        `)
        .order('created_at', { ascending: false })
        .limit(100)

      if (!error && data) {
        setMessages(data.map((msg: any) => ({
          ...msg,
          sender_name: msg.profiles?.full_name || 'Unknown',
          channel_name: msg.channels?.name || 'Unknown'
        })))
      }
    } catch (error) {
      console.error('Error fetching messages:', error)
    }
  }

  const fetchMessages = async (channelId: string) => {
    try {
      // Use direct Supabase client approach
      const { createClient } = await import('@supabase/supabase-js')
      
      const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
      const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY
      
      if (!supabaseUrl || !supabaseServiceKey) {
        console.error('Missing Supabase configuration')
        return
      }

      const supabase = createClient(supabaseUrl, supabaseServiceKey, {
        auth: {
          autoRefreshToken: false,
          persistSession: false
        }
      })

      const { data, error } = await supabase
        .from('messages')
        .select(`
          *,
          profiles:profiles(full_name),
          channels:channels(name)
        `)
        .eq('channel_id', channelId)
        .order('created_at', { ascending: true })

      if (!error && data) {
        setMessages(data.map((msg: any) => ({
          ...msg,
          sender_name: msg.profiles?.full_name || 'Unknown',
          channel_name: msg.channels?.name || 'Unknown'
        })))
      }
    } catch (error) {
      console.error('Error fetching messages:', error)
    }
  }

  const subscribeToMessages = async (channelId: string) => {
    try {
      // Use direct Supabase client approach
      const { createClient } = await import('@supabase/supabase-js')
      
      const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
      const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY
      
      if (!supabaseUrl || !supabaseServiceKey) {
        console.error('Missing Supabase configuration')
        return
      }

      const supabase = createClient(supabaseUrl, supabaseServiceKey, {
        auth: {
          autoRefreshToken: false,
          persistSession: false
        }
      })

      const subscription = supabase
        .channel(`messages:${channelId}`)
        .on('postgres_changes', {
          event: 'INSERT',
          schema: 'public',
          table: 'messages',
          filter: `chat_id=eq.${channelId}`
        }, (payload: any) => {
          const newMessage = payload.new as Message
          setMessages(prev => [...prev, newMessage])
        })
        .subscribe()

      return () => subscription.unsubscribe()
    } catch (error) {
      console.error('Error subscribing to messages:', error)
    }
  }

  const createChannel = async () => {
    try {
      // Use direct Supabase client approach
      const { createClient } = await import('@supabase/supabase-js')
      
      const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
      const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY
      
      if (!supabaseUrl || !supabaseServiceKey) {
        console.error('Missing Supabase configuration')
        return
      }

      const supabase = createClient(supabaseUrl, supabaseServiceKey, {
        auth: {
          autoRefreshToken: false,
          persistSession: false
        }
      })

      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      const { data: channel, error } = await supabase
        .from('channels')
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
          chat_id: channel.id,
          role: 'member'
        }))

        await supabase
          .from('chat_participants')
          .insert(memberInserts)
      }

      // Add creator as admin
      await supabase
        .from('chat_participants')
        .insert({
          user_id: user.id,
          chat_id: channel.id,
          role: 'admin'
        })

      setNewChannelData({
        name: '',
        description: '',
        channel_type: 'public',
        selectedUsers: []
      })
      setIsCreateChannelOpen(false)
      fetchChannels()
    } catch (error) {
      console.error('Error creating channel:', error)
    }
  }

  const sendAdminMessage = async () => {
    try {
      // Use direct Supabase client approach
      const { createClient } = await import('@supabase/supabase-js')
      
      const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
      const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY
      
      if (!supabaseUrl || !supabaseServiceKey) {
        console.error('Missing Supabase configuration')
        return
      }

      const supabase = createClient(supabaseUrl, supabaseServiceKey, {
        auth: {
          autoRefreshToken: false,
          persistSession: false
        }
      })

      const { data: { user } } = await supabase.auth.getUser()
      if (!user || !adminMessageData.content.trim()) return

      const { error } = await supabase
        .from('messages')
        .insert({
          chat_id: adminMessageData.channel_id,
          sender_id: user.id,
          content: adminMessageData.content,
          message_type: adminMessageData.message_type
        })

      if (error) throw error

      setAdminMessageData({
        content: '',
        channel_id: '',
        message_type: 'text'
      })
      setIsSendMessageOpen(false)
      fetchAllMessages()
    } catch (error) {
      console.error('Error sending message:', error)
    }
  }

  const deleteMessage = async (messageId: string) => {
    try {
      // Use direct Supabase client approach
      const { createClient } = await import('@supabase/supabase-js')
      
      const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
      const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY
      
      if (!supabaseUrl || !supabaseServiceKey) {
        console.error('Missing Supabase configuration')
        return
      }

      const supabase = createClient(supabaseUrl, supabaseServiceKey, {
        auth: {
          autoRefreshToken: false,
          persistSession: false
        }
      })

      const { error } = await supabase
        .from('messages')
        .delete()
        .eq('id', messageId)

      if (error) throw error

      setMessages(prev => prev.filter(msg => msg.id !== messageId))
    } catch (error) {
      console.error('Error deleting message:', error)
    }
  }

  const deleteChannel = async (channelId: string) => {
    try {
      // Use direct Supabase client approach
      const { createClient } = await import('@supabase/supabase-js')
      
      const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
      const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY
      
      if (!supabaseUrl || !supabaseServiceKey) {
        console.error('Missing Supabase configuration')
        return
      }

      const supabase = createClient(supabaseUrl, supabaseServiceKey, {
        auth: {
          autoRefreshToken: false,
          persistSession: false
        }
      })

      // Delete all messages in the channel
      await supabase
        .from('messages')
        .delete()
        .eq('chat_id', channelId)

      // Delete all channel members
      await supabase
        .from('chat_participants')
        .delete()
        .eq('chat_id', channelId)

      // Delete the channel
      await supabase
        .from('channels')
        .delete()
        .eq('id', channelId)

      fetchChannels()
      if (selectedChannel === channelId) {
        setSelectedChannel('')
      }
    } catch (error) {
      console.error('Error deleting channel:', error)
    }
  }

  const filteredChannels = channels.filter(channel => {
    const matchesSearch = channel.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         channel.description.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesType = selectedChannelType === 'all' || channel.channel_type === selectedChannelType
    
    return matchesSearch && matchesType
  })

  const filteredMessages = messages.filter(message => {
    return message.content.toLowerCase().includes(searchTerm.toLowerCase()) ||
           message.sender_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
           message.channel_name.toLowerCase().includes(searchTerm.toLowerCase())
  })

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-xl">Loading messaging system...</div>
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
              <h1 className="text-3xl font-bold text-gray-900">Admin Messaging</h1>
              <p className="mt-2 text-gray-600">Manage all communication channels and messages</p>
            </div>
            <div className="mt-4 md:mt-0 flex space-x-3">
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
                          <SelectItem value="announcement">Announcement</SelectItem>
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

              <Dialog open={isSendMessageOpen} onOpenChange={setIsSendMessageOpen}>
                <DialogTrigger asChild>
                  <Button variant="outline">
                    <Send className="w-4 h-4 mr-2" />
                    Send Message
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Send Admin Message</DialogTitle>
                    <DialogDescription>
                      Send a message to any channel as an administrator.
                    </DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div>
                      <label className="text-sm font-medium">Channel</label>
                      <Select
                        value={adminMessageData.channel_id}
                        onValueChange={(value) => setAdminMessageData(prev => ({ ...prev, channel_id: value }))}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select channel" />
                        </SelectTrigger>
                        <SelectContent>
                          {channels.map(channel => (
                            <SelectItem key={channel.id} value={channel.id}>
                              {channel.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <label className="text-sm font-medium">Message Type</label>
                      <Select
                        value={adminMessageData.message_type}
                        onValueChange={(value: any) => setAdminMessageData(prev => ({ ...prev, message_type: value }))}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="text">Text</SelectItem>
                          <SelectItem value="system">System Message</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <label className="text-sm font-medium">Message</label>
                      <Textarea
                        value={adminMessageData.content}
                        onChange={(e) => setAdminMessageData(prev => ({ ...prev, content: e.target.value }))}
                        placeholder="Enter your message"
                        rows={4}
                      />
                    </div>
                    <Button onClick={sendAdminMessage} className="w-full">
                      Send Message
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
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
                          <h4 className="font-medium text-gray-900">{channel.name}</h4>
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
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation()
                            deleteChannel(channel.id)
                          }}
                        >
                          <Trash2 className="w-4 h-4 text-red-500" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Messages Area */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle>All Messages</CardTitle>
                <div className="flex space-x-2">
                  <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                    <Input
                      placeholder="Search messages..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4 max-h-96 overflow-y-auto">
                  {filteredMessages.map((message) => (
                    <div key={message.id} className="p-4 border rounded-lg">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center space-x-2 mb-2">
                            <h4 className="font-medium text-gray-900">{message.sender_name}</h4>
                            <Badge variant="outline" className="text-xs">
                              {message.channel_name}
                            </Badge>
                            <Badge variant={message.message_type === 'system' ? 'default' : 'secondary'} className="text-xs">
                              {message.message_type}
                            </Badge>
                          </div>
                          <p className="text-gray-700 mb-2">{message.content}</p>
                          <div className="flex items-center text-xs text-gray-500">
                            <Calendar className="w-3 h-3 mr-1" />
                            {new Date(message.created_at).toLocaleString()}
                          </div>
                        </div>
                        <div className="flex space-x-1">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setSelectedMessage(message)}
                          >
                            <Eye className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => deleteMessage(message.id)}
                          >
                            <Trash2 className="w-4 h-4 text-red-500" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
} 