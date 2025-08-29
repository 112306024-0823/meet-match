import { NextRequest, NextResponse } from 'next/server'
import { SupabaseService } from '@/lib/supabase-service'

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id: eventId } = params

    // 獲取會議資訊
    const event = await SupabaseService.getEvent(eventId)
    if (!event) {
      return NextResponse.json(
        { error: 'Event not found' },
        { status: 404 }
      )
    }

    return NextResponse.json(event)
  } catch (error) {
    console.error('Error getting event:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id: eventId } = params
    const body = await request.json()
    const { name, description, startDate, endDate, startTime, endTime } = body

    // 驗證必要欄位
    if (!name || !startDate || !endDate || !startTime || !endTime) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    // 更新會議
    const event = await SupabaseService.updateEvent(eventId, {
      name,
      description,
      start_date: startDate,
      end_date: endDate,
      start_time: startTime,
      end_time: endTime
    })

    if (!event) {
      return NextResponse.json(
        { error: 'Failed to update event' },
        { status: 500 }
      )
    }

    return NextResponse.json(event)
  } catch (error) {
    console.error('Error updating event:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id: eventId } = params

    // 刪除會議
    const success = await SupabaseService.deleteEvent(eventId)
    if (!success) {
      return NextResponse.json(
        { error: 'Failed to delete event' },
        { status: 500 }
      )
    }

    return NextResponse.json({ message: 'Event deleted successfully' })
  } catch (error) {
    console.error('Error deleting event:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
} 