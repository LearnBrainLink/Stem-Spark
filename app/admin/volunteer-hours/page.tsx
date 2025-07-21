'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Clock, CheckCircle, XCircle, AlertCircle, TrendingUp, Users, FileText, Calendar } from 'lucide-react';

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
  intern: {
    id: string;
    full_name: string;
    email: string;
    avatar_url?: string;
  };
}

interface AdminStats {
  total_pending: number;
  total_approved: number;
  total_rejected: number;
  total_hours_approved: number;
  recent_submissions: number;
  average_approval_time: number;
}

export default function AdminVolunteerHoursPage() {
  const [volunteerHours, setVolunteerHours] = useState<VolunteerHours[]>([]);
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedHours, setSelectedHours] = useState<VolunteerHours | null>(null);
  const [showRejectDialog, setShowRejectDialog] = useState(false);
  const [rejectionReason, setRejectionReason] = useState('');
  const [processing, setProcessing] = useState(false);

  useEffect(() => {
    fetchVolunteerData();
  }, []);

  const fetchVolunteerData = async () => {
    try {
      setLoading(true);
      
      // Fetch pending volunteer hours
      const hoursResponse = await fetch('/api/volunteer-hours/pending');
      const hoursData = await hoursResponse.json();
      
      // Fetch admin stats
      const statsResponse = await fetch('/api/admin/volunteer-hours/stats');
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

  const handleApprove = async (hoursId: string) => {
    try {
      setProcessing(true);
      setError(null);

      const adminId = 'current-admin-id'; // Replace with actual admin ID
      
      const response = await fetch('/api/volunteer-hours/approve', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          hours_id: hoursId,
          approved_by: adminId
        }),
      });

      const result = await response.json();

      if (result.success) {
        fetchVolunteerData(); // Refresh data
      } else {
        setError(result.error || 'Failed to approve volunteer hours');
      }
    } catch (err) {
      setError('Failed to approve volunteer hours');
      console.error('Error approving hours:', err);
    } finally {
      setProcessing(false);
    }
  };

  const handleReject = async () => {
    if (!selectedHours || !rejectionReason.trim()) {
      setError('Please provide a rejection reason');
      return;
    }

    try {
      setProcessing(true);
      setError(null);

      const adminId = 'current-admin-id'; // Replace with actual admin ID
      
      const response = await fetch('/api/volunteer-hours/reject', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          hours_id: selectedHours.id,
          rejected_by: adminId,
          rejection_reason: rejectionReason.trim()
        }),
      });

      const result = await response.json();

      if (result.success) {
        setShowRejectDialog(false);
        setSelectedHours(null);
        setRejectionReason('');
        fetchVolunteerData(); // Refresh data
      } else {
        setError(result.error || 'Failed to reject volunteer hours');
      }
    } catch (err) {
      setError('Failed to reject volunteer hours');
      console.error('Error rejecting hours:', err);
    } finally {
      setProcessing(false);
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

  const getActivityTypeColor = (activityType: string) => {
    const colors: Record<string, string> = {
      'Tutoring Session': 'bg-blue-100 text-blue-800',
      'Event Assistance': 'bg-purple-100 text-purple-800',
      'Mentoring': 'bg-green-100 text-green-800',
      'Administrative Support': 'bg-orange-100 text-orange-800',
      'Content Creation': 'bg-pink-100 text-pink-800',
      'Other': 'bg-gray-100 text-gray-800'
    };
    return colors[activityType] || 'bg-gray-100 text-gray-800';
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
          <h1 className="text-3xl font-bold">Volunteer Hours Management</h1>
          <p className="text-muted-foreground">Review and approve intern volunteer hours</p>
        </div>
      </div>

      {/* Stats Cards */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Pending Reviews</CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-yellow-600">{stats.total_pending}</div>
              <p className="text-xs text-muted-foreground">
                Awaiting approval
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Approved</CardTitle>
              <CheckCircle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">{stats.total_approved}</div>
              <p className="text-xs text-muted-foreground">
                {stats.total_hours_approved} hours approved
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
                Last 24 hours
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Avg Approval Time</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.average_approval_time}</div>
              <p className="text-xs text-muted-foreground">
                Hours to approve
              </p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Tabs */}
      <Tabs defaultValue="pending" className="space-y-4">
        <TabsList>
          <TabsTrigger value="pending">Pending Review ({volunteerHours.filter(h => h.status === 'pending').length})</TabsTrigger>
          <TabsTrigger value="recent">Recent Activity</TabsTrigger>
        </TabsList>

        <TabsContent value="pending" className="space-y-4">
          {volunteerHours.filter(h => h.status === 'pending').length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-8">
                <CheckCircle className="h-12 w-12 text-green-600 mb-4" />
                <p className="text-muted-foreground">No pending volunteer hours to review</p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {volunteerHours
                .filter(h => h.status === 'pending')
                .map((hours) => (
                  <Card key={hours.id}>
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
                            <Users className="w-5 h-5 text-blue-600" />
                          </div>
                          <div>
                            <CardTitle className="text-lg">{hours.intern.full_name}</CardTitle>
                            <CardDescription>{hours.intern.email}</CardDescription>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge className={getActivityTypeColor(hours.activity_type)}>
                            {hours.activity_type}
                          </Badge>
                          {getStatusBadge(hours.status)}
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        <div>
                          <h4 className="font-medium mb-2">Activity Details</h4>
                          <p className="text-sm text-muted-foreground">{hours.activity_description}</p>
                          {hours.description && (
                            <p className="text-sm text-muted-foreground mt-2">
                              <strong>Notes:</strong> {hours.description}
                            </p>
                          )}
                        </div>
                        
                        <div className="grid grid-cols-3 gap-4">
                          <div>
                            <span className="text-sm font-medium">Hours:</span>
                            <p className="text-lg font-bold">{hours.hours}</p>
                          </div>
                          <div>
                            <span className="text-sm font-medium">Date:</span>
                            <p className="text-sm">{formatDate(hours.activity_date)}</p>
                          </div>
                          <div>
                            <span className="text-sm font-medium">Submitted:</span>
                            <p className="text-sm">{formatDate(hours.created_at)}</p>
                          </div>
                        </div>

                        <div className="flex gap-2">
                          <Button 
                            onClick={() => handleApprove(hours.id)}
                            disabled={processing}
                            className="bg-green-600 hover:bg-green-700"
                          >
                            <CheckCircle className="w-4 h-4 mr-2" />
                            Approve
                          </Button>
                          <Button 
                            variant="outline"
                            onClick={() => {
                              setSelectedHours(hours);
                              setShowRejectDialog(true);
                            }}
                            disabled={processing}
                          >
                            <XCircle className="w-4 h-4 mr-2" />
                            Reject
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="recent" className="space-y-4">
          <div className="space-y-4">
            {volunteerHours.length === 0 ? (
              <Card>
                <CardContent className="flex flex-col items-center justify-center py-8">
                  <FileText className="h-12 w-12 text-muted-foreground mb-4" />
                  <p className="text-muted-foreground">No volunteer hours found</p>
                </CardContent>
              </Card>
            ) : (
              volunteerHours.map((hours) => (
                <Card key={hours.id}>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
                          <Users className="w-5 h-5 text-blue-600" />
                        </div>
                        <div>
                          <CardTitle className="text-lg">{hours.intern.full_name}</CardTitle>
                          <CardDescription>{hours.intern.email}</CardDescription>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge className={getActivityTypeColor(hours.activity_type)}>
                          {hours.activity_type}
                        </Badge>
                        {getStatusBadge(hours.status)}
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div>
                        <h4 className="font-medium mb-2">Activity Details</h4>
                        <p className="text-sm text-muted-foreground">{hours.activity_description}</p>
                        {hours.description && (
                          <p className="text-sm text-muted-foreground mt-2">
                            <strong>Notes:</strong> {hours.description}
                          </p>
                        )}
                      </div>
                      
                      <div className="grid grid-cols-3 gap-4">
                        <div>
                          <span className="text-sm font-medium">Hours:</span>
                          <p className="text-lg font-bold">{hours.hours}</p>
                        </div>
                        <div>
                          <span className="text-sm font-medium">Date:</span>
                          <p className="text-sm">{formatDate(hours.activity_date)}</p>
                        </div>
                        <div>
                          <span className="text-sm font-medium">Status:</span>
                          <p className="text-sm">{formatDate(hours.created_at)}</p>
                        </div>
                      </div>

                      {hours.rejection_reason && (
                        <Alert>
                          <AlertCircle className="h-4 w-4" />
                          <AlertDescription>
                            <strong>Rejection Reason:</strong> {hours.rejection_reason}
                          </AlertDescription>
                        </Alert>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </TabsContent>
      </Tabs>

      {/* Reject Dialog */}
      <Dialog open={showRejectDialog} onOpenChange={setShowRejectDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Reject Volunteer Hours</DialogTitle>
            <DialogDescription>
              Please provide a reason for rejecting this volunteer hours submission.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            {selectedHours && (
              <div className="p-4 border rounded-lg">
                <h4 className="font-medium mb-2">{selectedHours.intern.full_name}</h4>
                <p className="text-sm text-muted-foreground">{selectedHours.activity_description}</p>
                <p className="text-sm font-medium mt-2">{selectedHours.hours} hours • {formatDate(selectedHours.activity_date)}</p>
              </div>
            )}
            
            <div>
              <Label htmlFor="rejection-reason">Rejection Reason *</Label>
              <Textarea
                id="rejection-reason"
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
                placeholder="Please provide a clear reason for rejection..."
                rows={3}
                required
              />
            </div>

            {error && (
              <Alert>
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <div className="flex justify-end gap-2">
              <Button 
                variant="outline" 
                onClick={() => {
                  setShowRejectDialog(false);
                  setSelectedHours(null);
                  setRejectionReason('');
                }}
              >
                Cancel
              </Button>
              <Button 
                onClick={handleReject}
                disabled={processing || !rejectionReason.trim()}
                variant="destructive"
              >
                {processing ? 'Rejecting...' : 'Reject Hours'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
} 