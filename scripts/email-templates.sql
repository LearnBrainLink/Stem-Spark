-- Insert email templates
INSERT INTO email_templates (name, subject, html_content) VALUES
('welcome', 'Welcome to STEM Spark Academy!', '
<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <title>Welcome to STEM Spark Academy</title>
    <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: linear-gradient(135deg, #dc2626, #ea580c); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
        .content { background: #f9fafb; padding: 30px; border-radius: 0 0 10px 10px; }
        .button { display: inline-block; background: linear-gradient(135deg, #dc2626, #ea580c); color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; margin: 20px 0; }
        .footer { text-align: center; margin-top: 30px; color: #666; font-size: 14px; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>🚀 Welcome to STEM Spark Academy!</h1>
        </div>
        <div class="content">
            <h2>Hello {{fullName}}!</h2>
            <p>Welcome to STEM Spark Academy! We''re excited to have you join our community of young engineers and innovators.</p>
            
            <p>As a {{role}}, you now have access to:</p>
            <ul>
                <li>🎥 Educational STEM videos tailored to your level</li>
                <li>🏢 Real-world internship opportunities</li>
                <li>👥 A supportive community of peers and mentors</li>
                <li>📚 Resources to help you succeed in STEM</li>
            </ul>
            
            <p>Ready to start your STEM journey?</p>
            <a href="{{siteUrl}}/dashboard" class="button">Get Started</a>
            
            <p>If you have any questions, feel free to reach out to our support team.</p>
            
            <p>Best regards,<br>The STEM Spark Academy Team</p>
        </div>
        <div class="footer">
            <p>© 2024 STEM Spark Academy. All rights reserved.</p>
        </div>
    </div>
</body>
</html>
'),

('verification', 'Please verify your email address', '
<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <title>Verify Your Email</title>
    <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: linear-gradient(135deg, #2563eb, #7c3aed); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
        .content { background: #f9fafb; padding: 30px; border-radius: 0 0 10px 10px; }
        .button { display: inline-block; background: linear-gradient(135deg, #2563eb, #7c3aed); color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; margin: 20px 0; }
        .footer { text-align: center; margin-top: 30px; color: #666; font-size: 14px; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>📧 Verify Your Email</h1>
        </div>
        <div class="content">
            <h2>Hello {{fullName}}!</h2>
            <p>Thank you for signing up for STEM Spark Academy! To complete your registration, please verify your email address.</p>
            
            <p>Click the button below to verify your email:</p>
            <a href="{{verificationLink}}" class="button">Verify Email Address</a>
            
            <p>If you didn''t create an account with us, you can safely ignore this email.</p>
            
            <p>Best regards,<br>The STEM Spark Academy Team</p>
        </div>
        <div class="footer">
            <p>© 2024 STEM Spark Academy. All rights reserved.</p>
        </div>
    </div>
</body>
</html>
'),

('password_reset', 'Reset your password', '
<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <title>Reset Your Password</title>
    <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: linear-gradient(135deg, #dc2626, #ea580c); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
        .content { background: #f9fafb; padding: 30px; border-radius: 0 0 10px 10px; }
        .button { display: inline-block; background: linear-gradient(135deg, #dc2626, #ea580c); color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; margin: 20px 0; }
        .footer { text-align: center; margin-top: 30px; color: #666; font-size: 14px; }
        .warning { background: #fef3c7; border: 1px solid #f59e0b; padding: 15px; border-radius: 6px; margin: 20px 0; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>🔒 Password Reset Request</h1>
        </div>
        <div class="content">
            <h2>Password Reset</h2>
            <p>We received a request to reset your password for your STEM Spark Academy account.</p>
            
            <p>Click the button below to reset your password:</p>
            <a href="{{resetLink}}" class="button">Reset Password</a>
            
            <div class="warning">
                <strong>Security Notice:</strong> This link will expire in 24 hours for your security. If you didn''t request this password reset, please ignore this email.
            </div>
            
            <p>If you''re having trouble clicking the button, copy and paste the following link into your browser:</p>
            <p style="word-break: break-all; color: #666;">{{resetLink}}</p>
            
            <p>Best regards,<br>The STEM Spark Academy Team</p>
        </div>
        <div class="footer">
            <p>© 2024 STEM Spark Academy. All rights reserved.</p>
        </div>
    </div>
</body>
</html>
'),

('internship_notification', 'Internship Application Update', '
<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <title>Internship Application Update</title>
    <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: linear-gradient(135deg, #059669, #0d9488); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
        .content { background: #f9fafb; padding: 30px; border-radius: 0 0 10px 10px; }
        .button { display: inline-block; background: linear-gradient(135deg, #059669, #0d9488); color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; margin: 20px 0; }
        .footer { text-align: center; margin-top: 30px; color: #666; font-size: 14px; }
        .status-approved { background: #d1fae5; border: 1px solid #10b981; padding: 15px; border-radius: 6px; margin: 20px 0; }
        .status-rejected { background: #fee2e2; border: 1px solid #ef4444; padding: 15px; border-radius: 6px; margin: 20px 0; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>🏢 Internship Application Update</h1>
        </div>
        <div class="content">
            <h2>Hello {{fullName}}!</h2>
            <p>We have an update regarding your internship application for <strong>{{internshipTitle}}</strong>.</p>
            
            <div class="status-{{status}}">
                <strong>Application Status: {{status}}</strong>
            </div>
            
            <p>You can view more details about your application in your dashboard:</p>
            <a href="{{siteUrl}}/profile" class="button">View My Applications</a>
            
            <p>Thank you for your interest in our internship programs!</p>
            
            <p>Best regards,<br>The STEM Spark Academy Team</p>
        </div>
        <div class="footer">
            <p>© 2024 STEM Spark Academy. All rights reserved.</p>
        </div>
    </div>
</body>
</html>
');
