import { describe, it, expect, jest, beforeEach } from '@jest/globals'
import EmailServiceIntegration from '@/lib/email-service-integration'

// Mock fetch
global.fetch = jest.fn()

// Mock Supabase client
const mockSupabase = {
  from: jest.fn(() => ({
    select: jest.fn().mockReturnThis(),
    insert: jest.fn().mockReturnThis(),
    update: jest.fn().mockReturnThis(),
    delete: jest.fn().mockReturnThis(),
    eq: jest.fn().mockReturnThis(),
    order: jest.fn().mockReturnThis(),
    single: jest.fn(),
    then: jest.fn(),
  })),
}

jest.mock('@/lib/supabase/server', () => ({
  createClient: jest.fn(() => mockSupabase),
}))

describe('EmailServiceIntegration', () => {
  let emailService: EmailServiceIntegration
  const mockUserEmail = 'test@example.com'
  const mockUserName = 'Test User'

  beforeEach(() => {
    jest.clearAllMocks()
    emailService = new EmailServiceIntegration()
    ;(global.fetch as jest.Mock).mockClear()
  })

  describe('sendEmail', () => {
    it('should send email successfully via Flask Mail service', async () => {
      const emailParams = {
        to_email: mockUserEmail,
        subject: 'Test Email',
        template: 'welcome',
        template_data: { name: mockUserName },
        fallback_html: '<p>Welcome!</p>',
      }

      const mockResponse = {
        ok: true,
        json: jest.fn().mockResolvedValue({ success: true, message_id: 'msg-123' }),
      }

      ;(global.fetch as jest.Mock).mockResolvedValue(mockResponse)

      const result = await emailService.sendEmail(emailParams)

      expect(result.success).toBe(true)
      expect(global.fetch).toHaveBeenCalledWith('/api/send-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(emailParams),
      })
    })

    it('should handle Flask Mail service errors', async () => {
      const emailParams = {
        to_email: mockUserEmail,
        subject: 'Test Email',
        template: 'welcome',
        template_data: { name: mockUserName },
      }

      const mockResponse = {
        ok: false,
        status: 500,
        json: jest.fn().mockResolvedValue({ error: 'Flask Mail service error' }),
      }

      ;(global.fetch as jest.Mock).mockResolvedValue(mockResponse)

      const result = await emailService.sendEmail(emailParams)

      expect(result.success).toBe(false)
      expect(result.error).toContain('Flask Mail service error')
    })

    it('should fallback to Supabase email when Flask Mail is unavailable', async () => {
      const emailParams = {
        to_email: mockUserEmail,
        subject: 'Test Email',
        template: 'welcome',
        template_data: { name: mockUserName },
        fallback_html: '<p>Welcome!</p>',
      }

      // Mock Flask Mail service failure
      const mockFlaskResponse = {
        ok: false,
        status: 503,
        json: jest.fn().mockResolvedValue({ error: 'Service unavailable' }),
      }

      // Mock Supabase fallback success
      const mockSupabaseResponse = {
        data: { id: 'email-123' },
        error: null,
      }

      ;(global.fetch as jest.Mock).mockResolvedValue(mockFlaskResponse)
      mockSupabase.from().insert().then.mockResolvedValue(mockSupabaseResponse)

      const result = await emailService.sendEmail(emailParams)

      expect(result.success).toBe(true)
      expect(result.fallback).toBe(true)
    })
  })

  describe('sendWelcomeEmail', () => {
    it('should send welcome email successfully', async () => {
      const verificationLink = 'https://example.com/verify?token=123'
      const mockResponse = {
        ok: true,
        json: jest.fn().mockResolvedValue({ success: true, message_id: 'welcome-123' }),
      }

      ;(global.fetch as jest.Mock).mockResolvedValue(mockResponse)

      const result = await emailService.sendWelcomeEmail(mockUserEmail, mockUserName, verificationLink)

      expect(result.success).toBe(true)
      expect(global.fetch).toHaveBeenCalledWith('/api/send-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          to_email: mockUserEmail,
          subject: 'Welcome to STEM Spark Academy!',
          template: 'welcome',
          template_data: {
            name: mockUserName,
            verification_link: verificationLink,
            site_url: 'http://localhost:3000',
          },
        }),
      })
    })
  })

  describe('sendPasswordResetEmail', () => {
    it('should send password reset email successfully', async () => {
      const resetLink = 'https://example.com/reset?token=456'
      const mockResponse = {
        ok: true,
        json: jest.fn().mockResolvedValue({ success: true, message_id: 'reset-123' }),
      }

      ;(global.fetch as jest.Mock).mockResolvedValue(mockResponse)

      const result = await emailService.sendPasswordResetEmail(mockUserEmail, resetLink)

      expect(result.success).toBe(true)
      expect(global.fetch).toHaveBeenCalledWith('/api/send-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          to_email: mockUserEmail,
          subject: 'Reset Your Password - STEM Spark Academy',
          template: 'password_reset',
          template_data: {
            reset_link: resetLink,
            site_url: 'http://localhost:3000',
          },
        }),
      })
    })
  })

  describe('sendVolunteerHoursApprovedEmail', () => {
    it('should send volunteer hours approved email successfully', async () => {
      const hoursData = {
        activity_type: 'Tutoring',
        hours: 2.5,
        activity_date: '2024-01-15',
      }

      const mockResponse = {
        ok: true,
        json: jest.fn().mockResolvedValue({ success: true, message_id: 'approved-123' }),
      }

      ;(global.fetch as jest.Mock).mockResolvedValue(mockResponse)

      const result = await emailService.sendVolunteerHoursApprovedEmail(mockUserEmail, mockUserName, hoursData)

      expect(result.success).toBe(true)
      expect(global.fetch).toHaveBeenCalledWith('/api/send-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          to_email: mockUserEmail,
          subject: 'Volunteer Hours Approved - STEM Spark Academy',
          template: 'volunteer_hours_approved',
          template_data: {
            name: mockUserName,
            hours_data: hoursData,
            site_url: 'http://localhost:3000',
          },
        }),
      })
    })
  })

  describe('sendVolunteerHoursRejectedEmail', () => {
    it('should send volunteer hours rejected email successfully', async () => {
      const hoursData = {
        activity_type: 'Tutoring',
        hours: 2.5,
        activity_date: '2024-01-15',
      }
      const rejectionReason = 'Insufficient documentation'

      const mockResponse = {
        ok: true,
        json: jest.fn().mockResolvedValue({ success: true, message_id: 'rejected-123' }),
      }

      ;(global.fetch as jest.Mock).mockResolvedValue(mockResponse)

      const result = await emailService.sendVolunteerHoursRejectedEmail(
        mockUserEmail,
        mockUserName,
        hoursData,
        rejectionReason
      )

      expect(result.success).toBe(true)
      expect(global.fetch).toHaveBeenCalledWith('/api/send-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          to_email: mockUserEmail,
          subject: 'Volunteer Hours Update - STEM Spark Academy',
          template: 'volunteer_hours_rejected',
          template_data: {
            name: mockUserName,
            hours_data: hoursData,
            rejection_reason: rejectionReason,
            site_url: 'http://localhost:3000',
          },
        }),
      })
    })
  })

  describe('sendNewVolunteerHoursNotification', () => {
    it('should send new volunteer hours notification to admins', async () => {
      const adminEmails = ['admin1@example.com', 'admin2@example.com']
      const hoursData = {
        user_name: mockUserName,
        activity_type: 'Tutoring',
        hours: 2.5,
        activity_date: '2024-01-15',
      }

      const mockResponse = {
        ok: true,
        json: jest.fn().mockResolvedValue({ success: true, message_id: 'notification-123' }),
      }

      ;(global.fetch as jest.Mock).mockResolvedValue(mockResponse)

      const result = await emailService.sendNewVolunteerHoursNotification(adminEmails, hoursData)

      expect(result.success).toBe(true)
      expect(global.fetch).toHaveBeenCalledWith('/api/send-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          to_email: adminEmails.join(','),
          subject: 'New Volunteer Hours Submission - STEM Spark Academy',
          template: 'new_volunteer_hours_notification',
          template_data: {
            hours_data: hoursData,
            site_url: 'http://localhost:3000',
          },
        }),
      })
    })
  })

  describe('sendTutoringSessionConfirmation', () => {
    it('should send tutoring session confirmation email', async () => {
      const sessionData = {
        subject: 'Mathematics',
        session_date: '2024-01-15T10:00:00Z',
        duration_hours: 1.5,
        tutor_name: 'John Tutor',
      }

      const mockResponse = {
        ok: true,
        json: jest.fn().mockResolvedValue({ success: true, message_id: 'session-123' }),
      }

      ;(global.fetch as jest.Mock).mockResolvedValue(mockResponse)

      const result = await emailService.sendTutoringSessionConfirmation(mockUserEmail, mockUserName, sessionData)

      expect(result.success).toBe(true)
      expect(global.fetch).toHaveBeenCalledWith('/api/send-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          to_email: mockUserEmail,
          subject: 'Tutoring Session Confirmation - STEM Spark Academy',
          template: 'tutoring_session_confirmation',
          template_data: {
            name: mockUserName,
            session_data: sessionData,
            site_url: 'http://localhost:3000',
          },
        }),
      })
    })
  })

  describe('checkEmailServiceHealth', () => {
    it('should check Flask Mail service health successfully', async () => {
      const mockResponse = {
        ok: true,
        json: jest.fn().mockResolvedValue({ 
          status: 'healthy', 
          service: 'Flask Mail',
          timestamp: new Date().toISOString() 
        }),
      }

      ;(global.fetch as jest.Mock).mockResolvedValue(mockResponse)

      const result = await emailService.checkEmailServiceHealth()

      expect(result.healthy).toBe(true)
      expect(result.service).toBe('Flask Mail')
      expect(global.fetch).toHaveBeenCalledWith('/api/send-email', {
        method: 'GET',
      })
    })

    it('should detect unhealthy Flask Mail service', async () => {
      const mockResponse = {
        ok: false,
        status: 503,
        json: jest.fn().mockResolvedValue({ 
          status: 'unhealthy', 
          error: 'Service unavailable' 
        }),
      }

      ;(global.fetch as jest.Mock).mockResolvedValue(mockResponse)

      const result = await emailService.checkEmailServiceHealth()

      expect(result.healthy).toBe(false)
      expect(result.error).toBe('Service unavailable')
    })

    it('should handle network errors', async () => {
      ;(global.fetch as jest.Mock).mockRejectedValue(new Error('Network error'))

      const result = await emailService.checkEmailServiceHealth()

      expect(result.healthy).toBe(false)
      expect(result.error).toContain('Network error')
    })
  })
}) 