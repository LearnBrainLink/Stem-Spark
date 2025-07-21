'use client'

import { useState, useEffect, useRef } from 'react'
import { createClient } from '@supabase/supabase-js'
import { messagingService, ExtendedMessage, ExtendedChannel } from '@/lib/real-time-messaging'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Separator } from '@/components/ui/separator'
import { Send, Plus, Users, Settings, MessageCircle, Hash, Volume2, Lock } from 'lucide-react'


export default function CommunicationHub() {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )
  const [user, setUser] = useState<any>(null)
  const [channels, setChannels] = useState<ExtendedChannel[]>([])
  const [currentChannel, setCurrentChannel] = useState<ExtendedChannel | null>(null)
  const [messages, setMessages] = useState<ExtendedMessage[]>([])
  const [newMessage, setNewMessage] = useState('')
  const [isLoading, setIsLoading] = useState(true)
  const [showCreateChannel, setShowCreateChannel] = useState(false)
  const [newChannelData, setNewChannelData] = useState({
    name: '',
    description: '',
    channelType: 'public',
    restrictions: {
      can_send_messages: 'everyone',
      can_join: 'everyone',
      is_announcement_channel: false,
      moderation_enabled: false
    }
  })
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const [userPermissions, setUserPermissions] = useState<any>(null)

  useEffect(() => {
    getUser()
  }, [])

  useEffect(() => {
    if (user) {
      loadChannels()
      getUserPermissions()
    }
  }, [user])

  useEffect(() => {
    if (currentChannel) {
      loadMessages()
      subscribeToChannel()
    }
  }, [currentChannel])

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const getUser = async () => {
    const { data: { user } } = await supabase.auth.getUser()
    setUser(user)
  }

  const getUserPermissions = async () => {
    if (!user) return
    
    const { data: profile } = await supabase
      .from('profiles')
      .select('role, is_super_admin')
      .eq('id', user.id)
      .single()

    setUserPermissions(profile)
  }

  const loadChannels = async () => {
    if (!user) return

    setIsLoading(true)
    const result = await messagingService.getChannels(user.id)
    
    if (result.success && result.channels) {
      setChannels(result.channels)
      if (result.channels.length > 0 && !currentChannel) {
        setCurrentChannel(result.channels[0])
      }
    }
    setIsLoading(false)
  }

  const loadMessages = async () => {
    if (!currentChannel) return

    const result = await messagingService.getMessages(currentChannel.id)
    if (result.success && result.messages) {
      setMessages(result.messages)
    }
  }

  const subscribeToChannel = () => {
    if (!currentChannel) return

    messagingService.subscribeToChannel(
      currentChannel.id,
      (message: ExtendedMessage) => {
        setMessages(prev => [...prev, message])
      },
      (messageId: string) => {
        setMessages(prev => prev.filter(msg => msg.id !== messageId))
      }
    )
  }

  const sendMessage = async () => {
    if (!currentChannel || !newMessage.trim() || !user) return

    const result = await messagingService.sendMessage(
      currentChannel.id,
      user.id,
      newMessage.trim()
    )

    if (result.success) {
      setNewMessage('')
    } else {
      alert(result.error || 'Failed to send message')
    }
  }

  const createChannel = async () => {
    if (!user || !newChannelData.name.trim()) return

    const result = await messagingService.createChannel(
      newChannelData.name.trim(),
      newChannelData.description.trim(),
      newChannelData.channelType as any,
      user.id,
      newChannelData.restrictions
    )

    if (result.success && result.channel) {
      setChannels(prev => [...prev, result.channel!])
      setCurrentChannel(result.channel)
      setShowCreateChannel(false)
      setNewChannelData({
        name: '',
        description: '',
        channelType: 'public',
        restrictions: {
          can_send_messages: 'everyone',
          can_join: 'everyone',
          is_announcement_channel: false,
          moderation_enabled: false
        }
      })
      alert('Channel created successfully')
    } else {
      alert(result.error || 'Failed to create channel')
    }
  }

  const joinChannel = async (channel: ExtendedChannel) => {
    if (!user) return

    const result = await messagingService.addChannelMember(channel.id, user.id)
    if (result.success) {
      setChannels(prev => [...prev, channel])
      alert('Joined channel successfully')
    } else {
      alert(result.error || 'Failed to join channel')
    }
  }

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  const canCreateChannels = userPermissions?.role === 'admin' || userPermissions?.is_super_admin

  const getChannelIcon = (channelType: string) => {
    switch (channelType) {
      case 'announcement':
        return <Volume2 className="w-4 h-4" />
      case 'private':
        return <Lock className="w-4 h-4" />
      default:
        return <Hash className="w-4 h-4" />
    }
  }

  const formatTime = (timestamp: string) => {
    return new Date(timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
          <p className="mt-2 text-muted-foreground">Loading communication hub...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto p-4 max-w-7xl">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-center mb-2">Novakinetix Academy Communication Hub</h1>
        <p className="text-center text-muted-foreground">
          Connect, collaborate, and stay updated with the Novakinetix Academy community
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 h-[calc(100vh-200px)]">
        {/* Channels Sidebar */}
        <Card className="lg:col-span-1">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg">Channels</CardTitle>
              {canCreateChannels && (
                <Dialog open={showCreateChannel} onOpenChange={setShowCreateChannel}>
                  <DialogTrigger asChild>
                    <Button size="sm" variant="outline">
                      <Plus className="w-4 h-4" />
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
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
                          value={newChannelData.channelType}
                          onValueChange={(value) => setNewChannelData(prev => ({ 
                            ...prev, 
                            channelType: value,
                            restrictions: {
                              ...prev.restrictions,
                              is_announcement_channel: value === 'announcement'
                            }
                          }))}
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="public">Public</SelectItem>
                            <SelectItem value="private">Private</SelectItem>
                            <SelectItem value="group">Group</SelectItem>
                            <SelectItem value="announcement">Announcement</SelectItem>
                            <SelectItem value="role_restricted">Role Restricted</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="flex gap-2">
                        <Button onClick={createChannel} className="flex-1">Create Channel</Button>
                        <Button variant="outline" onClick={() => setShowCreateChannel(false)}>Cancel</Button>
                      </div>
                    </div>
                  </DialogContent>
                </Dialog>
              )}
            </div>
          </CardHeader>
          <CardContent className="p-0">
            <ScrollArea className="h-[calc(100vh-300px)]">
              <div className="space-y-1 p-2">
                {channels.map((channel) => (
                  <div
                    key={channel.id}
                    className={`flex items-center gap-2 p-2 rounded-lg cursor-pointer transition-colors ${
                      currentChannel?.id === channel.id
                        ? 'bg-primary text-primary-foreground'
                        : 'hover:bg-muted'
                    }`}
                    onClick={() => setCurrentChannel(channel)}
                  >
                    {getChannelIcon(channel.channel_type)}
                    <span className="flex-1 truncate">{channel.name}</span>
                    {channel.channel_type === 'announcement' && (
                      <Badge variant="secondary" className="text-xs">Announcement</Badge>
                    )}
                  </div>
                ))}
                {channels.length === 0 && (
                  <p className="text-center text-muted-foreground text-sm p-4">
                    No channels available
                  </p>
                )}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>

        {/* Messages Area */}
        <Card className="lg:col-span-3 flex flex-col">
          {currentChannel ? (
            <>
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    {getChannelIcon(currentChannel.channel_type)}
                    <CardTitle className="text-lg">{currentChannel.name}</CardTitle>
                    {currentChannel.description && (
                      <span className="text-sm text-muted-foreground">
                        {currentChannel.description}
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant="outline">
                      <Users className="w-3 h-3 mr-1" />
                      {currentChannel.members.length}
                    </Badge>
                    {currentChannel.restrictions.is_announcement_channel && (
                      <Badge variant="secondary">Announcement Only</Badge>
                    )}
                  </div>
                </div>
              </CardHeader>
              <CardContent className="flex-1 flex flex-col p-0">
                <ScrollArea className="flex-1 p-4">
                  <div className="space-y-4">
                    {messages.map((message) => (
                      <div key={message.id} className="flex gap-3">
                        <Avatar className="w-8 h-8">
                          <AvatarImage src={message.sender.avatar_url} />
                          <AvatarFallback>
                            {message.sender.full_name.charAt(0).toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="font-medium text-sm">{message.sender.full_name}</span>
                            <Badge variant="outline" className="text-xs">{message.sender.role}</Badge>
                            <span className="text-xs text-muted-foreground">
                              {formatTime(message.created_at)}
                            </span>
                          </div>
                          <div className="text-sm">
                            {message.content}
                          </div>
                        </div>
                      </div>
                    ))}
                    <div ref={messagesEndRef} />
                  </div>
                </ScrollArea>
                <Separator />
                <div className="p-4">
                  <div className="flex gap-2">
                    <Input
                      value={newMessage}
                      onChange={(e) => setNewMessage(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
                      placeholder={
                        currentChannel.restrictions.is_announcement_channel
                          ? "Only admins can send messages in announcement channels"
                          : "Type your message..."
                      }
                      disabled={currentChannel.restrictions.is_announcement_channel && 
                        userPermissions?.role !== 'admin' && !userPermissions?.is_super_admin}
                    />
                    <Button onClick={sendMessage} disabled={!newMessage.trim()}>
                      <Send className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </>
          ) : (
            <CardContent className="flex-1 flex items-center justify-center">
              <div className="text-center">
                <MessageCircle className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-medium mb-2">Select a Channel</h3>
                <p className="text-muted-foreground">
                  Choose a channel from the sidebar to start messaging
                </p>
              </div>
            </CardContent>
          )}
        </Card>
      </div>
    </div>
  )
}
