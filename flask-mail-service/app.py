import os
import json
import base64
from flask import Flask, request, jsonify, render_template_string
from flask_mail import Mail, Message
from flask_cors import CORS
import logging
from datetime import datetime
import re
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from email.mime.image import MIMEImage

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
app.config['MAIL_DEFAULT_SENDER'] = os.environ.get('MAIL_DEFAULT_SENDER')

mail = Mail(app)

# Email templates
WELCOME_EMAIL_TEMPLATE = """
{% extends "base_email.html" %}

{% block content %}
<h2>Welcome to NOVAKINETIX ACADEMY! 🎉</h2>

<p>Dear {{ user_name }},</p>

<p>Welcome to NOVAKINETIX ACADEMY! We're thrilled to have you join our community of innovators and learners.</p>

<div class="highlight">
    <h3>What's Next?</h3>
    <ul>
        <li>Complete your profile to get personalized recommendations</li>
        <li>Explore our course catalog and learning paths</li>
        <li>Join study groups and connect with peers</li>
        <li>Start your first project or assignment</li>
    </ul>
</div>

<p>Your account has been successfully created with the email: <strong>{{ user_email }}</strong></p>

<div class="info-box">
    <h4>Getting Started Tips:</h4>
    <ul>
        <li>Browse our course catalog to find your interests</li>
        <li>Join our community forums to connect with other students</li>
        <li>Check out our resource library for additional materials</li>
        <li>Set up your learning goals and track your progress</li>
    </ul>
</div>

<a href="{{ login_url }}" class="button">Access Your Dashboard</a>

<p>If you have any questions or need assistance, don't hesitate to reach out to our support team.</p>

<p>Best regards,<br>
<strong>The NOVAKINETIX ACADEMY Team</strong></p>
{% endblock %}
"""

PASSWORD_RESET_TEMPLATE = """
{% extends "base_email.html" %}

{% block content %}
<h2>Password Reset Request 🔐</h2>

<p>Dear {{ user_name }},</p>

<p>We received a request to reset your password for your NOVAKINETIX ACADEMY account.</p>

<div class="highlight">
    <p><strong>If you didn't request this password reset, please ignore this email.</strong></p>
</div>

<p>To reset your password, click the button below:</p>

<a href="{{ reset_url }}" class="button">Reset Password</a>

<p>This link will expire in 1 hour for security reasons.</p>

<div class="info-box">
    <h4>Security Tips:</h4>
    <ul>
        <li>Never share your password with anyone</li>
        <li>Use a strong, unique password</li>
        <li>Enable two-factor authentication if available</li>
        <li>Log out from shared devices</li>
    </ul>
</div>

<p>If the button doesn't work, you can copy and paste this link into your browser:</p>
<p style="word-break: break-all; color: #6b7280;">{{ reset_url }}</p>

<p>Best regards,<br>
<strong>The NOVAKINETIX ACADEMY Team</strong></p>
{% endblock %}
"""

VOLUNTEER_HOURS_APPROVED_TEMPLATE = """
{% extends "base_email.html" %}

{% block content %}
<h2>Volunteer Hours Approved! ✅</h2>

<p>Dear {{ user_name }},</p>

<p>Great news! Your volunteer hours have been approved by our admin team.</p>

<div class="highlight">
    <h3>Approved Hours Summary:</h3>
    <ul>
        <li><strong>Date:</strong> {{ hours_date }}</li>
        <li><strong>Hours:</strong> {{ hours_count }} hours</li>
        <li><strong>Activity:</strong> {{ activity_description }}</li>
        <li><strong>Total Hours:</strong> {{ total_hours }} hours</li>
    </ul>
</div>

<p>Your dedication to volunteering is making a real difference in our community. Keep up the excellent work!</p>

<div class="info-box">
    <h4>What's Next?</h4>
    <ul>
        <li>Continue logging your volunteer activities</li>
        <li>Explore new volunteer opportunities</li>
        <li>Share your experiences with the community</li>
        <li>Track your progress toward your goals</li>
    </ul>
</div>

<a href="{{ dashboard_url }}" class="button">View Your Dashboard</a>

<p>Thank you for your continued commitment to making a positive impact!</p>

<p>Best regards,<br>
<strong>The NOVAKINETIX ACADEMY Team</strong></p>
{% endblock %}
"""

VOLUNTEER_HOURS_REJECTED_TEMPLATE = """
{% extends "base_email.html" %}

{% block content %}
<h2>Volunteer Hours Update 📝</h2>

<p>Dear {{ user_name }},</p>

<p>We've reviewed your volunteer hours submission and need to provide some feedback.</p>

<div class="highlight">
    <h3>Submission Details:</h3>
    <ul>
        <li><strong>Date:</strong> {{ hours_date }}</li>
        <li><strong>Hours:</strong> {{ hours_count }} hours</li>
        <li><strong>Activity:</strong> {{ activity_description }}</li>
    </ul>
</div>

<div class="info-box">
    <h4>Reason for Rejection:</h4>
    <p>{{ rejection_reason }}</p>
    
    <h4>How to Resubmit:</h4>
    <ul>
        <li>Review the feedback provided</li>
        <li>Make necessary corrections</li>
        <li>Add any missing information</li>
        <li>Resubmit through your dashboard</li>
    </ul>
</div>

<a href="{{ dashboard_url }}" class="button">Update Submission</a>

<p>If you have any questions about the feedback, please don't hesitate to contact our support team.</p>

<p>Best regards,<br>
<strong>The NOVAKINETIX ACADEMY Team</strong></p>
{% endblock %}
"""

TUTORING_SESSION_CONFIRMATION_TEMPLATE = """
{% extends "base_email.html" %}

{% block content %}
<h2>Tutoring Session Confirmed! 📚</h2>

<p>Dear {{ user_name }},</p>

<p>Your tutoring session has been confirmed and is ready to go!</p>

<div class="highlight">
    <h3>Session Details:</h3>
    <ul>
        <li><strong>Subject:</strong> {{ subject }}</li>
        <li><strong>Date:</strong> {{ session_date }}</li>
        <li><strong>Time:</strong> {{ session_time }}</li>
        <li><strong>Duration:</strong> {{ duration }} minutes</li>
        <li><strong>Tutor:</strong> {{ tutor_name }}</li>
    </ul>
</div>

<div class="info-box">
    <h4>Preparation Tips:</h4>
    <ul>
        <li>Review the material you'd like to cover</li>
        <li>Prepare any specific questions</li>
        <li>Have your study materials ready</li>
        <li>Test your video/audio connection</li>
    </ul>
</div>

<a href="{{ session_url }}" class="button">Join Session</a>

<p>If you need to reschedule or have any questions, please contact us as soon as possible.</p>

<p>Best regards,<br>
<strong>The NOVAKINETIX ACADEMY Team</strong></p>
{% endblock %}
"""

def attach_logo_to_message(msg):
    """Attach the NOVAKINETIX ACADEMY logo to the email message"""
    try:
        logo_path = os.path.join(os.path.dirname(__file__), 'assets', 'novakinetix-logo.png')
        if os.path.exists(logo_path):
            with open(logo_path, 'rb') as f:
                logo_data = f.read()
            
            logo_attachment = MIMEImage(logo_data)
            logo_attachment.add_header('Content-ID', '<novakinetix-logo>')
            logo_attachment.add_header('Content-Disposition', 'inline', filename='novakinetix-logo.png')
            msg.attach(logo_attachment)
            logger.info("Logo attached successfully")
        else:
            logger.warning("Logo file not found at: %s", logo_path)
    except Exception as e:
        logger.error("Error attaching logo: %s", str(e))

class EmailService:
    def __init__(self, mail):
        self.mail = mail
        self.logger = logging.getLogger(__name__)
        self.logo_base64 = self._load_logo()
        self.email_queue = []
    
    def _load_logo(self):
        """Load and encode the logo for email templates"""
        try:
            logo_path = os.path.join(os.path.dirname(__file__), 'assets', 'novakinetix-logo.png')
            if os.path.exists(logo_path):
                with open(logo_path, 'rb') as logo_file:
                    return base64.b64encode(logo_file.read()).decode('utf-8')
            else:
                self.logger.warning("Logo file not found, using placeholder")
                return ""
        except Exception as e:
            self.logger.error(f"Error loading logo: {str(e)}")
            return ""
    
    def _load_template(self, template_name):
        """Load email template from file"""
        try:
            template_path = os.path.join(os.path.dirname(__file__), 'templates', f'{template_name}.html')
            if os.path.exists(template_path):
                with open(template_path, 'r', encoding='utf-8') as template_file:
                    return template_file.read()
            else:
                self.logger.error(f"Template {template_name} not found")
                return None
        except Exception as e:
            self.logger.error(f"Error loading template {template_name}: {str(e)}")
            return None
    
    def _render_template(self, template_name, data):
        """Render email template with data"""
        try:
            template_content = self._load_template(template_name)
            if template_content:
                # Add common data
                data['logo_base64'] = self.logo_base64
                data['site_url'] = os.environ.get('NEXT_PUBLIC_SITE_URL', 'https://novakinetixacademy.com')
                
                # Render template
                return render_template_string(template_content, **data)
            else:
                return None
        except Exception as e:
            self.logger.error(f"Error rendering template {template_name}: {str(e)}")
            return None
    
    def _validate_email(self, email):
        """Validate email address format"""
        pattern = r'^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$'
        return re.match(pattern, email) is not None
    
    def _sanitize_input(self, text):
        """Sanitize user input to prevent XSS"""
        if not text:
            return ""
        # Basic HTML sanitization
        text = text.replace('<script', '&lt;script')
        text = text.replace('javascript:', '')
        return text
    
    def send_email(self, to, subject, body, template=None, template_data=None):
        """Send email with template support"""
        try:
            # Validate inputs
            if not to or not subject:
                return {"success": False, "error": "Recipient and subject are required"}
            
            # Validate email addresses
            recipients = to if isinstance(to, list) else [to]
            for email in recipients:
                if not self._validate_email(email):
                    return {"success": False, "error": f"Invalid email address: {email}"}
            
            # Sanitize inputs
            subject = self._sanitize_input(subject)
            
            # Prepare email content
            if template and template_data:
                html_content = self._render_template(template, template_data)
                if html_content:
                    # Create plain text version
                    text_content = self._html_to_text(html_content)
                else:
                    return {"success": False, "error": f"Failed to render template: {template}"}
            else:
                html_content = body
                text_content = self._html_to_text(body) if body else ""
            
            # Create message
            msg = Message(
                subject=subject,
                recipients=recipients
            )
            
            # Set content
            if html_content:
                msg.html = html_content
            if text_content:
                msg.body = text_content
            
            # Send email
            self.mail.send(msg)
            
            # Log success
            self.logger.info(f"Email sent successfully to {recipients}")
            
            # Add to queue for tracking
            self.email_queue.append({
                'to': recipients,
                'subject': subject,
                'template': template,
                'timestamp': datetime.now().isoformat(),
                'status': 'sent'
            })
            
            return {"success": True, "message": "Email sent successfully"}
            
        except Exception as e:
            self.logger.error(f"Error sending email: {str(e)}")
            return {"success": False, "error": str(e)}
    
    def _html_to_text(self, html_content):
        """Convert HTML to plain text"""
        try:
            # Basic HTML to text conversion
            text = html_content
            # Remove HTML tags
            text = re.sub(r'<[^>]+>', '', text)
            # Decode HTML entities
            text = text.replace('&nbsp;', ' ')
            text = text.replace('&amp;', '&')
            text = text.replace('&lt;', '<')
            text = text.replace('&gt;', '>')
            text = text.replace('&quot;', '"')
            # Clean up whitespace
            text = re.sub(r'\s+', ' ', text).strip()
            return text
        except Exception as e:
            self.logger.error(f"Error converting HTML to text: {str(e)}")
            return ""
    
    def send_welcome_email(self, user_data):
        """Send welcome email using template"""
        template_data = {
            'user_name': user_data.get('full_name', 'there'),
            'user_role': user_data.get('role', 'student'),
            'welcome_date': datetime.now().strftime('%B %d, %Y')
        }
        return self.send_email(
            to=user_data['email'],
            subject="Welcome to Novakinetix Academy! 🎉",
            body="",
            template="welcome_email",
            template_data=template_data
        )
    
    def send_password_reset_email(self, email, reset_token):
        """Send password reset email using template"""
        template_data = {
            'user_name': email.split('@')[0],  # Use email prefix as name
            'reset_url': f"{os.environ.get('NEXT_PUBLIC_SITE_URL', 'https://novakinetixacademy.com')}/reset-password?token={reset_token}",
            'expiry_hours': 24
        }
        return self.send_email(
            to=email,
            subject="🔐 Password Reset Request - Novakinetix Academy",
            body="",
            template="password_reset",
            template_data=template_data
        )
    
    def send_volunteer_hours_approved(self, intern_data, hours_data):
        """Send volunteer hours approval email using template"""
        template_data = {
            'intern_name': intern_data.get('full_name', 'there'),
            'hours': hours_data.get('hours', 0),
            'activity_type': hours_data.get('activity_type', 'Volunteer Work'),
            'description': hours_data.get('description', ''),
            'activity_date': hours_data.get('date', ''),
            'approved_by': hours_data.get('approved_by', 'Administrator'),
            'approval_date': datetime.now().strftime('%B %d, %Y')
        }
        return self.send_email(
            to=intern_data['email'],
            subject="🎉 Your Volunteer Hours Have Been Approved!",
            body="",
            template="volunteer_hours_approved",
            template_data=template_data
        )
    
    def send_volunteer_hours_rejected(self, intern_data, hours_data, rejection_reason):
        """Send volunteer hours rejection email using template"""
        template_data = {
            'intern_name': intern_data.get('full_name', 'there'),
            'hours': hours_data.get('hours', 0),
            'activity_type': hours_data.get('activity_type', 'Volunteer Work'),
            'description': hours_data.get('description', ''),
            'activity_date': hours_data.get('date', ''),
            'reviewed_by': hours_data.get('reviewed_by', 'Administrator'),
            'submission_date': hours_data.get('submitted_at', ''),
            'rejection_reason': rejection_reason
        }
        return self.send_email(
            to=intern_data['email'],
            subject="📝 Volunteer Hours Update",
            body="",
            template="volunteer_hours_rejected",
            template_data=template_data
        )
    
    def get_email_queue(self):
        """Get email queue for monitoring"""
        return self.email_queue
    
    def clear_email_queue(self):
        """Clear email queue"""
        self.email_queue.clear()
        return {"success": True, "message": "Email queue cleared"}

# Initialize email service
email_service = EmailService(mail)

@app.route('/health', methods=['GET'])
def health_check():
    """Health check endpoint"""
    return jsonify({
        'status': 'healthy',
        'service': 'NOVAKINETIX ACADEMY Email Service',
        'timestamp': datetime.utcnow().isoformat(),
        'version': '1.0.0'
    })

@app.route('/api/send-email', methods=['POST'])
def send_email():
    """Send email endpoint"""
    try:
        data = request.get_json()
        
        if not data:
            return jsonify({'error': 'No data provided'}), 400
        
        required_fields = ['to', 'subject', 'template', 'template_data']
        for field in required_fields:
            if field not in data:
                return jsonify({'error': f'Missing required field: {field}'}), 400
        
        # Get template
        template_map = {
            'welcome': WELCOME_EMAIL_TEMPLATE,
            'password_reset': PASSWORD_RESET_TEMPLATE,
            'volunteer_hours_approved': VOLUNTEER_HOURS_APPROVED_TEMPLATE,
            'volunteer_hours_rejected': VOLUNTEER_HOURS_REJECTED_TEMPLATE,
            'tutoring_session_confirmation': TUTORING_SESSION_CONFIRMATION_TEMPLATE
        }
        
        template = template_map.get(data['template'])
        if not template:
            return jsonify({'error': f'Invalid template: {data["template"]}'}), 400
        
        # Render email content
        html_content = render_template_string(template, **data['template_data'])
        
        # Create message
        msg = Message(
            subject=data['subject'],
            recipients=[data['to']],
            html=html_content
        )
        
        # Attach logo
        attach_logo_to_message(msg)
        
        # Send email
        mail.send(msg)
        
        logger.info(f"Email sent successfully to {data['to']}")
        return jsonify({'message': 'Email sent successfully'}), 200
        
    except Exception as e:
        logger.error(f"Error sending email: {str(e)}")
        return jsonify({'error': 'Failed to send email'}), 500

@app.route('/api/send-welcome-email', methods=['POST'])
def send_welcome_email():
    """Send welcome email"""
    try:
        data = request.get_json()
        
        if not data or 'email' not in data or 'name' not in data:
            return jsonify({'error': 'Missing required fields'}), 400
        
        template_data = {
            'user_name': data['name'],
            'user_email': data['email'],
            'login_url': data.get('login_url', 'https://novakinetix.academy/login'),
            'site_url': data.get('site_url', 'https://novakinetix.academy')
        }
        
        email_data = {
            'to': data['email'],
            'subject': 'Welcome to NOVAKINETIX ACADEMY!',
            'template': 'welcome',
            'template_data': template_data
        }
        
        return send_email_internal(email_data)
        
    except Exception as e:
        logger.error(f"Error sending welcome email: {str(e)}")
        return jsonify({'error': 'Failed to send welcome email'}), 500

@app.route('/api/send-password-reset', methods=['POST'])
def send_password_reset():
    """Send password reset email"""
    try:
        data = request.get_json()
        
        if not data or 'email' not in data or 'reset_url' not in data:
            return jsonify({'error': 'Missing required fields'}), 400
        
        template_data = {
            'user_name': data.get('name', 'User'),
            'reset_url': data['reset_url'],
            'site_url': data.get('site_url', 'https://novakinetix.academy')
        }
        
        email_data = {
            'to': data['email'],
            'subject': 'Reset Your NOVAKINETIX ACADEMY Password',
            'template': 'password_reset',
            'template_data': template_data
        }
        
        return send_email_internal(email_data)
        
    except Exception as e:
        logger.error(f"Error sending password reset email: {str(e)}")
        return jsonify({'error': 'Failed to send password reset email'}), 500

def send_email_internal(email_data):
    """Internal function to send email"""
    try:
        # Get template
        template_map = {
            'welcome': WELCOME_EMAIL_TEMPLATE,
            'password_reset': PASSWORD_RESET_TEMPLATE,
            'volunteer_hours_approved': VOLUNTEER_HOURS_APPROVED_TEMPLATE,
            'volunteer_hours_rejected': VOLUNTEER_HOURS_REJECTED_TEMPLATE,
            'tutoring_session_confirmation': TUTORING_SESSION_CONFIRMATION_TEMPLATE
        }
        
        template = template_map.get(email_data['template'])
        if not template:
            return jsonify({'error': f'Invalid template: {email_data["template"]}'}), 400
        
        # Render email content
        html_content = render_template_string(template, **email_data['template_data'])
        
        # Create message
        msg = Message(
            subject=email_data['subject'],
            recipients=[email_data['to']],
            html=html_content
        )
        
        # Attach logo
        attach_logo_to_message(msg)
        
        # Send email
        mail.send(msg)
        
        logger.info(f"Email sent successfully to {email_data['to']}")
        return jsonify({'message': 'Email sent successfully'}), 200
        
    except Exception as e:
        logger.error(f"Error sending email: {str(e)}")
        return jsonify({'error': 'Failed to send email'}), 500

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000, debug=False) 