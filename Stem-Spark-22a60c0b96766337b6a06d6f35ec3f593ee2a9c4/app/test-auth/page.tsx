'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { User, Shield, CheckCircle, XCircle, AlertCircle } from 'lucide-react'

export default function TestAuthPage() {
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [testResults, setTestResults] = useState<string[]>([])

  useEffect(() => {
    checkAuth()
  }, [])

  const addResult = (message: string) => {
    setTestResults(prev => [...prev, `${new Date().toLocaleTimeString()}: ${message}`])
  }

  const checkAuth = async () => {
    try {
      addResult('Checking authentication...')
      
      const { data: { user: authUser }, error: authError } = await supabase.auth.getUser()
      
      addResult(`Auth result: ${authUser ? 'User found' : 'No user'} ${authError ? `Error: ${authError.message}` : ''}`)
      
      if (authUser) {
        setUser(authUser)
        addResult(`User email: ${authUser.email}`)
        addResult(`User ID: ${authUser.id}`)
        
        // Check profile
        const { data: profile, error: profileError } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', authUser.id)
          .single()
        
        addResult(`Profile result: ${profile ? 'Found' : 'Not found'} ${profileError ? `Error: ${profileError.message}` : ''}`)
        
        if (profile) {
          addResult(`Profile role: ${profile.role}`)
          addResult(`Profile name: ${profile.full_name}`)
        }
      }
    } catch (error) {
      addResult(`Error: ${error}`)
    } finally {
      setLoading(false)
    }
  }

  const testLogin = async () => {
    try {
      addResult('Testing login with test@example.com...')
      
      const { data, error } = await supabase.auth.signInWithPassword({
        email: 'test@example.com',
        password: 'testpassword123'
      })
      
      if (error) {
        addResult(`Login error: ${error.message}`)
      } else {
        addResult(`Login successful: ${data.user?.email}`)
        setUser(data.user)
        await checkAuth()
      }
    } catch (error) {
      addResult(`Login test error: ${error}`)
    }
  }

  const testSignOut = async () => {
    try {
      addResult('Testing sign out...')
      
      const { error } = await supabase.auth.signOut()
      
      if (error) {
        addResult(`Sign out error: ${error.message}`)
      } else {
        addResult('Sign out successful')
        setUser(null)
      }
    } catch (error) {
      addResult(`Sign out test error: ${error}`)
    }
  }

  const redirectToDashboard = () => {
    addResult('Attempting redirect to student dashboard...')
    window.location.href = '/student-dashboard'
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto">
        <Card>
          <CardHeader>
            <CardTitle>Authentication Test Page</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Button onClick={testLogin} disabled={loading}>
                Test Login
              </Button>
              <Button onClick={testSignOut} variant="outline">
                Test Sign Out
              </Button>
              <Button onClick={redirectToDashboard} variant="secondary">
                Test Dashboard Redirect
              </Button>
              <Button onClick={checkAuth} variant="outline">
                Refresh Auth Check
              </Button>
            </div>

            <div className="border rounded-lg p-4 bg-gray-50">
              <h3 className="font-semibold mb-2">Current User:</h3>
              <pre className="text-sm bg-white p-2 rounded border overflow-auto">
                {user ? JSON.stringify(user, null, 2) : 'No user logged in'}
              </pre>
            </div>

            <div className="border rounded-lg p-4 bg-gray-50">
              <h3 className="font-semibold mb-2">Test Results:</h3>
              <div className="text-sm bg-white p-2 rounded border max-h-64 overflow-auto">
                {testResults.map((result, index) => (
                  <div key={index} className="mb-1 font-mono">
                    {result}
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
} 