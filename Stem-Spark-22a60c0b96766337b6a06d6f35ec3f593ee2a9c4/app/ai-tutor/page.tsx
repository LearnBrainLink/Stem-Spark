"use client"

import React, { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Logo } from "@/components/logo"
import { FloatingElements } from "@/components/FloatingElements"
import AuthGuard from "@/components/auth-guard"
import { 
  Bot, 
  Send, 
  MessageSquare, 
  BookOpen, 
  Lightbulb, 
  Target, 
  Loader2, 
  Sparkles,
  Brain,
  Zap,
  Star,
  Clock
} from "lucide-react"
import Link from "next/link"

interface Message {
  id: string
  content: string
  sender: 'user' | 'ai'
  timestamp: Date
  type: 'text' | 'code' | 'explanation'
}

interface Subject {
  id: string
  name: string
  icon: React.ReactNode
  description: string
  topics: string[]
}

export default function AITutorPage() {
  const [messages, setMessages] = useState<Message[]>([])
  const [inputMessage, setInputMessage] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [selectedSubject, setSelectedSubject] = useState<string>("")
  const [conversationHistory, setConversationHistory] = useState<Message[]>([])

  const subjects: Subject[] = [
    {
      id: "math",
      name: "Mathematics",
      icon: <Target className="w-6 h-6" />,
      description: "Algebra, Geometry, Calculus, Statistics",
      topics: ["Algebra", "Geometry", "Calculus", "Statistics", "Trigonometry"]
    },
    {
      id: "science",
      name: "Science",
      icon: <Lightbulb className="w-6 h-6" />,
      description: "Physics, Chemistry, Biology, Earth Science",
      topics: ["Physics", "Chemistry", "Biology", "Earth Science", "Astronomy"]
    },
    {
      id: "programming",
      name: "Programming",
      icon: <Zap className="w-6 h-6" />,
      description: "Python, JavaScript, Java, Web Development",
      topics: ["Python", "JavaScript", "Java", "Web Development", "Data Structures"]
    },
    {
      id: "engineering",
      name: "Engineering",
      icon: <Brain className="w-6 h-6" />,
      description: "Mechanical, Electrical, Civil, Computer Engineering",
      topics: ["Mechanical", "Electrical", "Civil", "Computer", "Robotics"]
    }
  ]

  const handleSendMessage = async () => {
    if (!inputMessage.trim() || isLoading) return

    const userMessage: Message = {
      id: Date.now().toString(),
      content: inputMessage,
      sender: 'user',
      timestamp: new Date(),
      type: 'text'
    }

    setMessages(prev => [...prev, userMessage])
    setConversationHistory(prev => [...prev, userMessage])
    setInputMessage("")
    setIsLoading(true)

    try {
      // Call Google Cloud AI API
      const response = await fetch('/api/ai-tutor', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: inputMessage,
          subject: selectedSubject,
          conversationHistory: conversationHistory.map(msg => ({
            role: msg.sender === 'user' ? 'user' : 'assistant',
            content: msg.content
          }))
        })
      })

      if (!response.ok) {
        throw new Error('Failed to get AI response')
      }

      const data = await response.json()
      
      const aiResponse: Message = {
        id: (Date.now() + 1).toString(),
        content: data.response,
        sender: 'ai',
        timestamp: new Date(),
        type: 'text'
      }

      setMessages(prev => [...prev, aiResponse])
      setConversationHistory(prev => [...prev, aiResponse])
    } catch (error) {
      console.error('Error getting AI response:', error)
      const errorResponse: Message = {
        id: (Date.now() + 1).toString(),
        content: "I'm sorry, I'm having trouble connecting to the AI service right now. Please try again later.",
        sender: 'ai',
        timestamp: new Date(),
        type: 'text'
      }
      setMessages(prev => [...prev, errorResponse])
      setConversationHistory(prev => [...prev, errorResponse])
    } finally {
      setIsLoading(false)
    }
  }

  const startNewConversation = () => {
    setMessages([])
    setConversationHistory([])
    setSelectedSubject("")
  }

  const suggestedQuestions = [
    "Can you explain quadratic equations?",
    "How does photosynthesis work?",
    "What is object-oriented programming?",
    "How do electric circuits work?",
    "Can you help me with calculus derivatives?",
    "What is the scientific method?"
  ]

  return (
    <AuthGuard>
      <div className="min-h-screen bg-gradient-to-br from-blue-900 via-purple-900 to-pink-900 relative overflow-x-hidden">
        <FloatingElements />
        
        {/* Navigation */}
        <nav className="fixed top-0 left-0 right-0 z-50 bg-white/90 backdrop-blur-md border-b border-gray-200/50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center py-4">
              <div className="flex items-center">
                <Link href="/">
                  <Logo variant="nav" />
                </Link>
              </div>
              <div className="flex items-center space-x-4">
                <Link href="/dashboard">
                  <Button variant="outline" className="text-blue-600 border-blue-600 hover:bg-blue-50">
                    Dashboard
                  </Button>
                </Link>
                <Link href="/communication-hub">
                  <Button variant="outline" className="text-blue-600 border-blue-600 hover:bg-blue-50">
                    Communication Hub
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </nav>

        {/* Main Content */}
        <main className="pt-20 pb-8">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            {/* Header Section */}
            <div className="text-center mb-8">
              <div className="mb-6">
                <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full mb-4">
                  <Bot className="w-10 h-10 text-white" />
                </div>
                <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
                  AI Tutor
                  <span className="bg-gradient-to-r from-yellow-300 to-orange-400 bg-clip-text text-transparent ml-2">
                    Assistant
                  </span>
                </h1>
                <p className="text-xl text-blue-100 max-w-2xl mx-auto leading-relaxed">
                  Get personalized help with STEM subjects from our AI tutor. Ask questions, get explanations, and learn at your own pace.
                </p>
              </div>
            </div>

            <div className="grid lg:grid-cols-3 gap-8">
              {/* Subject Selection */}
              <div className="lg:col-span-1">
                <Card className="backdrop-blur-md bg-white/10 border-white/20 shadow-2xl rounded-2xl overflow-hidden">
                  <CardHeader className="pb-4">
                    <CardTitle className="text-2xl font-bold text-white flex items-center">
                      <BookOpen className="w-6 h-6 mr-2" />
                      Choose Subject
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {subjects.map((subject) => (
                      <button
                        key={subject.id}
                        onClick={() => setSelectedSubject(subject.id)}
                        className={`w-full p-4 rounded-xl border transition-all duration-300 text-left ${
                          selectedSubject === subject.id
                            ? 'border-blue-400 bg-blue-500/20 text-white'
                            : 'border-white/20 bg-white/10 text-blue-100 hover:bg-white/20'
                        }`}
                      >
                        <div className="flex items-center mb-2">
                          <div className="text-blue-300 mr-3">{subject.icon}</div>
                          <h3 className="font-semibold">{subject.name}</h3>
                        </div>
                        <p className="text-sm opacity-80">{subject.description}</p>
                        <div className="flex flex-wrap gap-1 mt-2">
                          {subject.topics.slice(0, 3).map((topic) => (
                            <span
                              key={topic}
                              className="text-xs bg-white/10 px-2 py-1 rounded-full"
                            >
                              {topic}
                            </span>
                          ))}
                        </div>
                      </button>
                    ))}
                  </CardContent>
                </Card>

                {/* Suggested Questions */}
                <Card className="backdrop-blur-md bg-white/10 border-white/20 shadow-2xl rounded-2xl overflow-hidden mt-6">
                  <CardHeader className="pb-4">
                    <CardTitle className="text-xl font-bold text-white flex items-center">
                      <Sparkles className="w-5 h-5 mr-2" />
                      Suggested Questions
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {suggestedQuestions.map((question, index) => (
                      <button
                        key={index}
                        onClick={() => setInputMessage(question)}
                        className="w-full p-3 rounded-lg bg-white/10 border border-white/20 text-blue-100 hover:bg-white/20 transition-all duration-300 text-left text-sm"
                      >
                        {question}
                      </button>
                    ))}
                  </CardContent>
                </Card>
              </div>

              {/* Chat Interface */}
              <div className="lg:col-span-2">
                <Card className="backdrop-blur-md bg-white/10 border-white/20 shadow-2xl rounded-2xl overflow-hidden h-[600px] flex flex-col">
                  <CardHeader className="pb-4 border-b border-white/20">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-2xl font-bold text-white flex items-center">
                        <MessageSquare className="w-6 h-6 mr-2" />
                        AI Tutor Chat
                      </CardTitle>
                      <Button
                        onClick={startNewConversation}
                        variant="outline"
                        className="border-white/20 text-white hover:bg-white/20"
                      >
                        New Chat
                      </Button>
                    </div>
                  </CardHeader>
                  
                  <CardContent className="flex-1 flex flex-col p-0">
                    {/* Messages Area */}
                    <div className="flex-1 overflow-y-auto p-6 space-y-4">
                      {messages.length === 0 ? (
                        <div className="text-center text-blue-200 mt-20">
                          <Bot className="w-16 h-16 mx-auto mb-4 opacity-50" />
                          <p className="text-lg font-medium">Start a conversation with your AI tutor</p>
                          <p className="text-sm opacity-80 mt-2">Choose a subject and ask any question!</p>
                        </div>
                      ) : (
                        messages.map((message) => (
                          <div
                            key={message.id}
                            className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                          >
                            <div
                              className={`max-w-[80%] p-4 rounded-2xl ${
                                message.sender === 'user'
                                  ? 'bg-blue-600 text-white'
                                  : 'bg-white/10 text-blue-100 border border-white/20'
                              }`}
                            >
                              <p className="text-sm">{message.content}</p>
                              <div className={`flex items-center mt-2 text-xs opacity-70 ${
                                message.sender === 'user' ? 'justify-end' : 'justify-start'
                              }`}>
                                <Clock className="w-3 h-3 mr-1" />
                                {message.timestamp.toLocaleTimeString()}
                              </div>
                            </div>
                          </div>
                        ))
                      )}
                      
                      {isLoading && (
                        <div className="flex justify-start">
                          <div className="bg-white/10 text-blue-100 border border-white/20 p-4 rounded-2xl">
                            <div className="flex items-center space-x-2">
                              <Loader2 className="w-4 h-4 animate-spin" />
                              <span>AI is thinking...</span>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Input Area */}
                    <div className="p-6 border-t border-white/20">
                      <div className="flex space-x-4">
                        <div className="flex-1">
                          <Textarea
                            value={inputMessage}
                            onChange={(e) => setInputMessage(e.target.value)}
                            placeholder="Ask your AI tutor anything..."
                            className="bg-white/10 border-white/20 text-white placeholder:text-blue-200 focus:border-blue-400 focus:ring-blue-400/20 resize-none"
                            rows={3}
                            onKeyPress={(e) => {
                              if (e.key === 'Enter' && !e.shiftKey) {
                                e.preventDefault()
                                handleSendMessage()
                              }
                            }}
                          />
                        </div>
                        <Button
                          onClick={handleSendMessage}
                          disabled={!inputMessage.trim() || isLoading}
                          className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white px-6 self-end"
                        >
                          {isLoading ? (
                            <Loader2 className="w-4 h-4 animate-spin" />
                          ) : (
                            <Send className="w-4 h-4" />
                          )}
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>

            {/* Features Section */}
            <div className="mt-16">
              <h2 className="text-3xl font-bold text-white text-center mb-8">
                Why Choose Our AI Tutor?
              </h2>
              <div className="grid md:grid-cols-3 gap-8">
                <Card className="backdrop-blur-md bg-white/10 border-white/20 shadow-2xl rounded-2xl overflow-hidden text-center">
                  <CardContent className="p-6">
                    <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-4">
                      <Brain className="w-8 h-8 text-white" />
                    </div>
                    <h3 className="text-xl font-bold text-white mb-2">Personalized Learning</h3>
                    <p className="text-blue-200">Adapts to your learning style and pace for optimal understanding</p>
                  </CardContent>
                </Card>
                
                <Card className="backdrop-blur-md bg-white/10 border-white/20 shadow-2xl rounded-2xl overflow-hidden text-center">
                  <CardContent className="p-6">
                    <div className="w-16 h-16 bg-gradient-to-r from-purple-500 to-pink-600 rounded-full flex items-center justify-center mx-auto mb-4">
                      <Clock className="w-8 h-8 text-white" />
                    </div>
                    <h3 className="text-xl font-bold text-white mb-2">24/7 Availability</h3>
                    <p className="text-blue-200">Get help whenever you need it, day or night</p>
                  </CardContent>
                </Card>
                
                <Card className="backdrop-blur-md bg-white/10 border-white/20 shadow-2xl rounded-2xl overflow-hidden text-center">
                  <CardContent className="p-6">
                    <div className="w-16 h-16 bg-gradient-to-r from-yellow-500 to-orange-600 rounded-full flex items-center justify-center mx-auto mb-4">
                      <Star className="w-8 h-8 text-white" />
                    </div>
                    <h3 className="text-xl font-bold text-white mb-2">Expert Knowledge</h3>
                    <p className="text-blue-200">Access to comprehensive STEM knowledge and explanations</p>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </main>
      </div>
    </AuthGuard>
  )
} 