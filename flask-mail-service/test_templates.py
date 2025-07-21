#!/usr/bin/env python3
"""
Test script for email templates
This script tests the email template rendering without actually sending emails
"""

import os
import sys
import base64
from datetime import datetime

# Add the current directory to the path so we can import from app
sys.path.insert(0, os.path.dirname(__file__))

from flask import Flask
from flask_mail import Mail
from app import EmailService

def test_template_rendering():
    """Test rendering of all email templates"""
    
    # Create a minimal Flask app for testing
    app = Flask(__name__)
    app.config['MAIL_SERVER'] = 'smtp.gmail.com'
    app.config['MAIL_PORT'] = 587
    app.config['MAIL_USE_TLS'] = True
    app.config['MAIL_USERNAME'] = 'test@example.com'
    app.config['MAIL_PASSWORD'] = 'test_password'
    app.config['MAIL_DEFAULT_SENDER'] = 'test@example.com'
    
    mail = Mail(app)
    
    # Initialize email service
    email_service = EmailService(mail)
    
    # Test within application context
    with app.app_context():
        print("🧪 Testing Email Template Rendering")
        print("=" * 50)
        
        # Test 1: Welcome Email Template
        print("\n1. Testing Welcome Email Template")
        welcome_data = {
            'user_name': 'John Doe',
            'user_role': 'intern',
            'welcome_date': datetime.now().strftime('%B %d, %Y')
        }
        
        html_content = email_service._render_template('welcome_email', welcome_data)
        if html_content:
            print("✅ Welcome email template rendered successfully")
            print(f"   Length: {len(html_content)} characters")
            print(f"   Contains logo: {'novakinetix-logo.png' in html_content or 'data:image' in html_content}")
        else:
            print("❌ Welcome email template failed to render")
        
        # Test 2: Password Reset Template
        print("\n2. Testing Password Reset Template")
        reset_data = {
            'user_name': 'johndoe',
            'reset_url': 'https://novakinetixacademy.com/reset-password?token=abc123',
            'expiry_hours': 24
        }
        
        html_content = email_service._render_template('password_reset', reset_data)
        if html_content:
            print("✅ Password reset template rendered successfully")
            print(f"   Length: {len(html_content)} characters")
            print(f"   Contains reset URL: {'abc123' in html_content}")
        else:
            print("❌ Password reset template failed to render")
        
        # Test 3: Volunteer Hours Approved Template
        print("\n3. Testing Volunteer Hours Approved Template")
        approval_data = {
            'intern_name': 'Jane Smith',
            'hours': 5.5,
            'activity_type': 'tutoring',
            'description': 'Math tutoring session with student',
            'activity_date': '2024-01-15',
            'approved_by': 'Admin User',
            'approval_date': datetime.now().strftime('%B %d, %Y')
        }
        
        html_content = email_service._render_template('volunteer_hours_approved', approval_data)
        if html_content:
            print("✅ Volunteer hours approved template rendered successfully")
            print(f"   Length: {len(html_content)} characters")
            print(f"   Contains hours: {'5.5' in html_content}")
        else:
            print("❌ Volunteer hours approved template failed to render")
        
        # Test 4: Volunteer Hours Rejected Template
        print("\n4. Testing Volunteer Hours Rejected Template")
        rejection_data = {
            'intern_name': 'Jane Smith',
            'hours': 3.0,
            'activity_type': 'mentoring',
            'description': 'Student mentoring session',
            'activity_date': '2024-01-10',
            'reviewed_by': 'Admin User',
            'submission_date': '2024-01-12',
            'rejection_reason': 'Insufficient documentation provided. Please include detailed notes about the mentoring session.'
        }
        
        html_content = email_service._render_template('volunteer_hours_rejected', rejection_data)
        if html_content:
            print("✅ Volunteer hours rejected template rendered successfully")
            print(f"   Length: {len(html_content)} characters")
            print(f"   Contains rejection reason: {'Insufficient documentation' in html_content}")
        else:
            print("❌ Volunteer hours rejected template failed to render")
        
        # Test 5: Logo Loading
        print("\n5. Testing Logo Loading")
        if email_service.logo_base64:
            print("✅ Logo loaded successfully")
            print(f"   Logo size: {len(email_service.logo_base64)} characters")
        else:
            print("❌ Logo failed to load")
        
        # Test 6: Email Validation
        print("\n6. Testing Email Validation")
        valid_emails = ['test@example.com', 'user.name@domain.co.uk', 'user+tag@example.org']
        invalid_emails = ['invalid-email', '@example.com', 'user@', 'user@.com']
        
        for email in valid_emails:
            if email_service._validate_email(email):
                print(f"✅ Valid email: {email}")
            else:
                print(f"❌ Invalid email (should be valid): {email}")
        
        for email in invalid_emails:
            if not email_service._validate_email(email):
                print(f"✅ Invalid email correctly rejected: {email}")
            else:
                print(f"❌ Invalid email (should be invalid): {email}")
        
        # Test 7: Input Sanitization
        print("\n7. Testing Input Sanitization")
        test_inputs = [
            "Normal text",
            "<script>alert('xss')</script>",
            "javascript:alert('xss')",
            "Text with <strong>HTML</strong> tags"
        ]
        
        for test_input in test_inputs:
            sanitized = email_service._sanitize_input(test_input)
            print(f"   Input: {test_input}")
            print(f"   Sanitized: {sanitized}")
            print()
        
        print("=" * 50)
        print("🎉 Template testing completed!")

if __name__ == '__main__':
    test_template_rendering() 