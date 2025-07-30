import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

export async function GET(request: NextRequest) {
  try {
    const supabase = createClient(supabaseUrl, supabaseServiceKey)
    const { searchParams } = new URL(request.url)
    const channelId = searchParams.get('channel_id')

    if (!channelId) {
      return NextResponse.json(
        { error: 'Channel ID is required' },
        { status: 400 }
      )
    }

    // Validate user authentication
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Check if user is member of the channel
    const { data: membership } = await supabase
      .from('chat_channel_members')
      .select('*')
      .eq('channel_id', channelId)
      .eq('user_id', user.id)
      .single()

    if (!membership) {
      return NextResponse.json(
        { error: 'You are not a member of this channel' },
        { status: 403 }
      )
    }

    // Get todo items
    const { data: todoItems, error } = await supabase
      .from('todo_items')
      .select('*')
      .eq('channel_id', channelId)
      .order('created_at', { ascending: false })

    if (error) throw error

    return NextResponse.json({ todoItems: todoItems || [] })
  } catch (error) {
    console.error('Error fetching todo items:', error)
    return NextResponse.json(
      { error: 'Failed to fetch todo items' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const supabase = createClient(supabaseUrl, supabaseServiceKey)
    const { content, channel_id, priority = 'medium', due_date } = await request.json()

    if (!content || !channel_id) {
      return NextResponse.json(
        { error: 'Content and channel_id are required' },
        { status: 400 }
      )
    }

    // Validate user authentication
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Check if user is member of the channel
    const { data: membership } = await supabase
      .from('chat_channel_members')
      .select('*')
      .eq('channel_id', channel_id)
      .eq('user_id', user.id)
      .single()

    if (!membership) {
      return NextResponse.json(
        { error: 'You are not a member of this channel' },
        { status: 403 }
      )
    }

    // Create todo item
    const { data: todoItem, error } = await supabase
      .from('todo_items')
      .insert([{
        content,
        channel_id,
        created_by: user.id,
        priority,
        due_date: due_date || null,
        completed: false
      }])
      .select()
      .single()

    if (error) throw error

    return NextResponse.json({ todoItem })
  } catch (error) {
    console.error('Error creating todo item:', error)
    return NextResponse.json(
      { error: 'Failed to create todo item' },
      { status: 500 }
    )
  }
}

export async function PUT(request: NextRequest) {
  try {
    const supabase = createClient(supabaseUrl, supabaseServiceKey)
    const { id, completed, content, priority, due_date } = await request.json()

    if (!id) {
      return NextResponse.json(
        { error: 'Todo item ID is required' },
        { status: 400 }
      )
    }

    // Validate user authentication
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Check if user owns the todo item
    const { data: todoItem } = await supabase
      .from('todo_items')
      .select('*')
      .eq('id', id)
      .single()

    if (!todoItem) {
      return NextResponse.json(
        { error: 'Todo item not found' },
        { status: 404 }
      )
    }

    if (todoItem.created_by !== user.id) {
      return NextResponse.json(
        { error: 'Not authorized to update this todo item' },
        { status: 403 }
      )
    }

    // Update todo item
    const updateData: any = {}
    if (completed !== undefined) updateData.completed = completed
    if (content !== undefined) updateData.content = content
    if (priority !== undefined) updateData.priority = priority
    if (due_date !== undefined) updateData.due_date = due_date

    const { data: updatedTodoItem, error } = await supabase
      .from('todo_items')
      .update(updateData)
      .eq('id', id)
      .select()
      .single()

    if (error) throw error

    return NextResponse.json({ todoItem: updatedTodoItem })
  } catch (error) {
    console.error('Error updating todo item:', error)
    return NextResponse.json(
      { error: 'Failed to update todo item' },
      { status: 500 }
    )
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const supabase = createClient(supabaseUrl, supabaseServiceKey)
    const { searchParams } = new URL(request.url)
    const todoId = searchParams.get('id')

    if (!todoId) {
      return NextResponse.json(
        { error: 'Todo item ID is required' },
        { status: 400 }
      )
    }

    // Validate user authentication
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Check if user owns the todo item
    const { data: todoItem } = await supabase
      .from('todo_items')
      .select('*')
      .eq('id', todoId)
      .single()

    if (!todoItem) {
      return NextResponse.json(
        { error: 'Todo item not found' },
        { status: 404 }
      )
    }

    if (todoItem.created_by !== user.id) {
      return NextResponse.json(
        { error: 'Not authorized to delete this todo item' },
        { status: 403 }
      )
    }

    // Delete todo item
    const { error } = await supabase
      .from('todo_items')
      .delete()
      .eq('id', todoId)

    if (error) throw error

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting todo item:', error)
    return NextResponse.json(
      { error: 'Failed to delete todo item' },
      { status: 500 }
    )
  }
} 