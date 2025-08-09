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
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
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
import { Badge } from '@/components/ui/badge'
import {
  Plus,
  Edit,
  Trash2,
  MoreHorizontal,
  AlertCircle,
  RefreshCw,
  Calendar,
  Users,
  Clock,
} from 'lucide-react'
import { Skeleton } from '@/components/ui/skeleton'

interface Internship {
  id: string
  title: string
  description: string
  department: string
  requirements: string[]
  duration_weeks: number
  start_date: string
  end_date: string
  application_deadline: string
  max_applicants: number
  current_applicants: number
  status: 'active' | 'inactive' | 'closed' | 'draft'
  created_by: string
  created_at: string
  updated_at: string
}

export default function InternshipsPage() {
  const [internships, setInternships] = useState<Internship[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [selectedInternship, setSelectedInternship] = useState<Internship | null>(null)

  useEffect(() => {
    fetchInternships()
  }, [])

  const fetchInternships = async () => {
    try {
      setLoading(true)
      setError(null)
      
      const response = await fetch('/api/admin/internships')
      if (!response.ok) {
        throw new Error('Failed to fetch internships')
      }
      
      const data = await response.json()
      setInternships(data.internships || [])
    } catch (err) {
      console.error('Error fetching internships:', err)
      setError(err instanceof Error ? err.message : 'Failed to fetch internships')
    } finally {
      setLoading(false)
    }
  }

  const handleCreateInternship = async (formData: FormData) => {
    try {
      setError(null)
      setSuccess(null)

      const requirements = (formData.get('requirements') as string).split('\n').filter(req => req.trim())
      
      const internshipData = {
        title: formData.get('title') as string,
        description: formData.get('description') as string,
        department: formData.get('department') as string,
        requirements,
        duration_weeks: parseInt(formData.get('duration_weeks') as string),
        start_date: formData.get('start_date') as string,
        end_date: formData.get('end_date') as string,
        application_deadline: formData.get('application_deadline') as string,
        max_applicants: parseInt(formData.get('max_applicants') as string),
        status: formData.get('status') as string,
        created_by: 'admin' // TODO: Get from auth context
      }

      const response = await fetch('/api/admin/internships', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(internshipData),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to create internship')
      }

      setSuccess('Internship created successfully!')
      setIsCreateDialogOpen(false)
      await fetchInternships()
    } catch (err) {
      console.error('Error creating internship:', err)
      setError(err instanceof Error ? err.message : 'Failed to create internship')
    }
  }

  const handleUpdateInternship = async (formData: FormData) => {
    if (!selectedInternship) return

    try {
      setError(null)
      setSuccess(null)

      const requirements = (formData.get('requirements') as string).split('\n').filter(req => req.trim())
      
      const updateData = {
        id: selectedInternship.id,
        title: formData.get('title') as string,
        description: formData.get('description') as string,
        department: formData.get('department') as string,
        requirements,
        duration_weeks: parseInt(formData.get('duration_weeks') as string),
        start_date: formData.get('start_date') as string,
        end_date: formData.get('end_date') as string,
        application_deadline: formData.get('application_deadline') as string,
        max_applicants: parseInt(formData.get('max_applicants') as string),
        status: formData.get('status') as string,
      }

      const response = await fetch('/api/admin/internships', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updateData),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to update internship')
      }

      setSuccess('Internship updated successfully!')
      setIsEditDialogOpen(false)
      setSelectedInternship(null)
      await fetchInternships()
    } catch (err) {
      console.error('Error updating internship:', err)
      setError(err instanceof Error ? err.message : 'Failed to update internship')
    }
  }

  const handleDeleteInternship = async (id: string) => {
    if (!confirm('Are you sure you want to delete this internship?')) return

    try {
      setError(null)
      setSuccess(null)

      const response = await fetch(`/api/admin/internships?id=${id}`, {
        method: 'DELETE',
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to delete internship')
      }

      setSuccess('Internship deleted successfully!')
      await fetchInternships()
    } catch (err) {
      console.error('Error deleting internship:', err)
      setError(err instanceof Error ? err.message : 'Failed to delete internship')
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800'
      case 'inactive': return 'bg-gray-100 text-gray-800'
      case 'closed': return 'bg-red-100 text-red-800'
      case 'draft': return 'bg-yellow-100 text-yellow-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString()
  }

  if (loading && internships.length === 0) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold tracking-tight">Internship Management</h1>
          <Skeleton className="h-10 w-32" />
        </div>
        
        <Card>
          <CardContent className="p-6">
            <div className="space-y-4">
              {Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="flex items-center space-x-4">
                  <Skeleton className="h-12 w-12" />
                  <div className="space-y-2 flex-1">
                    <Skeleton className="h-4 w-40" />
                    <Skeleton className="h-3 w-60" />
                  </div>
                  <Skeleton className="h-8 w-24" />
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Internship Management</h1>
          <p className="text-muted-foreground">Create and manage internship opportunities</p>
        </div>
        
        <div className="flex gap-2">
          <Button onClick={fetchInternships} variant="outline" size="sm">
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
          
          <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
            <Button onClick={() => setIsCreateDialogOpen(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Create Internship
            </Button>
            
            <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Create New Internship</DialogTitle>
              </DialogHeader>
              
              <form action={handleCreateInternship} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="title">Title</Label>
                    <Input id="title" name="title" placeholder="Internship title" required />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="department">Department</Label>
                    <Input id="department" name="department" placeholder="Department" required />
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="description">Description</Label>
                  <Textarea id="description" name="description" placeholder="Internship description" required />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="requirements">Requirements (one per line)</Label>
                  <Textarea id="requirements" name="requirements" placeholder="Requirement 1&#10;Requirement 2&#10;..." />
                </div>
                
                <div className="grid grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="duration_weeks">Duration (weeks)</Label>
                    <Input id="duration_weeks" name="duration_weeks" type="number" min="1" placeholder="8" required />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="max_applicants">Max Applicants</Label>
                    <Input id="max_applicants" name="max_applicants" type="number" min="1" placeholder="10" required />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="status">Status</Label>
                    <Select name="status" defaultValue="draft" required>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="draft">Draft</SelectItem>
                        <SelectItem value="active">Active</SelectItem>
                        <SelectItem value="inactive">Inactive</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                
                <div className="grid grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="start_date">Start Date</Label>
                    <Input id="start_date" name="start_date" type="date" required />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="end_date">End Date</Label>
                    <Input id="end_date" name="end_date" type="date" required />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="application_deadline">Application Deadline</Label>
                    <Input id="application_deadline" name="application_deadline" type="date" required />
                  </div>
                </div>
                
                <DialogFooter>
                  <Button type="button" variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
                    Cancel
                  </Button>
                  <Button type="submit">Create Internship</Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Messages */}
      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {success && (
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Success</AlertTitle>
          <AlertDescription>{success}</AlertDescription>
        </Alert>
      )}

      {/* Internships Table */}
      <Card>
        <CardHeader>
          <CardTitle>Internships ({internships.length})</CardTitle>
          <CardDescription>
            Manage internship opportunities and applications
          </CardDescription>
        </CardHeader>
        <CardContent>
          {internships.length === 0 ? (
            <div className="text-center py-8">
              <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">No internships yet</h3>
              <p className="text-muted-foreground mb-4">
                Create your first internship to get started
              </p>
              <Button onClick={() => setIsCreateDialogOpen(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Create First Internship
              </Button>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Title</TableHead>
                  <TableHead>Department</TableHead>
                  <TableHead>Duration</TableHead>
                  <TableHead>Applicants</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Deadline</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {internships.map((internship) => (
                  <TableRow key={internship.id}>
                    <TableCell>
                      <div>
                        <div className="font-medium">{internship.title}</div>
                        <div className="text-sm text-muted-foreground line-clamp-1">
                          {internship.description}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>{internship.department}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        {internship.duration_weeks} weeks
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        <Users className="h-3 w-3" />
                        {internship.current_applicants || 0} / {internship.max_applicants}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge className={getStatusColor(internship.status)}>
                        {internship.status}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        {formatDate(internship.application_deadline)}
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" className="h-8 w-8 p-0">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem
                            onClick={() => {
                              setSelectedInternship(internship)
                              setIsEditDialogOpen(true)
                            }}
                          >
                            <Edit className="mr-2 h-4 w-4" />
                            Edit
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => handleDeleteInternship(internship.id)}
                            className="text-red-600"
                          >
                            <Trash2 className="mr-2 h-4 w-4" />
                            Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Edit Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Internship</DialogTitle>
          </DialogHeader>
          
          {selectedInternship && (
            <form action={handleUpdateInternship} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="edit-title">Title</Label>
                  <Input 
                    id="edit-title" 
                    name="title" 
                    defaultValue={selectedInternship.title}
                    required 
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="edit-department">Department</Label>
                  <Input 
                    id="edit-department" 
                    name="department" 
                    defaultValue={selectedInternship.department}
                    required 
                  />
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="edit-description">Description</Label>
                <Textarea 
                  id="edit-description" 
                  name="description" 
                  defaultValue={selectedInternship.description}
                  required 
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="edit-requirements">Requirements (one per line)</Label>
                <Textarea 
                  id="edit-requirements" 
                  name="requirements" 
                  defaultValue={selectedInternship.requirements.join('\n')}
                />
              </div>
              
              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="edit-duration_weeks">Duration (weeks)</Label>
                  <Input 
                    id="edit-duration_weeks" 
                    name="duration_weeks" 
                    type="number" 
                    min="1" 
                    defaultValue={selectedInternship.duration_weeks}
                    required 
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="edit-max_applicants">Max Applicants</Label>
                  <Input 
                    id="edit-max_applicants" 
                    name="max_applicants" 
                    type="number" 
                    min="1" 
                    defaultValue={selectedInternship.max_applicants}
                    required 
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="edit-status">Status</Label>
                  <Select name="status" defaultValue={selectedInternship.status} required>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="draft">Draft</SelectItem>
                      <SelectItem value="active">Active</SelectItem>
                      <SelectItem value="inactive">Inactive</SelectItem>
                      <SelectItem value="closed">Closed</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="edit-start_date">Start Date</Label>
                  <Input 
                    id="edit-start_date" 
                    name="start_date" 
                    type="date" 
                    defaultValue={selectedInternship.start_date}
                    required 
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="edit-end_date">End Date</Label>
                  <Input 
                    id="edit-end_date" 
                    name="end_date" 
                    type="date" 
                    defaultValue={selectedInternship.end_date}
                    required 
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="edit-application_deadline">Application Deadline</Label>
                  <Input 
                    id="edit-application_deadline" 
                    name="application_deadline" 
                    type="date" 
                    defaultValue={selectedInternship.application_deadline}
                    required 
                  />
                </div>
              </div>
              
              <DialogFooter>
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => {
                    setIsEditDialogOpen(false)
                    setSelectedInternship(null)
                  }}
                >
                  Cancel
                </Button>
                <Button type="submit">Update Internship</Button>
              </DialogFooter>
            </form>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}