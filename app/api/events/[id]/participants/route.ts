import { NextRequest, NextResponse } from 'next/server'
import { SupabaseService } from '@/lib/supabase-service'

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id: eventId } = params
    const body = await request.json()
    const { name, email } = body

    // 驗證必要欄位
    if (!name) {
      return NextResponse.json(
        { error: 'Name is required' },
        { status: 400 }
      )
    }

    // 創建參與者
    const participant = await SupabaseService.createParticipant({
      event_id: eventId,
      name,
      email
    })

    if (!participant) {
      return NextResponse.json(
        { error: 'Failed to create participant' },
        { status: 500 }
      )
    }

    return NextResponse.json(participant, { status: 201 })
  } catch (error) {
    console.error('Error creating participant:', error)
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

    // 獲取會議的所有參與者
    const participants = await SupabaseService.getEventParticipants(eventId)

    return NextResponse.json(participants)
  } catch (error) {
    console.error('Error getting participants:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
} 