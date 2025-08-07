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
import { Badge } from '@/components/ui/badge'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  Alert,
  AlertDescription,
  AlertTitle,
} from '@/components/ui/alert'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
  CheckCircle,
  XCircle,
  Clock,
  MoreHorizontal,
  AlertCircle,
  Mail,
  User,
  Building,
  FileText,
} from 'lucide-react'

// Main component for the Applications Page
export default function ApplicationsPage() {
  const [applications, setApplications] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [selectedApplication, setSelectedApplication] = useState<any | null>(
    null
  )
  const [isDetailsOpen, setIsDetailsOpen] = useState(false)
  const [isUpdateStatusOpen, setIsUpdateStatusOpen] = useState(false)
  const [newStatus, setNewStatus] = useState<
    'pending' | 'approved' | 'rejected'
  >('pending')
  const [rejectionReason, setRejectionReason] = useState('')

  useEffect(() => {
    fetchApplications()
  }, [])

  const fetchApplications = async () => {
    setLoading(true)
    setError(null)
    try {
      const { createClient } = await import('@supabase/supabase-js')
      const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
      const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

      const supabase = createClient(supabaseUrl, supabaseServiceKey)

      const { data, error } = await supabase
        .from('internship_applications')
        .select(
          `
          *,
          profile:profiles!student_id(full_name, email),
          internship:internships!internship_id(title, company)
        `
        )
        .order('applied_at', { ascending: false })

      if (error) throw error
      setApplications(data || [])
    } catch (err: any) {
      setError(err.message || 'Failed to fetch applications.')
      console.error('Error fetching applications:', err)
    } finally {
      setLoading(false)
    }
  }

  const handleUpdateStatus = async () => {
    if (!selectedApplication) return

    try {
      const { createClient } = await import('@supabase/supabase-js')
      const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
      const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!
      const supabase = createClient(supabaseUrl, supabaseServiceKey)

      const updateData: any = { status: newStatus }
      if (newStatus === 'rejected') {
        updateData.rejection_reason = rejectionReason
      }

      const { error } = await supabase
        .from('internship_applications')
        .update(updateData)
        .eq('id', selectedApplication.id)

      if (error) throw error

      await fetchApplications()
      setIsUpdateStatusOpen(false)
      setRejectionReason('')
    } catch (err: any) {
      setError(err.message || 'Failed to update application status.')
    }
  }

  const openDetails = (app: any) => {
    setSelectedApplication(app)
    setIsDetailsOpen(true)
  }

  const openUpdateStatus = (app: any) => {
    setSelectedApplication(app)
    setNewStatus(app.status)
    setIsUpdateStatusOpen(true)
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

  if (loading) return <div>Loading applications...</div>
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
      <h1 className="text-3xl font-bold mb-6">Internship Applications</h1>
      <Card>
        <CardHeader>
          <CardTitle>All Applications</CardTitle>
          <CardDescription>
            A list of all submitted internship applications.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Applicant</TableHead>
                <TableHead>Internship</TableHead>
                <TableHead>Applied At</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {applications.map((app) => (
                <TableRow key={app.id}>
                  <TableCell>
                    <div className="font-medium">{app.profile?.full_name}</div>
                    <div className="text-sm text-muted-foreground">
                      {app.profile?.email}
                    </div>
                  </TableCell>
                  <TableCell>{app.internship?.title}</TableCell>
                  <TableCell>
                    {new Date(app.applied_at).toLocaleDateString()}
                  </TableCell>
                  <TableCell>{getStatusBadge(app.status)}</TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="h-8 w-8 p-0">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent>
                        <DropdownMenuItem onClick={() => openDetails(app)}>
                          View Details
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => openUpdateStatus(app)}
                        >
                          Update Status
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Details Dialog */}
      <Dialog open={isDetailsOpen} onOpenChange={setIsDetailsOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Application Details</DialogTitle>
          </DialogHeader>
          {selectedApplication && (
            <div className="grid gap-4 py-4">
              <div className="flex items-center gap-4">
                <User />
                <p>{selectedApplication.profile?.full_name}</p>
              </div>
              <div className="flex items-center gap-4">
                <Mail />
                <p>{selectedApplication.profile?.email}</p>
              </div>
              <div className="flex items-center gap-4">
                <Building />
                <p>{selectedApplication.internship?.title} at {selectedApplication.internship?.company}</p>
              </div>
              <div className="flex items-center gap-4">
                <FileText />
                <p className="font-bold">Cover Letter/Motivation:</p>
              </div>
              <p>{selectedApplication.cover_letter}</p>
               <div className="flex items-center gap-4">
                <FileText />
                <p className="font-bold">Resume:</p>
              </div>
              <a href={selectedApplication.resume_url} target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline">View Resume</a>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Update Status Dialog */}
      <Dialog open={isUpdateStatusOpen} onOpenChange={setIsUpdateStatusOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Update Application Status</DialogTitle>
            <DialogDescription>
              Change the status for the application from{' '}
              {selectedApplication?.profile?.full_name}.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <Label htmlFor="status">New Status</Label>
            <select
              id="status"
              value={newStatus}
              onChange={(e) =>
                setNewStatus(e.target.value as 'pending' | 'approved' | 'rejected')
              }
              className="w-full p-2 border rounded"
            >
              <option value="pending">Pending</option>
              <option value="approved">Approved</option>
              <option value="rejected">Rejected</option>
            </select>
          </div>
          {newStatus === 'rejected' && (
            <div className="py-4">
              <Label htmlFor="rejection_reason">Rejection Reason</Label>
              <Textarea
                id="rejection_reason"
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
              />
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsUpdateStatusOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleUpdateStatus}>Save</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
