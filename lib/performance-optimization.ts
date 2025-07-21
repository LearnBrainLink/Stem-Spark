import { createClient } from '@/lib/supabase/client'

/**
 * Performance Optimization Utilities
 * Handles caching, lazy loading, image optimization, and performance monitoring
 */

// Cache configuration
const CACHE_CONFIG = {
  // Browser cache settings
  browser: {
    maxAge: 60 * 60 * 24 * 7, // 7 days
    staleWhileRevalidate: 60 * 60 * 24 * 30, // 30 days
  },
  // Server cache settings
  server: {
    maxAge: 60 * 5, // 5 minutes
    staleWhileRevalidate: 60 * 60, // 1 hour
  },
  // API cache settings
  api: {
    maxAge: 60 * 2, // 2 minutes
    staleWhileRevalidate: 60 * 10, // 10 minutes
  }
}

// Performance metrics storage
interface PerformanceMetric {
  id: string
  type: 'page_load' | 'api_call' | 'database_query' | 'image_load'
  duration: number
  timestamp: Date
  metadata?: Record<string, any>
}

class PerformanceOptimizer {
  private metrics: PerformanceMetric[] = []
  private cache = new Map<string, { data: any; timestamp: number; ttl: number }>()

  /**
   * Cache data with TTL
   */
  async cacheData<T>(
    key: string,
    data: T,
    ttl: number = CACHE_CONFIG.server.maxAge * 1000
  ): Promise<T> {
    this.cache.set(key, {
      data,
      timestamp: Date.now(),
      ttl
    })
    return data
  }

  /**
   * Get cached data if not expired
   */
  getCachedData<T>(key: string): T | null {
    const cached = this.cache.get(key)
    if (!cached) return null

    const isExpired = Date.now() - cached.timestamp > cached.ttl
    if (isExpired) {
      this.cache.delete(key)
      return null
    }

    return cached.data
  }

  /**
   * Clear expired cache entries
   */
  clearExpiredCache(): void {
    const now = Date.now()
    for (const [key, cached] of this.cache.entries()) {
      if (now - cached.timestamp > cached.ttl) {
        this.cache.delete(key)
      }
    }
  }

  /**
   * Record performance metric
   */
  recordMetric(
    type: PerformanceMetric['type'],
    duration: number,
    metadata?: Record<string, any>
  ): void {
    const metric: PerformanceMetric = {
      id: `${type}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      type,
      duration,
      timestamp: new Date(),
      metadata
    }

    this.metrics.push(metric)

    // Keep only last 1000 metrics to prevent memory issues
    if (this.metrics.length > 1000) {
      this.metrics = this.metrics.slice(-1000)
    }

    // Log to console in development
    if (process.env.NODE_ENV === 'development') {
      console.log(`Performance Metric: ${type} took ${duration}ms`, metadata)
    }
  }

  /**
   * Get performance metrics
   */
  getMetrics(type?: PerformanceMetric['type']): PerformanceMetric[] {
    if (type) {
      return this.metrics.filter(m => m.type === type)
    }
    return this.metrics
  }

  /**
   * Get average performance for a metric type
   */
  getAveragePerformance(type: PerformanceMetric['type']): number {
    const metrics = this.getMetrics(type)
    if (metrics.length === 0) return 0

    const total = metrics.reduce((sum, m) => sum + m.duration, 0)
    return total / metrics.length
  }

  /**
   * Optimize images with lazy loading and responsive sizes
   */
  optimizeImage(
    src: string,
    alt: string,
    sizes: string = '100vw',
    priority: boolean = false
  ): {
    src: string
    alt: string
    sizes: string
    priority: boolean
    loading: 'lazy' | 'eager'
  } {
    return {
      src,
      alt,
      sizes,
      priority,
      loading: priority ? 'eager' : 'lazy'
    }
  }

  /**
   * Debounce function calls
   */
  debounce<T extends (...args: any[]) => any>(
    func: T,
    wait: number
  ): (...args: Parameters<T>) => void {
    let timeout: NodeJS.Timeout
    return (...args: Parameters<T>) => {
      clearTimeout(timeout)
      timeout = setTimeout(() => func(...args), wait)
    }
  }

  /**
   * Throttle function calls
   */
  throttle<T extends (...args: any[]) => any>(
    func: T,
    limit: number
  ): (...args: Parameters<T>) => void {
    let inThrottle: boolean
    return (...args: Parameters<T>) => {
      if (!inThrottle) {
        func(...args)
        inThrottle = true
        setTimeout(() => (inThrottle = false), limit)
      }
    }
  }

  /**
   * Preload critical resources
   */
  preloadResources(resources: string[]): void {
    resources.forEach(resource => {
      const link = document.createElement('link')
      link.rel = 'preload'
      link.href = resource
      link.as = this.getResourceType(resource)
      document.head.appendChild(link)
    })
  }

  /**
   * Get resource type for preloading
   */
  private getResourceType(resource: string): string {
    if (resource.endsWith('.css')) return 'style'
    if (resource.endsWith('.js')) return 'script'
    if (resource.endsWith('.woff2')) return 'font'
    if (resource.match(/\.(jpg|jpeg|png|webp|avif)$/)) return 'image'
    return 'fetch'
  }

  /**
   * Optimize database queries with caching
   */
  async optimizedQuery<T>(
    queryKey: string,
    queryFn: () => Promise<T>,
    ttl: number = CACHE_CONFIG.api.maxAge * 1000
  ): Promise<T> {
    // Check cache first
    const cached = this.getCachedData<T>(queryKey)
    if (cached) {
      this.recordMetric('database_query', 0, { queryKey, cached: true })
      return cached
    }

    // Execute query and cache result
    const startTime = Date.now()
    try {
      const result = await queryFn()
      const duration = Date.now() - startTime
      
      this.recordMetric('database_query', duration, { queryKey, cached: false })
      await this.cacheData(queryKey, result, ttl)
      
      return result
    } catch (error) {
      const duration = Date.now() - startTime
      this.recordMetric('database_query', duration, { queryKey, error: true })
      throw error
    }
  }

  /**
   * Batch multiple operations
   */
  async batchOperations<T>(
    operations: (() => Promise<T>)[],
    batchSize: number = 5
  ): Promise<T[]> {
    const results: T[] = []
    
    for (let i = 0; i < operations.length; i += batchSize) {
      const batch = operations.slice(i, i + batchSize)
      const batchResults = await Promise.all(batch.map(op => op()))
      results.push(...batchResults)
    }
    
    return results
  }

  /**
   * Generate performance report
   */
  generateReport(): {
    totalMetrics: number
    averagePageLoad: number
    averageApiCall: number
    averageDatabaseQuery: number
    cacheHitRate: number
    recommendations: string[]
  } {
    const totalMetrics = this.metrics.length
    const averagePageLoad = this.getAveragePerformance('page_load')
    const averageApiCall = this.getAveragePerformance('api_call')
    const averageDatabaseQuery = this.getAveragePerformance('database_query')
    
    // Calculate cache hit rate (simplified)
    const cacheHits = this.metrics.filter(m => m.metadata?.cached).length
    const cacheHitRate = totalMetrics > 0 ? (cacheHits / totalMetrics) * 100 : 0

    const recommendations: string[] = []
    
    if (averagePageLoad > 3000) {
      recommendations.push('Consider implementing code splitting and lazy loading')
    }
    if (averageApiCall > 1000) {
      recommendations.push('Optimize API endpoints and implement caching')
    }
    if (averageDatabaseQuery > 500) {
      recommendations.push('Add database indexes and optimize queries')
    }
    if (cacheHitRate < 50) {
      recommendations.push('Increase cache TTL and implement more aggressive caching')
    }

    return {
      totalMetrics,
      averagePageLoad,
      averageApiCall,
      averageDatabaseQuery,
      cacheHitRate,
      recommendations
    }
  }
}

// Export singleton instance
export const performanceOptimizer = new PerformanceOptimizer()

// Export utility functions
export const debounce = performanceOptimizer.debounce.bind(performanceOptimizer)
export const throttle = performanceOptimizer.throttle.bind(performanceOptimizer)
export const optimizeImage = performanceOptimizer.optimizeImage.bind(performanceOptimizer)
export const optimizedQuery = performanceOptimizer.optimizedQuery.bind(performanceOptimizer)
export const batchOperations = performanceOptimizer.batchOperations.bind(performanceOptimizer)

// Performance monitoring hooks
export const usePerformanceMonitoring = () => {
  const recordPageLoad = (duration: number) => {
    performanceOptimizer.recordMetric('page_load', duration)
  }

  const recordApiCall = (duration: number, endpoint: string) => {
    performanceOptimizer.recordMetric('api_call', duration, { endpoint })
  }

  const recordDatabaseQuery = (duration: number, query: string) => {
    performanceOptimizer.recordMetric('database_query', duration, { query })
  }

  const recordImageLoad = (duration: number, src: string) => {
    performanceOptimizer.recordMetric('image_load', duration, { src })
  }

  return {
    recordPageLoad,
    recordApiCall,
    recordDatabaseQuery,
    recordImageLoad,
    getMetrics: performanceOptimizer.getMetrics.bind(performanceOptimizer),
    generateReport: performanceOptimizer.generateReport.bind(performanceOptimizer)
  }
} 