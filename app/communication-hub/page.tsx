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
  Users, 
  Search, 
  Send, 
  Plus, 
  Settings, 
  FileText, 
  ImageIcon,
  Paperclip,
  X,
  Download
} from 'lucide-react'

interface Message {
  id: string
  content: string
  sender_id: string
  sender_name: string
  chat_id: string
  created_at: string
  message_type: 'text' | 'file' | 'image' | 'system'
  edited?: boolean
  edited_at?: string
  seen_by?: string[]
  forwarded_from?: string
  reply_to?: string
  deleted_for_everyone?: boolean
  deleted_for_sender?: boolean
  reactions?: any
  read_receipts?: any
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
  const [uploadingFile, setUploadingFile] = useState(false)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [newChannelData, setNewChannelData] = useState({
    name: '',
    description: '',
    channel_type: 'public' as 'public' | 'announcement',
    selectedUsers: [] as string[]
  })

  const supabase = createClient()

  useEffect(() => {
    checkUser()
    fetchData()
    
    // Initialize Supabase real-time
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      console.log('Auth state changed:', event, session?.user?.id)
    })
    
    return () => {
      subscription.unsubscribe()
    }
  }, [])

  useEffect(() => {
    if (selectedChannel) {
      console.log('Channel selected, fetching messages and setting up subscription:', selectedChannel)
      fetchMessages(selectedChannel)
      const cleanup = subscribeToMessages(selectedChannel)
      
      // Cleanup function for the subscription
      return () => {
        console.log('Cleaning up subscription for channel:', selectedChannel)
        if (cleanup) cleanup()
      }
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
        .eq('type', 'general')

      if (channelsError) {
        console.error('Error fetching public channels:', channelsError)
        return
      }

      if (!publicChannels || publicChannels.length === 0) {
        console.log('No public channels found')
        return
      }

      // Check if user is already a member of all public channels
      const { data: existingMemberships } = await supabase
        .from('chat_participants')
        .select('chat_id')
        .eq('user_id', user.id)
        .in('chat_id', publicChannels.map(c => c.id))

      const existingChatIds = existingMemberships?.map(m => m.chat_id) || []
      const channelsToJoin = publicChannels.filter(c => !existingChatIds.includes(c.id))

      if (channelsToJoin.length > 0) {
        console.log(`Adding user to ${channelsToJoin.length} public channels`)
        
        for (const channel of channelsToJoin) {
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
        console.log('Found channels:', channels.map(c => ({ id: c.id, name: c.name, type: c.type })))
        
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
                channel_type: channel.type,
                member_count: count || 0
              }
            } catch (error) {
              console.error(`Error getting member count for channel ${channel.id}:`, error)
              return {
                ...channel,
                channel_type: channel.type,
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
        .eq('chat_id', channelId)
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
      console.log('Setting up subscription for channel:', channelId)
      
      // Clean up any existing subscription first
      supabase.removeAllChannels()
      
      const subscription = supabase
        .channel(`chat-channel-${channelId}`)
        .on('postgres_changes', {
          event: 'INSERT',
          schema: 'public',
          table: 'messages',
          filter: `chat_id=eq.${channelId}`
        }, async (payload) => {
          console.log('Real-time message received:', payload)
          const newMessage = payload.new as Message
          
          // Fetch the sender name for the new message
          try {
            const { data: profile } = await supabase
              .from('profiles')
              .select('full_name')
              .eq('id', newMessage.sender_id)
              .single()
            
            const messageWithSender = {
              ...newMessage,
              sender_name: profile?.full_name || 'Unknown'
            }
            console.log('Adding new message to UI:', messageWithSender)
            setMessages(prev => [...prev, messageWithSender])
          } catch (error: any) {
            console.error('Error fetching sender name for new message:', error)
            const messageWithSender = {
              ...newMessage,
              sender_name: 'Unknown'
            }
            console.log('Adding new message to UI (with unknown sender):', messageWithSender)
            setMessages(prev => [...prev, messageWithSender])
          }
        })
        .on('postgres_changes', {
          event: 'DELETE',
          schema: 'public',
          table: 'messages',
          filter: `chat_id=eq.${channelId}`
        }, (payload) => {
          console.log('Message deleted:', payload.old)
          setMessages(prev => prev.filter(msg => msg.id !== payload.old.id))
        })
        .on('postgres_changes', {
          event: 'UPDATE',
          schema: 'public',
          table: 'messages',
          filter: `chat_id=eq.${channelId}`
        }, (payload) => {
          console.log('Message updated:', payload.new)
          setMessages(prev => prev.map(msg => 
            msg.id === payload.new.id ? { ...msg, ...payload.new } : msg
          ))
        })
        .subscribe((status) => {
          console.log('Subscription status:', status)
          if (status === 'SUBSCRIBED') {
            console.log('Successfully subscribed to real-time updates for channel:', channelId)
          } else if (status === 'CHANNEL_ERROR') {
            console.error('Failed to subscribe to real-time updates for channel:', channelId)
          }
        })

      return () => {
        console.log('Cleaning up subscription for channel:', channelId)
        subscription.unsubscribe()
      }
    } catch (error) {
      console.error('Error setting up message subscription:', error)
    }
  }

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      setSelectedFile(file)
    }
  }

  const uploadFile = async (file: File): Promise<string | null> => {
    try {
      setUploadingFile(true)
      
      const formData = new FormData()
      formData.append('file', file)
      formData.append('type', file.type.startsWith('image/') ? 'image' : 'file')

      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Upload failed')
      }

      const result = await response.json()
      return result.url
    } catch (error) {
      console.error('Error uploading file:', error)
      alert(`Failed to upload file: ${error instanceof Error ? error.message : 'Unknown error'}`)
      return null
    } finally {
      setUploadingFile(false)
    }
  }

  const sendMessage = async () => {
    if ((!newMessage.trim() && !selectedFile) || !user || !selectedChannel) return

    try {
      console.log('Sending message to channel:', selectedChannel)
      console.log('Message content:', newMessage.trim())
      console.log('User ID:', user.id)
      setMessagesLoading(true)
      
      let messageContent = newMessage.trim()
      let messageType: 'text' | 'file' | 'image' = 'text'

      // Handle file upload if selected
      if (selectedFile) {
        const fileUrl = await uploadFile(selectedFile)
        if (!fileUrl) {
          setMessagesLoading(false)
          return
        }
        
        messageType = selectedFile.type.startsWith('image/') ? 'image' : 'file'
        messageContent = newMessage.trim() || `Sent ${selectedFile.name}`
      }

      // Create optimistic message
      const tempMessage: Message = {
        id: `temp-${Date.now()}`,
        content: messageContent,
        sender_id: user.id,
        sender_name: user.user_metadata?.full_name || 'You',
        chat_id: selectedChannel,
        created_at: new Date().toISOString(),
        message_type: messageType
      }

      console.log('Adding optimistic message:', tempMessage)
      // Add optimistic message to UI
      setMessages(prev => [...prev, tempMessage])

      const { data: message, error } = await supabase
        .from('messages')
        .insert([
          {
            content: messageContent,
            sender_id: user.id,
            chat_id: selectedChannel,
            message_type: messageType
          }
        ])
        .select(`
          *,
          profiles:profiles(full_name)
        `)
        .single()

      if (error) {
        console.error('Error sending message:', error)
        // Remove optimistic message on error
        setMessages(prev => prev.filter(msg => msg.id !== tempMessage.id))
        alert(`Failed to send message: ${error.message}`)
        return
      }

      console.log('Message sent successfully:', message)
      setNewMessage('')
      setSelectedFile(null)
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
              .from('chat_participants')
              .insert({
                user_id: userId,
                chat_id: channel.id,
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
        channel_type: 'public' as const,
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
    if (!user) return false
    if (userRole === 'admin' || userRole === 'super_admin') return true
    return channel.channel_type !== 'announcement'
  }

  const canViewChannel = (channel: Channel) => {
    return true // For now, all users can view all channels
  }

  const canCreateChannel = () => {
    return userRole === 'admin' || userRole === 'super_admin'
  }

  const getUserColor = (userId: string) => {
    const colors = [
      'bg-blue-500', 'bg-green-500', 'bg-yellow-500', 'bg-red-500',
      'bg-purple-500', 'bg-pink-500', 'bg-indigo-500', 'bg-teal-500'
    ]
    const index = userId.charCodeAt(0) % colors.length
    return colors[index]
  }

  const isOwnMessage = (message: Message) => {
    return message.sender_id === user?.id
  }

  const formatTime = (timestamp: string) => {
    return new Date(timestamp).toLocaleTimeString([], { 
      hour: '2-digit', 
      minute: '2-digit' 
    })
  }

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  const renderMessage = (message: Message) => {
    const isOwn = isOwnMessage(message)
    
    return (
      <div key={message.id} className={`flex ${isOwn ? 'justify-end' : 'justify-start'} mb-4`}>
        <div className={`max-w-xs lg:max-w-md ${isOwn ? 'order-2' : 'order-1'}`}>
          {!isOwn && (
            <div className="flex items-center mb-1">
              <div className={`w-8 h-8 rounded-full ${getUserColor(message.sender_id)} flex items-center justify-center text-white text-sm font-bold mr-2`}>
                {message.sender_name.charAt(0).toUpperCase()}
              </div>
              <span className="text-sm text-gray-600">{message.sender_name}</span>
            </div>
          )}
          
          <div className={`rounded-lg px-4 py-2 ${
            isOwn 
              ? 'bg-blue-500 text-white' 
              : 'bg-gray-100 text-gray-800'
          }`}>
            <p>{message.content}</p>
          </div>
          
          <div className={`text-xs text-gray-500 mt-1 ${isOwn ? 'text-right' : 'text-left'}`}>
            {formatTime(message.created_at)}
          </div>
        </div>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-xl font-semibold">Loading Communication Hub...</div>
      </div>
    )
  }

  const selectedChannelData = channels.find(c => c.id === selectedChannel)

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar */}
      <div className="w-80 bg-white border-r border-gray-200 flex flex-col">
        {/* Header */}
        <div className="p-4 border-b border-gray-200">
          <h1 className="text-xl font-bold text-gray-800">Communication Hub</h1>
          <p className="text-sm text-gray-500">Stay connected with your community</p>
        </div>

        {/* Channel List */}
        <div className="flex-1 overflow-y-auto">
          <div className="p-4">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-800">Channels</h2>
              {canCreateChannel() && (
                <Button
                  onClick={() => setIsCreateChannelOpen(true)}
                  size="sm"
                  className="flex items-center space-x-1"
                >
                  <Plus className="w-4 h-4" />
                  <span>New</span>
                </Button>
              )}
            </div>

            <div className="space-y-2">
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
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-medium text-gray-800">{channel.name}</h3>
                      <p className="text-sm text-gray-500">{channel.description}</p>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Badge variant={channel.channel_type === 'announcement' ? 'destructive' : 'secondary'}>
                        {channel.channel_type}
                      </Badge>
                      <span className="text-xs text-gray-500">{channel.member_count} members</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col">
        {selectedChannel ? (
          <>
            {/* Chat Header */}
            <div className="bg-white border-b border-gray-200 p-4">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-lg font-semibold text-gray-800">
                    {selectedChannelData?.name}
                  </h2>
                  <p className="text-sm text-gray-500">
                    {selectedChannelData?.description}
                  </p>
                </div>
                <div className="flex items-center space-x-2">
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={() => fetchMessages(selectedChannel)}
                  >
                    Refresh
                  </Button>
                  <Badge variant={selectedChannelData?.channel_type === 'announcement' ? 'destructive' : 'secondary'}>
                    {selectedChannelData?.channel_type}
                  </Badge>
                  <span className="text-sm text-gray-500">
                    {selectedChannelData?.member_count} members
                  </span>
                </div>
              </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4">
              {messagesLoading ? (
                <div className="flex items-center justify-center h-full">
                  <div className="text-gray-500">Loading messages...</div>
                </div>
              ) : messages.length === 0 ? (
                <div className="flex items-center justify-center h-full">
                  <div className="text-center text-gray-500">
                    <MessageSquare className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                    <p>No messages yet</p>
                    <p className="text-sm">Start the conversation!</p>
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  {messages.map(renderMessage)}
                </div>
              )}
            </div>

            {/* Message Input */}
            <div className="bg-white border-t border-gray-200 p-4">
              <div className="flex items-end space-x-2">
                <div className="flex-1">
                  <Textarea
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    placeholder="Type your message..."
                    className="min-h-[60px] resize-none"
                    onKeyPress={(e) => {
                      if (e.key === 'Enter' && !e.shiftKey) {
                        e.preventDefault()
                        sendMessage()
                      }
                    }}
                  />
                  
                  {/* File Upload Section */}
                  <div className="flex items-center space-x-2 mt-2">
                    <input
                      type="file"
                      id="file-upload"
                      className="hidden"
                      onChange={handleFileSelect}
                      accept="image/*,.pdf,.doc,.docx,.txt,.zip"
                    />
                    <label
                      htmlFor="file-upload"
                      className="cursor-pointer p-2 text-gray-500 hover:text-gray-700 transition-colors"
                    >
                      <Paperclip className="w-5 h-5" />
                    </label>
                    
                    {selectedFile && (
                      <div className="flex items-center space-x-2 bg-gray-100 rounded px-2 py-1">
                        <span className="text-sm text-gray-600 truncate max-w-32">
                          {selectedFile.name}
                        </span>
                        <button
                          onClick={() => setSelectedFile(null)}
                          className="text-gray-400 hover:text-gray-600"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    )}
                  </div>
                </div>
                
                <Button
                  onClick={sendMessage}
                  disabled={(!newMessage.trim() && !selectedFile) || messagesLoading || uploadingFile}
                  className="px-6"
                >
                  {uploadingFile ? (
                    <div className="flex items-center space-x-2">
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      <span>Uploading...</span>
                    </div>
                  ) : (
                    <div className="flex items-center space-x-2">
                      <Send className="w-4 h-4" />
                      <span>Send</span>
                    </div>
                  )}
                </Button>
              </div>
              
              {!canSendMessage(selectedChannelData!) && (
                <div className="mt-2 text-sm text-red-500">
                  Only admins can send messages in announcement channels
                </div>
              )}
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center text-gray-500">
              <MessageSquare className="w-16 h-16 mx-auto mb-4 text-gray-300" />
              <h3 className="text-lg font-semibold mb-2">Select a Channel</h3>
              <p>Choose a channel from the sidebar to start messaging</p>
            </div>
          </div>
        )}
      </div>

      {/* Create Channel Dialog */}
      <Dialog open={isCreateChannelOpen} onOpenChange={setIsCreateChannelOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Create New Channel</DialogTitle>
            <DialogDescription>
              Create a new channel for your community
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Channel Name
              </label>
              <Input
                value={newChannelData.name}
                onChange={(e) => setNewChannelData({...newChannelData, name: e.target.value})}
                placeholder="Enter channel name"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Description
              </label>
              <Textarea
                value={newChannelData.description}
                onChange={(e) => setNewChannelData({...newChannelData, description: e.target.value})}
                placeholder="Enter channel description"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Channel Type
              </label>
              <Select
                value={newChannelData.channel_type}
                onValueChange={(value) => setNewChannelData({...newChannelData, channel_type: value as 'public' | 'announcement'})}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="public">Public</SelectItem>
                  <SelectItem value="announcement">Announcement</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="flex space-x-2 pt-4">
              <Button onClick={createChannel} className="flex-1">
                Create Channel
              </Button>
              <Button 
                variant="outline" 
                onClick={() => setIsCreateChannelOpen(false)}
                className="flex-1"
              >
                Cancel
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
} 