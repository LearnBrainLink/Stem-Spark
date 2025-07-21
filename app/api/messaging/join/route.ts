import { NextRequest, NextResponse } from 'next/server';
import RealTimeMessagingService from '@/lib/real-time-messaging';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { channel_id, user_id, role } = body;

    // Validate required fields
    if (!channel_id || !user_id) {
      return NextResponse.json(
        { error: 'Channel ID and user ID are required' },
        { status: 400 }
      );
    }

    const messagingService = new RealTimeMessagingService();
    const result = await messagingService.joinChannel({
      channel_id,
      user_id,
      role
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
    console.error('Error joining channel:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 