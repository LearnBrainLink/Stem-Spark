'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Shield, AlertTriangle, Activity, Users, Clock, CheckCircle, XCircle } from 'lucide-react';

interface AdminActionLog {
  id: string;
  action_type: string;
  target_user_id: string | null;
  performed_by: string | null;
  is_allowed: boolean;
  reason: string | null;
  created_at: string | null;
  metadata: any;
}

interface AdminStats {
  total_admins: number;
  total_super_admins: number;
  recent_actions: number;
  blocked_actions: number;
}

export default function AdminProtectionPage() {
  const [actionLogs, setActionLogs] = useState<AdminActionLog[]>([]);
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      
      // Fetch action logs
      const logsResponse = await fetch('/api/admin/action-logs?limit=50');
      const logsData = await logsResponse.json();
      
      // Fetch stats
      const statsResponse = await fetch('/api/admin/stats');
      const statsData = await statsResponse.json();

      if (logsResponse.ok) {
        setActionLogs(logsData.logs);
      }
      
      if (statsResponse.ok) {
        setStats(statsData.stats);
      }
    } catch (err) {
      setError('Failed to fetch admin protection data');
      console.error('Error fetching data:', err);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleString();
  };

  const getActionTypeColor = (actionType: string) => {
    const colors: Record<string, string> = {
      edit_user: 'bg-blue-100 text-blue-800',
      delete_user: 'bg-red-100 text-red-800',
      change_role: 'bg-purple-100 text-purple-800',
      approve_hours: 'bg-green-100 text-green-800',
      reject_hours: 'bg-orange-100 text-orange-800',
      create_channel: 'bg-indigo-100 text-indigo-800',
      delete_channel: 'bg-pink-100 text-pink-800'
    };
    return colors[actionType] || 'bg-gray-100 text-gray-800';
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <Alert className="m-4">
        <AlertTriangle className="h-4 w-4" />
        <AlertDescription>{error}</AlertDescription>
      </Alert>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center space-x-2">
        <Shield className="h-8 w-8 text-blue-600" />
        <h1 className="text-3xl font-bold">Admin Protection Dashboard</h1>
      </div>

      {/* Stats Cards */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Admins</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.total_admins}</div>
              <p className="text-xs text-muted-foreground">
                {stats.total_super_admins} super admins
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Recent Actions</CardTitle>
              <Activity className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.recent_actions}</div>
              <p className="text-xs text-muted-foreground">Last 24 hours</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Blocked Actions</CardTitle>
              <XCircle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-600">{stats.blocked_actions}</div>
              <p className="text-xs text-muted-foreground">Prevented violations</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Protection Status</CardTitle>
              <CheckCircle className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">Active</div>
              <p className="text-xs text-muted-foreground">All systems secure</p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Tabs */}
      <Tabs defaultValue="logs" className="space-y-4">
        <TabsList>
          <TabsTrigger value="logs">Action Logs</TabsTrigger>
          <TabsTrigger value="settings">Protection Settings</TabsTrigger>
        </TabsList>

        <TabsContent value="logs" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Recent Admin Actions</CardTitle>
              <CardDescription>
                Audit trail of all admin actions and protection decisions
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {actionLogs.length === 0 ? (
                  <p className="text-center text-muted-foreground py-8">
                    No admin actions logged yet
                  </p>
                ) : (
                  actionLogs.map((log) => (
                    <div
                      key={log.id}
                      className="flex items-center justify-between p-4 border rounded-lg"
                    >
                      <div className="flex items-center space-x-4">
                        <div className="flex flex-col">
                          <div className="flex items-center space-x-2">
                            <Badge className={getActionTypeColor(log.action_type)}>
                              {log.action_type.replace('_', ' ')}
                            </Badge>
                            {log.is_allowed ? (
                              <CheckCircle className="h-4 w-4 text-green-600" />
                            ) : (
                              <XCircle className="h-4 w-4 text-red-600" />
                            )}
                          </div>
                          <p className="text-sm text-muted-foreground">
                            {log.reason || 'No reason provided'}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                        <Clock className="h-4 w-4" />
                        <span>{formatDate(log.created_at)}</span>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="settings" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Protection Rules</CardTitle>
              <CardDescription>
                Current admin protection rules and restrictions
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div>
                    <h4 className="font-medium">Admin-to-Admin Protection</h4>
                    <p className="text-sm text-muted-foreground">
                      Regular admins cannot modify other admin accounts
                    </p>
                  </div>
                  <Badge className="bg-green-100 text-green-800">Active</Badge>
                </div>

                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div>
                    <h4 className="font-medium">Super Admin Protection</h4>
                    <p className="text-sm text-muted-foreground">
                      Only super admins can assign admin roles
                    </p>
                  </div>
                  <Badge className="bg-green-100 text-green-800">Active</Badge>
                </div>

                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div>
                    <h4 className="font-medium">Action Logging</h4>
                    <p className="text-sm text-muted-foreground">
                      All admin actions are logged for audit purposes
                    </p>
                  </div>
                  <Badge className="bg-green-100 text-green-800">Active</Badge>
                </div>

                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div>
                    <h4 className="font-medium">Real-time Validation</h4>
                    <p className="text-sm text-muted-foreground">
                      Actions are validated before execution
                    </p>
                  </div>
                  <Badge className="bg-green-100 text-green-800">Active</Badge>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <div className="flex justify-end">
        <Button onClick={fetchData} variant="outline">
          Refresh Data
        </Button>
      </div>
    </div>
  );
} 