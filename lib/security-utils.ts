import { createClient } from '@/lib/supabase/client'

/**
 * Security Utilities
 * Comprehensive security measures including input validation, sanitization, rate limiting, and hardening
 */

// Rate limiting configuration
interface RateLimitConfig {
  windowMs: number
  maxRequests: number
  message: string
}

const RATE_LIMITS: Record<string, RateLimitConfig> = {
  auth: { windowMs: 15 * 60 * 1000, maxRequests: 5, message: 'Too many authentication attempts' },
  api: { windowMs: 60 * 1000, maxRequests: 100, message: 'Too many API requests' },
  upload: { windowMs: 60 * 1000, maxRequests: 10, message: 'Too many file uploads' },
  messaging: { windowMs: 10 * 1000, maxRequests: 50, message: 'Too many messages' },
  volunteer: { windowMs: 60 * 1000, maxRequests: 20, message: 'Too many volunteer hour submissions' }
}

// Rate limiting storage (in production, use Redis)
const rateLimitStore = new Map<string, { count: number; resetTime: number }>()

// Input validation patterns
const VALIDATION_PATTERNS = {
  email: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
  phone: /^\+?[\d\s\-\(\)]{10,15}$/,
  username: /^[a-zA-Z0-9_]{3,20}$/,
  password: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/,
  url: /^https?:\/\/[^\s/$.?#].[^\s]*$/,
  filename: /^[a-zA-Z0-9._-]+$/,
  html: /<[^>]*>/g
}

// File type validation
const ALLOWED_FILE_TYPES = {
  image: ['image/jpeg', 'image/png', 'image/gif', 'image/webp'],
  document: ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'],
  video: ['video/mp4', 'video/webm', 'video/ogg']
}

const MAX_FILE_SIZE = 10 * 1024 * 1024 // 10MB

class SecurityUtils {
  /**
   * Rate limiting implementation
   */
  checkRateLimit(identifier: string, type: keyof typeof RATE_LIMITS): boolean {
    const config = RATE_LIMITS[type]
    const key = `${identifier}:${type}`
    const now = Date.now()
    
    const current = rateLimitStore.get(key)
    
    if (!current || now > current.resetTime) {
      rateLimitStore.set(key, { count: 1, resetTime: now + config.windowMs })
      return true
    }
    
    if (current.count >= config.maxRequests) {
      return false
    }
    
    current.count++
    return true
  }

  /**
   * Get rate limit info
   */
  getRateLimitInfo(identifier: string, type: keyof typeof RATE_LIMITS) {
    const config = RATE_LIMITS[type]
    const key = `${identifier}:${type}`
    const current = rateLimitStore.get(key)
    
    if (!current) {
      return { remaining: config.maxRequests, resetTime: Date.now() + config.windowMs }
    }
    
    return {
      remaining: Math.max(0, config.maxRequests - current.count),
      resetTime: current.resetTime
    }
  }

  /**
   * Input validation
   */
  validateInput(value: string, type: keyof typeof VALIDATION_PATTERNS): boolean {
    const pattern = VALIDATION_PATTERNS[type]
    return pattern.test(value)
  }

  /**
   * Sanitize HTML content
   */
  sanitizeHtml(html: string): string {
    // Remove all HTML tags
    return html.replace(VALIDATION_PATTERNS.html, '')
  }

  /**
   * Sanitize user input
   */
  sanitizeInput(input: string): string {
    return input
      .trim()
      .replace(/[<>]/g, '') // Remove angle brackets
      .replace(/javascript:/gi, '') // Remove javascript: protocol
      .replace(/on\w+=/gi, '') // Remove event handlers
  }

  /**
   * Validate file upload
   */
  validateFile(file: File, allowedTypes: string[] = ALLOWED_FILE_TYPES.image): boolean {
    // Check file size
    if (file.size > MAX_FILE_SIZE) {
      return false
    }
    
    // Check file type
    if (!allowedTypes.includes(file.type)) {
      return false
    }
    
    // Check filename
    if (!VALIDATION_PATTERNS.filename.test(file.name)) {
      return false
    }
    
    return true
  }

  /**
   * Generate secure random string
   */
  generateSecureToken(length: number = 32): string {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'
    let result = ''
    const randomArray = new Uint8Array(length)
    crypto.getRandomValues(randomArray)
    
    for (let i = 0; i < length; i++) {
      result += chars.charAt(randomArray[i] % chars.length)
    }
    
    return result
  }

  /**
   * Hash password (in production, use bcrypt or similar)
   */
  async hashPassword(password: string): Promise<string> {
    const encoder = new TextEncoder()
    const data = encoder.encode(password)
    const hash = await crypto.subtle.digest('SHA-256', data)
    return Array.from(new Uint8Array(hash))
      .map(b => b.toString(16).padStart(2, '0'))
      .join('')
  }

  /**
   * Verify password
   */
  async verifyPassword(password: string, hash: string): Promise<boolean> {
    const passwordHash = await this.hashPassword(password)
    return passwordHash === hash
  }

  /**
   * Validate email format and domain
   */
  validateEmail(email: string): { isValid: boolean; reason?: string } {
    if (!this.validateInput(email, 'email')) {
      return { isValid: false, reason: 'Invalid email format' }
    }
    
    // Check for disposable email domains (simplified)
    const disposableDomains = ['tempmail.com', 'throwaway.com', '10minutemail.com']
    const domain = email.split('@')[1]?.toLowerCase()
    
    if (disposableDomains.includes(domain)) {
      return { isValid: false, reason: 'Disposable email addresses are not allowed' }
    }
    
    return { isValid: true }
  }

  /**
   * Validate password strength
   */
  validatePassword(password: string): { isValid: boolean; score: number; feedback: string[] } {
    const feedback: string[] = []
    let score = 0
    
    if (password.length < 8) {
      feedback.push('Password must be at least 8 characters long')
    } else {
      score += 1
    }
    
    if (/[a-z]/.test(password)) score += 1
    else feedback.push('Include at least one lowercase letter')
    
    if (/[A-Z]/.test(password)) score += 1
    else feedback.push('Include at least one uppercase letter')
    
    if (/\d/.test(password)) score += 1
    else feedback.push('Include at least one number')
    
    if (/[@$!%*?&]/.test(password)) score += 1
    else feedback.push('Include at least one special character (@$!%*?&)')
    
    const isValid = score >= 4
    
    return { isValid, score, feedback }
  }

  /**
   * Log security event
   */
  async logSecurityEvent(
    event: string,
    userId?: string,
    metadata?: Record<string, any>
  ): Promise<void> {
    const supabase = createClient()
    
    try {
      await supabase.from('admin_actions_log').insert({
        user_id: userId,
        action_type: 'security_event',
        action_details: event,
        metadata: {
          ...metadata,
          timestamp: new Date().toISOString(),
          user_agent: typeof window !== 'undefined' ? window.navigator.userAgent : 'server',
          ip_address: 'client_ip' // In production, get from request headers
        }
      })
    } catch (error) {
      console.error('Failed to log security event:', error)
    }
  }

  /**
   * Check for suspicious activity
   */
  async checkSuspiciousActivity(userId: string): Promise<{ suspicious: boolean; reasons: string[] }> {
    const supabase = createClient()
    const reasons: string[] = []
    
    try {
      // Check for multiple failed login attempts
      const { data: failedLogins } = await supabase
        .from('admin_actions_log')
        .select('*')
        .eq('user_id', userId)
        .eq('action_type', 'login_failed')
        .gte('created_at', new Date(Date.now() - 15 * 60 * 1000).toISOString())
      
      if (failedLogins && failedLogins.length >= 5) {
        reasons.push('Multiple failed login attempts')
      }
      
      // Check for unusual activity patterns
      const { data: recentActivity } = await supabase
        .from('analytics_events')
        .select('*')
        .eq('user_id', userId)
        .gte('created_at', new Date(Date.now() - 60 * 60 * 1000).toISOString())
      
      if (recentActivity && recentActivity.length > 100) {
        reasons.push('Unusually high activity level')
      }
      
    } catch (error) {
      console.error('Error checking suspicious activity:', error)
    }
    
    return { suspicious: reasons.length > 0, reasons }
  }

  /**
   * Implement Content Security Policy headers
   */
  getCSPHeaders(): Record<string, string> {
    return {
      'Content-Security-Policy': [
        "default-src 'self'",
        "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://cdn.jsdelivr.net",
        "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
        "font-src 'self' https://fonts.gstatic.com",
        "img-src 'self' data: https:",
        "connect-src 'self' https://*.supabase.co wss://*.supabase.co",
        "frame-src 'self'",
        "object-src 'none'",
        "base-uri 'self'",
        "form-action 'self'"
      ].join('; '),
      'X-Content-Type-Options': 'nosniff',
      'X-Frame-Options': 'DENY',
      'X-XSS-Protection': '1; mode=block',
      'Referrer-Policy': 'strict-origin-when-cross-origin',
      'Permissions-Policy': 'camera=(), microphone=(), geolocation=()'
    }
  }

  /**
   * Validate and sanitize SQL query parameters
   */
  sanitizeSqlParams(params: Record<string, any>): Record<string, any> {
    const sanitized: Record<string, any> = {}
    
    for (const [key, value] of Object.entries(params)) {
      if (typeof value === 'string') {
        sanitized[key] = this.sanitizeInput(value)
      } else if (typeof value === 'number') {
        sanitized[key] = Number.isFinite(value) ? value : 0
      } else if (typeof value === 'boolean') {
        sanitized[key] = Boolean(value)
      } else if (Array.isArray(value)) {
        sanitized[key] = value.map(item => 
          typeof item === 'string' ? this.sanitizeInput(item) : item
        )
      } else {
        sanitized[key] = value
      }
    }
    
    return sanitized
  }

  /**
   * Check if request is from a bot
   */
  isBot(userAgent: string): boolean {
    const botPatterns = [
      /bot/i, /crawler/i, /spider/i, /scraper/i, /crawling/i,
      /googlebot/i, /bingbot/i, /slurp/i, /duckduckbot/i,
      /baiduspider/i, /yandexbot/i, /facebookexternalhit/i,
      /twitterbot/i, /linkedinbot/i, /whatsapp/i, /telegram/i
    ]
    
    return botPatterns.some(pattern => pattern.test(userAgent))
  }

  /**
   * Validate API request
   */
  validateApiRequest(
    method: string,
    path: string,
    headers: Record<string, string>,
    body?: any
  ): { isValid: boolean; errors: string[] } {
    const errors: string[] = []
    
    // Check method
    const allowedMethods = ['GET', 'POST', 'PUT', 'DELETE', 'PATCH']
    if (!allowedMethods.includes(method.toUpperCase())) {
      errors.push('Invalid HTTP method')
    }
    
    // Check content type for POST/PUT requests
    if (['POST', 'PUT', 'PATCH'].includes(method.toUpperCase()) && body) {
      const contentType = headers['content-type'] || ''
      if (!contentType.includes('application/json')) {
        errors.push('Invalid content type')
      }
    }
    
    // Check for required headers
    if (!headers['user-agent']) {
      errors.push('Missing User-Agent header')
    }
    
    // Validate path
    if (!path.startsWith('/api/')) {
      errors.push('Invalid API path')
    }
    
    return { isValid: errors.length === 0, errors }
  }
}

// Export singleton instance
export const securityUtils = new SecurityUtils()

// Export utility functions
export const checkRateLimit = securityUtils.checkRateLimit.bind(securityUtils)
export const validateInput = securityUtils.validateInput.bind(securityUtils)
export const sanitizeInput = securityUtils.sanitizeInput.bind(securityUtils)
export const validateFile = securityUtils.validateFile.bind(securityUtils)
export const generateSecureToken = securityUtils.generateSecureToken.bind(securityUtils)
export const validateEmail = securityUtils.validateEmail.bind(securityUtils)
export const validatePassword = securityUtils.validatePassword.bind(securityUtils)
export const logSecurityEvent = securityUtils.logSecurityEvent.bind(securityUtils)
export const checkSuspiciousActivity = securityUtils.checkSuspiciousActivity.bind(securityUtils)
export const getCSPHeaders = securityUtils.getCSPHeaders.bind(securityUtils)
export const sanitizeSqlParams = securityUtils.sanitizeSqlParams.bind(securityUtils)
export const isBot = securityUtils.isBot.bind(securityUtils)
export const validateApiRequest = securityUtils.validateApiRequest.bind(securityUtils) 