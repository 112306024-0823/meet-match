import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import { Calendar, ArrowLeft } from "lucide-react"

export default function LoginPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Back to Home */}
        <Link href="/" className="inline-flex items-center text-slate-600 hover:text-slate-800 mb-6 transition-colors">
          <ArrowLeft className="w-4 h-4 mr-2" />
          回到首頁
        </Link>

        <Card className="shadow-lg border-slate-200">
          <CardHeader className="text-center">
            <div className="w-12 h-12 bg-gradient-to-br from-teal-500 to-blue-600 rounded-lg flex items-center justify-center mx-auto mb-4">
              <Calendar className="w-6 h-6 text-white" />
            </div>
            <CardTitle className="text-2xl text-slate-800">歡迎回來</CardTitle>
            <CardDescription className="text-slate-600">登入您的 MeetMatch 帳戶</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <form className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email" className="text-slate-700">
                  電子郵件
                </Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="請輸入您的電子郵件"
                  className="border-slate-300 focus:border-teal-500 focus:ring-teal-500"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password" className="text-slate-700">
                  密碼
                </Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="請輸入您的密碼"
                  className="border-slate-300 focus:border-teal-500 focus:ring-teal-500"
                />
              </div>
              <Button className="w-full bg-gradient-to-r from-teal-500 to-blue-600 hover:from-teal-600 hover:to-blue-700 text-white">
                登入
              </Button>
            </form>

            <Separator className="bg-slate-200" />

            <Button
              variant="outline"
              className="w-full border-slate-300 text-slate-700 hover:bg-slate-50 bg-transparent"
            >
              以訪客身分繼續
            </Button>

            <div className="text-center">
              <p className="text-sm text-slate-600">
                還沒有帳戶？{" "}
                <Link href="/auth/register" className="text-teal-600 hover:text-teal-700 font-medium">
                  立即註冊
                </Link>
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
