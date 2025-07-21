'use client'

import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { 
  Shield, 
  AlertTriangle, 
  CheckCircle, 
  XCircle,
  Eye,
  Lock,
  Users,
  Activity,
  RefreshCw,
  Download,
  Settings,
  FileText
} from 'lucide-react'

interface SecurityEvent {
  id: string
  type: string
  severity: 'low' | 'medium' | 'high' | 'critical'
  message: string
  timestamp: Date
  user_id?: string
  metadata?: Record<string, any>
}

interface Vulnerability {
  id: string
  title: string
  description: string
  severity: 'low' | 'medium' | 'high' | 'critical'
  status: 'open' | 'fixed' | 'investigating'
  discovered: Date
  fixed?: Date
  cve?: string
}

interface SecurityMetrics {
  totalEvents: number
  eventsBySeverity: Record<string, number>
  eventsByType: Record<string, number>
  vulnerabilities: {
    total: number
    open: number
    fixed: number
  }
  lastScan: Date
}

const SecurityAudit: React.FC = () => {
  const [securityEvents, setSecurityEvents] = useState<SecurityEvent[]>([])
  const [vulnerabilities, setVulnerabilities] = useState<Vulnerability[]>([])
  const [metrics, setMetrics] = useState<SecurityMetrics>({
    totalEvents: 0,
    eventsBySeverity: {},
    eventsByType: {},
    vulnerabilities: { total: 0, open: 0, fixed: 0 },
    lastScan: new Date()
  })
  const [isLoading, setIsLoading] = useState(false)
  const [activeTab, setActiveTab] = useState('overview')

  // Simulate security data (in real app, this would come from security monitoring service)
  const fetchSecurityData = async () => {
    setIsLoading(true)
    try {
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      // Mock security events
      const mockEvents: SecurityEvent[] = [
        {
          id: '1',
          type: 'failed_login',
          severity: 'medium',
          message: 'Multiple failed login attempts detected',
          timestamp: new Date(Date.now() - 30 * 60 * 1000),
          user_id: 'user123',
          metadata: { attempts: 5, ip: '192.168.1.100' }
        },
        {
          id: '2',
          type: 'suspicious_activity',
          severity: 'high',
          message: 'Unusual data access pattern detected',
          timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000),
          user_id: 'user456',
          metadata: { accessCount: 150, timeWindow: '1 hour' }
        },
        {
          id: '3',
          type: 'rate_limit_exceeded',
          severity: 'low',
          message: 'API rate limit exceeded',
          timestamp: new Date(Date.now() - 5 * 60 * 1000),
          metadata: { endpoint: '/api/volunteer-hours', limit: 100 }
        }
      ]
      
      // Mock vulnerabilities
      const mockVulnerabilities: Vulnerability[] = [
        {
          id: '1',
          title: 'SQL Injection Vulnerability',
          description: 'Potential SQL injection in user input validation',
          severity: 'high',
          status: 'investigating',
          discovered: new Date(Date.now() - 24 * 60 * 60 * 1000),
          cve: 'CVE-2024-1234'
        },
        {
          id: '2',
          title: 'XSS in Message System',
          description: 'Cross-site scripting vulnerability in messaging component',
          severity: 'medium',
          status: 'open',
          discovered: new Date(Date.now() - 12 * 60 * 60 * 1000)
        },
        {
          id: '3',
          title: 'Weak Password Policy',
          description: 'Password policy does not enforce sufficient complexity',
          severity: 'low',
          status: 'fixed',
          discovered: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
          fixed: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000)
        }
      ]
      
      // Calculate metrics
      const eventsBySeverity = mockEvents.reduce((acc, event) => {
        acc[event.severity] = (acc[event.severity] || 0) + 1
        return acc
      }, {} as Record<string, number>)
      
      const eventsByType = mockEvents.reduce((acc, event) => {
        acc[event.type] = (acc[event.type] || 0) + 1
        return acc
      }, {} as Record<string, number>)
      
      const vulnMetrics = {
        total: mockVulnerabilities.length,
        open: mockVulnerabilities.filter(v => v.status === 'open').length,
        fixed: mockVulnerabilities.filter(v => v.status === 'fixed').length
      }
      
      setSecurityEvents(mockEvents)
      setVulnerabilities(mockVulnerabilities)
      setMetrics({
        totalEvents: mockEvents.length,
        eventsBySeverity,
        eventsByType,
        vulnerabilities: vulnMetrics,
        lastScan: new Date()
      })
      
    } catch (error) {
      console.error('Error fetching security data:', error)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchSecurityData()
    
    // Refresh data every 5 minutes
    const interval = setInterval(fetchSecurityData, 5 * 60 * 1000)
    return () => clearInterval(interval)
  }, [])

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return 'bg-red-500'
      case 'high': return 'bg-orange-500'
      case 'medium': return 'bg-yellow-500'
      case 'low': return 'bg-blue-500'
      default: return 'bg-gray-500'
    }
  }

  const getSeverityIcon = (severity: string) => {
    switch (severity) {
      case 'critical': return <XCircle className="h-4 w-4" />
      case 'high': return <AlertTriangle className="h-4 w-4" />
      case 'medium': return <AlertTriangle className="h-4 w-4" />
      case 'low': return <Eye className="h-4 w-4" />
      default: return <Eye className="h-4 w-4" />
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'open': return 'destructive'
      case 'investigating': return 'secondary'
      case 'fixed': return 'default'
      default: return 'secondary'
    }
  }

  const exportSecurityReport = () => {
    const report = {
      timestamp: new Date().toISOString(),
      metrics,
      events: securityEvents,
      vulnerabilities,
      summary: {
        totalEvents: metrics.totalEvents,
        openVulnerabilities: metrics.vulnerabilities.open,
        securityScore: calculateSecurityScore()
      }
    }
    
    const blob = new Blob([JSON.stringify(report, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `security-report-${new Date().toISOString().split('T')[0]}.json`
    a.click()
    URL.revokeObjectURL(url)
  }

  const calculateSecurityScore = (): number => {
    let score = 100
    
    // Deduct points for vulnerabilities
    score -= metrics.vulnerabilities.open * 20
    score -= metrics.vulnerabilities.total * 5
    
    // Deduct points for security events
    score -= (metrics.eventsBySeverity.critical || 0) * 15
    score -= (metrics.eventsBySeverity.high || 0) * 10
    score -= (metrics.eventsBySeverity.medium || 0) * 5
    
    return Math.max(0, score)
  }

  const securityScore = calculateSecurityScore()

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Security Audit</h2>
          <p className="text-muted-foreground">
            Monitor security events, vulnerabilities, and system health
          </p>
        </div>
        <div className="flex space-x-2">
          <Button 
            onClick={fetchSecurityData} 
            disabled={isLoading}
            variant="outline"
            size="sm"
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
          <Button onClick={exportSecurityReport} variant="outline" size="sm">
            <Download className="h-4 w-4 mr-2" />
            Export Report
          </Button>
        </div>
      </div>

      {/* Security Score */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Security Score
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center space-x-4">
            <div className="text-4xl font-bold">
              {securityScore}
            </div>
            <div className="flex-1">
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className={`h-2 rounded-full ${
                    securityScore >= 80 ? 'bg-green-500' :
                    securityScore >= 60 ? 'bg-yellow-500' :
                    securityScore >= 40 ? 'bg-orange-500' : 'bg-red-500'
                  }`}
                  style={{ width: `${securityScore}%` }}
                />
              </div>
              <p className="text-sm text-muted-foreground mt-1">
                {securityScore >= 80 ? 'Excellent' :
                 securityScore >= 60 ? 'Good' :
                 securityScore >= 40 ? 'Fair' : 'Poor'} security posture
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Security Metrics */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Security Events</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics.totalEvents}</div>
            <p className="text-xs text-muted-foreground">
              Last 24 hours
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Open Vulnerabilities</CardTitle>
            <AlertTriangle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-500">
              {metrics.vulnerabilities.open}
            </div>
            <p className="text-xs text-muted-foreground">
              Require attention
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Fixed Vulnerabilities</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-500">
              {metrics.vulnerabilities.fixed}
            </div>
            <p className="text-xs text-muted-foreground">
              Resolved issues
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Last Scan</CardTitle>
            <Settings className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {metrics.lastScan.toLocaleTimeString()}
            </div>
            <p className="text-xs text-muted-foreground">
              {metrics.lastScan.toLocaleDateString()}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Security Details */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="events">Security Events</TabsTrigger>
          <TabsTrigger value="vulnerabilities">Vulnerabilities</TabsTrigger>
          <TabsTrigger value="recommendations">Recommendations</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Events by Severity</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {Object.entries(metrics.eventsBySeverity).map(([severity, count]) => (
                    <div key={severity} className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <div className={`w-3 h-3 rounded-full ${getSeverityColor(severity)}`} />
                        <span className="capitalize">{severity}</span>
                      </div>
                      <Badge variant="secondary">{count}</Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Events by Type</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {Object.entries(metrics.eventsByType).map(([type, count]) => (
                    <div key={type} className="flex items-center justify-between">
                      <span className="capitalize">{type.replace('_', ' ')}</span>
                      <Badge variant="secondary">{count}</Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="events" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Recent Security Events</CardTitle>
              <CardDescription>
                Latest security events and alerts
              </CardDescription>
            </CardHeader>
            <CardContent>
              {securityEvents.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <CheckCircle className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>No security events detected</p>
                  <p className="text-sm">All systems are secure</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {securityEvents.map((event) => (
                    <Alert key={event.id}>
                      <div className="flex items-start justify-between">
                        <div className="flex items-start space-x-2">
                          {getSeverityIcon(event.severity)}
                          <div>
                            <AlertDescription className="font-medium">
                              {event.message}
                            </AlertDescription>
                            <p className="text-xs text-muted-foreground mt-1">
                              {event.timestamp.toLocaleString()}
                            </p>
                            {event.metadata && (
                              <p className="text-xs text-muted-foreground">
                                {Object.entries(event.metadata)
                                  .map(([key, value]) => `${key}: ${value}`)
                                  .join(', ')}
                              </p>
                            )}
                          </div>
                        </div>
                        <Badge variant="outline" className="capitalize">
                          {event.severity}
                        </Badge>
                      </div>
                    </Alert>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="vulnerabilities" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Security Vulnerabilities</CardTitle>
              <CardDescription>
                Known vulnerabilities and their status
              </CardDescription>
            </CardHeader>
            <CardContent>
              {vulnerabilities.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <CheckCircle className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>No vulnerabilities found</p>
                  <p className="text-sm">System is secure</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {vulnerabilities.map((vuln) => (
                    <div key={vuln.id} className="border rounded-lg p-4">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center space-x-2 mb-2">
                            <h4 className="font-medium">{vuln.title}</h4>
                            <Badge variant={getStatusColor(vuln.status)} className="capitalize">
                              {vuln.status}
                            </Badge>
                            <Badge variant="outline" className="capitalize">
                              {vuln.severity}
                            </Badge>
                          </div>
                          <p className="text-sm text-muted-foreground mb-2">
                            {vuln.description}
                          </p>
                          <div className="flex items-center space-x-4 text-xs text-muted-foreground">
                            <span>Discovered: {vuln.discovered.toLocaleDateString()}</span>
                            {vuln.fixed && (
                              <span>Fixed: {vuln.fixed.toLocaleDateString()}</span>
                            )}
                            {vuln.cve && (
                              <span>CVE: {vuln.cve}</span>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="recommendations" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Security Recommendations</CardTitle>
              <CardDescription>
                Actionable recommendations to improve security
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {metrics.vulnerabilities.open > 0 && (
                  <Alert>
                    <AlertTriangle className="h-4 w-4" />
                    <AlertDescription>
                      <strong>Address Open Vulnerabilities:</strong> Review and fix {metrics.vulnerabilities.open} open vulnerabilities to improve security posture.
                    </AlertDescription>
                  </Alert>
                )}
                
                {(metrics.eventsBySeverity.critical || 0) > 0 && (
                  <Alert>
                    <XCircle className="h-4 w-4" />
                    <AlertDescription>
                      <strong>Investigate Critical Events:</strong> Review {metrics.eventsBySeverity.critical} critical security events immediately.
                    </AlertDescription>
                  </Alert>
                )}
                
                {securityScore < 80 && (
                  <Alert>
                    <Settings className="h-4 w-4" />
                    <AlertDescription>
                      <strong>Improve Security Score:</strong> Current score of {securityScore} indicates areas for improvement. Consider implementing additional security measures.
                    </AlertDescription>
                  </Alert>
                )}
                
                <div className="space-y-2">
                  <h4 className="font-medium">General Recommendations:</h4>
                  <ul className="space-y-1 text-sm text-muted-foreground">
                    <li>• Enable two-factor authentication for all admin accounts</li>
                    <li>• Regularly update dependencies and security patches</li>
                    <li>• Implement automated security scanning in CI/CD pipeline</li>
                    <li>• Conduct regular security training for team members</li>
                    <li>• Set up automated alerts for suspicious activities</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}

export default SecurityAudit 