# Supabase MCP Integration Guide

## Overview

This document provides comprehensive guidance on using Supabase MCP (Model Context Protocol) for the STEM Spark Academy project. MCP integration ensures proper database operations, migrations, and best practices.

## Configuration

### 1. MCP Configuration File

The project uses `mcp-config.json` for MCP server configuration:

```json
{
  "mcpServers": {
    "supabase": {
      "command": "npx",
      "args": ["-y", "@modelcontextprotocol/server-supabase"],
      "env": {
        "SUPABASE_URL": "https://your-project-ref.supabase.co",
        "SUPABASE_ANON_KEY": "your-anon-key",
        "SUPABASE_SERVICE_ROLE_KEY": "your-service-role-key"
      }
    }
  }
}
```

### 2. Environment Variables

Set up the following environment variables:

```bash
# Supabase Configuration
SUPABASE_URL=https://your-project-ref.supabase.co
SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# MCP Configuration
MCP_ENABLED=true
MCP_LOG_LEVEL=info
```

## Database Operations

### 1. Creating Migrations

Use the MCP migration system for all database changes:

```bash
# Create a new migration
npx supabase migration new add_new_feature

# Apply migrations
npx supabase db push

# Reset database (development only)
npx supabase db reset
```

### 2. Migration Best Practices

- **Naming**: Use descriptive names with timestamps
- **Atomicity**: Each migration should be atomic
- **Rollback**: Include rollback scripts when possible
- **Testing**: Test migrations in development first

Example migration structure:

```sql
-- Migration: 002_add_user_preferences.sql
-- Description: Add user preferences table
-- Created: 2024-01-16

-- Up migration
CREATE TABLE user_preferences (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    theme TEXT DEFAULT 'light',
    notifications_enabled BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Down migration (rollback)
-- DROP TABLE user_preferences;
```

### 3. Row Level Security (RLS)

All tables have RLS enabled. Create policies for secure access:

```sql
-- Example: Profiles table policy
CREATE POLICY "Users can view their own profile" ON profiles
    FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Admins can view all profiles" ON profiles
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM profiles 
            WHERE id = auth.uid() 
            AND role IN ('admin', 'super_admin')
        )
    );
```

## API Integration

### 1. Using MCP in Next.js API Routes

```typescript
// app/api/users/route.ts
import { createClient } from '@/lib/supabase/server';

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();
    
    // MCP ensures proper connection handling
    const { data: users, error } = await supabase
      .from('profiles')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (error) {
      console.error('MCP Database Error:', error);
      return NextResponse.json({ error: 'Database operation failed' }, { status: 500 });
    }
    
    return NextResponse.json({ success: true, users });
  } catch (error) {
    console.error('MCP Integration Error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
```

### 2. Error Handling

Implement proper error handling for MCP operations:

```typescript
// lib/mcp-error-handler.ts
export class MCPErrorHandler {
  static handle(error: any, context: string) {
    console.error(`MCP Error in ${context}:`, error);
    
    // Log to monitoring service
    if (process.env.NODE_ENV === 'production') {
      // Send to error tracking service
    }
    
    return {
      success: false,
      error: error.message || 'Database operation failed',
      context
    };
  }
}
```

## Best Practices

### 1. Connection Management

- Use connection pooling
- Implement proper error handling
- Monitor connection health

```typescript
// lib/supabase/mcp-client.ts
import { createClient } from '@supabase/supabase-js';

class MCPClient {
  private static instance: any;
  
  static getInstance() {
    if (!this.instance) {
      this.instance = createClient(
        process.env.SUPABASE_URL!,
        process.env.SUPABASE_SERVICE_ROLE_KEY!,
        {
          auth: {
            autoRefreshToken: false,
            persistSession: false
          }
        }
      );
    }
    return this.instance;
  }
}
```

### 2. Query Optimization

- Use indexes effectively
- Implement pagination
- Cache frequently accessed data

```sql
-- Example: Optimized query with pagination
SELECT * FROM profiles 
WHERE role = 'intern' 
ORDER BY created_at DESC 
LIMIT 20 OFFSET 0;
```

### 3. Security

- Always validate inputs
- Use parameterized queries
- Implement proper authentication

```typescript
// Example: Secure query with validation
export async function getUserById(userId: string) {
  // Validate UUID format
  if (!isValidUUID(userId)) {
    throw new Error('Invalid user ID format');
  }
  
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .single();
    
  return { data, error };
}
```

## Monitoring and Logging

### 1. MCP Health Checks

```typescript
// lib/mcp-health-check.ts
export async function checkMCPHealth() {
  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from('profiles')
      .select('count')
      .limit(1);
      
    return {
      status: 'healthy',
      timestamp: new Date().toISOString(),
      error: error?.message
    };
  } catch (error) {
    return {
      status: 'unhealthy',
      timestamp: new Date().toISOString(),
      error: error.message
    };
  }
}
```

### 2. Performance Monitoring

Monitor query performance and optimize as needed:

```sql
-- Check slow queries
SELECT 
  query,
  calls,
  total_time,
  mean_time,
  rows
FROM pg_stat_statements 
ORDER BY mean_time DESC 
LIMIT 10;
```

## Development Workflow

### 1. Local Development

```bash
# Start local Supabase
npx supabase start

# Apply migrations
npx supabase db push

# Generate types
npx supabase gen types typescript --local > types/database.ts
```

### 2. Testing

```typescript
// tests/mcp-integration.test.ts
import { createClient } from '@/lib/supabase/server';

describe('MCP Integration Tests', () => {
  test('should connect to database', async () => {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from('profiles')
      .select('count');
      
    expect(error).toBeNull();
    expect(data).toBeDefined();
  });
});
```

## Troubleshooting

### Common Issues

1. **Connection Timeout**
   - Check network connectivity
   - Verify environment variables
   - Increase timeout settings

2. **RLS Policy Issues**
   - Verify user authentication
   - Check policy definitions
   - Test with different user roles

3. **Migration Failures**
   - Check for conflicting migrations
   - Verify SQL syntax
   - Test in development first

### Debug Commands

```bash
# Check MCP server status
npx supabase status

# View logs
npx supabase logs

# Reset local database
npx supabase db reset
```

## Resources

- [Supabase Documentation](https://supabase.com/docs)
- [MCP Specification](https://modelcontextprotocol.io/)
- [PostgreSQL Best Practices](https://www.postgresql.org/docs/current/)

## Support

For MCP-related issues:

1. Check the troubleshooting section
2. Review logs and error messages
3. Consult the Supabase documentation
4. Contact the development team

---

**Last Updated**: 2024-01-15
**Version**: 1.0.0
**Maintainer**: STEM Spark Academy Development Team 