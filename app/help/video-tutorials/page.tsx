'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { 
  Play, 
  Clock, 
  Users, 
  BookOpen, 
  MessageSquare, 
  Calendar,
  Search,
  Filter,
  Star,
  Eye,
  Download,
  Share2
} from 'lucide-react';

interface VideoTutorial {
  id: string;
  title: string;
  description: string;
  category: string;
  duration: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  thumbnail: string;
  videoUrl: string;
  tags: string[];
  views: number;
  rating: number;
  transcript?: string;
  resources?: string[];
}

const videoTutorials: VideoTutorial[] = [
  {
    id: 'getting-started-platform',
    title: 'Getting Started with STEM Spark Academy',
    description: 'Complete walkthrough of the platform for new users, including account setup and navigation.',
    category: 'Getting Started',
    duration: '8:45',
    difficulty: 'beginner',
    thumbnail: '/tutorials/getting-started-thumb.jpg',
    videoUrl: 'https://www.youtube.com/watch?v=example1',
    tags: ['getting-started', 'account-setup', 'navigation'],
    views: 1247,
    rating: 4.8,
    transcript: 'Welcome to STEM Spark Academy. In this tutorial, we\'ll walk you through...',
    resources: ['Platform Overview PDF', 'Quick Start Checklist']
  },
  {
    id: 'volunteer-hours-submission',
    title: 'How to Submit Volunteer Hours',
    description: 'Step-by-step guide on submitting and tracking your volunteer hours.',
    category: 'Volunteer Hours',
    duration: '6:32',
    difficulty: 'beginner',
    thumbnail: '/tutorials/volunteer-hours-thumb.jpg',
    videoUrl: 'https://www.youtube.com/watch?v=example2',
    tags: ['volunteer-hours', 'submission', 'tracking'],
    views: 892,
    rating: 4.6,
    transcript: 'In this tutorial, we\'ll show you how to submit your volunteer hours...',
    resources: ['Volunteer Hours Guide', 'Activity Log Template']
  },
  {
    id: 'tutoring-session-booking',
    title: 'Booking Tutoring Sessions',
    description: 'Learn how to find tutors, book sessions, and manage your tutoring schedule.',
    category: 'Tutoring',
    duration: '10:15',
    difficulty: 'intermediate',
    thumbnail: '/tutorials/tutoring-booking-thumb.jpg',
    videoUrl: 'https://www.youtube.com/watch?v=example3',
    tags: ['tutoring', 'booking', 'scheduling'],
    views: 567,
    rating: 4.7,
    transcript: 'This tutorial covers the complete process of booking tutoring sessions...',
    resources: ['Tutoring Best Practices', 'Session Preparation Guide']
  },
  {
    id: 'messaging-system',
    title: 'Using the Real-time Messaging System',
    description: 'Complete guide to using channels, sending messages, and managing conversations.',
    category: 'Messaging',
    duration: '12:20',
    difficulty: 'beginner',
    thumbnail: '/tutorials/messaging-thumb.jpg',
    videoUrl: 'https://www.youtube.com/watch?v=example4',
    tags: ['messaging', 'channels', 'real-time'],
    views: 1103,
    rating: 4.5,
    transcript: 'Our messaging system allows you to connect with other members in real-time...',
    resources: ['Messaging Etiquette', 'Channel Guidelines']
  },
  {
    id: 'admin-dashboard',
    title: 'Admin Dashboard Overview',
    description: 'Comprehensive guide for administrators on using the dashboard and management tools.',
    category: 'Administration',
    duration: '15:45',
    difficulty: 'advanced',
    thumbnail: '/tutorials/admin-dashboard-thumb.jpg',
    videoUrl: 'https://www.youtube.com/watch?v=example5',
    tags: ['admin', 'dashboard', 'management'],
    views: 234,
    rating: 4.9,
    transcript: 'As an administrator, you have access to powerful tools for managing the platform...',
    resources: ['Admin Handbook', 'Management Procedures']
  },
  {
    id: 'profile-optimization',
    title: 'Optimizing Your Profile',
    description: 'Tips and tricks for creating an engaging profile that helps you connect with others.',
    category: 'Profile',
    duration: '7:18',
    difficulty: 'beginner',
    thumbnail: '/tutorials/profile-optimization-thumb.jpg',
    videoUrl: 'https://www.youtube.com/watch?v=example6',
    tags: ['profile', 'optimization', 'networking'],
    views: 756,
    rating: 4.4,
    transcript: 'Your profile is your digital identity on the platform...',
    resources: ['Profile Best Practices', 'Networking Tips']
  },
  {
    id: 'analytics-understanding',
    title: 'Understanding Your Analytics',
    description: 'Learn how to interpret your activity data and track your progress.',
    category: 'Analytics',
    duration: '9:30',
    difficulty: 'intermediate',
    thumbnail: '/tutorials/analytics-thumb.jpg',
    videoUrl: 'https://www.youtube.com/watch?v=example7',
    tags: ['analytics', 'data', 'progress-tracking'],
    views: 445,
    rating: 4.3,
    transcript: 'Analytics help you understand your engagement and progress...',
    resources: ['Analytics Guide', 'Progress Tracking Sheet']
  },
  {
    id: 'mobile-app-usage',
    title: 'Using the Mobile App',
    description: 'Complete guide to using STEM Spark Academy on mobile devices.',
    category: 'Mobile',
    duration: '11:25',
    difficulty: 'beginner',
    thumbnail: '/tutorials/mobile-app-thumb.jpg',
    videoUrl: 'https://www.youtube.com/watch?v=example8',
    tags: ['mobile', 'app', 'responsive'],
    views: 678,
    rating: 4.6,
    transcript: 'Our mobile app provides full access to all platform features...',
    resources: ['Mobile App Guide', 'Troubleshooting Tips']
  }
];

export default function VideoTutorialsPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedDifficulty, setSelectedDifficulty] = useState('all');
  const [filteredTutorials, setFilteredTutorials] = useState<VideoTutorial[]>(videoTutorials);

  const filterTutorials = () => {
    let filtered = videoTutorials;

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(tutorial =>
        tutorial.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        tutorial.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        tutorial.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()))
      );
    }

    // Filter by category
    if (selectedCategory !== 'all') {
      filtered = filtered.filter(tutorial => tutorial.category === selectedCategory);
    }

    // Filter by difficulty
    if (selectedDifficulty !== 'all') {
      filtered = filtered.filter(tutorial => tutorial.difficulty === selectedDifficulty);
    }

    setFilteredTutorials(filtered);
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'beginner': return 'bg-green-100 text-green-800';
      case 'intermediate': return 'bg-yellow-100 text-yellow-800';
      case 'advanced': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const categories = ['all', ...Array.from(new Set(videoTutorials.map(tutorial => tutorial.category)))];
  const difficulties = ['all', 'beginner', 'intermediate', 'advanced'];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center">
        <h1 className="text-3xl font-bold text-gray-900">Video Tutorials</h1>
        <p className="text-gray-600 mt-2">Step-by-step video guides for all platform features</p>
      </div>

      {/* Search and Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search tutorials..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <select 
              value={selectedCategory} 
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {categories.map(category => (
                <option key={category} value={category}>
                  {category === 'all' ? 'All Categories' : category}
                </option>
              ))}
            </select>
            <select 
              value={selectedDifficulty} 
              onChange={(e) => setSelectedDifficulty(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {difficulties.map(difficulty => (
                <option key={difficulty} value={difficulty}>
                  {difficulty === 'all' ? 'All Levels' : difficulty.charAt(0).toUpperCase() + difficulty.slice(1)}
                </option>
              ))}
            </select>
          </div>
        </CardContent>
      </Card>

      {/* Featured Tutorials */}
      <div>
        <h2 className="text-xl font-semibold mb-4">Featured Tutorials</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {videoTutorials.slice(0, 3).map((tutorial) => (
            <Card key={tutorial.id} className="hover:shadow-lg transition-shadow">
              <div className="relative">
                <div className="aspect-video bg-gray-200 rounded-t-lg flex items-center justify-center">
                  <Play className="w-12 h-12 text-gray-400" />
                </div>
                <Badge className={`absolute top-2 right-2 ${getDifficultyColor(tutorial.difficulty)}`}>
                  {tutorial.difficulty}
                </Badge>
              </div>
              <CardHeader className="pb-3">
                <CardTitle className="text-lg">{tutorial.title}</CardTitle>
                <CardDescription className="line-clamp-2">
                  {tutorial.description}
                </CardDescription>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="flex items-center justify-between text-sm text-gray-600 mb-3">
                  <span className="flex items-center gap-1">
                    <Clock className="w-4 h-4" />
                    {tutorial.duration}
                  </span>
                  <span className="flex items-center gap-1">
                    <Eye className="w-4 h-4" />
                    {tutorial.views.toLocaleString()}
                  </span>
                  <span className="flex items-center gap-1">
                    <Star className="w-4 h-4" />
                    {tutorial.rating}
                  </span>
                </div>
                <div className="flex gap-2">
                  <Button className="flex-1">
                    <Play className="w-4 h-4 mr-2" />
                    Watch
                  </Button>
                  <Button variant="outline" size="sm">
                    <Share2 className="w-4 h-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* All Tutorials */}
      <div>
        <h2 className="text-xl font-semibold mb-4">All Tutorials</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredTutorials.map((tutorial) => (
            <Card key={tutorial.id} className="hover:shadow-lg transition-shadow">
              <div className="relative">
                <div className="aspect-video bg-gray-200 rounded-t-lg flex items-center justify-center">
                  <Play className="w-12 h-12 text-gray-400" />
                </div>
                <Badge className={`absolute top-2 right-2 ${getDifficultyColor(tutorial.difficulty)}`}>
                  {tutorial.difficulty}
                </Badge>
              </div>
              <CardHeader className="pb-3">
                <CardTitle className="text-lg">{tutorial.title}</CardTitle>
                <CardDescription className="line-clamp-2">
                  {tutorial.description}
                </CardDescription>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="flex items-center justify-between text-sm text-gray-600 mb-3">
                  <span className="flex items-center gap-1">
                    <Clock className="w-4 h-4" />
                    {tutorial.duration}
                  </span>
                  <span className="flex items-center gap-1">
                    <Eye className="w-4 h-4" />
                    {tutorial.views.toLocaleString()}
                  </span>
                  <span className="flex items-center gap-1">
                    <Star className="w-4 h-4" />
                    {tutorial.rating}
                  </span>
                </div>
                <div className="flex gap-2 mb-3">
                  <Button className="flex-1">
                    <Play className="w-4 h-4 mr-2" />
                    Watch
                  </Button>
                  <Button variant="outline" size="sm">
                    <Share2 className="w-4 h-4" />
                  </Button>
                </div>
                {tutorial.resources && tutorial.resources.length > 0 && (
                  <div className="border-t pt-3">
                    <p className="text-sm font-medium mb-2">Resources:</p>
                    <div className="flex flex-wrap gap-1">
                      {tutorial.resources.map((resource, index) => (
                        <Badge key={index} variant="outline" className="text-xs">
                          {resource}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Learning Paths */}
      <Card>
        <CardHeader>
          <CardTitle>Learning Paths</CardTitle>
          <CardDescription>Follow these curated paths to master specific areas</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="border rounded-lg p-4">
              <h3 className="font-semibold mb-2">New User Path</h3>
              <p className="text-sm text-gray-600 mb-3">Perfect for getting started with the platform</p>
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  Getting Started with STEM Spark Academy
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  Optimizing Your Profile
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <div className="w-2 h-2 bg-gray-300 rounded-full"></div>
                  Using the Real-time Messaging System
                </div>
              </div>
            </div>
            
            <div className="border rounded-lg p-4">
              <h3 className="font-semibold mb-2">Volunteer Path</h3>
              <p className="text-sm text-gray-600 mb-3">Master volunteer hour tracking and tutoring</p>
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  How to Submit Volunteer Hours
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <div className="w-2 h-2 bg-gray-300 rounded-full"></div>
                  Booking Tutoring Sessions
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <div className="w-2 h-2 bg-gray-300 rounded-full"></div>
                  Understanding Your Analytics
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
} 