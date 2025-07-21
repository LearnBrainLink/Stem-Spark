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
  action_type: 'edit_user' | 'delete_user' | 'change_role' | 'approve_hours' | 'approve_application' | 'reject_application'
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
    can_manage_applications: boolean
    can_create_restricted_channels: boolean
    can_send_announcements: boolean
  }
}
```

### 5. Intern Application System

#### Application Interface
```typescript
interface InternApplication {
  id: string
  applicant_email: string
  full_name: string
  phone_number?: string
  date_of_birth: string
  education_level: string
  school_institution: string
  areas_of_interest: string[]
  previous_experience?: string
  availability: {
    days_per_week: number
    hours_per_week: number
    preferred_schedule: string
  }
  motivation_statement: string
  references?: Reference[]
  status: 'pending' | 'approved' | 'rejected' | 'interview_scheduled'
  submitted_at: string
  reviewed_by?: string
  reviewed_at?: string
  rejection_reason?: string
  interview_notes?: string
}

interface Reference {
  name: string
  relationship: string
  email: string
  phone?: string
}

interface ApplicationReview {
  application_id: string
  reviewer_id: string
  decision: 'approve' | 'reject' | 'request_interview'
  notes: string
  feedback_for_applicant?: string
  created_at: string
}
```

### 6. Enhanced Messaging System with Admin Controls

#### Enhanced Channel Interface
```typescript
interface Channel {
  id: string
  name: string
  description?: string
  channel_type: 'public' | 'private' | 'group' | 'announcement' | 'role_restricted'
  created_by: string
  created_at: string
  members: ChannelMember[]
  restrictions: ChannelRestrictions
  allowed_roles?: string[]
}

interface ChannelRestrictions {
  can_send_messages: 'everyone' | 'admins_only' | 'members_only'
  can_join: 'everyone' | 'invite_only' | 'role_restricted'
  is_announcement_channel: boolean
  moderation_enabled: boolean
}

interface MessagePermissions {
  user_id: string
  channel_id: string
  can_send: boolean
  can_moderate: boolean
  can_invite: boolean
  is_admin: boolean
}
```

### 7. Role-Specific Dashboard Components

#### Dashboard Interface
```typescript
interface DashboardConfig {
  role: 'parent' | 'intern' | 'student' | 'admin'
  widgets: DashboardWidget[]
  navigation: NavigationItem[]
  permissions: DashboardPermissions
}

interface DashboardWidget {
  id: string
  type: 'volunteer_hours' | 'messages' | 'applications' | 'tutoring' | 'children_progress' | 'announcements'
  title: string
  data_source: string
  refresh_interval?: number
  is_visible: boolean
  order: number
}

interface ParentDashboard {
  children: ChildProgress[]
  messages: ParentTeacherMessage[]
  announcements: Announcement[]
  upcoming_events: Event[]
}

interface InternDashboard {
  volunteer_hours: VolunteerHoursSummary
  application_status: ApplicationStatus
  tutoring_sessions: TutoringSession[]
  messages: Message[]
  available_opportunities: Opportunity[]
}

interface StudentDashboard {
  learning_progress: LearningProgress
  tutoring_sessions: TutoringSession[]
  resources: LearningResource[]
  messages: Message[]
  achievements: Achievement[]
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

#### Intern Applications Table
```sql
CREATE TABLE intern_applications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  applicant_email VARCHAR(255) NOT NULL UNIQUE,
  full_name VARCHAR(255) NOT NULL,
  phone_number VARCHAR(20),
  date_of_birth DATE NOT NULL,
  education_level VARCHAR(100) NOT NULL,
  school_institution VARCHAR(255) NOT NULL,
  areas_of_interest TEXT[] NOT NULL,
  previous_experience TEXT,
  availability JSONB NOT NULL,
  motivation_statement TEXT NOT NULL,
  references JSONB,
  status VARCHAR(30) DEFAULT 'pending',
  submitted_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  reviewed_by UUID REFERENCES profiles(id),
  reviewed_at TIMESTAMP WITH TIME ZONE,
  rejection_reason TEXT,
  interview_notes TEXT
);
```

#### Application Reviews Table
```sql
CREATE TABLE application_reviews (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  application_id UUID REFERENCES intern_applications(id) ON DELETE CASCADE,
  reviewer_id UUID REFERENCES profiles(id),
  decision VARCHAR(20) NOT NULL,
  notes TEXT NOT NULL,
  feedback_for_applicant TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

#### Enhanced Channels Table
```sql
-- Update existing channels table with new fields
ALTER TABLE channels ADD COLUMN IF NOT EXISTS channel_restrictions JSONB DEFAULT '{"can_send_messages": "everyone", "can_join": "everyone", "is_announcement_channel": false, "moderation_enabled": false}';
ALTER TABLE channels ADD COLUMN IF NOT EXISTS allowed_roles TEXT[];
```

#### Parent-Teacher Communications Table
```sql
CREATE TABLE parent_teacher_communications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  parent_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  teacher_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  student_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  subject VARCHAR(255) NOT NULL,
  message_thread_id UUID REFERENCES channels(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

### Updated Profiles Table
```sql
-- Add new columns to existing profiles table
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS total_volunteer_hours DECIMAL(6,2) DEFAULT 0;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS is_super_admin BOOLEAN DEFAULT FALSE;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS last_active TIMESTAMP WITH TIME ZONE;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS application_id UUID REFERENCES intern_applications(id);

-- Ensure role field cannot be set to 'admin' during signup
ALTER TABLE profiles ADD CONSTRAINT check_role_signup 
  CHECK (role != 'admin' OR created_at < NOW() - INTERVAL '1 second');
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

### Phase 1: Foundation & Security (Weeks 1-2)
- Set up Flask Mail microservice
- Implement admin signup restrictions
- Create database schema extensions including applications table
- Set up development environment with Novakinetix Academy branding

### Phase 2: Application System & Core Features (Weeks 3-4)
- Implement intern application submission system
- Create application management interface for admins
- Implement messaging system backend with admin controls
- Create volunteer hour tracking system
- Enhance admin protection mechanisms

### Phase 3: Role-Specific Dashboards & Communication (Weeks 5-6)
- Build role-specific dashboard components for parents, interns, and students
- Implement parent-teacher communication system
- Create enhanced messaging UI with admin restrictions and announcements
- Build volunteer hour submission interface
- Implement application review workflow

### Phase 4: Advanced Features & Integration (Weeks 7-8)
- Integrate all messaging controls and restrictions
- Implement announcement channels and role-based access
- Enhance admin dashboard with application management
- Create comprehensive user onboarding flows
- Integrate tutoring system with role-specific features

### Phase 5: Branding, Testing & Deployment (Week 9-10)
- Update all branding to Novakinetix Academy
- Implement logo loading and consistent naming
- Comprehensive testing of all role-specific features
- Performance optimization and security hardening
- Production deployment with proper Vercel configuration

### Phase 6: Monitoring & User Training (Week 11)
- Set up monitoring for all new features
- Create user documentation for application system
- Implement feedback collection mechanisms
- User training for admin application management
- Final testing and bug fixes