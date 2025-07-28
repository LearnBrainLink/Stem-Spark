'use client'

import { useState, useEffect, useRef, useCallback, useMemo } from 'react'
import { supabase } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Label } from '@/components/ui/label'
import { Hash, Users, Plus, ArrowRight, Crown, Reply, X, Send, Upload, Image as ImageIcon, Forward, Wifi, WifiOff } from 'lucide-react'
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
  edited_at?: string
  edited_by?: string
  reply_to_id?: string
  reply_to?: { content: string; profiles: { full_name: string } }
  forwarded_from_id?: string
  forwarded_from?: { content: string; profiles: { full_name: string } }
  is_deleted?: boolean
  reactions?: Record<string, string[]>
  read_by?: string[]
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
  group_role?: string
}

interface User {
  id: string
  full_name: string
  email: string
  role: string
  avatar_url?: string
}

// Connection status enum for better state management
enum ConnectionStatus {
  CONNECTING = 'connecting',
  CONNECTED = 'connected',
  RECONNECTING = 'reconnecting',
  DISCONNECTED = 'disconnected',
  ERROR = 'error'
}

export default function CommunicationHub() {
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [channels, setChannels] = useState<Channel[]>([])
  const [messages, setMessages] = useState<Message[]>([])
  const [selectedChannel, setSelectedChannel] = useState<Channel | null>(null)
  const [newMessage, setNewMessage] = useState('')
  const [replyTo, setReplyTo] = useState<Message | null>(null)
  const [showCreateDialog, setShowCreateDialog] = useState(false)
  const [showForwardDialog, setShowForwardDialog] = useState(false)
  const [forwardingMessage, setForwardingMessage] = useState<Message | null>(null)
  const [targetChannelId, setTargetChannelId] = useState('')
  const [newChannelData, setNewChannelData] = useState({
    name: '',
    description: '',
    channel_type: 'public' as const,
    selectedUsers: [] as string[]
  })
  const [userRole, setUserRole] = useState<string>('')
  
  // Enhanced connection state management
  const [connectionStatus, setConnectionStatus] = useState<ConnectionStatus>(ConnectionStatus.CONNECTING)
  const [isOnline, setIsOnline] = useState(navigator.onLine)
  const [reconnectAttempts, setReconnectAttempts] = useState(0)
  const [lastHeartbeat, setLastHeartbeat] = useState<Date | null>(null)
  
  // Performance optimization refs
  const subscriptionRef = useRef<any>(null)
  const heartbeatIntervalRef = useRef<NodeJS.Timeout | null>(null)
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null)
  const messageQueueRef = useRef<Message[]>([])
  const throttleTimeoutRef = useRef<NodeJS.Timeout | null>(null)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const imageInputRef = useRef<HTMLInputElement>(null)

  // Constants for optimization
  const MAX_RECONNECT_ATTEMPTS = 5
  const HEARTBEAT_INTERVAL = 30000 // 30 seconds
  const RECONNECT_DELAY = 3000 // 3 seconds
  const MESSAGE_BATCH_SIZE = 10
  const MESSAGE_THROTTLE_DELAY = 100 // 100ms

  // Initialize component
  useEffect(() => {
    initializeComponent()
    setupNetworkListeners()
    
    return () => {
      cleanup()
    }
  }, [])

  // Enhanced connection management
  useEffect(() => {
    if (!selectedChannel || !user) return

    // Clean up previous connections
    cleanup()
    
    // Load messages and setup new connection
    loadMessages(selectedChannel.id)
    setupRealtimeSubscription(selectedChannel.id)
    
    // Update URL for persistence
    if (typeof window !== 'undefined') {
      const url = new URL(window.location.href)
      url.searchParams.set('channel', selectedChannel.id)
      window.history.replaceState({ path: url.href }, '', url.href)
    }
  }, [selectedChannel?.id, user?.id])

  // Network status monitoring
  const setupNetworkListeners = useCallback(() => {
    const handleOnline = () => {
      setIsOnline(true)
      if (connectionStatus === ConnectionStatus.DISCONNECTED && selectedChannel) {
        setupRealtimeSubscription(selectedChannel.id)
      }
    }

    const handleOffline = () => {
      setIsOnline(false)
      setConnectionStatus(ConnectionStatus.DISCONNECTED)
    }

    window.addEventListener('online', handleOnline)
    window.addEventListener('offline', handleOffline)

    return () => {
      window.removeEventListener('online', handleOnline)
      window.removeEventListener('offline', handleOffline)
    }
  }, [connectionStatus, selectedChannel])

  // Enhanced realtime subscription with robust error handling
  const setupRealtimeSubscription = useCallback((channelId: string) => {
    if (!channelId || !user?.id) return

    console.log(`Setting up subscription for channel: ${channelId}`)
    setConnectionStatus(ConnectionStatus.CONNECTING)

    const channel = supabase
      .channel(`messages:${channelId}:${user.id}`, {
        config: {
          broadcast: { ack: true },
          presence: { key: user.id }
        }
      })
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'messages',
        filter: `chat_id=eq.${channelId}`
      }, handleRealtimeMessage)
      .on('presence', { event: 'sync' }, () => {
        console.log('Presence synced')
      })
      .subscribe((status, err) => {
        console.log(`Subscription status: ${status}`)
        
        switch (status) {
          case 'SUBSCRIBED':
            setConnectionStatus(ConnectionStatus.CONNECTED)
            setReconnectAttempts(0)
            startHeartbeat()
            break
          case 'CHANNEL_ERROR':
            console.error('Channel error:', err)
            setConnectionStatus(ConnectionStatus.ERROR)
            scheduleReconnect()
            break
          case 'TIMED_OUT':
            console.warn('Subscription timed out')
            setConnectionStatus(ConnectionStatus.RECONNECTING)
            scheduleReconnect()
            break
          case 'CLOSED':
            console.log('Channel closed')
            setConnectionStatus(ConnectionStatus.DISCONNECTED)
            if (isOnline) {
              scheduleReconnect()
            }
            break
        }
      })

    subscriptionRef.current = channel
  }, [user?.id, isOnline])

  // Enhanced message handler with optimistic updates
  const handleRealtimeMessage = useCallback(async (payload: any) => {
    console.log('Realtime message received:', payload)
    
    try {
      if (payload.eventType === 'INSERT') {
        const newMessage = payload.new as Message
        
        // Fetch sender information
        const { data: sender } = await supabase
          .from('profiles')
          .select('full_name, avatar_url, role')
          .eq('id', newMessage.sender_id)
          .single()

        const messageWithSender = {
          ...newMessage,
          sender_name: sender?.full_name || 'Unknown User',
          sender: {
            full_name: sender?.full_name || 'Unknown User',
            avatar_url: sender?.avatar_url,
            role: sender?.role
          }
        }

        // Add to message queue for batch processing
        addMessageToQueue(messageWithSender)
        
      } else if (payload.eventType === 'UPDATE') {
        setMessages(prev => prev.map(msg => 
          msg.id === payload.new.id 
            ? { ...msg, ...payload.new }
            : msg
        ))
      } else if (payload.eventType === 'DELETE') {
        setMessages(prev => prev.filter(msg => msg.id !== payload.old.id))
      }
    } catch (error) {
      console.error('Error handling realtime message:', error)
    }
  }, [])

  // Message batching for performance
  const addMessageToQueue = useCallback((message: Message) => {
    messageQueueRef.current.push(message)
    
    // Clear existing timeout
    if (throttleTimeoutRef.current) {
      clearTimeout(throttleTimeoutRef.current)
    }
    
    // Process queue after delay or when batch size is reached
    if (messageQueueRef.current.length >= MESSAGE_BATCH_SIZE) {
      processMessageQueue()
    } else {
      throttleTimeoutRef.current = setTimeout(processMessageQueue, MESSAGE_THROTTLE_DELAY)
    }
  }, [])

  // Process queued messages in batches
  const processMessageQueue = useCallback(() => {
    if (messageQueueRef.current.length === 0) return

    const queuedMessages = [...messageQueueRef.current]
    messageQueueRef.current = []

    setMessages(prev => {
      const newMessages = [...prev]
      queuedMessages.forEach(message => {
        // Avoid duplicates
        if (!newMessages.find(m => m.id === message.id)) {
          newMessages.push(message)
        }
      })
      return newMessages.sort((a, b) => 
        new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
      )
    })

    // Auto-scroll to bottom
    setTimeout(() => {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
    }, 50)
  }, [])

  // Heartbeat mechanism
  const startHeartbeat = useCallback(() => {
    stopHeartbeat()
    
    heartbeatIntervalRef.current = setInterval(() => {
      if (subscriptionRef.current) {
        try {
          subscriptionRef.current.send({
            type: 'heartbeat',
            timestamp: new Date().toISOString()
          })
          setLastHeartbeat(new Date())
        } catch (error) {
          console.error('Heartbeat failed:', error)
          setConnectionStatus(ConnectionStatus.ERROR)
          scheduleReconnect()
        }
      }
    }, HEARTBEAT_INTERVAL)
  }, [])

  const stopHeartbeat = useCallback(() => {
    if (heartbeatIntervalRef.current) {
      clearInterval(heartbeatIntervalRef.current)
      heartbeatIntervalRef.current = null
    }
  }, [])

  // Intelligent reconnection with exponential backoff
  const scheduleReconnect = useCallback(() => {
    if (reconnectAttempts >= MAX_RECONNECT_ATTEMPTS || !isOnline) {
      console.log('Max reconnect attempts reached or offline')
      setConnectionStatus(ConnectionStatus.DISCONNECTED)
      return
    }

    const delay = Math.min(RECONNECT_DELAY * Math.pow(2, reconnectAttempts), 30000)
    console.log(`Scheduling reconnect in ${delay}ms (attempt ${reconnectAttempts + 1})`)
    
    setConnectionStatus(ConnectionStatus.RECONNECTING)
    setReconnectAttempts(prev => prev + 1)

    reconnectTimeoutRef.current = setTimeout(() => {
      if (selectedChannel && isOnline) {
        setupRealtimeSubscription(selectedChannel.id)
      }
    }, delay)
  }, [reconnectAttempts, selectedChannel, isOnline])

  // Enhanced cleanup
  const cleanup = useCallback(() => {
    if (subscriptionRef.current) {
      console.log('Cleaning up subscription')
      subscriptionRef.current.unsubscribe()
      subscriptionRef.current = null
    }
    
    stopHeartbeat()
    
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current)
      reconnectTimeoutRef.current = null
    }
    
    if (throttleTimeoutRef.current) {
      clearTimeout(throttleTimeoutRef.current)
      throttleTimeoutRef.current = null
    }
    
    messageQueueRef.current = []
  }, [stopHeartbeat])

  const initializeComponent = async () => {
    try {
      const { data: { user: authUser }, error: authError } = await supabase.auth.getUser()
      
      if (authError || !authUser) {
        window.location.href = '/login'
        return
      }
      
      await loadUserProfile(authUser.id)
      await loadChannels()
      
      // Load channel from URL if available
      if (typeof window !== 'undefined') {
        const urlParams = new URLSearchParams(window.location.search)
        const channelIdFromUrl = urlParams.get('channel')
        
        if (channelIdFromUrl && channels.length > 0) {
          const channelToSelect = channels.find(c => c.id === channelIdFromUrl)
          if (channelToSelect) {
            setSelectedChannel(channelToSelect)
          }
        }
      }
    } catch (error) {
      console.error('Error initializing component:', error)
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

      if (error) throw error
      
      setUser(profile)
      setUserRole(profile.role || '')
    } catch (error) {
      console.error('Error loading profile:', error)
    }
  }

  const loadChannels = async () => {
    try {
      const { data: channelData, error } = await supabase
        .from('channels')
        .select('*')
        .order('created_at', { ascending: false })

      if (error) throw error
      
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
        setChannels(channelsWithMemberCount)
      }
    } catch (error) {
      console.error('Error loading channels:', error)
    }
  }

  const loadMessages = async (channelId: string) => {
    try {
      const { data: messagesData, error } = await supabase
        .from('messages')
        .select('*')
        .eq('chat_id', channelId)
        .order('created_at', { ascending: true })

      if (error) {
        console.error('Error loading messages:', error)
        setMessages([])
        return
      }

      if (!messagesData || messagesData.length === 0) {
        setMessages([])
        return
      }

      const senderIds = [...new Set(messagesData.map(msg => msg.sender_id).filter(Boolean))]
      const profilesMap = new Map()

      if (senderIds.length > 0) {
        const { data: profiles } = await supabase
          .from('profiles')
          .select('id, full_name, avatar_url, role')
          .in('id', senderIds)
        
        profiles?.forEach(profile => profilesMap.set(profile.id, profile))
      }

      const formattedMessages = messagesData.map((msg: any) => {
        const sender = profilesMap.get(msg.sender_id)
        return {
          ...msg,
          sender_name: sender?.full_name || 'Unknown User',
          sender: sender ? {
            full_name: sender.full_name,
            avatar_url: sender.avatar_url,
            role: sender.role
          } : { full_name: 'Unknown User', role: 'student' }
        }
      })

      setMessages(formattedMessages)
    } catch (error) {
      console.error('Error in loadMessages:', error)
      setMessages([])
    }
  }

  // Enhanced message sending with optimistic updates
  const handleSendMessage = async () => {
    if (!newMessage.trim() || !user || !selectedChannel) return

    const tempId = `temp-${Date.now()}`
    const tempMessage: Message = {
      id: tempId,
      content: newMessage.trim(),
      sender_id: user.id,
      sender_name: user.full_name,
      channel_id: selectedChannel.id,
      created_at: new Date().toISOString(),
      message_type: 'text',
      sender: {
        full_name: user.full_name,
        avatar_url: user.avatar_url,
        role: user.role
      }
    }

    // Optimistic update
    setMessages(prev => [...prev, tempMessage])
    setNewMessage('')
    setReplyTo(null)

    try {
      const messageData = {
        content: newMessage.trim(),
        chat_id: selectedChannel.id,
        sender_id: user.id,
        message_type: 'text' as const,
        ...(replyTo && { reply_to_id: replyTo.id })
      }

      const { error } = await supabase
        .from('messages')
        .insert(messageData)

      if (error) throw error

      // Remove temporary message (real message will come via subscription)
      setMessages(prev => prev.filter(msg => msg.id !== tempId))

    } catch (error) {
      console.error('Error sending message:', error)
      
      // Remove optimistic update on error
      setMessages(prev => prev.filter(msg => msg.id !== tempId))
      
      // Restore message for retry
      setNewMessage(newMessage.trim())
      alert('Failed to send message. Please try again.')
    }
  }

  const handleDeleteMessage = async (messageId: string) => {
    if (!confirm('Are you sure you want to delete this message?')) return

    try {
      const { error } = await supabase
        .from('messages')
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
      const forwardedContent = `🔄 Forwarded from #${selectedChannel?.name}:\n\n${forwardingMessage.content}`
      
      const { error } = await supabase
        .from('messages')
        .insert({
          content: forwardedContent,
          chat_id: targetChannelId,
          sender_id: user.id,
          message_type: 'text',
          forwarded_from_id: forwardingMessage.id
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

  const handleReply = (message: Message) => {
    setReplyTo(message)
  }

  const cancelReply = () => {
    setReplyTo(null)
  }

  const handleFileUpload = async (file: File) => {
    // File upload implementation
    console.log('File upload:', file.name)
  }

  const handleImageUpload = async (file: File) => {
    // Image upload implementation
    console.log('Image upload:', file.name)
  }

  const canJoinChannel = (channel: Channel) => {
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

  // Connection status indicator
  const ConnectionStatusIndicator = useMemo(() => {
    const getStatusConfig = () => {
      switch (connectionStatus) {
        case ConnectionStatus.CONNECTED:
          return { icon: Wifi, color: 'text-green-500', text: 'Connected' }
        case ConnectionStatus.CONNECTING:
          return { icon: Wifi, color: 'text-yellow-500', text: 'Connecting...' }
        case ConnectionStatus.RECONNECTING:
          return { icon: Wifi, color: 'text-orange-500', text: `Reconnecting... (${reconnectAttempts}/${MAX_RECONNECT_ATTEMPTS})` }
        case ConnectionStatus.DISCONNECTED:
          return { icon: WifiOff, color: 'text-red-500', text: 'Disconnected' }
        case ConnectionStatus.ERROR:
          return { icon: WifiOff, color: 'text-red-600', text: 'Connection Error' }
        default:
          return { icon: WifiOff, color: 'text-gray-500', text: 'Unknown' }
      }
    }

    const { icon: StatusIcon, color, text } = getStatusConfig()

    return (
      <div className={`flex items-center space-x-2 ${color}`}>
        <StatusIcon className="w-4 h-4" />
        <span className="text-sm">{text}</span>
        {!isOnline && <span className="text-xs">(Offline)</span>}
      </div>
    )
  }, [connectionStatus, reconnectAttempts, isOnline])

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
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Communication Hub</h1>
              <div className="flex items-center space-x-4 mt-1">
                <p className="text-gray-600">Connect with your learning community</p>
                {ConnectionStatusIndicator}
              </div>
            </div>
            <Link href={getDashboardUrl()}>
              <Button variant="outline">
                <ArrowRight className="w-4 h-4 mr-2" />
                Back to Dashboard
              </Button>
            </Link>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Channels Sidebar */}
          <div className="lg:col-span-1">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span className="flex items-center">
                    <Hash className="w-5 h-5 mr-2" />
                    Channels
                  </span>
                  <Badge variant="secondary">{channels.length}</Badge>
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
                        <div className="flex-1">
                          <h4 className="font-medium text-gray-900">#{channel.name}</h4>
                          <p className="text-sm text-gray-600 truncate">{channel.description}</p>
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
                <CardTitle>
                  {selectedChannel ? `#${selectedChannel.name}` : 'Messages'}
                </CardTitle>
              </CardHeader>
              <CardContent>
                {selectedChannel ? (
                  <div className="flex flex-col h-[calc(100vh-20rem)]">
                    {/* Messages */}
                    <div className="flex-1 overflow-y-auto p-4 space-y-4">
                      {messages.map((message) => {
                        const isOwn = message.sender_id === user?.id
                        const isAdmin = message.sender?.role === 'admin' || message.sender?.role === 'super_admin'
                        
                        return (
                          <div key={message.id} className={`flex space-x-3 ${isOwn ? 'flex-row-reverse space-x-reverse' : ''}`}>
                            <div className="flex-shrink-0">
                              <div className={`h-8 w-8 rounded-full flex items-center justify-center text-white text-sm font-medium ${
                                isOwn ? 'bg-green-500' : isAdmin ? 'bg-purple-500' : 'bg-blue-500'
                              }`}>
                                {isAdmin ? <Crown className="w-4 h-4" /> : message.sender_name.charAt(0).toUpperCase()}
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
                              </div>
                              
                              {/* Reply context */}
                              {message.reply_to && (
                                <div className="mt-1 p-2 bg-gray-100 rounded border-l-2 border-gray-300">
                                  <p className="text-xs text-gray-600">
                                    Replying to {message.reply_to.profiles.full_name}
                                  </p>
                                  <p className="text-sm text-gray-800 truncate">
                                    {message.reply_to.content}
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
                                <p className="text-sm">{message.content}</p>
                              </div>

                              {/* Message actions */}
                              <div className="flex items-center space-x-1 mt-1 opacity-0 group-hover:opacity-100 transition-opacity">
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
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => {
                                    setForwardingMessage(message)
                                    setShowForwardDialog(true)
                                  }}
                                  className="h-6 w-6 p-0"
                                >
                                  <Forward className="w-3 h-3" />
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => handleDeleteMessage(message.id)}
                                  className="h-6 w-6 p-0 text-red-500 hover:text-red-600"
                                >
                                  <X className="w-3 h-3" />
                                </Button>
                              </div>
                            </div>
                          </div>
                        )
                      })}
                      <div ref={messagesEndRef} />
                    </div>

                    {/* Reply banner */}
                    {replyTo && (
                      <div className="p-2 bg-blue-50 border-t border-blue-200 flex items-center justify-between">
                        <div className="flex-1">
                          <p className="text-sm text-blue-800">
                            Replying to {replyTo.sender_name}: {replyTo.content.substring(0, 50)}...
                          </p>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={cancelReply}
                          className="text-blue-600"
                        >
                          <X className="w-4 h-4" />
                        </Button>
                      </div>
                    )}

                    {/* Message input */}
                    {canSendMessage(selectedChannel) && (
                      <div className="flex space-x-2 p-4 border-t">
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

        {/* Forward Message Dialog */}
        <Dialog open={showForwardDialog} onOpenChange={setShowForwardDialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Forward Message</DialogTitle>
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
    </div>
  )
}
