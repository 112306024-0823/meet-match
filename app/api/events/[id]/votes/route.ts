import { NextRequest, NextResponse } from 'next/server'
import { SupabaseService } from '@/lib/supabase-service'

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id: eventId } = params
    const body = await request.json()
    const { participantId, timeSlotId, voteType } = body

    // 驗證必要欄位
    if (!participantId || !timeSlotId || !voteType) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    // 驗證投票類型
    if (!['yes', 'no', 'maybe'].includes(voteType)) {
      return NextResponse.json(
        { error: 'Invalid vote type' },
        { status: 400 }
      )
    }

    // 創建投票
    const vote = await SupabaseService.createVote({
      event_id: eventId,
      participant_id: participantId,
      time_slot_id: timeSlotId,
      vote_type: voteType
    })

    if (!vote) {
      return NextResponse.json(
        { error: 'Failed to create vote' },
        { status: 500 }
      )
    }

    return NextResponse.json(vote, { status: 201 })
  } catch (error) {
    console.error('Error creating vote:', error)
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

    // 獲取會議的所有投票
    const votes = await SupabaseService.getEventVotes(eventId)

    return NextResponse.json(votes)
  } catch (error) {
    console.error('Error getting votes:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
} 