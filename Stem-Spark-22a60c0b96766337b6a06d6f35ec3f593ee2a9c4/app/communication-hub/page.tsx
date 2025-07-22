'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@supabase/supabase-js'
import Link from 'next/link'
import Image from 'next/image'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
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
  CheckCircle
} from 'lucide-react'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

export default function CommunicationHub() {
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [channels, setChannels] = useState<any[]>([])
  const [messages, setMessages] = useState<any[]>([])
  const [selectedChannel, setSelectedChannel] = useState<any>(null)
  const [newMessage, setNewMessage] = useState('')
  const [users, setUsers] = useState<any[]>([])
  const [unreadCounts, setUnreadCounts] = useState<{[key: string]: number}>({})
  const [showCreateDialog, setShowCreateDialog] = useState(false)
  const [newChannelName, setNewChannelName] = useState('')
  const [newChannelDescription, setNewChannelDescription] = useState('')
  const [newChannelType, setNewChannelType] = useState('public')
  const [selectedUsers, setSelectedUsers] = useState<string[]>([])

  useEffect(() => {
    checkAuth()
  }, [])

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
    } catch (error) {
      console.error('Error in loadUserProfile:', error)
    }
  }

  const loadCommunicationData = async (userId: string) => {
    try {
      // Load chat channels
      const { data: channelData, error: channelError } = await supabase
        .from('chat_channels')
        .select('*')
        .order('created_at', { ascending: false })

      if (!channelError && channelData) {
        setChannels(channelData)
        if (channelData.length > 0) {
          setSelectedChannel(channelData[0])
          await loadMessages(channelData[0].id)
        }
      }

      // Load users
      const { data: userData, error: userError } = await supabase
        .from('profiles')
        .select('*')
        .order('full_name', { ascending: true })

      if (!userError && userData) {
        setUsers(userData)
      }

      // Load unread message counts for each channel
      await loadUnreadCounts(userId)

      setLoading(false)
    } catch (error) {
      console.error('Error in loadCommunicationData:', error)
      setLoading(false)
    }
  }

  const loadUnreadCounts = async (userId: string) => {
    try {
      const counts: {[key: string]: number} = {}
      
      for (const channel of channels) {
        // Get total messages in channel
        const { data: totalMessages, error: totalError } = await supabase
          .from('chat_messages')
          .select('id')
          .eq('channel_id', channel.id)
          .neq('sender_id', userId)

        if (!totalError && totalMessages) {
          // Get read messages by user
          const { data: readMessages, error: readError } = await supabase
            .from('message_reads')
            .select('message_id')
            .eq('user_id', userId)
            .in('message_id', totalMessages.map(m => m.id))

          if (!readError) {
            const readMessageIds = readMessages?.map(m => m.message_id) || []
            const unreadCount = totalMessages.length - readMessageIds.length
            counts[channel.id] = Math.max(0, unreadCount)
          }
        }
      }
      
      setUnreadCounts(counts)
    } catch (error) {
      console.error('Error loading unread counts:', error)
    }
  }

  const loadMessages = async (channelId: string) => {
    try {
      const { data: messageData, error: messageError } = await supabase
        .from('chat_messages')
        .select(`
          *,
          sender:profiles!chat_messages_sender_id_fkey(full_name)
        `)
        .eq('channel_id', channelId)
        .order('created_at', { ascending: true })

      if (!messageError && messageData) {
        setMessages(messageData)
        
        // Mark messages as read
        if (user) {
          await markMessagesAsRead(messageData.map(m => m.id))
        }
      }
    } catch (error) {
      console.error('Error in loadMessages:', error)
    }
  }

  const markMessagesAsRead = async (messageIds: string[]) => {
    if (!user || messageIds.length === 0) return

    try {
      // Insert read records for messages not sent by current user
      const messagesToMark = messageIds.filter(id => {
        const message = messages.find(m => m.id === id)
        return message && message.sender_id !== user.id
      })

      if (messagesToMark.length > 0) {
        const readRecords = messagesToMark.map(messageId => ({
          user_id: user.id,
          message_id: messageId
        }))

        const { error } = await supabase
          .from('message_reads')
          .upsert(readRecords, { onConflict: 'user_id,message_id' })

        if (!error) {
          // Update unread count for current channel
          setUnreadCounts(prev => ({
            ...prev,
            [selectedChannel.id]: 0
          }))
        }
      }
    } catch (error) {
      console.error('Error marking messages as read:', error)
    }
  }

  const handleSendMessage = async () => {
    if (!newMessage.trim() || !selectedChannel || !user) return

    try {
      const { data, error } = await supabase
        .from('chat_messages')
        .insert({
          channel_id: selectedChannel.id,
          sender_id: user.id,
          content: newMessage.trim(),
          message_type: 'text'
        })

      if (error) {
        console.error('Error sending message:', error)
        return
      }

      setNewMessage('')
      await loadMessages(selectedChannel.id)
    } catch (error) {
      console.error('Error in handleSendMessage:', error)
    }
  }

  const handleChannelSelect = async (channel: any) => {
    setSelectedChannel(channel)
    await loadMessages(channel.id)
  }

  const handleCreateChannel = async () => {
    if (!newChannelName.trim() || !user) return

    try {
      // Create the channel
      const { data: channelData, error: channelError } = await supabase
        .from('chat_channels')
        .insert({
          name: newChannelName.trim(),
          description: newChannelDescription.trim(),
          channel_type: newChannelType,
          created_by: user.id
        })
        .select()
        .single()

      if (channelError) {
        console.error('Error creating channel:', channelError)
        alert('Failed to create channel')
        return
      }

      // Add current user as member
      await supabase
        .from('chat_channel_members')
        .insert({
          user_id: user.id,
          channel_id: channelData.id,
          role: 'admin'
        })

      // Add selected users as members
      if (selectedUsers.length > 0) {
        const memberRecords = selectedUsers.map(userId => ({
          user_id: userId,
          channel_id: channelData.id,
          role: 'member'
        }))

        await supabase
          .from('chat_channel_members')
          .insert(memberRecords)
      }

      // Reset form and reload data
      setNewChannelName('')
      setNewChannelDescription('')
      setNewChannelType('public')
      setSelectedUsers([])
      setShowCreateDialog(false)
      
      await loadCommunicationData(user.id)
      setSelectedChannel(channelData)
      await loadMessages(channelData.id)
      
      alert('Channel created successfully!')
    } catch (error) {
      console.error('Error in handleCreateChannel:', error)
      alert('Failed to create channel')
    }
  }

  const toggleUserSelection = (userId: string) => {
    setSelectedUsers(prev => 
      prev.includes(userId) 
        ? prev.filter(id => id !== userId)
        : [...prev, userId]
    )
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <div className="text-xl text-gray-600">Loading communication hub...</div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <Image
                  src="/images/novakinetix-logo.png"
                  alt="NovaKinetix Academy"
                  width={40}
                  height={40}
                  className="h-10 w-auto"
                />
                <h1 className="text-2xl font-bold text-gray-900">Communication Hub</h1>
              </div>
            </div>
            <Button variant="outline" asChild>
              <Link href="/student-dashboard">
                <ArrowRight className="h-4 w-4 mr-2" />
                Back to Dashboard
              </Link>
            </Button>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 h-[600px]">
          {/* Channels Sidebar */}
          <Card className="lg:col-span-1">
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span className="flex items-center">
                  <Hash className="h-4 w-4 mr-2" />
                  Channels
                </span>
                <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
                  <DialogTrigger asChild>
                    <Button size="sm" variant="outline">
                      <Plus className="h-4 w-4" />
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="sm:max-w-[425px]">
                    <DialogHeader>
                      <DialogTitle>Create New Channel</DialogTitle>
                      <DialogDescription>
                        Create a new channel for group discussions
                      </DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                      <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="name" className="text-right">
                          Name
                        </Label>
                        <Input
                          id="name"
                          value={newChannelName}
                          onChange={(e) => setNewChannelName(e.target.value)}
                          className="col-span-3"
                          placeholder="Channel name"
                        />
                      </div>
                      <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="description" className="text-right">
                          Description
                        </Label>
                        <Input
                          id="description"
                          value={newChannelDescription}
                          onChange={(e) => setNewChannelDescription(e.target.value)}
                          className="col-span-3"
                          placeholder="Channel description"
                        />
                      </div>
                      <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="type" className="text-right">
                          Type
                        </Label>
                        <select
                          id="type"
                          value={newChannelType}
                          onChange={(e) => setNewChannelType(e.target.value)}
                          className="col-span-3 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                          <option value="public">Public</option>
                          <option value="private">Private</option>
                          <option value="group">Group</option>
                        </select>
                      </div>
                      <div className="grid grid-cols-4 items-start gap-4">
                        <Label className="text-right pt-2">
                          Add Members
                        </Label>
                        <div className="col-span-3 max-h-32 overflow-y-auto space-y-2">
                          {users.filter(u => u.id !== user?.id).map((userItem) => (
                            <div key={userItem.id} className="flex items-center space-x-2">
                              <input
                                type="checkbox"
                                id={userItem.id}
                                checked={selectedUsers.includes(userItem.id)}
                                onChange={() => toggleUserSelection(userItem.id)}
                                className="rounded"
                              />
                              <Label htmlFor={userItem.id} className="text-sm">
                                {userItem.full_name} ({userItem.role})
                              </Label>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                    <div className="flex justify-end space-x-2">
                      <Button variant="outline" onClick={() => setShowCreateDialog(false)}>
                        Cancel
                      </Button>
                      <Button onClick={handleCreateChannel}>
                        Create Channel
                      </Button>
                    </div>
                  </DialogContent>
                </Dialog>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {channels.map((channel) => (
                  <button
                    key={channel.id}
                    onClick={() => handleChannelSelect(channel)}
                    className={`w-full text-left p-2 rounded-lg transition-colors ${
                      selectedChannel?.id === channel.id
                        ? 'bg-blue-100 text-blue-700'
                        : 'hover:bg-gray-100'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <Hash className="h-4 w-4 mr-2" />
                        <span className="font-medium">{channel.name}</span>
                      </div>
                      {unreadCounts[channel.id] > 0 && (
                        <Badge variant="destructive" className="text-xs">
                          {unreadCounts[channel.id]}
                        </Badge>
                      )}
                    </div>
                    <p className="text-xs text-gray-500 truncate">{channel.description}</p>
                  </button>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Chat Area */}
          <Card className="lg:col-span-3 flex flex-col">
            {selectedChannel ? (
              <>
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <span className="flex items-center">
                      <Hash className="h-4 w-4 mr-2" />
                      {selectedChannel.name}
                    </span>
                    <Badge variant="outline">{selectedChannel.channel_type}</Badge>
                  </CardTitle>
                  <CardDescription>{selectedChannel.description}</CardDescription>
                </CardHeader>
                <CardContent className="flex-1 flex flex-col">
                  {/* Messages */}
                  <div className="flex-1 overflow-y-auto space-y-4 mb-4">
                    {messages.map((message) => (
                      <div key={message.id} className="flex items-start space-x-3">
                        <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                          <span className="text-xs font-medium text-blue-600">
                            {message.sender?.full_name?.charAt(0) || 'U'}
                          </span>
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center space-x-2">
                            <span className="font-medium text-sm">
                              {message.sender?.full_name || 'Unknown User'}
                            </span>
                            <span className="text-xs text-gray-500">
                              {new Date(message.created_at).toLocaleTimeString()}
                            </span>
                            {message.sender_id === user?.id && (
                              <CheckCircle className="h-3 w-3 text-green-500" />
                            )}
                          </div>
                          <p className="text-sm text-gray-700 mt-1">{message.content}</p>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Message Input */}
                  <div className="flex space-x-2">
                    <Input
                      value={newMessage}
                      onChange={(e) => setNewMessage(e.target.value)}
                      placeholder="Type your message..."
                      onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                    />
                    <Button onClick={handleSendMessage}>
                      <Send className="h-4 w-4" />
                    </Button>
                  </div>
                </CardContent>
              </>
            ) : (
              <CardContent className="flex-1 flex items-center justify-center">
                <div className="text-center">
                  <MessageSquare className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600">Select a channel to start chatting</p>
                </div>
              </CardContent>
            )}
          </Card>
        </div>

        {/* Online Users */}
        <Card className="mt-6">
          <CardHeader>
            <CardTitle className="flex items-center">
              <Users className="h-5 w-5 mr-2" />
              Online Users
            </CardTitle>
            <CardDescription>
              Students and tutors currently online
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {users.slice(0, 8).map((userItem) => (
                <div key={userItem.id} className="flex items-center space-x-3 p-3 border rounded-lg">
                  <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                    <span className="text-xs font-medium text-green-600">
                      {userItem.full_name?.charAt(0) || 'U'}
                    </span>
                  </div>
                  <div>
                    <p className="text-sm font-medium">{userItem.full_name}</p>
                    <p className="text-xs text-gray-500">{userItem.role}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
