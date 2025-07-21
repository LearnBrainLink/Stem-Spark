import { Metadata } from 'next'
import SecurityAudit from '@/components/security-audit'

export const metadata: Metadata = {
  title: 'Security Audit - Admin Dashboard',
  description: 'Monitor security events, vulnerabilities, and system health',
}

export default function SecurityPage() {
  return (
    <div className="container mx-auto py-6">
      <SecurityAudit />
    </div>
  )
} 