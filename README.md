# MeetMatch - 智能會議時間協調平台

[![Deployed on Vercel](https://img.shields.io/badge/Deployed%20on-Vercel-black?style=for-the-badge&logo=vercel)](https://vercel.com/yukiyang0823-2781s-projects/v0-meet-match-ui-design)
[![Built with v0](https://img.shields.io/badge/Built%20with-v0.dev-black?style=for-the-badge)](https://v0.dev/chat/projects/V9Pil1oyXdb)
[![Next.js](https://img.shields.io/badge/Next.js-14-black?style=for-the-badge&logo=next.js)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-blue?style=for-the-badge&logo=typescript)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-3-38B2AC?style=for-the-badge&logo=tailwind-css)](https://tailwindcss.com/)
[![Supabase](https://img.shields.io/badge/Supabase-3ECF8E?style=for-the-badge&logo=supabase&logoColor=white)](https://supabase.com/)

## 📋 專案概述

MeetMatch 是一個智能會議時間協調平台，幫助團隊和個人輕鬆安排會議時間。透過直觀的用戶介面和智能算法，讓時間協調變得簡單高效。

## ✨ 主要功能

### 🗓️ 會議管理
- **創建會議**: 快速建立新會議，設定標題、描述和時間選項
- **時間選擇器**: 直觀的時間選擇介面，支援多個時間段選擇
- **參與者管理**: 邀請參與者，追蹤回覆狀態
- **投票系統**: 參與者對時間選項進行投票，民主化決策

### 👥 用戶系統
- **用戶註冊/登入**: 安全的身份驗證系統
- **個人資料管理**: 管理個人資訊和偏好設定
- **邀請管理**: 查看和管理收到的會議邀請

### 📊 結果分析
- **投票結果**: 即時顯示投票統計和結果
- **最佳時間**: 自動計算最適合的會議時間
- **參與者回覆**: 追蹤參與者的回覆狀態

### 📱 響應式設計
- **多設備支援**: 完美支援桌面、平板和手機
- **現代化 UI**: 使用最新的設計語言和組件
- **無障礙設計**: 符合 WCAG 標準的無障礙設計

## 🛠️ 技術架構

### 前端技術
- **Next.js 14**: 使用 App Router 的現代化 React 框架
- **React 18**: 最新的 React 版本，支援 Concurrent Features
- **TypeScript 5**: 完整的類型安全開發
- **Tailwind CSS 3**: 實用優先的 CSS 框架
- **Shadcn/ui**: 高品質的 React 組件庫

### 後端技術
- **Next.js API Routes**: 全棧開發，API 和前端統一
- **Supabase**: 現代化的後端即服務平台
- **PostgreSQL**: 強大的關聯式資料庫
- **Prisma**: 現代化的資料庫 ORM

### 開發工具
- **ESLint**: 程式碼品質檢查
- **Prettier**: 程式碼格式化
- **npm**: 套件管理器

## 🚀 快速開始

### 環境需求
- Node.js 18.0 或更高版本
- npm 8.0 或更高版本

### Supabase 設定

1. **創建 Supabase 專案**
   - 前往 [Supabase](https://supabase.com/) 創建新專案
   - 記下專案 URL 和匿名金鑰

2. **設定環境變數**
   ```bash
   # 複製環境變數範例檔案
   cp .env.example .env.local
   
   # 編輯 .env.local 檔案，填入您的 Supabase 資訊
   NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
   DATABASE_URL=your_supabase_database_url
   ```

### 安裝步驟

1. **克隆專案**
```bash
git clone https://github.com/112306024-0823/meet-match.git
cd meet-match
```

2. **安裝依賴**
```bash
npm install
```

3. **環境設定**
```bash
# 複製並編輯環境變數檔案
cp .env.example .env.local
# 編輯 .env.local 檔案，設定必要的環境變數
```

4. **資料庫設定**
```bash
# 生成 Prisma 客戶端
npm run db:generate

# 推送資料庫 schema 到 Supabase
npm run db:push
```

5. **啟動開發伺服器**
```bash
npm run dev
```

6. **開啟瀏覽器**
```
http://localhost:3000
```

7. **測試 Supabase 連接**
```
http://localhost:3000/api/test-supabase
```

## 📁 專案結構

```
meet-match/
├── app/                    # Next.js App Router 頁面
│   ├── api/               # API 路由
│   │   └── test-supabase/ # Supabase 連接測試
│   ├── auth/              # 認證相關頁面
│   ├── create/            # 創建會議頁面
│   ├── my-invites/        # 我的邀請頁面
│   ├── results/           # 結果頁面
│   └── vote/              # 投票頁面
├── components/            # React 組件
│   ├── ui/               # 基礎 UI 組件
│   └── theme-provider.tsx # 主題提供者
├── hooks/                 # 自定義 React Hooks
├── lib/                   # 工具函數和配置
│   └── supabase.ts       # Supabase 客戶端配置
├── prisma/               # 資料庫 schema 和遷移
└── public/               # 靜態資源
```

## 🗄️ 資料庫結構

### 主要資料表
- **events**: 會議資訊
- **participants**: 參與者資訊
- **time_slots**: 時間段選擇
- **votes**: 投票記錄
- **users**: 用戶資訊

### 關聯關係
- 一個會議可以有多個參與者
- 一個參與者可以選擇多個時間段
- 每個參與者對每個時間段可以投票一次

## 🔧 開發指南

### 新增功能
1. 在 `app/` 目錄下創建新的頁面
2. 在 `components/` 目錄下創建可重用組件
3. 在 `lib/` 目錄下新增工具函數
4. 更新 Prisma schema 如果需要新的資料模型

### 程式碼規範
- 使用 TypeScript 進行類型安全開發
- 遵循 ESLint 和 Prettier 的程式碼規範
- 組件使用 PascalCase 命名
- 檔案使用 kebab-case 命名

### 測試
```bash
# 執行測試
npm test

# 執行測試並監控
npm run test:watch
```

## 🌐 部署

### Vercel 部署
專案已配置為自動部署到 Vercel：

1. 推送到 main 分支會自動觸發部署
2. 每次部署都會生成預覽 URL
3. 支援自動的環境變數管理

### 其他平台部署
```bash
# 建置生產版本
npm run build

# 啟動生產伺服器
npm start
```

## 📈 效能優化

- **圖片優化**: 使用 Next.js 的 Image 組件
- **程式碼分割**: 自動的頁面級程式碼分割
- **靜態生成**: 支援靜態頁面生成 (SSG)
- **快取策略**: 實作適當的快取策略

## 🔒 安全性

- **輸入驗證**: 所有用戶輸入都經過驗證
- **SQL 注入防護**: 使用 Supabase 和 Prisma ORM 防止 SQL 注入
- **XSS 防護**: 實作適當的 XSS 防護措施
- **CORS 配置**: 正確配置跨域資源共享
- **Row Level Security**: 使用 Supabase RLS 政策

## 🤝 貢獻指南

1. Fork 專案
2. 創建功能分支 (`git checkout -b feature/AmazingFeature`)
3. 提交變更 (`git commit -m 'Add some AmazingFeature'`)
4. 推送到分支 (`git push origin feature/AmazingFeature`)
5. 開啟 Pull Request


## 技術引用

- [Next.js](https://nextjs.org/) - 優秀的 React 框架
- [Tailwind CSS](https://tailwindcss.com/) - 實用的 CSS 框架
- [Shadcn/ui](https://ui.shadcn.com/) - 高品質的組件庫
- [Supabase](https://supabase.com/) - 現代化的後端即服務平台
- [Prisma](https://www.prisma.io/) - 現代化的資料庫 ORM



