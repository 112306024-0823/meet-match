"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { eventsApi, type Event } from "@/lib/api"

export default function VotePageTest({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter()
  const [eventData, setEventData] = useState<Event | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [resolvedParams, setResolvedParams] = useState<{ id: string } | null>(null)

  // 解析 params
  useEffect(() => {
    const resolveParams = async () => {
      const resolved = await params
      setResolvedParams(resolved)
    }
    resolveParams()
  }, [params])

  // 獲取活動資料
  useEffect(() => {
    if (resolvedParams) {
      const fetchEventData = async () => {
        try {
          setIsLoading(true)
          const event = await eventsApi.getById(resolvedParams.id)
          setEventData(event)
        } catch (error) {
          console.error('獲取活動資料失敗:', error)
        } finally {
          setIsLoading(false)
        }
      }
      fetchEventData()
    }
  }, [resolvedParams])

  if (isLoading || !eventData) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p>載入活動資料中...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-6">{eventData.name}</h1>
        <p className="text-gray-600 mb-4">{eventData.description}</p>
        <div className="bg-gray-100 p-4 rounded-lg">
          <p><strong>日期範圍:</strong> {eventData.startDate} 至 {eventData.endDate}</p>
          <p><strong>時間範圍:</strong> {eventData.startTime} - {eventData.endTime}</p>
        </div>
        <div className="mt-6">
          <button 
            onClick={() => router.back()}
            className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
          >
            返回
          </button>
        </div>
      </div>
    </div>
  )
} 