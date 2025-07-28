'use client'

import { useState, useEffect, useRef, useCallback, useMemo } from 'react'
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
  EyeOff,
  Wifi,
  WifiOff,
  Crown
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
  
  // Enhanced realtime features
  const [showForwardDialog, setShowForwardDialog] = useState(false)
  const [forwardingMessage, setForwardingMessage] = useState<Message | null>(null)
  const [targetChannelId, setTargetChannelId] = useState('')
  const [editingMessage, setEditingMessage] = useState<Message | null>(null)
  const [replyToMessage, setReplyToMessage] = useState<Message | null>(null)
  const [showReactions, setShowReactions] = useState<string | null>(null)
  
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
  const fileInputRef = useRef<HTMLInputElement>(null)
  const imageInputRef = useRef<HTMLInputElement>(null)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  // Constants for optimization
  const MAX_RECONNECT_ATTEMPTS = 5
  const HEARTBEAT_INTERVAL = 30000 // 30 seconds
  const RECONNECT_DELAY = 3000 // 3 seconds
  const MESSAGE_BATCH_SIZE = 10
  const MESSAGE_THROTTLE_DELAY = 100 // 100ms

  // Initialize component
  useEffect(() => {
    checkAuthAndLoadData()
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

    console.log(`Admin setting up subscription for channel: ${channelId}`)
    setConnectionStatus(ConnectionStatus.CONNECTING)

    const channel = supabase
      .channel(`admin-messages:${channelId}:${user.id}`, {
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
        console.log('Admin presence synced')
      })
      .subscribe((status, err) => {
        console.log(`Admin subscription status: ${status}`)
        
        switch (status) {
          case 'SUBSCRIBED':
            setConnectionStatus(ConnectionStatus.CONNECTED)
            setReconnectAttempts(0)
            startHeartbeat()
            break
          case 'CHANNEL_ERROR':
            console.error('Admin channel error:', err)
            setConnectionStatus(ConnectionStatus.ERROR)
            scheduleReconnect()
            break
          case 'TIMED_OUT':
            console.warn('Admin subscription timed out')
            setConnectionStatus(ConnectionStatus.RECONNECTING)
            scheduleReconnect()
            break
          case 'CLOSED':
            console.log('Admin channel closed')
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
    console.log('Admin realtime message received:', payload)
    
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
      console.error('Error handling admin realtime message:', error)
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
          console.error('Admin heartbeat failed:', error)
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
      console.log('Admin: Max reconnect attempts reached or offline')
      setConnectionStatus(ConnectionStatus.DISCONNECTED)
      return
    }

    const delay = Math.min(RECONNECT_DELAY * Math.pow(2, reconnectAttempts), 30000)
    console.log(`Admin: Scheduling reconnect in ${delay}ms (attempt ${reconnectAttempts + 1})`)
    
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
      console.log('Admin: Cleaning up subscription')
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

  const checkAuthAndLoadData = async () => {
    try {
      const { data: { user: authUser }, error: authError } = await supabase.auth.getUser()
      
      if (authError || !authUser) {
        window.location.href = '/login'
        return
      }
      
      await loadUserProfile(authUser.id)
      await loadCommunicationData(authUser.id)
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
        throw error
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
        .from('channels')
        .select('*')
        .order('created_at', { ascending: false })

      if (channelError) {
        throw channelError
      }
      
      if (channelData) {
        const channelsWithMemberCount = await Promise.all(
          channelData.map(async (channel) => {
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
      console.error('Error loading channels:', error)
    }
  }

  const loadUsers = async () => {
    try {
      const { data: userData, error } = await supabase
        .from('profiles')
        .select('id, full_name, email, role, avatar_url')
        .order('full_name')

      if (error) throw error
      
      if (userData) {
        setUsers(userData)
      }
    } catch (error) {
      console.error('Error loading users:', error)
    }
  }

  const loadUnreadCounts = async (userId: string) => {
    try {
      setUnreadCounts({})
    } catch (error) {
      console.error('Error loading unread counts:', error)
    }
  }

  const loadMessages = async (channelId: string) => {
    try {
      const { data: messagesData, error: messagesError } = await supabase
        .from('messages')
        .select('*')
        .eq('chat_id', channelId)
        .order('created_at', { ascending: true })

      if (messagesError) {
        console.error('Error loading messages:', messagesError)
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
      
      const replyIds = messagesData.map(msg => msg.reply_to_id).filter(Boolean)
      const replyMap = new Map()

      if (replyIds.length > 0) {
        const { data: replyMessages } = await supabase
          .from('messages')
          .select('id, content, sender_id')
          .in('id', replyIds)

        const replySenderIds = [...new Set(replyMessages?.map(msg => msg.sender_id).filter(Boolean))]
        if (replySenderIds.length > 0) {
           const { data: replyProfiles } = await supabase
            .from('profiles')
            .select('id, full_name')
            .in('id', replySenderIds)
          
          const replyProfilesMap = new Map(replyProfiles?.map(p => [p.id, p]))

          replyMessages?.forEach(reply => {
            const replySender = replyProfilesMap.get(reply.sender_id)
            replyMap.set(reply.id, {
              content: reply.content,
              profiles: {
                full_name: replySender?.full_name || 'Unknown User'
              }
            })
          })
        }
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
          } : { full_name: 'Unknown User', role: 'student' },
          reply_to: msg.reply_to_id ? replyMap.get(msg.reply_to_id) : undefined
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
    setReplyToMessage(null)

    try {
      const messageData = {
        content: newMessage.trim(),
        chat_id: selectedChannel.id,
        sender_id: user.id,
        message_type: 'text' as const,
        ...(replyToMessage && { reply_to_id: replyToMessage.id })
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

  // Message deletion
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

      const { data: channel, error: channelError } = await supabase
        .from('channels')
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

      const { error: memberError } = await supabase
        .from('chat_participants')
        .insert({
          chat_id: channel.id,
          user_id: user.id,
          role: 'admin'
        })

      if (memberError) {
        console.error('Member creation error:', memberError)
      }

      if (newChannelData.selectedUsers.length > 0) {
        const memberIdsToAdd = newChannelData.selectedUsers.filter(userId => userId !== user.id)
        
        if (memberIdsToAdd.length > 0) {
          const memberInserts = memberIdsToAdd.map(userId => ({
            user_id: userId,
            chat_id: channel.id,
            role: 'member'
          }))

          const { error: membersError } = await supabase
            .from('chat_participants')
            .insert(memberInserts)

          if (membersError) {
            console.error('Additional members error:', membersError)
          }
        }
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
      await supabase
        .from('messages')
        .delete()
        .eq('chat_id', channelToDelete.id)

      await supabase
        .from('chat_participants')
        .delete()
        .eq('chat_id', channelToDelete.id)

      const { error } = await supabase
        .from('channels')
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

  const handleAddMembers = async (channelId: string) => {
    if (newChannelData.selectedUsers.length === 0) return

    try {
      const memberInserts = newChannelData.selectedUsers.map(userId => ({
        chat_id: channelId,
        user_id: userId,
        role: 'member'
      }))

      const { error } = await supabase
        .from('chat_participants')
        .insert(memberInserts)

      if (error) throw error

      setNewChannelData(prev => ({ ...prev, selectedUsers: [] }))
      await loadChannels()
      alert('Members added successfully!')
    } catch (error) {
      console.error('Error adding members:', error)
      alert('Failed to add members.')
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
    return !!user
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
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Admin Communication Hub</h1>
          <div className="flex items-center space-x-4 mt-1">
            <p className="text-gray-600">Manage messaging channels and communications</p>
            {ConnectionStatusIndicator}
          </div>
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
                                <SelectItem value="announcement">Announcement (Admins only)</SelectItem>
                              )}
                            </SelectContent>
                          </Select>
                        </div>
                        <div>
                          <Label>Add Members</Label>
                          <div className="flex space-x-2 mb-2">
                            <Button size="sm" variant="outline" onClick={() => setNewChannelData(prev => ({ ...prev, selectedUsers: users.map(u => u.id) }))}>Select All</Button>
                            <Button size="sm" variant="outline" onClick={() => setNewChannelData(prev => ({ ...prev, selectedUsers: users.filter(u => u.role === 'student').map(u => u.id) }))}>Students</Button>
                            <Button size="sm" variant="outline" onClick={() => setNewChannelData(prev => ({ ...prev, selectedUsers: users.filter(u => u.role === 'parent').map(u => u.id) }))}>Parents</Button>
                            <Button size="sm" variant="outline" onClick={() => setNewChannelData(prev => ({ ...prev, selectedUsers: users.filter(u => u.role === 'intern').map(u => u.id) }))}>Interns</Button>
                          </div>
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
                <div className="flex flex-col h-[calc(100vh-20rem)]">
                  {/* Messages */}
                  <div className="flex-1 overflow-y-auto p-4 space-y-4">
                    {messages.map((message) => {
                      const isOwn = message.sender_id === user?.id
                      const isAdmin = message.sender?.role === 'admin' || message.sender?.role === 'super_admin'
                      return (
                        <div key={message.id} id={`message-${message.id}`} className={`flex space-x-3 ${isOwn ? 'flex-row-reverse space-x-reverse' : ''}`}>
                          <div className="flex-shrink-0">
                            <div className={`h-8 w-8 rounded-full flex items-center justify-center text-white text-sm font-medium ${
                              isOwn ? 'bg-green-500' : isAdmin ? 'bg-purple-500' : 'bg-blue-500'
                            }`}>
                              {isAdmin && <Crown className="w-4 h-4" />}
                              {!isAdmin && message.sender_name.charAt(0).toUpperCase()}
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
                                  onClick={() => setReplyToMessage(message)}
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

                  {/* Message Input */}
                  <div className="border-t p-4">
                    <div className="flex items-center space-x-2">
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
                        disabled={!canSendMessage(selectedChannel)}
                      />
                      <Button
                        onClick={handleSendMessage}
                        disabled={!newMessage.trim() || !canSendMessage(selectedChannel)}
                      >
                        <Send className="w-4 h-4" />
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
