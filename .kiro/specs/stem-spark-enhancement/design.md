# Design Document

## Overview

This design document outlines the comprehensive enhancement of the STEM Spark Academy platform, focusing on migrating from Supabase email to Flask Mail, implementing an integrated messaging system, enhancing admin role protections, adding volunteer hour tracking, and ensuring all features work cohesively with clear user directions.

The platform is built on Next.js 15 with TypeScript, using Supabase for database operations and authentication. The enhancements will maintain the existing architecture while adding new services and improving existing functionality.

## Architecture

### Current Architecture
- **Frontend**: Next.js 15 with TypeScript and React 19
- **Database**: Supabase PostgreSQL with Row Level Security (RLS)
- **Authentication**: Supabase Auth
- **Styling**: Tailwind CSS with Radix UI components
- **State Management**: React hooks and server actions

### Enhanced Architecture
- **Email Service**: Flask Mail microservice (separate from main Next.js app)
- **Messaging Service**: Real-time messaging with Supabase Realtime
- **Volunteer Tracking**: Integrated with existing user management
- **Enhanced Admin Controls**: Role-based access control improvements
- **Data Analytics**: Enhanced data collection and reporting

## Components and Interfaces

### 1. Flask Mail Service

#### Email Service Interface
```typescript
interface EmailService {
  sendWelcomeEmail(user: User): Promise<EmailResult>
  sendPasswordResetEmail(email: string, resetToken: string): Promise<EmailResult>
  sendVolunteerHourApproval(intern: User, hours: VolunteerHours): Promise<EmailResult>
  sendTutoringNotification(tutor: User, student: User, session: TutoringSession): Promise<EmailResult>
  sendAdminNotification(admin: User, notification: AdminNotification): Promise<EmailResult>
}

interface EmailResult {
  success: boolean
  messageId?: string
  error?: string
}
```

#### Flask Mail Configuration
```python
# Flask Mail microservice configuration
class MailConfig:
    MAIL_SERVER = os.environ.get('MAIL_SERVER', 'smtp.gmail.com')
    MAIL_PORT = int(os.environ.get('MAIL_PORT', 587))
    MAIL_USE_TLS = os.environ.get('MAIL_USE_TLS', 'true').lower() == 'true'
    MAIL_USERNAME = os.environ.get('MAIL_USERNAME')
    MAIL_PASSWORD = os.environ.get('MAIL_PASSWORD')
    MAIL_DEFAULT_SENDER = os.environ.get('MAIL_DEFAULT_SENDER')
```

### 2. Messaging System

#### Message Interface
```typescript
interface Message {
  id: string
  channel_id: string
  sender_id: string
  content: string
  message_type: 'text' | 'file' | 'system'
  file_url?: string
  created_at: string
  updated_at: string
  sender: {
    full_name: string
    role: string
    avatar_url?: string
  }
}

interface Channel {
  id: string
  name: string
  description?: string
  channel_type: 'public' | 'private' | 'group'
  created_by: string
  created_at: string
  members: ChannelMember[]
}

interface ChannelMember {
  user_id: string
  channel_id: string
  role: 'admin' | 'member'
  joined_at: string
}
```

#### Messaging Components
- **MessageList**: Real-time message display with infinite scroll
- **MessageInput**: Rich text input with file upload support
- **ChannelSidebar**: Channel navigation and management
- **UserPresence**: Online/offline status indicators

### 3. Volunteer Hour Tracking

#### Volunteer Hours Interface
```typescript
interface VolunteerHours {
  id: string
  intern_id: string
  activity_type: 'tutoring' | 'mentoring' | 'event_assistance' | 'other'
  description: string
  hours: number
  date: string
  status: 'pending' | 'approved' | 'rejected'
  approved_by?: string
  approved_at?: string
  rejection_reason?: string
  created_at: string
}

interface TutoringSession {
  id: string
  tutor_id: string
  student_id: string
  subject: string
  duration_minutes: number
  session_date: string
  status: 'scheduled' | 'completed' | 'cancelled'
  notes?: string
  volunteer_hours_id?: string
}
```

### 4. Enhanced Admin Controls

#### Admin Protection Interface
```typescript
interface AdminAction {
  action_type: 'edit_user' | 'delete_user' | 'change_role' | 'approve_hours'
  target_user_id: string
  performed_by: string
  is_allowed: boolean
  reason?: string
  timestamp: string
}

interface RolePermissions {
  role: 'admin' | 'super_admin' | 'intern' | 'student' | 'parent'
  permissions: {
    can_edit_admins: boolean
    can_delete_admins: boolean
    can_change_admin_roles: boolean
    can_approve_volunteer_hours: boolean
    can_manage_content: boolean
    can_view_analytics: boolean
  }
}
```

## Data Models

### Database Schema Extensions

#### Messages Table
```sql
CREATE TABLE messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  channel_id UUID REFERENCES channels(id) ON DELETE CASCADE,
  sender_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  message_type VARCHAR(20) DEFAULT 'text',
  file_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

#### Channels Table
```sql
CREATE TABLE channels (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(100) NOT NULL,
  description TEXT,
  channel_type VARCHAR(20) DEFAULT 'public',
  created_by UUID REFERENCES profiles(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

#### Volunteer Hours Table
```sql
CREATE TABLE volunteer_hours (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  intern_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  activity_type VARCHAR(50) NOT NULL,
  description TEXT NOT NULL,
  hours DECIMAL(4,2) NOT NULL,
  date DATE NOT NULL,
  status VARCHAR(20) DEFAULT 'pending',
  approved_by UUID REFERENCES profiles(id),
  approved_at TIMESTAMP WITH TIME ZONE,
  rejection_reason TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

#### Tutoring Sessions Table
```sql
CREATE TABLE tutoring_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tutor_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  student_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  subject VARCHAR(100) NOT NULL,
  duration_minutes INTEGER NOT NULL,
  session_date TIMESTAMP WITH TIME ZONE NOT NULL,
  status VARCHAR(20) DEFAULT 'scheduled',
  notes TEXT,
  volunteer_hours_id UUID REFERENCES volunteer_hours(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

#### Admin Actions Log Table
```sql
CREATE TABLE admin_actions_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  action_type VARCHAR(50) NOT NULL,
  target_user_id UUID REFERENCES profiles(id),
  performed_by UUID REFERENCES profiles(id),
  is_allowed BOOLEAN NOT NULL,
  reason TEXT,
  metadata JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

### Updated Profiles Table
```sql
-- Add new columns to existing profiles table
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS total_volunteer_hours DECIMAL(6,2) DEFAULT 0;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS is_super_admin BOOLEAN DEFAULT FALSE;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS last_active TIMESTAMP WITH TIME ZONE;
```

## Error Handling

### Email Service Error Handling
- **SMTP Connection Failures**: Retry mechanism with exponential backoff
- **Template Rendering Errors**: Fallback to plain text emails
- **Rate Limiting**: Queue system for bulk email operations
- **Invalid Recipients**: Validation and sanitization

### Messaging System Error Handling
- **Connection Drops**: Automatic reconnection with message queuing
- **File Upload Failures**: Progress indicators and retry options
- **Permission Errors**: Clear error messages and fallback options
- **Real-time Sync Issues**: Conflict resolution and message ordering

### Volunteer Hours Error Handling
- **Duplicate Submissions**: Validation to prevent double-counting
- **Invalid Time Entries**: Input validation and reasonable limits
- **Approval Workflow Errors**: Clear status tracking and notifications
- **Data Integrity**: Constraints to ensure accurate hour calculations

### Admin Protection Error Handling
- **Unauthorized Actions**: Detailed logging and immediate blocking
- **Role Escalation Attempts**: Security alerts and audit trails
- **Circular Dependencies**: Prevention of admin lockout scenarios
- **Permission Conflicts**: Clear hierarchy and resolution rules

## Testing Strategy

### Unit Testing
- **Email Service**: Mock SMTP server for testing email delivery
- **Messaging Components**: React Testing Library for UI components
- **Volunteer Hour Logic**: Jest tests for calculation and validation
- **Admin Protection**: Security-focused tests for permission checks

### Integration Testing
- **Database Operations**: Supabase local development environment
- **Real-time Features**: WebSocket connection testing
- **Email Templates**: End-to-end email rendering and delivery
- **Role-based Access**: Complete user journey testing

### End-to-End Testing
- **User Workflows**: Playwright tests for complete user journeys
- **Admin Operations**: Comprehensive admin panel testing
- **Messaging Flows**: Real-time communication testing
- **Volunteer Hour Submission**: Complete approval workflow testing

### Performance Testing
- **Message Loading**: Large channel message history performance
- **Email Queue Processing**: Bulk email delivery performance
- **Database Queries**: Optimized queries for volunteer hour reporting
- **Real-time Updates**: Concurrent user messaging performance

## Security Considerations

### Email Security
- **SMTP Authentication**: Secure credential management
- **Email Validation**: Prevent email injection attacks
- **Rate Limiting**: Prevent spam and abuse
- **Template Security**: XSS prevention in email templates

### Messaging Security
- **Message Encryption**: End-to-end encryption for sensitive channels
- **File Upload Security**: Virus scanning and file type validation
- **Channel Permissions**: Proper access control implementation
- **Message Moderation**: Automated content filtering

### Admin Protection Security
- **Multi-factor Authentication**: Required for admin actions
- **Action Logging**: Comprehensive audit trails
- **Session Management**: Secure session handling for admins
- **Permission Validation**: Server-side permission checks

### Data Protection
- **PII Handling**: Proper handling of personal information
- **GDPR Compliance**: Data export and deletion capabilities
- **Backup Security**: Encrypted backups with access controls
- **API Security**: Rate limiting and authentication for all endpoints

## Implementation Phases

### Phase 1: Foundation (Weeks 1-2)
- Set up Flask Mail microservice
- Implement basic email templates
- Create database schema extensions
- Set up development environment

### Phase 2: Core Features (Weeks 3-4)
- Implement messaging system backend
- Create volunteer hour tracking system
- Enhance admin protection mechanisms
- Update role terminology throughout system

### Phase 3: User Interface (Weeks 5-6)
- Build messaging UI components
- Create volunteer hour submission interface
- Enhance admin dashboard with new features
- Implement clear user directions and help system

### Phase 4: Integration & Testing (Weeks 7-8)
- Integrate all systems
- Comprehensive testing
- Performance optimization
- Documentation and user guides

### Phase 5: Deployment & Monitoring (Week 9)
- Production deployment
- Monitoring setup
- User training
- Feedback collection and iteration