-- Insert sample videos for testing
INSERT INTO videos (title, description, video_url, thumbnail_url, duration, category, grade_level, status) VALUES 
(
  'Introduction to Engineering Design',
  'Learn the basics of engineering design process and how engineers solve real-world problems.',
  'https://www.youtube.com/watch?v=fxJWin13jEo',
  '/placeholder.svg?height=225&width=400',
  480,
  'Engineering',
  5,
  'active'
),
(
  'Basic Programming with Scratch',
  'Get started with programming using Scratch, a visual programming language perfect for beginners.',
  'https://www.youtube.com/watch?v=jXUZaf5D12A',
  '/placeholder.svg?height=225&width=400',
  600,
  'Programming',
  6,
  'active'
),
(
  'Simple Machines and How They Work',
  'Explore the six types of simple machines and see how they make work easier in everyday life.',
  'https://www.youtube.com/watch?v=OMOGaugKpzs',
  '/placeholder.svg?height=225&width=400',
  420,
  'Engineering',
  7,
  'active'
),
(
  'Introduction to Robotics',
  'Learn the basics of robotics and how robots work in our daily lives',
  'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
  'https://img.youtube.com/vi/dQw4w9WgXcQ/maxresdefault.jpg',
  600,
  'Robotics',
  5,
  'active'
),
(
  'Basic Programming Concepts',
  'Understanding variables, loops, and functions in programming',
  'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
  'https://img.youtube.com/vi/dQw4w9WgXcQ/maxresdefault.jpg',
  900,
  'Programming',
  6,
  'active'
),
(
  'Engineering Design Process',
  'Learn how engineers solve problems using the design process',
  'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
  'https://img.youtube.com/vi/dQw4w9WgXcQ/maxresdefault.jpg',
  720,
  'Engineering',
  7,
  'active'
),
(
  'Mathematics in Engineering',
  'Discover how math is used in real engineering projects',
  'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
  'https://img.youtube.com/vi/dQw4w9WgXcQ/maxresdefault.jpg',
  540,
  'Mathematics',
  8,
  'active'
),
(
  'Environmental Science Projects',
  'Hands-on projects to understand environmental challenges',
  'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
  'https://img.youtube.com/vi/dQw4w9WgXcQ/maxresdefault.jpg',
  660,
  'Science',
  7,
  'active'
),
(
  '3D Printing Basics',
  'Introduction to 3D printing technology and applications',
  'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
  'https://img.youtube.com/vi/dQw4w9WgXcQ/maxresdefault.jpg',
  480,
  'Design',
  6,
  'active'
);

-- Insert sample internships
INSERT INTO internships (title, description, company, location, duration, requirements, application_deadline, start_date, end_date, max_participants, current_participants, status) VALUES 
(
  'Junior Software Developer Intern',
  'Join our team to learn software development fundamentals, work on real projects, and gain hands-on experience with modern programming languages and tools.',
  'TechStart Inc.',
  'San Francisco, CA',
  '8 weeks',
  'Basic programming knowledge, enthusiasm for learning, good communication skills',
  '2024-03-15',
  '2024-06-01',
  '2024-07-26',
  15,
  3,
  'active'
),
(
  'Robotics Engineering Intern',
  'Work alongside experienced engineers to design, build, and program robots. Perfect for students interested in mechanical engineering and programming.',
  'RoboTech Solutions',
  'Austin, TX',
  '6 weeks',
  'Interest in robotics, basic understanding of mechanics, willingness to learn programming',
  '2024-03-20',
  '2024-06-15',
  '2024-07-26',
  10,
  1,
  'active'
),
(
  'Environmental Engineering Intern',
  'Help develop sustainable solutions for environmental challenges. Learn about water treatment, renewable energy, and environmental impact assessment.',
  'GreenFuture Engineering',
  'Seattle, WA',
  '10 weeks',
  'Interest in environmental science, basic math skills, passion for sustainability',
  '2024-04-01',
  '2024-06-01',
  '2024-08-09',
  12,
  2,
  'active'
),
(
  'Biomedical Engineering Intern',
  'Explore the intersection of engineering and medicine. Work on projects related to medical devices and healthcare technology.',
  'MedTech Innovations',
  'Boston, MA',
  '8 weeks',
  'Interest in biology and engineering, strong analytical skills, attention to detail',
  '2024-03-25',
  '2024-06-10',
  '2024-08-02',
  8,
  1,
  'active'
),
(
  'Junior Software Developer',
  'Learn software development with our experienced team. Work on real projects and gain hands-on experience with modern programming languages.',
  'TechCorp Solutions',
  'San Francisco, CA',
  '8 weeks',
  'Basic programming knowledge, enthusiasm for learning, grades 7-8 only',
  '2024-12-31',
  '2025-01-15',
  '2025-03-15',
  15,
  0,
  'active'
),
(
  'Robotics Engineering Intern',
  'Design and build robots while learning about mechanical and electrical engineering principles.',
  'RoboTech Industries',
  'Austin, TX',
  '6 weeks',
  'Interest in robotics, basic math skills, grades 6-8',
  '2024-12-25',
  '2025-02-01',
  '2025-03-15',
  10,
  0,
  'active'
),
(
  'Environmental Research Assistant',
  'Assist with environmental research projects and learn about sustainability and conservation.',
  'Green Earth Labs',
  'Portland, OR',
  '10 weeks',
  'Interest in environmental science, grades 7-8 preferred',
  '2025-01-15',
  '2025-02-15',
  '2025-04-30',
  8,
  0,
  'active'
),
(
  'Game Development Trainee',
  'Learn game development using modern tools and create your own games.',
  'GameStudio Pro',
  'Seattle, WA',
  '12 weeks',
  'Basic computer skills, creativity, grades 6-8',
  '2025-01-10',
  '2025-03-01',
  '2025-05-30',
  12,
  0,
  'active'
),
(
  'Biomedical Engineering Explorer',
  'Explore the intersection of biology and engineering through hands-on projects.',
  'MedTech Innovations',
  'Boston, MA',
  '8 weeks',
  'Interest in biology and engineering, grades 7-8 only',
  '2024-12-20',
  '2025-01-20',
  '2025-03-20',
  6,
  0,
  'active'
);

-- Update email templates with better content
UPDATE email_templates SET 
  html_content = '<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>Welcome to STEM Spark Academy</title>
  <style>
    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { background: linear-gradient(135deg, #ef4444, #f97316); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
    .logo { width: 60px; height: 60px; margin: 0 auto 15px; }
    .content { background: #f8fafc; padding: 30px; border-radius: 0 0 10px 10px; }
    .button { display: inline-block; background: linear-gradient(135deg, #ef4444, #f97316); color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; margin: 20px 0; }
    .footer { text-align: center; margin-top: 30px; color: #666; font-size: 14px; }
    .feature-list { background: white; padding: 20px; border-radius: 8px; margin: 20px 0; }
    .feature-item { display: flex; align-items: center; margin: 10px 0; }
    .feature-icon { margin-right: 10px; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <div class="logo">🚀</div>
      <h1>Welcome to STEM Spark Academy!</h1>
      <p>Where Young Engineers Begin Their Journey</p>
    </div>
    <div class="content">
      <h2>Hi {{fullName}}!</h2>
      <p>We''re absolutely thrilled to welcome you to our community of young innovators and future engineers! 🎉</p>
      
      <p>As a <strong>{{role}}</strong>, you now have access to an incredible world of STEM learning opportunities designed specifically for grades 5-8.</p>
      
      <div class="feature-list">
        <h3>🌟 What''s waiting for you:</h3>
        <div class="feature-item">
          <span class="feature-icon">🔬</span>
          <span>Hundreds of hands-on STEM projects and experiments</span>
        </div>
        <div class="feature-item">
          <span class="feature-icon">🤖</span>
          <span>Interactive coding challenges and robotics activities</span>
        </div>
        <div class="feature-item">
          <span class="feature-icon">🏗️</span>
          <span>Real-world engineering design challenges</span>
        </div>
        <div class="feature-item">
          <span class="feature-icon">🎥</span>
          <span>Exclusive learning videos from industry experts</span>
        </div>
        <div class="feature-item">
          <span class="feature-icon">🏢</span>
          <span>Amazing internship opportunities with top companies</span>
        </div>
        <div class="feature-item">
          <span class="feature-icon">👥</span>
          <span>Collaborative learning community with peers</span>
        </div>
        <div class="feature-item">
          <span class="feature-icon">📊</span>
          <span>Progress tracking and achievement badges</span>
        </div>
      </div>
      
      <p>Ready to start your engineering adventure? Your dashboard is waiting!</p>
      <a href="{{siteUrl}}/dashboard" class="button">🚀 Explore Your Dashboard</a>
      
      <p>Need help getting started? Our support team is here for you at <a href="mailto:support@stemspark.academy">support@stemspark.academy</a></p>
      
      <p>Welcome to the future of STEM education!</p>
      <p><strong>The STEM Spark Academy Team</strong> ⚡</p>
    </div>
    <div class="footer">
      <p>🔧 STEM Spark Academy - Empowering Young Engineers</p>
      <p>Made with ❤️ for curious minds everywhere</p>
      <p>Follow us on social media for daily STEM inspiration!</p>
    </div>
  </div>
</body>
</html>',
  text_content = 'Welcome to STEM Spark Academy, {{fullName}}! 

We''re excited to have you join our community of young engineers and innovators.

As a {{role}}, you now have access to:
- Hundreds of hands-on STEM projects
- Interactive coding challenges  
- Engineering design activities
- Exclusive learning videos
- Internship opportunities
- Collaborative learning community
- Progress tracking and achievements

Get started at: {{siteUrl}}/dashboard

Need help? Contact us at support@stemspark.academy

Welcome to the future of STEM education!
The STEM Spark Academy Team'
WHERE name = 'welcome';

-- Add internship notification template
INSERT INTO email_templates (name, subject, html_content, text_content) VALUES 
(
  'internship_notification',
  'Update on Your {{internshipTitle}} Application',
  '<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>Internship Application Update</title>
  <style>
    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { background: linear-gradient(135deg, #3b82f6, #8b5cf6); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
    .content { background: #f0f9ff; padding: 30px; border-radius: 0 0 10px 10px; }
    .status-approved { background: #dcfce7; border: 2px solid #16a34a; padding: 20px; border-radius: 8px; margin: 20px 0; }
    .status-rejected { background: #fef2f2; border: 2px solid #dc2626; padding: 20px; border-radius: 8px; margin: 20px 0; }
    .button { display: inline-block; background: linear-gradient(135deg, #3b82f6, #8b5cf6); color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; margin: 20px 0; }
    .footer { text-align: center; margin-top: 30px; color: #666; font-size: 14px; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>🏢 Internship Application Update</h1>
    </div>
    <div class="content">
      <h2>Hi {{fullName}}!</h2>
      <p>We have an update regarding your application for the <strong>{{internshipTitle}}</strong> internship.</p>
      
      {{#if approved}}
      <div class="status-approved">
        <h3>🎉 Congratulations! Your application has been APPROVED!</h3>
        <p>We''re excited to have you join our internship program. You''ll receive additional details about next steps and orientation soon.</p>
      </div>
      {{/if}}
      
      {{#if rejected}}
      <div class="status-rejected">
        <h3>Thank you for your application</h3>
        <p>While we were impressed by your application, we''ve decided to move forward with other candidates for this particular internship. Please don''t be discouraged - keep applying to other opportunities!</p>
      </div>
      {{/if}}
      
      <p>You can view all your applications and their status in your dashboard:</p>
      <a href="{{siteUrl}}/profile" class="button">View My Applications</a>
      
      <p>Keep exploring new opportunities and never stop learning!</p>
      <p><strong>The STEM Spark Academy Team</strong></p>
    </div>
    <div class="footer">
      <p>STEM Spark Academy - Empowering Young Engineers</p>
    </div>
  </div>
</body>
</html>',
  'Hi {{fullName}},

We have an update on your {{internshipTitle}} internship application.

Status: {{status}}

{{#if approved}}
Congratulations! Your application has been approved. You''ll receive more details soon.
{{/if}}

{{#if rejected}}
Thank you for applying. While we were impressed, we''ve moved forward with other candidates for this internship.
{{/if}}

View your applications: {{siteUrl}}/profile

Keep learning and applying!
The STEM Spark Academy Team'
);
