import { Database } from './database.types'

type Profile = Database['public']['Tables']['profiles']['Row']
type VolunteerHours = Database['public']['Tables']['volunteer_hours']['Row']
type TutoringSession = Database['public']['Tables']['tutoring_sessions']['Row']
type InternApplication = Database['public']['Tables']['intern_applications']['Row']

interface EmailResult {
  success: boolean
  messageId?: string
  error?: string
}

interface WelcomeEmailData {
  email: string
  full_name: string
  role: string
  login_url?: string
}

interface PasswordResetData {
  email: string
  reset_token: string
  reset_url: string
}

interface VolunteerHoursApprovedData {
  intern_email: string
  intern_name: string
  activity_type: string
  description: string
  hours: number
  date: string
  total_hours: number
}

interface VolunteerHoursRejectedData {
  intern_email: string
  intern_name: string
  activity_type: string
  description: string
  hours: number
  date: string
  rejection_reason: string
}

interface TutoringNotificationData {
  recipient_email: string
  recipient_name: string
  session_type: 'Scheduled' | 'Cancelled' | 'Completed'
  message: string
  subject: string
  session_date: string
  duration_minutes: number
  tutor_name: string
  student_name: string
  notes?: string
}

interface AdminNotificationData {
  admin_email: string
  admin_name: string
  notification_message: string
  notification_type: string
  priority?: 'low' | 'normal' | 'high' | 'urgent'
  action_required?: string
  additional_info?: string
}

class EmailServiceIntegration {
  private baseUrl: string

  constructor() {
    this.baseUrl = process.env.FLASK_MAIL_SERVICE_URL || 'http://localhost:5000'
  }

  private async makeRequest(endpoint: string, data: any): Promise<EmailResult> {
    try {
      const response = await fetch(`${this.baseUrl}${endpoint}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const result = await response.json()
      return result
    } catch (error) {
      console.error(`Email service error (${endpoint}):`, error)
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      }
    }
  }

  async sendWelcomeEmail(user: Profile): Promise<EmailResult> {
    const data: WelcomeEmailData = {
      email: user.email,
      full_name: user.full_name,
      role: user.role,
      login_url: `${process.env.NEXT_PUBLIC_SITE_URL}/login`
    }

    return this.makeRequest('/send-welcome-email', data)
  }

  async sendPasswordResetEmail(email: string, resetToken: string): Promise<EmailResult> {
    const data: PasswordResetData = {
      email,
      reset_token: resetToken,
      reset_url: `${process.env.NEXT_PUBLIC_SITE_URL}/reset-password?token=${resetToken}`
    }

    return this.makeRequest('/send-password-reset', data)
  }

  async sendVolunteerHourApproval(intern: Profile, hours: VolunteerHours, totalHours: number): Promise<EmailResult> {
    const data: VolunteerHoursApprovedData = {
      intern_email: intern.email,
      intern_name: intern.full_name,
      activity_type: hours.activity_type,
      description: hours.description,
      hours: hours.hours,
      date: hours.date,
      total_hours: totalHours
    }

    return this.makeRequest('/send-volunteer-hours-approved', data)
  }

  async sendVolunteerHourRejection(intern: Profile, hours: VolunteerHours, rejectionReason: string): Promise<EmailResult> {
    const data: VolunteerHoursRejectedData = {
      intern_email: intern.email,
      intern_name: intern.full_name,
      activity_type: hours.activity_type,
      description: hours.description,
      hours: hours.hours,
      date: hours.date,
      rejection_reason: rejectionReason
    }

    return this.makeRequest('/send-volunteer-hours-rejected', data)
  }

  async sendTutoringNotification(
    recipient: Profile,
    session: TutoringSession,
    tutor: Profile,
    student: Profile,
    sessionType: 'Scheduled' | 'Cancelled' | 'Completed',
    message: string,
    notes?: string
  ): Promise<EmailResult> {
    const data: TutoringNotificationData = {
      recipient_email: recipient.email,
      recipient_name: recipient.full_name,
      session_type: sessionType,
      message,
      subject: session.subject,
      session_date: session.session_date,
      duration_minutes: session.duration_minutes,
      tutor_name: tutor.full_name,
      student_name: student.full_name,
      notes
    }

    return this.makeRequest('/send-tutoring-notification', data)
  }

  async sendAdminNotification(
    admin: Profile,
    notificationType: string,
    message: string,
    priority: 'low' | 'normal' | 'high' | 'urgent' = 'normal',
    actionRequired?: string,
    additionalInfo?: string
  ): Promise<EmailResult> {
    const data: AdminNotificationData = {
      admin_email: admin.email,
      admin_name: admin.full_name,
      notification_message: message,
      notification_type: notificationType,
      priority,
      action_required: actionRequired,
      additional_info: additionalInfo
    }

    return this.makeRequest('/send-admin-notification', data)
  }

  async sendApplicationNotification(
    applicant: InternApplication,
    admin: Profile,
    decision: 'approved' | 'rejected' | 'interview_scheduled',
    feedback?: string
  ): Promise<EmailResult> {
    const message = decision === 'approved' 
      ? `Congratulations! Your internship application has been approved. Welcome to Novakinetix Academy!`
      : decision === 'rejected'
      ? `Thank you for your interest in Novakinetix Academy. After careful review, we regret to inform you that we are unable to move forward with your application at this time.`
      : `Your internship application has been reviewed and we would like to schedule an interview to discuss your application further.`

    const data: AdminNotificationData = {
      admin_email: applicant.applicant_email,
      admin_name: applicant.full_name,
      notification_message: message,
      notification_type: 'Application Review',
      priority: 'normal',
      action_required: decision === 'interview_scheduled' ? 'Please contact us to schedule your interview.' : undefined,
      additional_info: feedback
    }

    return this.makeRequest('/send-admin-notification', data)
  }

  async sendCustomEmail(
    toEmail: string,
    subject: string,
    template: string,
    templateData: Record<string, any>
  ): Promise<EmailResult> {
    const data = {
      to_email: toEmail,
      subject,
      template,
      template_data: templateData
    }

    return this.makeRequest('/send-custom-email', data)
  }

  async checkHealth(): Promise<boolean> {
    try {
      const response = await fetch(`${this.baseUrl}/health`)
      return response.ok
    } catch (error) {
      console.error('Email service health check failed:', error)
      return false
    }
  }
}

// Export singleton instance
export const emailService = new EmailServiceIntegration()

// Export types for use in other modules
export type {
  EmailResult,
  WelcomeEmailData,
  PasswordResetData,
  VolunteerHoursApprovedData,
  VolunteerHoursRejectedData,
  TutoringNotificationData,
  AdminNotificationData
} 