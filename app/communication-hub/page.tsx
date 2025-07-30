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
import { Label } from '@/components/ui/label'
import { DialogFooter } from '@/components/ui/dialog'

interface Message {
  id: string
  content: string
  sender_id: string
  sender_name: string
  chat_id: string
  created_at: string
  message_type: 'text' | 'file' | 'image' | 'system'
  file_url?: string
  file_name?: string
  file_size?: number
  file_type?: string
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
  type: 'general' | 'announcements' | 'parent_teacher' | 'admin_only'
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
    type: 'general' as 'general' | 'announcements' | 'parent_teacher' | 'admin_only',
    selectedUsers: [] as string[]
  })
  const [editingMessage, setEditingMessage] = useState<string | null>(null)
  const [editContent, setEditContent] = useState('')
  const [forwardingMessage, setForwardingMessage] = useState<Message | null>(null)
  const [showForwardDialog, setShowForwardDialog] = useState(false)
  const [selectedForwardChannel, setSelectedForwardChannel] = useState('')
  const [showAddUserDialog, setShowAddUserDialog] = useState(false)
  const [showRemoveUserDialog, setShowRemoveUserDialog] = useState(false)
  const [selectedUserToAdd, setSelectedUserToAdd] = useState('')
  const [selectedUserToRemove, setSelectedUserToRemove] = useState('')
  const [channelMembers, setChannelMembers] = useState<any[]>([])
  const [availableUsers, setAvailableUsers] = useState<any[]>([])

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
      fetchMessages(selectedChannel)
      const unsubscribe = subscribeToMessages(selectedChannel)
      fetchChannelMembers(selectedChannel)
      fetchAvailableUsers()
      return unsubscribe
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
        .from('channel_members')
        .select('channel_id')
        .eq('user_id', user.id)
        .in('channel_id', publicChannels.map(c => c.id))

      const existingChannelIds = existingMemberships?.map(m => m.channel_id) || []
      const channelsToJoin = publicChannels.filter(c => !existingChannelIds.includes(c.id))

      if (channelsToJoin.length > 0) {
        console.log(`Adding user to ${channelsToJoin.length} public channels`)
        
        for (const channel of channelsToJoin) {
          try {
            const { error: insertError } = await supabase
              .from('channel_members')
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
      console.error('Error in ensureUserInPublicChannels:', error)
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
        
        // Get member counts for each channel using the new channel_members table
        const channelsWithMemberCount = await Promise.all(
          channels.map(async (channel) => {
            try {
              const { count } = await supabase
                .from('channel_members')
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
      
      const messagesChannel = supabase
        .channel('public:messages')
        .on('postgres_changes', { 
          event: 'INSERT', 
          schema: 'public', 
          table: 'messages' 
        }, async (payload) => {
          console.log('New message received:', payload.new)
          const newMessage = payload.new as Message
          
          // Only add messages for the current channel
          if (newMessage.chat_id === channelId) {
            console.log('Adding new message to UI for channel:', channelId)
            
            // Fetch sender info and add to UI
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
              console.log('Adding message with sender:', messageWithSender)
              setMessages(prev => [...prev, messageWithSender])
            } catch (error) {
              console.error('Error fetching sender info:', error)
              const messageWithSender = {
                ...newMessage,
                sender_name: 'Unknown'
              }
              console.log('Adding message with unknown sender:', messageWithSender)
              setMessages(prev => [...prev, messageWithSender])
            }
          } else {
            console.log('Ignoring message for different channel:', newMessage.chat_id)
          }
        })
        .subscribe((status) => {
          console.log('Subscription status:', status)
          if (status === 'SUBSCRIBED') {
            console.log('Successfully subscribed to real-time updates')
          } else if (status === 'CHANNEL_ERROR') {
            console.error('Failed to subscribe to real-time updates')
          }
        })

      return () => {
        console.log('Cleaning up subscription')
        messagesChannel.unsubscribe()
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
      console.log('Starting file upload:', file.name, 'Size:', file.size, 'Type:', file.type)
      
      // Check file size (max 10MB)
      const maxSize = 10 * 1024 * 1024 // 10MB
      if (file.size > maxSize) {
        alert('File size too large. Maximum size is 10MB.')
        return null
      }

      // Check file type
      const allowedTypes = [
        'image/jpeg', 'image/png', 'image/gif', 'image/webp',
        'application/pdf',
        'application/msword',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        'text/plain',
        'application/zip',
        'application/x-rar-compressed'
      ]

      if (!allowedTypes.includes(file.type)) {
        alert('File type not allowed. Please select images, PDFs, documents, or archives.')
        return null
      }

      const formData = new FormData()
      formData.append('file', file)
      formData.append('type', file.type)

      console.log('Uploading to API...')
      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      })

      if (!response.ok) {
        const errorData = await response.json()
        console.error('Upload failed:', errorData)
        alert(`Upload failed: ${errorData.error || 'Unknown error'}`)
        return null
      }

      const data = await response.json()
      console.log('Upload successful:', data.url)
      return data.url
    } catch (error) {
      console.error('Error uploading file:', error)
      alert('Failed to upload file. Please try again.')
      return null
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
      let messageType: 'text' | 'file' | 'image' | 'system' = 'text'
      let fileUrl: string | null = null
      let fileName: string | null = null
      let fileSize: number | null = null
      let fileType: string | null = null

      // Handle file upload if selected
      if (selectedFile) {
        console.log('Uploading file:', selectedFile.name, 'Type:', selectedFile.type, 'Size:', selectedFile.size)
        
        // Determine message type based on file type
        if (selectedFile.type.startsWith('image/')) {
          messageType = 'image'
          messageContent = newMessage.trim() || `📷 Image: ${selectedFile.name}`
        } else {
          messageType = 'file'
          messageContent = newMessage.trim() || `📄 Document: ${selectedFile.name}`
        }
        
        fileUrl = await uploadFile(selectedFile)
        if (!fileUrl) {
          setMessagesLoading(false)
          alert('Failed to upload file. Please try again.')
          return
        }
        
        fileName = selectedFile.name
        fileSize = selectedFile.size
        fileType = selectedFile.type
        
        console.log('File uploaded successfully:', fileUrl)
        console.log('Message type:', messageType)
      }

      const messageData: any = {
        content: messageContent,
        sender_id: user.id,
        chat_id: selectedChannel,
        message_type: messageType
      }

      // Add file information if file was uploaded
      if (fileUrl) {
        messageData.file_url = fileUrl
        messageData.file_name = fileName
        messageData.file_size = fileSize
        messageData.file_type = fileType
      }

      const { data: message, error } = await supabase
        .from('messages')
        .insert([messageData])
        .select(`
          *,
          profiles:profiles(full_name)
        `)
        .single()

      if (error) {
        console.error('Error sending message:', error)
        alert(`Failed to send message: ${error.message}`)
        return
      }

      console.log('Message sent successfully:', message)
      
      // Clear the input immediately
      setNewMessage('')
      setSelectedFile(null)
      
      // Show success feedback
      if (fileUrl) {
        console.log(`✅ ${messageType === 'image' ? 'Image' : 'Document'} uploaded and sent successfully!`)
      }
    } catch (error) {
      console.error('Error in sendMessage:', error)
      alert('Failed to send message. Please try again.')
    } finally {
      setMessagesLoading(false)
    }
  }

  const createChannel = async () => {
    try {
      if (!newChannelData.name.trim() || !user) return

      const { data: channel, error } = await supabase
        .from('channels')
        .insert([{
          name: newChannelData.name,
          description: newChannelData.description,
          type: newChannelData.type,
          created_by: user.id
        }])
        .select()
        .single()

      if (error) {
        console.error('Error creating channel:', error)
        alert('Failed to create channel')
        return
      }

      // Add creator as channel member with owner role
      const { error: memberError } = await supabase
        .from('channel_members')
        .insert([{
          channel_id: channel.id,
          user_id: user.id,
          role: 'owner'
        }])

      if (memberError) {
        console.error('Error adding creator to channel:', memberError)
      }

      // Send welcome message
      const { error: messageError } = await supabase
        .from('messages')
        .insert([{
          content: `🎉 Channel "${channel.name}" has been created! Welcome everyone!`,
          sender_id: user.id,
          chat_id: channel.id,
          message_type: 'system'
        }])

      if (messageError) {
        console.error('Error sending welcome message:', messageError)
      }

      console.log('Channel created successfully:', channel)
      
      // Reset form
      setNewChannelData({
        name: '',
        description: '',
        type: 'general' as const,
        selectedUsers: []
      })
      setIsCreateChannelOpen(false)
      
      // Refresh channels
      await fetchChannels()
      
      alert('Channel created successfully!')
    } catch (error) {
      console.error('Error in createChannel:', error)
      alert('Failed to create channel')
    }
  }

  const canSendMessage = (channel: Channel) => {
    if (!user) return false
    
    // Admins and super admins can send messages in any channel
    if (userRole === 'admin' || userRole === 'super_admin') return true
    
    // Regular users can only send messages in non-announcement channels
    return channel.type !== 'announcements'
  }

  const canUploadFiles = (channel: Channel) => {
    if (!user) {
      console.log('canUploadFiles: No user found')
      return false
    }
    
    console.log('canUploadFiles: User role:', userRole, 'User ID:', user.id)
    
    // Only admins and super admins can upload files
    const canUpload = userRole === 'admin' || userRole === 'super_admin'
    console.log('canUploadFiles: Can upload:', canUpload)
    return canUpload
  }

  const canViewChannel = (channel: Channel) => {
    return true // For now, all users can view all channels
  }

  const canCreateChannel = () => {
    return userRole === 'admin' || userRole === 'super_admin'
  }

  const fetchChannelMembers = async (channelId: string) => {
    try {
      const { data, error } = await supabase
        .from('channel_members')
        .select(`
          *,
          profiles:profiles(full_name, email, role)
        `)
        .eq('channel_id', channelId)

      if (error) {
        console.error('Error fetching channel members:', error)
        return
      }

      setChannelMembers(data || [])
    } catch (error) {
      console.error('Error in fetchChannelMembers:', error)
    }
  }

  const fetchAvailableUsers = async () => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('id, full_name, email, role')
        .order('full_name')

      if (error) {
        console.error('Error fetching available users:', error)
        return
      }

      setAvailableUsers(data || [])
    } catch (error) {
      console.error('Error in fetchAvailableUsers:', error)
    }
  }

  const addUserToChannel = async (userId: string, channelId: string) => {
    try {
      // Add user to channel
      const { error: memberError } = await supabase
        .from('channel_members')
        .insert([{
          channel_id: channelId,
          user_id: userId,
          role: 'member'
        }])

      if (memberError) {
        console.error('Error adding user to channel:', memberError)
        alert('Failed to add user to channel')
        return
      }

      // Get user info for notification
      const userToAdd = availableUsers.find(u => u.id === userId)
      const channelInfo = channels.find(c => c.id === channelId)

      // Send notification message
      const { error: messageError } = await supabase
        .from('messages')
        .insert([{
          content: `👋 Welcome ${userToAdd?.full_name || 'User'} to the channel!`,
          sender_id: user?.id,
          chat_id: channelId,
          message_type: 'system'
        }])

      if (messageError) {
        console.error('Error sending welcome message:', messageError)
      }

      // Refresh channel members
      await fetchChannelMembers(channelId)
      
      setShowAddUserDialog(false)
      setSelectedUserToAdd('')
      
      alert(`Successfully added ${userToAdd?.full_name || 'User'} to the channel!`)
    } catch (error) {
      console.error('Error in addUserToChannel:', error)
      alert('Failed to add user to channel')
    }
  }

  const removeUserFromChannel = async (userId: string, channelId: string) => {
    try {
      // Get user info for notification
      const userToRemove = channelMembers.find(m => m.user_id === userId)
      const channelInfo = channels.find(c => c.id === channelId)

      // Remove user from channel
      const { error: memberError } = await supabase
        .from('channel_members')
        .delete()
        .eq('channel_id', channelId)
        .eq('user_id', userId)

      if (memberError) {
        console.error('Error removing user from channel:', memberError)
        alert('Failed to remove user from channel')
        return
      }

      // Send notification message
      const { error: messageError } = await supabase
        .from('messages')
        .insert([{
          content: `👋 ${userToRemove?.profiles?.full_name || 'User'} has been removed from the channel.`,
          sender_id: user?.id,
          chat_id: channelId,
          message_type: 'system'
        }])

      if (messageError) {
        console.error('Error sending removal message:', messageError)
      }

      // Refresh channel members
      await fetchChannelMembers(channelId)
      
      setShowRemoveUserDialog(false)
      setSelectedUserToRemove('')
      
      alert(`Successfully removed ${userToRemove?.profiles?.full_name || 'User'} from the channel!`)
    } catch (error) {
      console.error('Error in removeUserFromChannel:', error)
      alert('Failed to remove user from channel')
    }
  }

  const isChannelOwner = (channel: Channel) => {
    return channel.created_by === user?.id
  }

  const canManageChannel = (channel: Channel) => {
    return isChannelOwner(channel) || userRole === 'admin' || userRole === 'super_admin'
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
    if (message.deleted_for_everyone || message.deleted_for_sender) {
      return null
    }

    const isOwn = isOwnMessage(message)
    const canEdit = isOwn && message.message_type === 'text'
    const canDelete = isOwn || userRole === 'admin' || userRole === 'super_admin'
    const canForward = true // Anyone can forward messages

    return (
      <div
        key={message.id}
        className={`flex ${isOwn ? 'justify-end' : 'justify-start'} mb-4 group`}
      >
        <div className={`max-w-xs lg:max-w-md ${isOwn ? 'order-2' : 'order-1'}`}>
          {!isOwn && (
            <div className="flex items-center space-x-2 mb-1">
              <div
                className="w-6 h-6 rounded-full flex items-center justify-center text-white text-xs font-medium"
                style={{ backgroundColor: getUserColor(message.sender_id) }}
              >
                {message.sender_name?.charAt(0)?.toUpperCase() || 'U'}
              </div>
              <span className="text-sm font-medium text-gray-700">
                {message.sender_name}
              </span>
              <span className="text-xs text-gray-500">
                {formatTime(message.created_at)}
              </span>
            </div>
          )}
          
          <div className={`rounded-lg px-3 py-2 ${
            isOwn
              ? 'bg-blue-500 text-white'
              : 'bg-gray-100 text-gray-800'
          }`}>
            {editingMessage === message.id ? (
              <div className="space-y-2">
                <textarea
                  value={editContent}
                  onChange={(e) => setEditContent(e.target.value)}
                  className="w-full p-2 border rounded text-black"
                  rows={3}
                />
                <div className="flex space-x-2">
                  <button
                    onClick={() => editMessage(message.id, editContent)}
                    className="px-2 py-1 bg-green-500 text-white rounded text-xs"
                  >
                    Save
                  </button>
                  <button
                    onClick={() => {
                      setEditingMessage(null)
                      setEditContent('')
                    }}
                    className="px-2 py-1 bg-gray-500 text-white rounded text-xs"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            ) : (
              <div className="space-y-2">
                {message.message_type === 'text' && (
                  <p>{message.content}</p>
                )}
                {message.message_type === 'file' && message.file_url && (
                  <div className="flex items-center space-x-2">
                    <FileText className="w-4 h-4 text-gray-500" />
                    <a href={message.file_url} target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline">
                      {message.file_name || 'File'}
                    </a>
                    {message.file_size && <span className="text-xs text-gray-500">({formatFileSize(message.file_size)})</span>}
                  </div>
                )}
                {message.message_type === 'image' && message.file_url && (
                  <div className="flex items-center space-x-2">
                    <ImageIcon className="w-4 h-4 text-gray-500" />
                    <img src={message.file_url} alt="Image" className="max-w-xs max-h-32 object-contain" />
                  </div>
                )}
                {message.message_type === 'system' && (
                  <p className="text-sm text-gray-600 italic">{message.content}</p>
                )}
                
                {message.edited && (
                  <span className="text-xs text-gray-500 italic">(edited)</span>
                )}
                
                {message.forwarded_from && (
                  <span className="text-xs text-gray-500 italic">(forwarded)</span>
                )}
              </div>
            )}
          </div>
          
          {/* Message Actions - Enhanced for all users */}
          <div className={`flex items-center space-x-2 mt-2 ${isOwn ? 'justify-end' : 'justify-start'} ${(userRole === 'admin' || userRole === 'super_admin') ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'} transition-opacity`}>
            {canEdit && editingMessage !== message.id && (
              <button
                onClick={() => {
                  setEditingMessage(message.id)
                  setEditContent(message.content)
                }}
                className="px-2 py-1 bg-blue-500 text-white rounded text-xs hover:bg-blue-600 transition-colors"
                title="Edit message"
              >
                ✏️ Edit
              </button>
            )}
            
            {canDelete && (
              <button
                onClick={() => {
                  const deleteForEveryone = userRole === 'admin' || userRole === 'super_admin'
                  const confirmText = deleteForEveryone 
                    ? 'Delete this message for everyone?' 
                    : 'Delete this message?'
                  if (confirm(confirmText)) {
                    deleteMessage(message.id, deleteForEveryone)
                  }
                }}
                className="px-2 py-1 bg-red-500 text-white rounded text-xs hover:bg-red-600 transition-colors"
                title="Delete message"
              >
                🗑️ Delete
              </button>
            )}
            
            {canForward && (
              <button
                onClick={() => {
                  setForwardingMessage(message)
                  setShowForwardDialog(true)
                }}
                className="px-2 py-1 bg-green-500 text-white rounded text-xs hover:bg-green-600 transition-colors"
                title="Forward message"
              >
                📤 Forward
              </button>
            )}
            
            {/* Always show message info for debugging */}
            <span className="text-xs text-gray-400">
              {message.message_type} • {formatTime(message.created_at)}
            </span>
          </div>
          
          {/* Show message actions info for non-admin users */}
          {(userRole !== 'admin' && userRole !== 'super_admin') && (
            <div className={`text-xs text-gray-400 mt-1 ${isOwn ? 'text-right' : 'text-left'}`}>
              Hover over message to see actions
            </div>
          )}
        </div>
      </div>
    )
  }

  const editMessage = async (messageId: string, newContent: string) => {
    try {
      const { error } = await supabase
        .from('messages')
        .update({
          content: newContent,
          edited: true,
          edited_at: new Date().toISOString()
        })
        .eq('id', messageId)
        .eq('sender_id', user?.id) // Only allow editing own messages

      if (error) {
        console.error('Error editing message:', error)
        alert('Failed to edit message')
        return
      }

      // Update local state
      setMessages(prev => prev.map(msg => 
        msg.id === messageId 
          ? { ...msg, content: newContent, edited: true, edited_at: new Date().toISOString() }
          : msg
      ))

      setEditingMessage(null)
      setEditContent('')
    } catch (error) {
      console.error('Error in editMessage:', error)
      alert('Failed to edit message')
    }
  }

  const deleteMessage = async (messageId: string, deleteForEveryone: boolean = false) => {
    try {
      if (deleteForEveryone) {
        // Delete for everyone (admin only)
        const { error } = await supabase
          .from('messages')
          .update({ deleted_for_everyone: true })
          .eq('id', messageId)

        if (error) {
          console.error('Error deleting message for everyone:', error)
          alert('Failed to delete message')
          return
        }

        // Remove from local state
        setMessages(prev => prev.filter(msg => msg.id !== messageId))
      } else {
        // Delete for sender only
        const { error } = await supabase
          .from('messages')
          .update({ deleted_for_sender: true })
          .eq('id', messageId)
          .eq('sender_id', user?.id)

        if (error) {
          console.error('Error deleting message for sender:', error)
          alert('Failed to delete message')
          return
        }

        // Remove from local state
        setMessages(prev => prev.filter(msg => msg.id !== messageId))
      }
    } catch (error) {
      console.error('Error in deleteMessage:', error)
      alert('Failed to delete message')
    }
  }

  const forwardMessage = async (message: Message, targetChannelId: string) => {
    try {
      const { error } = await supabase
        .from('messages')
        .insert([{
          content: message.content,
          sender_id: user?.id,
          chat_id: targetChannelId,
          message_type: message.message_type,
          file_url: message.file_url,
          file_name: message.file_name,
          file_size: message.file_size,
          file_type: message.file_type,
          forwarded_from: message.id
        }])

      if (error) {
        console.error('Error forwarding message:', error)
        alert('Failed to forward message')
        return
      }

      setShowForwardDialog(false)
      setForwardingMessage(null)
      setSelectedForwardChannel('')
    } catch (error) {
      console.error('Error in forwardMessage:', error)
      alert('Failed to forward message')
    }
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
                      <Badge variant={channel.type === 'announcements' ? 'destructive' : 'secondary'}>
                        {channel.type}
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
                  {/* Channel Management Buttons */}
                  {selectedChannelData && canManageChannel(selectedChannelData) && (
                    <>
                      <Button 
                        variant="outline" 
                        size="sm" 
                        onClick={() => setShowAddUserDialog(true)}
                        className="flex items-center space-x-1"
                      >
                        <Plus className="w-4 h-4" />
                        <span>Add User</span>
                      </Button>
                      <Button 
                        variant="outline" 
                        size="sm" 
                        onClick={() => setShowRemoveUserDialog(true)}
                        className="flex items-center space-x-1"
                      >
                        <Users className="w-4 h-4" />
                        <span>Remove User</span>
                      </Button>
                    </>
                  )}
                  
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={() => fetchMessages(selectedChannel)}
                  >
                    Refresh
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={async () => {
                      console.log('Sending test message...')
                      const { data, error } = await supabase
                        .from('messages')
                        .insert([{
                          content: 'Test message ' + new Date().toLocaleTimeString(),
                          sender_id: user?.id,
                          chat_id: selectedChannel,
                          message_type: 'text'
                        }])
                        .select()
                        .single()
                      
                      if (error) {
                        console.error('Test message error:', error)
                      } else {
                        console.log('Test message sent:', data)
                      }
                    }}
                  >
                    Test
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={() => {
                      console.log('Current messages in state:', messages.length)
                      console.log('Messages:', messages)
                    }}
                  >
                    Debug
                  </Button>
                  <Badge variant={selectedChannelData?.type === 'announcements' ? 'destructive' : 'secondary'}>
                    {selectedChannelData?.type}
                  </Badge>
                  <span className="text-sm text-gray-500">
                    {selectedChannelData?.member_count} members
                  </span>
                </div>
              </div>
              
              {/* Channel Owner Info */}
              {selectedChannelData && isChannelOwner(selectedChannelData) && (
                <div className="mt-2 p-2 bg-green-50 rounded border border-green-200">
                  <div className="text-xs text-green-800">
                    <strong>Channel Owner:</strong> You can manage this channel - add/remove users
                  </div>
                </div>
              )}
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
                    disabled={!canSendMessage(selectedChannelData!)}
                    onKeyPress={(e) => {
                      if (e.key === 'Enter' && !e.shiftKey) {
                        e.preventDefault()
                        sendMessage()
                      }
                    }}
                  />
                  
                  {/* Admin File Upload Buttons - Next to Text Entry */}
                  {(userRole === 'admin' || userRole === 'super_admin') && selectedChannelData && (
                    <div className="flex items-center space-x-2 mt-2">
                      {/* Image Upload Button */}
                      <input
                        type="file"
                        id="image-upload"
                        className="hidden"
                        onChange={handleFileSelect}
                        accept="image/*"
                      />
                      <label
                        htmlFor="image-upload"
                        className="cursor-pointer flex items-center space-x-2 px-3 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors"
                        title="Upload Image (Admin only)"
                      >
                        <ImageIcon className="w-4 h-4" />
                        <span className="text-sm font-medium">📷 Image</span>
                      </label>
                      
                      {/* Document Upload Button */}
                      <input
                        type="file"
                        id="document-upload"
                        className="hidden"
                        onChange={handleFileSelect}
                        accept=".pdf,.doc,.docx,.txt,.zip,.rar"
                      />
                      <label
                        htmlFor="document-upload"
                        className="cursor-pointer flex items-center space-x-2 px-3 py-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600 transition-colors"
                        title="Upload Document (Admin only)"
                      >
                        <FileText className="w-4 h-4" />
                        <span className="text-sm font-medium">📄 Document</span>
                      </label>
                      
                      {/* General File Upload Button */}
                      <input
                        type="file"
                        id="file-upload"
                        className="hidden"
                        onChange={handleFileSelect}
                        accept="image/*,.pdf,.doc,.docx,.txt,.zip,.rar"
                      />
                      <label
                        htmlFor="file-upload"
                        className="cursor-pointer flex items-center space-x-2 px-3 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
                        title="Upload Any File (Admin only)"
                      >
                        <Paperclip className="w-4 h-4" />
                        <span className="text-sm font-medium">📁 File</span>
                      </label>
                      
                      {/* Selected File Display */}
                      {selectedFile && (
                        <div className="flex items-center space-x-2 bg-gray-100 rounded px-3 py-2 border">
                          <span className="text-sm text-gray-700 truncate max-w-32">
                            {selectedFile.name}
                          </span>
                          <button
                            onClick={() => setSelectedFile(null)}
                            className="text-gray-400 hover:text-gray-600"
                            title="Remove file"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                      )}
                    </div>
                  )}
                  
                  {/* File Upload Section - Admin Only (Legacy) */}
                  {selectedChannelData && canUploadFiles(selectedChannelData) && (
                    <div className="flex items-center space-x-2 mt-2 p-2 bg-blue-50 rounded-lg border-2 border-blue-200">
                      <div className="flex items-center space-x-2">
                        <input
                          type="file"
                          id="file-upload-legacy"
                          className="hidden"
                          onChange={handleFileSelect}
                          accept="image/*,.pdf,.doc,.docx,.txt,.zip,.rar"
                        />
                        <label
                          htmlFor="file-upload-legacy"
                          className="cursor-pointer flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
                          title="Upload file (Admin only)"
                        >
                          <Paperclip className="w-5 h-5" />
                          <span className="text-sm font-semibold">📁 Upload File</span>
                        </label>
                        
                        <span className="text-sm text-blue-700 font-medium">
                          (Admin only - Images, PDFs, Documents)
                        </span>
                      </div>
                      
                      {selectedFile && (
                        <div className="flex items-center space-x-2 bg-white rounded px-3 py-2 border">
                          <span className="text-sm text-gray-700 truncate max-w-32">
                            {selectedFile.name}
                          </span>
                          <button
                            onClick={() => setSelectedFile(null)}
                            className="text-gray-400 hover:text-gray-600"
                            title="Remove file"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                      )}
                    </div>
                  )}
                  
                  {/* Fallback Upload Section for Admins */}
                  {(userRole === 'admin' || userRole === 'super_admin') && (!selectedChannelData || !canUploadFiles(selectedChannelData!)) && (
                    <div className="mt-2 p-2 bg-red-50 rounded border border-red-200">
                      <div className="text-xs text-red-800 mb-2">
                        <strong>Upload Section Not Showing - Debug:</strong>
                      </div>
                      <div className="flex items-center space-x-2">
                        <input
                          type="file"
                          id="file-upload-fallback"
                          className="hidden"
                          onChange={handleFileSelect}
                          accept="image/*,.pdf,.doc,.docx,.txt,.zip,.rar"
                        />
                        <label
                          htmlFor="file-upload-fallback"
                          className="cursor-pointer flex items-center space-x-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-medium"
                          title="Upload file (Fallback for Admin)"
                        >
                          <Paperclip className="w-5 h-5" />
                          <span className="text-sm font-semibold">📁 Upload File (Fallback)</span>
                        </label>
                      </div>
                    </div>
                  )}
                  
                  {/* Debug Info for Admin */}
                  {(userRole === 'admin' || userRole === 'super_admin') && (
                    <div className="mt-2 p-2 bg-yellow-50 rounded border border-yellow-200">
                      <div className="text-xs text-yellow-800">
                        <strong>Debug Info:</strong> User Role: {userRole} | 
                        Can Upload: {selectedChannelData ? canUploadFiles(selectedChannelData) : 'No Channel'} | 
                        Channel: {selectedChannelData?.name || 'None'} ({selectedChannelData?.type || 'None'}) |
                        Messages: {messages.length} | 
                        Can Manage: {selectedChannelData ? canManageChannel(selectedChannelData) : 'No Channel'}
                      </div>
                      <div className="mt-2 flex space-x-2">
                        <button
                          onClick={() => {
                            console.log('Test upload button clicked')
                            console.log('User:', user)
                            console.log('User Role:', userRole)
                            console.log('Selected Channel:', selectedChannelData)
                            console.log('Messages:', messages)
                          }}
                          className="px-2 py-1 bg-blue-500 text-white rounded text-xs"
                        >
                          Test Upload Debug
                        </button>
                        <button
                          onClick={() => {
                            const input = document.createElement('input')
                            input.type = 'file'
                            input.accept = 'image/*,.pdf,.doc,.docx,.txt,.zip,.rar'
                            input.onchange = (e) => {
                              const file = (e.target as HTMLInputElement).files?.[0]
                              if (file) {
                                console.log('Test file selected:', file.name, file.size, file.type)
                                setSelectedFile(file)
                              }
                            }
                            input.click()
                          }}
                          className="px-2 py-1 bg-green-500 text-white rounded text-xs"
                        >
                          Test File Select
                        </button>
                        <button
                          onClick={() => {
                            console.log('Testing message sending...')
                            sendMessage()
                          }}
                          className="px-2 py-1 bg-purple-500 text-white rounded text-xs"
                        >
                          Test Send Message
                        </button>
                      </div>
                    </div>
                  )}
                  
                  {/* User Permissions Info */}
                  <div className="mt-2 p-2 bg-gray-50 rounded border border-gray-200">
                    <div className="text-xs text-gray-600">
                      <strong>Your Permissions:</strong> Role: {userRole} | 
                      Can Edit Own Messages: {userRole ? 'Yes' : 'No'} | 
                      Can Delete Messages: {userRole === 'admin' || userRole === 'super_admin' ? 'All Messages' : 'Own Messages'} | 
                      Can Forward: Yes | 
                      Can Manage Channel: {selectedChannelData ? canManageChannel(selectedChannelData) : 'No Channel'}
                    </div>
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
                  {selectedChannelData?.type === 'announcements' 
                    ? 'Only administrators can send messages in announcement channels'
                    : 'You do not have permission to send messages in this channel'
                  }
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
                value={newChannelData.type}
                onValueChange={(value) => setNewChannelData({...newChannelData, type: value as 'general' | 'announcements' | 'parent_teacher' | 'admin_only'})}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="general">General</SelectItem>
                  <SelectItem value="announcements">Announcements</SelectItem>
                  <SelectItem value="parent_teacher">Parent-Teacher</SelectItem>
                  <SelectItem value="admin_only">Admin Only</SelectItem>
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

      {/* Forward Message Dialog */}
      {showForwardDialog && forwardingMessage && (
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
                <Label htmlFor="forward-channel">Select Channel</Label>
                <Select
                  value={selectedForwardChannel}
                  onValueChange={setSelectedForwardChannel}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Choose a channel" />
                  </SelectTrigger>
                  <SelectContent>
                    {channels.map((channel) => (
                      <SelectItem key={channel.id} value={channel.id}>
                        {channel.name} ({channel.type})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div className="p-3 bg-gray-50 rounded">
                <p className="text-sm text-gray-600">Message to forward:</p>
                <p className="text-sm mt-1">{forwardingMessage.content}</p>
                {forwardingMessage.file_name && (
                  <p className="text-xs text-gray-500 mt-1">
                    File: {forwardingMessage.file_name}
                  </p>
                )}
              </div>
            </div>
            
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => {
                  setShowForwardDialog(false)
                  setForwardingMessage(null)
                  setSelectedForwardChannel('')
                }}
              >
                Cancel
              </Button>
              <Button
                onClick={() => {
                  if (selectedForwardChannel) {
                    forwardMessage(forwardingMessage, selectedForwardChannel)
                  }
                }}
                disabled={!selectedForwardChannel}
              >
                Forward
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}

      {/* Add User Dialog */}
      <Dialog open={showAddUserDialog} onOpenChange={setShowAddUserDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add User to Channel</DialogTitle>
            <DialogDescription>
              Select a user to add to this channel.
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            <div>
              <Label htmlFor="add-user">Select User</Label>
              <Select
                value={selectedUserToAdd}
                onValueChange={setSelectedUserToAdd}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Choose a user to add" />
                </SelectTrigger>
                <SelectContent>
                  {availableUsers
                    .filter(user => !channelMembers.some(member => member.user_id === user.id))
                    .map((user) => (
                      <SelectItem key={user.id} value={user.id}>
                        {user.full_name} ({user.email}) - {user.role}
                      </SelectItem>
                    ))}
                </SelectContent>
              </Select>
            </div>
            
            {selectedUserToAdd && (
              <div className="p-3 bg-blue-50 rounded">
                <p className="text-sm text-blue-800">
                  <strong>User to add:</strong> {availableUsers.find(u => u.id === selectedUserToAdd)?.full_name}
                </p>
              </div>
            )}
          </div>
          
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setShowAddUserDialog(false)
                setSelectedUserToAdd('')
              }}
            >
              Cancel
            </Button>
            <Button
              onClick={() => {
                if (selectedUserToAdd && selectedChannel) {
                  addUserToChannel(selectedUserToAdd, selectedChannel)
                }
              }}
              disabled={!selectedUserToAdd}
            >
              Add User
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Remove User Dialog */}
      <Dialog open={showRemoveUserDialog} onOpenChange={setShowRemoveUserDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Remove User from Channel</DialogTitle>
            <DialogDescription>
              Select a user to remove from this channel.
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            <div>
              <Label htmlFor="remove-user">Select User</Label>
              <Select
                value={selectedUserToRemove}
                onValueChange={setSelectedUserToRemove}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Choose a user to remove" />
                </SelectTrigger>
                <SelectContent>
                  {channelMembers
                    .filter(member => member.user_id !== user?.id) // Can't remove yourself
                    .map((member) => (
                      <SelectItem key={member.user_id} value={member.user_id}>
                        {member.profiles?.full_name} ({member.profiles?.email}) - {member.role}
                      </SelectItem>
                    ))}
                </SelectContent>
              </Select>
            </div>
            
            {selectedUserToRemove && (
              <div className="p-3 bg-red-50 rounded">
                <p className="text-sm text-red-800">
                  <strong>User to remove:</strong> {channelMembers.find(m => m.user_id === selectedUserToRemove)?.profiles?.full_name}
                </p>
              </div>
            )}
          </div>
          
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setShowRemoveUserDialog(false)
                setSelectedUserToRemove('')
              }}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={() => {
                if (selectedUserToRemove && selectedChannel) {
                  if (confirm('Are you sure you want to remove this user from the channel?')) {
                    removeUserFromChannel(selectedUserToRemove, selectedChannel)
                  }
                }
              }}
              disabled={!selectedUserToRemove}
            >
              Remove User
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
} 