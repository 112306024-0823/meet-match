// API 客戶端工具

export interface Event {
  id: string
  name: string
  description?: string
  start_date: string
  end_date: string
  start_time: string
  end_time: string
  created_at: string
  updated_at: string
  participants?: Participant[]
  _count?: {
    participants: number
  }
}

export interface Participant {
  id: string
  eventId: string
  name: string
  email?: string
  joinedAt: string
}

export interface TimeSlot {
  id: string
  eventId: string
  participantId: string
  day: string
  timeStart: string
  timeEnd: string
  createdAt: string
  participant?: {
    id: string
    name: string
  }
}

export interface CreateEventData {
  name: string
  description?: string
  startDate: string
  endDate: string
  startTime: string
  endTime: string
}

export interface CreateParticipantData {
  name: string
  email?: string
}

export interface CreateVoteData {
  participantId: string
  timeSlotId: string
  voteType: 'yes' | 'no' | 'maybe'
}

export interface SubmitTimeSlotsData {
  participantId: string
  timeSlots: {
    day: string
    timeStart: string
    timeEnd: string
  }[]
}

// API 請求基本函數
async function apiRequest<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const url = endpoint.startsWith('/') ? endpoint : `/${endpoint}`
  const response = await fetch(url, {
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
    ...options,
  })

  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: 'Unknown error' }))
    throw new Error(error.error || `HTTP error! status: ${response.status}`)
  }

  return response.json()
}

// Events API
export const eventsApi = {
  // 建立活動
  create: async (data: CreateEventData): Promise<Event> => {
    return apiRequest<Event>('/api/events', {
      method: 'POST',
      body: JSON.stringify(data),
    })
  },

  // 獲取所有活動
  getAll: async (): Promise<Event[]> => {
    return apiRequest<Event[]>('/api/events')
  },

  // 獲取單一活動
  getById: async (id: string): Promise<Event> => {
    return apiRequest<Event>(`/api/events/${id}`)
  },

  // 刪除活動
  delete: async (id: string): Promise<{ message: string }> => {
    return apiRequest<{ message: string }>(`/api/events/${id}`, {
      method: 'DELETE',
    })
  },
}

// Participants API
export const participantsApi = {
  // 新增參與者
  create: async (eventId: string, data: CreateParticipantData): Promise<Participant> => {
    return apiRequest<Participant>(`/api/events/${eventId}/participants`, {
      method: 'POST',
      body: JSON.stringify(data),
    })
  },

  // 獲取活動的所有參與者
  getByEventId: async (eventId: string): Promise<Participant[]> => {
    return apiRequest<Participant[]>(`/api/events/${eventId}/participants`)
  },
}

// Time Slots API
export const timeSlotsApi = {
  // 提交時間段選擇
  submit: async (eventId: string, data: SubmitTimeSlotsData): Promise<{ message: string; count: number; timeSlots: TimeSlot[] }> => {
    return apiRequest<{ message: string; count: number; timeSlots: TimeSlot[] }>(`/api/events/${eventId}/submit-times`, {
      method: 'POST',
      body: JSON.stringify(data),
    })
  },

  // 獲取活動的所有時間段
  getByEventId: async (eventId: string): Promise<TimeSlot[]> => {
    return apiRequest<TimeSlot[]>(`/api/events/${eventId}/time-slots`)
  },
}

// Votes API
export const votesApi = {
  // 提交投票
  create: async (eventId: string, data: CreateVoteData): Promise<any> => {
    return apiRequest<any>(`/api/events/${eventId}/votes`, {
      method: 'POST',
      body: JSON.stringify(data),
    })
  },

  // 獲取活動的所有投票
  getByEventId: async (eventId: string): Promise<any[]> => {
    return apiRequest<any[]>(`/api/events/${eventId}/votes`)
  },
}

// Results API
export const resultsApi = {
  // 獲取活動統計結果
  getByEventId: async (eventId: string): Promise<any> => {
    return apiRequest<any>(`/api/events/${eventId}/results`)
  },
}

// 工具函數：將時間選擇器的 selectedSlots 轉換為 API 格式
export function convertSelectedSlotsToTimeSlots(selectedSlots: Set<string>): {
  day: string
  timeStart: string
  timeEnd: string
}[] {
  return Array.from(selectedSlots).map(slot => {
    const [day, timeStart, timeEnd] = slot.split('-')
    return { day, timeStart, timeEnd }
  })
}

// 工具函數：將 API 的 timeSlots 轉換為時間選擇器格式
export function convertTimeSlotsToSelectedSlots(timeSlots: TimeSlot[]): Set<string> {
  return new Set(
    timeSlots.map(slot => `${slot.day}-${slot.timeStart}-${slot.timeEnd}`)
  )
} 