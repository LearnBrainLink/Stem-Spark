'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Calendar, 
  Clock, 
  Users, 
  BookOpen, 
  Star, 
  MapPin, 
  Phone, 
  Mail,
  Plus,
  CheckCircle,
  XCircle,
  AlertCircle,
  RefreshCw,
  Video,
  MessageSquare,
  FileText
} from 'lucide-react';

interface TutoringSession {
  id: string;
  tutor_id: string;
  student_id: string;
  subject: string;
  topic: string;
  scheduled_date: string;
  scheduled_time: string;
  duration: number;
  status: 'scheduled' | 'in_progress' | 'completed' | 'cancelled';
  meeting_link?: string;
  notes?: string;
  rating?: number;
  feedback?: string;
  created_at: string;
  tutor_name: string;
  student_name: string;
}

interface Tutor {
  id: string;
  name: string;
  subjects: string[];
  rating: number;
  total_sessions: number;
  availability: string[];
  bio: string;
  hourly_rate: number;
  image_url?: string;
}

export default function TutoringPage() {
  const [sessions, setSessions] = useState<TutoringSession[]>([]);
  const [tutors, setTutors] = useState<Tutor[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showBookingDialog, setShowBookingDialog] = useState(false);
  const [selectedTutor, setSelectedTutor] = useState<Tutor | null>(null);
  const [bookingForm, setBookingForm] = useState({
    subject: '',
    topic: '',
    date: '',
    time: '',
    duration: 60,
    notes: ''
  });

  useEffect(() => {
    fetchTutoringData();
  }, []);

  const fetchTutoringData = async () => {
    try {
      setLoading(true);
      
      // Fetch user's tutoring sessions
      const sessionsResponse = await fetch('/api/tutoring/sessions');
      const sessionsData = await sessionsResponse.json();
      
      // Fetch available tutors
      const tutorsResponse = await fetch('/api/tutoring/tutors');
      const tutorsData = await tutorsResponse.json();

      if (sessionsResponse.ok) {
        setSessions(sessionsData.sessions || []);
      }
      
      if (tutorsResponse.ok) {
        setTutors(tutorsData.tutors || []);
      }
    } catch (err) {
      setError('Failed to fetch tutoring data');
      console.error('Error fetching tutoring data:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleBookSession = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedTutor || !bookingForm.subject || !bookingForm.topic || !bookingForm.date || !bookingForm.time) {
      setError('Please fill in all required fields');
      return;
    }

    try {
      const response = await fetch('/api/tutoring/sessions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          tutor_id: selectedTutor.id,
          subject: bookingForm.subject,
          topic: bookingForm.topic,
          scheduled_date: bookingForm.date,
          scheduled_time: bookingForm.time,
          duration: bookingForm.duration,
          notes: bookingForm.notes
        }),
      });

      const result = await response.json();

      if (result.success) {
        setShowBookingDialog(false);
        setSelectedTutor(null);
        setBookingForm({
          subject: '',
          topic: '',
          date: '',
          time: '',
          duration: 60,
          notes: ''
        });
        fetchTutoringData(); // Refresh data
      } else {
        setError(result.error || 'Failed to book session');
      }
    } catch (err) {
      setError('Failed to book session');
      console.error('Error booking session:', err);
    }
  };

  const handleCompleteSession = async (sessionId: string) => {
    try {
      const response = await fetch(`/api/tutoring/sessions/${sessionId}/complete`, {
        method: 'POST',
      });

      const result = await response.json();

      if (result.success) {
        fetchTutoringData(); // Refresh data
      } else {
        setError(result.error || 'Failed to complete session');
      }
    } catch (err) {
      setError('Failed to complete session');
      console.error('Error completing session:', err);
    }
  };

  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case 'scheduled': return 'secondary';
      case 'in_progress': return 'default';
      case 'completed': return 'default';
      case 'cancelled': return 'destructive';
      default: return 'outline';
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const formatTime = (timeString: string) => {
    return new Date(`2000-01-01T${timeString}`).toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    });
  };

  const upcomingSessions = sessions.filter(s => s.status === 'scheduled' || s.status === 'in_progress');
  const completedSessions = sessions.filter(s => s.status === 'completed');
  const cancelledSessions = sessions.filter(s => s.status === 'cancelled');

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Tutoring System</h1>
          <p className="text-gray-600 mt-1">Book sessions, connect with tutors, and track your progress</p>
        </div>
        <div className="flex flex-col sm:flex-row gap-3">
          <Button onClick={fetchTutoringData} disabled={loading}>
            <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
          <Button onClick={() => setShowBookingDialog(true)}>
            <Plus className="w-4 h-4 mr-2" />
            Book Session
          </Button>
        </div>
      </div>

      {/* Error Alert */}
      {error && (
        <Alert className="border-red-200 bg-red-50">
          <AlertCircle className="h-4 w-4 text-red-600" />
          <AlertDescription className="text-red-800">{error}</AlertDescription>
        </Alert>
      )}

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Sessions</CardTitle>
            <BookOpen className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{sessions.length}</div>
            <p className="text-xs text-muted-foreground">
              All time sessions
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Upcoming</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{upcomingSessions.length}</div>
            <p className="text-xs text-muted-foreground">
              Scheduled sessions
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Completed</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{completedSessions.length}</div>
            <p className="text-xs text-muted-foreground">
              Finished sessions
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Available Tutors</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{tutors.length}</div>
            <p className="text-xs text-muted-foreground">
              Active tutors
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <Tabs defaultValue="sessions" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="sessions">My Sessions</TabsTrigger>
          <TabsTrigger value="tutors">Find Tutors</TabsTrigger>
          <TabsTrigger value="schedule">Schedule</TabsTrigger>
        </TabsList>

        <TabsContent value="sessions" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>My Tutoring Sessions</CardTitle>
              <CardDescription>View and manage your tutoring sessions</CardDescription>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="flex items-center justify-center py-8">
                  <RefreshCw className="w-6 h-6 animate-spin mr-2" />
                  Loading sessions...
                </div>
              ) : sessions.length === 0 ? (
                <div className="text-center py-8">
                  <BookOpen className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600">No tutoring sessions found</p>
                  <Button onClick={() => setShowBookingDialog(true)} className="mt-4">
                    <Plus className="w-4 h-4 mr-2" />
                    Book Your First Session
                  </Button>
                </div>
              ) : (
                <div className="space-y-4">
                  {sessions.map((session) => (
                    <div key={session.id} className="border rounded-lg p-4 hover:bg-gray-50">
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <h3 className="font-semibold">{session.subject} - {session.topic}</h3>
                            <Badge variant={getStatusBadgeVariant(session.status)}>
                              {session.status.replace('_', ' ')}
                            </Badge>
                          </div>
                          <div className="text-sm text-gray-600 space-y-1">
                            <div className="flex items-center gap-2">
                              <Users className="w-4 h-4" />
                              <span>with {session.tutor_name}</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <Calendar className="w-4 h-4" />
                              <span>{formatDate(session.scheduled_date)} at {formatTime(session.scheduled_time)}</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <Clock className="w-4 h-4" />
                              <span>{session.duration} minutes</span>
                            </div>
                            {session.notes && (
                              <div className="flex items-center gap-2">
                                <FileText className="w-4 h-4" />
                                <span>{session.notes}</span>
                              </div>
                            )}
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          {session.status === 'scheduled' && (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleCompleteSession(session.id)}
                            >
                              <CheckCircle className="w-4 h-4 mr-2" />
                              Complete
                            </Button>
                          )}
                          {session.meeting_link && (
                            <Button variant="outline" size="sm" asChild>
                              <a href={session.meeting_link} target="_blank" rel="noopener noreferrer">
                                <Video className="w-4 h-4 mr-2" />
                                Join
                              </a>
                            </Button>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="tutors" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Available Tutors</CardTitle>
              <CardDescription>Browse and connect with qualified tutors</CardDescription>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="flex items-center justify-center py-8">
                  <RefreshCw className="w-6 h-6 animate-spin mr-2" />
                  Loading tutors...
                </div>
              ) : tutors.length === 0 ? (
                <div className="text-center py-8">
                  <Users className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600">No tutors available</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {tutors.map((tutor) => (
                    <Card key={tutor.id} className="hover:shadow-lg transition-shadow">
                      <CardHeader>
                        <div className="flex items-center gap-3">
                          <div className="w-12 h-12 bg-gray-200 rounded-full flex items-center justify-center">
                            {tutor.image_url ? (
                              <img src={tutor.image_url} alt={tutor.name} className="w-12 h-12 rounded-full" />
                            ) : (
                              <Users className="w-6 h-6 text-gray-500" />
                            )}
                          </div>
                          <div>
                            <CardTitle className="text-lg">{tutor.name}</CardTitle>
                            <div className="flex items-center gap-1">
                              <Star className="w-4 h-4 text-yellow-500 fill-current" />
                              <span className="text-sm text-gray-600">{tutor.rating.toFixed(1)}</span>
                              <span className="text-sm text-gray-500">({tutor.total_sessions} sessions)</span>
                            </div>
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-3">
                          <div>
                            <Label className="text-sm font-medium">Subjects</Label>
                            <div className="flex flex-wrap gap-1 mt-1">
                              {tutor.subjects.map((subject) => (
                                <Badge key={subject} variant="outline" className="text-xs">
                                  {subject}
                                </Badge>
                              ))}
                            </div>
                          </div>
                          <div>
                            <Label className="text-sm font-medium">Rate</Label>
                            <p className="text-sm text-gray-600">${tutor.hourly_rate}/hour</p>
                          </div>
                          <div>
                            <Label className="text-sm font-medium">Bio</Label>
                            <p className="text-sm text-gray-600 line-clamp-2">{tutor.bio}</p>
                          </div>
                          <Button 
                            className="w-full"
                            onClick={() => {
                              setSelectedTutor(tutor);
                              setShowBookingDialog(true);
                            }}
                          >
                            <Calendar className="w-4 h-4 mr-2" />
                            Book Session
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="schedule" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Schedule Overview</CardTitle>
              <CardDescription>View your upcoming and past sessions</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {/* Upcoming Sessions */}
                <div>
                  <h3 className="text-lg font-semibold mb-3">Upcoming Sessions</h3>
                  {upcomingSessions.length === 0 ? (
                    <p className="text-gray-600">No upcoming sessions</p>
                  ) : (
                    <div className="space-y-3">
                      {upcomingSessions.map((session) => (
                        <div key={session.id} className="flex items-center gap-4 p-3 bg-blue-50 rounded-lg">
                          <Calendar className="w-5 h-5 text-blue-600" />
                          <div className="flex-1">
                            <p className="font-medium">{session.subject} - {session.topic}</p>
                            <p className="text-sm text-gray-600">
                              {formatDate(session.scheduled_date)} at {formatTime(session.scheduled_time)}
                            </p>
                          </div>
                          <Badge variant="secondary">{session.tutor_name}</Badge>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Completed Sessions */}
                <div>
                  <h3 className="text-lg font-semibold mb-3">Completed Sessions</h3>
                  {completedSessions.length === 0 ? (
                    <p className="text-gray-600">No completed sessions</p>
                  ) : (
                    <div className="space-y-3">
                      {completedSessions.slice(0, 5).map((session) => (
                        <div key={session.id} className="flex items-center gap-4 p-3 bg-green-50 rounded-lg">
                          <CheckCircle className="w-5 h-5 text-green-600" />
                          <div className="flex-1">
                            <p className="font-medium">{session.subject} - {session.topic}</p>
                            <p className="text-sm text-gray-600">
                              {formatDate(session.scheduled_date)} with {session.tutor_name}
                            </p>
                          </div>
                          {session.rating && (
                            <div className="flex items-center gap-1">
                              <Star className="w-4 h-4 text-yellow-500 fill-current" />
                              <span className="text-sm">{session.rating}</span>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Booking Dialog */}
      <Dialog open={showBookingDialog} onOpenChange={setShowBookingDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Book Tutoring Session</DialogTitle>
            <DialogDescription>
              Schedule a session with {selectedTutor?.name || 'a tutor'}
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleBookSession} className="space-y-4">
            <div>
              <Label htmlFor="subject">Subject *</Label>
              <Input
                id="subject"
                value={bookingForm.subject}
                onChange={(e) => setBookingForm({ ...bookingForm, subject: e.target.value })}
                placeholder="e.g., Mathematics, Science"
                required
              />
            </div>
            <div>
              <Label htmlFor="topic">Topic *</Label>
              <Input
                id="topic"
                value={bookingForm.topic}
                onChange={(e) => setBookingForm({ ...bookingForm, topic: e.target.value })}
                placeholder="e.g., Algebra, Physics"
                required
              />
            </div>
            <div>
              <Label htmlFor="date">Date *</Label>
              <Input
                id="date"
                type="date"
                value={bookingForm.date}
                onChange={(e) => setBookingForm({ ...bookingForm, date: e.target.value })}
                required
              />
            </div>
            <div>
              <Label htmlFor="time">Time *</Label>
              <Input
                id="time"
                type="time"
                value={bookingForm.time}
                onChange={(e) => setBookingForm({ ...bookingForm, time: e.target.value })}
                required
              />
            </div>
            <div>
              <Label htmlFor="duration">Duration (minutes)</Label>
              <Select
                value={bookingForm.duration.toString()}
                onValueChange={(value) => setBookingForm({ ...bookingForm, duration: parseInt(value) })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="30">30 minutes</SelectItem>
                  <SelectItem value="60">1 hour</SelectItem>
                  <SelectItem value="90">1.5 hours</SelectItem>
                  <SelectItem value="120">2 hours</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="notes">Notes</Label>
              <Textarea
                id="notes"
                value={bookingForm.notes}
                onChange={(e) => setBookingForm({ ...bookingForm, notes: e.target.value })}
                placeholder="Any specific topics or questions you'd like to cover..."
                rows={3}
              />
            </div>
            <div className="flex gap-3 pt-4">
              <Button type="submit" className="flex-1">
                Book Session
              </Button>
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => setShowBookingDialog(false)}
              >
                Cancel
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
} 