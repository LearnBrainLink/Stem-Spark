-- SQL views for admin dashboard stats

-- View: platform_user_stats
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

-- View: platform_video_stats
CREATE OR REPLACE VIEW platform_video_stats AS
SELECT 
  COUNT(*) AS total_videos,
  COUNT(*) FILTER (WHERE status = 'active') AS active_videos,
  COUNT(*) FILTER (WHERE created_at >= NOW() - INTERVAL '7 days') AS new_videos_7d,
  COALESCE(SUM(views), 0) AS total_views,
  COALESCE(SUM(duration), 0) AS total_duration_seconds
FROM videos;

-- View: platform_internship_stats
CREATE OR REPLACE VIEW platform_internship_stats AS
SELECT 
  COUNT(*) AS total_internships,
  COUNT(*) FILTER (WHERE status = 'active') AS active_internships,
  COUNT(*) FILTER (WHERE start_date > NOW()) AS upcoming_internships,
  COUNT(*) FILTER (WHERE end_date < NOW()) AS completed_internships,
  COUNT(*) FILTER (WHERE created_at >= NOW() - INTERVAL '7 days') AS new_internships_7d
FROM internships;

-- View: platform_application_stats
CREATE OR REPLACE VIEW platform_application_stats AS
SELECT 
  COUNT(*) AS total_applications,
  COUNT(*) FILTER (WHERE status = 'pending') AS pending_applications,
  COUNT(*) FILTER (WHERE status = 'approved') AS approved_applications,
  COUNT(*) FILTER (WHERE status = 'rejected') AS rejected_applications,
  COUNT(*) FILTER (WHERE created_at >= NOW() - INTERVAL '24 hours') AS new_applications_24h,
  COUNT(*) FILTER (WHERE created_at >= NOW() - INTERVAL '7 days') AS new_applications_7d
FROM internship_applications;

-- View: platform_email_template_stats
CREATE OR REPLACE VIEW platform_email_template_stats AS
SELECT 
  COUNT(*) AS total_email_templates,
  COUNT(*) FILTER (WHERE status = 'active') AS active_templates,
  COUNT(*) FILTER (WHERE created_at >= NOW() - INTERVAL '7 days') AS new_templates_7d,
  COUNT(*) FILTER (WHERE updated_at >= NOW() - INTERVAL '7 days') AS updated_templates_7d
FROM email_templates;

-- View: platform_activity_stats
CREATE OR REPLACE VIEW platform_activity_stats AS
SELECT 
  (SELECT COUNT(*) FROM user_activities WHERE created_at >= NOW() - INTERVAL '24 hours') AS activities_24h,
  (SELECT COUNT(*) FROM user_activities WHERE created_at >= NOW() - INTERVAL '7 days') AS activities_7d,
  (SELECT COUNT(DISTINCT user_id) FROM user_activities WHERE created_at >= NOW() - INTERVAL '24 hours') AS active_users_24h,
  (SELECT COUNT(DISTINCT user_id) FROM user_activities WHERE created_at >= NOW() - INTERVAL '7 days') AS active_users_7d;

-- View: platform_daily_stats
CREATE OR REPLACE VIEW platform_daily_stats AS
SELECT
  date_trunc('day', created_at)::date AS day,
  COUNT(*) FILTER (WHERE role = 'student') AS new_students,
  COUNT(*) FILTER (WHERE role = 'intern') AS new_interns
FROM profiles
GROUP BY day
ORDER BY day;

-- Example usage:
-- SELECT * FROM platform_user_stats;
-- SELECT * FROM platform_video_stats;
-- SELECT * FROM platform_internship_stats;
-- SELECT * FROM platform_application_stats;
-- SELECT * FROM platform_email_template_stats;
-- SELECT * FROM platform_activity_stats;
