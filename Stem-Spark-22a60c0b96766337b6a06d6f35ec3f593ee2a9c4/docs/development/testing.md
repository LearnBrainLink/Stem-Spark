# Testing Guide

This guide provides comprehensive testing procedures for the STEM Spark Academy platform to ensure all features work correctly and reliably.

## Testing Overview

### Test Categories
1. **Unit Tests** - Individual component testing
2. **Integration Tests** - API and service testing
3. **End-to-End Tests** - Complete user workflow testing
4. **Security Tests** - Authentication and authorization testing
5. **Performance Tests** - Load and stress testing

### Testing Environment
- **Development**: Local development setup
- **Staging**: Pre-production environment
- **Production**: Live environment (read-only testing)

## Unit Testing

### Frontend Components

#### Test Setup
```bash
# Install testing dependencies
npm install --save-dev @testing-library/react @testing-library/jest-dom jest

# Run tests
npm test
```

#### Component Test Examples

**Button Component Test**
```typescript
import { render, screen, fireEvent } from '@testing-library/react'
import { Button } from '@/components/ui/button'

describe('Button Component', () => {
  test('renders with correct text', () => {
    render(<Button>Click me</Button>)
    expect(screen.getByText('Click me')).toBeInTheDocument()
  })

  test('calls onClick handler', () => {
    const handleClick = jest.fn()
    render(<Button onClick={handleClick}>Click me</Button>)
    fireEvent.click(screen.getByText('Click me'))
    expect(handleClick).toHaveBeenCalledTimes(1)
  })
})
```

**Form Component Test**
```typescript
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { LoginForm } from '@/components/LoginForm'

describe('LoginForm Component', () => {
  test('submits form with correct data', async () => {
    const handleSubmit = jest.fn()
    render(<LoginForm onSubmit={handleSubmit} />)
    
    fireEvent.change(screen.getByLabelText('Email'), {
      target: { value: 'test@example.com' }
    })
    fireEvent.change(screen.getByLabelText('Password'), {
      target: { value: 'password123' }
    })
    fireEvent.click(screen.getByText('Login'))
    
    await waitFor(() => {
      expect(handleSubmit).toHaveBeenCalledWith({
        email: 'test@example.com',
        password: 'password123'
      })
    })
  })
})
```

### Backend Services

#### API Route Testing
```typescript
import { createMocks } from 'node-mocks-http'
import { GET, POST } from '@/app/api/messaging/channels/route'

describe('Channels API', () => {
  test('GET returns channels for authenticated user', async () => {
    const { req, res } = createMocks({
      method: 'GET',
      headers: {
        authorization: 'Bearer valid-token'
      }
    })

    await GET(req)
    expect(res._getStatusCode()).toBe(200)
  })

  test('POST creates new channel', async () => {
    const { req, res } = createMocks({
      method: 'POST',
      body: {
        name: 'Test Channel',
        description: 'Test Description',
        channelType: 'public'
      }
    })

    await POST(req)
    expect(res._getStatusCode()).toBe(200)
  })
})
```

## Integration Testing

### Database Integration

#### Test Database Setup
```typescript
import { createClient } from '@supabase/supabase-js'

const testSupabase = createClient(
  process.env.TEST_SUPABASE_URL!,
  process.env.TEST_SUPABASE_ANON_KEY!
)

beforeEach(async () => {
  // Clean test database
  await testSupabase.from('messages').delete().neq('id', '00000000-0000-0000-0000-000000000000')
  await testSupabase.from('channels').delete().neq('id', '00000000-0000-0000-0000-000000000000')
})
```

#### Messaging Service Test
```typescript
import { messagingService } from '@/lib/real-time-messaging'

describe('Messaging Service', () => {
  test('creates channel successfully', async () => {
    const result = await messagingService.createChannel(
      'Test Channel',
      'Test Description',
      'public',
      'test-user-id'
    )
    
    expect(result.success).toBe(true)
    expect(result.channel).toBeDefined()
    expect(result.channel?.name).toBe('Test Channel')
  })

  test('sends message successfully', async () => {
    const result = await messagingService.sendMessage(
      'test-channel-id',
      'test-user-id',
      'Hello world!'
    )
    
    expect(result.success).toBe(true)
    expect(result.message).toBeDefined()
    expect(result.message?.content).toBe('Hello world!')
  })
})
```

### Email Service Integration

#### Email Service Test
```typescript
import { emailService } from '@/lib/email-service-integration'

describe('Email Service', () => {
  test('sends welcome email', async () => {
    const result = await emailService.sendWelcomeEmail({
      email: 'test@example.com',
      name: 'Test User'
    })
    
    expect(result.success).toBe(true)
  })

  test('sends password reset email', async () => {
    const result = await emailService.sendPasswordResetEmail({
      email: 'test@example.com',
      resetToken: 'test-token'
    })
    
    expect(result.success).toBe(true)
  })
})
```

## End-to-End Testing

### User Workflow Tests

#### Authentication Flow
```typescript
import { test, expect } from '@playwright/test'

test('user can sign up and log in', async ({ page }) => {
  // Navigate to sign up page
  await page.goto('/signup')
  
  // Fill sign up form
  await page.fill('[data-testid="email-input"]', 'test@example.com')
  await page.fill('[data-testid="password-input"]', 'password123')
  await page.fill('[data-testid="name-input"]', 'Test User')
  await page.selectOption('[data-testid="role-select"]', 'student')
  
  // Submit form
  await page.click('[data-testid="signup-button"]')
  
  // Verify redirect to dashboard
  await expect(page).toHaveURL('/dashboard')
  await expect(page.locator('[data-testid="welcome-message"]')).toContainText('Welcome, Test User')
})
```

#### Messaging Flow
```typescript
test('user can send and receive messages', async ({ page }) => {
  // Login
  await page.goto('/login')
  await page.fill('[data-testid="email-input"]', 'test@example.com')
  await page.fill('[data-testid="password-input"]', 'password123')
  await page.click('[data-testid="login-button"]')
  
  // Navigate to communication hub
  await page.goto('/communication-hub')
  
  // Select a channel
  await page.click('[data-testid="channel-item"]')
  
  // Send a message
  await page.fill('[data-testid="message-input"]', 'Hello everyone!')
  await page.click('[data-testid="send-button"]')
  
  // Verify message appears
  await expect(page.locator('[data-testid="message-list"]')).toContainText('Hello everyone!')
})
```

#### Volunteer Hours Flow
```typescript
test('intern can submit volunteer hours', async ({ page }) => {
  // Login as intern
  await page.goto('/login')
  await page.fill('[data-testid="email-input"]', 'intern@example.com')
  await page.fill('[data-testid="password-input"]', 'password123')
  await page.click('[data-testid="login-button"]')
  
  // Navigate to volunteer hours
  await page.goto('/volunteer-hours')
  
  // Submit hours
  await page.click('[data-testid="submit-hours-button"]')
  await page.fill('[data-testid="activity-description"]', 'Tutoring session')
  await page.selectOption('[data-testid="activity-type"]', 'tutoring')
  await page.fill('[data-testid="hours-input"]', '2')
  await page.click('[data-testid="submit-button"]')
  
  // Verify submission
  await expect(page.locator('[data-testid="success-message"]')).toContainText('Hours submitted successfully')
})
```

## Security Testing

### Authentication Tests

#### Password Security
```typescript
test('password requirements are enforced', async ({ page }) => {
  await page.goto('/signup')
  
  // Try weak password
  await page.fill('[data-testid="password-input"]', '123')
  await page.click('[data-testid="signup-button"]')
  
  // Verify error message
  await expect(page.locator('[data-testid="password-error"]')).toContainText('Password must be at least 8 characters')
})
```

#### Role-Based Access
```typescript
test('users cannot access admin features', async ({ page }) => {
  // Login as student
  await page.goto('/login')
  await page.fill('[data-testid="email-input"]', 'student@example.com')
  await page.fill('[data-testid="password-input"]', 'password123')
  await page.click('[data-testid="login-button"]')
  
  // Try to access admin dashboard
  await page.goto('/admin')
  
  // Verify access denied
  await expect(page).toHaveURL('/dashboard')
  await expect(page.locator('[data-testid="error-message"]')).toContainText('Access denied')
})
```

### API Security Tests

#### Rate Limiting
```typescript
test('API rate limiting works', async () => {
  const requests = Array(100).fill(null).map(() => 
    fetch('/api/messaging/messages', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ channelId: 'test', content: 'test' })
    })
  )
  
  const responses = await Promise.all(requests)
  const rateLimited = responses.filter(r => r.status === 429)
  
  expect(rateLimited.length).toBeGreaterThan(0)
})
```

## Performance Testing

### Load Testing

#### API Performance
```typescript
import { check } from 'k6'
import http from 'k6/http'

export const options = {
  stages: [
    { duration: '2m', target: 100 }, // Ramp up
    { duration: '5m', target: 100 }, // Stay at 100 users
    { duration: '2m', target: 0 },   // Ramp down
  ],
}

export default function() {
  const response = http.get('https://your-domain.com/api/admin/stats')
  
  check(response, {
    'status is 200': (r) => r.status === 200,
    'response time < 500ms': (r) => r.timings.duration < 500,
  })
}
```

#### Database Performance
```typescript
test('database queries are optimized', async () => {
  const startTime = Date.now()
  
  // Perform complex query
  const result = await messagingService.getChannels('test-user-id')
  
  const endTime = Date.now()
  const duration = endTime - startTime
  
  expect(duration).toBeLessThan(1000) // Should complete in under 1 second
  expect(result.success).toBe(true)
})
```

## Accessibility Testing

### Screen Reader Compatibility
```typescript
test('components are accessible', async ({ page }) => {
  await page.goto('/dashboard')
  
  // Check for proper ARIA labels
  await expect(page.locator('[aria-label="Navigation menu"]')).toBeVisible()
  await expect(page.locator('[aria-label="User profile"]')).toBeVisible()
  
  // Check for proper heading structure
  const headings = await page.locator('h1, h2, h3, h4, h5, h6').all()
  expect(headings.length).toBeGreaterThan(0)
})
```

### Keyboard Navigation
```typescript
test('keyboard navigation works', async ({ page }) => {
  await page.goto('/communication-hub')
  
  // Navigate with keyboard
  await page.keyboard.press('Tab')
  await page.keyboard.press('Enter')
  
  // Verify focus moves correctly
  await expect(page.locator('[data-testid="message-input"]:focus')).toBeVisible()
})
```

## Mobile Testing

### Responsive Design
```typescript
test('mobile layout works correctly', async ({ page }) => {
  // Set mobile viewport
  await page.setViewportSize({ width: 375, height: 667 })
  await page.goto('/dashboard')
  
  // Check mobile menu
  await page.click('[data-testid="mobile-menu-button"]')
  await expect(page.locator('[data-testid="mobile-menu"]')).toBeVisible()
  
  // Check touch interactions
  await page.touchscreen.tap('[data-testid="menu-item"]')
})
```

## Test Data Management

### Test Data Setup
```typescript
// test-data.ts
export const testUsers = {
  student: {
    email: 'student@test.com',
    password: 'password123',
    role: 'student'
  },
  intern: {
    email: 'intern@test.com',
    password: 'password123',
    role: 'intern'
  },
  admin: {
    email: 'admin@test.com',
    password: 'password123',
    role: 'admin'
  }
}

export const testChannels = {
  public: {
    name: 'Public Test Channel',
    description: 'Test public channel',
    type: 'public'
  },
  private: {
    name: 'Private Test Channel',
    description: 'Test private channel',
    type: 'private'
  }
}
```

### Database Seeding
```typescript
// seed-test-data.ts
import { createClient } from '@supabase/supabase-js'
import { testUsers, testChannels } from './test-data'

const supabase = createClient(
  process.env.TEST_SUPABASE_URL!,
  process.env.TEST_SUPABASE_ANON_KEY!
)

export async function seedTestData() {
  // Create test users
  for (const user of Object.values(testUsers)) {
    await supabase.auth.signUp({
      email: user.email,
      password: user.password
    })
  }
  
  // Create test channels
  for (const channel of Object.values(testChannels)) {
    await supabase.from('channels').insert(channel)
  }
}
```

## Continuous Integration

### GitHub Actions Workflow
```yaml
# .github/workflows/test.yml
name: Tests

on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    
    steps:
    - uses: actions/checkout@v2
    
    - name: Setup Node.js
      uses: actions/setup-node@v2
      with:
        node-version: '18'
        
    - name: Install dependencies
      run: npm ci
      
    - name: Run unit tests
      run: npm test
      
    - name: Run integration tests
      run: npm run test:integration
      
    - name: Run E2E tests
      run: npm run test:e2e
      
    - name: Upload coverage
      uses: codecov/codecov-action@v1
```

## Test Reporting

### Coverage Reports
```json
// jest.config.js
module.exports = {
  collectCoverageFrom: [
    'app/**/*.{js,jsx,ts,tsx}',
    'components/**/*.{js,jsx,ts,tsx}',
    'lib/**/*.{js,jsx,ts,tsx}',
    '!**/*.d.ts',
    '!**/node_modules/**'
  ],
  coverageThreshold: {
    global: {
      branches: 80,
      functions: 80,
      lines: 80,
      statements: 80
    }
  }
}
```

## Running Tests

### Local Development
```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage
npm run test:coverage

# Run specific test file
npm test -- messaging.test.ts

# Run E2E tests
npm run test:e2e
```

### Pre-deployment Testing
```bash
# Run full test suite
npm run test:full

# Run security tests
npm run test:security

# Run performance tests
npm run test:performance

# Run accessibility tests
npm run test:a11y
```

---

## Test Maintenance

### Regular Tasks
- Update test data monthly
- Review and update test cases quarterly
- Monitor test performance and coverage
- Update dependencies and testing tools

### Best Practices
- Write tests before implementing features (TDD)
- Keep tests simple and focused
- Use descriptive test names
- Maintain test data consistency
- Document complex test scenarios

For more information about specific testing scenarios, see the individual feature documentation. 