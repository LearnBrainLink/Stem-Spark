'use client'

import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { 
  Activity, 
  Server, 
  Database, 
  Clock, 
  TrendingUp, 
  TrendingDown,
  AlertTriangle,
  CheckCircle,
  RefreshCw,
  BarChart3,
  Cpu,
  HardDrive,
  Network,
  Users
} from 'lucide-react'
import { performanceOptimizer } from '@/lib/performance-optimization'

interface SystemMetrics {
  cpu: number
  memory: number
  disk: number
  network: number
  activeUsers: number
  uptime: number
}

interface PerformanceData {
  pageLoads: number[]
  apiCalls: number[]
  databaseQueries: number[]
  timestamps: string[]
}

const MonitoringDashboard: React.FC = () => {
  const [systemMetrics, setSystemMetrics] = useState<SystemMetrics>({
    cpu: 0,
    memory: 0,
    disk: 0,
    network: 0,
    activeUsers: 0,
    uptime: 0
  })
  const [performanceData, setPerformanceData] = useState<PerformanceData>({
    pageLoads: [],
    apiCalls: [],
    databaseQueries: [],
    timestamps: []
  })
  const [alerts, setAlerts] = useState<Array<{
    id: string
    type: 'warning' | 'error' | 'info'
    message: string
    timestamp: Date
  }>>([])
  const [isLoading, setIsLoading] = useState(false)

  // Simulate system metrics (in real app, this would come from monitoring service)
  const fetchSystemMetrics = async () => {
    setIsLoading(true)
    try {
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 500))
      
      const mockMetrics: SystemMetrics = {
        cpu: Math.random() * 100,
        memory: Math.random() * 100,
        disk: Math.random() * 100,
        network: Math.random() * 100,
        activeUsers: Math.floor(Math.random() * 100) + 10,
        uptime: Math.floor(Math.random() * 1000000)
      }
      
      setSystemMetrics(mockMetrics)
      
      // Generate alerts based on metrics
      const newAlerts = []
      if (mockMetrics.cpu > 80) {
        newAlerts.push({
          id: `cpu_${Date.now()}`,
          type: 'warning' as const,
          message: `High CPU usage: ${mockMetrics.cpu.toFixed(1)}%`,
          timestamp: new Date()
        })
      }
      if (mockMetrics.memory > 85) {
        newAlerts.push({
          id: `memory_${Date.now()}`,
          type: 'error' as const,
          message: `Critical memory usage: ${mockMetrics.memory.toFixed(1)}%`,
          timestamp: new Date()
        })
      }
      
      setAlerts(prev => [...newAlerts, ...prev.slice(0, 9)]) // Keep last 10 alerts
    } catch (error) {
      console.error('Error fetching system metrics:', error)
    } finally {
      setIsLoading(false)
    }
  }

  // Generate performance data
  const generatePerformanceData = () => {
    const now = new Date()
    const data: PerformanceData = {
      pageLoads: [],
      apiCalls: [],
      databaseQueries: [],
      timestamps: []
    }
    
    // Generate last 24 hours of data
    for (let i = 23; i >= 0; i--) {
      const time = new Date(now.getTime() - i * 60 * 60 * 1000)
      data.timestamps.push(time.toLocaleTimeString())
      data.pageLoads.push(Math.random() * 2000 + 500) // 500-2500ms
      data.apiCalls.push(Math.random() * 800 + 200)   // 200-1000ms
      data.databaseQueries.push(Math.random() * 300 + 100) // 100-400ms
    }
    
    setPerformanceData(data)
  }

  useEffect(() => {
    fetchSystemMetrics()
    generatePerformanceData()
    
    // Refresh metrics every 30 seconds
    const interval = setInterval(() => {
      fetchSystemMetrics()
      generatePerformanceData()
    }, 30000)
    
    return () => clearInterval(interval)
  }, [])

  const getStatusColor = (value: number, thresholds: { warning: number; critical: number }) => {
    if (value >= thresholds.critical) return 'text-red-500'
    if (value >= thresholds.warning) return 'text-yellow-500'
    return 'text-green-500'
  }

  const getStatusIcon = (value: number, thresholds: { warning: number; critical: number }) => {
    if (value >= thresholds.critical) return <AlertTriangle className="h-4 w-4" />
    if (value >= thresholds.warning) return <AlertTriangle className="h-4 w-4" />
    return <CheckCircle className="h-4 w-4" />
  }

  const formatUptime = (seconds: number) => {
    const days = Math.floor(seconds / 86400)
    const hours = Math.floor((seconds % 86400) / 3600)
    const minutes = Math.floor((seconds % 3600) / 60)
    return `${days}d ${hours}h ${minutes}m`
  }

  const performanceReport = performanceOptimizer.generateReport()

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">System Monitoring</h2>
          <p className="text-muted-foreground">
            Real-time performance metrics and system health monitoring
          </p>
        </div>
        <Button 
          onClick={fetchSystemMetrics} 
          disabled={isLoading}
          variant="outline"
          size="sm"
        >
          <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
          Refresh
        </Button>
      </div>

      {/* System Health Overview */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">CPU Usage</CardTitle>
            {getStatusIcon(systemMetrics.cpu, { warning: 70, critical: 90 })}
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {systemMetrics.cpu.toFixed(1)}%
            </div>
            <Progress value={systemMetrics.cpu} className="mt-2" />
            <p className="text-xs text-muted-foreground mt-1">
              {systemMetrics.cpu > 80 ? 'High load detected' : 'Normal operation'}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Memory Usage</CardTitle>
            {getStatusIcon(systemMetrics.memory, { warning: 80, critical: 95 })}
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {systemMetrics.memory.toFixed(1)}%
            </div>
            <Progress value={systemMetrics.memory} className="mt-2" />
            <p className="text-xs text-muted-foreground mt-1">
              {systemMetrics.memory > 85 ? 'Memory pressure' : 'Adequate memory'}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Users</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{systemMetrics.activeUsers}</div>
            <p className="text-xs text-muted-foreground mt-1">
              Currently online
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Uptime</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatUptime(systemMetrics.uptime)}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              System uptime
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Performance Metrics */}
      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="performance">Performance</TabsTrigger>
          <TabsTrigger value="alerts">Alerts</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="h-5 w-5" />
                  Performance Summary
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <span>Average Page Load</span>
                  <Badge variant={performanceReport.averagePageLoad > 2000 ? 'destructive' : 'secondary'}>
                    {performanceReport.averagePageLoad.toFixed(0)}ms
                  </Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span>Average API Call</span>
                  <Badge variant={performanceReport.averageApiCall > 800 ? 'destructive' : 'secondary'}>
                    {performanceReport.averageApiCall.toFixed(0)}ms
                  </Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span>Average DB Query</span>
                  <Badge variant={performanceReport.averageDatabaseQuery > 300 ? 'destructive' : 'secondary'}>
                    {performanceReport.averageDatabaseQuery.toFixed(0)}ms
                  </Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span>Cache Hit Rate</span>
                  <Badge variant={performanceReport.cacheHitRate < 50 ? 'destructive' : 'secondary'}>
                    {performanceReport.cacheHitRate.toFixed(1)}%
                  </Badge>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Activity className="h-5 w-5" />
                  System Status
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <span>Database</span>
                  <Badge variant="secondary" className="flex items-center gap-1">
                    <CheckCircle className="h-3 w-3" />
                    Healthy
                  </Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span>API Services</span>
                  <Badge variant="secondary" className="flex items-center gap-1">
                    <CheckCircle className="h-3 w-3" />
                    Operational
                  </Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span>Email Service</span>
                  <Badge variant="secondary" className="flex items-center gap-1">
                    <CheckCircle className="h-3 w-3" />
                    Active
                  </Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span>Real-time Messaging</span>
                  <Badge variant="secondary" className="flex items-center gap-1">
                    <CheckCircle className="h-3 w-3" />
                    Connected
                  </Badge>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="performance" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Performance Trends (Last 24 Hours)</CardTitle>
              <CardDescription>
                Response times and performance metrics over time
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-64 flex items-end justify-between space-x-2">
                {performanceData.timestamps.map((time, index) => (
                  <div key={index} className="flex flex-col items-center space-y-2">
                    <div className="text-xs text-muted-foreground">
                      {time.split(':').slice(0, 2).join(':')}
                    </div>
                    <div className="w-8 bg-blue-200 rounded-t" style={{ height: `${performanceData.pageLoads[index] / 25}px` }} />
                    <div className="w-6 bg-green-200 rounded-t" style={{ height: `${performanceData.apiCalls[index] / 10}px` }} />
                    <div className="w-4 bg-purple-200 rounded-t" style={{ height: `${performanceData.databaseQueries[index] / 4}px` }} />
                  </div>
                ))}
              </div>
              <div className="flex justify-center space-x-6 mt-4 text-sm">
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 bg-blue-200 rounded" />
                  <span>Page Loads</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 bg-green-200 rounded" />
                  <span>API Calls</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 bg-purple-200 rounded" />
                  <span>DB Queries</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="alerts" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>System Alerts</CardTitle>
              <CardDescription>
                Recent system alerts and notifications
              </CardDescription>
            </CardHeader>
            <CardContent>
              {alerts.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <CheckCircle className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>No active alerts</p>
                  <p className="text-sm">All systems are operating normally</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {alerts.map((alert) => (
                    <Alert key={alert.id} variant={alert.type === 'error' ? 'destructive' : 'default'}>
                      <AlertTriangle className="h-4 w-4" />
                      <AlertDescription>
                        <div className="flex justify-between items-start">
                          <span>{alert.message}</span>
                          <span className="text-xs opacity-70">
                            {alert.timestamp.toLocaleTimeString()}
                          </span>
                        </div>
                      </AlertDescription>
                    </Alert>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Performance Recommendations */}
      {performanceReport.recommendations.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              Performance Recommendations
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2">
              {performanceReport.recommendations.map((recommendation, index) => (
                <li key={index} className="flex items-start space-x-2">
                  <TrendingUp className="h-4 w-4 text-blue-500 mt-0.5 flex-shrink-0" />
                  <span className="text-sm">{recommendation}</span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      )}
    </div>
  )
}

export default MonitoringDashboard 