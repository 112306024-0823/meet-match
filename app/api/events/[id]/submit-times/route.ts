import { NextRequest, NextResponse } from 'next/server'
import { SupabaseService } from '@/lib/supabase-service'

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id: eventId } = params
    const body = await request.json()
    const { participantId, timeSlots } = body

    // 驗證必要欄位
    if (!participantId || !timeSlots || !Array.isArray(timeSlots)) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    // 創建多個時間段
    const createdTimeSlots = []
    for (const slot of timeSlots) {
      const timeSlot = await SupabaseService.createTimeSlot({
        event_id: eventId,
        participant_id: participantId,
        day: slot.day,
        time_start: slot.timeStart,
        time_end: slot.timeEnd
      })
      
      if (timeSlot) {
        createdTimeSlots.push(timeSlot)
      }
    }

    return NextResponse.json({
      message: 'Time slots submitted successfully',
      count: createdTimeSlots.length,
      timeSlots: createdTimeSlots
    }, { status: 201 })
  } catch (error) {
    console.error('Error submitting time slots:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
} 