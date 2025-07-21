interface AnalyticsEvent {
  event_type: string;
  event_data: Record<string, any>;
  page_url?: string;
  user_agent?: string;
  timestamp?: string;
  session_id?: string;
}

class AnalyticsTracker {
  private sessionId: string;
  private baseUrl: string;
  private consentChecked: boolean = false;

  constructor() {
    this.sessionId = this.generateSessionId();
    this.baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';
  }

  private generateSessionId(): string {
    return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
  }

  private async checkConsent(): Promise<boolean> {
    if (this.consentChecked) return true;

    try {
      const response = await fetch('/api/auth/user');
      const data = await response.json();
      
      if (data.success && data.user?.analytics_consent) {
        this.consentChecked = true;
        return true;
      }
      
      return false;
    } catch (error) {
      console.error('Error checking analytics consent:', error);
      return false;
    }
  }

  async trackEvent(event: AnalyticsEvent): Promise<void> {
    try {
      const hasConsent = await this.checkConsent();
      if (!hasConsent) {
        console.log('Analytics tracking skipped - no consent');
        return;
      }

      const eventData = {
        ...event,
        session_id: this.sessionId,
        timestamp: event.timestamp || new Date().toISOString(),
        page_url: event.page_url || window.location.href,
        user_agent: event.user_agent || navigator.userAgent
      };

      await fetch('/api/analytics/collect', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(eventData),
      });
    } catch (error) {
      console.error('Error tracking analytics event:', error);
    }
  }

  // Page view tracking
  async trackPageView(pageName: string, additionalData?: Record<string, any>): Promise<void> {
    await this.trackEvent({
      event_type: 'page_view',
      event_data: {
        page_name: pageName,
        ...additionalData
      }
    });
  }

  // User action tracking
  async trackUserAction(action: string, target?: string, additionalData?: Record<string, any>): Promise<void> {
    await this.trackEvent({
      event_type: 'user_action',
      event_data: {
        action,
        target,
        ...additionalData
      }
    });
  }

  // Feature usage tracking
  async trackFeatureUsage(feature: string, action: string, additionalData?: Record<string, any>): Promise<void> {
    await this.trackEvent({
      event_type: 'feature_usage',
      event_data: {
        feature,
        action,
        ...additionalData
      }
    });
  }

  // Volunteer hours tracking
  async trackVolunteerHoursAction(action: 'submit' | 'approve' | 'reject', hours: number, activityType: string): Promise<void> {
    await this.trackEvent({
      event_type: 'volunteer_hours',
      event_data: {
        action,
        hours,
        activity_type: activityType
      }
    });
  }

  // Tutoring session tracking
  async trackTutoringSession(action: 'book' | 'complete' | 'cancel', subject: string, duration: number): Promise<void> {
    await this.trackEvent({
      event_type: 'tutoring_session',
      event_data: {
        action,
        subject,
        duration
      }
    });
  }

  // Messaging tracking
  async trackMessagingAction(action: 'send_message' | 'create_channel' | 'join_channel', channelType?: string): Promise<void> {
    await this.trackEvent({
      event_type: 'messaging',
      event_data: {
        action,
        channel_type: channelType
      }
    });
  }

  // Error tracking
  async trackError(errorType: string, errorMessage: string, additionalData?: Record<string, any>): Promise<void> {
    await this.trackEvent({
      event_type: 'error',
      event_data: {
        error_type: errorType,
        error_message: errorMessage,
        ...additionalData
      }
    });
  }

  // Performance tracking
  async trackPerformance(metric: string, value: number, additionalData?: Record<string, any>): Promise<void> {
    await this.trackEvent({
      event_type: 'performance',
      event_data: {
        metric,
        value,
        ...additionalData
      }
    });
  }

  // User engagement tracking
  async trackEngagement(engagementType: string, duration?: number, additionalData?: Record<string, any>): Promise<void> {
    await this.trackEvent({
      event_type: 'engagement',
      event_data: {
        engagement_type: engagementType,
        duration,
        ...additionalData
      }
    });
  }

  // Search tracking
  async trackSearch(query: string, resultsCount: number, additionalData?: Record<string, any>): Promise<void> {
    await this.trackEvent({
      event_type: 'search',
      event_data: {
        query,
        results_count: resultsCount,
        ...additionalData
      }
    });
  }

  // File upload tracking
  async trackFileUpload(fileType: string, fileSize: number, additionalData?: Record<string, any>): Promise<void> {
    await this.trackEvent({
      event_type: 'file_upload',
      event_data: {
        file_type: fileType,
        file_size: fileSize,
        ...additionalData
      }
    });
  }

  // Admin action tracking
  async trackAdminAction(action: string, targetType: string, targetId: string, additionalData?: Record<string, any>): Promise<void> {
    await this.trackEvent({
      event_type: 'admin_action',
      event_data: {
        action,
        target_type: targetType,
        target_id: targetId,
        ...additionalData
      }
    });
  }

  // Custom event tracking
  async trackCustomEvent(eventName: string, eventData: Record<string, any>): Promise<void> {
    await this.trackEvent({
      event_type: eventName,
      event_data: eventData
    });
  }

  // Get session ID for external use
  getSessionId(): string {
    return this.sessionId;
  }

  // Reset session (useful for testing or session management)
  resetSession(): void {
    this.sessionId = this.generateSessionId();
    this.consentChecked = false;
  }
}

// Create a singleton instance
const analyticsTracker = new AnalyticsTracker();

export default analyticsTracker;
export { AnalyticsTracker }; 