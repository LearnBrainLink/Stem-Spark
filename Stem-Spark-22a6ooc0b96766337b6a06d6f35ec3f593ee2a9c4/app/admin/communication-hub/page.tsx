'use client'

import { useState, useEffect, useRef, useCallback, useMemo } from 'react'
import { createClient } from '@supabase/supabase-js'
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

// Supabase Client Setup
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
const supabase = createClient(supabaseUrl, supabaseAnonKey)

interface Message {
  id: string
  content: string
  sender_id: string
  channel_id: string
  created_at: string
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
}

interface User {
  id: string
  full_name: string
  email: string
  role: string
  avatar_url?: string
}

export default function AdminCommunicationHub() {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const [channels, setChannels] = useState<Channel[]>([])
  const [messages, setMessages] = useState<Message[]>([])
  const [selectedChannel, setSelectedChannel] = useState<Channel | null>(null)
  const [newMessage, setNewMessage] = useState('')
  const messagesEndRef = useRef<HTMLDivElement>(null)

  // Fetch initial data
  useEffect(() => {
    const checkUserAndLoadData = async () => {
      const { data: { user: authUser } } = await supabase.auth.getUser()
      if (authUser) {
        const { data: profile } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', authUser.id)
          .single()
        setUser(profile)
        
        const { data: channelData } = await supabase
          .from('channels')
          .select('*')
          .order('created_at', { ascending: false })
        
        if (channelData) setChannels(channelData)
        
        if (channelData && channelData.length > 0) {
          setSelectedChannel(channelData[0])
        }
      }
      setLoading(false)
    }
    checkUserAndLoadData()
  }, [])

  // 1. Fetch existing messages
  useEffect(() => {
    if (!selectedChannel) return

    const fetchMessages = async () => {
      const { data, error } = await supabase
        .from('messages')
        .select(`
          *,
          sender:profiles (
            full_name,
            avatar_url,
            role
          )
        `)
        .eq('channel_id', selectedChannel.id)
        .order('created_at', { ascending: true })

      if (!error) setMessages(data || [])
    }

    fetchMessages()
  }, [selectedChannel])

  // 2. Set up real-time subscription
  useEffect(() => {
    if (!selectedChannel) return

    const channel = supabase
      .channel(`chat-channel-${selectedChannel.id}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'messages',
          filter: `channel_id=eq.${selectedChannel.id}`
        },
        async (payload) => {
          const newMessage = payload.new as Message
          // Fetch sender info for the new message
          const { data: sender } = await supabase
            .from('profiles')
            .select('full_name, avatar_url, role')
            .eq('id', newMessage.sender_id)
            .single()
          
          newMessage.sender = sender || undefined
          setMessages((prev) => [...prev, newMessage])
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [selectedChannel])

  // 3. Send new message
  const sendMessage = async () => {
    if (!newMessage.trim() || !user || !selectedChannel) return
    const { error } = await supabase.from('messages').insert([
      {
        channel_id: selectedChannel.id,
        sender_id: user.id,
        content: newMessage,
      }
    ])
    if (!error) setNewMessage('')
  }

  // Scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-xl">Loading communication hub...</div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Admin Communication Hub</h1>
        </div>
        <Button 
          variant="outline" 
          onClick={() => window.location.href = '/admin'}
          className="flex items-center gap-2"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Dashboard
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        <div className="lg:col-span-1">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span className="flex items-center">
                  <Hash className="w-5 h-5 mr-2" />
                  Channels ({channels.length})
                </span>
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
                <div className="flex flex-col h-[calc(100vh-20rem)]">
                  <div className="flex-1 overflow-y-auto p-4 space-y-4">
                    {messages.map((message) => {
                      const isOwn = message.sender_id === user?.id
                      const isAdmin = message.sender?.role === 'admin'
                      return (
                        <div key={message.id} className={`flex space-x-3 ${isOwn ? 'flex-row-reverse space-x-reverse' : ''}`}>
                          <div className="flex-shrink-0">
                            <div className={`h-8 w-8 rounded-full flex items-center justify-center text-white text-sm font-medium ${
                              isOwn ? 'bg-green-500' : isAdmin ? 'bg-purple-500' : 'bg-blue-500'
                            }`}>
                              {isAdmin ? <Crown className="w-4 h-4" /> : message.sender?.full_name?.charAt(0).toUpperCase()}
                            </div>
                          </div>
                          <div className={`flex-1 ${isOwn ? 'text-right' : ''}`}>
                            <div className={`flex items-center space-x-2 ${isOwn ? 'justify-end' : ''}`}>
                              <span className="text-sm font-medium text-gray-900">
                                {message.sender?.full_name}
                                {isAdmin && <Crown className="w-3 h-3 ml-1 text-purple-500" />}
                              </span>
                              <span className="text-xs text-gray-500">
                                {new Date(message.created_at).toLocaleString()}
                              </span>
                            </div>
                            <div className={`inline-block p-3 rounded-lg ${
                              isOwn ? 'bg-green-500 text-white' : 'bg-gray-100 text-gray-900'
                            }`}>
                              <p className="text-sm">{message.content}</p>
                            </div>
                          </div>
                        </div>
                      )
                    })}
                    <div ref={messagesEndRef} />
                  </div>
                  <div className="border-t p-4">
                    <div className="flex items-center space-x-2">
                      <Input
                        value={newMessage}
                        onChange={(e) => setNewMessage(e.target.value)}
                        placeholder="Type a message..."
                        onKeyPress={(e) => {
                          if (e.key === 'Enter' && !e.shiftKey) {
                            e.preventDefault()
                            sendMessage()
                          }
                        }}
                      />
                      <Button
                        onClick={sendMessage}
                        disabled={!newMessage.trim()}
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
    </div>
  )
} 