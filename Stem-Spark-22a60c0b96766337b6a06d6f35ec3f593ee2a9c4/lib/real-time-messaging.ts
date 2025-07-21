import { createClient } from '@supabase/supabase-js'
import { Database } from './database.types'
import { RealtimeChannel } from '@supabase/supabase-js'

type Profile = Database['public']['Tables']['profiles']['Row']
type Message = Database['public']['Tables']['messages']['Row']
type Channel = Database['public']['Tables']['channels']['Row']
type ChannelMember = Database['public']['Tables']['channel_members']['Row']

export interface ExtendedMessage extends Message {
  sender: {
    full_name: string
    role: string
    avatar_url?: string
  }
}

export interface ExtendedChannel extends Omit<Channel, 'allowed_roles'> {
  members: ChannelMember[]
  restrictions: {
    can_send_messages: 'everyone' | 'admins_only' | 'members_only'
    can_join: 'everyone' | 'invite_only' | 'role_restricted'
    is_announcement_channel: boolean
    moderation_enabled: boolean
  }
  allowed_roles?: string[]
}

export interface MessagePermissions {
  user_id: string
  channel_id: string
  can_send: boolean
  can_moderate: boolean
  can_invite: boolean
  is_admin: boolean
}

class RealTimeMessagingService {
  private supabase
  private channels: Map<string, RealtimeChannel> = new Map()

  constructor() {
    this.supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    )
  }

  // Channel Management
  async createChannel(
    name: string,
    description: string,
    channelType: 'public' | 'private' | 'group' | 'announcement' | 'role_restricted',
    createdBy: string,
    restrictions?: any,
    allowedRoles?: string[]
  ): Promise<{ success: boolean; channel?: ExtendedChannel; error?: string }> {
    try {
      const { data: channel, error } = await this.supabase
        .from('channels')
        .insert({
          name,
          description,
          channel_type: channelType,
          created_by: createdBy,
          channel_restrictions: restrictions || {
            can_send_messages: 'everyone',
            can_join: 'everyone',
            is_announcement_channel: channelType === 'announcement',
            moderation_enabled: false
          },
          allowed_roles: allowedRoles
        })
        .select()
        .single()

      if (error) throw error

      // Add creator as admin member
      await this.addChannelMember(channel.id, createdBy, 'admin')

      return { success: true, channel: channel as ExtendedChannel }
    } catch (error) {
      console.error('Error creating channel:', error)
      return { success: false, error: error instanceof Error ? error.message : 'Unknown error' }
    }
  }

  async getChannels(userId: string): Promise<{ success: boolean; channels?: ExtendedChannel[]; error?: string }> {
    try {
      // Get channels where user is a member or public channels
      const { data: channels, error } = await this.supabase
        .from('channels')
        .select(`
          *,
          channel_members!inner(user_id)
        `)
        .or(`channel_type.eq.public,channel_members.user_id.eq.${userId}`)

      if (error) throw error

      // Get member details for each channel
      const channelsWithMembers = await Promise.all(
        channels.map(async (channel) => {
          const { data: members } = await this.supabase
            .from('channel_members')
            .select('*')
            .eq('channel_id', channel.id)

          return {
            ...channel,
            members: members || [],
            restrictions: channel.channel_restrictions || {
              can_send_messages: 'everyone',
              can_join: 'everyone',
              is_announcement_channel: false,
              moderation_enabled: false
            }
          } as ExtendedChannel
        })
      )

      return { success: true, channels: channelsWithMembers }
    } catch (error) {
      console.error('Error getting channels:', error)
      return { success: false, error: error instanceof Error ? error.message : 'Unknown error' }
    }
  }

  async addChannelMember(
    channelId: string,
    userId: string,
    role: 'admin' | 'member' = 'member'
  ): Promise<{ success: boolean; error?: string }> {
    try {
      const { error } = await this.supabase
        .from('channel_members')
        .insert({
          channel_id: channelId,
          user_id: userId,
          role
        })

      if (error) throw error

      return { success: true }
    } catch (error) {
      console.error('Error adding channel member:', error)
      return { success: false, error: error instanceof Error ? error.message : 'Unknown error' }
    }
  }

  async removeChannelMember(
    channelId: string,
    userId: string
  ): Promise<{ success: boolean; error?: string }> {
    try {
      const { error } = await this.supabase
        .from('channel_members')
        .delete()
        .eq('channel_id', channelId)
        .eq('user_id', userId)

      if (error) throw error

      return { success: true }
    } catch (error) {
      console.error('Error removing channel member:', error)
      return { success: false, error: error instanceof Error ? error.message : 'Unknown error' }
    }
  }

  // Message Management
  async sendMessage(
    channelId: string,
    senderId: string,
    content: string,
    messageType: 'text' | 'file' | 'system' = 'text',
    fileUrl?: string
  ): Promise<{ success: boolean; message?: ExtendedMessage; error?: string }> {
    try {
      // Check if user can send messages in this channel
      const canSend = await this.checkMessagePermissions(channelId, senderId)
      if (!canSend.can_send) {
        return { success: false, error: 'You do not have permission to send messages in this channel' }
      }

      const { data: message, error } = await this.supabase
        .from('messages')
        .insert({
          channel_id: channelId,
          sender_id: senderId,
          content,
          message_type: messageType,
          file_url: fileUrl
        })
        .select()
        .single()

      if (error) throw error

      // Get sender details
      const { data: sender } = await this.supabase
        .from('profiles')
        .select('full_name, role, avatar_url')
        .eq('id', senderId)
        .single()

      const extendedMessage: ExtendedMessage = {
        ...message,
        sender: {
          full_name: sender?.full_name || 'Unknown User',
          role: sender?.role || 'member',
          avatar_url: sender?.avatar_url
        }
      }

      return { success: true, message: extendedMessage }
    } catch (error) {
      console.error('Error sending message:', error)
      return { success: false, error: error instanceof Error ? error.message : 'Unknown error' }
    }
  }

  async getMessages(
    channelId: string,
    limit: number = 50,
    offset: number = 0
  ): Promise<{ success: boolean; messages?: ExtendedMessage[]; error?: string }> {
    try {
      const { data: messages, error } = await this.supabase
        .from('messages')
        .select(`
          *,
          profiles!messages_sender_id_fkey(full_name, role, avatar_url)
        `)
        .eq('channel_id', channelId)
        .order('created_at', { ascending: false })
        .range(offset, offset + limit - 1)

      if (error) throw error

      const extendedMessages: ExtendedMessage[] = messages.map(msg => ({
        ...msg,
        sender: {
          full_name: msg.profiles?.full_name || 'Unknown User',
          role: msg.profiles?.role || 'member',
          avatar_url: msg.profiles?.avatar_url
        }
      }))

      return { success: true, messages: extendedMessages.reverse() }
    } catch (error) {
      console.error('Error getting messages:', error)
      return { success: false, error: error instanceof Error ? error.message : 'Unknown error' }
    }
  }

  async deleteMessage(
    messageId: string,
    userId: string
  ): Promise<{ success: boolean; error?: string }> {
    try {
      // Check if user can delete this message (sender or admin)
      const { data: message } = await this.supabase
        .from('messages')
        .select('sender_id, channel_id')
        .eq('id', messageId)
        .single()

      if (!message) {
        return { success: false, error: 'Message not found' }
      }

      const canModerate = await this.checkMessagePermissions(message.channel_id, userId)
      if (message.sender_id !== userId && !canModerate.can_moderate) {
        return { success: false, error: 'You do not have permission to delete this message' }
      }

      const { error } = await this.supabase
        .from('messages')
        .delete()
        .eq('id', messageId)

      if (error) throw error

      return { success: true }
    } catch (error) {
      console.error('Error deleting message:', error)
      return { success: false, error: error instanceof Error ? error.message : 'Unknown error' }
    }
  }

  // Real-time Subscriptions
  subscribeToChannel(
    channelId: string,
    onMessage: (message: ExtendedMessage) => void,
    onMessageDelete: (messageId: string) => void
  ): RealtimeChannel {
    // Unsubscribe from existing channel if exists
    this.unsubscribeFromChannel(channelId)

    const channel = this.supabase
      .channel(`messages:${channelId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'messages',
          filter: `channel_id=eq.${channelId}`
        },
        async (payload) => {
          const message = payload.new as Message
          
          // Get sender details
          const { data: sender } = await this.supabase
            .from('profiles')
            .select('full_name, role, avatar_url')
            .eq('id', message.sender_id)
            .single()

          const extendedMessage: ExtendedMessage = {
            ...message,
            sender: {
              full_name: sender?.full_name || 'Unknown User',
              role: sender?.role || 'member',
              avatar_url: sender?.avatar_url
            }
          }

          onMessage(extendedMessage)
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'DELETE',
          schema: 'public',
          table: 'messages',
          filter: `channel_id=eq.${channelId}`
        },
        (payload) => {
          onMessageDelete(payload.old.id)
        }
      )
      .subscribe()

    this.channels.set(channelId, channel)
    return channel
  }

  unsubscribeFromChannel(channelId: string): void {
    const channel = this.channels.get(channelId)
    if (channel) {
      this.supabase.removeChannel(channel)
      this.channels.delete(channelId)
    }
  }

  // Permission Checking
  async checkMessagePermissions(
    channelId: string,
    userId: string
  ): Promise<MessagePermissions> {
    try {
      // Get channel details
      const { data: channel } = await this.supabase
        .from('channels')
        .select('*')
        .eq('id', channelId)
        .single()

      if (!channel) {
        return {
          user_id: userId,
          channel_id: channelId,
          can_send: false,
          can_moderate: false,
          can_invite: false,
          is_admin: false
        }
      }

      // Get user's role in the channel
      const { data: member } = await this.supabase
        .from('channel_members')
        .select('role')
        .eq('channel_id', channelId)
        .eq('user_id', userId)
        .single()

      const restrictions = channel.channel_restrictions || {
        can_send_messages: 'everyone',
        can_join: 'everyone',
        is_announcement_channel: false,
        moderation_enabled: false
      }

      const isAdmin = member?.role === 'admin'
      const isAnnouncementChannel = restrictions.is_announcement_channel

      let canSend = true
      if (isAnnouncementChannel) {
        canSend = isAdmin
      } else if (restrictions.can_send_messages === 'admins_only') {
        canSend = isAdmin
      } else if (restrictions.can_send_messages === 'members_only') {
        canSend = !!member
      }

      return {
        user_id: userId,
        channel_id: channelId,
        can_send: canSend,
        can_moderate: isAdmin || restrictions.moderation_enabled,
        can_invite: isAdmin,
        is_admin: isAdmin
      }
    } catch (error) {
      console.error('Error checking message permissions:', error)
      return {
        user_id: userId,
        channel_id: channelId,
        can_send: false,
        can_moderate: false,
        can_invite: false,
        is_admin: false
      }
    }
  }

  // User Presence
  async updateUserPresence(userId: string, isOnline: boolean): Promise<void> {
    try {
      await this.supabase
        .from('profiles')
        .update({ last_active: new Date().toISOString() })
        .eq('id', userId)
    } catch (error) {
      console.error('Error updating user presence:', error)
    }
  }

  // Cleanup
  disconnect(): void {
    this.channels.forEach((channel) => {
      this.supabase.removeChannel(channel)
    })
    this.channels.clear()
  }
}

// Export singleton instance
export const messagingService = new RealTimeMessagingService() 