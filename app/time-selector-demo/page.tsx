"use client"

import { useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ArrowLeft } from "lucide-react"
import TimeSelector from "@/components/time-selector"

export default function TimeSelectorDemo() {
  const [selectedSlots, setSelectedSlots] = useState<Set<string>>(new Set())

  const handleSelectionChange = (slots: Set<string>) => {
    setSelectedSlots(slots)
    console.log("Selected slots:", Array.from(slots))
  }

  const handleSubmit = () => {
    if (selectedSlots.size === 0) {
      alert("請至少選擇一個時間段")
      return
    }

    alert(`已選擇 ${selectedSlots.size} 個時間段！\n\n選擇的時間：\n${Array.from(selectedSlots).join("\n")}`)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      {/* Header */}
      <header className="border-b bg-white/80 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Link href="/" className="inline-flex items-center text-slate-600 hover:text-slate-800 transition-colors">
              <ArrowLeft className="w-4 h-4 mr-2" />
              回到首頁
            </Link>
            <h1 className="text-xl font-bold text-slate-800">時間選擇器示範</h1>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto space-y-6">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-slate-800 mb-2">時間選擇平台</h1>
            <p className="text-lg text-slate-600">支援點選和拖拉兩種操作模式的時間選擇器</p>
          </div>

          <TimeSelector onSelectionChange={handleSelectionChange} initialSelection={new Set()} />

          <div className="text-center pt-6">
            <Button
              onClick={handleSubmit}
              size="lg"
              className="bg-gradient-to-r from-teal-500 to-blue-600 hover:from-teal-600 hover:to-blue-700 text-white px-8"
              disabled={selectedSlots.size === 0}
            >
              確認選擇 ({selectedSlots.size} 個時段)
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
