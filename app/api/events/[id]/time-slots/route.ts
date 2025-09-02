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

    if (!participantId || !timeSlots || !Array.isArray(timeSlots)) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

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
      message: 'Time slots created successfully',
      count: createdTimeSlots.length,
      timeSlots: createdTimeSlots
    }, { status: 201 })
  } catch (error) {
    console.error('Error creating time slots:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id: eventId } = params

    const timeSlots = await SupabaseService.getEventTimeSlots(eventId)

    return NextResponse.json(timeSlots)
  } catch (error) {
    console.error('Error getting time slots:', error)
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
    const { searchParams } = new URL(request.url)
    const participantId = searchParams.get('participantId')

    if (!participantId) {
      return NextResponse.json(
        { error: 'participantId is required' },
        { status: 400 }
      )
    }

    const ok = await SupabaseService.deleteTimeSlotsByParticipant(eventId, participantId)
    if (!ok) {
      return NextResponse.json(
        { error: 'Failed to delete time slots' },
        { status: 500 }
      )
    }

    return NextResponse.json({ message: 'Time slots cleared' })
  } catch (error) {
    console.error('Error deleting time slots:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
} 