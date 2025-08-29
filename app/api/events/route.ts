import { NextRequest, NextResponse } from 'next/server'
import { SupabaseService } from '@/lib/supabase-service'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { name, description, startDate, endDate, startTime, endTime } = body

    // 驗證必要欄位
    if (!name || !startDate || !endDate || !startTime || !endTime) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    // 創建會議
    const event = await SupabaseService.createEvent({
      name,
      description,
      start_date: startDate,
      end_date: endDate,
      start_time: startTime,
      end_time: endTime
    })

    if (!event) {
      return NextResponse.json(
        { error: 'Failed to create event' },
        { status: 500 }
      )
    }

    return NextResponse.json(event, { status: 201 })
  } catch (error) {
    console.error('Error creating event:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const query = searchParams.get('q')

    let events
    if (query) {
      events = await SupabaseService.searchEvents(query)
    } else {
      events = await SupabaseService.getEvents()
    }

    return NextResponse.json(events)
  } catch (error) {
    console.error('Error getting events:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
} 