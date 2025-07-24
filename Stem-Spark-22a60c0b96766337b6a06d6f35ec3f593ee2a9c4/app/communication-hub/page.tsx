'use client'

import { useState, useEffect, useRef } from 'react'
import { supabase } from '@/lib/supabase'
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
  Image as ImageIcon,
  Paperclip,
  Reply,
  Download,
  FileText
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
  const [loading, setLoading] = useState(true)
  const [channels, setChannels] = useState<Channel[]>([])
  const [messages, setMessages] = useState<Message[]>([])
  const [selectedChannel, setSelectedChannel] = useState<Channel | null>(null)
  const [newMessage, setNewMessage] = useState('')
  const [users, setUsers] = useState<User[]>([])
  const [unreadCounts, setUnreadCounts] = useState<{[key: string]: number}>({})
  const [showCreateDialog, setShowCreateDialog] = useState(false)
  const [newChannelData, setNewChannelData] = useState({
    name: '',
    description: '',
    channel_type: 'public' as const,
    selectedUsers: [] as string[]
  })
  const [userRole, setUserRole] = useState<string>('')
  const [currentSubscription, setCurrentSubscription] = useState<any>(null)
  const [replyingTo, setReplyingTo] = useState<Message | null>(null)
  const [uploadingFile, setUploadingFile] = useState(false)
  const [uploadingImage, setUploadingImage] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const imageInputRef = useRef<HTMLInputElement>(null)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    checkAuth()
  }, [])

  useEffect(() => {
    return () => {
      if (currentSubscription) {
        currentSubscription.unsubscribe()
      }
    }
  }, [currentSubscription])

  useEffect(() => {
    if (selectedChannel) {
      loadMessages(selectedChannel.id)
      
      if (currentSubscription) {
        currentSubscription.unsubscribe()
      }
      
      const subscription = subscribeToMessages(selectedChannel.id)
      setCurrentSubscription(subscription)
    }
    
    return () => {
      if (currentSubscription) {
        currentSubscription.unsubscribe()
      }
    }
  }, [selectedChannel])

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const checkAuth = async () => {
    try {
      const { data: { user: authUser }, error: authError } = await supabase.auth.getUser()
      
      if (authError || !authUser) {
        window.location.href = '/login'
        return
      }

      await loadUserProfile(authUser.id)
      await loadCommunicationData(authUser.id)
    } catch (error) {
      console.error('Error in checkAuth:', error)
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
      setUserRole(profile.role || '')
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
      
      setChannels(channelsWithMemberCount.sort((a, b) => a.name.localeCompare(b.name)));
      if (channelsWithMemberCount.length > 0 && !selectedChannel) {
        setSelectedChannel(channelsWithMemberCount[0])
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

      if (!error && userData) {
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
      console.log('Loading messages for channel:', channelId)
      
      // First, get basic messages without complex relationships
      const { data: messages, error } = await supabase
        .from('chat_messages')
        .select('*')
        .eq('channel_id', channelId)
        .eq('is_deleted', false)
        .order('created_at', { ascending: true })

      if (error) {
        console.error('Error loading messages:', error)
        return
      }

      console.log('Messages loaded:', messages?.length || 0)
      
      // Get sender profiles separately to avoid relationship ambiguity
      const senderIds = [...new Set(messages?.map(msg => msg.sender_id).filter(Boolean) || [])]
      const { data: profiles } = await supabase
        .from('profiles')
        .select('id, full_name, avatar_url')
        .in('id', senderIds)

      const profilesMap = new Map(profiles?.map(p => [p.id, p]) || [])
      
      // Get reply messages separately
      const replyIds = messages?.map(msg => msg.reply_to_id).filter(Boolean) || []
      const { data: replyMessages } = await supabase
        .from('chat_messages')
        .select('id, content, sender_id')
        .in('id', replyIds)

      const replyMap = new Map(replyMessages?.map(r => [r.id, r]) || [])
      
      const formattedMessages: Message[] = (messages || []).map(msg => {
        const sender = profilesMap.get(msg.sender_id)
        const replyMsg = msg.reply_to_id ? replyMap.get(msg.reply_to_id) : null
        const replySender = replyMsg ? profilesMap.get(replyMsg.sender_id) : null
        
        return {
          id: msg.id,
          content: msg.content,
          sender_id: msg.sender_id,
          sender_name: sender?.full_name || 'Unknown User',
          channel_id: msg.channel_id,
          created_at: msg.created_at,
          message_type: msg.message_type || 'text',
          file_url: msg.file_url,
          image_url: msg.image_url,
          image_caption: msg.image_caption,
          file_name: msg.file_name,
          file_size: msg.file_size,
          file_type: msg.file_type,
          reply_to_id: msg.reply_to_id,
          reply_to: replyMsg ? {
            content: replyMsg.content,
            sender: {
              full_name: replySender?.full_name || 'Unknown User'
            }
          } : undefined,
          sender: {
            full_name: sender?.full_name || 'Unknown User',
            avatar_url: sender?.avatar_url
          }
        }
      })

      setMessages(formattedMessages)
    } catch (error) {
      console.error('Error loading messages:', error)
    }
  }

  const subscribeToMessages = (channelId: string) => {
    const subscription = supabase
      .channel(`messages:${channelId}`)
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'chat_messages',
        filter: `channel_id=eq.${channelId}`
      }, async (payload) => {
        if (payload.eventType === 'INSERT') {
          const newMessage = payload.new as any
          
          // Get sender profile for the new message
          const { data: sender } = await supabase
            .from('profiles')
            .select('full_name, avatar_url')
            .eq('id', newMessage.sender_id)
            .single()
          
          const formattedMessage: Message = {
            id: newMessage.id,
            content: newMessage.content,
            sender_id: newMessage.sender_id,
            sender_name: sender?.full_name || 'Unknown User',
            channel_id: newMessage.channel_id,
            created_at: newMessage.created_at,
            message_type: newMessage.message_type || 'text',
            file_url: newMessage.file_url,
            image_url: newMessage.image_url,
            image_caption: newMessage.image_caption,
            file_name: newMessage.file_name,
            file_size: newMessage.file_size,
            file_type: newMessage.file_type,
            reply_to_id: newMessage.reply_to_id,
            sender: {
              full_name: sender?.full_name || 'Unknown User',
              avatar_url: sender?.avatar_url
            }
          }
          
          setMessages(prev => [...prev, formattedMessage])
        } else if (payload.eventType === 'DELETE') {
          setMessages(prev => prev.filter(msg => msg.id !== payload.old.id));
        }
      })
      .subscribe()

    return subscription
  }

  const handleSendMessage = async () => {
    if (!newMessage.trim() || !user || !selectedChannel) return

    try {
      const messageData: any = {
        content: newMessage,
        sender_id: user.id,
        channel_id: selectedChannel.id,
        message_type: 'text'
      }

      if (replyingTo) {
        messageData.reply_to_id = replyingTo.id
      }

      const { error } = await supabase
        .from('chat_messages')
        .insert(messageData)

      if (!error) {
        setNewMessage('')
        setReplyingTo(null)
      } else {
        console.error('Error sending message:', error)
      }
    } catch (error) {
      console.error('Error sending message:', error)
    }
  }

  const handleFileUpload = async (file: File) => {
    if (!user || !selectedChannel) return

    try {
      setUploadingFile(true)
      
      const fileExt = file.name.split('.').pop()
      const fileName = `${Date.now()}.${fileExt}`
      const filePath = `chat-files/${selectedChannel.id}/${fileName}`

      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('chat-attachments')
        .upload(filePath, file)

      if (uploadError) {
        console.error('Error uploading file:', uploadError)
        return
      }

      const { data: { publicUrl } } = supabase.storage
        .from('chat-attachments')
        .getPublicUrl(filePath)

      const messageData = {
        content: `📎 ${file.name}`,
        sender_id: user.id,
        channel_id: selectedChannel.id,
        message_type: 'file' as const,
        file_url: publicUrl,
        file_name: file.name,
        file_size: file.size,
        file_type: file.type,
        reply_to_id: replyingTo?.id || null
      }

      const { error } = await supabase
        .from('chat_messages')
        .insert(messageData)

      if (!error) {
        setReplyingTo(null)
      } else {
        console.error('Error saving file message:', error)
      }
    } catch (error) {
      console.error('Error handling file upload:', error)
    } finally {
      setUploadingFile(false)
    }
  }

  const handleImageUpload = async (file: File) => {
    if (!user || !selectedChannel) return

    try {
      setUploadingImage(true)
      
      const fileExt = file.name.split('.').pop()
      const fileName = `${Date.now()}.${fileExt}`
      const filePath = `chat-images/${selectedChannel.id}/${fileName}`

      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('chat-attachments')
        .upload(filePath, file)

      if (uploadError) {
        console.error('Error uploading image:', uploadError)
        return
      }

      const { data: { publicUrl } } = supabase.storage
        .from('chat-attachments')
        .getPublicUrl(filePath)

      const messageData = {
        content: newMessage || '📷 Image',
        sender_id: user.id,
        channel_id: selectedChannel.id,
        message_type: 'image' as const,
        image_url: publicUrl,
        image_caption: newMessage || null,
        reply_to_id: replyingTo?.id || null
      }

      const { error } = await supabase
        .from('chat_messages')
        .insert(messageData)

      if (!error) {
        setNewMessage('')
        setReplyingTo(null)
      } else {
        console.error('Error saving image message:', error)
      }
    } catch (error) {
      console.error('Error handling image upload:', error)
    } finally {
      setUploadingImage(false)
    }
  }

  const handleDeleteMessage = async (messageId: string) => {
    if (!user) return;
    
    setMessages(prevMessages => prevMessages.filter(msg => msg.id !== messageId));

    try {
      const { error } = await supabase
        .from('chat_messages')
        .delete()
        .eq('id', messageId)
        .eq('sender_id', user.id);

      if (error) {
        console.error('Error deleting message:', error);
      }
    } catch (err) {
      console.error('Unexpected error deleting message:', err);
    }
  };

  const handleReply = (message: Message) => {
    setReplyingTo(message)
  }

  const cancelReply = () => {
    setReplyingTo(null)
  }

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  const handleCreateChannel = async () => {
    try {
      if (!user) {
        alert('Please log in to create a channel.')
        return
      }

      if (!newChannelData.name.trim()) {
        alert('Please enter a channel name.')
        return
      }

      const { data: channel, error } = await supabase
        .from('chat_channels')
        .insert({
          name: newChannelData.name.trim(),
          description: newChannelData.description.trim(),
          channel_type: newChannelData.channel_type,
          created_by: user.id
        })
        .select()
        .single()

      if (error) {
        alert(`Failed to create channel: ${error.message}`)
        return
      }

      const { error: memberError } = await supabase
        .from('chat_channel_members')
        .insert({
          user_id: user.id,
          channel_id: channel.id,
          role: 'admin'
        })

      if (memberError) {
        await supabase.from('chat_channels').delete().eq('id', channel.id)
        alert(`Failed to create channel: ${memberError.message}`)
        return
      }

      if (newChannelData.selectedUsers.length > 0) {
        const memberInserts = newChannelData.selectedUsers.map(userId => ({
          user_id: userId,
          channel_id: channel.id,
          role: 'member'
        }))

        const { error: membersError } = await supabase
          .from('chat_channel_members')
          .insert(memberInserts)

        if (membersError) {
          console.error('Error adding members:', membersError)
        }
      }

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
                      onClick={() => setSelectedChannel(channel)}
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
                      {messages.map((message) => (
                        <div key={message.id} id={`message-${message.id}`} className="flex space-x-3">
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
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleReply(message)}
                                className="h-6 w-6 p-0"
                              >
                                <Reply className="w-3 h-3" />
                              </Button>
                              {message.sender_id === user.id && (
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
                                className="bg-gray-50 border-l-2 border-blue-500 pl-3 py-1 mb-2 rounded cursor-pointer"
                                onClick={() => {
                                  const repliedMessageEl = document.getElementById(`message-${message.reply_to_id}`);
                                  if (repliedMessageEl) {
                                    repliedMessageEl.scrollIntoView({ behavior: 'smooth', block: 'center' });
                                    repliedMessageEl.classList.add('bg-blue-100', 'transition-colors', 'duration-1000');
                                    setTimeout(() => {
                                      repliedMessageEl.classList.remove('bg-blue-100');
                                    }, 1000);
                                  }
                                }}
                              >
                                <div className="text-xs text-gray-600">
                                  Replying to {message.reply_to.sender?.full_name || 'Unknown'}
                                </div>
                                <div className="text-sm text-gray-700 truncate">
                                  {message.reply_to.content}
                                </div>
                              </div>
                            )}
                            
                            {/* Message content */}
                            <div className="mt-1">
                              {message.message_type === 'image' && message.image_url ? (
                                <div className="space-y-2">
                                  <img 
                                    src={message.image_url} 
                                    alt={message.image_caption || 'Image'} 
                                    className="max-w-xs rounded-lg cursor-pointer hover:opacity-80"
                                    onClick={() => window.open(message.image_url, '_blank')}
                                  />
                                  {message.content && message.content !== '📷 Image' && (
                                    <p className="text-sm text-gray-700">{message.content}</p>
                                  )}
                                </div>
                              ) : message.message_type === 'file' && message.file_url ? (
                                <div className="flex items-center space-x-2 p-2 bg-gray-50 rounded-lg">
                                  <FileText className="w-5 h-5 text-blue-500" />
                                  <div className="flex-1">
                                    <div className="text-sm font-medium text-gray-900">
                                      {message.file_name}
                                    </div>
                                    <div className="text-xs text-gray-500">
                                      {formatFileSize(message.file_size || 0)}
                                    </div>
                                  </div>
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => window.open(message.file_url, '_blank')}
                                  >
                                    <Download className="w-4 h-4" />
                                  </Button>
                                </div>
                              ) : (
                                <p className="text-sm text-gray-700">{message.content}</p>
                              )}
                            </div>
                          </div>
                        </div>
                      ))}
                      <div ref={messagesEndRef} />
                    </div>

                    {/* Message Input */}
                    <div className="border-t border-gray-200 pt-4">
                      {canSendMessage(selectedChannel) ? (
                        <div className="space-y-2">
                          {replyingTo && (
                            <div className="bg-gray-100 border-l-4 border-blue-500 p-2 rounded-r-lg flex justify-between items-center mb-2">
                              <div>
                                <p className="font-semibold text-blue-600 text-sm">Replying to {replyingTo.sender_name}</p>
                                <p className="text-sm text-gray-600 truncate max-w-xs">{replyingTo.content}</p>
                              </div>
                              <Button variant="ghost" size="icon" onClick={cancelReply} className="h-8 w-8">
                                <X className="w-4 h-4" />
                              </Button>
                            </div>
                          )}
                          <div className="flex space-x-2">
                            <Input
                              type="text"
                              value={newMessage}
                              onChange={(e) => setNewMessage(e.target.value)}
                              onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                              placeholder={replyingTo ? `Reply to ${replyingTo.sender_name}...` : "Type your message..."}
                              className="flex-1"
                            />
                            <Button
                              onClick={handleSendMessage}
                              disabled={!newMessage.trim() && !uploadingFile && !uploadingImage}
                            >
                              <Send className="w-4 h-4 mr-2" />
                              Send
                            </Button>
                          </div>
                          
                          <div className="flex space-x-2">
                            <input
                              type="file"
                              ref={fileInputRef}
                              onChange={(e) => {
                                const file = e.target.files?.[0]
                                if (file) handleFileUpload(file)
                              }}
                              className="hidden"
                              accept="*/*"
                            />
                            <input
                              type="file"
                              ref={imageInputRef}
                              onChange={(e) => {
                                const file = e.target.files?.[0]
                                if (file) handleImageUpload(file)
                              }}
                              className="hidden"
                              accept="image/*"
                            />
                            
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => fileInputRef.current?.click()}
                              disabled={uploadingFile}
                            >
                              <Paperclip className="w-4 h-4 mr-2" />
                              {uploadingFile ? 'Uploading...' : 'File'}
                            </Button>
                            
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => imageInputRef.current?.click()}
                              disabled={uploadingImage}
                            >
                              <ImageIcon className="w-4 h-4 mr-2" />
                              {uploadingImage ? 'Uploading...' : 'Image'}
                            </Button>
                          </div>
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
