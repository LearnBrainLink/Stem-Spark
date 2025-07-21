import { NextRequest, NextResponse } from 'next/server';
import RealTimeMessagingService from '@/lib/real-time-messaging';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { channel_id, sender_id, content, message_type, file_url } = body;

    // Validate required fields
    if (!channel_id || !sender_id || !content) {
      return NextResponse.json(
        { error: 'Channel ID, sender ID, and content are required' },
        { status: 400 }
      );
    }

    const messagingService = new RealTimeMessagingService();
    const result = await messagingService.sendMessage({
      channel_id,
      sender_id,
      content,
      message_type,
      file_url
    });

    if (!result.success) {
      return NextResponse.json(
        { error: result.error },
        { status: 400 }
      );
    }

    return NextResponse.json({
      success: true,
      data: result.data
    });
  } catch (error) {
    console.error('Error sending message:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const channelId = searchParams.get('channel_id');
    const limit = parseInt(searchParams.get('limit') || '50');
    const offset = parseInt(searchParams.get('offset') || '0');

    if (!channelId) {
      return NextResponse.json(
        { error: 'Channel ID is required' },
        { status: 400 }
      );
    }

    const messagingService = new RealTimeMessagingService();
    const result = await messagingService.getChannelMessages(channelId, limit, offset);

    if (!result.success) {
      return NextResponse.json(
        { error: result.error },
        { status: 400 }
      );
    }

    return NextResponse.json({
      success: true,
      data: result.data
    });
  } catch (error) {
    console.error('Error fetching messages:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 