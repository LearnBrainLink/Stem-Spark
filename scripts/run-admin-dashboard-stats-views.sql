-- scripts/run-admin-dashboard-stats-views.sql
-- Run this script to create/update all admin dashboard stats views in your Supabase/Postgres database.

-- View: platform_user_stats
CREATE OR REPLACE VIEW platform_user_stats AS
SELECT 
  COUNT(*) AS total_users,
  COUNT(*) FILTER (WHERE role = 'student') AS students,
  COUNT(*) FILTER (WHERE role = 'intern') AS interns,
  COUNT(*) FILTER (WHERE role = 'admin') AS admins
FROM profiles;

-- View: platform_video_stats
CREATE OR REPLACE VIEW platform_video_stats AS
SELECT 
  COUNT(*) AS total_videos,
  COUNT(*) FILTER (WHERE status = 'active') AS active_videos
FROM videos;

-- View: platform_internship_stats
CREATE OR REPLACE VIEW platform_internship_stats AS
SELECT 
  COUNT(*) AS total_internships,
  COUNT(*) FILTER (WHERE status = 'active') AS active_internships
FROM internships;

-- View: platform_application_stats
CREATE OR REPLACE VIEW platform_application_stats AS
SELECT 
  COUNT(*) AS total_applications
FROM internship_applications;

-- View: platform_email_template_stats
CREATE OR REPLACE VIEW platform_email_template_stats AS
SELECT 
  COUNT(*) AS total_email_templates
FROM email_templates;
