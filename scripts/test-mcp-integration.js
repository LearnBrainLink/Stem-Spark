#!/usr/bin/env node

/**
 * MCP Integration Test Script
 * Tests all database operations using Supabase MCP
 * 
 * Usage: node scripts/test-mcp-integration.js
 */

const { createClient } = require('@supabase/supabase-js');

// Configuration
const SUPABASE_URL = process.env.SUPABASE_URL || 'https://your-project-ref.supabase.co';
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || 'your-service-role-key';

// Test data
const testUser = {
  email: 'test@stems spark.academy',
  full_name: 'Test User',
  role: 'intern',
  status: 'active'
};

const testVolunteerHours = {
  activity_type: 'Tutoring',
  activity_date: new Date().toISOString().split('T')[0],
  hours: 2.5,
  description: 'Test volunteer hours for MCP integration testing'
};

const testTutoringSession = {
  subject: 'Mathematics',
  session_date: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
  duration_hours: 1.5,
  status: 'scheduled'
};

const testChannel = {
  name: 'mcp-test-channel',
  description: 'Test channel for MCP integration',
  is_private: false
};

const testMessage = {
  content: 'Test message for MCP integration',
  message_type: 'text'
};

class MCPIntegrationTester {
  constructor() {
    this.supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);
    this.testResults = [];
    this.testUserId = null;
    this.testChannelId = null;
  }

  async runTests() {
    console.log('🚀 Starting MCP Integration Tests...\n');
    
    try {
      // Test 1: Database Connection
      await this.testDatabaseConnection();
      
      // Test 2: User Management
      await this.testUserManagement();
      
      // Test 3: Volunteer Hours
      await this.testVolunteerHours();
      
      // Test 4: Tutoring Sessions
      await this.testTutoringSessions();
      
      // Test 5: Messaging System
      await this.testMessagingSystem();
      
      // Test 6: Admin Actions Log
      await this.testAdminActionsLog();
      
      // Test 7: Analytics Events
      await this.testAnalyticsEvents();
      
      // Test 8: Applications
      await this.testApplications();
      
      // Test 9: Videos
      await this.testVideos();
      
      // Test 10: Cleanup
      await this.testCleanup();
      
      this.printResults();
      
    } catch (error) {
      console.error('❌ Test suite failed:', error);
      process.exit(1);
    }
  }

  async testDatabaseConnection() {
    console.log('📊 Testing Database Connection...');
    
    try {
      const { data, error } = await this.supabase
        .from('profiles')
        .select('count')
        .limit(1);
      
      if (error) throw error;
      
      this.recordTest('Database Connection', true, 'Successfully connected to database');
      console.log('✅ Database connection successful\n');
    } catch (error) {
      this.recordTest('Database Connection', false, error.message);
      console.log('❌ Database connection failed:', error.message, '\n');
    }
  }

  async testUserManagement() {
    console.log('👤 Testing User Management...');
    
    try {
      // Create test user
      const { data: user, error: createError } = await this.supabase
        .from('profiles')
        .insert(testUser)
        .select()
        .single();
      
      if (createError) throw createError;
      
      this.testUserId = user.id;
      
      // Read user
      const { data: readUser, error: readError } = await this.supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();
      
      if (readError) throw readError;
      
      // Update user
      const { error: updateError } = await this.supabase
        .from('profiles')
        .update({ full_name: 'Updated Test User' })
        .eq('id', user.id);
      
      if (updateError) throw updateError;
      
      this.recordTest('User Management', true, 'CRUD operations successful');
      console.log('✅ User management tests passed\n');
    } catch (error) {
      this.recordTest('User Management', false, error.message);
      console.log('❌ User management tests failed:', error.message, '\n');
    }
  }

  async testVolunteerHours() {
    console.log('⏰ Testing Volunteer Hours...');
    
    try {
      if (!this.testUserId) {
        throw new Error('Test user not created');
      }
      
      // Create volunteer hours
      const { data: hours, error: createError } = await this.supabase
        .from('volunteer_hours')
        .insert({
          ...testVolunteerHours,
          user_id: this.testUserId
        })
        .select()
        .single();
      
      if (createError) throw createError;
      
      // Read volunteer hours
      const { data: readHours, error: readError } = await this.supabase
        .from('volunteer_hours')
        .select('*')
        .eq('id', hours.id)
        .single();
      
      if (readError) throw readError;
      
      // Update status
      const { error: updateError } = await this.supabase
        .from('volunteer_hours')
        .update({ status: 'approved' })
        .eq('id', hours.id);
      
      if (updateError) throw updateError;
      
      this.recordTest('Volunteer Hours', true, 'CRUD operations successful');
      console.log('✅ Volunteer hours tests passed\n');
    } catch (error) {
      this.recordTest('Volunteer Hours', false, error.message);
      console.log('❌ Volunteer hours tests failed:', error.message, '\n');
    }
  }

  async testTutoringSessions() {
    console.log('📚 Testing Tutoring Sessions...');
    
    try {
      if (!this.testUserId) {
        throw new Error('Test user not created');
      }
      
      // Create tutoring session
      const { data: session, error: createError } = await this.supabase
        .from('tutoring_sessions')
        .insert({
          ...testTutoringSession,
          tutor_id: this.testUserId,
          student_id: this.testUserId
        })
        .select()
        .single();
      
      if (createError) throw createError;
      
      // Read session
      const { data: readSession, error: readError } = await this.supabase
        .from('tutoring_sessions')
        .select('*')
        .eq('id', session.id)
        .single();
      
      if (readError) throw readError;
      
      // Update status
      const { error: updateError } = await this.supabase
        .from('tutoring_sessions')
        .update({ status: 'completed' })
        .eq('id', session.id);
      
      if (updateError) throw updateError;
      
      this.recordTest('Tutoring Sessions', true, 'CRUD operations successful');
      console.log('✅ Tutoring sessions tests passed\n');
    } catch (error) {
      this.recordTest('Tutoring Sessions', false, error.message);
      console.log('❌ Tutoring sessions tests failed:', error.message, '\n');
    }
  }

  async testMessagingSystem() {
    console.log('💬 Testing Messaging System...');
    
    try {
      // Create channel
      const { data: channel, error: channelError } = await this.supabase
        .from('chat_channels')
        .insert(testChannel)
        .select()
        .single();
      
      if (channelError) throw channelError;
      
      this.testChannelId = channel.id;
      
      // Add member to channel
      const { error: memberError } = await this.supabase
        .from('channel_members')
        .insert({
          channel_id: channel.id,
          user_id: this.testUserId,
          role: 'member'
        });
      
      if (memberError) throw memberError;
      
      // Create message
      const { data: message, error: messageError } = await this.supabase
        .from('chat_messages')
        .insert({
          ...testMessage,
          channel_id: channel.id,
          user_id: this.testUserId
        })
        .select()
        .single();
      
      if (messageError) throw messageError;
      
      // Read messages
      const { data: messages, error: readError } = await this.supabase
        .from('chat_messages')
        .select('*')
        .eq('channel_id', channel.id);
      
      if (readError) throw readError;
      
      this.recordTest('Messaging System', true, 'Channel and message operations successful');
      console.log('✅ Messaging system tests passed\n');
    } catch (error) {
      this.recordTest('Messaging System', false, error.message);
      console.log('❌ Messaging system tests failed:', error.message, '\n');
    }
  }

  async testAdminActionsLog() {
    console.log('📝 Testing Admin Actions Log...');
    
    try {
      if (!this.testUserId) {
        throw new Error('Test user not created');
      }
      
      // Create admin action log
      const { data: log, error: createError } = await this.supabase
        .from('admin_actions_log')
        .insert({
          admin_id: this.testUserId,
          action_type: 'test_action',
          target_type: 'user',
          target_id: this.testUserId,
          details: { test: true },
          ip_address: '127.0.0.1',
          user_agent: 'MCP Test Script'
        })
        .select()
        .single();
      
      if (createError) throw createError;
      
      // Read logs
      const { data: logs, error: readError } = await this.supabase
        .from('admin_actions_log')
        .select('*')
        .eq('admin_id', this.testUserId);
      
      if (readError) throw readError;
      
      this.recordTest('Admin Actions Log', true, 'Logging operations successful');
      console.log('✅ Admin actions log tests passed\n');
    } catch (error) {
      this.recordTest('Admin Actions Log', false, error.message);
      console.log('❌ Admin actions log tests failed:', error.message, '\n');
    }
  }

  async testAnalyticsEvents() {
    console.log('📊 Testing Analytics Events...');
    
    try {
      if (!this.testUserId) {
        throw new Error('Test user not created');
      }
      
      // Create analytics event
      const { data: event, error: createError } = await this.supabase
        .from('analytics_events')
        .insert({
          user_id: this.testUserId,
          event_type: 'page_view',
          event_data: { page: '/test' },
          page_url: '/test',
          user_agent: 'MCP Test Script',
          ip_address: '127.0.0.1',
          consent_given: true
        })
        .select()
        .single();
      
      if (createError) throw createError;
      
      // Read events
      const { data: events, error: readError } = await this.supabase
        .from('analytics_events')
        .select('*')
        .eq('user_id', this.testUserId);
      
      if (readError) throw readError;
      
      this.recordTest('Analytics Events', true, 'Event logging successful');
      console.log('✅ Analytics events tests passed\n');
    } catch (error) {
      this.recordTest('Analytics Events', false, error.message);
      console.log('❌ Analytics events tests failed:', error.message, '\n');
    }
  }

  async testApplications() {
    console.log('📋 Testing Applications...');
    
    try {
      if (!this.testUserId) {
        throw new Error('Test user not created');
      }
      
      // Create application
      const { data: application, error: createError } = await this.supabase
        .from('applications')
        .insert({
          user_id: this.testUserId,
          position: 'Test Position',
          status: 'pending',
          experience_level: 'beginner',
          skills: ['JavaScript', 'React'],
          availability: 'Part-time'
        })
        .select()
        .single();
      
      if (createError) throw createError;
      
      // Read application
      const { data: readApp, error: readError } = await this.supabase
        .from('applications')
        .select('*')
        .eq('id', application.id)
        .single();
      
      if (readError) throw readError;
      
      this.recordTest('Applications', true, 'Application management successful');
      console.log('✅ Applications tests passed\n');
    } catch (error) {
      this.recordTest('Applications', false, error.message);
      console.log('❌ Applications tests failed:', error.message, '\n');
    }
  }

  async testVideos() {
    console.log('🎥 Testing Videos...');
    
    try {
      if (!this.testUserId) {
        throw new Error('Test user not created');
      }
      
      // Create video
      const { data: video, error: createError } = await this.supabase
        .from('videos')
        .insert({
          title: 'Test Video',
          description: 'Test video for MCP integration',
          url: 'https://example.com/test-video.mp4',
          thumbnail_url: 'https://example.com/thumbnail.jpg',
          duration: 300,
          category: 'Education',
          tags: ['test', 'mcp'],
          created_by: this.testUserId
        })
        .select()
        .single();
      
      if (createError) throw createError;
      
      // Read video
      const { data: readVideo, error: readError } = await this.supabase
        .from('videos')
        .select('*')
        .eq('id', video.id)
        .single();
      
      if (readError) throw readError;
      
      this.recordTest('Videos', true, 'Video management successful');
      console.log('✅ Videos tests passed\n');
    } catch (error) {
      this.recordTest('Videos', false, error.message);
      console.log('❌ Videos tests failed:', error.message, '\n');
    }
  }

  async testCleanup() {
    console.log('🧹 Testing Cleanup...');
    
    try {
      // Clean up test data
      if (this.testChannelId) {
        await this.supabase
          .from('chat_messages')
          .delete()
          .eq('channel_id', this.testChannelId);
        
        await this.supabase
          .from('channel_members')
          .delete()
          .eq('channel_id', this.testChannelId);
        
        await this.supabase
          .from('chat_channels')
          .delete()
          .eq('id', this.testChannelId);
      }
      
      if (this.testUserId) {
        await this.supabase
          .from('analytics_events')
          .delete()
          .eq('user_id', this.testUserId);
        
        await this.supabase
          .from('admin_actions_log')
          .delete()
          .eq('admin_id', this.testUserId);
        
        await this.supabase
          .from('applications')
          .delete()
          .eq('user_id', this.testUserId);
        
        await this.supabase
          .from('videos')
          .delete()
          .eq('created_by', this.testUserId);
        
        await this.supabase
          .from('tutoring_sessions')
          .delete()
          .eq('tutor_id', this.testUserId);
        
        await this.supabase
          .from('volunteer_hours')
          .delete()
          .eq('user_id', this.testUserId);
        
        await this.supabase
          .from('profiles')
          .delete()
          .eq('id', this.testUserId);
      }
      
      this.recordTest('Cleanup', true, 'Test data cleanup successful');
      console.log('✅ Cleanup tests passed\n');
    } catch (error) {
      this.recordTest('Cleanup', false, error.message);
      console.log('❌ Cleanup tests failed:', error.message, '\n');
    }
  }

  recordTest(testName, passed, message) {
    this.testResults.push({
      test: testName,
      passed,
      message,
      timestamp: new Date().toISOString()
    });
  }

  printResults() {
    console.log('📋 Test Results Summary:');
    console.log('========================\n');
    
    const passed = this.testResults.filter(r => r.passed).length;
    const total = this.testResults.length;
    
    this.testResults.forEach(result => {
      const status = result.passed ? '✅' : '❌';
      console.log(`${status} ${result.test}: ${result.message}`);
    });
    
    console.log(`\n📊 Overall: ${passed}/${total} tests passed`);
    
    if (passed === total) {
      console.log('🎉 All MCP integration tests passed!');
      process.exit(0);
    } else {
      console.log('⚠️  Some tests failed. Please review the errors above.');
      process.exit(1);
    }
  }
}

// Run tests if this script is executed directly
if (require.main === module) {
  const tester = new MCPIntegrationTester();
  tester.runTests();
}

module.exports = MCPIntegrationTester; 