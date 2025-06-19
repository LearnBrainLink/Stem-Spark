-- SQL views for admin dashboard stats

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

-- Example usage:
-- SELECT * FROM platform_user_stats;
-- SELECT * FROM platform_video_stats;
-- SELECT * FROM platform_internship_stats;
-- SELECT * FROM platform_application_stats;
-- SELECT * FROM platform_email_template_stats;
