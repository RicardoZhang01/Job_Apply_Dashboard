# 求职申请管理看板

面向大学生求职场景的 Web 平台：看板拖拽、列表筛选、截止日期与面试提醒、统计分析。

**当前能力摘要**

- **总览**：关键指标、**今日待办**（截止/今日笔面试/材料与跟进等聚合）、**分组提醒**、最近更新、快捷入口；**提醒中心** [`/reminders`](frontend/src/app/(main)/reminders/page.tsx)。
- **执行**：看板 **搜索/筛选**、卡片 **材料 x/4** 与 **规则化「下一步」** 提示；**极简新建** [`/applications/new/quick`](frontend/src/app/(main)/applications/new/quick/page.tsx) 与完整新建；申请详情含 **申请时间线**（关键日期 + 历史记录）。
- **字段**：笔试时间；结构化备注（JD / 公司 / 面试准备 / HR / 自由备注）；材料轻量版本（简历版本名、语言侧重、定制说明）；复盘维度（岗位大类、招聘类型、结束/失败原因标签）。
- **复盘**：统计分析含渠道分布、**渠道进面/Offer 率**、**岗位大类复盘**、**失败原因分布**、漏斗与趋势等。

产品口径见仓库内 PRD、`求职申请管理看板_补充痛点与功能结构优化建议.md`、`AI产品经理_职位说明_重建版.md` 等文档。

## 一键启动（推荐）

**需要先安装 [Node.js](https://nodejs.org/)（建议 LTS）。**

| 方式 | 说明 |
|------|------|
| **Windows** | 双击项目根目录下的 [`start.bat`](start.bat)：会自动安装依赖、复制环境变量文件、迁移数据库并同时启动后端与前端。 |
| **Mac / Linux** | 在项目根目录执行：`chmod +x start.sh && ./start.sh` |
| **命令行（等价于脚本）** | 在项目根目录：`npm install && npm run install:all && npm run setup && npm run dev` |

启动成功后：

- 前端：**http://localhost:3000**
- 后端 API：**http://localhost:3001/api**

浏览器打开首页后 **注册账号** 即可使用。

> **说明**：环境文件若不存在，会从 `backend/.env.example`、`frontend/.env.local.example` 自动复制（无需再手动执行 `cp` / `Copy-Item`）。

---

## 结构

| 目录 | 说明 |
|------|------|
| [backend/](backend/) | NestJS + Prisma（SQLite 本地默认）REST API，`/api` 前缀 |
| [frontend/](frontend/) | Next.js 14 App Router + Tailwind + React Query + dnd-kit |
| [docs/TECH_DECISIONS.md](docs/TECH_DECISIONS.md) | MVP 技术决策与口径 |

## 根目录脚本

| 命令 | 说明 |
|------|------|
| `npm run dev` | 同时启动后端（watch）与前端 dev（需已安装各目录依赖并完成 `npm run setup`） |
| `npm run setup` | 复制 env + 执行数据库迁移与 `prisma generate` |
| `npm run env:copy` | 仅从示例复制 `.env` / `.env.local` |

## 环境变量（可选）

不复制示例也可自行新建：

- 后端：`DATABASE_URL`、`JWT_SECRET`、`FRONTEND_ORIGIN`（默认 `http://localhost:3000`）、`PORT`（默认 `3001`）
- 前端：`NEXT_PUBLIC_API_URL`（默认 `http://localhost:3001`）

## 子项目脚本

| 命令 | 说明 |
|------|------|
| 在 `backend/`：`npm run build` | 编译后端 |
| 在 `backend/`：`npm test` | 单元测试 |
| 在 `backend/`：`npm run test:e2e` | E2E |
| 在 `frontend/`：`npm run build` | 前端生产构建 |

## CI

推送至 `main/master` 或提交 PR 时运行 [`.github/workflows/ci.yml`](.github/workflows/ci.yml)。

## 主要页面路由（前端）

| 路径 | 说明 |
|------|------|
| `/` | 登录态检测后跳转仪表盘或登录页 |
| `/dashboard` | 首页仪表盘 |
| `/board` | 看板 |
| `/list` | 申请列表 |
| `/reminders` | 提醒中心 |
| `/stats` | 统计分析 |
| `/applications/new` | 新建申请（完整表单） |
| `/applications/new/quick` | 极简新建 |
| `/applications/:id` | 申请详情 |
| `/applications/:id/edit` | 编辑申请 |

## API 摘要

- `POST /api/auth/register`、`POST /api/auth/login`、`POST /api/auth/logout`、`GET /api/auth/me`
- `GET|POST /api/applications`（支持 `q`、`status`、`sort`、`limit`、`page` 等查询）、`GET|PUT|DELETE /api/applications/:id`、`PATCH .../status`
- `GET|POST /api/applications/:id/history`
- `GET /api/reminders`、`PATCH /api/reminders/read`
- `GET /api/dashboard/todos` — 今日待办聚合列表
- `GET /api/stats/overview`、`/funnel`、`/channels`、`/trends`
- `GET /api/stats/channel-effectiveness` — 按渠道的进面率、Offer 率
- `GET /api/stats/by-job-category` — 按岗位大类的数量与比率
- `GET /api/stats/failure-breakdown` — 失败/结束原因标签分布

**Application** 资源除基础字段外，还包括：`writtenTestAt`；`jdSummary`、`companyNotes`、`interviewPrepNotes`、`hrNotes`、`notes`；`resumeVersionLabel`、`materialsLocale`、`resumeTailoredNote`；`jobCategory`、`employmentType`、`failureTag`（枚举在后端 `common/constants` 与前端 `constants` 中校验与展示）。
