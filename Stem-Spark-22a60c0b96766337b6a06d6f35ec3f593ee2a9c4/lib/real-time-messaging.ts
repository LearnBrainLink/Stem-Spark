import { supabase } from "./supabase/client"

type Profile = Database['public']['Tables']['profiles']['Row']
type Message = Database['public']['Tables']['chat_messages']['Row']
type Channel = Database['public']['Tables']['chat_channels']['Row']
type ChannelMember = Database['public']['Tables']['chat_channel_members']['Row']

export interface ExtendedMessage extends Message {
  sender: {
    full_name: string
    role: string
    avatar_url?: string
  }
}

export interface ExtendedChannel extends Channel {
  members: ChannelMember[]
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
  private supabase = supabase
  private channels: Map<string, RealtimeChannel> = new Map()

  // Channel Management
  async createChannel(
    name: string,
    description: string,
    channelType: 'public' | 'private' | 'group' | 'announcement',
    createdBy: string
  ): Promise<{ success: boolean; channel?: ExtendedChannel; error?: string }> {
    try {
      const { data: channel, error } = await supabase
        .from('chat_channels')
        .insert({
          name,
          description,
          channel_type: channelType,
          created_by: createdBy
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
      const { data: channels, error } = await supabase
        .from('chat_channels')
        .select(`
          *,
          chat_channel_members!inner(user_id)
        `)
        .or(`channel_type.eq.public,chat_channel_members.user_id.eq.${userId}`)

      if (error) throw error

      // Get member details for each channel
      const channelsWithMembers = await Promise.all(
        channels.map(async (channel) => {
          const { data: members } = await supabase
            .from('chat_channel_members')
            .select('*')
            .eq('channel_id', channel.id)

          return {
            ...channel,
            members: members || []
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
      const { error } = await supabase
        .from('chat_channel_members')
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
      const { error } = await supabase
        .from('chat_channel_members')
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

  async sendMessage(
    channelId: string,
    senderId: string,
    content: string,
    messageType: 'text' | 'file' | 'system' = 'text',
    fileUrl?: string
  ): Promise<{ success: boolean; message?: ExtendedMessage; error?: string }> {
    try {
      const { data: message, error } = await supabase
        .from('chat_messages')
        .insert({
          channel_id: channelId,
          sender_id: senderId,
          content,
          message_type: messageType,
          file_url: fileUrl
        })
        .select(`
          *,
          profiles:profiles(full_name, role, avatar_url)
        `)
        .single()

      if (error) throw error

      const extendedMessage: ExtendedMessage = {
        ...message,
        sender: {
          full_name: message.profiles?.full_name || 'Unknown User',
          role: message.profiles?.role || 'user',
          avatar_url: message.profiles?.avatar_url
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
      const { data: messages, error } = await supabase
        .from('chat_messages')
        .select(`
          *,
          profiles:profiles(full_name, role, avatar_url)
        `)
        .eq('channel_id', channelId)
        .order('created_at', { ascending: true })
        .range(offset, offset + limit - 1)

      if (error) throw error

      const extendedMessages: ExtendedMessage[] = messages.map(message => ({
        ...message,
        sender: {
          full_name: message.profiles?.full_name || 'Unknown User',
          role: message.profiles?.role || 'user',
          avatar_url: message.profiles?.avatar_url
        }
      }))

      return { success: true, messages: extendedMessages }
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
      // Check if user can delete the message
      const { data: message } = await supabase
        .from('chat_messages')
        .select('sender_id')
        .eq('id', messageId)
        .single()

      if (!message) {
        return { success: false, error: 'Message not found' }
      }

      // Only allow deletion if user is the sender or an admin
      if (message.sender_id !== userId) {
        const { data: profile } = await supabase
          .from('profiles')
          .select('role')
          .eq('id', userId)
          .single()

        if (!profile || !['admin', 'super_admin'].includes(profile.role)) {
          return { success: false, error: 'Not authorized to delete this message' }
        }
      }

      const { error } = await supabase
        .from('chat_messages')
        .delete()
        .eq('id', messageId)

      if (error) throw error

      return { success: true }
    } catch (error) {
      console.error('Error deleting message:', error)
      return { success: false, error: error instanceof Error ? error.message : 'Unknown error' }
    }
  }

  subscribeToChannel(
    channelId: string,
    onMessage: (message: ExtendedMessage) => void,
    onMessageDelete: (messageId: string) => void
  ): RealtimeChannel {
    // Unsubscribe from existing channel if any
    this.unsubscribeFromChannel(channelId)

    const channel = supabase
      .channel(`chat:${channelId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'chat_messages',
          filter: `channel_id=eq.${channelId}`
        },
        async (payload) => {
          try {
            const { data: profile } = await supabase
              .from('profiles')
              .select('full_name, role, avatar_url')
              .eq('id', payload.new.sender_id)
              .single()

            const extendedMessage: ExtendedMessage = {
              ...payload.new,
              sender: {
                full_name: profile?.full_name || 'Unknown User',
                role: profile?.role || 'user',
                avatar_url: profile?.avatar_url
              }
            }

            onMessage(extendedMessage)
          } catch (error) {
            console.error('Error processing real-time message:', error)
          }
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'DELETE',
          schema: 'public',
          table: 'chat_messages',
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
      channel.unsubscribe()
      this.channels.delete(channelId)
    }
  }

  async checkMessagePermissions(
    channelId: string,
    userId: string
  ): Promise<MessagePermissions> {
    try {
      // Get user profile
      const { data: profile } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', userId)
        .single()

      // Get channel membership
      const { data: membership } = await supabase
        .from('chat_channel_members')
        .select('role')
        .eq('channel_id', channelId)
        .eq('user_id', userId)
        .single()

      const isAdmin = profile?.role === 'admin' || profile?.role === 'super_admin'
      const isChannelAdmin = membership?.role === 'admin'

      return {
        user_id: userId,
        channel_id: channelId,
        can_send: true, // All members can send messages
        can_moderate: isAdmin || isChannelAdmin,
        can_invite: isAdmin || isChannelAdmin,
        is_admin: isAdmin || isChannelAdmin
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

  async updateUserPresence(userId: string, isOnline: boolean): Promise<void> {
    try {
      await supabase
        .from('profiles')
        .update({ 
          last_seen: new Date().toISOString(),
          is_online: isOnline
        })
        .eq('id', userId)
    } catch (error) {
      console.error('Error updating user presence:', error)
    }
  }

  disconnect(): void {
    // Unsubscribe from all channels
    this.channels.forEach((channel) => {
      channel.unsubscribe()
    })
    this.channels.clear()
  }
}

// Export singleton instance
export const messagingService = new RealTimeMessagingService() 