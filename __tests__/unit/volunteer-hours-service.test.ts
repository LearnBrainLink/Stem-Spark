import { describe, it, expect, jest, beforeEach } from '@jest/globals'
import VolunteerHoursService from '@/lib/volunteer-hours-service'

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

describe('VolunteerHoursService', () => {
  let service: VolunteerHoursService
  const mockUserId = 'test-user-id'
  const mockAdminId = 'test-admin-id'

  beforeEach(() => {
    jest.clearAllMocks()
    service = new VolunteerHoursService()
  })

  describe('submitHours', () => {
    it('should submit volunteer hours successfully', async () => {
      const hoursData = {
        activity_type: 'Tutoring',
        activity_date: '2024-01-15',
        hours: 2.5,
        description: 'Test tutoring session',
      }

      const mockResponse = {
        data: { id: 'hours-id', ...hoursData, user_id: mockUserId },
        error: null,
      }

      mockSupabase.from().insert().then.mockResolvedValue(mockResponse)

      const result = await service.submitHours(mockUserId, hoursData)

      expect(result.success).toBe(true)
      expect(result.hours).toEqual(mockResponse.data)
      expect(mockSupabase.from).toHaveBeenCalledWith('volunteer_hours')
    })

    it('should handle submission errors', async () => {
      const hoursData = {
        activity_type: 'Tutoring',
        activity_date: '2024-01-15',
        hours: 2.5,
        description: 'Test tutoring session',
      }

      const mockResponse = {
        data: null,
        error: { message: 'Database error' },
      }

      mockSupabase.from().insert().then.mockResolvedValue(mockResponse)

      const result = await service.submitHours(mockUserId, hoursData)

      expect(result.success).toBe(false)
      expect(result.error).toBe('Database error')
    })
  })

  describe('getUserHours', () => {
    it('should retrieve user hours successfully', async () => {
      const mockHours = [
        { id: '1', activity_type: 'Tutoring', hours: 2.5, status: 'approved' },
        { id: '2', activity_type: 'Event Support', hours: 1.0, status: 'pending' },
      ]

      const mockResponse = {
        data: mockHours,
        error: null,
      }

      mockSupabase.from().select().eq().order().then.mockResolvedValue(mockResponse)

      const result = await service.getUserHours(mockUserId)

      expect(result.success).toBe(true)
      expect(result.hours).toEqual(mockHours)
      expect(mockSupabase.from).toHaveBeenCalledWith('volunteer_hours')
    })

    it('should handle retrieval errors', async () => {
      const mockResponse = {
        data: null,
        error: { message: 'Failed to fetch hours' },
      }

      mockSupabase.from().select().eq().order().then.mockResolvedValue(mockResponse)

      const result = await service.getUserHours(mockUserId)

      expect(result.success).toBe(false)
      expect(result.error).toBe('Failed to fetch hours')
    })
  })

  describe('approveHours', () => {
    it('should approve hours successfully', async () => {
      const hoursId = 'hours-id'
      const mockResponse = {
        data: { id: hoursId, status: 'approved', approved_by: mockAdminId },
        error: null,
      }

      mockSupabase.from().update().eq().single().then.mockResolvedValue(mockResponse)

      const result = await service.approveHours(hoursId, mockAdminId)

      expect(result.success).toBe(true)
      expect(result.hours.status).toBe('approved')
      expect(mockSupabase.from).toHaveBeenCalledWith('volunteer_hours')
    })

    it('should handle approval errors', async () => {
      const hoursId = 'hours-id'
      const mockResponse = {
        data: null,
        error: { message: 'Approval failed' },
      }

      mockSupabase.from().update().eq().single().then.mockResolvedValue(mockResponse)

      const result = await service.approveHours(hoursId, mockAdminId)

      expect(result.success).toBe(false)
      expect(result.error).toBe('Approval failed')
    })
  })

  describe('rejectHours', () => {
    it('should reject hours successfully', async () => {
      const hoursId = 'hours-id'
      const rejectionReason = 'Insufficient documentation'
      const mockResponse = {
        data: { 
          id: hoursId, 
          status: 'rejected', 
          approved_by: mockAdminId,
          rejection_reason: rejectionReason 
        },
        error: null,
      }

      mockSupabase.from().update().eq().single().then.mockResolvedValue(mockResponse)

      const result = await service.rejectHours(hoursId, mockAdminId, rejectionReason)

      expect(result.success).toBe(true)
      expect(result.hours.status).toBe('rejected')
      expect(result.hours.rejection_reason).toBe(rejectionReason)
    })

    it('should handle rejection errors', async () => {
      const hoursId = 'hours-id'
      const rejectionReason = 'Insufficient documentation'
      const mockResponse = {
        data: null,
        error: { message: 'Rejection failed' },
      }

      mockSupabase.from().update().eq().single().then.mockResolvedValue(mockResponse)

      const result = await service.rejectHours(hoursId, mockAdminId, rejectionReason)

      expect(result.success).toBe(false)
      expect(result.error).toBe('Rejection failed')
    })
  })

  describe('getPendingHours', () => {
    it('should retrieve pending hours successfully', async () => {
      const mockPendingHours = [
        { id: '1', user_id: 'user1', activity_type: 'Tutoring', hours: 2.5 },
        { id: '2', user_id: 'user2', activity_type: 'Event Support', hours: 1.0 },
      ]

      const mockResponse = {
        data: mockPendingHours,
        error: null,
      }

      mockSupabase.from().select().eq().order().then.mockResolvedValue(mockResponse)

      const result = await service.getPendingHours()

      expect(result.success).toBe(true)
      expect(result.hours).toEqual(mockPendingHours)
      expect(mockSupabase.from).toHaveBeenCalledWith('volunteer_hours')
    })

    it('should handle pending hours retrieval errors', async () => {
      const mockResponse = {
        data: null,
        error: { message: 'Failed to fetch pending hours' },
      }

      mockSupabase.from().select().eq().order().then.mockResolvedValue(mockResponse)

      const result = await service.getPendingHours()

      expect(result.success).toBe(false)
      expect(result.error).toBe('Failed to fetch pending hours')
    })
  })

  describe('getUserTotalHours', () => {
    it('should calculate total approved hours correctly', async () => {
      const mockHours = [
        { hours: 2.5, status: 'approved' },
        { hours: 1.0, status: 'approved' },
        { hours: 3.0, status: 'pending' },
        { hours: 1.5, status: 'rejected' },
      ]

      const mockResponse = {
        data: mockHours,
        error: null,
      }

      mockSupabase.from().select().eq().then.mockResolvedValue(mockResponse)

      const result = await service.getUserTotalHours(mockUserId)

      expect(result.success).toBe(true)
      expect(result.totalHours).toBe(3.5) // Only approved hours (2.5 + 1.0)
    })

    it('should handle total hours calculation errors', async () => {
      const mockResponse = {
        data: null,
        error: { message: 'Failed to calculate total hours' },
      }

      mockSupabase.from().select().eq().then.mockResolvedValue(mockResponse)

      const result = await service.getUserTotalHours(mockUserId)

      expect(result.success).toBe(false)
      expect(result.error).toBe('Failed to calculate total hours')
    })
  })

  describe('logTutoringHours', () => {
    it('should log tutoring hours successfully', async () => {
      const sessionData = {
        tutor_id: mockUserId,
        student_id: 'student-id',
        subject: 'Mathematics',
        duration_hours: 1.5,
        session_date: '2024-01-15',
      }

      const mockResponse = {
        data: { id: 'hours-id', ...sessionData, activity_type: 'Tutoring' },
        error: null,
      }

      mockSupabase.from().insert().then.mockResolvedValue(mockResponse)

      const result = await service.logTutoringHours(sessionData)

      expect(result.success).toBe(true)
      expect(result.hours.activity_type).toBe('Tutoring')
      expect(result.hours.hours).toBe(1.5)
    })

    it('should handle tutoring hours logging errors', async () => {
      const sessionData = {
        tutor_id: mockUserId,
        student_id: 'student-id',
        subject: 'Mathematics',
        duration_hours: 1.5,
        session_date: '2024-01-15',
      }

      const mockResponse = {
        data: null,
        error: { message: 'Failed to log tutoring hours' },
      }

      mockSupabase.from().insert().then.mockResolvedValue(mockResponse)

      const result = await service.logTutoringHours(sessionData)

      expect(result.success).toBe(false)
      expect(result.error).toBe('Failed to log tutoring hours')
    })
  })
}) 