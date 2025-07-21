# Flask Mail Microservice Deployment Guide

This guide covers deploying the Flask Mail microservice to various platforms for the Stem Spark project.

## Overview

The Flask Mail microservice handles all email functionality for the Stem Spark application, including:
- Volunteer hours approval notifications
- Welcome emails
- Password reset emails
- System notifications
- Weekly digests

## Environment Variables

The Flask Mail service requires the following environment variables:

```bash
# SMTP Configuration
MAIL_SERVER=smtp.gmail.com
MAIL_PORT=587
MAIL_USE_TLS=true
MAIL_USERNAME=your-email@gmail.com
MAIL_PASSWORD=your-app-password
MAIL_DEFAULT_SENDER=your-email@gmail.com

# Optional: Service Configuration
FLASK_ENV=production
FLASK_DEBUG=false
PORT=5000
```

## Deployment Options

### 1. Vercel Deployment

#### Prerequisites
- Vercel account
- GitHub repository with Flask Mail service

#### Steps

1. **Create vercel.json configuration:**
```json
{
  "version": 2,
  "builds": [
    {
      "src": "app.py",
      "use": "@vercel/python"
    }
  ],
  "routes": [
    {
      "src": "/(.*)",
      "dest": "app.py"
    }
  ],
  "env": {
    "MAIL_SERVER": "@mail_server",
    "MAIL_PORT": "@mail_port",
    "MAIL_USE_TLS": "@mail_use_tls",
    "MAIL_USERNAME": "@mail_username",
    "MAIL_PASSWORD": "@mail_password",
    "MAIL_DEFAULT_SENDER": "@mail_default_sender"
  }
}
```

2. **Deploy to Vercel:**
```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel --prod
```

3. **Set environment variables in Vercel dashboard:**
   - Go to your project settings
   - Add the required environment variables
   - Redeploy the application

### 2. Railway Deployment

#### Steps

1. **Connect your repository to Railway**

2. **Set environment variables in Railway dashboard**

3. **Deploy automatically on push**

### 3. Render Deployment

#### Steps

1. **Create render.yaml:**
```yaml
services:
  - type: web
    name: flask-mail-service
    env: python
    buildCommand: pip install -r requirements.txt
    startCommand: gunicorn app:app
    envVars:
      - key: MAIL_SERVER
        value: smtp.gmail.com
      - key: MAIL_PORT
        value: 587
      - key: MAIL_USE_TLS
        value: true
      - key: MAIL_USERNAME
        sync: false
      - key: MAIL_PASSWORD
        sync: false
      - key: MAIL_DEFAULT_SENDER
        sync: false
```

2. **Deploy to Render**

### 4. Docker Deployment

#### Local Docker

1. **Build the image:**
```bash
cd flask-mail-service
docker build -t stem-spark-mail .
```

2. **Run the container:**
```bash
docker run -d \
  -p 5000:5000 \
  -e MAIL_SERVER=smtp.gmail.com \
  -e MAIL_PORT=587 \
  -e MAIL_USE_TLS=true \
  -e MAIL_USERNAME=your-email@gmail.com \
  -e MAIL_PASSWORD=your-app-password \
  -e MAIL_DEFAULT_SENDER=your-email@gmail.com \
  --name stem-spark-mail \
  stem-spark-mail
```

#### Docker Compose

1. **Create docker-compose.yml:**
```yaml
version: '3.8'
services:
  flask-mail:
    build: ./flask-mail-service
    ports:
      - "5000:5000"
    environment:
      - MAIL_SERVER=${MAIL_SERVER}
      - MAIL_PORT=${MAIL_PORT}
      - MAIL_USE_TLS=${MAIL_USE_TLS}
      - MAIL_USERNAME=${MAIL_USERNAME}
      - MAIL_PASSWORD=${MAIL_PASSWORD}
      - MAIL_DEFAULT_SENDER=${MAIL_DEFAULT_SENDER}
    restart: unless-stopped
```

2. **Run with Docker Compose:**
```bash
docker-compose up -d
```

### 5. Heroku Deployment

#### Steps

1. **Create Procfile:**
```
web: gunicorn app:app
```

2. **Deploy to Heroku:**
```bash
# Install Heroku CLI
# Create Heroku app
heroku create stem-spark-mail

# Set environment variables
heroku config:set MAIL_SERVER=smtp.gmail.com
heroku config:set MAIL_PORT=587
heroku config:set MAIL_USE_TLS=true
heroku config:set MAIL_USERNAME=your-email@gmail.com
heroku config:set MAIL_PASSWORD=your-app-password
heroku config:set MAIL_DEFAULT_SENDER=your-email@gmail.com

# Deploy
git push heroku main
```

## Gmail SMTP Setup

For Gmail SMTP, you need to:

1. **Enable 2-Factor Authentication** on your Gmail account

2. **Generate an App Password:**
   - Go to Google Account settings
   - Security > 2-Step Verification > App passwords
   - Generate a new app password for "Mail"

3. **Use the app password** instead of your regular password

## Testing the Deployment

1. **Test the service health:**
```bash
curl https://your-service-url.vercel.app/health
```

2. **Test email sending:**
```bash
curl -X POST https://your-service-url.vercel.app/send-email \
  -H "Content-Type: application/json" \
  -d '{
    "to": "test@example.com",
    "subject": "Test Email",
    "body": "This is a test email from Stem Spark"
  }'
```

## Integration with Main Application

Update your main application's environment variables:

```bash
# Add to your main app's environment variables
FLASK_MAIL_SERVICE_URL=https://your-flask-mail-service.vercel.app
```

## Monitoring and Logs

### Vercel
- View logs in Vercel dashboard
- Set up monitoring with Vercel Analytics

### Railway
- View logs in Railway dashboard
- Set up monitoring with Railway's built-in tools

### Render
- View logs in Render dashboard
- Set up monitoring with Render's built-in tools

## Security Considerations

1. **Environment Variables:**
   - Never commit sensitive data to version control
   - Use platform-specific secret management
   - Rotate passwords regularly

2. **CORS Configuration:**
   - Only allow requests from your main application domain
   - Use proper authentication if needed

3. **Rate Limiting:**
   - Implement rate limiting to prevent abuse
   - Monitor email sending patterns

## Troubleshooting

### Common Issues

1. **SMTP Authentication Failed:**
   - Check if 2FA is enabled
   - Verify app password is correct
   - Ensure MAIL_USERNAME is correct

2. **Service Not Responding:**
   - Check if the service is deployed correctly
   - Verify environment variables are set
   - Check logs for errors

3. **Emails Not Sending:**
   - Verify SMTP settings
   - Check if the service URL is correct
   - Ensure proper CORS configuration

### Debug Mode

For local development, you can enable debug mode:

```bash
export FLASK_DEBUG=true
export FLASK_ENV=development
```

## Performance Optimization

1. **Connection Pooling:**
   - Use connection pooling for SMTP connections
   - Implement proper connection cleanup

2. **Async Processing:**
   - Consider using background tasks for email sending
   - Implement queue system for high-volume scenarios

3. **Caching:**
   - Cache email templates
   - Implement rate limiting

## Backup and Recovery

1. **Database Backup:**
   - If using a database for email logs, set up regular backups

2. **Configuration Backup:**
   - Document all environment variables
   - Keep configuration files in version control

3. **Disaster Recovery:**
   - Have a backup email service ready
   - Document recovery procedures

## Support

For issues with the Flask Mail service:

1. Check the logs for error messages
2. Verify environment variable configuration
3. Test SMTP settings independently
4. Contact the development team for assistance

## Updates and Maintenance

1. **Regular Updates:**
   - Keep dependencies updated
   - Monitor for security vulnerabilities
   - Update Python version when needed

2. **Monitoring:**
   - Set up health checks
   - Monitor email delivery rates
   - Track service performance

3. **Backup Strategy:**
   - Regular backups of configuration
   - Document deployment procedures
   - Test recovery procedures regularly 