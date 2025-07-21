'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  HelpCircle, 
  X, 
  ChevronRight,
  ExternalLink,
  Video,
  FileText
} from 'lucide-react';

interface HelpTooltipProps {
  title: string;
  content: string;
  videoUrl?: string;
  documentationUrl?: string;
  category?: string;
  difficulty?: 'beginner' | 'intermediate' | 'advanced';
  children?: React.ReactNode;
  className?: string;
}

export default function HelpTooltip({
  title,
  content,
  videoUrl,
  documentationUrl,
  category,
  difficulty,
  children,
  className = ''
}: HelpTooltipProps) {
  const [isOpen, setIsOpen] = useState(false);

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'beginner': return 'bg-green-100 text-green-800';
      case 'intermediate': return 'bg-yellow-100 text-yellow-800';
      case 'advanced': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className={`relative inline-block ${className}`}>
      {children}
      <Button
        variant="ghost"
        size="sm"
        className="ml-2 p-1 h-auto"
        onClick={() => setIsOpen(!isOpen)}
      >
        <HelpCircle className="w-4 h-4 text-gray-400 hover:text-gray-600" />
      </Button>

      {isOpen && (
        <div className="absolute z-50 mt-2 w-80 bg-white border border-gray-200 rounded-lg shadow-lg">
          <Card className="border-0 shadow-none">
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <CardTitle className="text-sm font-semibold">{title}</CardTitle>
                  {category && (
                    <Badge variant="outline" className="text-xs mt-1">
                      {category}
                    </Badge>
                  )}
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  className="p-1 h-auto"
                  onClick={() => setIsOpen(false)}
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="text-sm text-gray-600 mb-3">
                {content}
              </div>
              
              <div className="flex items-center gap-2">
                {videoUrl && (
                  <Button variant="outline" size="sm" className="text-xs">
                    <Video className="w-3 h-3 mr-1" />
                    Watch Video
                  </Button>
                )}
                {documentationUrl && (
                  <Button variant="outline" size="sm" className="text-xs">
                    <FileText className="w-3 h-3 mr-1" />
                    Documentation
                  </Button>
                )}
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="text-xs ml-auto"
                  onClick={() => setIsOpen(false)}
                >
                  Got it
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}

// Predefined help tooltips for common features
export const CommonHelpTooltips = {
  VolunteerHours: () => (
    <HelpTooltip
      title="Volunteer Hours"
      content="Submit and track your volunteer activities. Hours are reviewed by administrators and count toward your total volunteer time."
      category="Volunteer Hours"
      difficulty="beginner"
      videoUrl="/help/volunteer-hours"
      documentationUrl="/help/volunteer-hours-guide"
    >
      <span>Volunteer Hours</span>
    </HelpTooltip>
  ),

  Tutoring: () => (
    <HelpTooltip
      title="Tutoring System"
      content="Book tutoring sessions with qualified tutors or offer tutoring services as an intern. Sessions automatically generate volunteer hours."
      category="Tutoring"
      difficulty="intermediate"
      videoUrl="/help/tutoring"
      documentationUrl="/help/tutoring-guide"
    >
      <span>Tutoring</span>
    </HelpTooltip>
  ),

  Messaging: () => (
    <HelpTooltip
      title="Real-time Messaging"
      content="Connect with other members through our real-time chat system. Join channels, share files, and participate in discussions."
      category="Messaging"
      difficulty="beginner"
      videoUrl="/help/messaging"
      documentationUrl="/help/messaging-guide"
    >
      <span>Messaging</span>
    </HelpTooltip>
  ),

  AdminDashboard: () => (
    <HelpTooltip
      title="Admin Dashboard"
      content="Manage users, approve volunteer hours, view analytics, and configure system settings. Access comprehensive platform insights."
      category="Administration"
      difficulty="advanced"
      videoUrl="/help/admin-dashboard"
      documentationUrl="/help/admin-guide"
    >
      <span>Admin Dashboard</span>
    </HelpTooltip>
  ),

  Analytics: () => (
    <HelpTooltip
      title="Analytics Dashboard"
      content="View detailed platform analytics including user growth, volunteer hours, tutoring sessions, and engagement metrics."
      category="Analytics"
      difficulty="intermediate"
      videoUrl="/help/analytics"
      documentationUrl="/help/analytics-guide"
    >
      <span>Analytics</span>
    </HelpTooltip>
  ),

  UserManagement: () => (
    <HelpTooltip
      title="User Management"
      content="View, edit, and manage user accounts. Monitor user activity, adjust permissions, and maintain platform security."
      category="Administration"
      difficulty="advanced"
      videoUrl="/help/user-management"
      documentationUrl="/help/user-management-guide"
    >
      <span>User Management</span>
    </HelpTooltip>
  )
};

// Hook for managing help state
export function useHelpTooltip() {
  const [showHelp, setShowHelp] = useState(false);

  const toggleHelp = () => setShowHelp(!showHelp);
  const hideHelp = () => setShowHelp(false);
  const showHelpFor = (feature: string) => {
    // This could be expanded to show specific help content
    setShowHelp(true);
  };

  return {
    showHelp,
    toggleHelp,
    hideHelp,
    showHelpFor
  };
} 