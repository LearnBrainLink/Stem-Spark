'use client'

import { useState, useEffect } from 'react'
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from '@/components/ui/card'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  Alert,
  AlertDescription,
  AlertTitle,
} from '@/components/ui/alert'
import { Badge } from '@/components/ui/badge'
import { AlertCircle, CheckCircle, XCircle, Clock } from 'lucide-react'

// Content Moderation Page Component
export default function ContentModerationPage() {
  const [content, setContent] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetchContent()
  }, [])
  
  const getSupabaseClient = async () => {
    const { createClient } = await import('@supabase/supabase-js')
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!
    return createClient(supabaseUrl, supabaseServiceKey)
  }

  const fetchContent = async () => {
    setLoading(true)
    setError(null)
    try {
      const supabase = await getSupabaseClient()
      // This is a simplified example. In a real app, you'd likely query 
      // for comments, user-generated posts, etc. that have a 'pending_review' status.
      // For this example, we'll fetch recently updated videos as "content".
      const { data, error } = await supabase
        .from('videos')
        .select('*')
        .order('updated_at', { ascending: false })
        .limit(20)

      if (error) throw error
      
      const formattedContent = data.map(item => ({...item, type: 'video'}));
      setContent(formattedContent)
    } catch (err: any) {
      setError(err.message || 'Failed to fetch content for moderation.')
    } finally {
      setLoading(false)
    }
  }
  
    const getStatusBadge = (status: string | null) => {
    // Example: videos might have a status like 'active', 'pending', etc.
    switch (status) {
      case 'active':
        return (
          <Badge variant="default" className="bg-green-500">
            <CheckCircle className="mr-2 h-4 w-4" /> Active
          </Badge>
        )
      case 'rejected':
         return (
          <Badge variant="destructive">
            <XCircle className="mr-2 h-4 w-4" /> Rejected
          </Badge>
        )
      default:
        return (
          <Badge variant="secondary">
            <Clock className="mr-2 h-4 w-4" /> Pending
          </Badge>
        )
    }
  }


  if (loading) return <div>Loading content for moderation...</div>
  if (error) {
    return (
      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>Error</AlertTitle>
        <AlertDescription>{error}</AlertDescription>
      </Alert>
    )
  }

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-3xl font-bold mb-6">Content Moderation</h1>
      <Card>
        <CardHeader>
          <CardTitle>Recent Content</CardTitle>
          <CardDescription>
            Review recently added or updated content.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Type</TableHead>
                <TableHead>Title/Content</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {content.map((item) => (
                <TableRow key={item.id}>
                  <TableCell>
                    <Badge variant="outline">{item.type}</Badge>
                  </TableCell>
                  <TableCell className="font-medium">{item.title || 'N/A'}</TableCell>
                  <TableCell>
                    {new Date(item.updated_at || item.created_at).toLocaleString()}
                  </TableCell>
                  <TableCell>
                    {getStatusBadge(item.status)}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}

