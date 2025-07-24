import { supabase } from './supabase/client';
import { Database } from './database.types';
import AdminProtectionService from './admin-protection';

type Tables = Database['public']['Tables'];
type ChatChannel = Tables['chat_channels']['Row'];
type ChatMessage = Tables['chat_messages']['Row'];
type ChatChannelMember = Tables['chat_channel_members']['Row'];
type Profile = Tables['profiles']['Row'];

export interface CreateChannelRequest {
  name: string;
  description?: string;
  channel_type?: 'general' | 'tutoring' | 'volunteer' | 'announcement';
  created_by: string;
}

export interface SendMessageRequest {
  channel_id: string;
  sender_id: string;
  content: string;
  message_type?: 'text' | 'file' | 'image' | 'system';
  file_url?: string;
}

export interface JoinChannelRequest {
  channel_id: string;
  user_id: string;
  role?: 'member' | 'moderator' | 'admin';
}

export interface MessageWithSender extends ChatMessage {
  sender: Profile;
}

export interface ChannelWithMembers extends ChatChannel {
  members: (ChatChannelMember & { user: Profile })[];
  message_count: number;
}

class RealTimeMessagingService {
  private adminProtection;

  constructor() {
    this.adminProtection = new AdminProtectionService();
  }

  /**
   * Create a new chat channel
   */
  async createChannel(request: CreateChannelRequest): Promise<{
    success: boolean;
    data?: ChatChannel;
    error?: string;
  }> {
    try {
      // Validate admin action if creating announcement channel
      if (request.channel_type === 'announcement') {
        // TODO: Implement admin validation for announcement channels
        // For now, allow creation but log it
        console.log('Announcement channel creation attempted by:', request.created_by);
      }

      // Validate input
      if (!request.name.trim()) {
        return { success: false, error: 'Channel name is required' };
      }

      // Check if channel name already exists
      const { data: existingChannel } = await supabase
        .from('chat_channels')
        .select('id')
        .eq('name', request.name)
        .single();

      if (existingChannel) {
        return { success: false, error: 'Channel name already exists' };
      }

      // Create channel
      const { data: channel, error } = await supabase
        .from('chat_channels')
        .insert({
          name: request.name,
          description: request.description,
          channel_type: request.channel_type || 'general',
          created_by: request.created_by
        })
        .select()
        .single();

      if (error) {
        console.error('Error creating channel:', error);
        return { success: false, error: 'Failed to create channel' };
      }

      // Add creator as admin member
      await supabase
        .from('chat_channel_members')
        .insert({
          channel_id: channel.id,
          user_id: request.created_by,
          role: 'admin',
          joined_at: new Date().toISOString()
        });

      return { success: true, data: channel };
    } catch (error) {
      console.error('Error in createChannel:', error);
      return { success: false, error: 'Internal server error' };
    }
  }

  /**
   * Send a message to a channel
   */
  async sendMessage(request: SendMessageRequest): Promise<{
    success: boolean;
    data?: ChatMessage;
    error?: string;
  }> {
    try {
      // Validate input
      if (!request.channel_id || !request.sender_id || !request.content.trim()) {
        return { success: false, error: 'Missing required fields' };
      }

      // Check if user is a member of the channel
      const { data: membership } = await supabase
        .from('chat_channel_members')
        .select('*')
        .eq('channel_id', request.channel_id)
        .eq('user_id', request.sender_id)
        .single();

      if (!membership) {
        return { success: false, error: 'You are not a member of this channel' };
      }

      // Create message
      const { data: message, error } = await supabase
        .from('chat_messages')
        .insert({
          channel_id: request.channel_id,
          sender_id: request.sender_id,
          content: request.content,
          message_type: request.message_type || 'text',
          file_url: request.file_url
        })
        .select()
        .single();

      if (error) {
        console.error('Error sending message:', error);
        return { success: false, error: 'Failed to send message' };
      }

      return { success: true, data: message };
    } catch (error) {
      console.error('Error in sendMessage:', error);
      return { success: false, error: 'Internal server error' };
    }
  }

  /**
   * Join a channel
   */
  async joinChannel(request: JoinChannelRequest): Promise<{
    success: boolean;
    data?: ChatChannelMember;
    error?: string;
  }> {
    try {
      // Check if already a member
      const { data: existingMember } = await supabase
        .from('chat_channel_members')
        .select('*')
        .eq('channel_id', request.channel_id)
        .eq('user_id', request.user_id)
        .single();

      if (existingMember) {
        return { success: false, error: 'Already a member of this channel' };
      }

      // Add member
      const { data: member, error } = await supabase
        .from('chat_channel_members')
        .insert({
          channel_id: request.channel_id,
          user_id: request.user_id,
          role: request.role || 'member',
          joined_at: new Date().toISOString()
        })
        .select()
        .single();

      if (error) {
        console.error('Error joining channel:', error);
        return { success: false, error: 'Failed to join channel' };
      }

      return { success: true, data: member };
    } catch (error) {
      console.error('Error in joinChannel:', error);
      return { success: false, error: 'Internal server error' };
    }
  }

  /**
   * Leave a channel
   */
  async leaveChannel(channelId: string, userId: string): Promise<{
    success: boolean;
    error?: string;
  }> {
    try {
      // Check if user is the channel creator
      const { data: channel } = await supabase
        .from('chat_channels')
        .select('created_by')
        .eq('id', channelId)
        .single();

      if (channel?.created_by === userId) {
        return { success: false, error: 'Channel creator cannot leave. Transfer ownership first.' };
      }

      // Remove member
      const { error } = await supabase
        .from('chat_channel_members')
        .delete()
        .eq('channel_id', channelId)
        .eq('user_id', userId);

      if (error) {
        console.error('Error leaving channel:', error);
        return { success: false, error: 'Failed to leave channel' };
      }

      return { success: true };
    } catch (error) {
      console.error('Error in leaveChannel:', error);
      return { success: false, error: 'Internal server error' };
    }
  }

  /**
   * Get channel messages with pagination
   */
  async getChannelMessages(
    channelId: string,
    limit: number = 50,
    offset: number = 0
  ): Promise<{
    success: boolean;
    data?: MessageWithSender[];
    error?: string;
  }> {
    try {
      const { data: messages, error } = await supabase
        .from('chat_messages')
        .select(`
          *,
          sender:profiles!chat_messages_sender_id_fkey(*)
        `)
        .eq('channel_id', channelId)
        .order('created_at', { ascending: false })
        .range(offset, offset + limit - 1);

      if (error) {
        console.error('Error fetching channel messages:', error);
        return { success: false, error: 'Failed to fetch messages' };
      }

      return { success: true, data: messages || [] };
    } catch (error) {
      console.error('Error in getChannelMessages:', error);
      return { success: false, error: 'Internal server error' };
    }
  }

  /**
   * Get user's channels
   */
  async getUserChannels(userId: string): Promise<{
    success: boolean;
    data?: ChannelWithMembers[];
    error?: string;
  }> {
    try {
      const { data: channels, error } = await supabase
        .from('chat_channels')
        .select(`
          *,
          members:chat_channel_members(
            *,
            user:profiles!chat_channel_members_user_id_fkey(*)
          )
        `)
        .eq('chat_channel_members.user_id', userId)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching user channels:', error);
        return { success: false, error: 'Failed to fetch channels' };
      }

      // Get message count for each channel
      const channelsWithCounts = await Promise.all(
        (channels || []).map(async (channel) => {
          const { count } = await supabase
            .from('chat_messages')
            .select('*', { count: 'exact', head: true })
            .eq('channel_id', channel.id);

          return {
            ...channel,
            message_count: count || 0
          };
        })
      );

      return { success: true, data: channelsWithCounts };
    } catch (error) {
      console.error('Error in getUserChannels:', error);
      return { success: false, error: 'Internal server error' };
    }
  }

  /**
   * Get all public channels
   */
  async getPublicChannels(): Promise<{
    success: boolean;
    data?: ChannelWithMembers[];
    error?: string;
  }> {
    try {
      const { data: channels, error } = await supabase
        .from('chat_channels')
        .select(`
          *,
          members:chat_channel_members(
            *,
            user:profiles!chat_channel_members_user_id_fkey(*)
          )
        `)
        .neq('channel_type', 'announcement')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching public channels:', error);
        return { success: false, error: 'Failed to fetch channels' };
      }

      // Get message count for each channel
      const channelsWithCounts = await Promise.all(
        (channels || []).map(async (channel) => {
          const { count } = await supabase
            .from('chat_messages')
            .select('*', { count: 'exact', head: true })
            .eq('channel_id', channel.id);

          return {
            ...channel,
            message_count: count || 0
          };
        })
      );

      return { success: true, data: channelsWithCounts };
    } catch (error) {
      console.error('Error in getPublicChannels:', error);
      return { success: false, error: 'Internal server error' };
    }
  }

  /**
   * Delete a channel (admin only)
   */
  async deleteChannel(
    channelId: string,
    deletedBy: string
  ): Promise<{
    success: boolean;
    error?: string;
  }> {
    try {
      // TODO: Implement proper admin validation for channel deletion
      // For now, allow deletion but log it
      console.log('Channel deletion attempted by:', deletedBy);

      // Check if user is channel creator or admin
      const { data: channel } = await supabase
        .from('chat_channels')
        .select('created_by')
        .eq('id', channelId)
        .single();

      if (!channel) {
        return { success: false, error: 'Channel not found' };
      }

      if (channel.created_by !== deletedBy) {
        // TODO: Implement proper super admin validation
        // For now, only allow channel creator to delete
        return { success: false, error: 'Only channel creator can delete channel' };
      }

      // Delete channel (cascade will handle messages and members)
      const { error } = await supabase
        .from('chat_channels')
        .delete()
        .eq('id', channelId);

      if (error) {
        console.error('Error deleting channel:', error);
        return { success: false, error: 'Failed to delete channel' };
      }

      return { success: true };
    } catch (error) {
      console.error('Error in deleteChannel:', error);
      return { success: false, error: 'Internal server error' };
    }
  }

  /**
   * Update user's last active timestamp
   */
  async updateUserLastActive(userId: string): Promise<void> {
    try {
      await supabase
        .from('profiles')
        .update({ last_active: new Date().toISOString() })
        .eq('id', userId);
    } catch (error) {
      console.error('Error updating user last active:', error);
    }
  }

  /**
   * Get online users for a channel
   */
  async getOnlineUsers(channelId: string): Promise<{
    success: boolean;
    data?: Profile[];
    error?: string;
  }> {
    try {
      // Get channel members
      const { data: members, error: membersError } = await supabase
        .from('chat_channel_members')
        .select('user_id')
        .eq('channel_id', channelId);

      if (membersError) {
        return { success: false, error: 'Failed to fetch channel members' };
      }

      if (!members || members.length === 0) {
        return { success: true, data: [] };
      }

      const userIds = members.map(m => m.user_id);

      // Get users who were active in the last 5 minutes
      const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000).toISOString();

      const { data: onlineUsers, error: usersError } = await supabase
        .from('profiles')
        .select('id, full_name, avatar_url, last_active')
        .in('id', userIds)
        .gte('last_active', fiveMinutesAgo);

      if (usersError) {
        return { success: false, error: 'Failed to fetch online users' };
      }

      return { success: true, data: onlineUsers || [] };
    } catch (error) {
      console.error('Error in getOnlineUsers:', error);
      return { success: false, error: 'Internal server error' };
    }
  }

  /**
   * Subscribe to real-time updates for a channel
   */
  subscribeToChannel(
    channelId: string,
    callback: (payload: any) => void
  ) {
    return supabase
      .channel(`chat:${channelId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'chat_messages',
          filter: `channel_id=eq.${channelId}`
        },
        callback
      )
      .subscribe();
  }

  /**
   * Subscribe to user presence updates
   */
  subscribeToUserPresence(
    channelId: string,
    userId: string,
    callback: (payload: any) => void
  ) {
    return supabase
      .channel(`presence:${channelId}`)
      .on('presence', { event: 'sync' }, callback)
      .on('presence', { event: 'join' }, callback)
      .on('presence', { event: 'leave' }, callback)
      .subscribe();
  }
}

export default RealTimeMessagingService; 