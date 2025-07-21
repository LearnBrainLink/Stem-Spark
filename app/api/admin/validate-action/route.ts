import { NextRequest, NextResponse } from 'next/server';
import AdminProtection from '@/lib/admin-protection';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { action } = body;

    if (!action) {
      return NextResponse.json(
        { error: 'Action is required' },
        { status: 400 }
      );
    }

    const adminProtection = new AdminProtection();
    const result = await adminProtection.canPerformAction(action);

    return NextResponse.json({
      allowed: result.allowed,
      reason: result.reason
    });
  } catch (error) {
    console.error('Error validating admin action:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 