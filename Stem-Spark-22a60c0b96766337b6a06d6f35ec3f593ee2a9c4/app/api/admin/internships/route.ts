import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET() {
  try {
    const supabase = createClient()
    
    // Try to fetch internships, create table if it doesn't exist
    let { data: internships, error } = await supabase
      .from('internships')
      .select('*')
      .order('created_at', { ascending: false })
    
    if (error && error.code === '42P01') {
      // Table doesn't exist, create it
      const createTableQuery = `
        CREATE TABLE IF NOT EXISTS internships (
          id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
          title TEXT NOT NULL,
          description TEXT,
          department TEXT,
          requirements TEXT[],
          duration_weeks INTEGER,
          start_date DATE,
          end_date DATE,
          application_deadline DATE,
          max_applicants INTEGER DEFAULT 10,
          current_applicants INTEGER DEFAULT 0,
          status TEXT DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'closed', 'draft')),
          created_by UUID REFERENCES auth.users(id),
          created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
          updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        );
        
        -- Enable RLS
        ALTER TABLE internships ENABLE ROW LEVEL SECURITY;
        
        -- Create policies
        CREATE POLICY "Enable read access for all users" ON internships FOR SELECT USING (true);
        CREATE POLICY "Enable insert for admins" ON internships FOR INSERT WITH CHECK (auth.jwt() ->> 'role' = 'admin');
        CREATE POLICY "Enable update for admins" ON internships FOR UPDATE USING (auth.jwt() ->> 'role' = 'admin');
        CREATE POLICY "Enable delete for admins" ON internships FOR DELETE USING (auth.jwt() ->> 'role' = 'admin');
      `
      
      const { error: createError } = await supabase.rpc('exec_sql', { sql: createTableQuery })
      
      if (createError) {
        console.error('Error creating internships table:', createError)
        // If we can't create the table via RPC, return empty array
        return NextResponse.json({ internships: [] })
      }
      
      // Try fetching again after table creation
      const { data: newInternships, error: newError } = await supabase
        .from('internships')
        .select('*')
        .order('created_at', { ascending: false })
      
      internships = newInternships || []
    } else if (error) {
      console.error('Error fetching internships:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }
    
    return NextResponse.json({ internships: internships || [] })
  } catch (error) {
    console.error('Error in internships API:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const supabase = createClient()
    const body = await request.json()
    
    const { data, error } = await supabase
      .from('internships')
      .insert([{
        title: body.title,
        description: body.description,
        department: body.department,
        requirements: body.requirements || [],
        duration_weeks: body.duration_weeks,
        start_date: body.start_date,
        end_date: body.end_date,
        application_deadline: body.application_deadline,
        max_applicants: body.max_applicants || 10,
        status: body.status || 'active',
        created_by: body.created_by
      }])
      .select()
      .single()
    
    if (error) {
      console.error('Error creating internship:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }
    
    return NextResponse.json({ internship: data })
  } catch (error) {
    console.error('Error in internship creation:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function PUT(request: NextRequest) {
  try {
    const supabase = createClient()
    const body = await request.json()
    const { id, ...updateData } = body
    
    // Add updated_at timestamp
    updateData.updated_at = new Date().toISOString()
    
    const { data, error } = await supabase
      .from('internships')
      .update(updateData)
      .eq('id', id)
      .select()
      .single()
    
    if (error) {
      console.error('Error updating internship:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }
    
    return NextResponse.json({ internship: data })
  } catch (error) {
    console.error('Error in internship update:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const supabase = createClient()
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')
    
    if (!id) {
      return NextResponse.json({ error: 'Internship ID is required' }, { status: 400 })
    }
    
    const { error } = await supabase
      .from('internships')
      .delete()
      .eq('id', id)
    
    if (error) {
      console.error('Error deleting internship:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }
    
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error in internship deletion:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
