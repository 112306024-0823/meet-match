# MeetMatch - 智能會議時間協調平台

[![Deployed on Vercel](https://img.shields.io/badge/Deployed%20on-Vercel-black?style=for-the-badge&logo=vercel)](https://vercel.com)
[![Next.js](https://img.shields.io/badge/Next.js-15-black?style=for-the-badge&logo=next.js)](https://nextjs.org/)
[![React](https://img.shields.io/badge/React-19-61DAFB?style=for-the-badge&logo=react&logoColor=061a23)](https://react.dev)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-blue?style=for-the-badge&logo=typescript)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-3-38B2AC?style=for-the-badge&logo=tailwind-css)](https://tailwindcss.com/)
[![Supabase](https://img.shields.io/badge/Supabase-3ECF8E?style=for-the-badge&logo=supabase&logoColor=white)](https://supabase.com/)

## 📋 專案概述
MeetMatch 是一個智能會議時間協調平台，幫助團隊和個人快速彙整可行時段、投票、產出最佳會議時間。支援行動裝置、拖曳/點選兩種選時模式、即時結果視覺化。

## ✨ 主要功能
- **活動管理（整合分頁）**：單一路徑 `events/[id]` 以分頁（Tabs）整合「總覽、投票、參與者、結果」。
- **投票（先輸入名稱）**：
  - 以「名稱」識別投票者；同名即視為同一使用者。
  - 重新投票時會先清除舊時段再寫入新選擇（可編輯之前的時段）。
  - 支援點選模式與拖曳框選模式，時間顯示 `HH:mm-HH:mm`。
- **參與者管理**：顯示清單、可新增參與者（以名稱為主，可選填 Email）。
- **結果分析**：
  - 「最佳時段」卡片（統計各時段可參加人數）。
  - 熱度地圖視覺化（各日各時段可參與人數）。
- **路由整合（永久導向）**：
  - `/vote/:id` → `/events/:id?tab=vote`
  - `/create/success/:id` → `/events/:id?tab=overview`
  - `/results/:id` → `/events/:id?tab=results`

## 🛠️ 技術架構
- **前端**：Next.js 15（App Router）、React 19、TypeScript 5、Tailwind CSS 3、shadcn/ui。
- **後端**：Next.js API Routes（App Router `app/api` 目錄）。
- **BaaS/DB**：Supabase（PostgreSQL）。
- **ORM**：專案保留 Prisma schema，但目前 API 皆透過 Supabase Client 服務層處理（`lib/supabase-service.ts`）。
- **套件管理**：npm（已移除 pnpm-lock.yaml，避免 Vercel 使用 pnpm 導致鎖檔衝突）。

## 🚀 快速開始
### 1) 需求
- Node.js 18+
- npm 8+

### 2) 環境變數
建立 `.env.local`（可由 `env.example` 複製）：
```bash
NEXT_PUBLIC_SUPABASE_URL=https://oeihhzyppgvxlbmbleeh.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=從 Supabase 專案設定複製
DATABASE_URL=postgresql://postgres.oeihhzyppgvxlbmbleeh:<YOUR_PASSWORD>@aws-0-ap-southeast-1.pooler.supabase.com:6543/postgres
NEXTAUTH_SECRET=任意安全字串（若使用 NextAuth）
NEXTAUTH_URL=http://localhost:3000
```

### 3) 安裝與啟動
```bash
npm install
npm run dev
# http://localhost:3000
```

### 4) 本地測試 Supabase 連線
```text
GET /api/test-supabase
```

## 📁 目錄結構（重點）
```
meet-match/
├─ app/
│  ├─ api/
│  │  └─ events/
│  │     ├─ [id]/
│  │     │  ├─ participants/route.ts
│  │     │  ├─ results/route.ts
│  │     │  ├─ submit-times/route.ts   # 送出多筆 time_slots
│  │     │  ├─ time-slots/route.ts     # 新增/查詢/清空使用者時段
│  │     │  ├─ votes/route.ts
│  │     │  └─ route.ts                # 個別活動 CRUD
│  │     └─ route.ts                   # 活動清單/建立
│  ├─ events/[id]/page.tsx             # 分頁整合（overview/vote/participants/results）
│  └─ auth, create, my-invites, ...
├─ components/events/
│  ├─ VoteEmbedded.tsx
│  └─ VotePanel.tsx
├─ lib/
│  ├─ api.ts                           # 前端 API 呼叫封裝
│  ├─ supabase.ts                      # Supabase Client（含型別）
│  └─ supabase-service.ts              # 後端服務層封裝
└─ prisma/                              # schema（目前 API 已由 Supabase 取代）
```

## 🔌 主要 API（App Router）
- `GET /api/events`：列出活動
- `POST /api/events`：建立活動
- `GET /api/events/:id`：取得單一活動
- `PUT /api/events/:id`：更新活動
- `DELETE /api/events/:id`：刪除活動
- `GET /api/events/:id/participants`：取得參與者
- `POST /api/events/:id/participants`：新增參與者（以名稱識別）
- `POST /api/events/:id/submit-times`：提交多筆 `time_slots`（點選/拖曳結果）
- `GET /api/events/:id/time-slots`：取得該活動所有時段（含參與者名稱）
- `DELETE /api/events/:id/time-slots?participantId=...`：清空該參與者在此活動的時段（覆寫前使用）
- `GET /api/events/:id/votes`：取得投票（如使用）
- `GET /api/events/:id/results`：彙總分析與最佳時段
- `GET /api/test-supabase`：連線測試

## 🧭 使用流程（投票者）
1. 前往主辦方提供的連結 `/events/:id?tab=vote`。
2. 輸入暱稱（名稱）→ 系統會自動載入你過去的選取結果（若有）。
3. 以點選或拖曳方式選擇可參加時段。
4. 送出後將覆寫舊資料並導向結果分頁。

## 🌐 部署（Vercel）
- 建議不使用 `vercel.json`（Next.js 自動偵測足夠）。
- 在 Vercel 專案 Settings > Environment Variables 設定：
  - `NEXT_PUBLIC_SUPABASE_URL`
  - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
  - `DATABASE_URL`
  - `NEXTAUTH_SECRET`（如使用）
  - `NEXTAUTH_URL`（Production 網域）
- Build Command：`npm run build`
- Output Directory：`.next`
- Install Command：`npm install`


## 📈 效能與體驗
- 圖片與資源：Next.js 內建最佳化。
- UI 元件：shadcn/ui + Tailwind。
- 時段選擇：支援點選/拖曳。

## 🔒 安全性
- Supabase RLS（建議於正式專案完善策略）。
- API 錯誤處理與驗證（前後端）。

## 🤝 貢獻
1. Fork 專案
2. 建立分支：`git checkout -b feature/xxx`
3. 提交變更：`git commit -m "feat: ..."`
4. 推送變更並發 PR



