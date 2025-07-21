import { Metadata } from 'next'
import MonitoringDashboard from '@/components/monitoring-dashboard'

export const metadata: Metadata = {
  title: 'System Monitoring - Admin Dashboard',
  description: 'Real-time performance metrics and system health monitoring',
}

export default function MonitoringPage() {
  return (
    <div className="container mx-auto py-6">
      <MonitoringDashboard />
    </div>
  )
} 