import { supabase } from "./supabase/client"
import { Database } from './database.types'
import { emailService } from './email-service-integration'

type Profile = Database['public']['Tables']['profiles']['Row']
type VolunteerHours = Database['public']['Tables']['volunteer_hours']['Row']
type TutoringSession = Database['public']['Tables']['tutoring_sessions']['Row']

export interface VolunteerHoursSubmission {
  intern_id: string
  activity_type: 'tutoring' | 'mentoring' | 'event_assistance' | 'other'
  description: string
  hours: number
  date: string
}

export interface VolunteerHoursApproval {
  hours_id: string
  approved_by: string
  approved: boolean
  rejection_reason?: string
}

export interface VolunteerHoursSummary {
  total_hours: number
  pending_hours: number
  approved_hours: number
  rejected_hours: number
  recent_submissions: VolunteerHours[]
}

class VolunteerHoursService {
  private supabase = supabase

  // Submit volunteer hours
  async submitVolunteerHours(
    submission: VolunteerHoursSubmission
  ): Promise<{ success: boolean; hours?: VolunteerHours; error?: string }> {
    try {
      // Validate submission
      if (submission.hours <= 0 || submission.hours > 24) {
        return { success: false, error: 'Hours must be between 0 and 24' }
      }

      if (!submission.description.trim()) {
        return { success: false, error: 'Description is required' }
      }

      // Check for duplicate submissions on the same date
      const { data: existingHours } = await this.supabase
        .from('volunteer_hours')
        .select('id')
        .eq('intern_id', submission.intern_id)
        .eq('date', submission.date)
        .eq('activity_type', submission.activity_type)

      if (existingHours && existingHours.length > 0) {
        return { success: false, error: 'You have already submitted hours for this activity on this date' }
      }

      const { data: hours, error } = await this.supabase
        .from('volunteer_hours')
        .insert({
          intern_id: submission.intern_id,
          activity_type: submission.activity_type,
          description: submission.description,
          hours: submission.hours,
          date: submission.date,
          status: 'pending'
        })
        .select()
        .single()

      if (error) throw error

      // Log admin action
      await this.logAdminAction('volunteer_hours_submitted', submission.intern_id, submission.intern_id, true)

      return { success: true, hours }
    } catch (error) {
      console.error('Error submitting volunteer hours:', error)
      return { success: false, error: error instanceof Error ? error.message : 'Unknown error' }
    }
  }

  // Get volunteer hours for an intern
  async getVolunteerHours(
    internId: string,
    status?: 'pending' | 'approved' | 'rejected'
  ): Promise<{ success: boolean; hours?: VolunteerHours[]; error?: string }> {
    try {
      let query = this.supabase
        .from('volunteer_hours')
        .select('*')
        .eq('intern_id', internId)
        .order('created_at', { ascending: false })

      if (status) {
        query = query.eq('status', status)
      }

      const { data: hours, error } = await query

      if (error) throw error

      return { success: true, hours: hours || [] }
    } catch (error) {
      console.error('Error getting volunteer hours:', error)
      return { success: false, error: error instanceof Error ? error.message : 'Unknown error' }
    }
  }

  // Get volunteer hours summary for an intern
  async getVolunteerHoursSummary(
    internId: string
  ): Promise<{ success: boolean; summary?: VolunteerHoursSummary; error?: string }> {
    try {
      const { data: hours, error } = await this.supabase
        .from('volunteer_hours')
        .select('*')
        .eq('intern_id', internId)

      if (error) throw error

      const totalHours = hours?.reduce((sum, hour) => sum + (hour.status === 'approved' ? hour.hours : 0), 0) || 0
      const pendingHours = hours?.filter(hour => hour.status === 'pending').length || 0
      const approvedHours = hours?.filter(hour => hour.status === 'approved').length || 0
      const rejectedHours = hours?.filter(hour => hour.status === 'rejected').length || 0

      const recentSubmissions = hours?.slice(0, 5) || []

      const summary: VolunteerHoursSummary = {
        total_hours: totalHours,
        pending_hours: pendingHours,
        approved_hours: approvedHours,
        rejected_hours: rejectedHours,
        recent_submissions: recentSubmissions
      }

      return { success: true, summary }
    } catch (error) {
      console.error('Error getting volunteer hours summary:', error)
      return { success: false, error: error instanceof Error ? error.message : 'Unknown error' }
    }
  }

  // Get pending volunteer hours for admin review
  async getPendingVolunteerHours(): Promise<{ success: boolean; hours?: (VolunteerHours & { intern: Profile })[]; error?: string }> {
    try {
      const { data: hours, error } = await this.supabase
        .from('volunteer_hours')
        .select(`
          *,
          profiles!volunteer_hours_intern_id_fkey(*)
        `)
        .eq('status', 'pending')
        .order('created_at', { ascending: false })

      if (error) throw error

      const hoursWithInterns = hours?.map(hour => ({
        ...hour,
        intern: hour.profiles
      })) || []

      return { success: true, hours: hoursWithInterns }
    } catch (error) {
      console.error('Error getting pending volunteer hours:', error)
      return { success: false, error: error instanceof Error ? error.message : 'Unknown error' }
    }
  }

  // Approve or reject volunteer hours
  async reviewVolunteerHours(
    approval: VolunteerHoursApproval
  ): Promise<{ success: boolean; error?: string }> {
    try {
      // Get the volunteer hours record
      const { data: hours, error: fetchError } = await this.supabase
        .from('volunteer_hours')
        .select('*')
        .eq('id', approval.hours_id)
        .single()

      if (fetchError) throw fetchError

      if (!hours) {
        return { success: false, error: 'Volunteer hours not found' }
      }

      if (hours.status !== 'pending') {
        return { success: false, error: 'Volunteer hours have already been reviewed' }
      }

      // Update the volunteer hours
      const updateData: any = {
        status: approval.approved ? 'approved' : 'rejected',
        approved_by: approval.approved ? approval.approved_by : null,
        approved_at: approval.approved ? new Date().toISOString() : null,
        rejection_reason: approval.approved ? null : approval.rejection_reason
      }

      const { error: updateError } = await this.supabase
        .from('volunteer_hours')
        .update(updateData)
        .eq('id', approval.hours_id)

      if (updateError) throw updateError

      // If approved, update the intern's total volunteer hours
      if (approval.approved) {
        await this.updateInternTotalHours(hours.intern_id)
      }

      // Get intern profile for email notification
      const { data: intern } = await this.supabase
        .from('profiles')
        .select('*')
        .eq('id', hours.intern_id)
        .single()

      if (intern) {
        // Send email notification
        if (approval.approved) {
          const summaryResult = await this.getVolunteerHoursSummary(hours.intern_id)
          await emailService.sendVolunteerHourApproval(
            intern,
            hours,
            summaryResult.summary?.total_hours || 0
          )
        } else {
          await emailService.sendVolunteerHourRejection(
            intern,
            hours,
            approval.rejection_reason || 'No reason provided'
          )
        }
      }

      // Log admin action
      await this.logAdminAction(
        approval.approved ? 'volunteer_hours_approved' : 'volunteer_hours_rejected',
        hours.intern_id,
        approval.approved_by,
        true
      )

      return { success: true }
    } catch (error) {
      console.error('Error reviewing volunteer hours:', error)
      return { success: false, error: error instanceof Error ? error.message : 'Unknown error' }
    }
  }

  // Generate volunteer hours from completed tutoring session
  async generateHoursFromTutoringSession(
    sessionId: string
  ): Promise<{ success: boolean; hours?: VolunteerHours; error?: string }> {
    try {
      // Get the tutoring session
      const { data: session, error: sessionError } = await this.supabase
        .from('tutoring_sessions')
        .select('*')
        .eq('id', sessionId)
        .single()

      if (sessionError) throw sessionError

      if (!session) {
        return { success: false, error: 'Tutoring session not found' }
      }

      if (session.status !== 'completed') {
        return { success: false, error: 'Tutoring session is not completed' }
      }

      if (session.volunteer_hours_id) {
        return { success: false, error: 'Volunteer hours have already been generated for this session' }
      }

      // Calculate hours (convert minutes to hours)
      const hours = Math.round((session.duration_minutes / 60) * 100) / 100

      // Create volunteer hours entry
      const { data: volunteerHours, error: hoursError } = await this.supabase
        .from('volunteer_hours')
        .insert({
          intern_id: session.tutor_id,
          activity_type: 'tutoring',
          description: `Tutoring session in ${session.subject} with student`,
          hours: hours,
          date: session.session_date.split('T')[0], // Extract date part
          status: 'approved', // Auto-approve tutoring hours
          approved_by: session.tutor_id, // Self-approved
          approved_at: new Date().toISOString()
        })
        .select()
        .single()

      if (hoursError) throw hoursError

      // Update tutoring session with volunteer hours reference
      await this.supabase
        .from('tutoring_sessions')
        .update({ volunteer_hours_id: volunteerHours.id })
        .eq('id', sessionId)

      // Update intern's total volunteer hours
      await this.updateInternTotalHours(session.tutor_id)

      return { success: true, hours: volunteerHours }
    } catch (error) {
      console.error('Error generating hours from tutoring session:', error)
      return { success: false, error: error instanceof Error ? error.message : 'Unknown error' }
    }
  }

  // Update intern's total volunteer hours
  private async updateInternTotalHours(internId: string): Promise<void> {
    try {
      const { data: approvedHours } = await this.supabase
        .from('volunteer_hours')
        .select('hours')
        .eq('intern_id', internId)
        .eq('status', 'approved')

      const totalHours = approvedHours?.reduce((sum, hour) => sum + hour.hours, 0) || 0

      await this.supabase
        .from('profiles')
        .update({ total_volunteer_hours: totalHours })
        .eq('id', internId)
    } catch (error) {
      console.error('Error updating intern total hours:', error)
    }
  }

  // Log admin action
  private async logAdminAction(
    actionType: string,
    targetUserId: string,
    performedBy: string,
    isAllowed: boolean,
    reason?: string
  ): Promise<void> {
    try {
      await this.supabase
        .from('admin_actions_log')
        .insert({
          action_type: actionType,
          target_user_id: targetUserId,
          performed_by: performedBy,
          is_allowed: isAllowed,
          reason: reason
        })
    } catch (error) {
      console.error('Error logging admin action:', error)
    }
  }

  // Get volunteer hours statistics for admin dashboard
  async getVolunteerHoursStats(): Promise<{ success: boolean; stats?: any; error?: string }> {
    try {
      const { data: hours, error } = await this.supabase
        .from('volunteer_hours')
        .select('*')

      if (error) throw error

      const stats = {
        total_submissions: hours?.length || 0,
        pending_submissions: hours?.filter(h => h.status === 'pending').length || 0,
        approved_submissions: hours?.filter(h => h.status === 'approved').length || 0,
        rejected_submissions: hours?.filter(h => h.status === 'rejected').length || 0,
        total_hours_approved: hours?.reduce((sum, h) => sum + (h.status === 'approved' ? h.hours : 0), 0) || 0,
        average_hours_per_submission: hours?.length ? 
          hours.reduce((sum, h) => sum + h.hours, 0) / hours.length : 0
      }

      return { success: true, stats }
    } catch (error) {
      console.error('Error getting volunteer hours stats:', error)
      return { success: false, error: error instanceof Error ? error.message : 'Unknown error' }
    }
  }
}

// Export singleton instance
export const volunteerHoursService = new VolunteerHoursService() 