"use client"

import dynamic from "next/dynamic"
import { Suspense } from "react"

const VotePanel = dynamic(() => import("@/components/events/VotePanel"), { ssr: false })

export default function VoteEmbedded({ id }: { id: string }) {
  return (
    <Suspense fallback={<div className="text-slate-600">載入投票介面中...</div>}>
      <VotePanel id={id} />
    </Suspense>
  )
} 

