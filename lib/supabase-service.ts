import { supabase } from './supabase'
import type { Database } from './supabase'

type Event = Database['public']['Tables']['events']['Row']
type EventInsert = Database['public']['Tables']['events']['Insert']
type EventUpdate = Database['public']['Tables']['events']['Update']

type Participant = Database['public']['Tables']['participants']['Row']
type ParticipantInsert = Database['public']['Tables']['participants']['Insert']

type TimeSlot = Database['public']['Tables']['time_slots']['Row']
type TimeSlotInsert = Database['public']['Tables']['time_slots']['Insert']

type Vote = Database['public']['Tables']['votes']['Row']
type VoteInsert = Database['public']['Tables']['votes']['Insert']

export class SupabaseService {
  // Events
  static async createEvent(event: EventInsert): Promise<Event | null> {
    const { data, error } = await supabase
      .from('events')
      .insert(event)
      .select()
      .single()

    if (error) {
      console.error('Error creating event:', error)
      return null
    }

    return data
  }

  static async getEvent(id: string): Promise<Event | null> {
    const { data, error } = await supabase
      .from('events')
      .select('*')
      .eq('id', id)
      .single()

    if (error) {
      console.error('Error getting event:', error)
      return null
    }

    return data
  }

  static async getEvents(): Promise<Event[]> {
    const { data, error } = await supabase
      .from('events')
      .select('*')
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Error getting events:', error)
      return []
    }

    return data || []
  }

  static async updateEvent(id: string, updates: EventUpdate): Promise<Event | null> {
    const { data, error } = await supabase
      .from('events')
      .update(updates)
      .eq('id', id)
      .select()
      .single()

    if (error) {
      console.error('Error updating event:', error)
      return null
    }

    return data
  }

  static async deleteEvent(id: string): Promise<boolean> {
    const { error } = await supabase
      .from('events')
      .delete()
      .eq('id', id)

    if (error) {
      console.error('Error deleting event:', error)
      return false
    }

    return true
  }

  // Participants
  static async createParticipant(participant: ParticipantInsert): Promise<Participant | null> {
    const { data, error } = await supabase
      .from('participants')
      .insert(participant)
      .select()
      .single()

    if (error) {
      console.error('Error creating participant:', error)
      return null
    }

    return data
  }

  static async getEventParticipants(eventId: string): Promise<Participant[]> {
    const { data, error } = await supabase
      .from('participants')
      .select('*')
      .eq('event_id', eventId)
      .order('joined_at', { ascending: true })

    if (error) {
      console.error('Error getting participants:', error)
      return []
    }

    return data || []
  }

  // Time Slots
  static async createTimeSlot(timeSlot: TimeSlotInsert): Promise<TimeSlot | null> {
    const { data, error } = await supabase
      .from('time_slots')
      .insert(timeSlot)
      .select()
      .single()

    if (error) {
      console.error('Error creating time slot:', error)
      return null
    }

    return data
  }

  static async getEventTimeSlots(eventId: string): Promise<TimeSlot[]> {
    const { data, error } = await supabase
      .from('time_slots')
      .select(`
        *,
        participant:participants(name, email)
      `)
      .eq('event_id', eventId)
      .order('day', { ascending: true })
      .order('time_start', { ascending: true })

    if (error) {
      console.error('Error getting time slots:', error)
      return []
    }

    return data || []
  }

  static async deleteTimeSlotsByParticipant(eventId: string, participantId: string): Promise<boolean> {
    const { error } = await supabase
      .from('time_slots')
      .delete()
      .eq('event_id', eventId)
      .eq('participant_id', participantId)

    if (error) {
      console.error('Error deleting time slots:', error)
      return false
    }
    return true
  }

  // Votes
  static async createVote(vote: VoteInsert): Promise<Vote | null> {
    const { data, error } = await supabase
      .from('votes')
      .insert(vote)
      .select()
      .single()

    if (error) {
      console.error('Error creating vote:', error)
      return null
    }

    return data
  }

  static async updateVote(voteId: string, voteType: 'yes' | 'no' | 'maybe'): Promise<Vote | null> {
    const { data, error } = await supabase
      .from('votes')
      .update({ vote_type: voteType })
      .eq('id', voteId)
      .select()
      .single()

    if (error) {
      console.error('Error updating vote:', error)
      return null
    }

    return data
  }

  static async getEventVotes(eventId: string): Promise<Vote[]> {
    const { data, error } = await supabase
      .from('votes')
      .select(`
        *,
        participant:participants(name, email),
        time_slot:time_slots(day, time_start, time_end)
      `)
      .eq('event_id', eventId)

    if (error) {
      console.error('Error getting votes:', error)
      return []
    }

    return data || []
  }

  // Analytics
  static async getEventAnalytics(eventId: string) {
    const { data, error } = await supabase
      .from('votes')
      .select(`
        vote_type,
        time_slot:time_slots(day, time_start, time_end)
      `)
      .eq('event_id', eventId)

    if (error) {
      console.error('Error getting analytics:', error)
      return null
    }

    // 計算每個時間段的投票統計
    const analytics = data?.reduce((acc, vote) => {
      const timeSlot = vote.time_slot as any
      if (timeSlot && typeof timeSlot === 'object') {
        const key = `${timeSlot.day}-${timeSlot.time_start}-${timeSlot.time_end}`
        
        if (!acc[key]) {
          acc[key] = { yes: 0, no: 0, maybe: 0, total: 0 }
        }
        
        acc[key][vote.vote_type as 'yes' | 'no' | 'maybe']++
        acc[key].total++
      }
      
      return acc
    }, {} as Record<string, { yes: number; no: number; maybe: number; total: number }>)

    return analytics
  }

  // Search
  static async searchEvents(query: string): Promise<Event[]> {
    const { data, error } = await supabase
      .from('events')
      .select('*')
      .or(`name.ilike.%${query}%,description.ilike.%${query}%`)
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Error searching events:', error)
      return []
    }

    return data || []
  }
} 