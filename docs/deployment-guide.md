# NOVAKINETIX ACADEMY - Production Deployment Guide

## Overview

This guide covers the complete deployment process for the NOVAKINETIX ACADEMY platform, including the Next.js application, Flask Mail microservice, and Supabase database configuration.

## Prerequisites

- Node.js 18+ and npm/yarn
- Python 3.9+ and pip
- Docker and Docker Compose
- Supabase CLI
- Vercel CLI (for frontend deployment)
- Access to production environment variables

## Architecture

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Next.js App   │    │  Flask Mail     │    │   Supabase      │
│   (Vercel)      │◄──►│  Microservice   │    │   Database      │
│                 │    │  (Docker)       │    │                 │
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

## 1. Environment Configuration

### 1.1 Production Environment Variables

Create `.env.production` file:

```bash
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=https://your-project-ref.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# Flask Mail Service
FLASK_MAIL_SERVICE_URL=https://your-flask-mail-service.com
MAIL_PASSWORD=your-mail-password
MAIL_DEFAULT_SENDER=noreply@novakinetix.academy
MAIL_SERVER=smtp.gmail.com
MAIL_PORT=587
MAIL_USE_TLS=true
MAIL_USERNAME=your-email@gmail.com

# Application Configuration
NEXT_PUBLIC_SITE_URL=https://novakinetix.academy
NODE_ENV=production
NEXT_PUBLIC_APP_ENV=production

# Security
JWT_SECRET=your-jwt-secret
ENCRYPTION_KEY=your-encryption-key

# Monitoring
SENTRY_DSN=your-sentry-dsn
LOG_LEVEL=info
```

### 1.2 Vercel Configuration

Create `vercel.json`:

```json
{
  "version": 2,
  "builds": [
    {
      "src": "package.json",
      "use": "@vercel/next"
    }
  ],
  "env": {
    "NEXT_PUBLIC_SUPABASE_URL": "@supabase_url",
    "NEXT_PUBLIC_SUPABASE_ANON_KEY": "@supabase_anon_key",
    "SUPABASE_SERVICE_ROLE_KEY": "@supabase_service_role_key",
    "FLASK_MAIL_SERVICE_URL": "@flask_mail_service_url",
    "MAIL_PASSWORD": "@mail_password",
    "MAIL_DEFAULT_SENDER": "@mail_default_sender",
    "MAIL_SERVER": "@mail_server",
    "MAIL_PORT": "@mail_port",
    "MAIL_USE_TLS": "@mail_use_tls",
    "MAIL_USERNAME": "@mail_username",
    "NEXT_PUBLIC_SITE_URL": "@site_url",
    "JWT_SECRET": "@jwt_secret",
    "ENCRYPTION_KEY": "@encryption_key",
    "SENTRY_DSN": "@sentry_dsn"
  },
  "headers": [
    {
      "source": "/(.*)",
      "headers": [
        {
          "key": "X-Content-Type-Options",
          "value": "nosniff"
        },
        {
          "key": "X-Frame-Options",
          "value": "DENY"
        },
        {
          "key": "X-XSS-Protection",
          "value": "1; mode=block"
        },
        {
          "key": "Referrer-Policy",
          "value": "strict-origin-when-cross-origin"
        }
      ]
    }
  ]
}
```

## 2. Database Deployment

### 2.1 Supabase Production Setup

1. **Create Production Project**:
   ```bash
   supabase projects create novakinetix-academy-prod
   ```

2. **Apply Migrations**:
   ```bash
   supabase db push --project-ref your-project-ref
   ```

3. **Enable Row Level Security**:
   ```sql
   -- Enable RLS on all tables
   ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
   ALTER TABLE volunteer_hours ENABLE ROW LEVEL SECURITY;
   ALTER TABLE tutoring_sessions ENABLE ROW LEVEL SECURITY;
   ALTER TABLE chat_channels ENABLE ROW LEVEL SECURITY;
   ALTER TABLE chat_messages ENABLE ROW LEVEL SECURITY;
   ALTER TABLE channel_members ENABLE ROW LEVEL SECURITY;
   ALTER TABLE admin_actions_log ENABLE ROW LEVEL SECURITY;
   ALTER TABLE analytics_events ENABLE ROW LEVEL SECURITY;
   ALTER TABLE applications ENABLE ROW LEVEL SECURITY;
   ALTER TABLE videos ENABLE ROW LEVEL SECURITY;
   ```

4. **Create Production Policies**:
   ```sql
   -- Profiles policies
   CREATE POLICY "Users can view own profile" ON profiles
     FOR SELECT USING (auth.uid() = id);
   
   CREATE POLICY "Users can update own profile" ON profiles
     FOR UPDATE USING (auth.uid() = id);
   
   -- Volunteer hours policies
   CREATE POLICY "Users can view own volunteer hours" ON volunteer_hours
     FOR SELECT USING (auth.uid() = user_id);
   
   CREATE POLICY "Users can insert own volunteer hours" ON volunteer_hours
     FOR INSERT WITH CHECK (auth.uid() = user_id);
   
   CREATE POLICY "Admins can view all volunteer hours" ON volunteer_hours
     FOR SELECT USING (
       EXISTS (
         SELECT 1 FROM profiles 
         WHERE id = auth.uid() AND role = 'admin'
       )
     );
   ```

### 2.2 Database Backup Configuration

1. **Enable Point-in-Time Recovery**:
   ```sql
   ALTER DATABASE postgres SET wal_level = replica;
   ALTER DATABASE postgres SET max_wal_senders = 3;
   ALTER DATABASE postgres SET wal_keep_segments = 64;
   ```

2. **Create Backup Schedule**:
   ```bash
   # Daily backups at 2 AM UTC
   0 2 * * * /usr/local/bin/supabase db dump --project-ref your-project-ref > /backups/daily_$(date +\%Y\%m\%d).sql
   
   # Weekly backups on Sunday at 3 AM UTC
   0 3 * * 0 /usr/local/bin/supabase db dump --project-ref your-project-ref > /backups/weekly_$(date +\%Y\%m\%d).sql
   ```

## 3. Flask Mail Microservice Deployment

### 3.1 Docker Production Configuration

Create `docker-compose.prod.yml`:

```yaml
version: '3.8'

services:
  flask-mail:
    build:
      context: ./flask-mail-service
      dockerfile: Dockerfile.prod
    container_name: novakinetix-flask-mail
    restart: unless-stopped
    ports:
      - "5000:5000"
    environment:
      - FLASK_ENV=production
      - MAIL_PASSWORD=${MAIL_PASSWORD}
      - MAIL_DEFAULT_SENDER=${MAIL_DEFAULT_SENDER}
      - MAIL_SERVER=${MAIL_SERVER}
      - MAIL_PORT=${MAIL_PORT}
      - MAIL_USE_TLS=${MAIL_USE_TLS}
      - MAIL_USERNAME=${MAIL_USERNAME}
      - LOG_LEVEL=info
    volumes:
      - ./logs:/app/logs
    networks:
      - novakinetix-network
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:5000/health"]
      interval: 30s
      timeout: 10s
      retries: 3

  nginx:
    image: nginx:alpine
    container_name: novakinetix-nginx
    restart: unless-stopped
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - ./nginx.conf:/etc/nginx/nginx.conf
      - ./ssl:/etc/nginx/ssl
    depends_on:
      - flask-mail
    networks:
      - novakinetix-network

networks:
  novakinetix-network:
    driver: bridge

volumes:
  logs:
```

### 3.2 Production Dockerfile

Create `flask-mail-service/Dockerfile.prod`:

```dockerfile
FROM python:3.9-slim

WORKDIR /app

# Install system dependencies
RUN apt-get update && apt-get install -y \
    gcc \
    curl \
    && rm -rf /var/lib/apt/lists/*

# Copy requirements and install Python dependencies
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy application code
COPY . .

# Create non-root user
RUN useradd -m -u 1000 appuser && chown -R appuser:appuser /app
USER appuser

# Expose port
EXPOSE 5000

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
    CMD curl -f http://localhost:5000/health || exit 1

# Run application
CMD ["gunicorn", "--bind", "0.0.0.0:5000", "--workers", "4", "--timeout", "120", "app:app"]
```

### 3.3 Nginx Configuration

Create `nginx.conf`:

```nginx
events {
    worker_connections 1024;
}

http {
    upstream flask_mail {
        server flask-mail:5000;
    }

    # Rate limiting
    limit_req_zone $binary_remote_addr zone=api:10m rate=10r/s;
    limit_req_zone $binary_remote_addr zone=mail:10m rate=5r/s;

    server {
        listen 80;
        server_name your-domain.com;
        return 301 https://$server_name$request_uri;
    }

    server {
        listen 443 ssl http2;
        server_name your-domain.com;

        ssl_certificate /etc/nginx/ssl/cert.pem;
        ssl_certificate_key /etc/nginx/ssl/key.pem;
        ssl_protocols TLSv1.2 TLSv1.3;
        ssl_ciphers ECDHE-RSA-AES256-GCM-SHA512:DHE-RSA-AES256-GCM-SHA512:ECDHE-RSA-AES256-GCM-SHA384:DHE-RSA-AES256-GCM-SHA384;
        ssl_prefer_server_ciphers off;

        # Security headers
        add_header X-Frame-Options DENY;
        add_header X-Content-Type-Options nosniff;
        add_header X-XSS-Protection "1; mode=block";
        add_header Referrer-Policy "strict-origin-when-cross-origin";

        # API endpoints
        location /api/ {
            limit_req zone=api burst=20 nodelay;
            proxy_pass http://flask_mail;
            proxy_set_header Host $host;
            proxy_set_header X-Real-IP $remote_addr;
            proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
            proxy_set_header X-Forwarded-Proto $scheme;
        }

        # Health check
        location /health {
            proxy_pass http://flask_mail;
            access_log off;
        }

        # Default location
        location / {
            return 404;
        }
    }
}
```

## 4. Next.js Application Deployment

### 4.1 Vercel Deployment

1. **Install Vercel CLI**:
   ```bash
   npm i -g vercel
   ```

2. **Deploy to Production**:
   ```bash
   vercel --prod
   ```

3. **Set Environment Variables**:
   ```bash
   vercel env add NEXT_PUBLIC_SUPABASE_URL
   vercel env add NEXT_PUBLIC_SUPABASE_ANON_KEY
   vercel env add SUPABASE_SERVICE_ROLE_KEY
   vercel env add FLASK_MAIL_SERVICE_URL
   vercel env add MAIL_PASSWORD
   vercel env add MAIL_DEFAULT_SENDER
   vercel env add MAIL_SERVER
   vercel env add MAIL_PORT
   vercel env add MAIL_USE_TLS
   vercel env add MAIL_USERNAME
   vercel env add NEXT_PUBLIC_SITE_URL
   vercel env add JWT_SECRET
   vercel env add ENCRYPTION_KEY
   vercel env add SENTRY_DSN
   ```

### 4.2 Build Optimization

Update `next.config.js`:

```javascript
/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    appDir: true,
  },
  images: {
    domains: ['your-domain.com', 'localhost'],
  },
  env: {
    CUSTOM_KEY: process.env.CUSTOM_KEY,
  },
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'X-Frame-Options',
            value: 'DENY',
          },
          {
            key: 'X-XSS-Protection',
            value: '1; mode=block',
          },
          {
            key: 'Referrer-Policy',
            value: 'strict-origin-when-cross-origin',
          },
        ],
      },
    ]
  },
  async rewrites() {
    return [
      {
        source: '/api/mail/:path*',
        destination: `${process.env.FLASK_MAIL_SERVICE_URL}/api/:path*`,
      },
    ]
  },
}

module.exports = nextConfig
```

## 5. Monitoring and Logging

### 5.1 Application Monitoring

1. **Sentry Integration**:
   ```javascript
   // pages/_app.js or app/layout.tsx
   import * as Sentry from "@sentry/nextjs";

   Sentry.init({
     dsn: process.env.SENTRY_DSN,
     environment: process.env.NODE_ENV,
     tracesSampleRate: 1.0,
   });
   ```

2. **Health Check Endpoints**:
   ```typescript
   // app/api/health/route.ts
   export async function GET() {
     return Response.json({
       status: 'healthy',
       timestamp: new Date().toISOString(),
       version: process.env.npm_package_version,
     })
   }
   ```

### 5.2 Logging Configuration

Create `lib/logger.ts`:

```typescript
import winston from 'winston'

const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.errors({ stack: true }),
    winston.format.json()
  ),
  defaultMeta: { service: 'novakinetix-academy' },
  transports: [
    new winston.transports.File({ filename: 'logs/error.log', level: 'error' }),
    new winston.transports.File({ filename: 'logs/combined.log' }),
  ],
})

if (process.env.NODE_ENV !== 'production') {
  logger.add(new winston.transports.Console({
    format: winston.format.simple()
  }))
}

export default logger
```

## 6. Backup and Disaster Recovery

### 6.1 Database Backup Strategy

1. **Automated Backups**:
   ```bash
   #!/bin/bash
   # backup.sh
   
   DATE=$(date +%Y%m%d_%H%M%S)
   BACKUP_DIR="/backups"
   
   # Create backup
   supabase db dump --project-ref your-project-ref > "$BACKUP_DIR/backup_$DATE.sql"
   
   # Compress backup
   gzip "$BACKUP_DIR/backup_$DATE.sql"
   
   # Keep only last 30 days of backups
   find "$BACKUP_DIR" -name "backup_*.sql.gz" -mtime +30 -delete
   
   # Upload to cloud storage (optional)
   aws s3 cp "$BACKUP_DIR/backup_$DATE.sql.gz" s3://your-backup-bucket/
   ```

2. **Backup Verification**:
   ```bash
   #!/bin/bash
   # verify-backup.sh
   
   BACKUP_FILE="$1"
   
   # Test restore to temporary database
   supabase db reset --project-ref test-project-ref
   gunzip -c "$BACKUP_FILE" | supabase db push --project-ref test-project-ref
   
   # Run verification queries
   # ... verification logic
   ```

### 6.2 Disaster Recovery Plan

1. **Recovery Procedures**:
   ```markdown
   ## Database Recovery
   
   1. Stop all services
   2. Restore from latest backup
   3. Verify data integrity
   4. Restart services
   5. Monitor for issues
   
   ## Application Recovery
   
   1. Check Vercel deployment status
   2. Verify environment variables
   3. Test critical functionality
   4. Monitor error rates
   
   ## Microservice Recovery
   
   1. Restart Docker containers
   2. Verify health checks
   3. Test email functionality
   4. Monitor logs
   ```

## 7. Security Hardening

### 7.1 SSL/TLS Configuration

1. **Obtain SSL Certificate**:
   ```bash
   # Using Let's Encrypt
   certbot certonly --standalone -d your-domain.com
   ```

2. **Auto-renewal**:
   ```bash
   # Add to crontab
   0 12 * * * /usr/bin/certbot renew --quiet
   ```

### 7.2 Firewall Configuration

```bash
# UFW configuration
ufw default deny incoming
ufw default allow outgoing
ufw allow ssh
ufw allow 80/tcp
ufw allow 443/tcp
ufw enable
```

## 8. Performance Optimization

### 8.1 CDN Configuration

1. **Vercel Edge Functions**:
   ```typescript
   // api/cache/[key].ts
   export default function handler(req, res) {
     res.setHeader('Cache-Control', 's-maxage=3600, stale-while-revalidate')
     // ... cache logic
   }
   ```

2. **Image Optimization**:
   ```typescript
   // next.config.js
   module.exports = {
     images: {
       formats: ['image/webp', 'image/avif'],
       deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
       imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
     },
   }
   ```

## 9. Deployment Checklist

- [ ] Environment variables configured
- [ ] Database migrations applied
- [ ] SSL certificates installed
- [ ] Monitoring configured
- [ ] Backup procedures tested
- [ ] Security headers implemented
- [ ] Performance optimized
- [ ] Documentation updated
- [ ] Team trained on procedures

## 10. Maintenance Procedures

### 10.1 Regular Maintenance

1. **Weekly**:
   - Review error logs
   - Check backup status
   - Monitor performance metrics
   - Update dependencies

2. **Monthly**:
   - Security audit
   - Performance review
   - Backup restoration test
   - SSL certificate renewal

3. **Quarterly**:
   - Full disaster recovery test
   - Security penetration testing
   - Performance optimization review
   - Documentation updates

### 10.2 Update Procedures

1. **Application Updates**:
   ```bash
   # Staging deployment
   git checkout staging
   git pull origin main
   vercel --prod
   
   # Production deployment
   git checkout main
   git pull origin main
   vercel --prod
   ```

2. **Database Updates**:
   ```bash
   # Apply migrations
   supabase db push --project-ref your-project-ref
   
   # Verify changes
   supabase db diff --project-ref your-project-ref
   ```

This deployment guide ensures a robust, secure, and scalable production environment for the NOVAKINETIX ACADEMY platform. 