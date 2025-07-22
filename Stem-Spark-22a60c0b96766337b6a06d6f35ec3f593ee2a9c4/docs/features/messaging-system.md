# Messaging System

The STEM Spark Academy messaging system provides real-time communication capabilities for all users, supporting text messages, file sharing, and channel-based conversations.

## Overview

The messaging system is built on Supabase Realtime and provides:
- Real-time message delivery
- Channel-based conversations
- File sharing capabilities
- User presence indicators
- Message moderation tools
- Role-based permissions

## Features

### 🏗️ Channel Management
- **Public Channels**: Open to all users
- **Private Channels**: Invite-only access
- **Group Channels**: For specific user groups
- **Announcement Channels**: Admin-only posting
- **Role-Restricted Channels**: Based on user roles

### 💬 Message Types
- **Text Messages**: Standard text communication
- **File Messages**: Document and media sharing
- **System Messages**: Automated notifications

### 🔐 Permissions System
- **Send Messages**: Control who can post
- **Join Channels**: Manage channel access
- **Moderation**: Enable/disable moderation features
- **Admin Controls**: Channel administration tools

## User Interface

### Communication Hub
The main messaging interface is located at `/communication-hub` and includes:

#### Channel Sidebar
- List of available channels
- Channel type indicators
- Member count
- Unread message indicators

#### Message Area
- Real-time message display
- Message input with file upload
- User avatars and names
- Timestamp information

#### Channel Management
- Create new channels
- Join/leave channels
- Channel settings
- Member management

## API Endpoints

### Channels API (`/api/messaging/channels`)

#### GET `/api/messaging/channels`
Retrieve channels for the current user.

**Response:**
```json
{
  "channels": [
    {
      "id": "channel-id",
      "name": "General",
      "description": "General discussion",
      "channel_type": "public",
      "created_by": "user-id",
      "created_at": "2024-01-01T00:00:00Z",
      "members": [...],
      "restrictions": {...}
    }
  ]
}
```

#### POST `/api/messaging/channels`
Create a new channel.

**Request Body:**
```json
{
  "name": "Channel Name",
  "description": "Channel description",
  "channelType": "public",
  "restrictions": {
    "can_send_messages": "everyone",
    "can_join": "everyone",
    "is_announcement_channel": false,
    "moderation_enabled": false
  },
  "allowedRoles": ["student", "admin"]
}
```

### Messages API (`/api/messaging/messages`)

#### GET `/api/messaging/messages?channelId=xxx&limit=50&offset=0`
Retrieve messages for a channel.

**Response:**
```json
{
  "messages": [
    {
      "id": "message-id",
      "channel_id": "channel-id",
      "sender_id": "user-id",
      "content": "Hello world!",
      "message_type": "text",
      "file_url": null,
      "created_at": "2024-01-01T00:00:00Z",
      "sender": {
        "full_name": "John Doe",
        "role": "student",
        "avatar_url": "https://..."
      }
    }
  ]
}
```

#### POST `/api/messaging/messages`
Send a new message.

**Request Body:**
```json
{
  "channelId": "channel-id",
  "content": "Message content",
  "messageType": "text",
  "fileUrl": "https://..."
}
```

#### DELETE `/api/messaging/messages`
Delete a message (admin/moderator only).

## Real-time Features

### Message Subscriptions
The system uses Supabase Realtime to provide instant message delivery:

```typescript
// Subscribe to channel messages
const channel = supabase
  .channel(`messages:${channelId}`)
  .on('postgres_changes', {
    event: 'INSERT',
    schema: 'public',
    table: 'messages',
    filter: `channel_id=eq.${channelId}`
  }, (payload) => {
    // Handle new message
    handleNewMessage(payload.new);
  })
  .subscribe();
```

### User Presence
Track user online/offline status:

```typescript
// Update user presence
await messagingService.updateUserPresence(userId, isOnline);
```

## Database Schema

### Channels Table
```sql
CREATE TABLE channels (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  channel_type TEXT NOT NULL CHECK (channel_type IN ('public', 'private', 'group', 'announcement', 'role_restricted')),
  created_by UUID REFERENCES profiles(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  channel_restrictions JSONB,
  allowed_roles TEXT[]
);
```

### Messages Table
```sql
CREATE TABLE messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  channel_id UUID REFERENCES channels(id) ON DELETE CASCADE,
  sender_id UUID REFERENCES profiles(id),
  content TEXT NOT NULL,
  message_type TEXT NOT NULL DEFAULT 'text' CHECK (message_type IN ('text', 'file', 'system')),
  file_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

### Channel Members Table
```sql
CREATE TABLE channel_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  channel_id UUID REFERENCES channels(id) ON DELETE CASCADE,
  role TEXT NOT NULL DEFAULT 'member' CHECK (role IN ('admin', 'member')),
  joined_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, channel_id)
);
```

## Security Features

### Message Permissions
- Users can only send messages to channels they're members of
- Admin-only channels restrict posting to administrators
- Moderation features allow message review and deletion

### Channel Access Control
- Public channels are accessible to all users
- Private channels require explicit invitation
- Role-restricted channels check user roles before access

### File Upload Security
- File type validation
- Size limits enforcement
- Virus scanning integration
- Secure file storage

## Usage Examples

### Creating a Channel
```typescript
const result = await messagingService.createChannel(
  'Study Group',
  'Math study group for advanced students',
  'private',
  userId,
  {
    can_send_messages: 'members_only',
    can_join: 'invite_only',
    is_announcement_channel: false,
    moderation_enabled: true
  }
);
```

### Sending a Message
```typescript
const result = await messagingService.sendMessage(
  channelId,
  userId,
  'Hello everyone!',
  'text'
);
```

### Subscribing to Messages
```typescript
const channel = messagingService.subscribeToChannel(
  channelId,
  (message) => {
    // Handle new message
    setMessages(prev => [...prev, message]);
  },
  (messageId) => {
    // Handle message deletion
    setMessages(prev => prev.filter(m => m.id !== messageId));
  }
);
```

## Troubleshooting

### Common Issues

#### Messages Not Appearing
1. Check if user has permission to view the channel
2. Verify Supabase Realtime is enabled
3. Check browser console for errors

#### Cannot Send Messages
1. Verify user is a member of the channel
2. Check channel permissions
3. Ensure user role allows messaging

#### Real-time Not Working
1. Check Supabase project settings
2. Verify environment variables
3. Check network connectivity

### Error Codes
- `401 Unauthorized`: User not authenticated
- `403 Forbidden`: Insufficient permissions
- `404 Not Found`: Channel or message not found
- `500 Internal Server Error`: Server-side error

## Best Practices

### Performance
- Use pagination for large message histories
- Implement message caching
- Optimize real-time subscriptions

### Security
- Always validate user permissions
- Sanitize message content
- Implement rate limiting
- Log security events

### User Experience
- Provide loading states
- Show typing indicators
- Handle offline scenarios
- Implement message search

## Integration

### With Other Features
- **Volunteer Hours**: Notifications for hour approvals
- **Tutoring System**: Session coordination
- **Admin Dashboard**: System-wide announcements
- **User Management**: Role-based access control

### External Services
- **Email Service**: Message notifications
- **File Storage**: Document sharing
- **Analytics**: Usage tracking
- **Monitoring**: Performance metrics

---

For technical implementation details, see the [API Reference](../technical/api-reference.md) and [Real-time Features](../technical/realtime-features.md) documentation. 