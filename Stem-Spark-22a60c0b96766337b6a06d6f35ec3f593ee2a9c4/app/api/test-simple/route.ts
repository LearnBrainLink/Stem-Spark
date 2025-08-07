import { NextResponse } from 'next/server'

export async function GET() {
  try {
    console.log('🔄 Simple test API called')
    return NextResponse.json({ 
      success: true, 
      message: 'Simple API is working',
      timestamp: new Date().toISOString()
    })
  } catch (error) {
    console.error('❌ Simple test error:', error)
    return NextResponse.json(
      { error: 'Simple API failed' },
      { status: 500 }
    )
  }
}
