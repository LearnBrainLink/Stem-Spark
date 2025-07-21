import { NextRequest, NextResponse } from 'next/server';
import RealTimeMessagingService from '@/lib/real-time-messaging';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, description, channel_type, created_by } = body;

    // Validate required fields
    if (!name || !created_by) {
      return NextResponse.json(
        { error: 'Name and created_by are required' },
        { status: 400 }
      );
    }

    const messagingService = new RealTimeMessagingService();
    const result = await messagingService.createChannel({
      name,
      description,
      channel_type,
      created_by
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
    console.error('Error creating channel:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('user_id');
    const type = searchParams.get('type'); // 'user' or 'public'

    const messagingService = new RealTimeMessagingService();

    let result;
    if (type === 'user' && userId) {
      result = await messagingService.getUserChannels(userId);
    } else {
      result = await messagingService.getPublicChannels();
    }

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
    console.error('Error fetching channels:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 