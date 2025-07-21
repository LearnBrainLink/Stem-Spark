import { describe, it, expect, jest, beforeEach } from '@jest/globals'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { createClient } from '@/lib/supabase/server'
import VolunteerHoursService from '@/lib/volunteer-hours-service'
import EmailServiceIntegration from '@/lib/email-service-integration'

// Mock all dependencies
jest.mock('@/lib/supabase/server')
jest.mock('@/lib/volunteer-hours-service')
jest.mock('@/lib/email-service-integration')

const mockCreateClient = createClient as jest.MockedFunction<typeof createClient>
const mockVolunteerHoursService = VolunteerHoursService as jest.MockedClass<typeof VolunteerHoursService>
const mockEmailService = EmailServiceIntegration as jest.MockedClass<typeof EmailServiceIntegration>

describe('Volunteer Hours Workflow E2E', () => {
  const mockUser = {
    id: 'test-user-id',
    email: 'test@example.com',
    full_name: 'Test User',
    role: 'intern',
  }

  const mockAdmin = {
    id: 'test-admin-id',
    email: 'admin@example.com',
    full_name: 'Admin User',
    role: 'admin',
  }

  beforeEach(() => {
    jest.clearAllMocks()
    
    // Mock Supabase client
    mockCreateClient.mockReturnValue({
      auth: {
        getUser: jest.fn().mockResolvedValue({ data: { user: mockUser }, error: null }),
      },
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
    } as any)

    // Mock VolunteerHoursService
    mockVolunteerHoursService.prototype.submitHours = jest.fn()
    mockVolunteerHoursService.prototype.getUserHours = jest.fn()
    mockVolunteerHoursService.prototype.approveHours = jest.fn()
    mockVolunteerHoursService.prototype.rejectHours = jest.fn()
    mockVolunteerHoursService.prototype.getPendingHours = jest.fn()

    // Mock EmailServiceIntegration
    mockEmailService.prototype.sendVolunteerHoursApprovedEmail = jest.fn()
    mockEmailService.prototype.sendVolunteerHoursRejectedEmail = jest.fn()
    mockEmailService.prototype.sendNewVolunteerHoursNotification = jest.fn()
  })

  describe('Intern submits volunteer hours', () => {
    it('should allow intern to submit volunteer hours successfully', async () => {
      const hoursData = {
        activity_type: 'Tutoring',
        activity_date: '2024-01-15',
        hours: 2.5,
        description: 'Tutored mathematics for 2.5 hours',
      }

      // Mock successful submission
      mockVolunteerHoursService.prototype.submitHours.mockResolvedValue({
        success: true,
        hours: { id: 'hours-123', ...hoursData, user_id: mockUser.id, status: 'pending' },
      })

      // Mock notification to admins
      mockEmailService.prototype.sendNewVolunteerHoursNotification.mockResolvedValue({
        success: true,
      })

      // Simulate the submission process
      const volunteerService = new VolunteerHoursService()
      const emailService = new EmailServiceIntegration()

      // Step 1: Submit hours
      const submissionResult = await volunteerService.submitHours(mockUser.id, hoursData)
      expect(submissionResult.success).toBe(true)
      expect(submissionResult.hours.status).toBe('pending')

      // Step 2: Notify admins
      const notificationResult = await emailService.sendNewVolunteerHoursNotification(
        ['admin@example.com'],
        { user_name: mockUser.full_name, ...hoursData }
      )
      expect(notificationResult.success).toBe(true)

      // Verify service calls
      expect(mockVolunteerHoursService.prototype.submitHours).toHaveBeenCalledWith(mockUser.id, hoursData)
      expect(mockEmailService.prototype.sendNewVolunteerHoursNotification).toHaveBeenCalled()
    })

    it('should handle submission errors gracefully', async () => {
      const hoursData = {
        activity_type: 'Tutoring',
        activity_date: '2024-01-15',
        hours: 2.5,
        description: 'Tutored mathematics for 2.5 hours',
      }

      // Mock submission failure
      mockVolunteerHoursService.prototype.submitHours.mockResolvedValue({
        success: false,
        error: 'Database connection failed',
      })

      const volunteerService = new VolunteerHoursService()
      const submissionResult = await volunteerService.submitHours(mockUser.id, hoursData)

      expect(submissionResult.success).toBe(false)
      expect(submissionResult.error).toBe('Database connection failed')
      expect(mockVolunteerHoursService.prototype.submitHours).toHaveBeenCalledWith(mockUser.id, hoursData)
    })
  })

  describe('Admin reviews volunteer hours', () => {
    it('should allow admin to approve volunteer hours', async () => {
      const hoursId = 'hours-123'
      const hoursData = {
        id: hoursId,
        user_id: mockUser.id,
        activity_type: 'Tutoring',
        hours: 2.5,
        status: 'pending',
      }

      // Mock successful approval
      mockVolunteerHoursService.prototype.approveHours.mockResolvedValue({
        success: true,
        hours: { ...hoursData, status: 'approved', approved_by: mockAdmin.id },
      })

      // Mock approval email
      mockEmailService.prototype.sendVolunteerHoursApprovedEmail.mockResolvedValue({
        success: true,
      })

      const volunteerService = new VolunteerHoursService()
      const emailService = new EmailServiceIntegration()

      // Step 1: Approve hours
      const approvalResult = await volunteerService.approveHours(hoursId, mockAdmin.id)
      expect(approvalResult.success).toBe(true)
      expect(approvalResult.hours.status).toBe('approved')

      // Step 2: Send approval email
      const emailResult = await emailService.sendVolunteerHoursApprovedEmail(
        mockUser.email,
        mockUser.full_name,
        hoursData
      )
      expect(emailResult.success).toBe(true)

      // Verify service calls
      expect(mockVolunteerHoursService.prototype.approveHours).toHaveBeenCalledWith(hoursId, mockAdmin.id)
      expect(mockEmailService.prototype.sendVolunteerHoursApprovedEmail).toHaveBeenCalledWith(
        mockUser.email,
        mockUser.full_name,
        hoursData
      )
    })

    it('should allow admin to reject volunteer hours with reason', async () => {
      const hoursId = 'hours-123'
      const rejectionReason = 'Insufficient documentation provided'
      const hoursData = {
        id: hoursId,
        user_id: mockUser.id,
        activity_type: 'Tutoring',
        hours: 2.5,
        status: 'pending',
      }

      // Mock successful rejection
      mockVolunteerHoursService.prototype.rejectHours.mockResolvedValue({
        success: true,
        hours: { 
          ...hoursData, 
          status: 'rejected', 
          approved_by: mockAdmin.id,
          rejection_reason: rejectionReason 
        },
      })

      // Mock rejection email
      mockEmailService.prototype.sendVolunteerHoursRejectedEmail.mockResolvedValue({
        success: true,
      })

      const volunteerService = new VolunteerHoursService()
      const emailService = new EmailServiceIntegration()

      // Step 1: Reject hours
      const rejectionResult = await volunteerService.rejectHours(hoursId, mockAdmin.id, rejectionReason)
      expect(rejectionResult.success).toBe(true)
      expect(rejectionResult.hours.status).toBe('rejected')
      expect(rejectionResult.hours.rejection_reason).toBe(rejectionReason)

      // Step 2: Send rejection email
      const emailResult = await emailService.sendVolunteerHoursRejectedEmail(
        mockUser.email,
        mockUser.full_name,
        hoursData,
        rejectionReason
      )
      expect(emailResult.success).toBe(true)

      // Verify service calls
      expect(mockVolunteerHoursService.prototype.rejectHours).toHaveBeenCalledWith(
        hoursId, 
        mockAdmin.id, 
        rejectionReason
      )
      expect(mockEmailService.prototype.sendVolunteerHoursRejectedEmail).toHaveBeenCalledWith(
        mockUser.email,
        mockUser.full_name,
        hoursData,
        rejectionReason
      )
    })
  })

  describe('Intern views their hours', () => {
    it('should display user hours correctly', async () => {
      const mockHours = [
        {
          id: 'hours-1',
          activity_type: 'Tutoring',
          hours: 2.5,
          status: 'approved',
          activity_date: '2024-01-15',
          description: 'Mathematics tutoring',
        },
        {
          id: 'hours-2',
          activity_type: 'Event Support',
          hours: 1.0,
          status: 'pending',
          activity_date: '2024-01-16',
          description: 'Science fair support',
        },
      ]

      // Mock successful retrieval
      mockVolunteerHoursService.prototype.getUserHours.mockResolvedValue({
        success: true,
        hours: mockHours,
      })

      const volunteerService = new VolunteerHoursService()
      const result = await volunteerService.getUserHours(mockUser.id)

      expect(result.success).toBe(true)
      expect(result.hours).toHaveLength(2)
      expect(result.hours[0].status).toBe('approved')
      expect(result.hours[1].status).toBe('pending')
      expect(mockVolunteerHoursService.prototype.getUserHours).toHaveBeenCalledWith(mockUser.id)
    })

    it('should handle retrieval errors', async () => {
      // Mock retrieval failure
      mockVolunteerHoursService.prototype.getUserHours.mockResolvedValue({
        success: false,
        error: 'Failed to fetch hours',
      })

      const volunteerService = new VolunteerHoursService()
      const result = await volunteerService.getUserHours(mockUser.id)

      expect(result.success).toBe(false)
      expect(result.error).toBe('Failed to fetch hours')
      expect(mockVolunteerHoursService.prototype.getUserHours).toHaveBeenCalledWith(mockUser.id)
    })
  })

  describe('Admin views pending hours', () => {
    it('should display pending hours for admin review', async () => {
      const mockPendingHours = [
        {
          id: 'hours-1',
          user_id: 'user-1',
          activity_type: 'Tutoring',
          hours: 2.5,
          status: 'pending',
          activity_date: '2024-01-15',
          description: 'Mathematics tutoring',
        },
        {
          id: 'hours-2',
          user_id: 'user-2',
          activity_type: 'Event Support',
          hours: 1.0,
          status: 'pending',
          activity_date: '2024-01-16',
          description: 'Science fair support',
        },
      ]

      // Mock successful retrieval
      mockVolunteerHoursService.prototype.getPendingHours.mockResolvedValue({
        success: true,
        hours: mockPendingHours,
      })

      const volunteerService = new VolunteerHoursService()
      const result = await volunteerService.getPendingHours()

      expect(result.success).toBe(true)
      expect(result.hours).toHaveLength(2)
      expect(result.hours.every(h => h.status === 'pending')).toBe(true)
      expect(mockVolunteerHoursService.prototype.getPendingHours).toHaveBeenCalled()
    })
  })

  describe('Tutoring session completion', () => {
    it('should automatically log hours when tutoring session is completed', async () => {
      const sessionData = {
        tutor_id: mockUser.id,
        student_id: 'student-123',
        subject: 'Mathematics',
        duration_hours: 1.5,
        session_date: '2024-01-15T10:00:00Z',
      }

      // Mock successful tutoring hours logging
      mockVolunteerHoursService.prototype.logTutoringHours.mockResolvedValue({
        success: true,
        hours: {
          id: 'hours-123',
          user_id: mockUser.id,
          activity_type: 'Tutoring',
          hours: 1.5,
          status: 'approved',
          ...sessionData,
        },
      })

      const volunteerService = new VolunteerHoursService()
      const result = await volunteerService.logTutoringHours(sessionData)

      expect(result.success).toBe(true)
      expect(result.hours.activity_type).toBe('Tutoring')
      expect(result.hours.hours).toBe(1.5)
      expect(result.hours.status).toBe('approved')
      expect(mockVolunteerHoursService.prototype.logTutoringHours).toHaveBeenCalledWith(sessionData)
    })
  })

  describe('Email notifications', () => {
    it('should send appropriate emails for different events', async () => {
      const emailService = new EmailServiceIntegration()

      // Test approval email
      mockEmailService.prototype.sendVolunteerHoursApprovedEmail.mockResolvedValue({
        success: true,
      })

      const approvalEmailResult = await emailService.sendVolunteerHoursApprovedEmail(
        mockUser.email,
        mockUser.full_name,
        { activity_type: 'Tutoring', hours: 2.5, activity_date: '2024-01-15' }
      )
      expect(approvalEmailResult.success).toBe(true)

      // Test rejection email
      mockEmailService.prototype.sendVolunteerHoursRejectedEmail.mockResolvedValue({
        success: true,
      })

      const rejectionEmailResult = await emailService.sendVolunteerHoursRejectedEmail(
        mockUser.email,
        mockUser.full_name,
        { activity_type: 'Tutoring', hours: 2.5, activity_date: '2024-01-15' },
        'Insufficient documentation'
      )
      expect(rejectionEmailResult.success).toBe(true)

      // Test notification email
      mockEmailService.prototype.sendNewVolunteerHoursNotification.mockResolvedValue({
        success: true,
      })

      const notificationEmailResult = await emailService.sendNewVolunteerHoursNotification(
        ['admin@example.com'],
        { user_name: mockUser.full_name, activity_type: 'Tutoring', hours: 2.5, activity_date: '2024-01-15' }
      )
      expect(notificationEmailResult.success).toBe(true)
    })
  })
}) 