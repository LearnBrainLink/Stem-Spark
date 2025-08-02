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
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { ScrollArea } from '@/components/ui/scroll-area'
import { 
  Hash, 
  Users, 
  Plus, 
  ArrowRight, 
  Crown, 
  Reply, 
  X, 
  Send, 
  Upload, 
  Image as ImageIcon, 
  Forward, 
  Wifi, 
  WifiOff,
  UserPlus,
  UserMinus,
  Shield,
  User as UserIcon,
  CheckCircle,
  Clock,
  AlertCircle,
  MessageSquare,
  FileText,
  Paperclip
} from 'lucide-react'
import Link from 'next/link'

interface Message {
  id: string
  content: string
  sender_id: string
  sender_name?: string
  chat_id: string
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

interface ChannelMember {
  id: string
  channel_id: string
  user_id: string
  role: 'owner' | 'admin' | 'member'
  joined_at: string
  user?: {
    id: string
    full_name: string
    role: string
    email: string
  }
}

interface User {
  id: string
  full_name: string
  email: string
  role: string
  avatar_url?: string
}

interface TodoItem {
  id: string
  content: string
  completed: boolean
  created_by: string
  created_at: string
  due_date?: string
  priority: 'low' | 'medium' | 'high'
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
  
  // Member management state
  const [showAddUserDialog, setShowAddUserDialog] = useState(false)
  const [showRemoveUserDialog, setShowRemoveUserDialog] = useState(false)
  const [showMembersDialog, setShowMembersDialog] = useState(false)
  const [channelMembers, setChannelMembers] = useState<ChannelMember[]>([])
  const [availableUsers, setAvailableUsers] = useState<User[]>([])
  const [selectedUserToAdd, setSelectedUserToAdd] = useState<string>('')
  const [selectedUserToRemove, setSelectedUserToRemove] = useState<string>('')
  
  // Todo list state
  const [showTodoDialog, setShowTodoDialog] = useState(false)
  const [todoItems, setTodoItems] = useState<TodoItem[]>([])
  const [newTodoContent, setNewTodoContent] = useState('')
  const [newTodoPriority, setNewTodoPriority] = useState<'low' | 'medium' | 'high'>('medium')
  const [newTodoDueDate, setNewTodoDueDate] = useState('')
  
  // File upload state
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [selectedImage, setSelectedImage] = useState<File | null>(null)
  const [imagePreview, setImagePreview] = useState<string | null>(null)
  const [fileCaption, setFileCaption] = useState<string>('')
  const [imageCaption, setImageCaption] = useState<string>('')
  
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
    loadTodoItems()
    
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
      await setupDefaultChannels(authUser.id)
      
      // Get user profile to get role
      const { data: profile } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', authUser.id)
        .single()
      
      // Load channels immediately with user info
      await loadChannels(authUser.id, profile?.role)
      
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

  const setupDefaultChannels = async (userId: string) => {
    try {
      console.log('Setting up default channels for user:', userId)
      
      // Get user profile to determine role
      const { data: profile } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', userId)
        .single()

      if (!profile) {
        console.log('No profile found for user:', userId)
        return
      }

      console.log('User role:', profile.role)

      // Default channels configuration with proper account type linking
      const defaultChannels = [
        {
          name: 'General',
          description: 'General discussion for all members',
          type: 'general',
          roles: ['student', 'admin', 'super_admin', 'parent', 'teacher', 'intern'],
          accountTypes: ['student', 'admin', 'parent', 'intern']
        },
        {
          name: 'Announcements',
          description: 'Important announcements from administrators',
          type: 'announcements',
          roles: ['admin', 'super_admin'],
          accountTypes: ['admin']
        },
        {
          name: 'Student Lounge',
          description: 'Student-only discussion area',
          type: 'general',
          roles: ['student'],
          accountTypes: ['student']
        },
        {
          name: 'Parent-Teacher',
          description: 'Communication between parents and teachers',
          type: 'parent_teacher',
          roles: ['parent', 'teacher', 'admin', 'super_admin'],
          accountTypes: ['parent', 'admin']
        },
        {
          name: 'Admin Hub',
          description: 'Administrative discussions',
          type: 'admin_only',
          roles: ['admin', 'super_admin'],
          accountTypes: ['admin']
        }
      ]

      // Check if channels exist, create if not
      for (const channelConfig of defaultChannels) {
        console.log(`Processing channel: ${channelConfig.name}`)
        
        const { data: existingChannel } = await supabase
          .from('channels')
          .select('id')
          .eq('name', channelConfig.name)
          .single()

        if (!existingChannel) {
          console.log(`Creating new channel: ${channelConfig.name}`)
          
          // Create channel
          const { data: newChannel, error: channelError } = await supabase
            .from('channels')
            .insert([{
              name: channelConfig.name,
              description: channelConfig.description,
              type: channelConfig.type,
              created_by: userId
            }])
            .select()
            .single()

          if (channelError) {
            console.error(`Error creating channel ${channelConfig.name}:`, channelError)
            continue
          }

          console.log(`Channel created: ${newChannel.id}`)

          // Add all users with matching account types to the channel
          const { data: usersWithRole, error: usersError } = await supabase
            .from('profiles')
            .select('id, full_name, role')
            .in('role', channelConfig.accountTypes)

          if (usersError) {
            console.error('Error fetching users:', usersError)
            continue
          }

          console.log(`Found ${usersWithRole?.length || 0} users for channel ${channelConfig.name}`)

          if (usersWithRole && usersWithRole.length > 0) {
            const membersToAdd = usersWithRole.map(user => ({
              channel_id: newChannel.id,
              user_id: user.id,
              role: 'member'
            }))

            const { error: memberError } = await supabase
              .from('channel_members')
              .insert(membersToAdd)

            if (memberError) {
              console.error(`Error adding members to ${channelConfig.name}:`, memberError)
            } else {
              console.log(`Successfully added ${membersToAdd.length} members to ${channelConfig.name}`)
            }
          }
        } else {
          console.log(`Channel already exists: ${channelConfig.name}`)
          
          // Channel exists, ensure user is a member if they should be
          const shouldBeMember = channelConfig.accountTypes.includes(profile.role)
          
          if (shouldBeMember) {
            const { data: existingMember } = await supabase
              .from('channel_members')
              .select('id')
              .eq('channel_id', existingChannel.id)
              .eq('user_id', userId)
              .single()

            if (!existingMember) {
              await supabase
                .from('channel_members')
                .insert([{
                  channel_id: existingChannel.id,
                  user_id: userId,
                  role: 'member'
                }])
            }
          }
        }
      }
    } catch (error) {
      console.error('Error setting up default channels:', error)
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

  const loadChannels = async (userId?: string, userRole?: string) => {
    try {
      const currentUser = user || { id: userId, role: userRole }
      console.log('Loading channels for user:', currentUser?.id, 'with role:', currentUser?.role)
      
      if (!currentUser?.id) {
        console.log('No user found, skipping channel load')
        return
      }

      // Get all channels and filter based on user role and membership
      const { data: allChannels, error: channelError } = await supabase
        .from('channels')
        .select('*')
        .order('created_at', { ascending: false })

      if (channelError) {
        console.error('Error loading channels:', channelError)
        throw channelError
      }

      console.log('All channels:', allChannels)

      if (allChannels) {
        const accessibleChannels = []
        
        for (const channel of allChannels) {
          let shouldShow = false
          
          // Check if user should see this channel based on role
          if (channel.name === 'General') {
            shouldShow = true // Everyone can see General
          } else if (channel.name === 'Student Lounge' && currentUser.role === 'student') {
            shouldShow = true
          } else if (channel.name === 'Announcements') {
            shouldShow = true // Everyone can see Announcements, but only admins can message
          } else if (channel.name === 'Admin Hub' && (currentUser.role === 'admin' || currentUser.role === 'super_admin')) {
            shouldShow = true
          } else if (channel.name === 'Parent-Teacher' && (currentUser.role === 'parent' || currentUser.role === 'admin' || currentUser.role === 'super_admin')) {
            shouldShow = true
          } else if (channel.name === 'Test Management Channel' || channel.name === 'general' || channel.name === 'announcements' || channel.name === 'admin-only' || channel.name === 'parent-teacher') {
            // Show legacy channels to admins
            if (currentUser.role === 'admin' || currentUser.role === 'super_admin') {
              shouldShow = true
            }
          }
          
          if (shouldShow) {
            // Get member count for this channel
            const { count } = await supabase
              .from('channel_members')
              .select('*', { count: 'exact', head: true })
              .eq('channel_id', channel.id)
            
            // Check if user is already a member
            const { data: existingMember } = await supabase
              .from('channel_members')
              .select('id')
              .eq('channel_id', channel.id)
              .eq('user_id', currentUser.id)
              .single()
            
            // If user should be in this channel but isn't, add them
            if (!existingMember) {
              await supabase
                .from('channel_members')
                .insert([{
                  channel_id: channel.id,
                  user_id: currentUser.id,
                  role: 'member'
                }])
            }
            
            accessibleChannels.push({
              id: channel.id,
              name: channel.name,
              description: channel.description,
              channel_type: channel.type || 'general',
              created_by: channel.created_by,
              created_at: channel.created_at,
              member_count: count || 0
            } as Channel)
          }
        }
        
        console.log('Accessible channels for user:', accessibleChannels)
        setChannels(accessibleChannels)
      } else {
        setChannels([])
      }
    } catch (error) {
      console.error('Error loading channels:', error)
      setChannels([])
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
    if ((!newMessage.trim() && !selectedImage && !selectedFile) || !user || !selectedChannel) return

    const tempId = `temp-${Date.now()}`
    const tempMessage: Message = {
      id: tempId,
      content: newMessage.trim(),
      sender_id: user.id,
      chat_id: selectedChannel.id,
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
    const originalMessage = newMessage.trim()
    setNewMessage('')
    setReplyTo(null)

    try {
      let messageData: any = {
        content: originalMessage,
        chat_id: selectedChannel.id,
        sender_id: user.id,
        message_type: 'text' as const,
        ...(replyTo && { reply_to_id: replyTo.id })
      }

      // Handle image upload
      if (selectedImage) {
        const imageUrl = await uploadFile(selectedImage)
        if (imageUrl) {
          messageData.file_url = imageUrl
          messageData.file_name = selectedImage.name
          messageData.file_size = selectedImage.size
          messageData.file_type = selectedImage.type
          messageData.message_type = 'image'
          messageData.image_caption = imageCaption
        }
      }

      // Handle file upload
      if (selectedFile) {
        const fileUrl = await uploadFile(selectedFile)
        if (fileUrl) {
          messageData.file_url = fileUrl
          messageData.file_name = selectedFile.name
          messageData.file_size = selectedFile.size
          messageData.file_type = selectedFile.type
          messageData.message_type = selectedFile.type.startsWith('image/') ? 'image' : 'file'
          messageData.image_caption = fileCaption
        }
      }

      const { error } = await supabase
        .from('messages')
        .insert([messageData])

      if (error) throw error

      // Remove temporary message (real message will come via subscription)
      setMessages(prev => prev.filter(msg => msg.id !== tempId))

      // Clear selected files after successful send
      setSelectedImage(null)
      setImagePreview(null)
      setSelectedFile(null)
      setImageCaption('')
      setFileCaption('')

    } catch (error) {
      console.error('Error sending message:', error)
      
      // Remove optimistic update on error
      setMessages(prev => prev.filter(msg => msg.id !== tempId))
      
      // Restore message for retry
      setNewMessage(originalMessage)
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
    try {
      const formData = new FormData()
      formData.append('file', file)
      formData.append('type', 'file')

      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || 'Upload failed')
      }

      // Add file message to chat
      const messageData = {
        content: `📎 ${file.name}`,
        sender_id: user.id,
        chat_id: selectedChannel.id,
        message_type: 'file' as const,
        file_url: result.url,
        file_name: file.name,
        file_size: file.size,
        file_type: file.type
      }

      const { error } = await supabase
        .from('messages')
        .insert([messageData])

      if (error) throw error

    } catch (error) {
      console.error('File upload error:', error)
      alert('Failed to upload file')
    }
  }

  const uploadFile = async (file: File): Promise<string | null> => {
    try {
      const formData = new FormData()
      formData.append('file', file)

      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || 'Upload failed')
      }

      return result.url
    } catch (error) {
      console.error('Upload error:', error)
      alert('Failed to upload file')
      return null
    }
  }

  const handleImageSelect = (file: File) => {
    setSelectedImage(file)
    // Create preview URL
    const reader = new FileReader()
    reader.onload = (e) => {
      setImagePreview(e.target?.result as string)
    }
    reader.readAsDataURL(file)
  }

  const handleImageUpload = async (file: File) => {
    try {
      const formData = new FormData()
      formData.append('file', file)
      formData.append('type', 'image')

      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || 'Upload failed')
      }

      // Add image message to chat
      const messageData = {
        content: `🖼️ ${file.name}`,
        sender_id: user.id,
        chat_id: selectedChannel.id,
        message_type: 'image' as const,
        file_url: result.url,
        file_name: file.name,
        file_size: file.size,
        file_type: file.type
      }

      const { error } = await supabase
        .from('messages')
        .insert([messageData])

      if (error) throw error

      // Clear selected image after successful upload
      setSelectedImage(null)
      setImagePreview(null)

    } catch (error) {
      console.error('Image upload error:', error)
      alert('Failed to upload image')
    }
  }

  // Member management functions
  const fetchChannelMembers = async () => {
    if (!selectedChannel) return

    try {
      console.log('Fetching members for channel:', selectedChannel.id)
      
      const { data, error } = await supabase
        .from('channel_members')
        .select(`
          id,
          channel_id,
          user_id,
          role,
          joined_at,
          user:profiles!inner(id, full_name, role, email)
        `)
        .eq('channel_id', selectedChannel.id)

      if (error) {
        console.error('Supabase error:', error)
        throw error
      }
      
      console.log('Fetched members:', data)
      setChannelMembers(data || [])
    } catch (error) {
      console.error('Error fetching channel members:', error)
      toast({
        title: "Error",
        description: "Failed to fetch channel members",
        variant: "destructive"
      })
    }
  }

  const fetchAvailableUsers = async () => {
    if (!selectedChannel) return

    try {
      // Get current members
      const { data: currentMembers } = await supabase
        .from('channel_members')
        .select('user_id')
        .eq('channel_id', selectedChannel.id)

      const currentMemberIds = currentMembers?.map(m => m.user_id) || []

      // Get all users not in channel
      const { data: allUsers, error } = await supabase
        .from('profiles')
        .select('id, full_name, role, email')
        .not('id', 'in', `(${currentMemberIds.join(',')})`)

      if (error) throw error
      setAvailableUsers(allUsers || [])
    } catch (error) {
      console.error('Error fetching available users:', error)
    }
  }

  const addUserToChannel = async () => {
    if (!selectedChannel || !selectedUserToAdd) return

    try {
      const { error } = await supabase
        .from('channel_members')
        .insert([{
          channel_id: selectedChannel.id,
          user_id: selectedUserToAdd,
          role: 'member'
        }])

      if (error) throw error

      // Get user info for system message
      const { data: userData } = await supabase
        .from('profiles')
        .select('full_name')
        .eq('id', selectedUserToAdd)
        .single()

      // Send system message
      await supabase
        .from('messages')
        .insert([{
          content: `${userData?.full_name || 'User'} has been added to the channel.`,
          chat_id: selectedChannel.id,
          sender_id: user.id,
          message_type: 'system'
        }])

      setShowAddUserDialog(false)
      setSelectedUserToAdd('')
      await fetchChannelMembers()

    } catch (error) {
      console.error('Error adding user to channel:', error)
    }
  }

  const removeUserFromChannel = async () => {
    if (!selectedChannel || !selectedUserToRemove) return

    try {
      // Get user info before removal
      const { data: userData } = await supabase
        .from('profiles')
        .select('full_name')
        .eq('id', selectedUserToRemove)
        .single()

      const { error } = await supabase
        .from('channel_members')
        .delete()
        .eq('channel_id', selectedChannel.id)
        .eq('user_id', selectedUserToRemove)

      if (error) throw error

      // Send system message
      await supabase
        .from('messages')
        .insert([{
          content: `${userData?.full_name || 'User'} has been removed from the channel.`,
          chat_id: selectedChannel.id,
          sender_id: user.id,
          message_type: 'system'
        }])

      setShowRemoveUserDialog(false)
      setSelectedUserToRemove('')
      await fetchChannelMembers()

    } catch (error) {
      console.error('Error removing user from channel:', error)
    }
  }

  const canManageChannel = (channel: Channel) => {
    return user && (channel.created_by === user.id || userRole === 'admin' || userRole === 'super_admin')
  }

  const canViewMembers = () => {
    return true // Everyone can view members
  }

  const getRoleIcon = (role: string) => {
    switch (role) {
      case 'owner': return <Crown className="w-3 h-3 text-yellow-500" />
      case 'admin': return <Shield className="w-3 h-3 text-blue-500" />
      default: return <UserIcon className="w-3 h-3 text-gray-500" />
    }
  }

  const canJoinChannel = (channel: Channel) => {
    return userRole === 'student' || userRole === 'intern' || userRole === 'admin' || userRole === 'super_admin'
  }

  const canSendMessage = (channel: Channel) => {
    if (!channel) return false
    
    // Only admins can send messages in announcements
    if (channel.channel_type === 'announcement') {
      return userRole === 'admin' || userRole === 'super_admin'
    }
    
    // Students can only send messages in General and Student Lounge
    if (userRole === 'student') {
      return channel.name === 'General' || channel.name === 'Student Lounge'
    }
    
    // Parents can send messages in General and Parent-Teacher
    if (userRole === 'parent') {
      return channel.name === 'General' || channel.name === 'Parent-Teacher'
    }
    
    // Admins can send messages everywhere
    if (userRole === 'admin' || userRole === 'super_admin') {
      return true
    }
    
    // Interns can send messages in General channels
    if (userRole === 'intern') {
      return channel.name === 'General'
    }
    
    return false
  }

  // Todo list functions
  const loadTodoItems = async () => {
    if (!selectedChannel) return

    try {
      const { data, error } = await supabase
        .from('todo_items')
        .select('*')
        .eq('channel_id', selectedChannel.id)
        .order('created_at', { ascending: false })

      if (error) throw error
      setTodoItems(data || [])
    } catch (error) {
      console.error('Error loading todo items:', error)
    }
  }

  const addTodoItem = async () => {
    if (!selectedChannel || !newTodoContent.trim()) return

    try {
      const { error } = await supabase
        .from('todo_items')
        .insert([{
          content: newTodoContent.trim(),
          channel_id: selectedChannel.id,
          created_by: user.id,
          priority: newTodoPriority,
          due_date: newTodoDueDate || null,
          completed: false
        }])

      if (error) throw error

      setNewTodoContent('')
      setNewTodoPriority('medium')
      setNewTodoDueDate('')
      await loadTodoItems()
    } catch (error) {
      console.error('Error adding todo item:', error)
    }
  }

  const toggleTodoItem = async (todoId: string, completed: boolean) => {
    try {
      const { error } = await supabase
        .from('todo_items')
        .update({ completed })
        .eq('id', todoId)

      if (error) throw error
      await loadTodoItems()
    } catch (error) {
      console.error('Error toggling todo item:', error)
    }
  }

  const deleteTodoItem = async (todoId: string) => {
    try {
      const { error } = await supabase
        .from('todo_items')
        .delete()
        .eq('id', todoId)

      if (error) throw error
      await loadTodoItems()
    } catch (error) {
      console.error('Error deleting todo item:', error)
    }
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'text-red-600 bg-red-100'
      case 'medium': return 'text-yellow-600 bg-yellow-100'
      case 'low': return 'text-green-600 bg-green-100'
      default: return 'text-gray-600 bg-gray-100'
    }
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
                  <div className="flex items-center space-x-2">
                  <Badge variant="secondary">{channels.length}</Badge>
                    <Button
                      size="sm"
                      onClick={() => setShowCreateChannel(true)}
                      className="h-8 w-8 p-0"
                    >
                      <Plus className="w-4 h-4" />
                    </Button>
                  </div>
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

          {/* Main Content Area */}
          <div className="lg:col-span-3">
            {selectedChannel ? (
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Messages Area */}
                <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                      <div className="flex items-center justify-between">
                        <CardTitle className="flex items-center space-x-2">
                                            <Button
                    variant="ghost"
                    className="h-auto p-0 text-lg font-semibold hover:bg-transparent"
                    onClick={async () => {
                      await fetchChannelMembers()
                      await fetchAvailableUsers()
                      setShowMembersDialog(true)
                    }}
                  >
                            #{selectedChannel.name}
                          </Button>
                          <Badge variant="outline">{selectedChannel.channel_type}</Badge>
                </CardTitle>
                        <div className="flex items-center space-x-2">
                          {/* Member management is now handled through the channel name button */}
                        </div>
                      </div>
              </CardHeader>
              <CardContent>
                  <div className="flex flex-col h-[calc(100vh-20rem)]">
                    {/* Messages */}
                        <ScrollArea className="flex-1 p-4">
                          <div className="space-y-4">
                      {messages.map((message) => {
                        const isOwn = message.sender_id === user?.id
                        const isAdmin = message.sender?.role === 'admin' || message.sender?.role === 'super_admin'
                        
                        return (
                          <div key={message.id} className={`flex space-x-3 ${isOwn ? 'flex-row-reverse space-x-reverse' : ''}`}>
                                  <Avatar className="w-8 h-8">
                                    <AvatarFallback className={isOwn ? 'bg-green-500 text-white' : isAdmin ? 'bg-purple-500 text-white' : 'bg-blue-500 text-white'}>
                                {isAdmin ? <Crown className="w-4 h-4" /> : message.sender_name.charAt(0).toUpperCase()}
                                    </AvatarFallback>
                                  </Avatar>
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
                                      {/* Text content */}
                                      {message.content && (
                                        <p className="text-sm mb-2">{message.content}</p>
                                      )}
                                      
                                      {/* Image content */}
                                      {message.message_type === 'image' && message.file_url && (
                                        <div className="mb-2">
                                          <img 
                                            src={message.file_url} 
                                            alt={message.file_name || 'Image'}
                                            className="max-w-full h-auto rounded cursor-pointer hover:opacity-90 transition-opacity"
                                            onClick={() => window.open(message.file_url, '_blank')}
                                          />
                                          {message.image_caption && (
                                            <p className="text-xs text-gray-600 mt-1 italic">
                                              {message.image_caption}
                                            </p>
                                          )}
                                        </div>
                                      )}
                                      
                                      {/* File content */}
                                      {message.message_type === 'file' && message.file_url && (
                                        <div className="space-y-2">
                                          <div className="flex items-center space-x-2 p-2 bg-gray-50 rounded border">
                                            <Paperclip className="w-4 h-4" />
                                            <div className="flex-1">
                                              <p className="text-sm font-medium">{message.file_name}</p>
                                              <p className="text-xs text-gray-500">
                                                {message.file_size ? `${(message.file_size / 1024 / 1024).toFixed(2)} MB` : 'Unknown size'}
                                              </p>
                                            </div>
                                            <Button 
                                              size="sm" 
                                              variant="outline"
                                              onClick={() => window.open(message.file_url, '_blank')}
                                            >
                                              Download
                                            </Button>
                                          </div>
                                          {message.image_caption && (
                                            <p className="text-xs text-gray-600 italic">
                                              {message.image_caption}
                                            </p>
                                          )}
                                        </div>
                                      )}
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
                        </ScrollArea>

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
                          <div className="flex flex-col space-y-2 p-4 border-t">
                            {/* Image preview */}
                            {imagePreview && (
                              <div className="space-y-2">
                                <div className="relative inline-block">
                                  <img 
                                    src={imagePreview} 
                                    alt="Preview" 
                                    className="max-w-xs max-h-32 rounded border"
                                  />
                                  <Button
                                    size="sm"
                                    variant="destructive"
                                    className="absolute top-1 right-1 h-6 w-6 p-0"
                                    onClick={() => {
                                      setSelectedImage(null)
                                      setImagePreview(null)
                                      setImageCaption('')
                                    }}
                                  >
                                    <X className="w-3 h-3" />
                                  </Button>
                                </div>
                                <Input
                                  value={imageCaption}
                                  onChange={(e) => setImageCaption(e.target.value)}
                                  placeholder="Add a caption for the image..."
                                  className="max-w-xs"
                                />
                              </div>
                            )}

                            {/* File preview */}
                            {selectedFile && (
                              <div className="space-y-2">
                                <div className="flex items-center space-x-2 p-2 bg-gray-50 rounded border">
                                  <FileText className="w-4 h-4" />
                                  <div className="flex-1">
                                    <p className="text-sm font-medium">{selectedFile.name}</p>
                                    <p className="text-xs text-gray-500">
                                      {selectedFile.size ? `${(selectedFile.size / 1024 / 1024).toFixed(2)} MB` : 'Unknown size'}
                                    </p>
                                  </div>
                                  <Button
                                    size="sm"
                                    variant="destructive"
                                    onClick={() => {
                                      setSelectedFile(null)
                                      setFileCaption('')
                                    }}
                                  >
                                    <X className="w-3 h-3" />
                                  </Button>
                                </div>
                                <Input
                                  value={fileCaption}
                                  onChange={(e) => setFileCaption(e.target.value)}
                                  placeholder="Add a caption for the file..."
                                  className="max-w-xs"
                                />
                              </div>
                            )}
                            
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
                                    if (file) handleImageSelect(file)
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
                    </CardContent>
                  </Card>
                </div>

                {/* Todo List Sidebar */}
                <div className="lg:col-span-1">
                  <Card>
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <CardTitle className="flex items-center">
                          <CheckCircle className="w-5 h-5 mr-2" />
                          Todo List
                        </CardTitle>
                        <Button
                          size="sm"
                          onClick={() => setShowTodoDialog(true)}
                        >
                          <Plus className="w-4 h-4" />
                        </Button>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <ScrollArea className="h-[calc(100vh-20rem)]">
                        <div className="space-y-2">
                          {todoItems.map((todo) => (
                            <div
                              key={todo.id}
                              className={`p-3 rounded-lg border ${
                                todo.completed 
                                  ? 'bg-gray-50 border-gray-200' 
                                  : 'bg-white border-gray-300'
                              }`}
                            >
                              <div className="flex items-start space-x-2">
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => toggleTodoItem(todo.id, !todo.completed)}
                                  className="p-0 h-5 w-5"
                                >
                                  {todo.completed ? (
                                    <CheckCircle className="w-4 h-4 text-green-500" />
                                  ) : (
                                    <div className="w-4 h-4 border-2 border-gray-300 rounded" />
                                  )}
                                </Button>
                                <div className="flex-1">
                                  <p className={`text-sm ${
                                    todo.completed ? 'line-through text-gray-500' : 'text-gray-900'
                                  }`}>
                                    {todo.content}
                                  </p>
                                  <div className="flex items-center space-x-2 mt-1">
                                    <Badge 
                                      variant="outline" 
                                      className={`text-xs ${getPriorityColor(todo.priority)}`}
                                    >
                                      {todo.priority}
                                    </Badge>
                                    {todo.due_date && (
                                      <span className="text-xs text-gray-500">
                                        Due: {new Date(todo.due_date).toLocaleDateString()}
                                      </span>
                                    )}
                                  </div>
                                </div>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => deleteTodoItem(todo.id)}
                                  className="p-0 h-5 w-5 text-red-500 hover:text-red-600"
                                >
                                  <X className="w-3 h-3" />
                                </Button>
                              </div>
                            </div>
                          ))}
                          {todoItems.length === 0 && (
                  <div className="text-center text-gray-500 py-8">
                              <CheckCircle className="w-8 h-8 mx-auto mb-2 text-gray-300" />
                              <p className="text-sm">No todo items yet</p>
                              <p className="text-xs">Click the + button to add one</p>
                  </div>
                )}
                        </div>
                      </ScrollArea>
              </CardContent>
            </Card>
                </div>
              </div>
            ) : (
              <Card className="h-[calc(100vh-20rem)] flex items-center justify-center">
                <div className="text-center text-gray-500">
                  <MessageSquare className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                  <h3 className="text-lg font-medium mb-2">Select a channel to start chatting</h3>
                  <p className="text-sm">Choose a channel from the sidebar to view messages and start conversations.</p>
                </div>
              </Card>
            )}
          </div>
        </div>

        {/* Dialogs */}
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

        {/* Add User Dialog */}
        <Dialog open={showAddUserDialog} onOpenChange={setShowAddUserDialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add User to Channel</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label>Select User</Label>
                <Select value={selectedUserToAdd} onValueChange={setSelectedUserToAdd}>
                  <SelectTrigger>
                    <SelectValue placeholder="Choose a user to add" />
                  </SelectTrigger>
                  <SelectContent>
                    {availableUsers.map((user) => (
                      <SelectItem key={user.id} value={user.id}>
                        {user.full_name} ({user.role})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="flex justify-end space-x-2">
                <Button onClick={addUserToChannel} disabled={!selectedUserToAdd}>
                  Add User
                </Button>
                <Button variant="outline" onClick={() => setShowAddUserDialog(false)}>
                  Cancel
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        {/* Remove User Dialog */}
        <Dialog open={showRemoveUserDialog} onOpenChange={setShowRemoveUserDialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Remove User from Channel</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label>Select User</Label>
                <Select value={selectedUserToRemove} onValueChange={setSelectedUserToRemove}>
                  <SelectTrigger>
                    <SelectValue placeholder="Choose a user to remove" />
                  </SelectTrigger>
                  <SelectContent>
                    {channelMembers
                      .filter(member => member.role !== 'owner') // Can't remove owners
                      .map((member) => (
                        <SelectItem key={member.id} value={member.user_id}>
                          {member.user?.full_name} ({member.role})
                        </SelectItem>
                      ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="flex justify-end space-x-2">
                <Button 
                  onClick={removeUserFromChannel} 
                  disabled={!selectedUserToRemove} 
                  variant="destructive"
                >
                  Remove User
                </Button>
                <Button variant="outline" onClick={() => setShowRemoveUserDialog(false)}>
                  Cancel
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        {/* Member Management Dialog */}
        <Dialog open={showMembersDialog} onOpenChange={setShowMembersDialog}>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle>Channel Members</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              {/* Current Members */}
              <div>
                <h3 className="text-sm font-medium mb-2">Current Members ({channelMembers.length})</h3>
                <div className="max-h-60 overflow-y-auto space-y-2">
                  {channelMembers.map((member) => (
                    <div key={member.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div className="flex items-center space-x-3">
                        <Avatar className="w-8 h-8">
                          <AvatarFallback>
                            {member.user?.full_name?.charAt(0) || 'U'}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="text-sm font-medium">{member.user?.full_name}</p>
                          <p className="text-xs text-gray-600">{member.user?.email}</p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Badge variant="outline" className="text-xs">
                          {member.role}
                        </Badge>
                        <Badge variant="secondary" className="text-xs">
                          {member.user?.role}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Add User Section */}
              <div className="border-t pt-4">
                <h3 className="text-sm font-medium mb-2">Add New Member</h3>
                <div className="flex space-x-2">
                  <Select value={selectedUserToAdd} onValueChange={setSelectedUserToAdd}>
                    <SelectTrigger className="flex-1">
                      <SelectValue placeholder="Select user to add" />
                    </SelectTrigger>
                    <SelectContent>
                      {availableUsers.map((user) => (
                        <SelectItem key={user.id} value={user.id}>
                          {user.full_name} ({user.role})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Button 
                    onClick={addUserToChannel} 
                    disabled={!selectedUserToAdd}
                    size="sm"
                  >
                    Add
                  </Button>
                </div>
              </div>

              {/* Remove User Section */}
              <div className="border-t pt-4">
                <h3 className="text-sm font-medium mb-2">Remove Member</h3>
                <div className="flex space-x-2">
                  <Select value={selectedUserToRemove} onValueChange={setSelectedUserToRemove}>
                    <SelectTrigger className="flex-1">
                      <SelectValue placeholder="Select user to remove" />
                    </SelectTrigger>
                    <SelectContent>
                      {channelMembers
                        .filter(member => member.role !== 'owner')
                        .map((member) => (
                          <SelectItem key={member.id} value={member.user_id}>
                            {member.user?.full_name} ({member.role})
                          </SelectItem>
                        ))}
                    </SelectContent>
                  </Select>
                  <Button 
                    onClick={removeUserFromChannel} 
                    disabled={!selectedUserToRemove}
                    variant="destructive"
                    size="sm"
                  >
                    Remove
                  </Button>
                </div>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        {/* Add Todo Dialog */}
        <Dialog open={showTodoDialog} onOpenChange={setShowTodoDialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add Todo Item</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label>Content</Label>
                <Textarea
                  value={newTodoContent}
                  onChange={(e) => setNewTodoContent(e.target.value)}
                  placeholder="Enter todo item content..."
                  className="min-h-[100px]"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Priority</Label>
                  <Select value={newTodoPriority} onValueChange={(value: 'low' | 'medium' | 'high') => setNewTodoPriority(value)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="low">Low</SelectItem>
                      <SelectItem value="medium">Medium</SelectItem>
                      <SelectItem value="high">High</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Due Date (Optional)</Label>
                  <Input
                    type="date"
                    value={newTodoDueDate}
                    onChange={(e) => setNewTodoDueDate(e.target.value)}
                  />
                </div>
              </div>
              <div className="flex justify-end space-x-2">
                <Button onClick={addTodoItem} disabled={!newTodoContent.trim()}>
                  Add Todo
                </Button>
                <Button variant="outline" onClick={() => setShowTodoDialog(false)}>
                  Cancel
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  )
}
