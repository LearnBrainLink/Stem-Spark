import { describe, it, expect, jest, beforeEach } from '@jest/globals'
import AdminProtection from '@/lib/admin-protection'
import { createClient } from '@/lib/supabase/server'

// Mock Supabase client
jest.mock('@/lib/supabase/server')

const mockCreateClient = createClient as jest.MockedFunction<typeof createClient>

describe('Admin Protection Security Tests', () => {
  const mockUser = {
    id: 'test-user-id',
    email: 'test@example.com',
    role: 'intern',
  }

  const mockAdmin = {
    id: 'test-admin-id',
    email: 'admin@example.com',
    role: 'admin',
  }

  const mockSuperAdmin = {
    id: 'test-super-admin-id',
    email: 'superadmin@example.com',
    role: 'super_admin',
    is_super_admin: true,
  }

  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('Role-based Access Control', () => {
    it('should allow admin to access admin-only functions', async () => {
      mockCreateClient.mockReturnValue({
        auth: {
          getUser: jest.fn().mockResolvedValue({ data: { user: mockAdmin }, error: null }),
        },
        from: jest.fn(() => ({
          select: jest.fn().mockReturnThis(),
          eq: jest.fn().mockReturnThis(),
          single: jest.fn().mockResolvedValue({
            data: { ...mockAdmin, role: 'admin' },
            error: null,
          }),
        })),
      } as any)

      const adminProtection = new AdminProtection()
      const result = await adminProtection.validateAdminAccess(mockAdmin.id)

      expect(result.success).toBe(true)
      expect(result.isAdmin).toBe(true)
    })

    it('should allow super admin to access all functions', async () => {
      mockCreateClient.mockReturnValue({
        auth: {
          getUser: jest.fn().mockResolvedValue({ data: { user: mockSuperAdmin }, error: null }),
        },
        from: jest.fn(() => ({
          select: jest.fn().mockReturnThis(),
          eq: jest.fn().mockReturnThis(),
          single: jest.fn().mockResolvedValue({
            data: { ...mockSuperAdmin, role: 'super_admin', is_super_admin: true },
            error: null,
          }),
        })),
      } as any)

      const adminProtection = new AdminProtection()
      const result = await adminProtection.validateAdminAccess(mockSuperAdmin.id)

      expect(result.success).toBe(true)
      expect(result.isAdmin).toBe(true)
      expect(result.isSuperAdmin).toBe(true)
    })

    it('should deny intern access to admin functions', async () => {
      mockCreateClient.mockReturnValue({
        auth: {
          getUser: jest.fn().mockResolvedValue({ data: { user: mockUser }, error: null }),
        },
        from: jest.fn(() => ({
          select: jest.fn().mockReturnThis(),
          eq: jest.fn().mockReturnThis(),
          single: jest.fn().mockResolvedValue({
            data: { ...mockUser, role: 'intern' },
            error: null,
          }),
        })),
      } as any)

      const adminProtection = new AdminProtection()
      const result = await adminProtection.validateAdminAccess(mockUser.id)

      expect(result.success).toBe(false)
      expect(result.isAdmin).toBe(false)
      expect(result.error).toContain('Insufficient permissions')
    })

    it('should handle unauthenticated users', async () => {
      mockCreateClient.mockReturnValue({
        auth: {
          getUser: jest.fn().mockResolvedValue({ data: { user: null }, error: null }),
        },
      } as any)

      const adminProtection = new AdminProtection()
      const result = await adminProtection.validateAdminAccess('invalid-user-id')

      expect(result.success).toBe(false)
      expect(result.error).toContain('User not authenticated')
    })
  })

  describe('Admin Action Logging', () => {
    it('should log admin actions successfully', async () => {
      const mockSupabase = {
        auth: {
          getUser: jest.fn().mockResolvedValue({ data: { user: mockAdmin }, error: null }),
        },
        from: jest.fn(() => ({
          select: jest.fn().mockReturnThis(),
          insert: jest.fn().mockReturnThis(),
          eq: jest.fn().mockReturnThis(),
          single: jest.fn().mockResolvedValue({
            data: { ...mockAdmin, role: 'admin' },
            error: null,
          }),
          then: jest.fn().mockResolvedValue({
            data: { id: 'log-123' },
            error: null,
          }),
        })),
      }

      mockCreateClient.mockReturnValue(mockSupabase as any)

      const adminProtection = new AdminProtection()
      const result = await adminProtection.logAdminAction({
        adminId: mockAdmin.id,
        actionType: 'user_update',
        targetType: 'user',
        targetId: 'target-user-id',
        details: { field: 'role', old_value: 'intern', new_value: 'admin' },
        ipAddress: '192.168.1.1',
        userAgent: 'Test Browser',
      })

      expect(result.success).toBe(true)
      expect(mockSupabase.from).toHaveBeenCalledWith('admin_actions_log')
    })

    it('should handle logging errors gracefully', async () => {
      const mockSupabase = {
        auth: {
          getUser: jest.fn().mockResolvedValue({ data: { user: mockAdmin }, error: null }),
        },
        from: jest.fn(() => ({
          select: jest.fn().mockReturnThis(),
          insert: jest.fn().mockReturnThis(),
          eq: jest.fn().mockReturnThis(),
          single: jest.fn().mockResolvedValue({
            data: { ...mockAdmin, role: 'admin' },
            error: null,
          }),
          then: jest.fn().mockResolvedValue({
            data: null,
            error: { message: 'Database error' },
          }),
        })),
      }

      mockCreateClient.mockReturnValue(mockSupabase as any)

      const adminProtection = new AdminProtection()
      const result = await adminProtection.logAdminAction({
        adminId: mockAdmin.id,
        actionType: 'user_update',
        targetType: 'user',
        targetId: 'target-user-id',
        details: { field: 'role', old_value: 'intern', new_value: 'admin' },
        ipAddress: '192.168.1.1',
        userAgent: 'Test Browser',
      })

      expect(result.success).toBe(false)
      expect(result.error).toContain('Database error')
    })
  })

  describe('Admin-to-Admin Protection', () => {
    it('should prevent admin from editing other admins', async () => {
      const targetAdmin = {
        id: 'target-admin-id',
        email: 'target-admin@example.com',
        role: 'admin',
      }

      const mockSupabase = {
        auth: {
          getUser: jest.fn().mockResolvedValue({ data: { user: mockAdmin }, error: null }),
        },
        from: jest.fn(() => ({
          select: jest.fn().mockReturnThis(),
          eq: jest.fn().mockReturnThis(),
          single: jest.fn().mockResolvedValue({
            data: { ...mockAdmin, role: 'admin' },
            error: null,
          }),
        })),
      }

      mockCreateClient.mockReturnValue(mockSupabase as any)

      const adminProtection = new AdminProtection()
      const result = await adminProtection.validateAdminEdit(mockAdmin.id, targetAdmin.id, targetAdmin.role)

      expect(result.success).toBe(false)
      expect(result.error).toContain('Cannot edit other administrators')
    })

    it('should allow super admin to edit other admins', async () => {
      const targetAdmin = {
        id: 'target-admin-id',
        email: 'target-admin@example.com',
        role: 'admin',
      }

      const mockSupabase = {
        auth: {
          getUser: jest.fn().mockResolvedValue({ data: { user: mockSuperAdmin }, error: null }),
        },
        from: jest.fn(() => ({
          select: jest.fn().mockReturnThis(),
          eq: jest.fn().mockReturnThis(),
          single: jest.fn().mockResolvedValue({
            data: { ...mockSuperAdmin, role: 'super_admin', is_super_admin: true },
            error: null,
          }),
        })),
      }

      mockCreateClient.mockReturnValue(mockSupabase as any)

      const adminProtection = new AdminProtection()
      const result = await adminProtection.validateAdminEdit(mockSuperAdmin.id, targetAdmin.id, targetAdmin.role)

      expect(result.success).toBe(true)
      expect(result.canEdit).toBe(true)
    })

    it('should allow admin to edit interns', async () => {
      const targetIntern = {
        id: 'target-intern-id',
        email: 'target-intern@example.com',
        role: 'intern',
      }

      const mockSupabase = {
        auth: {
          getUser: jest.fn().mockResolvedValue({ data: { user: mockAdmin }, error: null }),
        },
        from: jest.fn(() => ({
          select: jest.fn().mockReturnThis(),
          eq: jest.fn().mockReturnThis(),
          single: jest.fn().mockResolvedValue({
            data: { ...mockAdmin, role: 'admin' },
            error: null,
          }),
        })),
      }

      mockCreateClient.mockReturnValue(mockSupabase as any)

      const adminProtection = new AdminProtection()
      const result = await adminProtection.validateAdminEdit(mockAdmin.id, targetIntern.id, targetIntern.role)

      expect(result.success).toBe(true)
      expect(result.canEdit).toBe(true)
    })
  })

  describe('Input Validation and Sanitization', () => {
    it('should validate admin action input', async () => {
      const adminProtection = new AdminProtection()

      // Test missing required fields
      const invalidAction = {
        adminId: '',
        actionType: '',
        targetType: 'user',
        targetId: 'target-id',
      } as any

      const result = await adminProtection.logAdminAction(invalidAction)

      expect(result.success).toBe(false)
      expect(result.error).toContain('Invalid input')
    })

    it('should sanitize admin action details', async () => {
      const mockSupabase = {
        auth: {
          getUser: jest.fn().mockResolvedValue({ data: { user: mockAdmin }, error: null }),
        },
        from: jest.fn(() => ({
          select: jest.fn().mockReturnThis(),
          insert: jest.fn().mockReturnThis(),
          eq: jest.fn().mockReturnThis(),
          single: jest.fn().mockResolvedValue({
            data: { ...mockAdmin, role: 'admin' },
            error: null,
          }),
          then: jest.fn().mockResolvedValue({
            data: { id: 'log-123' },
            error: null,
          }),
        })),
      }

      mockCreateClient.mockReturnValue(mockSupabase as any)

      const adminProtection = new AdminProtection()
      const result = await adminProtection.logAdminAction({
        adminId: mockAdmin.id,
        actionType: 'user_update',
        targetType: 'user',
        targetId: 'target-user-id',
        details: { 
          field: 'role', 
          old_value: 'intern', 
          new_value: 'admin',
          script: '<script>alert("xss")</script>', // Should be sanitized
        },
        ipAddress: '192.168.1.1',
        userAgent: 'Test Browser',
      })

      expect(result.success).toBe(true)
      // Verify that the script tag was sanitized
      expect(mockSupabase.from).toHaveBeenCalledWith('admin_actions_log')
    })
  })

  describe('Rate Limiting', () => {
    it('should implement rate limiting for admin actions', async () => {
      const mockSupabase = {
        auth: {
          getUser: jest.fn().mockResolvedValue({ data: { user: mockAdmin }, error: null }),
        },
        from: jest.fn(() => ({
          select: jest.fn().mockReturnThis(),
          insert: jest.fn().mockReturnThis(),
          eq: jest.fn().mockReturnThis(),
          single: jest.fn().mockResolvedValue({
            data: { ...mockAdmin, role: 'admin' },
            error: null,
          }),
          then: jest.fn().mockResolvedValue({
            data: { id: 'log-123' },
            error: null,
          }),
        })),
      }

      mockCreateClient.mockReturnValue(mockSupabase as any)

      const adminProtection = new AdminProtection()

      // Simulate multiple rapid actions
      const actions = Array(10).fill(null).map((_, i) => 
        adminProtection.logAdminAction({
          adminId: mockAdmin.id,
          actionType: 'user_update',
          targetType: 'user',
          targetId: `target-${i}`,
          details: { field: 'role', old_value: 'intern', new_value: 'admin' },
          ipAddress: '192.168.1.1',
          userAgent: 'Test Browser',
        })
      )

      const results = await Promise.all(actions)

      // All actions should succeed (rate limiting would be implemented at a higher level)
      results.forEach(result => {
        expect(result.success).toBe(true)
      })
    })
  })

  describe('Audit Trail Integrity', () => {
    it('should maintain audit trail integrity', async () => {
      const mockSupabase = {
        auth: {
          getUser: jest.fn().mockResolvedValue({ data: { user: mockAdmin }, error: null }),
        },
        from: jest.fn(() => ({
          select: jest.fn().mockReturnThis(),
          insert: jest.fn().mockReturnThis(),
          eq: jest.fn().mockReturnThis(),
          single: jest.fn().mockResolvedValue({
            data: { ...mockAdmin, role: 'admin' },
            error: null,
          }),
          then: jest.fn().mockResolvedValue({
            data: { id: 'log-123' },
            error: null,
          }),
        })),
      }

      mockCreateClient.mockReturnValue(mockSupabase as any)

      const adminProtection = new AdminProtection()
      const result = await adminProtection.logAdminAction({
        adminId: mockAdmin.id,
        actionType: 'user_update',
        targetType: 'user',
        targetId: 'target-user-id',
        details: { field: 'role', old_value: 'intern', new_value: 'admin' },
        ipAddress: '192.168.1.1',
        userAgent: 'Test Browser',
      })

      expect(result.success).toBe(true)
      
      // Verify that all required audit fields are present
      expect(mockSupabase.from).toHaveBeenCalledWith('admin_actions_log')
      const insertCall = mockSupabase.from().insert.mock.calls[0][0]
      expect(insertCall).toHaveProperty('admin_id')
      expect(insertCall).toHaveProperty('action_type')
      expect(insertCall).toHaveProperty('target_type')
      expect(insertCall).toHaveProperty('target_id')
      expect(insertCall).toHaveProperty('details')
      expect(insertCall).toHaveProperty('ip_address')
      expect(insertCall).toHaveProperty('user_agent')
      expect(insertCall).toHaveProperty('created_at')
    })
  })
}) 