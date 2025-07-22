'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@supabase/supabase-js'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { 
  MessageSquare, 
  Send,
  Users,
  Hash,
  Bell,
  Search,
  Plus
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

      setLoading(false)
    } catch (error) {
      console.error('Error in loadCommunicationData:', error)
      setLoading(false)
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
      }
    } catch (error) {
      console.error('Error in loadMessages:', error)
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
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Communication Hub</h1>
          <p className="text-gray-600 mt-2">Connect with students, tutors, and mentors</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 h-[600px]">
          {/* Channels Sidebar */}
          <Card className="lg:col-span-1">
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span className="flex items-center">
                  <Hash className="h-4 w-4 mr-2" />
                  Channels
                </span>
                <Button size="sm" variant="outline">
                  <Plus className="h-4 w-4" />
                </Button>
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
                    <div className="flex items-center">
                      <Hash className="h-4 w-4 mr-2" />
                      <span className="font-medium">{channel.name}</span>
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
              {users.slice(0, 8).map((user) => (
                <div key={user.id} className="flex items-center space-x-3 p-3 border rounded-lg">
                  <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                    <span className="text-xs font-medium text-green-600">
                      {user.full_name?.charAt(0) || 'U'}
                    </span>
                  </div>
                  <div>
                    <p className="text-sm font-medium">{user.full_name}</p>
                    <p className="text-xs text-gray-500">{user.role}</p>
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
