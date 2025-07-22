# Deployment Guide

This guide provides step-by-step instructions for deploying the STEM Spark Academy platform to production environments.

## Prerequisites

### Required Accounts
- **Vercel** - For Next.js application hosting
- **Supabase** - For database and authentication
- **GitHub** - For code repository and CI/CD
- **Email Service** - For transactional emails (Gmail, SendGrid, etc.)

### Required Tools
- **Node.js** (v18 or higher)
- **npm** or **pnpm**
- **Git**
- **Docker** (for Flask Mail service)

## Environment Setup

### 1. Supabase Project Setup

#### Create Supabase Project
1. Go to [supabase.com](https://supabase.com)
2. Click "New Project"
3. Choose organization
4. Enter project details:
   - Name: `stem-spark-academy`
   - Database Password: Generate strong password
   - Region: Choose closest to users
5. Click "Create new project"

#### Configure Database
1. Go to SQL Editor
2. Run the database migration script:
```sql
-- Run the complete schema migration
-- This includes all tables for messaging, volunteer hours, etc.
```

#### Set Up Authentication
1. Go to Authentication > Settings
2. Configure site URL: `https://your-domain.com`
3. Add redirect URLs:
   - `https://your-domain.com/auth/callback`
   - `https://your-domain.com/login`
   - `https://your-domain.com/signup`

#### Configure Email Templates
1. Go to Authentication > Email Templates
2. Customize welcome email
3. Customize password reset email
4. Test email delivery

### 2. Environment Variables

#### Create `.env.local` for Development
```bash
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# Email Service Configuration
EMAIL_SERVICE_URL=http://localhost:5000
EMAIL_SERVICE_API_KEY=your-email-api-key

# Application Configuration
NEXTAUTH_SECRET=your-nextauth-secret
NEXTAUTH_URL=http://localhost:3000

# Database Configuration
DATABASE_URL=postgresql://postgres:password@localhost:5432/stemspark

# File Upload Configuration
UPLOAD_MAX_SIZE=10485760
ALLOWED_FILE_TYPES=image/jpeg,image/png,application/pdf

# Security Configuration
JWT_SECRET=your-jwt-secret
ENCRYPTION_KEY=your-encryption-key
```

#### Create `.env.production` for Production
```bash
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# Email Service Configuration
EMAIL_SERVICE_URL=https://your-email-service.com
EMAIL_SERVICE_API_KEY=your-email-api-key

# Application Configuration
NEXTAUTH_SECRET=your-production-nextauth-secret
NEXTAUTH_URL=https://your-domain.com

# Database Configuration
DATABASE_URL=postgresql://postgres:password@your-db-host:5432/stemspark

# File Upload Configuration
UPLOAD_MAX_SIZE=10485760
ALLOWED_FILE_TYPES=image/jpeg,image/png,application/pdf

# Security Configuration
JWT_SECRET=your-production-jwt-secret
ENCRYPTION_KEY=your-production-encryption-key

# Monitoring Configuration
SENTRY_DSN=your-sentry-dsn
LOG_LEVEL=info
```

### 3. Flask Mail Service Setup

#### Create Docker Configuration
```dockerfile
# flask-mail-service/Dockerfile
FROM python:3.9-slim

WORKDIR /app

COPY requirements.txt .
RUN pip install -r requirements.txt

COPY . .

EXPOSE 5000

CMD ["python", "app.py"]
```

#### Create Docker Compose
```yaml
# docker-compose.yml
version: '3.8'

services:
  email-service:
    build: ./flask-mail-service
    ports:
      - "5000:5000"
    environment:
      - SMTP_SERVER=smtp.gmail.com
      - SMTP_PORT=587
      - SMTP_USERNAME=your-email@gmail.com
      - SMTP_PASSWORD=your-app-password
      - SECRET_KEY=your-secret-key
    volumes:
      - ./flask-mail-service/templates:/app/templates
      - ./flask-mail-service/assets:/app/assets
```

#### Deploy Email Service
```bash
# Build and run locally
docker-compose up -d

# Deploy to production
docker build -t stem-spark-email-service .
docker run -d -p 5000:5000 --name email-service stem-spark-email-service
```

## Vercel Deployment

### 1. Connect Repository
1. Go to [vercel.com](https://vercel.com)
2. Click "New Project"
3. Import your GitHub repository
4. Configure project settings

### 2. Configure Build Settings
```json
// vercel.json
{
  "buildCommand": "npm run build",
  "outputDirectory": ".next",
  "installCommand": "npm install",
  "framework": "nextjs",
  "functions": {
    "app/api/**/*.ts": {
      "maxDuration": 30
    }
  },
  "headers": [
    {
      "source": "/api/(.*)",
      "headers": [
        {
          "key": "Access-Control-Allow-Origin",
          "value": "*"
        },
        {
          "key": "Access-Control-Allow-Methods",
          "value": "GET, POST, PUT, DELETE, OPTIONS"
        },
        {
          "key": "Access-Control-Allow-Headers",
          "value": "Content-Type, Authorization"
        }
      ]
    }
  ]
}
```

### 3. Set Environment Variables
1. Go to Project Settings > Environment Variables
2. Add all production environment variables
3. Configure for Production, Preview, and Development

### 4. Deploy
```bash
# Deploy to production
vercel --prod

# Deploy to preview
vercel
```

## Database Migration

### 1. Run Migrations
```bash
# Connect to Supabase
supabase link --project-ref your-project-ref

# Run migrations
supabase db push

# Verify migration
supabase db diff
```

### 2. Seed Initial Data
```sql
-- Insert default channels
INSERT INTO channels (name, description, channel_type, created_by) VALUES
('General', 'General discussion for all users', 'public', '00000000-0000-0000-0000-000000000000'),
('Announcements', 'Important announcements from administrators', 'announcement', '00000000-0000-0000-0000-000000000000'),
('Student Lounge', 'Student discussion area', 'public', '00000000-0000-0000-0000-000000000000');

-- Insert default admin user
INSERT INTO profiles (id, email, full_name, role, is_super_admin) VALUES
('00000000-0000-0000-0000-000000000000', 'admin@stemsparkacademy.com', 'System Administrator', 'super_admin', true);
```

## Security Configuration

### 1. Row Level Security (RLS)
```sql
-- Enable RLS on all tables
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE channels ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE volunteer_hours ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can view their own profile" ON profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile" ON profiles
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Public channels are viewable by all" ON channels
  FOR SELECT USING (channel_type = 'public');

CREATE POLICY "Channel members can view messages" ON messages
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM channel_members 
      WHERE user_id = auth.uid() AND channel_id = messages.channel_id
    )
  );
```

### 2. API Rate Limiting
```typescript
// middleware.ts
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

const rateLimit = new Map()

export function middleware(request: NextRequest) {
  const ip = request.ip || 'unknown'
  const now = Date.now()
  const windowMs = 15 * 60 * 1000 // 15 minutes
  const maxRequests = 100

  if (!rateLimit.has(ip)) {
    rateLimit.set(ip, { count: 1, resetTime: now + windowMs })
  } else {
    const userLimit = rateLimit.get(ip)
    if (now > userLimit.resetTime) {
      rateLimit.set(ip, { count: 1, resetTime: now + windowMs })
    } else if (userLimit.count >= maxRequests) {
      return NextResponse.json(
        { error: 'Too many requests' },
        { status: 429 }
      )
    } else {
      userLimit.count++
    }
  }

  return NextResponse.next()
}

export const config = {
  matcher: '/api/:path*',
}
```

### 3. Content Security Policy
```typescript
// next.config.js
const securityHeaders = [
  {
    key: 'Content-Security-Policy',
    value: `
      default-src 'self';
      script-src 'self' 'unsafe-eval' 'unsafe-inline';
      style-src 'self' 'unsafe-inline';
      img-src 'self' data: https:;
      font-src 'self';
      connect-src 'self' https://*.supabase.co;
      frame-src 'none';
      object-src 'none';
    `.replace(/\s{2,}/g, ' ').trim()
  },
  {
    key: 'X-Frame-Options',
    value: 'DENY'
  },
  {
    key: 'X-Content-Type-Options',
    value: 'nosniff'
  },
  {
    key: 'Referrer-Policy',
    value: 'origin-when-cross-origin'
  }
]

module.exports = {
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: securityHeaders,
      },
    ]
  },
}
```

## Monitoring Setup

### 1. Error Tracking (Sentry)
```typescript
// lib/sentry.ts
import * as Sentry from '@sentry/nextjs'

Sentry.init({
  dsn: process.env.SENTRY_DSN,
  environment: process.env.NODE_ENV,
  tracesSampleRate: 1.0,
})
```

### 2. Performance Monitoring
```typescript
// lib/analytics.ts
import { Analytics } from '@vercel/analytics/react'

export function AnalyticsWrapper({ children }) {
  return (
    <>
      {children}
      <Analytics />
    </>
  )
}
```

### 3. Health Checks
```typescript
// app/api/health/route.ts
import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export async function GET() {
  try {
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    )

    // Test database connection
    const { data, error } = await supabase
      .from('profiles')
      .select('count')
      .limit(1)

    if (error) throw error

    return NextResponse.json({
      status: 'healthy',
      timestamp: new Date().toISOString(),
      database: 'connected',
      version: process.env.npm_package_version
    })
  } catch (error) {
    return NextResponse.json(
      {
        status: 'unhealthy',
        timestamp: new Date().toISOString(),
        error: error.message
      },
      { status: 500 }
    )
  }
}
```

## Backup Strategy

### 1. Database Backups
```bash
# Automated backup script
#!/bin/bash
DATE=$(date +%Y%m%d_%H%M%S)
BACKUP_DIR="/backups"
SUPABASE_PROJECT="your-project-ref"

# Create backup
supabase db dump --project-ref $SUPABASE_PROJECT > $BACKUP_DIR/backup_$DATE.sql

# Compress backup
gzip $BACKUP_DIR/backup_$DATE.sql

# Keep only last 7 days of backups
find $BACKUP_DIR -name "backup_*.sql.gz" -mtime +7 -delete
```

### 2. File Storage Backups
```bash
# Backup uploaded files
rsync -avz /app/uploads/ /backups/uploads/
```

## SSL Configuration

### 1. Vercel SSL (Automatic)
Vercel automatically provides SSL certificates for custom domains.

### 2. Custom Domain Setup
1. Go to Vercel Project Settings > Domains
2. Add your custom domain
3. Configure DNS records:
   ```
   Type: CNAME
   Name: @
   Value: cname.vercel-dns.com
   ```

## Post-Deployment Verification

### 1. Functionality Tests
```bash
# Test authentication
curl -X POST https://your-domain.com/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"password"}'

# Test messaging API
curl -X GET https://your-domain.com/api/messaging/channels \
  -H "Authorization: Bearer your-token"

# Test volunteer hours API
curl -X GET https://your-domain.com/api/volunteer-hours/pending \
  -H "Authorization: Bearer your-token"
```

### 2. Performance Tests
```bash
# Load test with k6
k6 run load-test.js
```

### 3. Security Tests
```bash
# Run security scan
npm audit

# Test for common vulnerabilities
npx snyk test
```

## Troubleshooting

### Common Issues

#### Build Failures
1. Check environment variables
2. Verify dependencies
3. Check for TypeScript errors
4. Review build logs

#### Database Connection Issues
1. Verify Supabase credentials
2. Check network connectivity
3. Verify RLS policies
4. Check database status

#### Email Service Issues
1. Verify SMTP credentials
2. Check email service logs
3. Test email delivery
4. Verify API endpoints

#### Performance Issues
1. Check database queries
2. Monitor resource usage
3. Review caching strategy
4. Optimize images and assets

### Support Resources
- [Vercel Documentation](https://vercel.com/docs)
- [Supabase Documentation](https://supabase.com/docs)
- [Next.js Documentation](https://nextjs.org/docs)
- [Project Issues](https://github.com/your-repo/issues)

---

## Maintenance

### Regular Tasks
- Monitor error logs daily
- Review performance metrics weekly
- Update dependencies monthly
- Test backup restoration quarterly
- Security audit annually

### Updates
- Keep dependencies updated
- Monitor for security vulnerabilities
- Test updates in staging environment
- Deploy during low-traffic periods
- Maintain rollback procedures

For more detailed information about specific deployment scenarios, see the individual service documentation. 