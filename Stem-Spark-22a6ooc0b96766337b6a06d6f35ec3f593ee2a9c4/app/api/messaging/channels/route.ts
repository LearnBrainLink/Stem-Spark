import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function GET() {
  try {
    const { data, error } = await supabase
      .from('chat_channels')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching channels:', error);
      return NextResponse.json(
        { error: 'Failed to fetch channels' },
        { status: 500 }
      );
    }

    return NextResponse.json({ channels: data });
  } catch (error) {
    console.error('Error in channels route:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const { name, description } = await request.json();

    if (!name || name.trim() === '') {
      return NextResponse.json(
        { error: 'Channel name is required' },
        { status: 400 }
      );
    }

    const { data, error } = await supabase
      .from('chat_channels')
      .insert({
        name: name.trim(),
        description: description?.trim() || null,
      })
      .select()
      .single();

    if (error) {
      console.error('Error creating channel:', error);
      return NextResponse.json(
        { error: 'Failed to create channel' },
        { status: 500 }
      );
    }

    return NextResponse.json({ channel: data });
  } catch (error) {
    console.error('Error in create channel route:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 