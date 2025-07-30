'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { supabase } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { ScrollArea } from '@/components/ui/scroll-area'
import { toast } from '@/hooks/use-toast'
import { 
  Send, 
  Plus, 
  Users, 
  UserPlus, 
  UserMinus, 
  Edit, 
  Trash2, 
  Forward, 
  Paperclip,
  ImageIcon, 
  FileText, 
  X,
  MoreVertical,
  Crown,
  Shield,
  User as UserIcon
} from 'lucide-react'
// Removed RealtimeChannel import as it's not needed for basic functionality
import dayjs from 'dayjs'
import relativeTime from 'dayjs/plugin/relativeTime'

dayjs.extend(relativeTime)

interface Message {
  id: string
  chat_id: string
  sender_id: string
  content: string
  message_type: 'text' | 'image' | 'file' | 'system'
  file_url?: string
  file_name?: string
  file_size?: number
  file_type?: string
  edited: boolean
  edited_at?: string
  forwarded_from?: string
  deleted_for_everyone: boolean
  deleted_for_sender: boolean
  created_at: string
  sender?: {
    id: string
    full_name: string
    role: string
  }
}

interface Channel {
  id: string
  name: string
  type: 'general' | 'announcements' | 'parent_teacher' | 'admin_only'
  description: string
  created_by: string
  created_at: string
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
  role: string
  email: string
}

export default function CommunicationHub() {
  // Core state
  const [user, setUser] = useState<any>(null)
  const [userRole, setUserRole] = useState<string>('')
  const [channels, setChannels] = useState<Channel[]>([])
  const [selectedChannel, setSelectedChannel] = useState<Channel | null>(null)
  const [messages, setMessages] = useState<Message[]>([])
  const [messageContent, setMessageContent] = useState('')
  const [isLoading, setIsLoading] = useState(true)

  // Channel management state
  const [showCreateChannel, setShowCreateChannel] = useState(false)
  const [newChannelData, setNewChannelData] = useState({
    name: '',
    description: '',
    type: 'general' as Channel['type'],
    selectedUsers: [] as string[]
  })

  // Member management state
  const [showAddUserDialog, setShowAddUserDialog] = useState(false)
  const [showRemoveUserDialog, setShowRemoveUserDialog] = useState(false)
  const [showMembersDialog, setShowMembersDialog] = useState(false)
  const [channelMembers, setChannelMembers] = useState<ChannelMember[]>([])
  const [availableUsers, setAvailableUsers] = useState<User[]>([])
  const [selectedUserToAdd, setSelectedUserToAdd] = useState<string>('')
  const [selectedUserToRemove, setSelectedUserToRemove] = useState<string>('')

  // File upload state
  const [selectedFile, setSelectedFile] = useState<File | null>(null)

  // Message actions state
  const [editingMessage, setEditingMessage] = useState<string | null>(null)
  const [editContent, setEditContent] = useState('')
  const [forwardingMessage, setForwardingMessage] = useState<Message | null>(null)
  const [showForwardDialog, setShowForwardDialog] = useState(false)
  const [selectedForwardChannel, setSelectedForwardChannel] = useState<string>('')

  // Refs
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const realtimeChannel = useRef<any>(null)

  // Initialize user and load data
  useEffect(() => {
    initializeUser()
  }, [])

  const initializeUser = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        window.location.href = '/login'
        return
      }

      // Get user profile
      const { data: profile } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single()

      if (profile) {
        setUser(profile)
        setUserRole(profile.role)
        await loadChannels()
      }
    } catch (error) {
      console.error('Error initializing user:', error)
      toast({
        title: "Error",
        description: "Failed to initialize user session",
        variant: "destructive"
      })
    } finally {
      setIsLoading(false)
    }
  }

  const loadChannels = async () => {
    try {
      const { data: channelsData, error } = await supabase
        .from('channels')
        .select('*')
        .order('created_at', { ascending: true })

      if (error) throw error
      setChannels(channelsData || [])
    } catch (error) {
      console.error('Error loading channels:', error)
      toast({
        title: "Error",
        description: "Failed to load channels",
        variant: "destructive"
      })
    }
  }

  const selectChannel = async (channel: Channel) => {
    setSelectedChannel(channel)
    setMessages([])
    
    // Unsubscribe from previous channel
    if (realtimeChannel.current) {
      await supabase.removeChannel(realtimeChannel.current)
    }

    // Load messages for this channel
    await loadChannelMessages(channel.id)
    
    // Subscribe to real-time updates
    subscribeToMessages(channel.id)
  }

  const loadChannelMessages = async (channelId: string) => {
    try {
      const { data: messagesData, error } = await supabase
        .from('messages')
        .select(`
          *,
          sender:profiles(id, full_name, role)
        `)
        .eq('chat_id', channelId)
        .order('created_at', { ascending: true })

      if (error) throw error
      setMessages(messagesData || [])
      scrollToBottom()
    } catch (error) {
        console.error('Error loading messages:', error)
      toast({
        title: "Error",
        description: "Failed to load messages",
        variant: "destructive"
      })
    }
  }

  const subscribeToMessages = (channelId: string) => {
    const channel = supabase
        .channel(`messages:${channelId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'messages',
          filter: `chat_id=eq.${channelId}`
        },
        async (payload) => {
          const newMessage = payload.new as Message
          
          // Fetch sender info
          const { data: senderData } = await supabase
              .from('profiles')
            .select('id, full_name, role')
              .eq('id', newMessage.sender_id)
              .single()
            
          if (senderData) {
            newMessage.sender = senderData
          }

          setMessages(prev => [...prev, newMessage])
          scrollToBottom()
        }
      )
        .subscribe()

    realtimeChannel.current = channel
  }

  const scrollToBottom = () => {
    setTimeout(() => {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
    }, 100)
  }

  // Permission functions
  const canSendMessage = (channel: Channel) => {
    if (!channel) return false
    if (channel.type === 'announcements') {
      return userRole === 'admin' || userRole === 'super_admin'
    }
    return true
  }

  const canUploadFiles = () => {
    return userRole === 'admin' || userRole === 'super_admin'
  }

  const isChannelOwner = (channel: Channel) => {
    return user && channel.created_by === user.id
  }

  const canManageChannel = (channel: Channel) => {
    return isChannelOwner(channel) || userRole === 'admin' || userRole === 'super_admin'
  }

  // Message actions
  const sendMessage = async () => {
    if (!selectedChannel || !user || !messageContent.trim()) return

    try {
      let messageData: any = {
        chat_id: selectedChannel.id,
        sender_id: user.id,
        content: messageContent.trim(),
        message_type: 'text'
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
        }
      }

      const { error } = await supabase
        .from('messages')
        .insert([messageData])

      if (error) throw error

      setMessageContent('')
      setSelectedFile(null)
    } catch (error) {
      console.error('Error sending message:', error)
      toast({
        title: "Error",
        description: "Failed to send message",
        variant: "destructive"
      })
    }
  }

  const uploadFile = async (file: File): Promise<string | null> => {
    try {
      // Client-side validation
      const maxSize = 10 * 1024 * 1024 // 10MB
      if (file.size > maxSize) {
        toast({
          title: "Error",
          description: "File size must be less than 10MB",
          variant: "destructive"
        })
        return null
      }
      
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
      toast({
        title: "Upload Error",
        description: error instanceof Error ? error.message : "Failed to upload file",
        variant: "destructive"
      })
      return null
    }
  }

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      setSelectedFile(file)
    }
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

      if (error) throw error

      setMessages(prev => prev.map(msg => 
        msg.id === messageId 
          ? { ...msg, content: newContent, edited: true, edited_at: new Date().toISOString() }
          : msg
      ))

      setEditingMessage(null)
      setEditContent('')

      toast({
        title: "Success",
        description: "Message edited successfully"
      })
    } catch (error) {
      console.error('Error editing message:', error)
      toast({
        title: "Error",
        description: "Failed to edit message",
        variant: "destructive"
      })
    }
  }

  const deleteMessage = async (messageId: string, deleteForEveryone: boolean = false) => {
    try {
      const updateData = deleteForEveryone 
        ? { deleted_for_everyone: true }
        : { deleted_for_sender: true }

      const { error } = await supabase
        .from('messages')
        .update(updateData)
        .eq('id', messageId)

      if (error) throw error

      setMessages(prev => prev.map(msg => 
        msg.id === messageId 
          ? { ...msg, ...updateData }
          : msg
      ))

      toast({
        title: "Success",
        description: deleteForEveryone ? "Message deleted for everyone" : "Message deleted"
      })
    } catch (error) {
      console.error('Error deleting message:', error)
      toast({
        title: "Error",
        description: "Failed to delete message",
        variant: "destructive"
      })
    }
  }

  const forwardMessage = async () => {
    if (!forwardingMessage || !selectedForwardChannel) return

    try {
      const { error } = await supabase
        .from('messages')
        .insert([{
          chat_id: selectedForwardChannel,
            sender_id: user.id,
          content: forwardingMessage.content,
          message_type: forwardingMessage.message_type,
          file_url: forwardingMessage.file_url,
          file_name: forwardingMessage.file_name,
          file_size: forwardingMessage.file_size,
          file_type: forwardingMessage.file_type,
          forwarded_from: forwardingMessage.id
        }])

      if (error) throw error

      setShowForwardDialog(false)
      setForwardingMessage(null)
      setSelectedForwardChannel('')

      toast({
        title: "Success",
        description: "Message forwarded successfully"
      })
    } catch (error) {
      console.error('Error forwarding message:', error)
      toast({
        title: "Error",
        description: "Failed to forward message",
        variant: "destructive"
      })
    }
  }

  // Channel management
  const createChannel = async () => {
    try {
      const { data: channelData, error: channelError } = await supabase
        .from('channels')
        .insert([{
          name: newChannelData.name,
          description: newChannelData.description,
          type: newChannelData.type,
          created_by: user.id
        }])
        .select()
        .single()

      if (channelError) throw channelError

      // Add creator as owner
      const { error: memberError } = await supabase
        .from('channel_members')
        .insert([{
          channel_id: channelData.id,
          user_id: user.id,
          role: 'owner'
        }])

      if (memberError) throw memberError

      // Add selected users as members
      if (newChannelData.selectedUsers.length > 0) {
        const membersToAdd = newChannelData.selectedUsers.map(userId => ({
          channel_id: channelData.id,
                user_id: userId,
          role: 'member' as const
        }))

        const { error: bulkMemberError } = await supabase
          .from('channel_members')
          .insert(membersToAdd)

        if (bulkMemberError) throw bulkMemberError
      }

      // Send system message
      await supabase
        .from('messages')
        .insert([{
          chat_id: channelData.id,
          sender_id: user.id,
          content: `Channel "${channelData.name}" has been created.`,
          message_type: 'system'
        }])

      await loadChannels()
      setShowCreateChannel(false)
      setNewChannelData({
        name: '',
        description: '',
        type: 'general',
        selectedUsers: []
      })

      toast({
        title: "Success",
        description: "Channel created successfully"
      })
    } catch (error) {
      console.error('Error creating channel:', error)
      toast({
        title: "Error",
        description: "Failed to create channel",
        variant: "destructive"
      })
    }
  }

  // Member management
  const fetchChannelMembers = async () => {
    if (!selectedChannel) return

    try {
      const { data, error } = await supabase
        .from('channel_members')
        .select(`
          *,
          user:profiles(id, full_name, role, email)
        `)
        .eq('channel_id', selectedChannel.id)

      if (error) throw error
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
      toast({
        title: "Error",
        description: "Failed to fetch available users",
        variant: "destructive"
      })
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
          chat_id: selectedChannel.id,
          sender_id: user.id,
          content: `${userData?.full_name || 'User'} has been added to the channel.`,
          message_type: 'system'
        }])

      setShowAddUserDialog(false)
      setSelectedUserToAdd('')
      await fetchChannelMembers()

      toast({
        title: "Success",
        description: "User added to channel successfully"
      })
    } catch (error) {
      console.error('Error adding user to channel:', error)
      toast({
        title: "Error",
        description: "Failed to add user to channel",
        variant: "destructive"
      })
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
          chat_id: selectedChannel.id,
          sender_id: user.id,
          content: `${userData?.full_name || 'User'} has been removed from the channel.`,
          message_type: 'system'
        }])

      setShowRemoveUserDialog(false)
      setSelectedUserToRemove('')
      await fetchChannelMembers()

      toast({
        title: "Success",
        description: "User removed from channel successfully"
      })
    } catch (error) {
      console.error('Error removing user from channel:', error)
      toast({
        title: "Error",
        description: "Failed to remove user from channel",
        variant: "destructive"
      })
    }
  }

  // Utility functions
  const formatTime = (timestamp: string) => {
    return dayjs(timestamp).format('h:mm A')
  }

  const isOwnMessage = (message: Message) => {
    return user && message.sender_id === user.id
  }

  const getChannelTypeColor = (type: Channel['type']) => {
    switch (type) {
      case 'announcements': return 'bg-red-100 text-red-800'
      case 'admin_only': return 'bg-purple-100 text-purple-800'
      case 'parent_teacher': return 'bg-blue-100 text-blue-800'
      default: return 'bg-green-100 text-green-800'
    }
  }

  const getRoleIcon = (role: string) => {
    switch (role) {
      case 'owner': return <Crown className="w-3 h-3 text-yellow-500" />
      case 'admin': return <Shield className="w-3 h-3 text-blue-500" />
      default: return <UserIcon className="w-3 h-3 text-gray-500" />
    }
  }

  // Message rendering
  const renderMessage = (message: Message) => {
    if (message.deleted_for_everyone || (message.deleted_for_sender && isOwnMessage(message))) {
      return null
    }

    const isOwn = isOwnMessage(message)
    const isAdmin = userRole === 'admin' || userRole === 'super_admin'
    
    const canEdit = (isOwn || isAdmin) && message.message_type === 'text'
    const canDelete = isOwn || isAdmin
    const canForward = true
    
    return (
      <div key={message.id} className={`flex ${isOwn ? 'justify-end' : 'justify-start'} mb-4 group`}>
        <div className={`max-w-[70%] ${isOwn ? 'order-2' : 'order-1'}`}>
          {!isOwn && (
            <div className="flex items-center mb-1">
              <Avatar className="w-6 h-6 mr-2">
                <AvatarFallback className="text-xs">
                  {message.sender?.full_name?.charAt(0) || 'U'}
                </AvatarFallback>
              </Avatar>
              <span className="text-sm font-medium text-gray-700">
                {message.sender?.full_name || 'Unknown User'}
              </span>
              <Badge variant="outline" className="ml-2 text-xs">
                {message.sender?.role || 'user'}
              </Badge>
            </div>
          )}
          
          <div className={`
            rounded-lg p-3 shadow-sm
            ${isOwn 
              ? 'bg-blue-500 text-white' 
              : message.message_type === 'system'
                ? 'bg-gray-100 text-gray-700 italic'
                : 'bg-white border border-gray-200'
            }
          `}>
            {editingMessage === message.id ? (
              <div className="space-y-2">
                <Textarea
                  value={editContent}
                  onChange={(e) => setEditContent(e.target.value)}
                  className="min-h-[60px]"
                />
                <div className="flex space-x-2">
                  <Button 
                    size="sm" 
                    onClick={() => editMessage(message.id, editContent)}
                  >
                    Save
                  </Button>
                  <Button 
                    size="sm" 
                    variant="outline"
                    onClick={() => {
                      setEditingMessage(null)
                      setEditContent('')
                    }}
                  >
                    Cancel
                  </Button>
                </div>
              </div>
            ) : (
              <>
                {/* Message content based on type */}
                {message.message_type === 'text' && (
                  <p className="whitespace-pre-wrap">{message.content}</p>
                )}
                
                {message.message_type === 'image' && message.file_url && (
                  <div className="space-y-2">
                    {message.content && <p className="whitespace-pre-wrap">{message.content}</p>}
                <img 
                  src={message.file_url} 
                      alt={message.file_name || 'Image'}
                      className="max-w-full h-auto rounded cursor-pointer"
                      onClick={() => window.open(message.file_url, '_blank')}
                    />
              </div>
                )}
                
                {message.message_type === 'file' && message.file_url && (
                  <div className="space-y-2">
                    {message.content && <p className="whitespace-pre-wrap">{message.content}</p>}
                    <div className="flex items-center space-x-2 p-2 bg-gray-50 rounded border">
                  <FileText className="w-4 h-4" />
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
              </div>
                )}

                {message.message_type === 'system' && (
                  <p className="text-center text-sm">{message.content}</p>
                )}

                {/* Message metadata */}
                <div className="flex items-center justify-between mt-2 text-xs">
                  <div className="flex items-center space-x-2">
                    {message.edited && <span className="text-gray-400">(edited)</span>}
                    {message.forwarded_from && <span className="text-gray-400">(forwarded)</span>}
                  </div>
                  <span className={isOwn ? "text-blue-100" : "text-gray-500"}>
            {formatTime(message.created_at)}
                  </span>
          </div>
              </>
            )}
          </div>

          {/* Message Actions */}
          {message.message_type !== 'system' && (
            <div className={`flex items-center space-x-2 mt-2 ${isOwn ? 'justify-end' : 'justify-start'} ${isAdmin ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'} transition-opacity`}>
              {canEdit && editingMessage !== message.id && (
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => {
                    setEditingMessage(message.id)
                    setEditContent(message.content)
                  }}
                  className="h-6 px-2 text-xs"
                >
                  <Edit className="w-3 h-3 mr-1" />
                  Edit
                </Button>
              )}
              
              {canDelete && (
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => {
                    const deleteForEveryone = isAdmin
                    const confirmText = deleteForEveryone 
                      ? 'Delete this message for everyone?' 
                      : 'Delete this message?'
                    if (confirm(confirmText)) {
                      deleteMessage(message.id, deleteForEveryone)
                    }
                  }}
                  className="h-6 px-2 text-xs text-red-600 hover:text-red-700"
                >
                  <Trash2 className="w-3 h-3 mr-1" />
                  Delete
                </Button>
              )}
              
              {canForward && (
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => {
                    setForwardingMessage(message)
                    setShowForwardDialog(true)
                  }}
                  className="h-6 px-2 text-xs"
                >
                  <Forward className="w-3 h-3 mr-1" />
                  Forward
                </Button>
              )}
            </div>
          )}
        </div>
      </div>
    )
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading Communication Hub...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Sidebar - Channels */}
          <div className="lg:col-span-1">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg">Channels</CardTitle>
                <Button
                  size="sm"
                    onClick={() => setShowCreateChannel(true)}
                    className="h-8 w-8 p-0"
                >
                  <Plus className="w-4 h-4" />
                </Button>
            </div>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-[600px]">
            <div className="space-y-2">
              {channels.map((channel) => (
                <div
                  key={channel.id}
                        className={`
                          p-3 rounded-lg cursor-pointer transition-colors
                          ${selectedChannel?.id === channel.id 
                            ? 'bg-blue-100 border-blue-300' 
                            : 'hover:bg-gray-100 border-gray-200'
                          } border
                        `}
                        onClick={() => selectChannel(channel)}
                      >
                        <div className="flex items-center justify-between mb-1">
                          <h3 className="font-medium text-sm">{channel.name}</h3>
                          <Badge className={`text-xs ${getChannelTypeColor(channel.type)}`}>
                            {channel.type}
                      </Badge>
                    </div>
                        <p className="text-xs text-gray-600 truncate">{channel.description}</p>
                </div>
              ))}
            </div>
                </ScrollArea>
              </CardContent>
            </Card>
      </div>

      {/* Main Chat Area */}
          <div className="lg:col-span-3">
        {selectedChannel ? (
              <Card className="h-[700px] flex flex-col">
            {/* Chat Header */}
                <CardHeader className="border-b">
              <div className="flex items-center justify-between">
                <div>
                      <CardTitle className="flex items-center space-x-2">
                        <span>{selectedChannel.name}</span>
                        <Badge className={getChannelTypeColor(selectedChannel.type)}>
                          {selectedChannel.type}
                  </Badge>
                      </CardTitle>
                      <p className="text-sm text-gray-600 mt-1">{selectedChannel.description}</p>
            </div>

                    <div className="flex items-center space-x-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => {
                          fetchChannelMembers()
                          setShowMembersDialog(true)
                        }}
                      >
                        <Users className="w-4 h-4 mr-1" />
                        Members
                      </Button>
                      
                      {canManageChannel(selectedChannel) && (
                        <>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => {
                              fetchAvailableUsers()
                              setShowAddUserDialog(true)
                            }}
                          >
                            <UserPlus className="w-4 h-4 mr-1" />
                            Add User
                          </Button>
                          
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => {
                              fetchChannelMembers()
                              setShowRemoveUserDialog(true)
                            }}
                          >
                            <UserMinus className="w-4 h-4 mr-1" />
                            Remove User
                          </Button>
                        </>
                      )}
                </div>
                  </div>
                </CardHeader>

                {/* Messages Area */}
                <CardContent className="flex-1 overflow-hidden p-0">
                  <ScrollArea className="h-full p-4">
                <div className="space-y-4">
                      {messages.map((message) => renderMessage(message))}
                      <div ref={messagesEndRef} />
                </div>
                  </ScrollArea>
                </CardContent>

            {/* Message Input */}
                <div className="border-t p-4">
                  {/* File Upload Section - Admin Only */}
                  {canUploadFiles() && selectedChannel && (
                    <div className="flex items-center space-x-2 mb-3 p-3 bg-blue-50 rounded-lg border border-blue-200">
                      <div className="text-sm text-blue-600 font-medium mr-2">Admin Files:</div>
                      
                      {/* Image Upload */}
                      <input
                        type="file"
                        id="image-upload"
                        className="hidden"
                        onChange={handleFileSelect}
                        accept="image/*"
                      />
                      <label
                        htmlFor="image-upload"
                        className="cursor-pointer flex items-center space-x-1 px-2 py-1 bg-green-500 text-white rounded hover:bg-green-600 transition-colors text-xs"
                      >
                        <ImageIcon className="w-3 h-3" />
                        <span>📷 Image</span>
                      </label>
                      
                      {/* Document Upload */}
                      <input
                        type="file"
                        id="document-upload"
                        className="hidden"
                        onChange={handleFileSelect}
                        accept=".pdf,.doc,.docx,.txt,.zip,.rar"
                      />
                      <label
                        htmlFor="document-upload"
                        className="cursor-pointer flex items-center space-x-1 px-2 py-1 bg-purple-500 text-white rounded hover:bg-purple-600 transition-colors text-xs"
                      >
                        <FileText className="w-3 h-3" />
                        <span>📄 Doc</span>
                      </label>
                      
                      {/* General File Upload */}
                    <input
                      type="file"
                      id="file-upload"
                      className="hidden"
                      onChange={handleFileSelect}
                        accept="image/*,.pdf,.doc,.docx,.txt,.zip,.rar"
                    />
                    <label
                      htmlFor="file-upload"
                        className="cursor-pointer flex items-center space-x-1 px-2 py-1 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors text-xs"
                    >
                        <Paperclip className="w-3 h-3" />
                        <span>📁 File</span>
                    </label>
                    
                      {/* Selected File Display */}
                    {selectedFile && (
                        <div className="flex items-center space-x-2 bg-white rounded px-2 py-1 border">
                          <span className="text-xs text-gray-700 truncate max-w-24">
                          {selectedFile.name}
                        </span>
                        <button
                          onClick={() => setSelectedFile(null)}
                          className="text-gray-400 hover:text-gray-600"
                        >
                            <X className="w-3 h-3" />
                        </button>
                      </div>
                    )}
                  </div>
                  )}

                  {/* Text Input */}
                  <div className="flex items-end space-x-2">
                    <div className="flex-1">
                      <Textarea
                        value={messageContent}
                        onChange={(e) => setMessageContent(e.target.value)}
                        onKeyPress={(e) => {
                          if (e.key === 'Enter' && !e.shiftKey) {
                            e.preventDefault()
                            sendMessage()
                          }
                        }}
                        placeholder={
                          canSendMessage(selectedChannel) 
                            ? "Type your message..." 
                            : "You don't have permission to send messages in this channel"
                        }
                        className="min-h-[60px] resize-none"
                        disabled={!canSendMessage(selectedChannel)}
                      />
                    </div>
                <Button
                  onClick={sendMessage}
                      disabled={!canSendMessage(selectedChannel) || (!messageContent.trim() && !selectedFile)}
                      className="h-[60px] px-4"
                    >
                      <Send className="w-4 h-4" />
                </Button>
              </div>
                </div>
              </Card>
        ) : (
              <Card className="h-[700px] flex items-center justify-center">
            <div className="text-center text-gray-500">
                  <Users className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                  <h3 className="text-lg font-medium mb-2">Select a channel to start chatting</h3>
                  <p className="text-sm">Choose a channel from the sidebar to view messages and start conversations.</p>
            </div>
              </Card>
        )}
          </div>
        </div>
      </div>

      {/* Create Channel Dialog */}
      <Dialog open={showCreateChannel} onOpenChange={setShowCreateChannel}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Create New Channel</DialogTitle>
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
                value={newChannelData.type} 
                onValueChange={(value: Channel['type']) => setNewChannelData(prev => ({ ...prev, type: value }))}
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
            <div className="flex space-x-2">
              <Button onClick={createChannel} className="flex-1">Create Channel</Button>
              <Button variant="outline" onClick={() => setShowCreateChannel(false)} className="flex-1">
                Cancel
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Add User Dialog */}
      <Dialog open={showAddUserDialog} onOpenChange={setShowAddUserDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Add User to Channel</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium">Select User</label>
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
            <div className="flex space-x-2">
              <Button onClick={addUserToChannel} disabled={!selectedUserToAdd} className="flex-1">
                Add User
              </Button>
              <Button variant="outline" onClick={() => setShowAddUserDialog(false)} className="flex-1">
                Cancel
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Remove User Dialog */}
      <Dialog open={showRemoveUserDialog} onOpenChange={setShowRemoveUserDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Remove User from Channel</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium">Select User</label>
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
            <div className="flex space-x-2">
              <Button 
                onClick={removeUserFromChannel} 
                disabled={!selectedUserToRemove} 
                variant="destructive"
                className="flex-1"
              >
                Remove User
              </Button>
              <Button variant="outline" onClick={() => setShowRemoveUserDialog(false)} className="flex-1">
                Cancel
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* View Members Dialog */}
      <Dialog open={showMembersDialog} onOpenChange={setShowMembersDialog}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Channel Members</DialogTitle>
          </DialogHeader>
          <ScrollArea className="max-h-96">
            <div className="space-y-3">
              {channelMembers.map((member) => (
                <div key={member.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <Avatar className="w-10 h-10">
                      <AvatarFallback>
                        {member.user?.full_name?.charAt(0) || 'U'}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-medium">{member.user?.full_name}</p>
                      <p className="text-sm text-gray-600">{member.user?.email}</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Badge variant="outline" className="flex items-center space-x-1">
                      {getRoleIcon(member.role)}
                      <span>{member.role}</span>
                    </Badge>
                    <Badge variant="secondary">{member.user?.role}</Badge>
                  </div>
                </div>
              ))}
            </div>
          </ScrollArea>
        </DialogContent>
      </Dialog>

      {/* Forward Message Dialog */}
      <Dialog open={showForwardDialog} onOpenChange={setShowForwardDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Forward Message</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium">Select Channel</label>
              <Select value={selectedForwardChannel} onValueChange={setSelectedForwardChannel}>
                <SelectTrigger>
                  <SelectValue placeholder="Choose a channel" />
                </SelectTrigger>
                <SelectContent>
                  {channels
                    .filter(channel => channel.id !== selectedChannel?.id)
                    .map((channel) => (
                      <SelectItem key={channel.id} value={channel.id}>
                        {channel.name}
                      </SelectItem>
                    ))}
                </SelectContent>
              </Select>
            </div>
            {forwardingMessage && (
              <div className="p-3 bg-gray-50 rounded border">
                <p className="text-sm font-medium mb-1">Message to forward:</p>
                <p className="text-sm text-gray-600 truncate">{forwardingMessage.content}</p>
              </div>
            )}
            <div className="flex space-x-2">
              <Button onClick={forwardMessage} disabled={!selectedForwardChannel} className="flex-1">
                Forward
              </Button>
              <Button variant="outline" onClick={() => setShowForwardDialog(false)} className="flex-1">
                Cancel
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
} 