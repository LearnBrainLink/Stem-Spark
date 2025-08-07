'use server'

import { signOut as signOutOriginal } from '@/lib/enhanced-auth-actions'
import { redirect } from 'next/navigation'
import { createServerClient } from '@/lib/supabase-server'
import { cookies } from 'next/headers'
import { createClient } from "@supabase/supabase-js"
import { Database } from "@/lib/database.types"

// Create service role client that bypasses RLS
const createServiceRoleClient = () => {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

  if (!supabaseUrl || !supabaseServiceKey) {
    throw new Error("Missing Supabase service role configuration")
  }

  return createClient<Database>(supabaseUrl, supabaseServiceKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  })
}

export async function signOut() {
  const result = await signOutOriginal()
  if (result.redirectPath) {
    redirect(result.redirectPath)
  }
}

export async function getEnhancedDashboardStats() {
  const cookieStore = cookies();
  const supabase = createServerClient(cookieStore);

  try {
    console.log('🔍 Starting enhanced dashboard stats fetch...')

    // Initialize stats with defaults
    let stats = {
      totalUsers: 0,
      students: 0,
      teachers: 0,
      parents: 0,
      admins: 0,
      activeInternships: 0,
      totalInternships: 0,
      pendingApplications: 0,
      totalApplications: 0,
      totalRevenue: 0,
      thisMonthRevenue: 0,
      totalVideos: 0,
      activeVideos: 0,
      recentActivity: [] as any[],
      userGrowth: [] as any[],
      applicationStats: [] as any[],
    }

    // Fetch user statistics with role breakdown
    try {
      const { data: users, error: userError } = await supabase
        .from('profiles')
        .select('role, created_at, email_verified, full_name, email')
        .order('created_at', { ascending: false })

      if (!userError && users) {
        stats.totalUsers = users.length
        stats.students = users.filter(u => u.role === 'student').length
        stats.teachers = users.filter(u => u.role === 'teacher').length
        stats.parents = users.filter(u => u.role === 'parent').length
        stats.admins = users.filter(u => u.role === 'admin').length

        // Get recent activity (last 10 users)
        stats.recentActivity = users.slice(0, 10).map(user => ({
          type: 'user_registered',
          user: user,
          timestamp: user.created_at,
          description: `New ${user.role} registered`,
          name: user.full_name || user.email
        }))

        // Generate user growth data (last 6 months)
        const now = new Date()
        stats.userGrowth = []
        for (let i = 5; i >= 0; i--) {
          const monthStart = new Date(now.getFullYear(), now.getMonth() - i, 1)
          const monthEnd = new Date(now.getFullYear(), now.getMonth() - i + 1, 0)
          const monthName = monthStart.toLocaleString('default', { month: 'short' })
          
          const usersInMonth = users.filter(user => {
            const userDate = new Date(user.created_at)
            return userDate >= monthStart && userDate <= monthEnd
          }).length
          
          stats.userGrowth.push({ 
            month: monthName, 
            users: usersInMonth,
            students: users.filter(user => {
              const userDate = new Date(user.created_at)
              return user.role === 'student' && userDate >= monthStart && userDate <= monthEnd
            }).length,
            teachers: users.filter(user => {
              const userDate = new Date(user.created_at)
              return user.role === 'teacher' && userDate >= monthStart && userDate <= monthEnd
            }).length,
            parents: users.filter(user => {
              const userDate = new Date(user.created_at)
              return user.role === 'parent' && userDate >= monthStart && userDate <= monthEnd
            }).length,
          })
        }
      }
    } catch (err) {
      console.log('⚠️ Users query exception:', err)
    }

    // Fetch internship statistics
    try {
      const { data: internships, error: internshipError } = await supabase
        .from('internships')
        .select('*')

      if (!internshipError && internships) {
        stats.totalInternships = internships.length
        stats.activeInternships = internships.filter(i => i.status === 'active').length
      }
    } catch (err) {
      console.log('⚠️ Internships query exception:', err)
    }

    // Fetch application statistics
    try {
      const { data: applications, error: applicationError } = await supabase
        .from('internship_applications')
        .select('*')

      if (!applicationError && applications) {
        stats.totalApplications = applications.length
        stats.pendingApplications = applications.filter(a => a.status === 'pending').length
        
        // Application status breakdown
        const statusCounts = {
          pending: applications.filter(a => a.status === 'pending').length,
          approved: applications.filter(a => a.status === 'approved').length,
          rejected: applications.filter(a => a.status === 'rejected').length,
          withdrawn: applications.filter(a => a.status === 'withdrawn').length,
        }
        
        stats.applicationStats = [
          { status: 'pending', count: statusCounts.pending, color: '#F59E0B' },
          { status: 'approved', count: statusCounts.approved, color: '#10B981' },
          { status: 'rejected', count: statusCounts.rejected, color: '#EF4444' },
          { status: 'withdrawn', count: statusCounts.withdrawn, color: '#6B7280' },
        ]
      }
    } catch (err) {
      console.log('⚠️ Applications query exception:', err)
    }

    // Fetch revenue statistics
    try {
      const { data: donations, error: donationError } = await supabase
        .from('donations')
        .select('amount, created_at, status')

      if (!donationError && donations) {
        const completedDonations = donations.filter(d => d.status === 'completed')
        stats.totalRevenue = completedDonations.reduce((sum, d) => sum + (d.amount || 0), 0)
        
        // Calculate this month's revenue
        const now = new Date()
        const thisMonth = new Date(now.getFullYear(), now.getMonth(), 1)
        const thisMonthDonations = completedDonations.filter(d => 
          new Date(d.created_at) >= thisMonth
        )
        stats.thisMonthRevenue = thisMonthDonations.reduce((sum, d) => sum + (d.amount || 0), 0)
      }
    } catch (err) {
      console.log('⚠️ Revenue query exception:', err)
    }

    // Fetch video statistics
    try {
      const { data: videos, error: videoError } = await supabase
        .from('videos')
        .select('*')

      if (!videoError && videos) {
        stats.totalVideos = videos.length
        stats.activeVideos = videos.filter(v => v.status === 'active').length
      }
    } catch (err) {
      console.log('⚠️ Videos query exception:', err)
    }

    console.log('📊 Enhanced stats:', stats)

    return {
      error: null,
      stats: stats
    }
  } catch (error) {
    console.error('💥 Unexpected error in getEnhancedDashboardStats:', error)
    return {
      error: error instanceof Error ? error.message : 'Unknown error',
      stats: {
        totalUsers: 0,
        students: 0,
        teachers: 0,
        parents: 0,
        admins: 0,
        activeInternships: 0,
        totalInternships: 0,
        pendingApplications: 0,
        totalApplications: 0,
        totalRevenue: 0,
        thisMonthRevenue: 0,
        totalVideos: 0,
        activeVideos: 0,
        recentActivity: [],
        userGrowth: [],
        applicationStats: [],
      },
    }
  }
}

export async function getEnhancedUsersData() {
  const cookieStore = cookies();
  const supabase = createServerClient(cookieStore);

  try {
    const { data: users, error } = await supabase
      .from('profiles')
      .select('*')
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Error fetching users:', error)
      return { error: error.message, users: [] }
    }

    // Transform the data for better display
    const transformedUsers = users?.map(user => ({
      ...user,
      status: user.email_verified ? 'Verified' : 'Pending',
      lastActive: user.updated_at || user.created_at,
      roleDisplay: user.role ? user.role.charAt(0).toUpperCase() + user.role.slice(1) : 'Unknown',
      isActive: user.email_verified,
    })) || []

    return { error: null, users: transformedUsers }
  } catch (error) {
    console.error('Error in getEnhancedUsersData:', error)
    return { error: 'Failed to fetch users', users: [] }
  }
}

export async function getEnhancedInternshipsData() {
  try {
    // Use service role client to bypass RLS
    const supabase = createServiceRoleClient()

    const { data: internships, error } = await supabase
      .from('internships')
      .select(`
        *,
        internship_applications(count)
      `)
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Error fetching internships:', error)
      return { error: error.message, internships: [] }
    }

    // Transform the data
    const transformedInternships = internships?.map(internship => ({
      ...internship,
      applicationCount: internship.internship_applications?.[0]?.count || 0,
      isActive: internship.status === 'active',
      daysLeft: internship.application_deadline ? 
        Math.ceil((new Date(internship.application_deadline).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)) : null,
    })) || []

    return { error: null, internships: transformedInternships }
  } catch (error) {
    console.error('Error in getEnhancedInternshipsData:', error)
    return { error: 'Failed to fetch internships', internships: [] }
  }
}

export async function getEnhancedApplicationsData() {
  try {
    // Use service role client to bypass RLS
    const supabase = createServiceRoleClient()

    console.log('Fetching applications data...');

    // First try the modern approach with named relationships (basic columns only)
    let { data: applications, error } = await supabase
      .from('internship_applications')
      .select(`
        *,
        profiles!student_id(id, full_name, email, role),
        internships!internship_id(id, title, company)
      `)
      .order('applied_at', { ascending: false })

    // If that fails, try the fallback approach with explicit foreign key names
    if (error && error.message?.includes('relationship')) {
      console.log('First query failed, trying fallback approach:', error.message);
      
      const fallbackResult = await supabase
        .from('internship_applications')
        .select(`
          *,
          profiles!internship_applications_student_id_fkey(id, full_name, email, role),
          internships!internship_applications_internship_id_fkey(id, title, company)
        `)
        .order('applied_at', { ascending: false })
      
      applications = fallbackResult.data;
      error = fallbackResult.error;
    }

    // If both approaches fail, try manual joins
    if (error && error.message?.includes('relationship')) {
      console.log('Both relationship queries failed, trying manual approach:', error.message);
      
      const manualResult = await supabase
        .from('internship_applications')
        .select(`
          id,
          internship_id,
          student_id,
          application_text,
          status,
          applied_at,
          reviewed_at,
          reviewed_by,
          created_at,
          updated_at
        `)
        .order('applied_at', { ascending: false })

      if (manualResult.error) {
        console.error('Manual query also failed:', manualResult.error)
        return { error: manualResult.error.message, applications: [] }
      }

      // Manually fetch related data
      const applicationsWithRelations = []
      
      for (const app of manualResult.data || []) {
        // Fetch student profile (only basic columns to avoid missing column errors)
        const { data: profile } = await supabase
          .from('profiles')
          .select('id, full_name, email, role')
          .eq('id', app.student_id)
          .single()

        // Fetch internship details
        const { data: internship } = await supabase
          .from('internships')
          .select('id, title, company')
          .eq('id', app.internship_id)
          .single()

        applicationsWithRelations.push({
          ...app,
          profiles: profile,
          internships: internship
        })
      }

      applications = applicationsWithRelations;
      error = null;
    }

    if (error) {
      console.error('Error fetching applications:', error)
      return { error: error.message, applications: [] }
    }

    // Transform the data
    const transformedApplications = applications?.map(application => ({
      ...application,
      studentName: application.profiles?.full_name || 'Unknown Student',
      studentEmail: application.profiles?.email || 'No email',
      internshipTitle: application.internships?.title || 'Unknown Internship',
      companyName: application.internships?.company || 'Unknown Company',
      isPending: application.status === 'pending',
      isApproved: application.status === 'approved',
      isRejected: application.status === 'rejected',
      daysSinceApplied: application.applied_at ? 
        Math.ceil((new Date().getTime() - new Date(application.applied_at).getTime()) / (1000 * 60 * 60 * 24)) : 0,
    })) || []

    return { error: null, applications: transformedApplications }
  } catch (error) {
    console.error('Error in getEnhancedApplicationsData:', error)
    return { error: 'Failed to fetch applications', applications: [] }
  }
}

export async function getEnhancedVideosData() {
  try {
    console.log('🔍 Starting enhanced videos data fetch...')
    
    // Check environment variables
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY
    
    if (!supabaseUrl || !supabaseServiceKey) {
      console.error('❌ Missing Supabase environment variables:', {
        hasUrl: !!supabaseUrl,
        hasServiceKey: !!supabaseServiceKey
      })
      return { error: 'Missing Supabase configuration', videos: [] }
    }

    // Use service role client to bypass RLS
    const supabase = createServiceRoleClient()
    console.log('✅ Service role client created successfully')

    console.log('📡 Fetching videos from database...')
    const { data: videos, error } = await supabase
      .from('videos')
      .select('*')
      .order('created_at', { ascending: false })

    if (error) {
      console.error('❌ Error fetching videos:', error)
      return { error: error.message, videos: [] }
    }

    console.log('✅ Videos fetched successfully:', videos?.length || 0, 'videos')

    // Transform the data
    const transformedVideos = videos?.map(video => ({
      ...video,
      isActive: video.status === 'active',
      durationFormatted: video.duration ? `${Math.floor(video.duration / 60)}:${(video.duration % 60).toString().padStart(2, '0')}` : '0:00',
      categoryColor: video.category === 'STEM' ? 'blue' : 
                     video.category === 'Technology' ? 'purple' : 
                     video.category === 'Science' ? 'green' : 'gray',
    })) || []

    console.log('✅ Videos transformed successfully')
    return { error: null, videos: transformedVideos }
  } catch (error) {
    console.error('❌ Error in getEnhancedVideosData:', error)
    return { error: error instanceof Error ? error.message : 'Failed to fetch videos', videos: [] }
  }
}

export async function updateUserRole(userId: string, newRole: string) {
  const cookieStore = cookies();
  const supabase = createServerClient(cookieStore);

  try {
    const { error } = await supabase
      .from('profiles')
      .update({ role: newRole })
      .eq('id', userId)

    if (error) {
      console.error('Error updating user role:', error)
      return { error: error.message }
    }

    return { error: null, success: true }
  } catch (error) {
    console.error('Error in updateUserRole:', error)
    return { error: 'Failed to update user role' }
  }
}

export async function updateApplicationStatus(applicationId: string, newStatus: string) {
  const cookieStore = cookies();
  const supabase = createServerClient(cookieStore);

  try {
    const { error } = await supabase
      .from('internship_applications')
      .update({ status: newStatus })
      .eq('id', applicationId)

    if (error) {
      console.error('Error updating application status:', error)
      return { error: error.message }
    }

    return { error: null, success: true }
  } catch (error) {
    console.error('Error in updateApplicationStatus:', error)
    return { error: 'Failed to update application status' }
  }
}

export async function updateInternshipStatus(internshipId: string, newStatus: string) {
  const cookieStore = cookies();
  const supabase = createServerClient(cookieStore);

  try {
    const { error } = await supabase
      .from('internships')
      .update({ status: newStatus })
      .eq('id', internshipId)

    if (error) {
      console.error('Error updating internship status:', error)
      return { error: error.message }
    }

    return { error: null, success: true }
  } catch (error) {
    console.error('Error in updateInternshipStatus:', error)
    return { error: 'Failed to update internship status' }
  }
}

export async function updateVideoStatus(videoId: string, newStatus: string) {
  const cookieStore = cookies();
  const supabase = createServerClient(cookieStore);

  try {
    const { error } = await supabase
      .from('videos')
      .update({ status: newStatus })
      .eq('id', videoId)

    if (error) {
      console.error('Error updating video status:', error)
      return { error: error.message }
    }

    return { error: null, success: true }
  } catch (error) {
    console.error('Error in updateVideoStatus:', error)
    return { error: 'Failed to update video status' }
  }
}

export async function getEnhancedConfigurationData() {
  const cookieStore = cookies();
  const supabase = createServerClient(cookieStore);
  try {
    const { data: config, error } = await supabase
      .from('configuration')
      .select('*')
      .single();
    if (error) {
      return { error: error.message, config: null };
    }
    return { error: null, config };
  } catch (error) {
    return { error: 'Failed to fetch configuration', config: null };
  }
}

export async function getEnhancedSettingsData() {
  const cookieStore = cookies();
  const supabase = createServerClient(cookieStore);
  try {
    const { data: settings, error } = await supabase
      .from('settings')
      .select('*')
      .single();
    if (error) {
      return { error: error.message, settings: null };
    }
    return { error: null, settings };
  } catch (error) {
    return { error: 'Failed to fetch settings', settings: null };
  }
}

export async function updateEnhancedSettingsData(newSettings: any) {
  const cookieStore = cookies();
  const supabase = createServerClient(cookieStore);
  try {
    const { error } = await supabase
      .from('settings')
      .update(newSettings)
      .eq('id', newSettings.id);
    if (error) {
      return { error: error.message };
    }
    return { error: null, success: true };
  } catch (error) {
    return { error: 'Failed to update settings' };
  }
}

// CRUD Functions for Users
export async function createUser(userData: any) {
  const cookieStore = cookies();
  const supabase = createServerClient(cookieStore);

  try {
    // Create auth user
    const { data: authData, error: authError } = await supabase.auth.admin.createUser({
      email: userData.email,
      password: userData.password || "TempPassword123!",
      email_confirm: true,
      user_metadata: {
        full_name: userData.full_name,
      },
    });

    if (authError) throw authError;

    // Create profile
    const { error: profileError } = await supabase.from("profiles").insert({
      id: authData.user.id,
      ...userData,
      email_verified: true,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    });

    if (profileError) throw profileError;

    return { error: null, success: true, user: authData.user };
  } catch (error) {
    console.error('Error in createUser:', error);
    return { error: error instanceof Error ? error.message : 'Failed to create user' };
  }
}

export async function updateUser(userId: string, userData: any) {
  const cookieStore = cookies();
  const supabase = createServerClient(cookieStore);

  try {
    const { error } = await supabase
      .from("profiles")
      .update({
        ...userData,
        updated_at: new Date().toISOString(),
      })
      .eq("id", userId);

    if (error) throw error;

    return { error: null, success: true };
  } catch (error) {
    console.error('Error in updateUser:', error);
    return { error: error instanceof Error ? error.message : 'Failed to update user' };
  }
}

export async function deleteUser(userId: string) {
  const cookieStore = cookies();
  const supabase = createServerClient(cookieStore);

  try {
    // Delete from auth
    const { error: authError } = await supabase.auth.admin.deleteUser(userId);
    if (authError) throw authError;

    // Delete profile (should be handled by RLS)
    const { error: profileError } = await supabase
      .from("profiles")
      .delete()
      .eq("id", userId);

    if (profileError) throw profileError;

    return { error: null, success: true };
  } catch (error) {
    console.error('Error in deleteUser:', error);
    return { error: error instanceof Error ? error.message : 'Failed to delete user' };
  }
}

// CRUD Functions for Videos
export async function createVideo(videoData: any) {
  try {
    console.log('=== VIDEO CREATION DEBUG START ===');
    console.log('createVideo: Starting video creation with data:', JSON.stringify(videoData, null, 2));

    // Validate required fields
    if (!videoData.title || !videoData.video_url) {
      const error = 'Title and video URL are required';
      console.error('createVideo: Validation error:', error);
      return { error };
    }

    const videoToInsert = {
      title: videoData.title.trim(),
      description: videoData.description?.trim() || '',
      video_url: videoData.video_url.trim(),
      duration: videoData.duration || 0,
      category: videoData.category || 'general',
      status: videoData.status || 'active',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    console.log('createVideo: Final data to insert:', JSON.stringify(videoToInsert, null, 2));

    let supabase;
    let clientType = 'unknown';
    
    // Try to use service role client first, fall back to regular client
    try {
      supabase = createServiceRoleClient();
      clientType = 'service_role';
      console.log('createVideo: Using service role client successfully');
    } catch (serviceRoleError) {
      console.log('createVideo: Service role failed, error:', serviceRoleError.message);
      console.log('createVideo: Falling back to regular client');
      try {
        const cookieStore = cookies();
        supabase = createServerClient(cookieStore);
        clientType = 'regular';
        console.log('createVideo: Using regular client successfully');
      } catch (regularClientError) {
        console.error('createVideo: Both clients failed');
        console.error('Service role error:', serviceRoleError.message);
        console.error('Regular client error:', regularClientError.message);
        return { error: 'Failed to create database client. Check your Supabase configuration.' };
      }
    }

    console.log(`createVideo: About to insert using ${clientType} client`);

    // First attempt with video_url column
    let { data, error } = await supabase
      .from("videos")
      .insert(videoToInsert)
      .select()
      .single();

    console.log('createVideo: Insert response - data:', data);
    console.log('createVideo: Insert response - error:', error);

    // If video_url column doesn't exist, try with url column as fallback
    if (error && error.message?.includes('video_url')) {
      console.log('createVideo: video_url column not found, trying with url column...');
      
      const fallbackVideoData = {
        ...videoToInsert,
        url: videoToInsert.video_url, // Map video_url to url
      };
      delete fallbackVideoData.video_url; // Remove video_url
      
      console.log('createVideo: Fallback data:', JSON.stringify(fallbackVideoData, null, 2));
      
      const fallbackResult = await supabase
        .from("videos")
        .insert(fallbackVideoData)
        .select()
        .single();
        
      data = fallbackResult.data;
      error = fallbackResult.error;
      
      console.log('createVideo: Fallback response - data:', data);
      console.log('createVideo: Fallback response - error:', error);
    }

    if (error) {
      console.error('createVideo: Database error details:', {
        message: error.message,
        details: error.details,
        hint: error.hint,
        code: error.code
      });
      
      // Provide specific error messages based on error type
      if (error.message?.includes('policy') || error.code === '42501') {
        return { 
          error: `RLS Policy Error: ${error.message}. Please run the SQL policy fix script in your Supabase dashboard.`
        };
      }
      
      if (error.message?.includes('relation') || error.message?.includes('does not exist')) {
        return {
          error: `Table Error: ${error.message}. The videos table may not exist or be accessible.`
        };
      }
      
      if (error.message?.includes('column') || error.code === '42703') {
        return {
          error: `Column Error: ${error.message}. Please run the column schema fix script: scripts/fix-video-column-schema.sql`
        };
      }
      
      throw error;
    }

    console.log('createVideo: Video created successfully:', data);
    console.log('=== VIDEO CREATION DEBUG END ===');
    return { error: null, success: true, video: data };
  } catch (error) {
    console.error('=== VIDEO CREATION ERROR ===');
    console.error('createVideo: Unexpected error:', error);
    console.error('Error type:', typeof error);
    console.error('Error constructor:', error.constructor?.name);
    
    const errorMessage = error instanceof Error ? error.message : 'Failed to create video';
    console.error('Final error message:', errorMessage);
    console.error('=== VIDEO CREATION ERROR END ===');
    
    // Provide more specific error messages
    if (errorMessage.includes('duplicate key')) {
      return { error: 'A video with this information already exists' };
    } else if (errorMessage.includes('Missing Supabase service role configuration')) {
      return { error: 'Database configuration error. Service role key missing.' };
    } else if (errorMessage.includes('permission') || errorMessage.includes('policy')) {
      return { error: 'Database permission error. Please run the video creation policy fix script in your Supabase dashboard.' };
    } else if (errorMessage.includes('network') || errorMessage.includes('fetch')) {
      return { error: 'Network error. Please check your connection and try again.' };
    } else if (errorMessage.includes('column') || errorMessage.includes('video_url')) {
      return { error: 'Database schema error. Please run the column schema fix script: scripts/fix-video-column-schema.sql' };
    }
    
    return { error: `Video creation failed: ${errorMessage}` };
  }
}

export async function updateVideo(videoId: string, videoData: any) {
  try {
    // Use service role client to bypass RLS
    const supabase = createServiceRoleClient()

    const { data, error } = await supabase
      .from("videos")
      .update({
        ...videoData,
        updated_at: new Date().toISOString(),
      })
      .eq("id", videoId)
      .select()
      .single();

    if (error) throw error;

    return { error: null, success: true, video: data };
  } catch (error) {
    console.error('Error in updateVideo:', error);
    return { error: error instanceof Error ? error.message : 'Failed to update video' };
  }
}

export async function deleteVideo(videoId: string) {
  try {
    // Use service role client to bypass RLS
    const supabase = createServiceRoleClient()

    const { error } = await supabase
      .from("videos")
      .delete()
      .eq("id", videoId);

    if (error) throw error;

    return { error: null, success: true };
  } catch (error) {
    console.error('Error in deleteVideo:', error);
    return { error: error instanceof Error ? error.message : 'Failed to delete video' };
  }
}

// CRUD Functions for Internships
export async function createInternship(internshipData: any) {
  try {
    // Use service role client to bypass RLS
    const supabase = createServiceRoleClient()

    const { data, error } = await supabase
      .from("internships")
      .insert({
        ...internshipData,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (error) throw error;

    return { error: null, success: true, internship: data };
  } catch (error) {
    console.error('Error in createInternship:', error);
    return { error: error instanceof Error ? error.message : 'Failed to create internship' };
  }
}

export async function updateInternship(internshipId: string, internshipData: any) {
  try {
    // Use service role client to bypass RLS
    const supabase = createServiceRoleClient()

    const { data, error } = await supabase
      .from("internships")
      .update({
        ...internshipData,
        updated_at: new Date().toISOString(),
      })
      .eq("id", internshipId)
      .select()
      .single();

    if (error) throw error;

    return { error: null, success: true, internship: data };
  } catch (error) {
    console.error('Error in updateInternship:', error);
    return { error: error instanceof Error ? error.message : 'Failed to update internship' };
  }
}

export async function deleteInternship(internshipId: string) {
  try {
    // Use service role client to bypass RLS
    const supabase = createServiceRoleClient()

    const { error } = await supabase
      .from("internships")
      .delete()
      .eq("id", internshipId);

    if (error) throw error;

    return { error: null, success: true };
  } catch (error) {
    console.error('Error in deleteInternship:', error);
    return { error: error instanceof Error ? error.message : 'Failed to delete internship' };
  }
}

// CRUD Functions for Applications
export async function createApplication(applicationData: any) {
  try {
    // Use service role client to bypass RLS
    const supabase = createServiceRoleClient()

    const { data, error } = await supabase
      .from("internship_applications")
      .insert({
        ...applicationData,
        applied_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (error) throw error;

    return { error: null, success: true, application: data };
  } catch (error) {
    console.error('Error in createApplication:', error);
    return { error: error instanceof Error ? error.message : 'Failed to create application' };
  }
}

export async function updateApplication(applicationId: string, applicationData: any) {
  try {
    // Use service role client to bypass RLS
    const supabase = createServiceRoleClient()

    const { data, error } = await supabase
      .from("internship_applications")
      .update({
        ...applicationData,
        updated_at: new Date().toISOString(),
      })
      .eq("id", applicationId)
      .select()
      .single();

    if (error) throw error;

    return { error: null, success: true, application: data };
  } catch (error) {
    console.error('Error in updateApplication:', error);
    return { error: error instanceof Error ? error.message : 'Failed to update application' };
  }
}

export async function deleteApplication(applicationId: string) {
  try {
    // Use service role client to bypass RLS
    const supabase = createServiceRoleClient()

    const { error } = await supabase
      .from("internship_applications")
      .delete()
      .eq("id", applicationId);

    if (error) throw error;

    return { error: null, success: true };
  } catch (error) {
    console.error('Error in deleteApplication:', error);
    return { error: error instanceof Error ? error.message : 'Failed to delete application' };
  }
}

// Generate Report Function
export async function generateReport(reportType: string) {
  const cookieStore = cookies();
  const supabase = createServerClient(cookieStore);

  try {
    console.log('🔍 Generating report:', reportType);

    let reportData: any = {
      type: reportType,
      generated_at: new Date().toISOString(),
      summary: {},
      details: [],
    };

    switch (reportType) {
      case 'comprehensive':
        // Get all data for comprehensive report
        const [users, internships, applications, videos, donations] = await Promise.all([
          supabase.from('profiles').select('*'),
          supabase.from('internships').select('*'),
          supabase.from('internship_applications').select('*'),
          supabase.from('videos').select('*'),
          supabase.from('donations').select('*'),
        ]);

        reportData.summary = {
          totalUsers: users.data?.length || 0,
          totalInternships: internships.data?.length || 0,
          totalApplications: applications.data?.length || 0,
          totalVideos: videos.data?.length || 0,
          totalRevenue: donations.data?.reduce((sum, d) => sum + (d.amount || 0), 0) || 0,
        };

        reportData.details = {
          users: users.data || [],
          internships: internships.data || [],
          applications: applications.data || [],
          videos: videos.data || [],
          donations: donations.data || [],
        };
        break;

      case 'user_analytics':
        const { data: userData } = await supabase
          .from('profiles')
          .select('role, created_at, email_verified');

        if (userData) {
          const roleBreakdown = userData.reduce((acc: any, user) => {
            acc[user.role] = (acc[user.role] || 0) + 1;
            return acc;
          }, {});

          const monthlyGrowth = userData.reduce((acc: any, user) => {
            const month = new Date(user.created_at).toLocaleString('default', { month: 'short' });
            acc[month] = (acc[month] || 0) + 1;
            return acc;
          }, {});

          reportData.summary = {
            totalUsers: userData.length,
            roleBreakdown,
            monthlyGrowth,
            verifiedUsers: userData.filter(u => u.email_verified).length,
          };
        }
        break;

      case 'application_status':
        const { data: appData } = await supabase
          .from('internship_applications')
          .select('status, applied_at');

        if (appData) {
          const statusBreakdown = appData.reduce((acc: any, app) => {
            acc[app.status] = (acc[app.status] || 0) + 1;
            return acc;
          }, {});

          const monthlyApplications = appData.reduce((acc: any, app) => {
            const month = new Date(app.applied_at).toLocaleString('default', { month: 'short' });
            acc[month] = (acc[month] || 0) + 1;
            return acc;
          }, {});

          reportData.summary = {
            totalApplications: appData.length,
            statusBreakdown,
            monthlyApplications,
          };
        }
        break;

      case 'revenue_report':
        const { data: donationData } = await supabase
          .from('donations')
          .select('amount, created_at, status');

        if (donationData) {
          const completedDonations = donationData.filter(d => d.status === 'completed');
          const monthlyRevenue = completedDonations.reduce((acc: any, donation) => {
            const month = new Date(donation.created_at).toLocaleString('default', { month: 'short' });
            acc[month] = (acc[month] || 0) + (donation.amount || 0);
            return acc;
          }, {});

          reportData.summary = {
            totalRevenue: completedDonations.reduce((sum, d) => sum + (d.amount || 0), 0),
            totalDonations: completedDonations.length,
            monthlyRevenue,
            averageDonation: completedDonations.reduce((sum, d) => sum + (d.amount || 0), 0) / completedDonations.length || 0,
          };
        }
        break;

      default:
        return { error: 'Invalid report type' };
    }

    console.log('✅ Report generated successfully:', reportType);

    return {
      error: null,
      report: reportData,
    };
  } catch (error) {
    console.error('💥 Error generating report:', error);
    return {
      error: error instanceof Error ? error.message : 'Failed to generate report',
      report: null,
    };
  }
}

export async function getEnhancedAnalyticsData() {
  const cookieStore = cookies();
  const supabase = createServerClient(cookieStore);

  try {
    console.log('🔍 Starting enhanced analytics data fetch...')

    // Initialize analytics with defaults
    let analytics = {
      totalUsers: 0,
      newUsersThisMonth: 0,
      activeUsers: 0,
      totalVideos: 0,
      totalApplications: 0,
      activeInternships: 0,
      totalInternships: 0,
      totalRevenue: 0,
      thisMonthRevenue: 0,
      userGrowth: [] as any[],
      applicationStats: [] as any[],
      userTypes: [] as any[],
      monthlyRevenue: [] as any[],
      engagementMetrics: [] as any[],
      topContent: [] as any[],
      demographics: [] as any[],
      recentActivity: [] as any[],
    }

    // Fetch user statistics
    try {
      const { data: users, error: userError } = await supabase
        .from('profiles')
        .select('role, created_at, email_verified, full_name, email, updated_at')
        .order('created_at', { ascending: false })

      if (!userError && users) {
        analytics.totalUsers = users.length
        analytics.activeUsers = users.filter(u => u.email_verified).length

        // Calculate new users this month
        const now = new Date()
        const thisMonth = new Date(now.getFullYear(), now.getMonth(), 1)
        analytics.newUsersThisMonth = users.filter(user => 
          new Date(user.created_at) >= thisMonth
        ).length

        // User types breakdown
        const userTypeCounts = {
          students: users.filter(u => u.role === 'student').length,
          teachers: users.filter(u => u.role === 'teacher').length,
          parents: users.filter(u => u.role === 'parent').length,
          admins: users.filter(u => u.role === 'admin').length,
        }

        analytics.userTypes = [
          { type: 'Students', count: userTypeCounts.students, percentage: Math.round((userTypeCounts.students / analytics.totalUsers) * 100) },
          { type: 'Teachers', count: userTypeCounts.teachers, percentage: Math.round((userTypeCounts.teachers / analytics.totalUsers) * 100) },
          { type: 'Parents', count: userTypeCounts.parents, percentage: Math.round((userTypeCounts.parents / analytics.totalUsers) * 100) },
          { type: 'Admins', count: userTypeCounts.admins, percentage: Math.round((userTypeCounts.admins / analytics.totalUsers) * 100) },
        ]

        // Generate user growth data (last 6 months)
        analytics.userGrowth = []
        for (let i = 5; i >= 0; i--) {
          const monthStart = new Date(now.getFullYear(), now.getMonth() - i, 1)
          const monthEnd = new Date(now.getFullYear(), now.getMonth() - i + 1, 0)
          const monthName = monthStart.toLocaleString('default', { month: 'short' })
          
          const usersInMonth = users.filter(user => {
            const userDate = new Date(user.created_at)
            return userDate >= monthStart && userDate <= monthEnd
          }).length
          
          analytics.userGrowth.push({ 
            month: monthName, 
            users: usersInMonth,
            students: users.filter(user => {
              const userDate = new Date(user.created_at)
              return user.role === 'student' && userDate >= monthStart && userDate <= monthEnd
            }).length,
            teachers: users.filter(user => {
              const userDate = new Date(user.created_at)
              return user.role === 'teacher' && userDate >= monthStart && userDate <= monthEnd
            }).length,
            parents: users.filter(user => {
              const userDate = new Date(user.created_at)
              return user.role === 'parent' && userDate >= monthStart && userDate <= monthEnd
            }).length,
          })
        }

        // Recent activity
        analytics.recentActivity = users.slice(0, 10).map(user => ({
          type: 'user_registered',
          user: user,
          timestamp: user.created_at,
          description: `New ${user.role} registered`,
          name: user.full_name || user.email
        }))
      }
    } catch (err) {
      console.log('⚠️ Users analytics query exception:', err)
    }

    // Fetch internship statistics
    try {
      const { data: internships, error: internshipError } = await supabase
        .from('internships')
        .select('*')

      if (!internshipError && internships) {
        analytics.totalInternships = internships.length
        analytics.activeInternships = internships.filter(i => i.status === 'active').length
      }
    } catch (err) {
      console.log('⚠️ Internships analytics query exception:', err)
    }

    // Fetch application statistics
    try {
      const { data: applications, error: applicationError } = await supabase
        .from('internship_applications')
        .select('*')

      if (!applicationError && applications) {
        analytics.totalApplications = applications.length
        
        // Application status breakdown
        const statusCounts = {
          pending: applications.filter(a => a.status === 'pending').length,
          approved: applications.filter(a => a.status === 'approved').length,
          rejected: applications.filter(a => a.status === 'rejected').length,
          withdrawn: applications.filter(a => a.status === 'withdrawn').length,
        }
        
        analytics.applicationStats = [
          { status: 'pending', count: statusCounts.pending, color: '#F59E0B' },
          { status: 'approved', count: statusCounts.approved, color: '#10B981' },
          { status: 'rejected', count: statusCounts.rejected, color: '#EF4444' },
          { status: 'withdrawn', count: statusCounts.withdrawn, color: '#6B7280' },
        ]
      }
    } catch (err) {
      console.log('⚠️ Applications analytics query exception:', err)
    }

    // Fetch video statistics
    try {
      const { data: videos, error: videoError } = await supabase
        .from('videos')
        .select('*')

      if (!videoError && videos) {
        analytics.totalVideos = videos.length
        
        // Top content (most viewed videos)
        analytics.topContent = videos
          .sort((a, b) => (b.views || 0) - (a.views || 0))
          .slice(0, 5)
          .map(video => ({
            title: video.title,
            views: video.views || 0,
            category: video.category || 'General',
            duration: video.duration || 0,
          }))
      }
    } catch (err) {
      console.log('⚠️ Videos analytics query exception:', err)
    }

    // Fetch revenue statistics
    try {
      const { data: donations, error: donationError } = await supabase
        .from('donations')
        .select('amount, created_at, status')

      if (!donationError && donations) {
        const completedDonations = donations.filter(d => d.status === 'completed')
        analytics.totalRevenue = completedDonations.reduce((sum, d) => sum + (d.amount || 0), 0)
        
        // Calculate this month's revenue
        const now = new Date()
        const thisMonth = new Date(now.getFullYear(), now.getMonth(), 1)
        const thisMonthDonations = completedDonations.filter(d => 
          new Date(d.created_at) >= thisMonth
        )
        analytics.thisMonthRevenue = thisMonthDonations.reduce((sum, d) => sum + (d.amount || 0), 0)

        // Generate monthly revenue data (last 6 months)
        analytics.monthlyRevenue = []
        for (let i = 5; i >= 0; i--) {
          const monthStart = new Date(now.getFullYear(), now.getMonth() - i, 1)
          const monthEnd = new Date(now.getFullYear(), now.getMonth() - i + 1, 0)
          const monthName = monthStart.toLocaleString('default', { month: 'short' })
          
          const monthDonations = completedDonations.filter(d => {
            const donationDate = new Date(d.created_at)
            return donationDate >= monthStart && donationDate <= monthEnd
          })
          
          const monthRevenue = monthDonations.reduce((sum, d) => sum + (d.amount || 0), 0)
          
          analytics.monthlyRevenue.push({ 
            month: monthName, 
            revenue: monthRevenue
          })
        }
      }
    } catch (err) {
      console.log('⚠️ Revenue analytics query exception:', err)
    }

    // Generate engagement metrics (simulated based on available data)
    analytics.engagementMetrics = [
      { metric: 'Active Users', value: analytics.activeUsers, change: '+12%' },
      { metric: 'Total Applications', value: analytics.totalApplications, change: '+8%' },
      { metric: 'Video Views', value: analytics.totalVideos * 150, change: '+15%' },
      { metric: 'Conversion Rate', value: '3.2%', change: '+5%' },
    ]

    // Generate demographics (simulated based on user data)
    analytics.demographics = [
      { age: '13-17', count: Math.round(analytics.totalUsers * 0.4), percentage: 40 },
      { age: '18-25', count: Math.round(analytics.totalUsers * 0.35), percentage: 35 },
      { age: '26-35', count: Math.round(analytics.totalUsers * 0.15), percentage: 15 },
      { age: '36+', count: Math.round(analytics.totalUsers * 0.1), percentage: 10 },
    ]

    console.log('📊 Enhanced analytics:', analytics)

    return {
      error: null,
      analytics: analytics
    }
  } catch (error) {
    console.error('💥 Unexpected error in getEnhancedAnalyticsData:', error)
    return {
      error: error instanceof Error ? error.message : 'Unknown error',
      analytics: {
        totalUsers: 0,
        newUsersThisMonth: 0,
        activeUsers: 0,
        totalVideos: 0,
        totalApplications: 0,
        activeInternships: 0,
        totalInternships: 0,
        totalRevenue: 0,
        thisMonthRevenue: 0,
        userGrowth: [],
        applicationStats: [],
        userTypes: [],
        monthlyRevenue: [],
        engagementMetrics: [],
        topContent: [],
        demographics: [],
        recentActivity: [],
      }
    }
  }
} 