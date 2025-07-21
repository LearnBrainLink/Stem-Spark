'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@supabase/supabase-js'
import Link from 'next/link'
import Image from 'next/image'

interface Message {
  id: string
  content: string
  sender_id: string
  channel_id: string
  created_at: string
  profiles: {
    full_name: string
  }
}

interface Channel {
  id: string
  name: string
  type: string
  description: string
}

interface UserProfile {
  id: string
  full_name: string
  role: string
}

export default function CommunicationHub() {
  const [messages, setMessages] = useState<Message[]>([])
  const [channels, setChannels] = useState<Channel[]>([])
  const [currentChannel, setCurrentChannel] = useState<Channel | null>(null)
  const [newMessage, setNewMessage] = useState('')
  const [user, setUser] = useState<UserProfile | null>(null)
  const [loading, setLoading] = useState(true)
  const [message, setMessage] = useState('')

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )

  useEffect(() => {
    checkAuth()
    fetchChannels()
  }, [])

  useEffect(() => {
    if (currentChannel) {
      fetchMessages(currentChannel.id)
      subscribeToMessages(currentChannel.id)
    }
  }, [currentChannel])

  const checkAuth = async () => {
    const { data: { user: authUser } } = await supabase.auth.getUser()
    if (authUser) {
      const { data: profile } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', authUser.id)
        .single()
      setUser(profile)
    }
    setLoading(false)
  }

  const fetchChannels = async () => {
    try {
      const { data, error } = await supabase
        .from('channels')
        .select('*')
        .order('name')

      if (error) throw error
      setChannels(data || [])
      
      // Set first channel as default
      if (data && data.length > 0) {
        setCurrentChannel(data[0])
      }
    } catch (error) {
      console.error('Error fetching channels:', error)
    }
  }

  const fetchMessages = async (channelId: string) => {
    try {
      const { data, error } = await supabase
        .from('messages')
        .select(`
          *,
          profiles:profiles(full_name)
        `)
        .eq('channel_id', channelId)
        .order('created_at', { ascending: true })

      if (error) throw error
      setMessages(data || [])
    } catch (error) {
      console.error('Error fetching messages:', error)
    }
  }

  const subscribeToMessages = (channelId: string) => {
    const subscription = supabase
      .channel(`messages:${channelId}`)
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'messages',
        filter: `channel_id=eq.${channelId}`
      }, (payload) => {
        setMessages(prev => [...prev, payload.new as Message])
      })
      .subscribe()

    return () => {
      subscription.unsubscribe()
    }
  }

  const sendMessage = async () => {
    if (!newMessage.trim() || !currentChannel || !user) return

    try {
      // Check permissions based on channel type and user role
      const isAdmin = user.role === 'admin'
      const canSendMessage = 
        currentChannel.type === 'general' ||
        currentChannel.type === 'parent_teacher' ||
        (currentChannel.type === 'announcements' && isAdmin) ||
        (currentChannel.type === 'admin_only' && isAdmin)

      if (!canSendMessage) {
        setMessage('You do not have permission to send messages in this channel')
        return
      }

      const { error } = await supabase
        .from('messages')
        .insert([{
          content: newMessage,
          sender_id: user.id,
          channel_id: currentChannel.id
        }])

      if (error) throw error

      setNewMessage('')
      setMessage('')
    } catch (error) {
      console.error('Error sending message:', error)
      setMessage('Error sending message')
    }
  }

  const canSendInChannel = (channel: Channel) => {
    if (!user) return false
    const isAdmin = user.role === 'admin'
    return (
      channel.type === 'general' ||
      channel.type === 'parent_teacher' ||
      (channel.type === 'announcements' && isAdmin) ||
      (channel.type === 'admin_only' && isAdmin)
    )
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-xl">Loading...</div>
      </div>
    )
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-4">Please Sign In</h2>
          <p className="text-gray-600 mb-4">You need to be signed in to access the Communication Hub</p>
          <Link href="/login" className="bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700">
            Sign In
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center">
              <Image
                src="/images/novakinetix-logo.png"
                alt="Novakinetix Academy Logo"
                width={40}
                height={40}
                className="mr-3"
              />
              <span className="text-xl font-bold text-gray-900">Communication Hub</span>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-600">Welcome, {user.full_name}</span>
              <Link href="/" className="text-blue-600 hover:text-blue-700 font-medium">
                Back to Home
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <div className="flex h-96">
            {/* Channels Sidebar */}
            <div className="w-64 bg-gray-50 border-r border-gray-200">
              <div className="p-4 border-b border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900">Channels</h3>
              </div>
              <div className="overflow-y-auto h-full">
                {channels.map((channel) => (
                  <button
                    key={channel.id}
                    onClick={() => setCurrentChannel(channel)}
                    className={`w-full text-left p-4 border-b border-gray-200 hover:bg-gray-100 transition-colors ${
                      currentChannel?.id === channel.id ? 'bg-blue-50 border-blue-200' : ''
                    }`}
                  >
                    <div className="font-medium text-gray-900">{channel.name}</div>
                    <div className="text-sm text-gray-600">{channel.description}</div>
                    <div className="text-xs text-gray-500 mt-1">
                      {channel.type === 'announcements' ? 'Admins only' :
                       channel.type === 'admin_only' ? 'Admin only' :
                       channel.type === 'parent_teacher' ? 'Parents & Teachers' :
                       'Everyone'}
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Messages Area */}
            <div className="flex-1 flex flex-col">
              {currentChannel ? (
                <>
                  {/* Channel Header */}
                  <div className="p-4 border-b border-gray-200">
                    <h3 className="text-lg font-semibold text-gray-900">{currentChannel.name}</h3>
                    <p className="text-sm text-gray-600">{currentChannel.description}</p>
                  </div>

                  {/* Messages */}
                  <div className="flex-1 overflow-y-auto p-4 space-y-4">
                    {messages.map((msg) => (
                      <div key={msg.id} className="flex space-x-3">
                        <div className="flex-shrink-0">
                          <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center text-white text-sm font-medium">
                            {msg.profiles?.full_name?.charAt(0) || 'U'}
                          </div>
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center space-x-2">
                            <span className="font-medium text-gray-900">
                              {msg.profiles?.full_name || 'Unknown User'}
                            </span>
                            <span className="text-sm text-gray-500">
                              {new Date(msg.created_at).toLocaleString()}
                            </span>
                          </div>
                          <p className="text-gray-700 mt-1">{msg.content}</p>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Message Input */}
                  <div className="p-4 border-t border-gray-200">
                    {message && (
                      <div className="mb-2 p-2 bg-red-100 text-red-700 rounded text-sm">
                        {message}
                      </div>
                    )}
                    <div className="flex space-x-2">
                      <input
                        type="text"
                        value={newMessage}
                        onChange={(e) => setNewMessage(e.target.value)}
                        onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
                        placeholder={
                          canSendInChannel(currentChannel)
                            ? "Type your message..."
                            : "You don't have permission to send messages in this channel"
                        }
                        disabled={!canSendInChannel(currentChannel)}
                        className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
                      />
                      <button
                        onClick={sendMessage}
                        disabled={!canSendInChannel(currentChannel) || !newMessage.trim()}
                        className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
                      >
                        Send
                      </button>
                    </div>
                  </div>
                </>
              ) : (
                <div className="flex-1 flex items-center justify-center">
                  <p className="text-gray-500">Select a channel to start messaging</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
