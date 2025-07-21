import { createClient } from '@/lib/supabase/server';

const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';

export class EmailServiceIntegration {
  private supabase;

  constructor() {
    this.supabase = createClient();
  }

  async sendEmail(params: {
    to_email: string;
    subject: string;
    template?: string;
    template_data?: any;
    fallback_html?: string;
  }) {
    try {
      const response = await fetch(`${baseUrl}/api/send-email`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(params),
      });

      const result = await response.json();

      if (!result.success) {
        throw new Error(result.error || 'Failed to send email');
      }

      return {
        success: true,
        message_id: result.message_id,
        service: result.service
      };
    } catch (error) {
      console.error('Email service error:', error);
      throw error;
    }
  }

  async sendWelcomeEmail(userEmail: string, userName: string, verificationLink?: string) {
    const templateData = {
      user_name: userName,
      verification_link: verificationLink,
      login_url: `${baseUrl}/login`,
      support_email: 'support@stemsparkacademy.com'
    };

    return this.sendEmail({
      to_email: userEmail,
      subject: 'Welcome to STEM Spark Academy!',
      template: 'welcome_email',
      template_data: templateData,
      fallback_html: `
        <h1>Welcome to STEM Spark Academy!</h1>
        <p>Hello ${userName},</p>
        <p>Welcome to STEM Spark Academy! We're excited to have you join our community.</p>
        ${verificationLink ? `<p><a href="${verificationLink}">Click here to verify your email</a></p>` : ''}
        <p>You can now <a href="${baseUrl}/login">log in to your account</a> and start exploring.</p>
        <p>If you have any questions, please contact us at support@stemsparkacademy.com</p>
        <p>Best regards,<br>The STEM Spark Academy Team</p>
      `
    });
  }

  async sendPasswordResetEmail(userEmail: string, resetLink: string) {
    const templateData = {
      reset_link: resetLink,
      expiry_hours: 24,
      support_email: 'support@stemsparkacademy.com'
    };

    return this.sendEmail({
      to_email: userEmail,
      subject: 'Reset Your Password - STEM Spark Academy',
      template: 'password_reset',
      template_data: templateData,
      fallback_html: `
        <h1>Reset Your Password</h1>
        <p>You requested a password reset for your STEM Spark Academy account.</p>
        <p><a href="${resetLink}">Click here to reset your password</a></p>
        <p>This link will expire in 24 hours.</p>
        <p>If you didn't request this reset, please ignore this email.</p>
        <p>For support, contact us at support@stemsparkacademy.com</p>
      `
    });
  }

  async sendVolunteerHoursApprovedEmail(userEmail: string, userName: string, hoursData: any) {
    const templateData = {
      user_name: userName,
      hours: hoursData.hours,
      activity_type: hoursData.activity_type,
      activity_date: hoursData.activity_date,
      total_hours: hoursData.total_hours,
      dashboard_url: `${baseUrl}/intern-dashboard/volunteer-hours`
    };

    return this.sendEmail({
      to_email: userEmail,
      subject: 'Volunteer Hours Approved - STEM Spark Academy',
      template: 'volunteer_hours_approved',
      template_data: templateData,
      fallback_html: `
        <h1>Volunteer Hours Approved!</h1>
        <p>Hello ${userName},</p>
        <p>Great news! Your volunteer hours have been approved.</p>
        <p><strong>Details:</strong></p>
        <ul>
          <li>Activity: ${hoursData.activity_type}</li>
          <li>Date: ${hoursData.activity_date}</li>
          <li>Hours: ${hoursData.hours}</li>
          <li>Total Hours: ${hoursData.total_hours}</li>
        </ul>
        <p><a href="${baseUrl}/intern-dashboard/volunteer-hours">View your volunteer hours dashboard</a></p>
        <p>Thank you for your contribution to STEM Spark Academy!</p>
      `
    });
  }

  async sendVolunteerHoursRejectedEmail(userEmail: string, userName: string, hoursData: any, rejectionReason: string) {
    const templateData = {
      user_name: userName,
      hours: hoursData.hours,
      activity_type: hoursData.activity_type,
      activity_date: hoursData.activity_date,
      rejection_reason: rejectionReason,
      dashboard_url: `${baseUrl}/intern-dashboard/volunteer-hours`
    };

    return this.sendEmail({
      to_email: userEmail,
      subject: 'Volunteer Hours Update - STEM Spark Academy',
      template: 'volunteer_hours_rejected',
      template_data: templateData,
      fallback_html: `
        <h1>Volunteer Hours Update</h1>
        <p>Hello ${userName},</p>
        <p>Your volunteer hours submission requires attention.</p>
        <p><strong>Details:</strong></p>
        <ul>
          <li>Activity: ${hoursData.activity_type}</li>
          <li>Date: ${hoursData.activity_date}</li>
          <li>Hours: ${hoursData.hours}</li>
        </ul>
        <p><strong>Reason for rejection:</strong> ${rejectionReason}</p>
        <p><a href="${baseUrl}/intern-dashboard/volunteer-hours">Update your submission</a></p>
        <p>Please review and resubmit with the requested changes.</p>
      `
    });
  }

  async sendNewVolunteerHoursNotification(adminEmails: string[], hoursData: any) {
    const templateData = {
      intern_name: hoursData.intern_name,
      activity_type: hoursData.activity_type,
      activity_date: hoursData.activity_date,
      hours: hoursData.hours,
      description: hoursData.description,
      admin_dashboard_url: `${baseUrl}/admin/volunteer-hours`
    };

    const emailPromises = adminEmails.map(email => 
      this.sendEmail({
        to_email: email,
        subject: 'New Volunteer Hours Submission - STEM Spark Academy',
        template: 'new_volunteer_hours_notification',
        template_data: templateData,
        fallback_html: `
          <h1>New Volunteer Hours Submission</h1>
          <p>A new volunteer hours submission requires your review.</p>
          <p><strong>Details:</strong></p>
          <ul>
            <li>Intern: ${hoursData.intern_name}</li>
            <li>Activity: ${hoursData.activity_type}</li>
            <li>Date: ${hoursData.activity_date}</li>
            <li>Hours: ${hoursData.hours}</li>
            <li>Description: ${hoursData.description}</li>
          </ul>
          <p><a href="${baseUrl}/admin/volunteer-hours">Review submission</a></p>
        `
      })
    );

    return Promise.all(emailPromises);
  }

  async sendTutoringSessionConfirmation(userEmail: string, userName: string, sessionData: any) {
    const templateData = {
      user_name: userName,
      subject: sessionData.subject,
      topic: sessionData.topic,
      tutor_name: sessionData.tutor_name,
      scheduled_date: sessionData.scheduled_date,
      scheduled_time: sessionData.scheduled_time,
      duration: sessionData.duration,
      meeting_link: sessionData.meeting_link,
      dashboard_url: `${baseUrl}/tutoring`
    };

    return this.sendEmail({
      to_email: userEmail,
      subject: 'Tutoring Session Confirmed - STEM Spark Academy',
      template: 'tutoring_session_confirmation',
      template_data: templateData,
      fallback_html: `
        <h1>Tutoring Session Confirmed</h1>
        <p>Hello ${userName},</p>
        <p>Your tutoring session has been confirmed!</p>
        <p><strong>Session Details:</strong></p>
        <ul>
          <li>Subject: ${sessionData.subject}</li>
          <li>Topic: ${sessionData.topic}</li>
          <li>Tutor: ${sessionData.tutor_name}</li>
          <li>Date: ${sessionData.scheduled_date}</li>
          <li>Time: ${sessionData.scheduled_time}</li>
          <li>Duration: ${sessionData.duration} minutes</li>
        </ul>
        ${sessionData.meeting_link ? `<p><a href="${sessionData.meeting_link}">Join session</a></p>` : ''}
        <p><a href="${baseUrl}/tutoring">View your tutoring dashboard</a></p>
      `
    });
  }

  async checkEmailServiceHealth() {
    try {
      const response = await fetch(`${baseUrl}/api/send-email`, {
        method: 'GET',
      });

      const result = await response.json();
      return {
        healthy: response.ok && result.status === 'healthy',
        service: result.service,
        details: result.details
      };
    } catch (error) {
      return {
        healthy: false,
        service: 'unknown',
        error: error.message
      };
    }
  }
}

export default EmailServiceIntegration; 