import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Users, 
  Video, 
  BarChart3, 
  Settings, 
  Mail, 
  Clock, 
  MessageSquare,
  Shield,
  Activity,
  Calendar,
  FileText,
  Bell
} from 'lucide-react';
import Link from 'next/link';

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect('/login');
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('role, full_name')
    .eq('id', user.id)
    .single();

  if (!profile || (profile.role !== 'admin' && profile.role !== 'super_admin')) {
    redirect('/dashboard');
  }

  // Get counts for dashboard
  const [
    { count: pendingHours },
    { count: pendingApplications },
    { count: totalUsers },
    { count: totalVideos }
  ] = await Promise.all([
    supabase.from('volunteer_hours').select('*', { count: 'exact', head: true }).eq('status', 'pending'),
    supabase.from('applications').select('*', { count: 'exact', head: true }).eq('status', 'pending'),
    supabase.from('profiles').select('*', { count: 'exact', head: true }),
    supabase.from('videos').select('*', { count: 'exact', head: true })
  ]);

  const navigationItems = [
    {
      title: 'Dashboard',
      href: '/admin',
      icon: BarChart3,
      description: 'Overview and analytics'
    },
    {
      title: 'Volunteer Hours',
      href: '/admin/volunteer-hours',
      icon: Clock,
      description: 'Review and approve volunteer hours',
      badge: pendingHours || 0
    },
    {
      title: 'Applications',
      href: '/admin/applications',
      icon: FileText,
      description: 'Manage internship applications',
      badge: pendingApplications || 0
    },
    {
      title: 'Users',
      href: '/admin/users',
      icon: Users,
      description: 'Manage user accounts and roles'
    },
    {
      title: 'Videos',
      href: '/admin/videos',
      icon: Video,
      description: 'Manage educational content'
    },
    {
      title: 'Communication',
      href: '/communication-hub',
      icon: MessageSquare,
      description: 'Real-time messaging and channels'
    },
    {
      title: 'Analytics',
      href: '/admin/analytics',
      icon: Activity,
      description: 'Detailed analytics and reports'
    },
    {
      title: 'Settings',
      href: '/admin/settings',
      icon: Settings,
      description: 'System configuration'
    }
  ];

  const quickActions = [
    {
      title: 'Approve Hours',
      href: '/admin/volunteer-hours',
      icon: Clock,
      color: 'bg-green-500'
    },
    {
      title: 'Review Applications',
      href: '/admin/applications',
      icon: FileText,
      color: 'bg-blue-500'
    },
    {
      title: 'Send Notifications',
      href: '/admin/email-config',
      icon: Mail,
      color: 'bg-purple-500'
    },
    {
      title: 'View Analytics',
      href: '/admin/analytics',
      icon: BarChart3,
      color: 'bg-orange-500'
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center">
              <h1 className="text-2xl font-bold text-gray-900">Admin Dashboard</h1>
              <Badge variant="outline" className="ml-3">
                {profile.role === 'super_admin' ? 'Super Admin' : 'Admin'}
              </Badge>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-600">
                Welcome, {profile.full_name}
              </span>
              <Button variant="outline" size="sm" asChild>
                <Link href="/dashboard">Back to Dashboard</Link>
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Sidebar Navigation */}
          <div className="lg:col-span-1">
            <div className="space-y-6">
              {/* Quick Actions */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Quick Actions</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {quickActions.map((action) => (
                      <Button
                        key={action.title}
                        variant="ghost"
                        className="w-full justify-start"
                        asChild
                      >
                        <Link href={action.href}>
                          <action.icon className={`w-4 h-4 mr-2 ${action.color} text-white rounded p-0.5`} />
                          {action.title}
                        </Link>
                      </Button>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Navigation */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Navigation</CardTitle>
                </CardHeader>
                <CardContent>
                  <nav className="space-y-2">
                    {navigationItems.map((item) => (
                      <Button
                        key={item.title}
                        variant="ghost"
                        className="w-full justify-start"
                        asChild
                      >
                        <Link href={item.href}>
                          <item.icon className="w-4 h-4 mr-2" />
                          <span className="flex-1 text-left">{item.title}</span>
                          {item.badge && item.badge > 0 && (
                            <Badge variant="destructive" className="ml-2">
                              {item.badge}
                            </Badge>
                          )}
                        </Link>
                      </Button>
                    ))}
                  </nav>
                </CardContent>
              </Card>

              {/* Stats Summary */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Quick Stats</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Pending Hours</span>
                      <Badge variant={pendingHours > 0 ? "destructive" : "secondary"}>
                        {pendingHours || 0}
                      </Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Pending Applications</span>
                      <Badge variant={pendingApplications > 0 ? "destructive" : "secondary"}>
                        {pendingApplications || 0}
                      </Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Total Users</span>
                      <Badge variant="outline">{totalUsers || 0}</Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Total Videos</span>
                      <Badge variant="outline">{totalVideos || 0}</Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3">
            {children}
          </div>
        </div>
      </div>
    </div>
  );
} 