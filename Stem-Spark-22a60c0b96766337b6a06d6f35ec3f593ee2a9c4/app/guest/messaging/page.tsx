"use client"

import React, { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { 
  MessageSquare, 
  Send, 
  Users, 
  Search,
  ArrowLeft,
  AlertCircle,
  Plus,
  MoreVertical
} from "lucide-react"
import Link from "next/link"

export default function GuestMessaging() {
  const [selectedChat, setSelectedChat] = useState<string | null>(null)
  const [message, setMessage] = useState("")
  const [guestMessages, setGuestMessages] = useState<{[key: string]: any[]}>({
    "study-group": [
      { id: 1, sender: "Alex", content: "Hey everyone! How's the Python assignment going?", time: "2:30 PM", avatar: "👨‍💻" },
      { id: 2, sender: "Sarah", content: "I'm stuck on the loops section. Anyone can help?", time: "2:32 PM", avatar: "👩‍💻" },
      { id: 3, sender: "Mike", content: "Sure! I can explain loops. What specifically are you having trouble with?", time: "2:35 PM", avatar: "👨‍🏫" }
    ],
    "tutor-chat": [
      { id: 1, sender: "Dr. Chen", content: "Hi! I'm available for your Python tutoring session tomorrow at 2 PM.", time: "1:00 PM", avatar: "👩‍🏫" },
      { id: 2, sender: "You", content: "Perfect! I have some questions about functions.", time: "1:05 PM", avatar: "👤" },
      { id: 3, sender: "Dr. Chen", content: "Great! I'll prepare some examples for you.", time: "1:10 PM", avatar: "👩‍🏫" }
    ]
  })

  const chats = [
    { id: "study-group", name: "Python Study Group", lastMessage: "Mike: Sure! I can explain loops...", unread: 2, avatar: "👥" },
    { id: "tutor-chat", name: "Dr. Sarah Chen", lastMessage: "Dr. Chen: Great! I'll prepare some examples...", unread: 0, avatar: "👩‍🏫" },
    { id: "competition-team", name: "Hackathon Team", lastMessage: "Alex: Let's meet tomorrow to discuss...", unread: 1, avatar: "🏆" },
    { id: "mentor-chat", name: "Career Mentor", lastMessage: "Mentor: Your portfolio looks great!", unread: 0, avatar: "👨‍💼" }
  ]

  useEffect(() => {
    // Check if guest mode is active
    const guestMode = sessionStorage.getItem('guestMode')
    if (!guestMode) {
      window.location.href = '/'
    }
  }, [])

  const handleSendMessage = () => {
    if (!message.trim() || !selectedChat) return

    const newMessage = {
      id: Date.now(),
      sender: "You",
      content: message,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      avatar: "👤"
    }

    setGuestMessages(prev => ({
      ...prev,
      [selectedChat]: [...(prev[selectedChat] || []), newMessage]
    }))

    setMessage("")
    
    // Simulate response after 2 seconds
    setTimeout(() => {
      const responses = [
        "Thanks for your message! This is a demo.",
        "Great question! In a real session, I'd help you with that.",
        "I understand. Let me explain that in detail.",
        "That's a good point! Here's what I think..."
      ]
      
      const response = {
        id: Date.now() + 1,
        sender: chats.find(c => c.id === selectedChat)?.name.split(' ')[0] || "User",
        content: responses[Math.floor(Math.random() * responses.length)],
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        avatar: chats.find(c => c.id === selectedChat)?.avatar || "👤"
      }

      setGuestMessages(prev => ({
        ...prev,
        [selectedChat]: [...(prev[selectedChat] || []), response]
      }))
    }, 2000)
  }

  const handleGuestAction = (action: string) => {
    alert(`Guest Action: ${action}\n\nThis is a demo feature. Sign up to use real messaging!`)
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Link href="/">
                <Button variant="ghost" size="sm">
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Back to Home
                </Button>
              </Link>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Messaging</h1>
                <p className="text-sm text-gray-500">Guest Mode - Demo Experience</p>
              </div>
            </div>
            <Badge variant="secondary" className="bg-blue-100 text-blue-700">
              <AlertCircle className="w-3 h-3 mr-1" />
              Guest Mode
            </Badge>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-[600px]">
          {/* Chat List */}
          <Card className="lg:col-span-1">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center">
                  <MessageSquare className="w-5 h-5 mr-2" />
                  Conversations
                </CardTitle>
                <Button 
                  size="sm" 
                  variant="outline"
                  onClick={() => handleGuestAction('Start New Chat')}
                >
                  <Plus className="w-4 h-4" />
                </Button>
              </div>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input 
                  placeholder="Search conversations..." 
                  className="pl-10"
                  onClick={() => handleGuestAction('Search Conversations')}
                />
              </div>
            </CardHeader>
            <CardContent className="p-0">
              <div className="space-y-1">
                {chats.map((chat) => (
                  <div
                    key={chat.id}
                    className={`p-4 cursor-pointer hover:bg-gray-50 transition-colors ${
                      selectedChat === chat.id ? 'bg-blue-50 border-r-2 border-blue-600' : ''
                    }`}
                    onClick={() => setSelectedChat(chat.id)}
                  >
                    <div className="flex items-center space-x-3">
                      <div className="text-2xl">{chat.avatar}</div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <h3 className="font-medium text-gray-900 truncate">{chat.name}</h3>
                          {chat.unread > 0 && (
                            <Badge variant="destructive" className="text-xs">
                              {chat.unread}
                            </Badge>
                          )}
                        </div>
                        <p className="text-sm text-gray-500 truncate">{chat.lastMessage}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Chat Area */}
          <Card className="lg:col-span-2 flex flex-col">
            {selectedChat ? (
              <>
                <CardHeader className="border-b">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="text-2xl">
                        {chats.find(c => c.id === selectedChat)?.avatar}
                      </div>
                      <div>
                        <CardTitle>{chats.find(c => c.id === selectedChat)?.name}</CardTitle>
                        <CardDescription>Active now</CardDescription>
                      </div>
                    </div>
                    <Button 
                      variant="ghost" 
                      size="sm"
                      onClick={() => handleGuestAction('Chat Options')}
                    >
                      <MoreVertical className="w-4 h-4" />
                    </Button>
                  </div>
                </CardHeader>
                
                <CardContent className="flex-1 p-0">
                  <div className="h-full flex flex-col">
                    {/* Messages */}
                    <div className="flex-1 p-4 space-y-4 overflow-y-auto">
                      {guestMessages[selectedChat]?.map((msg) => (
                        <div
                          key={msg.id}
                          className={`flex items-start space-x-3 ${
                            msg.sender === "You" ? "flex-row-reverse space-x-reverse" : ""
                          }`}
                        >
                          <div className="text-xl">{msg.avatar}</div>
                          <div className={`max-w-xs lg:max-w-md ${
                            msg.sender === "You" ? "text-right" : ""
                          }`}>
                            <div className={`inline-block p-3 rounded-lg ${
                              msg.sender === "You" 
                                ? "bg-blue-600 text-white" 
                                : "bg-gray-100 text-gray-900"
                            }`}>
                              <p className="text-sm">{msg.content}</p>
                            </div>
                            <p className="text-xs text-gray-500 mt-1">{msg.time}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                    
                    {/* Message Input */}
                    <div className="p-4 border-t">
                      <div className="flex space-x-2">
                        <Input
                          placeholder="Type a message..."
                          value={message}
                          onChange={(e) => setMessage(e.target.value)}
                          onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                        />
                        <Button 
                          onClick={handleSendMessage}
                          disabled={!message.trim()}
                        >
                          <Send className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </>
            ) : (
              <CardContent className="flex-1 flex items-center justify-center">
                <div className="text-center">
                  <MessageSquare className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">Select a conversation</h3>
                  <p className="text-gray-500">Choose a chat from the list to start messaging</p>
                </div>
              </CardContent>
            )}
          </Card>
        </div>

        {/* Guest Mode Notice */}
        <Card className="mt-8 bg-yellow-50 border-yellow-200">
          <CardContent className="p-6">
            <div className="flex items-center space-x-3">
              <AlertCircle className="w-6 h-6 text-yellow-600" />
              <div>
                <h3 className="font-medium text-yellow-800">Guest Mode Active</h3>
                <p className="text-sm text-yellow-700 mt-1">
                  This is a demo messaging experience. You can explore the interface and send demo messages, 
                  but they won't be saved or sent to real users. Sign up for a real account to connect with 
                  students, tutors, and mentors.
                </p>
                <div className="mt-3">
                  <Link href="/sign%20up">
                    <Button className="bg-blue-600 hover:bg-blue-700">
                      <MessageSquare className="w-4 h-4 mr-2" />
                      Sign Up for Real Messaging
                    </Button>
                  </Link>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
} 