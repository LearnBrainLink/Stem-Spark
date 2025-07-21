'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'

interface Message {
  id: string
  content: string
  sender_id: string
  sender_name: string
  channel_id: string
  created_at: string
}

interface Channel {
  id: string
  name: string
  type: 'general' | 'announcements' | 'parent_teacher' | 'admin_only'
  description: string
}

export default function CommunicationHub() {
  const [channels, setChannels] = useState<Channel[]>([])
  const [messages, setMessages] = useState<Message[]>([])
  const [selectedChannel, setSelectedChannel] = useState<string>('')
  const [newMessage, setNewMessage] = useState('')
  const [user, setUser] = useState<any>(null)
  const [userRole, setUserRole] = useState<string>('')
  const supabase = createClient()

  useEffect(() => {
    checkUser()
    fetchChannels()
  }, [])

  useEffect(() => {
    if (selectedChannel) {
      fetchMessages(selectedChannel)
      subscribeToMessages(selectedChannel)
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

  const fetchChannels = async () => {
    const { data, error } = await supabase
      .from('channels')
      .select('*')
      .order('name')
    
    if (!error && data) {
      setChannels(data)
      if (data.length > 0) {
        setSelectedChannel(data[0].id)
      }
    }
  }

  const fetchMessages = async (channelId: string) => {
    const { data, error } = await supabase
      .from('messages')
      .select(`
        *,
        profiles:profiles(full_name)
      `)
      .eq('channel_id', channelId)
      .order('created_at', { ascending: true })
    
    if (!error && data) {
      setMessages(data.map(msg => ({
        ...msg,
        sender_name: msg.profiles?.full_name || 'Unknown'
      })))
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
        const newMessage = payload.new as Message
        setMessages(prev => [...prev, newMessage])
      })
      .subscribe()

    return () => subscription.unsubscribe()
  }

  const sendMessage = async () => {
    if (!newMessage.trim() || !user || !selectedChannel) return

    const { error } = await supabase
      .from('messages')
      .insert([
        {
          content: newMessage,
          sender_id: user.id,
          channel_id: selectedChannel
        }
      ])

    if (!error) {
      setNewMessage('')
    }
  }

  const canSendMessage = (channel: Channel) => {
    if (channel.type === 'admin_only') {
      return userRole === 'admin'
    }
    if (channel.type === 'announcements') {
      return userRole === 'admin'
    }
    return true
  }

  const canViewChannel = (channel: Channel) => {
    if (channel.type === 'admin_only') {
      return userRole === 'admin'
    }
    return true
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-lg shadow-md">
          <div className="px-6 py-4 border-b border-gray-200">
            <h1 className="text-2xl font-bold text-gray-900">Communication Hub</h1>
            <p className="text-gray-600">Connect with teachers, parents, and administrators</p>
          </div>

          <div className="flex h-96">
            {/* Channels Sidebar */}
            <div className="w-64 border-r border-gray-200 bg-gray-50">
              <div className="p-4">
                <h3 className="text-sm font-medium text-gray-900 mb-4">Channels</h3>
                <div className="space-y-2">
                  {channels.filter(canViewChannel).map((channel) => (
                    <button
                      key={channel.id}
                      onClick={() => setSelectedChannel(channel.id)}
                      className={`w-full text-left px-3 py-2 rounded-md text-sm ${
                        selectedChannel === channel.id
                          ? 'bg-blue-100 text-blue-700'
                          : 'text-gray-700 hover:bg-gray-100'
                      }`}
                    >
                      <div className="font-medium">#{channel.name}</div>
                      <div className="text-xs text-gray-500">{channel.description}</div>
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Messages Area */}
            <div className="flex-1 flex flex-col">
              {selectedChannel && (
                <>
                  {/* Messages */}
                  <div className="flex-1 overflow-y-auto p-4 space-y-4">
                    {messages.map((message) => (
                      <div key={message.id} className="flex space-x-3">
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
                          </div>
                          <p className="text-sm text-gray-700 mt-1">{message.content}</p>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Message Input */}
                  <div className="border-t border-gray-200 p-4">
                    {canSendMessage(channels.find(c => c.id === selectedChannel)!) ? (
                      <div className="flex space-x-2">
                        <input
                          type="text"
                          value={newMessage}
                          onChange={(e) => setNewMessage(e.target.value)}
                          onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
                          placeholder="Type your message..."
                          className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                        <button
                          onClick={sendMessage}
                          disabled={!newMessage.trim()}
                          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
                        >
                          Send
                        </button>
                      </div>
                    ) : (
                      <div className="text-sm text-gray-500 text-center py-2">
                        You don't have permission to send messages in this channel
                      </div>
                    )}
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
} 