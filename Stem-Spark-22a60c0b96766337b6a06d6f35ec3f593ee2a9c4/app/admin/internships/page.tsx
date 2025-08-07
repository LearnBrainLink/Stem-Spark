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
  Plus,
  Edit,
  Trash2,
  MoreHorizontal,
  AlertCircle,
} from 'lucide-react'

// Internship Management Page Component
export default function InternshipsPage() {
  const [internships, setInternships] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [currentInternship, setCurrentInternship] = useState<any | null>(null)
  const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false)

  useEffect(() => {
    fetchInternships()
  }, [])

  const getSupabaseClient = async () => {
    const { createClient } = await import('@supabase/supabase-js')
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!
    return createClient(supabaseUrl, supabaseServiceKey)
  }

  const fetchInternships = async () => {
    setLoading(true)
    setError(null)
    try {
      const supabase = await getSupabaseClient()
      const { data, error } = await supabase
        .from('internships')
        .select('*')
        .order('created_at', { ascending: false })
      if (error) throw error
      setInternships(data || [])
    } catch (err: any) {
      setError(err.message || 'Failed to fetch internships.')
    } finally {
      setLoading(false)
    }
  }

  const handleUpsertInternship = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!currentInternship) return

    try {
      const supabase = await getSupabaseClient()
      const { id, ...upsertData } = currentInternship
      
      // Ensure numeric fields are correctly formatted
      upsertData.max_participants = parseInt(upsertData.max_participants, 10) || 0;


      if (id) {
        // Update
        const { error } = await supabase.from('internships').update(upsertData).eq('id', id)
        if (error) throw error
      } else {
        // Create
        const { error } = await supabase.from('internships').insert(upsertData)
        if (error) throw error
      }
      
      await fetchInternships()
      setIsModalOpen(false)
      setCurrentInternship(null)
    } catch (err: any) {
      setError(err.message || 'Failed to save internship.')
    }
  }
  
  const handleDeleteInternship = async () => {
    if (!currentInternship?.id) return

    try {
      const supabase = await getSupabaseClient()
      const { error } = await supabase.from('internships').delete().eq('id', currentInternship.id)
      if (error) throw error
      
      await fetchInternships()
      setIsDeleteConfirmOpen(false)
      setCurrentInternship(null)
    } catch (err: any) {
      setError(err.message || 'Failed to delete internship.')
    }
  }

  const openModal = (internship: any | null = null) => {
    setCurrentInternship(internship || { title: '', description: '', company: '' })
    setIsModalOpen(true)
  }

  const openDeleteConfirm = (internship: any) => {
    setCurrentInternship(internship)
    setIsDeleteConfirmOpen(true)
  }

  if (loading) return <div>Loading internships...</div>
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
        <h1 className="text-3xl font-bold">Internship Management</h1>
        <Button onClick={() => openModal()}>
          <Plus className="mr-2 h-4 w-4" /> Add Internship
        </Button>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>All Internships</CardTitle>
          <CardDescription>A list of all available internships.</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Title</TableHead>
                <TableHead>Company</TableHead>
                <TableHead>Location</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {internships.map((internship) => (
                <TableRow key={internship.id}>
                  <TableCell className="font-medium">{internship.title}</TableCell>
                  <TableCell>{internship.company}</TableCell>
                  <TableCell>{internship.location}</TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="h-8 w-8 p-0">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent>
                        <DropdownMenuItem onClick={() => openModal(internship)}>
                          <Edit className="mr-2 h-4 w-4" /> Edit
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => openDeleteConfirm(internship)}>
                          <Trash2 className="mr-2 h-4 w-4" /> Delete
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
      
      {/* Add/Edit Internship Modal */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{currentInternship?.id ? 'Edit Internship' : 'Add New Internship'}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleUpsertInternship}>
            <div className="py-4 grid gap-4">
              <InputFields internship={currentInternship} setInternship={setCurrentInternship} />
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setIsModalOpen(false)}>Cancel</Button>
              <Button type="submit">Save</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
      
      {/* Delete Confirmation Dialog */}
      <Dialog open={isDeleteConfirmOpen} onOpenChange={setIsDeleteConfirmOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Are you sure?</DialogTitle>
            <AlertDescription>
              This action cannot be undone. This will permanently delete the internship "{currentInternship?.title}".
            </AlertDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDeleteConfirmOpen(false)}>Cancel</Button>
            <Button variant="destructive" onClick={handleDeleteInternship}>Delete</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

// Component for Input Fields in the modal
function InputFields({ internship, setInternship }: { internship: any, setInternship: Function }) {
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { id, value } = e.target
    setInternship({ ...internship, [id]: value })
  }

  return (
    <>
      <div>
        <Label htmlFor="title">Title</Label>
        <Input id="title" value={internship?.title || ''} onChange={handleChange} required />
      </div>
      <div>
        <Label htmlFor="company">Company</Label>
        <Input id="company" value={internship?.company || ''} onChange={handleChange} required />
      </div>
      <div>
        <Label htmlFor="location">Location</Label>
        <Input id="location" value={internship?.location || ''} onChange={handleChange} />
      </div>
      <div>
        <Label htmlFor="description">Description</Label>
        <Textarea id="description" value={internship?.description || ''} onChange={handleChange} />
      </div>
       <div>
        <Label htmlFor="duration">Duration</Label>
        <Input id="duration" value={internship?.duration || ''} onChange={handleChange} />
      </div>
      <div>
        <Label htmlFor="requirements">Requirements</Label>
        <Textarea id="requirements" value={internship?.requirements || ''} onChange={handleChange} />
      </div>
       <div>
        <Label htmlFor="application_deadline">Application Deadline</Label>
        <Input id="application_deadline" type="date" value={internship?.application_deadline || ''} onChange={handleChange} />
      </div>
       <div>
        <Label htmlFor="start_date">Start Date</Label>
        <Input id="start_date" type="date" value={internship?.start_date || ''} onChange={handleChange} />
      </div>
       <div>
        <Label htmlFor="end_date">End Date</Label>
        <Input id="end_date" type="date" value={internship?.end_date || ''} onChange={handleChange} />
      </div>
      <div>
        <Label htmlFor="max_participants">Max Participants</Label>
        <Input id="max_participants" type="number" value={internship?.max_participants || ''} onChange={handleChange} />
      </div>
    </>
  )
}
