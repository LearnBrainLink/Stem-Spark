from flask import Flask, request, jsonify, render_template_string
from flask_mail import Mail, Message
from flask_cors import CORS
import os
import logging
from datetime import datetime
import json
from typing import Dict, Any, Optional

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = Flask(__name__)
CORS(app)

# Flask Mail Configuration
app.config['MAIL_SERVER'] = os.environ.get('MAIL_SERVER', 'smtp.gmail.com')
app.config['MAIL_PORT'] = int(os.environ.get('MAIL_PORT', 587))
app.config['MAIL_USE_TLS'] = os.environ.get('MAIL_USE_TLS', 'true').lower() == 'true'
app.config['MAIL_USERNAME'] = os.environ.get('MAIL_USERNAME')
app.config['MAIL_PASSWORD'] = os.environ.get('MAIL_PASSWORD')
app.config['MAIL_DEFAULT_SENDER'] = os.environ.get('MAIL_DEFAULT_SENDER', 'noreply@novakinetixacademy.com')

mail = Mail(app)

# Email Templates
WELCOME_EMAIL_TEMPLATE = """
<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <title>Welcome to Novakinetix Academy</title>
    <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
        .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
        .button { display: inline-block; padding: 12px 24px; background: #667eea; color: white; text-decoration: none; border-radius: 5px; margin: 20px 0; }
        .footer { text-align: center; margin-top: 30px; color: #666; font-size: 14px; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>Welcome to Novakinetix Academy!</h1>
        </div>
        <div class="content">
            <h2>Hello {{ full_name }},</h2>
            <p>Welcome to Novakinetix Academy! We're excited to have you join our community of learners and educators.</p>
            
            <p>Your account has been successfully created with the role of <strong>{{ role }}</strong>.</p>
            
            <p>Here's what you can do next:</p>
            <ul>
                <li>Complete your profile</li>
                <li>Explore our learning resources</li>
                <li>Connect with other members</li>
                <li>Start your learning journey</li>
            </ul>
            
            <a href="{{ login_url }}" class="button">Login to Your Account</a>
            
            <p>If you have any questions or need assistance, please don't hesitate to contact our support team.</p>
            
            <p>Best regards,<br>The Novakinetix Academy Team</p>
        </div>
        <div class="footer">
            <p>© 2024 Novakinetix Academy. All rights reserved.</p>
        </div>
    </div>
</body>
</html>
"""

PASSWORD_RESET_TEMPLATE = """
<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <title>Password Reset - Novakinetix Academy</title>
    <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
        .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
        .button { display: inline-block; padding: 12px 24px; background: #667eea; color: white; text-decoration: none; border-radius: 5px; margin: 20px 0; }
        .footer { text-align: center; margin-top: 30px; color: #666; font-size: 14px; }
        .warning { background: #fff3cd; border: 1px solid #ffeaa7; padding: 15px; border-radius: 5px; margin: 20px 0; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>Password Reset Request</h1>
        </div>
        <div class="content">
            <h2>Hello,</h2>
            <p>We received a request to reset your password for your Novakinetix Academy account.</p>
            
            <a href="{{ reset_url }}" class="button">Reset Your Password</a>
            
            <div class="warning">
                <p><strong>Important:</strong> This link will expire in 1 hour for security reasons.</p>
                <p>If you didn't request this password reset, please ignore this email.</p>
            </div>
            
            <p>If the button above doesn't work, you can copy and paste this link into your browser:</p>
            <p>{{ reset_url }}</p>
            
            <p>Best regards,<br>The Novakinetix Academy Team</p>
        </div>
        <div class="footer">
            <p>© 2024 Novakinetix Academy. All rights reserved.</p>
        </div>
    </div>
</body>
</html>
"""

VOLUNTEER_HOURS_APPROVED_TEMPLATE = """
<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <title>Volunteer Hours Approved - Novakinetix Academy</title>
    <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: linear-gradient(135deg, #28a745 0%, #20c997 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
        .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
        .hours-summary { background: #e8f5e8; border: 1px solid #28a745; padding: 20px; border-radius: 5px; margin: 20px 0; }
        .footer { text-align: center; margin-top: 30px; color: #666; font-size: 14px; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>Volunteer Hours Approved!</h1>
        </div>
        <div class="content">
            <h2>Hello {{ intern_name }},</h2>
            <p>Great news! Your volunteer hours have been approved by our admin team.</p>
            
            <div class="hours-summary">
                <h3>Approved Hours Summary:</h3>
                <p><strong>Activity:</strong> {{ activity_type }}</p>
                <p><strong>Description:</strong> {{ description }}</p>
                <p><strong>Hours:</strong> {{ hours }}</p>
                <p><strong>Date:</strong> {{ date }}</p>
                <p><strong>Total Volunteer Hours:</strong> {{ total_hours }}</p>
            </div>
            
            <p>Thank you for your dedication and contribution to our community!</p>
            
            <p>Best regards,<br>The Novakinetix Academy Team</p>
        </div>
        <div class="footer">
            <p>© 2024 Novakinetix Academy. All rights reserved.</p>
        </div>
    </div>
</body>
</html>
"""

VOLUNTEER_HOURS_REJECTED_TEMPLATE = """
<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <title>Volunteer Hours Update - Novakinetix Academy</title>
    <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: linear-gradient(135deg, #dc3545 0%, #fd7e14 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
        .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
        .hours-summary { background: #f8d7da; border: 1px solid #dc3545; padding: 20px; border-radius: 5px; margin: 20px 0; }
        .footer { text-align: center; margin-top: 30px; color: #666; font-size: 14px; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>Volunteer Hours Update</h1>
        </div>
        <div class="content">
            <h2>Hello {{ intern_name }},</h2>
            <p>We've reviewed your volunteer hours submission and need to provide some feedback.</p>
            
            <div class="hours-summary">
                <h3>Submission Details:</h3>
                <p><strong>Activity:</strong> {{ activity_type }}</p>
                <p><strong>Description:</strong> {{ description }}</p>
                <p><strong>Hours:</strong> {{ hours }}</p>
                <p><strong>Date:</strong> {{ date }}</p>
                <p><strong>Reason for Rejection:</strong> {{ rejection_reason }}</p>
            </div>
            
            <p>Please review the feedback above and feel free to submit a new entry with the necessary corrections.</p>
            
            <p>If you have any questions, please don't hesitate to contact us.</p>
            
            <p>Best regards,<br>The Novakinetix Academy Team</p>
        </div>
        <div class="footer">
            <p>© 2024 Novakinetix Academy. All rights reserved.</p>
        </div>
    </div>
</body>
</html>
"""

TUTORING_NOTIFICATION_TEMPLATE = """
<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <title>Tutoring Session Notification - Novakinetix Academy</title>
    <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: linear-gradient(135deg, #17a2b8 0%, #6f42c1 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
        .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
        .session-details { background: #e3f2fd; border: 1px solid #17a2b8; padding: 20px; border-radius: 5px; margin: 20px 0; }
        .footer { text-align: center; margin-top: 30px; color: #666; font-size: 14px; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>Tutoring Session {{ session_type }}</h1>
        </div>
        <div class="content">
            <h2>Hello {{ recipient_name }},</h2>
            <p>{{ message }}</p>
            
            <div class="session-details">
                <h3>Session Details:</h3>
                <p><strong>Subject:</strong> {{ subject }}</p>
                <p><strong>Date:</strong> {{ session_date }}</p>
                <p><strong>Duration:</strong> {{ duration_minutes }} minutes</p>
                <p><strong>Tutor:</strong> {{ tutor_name }}</p>
                <p><strong>Student:</strong> {{ student_name }}</p>
                {% if notes %}
                <p><strong>Notes:</strong> {{ notes }}</p>
                {% endif %}
            </div>
            
            <p>Best regards,<br>The Novakinetix Academy Team</p>
        </div>
        <div class="footer">
            <p>© 2024 Novakinetix Academy. All rights reserved.</p>
        </div>
    </div>
</body>
</html>
"""

ADMIN_NOTIFICATION_TEMPLATE = """
<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <title>Admin Notification - Novakinetix Academy</title>
    <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: linear-gradient(135deg, #6c757d 0%, #495057 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
        .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
        .notification-details { background: #f8f9fa; border: 1px solid #6c757d; padding: 20px; border-radius: 5px; margin: 20px 0; }
        .footer { text-align: center; margin-top: 30px; color: #666; font-size: 14px; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>Admin Notification</h1>
        </div>
        <div class="content">
            <h2>Hello {{ admin_name }},</h2>
            <p>{{ notification_message }}</p>
            
            <div class="notification-details">
                <h3>Details:</h3>
                <p><strong>Type:</strong> {{ notification_type }}</p>
                <p><strong>Priority:</strong> {{ priority }}</p>
                {% if action_required %}
                <p><strong>Action Required:</strong> {{ action_required }}</p>
                {% endif %}
                {% if additional_info %}
                <p><strong>Additional Information:</strong> {{ additional_info }}</p>
                {% endif %}
            </div>
            
            <p>Best regards,<br>The Novakinetix Academy System</p>
        </div>
        <div class="footer">
            <p>© 2024 Novakinetix Academy. All rights reserved.</p>
        </div>
    </div>
</body>
</html>
"""

def send_email(to_email: str, subject: str, html_content: str, plain_text: str = None) -> Dict[str, Any]:
    """Send an email using Flask Mail"""
    try:
        msg = Message(
            subject=subject,
            recipients=[to_email],
            html=html_content,
            body=plain_text
        )
        mail.send(msg)
        logger.info(f"Email sent successfully to {to_email}")
        return {"success": True, "message": "Email sent successfully"}
    except Exception as e:
        logger.error(f"Failed to send email to {to_email}: {str(e)}")
        return {"success": False, "error": str(e)}

@app.route('/health', methods=['GET'])
def health_check():
    """Health check endpoint"""
    return jsonify({
        "status": "healthy",
        "service": "Flask Mail Service",
        "timestamp": datetime.now().isoformat()
    })

@app.route('/send-welcome-email', methods=['POST'])
def send_welcome_email():
    """Send welcome email to new users"""
    try:
        data = request.get_json()
        user_email = data.get('email')
        full_name = data.get('full_name')
        role = data.get('role', 'member')
        login_url = data.get('login_url', 'https://novakinetixacademy.com/login')
        
        if not user_email or not full_name:
            return jsonify({"success": False, "error": "Missing required fields"}), 400
        
        html_content = render_template_string(WELCOME_EMAIL_TEMPLATE, 
                                            full_name=full_name, 
                                            role=role, 
                                            login_url=login_url)
        
        result = send_email(
            to_email=user_email,
            subject="Welcome to Novakinetix Academy!",
            html_content=html_content
        )
        
        return jsonify(result)
    except Exception as e:
        logger.error(f"Error sending welcome email: {str(e)}")
        return jsonify({"success": False, "error": str(e)}), 500

@app.route('/send-password-reset', methods=['POST'])
def send_password_reset():
    """Send password reset email"""
    try:
        data = request.get_json()
        user_email = data.get('email')
        reset_token = data.get('reset_token')
        reset_url = data.get('reset_url')
        
        if not user_email or not reset_token or not reset_url:
            return jsonify({"success": False, "error": "Missing required fields"}), 400
        
        html_content = render_template_string(PASSWORD_RESET_TEMPLATE, 
                                            reset_url=reset_url)
        
        result = send_email(
            to_email=user_email,
            subject="Password Reset Request - Novakinetix Academy",
            html_content=html_content
        )
        
        return jsonify(result)
    except Exception as e:
        logger.error(f"Error sending password reset email: {str(e)}")
        return jsonify({"success": False, "error": str(e)}), 500

@app.route('/send-volunteer-hours-approved', methods=['POST'])
def send_volunteer_hours_approved():
    """Send volunteer hours approval notification"""
    try:
        data = request.get_json()
        intern_email = data.get('intern_email')
        intern_name = data.get('intern_name')
        activity_type = data.get('activity_type')
        description = data.get('description')
        hours = data.get('hours')
        date = data.get('date')
        total_hours = data.get('total_hours')
        
        if not all([intern_email, intern_name, activity_type, description, hours, date]):
            return jsonify({"success": False, "error": "Missing required fields"}), 400
        
        html_content = render_template_string(VOLUNTEER_HOURS_APPROVED_TEMPLATE,
                                            intern_name=intern_name,
                                            activity_type=activity_type,
                                            description=description,
                                            hours=hours,
                                            date=date,
                                            total_hours=total_hours)
        
        result = send_email(
            to_email=intern_email,
            subject="Volunteer Hours Approved - Novakinetix Academy",
            html_content=html_content
        )
        
        return jsonify(result)
    except Exception as e:
        logger.error(f"Error sending volunteer hours approved email: {str(e)}")
        return jsonify({"success": False, "error": str(e)}), 500

@app.route('/send-volunteer-hours-rejected', methods=['POST'])
def send_volunteer_hours_rejected():
    """Send volunteer hours rejection notification"""
    try:
        data = request.get_json()
        intern_email = data.get('intern_email')
        intern_name = data.get('intern_name')
        activity_type = data.get('activity_type')
        description = data.get('description')
        hours = data.get('hours')
        date = data.get('date')
        rejection_reason = data.get('rejection_reason')
        
        if not all([intern_email, intern_name, activity_type, description, hours, date, rejection_reason]):
            return jsonify({"success": False, "error": "Missing required fields"}), 400
        
        html_content = render_template_string(VOLUNTEER_HOURS_REJECTED_TEMPLATE,
                                            intern_name=intern_name,
                                            activity_type=activity_type,
                                            description=description,
                                            hours=hours,
                                            date=date,
                                            rejection_reason=rejection_reason)
        
        result = send_email(
            to_email=intern_email,
            subject="Volunteer Hours Update - Novakinetix Academy",
            html_content=html_content
        )
        
        return jsonify(result)
    except Exception as e:
        logger.error(f"Error sending volunteer hours rejected email: {str(e)}")
        return jsonify({"success": False, "error": str(e)}), 500

@app.route('/send-tutoring-notification', methods=['POST'])
def send_tutoring_notification():
    """Send tutoring session notification"""
    try:
        data = request.get_json()
        recipient_email = data.get('recipient_email')
        recipient_name = data.get('recipient_name')
        session_type = data.get('session_type', 'Scheduled')  # Scheduled, Cancelled, Completed
        message = data.get('message')
        subject = data.get('subject')
        session_date = data.get('session_date')
        duration_minutes = data.get('duration_minutes')
        tutor_name = data.get('tutor_name')
        student_name = data.get('student_name')
        notes = data.get('notes')
        
        if not all([recipient_email, recipient_name, message, subject, session_date, duration_minutes, tutor_name, student_name]):
            return jsonify({"success": False, "error": "Missing required fields"}), 400
        
        html_content = render_template_string(TUTORING_NOTIFICATION_TEMPLATE,
                                            recipient_name=recipient_name,
                                            session_type=session_type,
                                            message=message,
                                            subject=subject,
                                            session_date=session_date,
                                            duration_minutes=duration_minutes,
                                            tutor_name=tutor_name,
                                            student_name=student_name,
                                            notes=notes)
        
        result = send_email(
            to_email=recipient_email,
            subject=f"Tutoring Session {session_type} - Novakinetix Academy",
            html_content=html_content
        )
        
        return jsonify(result)
    except Exception as e:
        logger.error(f"Error sending tutoring notification email: {str(e)}")
        return jsonify({"success": False, "error": str(e)}), 500

@app.route('/send-admin-notification', methods=['POST'])
def send_admin_notification():
    """Send admin notification"""
    try:
        data = request.get_json()
        admin_email = data.get('admin_email')
        admin_name = data.get('admin_name')
        notification_message = data.get('notification_message')
        notification_type = data.get('notification_type')
        priority = data.get('priority', 'normal')
        action_required = data.get('action_required')
        additional_info = data.get('additional_info')
        
        if not all([admin_email, admin_name, notification_message, notification_type]):
            return jsonify({"success": False, "error": "Missing required fields"}), 400
        
        html_content = render_template_string(ADMIN_NOTIFICATION_TEMPLATE,
                                            admin_name=admin_name,
                                            notification_message=notification_message,
                                            notification_type=notification_type,
                                            priority=priority,
                                            action_required=action_required,
                                            additional_info=additional_info)
        
        result = send_email(
            to_email=admin_email,
            subject=f"Admin Notification: {notification_type} - Novakinetix Academy",
            html_content=html_content
        )
        
        return jsonify(result)
    except Exception as e:
        logger.error(f"Error sending admin notification email: {str(e)}")
        return jsonify({"success": False, "error": str(e)}), 500

@app.route('/send-custom-email', methods=['POST'])
def send_custom_email():
    """Send custom email with provided template and data"""
    try:
        data = request.get_json()
        to_email = data.get('to_email')
        subject = data.get('subject')
        template = data.get('template')
        template_data = data.get('template_data', {})
        
        if not all([to_email, subject, template]):
            return jsonify({"success": False, "error": "Missing required fields"}), 400
        
        html_content = render_template_string(template, **template_data)
        
        result = send_email(
            to_email=to_email,
            subject=subject,
            html_content=html_content
        )
        
        return jsonify(result)
    except Exception as e:
        logger.error(f"Error sending custom email: {str(e)}")
        return jsonify({"success": False, "error": str(e)}), 500

if __name__ == '__main__':
    port = int(os.environ.get('PORT', 5000))
    app.run(host='0.0.0.0', port=port, debug=os.environ.get('FLASK_ENV') == 'development') 