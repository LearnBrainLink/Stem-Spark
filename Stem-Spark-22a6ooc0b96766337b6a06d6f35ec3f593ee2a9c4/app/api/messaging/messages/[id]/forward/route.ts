import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { targetChannelId, targetUserId } = await request.json();
    const messageId = params.id;

    if (!targetChannelId && !targetUserId) {
      return NextResponse.json(
        { error: 'Target channel or user is required' },
        { status: 400 }
      );
    }

    // Get the original message
    const { data: originalMessage, error: fetchError } = await supabase
      .from('chat_messages')
      .select('*')
      .eq('id', messageId)
      .single();

    if (fetchError || !originalMessage) {
      return NextResponse.json(
        { error: 'Message not found' },
        { status: 404 }
      );
    }

    // Create forwarded message
    const forwardedMessage = {
      content: `Forwarded: ${originalMessage.content}`,
      sender_id: originalMessage.sender_id,
      channel_id: targetChannelId || null,
      recipient_id: targetUserId || null,
      message_type: 'forwarded',
      original_message_id: messageId,
      created_at: new Date().toISOString()
    };

    const { data: newMessage, error: insertError } = await supabase
      .from('chat_messages')
      .insert(forwardedMessage)
      .select()
      .single();

    if (insertError) {
      console.error('Error forwarding message:', insertError);
      return NextResponse.json(
        { error: 'Failed to forward message' },
        { status: 500 }
      );
    }

    return NextResponse.json({ message: newMessage });
  } catch (error) {
    console.error('Error in forward message route:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 