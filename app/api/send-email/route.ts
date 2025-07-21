import { NextRequest, NextResponse } from 'next/server';

const FLASK_MAIL_SERVICE_URL = process.env.FLASK_MAIL_SERVICE_URL || 'http://localhost:5000';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { template, template_data, to_email, subject, fallback_html } = body;

    // Validate required fields
    if (!to_email || !subject) {
      return NextResponse.json(
        { error: 'Missing required fields: to_email and subject are required' },
        { status: 400 }
      );
    }

    // Prepare the request to Flask Mail service
    const flaskMailRequest = {
      to_email,
      subject,
      template,
      template_data,
      fallback_html
    };

    // Send request to Flask Mail service
    const response = await fetch(`${FLASK_MAIL_SERVICE_URL}/send-email`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(flaskMailRequest),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      console.error('Flask Mail service error:', errorData);
      
      // If Flask Mail service is down, try fallback to Supabase email
      if (response.status >= 500) {
        console.log('Flask Mail service unavailable, trying fallback...');
        return await sendFallbackEmail(body);
      }
      
      return NextResponse.json(
        { error: errorData.error || 'Failed to send email' },
        { status: response.status }
      );
    }

    const result = await response.json();

    return NextResponse.json({
      success: true,
      message_id: result.message_id,
      service: 'flask_mail'
    });
  } catch (error) {
    console.error('Error sending email:', error);
    
    // Try fallback to Supabase email
    try {
      return await sendFallbackEmail(body);
    } catch (fallbackError) {
      console.error('Fallback email also failed:', fallbackError);
      return NextResponse.json(
        { error: 'Email service unavailable' },
        { status: 503 }
      );
    }
  }
}

async function sendFallbackEmail(body: any) {
  // Fallback to Supabase email service
  const { createClient } = await import('@/lib/supabase/server');
  const supabase = await createClient();

  const { data, error } = await supabase.auth.admin.sendRawEmail({
    to: body.to_email,
    subject: body.subject,
    html: body.fallback_html || body.template_data?.content || 'Email content not available'
  });

  if (error) {
    throw error;
  }

  return NextResponse.json({
    success: true,
    message_id: data?.message_id,
    service: 'supabase_fallback'
  });
}

// Health check endpoint for Flask Mail service
export async function GET(request: NextRequest) {
  try {
    const response = await fetch(`${FLASK_MAIL_SERVICE_URL}/health`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      return NextResponse.json(
        { 
          status: 'unhealthy',
          service: 'flask_mail',
          error: 'Service not responding'
        },
        { status: 503 }
      );
    }

    const healthData = await response.json();

    return NextResponse.json({
      status: 'healthy',
      service: 'flask_mail',
      details: healthData
    });
  } catch (error) {
    console.error('Health check failed:', error);
    return NextResponse.json(
      { 
        status: 'unhealthy',
        service: 'flask_mail',
        error: 'Connection failed'
      },
      { status: 503 }
    );
  }
} 