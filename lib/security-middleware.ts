import { NextRequest, NextResponse } from 'next/server'
import { securityUtils } from './security-utils'

/**
 * Security Middleware
 * Implements rate limiting, input validation, and security hardening for API routes
 */

export interface SecurityConfig {
  rateLimit?: {
    type: 'auth' | 'api' | 'upload' | 'messaging' | 'volunteer'
    identifier?: string
  }
  validateInput?: {
    body?: Record<string, 'string' | 'number' | 'boolean' | 'email' | 'url'>
    query?: Record<string, 'string' | 'number' | 'boolean'>
  }
  requireAuth?: boolean
  requireAdmin?: boolean
  allowedMethods?: string[]
  maxBodySize?: number
}

export async function securityMiddleware(
  request: NextRequest,
  config: SecurityConfig = {}
): Promise<NextResponse | null> {
  const startTime = Date.now()
  
  try {
    // 1. Method validation
    if (config.allowedMethods && !config.allowedMethods.includes(request.method)) {
      await securityUtils.logSecurityEvent('invalid_method', undefined, {
        method: request.method,
        url: request.url
      })
      return NextResponse.json(
        { error: 'Method not allowed' },
        { status: 405 }
      )
    }

    // 2. Rate limiting
    if (config.rateLimit) {
      const identifier = config.rateLimit.identifier || 
        request.headers.get('x-forwarded-for') || 
        request.ip || 
        'unknown'
      
      if (!securityUtils.checkRateLimit(identifier, config.rateLimit.type)) {
        await securityUtils.logSecurityEvent('rate_limit_exceeded', undefined, {
          identifier,
          type: config.rateLimit.type,
          url: request.url
        })
        
        const rateLimitInfo = securityUtils.getRateLimitInfo(identifier, config.rateLimit.type)
        return NextResponse.json(
          { error: 'Rate limit exceeded' },
          { 
            status: 429,
            headers: {
              'X-RateLimit-Remaining': rateLimitInfo.remaining.toString(),
              'X-RateLimit-Reset': rateLimitInfo.resetTime.toString(),
              'Retry-After': Math.ceil((rateLimitInfo.resetTime - Date.now()) / 1000).toString()
            }
          }
        )
      }
    }

    // 3. Bot detection
    const userAgent = request.headers.get('user-agent') || ''
    if (securityUtils.isBot(userAgent)) {
      await securityUtils.logSecurityEvent('bot_detected', undefined, {
        userAgent,
        url: request.url
      })
      return NextResponse.json(
        { error: 'Access denied' },
        { status: 403 }
      )
    }

    // 4. Request validation
    const validationResult = securityUtils.validateApiRequest(
      request.method,
      new URL(request.url).pathname,
      Object.fromEntries(request.headers.entries()),
      request.body
    )
    
    if (!validationResult.isValid) {
      await securityUtils.logSecurityEvent('invalid_request', undefined, {
        errors: validationResult.errors,
        url: request.url
      })
      return NextResponse.json(
        { error: 'Invalid request', details: validationResult.errors },
        { status: 400 }
      )
    }

    // 5. Body size validation
    if (config.maxBodySize) {
      const contentLength = request.headers.get('content-length')
      if (contentLength && parseInt(contentLength) > config.maxBodySize) {
        await securityUtils.logSecurityEvent('body_too_large', undefined, {
          size: contentLength,
          maxSize: config.maxBodySize,
          url: request.url
        })
        return NextResponse.json(
          { error: 'Request body too large' },
          { status: 413 }
        )
      }
    }

    // 6. Input validation
    if (config.validateInput) {
      const validationErrors: string[] = []
      
      // Validate query parameters
      if (config.validateInput.query) {
        const url = new URL(request.url)
        for (const [key, type] of Object.entries(config.validateInput.query)) {
          const value = url.searchParams.get(key)
          if (value !== null) {
            if (type === 'string' && typeof value !== 'string') {
              validationErrors.push(`Invalid query parameter: ${key}`)
            } else if (type === 'number' && isNaN(Number(value))) {
              validationErrors.push(`Invalid number in query parameter: ${key}`)
            } else if (type === 'boolean' && !['true', 'false', '0', '1'].includes(value)) {
              validationErrors.push(`Invalid boolean in query parameter: ${key}`)
            }
          }
        }
      }
      
      // Validate body parameters (for POST/PUT requests)
      if (config.validateInput.body && ['POST', 'PUT', 'PATCH'].includes(request.method)) {
        try {
          const body = await request.clone().json()
          for (const [key, type] of Object.entries(config.validateInput.body)) {
            const value = body[key]
            if (value !== undefined) {
              if (type === 'string' && typeof value !== 'string') {
                validationErrors.push(`Invalid body parameter: ${key}`)
              } else if (type === 'number' && typeof value !== 'number') {
                validationErrors.push(`Invalid number in body parameter: ${key}`)
              } else if (type === 'boolean' && typeof value !== 'boolean') {
                validationErrors.push(`Invalid boolean in body parameter: ${key}`)
              } else if (type === 'email' && !securityUtils.validateInput(value, 'email')) {
                validationErrors.push(`Invalid email in body parameter: ${key}`)
              } else if (type === 'url' && !securityUtils.validateInput(value, 'url')) {
                validationErrors.push(`Invalid URL in body parameter: ${key}`)
              }
            }
          }
        } catch (error) {
          validationErrors.push('Invalid JSON body')
        }
      }
      
      if (validationErrors.length > 0) {
        await securityUtils.logSecurityEvent('input_validation_failed', undefined, {
          errors: validationErrors,
          url: request.url
        })
        return NextResponse.json(
          { error: 'Input validation failed', details: validationErrors },
          { status: 400 }
        )
      }
    }

    // 7. Authentication check
    if (config.requireAuth) {
      const authHeader = request.headers.get('authorization')
      if (!authHeader || !authHeader.startsWith('Bearer ')) {
        await securityUtils.logSecurityEvent('missing_auth', undefined, {
          url: request.url
        })
        return NextResponse.json(
          { error: 'Authentication required' },
          { status: 401 }
        )
      }
    }

    // 8. Admin check
    if (config.requireAdmin) {
      const authHeader = request.headers.get('authorization')
      if (!authHeader || !authHeader.startsWith('Bearer ')) {
        await securityUtils.logSecurityEvent('missing_admin_auth', undefined, {
          url: request.url
        })
        return NextResponse.json(
          { error: 'Admin access required' },
          { status: 403 }
        )
      }
      
      // In a real implementation, verify the token and check admin role
      // For now, we'll just log the attempt
      await securityUtils.logSecurityEvent('admin_access_attempt', undefined, {
        url: request.url,
        token: authHeader.substring(7).substring(0, 10) + '...' // Log partial token for debugging
      })
    }

    // 9. Log successful request
    const duration = Date.now() - startTime
    await securityUtils.logSecurityEvent('api_request_success', undefined, {
      method: request.method,
      url: request.url,
      duration,
      userAgent: request.headers.get('user-agent')
    })

    // Return null to continue with the request
    return null

  } catch (error) {
    // Log security middleware error
    await securityUtils.logSecurityEvent('security_middleware_error', undefined, {
      error: error instanceof Error ? error.message : 'Unknown error',
      url: request.url
    })
    
    return NextResponse.json(
      { error: 'Security check failed' },
      { status: 500 }
    )
  }
}

/**
 * Higher-order function to wrap API handlers with security middleware
 */
export function withSecurity<T extends any[]>(
  handler: (...args: T) => Promise<NextResponse>,
  config: SecurityConfig = {}
) {
  return async (request: NextRequest, ...args: T): Promise<NextResponse> => {
    // Apply security middleware
    const securityResult = await securityMiddleware(request, config)
    if (securityResult) {
      return securityResult
    }
    
    // Continue with the original handler
    return handler(request, ...args)
  }
}

/**
 * Security headers middleware
 */
export function addSecurityHeaders(response: NextResponse): NextResponse {
  const cspHeaders = securityUtils.getCSPHeaders()
  
  for (const [key, value] of Object.entries(cspHeaders)) {
    response.headers.set(key, value)
  }
  
  return response
}

/**
 * File upload security middleware
 */
export async function validateFileUpload(
  request: NextRequest,
  allowedTypes: string[] = ['image/jpeg', 'image/png', 'image/gif'],
  maxSize: number = 10 * 1024 * 1024 // 10MB
): Promise<NextResponse | null> {
  try {
    const formData = await request.formData()
    const file = formData.get('file') as File
    
    if (!file) {
      return NextResponse.json(
        { error: 'No file provided' },
        { status: 400 }
      )
    }
    
    // Validate file
    if (!securityUtils.validateFile(file, allowedTypes)) {
      await securityUtils.logSecurityEvent('invalid_file_upload', undefined, {
        filename: file.name,
        size: file.size,
        type: file.type
      })
      return NextResponse.json(
        { error: 'Invalid file type or size' },
        { status: 400 }
      )
    }
    
    // Check file size
    if (file.size > maxSize) {
      await securityUtils.logSecurityEvent('file_too_large', undefined, {
        filename: file.name,
        size: file.size,
        maxSize
      })
      return NextResponse.json(
        { error: 'File too large' },
        { status: 413 }
      )
    }
    
    return null // Continue with upload
    
  } catch (error) {
    await securityUtils.logSecurityEvent('file_upload_error', undefined, {
      error: error instanceof Error ? error.message : 'Unknown error'
    })
    return NextResponse.json(
      { error: 'File upload failed' },
      { status: 500 }
    )
  }
} 