'use client'

import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { supabase } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Label } from '@/components/ui/label'
import { useToast } from '@/hooks/use-toast'
import { 
  MessageSquare, 
  Users, 
  Plus, 
  Send, 
  Search, 
  UserPlus,
  ArrowLeft,
  Crown,
  Wifi,
  WifiOff
} from 'lucide-react'

interface User {
  id: string
  full_name: string
  email: string
  role: string
  avatar_url?: string
}

interface Conversation {
  id: string
  user1_id: string
  user2_id: string
  created_at: string
  other_user: User
  last_message?: {
    content: string
    created_at: string
    sender_name: string
  }
  unread_count: number
}

interface ConversationMessage {
  id: string
  conversation_id: string
  sender_id: string
  content: string
  message_type: string
  created_at: string
  sender_name?: string
  sender?: {
    full_name: string
    avatar_url?: string
    role?: string
  }
}

export default function IndividualConversations() {
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [conversations, setConversations] = useState<Conversation[]>([])
  const [selectedConversation, setSelectedConversation] = useState<Conversation | null>(null)
  const [messages, setMessages] = useState<ConversationMessage[]>([])
  const [newMessage, setNewMessage] = useState('')
  const [availableUsers, setAvailableUsers] = useState<User[]>([])
  const [showNewConversationDialog, setShowNewConversationDialog] = useState(false)
  const [selectedUserToStartConversation, setSelectedUserToStartConversation] = useState<string>('')
  const [searchQuery, setSearchQuery] = useState('')
  const [userRole, setUserRole] = useState<string>('')
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const { toast } = useToast()

  // Initialize component
  useEffect(() => {
    initializeComponent()
  }, [])

  // Scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  // Load messages when conversation changes
  useEffect(() => {
    if (selectedConversation) {
      loadMessages(selectedConversation.id)
    }
  }, [selectedConversation])

  const initializeComponent = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        window.location.href = '/login'
        return
      }

      setUser(user)
      await loadUserProfile(user.id)
      await loadConversations(user.id)
      await loadAvailableUsers(user.id)
      setLoading(false)
    } catch (error) {
      console.error('Error initializing component:', error)
      setLoading(false)
    }
  }

  const loadUserProfile = async (userId: string) => {
    try {
      const { data: profile } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single()

      if (profile) {
        setUserRole(profile.role)
      }
    } catch (error) {
      console.error('Error loading user profile:', error)
    }
  }

  const loadConversations = async (userId: string) => {
    try {
      const { data: conversations, error } = await supabase
        .from('individual_conversations')
        .select(`
          *,
          other_user:profiles!individual_conversations_user1_id_fkey(
            id,
            full_name,
            email,
            role,
            avatar_url
          ),
          last_message:conversation_messages(
            content,
            created_at,
            sender_name
          )
        `)
        .or(`user1_id.eq.${userId},user2_id.eq.${userId}`)
        .order('created_at', { ascending: false })

      if (error) throw error

      // Process conversations to get the other user and last message
      const processedConversations = conversations?.map(conv => {
        const otherUserId = conv.user1_id === userId ? conv.user2_id : conv.user1_id
        const otherUser = conv.other_user
        const lastMessage = conv.last_message?.[0] || null

        return {
          ...conv,
          other_user: otherUser,
          last_message: lastMessage
        }
      }) || []

      setConversations(processedConversations)
    } catch (error) {
      console.error('Error loading conversations:', error)
    }
  }

  const loadAvailableUsers = async (currentUserId: string) => {
    try {
      const { data: users, error } = await supabase
        .from('profiles')
        .select('id, full_name, email, role, avatar_url')
        .neq('id', currentUserId)
        .order('full_name')

      if (error) throw error
      setAvailableUsers(users || [])
    } catch (error) {
      console.error('Error loading available users:', error)
    }
  }

  const loadMessages = async (conversationId: string) => {
    try {
      const { data: messages, error } = await supabase
        .from('conversation_messages')
        .select(`
          *,
          sender:profiles(
            full_name,
            avatar_url,
            role
          )
        `)
        .eq('conversation_id', conversationId)
        .order('created_at', { ascending: true })

      if (error) throw error
      setMessages(messages || [])
    } catch (error) {
      console.error('Error loading messages:', error)
    }
  }

  const handleSendMessage = async () => {
    if (!selectedConversation || !newMessage.trim() || !user) return

    try {
      const { error } = await supabase
        .from('conversation_messages')
        .insert([{
          conversation_id: selectedConversation.id,
          sender_id: user.id,
          content: newMessage.trim(),
          message_type: 'text',
          sender_name: user.user_metadata?.full_name || user.email
        }])

      if (error) throw error

      setNewMessage('')
      await loadMessages(selectedConversation.id)
    } catch (error) {
      console.error('Error sending message:', error)
      toast({
        title: "Error",
        description: "Failed to send message. Please try again.",
        variant: "destructive",
      })
    }
  }

  const startNewConversation = async () => {
    if (!selectedUserToStartConversation || !user) return

    try {
      // Get or create conversation
      const { data: conversation, error } = await supabase
        .rpc('get_or_create_conversation', {
          user1_id: user.id,
          user2_id: selectedUserToStartConversation
        })

      if (error) throw error

      // Find the conversation details
      const { data: conversationDetails } = await supabase
        .from('individual_conversations')
        .select(`
          *,
          other_user:profiles!individual_conversations_user1_id_fkey(
            id,
            full_name,
            email,
            role,
            avatar_url
          )
        `)
        .eq('id', conversation)
        .single()

      if (conversationDetails) {
        const otherUserId = conversationDetails.user1_id === user.id ? conversationDetails.user2_id : conversationDetails.user1_id
        const otherUser = conversationDetails.other_user

        const newConversation: Conversation = {
          ...conversationDetails,
          other_user: otherUser,
          unread_count: 0
        }

        setConversations(prev => [newConversation, ...prev.filter(c => c.id !== newConversation.id)])
        setSelectedConversation(newConversation)
        setShowNewConversationDialog(false)
        setSelectedUserToStartConversation('')

        toast({
          title: "Success",
          description: "Conversation started successfully!",
        })
      }
    } catch (error) {
      console.error('Error starting conversation:', error)
      toast({
        title: "Error",
        description: "Failed to start conversation. Please try again.",
        variant: "destructive",
      })
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

  const filteredConversations = conversations.filter(conv =>
    conv.other_user.full_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    conv.last_message?.content.toLowerCase().includes(searchQuery.toLowerCase())
  )

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-xl">Loading conversations...</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Link href="/communication-hub">
                <Button variant="ghost" size="sm">
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Back to Communication Hub
                </Button>
              </Link>
              <div>
                <h1 className="text-3xl font-bold text-gray-900">Individual Conversations</h1>
                <p className="text-gray-600">Private conversations with other users</p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <Button onClick={() => setShowNewConversationDialog(true)}>
                <UserPlus className="w-4 h-4 mr-2" />
                New Conversation
              </Button>
              <Link href={getDashboardUrl()}>
                <Button variant="outline">Dashboard</Button>
              </Link>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Conversations List */}
          <div className="lg:col-span-1">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span>Conversations</span>
                  <div className="flex items-center space-x-2">
                    <Badge variant="secondary">{conversations.length}</Badge>
                  </div>
                </CardTitle>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <Input
                    placeholder="Search conversations..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {filteredConversations.map((conversation) => (
                    <div
                      key={conversation.id}
                      className={`p-3 rounded-lg cursor-pointer transition-colors ${
                        selectedConversation?.id === conversation.id
                          ? 'bg-blue-50 border border-blue-200'
                          : 'hover:bg-gray-50'
                      }`}
                      onClick={() => setSelectedConversation(conversation)}
                    >
                      <div className="flex items-center space-x-3">
                        <Avatar className="w-10 h-10">
                          <AvatarFallback className="bg-blue-500 text-white">
                            {conversation.other_user.full_name?.charAt(0) || 'U'}
                          </AvatarFallback>
                          <AvatarImage src={conversation.other_user.avatar_url} />
                        </Avatar>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between">
                            <h4 className="font-medium text-gray-900 truncate">
                              {conversation.other_user.full_name}
                            </h4>
                            {conversation.other_user.role === 'admin' && (
                              <Crown className="w-3 h-3 text-purple-500" />
                            )}
                          </div>
                          <p className="text-sm text-gray-600 truncate">
                            {conversation.last_message?.content || 'No messages yet'}
                          </p>
                          <div className="flex items-center justify-between mt-1">
                            <span className="text-xs text-gray-500">
                              {conversation.other_user.role}
                            </span>
                            {conversation.last_message && (
                              <span className="text-xs text-gray-500">
                                {new Date(conversation.last_message.created_at).toLocaleDateString()}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                  {filteredConversations.length === 0 && (
                    <div className="text-center py-8 text-gray-500">
                      <MessageSquare className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                      <p>No conversations found</p>
                      <p className="text-sm">Start a new conversation to begin messaging</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Messages Area */}
          <div className="lg:col-span-2">
            {selectedConversation ? (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-3">
                    <Avatar className="w-8 h-8">
                      <AvatarFallback className="bg-blue-500 text-white">
                        {selectedConversation.other_user.full_name?.charAt(0) || 'U'}
                      </AvatarFallback>
                      <AvatarImage src={selectedConversation.other_user.avatar_url} />
                    </Avatar>
                    <div>
                      <div className="flex items-center space-x-2">
                        <span>{selectedConversation.other_user.full_name}</span>
                        {selectedConversation.other_user.role === 'admin' && (
                          <Crown className="w-4 h-4 text-purple-500" />
                        )}
                      </div>
                      <p className="text-sm text-gray-500">{selectedConversation.other_user.role}</p>
                    </div>
                  </CardTitle>
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
                                  {isAdmin ? <Crown className="w-4 h-4" /> : (message.sender_name?.charAt(0) || 'U').toUpperCase()}
                                </AvatarFallback>
                                <AvatarImage src={message.sender?.avatar_url} />
                              </Avatar>
                              <div className={`flex-1 ${isOwn ? 'text-right' : ''}`}>
                                <div className={`flex items-center space-x-2 ${isOwn ? 'justify-end' : ''}`}>
                                  <span className="text-sm font-medium text-gray-900">
                                    {message.sender_name || 'Unknown User'}
                                    {isAdmin && <Crown className="w-3 h-3 ml-1 text-purple-500" />}
                                  </span>
                                  <span className="text-xs text-gray-500">
                                    {new Date(message.created_at).toLocaleString()}
                                  </span>
                                </div>
                                <div className={`mt-1 p-3 rounded-lg ${
                                  isOwn 
                                    ? 'bg-blue-500 text-white' 
                                    : 'bg-gray-100 text-gray-900'
                                }`}>
                                  <p className="text-sm">{message.content}</p>
                                </div>
                              </div>
                            </div>
                          )
                        })}
                        <div ref={messagesEndRef} />
                      </div>
                    </ScrollArea>

                    {/* Message Input */}
                    <div className="border-t p-4">
                      <div className="flex space-x-2">
                        <Textarea
                          value={newMessage}
                          onChange={(e) => setNewMessage(e.target.value)}
                          placeholder="Type your message..."
                          className="flex-1 min-h-[60px]"
                          onKeyPress={(e) => {
                            if (e.key === 'Enter' && !e.shiftKey) {
                              e.preventDefault()
                              handleSendMessage()
                            }
                          }}
                        />
                        <Button 
                          onClick={handleSendMessage} 
                          disabled={!newMessage.trim()}
                          className="self-end"
                        >
                          <Send className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ) : (
              <Card>
                <CardContent className="flex items-center justify-center h-[calc(100vh-20rem)]">
                  <div className="text-center text-gray-500">
                    <MessageSquare className="w-16 h-16 mx-auto mb-4 text-gray-300" />
                    <h3 className="text-lg font-medium mb-2">No conversation selected</h3>
                    <p>Choose a conversation from the list to start messaging</p>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>

      {/* New Conversation Dialog */}
      <Dialog open={showNewConversationDialog} onOpenChange={setShowNewConversationDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Start New Conversation</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Select User</Label>
              <Select value={selectedUserToStartConversation} onValueChange={setSelectedUserToStartConversation}>
                <SelectTrigger>
                  <SelectValue placeholder="Choose a user to start a conversation with" />
                </SelectTrigger>
                <SelectContent>
                  {availableUsers.map((user) => (
                    <SelectItem key={user.id} value={user.id}>
                      <div className="flex items-center space-x-2">
                        <span>{user.full_name}</span>
                        <Badge variant="outline" className="text-xs">
                          {user.role}
                        </Badge>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex justify-end space-x-2">
              <Button onClick={startNewConversation} disabled={!selectedUserToStartConversation}>
                Start Conversation
              </Button>
              <Button variant="outline" onClick={() => setShowNewConversationDialog(false)}>
                Cancel
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
} 