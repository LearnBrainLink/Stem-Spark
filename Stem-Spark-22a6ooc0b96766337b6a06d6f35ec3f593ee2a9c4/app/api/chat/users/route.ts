import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY! // Use service role for admin operations
);

export async function GET() {
  try {
    const { data: users, error } = await supabase
      .from('profiles')
      .select(`
        id,
        email,
        full_name,
        username,
        avatar_url,
        role,
        is_online,
        last_seen,
        status_message
      `)
      .order('full_name', { ascending: true });

    if (error) {
      console.error('Error fetching users:', error);
      return NextResponse.json(
        { error: 'Failed to fetch users' },
        { status: 500 }
      );
    }

    return NextResponse.json({ users: users || [] });
  } catch (error) {
    console.error('API Error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 