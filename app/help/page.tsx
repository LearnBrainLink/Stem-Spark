'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  Search, 
  BookOpen, 
  Users, 
  Clock, 
  MessageSquare, 
  Calendar,
  HelpCircle,
  Video,
  FileText,
  ExternalLink,
  ChevronRight,
  Star,
  Lightbulb,
  AlertCircle
} from 'lucide-react';

interface HelpArticle {
  id: string;
  title: string;
  category: string;
  content: string;
  tags: string[];
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  videoUrl?: string;
  lastUpdated: string;
}

const helpArticles: HelpArticle[] = [
  {
    id: 'getting-started',
    title: 'Getting Started with STEM Spark Academy',
    category: 'Getting Started',
    content: `
      <h3>Welcome to STEM Spark Academy!</h3>
      <p>This guide will help you get started with our platform and make the most of your experience.</p>
      
      <h4>Step 1: Account Setup</h4>
      <ol>
        <li>Complete your profile with accurate information</li>
        <li>Upload a profile picture (optional but recommended)</li>
        <li>Set your preferences and interests</li>
        <li>Review and accept our community guidelines</li>
      </ol>
      
      <h4>Step 2: Explore Features</h4>
      <ul>
        <li><strong>Dashboard:</strong> View your personalized dashboard with key metrics</li>
        <li><strong>Messaging:</strong> Connect with other members through our real-time chat system</li>
        <li><strong>Volunteer Hours:</strong> Track and submit your volunteer activities</li>
        <li><strong>Tutoring:</strong> Book sessions with qualified tutors or offer tutoring services</li>
      </ul>
      
      <h4>Step 3: Join the Community</h4>
      <p>Start by joining relevant channels and introducing yourself to the community.</p>
    `,
    tags: ['getting-started', 'account', 'profile'],
    difficulty: 'beginner',
    lastUpdated: '2024-01-15'
  },
  {
    id: 'volunteer-hours',
    title: 'How to Submit and Track Volunteer Hours',
    category: 'Volunteer Hours',
    content: `
      <h3>Volunteer Hours Management</h3>
      <p>Learn how to submit, track, and manage your volunteer hours effectively.</p>
      
      <h4>Submitting Volunteer Hours</h4>
      <ol>
        <li>Navigate to your Intern Dashboard</li>
        <li>Click on "Volunteer Hours" in the sidebar</li>
        <li>Click "Submit New Hours" button</li>
        <li>Fill out the form with the following information:
          <ul>
            <li>Activity Type (e.g., Tutoring, Event Support, Content Creation)</li>
            <li>Activity Date</li>
            <li>Number of Hours</li>
            <li>Description of activities performed</li>
            <li>Any supporting documentation (optional)</li>
          </ul>
        </li>
        <li>Click "Submit" to send for approval</li>
      </ol>
      
      <h4>Tracking Your Hours</h4>
      <ul>
        <li>View all submitted hours in your dashboard</li>
        <li>Check the status: Pending, Approved, or Rejected</li>
        <li>See your total approved hours and progress toward goals</li>
        <li>Download reports for your records</li>
      </ul>
      
      <h4>Best Practices</h4>
      <ul>
        <li>Submit hours within 48 hours of completing activities</li>
        <li>Provide detailed descriptions to help with approval</li>
        <li>Keep supporting documentation when possible</li>
        <li>Contact admins if you have questions about specific activities</li>
      </ul>
    `,
    tags: ['volunteer-hours', 'submission', 'tracking'],
    difficulty: 'beginner',
    videoUrl: 'https://example.com/volunteer-hours-guide',
    lastUpdated: '2024-01-10'
  },
  {
    id: 'tutoring-system',
    title: 'Using the Tutoring System',
    category: 'Tutoring',
    content: `
      <h3>Tutoring System Guide</h3>
      <p>Learn how to book tutoring sessions and manage your learning experience.</p>
      
      <h4>For Students</h4>
      <h5>Booking a Session</h5>
      <ol>
        <li>Go to the Tutoring page</li>
        <li>Browse available tutors and their subjects</li>
        <li>Select a tutor and click "Book Session"</li>
        <li>Choose your subject and topic</li>
        <li>Select date and time from available slots</li>
        <li>Add any specific notes or questions</li>
        <li>Confirm your booking</li>
      </ol>
      
      <h5>During the Session</h5>
      <ul>
        <li>Join the session using the provided link</li>
        <li>Have your questions and materials ready</li>
        <li>Take notes during the session</li>
        <li>Provide feedback after completion</li>
      </ul>
      
      <h4>For Tutors (Interns)</h4>
      <h5>Setting Up Your Profile</h5>
      <ul>
        <li>Update your subjects and expertise areas</li>
        <li>Set your hourly rate and availability</li>
        <li>Add a bio describing your teaching style</li>
        <li>Upload any relevant certifications</li>
      </ul>
      
      <h5>Managing Sessions</h5>
      <ul>
        <li>View upcoming sessions in your dashboard</li>
        <li>Prepare materials and lesson plans</li>
        <li>Conduct sessions professionally</li>
        <li>Mark sessions as completed when finished</li>
      </ul>
    `,
    tags: ['tutoring', 'booking', 'sessions'],
    difficulty: 'intermediate',
    videoUrl: 'https://example.com/tutoring-guide',
    lastUpdated: '2024-01-12'
  },
  {
    id: 'messaging-system',
    title: 'Real-time Messaging and Communication',
    category: 'Messaging',
    content: `
      <h3>Messaging System Guide</h3>
      <p>Learn how to use our real-time messaging system to connect with the community.</p>
      
      <h4>Getting Started</h4>
      <ol>
        <li>Navigate to the Communication Hub</li>
        <li>Browse available channels or create your own</li>
        <li>Join channels relevant to your interests</li>
        <li>Start participating in conversations</li>
      </ol>
      
      <h4>Channel Types</h4>
      <ul>
        <li><strong>General:</strong> Community-wide discussions</li>
        <li><strong>Subject-specific:</strong> Math, Science, Technology, etc.</li>
        <li><strong>Project-based:</strong> Collaborative work spaces</li>
        <li><strong>Support:</strong> Help and assistance channels</li>
      </ul>
      
      <h4>Features</h4>
      <ul>
        <li><strong>Real-time messaging:</strong> Instant message delivery</li>
        <li><strong>File sharing:</strong> Upload documents and images</li>
        <li><strong>Message reactions:</strong> React to messages with emojis</li>
        <li><strong>User presence:</strong> See who's online</li>
        <li><strong>Message search:</strong> Find specific messages</li>
      </ul>
      
      <h4>Best Practices</h4>
      <ul>
        <li>Be respectful and inclusive in all communications</li>
        <li>Use appropriate channels for different topics</li>
        <li>Keep file uploads relevant and appropriately sized</li>
        <li>Report any inappropriate content to moderators</li>
      </ul>
    `,
    tags: ['messaging', 'channels', 'communication'],
    difficulty: 'beginner',
    lastUpdated: '2024-01-08'
  },
  {
    id: 'admin-dashboard',
    title: 'Admin Dashboard Features',
    category: 'Administration',
    content: `
      <h3>Admin Dashboard Guide</h3>
      <p>Comprehensive guide for administrators managing the platform.</p>
      
      <h4>Dashboard Overview</h4>
      <ul>
        <li><strong>Quick Stats:</strong> View key metrics at a glance</li>
        <li><strong>User Management:</strong> Manage user accounts and permissions</li>
        <li><strong>Volunteer Hours:</strong> Review and approve hour submissions</li>
        <li><strong>Analytics:</strong> Access detailed platform analytics</li>
        <li><strong>System Settings:</strong> Configure platform settings</li>
      </ul>
      
      <h4>User Management</h4>
      <ol>
        <li>View all users in the system</li>
        <li>Filter by role, status, or other criteria</li>
        <li>Edit user profiles and permissions</li>
        <li>Suspend or reactivate accounts as needed</li>
        <li>Monitor user activity and engagement</li>
      </ol>
      
      <h4>Volunteer Hours Approval</h4>
      <ol>
        <li>Review pending hour submissions</li>
        <li>Check supporting documentation</li>
        <li>Approve or reject with comments</li>
        <li>Track approval rates and trends</li>
        <li>Generate reports for stakeholders</li>
      </ol>
      
      <h4>Analytics and Reporting</h4>
      <ul>
        <li>View user growth and engagement metrics</li>
        <li>Track volunteer hours and tutoring sessions</li>
        <li>Monitor messaging activity</li>
        <li>Export data for external analysis</li>
        <li>Set up automated reports</li>
      </ul>
    `,
    tags: ['admin', 'dashboard', 'management'],
    difficulty: 'advanced',
    lastUpdated: '2024-01-14'
  }
];

export default function HelpPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [filteredArticles, setFilteredArticles] = useState<HelpArticle[]>(helpArticles);

  useEffect(() => {
    filterArticles();
  }, [searchTerm, selectedCategory]);

  const filterArticles = () => {
    let filtered = helpArticles;

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(article =>
        article.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        article.content.toLowerCase().includes(searchTerm.toLowerCase()) ||
        article.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()))
      );
    }

    // Filter by category
    if (selectedCategory !== 'all') {
      filtered = filtered.filter(article => article.category === selectedCategory);
    }

    setFilteredArticles(filtered);
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'beginner': return 'bg-green-100 text-green-800';
      case 'intermediate': return 'bg-yellow-100 text-yellow-800';
      case 'advanced': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const categories = ['all', ...Array.from(new Set(helpArticles.map(article => article.category)))];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center">
        <h1 className="text-3xl font-bold text-gray-900">Help & Documentation</h1>
        <p className="text-gray-600 mt-2">Find answers, guides, and tutorials for all platform features</p>
      </div>

      {/* Search and Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search help articles..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={selectedCategory} onValueChange={setSelectedCategory}>
              <SelectTrigger className="w-full md:w-48">
                <SelectValue placeholder="All Categories" />
              </SelectTrigger>
              <SelectContent>
                {categories.map(category => (
                  <SelectItem key={category} value={category}>
                    {category === 'all' ? 'All Categories' : category}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="hover:shadow-lg transition-shadow cursor-pointer">
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <BookOpen className="w-8 h-8 text-blue-600" />
              <div>
                <h3 className="font-semibold">Getting Started</h3>
                <p className="text-sm text-gray-600">New user guide</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-shadow cursor-pointer">
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <Clock className="w-8 h-8 text-green-600" />
              <div>
                <h3 className="font-semibold">Volunteer Hours</h3>
                <p className="text-sm text-gray-600">Track your activities</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-shadow cursor-pointer">
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <Calendar className="w-8 h-8 text-purple-600" />
              <div>
                <h3 className="font-semibold">Tutoring</h3>
                <p className="text-sm text-gray-600">Book sessions</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-shadow cursor-pointer">
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <MessageSquare className="w-8 h-8 text-orange-600" />
              <div>
                <h3 className="font-semibold">Messaging</h3>
                <p className="text-sm text-gray-600">Connect with others</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Help Articles */}
      <Tabs defaultValue="articles" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="articles">Help Articles</TabsTrigger>
          <TabsTrigger value="faq">FAQ</TabsTrigger>
        </TabsList>

        <TabsContent value="articles" className="space-y-4">
          {filteredArticles.length === 0 ? (
            <Card>
              <CardContent className="pt-6">
                <div className="text-center py-8">
                  <Search className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600">No help articles found matching your search.</p>
                  <Button 
                    variant="outline" 
                    onClick={() => {
                      setSearchTerm('');
                      setSelectedCategory('all');
                    }}
                    className="mt-4"
                  >
                    Clear Search
                  </Button>
                </div>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {filteredArticles.map((article) => (
                <Card key={article.id} className="hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <CardTitle className="text-lg">{article.title}</CardTitle>
                        <CardDescription className="mt-2">
                          {article.category} • Last updated {new Date(article.lastUpdated).toLocaleDateString()}
                        </CardDescription>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge className={getDifficultyColor(article.difficulty)}>
                          {article.difficulty}
                        </Badge>
                        {article.videoUrl && (
                          <Button variant="outline" size="sm">
                            <Video className="w-4 h-4 mr-2" />
                            Watch
                          </Button>
                        )}
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div 
                      className="prose prose-sm max-w-none"
                      dangerouslySetInnerHTML={{ __html: article.content }}
                    />
                    <div className="flex items-center gap-2 mt-4 pt-4 border-t">
                      {article.tags.map(tag => (
                        <Badge key={tag} variant="outline" className="text-xs">
                          {tag}
                        </Badge>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="faq" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Frequently Asked Questions</CardTitle>
              <CardDescription>Quick answers to common questions</CardDescription>
            </CardHeader>
            <CardContent>
              <Accordion type="single" collapsible className="w-full">
                <AccordionItem value="item-1">
                  <AccordionTrigger>How do I reset my password?</AccordionTrigger>
                  <AccordionContent>
                    Go to the login page and click "Forgot Password". Enter your email address and follow the instructions sent to your email.
                  </AccordionContent>
                </AccordionItem>
                
                <AccordionItem value="item-2">
                  <AccordionTrigger>How long does it take for volunteer hours to be approved?</AccordionTrigger>
                  <AccordionContent>
                    Volunteer hours are typically reviewed within 2-3 business days. You'll receive an email notification once your submission has been processed.
                  </AccordionContent>
                </AccordionItem>
                
                <AccordionItem value="item-3">
                  <AccordionTrigger>Can I cancel a tutoring session?</AccordionTrigger>
                  <AccordionContent>
                    Yes, you can cancel a tutoring session up to 24 hours before the scheduled time. Go to your tutoring dashboard and click "Cancel" next to the session.
                  </AccordionContent>
                </AccordionItem>
                
                <AccordionItem value="item-4">
                  <AccordionTrigger>How do I report inappropriate content?</AccordionTrigger>
                  <AccordionContent>
                    Use the report button (flag icon) next to any message or content. You can also contact administrators directly through the support channel.
                  </AccordionContent>
                </AccordionItem>
                
                <AccordionItem value="item-5">
                  <AccordionTrigger>What are the system requirements?</AccordionTrigger>
                  <AccordionContent>
                    Our platform works on all modern browsers (Chrome, Firefox, Safari, Edge). For the best experience, we recommend using the latest version of your browser.
                  </AccordionContent>
                </AccordionItem>
              </Accordion>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Contact Support */}
      <Card>
        <CardHeader>
          <CardTitle>Still Need Help?</CardTitle>
          <CardDescription>Can't find what you're looking for? Contact our support team.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center">
              <HelpCircle className="w-8 h-8 text-blue-600 mx-auto mb-2" />
              <h3 className="font-semibold">Support Channel</h3>
              <p className="text-sm text-gray-600">Join our support channel for real-time help</p>
              <Button variant="outline" className="mt-2">
                Join Channel
              </Button>
            </div>
            
            <div className="text-center">
              <MessageSquare className="w-8 h-8 text-green-600 mx-auto mb-2" />
              <h3 className="font-semibold">Email Support</h3>
              <p className="text-sm text-gray-600">Send us an email for detailed assistance</p>
              <Button variant="outline" className="mt-2">
                Contact Us
              </Button>
            </div>
            
            <div className="text-center">
              <Video className="w-8 h-8 text-purple-600 mx-auto mb-2" />
              <h3 className="font-semibold">Video Tutorials</h3>
              <p className="text-sm text-gray-600">Watch step-by-step video guides</p>
              <Button variant="outline" className="mt-2" onClick={() => window.location.href = '/help/video-tutorials'}>
                View Tutorials
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
} 