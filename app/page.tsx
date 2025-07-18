import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Calendar, Clock, Users, Zap } from "lucide-react"

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      {/* Header */}
      <header className="border-b bg-white/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-gradient-to-br from-teal-500 to-blue-600 rounded-lg flex items-center justify-center">
                <Calendar className="w-5 h-5 text-white" />
              </div>
              <h1 className="text-xl font-bold text-slate-800">MeetMatch</h1>
              <span className="text-sm text-slate-500">好約時</span>
            </div>
            <nav className="hidden md:flex items-center space-x-6">
              <Link href="/auth/login" className="text-slate-600 hover:text-slate-800 transition-colors">
                登入
              </Link>
              <Link href="/auth/register">
                <Button variant="outline" size="sm">
                  註冊
                </Button>
              </Link>
            </nav>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="container mx-auto px-4 py-16 md:py-24">
        <div className="text-center max-w-4xl mx-auto">
          <h2 className="text-4xl md:text-6xl font-bold text-slate-800 mb-6">
            MeetMatch
            <span className="block text-2xl md:text-3xl text-teal-600 font-medium mt-2">好約時</span>
          </h2>
          <p className="text-xl md:text-2xl text-slate-600 mb-8 leading-relaxed">快速找出最適合大家的會議時間</p>
          <p className="text-lg text-slate-500 mb-12 max-w-2xl mx-auto">
            邀請朋友一起填寫可參加時間，系統自動分析並推薦最佳開會時段，讓約時間變得簡單又有效率。
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-16">
            <Link href="/create">
              <Button
                size="lg"
                className="bg-gradient-to-r from-teal-500 to-blue-600 hover:from-teal-600 hover:to-blue-700 text-white px-8 py-3 text-lg"
              >
                建立新的邀約
              </Button>
            </Link>
            <Link href="/my-invites">
              <Button
                variant="outline"
                size="lg"
                className="px-8 py-3 text-lg border-slate-300 text-slate-700 hover:bg-slate-50 bg-transparent"
              >
                查看我的邀約
              </Button>
            </Link>
          </div>

          {/* Features */}
          <div className="grid md:grid-cols-3 gap-8 mt-16">
            <Card className="border-slate-200 shadow-sm hover:shadow-md transition-shadow">
              <CardHeader className="text-center">
                <div className="w-12 h-12 bg-teal-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Zap className="w-6 h-6 text-teal-600" />
                </div>
                <CardTitle className="text-slate-800">快速建立</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-slate-600">
                  只需幾個步驟就能建立邀約，設定日期範圍和時間，立即產生分享連結。
                </CardDescription>
              </CardContent>
            </Card>

            <Card className="border-slate-200 shadow-sm hover:shadow-md transition-shadow">
              <CardHeader className="text-center">
                <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Users className="w-6 h-6 text-blue-600" />
                </div>
                <CardTitle className="text-slate-800">協作填寫</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-slate-600">
                  參與者可以輕鬆點選時間格子，標記自己的可用時間，無需註冊即可參與。
                </CardDescription>
              </CardContent>
            </Card>

            <Card className="border-slate-200 shadow-sm hover:shadow-md transition-shadow">
              <CardHeader className="text-center">
                <div className="w-12 h-12 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Clock className="w-6 h-6 text-emerald-600" />
                </div>
                <CardTitle className="text-slate-800">智能分析</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-slate-600">
                  自動統計所有回覆，找出最多人可參加的時段，讓決策變得簡單明確。
                </CardDescription>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t bg-white/50 backdrop-blur-sm mt-16">
        <div className="container mx-auto px-4 py-8">
          <div className="text-center text-slate-500">
            <p>&copy; 2024 MeetMatch 好約時. 讓約時間變得更簡單。</p>
          </div>
        </div>
      </footer>
    </div>
  )
}
