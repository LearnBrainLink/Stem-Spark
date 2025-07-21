import { NextRequest, NextResponse } from 'next/server';
import AdminProtection from '@/lib/admin-protection';

export async function GET(request: NextRequest) {
  try {
    const adminProtection = new AdminProtection();
    const stats = await adminProtection.getAdminStats();

    return NextResponse.json({ stats });
  } catch (error) {
    console.error('Error fetching admin stats:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 