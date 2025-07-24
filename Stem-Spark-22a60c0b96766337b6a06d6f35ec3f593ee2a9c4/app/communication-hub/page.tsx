'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { supabase } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Label } from '@/components/ui/label'
import { Hash, Users, Plus, ArrowRight, Crown, Reply, X, Send, Upload, Image as ImageIcon } from 'lucide-react'
import Link from 'next/link'

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
  reply_to_id?: string
  reply_to?: {
    content: string
    sender: {
      full_name: string
    }
  }
  sender?: {
    full_name: string
    avatar_url?: string
    role?: string
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
  const [userRole, setUserRole] = useState<string>('')
  const [channels, setChannels] = useState<Channel[]>([])
  const [selectedChannel, setSelectedChannel] = useState<Channel | null>(null)
  const [messages, setMessages] = useState<Message[]>([])
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const [newMessage, setNewMessage] = useState('')
  const [replyTo, setReplyTo] = useState<Message | null>(null)
  const [showCreateDialog, setShowCreateDialog] = useState(false)
  const [newChannelData, setNewChannelData] = useState({
    name: '',
    description: '',
    channel_type: 'public' as const,
    selectedUsers: [] as string[]
  })

  const fileInputRef = useRef<HTMLInputElement>(null)
  const imageInputRef = useRef<HTMLInputElement>(null)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const subscriptionRef = useRef<any>(null)

  // Initialize component
  useEffect(() => {
    initializeComponent()
  }, [])

  // Handle channel selection
  useEffect(() => {
    if (selectedChannel) {
      loadMessages(selectedChannel.id)
      setupSubscription(selectedChannel.id)
    }
  }, [selectedChannel])

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const initializeComponent = async () => {
    try {
      const { data: { user: authUser }, error: authError } = await supabase.auth.getUser()
      
      if (authError || !authUser) {
        window.location.href = '/login'
        return
      }

      await loadUserProfile(authUser.id)
      await loadCommunicationData(authUser.id)
    } catch (error) {
      console.error('Error in initializeComponent:', error)
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
      setUserRole((profile?.role as string) || '')
    } catch (error) {
      console.error('Error in loadUserProfile:', error)
    }
  }

  const loadCommunicationData = async (userId: string) => {
    try {
      await Promise.all([
        loadChannels(userId),
        loadUsers(),
        loadUnreadCounts(userId)
      ])
    } catch (error) {
      console.error('Error loading communication data:', error)
    } finally {
      setLoading(false)
    }
  }

  const loadChannels = async (userId: string) => {
    try {
      const { data: memberChannels, error: memberError } = await supabase
        .from('chat_channel_members')
        .select(`
          channel_id,
          chat_channels (*)
        `)
        .eq('user_id', userId)

      if (memberError) {
        console.error('Error loading member channels:', memberError)
        return
      }

      const { data: publicChannels, error: publicError } = await supabase
        .from('chat_channels')
        .select('*')
        .eq('channel_type', 'public')

      if (publicError) {
        console.error('Error loading public channels:', publicError)
        return
      }

      const memberChannelData = memberChannels?.map(m => m.chat_channels).filter(c => c !== null) || [];
      const publicChannelIds = new Set(memberChannelData.map((c: any) => c.id));
      const uniquePublicChannels = publicChannels?.filter(c => !publicChannelIds.has(c.id)) || [];
      
      const allChannels = [...memberChannelData, ...uniquePublicChannels];

      const channelsWithMemberCount = await Promise.all(
        allChannels.map(async (channel: any) => {
          const { count, error: countError } = await supabase
            .from('chat_channel_members')
            .select('*', { count: 'exact', head: true })
            .eq('channel_id', channel.id)
          
          return {
            ...channel,
            member_count: countError ? 0 : count || 0
          }
        })
      )
      
      const sortedChannels = channelsWithMemberCount.sort((a, b) => a.name.localeCompare(b.name))
      setChannels(sortedChannels)
      
      // Set first channel as selected if none selected and no current subscription
      if (sortedChannels.length > 0 && !selectedChannel && !subscriptionRef.current) {
        console.log('Setting initial channel:', sortedChannels[0].name)
        setSelectedChannel(sortedChannels[0])
      }
    } catch (error) {
      console.error('Error loading channels:', error)
    }
  }

  const handleChannelSelect = (channel: Channel) => {
    console.log('Selecting channel:', channel.name, channel.id)
    
    // Only change if it's a different channel
    if (selectedChannel?.id !== channel.id) {
      setSelectedChannel(channel)
    }
  }

  const loadUsers = async () => {
    try {
      const { data: userData, error } = await supabase
        .from('profiles')
        .select('id, full_name, email, role, avatar_url')
        .order('full_name')

      if (error) {
        console.error('Error loading users:', error)
        return
      }

      setUsers(userData as User[])
    } catch (error) {
      console.error('Error in loadUsers:', error)
    }
  }

  const loadUnreadCounts = async (userId: string) => {
    // TODO: Implement unread message counts
  }

  const loadMessages = async (channelId: string) => {
    try {
      console.log('Loading messages for channel:', channelId)
      
      // First, get all messages for the channel
      const { data: messageData, error: messageError } = await supabase
        .from('chat_messages')
        .select('*')
        .eq('channel_id', channelId)
        .order('created_at', { ascending: true })

      if (messageError) {
        console.error('Error loading messages:', messageError)
        return
      }

      if (!messageData || messageData.length === 0) {
        setMessages([])
        return
      }

      // Get unique sender IDs
      const senderIds = [...new Set(messageData.map(msg => msg.sender_id))]

      // Get sender profiles
      const { data: profiles } = await supabase
        .from('profiles')
        .select('id, full_name, avatar_url, role')
        .in('id', senderIds)

      // Create a map of sender profiles
      const senderMap = new Map()
      profiles?.forEach(profile => {
        senderMap.set(profile.id, profile)
      })

      // Format messages with sender information
      const formattedMessages: Message[] = messageData.map(msg => {
        const sender = senderMap.get(msg.sender_id)
        return {
          ...msg,
          sender_name: sender?.full_name || 'Unknown User',
          sender: {
            full_name: sender?.full_name || 'Unknown User',
            avatar_url: sender?.avatar_url,
            role: sender?.role
          }
        }
      })

      setMessages(formattedMessages)
      console.log('Messages loaded:', formattedMessages.length)
    } catch (error) {
      console.error('Error in loadMessages:', error)
    }
  }

  const setupSubscription = useCallback((channelId: string) => {
    try {
      console.log('Setting up subscription for channel:', channelId)
      
      // Clean up existing subscription
      if (subscriptionRef.current) {
        console.log('Cleaning up existing subscription before creating new one')
        subscriptionRef.current.unsubscribe()
        subscriptionRef.current = null
      }

      const subscription = supabase
        .channel(`messages:${channelId}`)
        .on('postgres_changes', {
          event: '*',
          schema: 'public',
          table: 'chat_messages',
          filter: `channel_id=eq.${channelId}`
        }, async (payload) => {
          console.log('Received message update:', payload.eventType)
          
          if (payload.eventType === 'INSERT') {
            const newMessage = payload.new as any
            
            const { data: sender } = await supabase
              .from('profiles')
              .select('full_name, avatar_url, role')
              .eq('id', newMessage.sender_id)
              .single()
            
            const formattedMessage: Message = {
              id: newMessage.id as string,
              content: newMessage.content as string,
              sender_id: newMessage.sender_id as string,
              sender_name: (sender?.full_name as string) || 'Unknown User',
              channel_id: newMessage.channel_id as string,
              created_at: newMessage.created_at as string,
              message_type: (newMessage.message_type as 'text' | 'file' | 'image' | 'system') || 'text',
              file_url: newMessage.file_url as string | undefined,
              image_url: newMessage.image_url as string | undefined,
              image_caption: newMessage.image_caption as string | undefined,
              file_name: newMessage.file_name as string | undefined,
              file_size: newMessage.file_size as number | undefined,
              file_type: newMessage.file_type as string | undefined,
              reply_to_id: newMessage.reply_to_id as string | undefined,
              sender: {
                full_name: (sender?.full_name as string) || 'Unknown User',
                avatar_url: sender?.avatar_url as string | undefined,
                role: sender?.role as string | undefined
              }
            }
            
            setMessages(prev => [...prev, formattedMessage])
          } else if (payload.eventType === 'DELETE') {
            setMessages(prev => prev.filter(msg => msg.id !== payload.old.id));
          }
        })
        .subscribe((status) => {
          console.log('Subscription status for channel', channelId, ':', status)
          
          if (status === 'SUBSCRIBED') {
            console.log('Successfully subscribed to channel:', channelId)
          } else if (status === 'CLOSED') {
            console.log('Subscription closed for channel:', channelId)
            subscriptionRef.current = null
          } else if (status === 'CHANNEL_ERROR') {
            console.error('Channel error for:', channelId)
            // Try to resubscribe after a delay
            setTimeout(() => {
              if (selectedChannel?.id === channelId) {
                console.log('Attempting to resubscribe to channel:', channelId)
                setupSubscription(channelId)
              }
            }, 2000)
          }
        })

      subscriptionRef.current = subscription
      console.log('Subscription setup complete for channel:', channelId)
      
    } catch (error) {
      console.error('Error setting up subscription for channel:', channelId, error)
    }
  }, [selectedChannel?.id])

  const handleSendMessage = async () => {
    if (!newMessage.trim() || !selectedChannel || !user) return

    try {
      const { data: message, error } = await supabase
        .from('chat_messages')
        .insert({
          channel_id: selectedChannel.id,
          sender_id: user.id,
          content: newMessage.trim(),
          message_type: 'text',
          reply_to_id: replyTo?.id || null
        })
        .select('*')
        .single()

      if (error) {
        console.error('Error sending message:', error)
        return
      }

      setNewMessage('')
      setReplyTo(null)
    } catch (error) {
      console.error('Error in handleSendMessage:', error)
    }
  }

  const handleFileUpload = async (file: File) => {
    if (!selectedChannel || !user) return

    try {
      const fileExt = file.name.split('.').pop()
      const fileName = `${Math.random()}.${fileExt}`
      const filePath = `chat-files/${selectedChannel.id}/${fileName}`

      const { error: uploadError } = await supabase.storage
        .from('chat-files')
        .upload(filePath, file)

      if (uploadError) {
        console.error('Error uploading file:', uploadError)
        return
      }

      const { data: { publicUrl } } = supabase.storage
        .from('chat-files')
        .getPublicUrl(filePath)

      const { error } = await supabase
        .from('chat_messages')
        .insert({
          channel_id: selectedChannel.id,
          sender_id: user.id,
          content: `File: ${file.name}`,
          message_type: 'file',
          file_url: publicUrl,
          file_name: file.name,
          file_size: file.size,
          file_type: file.type
        })

      if (error) {
        console.error('Error sending file message:', error)
      }
    } catch (error) {
      console.error('Error in handleFileUpload:', error)
    }
  }

  const handleImageUpload = async (file: File) => {
    if (!selectedChannel || !user) return

    try {
      const fileExt = file.name.split('.').pop()
      const fileName = `${Math.random()}.${fileExt}`
      const filePath = `chat-images/${selectedChannel.id}/${fileName}`

      const { error: uploadError } = await supabase.storage
        .from('chat-images')
        .upload(filePath, file)

      if (uploadError) {
        console.error('Error uploading image:', uploadError)
        return
      }

      const { data: { publicUrl } } = supabase.storage
        .from('chat-images')
        .getPublicUrl(filePath)

      const { error } = await supabase
        .from('chat_messages')
        .insert({
          channel_id: selectedChannel.id,
          sender_id: user.id,
          content: 'Image shared',
          message_type: 'image',
          image_url: publicUrl,
          image_caption: file.name
        })

      if (error) {
        console.error('Error sending image message:', error)
      }
    } catch (error) {
      console.error('Error in handleImageUpload:', error)
    }
  }

  const handleDeleteMessage = async (messageId: string) => {
    try {
      const { error } = await supabase
        .from('chat_messages')
        .delete()
        .eq('id', messageId)
        .eq('sender_id', user?.id)

      if (error) {
        console.error('Error deleting message:', error)
      }
    } catch (error) {
      console.error('Error in handleDeleteMessage:', error)
    }
  }

  const handleReply = (message: Message) => {
    setReplyTo(message)
  }

  const cancelReply = () => {
    setReplyTo(null)
  }

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  const handleCreateChannel = async () => {
    if (!user || !newChannelData.name.trim()) return

    try {
      // Create channel
      const { data: channel, error: channelError } = await supabase
        .from('chat_channels')
        .insert({
          name: newChannelData.name,
          description: newChannelData.description,
          channel_type: newChannelData.channel_type,
          created_by: user.id
        })
        .select()
        .single()

      if (channelError) {
        console.error('Error creating channel:', channelError)
        return
      }

      // Add creator as member
      await supabase
        .from('chat_channel_members')
        .insert({
          channel_id: channel.id,
          user_id: user.id,
          role: 'admin'
        })

      // Add selected users as members
      if (newChannelData.selectedUsers.length > 0) {
        const memberInserts = newChannelData.selectedUsers.map(userId => ({
          channel_id: channel.id,
          user_id: userId,
          role: 'member'
        }))

        await supabase
          .from('chat_channel_members')
          .insert(memberInserts)
      }

      // Reset form
      setNewChannelData({
        name: '',
        description: '',
        channel_type: 'public',
        selectedUsers: []
      })
      setShowCreateDialog(false)
      
      await loadChannels(user.id)
      
      const newChannel = channels.find(c => c.id === channel.id)
      if (newChannel) {
        setSelectedChannel(newChannel)
      }

      alert('Channel created successfully!')
    } catch (error) {
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

  const getDashboardUrl = () => {
    switch (userRole) {
      case 'admin':
      case 'super_admin':
        return '/admin'
      case 'intern':
        return '/intern-dashboard'
      case 'parent':
        return '/parent-dashboard'
      case 'student':
        return '/student-dashboard'
      case 'teacher':
        return '/teacher-dashboard'
      default:
        return '/dashboard'
    }
  }

  const isOwnMessage = (message: Message) => {
    return message.sender_id === user?.id
  }

  const isAdminUser = (message: Message) => {
    return message.sender?.role === 'admin' || message.sender?.role === 'super_admin'
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
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Communication Hub</h1>
              <p className="mt-2 text-gray-600">Connect with teachers, parents, and administrators</p>
            </div>
            <div className="mt-4 md:mt-0 flex gap-2">
              {userRole !== 'admin' && userRole !== 'super_admin' && (
                <Link href={getDashboardUrl()}>
                  <Button variant="outline">
                    <ArrowRight className="w-4 h-4 mr-2 rotate-180" />
                    Back to Dashboard
                  </Button>
                </Link>
              )}
              {canCreateChannel() && (
                <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
                  <DialogTrigger asChild>
                    <Button>
                      <Plus className="w-4 h-4 mr-2" />
                      Create Channel
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Create New Channel</DialogTitle>
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
                      onClick={() => handleChannelSelect(channel)}
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
                      {messages.map((message) => {
                        const isOwn = isOwnMessage(message)
                        const isAdmin = isAdminUser(message)
                        
                        return (
                          <div key={message.id} id={`message-${message.id}`} className={`flex space-x-3 ${isOwn ? 'flex-row-reverse space-x-reverse' : ''}`}>
                            <div className="flex-shrink-0">
                              <div className={`h-8 w-8 rounded-full flex items-center justify-center text-white text-sm font-medium ${
                                isOwn ? 'bg-green-500' : isAdmin ? 'bg-purple-500' : 'bg-blue-500'
                              }`}>
                                {isAdmin && <Crown className="w-3 h-3 mr-1" />}
                                {message.sender_name.charAt(0).toUpperCase()}
                              </div>
                            </div>
                            <div className={`flex-1 ${isOwn ? 'text-right' : ''}`}>
                              <div className={`flex items-center space-x-2 ${isOwn ? 'justify-end' : ''}`}>
                                <span className="text-sm font-medium text-gray-900">
                                  {message.sender_name}
                                  {isAdmin && <Crown className="w-3 h-3 ml-1 text-purple-500" />}
                                </span>
                                <span className="text-xs text-gray-500">
                                  {new Date(message.created_at).toLocaleString()}
                                </span>
                                {message.message_type === 'system' && (
                                  <Badge variant="secondary" className="text-xs">System</Badge>
                                )}
                                {!isOwn && (
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => handleReply(message)}
                                    className="h-6 w-6 p-0"
                                  >
                                    <Reply className="w-3 h-3" />
                                  </Button>
                                )}
                                {isOwn && (
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => handleDeleteMessage(message.id)}
                                    className="h-6 w-6 p-0 text-red-500 hover:text-red-600"
                                  >
                                    <X className="w-3 h-3" />
                                  </Button>
                                )}
                              </div>
                              
                              {/* Reply to message */}
                              {message.reply_to && (
                                <div 
                                  className={`bg-gray-50 border-l-2 border-blue-500 pl-3 py-1 mb-2 rounded cursor-pointer ${isOwn ? 'text-right' : ''}`}
                                  onClick={() => {
                                    const repliedMessageEl = document.getElementById(`message-${message.reply_to_id}`);
                                    repliedMessageEl?.scrollIntoView({ behavior: 'smooth' });
                                  }}
                                >
                                  <p className="text-xs text-gray-600">
                                    Replying to {message.reply_to.sender.full_name}: {message.reply_to.content}
                                  </p>
                                </div>
                              )}
                              
                              {/* Message content */}
                              <div className={`inline-block p-3 rounded-lg ${
                                isOwn 
                                  ? 'bg-green-500 text-white' 
                                  : isAdmin 
                                    ? 'bg-purple-100 text-purple-900' 
                                    : 'bg-gray-100 text-gray-900'
                              }`}>
                                {message.message_type === 'image' && message.image_url && (
                                  <div className="mb-2">
                                    <img 
                                      src={message.image_url} 
                                      alt={message.image_caption || 'Image'} 
                                      className="max-w-xs rounded"
                                    />
                                    {message.image_caption && (
                                      <p className="text-xs mt-1 opacity-75">{message.image_caption}</p>
                                    )}
                                  </div>
                                )}
                                
                                {message.message_type === 'file' && message.file_url && (
                                  <div className="mb-2">
                                    <a 
                                      href={message.file_url} 
                                      target="_blank" 
                                      rel="noopener noreferrer"
                                      className="flex items-center space-x-2 text-blue-600 hover:text-blue-800"
                                    >
                                      <Upload className="w-4 h-4" />
                                      <span>{message.file_name}</span>
                                      <span className="text-xs">({formatFileSize(message.file_size || 0)})</span>
                                    </a>
                                  </div>
                                )}
                                
                                <p className="text-sm">{message.content}</p>
                              </div>
                            </div>
                          </div>
                        )
                      })}
                      <div ref={messagesEndRef} />
                    </div>

                    {/* Reply indicator */}
                    {replyTo && (
                      <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-sm text-blue-900">
                              Replying to <strong>{replyTo.sender_name}</strong>
                            </p>
                            <p className="text-xs text-blue-700 truncate">{replyTo.content}</p>
                          </div>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={cancelReply}
                            className="h-6 w-6 p-0"
                          >
                            <X className="w-3 h-3" />
                          </Button>
                        </div>
                      </div>
                    )}

                    {/* Message input */}
                    {canSendMessage(selectedChannel) && (
                      <div className="flex space-x-2">
                        <div className="flex-1 flex space-x-2">
                          <Input
                            value={newMessage}
                            onChange={(e) => setNewMessage(e.target.value)}
                            onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                            placeholder="Type your message..."
                            className="flex-1"
                          />
                          <input
                            type="file"
                            ref={fileInputRef}
                            onChange={(e) => {
                              const file = e.target.files?.[0]
                              if (file) handleFileUpload(file)
                            }}
                            className="hidden"
                          />
                          <input
                            type="file"
                            ref={imageInputRef}
                            accept="image/*"
                            onChange={(e) => {
                              const file = e.target.files?.[0]
                              if (file) handleImageUpload(file)
                            }}
                            className="hidden"
                          />
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => fileInputRef.current?.click()}
                          >
                            <Upload className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => imageInputRef.current?.click()}
                          >
                            <ImageIcon className="w-4 h-4" />
                          </Button>
                        </div>
                        <Button onClick={handleSendMessage}>
                          <Send className="w-4 h-4" />
                        </Button>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="text-center text-gray-500 py-8">
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
