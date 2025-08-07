'use client'

import { useState, useEffect } from 'react'
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from '@/components/ui/card'
import { Button } from '@/components/ui/button'
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
import {
  CheckCircle,
  XCircle,
  Clock,
  AlertCircle,
  Check,
  X,
} from 'lucide-react'

// Intern Approvals Page Component
export default function InternApprovalsPage() {
  const [approvals, setApprovals] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetchApprovals()
  }, [])

  const getSupabaseClient = async () => {
    const { createClient } = await import('@supabase/supabase-js')
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!
    return createClient(supabaseUrl, supabaseServiceKey)
  }

  const fetchApprovals = async () => {
    setLoading(true)
    setError(null)
    try {
      const supabase = await getSupabaseClient()
      const { data, error } = await supabase
        .from('internship_applications')
        .select(`
          *,
          profile:profiles!student_id(full_name, email),
          internship:internships!internship_id(title, company)
        `)
        .eq('status', 'pending')
        .order('applied_at', { ascending: false })
      
      if (error) throw error
      setApprovals(data || [])
    } catch (err: any) {
      setError(err.message || 'Failed to fetch approvals.')
    } finally {
      setLoading(false)
    }
  }

  const handleApprove = async (applicationId: string) => {
    try {
      const supabase = await getSupabaseClient()
      const { error } = await supabase
        .from('internship_applications')
        .update({ status: 'approved' })
        .eq('id', applicationId)
      
      if (error) throw error
      await fetchApprovals()
    } catch (err: any) {
      setError(err.message || 'Failed to approve application.')
    }
  }

  const handleReject = async (applicationId: string) => {
    try {
      const supabase = await getSupabaseClient()
      const { error } = await supabase
        .from('internship_applications')
        .update({ status: 'rejected' })
        .eq('id', applicationId)
      
      if (error) throw error
      await fetchApprovals()
    } catch (err: any) {
      setError(err.message || 'Failed to reject application.')
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'approved':
        return (
          <Badge variant="default" className="bg-green-500">
            <CheckCircle className="mr-2 h-4 w-4" /> Approved
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

  if (loading) return <div>Loading approvals...</div>
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
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Intern Approvals</h1>
        <Button onClick={fetchApprovals} variant="outline">
          Refresh
        </Button>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Pending Approvals</CardTitle>
          <CardDescription>
            Review and approve internship applications.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Applicant</TableHead>
                <TableHead>Internship</TableHead>
                <TableHead>Applied Date</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {approvals.map((approval) => (
                <TableRow key={approval.id}>
                  <TableCell>
                    <div className="font-medium">{approval.profile?.full_name}</div>
                    <div className="text-sm text-muted-foreground">
                      {approval.profile?.email}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="font-medium">{approval.internship?.title}</div>
                    <div className="text-sm text-muted-foreground">
                      {approval.internship?.company}
                    </div>
                  </TableCell>
                  <TableCell>
                    {new Date(approval.applied_at).toLocaleDateString()}
                  </TableCell>
                  <TableCell>
                    {getStatusBadge(approval.status)}
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        onClick={() => handleApprove(approval.id)}
                        className="bg-green-600 hover:bg-green-700"
                      >
                        <Check className="h-4 w-4 mr-1" />
                        Approve
                      </Button>
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={() => handleReject(approval.id)}
                      >
                        <X className="h-4 w-4 mr-1" />
                        Reject
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          {approvals.length === 0 && (
            <div className="text-center py-8">
              <p className="text-muted-foreground">No pending approvals found.</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}


