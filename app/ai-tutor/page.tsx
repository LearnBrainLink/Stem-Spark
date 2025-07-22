'use client'

import { useState, useEffect, useRef } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { 
  Send, 
  Bot, 
  User, 
  Sparkles,
  BookOpen,
  Code,
  Calculator,
  Beaker,
  MessageSquare,
  Loader2
} from 'lucide-react'

interface Message {
  id: string
  content: string
  sender: 'user' | 'ai'
  timestamp: Date
  subject?: string
}

interface Subject {
  id: string
  name: string
  icon: any
  description: string
}

export default function AITutorPage() {
  const [messages, setMessages] = useState<Message[]>([])
  const [inputMessage, setInputMessage] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [selectedSubject, setSelectedSubject] = useState<string>('')
  const [user, setUser] = useState<any>(null)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const supabase = createClient()

  const subjects: Subject[] = [
    { id: 'math', name: 'Mathematics', icon: Calculator, description: 'Algebra, Calculus, Geometry' },
    { id: 'science', name: 'Science', icon: Beaker, description: 'Physics, Chemistry, Biology' },
    { id: 'programming', name: 'Programming', icon: Code, description: 'Python, JavaScript, Java' },
    { id: 'general', name: 'General', icon: BookOpen, description: 'General academic help' }
  ]

  useEffect(() => {
    checkAuth()
    scrollToBottom()
  }, [messages])

  const checkAuth = async () => {
    try {
      const { data: { user: authUser } } = await supabase.auth.getUser()
      setUser(authUser)
      
      // Add welcome message
      if (authUser) {
        setMessages([{
          id: '1',
          content: `Hello ${authUser.email}! I'm your AI tutor. I can help you with mathematics, science, programming, and general academic questions. What would you like to learn about today?`,
          sender: 'ai',
          timestamp: new Date()
        }])
      } else {
        setMessages([{
          id: '1',
          content: 'Hello! I\'m your AI tutor. I can help you with mathematics, science, programming, and general academic questions. What would you like to learn about today?',
          sender: 'ai',
          timestamp: new Date()
        }])
      }
    } catch (error) {
      console.error('Error checking auth:', error)
    }
  }

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  const handleSendMessage = async () => {
    if (!inputMessage.trim() || isLoading) return

    const userMessage: Message = {
      id: Date.now().toString(),
      content: inputMessage,
      sender: 'user',
      timestamp: new Date(),
      subject: selectedSubject
    }

    setMessages(prev => [...prev, userMessage])
    setInputMessage('')
    setIsLoading(true)

    // Simulate AI response (in a real app, this would call an AI API)
    setTimeout(() => {
      const aiResponse = generateAIResponse(inputMessage, selectedSubject)
      const aiMessage: Message = {
        id: (Date.now() + 1).toString(),
        content: aiResponse,
        sender: 'ai',
        timestamp: new Date(),
        subject: selectedSubject
      }
      setMessages(prev => [...prev, aiMessage])
      setIsLoading(false)
    }, 1500)
  }

  const generateAIResponse = (userMessage: string, subject: string): string => {
    const lowerMessage = userMessage.toLowerCase()
    
    if (subject === 'math' || lowerMessage.includes('math') || lowerMessage.includes('algebra') || lowerMessage.includes('calculus')) {
      if (lowerMessage.includes('algebra')) {
        return "Algebra is a branch of mathematics that deals with symbols and the rules for manipulating these symbols. It's fundamental for solving equations and understanding mathematical relationships. Would you like me to explain a specific algebraic concept or help you solve a particular problem?"
      } else if (lowerMessage.includes('calculus')) {
        return "Calculus is the mathematical study of continuous change. It has two main branches: differential calculus (concerning rates of change and slopes of curves) and integral calculus (concerning accumulation of quantities and areas under curves). What specific aspect of calculus would you like to explore?"
      } else {
        return "I'd be happy to help you with mathematics! I can assist with algebra, calculus, geometry, trigonometry, and more. Could you tell me what specific math topic or problem you're working on?"
      }
    } else if (subject === 'science' || lowerMessage.includes('science') || lowerMessage.includes('physics') || lowerMessage.includes('chemistry')) {
      if (lowerMessage.includes('physics')) {
        return "Physics is the natural science that studies matter, energy, and their interactions. It's fundamental to understanding how the universe works. Are you studying mechanics, thermodynamics, electromagnetism, or another area of physics?"
      } else if (lowerMessage.includes('chemistry')) {
        return "Chemistry is the study of matter, its properties, and the changes it undergoes. It's essential for understanding everything from biological processes to materials science. What chemistry topic are you exploring?"
      } else {
        return "Science is fascinating! I can help you with physics, chemistry, biology, and other scientific disciplines. What specific scientific concept or experiment are you working on?"
      }
    } else if (subject === 'programming' || lowerMessage.includes('code') || lowerMessage.includes('programming') || lowerMessage.includes('python')) {
      if (lowerMessage.includes('python')) {
        return "Python is a versatile, high-level programming language known for its readability and simplicity. It's great for beginners and widely used in data science, web development, and automation. What Python concept or project are you working on?"
      } else if (lowerMessage.includes('javascript')) {
        return "JavaScript is a dynamic programming language primarily used for web development. It runs in browsers and can also be used on the server-side with Node.js. What JavaScript topic would you like to explore?"
      } else {
        return "Programming is an exciting skill to learn! I can help you with Python, JavaScript, Java, and other programming languages. What programming concept or project are you working on?"
      }
    } else {
      return "That's an interesting question! I'm here to help you learn and understand various academic subjects. Could you tell me more about what you're studying or what specific help you need?"
    }
  }

  const handleSubjectSelect = (subjectId: string) => {
    setSelectedSubject(subjectId)
    const subject = subjects.find(s => s.id === subjectId)
    if (subject) {
      const subjectMessage: Message = {
        id: Date.now().toString(),
        content: `Great choice! I can help you with ${subject.name.toLowerCase()}. ${subject.description} - what specific topic would you like to explore?`,
        sender: 'ai',
        timestamp: new Date(),
        subject: subjectId
      }
      setMessages(prev => [...prev, subjectMessage])
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center space-x-4">
            <div className="w-12 h-12 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
              <Bot className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">AI Tutor</h1>
              <p className="text-gray-600">Get personalized help with your studies</p>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Subject Selection */}
          <div className="lg:col-span-1">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Sparkles className="w-5 h-5 mr-2" />
                  Choose Subject
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {subjects.map((subject) => {
                  const Icon = subject.icon
                  return (
                    <Button
                      key={subject.id}
                      variant={selectedSubject === subject.id ? "default" : "outline"}
                      className="w-full justify-start"
                      onClick={() => handleSubjectSelect(subject.id)}
                    >
                      <Icon className="w-4 h-4 mr-2" />
                      {subject.name}
                    </Button>
                  )
                })}
              </CardContent>
            </Card>
          </div>

          {/* Chat Interface */}
          <div className="lg:col-span-3">
            <Card className="h-[600px] flex flex-col">
              <CardHeader className="border-b">
                <CardTitle className="flex items-center">
                  <MessageSquare className="w-5 h-5 mr-2" />
                  Chat with AI Tutor
                </CardTitle>
              </CardHeader>
              
              <CardContent className="flex-1 flex flex-col p-0">
                {/* Messages */}
                <div className="flex-1 overflow-y-auto p-6 space-y-4">
                  {messages.map((message) => (
                    <div
                      key={message.id}
                      className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                    >
                      <div
                        className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                          message.sender === 'user'
                            ? 'bg-blue-600 text-white'
                            : 'bg-gray-100 text-gray-900'
                        }`}
                      >
                        <div className="flex items-start space-x-2">
                          {message.sender === 'ai' && (
                            <Bot className="w-4 h-4 mt-1 flex-shrink-0" />
                          )}
                          <div>
                            <p className="text-sm">{message.content}</p>
                            <p className={`text-xs mt-1 ${
                              message.sender === 'user' ? 'text-blue-100' : 'text-gray-500'
                            }`}>
                              {message.timestamp.toLocaleTimeString()}
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                  
                  {isLoading && (
                    <div className="flex justify-start">
                      <div className="bg-gray-100 text-gray-900 max-w-xs lg:max-w-md px-4 py-2 rounded-lg">
                        <div className="flex items-center space-x-2">
                          <Bot className="w-4 h-4" />
                          <Loader2 className="w-4 h-4 animate-spin" />
                          <span className="text-sm">AI is thinking...</span>
                        </div>
                      </div>
                    </div>
                  )}
                  
                  <div ref={messagesEndRef} />
                </div>

                {/* Input */}
                <div className="border-t p-4">
                  <div className="flex space-x-2">
                    <Input
                      value={inputMessage}
                      onChange={(e) => setInputMessage(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                      placeholder="Ask me anything about your studies..."
                      className="flex-1"
                      disabled={isLoading}
                    />
                    <Button
                      onClick={handleSendMessage}
                      disabled={!inputMessage.trim() || isLoading}
                      size="icon"
                    >
                      <Send className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
} 