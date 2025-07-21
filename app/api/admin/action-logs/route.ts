import { NextRequest, NextResponse } from 'next/server';
import AdminProtection from '@/lib/admin-protection';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get('limit') || '100');

    const adminProtection = new AdminProtection();
    const logs = await adminProtection.getAdminActionLogs(limit);

    return NextResponse.json({ logs });
  } catch (error) {
    console.error('Error fetching admin action logs:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 