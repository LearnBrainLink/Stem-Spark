'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { 
  CheckCircle, 
  Circle, 
  ArrowRight, 
  ArrowLeft,
  Users,
  Clock,
  MessageSquare,
  Calendar,
  BookOpen,
  Target,
  Zap
} from 'lucide-react';

interface OnboardingStep {
  id: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  content: React.ReactNode;
  required: boolean;
}

interface OnboardingFlowProps {
  userRole: string;
  onComplete: () => void;
  onSkip: () => void;
}

export default function OnboardingFlow({ userRole, onComplete, onSkip }: OnboardingFlowProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [completedSteps, setCompletedSteps] = useState<Set<string>>(new Set());
  const [showOnboarding, setShowOnboarding] = useState(true);

  const steps: OnboardingStep[] = [
    {
      id: 'welcome',
      title: 'Welcome to STEM Spark Academy',
      description: 'Let\'s get you started with your journey',
      icon: <Target className="w-6 h-6" />,
      content: (
        <div className="space-y-4">
          <div className="text-center">
            <h3 className="text-xl font-semibold mb-2">Welcome to STEM Spark Academy!</h3>
            <p className="text-gray-600">
              We're excited to have you join our community. This quick tour will help you get familiar with the platform.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex items-center gap-3 p-3 bg-blue-50 rounded-lg">
              <Users className="w-5 h-5 text-blue-600" />
              <div>
                <p className="font-medium">Connect with Peers</p>
                <p className="text-sm text-gray-600">Join discussions and collaborate</p>
              </div>
            </div>
            
            <div className="flex items-center gap-3 p-3 bg-green-50 rounded-lg">
              <Clock className="w-5 h-5 text-green-600" />
              <div>
                <p className="font-medium">Track Volunteer Hours</p>
                <p className="text-sm text-gray-600">Log your activities and contributions</p>
              </div>
            </div>
            
            <div className="flex items-center gap-3 p-3 bg-purple-50 rounded-lg">
              <Calendar className="w-5 h-5 text-purple-600" />
              <div>
                <p className="font-medium">Book Tutoring Sessions</p>
                <p className="text-sm text-gray-600">Get help or offer tutoring</p>
              </div>
            </div>
            
            <div className="flex items-center gap-3 p-3 bg-orange-50 rounded-lg">
              <MessageSquare className="w-5 h-5 text-orange-600" />
              <div>
                <p className="font-medium">Real-time Messaging</p>
                <p className="text-sm text-gray-600">Stay connected with the community</p>
              </div>
            </div>
          </div>
        </div>
      ),
      required: false
    },
    {
      id: 'profile',
      title: 'Complete Your Profile',
      description: 'Help others get to know you better',
      icon: <Users className="w-6 h-6" />,
      content: (
        <div className="space-y-4">
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <h4 className="font-semibold text-yellow-800 mb-2">Profile Completion</h4>
            <p className="text-yellow-700 text-sm">
              A complete profile helps you connect with others and makes the platform more engaging for everyone.
            </p>
          </div>
          
          <div className="space-y-3">
            <div className="flex items-center justify-between p-3 border rounded-lg">
              <div>
                <p className="font-medium">Profile Picture</p>
                <p className="text-sm text-gray-600">Add a photo to personalize your account</p>
              </div>
              <Badge variant="outline">Optional</Badge>
            </div>
            
            <div className="flex items-center justify-between p-3 border rounded-lg">
              <div>
                <p className="font-medium">Bio</p>
                <p className="text-sm text-gray-600">Tell others about your interests and goals</p>
              </div>
              <Badge variant="outline">Optional</Badge>
            </div>
            
            <div className="flex items-center justify-between p-3 border rounded-lg">
              <div>
                <p className="font-medium">Interests</p>
                <p className="text-sm text-gray-600">Select subjects and topics you're interested in</p>
              </div>
              <Badge variant="outline">Optional</Badge>
            </div>
          </div>
          
          <Button className="w-full">
            Complete Profile
          </Button>
        </div>
      ),
      required: false
    },
    {
      id: 'features',
      title: 'Explore Key Features',
      description: 'Learn about the main features available to you',
      icon: <Zap className="w-6 h-6" />,
      content: (
        <div className="space-y-4">
          <div className="grid grid-cols-1 gap-4">
            <Card>
              <CardHeader className="pb-3">
                <div className="flex items-center gap-3">
                  <Clock className="w-5 h-5 text-blue-600" />
                  <div>
                    <CardTitle className="text-base">Volunteer Hours</CardTitle>
                    <CardDescription>Track your contributions and activities</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="pt-0">
                <p className="text-sm text-gray-600 mb-3">
                  Submit volunteer hours for activities like tutoring, event support, and content creation. 
                  Hours are reviewed by administrators and count toward your total volunteer time.
                </p>
                <Button variant="outline" size="sm">
                  Learn More
                </Button>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="pb-3">
                <div className="flex items-center gap-3">
                  <BookOpen className="w-5 h-5 text-green-600" />
                  <div>
                    <CardTitle className="text-base">Tutoring System</CardTitle>
                    <CardDescription>Book sessions or offer tutoring services</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="pt-0">
                <p className="text-sm text-gray-600 mb-3">
                  {userRole === 'intern' 
                    ? 'Offer tutoring services to students and earn volunteer hours automatically when sessions are completed.'
                    : 'Book tutoring sessions with qualified interns to get help with your studies.'
                  }
                </p>
                <Button variant="outline" size="sm">
                  Learn More
                </Button>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="pb-3">
                <div className="flex items-center gap-3">
                  <MessageSquare className="w-5 h-5 text-purple-600" />
                  <div>
                    <CardTitle className="text-base">Real-time Messaging</CardTitle>
                    <CardDescription>Connect with the community</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="pt-0">
                <p className="text-sm text-gray-600 mb-3">
                  Join channels, participate in discussions, share files, and stay connected with other members 
                  through our real-time messaging system.
                </p>
                <Button variant="outline" size="sm">
                  Learn More
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      ),
      required: false
    },
    {
      id: 'community',
      title: 'Join the Community',
      description: 'Connect with other members and start participating',
      icon: <Users className="w-6 h-6" />,
      content: (
        <div className="space-y-4">
          <div className="text-center">
            <h3 className="text-lg font-semibold mb-2">Ready to Connect?</h3>
            <p className="text-gray-600">
              Join channels, introduce yourself, and start participating in the community.
            </p>
          </div>
          
          <div className="space-y-3">
            <div className="flex items-center gap-3 p-3 border rounded-lg">
              <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                <span className="text-blue-600 font-semibold">#</span>
              </div>
              <div className="flex-1">
                <p className="font-medium">General</p>
                <p className="text-sm text-gray-600">Community-wide discussions</p>
              </div>
              <Button size="sm">Join</Button>
            </div>
            
            <div className="flex items-center gap-3 p-3 border rounded-lg">
              <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                <span className="text-green-600 font-semibold">#</span>
              </div>
              <div className="flex-1">
                <p className="font-medium">Support</p>
                <p className="text-sm text-gray-600">Get help and ask questions</p>
              </div>
              <Button size="sm">Join</Button>
            </div>
            
            <div className="flex items-center gap-3 p-3 border rounded-lg">
              <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center">
                <span className="text-purple-600 font-semibold">#</span>
              </div>
              <div className="flex-1">
                <p className="font-medium">Announcements</p>
                <p className="text-sm text-gray-600">Platform updates and news</p>
              </div>
              <Button size="sm">Join</Button>
            </div>
          </div>
          
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h4 className="font-semibold text-blue-800 mb-2">Pro Tip</h4>
            <p className="text-blue-700 text-sm">
              Introduce yourself in the General channel to let others know you've joined the community!
            </p>
          </div>
        </div>
      ),
      required: false
    }
  ];

  const progress = ((currentStep + 1) / steps.length) * 100;

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      handleComplete();
    }
  };

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleComplete = () => {
    setCompletedSteps(new Set(steps.map(step => step.id)));
    setShowOnboarding(false);
    onComplete();
  };

  const handleSkip = () => {
    setShowOnboarding(false);
    onSkip();
  };

  if (!showOnboarding) {
    return null;
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Getting Started</CardTitle>
              <CardDescription>
                Step {currentStep + 1} of {steps.length}
              </CardDescription>
            </div>
            <Button variant="ghost" onClick={handleSkip}>
              Skip Tour
            </Button>
          </div>
          <Progress value={progress} className="mt-4" />
        </CardHeader>
        
        <CardContent>
          <div className="space-y-6">
            {/* Step Header */}
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                {steps[currentStep].icon}
              </div>
              <div>
                <h2 className="text-xl font-semibold">{steps[currentStep].title}</h2>
                <p className="text-gray-600">{steps[currentStep].description}</p>
              </div>
            </div>

            {/* Step Content */}
            <div>
              {steps[currentStep].content}
            </div>

            {/* Navigation */}
            <div className="flex items-center justify-between pt-4 border-t">
              <Button
                variant="outline"
                onClick={handlePrevious}
                disabled={currentStep === 0}
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Previous
              </Button>
              
              <div className="flex items-center gap-2">
                {steps.map((step, index) => (
                  <div
                    key={step.id}
                    className={`w-2 h-2 rounded-full ${
                      index <= currentStep ? 'bg-blue-600' : 'bg-gray-300'
                    }`}
                  />
                ))}
              </div>
              
              <Button onClick={handleNext}>
                {currentStep === steps.length - 1 ? 'Complete' : 'Next'}
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
} 