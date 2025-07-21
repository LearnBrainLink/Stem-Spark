'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Clock, Plus, CheckCircle, XCircle, AlertCircle, TrendingUp, Calendar, FileText } from 'lucide-react';

interface VolunteerHours {
  id: string;
  activity_date: string;
  activity_type: string;
  activity_description: string;
  hours: number;
  description?: string;
  status: 'pending' | 'approved' | 'rejected';
  rejection_reason?: string;
  created_at: string;
  approved_at?: string;
}

interface VolunteerStats {
  total_hours: number;
  approved_hours: number;
  pending_hours: number;
  rejected_hours: number;
  recent_submissions: number;
  average_hours_per_month: number;
}

export default function InternVolunteerHoursPage() {
  const [volunteerHours, setVolunteerHours] = useState<VolunteerHours[]>([]);
  const [stats, setStats] = useState<VolunteerStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showSubmitDialog, setShowSubmitDialog] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // Form state
  const [formData, setFormData] = useState({
    activity_date: '',
    activity_type: '',
    activity_description: '',
    hours: '',
    description: ''
  });

  useEffect(() => {
    fetchVolunteerData();
  }, []);

  const fetchVolunteerData = async () => {
    try {
      setLoading(true);
      
      // Get current user ID (in a real app, this would come from auth context)
      const userId = 'current-user-id'; // Replace with actual user ID
      
      // Fetch volunteer hours
      const hoursResponse = await fetch(`/api/volunteer-hours/user/${userId}`);
      const hoursData = await hoursResponse.json();
      
      // Fetch stats
      const statsResponse = await fetch(`/api/volunteer-hours/stats/${userId}`);
      const statsData = await statsResponse.json();

      if (hoursResponse.ok) {
        setVolunteerHours(hoursData.data || []);
      }
      
      if (statsResponse.ok) {
        setStats(statsData.data);
      }
    } catch (err) {
      setError('Failed to fetch volunteer hours data');
      console.error('Error fetching data:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitHours = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.activity_date || !formData.activity_type || !formData.activity_description || !formData.hours) {
      setError('Please fill in all required fields');
      return;
    }

    const hours = parseFloat(formData.hours);
    if (hours <= 0 || hours > 24) {
      setError('Hours must be between 0 and 24');
      return;
    }

    try {
      setSubmitting(true);
      setError(null);

      const userId = 'current-user-id'; // Replace with actual user ID
      
      const response = await fetch('/api/volunteer-hours/submit', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          intern_id: userId,
          activity_date: formData.activity_date,
          activity_type: formData.activity_type,
          activity_description: formData.activity_description,
          hours: hours,
          description: formData.description
        }),
      });

      const result = await response.json();

      if (result.success) {
        setShowSubmitDialog(false);
        setFormData({
          activity_date: '',
          activity_type: '',
          activity_description: '',
          hours: '',
          description: ''
        });
        fetchVolunteerData(); // Refresh data
      } else {
        setError(result.error || 'Failed to submit volunteer hours');
      }
    } catch (err) {
      setError('Failed to submit volunteer hours');
      console.error('Error submitting hours:', err);
    } finally {
      setSubmitting(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'approved':
        return <Badge className="bg-green-100 text-green-800"><CheckCircle className="w-3 h-3 mr-1" />Approved</Badge>;
      case 'rejected':
        return <Badge className="bg-red-100 text-red-800"><XCircle className="w-3 h-3 mr-1" />Rejected</Badge>;
      case 'pending':
        return <Badge className="bg-yellow-100 text-yellow-800"><Clock className="w-3 h-3 mr-1" />Pending</Badge>;
      default:
        return <Badge className="bg-gray-100 text-gray-800">{status}</Badge>;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Volunteer Hours</h1>
          <p className="text-muted-foreground">Track and submit your volunteer activities</p>
        </div>
        <Dialog open={showSubmitDialog} onOpenChange={setShowSubmitDialog}>
          <DialogTrigger asChild>
            <Button className="flex items-center gap-2">
              <Plus className="w-4 h-4" />
              Submit Hours
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle>Submit Volunteer Hours</DialogTitle>
              <DialogDescription>
                Submit your volunteer hours for approval. Please provide detailed information about your activities.
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmitHours} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="activity_date">Activity Date *</Label>
                  <Input
                    id="activity_date"
                    type="date"
                    value={formData.activity_date}
                    onChange={(e) => setFormData({ ...formData, activity_date: e.target.value })}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="hours">Hours *</Label>
                  <Input
                    id="hours"
                    type="number"
                    step="0.5"
                    min="0"
                    max="24"
                    value={formData.hours}
                    onChange={(e) => setFormData({ ...formData, hours: e.target.value })}
                    placeholder="2.5"
                    required
                  />
                </div>
              </div>
              
              <div>
                <Label htmlFor="activity_type">Activity Type *</Label>
                <Select value={formData.activity_type} onValueChange={(value) => setFormData({ ...formData, activity_type: value })}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select activity type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Tutoring Session">Tutoring Session</SelectItem>
                    <SelectItem value="Event Assistance">Event Assistance</SelectItem>
                    <SelectItem value="Mentoring">Mentoring</SelectItem>
                    <SelectItem value="Administrative Support">Administrative Support</SelectItem>
                    <SelectItem value="Content Creation">Content Creation</SelectItem>
                    <SelectItem value="Other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="activity_description">Activity Description *</Label>
                <Textarea
                  id="activity_description"
                  value={formData.activity_description}
                  onChange={(e) => setFormData({ ...formData, activity_description: e.target.value })}
                  placeholder="Describe what you did during this volunteer activity..."
                  required
                />
              </div>

              <div>
                <Label htmlFor="description">Additional Notes</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Any additional details or reflections..."
                />
              </div>

              {error && (
                <Alert>
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              <div className="flex justify-end gap-2">
                <Button type="button" variant="outline" onClick={() => setShowSubmitDialog(false)}>
                  Cancel
                </Button>
                <Button type="submit" disabled={submitting}>
                  {submitting ? 'Submitting...' : 'Submit Hours'}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Stats Cards */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Hours</CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.total_hours}</div>
              <p className="text-xs text-muted-foreground">
                {stats.approved_hours} approved
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Pending Hours</CardTitle>
              <AlertCircle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-yellow-600">{stats.pending_hours}</div>
              <p className="text-xs text-muted-foreground">
                Awaiting approval
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Monthly Average</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.average_hours_per_month}</div>
              <p className="text-xs text-muted-foreground">
                Hours per month
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Recent Submissions</CardTitle>
              <FileText className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.recent_submissions}</div>
              <p className="text-xs text-muted-foreground">
                Last 30 days
              </p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Tabs */}
      <Tabs defaultValue="all" className="space-y-4">
        <TabsList>
          <TabsTrigger value="all">All Hours</TabsTrigger>
          <TabsTrigger value="pending">Pending</TabsTrigger>
          <TabsTrigger value="approved">Approved</TabsTrigger>
          <TabsTrigger value="rejected">Rejected</TabsTrigger>
        </TabsList>

        <TabsContent value="all" className="space-y-4">
          <VolunteerHoursList hours={volunteerHours} />
        </TabsContent>

        <TabsContent value="pending" className="space-y-4">
          <VolunteerHoursList hours={volunteerHours.filter(h => h.status === 'pending')} />
        </TabsContent>

        <TabsContent value="approved" className="space-y-4">
          <VolunteerHoursList hours={volunteerHours.filter(h => h.status === 'approved')} />
        </TabsContent>

        <TabsContent value="rejected" className="space-y-4">
          <VolunteerHoursList hours={volunteerHours.filter(h => h.status === 'rejected')} />
        </TabsContent>
      </Tabs>
    </div>
  );
}

function VolunteerHoursList({ hours }: { hours: VolunteerHours[] }) {
  if (hours.length === 0) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center justify-center py-8">
          <FileText className="h-12 w-12 text-muted-foreground mb-4" />
          <p className="text-muted-foreground">No volunteer hours found</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {hours.map((hour) => (
        <Card key={hour.id}>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-lg">{hour.activity_type}</CardTitle>
                <CardDescription>
                  {formatDate(hour.activity_date)} • {hour.hours} hours
                </CardDescription>
              </div>
              {getStatusBadge(hour.status)}
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-2">
              {hour.activity_description}
            </p>
            {hour.description && (
              <p className="text-sm text-muted-foreground mb-2">
                <strong>Notes:</strong> {hour.description}
              </p>
            )}
            {hour.rejection_reason && (
              <Alert>
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  <strong>Rejection Reason:</strong> {hour.rejection_reason}
                </AlertDescription>
              </Alert>
            )}
            <div className="flex items-center text-xs text-muted-foreground mt-2">
              <Calendar className="w-3 h-3 mr-1" />
              Submitted on {formatDate(hour.created_at)}
              {hour.approved_at && (
                <>
                  <span className="mx-2">•</span>
                  <CheckCircle className="w-3 h-3 mr-1" />
                  Approved on {formatDate(hour.approved_at)}
                </>
              )}
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
} 