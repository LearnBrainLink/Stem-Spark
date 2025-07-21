import { createClient } from '@supabase/supabase-js';
import { Database } from './database.types';
import AdminProtection from './admin-protection';
import { EmailServiceIntegration } from './email-service-integration';

type Tables = Database['public']['Tables'];
type VolunteerHours = Tables['volunteer_hours']['Row'];
type TutoringSession = Tables['tutoring_sessions']['Row'];
type Profile = Tables['profiles']['Row'];

export interface VolunteerHoursSubmission {
  intern_id: string;
  activity_date: string;
  activity_type: string;
  activity_description: string;
  hours: number;
  description?: string;
  reference_id?: string; // For linking to tutoring sessions
}

export interface VolunteerHoursApproval {
  hours_id: string;
  approved_by: string;
  approved_at: string;
  status: 'approved' | 'rejected';
  rejection_reason?: string;
}

export interface VolunteerHoursStats {
  total_hours: number;
  approved_hours: number;
  pending_hours: number;
  rejected_hours: number;
  recent_submissions: number;
  average_hours_per_month: number;
}

class VolunteerHoursService {
  private supabase;
  private adminProtection;

  constructor() {
    this.supabase = createClient<Database>(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );
    this.adminProtection = new AdminProtection();
  }

  /**
   * Submit volunteer hours for approval
   */
  async submitVolunteerHours(submission: VolunteerHoursSubmission): Promise<{
    success: boolean;
    data?: VolunteerHours;
    error?: string;
  }> {
    try {
      // Validate submission
      if (!submission.intern_id || !submission.activity_date || !submission.hours) {
        return { success: false, error: 'Missing required fields' };
      }

      if (submission.hours <= 0 || submission.hours > 24) {
        return { success: false, error: 'Hours must be between 0 and 24' };
      }

      // Check if intern exists and has intern role
      const { data: intern, error: internError } = await this.supabase
        .from('profiles')
        .select('*')
        .eq('id', submission.intern_id)
        .eq('role', 'intern')
        .single();

      if (internError || !intern) {
        return { success: false, error: 'Invalid intern account' };
      }

      // Create volunteer hours record
      const { data: volunteerHours, error } = await this.supabase
        .from('volunteer_hours')
        .insert({
          intern_id: submission.intern_id,
          activity_date: submission.activity_date,
          activity_type: submission.activity_type,
          activity_description: submission.activity_description,
          hours: submission.hours,
          description: submission.description,
          reference_id: submission.reference_id,
          status: 'pending'
        })
        .select()
        .single();

      if (error) {
        console.error('Error submitting volunteer hours:', error);
        return { success: false, error: 'Failed to submit volunteer hours' };
      }

      // Send notification email to admins (optional)
      await this.notifyAdminsOfNewSubmission(volunteerHours, intern);

      return { success: true, data: volunteerHours };
    } catch (error) {
      console.error('Error in submitVolunteerHours:', error);
      return { success: false, error: 'Internal server error' };
    }
  }

  /**
   * Approve volunteer hours
   */
  async approveVolunteerHours(
    hoursId: string,
    approvedBy: string,
    metadata?: Record<string, any>
  ): Promise<{
    success: boolean;
    data?: VolunteerHours;
    error?: string;
  }> {
    try {
      // Validate admin action
      const actionResult = await this.adminProtection.canPerformAction({
        action_type: 'approve_hours',
        target_user_id: approvedBy,
        performed_by: approvedBy,
        is_allowed: false,
        metadata
      });

      if (!actionResult.allowed) {
        return { success: false, error: actionResult.reason };
      }

      // Get volunteer hours record
      const { data: volunteerHours, error: fetchError } = await this.supabase
        .from('volunteer_hours')
        .select('*, intern:profiles!volunteer_hours_intern_id_fkey(*)')
        .eq('id', hoursId)
        .single();

      if (fetchError || !volunteerHours) {
        return { success: false, error: 'Volunteer hours not found' };
      }

      if (volunteerHours.status !== 'pending') {
        return { success: false, error: 'Hours are not pending approval' };
      }

      // Update volunteer hours status
      const { data: updatedHours, error: updateError } = await this.supabase
        .from('volunteer_hours')
        .update({
          status: 'approved',
          approved_by: approvedBy,
          approved_at: new Date().toISOString()
        })
        .eq('id', hoursId)
        .select()
        .single();

      if (updateError) {
        console.error('Error approving volunteer hours:', updateError);
        return { success: false, error: 'Failed to approve volunteer hours' };
      }

      // Update intern's total volunteer hours
      await this.updateInternTotalHours(volunteerHours.intern_id);

      // Send approval email
      await EmailServiceIntegration.sendVolunteerHoursApproval(
        volunteerHours.intern as Profile,
        updatedHours
      );

      return { success: true, data: updatedHours };
    } catch (error) {
      console.error('Error in approveVolunteerHours:', error);
      return { success: false, error: 'Internal server error' };
    }
  }

  /**
   * Reject volunteer hours
   */
  async rejectVolunteerHours(
    hoursId: string,
    rejectedBy: string,
    rejectionReason: string,
    metadata?: Record<string, any>
  ): Promise<{
    success: boolean;
    data?: VolunteerHours;
    error?: string;
  }> {
    try {
      // Validate admin action
      const actionResult = await this.adminProtection.canPerformAction({
        action_type: 'reject_hours',
        target_user_id: rejectedBy,
        performed_by: rejectedBy,
        is_allowed: false,
        metadata
      });

      if (!actionResult.allowed) {
        return { success: false, error: actionResult.reason };
      }

      if (!rejectionReason.trim()) {
        return { success: false, error: 'Rejection reason is required' };
      }

      // Get volunteer hours record
      const { data: volunteerHours, error: fetchError } = await this.supabase
        .from('volunteer_hours')
        .select('*, intern:profiles!volunteer_hours_intern_id_fkey(*)')
        .eq('id', hoursId)
        .single();

      if (fetchError || !volunteerHours) {
        return { success: false, error: 'Volunteer hours not found' };
      }

      if (volunteerHours.status !== 'pending') {
        return { success: false, error: 'Hours are not pending approval' };
      }

      // Update volunteer hours status
      const { data: updatedHours, error: updateError } = await this.supabase
        .from('volunteer_hours')
        .update({
          status: 'rejected',
          rejection_reason: rejectionReason
        })
        .eq('id', hoursId)
        .select()
        .single();

      if (updateError) {
        console.error('Error rejecting volunteer hours:', updateError);
        return { success: false, error: 'Failed to reject volunteer hours' };
      }

      // Send rejection email
      await EmailServiceIntegration.sendVolunteerHoursRejection(
        volunteerHours.intern as Profile,
        updatedHours,
        rejectionReason
      );

      return { success: true, data: updatedHours };
    } catch (error) {
      console.error('Error in rejectVolunteerHours:', error);
      return { success: false, error: 'Internal server error' };
    }
  }

  /**
   * Get volunteer hours for an intern
   */
  async getInternVolunteerHours(internId: string): Promise<{
    success: boolean;
    data?: VolunteerHours[];
    error?: string;
  }> {
    try {
      const { data, error } = await this.supabase
        .from('volunteer_hours')
        .select('*')
        .eq('intern_id', internId)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching intern volunteer hours:', error);
        return { success: false, error: 'Failed to fetch volunteer hours' };
      }

      return { success: true, data: data || [] };
    } catch (error) {
      console.error('Error in getInternVolunteerHours:', error);
      return { success: false, error: 'Internal server error' };
    }
  }

  /**
   * Get all pending volunteer hours for admin review
   */
  async getPendingVolunteerHours(): Promise<{
    success: boolean;
    data?: (VolunteerHours & { intern: Profile })[];
    error?: string;
  }> {
    try {
      const { data, error } = await this.supabase
        .from('volunteer_hours')
        .select(`
          *,
          intern:profiles!volunteer_hours_intern_id_fkey(*)
        `)
        .eq('status', 'pending')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching pending volunteer hours:', error);
        return { success: false, error: 'Failed to fetch pending hours' };
      }

      return { success: true, data: data || [] };
    } catch (error) {
      console.error('Error in getPendingVolunteerHours:', error);
      return { success: false, error: 'Internal server error' };
    }
  }

  /**
   * Get volunteer hours statistics for an intern
   */
  async getInternVolunteerStats(internId: string): Promise<{
    success: boolean;
    data?: VolunteerHoursStats;
    error?: string;
  }> {
    try {
      const { data: hours, error } = await this.supabase
        .from('volunteer_hours')
        .select('*')
        .eq('intern_id', internId);

      if (error) {
        console.error('Error fetching volunteer hours for stats:', error);
        return { success: false, error: 'Failed to fetch volunteer hours' };
      }

      const totalHours = hours?.reduce((sum, h) => sum + h.hours, 0) || 0;
      const approvedHours = hours?.filter(h => h.status === 'approved').reduce((sum, h) => sum + h.hours, 0) || 0;
      const pendingHours = hours?.filter(h => h.status === 'pending').reduce((sum, h) => sum + h.hours, 0) || 0;
      const rejectedHours = hours?.filter(h => h.status === 'rejected').reduce((sum, h) => sum + h.hours, 0) || 0;

      // Calculate recent submissions (last 30 days)
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
      const recentSubmissions = hours?.filter(h => 
        new Date(h.created_at || '') > thirtyDaysAgo
      ).length || 0;

      // Calculate average hours per month
      const monthsActive = Math.max(1, Math.ceil((Date.now() - new Date(hours?.[0]?.created_at || Date.now()).getTime()) / (1000 * 60 * 60 * 24 * 30)));
      const averageHoursPerMonth = totalHours / monthsActive;

      const stats: VolunteerHoursStats = {
        total_hours: totalHours,
        approved_hours: approvedHours,
        pending_hours: pendingHours,
        rejected_hours: rejectedHours,
        recent_submissions: recentSubmissions,
        average_hours_per_month: Math.round(averageHoursPerMonth * 100) / 100
      };

      return { success: true, data: stats };
    } catch (error) {
      console.error('Error in getInternVolunteerStats:', error);
      return { success: false, error: 'Internal server error' };
    }
  }

  /**
   * Create volunteer hours from completed tutoring session
   */
  async createHoursFromTutoringSession(
    sessionId: string,
    internId: string,
    hours: number,
    description?: string
  ): Promise<{
    success: boolean;
    data?: VolunteerHours;
    error?: string;
  }> {
    try {
      // Verify tutoring session exists and is completed
      const { data: session, error: sessionError } = await this.supabase
        .from('tutoring_sessions')
        .select('*')
        .eq('id', sessionId)
        .eq('intern_id', internId)
        .eq('status', 'completed')
        .single();

      if (sessionError || !session) {
        return { success: false, error: 'Tutoring session not found or not completed' };
      }

      // Check if hours already exist for this session
      const { data: existingHours } = await this.supabase
        .from('volunteer_hours')
        .select('*')
        .eq('reference_id', sessionId)
        .single();

      if (existingHours) {
        return { success: false, error: 'Volunteer hours already exist for this session' };
      }

      // Create volunteer hours record
      const { data: volunteerHours, error } = await this.supabase
        .from('volunteer_hours')
        .insert({
          intern_id: internId,
          activity_date: session.scheduled_time || new Date().toISOString().split('T')[0],
          activity_type: 'Tutoring Session',
          activity_description: `Tutoring session for ${session.subject}`,
          hours: hours,
          description: description || `Completed tutoring session in ${session.subject}`,
          reference_id: sessionId,
          status: 'approved', // Auto-approve tutoring session hours
          approved_at: new Date().toISOString()
        })
        .select()
        .single();

      if (error) {
        console.error('Error creating hours from tutoring session:', error);
        return { success: false, error: 'Failed to create volunteer hours' };
      }

      // Update intern's total volunteer hours
      await this.updateInternTotalHours(internId);

      return { success: true, data: volunteerHours };
    } catch (error) {
      console.error('Error in createHoursFromTutoringSession:', error);
      return { success: false, error: 'Internal server error' };
    }
  }

  /**
   * Update intern's total volunteer hours
   */
  private async updateInternTotalHours(internId: string): Promise<void> {
    try {
      const { data: hours } = await this.supabase
        .from('volunteer_hours')
        .select('hours')
        .eq('intern_id', internId)
        .eq('status', 'approved');

      const totalHours = hours?.reduce((sum, h) => sum + h.hours, 0) || 0;

      await this.supabase
        .from('profiles')
        .update({ total_volunteer_hours: totalHours })
        .eq('id', internId);
    } catch (error) {
      console.error('Error updating intern total hours:', error);
    }
  }

  /**
   * Notify admins of new volunteer hours submission
   */
  private async notifyAdminsOfNewSubmission(
    volunteerHours: VolunteerHours,
    intern: Profile
  ): Promise<void> {
    try {
      // Get all admin users
      const { data: admins } = await this.supabase
        .from('profiles')
        .select('email, full_name')
        .eq('role', 'admin');

      if (admins && admins.length > 0) {
        // Send notification to all admins (in production, you might want to batch this)
        for (const admin of admins) {
          await EmailServiceIntegration.sendEmail({
            to: admin.email,
            subject: `New Volunteer Hours Submission - ${intern.full_name}`,
            body: `
              <h3>New Volunteer Hours Submission</h3>
              <p><strong>Intern:</strong> ${intern.full_name}</p>
              <p><strong>Activity:</strong> ${volunteerHours.activity_type}</p>
              <p><strong>Hours:</strong> ${volunteerHours.hours}</p>
              <p><strong>Date:</strong> ${volunteerHours.activity_date}</p>
              <p><strong>Description:</strong> ${volunteerHours.activity_description}</p>
              <br>
              <p>Please review and approve/reject this submission.</p>
            `
          });
        }
      }
    } catch (error) {
      console.error('Error notifying admins:', error);
    }
  }
}

export default VolunteerHoursService; 