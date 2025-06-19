import { supabase } from '../lib/supabase';

async function setupAdminDashboardViews() {
  try {
    console.log('Setting up admin dashboard views...');

    // Create platform_user_stats view
    await supabase.rpc('create_platform_user_stats_view', {
      sql: `
        CREATE OR REPLACE VIEW platform_user_stats AS
        SELECT 
          COUNT(*) AS total_users,
          COUNT(*) FILTER (WHERE role = 'student') AS students,
          COUNT(*) FILTER (WHERE role = 'intern') AS interns,
          COUNT(*) FILTER (WHERE role = 'admin') AS admins,
          COUNT(*) FILTER (WHERE created_at >= NOW() - INTERVAL '24 hours') AS new_users_24h,
          COUNT(*) FILTER (WHERE created_at >= NOW() - INTERVAL '7 days') AS new_users_7d,
          COUNT(*) FILTER (WHERE last_sign_in_at >= NOW() - INTERVAL '24 hours') AS active_users_24h
        FROM profiles;
      `
    });

    // Create platform_video_stats view
    await supabase.rpc('create_platform_video_stats_view', {
      sql: `
        CREATE OR REPLACE VIEW platform_video_stats AS
        SELECT 
          COUNT(*) AS total_videos,
          COUNT(*) FILTER (WHERE status = 'active') AS active_videos,
          COUNT(*) FILTER (WHERE created_at >= NOW() - INTERVAL '7 days') AS new_videos_7d,
          COALESCE(SUM(views), 0) AS total_views,
          COALESCE(SUM(duration), 0) AS total_duration_seconds
        FROM videos;
      `
    });

    // Create platform_internship_stats view
    await supabase.rpc('create_platform_internship_stats_view', {
      sql: `
        CREATE OR REPLACE VIEW platform_internship_stats AS
        SELECT 
          COUNT(*) AS total_internships,
          COUNT(*) FILTER (WHERE status = 'active') AS active_internships,
          COUNT(*) FILTER (WHERE start_date > NOW()) AS upcoming_internships,
          COUNT(*) FILTER (WHERE end_date < NOW()) AS completed_internships,
          COUNT(*) FILTER (WHERE created_at >= NOW() - INTERVAL '7 days') AS new_internships_7d
        FROM internships;
      `
    });

    // Create platform_application_stats view
    await supabase.rpc('create_platform_application_stats_view', {
      sql: `
        CREATE OR REPLACE VIEW platform_application_stats AS
        SELECT 
          COUNT(*) AS total_applications,
          COUNT(*) FILTER (WHERE status = 'pending') AS pending_applications,
          COUNT(*) FILTER (WHERE status = 'approved') AS approved_applications,
          COUNT(*) FILTER (WHERE status = 'rejected') AS rejected_applications,
          COUNT(*) FILTER (WHERE created_at >= NOW() - INTERVAL '24 hours') AS new_applications_24h,
          COUNT(*) FILTER (WHERE created_at >= NOW() - INTERVAL '7 days') AS new_applications_7d
        FROM internship_applications;
      `
    });

    // Create platform_email_template_stats view
    await supabase.rpc('create_platform_email_template_stats_view', {
      sql: `
        CREATE OR REPLACE VIEW platform_email_template_stats AS
        SELECT 
          COUNT(*) AS total_email_templates,
          COUNT(*) FILTER (WHERE status = 'active') AS active_templates,
          COUNT(*) FILTER (WHERE created_at >= NOW() - INTERVAL '7 days') AS new_templates_7d,
          COUNT(*) FILTER (WHERE updated_at >= NOW() - INTERVAL '7 days') AS updated_templates_7d
        FROM email_templates;
      `
    });

    // Create platform_activity_stats view
    await supabase.rpc('create_platform_activity_stats_view', {
      sql: `
        CREATE OR REPLACE VIEW platform_activity_stats AS
        SELECT 
          (SELECT COUNT(*) FROM user_activities WHERE created_at >= NOW() - INTERVAL '24 hours') AS activities_24h,
          (SELECT COUNT(*) FROM user_activities WHERE created_at >= NOW() - INTERVAL '7 days') AS activities_7d,
          (SELECT COUNT(DISTINCT user_id) FROM user_activities WHERE created_at >= NOW() - INTERVAL '24 hours') AS active_users_24h,
          (SELECT COUNT(DISTINCT user_id) FROM user_activities WHERE created_at >= NOW() - INTERVAL '7 days') AS active_users_7d;
      `
    });

    console.log('Successfully set up all admin dashboard views!');
  } catch (error) {
    console.error('Error setting up admin dashboard views:', error);
    throw error;
  }
}

// Run the setup
setupAdminDashboardViews()
  .then(() => {
    console.log('Setup completed successfully!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('Setup failed:', error);
    process.exit(1);
  }); 